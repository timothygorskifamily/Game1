import { CHARACTERS, getCharacterById } from "./data/characters.js";
import { LEVELS } from "./data/levels.js";
import { InputManager } from "./systems/input.js";
import { AudioSystem } from "./systems/audio.js";
import { Renderer } from "./core/renderer.js";
import { RunnerGame } from "./core/game.js";

const screens = {
  start: document.getElementById("startScreen"),
  character: document.getElementById("characterScreen"),
  level: document.getElementById("levelScreen"),
  game: document.getElementById("gameScreen"),
  overlay: document.getElementById("overlayScreen")
};

const hud = document.getElementById("hud");
const characterGrid = document.getElementById("characterGrid");
const levelGrid = document.getElementById("levelGrid");
const canvas = document.getElementById("gameCanvas");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const overlayPrimary = document.getElementById("overlayPrimary");
const overlaySecondary = document.getElementById("overlaySecondary");

const startBtn = document.getElementById("startBtn");
const toLevelBtn = document.getElementById("toLevelBtn");
const launchBtn = document.getElementById("launchBtn");
const backToStartBtn = document.getElementById("backToStartBtn");
const backToCharactersBtn = document.getElementById("backToCharactersBtn");

const input = new InputManager();
input.bind();
input.attachMobileControls(document.querySelector(".mobile-controls"));
const audio = new AudioSystem();
const renderer = new Renderer(canvas, LEVELS[0]);

let selectedCharacter = null;
let selectedLevel = null;
let game = null;
let highScore = Number(localStorage.getItem("familyDashHighScore") || 0);

function switchScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
  screens[name].classList.add("active");
}

function statBar(scoreOutOfFive) {
  return Array.from({ length: 5 }, (_, index) => {
    return `<span class="stat-dot ${index < scoreOutOfFive ? "fill" : ""}"></span>`;
  }).join("");
}

function renderCharacterCards() {
  characterGrid.innerHTML = "";
  CHARACTERS.forEach((character) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h3>${character.name}</h3>
      <p><strong>${character.role}</strong></p>
      <p>${character.flavor}</p>
      <p><strong>Strengths:</strong> ${character.strengths}</p>
      <p><strong>Weakness:</strong> ${character.weakness}</p>
      <div class="stats-row" title="Speed">${statBar(character.stats.speed)}</div>
      <div class="stats-row" title="Jump">${statBar(character.stats.jump)}</div>
      <div class="stats-row" title="Stamina">${statBar(character.stats.stamina)}</div>
      <div class="stats-row" title="Strength">${statBar(character.stats.strength)}</div>
      <div class="stats-row" title="Control">${statBar(character.stats.control)}</div>
    `;

    card.addEventListener("click", () => {
      selectedCharacter = character.id;
      [...characterGrid.children].forEach((child) => child.classList.remove("selected"));
      card.classList.add("selected");
      toLevelBtn.disabled = false;
    });

    characterGrid.appendChild(card);
  });
}

function renderLevelCards() {
  levelGrid.innerHTML = "";
  LEVELS.forEach((level) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h3>Level ${level.id}: ${level.name}</h3>
      <p>${level.description}</p>
      <p><strong>Distance:</strong> ${level.length}m</p>
      <p><strong>Difficulty growth:</strong> ${(level.difficultyGrowth * 100).toFixed(0)}%</p>
    `;

    card.addEventListener("click", () => {
      selectedLevel = level.id;
      [...levelGrid.children].forEach((child) => child.classList.remove("selected"));
      card.classList.add("selected");
      launchBtn.disabled = false;
    });

    levelGrid.appendChild(card);
  });
}

function updateHud({ health, maxHealth, score, coins, distance, level, status, shield, rush }) {
  hud.innerHTML = `
    <div class="hud-card"><strong>Character:</strong> ${getCharacterById(selectedCharacter).name}</div>
    <div class="hud-card"><strong>Level:</strong> ${level}</div>
    <div class="hud-card"><strong>Health:</strong> ${"❤️".repeat(Math.max(0, health))}${"🖤".repeat(Math.max(0, maxHealth - health))}</div>
    <div class="hud-card"><strong>Score:</strong> ${score}</div>
    <div class="hud-card"><strong>Coins:</strong> ${coins}</div>
    <div class="hud-card"><strong>Distance:</strong> ${distance}m</div>
    <div class="hud-card"><strong>Shield:</strong> ${shield > 0 ? `${shield.toFixed(1)}s` : "--"}</div>
    <div class="hud-card"><strong>Rush:</strong> ${rush > 0 ? `${rush.toFixed(1)}s` : "--"}</div>
    <div class="hud-card"><strong>Status:</strong> ${status}</div>
    <div class="hud-card"><strong>Best:</strong> ${highScore}</div>
  `;
}

function showOverlay(title, message, primaryLabel, secondaryLabel, onPrimary, onSecondary) {
  overlayTitle.textContent = title;
  overlayText.textContent = message;
  overlayPrimary.textContent = primaryLabel;
  overlaySecondary.textContent = secondaryLabel;

  overlayPrimary.onclick = onPrimary;
  overlaySecondary.onclick = onSecondary;
  switchScreen("overlay");
}

function startRun() {
  const character = getCharacterById(selectedCharacter);
  const level = LEVELS.find((entry) => entry.id === selectedLevel);
  if (!character || !level) return;

  if (game) game.stop();

  game = new RunnerGame({
    canvas,
    input,
    renderer,
    audio,
    onHud: updateHud,
    onEnd: ({ outcome, score, coins, distance }) => {
      highScore = Math.max(highScore, score);
      localStorage.setItem("familyDashHighScore", String(highScore));

      const details = `${character.name} ran ${Math.floor(distance)}m, scored ${score}, and collected ${coins} coins.`;
      if (outcome === "win") {
        showOverlay(
          "Level Complete! 🎉",
          `${details} Great run!`,
          selectedLevel < LEVELS.length ? "Next Level" : "Play Again",
          "Character Select",
          () => {
            if (selectedLevel < LEVELS.length) {
              selectedLevel += 1;
              startRun();
            } else {
              switchScreen("character");
            }
          },
          () => switchScreen("character")
        );
      } else {
        showOverlay(
          "Game Over 💥",
          `${details} Tiny chaos wins this round.`,
          "Retry",
          "Character Select",
          () => startRun(),
          () => switchScreen("character")
        );
      }
    }
  });

  switchScreen("game");
  updateHud({
    health: character.gameplay.maxHealth,
    maxHealth: character.gameplay.maxHealth,
    score: 0,
    coins: 0,
    distance: 0,
    level: level.id,
    status: "running",
    shield: 0,
    rush: 0
  });
  game.start(character, level);
}

startBtn.addEventListener("click", () => {
  renderCharacterCards();
  switchScreen("character");
});

backToStartBtn.addEventListener("click", () => switchScreen("start"));

toLevelBtn.addEventListener("click", () => {
  renderLevelCards();
  switchScreen("level");
});

backToCharactersBtn.addEventListener("click", () => switchScreen("character"));
launchBtn.addEventListener("click", startRun);

window.addEventListener("keydown", (event) => {
  if (event.code === "KeyP" || event.code === "Escape") {
    if (screens.game.classList.contains("active") && game) {
      game.pause();
      if (game.state === "paused") {
        showOverlay(
          "Paused",
          "Take a breath. Snacks are safe... for now.",
          "Resume",
          "Character Select",
          () => {
            switchScreen("game");
            game.pause();
          },
          () => {
            game.stop();
            switchScreen("character");
          }
        );
      }
    }
  }
});

switchScreen("start");
