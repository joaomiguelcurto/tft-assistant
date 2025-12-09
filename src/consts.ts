export const kGamesFeatures = new Map<number, string[]>([
  // Teamfight Tactics (shared ID with LoL: 5426)
  [
    5426,
    [
      'gep_internal',    // GEP version/status
      'game_info',       // PBE mode flag
      'live_client_data', // Events (e.g., ChampionKill), all_players, game_data
      'me',              // Your summoner_name, xp, health, rank (post-death/win), gold
      'match_info',      // round_type/outcome (PvE/PvP/Carousel), game_mode ('tft'), damage, item_select
      'roster',          // All players' status (health/xp/rank/tagline)
      'store',           // shop_pieces (available units)
      'board',           // board_pieces (your units/items/positions/star-levels)
      'bench',           // bench_pieces (your inventory units/items)
      'carousel'         // carousel_pieces (available units)
      // 'augments'  <-- DO NOT ADD: TOS violation!
    ]
  ]
]);

export const kGameClassIds = Array.from(kGamesFeatures.keys());

export const kWindowNames = {
  inGame: 'in_game',
  desktop: 'desktop'
};

export const kHotkeys = {
  toggle: 'sample_app_ts_showhide'
};
