import { FLAVOURS, COMPONENTS, DECORATIONS } from './content.js';
import { targets, currentTechnique, currentComponent, shapeTarget, needsBlindBake, needsCrumbCoat } from './engine.js';
import { analysePresentation, decorPalette } from './presentation.js';
import * as Art from './art.js';

const clamp = (value, low = 0, high = 100) => Math.max(low, Math.min(high, Number(value) || 0));
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const button = (label, action, kind = '', attrs = '') => `<button class="btn ${kind}" data-action="${action}" ${attrs}>${label}</button>`;
const number = (value, target = 100) => Number(value || 0).toFixed(target < 20 ? 1 : 0);
const titleCase = value => String(value || '').replace(/[-_]/g, ' ').replace(/^./, char => char.toUpperCase());
const componentById = id => (Array.isArray(COMPONENTS) ? COMPONENTS : Object.values(COMPONENTS)).find(item => item.id === id);
const shapeUnit = r => ({ level: 'zone', roll: 'pass', plait: 'strand', line: 'section', pipe: 'piece', portion: 'piece' }[r.shapeMode] || 'piece');
const spreadLabel = b => b.filling && b.filling !== 'none' ? 'Spread filling' : b.finish && b.finish !== 'none' ? 'Apply finish' : 'Prepare support';
const feedback = b => `<p class="bench-feedback" id="bench-feedback" role="status" aria-live="polite">${esc(b.lastFeedback || 'Take your time with the technique. Keep an eye on the clock.')}</p>`;

function phaseMeter(b, zone = [28, 78], label = 'Act as the marker crosses the sage band') {
  return `<div class="timing-block"><div class="timing-label"><span id="phase-label">${esc(label)}</span><span class="timing-key">● steady hand</span></div><div class="timing-track" aria-hidden="true"><span class="timing-zone" id="phase-zone" style="left:${zone[0]}%;width:${zone[1] - zone[0]}%"></span><span class="timing-cursor" id="phase-cursor" style="left:${clamp(b.phase)}%"></span></div></div>`;
}

function fillMeter(id, label, percent = 0) {
  return `<div class="bench-meter" aria-label="${esc(label)}"><span id="${id}" style="width:${clamp(percent)}%"></span></div>`;
}

function componentPanel(b) {
  const current = currentComponent(b);
  return `<div class="component-panel" id="component-panel"${!current || current.done ? ' hidden' : ''}><div><span class="component-caption">While you wait</span><strong id="component-name">${esc(current?.name || 'Components ready')}</strong><span id="component-value">${current ? `${current.count} / ${current.total} careful actions` : ''}</span></div>${button('Work filling', 'component', 'secondary small', 'id="component-button"')}</div>`;
}

function shapingTerms(r) {
  const mode = r.shape?.mode || r.shaping?.mode || r.shapeMode || r.shapeLabel?.toLowerCase() || 'shape';
  const modes = {
    spread: ['Level the mixture', 'Depth', 'Shallow', 'Deep', 'Level this zone'],
    level: ['Level the mixture', 'Depth', 'Shallow', 'Deep', 'Level this zone'],
    pipe: ['Pipe matching portions', 'Piping pressure', 'Gentle', 'Firm', 'Pipe this portion'],
    roll: ['Roll an even thickness', 'Thickness', 'Thin', 'Thick', 'Finish this pass'],
    plait: ['Weave your dough', 'Strand tension', 'Loose', 'Tight', 'Cross this strand'],
    knot: ['Tie an even knot', 'Strand tension', 'Loose', 'Tight', 'Tie this knot'],
    line: ['Line the pastry case', 'Pastry thickness', 'Thin', 'Thick', 'Fit this section'],
    mould: ['Shape the mould', 'Portion depth', 'Shallow', 'Deep', 'Set this portion'],
    portion: ['Portion a matching batch', 'Portion size', 'Small', 'Large', 'Set this portion'],
    score: ['Shape and score the loaf', 'Dough tension', 'Loose', 'Tight', 'Shape this section'],
    shape: ['Give it some shape', 'Dough tension', 'Loose', 'Tight', 'Set this piece'],
  };
  return { mode, text: modes[mode] || modes.shape };
}

