import { OWGames, OWHotkeys } from "@overwolf/overwolf-api-ts";

import { AppWindow } from "../AppWindow";
import { kHotkeys, kWindowNames, kGamesFeatures } from "../consts";

import WindowState = overwolf.windows.WindowStateEx;

// TFT-specific info type to avoid property errors (dynamic keys)
interface TFTInfo {
  match_info?: {
    game_mode?: string;
    round_type?: string;
    local_player_damage?: string;
  };
  me?: { gold?: string; health?: string; xp?: string; rank?: string };
  store?: { shop_pieces?: string };
  board?: { board_pieces?: string };
  bench?: { bench_pieces?: string };
  carousel?: { carousel_pieces?: string };
  roster?: { player_status?: string };
}

class InGame extends AppWindow {
  private static _instance: InGame;

  private async setToggleHotkeyText(): Promise<void> {
    const hotkeyText = await OWHotkeys.getHotkeyText(kHotkeys.toggle, 5426);
    const hotkeyElem = document.getElementById("hotkey");
    if (hotkeyElem) hotkeyElem.textContent = hotkeyText;
  }
  
  private async setToggleHotkeyBehavior(): Promise<void> {
    const toggleInGameWindow = async () => {
      const state = await this.getWindowState();
      if (
        state.window_state === WindowState.NORMAL ||
        state.window_state === WindowState.MAXIMIZED
      ) {
        this.currWindow.minimize();
      } else {
        this.currWindow.restore();
      }
    };
    OWHotkeys.onHotkeyDown(kHotkeys.toggle, toggleInGameWindow);
  }

  private constructor() {
    super(kWindowNames.inGame);
    this.setToggleHotkeyBehavior();
    this.setToggleHotkeyText();
    this.setupDebugButton();
  }

  public static instance() {
    if (!this._instance) {
      this._instance = new InGame();
    }
    return this._instance;
  }

  private setupDebugButton(): void {
    const debugButton = document.getElementById('openDebugButton');
    if (debugButton) {
      debugButton.addEventListener('click', (e) => {
        e.preventDefault();
        console.log("Opening debug window...");
        
        // Open debug window using Overwolf API
        overwolf.windows.obtainDeclaredWindow('debug', result => {
          if (result.success) {
            console.log("Debug window opened successfully");
            overwolf.windows.restore(result.window.id);
          } else {
            console.error("Failed to open debug window:", result);
          }
        });
      });
      console.log("Debug button listener attached");
    } else {
      console.error("Debug button element not found!");
    }
  }

  public async run() {
    console.log("InGame.run() starting...");

    const gameInfo = await OWGames.getRunningGameInfo();
    console.log("Game Info:", gameInfo);

    console.log('Waiting for game to fully load...')
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log("TFT detected, setting up listeners...");

    const features = kGamesFeatures.get(5426)!; // consts.ts
    console.log("Features to request:", features);

    // TFT Features
    overwolf.games.events.setRequiredFeatures(features, (result) => {
      console.log("setRequiredFeatures result:", result);

      if (result.success) {
        console.log(
          "Features enabled successfully:",
          result.supportedFeatures
        );
      } else {
        console.error("Failed to enable features:", result.error);
      }
    });

    // Listen for updates (~every second + changes)
    overwolf.games.events.onInfoUpdates2.addListener(
      this.onInfoUpdates.bind(this)
    );

    // Errors
    overwolf.games.events.onError.addListener((error) => {
      console.error("TFT Events Error:", error);
    });

    // New events (exemple, round_start)
    overwolf.games.events.onNewEvents.addListener(this.onNewEvents.bind(this));

    console.log("All listeners registered");
  }

  private onInfoUpdates(info: overwolf.games.events.InfoUpdates2Event) {
    const tftInfo = info.info as TFTInfo;

    // ANTI-SPAM NA CONSOLA 
    // --------------- TEMPORARIO ---------------
    if (info.feature === "live_client_data") return;

    // Log everything received (for debugging) - not displaying to UI
    console.log("RAW INFO UPDATE", info);

    // Player stats (Gold, Health, XP, Rank)
    if (tftInfo.me) {
      if (tftInfo.me.gold !== undefined) {
        console.log("Gold:", tftInfo.me.gold);
      }
      if (tftInfo.me.health !== undefined) {
        console.log("Health:", tftInfo.me.health);
      }
      if (tftInfo.me.xp) {
        try {
          const xpData = JSON.parse(tftInfo.me.xp);
          console.log("Level/XP:", xpData);
        } catch (e) {
          console.log("XP (raw):", tftInfo.me.xp);
        }
      }
      if (tftInfo.me.rank !== undefined) {
        console.log("Rank:", tftInfo.me.rank);
      }
    }

    // Match/round info
    if (tftInfo.match_info) {
      if (tftInfo.match_info.game_mode) {
        console.log("Game Mode:", tftInfo.match_info.game_mode);
      }
      if (tftInfo.match_info.round_type) {
        console.log("Round Type:", tftInfo.match_info.round_type);
      }
      if (tftInfo.match_info.local_player_damage) {
        console.log("Damage:", tftInfo.match_info.local_player_damage);
      }
    }

    // Shop (array after parse)
    if (tftInfo.store?.shop_pieces) {
      try {
        const shop = JSON.parse(tftInfo.store.shop_pieces);
        console.log("Shop units:", Object.values(shop));
      } catch (e) {
        console.error("Failed to parse shop:", e);
      }
    }

    // Board (your units + positions/items)
    if (tftInfo.board?.board_pieces) {
      try {
        const board_champions = JSON.parse(tftInfo.board.board_pieces);
        const board_pieces = JSON.parse(tftInfo.board.board_pieces);
        console.log("Board units:", Object.values(board_champions));
        console.log("Board positions:", board_pieces);
      } catch (e) {
        console.error("Failed to parse board:", e);
      }
    }

    // Bench (inventory)
    if (tftInfo.bench?.bench_pieces) {
      try {
        const bench_champions = JSON.parse(tftInfo.bench.bench_pieces);
        const bench_pieces = JSON.parse(tftInfo.bench.bench_pieces);
        console.log("Bench units:", Object.values(bench_champions));
        console.log("Bench positions:", bench_pieces);
      } catch (e) {
        console.error("Failed to parse bench:", e);
      }
    }

    // Carousel
    if (tftInfo.carousel?.carousel_pieces) {
      try {
        const carousel = JSON.parse(tftInfo.carousel.carousel_pieces);
        console.log("Carousel:", Object.values(carousel));
      } catch (e) {
        console.error("Failed to parse carousel:", e);
      }
    }

    // Roster (all players)
    if (tftInfo.roster?.player_status) {
      try {
        const roster = JSON.parse(tftInfo.roster.player_status);
        console.log("Roster (all players):", roster);
      } catch (e) {
        console.error("Failed to parse roster:", e);
      }
    }

    console.log("--------------------------");
  }

  private onNewEvents(events: overwolf.games.events.NewGameEvents) {
    console.log("TFT Events:", events.events);
    events.events.forEach((event) => {
      console.log(`  Event: ${event.name}:`, event.data);
    });
  }
}

InGame.instance().run();