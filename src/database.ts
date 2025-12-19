// database.ts - Conexão e funções SIMPLES para MySQL
import * as mysql from 'mysql2/promise';
import { randomBytes } from 'crypto';

// Configuração da conexão
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootbd',
  database: process.env.DB_NAME || 'tft_assistant_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Interfaces simples
export interface User {
  id: string;
  google_id: string;
  email: string;
  name: string;
  picture?: string;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface Session {
  id: string;
  user_id: string;
  session_token: string;
  created_at: Date;
  expires_at: Date;
}

export interface UserWithSession extends User {
  session_token: string;
  session_expires_at: Date;
}


// Funções

// Criar ou atualizar utilizador
export async function upsertUser(userData: {
  google_id: string;
  email: string;
  name: string;
  picture?: string;
}): Promise<User> {
  const connection = await pool.getConnection();
  
  try {
    await connection.query(
      `INSERT INTO users (google_id, email, name, picture, last_login)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         email = VALUES(email),
         name = VALUES(name),
         picture = VALUES(picture),
         last_login = NOW()`,
      [userData.google_id, userData.email, userData.name, userData.picture]
    );

    // Procurar utilizador criado/atualizado
    const [users] = await connection.query<any[]>(
      'SELECT * FROM users WHERE google_id = ?',
      [userData.google_id]
    );

    return users[0] as User;
  } finally {
    connection.release();
  }
}


// Procurar utilizador por ID
export async function getUserById(userId: string): Promise<User | null> {
  const [users] = await pool.query<any[]>(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );
  
  return users.length > 0 ? users[0] as User : null;
}


// Funções Sessões

//Criar nova sessão
export async function createSession(userId: string): Promise<Session> {
  // Gerar token único
  const sessionToken = randomBytes(64).toString('hex');
  
  // Expirar em 30 dias
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await pool.query(
    `INSERT INTO sessions (user_id, session_token, expires_at)
     VALUES (?, ?, ?)`,
    [userId, sessionToken, expiresAt]
  );

  const [sessions] = await pool.query<any[]>(
    'SELECT * FROM sessions WHERE session_token = ?',
    [sessionToken]
  );

  return sessions[0] as Session;
}

/**
 * Procurar utilizador por token de sessão
 */
export async function getUserBySessionToken(sessionToken: string): Promise<UserWithSession | null> {
  const [results] = await pool.query<any[]>(
    `SELECT u.*, s.session_token, s.expires_at as session_expires_at
     FROM users u
     INNER JOIN sessions s ON u.id = s.user_id
     WHERE s.session_token = ?
       AND s.expires_at > NOW()`,
    [sessionToken]
  );

  return results.length > 0 ? results[0] as UserWithSession : null;
}

/**
 * Invalidar sessão (logout)
 */
export async function invalidateSession(sessionToken: string): Promise<boolean> {
  const [result] = await pool.query<any>(
    'DELETE FROM sessions WHERE session_token = ?',
    [sessionToken]
  );

  return result.affectedRows > 0;
}

/**
 * Limpar sessões expiradas
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const [result] = await pool.query<any>(
    'DELETE FROM sessions WHERE expires_at < NOW()'
  );

  return result.affectedRows;
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

/**
 * Testar conexão
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('Erro ao conectar à base de dados:', error);
    return false;
  }
}

/**
 * Obter estatísticas simples
 */
export async function getDatabaseStats(): Promise<any> {
  const [userCount] = await pool.query<any[]>(
    'SELECT COUNT(*) as total FROM users'
  );
  
  const [sessionCount] = await pool.query<any[]>(
    'SELECT COUNT(*) as total FROM sessions WHERE expires_at > NOW()'
  );

  return {
    total_users: userCount[0].total,
    active_sessions: sessionCount[0].total
  };
}

/**
 * Fechar pool
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

export default pool;