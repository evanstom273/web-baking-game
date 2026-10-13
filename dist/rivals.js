// The other benches. Each rival bakes a real recipe, scores across the same
// four categories as the player, and has strengths, weaknesses and a temper
// that make their good and bad days believable rather than random.
import { RIVALS, BRIEFS, FLAVOURS, ALL_RECIPES, getRoundRecipes } from './content.js';
import { BASES, composeRecipe, formsFor } from './pantry.js';

const clamp = (n, low = 0, high = 100) => Math.min(high, Math.max(low, Number.isFinite(n) ? n : low));
const mean = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
export const CATEGORIES = ['flavour', 'texture', 'baking', 'presentation'];
const SWEET_KINDS = ['cake', 'biscuit', 'dessert', 'pastry'];

export function randomFor(seed, ...parts) {
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

const pick = (list, r) => list[Math.min(list.length - 1, Math.floor(r * list.length))];

function matches(rule = {}, recipe) {
  if (rule.round && rule.round !== recipe.round) return false;
  if (rule.kind && rule.kind !== recipe.kind) return false;
  if (rule.minParts && (recipe.assemblyParts ?? 1) < rule.minParts) return false;
  if (rule.sweet && !SWEET_KINDS.includes(recipe.kind)) return false;
  return true;
}

function affinity(profile = {}, recipe, category) {
  let score = 0;
  if (profile.categories?.includes(category)) score += 1;
  if (profile.methods?.includes(recipe.method)) score += .8;
  if (profile.kinds?.includes(recipe.kind)) score += .8;
  if (profile.families?.includes(recipe.family)) score += .6;
  if (profile.rounds?.includes(recipe.round)) score += .6;
  if (profile.minParts && (recipe.assemblyParts ?? 1) >= profile.minParts && category !== 'flavour') score += .6;
  return score;
}

/** The rival's actual bake: a recipe-book choice or their own creation, in flavours they love. */
function chooseBake(season, rival, playerRecipeId) {
  const { week, round } = season;
  const r = (...parts) => randomFor(season.seed, week, round, rival.id, 'bake', ...parts);
  let recipe;
  if (round === 1) recipe = ALL_RECIPES.find(item => item.id === playerRecipeId && item.round === 'Technical') ?? getRoundRecipes(week, 1)[0];
  else {
    const brief = BRIEFS[week]?.[round];
    const ownBases = (rival.bases ?? []).filter(id => BASES[id] && formsFor(id, brief).length);
    if (ownBases.length && r('custom') < .4) {
      const base = pick(ownBases, r('base'));
      recipe = composeRecipe({ base, form: pick(formsFor(base, brief), r('form')), sweetness: Math.round(r('sweet') * 2 - 1), week, round });
    } else recipe = pick(getRoundRecipes(week, round), r('preset'));
  }
  const prescribed = recipe.prescribed;
  const loved = (rival.favourites ?? []).filter(id => recipe.flavours.includes(id));
  const flavours = prescribed?.flavours ?? [loved.length ? pick(loved, r('flavour')) : recipe.flavours[0]];
  const filling = prescribed?.filling ?? pick(recipe.fillings ?? ['none'], r('filling'));
  const finish = prescribed?.finish ?? pick(recipe.finishes ?? ['none'], r('finish'));
  return { recipe, flavours, filling, finish };
}

/** A deterministic, JSON-safe account of one rival's bake in the current round. */
export function simulateRival(season, id, playerRecipeId = null) {
  const rival = RIVALS.find(candidate => candidate.id === id);
  const { week, round } = season;
  const { recipe, flavours, filling, finish } = chooseBake(season, rival, playerRecipeId);
  const temperament = rival.temperament ?? 1;
  const base = (typeof rival.skill === 'number' ? rival.skill + 11 : 81) + week * .35 + (season.form?.[id] ?? 0);
  const roundStrength = (randomFor('round-strength', id, round) - .5) * 6;
  const weekendForm = (randomFor(season.seed, week, id, 'form') - .5) * 5;
  const categories = {};
  for (const category of CATEGORIES) {
    const noise = (randomFor(season.seed, week, round, id, category) - .5) * 18 * temperament;
    categories[category] = base + roundStrength + weekendForm + noise
      + affinity(rival.strengths, recipe, category) * 5 - affinity(rival.weaknesses, recipe, category) * 5.5;
  }
  const speciality = rival.speciality === week;
  const event = randomFor(season.seed, week, round, id, 'event');
  const mishap = (rival.mishaps ?? []).find(item => matches(item.when, recipe));
  const weakSpot = mishap && Object.keys(mishap.when ?? {}).length > 0;
  let happened = null, triumph = false;
  if (mishap && event < (weakSpot ? .3 : .1)) happened = mishap;
  else if (event > (speciality ? .82 : .95)) triumph = true;
  if (happened) for (const [category, hit] of Object.entries(happened.hit ?? {})) categories[category] += hit;
  if (triumph) for (const category of CATEGORIES) categories[category] += 5;
  if (speciality) categories[pick(CATEGORIES, randomFor(season.seed, id, 'special'))] += 4;
  for (const category of CATEGORIES) categories[category] = Math.round(clamp(categories[category], 30, 100));
  const total = Math.round(clamp(mean(Object.values(categories)), 40, 98));

  // What the judges actually see on the plate follows from those scores.
  const defects = { ...(happened?.defects ?? {}) };
  if (categories.texture < 70) defects.dense = Math.max(defects.dense ?? 0, (75 - categories.texture) * 2);
  if (categories.presentation < 68) defects.lean = defects.lean ?? (randomFor(season.seed, id, 'lean') < .5 ? -7 : 7);
  const doneness = happened?.doneness ?? (categories.baking < 62 ? .78 : categories.baking < 72 ? 1.25 : 1);
  const decorCount = Math.max(0, Math.round((recipe.decorTarget ?? 4) * clamp(categories.presentation / 92, .3, 1.1) * (happened?.decorScale ?? 1)));
  const relevant = (recipe.decorationIds ?? []).filter(type => /berry|raspberry|lemon|orange|chocolate|curl|leaf|flower|almond|pistachio/.test(type));
  const decorTypes = [pick(relevant.length ? relevant : recipe.decorationIds ?? ['cream'], randomFor(season.seed, id, week, round, 'decor')), pick(recipe.decorationIds ?? ['cream'], randomFor(season.seed, id, week, round, 'decor2'))];
  const best = CATEGORIES.reduce((a, b) => categories[a] >= categories[b] ? a : b);
  const worst = CATEGORIES.reduce((a, b) => categories[a] <= categories[b] ? a : b);
  return {
    total, categories, triumph, mishap: happened?.text ?? null,
    quip: pick(rival.quips ?? ['Fingers crossed.'], randomFor(season.seed, id, week, round, 'quip')),
    verdict: verdictFor(rival, recipe, flavours, categories, best, worst, happened, triumph),
    bake: {
      recipeId: recipe.id, name: recipe.name, art: recipe.art ?? recipe.id, kind: recipe.kind, layers: recipe.assemblyParts,
      flavours, filling, finish, defects, doneness, decorCount, decorTypes,
    },
  };
}

function verdictFor(rival, recipe, flavours, categories, best, worst, mishap, triumph) {
  const flavour = FLAVOURS[flavours[0]]?.name?.toLowerCase() ?? 'flavour';
  if (mishap) return { judge: worst === 'flavour' ? 'Mabel' : 'Hugh', text: mishap.text };
  if (triumph) return { judge: 'Hugh', text: `That is ${rival.name} at their very best. Genuinely impressive.` };
  const lines = {
    flavour: [`The ${flavour} really sings.`, `Lovely balance. I’d have a second slice.`],
    texture: ['Beautiful crumb. Light and even.', 'The texture is spot on.'],
    baking: ['Even colour all the way round. Well baked.', 'Properly baked through, top and bottom.'],
    presentation: ['It looks gorgeous. Real care in the finish.', 'Very elegant to look at.'],
  };
  const worries = {
    flavour: [`The ${flavour} gets a bit lost.`, 'The flavours are fighting each other.'],
    texture: ['It’s a little heavy.', 'Slightly dense in the middle.'],
    baking: ['It could have done with a few more minutes.', 'The colour is uneven.'],
    presentation: ['The finish feels a bit rushed.', 'It’s not quite straight, is it?'],
  };
  const good = categories[best] - categories[worst] < 6 || categories[worst] >= 84;
  const pool = good ? lines[best] : worries[worst];
  const judge = (good ? best : worst) === 'flavour' || (good ? best : worst) === 'texture' ? 'Mabel' : 'Hugh';
  return { judge, text: pool[(rival.name.length + recipe.name.length) % pool.length] };
}

/** Confidence drifts with results: Star Baker lifts it, a near miss dents it. */
export function updateForm(season, weekRanking, star) {
  season.form ??= {};
  const ranked = weekRanking.filter(entry => entry.id !== 'you');
  ranked.forEach((entry, index) => {
    let form = (season.form[entry.id] ?? 0) * .5;
    if (entry.id === star) form += 2;
    if (index >= ranked.length - 2) form -= 1.5;
    season.form[entry.id] = Math.round(clamp(form, -4, 4) * 10) / 10;
  });
}

export function rivalById(id) { return RIVALS.find(rival => rival.id === id); }
