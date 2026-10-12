// The baker's pantry: bases and forms that compose into a playable recipe.
// A composed recipe has exactly the shape of a recipe-book entry, so every
// station, judge and illustration treats a baker's own creation the same way.
import { FLAVOURS, BRIEFS, enrich, budgetFor } from './content.js';

const S = (type, cycles) => ({ type, cycles });
const R = (type, rest) => ({ type, cycles: 1, rest });
const I = (name, target, role, unit = 'g', flow) => ({ name, target, unit, role, ...(flow ? { flow } : {}) });
const SWEET = Object.keys(FLAVOURS).filter(id => id !== 'herb');
const ROUND_NAMES = ['Signature', 'Technical', 'Showstopper'];

export const BASES = {
  sponge: {
    name: 'Butter sponge', short: 'sponge', method: 'cream', kind: 'cake', family: 'cake', difficulty: 1,
    note: 'Creamed butter and sugar. Tender, forgiving and rich.',
    steps: [S('beat', 3), S('fold', 2)], temp: 180, bakeTime: 27, coolTime: 8, mixTarget: 9, shapeTarget: 58,
    ingredients: [I('Self-raising flour', 220, 'flour'), I('Soft butter', 200, 'fat'), I('Caster sugar', 200, 'sugar'), I('Beaten eggs', 220, 'egg')],
    flavours: SWEET, forms: ['layer-cake', 'loaf', 'cupcakes', 'pudding', 'tiered', 'cupcake-tower'],
    fillings: ['none', 'berry-jam', 'lemon-curd', 'ganache', 'buttercream', 'whipped-cream', 'salted-caramel', 'praline', 'cream-cheese'],
    finishes: ['none', 'icing', 'cream-finish', 'chocolate-coat', 'glaze', 'nut-crunch', 'caramel-drizzle'],
    tip: 'Beat until pale, then fold with a light hand. Cool before you build.',
  },
  genoise: {
    name: 'Whisked genoise', short: 'genoise', method: 'foam', kind: 'cake', family: 'cake', difficulty: 2,
    note: 'Air whipped into eggs is the only lift. Light, but fragile.',
    steps: [S('whip', 4), S('fold', 2)], temp: 185, bakeTime: 24, coolTime: 7, mixTarget: 10, shapeTarget: 54,
    ingredients: [I('Beaten eggs', 240, 'egg'), I('Caster sugar', 120, 'sugar'), I('Plain flour', 120, 'flour'), I('Melted butter', 40, 'fat')],
    flavours: SWEET, forms: ['layer-cake', 'roll', 'tiered'],
    fillings: ['berry-jam', 'lemon-curd', 'ganache', 'buttercream', 'whipped-cream', 'praline'],
    finishes: ['none', 'icing', 'cream-finish', 'chocolate-coat'],
    tip: 'Whip to a thick ribbon. Every rough fold costs you rise.',
  },
  shortbread: {
    name: 'Shortbread dough', short: 'shortbread', method: 'rub', kind: 'biscuit', family: 'biscuit', difficulty: 1,
    note: 'Butter rubbed into flour. Crisp, sandy and easy to overwork.',
    steps: [S('rub', 3), S('fold', 2), R('chill', 8)], temp: 170, bakeTime: 25, coolTime: 7, mixTarget: 8, shapeTarget: 50,
    ingredients: [I('Plain flour', 240, 'flour'), I('Cold butter', 160, 'fat'), I('Caster sugar', 80, 'sugar')],
    flavours: SWEET, forms: ['biscuits', 'sandwich', 'biscuit-house'],
    fillings: ['none', 'berry-jam', 'ganache', 'buttercream', 'praline', 'lemon-curd'],
    finishes: ['none', 'icing', 'chocolate-coat', 'glaze', 'nut-crunch'],
    tip: 'Chill before rolling so the biscuits keep their edges.',
  },
  shortcrust: {
    name: 'Sweet shortcrust', short: 'shortcrust', method: 'rub', kind: 'pastry', family: 'tart', difficulty: 2,
    note: 'A crisp case for wet fillings. Blind bake it, or face a soggy bottom.',
    steps: [S('rub', 3), S('fold', 2), R('chill', 10)], temp: 190, bakeTime: 27, coolTime: 8, mixTarget: 8, shapeTarget: 55,
    ingredients: [I('Plain flour', 240, 'flour'), I('Cold butter', 120, 'fat'), I('Icing sugar', 50, 'sugar'), I('Beaten eggs', 50, 'egg')],
    flavours: SWEET, forms: ['tart', 'tartlets', 'pie', 'galette'],
    fillings: ['fruit-compote', 'vanilla-custard', 'lemon-curd', 'berry-jam', 'ganache', 'salted-caramel'],
    finishes: ['none', 'glaze', 'cream-finish', 'nut-crunch', 'icing'],
    tip: 'Cold hands, short handling, and a properly baked base.',
  },
  'rough-puff': {
    name: 'Rough puff pastry', short: 'rough puff', method: 'laminate', kind: 'pastry', family: 'pastry', difficulty: 3,
    note: 'Butter folded into layers. Chill between turns or they smear together.',
    steps: [S('rub', 2), S('laminate', 2), R('chill', 9), S('laminate', 2)], temp: 205, bakeTime: 28, coolTime: 9, mixTarget: 9, shapeTarget: 62,
    ingredients: [I('Plain flour', 250, 'flour'), I('Cold butter', 200, 'fat'), I('Cold water', 120, 'liquid', 'ml')],
    flavours: [...SWEET, 'herb'], forms: ['galette', 'pie', 'sunburst'],
    fillings: ['fruit-compote', 'vanilla-custard', 'praline', 'ganache', 'herb-butter', 'cinnamon-butter'],
    finishes: ['none', 'glaze', 'icing', 'nut-crunch', 'seed-crust'],
    tip: 'Roll, fold, turn, chill. Rushing the fridge is how layers die.',
  },
  enriched: {
    name: 'Enriched dough', short: 'enriched dough', method: 'knead', kind: 'bread', family: 'bread', difficulty: 2,
    note: 'Butter and eggs make it soft and golden. It proves slowly.',
    steps: [S('knead', 4), S('fold', 2), R('prove', 14)], temp: 185, bakeTime: 28, coolTime: 8, mixTarget: 13, shapeTarget: 64,
    ingredients: [I('Strong bread flour', 350, 'flour'), I('Beaten eggs', 150, 'egg'), I('Soft butter', 100, 'fat'), I('Caster sugar', 40, 'sugar'), I('Fast-action yeast', 7, 'leaven'), I('Fine salt', 6, 'salt')],
    flavours: ['vanilla', 'orange', 'cinnamon', 'almond', 'caramel', 'ginger', 'lemon', 'chocolate'], forms: ['plait', 'knots', 'wreath', 'loaf'],
    fillings: ['none', 'cinnamon-butter', 'salted-caramel', 'cream-cheese', 'praline'],
    finishes: ['glaze', 'icing', 'nut-crunch', 'caramel-drizzle', 'none'],
    tip: 'Knead until it is glossy and elastic, then give it time somewhere warm.',
  },
  lean: {
    name: 'Crusty lean dough', short: 'bread', method: 'knead', kind: 'bread', family: 'bread', difficulty: 2,
    note: 'Flour, water, yeast and salt. Nowhere to hide.',
    steps: [S('knead', 4), S('fold', 2), R('prove', 13)], temp: 215, bakeTime: 28, coolTime: 8, mixTarget: 13, shapeTarget: 62,
    ingredients: [I('Strong bread flour', 400, 'flour'), I('Warm water', 270, 'liquid', 'ml'), I('Fast-action yeast', 7, 'leaven'), I('Fine salt', 8, 'salt')],
    flavours: ['herb', 'lemon', 'orange', 'almond', 'cinnamon'], forms: ['loaf', 'focaccia', 'knots', 'wreath', 'bread-basket'],
    fillings: ['none', 'herb-butter', 'cinnamon-butter'],
    finishes: ['none', 'seed-crust', 'glaze', 'nut-crunch'],
    tip: 'A hot oven and a little steam give the best crust.',
  },
  choux: {
    name: 'Choux paste', short: 'choux', method: 'choux', kind: 'pastry', family: 'pastry', difficulty: 3,
    note: 'Cooked, then beaten glossy. Hollow shells waiting to be filled.',
    steps: [S('cook', 2), S('beat', 3)], temp: 205, bakeTime: 27, coolTime: 8, mixTarget: 12, shapeTarget: 55,
    ingredients: [I('Plain flour', 100, 'flour'), I('Butter', 80, 'fat'), I('Water', 160, 'liquid', 'ml'), I('Beaten eggs', 160, 'egg')],
    flavours: SWEET, forms: ['buns', 'eclairs', 'choux-tower'],
    fillings: ['vanilla-custard', 'whipped-cream', 'praline', 'ganache', 'salted-caramel'],
    finishes: ['chocolate-coat', 'icing', 'caramel-drizzle', 'nut-crunch'],
    tip: 'Stir before you heat, beat until glossy, and never open the oven early.',
  },
  meringue: {
    name: 'Meringue', short: 'meringue', method: 'meringue', kind: 'dessert', family: 'dessert', difficulty: 2,
    note: 'Egg whites and sugar. Crisp outside, marshmallow within.',
    steps: [S('whip', 4), S('fold', 2)], temp: 150, bakeTime: 28, coolTime: 10, mixTarget: 10, shapeTarget: 56,
    ingredients: [I('Egg whites', 120, 'egg'), I('Caster sugar', 220, 'sugar'), I('Cornflour', 10, 'flour')],
    flavours: ['vanilla', 'berry', 'raspberry', 'lemon', 'rose', 'pistachio', 'coconut', 'chocolate', 'coffee'], forms: ['nest'],
    fillings: ['whipped-cream', 'lemon-curd', 'berry-jam', 'vanilla-custard'],
    finishes: ['cream-finish', 'nut-crunch', 'none'],
    tip: 'Glossy stiff peaks, a low oven and a slow, supported cool.',
  },
  custard: {
    name: 'Baked cheesecake', short: 'cheesecake', method: 'custard', kind: 'dessert', family: 'dessert', difficulty: 2,
    note: 'A gentle oven sets it silky. Too hot and it cracks.',
    steps: [S('beat', 2), S('fold', 3)], temp: 160, bakeTime: 30, coolTime: 11, mixTarget: 8, shapeTarget: 52,
    ingredients: [I('Cream cheese', 400, 'fat', 'g', 'sticky'), I('Caster sugar', 110, 'sugar'), I('Beaten eggs', 150, 'egg'), I('Biscuit crumbs', 160, 'flour')],
    flavours: ['vanilla', 'lemon', 'berry', 'raspberry', 'caramel', 'chocolate', 'orange', 'ginger', 'coffee'], forms: ['cheesecake'],
    fillings: ['none', 'berry-jam', 'lemon-curd', 'salted-caramel'],
    finishes: ['glaze', 'cream-finish', 'chocolate-coat', 'caramel-drizzle'],
    tip: 'Smooth, not airy. Let it cool in the tin.',
  },
};

