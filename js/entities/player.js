(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});

  class Player {
    constructor(character, canvasHeight, groundY) {
      this.character = character;
      this.sizeScale = character.gameplay.sizeScale || 1;
      this.width = Math.max(18, Math.round(56 * this.sizeScale));
      this.baseHeight = Math.max(26, Math.round(82 * this.sizeScale));
      this.height = this.baseHeight;
      this.x = 130;
      this.y = groundY - this.height;
      this.groundY = groundY;
      this.velocityY = 0;
      this.gravity = 1600;
      this.isSliding = false;
      this.slideTimer = 0;
      this.shieldTimer = 0;
      this.rushTimer = 0;
      this.invincibleFrames = 0;
      this.coinBurstTimer = 0;
      this.phaseTimer = 0;
      this.magnetBonus = 0;
      this.canvasHeight = canvasHeight;
      this.speed = character.gameplay.baseSpeed;
      this.jumpPower = character.gameplay.jumpPower;
      this.maxHealth = character.gameplay.maxHealth;
      this.health = this.maxHealth;
      this.chaosWobble = 0;
    }

    get hitbox() {
      const scale = this.character.gameplay.hitboxScale || 1;
      const width = this.width * scale;
      const height = this.height * scale;
      return { x: this.x + (this.width - width) / 2, y: this.y + (this.height - height) / 2, width, height };
    }

    isGrounded() { return this.y >= this.groundY - this.height - 0.2; }

    jump() {
      if (!this.isGrounded()) return false;
      this.velocityY = -this.jumpPower;
      return true;
    }

    slide() {
      if (!this.isGrounded()) return;
      this.isSliding = true;
      this.slideTimer = 0.45;
      this.height = Math.max(16, Math.round(this.baseHeight * 0.65));
      this.y = this.groundY - this.height;
    }


    applyDamage(amount) {
      if (this.invincibleFrames > 0 || this.shieldTimer > 0 || this.phaseTimer > 0) return false;
      this.health -= amount;
      this.invincibleFrames = 0.9;
      return true;
    }

    applyPowerup(effect) {
      if (effect === "heal") this.health = Math.min(this.maxHealth, this.health + 1);
      if (effect === "shield") this.shieldTimer = 5;
      if (effect === "rush") this.rushTimer = 4;
      if (effect === "boost") this.rushTimer = Math.max(this.rushTimer, 7);
      if (effect === "coinBurst") this.coinBurstTimer = 7;
      if (effect === "phase") this.phaseTimer = 4;
      if (effect === "megaHeal") this.health = Math.min(this.maxHealth, this.health + 2);
      if (effect === "magnet") this.magnetBonus = Math.max(this.magnetBonus, 0.8);
    }

    update(delta, input) {
      this.velocityY += this.gravity * delta;
      this.y += this.velocityY * delta;
      if (this.y > this.groundY - this.height) {
        this.y = this.groundY - this.height;
        this.velocityY = 0;
      }
      if (this.slideTimer > 0) {
        this.slideTimer -= delta;
        if (this.slideTimer <= 0 || !input.actions.slide) {
          this.isSliding = false;
          this.height = this.baseHeight;
          this.y = this.groundY - this.height;
        }
      }
      if (this.character.gameplay.chaosMode) {
        this.chaosWobble += delta * 20;
        this.y += Math.sin(this.chaosWobble) * 0.8;
      }
      this.shieldTimer = Math.max(0, this.shieldTimer - delta);
      this.rushTimer = Math.max(0, this.rushTimer - delta);
      this.invincibleFrames = Math.max(0, this.invincibleFrames - delta);
      this.coinBurstTimer = Math.max(0, this.coinBurstTimer - delta);
      this.phaseTimer = Math.max(0, this.phaseTimer - delta);
      if (this.magnetBonus > 0) this.magnetBonus = Math.max(0, this.magnetBonus - delta * 0.08);
    }

    effectiveSpeed(levelSpeed) {
      const rush = this.rushTimer > 0 ? 60 : 0;
      const chaos = this.character.gameplay.chaosMode ? Math.sin(this.chaosWobble * 0.65) * 20 : 0;
      return levelSpeed + rush + chaos;
    }
  }

  FamilyDash.Player = Player;
})();
