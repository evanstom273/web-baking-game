import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { targets, recipeFor, currentTechnique, currentComponent, shapeTarget } from '../dist/engine.js';
import { DECORATIONS } from '../dist/content.js';
import { snapDecoration } from '../dist/art.js';

const require = createRequire(import.meta.url);
let JSDOM, VirtualConsole;
try { ({ JSDOM, VirtualConsole } = require('jsdom')); }
catch { ({ JSDOM, VirtualConsole } = require('/workspace/scratch/heat-tests/node_modules/jsdom/lib/api.js')); }

// This harness exercises the shipped event handlers. It does not claim to
// verify browser layout, native pointer capture, or physical-device behaviour.
const KEY = 'village-bake-save-v1';
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
let bootCount = 0;

// Real v1 shape captured as a fixture, deliberately independent of the current
// engine. After judging the last bake the season has moved on, but the saved
// run still shows last week's results. Migration must preserve that distinction.
function legacyWeekOneSave() {
  const names = { you: 'You', maeve: 'Maeve', rafi: 'Rafi', jules: 'Jules', arthur: 'Arthur', nia: 'Nia', benji: 'Benji', lottie: 'Lottie' };
  const scores = { you: [91, 91, 96], maeve: [76, 79, 72], rafi: [77, 82, 79], jules: [69, 72, 68], arthur: [82, 77, 80], nia: [75, 71, 74], benji: [58, 60, 62], lottie: [65, 70, 68] };
  const history = [0, 1, 2].map(round => {
    const roundRanking = Object.keys(scores).map(id => ({ id, name: names[id], score: scores[id][round] })).sort((a, b) => b.score - a.score);
    const weekRanking = Object.keys(scores).map(id => ({ id, name: names[id], score: Math.round(scores[id].slice(0, round + 1).reduce((sum, value) => sum + value, 0) / (round + 1) * 10) / 10 })).sort((a, b) => b.score - a.score);
    return { week: 0, round, roundRanking, weekRanking, star: round === 2 ? 'you' : null, eliminated: round === 2 ? 'benji' : null, final: false };
  });
  const active = Object.keys(names).filter(id => id !== 'benji');
  const season = {
    seed: 81, week: 1, round: 0, active, scores,
    weekScores: Object.fromEntries(active.map(id => [id, []])), history,
    stars: { you: 1 }, status: 'playing', winner: null,
    _appliedRounds: Object.fromEntries(history.map((result, round) => [`legacy-0-${round}`, structuredClone(result)])),
  };
  season._weekStart = structuredClone(season);
  const score = {
    id: 'legacy-0-2', recipeId: 'orchard-celebration', flavour: 100, texture: 100,
    baking: 100, presentation: 100, total: 96, maxPotential: 96,
    headline: 'A star-worthy bake!', comments: [
      { judge: 'Mabel', text: 'Lovely balance, and a beautifully even crumb.' },
      { judge: 'Hugh', text: 'That is a confident bake. Excellent colour.' },
    ], notes: ['Accurate measures, a careful bake and a clean finish. Beautifully handled.'],
    timePenalty: 0, overtime: 0, doneness: 1, cooling: 100, ingredientAccuracy: 100,
  };
  const bake = {
    id: 'legacy-0-2', recipeId: 'orchard-celebration', flavour: 'berry', ambition: 'flair',
    practice: false, stage: 'judged', ingredient: 4, amount: 0, measurements: [1, 1, 1, 1],
    mix: 12.32, shape: 62, heat: 175, bake: 42.56, icing: 12, cool: 12,
    decorations: Array.from({ length: 7 }, (_, i) => ({ x: .23 + i * .07, y: .5, type: 'berry' })),
    elapsed: 83, score, heatError: 0, ovenSeconds: 42.56, bakeDoneness: 1, coolRatio: 1,
  };
  return {
    version: 1, season, run: { recipeId: 'orchard-celebration', week: 0, round: 2,
      flavour: 'berry', ambition: 'flair', bake, view: 'week', result: structuredClone(history[2]) },
    practice: null, records: { 'garden-sponge': 91, 'lemon-madeleines': 91, 'orchard-celebration': 96 },
    muted: true, tutorialSeen: true,
  };
}

