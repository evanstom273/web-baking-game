import test from 'node:test';
import assert from 'node:assert/strict';
import { WEEKS, RIVALS, ALL_RECIPES, getRoundRecipes } from '../dist/content.js';
import {
  createBake, targets, advance, commitIngredient, recordTechnique, currentTechnique,
  recoverTechnique, finishPreparation, shapeTarget, commitShape, undoShape,
  currentComponent, workComponent, rotateBake, removeOven, returnOven, setCooling,
  finishCooling, assemble, finishAssembly, placeDecoration, judgeBake, migrateSave,
  createSeason, getRecipe, finishRound, retryWeek, needsBlindBake, blindBake, needsCrumbCoat, crumbCoat,
  recipeFor, setShelf, setSteam, placeDecorations, moveDecoration, removeDecoration, updateDecoration,
} from '../dist/engine.js';
import { BASES, composeRecipe, formsFor, briefIssues } from '../dist/pantry.js';
import { analysePresentation, flawReport, patternPoints } from '../dist/presentation.js';
import { foodSVG } from '../dist/art.js';
import { BRIEFS } from '../dist/content.js';

const copy = value => JSON.parse(JSON.stringify(value));
const recipes = () => ALL_RECIPES;
function runFor(b, seconds, holding = null) {
  for (let remaining = seconds; remaining > 0.000001;) {
    const dt = Math.min(remaining, 0.1); advance(b, dt, holding); remaining -= dt;
  }
}
function centre(zone) {
  if (Array.isArray(zone)) return (zone[0] + zone[1]) / 2;
  if (zone && typeof zone === 'object') return ((zone.low ?? zone.min ?? zone.start) + (zone.high ?? zone.max ?? zone.end)) / 2;
  return 52.5;
}
function measured(recipe = getRecipe(0, 0), options = {}, realMeasurements = false) {
  const b = createBake(recipe, options);
  while (b.stage === 'measure') {
    const target = recipe.ingredients[b.ingredient].target;
    if (realMeasurements) {
      for (let i = 0; b.amount < target * .975; i++) {
        assert.ok(i < 200, `Pour stalled: ${recipe.id}`);
        b.pourRate = b.amount < target * .8 ? 65 : 15;
        advance(b, .1, 'pour');
      }
      runFor(b, 1);
    } else b.amount = target;
    commitIngredient(b);
  }
  return b;
}
function prepare(b, observed = new Set()) {
  for (let i = 0; i < 500; i++) {
    const step = currentTechnique(b);
    if (!step || step.done) break;
    if (step.rest) runFor(b, step.secondsToReady + 1);
    else { runFor(b, .6); b.phase = centre(step.zone); }
    observed.add(step.expected); recordTechnique(b, step.expected);
    assert.ok(i < 499, `Preparation stalled: ${b.recipeId}`);
  }
  finishPreparation(b); assert.equal(b.stage, 'shape'); return b;
}
function prepareWithActions(b, chooseAction = task => task.expected) {
  for (let i = 0; !currentTechnique(b).done; i++) {
    assert.ok(i < 500, `Preparation stalled: ${b.recipeId}`);
    const task = currentTechnique(b);
    if (task.rest) runFor(b, task.secondsToReady + 1);
    else { runFor(b, .6); b.phase = centre(task.zone); }
    recordTechnique(b, chooseAction(task));
  }
  return b;
}
function shape(b) {
  for (let i = 0; b.stage === 'shape'; i++) {
    assert.ok(i < 30, `Shaping stalled: ${b.recipeId}`);
    b.shapeValues[b.shapeIndex] = shapeTarget(b); runFor(b, .6); b.phase = 53; commitShape(b);
  }
  assert.equal(b.stage, 'bake'); return b;
}
function components(b) {
  for (let i = 0; i < 500; i++) {
    const component = currentComponent(b);
    if (!component || component.done) break;
    runFor(b, .6); b.phase = centre(component.zone); workComponent(b, component.role);
    assert.ok(i < 499, `Component stalled: ${b.recipeId}`);
  }
}
function finish(b, { calibratedOven = true, decorate = true } = {}) {
  if (b.stage === 'prepare') prepare(b);
  if (b.stage === 'shape') shape(b);
  if (b.stage === 'bake') {
    const t = targets(b); b.heat = t.temp;
    if (needsBlindBake(b)) blindBake(b);
    if (calibratedOven) {
      b.ovenTemp = t.temp; b.sides = [t.bake, t.bake]; b.bake = t.bake; b.ovenSeconds = t.bake; b.heatError = 0;
    } else {
      for (let i = 0; i < 4; i++) { runFor(b, t.bake / 4); if (i < 3) rotateBake(b); }
    }
    removeOven(b);
  }
  if (b.stage === 'cool') {
    setCooling(b, 'rack'); components(b); runFor(b, Math.max(0, targets(b).cool - b.cool)); finishCooling(b);
  }
  if (b.stage === 'assemble') {
    components(b);
    for (let i = 0; b.assemblyIndex < targets(b).parts; i++) {
      assert.ok(i < 30, `Assembly stalled: ${b.recipeId}`);
      runFor(b, .6); b.phase = 52.5; b.alignment = 50; assemble(b, 'spread');
      runFor(b, .6); b.phase = 52.5; assemble(b, 'place');
    }
    if (needsCrumbCoat(b)) crumbCoat(b);
    finishAssembly(b);
  }
  assert.equal(b.stage, 'decorate', b.recipeId);
  if (decorate) {
    const r = recipeFor(b);
    for (let i = 0; i < targets(b).decor; i++) {
      runFor(b, .6); b.phase = 52.5;
      placeDecoration(b, { x: .18 + (i % 4) * .2, y: .25 + Math.floor(i / 4) * .22, type: r.decorationIds?.[0] ?? 'berry', size: 50, angle: 0 });
    }
  }
  judgeBake(b); return b;
}
const complete = (recipe = getRecipe(0, 0), options = {}, completion = {}) => finish(measured(recipe, options, completion.realMeasurements), completion);

