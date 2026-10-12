import * as CONTENT from './content.js';
import { briefIssues, INCLUSIONS } from './pantry.js';
import { analysePresentation } from './presentation.js';
import { simulateRival, randomFor, updateForm } from './rivals.js';

const { WEEKS, RIVALS } = CONTENT;
const clamp = (n, low = 0, high = 100) => Math.min(high, Math.max(low, Number.isFinite(n) ? n : low));
const clone = value => JSON.parse(JSON.stringify(value));
const mean = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 100;
let bakeSequence = 0;

export function getRecipe(week = 0, round = 0) {
  return WEEKS[week]?.recipes?.[round] ?? null;
}

export function recipeFor(state) {
  if (state?.customRecipe?.id) return state.customRecipe;
  return (CONTENT.ALL_RECIPES ?? WEEKS.flatMap(week => week.recipes)).find(recipe => recipe.id === state.recipeId) ?? getRecipe(0, 0);
}

const METHODS = {
  beat: { name: 'Cream the mixture', instruction: 'Beat in steady strokes. Catch the centre of the green zone for a light mixture.', sequence: ['beat'], labels: { beat: 'Beat' }, zone: [25, 80] },
  whip: { name: 'Whip in air', instruction: 'Lift air into the mixture with controlled strokes. Rushing knocks the air back out.', sequence: ['whip'], labels: { whip: 'Whip' }, zone: [30, 76] },
  rub: { name: 'Rub to fine crumbs', instruction: 'Rub the butter into the flour, then lift to aerate. Alternate your actions.', sequence: ['rub', 'lift'], labels: { rub: 'Rub in', lift: 'Lift crumbs' }, zone: [24, 82] },
  fold: { name: 'Fold gently', instruction: 'Cut through the centre, turn the bowl, then fold over. Protect the air you worked in.', sequence: ['cut', 'turn', 'fold'], labels: { cut: 'Cut through', turn: 'Turn bowl', fold: 'Fold over' }, zone: [25, 81] },
  knead: { name: 'Develop the dough', instruction: 'Stretch the dough, then fold it back. Alternate to build a springy structure.', sequence: ['stretch', 'fold'], labels: { stretch: 'Stretch', fold: 'Fold back' }, zone: [28, 80] },
  laminate: { name: 'Build pastry layers', instruction: 'Roll, fold, then turn. Keeping that order protects the separate butter layers.', sequence: ['roll', 'fold', 'turn'], labels: { roll: 'Roll out', fold: 'Fold thirds', turn: 'Quarter turn' }, zone: [28, 76] },
  cook: { name: 'Cook the base', instruction: 'Stir the base, then apply heat. Alternate to cook it evenly without catching.', sequence: ['stir', 'heat'], labels: { stir: 'Stir', heat: 'Apply heat' }, zone: [24, 80] },
  // Rests are judged by when the baker calls them ready, not by rhythm.
  prove: { name: 'Prove the dough', instruction: 'Leave it somewhere warm. It is ready when nearly doubled and it springs back slowly. Work on your filling meanwhile.', sequence: ['ready'], labels: { ready: 'It’s proved' }, zone: [0, 100], rest: true, window: [.9, 1.22] },
  chill: { name: 'Chill the pastry', instruction: 'Rest it in the fridge so the butter firms up. Pull it too soon and the butter smears.', sequence: ['ready'], labels: { ready: 'Out of the fridge' }, zone: [0, 100], rest: true, window: [.9, 2.2] },
};
export const REST_WINDOW = Object.fromEntries(Object.entries(METHODS).filter(([, method]) => method.rest).map(([id, method]) => [id, method.window]));

function recipeSteps(recipe) {
  return recipe.steps?.length ? recipe.steps : [{ type: recipe.prepLabel === 'Knead' ? 'knead' : recipe.prepLabel === 'Fold' ? 'fold' : 'beat', cycles: 3 }];
}

function methodFor(step) { return METHODS[step?.type] ?? METHODS.beat; }
function actionCount(step) { return Math.max(1, step.cycles ?? 3) * methodFor(step).sequence.length; }
function componentFor(id) {
  const catalog = CONTENT.COMPONENTS ?? [];
  return Array.isArray(catalog) ? catalog.find(component => component.id === id) : catalog[id];
}
function decorationFor(id) {
  const catalog = CONTENT.DECORATIONS ?? {};
  return Array.isArray(catalog) ? catalog.find(item => item.id === id) : catalog[id];
}
function briefFor(recipe) {
  if (recipe.custom) return Number.isInteger(recipe.week) ? CONTENT.BRIEFS?.[recipe.week]?.[recipe.roundIndex ?? 0] ?? {} : {};
  for (let week = 0; week < WEEKS.length; week++) {
    const round = ['Signature', 'Technical', 'Showstopper'].indexOf(recipe.round);
    const candidates = CONTENT.getRoundRecipes?.(week, round) ?? WEEKS[week].recipes;
    if (candidates.some(candidate => candidate.id === recipe.id)) return CONTENT.BRIEFS?.[week]?.[Math.max(0, round)] ?? {};
  }
  return {};
}

function budgetFor(recipe) {
  return recipe.budget;
}

export function targets(state) {
  const recipe = recipeFor(state);
  const brief = briefFor(recipe);
  const parts = Math.max(recipe.assemblyParts ?? 1, brief.minParts ?? 1) + (state.design === 'tower' ? 1 : 0);
  return {
    mix: recipe.mixTarget ?? 10,
    temp: recipe.temp ?? 180,
    bake: recipe.bakeTime ?? 35,
    cool: recipe.coolTime ?? 10,
    decor: Math.max(recipe.decorTarget ?? 3, brief.minDecor ?? 0),
    parts, pieces: Math.max(1, recipe.pieces ?? 3),
    shape: recipe.shapeTarget ?? 60,
    icing: 12,
    budget: budgetFor(recipe),
    preparation: recipeSteps(recipe).reduce((sum, step) => sum + actionCount(step), 0),
  };
}

export function createBake(recipe = getRecipe(0, 0), options = {}) {
  if (!recipe?.id) recipe = getRecipe(0, 0);
  const prescribed = recipe.prescribed;
  const requestedFlavours = options.flavours ?? (options.flavour ? [options.flavour] : [recipe.flavours?.[0] ?? 'vanilla']);
  const knownFlavours = CONTENT.FLAVOURS ?? {};
  let flavours = [...new Set(requestedFlavours)].filter(id => knownFlavours[id]).slice(0, 2);
  if (!flavours.length) flavours = [recipe.flavours?.[0] ?? 'vanilla'];
  let filling = options.filling ?? 'none';
  let finish = options.finish ?? 'none';
  if (filling !== 'none' && !componentFor(filling)) filling = 'none';
  if (finish !== 'none' && !componentFor(finish)) finish = 'none';
  if (prescribed) {
    flavours = [...prescribed.flavours];
    filling = prescribed.filling ?? 'none';
    finish = prescribed.finish ?? 'none';
  }
  const design = ['stack', 'wreath', 'tower'].includes(options.design) ? options.design : recipe.defaultDesign ?? 'stack';
  const strength = !prescribed && ['subtle', 'balanced', 'bold'].includes(options.strength) ? options.strength : 'balanced';
  const pieces = Math.max(1, recipe.pieces ?? 3);
  const state = {
    version: 3, id: `bake-${Date.now().toString(36)}-${++bakeSequence}`,
    recipeId: recipe.id, ...(recipe.custom ? { customRecipe: clone(recipe) } : {}),
    flavours, flavour: flavours[0], filling, finish, design, strength,
    choices: { flavours: [...flavours], filling, finish, design, strength },
    practice: !!options.practice, technicalLocked: !!prescribed,
    budget: budgetFor(recipe, filling, finish, design),
    stage: 'measure', ingredient: 0, amount: 0, measurements: [], pourRate: 65, flowVelocity: 0,
    prepIndex: 0, prepAction: 0, techniqueTasks: [], techniqueScores: [], techniqueLog: [], actions: [], restElapsed: 0,
    prepareComplete: false, preparationFinished: false, extraPrepActions: 0,
    methodDamage: { dense: 0, weakDough: 0, lostLayers: 0, deflated: 0, scorched: 0, toughDough: 0 },
    mix: 0, phase: 50, phaseDirection: 1, nextTechniqueAt: 0,
    recoveryDamage: 0, recoveries: 0, wastedIngredients: 0,
    shape: 0, shapeValues: Array.from({ length: pieces }, (_, i) => clamp((recipe.shapeTarget ?? 60) + (i % 2 ? -22 : 19) + i * 2)),
    shapeIndex: 0, shapeScores: [], shapeZone: [28, 78], nextShapeAt: 0,
    heat: 180, ovenTemp: 180, bake: 0, sides: [0, 0], heatError: 0, ovenSeconds: 0,
    rotations: 0, lastRotationAt: -10, rebakes: 0,
    shelf: 'middle', baseOffset: 0, steam: false, steamEarly: 0, steamLate: 0, blindBaked: false,
    fillingAmount: 50, crumbCoated: false,
    componentProgress: { filling: 0, finish: 0 }, componentScores: { filling: [], finish: [] }, nextComponentAt: 0, icing: 0,
    cool: 0, coolMethod: 'rack', coolingCracks: 0, coolingDryness: 0,
    assemblyIndex: 0, alignment: 32, assemblySpread: false, assemblyScores: [], assemblyAlignments: [], assemblyZone: [25, 80], nextAssemblyAt: 0,
    stability: 100, decorations: [], elapsed: 0, score: null,
    defects: { uneven: 0, cracks: 0, dry: 0, slumped: 0, burnt: 0, pale: 100, lean: 0, sides: [0, 0] },
    lastFeedback: 'Your recipe is ready. Start with the first ingredient.',
  };
  return state;
}

