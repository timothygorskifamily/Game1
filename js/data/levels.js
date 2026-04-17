(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});

  const themes = [
    { name: "Desert Dash", biome: "desert", ground: "#d9b36c", sky: "#f7d9a6" },
    { name: "Farm Run", biome: "farm", ground: "#88b65a", sky: "#bfe5ff" },
    { name: "Marsh Sprint", biome: "marsh", ground: "#4f7a4b", sky: "#9cc6a6" },
    { name: "City Rush", biome: "city", ground: "#5d6774", sky: "#8eb5e2" },
    { name: "Space Drift", biome: "space", ground: "#3c4163", sky: "#10162f" },
    { name: "Volcano Trail", biome: "volcano", ground: "#5b3f32", sky: "#704447" },
    { name: "Snow Glide", biome: "snow", ground: "#cfe3f5", sky: "#dff3ff" },
    { name: "Beach Bolt", biome: "beach", ground: "#e5cb87", sky: "#85d4ff" },
    { name: "Jungle Charge", biome: "jungle", ground: "#4d7a38", sky: "#86c97d" },
    { name: "Cyber Night", biome: "cyber", ground: "#344260", sky: "#18203c" }
  ];

  const BOSS_ENCOUNTERS = {
    3: {
      tier: "mini",
      style: "bogbeast",
      spawnAt: 0.56,
      width: 126,
      height: 94,
      damage: 1,
      moveSpeed: 10,
      color: "#5e7c50",
      gapX: 0.34,
      gapY: 0.22,
      gapWidth: 0.38,
      gapHeight: 0.42
    },
    6: {
      tier: "mini",
      style: "magma-ogre",
      spawnAt: 0.61,
      width: 150,
      height: 112,
      damage: 1,
      moveSpeed: 14,
      color: "#87453a",
      gapX: 0.33,
      gapY: 0.24,
      gapWidth: 0.36,
      gapHeight: 0.4
    },
    8: {
      tier: "mini",
      style: "tide-crab-lord",
      spawnAt: 0.66,
      width: 176,
      height: 128,
      damage: 1,
      moveSpeed: 18,
      color: "#4d677a",
      gapX: 0.32,
      gapY: 0.25,
      gapWidth: 0.34,
      gapHeight: 0.38
    },
    9: {
      tier: "mini",
      style: "vine-jaguar",
      spawnAt: 0.7,
      width: 198,
      height: 142,
      damage: 1,
      moveSpeed: 22,
      color: "#47603a",
      gapX: 0.29,
      gapY: 0.24,
      gapWidth: 0.38,
      gapHeight: 0.44
    },
    10: {
      tier: "final",
      style: "cyber-colossus",
      spawnAt: 0.79,
      width: 248,
      height: 184,
      damage: 2,
      moveSpeed: 8,
      color: "#5568a4",
      gapX: 0.38,
      gapY: 0.28,
      gapWidth: 0.24,
      gapHeight: 0.34
    }
  };

  FamilyDash.LEVELS = themes.map((t, index) => {
    const id = index + 1;
    const starterPool = ["cone", "toyBox", "pile", "sign"];
    const midPool = ["cone", "toyBox", "pile", "sign", "ramp", "bench", "drone"];
    const latePool = ["cone", "toyBox", "pile", "sign", "ramp", "bench", "drone", "barrel", "crystal", "monster"];
    return {
      id,
      name: t.name,
      biome: t.biome,
      description: `${t.name} features unique scenery and tougher patterns.`,
      length: 2100 + id * 420,
      baseSpeedBoost: (id - 1) * 10,
      difficultyGrowth: 0.09 + id * 0.015,
      backdrop: { sky: t.sky, hill: "#5d78a1", city: "#4f678f", ground: t.ground },
      obstaclePool: id < 3 ? starterPool : id < 6 ? midPool : latePool,
      bossEncounter: BOSS_ENCOUNTERS[id] || null,
      coinRate: Math.min(0.95, 0.58 + id * 0.035),
      powerupRate: Math.min(0.5, 0.16 + id * 0.02)
    };
  });

  const MONSTER_PROFILES = {
    volcano: [
      { style: "imp", motion: "hop", moveSpeed: 88, motionHeight: 40, motionRate: 5.8 },
      { style: "emberbat", motion: "fly", moveSpeed: 76, motionHeight: 18, motionRate: 3.8, flightOffset: 104 }
    ],
    snow: [
      { style: "yeti", motion: "hop", moveSpeed: 72, motionHeight: 34, motionRate: 4.4 },
      { style: "frostbat", motion: "fly", moveSpeed: 82, motionHeight: 16, motionRate: 3.6, flightOffset: 110 }
    ],
    beach: [
      { style: "crab", motion: "ground", moveSpeed: 96, motionHeight: 0, motionRate: 0 },
      { style: "gullmonster", motion: "fly", moveSpeed: 86, motionHeight: 14, motionRate: 3.2, flightOffset: 116 }
    ],
    jungle: [
      { style: "lizard", motion: "hop", moveSpeed: 90, motionHeight: 30, motionRate: 5.2 },
      { style: "bat", motion: "fly", moveSpeed: 92, motionHeight: 20, motionRate: 4.1, flightOffset: 108 }
    ],
    cyber: [
      { style: "crawler", motion: "ground", moveSpeed: 104, motionHeight: 0, motionRate: 0 },
      { style: "sentinel", motion: "fly", moveSpeed: 94, motionHeight: 16, motionRate: 3.4, flightOffset: 112 }
    ]
  };

  FamilyDash.getMonsterProfile = function (biome, variant) {
    const profiles = MONSTER_PROFILES[biome];
    if (!profiles || !profiles.length) return null;
    return profiles[Math.abs(variant || 0) % profiles.length];
  };

  FamilyDash.getBossEncounter = function (levelId) {
    return BOSS_ENCOUNTERS[levelId] || null;
  };

  function box(x, y, width, height) {
    return { x, y, width, height };
  }

  function rampCollisionBoxes(obstacle) {
    const slices = 6;
    const reverse = (obstacle.variant || 0) % 2 === 1;
    const xInset = 2 / obstacle.width;
    const yInset = 2 / obstacle.height;
    const usableWidth = (obstacle.width - 4) / obstacle.width;
    const usableHeight = (obstacle.height - 2) / obstacle.height;
    return Array.from({ length: slices }, (_, index) => {
      const start = index / slices;
      const end = (index + 1) / slices;
      const midpoint = (start + end) / 2;
      const ratio = reverse ? midpoint : 1 - midpoint;
      const height = usableHeight * ratio;
      return box(
        xInset + usableWidth * start,
        yInset + usableHeight - height,
        usableWidth / slices,
        height
      );
    }).filter((slice) => slice.height > 0.08);
  }

  FamilyDash.OBSTACLE_DEFS = {
    cone: {
      width: 36,
      height: 48,
      damage: 1,
      kickable: true,
      color: "#ff8f3f",
      collisionBoxes(obstacle) {
        switch (obstacle.style) {
          case "cactus":
            return [
              box(0.18, 0.34, 0.24, 0.26),
              box(0.42, 0.12, 0.18, 0.84),
              box(0.58, 0.22, 0.18, 0.42)
            ];
          case "pumpkin":
            return [
              box(0.46, 0.08, 0.12, 0.16),
              box(0.14, 0.32, 0.72, 0.54)
            ];
          case "stump":
            return [box(0.16, 0.1, 0.68, 0.9)];
          case "cone":
            return [
              box(0.34, 0.08, 0.2, 0.22),
              box(0.24, 0.3, 0.4, 0.28),
              box(0.14, 0.56, 0.66, 0.44)
            ];
          case "moonrock":
          case "lavarock":
            return [
              box(0.05, 0.52, 0.32, 0.26),
              box(0.18, 0.34, 0.54, 0.5),
              box(0.56, 0.18, 0.24, 0.4)
            ];
          case "snowman":
            return [
              box(0.34, 0.13, 0.32, 0.22),
              box(0.28, 0.48, 0.44, 0.38)
            ];
          case "sandcastle":
            return [
              box(0.12, 0.46, 0.76, 0.38),
              box(0.14, 0.26, 0.18, 0.2),
              box(0.68, 0.22, 0.18, 0.24)
            ];
          case "bollard":
            return [
              box(0.32, 0.12, 0.36, 0.72),
              box(0.25, 0.88, 0.5, 0.12)
            ];
          default:
            return [box(0.14, 0.12, 0.72, 0.76)];
        }
      }
    },
    toyBox: {
      width: 54,
      height: 46,
      damage: 1,
      kickable: true,
      color: "#f25f5c",
      collisionBoxes(obstacle) {
        if (obstacle.style === "cooler") {
          return [
            box(0.34, 0.02, 0.32, 0.09),
            box(0.04, 0.09, 0.92, 0.87)
          ];
        }
        if (obstacle.style === "toolbox") {
          return [
            box(0.28, 0.02, 0.44, 0.11),
            box(0.04, 0.09, 0.92, 0.87)
          ];
        }
        return [box(0.04, 0.09, 0.92, 0.87)];
      }
    },
    pile: {
      width: 52,
      height: 30,
      damage: 1,
      kickable: true,
      color: "#7d6848",
      collisionBoxes(obstacle) {
        switch (obstacle.style) {
          case "producepile":
            return [box(0.16, 0.23, 0.69, 0.64)];
          case "fernclump":
            return [
              box(0.16, 0.2, 0.22, 0.48),
              box(0.36, 0.08, 0.24, 0.58),
              box(0.6, 0.24, 0.2, 0.42),
              box(0.14, 0.6, 0.72, 0.14)
            ];
          case "reedstack":
            return [box(0.16, 0.13, 0.58, 0.74)];
          case "snowpile":
            return [box(0.16, 0.16, 0.75, 0.8)];
          default:
            return [box(0.14, 0.16, 0.73, 0.74)];
        }
      }
    },
    sign: {
      width: 34,
      height: 56,
      damage: 1,
      kickable: false,
      color: "#e1c46b",
      collisionBoxes(obstacle) {
        if (obstacle.style === "beacon") {
          return [
            box(0.36, 0.18, 0.28, 0.16),
            box(0.3, 0.42, 0.4, 0.15),
            box(0.46, 0.18, 0.14, 0.82)
          ];
        }
        if (obstacle.style === "skimarker") {
          return [
            box(0.32, 0.16, 0.32, 0.42),
            box(0.46, 0.26, 0.14, 0.74),
            box(0.3, 0.62, 0.4, 0.07)
          ];
        }
        if (obstacle.style === "streetsign") {
          return [
            box(0.14, 0.18, 0.72, 0.2),
            box(0.24, 0.42, 0.52, 0.1),
            box(0.46, 0.26, 0.14, 0.74)
          ];
        }
        return [
          box(0.14, 0.18, 0.72, 0.2),
          box(0.46, 0.26, 0.14, 0.74)
        ];
      }
    },
    ramp: {
      width: 60,
      height: 62,
      damage: 1,
      kickable: false,
      color: "#5872a8",
      collisionBoxes(obstacle) {
        return rampCollisionBoxes(obstacle);
      }
    },
    bench: {
      width: 68,
      height: 34,
      damage: 1,
      kickable: false,
      color: "#7a5b45",
      collisionBoxes(obstacle) {
        switch (obstacle.style) {
          case "cart":
            return [
              box(0.22, 0.22, 0.48, 0.32),
              box(0.2, 0.68, 0.16, 0.2),
              box(0.64, 0.68, 0.16, 0.2)
            ];
          case "console":
          case "glitchrail":
            return [
              box(0.14, 0.18, 0.72, 0.28),
              box(0.2, 0.5, 0.07, 0.26),
              box(0.74, 0.5, 0.07, 0.26)
            ];
          case "sled":
            return [
              box(0.18, 0.16, 0.44, 0.18),
              box(0.16, 0.66, 0.62, 0.1),
              box(0.74, 0.68, 0.08, 0.09)
            ];
          case "lounger":
            return [
              box(0.2, 0.16, 0.32, 0.38),
              box(0.26, 0.46, 0.46, 0.18),
              box(0.22, 0.56, 0.07, 0.18),
              box(0.68, 0.56, 0.07, 0.18)
            ];
          case "fallenlog":
            return [box(0.12, 0.34, 0.76, 0.28)];
          default:
            return [
              box(0.18, 0.24, 0.64, 0.15),
              box(0.12, 0.38, 0.76, 0.21),
              box(0.22, 0.44, 0.07, 0.32),
              box(0.7, 0.44, 0.07, 0.32)
            ];
        }
      }
    },
    drone: {
      width: 54,
      height: 32,
      damage: 1,
      kickable: false,
      color: "#383f70",
      flying: true,
      collisionBoxes: [{ x: 0.18, y: 0.14, width: 0.64, height: 0.46 }]
    },
    barrel: {
      width: 40,
      height: 56,
      damage: 2,
      kickable: true,
      color: "#854d27",
      collisionBoxes(obstacle) {
        if (obstacle.style === "totem") return [box(0.28, 0.18, 0.28, 0.75)];
        return [box(0.2, 0.07, 0.6, 0.89)];
      }
    },
    crystal: {
      width: 46,
      height: 54,
      damage: 2,
      kickable: false,
      color: "#83a0d8",
      collisionBoxes(obstacle) {
        switch (obstacle.style) {
          case "cornshock":
            return [box(0.18, 0.14, 0.54, 0.72)];
          case "cattails":
            return [box(0.24, 0.18, 0.42, 0.72)];
          case "hydrant":
            return [box(0.18, 0.18, 0.64, 0.61)];
          case "coral":
            return [box(0.18, 0.1, 0.55, 0.62)];
          case "idol":
            return [box(0.24, 0.12, 0.52, 0.75)];
          default:
            return [
              box(0.14, 0.34, 0.18, 0.44),
              box(0.38, 0.08, 0.24, 0.8),
              box(0.66, 0.24, 0.16, 0.54)
            ];
        }
      }
    },
    monster: {
      width: 58,
      height: 48,
      damage: 1,
      kickable: false,
      color: "#6b4053",
      moveSpeed(level) {
        return 54 + level.id * 6;
      },
      collisionBoxes(obstacle) {
        switch (obstacle.style) {
          case "imp":
            return [
              box(0.22, 0.14, 0.54, 0.62),
              box(0.28, 0.74, 0.12, 0.18),
              box(0.58, 0.74, 0.12, 0.18)
            ];
          case "yeti":
            return [
              box(0.18, 0.12, 0.64, 0.66),
              box(0.22, 0.78, 0.18, 0.14),
              box(0.6, 0.78, 0.18, 0.14)
            ];
          case "crab":
            return [
              box(0.12, 0.42, 0.76, 0.28),
              box(0.24, 0.24, 0.52, 0.18)
            ];
          case "lizard":
            return [
              box(0.12, 0.38, 0.68, 0.24),
              box(0.54, 0.24, 0.2, 0.18)
            ];
          case "crawler":
            return [
              box(0.18, 0.26, 0.64, 0.4),
              box(0.24, 0.68, 0.52, 0.12)
            ];
          case "emberbat":
          case "frostbat":
          case "bat":
            return [
              box(0.24, 0.26, 0.52, 0.24),
              box(0.34, 0.5, 0.32, 0.18)
            ];
          case "gullmonster":
            return [
              box(0.2, 0.22, 0.58, 0.28),
              box(0.42, 0.5, 0.2, 0.2)
            ];
          case "sentinel":
            return [box(0.22, 0.18, 0.56, 0.48)];
          default:
            return [box(0.16, 0.24, 0.68, 0.52)];
        }
      }
    },
    boss: {
      width: 160,
      height: 120,
      damage: 1,
      kickable: false,
      color: "#5f5f76",
      collisionBoxes(obstacle) {
        const gapX = obstacle.gapX ?? 0.34;
        const gapY = obstacle.gapY ?? 0.24;
        const gapWidth = obstacle.gapWidth ?? 0.34;
        const gapHeight = obstacle.gapHeight ?? 0.4;
        const gapRight = gapX + gapWidth;
        const gapBottom = gapY + gapHeight;
        const boxes = [
          box(0.04, 0.18, Math.max(0.12, gapX - 0.04), 0.64),
          box(gapRight, 0.18, Math.max(0.12, 0.96 - gapRight), 0.64),
          box(gapX, 0.06, gapWidth, Math.max(0.12, gapY - 0.06)),
          box(gapX, gapBottom, gapWidth, Math.max(0.12, 0.94 - gapBottom))
        ];
        if (obstacle.bossTier === "final") {
          boxes.push(
            box(0.16, 0.08, 0.14, 0.18),
            box(0.7, 0.08, 0.14, 0.18)
          );
        }
        return boxes;
      }
    }
  };

  FamilyDash.POWERUP_DEFS = {
    heal: { color: "#8cff9d", label: "Juice", effect: "heal" },
    shield: { color: "#8ce0ff", label: "Shield", effect: "shield" },
    rush: { color: "#ffe78b", label: "Rush", effect: "rush" },
    boost: { color: "#ffb86b", label: "Boost", effect: "boost" },
    coinBurst: { color: "#f8ff7a", label: "Coin+", effect: "coinBurst" },
    megaHeal: { color: "#ff9f9f", label: "HP++", effect: "megaHeal" },
    magnet: { color: "#9bffdc", label: "Mag", effect: "magnet" },
    phase: { color: "#d5b0ff", label: "Phase", effect: "phase" }
  };
})();
