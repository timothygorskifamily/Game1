(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});

  const PALETTES = {
    desert: { skyTop: "#6fc4f1", skyMid: "#f7c78d", skyBottom: "#fff0ce", sun: "#ffd471", haze: "#fff2d2", far: "#d9a061", mid: "#b97246", near: "#6e4b35", lane: "#c9924d", laneDark: "#86582f", laneLine: "#fbe0a2", prop: "#6e8d4d", accent: "#ffd98a" },
    farm: { skyTop: "#7fd4ff", skyMid: "#c1edff", skyBottom: "#f2fbff", sun: "#fff0b0", haze: "#ffffff", far: "#93c46c", mid: "#72a253", near: "#46673a", lane: "#8fbe62", laneDark: "#5b853f", laneLine: "#f9f3c1", prop: "#bb6c42", accent: "#f2d26f" },
    marsh: { skyTop: "#5d8578", skyMid: "#86b09a", skyBottom: "#dcefe1", sun: "#f0f7c9", haze: "#dbe7df", far: "#698c63", mid: "#4f714a", near: "#30483a", lane: "#5e815a", laneDark: "#425f44", laneLine: "#c8dea0", prop: "#7a5d40", accent: "#bcd890" },
    city: { skyTop: "#2f4467", skyMid: "#7387b5", skyBottom: "#f7b58e", sun: "#ffd6a1", haze: "#f2d4bc", far: "#728195", mid: "#536179", near: "#2b3547", lane: "#5d6777", laneDark: "#3d4452", laneLine: "#ffe79d", prop: "#6aa6ff", accent: "#ffbf6e" },
    space: { skyTop: "#060b1e", skyMid: "#18254b", skyBottom: "#2d3568", sun: "#9bb1ff", haze: "#5c6bad", far: "#3c4b79", mid: "#2a335a", near: "#171d39", lane: "#41486f", laneDark: "#292f4b", laneLine: "#bfd2ff", prop: "#ff9fd4", accent: "#8fb1ff" },
    volcano: { skyTop: "#231015", skyMid: "#602722", skyBottom: "#dc7342", sun: "#ffcc83", haze: "#ffb58a", far: "#6b4037", mid: "#4d2e2c", near: "#25181a", lane: "#5d3c31", laneDark: "#352322", laneLine: "#ffb66f", prop: "#ff7c52", accent: "#ffc07e" },
    snow: { skyTop: "#90d8ff", skyMid: "#d8f2ff", skyBottom: "#ffffff", sun: "#fffde0", haze: "#ffffff", far: "#bfd8ea", mid: "#9bbdd5", near: "#5e7d98", lane: "#d8edf7", laneDark: "#bdd5e4", laneLine: "#ffffff", prop: "#8b6f4a", accent: "#b8dfff" },
    beach: { skyTop: "#4ac3f2", skyMid: "#9de7ff", skyBottom: "#f7fdff", sun: "#ffe489", haze: "#ffffff", far: "#56c1dd", mid: "#3f95ba", near: "#7b5d3e", lane: "#e2c582", laneDark: "#bd9f5d", laneLine: "#fff2c7", prop: "#3a9f84", accent: "#ff9d7a" },
    jungle: { skyTop: "#2c6a47", skyMid: "#69ab65", skyBottom: "#d9efb3", sun: "#fff0a6", haze: "#d4e6ba", far: "#507f45", mid: "#335a33", near: "#1d3322", lane: "#507a39", laneDark: "#39572c", laneLine: "#9cd278", prop: "#7e6740", accent: "#6ecf88" },
    cyber: { skyTop: "#05091c", skyMid: "#182348", skyBottom: "#351f53", sun: "#ff66d0", haze: "#34244e", far: "#20345c", mid: "#172643", near: "#0c1428", lane: "#1a2646", laneDark: "#0f1831", laneLine: "#31f3ff", prop: "#31f3ff", accent: "#ff61d8" }
  };

  const BIOME_STYLES = {
    desert: { cone: "cactus", toyBox: "crate", ramp: "dune", drone: "scarab", barrel: "jar", pile: "tumbleweed", sign: "trailsign", bench: "stonebench", crystal: "sandstone", monster: "scorpion" },
    farm: { cone: "pumpkin", toyBox: "hay", ramp: "fence", drone: "crow", barrel: "milk", pile: "producepile", sign: "farmsign", bench: "cart", crystal: "cornshock", monster: "boar" },
    marsh: { cone: "stump", toyBox: "crate", ramp: "boardwalk", drone: "dragonfly", barrel: "barrel", pile: "reedstack", sign: "warningsign", bench: "dockbench", crystal: "cattails", monster: "slime" },
    city: { cone: "cone", toyBox: "toolbox", ramp: "barricade", drone: "drone", barrel: "trashcan", pile: "debrispile", sign: "streetsign", bench: "bench", crystal: "hydrant", monster: "rat" },
    space: { cone: "moonrock", toyBox: "crate", ramp: "launchpad", drone: "probe", barrel: "canister", pile: "meteorcluster", sign: "beacon", bench: "console", crystal: "crystal", monster: "alien" },
    volcano: { cone: "lavarock", toyBox: "crate", ramp: "basalt", drone: "emberbat", barrel: "magma", pile: "rubblepile", sign: "hazardsign", bench: "basaltbench", crystal: "magmaflare", monster: "imp" },
    snow: { cone: "snowman", toyBox: "gift", ramp: "snowdrift", drone: "owl", barrel: "log", pile: "snowpile", sign: "skimarker", bench: "sled", crystal: "iceshard", monster: "yeti" },
    beach: { cone: "sandcastle", toyBox: "cooler", ramp: "driftwood", drone: "gull", barrel: "buoy", pile: "shellpile", sign: "beachsign", bench: "lounger", crystal: "coral", monster: "crab" },
    jungle: { cone: "stump", toyBox: "crate", ramp: "root", drone: "parrot", barrel: "totem", pile: "fernclump", sign: "campmarker", bench: "fallenlog", crystal: "idol", monster: "lizard" },
    cyber: { cone: "bollard", toyBox: "neoncrate", ramp: "datawedge", drone: "hoverbot", barrel: "battery", pile: "scrappile", sign: "holosign", bench: "glitchrail", crystal: "datacrystal", monster: "crawler" }
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function hash(seed) {
    const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
    return x - Math.floor(x);
  }

  function wrap(value, size) {
    const remainder = value % size;
    return remainder < 0 ? remainder + size : remainder;
  }

  function hexToRgb(color) {
    const raw = String(color || "").trim();
    const rgbMatch = raw.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (rgbMatch) {
      return { r: parseInt(rgbMatch[1], 10), g: parseInt(rgbMatch[2], 10), b: parseInt(rgbMatch[3], 10) };
    }
    const value = raw.replace("#", "");
    if (value.length === 3) {
      return {
        r: parseInt(value[0] + value[0], 16),
        g: parseInt(value[1] + value[1], 16),
        b: parseInt(value[2] + value[2], 16)
      };
    }
    if (value.length !== 6) return { r: 255, g: 255, b: 255 };
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16)
    };
  }

  function alphaColor(color, alpha) {
    const rgb = hexToRgb(color);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  function mixColor(a, b, t) {
    const colorA = hexToRgb(a);
    const colorB = hexToRgb(b);
    const mix = clamp(t, 0, 1);
    const r = Math.round(lerp(colorA.r, colorB.r, mix));
    const g = Math.round(lerp(colorA.g, colorB.g, mix));
    const bValue = Math.round(lerp(colorA.b, colorB.b, mix));
    return `rgb(${r}, ${g}, ${bValue})`;
  }

  function roundRectPath(ctx, x, y, width, height, radius) {
    const r = Math.max(0, Math.min(radius, width * 0.5, height * 0.5));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function fillRoundRect(ctx, x, y, width, height, radius, fillStyle, alpha) {
    ctx.save();
    if (typeof alpha === "number") ctx.globalAlpha = alpha;
    ctx.fillStyle = fillStyle;
    roundRectPath(ctx, x, y, width, height, radius);
    ctx.fill();
    ctx.restore();
  }

  function strokeRoundRect(ctx, x, y, width, height, radius, strokeStyle, lineWidth, alpha) {
    ctx.save();
    if (typeof alpha === "number") ctx.globalAlpha = alpha;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    roundRectPath(ctx, x, y, width, height, radius);
    ctx.stroke();
    ctx.restore();
  }

  function circle(ctx, x, y, radius, fillStyle, alpha) {
    ctx.save();
    if (typeof alpha === "number") ctx.globalAlpha = alpha;
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function ellipse(ctx, x, y, radiusX, radiusY, fillStyle, alpha) {
    ctx.save();
    if (typeof alpha === "number") ctx.globalAlpha = alpha;
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function line(ctx, x1, y1, x2, y2, width, strokeStyle, alpha) {
    ctx.save();
    if (typeof alpha === "number") ctx.globalAlpha = alpha;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  function polygon(ctx, points, fillStyle, alpha) {
    if (!points || points.length < 2) return;
    ctx.save();
    if (typeof alpha === "number") ctx.globalAlpha = alpha;
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function jointedLimb(ctx, points, baseColor, shadowColor, width, shadowAlpha) {
    if (!points || points.length < 2) return;
    ctx.save();
    ctx.strokeStyle = shadowColor;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = typeof shadowAlpha === "number" ? shadowAlpha : 1;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = width * 0.76;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
    ctx.stroke();
    ctx.restore();

    for (let i = 1; i < points.length - 1; i += 1) {
      circle(ctx, points[i][0], points[i][1], width * 0.34, shadowColor, 0.26);
    }
  }

  class Renderer {
    constructor(canvas, level) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.level = level;
      this.imageCache = new Map();
      this.logicalWidth = Number(canvas.getAttribute("width")) || 960;
      this.logicalHeight = Number(canvas.getAttribute("height")) || 420;
      this.displayWidth = this.logicalWidth;
      this.displayHeight = this.logicalHeight;
      this.resize();
    }

    setLevel(level) {
      this.level = level;
    }

    getViewport() {
      return { width: this.logicalWidth, height: this.logicalHeight };
    }

    resize() {
      const body = document.body;
      const isLandscapeGame = Boolean(
        body &&
        body.classList.contains("is-mobile") &&
        body.classList.contains("mobile-landscape") &&
        body.classList.contains("game-screen-active")
      );
      let targetWidth = 0;
      let targetHeight = 0;

      if (isLandscapeGame && this.canvas.parentElement) {
        const parent = this.canvas.parentElement;
        const styles = window.getComputedStyle(parent);
        const availableWidth = parent.clientWidth - (parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight));
        const availableHeight = parent.clientHeight - (parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom));
        if (!availableWidth || !availableHeight) return false;

        const aspectRatio = this.logicalWidth / this.logicalHeight;
        targetWidth = availableWidth;
        targetHeight = targetWidth / aspectRatio;
        if (targetHeight > availableHeight) {
          targetHeight = availableHeight;
          targetWidth = targetHeight * aspectRatio;
        }

        const cssWidth = `${Math.max(1, Math.round(targetWidth))}px`;
        const cssHeight = `${Math.max(1, Math.round(targetHeight))}px`;
        if (this.canvas.style.width !== cssWidth) this.canvas.style.width = cssWidth;
        if (this.canvas.style.height !== cssHeight) this.canvas.style.height = cssHeight;
      } else {
        if (this.canvas.style.width) this.canvas.style.width = "";
        if (this.canvas.style.height) this.canvas.style.height = "";
        const rect = this.canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return false;
        targetWidth = rect.width;
        targetHeight = rect.height;
      }

      const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
      const width = Math.round(targetWidth * dpr);
      const height = Math.round(targetHeight * dpr);
      if (width === this.displayWidth && height === this.displayHeight) return false;
      this.displayWidth = width;
      this.displayHeight = height;
      this.canvas.width = width;
      this.canvas.height = height;
      return true;
    }

    palette(biome) {
      return PALETTES[biome] || PALETTES.city;
    }

    obstacleTheme(biome, obstacle) {
      const palette = this.palette(biome);
      const style = obstacle.style || ((BIOME_STYLES[biome] && BIOME_STYLES[biome][obstacle.type]) || obstacle.type);
      const trim = mixColor(palette.near, "#0b1323", 0.45);
      const highlight = mixColor(palette.sun, "#ffffff", 0.45);
      switch (obstacle.type) {
        case "cone":
          return { style, base: palette.prop, accent: highlight, trim, glow: palette.accent };
        case "toyBox":
          return { style, base: mixColor(palette.near, palette.sun, 0.24), accent: mixColor(palette.sun, "#ffffff", 0.3), trim, glow: palette.accent };
        case "pile":
          return { style, base: mixColor(palette.prop, palette.near, 0.45), accent: mixColor(palette.accent, "#ffffff", 0.2), trim, glow: palette.accent };
        case "sign":
          return { style, base: mixColor(palette.near, palette.prop, 0.3), accent: highlight, trim, glow: palette.accent };
        case "ramp":
          return { style, base: mixColor(palette.lane, palette.near, 0.24), accent: highlight, trim, glow: palette.accent };
        case "bench":
          return { style, base: mixColor(palette.near, palette.lane, 0.3), accent: mixColor(palette.sun, "#ffffff", 0.25), trim, glow: palette.accent };
        case "drone":
          return { style, base: mixColor(palette.near, palette.accent, biome === "cyber" ? 0.55 : 0.28), accent: highlight, trim, glow: palette.accent };
        case "barrel":
          return { style, base: mixColor(palette.near, palette.sun, 0.18), accent: mixColor(palette.sun, "#ffffff", 0.18), trim, glow: palette.accent };
        case "crystal":
          return { style, base: mixColor(palette.accent, palette.near, 0.28), accent: mixColor(palette.accent, "#ffffff", 0.45), trim, glow: palette.accent };
        case "monster":
          return { style, base: mixColor(palette.near, palette.prop, biome === "cyber" ? 0.4 : 0.24), accent: mixColor(palette.accent, "#ffffff", 0.18), trim, glow: highlight };
        case "boss":
          return { style, base: obstacle.color || mixColor(palette.near, palette.prop, 0.32), accent: mixColor(palette.accent, "#ffffff", 0.24), trim, glow: palette.accent };
        default:
          return { style, base: obstacle.color, accent: highlight, trim, glow: palette.accent };
      }
    }

    beginFrame() {
      this.resize();
      const ctx = this.ctx;
      const scaleX = this.canvas.width / this.logicalWidth;
      const scaleY = this.canvas.height / this.logicalHeight;
      ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
      ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
      ctx.imageSmoothingEnabled = true;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }

    drawCloud(x, y, scale, color, alpha) {
      ellipse(this.ctx, x - 18 * scale, y + 4 * scale, 22 * scale, 14 * scale, color, alpha);
      ellipse(this.ctx, x + 6 * scale, y, 28 * scale, 18 * scale, color, alpha);
      ellipse(this.ctx, x + 34 * scale, y + 6 * scale, 20 * scale, 12 * scale, color, alpha);
      fillRoundRect(this.ctx, x - 36 * scale, y + 4 * scale, 84 * scale, 22 * scale, 12 * scale, color, alpha);
    }

    drawTerrainBand(baseY, amplitude, frequency, color, distance, speed, alpha) {
      const ctx = this.ctx;
      const width = this.logicalWidth;
      ctx.save();
      if (typeof alpha === "number") ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, this.logicalHeight);
      for (let x = 0; x <= width + 40; x += 40) {
        const world = (x + distance * speed) * frequency;
        const y = baseY + Math.sin(world) * amplitude + Math.sin(world * 0.43 + 1.2) * amplitude * 0.45;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, this.logicalHeight);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    drawSky(distance, biome, groundY) {
      const ctx = this.ctx;
      const c = this.logicalWidth;
      const p = this.palette(biome);
      const gradient = ctx.createLinearGradient(0, 0, 0, groundY);
      gradient.addColorStop(0, p.skyTop);
      gradient.addColorStop(0.58, p.skyMid);
      gradient.addColorStop(1, p.skyBottom);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, c, this.logicalHeight);

      ellipse(ctx, c * 0.74, biome === "space" ? 84 : 92, biome === "space" ? 44 : 36, biome === "space" ? 44 : 36, p.sun, biome === "space" ? 0.82 : 0.9);
      ellipse(ctx, c * 0.74, biome === "space" ? 84 : 92, 70, 70, p.sun, 0.12);

      if (biome === "space" || biome === "cyber") {
        for (let i = 0; i < 42; i += 1) {
          const x = wrap(i * 57 - distance * (0.09 + (i % 3) * 0.02), c);
          const y = 22 + hash(i * 2.1) * (groundY - 80);
          circle(ctx, x, y, 1 + hash(i * 4.2) * 1.8, i % 5 === 0 ? "#ffffff" : p.accent, 0.8);
        }
      } else {
        this.drawCloud(140 - wrap(distance * 0.1, c + 200), 72, 1.06, "#ffffff", biome === "jungle" ? 0.18 : 0.62);
        this.drawCloud(520 - wrap(distance * 0.07, c + 220), biome === "desert" ? 104 : 118, 0.92, "#ffffff", biome === "marsh" ? 0.2 : 0.52);
      }

      const haze = ctx.createLinearGradient(0, groundY - 120, 0, groundY + 8);
      haze.addColorStop(0, alphaColor(p.haze, 0));
      haze.addColorStop(1, alphaColor(p.haze, 0.48));
      ctx.fillStyle = haze;
      ctx.fillRect(0, groundY - 120, c, 140);
    }

    drawBackdrop(distance, biome, groundY) {
      const p = this.palette(biome);
      this.drawTerrainBand(groundY - 88, 18, 0.012, p.far, distance, 0.08, 0.9);
      this.drawTerrainBand(groundY - 46, 28, 0.018, p.mid, distance, 0.16, 0.95);
      this.drawTerrainBand(groundY - 10, 18, 0.025, p.near, distance, 0.24, 1);
      this.drawBiomeProps(distance, biome, groundY, 0.18, 0.72);
      this.drawBiomeProps(distance, biome, groundY, 0.3, 1);
    }

    drawBiomeProps(distance, biome, groundY, speed, scale) {
      const ctx = this.ctx;
      const p = this.palette(biome);
      const spacing = 140;
      for (let i = -1; i < Math.ceil(this.logicalWidth / spacing) + 2; i += 1) {
        const worldIndex = i + Math.floor(distance * speed / spacing);
        const x = i * spacing - wrap(distance * speed, spacing);
        const y = groundY - 24;
        const variant = Math.floor(hash(worldIndex * 3.17) * 3);
        const alpha = scale < 1 ? 0.66 : 0.92;

        switch (biome) {
          case "desert":
            ellipse(ctx, x + 36, y + 26, 34 * scale, 14 * scale, alphaColor(p.far, 0.5), alpha);
            if (variant !== 1) {
              fillRoundRect(ctx, x + 30, y - 42 * scale, 10 * scale, 54 * scale, 8 * scale, p.prop, alpha);
              fillRoundRect(ctx, x + 20, y - 18 * scale, 12 * scale, 8 * scale, 4 * scale, p.prop, alpha);
              fillRoundRect(ctx, x + 38, y - 28 * scale, 12 * scale, 8 * scale, 4 * scale, p.prop, alpha);
            }
            break;
          case "farm":
            fillRoundRect(ctx, x + 14, y - 28 * scale, 56 * scale, 28 * scale, 10 * scale, p.prop, alpha);
            polygon(ctx, [[x + 8, y - 28 * scale], [x + 42, y - 52 * scale], [x + 76, y - 28 * scale]], alphaColor(p.accent, 0.86), alpha);
            line(ctx, x + 28, y, x + 28, y - 42 * scale, 4 * scale, mixColor(p.near, "#000000", 0.2), alpha);
            break;
          case "marsh":
            for (let blade = 0; blade < 4; blade += 1) {
              line(ctx, x + 18 + blade * 8, y, x + 20 + blade * 8, y - (24 + blade * 3) * scale, 3 * scale, p.prop, alpha);
            }
            ellipse(ctx, x + 38, y + 8, 28 * scale, 8 * scale, alphaColor("#d5f1df", 0.18), alpha);
            break;
          case "city":
            fillRoundRect(ctx, x + 8, y - 76 * scale, 34 * scale, 78 * scale, 8 * scale, p.mid, alpha);
            fillRoundRect(ctx, x + 42, y - 52 * scale, 22 * scale, 54 * scale, 8 * scale, p.near, alpha);
            for (let wy = 0; wy < 4; wy += 1) circle(ctx, x + 18, y - 60 * scale + wy * 16 * scale, 2 * scale, p.accent, alpha * 0.9);
            break;
          case "space":
            ellipse(ctx, x + 32, y + 12, 34 * scale, 12 * scale, alphaColor(p.mid, 0.35), alpha);
            fillRoundRect(ctx, x + 18, y - 26 * scale, 28 * scale, 20 * scale, 8 * scale, p.mid, alpha);
            circle(ctx, x + 32, y - 30 * scale, 8 * scale, p.accent, alpha * 0.8);
            break;
          case "volcano":
            polygon(ctx, [[x + 6, y + 8], [x + 34, y - 60 * scale], [x + 62, y + 8]], p.mid, alpha);
            polygon(ctx, [[x + 24, y - 20 * scale], [x + 34, y - 60 * scale], [x + 44, y - 20 * scale]], p.accent, alpha * 0.9);
            break;
          case "snow":
            polygon(ctx, [[x + 4, y + 10], [x + 28, y - 54 * scale], [x + 52, y + 10]], p.mid, alpha);
            polygon(ctx, [[x + 12, y - 8 * scale], [x + 28, y - 54 * scale], [x + 44, y - 8 * scale]], "#ffffff", alpha * 0.92);
            break;
          case "beach":
            line(ctx, x + 32, y + 8, x + 34, y - 36 * scale, 5 * scale, p.near, alpha);
            ellipse(ctx, x + 20, y - 38 * scale, 16 * scale, 8 * scale, p.prop, alpha);
            ellipse(ctx, x + 42, y - 32 * scale, 18 * scale, 9 * scale, p.prop, alpha);
            ellipse(ctx, x + 54, y - 18 * scale, 14 * scale, 8 * scale, p.prop, alpha);
            break;
          case "jungle":
            line(ctx, x + 30, y + 8, x + 30, y - 52 * scale, 7 * scale, p.near, alpha);
            ellipse(ctx, x + 14, y - 46 * scale, 18 * scale, 10 * scale, p.prop, alpha);
            ellipse(ctx, x + 42, y - 56 * scale, 20 * scale, 12 * scale, p.prop, alpha);
            ellipse(ctx, x + 56, y - 38 * scale, 16 * scale, 10 * scale, p.prop, alpha);
            break;
          case "cyber":
            fillRoundRect(ctx, x + 14, y - 82 * scale, 30 * scale, 82 * scale, 8 * scale, p.mid, alpha);
            line(ctx, x + 20, y - 66 * scale, x + 38, y - 66 * scale, 3 * scale, p.accent, alpha);
            line(ctx, x + 20, y - 44 * scale, x + 38, y - 44 * scale, 3 * scale, p.prop, alpha);
            line(ctx, x + 20, y - 22 * scale, x + 38, y - 22 * scale, 3 * scale, p.accent, alpha);
            break;
          default:
            break;
        }
      }
    }

    drawTrack(distance, biome, groundY) {
      const ctx = this.ctx;
      const p = this.palette(biome);
      const gradient = ctx.createLinearGradient(0, groundY - 18, 0, this.logicalHeight);
      gradient.addColorStop(0, p.lane);
      gradient.addColorStop(0.5, mixColor(p.lane, p.laneDark, 0.16));
      gradient.addColorStop(1, p.laneDark);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, groundY - 18, this.logicalWidth, this.logicalHeight - groundY + 18);

      ctx.fillStyle = alphaColor("#ffffff", 0.12);
      ctx.fillRect(0, groundY - 10, this.logicalWidth, 10);
      ctx.fillStyle = alphaColor(p.laneLine, 0.32);
      ctx.fillRect(0, groundY + 8, this.logicalWidth, 3);

      for (let i = -1; i < 24; i += 1) {
        const x = i * 54 - wrap(distance * 0.7, 54);
        switch (biome) {
          case "desert":
            ellipse(ctx, x + 20, groundY + 26, 14, 4, alphaColor(p.accent, 0.15), 1);
            break;
          case "farm":
            line(ctx, x + 8, groundY + 16, x + 38, groundY + 40, 1.2, alphaColor("#54763b", 0.34));
            break;
          case "marsh":
            ellipse(ctx, x + 18, groundY + 24, 15, 5, alphaColor("#bfe5d3", 0.12), 1);
            break;
          case "city":
            fillRoundRect(ctx, x + 6, groundY + 14, 26, 6, 3, alphaColor("#c8d6ec", 0.12));
            break;
          case "space":
            ellipse(ctx, x + 18, groundY + 28, 12, 5, alphaColor("#a8b9ff", 0.12), 1);
            break;
          case "volcano":
            line(ctx, x + 8, groundY + 20, x + 34, groundY + 22, 2, alphaColor(p.accent, 0.18));
            break;
          case "snow":
            circle(ctx, x + 14, groundY + 24, 3.2, alphaColor("#ffffff", 0.28), 1);
            circle(ctx, x + 24, groundY + 34, 2.7, alphaColor("#ffffff", 0.2), 1);
            break;
          case "beach":
            line(ctx, x + 8, groundY + 16, x + 34, groundY + 20, 2, alphaColor("#fff6d8", 0.18));
            break;
          case "jungle":
            line(ctx, x + 8, groundY + 18, x + 30, groundY + 30, 2, alphaColor("#355425", 0.2));
            break;
          case "cyber":
            line(ctx, x + 8, groundY + 18, x + 34, groundY + 18, 2, alphaColor(p.accent, 0.18));
            line(ctx, x + 20, groundY + 10, x + 20, groundY + 34, 1, alphaColor(p.prop, 0.16));
            break;
          default:
            break;
        }
      }

      const vignette = ctx.createLinearGradient(0, groundY - 30, 0, this.logicalHeight);
      vignette.addColorStop(0, alphaColor("#ffffff", 0));
      vignette.addColorStop(1, alphaColor("#000000", 0.12));
      ctx.fillStyle = vignette;
      ctx.fillRect(0, groundY - 30, this.logicalWidth, this.logicalHeight - groundY + 30);
    }

    drawAtmosphere(distance, biome, groundY) {
      const ctx = this.ctx;
      const p = this.palette(biome);
      for (let i = 0; i < 16; i += 1) {
        const x = wrap(i * 71 - distance * (0.18 + i * 0.003), this.logicalWidth);
        const y = groundY - 110 + hash(i * 2.2) * 90;
        if (biome === "snow") circle(ctx, x, y, 1.2 + hash(i * 8) * 2, "#ffffff", 0.75);
        else if (biome === "beach") ellipse(ctx, x, y, 4, 2, alphaColor("#ffffff", 0.28), 1);
        else if (biome === "volcano") circle(ctx, x, y, 2 + hash(i * 6) * 2, alphaColor(p.accent, 0.22), 1);
        else if (biome === "cyber") line(ctx, x, groundY - 128, x, groundY - 12, 1, alphaColor(p.prop, 0.08));
        else circle(ctx, x, y, 2 + hash(i * 5) * 2, alphaColor(p.accent, 0.12), 1);
      }
    }

    drawCoin(coin, animationClock) {
      const ctx = this.ctx;
      const spin = 0.3 + Math.abs(Math.sin(animationClock * 9 + coin.x * 0.03)) * 0.7;
      const width = coin.width * spin;
      const x = coin.x + (coin.width - width) * 0.5;
      ellipse(ctx, coin.x + coin.width * 0.5, coin.y + coin.height * 0.56, coin.width * 0.42, coin.height * 0.18, alphaColor("#000000", 0.12), 1);
      const gradient = ctx.createLinearGradient(x, coin.y, x + width, coin.y + coin.height);
      gradient.addColorStop(0, "#fff4a6");
      gradient.addColorStop(0.4, "#ffd65a");
      gradient.addColorStop(1, "#d89600");
      fillRoundRect(ctx, x, coin.y, width, coin.height, coin.height * 0.45, gradient);
      strokeRoundRect(ctx, x, coin.y, width, coin.height, coin.height * 0.45, alphaColor("#fff8d8", 0.85), 1.6);
      line(ctx, x + width * 0.25, coin.y + 4, x + width * 0.25, coin.y + coin.height - 4, 1.5, alphaColor("#fff9d8", 0.72));
    }

    drawPowerup(powerup, animationClock) {
      const ctx = this.ctx;
      const pulse = 0.85 + Math.sin(animationClock * 5 + powerup.x * 0.03) * 0.08;
      circle(ctx, powerup.x + powerup.width * 0.5, powerup.y + powerup.height * 0.5, powerup.width * 0.82 * pulse, powerup.color, 0.15);
      circle(ctx, powerup.x + powerup.width * 0.5, powerup.y + powerup.height * 0.5, powerup.width * 0.52, powerup.color, 0.95);
      strokeRoundRect(ctx, powerup.x + 3, powerup.y + 3, powerup.width - 6, powerup.height - 6, 8, alphaColor("#ffffff", 0.7), 1.5);
      ctx.save();
      ctx.fillStyle = "#11223a";
      ctx.font = "700 10px 'Space Grotesk', 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(powerup.label.slice(0, 2), powerup.x + powerup.width * 0.5, powerup.y + powerup.height * 0.56);
      ctx.restore();
    }

    drawHazardObstacle(x, y, w, h, theme) {
      const ctx = this.ctx;
      switch (theme.style) {
        case "cactus":
          fillRoundRect(ctx, x + w * 0.38, y + 8, w * 0.22, h - 10, 8, theme.base);
          fillRoundRect(ctx, x + w * 0.2, y + h * 0.38, w * 0.18, h * 0.14, 6, theme.base);
          fillRoundRect(ctx, x + w * 0.6, y + h * 0.22, w * 0.18, h * 0.14, 6, theme.base);
          line(ctx, x + w * 0.49, y + 12, x + w * 0.49, y + h - 8, 1.4, alphaColor(theme.accent, 0.3));
          break;
        case "pumpkin":
          ellipse(ctx, x + w * 0.5, y + h * 0.62, w * 0.24, h * 0.28, theme.base);
          ellipse(ctx, x + w * 0.34, y + h * 0.64, w * 0.18, h * 0.22, theme.base);
          ellipse(ctx, x + w * 0.66, y + h * 0.64, w * 0.18, h * 0.22, theme.base);
          fillRoundRect(ctx, x + w * 0.45, y + 6, w * 0.08, h * 0.14, 3, theme.trim);
          line(ctx, x + w * 0.34, y + h * 0.42, x + w * 0.34, y + h * 0.82, 1.4, alphaColor(theme.accent, 0.36));
          line(ctx, x + w * 0.5, y + h * 0.36, x + w * 0.5, y + h * 0.82, 1.4, alphaColor(theme.accent, 0.36));
          line(ctx, x + w * 0.66, y + h * 0.42, x + w * 0.66, y + h * 0.82, 1.4, alphaColor(theme.accent, 0.36));
          break;
        case "stump":
          fillRoundRect(ctx, x + w * 0.18, y + h * 0.14, w * 0.64, h * 0.82, 10, theme.base);
          ellipse(ctx, x + w * 0.5, y + h * 0.18, w * 0.3, h * 0.08, theme.accent);
          ellipse(ctx, x + w * 0.5, y + h * 0.18, w * 0.16, h * 0.04, theme.trim);
          break;
        case "cone":
          polygon(ctx, [[x + w * 0.18, y + h], [x + w * 0.5, y + 6], [x + w * 0.82, y + h]], theme.base);
          fillRoundRect(ctx, x + w * 0.14, y + h * 0.82, w * 0.72, h * 0.16, 6, theme.trim);
          line(ctx, x + w * 0.28, y + h * 0.42, x + w * 0.68, y + h * 0.42, 4, theme.accent);
          line(ctx, x + w * 0.22, y + h * 0.64, x + w * 0.76, y + h * 0.64, 4, theme.accent);
          break;
        case "moonrock":
        case "lavarock":
          ellipse(ctx, x + w * 0.3, y + h * 0.7, w * 0.2, h * 0.16, theme.base);
          ellipse(ctx, x + w * 0.56, y + h * 0.56, w * 0.28, h * 0.24, theme.base);
          ellipse(ctx, x + w * 0.74, y + h * 0.7, w * 0.14, h * 0.12, theme.base);
          line(ctx, x + w * 0.42, y + h * 0.56, x + w * 0.58, y + h * 0.56, 2.5, theme.accent, 0.26);
          break;
        case "snowman":
          circle(ctx, x + w * 0.5, y + h * 0.68, w * 0.22, "#f9fdff");
          circle(ctx, x + w * 0.5, y + h * 0.36, w * 0.16, "#f9fdff");
          circle(ctx, x + w * 0.48, y + h * 0.34, 2.2, theme.trim);
          circle(ctx, x + w * 0.54, y + h * 0.34, 2.2, theme.trim);
          line(ctx, x + w * 0.42, y + h * 0.52, x + w * 0.58, y + h * 0.52, 2, theme.accent);
          break;
        case "sandcastle":
          fillRoundRect(ctx, x + w * 0.12, y + h * 0.46, w * 0.76, h * 0.38, 6, theme.base);
          fillRoundRect(ctx, x + w * 0.16, y + h * 0.24, w * 0.16, h * 0.24, 4, theme.base);
          fillRoundRect(ctx, x + w * 0.68, y + h * 0.22, w * 0.16, h * 0.26, 4, theme.base);
          line(ctx, x + w * 0.22, y + h * 0.24, x + w * 0.22, y + h * 0.38, 2, theme.trim);
          line(ctx, x + w * 0.74, y + h * 0.22, x + w * 0.74, y + h * 0.4, 2, theme.trim);
          break;
        case "bollard":
          fillRoundRect(ctx, x + w * 0.32, y + 6, w * 0.36, h - 10, 10, theme.base);
          line(ctx, x + w * 0.34, y + h * 0.24, x + w * 0.66, y + h * 0.24, 4, theme.accent);
          line(ctx, x + w * 0.34, y + h * 0.56, x + w * 0.66, y + h * 0.56, 4, theme.trim);
          fillRoundRect(ctx, x + w * 0.24, y + h * 0.86, w * 0.52, h * 0.14, 5, theme.base);
          break;
        default:
          polygon(ctx, [[x + w * 0.16, y + h], [x + w * 0.5, y + 10], [x + w * 0.84, y + h]], theme.base);
      }
    }

    drawStorageObstacle(x, y, w, h, theme) {
      const ctx = this.ctx;
      fillRoundRect(ctx, x + 2, y + 4, w - 4, h - 6, 8, theme.base);
      fillRoundRect(ctx, x + 6, y + 8, w - 12, h - 16, 6, alphaColor(theme.accent, 0.38));
      strokeRoundRect(ctx, x + 2, y + 4, w - 4, h - 6, 8, alphaColor(theme.trim, 0.7), 1.8);
      if (theme.style === "toolbox") fillRoundRect(ctx, x + w * 0.28, y + 2, w * 0.44, 7, 3, theme.trim);
      if (theme.style === "cooler") fillRoundRect(ctx, x + w * 0.34, y, w * 0.32, 6, 3, theme.trim);
      if (theme.style === "gift") {
        line(ctx, x + w * 0.5, y + 6, x + w * 0.5, y + h - 4, 3, theme.trim);
        line(ctx, x + 4, y + h * 0.48, x + w - 4, y + h * 0.48, 3, theme.trim);
      }
      if (theme.style === "hay") {
        line(ctx, x + 6, y + h * 0.34, x + w - 6, y + h * 0.34, 2, theme.trim);
        line(ctx, x + 6, y + h * 0.62, x + w - 6, y + h * 0.62, 2, theme.trim);
      }
      if (theme.style === "neoncrate") strokeRoundRect(ctx, x + 1, y + 3, w - 2, h - 4, 8, alphaColor(theme.glow, 0.55), 1.4);
    }

    drawPileObstacle(x, y, w, h, theme) {
      const ctx = this.ctx;
      if (theme.style === "fernclump") {
        polygon(ctx, [[x + w * 0.18, y + h], [x + w * 0.32, y + h * 0.36], [x + w * 0.42, y + h]], theme.base);
        polygon(ctx, [[x + w * 0.34, y + h], [x + w * 0.52, y + h * 0.18], [x + w * 0.68, y + h]], theme.accent);
        polygon(ctx, [[x + w * 0.58, y + h], [x + w * 0.74, y + h * 0.4], [x + w * 0.84, y + h]], theme.base);
        return;
      }
      if (theme.style === "reedstack") {
        for (let i = 0; i < 5; i += 1) {
          line(ctx, x + w * (0.22 + i * 0.11), y + h, x + w * (0.24 + i * 0.11), y + h * (0.24 + (i % 2) * 0.08), 3, theme.base);
          fillRoundRect(ctx, x + w * (0.2 + i * 0.11), y + h * (0.2 + (i % 2) * 0.08), w * 0.07, h * 0.14, 4, theme.accent);
        }
        return;
      }
      if (theme.style === "snowpile") {
        ellipse(ctx, x + w * 0.34, y + h * 0.72, w * 0.18, h * 0.2, "#ffffff");
        ellipse(ctx, x + w * 0.56, y + h * 0.58, w * 0.24, h * 0.24, "#f7fbff");
        ellipse(ctx, x + w * 0.76, y + h * 0.72, w * 0.14, h * 0.16, "#ffffff");
        return;
      }
      ellipse(ctx, x + w * 0.28, y + h * 0.66, w * 0.18, h * 0.18, theme.base);
      ellipse(ctx, x + w * 0.5, y + h * 0.54, w * 0.22, h * 0.22, theme.accent);
      ellipse(ctx, x + w * 0.74, y + h * 0.68, w * 0.15, h * 0.16, theme.base);
      line(ctx, x + w * 0.22, y + h * 0.7, x + w * 0.78, y + h * 0.64, 3, alphaColor(theme.trim, 0.5));
      if (theme.style === "tumbleweed") {
        line(ctx, x + w * 0.24, y + h * 0.54, x + w * 0.76, y + h * 0.76, 2, alphaColor(theme.trim, 0.6));
        line(ctx, x + w * 0.28, y + h * 0.78, x + w * 0.72, y + h * 0.46, 2, alphaColor(theme.accent, 0.35));
      }
    }

    drawSignObstacle(x, y, w, h, theme) {
      const ctx = this.ctx;
      if (theme.style === "beacon") {
        line(ctx, x + w * 0.5, y + h, x + w * 0.5, y + h * 0.28, 4, theme.trim);
        circle(ctx, x + w * 0.5, y + h * 0.24, w * 0.14, theme.accent, 0.95);
        circle(ctx, x + w * 0.5, y + h * 0.24, w * 0.24, theme.accent, 0.2);
        fillRoundRect(ctx, x + w * 0.28, y + h * 0.42, w * 0.44, h * 0.12, 4, theme.base);
        return;
      }
      if (theme.style === "skimarker") {
        fillRoundRect(ctx, x + w * 0.34, y + h * 0.14, w * 0.32, h * 0.44, 5, theme.base);
        fillRoundRect(ctx, x + w * 0.44, y + h * 0.22, w * 0.12, h * 0.78, 3, theme.trim);
        return;
      }
      line(ctx, x + w * 0.52, y + h, x + w * 0.52, y + h * 0.28, 4, theme.trim);
      fillRoundRect(ctx, x + w * 0.14, y + h * 0.16, w * 0.72, h * 0.24, 6, theme.base);
      fillRoundRect(ctx, x + w * 0.2, y + h * 0.2, w * 0.6, h * 0.16, 4, alphaColor(theme.accent, 0.5));
      if (theme.style === "holosign") strokeRoundRect(ctx, x + w * 0.1, y + h * 0.12, w * 0.8, h * 0.32, 8, alphaColor(theme.glow, 0.55), 1.5);
    }

    drawRampObstacle(x, y, w, h, theme) {
      polygon(this.ctx, [[x + 4, y + h], [x + w - 4, y + h], [x + w - 4, y + 6]], theme.base);
      line(this.ctx, x + 8, y + h * 0.34, x + w - 8, y + h * 0.34, 3, alphaColor(theme.accent, 0.5));
      line(this.ctx, x + 8, y + h * 0.58, x + w - 12, y + h * 0.58, 2.6, alphaColor(theme.trim, 0.45));
      strokeRoundRect(this.ctx, x + 2, y + 2, w - 4, h - 4, 8, alphaColor(theme.trim, 0.22), 1.2);
    }

    drawBenchObstacle(x, y, w, h, theme) {
      const ctx = this.ctx;
      if (theme.style === "cart") {
        fillRoundRect(ctx, x + w * 0.14, y + h * 0.34, w * 0.68, h * 0.24, 6, theme.base);
        fillRoundRect(ctx, x + w * 0.26, y + h * 0.18, w * 0.42, h * 0.12, 5, theme.accent);
        circle(ctx, x + w * 0.28, y + h * 0.82, w * 0.08, theme.trim);
        circle(ctx, x + w * 0.72, y + h * 0.82, w * 0.08, theme.trim);
        return;
      }
      if (theme.style === "console" || theme.style === "glitchrail") {
        fillRoundRect(ctx, x + w * 0.12, y + h * 0.24, w * 0.76, h * 0.22, 6, theme.base);
        line(ctx, x + w * 0.22, y + h * 0.36, x + w * 0.78, y + h * 0.36, 3, alphaColor(theme.accent, 0.75));
        line(ctx, x + w * 0.22, y + h * 0.5, x + w * 0.22, y + h * 0.78, 4, theme.trim);
        line(ctx, x + w * 0.78, y + h * 0.5, x + w * 0.78, y + h * 0.78, 4, theme.trim);
        if (theme.style === "glitchrail") strokeRoundRect(ctx, x + w * 0.08, y + h * 0.18, w * 0.84, h * 0.34, 10, alphaColor(theme.glow, 0.4), 1.2);
        return;
      }
      if (theme.style === "sled") {
        fillRoundRect(ctx, x + w * 0.18, y + h * 0.24, w * 0.42, h * 0.16, 6, theme.base);
        line(ctx, x + w * 0.14, y + h * 0.76, x + w * 0.8, y + h * 0.76, 2.5, theme.trim);
        line(ctx, x + w * 0.18, y + h * 0.68, x + w * 0.74, y + h * 0.68, 2.5, theme.trim);
        return;
      }
      if (theme.style === "lounger") {
        polygon(ctx, [[x + w * 0.18, y + h * 0.56], [x + w * 0.42, y + h * 0.18], [x + w * 0.52, y + h * 0.56]], theme.accent);
        fillRoundRect(ctx, x + w * 0.28, y + h * 0.5, w * 0.44, h * 0.12, 5, theme.base);
        line(ctx, x + w * 0.3, y + h * 0.58, x + w * 0.26, y + h * 0.78, 4, theme.trim);
        line(ctx, x + w * 0.7, y + h * 0.58, x + w * 0.74, y + h * 0.78, 4, theme.trim);
        return;
      }
      if (theme.style === "fallenlog") {
        fillRoundRect(ctx, x + w * 0.12, y + h * 0.34, w * 0.76, h * 0.3, 12, theme.base);
        circle(ctx, x + w * 0.18, y + h * 0.5, h * 0.12, theme.accent, 0.85);
        circle(ctx, x + w * 0.82, y + h * 0.5, h * 0.12, theme.accent, 0.85);
        return;
      }
      fillRoundRect(ctx, x + w * 0.12, y + h * 0.34, w * 0.76, h * 0.18, 6, theme.base);
      fillRoundRect(ctx, x + w * 0.18, y + h * 0.18, w * 0.64, h * 0.14, 5, theme.accent);
      line(ctx, x + w * 0.22, y + h * 0.44, x + w * 0.22, y + h * 0.78, 4, theme.trim);
      line(ctx, x + w * 0.72, y + h * 0.44, x + w * 0.72, y + h * 0.78, 4, theme.trim);
    }

    drawFlyingObstacle(x, y, w, h, theme, phase) {
      const ctx = this.ctx;
      if (theme.style === "drone" || theme.style === "hoverbot" || theme.style === "probe") {
        fillRoundRect(ctx, x + w * 0.26, y + h * 0.32, w * 0.48, h * 0.24, 10, theme.base);
        line(ctx, x + w * 0.18, y + h * 0.2, x + w * 0.82, y + h * 0.2, 2.2, theme.trim);
        line(ctx, x + w * 0.3, y + h * 0.16, x + w * 0.3, y + h * 0.28, 2, theme.trim);
        line(ctx, x + w * 0.7, y + h * 0.16, x + w * 0.7, y + h * 0.28, 2, theme.trim);
        circle(ctx, x + w * 0.5, y + h * 0.46, w * 0.05, theme.accent);
        return;
      }
      const wingLift = Math.sin(phase) * h * 0.08;
      fillRoundRect(ctx, x + w * 0.3, y + h * 0.36, w * 0.4, h * 0.22, 10, theme.base);
      polygon(ctx, [[x + w * 0.18, y + h * 0.42], [x + w * 0.3, y + h * 0.32 - wingLift], [x + w * 0.34, y + h * 0.52]], theme.accent);
      polygon(ctx, [[x + w * 0.82, y + h * 0.42], [x + w * 0.7, y + h * 0.32 - wingLift], [x + w * 0.66, y + h * 0.52]], theme.accent);
      circle(ctx, x + w * 0.5, y + h * 0.38, w * 0.04, theme.trim);
    }

    drawBarrelObstacle(x, y, w, h, theme) {
      const ctx = this.ctx;
      if (theme.style === "totem") {
        fillRoundRect(ctx, x + w * 0.24, y + h * 0.1, w * 0.52, h * 0.8, 8, theme.base);
        circle(ctx, x + w * 0.42, y + h * 0.34, 2.2, theme.trim);
        circle(ctx, x + w * 0.58, y + h * 0.34, 2.2, theme.trim);
        line(ctx, x + w * 0.36, y + h * 0.48, x + w * 0.64, y + h * 0.48, 2.2, theme.trim);
        return;
      }
      fillRoundRect(ctx, x + w * 0.2, y + 4, w * 0.6, h - 8, 10, theme.base);
      fillRoundRect(ctx, x + w * 0.26, y + 10, w * 0.48, h - 20, 8, alphaColor(theme.accent, 0.3));
      line(ctx, x + w * 0.2, y + h * 0.3, x + w * 0.8, y + h * 0.3, 3, theme.trim);
      line(ctx, x + w * 0.2, y + h * 0.64, x + w * 0.8, y + h * 0.64, 3, theme.trim);
    }

    drawArtifactObstacle(x, y, w, h, theme) {
      const ctx = this.ctx;
      if (theme.style === "cornshock" || theme.style === "cattails") {
        for (let i = 0; i < 4; i += 1) {
          line(ctx, x + w * (0.24 + i * 0.12), y + h, x + w * (0.26 + i * 0.12), y + h * 0.18, 3, theme.base);
          if (theme.style === "cattails") fillRoundRect(ctx, x + w * (0.22 + i * 0.12), y + h * (0.18 + (i % 2) * 0.06), w * 0.08, h * 0.14, 4, theme.accent);
        }
        return;
      }
      if (theme.style === "hydrant") {
        fillRoundRect(ctx, x + w * 0.34, y + h * 0.16, w * 0.32, h * 0.54, 8, theme.base);
        fillRoundRect(ctx, x + w * 0.26, y + h * 0.28, w * 0.48, h * 0.1, 6, theme.accent);
        fillRoundRect(ctx, x + w * 0.18, y + h * 0.38, w * 0.2, h * 0.1, 6, theme.base);
        fillRoundRect(ctx, x + w * 0.62, y + h * 0.38, w * 0.2, h * 0.1, 6, theme.base);
        return;
      }
      if (theme.style === "coral") {
        line(ctx, x + w * 0.36, y + h * 0.76, x + w * 0.28, y + h * 0.3, 5, theme.base);
        line(ctx, x + w * 0.46, y + h * 0.76, x + w * 0.5, y + h * 0.18, 5, theme.accent);
        line(ctx, x + w * 0.58, y + h * 0.76, x + w * 0.7, y + h * 0.36, 5, theme.base);
        return;
      }
      if (theme.style === "idol") {
        fillRoundRect(ctx, x + w * 0.28, y + h * 0.12, w * 0.44, h * 0.66, 10, theme.base);
        circle(ctx, x + w * 0.42, y + h * 0.3, 2.5, theme.trim);
        circle(ctx, x + w * 0.58, y + h * 0.3, 2.5, theme.trim);
        line(ctx, x + w * 0.42, y + h * 0.46, x + w * 0.58, y + h * 0.46, 2.5, theme.trim);
        return;
      }
      polygon(ctx, [[x + w * 0.16, y + h * 0.82], [x + w * 0.3, y + h * 0.28], [x + w * 0.42, y + h * 0.82]], theme.base);
      polygon(ctx, [[x + w * 0.38, y + h * 0.92], [x + w * 0.5, y + h * 0.08], [x + w * 0.64, y + h * 0.92]], theme.accent);
      polygon(ctx, [[x + w * 0.62, y + h * 0.82], [x + w * 0.76, y + h * 0.34], [x + w * 0.86, y + h * 0.82]], theme.base);
      line(ctx, x + w * 0.5, y + h * 0.2, x + w * 0.5, y + h * 0.66, 2, alphaColor(theme.trim, 0.42));
      circle(ctx, x + w * 0.5, y + h * 0.46, w * 0.3, theme.glow, 0.12);
    }

    drawMonsterObstacle(x, y, w, h, theme, phase) {
      const ctx = this.ctx;
      const strideX = Math.sin(phase) * w * 0.05;
      const legLift = Math.sin(phase) * h * 0.04;
      const bounce = Math.max(0, Math.sin(phase * 2.1)) * h * 0.04;
      const dark = mixColor(theme.base, "#000000", 0.36);
      const deeper = mixColor(theme.base, "#000000", 0.5);
      const bright = mixColor(theme.accent, "#ffffff", 0.22);
      const eyeOpen = Math.sin(phase * 0.45) > 0.94 ? 0.25 : 1;
      const bodyY = y + bounce;

      if (theme.style === "crab") {
        ellipse(ctx, x + w * 0.5, bodyY + h * 0.56, w * 0.3, h * 0.2, theme.base);
        ellipse(ctx, x + w * 0.5, bodyY + h * 0.48, w * 0.22, h * 0.12, bright, 0.75);
        line(ctx, x + w * 0.2, bodyY + h * 0.56, x + w * 0.04, bodyY + h * 0.56 + legLift, 2.6, dark);
        line(ctx, x + w * 0.8, bodyY + h * 0.56, x + w * 0.96, bodyY + h * 0.56 - legLift, 2.6, dark);
        line(ctx, x + w * 0.26, bodyY + h * 0.66, x + w * 0.14, bodyY + h * 0.86, 2.2, dark);
        line(ctx, x + w * 0.4, bodyY + h * 0.68, x + w * 0.32, bodyY + h * 0.88, 2.2, dark);
        line(ctx, x + w * 0.6, bodyY + h * 0.68, x + w * 0.68, bodyY + h * 0.88, 2.2, dark);
        line(ctx, x + w * 0.74, bodyY + h * 0.66, x + w * 0.86, bodyY + h * 0.86, 2.2, dark);
        line(ctx, x + w * 0.38, bodyY + h * 0.42, x + w * 0.34, bodyY + h * 0.22, 2.2, deeper);
        line(ctx, x + w * 0.62, bodyY + h * 0.42, x + w * 0.66, bodyY + h * 0.22, 2.2, deeper);
        circle(ctx, x + w * 0.34, bodyY + h * 0.2, w * 0.04, theme.trim);
        circle(ctx, x + w * 0.66, bodyY + h * 0.2, w * 0.04, theme.trim);
        return;
      }

      if (theme.style === "lizard") {
        polygon(ctx, [[x + w * 0.16, bodyY + h * 0.56], [x + w * 0.36, bodyY + h * 0.3], [x + w * 0.7, bodyY + h * 0.36], [x + w * 0.86, bodyY + h * 0.52], [x + w * 0.66, bodyY + h * 0.66], [x + w * 0.3, bodyY + h * 0.64]], theme.base);
        polygon(ctx, [[x + w * 0.12, bodyY + h * 0.58], [x + w * 0.02, bodyY + h * 0.5], [x + w * 0.12, bodyY + h * 0.44]], dark);
        polygon(ctx, [[x + w * 0.78, bodyY + h * 0.42], [x + w * 0.98, bodyY + h * 0.5], [x + w * 0.78, bodyY + h * 0.58]], theme.accent);
        line(ctx, x + w * 0.34, bodyY + h * 0.62, x + w * 0.24 - strideX, bodyY + h * 0.88, 2.4, dark);
        line(ctx, x + w * 0.56, bodyY + h * 0.62, x + w * 0.48 + strideX, bodyY + h * 0.88, 2.4, dark);
        line(ctx, x + w * 0.52, bodyY + h * 0.38, x + w * 0.44, bodyY + h * 0.18, 2.2, deeper);
        line(ctx, x + w * 0.64, bodyY + h * 0.38, x + w * 0.68, bodyY + h * 0.18, 2.2, deeper);
        circle(ctx, x + w * 0.74, bodyY + h * 0.44, w * 0.03, theme.trim, eyeOpen);
        return;
      }

      if (theme.style === "crawler") {
        fillRoundRect(ctx, x + w * 0.18, bodyY + h * 0.26, w * 0.64, h * 0.34, 10, theme.base);
        fillRoundRect(ctx, x + w * 0.28, bodyY + h * 0.18, w * 0.44, h * 0.14, 8, bright, 0.92);
        for (let i = 0; i < 3; i += 1) {
          const legX = x + w * (0.28 + i * 0.2);
          line(ctx, legX, bodyY + h * 0.6, legX - w * 0.08, bodyY + h * 0.9 - legLift, 2.4, deeper);
          line(ctx, legX + w * 0.16, bodyY + h * 0.6, legX + w * 0.24, bodyY + h * 0.9 + legLift, 2.4, deeper);
        }
        circle(ctx, x + w * 0.38, bodyY + h * 0.42, w * 0.05, theme.glow, 0.85);
        circle(ctx, x + w * 0.62, bodyY + h * 0.42, w * 0.05, theme.glow, 0.85);
        line(ctx, x + w * 0.26, bodyY + h * 0.2, x + w * 0.18, bodyY + h * 0.06, 1.8, theme.trim);
        line(ctx, x + w * 0.74, bodyY + h * 0.2, x + w * 0.82, bodyY + h * 0.06, 1.8, theme.trim);
        return;
      }

      if (theme.style === "emberbat" || theme.style === "frostbat" || theme.style === "bat") {
        const wingLift = Math.sin(phase * 1.8) * h * 0.16;
        polygon(ctx, [[x + w * 0.5, bodyY + h * 0.3], [x + w * 0.14, bodyY + h * 0.18 - wingLift], [x + w * 0.24, bodyY + h * 0.52]], dark);
        polygon(ctx, [[x + w * 0.5, bodyY + h * 0.3], [x + w * 0.86, bodyY + h * 0.18 - wingLift], [x + w * 0.76, bodyY + h * 0.52]], dark);
        ellipse(ctx, x + w * 0.5, bodyY + h * 0.38, w * 0.16, h * 0.18, theme.base);
        polygon(ctx, [[x + w * 0.42, bodyY + h * 0.26], [x + w * 0.37, bodyY + h * 0.1], [x + w * 0.48, bodyY + h * 0.22]], deeper);
        polygon(ctx, [[x + w * 0.58, bodyY + h * 0.26], [x + w * 0.63, bodyY + h * 0.1], [x + w * 0.52, bodyY + h * 0.22]], deeper);
        circle(ctx, x + w * 0.44, bodyY + h * 0.38, w * 0.028, theme.trim, eyeOpen);
        circle(ctx, x + w * 0.56, bodyY + h * 0.38, w * 0.028, theme.trim, eyeOpen);
        line(ctx, x + w * 0.5, bodyY + h * 0.5, x + w * 0.48, bodyY + h * 0.72, 2, deeper);
        return;
      }

      if (theme.style === "gullmonster") {
        const wingLift = Math.sin(phase * 1.6) * h * 0.12;
        polygon(ctx, [[x + w * 0.44, bodyY + h * 0.38], [x + w * 0.1, bodyY + h * 0.28 - wingLift], [x + w * 0.32, bodyY + h * 0.48]], theme.accent);
        polygon(ctx, [[x + w * 0.56, bodyY + h * 0.38], [x + w * 0.9, bodyY + h * 0.28 - wingLift], [x + w * 0.68, bodyY + h * 0.48]], theme.accent);
        ellipse(ctx, x + w * 0.48, bodyY + h * 0.44, w * 0.18, h * 0.14, theme.base);
        polygon(ctx, [[x + w * 0.64, bodyY + h * 0.42], [x + w * 0.84, bodyY + h * 0.46], [x + w * 0.66, bodyY + h * 0.52]], bright);
        circle(ctx, x + w * 0.42, bodyY + h * 0.4, w * 0.025, theme.trim, eyeOpen);
        line(ctx, x + w * 0.44, bodyY + h * 0.54, x + w * 0.4, bodyY + h * 0.74, 1.8, deeper);
        line(ctx, x + w * 0.52, bodyY + h * 0.54, x + w * 0.56, bodyY + h * 0.74, 1.8, deeper);
        return;
      }

      if (theme.style === "sentinel") {
        fillRoundRect(ctx, x + w * 0.28, bodyY + h * 0.2, w * 0.44, h * 0.42, 10, theme.base);
        fillRoundRect(ctx, x + w * 0.22, bodyY + h * 0.3, w * 0.12, h * 0.14, 6, dark);
        fillRoundRect(ctx, x + w * 0.66, bodyY + h * 0.3, w * 0.12, h * 0.14, 6, dark);
        line(ctx, x + w * 0.5, bodyY + h * 0.2, x + w * 0.44, bodyY + h * 0.02, 1.8, theme.trim);
        line(ctx, x + w * 0.5, bodyY + h * 0.2, x + w * 0.56, bodyY + h * 0.02, 1.8, theme.trim);
        circle(ctx, x + w * 0.5, bodyY + h * 0.4, w * 0.08, theme.glow, 0.95);
        strokeRoundRect(ctx, x + w * 0.18, bodyY + h * 0.24, w * 0.64, h * 0.34, 10, alphaColor(theme.glow, 0.28), 1.4);
        return;
      }

      if (theme.style === "imp") {
        ellipse(ctx, x + w * 0.5, bodyY + h * 0.44, w * 0.22, h * 0.24, theme.base);
        polygon(ctx, [[x + w * 0.34, bodyY + h * 0.26], [x + w * 0.28, bodyY + h * 0.06], [x + w * 0.42, bodyY + h * 0.2]], deeper);
        polygon(ctx, [[x + w * 0.66, bodyY + h * 0.26], [x + w * 0.72, bodyY + h * 0.06], [x + w * 0.58, bodyY + h * 0.2]], deeper);
        polygon(ctx, [[x + w * 0.32, bodyY + h * 0.5], [x + w * 0.16, bodyY + h * 0.34], [x + w * 0.3, bodyY + h * 0.68]], dark);
        polygon(ctx, [[x + w * 0.68, bodyY + h * 0.5], [x + w * 0.84, bodyY + h * 0.34], [x + w * 0.7, bodyY + h * 0.68]], dark);
        line(ctx, x + w * 0.42, bodyY + h * 0.66, x + w * 0.34 - strideX * 0.7, bodyY + h * 0.9, 3, deeper);
        line(ctx, x + w * 0.58, bodyY + h * 0.66, x + w * 0.66 + strideX * 0.7, bodyY + h * 0.9, 3, deeper);
        circle(ctx, x + w * 0.42, bodyY + h * 0.4, w * 0.035, theme.trim, eyeOpen);
        circle(ctx, x + w * 0.58, bodyY + h * 0.4, w * 0.035, theme.trim, eyeOpen);
        line(ctx, x + w * 0.44, bodyY + h * 0.54, x + w * 0.56, bodyY + h * 0.54, 2, theme.accent);
        return;
      }

      if (theme.style === "yeti") {
        ellipse(ctx, x + w * 0.5, bodyY + h * 0.48, w * 0.28, h * 0.3, theme.accent);
        ellipse(ctx, x + w * 0.5, bodyY + h * 0.42, w * 0.22, h * 0.22, theme.base);
        circle(ctx, x + w * 0.38, bodyY + h * 0.42, w * 0.035, theme.trim, eyeOpen);
        circle(ctx, x + w * 0.62, bodyY + h * 0.42, w * 0.035, theme.trim, eyeOpen);
        fillRoundRect(ctx, x + w * 0.3, bodyY + h * 0.54, w * 0.4, h * 0.12, 8, bright, 0.7);
        line(ctx, x + w * 0.4, bodyY + h * 0.74, x + w * 0.34 - strideX * 0.56, bodyY + h * 0.94, 3, deeper);
        line(ctx, x + w * 0.6, bodyY + h * 0.74, x + w * 0.66 + strideX * 0.56, bodyY + h * 0.94, 3, deeper);
        return;
      }

      ellipse(ctx, x + w * 0.5, bodyY + h * 0.56, w * 0.26, h * 0.18, theme.base);
      ellipse(ctx, x + w * 0.5, bodyY + h * 0.4, w * 0.18, h * 0.16, bright, 0.82);
      circle(ctx, x + w * 0.42, bodyY + h * 0.42, w * 0.03, theme.trim, eyeOpen);
      circle(ctx, x + w * 0.58, bodyY + h * 0.42, w * 0.03, theme.trim, eyeOpen);
      line(ctx, x + w * 0.36, bodyY + h * 0.68, x + w * 0.3 - strideX * 0.5, bodyY + h * 0.9, 2.6, dark);
      line(ctx, x + w * 0.64, bodyY + h * 0.68, x + w * 0.7 + strideX * 0.5, bodyY + h * 0.9, 2.6, dark);
    }

    drawBossObstacle(x, y, w, h, theme, obstacle, phase) {
      const ctx = this.ctx;
      const dark = mixColor(theme.base, "#000000", 0.34);
      const deeper = mixColor(theme.base, "#000000", 0.52);
      const bright = mixColor(theme.accent, "#ffffff", 0.24);
      const gapX = x + w * (obstacle.gapX ?? 0.34);
      const gapY = y + h * (obstacle.gapY ?? 0.24);
      const gapW = w * (obstacle.gapWidth ?? 0.34);
      const gapH = h * (obstacle.gapHeight ?? 0.4);
      const leftW = Math.max(0, gapX - x - w * 0.04);
      const rightX = gapX + gapW;
      const rightW = Math.max(0, x + w * 0.96 - rightX);
      const eyeBlink = Math.sin(phase * 0.38) > 0.96 ? 0.2 : 1;

      fillRoundRect(ctx, x + w * 0.04, y + h * 0.18, leftW, h * 0.62, 18, theme.base);
      fillRoundRect(ctx, rightX, y + h * 0.18, rightW, h * 0.62, 18, theme.base);
      fillRoundRect(ctx, gapX, y + h * 0.08, gapW, gapY - y - h * 0.08, 18, theme.base);
      fillRoundRect(ctx, gapX, gapY + gapH, gapW, y + h * 0.92 - (gapY + gapH), 18, theme.base);
      fillRoundRect(ctx, gapX + gapW * 0.02, gapY + gapH * 0.04, gapW * 0.96, gapH * 0.92, 18, alphaColor("#05070d", 0.94));
      strokeRoundRect(ctx, gapX + gapW * 0.02, gapY + gapH * 0.04, gapW * 0.96, gapH * 0.92, 18, alphaColor(theme.glow, obstacle.bossTier === "final" ? 0.82 : 0.64), 3);
      strokeRoundRect(ctx, gapX + gapW * 0.08, gapY + gapH * 0.12, gapW * 0.84, gapH * 0.76, 14, alphaColor("#ffffff", obstacle.bossTier === "final" ? 0.16 : 0.1), 1.4);
      fillRoundRect(ctx, gapX + gapW * 0.1, gapY + gapH * 0.14, gapW * 0.8, gapH * 0.72, 12, alphaColor(theme.glow, obstacle.bossTier === "final" ? 0.08 : 0.05));

      const cueColor = obstacle.bossTier === "final" ? theme.glow : theme.accent;
      for (let i = 0; i < 3; i += 1) {
        const cueY = gapY + gapH * (0.24 + i * 0.22);
        polygon(ctx, [
          [gapX - gapW * 0.18, cueY],
          [gapX - gapW * 0.04, cueY - gapH * 0.08],
          [gapX - gapW * 0.04, cueY + gapH * 0.08]
        ], alphaColor(cueColor, 0.74));
        polygon(ctx, [
          [gapX + gapW * 1.18, cueY],
          [gapX + gapW * 1.04, cueY - gapH * 0.08],
          [gapX + gapW * 1.04, cueY + gapH * 0.08]
        ], alphaColor(cueColor, 0.74));
      }

      line(ctx, gapX + gapW * 0.18, gapY + gapH * 0.22, gapX + gapW * 0.82, gapY + gapH * 0.22, 2, alphaColor("#ffffff", 0.12));
      line(ctx, gapX + gapW * 0.18, gapY + gapH * 0.78, gapX + gapW * 0.82, gapY + gapH * 0.78, 2, alphaColor("#ffffff", 0.12));

      if (theme.style === "bogbeast") {
        polygon(ctx, [[x + w * 0.16, y + h * 0.34], [x + w * 0.08, y + h * 0.16], [x + w * 0.24, y + h * 0.22]], dark);
        polygon(ctx, [[x + w * 0.84, y + h * 0.34], [x + w * 0.92, y + h * 0.16], [x + w * 0.76, y + h * 0.22]], dark);
        line(ctx, x + w * 0.18, y + h * 0.82, x + w * 0.1, y + h * 0.96, 4, deeper);
        line(ctx, x + w * 0.82, y + h * 0.82, x + w * 0.9, y + h * 0.96, 4, deeper);
      } else if (theme.style === "magma-ogre") {
        polygon(ctx, [[x + w * 0.18, y + h * 0.26], [x + w * 0.1, y + h * 0.02], [x + w * 0.28, y + h * 0.18]], deeper);
        polygon(ctx, [[x + w * 0.82, y + h * 0.26], [x + w * 0.9, y + h * 0.02], [x + w * 0.72, y + h * 0.18]], deeper);
        line(ctx, x + w * 0.18, y + h * 0.76, x + w * 0.12, y + h * 0.94, 5, dark);
        line(ctx, x + w * 0.82, y + h * 0.76, x + w * 0.88, y + h * 0.94, 5, dark);
        line(ctx, x + w * 0.5, y + h * 0.1, x + w * 0.5, y + h * 0.86, 2, alphaColor(theme.accent, 0.25));
      } else if (theme.style === "tide-crab-lord") {
        line(ctx, x + w * 0.08, y + h * 0.46, x + w * 0.02, y + h * 0.22, 5, dark);
        line(ctx, x + w * 0.92, y + h * 0.46, x + w * 0.98, y + h * 0.22, 5, dark);
        line(ctx, x + w * 0.16, y + h * 0.82, x + w * 0.08, y + h * 0.96, 4, deeper);
        line(ctx, x + w * 0.84, y + h * 0.82, x + w * 0.92, y + h * 0.96, 4, deeper);
      } else if (theme.style === "vine-jaguar") {
        polygon(ctx, [[x + w * 0.18, y + h * 0.22], [x + w * 0.1, y + h * 0.04], [x + w * 0.24, y + h * 0.14]], deeper);
        polygon(ctx, [[x + w * 0.82, y + h * 0.22], [x + w * 0.9, y + h * 0.04], [x + w * 0.76, y + h * 0.14]], deeper);
        line(ctx, x + w * 0.14, y + h * 0.18, x + w * 0.06, y + h * 0.02, 3, theme.accent);
        line(ctx, x + w * 0.86, y + h * 0.18, x + w * 0.94, y + h * 0.02, 3, theme.accent);
      } else if (theme.style === "cyber-colossus") {
        strokeRoundRect(ctx, x + w * 0.08, y + h * 0.14, w * 0.84, h * 0.72, 24, alphaColor(theme.glow, 0.28), 2);
        fillRoundRect(ctx, x + w * 0.1, y + h * 0.2, w * 0.12, h * 0.16, 8, dark);
        fillRoundRect(ctx, x + w * 0.78, y + h * 0.2, w * 0.12, h * 0.16, 8, dark);
        line(ctx, x + w * 0.3, y + h * 0.14, x + w * 0.22, y + h * 0.02, 3, theme.trim);
        line(ctx, x + w * 0.7, y + h * 0.14, x + w * 0.78, y + h * 0.02, 3, theme.trim);
        circle(ctx, x + w * 0.18, y + h * 0.8, w * 0.03, theme.glow, 0.72);
        circle(ctx, x + w * 0.82, y + h * 0.8, w * 0.03, theme.glow, 0.72);
      }

      circle(ctx, x + w * 0.34, y + h * 0.34, w * 0.03, theme.trim, eyeBlink);
      circle(ctx, x + w * 0.66, y + h * 0.34, w * 0.03, theme.trim, eyeBlink);
      line(ctx, x + w * 0.4, y + h * 0.46, x + w * 0.6, y + h * 0.46, 3, bright);
      fillRoundRect(ctx, x + w * 0.12, y + h * 0.84, w * 0.76, h * 0.06, 10, alphaColor("#ffffff", 0.04));
    }

    drawObstacle(obstacle, biome, animationClock) {
      const x = obstacle.x;
      const y = obstacle.y;
      const w = obstacle.width;
      const h = obstacle.height;
      const phase = animationClock * 6 + (obstacle.variant || 0) * 0.9;
      const theme = this.obstacleTheme(biome, obstacle);
      const shadowY = typeof obstacle.shadowY === "number" ? obstacle.shadowY : y + h + 6;
      const shadowWidth = obstacle.motion === "fly" ? w * 0.28 : w * 0.42;
      ellipse(this.ctx, x + w * 0.5, shadowY, shadowWidth, h * 0.12, alphaColor("#000000", obstacle.motion === "fly" ? 0.1 : 0.14), 1);

      switch (obstacle.type) {
        case "cone":
          this.drawHazardObstacle(x, y, w, h, theme);
          break;
        case "toyBox":
          this.drawStorageObstacle(x, y, w, h, theme);
          break;
        case "pile":
          this.drawPileObstacle(x, y, w, h, theme);
          break;
        case "sign":
          this.drawSignObstacle(x, y, w, h, theme);
          break;
        case "ramp":
          this.drawRampObstacle(x, y, w, h, theme);
          break;
        case "bench":
          this.drawBenchObstacle(x, y, w, h, theme);
          break;
        case "drone":
          this.drawFlyingObstacle(x, y, w, h, theme, phase);
          break;
        case "barrel":
          this.drawBarrelObstacle(x, y, w, h, theme);
          break;
        case "crystal":
          this.drawArtifactObstacle(x, y, w, h, theme);
          break;
        case "monster":
          this.drawMonsterObstacle(x, y, w, h, theme, phase);
          break;
        case "boss":
          this.drawBossObstacle(x, y, w, h, theme, obstacle, phase);
          break;
        default:
          fillRoundRect(this.ctx, x, y, w, h, 8, theme.base);
      }
    }

    drawFaceBase(ctx, appearance, headX, headY, headRadius, skin, skinShadow) {
      const facing = appearance.faceDirection || 1;
      const faceShape = appearance.faceShape || "oval";
      const faceWidth = headRadius * (appearance.faceWidth || 0.94);
      const jawWidth = headRadius * (appearance.jawWidth || 0.78);
      const cheekTint = appearance.cheekTint || mixColor(skin, "#f3ae97", 0.3);
      const cheekFullness = appearance.cheekFullness || 1;
      const earScale = appearance.earScale || 1;
      const earX = faceWidth * 0.68;
      const earRadiusX = headRadius * 0.1 * earScale;
      const earRadiusY = headRadius * 0.14 * earScale;
      const backEarX = headX - earX * facing;
      const faceCenterX = headX + headRadius * 0.04 * facing;

      ellipse(ctx, backEarX, headY + headRadius * 0.06, earRadiusX, earRadiusY, alphaColor(skin, 0.86), 1);

      switch (faceShape) {
        case "gentle-heart":
          ellipse(ctx, faceCenterX, headY - headRadius * 0.03, faceWidth * 0.95, headRadius, skin);
          fillRoundRect(ctx, faceCenterX - jawWidth * 0.5, headY + headRadius * 0.24, jawWidth, headRadius * 0.16, headRadius * 0.13, skin);
          break;
        case "long-soft":
          ellipse(ctx, faceCenterX, headY - headRadius * 0.06, faceWidth * 0.88, headRadius * 1.05, skin);
          fillRoundRect(ctx, faceCenterX - jawWidth * 0.66, headY + headRadius * 0.22, jawWidth * 1.28, headRadius * 0.22, headRadius * 0.14, skin);
          break;
        case "youth-oval":
          ellipse(ctx, faceCenterX, headY - headRadius * 0.02, faceWidth * 0.97, headRadius, skin);
          fillRoundRect(ctx, faceCenterX - jawWidth * 0.52, headY + headRadius * 0.24, jawWidth * 1.02, headRadius * 0.16, headRadius * 0.13, skin);
          break;
        case "square":
          fillRoundRect(ctx, faceCenterX - faceWidth, headY - headRadius * 0.94, faceWidth * 2, headRadius * 1.78, headRadius * 0.28, skin);
          fillRoundRect(ctx, faceCenterX - jawWidth * 0.74, headY + headRadius * 0.2, jawWidth * 1.42, headRadius * 0.22, headRadius * 0.14, skin);
          break;
        case "heart":
          ellipse(ctx, faceCenterX, headY - headRadius * 0.04, faceWidth * 0.97, headRadius, skin);
          polygon(ctx, [[faceCenterX - jawWidth * 0.78, headY + headRadius * 0.18], [faceCenterX - jawWidth * 0.1 * facing, headY + headRadius * 0.82], [faceCenterX + jawWidth * 0.6, headY + headRadius * 0.14]], skin);
          break;
        case "narrow-oval":
          ellipse(ctx, faceCenterX, headY - headRadius * 0.04, faceWidth * 0.89, headRadius * 1.03, skin);
          break;
        case "soft-round":
          ellipse(ctx, faceCenterX, headY - headRadius * 0.01, faceWidth * 0.97, headRadius * 0.98, skin);
          break;
        case "soft-round-child":
          ellipse(ctx, faceCenterX, headY + headRadius * 0.01, faceWidth * 0.98, headRadius * 0.97, skin);
          fillRoundRect(ctx, faceCenterX - jawWidth * 0.52, headY + headRadius * 0.24, jawWidth * 1.02, headRadius * 0.16, headRadius * 0.13, skin);
          break;
        case "compact-round":
          ellipse(ctx, faceCenterX, headY + headRadius * 0.02, faceWidth * 0.99, headRadius * 0.97, skin);
          fillRoundRect(ctx, faceCenterX - jawWidth * 0.56, headY + headRadius * 0.24, jawWidth * 1.06, headRadius * 0.15, headRadius * 0.13, skin);
          break;
        case "toddler-round":
          circle(ctx, faceCenterX, headY + headRadius * 0.04, headRadius * 1.02, skin);
          break;
        default:
          ellipse(ctx, faceCenterX, headY - headRadius * 0.04, faceWidth * 0.97, headRadius, skin);
      }

      ellipse(ctx, faceCenterX + faceWidth * 0.16 * facing, headY + headRadius * 0.17, faceWidth * (0.12 + cheekFullness * 0.03), headRadius * (0.12 + cheekFullness * 0.03), alphaColor(cheekTint, 0.08), 1);
      ellipse(ctx, faceCenterX + headRadius * 0.12 * facing, headY - headRadius * 0.38, faceWidth * 0.34, headRadius * 0.12, alphaColor("#ffffff", 0.05), 1);
    }

    drawFaceFeatures(ctx, appearance, headX, headY, headRadius, eyeColor, hairShadow, skinShadow) {
      const facing = appearance.faceDirection || 1;
      const eyeSpread = headRadius * (appearance.eyeSpread || 0.22);
      const eyeSize = clamp(headRadius * 0.092 * (appearance.eyeSize || 1), 0.82, 1.72);
      const eyeY = headY + headRadius * (appearance.eyeY ?? -0.06);
      const browTilt = headRadius * (appearance.browTilt || 0);
      const browWeight = appearance.browWeight || 1;
      const browLift = headRadius * (appearance.browLift || 0);
      const browSpan = appearance.browSpan || 1;
      const eyeRoundness = appearance.eyeRoundness || 1;
      const featureShift = headRadius * (appearance.featureShift || 0);
      const browWidth = eyeSize * (1.04 + browWeight * 0.1) * browSpan;
      const noseLength = headRadius * (appearance.noseLength || 0.22) * 0.66;
      const noseWidth = headRadius * (appearance.noseWidth || 0.07);
      const mouthWidth = headRadius * (appearance.mouthWidth || 0.32) * 0.78;
      const mouthCurve = headRadius * (appearance.mouthCurve || 0.08) * 0.72;
      const mouthY = headY + headRadius * (appearance.mouthY || 0.44);
      const smileLift = appearance.smileLift ?? 1;
      const faceCenterX = headX + featureShift * 0.28;
      const leftEyeX = faceCenterX - eyeSpread * 0.46;
      const rightEyeX = faceCenterX + eyeSpread * 0.46;
      const eyeWidth = eyeSize * (0.84 + eyeRoundness * 0.06);
      const eyeHeight = eyeSize * (0.42 + eyeRoundness * 0.04);
      const browY = eyeY - headRadius * 0.13 - browLift;
      const noseBridgeX = faceCenterX + facing * headRadius * 0.01;
      const noseTipX = faceCenterX + facing * (headRadius * 0.04 + noseLength * 0.18);
      const noseY = eyeY + noseLength * 0.86;
      const mouthStartX = faceCenterX - mouthWidth * 0.46;
      const mouthEndX = faceCenterX + mouthWidth * 0.46;
      const smilePeakX = faceCenterX + facing * mouthWidth * 0.04;

      line(ctx, leftEyeX - browWidth * 0.34, browY - browTilt * 0.2, leftEyeX + browWidth * 0.18, browY + browTilt, 0.84 + browWeight * 0.16, hairShadow, 0.66);
      line(ctx, rightEyeX - browWidth * 0.18, browY + browTilt, rightEyeX + browWidth * 0.34, browY - browTilt * 0.2, 0.84 + browWeight * 0.16, hairShadow, 0.66);

      const drawEye = (eyeX, highlightDirection) => {
        ellipse(ctx, eyeX, eyeY, eyeWidth, eyeHeight, "#ffffff", 0.92);
        ellipse(ctx, eyeX + eyeSize * 0.01 * highlightDirection, eyeY + eyeSize * 0.01, eyeWidth * 0.4, eyeHeight * 0.74, eyeColor, 0.96);
        circle(ctx, eyeX + eyeSize * 0.1 * highlightDirection, eyeY - eyeSize * 0.08, eyeSize * 0.08, "#ffffff", 0.82);
      };

      drawEye(leftEyeX, 1);
      drawEye(rightEyeX, -1);

      line(ctx, noseBridgeX, eyeY + headRadius * 0.04, noseTipX, noseY, 0.74, alphaColor(skinShadow, 0.32));
      line(ctx, noseTipX - noseWidth * 0.32, noseY + headRadius * 0.02, noseTipX, noseY + headRadius * 0.04, 0.68, alphaColor(skinShadow, 0.24));

      ctx.save();
      ctx.strokeStyle = alphaColor("#9a584d", 0.82);
      ctx.lineWidth = 1.05;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(mouthStartX, mouthY);
      ctx.quadraticCurveTo(smilePeakX, mouthY + mouthCurve * (0.24 + smileLift * 0.18), mouthEndX, mouthY + mouthCurve * 0.03);
      ctx.stroke();
      ctx.restore();
    }

    drawOutfitDetail(ctx, appearance, torsoWidth, torsoHeight, outfitPrimary, outfitSecondary, outfitTrim) {
      const style = appearance.shirtStyle || "";
      switch (style) {
        case "soccer-zip":
          line(ctx, 0, torsoHeight * 0.14, 0, torsoHeight * 0.86, 2.2, outfitTrim, 0.94);
          line(ctx, -torsoWidth * 0.38, torsoHeight * 0.22, torsoWidth * 0.38, torsoHeight * 0.22, 2.4, alphaColor("#ffffff", 0.42));
          circle(ctx, torsoWidth * 0.22, torsoHeight * 0.18, torsoWidth * 0.08, outfitTrim, 0.92);
          break;
        case "runner-panel":
          polygon(ctx, [[-torsoWidth * 0.48, torsoHeight * 0.04], [-torsoWidth * 0.1, torsoHeight * 0.04], [torsoWidth * 0.24, torsoHeight * 0.98], [-torsoWidth * 0.24, torsoHeight * 0.98]], alphaColor(outfitTrim, 0.86));
          line(ctx, torsoWidth * 0.22, torsoHeight * 0.16, torsoWidth * 0.36, torsoHeight * 0.78, 2.2, alphaColor(outfitSecondary, 0.7));
          break;
        case "soccer-band":
          fillRoundRect(ctx, -torsoWidth * 0.5, torsoHeight * 0.28, torsoWidth, torsoHeight * 0.16, torsoWidth * 0.2, outfitTrim, 0.95);
          line(ctx, torsoWidth * 0.18, torsoHeight * 0.18, torsoWidth * 0.18, torsoHeight * 0.74, 2.2, alphaColor("#ffffff", 0.35));
          break;
        case "hoodie-zip":
          line(ctx, 0, torsoHeight * 0.16, 0, torsoHeight * 0.9, 2, alphaColor(outfitTrim, 0.82));
          strokeRoundRect(ctx, -torsoWidth * 0.56, torsoHeight * 0.04, torsoWidth * 1.12, torsoHeight * 0.5, torsoWidth * 0.36, alphaColor(outfitTrim, 0.32), 1.8);
          line(ctx, -torsoWidth * 0.12, torsoHeight * 0.24, -torsoWidth * 0.08, torsoHeight * 0.44, 1.4, alphaColor(outfitTrim, 0.72));
          line(ctx, torsoWidth * 0.12, torsoHeight * 0.24, torsoWidth * 0.08, torsoHeight * 0.44, 1.4, alphaColor(outfitTrim, 0.72));
          line(ctx, -torsoWidth * 0.22, torsoHeight * 0.74, torsoWidth * 0.22, torsoHeight * 0.74, 2, alphaColor(outfitSecondary, 0.62));
          break;
        case "runner-stripe":
          polygon(ctx, [[-torsoWidth * 0.24, torsoHeight * 0.02], [0, torsoHeight * 0.02], [torsoWidth * 0.22, torsoHeight * 0.98], [-torsoWidth * 0.04, torsoHeight * 0.98]], alphaColor(outfitTrim, 0.92));
          line(ctx, torsoWidth * 0.28, torsoHeight * 0.16, torsoWidth * 0.38, torsoHeight * 0.72, 1.8, alphaColor("#ffffff", 0.34));
          break;
        case "chaos-bib":
          fillRoundRect(ctx, -torsoWidth * 0.34, torsoHeight * 0.1, torsoWidth * 0.68, torsoHeight * 0.36, torsoWidth * 0.18, outfitTrim, 0.92);
          line(ctx, -torsoWidth * 0.16, torsoHeight * 0.48, torsoWidth * 0.18, torsoHeight * 0.64, 2, alphaColor(outfitSecondary, 0.48));
          circle(ctx, torsoWidth * 0.18, torsoHeight * 0.24, torsoWidth * 0.08, alphaColor("#ffffff", 0.48), 1);
          break;
        default:
          fillRoundRect(ctx, -torsoWidth * 0.28, torsoHeight * 0.12, torsoWidth * 0.56, torsoHeight * 0.16, torsoWidth * 0.2, outfitTrim, 0.9);
      }

      fillRoundRect(ctx, -torsoWidth * 0.48, torsoHeight * 0.84, torsoWidth * 0.96, torsoHeight * 0.11, torsoWidth * 0.2, alphaColor(outfitSecondary, 0.88));
    }

    getImage(src) {
      if (!src) return null;
      if (this.imageCache.has(src)) return this.imageCache.get(src);
      const image = new Image();
      image.decoding = "async";
      image.src = src;
      this.imageCache.set(src, image);
      return image;
    }

    drawPortraitHead(ctx, src, radius, ringColor, shadowColor, options) {
      const image = this.getImage(src);
      if (!image || !image.complete || !image.naturalWidth) return false;

      const config = options || {};
      const zoom = config.zoom || 1.12;
      const offsetX = config.offsetX || 0;
      const offsetY = config.offsetY || 0;
      const cutout = Boolean(config.cutout);
      const drawSize = radius * 2 * zoom;
      const drawX = -drawSize * 0.5 + radius * offsetX;
      const drawY = (cutout ? -drawSize * 0.5 : -drawSize * 0.52) + radius * offsetY;

      if (cutout) {
        ctx.drawImage(image, drawX, drawY, drawSize, drawSize);
        return true;
      }

      const faceCenterY = radius * 0.06;
      const faceRadiusX = radius * 0.94;
      const faceRadiusY = radius * 1.02;

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, faceCenterY, faceRadiusX, faceRadiusY, 0, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(image, drawX, drawY, drawSize, drawSize);
      ctx.restore();

      return true;
    }

    drawCharacterHead(ctx, player, appearance, headRadius, skin, skinShadow, hair, hairShadow, outfitTrim, sliding) {
      const portraitSrc = player.character.gameplayPortrait;
      const portraitZoom = player.character.gameplayPortraitZoom || 1.12;
      const portraitOffsetX = player.character.gameplayPortraitOffsetX || 0;
      const portraitOffsetY = player.character.gameplayPortraitOffsetY || 0;
      const portraitCutout = Boolean(player.character.gameplayPortraitCutout);

      if (portraitSrc && this.drawPortraitHead(ctx, portraitSrc, headRadius, outfitTrim, hairShadow, {
        zoom: portraitZoom,
        offsetX: portraitOffsetX,
        offsetY: portraitOffsetY,
        cutout: portraitCutout
      })) {
        return;
      }

      this.drawHair(ctx, appearance, 0, 0, headRadius, hair, hairShadow, sliding, outfitTrim, "back");
      this.drawFaceBase(ctx, appearance, 0, 0, headRadius, skin, skinShadow);
      this.drawHair(ctx, appearance, 0, 0, headRadius, hair, hairShadow, sliding, outfitTrim, "front");
      this.drawFaceFeatures(ctx, appearance, 0, 0, headRadius, appearance.eye || "#2a1d17", hairShadow, skinShadow);

      if (appearance.accessory === "beard") {
        const beardScale = appearance.beardScale || 1;
        const beardWidth = appearance.beardWidth || 1;
        ellipse(ctx, headRadius * 0.03, headRadius * 0.35, headRadius * 0.23 * beardWidth, headRadius * 0.14 * beardScale, hair, 0.84);
        line(ctx, -headRadius * 0.04, headRadius * 0.2, headRadius * 0.18, headRadius * 0.21, 1.3, hair, 0.82);
      }
    }

    drawRunner(player, animationClock) {
      const ctx = this.ctx;
      const appearance = player.character.appearance || {};
      const grounded = typeof player.isGrounded === "function" ? player.isGrounded() : true;
      const age = appearance.age || "adult";
      const runCycle = animationClock * (grounded ? 11 : 7);
      const stride = grounded ? Math.sin(runCycle) : 0;
      const kick = grounded ? Math.cos(runCycle) : -0.4;
      const bob = grounded ? Math.sin(runCycle * 2) * player.height * 0.012 : Math.min(0, player.velocityY * 0.008);
      const w = player.width;
      const h = player.height;
      const x = player.x;
      const y = player.y + bob;
      const headScale = appearance.headScale || (age === "toddler" ? 0.24 : age === "kid" ? 0.22 : 0.18);
      const headRadius = h * headScale;
      const torsoBottomRatio = age === "toddler" ? 0.68 : 0.62;
      const torsoTop = y + headRadius * 1.12;
      const torsoBottom = y + h * torsoBottomRatio;
      const shoulderX = x + w * 0.5;
      const shoulderY = torsoTop + h * 0.02;
      const hipY = torsoBottom;
      const lean = clamp(player.isSliding ? 0.72 : stride * 0.06 + player.velocityY * 0.00025, -0.24, 0.32);
      const headTilt = appearance.headTilt || 0;
      const skin = appearance.skin || "#f0c9ad";
      const skinShadow = appearance.skinShadow || mixColor(skin, "#8e5a45", 0.35);
      const hair = appearance.hair || "#38251c";
      const hairShadow = appearance.hairShadow || mixColor(hair, "#000000", 0.4);
      const outfitPrimary = appearance.outfitPrimary || player.character.color || "#3f648f";
      const outfitSecondary = appearance.outfitSecondary || mixColor(outfitPrimary, "#101726", 0.36);
      const outfitTrim = appearance.outfitTrim || player.character.accent || "#ffffff";
      const shoe = appearance.shoe || "#122030";
      const armReach = appearance.armReach || 1;
      const legReach = appearance.legReach || 1;
      const baseTorsoWidth = age === "toddler" ? w * 0.28 : age === "kid" ? w * 0.24 : w * 0.24;
      const torsoWidth = baseTorsoWidth * (appearance.torsoWidth || 1);
      const shoulderHalf = torsoWidth * 0.56 * (appearance.shoulderWidth || 1);
      const waistHalf = Math.min(shoulderHalf * 0.82, torsoWidth * 0.34 * (appearance.waistWidth || 1));
      const hipHalf = torsoWidth * 0.42 * (appearance.hipWidth || 1);
      const torsoHeight = (hipY - shoulderY - h * 0.02) * (appearance.torsoLength || 1);
      const neckLength = appearance.neckLength || 1;
      const limbScale = appearance.limbThickness || 1;
      const shoeScale = appearance.shoeScale || 1;

      ellipse(ctx, x + w * 0.5, player.groundY + 6, w * (appearance.silhouette === "tiny" ? 0.38 : 0.46), Math.max(4, h * 0.08), alphaColor("#000000", 0.18), 1);

      if (player.shieldTimer > 0) {
        circle(ctx, x + w * 0.52, y + h * 0.38, Math.max(w, h) * 0.58, "#8ce0ff", 0.08);
        strokeRoundRect(ctx, x - w * 0.12, y - h * 0.06, w * 1.24, h * 1.02, Math.min(w, h) * 0.32, alphaColor("#b5efff", 0.55), 1.4);
      }

      if (player.isSliding) {
        const slideTorsoW = torsoWidth * 1.12;
        fillRoundRect(ctx, x + w * 0.18, y + h * 0.54, slideTorsoW, h * 0.18, 12, outfitPrimary);
        fillRoundRect(ctx, x + w * 0.2, y + h * 0.58, slideTorsoW * 0.88, h * 0.08, 10, alphaColor("#ffffff", 0.08));
        ctx.save();
        ctx.translate(x + w * 0.18 + slideTorsoW * 0.5, y + h * 0.54);
        this.drawOutfitDetail(ctx, appearance, slideTorsoW * 0.74, h * 0.18, outfitPrimary, outfitSecondary, outfitTrim);
        ctx.restore();
        jointedLimb(ctx, [[x + w * 0.22, y + h * 0.64], [x + w * 0.12, y + h * 0.67], [x + w * 0.04, y + h * 0.7]], outfitSecondary, alphaColor("#0b1120", 0.38), 5.8, 0.34);
        jointedLimb(ctx, [[x + w * 0.58, y + h * 0.62], [x + w * 0.7, y + h * 0.7], [x + w * 0.84, y + h * 0.76]], outfitSecondary, alphaColor("#0b1120", 0.38), 5.8, 0.34);
        jointedLimb(ctx, [[x + w * 0.54, y + h * 0.62], [x + w * 0.62, y + h * 0.56], [x + w * 0.74, y + h * 0.5]], skin, alphaColor(skinShadow, 0.72), 4.8, 0.28);
        circle(ctx, x + w * 0.74, y + h * 0.5, 1.6, skin, 1);
        ctx.save();
        ctx.translate(x + w * 0.74, y + h * 0.4);
        ctx.rotate(headTilt * 0.45);
        this.drawCharacterHead(ctx, player, appearance, headRadius * 0.88, skin, skinShadow, hair, hairShadow, outfitTrim, true);
        ctx.restore();
        return;
      }

      ctx.save();
      ctx.translate(shoulderX, shoulderY);
      ctx.rotate(lean);

      const armSwing = stride * h * 0.08;
      const rearShoulderX = -shoulderHalf * 0.72;
      const frontShoulderX = shoulderHalf * 0.72;
      const armAnchorY = torsoHeight * 0.08;
      const rearArm = {
        elbowX: -shoulderHalf * 0.58 - armSwing * 0.18,
        elbowY: h * 0.16 * armReach,
        handX: -shoulderHalf * 0.92 - armSwing * 0.3,
        handY: h * 0.31 * armReach
      };
      const frontArm = {
        elbowX: shoulderHalf * 0.56 - armSwing * 0.26,
        elbowY: h * 0.16 * armReach,
        handX: shoulderHalf * 0.98 - armSwing * 0.48,
        handY: h * 0.3 * armReach
      };
      const rearLeg = {
        kneeX: -hipHalf * 0.74 - stride * w * 0.08,
        kneeY: torsoHeight + h * 0.14 * legReach,
        footX: -hipHalf * 1.04 - stride * w * 0.16,
        footY: torsoHeight + h * 0.34 * legReach - kick * h * 0.04
      };
      const frontLeg = {
        kneeX: hipHalf * 0.74 + stride * w * 0.06,
        kneeY: torsoHeight + h * 0.12 * legReach,
        footX: hipHalf * 1.18 + stride * w * 0.18,
        footY: torsoHeight + h * 0.34 * legReach + kick * h * 0.03
      };
      const limb = clamp(w * 0.1 * (appearance.silhouette === "tiny" ? 0.86 : 1) * limbScale, 3, 6.4);
      const shoeWidth = limb * 2.1 * shoeScale;
      const shoeHeight = limb * 0.9 * (0.92 + shoeScale * 0.08);

      jointedLimb(ctx, [[rearShoulderX, armAnchorY], [rearArm.elbowX, rearArm.elbowY], [rearArm.handX, rearArm.handY]], skinShadow, alphaColor("#815845", 0.35), limb, 0.25);
      jointedLimb(ctx, [[-hipHalf * 0.32, torsoHeight], [rearLeg.kneeX, rearLeg.kneeY], [rearLeg.footX, rearLeg.footY]], outfitSecondary, alphaColor("#0b1120", 0.36), limb + 1.2, 0.28);
      fillRoundRect(ctx, rearLeg.footX - shoeWidth * 0.48, rearLeg.footY - shoeHeight * 0.48, shoeWidth, shoeHeight, limb * 0.34, shoe);

      polygon(ctx, [[-shoulderHalf, 0], [shoulderHalf, 0], [waistHalf, torsoHeight * 0.54], [hipHalf, torsoHeight], [-hipHalf, torsoHeight], [-waistHalf, torsoHeight * 0.54]], outfitPrimary);
      polygon(ctx, [[-shoulderHalf * 0.9, torsoHeight * 0.02], [shoulderHalf * 0.72, torsoHeight * 0.02], [waistHalf * 0.62, torsoHeight * 0.5], [hipHalf * 0.62, torsoHeight * 0.92], [-hipHalf * 0.76, torsoHeight * 0.92], [-waistHalf * 0.8, torsoHeight * 0.48]], alphaColor("#ffffff", 0.08));
      ellipse(ctx, 0, torsoHeight * 0.22, torsoWidth * 0.34, torsoHeight * 0.18, alphaColor("#ffffff", 0.08), 1);
      fillRoundRect(ctx, -hipHalf * 0.98, torsoHeight * 0.76, hipHalf * 1.96, torsoHeight * 0.18, hipHalf * 0.34, alphaColor(outfitSecondary, 0.38));
      ellipse(ctx, 0, torsoHeight * 0.92, torsoWidth * 0.38, torsoHeight * 0.08, alphaColor("#000000", 0.12), 1);
      circle(ctx, -shoulderHalf * 0.78, armAnchorY, limb * 0.24, alphaColor("#ffffff", 0.08), 1);
      circle(ctx, shoulderHalf * 0.78, armAnchorY, limb * 0.24, alphaColor("#ffffff", 0.08), 1);
      this.drawOutfitDetail(ctx, appearance, torsoWidth, torsoHeight, outfitPrimary, outfitSecondary, outfitTrim);

      jointedLimb(ctx, [[frontShoulderX, armAnchorY], [frontArm.elbowX, frontArm.elbowY], [frontArm.handX, frontArm.handY]], skin, alphaColor(skinShadow, 0.72), limb, 0.18);
      jointedLimb(ctx, [[hipHalf * 0.32, torsoHeight], [frontLeg.kneeX, frontLeg.kneeY], [frontLeg.footX, frontLeg.footY]], outfitSecondary, alphaColor("#0b1120", 0.36), limb + 1.2, 0.24);
      fillRoundRect(ctx, frontLeg.footX - shoeWidth * 0.48, frontLeg.footY - shoeHeight * 0.48, shoeWidth, shoeHeight, limb * 0.34, shoe);
      circle(ctx, rearArm.handX, rearArm.handY, limb * 0.28, skinShadow, 0.94);
      circle(ctx, frontArm.handX, frontArm.handY, limb * 0.28, skin, 1);

      const neckWidth = torsoWidth * 0.2;
      const neckHeight = headRadius * 0.36 * neckLength;
      fillRoundRect(ctx, -neckWidth * 0.5, -neckHeight * 0.12, neckWidth, neckHeight, neckWidth * 0.34, skinShadow);
      ctx.save();
      ctx.translate(0, -headRadius * 0.18);
      ctx.rotate(headTilt);
      this.drawCharacterHead(ctx, player, appearance, headRadius, skin, skinShadow, hair, hairShadow, outfitTrim, false);
      ctx.restore();

      ctx.restore();
    }

    drawHair(ctx, appearance, headX, headY, headRadius, hair, hairShadow, sliding, accessoryColor, layer) {
      const facing = appearance.faceDirection || 1;
      const hairStyle = appearance.hairStyle || "short";
      const accessory = appearance.accessory || "";
      const volume = clamp(appearance.hairVolume || 1, 0.78, 1.2);
      const ponyLength = appearance.ponyLength || 0.92;
      const hairlineHeight = appearance.hairlineHeight || 0;
      const backHairDepth = appearance.backHairDepth || 1;
      const tailScale = sliding ? 0.78 : 1;
      const backDir = -facing;
      const crownX = headX + backDir * headRadius * 0.12;
      const crownY = headY - headRadius * (0.64 + hairlineHeight * 0.62);
      const fullCrownY = headY - headRadius * (0.74 + hairlineHeight * 0.22);
      const napeX = headX + backDir * headRadius * 0.46;
      const napeY = headY + headRadius * (-0.08 + (backHairDepth - 1) * 0.14);
      const topCapWidth = headRadius * 0.34 * volume;
      const topCapHeight = headRadius * 0.14;
      const fullCrownWidth = headRadius * (0.68 + volume * 0.16);
      const fullCrownHeight = headRadius * 0.26;
      const backCapWidth = headRadius * 0.28 * volume;
      const backCapHeight = headRadius * (0.34 + backHairDepth * 0.1);
      const tuftX = headX + facing * headRadius * 0.08;
      const style = ({
        "headband-pony": "headband-flow",
        "runner-crop": "parted-sweep",
        "soccer-crop": "soft-crop-part",
        "hoodie-swoop": "compact-swoop",
        "long-ribbon-pony": "long-wave-back",
        "toddler-puffs": "tiny-puffs"
      }[hairStyle] || hairStyle);

      if (layer === "back") {
        ellipse(ctx, headX + backDir * headRadius * 0.08, fullCrownY, fullCrownWidth, fullCrownHeight, hair, 0.96);
        ellipse(ctx, headX + backDir * headRadius * 0.02, fullCrownY + headRadius * 0.03, fullCrownWidth * 0.66, fullCrownHeight * 0.56, hairShadow, 0.12);
        ellipse(ctx, crownX, crownY, topCapWidth * 0.86, topCapHeight * 0.78, hair, 0.95);
        ellipse(ctx, napeX, napeY, backCapWidth, backCapHeight, hair, 0.94);
        ellipse(ctx, napeX + backDir * headRadius * 0.04, napeY + headRadius * 0.1, backCapWidth * 0.72, backCapHeight * 0.58, hairShadow, 0.2);

        switch (style) {
          case "headband-flow":
            ellipse(ctx, headX + backDir * headRadius * 0.56, headY + headRadius * 0.08, headRadius * 0.26 * volume, headRadius * 0.7 * backHairDepth, hair, 0.92);
            polygon(ctx, [[headX + backDir * headRadius * 0.24, headY - headRadius * 0.14], [headX + backDir * headRadius * (0.9 + ponyLength * 0.22) * tailScale, headY + headRadius * 0.06], [headX + backDir * headRadius * (0.7 + ponyLength * 0.12), headY + headRadius * 0.98], [headX + backDir * headRadius * 0.34, headY + headRadius * 0.46]], hair);
            line(ctx, headX + backDir * headRadius * 0.24, headY - headRadius * 0.16, headX + backDir * headRadius * 0.58, headY + headRadius * 0.12, headRadius * 0.05, hairShadow, 0.44);
            break;
          case "parted-sweep":
            ellipse(ctx, headX + backDir * headRadius * 0.2, headY - headRadius * 0.34, headRadius * 0.18 * volume, headRadius * 0.16, hair, 0.92);
            ellipse(ctx, headX + backDir * headRadius * 0.3, headY - headRadius * 0.02, headRadius * 0.14 * volume, headRadius * 0.16, hair, 0.9);
            break;
          case "soft-crop-part":
            ellipse(ctx, headX + backDir * headRadius * 0.26, headY - headRadius * 0.14, headRadius * 0.15 * volume, headRadius * 0.16, hair, 0.92);
            break;
          case "compact-swoop":
            ellipse(ctx, headX + backDir * headRadius * 0.22, headY - headRadius * 0.1, headRadius * 0.15 * volume, headRadius * 0.15, hair, 0.9);
            break;
          case "long-wave-back":
            ellipse(ctx, headX + backDir * headRadius * 0.46, headY + headRadius * 0.08, headRadius * 0.36 * volume, headRadius * 0.72 * backHairDepth, hair, 0.92);
            polygon(ctx, [[headX + backDir * headRadius * 0.06, headY - headRadius * 0.18], [headX + backDir * headRadius * (1 + ponyLength * 0.2) * tailScale, headY + headRadius * 0.08], [headX + backDir * headRadius * (0.84 + ponyLength * 0.12), headY + headRadius * 1.04], [headX + backDir * headRadius * 0.16, headY + headRadius * 0.58]], hair);
            line(ctx, headX + backDir * headRadius * 0.08, headY - headRadius * 0.14, headX + backDir * headRadius * 0.48, headY + headRadius * 0.24, headRadius * 0.07, hairShadow, 0.42);
            break;
          case "tiny-puffs":
            circle(ctx, headX + backDir * headRadius * 0.22, headY - headRadius * 0.94, headRadius * 0.12 * volume, hair);
            circle(ctx, headX + backDir * headRadius * 0.01, headY - headRadius * 1.04, headRadius * 0.08 * volume, hair, 0.94);
            break;
          case "ponytail":
            polygon(ctx, [[headX + backDir * headRadius * 0.18, headY - headRadius * 0.18], [headX + backDir * headRadius * 0.9 * tailScale, headY + headRadius * 0.24], [headX + backDir * headRadius * 0.26, headY + headRadius * 0.38]], hair);
            break;
          case "long-pony":
            polygon(ctx, [[headX + backDir * headRadius * 0.18, headY - headRadius * 0.18], [headX + backDir * headRadius * 1.02 * tailScale, headY + headRadius * 0.56 * tailScale], [headX + backDir * headRadius * 0.2, headY + headRadius * 0.5]], hair);
            break;
          case "swoop":
            ellipse(ctx, headX + backDir * headRadius * 0.32, headY - headRadius * 0.28, headRadius * 0.16 * volume, headRadius * 0.16, hair, 0.88);
            break;
          case "puffs":
            circle(ctx, headX + backDir * headRadius * 0.42, headY - headRadius * 0.8, headRadius * 0.15 * volume, hair);
            circle(ctx, headX + backDir * headRadius * 0.14, headY - headRadius * 0.92, headRadius * 0.11 * volume, hair, 0.94);
            break;
          default:
            break;
        }

        if (accessory === "chaos" && !sliding) {
          line(ctx, headX + backDir * headRadius * 0.22, headY - headRadius * 0.94, headX + backDir * headRadius * 0.42, headY - headRadius * 1.08, 1.8, accessoryColor || "#ffd7c8", 0.8);
          line(ctx, headX + backDir * headRadius * 0.34, headY - headRadius * 0.84, headX + backDir * headRadius * 0.58, headY - headRadius * 1.02, 1.8, accessoryColor || "#ffd7c8", 0.8);
        }
        return;
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(headX - headRadius * 1.15, headY - headRadius * 1.08, headRadius * 2.3, headRadius * 0.72);
      ctx.clip();
      ellipse(ctx, headX + backDir * headRadius * 0.02, fullCrownY, fullCrownWidth * 1.02, fullCrownHeight * 1.08, hair, 0.97);
      ellipse(ctx, crownX, crownY - headRadius * 0.02, topCapWidth * 0.76, topCapHeight * 0.7, hair, 0.95);
      ellipse(ctx, headX + backDir * headRadius * 0.04, fullCrownY - headRadius * 0.02, fullCrownWidth * 0.62, fullCrownHeight * 0.28, hairShadow, 0.1);
      ctx.restore();

      switch (style) {
        case "headband-flow":
          line(ctx, headX + backDir * headRadius * 0.38, headY - headRadius * 0.48, headX + facing * headRadius * 0.16, headY - headRadius * 0.46, headRadius * 0.11, accessoryColor || "#ffffff", 0.98);
          line(ctx, headX + backDir * headRadius * 0.02, headY - headRadius * 0.62, headX + facing * headRadius * 0.02, headY - headRadius * 0.48, headRadius * 0.03, alphaColor(hairShadow, 0.24), 1);
          break;
        case "parted-sweep":
          line(ctx, headX + backDir * headRadius * 0.04, headY - headRadius * 0.64, headX + facing * headRadius * 0.12, headY - headRadius * 0.48, headRadius * 0.04, alphaColor(hairShadow, 0.32), 1);
          break;
        case "compact-swoop":
        case "hoodie-swoop":
        case "swoop":
          line(ctx, crownX - backDir * headRadius * 0.02, headY - headRadius * 0.64, headX + facing * headRadius * 0.02, headY - headRadius * 0.48, headRadius * 0.04, alphaColor(hairShadow, 0.24), 1);
          break;
        case "soft-crop-part":
          line(ctx, crownX - backDir * headRadius * 0.01, headY - headRadius * 0.62, headX + facing * headRadius * 0.06, headY - headRadius * 0.48, headRadius * 0.03, alphaColor(hairShadow, 0.18), 1);
          break;
        case "long-wave-back":
          line(ctx, crownX, headY - headRadius * 0.64, headX + facing * headRadius * 0.03, headY - headRadius * 0.5, headRadius * 0.03, alphaColor(hairShadow, 0.14), 1);
          break;
        case "tiny-puffs":
          ellipse(ctx, crownX - backDir * headRadius * 0.02, crownY - headRadius * 0.02, topCapWidth * 0.28, topCapHeight * 0.28, hairShadow, 0.1);
          break;
        case "long-ribbon-pony":
          line(ctx, headX + backDir * headRadius * 0.12, headY - headRadius * 0.2, headX + backDir * headRadius * 0.22, headY - headRadius * 0.08, headRadius * 0.08, accessoryColor || "#ffd166", 0.86);
          break;
        default:
          break;
      }
    }

    drawProgressBar(distance) {
      const ctx = this.ctx;
      const progress = this.level ? clamp(distance / this.level.length, 0, 1) : 0;
      fillRoundRect(ctx, 20, 16, this.logicalWidth - 40, 14, 8, alphaColor("#132033", 0.56));
      const palette = this.palette(this.level?.biome || "city");
      const fillWidth = (this.logicalWidth - 40) * progress;
      if (fillWidth > 0) {
        const visibleWidth = Math.max(14, fillWidth);
        const gradient = ctx.createLinearGradient(20, 16, 20 + visibleWidth, 30);
        gradient.addColorStop(0, palette.accent);
        gradient.addColorStop(1, mixColor(palette.accent, "#ffffff", 0.25));
        fillRoundRect(ctx, 20, 16, visibleWidth, 14, 8, gradient, 0.96);
      }
      strokeRoundRect(ctx, 20, 16, this.logicalWidth - 40, 14, 8, alphaColor("#ffffff", 0.18), 1);
    }

    render(state) {
      this.beginFrame();
      const biome = this.level?.biome || "city";
      const groundY = state.groundY;
      const distance = state.distance * 6.2;

      this.drawSky(distance, biome, groundY);
      this.drawBackdrop(distance, biome, groundY);
      this.drawTrack(distance, biome, groundY);
      this.drawAtmosphere(distance, biome, groundY);

      state.coins.forEach((coin) => this.drawCoin(coin, state.animationClock));
      state.powerups.forEach((powerup) => this.drawPowerup(powerup, state.animationClock));
      state.obstacles.forEach((obstacle) => this.drawObstacle(obstacle, biome, state.animationClock));

      this.drawRunner(state.player, state.animationClock);
      this.drawProgressBar(state.distance);
    }
  }

  FamilyDash.Renderer = Renderer;
})();
