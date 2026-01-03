import { AppWindow } from "../AppWindow";
import { kWindowNames } from "../../consts";

new AppWindow(kWindowNames.desktop);

document.addEventListener('DOMContentLoaded', () => {
  // Logout 
  const logout = document.getElementById('logoutBtn');
  if (logout) {
    logout.addEventListener('click', () => {
      window.location.href = 'desktop.html';
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Comps navigation
  const compsCard = document.getElementById('compsCard');
  if (compsCard) {
    compsCard.addEventListener('click', () => {
      window.location.href = 'comps.html';
    });
  }
});

  // // Assistant navigation
  // const assistantCard = document.getElementById('assistantCard');
  // if (assistantCard) {
  //   assistantCard.addEventListener('click', () => {
  //     window.location.href = 'assistant.html';
  //   });
  // }

//   // Builder navigation
//   const builderCard = document.getElementById('builderCard');
//   if (builderCard) {
//     builderCard.addEventListener('click', () => {
//       window.location.href = 'builder.html';
//     });
//   }
// });

