import { OWGames, OWHotkeys } from "@overwolf/overwolf-api-ts";

import { AppWindow } from "../../AppWindow";
import { kHotkeys, kWindowNames, kGamesFeatures } from "../../../consts";

import WindowState = overwolf.windows.WindowStateEx;

new AppWindow(kWindowNames.inGame);

// Re-routes
document.addEventListener('DOMContentLoaded', () => {
  // Go to debug window
  const debugWindow = document.getElementById('openDebugButton');
  if (debugWindow) {
    debugWindow.addEventListener('click', () => {
      window.location.href = 'debug.html';
    });
  }
});

// Go back button navigation
document.getElementById('back-button').addEventListener('click', function() {
    window.location.href = 'in_game.html';
});

// ACESSO A CADA TIER 
//N sei se vai ser usado assim, mas deixei aqui como exemplo

// Tier button navigation - add your logic here
document.getElementById('tierS_1').addEventListener('click', function() {
    console.log('S tier comp 1 selected');
    window.location.href = 'compDashboard.html';
});

// document.getElementById('tier-a').addEventListener('click', function() {
//     console.log('A tier selected');
//     // window.location.href = 'tier-details.html?tier=a';
// });

// document.getElementById('tier-b').addEventListener('click', function() {
//     console.log('B tier selected');
//     // window.location.href = 'tier-details.html?tier=b';
// });

// document.getElementById('tier-c').addEventListener('click', function() {
//     console.log('C tier selected');
//     // window.location.href = 'tier-details.html?tier=c';
// });

// document.getElementById('tier-x').addEventListener('click', function() {
//     console.log('X tier selected');
//     // window.location.href = 'tier-details.html?tier=x';
// });
