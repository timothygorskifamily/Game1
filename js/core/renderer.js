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
  function pixelLine(ctx, x1, y1, x2, y2, size, color) {
    const thickness = Math.max(1, px(size));
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1))));
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      block(
        ctx,
        x1 + (x2 - x1) * t - thickness / 2,
        y1 + (y2 - y1) * t - thickness / 2,
        thickness,
        thickness,
        color
      );
    }
  }
  function wedge(ctx, x, y, w, h, color, reverse) {
    const step = 2;
    for (let i = 0; i < w; i += step) {
      const ratio = reverse ? i / Math.max(1, w - step) : 1 - i / Math.max(1, w - step);
      const columnHeight = Math.max(2, Math.round(h * ratio));
      block(ctx, x + i, y + h - columnHeight, step, columnHeight, color);
    }
  }
  function hexToRgb(color) {
    const raw = String(color || "").trim();
    const rgbMatch = raw.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1], 10),
        g: parseInt(rgbMatch[2], 10),
        b: parseInt(rgbMatch[3], 10)
      };
    }
    const value = raw.replace("#", "");
    if (value.length !== 6) return { r: 255, g: 255, b: 255 };
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16)
    };
  }
  function mixColor(a, b, t) {
    const colorA = hexToRgb(a);
    const colorB = hexToRgb(b);
    const mix = Math.max(0, Math.min(1, t));
    const r = Math.round(colorA.r + (colorB.r - colorA.r) * mix);
    const g = Math.round(colorA.g + (colorB.g - colorA.g) * mix);
    const bValue = Math.round(colorA.b + (colorB.b - colorA.b) * mix);
    return `rgb(${r}, ${g}, ${bValue})`;
  }
  function alphaColor(color, alpha) {
    const { r, g, b } = hexToRgb(color);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

  const OBSTACLE_THEMES = {
    desert: {
      cone: { style: "cactus", base: "#5f7d4d", accent: "#d9b36c", trim: "#f2d29b" },
      toyBox: { style: "crate", base: "#ad7a44", accent: "#e8c07c", trim: "#6d4727" },
      ramp: { style: "dune", base: "#d7b062", accent: "#f3d7a0", trim: "#b98f52" },
      drone: { style: "scarab", base: "#7b532e", accent: "#f2d29b", trim: "#4c321d" },
      barrel: { style: "jar", base: "#9d6a3a", accent: "#f1d5a3", trim: "#6b4322" },
      pile: { style: "tumbleweed", base: "#b98c53", accent: "#e6bf84", trim: "#7a5830" },
      sign: { style: "trailsign", base: "#8c663c", accent: "#f3d7a0", trim: "#5b3d20" },
      bench: { style: "stonebench", base: "#b58d63", accent: "#e8c89d", trim: "#7e5d3c" },
      crystal: { style: "sandstone", base: "#cf9f64", accent: "#f7d8a2", trim: "#a8733e" }
    },
    farm: {
      cone: { style: "pumpkin", base: "#d67c2d", accent: "#f5c26b", trim: "#5f7b2d" },
      toyBox: { style: "hay", base: "#d8be65", accent: "#fff0a7", trim: "#9f7b2f" },
      ramp: { style: "fence", base: "#c18b58", accent: "#f3d8ae", trim: "#7f532e" },
      drone: { style: "crow", base: "#2a3130", accent: "#f0d775", trim: "#161b1a" },
      barrel: { style: "milk", base: "#d9e3ed", accent: "#8aa4c1", trim: "#6d7f92" },
      pile: { style: "producepile", base: "#ca7b43", accent: "#f0ca63", trim: "#5c8d39" },
      sign: { style: "farmsign", base: "#b47b45", accent: "#f7e2b4", trim: "#6a4425" },
      bench: { style: "cart", base: "#a57244", accent: "#d8b27b", trim: "#6b492b" },
      crystal: { style: "cornshock", base: "#d6c56b", accent: "#fff1a8", trim: "#8f6d2f" }
    },
    marsh: {
      cone: { style: "stump", base: "#725237", accent: "#9f7b56", trim: "#d8c29b" },
      toyBox: { style: "crate", base: "#7d5d43", accent: "#a88b64", trim: "#4f3c2c" },
      ramp: { style: "boardwalk", base: "#82684f", accent: "#b29875", trim: "#4d3f31" },
      drone: { style: "dragonfly", base: "#577986", accent: "#dff6ff", trim: "#30454d" },
      barrel: { style: "barrel", base: "#6d5038", accent: "#8d6d4b", trim: "#3f2d21" },
      pile: { style: "reedstack", base: "#718d59", accent: "#b4cb79", trim: "#486047" },
      sign: { style: "warningsign", base: "#6f5d45", accent: "#d9df89", trim: "#33463a" },
      bench: { style: "dockbench", base: "#705c48", accent: "#a28b6c", trim: "#43352a" },
      crystal: { style: "cattails", base: "#6e8a4d", accent: "#4b341f", trim: "#b5cc80" }
    },
    city: {
      cone: { style: "cone", base: "#ff8f3f", accent: "#fff0d8", trim: "#2e3b57" },
      toyBox: { style: "toolbox", base: "#c04d49", accent: "#f3c35f", trim: "#6f2328" },
      ramp: { style: "barricade", base: "#f4d26b", accent: "#cf5c50", trim: "#374862" },
      drone: { style: "drone", base: "#505a82", accent: "#d7e3ff", trim: "#242d45" },
      barrel: { style: "trashcan", base: "#5f6f83", accent: "#bac7d6", trim: "#304052" },
      pile: { style: "debrispile", base: "#686f75", accent: "#9aa5ae", trim: "#394149" },
      sign: { style: "streetsign", base: "#4671b4", accent: "#d9efff", trim: "#253146" },
      bench: { style: "bench", base: "#555f6b", accent: "#8e99a7", trim: "#2c3541" },
      crystal: { style: "hydrant", base: "#d85147", accent: "#ffd97b", trim: "#8d2e2b" }
    },
    space: {
      cone: { style: "moonrock", base: "#777fae", accent: "#cfd8ff", trim: "#4c5377" },
      toyBox: { style: "crate", base: "#5b618b", accent: "#96a3df", trim: "#2f3451" },
      ramp: { style: "launchpad", base: "#5c678f", accent: "#d5dcff", trim: "#2d3353" },
      drone: { style: "probe", base: "#8a95c8", accent: "#ff9fd4", trim: "#41476d" },
      barrel: { style: "canister", base: "#6973a0", accent: "#d6deff", trim: "#39405f" },
      pile: { style: "meteorcluster", base: "#7178a8", accent: "#b9c8ff", trim: "#41476a" },
      sign: { style: "beacon", base: "#6a78b8", accent: "#ffd5f4", trim: "#d8e2ff" },
      bench: { style: "console", base: "#44527e", accent: "#95a9ee", trim: "#d1dcff" },
      crystal: { style: "crystal", base: "#98a9ff", accent: "#ebf1ff", trim: "#ff9fd4" }
    },
    volcano: {
      cone: { style: "lavarock", base: "#6c3f37", accent: "#ff9a5f", trim: "#35201e" },
      toyBox: { style: "crate", base: "#784d3c", accent: "#b88866", trim: "#41261f" },
      ramp: { style: "basalt", base: "#46343a", accent: "#ff8b52", trim: "#271c20" },
      drone: { style: "emberbat", base: "#5d2424", accent: "#ffb36f", trim: "#281212" },
      barrel: { style: "magma", base: "#5a2f27", accent: "#ff7b47", trim: "#2e1613" },
      pile: { style: "rubblepile", base: "#5a413b", accent: "#8c6654", trim: "#ff8151" },
      sign: { style: "hazardsign", base: "#503231", accent: "#ffb166", trim: "#ff6e4b" },
      bench: { style: "basaltbench", base: "#443439", accent: "#725456", trim: "#ff8b52" },
      crystal: { style: "magmaflare", base: "#6f342d", accent: "#ff8d55", trim: "#ffd38b" }
    },
    snow: {
      cone: { style: "snowman", base: "#f1f8ff", accent: "#89a9c7", trim: "#ffffff" },
      toyBox: { style: "gift", base: "#9ab7d1", accent: "#f7fbff", trim: "#d26b6b" },
      ramp: { style: "snowdrift", base: "#ebf6ff", accent: "#ffffff", trim: "#9bc0da" },
      drone: { style: "owl", base: "#dde6ef", accent: "#f9fdff", trim: "#8b9cad" },
      barrel: { style: "log", base: "#8b6b49", accent: "#c7ab88", trim: "#4f3825" },
      pile: { style: "snowpile", base: "#eef8ff", accent: "#ffffff", trim: "#9fc0d8" },
      sign: { style: "skimarker", base: "#a4bfd8", accent: "#ffffff", trim: "#ce5f65" },
      bench: { style: "sled", base: "#b7784c", accent: "#eec799", trim: "#714727" },
      crystal: { style: "iceshard", base: "#b4d9f8", accent: "#ffffff", trim: "#7ea9c8" }
    },
    beach: {
      cone: { style: "sandcastle", base: "#e2c07a", accent: "#fff1b2", trim: "#b28f56" },
      toyBox: { style: "cooler", base: "#52a9c7", accent: "#f1f8ff", trim: "#2e6276" },
      ramp: { style: "driftwood", base: "#9f7652", accent: "#d2b08a", trim: "#6b4a31" },
      drone: { style: "gull", base: "#f5fbff", accent: "#ffd36b", trim: "#91a7b9" },
      barrel: { style: "buoy", base: "#ff6d5f", accent: "#fff4de", trim: "#c74e45" },
      pile: { style: "shellpile", base: "#ddb88a", accent: "#fff4d9", trim: "#b18e6a" },
      sign: { style: "beachsign", base: "#8f6b48", accent: "#fff4d0", trim: "#3f7b97" },
      bench: { style: "lounger", base: "#d5a765", accent: "#fff0c6", trim: "#8c633c" },
      crystal: { style: "coral", base: "#ff8d79", accent: "#ffd4b8", trim: "#c76369" }
    },
    jungle: {
      cone: { style: "stump", base: "#6b5330", accent: "#98764d", trim: "#d8c28e" },
      toyBox: { style: "crate", base: "#7c6037", accent: "#b89561", trim: "#45331f" },
      ramp: { style: "root", base: "#6f4f30", accent: "#8f7444", trim: "#3f2c1b" },
      drone: { style: "parrot", base: "#3f8e55", accent: "#ffd65f", trim: "#1c4a27" },
      barrel: { style: "totem", base: "#8a613b", accent: "#d5b276", trim: "#50351d" },
      pile: { style: "fernclump", base: "#4b7c42", accent: "#80c76b", trim: "#24452b" },
      sign: { style: "campmarker", base: "#785a36", accent: "#d9c88a", trim: "#365f2c" },
      bench: { style: "fallenlog", base: "#6d512f", accent: "#9b774d", trim: "#3f2b1a" },
      crystal: { style: "idol", base: "#7c6642", accent: "#c3a86d", trim: "#37562b" }
    },
    cyber: {
      cone: { style: "bollard", base: "#2a4066", accent: "#31f3ff", trim: "#ff61d8" },
      toyBox: { style: "neoncrate", base: "#1f2c50", accent: "#31f3ff", trim: "#ff61d8" },
      ramp: { style: "datawedge", base: "#243153", accent: "#31f3ff", trim: "#ff61d8" },
      drone: { style: "hoverbot", base: "#1e3356", accent: "#31f3ff", trim: "#ff61d8" },
      barrel: { style: "battery", base: "#243861", accent: "#31f3ff", trim: "#ff61d8" },
      pile: { style: "scrappile", base: "#263452", accent: "#3ce7ff", trim: "#ff61d8" },
      sign: { style: "holosign", base: "#23355e", accent: "#31f3ff", trim: "#ff61d8" },
      bench: { style: "glitchrail", base: "#202d4c", accent: "#31f3ff", trim: "#ff61d8" },
      crystal: { style: "datacrystal", base: "#29416b", accent: "#7ff9ff", trim: "#ff61d8" }
    }
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

    contrastProfile(biome) {
      if (biome === "desert" || biome === "farm" || biome === "snow" || biome === "beach") {
        return { bright: true, dense: false, washMid: 0.12, washBottom: 0.28, bandAlpha: 0.2, laneLift: 0.08, laneMid: 0.15, laneBottom: 0.24, edgeAlpha: 0.08, horizonAlpha: 0.18 };
      }
      if (biome === "marsh" || biome === "jungle") {
        return { bright: false, dense: true, washMid: 0.06, washBottom: 0.18, bandAlpha: 0.1, laneLift: 0.04, laneMid: 0.11, laneBottom: 0.18, edgeAlpha: 0.06, horizonAlpha: 0.12 };
      }
      return { bright: false, dense: false, washMid: 0.08, washBottom: 0.2, bandAlpha: 0.11, laneLift: 0.04, laneMid: 0.12, laneBottom: 0.18, edgeAlpha: 0.05, horizonAlpha: 0.14 };
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

    drawDepthWash(biome, groundY) {
      const ctx = this.ctx;
      const p = this.palette(biome);
      const c = this.canvas;
      const profile = this.contrastProfile(biome);
      const washTop = Math.max(0, groundY - 230);
      const wash = ctx.createLinearGradient(0, washTop, 0, groundY + 12);
      const skyTone = profile.bright ? mixColor(p.skyC, "#ffffff", 0.32) : mixColor(p.skyB, "#f7fbff", 0.18);
      const horizonTone = profile.bright ? mixColor(p.ground, "#eef4ff", 0.24) : mixColor(p.groundAlt, "#0f1726", 0.24);

      wash.addColorStop(0, "rgba(0,0,0,0)");
      wash.addColorStop(0.48, alphaColor(skyTone, profile.washMid));
      wash.addColorStop(0.8, alphaColor(horizonTone, profile.washBottom * 0.58));
      wash.addColorStop(1, alphaColor(horizonTone, profile.washBottom));
      ctx.fillStyle = wash;
      ctx.fillRect(0, washTop, c.width, c.height - washTop);

      const vignette = ctx.createLinearGradient(0, 0, 0, groundY);
      vignette.addColorStop(0, alphaColor(mixColor(p.skyA, "#0b1220", 0.35), profile.dense ? 0.05 : 0.08));
      vignette.addColorStop(0.26, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, c.width, groundY);
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

    drawPlayfieldFocus(player, biome, groundY) {
      const ctx = this.ctx;
      const c = this.canvas;
      const p = this.palette(biome);
      const profile = this.contrastProfile(biome);
      const centerX = player.x + player.width * 0.56;
      const halfWidth = Math.max(170, player.width * 5.4);
      const bandTone = profile.bright
        ? mixColor(p.groundAlt, "#0e1727", 0.56)
        : mixColor(p.groundAlt, "#0d1524", 0.34);

      const focus = ctx.createLinearGradient(centerX - halfWidth, 0, centerX + halfWidth, 0);
      focus.addColorStop(0, "rgba(0,0,0,0)");
      focus.addColorStop(0.16, alphaColor(bandTone, profile.bandAlpha * 0.42));
      focus.addColorStop(0.5, alphaColor(bandTone, profile.bandAlpha));
      focus.addColorStop(0.84, alphaColor(bandTone, profile.bandAlpha * 0.42));
      focus.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = focus;
      ctx.fillRect(0, 0, c.width, c.height);

      const sideShade = ctx.createLinearGradient(0, 0, c.width, 0);
      sideShade.addColorStop(0, alphaColor("#08111d", profile.edgeAlpha));
      sideShade.addColorStop(0.14, "rgba(0,0,0,0)");
      sideShade.addColorStop(0.86, "rgba(0,0,0,0)");
      sideShade.addColorStop(1, alphaColor("#08111d", profile.edgeAlpha));
      ctx.fillStyle = sideShade;
      ctx.fillRect(0, 0, c.width, c.height);

      const laneTop = Math.max(groundY - 118, 0);
      const lane = ctx.createLinearGradient(0, laneTop, 0, c.height);
      lane.addColorStop(0, "rgba(0,0,0,0)");
      lane.addColorStop(0.18, alphaColor(mixColor(p.detail, "#f8fbff", 0.22), profile.laneLift));
      lane.addColorStop(0.52, alphaColor(mixColor(p.groundAlt, "#162033", 0.42), profile.laneMid));
      lane.addColorStop(1, alphaColor(mixColor(p.groundAlt, "#0f1726", 0.56), profile.laneBottom));
      ctx.fillStyle = lane;
      ctx.fillRect(0, laneTop, c.width, c.height - laneTop);

      block(ctx, 0, groundY - 2, c.width, 1, alphaColor(mixColor(p.detail, "#ffffff", 0.22), profile.horizonAlpha * 0.45));
      block(ctx, 0, groundY + 8, c.width, 2, profile.bright ? alphaColor("#ffffff", profile.horizonAlpha) : alphaColor(p.detail, profile.horizonAlpha));
    }

    drawRunner(player, animationClock) {
      const ctx = this.ctx;
      const grounded = typeof player.isGrounded === "function" ? player.isGrounded() : true;
      const runCycle = animationClock * (grounded ? 13 : 9);
      const stride = grounded ? Math.sin(runCycle) : 0.18;
      const strideLift = grounded ? Math.cos(runCycle) : -0.35;
      const bob = grounded ? Math.sin(runCycle * 2) * 0.45 : Math.min(0, player.velocityY * 0.006);
      const w = player.width;
      const h = player.height;
      const x = player.x;
      const y = player.y + bob;

      if (player.isSliding) {
        const slideY = y + Math.round(h * 0.62);
        const headSize = Math.max(5, Math.round(h * 0.2));
        const chestX = x + Math.round(w * 0.34);
        const chestY = slideY - Math.round(h * 0.16);
        const headX = x + Math.round(w * 0.68);
        const headY = slideY - headSize - 1;

        pixelLine(ctx, x + Math.round(w * 0.18), slideY + 1, chestX - 2, slideY + 2, 3, "#1b1b2f");
        pixelLine(ctx, x + Math.round(w * 0.24), slideY - 1, x + Math.round(w * 0.1), slideY + Math.round(h * 0.06), 2, "#1b1b2f");
        pixelLine(ctx, chestX, chestY, x + Math.round(w * 0.68), slideY - 1, 5, player.character.color);
        block(ctx, x + Math.round(w * 0.42), slideY - Math.round(h * 0.08), Math.max(6, Math.round(w * 0.2)), 3, player.character.accent);
        pixelLine(ctx, x + Math.round(w * 0.58), slideY - 3, x + Math.round(w * 0.78), slideY + Math.round(h * 0.08), 2, "#1b1b2f");
        block(ctx, headX - Math.round(headSize * 0.55), headY, headSize, headSize, "#ffd9b3");
        block(ctx, headX - Math.round(headSize * 0.55), headY, headSize, 2, "#3d2f2a");
        return;
      }

      const head = Math.max(5, Math.round(h * 0.2));
      const torsoHeight = Math.max(11, Math.round(h * 0.34));
      const legLen = Math.max(10, Math.round(h * 0.23));
      const armLen = Math.max(7, Math.round(h * 0.2));
      const hipX = x + Math.round(w * 0.42);
      const hipY = y + head + torsoHeight;
      const shoulderX = hipX + Math.round(w * 0.08) + Math.round(Math.max(0, strideLift) * 1.5);
      const shoulderY = y + head + 2;
      const headX = shoulderX - Math.round(head * 0.2);
      const headY = y;
      const torsoThickness = Math.max(5, Math.round(w * 0.15));
      const limbSize = Math.max(2, Math.round(w * 0.06));
      const shoeSize = Math.max(3, limbSize + 1);

      const rearArmElbowX = shoulderX - Math.round(3 + stride * 3);
      const rearArmElbowY = shoulderY + Math.round(armLen * 0.45);
      const rearArmHandX = rearArmElbowX + Math.round(-2 - stride * 3);
      const rearArmHandY = rearArmElbowY + Math.round(armLen * 0.55);
      const frontArmElbowX = shoulderX + Math.round(4 - stride * 3);
      const frontArmElbowY = shoulderY + Math.round(armLen * 0.42);
      const frontArmHandX = frontArmElbowX + Math.round(5 - stride * 4);
      const frontArmHandY = frontArmElbowY + Math.round(armLen * 0.52);

      const rearKneeX = hipX - Math.round(4 + stride * 4);
      const rearKneeY = hipY + Math.round(legLen * (0.42 + Math.max(0, stride) * 0.15));
      const rearFootX = rearKneeX - Math.round(4 + stride * 3);
      const rearFootY = y + h - Math.round(Math.max(0, strideLift) * 2);
      const frontKneeX = hipX + Math.round(4 + stride * 3);
      const frontKneeY = hipY + Math.round(legLen * (0.38 - Math.min(0, stride) * 0.1));
      const frontFootX = frontKneeX + Math.round(5 + stride * 4);
      const frontFootY = y + h - Math.round(Math.max(0, -strideLift) * 2);

      pixelLine(ctx, shoulderX - 1, shoulderY + 1, rearArmElbowX, rearArmElbowY, limbSize, "#1b1b2f");
      pixelLine(ctx, rearArmElbowX, rearArmElbowY, rearArmHandX, rearArmHandY, limbSize, "#1b1b2f");
      pixelLine(ctx, hipX - 1, hipY, rearKneeX, rearKneeY, limbSize + 1, "#1b1b2f");
      pixelLine(ctx, rearKneeX, rearKneeY, rearFootX, rearFootY, limbSize + 1, "#1b1b2f");
      block(ctx, rearFootX - 1, rearFootY - 1, shoeSize + 1, shoeSize - 1, "#131320");

      pixelLine(ctx, shoulderX, shoulderY, hipX, hipY, torsoThickness, player.character.color);
      block(ctx, shoulderX - 3, shoulderY - 2, torsoThickness + 1, Math.max(5, Math.round(h * 0.08)), player.character.color);
      block(ctx, hipX - 3, hipY - 2, torsoThickness + 1, Math.max(5, Math.round(h * 0.08)), player.character.color);
      pixelLine(
        ctx,
        shoulderX - 1,
        shoulderY + Math.round(torsoHeight * 0.42),
        hipX + 1,
        shoulderY + Math.round(torsoHeight * 0.46),
        Math.max(2, Math.round(limbSize * 0.9)),
        player.character.accent
      );

      block(ctx, headX - Math.round(head * 0.45), headY, head, head, "#ffd9b3");
      block(ctx, headX - Math.round(head * 0.45), headY, head, 2, "#3d2f2a");
      block(ctx, headX + Math.round(head * 0.25), headY + Math.round(head * 0.45), 2, 2, "#2a1a12");

      pixelLine(ctx, shoulderX + 1, shoulderY + 1, frontArmElbowX, frontArmElbowY, limbSize, "#1b1b2f");
      pixelLine(ctx, frontArmElbowX, frontArmElbowY, frontArmHandX, frontArmHandY, limbSize, "#1b1b2f");
      pixelLine(ctx, hipX + 1, hipY, frontKneeX, frontKneeY, limbSize + 1, "#1b1b2f");
      pixelLine(ctx, frontKneeX, frontKneeY, frontFootX, frontFootY, limbSize + 1, "#1b1b2f");
      block(ctx, frontFootX - 1, frontFootY - 1, shoeSize + 1, shoeSize - 1, "#131320");
    }

    obstacleTheme(biome, obstacle) {
      const theme = (OBSTACLE_THEMES[biome] && OBSTACLE_THEMES[biome][obstacle.type]) || null;
      if (theme) return theme;
      return { style: obstacle.type, base: obstacle.color, accent: "#f0f4ff", trim: "#1f2740" };
    }

    drawCoin(coin, animationClock) {
      const ctx = this.ctx;
      const phase = Math.abs(Math.sin(animationClock * 10 + coin.x * 0.04));
      const rimWidth = Math.max(6, Math.round(coin.width * (0.35 + phase * 0.65)));
      const rimX = coin.x + Math.round((coin.width - rimWidth) / 2);
      const rimColor = phase > 0.7 ? "#fff1a8" : "#ffd447";
      block(ctx, rimX, coin.y, rimWidth, coin.height, rimColor);
      block(ctx, rimX + 2, coin.y + 2, Math.max(2, rimWidth - 4), coin.height - 4, "#f6b500");
      block(ctx, rimX + Math.max(1, Math.round(rimWidth * 0.18)), coin.y + 3, 2, coin.height - 6, "#fff6c9");
      if (rimWidth <= 8) {
        block(ctx, rimX + Math.floor(rimWidth / 2), coin.y + 2, 1, coin.height - 4, "#c98500");
      }
      block(ctx, coin.x - 2, coin.y + 3, 2, 2, "rgba(255,248,198,0.8)");
      block(ctx, coin.x + coin.width, coin.y + coin.height - 4, 2, 2, "rgba(255,248,198,0.65)");
    }

    drawObstacle(obstacle, biome, animationClock) {
      const ctx = this.ctx;
      const x = obstacle.x;
      const y = obstacle.y;
      const w = obstacle.width;
      const h = obstacle.height;
      const variant = obstacle.variant || 0;
      const phase = Math.sin(animationClock * 8 + variant * 1.4);
      const theme = this.obstacleTheme(biome, obstacle);

      block(ctx, x + 3, y + h - 3, Math.max(6, w - 6), 3, "rgba(0,0,0,0.18)");

      switch (theme.style) {
        case "cactus":
          block(ctx, x + Math.round(w * 0.42), y + 6, Math.max(6, Math.round(w * 0.16)), h - 8, theme.base);
          block(ctx, x + Math.round(w * 0.26), y + Math.round(h * 0.34), Math.max(4, Math.round(w * 0.16)), 6, theme.base);
          block(ctx, x + Math.round(w * 0.58), y + Math.round(h * 0.22) + variant * 5, Math.max(4, Math.round(w * 0.16)), 6, theme.base);
          block(ctx, x + Math.round(w * 0.18), y + Math.round(h * 0.34), 4, 12, theme.base);
          block(ctx, x + Math.round(w * 0.72), y + Math.round(h * 0.22) + variant * 5, 4, 12, theme.base);
          block(ctx, x + Math.round(w * 0.46), y + 12, 2, h - 18, theme.trim);
          break;
        case "pumpkin":
          circle(ctx, x + w / 2, y + h * 0.62, Math.max(8, w * 0.3), theme.base, 1);
          circle(ctx, x + w * 0.36, y + h * 0.64, Math.max(7, w * 0.22), theme.base, 1);
          circle(ctx, x + w * 0.64, y + h * 0.64, Math.max(7, w * 0.22), theme.base, 1);
          block(ctx, x + Math.round(w * 0.46), y + 4, 5, 9, theme.trim);
          block(ctx, x + Math.round(w * 0.28), y + Math.round(h * 0.36), 2, Math.round(h * 0.38), theme.accent);
          block(ctx, x + Math.round(w * 0.49), y + Math.round(h * 0.32), 2, Math.round(h * 0.42), theme.accent);
          block(ctx, x + Math.round(w * 0.68), y + Math.round(h * 0.36), 2, Math.round(h * 0.38), theme.accent);
          break;
        case "stump":
          block(ctx, x + Math.round(w * 0.22), y + Math.round(h * 0.18), Math.round(w * 0.56), h - Math.round(h * 0.18), theme.base);
          block(ctx, x + Math.round(w * 0.16), y + Math.round(h * 0.1), Math.round(w * 0.68), 8, theme.accent);
          block(ctx, x + Math.round(w * 0.3), y + Math.round(h * 0.12), Math.round(w * 0.4), 4, theme.trim);
          block(ctx, x + Math.round(w * 0.28), y + Math.round(h * 0.48), 3, Math.round(h * 0.22), theme.trim);
          break;
        case "cone":
          wedge(ctx, x + Math.round(w * 0.14), y + 4, Math.round(w * 0.72), h - 10, theme.base, variant % 2 === 1);
          block(ctx, x + Math.round(w * 0.2), y + h - 6, Math.round(w * 0.6), 6, theme.trim);
          block(ctx, x + Math.round(w * 0.34), y + Math.round(h * 0.28), Math.round(w * 0.2), 5, theme.accent);
          block(ctx, x + Math.round(w * 0.3), y + Math.round(h * 0.52), Math.round(w * 0.26), 5, theme.accent);
          break;
        case "moonrock":
        case "lavarock":
          block(ctx, x + Math.round(w * 0.18), y + Math.round(h * 0.34), Math.round(w * 0.54), Math.round(h * 0.5), theme.base);
          block(ctx, x + Math.round(w * 0.05), y + Math.round(h * 0.52), Math.round(w * 0.32), Math.round(h * 0.26), theme.base);
          block(ctx, x + Math.round(w * 0.56), y + Math.round(h * 0.18), Math.round(w * 0.24), Math.round(h * 0.4), theme.base);
          block(ctx, x + Math.round(w * 0.28), y + Math.round(h * 0.4), Math.round(w * 0.16), 4, theme.accent);
          if (theme.style === "lavarock") block(ctx, x + Math.round(w * 0.4), y + Math.round(h * 0.58), Math.round(w * 0.22), 4, theme.accent);
          break;
        case "snowman":
          circle(ctx, x + w * 0.5, y + h * 0.7, Math.max(7, w * 0.22), theme.base, 1);
          circle(ctx, x + w * 0.5, y + h * 0.38, Math.max(5, w * 0.16), theme.base, 1);
          block(ctx, x + Math.round(w * 0.46), y + Math.round(h * 0.13), 5, 5, theme.trim);
          block(ctx, x + Math.round(w * 0.4), y + Math.round(h * 0.48), Math.round(w * 0.2), 3, theme.accent);
          break;
        case "sandcastle":
          block(ctx, x + Math.round(w * 0.12), y + Math.round(h * 0.46), Math.round(w * 0.76), Math.round(h * 0.38), theme.base);
          block(ctx, x + Math.round(w * 0.14), y + Math.round(h * 0.26), Math.round(w * 0.18), Math.round(h * 0.2), theme.base);
          block(ctx, x + Math.round(w * 0.68), y + Math.round(h * 0.22), Math.round(w * 0.18), Math.round(h * 0.24), theme.base);
          block(ctx, x + Math.round(w * 0.22), y + Math.round(h * 0.22), 2, 8, theme.trim);
          block(ctx, x + Math.round(w * 0.7), y + Math.round(h * 0.16), 2, 10, theme.trim);
          break;
        case "bollard":
          block(ctx, x + Math.round(w * 0.36), y + 6, Math.round(w * 0.28), h - 10, theme.base);
          block(ctx, x + Math.round(w * 0.32), y + 10, Math.round(w * 0.36), 4, theme.accent);
          block(ctx, x + Math.round(w * 0.32), y + Math.round(h * 0.46), Math.round(w * 0.36), 4, theme.trim);
          block(ctx, x + Math.round(w * 0.25), y + h - 6, Math.round(w * 0.5), 6, theme.base);
          break;
        case "tumbleweed":
        case "debrispile":
        case "meteorcluster":
        case "rubblepile":
        case "shellpile":
        case "scrappile":
          block(ctx, x + Math.round(w * 0.12), y + Math.round(h * 0.56), Math.round(w * 0.76), Math.round(h * 0.18), theme.base);
          circle(ctx, x + w * 0.3, y + h * 0.62, Math.max(6, w * 0.16), theme.base, 1);
          circle(ctx, x + w * 0.5, y + h * 0.54, Math.max(8, w * 0.22), theme.base, 1);
          circle(ctx, x + w * 0.72, y + h * 0.64, Math.max(6, w * 0.15), theme.base, 1);
          if (theme.style === "tumbleweed") {
            pixelLine(ctx, x + w * 0.22, y + h * 0.58, x + w * 0.76, y + h * 0.66, 2, theme.trim);
            pixelLine(ctx, x + w * 0.28, y + h * 0.74, x + w * 0.68, y + h * 0.42, 2, theme.trim);
            pixelLine(ctx, x + w * 0.24, y + h * 0.48, x + w * 0.74, y + h * 0.74, 2, theme.accent);
          } else if (theme.style === "shellpile") {
            circle(ctx, x + w * 0.34, y + h * 0.54, Math.max(3, w * 0.07), theme.accent, 1);
            circle(ctx, x + w * 0.58, y + h * 0.48, Math.max(4, w * 0.08), theme.accent, 1);
            block(ctx, x + Math.round(w * 0.46), y + Math.round(h * 0.68), Math.round(w * 0.18), 3, theme.trim);
          } else if (theme.style === "scrappile" || theme.style === "debrispile") {
            block(ctx, x + Math.round(w * 0.18), y + Math.round(h * 0.5), Math.round(w * 0.18), 6, theme.accent);
            block(ctx, x + Math.round(w * 0.46), y + Math.round(h * 0.42), Math.round(w * 0.14), 8, theme.trim);
            block(ctx, x + Math.round(w * 0.64), y + Math.round(h * 0.58), Math.round(w * 0.12), 5, theme.accent);
          } else {
            block(ctx, x + Math.round(w * 0.22), y + Math.round(h * 0.48), Math.round(w * 0.16), 4, theme.accent);
            block(ctx, x + Math.round(w * 0.48), y + Math.round(h * 0.4), Math.round(w * 0.18), 4, theme.trim);
            if (theme.style === "rubblepile") {
              block(ctx, x + Math.round(w * 0.62), y + Math.round(h * 0.58), Math.round(w * 0.12), 3, theme.accent);
            }
          }
          break;
        case "producepile":
        case "fernclump":
          block(ctx, x + Math.round(w * 0.14), y + Math.round(h * 0.6), Math.round(w * 0.72), Math.round(h * 0.14), theme.base);
          circle(ctx, x + w * 0.3, y + h * 0.62, Math.max(6, w * 0.14), theme.base, 1);
          circle(ctx, x + w * 0.52, y + h * 0.54, Math.max(7, w * 0.18), theme.accent, 1);
          circle(ctx, x + w * 0.72, y + h * 0.64, Math.max(6, w * 0.13), theme.base, 1);
          if (theme.style === "producepile") {
            block(ctx, x + Math.round(w * 0.26), y + Math.round(h * 0.4), 3, 8, theme.trim);
            block(ctx, x + Math.round(w * 0.5), y + Math.round(h * 0.34), 3, 8, theme.trim);
            block(ctx, x + Math.round(w * 0.66), y + Math.round(h * 0.48), 3, 7, theme.trim);
          } else {
            wedge(ctx, x + Math.round(w * 0.16), y + Math.round(h * 0.2), Math.round(w * 0.22), Math.round(h * 0.48), theme.base, false);
            wedge(ctx, x + Math.round(w * 0.36), y + Math.round(h * 0.08), Math.round(w * 0.24), Math.round(h * 0.58), theme.accent, variant % 2 === 0);
            wedge(ctx, x + Math.round(w * 0.6), y + Math.round(h * 0.24), Math.round(w * 0.2), Math.round(h * 0.42), theme.base, true);
          }
          break;
        case "reedstack":
          for (let i = 0; i < 5; i += 1) {
            const stalkX = x + Math.round(w * (0.18 + i * 0.12));
            const stalkHeight = Math.round(h * (0.48 + (i % 2) * 0.12));
            block(ctx, stalkX, y + h - stalkHeight - 4, 4, stalkHeight, theme.base);
            block(ctx, stalkX - 1, y + h - stalkHeight - 8, 6, 5, theme.accent);
          }
          block(ctx, x + Math.round(w * 0.16), y + Math.round(h * 0.54), Math.round(w * 0.68), 5, theme.trim);
          break;
        case "snowpile":
          circle(ctx, x + w * 0.34, y + h * 0.68, Math.max(8, w * 0.18), theme.base, 1);
          circle(ctx, x + w * 0.56, y + h * 0.58, Math.max(10, w * 0.24), theme.base, 1);
          circle(ctx, x + w * 0.76, y + h * 0.7, Math.max(7, w * 0.15), theme.base, 1);
          block(ctx, x + Math.round(w * 0.24), y + Math.round(h * 0.62), Math.round(w * 0.46), 4, theme.accent);
          block(ctx, x + Math.round(w * 0.42), y + Math.round(h * 0.44), Math.round(w * 0.16), 3, theme.trim);
          break;
        case "trailsign":
        case "farmsign":
        case "warningsign":
        case "streetsign":
        case "beacon":
        case "hazardsign":
        case "skimarker":
        case "beachsign":
        case "campmarker":
        case "holosign": {
          const postX = x + Math.round(w * 0.46);
          const postTop = theme.style === "beacon" ? y + 10 : y + Math.round(h * 0.26);
          block(ctx, postX, postTop, 4, h - (postTop - y), theme.trim);
          if (theme.style === "beacon") {
            circle(ctx, x + w * 0.5, y + h * 0.26, Math.max(5, w * 0.14), theme.accent, 1);
            block(ctx, x + Math.round(w * 0.3), y + Math.round(h * 0.42), Math.round(w * 0.4), 6, theme.base);
            block(ctx, x + Math.round(w * 0.38), y + Math.round(h * 0.5), Math.round(w * 0.24), 4, theme.accent);
            break;
          }
          if (theme.style === "skimarker") {
            block(ctx, x + Math.round(w * 0.32), y + Math.round(h * 0.16), Math.round(w * 0.32), Math.round(h * 0.42), theme.base);
            block(ctx, x + Math.round(w * 0.38), y + Math.round(h * 0.22), Math.round(w * 0.18), Math.round(h * 0.3), theme.accent);
            block(ctx, x + Math.round(w * 0.3), y + Math.round(h * 0.62), Math.round(w * 0.4), 4, theme.trim);
            break;
          }
          const boardY = y + Math.round(h * 0.18);
          const boardH = Math.round(h * 0.2);
          block(ctx, x + Math.round(w * 0.14), boardY, Math.round(w * 0.72), boardH, theme.base);
          block(ctx, x + Math.round(w * 0.2), boardY + 3, Math.round(w * 0.6), Math.max(4, boardH - 6), theme.accent);
          if (theme.style === "streetsign") {
            block(ctx, x + Math.round(w * 0.24), y + Math.round(h * 0.42), Math.round(w * 0.52), 6, theme.base);
            block(ctx, x + Math.round(w * 0.28), y + Math.round(h * 0.46), Math.round(w * 0.44), 3, theme.accent);
          } else if (theme.style === "warningsign" || theme.style === "hazardsign") {
            block(ctx, x + Math.round(w * 0.2), boardY + 4, Math.round(w * 0.12), 3, theme.trim);
            block(ctx, x + Math.round(w * 0.42), boardY + 8, Math.round(w * 0.12), 3, theme.trim);
            block(ctx, x + Math.round(w * 0.64), boardY + 12, Math.round(w * 0.12), 3, theme.trim);
          } else if (theme.style === "holosign") {
            ctx.save();
            ctx.globalAlpha = 0.35;
            block(ctx, x + Math.round(w * 0.1), boardY - 4, Math.round(w * 0.8), boardH + 8, theme.accent);
            ctx.restore();
            block(ctx, x + Math.round(w * 0.26), boardY + 6, Math.round(w * 0.48), 2, theme.trim);
          } else {
            block(ctx, x + Math.round(w * 0.26), boardY + 7, Math.round(w * 0.18), 3, theme.trim);
            block(ctx, x + Math.round(w * 0.52), boardY + 7, Math.round(w * 0.18), 3, theme.trim);
          }
          break;
        }
        case "stonebench":
        case "dockbench":
        case "bench":
        case "basaltbench":
          block(ctx, x + Math.round(w * 0.12), y + Math.round(h * 0.38), Math.round(w * 0.76), 7, theme.base);
          block(ctx, x + Math.round(w * 0.18), y + Math.round(h * 0.24), Math.round(w * 0.64), 5, theme.accent);
          block(ctx, x + Math.round(w * 0.22), y + Math.round(h * 0.44), 5, Math.round(h * 0.32), theme.trim);
          block(ctx, x + Math.round(w * 0.7), y + Math.round(h * 0.44), 5, Math.round(h * 0.32), theme.trim);
          break;
        case "cart":
          block(ctx, x + Math.round(w * 0.14), y + Math.round(h * 0.34), Math.round(w * 0.68), Math.round(h * 0.2), theme.base);
          block(ctx, x + Math.round(w * 0.22), y + Math.round(h * 0.22), Math.round(w * 0.48), 5, theme.accent);
          circle(ctx, x + w * 0.28, y + h * 0.78, Math.max(5, w * 0.08), theme.trim, 1);
          circle(ctx, x + w * 0.72, y + h * 0.78, Math.max(5, w * 0.08), theme.trim, 1);
          block(ctx, x + Math.round(w * 0.18), y + Math.round(h * 0.5), Math.round(w * 0.12), 4, theme.trim);
          break;
        case "console":
        case "glitchrail":
          block(ctx, x + Math.round(w * 0.14), y + Math.round(h * 0.28), Math.round(w * 0.72), Math.round(h * 0.18), theme.base);
          block(ctx, x + Math.round(w * 0.2), y + Math.round(h * 0.34), Math.round(w * 0.6), Math.round(h * 0.08), theme.accent);
          block(ctx, x + Math.round(w * 0.2), y + Math.round(h * 0.5), 5, Math.round(h * 0.26), theme.trim);
          block(ctx, x + Math.round(w * 0.74), y + Math.round(h * 0.5), 5, Math.round(h * 0.26), theme.trim);
          if (theme.style === "glitchrail") {
            ctx.save();
            ctx.globalAlpha = 0.35;
            block(ctx, x + Math.round(w * 0.1), y + Math.round(h * 0.22), Math.round(w * 0.8), Math.round(h * 0.3), theme.accent);
            ctx.restore();
          } else {
            block(ctx, x + Math.round(w * 0.32), y + Math.round(h * 0.18), Math.round(w * 0.18), 5, theme.trim);
            block(ctx, x + Math.round(w * 0.56), y + Math.round(h * 0.18), Math.round(w * 0.1), 5, theme.trim);
          }
          break;
        case "sled":
          block(ctx, x + Math.round(w * 0.18), y + Math.round(h * 0.28), Math.round(w * 0.44), 6, theme.base);
          block(ctx, x + Math.round(w * 0.28), y + Math.round(h * 0.16), Math.round(w * 0.22), 5, theme.accent);
          pixelLine(ctx, x + w * 0.16, y + h * 0.74, x + w * 0.78, y + h * 0.74, 2, theme.trim);
          pixelLine(ctx, x + w * 0.18, y + h * 0.68, x + w * 0.74, y + h * 0.68, 2, theme.trim);
          block(ctx, x + Math.round(w * 0.74), y + Math.round(h * 0.68), Math.round(w * 0.08), 3, theme.trim);
          break;
        case "lounger":
          wedge(ctx, x + Math.round(w * 0.2), y + Math.round(h * 0.16), Math.round(w * 0.32), Math.round(h * 0.38), theme.accent, true);
          block(ctx, x + Math.round(w * 0.26), y + Math.round(h * 0.46), Math.round(w * 0.46), 6, theme.base);
          block(ctx, x + Math.round(w * 0.22), y + Math.round(h * 0.56), 5, Math.round(h * 0.18), theme.trim);
          block(ctx, x + Math.round(w * 0.68), y + Math.round(h * 0.56), 5, Math.round(h * 0.18), theme.trim);
          break;
        case "fallenlog":
          block(ctx, x + Math.round(w * 0.14), y + Math.round(h * 0.34), Math.round(w * 0.72), Math.round(h * 0.28), theme.base);
          circle(ctx, x + w * 0.18, y + h * 0.48, Math.max(5, h * 0.14), theme.accent, 1);
          circle(ctx, x + w * 0.82, y + h * 0.48, Math.max(5, h * 0.14), theme.accent, 1);
          block(ctx, x + Math.round(w * 0.28), y + Math.round(h * 0.42), Math.round(w * 0.44), 3, theme.trim);
          block(ctx, x + Math.round(w * 0.34), y + Math.round(h * 0.52), Math.round(w * 0.28), 3, theme.trim);
          break;
        case "sandstone":
        case "crystal":
        case "magmaflare":
        case "iceshard":
        case "datacrystal":
          wedge(ctx, x + Math.round(w * 0.14), y + Math.round(h * 0.34), Math.round(w * 0.18), Math.round(h * 0.44), theme.base, false);
          wedge(ctx, x + Math.round(w * 0.38), y + 5, Math.round(w * 0.24), h - 7, theme.accent, variant % 2 === 1);
          wedge(ctx, x + Math.round(w * 0.66), y + Math.round(h * 0.24), Math.round(w * 0.16), Math.round(h * 0.54), theme.base, true);
          block(ctx, x + Math.round(w * 0.46), y + Math.round(h * 0.18), 3, Math.round(h * 0.5), theme.trim);
          if (theme.style === "magmaflare" || theme.style === "datacrystal") {
            ctx.save();
            ctx.globalAlpha = 0.28;
            block(ctx, x + Math.round(w * 0.28), y + Math.round(h * 0.12), Math.round(w * 0.42), Math.round(h * 0.58), theme.trim);
            ctx.restore();
          }
          break;
        case "cornshock":
          for (let i = 0; i < 4; i += 1) {
            const stalkX = x + Math.round(w * (0.18 + i * 0.14));
            const stalkTop = y + Math.round(h * (0.14 + (i % 2) * 0.08));
            block(ctx, stalkX, stalkTop, 4, h - (stalkTop - y) - 4, theme.base);
            pixelLine(ctx, stalkX, y + h * 0.48, stalkX - 7, y + h * 0.66, 2, theme.accent);
            pixelLine(ctx, stalkX + 3, y + h * 0.42, stalkX + 9, y + h * 0.58, 2, theme.accent);
          }
          block(ctx, x + Math.round(w * 0.18), y + Math.round(h * 0.58), Math.round(w * 0.54), 4, theme.trim);
          break;
        case "cattails":
          for (let i = 0; i < 3; i += 1) {
            const stalkX = x + Math.round(w * (0.26 + i * 0.16));
            const stalkTop = y + Math.round(h * (0.18 + (i % 2) * 0.06));
            block(ctx, stalkX, stalkTop, 4, h - (stalkTop - y) - 4, theme.base);
            block(ctx, stalkX - 1, stalkTop - 8, 6, 10, theme.accent);
            pixelLine(ctx, stalkX, y + h * 0.56, stalkX - 8, y + h * 0.74, 2, theme.trim);
          }
          break;
        case "hydrant":
          block(ctx, x + Math.round(w * 0.34), y + Math.round(h * 0.18), Math.round(w * 0.32), Math.round(h * 0.54), theme.base);
          block(ctx, x + Math.round(w * 0.26), y + Math.round(h * 0.26), Math.round(w * 0.48), 6, theme.accent);
          block(ctx, x + Math.round(w * 0.18), y + Math.round(h * 0.38), Math.round(w * 0.2), 6, theme.base);
          block(ctx, x + Math.round(w * 0.62), y + Math.round(h * 0.38), Math.round(w * 0.2), 6, theme.base);
          block(ctx, x + Math.round(w * 0.24), y + Math.round(h * 0.68), Math.round(w * 0.52), 6, theme.trim);
          break;
        case "coral":
          block(ctx, x + Math.round(w * 0.34), y + Math.round(h * 0.48), Math.round(w * 0.18), Math.round(h * 0.24), theme.base);
          block(ctx, x + Math.round(w * 0.18), y + Math.round(h * 0.26), 5, Math.round(h * 0.3), theme.base);
          block(ctx, x + Math.round(w * 0.52), y + Math.round(h * 0.14), 5, Math.round(h * 0.38), theme.accent);
          block(ctx, x + Math.round(w * 0.68), y + Math.round(h * 0.34), 5, Math.round(h * 0.2), theme.base);
          block(ctx, x + Math.round(w * 0.18), y + Math.round(h * 0.22), Math.round(w * 0.14), 4, theme.trim);
          block(ctx, x + Math.round(w * 0.52), y + Math.round(h * 0.1), Math.round(w * 0.16), 4, theme.trim);
          break;
        case "idol":
          block(ctx, x + Math.round(w * 0.28), y + Math.round(h * 0.12), Math.round(w * 0.44), Math.round(h * 0.64), theme.base);
          block(ctx, x + Math.round(w * 0.34), y + Math.round(h * 0.2), Math.round(w * 0.32), Math.round(h * 0.18), theme.accent);
          block(ctx, x + Math.round(w * 0.38), y + Math.round(h * 0.28), 4, 4, theme.trim);
          block(ctx, x + Math.round(w * 0.56), y + Math.round(h * 0.28), 4, 4, theme.trim);
          block(ctx, x + Math.round(w * 0.42), y + Math.round(h * 0.44), Math.round(w * 0.16), 4, theme.trim);
          block(ctx, x + Math.round(w * 0.24), y + Math.round(h * 0.72), Math.round(w * 0.52), 5, theme.trim);
          break;
        case "crate":
        case "toolbox":
        case "neoncrate":
        case "hay":
        case "cooler":
        case "gift":
          block(ctx, x + 2, y + 4, w - 4, h - 6, theme.base);
          block(ctx, x + 4, y + 6, w - 8, Math.max(4, h - 14), theme.accent);
          if (theme.style === "hay") {
            block(ctx, x + 6, y + Math.round(h * 0.3), w - 12, 2, theme.trim);
            block(ctx, x + 6, y + Math.round(h * 0.55), w - 12, 2, theme.trim);
          } else if (theme.style === "cooler") {
            block(ctx, x + 6, y + 6, w - 12, 6, theme.trim);
            block(ctx, x + Math.round(w * 0.34), y + 1, Math.round(w * 0.32), 4, theme.trim);
          } else if (theme.style === "gift") {
            block(ctx, x + Math.round(w * 0.45), y + 4, 4, h - 6, theme.trim);
            block(ctx, x + 2, y + Math.round(h * 0.46), w - 4, 4, theme.trim);
          } else if (theme.style === "toolbox") {
            block(ctx, x + Math.round(w * 0.28), y + 1, Math.round(w * 0.44), 5, theme.trim);
          } else {
            block(ctx, x + 5, y + 8, w - 10, 3, theme.trim);
            block(ctx, x + 5, y + h - 10, w - 10, 3, theme.trim);
            block(ctx, x + Math.round(w * 0.28), y + 6, 3, h - 10, theme.trim);
            block(ctx, x + Math.round(w * 0.68), y + 6, 3, h - 10, theme.trim);
          }
          break;
        case "dune":
        case "fence":
        case "boardwalk":
        case "barricade":
        case "launchpad":
        case "basalt":
        case "snowdrift":
        case "driftwood":
        case "root":
        case "datawedge":
          wedge(ctx, x + 2, y + 2, w - 4, h - 2, theme.base, variant % 2 === 1);
          if (theme.style === "barricade") {
            block(ctx, x + 6, y + Math.round(h * 0.28), w - 12, 4, theme.accent);
            block(ctx, x + 10, y + Math.round(h * 0.5), w - 20, 4, theme.trim);
          } else if (theme.style === "fence" || theme.style === "boardwalk") {
            block(ctx, x + 6, y + Math.round(h * 0.3), w - 12, 3, theme.accent);
            block(ctx, x + 8, y + Math.round(h * 0.54), w - 16, 3, theme.trim);
          } else if (theme.style === "launchpad" || theme.style === "datawedge") {
            block(ctx, x + 6, y + Math.round(h * 0.22), w - 12, 3, theme.accent);
            block(ctx, x + 10, y + Math.round(h * 0.46), w - 20, 3, theme.trim);
          } else {
            block(ctx, x + 8, y + Math.round(h * 0.34), w - 16, 3, theme.accent);
          }
          break;
        case "scarab":
        case "crow":
        case "dragonfly":
        case "drone":
        case "probe":
        case "emberbat":
        case "owl":
        case "gull":
        case "parrot":
        case "hoverbot": {
          const bodyY = y + Math.round(h * 0.34);
          const wingLift = Math.round((phase + 1) * 2);
          block(ctx, x + Math.round(w * 0.28), bodyY, Math.round(w * 0.44), Math.round(h * 0.26), theme.base);
          block(ctx, x + Math.round(w * 0.18), bodyY + 3 - wingLift, Math.round(w * 0.18), 4 + wingLift, theme.accent);
          block(ctx, x + Math.round(w * 0.64), bodyY + 3 - wingLift, Math.round(w * 0.18), 4 + wingLift, theme.accent);
          if (theme.style === "drone" || theme.style === "hoverbot" || theme.style === "probe") {
            block(ctx, x + Math.round(w * 0.22), y + Math.round(h * 0.2), Math.round(w * 0.56), 2, theme.trim);
            block(ctx, x + Math.round(w * 0.3), y + Math.round(h * 0.14), 3, 6, theme.trim);
            block(ctx, x + Math.round(w * 0.66), y + Math.round(h * 0.14), 3, 6, theme.trim);
          } else {
            block(ctx, x + Math.round(w * 0.44), bodyY - 4, 5, 5, theme.trim);
          }
          break;
        }
        case "jar":
        case "milk":
        case "barrel":
        case "trashcan":
        case "canister":
        case "magma":
        case "log":
        case "buoy":
        case "totem":
        case "battery":
          block(ctx, x + Math.round(w * 0.2), y + 4, Math.round(w * 0.6), h - 6, theme.base);
          block(ctx, x + Math.round(w * 0.24), y + 8, Math.round(w * 0.52), h - 14, theme.accent);
          if (theme.style === "log") {
            block(ctx, x + Math.round(w * 0.2), y + 4, Math.round(w * 0.6), 4, theme.trim);
            block(ctx, x + Math.round(w * 0.2), y + h - 6, Math.round(w * 0.6), 4, theme.trim);
          } else if (theme.style === "buoy" || theme.style === "battery" || theme.style === "magma") {
            block(ctx, x + Math.round(w * 0.2), y + Math.round(h * 0.34), Math.round(w * 0.6), 4, theme.trim);
            block(ctx, x + Math.round(w * 0.2), y + Math.round(h * 0.62), Math.round(w * 0.6), 4, theme.trim);
          } else if (theme.style === "totem") {
            block(ctx, x + Math.round(w * 0.36), y + 10, 4, h - 18, theme.trim);
            block(ctx, x + Math.round(w * 0.28), y + Math.round(h * 0.22), Math.round(w * 0.28), 4, theme.trim);
          } else {
            block(ctx, x + Math.round(w * 0.2), y + 10, Math.round(w * 0.6), 4, theme.trim);
            block(ctx, x + Math.round(w * 0.2), y + h - 10, Math.round(w * 0.6), 4, theme.trim);
          }
          break;
        default:
          block(ctx, x, y, w, h, theme.base);
          block(ctx, x + 2, y + 2, w - 4, 3, "rgba(255,255,255,0.3)");
      }
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
      this.drawDepthWash(biome, groundY);
      this.drawPlayfieldFocus(state.player, biome, groundY);

      state.coins.forEach((coin) => this.drawCoin(coin, state.animationClock));
      state.powerups.forEach((powerup) => {
        block(ctx, powerup.x, powerup.y, powerup.width, powerup.height, powerup.color);
        block(ctx, powerup.x + 7, powerup.y + 7, 10, 10, "#14223f");
      });
      state.obstacles.forEach((obstacle) => this.drawObstacle(obstacle, biome, state.animationClock));

      this.drawRunner(state.player, state.animationClock);
      const progress = Math.min(1, state.distance / this.level.length);
      block(ctx, 20, 14, c.width - 40, 12, "#1f2a44");
      block(ctx, 20, 14, (c.width - 40) * progress, 12, accent);
    }
  }

  FamilyDash.Renderer = Renderer;
})();
