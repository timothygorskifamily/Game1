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

  FamilyDash.LEVELS = themes.map((t, index) => {
    const id = index + 1;
    const starterPool = ["cone", "toyBox", "pile", "sign"];
    const midPool = ["cone", "toyBox", "pile", "sign", "ramp", "bench", "drone"];
    const latePool = ["cone", "toyBox", "pile", "sign", "ramp", "bench", "drone", "barrel", "crystal"];
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
      coinRate: Math.min(0.95, 0.58 + id * 0.035),
      powerupRate: Math.min(0.5, 0.16 + id * 0.02)
    };
  });

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
