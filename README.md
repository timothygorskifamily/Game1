# Family Dash: Tiny Menace Run

A complete browser endless-runner game built with **100% HTML, CSS, and JavaScript** (no TypeScript, no game engine).

## ✅ Local-run fix included

This version is intentionally built with **classic script loading** (no ES module imports), so it runs by double-clicking `index.html` directly from disk (`file://`) without CORS module errors.

## Features

- Pixel-art themed UI and in-game visuals with crisp retro styling
- Distinct per-level biome backgrounds with constantly changing district paths (homes, parks, ponds, playgrounds, streets, stores)
- Character select with 6 runners and distinct stats
- **10 progressive levels** with unique biome backgrounds (desert, farm, marsh, city, space, volcano, snow, beach, jungle, cyber) plus increasing speed/difficulty
- **Level unlock progression** where each new level opens after you collect 30% of the previous level's coin route
- In-game store to buy one-run boosts using coins earned in gameplay
- Boost item dynamics during runs (rush, boost, coin burst, mega-heal, magnet, phase, shield, heal)
- Session scoreboard showing top recent run results
- Persistent wallet, inventory, and high score using `localStorage`
- Hype-style generated background music loop via Web Audio API
- Desktop and mobile/touch controls with separate pause toggle and pause menu flow

## Run locally

### Option 1: Open directly (works now)
Open `index.html` in a modern browser.

### Option 2: Simple local server (recommended for dev)
```bash
python3 -m http.server 8080
```
Then open: `http://localhost:8080`

## Controls

- `Space` or `ArrowUp` → Jump
- `ArrowDown` → Slide
- `P` → Pause / resume on the game screen
- `M` or `Esc` → Open the pause menu

## Customization guide

- Characters and sizes: `js/data/characters.js`
- Levels (1-10), obstacle mix, powerups: `js/data/levels.js`
- Runner feel, collisions, scoring and spawning: `js/core/game.js`
- Biome background renderer and pixel runner animation: `js/core/renderer.js`
- Store, scoreboard, and UI flow: `js/main.js`

## Notes

- All art is original and generated in-project through Canvas drawing logic.
- The architecture remains split by `core`, `entities`, `systems`, and `data` to keep expansion straightforward.