async function boot(saved = null, { backupThrows = false } = {}) {
  const runtimeErrors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => runtimeErrors.push(error));
  const checkErrors = () => { if (runtimeErrors.length) throw runtimeErrors.shift(); };
  const dom = new JSDOM(html, { url: 'https://village-bake.test/', pretendToBeVisual: true, virtualConsole });
  const { window } = dom;
  let now = 0, frame, hidden = false;
  Object.defineProperty(window.document, 'hidden', { get: () => hidden });
  window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  window.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new window.Event('close')); };
  window.HTMLElement.prototype.setPointerCapture = function () {};
  window.Element.prototype.getBoundingClientRect = function () {
    return { x: 0, y: 0, left: 0, top: 0, right: 700, bottom: 500, width: 700, height: 500 };
  };
  Object.assign(globalThis, {
    window, document: window.document, localStorage: window.localStorage,
    requestAnimationFrame: callback => { frame = callback; return 1; },
    performance: { now: () => now },
  });
  window.localStorage.setItem(KEY, JSON.stringify(saved ?? {
    version: 2, season: null, run: null, practice: null, records: {}, muted: true, tutorialSeen: true, expansionTutorialSeen: true,
  }));
  if (backupThrows) {
    const originalSetItem = window.Storage.prototype.setItem;
    window.Storage.prototype.setItem = function (key, value) {
      if (key === KEY + '-before-expansion') throw new window.DOMException('Storage quota exceeded', 'QuotaExceededError');
      return originalSetItem.call(this, key, value);
    };
  }
  await import(`../dist/app.js?dom-test=${++bootCount}`);
  const query = selector => window.document.querySelector(selector);
  const click = (action, value) => {
    const selector = `[data-action="${action}"]${value === undefined ? '' : `[data-value="${value}"]`}`;
    const element = query(selector);
    assert.ok(element, `Expected available action ${selector}`);
    assert.equal(element.disabled, false, `Expected enabled action ${selector}`);
    element.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
    checkErrors();
  };
  const pointer = (type, element = window.document, { x = 0, y = 0, id = 1, primary = true } = {}) => {
    const event = new window.MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX: x, clientY: y });
    Object.defineProperties(event, { pointerId: { value: id }, pointerType: { value: 'touch' }, isPrimary: { value: primary } });
    element.dispatchEvent(event);
    checkErrors();
  };
  const advance = seconds => {
    for (let remaining = seconds; remaining > 0.000001;) {
      const milliseconds = Math.min(100, remaining * 1000);
      now += milliseconds;
      frame(now);
      remaining -= milliseconds / 1000;
    }
  };
  const savedState = () => {
    window.dispatchEvent(new window.Event('pagehide'));
    checkErrors();
    return JSON.parse(window.localStorage.getItem(KEY));
  };
  const hold = (action, seconds) => {
    const button = query(`[data-hold="${action}"]`);
    assert.ok(button, `Expected hold control ${action}`);
    pointer('pointerdown', button);
    advance(seconds);
    pointer('pointerup');
  };
  const input = (name, value) => {
    const element = query(`[data-input="${name}"]`);
    assert.ok(element, `Expected input ${name}`);
    element.value = String(value);
    element.dispatchEvent(new window.Event('input', { bubbles: true }));
  };
  return { window, query, click, pointer, advance, savedState, hold, input,
    visibility: value => { hidden = value; window.document.dispatchEvent(new window.Event('visibilitychange')); },
    close: () => dom.window.close() };
}

function currentBake(ui, mode = 'run') { return ui.savedState()[mode].bake; }

function waitFor(ui, predicate, description, limit = 2000) {
  for (let index = 0; index < limit; index++) {
    if (predicate()) return;
    ui.advance(.05);
  }
  assert.fail(`Did not reach ${description}`);
}

function timeAction(ui, action, value, mode = 'run', zone = [28, 78]) {
  ui.advance(.65);
  const midpoint = (zone[0] + zone[1]) / 2;
  waitFor(ui, () => Math.abs(currentBake(ui, mode).phase - midpoint) < 1.6, `timing window for ${action}`);
  ui.click(action, value);
}

function decorationLocations(bake, count) {
  const recipe = recipeFor(bake), locations = [];
  for (let y = 175; y <= 350; y += 25) {
    for (let x = 190; x <= 515; x += 35) {
      const snapped = snapDecoration({ kind: recipe.kind, recipeId: recipe.art || recipe.id, layers: recipe.assemblyParts }, x, y);
      if (!locations.some(point => Math.hypot(point.snapped.x - snapped.x, point.snapped.y - snapped.y) < .09)) locations.push({ x, y, snapped });
    }
  }
  assert.ok(locations.length >= count, `Enough spaced locations for ${recipe.id}`);
  return locations.slice(0, count);
}

