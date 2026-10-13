import { visibleDefects } from './presentation.js';

let artId = 0;
const uid = () => `vb-art-${++artId}`;
const clamp = (n,a=0,b=1) => Math.max(a,Math.min(b,Number(n)||0));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const svg = (body,title,w=700,h=500) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">${body}</svg>`;
const grad = (id, a, b, extra='') => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1" ${extra}><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const ellipseShadow = (cx=350,cy=439,rx=222,ry=24) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#55402f" opacity=".10"/>`;

export function tentSVG(){
 const p=uid();
 const window=(x,w=194)=>`<g><path d="M${x} 489V299a${w/2} ${w/2} 0 0 1 ${w} 0v190Z" fill="url(#${p}-sky)" stroke="#e2d9bd" stroke-width="13"/><path d="M${x+5} 420q${w*.35} -76 ${w*.65} -20t${w*.35} -6v90h-${w}" fill="#849674"/><path d="M${x+5} 463q${w*.5} -53 ${w*.7} -34t${w*.3} -9v64h-${w}" fill="#667d60"/><path d="M${x+w/2} 206V489M${x+3} 326H${x+w-3}M${x+3} 408H${x+w-3}" stroke="#f6f0db" stroke-width="8"/><path d="M${x-8} 493H${x+w+8}" stroke="#b5b496" stroke-width="12"/></g>`;
 const bunting=Array.from({length:17},(_,i)=>{const x=18+i*98,y=162+Math.sin(i/16*Math.PI)*82;return `<path d="M${x} ${y}l70 9-33 62Z" fill="${['#af624f','#8fa18c','#d7b268','#ddd2b1'][i%4]}" opacity=".94"/><path d="M${x+7} ${y+6}l53 7-26 43Z" fill="none" stroke="#fff" opacity=".13" stroke-width="2"/>`}).join('');
 const floor=Array.from({length:13},(_,i)=>`<path d="M800 602L${-850+i*280} 1000" stroke="#cbb996" stroke-width="2" opacity=".30"/>`).join('');
 return svg(`<defs>${grad(p+'-sky','#d8e7e4','#edf0d9')}${grad(p+'-roof','#faf5e6','#e5dfc8')}${grad(p+'-wall','#f2eedc','#e2dcc2')}${grad(p+'-floor','#d6c6a7','#bca181')}${grad(p+'-wood','#ab805a','#71503b')}${grad(p+'-cream','#e9e3cb','#b4b795')}</defs>
 <rect width="1600" height="1000" fill="#eee9d8"/><path d="M0 0H1600V158L800 63 0 160Z" fill="#f9f5e9"/>
 <path d="M0 80L800 4 1600 80V239L800 141 0 239Z" fill="url(#${p}-roof)"/><path d="M0 136L800 53 1600 136M800 0V146M282 110L800 0 1318 110" fill="none" stroke="#d1c9b3" stroke-width="5"/>
 <rect y="170" width="1600" height="470" fill="url(#${p}-wall)"/>
 <path d="M0 170Q800 65 1600 170" fill="none" stroke="#d0c7aa" stroke-width="11"/>
 ${[50,317,703,1089,1356].map(x=>window(x,x===703?194:194)).join('')}
 <path d="M0 518H1600V634H0Z" fill="#d9d2b5"/><path d="M0 520H1600" stroke="#f7f0da" stroke-width="9"/>
 <path d="M0 0L115 0 140 596 96 620 56 595Z" fill="#eee9d3"/><path d="M1600 0H1485L1460 596 1504 620 1544 595Z" fill="#eee9d3"/>
 <path d="M85 5L113 585M1515 5L1487 585" stroke="#d6cdb2" stroke-width="10" opacity=".7"/>
 <rect y="611" width="1600" height="389" fill="url(#${p}-floor)"/>${floor}<path d="M0 666H1600M0 746H1600M0 852H1600" stroke="#c0ad8d" opacity=".35" stroke-width="3"/>
 <g opacity=".9"><rect x="195" y="513" width="312" height="123" rx="9" fill="url(#${p}-cream)"/><rect x="185" y="500" width="332" height="24" rx="6" fill="url(#${p}-wood)"/><path d="M216 542H488M352 529V631" stroke="#a4aa8b" stroke-width="3"/><path d="M248 554H294M411 554H457" stroke="#6c7864" stroke-width="5" stroke-linecap="round"/><rect x="222" y="632" width="18" height="46" fill="#777f68"/><rect x="463" y="632" width="18" height="46" fill="#777f68"/>
 <rect x="1114" y="513" width="300" height="123" rx="9" fill="url(#${p}-cream)"/><rect x="1104" y="500" width="320" height="24" rx="6" fill="url(#${p}-wood)"/><path d="M1134 542H1393M1265 529V631" stroke="#a4aa8b" stroke-width="3"/><path d="M1167 554H1206M1310 554H1349" stroke="#6c7864" stroke-width="5" stroke-linecap="round"/><rect x="1137" y="632" width="18" height="46" fill="#777f68"/><rect x="1375" y="632" width="18" height="46" fill="#777f68"/></g>
 <g transform="translate(238 421)"><ellipse cx="52" cy="72" rx="54" ry="8" fill="#685441" opacity=".16"/><path d="M6 18H81L72 67Q43 82 14 66Z" fill="#a7b59a"/><ellipse cx="44" cy="18" rx="39" ry="10" fill="#cfd8c2"/><path d="M9 20Q45 31 78 21" fill="none" stroke="#f1f2df" stroke-width="3"/><path d="M78 29Q105 20 98 45T73 57" fill="none" stroke="#8c9c7c" stroke-width="8"/></g>
 <g transform="translate(1173 411)"><path d="M13 80V29q-3-26 23-27h29q22 0 22 24v16H47v38Z" fill="#bb725c"/><path d="M32 27H80" stroke="#e0a184" stroke-width="6" stroke-linecap="round"/><path d="M39 43v19" stroke="#63645c" stroke-width="5"/><path d="M15 63H75L68 84H23Z" fill="#b9bcb1"/><ellipse cx="45" cy="62" rx="29" ry="6" fill="#e4e2d5"/></g>
 <g transform="translate(944 400)"><path d="M14 102L7 52h62l-7 50Z" fill="#bc9268"/><ellipse cx="38" cy="52" rx="32" ry="8" fill="#8c7757"/><path d="M38 60V1M38 41Q8 37 5 8Q34 9 38 31M38 52Q69 40 76 11Q44 15 38 40M38 21Q55 6 50-12" fill="#879571" stroke="#6d805e" stroke-width="3"/></g>
 <path d="M0 166Q800 330 1600 166" fill="none" stroke="#807d68" stroke-width="3"/>${bunting}
 <g opacity=".7"><path d="M578 180V589M1018 180V589" stroke="#c0b599" stroke-width="10"/><path d="M585 180V589M1025 180V589" stroke="#faf4df" stroke-width="3"/></g>
 <path d="M0 853Q800 802 1600 853V1000H0Z" fill="#7f6249" opacity=".04"/>`, 'A sunlit countryside baking tent with arched windows, bunting and wooden workbenches',1600,1000);
}

export function bowlSVG({progress=0,amount=0,mixing=false,flavour='berry'}={}){
 const p=uid(), mixed=clamp(progress/100), fill=clamp(amount/100), batter=flavour==='chocolate'?'#825138':flavour==='lemon'?'#efd589':'#e9c997';
 const sacks=`<g transform="translate(45 220) rotate(-7)"><ellipse cx="42" cy="142" rx="50" ry="8" fill="#6e5140" opacity=".12"/><path d="M10 22L12 1 77 1 72 24 85 127Q48 145 0 126Z" fill="url(#${p}-paper)" stroke="#b8a88c" stroke-width="1.5"/><path d="M12 3Q40 14 77 3M8 24Q41 33 73 24" fill="none" stroke="#c2b493" stroke-width="2"/><rect x="15" y="55" width="53" height="43" rx="3" fill="#f1ecdc"/><path d="M40 60v26m0-15-8-6m8 13-8-6m8-1 8-6m-8 13 8-6" stroke="#b29160" stroke-width="2"/><text x="42" y="95" text-anchor="middle" font-size="8" letter-spacing="2" fill="#6f6c55" font-family="serif">FLOUR</text></g>`;
 return svg(`<defs>${grad(p+'-ceramic','#adbba0','#667c68')}${grad(p+'-rim','#d5ddc3','#8fa486')}${grad(p+'-batter',batter,flavour==='chocolate'?'#603d29':'#cb9f6d')}${grad(p+'-steel','#eeeee6','#9aada6')}${grad(p+'-paper','#e6dbbd','#c7b796')}${grad(p+'-wood','#c28d57','#815632')}
 <radialGradient id="${p}-inside"><stop stop-color="#768970"/><stop offset="1" stop-color="#486553"/></radialGradient></defs>
 ${ellipseShadow(347,434,265,26)}${sacks}
 <g transform="translate(542 281)"><path d="M-6 92Q-20 58 9 42Q25 36 38 55Q60 100 26 107Z" fill="#dfcbaa" stroke="#b9a688"/><path d="M44 87Q25 64 47 38Q60 25 78 42Q108 77 80 97Z" fill="#eaddc3" stroke="#c5b493"/><path d="M5 57Q-5 67 0 81M54 47Q45 56 50 70" fill="none" stroke="#f7eddb" stroke-width="5" stroke-linecap="round"/><path d="M-7 119Q30 124 80 112" fill="none" stroke="#b9ac8c" stroke-width="3"/></g>
 <g transform="translate(534 206) rotate(18)"><rect x="0" y="0" width="38" height="123" rx="14" fill="#d9cba9" stroke="#b4a384"/><path d="M10 8v77" stroke="#eee2c5" stroke-width="5" stroke-linecap="round"/><path d="M0 34h38M0 95h38" stroke="#ac9a74" stroke-width="2"/><path d="M11 119v35q7 14 16 0v-35" fill="url(#${p}-wood)" stroke="#8b633f"/></g>
 <path d="M159 263Q164 406 272 429H425Q519 397 534 263Z" fill="url(#${p}-ceramic)" stroke="#5d7662" stroke-width="2"/>
 <path d="M183 289Q199 386 275 409" fill="none" stroke="#d7dfc7" stroke-width="10" stroke-linecap="round" opacity=".43"/><path d="M510 283Q494 376 440 408" fill="none" stroke="#3e5d48" stroke-width="9" opacity=".18"/>
 <ellipse cx="346" cy="259" rx="189" ry="81" fill="url(#${p}-rim)" stroke="#6b836a" stroke-width="2"/>
 <ellipse cx="346" cy="258" rx="171" ry="65" fill="url(#${p}-inside)"/>
 <ellipse cx="347" cy="${277-fill*17}" rx="${127+fill*34}" ry="${37+fill*14}" fill="url(#${p}-batter)"/>
 ${mixed<.35?`<path d="M252 265q29-30 48-9t45-12 44 14q-23 37-63 32t-74-25" fill="#f0e5c8" opacity="${.7-mixed}"/><ellipse cx="377" cy="276" rx="26" ry="14" fill="#e4b459" opacity="${1-mixed*2}"/>`:''}
 <g fill="none" stroke="${flavour==='chocolate'?'#a4764e':'#f8e0b0'}" stroke-linecap="round" opacity=".6"><path d="M226 264Q337 324 452 264" stroke-width="5"/><path d="M273 251q51-27 114 4t-37 37q-56 7-67-14t65-12" stroke-width="3"/><path d="M414 249q37 9 34 24" stroke-width="3"/></g>
 <path d="M165 258Q183 335 346 339T529 260" fill="none" stroke="#aebf9e" stroke-width="12"/><path d="M164 254Q169 319 345 328T529 254" fill="none" stroke="#d4dec0" stroke-width="4"/>
 <g transform="rotate(${mixing?-18:16} 376 228)"><path d="M360 218Q323 290 352 302Q380 311 393 270L385 215" fill="none" stroke="#87968e" stroke-width="5"/><path d="M367 212Q336 285 358 301Q378 295 378 218M374 213Q359 283 367 299" fill="none" stroke="#d3dbcb" stroke-width="3"/><path d="M361 215L401 71Q404 60 416 63Q429 66 425 80L385 221Z" fill="url(#${p}-wood)" stroke="#775034" stroke-width="2"/><path d="M371 204L407 78" stroke="#dea96a" stroke-width="4" stroke-linecap="round"/><path d="M361 214L385 220" stroke="#b7c0af" stroke-width="11"/><circle cx="414" cy="76" r="4" fill="#705137"/></g>
 ${mixing?`<g stroke="#8c9b77" stroke-width="3" fill="none" opacity=".55"><path d="M133 246q-11-49 24-78m-29 10 31-12-5 29"/><path d="M545 276q9 42-19 66m28-7-30 8 5-27"/></g>`:''}
 <g fill="#f5ecd2" opacity=".85"><ellipse cx="202" cy="409" rx="7" ry="2"/><ellipse cx="174" cy="415" rx="3" ry="2"/><ellipse cx="511" cy="409" rx="10" ry="2"/><circle cx="496" cy="413" r="2"/></g>`, 'A sage ceramic mixing bowl with batter, a wooden whisk, flour and eggs');
}

function berry(x,y,r=14){return `<g transform="translate(${x} ${y})"><path d="M-${r} -3Q-${r*1.2} -${r} 0 -${r*.65}Q${r*1.2} -${r} ${r} -3Q${r*.6} ${r} 0 ${r*1.2}Q-${r*.6} ${r} -${r} -3" fill="#b54439" stroke="#8f302e" stroke-width="1.5"/><path d="M-5-4q-4 6 1 12" fill="none" stroke="#ee8970" stroke-width="3" stroke-linecap="round"/><path d="M0-${r*.5}l-7-7 6 1 3-6 3 6 6-2-6 8" fill="#65834d"/><g fill="#edb995"><ellipse cx="5" cy="1" rx="1" ry="2"/><ellipse cx="-6" cy="0" rx="1" ry="2"/><ellipse cx="1" cy="10" rx="1" ry="2"/></g></g>`}
function cream(x,y,s=1,fill='#fff2d3'){return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-17 5Q-23-4-10-9Q-14-18-1-23Q1-33 9-31Q1-23 11-17Q21-13 16-6Q27 3 13 7Z" fill="${fill}" stroke="#dfc798" stroke-width="1"/><path d="M-9-7q11 5 23 0M-5-17q8 4 14 0" fill="none" stroke="#ead4aa" stroke-width="2"/></g>`}
function leaf(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 6Q-23-5-15-19Q5-17 4 3Q7-22 27-14Q23 5 5 8" fill="#6e905b"/><path d="M-12-15L4 8 23-10" fill="none" stroke="#a7ba83" stroke-width="1.5"/></g>`}


const ART_FLAVOURS={berry:{body:'#d3a1a4',cream:'#e6bbc0',accent:'#b84c67'},lemon:{body:'#ead396',cream:'#f3e2a4',accent:'#e2bc4c'},chocolate:{body:'#976441',cream:'#805138',accent:'#694334'},vanilla:{body:'#e6c88f',cream:'#f5e7c7',accent:'#d7ba85'},herb:{body:'#d4bf82',cream:'#d4dec0',accent:'#668768'},coffee:{body:'#b59070',cream:'#c8a184',accent:'#815b42'},orange:{body:'#e7b679',cream:'#f0ce9b',accent:'#d68742'},raspberry:{body:'#d697a2',cream:'#eab5bf',accent:'#b94867'},coconut:{body:'#e9d6b2',cream:'#fff1dc',accent:'#ddd9c6'},almond:{body:'#d9bb85',cream:'#eedbbb',accent:'#b69368'},pistachio:{body:'#b8bf81',cream:'#d6dbab',accent:'#899654'},hazelnut:{body:'#c49b6c',cream:'#e0c3a0',accent:'#94724e'},cinnamon:{body:'#bc8b5d',cream:'#e4c5a3',accent:'#a7734c'},ginger:{body:'#c0965a',cream:'#e1c29a',accent:'#b58646'},caramel:{body:'#c18a48',cream:'#dfb572',accent:'#b87534'},rose:{body:'#dbb6b0',cream:'#f0cecd',accent:'#b87a87'}};
const componentColour=id=>/chocolate|ganache/.test(id)?'#714531':/raspberry|berry|jam/.test(id)?'#b84f60':/lemon|curd/.test(id)?'#e6c656':/custard/.test(id)?'#ead394':/caramel/.test(id)?'#c18b48':/pistachio/.test(id)?'#b6c38b':/coffee/.test(id)?'#b9916e':/rose/.test(id)?'#e7bec8':'#f5e8cd';
// Preparation changes the bake's structure as well as its colour.
function methodProfile(kind,defects={}){
 const dense=clamp(defects.dense/100),weak=clamp(defects.weakDough/100),layers=clamp(defects.lostLayers/100),foam=clamp(defects.deflated/100),tough=clamp(defects.toughDough/100);
 const stated=Number.isFinite(defects.rise)?clamp(defects.rise,.45,1):1;
 const spread=clamp(defects.spread/100);
 return {x:1+(kind==='bread'?weak*.2:layers*.07)+spread*.12,y:Math.max(.45,Math.min(stated,1-dense*.26-foam*.4-weak*.2-layers*.28-tough*.09)-spread*.1)};
}
function decorationSVG(type,x,y,rotation=0,colour){
 const pink=colour||'#e5b5ba';
 let body='';
 if(type==='berry'||type==='strawberry')return berry(x,y,12);
 if(type==='cream'||type==='icing')return `<g transform="rotate(${rotation} ${x} ${y})">${cream(x,y,.9,colour||'#fff2d3')}</g>`;
 if(type==='leaf'||type==='mint')return leaf(x,y,.85);
 if(type==='blueberry')body=`<circle r="11" fill="#596982" stroke="#394c63" stroke-width="1.5"/><circle cx="-3" cy="-3" r="6" fill="#8999ac" opacity=".65"/><path d="M1-5l3 3 4-1-1 4 2 2-4 1-3 3-2-4-4-1 4-3Z" fill="#405269"/>`;
 else if(type==='raspberry')body=`${[[-6,-5],[3,-9],[8,-2],[-8,3],[0,0],[5,6],[-3,8]].map(([a,b],i)=>`<circle cx="${a}" cy="${b}" r="5.5" fill="${i%2?'#cc6270':'#b64d63'}" stroke="#99394e" stroke-width=".8"/><circle cx="${a-1}" cy="${b-2}" r="1.5" fill="#eb99a1" opacity=".7"/>`).join('')}`;
 else if(type==='lemon'||type==='orange'){const c=type==='lemon'?'#ecc859':'#e6a05b';body=`<path d="M-20 0A20 20 0 0 1 20 0Z" fill="${c}" stroke="${type==='lemon'?'#ccae3e':'#cb783c'}" stroke-width="2"/><path d="M-16-1A16 16 0 0 1 16-1Z" fill="${type==='lemon'?'#f7e28c':'#f4c085'}" stroke="#fff1c9" stroke-width="2"/><path d="M0-1V-15M0-1-12-10M0-1 12-10" stroke="#fff1c9" stroke-width="2"/>`;}
 else if(type==='chocolate')body='<rect x="-11" y="-25" width="22" height="34" rx="2" fill="#68432d" stroke="#412d21"/><path d="M-9-12H9M0-23V7" stroke="#a57751" stroke-width="2"/>';
 else if(type==='curl')body='<path d="M-18 8q28-3 32-17q7-18-7-21q-12-3-16 10q1 8 10 4q6-4 1-7" fill="none" stroke="#6e482f" stroke-width="8" stroke-linecap="round"/><path d="M-18 5q23 0 29-16" fill="none" stroke="#ad8257" stroke-width="3"/>';
 else if(type==='shard')body='<path d="M-10 10L-16-38 4-28 14-42 18 7Z" fill="#694832" stroke="#452e24" stroke-width="1.5"/><path d="M-13-30L4 1M5-25L15-9" stroke="#b99068" stroke-width="2" opacity=".6"/>';
 else if(type==='rosette')body=`<path d="M-9 9C-29 3-14-21 4-16C25-10 22 12 6 14C-9 16-18 1-6-5C2-10 11-1 6 4" fill="none" stroke="${pink}" stroke-width="10" stroke-linecap="round"/><path d="M-10 6C-21 1-12-16 3-13C17-8 18 9 6 10C-4 11-11 2-4-2" fill="none" stroke="#fff0de" stroke-width="3" stroke-linecap="round"/>`;
 else if(type==='shell')body=`<path d="M-20 9Q-22-10-5-18Q6-26 15-14Q26-6 17 5Q6 14-20 9Z" fill="${colour||'#f5e7c8'}" stroke="#d6c39e"/><path d="M-15 7L2-17M-10 8 10-13M-5 9 16-7M0 10 17 0" stroke="#d9c59f" stroke-width="2"/>`;
 else if(type==='flower')body=`${[0,1,2,3,4].map(j=>`<ellipse cy="-9" rx="6" ry="11" fill="${pink}" stroke="#c68b7c" transform="rotate(${j*72})"/>`).join('')}<circle r="5" fill="#e4b650"/>`;
 else if(type==='pearl')body=[[-8,0],[0,-5],[8,0],[0,6]].map(([a,b])=>`<circle cx="${a}" cy="${b}" r="4.5" fill="#ede4c9" stroke="#cabb99"/><circle cx="${a-1.5}" cy="${b-1.5}" r="1.5" fill="#fffbee"/>`).join('');
 else if(type==='sprinkle')body=Array.from({length:12},(_,i)=>`<path d="M${-16+(i*11)%31} ${-10+(i*7)%23}l${i%2?3:0} ${i%2?2:5}" stroke="${['#a95860','#bd9854','#8b9f7a','#f2e4c9'][i%4]}" stroke-width="2.5" stroke-linecap="round"/>`).join('');
 else if(type==='almond')body=[[-9,2,-30],[5,-4,25],[8,9,60]].map(([a,b,r])=>`<g transform="translate(${a} ${b}) rotate(${r})"><ellipse rx="5" ry="11" fill="#e2c08a" stroke="#b69158"/><path d="M0-8V8" stroke="#f9dbab" stroke-width="1.5"/></g>`).join('');
 else if(type==='pistachio')body=[[-8,-4],[3,-9],[8,2],[-2,6],[-13,8]].map(([a,b],i)=>`<path d="M${a-4} ${b-3}l7-2 3 5-6 4-5-2Z" fill="${i%2?'#a2af66':'#79925b'}" stroke="#5e7b48" stroke-width=".7"/>`).join('');
 else if(type==='meringue')body='<path d="M-18 9q-9-13 5-18q-1-8 11-13q2-8 10-13q-5 13 4 18q12 8 7 15q13 12-4 15Z" fill="#fbefcf" stroke="#dbcba7"/><path d="M-11 6q13 7 23 0M-7-4q12 7 22 2M-1-15q5 6 11 6" fill="none" stroke="#e5d5ae" stroke-width="2"/>';
 else if(type==='fondant')body=`<path d="M-21 7Q-23-8-7-14Q5-23 21-12Q8-3 12 11Q-8 21-21 7Z" fill="${colour||'#e7bdc4'}" stroke="#bb8f9b"/><path d="M-19 4Q-6-2 7 2L17-8" fill="none" stroke="#fff3e6" stroke-width="3" opacity=".6"/>`;
 else if(type==='lattice')body='<g fill="none" stroke="#ead3a1" stroke-width="5"><path d="M-25-13l39 30M-13-23l39 30M-26 6l39-29M-15 16l39-29"/></g><g fill="none" stroke="#bf9457" stroke-width="1"><path d="M-25-10l39 30M-13-20l39 30"/></g>';
 else if(type==='arch')body='<path d="M-25 5V-22a25 25 0 0 1 50 0V5" fill="none" stroke="#a47542" stroke-width="9"/><path d="M-25 5V-22a25 25 0 0 1 50 0V5" fill="none" stroke="#ecd5a3" stroke-width="5"/><path d="M-31 7h12M19 7h12" stroke="#c89562" stroke-width="4" stroke-linecap="round"/>';
 else if(type==='flag')body='<path d="M-5 10V-43" stroke="#8c7752" stroke-width="2.5"/><path d="M-3-41H27L17-28 27-17H-3Z" fill="#b86b53" stroke="#914e3c"/><path d="M2-36H17M2-31H12" stroke="#edbc91" stroke-width="2"/>';
 else return berry(x,y,12);
 return `<g transform="translate(${x} ${y}) rotate(${rotation})">${body}</g>`;
}

export function foodSVG({kind='cake',recipeId='',doneness=1,quality=85,decorations=[],flavour='berry',layers=2,flavours=[],filling='none',finish='none',design='stack',shapeValues=[],assemblyScores=[],defects={},stage,assemblyIndex,alignment=50,selected=-1}={}){
 flavour=flavours[0]||flavour;
 const palette=ART_FLAVOURS[flavour]||ART_FLAVOURS.vanilla,secondary=ART_FLAVOURS[flavours[1]]||palette,fillColour=componentColour(filling),finishColour=finish==='none'?palette.cream:componentColour(finish),lean=clamp(defects.lean,-18,18);
 const sizeFor=(i)=>shapeValues.length?clamp(.74+(Number(shapeValues[i%shapeValues.length])||50)/190,.65,1.25):1;
 const isBatch=/madeleine|cookies|biscuits|shortbread|curls|fingers|tarts|choux-buns|six-knot|cinnamon-knots|eclairs|cupcake-batch/.test(recipeId),plateY=isBatch?309:364,plateRY=isBatch?111:49;
 const p=uid(),don=clamp(doneness,0,2),gold=don<.5?'#e1c89b':don>1.45?'#5b3526':'#bd7944',light=don<.5?'#efe0bc':don>1.45?'#855135':'#e8b574',dark=don>1.45?'#38251c':'#9b5c35', chocolate=flavour==='chocolate', frosting=finish==='none'?palette.body:finishColour;
 let food='';
 if(kind==='bread'){
  food=`<path d="M178 321Q178 255 226 219Q287 166 385 182Q493 190 524 267Q555 339 494 362Q320 401 199 357Q180 349 178 321Z" fill="url(#${p}-crust)" stroke="${dark}" stroke-width="2"/><path d="M190 329Q345 372 510 321" fill="none" stroke="${dark}" stroke-width="8" opacity=".35"/>
  ${[0,1,2,3].map(i=>`<path d="M${228+i*68} ${259-i*10}q-9-35 35-54q-14 31 19 56q-31-14-54-2" fill="${light}" stroke="${dark}" stroke-width="2"/><path d="M${242+i*68} ${247-i*10}q-3-19 20-35" fill="none" stroke="#f4d19b" stroke-width="7" stroke-linecap="round"/>`).join('')}
  <g fill="#f3e1bb" opacity=".55">${Array.from({length:40},(_,i)=>`<ellipse cx="${202+(i*73)%310}" cy="${267+(i*29)%73}" rx="${1+i%3}" ry="1.5" transform="rotate(${i*23} ${202+(i*73)%310} ${267+(i*29)%73})"/>`).join('')}</g>`;
 }else if(kind==='biscuit'){
  food=[{x:250,y:325},{x:370,y:330},{x:452,y:293},{x:320,y:275},{x:249,y:271},{x:386,y:248}].map((a,i)=>`<g transform="translate(${a.x} ${a.y}) rotate(${i*11-20}) scale(${sizeFor(i)})"><ellipse cy="6" rx="66" ry="40" fill="${dark}"/><ellipse rx="66" ry="40" fill="url(#${p}-crust)" stroke="${dark}" stroke-width="2"/><ellipse cy="-2" rx="55" ry="31" fill="none" stroke="${light}" stroke-width="3"/>${Array.from({length:9},(_,j)=>`<ellipse cx="${-35+(j*27)%76}" cy="${-20+(j*17)%40}" rx="${chocolate?4:1.6}" ry="${chocolate?3:1.6}" fill="${chocolate?'#593b2b':dark}" opacity=".7"/>`).join('')}${i%2===0?`<path d="M-46-13Q-13 19 20-17M-30 17Q7-17 40 10" fill="none" stroke="${frosting}" stroke-width="5" stroke-linecap="round"/>`:''}</g>`).join('');
 }else if(kind==='pastry'){
  food=`<path d="M185 286L204 340Q342 399 489 341L512 286Z" fill="url(#${p}-crust)" stroke="${dark}" stroke-width="2"/><ellipse cx="348" cy="286" rx="164" ry="68" fill="${light}" stroke="${dark}" stroke-width="2"/><ellipse cx="348" cy="286" rx="145" ry="54" fill="${chocolate?'#754d35':flavour==='lemon'?'#eaca69':'#b75446'}"/>
  ${Array.from({length:24},(_,i)=>{let a=i*Math.PI/12,x=348+155*Math.cos(a),y=286+60*Math.sin(a);return `<ellipse cx="${x}" cy="${y}" rx="11" ry="8" fill="${light}" stroke="${gold}" stroke-width="2" transform="rotate(${i*15} ${x} ${y})"/>`}).join('')}
  ${[-2,-1,0,1,2].map((j)=>`<path d="M${218+j*19} ${258+j*12}L${420+j*19} ${271+j*12}" stroke="${gold}" stroke-width="17"/><path d="M${218+j*19} ${254+j*12}L${420+j*19} ${267+j*12}" stroke="${light}" stroke-width="11"/><path d="M${250+j*26} ${316-j*4}L${348+j*23} ${235+j*4}" stroke="${light}" stroke-width="12"/>`).join('')}
  <path d="M205 308l9 27m18-19 8 29m20-23 6 29m20-25 5 29m22-26 2 30m24-29v30m23-31-2 30m24-32-4 31m24-34-6 29m23-34-7 29m22-37-7 27" stroke="${dark}" stroke-width="3" opacity=".4"/>`;
 }else if(kind==='dessert'){
  food=`<path d="M224 244H476L451 352Q435 380 350 380Q263 380 249 352Z" fill="url(#${p}-glass)" stroke="#a7b6aa" stroke-width="2"/>
  <path d="M237 277H462L452 323Q349 354 247 323Z" fill="${chocolate?'#85563d':'#d48467'}"/><path d="M247 326Q350 351 452 326L446 350Q350 376 253 350Z" fill="${light}"/>
  <path d="M231 254Q347 276 470 254L464 282Q349 305 237 282Z" fill="${frosting}"/>
  <ellipse cx="350" cy="245" rx="126" ry="43" fill="#fbefd2" stroke="#e4d2ab" stroke-width="2"/>
  ${[0,1,2,3,4,5].map(i=>cream(257+i*37,245-Math.sin(i/5*Math.PI)*23,.9)).join('')}${berry(304,226,15)}${berry(355,229,16)}${berry(407,240,15)}${leaf(364,207,.8)}
  <path d="M241 283L257 337" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".45"/>`;
 }else{
  const top=layers>2?169:207, weak=Boolean(lean);
  food=`<g><path d="M207 ${top+22}H492V335Q350 392 207 335Z" fill="url(#${p}-crumb)" stroke="${dark}" stroke-width="2"/><ellipse cx="350" cy="335" rx="143" ry="44" fill="${gold}"/>
  <path d="M208 315Q350 364 492 315V330Q350 379 208 330Z" fill="${frosting}"/>
  <path d="M208 293Q350 341 492 293V307Q350 355 208 307Z" fill="${filling==='none'?gold:fillColour}"/>
  ${layers>2?`<path d="M208 248Q350 296 492 248V263Q350 311 208 263Z" fill="${frosting}"/><path d="M208 237Q350 285 492 237V246Q350 294 208 246Z" fill="${filling==='none'?gold:fillColour}"/>`:''}
  ${finish!=='none'?`<path d="M207 ${top+19}Q350 ${top+68} 492 ${top+19}v27q-7 20-20 4q-12-11-20 10t-25 0q-15-10-23 10t-23 1q-10-15-22 3t-25-5q-8-12-18 4t-25-5q-11-13-20 0t-24-10q-15-14-27-1t-22-15Z" fill="${frosting}" stroke="${chocolate?'#67432f':'#dfcca1'}" stroke-width="1"/>`:''}
  <ellipse cx="350" cy="${top+17}" rx="144" ry="48" fill="${frosting}" stroke="${chocolate?'#67432f':'#dfcca1'}" stroke-width="2"/>
  <ellipse cx="350" cy="${top+13}" rx="127" ry="37" fill="none" stroke="${chocolate?'#a87b53':'#fff5d9'}" stroke-width="2" opacity=".7"/>
  <path d="M266 ${top+15}q82-37 166-2q-70 30-140 8q43-23 88-8" fill="none" stroke="${chocolate?'#a87b53':'#e5d2a8'}" stroke-width="2"/>
  <g fill="${light}" opacity=".6">${Array.from({length:23},(_,i)=>`<circle cx="${220+(i*39)%260}" cy="${top+81+(i*17)%23}" r="${1+i%2}"/>`).join('')}</g></g>`;
 }

 let pieceIndex=0;
 const shell=(x,y,rotation=0)=>`<g transform="translate(${x} ${y}) rotate(${rotation}) scale(${sizeFor(pieceIndex++)})"><path d="M-13 36Q-65 4-53-25Q-41-52-15-44Q0-60 17-44Q43-49 53-25Q64 4 13 36Q0 44-13 36Z" fill="url(#${p}-crust)" stroke="${dark}" stroke-width="2"/><path d="M0 31V-43M-5 30Q-27-8-31-37M5 30Q27-8 31-37M-11 28Q-40-4-47-23M11 28Q40-4 47-23" fill="none" stroke="${gold}" stroke-width="5" stroke-linecap="round"/><path d="M-2 23V-36M-11 17Q-29-8-31-29M11 17Q29-8 31-29" fill="none" stroke="${light}" stroke-width="2"/><path d="M-12 32q12 8 24 0" fill="none" stroke="${dark}" stroke-width="3"/></g>`;
 const knot=(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale*sizeFor(pieceIndex++)})"><ellipse cy="22" rx="60" ry="30" fill="${dark}" opacity=".35"/><path d="M-44 24Q-68-3-45-25Q-24-44 1-29Q31-48 49-25Q68 0 45 22Q18 44 0 31Q-24 43-44 24Z" fill="url(#${p}-crust)" stroke="${dark}" stroke-width="2"/><path d="M-42 20Q-18 21-8-3T35-26M-35-22Q-12-24-1 4T41 22" fill="none" stroke="${dark}" stroke-width="13"/><path d="M-42 15Q-18 16-8-8T35-31M-35-27Q-12-29-1-1T41 17" fill="none" stroke="${light}" stroke-width="15" stroke-linecap="round"/><path d="M-29 14Q-18 10-12-4M10 13q10 8 23 9" fill="none" stroke="${gold}" stroke-width="3"/>${[-26,-12,3,18,31].map((a,i)=>`<ellipse cx="${a}" cy="${-17+(i*11)%29}" rx="2" ry="4" fill="#f1d4a2" transform="rotate(${i*30-30} ${a} ${-17+(i*11)%29})"/>`).join('')}</g>`;
 const tart=(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale*sizeFor(pieceIndex++)})"><path d="M-47 0l8 28q39 25 78 0l8-28Z" fill="url(#${p}-crust)" stroke="${dark}" stroke-width="2"/><ellipse rx="49" ry="24" fill="${light}" stroke="${gold}" stroke-width="5"/><ellipse rx="40" ry="17" fill="${don>1.45?'#b28846':'#ead495'}"/><path d="M-32-2q22-11 43-3" stroke="#fff0bd" stroke-width="4" fill="none" stroke-linecap="round"/><g fill="#9e7248" opacity=".65"><ellipse cx="19" cy="2" rx="7" ry="4"/><ellipse cx="-9" cy="-4" rx="4" ry="2"/><ellipse cx="-22" cy="5" rx="2" ry="2"/></g></g>`;
 const tier=(w,y,h)=>`<g><path d="M${350-w/2} ${y}H${350+w/2}v${h}q-${w/2} ${w*.3}-${w} 0Z" fill="url(#${p}-crumb)" stroke="${dark}" stroke-width="2"/><path d="M${350-w/2} ${y+h-17}q${w/2} ${w*.3} ${w} 0v10q-${w/2} ${w*.3}-${w} 0Z" fill="${frosting}"/><ellipse cx="350" cy="${y}" rx="${w/2}" ry="${w*.15}" fill="${frosting}" stroke="${chocolate?'#61432f':'#dacba4'}" stroke-width="2"/><ellipse cx="350" cy="${y-3}" rx="${w*.44}" ry="${w*.115}" fill="none" stroke="${chocolate?'#a77752':'#fff8e5'}" stroke-width="2"/>${[0,1,2,3,4,5,6].map(i=>{let x=350-w/2+i*w/6;return `<path d="M${x} ${y+Math.sin(i/6*Math.PI)*w*.15}v${7+i%3*4}" stroke="${frosting}" stroke-width="9" stroke-linecap="round"/>`}).join('')}</g>`;
 if(recipeId==='lemon-madeleines'){
   food=shell(260,323,-32)+shell(376,320,-12)+shell(465,270,14)+shell(241,238,-28)+shell(350,228,4)+shell(443,201,24)+`<g fill="#faf0cc" opacity=".75">${[0,1,2,3,4,5,6,7,8,9].map(i=>`<circle cx="${225+i*24}" cy="${212+(i*47)%125}" r="2"/>`).join('')}</g>`;
 }else if(recipeId==='biscuit-greenhouse'){
   food=`<g><path d="M195 335L351 373 502 312 352 275Z" fill="#b18552" stroke="${dark}" stroke-width="3"/><path d="M195 335V230L350 265V374Z" fill="${gold}" stroke="${dark}" stroke-width="3"/><path d="M350 265L502 207V312L350 374Z" fill="${light}" stroke="${dark}" stroke-width="3"/><path d="M195 230L276 141 350 265Z" fill="${light}" stroke="${dark}" stroke-width="4"/><path d="M276 141L420 98 502 207 350 265Z" fill="${gold}" stroke="${dark}" stroke-width="4"/><g fill="#d9ba77" fill-opacity=".7" stroke="#f1e4b9" stroke-width="7" stroke-linejoin="round"><path d="M211 246L267 259V333L211 320Z"/><path d="M282 264L333 277V350L282 337Z"/><path d="M367 275L424 253V329L367 351Z"/><path d="M439 247L486 229V304L439 322Z"/><path d="M221 224L275 163 323 247Z"/><path d="M295 149L415 115 481 203 359 250Z"/></g><g stroke="#f6ebcd" stroke-width="7" fill="none" stroke-linecap="round"><path d="M276 146L351 267V364M195 230L350 267 502 207M351 267L276 141 420 98 502 207M336 135L410 231M378 122L451 219M314 178L437 143M335 210L460 174M238 253V326M396 264V340M465 239V314M211 283L267 296M367 312L424 289M439 285L486 266"/></g><path d="M276 141L420 98" stroke="#fff4d8" stroke-width="11" stroke-linecap="round"/>${leaf(218,321,.9)}${leaf(316,350,.8)}${leaf(468,313,.9)}${berry(244,329,10)}${berry(450,325,10)}</g>`;
 }else if(recipeId==='harvest-wreath'){
   food=`<ellipse cx="350" cy="292" rx="166" ry="83" fill="none" stroke="${dark}" stroke-width="54"/>${Array.from({length:18},(_,i)=>{const a=i*Math.PI/9,x=350+150*Math.cos(a),y=282+72*Math.sin(a);return `<g transform="translate(${x} ${y}) rotate(${i*20+20})"><path d="M-38 5Q-29-29 0-29Q35-29 40 3Q21 30-9 26Q-27 24-38 5Z" fill="url(#${p}-crust)" stroke="${dark}" stroke-width="2"/><path d="M-27 0Q-11-19 18-14" fill="none" stroke="${light}" stroke-width="6" stroke-linecap="round"/><path d="M-11-3l5 7m10-10 3 6m9-3 3 5" stroke="#f5dbac" stroke-width="3" stroke-linecap="round"/></g>`}).join('')}<g transform="translate(351 361)"><path d="M0 0q-53-37-58-10q9 26 56 14q45 23 59-2q1-26-55-3" fill="#a36049" stroke="#814936" stroke-width="2"/><path d="M-8 4l-12 50 20-12 14 13-6-52" fill="#b57754" stroke="#814936" stroke-width="2"/><rect x="-8" y="-11" width="18" height="24" rx="5" fill="#cf9570"/></g>${leaf(224,240,.9)}${leaf(482,310,.9)}`;
 }else if(recipeId==='six-knot-rolls'){
   food=knot(239,235,.88)+knot(350,211,.88)+knot(460,233,.88)+knot(236,314,.88)+knot(350,299,.88)+knot(463,315,.88);
 }else if(recipeId==='village-celebration'||recipeId==='orchard-celebration'){
   food=tier(296,284,48)+tier(211,223,56)+tier(128,166,51)+`${cream(306,284,.7)}${cream(392,284,.7)}${berry(278,288,12)}${berry(425,289,12)}${leaf(278,278,.65)}${leaf(425,278,.65)}${cream(321,224,.7)}${berry(379,224,11)}${leaf(378,212,.65)}`;
   food+=recipeId==='village-celebration'?`<path d="M311 166V81M390 166V81" stroke="#8e7855" stroke-width="3"/><path d="M311 87Q350 110 390 87" fill="none" stroke="#7b7355" stroke-width="2"/>${[0,1,2,3].map(i=>`<path d="M${316+i*18} ${94+Math.sin(i/3*Math.PI)*7}l15 0-7 17Z" fill="${['#b9644d','#91a782','#d4ae66','#b9644d'][i]}"/>`).join('')}${cream(351,162,.9)}`:`${berry(320,167,14)}${berry(354,161,14)}${berry(381,169,13)}${leaf(355,144,.85)}`;
 }else if(recipeId==='vanilla-custard-tarts'){
   food=tart(248,241,.98)+tart(350,219,.98)+tart(453,241,.98)+tart(240,316,.98)+tart(350,298,.98)+tart(460,316,.98);
 }else if(recipeId==='choux-buns'){
   food=[{x:258,y:255},{x:350,y:233},{x:442,y:255},{x:251,y:333},{x:352,y:310},{x:455,y:332}].map(({x,y},i)=>`<g transform="translate(${x} ${y})"><ellipse cy="13" rx="47" ry="21" fill="${gold}" stroke="${dark}" stroke-width="2"/><path d="M-42 5q42-17 84 0" stroke="#fff0ce" stroke-width="14" fill="none"/><path d="M-47-8Q-49-32-27-40Q-12-60 7-45Q38-49 47-22Q58 1 36 7Q1 18-42 7Z" fill="url(#${p}-crust)" stroke="${dark}" stroke-width="2"/><path d="M-35-14q4-22 23-17m18-6q16 1 22 17" fill="none" stroke="${light}" stroke-width="5" stroke-linecap="round"/>${chocolate?'<path d="M-35-28q35-29 72 3Q23-3 0-8T-35-28" fill="#6d4430"/>':''}</g>`).join('');
 }else if(recipeId==='viennese-curls'){
   food=[{x:253,y:258},{x:365,y:236},{x:464,y:269},{x:248,y:333},{x:364,y:321},{x:464,y:337}].map(({x,y},i)=>`<g transform="translate(${x} ${y}) rotate(${i*12-18})"><ellipse cy="6" rx="45" ry="34" fill="${dark}"/><path d="M-22 17C-52 9-27-33 2-25C35-19 43 15 17 23C-4 30-25 8-9-2C1-8 14 3 9 10" fill="none" stroke="${gold}" stroke-width="23" stroke-linecap="round"/><path d="M-23 12C-46 4-24-31 2-23C31-17 39 12 16 19C-3 25-20 7-7-2C1-6 12 1 8 7" fill="none" stroke="${light}" stroke-width="12" stroke-linecap="round"/><path d="M-22 9C-41 2-21-26 3-19C26-12 31 8 15 14C1 19-11 9-6 3" fill="none" stroke="#f2c988" stroke-width="3" stroke-linecap="round"/></g>`).join('');
 }else if(recipeId==='almond-tea-fingers'){
   food=Array.from({length:6},(_,i)=>{const x=236+(i%3)*91,y=249+Math.floor(i/3)*68;return `<g transform="translate(${x} ${y}) rotate(-17)"><rect x="-17" y="-37" width="44" height="94" rx="16" fill="${dark}"/><rect x="-19" y="-42" width="44" height="94" rx="16" fill="url(#${p}-crust)" stroke="${gold}" stroke-width="2"/><path d="M-19 26h44v12q0 14-17 14h-10q-17 0-17-14Z" fill="#71492f"/><ellipse cx="3" cy="-18" rx="8" ry="17" fill="#e9ce96" stroke="#b8955c"/><path d="M4-30V-4" stroke="#c4a56c" stroke-width="1.5"/></g>`}).join('');
 }else if(recipeId==='pastry-sunburst'){
   food=`${Array.from({length:16},(_,i)=>{let a=i*Math.PI/8,x=350+111*Math.cos(a),y=280+61*Math.sin(a);return `<g transform="translate(${x} ${y}) rotate(${i*22.5})"><path d="M-30-18Q2-29 54-13Q70 0 55 15Q12 27-30 17Z" fill="url(#${p}-crust)" stroke="${dark}" stroke-width="2"/><path d="M-11-15q0 22 17 31M16-17q-1 24 18 32" fill="none" stroke="${dark}" stroke-width="4" opacity=".6"/><path d="M-7-18q5 18 17 26M20-19q6 17 17 24" fill="none" stroke="${light}" stroke-width="5"/></g>`}).join('')}<ellipse cx="350" cy="279" rx="65" ry="41" fill="url(#${p}-crust)" stroke="${dark}" stroke-width="2"/><path d="M312 269q32-23 66-2" fill="none" stroke="${light}" stroke-width="5" stroke-linecap="round"/>${leaf(350,272,.8)}`;
 }
 const bun=(x,y,s=1,i=0)=>`<g transform="translate(${x} ${y}) scale(${s*sizeFor(i)})"><ellipse cy="12" rx="41" ry="29" fill="${dark}" opacity=".25"/><path d="M-43 8Q-51-17-26-34Q-5-52 22-35Q51-22 43 10Q2 36-43 8Z" fill="url(#${p}-crust)" stroke="${dark}" stroke-width="1.7"/><path d="M-29-12Q-15-32 13-26" stroke="${light}" stroke-width="5" fill="none" stroke-linecap="round"/>${filling!=='none'?`<path d="M-39 8Q0 20 40 8" stroke="${fillColour}" stroke-width="7" fill="none"/>`:''}${finish!=='none'?`<path d="M-31-25q32-24 64 1Q24-3 3-6T-31-25" fill="${finishColour}" stroke="${finishColour}"/>`:''}</g>`;
 const cookie=(x,y,s=1,i=0,jam=false)=>`<g transform="translate(${x} ${y}) scale(${s*sizeFor(i)})"><ellipse cy="7" rx="54" ry="34" fill="${dark}"/><ellipse rx="54" ry="33" fill="url(#${p}-crust)" stroke="${dark}" stroke-width="2"/>${jam?`<ellipse rx="44" ry="25" fill="${fillColour}"/><ellipse cy="-8" rx="51" ry="29" fill="${light}" stroke="${gold}" stroke-width="2"/><path d="M0-10C-22-29-31-1 0 9C31-1 22-29 0-10Z" fill="${fillColour}"/><path d="M-34-10q-7-2-6 4M29-20l4 2" stroke="#f8e7c3" stroke-width="3"/>`:Array.from({length:10},(_,j)=>`<path d="M${-36+(j*23)%70} ${-18+(j*11)%36}l7-3 5 6-8 4Z" fill="${flavour==='chocolate'?'#463026':'#694735'}" stroke="#4e3725" stroke-width=".6"/>`).join('')}</g>`;
 const cupcake=(x,y,s=1,i=0)=>`<g transform="translate(${x} ${y}) scale(${s*sizeFor(i)})"><path d="M-45-2H45L35 50Q0 67-35 50Z" fill="${i%2?'#b56f5d':'#92a283'}" stroke="#6d795f" stroke-width="1.5"/><path d="M-36 4l7 47m-19-46 13 47M-13 5l3 50M10 5l-2 50M32 5l-6 48" stroke="#ead7b6" stroke-width="2" opacity=".45"/><ellipse rx="46" ry="23" fill="url(#${p}-crust)" stroke="${dark}" stroke-width="2"/>${finish==='none'?`<path d="M-35-8q34-26 71 0" fill="none" stroke="${light}" stroke-width="4"/>`:`<g fill="${finishColour}" stroke="#c6af88" stroke-width="1"><path d="M-37-7q-8-17 12-20q-6-16 13-21q-1-14 17-21q-2 16 12 20q21 3 18 21q19 10 6 23q-35 18-78-2Z"/><path d="M-27-19q25 12 54 0M-17-35q18 9 35 0" fill="none" stroke="#fff0d4" stroke-width="3" opacity=".65"/></g>`}</g>`;
 const chouxTower=()=>Array.from({length:5},(_,row)=>Array.from({length:5-row},(_,col)=>bun(350+(col-(4-row)/2)*58,329-row*42,.77,row*5+col)).join('')).join('')+`<path d="M236 318q123-120 229 0M262 279q90-72 182 0M297 235q50-33 105 0" stroke="#d8a75b" stroke-width="2.5" fill="none" opacity=".7"/>`;
 // A baker's own tiers start bare: every detail on them is one they placed.
 if(recipeId==='tiered-plain')food=tier(296,284,48)+tier(211,223,56)+tier(128,166,51);
 if(recipeId==='cupcake-batch')food=[[250,252],[350,232],[450,252],[250,328],[350,308],[450,328]].map(([x,y],i)=>cupcake(x,y,.62,i)).join('');
 if(recipeId==='swiss-roll'){
  food=`<path d="M214 328V243Q221 212 258 212L430 229Q485 244 482 298L459 347Z" fill="url(#${p}-crumb)" stroke="${dark}" stroke-width="2"/><path d="M225 233L412 249" stroke="${light}" stroke-width="10" fill="none" stroke-linecap="round"/><ellipse cx="430" cy="293" rx="65" ry="62" fill="${light}" stroke="${gold}" stroke-width="5"/><path d="M425 247C488 249 490 326 438 339C388 352 366 288 411 269C449 252 472 299 444 312C426 322 408 302 422 291" fill="none" stroke="${filling==='none'?palette.cream:fillColour}" stroke-width="13" stroke-linecap="round"/><path d="M244 233l127 15" stroke="#fff0d3" stroke-width="4" stroke-linecap="round" opacity=".7"/>${finish!=='none'?`<path d="M241 226q72-25 157 14" fill="none" stroke="${finishColour}" stroke-width="18" stroke-linecap="round"/>`:''}`;
 }else if(recipeId==='marble-loaf'||recipeId==='homecoming-tea-cake'){
  food=`<path d="M213 265L382 229 492 269V341L319 379 213 332Z" fill="url(#${p}-crumb)" stroke="${dark}" stroke-width="2"/><path d="M213 265Q227 213 272 204L386 184Q459 193 492 269L319 308Z" fill="url(#${p}-crust)" stroke="${dark}" stroke-width="2"/><path d="M319 308L492 269V341L319 379Z" fill="${palette.body}"/><path d="M222 254Q292 295 342 230T476 246M229 293Q279 328 296 303M323 332Q376 292 424 317T482 290M326 360Q386 317 419 346T485 314" fill="none" stroke="${secondary.accent===palette.accent?'#806047':secondary.accent}" stroke-width="10" opacity=".85"/><path d="M241 239Q290 248 323 225T416 208" fill="none" stroke="${light}" stroke-width="6"/>${finish!=='none'?`<path d="M239 240L309 277 462 243" fill="none" stroke="${finishColour}" stroke-width="14" stroke-linecap="round"/>`:''}`;
 }else if(recipeId==='chocolate-chip-cookies'||recipeId==='jam-sandwich-biscuits'){
  food=[[249,247],[354,225],[456,251],[240,319],[353,309],[465,324]].map(([x,y],i)=>cookie(x,y,.91,i,recipeId==='jam-sandwich-biscuits')).join('');
 }else if(recipeId==='garden-focaccia'){
  food=`<path d="M192 274Q176 304 207 331L421 367Q476 369 508 321L514 280Z" fill="${gold}" stroke="${dark}" stroke-width="2"/><path d="M209 204L451 222Q499 230 514 280Q505 326 443 338L214 309Q175 295 187 261Z" fill="url(#${p}-crust)" stroke="${dark}" stroke-width="2"/>${Array.from({length:28},(_,i)=>`<ellipse cx="${215+(i*51)%271}" cy="${239+(i*31)%72}" rx="6" ry="3.5" fill="${dark}" opacity=".45"/>`).join('')}${Array.from({length:8},(_,i)=>{let x=225+(i*39)%245,y=248+(i*19)%57;return `<path d="M${x-9} ${y+10}l18-21m-8 8-8-6m10 3 6 4" stroke="#6f834b" stroke-width="2"/><circle cx="${x+15}" cy="${y+7}" r="7" fill="#aa583f" stroke="#8f402f"/>`}).join('')}`;
 }else if(recipeId==='cinnamon-knots'){
  food=[[236,242],[348,223],[459,245],[238,321],[350,307],[460,322]].map(([x,y],i)=>`<g transform="translate(${x} ${y}) scale(${.88*sizeFor(i)})"><ellipse cy="7" rx="55" ry="35" fill="${dark}"/><ellipse rx="55" ry="35" fill="url(#${p}-crust)" stroke="${dark}" stroke-width="2"/><path d="M-34 12C-64-20 8-44 39-15C64 14 13 39-15 16C-34-1-3-19 13-8C28 3 6 17 0 6" fill="none" stroke="#97633d" stroke-width="9"/><path d="M-34 8C-58-19 8-37 36-14C56 11 13 32-10 14" fill="none" stroke="${light}" stroke-width="7"/>${finish!=='none'?`<path d="M-35-9l58 20m-49 9 65-23" stroke="${finishColour}" stroke-width="4" stroke-linecap="round"/>`:''}</g>`).join('');
 }else if(recipeId==='woven-bread-basket'){
  food=`<path d="M194 270Q202 375 350 380Q494 375 507 270Z" fill="${gold}" stroke="${dark}" stroke-width="3"/><ellipse cx="350" cy="270" rx="157" ry="66" fill="${dark}"/><ellipse cx="350" cy="263" rx="144" ry="53" fill="#735637"/>${Array.from({length:9},(_,i)=>`<path d="M${205+i*34} ${288+Math.sin(i/8*Math.PI)*18}q-1 28 ${Math.sin(i/8*Math.PI)*18} ${56+Math.sin(i/8*Math.PI)*13}" fill="none" stroke="${light}" stroke-width="17"/><path d="M${205+i*34} ${288+Math.sin(i/8*Math.PI)*18}q-1 28 ${Math.sin(i/8*Math.PI)*18} ${56+Math.sin(i/8*Math.PI)*13}" fill="none" stroke="${gold}" stroke-width="3"/>`).join('')}<path d="M214 313Q350 363 489 313M231 339Q350 389 469 339" stroke="${light}" stroke-width="15" fill="none"/><ellipse cx="350" cy="273" rx="153" ry="62" fill="none" stroke="${light}" stroke-width="15"/><path d="M219 271V189q0-98 129-98t132 99v77" fill="none" stroke="${dark}" stroke-width="23"/><path d="M219 268V190q0-91 129-91t132 91v76" fill="none" stroke="${light}" stroke-width="15"/>${bun(280,248,.8,0)}${bun(350,228,.9,1)}${bun(420,252,.8,2)}`;
 }else if(recipeId==='summer-fruit-pie'){
  food=`<path d="M190 274L211 339Q350 391 490 338L511 274Z" fill="url(#${p}-crust)" stroke="${dark}" stroke-width="2"/><ellipse cx="350" cy="269" rx="163" ry="69" fill="url(#${p}-crust)" stroke="${dark}" stroke-width="3"/>${Array.from({length:28},(_,i)=>{const a=i*Math.PI/14;return `<ellipse cx="${350+155*Math.cos(a)}" cy="${268+62*Math.sin(a)}" rx="10" ry="6" fill="${light}" transform="rotate(${i*13} ${350+155*Math.cos(a)} ${268+62*Math.sin(a)})"/>`}).join('')}<path d="M299 248q13 12 23 28M351 237v34M403 248q-13 12-23 28" stroke="${dark}" stroke-width="8" stroke-linecap="round"/><path d="M299 245q13 12 23 28M351 234v34M403 245q-13 12-23 28" stroke="${light}" stroke-width="3"/>${leaf(350,285,.8)}`;
 }else if(recipeId==='chocolate-eclairs'){
  food=[[236,248],[350,232],[464,248],[236,329],[350,312],[464,329]].map(([x,y],i)=>`<g transform="translate(${x} ${y}) rotate(-16) scale(${.72*sizeFor(i)})"><rect x="-76" y="-19" width="152" height="53" rx="26" fill="url(#${p}-crust)" stroke="${dark}" stroke-width="2"/><path d="M-64 9H66" stroke="${fillColour}" stroke-width="8" stroke-linecap="round"/><rect x="-77" y="-32" width="153" height="48" rx="24" fill="${light}" stroke="${gold}" stroke-width="2"/><path d="M-53-26H53q28 0 21 20q-38 16-147 0q-3-20 20-20" fill="${finish==='none'?'#73503c':finishColour}"/><path d="M-51-22h76" stroke="#bd926a" stroke-width="3" stroke-linecap="round"/></g>`).join('');
 }else if(recipeId==='choux-croquembouche'||recipeId==='profiterole-tower'){
  food=chouxTower();
 }else if(recipeId==='baked-cheesecake'){
  food=`<path d="M204 257H496v72Q350 391 204 329Z" fill="${palette.cream}" stroke="#c7ac7b" stroke-width="2"/><path d="M204 315Q350 371 496 315v20Q350 391 204 335Z" fill="${gold}" stroke="${dark}" stroke-width="2"/><ellipse cx="350" cy="256" rx="146" ry="50" fill="${don>1.3?gold:palette.cream}" stroke="${gold}" stroke-width="7"/><ellipse cx="350" cy="253" rx="133" ry="41" fill="${finish==='none'?palette.cream:finishColour}"/><path d="M242 248Q283 219 339 222" fill="none" stroke="#fff1d6" stroke-width="5" stroke-linecap="round"/>`;
 }else if(recipeId==='summer-pavlova'){
  food=`<path d="M197 287q1-61 57-67q83-36 176 1q70 7 74 70q-5 86-156 87q-146-3-151-91" fill="#f2e2bb" stroke="#d6bf96" stroke-width="2"/>${Array.from({length:12},(_,i)=>`<path d="M${209+i*25} ${279+Math.sin(i/11*Math.PI)*34}q-5 34 4 ${36+Math.sin(i/11*Math.PI)*19}" stroke="#fff2d1" stroke-width="13" stroke-linecap="round"/>`).join('')}<ellipse cx="350" cy="267" rx="139" ry="52" fill="#fff2d6"/><ellipse cx="350" cy="267" rx="111" ry="34" fill="${finish==='none'?palette.cream:finishColour}"/>${[0,1,2,3,4].map(i=>berry(274+i*38,264+(i%2)*15,15)).join('')}${[0,1,2].map(i=>decorationSVG('blueberry',289+i*48,242)).join('')}${leaf(367,243,.8)}`;
 }else if(recipeId==='jewel-fruit-tart'){
  food=`<path d="M191 285l20 53q139 48 278 0l21-53" fill="${gold}" stroke="${dark}" stroke-width="2"/><ellipse cx="350" cy="282" rx="160" ry="62" fill="${light}" stroke="${gold}" stroke-width="9"/><ellipse cx="350" cy="282" rx="145" ry="48" fill="${fillColour}"/>${Array.from({length:10},(_,i)=>{const a=i*Math.PI/5;return decorationSVG(i%3===0?'blueberry':i%3===1?'raspberry':'orange',350+112*Math.cos(a),281+35*Math.sin(a),i*36);}).join('')}${[0,1,2,3,4].map(i=>berry(294+i*28,277,12)).join('')}${leaf(350,251,.8)}`;
 }else if(recipeId==='butter-brioche'||/plait/.test(recipeId)){
  food=`<path d="M206 319Q175 260 229 244Q260 178 306 215Q354 166 396 211Q458 187 482 247Q545 281 490 330Q356 400 206 319" fill="url(#${p}-crust)" stroke="${dark}" stroke-width="2"/>${Array.from({length:5},(_,i)=>`<path d="M${233+i*52} ${256-i%2*21}q51 16 72 64" stroke="${dark}" stroke-width="11" stroke-linecap="round" fill="none"/><path d="M${237+i*52} ${249-i%2*21}q43 19 60 62" stroke="${light}" stroke-width="22" stroke-linecap="round" fill="none"/>`).join('')}<g fill="#f4dda7">${Array.from({length:23},(_,i)=>`<ellipse cx="${220+(i*39)%274}" cy="${274+(i*13)%40}" rx="2" ry="4" transform="rotate(${i*18} ${220+(i*39)%274} ${274+(i*13)%40})"/>`).join('')}</g>`;
 }else if(recipeId==='biscuit-carousel'){
  food=`<ellipse cx="350" cy="335" rx="152" ry="46" fill="url(#${p}-crust)" stroke="${dark}" stroke-width="3"/><path d="M211 319v-20q138-45 279 0v20q-140 43-279 0" fill="${light}" stroke="${gold}" stroke-width="2"/>${[240,295,351,407,462].map((x,i)=>`<path d="M${x} ${210+Math.sin(i*Math.PI/4)*15}v89" stroke="#e9d29c" stroke-width="7"/><path d="M${x-17} 266q-9-25 13-25l8-16 8 14 16 4-13 15 10 21-12 2-12-13-11 16-8-4Z" fill="${gold}" stroke="${dark}" stroke-width="1.5"/>`).join('')}<path d="M188 213L350 103 511 213q-160 55-323 0" fill="${light}" stroke="${gold}" stroke-width="3"/>${[0,1,2,3,4,5].map(i=>`<path d="M350 104L${201+i*54} ${215+Math.sin(i/5*Math.PI)*27}" stroke="${i%2?'#a46f55':'#f4e1b4'}" stroke-width="20"/>`).join('')}<path d="M188 213q161 55 323 0" stroke="#f1dfb3" stroke-width="10" fill="none"/>${decorationSVG('flag',355,109)}`;
 }else if(recipeId==='celebration-cupcake-tower'){
  food=`<ellipse cx="350" cy="333" rx="185" ry="35" fill="#d5d9bb" stroke="#96a282" stroke-width="3"/>${[0,1,2].map(i=>cupcake(260+i*90,289,.74,i)).join('')}<path d="M340 325V250h20v75" fill="#a9b493"/><ellipse cx="350" cy="249" rx="130" ry="29" fill="#e6e7cb" stroke="#96a282" stroke-width="3"/>${[0,1].map(i=>cupcake(310+i*80,205,.74,i+3)).join('')}<path d="M340 236v-59h20v59" fill="#a9b493"/><ellipse cx="350" cy="173" rx="68" ry="20" fill="#e6e7cb" stroke="#96a282" stroke-width="3"/>${cupcake(350,130,.68,5)}`;
 }else if(recipeId==='celebration-banquet'){
  food=tier(250,281,48)+tier(171,222,56)+tier(95,168,52)+cookie(195,345,.63,0)+cookie(501,345,.63,1)+bun(230,333,.56,2)+bun(473,337,.56,3)+`${cream(321,222,.65)}${cream(384,223,.65)}${decorationSVG('flag',352,166)}`;
 }
 if(design==='tower'&&!/tower|croquembouche|celebration|carousel/.test(recipeId))food=kind==='cake'?tier(294,283,51)+tier(208,222,56)+tier(126,165,51):chouxTower();
 if(design==='wreath'&&recipeId!=='harvest-wreath')food=Array.from({length:12},(_,i)=>{const a=i*Math.PI/6,x=350+145*Math.cos(a),y=281+67*Math.sin(a);return kind==='biscuit'?cookie(x,y,.58,i):bun(x,y,.68,i);}).join('');
 if(flavours.length>1&&!isBatch&&!/greenhouse|carousel|basket|tower|wreath|croquembouche/.test(recipeId))food+=`<g fill="${secondary.accent}" opacity=".65">${Array.from({length:14},(_,i)=>`<ellipse cx="${259+(i*29)%181}" cy="${248+(i*17)%34}" rx="${flavours[1]==='coconut'?3:2}" ry="1.3"/>`).join('')}</g>`;
 if(finish!=='none'){
  const points=Array.from({length:finish==='nut-crunch'||finish==='seed-crust'?18:6},(_,i)=>{const a=200+(i*59)%310,b=206+(i*31)%126,d=snapDecoration({kind,recipeId,layers,design},a,b);return {x:100+d.x*500,y:150+d.y*200};});
  if(finish==='nut-crunch'||finish==='seed-crust')food+=points.map(({x,y},i)=>finish==='nut-crunch'?decorationSVG(flavour==='pistachio'?'pistachio':'almond',x,y,i*23):`<ellipse cx="${x}" cy="${y}" rx="2" ry="4" fill="#9a8c58" transform="rotate(${i*27} ${x} ${y})"/>`).join('');
  if(finish==='cream-finish'||finish==='meringue-finish')food+=points.map(({x,y})=>finish==='meringue-finish'?decorationSVG('meringue',x,y):cream(x,y,.72)).join('');
  if(finish==='caramel-drizzle')food+=points.map(({x,y},i)=>`<path d="M${x-12} ${y-4}q12-5 25 5" fill="none" stroke="#b77733" stroke-width="3" stroke-linecap="round"/>`).join('');
  if(finish==='glaze')food+=points.map(({x,y})=>`<path d="M${x-11} ${y}q10-7 24-2" fill="none" stroke="#fff1c2" stroke-width="3" stroke-linecap="round" opacity=".65"/>`).join('');
 }
 // Every flaw is drawn from the same visibility thresholds the judges use.
 const v=visibleDefects(defects),baseY=plateY-6;
 if(v.cracks)food+=`<path d="M287 262l22 9-9 9 22 8-7 9m-6-26 18-11m-5 28 19-1M402 255l-13 11 7 12-18 12" fill="none" stroke="#775435" stroke-width="${1+v.cracks*3}" stroke-linecap="round" opacity="${clamp(v.cracks*1.6,.25,.85)}"/>`;
 if(v.burnt){const left=(defects.sides?.[0]||1)>=(defects.sides?.[1]||1);food+=`<path d="M${left?214:474} 282q${left?12:-12} 25 ${left?20:-20} 42" fill="none" stroke="#493024" stroke-width="${4+v.burnt*15}" stroke-linecap="round" opacity="${clamp(v.burnt,.15,.8)}"/>`;}
 const defectPoints=Array.from({length:12},(_,i)=>{const d=snapDecoration({kind,recipeId,layers,design},214+(i*47)%281,218+(i*29)%116);return {x:100+d.x*500,y:150+d.y*200};});
 if(v.dense)food+=`<g fill="${dark}" opacity="${v.dense*.38}">${defectPoints.map(({x,y})=>`<path d="M${x-9} ${y}h7m2 4h5m-7-8h4" stroke="${dark}" stroke-width="1.5"/>`).join('')}</g>`;
 if(v.weakDough)food+=`<g fill="none" stroke="${dark}" stroke-width="${1+v.weakDough*3}" opacity="${v.weakDough*.6}">${defectPoints.filter((_,i)=>i%3===0).map(({x,y})=>`<path d="M${x-18} ${y-4}l12 5-6 7 19-2 9 8m-22-13 8-7"/>`).join('')}</g>`;
 if(v.lostLayers)food+=`<g fill="${gold}" opacity="${v.lostLayers*.64}">${defectPoints.filter((_,i)=>i%2===0).map(({x,y})=>`<ellipse cx="${x}" cy="${y}" rx="22" ry="9"/><path d="M${x-15} ${y-2}q15-5 31 0" stroke="${light}" stroke-width="2" fill="none"/>`).join('')}</g>`;
 if(v.deflated||v.sunk){const amount=Math.max(v.deflated,v.sunk),d=snapDecoration({kind,recipeId,layers,design},350,253),x=100+d.x*500,y=150+d.y*200;food+=`<ellipse cx="${x}" cy="${y}" rx="${22+amount*40}" ry="${8+amount*14}" fill="${dark}" opacity="${.08+amount*.28}"/><path d="M${x-40-amount*20} ${y-3}q${40+amount*20} ${14+amount*20} ${80+amount*40} 0" stroke="${light}" stroke-width="3" fill="none" opacity=".55"/>`;}
 if(v.scorched)food+=`<g fill="#493326" opacity="${v.scorched*.75}">${defectPoints.map(({x,y},i)=>`<path d="M${x-4} ${y-2}l8-3 4 5-7 4-6-2Z"/><circle cx="${x+8}" cy="${y-5}" r="${1+i%2}"/>`).join('')}</g>`;
 if(v.toughDough)food+=`<g stroke="${dark}" stroke-width="1.2" fill="none" opacity="${v.toughDough*.55}">${defectPoints.filter((_,i)=>i%3===0).map(({x,y})=>`<path d="M${x-11} ${y-5}l6 7 8-3 6 8m-8-5-1 7"/>`).join('')}</g>`;
 if(v.overProved)food+=`<g fill="none" stroke="${dark}" stroke-width="1.6" opacity="${.2+v.overProved*.5}">${defectPoints.filter((_,i)=>i%2).map(({x,y})=>`<path d="M${x-14} ${y}q7-5 14 0t14 0"/>`).join('')}</g>`;
 if(v.underProved)food+=`<path d="M214 ${baseY-38}l12-9 9 10 12-11 11 9 10-8" fill="none" stroke="#f4dcae" stroke-width="${4+v.underProved*7}" stroke-linejoin="round" opacity=".9"/><path d="M214 ${baseY-35}l12-9 9 10 12-11 11 9 10-8" fill="none" stroke="${dark}" stroke-width="1.5" opacity=".6"/>`;
 if(v.soggy)food+=`<path d="M206 ${baseY-4}q144 ${isBatch?20:44} 288 0" fill="none" stroke="#e6d6a6" stroke-width="${5+v.soggy*10}" stroke-linecap="round" opacity=".9"/>${[0,1,2,3].map(i=>`<ellipse cx="${236+i*76}" cy="${baseY+8}" rx="${5+v.soggy*5}" ry="2.5" fill="#d9c79b" opacity=".8"/>`).join('')}`;
 if(v.shrunk)food+=`<path d="M214 ${baseY-60}q136 -52 272 0" fill="none" stroke="#6b5640" stroke-width="${2+v.shrunk*4}" stroke-dasharray="18 10" opacity="${.25+v.shrunk*.5}"/>`;
 if(v.ooze)food+=`<g stroke="${fillColour}" stroke-width="8" stroke-linecap="round" fill="none">${[226,288,350,412,474].map((x,i)=>`<path d="M${x} ${baseY-48+(i%2)*6}q3 10 0 ${12+v.ooze*24}"/>`).join('')}</g>`;
 if(v.crumbs)food+=`<g fill="${dark}" opacity=".55">${defectPoints.map(({x,y},i)=>`<circle cx="${x+(i%3)*6}" cy="${y-4}" r="1.6"/><circle cx="${x-7}" cy="${y+3}" r="1.1"/>`).join('')}</g>`;
 const preparation=methodProfile(kind,defects);
 if(preparation.x!==1||preparation.y!==1)food=`<g transform="translate(350 362) scale(${preparation.x} ${preparation.y}) translate(-350 -362)">${food}</g>`;
 if(defects.slumped>15)food=`<g transform="translate(350 362) scale(${1+clamp(defects.slumped/100)*.13} ${1-clamp(defects.slumped/100)*.14}) translate(-350 -362)">${food}</g>`;
 if(lean)food=`<g transform="rotate(${lean} 350 355)">${food}</g>`;

 const decs=decorations.map(d=>{const x=100+clamp(d.x)*500,y=150+clamp(d.y)*200,size=clamp(d.size>2?d.size/50:d.size??1,.7,1.5);return `<g transform="translate(${x} ${y}) scale(${size}) translate(${-x} ${-y})">${decorationSVG(d.type,x,y,d.angle??d.rotation??0,d.colour)}</g>`;}).join('')+(decorations[selected]?(()=>{const d=decorations[selected],x=100+clamp(d.x)*500,y=150+clamp(d.y)*200;return `<ellipse cx="${x}" cy="${y-4}" rx="34" ry="28" fill="none" stroke="#2f6a50" stroke-width="3" stroke-dasharray="7 5"/><circle cx="${x+30}" cy="${y-26}" r="7" fill="#2f6a50"/>`;})():'');
 return svg(`<defs>${grad(p+'-crust',light,gold)}${grad(p+'-crumb',chocolate?'#a5744e':palette.body,chocolate?'#70462e':gold)}${grad(p+'-plate','#faf5de','#d2d6ba')}${grad(p+'-stand','#d5dcc4','#8d9d83')}${grad(p+'-glass','#dde5d6','#afc2b0')}</defs>${ellipseShadow(350,450,204,20)}
 <path d="M326 380H374L382 424Q393 432 406 435Q406 451 350 455Q294 451 294 435Q307 432 318 424Z" fill="url(#${p}-stand)" stroke="#8d9e84" stroke-width="2"/><path d="M336 389L330 424" stroke="#edf0d6" stroke-width="7" stroke-linecap="round"/><ellipse cx="350" cy="${plateY+8}" rx="222" ry="${plateRY}" fill="#a9b398" stroke="#849476" stroke-width="2"/><ellipse cx="350" cy="${plateY}" rx="222" ry="${plateRY}" fill="url(#${p}-plate)" stroke="#d1d7bd" stroke-width="2"/><ellipse cx="350" cy="${plateY-4}" rx="196" ry="${plateRY-13}" fill="none" stroke="#e9e9cf" stroke-width="3"/>${food}${decs}`,`A ${don>1.45?'darkly baked':don<.5?'pale':'golden'} ${kind} on a ceramic cake stand`);
}

/** Snap SVG viewBox coordinates onto the visible edible surface, then normalize for foodSVG. */
export function snapDecoration({kind='cake',recipeId='',layers=2,design='stack',defects={},shapeValues=[]}={},sx=350,sy=250){
 const lean=clamp(defects.lean,-18,18)*Math.PI/180,slump=clamp(defects.slumped/100),c=Math.cos(lean),s=Math.sin(lean);
 const world={x:Number.isFinite(sx)?sx:350,y:Number.isFinite(sy)?sy:250};
 let px=350+(world.x-350)*c+(world.y-355)*s,py=355-(world.x-350)*s+(world.y-355)*c;
 if(defects.slumped>15){px=350+(px-350)/(1+slump*.13);py=362+(py-362)/(1-slump*.14);}
 const preparation=methodProfile(kind,defects);px=350+(px-350)/preparation.x;py=362+(py-362)/preparation.y;
 const point={x:px,y:py};
 const ellipse=(cx,cy,rx,ry,rotation=0)=>{
  const angle=rotation*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),dx=point.x-cx,dy=point.y-cy;
  let x=dx*c+dy*s,y=-dx*s+dy*c;
  if(x*x/(rx*rx)+y*y/(ry*ry)>1){
   // A short search finds the closest edge of even very shallow, rotated surfaces.
   let best=0,bestDistance=Infinity;
   const distance=t=>(rx*Math.cos(t)-x)**2+(ry*Math.sin(t)-y)**2;
   for(let i=0;i<48;i++){const a=i*Math.PI/24,d=distance(a);if(d<bestDistance){bestDistance=d;best=a;}}
   let lo=best-Math.PI/24,hi=best+Math.PI/24;
   for(let i=0;i<18;i++){const a=lo+(hi-lo)/3,b=hi-(hi-lo)/3;if(distance(a)<distance(b))hi=b;else lo=a;}
   const t=(lo+hi)/2;x=rx*Math.cos(t);y=ry*Math.sin(t);
  }
  return {x:cx+x*c-y*s,y:cy+x*s+y*c};
 };
 const polygon=vertices=>{
  let inside=false,closest=null,dist=Infinity;
  for(let i=0,j=vertices.length-1;i<vertices.length;j=i++){
   const [ax,ay]=vertices[j],[bx,by]=vertices[i];
   if((ay>point.y)!==(by>point.y)&&point.x<(bx-ax)*(point.y-ay)/(by-ay)+ax)inside=!inside;
   const dx=bx-ax,dy=by-ay,t=clamp(((point.x-ax)*dx+(point.y-ay)*dy)/(dx*dx+dy*dy));
   const candidate={x:ax+dx*t,y:ay+dy*t},d=(candidate.x-point.x)**2+(candidate.y-point.y)**2;
   if(d<dist){closest=candidate;dist=d;}
  }
  return inside?point:closest;
 };
 const batch=(centres,rx,ry)=>centres.map(([x,y,rotation=0],i)=>{const scale=shapeValues.length?clamp(.74+(Number(shapeValues[i%shapeValues.length])||50)/190,.65,1.25):1;return ellipse(x,y,rx*scale,ry*scale,rotation);});
 let candidates=[];
 const towerPoints=()=>Array.from({length:5},(_,row)=>Array.from({length:5-row},(_,col)=>ellipse(350+(col-(4-row)/2)*58,311-row*42,23,14))).flat();
 const tierPoints=()=>[ellipse(350,166,48,11),ellipse(350,243,82,10),ellipse(350,311,124,10),ellipse(264,226,10,12),ellipse(436,226,10,12)];
 if(design==='wreath'&&recipeId!=='harvest-wreath')candidates=Array.from({length:12},(_,i)=>ellipse(350+145*Math.cos(i*Math.PI/6),274+67*Math.sin(i*Math.PI/6),22,13));
 else if(design==='tower'&&!/tower|croquembouche|celebration|carousel/.test(recipeId))candidates=kind==='cake'?tierPoints():towerPoints();
 else if(recipeId==='swiss-roll')candidates=[polygon([[236,233],[397,246],[436,265],[410,274],[236,258]]),ellipse(430,293,43,41)];
 else if(recipeId==='marble-loaf'||recipeId==='homecoming-tea-cake')candidates=[polygon([[241,238],[278,219],[381,197],[453,232],[464,256],[322,288]])];
 else if(recipeId==='chocolate-chip-cookies'||recipeId==='jam-sandwich-biscuits')candidates=batch([[249,247],[354,225],[456,251],[240,319],[353,309],[465,324]],36,20);
 else if(recipeId==='garden-focaccia')candidates=[polygon([[218,222],[445,240],[491,278],[444,320],[224,291],[208,265]])];
 else if(recipeId==='cinnamon-knots')candidates=batch([[236,242],[348,223],[459,245],[238,321],[350,307],[460,322]],35,20);
 else if(recipeId==='woven-bread-basket')candidates=batch([[280,232],[350,210],[420,236]],23,17);
 else if(recipeId==='summer-fruit-pie')candidates=[ellipse(350,267,132,43)];
 else if(recipeId==='chocolate-eclairs')candidates=batch([[236,240,-16],[350,224,-16],[464,240,-16],[236,321,-16],[350,304,-16],[464,321,-16]],43,9);
 else if(recipeId==='choux-croquembouche'||recipeId==='profiterole-tower')candidates=towerPoints();
 else if(recipeId==='baked-cheesecake')candidates=[ellipse(350,251,124,34)];
 else if(recipeId==='summer-pavlova')candidates=[ellipse(350,263,118,35)];
 else if(recipeId==='jewel-fruit-tart')candidates=[ellipse(350,280,130,36)];
 else if(recipeId==='butter-brioche')candidates=[ellipse(350,277,137,49)];
 else if(recipeId==='biscuit-carousel')candidates=[polygon([[224,207],[350,128],[478,207],[350,235]])];
 else if(recipeId==='cupcake-batch')candidates=batch([[250,252],[350,232],[450,252],[250,328],[350,308],[450,328]],26,12);
 else if(recipeId==='celebration-cupcake-tower')candidates=batch([[260,267],[350,267],[440,267],[310,185],[390,185]],22,13);
 else if(recipeId==='celebration-banquet')candidates=[ellipse(350,168,30,10),ellipse(350,240,65,10),ellipse(350,306,103,10),ellipse(195,345,20,10),ellipse(501,345,20,10)];
 else if(recipeId==='lemon-madeleines')candidates=batch([[260,317,-32],[376,314,-12],[465,264,14],[241,232,-28],[350,222,4],[443,195,24]],34,25);
 else if(recipeId==='biscuit-greenhouse')candidates=[polygon([[310,166],[419,151],[469,199],[359,239]]),polygon([[215,252],[329,279],[329,335],[215,309]]),polygon([[371,280],[481,239],[481,295],[371,337]])];
 else if(recipeId==='harvest-wreath'){
  const dx=(point.x-350)/150,dy=(point.y-282)/72,r=Math.hypot(dx,dy),angle=r?Math.atan2(dy,dx):-Math.PI/2;
  const ring=clamp(r,.84,1.02);
  candidates=[{x:350+150*Math.cos(angle)*ring,y:282+72*Math.sin(angle)*ring}];
 }
 else if(recipeId==='six-knot-rolls')candidates=batch([[239,235],[350,211],[460,233],[236,314],[350,299],[463,315]],35,21);
 else if(recipeId==='village-celebration'||recipeId==='orchard-celebration'||recipeId==='tiered-plain')candidates=[ellipse(350,166,48,11),ellipse(350,243,82,10),ellipse(350,311,124,10),ellipse(264,226,10,12),ellipse(436,226,10,12),ellipse(220,291,9,11),ellipse(480,291,9,11)];
 else if(recipeId==='vanilla-custard-tarts')candidates=batch([[248,241],[350,219],[453,241],[240,316],[350,298],[460,316]],31,11);
 else if(recipeId==='choux-buns')candidates=batch([[258,233],[350,211],[442,233],[251,311],[352,288],[455,310]],29,16);
 else if(recipeId==='viennese-curls')candidates=batch([[253,253],[365,231],[464,264],[248,328],[364,316],[464,332]],26,17);
 else if(recipeId==='almond-tea-fingers')candidates=batch(Array.from({length:6},(_,i)=>[236+(i%3)*91,253+Math.floor(i/3)*68,-17]),11,31);
 else if(recipeId==='pastry-sunburst')candidates=[ellipse(350,277,47,25),...Array.from({length:16},(_,i)=>{const a=i*Math.PI/8;return ellipse(350+115*Math.cos(a),280+61*Math.sin(a),23,10,i*22.5);})];
 else if(kind==='biscuit')candidates=batch([[250,321,-20],[370,326,-9],[452,289,2],[320,271,13],[249,267,24],[386,244,35]],45,22);
 else if(kind==='bread')candidates=[ellipse(350,271,136,57)];
 else if(kind==='pastry')candidates=[ellipse(348,281,126,39)];
 else if(kind==='dessert')candidates=[ellipse(350,242,104,28)];
 else candidates=[ellipse(350,(layers>2?169:207)+17,122,29)];
 const best=candidates.reduce((a,b)=>(a.x-point.x)**2+(a.y-point.y)**2<=(b.x-point.x)**2+(b.y-point.y)**2?a:b);
 let bx=350+(best.x-350)*preparation.x,by=362+(best.y-362)*preparation.y;if(defects.slumped>15){bx=350+(bx-350)*(1+slump*.13);by=362+(by-362)*(1-slump*.14);}
 const transformed={x:350+(bx-350)*c-(by-355)*s,y:355+(bx-350)*s+(by-355)*c};
 return {x:clamp((transformed.x-100)/500),y:clamp((transformed.y-150)/200)};
}

