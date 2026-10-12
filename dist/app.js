import { WEEKS, RIVALS, FLAVOURS, COMPONENTS, DECORATIONS, BRIEFS, ALL_RECIPES, getRoundRecipes } from './content.js';
import {
  createSeason, createBake, getRecipe, recipeFor, advance, targets, migrateSave,
  adjustMeasure, commitIngredient, currentTechnique, recordTechnique, recoverTechnique,
  finishPreparation, shapeTarget, commitShape, undoShape, workComponent,
  rotateBake, removeOven, returnOven, setCooling, finishCooling,
  assemble, finishAssembly, placeDecoration as addDecoration, judgeBake, finishRound, retryWeek,
} from './engine.js';
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

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); }
  catch { if (!save.warned) { toast('This browser could not save. Keep this tab open to continue.'); save.warned = true; } }
}
function run() { return mode === 'practice' ? data.practice : data.run; }
function recipe() { return recipes.find(r => r.id === run()?.recipeId) || getRecipe(0, 0); }
function bake() { return run()?.bake; }
function nameOf(id) { return id === 'you' ? 'You' : RIVALS.find(r => r.id === id)?.name || id; }
function portrait(id) { return avatarSVG(id === 'you' ? 7 : Math.max(0, RIVALS.findIndex(r => r.id === id))); }
function fmtTime(n) { n = Math.max(0, Math.floor(n)); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`; }
function component(id) { return COMPONENTS.find(c => c.id === id); }
function shapeUnits(r) { return ({level:'levelling zones',roll:'rolling passes',plait:'strands',line:'lining sections',pipe:'piped pieces',portion:'portions'})[r.shapeMode] || 'pieces'; }
function optionDefaults(r) {
  return { flavours: r.prescribed?.flavours || [r.flavours[0]], filling: r.prescribed?.filling || r.fillings?.[0] || 'none', finish: r.prescribed?.finish || r.finishes?.[0] || 'none', design: 'stack' };
}
function runOptions(u = run()) {
  const r = recipes.find(v => v.id === u?.recipeId) || recipe();
  return { ...optionDefaults(r), ...u?.options, ...(u?.options ? {} : u?.flavour ? { flavours: [u.flavour] } : {}) };
}
function foodOptions(b = bake(), r = recipe()) {
  const flavours = b?.flavours || (b?.flavour ? [b.flavour] : runOptions().flavours);
  return { kind: r.kind, recipeId: r.id, flavour: flavours[0], flavours,
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
    <div class="tutorial-step"><b>1</b><div><strong>Make it yours.</strong>Choose a recipe, pair two flavours, and select fillings and finishes. Technicals follow the judges’ exact recipe. Every recipe can earn an excellent score.</div></div>
    <div class="tutorial-step"><b>2</b><div><strong>Work with the ingredients.</strong>Control the pour speed and finish with a small spoon. Beat in rhythm, knead in order, and fold pastry with care. Use the broad green timing windows; rapid tapping won’t help.</div></div>
    <div class="tutorial-step"><b>3</b><div><strong>Watch both sides.</strong>The oven takes time to reach its setting. Rotate your tray and prepare fillings while it bakes. You can return an underbaked batch to the oven.</div></div>
    <div class="tutorial-step"><b>4</b><div><strong>Build, then finish.</strong>Choose how to cool, align and assemble the parts, then pipe or place your decorations. Neatness and balance matter more than piling everything on.</div></div>
    <div class="tutorial-step"><b>5</b><div><strong>The clock is part of the challenge.</strong>Extra work takes time. Practice has no deadline penalty. Pause whenever you need; leaving the tab pauses everything.</div></div>
    <div class="dialog-actions">${btn('Apron on. Let’s bake.','close')}</div>`);
  data.tutorialSeen = true; data.expansionTutorialSeen = true; save();
}
function beginSeason() { data.season = createSeason(); mode = 'season'; newBrief(); if (!data.expansionTutorialSeen) tutorial(); }
function newBrief() {
  const r = getRecipe(data.season.week, data.season.round);
  data.run = { recipeId: r.id, week: data.season.week, round: data.season.round, options: optionDefaults(r), bake: null, view: 'brief', result: null };
  go('brief');
}
function startPractice(id) {
  const r = recipes.find(x => x.id === id); if (!r) return;
  mode = 'practice';
  const week = WEEKS.findIndex((_, i) => [0,1,2].some(round => getRoundRecipes(i, round).some(v => v.id === id)));
  data.practice = { recipeId: id, week: Math.max(0, week), round: ['Signature','Technical','Showstopper'].indexOf(r.round), options: optionDefaults(r), bake: null, view: 'brief', result: null };
  go('brief');
}
function selectRecipe(id) {
  const u = run(), choices = getRoundRecipes(u.week, u.round);
  const r = choices.find(v => v.id === id); if (!r || u.bake) return;
  u.recipeId = id; u.options = optionDefaults(r); save(); render();
}
function selectField(label, field, entries, selected, disabled = false) {
  return `<label class="option-field"><span>${label}</span><select data-input="${field}" ${disabled ? 'disabled' : ''}>${entries.map(v => `<option value="${v.id}" ${v.id === selected ? 'selected' : ''}>${esc(v.name)}</option>`).join('')}</select></label>`;
}
function brief() {
  const r = recipe(), u = run(), week = WEEKS[u.week], opts = runOptions(), fixed = r.round === 'Technical';
  const draft = createBake(r, { ...opts, practice: mode === 'practice' }), t = targets(draft);
  const choices = mode === 'practice' ? [r] : getRoundRecipes(u.week, u.round);
  const briefInfo = BRIEFS[u.week]?.[u.round];
  const harmony = opts.flavours.length < 2 || FLAVOURS[opts.flavours[0]]?.pairs?.includes(opts.flavours[1]) || FLAVOURS[opts.flavours[1]]?.pairs?.includes(opts.flavours[0]);
  const flavourEntries = r.flavours.map(id => ({ id, name: FLAVOURS[id].name }));
  const componentWarnings = ['filling','finish'].map(role=>component(opts[role])).filter(c=>c&&c.id!=='none'&&c.flavours?.length&&!opts.flavours.some(f=>c.flavours.includes(f))).map(c=>`${c.name} can overpower your chosen flavour. Try a different component or flavour pairing.`);
  return `<main class="page fade-in">${header(`<span class="top-note">${mode === 'practice' ? 'The practice kitchen' : `${data.season.active.length} bakers · Week ${u.week + 1} of 6`}</span>`)}<div class="scroll-area">
    <div class="page-intro"><span class="eyebrow">${mode === 'practice' ? 'Room to learn. Room to create.' : `Week ${u.week+1} · ${r.round}`}</span><h1>${week.name}</h1><p>${esc(briefInfo?.description || week.subtitle)}</p></div>
    <div class="week-tabs">${WEEKS.map((w,i)=>`<span class="week-pill ${i===u.week?'active':''}">${String(i+1).padStart(2,'0')} ${w.theme}</span>`).join('')}</div>
    ${choices.length > 1 ? `<div class="recipe-options">${choices.map(v=>`<button class="recipe-option ${v.id===r.id?'selected':''}" data-action="choose-recipe" data-value="${v.id}" aria-pressed="${v.id===r.id}"><span class="recipe-option-art">${foodSVG({kind:v.kind,recipeId:v.id,flavour:v.flavours[0],layers:v.assemblyParts,decorations:[]})}</span><span><strong>${esc(v.name)}</strong><small>${esc(v.method)} · ${v.pieces} ${shapeUnits(v)} · ${v.assemblyParts} assembly parts</small></span></button>`).join('')}</div>` : ''}
    <div class="brief-grid"><div class="brief-art"><span class="tag">${r.round} challenge</span>${foodSVG({...foodOptions(draft,r),doneness:1,quality:100,stage:'judged'})}<div class="recipe-journey">${r.steps.map(s=>`<span>${esc(s.type)}</span>`).join('<i>→</i>')}<i>→</i><span>${esc(r.shapeMode)}</span></div></div>
    <section class="recipe-card"><span class="eyebrow">${fixed ? 'The judges’ recipe · prescribed' : 'Your brief, your bake'}</span><h2>${esc(r.name)}</h2><p class="body-copy muted">${esc(r.description)}</p>
    <div class="recipe-meta"><span>◷ ${mode === 'practice' ? 'Untimed practice' : fmtTime(t.budget) + ' in the tent'}</span><span>${r.steps.length} preparation techniques</span><span>${t.parts} assembly parts</span></div>
    <div class="flavour-fields">${selectField('Main flavour','flavour',flavourEntries,opts.flavours[0],fixed)}${selectField('A second note','accent',[{id:'none',name:'Let the main flavour shine'},...flavourEntries.filter(x=>x.id!==opts.flavours[0])],opts.flavours[1]||'none',fixed)}</div>
    <p class="pairing-note ${harmony?'':'warning'}">${fixed?'Follow these flavours and components exactly.':opts.flavours.length<2?'A single flavour can be beautifully judged.':harmony?'These flavours complement each other.':'An unusual pairing: balance will be harder to achieve.'}</p>
    <div class="flavour-fields">${selectField('Filling','filling',(r.fillings||['none']).map(id=>({id,name:component(id)?.name||'No filling'})),opts.filling,fixed)}${selectField('Finish','finish',(r.finishes||['none']).map(id=>({id,name:component(id)?.name||'Natural finish'})),opts.finish,fixed)}</div>
    ${componentWarnings.map(note=>`<p class="pairing-note warning">${esc(note)}</p>`).join('')}
    <div class="workload-note"><strong>Your plan</strong><span>${r.ingredients.length} ingredients · ${r.pieces} ${shapeUnits(r)} · ${t.parts} assembly parts</span><span>${[opts.filling,opts.finish].filter(x=>x&&x!=='none').map(x=>component(x)?.name).filter(Boolean).join(' + ')||'Let the bake speak for itself.'}</span></div>
    <p class="control-hint" style="text-align:left;margin-top:12px">Every bake can score highly. Added components create real preparation work; your technique decides the result.</p></section></div>
    <div class="brief-footer"><p><strong>${fixed?'Read the method':'From the recipe book'}</strong><br>${esc(fixed?r.technicalHint:r.tip)}</p>${btn('Ready, set… bake! &nbsp; →','start')}</div><p class="save-note">${mode==='practice'?'Practice never changes your competition.':'Competition progress is saved on this browser.'}</p></div></main>`;
}
function game() {
  const b = bake(), r = recipe(), u = run(), [title, instruction] = stageCopy(b,r);
  const steps = targets(b).parts > 1 || b.filling !== 'none' || b.finish !== 'none' ? STEPS : STEPS.filter(s=>s!=='assemble');
  return `<main class="game fade-in"><header class="topbar">${brand()}<div class="game-status">${mode==='practice'?'PRACTICE KITCHEN':`WEEK ${u.week+1} · ${r.round.toUpperCase()}`}<strong>${esc(r.name)}</strong></div><div class="top-actions"><div class="timer" id="timer"><small>TIME LEFT</small><span id="timer-value">${fmtTime(targets(b).budget-b.elapsed)}</span></div>${iconButton('Open recipe','recipe','book','recipe-toggle')}${iconButton('Pause game','pause','pause')}</div></header>
    <nav class="steps" aria-label="Baking stages">${steps.map((s,i)=>`<div class="step ${b.stage===s?'active':STEPS.indexOf(b.stage)>STEPS.indexOf(s)?'done':''}"><b>${STEPS.indexOf(b.stage)>STEPS.indexOf(s)?'✓':i+1}</b><span>${STEP_NAMES[STEPS.indexOf(s)]}</span></div>`).join('')}</nav>
    <div class="play-layout"><section class="workspace"><div class="station-heading"><span class="eyebrow">${r.round==='Technical'?'The technical bench':'Your little corner of the tent'}</span><h1>${title}</h1><p>${instruction}</p></div><div class="scene" id="scene"></div><div class="control-tray">${controlsView(b,r,{decorType,decorSize})}</div></section><aside class="side-recipe">${recipeView(b,r)}</aside></div></main>`;
}
function paintScene() { if(screen==='game'&&$('#scene')) $('#scene').innerHTML=sceneView(bake(),recipe(),{decorType,decorSize}); }
function updateReadouts() {
  if(screen!=='game'||!bake())return;
  const b=bake(), t=targets(b); updateWorkbench(b,recipe());
  const timer=$('#timer-value'); if(timer)timer.textContent=mode==='practice'?'∞':(b.elapsed>t.budget?'+':'')+fmtTime(Math.abs(t.budget-b.elapsed));
  $('#timer')?.classList.toggle('overtime',mode!=='practice'&&b.elapsed>t.budget);
}
function rivalLineup() {
  const r=recipe(), rows=run().result.roundRanking.filter(p=>p.id!=='you');
  return `<section class="lineup-section"><div class="lineup-heading"><span class="eyebrow">Around the judging table</span><h2>From the other benches.</h2></div><div class="bake-lineup">${rows.map((p,i)=>{
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
    <section>${s.comments.map((c,i)=>`<article class="judge">${avatarSVG(i+8)}<div><h3>${esc(c.judge)}</h3><p>“${esc(c.text)}”</p></div></article>`).join('')}<ul class="notes-list">${s.notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul></section></div>
    ${mode==='season'?rivalLineup():''}<div class="result-actions">${mode==='practice'?btn('Bake this again','practice-again')+btn('Back to the recipe book','practice','secondary'):btn(u.round===2?'The weekly results &nbsp; →':'Next challenge &nbsp; →','next-result')}${btn('Main menu','home','secondary')}</div><p class="save-note">Judged on your ingredients, technique and finish. Result saved.</p></div></main>`;
}
function practice() {
  const week=WEEKS[bookWeek], options=[0,1,2].flatMap(round=>getRoundRecipes(bookWeek,round));
  return `<main class="page fade-in">${header()}<div class="scroll-area"><div class="page-intro"><span class="eyebrow">The practice kitchen</span><h1>Room to make a mess.</h1><p>Learn the methods, explore flavour combinations and build something elaborate. The techniques are the same; there’s no deadline penalty.</p></div><div class="week-tabs">${WEEKS.map((w,i)=>`<button class="week-pill ${i===bookWeek?'active':''}" data-action="book-week" data-value="${i}">${w.theme}</button>`).join('')}</div>
    ${data.practice?.bake&&data.practice.view==='game'?`<div class="result-actions" style="margin:0 auto 20px">${btn('Continue your practice bake','resume-practice')}</div>`:''}<div class="recipe-library">${options.map(r=>`<button class="library-card" data-action="practice-bake" data-value="${r.id}"><div class="library-art">${foodSVG({kind:r.kind,recipeId:r.id,layers:r.assemblyParts,flavour:r.flavours[0]})}</div><div class="library-copy"><span class="tag">${r.round} · ${r.family}</span><h3>${esc(r.name)}</h3><p>${esc(r.description)}</p><p class="method-preview">${r.steps.map(s=>s.type).join(' → ')} → ${r.shapeMode}</p><div class="best">${data.records[r.id]?`Personal best: ${data.records[r.id]} / 100`:'A fresh page in your recipe book'} &nbsp; →</div></div></button>`).join('')}</div><div class="result-actions">${btn('Back to the tent','home','secondary')}</div></div></main>`;
}
function btn(label,action,cls='',attrs=''){return `<button class="btn ${cls}" data-action="${action}" ${attrs}>${label}</button>`;}
function iconButton(label,action,icon,cls=''){return `<button class="icon-btn ${cls}" data-action="${action}" aria-label="${label}" title="${label}">${iconSVG(icon)}</button>`;}
function brand(){return `<button class="brand" data-action="home" aria-label="The Village Bake main menu"><span class="brand-mark">${iconSVG('whisk')}</span><span class="brand-name">The Village Bake<small>A LITTLE FLOUR. A LITTLE COURAGE.</small></span></button>`;}
function header(extra=''){return `<header class="topbar">${brand()}${extra||'<span class="top-note">A countryside baking competition</span>'}<div class="top-actions">${iconButton(data.muted?'Turn sound on':'Mute sound','sound',data.muted?'sound':'sound')}${iconButton('How to play','help','book')}</div></header>`;}
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2800);}
function sound(type='tap'){if(data.muted)return;try{ctx??=new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=type==='success'?660:type==='place'?440:330;g.gain.setValueAtTime(.045,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.16);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.17);}catch{}}
function modalHeading(title){return `<div class="dialog-header"><span class="eyebrow">The Village Bake</span>${iconButton('Close','close','close')}</div><h2>${title}</h2>`;}
function menu(){const resumable=data.run&&data.season;return `<main class="menu fade-in">${header()}<div class="menu-main"><section class="menu-copy"><div class="eyebrow rule">Welcome to the tent</div><h1>The Village<br><em>Bake.</em></h1><p class="menu-intro">Golden crusts. Wobbly masterpieces.<br>A whole tent full of possibility.</p><div class="menu-buttons">${resumable?btn(`Continue ${data.season.status==='complete'?'your season':`· Week ${Math.min(6,data.run.week+1)}`}&nbsp; →`,'continue'):btn('Enter the competition &nbsp; →','new')}${resumable?btn('Start a new season','new','secondary'):''}${btn('The practice kitchen','practice','secondary')}</div><div class="menu-facts"><span>6 weeks</span><span>36 recipes</span><span>One beautiful mess</span></div></section><div class="hero-bake">${foodSVG({kind:'cake',layers:3,flavour:'berry',quality:100,decorations:[{x:.39,y:.17,type:'berry'},{x:.48,y:.09,type:'cream'},{x:.58,y:.14,type:'berry'},{x:.65,y:.23,type:'leaf'}]})}<div class="hero-caption">Something lovely is rising.<small>Your place at the bench is ready</small></div></div></div><footer class="menu-bottom"><span>Made for slow Sundays & slightly sticky fingers.</span><button data-action="cast">Meet your fellow bakers →</button></footer></main>`;}
function rankings(rows,caption='This bake'){return `<div class="table-wrap"><table class="standings"><thead><tr><th>Place</th><th>${caption}</th><th>Score</th></tr></thead><tbody>${(rows||[]).map((p,i)=>`<tr class="${p.id==='you'?'player':''}"><td>${String(i+1).padStart(2,'0')}</td><td><div class="standing-person">${portrait(p.id)}<span>${esc(p.name||nameOf(p.id))}${p.id==='you'?'<span class="row-sub">Your bench</span>':''}</span></div></td><td>${Math.round(p.score)}<span class="muted"> / 100</span></td></tr>`).join('')}</tbody></table></div>`;}
function weekResult(){const u=run(),res=u.result,star=res.star,elim=res.eliminated,final=res.final;const playerRank=(res.weekRanking||[]).findIndex(x=>x.id==='you')+1;return `<main class="page fade-in">${header()}<div class="scroll-area"><div class="page-intro"><span class="eyebrow">${final?'The grand final':`Week ${u.week+1} complete`}</span><h1>${final?(playerRank===1?'You’ve won the Village Bake!':'A finalist to be proud of.'):(elim==='you'?'Time for another batch.':'What a week in the tent.')}</h1><p>${final?'Six weeks of flour, nerve and rather a lot of washing-up.':WEEKS[u.week].subtitle}</p></div><div class="ribbon"><span class="eyebrow" style="color:#d3dfb8">${final?'The Village Bake champion':'This week’s Star Baker'}</span><h2>${esc(nameOf(final?(res.winner||res.weekRanking?.[0]?.id):star))}</h2><p>${final?`You finished ${playerRank===1?'first':playerRank===2?'second':'third'} in the final.`:elim==='you'?'The judges are sending you home — but your apron is still here. Retry this week with everything you’ve learned.':`${nameOf(elim)} leaves the tent. ${data.season.active.length} bakers continue.`}</p></div>${rankings(res.weekRanking,final?'Final week average':'Three-round average')}<div class="result-actions">${final?btn('Back to the tent','home'):elim==='you'?btn('Retry this week','retry-week'):btn(u.week===4?'On to the final &nbsp; →':'Next week &nbsp; →','next-week')}${btn('The practice kitchen','practice','secondary')}</div></div></main>`;}
function cast(){return `<main class="page fade-in">${header()}<div class="scroll-area"><div class="page-intro"><span class="eyebrow">A very good bunch</span><h1>Your fellow bakers.</h1><p>Seven familiar faces by the end of the summer. Each has a speciality, and every one of them wants that cake stand.</p></div><div class="cast">${[{id:'you',name:'You',job:'The newest face in the tent',trait:'A little courage goes a long way.',speciality:-1},...RIVALS].map(p=>`<article class="cast-card">${portrait(p.id)}<h3>${p.name}</h3><p><strong>${p.job}</strong><br>${p.trait}</p><span class="tag">${p.id==='you'?'Your story starts here':WEEKS[p.speciality].theme+' specialist'}</span></article>`).join('')}</div><div class="result-actions">${btn('Back to the tent','home')}</div></div></main>`;}

