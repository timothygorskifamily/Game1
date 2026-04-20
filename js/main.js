(function () {
  const FamilyDash = window.FamilyDash;
  const body = document.body;
  const appShell = document.querySelector(".app-shell");

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
  const gameStage = document.querySelector(".game-stage");
  const mobileLayoutLabel = document.getElementById("mobileLayoutLabel");
  const mobileScreenTitle = document.getElementById("mobileScreenTitle");
  const mobileStatusStrip = document.getElementById("mobileStatusStrip");
  const mobileStageHud = document.getElementById("mobileStageHud");
  const mobileStageHint = document.querySelector(".mobile-stage-hint");
  const musicTrackName = document.getElementById("musicTrackName");
  const prevTrackBtn = document.getElementById("prevTrackBtn");
  const nextTrackBtn = document.getElementById("nextTrackBtn");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayText = document.getElementById("overlayText");
  const overlayNamePrompt = document.getElementById("overlayNamePrompt");
  const overlayNameInput = document.getElementById("overlayNameInput");
  const overlayNameHint = document.getElementById("overlayNameHint");
  const overlayDetails = document.getElementById("overlayDetails");
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
  input.attachGameplayTap(gameStage, () => detectMobileDevice() && activeScreenName === "game");

  const audio = new FamilyDash.AudioSystem();
  audio.setTrackChangeListener((track, index) => {
    if (!musicTrackName || !track) return;
    const totalTracks = audio.soundtracks?.length || 0;
    const trackNumber = Number.isFinite(index) ? index + 1 : 0;
    musicTrackName.textContent = totalTracks > 0
      ? `${track.name} (${trackNumber} of ${totalTracks})`
      : track.name;
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
  const CHARACTER_MISSIONS = {
    drea: { title: "Lead The Pack", description: "Win 3 runs with Drea.", type: "wins_total", target: 3 },
    tim: { title: "Heat Check", description: "Reach Combo 10 in a single run.", type: "max_combo", target: 10 },
    david: { title: "Clean Boots", description: "Land 8 perfect dodges in one run.", type: "perfects_single_run", target: 8 },
    liam: { title: "Vacuum Mode", description: "Collect 65 coins in one run.", type: "coins_single_run", target: 65 },
    ariel: { title: "Untouchable", description: "Clear any level with no hits.", type: "no_hit_wins", target: 1 },
    addy: { title: "Tiny Menace", description: "Trigger 6 close calls in one run.", type: "close_calls_single_run", target: 6 },
    grandma: { title: "Steady Hands", description: "Reach a clean streak of 18 obstacle clears.", type: "clean_streak_single_run", target: 18 },
    grandpa: { title: "Boss Collector", description: "Earn 2 boss trophies.", type: "boss_trophies", target: 2 }
  };

  let selectedCharacter = null;
  let selectedLevel = null;
  let game = null;
  let levelBackTarget = "store";
  let activeScreenName = "start";
  let viewportSyncFrame = 0;
  const DOUBLE_TAP_WINDOW_MS = 360;
  const quickAdvanceState = {
    character: { id: null, at: 0 },
    level: { id: null, at: 0 }
  };
  const stageHintState = {
    visible: false,
    jumps: 0
  };

  function detectMobileDevice() {
    const width = window.innerWidth || document.documentElement.clientWidth || 0;
    const height = window.innerHeight || document.documentElement.clientHeight || 0;
    const shortestSide = Math.min(width, height);
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
    const touchPrimary = coarsePointer || window.matchMedia("(hover: none)").matches;
    return touchPrimary && (shortestSide <= 1024 || width <= 1180);
  }

  function detectOrientation() {
    const width = window.innerWidth || document.documentElement.clientWidth || 0;
    const height = window.innerHeight || document.documentElement.clientHeight || 0;
    return width >= height ? "landscape" : "portrait";
  }

  function syncViewportMode() {
    const isMobile = detectMobileDevice();
    const orientation = detectOrientation();
    const layoutLabel = isMobile
      ? `${orientation.charAt(0).toUpperCase()}${orientation.slice(1)} touch layout`
      : "Desktop layout";

    document.documentElement.style.setProperty("--app-height", `${window.innerHeight || document.documentElement.clientHeight || 0}px`);
    body.classList.toggle("is-mobile", isMobile);
    body.classList.toggle("is-desktop", !isMobile);
    body.classList.toggle("mobile-portrait", isMobile && orientation === "portrait");
    body.classList.toggle("mobile-landscape", isMobile && orientation === "landscape");
    body.dataset.deviceMode = isMobile ? `mobile-${orientation}` : "desktop";
    if (appShell) appShell.dataset.layout = body.dataset.deviceMode;
    if (mobileLayoutLabel) mobileLayoutLabel.textContent = layoutLabel;
    syncStageHintVisibility();
  }

  function syncScreenChrome(name) {
    activeScreenName = name;
    body.dataset.activeScreen = name;
    body.classList.toggle("game-screen-active", name === "game");
    if (appShell) appShell.dataset.activeScreen = name;

    Object.entries(screens).forEach(([key, screen]) => {
      if (!screen) return;
      screen.setAttribute("aria-hidden", key === name ? "false" : "true");
    });

    const activeScreen = screens[name];
    const mobileTitle = activeScreen?.dataset?.mobileTitle
      || activeScreen?.querySelector("h1, h2")?.textContent
      || "Family Dash";
    if (mobileScreenTitle) mobileScreenTitle.textContent = mobileTitle;
    syncStageHintVisibility();
  }

  function scheduleViewportSync() {
    if (viewportSyncFrame) cancelAnimationFrame(viewportSyncFrame);
    viewportSyncFrame = requestAnimationFrame(() => {
      viewportSyncFrame = 0;
      syncViewportMode();
      syncRendererViewport();
    });
  }

  function syncRendererViewport() {
    if (!renderer || typeof renderer.resize !== "function") return false;
    const resized = renderer.resize();
    if (game && typeof game.handleViewportResize === "function" && typeof renderer.getViewport === "function") {
      game.handleViewportResize(renderer.getViewport());
    }
    return resized;
  }

  function isMobileLandscapeMode() {
    return body.classList.contains("is-mobile") && body.classList.contains("mobile-landscape");
  }

  function syncStageHintVisibility() {
    if (!mobileStageHint) return;
    const shouldShow = stageHintState.visible && isMobileLandscapeMode() && activeScreenName === "game";
    mobileStageHint.hidden = !shouldShow;
    mobileStageHint.setAttribute("aria-hidden", shouldShow ? "false" : "true");
  }

  function dismissStageHint() {
    if (!stageHintState.visible) return;
    stageHintState.visible = false;
    syncStageHintVisibility();
  }

  function resetStageHint() {
    stageHintState.visible = true;
    stageHintState.jumps = 0;
    syncStageHintVisibility();
  }

  function registerStageHintJump() {
    if (!stageHintState.visible) return;
    stageHintState.jumps += 1;
    if (stageHintState.jumps >= 5) dismissStageHint();
  }

  function updateStageHintLifetime(elapsedTime) {
    if (!stageHintState.visible) return;
    if ((Number(elapsedTime) || 0) >= 5) dismissStageHint();
  }

  function resetQuickAdvanceState(group) {
    if (group && quickAdvanceState[group]) {
      quickAdvanceState[group].id = null;
      quickAdvanceState[group].at = 0;
      return;
    }

    Object.values(quickAdvanceState).forEach((state) => {
      state.id = null;
      state.at = 0;
    });
  }

  function handleQuickAdvanceTap(group, itemId, onSelect, onAdvance) {
    const state = quickAdvanceState[group];
    const now = performance.now();
    const repeatedTap = state.id === itemId && now - state.at <= DOUBLE_TAP_WINDOW_MS;

    onSelect();

    if (detectMobileDevice() && repeatedTap) {
      resetQuickAdvanceState(group);
      onAdvance();
      return;
    }

    state.id = itemId;
    state.at = now;
  }

  function bindQuickAdvance(card, group, itemId, onSelect, onAdvance) {
    card.addEventListener("click", () => {
      handleQuickAdvanceTap(group, itemId, onSelect, onAdvance);
    });

    card.addEventListener("dblclick", (event) => {
      if (detectMobileDevice()) return;
      event.preventDefault();
      onSelect();
      resetQuickAdvanceState(group);
      onAdvance();
    });
  }

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
    inventory: readJSON("familyDashInventory", {}),
    progress: readJSON("familyDashProgress", {})
  };

  if (!Array.isArray(profile.sessions)) profile.sessions = [];
  if (typeof profile.inventory !== "object" || Array.isArray(profile.inventory)) profile.inventory = {};
  if (typeof profile.playerName !== "string") profile.playerName = "";

  function normalizeProgress(progress) {
    const source = progress && typeof progress === "object" && !Array.isArray(progress) ? progress : {};
    const levels = source.levels && typeof source.levels === "object" && !Array.isArray(source.levels) ? source.levels : {};
    const bossTrophies = source.bossTrophies && typeof source.bossTrophies === "object" && !Array.isArray(source.bossTrophies) ? source.bossTrophies : {};
    const characterMissions = source.characterMissions && typeof source.characterMissions === "object" && !Array.isArray(source.characterMissions) ? source.characterMissions : {};
    return { levels, bossTrophies, characterMissions };
  }

  profile.progress = normalizeProgress(profile.progress);

  function saveProfile() {
    localStorage.setItem("familyDashHighScore", String(profile.highScore));
    localStorage.setItem("familyDashWallet", String(profile.wallet));
    localStorage.setItem("familyDashPlayerName", profile.playerName);
    localStorage.setItem("familyDashSessions", JSON.stringify(profile.sessions.slice(-25)));
    localStorage.setItem("familyDashInventory", JSON.stringify(profile.inventory));
    localStorage.setItem("familyDashProgress", JSON.stringify(profile.progress));
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

  function getLevelProgress(levelId) {
    const key = String(levelId);
    if (!profile.progress.levels[key] || typeof profile.progress.levels[key] !== "object") {
      profile.progress.levels[key] = { bestStars: 0, bestScore: 0, bestCoins: 0, bestCoinPickups: 0, noHitClear: false, completions: 0 };
    }
    if (!Number.isFinite(Number(profile.progress.levels[key].bestCoinPickups))) profile.progress.levels[key].bestCoinPickups = 0;
    return profile.progress.levels[key];
  }

  function getBossTrophyRoster(levelId) {
    const key = String(levelId);
    if (!profile.progress.bossTrophies[key] || typeof profile.progress.bossTrophies[key] !== "object") {
      profile.progress.bossTrophies[key] = {};
    }
    return profile.progress.bossTrophies[key];
  }

  function hasBossTrophy(levelId, characterId) {
    return Boolean(getBossTrophyRoster(levelId)[characterId]);
  }

  function countBossTrophiesForLevel(levelId) {
    return Object.keys(getBossTrophyRoster(levelId)).length;
  }

  function countBossTrophiesForCharacter(characterId) {
    return Object.values(profile.progress.bossTrophies).reduce((count, roster) => count + (roster && roster[characterId] ? 1 : 0), 0);
  }

  function getCharacterMission(characterId) {
    return CHARACTER_MISSIONS[characterId] || null;
  }

  function getMissionRecord(characterId) {
    if (!profile.progress.characterMissions[characterId] || typeof profile.progress.characterMissions[characterId] !== "object") {
      profile.progress.characterMissions[characterId] = { value: 0, completed: false };
    }
    return profile.progress.characterMissions[characterId];
  }

  function getMissionStatus(characterId) {
    const mission = getCharacterMission(characterId);
    if (!mission) return null;
    const record = getMissionRecord(characterId);
    const rawValue = mission.type === "boss_trophies" ? countBossTrophiesForCharacter(characterId) : Number(record.value) || 0;
    const value = Math.min(mission.target, rawValue);
    const completed = record.completed || value >= mission.target;
    record.value = value;
    record.completed = completed;
    return { ...mission, value, completed };
  }

  function getLevelCoinTotal(level) {
    const configuredTotal = Number(level?.totalCoins);
    if (Number.isFinite(configuredTotal) && configuredTotal > 0) return Math.round(configuredTotal);
    return (18 + (Number(level?.id) || 0) * 6) * 2;
  }

  function getLevelCoinGoal(level) {
    return Math.ceil(getLevelCoinTotal(level) * 0.3);
  }

  function getCoinPickupCount(result) {
    return Math.max(0, Number(result?.stats?.coinPickups) || 0);
  }

  function isLevelUnlocked(levelId) {
    if (levelId <= 1) return true;
    const previousLevel = FamilyDash.LEVELS.find((entry) => entry.id === levelId - 1);
    if (!previousLevel) return false;
    return (getLevelProgress(previousLevel.id).bestCoinPickups || 0) >= getLevelCoinGoal(previousLevel);
  }

  function getHighestUnlockedLevelId() {
    return FamilyDash.LEVELS.reduce((highestLevelId, level) => (isLevelUnlocked(level.id) ? level.id : highestLevelId), 1);
  }

  function getNextLevelUnlockStatus(levelId) {
    const currentLevel = FamilyDash.LEVELS.find((entry) => entry.id === levelId);
    const nextLevel = FamilyDash.LEVELS.find((entry) => entry.id === levelId + 1);
    if (!currentLevel || !nextLevel) return null;

    const totalCoins = getLevelCoinTotal(currentLevel);
    const requiredCoins = getLevelCoinGoal(currentLevel);
    const bestCoinPickups = Math.max(0, Number(getLevelProgress(currentLevel.id).bestCoinPickups) || 0);

    return {
      currentLevelId: currentLevel.id,
      nextLevelId: nextLevel.id,
      totalCoins,
      requiredCoins,
      progressCoins: Math.min(totalCoins, bestCoinPickups),
      remainingCoins: Math.max(0, requiredCoins - bestCoinPickups),
      unlocked: isLevelUnlocked(nextLevel.id)
    };
  }

  function evaluateLevelGoals(level, result) {
    const coinGoal = getLevelCoinGoal(level);
    const cleared = result.outcome === "win";
    const noHit = cleared && (result.stats?.hitsTaken || 0) === 0;
    const coinGoalMet = cleared && getCoinPickupCount(result) >= coinGoal;
    const goals = [
      { id: "clear", label: "Finish level", complete: cleared },
      { id: "coins", label: `Collect ${coinGoal}/${getLevelCoinTotal(level)} coins`, complete: coinGoalMet },
      { id: "noHit", label: "No-hit clear", complete: noHit }
    ];
    const stars = goals.reduce((count, goal) => count + (goal.complete ? 1 : 0), 0);
    return { coinGoal, goals, stars, noHit, coinGoalMet };
  }

  function renderStarsMarkup(stars, maxStars) {
    return Array.from({ length: maxStars }, (_, index) => `<span class="star ${index < stars ? "fill" : ""}">★</span>`).join("");
  }

  function renderMissionMarkup(characterId) {
    const mission = getMissionStatus(characterId);
    if (!mission) return "";
    return `
      <div class="mission-summary ${mission.completed ? "complete" : ""}">
        <div class="mission-summary-top">
          <strong>${escapeHtml(mission.title)}</strong>
          <span class="mission-badge">${mission.completed ? "Complete" : `${mission.value}/${mission.target}`}</span>
        </div>
        <p>${escapeHtml(mission.description)}</p>
      </div>
    `;
  }

  function switchScreen(name) {
    Object.values(screens).forEach((screen) => screen.classList.remove("active"));
    screens[name].classList.add("active");
    resetQuickAdvanceState();
    syncScreenChrome(name);
    window.scrollTo(0, 0);
    scheduleViewportSync();
    if (name === "game") requestAnimationFrame(() => syncRendererViewport());
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
    launchBtn.disabled = !selectedLevel || !isLevelUnlocked(selectedLevel);
  }

  function statMeter(value) {
    return Array.from({ length: 5 }, (_, index) => `<span class="stat-segment ${index < value ? "fill" : ""}"></span>`).join("");
  }

  function getPortraitSrc(character) {
    return character?.portrait || `assets/characters/${character?.id}.svg`;
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
          <img class="character-portrait" src="${getPortraitSrc(character)}" alt="${character.name} portrait" loading="lazy" />
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
        ${renderMissionMarkup(character.id)}
      `;

      if (selectedCharacter === character.id) card.classList.add("selected");
      bindQuickAdvance(
        card,
        "character",
        character.id,
        () => {
          selectedCharacter = character.id;
          [...characterGrid.children].forEach((child) => child.classList.remove("selected"));
          card.classList.add("selected");
          syncCharacterActions();
        },
        () => openLevelSelect("character")
      );
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
    if (!selectedLevel || !isLevelUnlocked(selectedLevel)) selectedLevel = getHighestUnlockedLevelId();

    FamilyDash.LEVELS.forEach((level) => {
      const progress = getLevelProgress(level.id);
      const unlocked = isLevelUnlocked(level.id);
      const coinGoal = getLevelCoinGoal(level);
      const coinTotal = getLevelCoinTotal(level);
      const goalStates = [
        { label: "Clear", complete: progress.completions > 0 },
        { label: `${coinGoal}/${coinTotal} Coins`, complete: progress.bestCoinPickups >= coinGoal },
        { label: "No Hit", complete: progress.noHitClear }
      ];
      const trophyCount = level.bossEncounter ? countBossTrophiesForLevel(level.id) : 0;
      const selectedCharacterHasTrophy = selectedCharacter ? hasBossTrophy(level.id, selectedCharacter) : false;
      const nextLevelUnlockStatus = getNextLevelUnlockStatus(level.id);
      const previousLevel = level.id > 1 ? FamilyDash.LEVELS.find((entry) => entry.id === level.id - 1) : null;
      const previousLevelProgress = previousLevel ? getLevelProgress(previousLevel.id) : null;
      const lockedProgress = previousLevel
        ? Math.min(getLevelCoinTotal(previousLevel), previousLevelProgress?.bestCoinPickups || 0)
        : 0;
      const unlockCopy = unlocked
        ? (nextLevelUnlockStatus
            ? `<p class="level-progress-copy level-unlock-copy"><strong>Unlock Level ${nextLevelUnlockStatus.nextLevelId}:</strong> ${Math.min(coinTotal, progress.bestCoinPickups || 0)}/${coinTotal} coins picked. Need ${nextLevelUnlockStatus.requiredCoins}.</p>`
            : `<p class="level-progress-copy level-unlock-copy"><strong>Final Stage:</strong> This level is already unlocked.</p>`)
        : `<p class="level-progress-copy level-lock-note"><strong>Locked:</strong> Collect ${lockedProgress}/${getLevelCoinTotal(previousLevel)} coins in Level ${previousLevel.id}. Need ${getLevelCoinGoal(previousLevel)} to unlock this stage.</p>`;
      const card = document.createElement("article");
      card.className = `card level-card${unlocked ? "" : " locked"}`;
      card.setAttribute("aria-disabled", unlocked ? "false" : "true");
      card.innerHTML = `
        <div class="level-card-top">
          <h3>Level ${level.id}: ${level.name}</h3>
          <span class="level-biome">${level.biome}</span>
        </div>
        <div class="level-stars">${renderStarsMarkup(progress.bestStars || 0, 3)}</div>
        <p>${level.description}</p>
        <p><strong>Distance:</strong> ${level.length}m</p>
        <p><strong>Difficulty Growth:</strong> ${(level.difficultyGrowth * 100).toFixed(0)}%</p>
        <div class="level-goals">
          ${goalStates.map((goal) => `<span class="goal-pill ${goal.complete ? "complete" : ""}">${goal.complete ? "Done" : "Open"}: ${goal.label}</span>`).join("")}
        </div>
        <p class="level-progress-copy"><strong>Best Score:</strong> ${progress.bestScore || 0}</p>
        <p class="level-progress-copy"><strong>Best Coin Route:</strong> ${Math.min(coinTotal, progress.bestCoinPickups || 0)}/${coinTotal}</p>
        ${unlockCopy}
        ${level.bossEncounter ? `<p class="level-progress-copy"><strong>Boss Trophies:</strong> ${trophyCount}/${FamilyDash.CHARACTERS.length}${selectedCharacter ? ` • ${selectedCharacterHasTrophy ? "selected runner earned one" : "selected runner still missing one"}` : ""}</p>` : ""}
      `;

      if (selectedLevel === level.id) card.classList.add("selected");
      if (unlocked) {
        bindQuickAdvance(
          card,
          "level",
          level.id,
          () => {
            selectedLevel = level.id;
            [...levelGrid.children].forEach((child) => child.classList.remove("selected"));
            card.classList.add("selected");
            syncLaunchAction();
          },
          () => startRun()
        );
      }
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
    updateStageHintLifetime(data.elapsedTime);
    const character = FamilyDash.getCharacterById(selectedCharacter);
    const activeBuffs = [];
    if (data.shield > 0) activeBuffs.push(`Shield ${data.shield.toFixed(1)}s`);
    if (data.rush > 0) activeBuffs.push(`Rush ${data.rush.toFixed(1)}s`);
    if (data.phase > 0) activeBuffs.push(`Phase ${data.phase.toFixed(1)}s`);
    if (data.coinBurst > 0) activeBuffs.push(`Coin+ ${data.coinBurst.toFixed(1)}s`);
    const skillText = data.skillLabel
      ? `${escapeHtml(data.skillLabel)}${data.skillScore > 0 ? ` +${data.skillScore}` : ""}`
      : "Build combo with coins, close calls, and perfect reads";
    const statusText = String(data.status || "").replace(/^./, (charValue) => charValue.toUpperCase());
    const runnerMarkup = character
      ? `
        <div class="hud-runner">
          <div class="hud-runner-portrait-frame">
            <img class="hud-runner-portrait" src="${getPortraitSrc(character)}" alt="${escapeHtml(character.name)} portrait" loading="eager" />
          </div>
          <div class="hud-runner-copy">
            <span>Runner</span>
            <strong>${escapeHtml(character.name)}</strong>
          </div>
        </div>
      `
      : `
        <span>Runner</span>
        <strong>--</strong>
      `;
    if (mobileStatusStrip) {
      if (isMobileLandscapeMode()) {
        mobileStatusStrip.innerHTML = "";
      } else {
        const mobileStats = [
          { label: "Runner", value: character?.name || "--" },
          { label: "HP", value: `${data.health} / ${data.maxHealth}` },
          { label: "Score", value: String(data.score) },
          { label: "Coins", value: String(data.coins) },
          { label: "Distance", value: `${data.distance}m` },
          { label: "Combo", value: `x${data.comboMultiplier.toFixed(2)}` },
          { label: "State", value: activeBuffs[0] || statusText }
        ];

        mobileStatusStrip.innerHTML = mobileStats
          .map((stat) => `
            <div class="mobile-status-chip">
              <span>${escapeHtml(stat.label)}</span>
              <strong>${escapeHtml(stat.value)}</strong>
            </div>
          `)
          .join("");
      }
    }
    if (mobileStageHud) {
      mobileStageHud.innerHTML = isMobileLandscapeMode()
        ? [
            { label: "HP", value: `${data.health}/${data.maxHealth}` },
            { label: "Coins", value: String(data.coins) },
            { label: "Distance", value: `${data.distance}m` }
          ]
            .map((stat) => `
              <div class="mobile-stage-chip">
                <span>${escapeHtml(stat.label)}</span>
                <strong>${escapeHtml(stat.value)}</strong>
              </div>
            `)
            .join("")
        : "";
    }
    hud.innerHTML = `
      <div class="hud-card hud-card-primary">${runnerMarkup}</div>
      <div class="hud-card"><span>Level</span><strong>${data.level}/10</strong></div>
      <div class="hud-card"><span>Health</span><strong>${data.health} / ${data.maxHealth}</strong></div>
      <div class="hud-card"><span>Score</span><strong>${data.score}</strong></div>
      <div class="hud-card"><span>Coins</span><strong>${data.coins}</strong></div>
      <div class="hud-card"><span>Distance</span><strong>${data.distance}m</strong></div>
      <div class="hud-card hud-card-accent"><span>Combo</span><strong>x${data.comboMultiplier.toFixed(2)}</strong><div class="hud-subtext">${data.combo > 0 ? `${data.combo} combo built` : "No combo yet"}</div></div>
      <div class="hud-card"><span>Coin Chain</span><strong>${Math.max(1, data.coinChain || 0)}x</strong><div class="hud-subtext">Keep coins flowing to keep the chain alive</div></div>
      <div class="hud-card"><span>Clean Streak</span><strong>${data.cleanStreak || 0}</strong><div class="hud-subtext">${data.perfectDodges || 0} perfect • ${data.closeCalls || 0} close calls</div></div>
      <div class="hud-card"><span>Powerups</span><strong>${activeBuffs.length ? activeBuffs[0] : "Idle"}</strong><div class="hud-subtext">${activeBuffs.length > 1 ? activeBuffs.slice(1).join(" • ") : activeBuffs.length ? "Stack active" : "No active effects"}</div></div>
      <div class="hud-card"><span>Skill Feed</span><strong>${skillText}</strong></div>
      <div class="hud-card"><span>Status</span><strong>${statusText}</strong></div>
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
    overlayDetails.hidden = !config.detailsHtml;
    overlayDetails.innerHTML = config.detailsHtml || "";

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

    if (typeof config.afterRender === "function") {
      requestAnimationFrame(() => config.afterRender());
    }

    if (showNamePrompt) {
      requestAnimationFrame(() => {
        overlayNameInput.focus();
        overlayNameInput.select();
      });
    }
  }

  function buildPauseSoundtrackDetails() {
    const trackLabel = escapeHtml(musicTrackName?.textContent || "Stand By");
    return `
      <div class="overlay-detail-block pause-soundtrack-block">
        <strong>Soundtrack</strong>
        <div class="pause-soundtrack-panel">
          <span class="pause-soundtrack-name">${trackLabel}</span>
          <div class="pause-soundtrack-controls">
            <button type="button" data-track-nav="prev">Prev</button>
            <button type="button" data-track-nav="next">Next</button>
          </div>
        </div>
      </div>
    `;
  }

  function bindPauseSoundtrackControls() {
    const panel = overlayDetails.querySelector(".pause-soundtrack-panel");
    if (!panel) return;

    const trackNameLabel = panel.querySelector(".pause-soundtrack-name");
    const syncTrackLabel = () => {
      if (trackNameLabel) trackNameLabel.textContent = musicTrackName?.textContent || "Stand By";
    };

    panel.querySelectorAll("[data-track-nav]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.trackNav === "prev") audio.previousTrack();
        if (button.dataset.trackNav === "next") audio.nextTrack();
        syncTrackLabel();
      });
    });

    syncTrackLabel();
  }

  function openPauseOverlay() {
    input.clearPauseActions();
    showOverlay(
      "Paused",
      "Take a breath. Tap Resume or press P, M, or Esc to continue.",
      "Resume",
      "Home",
      () => {
        switchScreen("game");
        game.pause();
      },
      () => {
        game.stop();
        renderScoreboard();
        switchScreen("start");
      },
      {
        detailsHtml: buildPauseSoundtrackDetails(),
        afterRender: bindPauseSoundtrackControls,
        tertiaryLabel: "Store",
        tertiaryAction: () => {
          game.stop();
          openStore();
        }
      }
    );
  }

  function isPausedGameScreenOpen() {
    return screens.game.classList.contains("active") && game && game.state === "paused";
  }

  function isPausedOverlayOpen() {
    return screens.overlay.classList.contains("active") && game && game.state === "paused";
  }

  function resumePausedGame() {
    if (!game || game.state !== "paused") return;
    input.clearPauseActions();
    switchScreen("game");
    game.pause();
  }

  function saveMissionResult(result) {
    const playerName = sanitizePlayerName(result.playerName);
    const level = FamilyDash.LEVELS.find((entry) => entry.id === result.levelId);
    const goalSummary = evaluateLevelGoals(level, result);
    const levelProgress = getLevelProgress(result.levelId);
    const previousBestStars = levelProgress.bestStars || 0;
    const levelStarsImproved = goalSummary.stars > previousBestStars;
    levelProgress.bestStars = Math.max(levelProgress.bestStars || 0, goalSummary.stars);
    levelProgress.bestScore = Math.max(levelProgress.bestScore || 0, result.score);
    levelProgress.bestCoins = Math.max(levelProgress.bestCoins || 0, result.coins);
    levelProgress.bestCoinPickups = Math.max(levelProgress.bestCoinPickups || 0, getCoinPickupCount(result));
    levelProgress.noHitClear = Boolean(levelProgress.noHitClear || goalSummary.noHit);
    if (result.outcome === "win") levelProgress.completions = (levelProgress.completions || 0) + 1;

    let bossTrophyEarned = false;
    if (level?.bossEncounter && result.outcome === "win" && result.stats?.bossDefeated) {
      const roster = getBossTrophyRoster(result.levelId);
      bossTrophyEarned = !roster[result.character.id];
      roster[result.character.id] = true;
    }

    const mission = getCharacterMission(result.character.id);
    const missionRecord = mission ? getMissionRecord(result.character.id) : null;
    let missionValue = missionRecord ? Number(missionRecord.value) || 0 : 0;
    if (mission && missionRecord) {
      switch (mission.type) {
        case "wins_total":
          if (result.outcome === "win") missionValue += 1;
          break;
        case "max_combo":
          missionValue = Math.max(missionValue, result.stats?.maxCombo || 0);
          break;
        case "perfects_single_run":
          missionValue = Math.max(missionValue, result.stats?.perfectDodges || 0);
          break;
        case "coins_single_run":
          missionValue = Math.max(missionValue, result.coins || 0);
          break;
        case "no_hit_wins":
          if (goalSummary.noHit) missionValue += 1;
          break;
        case "close_calls_single_run":
          missionValue = Math.max(missionValue, result.stats?.closeCalls || 0);
          break;
        case "clean_streak_single_run":
          missionValue = Math.max(missionValue, result.stats?.longestCleanStreak || 0);
          break;
        case "boss_trophies":
          missionValue = countBossTrophiesForCharacter(result.character.id);
          break;
        default:
          break;
      }
      const missionCompletedBefore = Boolean(missionRecord.completed);
      missionRecord.value = Math.min(mission.target, missionValue);
      missionRecord.completed = missionRecord.value >= mission.target;
      missionRecord.justCompleted = !missionCompletedBefore && missionRecord.completed;
    }

    profile.playerName = playerName;
    profile.wallet += result.coins;
    profile.highScore = Math.max(profile.highScore, result.score);
    profile.sessions.push({
      score: result.score,
      playerName,
      character: result.character.name,
      level: result.levelId,
      date: new Date().toLocaleDateString(),
      stars: goalSummary.stars
    });
    saveProfile();
    renderScoreboard();
    const nextLevelUnlockStatus = getNextLevelUnlockStatus(result.levelId);
    return {
      playerName,
      goalSummary,
      levelStarsImproved,
      bossTrophyEarned,
      nextLevelUnlockStatus,
      missionStatus: mission ? getMissionStatus(result.character.id) : null,
      missionJustCompleted: Boolean(missionRecord && missionRecord.justCompleted)
    };
  }

  function showMissionOutcomeOverlay(result, progression) {
    const starsMarkup = renderStarsMarkup(progression.goalSummary.stars, 3);
    const missionStatus = progression.missionStatus;
    const level = FamilyDash.LEVELS.find((entry) => entry.id === result.levelId);
    const coinPickups = getCoinPickupCount(result);
    const nextLevelUnlockStatus = progression.nextLevelUnlockStatus;
    const detailsHtml = `
      <div class="overlay-stats-grid">
        <div class="overlay-stat-card"><span>Stars</span><strong>${starsMarkup}</strong></div>
        <div class="overlay-stat-card"><span>Coin Route</span><strong>${coinPickups}/${getLevelCoinTotal(level)}</strong></div>
        <div class="overlay-stat-card"><span>Best Combo</span><strong>x${result.stats?.maxCombo || 0}</strong></div>
        <div class="overlay-stat-card"><span>Perfects</span><strong>${result.stats?.perfectDodges || 0}</strong></div>
        <div class="overlay-stat-card"><span>Close Calls</span><strong>${result.stats?.closeCalls || 0}</strong></div>
      </div>
      <div class="overlay-detail-block">
        <strong>Level Goals</strong>
        <div class="overlay-goals">${progression.goalSummary.goals.map((goal) => `<span class="goal-pill ${goal.complete ? "complete" : ""}">${goal.complete ? "Done" : "Open"}: ${escapeHtml(goal.label)}</span>`).join("")}</div>
      </div>
      ${nextLevelUnlockStatus ? `<div class="overlay-detail-block"><strong>${nextLevelUnlockStatus.unlocked ? `Level ${nextLevelUnlockStatus.nextLevelId} Unlocked` : `Level ${nextLevelUnlockStatus.nextLevelId} Locked`}</strong><p>${nextLevelUnlockStatus.unlocked ? `You reached ${nextLevelUnlockStatus.progressCoins}/${nextLevelUnlockStatus.totalCoins} coins in Level ${nextLevelUnlockStatus.currentLevelId}, so the next level is ready.` : `Best route so far: ${nextLevelUnlockStatus.progressCoins}/${nextLevelUnlockStatus.totalCoins} coins in Level ${nextLevelUnlockStatus.currentLevelId}. Need ${nextLevelUnlockStatus.remainingCoins} more to unlock Level ${nextLevelUnlockStatus.nextLevelId}.`}</p></div>` : ""}
      ${progression.levelStarsImproved ? `<div class="overlay-detail-block"><strong>New Star Record</strong><p>This run set a new best star rating for the level.</p></div>` : ""}
      ${progression.bossTrophyEarned ? `<div class="overlay-detail-block"><strong>Boss Trophy Earned</strong><p>${escapeHtml(result.character.name)} claimed this level's boss trophy.</p></div>` : ""}
      ${missionStatus ? `<div class="overlay-detail-block"><strong>Character Mission</strong><p>${escapeHtml(missionStatus.title)} • ${missionStatus.value}/${missionStatus.target}${progression.missionJustCompleted ? " • Completed!" : ""}</p></div>` : ""}
    `;
    const details = `${result.playerName} ran ${Math.floor(result.distance)}m with ${result.character.name}, scored ${result.score}, collected ${result.coins} coins. Wallet: ${profile.wallet}.`;
    const canAdvanceToNextLevel = Boolean(result.levelId < FamilyDash.LEVELS.length && nextLevelUnlockStatus?.unlocked);
    if (result.outcome === "win") {
      showOverlay(
        "Level Complete!",
        `${details} Nice work. Keep climbing all 10 levels!`,
        canAdvanceToNextLevel ? "Next Level" : "Play Again",
        "Store",
        () => {
          if (canAdvanceToNextLevel) {
            selectedLevel = result.levelId + 1;
            startRun();
          } else {
            startRun();
          }
        },
        () => openStore(),
        result.levelId < FamilyDash.LEVELS.length
          ? {
              detailsHtml,
              tertiaryLabel: canAdvanceToNextLevel ? "Choose Character" : "Choose Level",
              tertiaryAction: () => {
                if (canAdvanceToNextLevel) switchScreen("character");
                else openLevelSelect("character");
              }
            }
          : { detailsHtml }
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
        detailsHtml,
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
        const progression = saveMissionResult({ ...result, playerName: finalName });
        showMissionOutcomeOverlay({ ...result, playerName: finalName }, progression);
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
    if (!character || !level || !isLevelUnlocked(level.id)) return;

    if (game) game.stop();
    const runModifiers = consumeRunModifiers();

    syncRendererViewport();
    game = new FamilyDash.RunnerGame({
      canvas,
      input,
      renderer,
      audio,
      onHud: updateHud,
      onJump: registerStageHintJump,
      onPauseMenu: openPauseOverlay,
      onEnd: ({ outcome, score, coins, distance, stats }) => {
        promptForMissionName({
          outcome,
          score,
          coins,
          distance,
          stats,
          character,
          levelId: selectedLevel
        });
      }
    });

    resetStageHint();
    switchScreen("game");
    syncRendererViewport();
    updateHud({
      health: character.gameplay.maxHealth,
      maxHealth: character.gameplay.maxHealth,
      score: 0,
      coins: 0,
      distance: 0,
      level: level.id,
      status: "running",
      shield: 0,
      rush: 0,
      phase: 0,
      coinBurst: 0,
      combo: 0,
      comboMultiplier: 1,
      coinChain: 0,
      cleanStreak: 0,
      perfectDodges: 0,
      closeCalls: 0,
      elapsedTime: 0,
      skillLabel: "",
      skillScore: 0
    });
    game.start(character, level, runModifiers);
  }

  function activateAudio() {
    audio.startMusic();
  }

  if (prevTrackBtn) {
    prevTrackBtn.addEventListener("click", () => {
      audio.previousTrack();
    });
  }

  if (nextTrackBtn) {
    nextTrackBtn.addEventListener("click", () => {
      audio.nextTrack();
    });
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
    if (event.repeat) return;

    if (event.code === "KeyP" && (isPausedGameScreenOpen() || isPausedOverlayOpen())) {
      event.preventDefault();
      resumePausedGame();
      return;
    }

    if ((event.code === "KeyM" || event.code === "Escape") && isPausedGameScreenOpen()) {
      event.preventDefault();
      openPauseOverlay();
      return;
    }

    if ((event.code === "KeyM" || event.code === "Escape") && isPausedOverlayOpen()) {
      event.preventDefault();
      resumePausedGame();
    }
  });

  window.addEventListener("resize", () => {
    scheduleViewportSync();
    syncRendererViewport();
  });
  window.addEventListener("orientationchange", scheduleViewportSync);
  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => syncRendererViewport());
    resizeObserver.observe(canvas);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => syncRendererViewport());
  }
  [window.matchMedia("(pointer: coarse)"), window.matchMedia("(hover: none)")].forEach((mediaQuery) => {
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", scheduleViewportSync);
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(scheduleViewportSync);
    }
  });

  if (profile.sessions.length) {
    const best = profile.sessions.reduce((maxValue, session) => Math.max(maxValue, Number(session.score) || 0), profile.highScore || 0);
    profile.highScore = best;
    saveProfile();
  }

  syncViewportMode();
  renderScoreboard();
  switchScreen("start");
})();