function insideMiddle(b, zone) { return Math.abs(b.phase - centre(zone)) <= 10; }
function waitForTiming(b, zone, readyAt = b.elapsed) {
  for (let i = 0; b.elapsed < readyAt || !insideMiddle(b, zone); i++) {
    assert.ok(i < 500, `Timing wait stalled: ${b.recipeId}`);
    advance(b, .02);
  }
}

// Traverse the actual moving marker, with component preparation overlapping the
// oven and cooling. Only slider positions are set; time and phase are never set.
function playOnClock(recipe, options) {
  const b = measured(recipe, options, true);
  for (let i = 0; !currentTechnique(b).done; i++) {
    assert.ok(i < 100);
    const task = currentTechnique(b);
    if (task.rest) {
      // Rests run alongside component work, exactly as a baker would use them.
      for (let j = 0; currentTechnique(b).readiness < task.window[0] + .08; j++) {
        assert.ok(j < 5000);
        const component = currentComponent(b);
        if (!component.done && b.elapsed >= b.nextComponentAt && insideMiddle(b, component.zone)) workComponent(b);
        advance(b, .02);
      }
    } else waitForTiming(b, task.zone, b.nextTechniqueAt);
    recordTechnique(b, task.expected);
  }
  finishPreparation(b);
  for (let i = 0; b.stage === 'shape'; i++) {
    assert.ok(i < 30);
    b.shapeValues[b.shapeIndex] = shapeTarget(b);
    waitForTiming(b, b.shapeZone, b.nextShapeAt);
    commitShape(b);
  }
  const target = targets(b);
  b.heat = target.temp;
  if (needsBlindBake(b)) blindBake(b);
  for (let i = 0; b.bake < target.bake; i++) {
    assert.ok(i < 5000);
    if (!b.rotations && b.bake >= target.bake * .5) rotateBake(b);
    const component = currentComponent(b);
    if (!component.done && b.elapsed >= b.nextComponentAt && insideMiddle(b, component.zone)) workComponent(b);
    advance(b, .02);
  }
  removeOven(b);
  setCooling(b, 'rack');
  for (let i = 0; b.cool < target.cool || !currentComponent(b).done; i++) {
    assert.ok(i < 5000);
    const component = currentComponent(b);
    if (!component.done && b.elapsed >= b.nextComponentAt && insideMiddle(b, component.zone)) workComponent(b);
    advance(b, .02);
  }
  finishCooling(b);
  if (b.stage === 'assemble') {
    for (let i = 0; b.assemblyIndex < target.parts; i++) {
      assert.ok(i < 30);
      b.alignment = 50;
      waitForTiming(b, b.assemblyZone, b.nextAssemblyAt); assemble(b, 'spread');
      waitForTiming(b, b.assemblyZone, b.nextAssemblyAt); assemble(b, 'place');
    }
    if (needsCrumbCoat(b)) crumbCoat(b);
    finishAssembly(b);
  }
  for (let i = 0; i < target.decor; i++) {
    waitForTiming(b, [25, 80]);
    placeDecoration(b, { x: .18 + (i % 4) * .2, y: .25 + Math.floor(i / 4) * .22, type: recipe.decorationIds[0], size: 1, angle: 0 });
  }
  judgeBake(b);
  return b;
}
function legacyBake(stage = 'measure') {
  const recipe = getRecipe(0, 0), progress = ['measure', 'mix', 'shape', 'bake', 'cool', 'decorate', 'judged'].indexOf(stage);
  return {
    id: `legacy-${stage}`, recipeId: recipe.id, flavour: 'berry', ambition: 'classic', practice: false, stage,
    ingredient: progress ? recipe.ingredients.length : 1, amount: progress ? 0 : 37,
    measurements: progress ? recipe.ingredients.map(() => 1) : [1], mix: progress > 1 ? 9 : 4.5,
    shape: progress > 2 ? 55 : 20, heat: 180, bake: progress > 3 ? 30 : 12, icing: 12, cool: progress > 4 ? 8 : 3,
    decorations: progress > 5 ? [{ x: .2, y: .3, type: 'berry' }] : [], elapsed: 43,
    score: stage === 'judged' ? { id: 'legacy-judged', recipeId: recipe.id, total: 91, maxPotential: 91, flavour: 100, texture: 100, baking: 100, presentation: 100, headline: 'A star-worthy bake!', comments: [{ judge: 'Mabel', text: 'Lovely.' }], notes: [] } : null,
    heatError: 0, ovenSeconds: progress > 3 ? 30 : 12,
    ...(progress > 3 ? { bakeDoneness: 1 } : {}), ...(progress > 4 ? { coolRatio: 1 } : {}),
  };
}

test('all 36 recipes are playable through preparation, shaping, oven and assembly actions', t => {
  assert.equal(WEEKS.length, 6); assert.equal(recipes().length, 36);
  assert.equal(WEEKS.flatMap(week => week.recipes).length, 18);
  for (let week = 0; week < 6; week++) {
    assert.ok(getRoundRecipes(week, 0).length >= 3);
    assert.equal(getRoundRecipes(week, 1).length, 1);
    assert.ok(getRoundRecipes(week, 2).length >= 2);
  }
  const scores = [], times = [], margins = [];
  for (const recipe of recipes()) {
    const b = complete(recipe, {}, { calibratedOven: false, realMeasurements: true });
    assert.equal(b.stage, 'judged');
    assert.ok(b.score.total >= 85, `${recipe.name}: ${b.score.total}; ${b.score.notes.join('; ')}`);
    assert.ok(b.score.total <= 100); assert.equal(b.score.comments.length, 2);
    assert.equal(b.score.timePenalty, 0, `${recipe.name} must fit its time budget`);
    scores.push(b.score.total); times.push(b.elapsed); margins.push(targets(b).budget - b.elapsed);
  }
  t.diagnostic(`36 recipes, real pours and oven: scores ${Math.min(...scores)}–${Math.max(...scores)}, active time ${Math.min(...times).toFixed(1)}–${Math.max(...times).toFixed(1)}s, minimum deadline margin ${Math.min(...margins).toFixed(1)}s.`);
});

test('recipes include all technique families and distinct action sequences', () => {
  const actions = new Set();
  for (const r of recipes()) prepare(measured(r), actions);
  for (const action of ['beat', 'whip', 'rub', 'lift', 'cut', 'turn', 'fold', 'stretch', 'roll', 'stir', 'heat']) assert.ok(actions.has(action), `Missing ${action}`);
});

