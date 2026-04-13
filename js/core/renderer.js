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

    drawSky(base) {
      block(this.ctx, 0, 0, this.canvas.width, this.canvas.height, base);
    }

    drawRouteSegments(distance, groundY, palette, biomeSeed) {
      const ctx = this.ctx;
      const tile = 90;
      const start = Math.floor((distance - 200) / tile);
      const end = Math.floor((distance + this.canvas.width + 200) / tile);

      for (let i = start; i <= end; i += 1) {
        const x = i * tile - distance;
        const t = hash((i + 1) * (biomeSeed + 0.3) + this.level.id * 17);
        const variant = Math.floor(t * 7);

        // base block for neighborhood transition feel
        block(ctx, x, groundY - 110, tile - 2, 96, palette.strip[Math.floor(hash(i * 2.1) * palette.strip.length)]);

        if (variant === 0) this.drawHouse(x, groundY, palette, i);
        if (variant === 1) this.drawStore(x, groundY, palette, i);
        if (variant === 2) this.drawPark(x, groundY, palette, i);
        if (variant === 3) this.drawPond(x, groundY, palette, i);
        if (variant === 4) this.drawPlayground(x, groundY, palette, i);
        if (variant === 5) this.drawStreet(x, groundY, palette, i);
        if (variant === 6) this.drawGardenLot(x, groundY, palette, i);
      }
    }

    drawHouse(x, groundY, p, seed) {
      const w = 38 + Math.floor(hash(seed) * 26);
      const h = 36 + Math.floor(hash(seed * 2) * 24);
      block(this.ctx, x + 8, groundY - 14 - h, w, h, p.house);
      block(this.ctx, x + 4, groundY - 18 - h, w + 8, 10, p.roof);
      block(this.ctx, x + 14, groundY - h + 2, 8, 8, p.window);
      block(this.ctx, x + w - 2, groundY - h + 2, 8, 8, p.window);
      block(this.ctx, x + (w / 2), groundY - 14 - 18, 10, 18, p.door);
    }

    drawStore(x, groundY, p, seed) {
      const w = 62 + Math.floor(hash(seed * 1.4) * 18);
      block(this.ctx, x + 6, groundY - 68, w, 54, p.store);
      block(this.ctx, x + 8, groundY - 76, w - 4, 8, p.neon[Math.floor(hash(seed * 5) * p.neon.length)]);
      block(this.ctx, x + 12, groundY - 54, 18, 16, p.window);
      block(this.ctx, x + 36, groundY - 54, 18, 16, p.window);
      block(this.ctx, x + 56, groundY - 54, 18, 16, p.window);
      block(this.ctx, x + 32, groundY - 36, 14, 22, p.door);
    }

    drawPark(x, groundY, p, seed) {
      block(this.ctx, x + 4, groundY - 50, 78, 36, p.park);
      for (let t = 0; t < 3; t += 1) {
        const tx = x + 14 + t * 20;
        block(this.ctx, tx, groundY - 62, 6, 12, p.trunk);
        block(this.ctx, tx - 6, groundY - 74, 18, 14, p.tree);
      }
      block(this.ctx, x + 10, groundY - 24, 60, 3, p.path);
    }

    drawPond(x, groundY, p) {
      block(this.ctx, x + 8, groundY - 42, 74, 26, p.pond);
      block(this.ctx, x + 14, groundY - 36, 54, 14, p.pond2);
      block(this.ctx, x + 2, groundY - 20, 86, 4, p.path);
    }

    drawPlayground(x, groundY, p) {
      block(this.ctx, x + 4, groundY - 50, 80, 36, p.park);
      block(this.ctx, x + 14, groundY - 56, 6, 42, p.trunk);
      block(this.ctx, x + 26, groundY - 54, 30, 4, p.neon[0]);
      block(this.ctx, x + 56, groundY - 58, 16, 6, p.neon[1]);
      block(this.ctx, x + 58, groundY - 52, 3, 20, p.trunk);
      block(this.ctx, x + 68, groundY - 52, 3, 20, p.trunk);
    }

    drawStreet(x, groundY, p, seed) {
      block(this.ctx, x + 2, groundY - 50, 86, 36, p.street);
      block(this.ctx, x + 40, groundY - 70, 6, 56, p.trunk);
      block(this.ctx, x + 36, groundY - 74, 14, 6, p.lamp);
      block(this.ctx, x + 8, groundY - 30, 20, 3, p.path);
      block(this.ctx, x + 56, groundY - 30, 20, 3, p.path);
      if (hash(seed * 8.2) > 0.5) block(this.ctx, x + 24, groundY - 46, 16, 8, p.neon[2] || p.neon[0]);
    }

    drawGardenLot(x, groundY, p, seed) {
      block(this.ctx, x + 4, groundY - 52, 80, 38, p.park);
      for (let i = 0; i < 5; i += 1) {
        const gx = x + 10 + i * 14;
        block(this.ctx, gx, groundY - 28, 8, 6, p.flower[Math.floor(hash(seed + i) * p.flower.length)]);
      }
      block(this.ctx, x + 8, groundY - 20, 72, 2, p.path);
    }

    paletteForBiome() {
      const b = this.level.biome;
      const palettes = {
        desert: { sky: "#f7d9a6", strip: ["#eac78a", "#e4bf7f"], house: "#d5a96f", roof: "#a56f3f", window: "#8ec4d6", door: "#6e462a", store: "#c79060", neon: ["#ffbf69", "#ffe066"], park: "#c7a669", trunk: "#7c532f", tree: "#b08953", path: "#9f7a4d", pond: "#89c8db", pond2: "#68adbe", street: "#be9a62", lamp: "#ffe0a2", flower: ["#f4d35e", "#ee964b"] },
        farm: { sky: "#bfe5ff", strip: ["#8fbe5e", "#7fb24e"], house: "#f0e5c9", roof: "#ca5a4f", window: "#9ad2ff", door: "#875f3c", store: "#f2cf96", neon: ["#ffd166", "#7bdff2", "#f7a072"], park: "#7eb45a", trunk: "#6e4a2f", tree: "#4f9747", path: "#c9b98c", pond: "#86c8ef", pond2: "#5ca8da", street: "#9f8a6d", lamp: "#ffe8ac", flower: ["#ff7b7b", "#ffd166", "#90be6d"] },
        marsh: { sky: "#9cc6a6", strip: ["#5b8a61", "#4b7a54"], house: "#7b8a72", roof: "#4b5a4c", window: "#9ccfe0", door: "#42503a", store: "#718263", neon: ["#9bf6ff", "#caffbf"], park: "#5d8f65", trunk: "#4d3b2a", tree: "#6da06f", path: "#7d8a6f", pond: "#678f8c", pond2: "#4b7471", street: "#657a64", lamp: "#d8f3dc", flower: ["#b7e4c7", "#95d5b2"] },
        city: { sky: "#8eb5e2", strip: ["#59677d", "#4f5c72"], house: "#9da9bd", roof: "#6f7786", window: "#d6e0ff", door: "#4f5666", store: "#7f8ba1", neon: ["#31f3ff", "#ff54d9", "#ffd166"], park: "#708f70", trunk: "#574a3b", tree: "#4f7f4f", path: "#aab2be", pond: "#6ea1bf", pond2: "#58829b", street: "#4b5568", lamp: "#fff3b0", flower: ["#f28482", "#84a59d"] },
        space: { sky: "#10162f", strip: ["#2d3150", "#373b61"], house: "#6d74a3", roof: "#9aa4d4", window: "#d6ddff", door: "#4a4f76", store: "#61699b", neon: ["#9bf6ff", "#cdb4db", "#ffd6a5"], park: "#424a7d", trunk: "#7b86b4", tree: "#9aa8d1", path: "#8089bd", pond: "#5d78b2", pond2: "#4e6697", street: "#4f567f", lamp: "#e2e7ff", flower: ["#bde0fe", "#ffc8dd"] },
        volcano: { sky: "#704447", strip: ["#75453d", "#653a34"], house: "#8f6652", roof: "#4b2d29", window: "#ffb38a", door: "#5b3b2f", store: "#7b5847", neon: ["#ff6b3d", "#ffd166"], park: "#7a5a3f", trunk: "#422a23", tree: "#a96741", path: "#9c6f53", pond: "#8f4f3a", pond2: "#6f3b2a", street: "#6e4a3b", lamp: "#ffe0a2", flower: ["#ff7f51", "#f4a261"] },
        snow: { sky: "#dff3ff", strip: ["#d6e9f7", "#cde1f2"], house: "#f4f8ff", roof: "#a9bfd3", window: "#8ec9ff", door: "#869db2", store: "#e4eef9", neon: ["#9bf6ff", "#bde0fe"], park: "#d8e9f5", trunk: "#8d9aa7", tree: "#b7d0dc", path: "#f8fbff", pond: "#9fd2ea", pond2: "#82bdd9", street: "#b4c7d6", lamp: "#fff7c2", flower: ["#ffffff", "#d9edff"] },
        beach: { sky: "#85d4ff", strip: ["#e7cc8b", "#e0c27c"], house: "#ffe8b1", roof: "#f29e4c", window: "#8ed8ff", door: "#9f6a3b", store: "#ffd8a8", neon: ["#ff99c8", "#90dbf4", "#f9c74f"], park: "#d9c07d", trunk: "#8d613f", tree: "#4dbf72", path: "#f0e1b6", pond: "#57c6e1", pond2: "#3fa9c9", street: "#d4b87a", lamp: "#ffe39f", flower: ["#ffb4a2", "#ffd166"] },
        jungle: { sky: "#86c97d", strip: ["#4f8b3f", "#417833"], house: "#84a85a", roof: "#3f5a2f", window: "#a8d5ba", door: "#4f3a28", store: "#6f8f47", neon: ["#f1fa8c", "#9bf6ff"], park: "#4d7a38", trunk: "#5d3e2f", tree: "#2f7f3c", path: "#6c8f59", pond: "#5da8a1", pond2: "#46867f", street: "#5b7d44", lamp: "#fff0a8", flower: ["#ffd166", "#ff7b7b", "#caffbf"] },
        cyber: { sky: "#18203c", strip: ["#334260", "#2a3752"], house: "#506187", roof: "#1f2a44", window: "#b2f7ef", door: "#2f3c5a", store: "#435578", neon: ["#31f3ff", "#ff54d9", "#80ffdb"], park: "#40536f", trunk: "#1e2a40", tree: "#58779a", path: "#667da3", pond: "#415f9a", pond2: "#354d80", street: "#2f3f5c", lamp: "#d9f2ff", flower: ["#cdb4db", "#bde0fe"] }
      };
      return palettes[b] || palettes.city;
    }

    drawBiomeBackground(distance, groundY) {
      const p = this.paletteForBiome();
      this.drawSky(p.sky);
      this.drawRouteSegments(distance * 0.22, groundY, p, this.level.id * 2.17);
      this.drawRouteSegments(distance * 0.34 + 300, groundY + 10, p, this.level.id * 3.41);
    }

    drawRunner(player, animationClock) {
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

      block(this.ctx, bodyX, bodyY, bodyW, bodyH, player.character.color);
      block(this.ctx, bodyX + 1, y, head, head, "#ffd9b3");
      block(this.ctx, bodyX + 1, bodyY + Math.round(bodyH * 0.45), Math.max(2, Math.round(bodyW * 0.7)), 3, player.character.accent);

      const legSwing = Math.round(step * 4);
      const armSwing = Math.round(step * 3);
      block(this.ctx, bodyX + 2, legY, 3, legLen + legSwing, "#1b1b2f");
      block(this.ctx, bodyX + bodyW - 5, legY, 3, legLen - legSwing, "#1b1b2f");
      block(this.ctx, bodyX - 3, armY, 3, armLen - armSwing, "#1b1b2f");
      block(this.ctx, bodyX + bodyW, armY, 3, armLen + armSwing, "#1b1b2f");
    }

    render(state) {
      const c = this.canvas;
      const distance = state.distance;
      const groundY = state.groundY;
      this.ctx.imageSmoothingEnabled = false;

      this.drawBiomeBackground(distance, groundY);
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
