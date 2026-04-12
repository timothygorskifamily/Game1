(function () {
  const FamilyDash = (window.FamilyDash = window.FamilyDash || {});

  FamilyDash.CHARACTERS = [
    {
      id: "drea",
      name: "Drea",
      role: "Mom • Athlete • Soccer",
      flavor: "Confident captain energy. Kicks trouble out of the lane.",
      strengths: "Strong kick, balanced speed, good stamina",
      weakness: "Average jump height",
      color: "#f94144",
      accent: "#ffe066",
      stats: { speed: 3, jump: 3, stamina: 4, strength: 5, control: 4 },
      gameplay: { baseSpeed: 270, jumpPower: 590, maxHealth: 4, kickPower: 2, coinMagnet: 1, hitboxScale: 1, accelerationBonus: 1 }
    },
    {
      id: "tim",
      name: "Tim",
      role: "Dad • Elite Runner",
      flavor: "Long stride, clean form, all gas no snacks.",
      strengths: "Fastest base speed, high endurance",
      weakness: "Lower strength vs obstacles",
      color: "#277da1",
      accent: "#b2f7ef",
      stats: { speed: 5, jump: 3, stamina: 5, strength: 2, control: 4 },
      gameplay: { baseSpeed: 310, jumpPower: 610, maxHealth: 4, kickPower: 1, coinMagnet: 1, hitboxScale: 1, accelerationBonus: 1.05 }
    },
    {
      id: "ariel",
      name: "Ariel",
      role: "Daughter • Agile Runner",
      flavor: "Lightning reflexes and fearless leaps.",
      strengths: "High acceleration, excellent jump timing",
      weakness: "Lower durability",
      color: "#f3722c",
      accent: "#f9f871",
      stats: { speed: 4, jump: 5, stamina: 2, strength: 2, control: 5 },
      gameplay: { baseSpeed: 285, jumpPower: 680, maxHealth: 3, kickPower: 1, coinMagnet: 1, hitboxScale: 0.95, accelerationBonus: 1.25 }
    },
    {
      id: "liam",
      name: "Liam",
      role: "Son • Programmer",
      flavor: "Runs on logic, hoodies, and mystery gadgets.",
      strengths: "Tech utility bonuses, better item collection",
      weakness: "Slower base speed",
      color: "#577590",
      accent: "#80ffdb",
      stats: { speed: 2, jump: 3, stamina: 4, strength: 3, control: 4 },
      gameplay: { baseSpeed: 245, jumpPower: 600, maxHealth: 4, kickPower: 1, coinMagnet: 1.7, hitboxScale: 1, accelerationBonus: 1, techShieldChance: 0.16 }
    },
    {
      id: "david",
      name: "David",
      role: "Son • Soccer Striker",
      flavor: "Power clear specialist. Punts chaos into orbit.",
      strengths: "Strong kick, obstacle clearing, good balance",
      weakness: "Medium speed",
      color: "#43aa8b",
      accent: "#ffd166",
      stats: { speed: 3, jump: 3, stamina: 4, strength: 5, control: 3 },
      gameplay: { baseSpeed: 265, jumpPower: 620, maxHealth: 4, kickPower: 2, coinMagnet: 1, hitboxScale: 1, accelerationBonus: 1 }
    },
    {
      id: "addy",
      name: "Addy",
      role: "Tiny Menace • Age 3",
      flavor: "Chaotic tiny goblin with wild wiggle physics.",
      strengths: "Tiny hitbox, random bonus effects",
      weakness: "Harder control, lower stamina",
      color: "#9b5de5",
      accent: "#ff99c8",
      stats: { speed: 3, jump: 4, stamina: 2, strength: 2, control: 1 },
      gameplay: { baseSpeed: 260, jumpPower: 640, maxHealth: 3, kickPower: 1, coinMagnet: 1.15, hitboxScale: 0.75, accelerationBonus: 0.95, chaosMode: true }
    }
  ];

  FamilyDash.getCharacterById = function (id) {
    return FamilyDash.CHARACTERS.find((character) => character.id === id);
  };
})();
