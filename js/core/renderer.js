(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});

  function px(v) { return Math.round(v); }
  function block(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(px(x), px(y), px(w), px(h)); }
  function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function wrap(value, size) {
    const remainder = value % size;
    return remainder < 0 ? remainder + size : remainder;
  }
  function circle(ctx, x, y, r, color, alpha) {
    ctx.save();
    if (typeof alpha === "number") ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px(x), px(y), Math.max(1, r), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const PALETTES = {
    desert: { skyA: "#ffb16b", skyB: "#ffd39c", skyC: "#fff0ca", ground: "#d9b36c", groundAlt: "#c79251", propA: "#d8a065", propB: "#8f542d", detail: "#f2d29b", glow: "#ffebaf", water: "#6dc5d4" },
    farm: { skyA: "#7bc6ff", skyB: "#bce8ff", skyC: "#f0fbff", ground: "#87b45b", groundAlt: "#6d9d48", propA: "#8ab96d", propB: "#c85b45", detail: "#f5d773", glow: "#fff4b3", water: "#6bb7ee" },
    marsh: { skyA: "#5d7f70", skyB: "#88ab96", skyC: "#d3e6d5", ground: "#4f7a4b", groundAlt: "#45663f", propA: "#5f7d63", propB: "#314a37", detail: "#b0ce6e", glow: "#e7f3cf", water: "#4a8a7f" },
    city: { skyA: "#33405f", skyB: "#636d9e", skyC: "#f2a77b", ground: "#5d6774", groundAlt: "#434d59", propA: "#2f3b52", propB: "#445774", detail: "#ffdd7a", glow: "#ffd19c", water: "#5876a5" },
    space: { skyA: "#080d20", skyB: "#1a2451", skyC: "#2a3160", ground: "#3c4163", groundAlt: "#2c3150", propA: "#2a2f4d", propB: "#5a6eb0", detail: "#bfd3ff", glow: "#94b5ff", water: "#3d5090" },
    volcano: { skyA: "#281517", skyB: "#6b2923", skyC: "#c15e37", ground: "#5b3f32", groundAlt: "#392823", propA: "#5a2f36", propB: "#422725", detail: "#ff7a47", glow: "#ffae58", water: "#7d3434" },
    snow: { skyA: "#8ed2ff", skyB: "#d7f1ff", skyC: "#ffffff", ground: "#d9ebf7", groundAlt: "#c8deee", propA: "#b6d2e8", propB: "#6188ad", detail: "#ffffff", glow: "#fffef3", water: "#8cc7f5" },
    beach: { skyA: "#4dc4f5", skyB: "#9de3ff", skyC: "#effdff", ground: "#e5cb87", groundAlt: "#d3ba72", propA: "#68c5d6", propB: "#7f5b3a", detail: "#fff6d6", glow: "#fff2a5", water: "#4dbbe8" },
    jungle: { skyA: "#3b7243", skyB: "#73b865", skyC: "#ccecb1", ground: "#4d7a38", groundAlt: "#395c2d", propA: "#4f7d43", propB: "#24412b", detail: "#7ccd6f", glow: "#ffef9d", water: "#4f98a0" },
    cyber: { skyA: "#090d24", skyB: "#1b1d47", skyC: "#402e73", ground: "#344260", groundAlt: "#1a223b", propA: "#202749", propB: "#2a3562", detail: "#31f3ff", glow: "#ff61d8", water: "#2d4d7f" }
  };

  const DISTRICT_SEQUENCES = {
    desert: ["dunes", "ruins", "oasis", "canyon", "outpost"],
    farm: ["fields", "orchard", "pond", "barnyard", "village"],
    marsh: ["reeds", "boardwalk", "bog", "shacks", "deepwater"],
    city: ["homes", "park", "riverwalk", "shops", "downtown"],
    space: ["craters", "colony", "crystals", "station", "satellites"],
    volcano: ["ashfield", "basalt", "lavafall", "forge", "smoke"],
    snow: ["pines", "cabins", "lake", "cliffs", "village"],
    beach: ["shore", "palms", "boardwalk", "pier", "resort"],
    jungle: ["canopy", "ruins", "river", "camp", "falls"],
    cyber: ["alley", "market", "transit", "garden", "towers"]
  };

  class Renderer {
    constructor(canvas, level) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.level = level;
    }

    setLevel(level) { this.level = level; }

    palette(biome) {
      return PALETTES[biome] || PALETTES.city;
    }

    sceneForWorld(biome, worldX) {
      const scenes = DISTRICT_SEQUENCES[biome] || DISTRICT_SEQUENCES.city;
      const sceneIndex = Math.floor(worldX / 420);
      return scenes[((sceneIndex % scenes.length) + scenes.length) % scenes.length];
    }

    drawOrb(x, y, radius, core, glow, alpha) {
      circle(this.ctx, x, y, radius * 1.9, glow, typeof alpha === "number" ? alpha * 0.2 : 0.2);
      circle(this.ctx, x, y, radius * 1.35, glow, typeof alpha === "number" ? alpha * 0.32 : 0.32);
      circle(this.ctx, x, y, radius, core, alpha);
    }

    drawCloud(x, y, scale, color, alpha) {
      const ctx = this.ctx;
      ctx.save();
      if (typeof alpha === "number") ctx.globalAlpha = alpha;
      block(ctx, x - 24 * scale, y - 8 * scale, 72 * scale, 22 * scale, color);
      circle(ctx, x - 8 * scale, y, 18 * scale, color);
      circle(ctx, x + 12 * scale, y - 10 * scale, 22 * scale, color);
      circle(ctx, x + 34 * scale, y - 2 * scale, 16 * scale, color);
      ctx.restore();
    }

    drawSky(distance, biome, groundY) {
      const ctx = this.ctx;
      const c = this.canvas;
      const p = this.palette(biome);
      const g = ctx.createLinearGradient(0, 0, 0, groundY);
      g.addColorStop(0, p.skyA);
      g.addColorStop(0.58, p.skyB);
      g.addColorStop(1, p.skyC);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, c.width, groundY);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(0, groundY - 112, c.width, 112);

      if (biome === "space") {
        this.drawOrb(c.width * 0.76, 88, 52, "#7f93ff", p.glow, 0.9);
        this.drawOrb(c.width * 0.2, 142, 22, "#ff9fd4", "#ff9fd4", 0.58);
        for (let i = 0; i < 120; i += 1) {
          const x = wrap(i * 83 - distance * (0.06 + (i % 5) * 0.01), c.width);
          const y = 24 + hash(i * 2.7) * (groundY - 80);
          const size = 1 + Math.floor(hash(i * 7.4) * 3);
          block(ctx, x, y, size, size, i % 5 === 0 ? "#ffffff" : p.detail);
        }
        return;
      }

      if (biome === "cyber") {
        this.drawOrb(c.width * 0.74, 100, 46, "#ff78df", p.glow, 0.88);
        for (let y = 42; y < groundY - 120; y += 22) {
          block(ctx, 0, y, c.width, 1, "rgba(255, 97, 216, 0.12)");
        }
      } else if (biome === "volcano") {
        this.drawOrb(c.width * 0.74, 94, 26, "#ffca7b", p.glow, 0.72);
        this.drawCloud(260 - wrap(distance * 0.018, c.width + 240), 74, 1.3, "#431d1c", 0.52);
        this.drawCloud(620 - wrap(distance * 0.01, c.width + 240), 122, 1.05, "#502322", 0.44);
      } else if (biome === "city") {
        this.drawOrb(c.width * 0.72, groundY * 0.32, 30, "#ffc997", p.glow, 0.76);
        this.drawCloud(220 - wrap(distance * 0.02, c.width + 260), 78, 1.02, "#7f86b3", 0.24);
        this.drawCloud(760 - wrap(distance * 0.012, c.width + 260), 118, 0.88, "#a79bc2", 0.2);
      } else {
        this.drawOrb(c.width * (biome === "desert" || biome === "beach" ? 0.78 : 0.72), biome === "desert" ? groundY * 0.28 : 84, biome === "beach" ? 34 : 28, p.glow, p.glow, 0.9);
        this.drawCloud(150 - wrap(distance * 0.016, c.width + 220), biome === "farm" ? 72 : 86, 1.08, "#ffffff", biome === "jungle" ? 0.16 : 0.72);
        this.drawCloud(560 - wrap(distance * 0.01, c.width + 220), biome === "snow" ? 122 : 110, 0.88, "#ffffff", biome === "marsh" ? 0.22 : 0.62);
      }
    }

    drawBackdropBands(distance, biome, groundY) {
      const ctx = this.ctx;
      const p = this.palette(biome);

      if (biome === "desert") {
        for (let i = -1; i < 7; i += 1) {
          const x = i * 220 - (distance * 0.05 % 220);
          const scene = this.sceneForWorld(biome, i * 440);
          const radius = scene === "canyon" ? 148 : 128 + (i % 3) * 18;
          circle(ctx, x + 110, groundY + 42, radius, scene === "dunes" ? p.propA : p.propB, 0.96);
        }
        for (let i = -1; i < 6; i += 1) {
          const x = i * 250 - (distance * 0.08 % 250);
          const scene = this.sceneForWorld(biome, i * 500);
          if (scene === "ruins" || scene === "outpost" || scene === "canyon") {
            const height = scene === "canyon" ? 132 : 104;
            block(ctx, x + 72, groundY - height - (i % 2) * 18, 112, height, p.propB);
            block(ctx, x + 90, groundY - height - 10 - (i % 2) * 18, 76, 10, p.detail);
          }
        }
        return;
      }

      if (biome === "farm") {
        for (let i = -1; i < 8; i += 1) {
          const x = i * 180 - (distance * 0.06 % 180);
          const scene = this.sceneForWorld(biome, i * 360);
          circle(ctx, x + 80, groundY + 32, 108 + (i % 2) * 14, p.propA, 0.96);
          circle(ctx, x + 140, groundY + 40, 96, "#6a9e52", 0.9);
          if (scene === "village" || scene === "barnyard") block(ctx, x + 82, groundY - 78, 54, 46, p.propB);
          if (scene === "pond") block(ctx, x + 54, groundY - 38, 42, 8, p.water);
        }
        return;
      }

      if (biome === "marsh") {
        block(ctx, 0, groundY - 50, this.canvas.width, 24, p.water);
        for (let i = -1; i < 8; i += 1) {
          const x = i * 170 - (distance * 0.05 % 170);
          circle(ctx, x + 72, groundY + 30, 96, p.propA, 0.82);
          block(ctx, x + 40, groundY - 92 - (i % 2) * 10, 16, 66, p.propB);
        }
        return;
      }

      if (biome === "city" || biome === "cyber") {
        for (let i = -1; i < 14; i += 1) {
          const x = i * 82 - (distance * 0.08 % 82);
          const scene = this.sceneForWorld(biome, i * 328);
          const h = 80 + (i % 5) * 24 + (scene === "downtown" || scene === "towers" ? 56 : 0) - (scene === "park" || scene === "garden" ? 32 : 0);
          block(ctx, x, groundY - 80 - h, 66, h + 80, scene === "park" || scene === "garden" ? p.propB : p.propA);
          block(ctx, x + 8, groundY - 70 - h, 10, h - 12, p.propB);
          if (biome === "cyber") block(ctx, x + 4, groundY - 80 - h, 58, 4, p.detail);
        }
        if (biome === "cyber") {
          for (let x = -40; x < this.canvas.width + 60; x += 44) {
            const lineX = x - (distance * 0.18 % 44);
            block(ctx, lineX + 22, groundY - 70, 1, 62, "rgba(49,243,255,0.18)");
          }
        }
        return;
      }

      if (biome === "space") {
        for (let i = -1; i < 7; i += 1) {
          const x = i * 210 - (distance * 0.05 % 210);
          circle(ctx, x + 100, groundY + 32, 108, p.propA, 0.92);
          circle(ctx, x + 140, groundY - 8, 20, p.propB, 0.86);
        }
        block(ctx, 0, groundY - 32, this.canvas.width, 12, "rgba(191,211,255,0.08)");
        return;
      }

      if (biome === "volcano") {
        block(ctx, 140 - (distance * 0.02 % 360), groundY - 220, 180, 188, p.propA);
        block(ctx, 200 - (distance * 0.02 % 360), groundY - 236, 60, 18, p.detail);
        block(ctx, 224 - (distance * 0.02 % 360), groundY - 218, 12, 152, p.detail);
        block(ctx, 228 - (distance * 0.02 % 360), groundY - 168, 4, 104, "#ffd7a1");
        for (let i = -1; i < 7; i += 1) {
          const x = i * 180 - (distance * 0.07 % 180);
          circle(ctx, x + 84, groundY + 44, 118, "#31181d", 0.9);
        }
        return;
      }

      if (biome === "snow") {
        for (let i = -1; i < 8; i += 1) {
          const x = i * 150 - (distance * 0.05 % 150);
          block(ctx, x, groundY - 116 - (i % 3) * 14, 112, 116, p.propA);
          block(ctx, x + 18, groundY - 124 - (i % 3) * 14, 76, 12, p.detail);
        }
        return;
      }

      if (biome === "beach") {
        block(ctx, 0, groundY - 78, this.canvas.width, 40, p.water);
        for (let i = -1; i < 7; i += 1) {
          const x = i * 220 - (distance * 0.06 % 220);
          const scene = this.sceneForWorld(biome, i * 440);
          circle(ctx, x + 100, groundY - 34, scene === "resort" ? 66 : 58, p.propA, 0.78);
          if (scene === "boardwalk" || scene === "resort") block(ctx, x + 74, groundY - 82, 56, 26, p.propB);
        }
        return;
      }

      if (biome === "jungle") {
        for (let i = -1; i < 7; i += 1) {
          const x = i * 190 - (distance * 0.05 % 190);
          const scene = this.sceneForWorld(biome, i * 380);
          circle(ctx, x + 86, groundY + 8, 118, p.propA, 0.94);
          if (scene === "falls" || scene === "river") block(ctx, x + 132, groundY - 140, 16, 100, "#84d8ef");
          if (scene === "ruins") block(ctx, x + 72, groundY - 92, 44, 52, "#5e6b4a");
        }
        return;
      }
    }

    drawDistrictObject(x, y, scene, seed, biome) {
      const ctx = this.ctx;
      const p = this.palette(biome);
      const size = 26 + Math.floor(hash(seed + 1) * 26);
      const tall = size + 10 + Math.floor(hash(seed + 2) * 26);
      const wide = 28 + Math.floor(hash(seed + 3) * 28);

      if (biome === "desert") {
        if (scene === "oasis") {
          block(ctx, x + 2, y - 12, 60, 10, p.water);
          block(ctx, x + 16, y - size - 4, 10, size + 4, p.propB);
          block(ctx, x + 10, y - size + 8, 22, 6, p.detail);
          block(ctx, x + 34, y - size - 10, 10, size + 10, p.propB);
          block(ctx, x + 30, y - size - 4, 22, 6, p.detail);
        } else if (scene === "ruins" || scene === "outpost") {
          block(ctx, x + 6, y - size, wide, size, p.propB);
          block(ctx, x + 4, y - size - 10, wide + 4, 10, p.detail);
          block(ctx, x + 18, y - 18, 12, 18, "#60402a");
        } else if (scene === "canyon") {
          block(ctx, x + 8, y - tall, 12, tall, p.propB);
          block(ctx, x + 34, y - size, 16, size, p.propB);
          block(ctx, x + 8, y - tall, 42, 10, p.detail);
        } else {
          block(ctx, x + 18, y - size - 12, 12, size + 12, p.propB);
          block(ctx, x + 8, y - size, 8, 20, p.propB);
          block(ctx, x + 30, y - size - 8, 8, 18, p.propB);
          block(ctx, x + 20, y - size - 6, 8, 4, p.detail);
        }
        return;
      }

      if (biome === "farm") {
        if (scene === "fields") {
          block(ctx, x + 22, y - tall, 8, tall, "#7e5431");
          block(ctx, x + 4, y - size - 8, 44, 4, p.detail);
          block(ctx, x + 26, y - tall - 16, 3, 16, p.detail);
        } else if (scene === "orchard") {
          block(ctx, x + 18, y - size, 10, size, "#66482a");
          circle(ctx, x + 16, y - size + 6, 16, "#6fa94e");
          circle(ctx, x + 30, y - size - 4, 18, "#85c761");
          circle(ctx, x + 42, y - size + 8, 14, "#6fa94e");
        } else if (scene === "pond") {
          block(ctx, x + 2, y - 10, 58, 8, p.water);
          block(ctx, x + 12, y - 18, 4, 16, p.propA);
          block(ctx, x + 18, y - 22, 4, 20, p.propA);
          block(ctx, x + 32, y - 16, 10, 4, p.detail);
        } else if (scene === "village") {
          block(ctx, x + 6, y - size, wide, size, "#9f6f4f");
          block(ctx, x + 2, y - size - 12, wide + 8, 12, "#7e5431");
          block(ctx, x + 18, y - 16, 12, 16, p.detail);
          block(ctx, x + 36, y - size + 10, 10, 8, "#fff8d8");
        } else {
          block(ctx, x + 4, y - size, 50, size, p.propB);
          block(ctx, x, y - size - 12, 58, 12, "#7e5431");
          block(ctx, x + 20, y - 18, 14, 18, p.detail);
          block(ctx, x + 38, y - 16, 10, 10, "#e8c66e");
        }
        return;
      }

      if (biome === "marsh") {
        if (scene === "reeds" || scene === "deepwater") {
          const waterW = scene === "deepwater" ? 62 : 46;
          block(ctx, x + 4, y - 10, waterW, 8, p.water);
          for (let i = 0; i < 4; i += 1) {
            block(ctx, x + 10 + i * 7, y - 24 - i * 3, 2, 24 + i * 3, p.propB);
            block(ctx, x + 9 + i * 7, y - 28 - i * 3, 4, 4, p.detail);
          }
        } else if (scene === "boardwalk") {
          block(ctx, x + 4, y - 18, 56, 8, "#7a5840");
          block(ctx, x + 12, y - 10, 6, 10, "#5c4330");
          block(ctx, x + 40, y - 10, 6, 10, "#5c4330");
        } else if (scene === "shacks") {
          block(ctx, x + 8, y - size + 6, 40, size - 6, "#5e4a36");
          block(ctx, x + 4, y - size - 2, 48, 8, "#7d6550");
          block(ctx, x + 22, y - 16, 10, 16, "#2a2118");
        } else {
          block(ctx, x + 22, y - tall, 8, tall, "#3a2c20");
          block(ctx, x + 12, y - size + 10, 28, 4, p.propB);
          block(ctx, x + 8, y - size + 22, 10, 3, p.propB);
        }
        return;
      }

      if (biome === "city") {
        if (scene === "homes") {
          const houseH = 24 + Math.floor(hash(seed + 4) * 24);
          const houseW = 30 + Math.floor(hash(seed + 5) * 28);
          block(ctx, x + 6, y - houseH, houseW, houseH, p.propB);
          block(ctx, x + 2, y - houseH - 10, houseW + 8, 10, p.detail);
          block(ctx, x + 16, y - 18, 10, 18, "#172032");
          block(ctx, x + houseW - 2, y - houseH + 8, 8, 8, "#fff6c2");
        } else if (scene === "shops") {
          block(ctx, x + 4, y - size, 54, size, p.propB);
          block(ctx, x + 8, y - size + 8, 46, 8, p.detail);
          block(ctx, x + 12, y - 16, 30, 12, "#172032");
          block(ctx, x + 38, y - size + 20, 12, 8, "#ffe49a");
        } else if (scene === "park") {
          block(ctx, x + 20, y - size, 8, size, "#66482a");
          circle(ctx, x + 16, y - size + 4, 18, "#6eb56a");
          circle(ctx, x + 32, y - size - 2, 18, "#85c96a");
          block(ctx, x + 42, y - 26, 10, 4, p.detail);
          block(ctx, x + 48, y - 36, 3, 18, p.detail);
          block(ctx, x + 38, y - 38, 18, 3, p.detail);
        } else if (scene === "riverwalk") {
          block(ctx, x, y - 10, 60, 8, p.water);
          block(ctx, x + 22, y - tall, 6, tall, p.propB);
          block(ctx, x + 22, y - tall, 20, 4, p.detail);
          block(ctx, x + 38, y - tall + 4, 8, 6, p.detail);
        } else {
          const towerH = tall + 20 + Math.floor(hash(seed + 6) * 26);
          block(ctx, x + 6, y - towerH, 48, towerH, p.propA);
          for (let wy = y - towerH + 10; wy < y - 8; wy += 10) {
            for (let wx = x + 12; wx < x + 48; wx += 10) {
              block(ctx, wx, wy, 4, 4, hash(wx + wy + seed) > 0.4 ? p.detail : "#192231");
            }
          }
        }
        return;
      }

      if (biome === "space") {
        if (scene === "colony") {
          block(ctx, x + 2, y - 18, 58, 18, p.propA);
          circle(ctx, x + 31, y - 18, 20, p.propB, 0.95);
          block(ctx, x + 16, y - 14, 30, 4, p.detail);
        } else if (scene === "station" || scene === "satellites") {
          block(ctx, x + 24, y - tall, 6, tall, p.propB);
          block(ctx, x + 8, y - tall + 6, 38, 3, p.detail);
          block(ctx, x + 26, y - tall - 14, 3, 14, p.detail);
          if (scene === "satellites") block(ctx, x + 4, y - tall + 10, 12, 6, p.detail);
        } else if (scene === "crystals") {
          block(ctx, x + 12, y - 24, 12, 24, p.propB);
          block(ctx, x + 24, y - 36, 10, 36, p.detail);
          block(ctx, x + 36, y - 18, 10, 18, p.propB);
        } else {
          circle(ctx, x + 26, y - 8, 18, p.groundAlt, 0.92);
          circle(ctx, x + 42, y - 2, 14, p.propA, 0.82);
        }
        return;
      }

      if (biome === "volcano") {
        if (scene === "lavafall" || scene === "forge") {
          block(ctx, x + 4, y - 10, 50, 10, p.water);
          block(ctx, x + 12, y - 8, 18, 3, p.detail);
          if (scene === "lavafall") block(ctx, x + 24, y - tall, 8, tall - 10, p.detail);
        } else if (scene === "basalt" || scene === "ashfield") {
          block(ctx, x + 12, y - tall, 16, tall, p.propB);
          block(ctx, x + 32, y - size + 6, 12, size - 6, p.propB);
          block(ctx, x + 24, y - tall + 8, 4, tall - 14, p.detail);
        } else {
          block(ctx, x + 22, y - size, 12, size, p.propB);
          circle(ctx, x + 28, y - size, 18, p.detail, 0.18);
          block(ctx, x + 26, y - size - 12, 4, 12, p.detail);
        }
        return;
      }

      if (biome === "snow") {
        if (scene === "pines") {
          block(ctx, x + 22, y - tall, 8, tall, "#5d4734");
          block(ctx, x + 8, y - size + 12, 36, 10, p.propB);
          block(ctx, x + 2, y - size + 28, 48, 10, p.propB);
          block(ctx, x + 14, y - size + 10, 16, 4, p.detail);
        } else if (scene === "cabins" || scene === "village") {
          const cabinW = scene === "village" ? 52 : 42;
          block(ctx, x + 8, y - size + 6, cabinW, size - 6, "#7ea2be");
          block(ctx, x + 2, y - size - 4, cabinW + 12, 10, "#54718f");
          block(ctx, x + 22, y - 16, 14, 16, p.detail);
          if (scene === "village") block(ctx, x + 40, y - size + 16, 10, 8, "#fff4b0");
        } else if (scene === "lake") {
          block(ctx, x + 4, y - 10, 52, 8, p.water);
          block(ctx, x + 12, y - 12, 18, 3, p.detail);
        } else {
          circle(ctx, x + 18, y - 2, 16, p.propB, 0.9);
          circle(ctx, x + 34, y - 8, 18, p.detail, 0.92);
        }
        return;
      }

      if (biome === "beach") {
        if (scene === "palms") {
          block(ctx, x + 18, y - tall, 8, tall, p.propB);
          block(ctx, x + 6, y - size + 4, 24, 6, "#3fbb7f");
          block(ctx, x + 18, y - size - 8, 24, 6, "#3fbb7f");
          block(ctx, x + 12, y - size - 18, 18, 6, "#3fbb7f");
        } else if (scene === "boardwalk" || scene === "pier") {
          block(ctx, x + 4, y - 18, 54, 8, "#7f5b3a");
          block(ctx, x + 10, y - 10, 6, 10, "#5f4126");
          block(ctx, x + 40, y - 10, 6, 10, "#5f4126");
          if (scene === "boardwalk") block(ctx, x + 22, y - 34, 3, 24, p.detail);
        } else if (scene === "resort") {
          block(ctx, x + 8, y - size + 6, 44, size - 6, "#d2a66c");
          block(ctx, x + 2, y - size - 4, 56, 10, p.propB);
          block(ctx, x + 24, y - 16, 12, 16, p.detail);
          block(ctx, x + 38, y - size + 12, 10, 8, "#fff1ce");
        } else {
          block(ctx, x + 26, y - 28, 3, 28, p.propB);
          block(ctx, x + 6, y - 34, 44, 8, "#ff8f76");
        }
        return;
      }

      if (biome === "jungle") {
        if (scene === "canopy") {
          block(ctx, x + 20, y - tall, 10, tall, "#4e331f");
          circle(ctx, x + 16, y - size + 2, 18, "#2f7a3d");
          circle(ctx, x + 30, y - size - 6, 20, "#4eb157");
          circle(ctx, x + 42, y - size + 6, 16, "#2f7a3d");
        } else if (scene === "ruins" || scene === "camp") {
          block(ctx, x + 6, y - size + 4, 12, size - 4, "#5e6b4a");
          block(ctx, x + 38, y - size + 4, 12, size - 4, "#5e6b4a");
          block(ctx, x + 6, y - size, 44, 8, "#92c96e");
          if (scene === "camp") block(ctx, x + 22, y - 20, 12, 20, "#a87035");
        } else if (scene === "river" || scene === "falls") {
          block(ctx, x + 24, y - tall, 10, tall, "#84d8ef");
          block(ctx, x + 10, y - 16, 38, 8, p.water);
          block(ctx, x + 16, y - 12, 18, 3, p.detail);
        } else {
          block(ctx, x + 8, y - 14, 48, 6, "#6f4c28");
          block(ctx, x + 18, y - size, 8, size - 14, p.detail);
          block(ctx, x + 34, y - size + 8, 8, size - 22, p.detail);
        }
        return;
      }

      if (scene === "towers") {
        block(ctx, x + 10, y - tall - 12, 34, tall + 12, p.propB);
        block(ctx, x + 24, y - tall - 12, 4, tall + 12, p.detail);
        block(ctx, x + 10, y - tall - 4, 34, 4, p.detail);
      } else if (scene === "market") {
        block(ctx, x + 6, y - size, 50, size, "#18203c");
        block(ctx, x + 12, y - size + 10, 38, 4, p.detail);
        block(ctx, x + 18, y - size + 24, 22, 4, p.glow);
      } else if (scene === "garden") {
        block(ctx, x + 8, y - 10, 48, 8, p.water);
        circle(ctx, x + 20, y - 18, 10, p.detail, 0.8);
        circle(ctx, x + 38, y - 22, 10, p.glow, 0.8);
      } else {
        block(ctx, x + 8, y - 18, 48, 10, p.propB);
        block(ctx, x + 18, y - tall, 8, tall - 18, p.detail);
        block(ctx, x + 34, y - size + 8, 8, size - 26, p.detail);
      }
    }

    drawDynamicPath(distance, biome, groundY) {
      const ctx = this.ctx;
      const p = this.palette(biome);
      const worldStart = Math.floor((distance - 140) / 92);
      const worldEnd = Math.floor((distance + this.canvas.width + 140) / 92);

      for (let i = worldStart; i <= worldEnd; i += 1) {
        const x = i * 92 - distance;
        const worldX = i * 92;
        const seed = i * 12.7 + this.level.id * 40;
        const scene = this.sceneForWorld(biome, worldX);
        this.drawDistrictObject(x, groundY - 8, scene, seed, biome);
      }

      block(ctx, 0, groundY, this.canvas.width, this.canvas.height - groundY, p.ground);
      block(ctx, 0, groundY, this.canvas.width, 10, p.groundAlt);

      if (biome === "desert") {
        for (let x = -30; x < this.canvas.width + 40; x += 52) {
          const drift = x - (distance * 0.28 % 52);
          block(ctx, drift, groundY + 18, 32, 2, p.detail);
          circle(ctx, drift + 12, groundY + 34, 2, p.propB);
        }
      } else if (biome === "farm") {
        for (let x = -20; x < this.canvas.width + 20; x += 28) {
          const furrow = x - (distance * 0.34 % 28);
          block(ctx, furrow, groundY + 12, 3, this.canvas.height - groundY - 12, "rgba(84,116,50,0.42)");
        }
      } else if (biome === "marsh") {
        for (let x = -30; x < this.canvas.width + 40; x += 68) {
          const puddle = x - (distance * 0.24 % 68);
          block(ctx, puddle, groundY + 10, 30, 8, p.water);
          block(ctx, puddle + 6, groundY + 12, 12, 2, "#9bd5c8");
        }
      } else if (biome === "city") {
        block(ctx, 0, groundY + 10, this.canvas.width, this.canvas.height - groundY - 10, p.groundAlt);
        for (let x = -18; x < this.canvas.width + 36; x += 46) {
          const lane = x - (distance * 0.3 % 46);
          block(ctx, lane, groundY + 22, 24, 4, "#f3e4a4");
        }
        block(ctx, 0, groundY + 44, this.canvas.width, 4, "#7e8a95");
      } else if (biome === "space") {
        for (let x = -60; x < this.canvas.width + 60; x += 92) {
          const crater = x - (distance * 0.18 % 92);
          circle(ctx, crater + 36, groundY + 26, 16, p.groundAlt, 0.86);
          circle(ctx, crater + 40, groundY + 28, 8, p.propA, 0.6);
        }
      } else if (biome === "volcano") {
        block(ctx, 0, groundY + 10, this.canvas.width, this.canvas.height - groundY - 10, p.groundAlt);
        for (let x = -50; x < this.canvas.width + 60; x += 78) {
          const crack = x - (distance * 0.22 % 78);
          block(ctx, crack, groundY + 16, 20, 3, p.detail);
          block(ctx, crack + 12, groundY + 30, 12, 3, p.detail);
          block(ctx, crack + 6, groundY + 46, 18, 3, p.detail);
        }
      } else if (biome === "snow") {
        block(ctx, 0, groundY + 8, this.canvas.width, this.canvas.height - groundY - 8, "#edf8ff");
        for (let x = -24; x < this.canvas.width + 40; x += 54) {
          const track = x - (distance * 0.26 % 54);
          circle(ctx, track + 10, groundY + 26, 6, "#c5ddeb", 0.72);
          circle(ctx, track + 26, groundY + 34, 6, "#c5ddeb", 0.72);
        }
      } else if (biome === "beach") {
        block(ctx, 0, groundY + 10, this.canvas.width, this.canvas.height - groundY - 10, p.groundAlt);
        for (let x = -40; x < this.canvas.width + 50; x += 60) {
          const foam = x - (distance * 0.28 % 60);
          block(ctx, foam, groundY + 14, 30, 3, p.detail);
          circle(ctx, foam + 36, groundY + 20, 4, p.detail, 0.82);
        }
      } else if (biome === "jungle") {
        block(ctx, 0, groundY + 10, this.canvas.width, this.canvas.height - groundY - 10, p.groundAlt);
        for (let x = -40; x < this.canvas.width + 40; x += 72) {
          const root = x - (distance * 0.22 % 72);
          block(ctx, root, groundY + 18, 28, 3, "#6f4c28");
          block(ctx, root + 18, groundY + 34, 24, 3, "#6f4c28");
          block(ctx, root + 24, groundY + 20, 10, 6, p.detail);
        }
      } else {
        block(ctx, 0, groundY + 10, this.canvas.width, this.canvas.height - groundY - 10, p.groundAlt);
        for (let x = -20; x < this.canvas.width + 30; x += 42) {
          const lane = x - (distance * 0.38 % 42);
          block(ctx, lane, groundY + 20, 20, 3, p.detail);
        }
        for (let gy = groundY + 16; gy < this.canvas.height; gy += 16) {
          block(ctx, 0, gy, this.canvas.width, 1, "rgba(255,97,216,0.22)");
        }
      }
    }

    drawAtmosphere(distance, biome, groundY) {
      const ctx = this.ctx;
      const p = this.palette(biome);

      if (biome === "desert") {
        for (let i = 0; i < 14; i += 1) {
          const x = wrap(i * 88 - distance * (0.36 + i * 0.004), this.canvas.width);
          const y = groundY - 28 + hash(i * 3.2) * 40;
          block(ctx, x, y, 10, 1, "rgba(255,241,219,0.45)");
        }
      } else if (biome === "marsh") {
        ctx.fillStyle = "rgba(226,241,225,0.14)";
        ctx.fillRect(0, groundY - 18, this.canvas.width, 34);
      } else if (biome === "volcano") {
        for (let i = 0; i < 24; i += 1) {
          const x = wrap(i * 51 - distance * (0.22 + i * 0.006), this.canvas.width);
          const y = groundY - 120 + hash(i * 2.8) * 100;
          const size = 2 + Math.floor(hash(i * 9.2) * 3);
          block(ctx, x, y, size, size, i % 3 === 0 ? "#ffd7a1" : p.detail);
        }
      } else if (biome === "snow") {
        for (let i = 0; i < 32; i += 1) {
          const x = wrap(i * 43 - distance * (0.18 + i * 0.002), this.canvas.width);
          const y = 30 + wrap(i * 26 + distance * (0.24 + i * 0.001), groundY - 18);
          const size = 2 + Math.floor(hash(i * 1.9) * 3);
          block(ctx, x, y, size, size, "#ffffff");
        }
      } else if (biome === "jungle") {
        for (let i = 0; i < 18; i += 1) {
          const x = wrap(i * 60 - distance * 0.18, this.canvas.width);
          const y = groundY - 90 + hash(i * 4.1) * 72;
          circle(ctx, x, y, 3, "#f3ff9b", 0.18 + (i % 4) * 0.04);
        }
      } else if (biome === "cyber") {
        for (let x = 0; x < this.canvas.width; x += 54) {
          const drop = wrap(x * 2.1 + distance * 0.42, groundY + 120);
          block(ctx, x, drop - 40, 2, 34, "rgba(49,243,255,0.32)");
        }
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
      const ctx = this.ctx;
      const c = this.canvas;
      const distance = state.distance * 6.5;
      const groundY = state.groundY;
      const biome = this.level.biome || "city";
      const accent = this.palette(biome).detail;
      ctx.imageSmoothingEnabled = false;

      this.drawSky(distance, biome, groundY);
      this.drawBackdropBands(distance, biome, groundY);
      this.drawDynamicPath(distance, biome, groundY);
      this.drawAtmosphere(distance, biome, groundY);

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
      block(ctx, 20, 14, (c.width - 40) * progress, 12, accent);
    }
  }

  FamilyDash.Renderer = Renderer;
})();