function playStages(ui, { mode = 'run', poor = false, stopAt = 'judged', visited = new Set() } = {}) {
  const read = () => currentBake(ui, mode);
  for (let step = 0; step < 100; step++) {
    let b = read();
    const r = recipeFor(b), t = targets(b);
    if (b.stage === stopAt || b.stage === 'judged') return b.score;
    visited.add(b.stage);
    switch (b.stage) {
      case 'measure':
        while (read().stage === 'measure') {
          const goal = r.ingredients[read().ingredient].target;
          ui.input('pour-rate', 100);
          if (poor) ui.hold('pour', .1);
          else {
            ui.pointer('pointerdown', ui.query('[data-hold="pour"]'));
            waitFor(ui, () => read().amount >= goal * .955, 'measured ingredient', 400);
            ui.pointer('pointerup');
            while (read().amount > goal * 1.014) ui.click('scrape');
            while (read().amount < goal * .99) ui.click('spoon');
          }
          ui.click('add');
        }
        break;
      case 'prepare':
        for (let attempt = 0; attempt < 100 && !currentTechnique(read()).done; attempt++) {
          const task = currentTechnique(read());
          if (task.rest) {
            let actionsAt = -5;
            waitFor(ui, () => {
              const now = read(), current = currentComponent(now);
              if (!poor && current && !current.done && now.elapsed - actionsAt >= .65 && Math.abs(now.phase - (current.zone[0] + current.zone[1]) / 2) < 3) { ui.click('component'); actionsAt = now.elapsed; }
              return poor || currentTechnique(now).readiness >= task.window[0] + .08;
            }, `${r.id} rest`, 2400);
            ui.click('technique', 'ready');
          } else timeAction(ui, 'technique', task.expected, mode, task.zone);
        }
        assert.ok(currentTechnique(read()).done, `${r.id} preparation completes`);
        ui.click('prepared');
        break;
      case 'shape':
        while (read().stage === 'shape') {
          b = read();
          ui.input('shape', poor ? 0 : shapeTarget(b, b.shapeIndex));
          timeAction(ui, 'shape-set', undefined, mode, b.shapeZone || [28, 78]);
        }
        break;
      case 'bake': {
        ui.input('heat', t.temp);
        if (!poor && ui.query('[data-action="blind-bake"]')) ui.click('blind-bake');
        let rotated = false, actionsAt = -5;
        if (!poor) {
          waitFor(ui, () => {
            b = read();
            if (!rotated && b.bake >= t.bake * .5) { ui.click('rotate'); rotated = true; }
            const current = currentComponent(b);
            if (current && !current.done && b.elapsed - actionsAt >= .65 && Math.abs(b.phase - (current.zone[0] + current.zone[1]) / 2) < 3) {
              ui.click('component'); actionsAt = b.elapsed;
            }
            return b.bake >= t.bake;
          }, `${r.id} baked`, 2400);
        }
        ui.click('oven-out');
        break;
      }
      case 'cool':
        ui.click('cool-method', 'rack');
        if (!poor) {
          waitFor(ui, () => read().cool >= t.cool, 'rack cooling');
          for (let attempt = 0; attempt < 80 && !currentComponent(read()).done; attempt++) {
            const current = currentComponent(read());
            timeAction(ui, 'component', undefined, mode, current.zone);
          }
          assert.equal(currentComponent(read()).done, true, `${r.id} components complete`);
        }
        ui.click('cooled');
        break;
      case 'assemble':
        while (read().assemblyIndex < t.parts) {
          ui.input('alignment', poor ? 0 : 50);
          if (!poor) timeAction(ui, 'spread', undefined, mode, b.assemblyZone || [25, 80]);
          timeAction(ui, 'place-layer', undefined, mode, b.assemblyZone || [25, 80]);
        }
        if (!poor && ui.query('#crumb-coat') && !ui.query('#crumb-coat').disabled) ui.click('crumb-coat');
        ui.click('assembled');
        break;
      case 'decorate':
        if (!poor) {
          const type = r.decorationIds.find(id => DECORATIONS[id].style === 'place') || r.decorationIds[0];
          ui.click('decor-type', type);
          ui.input('decor-size', 1);
          for (const point of decorationLocations(b, t.decor || r.decorTarget || 5)) {
            ui.advance(.65);
            waitFor(ui, () => Math.abs(read().phase - 52.5) < 1.6, 'decoration timing');
            ui.pointer('pointerdown', ui.query('#decor-surface'), point);
            ui.pointer('pointerup');
          }
        }
        ui.click('judge');
        assert.ok(ui.query('.score-seal'), 'Judging result is rendered');
        break;
      default: assert.fail(`Unhandled stage ${b.stage}`);
    }
  }
  assert.fail(`Bake did not finish; stopped at ${read().stage}`);
}

