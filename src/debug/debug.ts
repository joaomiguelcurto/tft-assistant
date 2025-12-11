// debug.ts
console.log('Debug window loaded');

// Window controls
document.getElementById('minimizeButton')?.addEventListener('click', () => {
  overwolf.windows.getCurrentWindow(result => {
    overwolf.windows.minimize(result.window.id);
  });
});

document.getElementById('maximizeButton')?.addEventListener('click', () => {
  overwolf.windows.getCurrentWindow(result => {
    if (result.window.stateEx === 'maximized') {
      overwolf.windows.restore(result.window.id);
    } else {
      overwolf.windows.maximize(result.window.id);
    }
  });
});

document.getElementById('closeButton')?.addEventListener('click', () => {
  overwolf.windows.getCurrentWindow(result => {
    overwolf.windows.close(result.window.id);
  });
});

// Back button
document.getElementById('backButton')?.addEventListener('click', () => {
  overwolf.windows.obtainDeclaredWindow('in_game', result => {
    if (result.success) {
      overwolf.windows.restore(result.window.id);
    }
  });
});