(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});

  function px(v) { return Math.round(v); }
  function block(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(px(x), px(y), px(w), px(h)); }
  function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  const PALETTES = {
    desert: { skyA: "#f5c27a", skyB: "#ffe3b2", ground: "#d9b36c", propA: "#b07d4f", propB: "#2f8f46", water: "#6dc5d4" },
    farm: { skyA: "#8ecbff", skyB: "#d8f2ff", ground: "#87b45b", propA: "#d35f49", propB: "#7a4f2b", water: "#6bb7ee" },
    marsh: { skyA: "#7ba38a", skyB: "#b6d5be", ground: "#4f7a4b", propA: "#3f5f43", propB: "#7aa66e", water: "#4a8a7f" },
    city: { skyA: "#5f7fa5", skyB: "#9dc3ef", ground: "#5d6774", propA: "#445774", propB: "#ffdd7a", water: "#5876a5" },
    space: { skyA: "#0f1733", skyB: "#1e2c5a", ground: "#3c4163", propA: "#5a6eb0", propB: "#94b5ff", water: "#3d5090" },
    volcano: { skyA: "#5a2f36", skyB: "#8d4740", ground: "#5b3f32", propA: "#422725", propB: "#ff7a47", water: "#7d3434" },
    snow: { skyA: "#b7e5ff", skyB: "#f5fbff", ground: "#d9ebf7", propA: "#97bad5", propB: "#ffffff", water: "#8cc7f5" },
    beach: { skyA: "#69c8f7", skyB: "#b5e7ff", ground: "#e5cb87", propA: "#47afe0", propB: "#7f5b3a", water: "#4dbbe8" },
    jungle: { skyA: "#5ea86a", skyB: "#98d89f", ground: "#4d7a38", propA: "#2f5f33", propB: "#4ea24a", water: "#4f98a0" },
    cyber: { skyA: "#18203c", skyB: "#2a3562", ground: "#344260", propA: "#273550", propB: "#31f3ff", water: "#2d4d7f" }
  };

  class Renderer {
    constructor(canvas, level) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.level = level;
    }

    setLevel(level) { this.level = level; }

    drawSky(distance, biome, groundY) {
      const ctx = this.ctx;
      const p = PALETTES[biome] || PALETTES.city;
      const g = ctx.createLinearGradient(0, 0, 0, groundY);
      g.addColorStop(0, p.skyA);
      g.addColorStop(1, p.skyB);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, this.canvas.width, groundY);

      if (biome === "space") {
        for (let i = 0; i < 140; i += 1) {
          block(ctx, (i * 53 + distance * 0.45) % this.canvas.width, (i * 31) % (groundY - 20), 2, 2, i % 3 ? "#d8e2ff" : "#ffffff");
        }
      }
    }

    drawBackdropBands(distance, biome, groundY) {
      const ctx = this.ctx;
      const p = PALETTES[biome] || PALETTES.city;
      for (let i = -1; i < 10; i += 1) {
        const x = i * 140 - (distance * 0.08 % 140);
        const h = 35 + (i % 3) * 16;
        block(ctx, x, groundY - 100 - h, 120, h + 100, p.propA);
      }
      for (let i = -1; i < 14; i += 1) {
        const x = i * 90 - (distance * 0.16 % 90);
        const h = 20 + (i % 4) * 14;
        block(ctx, x, groundY - 70 - h, 70, h + 70, "rgba(255,255,255,0.08)");
      }
    }

    drawDistrictObject(x, y, district, seed, biome) {
      const ctx = this.ctx;
      const p = PALETTES[biome] || PALETTES.city;
      const size = 30 + Math.floor(hash(seed + 1) * 46);

      if (district === 0) {
        // houses
        block(ctx, x, y - size, size + 18, size, p.propA);
        block(ctx, x - 4, y - size - 12, size + 26, 12, p.propB);
        block(ctx, x + 8, y - size + 10, 8, 8, "#c9e7ff");
      } else if (district === 1) {
        // stores / neon
        block(ctx, x, y - size, size + 26, size, p.propA);
        block(ctx, x + 4, y - size + 6, size + 18, 6, p.propB);
        block(ctx, x + 10, y - 12, size - 4, 10, "#1f1f2f");
      } else if (district === 2) {
        // parks/playgrounds
        block(ctx, x + 8, y - size, 8, size, p.propB);
        block(ctx, x, y - size - 10, 24, 10, p.propB);
        block(ctx, x + 28, y - size + 8, 16, 3, p.propB);
        block(ctx, x + 36, y - size + 8, 3, 18, p.propB);
      } else if (district === 3) {
        // pond/street
        block(ctx, x, y - 12, size + 34, 10, p.water);
        block(ctx, x + 4, y - size, 6, size - 12, p.propA);
        block(ctx, x + size + 18, y - size + 10, 6, size - 20, p.propA);
      } else {
        // big mixed buildings
        block(ctx, x, y - size - 25, size + 24, size + 25, p.propA);
        for (let wy = y - size - 18; wy < y - 8; wy += 8) {
          for (let wx = x + 5; wx < x + size + 18; wx += 8) {
            block(ctx, wx, wy, 3, 3, hash(wx + wy + seed) > 0.45 ? p.propB : "#22334f");
          }
        }
      }
    }

    drawDynamicPath(distance, biome, groundY) {
      const ctx = this.ctx;
      const p = PALETTES[biome] || PALETTES.city;
      const segment = Math.floor(distance / 260);
      const worldStart = Math.floor((distance - 140) / 84);
      const worldEnd = Math.floor((distance + this.canvas.width + 140) / 84);

      for (let i = worldStart; i <= worldEnd; i += 1) {
        const x = i * 84 - distance;
        const district = (segment + i + this.level.id) % 5; // changing path through places
        const seed = i * 12.7 + this.level.id * 40;
        this.drawDistrictObject(x, groundY - 8, district, seed, biome);
      }

      // scrolling road marks
      for (let x = -20; x < this.canvas.width + 40; x += 38) {
        block(ctx, x - (distance * 0.3 % 38), groundY + 18, 20, 2, biome === "snow" ? "#9fb0be" : "#f2f2f2");
      }

      // ground
      block(ctx, 0, groundY, this.canvas.width, this.canvas.height - groundY, p.ground);
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
      block(ctx, bodyX + 1, bodyY + Math.round(bodyH * 0.45), Math.max(2, Math.round(bodyW * 0.7)), 3, player.character.accent);

      const legSwing = Math.round(step * 4);
      const armSwing = Math.round(step * 3);
      block(ctx, bodyX + 2, legY, 3, legLen + legSwing, "#1b1b2f");
      block(ctx, bodyX + bodyW - 5, legY, 3, legLen - legSwing, "#1b1b2f");
      block(ctx, bodyX - 3, armY, 3, armLen - armSwing, "#1b1b2f");
      block(ctx, bodyX + bodyW, armY, 3, armLen + armSwing, "#1b1b2f");
    }

    render(state) {
      const ctx = this.ctx;
      const c = this.canvas;
      const distance = state.distance * 6.5;
      const groundY = state.groundY;
      const biome = this.level.biome || "city";
      ctx.imageSmoothingEnabled = false;

      this.drawSky(distance, biome, groundY);
      this.drawBackdropBands(distance, biome, groundY);
      this.drawDynamicPath(distance, biome, groundY);

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
