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

// All TFT data via onInfoUpdates2(info) - parse.
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
  }

  public static instance() {
    if (!this._instance) {
      this._instance = new InGame();
    }
    return this._instance;
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

  // TODO: Adicionar botao UI para dar force refresh
  private forceRefreshGameData(): void {
  overwolf.games.events.getInfo((info) => {
    if (info.success && info.res) {
      console.log("Manually refreshed game data:", info.res);
      this.onInfoUpdates({ info: info.res, feature: "manual_refresh" });
    } else {
      console.error("Failed to refresh game data:", info);
    }
  });
}

  private logToUI(logTo: HTMLElement, message: string, color: string) {
    if(!logTo) return // Make sure it exists

    const entry = document.createElement('div');
    const timestamp = new Date().toLocaleTimeString();
    entry.textContent = `[${timestamp}] ${message}`;

    if (color !== "default") {
      entry.style.color = color;
    }

    logTo.appendChild(entry);
    // Auto-scroll to bottom
    logTo.scrollTop = logTo.scrollHeight;
  }

  private onInfoUpdates(info: overwolf.games.events.InfoUpdates2Event) {
    const tftInfo = info.info as TFTInfo;
    // Get element to display info (UI)
    const infoLog = document.getElementById('infoLog');
    const eventsLog = document.getElementById('eventsLog');

    // ANTI-SPAM NA CONSOLA 
    // --------------- TEMPORARIO ---------------
    if (info.feature === "live_client_data") return;

    // Log everything received (for debugging)
    console.log("RAW INFO UPDATE", info);

    // Player stats (Gold, Health, XP, Rank)
    if (tftInfo.me) {
      if (tftInfo.me.gold !== undefined) {
        console.log("Gold:", tftInfo.me.gold);
        this.logToUI(infoLog, "Gold: " + tftInfo.me.gold, "#FFD700");
      }
      if (tftInfo.me.health !== undefined) {
        console.log("Health:", tftInfo.me.health);
        this.logToUI(infoLog, "Health: " + tftInfo.me.health, "#ff8585ff");
      }
      if (tftInfo.me.xp) {
        try {
          const xpData = JSON.parse(tftInfo.me.xp);
          console.log("Level/XP:", xpData);
          this.logToUI(infoLog, "Level/XP: " + xpData, "#03ffbcff");
        } catch (e) {
          console.log("XP (raw):", tftInfo.me.xp);
          this.logToUI(infoLog, "XP (raw): " + tftInfo.me.xp, "#03ffbcff");
        }
      }
      if (tftInfo.me.rank !== undefined) {
        console.log("Rank:", tftInfo.me.rank);
        this.logToUI(infoLog, "Rank: " + tftInfo.me.rank, "#cd9bcdff");
      
      }
    }

    // Match/round info
    // SPAM CONSOLA
    if (tftInfo.match_info) {
      if (tftInfo.match_info.game_mode) {
        console.log("Game Mode:", tftInfo.match_info.game_mode);
        this.logToUI(eventsLog, "Game Mode: " + tftInfo.match_info.game_mode, "#b42457ff)");
      }
      if (tftInfo.match_info.round_type) {
        console.log("Round Type:", tftInfo.match_info.round_type);
        this.logToUI(eventsLog, "Round Type: " + tftInfo.match_info.round_type, "#6585edff");
      }
      if (tftInfo.match_info.local_player_damage) {
        console.log("Damage:", tftInfo.match_info.local_player_damage);
        this.logToUI(eventsLog, "Damage: " + tftInfo.match_info.local_player_damage, "#fe2929ff");
      }
    }

    // Shop (array after parse)
    if (tftInfo.store?.shop_pieces) {
      try {
        const shop = JSON.parse(tftInfo.store.shop_pieces);
        console.log("Shop units:", Object.values(shop));
        this.logToUI(infoLog, "Shop units: " + Object.values(shop), "#08d951ff");
      } catch (e) {
        console.error("Failed to parse shop:", e);
        this.logToUI(infoLog, "Failed to parse shop: " + e, "#ff0000ff");
      }
    }

    // Board (your units + positions/items)
    if (tftInfo.board?.board_pieces) {
      try {
        const board_champions = JSON.parse(tftInfo.board.board_pieces);
        const board_pieces = JSON.parse(tftInfo.board.board_pieces);
        console.log("Board units:", Object.values(board_champions));
        this.logToUI(infoLog, "Board units: " + Object.values(board_champions), "#4a9ab5ff");
        console.log("Board positions:", board_pieces);
        this.logToUI(infoLog, "Board positions: " + board_pieces, "#45c2ecff");
      } catch (e) {
        console.error("Failed to parse board:", e);
        this.logToUI(infoLog, "Failed to parse board: " + e, "#ff0000ff");
      }
    }

    // Bench (inventory)
    if (tftInfo.bench?.bench_pieces) {
      try {
        const bench_champions = JSON.parse(tftInfo.bench.bench_pieces);
        const bench_pieces = JSON.parse(tftInfo.bench.bench_pieces);
        console.log("Bench units:", Object.values(bench_champions));
        this.logToUI(infoLog, "Bench units: " + Object.values(bench_champions), "#40e160ff");
        console.log("Bench positions:", bench_pieces);
        this.logToUI(infoLog, "Bench positions: " + bench_pieces, "#48a15aff");
      } catch (e) {
        console.error("Failed to parse bench:", e);
        this.logToUI(infoLog, "Failed to parse bench: " + e, "#ff0000ff");
      }
    }

    // Carousel
    if (tftInfo.carousel?.carousel_pieces) {
      try {
        const carousel = JSON.parse(tftInfo.carousel.carousel_pieces);
        console.log("Carousel:", Object.values(carousel));
        this.logToUI(infoLog, "Carousel: " + Object.values(carousel), "#009a21ff")
      } catch (e) {
        console.error("Failed to parse carousel:", e);
        this.logToUI(infoLog, "Failed to parse carousel: " + e, "#ff0000ff");
      }
    }

    // Roster (all players)
    if (tftInfo.roster?.player_status) {
      try {
        const roster = JSON.parse(tftInfo.roster.player_status);
        console.log("Roster (all players):", roster);
        this.logToUI(infoLog, "Roster (all players): " + roster, "rgba(73, 121, 170, 1)")
      } catch (e) {
        console.error("Failed to parse roster:", e);
        this.logToUI(infoLog, "Failed to parse roster: " + e, "#ff0000ff");
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
