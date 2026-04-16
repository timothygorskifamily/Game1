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
      return this.createCollisionBox(this.character.gameplay.hitboxScale || 1);
    }

    get hurtbox() {
      const baseBoxes = this.isSliding
        ? [
            { x: 0.12, y: 0.58, width: 0.68, height: 0.16 },
            { x: 0.24, y: 0.44, width: 0.48, height: 0.18 },
            { x: 0.56, y: 0.26, width: 0.2, height: 0.22 }
          ]
        : [
            { x: 0.28, y: 0.02, width: 0.32, height: 0.46 },
            { x: 0.16, y: 0.44, width: 0.64, height: 0.54 }
          ];
      return this.createCollisionEntity(this.scaleCollisionBoxes(baseBoxes, this.character.gameplay.hitboxScale || 1));
    }

    createCollisionBox(scale) {
      const clampedScale = Math.max(0.3, scale);
      const width = this.width * clampedScale;
      const height = this.height * clampedScale;
      return {
        x: this.x + (this.width - width) / 2,
        y: this.y + (this.height - height) / 2,
        width,
        height
      };
    }

    createCollisionEntity(collisionBoxes) {
      return {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        collisionBoxes
      };
    }

    scaleCollisionBoxes(collisionBoxes, scale) {
      const clampedScale = Math.max(0.3, scale);
      return collisionBoxes.map((box) => {
        const width = box.width * clampedScale;
        const height = box.height * clampedScale;
        return {
          x: box.x + (box.width - width) / 2,
          y: box.y + (box.height - height) / 2,
          width,
          height
        };
      });
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