function tell(state, message) { state.lastFeedback = message; return state; }
function log(state, type, details = {}) { state.actions.push({ type, at: Math.round(state.elapsed * 10) / 10, ...details }); }
function ingredientTarget(state) {
  const ingredient = recipeFor(state).ingredients[state.ingredient];
  return ingredient?.target ?? ingredient?.amount ?? 100;
}
function timingQuality(phase, zone) {
  const middle = (zone[0] + zone[1]) / 2;
  const inside = phase >= zone[0] && phase <= zone[1];
  return clamp(100 - Math.abs(phase - middle) * (inside ? 0.36 : 1.7));
}
function stepPhase(state, seconds) {
  let phase = state.phase + state.phaseDirection * 60 * seconds;
  if (phase > 100) { phase = 200 - phase; state.phaseDirection = -1; }
  if (phase < 0) { phase = -phase; state.phaseDirection = 1; }
  state.phase = clamp(phase);
}
function fragileRecipe(recipe) {
  return ['custard', 'meringue'].includes(recipe.method) || (recipe.method === 'rub' && ['tart', 'pie'].includes(recipe.family));
}
function updateMethodDamage(state) {
  const recipe = recipeFor(state);
  const damage = { dense: 0, weakDough: 0, lostLayers: 0, deflated: 0, scorched: 0, toughDough: 0, underProved: 0, overProved: 0, shrunk: 0, spread: 0 };
  for (const [index, step] of recipeSteps(recipe).entries()) {
    const task = state.techniqueTasks[index] ?? { scores: [], errors: 0 };
    if (methodFor(step).rest) {
      const ratio = task.ratio ?? (state.preparationFinished ? 0 : null);
      if (ratio === null) continue;
      const [low, high] = methodFor(step).window;
      if (step.type === 'prove') {
        damage.underProved += Math.max(0, low - ratio) * 160;
        damage.overProved += Math.max(0, ratio - high) * 150;
      } else {
        const short = Math.max(0, low - ratio) * 120;
        if (recipe.method === 'laminate') damage.lostLayers += short;
        else if (recipe.kind === 'biscuit') damage.spread += short;
        else damage.shrunk += short;
      }
      continue;
    }
    const total = actionCount(step);
    const missing = state.preparationFinished ? 1 - task.scores.length / total : 0;
    const roughness = task.scores.length ? 100 - mean(task.scores) : 0;
    const wrongOrder = (task.errors ?? 0) / total;
    if (step.type === 'knead') damage.weakDough += missing * 85 + roughness * 0.45;
    if (step.type === 'laminate') damage.lostLayers += missing * 80 + roughness * 0.4 + wrongOrder * 45;
    if (step.type === 'rub') {
      damage.dense += roughness * 0.2 + missing * 25;
      if (['pastry', 'tart', 'pie'].includes(recipe.family)) damage.lostLayers += roughness * 0.25 + wrongOrder * 30;
    }
    if (step.type === 'beat') damage.dense += roughness * 0.22 + missing * 40;
    if (step.type === 'whip') damage.deflated += roughness * 0.45 + missing * 80;
    if (step.type === 'fold') {
      if (['foam', 'meringue'].includes(recipe.method)) damage.deflated += roughness * 0.3 + wrongOrder * 45 + missing * 20;
      else if (recipe.method === 'knead') damage.weakDough += roughness * 0.18 + missing * 12;
      else damage.dense += roughness * 0.18 + wrongOrder * 20;
    }
    if (step.type === 'cook') {
      const excessiveHeat = state.techniqueLog.filter(entry => !entry.extra && entry.step === index && entry.action === 'heat' && entry.expected === 'stir').length;
      damage.scorched += excessiveHeat / total * 110 + roughness * 0.18;
      damage.dense += missing * 35;
    }
  }
  const extra = state.extraPrepActions ?? 0;
  if (recipe.method === 'knead') damage.toughDough += extra * 5;
  else if (recipe.method === 'laminate') damage.lostLayers += extra * 7;
  else if (recipe.method === 'rub') { damage.toughDough += extra * 5; damage.dense += extra * 3; }
  else if (['foam', 'meringue'].includes(recipe.method)) damage.deflated += extra * 7;
  else damage.dense += extra * 6;
  state.methodDamage = Object.fromEntries(Object.entries(damage).map(([key, value]) => [key, clamp(value)]));
}
// Average measuring error for each ingredient role, e.g. { sugar: .12 } for 12% heavy.
export function roleDeviations(state, recipe = recipeFor(state)) {
  const groups = {};
  recipe.ingredients.forEach((item, index) => {
    const ratio = state.measurements[index];
    if (Number.isFinite(ratio)) (groups[item.role ?? 'flavour'] ??= []).push(ratio - 1);
  });
  const deviations = Object.fromEntries(Object.entries(groups).map(([role, values]) => [role, values.reduce((sum, value) => sum + value, 0) / values.length]));
  // Self-raising flour carries its raising agent with it.
  if (deviations.leaven === undefined && recipe.ingredients.some(item => /self-raising/i.test(item.name))) deviations.leaven = deviations.flour;
  return deviations;
}
const over = (value, tolerance = .06) => Math.max(0, (value ?? 0) - tolerance);
const under = (value, tolerance = .06) => Math.max(0, -(value ?? 0) - tolerance);
function ratioEffects(state, recipe) {
  const dev = roleDeviations(state, recipe);
  const effects = {
    sticky: over(dev.sugar) * 320, greasy: over(dev.fat) * 300,
    crumbly: under(dev.fat) * 260 + under(dev.egg) * 220,
    sunk: over(dev.leaven, .1) * 380, flat: under(dev.leaven, .1) * 260,
    slack: over(dev.liquid) * 300 + under(dev.flour) * 260,
    dryMix: under(dev.liquid) * 260 + over(dev.flour) * 260,
    saltOff: (over(dev.salt, .15) + under(dev.salt, .15)) * 200,
    spread: recipe.kind === 'biscuit' ? over(dev.fat) * 200 + over(dev.sugar) * 160 : 0,
  };
  return Object.fromEntries(Object.entries(effects).map(([key, value]) => [key, clamp(value)]));
}
function componentById(id) { return id && id !== 'none' ? componentFor(id) : null; }
export function needsBlindBake(state) {
  const recipe = recipeFor(state);
  return !!recipe.needsCase;
}
function wetCase(state, recipe) { return recipe.method === 'custard' || !!componentById(state.filling)?.wet; }
export function needsCrumbCoat(state) {
  const recipe = recipeFor(state);
  return ['cake', 'construction'].includes(recipe.family) && recipe.kind === 'cake' && !!componentById(state.finish)?.coat && targets(state).parts > 1;
}
function updateDefects(state) {
  updateMethodDamage(state);
  const recipe = recipeFor(state);
  const target = targets(state);
  const ratio = ratioEffects(state, recipe);
  const sides = state.sides.map(side => side / target.bake);
  const doneness = mean(sides);
  const spread = state.shapeValues.length ? Math.max(...state.shapeValues) - Math.min(...state.shapeValues) : 0;
  const shaped = state.shapeScores.length ? 100 - mean(state.shapeScores) : spread * 0.5;
  const baked = state.bakeDoneness !== undefined;
  const baseRatio = (mean(state.sides) + (state.baseOffset ?? 0)) / target.bake + (state.blindBaked ? .25 : 0);
  const soggy = baked && recipe.needsCase ? clamp(((wetCase(state, recipe) ? 1.12 : .95) - baseRatio) * 500) : 0;
  const spring = recipe.kind === 'bread' ? clamp((state.steamEarly ?? 0) / (target.bake * .3), 0, 1) : 0;
  const damage = state.methodDamage;
  const assembled = state.filling !== 'none' && state.assemblyIndex > 0;
  const finished = ['decorate', 'judged'].includes(state.stage);
  state.ratioEffects = ratio;
  state.defects = {
    ...damage,
    dense: clamp(damage.dense + ratio.flat),
    spread: clamp(damage.spread + ratio.spread),
    rise: clamp(Math.min(1, 1 - Math.max(damage.dense * 0.004, ratio.flat * .004, damage.weakDough * 0.0045, damage.deflated * 0.005, damage.lostLayers * 0.003, damage.underProved * .004, damage.overProved * .005, ratio.sunk * .004) + spring * .06), 0.42, 1),
    uneven: clamp(shaped + Math.abs(sides[0] - sides[1]) * 35),
    cracks: clamp(state.coolingCracks + Math.max(0, (state.ovenTemp ?? target.temp) - target.temp - 25) * 0.6 + ratio.crumbly * .3),
    dry: clamp(Math.max(0, doneness - 1.1) * 130 + state.coolingDryness + ratio.dryMix * .6),
    slumped: clamp((state.coolRatio !== undefined ? (0.75 - state.coolRatio) * 110 : 0) + ratio.slack * .6),
    burnt: clamp((Math.max(...sides) - 1.15) * 150),
    pale: clamp((0.85 - Math.min(...sides)) * 130),
    lean: clamp(mean(state.assemblyAlignments.length ? state.assemblyAlignments : [50]) - 50, -50, 50) * 0.36,
    sunk: ratio.sunk, sticky: ratio.sticky, greasy: ratio.greasy, crumbly: ratio.crumbly, saltOff: ratio.saltOff,
    soggy, burntBase: baked ? clamp((baseRatio - (state.blindBaked ? 1.6 : 1.38)) * 150) : 0,
    dullCrust: recipe.kind === 'bread' ? clamp(((state.steamLate ?? 0) - 4) * 6) : 0, spring,
    ooze: assembled ? clamp(((state.fillingAmount ?? 50) - 70) * 2.2 + ((state.fillingAmount ?? 50) > 55 ? Math.max(0, .9 - (state.coolRatio ?? 0)) * 80 : 0)) : 0,
    thinFilling: assembled ? clamp((25 - (state.fillingAmount ?? 50)) * 2) : 0,
    crumbs: finished && needsCrumbCoat(state) && !state.crumbCoated ? 24 : 0,
    sides,
  };
}