export function stageCopy(b, r) {
  const t = targets(b);
  const ingredient = r.ingredients[b.ingredient];
  switch (b.stage) {
    case 'measure': return ['A good bake starts here.', ingredient ? `Measure ${ingredient.name.toLowerCase()}: ${ingredient.target ?? ingredient.amount}${ingredient.unit}. Control the flow; trim any excess.` : 'Every ingredient is in the bowl.'];
    case 'prepare': {
      const action = currentTechnique(b);
      if (action?.rest) return [action.type === 'prove' ? 'A warm corner of the tent.' : 'A few minutes in the cold.', action.instruction];
      return [action?.name || 'A little care with the mixture.', action?.instruction || 'Choose the right action and time it in the sage band.'];
    }
    case 'shape': return [shapingTerms(r).text[0] + '.', `Match each ${shapeUnit(r)} to its guide, then set it with a steady hand.`];
    case 'bake': return ['Something lovely is rising.', `Guide: ${t.temp}°C. Pick a shelf, watch both sides and turn the tray; work on your filling while it bakes.${needsBlindBake(b) && !b.blindBaked && !b.ovenSeconds ? ' This case needs its base sealed.' : ''}`];
    case 'cool': return ['Good things need a moment.', 'Choose how to cool. You can finish components now, or return an underbaked bake to the oven.'];
    case 'assemble': return ['Build something beautiful.', `${spreadLabel(b)}, align each piece, and place it with a steady hand.`];
    case 'decorate': return ['Make it your own.', 'Place single details or a whole pattern, then adjust anything that isn’t quite right. The judges see what you see.'];
    default: return ['Ready for the judges.', 'A little flour. A little courage.'];
  }
}

function restPanel(b, technique) {
  const [low, high] = technique.window;
  const scale = technique.type === 'prove' ? 1.6 : 2.4, at = value => clamp(value / scale * 100);
  return `<div class="readout"><span id="technique-task">${esc(technique.name)}</span><strong id="rest-status">${restStatus(technique)}</strong></div>
    <div class="rest-track" aria-hidden="true"><span class="rest-window" style="left:${at(low)}%;width:${at(high) - at(low)}%"></span><span class="rest-fill" id="rest-fill" data-scale="${scale}" style="width:${at(technique.readiness)}%"></span></div>
    <div class="range-labels rest-labels"><span>${technique.type === 'prove' ? 'Tight' : 'Soft'}</span><strong>Ready in the sage band</strong><span>${technique.type === 'prove' ? 'Collapsing' : 'Very cold'}</span></div>
    ${componentPanel(b)}${currentComponent(b)?.done ? '' : phaseMeter(b, [25, 80], 'Time filling work in the sage band')}
    <div class="control-line">${button(esc(technique.actions[0].label), 'technique', '', 'data-technique-slot="0" data-value="ready" id="rest-ready"')}</div>`;
}
function restStatus(technique) {
  const r = technique.readiness, [low, high] = technique.window;
  if (r < low) return technique.type === 'prove' ? `Rising · ~${Math.ceil(technique.secondsToReady)}s` : `Firming · ~${Math.ceil(technique.secondsToReady)}s`;
  if (r <= high) return 'Ready now';
  return technique.type === 'prove' ? 'Over-proving!' : 'Well chilled';
}