// `art` names an existing illustration of that shape; `byKind` lets one form suit several bases.
export const FORMS = {
  'layer-cake': { name: 'Layer cake', pieces: 3, parts: 2, shapeMode: 'level', decor: 4, art: 'garden-sponge', note: 'Two sandwiched layers.' },
  loaf: { name: 'Loaf', pieces: 3, parts: 1, shapeMode: 'level', decor: 3, art: 'marble-loaf', byKind: { bread: { art: 'village-bloomer', shapeMode: 'shape' } }, note: 'A single generous bake.' },
  cupcakes: { name: 'Batch of cupcakes', pieces: 6, parts: 1, shapeMode: 'portion', decor: 5, art: 'cupcake-batch', note: 'Six matching little cakes.' },
  pudding: { name: 'Baked pudding', pieces: 3, parts: 1, shapeMode: 'level', decor: 4, art: 'sunday-pudding', kind: 'dessert', family: 'dessert', note: 'Spooned warm-ish from the dish.' },
  roll: { name: 'Swiss roll', pieces: 3, parts: 2, shapeMode: 'roll', decor: 4, art: 'swiss-roll', requiresFilling: true, note: 'A spiral that shows the filling.' },
  tiered: { name: 'Tiered cake', pieces: 5, parts: 4, shapeMode: 'level', decor: 6, art: 'tiered-plain', family: 'construction', scale: 1.4, showstopper: true, requiresFilling: true, note: 'Stacked tiers. Needs cool sponge and a steady hand.' },
  'cupcake-tower': { name: 'Cupcake tower', pieces: 6, parts: 4, shapeMode: 'portion', decor: 7, art: 'celebration-cupcake-tower', family: 'construction', scale: 1.3, showstopper: true, note: 'Little cakes built into a tower.' },
  biscuits: { name: 'Tin of biscuits', pieces: 6, parts: 1, shapeMode: 'roll', decor: 3, art: 'tea-tin-shortbread', note: 'An even, matching batch.' },
  sandwich: { name: 'Sandwich biscuits', pieces: 6, parts: 2, shapeMode: 'roll', decor: 4, art: 'jam-sandwich-biscuits', requiresFilling: true, note: 'Pairs joined with a filling.' },
  'biscuit-house': { name: 'Biscuit house', pieces: 5, parts: 5, shapeMode: 'roll', decor: 7, art: 'biscuit-greenhouse', family: 'construction', scale: 1.4, showstopper: true, note: 'Crisp panels, steady joins.' },
  tart: { name: 'Large tart', pieces: 3, parts: 2, shapeMode: 'line', decor: 5, art: 'jewel-fruit-tart', requiresFilling: true, case: true, note: 'A lined case with a smooth filling.' },
  tartlets: { name: 'Six tartlets', pieces: 6, parts: 2, shapeMode: 'line', decor: 4, art: 'vanilla-custard-tarts', requiresFilling: true, case: true, note: 'Six little lined cases.' },
  pie: { name: 'Lattice pie', pieces: 4, parts: 2, shapeMode: 'line', decor: 4, art: 'summer-fruit-pie', family: 'pie', requiresFilling: true, case: true, note: 'Lined dish, generous filling, woven lid.' },
  galette: { name: 'Free-form galette', pieces: 3, parts: 2, shapeMode: 'roll', decor: 4, art: 'orchard-galette', requiresFilling: true, note: 'Rustic folded edges; no tin needed.' },
  sunburst: { name: 'Pastry sunburst', pieces: 6, parts: 3, shapeMode: 'roll', decor: 6, art: 'pastry-sunburst', scale: 1.2, showstopper: true, requiresFilling: true, note: 'Twisted rays around a filled centre.' },
  plait: { name: 'Plaited loaf', pieces: 4, parts: 1, shapeMode: 'plait', decor: 4, art: 'butter-brioche', note: 'Even strands, even rise.' },
  knots: { name: 'Batch of knots', pieces: 6, parts: 1, shapeMode: 'plait', decor: 4, art: 'cinnamon-knots', byKind: {}, note: 'Six matching knotted rolls.' },
  wreath: { name: 'Bread wreath', pieces: 5, parts: 3, shapeMode: 'plait', decor: 6, art: 'harvest-wreath', scale: 1.25, showstopper: true, note: 'A ring that must bake evenly all round.' },
  focaccia: { name: 'Focaccia', pieces: 3, parts: 1, shapeMode: 'level', decor: 4, art: 'garden-focaccia', note: 'Dimpled, oily and airy.' },
  'bread-basket': { name: 'Woven basket', pieces: 6, parts: 5, shapeMode: 'plait', decor: 6, art: 'woven-bread-basket', family: 'construction', scale: 1.35, showstopper: true, note: 'Woven dough holding a nest of rolls.' },
  buns: { name: 'Choux buns', pieces: 6, parts: 2, shapeMode: 'pipe', decor: 4, art: 'choux-buns', requiresFilling: true, note: 'Six filled, matching buns.' },
  eclairs: { name: 'Éclairs', pieces: 6, parts: 2, shapeMode: 'pipe', decor: 4, art: 'chocolate-eclairs', requiresFilling: true, note: 'Long, straight, filled shells.' },
  'choux-tower': { name: 'Choux tower', pieces: 6, parts: 5, shapeMode: 'pipe', decor: 7, art: 'profiterole-tower', family: 'construction', scale: 1.6, showstopper: true, requiresFilling: true, note: 'Filled buns built into a cone.' },
  nest: { name: 'Pavlova nest', pieces: 3, parts: 2, shapeMode: 'pipe', decor: 5, art: 'summer-pavlova', requiresFilling: true, note: 'A crisp shell holding a soft filling.' },
  cheesecake: { name: 'Cheesecake', pieces: 3, parts: 2, shapeMode: 'level', decor: 4, art: 'baked-cheesecake', note: 'A biscuit base and a silky top.' },
};

