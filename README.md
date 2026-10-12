# The Village Bake

A self-contained, touch-first countryside baking competition. The static app has no runtime dependencies and makes no external requests.

## Play

The six-week season contains 18 Signature, Technical and Showstopper rounds, with 36 recipe choices. Signature rounds offer three recipes, Technicals prescribe one recipe, and Showstoppers offer two constructions. The original contestants, weekly eliminations, Star Baker awards and final remain intact. Practice any recipe independently from the competition.

Control ingredient flow, correct measurements, perform ordered and timed preparation actions, shape individual portions, manage oven heat and rotation, prepare components alongside baking, choose cooling methods, align constructions, then decorate. Flavour, texture, baking and presentation are scored separately from those actions. There is no preselected risk level or score ceiling. Challenge timers are 3:00 for Signature, 3:30 for Technical and 4:00 for Showstopper. Extra components require actual preparation.

The recipe system includes seven preparation techniques, six shaping methods, 16 flavours, 20 optional fillings/finishes and 22 decorations. Finished illustrations reflect the recipe, selections, portions, construction and mistakes.

Controls: captured pointer/touch holds for pouring; native sliders for flow, shaping, temperature and alignment; large action buttons for techniques; tap-to-place or drag decorations. Holds support Space/Enter. Leaving the tab, opening the recipe or pausing stops all cooking timers. Short portrait and landscape layouts keep controls reachable without collapsing the artwork.

Saves use the existing browser local-storage key. Version 1 progress migrates to the new mechanics while preserving seasons, completed scores, results, records and retry checkpoints. Active old bakes retain proportional oven/cooling progress and receive additional transition time. A best-effort backup of the original save is retained locally.

## GitHub Pages

This repository exports the complete game source from its Sites version. Pushes to `main` publish the contents of `dist/` to GitHub Pages through `.github/workflows/pages.yml`. The workflow can also be run manually from the Actions tab. In the repository's Settings → Pages, select **GitHub Actions** as the build and deployment source.

The game is served at https://evanstom273.github.io/web-baking-game/. It needs no backend, runtime dependencies, API keys or build step.

Browser saves belong to the website origin. Progress saved on the original Sites address does not automatically transfer to the GitHub Pages address. The original save remains available at its original address.

## Project

- `dist/index.html`, `dist/style.css`, `dist/app.js`: application and responsive interface
- `dist/content.js`: recipe book and rival contestants
- `dist/engine.js`: deterministic competition and baking evaluation
- `dist/art.js`: original layered SVG illustrations
- `dist/workbench.js`, `dist/workbench.css`: stage controls, illustrations and live readouts

Serve `dist/` with any static HTTP server. Run `npm run check` and `npm test`. DOM interaction tests require the optional `jsdom` development dependency. Tests cover every recipe, technique consequences, scoring, six-week progression, migration and event-driven full-season play. No bundler or build step is needed for publication.

Competition bake times are deliberately compressed game timings, not cooking instructions.
