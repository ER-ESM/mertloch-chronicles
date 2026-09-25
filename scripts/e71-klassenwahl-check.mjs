// E-72 · Klassenwahl-Abnahme (Heldenerstellung mit fünf Klassen, Heldenhalle, Hofprobe je Klasse) im echten Spiel.
// Je Gerät (Desktop 1440×1000, Handy quer 844×390 mit Touch) und je Klasse: Klasse wählen → Aussehen → Name → „Held erstellen“,
// ins Dorf, Hofprobe bis zum Ende mit echten Eingaben (Tasten bzw. Touch-Knöpfe; Laufen über den Laufweg), neu laden,
// Heldenhalle ansehen, zum Schluss Stufe 2 mit „Neuer Kniff“-Hinweis. Screenshots: docs/e71-abnahme/klassenwahl/.
// Aufruf: node scripts/e71-klassenwahl-check.mjs [--device=desktop|phone] [--classes=dieter,kaethe]
// Ports: CDP_PORT (Standard 9490), SERVER_PORT (Standard 4290). Eigenes Wegwerf-Profil und eigener Server (browser-session.mjs).
import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {browserSession,wait} from './browser-session.mjs';

const OUT=fileURLToPath(new URL('../docs/e71-abnahme/klassenwahl/',import.meta.url));mkdirSync(OUT,{recursive:true});
const arg=k=>process.argv.find(a=>a.startsWith('--'+k+'='))?.split('=')[1];
const CLASSES=(arg('classes')||'dieter,baerbel,kevin,schorsch,kaethe').split(',');
const DEVICES=[{tag:'desktop',w:1440,h:1000,touch:false},{tag:'phone',w:844,h:390,touch:true}].filter(d=>!arg('device')||d.tag===arg('device'));
const LOOK={dieter:'dieter',baerbel:'baerbel',kevin:'kevin',schorsch:null,kaethe:null};// null = Vorschlag der Klasse behalten
const NAME={dieter:'Tresen',baerbel:'Landhaus',kevin:'Pfand',schorsch:'Grill',kaethe:'Skat'};
const results=[];const check=(ok,what,detail='')=>{results.push({ok:!!ok,what,detail});console.log((ok?'  ok   ':'  FAIL ')+what+(detail?' · '+detail:''));};

