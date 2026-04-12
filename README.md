# Family Dash: Tiny Menace Run

A complete browser endless-runner game built with **100% HTML, CSS, and JavaScript** (no TypeScript, no game engine).

## Features

- Start screen, character select, level select, game HUD, pause flow, game over, and win screen
- 6 unique playable characters with custom stats and gameplay feel:
  - Drea, Tim, Ariel, Liam, David, Addy
- 3 polished levels with increasing difficulty and distinct visual themes
- Auto-running side-scroller gameplay with jump, slide, and kick controls
- Character-specific mechanics:
  - Strong kickers (Drea/David)
  - Fast specialist (Tim)
  - Agile jumper (Ariel)
  - Coin magnet + tech bonus (Liam)
  - Tiny chaotic movement + random bonus chance (Addy)
- Original code-generated visuals for characters, obstacles, power-ups, backgrounds, and UI
- Collectibles (coins), power-ups (heal/shield/rush), lives/health, score and distance
- Optional mobile/touch controls
- Simple generated audio SFX via Web Audio API
- High score persistence via `localStorage`

## Run locally

### Option 1: Open directly
Open `index.html` in a modern browser.

### Option 2: Simple local server (recommended)
From the project root:

```bash
python3 -m http.server 8080
```

Then open: `http://localhost:8080`

## Controls

- `Space` or `ArrowUp` → Jump
- `ArrowDown` → Slide
- `K` → Kick
- `P` or `Esc` → Pause / resume

## Project structure

```text
.
├── index.html
├── styles.css
├── README.md
└── js
    ├── main.js                  # UI flow + screen state + app wiring
    ├── core
    │   ├── game.js              # Main game loop, spawning, progression
    │   └── renderer.js          # Canvas rendering and original art drawing
    ├── data
    │   ├── characters.js        # Character definitions and gameplay stats
    │   └── levels.js            # Level tuning + obstacle/power-up definitions
    ├── entities
    │   └── player.js            # Player physics and temporary status effects
    └── systems
        ├── audio.js             # Web Audio API SFX helpers
        ├── collision.js         # AABB collision utility
        └── input.js             # Keyboard + touch input mapping
```

## Customization guide

### Add or edit characters
- File: `js/data/characters.js`
- Tune:
  - `stats` (UI summary bars)
  - `gameplay` values like `baseSpeed`, `jumpPower`, `maxHealth`, `kickPower`, `coinMagnet`, `hitboxScale`

### Add or edit levels
- File: `js/data/levels.js`
- Tune:
  - `length`, `baseSpeedBoost`, `difficultyGrowth`
  - `obstaclePool`, `coinRate`, `powerupRate`
  - `backdrop` colors for level visual identity

### Add obstacles or power-ups
- File: `js/data/levels.js`
- Add entries in `OBSTACLE_DEFS` or `POWERUP_DEFS`, then include them in level pools.
- Renderer behavior is in `js/core/renderer.js`.

### Adjust gameplay systems
- Main loop and spawn cadence: `js/core/game.js`
- Player movement and effects: `js/entities/player.js`
- Collision checks: `js/systems/collision.js`
- Input mapping: `js/systems/input.js`

## Notes

- All art is original and generated in-project through Canvas drawing logic.
- The game is designed as a polished MVP and easy to expand into more levels, skins, or endless mode.
