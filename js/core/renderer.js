(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});

  function px(v) { return Math.round(v); }
  function block(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(px(x), px(y), px(w), px(h)); }
  function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  class Renderer {
    constructor(canvas, level) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.level = level;
    }

    setLevel(level) { this.level = level; }

    drawParallaxObjects(distance, groundY, kind) {
      const ctx = this.ctx;
      const c = this.canvas;
      const layerSpeed = kind === "near" ? 0.28 : kind === "mid" ? 0.17 : 0.09;
      const offset = distance * layerSpeed;
      for (let i = -2; i < 20; i += 1) {
        const x = i * 110 - (offset % 110);
        if (this.level.biome === "desert") {
          block(ctx, x, groundY - 30 - (i % 2) * 12, 80, 30, kind === "far" ? "#d8a460" : "#c58f4f");
          if (kind !== "far") block(ctx, x + 30, groundY - 62, 6, 32, "#3e8b4f");
        } else if (this.level.biome === "farm") {
          block(ctx, x, groundY - 28, 70, 28, "#b5534f");
          block(ctx, x + 8, groundY - 40, 16, 12, "#f5d98b");
          block(ctx, x + 28, groundY - 48, 4, 20, "#e0c174");
        } else if (this.level.biome === "marsh") {
          block(ctx, x, groundY - 14, 60, 14, "#5d7f58");
          block(ctx, x + 12, groundY - 44, 3, 30, "#4f5a41");
          block(ctx, x + 18, groundY - 38, 3, 24, "#4f5a41");
        } else if (this.level.biome === "space") {
          block(ctx, x, groundY - 20, 66, 20, "#6c6c81");
          block(ctx, x + 22, groundY - 30, 20, 10, "#8e8ea2");
        } else if (this.level.biome === "beach") {
          block(ctx, x + 8, groundY - 48, 6, 48, "#8b5a2b");
          block(ctx, x - 4, groundY - 62, 24, 16, "#2ea86f");
          block(ctx, x + 8, groundY - 72, 22, 14, "#2ea86f");
        } else if (this.level.biome === "snow") {
          block(ctx, x, groundY - 18, 74, 18, "#c7ddeb");
          block(ctx, x + 18, groundY - 48, 6, 30, "#8fb6cf");
          block(ctx, x + 10, groundY - 60, 22, 12, "#e8f3ff");
        } else if (this.level.biome === "volcano") {
          block(ctx, x, groundY - 34, 88, 34, kind === "far" ? "#3a2c2a" : "#2f2321");
          block(ctx, x + 34, groundY - 40, 10, 6, "#ff7b3d");
        } else if (this.level.biome === "forest") {
          block(ctx, x + 20, groundY - 50, 8, 50, "#6d4a2f");
          block(ctx, x + 6, groundY - 74, 36, 24, "#2b8d4f");
        } else if (this.level.biome === "cyber") {
          block(ctx, x, groundY - 44, 64, 44, "#23274f");
          block(ctx, x + 4, groundY - 40, 56, 4, i % 2 ? "#70f7ff" : "#f970ff");
        } else {
          block(ctx, x, groundY - 56, 72, 56, kind === "far" ? "#4c5f82" : "#384c71");
          block(ctx, x + 6, groundY - 44, 8, 10, "#ffd980");
          block(ctx, x + 22, groundY - 44, 8, 10, "#ffd980");
        }
      }
      if (this.level.biome === "space") {
        for (let s = 0; s < 80; s += 1) {
          const sx = (hash(s) * c.width + distance * 0.06 * (s % 3 + 1)) % c.width;
          const sy = hash(s * 2.1) * (groundY - 60);
          block(ctx, sx, sy, 2, 2, "#f0f6ff");
        }
      }
    }

    drawSky(distance) {
      const ctx = this.ctx;
      const c = this.canvas;
      const grad = ctx.createLinearGradient(0, 0, 0, c.height);
      if (this.level.biome === "space") {
        grad.addColorStop(0, "#0d1022");
        grad.addColorStop(1, "#23274e");
      } else if (this.level.biome === "volcano") {
        grad.addColorStop(0, "#4d2b2b");
        grad.addColorStop(1, "#7a3e2e");
      } else if (this.level.biome === "snow") {
        grad.addColorStop(0, "#e9f5ff");
        grad.addColorStop(1, "#c5def0");
      } else {
        grad.addColorStop(0, this.level.backdrop.sky);
        grad.addColorStop(1, this.level.backdrop.ground);
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, c.width, c.height);

      if (this.level.biome === "desert") block(ctx, 760 - (distance * 0.04 % 900), 56, 24, 24, "#ffd56e");
      if (this.level.biome === "farm") block(ctx, 740 - (distance * 0.03 % 900), 68, 22, 22, "#ffe8a0");
      if (this.level.biome === "marsh") block(ctx, 760 - (distance * 0.02 % 900), 72, 26, 14, "#d9decf");
      if (this.level.biome === "beach") block(ctx, 740 - (distance * 0.03 % 900), 60, 24, 24, "#ffe27f");
      if (this.level.biome === "snow") block(ctx, 740 - (distance * 0.03 % 900), 60, 20, 20, "#fffef5");
    }


    drawBiomeFx(distance, groundY) {
      const ctx = this.ctx;
      const c = this.canvas;
      const t = distance * 0.02;
      if (this.level.biome === "desert") {
        for (let i = 0; i < 24; i += 1) {
          const x = (i * 60 + t * 40) % c.width;
          const y = 80 + (i * 11 % 120);
          block(ctx, x, y, 8, 1, "rgba(255,235,170,0.35)");
        }
      } else if (this.level.biome === "farm") {
        for (let i = 0; i < 12; i += 1) {
          const x = (i * 90 + t * 22) % c.width;
          const y = 70 + Math.sin(t + i) * 10;
          block(ctx, x, y, 6, 3, "#ffffff");
        }
      } else if (this.level.biome === "marsh") {
        for (let i = 0; i < 18; i += 1) {
          const x = (i * 70 + t * 30) % c.width;
          const y = groundY - 8 + Math.sin(t * 2 + i) * 3;
          block(ctx, x, y, 10, 2, "rgba(174,224,187,0.45)");
        }
      } else if (this.level.biome === "space") {
        for (let i = 0; i < 6; i += 1) {
          const x = (i * 180 + t * 14) % c.width;
          const y = 34 + i * 26;
          block(ctx, x, y, 14, 2, "#a8b3ff");
        }
      } else if (this.level.biome === "cyber") {
        for (let i = 0; i < 10; i += 1) {
          const x = (i * 100 + t * 26) % c.width;
          const y = 46 + i * 18;
          block(ctx, x, y, 20, 2, i % 2 ? "#7bf7ff" : "#f77bff");
        }
      } else if (this.level.biome === "beach") {
        for (let i = 0; i < 20; i += 1) {
          const x = (i * 52 + t * 35) % c.width;
          const y = groundY + 4 + Math.sin(t + i) * 2;
          block(ctx, x, y, 12, 2, "rgba(255,255,255,0.5)");
        }
      } else if (this.level.biome === "snow") {
        for (let i = 0; i < 50; i += 1) {
          const x = (i * 37 + t * 14) % c.width;
          const y = (i * 23 + t * 28) % (groundY - 10);
          block(ctx, x, y, 2, 2, "rgba(255,255,255,0.8)");
        }
      } else if (this.level.biome === "volcano") {
        for (let i = 0; i < 26; i += 1) {
          const x = (i * 48 + t * 20) % c.width;
          const y = groundY - 12 - (i % 3) * 8;
          block(ctx, x, y, 3, 3, "#ff8f3d");
        }
      }
    }

    drawRunner(player, t) {
      const ctx = this.ctx;
      const step = Math.sin(t * 18);
      const lean = Math.max(-1, Math.min(2, Math.sin(t * 7) * 2));
      const w = player.width;
      const h = player.height;
      const x = player.x;
      const y = player.y + Math.sin(t * 16) * 1.2;
      const bodyW = Math.max(6, Math.round(w * 0.5));
      const bodyH = Math.max(10, Math.round(h * 0.45));
      const head = Math.max(5, Math.round(h * 0.22));
      const legLen = Math.max(8, Math.round(h * 0.36));
      const armLen = Math.max(6, Math.round(h * 0.28));
      const bodyX = x + Math.round((w - bodyW) / 2) + lean;
      const bodyY = y + head;

      block(ctx, bodyX + 1, bodyY + bodyH + legLen, bodyW - 2, 2, "rgba(0,0,0,0.28)");
      block(ctx, bodyX, bodyY, bodyW, bodyH, player.character.color);
      block(ctx, bodyX + 1, y, head, head, "#ffd9b3");
      block(ctx, bodyX + 1, bodyY + Math.round(bodyH * 0.45), Math.max(2, Math.round(bodyW * 0.7)), 3, player.character.accent);

      const swing = Math.round(step * 4);
      block(ctx, bodyX + 2, bodyY + bodyH, 3, legLen + swing, "#1b1b2f");
      block(ctx, bodyX + bodyW - 5, bodyY + bodyH, 3, legLen - swing, "#1b1b2f");
      block(ctx, bodyX - 3, bodyY + 4, 3, armLen - Math.round(step * 3), "#1b1b2f");
      block(ctx, bodyX + bodyW, bodyY + 4, 3, armLen + Math.round(step * 3), "#1b1b2f");

      if (player.kickTimer > 0) block(ctx, x + w + 2, bodyY + bodyH + 5, 16, 3, "#ffe48a");
      if (player.shieldTimer > 0) {
        ctx.strokeStyle = "#8ce0ff";
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 5, y - 4, w + 10, h + 10);
      }
    }

    render(state) {
      const ctx = this.ctx;
      const c = this.canvas;
      const distance = state.distance;
      const groundY = state.groundY;

      ctx.imageSmoothingEnabled = false;
      this.drawSky(distance);
      this.drawParallaxObjects(distance, groundY - 38, "far");
      this.drawParallaxObjects(distance, groundY - 20, "mid");
      this.drawParallaxObjects(distance, groundY, "near");
      this.drawBiomeFx(distance, groundY);

      block(ctx, 0, groundY, c.width, c.height - groundY, this.level.backdrop.ground);
      for (let x = -30; x < c.width + 60; x += 30) block(ctx, x - (distance * 0.33 % 30), groundY + 18, 16, 2, "#f2f2f2");

      state.coins.forEach((coin) => {
        block(ctx, coin.x, coin.y, coin.width, coin.height, "#ffd447");
        block(ctx, coin.x + 4, coin.y + 4, coin.width - 8, coin.height - 8, "#f6b500");
      });
      state.powerups.forEach((powerup) => {
        block(ctx, powerup.x, powerup.y, powerup.width, powerup.height, powerup.color);
        block(ctx, powerup.x + 7, powerup.y + 7, 10, 10, "#14223f");
      });
      state.obstacles.forEach((obstacle) => {
        block(ctx, obstacle.x, obstacle.y, obstacle.width, obstacle.height, obstacle.color);
        block(ctx, obstacle.x + 2, obstacle.y + 2, obstacle.width - 4, 3, "rgba(255,255,255,0.3)");
      });

      this.drawRunner(state.player, state.animationClock);
      const progress = Math.min(1, state.distance / this.level.length);
      block(ctx, 20, 14, c.width - 40, 12, "#1f2a44");
      block(ctx, 20, 14, (c.width - 40) * progress, 12, "#6ef3b5");
    }
  }

  FamilyDash.Renderer = Renderer;
})();
