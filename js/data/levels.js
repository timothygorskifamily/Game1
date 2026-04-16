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

  FamilyDash.OBSTACLE_DEFS = {
    cone: { width: 36, height: 48, damage: 1, kickable: true, color: "#ff8f3f" },
    toyBox: { width: 54, height: 46, damage: 1, kickable: true, color: "#f25f5c" },
    pile: { width: 52, height: 30, damage: 1, kickable: true, color: "#7d6848" },
    sign: { width: 34, height: 56, damage: 1, kickable: false, color: "#e1c46b" },
    ramp: { width: 60, height: 62, damage: 1, kickable: false, color: "#5872a8" },
    bench: { width: 68, height: 34, damage: 1, kickable: false, color: "#7a5b45" },
    drone: { width: 54, height: 32, damage: 1, kickable: false, color: "#383f70", flying: true },
    barrel: { width: 40, height: 56, damage: 2, kickable: true, color: "#854d27" },
    crystal: { width: 46, height: 54, damage: 2, kickable: false, color: "#83a0d8" }
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