export function ovenSVG({heat=180,progress=0,kind='cake',shelf='middle',steam=false,blind=false}={}){
 const p=uid(),done=clamp(progress/100,0,1.8),rise=Math.min(done,1),hot=heat>150,dy=shelf==='top'?-52:shelf==='bottom'?28:0;
 return svg(`<defs>${grad(p+'-body','#f1e6ca','#bfb696')}${grad(p+'-steel','#e8e8dc','#8f9b90')}${grad(p+'-glass','#514a3e','#262b25')}${grad(p+'-food',done<.3?'#e7d4a5':done>1.5?'#54392b':done>1.2?'#98603b':done<.7?'#d9b788':'#e6af67',done<.3?'#b6a07a':done>1.5?'#31251d':done>1.2?'#66432b':done<.7?'#b58d5e':'#ad6b38')}<radialGradient id="${p}-glow"><stop stop-color="#eaba6e" stop-opacity=".7"/><stop offset="1" stop-color="#d59143" stop-opacity="0"/></radialGradient></defs>
 ${ellipseShadow(350,451,245,23)}
 <rect x="124" y="70" width="452" height="358" rx="23" fill="url(#${p}-body)" stroke="#a99e80" stroke-width="3"/><path d="M143 84H556" stroke="#fff8e3" stroke-width="5" stroke-linecap="round"/>
 <path d="M138 424h422v18H138Z" fill="#8b8b72"/><rect x="153" y="440" width="31" height="17" rx="4" fill="#626958"/><rect x="515" y="440" width="31" height="17" rx="4" fill="#626958"/>
 <path d="M127 151H573" stroke="#b5ab8e" stroke-width="3"/>
 ${[183,241,459,517].map((x,i)=>`<circle cx="${x}" cy="112" r="20" fill="#b0b49d" stroke="#929a85" stroke-width="2"/><circle cx="${x}" cy="109" r="17" fill="url(#${p}-steel)"/><path d="M${x} 99v-7" stroke="#556251" stroke-width="3" stroke-linecap="round" transform="rotate(${i===2?(heat-140)*2:20} ${x} 109)"/>`).join('')}
 <rect x="298" y="87" width="104" height="47" rx="5" fill="#4e5a46" stroke="#9eaa8c" stroke-width="3"/><text x="350" y="118" text-anchor="middle" font-family="monospace" font-size="24" fill="#e8ebbd">${Math.round(heat)}°</text>
 <rect x="153" y="174" width="394" height="223" rx="14" fill="#737c66" stroke="#9fa78c" stroke-width="4"/><rect x="171" y="191" width="358" height="188" rx="8" fill="url(#${p}-glass)"/>
 <rect x="176" y="197" width="348" height="176" rx="6" fill="url(#${p}-glow)" opacity="${hot?1:.3}"/>
 <g transform="translate(0 ${dy})"><path d="M185 329H518M185 341H518" stroke="#a6a58b" stroke-width="4" opacity=".55"/>
 ${[0,1,2,3,4,5,6,7].map(i=>`<path d="M${204+i*42} 339l-7-14" stroke="#a6a58b" stroke-width="2" opacity=".4"/>`).join('')}
 ${kind==='bread'?`<path d="M253 321Q248 ${269-rise*25} 297 ${261-rise*22}Q385 ${240-rise*12} 435 292Q454 321 433 327Z" fill="url(#${p}-food)" stroke="#785330" stroke-width="2"/><path d="M290 288l20-20m22 13 19-20m19 20 19-12" stroke="#f1cb8e" stroke-width="7" stroke-linecap="round"/>`:kind==='biscuit'?`<path d="M239 323H465L446 336H251Z" fill="#727968"/>${[273,322,371,420].map(x=>`<ellipse cx="${x}" cy="315" rx="27" ry="12" fill="url(#${p}-food)" stroke="#8e643a" stroke-width="2"/>`).join('')}`:`<path d="M259 290H445L432 329H272Z" fill="#899282" stroke="#b0b7a1" stroke-width="2"/><ellipse cx="352" cy="289" rx="94" ry="28" fill="#5f6b58"/><path d="M263 286Q277 ${256-rise*38} 352 ${258-rise*28}Q422 ${250-rise*28} 439 286Q353 315 263 286Z" fill="url(#${p}-food)" stroke="#9c733e" stroke-width="2"/><path d="M287 ${279-rise*28}Q340 ${252-rise*24} 398 ${276-rise*24}" stroke="#f4cf93" stroke-width="4" fill="none" opacity=".6"/>`}
 ${blind?`<g fill="#c9b48c" stroke="#9f8a62" stroke-width=".8">${Array.from({length:22},(_,i)=>`<circle cx="${282+(i*37)%140}" cy="${277+(i*11)%14}" r="4"/>`).join('')}</g>`:''}</g>
 ${steam?`<g stroke="#fbf6e4" stroke-width="7" fill="none" stroke-linecap="round" opacity=".45"><path d="M240 300q-18-22 0-44t0-40M330 290q-18-22 0-44t0-40M420 300q-18-22 0-44t0-40M490 295q-14-18 0-36"/></g>`:''}
 <path d="M187 203L300 203 220 368H187Z" fill="#fff" opacity=".065"/><path d="M392 203H444L363 368H317Z" fill="#fff" opacity=".035"/>
 <rect x="204" y="165" width="294" height="15" rx="7" fill="#7a8370"/><rect x="201" y="159" width="300" height="13" rx="6" fill="url(#${p}-steel)" stroke="#949c89"/>
 <path d="M210 162H490" stroke="#f9f5dc" stroke-width="2"/>
 <circle cx="429" cy="113" r="4" fill="${hot?'#bc6147':'#819073'}"/>
 ${hot?`<g stroke="#e0b270" opacity=".35" stroke-width="2" fill="none"><path d="M273 244q-10-14 0-24t0-18M348 230q-10-14 0-24M426 245q-10-14 0-24t0-18"/></g>`:''}
 <g transform="translate(80 328) rotate(-17)"><path d="M0 50V-22q0-22 18-22t18 22v19q4-18 16-13t8 28L43 53Z" fill="#ac614c" stroke="#854937" stroke-width="2"/><path d="M4 36l36-35M3 17l33-32M14 49l33-32" stroke="#d09273" stroke-width="2" opacity=".55"/><path d="M0 48H43V64H0Z" fill="#c38468"/></g>`, `A cream oven set to ${Math.round(heat)} degrees, with ${kind} baking on the ${shelf} shelf${steam?' in a cloud of steam':''}`);
}