test('complex bakes fit their deadlines with real marker timing and parallel component work', t => {
  const cases = [
    ['chocolate-eclairs', 'vanilla', 'vanilla-custard', 'chocolate-coat', 'stack'],
    ['cinnamon-knots', 'cinnamon', 'cinnamon-butter', 'caramel-drizzle', 'stack'],
    ['biscuit-greenhouse', 'chocolate', 'ganache', 'chocolate-coat', 'tower'],
    ['village-celebration', 'vanilla', 'lemon-curd', 'chocolate-coat', 'tower'],
  ];
  for (const [id, flavour, filling, coating, design] of cases) {
    const b = playOnClock(recipes().find(recipe => recipe.id === id), { flavours: [flavour], filling, finish: coating, design });
    const remaining = targets(b).budget - b.elapsed;
    assert.equal(b.stage, 'judged');
    assert.ok(b.score.total >= 85, `${id}: ${b.score.total}; ${b.score.notes.join('; ')}`);
    assert.equal(b.score.timePenalty, 0, `${id}: ${b.elapsed.toFixed(1)}s / ${targets(b).budget}s`);
    assert.ok(remaining >= 0);
    t.diagnostic(`${id}: ${b.score.total}/100 in ${b.elapsed.toFixed(1)}s of ${targets(b).budget}s.`);
  }
});

test('a simple signature meeting the brief can earn 100 without ambition, fillings or coating', () => {
  const b = complete(getRecipe(0, 0), { flavours: ['vanilla'], filling: 'none', finish: 'none' });
  assert.equal(b.score.total, 100);
  for (const category of ['flavour', 'texture', 'baking', 'presentation']) assert.equal(b.score[category], 100, category);
  assert.equal(b.filling, 'none'); assert.equal(b.finish, 'none'); assert.ok(!Object.hasOwn(b, 'ambition'));
  assert.ok(!Object.hasOwn(b.score, 'maxPotential') || b.score.maxPotential === 100);
});

test('old ambition options cannot impose a ceiling or award free points', () => {
  const totals = ['classic', 'flair', 'showpiece'].map(ambition => complete(getRecipe(0, 0), { ambition, flavours: ['vanilla'], filling: 'none', finish: 'none' }).score.total);
  assert.deepEqual(totals, [100, 100, 100]);
});

test('technical recipes keep their prescribed flavours and components', () => {
  for (let week = 0; week < 6; week++) {
    const recipe = getRecipe(week, 1);
    const b = createBake(recipe, { flavours: ['coffee', 'rose'], filling: 'salted-caramel', finish: 'nut-crunch' });
    assert.equal(b.technicalLocked, true);
    assert.deepEqual(b.flavours, recipe.prescribed.flavours);
    assert.equal(b.filling, recipe.prescribed.filling);
    assert.equal(b.finish, recipe.prescribed.finish);
  }
});

test('recovering a damaged technique improves it but costs time and some delicacy', () => {
  const damaged = measured();
  runFor(damaged, .6); damaged.phase = 0; recordTechnique(damaged, currentTechnique(damaged).expected);
  const repaired = copy(damaged), elapsed = repaired.elapsed;
  recoverTechnique(repaired);
  assert.ok(repaired.elapsed >= elapsed + 5.9);
  assert.ok(repaired.recoveryDamage > 0);
  assert.equal(currentTechnique(repaired).count, 0);
  finish(damaged); finish(repaired);
  assert.ok(repaired.score.texture > damaged.score.texture);
  assert.ok(repaired.score.techniqueQuality < 100);
  assert.ok(repaired.score.notes.some(note => /reworking/i.test(note)));
});

const methodCases = [
  { id: 'garden-sponge', defect: 'dense', score: 'texture', overwork: true },
  { id: 'village-bloomer', defect: 'weakDough', score: 'texture', incomplete: true },
  { id: 'lemon-madeleines', defect: 'deflated', score: 'texture', wrongMethod: 'fold' },
  { id: 'pastry-sunburst', defect: 'lostLayers', score: 'texture', wrongMethod: 'laminate' },
  { id: 'choux-buns', defect: 'scorched', score: 'flavour', wrongMethod: 'cook' },
  { id: 'orchard-galette', defect: 'toughDough', score: 'texture', overwork: true },
];

for (const scenario of methodCases) {
  test(`${scenario.id}: method mistakes produce ${scenario.defect} and affect ${scenario.score}`, () => {
    const recipe = recipes().find(recipe => recipe.id === scenario.id);
    const good = complete(recipe), bad = measured(recipe);
    if (scenario.incomplete) finishPreparation(bad);
    else {
      prepareWithActions(bad, task => {
        if (task.type !== scenario.wrongMethod) return task.expected;
        if (task.type === 'cook') return 'heat';
        return task.actions.find(action => action.id !== task.expected).id;
      });
      if (scenario.overwork) {
        const credited = bad.techniqueScores.length;
        for (let i = 0; i < 6; i++) {
          runFor(bad, .6); bad.phase = 52.5; recordTechnique(bad, 'fold');
        }
        assert.equal(bad.techniqueScores.length, credited, 'surplus handling cannot earn more preparation credit');
      }
    }
    finish(bad);
    assert.ok(bad.defects[scenario.defect] > good.defects[scenario.defect], scenario.defect);
    assert.ok(bad.defects[scenario.defect] > 0 && bad.defects[scenario.defect] <= 100);
    assert.ok(bad.defects.rise >= 0 && bad.defects.rise <= 1);
    assert.ok(bad.score[scenario.score] < good.score[scenario.score], `${good.score[scenario.score]} vs ${bad.score[scenario.score]}`);
    assert.equal(bad.score.summary.defects[scenario.defect], bad.defects[scenario.defect]);
    if (['dense', 'weakDough', 'deflated', 'lostLayers'].includes(scenario.defect)) assert.ok(bad.defects.rise < good.defects.rise);
  });
}

