(function () {
  const FamilyDash = window.FamilyDash;

  const screens = {
    start: document.getElementById("startScreen"),
    character: document.getElementById("characterScreen"),
    store: document.getElementById("storeScreen"),
    level: document.getElementById("levelScreen"),
    game: document.getElementById("gameScreen"),
    overlay: document.getElementById("overlayScreen")
  };

  const hud = document.getElementById("hud");
  const characterGrid = document.getElementById("characterGrid");
  const levelGrid = document.getElementById("levelGrid");
  const storeGrid = document.getElementById("storeGrid");
  const walletValue = document.getElementById("walletValue");
  const scoreList = document.getElementById("recentScores");
  const canvas = document.getElementById("gameCanvas");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayText = document.getElementById("overlayText");
  const overlayPrimary = document.getElementById("overlayPrimary");
  const overlaySecondary = document.getElementById("overlaySecondary");
  const startBtn = document.getElementById("startBtn");
  const toStoreBtn = document.getElementById("toStoreBtn");
  const toLevelBtn = document.getElementById("toLevelBtn");
  const launchBtn = document.getElementById("launchBtn");
  const backToStartBtn = document.getElementById("backToStartBtn");
  const backToStoreBtn = document.getElementById("backToStoreBtn");
  const backToCharactersBtn = document.getElementById("backToCharactersBtn");

  const input = new FamilyDash.InputManager();
  input.bind();
  input.attachMobileControls(document.querySelector(".mobile-controls"));
  const audio = new FamilyDash.AudioSystem();
  const renderer = new FamilyDash.Renderer(canvas, FamilyDash.LEVELS[0]);

  const STORE_ITEMS = [
    { id: "speedBoost", name: "Turbo Shoes", cost: 24, desc: "+22 start speed for one run" },
    { id: "startShield", name: "Bubble Shield", cost: 20, desc: "Start with 6s shield" },
    { id: "extraHeart", name: "Extra Heart", cost: 32, desc: "+1 max health this run" },
    { id: "magnetBoost", name: "Coin Magnet", cost: 26, desc: "Stronger coin pull this run" },
    { id: "scoreBooster", name: "Score Juice", cost: 28, desc: "1.5x score this run" },
    { id: "coinDoubler", name: "Coin Doubler", cost: 34, desc: "2x coin value this run" },
    { id: "phaseStart", name: "Phase Start", cost: 30, desc: "Start run with temporary phase" }
  ];

  let selectedCharacter = null;
  let selectedLevel = null;
  let game = null;


  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (_err) {
      return fallback;
    }
  }

  let profile = {
    highScore: Number(localStorage.getItem("familyDashHighScore") || 0),
    wallet: Number(localStorage.getItem("familyDashWallet") || 0),
    sessions: readJSON("familyDashSessions", []),
    inventory: readJSON("familyDashInventory", {})
  };

  if (!Array.isArray(profile.sessions)) profile.sessions = [];
  if (typeof profile.inventory !== "object" || Array.isArray(profile.inventory)) profile.inventory = {};

  function saveProfile() {
    localStorage.setItem("familyDashHighScore", String(profile.highScore));
    localStorage.setItem("familyDashWallet", String(profile.wallet));
    localStorage.setItem("familyDashSessions", JSON.stringify(profile.sessions.slice(-25)));
    localStorage.setItem("familyDashInventory", JSON.stringify(profile.inventory));
  }

  function switchScreen(name) {
    Object.values(screens).forEach((screen) => screen.classList.remove("active"));
    screens[name].classList.add("active");
  }

  function statBar(scoreOutOfFive) {
    return Array.from({ length: 5 }, (_, index) => `<span class="stat-dot ${index < scoreOutOfFive ? "fill" : ""}"></span>`).join("");
  }

  function renderScoreboard() {
    if (!scoreList) return;
    const valid = profile.sessions.filter((s) => s && Number.isFinite(Number(s.score)));
    const topRecent = [...valid].sort((a, b) => Number(b.score) - Number(a.score)).slice(0, 8);
    if (topRecent.length === 0) {
      scoreList.innerHTML = "<li>No runs yet. Start your streak!</li>";
      return;
    }
    scoreList.innerHTML = topRecent
      .map((entry, idx) => `<li>#${idx + 1} ${entry.score} pts • ${entry.character || "Unknown"} • L${entry.level || "?"} • ${entry.date || "today"}</li>`)
      .join("");
  }

  function renderCharacterCards() {
    characterGrid.innerHTML = "";
    FamilyDash.CHARACTERS.forEach((character) => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <h3>${character.name}</h3>
        <p><strong>${character.role}</strong></p>
        <p>${character.flavor}</p>
        <p><strong>Strengths:</strong> ${character.strengths}</p>
        <p><strong>Weakness:</strong> ${character.weakness}</p>
        <p><strong>Speed:</strong> ${character.stats.speed}/5</p>
        <div class="stats-row">${statBar(character.stats.speed)}</div>
        <p><strong>Jump:</strong> ${character.stats.jump}/5</p>
        <div class="stats-row">${statBar(character.stats.jump)}</div>
        <p><strong>Stamina:</strong> ${character.stats.stamina}/5</p>
        <div class="stats-row">${statBar(character.stats.stamina)}</div>
        <p><strong>Strength:</strong> ${character.stats.strength}/5</p>
        <div class="stats-row">${statBar(character.stats.strength)}</div>
        <p><strong>Control:</strong> ${character.stats.control}/5</p>
        <div class="stats-row">${statBar(character.stats.control)}</div>
      `;
      card.addEventListener("click", () => {
        selectedCharacter = character.id;
        [...characterGrid.children].forEach((child) => child.classList.remove("selected"));
        card.classList.add("selected");
        toStoreBtn.disabled = false;
      });
      characterGrid.appendChild(card);
    });
  }

  function renderStore() {
    walletValue.textContent = profile.wallet;
    storeGrid.innerHTML = "";
    STORE_ITEMS.forEach((item) => {
      const owned = profile.inventory[item.id] || 0;
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `<h3>${item.name}</h3><p>${item.desc}</p><p><strong>Cost:</strong> ${item.cost} coins</p><p><strong>Owned:</strong> ${owned}</p>`;
      const buy = document.createElement("button");
      buy.textContent = `Buy ${item.name}`;
      buy.disabled = profile.wallet < item.cost;
      buy.addEventListener("click", () => {
        if (profile.wallet < item.cost) return;
        profile.wallet -= item.cost;
        profile.inventory[item.id] = (profile.inventory[item.id] || 0) + 1;
        saveProfile();
        renderStore();
      });
      card.appendChild(buy);
      storeGrid.appendChild(card);
    });
  }

  function consumeRunModifiers() {
    const mods = {};
    ["speedBoost", "startShield", "extraHeart", "magnetBoost", "scoreBooster", "coinDoubler", "phaseStart"].forEach((id) => {
      if ((profile.inventory[id] || 0) > 0) {
        mods[id] = true;
        profile.inventory[id] -= 1;
      }
    });
    saveProfile();
    return mods;
  }

  function renderLevelCards() {
    levelGrid.innerHTML = "";
    FamilyDash.LEVELS.forEach((level) => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <h3>Level ${level.id}: ${level.name}</h3>
        <p>${level.description}</p>
        <p><strong>Distance:</strong> ${level.length}m</p>
        <p><strong>Difficulty:</strong> ${(level.difficultyGrowth * 100).toFixed(0)}%</p>
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

  function updateHud(data) {
    hud.innerHTML = `
      <div class="hud-card"><strong>Character:</strong> ${FamilyDash.getCharacterById(selectedCharacter).name}</div>
      <div class="hud-card"><strong>Level:</strong> ${data.level}/10</div>
      <div class="hud-card"><strong>Health:</strong> ${"❤️".repeat(Math.max(0, data.health))}${"🖤".repeat(Math.max(0, data.maxHealth - data.health))}</div>
      <div class="hud-card"><strong>Score:</strong> ${data.score}</div>
      <div class="hud-card"><strong>Coins:</strong> ${data.coins}</div>
      <div class="hud-card"><strong>Distance:</strong> ${data.distance}m</div>
      <div class="hud-card"><strong>Shield:</strong> ${data.shield > 0 ? `${data.shield.toFixed(1)}s` : "--"}</div>
      <div class="hud-card"><strong>Rush:</strong> ${data.rush > 0 ? `${data.rush.toFixed(1)}s` : "--"}</div>
      <div class="hud-card"><strong>Status:</strong> ${data.status}</div>
      <div class="hud-card"><strong>Best:</strong> ${profile.highScore}</div>
    `;
  }


  function openPauseOverlay() {
    showOverlay(
      "Paused",
      "Take a breath. Tap Resume to continue.",
      "Resume",
      "Store",
      () => {
        switchScreen("game");
        game.pause();
      },
      () => {
        game.stop();
        renderStore();
        switchScreen("store");
      }
    );
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
    const character = FamilyDash.getCharacterById(selectedCharacter);
    const level = FamilyDash.LEVELS.find((entry) => entry.id === selectedLevel);
    if (!character || !level) return;

    if (game) game.stop();
    const runModifiers = consumeRunModifiers();

    game = new FamilyDash.RunnerGame({
      canvas,
      input,
      renderer,
      audio,
      onHud: updateHud,
      onPause: openPauseOverlay,
      onEnd: ({ outcome, score, coins, distance }) => {
        profile.wallet += coins;
        profile.highScore = Math.max(profile.highScore, score);
        profile.sessions.push({
          score,
          character: character.name,
          level: selectedLevel,
          date: new Date().toLocaleDateString()
        });
        saveProfile();
        renderScoreboard();

        const details = `${character.name} ran ${Math.floor(distance)}m, scored ${score}, collected ${coins} coins. Wallet: ${profile.wallet}.`;
        if (outcome === "win") {
          showOverlay(
            "Level Complete! 🎉",
            `${details} Keep climbing all 10 levels!`,
            selectedLevel < FamilyDash.LEVELS.length ? "Next Level" : "Play Again",
            "Store",
            () => {
              if (selectedLevel < FamilyDash.LEVELS.length) {
                selectedLevel += 1;
                startRun();
              } else {
                switchScreen("character");
              }
            },
            () => {
              renderStore();
              switchScreen("store");
            }
          );
        } else {
          showOverlay(
            "Game Over 💥",
            `${details} Try a store boost before retrying.`,
            "Retry",
            "Store",
            () => startRun(),
            () => {
              renderStore();
              switchScreen("store");
            }
          );
        }
      }
    });

    switchScreen("game");
    updateHud({ health: character.gameplay.maxHealth, maxHealth: character.gameplay.maxHealth, score: 0, coins: 0, distance: 0, level: level.id, status: "running", shield: 0, rush: 0 });
    game.start(character, level, runModifiers);
  }

  function activateAudio() {
    audio.startMusic();
  }

  startBtn.addEventListener("click", () => {
    activateAudio();
    renderScoreboard();
    renderCharacterCards();
    switchScreen("character");
  });

  backToStartBtn.addEventListener("click", () => {
    renderScoreboard();
    switchScreen("start");
  });

  toStoreBtn.addEventListener("click", () => {
    renderStore();
    switchScreen("store");
  });

  toLevelBtn.addEventListener("click", () => {
    renderLevelCards();
    switchScreen("level");
  });

  backToStoreBtn.addEventListener("click", () => {
    renderStore();
    switchScreen("store");
  });

  backToCharactersBtn.addEventListener("click", () => switchScreen("character"));
  launchBtn.addEventListener("click", startRun);

  window.addEventListener("keydown", (event) => {
    if ((event.code === "KeyP" || event.code === "Escape") && screens.game.classList.contains("active") && game && game.state === "paused") {
      switchScreen("game");
      game.pause();
    }
  });

  if (profile.sessions.length) {
    const best = profile.sessions.reduce((m, s) => Math.max(m, Number(s.score) || 0), profile.highScore || 0);
    profile.highScore = best;
    saveProfile();
  }
  renderScoreboard();
  switchScreen("start");
})();
