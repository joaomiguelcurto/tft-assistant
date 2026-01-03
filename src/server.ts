// server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import { randomBytes } from 'crypto';
import * as db from './database';
import tftRouter from './tftAPI';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rotas API TFT
app.use('/api/tft', tftRouter);

// Configuração do Google OAuth
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `http://localhost:3000/auth/google/callback`
);

// Store temporário para estados (em produção, usa Redis ou BD)
const pendingAuth = new Map<string, { timestamp: number }>();

// Limpar estados expirados (5 minutos)
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of pendingAuth.entries()) {
    if (now - data.timestamp > 5 * 60 * 1000) {
      pendingAuth.delete(state);
    }
  }
}, 60000);

// Testar conexão à BD ao iniciar
db.testConnection().then(connected => {
  if (connected) {
    console.log('Conectado à base de dados MySQL');
  } else {
    console.error('Erro ao conectar à base de dados');
    process.exit(1);
  }
});

/**
 * Endpoint 1: Solicitar URL de login
 * GET /auth/google/url
 */
app.get('/auth/google/url', (req: Request, res: Response) => {
  try {
    // Gerar state único para prevenir CSRF
    const state = randomBytes(32).toString('hex');
    pendingAuth.set(state, { timestamp: Date.now() });

    // Gerar URL de autenticação
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      state: state,
      prompt: 'consent'
    });

    res.json({
      success: true,
      authUrl: authUrl,
      state: state
    });
  } catch (error) {
    console.error('Erro ao gerar URL:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar URL de autenticação'
    });
  }
});

/**
 * Endpoint 2: Callback do Google (depois do login)
 * GET /auth/google/callback
 */
app.get('/auth/google/callback', async (req: Request, res: Response) => {
  const { code, state } = req.query;

  try {
    // Validar state
    if (!state || !pendingAuth.has(state as string)) {
      return res.status(400).send('Estado inválido ou expirado');
    }
    pendingAuth.delete(state as string);

    if (!code) {
      return res.status(400).send('Código de autorização não fornecido');
    }

    // Trocar código por tokens
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Obter informações do utilizador
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    // Criar ou atualizar utilizador na BD
    const user = await db.upsertUser({
      google_id: userInfo.id!,
      email: userInfo.email!,
      name: userInfo.name!,
      picture: userInfo.picture
    });

    // Criar sessão na BD
    const session = await db.createSession(user.id);

    const userData = {
      googleId: user.google_id,
      email: user.email,
      name: user.name,
      picture: user.picture
    };

    console.log('Utilizador autenticado:', user.email);

    // IMPORTANT: Fix the postMessage - use proper JSON escaping
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Login Bem-sucedido</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
          }
          .success { font-size: 3rem; margin-bottom: 1rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✓</div>
          <h1>Login bem-sucedido!</h1>
          <p>Podes fechar esta janela.</p>
        </div>
        <script>
          (function() {
            if (window.opener) {
              const messageData = {
                type: 'GOOGLE_AUTH_SUCCESS',
                token: ${JSON.stringify(session.session_token)},
                user: ${JSON.stringify(userData)}
              };
              console.log('Sending message to parent:', messageData);
              window.opener.postMessage(messageData, '*');
              setTimeout(() => window.close(), 2000);
            }
          })();
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Erro no callback:', error);
    res.status(500).send('Erro ao processar autenticação');
  }
});


// Endpoint 3: Validar token de sessão
// POST /auth/validate
app.post('/auth/validate', async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Token não fornecido'
    });
  }

  try {
    const user = await db.getUserBySessionToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado'
      });
    }

    res.json({
      success: true,
      user: {
        googleId: user.google_id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        lastLogin: user.last_login
      }
    });
  } catch (error) {
    console.error('Erro ao validar token:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao validar token'
    });
  }
});

// Endpoint 4: Logout
// POST /auth/logout
app.post('/auth/logout', async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Token não fornecido'
    });
  }

  try {
    const invalidated = await db.invalidateSession(token);

    if (!invalidated) {
      return res.status(404).json({
        success: false,
        error: 'Sessão não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer logout'
    });
  }
});

// Endpoint 5: Estatísticas da base de dados (admin)
// GET /admin/stats
app.get('/admin/stats', async (req: Request, res: Response) => {
  try {
    const stats = await db.getDatabaseStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Erro ao procurar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao procurar estatísticas'
    });
  }
});

// Limpar sessões expiradas a cada hora
setInterval(async () => {
  try {
    const deleted = await db.cleanupExpiredSessions();
    if (deleted > 0) {
      console.log(`Limpeza automática: ${deleted} sessões expiradas removidas`);
    }
  } catch (error) {
    console.error('Erro na limpeza automática:', error);
  }
}, 60 * 60 * 1000); // 1 hora

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM recebido, a encerrar...');
  await db.closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT recebido, a encerrar...');
  await db.closePool();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`API a funcionar em http://localhost:${PORT}`);
  console.log(`Redirect URI: http://localhost:${PORT}/auth/google/callback`);
});