function coolingOutcome(recipe, method) {
  const b = shape(prepare(measured(recipe))), target = targets(b);
  b.heat = target.temp; b.ovenTemp = target.temp; b.sides = [target.bake, target.bake];
  b.bake = target.bake; b.ovenSeconds = target.bake; b.heatError = 0;
  removeOven(b); setCooling(b, method);
  for (let i = 0; b.cool < target.cool; i++) {
    assert.ok(i < 1000); advance(b, .02);
  }
  // Finish cooling before the generic finisher, which normally selects a rack.
  finishCooling(b);
  return finish(b);
}

test('fragile custard, meringue and pastry benefit from tin support while fan cooling has consequences', () => {
  for (const id of ['vanilla-custard-tarts', 'summer-pavlova', 'orchard-galette']) {
    const recipe = recipes().find(recipe => recipe.id === id);
    const tin = coolingOutcome(recipe, 'tin'), rack = coolingOutcome(recipe, 'rack'), fan = coolingOutcome(recipe, 'fan');
    assert.ok(tin.elapsed > rack.elapsed, `${id}: tin cooling takes longer`);
    assert.ok(tin.defects.cracks < rack.defects.cracks, `${id}: tin supports the fragile bake`);
    assert.ok(fan.defects.cracks > tin.defects.cracks, `${id}: fast cooling has a visible cost`);
    assert.ok(tin.score.presentation > rack.score.presentation, `${id}: support affects presentation`);
    assert.ok(tin.score.cooling > fan.score.cooling, `${id}: fan affects cooling quality`);
  }
  const cake = coolingOutcome(getRecipe(0, 0), 'rack');
  assert.equal(cake.defects.cracks, 0);
  assert.equal(cake.score.total, 100, 'an ordinary cake is safe on the rack');
});

test('compatible flavour choices do not give free points, while clashes affect flavour', () => {
  const single = complete(getRecipe(0, 0), { flavours: ['vanilla'] });
  const compatible = complete(getRecipe(0, 0), { flavours: ['chocolate', 'vanilla'] });
  const clash = complete(getRecipe(0, 0), { flavours: ['coffee', 'berry'] });
  assert.equal(compatible.score.total, single.score.total);
  assert.ok(clash.score.flavour < compatible.score.flavour);
  assert.equal(clash.score.texture, compatible.score.texture);
  assert.ok(clash.score.notes.some(note => /compete/i.test(note)));
});

test('piling the same details into one spot lowers presentation', () => {
  const good = complete(), crowded = copy(good);
  crowded.stage = 'decorate'; crowded.score = null;
  crowded.decorations.forEach(item => { item.x = .5; item.y = .5; });
  judgeBake(crowded);
  assert.ok(crowded.score.presentation < good.score.presentation);
  assert.equal(crowded.score.flavour, good.score.flavour);
  assert.equal(crowded.score.baking, good.score.baking);
});

test('rapid taps cannot skip the preparation cadence', () => {
  const b = measured(); runFor(b, .6); b.phase = centre(currentTechnique(b).zone); recordTechnique(b, currentTechnique(b).expected);
  const once = copy(b);
  for (let i = 0; i < 10; i++) recordTechnique(b, currentTechnique(b).expected);
  assert.deepEqual({ ...b, lastFeedback: '' }, { ...once, lastFeedback: '' });
});

test('shaping can be undone and corrected before the oven', () => {
  const b = prepare(measured(getRecipe(0, 1))), start = b.shapeIndex;
  b.shapeValues[b.shapeIndex] = 0; b.phase = 53; commitShape(b);
  assert.ok(b.shapeIndex > start); undoShape(b); assert.equal(b.shapeIndex, start);
  shape(b); assert.equal(b.stage, 'bake');
});

test('an inspected underbake can return to the oven and continue cooking', () => {
  const b = shape(prepare(measured())); b.heat = targets(b).temp; runFor(b, 5); removeOven(b);
  assert.equal(b.stage, 'cool'); const previous = b.bake; returnOven(b);
  assert.equal(b.stage, 'bake'); runFor(b, 2); assert.ok(b.bake > previous);
});

test('poor ingredients, handling, shaping, oven work and cooling affect the actual score categories', () => {
  const good = complete(), poor = createBake(getRecipe(0, 0));
  while (poor.stage === 'measure') commitIngredient(poor);
  finishPreparation(poor);
  for (let i = 0; poor.stage === 'shape' && i < 30; i++) { runFor(poor, .6); poor.shapeValues[poor.shapeIndex] = 0; poor.phase = 0; commitShape(poor); }
  runFor(poor, 3); removeOven(poor); finishCooling(poor);
  if (poor.stage === 'assemble') finishAssembly(poor);
  judgeBake(poor); assert.equal(poor.stage, 'judged');
  assert.ok(good.score.total - poor.score.total >= 45);
  for (const category of ['flavour', 'texture', 'baking', 'presentation']) assert.ok(poor.score[category] < good.score[category], category);
  assert.ok(poor.score.notes.length >= 3);
});

test('overtime penalizes competition, leaves practice unchanged and never auto-submits a bake', () => {
  const onTime = complete(getRecipe(0, 0), { practice: true }), latePractice = copy(onTime);
  latePractice.stage = 'decorate'; latePractice.score = null; latePractice.elapsed = targets(latePractice).budget + 90;
  const lateCompetition = copy(latePractice); lateCompetition.practice = false;
  const practiceScore = judgeBake(latePractice), competitionScore = judgeBake(lateCompetition);
  assert.equal(practiceScore.total, onTime.score.total); assert.equal(practiceScore.timePenalty, 0);
  assert.equal(competitionScore.total, practiceScore.total - competitionScore.timePenalty); assert.equal(competitionScore.timePenalty, 25);
  const unfinished = createBake(getRecipe(0, 0)); unfinished.elapsed = targets(unfinished).budget + 120; advance(unfinished, .1);
  assert.equal(unfinished.stage, 'measure'); assert.equal(judgeBake(unfinished), null);
});