export function advance(state, dt, holding = null) {
  if (!state || state.stage === 'judged' || !Number.isFinite(dt) || dt <= 0) return state;
  const delta = Math.min(dt, 1);
  state.elapsed += delta;
  stepPhase(state, delta);
  const target = targets(state);
  if (state.stage === 'measure') {
    const ingredient = recipeFor(state).ingredients[state.ingredient];
    const flow = ingredient?.flow ?? 'powder';
    const inertia = { powder: 0.25, liquid: 0.13, sticky: 0.48, grain: 0.32 }[flow] ?? 0.25;
    const rate = ingredientTarget(state) / 4 * (0.15 + clamp(state.pourRate) / 100 * 1.3);
    const velocity = holding === 'pour' ? rate : 0;
    const response = 1 - Math.exp(-delta / inertia);
    state.flowVelocity += (velocity - state.flowVelocity) * response;
    state.amount = clamp(state.amount + state.flowVelocity * delta, 0, ingredientTarget(state) * 1.9);
  }
  if (state.stage === 'prepare' && currentRest(state)) state.restElapsed = (state.restElapsed ?? 0) + delta;
  if (state.stage === 'bake') {
    const recipe = recipeFor(state);
    const setPoint = clamp(state.heat, 80, 260) + Math.sin(state.ovenSeconds * 0.7) * 3;
    state.ovenTemp += clamp(setPoint - state.ovenTemp, -12 * delta, 12 * delta);
    // Extra sugar caramelises sooner; a leaner, less sweet mix takes longer to colour.
    const browning = 1 + clamp(roleDeviations(state, recipe).sugar ?? 0, -.3, .3) * .6 + (recipe.profile?.sweetness ?? 0) * .05;
    const energy = delta * Math.pow(state.ovenTemp / target.temp, 1.7) * browning;
    const shelf = SHELVES[state.shelf] ?? SHELVES.middle;
    const direction = state.rotations % 2 ? -1 : 1;
    state.sides[0] += energy * shelf.top * (1 + direction * 0.09);
    state.sides[1] += energy * shelf.top * (1 - direction * 0.09);
    state.baseOffset = (state.baseOffset ?? 0) + energy * shelf.base;
    if (state.steam) {
      if (mean(state.sides) < target.bake * .45) state.steamEarly = (state.steamEarly ?? 0) + delta;
      else state.steamLate = (state.steamLate ?? 0) + delta;
    }
    state.bake = mean(state.sides);
    state.ovenSeconds += delta;
    state.heatError += Math.max(0, Math.abs(state.ovenTemp - target.temp) - 6) * delta;
  }
  if (state.stage === 'cool') {
    const speed = { rack: 1, tin: 0.62, fan: 1.65 }[state.coolMethod] ?? 1;
    state.cool += delta * speed;
    if (state.coolMethod === 'rack' && fragileRecipe(recipeFor(state)) && state.cool < target.cool * 0.45) state.coolingCracks += delta * 3.2;
    if (state.coolMethod === 'fan') {
      state.coolingCracks += delta * (['custard', 'meringue'].includes(recipeFor(state).method) ? 3.5 : 1.4);
      state.coolingDryness += delta * 1.1;
    }
  }
  updateDefects(state);
  return state;
}

// Top colours fast and starves the base; bottom crisps the base and slows the top.
export const SHELVES = { top: { top: 1.08, base: -.3 }, middle: { top: 1, base: 0 }, bottom: { top: .94, base: .34 } };

function spendTime(state, seconds) {
  let remaining = seconds;
  while (remaining > 0.0001) { const step = Math.min(remaining, 0.25); advance(state, step); remaining -= step; }
}

export function adjustMeasure(state, amount = 'scrape') {
  if (state.stage !== 'measure') return tell(state, 'Measurements can only be adjusted at the weighing station.');
  const previous = state.amount;
  const adding = typeof amount === 'number' && Number.isFinite(amount) && amount > 0;
  const next = amount === 'reset' ? 0 : amount === 'scrape' ? previous - ingredientTarget(state) * 0.12 : previous + clamp(Number(amount), 0, ingredientTarget(state) * 0.05);
  state.flowVelocity = 0;
  state.amount = clamp(next, 0, adding ? ingredientTarget(state) * 1.9 : previous);
  state.wastedIngredients += Math.max(0, previous - state.amount) / ingredientTarget(state);
  spendTime(state, amount === 'reset' ? 3 : 1.2);
  log(state, 'adjust-measure', { removed: previous - state.amount });
  return tell(state, adding ? 'A small spoonful added. The scale is ready.' : amount === 'reset' ? 'Bowl emptied. You have time to measure again.' : 'A little excess removed. Let the scale settle.');
}

export function commitIngredient(state) {
  if (state.stage !== 'measure') return state;
  const ratio = state.amount / ingredientTarget(state);
  state.measurements.push(ratio);
  log(state, 'ingredient', { ingredient: state.ingredient, ratio });
  state.ingredient++;
  state.amount = 0;
  state.flowVelocity = 0;
  if (state.ingredient >= recipeFor(state).ingredients.length) state.stage = 'prepare';
  return tell(state, Math.abs(ratio - 1) <= 0.06 ? 'A careful measure. Nicely done.' : ratio > 1 ? 'That measure ran heavy. It will affect the balance.' : 'A light measure. Your mixture may need a little care.');
}

// Prove speed follows the yeast and salt that actually went in.
function restRate(state, step) {
  if (step.type !== 'prove') return 1;
  const dev = roleDeviations(state);
  return clamp(1 + clamp(dev.leaven ?? 0, -.4, .4) * .8 - clamp(dev.salt ?? 0, -.4, .4) * .5, .5, 1.5);
}
export function currentRest(state) {
  if (state.prepareComplete) return null;
  const step = recipeSteps(recipeFor(state))[state.prepIndex];
  if (!step || !methodFor(step).rest) return null;
  const target = Math.max(1, step.rest ?? 10), rate = restRate(state, step);
  const readiness = (state.restElapsed ?? 0) * rate / target;
  const [low, high] = methodFor(step).window;
  return { type: step.type, target, rate, readiness, window: [low, high], secondsToReady: Math.max(0, (low + .08) * target / rate - (state.restElapsed ?? 0)) };
}
function restQuality(readiness, [low, high]) {
  if (readiness < low) return clamp(100 - (low - readiness) * 170);
  if (readiness > high) return clamp(100 - (readiness - high) * 130);
  return 100;
}

export function currentTechnique(state) {
  const steps = recipeSteps(recipeFor(state));
  const step = steps[state.prepIndex];
  if (!step || state.prepareComplete) {
    const lastStep = [...steps].reverse().find(item => !methodFor(item).rest) ?? steps.at(-1);
    const method = methodFor(lastStep);
    return { type: lastStep.type, name: 'Preparation complete', instruction: 'Ready to shape. Further handling can overwork the mixture and weaken its structure.', actions: method.sequence.map(id => ({ id, label: method.labels[id] })), expected: method.sequence[(state.extraPrepActions ?? 0) % method.sequence.length], phase: state.phase, zone: [...method.zone], count: actionCount(lastStep), total: actionCount(lastStep), quality: mean(state.techniqueScores), done: true };
  }
  const method = methodFor(step);
  const scores = state.techniqueTasks[state.prepIndex]?.scores ?? [];
  const rest = currentRest(state);
  return {
    ...(rest ? { rest: true, readiness: rest.readiness, window: rest.window, restTarget: rest.target, secondsToReady: rest.secondsToReady } : {}),
    type: step.type, name: method.name, instruction: method.instruction,
    actions: method.sequence.map(id => ({ id, label: method.labels[id] })),
    expected: method.sequence[state.prepAction % method.sequence.length],
    phase: state.phase, zone: [...method.zone], count: state.prepAction, total: actionCount(step),
    quality: mean(scores), done: false,
  };
}

export function recordTechnique(state, action) {
  if (state.stage !== 'prepare') return tell(state, 'This mixture is ready for the next station.');
  if (state.elapsed + 0.00001 < state.nextTechniqueAt) return tell(state, 'Give the mixture a moment between actions.');
  const technique = currentTechnique(state);
  if (state.prepareComplete) {
    state.extraPrepActions++;
    state.nextTechniqueAt = state.elapsed + 0.4;
    const entry = { step: Math.max(0, state.prepIndex - 1), method: technique.type, action, expected: technique.expected, quality: timingQuality(state.phase, technique.zone), extra: true, at: state.elapsed };
    state.techniqueLog.push(entry);
    log(state, 'extra-technique', entry);
    updateDefects(state);
    const method = recipeFor(state).method;
    return tell(state, method === 'knead' ? 'Extra handling is tightening the dough. Too much will make the bread tough.' : method === 'laminate' ? 'The extra folds are blurring the butter layers. The pastry may lose its lift.' : ['foam', 'meringue'].includes(method) ? 'Extra folding is knocking air out. The mixture is starting to deflate.' : 'Extra mixing is overworking the mixture. The crumb is becoming heavier.');
  }
  if (technique.rest) {
    const task = state.techniqueTasks[state.prepIndex] ??= { scores: [], errors: 0 };
    const quality = restQuality(technique.readiness, technique.window);
    task.scores.push(quality);
    task.ratio = technique.readiness;
    state.techniqueScores.push(quality);
    const entry = { step: state.prepIndex, method: technique.type, action: 'ready', expected: 'ready', quality, ratio: technique.readiness, at: state.elapsed };
    state.techniqueLog.push(entry);
    log(state, 'rest', entry);
    state.prepIndex++; state.prepAction = 0; state.restElapsed = 0;
    state.nextTechniqueAt = state.elapsed + 0.4;
    state.mix = state.techniqueScores.length / targets(state).preparation * targets(state).mix;
    if (state.prepIndex >= recipeSteps(recipeFor(state)).length) state.prepareComplete = true;
    updateDefects(state);
    const [low, high] = technique.window, r = technique.readiness;
    if (technique.type === 'prove') return tell(state, r < low ? 'Under-proved: it will be tight, and may tear as it bakes.' : r > high ? 'Over-proved: it has started to sag and smell beery.' : 'Beautifully proved. It springs back slowly.');
    return tell(state, r < low ? 'Still soft: the butter will smear as you work it.' : 'Firm and cold. The butter will hold its layers.');
  }
  const correct = action === technique.expected;
  const quality = timingQuality(state.phase, technique.zone) * (correct ? 1 : 0.3);
  const task = state.techniqueTasks[state.prepIndex] ??= { scores: [], errors: 0 };
  task.scores.push(quality);
  if (!correct) task.errors++;
  state.techniqueScores.push(quality);
  const entry = { step: state.prepIndex, method: technique.type, action, expected: technique.expected, quality, at: state.elapsed };
  state.techniqueLog.push(entry);
  log(state, 'technique', entry);
  state.prepAction++;
  state.nextTechniqueAt = state.elapsed + 0.4;
  state.mix = state.techniqueScores.length / targets(state).preparation * targets(state).mix;
  if (state.prepAction >= technique.total) { state.prepIndex++; state.prepAction = 0; }
  if (state.prepIndex >= recipeSteps(recipeFor(state)).length) state.prepareComplete = true;
  updateDefects(state);
  return tell(state, !correct ? `That was out of order: ${technique.expected} was next.` : quality >= 93 ? 'A clean, controlled action.' : quality >= 80 ? 'Good rhythm. Aim nearer the middle for an even lighter touch.' : 'That stroke was rushed. Watch the green timing zone.');
}

