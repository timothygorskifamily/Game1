(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});

  class RunnerGame {
    constructor(config) {
      this.canvas = config.canvas;
      this.input = config.input;
      this.renderer = config.renderer;
      this.audio = config.audio;
      this.onEnd = config.onEnd;
      this.onHud = config.onHud;
      this.onJump = config.onJump || function () {};
      this.onPause = config.onPause || function () {};
      this.state = "idle";
      this.lastFrame = 0;
      this.rafId = null;
    }

    comboLevel() {
      return Math.max(0, Math.floor(this.combo || 0));
    }

    comboMultiplier() {
      return 1 + Math.min(1.1, this.comboLevel() * 0.07);
    }

    distanceScoreMultiplier() {
      return 1 + Math.min(0.45, this.comboLevel() * 0.03);
    }

    addCombo(amount, label, scoreValue) {
      if (!amount) return;
      this.combo = Math.max(0, (this.combo || 0) + amount);
      this.comboTimer = Math.max(this.comboTimer || 0, 2.4 + Math.min(1.6, this.combo * 0.06));
      this.bestCombo = Math.max(this.bestCombo || 0, this.comboLevel());
      if (label) this.setHighlight(label, scoreValue);
    }

    breakCombo(label) {
      if ((this.combo || 0) <= 0 && !label) return;
      this.combo = 0;
      this.comboTimer = 0;
      this.coinChain = 0;
      this.coinChainTimer = 0;
      if (label) this.setHighlight(label, 0);
    }

    setHighlight(label, scoreValue) {
      this.highlightLabel = label || "";
      this.highlightScore = Number(scoreValue) || 0;
      this.highlightTimer = label ? 1.6 : 0;
    }

    awardSkillBonus(label, baseScore, comboGain) {
      const safeBase = Math.max(0, Math.round(baseScore || 0));
      if (comboGain) this.addCombo(comboGain);
      const awarded = Math.round(safeBase * this.comboMultiplier() * this.scoreMultiplier);
      this.score += awarded;
      this.bonusScore += awarded;
      this.setHighlight(label, awarded);
      return awarded;
    }

    updateComboState(delta) {
      if (this.comboTimer > 0) {
        this.comboTimer = Math.max(0, this.comboTimer - delta);
      } else if (this.combo > 0) {
        this.combo = Math.max(0, this.combo - delta * 1.8);
      }

      if (this.coinChainTimer > 0) {
        this.coinChainTimer = Math.max(0, this.coinChainTimer - delta);
      } else if (this.coinChain > 0) {
        this.coinChain = 0;
      }

      if (this.highlightTimer > 0) {
        this.highlightTimer = Math.max(0, this.highlightTimer - delta);
        if (this.highlightTimer === 0) {
          this.highlightLabel = "";
          this.highlightScore = 0;
        }
      }
    }

    updateObstacleTelemetry(obstacle, playerHurtbox) {
      const playerLeft = playerHurtbox.x;
      const playerRight = playerHurtbox.x + playerHurtbox.width;
      const playerTop = playerHurtbox.y;
      const playerBottom = playerHurtbox.y + playerHurtbox.height;
      const obstacleRight = obstacle.x + obstacle.width;

      let horizontalGap = 0;
      if (obstacle.x > playerRight) horizontalGap = obstacle.x - playerRight;
      else if (playerLeft > obstacleRight) horizontalGap = playerLeft - obstacleRight;

      const jumpClearance = obstacle.y - playerBottom;
      const slideClearance = playerTop - (obstacle.y + obstacle.height);
      const centerGap = Math.abs((obstacle.x + obstacle.width * 0.5) - (playerLeft + playerHurtbox.width * 0.5));

      obstacle.minHorizontalGap = Math.min(obstacle.minHorizontalGap ?? Infinity, horizontalGap);
      obstacle.minCenterGap = Math.min(obstacle.minCenterGap ?? Infinity, centerGap);
      if (jumpClearance >= 0) obstacle.minJumpClearance = Math.min(obstacle.minJumpClearance ?? Infinity, jumpClearance);
      if (slideClearance >= 0) obstacle.minSlideClearance = Math.min(obstacle.minSlideClearance ?? Infinity, slideClearance);

      if (horizontalGap < 54 || centerGap < obstacle.width) {
        obstacle.recentJumpWindow = obstacle.recentJumpWindow || (this.elapsedTime - this.lastJumpAt <= 0.78);
        obstacle.recentSlideWindow = obstacle.recentSlideWindow || (this.elapsedTime - this.lastSlideAt <= 0.7);
        obstacle.playerWasSliding = obstacle.playerWasSliding || this.player.isSliding;
        obstacle.playerWasAirborne = obstacle.playerWasAirborne || !this.player.isGrounded();
      }
    }

    resolveObstacleClearances() {
      this.obstacles.forEach((obstacle) => {
        if (obstacle.scoredClear || obstacle.x + obstacle.width >= this.player.x - 8) return;
        obstacle.scoredClear = true;
        this.obstaclesCleared += 1;
        this.cleanStreak += 1;
        this.bestCleanStreak = Math.max(this.bestCleanStreak, this.cleanStreak);

        const perfectJump = obstacle.recentJumpWindow &&
          obstacle.playerWasAirborne &&
          Number.isFinite(obstacle.minJumpClearance) &&
          obstacle.minJumpClearance >= 4 &&
          obstacle.minJumpClearance <= 18 &&
          (obstacle.minHorizontalGap ?? Infinity) <= 14;
        const perfectSlide = obstacle.recentSlideWindow &&
          obstacle.playerWasSliding &&
          Number.isFinite(obstacle.minSlideClearance) &&
          obstacle.minSlideClearance >= 4 &&
          obstacle.minSlideClearance <= 18 &&
          (obstacle.minHorizontalGap ?? Infinity) <= 16;
        const closeCall = !perfectJump && !perfectSlide && (
          (Number.isFinite(obstacle.minJumpClearance) && obstacle.minJumpClearance <= 10) ||
          (Number.isFinite(obstacle.minSlideClearance) && obstacle.minSlideClearance <= 10) ||
          (obstacle.minHorizontalGap ?? Infinity) <= 8
        );

        let label = "";
        let baseScore = 0;
        let comboGain = 0;

        if (perfectJump || perfectSlide) {
          this.perfectDodges += 1;
          label = perfectSlide ? "Perfect Slide" : "Perfect Jump";
          baseScore += obstacle.isBoss ? 240 : 95;
          comboGain += obstacle.isBoss ? 4 : 2;
        } else if (closeCall) {
          this.closeCalls += 1;
          label = obstacle.isBoss ? "Boss Near Miss" : "Close Call";
          baseScore += obstacle.isBoss ? 180 : 60;
          comboGain += obstacle.isBoss ? 3 : 1;
        }

        if (this.cleanStreak > 0 && this.cleanStreak % 6 === 0) {
          label = label ? `${label} + Clean ${this.cleanStreak}` : `Clean ${this.cleanStreak}`;
          baseScore += 72 + this.cleanStreak * 2;
          comboGain += 1;
        }

        if (obstacle.isBoss) {
          this.bossDefeated = true;
          label = label ? `${label} + Boss Down` : "Boss Down";
          baseScore += 260;
          comboGain += 3;
        }

        if (baseScore > 0 || comboGain > 0) this.awardSkillBonus(label || "Skill Bonus", baseScore, comboGain);
      });
    }

    finishRun(outcome) {
      const result = {
        outcome,
        score: Math.floor(this.score),
        coins: this.coinsCollected,
        distance: this.distance,
        stats: {
          maxCombo: this.bestCombo,
          closeCalls: this.closeCalls,
          perfectDodges: this.perfectDodges,
          hitsTaken: this.hitsTaken,
          longestCleanStreak: this.bestCleanStreak,
          bestCoinChain: this.bestCoinChain,
          obstacleClears: this.obstaclesCleared,
          bonusScore: this.bonusScore,
          bossDefeated: this.bossDefeated,
          powerupsCollected: this.powerupsCollected
        }
      };
      this.onEnd(result);
      this.stop();
    }

    start(character, level, runModifiers) {
      this.level = level;
      const viewport = this.renderer.getViewport ? this.renderer.getViewport() : { width: this.canvas.width, height: this.canvas.height };
      this.viewport = viewport;
      this.groundY = viewport.height - 74;
      this.player = new FamilyDash.Player(character, viewport.height, this.groundY);
      this.runModifiers = runModifiers || {};
      if (this.runModifiers.startShield) this.player.shieldTimer = 6;
      if (this.runModifiers.extraHeart) { this.player.maxHealth += 1; this.player.health += 1; }
      if (this.runModifiers.speedBoost) this.player.speed += 22;
      if (this.runModifiers.magnetBoost) this.player.magnetBonus = 0.45;
      this.scoreMultiplier = this.runModifiers.scoreBooster ? 1.5 : 1;
      this.coinMultiplier = this.runModifiers.coinDoubler ? 2 : 1;
      if (this.runModifiers.phaseStart) this.player.phaseTimer = 4;
      this.renderer.setLevel(level);
      this.state = "running";
      this.distance = 0;
      this.score = 0;
      this.coinsCollected = 0;
      this.obstacles = [];
      this.coins = [];
      this.powerups = [];
      this.bossEncounter = level.bossEncounter || (FamilyDash.getBossEncounter ? FamilyDash.getBossEncounter(level.id) : null);
      this.bossSpawned = false;
      this.bossActive = false;
      this.animationClock = 0;
      this.elapsedTime = 0;
      this.combo = 0;
      this.comboTimer = 0;
      this.bestCombo = 0;
      this.coinChain = 0;
      this.coinChainTimer = 0;
      this.bestCoinChain = 0;
      this.cleanStreak = 0;
      this.bestCleanStreak = 0;
      this.closeCalls = 0;
      this.perfectDodges = 0;
      this.hitsTaken = 0;
      this.bonusScore = 0;
      this.obstaclesCleared = 0;
      this.powerupsCollected = 0;
      this.lastJumpAt = -999;
      this.lastSlideAt = -999;
      this.highlightLabel = "";
      this.highlightScore = 0;
      this.highlightTimer = 0;
      this.bossDefeated = false;
      this.spawnTimers = { obstacle: 1.15, coin: 0.65, powerup: 6.5 };
      this.lastFrame = performance.now();
      this.loop(this.lastFrame);
    }

    pause() {
      if (this.state === "running") this.state = "paused";
      else if (this.state === "paused") {
        this.state = "running";
        this.lastFrame = performance.now();
        this.loop(this.lastFrame);
      }
    }

    stop() {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.state = "idle";
    }

    currentSpeed() {
      const base = this.player.speed + this.level.baseSpeedBoost;
      const growth = this.level.difficultyGrowth * this.distance;
      return this.player.effectiveSpeed(base + growth);
    }

    spawnObstacle() {
      const pool = this.level.obstaclePool;
      const type = pool[Math.floor(Math.random() * pool.length)];
      const def = FamilyDash.OBSTACLE_DEFS[type];
      const variant = Math.floor(Math.random() * 5);
      const monsterProfile = type === "monster" && FamilyDash.getMonsterProfile
        ? FamilyDash.getMonsterProfile(this.level.biome, variant)
        : null;
      const style = monsterProfile?.style || this.renderer.obstacleTheme(this.level.biome, { type, color: def.color }).style;
      const yBase = this.groundY - def.height;
      const moveSpeed = monsterProfile?.moveSpeed ?? (typeof def.moveSpeed === "function" ? def.moveSpeed(this.level, variant) : (def.moveSpeed || 0));
      const motion = monsterProfile?.motion || (def.flying ? "fly" : "ground");
      const motionHeight = monsterProfile?.motionHeight || 0;
      const motionRate = monsterProfile?.motionRate || 0;
      const motionPhase = Math.random() * Math.PI * 2;
      const baseY = motion === "fly"
        ? yBase - (monsterProfile?.flightOffset || 92) - Math.random() * 22
        : yBase;
      this.obstacles.push({
        type,
        x: this.viewport.width + Math.random() * 120,
        y: motion === "fly" ? baseY : yBase,
        width: def.width,
        height: def.height,
        variant,
        style,
        damage: def.damage,
        kickable: def.kickable,
        color: def.color,
        collisionBoxes: def.collisionBoxes,
        moveSpeed,
        motion,
        motionHeight,
        motionRate,
        motionPhase,
        baseY,
        shadowY: yBase + def.height + 6,
        scoredClear: false,
        minHorizontalGap: Infinity,
        minCenterGap: Infinity,
        minJumpClearance: Infinity,
        minSlideClearance: Infinity,
        recentJumpWindow: false,
        recentSlideWindow: false,
        playerWasSliding: false,
        playerWasAirborne: false
      });
    }

    spawnBossEncounter() {
      if (!this.bossEncounter || this.bossSpawned) return;
      const def = FamilyDash.OBSTACLE_DEFS.boss;
      const encounter = this.bossEncounter;
      const baseY = this.groundY - encounter.height;

      // Clear the lane ahead so the boss reads like a real set piece instead of obstacle overlap.
      this.obstacles = this.obstacles.filter((obj) => obj.x + obj.width < this.player.x - 20);

      this.obstacles.push({
        type: "boss",
        x: this.viewport.width + 140,
        y: baseY,
        width: encounter.width || def.width,
        height: encounter.height || def.height,
        variant: 0,
        style: encounter.style,
        damage: encounter.damage || def.damage,
        kickable: false,
        color: encounter.color || def.color,
        collisionBoxes: def.collisionBoxes,
        moveSpeed: encounter.moveSpeed || 0,
        gapX: encounter.gapX,
        gapY: encounter.gapY,
        gapWidth: encounter.gapWidth,
        gapHeight: encounter.gapHeight,
        bossTier: encounter.tier || "mini",
        isBoss: true,
        shadowY: this.groundY + 10,
        scoredClear: false,
        minHorizontalGap: Infinity,
        minCenterGap: Infinity,
        minJumpClearance: Infinity,
        minSlideClearance: Infinity,
        recentJumpWindow: false,
        recentSlideWindow: false,
        playerWasSliding: false,
        playerWasAirborne: false
      });

      this.bossSpawned = true;
      this.bossActive = true;
      this.spawnTimers.obstacle = Math.max(this.spawnTimers.obstacle, 1.1);
    }

    spawnCoin() {
      const h = 18;
      this.coins.push({
        x: this.viewport.width + Math.random() * 80,
        y: this.groundY - 40 - Math.random() * 80,
        radius: h / 2,
        width: h,
        height: h
      });
    }

    spawnPowerup() {
      const keys = Object.keys(FamilyDash.POWERUP_DEFS);
      const random = keys[Math.floor(Math.random() * keys.length)];
      const def = FamilyDash.POWERUP_DEFS[random];
      this.powerups.push({
        kind: random,
        x: this.viewport.width + Math.random() * 200,
        y: this.groundY - 120 - Math.random() * 80,
        width: 24,
        height: 24,
        color: def.color,
        label: def.label,
        effect: def.effect
      });
    }

    update(delta) {
      this.input.update();
      if (this.input.consumeAction("pausePressed")) {
        this.pause();
        if (this.state === "paused") this.onPause();
        return;
      }
      if (this.state !== "running") return;

      const p = this.player;
      this.elapsedTime += delta;
      this.updateComboState(delta);
      if (this.input.consumeAction("jumpPressed") && p.jump()) {
        this.lastJumpAt = this.elapsedTime;
        this.audio.jump();
        this.onJump();
      }
      if (this.input.actions.slide && p.isGrounded() && !p.isSliding) {
        this.lastSlideAt = this.elapsedTime;
        p.slide();
      }
      p.update(delta, this.input);

      const speed = this.currentSpeed();
      const travel = speed * delta;
      this.distance += travel * 0.1;
      this.score += travel * 0.06 * this.scoreMultiplier * this.distanceScoreMultiplier();
      this.animationClock += delta;

      this.spawnTimers.obstacle -= delta;
      this.spawnTimers.coin -= delta;
      this.spawnTimers.powerup -= delta;

      const bossTriggerDistance = this.bossEncounter ? this.level.length * this.bossEncounter.spawnAt : Infinity;
      const preBossWindow = this.bossEncounter ? 120 : 0;
      const holdObstacleSpawn = this.bossEncounter && (
        this.bossActive ||
        (!this.bossSpawned && this.distance >= bossTriggerDistance - preBossWindow)
      );

      if (this.bossEncounter && !this.bossSpawned && this.distance >= bossTriggerDistance) {
        this.spawnBossEncounter();
      }

      const obstacleCadence = Math.max(0.45, 1.15 - (this.distance / this.level.length) * 0.55);
      if (this.spawnTimers.obstacle <= 0) {
        if (holdObstacleSpawn) {
          this.spawnTimers.obstacle = 0.18;
        } else {
          this.spawnObstacle();
          this.spawnTimers.obstacle = obstacleCadence + Math.random() * 0.45;
        }
      }
      if (this.spawnTimers.coin <= 0) {
        if (Math.random() <= this.level.coinRate) this.spawnCoin();
        this.spawnTimers.coin = 0.3 + Math.random() * 0.45;
      }
      if (this.spawnTimers.powerup <= 0) {
        if (Math.random() <= this.level.powerupRate) this.spawnPowerup();
        this.spawnTimers.powerup = 5 + Math.random() * 4;
      }

      const magnet = (p.character.gameplay.coinMagnet || 1) + (p.magnetBonus || 0);
      const coinBurstBoost = p.coinBurstTimer > 0 ? 1.8 : 1;
      const playerHurtbox = p.hurtbox;
      this.obstacles.forEach((obj) => {
        obj.x -= (speed + (obj.moveSpeed || 0)) * delta;
        if (obj.motion === "hop") {
          obj.motionPhase = (obj.motionPhase || 0) + delta * (obj.motionRate || 4.5);
          obj.y = obj.baseY - Math.max(0, Math.sin(obj.motionPhase)) * (obj.motionHeight || 0);
        } else if (obj.motion === "fly") {
          obj.motionPhase = (obj.motionPhase || 0) + delta * (obj.motionRate || 3.2);
          obj.y = obj.baseY + Math.sin(obj.motionPhase) * (obj.motionHeight || 0);
        }
        this.updateObstacleTelemetry(obj, playerHurtbox);
      });
      this.coins.forEach((coin) => {
        coin.x -= speed * delta;
        if (magnet > 1) {
          const dx = p.x - coin.x;
          const dy = p.y + p.height / 2 - (coin.y + coin.radius);
          const dist = Math.hypot(dx, dy);
          if (dist < 180 * magnet) {
            coin.x += dx * delta * (2.4 * coinBurstBoost);
            coin.y += dy * delta * (2.4 * coinBurstBoost);
          }
        }
      });
      this.powerups.forEach((pw) => { pw.x -= speed * delta; });

      this.handleCollisions();
      this.resolveObstacleClearances();
      this.obstacles = this.obstacles.filter((obj) => obj.x + obj.width > -40);
      this.bossActive = this.obstacles.some((obj) => obj.isBoss);
      this.coins = this.coins.filter((coin) => coin.x + coin.width > -20);
      this.powerups = this.powerups.filter((pw) => pw.x + pw.width > -20);

      const bossCleared = !this.bossEncounter || (this.bossSpawned && !this.bossActive);
      if (this.distance >= this.level.length && bossCleared) {
        this.state = "won";
        this.finishRun("win");
        return;
      }
      if (this.player.health <= 0) {
        this.state = "lost";
        this.finishRun("gameover");
        return;
      }

      this.onHud({
        health: this.player.health,
        maxHealth: this.player.maxHealth,
        score: Math.floor(this.score),
        coins: this.coinsCollected,
        distance: Math.floor(this.distance),
        level: this.level.id,
        status: this.state,
        shield: this.player.shieldTimer,
        rush: this.player.rushTimer,
        phase: this.player.phaseTimer,
        coinBurst: this.player.coinBurstTimer,
        combo: this.comboLevel(),
        comboMultiplier: this.comboMultiplier(),
        coinChain: this.coinChain,
        cleanStreak: this.cleanStreak,
        perfectDodges: this.perfectDodges,
        closeCalls: this.closeCalls,
        elapsedTime: this.elapsedTime,
        skillLabel: this.highlightLabel,
        skillScore: this.highlightScore
      });
    }

    handleCollisions() {
      const playerBox = this.player.hitbox;
      const playerHurtbox = this.player.hurtbox;
      this.obstacles = this.obstacles.filter((obstacle) => {
        if (!FamilyDash.intersects(playerHurtbox, obstacle)) return true;
        if (this.player.character.id === "liam" && Math.random() < (this.player.character.gameplay.techShieldChance || 0)) {
          this.awardSkillBonus("Tech Save", 80, 2);
          return false;
        }
        const gotHit = this.player.applyDamage(obstacle.damage);
        if (gotHit) {
          this.hitsTaken += 1;
          this.cleanStreak = 0;
          this.audio.hit();
          this.breakCombo("Combo Broken");
        }
        return false;
      });

      this.coins = this.coins.filter((coin) => {
        if (!FamilyDash.intersects(playerBox, coin)) return true;
        let coinValue = 1;
        if (this.player.coinBurstTimer > 0) coinValue += 1;
        if (this.player.character.id === "liam") coinValue += 1;
        if (this.player.character.id === "addy" && Math.random() < 0.1) coinValue += 2;
        this.coinsCollected += coinValue;
        this.coinChain = this.coinChainTimer > 0 ? this.coinChain + 1 : 1;
        this.coinChainTimer = 1.2;
        this.bestCoinChain = Math.max(this.bestCoinChain, this.coinChain);
        if (this.coinChain >= 2) this.addCombo(1);
        const chainBonus = this.coinChain >= 2 ? (this.coinChain - 1) * 8 : 0;
        coinValue = Math.round(coinValue * this.coinMultiplier);
        const awarded = Math.round((coinValue * 20 + chainBonus) * this.comboMultiplier() * this.scoreMultiplier);
        this.score += awarded;
        if (this.coinChain >= 4) this.setHighlight(`Coin Chain x${this.coinChain}`, awarded);
        this.audio.coin();
        return false;
      });

      this.powerups = this.powerups.filter((powerup) => {
        if (!FamilyDash.intersects(playerBox, powerup)) return true;
        this.player.applyPowerup(powerup.effect);
        this.powerupsCollected += 1;
        this.addCombo(1, `${powerup.label} Grab`, 0);
        this.audio.powerup();
        return false;
      });
    }

    loop(timestamp) {
      if (this.state !== "running") return;
      const delta = Math.min((timestamp - this.lastFrame) / 1000, 0.033);
      this.lastFrame = timestamp;
      this.update(delta);
      if (this.state !== "running") return;
      this.renderer.render({
        player: this.player,
        obstacles: this.obstacles,
        coins: this.coins,
        powerups: this.powerups,
        distance: this.distance,
        groundY: this.groundY,
        animationClock: this.animationClock
      });
      this.rafId = requestAnimationFrame((t) => this.loop(t));
    }
  }

  FamilyDash.RunnerGame = RunnerGame;
})();