test('six full weeks produce three finalists and a champion', () => {
  const season = createSeason(2026), counts = [8, 7, 6, 5, 4, 3];
  for (let week = 0; week < 6; week++) {
    assert.equal(season.week, week); assert.equal(season.active.length, counts[week]);
    for (let round = 0; round < 3; round++) {
      assert.equal(season.round, round); const result = finishRound(season, { id: `result-${week}-${round}`, total: 100 });
      assert.equal(result.roundRanking[0].id, 'you'); assert.equal(result.final, week === 5 && round === 2);
      if (round === 2 && week < 5) assert.notEqual(result.eliminated, 'you');
    }
  }
  assert.equal(season.status, 'complete'); assert.equal(season.winner, 'you'); assert.equal(season.stars.you, 6);
  assert.equal(season.history.length, 18); assert.equal(season.scores.you.length, 18);
  assert.equal(finishRound(season, { id: 'after-final', total: 100 }), null);
});

test('elimination retries restore the exact start of the current week', () => {
  const season = createSeason(81);
  for (let round = 0; round < 3; round++) finishRound(season, { id: `first-${round}`, total: 100 });
  const startingWeek = copy(season);
  for (let round = 0; round < 3; round++) finishRound(season, { id: `second-${round}`, total: 0 });
  assert.equal(season.status, 'eliminated'); assert.equal(season.week, 1); retryWeek(season); assert.deepEqual(season, startingWeek);
  for (let round = 0; round < 3; round++) finishRound(season, { id: `retry-${round}`, total: 100 });
  assert.equal(season.week, 2); assert.equal(season.history.length, 6);
});

test('judging and score submission are idempotent across JSON saves', () => {
  const b = complete(), judged = copy(b); assert.deepEqual(judgeBake(b), b.score); assert.deepEqual(b, judged);
  const season = createSeason(10), first = finishRound(season, b.score), saved = copy(season);
  assert.deepEqual(finishRound(saved, copy(b.score)), first); assert.equal(saved.round, 1);
  assert.equal(saved.history.length, 1); assert.equal(saved.scores.you.length, 1);
});

test('returned results cannot mutate stored history or idempotency snapshots', () => {
  const season = createSeason(91), score = { id: 'snapshot-result', total: 87 }, result = finishRound(season, score), expected = copy(result);
  result.roundRanking[0].score = -999; result.weekRanking.length = 0; score.total = 0;
  assert.deepEqual(season.history[0], expected); assert.deepEqual(finishRound(season, score), expected);
});

test('rivals are deterministic, diverse and limited to the current field', () => {
  const left = createSeason(411), right = createSeason(411);
  const a = finishRound(left, { id: 'left', total: 79 }), b = finishRound(right, { id: 'right', total: 79 });
  assert.deepEqual(a.roundRanking, b.roundRanking); assert.equal(a.roundRanking.length, RIVALS.length + 1);
  assert.ok(new Set(a.roundRanking.map(entry => entry.score)).size > 3);
  for (let i = 0; i < 2; i++) finishRound(left, { id: `advance-${i}`, total: 100 });
  assert.equal(finishRound(left, { id: 'next-week', total: 79 }).roundRanking.length, RIVALS.length);
});

test('invalid or stalled frame deltas are safe and judged work stays frozen', () => {
  const b = createBake(getRecipe(0, 0)), before = copy(b);
  for (const dt of [-1, 0, NaN, Infinity, -Infinity]) advance(b, dt, 'pour'); assert.deepEqual(b, before);
  advance(b, 10000, 'pour'); assert.ok(b.elapsed > 0 && b.elapsed <= 1); assert.ok(b.amount <= getRecipe(0, 0).ingredients[0].target / 4);
  const done = complete(), saved = copy(done); advance(done, 1, 'mix'); assert.deepEqual(done, saved);
});

test('unfinished v2 work round-trips and resumes deterministically', () => {
  const b = measured(getRecipe(2, 1)); runFor(b, .6); b.phase = centre(currentTechnique(b).zone); recordTechnique(b, currentTechnique(b).expected);
  const resumed = copy(b); advance(b, .7); advance(resumed, .7); assert.deepEqual(resumed, b); assert.deepEqual(targets(resumed), targets(b));
});

test('every legacy stage migrates without losing measures, time, identity or a judged result', () => {
  for (const stage of ['measure', 'mix', 'shape', 'bake', 'cool', 'decorate', 'judged']) {
    const old = legacyBake(stage), source = { version: 1, records: { saved: 88 }, customSetting: 'keep', run: { week: 0, round: 0, bake: copy(old) } };
    const migrated = migrateSave(source), b = migrated.run.bake;
    assert.equal(migrated.version, 2); assert.equal(migrated.customSetting, 'keep'); assert.deepEqual(migrated.records, { saved: 88 });
    assert.equal(b.id, old.id); assert.equal(b.recipeId, old.recipeId); assert.equal(b.stage, stage === 'mix' ? 'prepare' : stage);
    assert.deepEqual(b.measurements, old.measurements); assert.equal(b.elapsed, old.elapsed);
    if (stage === 'measure') assert.equal(b.amount, 37);
    if (stage === 'judged') assert.deepEqual(b, old);
    assert.deepEqual(migrateSave(copy(migrated)), migrated, `${stage} migration is idempotent`);
  }
});

test('migration preserves historical results, duplicate guards and retry checkpoints', () => {
  const season = createSeason(334);
  for (let round = 0; round < 3; round++) finishRound(season, { id: `old-first-${round}`, total: 100 });
  const weekStart = copy(season), b = legacyBake('judged'), result = finishRound(season, b.score), before = copy(season);
  const migrated = migrateSave({ version: 1, season, run: { bake: b, result } });
  assert.deepEqual(migrated.run.bake, b); assert.deepEqual(migrated.run.result, result);
  assert.deepEqual(migrated.season.history, before.history); assert.deepEqual(migrated.season.scores, before.scores);
  assert.deepEqual(finishRound(migrated.season, copy(b.score)), result); assert.equal(migrated.season.history.length, before.history.length);
  retryWeek(migrated.season); assert.deepEqual(migrated.season.history, weekStart.history); assert.deepEqual(migrated.season.active, weekStart.active);
  assert.equal(migrated.season.week, 1); assert.equal(migrated.season.round, 0);
});