export function recoverTechnique(state) {
  if (state.stage !== 'prepare') return tell(state, 'Preparation can only be repaired at the bowl.');
  let index = state.prepIndex;
  if (state.prepAction === 0 && index > 0) index--;
  const task = state.techniqueTasks[index];
  if (!task?.scores?.length) return tell(state, 'There is nothing to redo yet.');
  state.techniqueTasks = state.techniqueTasks.slice(0, index);
  state.techniqueScores = state.techniqueTasks.flatMap(item => item?.scores ?? []);
  state.techniqueLog = state.techniqueLog.filter(item => item.step < index);
  state.prepIndex = index;
  state.prepAction = 0;
  state.restElapsed = 0;
  state.prepareComplete = false;
  state.preparationFinished = false;
  state.recoveries++;
  state.recoveryDamage += 2;
  spendTime(state, 6);
  log(state, 'recover-technique', { step: index });
  return tell(state, 'Task reset: 6 seconds used. Reworking helps, but the mixture loses a little delicacy.');
}

export function finishPreparation(state) {
  if (state.stage !== 'prepare') return state;
  state.stage = 'shape';
  state.preparationFinished = true;
  updateDefects(state);
  log(state, 'finish-preparation', { complete: state.prepareComplete });
  return tell(state, state.prepareComplete ? 'Mixture ready. Make each piece even.' : 'Moving on early: the unfinished technique will affect the texture.');
}
// These aliases keep old in-progress controls safe during an update.
export const finishMix = finishPreparation;

export function shapeTarget(state, index = state.shapeIndex) {
  const recipe = recipeFor(state);
  const pattern = recipe.shapeMode === 'plait' ? [0, 3, -3] : recipe.shapeMode === 'pipe' ? [0, -2, 2] : [0];
  return clamp((recipe.shapeTarget ?? 60) + pattern[index % pattern.length]);
}

export function commitShape(state) {
  if (state.stage !== 'shape') return state;
  if (state.elapsed + 0.00001 < state.nextShapeAt) return tell(state, 'Let the piece settle before shaping the next.');
  const target = shapeTarget(state);
  const value = clamp(state.shapeValues[state.shapeIndex]);
  state.shapeValues[state.shapeIndex] = value;
  const accuracy = clamp(100 - Math.abs(value - target) * 1.8);
  const quality = accuracy * 0.72 + timingQuality(state.phase, state.shapeZone) * 0.28;
  state.shapeScores.push(quality);
  log(state, 'shape', { piece: state.shapeIndex, value, target, quality });
  state.shapeIndex++;
  state.shape = mean(state.shapeValues.slice(0, state.shapeIndex));
  state.nextShapeAt = state.elapsed + 0.4;
  if (state.shapeIndex >= state.shapeValues.length) state.stage = 'bake';
  updateDefects(state);
  return tell(state, quality >= 90 ? 'An even piece with a clean finish.' : 'A little uneven. You can redo the last piece before baking.');
}

export function undoShape(state) {
  if (!['shape', 'bake'].includes(state.stage) || state.ovenSeconds > 0 || state.shapeIndex === 0) return tell(state, 'That piece cannot be reshaped once it has started baking.');
  state.stage = 'shape';
  state.shapeIndex--;
  state.shapeScores.pop();
  spendTime(state, 2.5);
  log(state, 'undo-shape', { piece: state.shapeIndex });
  return tell(state, 'Last piece returned to the board. Reshaping used a little time.');
}
export const finishShape = commitShape;

export function currentComponent(state) {
  for (const role of ['filling', 'finish']) {
    const id = state[role];
    const component = componentFor(id);
    const total = id === 'none' ? 0 : Math.max(0, component?.work ?? 4);
    const count = state.componentProgress[role] ?? 0;
    if (count < total) return { role, id, name: component?.name ?? id, method: component?.method ?? 'whisk', count, total, phase: state.phase, zone: [25, 80], done: false };
  }
  return { role: null, id: 'none', name: 'Components ready', method: 'done', count: 0, total: 0, phase: state.phase, zone: [25, 80], done: true };
}

export function workComponent(state) {
  const resting = state.stage === 'prepare' && currentRest(state);
  if (!resting && !['bake', 'cool', 'assemble'].includes(state.stage)) return tell(state, 'Prepare the filling and finish while it rests, bakes, cools or waits for assembly.');
  if (state.elapsed + 0.00001 < state.nextComponentAt) return tell(state, 'Slow, even strokes. Give this component a moment.');
  const component = currentComponent(state);
  if (component.done) return tell(state, 'Your filling and finish are ready. Keep an eye on the bake.');
  const quality = timingQuality(state.phase, component.zone);
  state.componentProgress[component.role]++;
  state.componentScores[component.role].push(quality);
  state.nextComponentAt = state.elapsed + 0.6;
  const totalWork = ['filling', 'finish'].reduce((sum, role) => sum + (state[role] === 'none' ? 0 : componentFor(state[role])?.work ?? 4), 0);
  state.icing = totalWork ? (state.componentProgress.filling + state.componentProgress.finish) / totalWork * 12 : 12;
  log(state, 'component', { role: component.role, id: component.id, quality });
  return tell(state, quality >= 90 ? `${component.name}: smooth and controlled.` : `${component.name}: keep your strokes inside the green zone.`);
}

export function rotateBake(state) {
  if (state.stage !== 'bake') return tell(state, 'The bake needs to be in the oven to rotate it.');
  if (state.elapsed - state.lastRotationAt < 5) return tell(state, 'Keep the door closed for a moment so the oven can recover its heat.');
  state.rotations++;
  state.lastRotationAt = state.elapsed;
  state.ovenTemp = Math.max(80, state.ovenTemp - 8);
  spendTime(state, 0.8);
  log(state, 'rotate');
  return tell(state, 'Tray turned. The cooler side now faces the warmer part of the oven.');
}

export function setShelf(state, shelf) {
  if (state.stage !== 'bake') return tell(state, 'Choose a shelf while the bake is in the oven.');
  if (!SHELVES[shelf] || shelf === state.shelf) return state;
  state.shelf = shelf;
  if (state.ovenSeconds > 0) { state.ovenTemp = Math.max(80, state.ovenTemp - 5); spendTime(state, .6); }
  log(state, 'shelf', { shelf });
  return tell(state, shelf === 'top' ? 'Top shelf: quicker colour on top, but the base will lag behind.' : shelf === 'bottom' ? 'Bottom shelf: the base crisps nicely. The top will colour more slowly.' : 'Middle shelf: even heat all round.');
}

export function setSteam(state, on) {
  if (state.stage !== 'bake' || recipeFor(state).kind !== 'bread') return tell(state, 'Steam is for bread in the oven.');
  state.steam = !!on;
  log(state, 'steam', { on: state.steam });
  return tell(state, state.steam ? (state.bake < targets(state).bake * .45 ? 'Steam in: the crust stays soft so the loaf can spring up.' : 'Steam this late will keep the crust pale and dull.') : 'Steam out: the crust can colour and crisp.');
}

export function blindBake(state) {
  if (state.stage !== 'bake' || state.ovenSeconds > 0 || state.blindBaked || !needsBlindBake(state)) return tell(state, 'Blind baking happens before the filling goes in.');
  const stage = state.stage;
  state.stage = 'blind';
  spendTime(state, 9);
  state.stage = stage;
  state.blindBaked = true;
  log(state, 'blind-bake');
  updateDefects(state);
  return tell(state, 'Case blind baked with baking beans. That base will stay crisp under the filling.');
}

export function removeOven(state) {
  if (state.stage !== 'bake') return state;
  state.bakeDoneness = mean(state.sides) / targets(state).bake;
  state.stage = 'cool';
  state.cool = 0;
  log(state, 'remove-oven', { doneness: state.bakeDoneness, sides: [...state.sides] });
  updateDefects(state);
  return tell(state, state.bakeDoneness < 0.82 ? 'The centre is still soft. You can return it to the oven.' : state.bakeDoneness > 1.2 ? 'The edges have caught. Careful finishing may still help.' : fragileRecipe(recipeFor(state)) ? 'A delicate bake: start cooling in its tin to support the edges and prevent early cracks.' : 'Out of the oven. Give the structure time to set.');
}

export function returnOven(state) {
  if (state.stage !== 'cool') return tell(state, 'A bake can go back into the oven from the cooling station.');
  state.stage = 'bake';
  state.rebakes++;
  state.recoveryDamage += 0.8;
  state.cool = 0;
  delete state.coolRatio;
  state.ovenTemp = Math.max(80, state.ovenTemp - 12);
  spendTime(state, 1.5);
  log(state, 'return-oven');
  return tell(state, 'Back in the oven. You can finish the centre, but repeated heating dries the edges.');
}