export const INCLUSIONS = {
  none: { name: 'Nothing extra' },
  chocolate: { name: 'Chocolate chunks', ingredient: 'Chocolate chunks', amount: 90, flavours: ['chocolate'] },
  nuts: { name: 'Toasted nuts', ingredient: 'Toasted nuts', amount: 70, flavours: ['almond', 'hazelnut', 'pistachio'] },
  fruit: { name: 'Dried fruit', ingredient: 'Dried fruit', amount: 80, flavours: ['orange', 'berry', 'cinnamon', 'ginger'] },
  seeds: { name: 'Mixed seeds', ingredient: 'Mixed seeds', amount: 40, flavours: ['herb', 'lemon'] },
};

export function formFor(baseId, formId) {
  const base = BASES[baseId], form = FORMS[formId];
  if (!base || !form) return null;
  return { ...form, ...(form.byKind?.[base.kind] ?? {}), kind: form.kind ?? base.kind, family: form.family ?? base.family };
}

/** Plain reasons a creation does not answer the brief; empty means it does. */
export function briefIssues(recipe, brief) {
  if (!brief || !recipe) return [];
  const issues = [];
  if (brief.kinds?.length && !brief.kinds.includes(recipe.kind)) issues.push(`The brief asked for ${brief.kinds.join(' or ')}, not ${recipe.kind}.`);
  if ((recipe.assemblyParts ?? 1) < (brief.minParts ?? 1)) issues.push(`The brief needed at least ${brief.minParts} structural parts.`);
  if ((recipe.assemblyParts ?? 1) > (brief.maxParts ?? 99)) issues.push('This is a showstopper-sized build for a signature brief.');
  return issues;
}