test('partially mixed legacy work is credited and resumes to a complete bake', () => {
  const old = legacyBake('mix');
  const migrated = migrateSave({ version: 1, run: { bake: old } }).run.bake;
  assert.ok(migrated.techniqueScores.length > 0);
  assert.ok(migrated.techniqueScores.length < targets(migrated).preparation);
  const resumed = copy(migrated);
  finish(migrated); finish(resumed);
  assert.deepEqual(migrated.score, resumed.score);
  assert.equal(migrated.stage, 'judged');
  assert.ok(Number.isFinite(migrated.score.total));
});

test('legacy oven and cooling progress preserve proportions when recipe timings change', () => {
  const recipe = getRecipe(0, 0);
  for (const [ambition, factor] of [['classic', 1], ['flair', 1.12], ['showpiece', 1.25]]) {
    const old = legacyBake('bake'); old.ambition = ambition;
    old.bake = recipe.legacyBakeTime * factor * .4;
    const migrated = migrateSave({ version: 1, run: { bake: old } }).run.bake;
    assert.ok(Math.abs(migrated.bake / targets(migrated).bake - .4) < 1e-8, `${ambition} oven fraction`);
    assert.ok(migrated.sides.every(side => Math.abs(side / targets(migrated).bake - .4) < 1e-8));
  }
  const old = legacyBake('cool'); old.cool = recipe.legacyCoolTime / 2;
  const migrated = migrateSave({ version: 1, run: { bake: old } }).run.bake;
  assert.ok(Math.abs(migrated.cool / targets(migrated).cool - .5) < 1e-8);
});

// ---- Deeper baking ---------------------------------------------------------

function measuredWith(recipe, roleRatios = {}, options = {}) {
  const b = createBake(recipe, options);
  while (b.stage === 'measure') {
    const item = recipe.ingredients[b.ingredient];
    b.amount = item.target * (roleRatios[item.role] ?? 1); commitIngredient(b);
  }
  return b;
}

test('every ingredient has a role, and mis-measures cause the matching fault', () => {
  for (const recipe of recipes()) for (const item of recipe.ingredients) assert.ok(item.role, `${recipe.id}: ${item.name}`);
  const sponge = getRecipe(0, 0), good = complete(sponge);
  const risen = finish(measuredWith(sponge, { flour: 1.3 }));
  assert.ok(risen.defects.sunk > 8, 'too much self-raising flour sinks the middle');
  assert.ok(risen.score.notes.some(note => /raising agent/i.test(note)));
  assert.ok(risen.score.texture < good.score.texture && risen.score.presentation < good.score.presentation);
  const lean = finish(measuredWith(sponge, { fat: .75 }));
  assert.ok(lean.defects.crumbly > 8 && /crumbly/i.test(lean.score.notes.join(' ')));
  // Extra sugar browns sooner: the same oven time colours it further.
  const sweet = shape(prepare(measuredWith(sponge, { sugar: 1.25 }))), plain = shape(prepare(measuredWith(sponge)));
  for (const b of [sweet, plain]) { b.heat = targets(b).temp; runFor(b, 10); }
  assert.ok(sweet.bake > plain.bake * 1.05, `${sweet.bake} vs ${plain.bake}`);
  const salty = finish(measuredWith(getRecipe(2, 0), { salt: 1.5 }));
  assert.ok(salty.defects.saltOff > 8 && salty.score.flavour < complete(getRecipe(2, 0)).score.flavour);
});

test('proving is judged by when the baker calls it: too soon tears, too late collapses', () => {
  const recipe = getRecipe(2, 0), outcome = wait => {
    const b = measured(recipe);
    for (let i = 0; i < 100; i++) {
      const step = currentTechnique(b);
      if (step.done) break;
      if (step.rest) runFor(b, step.restTarget * wait); else { runFor(b, .6); b.phase = centre(step.zone); }
      recordTechnique(b, step.expected);
    }
    return finish(b);
  };
  const early = outcome(.4), right = outcome(1.05), late = outcome(1.8);
  assert.ok(early.defects.underProved > 25 && /under-proved/i.test(early.score.notes.join(' ')));
  assert.ok(late.defects.overProved > 25 && /over-proved/i.test(late.score.notes.join(' ')));
  assert.equal(right.defects.underProved + right.defects.overProved, 0);
  assert.ok(right.score.total - early.score.total >= 10 && right.score.total - late.score.total >= 8, `${right.score.total} ${early.score.total} ${late.score.total}`);
  assert.ok(early.defects.rise < right.defects.rise);
});

test('component work carries on while dough proves', () => {
  const b = measured(recipes().find(r => r.id === 'cinnamon-knots'), { filling: 'cinnamon-butter' });
  for (let i = 0; !currentTechnique(b).rest; i++) { assert.ok(i < 100); const step = currentTechnique(b); runFor(b, .6); b.phase = centre(step.zone); recordTechnique(b, step.expected); }
  runFor(b, .7); b.phase = 52.5; workComponent(b);
  assert.equal(currentComponent(b).count, 1);
});

test('a wet filling in an unsealed case gives a soggy bottom; blind baking or a low shelf saves it', () => {
  const recipe = getRecipe(4, 1), bakeAt = (seal, shelf = 'middle') => {
    const b = shape(prepare(measured(recipe))), t = targets(b);
    if (seal) blindBake(b);
    b.heat = t.temp; b.ovenTemp = t.temp; setShelf(b, shelf);
    for (let i = 0; b.bake < t.bake; i++) { assert.ok(i < 5000); if (!b.rotations && b.bake > t.bake / 2) rotateBake(b); advance(b, .05); }
    removeOven(b); return finish(b);
  };
  const soggy = bakeAt(false), sealed = bakeAt(true), low = bakeAt(false, 'bottom');
  assert.ok(needsBlindBake(soggy));
  assert.ok(soggy.defects.soggy > 20, `soggy ${soggy.defects.soggy}`);
  assert.equal(sealed.defects.soggy, 0);
  assert.ok(low.defects.soggy < soggy.defects.soggy);
  assert.ok(sealed.score.baking - soggy.score.baking >= 10);
  assert.match(soggy.score.comments[1].text, /soggy bottom/i);
  assert.ok(!needsBlindBake(createBake(getRecipe(0, 0))), 'sponges have no case to seal');
});