export function setCooling(state, method) {
  if (!['rack', 'tin', 'fan'].includes(method)) return tell(state, 'Choose the rack, tin or fan for cooling.');
  state.coolMethod = method;
  log(state, 'cooling-method', { method });
  return tell(state, method === 'fan' ? 'Faster cooling, with a risk of cracks and a dry surface.' : method === 'tin' ? 'The tin supports delicate edges and prevents early cooling cracks, but holds the heat.' : fragileRecipe(recipeFor(state)) && state.cool < targets(state).cool * 0.45 ? 'This delicate bake can crack on the rack while very hot. Start in the tin for support.' : 'The rack lets air circulate steadily around your bake.');
}

export function finishCooling(state) {
  if (state.stage !== 'cool') return state;
  state.coolRatio = state.cool / targets(state).cool;
  state.stage = targets(state).parts > 1 || state.filling !== 'none' || state.finish !== 'none' ? 'assemble' : 'decorate';
  log(state, 'finish-cooling', { ratio: state.coolRatio, method: state.coolMethod });
  updateDefects(state);
  return tell(state, state.coolRatio < 0.8 ? 'Still warm: filling may melt and the structure may slump.' : 'Cooled and ready for a careful finish.');
}

function componentQuality(state, role) {
  const id = state[role];
  if (id === 'none') return 100;
  const total = Math.max(1, componentFor(id)?.work ?? 4);
  return clamp(state.componentScores[role].reduce((sum, score) => sum + score, 0) / total);
}

export function assemble(state, action) {
  if (state.stage !== 'assemble') return state;
  if (action === 'undo') {
    if (state.assemblyIndex <= 0) return tell(state, 'No layers to undo yet.');
    state.assemblyIndex--;
    state.assemblyScores.pop();
    state.alignment = state.assemblyAlignments.at(-1) ?? state.alignment;
    state.assemblyAlignments.pop();
    state.assemblySpread = false;
    spendTime(state, 3);
    state.stability = mean(state.assemblyScores);
    updateDefects(state);
    log(state, 'undo-assembly');
    return tell(state, 'Last piece lifted away. Rebuild it with a little more care.');
  }
  if (state.assemblyIndex >= targets(state).parts) return tell(state, 'Every part is in place. Finish assembly when you are happy.');
  if (state.elapsed + 0.00001 < state.nextAssemblyAt) return tell(state, 'Let the previous action settle before the next.');
  if (action === 'spread') {
    state.assemblySpread = true;
    state.spreadQuality = timingQuality(state.phase, state.assemblyZone);
    state.nextAssemblyAt = state.elapsed + 0.4;
    log(state, 'spread', { part: state.assemblyIndex, quality: state.spreadQuality });
    return tell(state, state.filling === 'none' && state.finish === 'none' ? 'Support prepared. Align the next piece carefully.' : 'An even layer is the best foundation. Now place the next piece.');
  }
  if (action !== 'place') return tell(state, 'Prepare the support, then place the next piece.');
  const alignment = clamp(state.alignment);
  const tolerance = state.design === 'tower' ? 2.2 : 1.6;
  const alignQuality = clamp(100 - Math.abs(alignment - 50) * tolerance);
  const generous = state.filling !== 'none' && (state.fillingAmount ?? 50) > 65;
  const warmPenalty = Math.max(0, 0.9 - (state.coolRatio ?? 0)) * 32 * (generous ? 1.5 : 1);
  const componentPenalty = (100 - mean([componentQuality(state, 'filling'), componentQuality(state, 'finish')])) * 0.1;
  const quality = clamp(alignQuality * 0.58 + timingQuality(state.phase, state.assemblyZone) * 0.3 + (state.assemblySpread ? state.spreadQuality ?? 100 : 0) * 0.12 - warmPenalty - componentPenalty);
  state.assemblyScores.push(quality);
  state.assemblyAlignments.push(alignment);
  state.assemblyIndex++;
  if (state.assemblyIndex < targets(state).parts) state.alignment = state.assemblyIndex % 2 ? 68 : 32;
  state.assemblySpread = false;
  state.nextAssemblyAt = state.elapsed + 0.6;
  state.stability = mean(state.assemblyScores);
  log(state, 'place-part', { part: state.assemblyIndex, alignment, quality });
  updateDefects(state);
  return tell(state, quality >= 90 ? 'Straight, supported and steady.' : warmPenalty > 4 ? 'The warm layer is sliding. Cooling would have helped.' : 'That piece is leaning. You can undo it and try again.');
}

export function setFillingAmount(state, amount) {
  if (state.stage !== 'assemble') return state;
  state.fillingAmount = clamp(Number(amount));
  updateDefects(state);
  return tell(state, state.fillingAmount < 25 ? 'A very thin scrape: the layers may taste dry.' : state.fillingAmount > 70 ? 'Generous! It may squeeze out at the edges, especially if anything is warm.' : 'An even layer of filling.');
}

export function crumbCoat(state) {
  if (state.stage !== 'assemble' || state.crumbCoated || !needsCrumbCoat(state)) return tell(state, 'A crumb coat seals a built cake before its finish.');
  if (state.assemblyIndex < targets(state).parts) return tell(state, 'Build every layer before the crumb coat.');
  spendTime(state, 5);
  state.crumbCoated = true;
  log(state, 'crumb-coat');
  return tell(state, 'A thin crumb coat locks in the crumbs. The finish will go on clean.');
}

export function finishAssembly(state) {
  if (state.stage !== 'assemble') return state;
  state.stage = 'decorate';
  log(state, 'finish-assembly', { placed: state.assemblyIndex, required: targets(state).parts });
  return tell(state, state.assemblyIndex < targets(state).parts ? 'Assembly rushed: missing parts will count against the brief.' : 'Structure complete. Make the finishing touches your own.');
}

