# Family Dash: Tiny Menace Run

A complete browser endless-runner game built with **100% HTML, CSS, and JavaScript** (no TypeScript, no game engine).

## ✅ Local-run fix included

This version is intentionally built with **classic script loading** (no ES module imports), so it runs by double-clicking `index.html` directly from disk (`file://`) without the CORS module error.

## Features

- Pixel-art themed UI and in-game visuals with crisp retro styling
- Start screen, character select, level select, game HUD, pause flow, game over, and win screen
- 6 unique playable characters with custom stats and gameplay feel
- 3 polished levels with increasing difficulty and distinct visual themes
- Auto-running side-scroller gameplay with jump, slide, and kick controls
- Character-specific mechanics and stat-driven playstyles, including visual size scaling (parents full-size, kids half-size, Addy one-third size)
- Original code-generated visuals for characters, obstacles, power-ups, backgrounds, trees, houses, and UI
- Collectibles (coins), power-ups (heal/shield/rush), lives/health, score and distance
- Optional mobile/touch controls
- Simple generated audio SFX via Web Audio API
- High score persistence via `localStorage`

## Run locally

### Option 1: Open directly (works now)
Open `index.html` in a modern browser.

### Option 2: Simple local server (recommended for dev)
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

- Characters: `js/data/characters.js`
- Levels / obstacles / powerups: `js/data/levels.js`
- Core gameplay loop and progression: `js/core/game.js`
- Canvas visuals and character drawing: `js/core/renderer.js`
- Player movement and status effects: `js/entities/player.js`
- Controls: `js/systems/input.js`

## Notes

- All art is original and generated in-project through Canvas drawing logic.
- The game is designed as a polished MVP and easy to expand into more levels, skins, or endless mode.
