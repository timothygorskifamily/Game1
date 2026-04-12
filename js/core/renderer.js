(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});

  function px(v) { return Math.round(v); }

  function block(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(px(x), px(y), px(w), px(h));
  }

  function hash(n) {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  class Renderer {
    constructor(canvas, level) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.level = level;
      this.parallax = { near: 0, mid: 0, far: 0 };
    }

    setLevel(level) { this.level = level; }

    drawSky(time) {
      const ctx = this.ctx;
      const c = this.canvas;
      const cycle = (Math.sin(time * 0.08) + 1) / 2; // day/night-ish pulse
      const topR = px(lerp(25, 125, cycle));
      const topG = px(lerp(32, 190, cycle));
      const topB = px(lerp(60, 255, cycle));
      const botR = px(lerp(12, 255, cycle));
      const botG = px(lerp(20, 177, cycle));
      const botB = px(lerp(36, 120, cycle));
      const gradient = ctx.createLinearGradient(0, 0, 0, c.height);
      gradient.addColorStop(0, `rgb(${topR},${topG},${topB})`);
      gradient.addColorStop(1, `rgb(${botR},${botG},${botB})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, c.width, c.height);

      // Pixel sun/moon
      const orbX = (time * 8) % (c.width + 160) - 80;
      const orbY = 70 + Math.sin(time * 0.14) * 20;
      const orbColor = cycle > 0.5 ? "#ffe69b" : "#d6ddff";
      block(ctx, orbX, orbY, 22, 22, orbColor);
      block(ctx, orbX + 4, orbY + 4, 14, 14, cycle > 0.5 ? "#ffd166" : "#bfc8ff");

      // drifting chunky clouds
      for (let i = 0; i < 8; i += 1) {
        const speed = 12 + i * 3;
        const cx = (c.width + 220 + (i * 140) - (time * speed % (c.width + 260))) - 130;
        const cy = 40 + i * 18 + Math.sin(time * 0.8 + i) * 6;
        const cloud = cycle > 0.5 ? "rgba(255,255,255,0.25)" : "rgba(230,235,255,0.14)";
        block(ctx, cx, cy, 44, 12, cloud);
        block(ctx, cx + 12, cy - 6, 24, 8, cloud);
      }
    }

    drawCityLayer(offset, groundY, scale, paletteSeed) {
      const ctx = this.ctx;
      const c = this.canvas;
      const worldStart = Math.floor((offset - 120) / (34 * scale));
      const worldEnd = Math.floor((offset + c.width + 120) / (34 * scale));

      for (let i = worldStart; i <= worldEnd; i += 1) {
        const r1 = hash(i * 3.1 + paletteSeed);
        const r2 = hash(i * 7.3 + paletteSeed * 2);
        const r3 = hash(i * 13.7 + paletteSeed * 5);

        const bw = px((22 + Math.floor(r1 * 36)) * scale);
        const bh = px((60 + Math.floor(r2 * 150)) * scale);
        const x = px(i * 34 * scale - offset);
        const y = px(groundY - bh);

        const hueShift = Math.floor(20 + r3 * 70);
        const color = `rgb(${30 + hueShift}, ${40 + hueShift}, ${60 + hueShift})`;
        block(ctx, x, y, bw, bh, color);

        // windows pattern by seed
        const wx = 4;
        const wy = 6;
        const stepX = Math.max(5, Math.floor(7 * scale));
        const stepY = Math.max(6, Math.floor(9 * scale));
        for (let yy = y + wy; yy < y + bh - 6; yy += stepY) {
          for (let xx = x + wx; xx < x + bw - 4; xx += stepX) {
            const lit = hash(xx * 0.2 + yy * 0.03 + i * 0.7 + paletteSeed) > 0.42;
            block(ctx, xx, yy, Math.max(2, Math.floor(2 * scale)), Math.max(3, Math.floor(3 * scale)), lit ? "#ffd980" : "#1e2a43");
          }
        }

        // rooftop variety
        if (r3 > 0.72) block(ctx, x + bw / 2 - 2, y - 10 * scale, 4, 10 * scale, "#d04f4f");
        if (r1 < 0.18) block(ctx, x + 3, y - 4, bw - 6, 3, "#6be3ff");
      }
    }

    drawStreetDetails(offset, groundY, time) {
      const ctx = this.ctx;
      const c = this.canvas;

      for (let i = -2; i < 22; i += 1) {
        const x = px(i * 88 - (offset % 88));
        // kiosks / storefronts
        block(ctx, x, groundY - 44, 54, 30, "#253b5b");
        const neon = (Math.sin(time * 2 + i) + 1) / 2;
        const sign = neon > 0.5 ? "#7bf7ff" : "#f77bff";
        block(ctx, x + 4, groundY - 40, 46, 6, sign);
        block(ctx, x + 8, groundY - 26, 14, 12, "#5fa8ff");
        block(ctx, x + 30, groundY - 26, 16, 12, "#ffcf5c");

        // lamp posts
        const lx = x + 62;
        block(ctx, lx, groundY - 70, 4, 56, "#1b2333");
        const flicker = hash(i + Math.floor(time * 12)) > 0.2;
        block(ctx, lx - 4, groundY - 74, 12, 6, flicker ? "#ffe38a" : "#8b8f9e");
      }

      // curb and road strips
      block(ctx, 0, groundY - 14, c.width, 4, "#7b8faa");
      for (let x = -30; x < c.width + 60; x += 30) {
        block(ctx, x - (offset % 30), groundY + 18, 16, 2, "#f2f2f2");
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

      if (player.character.id === "liam") block(ctx, bodyX + bodyW - 4, bodyY + 2, 4, 4, "#80ffdb");
      if (player.character.id === "addy") {
        block(ctx, bodyX - 2, y + 1, 3, 3, "#ff99c8");
        block(ctx, bodyX + head, y + 1, 3, 3, "#ff99c8");
      }
      if (player.kickTimer > 0) block(ctx, x + w + 2, legY + 3, 16, 3, "#ffe48a");
      if (player.shieldTimer > 0) {
        this.ctx.strokeStyle = "#8ce0ff";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x - 5, y - 4, w + 10, h + 10);
      }
    }

    render(state) {
      const ctx = this.ctx;
      const c = this.canvas;
      const distance = state.distance;
      const groundY = state.groundY;
      const t = state.animationClock + distance * 0.01;

      ctx.imageSmoothingEnabled = false;
      this.parallax.far = (distance * 0.06) % c.width;
      this.parallax.mid = (distance * 0.14) % c.width;
      this.parallax.near = (distance * 0.28) % c.width;

      this.drawSky(t);
      this.drawCityLayer(distance * 0.08, groundY - 18, 1.25, 1.7);
      this.drawCityLayer(distance * 0.15, groundY + 2, 0.95, 9.2);
      this.drawCityLayer(distance * 0.24, groundY + 20, 0.72, 21.4);

      block(ctx, 0, groundY, c.width, c.height - groundY, this.level.backdrop.ground);
      this.drawStreetDetails(distance * 0.33, groundY, t);

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
