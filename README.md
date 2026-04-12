# Family Dash: Tiny Menace Run

A complete browser endless-runner game built with **100% HTML, CSS, and JavaScript** (no TypeScript, no game engine).

## ✅ Local-run fix included

This version is intentionally built with **classic script loading** (no ES module imports), so it runs by double-clicking `index.html` directly from disk (`file://`) without CORS module errors.

## Features

- Pixel-art themed UI and in-game visuals with crisp retro styling
- Dynamic procedural city background (animated sky cycle, skyline layers, kiosks, lamps, clouds)
- Character select with 6 runners and distinct stats
- **10 progressive levels** with increasing speed, difficulty, and obstacle mixes
- In-game store to buy one-run boosts using coins earned in gameplay
- Boost item dynamics during runs (rush, boost, coin burst, shield, heal)
- Session scoreboard showing top recent run results
- Persistent wallet, inventory, and high score using `localStorage`
- Hype-style generated background music loop via Web Audio API
- Desktop and mobile/touch controls

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
- `K` → Kick
- `P` or `Esc` → Pause / resume

## Customization guide

- Characters and sizes: `js/data/characters.js`
- Levels (1-10), obstacle mix, powerups: `js/data/levels.js`
- Runner feel, collisions, scoring and spawning: `js/core/game.js`
- Dynamic city visuals and pixel runner animation: `js/core/renderer.js`
- Store, scoreboard, and UI flow: `js/main.js`

## Notes

- All art is original and generated in-project through Canvas drawing logic.
- The architecture remains split by `core`, `entities`, `systems`, and `data` to keep expansion straightforward.