export function controlsView(b, r, { decorType = b.decorType || r.decorationIds?.[0] || 'berry', decorSize = 1, decorTool = 'place', decorPattern = 'single', decorCount = 5, decorColour = null, selected = -1 } = {}) {
  const t = targets(b);
  switch (b.stage) {
    case 'measure': {
      const item = r.ingredients[b.ingredient];
      if (!item) return '';
      const target = item.target ?? item.amount;
      return `<div class="ingredient-strip">${r.ingredients.map((entry, i) => `<span class="ingredient-chip ${i === b.ingredient ? 'current' : i < b.ingredient ? 'done' : ''}">${i < b.ingredient ? '✓ ' : ''}${esc(entry.name)}</span>`).join('')}</div>
        <div class="readout"><span>${esc(item.name)} <small>· target ${target}${esc(item.unit)}</small></span><strong><span id="amount-value">${number(b.amount, target)}</span><small>${esc(item.unit)}</small></strong></div>
        <div class="measure-track" aria-hidden="true"><span class="measure-guide"></span><span id="measure-meter" style="width:${clamp(b.amount / target * 66.667)}%"></span><i></i></div>
        <div class="compact-range"><label for="pour-rate">Flow <output id="pour-rate-value">${Math.round(b.pourRate ?? 65)}%</output></label><input id="pour-rate" data-input="pour-rate" type="range" min="15" max="100" value="${b.pourRate ?? 65}" aria-label="Pouring speed"><span id="measure-error" class="measure-error">${number(b.amount - target, target)}${esc(item.unit)}</span></div>
        <div class="control-line"><button class="btn" data-hold="pour">Hold to pour</button>${button('Add to bowl', 'add', 'secondary')}</div>
        <div class="recovery-row">${button('Trim excess', 'scrape', 'secondary small')}${button('Small spoon', 'spoon', 'secondary small')}${button('Empty', 'empty', 'secondary small')}</div>${feedback(b)}`;
    }
    case 'prepare': {
      const technique = currentTechnique(b);
      if (technique?.rest) return `${restPanel(b, technique)}${feedback(b)}`;
      return `<div class="readout"><span id="technique-task">${esc(technique?.name || 'Preparation complete')}</span><strong id="technique-count">${technique?.count || 0}<small> / ${technique?.total || 0}</small></strong></div>
        ${phaseMeter(b, technique?.zone)}
        <div class="technique-actions">${Array.from({ length: 4 }, (_, index) => { const action = technique?.actions?.[index]; return button(esc(action ? technique?.done ? `Extra ${action.label.toLowerCase()}` : action.label : ''), 'technique', index || technique?.done ? 'secondary' : '', `data-technique-slot="${index}" data-value="${esc(action?.id || '')}"${action ? '' : ' hidden'}`); }).join('')}</div>
        <div class="control-line">${button('Redo technique · 6s', 'redo-technique', 'secondary small')}${button(technique?.done ? 'Move to shaping →' : 'Shape early →', 'prepared', technique?.done ? '' : 'secondary', 'id="prepare-finish"')}</div>
        <p class="control-hint warning" id="prepare-warning">${technique?.done ? 'Extra handling is optional and can overwork the mixture.' : 'Moving on early leaves the remaining technique unfinished and affects texture.'}</p>
        ${feedback(b)}`;
    }
    case 'shape': {
      const { text: terms } = shapingTerms(r);
      const index = b.shapeIndex || 0;
      const target = shapeTarget(b, index);
      const value = b.shapeValues?.[index] ?? 50;
      return `<div class="readout"><span>${esc(terms[1])} · ${shapeUnit(r)} ${index + 1} of ${b.shapeValues?.length || r.shape?.pieces || 1}</span><strong id="shape-value">${Math.round(value)}<small> / ${Math.round(target)}</small></strong></div>
        <div class="range-wrap shape-range"><label class="screen-reader" for="shape-range">${esc(terms[1])}, aim for ${Math.round(target)}</label><input id="shape-range" data-input="shape" type="range" min="0" max="100" value="${value}"><div class="range-labels"><span>${esc(terms[2])}</span><strong>Guide: ${Math.round(target)}</strong><span>${esc(terms[3])}</span></div></div>
        ${phaseMeter(b, b.shapeZone)}
        <div class="control-line">${button(`Redo last ${shapeUnit(r)}`, 'shape-undo', 'secondary small', b.shapeIndex ? '' : 'disabled')}${button(esc(terms[4]), 'shape-set')}</div>${feedback(b)}`;
    }
    case 'bake': return `${needsBlindBake(b) && !b.blindBaked && !b.ovenSeconds ? `<div class="blind-bake"><span>Wet filling, raw case.</span>${button('Blind bake the case · 9s', 'blind-bake', 'secondary small')}</div>` : ''}
      <div class="shelf-choices" role="group" aria-label="Oven shelf">${[['top', 'Top', 'Fast colour'], ['middle', 'Middle', 'Even'], ['bottom', 'Bottom', 'Crisp base']].map(([id, name, note]) => `<button class="cool-choice ${b.shelf === id ? 'selected' : ''}" data-action="shelf" data-value="${id}" aria-pressed="${b.shelf === id}"><strong>${name}</strong><small>${note}</small></button>`).join('')}${r.kind === 'bread' ? `<button class="cool-choice ${b.steam ? 'selected' : ''}" data-action="steam" aria-pressed="${!!b.steam}" id="steam-button"><strong>Steam ${b.steam ? 'on' : 'off'}</strong><small>Early: spring</small></button>` : ''}</div>
      <div class="heat-control"><label for="heat-range">Oven dial</label><input id="heat-range" data-input="heat" type="range" min="120" max="240" step="5" value="${b.heat}"><output id="heat-value">${Math.round(b.heat)}°C</output></div>
      <div class="oven-readout"><span>Inside: <strong id="oven-value">${Math.round(b.ovenTemp || b.heat)}°C</strong></span><span>Guide: ${t.temp}°C · about ${Math.round(t.bake)}s</span></div>
      <div class="oven-sides"><span><i id="left-colour"></i>Left: <strong id="left-bake">Pale</strong></span><span><i id="right-colour"></i>Right: <strong id="right-bake">Pale</strong></span></div>
      ${componentPanel(b)}${phaseMeter(b, currentComponent(b)?.zone || [25, 80], 'Time component work in the sage band')}
      <div class="control-line">${button('Turn the tray', 'rotate', 'secondary')}${button('Take it out', 'oven-out', 'rust')}</div>${feedback(b)}`;
    case 'cool': return `<div class="readout"><span id="cool-status">Cooling carefully</span><strong id="cool-value">${Math.round(b.cool || 0)}<small> / ${Math.round(t.cool)}s</small></strong></div>
      ${fillMeter('cool-meter', 'Cooling progress', b.cool / t.cool * 100)}
      <div class="cool-choices">${[['rack', 'On the rack', 'Even cooling'], ['tin', 'In the tin', 'Slow & supported'], ['fan', 'With a fan', 'Fast; can crack']].map(([id, name, note]) => `<button class="cool-choice ${b.coolMethod === id ? 'selected' : ''}" data-action="cool-method" data-value="${id}"><strong>${name}</strong><small>${note}</small></button>`).join('')}</div>
      ${componentPanel(b)}${phaseMeter(b, currentComponent(b)?.zone || [25, 80], 'Keep working on the filling while it cools')}
      <div class="control-line">${button('Back in the oven', 'return-oven', 'secondary small')}${button('Ready to finish →', 'cooled')}</div>${feedback(b)}`;
    case 'assemble': return `<div class="readout"><span>Piece <span id="assembly-count">${Math.min((b.assemblyIndex || 0) + 1, t.parts)}</span> of ${t.parts}</span><strong><span id="stability-value">${Math.round(b.stability ?? 100)}</span><small>% stable</small></strong></div>
      <div class="range-wrap"><label class="range-labels" for="alignment-range"><span>Place to the left</span><strong id="alignment-value">Centre: 50</strong><span>To the right</span></label><input id="alignment-range" data-input="alignment" type="range" min="0" max="100" value="${b.alignment ?? 50}" aria-label="Align the next layer, centre at 50"></div>
      ${phaseMeter(b, b.assemblyZone)}
      <div class="control-line">${button(spreadLabel(b), 'spread', 'secondary', 'id="spread-button"')}${button('Place this piece', 'place-layer', '', 'id="place-button"')}</div>
      ${b.filling && b.filling !== 'none' ? `<div class="compact-range"><label for="filling-amount">Filling <output id="filling-amount-value">${fillingWord(b.fillingAmount)}</output></label><input id="filling-amount" data-input="filling-amount" type="range" min="0" max="100" step="5" value="${b.fillingAmount ?? 50}" aria-label="How much filling between layers"></div>` : ''}
      <div class="control-line">${button('Lift last piece', 'assembly-undo', 'secondary small')}${needsCrumbCoat(b) ? button(b.crumbCoated ? '✓ Crumb coated' : 'Crumb coat · 5s', 'crumb-coat', 'secondary small', `id="crumb-coat"${b.crumbCoated || (b.assemblyIndex || 0) < t.parts ? ' disabled' : ''}`) : ''}${button('Finish assembly →', 'assembled', '', `id="assembly-finish"${(b.assemblyIndex || 0) < t.parts ? ' disabled' : ''}`)}</div>${componentPanel(b)}${feedback(b)}`;
    case 'decorate': {
      const ids = r.decorationIds || Object.keys(DECORATIONS);
      const chosen = b.decorations?.[selected], adjusting = decorTool === 'adjust';
      const colourFor = adjusting ? chosen && DECORATIONS[chosen.type]?.colourable : DECORATIONS[decorType]?.colourable;
      const activeColour = adjusting ? chosen?.colour : decorColour;
      const swatches = colourFor ? `<div class="swatches" role="group" aria-label="Colour">${decorPalette(b.flavours).map(colour => `<button class="swatch-btn ${activeColour === colour ? 'selected' : ''}" data-action="decor-colour" data-value="${colour}" style="--swatch:${colour}" aria-label="Colour ${colour}" aria-pressed="${activeColour === colour}"></button>`).join('')}</div>` : '';
      const segment = (action, value, label, current) => `<button class="segment ${current === value ? 'selected' : ''}" data-action="${action}" data-value="${value}" aria-pressed="${current === value}">${label}</button>`;
      return `<div class="readout"><span>Finishing touches <small>· the brief asks for ${t.decor}</small></span><strong id="decor-value">${b.decorations?.length || 0}</strong></div>
        <div class="segments" role="group" aria-label="Decorating tool">${segment('decor-tool', 'place', 'Place', decorTool)}${segment('decor-tool', 'adjust', 'Adjust', decorTool)}</div>
        ${adjusting ? (chosen ? `<div class="adjust-panel"><span class="component-caption">Selected · ${esc(DECORATIONS[chosen.type]?.name || chosen.type)}</span>
          <div class="compact-range"><label for="decor-angle">Turn</label><input id="decor-angle" data-input="decor-angle" type="range" min="-180" max="180" step="5" value="${Math.round(chosen.angle ?? 0)}" aria-label="Rotate decoration"><output id="decor-angle-value">${Math.round(chosen.angle ?? 0)}°</output></div>
          <div class="compact-range"><label for="decor-size">Size</label><input id="decor-size" data-input="decor-size" type="range" min="0.7" max="1.5" step="0.1" value="${chosen.size ?? 1}" aria-label="Decoration size"><output id="decor-size-value">${Number(chosen.size ?? 1).toFixed(1)}×</output></div>
          ${swatches}<div class="control-line">${button('Remove · 1s', 'decor-remove', 'secondary small')}${button('Done', 'decor-deselect', 'secondary small')}</div></div>`
          : `<p class="control-hint">Tap a decoration to pick it up. Drag it to move it, then turn, resize or recolour it.</p>`)
        : `<div class="segments" role="group" aria-label="Placement pattern">${[['single', 'Single'], ['ring', 'Ring'], ['line', 'Line'], ['cluster', 'Cluster']].map(([id, label]) => segment('decor-pattern', id, label, decorPattern)).join('')}</div>
        <div class="decor-choices" aria-label="Decoration palette">${ids.map(id => { const decor = DECORATIONS[id]; if (!decor) return ''; return `<button class="decor-choice ${decorType === id ? 'selected' : ''}" data-action="decor-type" data-value="${id}" data-decor="${id}" aria-label="${esc(decor.name || titleCase(id))}" aria-pressed="${decorType === id}"><i style="background:${esc(decor.colour || '#b8a87c')}"></i>${esc(decor.name || titleCase(id))}</button>`; }).join('')}</div>
        ${swatches}
        <div class="compact-range"><label for="decor-size">Size</label><input id="decor-size" data-input="decor-size" type="range" min="0.7" max="1.5" step="0.1" value="${decorSize}" aria-label="Decoration size"><output id="decor-size-value">${Number(decorSize).toFixed(1)}×</output></div>
        ${['ring', 'line'].includes(decorPattern) ? `<div class="compact-range"><label for="decor-count">How many</label><input id="decor-count" data-input="decor-count" type="range" min="3" max="8" step="1" value="${decorCount}" aria-label="Pieces in the pattern"><output id="decor-count-value">${decorCount}</output></div>` : ''}
        ${phaseMeter(b, [25, 80], 'Pipe & build in the band. Fruit can be placed freely.')}`}
        <p class="look-hint" id="look-hint">${esc(lookHint(b, t))}</p>
        <div class="control-line">${button('Undo', 'undo', 'secondary small')}${button('Present to the judges →', 'judge')}</div>${feedback(b)}`;
    }
    default: return '';
  }
}

