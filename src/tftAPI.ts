import { Router, Request, Response } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

const router = Router();

//Champion Interface
interface Champion {
  name: string;
  icon: string;
  squareIcon: string;
  tileIcon: string;
  traits: string[];
  //cost: number; - Nao temos :(
}

// Carregar champions.json 
let championsData: Champion[] = [];

function loadChampionsData() {
  try {
    const filePath = join(__dirname, './data/champions.json');
    const rawData = readFileSync(filePath, 'utf-8');
    championsData = JSON.parse(rawData);
    console.log(`${championsData.length} TFT Champions loaded`);
  } catch (error) {
    console.error('Failed to load champions: ', error);
    championsData = [];
  }
}

// Carregar dados ao iniciar
loadChampionsData();


// GET /api/tft/champions
// Retorna todos os champions
router.get('/champions', (req, res) => {
  res.json({
    success: true,
    count: championsData.length,
    data: championsData
  });
});


// GET /api/tft/champions/search?q=nome
// Procura champions por nome (parcial)
router.get('/champions/search', (req, res) => {
  const query = (req.query.q as string)?.toLowerCase();

  if (!query) {
    return res.status(400).json({
      success: false,
      error: 'Error'
    });
  }

  const results = championsData.filter(c =>
    c.name.toLowerCase().includes(query)
  );

  res.json({
    success: true,
    count: results.length,
    data: results
  });
});


// GET /api/tft/champions/:name
// Retorna um champion específico pelo nome
router.get('/champions/:name', (req, res) => {
  const championName = req.params.name.toLowerCase();
  
  const champion = championsData.find(
    c => c.name.toLowerCase() === championName
  );

  if (!champion) {
    return res.status(404).json({
      success: false,
      error: 'Champion not found'
    });
  }

  res.json({
    success: true,
    data: champion
  });
});


// GET /api/tft/traits
// Retorna todas as traits únicas
router.get('/traits', (req, res) => {
  const allTraits = new Set<string>();
  
  championsData.forEach(champion => {
    champion.traits.forEach(trait => allTraits.add(trait));
  });

  const traits = Array.from(allTraits).sort();

  res.json({
    success: true,
    count: traits.length,
    data: traits
  });
});


// GET /api/tft/traits/:traitName
// Retorna todos os champions com uma trait específica
router.get('/traits/:traitName', (req, res) => {
  const traitName = req.params.traitName;
  
  const champions = championsData.filter(c =>
    c.traits.some(t => t.toLowerCase() === traitName.toLowerCase())
  );

  if (champions.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Trait not found'
    });
  }

  res.json({
    success: true,
    trait: traitName,
    count: champions.length,
    data: champions
  });
});


// GET /api/tft/filter?traits=Yordle,Gunslinger
// Filtrar champions por uma ou múltiplas traits
router.get('/filter', (req, res) => {
  const traitsQuery = req.query.traits as string;

  if (!traitsQuery) {
    return res.status(400).json({
      success: false,
      error: 'error'
    });
  }

  const requestedTraits = traitsQuery.split(',').map(t => t.trim().toLowerCase());

  // Filtrar champions que têm todas as traits solicitadas
  const champions = championsData.filter(champion =>
    requestedTraits.every(trait =>
      champion.traits.some(t => t.toLowerCase() === trait)
    )
  );

  res.json({
    success: true,
    filters: requestedTraits,
    count: champions.length,
    data: champions
  });
});


// GET /api/tft/stats
// Estatísticas gerais dos dados
router.get('/stats', (req, res) => {
  const allTraits = new Set<string>();
  championsData.forEach(c => c.traits.forEach(t => allTraits.add(t)));

  // Contar champions por trait
  const traitCounts: { [key: string]: number } = {};
  championsData.forEach(champion => {
    champion.traits.forEach(trait => {
      traitCounts[trait] = (traitCounts[trait] || 0) + 1;
    });
  });

  // Ordenar traits
  const topTraits = Object.entries(traitCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([trait, count]) => ({ trait, count }));

  res.json({
    success: true,
    stats: {
      totalChampions: championsData.length,
      totalTraits: allTraits.size,
      topTraits: topTraits
    }
  });
});


// POST /api/tft/reload
// Recarregar dados dos champions
router.post('/reload', (req, res) => {
  loadChampionsData();
  
  res.json({
    success: true,
    message: 'Reloaded data',
    count: championsData.length
  });
});

export default router;