function completeCurrent(ui, options) {
  ui.click('start');
  return playStages(ui, options);
}

test('v1 completed-week save preserves scores, eliminations and pending weekly results', async () => {
  const legacy = legacyWeekOneSave();
  const ui = await boot(legacy);
  ui.click('continue');
  const migrated = ui.savedState();
  assert.deepEqual(migrated.season.scores, legacy.season.scores);
  assert.deepEqual(migrated.season.history, legacy.season.history);
  assert.deepEqual(migrated.season.stars, { you: 1 });
  assert.equal(migrated.season.active.includes('benji'), false);
  assert.equal(migrated.season.week, 1);
  assert.equal(migrated.run.week, 0, 'Old result belongs to the previous week');
  assert.equal(migrated.run.round, 2);
  assert.equal(migrated.run.bake.score.total, 96);
  assert.equal(migrated.records['orchard-celebration'], 96);
  ui.click('next-week');
  assert.equal(ui.savedState().run.week, 1);
  assert.equal(ui.savedState().run.round, 0);
  assert.equal(ui.savedState().season.history.length, 3, 'Opening next brief does not submit an extra result');
  ui.close();
});

test('v1 scored bake still renders at the judging table without v2 preparation fields', async () => {
  const legacy = legacyWeekOneSave();
  legacy.run.view = 'result';
  const ui = await boot(legacy);
  ui.click('continue');
  assert.match(ui.query('.score-seal').textContent, /96/);
  assert.deepEqual(ui.savedState().run.bake, legacy.run.bake, 'Migration does not rewrite a previously judged bake');
  ui.click('next-result');
  assert.ok(ui.query('[data-action="next-week"]'));
  assert.equal(ui.savedState().season.history.length, 3);
  ui.close();
});

test('a failed migration backup does not prevent the existing season from loading', async () => {
  const legacy = legacyWeekOneSave();
  const ui = await boot(legacy, { backupThrows: true });
  ui.click('continue');
  assert.equal(ui.savedState().version, 2);
  assert.deepEqual(ui.savedState().season.history, legacy.season.history);
  assert.equal(ui.savedState().run.bake.score.total, 96);
  ui.click('next-week');
  assert.equal(ui.savedState().run.week, 1);
  ui.close();
});

