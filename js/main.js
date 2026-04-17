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
  const musicTrackName = document.getElementById("musicTrackName");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayText = document.getElementById("overlayText");
  const overlayNamePrompt = document.getElementById("overlayNamePrompt");
  const overlayNameInput = document.getElementById("overlayNameInput");
  const overlayNameHint = document.getElementById("overlayNameHint");
  const overlayPrimary = document.getElementById("overlayPrimary");
  const overlaySecondary = document.getElementById("overlaySecondary");
  const overlayTertiary = document.getElementById("overlayTertiary");
  const startBtn = document.getElementById("startBtn");
  const toStoreBtn = document.getElementById("toStoreBtn");
  const toLevelFromCharacterBtn = document.getElementById("toLevelFromCharacterBtn");
  const toLevelBtn = document.getElementById("toLevelBtn");
  const launchBtn = document.getElementById("launchBtn");
  const backToStartBtn = document.getElementById("backToStartBtn");
  const backToStoreBtn = document.getElementById("backToStoreBtn");
  const backToCharactersBtn = document.getElementById("backToCharactersBtn");

  const input = new FamilyDash.InputManager();
  input.bind();
  input.attachMobileControls(document.querySelector(".mobile-controls"));

  const audio = new FamilyDash.AudioSystem();
  audio.setTrackChangeListener((track) => {
    if (!musicTrackName || !track) return;
    musicTrackName.textContent = track.name;
  });

  const renderer = new FamilyDash.Renderer(canvas, FamilyDash.LEVELS[0]);
  const statLabels = {
    speed: "Speed",
    jump: "Jump",
    stamina: "Stamina",
    strength: "Strength",
    control: "Control"
  };

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
  let levelBackTarget = "store";

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
    playerName: localStorage.getItem("familyDashPlayerName") || "",
    sessions: readJSON("familyDashSessions", []),
    inventory: readJSON("familyDashInventory", {})
  };

  if (!Array.isArray(profile.sessions)) profile.sessions = [];
  if (typeof profile.inventory !== "object" || Array.isArray(profile.inventory)) profile.inventory = {};
  if (typeof profile.playerName !== "string") profile.playerName = "";

  function saveProfile() {
    localStorage.setItem("familyDashHighScore", String(profile.highScore));
    localStorage.setItem("familyDashWallet", String(profile.wallet));
    localStorage.setItem("familyDashPlayerName", profile.playerName);
    localStorage.setItem("familyDashSessions", JSON.stringify(profile.sessions.slice(-25)));
    localStorage.setItem("familyDashInventory", JSON.stringify(profile.inventory));
  }

  function sanitizePlayerName(name) {
    return String(name || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 24);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  profile.playerName = sanitizePlayerName(profile.playerName);

  function switchScreen(name) {
    Object.values(screens).forEach((screen) => screen.classList.remove("active"));
    screens[name].classList.add("active");
    if (name === "game") requestAnimationFrame(() => renderer.resize && renderer.resize());
  }

  function renderScoreboard() {
    if (!scoreList) return;
    const valid = profile.sessions.filter((session) => session && Number.isFinite(Number(session.score)));
    const topRecent = [...valid].sort((a, b) => Number(b.score) - Number(a.score)).slice(0, 8);
    if (!topRecent.length) {
      scoreList.innerHTML = "<li>No runs yet. Start your streak!</li>";
      return;
    }

    scoreList.innerHTML = topRecent
      .map((entry, idx) => {
        const playerName = escapeHtml(entry.playerName || "Player");
        const characterName = escapeHtml(entry.character || "Unknown");
        const dateLabel = escapeHtml(entry.date || "today");
        return `<li>#${idx + 1} ${playerName} - ${entry.score} pts - ${characterName} - L${entry.level || "?"} - ${dateLabel}</li>`;
      })
      .join("");
  }

  function syncCharacterActions() {
    const hasSelection = Boolean(selectedCharacter);
    toStoreBtn.disabled = !hasSelection;
    toLevelFromCharacterBtn.disabled = !hasSelection;
  }

  function syncLaunchAction() {
    launchBtn.disabled = !selectedLevel;
  }

  function statMeter(value) {
    return Array.from({ length: 5 }, (_, index) => `<span class="stat-segment ${index < value ? "fill" : ""}"></span>`).join("");
  }

  function renderCharacterCards() {
    characterGrid.innerHTML = "";
    const characters = FamilyDash.getCharactersSortedByDifficulty
      ? FamilyDash.getCharactersSortedByDifficulty()
      : FamilyDash.CHARACTERS;

    characters.forEach((character) => {
      const card = document.createElement("article");
      card.className = "card character-card";
      card.style.setProperty("--card-accent", character.accent);
      card.style.setProperty("--card-color", character.color);

      const difficultyTone = character.difficulty?.tone || "medium";
      const difficultyLabel = character.difficulty?.label || "Medium";
      const difficultyNote = character.difficulty?.note || "Solid all-around pick";
      const statsMarkup = Object.entries(character.stats)
        .map(([key, value]) => `
          <div class="character-stat">
            <div class="character-stat-label">${statLabels[key] || key}</div>
            <div class="character-stat-meter">${statMeter(value)}</div>
          </div>
        `)
        .join("");

      card.innerHTML = `
        <div class="character-card-top">
          <span class="difficulty-badge" data-tone="${difficultyTone}">${difficultyLabel}</span>
        </div>
        <div class="character-portrait-frame">
          <img class="character-portrait" src="${character.portrait || `assets/characters/${character.id}.svg`}" alt="${character.name} portrait" loading="lazy" />
        </div>
        <div class="character-copy">
          <h3>${character.name}</h3>
          <p class="character-role">${character.role}</p>
          <p class="character-difficulty"><strong>Use:</strong> ${difficultyNote}</p>
          <p class="character-flavor">${character.flavor}</p>
          <p><strong>Strengths:</strong> ${character.strengths}</p>
          <p><strong>Watch out:</strong> ${character.weakness}</p>
        </div>
        <div class="character-stat-list">${statsMarkup}</div>
      `;

      if (selectedCharacter === character.id) card.classList.add("selected");
      card.addEventListener("click", () => {
        selectedCharacter = character.id;
        [...characterGrid.children].forEach((child) => child.classList.remove("selected"));
        card.classList.add("selected");
        syncCharacterActions();
      });
      characterGrid.appendChild(card);
    });

    syncCharacterActions();
  }

  function renderStore() {
    walletValue.textContent = profile.wallet;
    storeGrid.innerHTML = "";

    STORE_ITEMS.forEach((item) => {
      const owned = profile.inventory[item.id] || 0;
      const card = document.createElement("article");
      card.className = "card store-card";
      card.innerHTML = `
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
        <p><strong>Cost:</strong> ${item.cost} coins</p>
        <p><strong>Owned:</strong> ${owned}</p>
      `;

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
      card.className = "card level-card";
      card.innerHTML = `
        <div class="level-card-top">
          <h3>Level ${level.id}: ${level.name}</h3>
          <span class="level-biome">${level.biome}</span>
        </div>
        <p>${level.description}</p>
        <p><strong>Distance:</strong> ${level.length}m</p>
        <p><strong>Difficulty Growth:</strong> ${(level.difficultyGrowth * 100).toFixed(0)}%</p>
      `;

      if (selectedLevel === level.id) card.classList.add("selected");
      card.addEventListener("click", () => {
        selectedLevel = level.id;
        [...levelGrid.children].forEach((child) => child.classList.remove("selected"));
        card.classList.add("selected");
        syncLaunchAction();
      });
      levelGrid.appendChild(card);
    });
    syncLaunchAction();
  }

  function openStore() {
    renderStore();
    switchScreen("store");
  }

  function openLevelSelect(fromScreen) {
    levelBackTarget = fromScreen;
    renderLevelCards();
    switchScreen("level");
  }

  function updateHud(data) {
    const character = FamilyDash.getCharacterById(selectedCharacter);
    hud.innerHTML = `
      <div class="hud-card hud-card-primary"><span>Runner</span><strong>${character ? character.name : "--"}</strong></div>
      <div class="hud-card"><span>Level</span><strong>${data.level}/10</strong></div>
      <div class="hud-card"><span>Health</span><strong>${data.health} / ${data.maxHealth}</strong></div>
      <div class="hud-card"><span>Score</span><strong>${data.score}</strong></div>
      <div class="hud-card"><span>Coins</span><strong>${data.coins}</strong></div>
      <div class="hud-card"><span>Distance</span><strong>${data.distance}m</strong></div>
      <div class="hud-card"><span>Shield</span><strong>${data.shield > 0 ? `${data.shield.toFixed(1)}s` : "Ready"}</strong></div>
      <div class="hud-card"><span>Rush</span><strong>${data.rush > 0 ? `${data.rush.toFixed(1)}s` : "Idle"}</strong></div>
      <div class="hud-card"><span>Status</span><strong>${String(data.status || "").replace(/^./, (charValue) => charValue.toUpperCase())}</strong></div>
      <div class="hud-card"><span>Best</span><strong>${profile.highScore}</strong></div>
    `;
  }

  function showOverlay(title, message, primaryLabel, secondaryLabel, onPrimary, onSecondary, options) {
    const config = options || {};
    const showNamePrompt = Boolean(config.namePrompt);
    const tertiaryLabel = config.tertiaryLabel || "";
    const tertiaryAction = config.tertiaryAction || null;
    const syncNamePrompt = () => {
      if (!showNamePrompt) {
        overlayPrimary.disabled = false;
        return;
      }
      const hasName = Boolean(sanitizePlayerName(overlayNameInput.value));
      overlayPrimary.disabled = Boolean(config.requireName) && !hasName;
    };

    overlayTitle.textContent = title;
    overlayText.textContent = message;
    overlayPrimary.textContent = primaryLabel;
    overlaySecondary.hidden = !secondaryLabel;
    overlaySecondary.textContent = secondaryLabel || "";
    overlayTertiary.hidden = !tertiaryLabel;
    overlayTertiary.textContent = tertiaryLabel;

    overlayNamePrompt.hidden = !showNamePrompt;
    overlayNameInput.value = showNamePrompt ? sanitizePlayerName(config.nameValue || profile.playerName) : "";
    overlayNameHint.textContent = showNamePrompt ? (config.nameHint || "") : "";
    overlayNameInput.oninput = syncNamePrompt;
    overlayNameInput.onkeydown = (event) => {
      if (event.key === "Enter" && !overlayPrimary.disabled) {
        event.preventDefault();
        overlayPrimary.click();
      }
    };

    syncNamePrompt();

    overlayPrimary.onclick = () => {
      const value = showNamePrompt ? sanitizePlayerName(overlayNameInput.value) : undefined;
      if (config.requireName && !value) return;
      if (onPrimary) onPrimary(value);
    };
    overlaySecondary.onclick = secondaryLabel && onSecondary ? onSecondary : null;
    overlayTertiary.onclick = tertiaryLabel && tertiaryAction ? tertiaryAction : null;
    switchScreen("overlay");

    if (showNamePrompt) {
      requestAnimationFrame(() => {
        overlayNameInput.focus();
        overlayNameInput.select();
      });
    }
  }

  function openPauseOverlay() {
    showOverlay(
      "Paused",
      "Take a breath. Tap Resume or press P / Escape to continue.",
      "Resume",
      "Store",
      () => {
        switchScreen("game");
        game.pause();
      },
      () => {
        game.stop();
        openStore();
      }
    );
  }

  function saveMissionResult(result) {
    const playerName = sanitizePlayerName(result.playerName);
    profile.playerName = playerName;
    profile.wallet += result.coins;
    profile.highScore = Math.max(profile.highScore, result.score);
    profile.sessions.push({
      score: result.score,
      playerName,
      character: result.character.name,
      level: result.levelId,
      date: new Date().toLocaleDateString()
    });
    saveProfile();
    renderScoreboard();
  }

  function showMissionOutcomeOverlay(result) {
    const details = `${result.playerName} ran ${Math.floor(result.distance)}m with ${result.character.name}, scored ${result.score}, collected ${result.coins} coins. Wallet: ${profile.wallet}.`;
    if (result.outcome === "win") {
      showOverlay(
        "Level Complete!",
        `${details} Nice work. Keep climbing all 10 levels!`,
        result.levelId < FamilyDash.LEVELS.length ? "Next Level" : "Play Again",
        "Store",
        () => {
          if (result.levelId < FamilyDash.LEVELS.length) {
            selectedLevel = result.levelId + 1;
            startRun();
          } else {
            switchScreen("character");
          }
        },
        () => openStore(),
        result.levelId < FamilyDash.LEVELS.length
          ? {
              tertiaryLabel: "Choose Character",
              tertiaryAction: () => switchScreen("character")
            }
          : null
      );
      return;
    }

    showOverlay(
      "Game Over",
      `${details} Nice effort. Try a store boost before retrying.`,
      "Retry",
      "Store",
      () => startRun(),
      () => openStore(),
      {
        tertiaryLabel: "Choose Character",
        tertiaryAction: () => switchScreen("character")
      }
    );
  }

  function promptForMissionName(result) {
    const acknowledgement = result.outcome === "win"
      ? "Mission complete. Great run. Confirm the name you want saved on the scoreboard."
      : "Mission complete. That run still counts. Confirm the name you want saved on the scoreboard.";
    const hint = profile.playerName
      ? "Edit the saved name if someone else just played, or accept to keep using it for future missions."
      : "Enter a name once and the game will remember it for future missions.";

    showOverlay(
      "Save Your Score",
      acknowledgement,
      "Accept Name",
      "",
      (playerName) => {
        const finalName = sanitizePlayerName(playerName);
        if (!finalName) return;
        saveMissionResult({ ...result, playerName: finalName });
        showMissionOutcomeOverlay({ ...result, playerName: finalName });
      },
      null,
      {
        namePrompt: true,
        requireName: true,
        nameValue: profile.playerName,
        nameHint: hint
      }
    );
  }

  function startRun() {
    const character = FamilyDash.getCharacterById(selectedCharacter);
    const level = FamilyDash.LEVELS.find((entry) => entry.id === selectedLevel);
    if (!character || !level) return;

    if (game) game.stop();
    const runModifiers = consumeRunModifiers();

    renderer.resize && renderer.resize();
    game = new FamilyDash.RunnerGame({
      canvas,
      input,
      renderer,
      audio,
      onHud: updateHud,
      onPause: openPauseOverlay,
      onEnd: ({ outcome, score, coins, distance }) => {
        promptForMissionName({
          outcome,
          score,
          coins,
          distance,
          character,
          levelId: selectedLevel
        });
      }
    });

    switchScreen("game");
    renderer.resize && renderer.resize();
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

  toStoreBtn.addEventListener("click", openStore);
  toLevelFromCharacterBtn.addEventListener("click", () => openLevelSelect("character"));
  toLevelBtn.addEventListener("click", () => openLevelSelect("store"));

  backToStoreBtn.addEventListener("click", () => {
    if (levelBackTarget === "store") {
      openStore();
      return;
    }
    switchScreen("character");
  });

  backToCharactersBtn.addEventListener("click", () => switchScreen("character"));
  launchBtn.addEventListener("click", startRun);

  window.addEventListener("keydown", (event) => {
    if ((event.code === "KeyP" || event.code === "Escape") && screens.game.classList.contains("active") && game && game.state === "paused") {
      switchScreen("game");
      game.pause();
    }
  });

  window.addEventListener("resize", () => renderer.resize && renderer.resize());
  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => renderer.resize && renderer.resize());
    resizeObserver.observe(canvas);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => renderer.resize && renderer.resize());
  }

  if (profile.sessions.length) {
    const best = profile.sessions.reduce((maxValue, session) => Math.max(maxValue, Number(session.score) || 0), profile.highScore || 0);
    profile.highScore = best;
    saveProfile();
  }

  renderScoreboard();
  switchScreen("start");
})();