const b=await browserSession({port:Number(process.env.CDP_PORT||9490),serverPort:Number(process.env.SERVER_PORT||4290)});
const js=code=>b.evaluate(`(async()=>{${code}})()`);
const game=code=>js(`const g=window.game;${code}`);
/** Ausschnitt eines Elements in voller Auflösung (Hinweiszeile, Tooltip) – klein, aber lesbar. */
async function shotOf(sel,name,pad=8){const r=await js(`const e=document.querySelector(${JSON.stringify(sel)});if(!e||!e.getClientRects().length)return null;const b=e.getBoundingClientRect();return {x:Math.max(0,b.left-${pad}),y:Math.max(0,b.top-${pad}),width:Math.min(innerWidth,b.width+${pad*2}),height:Math.min(innerHeight,b.height+${pad*2})};`);if(!r)return false;const img=await b.send('Page.captureScreenshot',{format:'jpeg',quality:70,clip:{...r,scale:1}});writeFileSync(OUT+name+'.jpg',Buffer.from(img.data,'base64'));return true;}
const shot=async name=>{const r=await b.send('Page.captureScreenshot',{format:'jpeg',quality:50,clip:{x:0,y:0,width:device.w,height:device.h,scale:device.touch?.5:.6}});writeFileSync(OUT+name+'.jpg',Buffer.from(r.data,'base64'));};
async function until(code,ms=15000,step=150){const end=Date.now()+ms;while(Date.now()<end){try{const v=await js(code);if(v)return v;}catch{}await wait(step);}return null;}
async function center(sel){return js(`const e=document.querySelector(${JSON.stringify(sel)});if(!e||!e.getClientRects().length)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};`);}
let device=null;
/** Antippen (Touch) bzw. Klicken (Maus) auf die Mitte des Elements – echte Eingabe über CDP. */
async function tap(sel){const p=await center(sel);if(!p)return false;
 if(device.touch){await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x,y:p.y}]});await wait(40);await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 else{for(const type of ['mouseMoved','mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,x:p.x,y:p.y,button:type==='mouseMoved'?'none':'left',clickCount:1});}
 return true;}
async function hover(sel){const p=await center(sel);if(p)await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x,y:p.y});}
async function typeText(text){for(const ch of text)await b.send('Input.dispatchKeyEvent',{type:'char',text:ch});}
async function setDevice(d){device=d;
 if(d.touch){await b.send('Emulation.setDeviceMetricsOverride',{width:d.w,height:d.h,deviceScaleFactor:2,mobile:true,screenOrientation:{type:'landscapePrimary',angle:90}});await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});}
 else{await b.send('Emulation.clearDeviceMetricsOverride');await b.send('Emulation.setTouchEmulationEnabled',{enabled:false});await b.resize(d.w,d.h);}
 // Kein Service Worker (cacht Module), Touch-/Desktop-Modus fest.
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;try{if(!sessionStorage.getItem('kw-fresh-${d.tag}')){localStorage.clear();sessionStorage.setItem('kw-fresh-${d.tag}','1');}localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'${d.touch?'touch':'desktop'}',size:'normal',layouts:{}}));}catch{}`});}
async function load(){await b.goto(b.url,{passStart:false});await until(`return !!window.game&&!!document.querySelector('#startScreen')`,60000);}
/** Startschirm bis zur Heldenhalle bzw. Erstellung (Gast). → 'roster'|'create' */
async function toHall(){return until(`const s=document.querySelector('#startScreen');if(!s||s.hidden)return null;if(s.dataset.step==='login'){s.querySelector('[data-start=guest]')?.click();return null;}return s.dataset.step;`,30000,250);}
const noScroll=()=>js(`const s=document.querySelector('#startScreen');return {sh:s.scrollHeight,ch:s.clientHeight,ok:s.scrollHeight<=s.clientHeight+1&&document.scrollingElement.scrollHeight<=innerHeight+1};`);
const smallTargets=sel=>js(`return [...document.querySelectorAll(${JSON.stringify(sel)})].filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect();return {t:(e.textContent||'').trim().slice(0,18),w:Math.round(r.width),h:Math.round(r.height)};}).filter(r=>r.w<44||r.h<44);`);

async function createHero(cls,first){
 const tag=device.tag;
 if(!first){await tap('[data-start=create]');await until(`return document.querySelector('#startScreen').dataset.step==='create'`);}
 await wait(600);
 if(first){// Überblick: fünf Karten, Symbol, Tooltip, kein Scrollen
  const cards=await js(`return [...document.querySelectorAll('.cc-class')].map(c=>({id:c.dataset.draftClass,svg:!!c.querySelector('svg.class-emblem'),tip:c.dataset.tooltipLabel||'',note:(c.dataset.tooltipNote||'').length}))`);
  check(cards.length===5&&cards.every(c=>c.svg&&c.tip&&c.note>20),tag+': fünf Klassenkarten mit Symbol und Tooltip',cards.map(c=>c.id+':'+c.tip).join(', '));
  const sc=await noScroll();check(sc.ok,tag+': Erstellung ohne Scrollen',sc.sh+'/'+sc.ch);
  if(device.touch){const small=await smallTargets('.cc-class,.cc-tabs button,.cc-create,.cc-name input');check(!small.length,tag+': Tipp-Ziele der Erstellung ≥ 44 px',JSON.stringify(small));}
  else{await hover('[data-draft-class=kaethe]');await wait(500);const tip=await js(`const t=document.querySelector('#itemTooltip');return t&&!t.hidden&&getComputedStyle(t).display!=='none'?t.textContent:''`);check(/Blatt & Augen/.test(tip)&&/Entsteht/.test(tip),tag+': Tooltip an der Klassenkarte (Käthe)',tip.slice(0,90));await shot(tag+'-erstellung-tooltip');await shotOf('#itemTooltip',tag+'-tooltip-kaethe');await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:5,y:5});}
 }
 // 1 · Klasse
 if(device.touch&&await js(`return !!document.querySelector('[data-cc-tab=class][aria-selected=false]')`))await tap('[data-cc-tab=class]');
 await tap(`[data-draft-class=${cls}]`);await until(`return document.querySelector('[data-draft-class=${cls}]')?.getAttribute('aria-pressed')==='true'`);await wait(700);
 const line=await js(`return document.querySelector('.cc-role .cc-resource-name')?.textContent||''`);
 check(line.length>3,tag+' '+cls+': Ressource unter der Figur',line);
 await shot(tag+'-erstellung-'+cls);
 // 2 · Aussehen
 if(device.touch){await tap('[data-cc-tab=look]');await wait(500);const sc=await noScroll();check(sc.ok,tag+' '+cls+': Aussehen ohne Scrollen',sc.sh+'/'+sc.ch);}
 if(LOOK[cls]){await tap(`[data-draft-look=${LOOK[cls]}]`);await wait(300);}
 if(cls==='kevin'){await tap('[data-draft-tint="hair:rot"]');await wait(300);}
 if(device.touch&&cls==='kaethe')await shot(tag+'-erstellung-aussehen');
 // 3 · Name
 const name=NAME[cls]+(device.touch?' Handy':' Desk');
 await js(`const i=document.querySelector('[name=heroName]');i.value='';i.focus();`);await typeText(name);
 await tap('.cc-create');
 // Neuladen mit gemerktem Ziel → Spiel
 await wait(1500);await until(`return !!window.game&&window.game.hero?.name===${JSON.stringify(name)}`,90000,300);
 const hero=await game(`return {cls:g.member.id,name:g.hero?.name,look:g.hero?.look,tut:!!g.tutorial&&!g.tutorial.completed}`);
 check(hero.cls===cls&&hero.name===name,tag+' '+cls+': Held erstellt und im Spiel',JSON.stringify(hero));
 return name;
}

async function hofprobe(cls){
 const tag=device.tag,t0=Date.now();let shots={};
 await until(`document.querySelector('.intro-skip')?.click();return !document.querySelector('.intro-skip')&&!!window.game?.tutorial`,30000,300);
 await wait(800);
 for(let i=0;i<900;i++){
  const s=await game(`const t=g.tutorial,e=g.enemies.find(x=>x.tutorial);return {step:t.step,done:t.completed,hits:t.hits,autos:t.autos,cast:!!e?.cast,auto:g.autoAttack.enabled,gcd:g.gcd,dlg:!!document.querySelector('[data-tutorial-next]'),bag:!!document.querySelector('.game-popup[data-window=bag]'),target:!!g.target?.tutorial,near:Math.hypot(g.player.x-g.world.npc.x,g.player.y-g.world.npc.y),moving:!!g.moveTo||!!(g.path&&g.path.length)}`);
  if(s.done)break;
  if(s.step===0||s.step===7){
   if(s.dlg){if(!shots['s'+s.step]){shots['s'+s.step]=1;await wait(400);
     if(s.step===0){const c=await js(`return document.querySelector('.tutorial-clothes')?.textContent||''`);check(c.includes('Kleiderhaufen'),tag+' '+cls+': Ida erzählt die Klamotte vom Kleiderhaufen',c.slice(0,70));}
     if(s.step===0)await shot(tag+'-hofprobe-'+cls+'-ida');}
    await tap('[data-tutorial-next]');await wait(500);continue;}
   if(s.near>40){if(!s.moving)await game(`g.navigate({x:g.world.npc.x+18,y:g.world.npc.y+10})`);await wait(300);continue;}
   if(device.touch)await tap('#touchInteract');else await b.press('f');await wait(500);continue;}
  if(s.step===1){if(!s.moving)await game(`g.navigate(g.tutorial.course)`);await wait(300);continue;}
  if(s.step===2){if(device.touch)await tap('#touchTarget');else await b.press('Tab');await wait(400);continue;}
  if(s.step===3){
   if(!s.target){if(device.touch)await tap('#touchTarget');else await b.press('Tab');await wait(300);continue;}
   if(!s.auto){if(device.touch)await tap('[data-touch-skill=auto]');else await b.press('1');await wait(300);continue;}
   if(s.gcd<=0){if(device.touch)await tap('[data-touch-skill=strike]');else await b.press('2');}
   await wait(350);
   if(s.hits>=1&&!shots.s3){shots.s3=1;await wait(300);const hint=await js(`return (document.querySelector('.quest-tracker .qt-hint')||document.querySelector('#tutorialGuide:not([hidden]) .tutorial-res-hint:not([hidden])'))?.textContent||''`);check(hint.length>10,tag+' '+cls+': Ressourcen-Hinweis im Kampfschritt',hint);await shot(tag+'-hofprobe-'+cls+'-kampf');await shotOf(device.touch?'#tutorialGuide':'.quest-tracker .qt-quest.is-focus',tag+'-hinweis-'+cls);}
   continue;}
  if(s.step===4){if(s.cast){if(device.touch)await tap('[data-touch-skill=dash]');else await b.press(' ');await wait(700);}else await wait(250);continue;}
  if(s.step===5){const far=await game(`const d=g.tutorial.dummy;return Math.hypot(g.player.x-d.x,g.player.y-d.y)`);if(far>20){if(!s.moving)await game(`g.navigate(g.tutorial.dummy)`);await wait(300);continue;}
   if(device.touch)await tap('#touchInteract');else await b.press('f');await wait(600);continue;}
  if(s.step===6){if(s.bag){await wait(200);continue;}
   if(device.touch){await tap('#touchMenu');await wait(500);if(!await tap('[data-shell=bag]'))await b.press('i');}else await b.press('i');await wait(600);continue;}
  await wait(200);
 }
 await js(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);
 const done=await game(`return !!g.tutorial?.completed`);
 check(done,tag+' '+cls+': Hofprobe bis zum Ende',Math.round((Date.now()-t0)/1000)+' s');
 await wait(1200);await shot(tag+'-hofprobe-'+cls+'-fertig');
 // Stufe 2: „Neuer Kniff“ mit Zeile zur Ressource (sofern die Klasse auf Stufe 2 etwas lernt, das eine Zeile hat)
 const lvl=await game(`const {xpToNext}=await import('./progression.js');if(g.player.level<2)g.gainXp(xpToNext(g.player.level)-g.player.xp+1);return g.player.level`);
 const hint=await until(`const m=document.querySelector('.milestone:not([hidden])');return m?(m.querySelector('.milestone-hint')?.textContent||'-'):null`,6000,150);
 const expect={baerbel:true,kevin:false,schorsch:true,kaethe:true,dieter:true}[cls];/* Kevin: Pfandautomat ab Stufe 1 (Orchestrator), auf Stufe 2 nichts mit Ressourcenzeile */
 if(expect){check(hint&&hint!=='-',tag+' '+cls+': Stufe '+lvl+' – Hinweis beim neuen Kniff',hint||'');if(cls==='schorsch'||cls==='kaethe'){await shot(tag+'-stufe2-'+cls);await shotOf('.milestone',tag+'-stufe2-hinweis-'+cls);}}
 await game(`g.save?.();`);await js(`window.dispatchEvent(new Event('beforeunload'))`);await wait(600);
}

async function hall(expected){
 await load();const step=await toHall();check(step==='roster',device.tag+': Heldenhalle nach Neuladen',step);await wait(1500);
 const cards=await js(`return [...document.querySelectorAll('.cs-card')].map(c=>({name:c.querySelector('strong')?.textContent,svg:!!c.querySelector('svg.class-emblem')}))`);
 check(cards.length>=expected&&cards.every(c=>c.svg),device.tag+': Halle zeigt '+cards.length+' Helden mit Klassen-Symbol',cards.map(c=>c.name).join(', '));
 const sc=await noScroll();check(sc.ok,device.tag+': Halle ohne Scrollen',sc.sh+'/'+sc.ch);
 return cards;
}

try{
 for(const d of DEVICES){
  console.log('== '+d.tag);await setDevice(d);
  await load();let step=await toHall();check(step==='create',d.tag+': ohne Helden öffnet die Erstellung',step);
  for(const [i,cls] of CLASSES.entries()){
   if(i>0){await hall(i);if(i===CLASSES.length-1)await shot(d.tag+'-halle-vor-'+cls);}
   await createHero(cls,i===0);
   await hofprobe(cls);
  }
  const cards=await hall(CLASSES.length);
  // Halle mit allen Helden; jede Klasse einmal anklicken (Figur, Klasse, Ressource)
  for(const cls of CLASSES){const name=NAME[cls]+(d.touch?' Handy':' Desk');const id=await js(`return [...document.querySelectorAll('.cs-card')].find(c=>c.querySelector('strong')?.textContent===${JSON.stringify(name)})?.dataset.hero||''`);
   if(!id)continue;await tap(`[data-hero="${id}"]`);await wait(700);const res=await js(`return document.querySelector('.cs-name .cc-resource-name')?.textContent||''`);check(res.length>3,d.tag+' Halle '+cls+': Ressource unter der Figur',res);
   if(cls==='schorsch'||cls==='kaethe')await shot(d.tag+'-halle-'+cls);}
  if(d.touch){const small=await smallTargets('.cs-card,.cs-new,.cs-enter-button,.cs-corner .ui-button');check(!small.length,d.tag+': Tipp-Ziele der Halle ≥ 44 px',JSON.stringify(small));}
 }
 check(!b.errors.length,'keine Laufzeitfehler',JSON.stringify(b.errors.slice(0,3)).slice(0,300));
}catch(e){check(false,'Ablauf',e.stack||String(e));}
finally{b.close();}
const bad=results.filter(r=>!r.ok);
console.log(`\n${results.length-bad.length}/${results.length} Prüfungen bestanden. Screenshots: ${OUT}`);
process.exit(bad.length?1:0);
