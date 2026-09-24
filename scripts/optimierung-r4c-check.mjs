// Optimierung Runde 4, Teil C „Handy & Nebenfenster“ (2026-09-24): prüft jeden Punkt per Klickpfad im echten Spiel.
// 1 Spielmenü 320×568: alle Einträge erreichbar, nichts abgeschnitten, kein Scrollen, „Zurück zum Spiel“ schließt; Steuerung ruht
// 2 Hochkant: Spielerrahmen verborgen, solange ein Fenster offen ist, danach wieder da
// 3/4 Figur, Talente, Rucksack hoch/quer/klein (mit Safe Areas): Tipp-Ziele ≥ 44 px, Abstände ≥ 8 px, kein Überlauf
// 5 Zielrahmen: Stufenplakette am Porträt in Schwierigkeitsfarbe, Balken in der Reaktionsfarbe des Namensschilds
// 6 Kampfstatistik im Fensterstil (Symbol, Versaltitel, Symbolreiter, Fuß ohne Wiederholung, Leerzustand als Symbol)
// 7 Einstellungen: alle Kategorien ohne Scrollen, eindeutige Kategoriesymbole
// Bilder: visual-review/optimierung-r4c/check/ (.jpg, 2024×900, 844×390, 390×844, 320×568). Ports: CDP 9545, Server 4345 (CDP_PORT/SERVER_PORT).
import {createCharacter,characterKey} from '../characters.js';
import {REACTION_COLORS,DIFFICULTY_COLORS} from '../unit-colors.js';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/optimierung-r4c/check';mkdirSync(dir,{recursive:true});
const b=await browserSession({port:Number(process.env.CDP_PORT||9545),serverPort:Number(process.env.SERVER_PORT||4345)});
const read=js=>b.evaluate(`(async()=>{const g=window.game;${js}})()`);
const closeAll=async()=>{await read(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await wait(250);};
const shot=async name=>{await b.screenshot(`${dir}/${name}.jpg`);};
const checks=[];const ok=m=>{checks.push(m);console.log('ok',m);};const report={};
const made=createCharacter(null,{name:'Runde Vier',classId:'dieter',look:'dieter'});
const INV=[{id:'brezel',count:3},{id:'dosenklinge',count:1},{id:'regenjacke',count:1},{id:'pfandring',count:1},{id:'keilerzahn',count:1},{id:'megafon',count:1},{id:'currywurst',count:2},{id:'feder',count:7}];
function seed(touch){const s={version:1,savedAt:Date.now(),worldKey:'v2-56753-72-1',classId:'dieter',level:12,tutorial:{version:1,step:8,completed:true},rpg:{inventory:INV,coins:237}};return 'delete Navigator.prototype.serviceWorker;localStorage.clear();localStorage.setItem("mertloch-unlock-all","1");localStorage.setItem("mertloch-intro-'+made.character.id+'","1");localStorage.setItem("mertloch-characters",'+JSON.stringify(JSON.stringify(made.roster))+');localStorage.setItem('+JSON.stringify(characterKey(s.worldKey,made.character))+','+JSON.stringify(JSON.stringify(s))+');'+(touch?'localStorage.setItem("mertloch-touch-v1",JSON.stringify({mode:"touch",size:"normal",layouts:{}}));':'localStorage.setItem("mertloch-touch-v1",JSON.stringify({mode:"desktop"}));');}
/** Simulierte Safe Areas wie mobile-check (iPhone): hochkant oben 47 / unten 34, quer links/rechts 47 / unten 21. */
const SAFE=(w,h)=>w>h?{top:0,bottom:21,left:47,right:47}:{top:47,bottom:34,left:0,right:0};
// Die Maschine ist oft stark belastet: zweiter Anlauf, wenn das Spiel nicht startet.
async function start({touch=false,w=2024,h=900,safe=false}={}){const SA=typeof safe==='object'?safe:SAFE(w,h);
 for(let attempt=1;attempt<=2;attempt++){
  const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:seed(touch)});
  if(touch){await b.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:2,mobile:true,screenOrientation:{type:w>h?'landscapePrimary':'portraitPrimary',angle:w>h?90:0}});await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});}
  else{await b.send('Emulation.clearDeviceMetricsOverride');await b.send('Emulation.setTouchEmulationEnabled',{enabled:false});await b.resize(w,h);}
  try{await b.goto(b.url);}catch(e){console.log('Anlauf',attempt,e.message);}
  await b.send('Page.removeScriptToEvaluateOnNewDocument',init);
  for(let i=0;i<160&&!await b.evaluate('!!window.game');i++)await wait(150);
  if(!await b.evaluate('!!window.game')){if(attempt===2)throw Error('Spiel startet nicht (zwei Anläufe)');continue;}
  for(let j=0;j<80;j++){const open=await b.evaluate(`(()=>{const s=document.querySelector('#startScreen');if(!s||s.hidden||getComputedStyle(s).display==='none')return false;s.querySelector('[data-start=enter]')?.click();return true;})()`);if(!open)break;await wait(250);}
  await read(`document.querySelector('.intro-skip')?.click();g.tutorial.completed=true;g.player.inCombat=0;g.stopAuto?.();g.player.x=g.world.spawn.x;g.player.y=g.world.spawn.y;g.moveTo=null;g.keys.clear();`);
  if(safe)await read(`const s=${JSON.stringify(SA)};for(const k in s)document.body.style.setProperty('--safe-'+k,s[k]+'px');`);
  await closeAll();await wait(2500);return;}
}
const calm=()=>read(`g.enemies=g.enemies.filter(e=>Math.hypot(e.x-g.player.x,e.y-g.player.y)>600);g.player.inCombat=0;g.target=null;g.stopAuto?.();g.moveTo=null;g.path=null;`);
const openTouch=async id=>{await closeAll();await read(`document.querySelector('#touchMenu')?.click()`);await wait(500);if(id!=='menu'){await read(`document.querySelector('.game-menu-windows [data-shell="${id}"]')?.click()`);await wait(900);}};
/** Tipp-Ziele eines Fensters: zu klein (< 44 px), Abstände (< 8 px, wie mobile-check), Überlauf des Körpers und abgeschnittene Ziele. */
const audit=id=>read(`const p=document.querySelector('.game-popup[data-window="${id}"]');if(!p)return null;const body=p.querySelector('.popup-body'),br=body.getBoundingClientRect(),pr=p.getBoundingClientRect();
 const T=[...p.querySelectorAll('button,.item-slot,select,input,[role=button]')].filter(e=>e.offsetParent&&getComputedStyle(e).visibility!=='hidden'&&!e.disabled).map(e=>({t:(e.getAttribute('aria-label')||e.textContent||e.className).trim().slice(0,24),r:e.getBoundingClientRect(),e}));
 const inside=(a,c)=>a.left<=c.left&&a.right>=c.right&&a.top<=c.top&&a.bottom>=c.bottom;const gaps=[];
 for(let i=0;i<T.length;i++)for(let j=i+1;j<T.length;j++){const a=T[i].r,c=T[j].r;if(T[i].e.contains(T[j].e)||T[j].e.contains(T[i].e)||inside(a,c)||inside(c,a))continue;const g=Math.max(0,c.left-a.right,a.left-c.right,c.top-a.bottom,a.top-c.bottom);if(g<8)gaps.push(T[i].t+'↔'+T[j].t+' '+Math.round(g*10)/10);}
 const cut=T.filter(x=>x.e.closest('.popup-body')&&(x.r.bottom>br.bottom+1||x.r.top<br.top-1||x.r.right>br.right+1||x.r.left<br.left-1)).map(x=>x.t);
 const hidden=T.filter(x=>{const h=document.elementFromPoint(x.r.left+x.r.width/2,x.r.top+x.r.height/2);return !h||!(x.e===h||x.e.contains(h));}).map(x=>x.t);
 return {win:[Math.round(pr.left),Math.round(pr.top),Math.round(pr.width),Math.round(pr.height)],over:body.scrollHeight>body.clientHeight+1?body.scrollHeight+'/'+body.clientHeight:'',count:T.length,small:T.filter(x=>Math.min(x.r.width,x.r.height)<44-.01).map(x=>x.t+' '+Math.round(x.r.width)+'×'+Math.round(x.r.height)),gaps,cut,hidden,offscreen:pr.bottom>innerHeight+1||pr.right>innerWidth+1||pr.top<0};`);