export function avatarSVG(index=0){
 const p=uid(),i=Math.abs(Math.floor(index))%10,skin=['#e4b791','#a46b4c','#d29776','#7b503d','#e5bc99','#bf8863','#e3b495','#a87354','#e8c2a4','#c58c69'][i],hair=['#655344','#403b32','#b0a38c','#333730','#a5603f','#e3d4b8','#6f655a','#3c3530','#cfb08b','#716354'][i],bg=['#bdc9b3','#dfc09a','#b0c2c0','#d9b5a1','#c6c7a9'][i%5],female=[0,2,4,7,8].includes(i);
 return svg(`<defs>${grad(p+'-shirt',i<2?'#f5edd8':'#e9dbc0',i<2?'#cfcdb5':'#b5b49d')}</defs><circle cx="50" cy="50" r="49" fill="${bg}"/>
 ${female?`<path d="M27 60V36Q24 10 50 10Q77 10 75 38V66Z" fill="${hair}"/>`:''}
 <path d="M12 100V88Q13 72 37 70H64Q87 74 89 92V100Z" fill="url(#${p}-shirt)"/>
 <path d="M41 62v14q9 9 18 0V62" fill="${skin}"/><path d="M42 65q9 8 16 0" fill="#714d3c" opacity=".16"/>
 <ellipse cx="30" cy="44" rx="5" ry="8" fill="${skin}"/><ellipse cx="70" cy="44" rx="5" ry="8" fill="${skin}"/>
 <path d="M30 34Q30 17 50 17Q70 17 70 34v15q-2 21-20 23Q32 69 30 49Z" fill="${skin}"/>
 <path d="M30 39Q24 11 49 11Q76 11 71 40L65 30Q45 36 39 25L32 41Z" fill="${hair}"/>
 ${i===5||i===9?`<path d="M31 48q3 19 19 22q17-3 20-23q-7 8-11 8l-9-5-9 5Z" fill="${hair}" opacity=".85"/>`:''}
 <path d="M36 41q5-3 10-1M55 40q5-2 9 1" stroke="${hair}" stroke-width="2" stroke-linecap="round" fill="none"/>
 <circle cx="41" cy="45" r="1.8" fill="#3b352b"/><circle cx="59" cy="45" r="1.8" fill="#3b352b"/>
 <path d="M50 45l-2 8h4M44 59q6 4 12-1" fill="none" stroke="#915c46" stroke-width="1.5" stroke-linecap="round"/>
 ${i===0||i===3||i===6?`<g fill="none" stroke="#625f4b" stroke-width="1.7"><rect x="33" y="40" width="14" height="11" rx="4"/><rect x="53" y="40" width="14" height="11" rx="4"/><path d="M47 44h6M29 43h4M67 43h4"/></g>`:''}
 <path d="M38 72l12 10 12-10M37 72l-4 9 12 7 5-6 5 6 13-7-5-9" fill="#f9f1dd" stroke="#c4c4ac" stroke-width="1"/>
 <path d="M32 85v15h36V85l-9 8H41Z" fill="${i<2?'#c7c5ac':['#82977b','#b47658','#7f9d9a','#a1a279'][i%4]}"/><path d="M43 100V92h14v8" stroke="#f4e8d0" opacity=".35" fill="none"/>`, `Portrait of an original ${index<2?'judge':'baker'}`,100,100);
}