test('steam early gives bread spring; steam left in dulls the crust', () => {
  const loaf = steamUntil => {
    const b = shape(prepare(measured(getRecipe(2, 0)))), t = targets(b);
    b.heat = t.temp; b.ovenTemp = t.temp; setSteam(b, true);
    for (let i = 0; b.bake < t.bake; i++) { assert.ok(i < 5000); if (b.steam && b.bake >= t.bake * steamUntil) setSteam(b, false); advance(b, .05); }
    removeOven(b); return finish(b);
  };
  const early = loaf(.45), always = loaf(2);
  assert.ok(early.defects.spring > .9 && early.defects.dullCrust === 0);
  assert.ok(always.defects.dullCrust > 8 && always.score.baking < early.score.baking);
});

test('flavour strength and sweetness balance are judged', () => {
  const sponge = getRecipe(0, 0);
  const rose = strength => complete(sponge, { flavours: ['rose'], strength }).score;
  assert.ok(rose('bold').flavour < rose('balanced').flavour && /overpowering/i.test(rose('bold').notes.join(' ')));
  const coffee = complete(sponge, { flavours: ['coffee'], strength: 'subtle' }).score;
  assert.ok(/barely comes through/i.test(coffee.notes.join(' ')));
  const cloying = complete(composeRecipe({ base: 'sponge', form: 'layer-cake', sweetness: 2, week: 0, round: 0 }), { flavours: ['vanilla'], filling: 'buttercream', finish: 'icing' }).score;
  assert.ok(/cloying/i.test(cloying.notes.join(' ')));
});

// ---- Freedom ---------------------------------------------------------------

test('every base and form composes into a playable bake that can score highly', t => {
  let count = 0;
  for (const base of Object.keys(BASES)) for (const form of BASES[base].forms) {
    const recipe = composeRecipe({ base, form, sweetness: 1, richness: -1, inclusion: 'nuts' });
    assert.ok(recipe.custom && recipe.ingredients.every(item => item.role));
    const b = complete(recipe, { flavours: [recipe.flavours[0]], filling: recipe.fillings[0], finish: recipe.finishes[0], practice: true });
    assert.equal(b.stage, 'judged');
    assert.ok(b.score.total >= 85, `${recipe.id}: ${b.score.total}; ${b.score.notes.join('; ')}`);
    count++;
  }
  t.diagnostic(`${count} base × form combinations played`);
  assert.ok(count >= 30);
});

test('tweaks rewrite real quantities and saves carry the creation', () => {
  const plain = composeRecipe({ base: 'sponge', form: 'loaf' }), sweet = composeRecipe({ base: 'sponge', form: 'loaf', sweetness: 2, richness: -2, inclusion: 'chocolate' });
  const sugar = r => r.ingredients.find(item => item.role === 'sugar').target, fat = r => r.ingredients.find(item => item.role === 'fat').target;
  assert.ok(sugar(sweet) > sugar(plain) && fat(sweet) < fat(plain));
  assert.ok(sweet.ingredients.some(item => item.role === 'inclusion'));
  const b = measured(sweet), saved = copy(b);
  assert.deepEqual(recipeFor(saved), recipeFor(b));
  assert.equal(recipeFor(saved).custom, true);
});

test('briefs constrain creations, presets always comply, and ignoring a brief costs points', () => {
  for (let week = 0; week < 6; week++) for (let round = 0; round < 3; round++) {
    for (const recipe of getRoundRecipes(week, round)) assert.deepEqual(briefIssues(recipe, BRIEFS[week][round]), [], recipe.id);
    if (round !== 1) assert.ok(Object.keys(BASES).some(base => formsFor(base, BRIEFS[week][round]).length), `week ${week} round ${round} has a creation`);
  }
  assert.deepEqual(formsFor('lean', BRIEFS[0][0]), [], 'no bread in cake week');
  const offBrief = complete(composeRecipe({ base: 'sponge', form: 'layer-cake', week: 2, round: 0 }), { flavours: ['vanilla'] });
  assert.equal(offBrief.score.briefPenalty, 10);
  assert.ok(offBrief.score.notes.some(note => /brief asked for bread/i.test(note)));
});

// ---- Presentation ----------------------------------------------------------

test('presentation follows what is visible: deliberate, relevant details beat bunched or misleading ones', () => {
  const ring = patternPoints('ring', 350, 250, 6).map(p => ({ x: (p.x - 100) / 500, y: (p.y - 150) / 200, type: 'raspberry' }));
  const bunched = ring.map((item, i) => ({ ...item, x: .15 + i * .015, y: .5 }));
  const scattered = ring.map((item, i) => ({ ...item, x: [.2, .26, .7, .45, .9, .31][i], y: [.2, .8, .3, .9, .5, .45][i] }));
  const look = decorations => analysePresentation({ decorations, flavours: ['raspberry'], defects: {} }, 6);
  assert.ok(look(ring).decoration > look(bunched).decoration + 15);
  assert.ok(look(ring).decoration > look(scattered).decoration);
  assert.ok(look(ring).notes.good.some(note => /tells you/.test(note)));
  const lemons = ring.map(item => ({ ...item, type: 'lemon' }));
  assert.ok(look(lemons).decoration > analysePresentation({ decorations: lemons, flavours: ['coffee'], defects: {} }, 6).decoration, 'lemon slices mislead on a coffee bake');
});

test('a flaw costs presentation exactly when the illustration draws it', () => {
  for (const [key, below, above] of [['cracks', 3, 30], ['soggy', 10, 40], ['sunk', 8, 40], ['ooze', 12, 50]]) {
    const hidden = { [key]: below }, shown = { [key]: above };
    assert.equal(flawReport(hidden).penalty, 0, `${key} below threshold is free`);
    assert.ok(flawReport(shown).penalty > 0, `${key} above threshold costs`);
    const svg = defects => foodSVG({ kind: 'cake', recipeId: 'garden-sponge', defects }).replace(/vb-art-\d+/g, '');
    assert.equal(svg(hidden), svg({}), `${key} below threshold is not drawn`);
    assert.notEqual(svg(shown), svg({}), `${key} above threshold is drawn`);
  }
});