test('touch hold, release, cancellation, recipe pause, visibility pause and saved continuation', async () => {
  let ui = await boot();
  ui.click('new');
  ui.input('flavour', 'chocolate');
  ui.input('accent', 'vanilla');
  ui.click('start');
  assert.equal(currentBake(ui).flavour, 'chocolate');
  ui.click('add');
  assert.equal(currentBake(ui).ingredient, 0, 'Empty ingredient is not accepted');
  ui.hold('pour', 2);
  const halfway = currentBake(ui).amount;
  const flowAtRelease = currentBake(ui).flowVelocity;
  assert.ok(halfway > 0);
  ui.advance(1);
  assert.ok(currentBake(ui).flowVelocity < flowAtRelease * .03, 'Release lets the residual ingredient flow settle');
  ui.pointer('pointerdown', ui.query('[data-hold="pour"]'));
  ui.advance(.3);
  ui.pointer('pointercancel');
  const cancelled = currentBake(ui).flowVelocity;
  ui.advance(.3);
  assert.ok(currentBake(ui).flowVelocity < cancelled, 'Pointer cancel stops the active flow');
  ui.pointer('pointerdown', ui.query('[data-hold="pour"]'));
  ui.advance(.3);
  ui.pointer('lostpointercapture');
  const lostCapture = currentBake(ui).flowVelocity;
  ui.advance(.3);
  assert.ok(currentBake(ui).flowVelocity < lostCapture, 'Lost capture stops the active flow');
  ui.click('empty');
  const heldControl = ui.query('[data-hold="pour"]');
  ui.pointer('pointerdown', heldControl, { id: 1 });
  ui.advance(.2);
  ui.pointer('pointerdown', heldControl, { id: 2, primary: false });
  ui.pointer('pointerup', ui.window.document, { id: 2, primary: false });
  const secondFingerUp = currentBake(ui).amount;
  ui.advance(.2);
  assert.ok(currentBake(ui).amount > secondFingerUp, 'A second finger release does not stop the first finger');
  assert.equal(ui.query('[data-hold="pour"]'), heldControl, 'Animation preserves the captured control element');
  ui.pointer('pointercancel', ui.window.document, { id: 1 });
  const afterMultiTouch = currentBake(ui).flowVelocity;
  ui.advance(.2);
  assert.ok(currentBake(ui).flowVelocity < afterMultiTouch, 'Cancelling the active pointer stops the hold');
  ui.click('recipe');
  const pausedElapsed = currentBake(ui).elapsed;
  ui.advance(2);
  assert.equal(currentBake(ui).elapsed, pausedElapsed, 'Recipe pauses the timer');
  ui.click('close');
  ui.advance(.5);
  assert.ok(currentBake(ui).elapsed > pausedElapsed);
  ui.visibility(true);
  const hiddenElapsed = currentBake(ui).elapsed;
  ui.advance(2);
  ui.visibility(false);
  ui.advance(2);
  assert.equal(currentBake(ui).elapsed, hiddenElapsed, 'Returning leaves the pause dialog open');
  ui.click('close');
  const saved = ui.savedState();
  ui.close();
  ui = await boot(saved);
  ui.click('continue');
  assert.equal(currentBake(ui).amount, saved.run.bake.amount);
  assert.deepEqual(currentBake(ui).flavours, ['chocolate', 'vanilla']);
  ui.click('empty');
  assert.equal(currentBake(ui).amount, 0);
  ui.hold('pour', 4);
  ui.click('add');
  assert.equal(currentBake(ui).ingredient, 1, 'Saved bake remains playable');
  ui.click('home');
  ui.click('menu-confirm');
  const menuElapsed = currentBake(ui).elapsed;
  ui.advance(3);
  assert.equal(currentBake(ui).elapsed, menuElapsed, 'Main menu freezes the bake');
  ui.close();
});

test('an unsuccessful week eliminates the player and retry restores the week', async () => {
  const ui = await boot(legacyWeekOneSave());
  ui.click('continue');
  ui.click('next-week');
  const beginning = ui.savedState().season;
  for (let round = 0; round < 3; round++) {
    const score = completeCurrent(ui, { poor: true });
    assert.ok(score.total < 40);
    ui.click('next-result');
  }
  assert.match(ui.query('h1').textContent, /Time for another batch/);
  assert.equal(ui.savedState().season.status, 'eliminated');
  ui.click('retry-week');
  assert.deepEqual(ui.savedState().season, beginning);
  assert.equal(ui.savedState().run.week, 1);
  assert.equal(ui.savedState().run.round, 0);
  ui.close();
});

test('creative briefs expose meaningful choices and Technical choices stay prescribed', async () => {
  let ui = await boot();
  ui.click('new');
  const choices = [...ui.window.document.querySelectorAll('[data-action="choose-recipe"]')];
  assert.ok(choices.length >= 2);
  ui.click('choose-recipe', choices[1].dataset.value);
  const chosen = ui.savedState().run.recipeId;
  ui.input('flavour', 'chocolate');
  ui.input('accent', 'vanilla');
  const filling = [...ui.query('[data-input="filling"]').options].find(option => option.value !== 'none');
  ui.input('filling', filling.value);
  ui.click('start');
  assert.equal(currentBake(ui).recipeId, chosen);
  assert.equal(currentBake(ui).filling, filling.value);
  playStages(ui, { stopAt: 'prepare' });
  const task = currentTechnique(currentBake(ui));
  timeAction(ui, 'technique', task.expected, 'run', task.zone);
  const saved = ui.savedState();
  ui.close();
  ui = await boot(saved);
  ui.click('continue');
  assert.deepEqual(currentBake(ui), saved.run.bake, 'A preparation-stage reload retains every action and quantity');
  const score = playStages(ui);
  assert.ok(score.total >= 85, `Creative recipe scored ${score.total}`);
  ui.click('next-result');
  assert.equal(ui.query('[data-action="choose-recipe"]'), null);
  for (const field of ['flavour', 'accent', 'filling', 'finish']) assert.equal(ui.query(`[data-input="${field}"]`).disabled, true);
  const prescribed = ui.savedState().run.options;
  ui.input('flavour', 'chocolate');
  ui.input('filling', 'none');
  assert.deepEqual(ui.savedState().run.options, prescribed, 'Synthetic input cannot bypass the Technical prescription');
  ui.close();
});