function fillingWord(amount = 50) { return amount < 25 ? 'Thin' : amount > 70 ? 'Generous' : 'Even'; }
/** What the judges would notice about the finish right now. */
function lookHint(b, t) {
  if (!b.decorations?.length) return 'The top is bare. Start with something that hints at your flavour.';
  const look = analysePresentation(b, t.decor);
  return look.notes.bad[0] || look.notes.good[0] || (b.decorations.length < t.decor ? `${t.decor - b.decorations.length} more and the brief is met.` : 'Looking deliberate and well spaced.');
}

function finishQuality(b) {
  const shape = b.shapeScores?.length ? b.shapeScores.reduce((sum, value) => sum + value, 0) / b.shapeScores.length : 80;
  const assembly = b.assemblyScores?.length ? b.assemblyScores.reduce((sum, value) => sum + value, 0) / b.assemblyScores.length : 100;
  return b.score?.total ?? Math.min(shape, assembly, b.stability ?? 100);
}

function foodOptions(b, r, selected = -1) {
  return {
    kind: r.kind, recipeId: r.art || r.id, family: r.family, flavour: b.flavour, selected,
    flavours: b.flavours || [b.flavour], filling: b.filling, finish: b.finish,
    design: b.design, decorations: b.decorations || [], shapeValues: b.shapeValues || [],
    assemblyScores: b.assemblyScores || [], assemblyIndex: b.assemblyIndex || 0,
    alignment: b.alignment, defects: b.defects || {}, stage: b.stage,
    quality: finishQuality(b), doneness: b.bakeDoneness ?? (b.stage === 'shape' ? .15 : 1),
    layers: Math.max(1, b.assemblyScores?.length || r.assemblyParts || (r.round === 'Showstopper' ? 3 : 2)),
  };
}

