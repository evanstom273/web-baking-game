// What the finished bake actually looks like. The illustrations and the
// judges both read from here, so a score can never describe a flaw the
// picture does not show, or ignore one that it does.
import { DECORATIONS, FLAVOURS } from './content.js';

const clamp = (n, low = 0, high = 1) => Math.min(high, Math.max(low, Number.isFinite(n) ? n : low));
const mean = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

// Below its threshold a defect is not drawn and costs no presentation points.
export const VISIBLE_AT = {
  cracks: 4, burnt: 10, dense: 12, weakDough: 12, lostLayers: 12, deflated: 15, scorched: 8, toughDough: 15,
  slumped: 15, sunk: 10, soggy: 12, ooze: 15, crumbs: 10, shrunk: 12, overProved: 15, underProved: 15, spread: 12,
};
// How much each fully-visible defect costs a bake's presentation.
const FLAW_WEIGHT = {
  cracks: 22, burnt: 22, dense: 5, weakDough: 7, lostLayers: 9, deflated: 10, scorched: 14, toughDough: 4,
  slumped: 13, sunk: 22, soggy: 16, ooze: 16, crumbs: 12, shrunk: 14, overProved: 16, underProved: 18, spread: 12,
};
const FLAW_NAMES = {
  cracks: 'cracks across the top', burnt: 'a scorched edge', lostLayers: 'merged, flat layers', deflated: 'a sunken, deflated middle',
  scorched: 'dark flecks from the pan', slumped: 'a slumped profile', sunk: 'a dip where it rose and fell', soggy: 'a pale, soggy base',
  ooze: 'filling oozing from the layers', crumbs: 'crumbs caught in the coating', shrunk: 'pastry that has shrunk from the tin',
  overProved: 'a collapsed, over-proved crust', underProved: 'torn, burst sides', spread: 'biscuits spread into each other',
  dense: 'a tight, heavy crumb', weakDough: 'a flat, spread loaf', toughDough: 'a tight, tough crust',
};

/** Intensity 0–1 of every defect that is actually drawn. */
export function visibleDefects(defects = {}) {
  const shown = {};
  for (const [key, threshold] of Object.entries(VISIBLE_AT)) {
    const value = Number(defects[key]) || 0;
    shown[key] = value > threshold ? clamp(value / 100) : 0;
  }
  shown.lean = clamp(Math.abs(Number(defects.lean) || 0) / 18);
  shown.rise = Number.isFinite(defects.rise) ? clamp(defects.rise, .42, 1) : 1;
  return shown;
}

export function flawReport(defects = {}) {
  const shown = visibleDefects(defects);
  let penalty = (1 - shown.rise) * 12;
  const flaws = [];
  for (const [key, weight] of Object.entries(FLAW_WEIGHT)) {
    if (!shown[key]) continue;
    penalty += shown[key] * weight;
    flaws.push({ key, amount: shown[key], name: FLAW_NAMES[key] });
  }
  flaws.sort((a, b) => b.amount * FLAW_WEIGHT[b.key] - a.amount * FLAW_WEIGHT[a.key]);
  return { penalty, flaws };
}

/** Decoration positions for a placement pattern, in illustration (SVG) units around a tap. */
export function patternPoints(pattern = 'single', cx = 350, cy = 250, count = 5) {
  const n = Math.max(2, Math.min(10, Math.round(count) || 5));
  if (pattern === 'ring') return Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return { x: cx + Math.cos(a) * 92, y: cy + Math.sin(a) * 34 }; });
  if (pattern === 'line') return Array.from({ length: n }, (_, i) => ({ x: cx + (i - (n - 1) / 2) * 44, y: cy }));
  if (pattern === 'cluster') return [{ x: cx, y: cy - 10 }, { x: cx - 17, y: cy + 8 }, { x: cx + 17, y: cy + 8 }];
  return [{ x: cx, y: cy }];
}

// Decoration coordinates are normalised to a 500×200 box; compare them in true proportions.
const distance = (a, b) => Math.hypot(a.x - b.x, (a.y - b.y) * .4);
const displaySize = item => (item.size ?? 1) > 2 ? item.size / 50 : item.size ?? 1;

function symmetry(points) {
  if (points.length < 2) return 1;
  const cx = mean(points.map(p => p.x)), cy = mean(points.map(p => p.y));
  const mirror = mean(points.map(p => {
    const target = { x: 2 * cx - p.x, y: p.y };
    return clamp(1 - Math.min(...points.map(q => distance(q, target))) / .06);
  }));
  const radii = points.map(p => distance(p, { x: cx, y: cy }));
  const radiusSpread = mean(radii) ? Math.sqrt(mean(radii.map(r => (r - mean(radii)) ** 2))) / mean(radii) : 1;
  const angles = points.map(p => Math.atan2((p.y - cy) * .4, p.x - cx)).sort((a, b) => a - b);
  const gaps = angles.map((a, i) => (i ? a - angles[i - 1] : a + 2 * Math.PI - angles.at(-1)));
  const gapSpread = Math.sqrt(mean(gaps.map(g => (g - 2 * Math.PI / gaps.length) ** 2))) / (2 * Math.PI / gaps.length);
  const radial = points.length >= 3 ? clamp(1 - radiusSpread * 2.5) * clamp(1 - gapSpread * .9) : 0;
  return Math.max(mirror, radial);
}

