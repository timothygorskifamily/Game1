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
      this.state = "idle";
      this.lastFrame = 0;
      this.rafId = null;
    }

    start(character, level, runModifiers) {
      this.level = level;
      this.groundY = this.canvas.height - 74;
      this.player = new FamilyDash.Player(character, this.canvas.height, this.groundY);
      this.runModifiers = runModifiers || {};
      if (this.runModifiers.startShield) this.player.shieldTimer = 6;
      if (this.runModifiers.extraHeart) { this.player.maxHealth += 1; this.player.health += 1; }
      if (this.runModifiers.speedBoost) this.player.speed += 22;
      if (this.runModifiers.magnetBoost) this.player.magnetBonus = 0.45;
      this.renderer.setLevel(level);
      this.state = "running";
      this.distance = 0;
      this.score = 0;
      this.coinsCollected = 0;
      this.obstacles = [];
      this.coins = [];
      this.powerups = [];
      this.animationClock = 0;
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
      const yBase = this.groundY - def.height;
      this.obstacles.push({
        type,
        x: this.canvas.width + Math.random() * 120,
        y: def.flying ? yBase - 72 - Math.random() * 30 : yBase,
        width: def.width,
        height: def.height,
        damage: def.damage,
        kickable: def.kickable,
        color: def.color
      });
    }

    spawnCoin() {
      const h = 18;
      this.coins.push({
        x: this.canvas.width + Math.random() * 80,
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
        x: this.canvas.width + Math.random() * 200,
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
        return;
      }
      if (this.state !== "running") return;

      const p = this.player;
      if (this.input.consumeAction("jumpPressed") && p.jump()) this.audio.jump();
      if (this.input.actions.slide && p.isGrounded() && !p.isSliding) p.slide();
      if (this.input.consumeAction("kickPressed")) {
        p.kick();
        this.audio.kick();
      }

      p.update(delta, this.input);

      const speed = this.currentSpeed();
      const travel = speed * delta;
      this.distance += travel * 0.1;
      this.score += travel * 0.06;
      this.animationClock += delta;

      this.spawnTimers.obstacle -= delta;
      this.spawnTimers.coin -= delta;
      this.spawnTimers.powerup -= delta;

      const obstacleCadence = Math.max(0.45, 1.15 - (this.distance / this.level.length) * 0.55);
      if (this.spawnTimers.obstacle <= 0) {
        this.spawnObstacle();
        this.spawnTimers.obstacle = obstacleCadence + Math.random() * 0.45;
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
      this.obstacles.forEach((obj) => { obj.x -= speed * delta; });
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
      this.obstacles = this.obstacles.filter((obj) => obj.x + obj.width > -40);
      this.coins = this.coins.filter((coin) => coin.x + coin.width > -20);
      this.powerups = this.powerups.filter((pw) => pw.x + pw.width > -20);

      if (this.distance >= this.level.length) {
        this.state = "won";
        this.onEnd({ outcome: "win", score: Math.floor(this.score), coins: this.coinsCollected, distance: this.distance });
        this.stop();
      }
      if (this.player.health <= 0) {
        this.state = "lost";
        this.onEnd({ outcome: "gameover", score: Math.floor(this.score), coins: this.coinsCollected, distance: this.distance });
        this.stop();
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
        rush: this.player.rushTimer
      });
    }

    handleCollisions() {
      const playerBox = this.player.hitbox;
      this.obstacles = this.obstacles.filter((obstacle) => {
        if (!FamilyDash.intersects(playerBox, obstacle)) return true;
        if (this.player.kickTimer > 0 && obstacle.kickable && this.player.character.gameplay.kickPower >= 2) {
          this.score += 80;
          return false;
        }
        if (this.player.character.id === "liam" && Math.random() < (this.player.character.gameplay.techShieldChance || 0)) {
          return false;
        }
        const gotHit = this.player.applyDamage(obstacle.damage);
        if (gotHit) this.audio.hit();
        return false;
      });

      this.coins = this.coins.filter((coin) => {
        if (!FamilyDash.intersects(playerBox, coin)) return true;
        let coinValue = 1;
        if (this.player.coinBurstTimer > 0) coinValue += 1;
        if (this.player.character.id === "liam") coinValue += 1;
        if (this.player.character.id === "addy" && Math.random() < 0.1) coinValue += 2;
        this.coinsCollected += coinValue;
        this.score += coinValue * 20;
        this.audio.coin();
        return false;
      });

      this.powerups = this.powerups.filter((powerup) => {
        if (!FamilyDash.intersects(playerBox, powerup)) return true;
        this.player.applyPowerup(powerup.effect);
        this.audio.powerup();
        return false;
      });
    }

    loop(timestamp) {
      if (this.state !== "running") return;
      const delta = Math.min((timestamp - this.lastFrame) / 1000, 0.033);
      this.lastFrame = timestamp;
      this.update(delta);
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