export function sceneView(b, r, { decorType = 'berry', selected = -1, decorTool = 'place', decorPattern = 'single' } = {}) {
  const t = targets(b);
  let art;
  let badge = '';
  if (b.stage === 'measure') {
    const ingredient = r.ingredients[b.ingredient];
    art = Art.bowlSVG({ amount: (b.ingredient + (b.amount || 0) / (ingredient?.target || 1)) / r.ingredients.length * 100, flavour: b.flavour });
    badge = `${b.ingredient} of ${r.ingredients.length} ingredients in the bowl`;
  } else if (b.stage === 'prepare') {
    const technique = currentTechnique(b);
    art = Art.techniqueSVG({ type: technique?.done ? technique.type || 'beat' : technique?.type || 'beat', progress: technique?.done ? 1 : (technique?.count || 0) / (technique?.total || 1), phase: b.phase, quality: technique?.quality ?? 80, flavour: b.flavour, readiness: technique?.readiness ?? 0 });
    badge = technique?.done ? 'The preparation is ready.' : technique?.rest ? `${technique.name} · ${restStatus(technique)}` : `${technique?.name || 'Preparing'} · ${technique?.count || 0} / ${technique?.total || 0}`;
  } else if (b.stage === 'shape') {
    art = Art.shapingSVG({ mode: shapingTerms(r).mode, values: b.shapeValues || [], index: b.shapeIndex || 0, target: shapeTarget(b, b.shapeIndex || 0), kind: r.kind });
    badge = `${titleCase(shapeUnit(r))} ${(b.shapeIndex || 0) + 1} of ${b.shapeValues?.length || r.pieces || 1} · even shaping matters`;
  } else if (b.stage === 'bake') {
    art = Art.ovenSVG({ heat: b.ovenTemp ?? b.heat, progress: b.bake / t.bake * 100, kind: r.kind, left: b.sides?.[0], right: b.sides?.[1], shelf: b.shelf, steam: b.steam, blind: b.blindBaked && !b.ovenSeconds });
    badge = `${titleCase(b.shelf || 'middle')} shelf · ${b.rotations || 0} tray turns${b.blindBaked ? ' · case sealed' : ''}`;
  } else if (b.stage === 'assemble') {
    art = Art.assemblySVG(foodOptions(b, r));
    badge = `${b.assemblyIndex || 0} of ${t.parts} pieces placed`;
  } else {
    art = Art.foodSVG(foodOptions(b, r, b.stage === 'decorate' ? selected : -1));
    if (b.stage === 'cool') badge = b.cool >= t.cool ? 'Ready for the finishing touches' : `${b.coolMethod === 'tin' ? 'Resting in the tin' : b.coolMethod === 'fan' ? 'Cooling with a fan' : 'On the cooling rack'}`;
  }
  const hint = decorTool === 'adjust' ? 'Tap a decoration to pick it up · drag to move' : decorPattern === 'single' ? 'Tap your bake to decorate · drag from the palette if you prefer' : `Tap where the ${decorPattern} should centre`;
  const overlay = b.stage === 'decorate' ? `<div class="decor-surface ${decorTool === 'adjust' ? 'adjusting' : ''}" id="decor-surface" role="button" tabindex="0" aria-label="${decorTool === 'adjust' ? 'Select a decoration on your bake' : `Place ${esc(DECORATIONS[decorType]?.name || decorType)} on your bake`}"><span class="drop-hint">${hint}</span></div>` : '';
  return art + (badge ? `<div class="scene-badge">${esc(badge)}</div>` : '') + overlay;
}

