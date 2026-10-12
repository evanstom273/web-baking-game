import * as CONTENT from './content.js';

const { WEEKS, RIVALS } = CONTENT;
const clamp = (n, low = 0, high = 100) => Math.min(high, Math.max(low, Number.isFinite(n) ? n : low));
const clone = value => JSON.parse(JSON.stringify(value));
const mean = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 100;
let bakeSequence = 0;

export function getRecipe(week = 0, round = 0) {
  return WEEKS[week]?.recipes?.[round] ?? null;
}

export function recipeFor(state) {
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
};

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
  const pieces = Math.max(1, recipe.pieces ?? 3);
  const state = {
    version: 2, id: `bake-${Date.now().toString(36)}-${++bakeSequence}`,
    recipeId: recipe.id, flavours, flavour: flavours[0], filling, finish, design,
    choices: { flavours: [...flavours], filling, finish, design },
    practice: !!options.practice, technicalLocked: !!prescribed,
    budget: budgetFor(recipe, filling, finish, design),
    stage: 'measure', ingredient: 0, amount: 0, measurements: [], pourRate: 65, flowVelocity: 0,
    prepIndex: 0, prepAction: 0, techniqueTasks: [], techniqueScores: [], techniqueLog: [], actions: [],
    prepareComplete: false, preparationFinished: false, extraPrepActions: 0,
    methodDamage: { dense: 0, weakDough: 0, lostLayers: 0, deflated: 0, scorched: 0, toughDough: 0 },
    mix: 0, phase: 50, phaseDirection: 1, nextTechniqueAt: 0,
    recoveryDamage: 0, recoveries: 0, wastedIngredients: 0,
    shape: 0, shapeValues: Array.from({ length: pieces }, (_, i) => clamp((recipe.shapeTarget ?? 60) + (i % 2 ? -22 : 19) + i * 2)),
    shapeIndex: 0, shapeScores: [], shapeZone: [28, 78], nextShapeAt: 0,
    heat: 180, ovenTemp: 180, bake: 0, sides: [0, 0], heatError: 0, ovenSeconds: 0,
    rotations: 0, lastRotationAt: -10, rebakes: 0,
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
  const damage = { dense: 0, weakDough: 0, lostLayers: 0, deflated: 0, scorched: 0, toughDough: 0 };
  for (const [index, step] of recipeSteps(recipe).entries()) {
    const task = state.techniqueTasks[index] ?? { scores: [], errors: 0 };
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
function updateDefects(state) {
  updateMethodDamage(state);
  const target = targets(state);
  const sides = state.sides.map(side => side / target.bake);
  const doneness = mean(sides);
  const spread = state.shapeValues.length ? Math.max(...state.shapeValues) - Math.min(...state.shapeValues) : 0;
  const shaped = state.shapeScores.length ? 100 - mean(state.shapeScores) : spread * 0.5;
  state.defects = {
    ...state.methodDamage,
    rise: clamp(1 - Math.max(state.methodDamage.dense * 0.004, state.methodDamage.weakDough * 0.0045, state.methodDamage.deflated * 0.005, state.methodDamage.lostLayers * 0.003), 0.42, 1),
    uneven: clamp(shaped + Math.abs(sides[0] - sides[1]) * 35),
    cracks: clamp(state.coolingCracks + Math.max(0, (state.ovenTemp ?? target.temp) - target.temp - 25) * 0.6),
    dry: clamp(Math.max(0, doneness - 1.1) * 130 + state.coolingDryness),
    slumped: state.coolRatio !== undefined ? clamp((0.75 - state.coolRatio) * 110) : 0,
    burnt: clamp((Math.max(...sides) - 1.15) * 150),
    pale: clamp((0.85 - Math.min(...sides)) * 130),
    lean: clamp(mean(state.assemblyAlignments.length ? state.assemblyAlignments : [50]) - 50, -50, 50) * 0.36,
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
  if (state.stage === 'bake') {
    const setPoint = clamp(state.heat, 80, 260) + Math.sin(state.ovenSeconds * 0.7) * 3;
    state.ovenTemp += clamp(setPoint - state.ovenTemp, -12 * delta, 12 * delta);
    const energy = delta * Math.pow(state.ovenTemp / target.temp, 1.7);
    const direction = state.rotations % 2 ? -1 : 1;
    state.sides[0] += energy * (1 + direction * 0.09);
    state.sides[1] += energy * (1 - direction * 0.09);
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

export function currentTechnique(state) {
  const steps = recipeSteps(recipeFor(state));
  const step = steps[state.prepIndex];
  if (!step || state.prepareComplete) {
    const lastStep = steps.at(-1);
    const method = methodFor(lastStep);
    return { type: lastStep.type, name: 'Preparation complete', instruction: 'Ready to shape. Further handling can overwork the mixture and weaken its structure.', actions: method.sequence.map(id => ({ id, label: method.labels[id] })), expected: method.sequence[(state.extraPrepActions ?? 0) % method.sequence.length], phase: state.phase, zone: [...method.zone], count: actionCount(lastStep), total: actionCount(lastStep), quality: mean(state.techniqueScores), done: true };
  }
  const method = methodFor(step);
  const scores = state.techniqueTasks[state.prepIndex]?.scores ?? [];
  return {
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
  if (!['bake', 'cool', 'assemble'].includes(state.stage)) return tell(state, 'Prepare the filling and finish while baking, cooling or assembling.');
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
  const warmPenalty = Math.max(0, 0.9 - (state.coolRatio ?? 0)) * 32;
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
  if (Number.isFinite(decoration.quality)) quality = Math.min(quality, clamp(decoration.quality));
  const inputSize = decoration.size ?? 1;
  const size = clamp(inputSize > 2 ? inputSize / 50 : inputSize, 0.4, 1.8);
  const placed = { x: clamp(decoration.x, 0.02, 0.98), y: clamp(decoration.y, 0.02, 0.98), type: decoration.type, size, angle: clamp(decoration.angle ?? 0, -180, 180), quality };
  state.decorations.push(placed);
  spendTime(state, clamp(item.work ?? 2, 1, 3));
  log(state, 'decorate', placed);
  return tell(state, quality >= 90 ? 'A clean finishing touch. Leave each detail a little breathing room.' : 'The piping wobbled. Undo it if you have time for another try.');
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
  for (const role of ['filling', 'finish']) {
    const component = componentFor(state[role]);
    if (!component || state[role] === 'none') continue;
    if (component.families?.length && !component.families.includes(recipe.family ?? recipe.kind)) { penalty += 8; notes.push(`${component.name} is a difficult match for this type of bake.`); }
    if (component.flavours?.length && !flavours.some(flavour => component.flavours.includes(flavour))) { penalty += 5; notes.push(`${component.name} overpowers your chosen flavour.`); }
  }
  return { penalty: Math.min(32, penalty), notes: [...new Set(notes)] };
}
function decorationQuality(state) {
  const decorations = state.decorations;
  const required = targets(state).decor;
  if (!decorations.length) return required ? 0 : 100;
  const completion = Math.min(1, decorations.length / Math.max(1, required));
  let crowding = 0;
  for (let i = 0; i < decorations.length; i++) {
    for (let j = i + 1; j < decorations.length; j++) {
      const a = decorations[i], b = decorations[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const displaySize = item => (item.size ?? 1) > 2 ? item.size / 50 : item.size ?? 1;
      const gap = 0.045 + (displaySize(a) + displaySize(b)) / 80;
      if (distance < gap) crowding += 1 - distance / gap;
    }
  }
  const balance = Math.max(0, Math.abs(mean(decorations.map(item => item.x)) - 0.5) - 0.22) * 30;
  const saturation = Math.max(0, decorations.length - Math.max(12, required * 2)) * 3;
  return clamp(mean(decorations.map(item => item.quality ?? 100)) * completion - crowding * 14 - balance - saturation);
}

export function judgeBake(state) {
  if (state.score) return state.score;
  if (state.stage !== 'decorate') return null;
  const recipe = recipeFor(state);
  const target = targets(state);
  updateDefects(state);
  const measured = state.measurements.length === recipe.ingredients.length ? mean(state.measurements.map(ratio => ratioQuality(ratio))) : 0;
  const prepared = clamp(state.techniqueScores.reduce((sum, value) => sum + value, 0) / target.preparation - state.recoveryDamage);
  const shaped = clamp(state.shapeScores.reduce((sum, value) => sum + value, 0) / target.pieces);
  const ratios = state.sides.map(side => side / target.bake);
  const doneness = mean(ratios);
  const heatPenalty = state.ovenSeconds ? Math.min(20, state.heatError / state.ovenSeconds * 0.22) : 0;
  const baking = clamp(mean(ratios.map(ratio => ratioQuality(ratio, 0.015, 145))) - heatPenalty - Math.abs(ratios[0] - ratios[1]) * 16 - state.rebakes * 0.7);
  const cooling = clamp(100 - Math.max(0, 1 - (state.coolRatio ?? 0)) * 65 - state.coolingCracks * 0.3 - state.coolingDryness * 0.18);
  const components = mean([componentQuality(state, 'filling'), componentQuality(state, 'finish')]);
  const needsAssembly = target.parts > 1 || state.filling !== 'none' || state.finish !== 'none';
  const assembly = needsAssembly ? clamp(state.assemblyScores.reduce((sum, value) => sum + value, 0) / target.parts) : 100;
  const decorated = decorationQuality(state);
  const pairing = pairingDetails(state, recipe);
  const rawTaste = Math.max(0, 0.78 - doneness) * 45;
  const damage = state.methodDamage;
  const structurePenalty = damage.dense * 0.17 + damage.weakDough * 0.2 + damage.lostLayers * 0.2 + damage.deflated * 0.18 + damage.scorched * 0.12 + damage.toughDough * 0.14;
  const raw = {
    flavour: clamp(measured * 0.66 + prepared * 0.12 + baking * 0.1 + components * 0.12 - pairing.penalty - rawTaste - damage.scorched * 0.15),
    texture: clamp(measured * 0.16 + prepared * 0.4 + baking * 0.27 + shaped * 0.12 + cooling * 0.05 - structurePenalty),
    baking,
    presentation: clamp(shaped * 0.22 + assembly * 0.32 + decorated * 0.33 + cooling * 0.13 - state.defects.slumped * 0.12 - state.coolingCracks * 0.18 - (1 - state.defects.rise) * 12),
  };
  const overtime = Math.max(0, state.elapsed - target.budget);
  const timePenalty = state.practice ? 0 : Math.min(25, overtime / 2);
  const rawTotal = mean(Object.values(raw)) - timePenalty;
  let total = Math.round(clamp(rawTotal));
  if (total === 100 && rawTotal < 99.8) total = 99;
  const notes = [...pairing.notes];
  if (damage.dense > 8) notes.push(state.extraPrepActions ? 'Overmixing developed a heavy, dense crumb and reduced the rise.' : 'The mixture did not develop a light, even structure; the crumb is dense.');
  if (damage.weakDough > 8) notes.push('The kneading left the dough weak, so it spread instead of holding a strong rise.');
  if (damage.lostLayers > 8) notes.push('Incorrect rolling and folding merged the butter layers. The pastry lost its distinct flakes and lift.');
  if (damage.deflated > 8) notes.push('Rough or excessive folding knocked air out of the foam, leaving a flatter bake.');
  if (damage.scorched > 8) notes.push('Heating before stirring caught the base and left a scorched flavour.');
  if (damage.toughDough > 8) notes.push(recipe.method === 'knead' ? 'Extra kneading tightened the dough too far and made the bread chewy and tough.' : 'Extra handling overworked the dough and made it tough.');
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
  if (components < 85) notes.push('The filling or finish needed more controlled preparation. You can continue it while the bake cools.');
  if (needsAssembly && state.assemblyIndex < target.parts) notes.push('Missing assembled parts left the challenge brief unfinished.');
  else if (assembly < 85) notes.push('The layers needed straighter placement and more even support.');
  if (decorated < 85) notes.push('The finish needs well-spaced, deliberate details. Crowding the surface does not earn extra credit.');
  if (timePenalty > 0) notes.push(`Overtime: ${Math.round(timePenalty)} points deducted (${Math.ceil(overtime)}s late).`);
  if (!notes.length) notes.push('Precise preparation, an even bake and a confident finish. Every part of the brief is there.');
  const flavourComment = doneness < 0.8 ? 'The centre is still raw, so the flavour and texture have not had a chance to develop.'
    : pairing.penalty >= 8 ? 'There is good intent in these flavours, but they are competing. A simpler, more compatible combination would be stronger.'
    : raw.flavour >= 90 && raw.texture >= 90 ? 'Beautifully balanced, with an excellent texture. The care you took in preparation really shows.'
    : raw.flavour >= 85 ? 'The flavours work well. A more careful preparation would give them the texture they deserve.'
    : 'The balance is a little uneven. Check those measurements and give the filling the attention it needs.';
  const bakeComment = baking < 75 ? doneness < 1 ? 'This needed longer in the oven, and a turn to help both sides bake evenly.' : 'The oven went too far. The dark, dry edges take away from your work.'
    : (state.coolRatio ?? 0) < 0.8 ? 'The bake has promise. Building it while warm is what let the finish slide.'
    : raw.presentation < 80 ? 'A decent bake, but the construction and finishing need the same care you gave the oven.'
    : total >= 95 ? 'That is exceptional work. Even colour, clean construction, and nothing on the plate without a purpose.'
    : 'A confident bake with a thoughtful finish. Keep that control through every stage.';
  state.score = {
    id: state.id, recipeId: state.recipeId, ...Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Math.round(value)])), total,
    headline: total >= 95 ? 'A star-worthy bake!' : total >= 85 ? 'Excellent work in the tent.' : total >= 74 ? 'A lovely bake.' : total >= 60 ? 'Still in the running.' : total >= 40 ? 'A little baking drama.' : 'The tent has seen better days.',
    comments: [{ judge: 'Mabel', text: flavourComment }, { judge: 'Hugh', text: bakeComment }], notes,
    timePenalty: Math.round(timePenalty), overtime: Math.ceil(overtime), doneness, cooling,
    ingredientAccuracy: Math.round(measured), techniqueQuality: Math.round(prepared), shapeQuality: Math.round(shaped), componentQuality: Math.round(components), assemblyQuality: Math.round(assembly), decorationQuality: Math.round(decorated), methodDamage: clone(state.methodDamage),
    summary: { recipeId: recipe.id, flavours: [...state.flavours], filling: state.filling, finish: state.finish, design: state.design, defects: clone(state.defects), methods: recipeSteps(recipe).map(step => step.type) },
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

function migrateBake(old) {
  if (old.version === 2 || old.stage === 'judged' || old.score) return clone(old);
  const recipe = recipeFor(old);
  const fresh = createBake(recipe, { flavours: old.flavours ?? [old.flavour ?? recipe.flavours?.[0]], filling: old.filling ?? 'none', finish: old.finish ?? 'none', design: old.design ?? 'stack', practice: old.practice });
  const state = Object.assign(fresh, clone(old));
  state.version = 2;
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

function randomFor(seed, ...parts) {
  let value = 2166136261;
  const str = `${seed}:${parts.join(':')}`;
  for (let i = 0; i < str.length; i++) value = Math.imul(value ^ str.charCodeAt(i), 16777619);
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d);
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b);
  value ^= value >>> 16;
  return (value >>> 0) / 4294967296;
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
    history: [], stars: {}, status: 'playing', winner: null,
    _appliedRounds: {},
  };
  season._weekStart = snapshot(season);
  return season;
}

function nameFor(id) {
  return id === 'you' ? 'You' : RIVALS.find(rival => rival.id === id)?.name ?? id;
}

function simulateRival(season, id) {
  const rival = RIVALS.find(candidate => candidate.id === id);
  const week = WEEKS[season.week];
  const specialty = String(rival.specialty ?? rival.speciality ?? '').toLowerCase();
  const weekName = String(week.theme ?? week.name ?? week.title ?? '').toLowerCase();
  const isSpecialty = typeof rival.speciality === 'number'
    ? rival.speciality === season.week
    : specialty && (weekName.includes(specialty) || specialty.includes(weekName));
  const skill = typeof rival.skill === 'number' ? rival.skill + 11 : 81;
  const variation = (randomFor(season.seed, season.week, season.round, id) - 0.5) * 18;
  const roundStrength = (randomFor('round-strength', id, season.round) - 0.5) * 6;
  const weekendForm = (randomFor(season.seed, season.week, id, 'form') - 0.5) * 5;
  const event = randomFor(season.seed, season.week, season.round, id, 'event');
  const mishap = event < 0.08 ? -16 : event > 0.94 ? 6 : 0;
  return Math.round(clamp(skill + (isSpecialty ? 5 : 0) + variation + roundStrength + weekendForm + mishap + season.week * 0.35, 40, 98));
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
  const values = Object.fromEntries(season.active.map(id => [id, id === 'you' ? clamp(score.total) : simulateRival(season, id)]));
  for (const id of season.active) {
    (season.scores[id] ??= []).push(values[id]);
    (season.weekScores[id] ??= []).push(values[id]);
  }
  const roundRanking = ranking(season, values);
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
