(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});

  class Player {
    constructor(character, canvasHeight, groundY) {
      this.character = character;
      this.width = 56;
      this.baseHeight = 82;
      this.height = this.baseHeight;
      this.x = 130;
      this.y = groundY - this.height;
      this.groundY = groundY;
      this.velocityY = 0;
      this.gravity = 1600;
      this.isSliding = false;
      this.slideTimer = 0;
      this.kickTimer = 0;
      this.shieldTimer = 0;
      this.rushTimer = 0;
      this.invincibleFrames = 0;
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
      this.height = 52;
      this.y = this.groundY - this.height;
    }

    kick() { this.kickTimer = 0.25; }

    applyDamage(amount) {
      if (this.invincibleFrames > 0 || this.shieldTimer > 0) return false;
      this.health -= amount;
      this.invincibleFrames = 0.9;
      return true;
    }

    applyPowerup(effect) {
      if (effect === "heal") this.health = Math.min(this.maxHealth, this.health + 1);
      if (effect === "shield") this.shieldTimer = 5;
      if (effect === "rush") this.rushTimer = 4;
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
      this.kickTimer = Math.max(0, this.kickTimer - delta);
      this.shieldTimer = Math.max(0, this.shieldTimer - delta);
      this.rushTimer = Math.max(0, this.rushTimer - delta);
      this.invincibleFrames = Math.max(0, this.invincibleFrames - delta);
    }

    effectiveSpeed(levelSpeed) {
      const rush = this.rushTimer > 0 ? 60 : 0;
      const chaos = this.character.gameplay.chaosMode ? Math.sin(this.chaosWobble * 0.65) * 20 : 0;
      return levelSpeed + rush + chaos;
    }
  }

  FamilyDash.Player = Player;
})();
