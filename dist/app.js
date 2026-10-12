import { WEEKS, RIVALS, FLAVOURS, COMPONENTS, DECORATIONS, BRIEFS, ALL_RECIPES, STRENGTHS, getRoundRecipes } from './content.js';
import {
  createSeason, createBake, getRecipe, recipeFor, advance, targets, migrateSave,
  adjustMeasure, commitIngredient, currentTechnique, recordTechnique, recoverTechnique,
  finishPreparation, shapeTarget, commitShape, undoShape, workComponent,
  rotateBake, removeOven, returnOven, setCooling, finishCooling, setShelf, setSteam, blindBake,
  assemble, finishAssembly, setFillingAmount, crumbCoat, placeDecoration as addDecoration, placeDecorations,
  moveDecoration, updateDecoration, removeDecoration, judgeBake, finishRound, retryWeek, ordinal,
} from './engine.js';
import { BASES, FORMS, INCLUSIONS, composeRecipe, formsFor, basesFor, formFor } from './pantry.js';
import { patternPoints } from './presentation.js';
import { tentSVG, foodSVG, avatarSVG, iconSVG, snapDecoration } from './art.js';
import { stageCopy, controlsView, sceneView, recipeView, updateWorkbench } from './workbench.js';

const $ = s => document.querySelector(s);
const app = $('#app'), modal = $('#modal');
const KEY = 'village-bake-save-v1';
const recipes = ALL_RECIPES;
const STEPS = ['measure', 'prepare', 'shape', 'bake', 'cool', 'assemble', 'decorate'];
const STEP_NAMES = ['Measure', 'Prepare', 'Shape', 'Bake', 'Cool', 'Assemble', 'Finish'];
const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
let data = { version: 2, season: null, run: null, practice: null, records: {}, muted: false, tutorialSeen: false };
try {
  const raw = localStorage.getItem(KEY), old = raw ? JSON.parse(raw) : null;
  if (old && [1, 2].includes(old.version)) {
    if (old.version === 1) {
      try { if (!localStorage.getItem(KEY + '-before-expansion')) localStorage.setItem(KEY + '-before-expansion', raw); }
      catch { /* A full storage quota must not prevent reading existing progress. */ }
    }
    data = migrateSave({ ...data, ...old });
  }
} catch (error) { console.warn('The existing save could not be read.', error); }
let mode = 'season', screen = 'menu', holding = null, activePointer = null, paused = false;
let toastTimer, ctx, lastFrame = performance.now(), lastArt = 0, lastSave = 0;
let decorType = 'berry', decorSize = 1, dragDecor = null, bookWeek = 0;
let decorTool = 'place', decorPattern = 'single', decorCount = 5, decorColour = null, selectedDecor = -1, movingDecor = null;
function decorUI() { return { decorType, decorSize, decorTool, decorPattern, decorCount, decorColour, selected: selectedDecor }; }

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); }
  catch { if (!save.warned) { toast('This browser could not save. Keep this tab open to continue.'); save.warned = true; } }
}
function run() { return mode === 'practice' ? data.practice : data.run; }
function briefOf(u = run()) { return mode === 'practice' || !u ? null : BRIEFS[u.week]?.[u.round] ?? null; }
function recipe() {
  const u = run();
  if (u?.bake?.customRecipe) return u.bake.customRecipe;
  if (u?.source === 'custom' && u.custom && !u.bake) return composeRecipe({ ...u.custom, week: mode === 'practice' ? null : u.week, round: u.round ?? 0 });
  return recipes.find(r => r.id === u?.recipeId) || getRecipe(0, 0);
}
function bake() { return run()?.bake; }
function nameOf(id) { return id === 'you' ? 'You' : RIVALS.find(r => r.id === id)?.name || id; }
function portrait(id) { return avatarSVG(id === 'you' ? 7 : Math.max(0, RIVALS.findIndex(r => r.id === id))); }
function fmtTime(n) { n = Math.max(0, Math.floor(n)); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`; }
function component(id) { return COMPONENTS.find(c => c.id === id); }
function shapeUnits(r) { return ({level:'levelling zones',roll:'rolling passes',plait:'strands',line:'lining sections',pipe:'piped pieces',portion:'portions'})[r.shapeMode] || 'pieces'; }
function optionDefaults(r) {
  return { flavours: r.prescribed?.flavours || [r.flavours[0]], filling: r.prescribed?.filling || r.fillings?.[0] || 'none', finish: r.prescribed?.finish || r.finishes?.[0] || 'none', design: 'stack', strength: 'balanced' };
}
function runOptions(u = run()) {
  const r = recipe();
  return { ...optionDefaults(r), ...u?.options, ...(u?.options ? {} : u?.flavour ? { flavours: [u.flavour] } : {}) };
}
function foodOptions(b = bake(), r = recipe()) {
  const flavours = b?.flavours || (b?.flavour ? [b.flavour] : runOptions().flavours);
  return { kind: r.kind, recipeId: r.art || r.id, flavour: flavours[0], flavours,
    filling: b?.filling ?? runOptions().filling, finish: b?.finish ?? runOptions().finish,
    design: b?.design || 'stack', layers: Math.max(1, b?.assemblyScores?.length || r.assemblyParts || (r.round === 'Showstopper' ? 3 : 2)),
    shapeValues: b?.shapeValues || [], assemblyScores: b?.assemblyScores || [], defects: b?.defects || {},
    quality: b?.score?.total ?? b?.stability ?? 88, doneness: b?.bakeDoneness ?? 1,
    decorations: b?.decorations || [], stage: b?.stage || 'judged' };
}
function go(next) {
  stopHold(); screen = next; paused = false;
  if (run() && ['brief', 'game', 'result', 'week'].includes(next)) run().view = next;
  save(); render();
}
function openModal(html) { stopHold(); paused = true; modal.innerHTML = html; if (!modal.open) modal.showModal(); }
function closeModal() { if (modal.open) modal.close(); paused = false; lastFrame = performance.now(); }
function tutorial() {
  openModal(`${modalHeading('Back to the baking bench.')}<p>The same tent, with much more to make. Your technique now matters at every station.</p>
    <div class="tutorial-step"><b>1</b><div><strong>Make it yours.</strong>Pick from the recipe book, or create your own: choose a base, give it a shape, and tune the sweetness, richness and flavour strength. Technicals follow the judges’ exact recipe.</div></div>
    <div class="tutorial-step"><b>2</b><div><strong>Every ingredient has a job.</strong>Too much raising agent and it sinks; too much sugar and it darkens early. Beat, knead and fold in rhythm, and call the prove or the chill yourself.</div></div>
    <div class="tutorial-step"><b>3</b><div><strong>Know your oven.</strong>Pick a shelf, turn the tray, steam your bread and blind bake any case with a wet filling. Nobody wants a soggy bottom.</div></div>
    <div class="tutorial-step"><b>4</b><div><strong>Build, then finish.</strong>Cool it, spread just enough filling, and crumb coat your cakes. Place details singly or as a ring, line or cluster, then adjust them. The judges score what is actually on the plate.</div></div>
    <div class="tutorial-step"><b>5</b><div><strong>The clock is part of the challenge.</strong>Extra work takes time. Practice has no deadline penalty. Pause whenever you need; leaving the tab pauses everything.</div></div>
    <div class="dialog-actions">${btn('Apron on. Let’s bake.','close')}</div>`);
  data.tutorialSeen = true; data.expansionTutorialSeen = true; save();
}
function beginSeason() { data.season = createSeason(); mode = 'season'; newBrief(); if (!data.expansionTutorialSeen) tutorial(); }
function newBrief() {
  const r = getRecipe(data.season.week, data.season.round);
  data.run = { recipeId: r.id, week: data.season.week, round: data.season.round, source: 'book', options: optionDefaults(r), bake: null, view: 'brief', result: null };
  go('brief');
}
function startPractice(id) {
  const r = recipes.find(x => x.id === id); if (!r) return;
  mode = 'practice';
  const week = WEEKS.findIndex((_, i) => [0,1,2].some(round => getRoundRecipes(i, round).some(v => v.id === id)));
  data.practice = { recipeId: id, week: Math.max(0, week), round: ['Signature','Technical','Showstopper'].indexOf(r.round), source: 'book', options: optionDefaults(r), bake: null, view: 'brief', result: null };
  go('brief');
}
function startPracticeCreation() {
  mode = 'practice';
  data.practice = { recipeId: null, week: bookWeek, round: 0, source: 'custom', custom: { base: 'sponge', form: 'layer-cake', sweetness: 0, richness: 0, inclusion: 'none' }, bake: null, view: 'brief', result: null };
  data.practice.options = optionDefaults(recipe());
  go('brief');
}
function useBuilder(on) {
  const u = run();
  if (!u || u.bake || (u.round === 1 && mode !== 'practice')) return;
  u.source = on ? 'custom' : 'book';
  if (on && !u.custom) {
    const base = basesFor(briefOf())[0] || 'sponge';
    u.custom = { base, form: formsFor(base, briefOf())[0], sweetness: 0, richness: 0, inclusion: 'none' };
  }
  if (!on && !recipes.some(r => r.id === u.recipeId)) u.recipeId = getRoundRecipes(u.week, u.round)[0]?.id ?? u.recipeId;
  u.options = optionDefaults(recipe()); save(); render();
}
function setBuild(field, value) {
  const u = run(); if (!u || u.bake || u.source !== 'custom') return;
  if (field === 'base' && BASES[value] && formsFor(value, briefOf()).length) { u.custom.base = value; u.custom.form = formsFor(value, briefOf())[0]; }
  else if (field === 'form' && formsFor(u.custom.base, briefOf()).includes(value)) u.custom.form = value;
  else if (['sweetness', 'richness'].includes(field)) u.custom[field] = Math.max(-2, Math.min(2, Math.round(Number(value) || 0)));
  else if (field === 'inclusion' && INCLUSIONS[value]) u.custom.inclusion = value;
  else return;
  const r = recipe(), opts = runOptions();
  // Keep what still fits the new creation; reset anything that no longer does.
  u.options = { ...opts, flavours: opts.flavours.filter(f => r.flavours.includes(f)).length ? opts.flavours.filter(f => r.flavours.includes(f)) : [r.flavours[0]],
    filling: r.fillings.includes(opts.filling) ? opts.filling : r.fillings[0], finish: r.finishes.includes(opts.finish) ? opts.finish : r.finishes[0] };
  save(); render();
}
function selectRecipe(id) {
  const u = run(), choices = getRoundRecipes(u.week, u.round);
  const r = choices.find(v => v.id === id); if (!r || u.bake) return;
  u.recipeId = id; u.source = 'book'; u.options = optionDefaults(r); save(); render();
}
function selectField(label, field, entries, selected, disabled = false) {
  return `<label class="option-field"><span>${label}</span><select data-input="${field}" ${disabled ? 'disabled' : ''}>${entries.map(v => `<option value="${v.id}" ${v.id === selected ? 'selected' : ''}>${esc(v.name)}</option>`).join('')}</select></label>`;
}
function rangeField(label, field, value, low, high, words) {
  return `<label class="option-field tweak"><span>${label} <output>${esc(words[value - low])}</output></span><input type="range" data-input="${field}" min="${low}" max="${high}" step="1" value="${value}" aria-label="${label}"></label>`;
}
function builderView(u) {
  const brief = briefOf(u), c = u.custom;
  const bases = Object.keys(BASES).filter(id => basesFor(brief).includes(id));
  const forms = formsFor(c.base, brief);
  return `<section class="builder" aria-label="Create your own bake">
    <div class="builder-step"><span class="step-no">1</span><div><h3>Choose a base</h3><p class="muted">What it is made of decides how it is made, and what can go wrong.</p></div></div>
    <div class="base-cards">${bases.map(id => { const b = BASES[id]; return `<button class="base-card ${id === c.base ? 'selected' : ''}" data-action="build-base" data-value="${id}" aria-pressed="${id === c.base}"><strong>${esc(b.name)}</strong><small>${esc(b.note)}</small><span class="difficulty" aria-label="Difficulty ${b.difficulty} of 3">${'●'.repeat(b.difficulty)}${'○'.repeat(3 - b.difficulty)} · ${esc(b.steps.map(s => s.type).join(' → '))}</span></button>`; }).join('')}</div>
    <div class="builder-step"><span class="step-no">2</span><div><h3>Give it a shape</h3><p class="muted">${brief ? 'Only shapes that answer the brief are offered.' : 'Anything goes in the practice kitchen.'}</p></div></div>
    <div class="form-chips">${forms.map(id => { const f = formFor(c.base, id); return `<button class="form-chip ${id === c.form ? 'selected' : ''}" data-action="build-form" data-value="${id}" aria-pressed="${id === c.form}"><strong>${esc(f.name)}</strong><small>${f.pieces} ${f.pieces > 1 ? 'pieces' : 'piece'} · ${f.parts} part${f.parts > 1 ? 's' : ''}${f.case ? ' · lined case' : ''}</small></button>`; }).join('')}</div>
  </section>`;
}
function brief() {
  const u = run(), r = recipe(), week = WEEKS[u.week], opts = runOptions(), fixed = r.round === 'Technical';
  const custom = u.source === 'custom' && !fixed;
  const draft = createBake(r, { ...opts, practice: mode === 'practice' }), t = targets(draft);
  const choices = mode === 'practice' ? [] : getRoundRecipes(u.week, u.round);
  const briefInfo = BRIEFS[u.week]?.[u.round];
  const harmony = opts.flavours.length < 2 || FLAVOURS[opts.flavours[0]]?.pairs?.includes(opts.flavours[1]) || FLAVOURS[opts.flavours[1]]?.pairs?.includes(opts.flavours[0]);
  const flavourEntries = r.flavours.map(id => ({ id, name: FLAVOURS[id].name }));
  const lead = FLAVOURS[opts.flavours[0]];
  const strengthNote = lead?.intensity === 'delicate' && opts.strength === 'bold' ? `${lead.name} is delicate: bold may overpower it.` : lead?.intensity === 'robust' && opts.strength === 'subtle' ? `${lead.name} can take more confidence than a whisper.` : '';
  const componentWarnings = ['filling','finish'].map(role=>component(opts[role])).filter(c=>c&&c.id!=='none'&&c.flavours?.length&&!opts.flavours.some(f=>c.flavours.includes(f))).map(c=>`${c.name} can overpower your chosen flavour. Try a different component or flavour pairing.`);
  const tabs = !fixed ? `<div class="brief-tabs" role="tablist"><button role="tab" class="brief-tab ${!custom ? 'selected' : ''}" data-action="brief-tab" data-value="book" aria-selected="${!custom}">From the recipe book</button><button role="tab" class="brief-tab ${custom ? 'selected' : ''}" data-action="brief-tab" data-value="custom" aria-selected="${custom}">Create your own</button></div>` : '';
  const sweet = u.custom?.sweetness ?? 0, rich = u.custom?.richness ?? 0;
  return `<main class="page fade-in">${header(`<span class="top-note">${mode === 'practice' ? 'The practice kitchen' : `${data.season.active.length} bakers · Week ${u.week + 1} of 6`}</span>`)}<div class="scroll-area">
    <div class="page-intro"><span class="eyebrow">${mode === 'practice' ? 'Room to learn. Room to create.' : `Week ${u.week+1} · ${r.round}`}</span><h1>${mode === 'practice' && custom ? 'Your own creation' : week.name}</h1><p>${esc(mode === 'practice' ? (custom ? 'Build anything you like. No brief, no clock.' : week.subtitle) : briefInfo?.description || week.subtitle)}</p></div>
    ${mode === 'practice' ? '' : `<div class="week-tabs">${WEEKS.map((w,i)=>`<span class="week-pill ${i===u.week?'active':''}">${String(i+1).padStart(2,'0')} ${w.theme}</span>`).join('')}</div>`}
    ${tabs}
    ${custom ? builderView(u) : choices.length > 1 ? `<div class="recipe-options">${choices.map(v=>`<button class="recipe-option ${v.id===r.id?'selected':''}" data-action="choose-recipe" data-value="${v.id}" aria-pressed="${v.id===r.id}"><span class="recipe-option-art">${foodSVG({kind:v.kind,recipeId:v.art||v.id,flavour:v.flavours[0],layers:v.assemblyParts,decorations:[]})}</span><span><strong>${esc(v.name)}</strong><small>${esc(v.method)} · ${v.pieces} ${shapeUnits(v)} · ${v.assemblyParts} assembly parts</small></span></button>`).join('')}</div>` : ''}
    <div class="brief-grid"><div class="brief-art"><span class="tag">${custom ? 'Your design' : `${r.round} challenge`}</span>${foodSVG({...foodOptions(draft,r),doneness:1,quality:100,stage:'judged'})}<div class="recipe-journey">${r.steps.map(s=>`<span>${esc(s.type)}</span>`).join('<i>→</i>')}<i>→</i><span>${esc(r.shapeMode)}</span></div></div>
    <section class="recipe-card"><span class="eyebrow">${fixed ? 'The judges’ recipe · prescribed' : custom ? 'Your recipe, your rules' : 'Your brief, your bake'}</span><h2>${esc(r.name)}</h2><p class="body-copy muted">${esc(r.description)}</p>
    <div class="recipe-meta"><span>◷ ${mode === 'practice' ? 'Untimed practice' : fmtTime(t.budget) + ' in the tent'}</span><span>${r.steps.length} preparation stages</span><span>${t.parts} assembly part${t.parts > 1 ? 's' : ''}</span></div>
    <div class="flavour-fields">${selectField('Main flavour','flavour',flavourEntries,opts.flavours[0],fixed)}${selectField('A second note','accent',[{id:'none',name:'Let the main flavour shine'},...flavourEntries.filter(x=>x.id!==opts.flavours[0])],opts.flavours[1]||'none',fixed)}</div>
    <div class="flavour-fields">${selectField('Strength','strength',Object.entries(STRENGTHS).map(([id,v])=>({id,name:`${v.name} · ${v.note}`})),fixed?'balanced':opts.strength||'balanced',fixed)}</div>
    <p class="pairing-note ${harmony&&!strengthNote?'':'warning'}">${fixed?'Follow these flavours and components exactly.':strengthNote||(opts.flavours.length<2?'A single flavour can be beautifully judged.':harmony?'These flavours complement each other.':'An unusual pairing: balance will be harder to achieve.')}</p>
    ${custom ? `<div class="flavour-fields">${rangeField('Sweetness','sweetness',sweet,-2,2,['Barely','Less','Classic','Sweeter','Very sweet'])}${rangeField('Richness','richness',rich,-2,2,['Lean','Lighter','Classic','Richer','Indulgent'])}</div>
    <div class="flavour-fields">${selectField('Something folded through','inclusion',Object.entries(INCLUSIONS).filter(([id])=>id==='none'||r.kind!=='dessert').map(([id,v])=>({id,name:v.name})),u.custom.inclusion||'none')}</div>` : ''}
    <div class="flavour-fields">${selectField('Filling','filling',(r.fillings||['none']).map(id=>({id,name:component(id)?.name||'No filling'})),opts.filling,fixed)}${selectField('Finish','finish',(r.finishes||['none']).map(id=>({id,name:component(id)?.name||'Natural finish'})),opts.finish,fixed)}</div>
    ${componentWarnings.map(note=>`<p class="pairing-note warning">${esc(note)}</p>`).join('')}
    <div class="workload-note"><strong>Your plan</strong><span>${r.ingredients.length} ingredients · ${r.pieces} ${shapeUnits(r)} · ${t.parts} assembly part${t.parts > 1 ? 's' : ''}${r.needsCase ? ' · a case to blind bake' : ''}</span><span>${[opts.filling,opts.finish].filter(x=>x&&x!=='none').map(x=>component(x)?.name).filter(Boolean).join(' + ')||'Let the bake speak for itself.'}</span></div>
    <p class="control-hint" style="text-align:left;margin-top:12px">Every bake can score highly. Extra components mean real extra work; your technique decides the result.</p></section></div>
    <div class="brief-footer"><p><strong>${fixed?'Read the method':'From the recipe book'}</strong><br>${esc(fixed?r.technicalHint:r.tip)}</p>${btn('Ready, set… bake! &nbsp; →','start')}</div><p class="save-note">${mode==='practice'?'Practice never changes your competition.':'Competition progress is saved on this browser.'}</p></div></main>`;
}
function game() {
  const b = bake(), r = recipe(), u = run(), [title, instruction] = stageCopy(b,r);
  const steps = targets(b).parts > 1 || b.filling !== 'none' || b.finish !== 'none' ? STEPS : STEPS.filter(s=>s!=='assemble');
  return `<main class="game fade-in"><header class="topbar">${brand()}<div class="game-status">${mode==='practice'?'PRACTICE KITCHEN':`WEEK ${u.week+1} · ${r.round.toUpperCase()}`}<strong>${esc(r.name)}</strong></div><div class="top-actions"><div class="timer" id="timer"><small>TIME LEFT</small><span id="timer-value">${fmtTime(targets(b).budget-b.elapsed)}</span></div>${iconButton('Open recipe','recipe','book','recipe-toggle')}${iconButton('Pause game','pause','pause')}</div></header>
    <nav class="steps" aria-label="Baking stages">${steps.map((s,i)=>`<div class="step ${b.stage===s?'active':STEPS.indexOf(b.stage)>STEPS.indexOf(s)?'done':''}"><b>${STEPS.indexOf(b.stage)>STEPS.indexOf(s)?'✓':i+1}</b><span>${STEP_NAMES[STEPS.indexOf(s)]}</span></div>`).join('')}</nav>
    <div class="play-layout"><section class="workspace"><div class="station-heading"><span class="eyebrow">${r.round==='Technical'?'The technical bench':'Your little corner of the tent'}</span><h1>${title}</h1><p>${instruction}</p></div><div class="scene" id="scene"></div><div class="control-tray">${controlsView(b,r,decorUI())}</div></section><aside class="side-recipe">${recipeView(b,r)}</aside></div></main>`;
}
function paintScene() { if(screen==='game'&&$('#scene')) $('#scene').innerHTML=sceneView(bake(),recipe(),decorUI()); }
function refreshTray() { const tray=$('.control-tray'); if(screen==='game'&&tray){tray.innerHTML=controlsView(bake(),recipe(),decorUI());} paintScene(); updateReadouts(); }
function updateReadouts() {
  if(screen!=='game'||!bake())return;
  const b=bake(), t=targets(b); updateWorkbench(b,recipe());
  const timer=$('#timer-value'); if(timer)timer.textContent=mode==='practice'?'∞':(b.elapsed>t.budget?'+':'')+fmtTime(Math.abs(t.budget-b.elapsed));
  $('#timer')?.classList.toggle('overtime',mode!=='practice'&&b.elapsed>t.budget);
}
function rivalBakeArt(detail,score) {
  const b=detail.bake,opts={kind:b.kind,recipeId:b.art,layers:b.layers,defects:b.defects||{}};
  const centre=snapDecoration(opts,350,235),cx=100+centre.x*500,cy=150+centre.y*200;
  const points=b.decorCount>2?patternPoints('ring',cx,cy,b.decorCount):patternPoints('line',cx,cy,Math.max(1,b.decorCount));
  const decorations=b.decorCount?points.slice(0,b.decorCount).map((p,j)=>({...snapDecoration(opts,p.x,p.y),type:b.decorTypes[j%b.decorTypes.length],size:.9})):[];
  return foodSVG({...opts,flavour:b.flavours[0],flavours:b.flavours,filling:b.filling,finish:b.finish,quality:score,doneness:b.doneness,decorations,stage:'judged'});
}
function rivalLineup() {
  const r=recipe(), rows=run().result.roundRanking.filter(p=>p.id!=='you');
  return `<section class="lineup-section"><div class="lineup-heading"><span class="eyebrow">Around the judging table</span><h2>From the other benches.</h2></div><div class="bake-lineup">${rows.map((p,i)=>{
    if(p.detail?.bake){const d=p.detail;
      return `<article class="lineup-card ${d.mishap?'mishap':d.triumph?'triumph':''}"><div class="lineup-food">${rivalBakeArt(d,p.score)}</div><div class="lineup-caption"><span>${esc(p.name||nameOf(p.id))}</span><strong>${Math.round(p.score)}<small> / 100</small></strong></div><p class="rival-bake-name">${esc(d.bake.name)} · ${esc(d.bake.flavours.map(f=>FLAVOURS[f]?.name).filter(Boolean).join(' & '))}</p><p class="rival-verdict"><b>${esc(d.verdict.judge)}:</b> “${esc(d.verdict.text)}”</p><p class="rival-quip">${esc(d.quip)}</p></article>`;}
    const options=getRoundRecipes(run().week,run().round), rr=r.round==='Technical'?r:options[i%options.length];
    const f=rr.flavours[i%rr.flavours.length], decor=Array.from({length:p.score>80?5:3},(_,j)=>({...snapDecoration({kind:rr.kind,recipeId:rr.id,layers:rr.assemblyParts},270+j*40,240+(j%2)*25),type:j%2?'cream':'berry'}));
    return `<article class="lineup-card"><div class="lineup-food">${foodSVG({kind:rr.kind,recipeId:rr.id,flavour:f,flavours:[f],layers:rr.assemblyParts,quality:p.score,doneness:p.score<58?1.5:p.score<70?.78:1,decorations:decor})}</div><div class="lineup-caption"><span>${esc(p.name||nameOf(p.id))}</span><strong>${Math.round(p.score)}<small> / 100</small></strong></div><p class="rival-bake-name">${esc(rr.name)}</p></article>`;
  }).join('')}</div></section>`;
}
function result() {
  const r=recipe(), b=bake(), u=run(), s=b.score, scores=s.scores||s;
  const flavours=b.flavours||[b.flavour], selections=[...flavours.map(f=>FLAVOURS[f]?.name).filter(Boolean),component(b.filling)?.name,component(b.finish)?.name].filter(Boolean);
  return `<main class="page fade-in">${header('<span class="top-note">The judging table</span>')}<div class="scroll-area"><div class="page-intro"><span class="eyebrow">${mode==='practice'?'Practice makes something lovely':`${r.round} · Week ${u.week+1}`}</span><h1>${esc(s.headline||'A moment of truth.')}</h1><p>${esc(r.name)} · ${selections.map(esc).join(' + ')}</p></div>
    <div class="result-grid"><section><div class="result-art">${foodSVG(foodOptions(b,r))}<div class="score-seal">${Math.round(s.total)}<small>OUT OF 100</small></div></div><div class="scores">${['flavour','texture','baking','presentation'].map(k=>`<div><div class="score-label"><span>${k[0].toUpperCase()+k.slice(1)}</span><strong>${Math.round(scores[k]??0)}</strong></div><div class="score-track"><span style="width:${scores[k]??0}%"></span></div></div>`).join('')}</div>
    <details class="bake-receipt"><summary>Your bake, step by step</summary><p>${r.ingredients.map((x,i)=>`${esc(x.name)}: ${Math.round(x.target*(b.measurements[i]??0)*10)/10}${x.unit}`).join('<br>')}</p><p>${(b.techniqueLog||[]).slice(-12).map(x=>esc(typeof x==='string'?x:x.message||x.action||x.type||'Technique recorded')).join(' · ')}</p><p>Oven: ${Math.round(b.heat)}°C · ${Math.round((b.bakeDoneness??0)*100)}% baked · ${b.rotations||0} tray rotations<br>Assembly: ${b.assemblyScores?.length||0} parts · ${b.decorations.length} finishing touches</p></details></section>
    <section>${s.handshake?`<div class="handshake">${iconSVG('star')}<div><strong>Hugh’s handshake</strong><span>He doesn’t give these out lightly.</span></div></div>`:''}${technicalPlace()}${s.comments.map((c,i)=>`<article class="judge">${avatarSVG(i+8)}<div><h3>${esc(c.judge)}</h3><p>“${esc(c.text)}”</p></div></article>`).join('')}${s.praise?.length?`<ul class="notes-list praise-list">${s.praise.map(n=>`<li>${esc(n)}</li>`).join('')}</ul>`:''}<ul class="notes-list">${s.notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul></section></div>
    ${mode==='season'?rivalLineup():''}<div class="result-actions">${mode==='practice'?btn('Bake this again','practice-again')+btn('Back to the recipe book','practice','secondary'):btn(u.round===2?'The weekly results &nbsp; →':'Next challenge &nbsp; →','next-result')}${btn('Main menu','home','secondary')}</div><p class="save-note">Judged on your ingredients, technique and finish. Result saved.</p></div></main>`;
}
function technicalPlace() {
  const u=run();if(mode!=='season'||u.round!==1||!u.result)return '';
  const rows=u.result.roundRanking,place=rows.findIndex(p=>p.id==='you')+1;
  return `<div class="technical-place"><span class="eyebrow">The blind tasting</span><strong>${ordinal(place)} of ${rows.length}</strong><span>${place===1?'Top of the technical.':place<=3?'Near the top of the table.':place===rows.length?'Bottom of the technical. Plenty to learn from.':'Mid-table on the technical.'}</span></div>`;
}
function practice() {
  const week=WEEKS[bookWeek], options=[0,1,2].flatMap(round=>getRoundRecipes(bookWeek,round));
  return `<main class="page fade-in">${header()}<div class="scroll-area"><div class="page-intro"><span class="eyebrow">The practice kitchen</span><h1>Room to make a mess.</h1><p>Learn the methods, explore flavour combinations and build something elaborate. The techniques are the same; there’s no deadline penalty.</p></div><div class="week-tabs">${WEEKS.map((w,i)=>`<button class="week-pill ${i===bookWeek?'active':''}" data-action="book-week" data-value="${i}">${w.theme}</button>`).join('')}</div>
    ${data.practice?.bake&&data.practice.view==='game'?`<div class="result-actions" style="margin:0 auto 20px">${btn('Continue your practice bake','resume-practice')}</div>`:''}<div class="recipe-library"><button class="library-card create-card" data-action="practice-create"><div class="library-art">${foodSVG({kind:'cake',recipeId:'cupcake-batch',flavour:'raspberry',decorations:[]})}</div><div class="library-copy"><span class="tag">Your own recipe</span><h3>Create your own</h3><p>Pick a base, give it a shape, then tune the sweetness, richness and flavour. No brief, no clock.</p><p class="method-preview">10 bases · ${Object.keys(FORMS).length} shapes</p><div class="best">Start from scratch &nbsp; →</div></div></button>${options.map(r=>`<button class="library-card" data-action="practice-bake" data-value="${r.id}"><div class="library-art">${foodSVG({kind:r.kind,recipeId:r.id,layers:r.assemblyParts,flavour:r.flavours[0]})}</div><div class="library-copy"><span class="tag">${r.round} · ${r.family}</span><h3>${esc(r.name)}</h3><p>${esc(r.description)}</p><p class="method-preview">${r.steps.map(s=>s.type).join(' → ')} → ${r.shapeMode}</p><div class="best">${data.records[r.id]?`Personal best: ${data.records[r.id]} / 100`:'A fresh page in your recipe book'} &nbsp; →</div></div></button>`).join('')}</div><div class="result-actions">${btn('Back to the tent','home','secondary')}</div></div></main>`;
}
function btn(label,action,cls='',attrs=''){return `<button class="btn ${cls}" data-action="${action}" ${attrs}>${label}</button>`;}
function iconButton(label,action,icon,cls=''){return `<button class="icon-btn ${cls}" data-action="${action}" aria-label="${label}" title="${label}">${iconSVG(icon)}</button>`;}
function brand(){return `<button class="brand" data-action="home" aria-label="The Village Bake main menu"><span class="brand-mark">${iconSVG('whisk')}</span><span class="brand-name">The Village Bake<small>A LITTLE FLOUR. A LITTLE COURAGE.</small></span></button>`;}
function header(extra=''){return `<header class="topbar">${brand()}${extra||'<span class="top-note">A countryside baking competition</span>'}<div class="top-actions">${iconButton(data.muted?'Turn sound on':'Mute sound','sound',data.muted?'sound':'sound')}${iconButton('How to play','help','book')}</div></header>`;}
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2800);}
function sound(type='tap'){if(data.muted)return;try{ctx??=new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=type==='success'?660:type==='place'?440:330;g.gain.setValueAtTime(.045,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.16);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.17);}catch{}}
function modalHeading(title){return `<div class="dialog-header"><span class="eyebrow">The Village Bake</span>${iconButton('Close','close','close')}</div><h2>${title}</h2>`;}
function menu(){const resumable=data.run&&data.season;return `<main class="menu fade-in">${header()}<div class="menu-main"><section class="menu-copy"><div class="eyebrow rule">Welcome to the tent</div><h1>The Village<br><em>Bake.</em></h1><p class="menu-intro">Golden crusts. Wobbly masterpieces.<br>A whole tent full of possibility.</p><div class="menu-buttons">${resumable?btn(`Continue ${data.season.status==='complete'?'your season':`· Week ${Math.min(6,data.run.week+1)}`}&nbsp; →`,'continue'):btn('Enter the competition &nbsp; →','new')}${resumable?btn('Start a new season','new','secondary'):''}${btn('The practice kitchen','practice','secondary')}</div><div class="menu-facts"><span>6 weeks</span><span>36 recipes</span><span>Endless of your own</span></div></section><div class="hero-bake">${foodSVG({kind:'cake',layers:3,flavour:'berry',quality:100,decorations:[{x:.39,y:.17,type:'berry'},{x:.48,y:.09,type:'cream'},{x:.58,y:.14,type:'berry'},{x:.65,y:.23,type:'leaf'}]})}<div class="hero-caption">Something lovely is rising.<small>Your place at the bench is ready</small></div></div></div><footer class="menu-bottom"><span>Made for slow Sundays & slightly sticky fingers.</span><button data-action="cast">Meet your fellow bakers →</button></footer></main>`;}
function rankings(rows,caption='This bake'){return `<div class="table-wrap"><table class="standings"><thead><tr><th>Place</th><th>${caption}</th><th>Score</th></tr></thead><tbody>${(rows||[]).map((p,i)=>`<tr class="${p.id==='you'?'player':''}"><td>${String(i+1).padStart(2,'0')}</td><td><div class="standing-person">${portrait(p.id)}<span>${esc(p.name||nameOf(p.id))}${p.id==='you'?'<span class="row-sub">Your bench</span>':''}</span></div></td><td>${Math.round(p.score)}<span class="muted"> / 100</span></td></tr>`).join('')}</tbody></table></div>`;}
function weekResult(){const u=run(),res=u.result,star=res.star,elim=res.eliminated,final=res.final;const playerRank=(res.weekRanking||[]).findIndex(x=>x.id==='you')+1;return `<main class="page fade-in">${header()}<div class="scroll-area"><div class="page-intro"><span class="eyebrow">${final?'The grand final':`Week ${u.week+1} complete`}</span><h1>${final?(playerRank===1?'You’ve won the Village Bake!':'A finalist to be proud of.'):(elim==='you'?'Time for another batch.':'What a week in the tent.')}</h1><p>${final?'Six weeks of flour, nerve and rather a lot of washing-up.':WEEKS[u.week].subtitle}</p></div><div class="ribbon"><span class="eyebrow" style="color:#d3dfb8">${final?'The Village Bake champion':'This week’s Star Baker'}</span><h2>${esc(nameOf(final?(res.winner||res.weekRanking?.[0]?.id):star))}</h2><p>${final?`You finished ${playerRank===1?'first':playerRank===2?'second':'third'} in the final.`:elim==='you'?'The judges are sending you home — but your apron is still here. Retry this week with everything you’ve learned.':`${nameOf(elim)} leaves the tent. ${data.season.active.length} bakers continue.`}</p></div>${rankings(res.weekRanking,final?'Final week average':'Three-round average')}<div class="result-actions">${final?btn('Back to the tent','home'):elim==='you'?btn('Retry this week','retry-week'):btn(u.week===4?'On to the final &nbsp; →':'Next week &nbsp; →','next-week')}${btn('The practice kitchen','practice','secondary')}</div></div></main>`;}
function cast(){return `<main class="page fade-in">${header()}<div class="scroll-area"><div class="page-intro"><span class="eyebrow">A very good bunch</span><h1>Your fellow bakers.</h1><p>Seven familiar faces by the end of the summer. Each has a speciality, and every one of them wants that cake stand.</p></div><div class="cast">${[{id:'you',name:'You',job:'The newest face in the tent',trait:'A little courage goes a long way.',speciality:-1},...RIVALS].map(p=>`<article class="cast-card">${portrait(p.id)}<h3>${p.name}</h3><p><strong>${p.job}</strong><br>${p.trait}</p><span class="tag">${p.id==='you'?'Your story starts here':WEEKS[p.speciality].theme+' specialist'}</span>${p.id==='you'?'':`<p class="cast-traits"><span class="good">Strong: ${esc(traitWords(p.strengths))}</span><span class="weak">Watch for: ${esc(traitWords(p.weaknesses))}</span></p>`}</article>`).join('')}</div><div class="result-actions">${btn('Back to the tent','home')}</div></div></main>`;}

function traitWords(profile={}) {
  const words={flavour:'flavour',texture:'texture',baking:'the bake',presentation:'presentation',cream:'creamed sponges',rub:'rubbed-in pastry',knead:'kneading',laminate:'lamination',cook:'cooked pastes',custard:'custards',biscuit:'biscuits',bread:'bread',pastry:'pastry',dessert:'desserts',cake:'cakes',construction:'constructions',Showstopper:'showstoppers'};
  const list=[...(profile.categories||[]),...(profile.methods||[]),...(profile.kinds||[]),...(profile.families||[]),...(profile.rounds||[])].map(x=>words[x]||x);
  if(profile.minParts)list.push('tall builds');
  return [...new Set(list)].slice(0,3).join(', ')||'—';
}
function render() {
  app.innerHTML = ({menu,brief,game,result,week:weekResult,practice,cast}[screen] || menu)();
  if(screen==='game') { paintScene(); updateReadouts(); }
  document.title=screen==='game'?`${recipe().name} · The Village Bake`:'The Village Bake';
}
function ensureDecoration() {
  const available=recipe().decorationIds||Object.keys(DECORATIONS);
  if(!available.includes(decorType))decorType=available[0]||'cream';
}
function stageChanged() { stopHold(); ensureDecoration(); selectedDecor=-1; movingDecor=null; save(); render(); }
function apply(fn,value,full=true) {
  const b=bake(),before=b.stage,task=b.prepIndex;
  fn(b,value); save();
  if(full||b.stage!==before||task!==b.prepIndex)stageChanged();
  else { updateReadouts(); paintScene(); }
  sound('place');
}
function finishBake() {
  const b=bake(),u=run(); if(!b||b.stage==='judged')return;
  const s=judgeBake(b); if(!s)return;
  data.records[u.recipeId]=Math.max(data.records[u.recipeId]||0,Math.round(s.total));
  if(mode==='season')u.result=finishRound(data.season,s);
  sound('success'); go('result');
}
function stopHold() {
  holding=null; activePointer=null;
  document.querySelectorAll('.holding').forEach(e=>e.classList.remove('holding'));
  save();
}
function home() {
  if(screen==='game') {
    save(); openModal(`${modalHeading('Leave your bench?')}<p>Your work is saved here. The oven and clock stop while you’re away.</p><div class="dialog-actions">${btn('Save & return to menu','menu-confirm')}${btn('Keep baking','close','secondary')}</div>`);
  } else go('menu');
}
function act(action,el) {
  switch(action) {
    case 'home':home();break;
    case 'menu-confirm':closeModal();go('menu');break;
    case 'new':
      if(data.season)openModal(`${modalHeading('A fresh apron?')}<p>A new season replaces your current competition. Your recipe best scores stay in your book.</p><div class="dialog-actions">${btn('Start a new season','new-confirm')}${btn('Keep my season','close','secondary')}</div>`);
      else beginSeason();break;
    case 'new-confirm':closeModal();beginSeason();break;
    case 'continue':mode='season';go(data.run.view||'brief');break;
    case 'cast':go('cast');break;
    case 'practice':bookWeek=run()?.week||0;go('practice');break;
    case 'book-week':bookWeek=Number(el.dataset.value);render();break;
    case 'practice-bake':startPractice(el.dataset.value);break;
    case 'practice-again':startPractice(run().recipeId);break;
    case 'resume-practice':mode='practice';go(data.practice.view);break;
    case 'choose-recipe':selectRecipe(el.dataset.value);break;
    case 'brief-tab':useBuilder(el.dataset.value==='custom');break;
    case 'build-base':setBuild('base',el.dataset.value);break;
    case 'build-form':setBuild('form',el.dataset.value);break;
    case 'practice-create':startPracticeCreation();break;
    case 'shelf':apply(setShelf,el.dataset.value);break;
    case 'steam':apply(setSteam,!bake().steam);break;
    case 'blind-bake':apply(blindBake);break;
    case 'crumb-coat':apply(crumbCoat);break;
    case 'decor-tool':decorTool=el.dataset.value;selectedDecor=-1;refreshTray();break;
    case 'decor-pattern':decorPattern=el.dataset.value;refreshTray();break;
    case 'decor-colour':
      if(decorTool==='adjust'&&selectedDecor>=0)updateDecoration(bake(),selectedDecor,{colour:el.dataset.value});
      else decorColour=decorColour===el.dataset.value?null:el.dataset.value;
      save();refreshTray();break;
    case 'decor-remove':if(selectedDecor>=0){removeDecoration(bake(),selectedDecor);selectedDecor=-1;save();refreshTray();}break;
    case 'decor-deselect':selectedDecor=-1;refreshTray();break;
    case 'start': {
      const r=recipe();run().recipeId=r.id;
      run().bake=createBake(r,{...runOptions(),practice:mode==='practice'});
      decorTool='place';decorPattern='single';decorColour=null;selectedDecor=-1;
      ensureDecoration();go('game');sound('success');break;
    }
    case 'add':
      if(bake().amount<.001){toast('Measure some of the ingredient first.');return;}
      apply(commitIngredient);break;
    case 'empty':apply(adjustMeasure,'reset',false);break;
    case 'scrape':apply(adjustMeasure,'scrape',false);break;
    case 'spoon':apply(adjustMeasure,recipe().ingredients[bake().ingredient].target*.015,false);break;
    case 'technique':apply(recordTechnique,el.dataset.value,false);break;
    case 'redo-technique':apply(recoverTechnique);break;
    case 'prepared':apply(finishPreparation);break;
    case 'shape-set':apply(commitShape);break;
    case 'shape-undo':apply(undoShape);break;
    case 'rotate':apply(rotateBake,undefined,false);break;
    case 'component':apply(workComponent,undefined,false);break;
    case 'oven-out':apply(removeOven);break;
    case 'cool-method':apply(setCooling,el.dataset.value);break;
    case 'return-oven':apply(returnOven);break;
    case 'cooled':apply(finishCooling);break;
    case 'spread':apply(assemble,'spread',false);break;
    case 'place-layer':apply(assemble,'place');break;
    case 'assembly-undo':apply(assemble,'undo');break;
    case 'assembled':apply(finishAssembly);break;
    case 'decor-type': {
      const previous=decorType;decorType=el.dataset.value;
      if(!!DECORATIONS[decorType]?.colourable!==!!DECORATIONS[previous]?.colourable)refreshTray();
      document.querySelectorAll('.decor-choice').forEach(b=>{b.classList.toggle('selected',b.dataset.value===decorType);b.setAttribute('aria-pressed',b.dataset.value===decorType);});
      updateReadouts();sound('place');break;
    }
    case 'undo':bake().decorations.pop();selectedDecor=-1;save();refreshTray();break;
    case 'judge':finishBake();break;
    case 'next-result':if(run().round===2)go('week');else newBrief();break;
    case 'next-week':newBrief();break;
    case 'retry-week':retryWeek(data.season);newBrief();break;
    case 'pause':openModal(`${modalHeading('Tea break.')}<p>The oven and clock are paused. Your bake is safe.</p><div class="dialog-actions">${btn('Back to baking','close')}${btn('Open the recipe','recipe','secondary')}${btn(data.muted?'Turn sound on':'Mute sounds','sound','secondary')}${btn('Save & main menu','menu-confirm','secondary')}</div>`);break;
    case 'recipe':openModal(`${modalHeading('A little guidance.')}<div>${recipeView(bake(),recipe())}</div><div class="dialog-actions">${btn('Back to my bake','close')}</div>`);break;
    case 'help':tutorial();break;
    case 'close':closeModal();break;
    case 'sound':data.muted=!data.muted;save();toast(data.muted?'Sounds off. A peaceful tent.':'Sounds on.');if(!data.muted)sound('success');if(screen!=='game'&&!modal.open)render();break;
  }
}
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-action]'); if(!el)return;
  e.preventDefault(); if(paused&&!modal.contains(el))return;
  act(el.dataset.action,el);
});
document.addEventListener('input',e=>{
  const field=e.target.dataset.input;
  if(screen==='brief'&&['sweetness','richness','inclusion'].includes(field)){setBuild(field,e.target.value);return;}
  if(screen==='brief'&&['flavour','accent','filling','finish','strength'].includes(field)) {
    if(recipe().round==='Technical')return;
    const opts=runOptions();
    if(field==='flavour')opts.flavours=[e.target.value,...opts.flavours.slice(1).filter(x=>x!==e.target.value)];
    else if(field==='accent')opts.flavours=[opts.flavours[0],...(e.target.value==='none'?[]:[e.target.value])];
    else opts[field]=e.target.value;
    run().options=opts;save();render();return;
  }
  if(screen!=='game'||paused)return;
  const b=bake(),value=Number(e.target.value);
  if(field==='shape')b.shapeValues[b.shapeIndex]=value;
  else if(field==='heat')b.heat=value;
  else if(field==='pour-rate')b.pourRate=value;
  else if(field==='alignment')b.alignment=value;
  else if(field==='filling-amount')setFillingAmount(b,value);
  else if(field==='decor-size'){if(decorTool==='adjust'&&selectedDecor>=0)updateDecoration(b,selectedDecor,{size:value});else decorSize=value;const out=$('#decor-size-value');if(out)out.textContent=`${value.toFixed(1)}×`;}
  else if(field==='decor-angle'){updateDecoration(b,selectedDecor,{angle:value});const out=$('#decor-angle-value');if(out)out.textContent=`${Math.round(value)}°`;}
  else if(field==='decor-count'){decorCount=value;const out=$('#decor-count-value');if(out)out.textContent=value;}
  else return;
  updateReadouts(); if(field!=='pour-rate')paintScene(); save();
});
document.addEventListener('pointerdown',e=>{
  if(screen!=='game'||paused||e.button>0)return;
  if(activePointer!==null&&activePointer!==e.pointerId)return;
  if(movingDecor&&movingDecor.pointerId!==e.pointerId)return;
  const el=e.target.closest('[data-hold]');
  if(el){e.preventDefault();activePointer=e.pointerId;holding=el.dataset.hold;el.setPointerCapture?.(e.pointerId);el.classList.add('holding');sound();return;}
  const deco=e.target.closest('[data-decor]');
  if(deco){decorType=deco.dataset.decor;activePointer=e.pointerId;dragDecor={type:decorType,startX:e.clientX,startY:e.clientY,pointerId:e.pointerId};deco.setPointerCapture?.(e.pointerId);}
  else if(e.target.closest('#decor-surface')){
    e.preventDefault();
    if(decorTool==='adjust')pickDecoration(e.clientX,e.clientY,e.pointerId);
    else placeAt(e.clientX,e.clientY);
  }
});
document.addEventListener('pointermove',e=>{
  if(!movingDecor||movingDecor.pointerId!==e.pointerId||paused)return;
  const point=toArt(e.clientX,e.clientY),item=bake()?.decorations?.[movingDecor.index];if(!point||!item)return;
  if(!movingDecor.moved&&Math.hypot(e.clientX-movingDecor.startX,e.clientY-movingDecor.startY)<6)return;
  const snapped=snapDecoration(foodOptions(),point.x,point.y);
  item.x=snapped.x;item.y=snapped.y;movingDecor.moved=true;paintScene();
});
document.addEventListener('pointerup',e=>{
  if(activePointer!==null&&activePointer!==e.pointerId)return;
  const drag=dragDecor;dragDecor=null;stopHold();
  if(movingDecor){const m=movingDecor;movingDecor=null;const item=bake()?.decorations?.[m.index];if(m.moved&&item){moveDecoration(bake(),m.index,{x:item.x,y:item.y});save();refreshTray();}}
  if(drag&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>15){
    const rect=$('#decor-surface')?.getBoundingClientRect();
    if(rect&&e.clientX>=rect.left&&e.clientX<=rect.right&&e.clientY>=rect.top&&e.clientY<=rect.bottom)placeAt(e.clientX,e.clientY);
  }
});
for(const event of ['pointercancel','lostpointercapture'])document.addEventListener(event,e=>{
  if(activePointer!==null&&activePointer!==e.pointerId)return;stopHold();dragDecor=null;
  if(movingDecor?.moved&&event==='pointercancel'){const item=bake()?.decorations?.[movingDecor.index];if(item){item.x=movingDecor.origin.x;item.y=movingDecor.origin.y;paintScene();}}
  if(event==='pointercancel')movingDecor=null;
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!modal.open&&screen==='game'){act('pause');return;}
  if(screen!=='game'||paused||![' ','Enter'].includes(e.key))return;
  if(e.target.matches('[data-hold]')){e.preventDefault();holding=e.target.dataset.hold;e.target.classList.add('holding');}
  else if(e.target.id==='decor-surface'){e.preventDefault();const d=$('#decor-surface').getBoundingClientRect();placeAt(d.left+d.width*.5,d.top+d.height*.48);}
});
document.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')stopHold();});
/** Convert screen coordinates to the 700×500 illustration space. */
function toArt(cx,cy) {
  const svg=$('#scene>svg'),box=svg?.getBoundingClientRect();if(!box||!box.width||!box.height)return null;
  const scale=Math.min(box.width/700,box.height/500),ox=box.left+(box.width-700*scale)/2,oy=box.top+(box.height-500*scale)/2;
  return {x:(cx-ox)/scale,y:(cy-oy)/scale};
}
function pickDecoration(cx,cy,pointerId) {
  const point=toArt(cx,cy),list=bake()?.decorations||[];if(!point)return;
  let best=-1,bestDistance=46;
  list.forEach((d,i)=>{const dist=Math.hypot(100+d.x*500-point.x,150+d.y*200-point.y);if(dist<bestDistance){best=i;bestDistance=dist;}});
  selectedDecor=best;
  if(best>=0){movingDecor={index:best,pointerId,startX:cx,startY:cy,moved:false,origin:{x:list[best].x,y:list[best].y}};activePointer=pointerId;sound('place');}
  refreshTray();
}
function placeAt(cx,cy) {
  if(paused||bake()?.stage!=='decorate')return;
  const point=toArt(cx,cy);if(!point)return;
  const opts=foodOptions(),colour=DECORATIONS[decorType]?.colourable?decorColour:null;
  const items=patternPoints(decorPattern,point.x,point.y,decorCount).map(p=>({...snapDecoration(opts,p.x,p.y),type:decorType,size:decorSize,angle:0,...(colour?{colour}:{})}));
  if(items.length>1)placeDecorations(bake(),items);else addDecoration(bake(),items[0]);
  if(bake().lastFeedback)toast(bake().lastFeedback);
  paintScene();updateReadouts();save();sound('place');
}
modal.addEventListener('close',()=>{paused=false;stopHold();lastFrame=performance.now();});
modal.addEventListener('cancel',()=>{paused=false;});
document.addEventListener('visibilitychange',()=>{stopHold();dragDecor=null;if(document.hidden&&screen==='game'&&!modal.open)act('pause');lastFrame=performance.now();save();});
window.addEventListener('blur',()=>{stopHold();if(screen==='game'&&!modal.open)act('pause');});
window.addEventListener('pagehide',save);
window.addEventListener('resize',()=>{stopHold();if(screen==='game')paintScene();});
function tick(now) {
  const dt=Math.min(.1,Math.max(0,(now-lastFrame)/1000));lastFrame=now;
  if(screen==='game'&&!paused&&!document.hidden){
    const b=bake();advance(b,dt,holding);
    if(!b.practice&&!b.overtimeNotice&&b.elapsed>targets(b).budget){b.overtimeNotice=true;toast('Time called! Finish soon: overtime costs points.');}
    updateReadouts();
    if(now-lastArt>250&&b.stage!=='decorate'){paintScene();lastArt=now;}
    if(now-lastSave>1200){save();lastSave=now;}
  }
  requestAnimationFrame(tick);
}
$('#backdrop').innerHTML=tentSVG();$('#backdrop svg').setAttribute('preserveAspectRatio','xMidYMid slice');
render();requestAnimationFrame(tick);
