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

  function switchScreen(name) {
    Object.values(screens).forEach((screen) => screen.classList.remove("active"));
    screens[name].classList.add("active");
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
    scoreList.innerHTML = topRecent
      .map((entry, idx) => {
        const playerName = escapeHtml(entry.playerName || "Player");
        const characterName = escapeHtml(entry.character || "Unknown");
        const dateLabel = escapeHtml(entry.date || "today");
        return `<li>#${idx + 1} ${playerName} - ${entry.score} pts - ${characterName} - L${entry.level || "?"} - ${dateLabel}</li>`;
      })
      .join("");
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

  function syncCharacterActions() {
    const hasSelection = Boolean(selectedCharacter);
    toStoreBtn.disabled = !hasSelection;
    toLevelFromCharacterBtn.disabled = !hasSelection;
  }

  function syncLaunchAction() {
    launchBtn.disabled = !selectedLevel;
  }

  function renderCharacterCards() {
    characterGrid.innerHTML = "";
    const characters = FamilyDash.getCharactersSortedByDifficulty
      ? FamilyDash.getCharactersSortedByDifficulty()
      : FamilyDash.CHARACTERS;

    characters.forEach((character) => {
      const card = document.createElement("article");
      card.className = "card character-card";
      const difficultyTone = character.difficulty?.tone || "medium";
      const difficultyLabel = character.difficulty?.label || "Medium";
      const difficultyNote = character.difficulty?.note || "Solid all-around pick";
      card.innerHTML = `
        <div class="character-card-top">
          <span class="difficulty-badge" data-tone="${difficultyTone}">${difficultyLabel}</span>
          <span class="difficulty-rank">#${character.difficulty?.rank || "?"} by ease</span>
        </div>
        <div class="character-portrait-frame">
          <img class="character-portrait" src="${character.portrait || `assets/characters/${character.id}.svg`}" alt="${character.name} portrait" loading="lazy" />
        </div>
        <h3>${character.name}</h3>
        <p class="character-role"><strong>${character.role}</strong></p>
        <p class="character-difficulty"><strong>Use:</strong> ${difficultyLabel} - ${difficultyNote}</p>
        <p>${character.flavor}</p>
        <p><strong>Strengths:</strong> ${character.strengths}</p>
        <p><strong>Weakness:</strong> ${character.weakness}</p>
        <p><strong>Speed:</strong> ${character.stats.speed}/5</p>
        <p><strong>Jump:</strong> ${character.stats.jump}/5</p>
        <p><strong>Stamina:</strong> ${character.stats.stamina}/5</p>
        <p><strong>Strength:</strong> ${character.stats.strength}/5</p>
        <p><strong>Control:</strong> ${character.stats.control}/5</p>
      `;
      if (selectedCharacter === character.id) {
        card.classList.add("selected");
      }
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
      if (selectedLevel === level.id) {
        card.classList.add("selected");
      }
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
        return;
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
            () => openStore()
          );
        } else {
          showOverlay(
            "Game Over 💥",
            `${details} Try a store boost before retrying.`,
            "Retry",
            "Store",
            () => startRun(),
            () => openStore()
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

  if (profile.sessions.length) {
    const best = profile.sessions.reduce((m, s) => Math.max(m, Number(s.score) || 0), profile.highScore || 0);
    profile.highScore = best;
    saveProfile();
  }
  renderScoreboard();
  switchScreen("start");
})();
