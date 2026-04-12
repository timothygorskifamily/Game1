(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});

  function px(v) {
    return Math.round(v);
  }

  function block(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(px(x), px(y), px(w), px(h));
  }

  class Renderer {
    constructor(canvas, level) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.level = level;
      this.parallax = { near: 0, mid: 0, far: 0 };
    }

    setLevel(level) { this.level = level; }

    drawHouses(offset) {
      const ctx = this.ctx;
      const y = 188;
      for (let i = -1; i <= 8; i += 1) {
        const x = i * 170 - offset;
        block(ctx, x, y, 80, 56, "#f4e7c2");
        block(ctx, x + 8, y + 12, 12, 10, "#4d9be6");
        block(ctx, x + 26, y + 12, 12, 10, "#4d9be6");
        block(ctx, x + 50, y + 12, 20, 30, "#9d5d4b");
        block(ctx, x - 6, y - 12, 92, 14, "#c95c54");
      }
    }

    drawTrees(offset, groundY) {
      const ctx = this.ctx;
      for (let i = -1; i <= 12; i += 1) {
        const x = i * 100 - offset;
        block(ctx, x + 16, groundY - 48, 10, 48, "#7e4f2a");
        block(ctx, x, groundY - 70, 42, 22, "#2f9658");
        block(ctx, x + 6, groundY - 86, 30, 16, "#39af68");
      }
    }

    drawRunner(player, animationClock) {
      const ctx = this.ctx;
      const step = Math.sin(animationClock * 18);
      const bob = Math.sin(animationClock * 16) * 1.2;
      const w = player.width;
      const h = player.height;
      const x = player.x;
      const y = player.y + bob;

      const bodyW = Math.max(6, Math.round(w * 0.5));
      const bodyH = Math.max(10, Math.round(h * 0.45));
      const head = Math.max(5, Math.round(h * 0.22));
      const legLen = Math.max(8, Math.round(h * 0.36));
      const armLen = Math.max(6, Math.round(h * 0.28));

      const bodyX = x + Math.round((w - bodyW) / 2);
      const bodyY = y + head;
      const legY = bodyY + bodyH;
      const armY = bodyY + 4;

      block(ctx, bodyX, bodyY, bodyW, bodyH, player.character.color);
      block(ctx, bodyX + 1, y, head, head, "#ffd9b3");

      const accentW = Math.max(2, Math.round(bodyW * 0.7));
      block(ctx, bodyX + 1, bodyY + Math.round(bodyH * 0.45), accentW, 3, player.character.accent);

      const legSwing = Math.round(step * 4);
      const armSwing = Math.round(step * 3);

      block(ctx, bodyX + 2, legY, 3, legLen + legSwing, "#1b1b2f");
      block(ctx, bodyX + bodyW - 5, legY, 3, legLen - legSwing, "#1b1b2f");
      block(ctx, bodyX - 3, armY, 3, armLen - armSwing, "#1b1b2f");
      block(ctx, bodyX + bodyW, armY, 3, armLen + armSwing, "#1b1b2f");

      if (player.character.id === "liam") {
        block(ctx, bodyX + bodyW - 4, bodyY + 2, 4, 4, "#80ffdb");
      }
      if (player.character.id === "addy") {
        block(ctx, bodyX - 2, y + 1, 3, 3, "#ff99c8");
        block(ctx, bodyX + head, y + 1, 3, 3, "#ff99c8");
      }
      if (player.kickTimer > 0) {
        block(ctx, x + w + 2, legY + 3, 16, 3, "#ffe48a");
      }
      if (player.shieldTimer > 0) {
        ctx.strokeStyle = "#8ce0ff";
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 5, y - 4, w + 10, h + 10);
      }
    }

    render(state) {
      const ctx = this.ctx;
      const canvas = this.canvas;
      const player = state.player;
      const obstacles = state.obstacles;
      const coins = state.coins;
      const powerups = state.powerups;
      const distance = state.distance;
      const groundY = state.groundY;

      ctx.imageSmoothingEnabled = false;
      this.parallax.far = (distance * 0.06) % canvas.width;
      this.parallax.mid = (distance * 0.14) % canvas.width;
      this.parallax.near = (distance * 0.28) % canvas.width;

      block(ctx, 0, 0, canvas.width, canvas.height, this.level.backdrop.sky);
      this.drawHouses(this.parallax.far);
      this.drawTrees(this.parallax.mid, groundY);
      block(ctx, 0, groundY, canvas.width, canvas.height - groundY, this.level.backdrop.ground);

      for (let x = -40; x < canvas.width + 80; x += 32) {
        block(ctx, x - (this.parallax.near % 32), groundY + 18, 16, 2, "#f2f2f2");
      }

      coins.forEach((coin) => {
        block(ctx, coin.x, coin.y, coin.width, coin.height, "#ffd447");
        block(ctx, coin.x + 4, coin.y + 4, coin.width - 8, coin.height - 8, "#f6b500");
      });

      powerups.forEach((powerup) => {
        block(ctx, powerup.x, powerup.y, powerup.width, powerup.height, powerup.color);
        block(ctx, powerup.x + 7, powerup.y + 7, 10, 10, "#14223f");
      });

      obstacles.forEach((obstacle) => {
        block(ctx, obstacle.x, obstacle.y, obstacle.width, obstacle.height, obstacle.color);
        block(ctx, obstacle.x + 2, obstacle.y + 2, obstacle.width - 4, 3, "rgba(255,255,255,0.3)");
      });

      this.drawRunner(player, state.animationClock);

      const progress = Math.min(1, state.distance / this.level.length);
      block(ctx, 20, 14, canvas.width - 40, 12, "#1f2a44");
      block(ctx, 20, 14, (canvas.width - 40) * progress, 12, "#6ef3b5");
    }
  }

  FamilyDash.Renderer = Renderer;
})();
