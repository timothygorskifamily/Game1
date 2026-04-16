(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});

  FamilyDash.CHARACTERS = [
    {
      id: "drea",
      name: "Drea",
      role: "Mom - Captain Runner",
      flavor: "Denim-jacket confidence with the most forgiving all-around lane game.",
      strengths: "Balanced speed, solid health, strong obstacle clears",
      weakness: "No extreme specialty",
      difficulty: { rank: 1, tone: "starter", label: "Starter", note: "Best all-around pick for learning the game" },
      color: "#6b7f96",
      accent: "#d6a18a",
      portrait: "assets/characters/drea.svg",
      stats: { speed: 3, jump: 3, stamina: 4, strength: 5, control: 4 },
      gameplay: { baseSpeed: 270, jumpPower: 590, maxHealth: 4, kickPower: 2, coinMagnet: 1, hitboxScale: 1, accelerationBonus: 1, sizeScale: 1 }
    },
    {
      id: "tim",
      name: "Tim",
      role: "Dad - Elite Runner",
      flavor: "Long stride, fast pace, and enough durability to stay beginner friendly.",
      strengths: "Fastest top speed, high stamina, steady control",
      weakness: "Lower obstacle strength",
      difficulty: { rank: 2, tone: "easy", label: "Easy", note: "Fast and smooth once you trust the pace" },
      color: "#c08a52",
      accent: "#f2eee9",
      portrait: "assets/characters/tim.svg",
      stats: { speed: 5, jump: 3, stamina: 5, strength: 2, control: 4 },
      gameplay: { baseSpeed: 310, jumpPower: 610, maxHealth: 4, kickPower: 1, coinMagnet: 1, hitboxScale: 1, accelerationBonus: 1.05, sizeScale: 1 }
    },
    {
      id: "grandpa",
      name: "Grandpa",
      role: "Grandpa - Steady Cruiser",
      flavor: "Blue-sweater calm with a patient stride that can soak up mistakes.",
      strengths: "Highest health, reliable control, sturdy obstacle handling",
      weakness: "Lower jump and slower acceleration",
      difficulty: { rank: 3, tone: "easy", label: "Easy", note: "A durable choice if you want a forgiving run" },
      color: "#7f97b4",
      accent: "#efe2cb",
      portrait: "assets/characters/grandpa.svg",
      stats: { speed: 2, jump: 2, stamina: 5, strength: 4, control: 5 },
      gameplay: { baseSpeed: 250, jumpPower: 570, maxHealth: 5, kickPower: 2, coinMagnet: 1.05, hitboxScale: 1, accelerationBonus: 0.98, sizeScale: 1 }
    },
    {
      id: "david",
      name: "David",
      role: "Son - Soccer Striker",
      flavor: "Tan-vest power runner who clears trouble with confident contact.",
      strengths: "Strong obstacle clears, balanced health, good lane stability",
      weakness: "Average speed ceiling",
      difficulty: { rank: 4, tone: "medium", label: "Medium", note: "Strong and safe, but not the quickest" },
      color: "#c99b60",
      accent: "#d7d3cf",
      portrait: "assets/characters/david.svg",
      stats: { speed: 3, jump: 3, stamina: 4, strength: 5, control: 3 },
      gameplay: { baseSpeed: 265, jumpPower: 620, maxHealth: 4, kickPower: 2, coinMagnet: 1, hitboxScale: 1, accelerationBonus: 1, sizeScale: 0.5 }
    },
    {
      id: "liam",
      name: "Liam",
      role: "Son - Gadget Collector",
      flavor: "Navy-vest logic runner with bonus coin pull and sneaky defensive tech.",
      strengths: "Strong item collection, shield chance, useful utility",
      weakness: "Slower base speed",
      difficulty: { rank: 5, tone: "medium", label: "Medium", note: "Rewards patient runs and smart pathing" },
      color: "#36485a",
      accent: "#c58b55",
      portrait: "assets/characters/liam.svg",
      stats: { speed: 2, jump: 3, stamina: 4, strength: 3, control: 4 },
      gameplay: { baseSpeed: 245, jumpPower: 600, maxHealth: 4, kickPower: 1, coinMagnet: 1.7, hitboxScale: 1, accelerationBonus: 1, techShieldChance: 0.16, sizeScale: 0.5 }
    },
    {
      id: "grandma",
      name: "Grandma",
      role: "Grandma - Graceful Strider",
      flavor: "Coral-jacket composure with precise footwork and a smooth jump arc.",
      strengths: "High control, clean jumps, gentle coin pull",
      weakness: "Lower top speed than the stronger runners",
      difficulty: { rank: 6, tone: "medium", label: "Medium", note: "Precise and rewarding, but not a speedster" },
      color: "#f07f5e",
      accent: "#f4d6c2",
      portrait: "assets/characters/grandma.svg",
      stats: { speed: 2, jump: 4, stamina: 4, strength: 2, control: 5 },
      gameplay: { baseSpeed: 252, jumpPower: 630, maxHealth: 4, kickPower: 1, coinMagnet: 1.15, hitboxScale: 0.95, accelerationBonus: 1, sizeScale: 1 }
    },
    {
      id: "ariel",
      name: "Ariel",
      role: "Daughter - Agile Runner",
      flavor: "Long-hair lightning with big jumps and less room for mistakes.",
      strengths: "Best jump, quick acceleration, excellent responsiveness",
      weakness: "Lower durability",
      difficulty: { rank: 7, tone: "hard", label: "Hard", note: "Powerful, but she punishes sloppy timing" },
      color: "#7a92ad",
      accent: "#bd9438",
      portrait: "assets/characters/ariel.svg",
      stats: { speed: 4, jump: 5, stamina: 2, strength: 2, control: 5 },
      gameplay: { baseSpeed: 285, jumpPower: 680, maxHealth: 3, kickPower: 1, coinMagnet: 1, hitboxScale: 0.95, accelerationBonus: 1.25, sizeScale: 0.5 }
    },
    {
      id: "addy",
      name: "Addy",
      role: "Tiny Menace - Chaos Mode",
      flavor: "Small, adorable, and absolute mayhem once the lane starts fighting back.",
      strengths: "Tiny hitbox, random bonus effects, slippery profile",
      weakness: "Low control, lower stamina, chaos wobble",
      difficulty: { rank: 8, tone: "expert", label: "Expert", note: "Highest chaos and hardest to use well" },
      color: "#ef7d64",
      accent: "#f6d3bf",
      portrait: "assets/characters/addy.svg",
      stats: { speed: 3, jump: 4, stamina: 2, strength: 2, control: 1 },
      gameplay: { baseSpeed: 260, jumpPower: 640, maxHealth: 3, kickPower: 1, coinMagnet: 1.15, hitboxScale: 0.75, accelerationBonus: 0.95, chaosMode: true, sizeScale: 0.33 }
    }
  ];

  FamilyDash.getCharactersSortedByDifficulty = function () {
    return [...FamilyDash.CHARACTERS].sort((a, b) => {
      const rankDelta = (a.difficulty?.rank || 999) - (b.difficulty?.rank || 999);
      if (rankDelta !== 0) return rankDelta;
      return a.name.localeCompare(b.name);
    });
  };

  FamilyDash.getCharacterById = function (id) {
    return FamilyDash.CHARACTERS.find((character) => character.id === id);
  };
})();
