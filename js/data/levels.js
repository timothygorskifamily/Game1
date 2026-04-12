(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});

  const themes = [
    { name: "Dune Dash", biome: "desert", sky: "#f8d48a", ground: "#d6a15f" },
    { name: "Barnstorm Run", biome: "farm", sky: "#9cd5ff", ground: "#7cb35e" },
    { name: "Mire Sprint", biome: "marsh", sky: "#9db7a6", ground: "#567a5f" },
    { name: "Urban Neon", biome: "city", sky: "#7ea9de", ground: "#4b637f" },
    { name: "Cyber Strip", biome: "cyber", sky: "#6b5bba", ground: "#2a2b5c" },
    { name: "Moon Drift", biome: "space", sky: "#161b38", ground: "#4f4d63" },
    { name: "Pine Rush", biome: "forest", sky: "#7bb2d6", ground: "#4f7f54" },
    { name: "Shoreline Bolt", biome: "beach", sky: "#8fd9ff", ground: "#e2cb7d" },
    { name: "Frozen Charge", biome: "snow", sky: "#d4ebff", ground: "#d4e4ef" },
    { name: "Molten Finale", biome: "volcano", sky: "#5a3a3a", ground: "#5a4632" }
  ];

  FamilyDash.LEVELS = themes.map((t, index) => {
    const id = index + 1;
    return {
      id,
      biome: t.biome,
      name: t.name,
      description: `${t.biome.toUpperCase()} zone ${id} with unique scenery and pacing.`,
      length: 2000 + id * 420,
      baseSpeedBoost: (id - 1) * 10,
      difficultyGrowth: 0.09 + id * 0.015,
      backdrop: { sky: t.sky, hill: "#5d78a1", city: "#4f678f", ground: t.ground },
      obstaclePool: id < 3 ? ["cone", "toyBox"] : id < 6 ? ["cone", "toyBox", "ramp", "drone"] : ["cone", "toyBox", "ramp", "drone", "barrel"],
      coinRate: Math.min(0.95, 0.58 + id * 0.035),
      powerupRate: Math.min(0.5, 0.16 + id * 0.02)
    };
  });

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
    rush: { color: "#ffe78b", label: "Rush", effect: "rush" },
    boost: { color: "#ffb86b", label: "Boost", effect: "boost" },
    coinBurst: { color: "#f8ff7a", label: "Coin+", effect: "coinBurst" }
  };
})();
