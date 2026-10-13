# The Village Bake

A self-contained, touch-first countryside baking competition. The static app has no runtime dependencies and makes no external requests.

## Play

The six-week season contains 18 Signature, Technical and Showstopper rounds, with 36 recipe choices. Signature rounds offer three recipes, Technicals prescribe one recipe, and Showstoppers offer two constructions. The original contestants, weekly eliminations, Star Baker awards and final remain intact. Practice any recipe independently from the competition.

**Create your own.** In Signature and Showstopper rounds, and in the practice kitchen, bakers can build their own bake instead: choose one of ten bases (butter sponge, genoise, shortbread, shortcrust, rough puff, enriched dough, lean dough, choux, meringue, baked cheesecake), give it one of 24 shapes, then tune sweetness, richness, an inclusion and flavour strength. Choices rewrite the real ingredient quantities and method. Each round's brief limits which creations fit, and judges mark down a creation that ignores it.

Control ingredient flow, correct measurements, perform ordered and timed preparation actions, shape individual portions, manage oven heat and rotation, prepare components alongside baking, choose cooling methods, align constructions, then decorate. Flavour, texture, baking and presentation are scored separately from those actions. There is no preselected risk level or score ceiling. Extra components require actual preparation.

- **Ingredients have jobs.** Every ingredient has a role. Too much raising agent rises then sinks; extra sugar browns sooner and turns sticky; short on fat or egg is crumbly; mis-measured salt changes flavour and prove speed.
- **Rests are called by the baker.** Bread proves and pastry chills on a readiness meter. Under-proved dough tears, over-proved dough collapses, and warm pastry smears its layers or shrinks. Fillings can be made while it rests.
- **The oven has a shelf and a base.** Top colours fast, bottom crisps the base. Wet fillings in a lined case need blind baking (or the bottom shelf) or they get a soggy bottom. Bread benefits from early steam; steam left in dulls the crust.
- **Assembly and finishing.** Spread a thin, even or generous filling, which oozes if warm. Crumb coat built cakes before a coating. Decorations can be placed singly or as a ring, line or cluster, coloured, then picked up, dragged, turned, resized or removed.
- **Scoring matches the picture.** The illustrations and the judges share one set of visibility thresholds: a flaw costs presentation exactly when it is drawn. The finish is judged on spacing, symmetry, balance, colour count and whether the decorations hint at the flavour inside.
- **Rivals and judges.** Each rival has strengths, weaknesses, a temperament and favourite flavours. Their category scores, bakes and weakness-linked mishaps follow from those, and their confidence moves with results. Their actual bakes appear at the judging table. Mabel judges flavour and balance; Hugh judges the bake and the base, and occasionally offers a handshake.

Challenge clocks start at 3:25 (Signature), 3:45 (Technical) and 4:45 (Showstopper), and grow with rests and lined cases.

The recipe system includes seven preparation techniques, six shaping methods, 16 flavours, 20 optional fillings/finishes and 22 decorations. Finished illustrations reflect the recipe, selections, portions, construction and mistakes.

Controls: captured pointer/touch holds for pouring; native sliders for flow, shaping, temperature and alignment; large action buttons for techniques; tap-to-place or drag decorations. Holds support Space/Enter. Leaving the tab, opening the recipe or pausing stops all cooking timers. Short portrait and landscape layouts keep controls reachable without collapsing the artwork.

Saves use the existing browser local-storage key. Earlier bakes upgrade in place: work already done keeps its credit, so a save never fails a prove that did not exist when it was made. Version 1 progress migrates to the new mechanics while preserving seasons, completed scores, results, records and retry checkpoints. Active old bakes retain proportional oven/cooling progress and receive additional transition time. A best-effort backup of the original save is retained locally.

## GitHub Pages

This repository exports the complete game source from its Sites version. Pushes to `main` publish the contents of `dist/` to GitHub Pages through `.github/workflows/pages.yml`. The workflow can also be run manually from the Actions tab. During deployment every module and stylesheet address is stamped with the commit (`app.js?v=…`), so browsers never mix cached files from an older version with new ones; the source in `dist/` stays unstamped. In the repository's Settings → Pages, select **GitHub Actions** as the build and deployment source.

The game is served at https://evanstom273.github.io/web-baking-game/. It needs no backend, runtime dependencies, API keys or build step.

Browser saves belong to the website origin. Progress saved on the original Sites address does not automatically transfer to the GitHub Pages address. The original save remains available at its original address.

## Project

- `dist/index.html`, `dist/style.css`, `dist/app.js`: application and responsive interface
- `dist/content.js`: recipe book, ingredient roles, briefs and rival contestants
- `dist/pantry.js`: bases, shapes and the create-your-own recipe composer
- `dist/engine.js`: deterministic baking stations, judging and competition
- `dist/presentation.js`: what the finished bake visibly shows, shared by art and judges
- `dist/rivals.js`: rival bakes, category scores, mishaps and confidence
- `dist/art.js`: original layered SVG illustrations
- `dist/workbench.js`, `dist/workbench.css`: stage controls, illustrations and live readouts

Serve `dist/` with any static HTTP server. Run `npm run check` and `npm test`. DOM interaction tests require the optional `jsdom` development dependency. Tests cover every recipe, technique consequences, scoring, six-week progression, migration and event-driven full-season play. No bundler or build step is needed for publication.

Competition bake times are deliberately compressed game timings, not cooking instructions.