export function recipeView(b, r) {
  const t = b ? targets(b) : { temp: r.temp, bake: r.bakeTime, cool: r.coolTime };
  const choices = (b?.flavours || [b?.flavour]).filter(Boolean).map(id => FLAVOURS[id]?.name || titleCase(id));
  const selected = [b?.filling, b?.finish].filter(id => id && id !== 'none').map(id => componentById(id)?.name || titleCase(id));
  const steps = r.steps || r.techniques || [];
  return `<span class="eyebrow">The recipe book</span><h2>${esc(r.name)}</h2><span class="tag">${esc(r.round)}</span>
    ${choices.length || selected.length ? `<p class="recipe-flavours">${[...choices, ...selected].map(esc).join(' · ')}</p>` : ''}
    <ul class="ingredient-list">${r.ingredients.map((item, i) => `<li><span>${b && i < b.ingredient ? '✓ ' : ''}${esc(item.name)}</span><span>${item.target ?? item.amount}${esc(item.unit)}</span></li>`).join('')}</ul>
    ${steps.length ? `<div class="recipe-method"><h3>Method</h3><ol>${steps.map(step => `<li>${esc(typeof step === 'string' ? titleCase(step) : step.name || step.label || titleCase(step.type))}${step.instruction ? `<small>${esc(step.instruction)}</small>` : ''}</li>`).join('')}</ol></div>` : ''}
    <div class="side-metrics"><div><strong>${t.temp}°C</strong>Oven guide</div><div><strong>~${Math.round(t.bake)}s</strong>Baking guide</div><div><strong>${Math.round(t.cool)}s</strong>Rack cooling guide</div><div><strong>${b ? t.parts : r.assemblyParts || '—'}</strong>Assembly pieces</div></div>
    <div class="note">${esc(r.round === 'Technical' ? r.technicalHint || r.tip : r.tip)}</div><p class="save-note">Watch the food as well as the clock. Simple bakes can earn excellent scores.</p>`;
}

