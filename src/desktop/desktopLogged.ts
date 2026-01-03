import { AppWindow } from "../AppWindow";
import { kWindowNames } from "../../consts";

document.addEventListener('DOMContentLoaded', () => {
  // Comps navigation
  const compsCard = document.getElementById('compsCard');
  if (compsCard) {
    compsCard.addEventListener('click', () => {
      window.location.href = 'comps.html';
    });
  }

  // Assistant navigation
  const assistantCard = document.getElementById('assistantCard');
  if (assistantCard) {
    assistantCard.addEventListener('click', () => {
      window.location.href = 'assistant.html';
    });
  }

  // Builder navigation
  const builderCard = document.getElementById('builderCard');
  if (builderCard) {
    builderCard.addEventListener('click', () => {
      window.location.href = 'builder.html';
    });
  }
});