export function iconSVG(name){
 const paths={
 whisk:'<path d="M14 11l5-7q1-2 3 0l-6 8M14 11c-9-2-15 7-9 10s12-3 11-9M14 11C5 12 3 17 5 20c3 1 6-3 9-9"/>',
 oven:'<rect x="3" y="3" width="18" height="19" rx="2"/><path d="M3 9h18M7 6h1m8 0h1M7 12h10v7H7Z"/>',
 book:'<path d="M12 5C8 2 5 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-4-1-7-2-10 1ZM12 5v16M5 8l4 1m-4 3 4 1m6-4 4-1m-4 5 4-1"/>',
 trophy:'<path d="M7 3h10v7c0 7-10 7-10 0ZM7 5H3v3c0 4 3 5 5 5M17 5h4v3c0 4-3 5-5 5M12 15v5m-5 1h10"/>',
 pause:'<path d="M8 5v14M16 5v14" stroke-width="3.5"/>',
 sound:'<path d="M4 9h4l5-5v16l-5-5H4ZM17 8q4 4 0 8M19 4q8 8 0 16"/>',
 leaf:'<path d="M4 20C1 10 9 2 21 3c0 12-7 20-17 17ZM4 20L17 7m-7 7v-4m0 4h4"/>',
 star:'<path d="M12 2l3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1Z"/>',
 arrow:'<path d="M4 12h15M13 5l7 7-7 7"/>',
 check:'<path d="M4 12l5 5L20 6"/>',
 close:'<path d="M6 6l12 12M18 6 6 18"/>',
 home:'<path d="M2 11 12 2l10 9M5 9v13h14V9M9 22v-9h6v9"/>'
 };
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.leaf}</svg>`;
}

const pastryBoard=(p)=>`<defs>${grad(p+'-board','#d9b78a','#b48b5e')}${grad(p+'-dough','#f0dfb4','#cfb17c')}${grad(p+'-pin','#c18d54','#926039')}${grad(p+'-metal','#e0e4d7','#8d9d8c')}</defs>${ellipseShadow(350,429,267,20)}<path d="M97 197Q96 186 111 185H587Q605 185 604 204V412Q604 424 589 424H110Q97 424 97 411Z" fill="url(#${p}-board)" stroke="#a6845d" stroke-width="2"/><path d="M112 204H588M114 409H587M141 199V414M554 199V414" stroke="#ebcda3" stroke-width="2" opacity=".48"/><g stroke="#a68054" stroke-width="1" opacity=".18"><path d="M190 211q-15 82 0 186M241 211q16 75 0 186M475 211q-16 88 0 186"/><path d="M156 295q91-11 179 1t221 2M153 367q161 13 397 0"/></g><g fill="#fff5d9" opacity=".5"><ellipse cx="215" cy="346" rx="43" ry="14"/><ellipse cx="437" cy="259" rx="34" ry="9"/><circle cx="498" cy="365" r="4"/><circle cx="204" cy="244" r="3"/></g>`;
function rollingPin(p,x=350,y=167,angle=-8){return `<g transform="translate(${x} ${y}) rotate(${angle})"><rect x="-152" y="-10" width="51" height="22" rx="9" fill="#9c7046" stroke="#805839"/><rect x="99" y="-10" width="51" height="22" rx="9" fill="#9c7046" stroke="#805839"/><rect x="-112" y="-25" width="223" height="52" rx="17" fill="url(#${p}-pin)" stroke="#94653c" stroke-width="2"/><path d="M-94-14H93" stroke="#e0b279" stroke-width="5" stroke-linecap="round"/><path d="M-104 17H103" stroke="#9c6b41" stroke-width="3"/><path d="M-141-4h23M120-4h19" stroke="#c89963" stroke-width="3" stroke-linecap="round"/></g>`;}

export function techniqueSVG({type='beat',progress=0,phase=0,quality=100,flavour='vanilla',readiness=0}={}){
 const progress01=clamp(progress),p=uid(),motion=Math.sin(clamp(phase,0,100)/100*Math.PI*2),colour=(ART_FLAVOURS[flavour]||ART_FLAVOURS.vanilla).cream;
 if(type==='prove'){
  // The dough domes up under a tea towel; past its peak it sags and wrinkles.
  const r=clamp(readiness,0,1.6),peak=Math.min(r,1.15),sag=Math.max(0,r-1.22)*2.2,top=255-peak*95+sag*45;
  const dough=`<path d="M190 262Q${200} ${top+20} 347 ${top}Q${494} ${top+20} 504 262Z" fill="url(#${p}-dough)" stroke="#c3a370" stroke-width="2"/>${sag>0?`<g fill="none" stroke="#b49565" stroke-width="2" opacity="${clamp(sag)}"><path d="M260 ${top+26}q14-7 28 0t28 0M372 ${top+22}q14-7 28 0"/></g>`:''}<g fill="#f6e7c4" opacity=".7">${Array.from({length:Math.round(4+peak*10)},(_,i)=>`<circle cx="${245+(i*37)%205}" cy="${top+18+(i*13)%30}" r="${1.5+i%3}"/>`).join('')}</g>`;
  const towel=`<g transform="translate(470 ${top-6}) rotate(14)"><path d="M0 0H120L110 92H6Z" fill="#f4eedb" stroke="#cfc6a6" stroke-width="2"/><path d="M4 18H118M3 30H117M8 62H112M9 74H111" stroke="#b7735c" stroke-width="4"/></g>`;
  return bowlSVG({amount:55,flavour}).replace('<g transform="rotate(',`<defs>${grad(p+'-dough','#f2e1b6','#d8bb86')}</defs>${dough}${towel}<g opacity="0" transform="rotate(`).replace('A sage ceramic mixing bowl with batter, a wooden whisk, flour and eggs',r<.9?'Dough proving in a warm bowl, still well below the rim':r>1.22?'Over-proved dough collapsing in its bowl':'Dough risen to a proud dome under a tea towel');
 }
 if(type==='chill'){
  const r=clamp(readiness,0,2),cold=clamp(r/1.1);
  return svg(`<defs>${grad(p+'-fridge','#e8eee2','#bccab7')}${grad(p+'-dough','#f0dfb4','#cfb17c')}</defs>${ellipseShadow(350,434,240,22)}<rect x="130" y="110" width="440" height="320" rx="22" fill="url(#${p}-fridge)" stroke="#94a58e" stroke-width="3"/><rect x="152" y="132" width="396" height="276" rx="12" fill="#f6f8ee" stroke="#c7d2c0" stroke-width="2"/><path d="M160 300H540" stroke="#c7d2c0" stroke-width="5"/><rect x="228" y="226" width="244" height="72" rx="10" fill="url(#${p}-dough)" stroke="#c4aa7a" stroke-width="2"/><path d="M236 238H462M236 252H462M236 266H462M236 280H462" stroke="#f3e3b6" stroke-width="2" opacity="${.4+cold*.4}"/><rect x="220" y="218" width="260" height="88" rx="14" fill="#e9f1f0" opacity="${.25+cold*.35}" stroke="#ffffff" stroke-width="2"/><g stroke="#9fb7b4" stroke-width="2.5" stroke-linecap="round" opacity="${cold}"><path d="M196 170v24M184 182h24M188 174l16 16M204 174l-16 16"/><path d="M500 176v20M490 186h20"/><path d="M330 168v16M322 176h16"/></g><rect x="500" y="320" width="22" height="70" rx="8" fill="#a8b8a2"/>`, cold<.85?'Pastry chilling in the fridge, still soft at the edges':'Pastry chilled firm in the fridge, butter layers set');
 }
 if(type==='beat')return bowlSVG({progress:progress01*100,amount:65+progress01*25,mixing:phase>0,flavour});
 if(type==='whip'){
  let base=bowlSVG({progress:100,amount:70,mixing:phase>0,flavour:'vanilla'});
  const foam=`<g>${Array.from({length:13},(_,i)=>{const x=237+(i*31)%218,y=239+(i*13)%41;return `<ellipse cx="${x}" cy="${y}" rx="${14+progress01*8}" ry="${8+progress01*6}" fill="${colour}" stroke="#e4d4b1" stroke-width="1"/>`}).join('')}${progress01>.4?Array.from({length:4},(_,i)=>cream(267+i*51,253,.4+progress01*.45)).join(''):''}</g>`;
  return base.replace('<g transform="rotate(',foam+'<g transform="rotate(').replace('A sage ceramic mixing bowl with batter, a wooden whisk, flour and eggs','Cream being whipped into soft peaks in a sage ceramic bowl');
 }
 let body=pastryBoard(p),title='Pastry being prepared on a wooden workboard';
 if(type==='rub'){
  body+=`<ellipse cx="347" cy="312" rx="168" ry="71" fill="#f4e7c5"/>${Array.from({length:48},(_,i)=>{const a=i*2.4,r=12+(i*29)%132,x=350+Math.cos(a)*r,y=310+Math.sin(a)*r*.4;return `<path d="M${x} ${y}l${5+progress01*7}-3 7 5-3 5-10-1Z" fill="${i%3?'#e9d6ac':'#d6bd8b'}"/>`}).join('')}${Array.from({length:Math.max(1,Math.ceil((1-progress01)*8))},(_,i)=>`<g transform="translate(${262+(i*43)%170} ${275+(i*17)%48}) rotate(${i*17})"><path d="M-10-9H12V8H-10Z" fill="#ebcb75" stroke="#c6a658"/><path d="M-10-9l5-5H17L12-9" fill="#f6df99"/></g>`).join('')}<g transform="translate(${470+motion*10} 227) rotate(-23)"><path d="M-15-30H15L32 75Q0 94-32 75Z" fill="url(#${p}-metal)" stroke="#879783" stroke-width="2"/><path d="M-20 25H21M-22 36H24M-24 48H27M-25 60H29" stroke="#edf1e2" stroke-width="3"/><rect x="-15" y="-75" width="30" height="55" rx="9" fill="url(#${p}-pin)"/></g>`;
  title='Butter being rubbed into flour, changing from cubes to fine breadcrumbs';
 }else if(type==='knead'){
  const stretch=progress01*30+motion*12;
  body+=`<path d="M211 321Q194 ${249-stretch/2} 288 237Q385 219 464 273Q511 311 460 350Q360 396 258 367Q226 356 211 321Z" fill="url(#${p}-dough)" stroke="#bd9e6c" stroke-width="2"/><path d="M270 248Q318 267 370 267Q434 266 447 313Q427 347 363 333Q${302-stretch} 311 271 319" fill="${progress01>.5?'#e5cfa0':'#ead7ad'}" stroke="#c4a673" stroke-width="3"/><path d="M258 275Q321 252 400 287" stroke="#fff0ca" stroke-width="6" fill="none" stroke-linecap="round"/>${progress01<.5?`<g stroke="#c5a977" stroke-width="2" fill="none"><path d="M227 313l14 7-5 11M435 344l-12-5-11 6M275 352l17-8"/></g>`:''}<g transform="translate(541 281) rotate(10)"><path d="M-25-10H25V44Q0 56-25 44Z" fill="url(#${p}-metal)" stroke="#8a9784"/><rect x="-28" y="-25" width="56" height="20" rx="6" fill="#a77749"/><path d="M-17-18h33" stroke="#d3ac7b" stroke-width="3" stroke-linecap="round"/></g>`;
  title='Bread dough being stretched and folded on a floured board';
 }else if(type==='fold'||type==='laminate'){
  const lifted=clamp(phase/100)*45;
  body+=`<path d="M203 249L440 215 502 324 265 366Z" fill="#c5a372" stroke="#ac8b5b" stroke-width="2"/><path d="M203 243L440 209 502 317 265 359Z" fill="url(#${p}-dough)" stroke="#c4aa7a" stroke-width="2"/><path d="M217 254L435 223 484 312 267 345" fill="none" stroke="#f7e9c4" stroke-width="4"/>${type==='laminate'?`<path d="M213 276l68 74 186-30-64-90Z" fill="#eed399" opacity=".85"/><path d="M268 359L502 317M265 354L499 312M261 350L496 309" stroke="#f6e1ae" stroke-width="3"/>`:''}<path d="M205 243Q${220+lifted} ${189-lifted} 285 ${210-lifted/3}L366 307L265 358Z" fill="#efe0b9" stroke="#c5aa78" stroke-width="2"/><path d="M266 357L366 307L448 ${292-progress01*45}L443 213Q481 236 502 317Z" fill="#dfc694" stroke="#c1a16c" stroke-width="2" opacity="${.25+progress01*.75}"/>${rollingPin(p,390,151,-12+motion*5)}`;
  title=type==='laminate'?'Butter pastry being rolled and folded into thin layers':'Pastry being folded into a neat envelope';
 }else if(type==='cook'){
  body=`<defs>${grad(p+'-copper','#ddad76','#9c6040')}${grad(p+'-pan','#555a4c','#343b31')}${grad(p+'-custard',colour,'#ceae73')}${grad(p+'-pin','#ba8654','#865933')}</defs>${ellipseShadow(350,433,249,24)}<rect x="168" y="333" width="367" height="93" rx="19" fill="#d3d8bf" stroke="#a4b096" stroke-width="3"/><ellipse cx="348" cy="333" rx="153" ry="44" fill="#485443"/><ellipse cx="348" cy="328" rx="133" ry="36" fill="#aa7250"/><rect x="452" y="383" width="37" height="20" rx="8" fill="#718269"/><circle cx="496" cy="393" r="4" fill="#b5674b"/><path d="M208 226L219 326Q350 378 485 326L497 226Z" fill="url(#${p}-copper)" stroke="#89583a" stroke-width="2"/><path d="M234 263l8 52" stroke="#edc294" stroke-width="9" stroke-linecap="round" opacity=".55"/><path d="M481 249L637 220q19 1 19 14q-1 11-13 15L485 276Z" fill="url(#${p}-pan)" stroke="#303a2f" stroke-width="2"/><ellipse cx="352" cy="226" rx="145" ry="59" fill="#626857" stroke="#b9b6a0" stroke-width="6"/><ellipse cx="352" cy="228" rx="132" ry="49" fill="url(#${p}-custard)"/><path d="M244 228q79-39 166-4t-101 26q-36-19 44-20" fill="none" stroke="#f9e5b1" stroke-width="5" opacity=".75"/>${Array.from({length:Math.ceil(progress01*9)},(_,i)=>`<ellipse cx="${260+i*23}" cy="${217+(i*17)%32}" rx="${3+i%3}" ry="${2+i%2}" fill="#f7e4b6" stroke="#d4b777"/>`).join('')}<g transform="rotate(${motion*12-18} 366 227)"><path d="M357 224L409 72q9-13 18-3q5 5 2 15l-43 150Z" fill="url(#${p}-pin)" stroke="#835735" stroke-width="2"/><ellipse cx="367" cy="239" rx="25" ry="36" transform="rotate(19 367 239)" fill="#b78a53" stroke="#926b3c" stroke-width="2"/><ellipse cx="366" cy="242" rx="16" ry="23" fill="${colour}"/><path d="M370 205l44-123" stroke="#dbb27b" stroke-width="4" stroke-linecap="round"/></g><g stroke="#faf0d6" stroke-width="4" fill="none" opacity="${.25+progress01*.35}" stroke-linecap="round"><path d="M264 157q-16-18 0-33t0-28M323 144q-16-18 0-33M476 155q-16-18 0-33t0-22"/></g>`;
  title='Custard being stirred in a copper pan over gentle heat';
 }
 return svg(body,title);
}