function regularity(points) {
  if (points.length < 3) return 1;
  const nearest = points.map((p, i) => Math.min(...points.filter((_, j) => j !== i).map(q => distance(p, q))));
  const avg = mean(nearest), spread = Math.sqrt(mean(nearest.map(d => (d - avg) ** 2)));
  return avg ? clamp(1 - Math.max(0, spread / avg - .35) * 1.5) : 0;
}

/**
 * Judge the visible finish. `bake` needs decorations, flavours and defects;
 * `target` is how many details the brief asked for.
 */
export function analysePresentation({ decorations = [], flavours = [], defects = {} } = {}, target = 3) {
  const notes = { good: [], bad: [] };
  const n = decorations.length;
  const flaws = flawReport(defects);
  const metrics = { count: n, target, symmetry: 0, regularity: 0, crowding: 0, balance: 0, colours: 0, relevant: 0, misleading: 0 };
  if (!n) {
    if (target) notes.bad.push('The top is bare. The brief asked for a finish.');
    return { decoration: target ? 0 : 100, flawPenalty: flaws.penalty, flaws: flaws.flaws, notes, metrics };
  }
  const completion = Math.min(1, n / Math.max(1, target));
  let crowding = 0;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const a = decorations[i], b = decorations[j], d = Math.hypot(a.x - b.x, a.y - b.y);
    const gap = .045 + (displaySize(a) + displaySize(b)) / 80;
    if (d < gap) crowding += 1 - d / gap;
  }
  const cx = mean(decorations.map(item => item.x));
  const balance = Math.max(0, Math.abs(cx - .5) - .2) * 40;
  const saturation = Math.max(0, n - Math.max(12, target * 2)) * 3;
  metrics.symmetry = symmetry(decorations);
  metrics.regularity = regularity(decorations);
  const irregular = (1 - metrics.regularity) * 20 * (1 - metrics.symmetry * .6);
  // Rings, lines, clusters and crescents all mirror about their own centre; a random scatter does not.
  const aimless = n >= 3 ? Math.max(0, .5 - metrics.symmetry) * 18 : 0;
  const colours = new Set(decorations.map(item => item.colour ?? DECORATIONS[item.type]?.colour ?? item.type));
  metrics.colours = colours.size;
  const palette = Math.max(0, colours.size - 4) * 4;
  // A raspberry on top promises raspberry, or at least something it belongs with.
  // Pairings are listed one way round in places; either direction counts as belonging.
  const welcome = new Set([...flavours.flatMap(id => [id, ...(FLAVOURS[id]?.pairs ?? [])]), ...Object.keys(FLAVOURS).filter(id => flavours.some(f => FLAVOURS[id].pairs?.includes(f)))]);
  const signalling = decorations.filter(item => DECORATIONS[item.type]?.signals?.length);
  metrics.relevant = signalling.filter(item => DECORATIONS[item.type].signals.some(s => flavours.includes(s))).length;
  metrics.misleading = signalling.filter(item => !DECORATIONS[item.type].signals.some(s => welcome.has(s))).length;
  const misleading = metrics.misleading >= 2 && metrics.misleading > signalling.length / 2 ? 8 : 0;
  const structures = decorations.filter(item => DECORATIONS[item.type]?.style === 'structure').length;
  const topHeavy = n >= 4 && structures / n > .6 ? 6 : 0;
  metrics.crowding = crowding; metrics.balance = balance;
  const quality = mean(decorations.map(item => item.quality ?? 100));
  const decoration = clamp(quality * completion - crowding * 14 - balance - saturation - irregular - aimless - palette - misleading - topHeavy, 0, 100);

  if (completion < 1) notes.bad.push(`Only ${n} of the ${target} finishing details the brief asked for.`);
  if (crowding > .8) notes.bad.push('The details are piled into one spot. Give each a little room.');
  if (balance > 2) notes.bad.push(`Everything is bunched to the ${cx < .5 ? 'left' : 'right'}. The eye slides off the bake.`);
  if (irregular + aimless > 6) notes.bad.push('The arrangement looks accidental rather than deliberate.');
  if (palette) notes.bad.push(`${colours.size} different colours on top is a little loud.`);
  if (misleading) notes.bad.push('The decorations promise flavours that are not inside.');
  if (topHeavy) notes.bad.push('Mostly structures and very little to eat on top.');
  if (saturation) notes.bad.push('Piling on extra details does not earn extra credit.');
  if (metrics.symmetry > .8 && n >= 3) notes.good.push(metrics.regularity > .9 ? 'A beautifully even, symmetrical finish.' : 'A pleasing, symmetrical arrangement.');
  if (metrics.relevant) {
    const item = signalling.find(entry => DECORATIONS[entry.type].signals.some(s => flavours.includes(s)));
    notes.good.push(`The ${DECORATIONS[item.type].name.toLowerCase()} on top tells you what’s inside.`);
  }
  return { decoration, flawPenalty: flaws.penalty, flaws: flaws.flaws, notes, metrics };
}

/** A small, harmonious palette for piped and fondant details, led by the bake's flavours. */
export function decorPalette(flavours = []) {
  const accents = flavours.map(id => FLAVOURS[id]?.colour).filter(Boolean);
  return [...new Set(['#fff2d3', ...accents, '#e5b5ba', '#a9c08f', '#e6c656', '#8f6a4f'])].slice(0, 6);
}
