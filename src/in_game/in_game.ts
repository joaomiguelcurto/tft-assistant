import {
  OWGames,
  OWHotkeys
} from "@overwolf/overwolf-api-ts";

import { AppWindow } from "../AppWindow";
import { kHotkeys, kWindowNames, kGamesFeatures } from "../consts";

import WindowState = overwolf.windows.WindowStateEx;

// TFT-specific info type to avoid property errors (dynamic keys)
interface TFTInfo {
  match_info?: { game_mode?: string; round_type?: string; local_player_damage?: string; };
  me?: { gold?: string; health?: string; xp?: string; rank?: string; };
  store?: { shop_pieces?: string; };
  board?: { board_pieces?: string; };
  bench?: { bench_pieces?: string; };
  carousel?: { carousel_pieces?: string; };
  roster?: { player_status?: string; };
}

// All TFT data via onInfoUpdates2(info) - parse.
class InGame extends AppWindow {
  private static _instance: InGame;

  private async setToggleHotkeyText(): Promise<void> {
    const hotkeyText = await OWHotkeys.getHotkeyText(kHotkeys.toggle, 5426);
    const hotkeyElem = document.getElementById('hotkey');
    if (hotkeyElem) hotkeyElem.textContent = hotkeyText;
  }

  private async setToggleHotkeyBehavior(): Promise<void> {
    const toggleInGameWindow = async () => {
      const state = await this.getWindowState();
      if (state.window_state === WindowState.NORMAL || state.window_state === WindowState.MAXIMIZED) {
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
    const gameInfo = await OWGames.getRunningGameInfo();
    if (!gameInfo?.isRunning || gameInfo.id !== 5426) return; // TFT/LOL

    const features = kGamesFeatures.get(5426)!; // consts.ts

    // TFT Features
    overwolf.games.events.setRequiredFeatures(
      features,
      (featuresInfo) => {
        console.log('TFT Features Ready:', featuresInfo);
      }
    );

    // Listen for updates (~every second + changes)
    overwolf.games.events.onInfoUpdates2.addListener(this.onInfoUpdates.bind(this));

    // Errors
    overwolf.games.events.onError.addListener((error) => {
      console.error('TFT Events Error:', error);
    });

    // New events (exemple, round_start)
    overwolf.games.events.onNewEvents.addListener(this.onNewEvents.bind(this));
  }

  private onInfoUpdates(info: overwolf.games.events.InfoUpdates2Event) {
    // Filter: TFT only
    if ((info.info as TFTInfo)?.match_info?.game_mode !== 'tft') return;

    console.log('=== TFT UPDATE ===', info);

    const tftInfo = info.info as TFTInfo;

    // Player stats
    console.log('Gold:', tftInfo.me?.gold);
    console.log('Health:', tftInfo.me?.health);
    console.log('Level/XP:', tftInfo.me?.xp ? JSON.parse(tftInfo.me.xp) : null);
    console.log('Rank:', tftInfo.me?.rank); // Accurate post-death/win

    // Match/round
    console.log('Round:', tftInfo.match_info?.round_type);
    console.log('Damage:', tftInfo.match_info?.local_player_damage);

    // Shop (array after parse)
    if (tftInfo.store?.shop_pieces) {
      const shop = JSON.parse(tftInfo.store.shop_pieces);
      console.log('Shop units:', Object.values(shop));
    }

    // Board (your units + positions/items)
    if (tftInfo.board?.board_pieces) {
      const board = JSON.parse(tftInfo.board.board_pieces);
      console.log('Board units:', Object.values(board)); // example, {name: 'TFT10_KogMaw', level: '2', item_1: '...'}
    }

    // Bench (inventory)
    if (tftInfo.bench?.bench_pieces) {
      const bench = JSON.parse(tftInfo.bench.bench_pieces);
      console.log('Bench:', Object.values(bench));
    }

    // Carousel
    if (tftInfo.carousel?.carousel_pieces) {
      const carousel = JSON.parse(tftInfo.carousel.carousel_pieces);
      console.log('Carousel:', Object.values(carousel));
    }

    // Roster (all players)
    if (tftInfo.roster?.player_status) {
      const roster = JSON.parse(tftInfo.roster.player_status);
      console.log('Roster health/rank:', roster);
    }

    // example, document.getElementById('gold').textContent = tftInfo.me?.gold;
    // Or: overwolf.windows.sendMessage('desktop', {type: 'tft_update', data: info});
  }

  private onNewEvents(events: overwolf.games.events.NewGameEvents) {
    console.log('TFT Events:', events.events); // e.g., [{name: 'round_start', data: 'PVP'}]
  }
}

InGame.instance().run();