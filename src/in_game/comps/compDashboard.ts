import { AppWindow } from "../../AppWindow";
import { kWindowNames } from "../../../consts";

import WindowState = overwolf.windows.WindowStateEx;

new AppWindow(kWindowNames.inGame);

// Re-routes
document.addEventListener('DOMContentLoaded', () => {
  // Go Back Button
  const backButton = document.getElementById('backBtn');
  if (backButton) {
    backButton.addEventListener('click', () => {
      window.location.href = 'comps.html';
    });
  }
});