export function briefFor(week, round) { return Number.isInteger(week) && Number.isInteger(round) ? BRIEFS[week]?.[round] ?? null : null; }

/** Which forms of a base suit a brief (all of them in practice, when there is no brief). */
export function formsFor(baseId, brief = null) {
  const base = BASES[baseId];
  if (!base) return [];
  return base.forms.filter(formId => {
    const form = formFor(baseId, formId);
    return !brief || !briefIssues({ kind: form.kind, assemblyParts: form.parts }, brief).length;
  });
}

export function basesFor(brief = null) { return Object.keys(BASES).filter(id => formsFor(id, brief).length); }

const round5 = n => Math.max(1, Math.round(n / 5) * 5);

/** Compose a full recipe from a baker's own choices. Unknown choices fall back safely. */
export function composeRecipe({ base: baseId = 'sponge', form: formId, sweetness = 0, richness = 0, inclusion = 'none', week = null, round = 0 } = {}) {
  const baseKey = BASES[baseId] ? baseId : 'sponge', base = BASES[baseKey];
  const formKey = base.forms.includes(formId) ? formId : base.forms[0], form = formFor(baseKey, formKey);
  const sweet = Math.max(-2, Math.min(2, Math.round(Number(sweetness) || 0)));
  const rich = Math.max(-2, Math.min(2, Math.round(Number(richness) || 0)));
  const extra = INCLUSIONS[inclusion] && inclusion !== 'none' && base.kind !== 'dessert' ? inclusion : 'none';
  const scale = form.scale ?? 1;
  const ingredients = base.ingredients.map(item => {
    let target = item.target * scale;
    if (item.role === 'sugar') target *= 1 + sweet * .15;
    if (item.role === 'fat') target *= 1 + rich * .15;
    return { ...item, target: item.target < 20 ? Math.round(target) : round5(target) };
  });
  if (extra !== 'none') ingredients.push({ name: INCLUSIONS[extra].ingredient, target: round5(INCLUSIONS[extra].amount * scale), unit: 'g', role: 'inclusion' });
  const roundName = ROUND_NAMES[round] ?? 'Signature';
  const fillings = base.fillings.filter(id => !form.requiresFilling || id !== 'none');
  const recipe = {
    id: `custom-${baseKey}-${formKey}`, custom: true, base: baseKey, form: formKey,
    name: `${base.short} ${form.name.toLowerCase()}`.replace(/^./, c => c.toUpperCase()),
    round: roundName, kind: form.kind, family: form.family, method: base.method,
    description: `${base.note} ${form.note}`,
    ingredients, steps: base.steps.map(step => ({ ...step })),
    temp: base.temp, bakeTime: base.bakeTime + (scale > 1.2 ? 4 : 0), coolTime: base.coolTime + (form.parts > 2 ? 2 : 0),
    mixTarget: base.mixTarget, shapeTarget: base.shapeTarget, shapeMode: form.shapeMode,
    prepLabel: base.method === 'knead' ? 'Knead' : base.method === 'foam' ? 'Fold' : 'Whisk', shapeLabel: 'Shape',
    pieces: form.pieces, assemblyParts: form.parts, decorTarget: form.decor, art: form.art,
    flavours: [...base.flavours], fillings: fillings.length ? fillings : ['none'], finishes: [...base.finishes],
    needsCase: !!form.case, profile: { sweetness: sweet, richness: rich }, inclusion: extra,
    tip: base.tip, technicalHint: base.tip, week, roundIndex: round,
  };
  enrich(recipe);
  recipe.budget = budgetFor(recipe);
  return recipe;
}

export function customSpecFor(recipe) {
  return recipe?.custom ? { base: recipe.base, form: recipe.form, sweetness: recipe.profile?.sweetness ?? 0, richness: recipe.profile?.richness ?? 0, inclusion: recipe.inclusion ?? 'none' } : null;
}