export function placeDecoration(state, decoration) {
  if (state.stage !== 'decorate') return tell(state, 'Decorations go on at the finishing station.');
  const recipe = recipeFor(state);
  if (!decoration || !Number.isFinite(decoration.x) || !Number.isFinite(decoration.y)) return tell(state, 'Choose a position on the bake.');
  const item = decorationFor(decoration.type);
  if (!item || (recipe.decorationIds?.length && !recipe.decorationIds.includes(decoration.type))) return tell(state, 'Choose one of this recipe’s finishing decorations.');
  const timed = item.style === 'pipe' || item.style === 'structure';
  let quality = timed ? timingQuality(state.phase, [25, 80]) : 100;
  if (decoration.batch && Number.isFinite(decoration.quality)) quality = clamp(decoration.quality);
  else if (Number.isFinite(decoration.quality)) quality = Math.min(quality, clamp(decoration.quality));
  const inputSize = decoration.size ?? 1;
  const size = clamp(inputSize > 2 ? inputSize / 50 : inputSize, 0.4, 1.8);
  const placed = { x: clamp(decoration.x, 0.02, 0.98), y: clamp(decoration.y, 0.02, 0.98), type: decoration.type, size, angle: clamp(decoration.angle ?? 0, -180, 180), quality };
  if (item.colourable && /^#[0-9a-f]{6}$/i.test(decoration.colour ?? '')) placed.colour = decoration.colour;
  state.decorations.push(placed);
  spendTime(state, clamp(item.work ?? 2, 1, 3) * (decoration.batch ? .75 : 1));
  log(state, 'decorate', placed);
  return tell(state, quality >= 90 ? 'A clean finishing touch. Leave each detail a little breathing room.' : 'The piping wobbled. Undo it if you have time for another try.');
}

/** A deliberate pattern is placed in one confident movement: one timing, a little faster per piece. */
export function placeDecorations(state, decorations = []) {
  if (state.stage !== 'decorate' || !decorations.length) return placeDecoration(state, decorations[0]);
  const item = decorationFor(decorations[0]?.type);
  const timed = item && (item.style === 'pipe' || item.style === 'structure');
  const quality = timed ? timingQuality(state.phase, [25, 80]) : 100;
  for (const decoration of decorations) placeDecoration(state, { ...decoration, quality, batch: decorations.length > 1 });
  return state;
}

export function moveDecoration(state, index, { x, y } = {}) {
  const item = state.decorations?.[index];
  if (state.stage !== 'decorate' || !item || !Number.isFinite(x) || !Number.isFinite(y)) return state;
  item.x = clamp(x, .02, .98); item.y = clamp(y, .02, .98);
  spendTime(state, .5);
  log(state, 'move-decoration', { index });
  return tell(state, 'Nudged into place.');
}

export function updateDecoration(state, index, changes = {}) {
  const item = state.decorations?.[index];
  if (state.stage !== 'decorate' || !item) return state;
  if (Number.isFinite(changes.angle)) item.angle = clamp(changes.angle, -180, 180);
  if (Number.isFinite(changes.size)) item.size = clamp(changes.size, .4, 1.8);
  if (changes.colour && decorationFor(item.type)?.colourable && /^#[0-9a-f]{6}$/i.test(changes.colour)) item.colour = changes.colour;
  return state;
}

export function removeDecoration(state, index) {
  if (state.stage !== 'decorate' || !state.decorations?.[index]) return state;
  state.decorations.splice(index, 1);
  spendTime(state, 1);
  log(state, 'remove-decoration', { index });
  return tell(state, 'Lifted off. A tiny smear, but nobody will notice.');
}

function ratioQuality(ratio, tolerance = 0.015, slope = 170) {
  return clamp(100 - Math.max(0, Math.abs(ratio - 1) - tolerance) * slope);
}
function pairingDetails(state, recipe) {
  const flavours = state.flavours ?? [state.flavour];
  const catalog = CONTENT.FLAVOURS ?? {};
  const notes = [];
  let penalty = 0;
  if (flavours.length > 1) {
    const [a, b] = flavours;
    const paired = catalog[a]?.pairs?.includes(b) || catalog[b]?.pairs?.includes(a);
    if (!paired) { penalty += 8; notes.push('The two flavours compete rather than supporting one another.'); }
  }
  for (const flavour of flavours) {
    if (recipe.flavours?.length && !recipe.flavours.includes(flavour)) { penalty += 5; notes.push(`${catalog[flavour]?.name ?? flavour} does not sit naturally with this recipe.`); }
  }
  // How hard a flavour is pushed matters as much as which flavour it is.
  const lead = catalog[flavours[0]];
  if (lead?.intensity === 'delicate' && state.strength === 'bold') { penalty += 9; notes.push(`The ${lead.name.toLowerCase()} is overpowering. A little goes a long way.`); }
  if (lead?.intensity === 'robust' && state.strength === 'subtle') { penalty += 6; notes.push(`The ${lead.name.toLowerCase()} barely comes through. It can take more confidence.`); }
  for (const role of ['filling', 'finish']) {
    const component = componentFor(state[role]);
    if (!component || state[role] === 'none') continue;
    if (component.families?.length && !component.families.includes(recipe.family ?? recipe.kind)) { penalty += 8; notes.push(`${component.name} is a difficult match for this type of bake.`); }
    if (component.flavours?.length && !flavours.some(flavour => component.flavours.includes(flavour))) { penalty += 5; notes.push(`${component.name} overpowers your chosen flavour.`); }
  }
  // Balance: the bake, its filling and its finish all add sweetness and richness.
  const filling = componentById(state.filling), finish = componentById(state.finish);
  const sweetness = (recipe.profile?.sweetness ?? 0) + (filling?.sweet ?? 0) + (finish?.sweet ?? 0) * .5;
  const richness = (recipe.profile?.richness ?? 0) + (filling?.rich ?? 0) + (finish?.rich ?? 0) * .5;
  if (sweetness >= 3.5) { penalty += 7; notes.push('Sweet on sweet on sweet: it becomes cloying. Something sharp would cut through.'); }
  else if (recipe.kind !== 'bread' && sweetness <= -2) { penalty += 5; notes.push('With so little sugar and nothing sweet alongside, it tastes a little plain.'); }
  if (richness >= 4) { penalty += 6; notes.push('Very rich. One forkful is lovely; the second is hard work.'); }
  const inclusion = INCLUSIONS[recipe.inclusion]?.flavours;
  if (inclusion && !inclusion.some(id => flavours.includes(id) || flavours.some(f => catalog[f]?.pairs?.includes(id)))) { penalty += 4; notes.push('The extra pieces feel random against the main flavour.'); }
  return { penalty: Math.min(32, penalty), notes: [...new Set(notes)], sweetness, richness };
}

const ORDINAL = n => `${n}${n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'}`;
export { ORDINAL as ordinal };

/** The two judges speak from the real result: Mabel tastes, Hugh inspects. */
function judgeVoices(state, recipe, raw, total, ctx) {
  const { doneness, pairing, look, defects } = ctx;
  const flavourName = CONTENT.FLAVOURS?.[state.flavours?.[0]]?.name?.toLowerCase() ?? 'flavour';
  const mabel = [];
  if (doneness < .8) mabel.push([90, 'The centre is still raw, so the flavour and texture haven’t had a chance to develop.']);
  if (defects.soggy > 20) mabel.push([70, 'That wet base dulls everything sitting on top of it.']);
  if (pairing.notes.length && pairing.penalty >= 6) mabel.push([60 + pairing.penalty, pairing.notes[0].replace(/^The /, 'The ')]);
  if (defects.saltOff > 15) mabel.push([55, 'The salt is off. You can taste the measuring.']);
  if (defects.scorched > 8) mabel.push([55, 'There’s a scorched note running through it.']);
  if (defects.overProved > 20) mabel.push([50, 'It tastes a bit beery: that dough went too long.']);
  if (defects.sticky > 15) mabel.push([45, 'Too much sugar. It’s sticky and a little cloying.']);
  if (defects.greasy > 15) mabel.push([45, 'It leaves a greasy feel. The butter ran heavy.']);
  if (defects.thinFilling > 15) mabel.push([40, 'I wanted more filling. The layers are dry without it.']);
  if (raw.texture < 80 && defects.dense > 15) mabel.push([40, 'The crumb is heavy. It needed a lighter hand.']);
  const mabelText = mabel.length ? mabel.sort((a, b) => b[0] - a[0])[0][1]
    : raw.flavour >= 92 && raw.texture >= 90 ? `The ${flavourName} comes through beautifully, and that texture is exactly right.${look.notes.good.find(note => /tells you/.test(note)) ? ' ' + look.notes.good.find(note => /tells you/.test(note)) : ''}`
    : raw.flavour >= 85 ? 'The flavours work well. More care in the preparation would give them the texture they deserve.'
    : 'The balance is a little uneven. Look again at those measurements.';
  const hugh = [];
  if (defects.soggy > 20) hugh.push([95, 'Soggy bottom, I’m afraid. That case needed blind baking, or the bottom shelf.']);
  if (defects.underProved > 25) hugh.push([75, 'Under-proved. See how it’s torn along the side? It needed more time.']);
  if (defects.overProved > 25) hugh.push([75, 'Over-proved. It’s collapsed in the oven.']);
  if (defects.sunk > 15) hugh.push([75, 'Too much raising agent. It rose, then sank in the middle.']);
  if (defects.lostLayers > 25) hugh.push([70, 'Where are the layers? The butter has smeared right into the dough.']);
  if (raw.baking < 75) hugh.push([65, doneness < 1 ? 'This needed longer in the oven, and a turn so both sides bake evenly.' : 'The oven went too far. Those dark, dry edges take away from your work.']);
  if (defects.burntBase > 15) hugh.push([60, 'The base has caught. Too long on the bottom shelf.']);
  if (defects.lean > 5 || defects.ooze > 20) hugh.push([55, defects.ooze > 20 ? 'The filling’s escaping out of the sides. It was still warm, or there was just too much.' : 'It’s leaning. The layers weren’t straight, or the sponge wasn’t cool.']);
  if (defects.crumbs > 10) hugh.push([35, 'You can see crumbs in the coating. A crumb coat would have sealed them in.']);
  if (look.notes.bad.length && raw.presentation < 88) hugh.push([45, look.notes.bad[0]]);
  if (defects.spring > .6) hugh.push([20, 'Lovely oven spring there. The steam has done its job.']);
  const handshake = total >= 97 && ['bread', 'pastry'].includes(recipe.kind) && !ctx.practice;
  let hughText = hugh.length ? hugh.sort((a, b) => b[0] - a[0])[0][1]
    : total >= 95 ? 'That is exceptional work. Even colour, clean construction, and nothing on the plate without a purpose.'
    : raw.presentation < 80 ? 'A decent bake, but the finish needs the same care you gave the oven.'
    : 'A confident bake with a thoughtful finish. Keep that control through every stage.';
  if (handshake) hughText = `${hughText} That deserves a handshake.`;
  // Sometimes they simply see it differently.
  if (raw.flavour >= 88 && raw.presentation < 72) hughText += ' Mabel may forgive the looks for the taste. I’m not sure I do.';
  return { comments: [{ judge: 'Mabel', text: mabelText }, { judge: 'Hugh', text: hughText }], handshake };
}

export function judgeBake(state) {
  if (state.score) return state.score;
  if (state.stage !== 'decorate') return null;
  const recipe = recipeFor(state);
  const target = targets(state);
  updateDefects(state);
  const defects = state.defects;
  const measured = state.measurements.length === recipe.ingredients.length ? mean(state.measurements.map(ratio => ratioQuality(ratio))) : 0;
  const prepared = clamp(state.techniqueScores.reduce((sum, value) => sum + value, 0) / target.preparation - state.recoveryDamage);
  const shaped = clamp(state.shapeScores.reduce((sum, value) => sum + value, 0) / target.pieces);
  const ratios = state.sides.map(side => side / target.bake);
  const doneness = mean(ratios);
  const heatPenalty = state.ovenSeconds ? Math.min(20, state.heatError / state.ovenSeconds * 0.22) : 0;
  const baking = clamp(mean(ratios.map(ratio => ratioQuality(ratio, 0.015, 145))) - heatPenalty - Math.abs(ratios[0] - ratios[1]) * 16 - state.rebakes * 0.7
    - defects.soggy * .3 - defects.burntBase * .2 - defects.dullCrust * .1 - state.methodDamage.underProved * .12 - state.methodDamage.overProved * .1);
  const cooling = clamp(100 - Math.max(0, 1 - (state.coolRatio ?? 0)) * 65 - state.coolingCracks * 0.3 - state.coolingDryness * 0.18);
  const components = mean([componentQuality(state, 'filling'), componentQuality(state, 'finish')]);
  const needsAssembly = target.parts > 1 || state.filling !== 'none' || state.finish !== 'none';
  const assembly = needsAssembly ? clamp(state.assemblyScores.reduce((sum, value) => sum + value, 0) / target.parts) : 100;
  const look = analysePresentation(state, target.decor);
  const decorated = look.decoration;
  const pairing = pairingDetails(state, recipe);
  const rawTaste = Math.max(0, 0.78 - doneness) * 45;
  const damage = state.methodDamage;
  const structurePenalty = damage.dense * 0.17 + damage.weakDough * 0.2 + damage.lostLayers * 0.2 + damage.deflated * 0.18 + damage.scorched * 0.12 + damage.toughDough * 0.14
    + damage.underProved * .35 + damage.overProved * .25 + damage.shrunk * .1 + defects.sunk * .15 + defects.crumbly * .15 + defects.greasy * .08 + defects.soggy * .18 + (defects.dense - damage.dense) * .17;
  const raw = {
    flavour: clamp(measured * 0.66 + prepared * 0.12 + baking * 0.1 + components * 0.12 - pairing.penalty - rawTaste - damage.scorched * 0.15
      - defects.sticky * .1 - defects.greasy * .1 - defects.saltOff * .2 - defects.soggy * .08 - defects.burntBase * .15 - damage.overProved * .12 - damage.underProved * .06 - defects.thinFilling * .12),
    texture: clamp(measured * 0.16 + prepared * 0.4 + baking * 0.27 + shaped * 0.12 + cooling * 0.05 - structurePenalty),
    baking,
    presentation: clamp(shaped * 0.22 + assembly * 0.32 + decorated * 0.33 + cooling * 0.13 - look.flawPenalty),
  };
  const overtime = Math.max(0, state.elapsed - target.budget);
  const timePenalty = state.practice ? 0 : Math.min(25, overtime / 2);
  const issues = recipe.custom ? briefIssues(recipe, briefFor(recipe)) : [];
  const briefPenalty = Math.min(20, issues.length * 10);
  const rawTotal = mean(Object.values(raw)) - timePenalty - briefPenalty;
  let total = Math.round(clamp(rawTotal));
  if (total === 100 && rawTotal < 99.8) total = 99;
  const notes = [...issues, ...pairing.notes];
  if (damage.dense > 8) notes.push(state.extraPrepActions ? 'Overmixing developed a heavy, dense crumb and reduced the rise.' : 'The mixture did not develop a light, even structure; the crumb is dense.');
  if (damage.weakDough > 8) notes.push('The kneading left the dough weak, so it spread instead of holding a strong rise.');
  if (damage.lostLayers > 8) notes.push('The butter layers merged: rough folding, or not enough time in the fridge. The pastry lost its flakes and lift.');
  if (damage.deflated > 8) notes.push('Rough or excessive folding knocked air out of the foam, leaving a flatter bake.');
  if (damage.scorched > 8) notes.push('Heating before stirring caught the base and left a scorched flavour.');
  if (damage.toughDough > 8) notes.push(recipe.method === 'knead' ? 'Extra kneading tightened the dough too far and made the bread chewy and tough.' : 'Extra handling overworked the dough and made it tough.');
  if (damage.underProved > 8) notes.push('Under-proved: the dough was still tight, so it burst and tore in the oven.');
  if (damage.overProved > 8) notes.push('Over-proved: the dough ran out of strength and sagged as it baked.');
  if (damage.shrunk > 8) notes.push('The pastry went into the tin warm, so it shrank down the sides.');
  if (defects.spread > 12) notes.push('The biscuits spread into each other: warm dough, or too much butter or sugar.');
  if (defects.sunk > 8) notes.push('Too much raising agent: it rose fast, then sank in the middle.');
  if (defects.dense - damage.dense > 8) notes.push('Short on raising agent, so the bake stayed low and close-textured.');
  if (defects.sticky > 8) notes.push('Heavy on sugar: sticky, cloying and quick to darken in the oven.');
  if (defects.greasy > 8) notes.push('Too much butter: a greasy finish and a heavy texture.');
  if (defects.crumbly > 8) notes.push('Short on fat or egg, so it is crumbly and fragile.');
  if (defects.slumped > 8 && (state.ratioEffects?.slack ?? 0) > 8) notes.push('Too much liquid made a slack mixture that could not hold its shape.');
  if (defects.saltOff > 8) notes.push('The salt was mis-measured. It changes both the flavour and how the dough proves.');
  if (defects.soggy > 8) notes.push(state.blindBaked ? 'The base still needed more heat. Try the bottom shelf.' : 'A soggy bottom: a wet filling on an unsealed case. Blind bake it, or bake it low in the oven.');
  if (defects.burntBase > 8) notes.push('The base caught underneath. The bottom shelf is fierce over a long bake.');
  if (defects.dullCrust > 8) notes.push('Steam left in too long kept the crust pale and dull. Release it halfway.');
  if (defects.ooze > 15) notes.push('Too much filling, or too warm: it squeezed out and the layers slid.');
  if (defects.thinFilling > 8) notes.push('The filling was spread so thinly the layers taste dry.');
  if (defects.crumbs > 10) notes.push('Crumbs show through the coating. A quick crumb coat first seals them in.');
  if (measured < 88) notes.push('Uneven measurements changed the ingredient balance. Slow the pour as the scale approaches its target.');
  if (prepared < 90) {
    const weakest = state.techniqueLog.reduce((worst, item) => !worst || item.quality < worst.quality ? item : worst, null);
    notes.push(weakest && weakest.action !== weakest.expected ? `${methodFor({ type: weakest.method }).name}: ${weakest.expected} should have followed the previous action.` : state.prepareComplete ? 'The preparation rhythm damaged some of the structure. Steady, correctly timed actions keep it light.' : 'The preparation was left incomplete, so the structure never fully developed.');
  }
  if (state.recoveries) notes.push('Reworking rescued the preparation, at the cost of a little delicacy and extra time.');
  if (shaped < 85) notes.push('Uneven pieces affected the structure. Aim for both the size marker and the timing zone.');
  if (Math.min(...ratios) < 0.85) notes.push('The centre or cooler side came out underbaked. More oven time would have helped.');
  if (Math.max(...ratios) > 1.18) notes.push('The hotter side stayed in too long and became dry and dark.');
  if (Math.abs(ratios[0] - ratios[1]) > 0.12) notes.push('The two sides baked unevenly. A well-timed tray rotation would even out the colour.');
  if (heatPenalty > 5) notes.push('The oven ran away from the recipe temperature. The thermostat needed more attention.');
  if ((state.coolRatio ?? 0) < 0.8) notes.push('Warm assembly softened the filling and weakened the structure.');
  if (state.coolingCracks > 8 && state.actions.some(action => action.type === 'cooling-method' && action.method === 'fan')) notes.push('Rapid fan cooling cracked or dried the surface.');
  else if (state.coolingCracks > 1) notes.push('The delicate edges needed the tin’s support while the bake was very hot.');
  if (components < 85) notes.push('The filling or finish needed more controlled preparation. You can continue it while the bake rests or cools.');
  if (needsAssembly && state.assemblyIndex < target.parts) notes.push('Missing assembled parts left the challenge brief unfinished.');
  else if (assembly < 85) notes.push('The layers needed straighter placement and more even support.');
  if (decorated < 85) notes.push(...(look.notes.bad.length ? look.notes.bad.slice(0, 2) : ['The finish needs well-spaced, deliberate details.']));
  if (timePenalty > 0) notes.push(`Overtime: ${Math.round(timePenalty)} points deducted (${Math.ceil(overtime)}s late).`);
  if (!notes.length) notes.push('Precise preparation, an even bake and a confident finish. Every part of the brief is there.');
  const voices = judgeVoices(state, recipe, raw, total, { doneness, pairing, look, defects, practice: state.practice });
  state.score = {
    id: state.id, recipeId: state.recipeId, ...Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Math.round(value)])), total,
    headline: total >= 95 ? 'A star-worthy bake!' : total >= 85 ? 'Excellent work in the tent.' : total >= 74 ? 'A lovely bake.' : total >= 60 ? 'Still in the running.' : total >= 40 ? 'A little baking drama.' : 'The tent has seen better days.',
    comments: voices.comments, handshake: voices.handshake, notes: [...new Set(notes)], praise: look.notes.good,
    timePenalty: Math.round(timePenalty), briefPenalty, overtime: Math.ceil(overtime), doneness, cooling,
    ingredientAccuracy: Math.round(measured), techniqueQuality: Math.round(prepared), shapeQuality: Math.round(shaped), componentQuality: Math.round(components), assemblyQuality: Math.round(assembly), decorationQuality: Math.round(decorated), methodDamage: clone(state.methodDamage),
    presentationDetail: { ...look.metrics, flaws: look.flaws.map(flaw => flaw.name) },
    summary: { recipeId: recipe.id, kind: recipe.kind, flavours: [...state.flavours], filling: state.filling, finish: state.finish, design: state.design, defects: clone(state.defects), methods: recipeSteps(recipe).map(step => step.type) },
  };
  state.stage = 'judged';
  return state.score;
}