function colourForBake(ratio) {
  if (ratio < .72) return ['Pale', '#d5c3a3'];
  if (ratio < .92) return ['Colouring', '#d5a269'];
  if (ratio <= 1.08) return ['Golden', '#b5753b'];
  if (ratio < 1.23) return ['Darkening', '#8c5430'];
  return ['Very dark', '#553725'];
}

/** Updates values without replacing controls, preserving focus and captured touches. */
export function updateWorkbench(b, r) {
  if (!b) return;
  const t = targets(b);
  const find = id => document.getElementById(id);
  const set = (id, value) => { const node = find(id); if (node && node.textContent !== String(value)) node.textContent = value; };
  const fill = (id, value) => { const node = find(id); if (node) node.style.width = `${clamp(value)}%`; };
  const [heading, instruction] = stageCopy(b, r);
  const headingNode = document.querySelector('.station-heading h1');
  const instructionNode = document.querySelector('.station-heading p');
  if (headingNode && headingNode.textContent !== heading) headingNode.textContent = heading;
  if (instructionNode && instructionNode.textContent !== instruction) instructionNode.textContent = instruction;
  if (b.lastFeedback) set('bench-feedback', b.lastFeedback);
  let zone = [25, 80];
  if (b.stage === 'measure') {
    const item = r.ingredients[b.ingredient];
    if (item) {
      const target = item.target ?? item.amount;
      const error = (b.amount || 0) - target;
      set('amount-value', number(b.amount, target));
      set('measure-error', `${error >= 0 ? '+' : ''}${number(error, target)}${item.unit}`);
      const errorNode = find('measure-error');
      if (errorNode) errorNode.classList.toggle('accurate', Math.abs(error / target) < .015);
      fill('measure-meter', b.amount / target * 66.667);
      set('pour-rate-value', `${Math.round(b.pourRate ?? 65)}%`);
    }
  }
  if (b.stage === 'prepare' && currentTechnique(b)?.rest) {
    const technique = currentTechnique(b);
    set('rest-status', restStatus(technique));
    const node = find('rest-fill');
    if (node) node.style.width = `${clamp(technique.readiness / Number(node.dataset.scale || 1.6) * 100)}%`;
  } else if (b.stage === 'prepare') {
    const technique = currentTechnique(b);
    if (technique) {
      zone = technique.zone;
      set('technique-task', technique.name);
      set('technique-count', technique.done ? 'Ready' : `${technique.count} / ${technique.total}`);
      set('phase-label', technique.done ? 'Ready to shape. Extra handling may damage the mixture.' : `Next: ${technique.actions.find(action => action.id === technique.expected)?.label || titleCase(technique.expected)} in the band`);
      document.querySelectorAll('[data-technique-slot]').forEach(node => {
        const action = technique.actions[Number(node.dataset.techniqueSlot)];
        node.hidden = !action;
        node.disabled = !action;
        if (action) {
          node.dataset.value = action.id;
          const label = technique.done ? `Extra ${action.label.toLowerCase()}` : action.label;
          if (node.textContent !== label) node.textContent = label;
          node.classList.toggle('expected-action', !technique.done && action.id === technique.expected);
          node.classList.toggle('secondary', technique.done || Number(node.dataset.techniqueSlot) > 0);
        }
      });
      const finish = find('prepare-finish');
      if (finish) {
        finish.disabled = false;
        finish.textContent = technique.done ? 'Move to shaping →' : 'Shape early →';
        finish.classList.toggle('secondary', !technique.done);
      }
      const warning = find('prepare-warning');
      if (warning) warning.textContent = technique.done ? 'Extra handling is optional and can overwork the mixture.' : 'Moving on early leaves the remaining technique unfinished and affects texture.';
    }
  }
  if (b.stage === 'shape') {
    set('shape-value', `${Math.round(b.shapeValues?.[b.shapeIndex] ?? 50)} / ${Math.round(shapeTarget(b, b.shapeIndex || 0))}`);
    zone = b.shapeZone || [28, 78];
  }
  if (b.stage === 'bake') {
    set('heat-value', `${Math.round(b.heat)}°C`);
    set('oven-value', `${Math.round(b.ovenTemp || b.heat)}°C`);
    const sides = Array.isArray(b.sides) ? b.sides : [b.sides?.left ?? b.bake, b.sides?.right ?? b.bake];
    ['left', 'right'].forEach((side, index) => {
      const [label, colour] = colourForBake((sides[index] || 0) / t.bake);
      set(`${side}-bake`, label);
      const swatch = find(`${side}-colour`);
      if (swatch) swatch.style.backgroundColor = colour;
    });
  }
  if (b.stage === 'cool') {
    set('cool-value', `${Math.round(b.cool || 0)} / ${Math.round(t.cool)}s`);
    set('cool-status', b.cool >= t.cool ? 'Firm enough to finish' : b.cool < t.cool * .5 ? 'Still warm inside' : 'Almost ready');
    fill('cool-meter', b.cool / t.cool * 100);
    document.querySelectorAll('[data-action="cool-method"]').forEach(node => node.classList.toggle('selected', node.dataset.value === b.coolMethod));
  }
  if (b.stage === 'assemble') {
    zone = b.assemblyZone || [25, 80];
    set('assembly-count', Math.min((b.assemblyIndex || 0) + 1, t.parts));
    set('alignment-value', `${Math.round(b.alignment ?? 50)} · aim for 50`);
    set('stability-value', Math.round(b.stability ?? 100));
    set('spread-button', b.assemblySpread ? '✓ Support ready' : spreadLabel(b));
    const spread = find('spread-button');
    if (spread) spread.disabled = b.assemblySpread || b.assemblyIndex >= t.parts;
    const place = find('place-button');
    if (place) place.disabled = b.assemblyIndex >= t.parts;
    const finish = find('assembly-finish');
    if (finish) finish.disabled = b.assemblyIndex < t.parts;
  }
  if (b.stage === 'assemble') set('filling-amount-value', fillingWord(b.fillingAmount));
  if (['bake', 'cool', 'assemble'].includes(b.stage) || (b.stage === 'prepare' && currentTechnique(b)?.rest)) {
    const component = currentComponent(b);
    const panel = find('component-panel');
    if (panel) panel.hidden = !component || component.done;
    const timing = document.querySelector('.timing-block');
    if (timing && b.stage !== 'assemble') timing.hidden = !component || component.done;
    if (component) {
      if (b.stage !== 'assemble') zone = component.zone || zone;
      set('component-name', component.name);
      set('component-value', `${component.count} / ${component.total} careful actions`);
      set('component-button', component.done ? '✓ Ready' : `${titleCase(component.method || 'Prepare')} ${component.role === 'finish' ? 'finish' : 'filling'}`);
      const action = find('component-button');
      if (action) action.disabled = component.done;
    }
  }
  if (b.stage === 'decorate') { set('decor-value', b.decorations?.length || 0); set('look-hint', lookHint(b, t)); }
  const cursor = find('phase-cursor');
  if (cursor) cursor.style.left = `${clamp(b.phase)}%`;
  const band = find('phase-zone');
  if (band) { band.style.left = `${zone[0]}%`; band.style.width = `${zone[1] - zone[0]}%`; }
}