export function shapingSVG({mode='portion',values=[],index=0,target=50,kind='cake'}={}){
 const p=uid(),read=(i)=>clamp(Number(values[i]??target),0,100),ratio=(i)=>clamp(read(i)/Math.max(10,target),.35,1.7),count=Math.max(3,Math.min(9,values.length||6));
 let body=pastryBoard(p),title='Shaping unbaked dough';
 const select=(x,y,rx,ry,i)=>i===index?`<ellipse cx="${x}" cy="${y}" rx="${rx+10}" ry="${ry+8}" fill="none" stroke="#7a9070" stroke-width="2" stroke-dasharray="5 5"/><circle cx="${x+rx+10}" cy="${y-ry}" r="12" fill="#6e8464"/><text x="${x+rx+10}" y="${y-ry+4}" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#fff8e7">${i+1}</text>`:'';
 if(mode==='portion'||mode==='pipe'){
  body+=Array.from({length:count},(_,i)=>{const x=220+(i%3)*130,y=255+Math.floor(i/3)*66,r=ratio(i),rx=36*Math.sqrt(r),ry=mode==='pipe'?20*r:23*Math.sqrt(r);return `<g>${select(x,y,rx,ry,i)}<ellipse cx="${x}" cy="${y+8}" rx="${rx+1}" ry="${ry}" fill="#b69564" opacity=".2"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#${p}-dough)" stroke="#bda171" stroke-width="1.5"/>${mode==='pipe'?`<path d="M${x-rx*.7} ${y+2}q-${rx*.1}-${ry} ${rx*.7}-${ry*.7}t${rx*.5} ${ry*.8}q-${rx*.6} ${ry*.7}-${rx*.8}-${ry*.1}" fill="none" stroke="#f6e4bc" stroke-width="5" stroke-linecap="round"/>`:`<path d="M${x-rx*.65} ${y-ry*.25}q${rx*.5}-${ry*.7} ${rx} 0" fill="none" stroke="#f9e9c5" stroke-width="4" stroke-linecap="round"/>`}</g>`;}).join('');
  if(mode==='pipe')body+=`<g transform="translate(523 153) rotate(17)"><path d="M-30-42H31L9 53H-9Z" fill="#ede5d1" stroke="#bdb79e" stroke-width="2"/><path d="M-30-42Q-9-57 31-42M-25-35L4 40" stroke="#fffaeb" stroke-width="5" fill="none"/><path d="M-9 51H9L3 72H-3Z" fill="url(#${p}-metal)" stroke="#7b8c7a"/></g>`;
  else body+=`<g transform="translate(546 190) rotate(12)"><rect x="-21" y="-8" width="42" height="54" rx="3" fill="url(#${p}-metal)" stroke="#8d9c87"/><rect x="-25" y="-22" width="50" height="18" rx="6" fill="#b18458"/></g>`;
  title=mode==='pipe'?'Piping evenly sized pastry rounds':'Dividing dough into evenly sized portions';
 }else if(mode==='roll'){
  const r=ratio(index),rx=clamp(158*r,78,216),ry=clamp(74*r,45,101);
  body+=`<ellipse cx="350" cy="307" rx="${rx}" ry="${ry}" fill="url(#${p}-dough)" stroke="#c0a573" stroke-width="2"/><ellipse cx="350" cy="307" rx="${rx-12}" ry="${ry-8}" fill="none" stroke="#f8e8c2" stroke-width="3"/>${rollingPin(p,350,220+read(index)*.7,-7)}<g stroke="#8c9e7c" stroke-width="2" fill="none" opacity=".65"><path d="M175 325v25M525 325v25M175 340H525"/><path d="M185 336v8m15-8v8m15-8v8m15-8v8m15-8v8m15-8v8m15-8v8"/></g>`;
  title='Rolling a sheet of pastry to an even thickness';
 }else if(mode==='plait'){
  body+=Array.from({length:3},(_,i)=>{const piece=Math.floor(index/3)*3+i,r=ratio(piece),x=250+i*99;return `<g>${select(x,294,20*r,73,piece)}<path d="M${x-15} 225Q${x+21} 258 ${x-7} 290T${x+12} 367" stroke="#b79865" stroke-width="${28*r}" stroke-linecap="round" fill="none"/><path d="M${x-17} 220Q${x+19} 253 ${x-9} 285T${x+10} 362" stroke="#e8d3a4" stroke-width="${26*r}" stroke-linecap="round" fill="none"/><path d="M${x-21} 225Q${x+9} 257 ${x-15} 286" stroke="#fff0c6" stroke-width="4" stroke-linecap="round" fill="none"/></g>`;}).join('');
  title='Rolling three dough strands for a plaited loaf';
 }else if(mode==='line'){
  const r=ratio(index);
  body+=`<path d="M185 282l20 81q145 61 292 0l18-81" fill="url(#${p}-metal)" stroke="#82937f" stroke-width="2"/><ellipse cx="350" cy="282" rx="165" ry="73" fill="#99a38b" stroke="#b8c2aa" stroke-width="5"/><ellipse cx="350" cy="282" rx="149" ry="62" fill="#5d735b"/><path d="M${350-140*r} 276q-3-53 ${140*r} -56q${140*r} 0 ${140*r} 55l-13 65q-${127*r} 56-${254*r} 0Z" fill="url(#${p}-dough)" stroke="#b99e6a" stroke-width="2"/><ellipse cx="350" cy="287" rx="${Math.min(140,127*r)}" ry="${Math.min(59,53*r)}" fill="#e9d5aa" stroke="#f5e4be" stroke-width="4"/>${Array.from({length:16},(_,i)=>`<circle cx="${260+(i*29)%185}" cy="${264+(i*17)%50}" r="1.7" fill="#bda16d"/>`).join('')}<path d="M486 188l34-74" stroke="#9caa95" stroke-width="7"/><path d="M482 196l-13 27m4-30-13 27m23-23-13 27" stroke="#b8c4aa" stroke-width="3"/>`;
  title='Lining a fluted tart tin with pastry';
 }else{
  const r=ratio(index),height=24+read(index)*.38;
  body+=`<path d="M200 274H500v83q-150 62-300 0Z" fill="url(#${p}-metal)" stroke="#7a8e76" stroke-width="2"/><ellipse cx="350" cy="274" rx="150" ry="54" fill="#768872"/><ellipse cx="350" cy="${316-height}" rx="137" ry="45" fill="#e3c48f"/><path d="M226 ${316-height}q103 ${-28+Math.abs(read(index)-target)*.35} 248 0" fill="none" stroke="#f4deb2" stroke-width="5"/><path d="M213 279q137 57 274 0" fill="none" stroke="#c7d0b6" stroke-width="7"/><g transform="translate(396 ${252-height/4}) rotate(-13)"><path d="M-91-5H49q18 9 0 18H-91Z" fill="url(#${p}-metal)" stroke="#8b9a85"/><rect x="39" y="-9" width="108" height="22" rx="9" fill="#b37e4d" stroke="#8d603a"/><path d="M52-2h76" stroke="#d8ad77" stroke-width="3" stroke-linecap="round"/></g>`;
  title='Levelling batter smoothly inside a cake tin';
 }
 return svg(body,title);
}

export function assemblySVG(options={}){
 const scores=Array.isArray(options.assemblyScores)?options.assemblyScores:[];
 const partial=Number.isFinite(options.assemblyIndex)?options.assemblyIndex:scores.length;
 const defects={...(options.defects||{})};
 if(!defects.lean&&scores.length&&Number.isFinite(options.alignment))defects.lean=clamp((options.alignment-50)*.16,-8,8);
 return foodSVG({...options,stage:'assemble',layers:Math.max(1,Math.min(3,partial+1)),defects});
}