function fillMigratedPreparation(state, fraction, quality) {
  const steps = recipeSteps(recipeFor(state));
  let remaining = Math.round(targets(state).preparation * clamp(fraction, 0, 1));
  state.techniqueScores = [];
  state.techniqueTasks = [];
  state.techniqueLog = [];
  state.prepIndex = 0;
  state.prepAction = 0;
  for (let i = 0; i < steps.length; i++) {
    const count = Math.min(actionCount(steps[i]), remaining);
    if (count) {
      const scores = Array(count).fill(quality);
      state.techniqueTasks.push({ scores, errors: 0 });
      state.techniqueScores.push(...scores);
    }
    remaining -= count;
    if (count === actionCount(steps[i])) state.prepIndex = i + 1;
    else { state.prepIndex = i; state.prepAction = count; break; }
  }
  state.prepareComplete = state.prepIndex >= steps.length;
}

// v3 added rests, shelves, blind baking and assembly choices. Work already done
// keeps its credit: a save never fails a prove that did not exist when it was made.
function upgradeToV3(state, remap = true) {
  const steps = recipeSteps(recipeFor(state));
  if (!remap) steps.forEach((step, index) => { const task = state.techniqueTasks[index]; if (methodFor(step).rest && task?.scores?.length) task.ratio = 1; });
  const past = !['measure', 'prepare'].includes(state.stage);
  const oldTasks = state.techniqueTasks ?? [], oldIndex = state.prepIndex ?? 0, complete = !!state.prepareComplete;
  const tasks = [];
  let plain = 0, prepIndex = null;
  steps.forEach((step, index) => {
    if (methodFor(step).rest) {
      if (past || complete || plain < oldIndex) tasks[index] = { scores: [100], errors: 0, ratio: 1 };
      else if (prepIndex === null) prepIndex = index;
      return;
    }
    if (oldTasks[plain]) tasks[index] = oldTasks[plain];
    if (prepIndex === null && plain === oldIndex && !complete) prepIndex = index;
    plain++;
  });
  if (remap && steps.some(step => methodFor(step).rest)) {
    state.techniqueTasks = tasks;
    state.techniqueScores = tasks.flatMap(task => task?.scores ?? []);
    state.prepIndex = prepIndex ?? steps.length;
    state.prepareComplete = state.prepIndex >= steps.length;
  }
  Object.assign(state, {
    version: 3, restElapsed: 0, shelf: 'middle', baseOffset: 0, steam: false, steamEarly: 0, steamLate: 0,
    blindBaked: (state.ovenSeconds ?? 0) > 0, fillingAmount: 50, crumbCoated: ['decorate', 'judged'].includes(state.stage),
    strength: state.strength ?? 'balanced',
  }, { ...state, version: 3 });
  state.choices = { ...state.choices, strength: state.strength };
  updateDefects(state);
  return state;
}

