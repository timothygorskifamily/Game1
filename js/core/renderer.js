(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});

  function px(v) { return Math.round(v); }
  function block(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(px(x), px(y), px(w), px(h)); }
  function hash(n) { const x = Math.sin(n * 91.7 + 44.1) * 43758.5453; return x - Math.floor(x); }

  class Renderer {
    constructor(canvas, level) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.level = level;
    }

    setLevel(level) { this.level = level; }

    getBiomePalette(biome) {
      const map = {
        desert: { sky: "#f7d9a6", ground: "#d9b36c", accent: "#b97d3d" },
        farm: { sky: "#bfe5ff", ground: "#88b65a", accent: "#d35f49" },
        marsh: { sky: "#9cc6a6", ground: "#4f7a4b", accent: "#4d7f63" },
        city: { sky: "#8eb5e2", ground: "#5d6774", accent: "#334766" },
        space: { sky: "#10162f", ground: "#3c4163", accent: "#7f90d6" },
        volcano: { sky: "#704447", ground: "#5b3f32", accent: "#ff6b3d" },
        snow: { sky: "#dff3ff", ground: "#cfe3f5", accent: "#b8d2ea" },
        beach: { sky: "#85d4ff", ground: "#e5cb87", accent: "#4eb9e5" },
        jungle: { sky: "#86c97d", ground: "#4d7a38", accent: "#2f7f3c" },
        cyber: { sky: "#18203c", ground: "#344260", accent: "#31f3ff" }
      };
      return map[biome] || map.city;
    }

    drawZone(zone, x, y, palette, biome) {
      const ctx = this.ctx;
      if (zone === "house") {
        const w = 48 + Math.floor(hash(x) * 50);
        const h = 32 + Math.floor(hash(x + 3) * 34);
        block(ctx, x, y - h, w, h, biome === "desert" ? "#d2b38f" : "#e8dac3");
        block(ctx, x - 4, y - h - 10, w + 8, 10, "#9d5d4b");
        block(ctx, x + 8, y - h + 8, 10, 10, "#4d9be6");
      } else if (zone === "store") {
        const w = 70 + Math.floor(hash(x + 2) * 40);
        const h = 36 + Math.floor(hash(x + 6) * 24);
        block(ctx, x, y - h, w, h, "#2a3f5f");
        block(ctx, x + 3, y - h + 4, w - 6, 8, palette.accent);
        block(ctx, x + 10, y - h + 16, 18, 16, "#5fa8ff");
      } else if (zone === "park") {
        block(ctx, x, y - 20, 120, 20, "#4d8f4f");
        for (let i = 0; i < 4; i += 1) {
          block(ctx, x + i * 24 + 10, y - 42, 8, 22, "#6f4a2c");
          block(ctx, x + i * 24, y - 52, 26, 12, "#3fab58");
        }
      } else if (zone === "pond") {
        block(ctx, x, y - 16, 100, 14, "#4db1d9");
        block(ctx, x + 8, y - 22, 84, 8, "#66c9ef");
      } else if (zone === "playground") {
        block(ctx, x, y - 6, 110, 6, "#805a3a");
        block(ctx, x + 12, y - 34, 6, 28, "#f75f5f");
        block(ctx, x + 42, y - 44, 34, 6, "#ffd166");
        block(ctx, x + 78, y - 28, 20, 4, "#70b6ff");
      } else if (zone === "street") {
        block(ctx, x, y - 10, 130, 10, "#4f5966");
        for (let s = 0; s < 6; s += 1) block(ctx, x + s * 22 + 8, y - 6, 10, 2, "#dadada");
      } else if (zone === "field") {
        block(ctx, x, y - 18, 120, 18, "#97bc63");
        for (let r = 0; r < 5; r += 1) block(ctx, x, y - 16 + r * 3, 120, 1, "rgba(111,84,44,0.35)");
      } else if (zone === "rocks") {
        for (let i = 0; i < 6; i += 1) block(ctx, x + i * 18, y - (8 + (i % 3) * 4), 14, 8 + (i % 3) * 4, biome === "volcano" ? "#3c2a25" : "#6f7c8b");
      }
    }

    drawDynamicRoute(distance, groundY) {
      const biome = this.level.biome;
      const palette = this.getBiomePalette(biome);
      const ctx = this.ctx;

      block(ctx, 0, 0, this.canvas.width, this.canvas.height, palette.sky);

      if (biome === "space") {
        for (let i = 0; i < 160; i += 1) {
          const sx = (i * 47 + Math.floor(distance * 0.5)) % this.canvas.width;
          const sy = (i * 29) % (groundY - 30);
          block(ctx, sx, sy, 2, 2, i % 3 ? "#9fb6ff" : "#fff");
        }
      }

      const sequences = {
        desert: ["rocks", "house", "street", "pond", "rocks", "store", "street"],
        farm: ["field", "house", "park", "playground", "field", "pond", "store"],
        marsh: ["pond", "park", "rocks", "house", "pond", "street"],
        city: ["house", "store", "street", "park", "store", "playground", "street"],
        space: ["rocks", "store", "street", "pond", "rocks", "playground"],
        volcano: ["rocks", "street", "store", "rocks", "pond", "house"],
        snow: ["park", "house", "street", "pond", "playground", "store"],
        beach: ["pond", "park", "house", "street", "store", "playground"],
        jungle: ["park", "rocks", "pond", "house", "field", "street"],
        cyber: ["store", "street", "playground", "house", "pond", "rocks"]
      };

      const seq = sequences[biome] || sequences.city;
      const segmentLength = 130;
      const startSeg = Math.floor(distance / segmentLength) - 2;
      const endSeg = startSeg + 14;

      for (let seg = startSeg; seg <= endSeg; seg += 1) {
        const zone = seq[((seg % seq.length) + seq.length) % seq.length];
        const x = seg * segmentLength - distance + 200;
        const y = groundY - 6 - Math.floor(hash(seg * 2.3) * 14);
        this.drawZone(zone, x, y, palette, biome);
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
      block(ctx, bodyX + 1, bodyY + Math.round(bodyH * 0.45), Math.max(2, Math.round(bodyW * 0.7)), 3, player.character.accent);

      const legSwing = Math.round(step * 4);
      const armSwing = Math.round(step * 3);
      block(ctx, bodyX + 2, legY, 3, legLen + legSwing, "#1b1b2f");
      block(ctx, bodyX + bodyW - 5, legY, 3, legLen - legSwing, "#1b1b2f");
      block(ctx, bodyX - 3, armY, 3, armLen - armSwing, "#1b1b2f");
      block(ctx, bodyX + bodyW, armY, 3, armLen + armSwing, "#1b1b2f");
    }

    render(state) {
      const c = this.canvas;
      const distance = state.distance;
      const groundY = state.groundY;
      this.ctx.imageSmoothingEnabled = false;

      this.drawDynamicRoute(distance, groundY);
      block(this.ctx, 0, groundY, c.width, c.height - groundY, this.level.backdrop.ground);

      state.coins.forEach((coin) => {
        block(this.ctx, coin.x, coin.y, coin.width, coin.height, "#ffd447");
        block(this.ctx, coin.x + 4, coin.y + 4, coin.width - 8, coin.height - 8, "#f6b500");
      });

      state.powerups.forEach((powerup) => {
        block(this.ctx, powerup.x, powerup.y, powerup.width, powerup.height, powerup.color);
        block(this.ctx, powerup.x + 7, powerup.y + 7, 10, 10, "#14223f");
      });

      state.obstacles.forEach((obstacle) => {
        block(this.ctx, obstacle.x, obstacle.y, obstacle.width, obstacle.height, obstacle.color);
        block(this.ctx, obstacle.x + 2, obstacle.y + 2, obstacle.width - 4, 3, "rgba(255,255,255,0.3)");
      });

      this.drawRunner(state.player, state.animationClock);
      const progress = Math.min(1, state.distance / this.level.length);
      block(this.ctx, 20, 14, c.width - 40, 12, "#1f2a44");
      block(this.ctx, 20, 14, (c.width - 40) * progress, 12, "#6ef3b5");
    }
  }

  FamilyDash.Renderer = Renderer;
})();