test('all 18 rounds play through the actual UI to a completed six-week season', async context => {
  const ui = await boot(), visited = new Set(), timingReport = [];
  ui.click('new');
  for (let week = 0; week < 6; week++) {
    assert.equal(ui.savedState().season.active.length, 8 - week);
    for (let round = 0; round < 3; round++) {
      assert.equal(ui.savedState().run.week, week);
      assert.equal(ui.savedState().run.round, round);
      const score = completeCurrent(ui, { visited });
      const baked = currentBake(ui), budget = targets(baked).budget;
      const timing = { week: week + 1, round: round + 1, recipe: baked.recipeId,
        elapsed: Math.round(baked.elapsed * 10) / 10, budget: Math.round(budget * 10) / 10,
        slack: Math.round((budget - baked.elapsed) * 10) / 10, score: score.total };
      timingReport.push(timing);
      context.diagnostic(JSON.stringify(timing));
      assert.equal(score.timePenalty, 0, `A careful UI playthrough must fit the deadline: ${JSON.stringify(timing)}`);
      assert.ok(baked.elapsed <= budget, `A careful UI playthrough must have time to finish ${baked.recipeId}`);
      assert.ok(score.total >= 85, `Week ${week + 1} round ${round + 1}: ${score.total}; ${score.notes.join(' ')}`);
      ui.click('next-result');
    }
    if (week < 5) ui.click('next-week');
  }
  assert.equal(ui.savedState().season.status, 'complete');
  assert.equal(ui.savedState().season.history.length, 18);
  assert.equal(ui.savedState().season.scores.you.length, 18);
  assert.equal(ui.savedState().season.winner, 'you');
  context.diagnostic(`Clock summary: elapsed ${Math.min(...timingReport.map(row => row.elapsed))}–${Math.max(...timingReport.map(row => row.elapsed))}s; slack ${Math.min(...timingReport.map(row => row.slack))}–${Math.max(...timingReport.map(row => row.slack))}s.`);
  assert.match(ui.query('h1').textContent, /won the Village Bake/);
  assert.deepEqual([...visited].sort(), ['assemble', 'bake', 'cool', 'decorate', 'measure', 'prepare', 'shape']);
  ui.close();
});

test('practice is isolated, decoration supports tapping and dragging, and overdue practice has no penalty', async () => {
  let ui = await boot();
  ui.click('new');
  ui.click('start');
  ui.hold('pour', 1);
  ui.click('home');
  ui.click('menu-confirm');
  const initial = ui.savedState();
  ui.click('practice');
  ui.click('book-week', 2);
  ui.click('practice-bake', ui.query('[data-action="practice-bake"]').dataset.value);
  const score = completeCurrent(ui, { mode: 'practice' });
  assert.ok(score.total >= 85, `Practice scored ${score.total}; ${score.notes.join(' ')}`);
  assert.deepEqual(ui.savedState().season, initial.season);
  assert.deepEqual(ui.savedState().run, initial.run);
  const saved = ui.savedState();
  saved.practice.bake.stage = 'decorate';
  saved.practice.bake.score = null;
  saved.practice.bake.elapsed = targets(saved.practice.bake).budget + 100;
  saved.practice.view = 'game';
  ui.close();
  ui = await boot(saved);
  ui.click('practice');
  ui.click('resume-practice');
  const before = currentBake(ui, 'practice').decorations.length;
  ui.click('undo');
  assert.equal(currentBake(ui, 'practice').decorations.length, before - 1);
  ui.pointer('pointerdown', ui.query('[data-decor]'), { x: 0, y: 0 });
  ui.pointer('pointerup', ui.window.document, { x: 320, y: 225 });
  assert.equal(currentBake(ui, 'practice').decorations.length, before, 'Drag releases onto the bake');
  ui.click('judge');
  assert.equal(currentBake(ui, 'practice').score.timePenalty, 0, 'Untimed practice must never deduct overtime points');
  assert.deepEqual(ui.savedState().season, initial.season);
  assert.deepEqual(ui.savedState().run, initial.run);
  ui.close();
});
