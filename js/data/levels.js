(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});

  FamilyDash.LEVELS = [
    {
      id: 1,
      name: "Sunny Suburbs Sprint",
      description: "Intro lane with cones and toy boxes.",
      length: 2200,
      baseSpeedBoost: 0,
      difficultyGrowth: 0.11,
      backdrop: { sky: "#9dd9ff", hill: "#73b8f2", city: "#b2d8f5", ground: "#8ed081" },
      obstaclePool: ["cone", "toyBox"],
      coinRate: 0.6,
      powerupRate: 0.18
    },
    {
      id: 2,
      name: "Neon Park Dash",
      description: "Faster pace, skate ramps, and rogue drones.",
      length: 2800,
      baseSpeedBoost: 22,
      difficultyGrowth: 0.18,
      backdrop: { sky: "#8cc4ff", hill: "#8b9fff", city: "#9a9dd8", ground: "#5fa36d" },
      obstaclePool: ["cone", "ramp", "drone"],
      coinRate: 0.7,
      powerupRate: 0.22
    },
    {
      id: 3,
      name: "Storm Carnival Rush",
      description: "Chaotic mixed obstacles and fast tempo finale.",
      length: 3400,
      baseSpeedBoost: 45,
      difficultyGrowth: 0.24,
      backdrop: { sky: "#6a86b8", hill: "#566f9f", city: "#7280a9", ground: "#4f7b5d" },
      obstaclePool: ["toyBox", "ramp", "drone", "barrel"],
      coinRate: 0.82,
      powerupRate: 0.28
    }
  ];

  FamilyDash.OBSTACLE_DEFS = {
    cone: { width: 36, height: 48, damage: 1, kickable: true, color: "#ff8f3f" },
    toyBox: { width: 54, height: 46, damage: 1, kickable: true, color: "#f25f5c" },
    ramp: { width: 60, height: 62, damage: 1, kickable: false, color: "#5872a8" },
    drone: { width: 54, height: 32, damage: 1, kickable: false, color: "#383f70", flying: true },
    barrel: { width: 40, height: 56, damage: 2, kickable: true, color: "#854d27" }
  };

  FamilyDash.POWERUP_DEFS = {
    heal: { color: "#8cff9d", label: "Juice", effect: "heal" },
    shield: { color: "#8ce0ff", label: "Shield", effect: "shield" },
    rush: { color: "#ffe78b", label: "Rush", effect: "rush" }
  };
})();