function migrateBake(old) {
  if (old.version === 3 || old.stage === 'judged' || old.score) return clone(old);
  if (old.version === 2) {
    const state = clone(old);
    for (const key of ['restElapsed', 'shelf', 'baseOffset', 'steam', 'steamEarly', 'steamLate', 'blindBaked', 'fillingAmount', 'crumbCoated']) delete state[key];
    return upgradeToV3(state);
  }
  const recipe = recipeFor(old);
  const fresh = createBake(recipe, { flavours: old.flavours ?? [old.flavour ?? recipe.flavours?.[0]], filling: old.filling ?? 'none', finish: old.finish ?? 'none', design: old.design ?? 'stack', practice: old.practice });
  const state = Object.assign(fresh, clone(old));
  state.version = 2;
  for (const key of ['restElapsed', 'shelf', 'baseOffset', 'steam', 'steamEarly', 'steamLate', 'blindBaked', 'fillingAmount', 'crumbCoated']) delete state[key];
  state.id = old.id ?? fresh.id;
  state.flavours = [...fresh.choices.flavours];
  state.flavour = state.flavours[0];
  state.filling = fresh.choices.filling;
  state.finish = fresh.choices.finish;
  state.choices = clone(fresh.choices);
  const legacyWork = old.ambition === 'showpiece' ? 1.25 : old.ambition === 'flair' ? 1.12 : 1;
  delete state.ambition;
  delete state.maxPotential;
  state.score = null;
  state.stage = old.stage === 'mix' ? 'prepare' : old.stage;
  state.flowVelocity = 0;
  const pastPreparation = ['shape', 'bake', 'cool', 'decorate'].includes(old.stage);
  state.preparationFinished = pastPreparation;
  fillMigratedPreparation(state, pastPreparation ? 1 : old.stage === 'mix' ? (old.mix ?? 0) / ((recipe.mixTarget ?? 10) * legacyWork) : 0, pastPreparation ? 98 : ratioQuality((old.mix ?? 0) / ((recipe.mixTarget ?? 10) * legacyWork), 0.13, 70));
  if (['bake', 'cool', 'decorate'].includes(old.stage)) {
    state.shapeIndex = state.shapeValues.length;
    state.shapeValues = state.shapeValues.map(() => old.shape ?? recipe.shapeTarget);
    state.shapeScores = state.shapeValues.map((value, i) => clamp(100 - Math.abs(value - shapeTarget(state, i)) * 1.5));
  } else if (old.stage === 'shape') state.shapeValues[0] = old.shape ?? state.shapeValues[0];
  const previousBakeTarget = (recipe.legacyBakeTime ?? recipe.bakeTime) * legacyWork;
  state.bake = (old.bake ?? 0) / previousBakeTarget * targets(state).bake;
  state.sides = [state.bake, state.bake];
  if (old.bakeDoneness !== undefined) state.sides = [old.bakeDoneness * targets(state).bake, old.bakeDoneness * targets(state).bake];
  state.ovenTemp = old.heat ?? targets(state).temp;
  state.cool = (old.cool ?? 0) / (recipe.legacyCoolTime ?? recipe.coolTime) * targets(state).cool;
  state.coolMethod = 'rack';
  for (const role of ['filling', 'finish']) {
    const work = state[role] === 'none' ? 0 : componentFor(state[role])?.work ?? 4;
    state.componentProgress[role] = Math.round(work * clamp((old.icing ?? 0) / 12, 0, 1));
    state.componentScores[role] = Array(state.componentProgress[role]).fill(98);
  }
  if (old.stage === 'decorate') {
    state.coolRatio = old.coolRatio ?? state.cool / targets(state).cool;
    state.assemblyIndex = targets(state).parts;
    state.assemblyScores = Array(state.assemblyIndex).fill(clamp(mean(state.shapeScores) - Math.max(0, 0.8 - state.coolRatio) * 25));
    state.assemblyAlignments = Array(state.assemblyIndex).fill(50);
    state.decorations = (old.decorations ?? []).map(item => ({ ...item, quality: item.quality ?? 98, size: item.size ?? 50, angle: item.angle ?? 0 }));
  }
  const remaining = {
    measure: (recipe.ingredients.length - state.ingredient) * 6 + targets(state).preparation * 1.3 + targets(state).pieces * 2.5 + targets(state).bake + targets(state).cool + targets(state).parts * 3 + targets(state).decor * 2,
    prepare: (targets(state).preparation - state.techniqueScores.length) * 1.3 + targets(state).pieces * 2.5 + targets(state).bake + targets(state).cool + targets(state).parts * 3 + targets(state).decor * 2,
    shape: targets(state).pieces * 3 + targets(state).bake + targets(state).cool + targets(state).parts * 3 + targets(state).decor * 2,
    bake: Math.max(0, targets(state).bake - state.bake) + targets(state).cool + targets(state).parts * 3 + targets(state).decor * 2,
    cool: Math.max(0, targets(state).cool - state.cool) + targets(state).parts * 3 + targets(state).decor * 2,
    decorate: targets(state).decor * 2 + 15,
  }[state.stage] ?? 30;
  state.budget = Math.max(old.budget ?? 0, recipe.budget ?? 120, state.elapsed + remaining + 25);
  state.migratedFrom = 1;
  upgradeToV3(state, false);
  state.lastFeedback = 'Your saved bake is ready. Extra time has been allowed for the updated stations.';
  updateDefects(state);
  return state;
}

export function migrateSave(data) {
  function visit(value) {
    if (!value || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map(visit);
    if (value.recipeId && value.stage) return migrateBake(value);
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, visit(nested)]));
  }
  const migrated = visit(data);
  if (migrated && typeof migrated === 'object' && !Array.isArray(migrated) && !(migrated.recipeId && migrated.stage) && migrated.version === 1) migrated.version = 2;
  return migrated;
}

function snapshot(season) {
  const { _weekStart, ...rest } = season;
  return clone(rest);
}

export function createSeason(seed = Date.now()) {
  const active = ['you', ...RIVALS.map(rival => rival.id)];
  const season = {
    seed, week: 0, round: 0, active,
    scores: Object.fromEntries(active.map(id => [id, []])),
    weekScores: Object.fromEntries(active.map(id => [id, []])),
    history: [], stars: {}, form: {}, status: 'playing', winner: null,
    _appliedRounds: {},
  };
  season._weekStart = snapshot(season);
  return season;
}

function nameFor(id) {
  return id === 'you' ? 'You' : RIVALS.find(rival => rival.id === id)?.name ?? id;
}

function ranking(season, values) {
  return season.active.map(id => ({ id, name: nameFor(id), score: values[id] }))
    .sort((a, b) => b.score - a.score || randomFor(season.seed, season.week, b.id, 'tie') - randomFor(season.seed, season.week, a.id, 'tie'));
}

export function finishRound(season, score) {
  if (!score || typeof score.total !== 'number' || !Number.isFinite(score.total)) return null;
  const key = score.id ?? `${season.week}:${season.round}:${score.recipeId ?? 'bake'}`;
  // The regular judging path supplies an ID; stamp one for imported/legacy
  // scores too so a repeated button activation cannot submit the next round.
  if (!score.id && Object.isExtensible(score)) score.id = key;
  if (season._appliedRounds?.[key]) return clone(season._appliedRounds[key]);
  if (season.status !== 'playing') return null;
  const week = season.week;
  const round = season.round;
  const rivals = Object.fromEntries(season.active.filter(id => id !== 'you').map(id => [id, simulateRival(season, id, score.summary?.recipeId ?? score.recipeId)]));
  const values = Object.fromEntries(season.active.map(id => [id, id === 'you' ? clamp(score.total) : rivals[id].total]));
  for (const id of season.active) {
    (season.scores[id] ??= []).push(values[id]);
    (season.weekScores[id] ??= []).push(values[id]);
  }
  const roundRanking = ranking(season, values).map(entry => entry.id === 'you' ? entry : { ...entry, detail: rivals[entry.id] });
  const weekRanking = ranking(season, Object.fromEntries(season.active.map(id => {
    const scores = season.weekScores[id];
    return [id, Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length * 10) / 10];
  })));
  const result = { week, round, roundRanking, weekRanking, star: null, eliminated: null, final: false };
  if (score.summary) result.bakeSummary = clone(score.summary);
  if (round < 2) {
    season.round++;
  } else {
    result.star = weekRanking[0].id;
    season.stars[result.star] = (season.stars[result.star] ?? 0) + 1;
    updateForm(season, weekRanking, result.star);
    if (week === WEEKS.length - 1) {
      result.final = true;
      result.winner = weekRanking[0].id;
      season.winner = result.winner;
      season.status = 'complete';
    } else {
      result.eliminated = weekRanking.at(-1).id;
      season.active = season.active.filter(id => id !== result.eliminated);
      if (result.eliminated === 'you') season.status = 'eliminated';
      else {
        season.week++;
        season.round = 0;
        season.weekScores = Object.fromEntries(season.active.map(id => [id, []]));
      }
    }
  }
  season.history.push(clone(result));
  (season._appliedRounds ??= {})[key] = clone(result);
  if (round === 2 && season.status === 'playing') season._weekStart = snapshot(season);
  return result;
}

export function retryWeek(season) {
  if (!season?._weekStart) return season;
  const checkpoint = clone(season._weekStart);
  for (const key of Object.keys(season)) delete season[key];
  Object.assign(season, checkpoint, { _weekStart: clone(checkpoint) });
  return season;
}
