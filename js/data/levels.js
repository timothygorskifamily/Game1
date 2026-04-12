(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});

  const themes = [
    ["Sunrise Suburbs", "#9dd9ff", "#8ed081"],
    ["Neon Block", "#8cc4ff", "#5fa36d"],
    ["Old Town", "#7bb2e6", "#688f68"],
    ["Bridge District", "#6ea7df", "#5d8866"],
    ["Metro Night", "#5f93d1", "#557f63"],
    ["Rainline Avenue", "#4f82c1", "#4f745c"],
    ["Skyline Core", "#4578b8", "#4a6c58"],
    ["Terminal Run", "#3d6cab", "#456555"],
    ["Hyper Loop", "#355f9d", "#415e52"],
    ["Final Flux", "#2d538e", "#3c574e"]
  ];

  FamilyDash.LEVELS = themes.map((t, index) => {
    const id = index + 1;
    return {
      id,
      name: t[0],
      description: `City stage ${id} with faster flow and tougher traffic patterns.`,
      length: 2000 + id * 420,
      baseSpeedBoost: (id - 1) * 10,
      difficultyGrowth: 0.09 + id * 0.015,
      backdrop: { sky: t[1], hill: "#5d78a1", city: "#4f678f", ground: t[2] },
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
