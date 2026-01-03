import { AppWindow } from "../AppWindow";
import { kWindowNames } from "../../consts";

// The desktop window is the window displayed while game is not running.
// In our case, our desktop window has no logic - it only displays static data.
// Therefore, only the generic AppWindow class is called.
new AppWindow(kWindowNames.desktop);

document.addEventListener('DOMContentLoaded', () => {
  // Login navigation
  const login = document.getElementById('loginBtn');
  if (login) {
    login.addEventListener('click', () => {
      window.location.href = 'desktopLogged.html';
    });
  }
});