function render() {
  app.innerHTML = ({menu,brief,game,result,week:weekResult,practice,cast}[screen] || menu)();
  if(screen==='game') { paintScene(); updateReadouts(); }
  document.title=screen==='game'?`${recipe().name} · The Village Bake`:'The Village Bake';
}
function ensureDecoration() {
  const available=recipe().decorationIds||Object.keys(DECORATIONS);
  if(!available.includes(decorType))decorType=available[0]||'cream';
}
function stageChanged() { stopHold(); ensureDecoration(); save(); render(); }
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
    case 'start':
      run().bake=createBake(recipe(),{...runOptions(),practice:mode==='practice'});
      ensureDecoration();go('game');sound('success');break;
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
    case 'decor-type':
      decorType=el.dataset.value;
      document.querySelectorAll('.decor-choice').forEach(b=>{b.classList.toggle('selected',b.dataset.value===decorType);b.setAttribute('aria-pressed',b.dataset.value===decorType);});
      updateReadouts();sound('place');break;
    case 'undo':bake().decorations.pop();save();paintScene();updateReadouts();break;
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
  if(screen==='brief'&&['flavour','accent','filling','finish'].includes(field)) {
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
  else if(field==='decor-size')decorSize=value;
  else return;
  updateReadouts(); if(field!=='pour-rate')paintScene(); save();
});
document.addEventListener('pointerdown',e=>{
  if(screen!=='game'||paused||e.button>0)return;
  if(activePointer!==null&&activePointer!==e.pointerId)return;
  const el=e.target.closest('[data-hold]');
  if(el){e.preventDefault();activePointer=e.pointerId;holding=el.dataset.hold;el.setPointerCapture?.(e.pointerId);el.classList.add('holding');sound();return;}
  const deco=e.target.closest('[data-decor]');
  if(deco){decorType=deco.dataset.decor;activePointer=e.pointerId;dragDecor={type:decorType,startX:e.clientX,startY:e.clientY,pointerId:e.pointerId};deco.setPointerCapture?.(e.pointerId);}
  else if(e.target.closest('#decor-surface')){placeAt(e.clientX,e.clientY);e.preventDefault();}
});
document.addEventListener('pointerup',e=>{
  if(activePointer!==null&&activePointer!==e.pointerId)return;
  const drag=dragDecor;dragDecor=null;stopHold();
  if(drag&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>15){
    const rect=$('#decor-surface')?.getBoundingClientRect();
    if(rect&&e.clientX>=rect.left&&e.clientX<=rect.right&&e.clientY>=rect.top&&e.clientY<=rect.bottom)placeAt(e.clientX,e.clientY);
  }
});
for(const event of ['pointercancel','lostpointercapture'])document.addEventListener(event,e=>{
  if(activePointer!==null&&activePointer!==e.pointerId)return;stopHold();dragDecor=null;
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!modal.open&&screen==='game'){act('pause');return;}
  if(screen!=='game'||paused||![' ','Enter'].includes(e.key))return;
  if(e.target.matches('[data-hold]')){e.preventDefault();holding=e.target.dataset.hold;e.target.classList.add('holding');}
  else if(e.target.id==='decor-surface'){e.preventDefault();const d=$('#decor-surface').getBoundingClientRect();placeAt(d.left+d.width*.5,d.top+d.height*.48);}
});
document.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')stopHold();});
function placeAt(cx,cy) {
  if(paused||bake()?.stage!=='decorate')return;
  const svg=$('#scene>svg'),box=svg?.getBoundingClientRect();if(!box||!box.width||!box.height)return;
  const scale=Math.min(box.width/700,box.height/500),ox=box.left+(box.width-700*scale)/2,oy=box.top+(box.height-500*scale)/2;
  const opts=foodOptions(),sx=(cx-ox)/scale,sy=(cy-oy)/scale;
  const {x,y}=snapDecoration(opts,sx,sy);
  addDecoration(bake(),{x,y,type:decorType,size:decorSize,angle:0});
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