test('decorating patterns, moves, turns and removals are real, timed actions', () => {
  const b = finish(measured(getRecipe(0, 0)), { decorate: false });
  b.stage = 'decorate'; b.score = null;
  const before = b.elapsed;
  placeDecorations(b, patternPoints('ring', 350, 230, 5).map(p => ({ x: (p.x - 100) / 500, y: (p.y - 150) / 200, type: 'rosette', colour: '#a9c08f' })));
  assert.equal(b.decorations.length, 5);
  assert.ok(b.elapsed > before && b.decorations.every(item => item.colour === '#a9c08f' && item.quality === b.decorations[0].quality));
  moveDecoration(b, 0, { x: .4, y: .4 }); updateDecoration(b, 0, { angle: 30, size: 1.3 });
  assert.deepEqual([b.decorations[0].x, b.decorations[0].y, b.decorations[0].angle, b.decorations[0].size], [.4, .4, 30, 1.3]);
  removeDecoration(b, 1); assert.equal(b.decorations.length, 4);
});

test('a cake built without a crumb coat shows crumbs in its coating', () => {
  const recipe = composeRecipe({ base: 'sponge', form: 'layer-cake', week: 0, round: 0 }), options = { flavours: ['vanilla'], filling: 'buttercream', finish: 'icing' };
  const coated = complete(recipe, options), bare = measured(recipe, options);
  prepare(bare); shape(bare);
  const t = targets(bare); bare.heat = t.temp; bare.ovenTemp = t.temp; bare.sides = [t.bake, t.bake]; bare.bake = t.bake; bare.ovenSeconds = t.bake; removeOven(bare);
  setCooling(bare, 'rack'); components(bare); runFor(bare, t.cool); finishCooling(bare);
  for (let i = 0; bare.assemblyIndex < t.parts; i++) { runFor(bare, .6); bare.phase = 52.5; bare.alignment = 50; assemble(bare, 'spread'); runFor(bare, .6); bare.phase = 52.5; assemble(bare, 'place'); }
  finishAssembly(bare); finish(bare);
  assert.ok(needsCrumbCoat(bare) && bare.defects.crumbs > 10 && coated.defects.crumbs === 0);
  assert.ok(bare.score.presentation < coated.score.presentation);
});

// ---- Competition -----------------------------------------------------------

test('rivals bake real recipes, and their categories, bakes and mishaps follow their profiles', () => {
  const season = createSeason(5150), result = finishRound(season, { id: 'r', total: 80, summary: { recipeId: 'garden-sponge' } });
  for (const entry of result.roundRanking.filter(row => row.id !== 'you')) {
    const { detail } = entry;
    assert.ok(detail.bake.name && detail.bake.flavours.length && detail.verdict.text);
    assert.ok(Math.abs(Object.values(detail.categories).reduce((a, b) => a + b, 0) / 4 - detail.total) <= 1.5 || detail.total === 98 || detail.total === 40);
    assert.equal(entry.score, detail.total);
  }
  assert.deepEqual(JSON.parse(JSON.stringify(result)), result, 'rival details are JSON-safe');
  // Across many seasons, Arthur's pastry mishaps are always about lamination.
  let arthur = 0;
  for (let seed = 0; seed < 120; seed++) {
    const s = createSeason(seed); s.week = 3; s.round = 0;
    const row = finishRound(s, { id: `p${seed}`, total: 80 }).roundRanking.find(entry => entry.id === 'arthur');
    if (row.detail.mishap) { arthur++; assert.match(row.detail.mishap, /layers/); assert.ok(row.detail.bake.defects.lostLayers > 0); }
  }
  assert.ok(arthur > 5, 'weaknesses show up in their weak week');
  // Technicals: everyone bakes the same recipe.
  const technical = createSeason(9); technical.round = 1;
  const techResult = finishRound(technical, { id: 't', total: 80, summary: { recipeId: 'lemon-madeleines' } });
  assert.ok(techResult.roundRanking.filter(row => row.detail).every(row => row.detail.bake.recipeId === 'lemon-madeleines'));
});

test('rival confidence follows results and survives a week retry', () => {
  const season = createSeason(77);
  for (let round = 0; round < 3; round++) finishRound(season, { id: `w${round}`, total: 100 });
  assert.ok(Object.keys(season.form).length >= 6);
  const star = season.history[2].star;
  if (star !== 'you') assert.ok(season.form[star] > 0);
  const snapshot = copy(season.form);
  for (let round = 0; round < 3; round++) finishRound(season, { id: `x${round}`, total: 0 });
  retryWeek(season); assert.deepEqual(season.form, snapshot);
});

// ---- Saves -----------------------------------------------------------------

test('v2 saves upgrade to v3 without inventing rests the baker never had', () => {
  const recipe = getRecipe(2, 0);
  const shaped = shape(prepare(measured(recipe))), v2 = copy(shaped);
  // A v2 bake knew nothing of the prove: strip it back to the old shape.
  v2.version = 2; v2.techniqueTasks = v2.techniqueTasks.slice(0, 2); v2.techniqueScores = v2.techniqueTasks.flatMap(task => task.scores); v2.prepIndex = 2;
  for (const key of ['restElapsed', 'shelf', 'baseOffset', 'steam', 'steamEarly', 'steamLate', 'blindBaked', 'fillingAmount', 'crumbCoated', 'strength']) delete v2[key];
  const upgraded = migrateSave({ version: 2, run: { bake: v2 } }).run.bake;
  assert.equal(upgraded.version, 3);
  assert.equal(upgraded.methodDamage.underProved, 0);
  assert.equal(upgraded.shelf, 'middle');
  assert.deepEqual(migrateSave(copy({ run: { bake: upgraded } })).run.bake, upgraded, 'upgrade is idempotent');
  finish(upgraded); assert.ok(upgraded.score.total >= 85, `${upgraded.score.total}`);
  // Mid-knead saves land back on the same task and still face the prove.
  const kneading = measured(recipe); runFor(kneading, .6); kneading.phase = 52.5; recordTechnique(kneading, currentTechnique(kneading).expected);
  const old = copy(kneading); old.version = 2;
  const resumed = migrateSave({ run: { bake: old } }).run.bake;
  assert.equal(resumed.prepIndex, 0); assert.equal(currentTechnique(resumed).count, 1);
});