try{
 // =============== 1 · Spielmenü auf 320×568 (ohne und mit Statusleiste 20 px) ===============
 report.menu={};
 for(const [name,safe] of [['320',null],['320-safe',{top:20,bottom:0,left:0,right:0}]]){
  await start({touch:true,w:320,h:568});if(safe)await read(`const s=${JSON.stringify(safe)};for(const k in s)document.body.style.setProperty('--safe-'+k,s[k]+'px');`);await calm();
  await openTouch('menu');const a=await audit('menu');report.menu[name]=a;
  const m=await read(`const p=document.querySelector('.popup-menu');const items=[...p.querySelectorAll('.game-menu-windows button,.game-menu-actions>button')].filter(e=>getComputedStyle(e).display!=='none');const ctrl=[...document.querySelectorAll('#touchStick,#touchActions,#touchUtility')].filter(e=>e.getBoundingClientRect().width&&getComputedStyle(e).visibility!=='hidden').map(e=>e.id);return {items:items.length,tiles:p.querySelectorAll('.game-menu-windows button').length,labels:items.map(e=>e.getAttribute('aria-label')||e.textContent.trim()),ctrl,panel:getComputedStyle(document.querySelector('#gameShell>.player-panel')).visibility,resume:!!p.querySelector('[data-close]')}`);
  assert.ok(a,'Spielmenü offen');assert.equal(a.over,'',name+': Spielmenü schneidet/scrollt '+a.over);assert.deepEqual(a.cut,[],name+': abgeschnittene Einträge');assert.deepEqual(a.hidden,[],name+': verdeckte Einträge');assert.equal(a.offscreen,false,name+': Menü außerhalb');
  assert.deepEqual(a.small,[],name+': Tipp-Ziele < 44 px');assert.deepEqual(a.gaps,[],name+': Abstände < 8 px');assert.ok(m.tiles>=10&&m.resume,name+': Kacheln und „Zurück zum Spiel“ '+JSON.stringify(m));
  assert.deepEqual(m.ctrl,[],name+': Touch-Steuerung ruht, solange das modale Menü offen ist');assert.equal(m.panel,'hidden',name+': Spielerrahmen verborgen');
  await shot('r4c-10-menue-'+name);
  const r=await read(`const e=document.querySelector('.popup-menu [data-close]').getBoundingClientRect();return {x:e.left+e.width/2,y:e.top+e.height/2}`);
  await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x,y:r.y}]});await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(500);
  const after=await read(`return {menu:!!document.querySelector('.popup-menu'),ctrl:getComputedStyle(document.querySelector('#touchStick')).visibility,panel:getComputedStyle(document.querySelector('#gameShell>.player-panel')).visibility}`);
  assert.equal(after.menu,false,name+': „Zurück zum Spiel“ per Tipp schließt das Menü');assert.equal(after.ctrl,'visible',name+': Steuerung wieder da');assert.equal(after.panel,'visible',name+': Spielerrahmen wieder da');
  ok('1 Spielmenü '+name+': '+m.items+' Einträge erreichbar, Fenster '+a.win.join(',')+', kein Abschneiden, Ziele ≥ 44 px, Abstände ≥ 8 px, „Zurück zum Spiel“ per Tipp');}
 // =============== 2–4 · Hochkant/quer/klein mit Safe Areas: Spielerrahmen, Figur, Talente, Rucksack ===============
 report.windows={};
 for(const [name,w,h,sa] of [['hoch',390,844],['quer',844,390],['klein',360,740],['se',320,568,{top:20,bottom:0,left:0,right:0}]]){
  await start({touch:true,w,h,safe:sa||true});await calm();
  if(w<h){const before=await read(`return getComputedStyle(document.querySelector('#gameShell>.player-panel')).visibility`);assert.equal(before,'visible',name+': Spielerrahmen ohne Fenster sichtbar');}
  for(const id of ['person','talents','bag']){
   await openTouch(id);const a=await audit(id);report.windows[name+'-'+id]=a;assert.ok(a,name+': '+id+' offen');
   assert.equal(a.over,'',name+': '+id+' läuft über '+a.over);assert.deepEqual(a.cut,[],name+': '+id+' abgeschnittene Ziele');assert.deepEqual(a.small,[],name+': '+id+' Tipp-Ziele < 44 px');assert.deepEqual(a.gaps,[],name+': '+id+' Abstände < 8 px');
   if(w<h){const vis=await read(`const p=document.querySelector('#gameShell>.player-panel'),r=p.getBoundingClientRect(),q=document.querySelector('.game-popup').getBoundingClientRect();return {vis:getComputedStyle(p).visibility,overlap:r.bottom>q.top&&r.top<q.bottom}`);assert.equal(vis.vis,'hidden',name+': Spielerrahmen bei offenem Fenster verborgen '+JSON.stringify(vis));}
   if(id==='person'&&w>h){await wait(600);const hp=await read(`const b=document.querySelector('.popup-person [data-live-hp]'),m=b?.querySelector('.hp-max');return {text:b?.innerText.trim(),max:m?getComputedStyle(m).display:'fehlt',cut:b?b.scrollWidth>b.clientWidth+1:true}`);assert.ok(hp.max==='none'&&!hp.cut&&/^[\d.]+$/.test(hp.text),name+': Lebenszahl quer ohne „/ Höchstwert“ und ungekürzt '+JSON.stringify(hp));}
   await shot(`r4c-20-${name}-${id}`);}
  if(w<h){await closeAll();await wait(300);assert.equal(await read(`return getComputedStyle(document.querySelector('#gameShell>.player-panel')).visibility`),'visible',name+': Spielerrahmen nach dem Schließen wieder da');}
  const bagHead=report.windows[name+'-bag'];
  ok('2–4 '+name+' '+w+'×'+h+': Figur, Talente, Rucksack ohne Überlauf, 0 Ziele < 44 px, 0 Abstände < 8 px'+(w<h?', Spielerrahmen nur ohne Fenster':'')+' (Rucksack '+bagHead.count+' Ziele)');}
 // =============== 5 · Zielrahmen: Stufenplakette und Reaktionsfarbe ===============
 await start();await calm();report.target={};
 const hexRgb=h=>'rgb('+[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(', ')+')';
 for(const [lv,beh,diff,reaction] of [[2,'aggressive','grey','hostile'],[9,'aggressive','green','hostile'],[12,'neutral','yellow','neutral'],[15,'aggressive','orange','hostile'],[17,'aggressive','red','hostile']]){
  await read(`const e=[...g.enemies].filter(e=>e.hp>0).sort((a,b)=>Math.hypot(a.x-g.player.x,a.y-g.player.y)-Math.hypot(b.x-g.player.x,b.y-g.player.y))[0];e.level=${lv};e.behavior='${beh}';e.aggro=false;e.elite=false;g.target=e;g.player.x=e.x-70;g.player.y=e.y+20;`);await wait(700);
  const t=await read(`const p=document.querySelector('#targetPanel'),l=document.querySelector('#targetLevel'),pt=document.querySelector('#targetPortrait'),n=document.querySelector('#targetPanel .unit-name');const q=e=>{const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}};const lr=q(l),pr=q(pt);return {diff:l.dataset.difficulty,color:getComputedStyle(l,'::after').color,reaction:p.dataset.reaction,bar:getComputedStyle(document.querySelector('#targetBar')).backgroundImage,lvl:lr,portrait:pr,name:q(n),text:getComputedStyle(l,'::after').content}`);
  report.target[diff]=t;assert.equal(t.diff,diff,'Stufe '+lv+' gegen 12 → '+diff);assert.equal(t.color,hexRgb(DIFFICULTY_COLORS[diff]),'Plakette in Schwierigkeitsfarbe '+diff);assert.equal(t.reaction,reaction);
  assert.ok(t.bar.includes(hexRgb(REACTION_COLORS[reaction].fill)),'Balken in der Reaktionsfarbe des Namensschilds '+reaction+' '+t.bar.slice(0,80));
  const cx=(t.lvl.l+t.lvl.r)/2,pcx=(t.portrait.l+t.portrait.r)/2;assert.ok(Math.abs(cx-pcx)<=2&&t.lvl.t<t.portrait.b&&t.lvl.b>t.portrait.b-4,'Plakette unten mittig am Porträt '+JSON.stringify({lvl:t.lvl,portrait:t.portrait}));
  assert.ok(t.lvl.l>=t.name.r||t.lvl.t>=t.name.b,'Stufe steht nicht mehr in der Namenszeile');
  if(diff==='grey'||diff==='red')await b.send('Page.captureScreenshot',{format:'jpeg',quality:92,clip:{x:0,y:0,width:1100,height:260,scale:1}}).then(r=>writeFileSync(`${dir}/r4c-30-zielrahmen-${diff}.jpg`,Buffer.from(r.data,'base64')));}
 ok('5 Zielrahmen: Plakette am Porträt in grau/grün/gelb/orange/rot nach Stufenabstand, Balken rot (feindlich) bzw. gelb (neutral) wie das Namensschild');
 // =============== 6 · Kampfstatistik im Fensterstil ===============
 await calm();await read(`const m=document.querySelector('#combatMeter');if(m.hidden)document.querySelector('#meterToggle').click();`);await wait(600);
 const empty=await read(`const m=document.querySelector('#combatMeter'),e=m.querySelector('.meter-empty');return {hidden:e.hidden,svg:!!e.querySelector('svg'),text:e.textContent.trim(),note:e.dataset.tooltipNote||''}`);
 assert.ok(!empty.hidden&&empty.svg&&!empty.text&&empty.note,'Leerzustand als Symbol mit Tooltip '+JSON.stringify(empty));
 await read(`(async()=>{const {spawnArena}=await import('./arena.js');const [e]=spawnArena(game,{dummy:true});game.random=()=>.5;game.damage(e,170,'Kelle');game.time+=2;game.damage(e,70,'Autoangriff');game.time+=2;})()`);await wait(1500);
 const meter=await read(`const m=document.querySelector('#combatMeter'),h=m.querySelector('.meter-header'),s=h.querySelector('strong'),cs=getComputedStyle(s);return {icon:!!h.querySelector('.meter-title-icon svg'),font:cs.fontFamily,upper:cs.textTransform,modes:[...h.querySelectorAll('[data-meter-mode]')].map(b=>({svg:!!b.querySelector('svg'),text:b.textContent.trim(),tip:b.dataset.tooltipLabel})),outside:m.querySelectorAll(':scope>.meter-modes').length,foot:m.querySelector('.meter-summary').innerText.trim(),row:m.querySelector('.meter-row small')?.textContent||'',status:!!m.querySelector('.meter-status'),timeTip:m.querySelector('.meter-time')?.dataset.tooltipNote||'',select:getComputedStyle(m.querySelector('select')).appearance,frame:getComputedStyle(m).borderImageSource.slice(0,30)}`);
 report.meter={empty,meter};
 assert.ok(meter.icon,'Titelzeile mit Symbol');assert.match(meter.font,/Jersey/,'Titel in der Fensterschrift');assert.equal(meter.upper,'uppercase','Versaltitel wie alle Fenster');
 assert.equal(meter.modes.length,2);assert.ok(meter.modes.every(m=>m.svg&&!m.text&&m.tip),'Schaden/Heilung als Symbolreiter mit Tooltip '+JSON.stringify(meter.modes));assert.equal(meter.outside,0,'keine Textreiterzeile mehr');
 assert.doesNotMatch(meter.foot,/Gesamt|DPS|HPS/,'Fuß wiederholt die Balkenzeile nicht: '+meter.foot);assert.match(meter.foot,/\d+\s*s$/,'Fuß zeigt die Kampfdauer');assert.ok(meter.timeTip,'Zustand im Tooltip der Dauer');assert.equal(meter.status,false,'keine zweite Statuszeile');
 assert.equal(meter.select,'none','Auswahlfeld im Spielstil');
 await b.send('Page.captureScreenshot',{format:'jpeg',quality:92,clip:await read(`const r=document.querySelector('#combatMeter').getBoundingClientRect();return {x:r.x-10,y:r.y-10,width:r.width+20,height:r.height+20,scale:2}`)}).then(r=>writeFileSync(`${dir}/r4c-40-kampfstatistik.jpg`,Buffer.from(r.data,'base64')));
 await shot('r4c-41-desktop-2024');
 ok('6 Kampfstatistik: Symbol + Versaltitel, Symbolreiter '+meter.modes.map(m=>m.tip).join('/')+', Fuß „'+meter.foot+'“ (Zustand im Tooltip), Leerzustand als Symbol');
 await read(`document.querySelector('[data-meter-close]')?.click()`);
 // Ruhe herstellen: im Kampf klappen Fenster über dem Helden ein (hero-reveal.js) – das wäre hier kein Befund der Einstellungen.
 await read(`g.enemies=[];g.player.inCombat=0;g.target=null;g.player.x=g.world.spawn.x;g.player.y=g.world.spawn.y;g.moveTo=null;g.path=null;`);await wait(2500);
 // =============== 7 · Einstellungen: alle Kategorien ohne Scrollen, eindeutige Symbole ===============
 await closeAll();await b.press('Escape');await wait(600);if(!await read(`return !!document.querySelector('.popup-menu')`)){await read(`document.querySelector('#gameMenuButton')?.click()`);await wait(600);}await read(`document.querySelector('.popup-menu [data-shell="settings"]')?.click()`);await wait(700);
 const nav=await read(`return [...document.querySelectorAll('[data-opt-cat]')].map(b=>({id:b.dataset.optCat,icon:b.querySelector('svg')?.innerHTML||b.querySelector('canvas')?.dataset.uiIcon||''}))`);
 assert.ok(nav.length>=6,'sechs Kategorien');assert.equal(new Set(nav.map(n=>n.icon)).size,nav.length,'jede Kategorie hat ein eigenes Symbol');assert.ok(nav.every(n=>n.icon&&!['bag','map','book'].includes(n.icon)),'keine wiederverwendeten Fenstersymbole');
 report.settings={};
 for(const {id} of nav){await read(`document.querySelector('[data-opt-cat="${id}"]').click()`);await wait(400);
  const s=await read(`const p=document.querySelector('.game-popup[data-window="settings"]'),s=p.querySelector('.opt-scroll'),r=p.getBoundingClientRect();return {h:s.scrollHeight,c:s.clientHeight,sw:s.scrollWidth,cw:s.clientWidth,win:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],inView:r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight}`);
  report.settings[id]=s;assert.ok(s.c>100,'Einstellungen „'+id+'“ sichtbar (nicht eingeklappt) '+JSON.stringify(s));assert.ok(s.h<=s.c+1&&s.sw<=s.cw+2,'Einstellungen „'+id+'“ ohne Scrollen '+JSON.stringify(s));assert.ok(s.inView,'Fenster im Bild '+id);
  if(['interface','keys'].includes(id))await shot('r4c-50-einstellungen-'+id);}
 ok('7 Einstellungen: '+nav.length+' Kategorien ohne Scrollen ('+Object.entries(report.settings).map(([k,v])=>k+' '+v.h+'/'+v.c).join(', ')+'), eigene Symbole');
 await closeAll();
 // Übersichtsbilder in den vier Größen
 for(const [name,w,h,id] of [['quer',844,390,'person'],['hoch',390,844,'person']]){await start({touch:true,w,h});await calm();await openTouch(id);await shot(`r4c-60-${name}-${w}x${h}`);}
 writeFileSync(dir+'/messwerte.json',JSON.stringify(report,null,1));
 assert.deepEqual((b.errors||[]).map(e=>e.text||String(e)),[],'Laufzeitfehler');
 console.log('\n'+checks.length+' Prüfungen grün');
}catch(e){console.error('FAIL',e.message);try{await shot('failure');}catch{}writeFileSync(dir+'/messwerte-partial.json',JSON.stringify(report,null,1));process.exitCode=1;}finally{b.close();}
