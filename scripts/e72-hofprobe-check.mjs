// E-72 Runde 3 · Hofprobe-Befunde aus dem Kenner-Playtest vom 25.09. (Befund 10) im echten Spiel, alle Klassen:
//  a) Ida ist vor dem Gespräch erkennbar („!“ + Name) und die Taste F greift in einem angenehmen Radius; F bzw. Rechtsklick
//     auf Ida aus der Entfernung läuft hin und spricht an. Andere Interaktionen (Beutel, Händler) bleiben bei ihren Radien.
//  b) Die Erinnerung „Der Stempel“ nach der Hofprobe blockiert nichts: Laufen (WASD, Rechtsklick) und F gehen weiter, Esc/Klick schließt.
//  c) Hilfe (H): keine überlappenden Tastenkappen/Wörter, kein Scrollen.
// Ablauf je Größe: Held anlegen (Klasse → Name → „Held erstellen“) → Einführungsfilm überspringen → Ida ansprechen → Hofprobe mit
// echten Eingaben bis zum Ende → Erinnerung prüfen → Hilfe prüfen. Screenshots (JPEG): docs/e72-runde3/hofprobe/<phase>-<größe>-*.jpg.
// Aufruf: node scripts/e72-hofprobe-check.mjs [--phase=vorher|nachher] [--runs=1600x900:dieter+kaethe,1280x720:schorsch]
// Ports: CDP_PORT (Standard 9682), SERVER_PORT (Standard 4282). Eigenes Wegwerf-Profil und eigener Server (browser-session.mjs).
import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {browserSession,wait} from './browser-session.mjs';

const OUT=fileURLToPath(new URL('../docs/e72-runde3/hofprobe/',import.meta.url));mkdirSync(OUT,{recursive:true});
const arg=k=>process.argv.find(a=>a.startsWith('--'+k+'='))?.split('=')[1];
const PHASE=arg('phase')||'nachher',STRICT=PHASE!=='vorher';
const RUNS=(arg('runs')||'1600x900:dieter+kaethe,1280x720:schorsch').split(',').map(r=>{const [size,cls]=r.split(':');const [w,h]=size.split('x').map(Number);return {tag:size,w,h,classes:cls.split('+')};});
const NAME={dieter:'Tresen',baerbel:'Landhaus',kevin:'Pfand',schorsch:'Grill',kaethe:'Skat'};
const results=[],measures={};const check=(ok,what,detail='')=>{results.push({ok:!!ok,what,detail:String(detail)});console.log((ok?'  ok   ':(STRICT?'  FAIL ':'  (vorher) ')) +what+(detail?' · '+detail:''));};

const b=await browserSession({port:Number(process.env.CDP_PORT||9682),serverPort:Number(process.env.SERVER_PORT||4282)});
const js=code=>b.evaluate(`(async()=>{${code}})()`);
const game=code=>js(`const g=window.game;${code}`);
let size=null;
const file=name=>OUT+PHASE+'-'+size.tag+'-'+name+'.jpg';
/** Vollbild; 1600 × 900 auf 80 % verkleinert (Ordner klein halten), 1280 × 720 in voller Größe. */
const shot=async name=>{const r=await b.send('Page.captureScreenshot',{format:'jpeg',quality:62,clip:{x:0,y:0,width:size.w,height:size.h,scale:size.w>1400?.8:1}});writeFileSync(file(name),Buffer.from(r.data,'base64'));};
async function shotOf(sel,name,pad=10){const r=await js(`const e=document.querySelector(${JSON.stringify(sel)});if(!e||!e.getClientRects().length)return null;const b=e.getBoundingClientRect();return {x:Math.max(0,b.left-${pad}),y:Math.max(0,b.top-${pad}),width:Math.min(innerWidth,b.width+${pad*2}),height:Math.min(innerHeight,b.height+${pad*2})};`);if(!r)return false;const img=await b.send('Page.captureScreenshot',{format:'jpeg',quality:85,clip:{...r,scale:1}});writeFileSync(file(name),Buffer.from(img.data,'base64'));return true;}
async function until(code,ms=15000,step=150){const end=Date.now()+ms;while(Date.now()<end){try{const v=await js(code);if(v)return v;}catch{}await wait(step);}return null;}
async function center(sel){return js(`const e=document.querySelector(${JSON.stringify(sel)});if(!e||!e.getClientRects().length)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};`);}
async function mouse(x,y,button='left'){await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,button:'none'});for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,x,y,button,buttons:button==='left'?1:2,clickCount:1});}
async function tap(sel){const p=await center(sel);if(!p)return false;await mouse(p.x,p.y);return true;}
async function typeText(text){for(const ch of text)await b.send('Input.dispatchKeyEvent',{type:'char',text:ch});}
/** Bildschirmpunkt eines Weltpunkts (Mitte der Weltfläche = Kamera). */
const screenOf=(x,y)=>js(`const R=globalThis.__mertloch.renderer,c=R.canvas.getBoundingClientRect(),z=R.zoom||1,cam=R.camera;return {x:c.left+c.width/2+(${x}-cam.x)*z,y:c.top+c.height/2+(${y}-cam.y)*z};`);
const hint=()=>js(`const i=document.querySelector('#interact');return i&&!i.classList.contains('hidden')&&i.getClientRects().length?i.textContent.trim():''`);
const idaDist=()=>game(`return Math.round(Math.hypot(g.player.x-g.world.npc.x,g.player.y-g.world.npc.y))`);
/** Steht der Held im selben Raum wie Ida (beide in der Bude oder beide draußen)? */
const idaRoom=()=>game(`const {insideHouse}=await import('./world-house.js'),h=g.world.base?.house,n=g.world.npc;return !h||insideHouse(h,g.player.x,g.player.y)===insideHouse(h,n.x,n.y)`);
const dialogOpen=()=>js(`return !!document.querySelector('[data-tutorial-next]')`);
const closeAll=()=>js(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click());`);
/** Held auf einen Abstand zu Ida stellen (auf der Linie Ida → Start, begehbar), Bewegung aus. */
const placeAt=d=>game(`const n=g.world.npc,s=g.tutorial?.course||g.world.spawn;let a=Math.atan2(s.y-n.y,s.x-n.x);const W=g.world;let pt=null;for(let k=0;k<24&&!pt;k++){const t=a+(k%2?1:-1)*Math.ceil(k/2)*.26,x=n.x+Math.cos(t)*${d},y=n.y+Math.sin(t)*${d};if(!W.blocked(x,y,8))pt={x,y};}pt||={x:n.x+${d},y:n.y};Object.assign(g.player,pt,{vx:0,vy:0,moving:false});g.moveTo=null;g.path=[];g.routeGoal=null;g.talkTo=null;g.keys.clear();return Math.round(Math.hypot(g.player.x-n.x,g.player.y-n.y));`);

async function createHero(cls,first){
 if(!first){await tap('[data-start=create]');await until(`return document.querySelector('#startScreen').dataset.step==='create'`);}
 await wait(600);
 await tap(`[data-draft-class=${cls}]`);await until(`return document.querySelector('[data-draft-class=${cls}]')?.getAttribute('aria-pressed')==='true'`);await wait(500);
 const name=NAME[cls]+' '+size.w;
 await js(`const i=document.querySelector('[name=heroName]');i.value='';i.focus();`);await typeText(name);
 await tap('.cc-create');
 await wait(1500);await until(`return !!window.game&&window.game.hero?.name===${JSON.stringify(name)}`,90000,300);
 const hero=await game(`return {cls:g.member.id,name:g.hero?.name,tut:!!g.tutorial&&!g.tutorial.completed}`);
 check(hero.cls===cls&&hero.name===name&&hero.tut,size.tag+' '+cls+': Held erstellt, Hofprobe läuft',JSON.stringify(hero));
}

/** a) Ida erkennbar, Radius der Taste F, F und Rechtsklick aus der Entfernung. */
async function idaApproach(cls){
 const tag=size.tag+' '+cls;
 await until(`document.querySelector('.intro-skip')?.click();return !document.querySelector('.intro-skip')&&!!window.game?.tutorial`,30000,300);
 await wait(900);
 const opened=await dialogOpen();
 const start=await idaDist();measures[tag+' Start→Ida']=start;
 if(cls===size.classes[0])await shot(cls+'-a0-start');
 // Nach dem Film öffnet sich Idas Gespräch sofort (auch aus der Entfernung). „Ausrüstung nehmen“ muss dort auch wirken.
 if(opened){await tap('[data-tutorial-next]');await wait(500);}
 const step0=await game(`return g.tutorial.step`);
 check(!opened||step0===1||await dialogOpen()===false,tag+': Idas Eröffnungsgespräch lässt sich annehmen','Abstand '+start+', Schritt '+step0+(opened?'':' (kein Gespräch offen)'));
 if(step0===1){// Für die Messung zurück auf Schritt 0 (Ausrüstung bleibt): der Spieler, der das Gespräch wegklickt
  await game(`g.tutorial.step=0;g.emit('tutorialStep');return true`);}
 await closeAll();await wait(300);
 // Ida erkennbar: „!“ über ihr (renderer questBadge über idaMark), Name ab welchem Abstand
 const mark=await game(`const m=await import('./quest-mobs.js');return m.idaMark(g)`);
 check(mark==='!',tag+': „!“ über Ida vor dem Gespräch',mark);
 // Hinweis „F – mit Ida sprechen“: ab welchem Abstand?
 const rows=[];for(const d of [200,170,140,120,100,90,80,70,60,50,45,40]){const real=await placeAt(d);await wait(260);const h=await hint();const name=await game(`const m=await import('./quest-mobs.js');return !!(m.idaShowsName?m.idaShowsName(g):(await import('./world-presence.js')).nearestSpeaker(g,g.world.npc))`);rows.push({d:real,hint:h,name});}
 const ida=r=>/Ida/.test(r.hint),first=rows.find(ida),firstName=rows.find(r=>r.name),wrong=rows.filter(r=>r.hint&&!ida(r));
 measures[tag+' F-Hinweis Ida ab']=first?.d??null;measures[tag+' Name ab']=firstName?.d??null;measures[tag+' Hinweis je Abstand']=rows.map(r=>r.d+':'+(r.hint||'-')).join(' | ');
 console.log('   Abstand → Hinweis (i = Ida, x = anderes, n = Name): '+rows.map(r=>r.d+(ida(r)?'i':r.hint?'x':'·')+(r.name?'n':'')).join(' '));
 check(first&&first.d>=80,tag+': F-Hinweis „Mit Ida sprechen“ erscheint früh genug (≥ 80 E ≈ 5 m)','ab '+(first?.d??'–')+' E · „'+(first?.hint||'')+'“');
 check(!wrong.length,tag+': kein irreführender F-Hinweis auf dem Weg zu Ida (F führt in der Hofprobe immer zu Ida)',wrong.map(r=>r.d+' E „'+r.hint+'“').join(', '));
 check(firstName&&firstName.d>=first?.d,tag+': Name über Ida mindestens so früh wie der F-Hinweis','Name ab '+(firstName?.d??'–')+' E');
 await placeAt(95);await wait(400);await shot(cls+'-a1-95E');
 // F aus mittlerer Entfernung: läuft hin UND öffnet das Gespräch
 await placeAt(150);await wait(300);await b.press('f');
 const talkF=await until(`return document.querySelector('[data-tutorial-next]')?'dialog':null`,6000,150);
 const dF=await idaDist(),rF=await idaRoom();
 check(talkF==='dialog',tag+': F aus 150 E läuft zu Ida und spricht sie an','Gespräch '+(talkF?'offen':'nicht offen')+', Abstand danach '+dF);
 check(rF&&dF<=50&&dF>=12,tag+': dabei steht der Held vor Ida im selben Raum (nicht vor der Tür, nicht in ihr)',dF+' E, '+(rF?'drinnen':'draußen'));
 if(talkF)await shot(cls+'-a2-f-gespraech');
 await closeAll();await wait(300);
 // Rechtsklick auf Ida aus 200 E: hinlaufen und reden
 await placeAt(200);await wait(400);const at=await game(`return {x:g.world.npc.x,y:g.world.npc.y}`);const sp=await screenOf(at.x,at.y-12);
 await mouse(sp.x,sp.y,'right');
 const talkR=await until(`return document.querySelector('[data-tutorial-next]')?'dialog':null`,7000,150);
 check(talkR==='dialog',tag+': Rechtsklick auf Ida aus 200 E läuft hin und spricht','Abstand danach '+await idaDist()+', '+(await idaRoom()?'im selben Raum':'draußen vor der Tür'));
 await closeAll();await wait(300);
}

/** Hofprobe mit echten Eingaben (Tasten) bis zum Ende. F spricht Ida auch aus der Entfernung an (nach der Änderung). */
async function hofprobe(cls){
 const tag=size.tag+' '+cls,t0=Date.now();let fOnly=0,helped=0;
 for(let i=0;i<900;i++){
  const s=await game(`const t=g.tutorial,e=g.enemies.find(x=>x.tutorial);return {step:t.step,done:t.completed,cast:!!e?.cast,auto:g.autoAttack.enabled,gcd:g.gcd,dlg:!!document.querySelector('[data-tutorial-next]'),bag:!!document.querySelector('.game-popup[data-window=bag]'),target:!!g.target?.tutorial,near:Math.hypot(g.player.x-g.world.npc.x,g.player.y-g.world.npc.y),moving:!!g.moveTo||!!(g.path&&g.path.length)}`);
  if(s.done)break;
  if(s.step===0||s.step===7){
   if(s.dlg){await tap('[data-tutorial-next]');await wait(500);if(s.step===7)fOnly++;continue;}
   if(s.moving){await wait(250);continue;}
   // F allein (vorher: läuft nur hin, spricht nicht); zweites F am Ziel zählt als „Nachhelfen“
   await b.press('f');const got=await until(`return !!document.querySelector('[data-tutorial-next]')`,5000,150);if(!got)helped++;continue;}
  if(s.step===1){if(!s.moving)await game(`g.navigate(g.tutorial.course)`);await wait(300);continue;}
  if(s.step===2){await b.press('Tab');await wait(400);continue;}
  if(s.step===3){
   if(!s.target){await b.press('Tab');await wait(300);continue;}
   if(!s.auto){await b.press('1');await wait(300);continue;}
   if(s.gcd<=0)await b.press('2');await wait(350);continue;}
  if(s.step===4){if(s.cast){await b.press(' ');await wait(700);}else await wait(250);continue;}
  if(s.step===5){const far=await game(`const d=g.tutorial.dummy;return Math.hypot(g.player.x-d.x,g.player.y-d.y)`);if(far>20){if(!s.moving)await game(`g.navigate(g.tutorial.dummy)`);await wait(300);continue;}
   await b.press('f');await wait(600);continue;}
  if(s.step===6){if(s.bag){await wait(200);continue;}await b.press('i');await wait(600);continue;}
  await wait(200);
 }
 const done=await game(`return !!g.tutorial?.completed`);
 check(done,tag+': Hofprobe bis zum Ende',Math.round((Date.now()-t0)/1000)+' s');
 check(helped===0,tag+': Ida mit F ohne Nachhelfen erreicht (Schritt 1 und 8)',helped?helped+'× zweites F nötig':'');
}

/** b) Erinnerung „Der Stempel“ nach der Hofprobe: blockiert nichts, schließt mit Esc. */
async function memory(cls){
 const tag=size.tag+' '+cls;
 await js(`document.querySelectorAll('.game-popup:not([data-window=memory]) [data-window-close]').forEach(x=>x.click())`);
 // Die Erinnerung wartet, bis der Held ruhig steht und keine Einblendung läuft.
 const sel='.game-popup[data-window=memory],.memory-card:not([hidden])';
 const el=await until(`const e=document.querySelector(${JSON.stringify(sel)});return e&&e.getClientRects().length?e.className:null`,25000,250);
 check(!!el,tag+': Erinnerung „Der Stempel“ erscheint',el||'');
 if(!el)return;
 await wait(500);await shot(cls+'-b0-erinnerung');await shotOf(sel,cls+'-b0-erinnerung-nah');
 const box=await js(`const e=document.querySelector(${JSON.stringify(sel)});const r=e.getBoundingClientRect(),R=globalThis.__mertloch.renderer,c=R.canvas.getBoundingClientRect(),z=R.zoom||1,p=game.player,cam=R.camera,hx=c.left+c.width/2+(p.x-cam.x)*z,hy=c.top+c.height/2+(p.y-cam.y)*z;return {l:Math.round(r.left),t:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height),hero:{x:Math.round(hx),y:Math.round(hy)},overHero:hx>r.left-20&&hx<r.right+20&&hy-60<r.bottom&&hy>r.top,area:Math.round(r.width*r.height/(innerWidth*innerHeight)*100)}`);
 measures[tag+' Erinnerung']=box;
 check(!box.overHero,tag+': Erinnerung liegt nicht über dem Helden',JSON.stringify(box));
 check(box.area<=14,tag+': Erinnerung nimmt höchstens 14 % der Fläche ein',box.area+' %');
 const clash=await js(`const c=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(),out=[];if(c.left<0||c.top<0||c.right>innerWidth||c.bottom>innerHeight)out.push('außerhalb');for(const s of ['.minimap','.quest-panel','.game-menu-rail','.action-area .action-bar','.player-panel','#interact:not(.hidden)']){const e=document.querySelector(s);if(!e||!e.getClientRects().length)continue;const r=e.getBoundingClientRect();if(r.width&&r.height&&c.left<r.right-1&&r.left<c.right-1&&c.top<r.bottom-1&&r.top<c.bottom-1)out.push(s);}return out;`);
 check(!clash.length,tag+': Erinnerung überdeckt keine HUD-Teile',clash.join(', '));
 // Laufen mit W geht weiter
 // Laufen mit WASD geht weiter (die Richtung, in der nichts im Weg steht – in der Bude stehen Tische um Ida)
 let moved=0,key='';for(const k of ['s','d','a','w']){const p0=await game(`return {x:g.player.x,y:g.player.y}`);await b.hold(k,700);await wait(100);const p1=await game(`return {x:g.player.x,y:g.player.y}`);moved=Math.round(Math.hypot(p1.x-p0.x,p1.y-p0.y));key=k.toUpperCase();if(moved>20)break;}
 const still=await js(`return !!document.querySelector(${JSON.stringify(sel)})?.getClientRects().length`);
 check(moved>20,tag+': Laufen (WASD) bei offener Erinnerung',key+': '+moved+' E');
 check(still,tag+': Erinnerung bleibt beim Laufen stehen (nicht verloren)');
 // Rechtsklick in die Welt neben dem Helden: Laufweg
 const hp=await game(`return {x:g.player.x,y:g.player.y}`);const target=await game(`const W=g.world;for(const [dx,dy] of [[60,40],[-60,40],[60,-30],[-60,-30],[0,70]]){const x=g.player.x+dx,y=g.player.y+dy;if(!W.blocked(x,y,8))return {x,y};}return {x:g.player.x,y:g.player.y+50};`);
 const ts=await screenOf(target.x,target.y);const hit=await js(`const e=document.elementFromPoint(${ts.x},${ts.y});return e?.id||e?.className||e?.tagName`);
 await mouse(ts.x,ts.y,'right');await wait(900);const hp2=await game(`return {x:g.player.x,y:g.player.y}`);const walked=Math.round(Math.hypot(hp2.x-hp.x,hp2.y-hp.y));
 check(walked>15,tag+': Rechtsklick-Laufweg bei offener Erinnerung',walked+' E · Ziel unter der Maus: '+hit);
 // F spricht mit Ida (Erinnerung schluckt F nicht)
 await game(`g.navigate({x:g.world.npc.x+20,y:g.world.npc.y+14});return true`);await until(`return !window.game.moveTo&&!(window.game.path||[]).length`,8000,200);await wait(300);
 const stillThere=await js(`return !!document.querySelector(${JSON.stringify(sel)})?.getClientRects().length`);
 await b.press('f');await wait(700);
 const talk=await js(`return !!document.querySelector('.game-popup[data-window=dialog]')`);
 check(talk,tag+': F spricht Ida an, obwohl die Erinnerung offen ist','Erinnerung vorher '+(stillThere?'offen':'zu'));
 if(cls===size.classes[0])await shot(cls+'-b1-f-bei-erinnerung');
 // Esc schließt; die Erinnerung ist unter Aufträge → Erinnerungen nachlesbar
 await b.press('Escape');await wait(400);if(await js(`return !!document.querySelector(${JSON.stringify(sel)})?.getClientRects().length`)){await b.press('Escape');await wait(400);}
 const gone=await js(`return !document.querySelector(${JSON.stringify(sel)})?.getClientRects().length`);
 check(gone,tag+': Esc schließt die Erinnerung');
 const seen=await game(`return g.memories.seen.includes('stempel')`);check(seen,tag+': „Der Stempel“ bleibt unter Erinnerungen nachlesbar');
 await js(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await wait(200);
 if(cls!==size.classes[0])return;
 // Zweiter und dritter Fetzen: Klick aufs Bild öffnet das große Bild samt Text, das Kreuz schließt; beide bleiben im Auftragsbuch.
 const next=async(event,name)=>{await game(`g.memoryEvent(${JSON.stringify(event)});return true`);return until(`const e=document.querySelector(${JSON.stringify(sel)});return e&&e.getClientRects().length?(e.querySelector('h2,.memory-card-head strong')?.textContent||'?'):null`,20000,250);};
 const t2=await next({kind:'consumable',item:'kaltgetraenk'});
 if(t2){await tap('[data-memory-card-art],.popup-memory [data-memory-art]');await wait(500);
  const big=await js(`const w=document.querySelector('.game-popup[data-window=memoryart]');return w?{img:!!w.querySelector('img'),text:(w.querySelector('p')?.textContent||'').length}:null`);
  check(big&&big.img&&big.text>40,tag+': Klick aufs Bild öffnet „'+t2+'“ groß mit Text',JSON.stringify(big));
  if(big)await shot(cls+'-b2-bild-gross');await b.press('Escape');await wait(400);}
 else check(false,tag+': zweite Erinnerung erscheint');
 const t3=await next({kind:'level',level:5});
 if(t3){await tap('[data-memory-next]');await wait(400);const gone=await js(`return !document.querySelector(${JSON.stringify(sel)})?.getClientRects().length`);check(gone,tag+': Kreuz schließt „'+t3+'“');}
 else check(false,tag+': dritte Erinnerung erscheint');
 const all=await game(`return ['kasten-feuerzeug','naturtalent'].every(id=>g.memories.seen.includes(id))`);check(all,tag+': beide Fetzen stehen unter Erinnerungen');
}

/** c) Hilfe: Tastenkappen und Wörter überlappen nicht, kein Scrollen. */
async function help(){
 const tag=size.tag;await js(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click());document.querySelector('#world').focus()`);await wait(300);
 await b.press('h');const open=await until(`return !!document.querySelector('.game-popup .hk-list')?.getClientRects().length`,5000);
 check(open,tag+': Hilfe öffnet mit H');if(!open)return;
 await wait(500);
 const r=await js(`const out=[],items=[...document.querySelectorAll('.game-popup .hk-item')].filter(e=>e.getClientRects().length);const R=e=>e.getBoundingClientRect();
  const hit=(a,b)=>a.left<b.right-1&&b.left<a.right-1&&a.top<b.bottom-1&&b.top<a.bottom-1;
  for(const it of items){const k=it.querySelector('.hk-keys'),w=it.querySelector('.hk-word');const caps=[...it.querySelectorAll('.hk-cap,.hk-dash')];
   for(const c of caps){if(w&&hit(R(c),R(w)))out.push('Kappe×Wort: '+c.textContent+' / '+w.textContent);if(k&&(R(c).right>R(k).right+1||R(c).left<R(k).left-1))out.push('Kappe ragt aus der Tastenspalte: '+c.textContent+' ('+w?.textContent+')');if(R(c).right>R(it).right+1)out.push('Kappe ragt aus der Zeile: '+c.textContent);}
   if(w&&w.scrollWidth>w.clientWidth+1)out.push('Wort gekappt: '+w.textContent);}
  const cols=[...document.querySelectorAll('.game-popup .hk-col')].map(c=>[...new Set([...c.querySelectorAll('.hk-word')].filter(e=>e.getClientRects().length).map(e=>Math.round(R(e).left)))].length);if(cols.some(n=>n>1))out.push('Wörter nicht bündig: '+cols.join('/'));
  for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++)if(hit(R(items[i]),R(items[j])))out.push('Zeile×Zeile: '+items[i].textContent+' / '+items[j].textContent);
  const caps=[...document.querySelectorAll('.game-popup .hk-cap,.game-popup .hk-dash')].filter(e=>e.getClientRects().length);for(let i=0;i<caps.length;i++)for(let j=i+1;j<caps.length;j++)if(hit(R(caps[i]),R(caps[j])))out.push('Kappe×Kappe: '+caps[i].textContent+' / '+caps[j].textContent);
  const body=document.querySelector('.game-popup .hk-list').closest('.popup-body');return {items:items.length,problems:out,scroll:body.scrollHeight>body.clientHeight+1?body.scrollHeight+'/'+body.clientHeight:'',win:(()=>{const b=document.querySelector('.game-popup .hk-list').closest('.game-popup').getBoundingClientRect();return Math.round(b.width)+'×'+Math.round(b.height);})()}`);
 measures[tag+' Hilfe']=r;
 check(r.problems.length===0,tag+': Hilfe ohne Überlappung ('+r.items+' Zeilen, Fenster '+r.win+')',r.problems.slice(0,6).join(' | '));
 check(!r.scroll,tag+': Hilfe ohne Scrollen',r.scroll);
 await shot('c0-hilfe');await shotOf('.game-popup .hk-list','c0-hilfe-nah',6);
 await b.press('Escape');await wait(300);
}

try{
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;try{if(!sessionStorage.getItem('hofprobe-fresh')){localStorage.clear();sessionStorage.setItem('hofprobe-fresh','1');}localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'desktop',size:'normal',layouts:{}}));}catch{}`});
 let first=true;
 for(const run of RUNS){size=run;console.log('== '+run.tag+' · '+PHASE);await b.resize(run.w,run.h);
  for(const cls of run.classes){
   await b.goto(b.url,{passStart:false});await until(`return !!window.game&&!!document.querySelector('#startScreen')`,60000);
   await until(`const s=document.querySelector('#startScreen');if(!s||s.hidden)return null;if(s.dataset.step==='login'){s.querySelector('[data-start=guest]')?.click();return null;}return s.dataset.step;`,30000,250);
   await createHero(cls,first);first=false;
   await idaApproach(cls);
   await hofprobe(cls);
   await memory(cls);
   if(cls===run.classes[0])await help();
   await game(`g.save?.();return true`);await wait(400);
  }
 }
 check(!b.errors.length,'keine Laufzeitfehler',JSON.stringify(b.errors.slice(0,3)).slice(0,400));
}catch(e){check(false,'Ablauf',e.stack||String(e));try{await shot('abbruch');}catch{}}
finally{b.close();}
writeFileSync(OUT+PHASE+'-report.json',JSON.stringify({phase:PHASE,measures,results},null,1));
const bad=results.filter(r=>!r.ok);
console.log(`\n${results.length-bad.length}/${results.length} Prüfungen bestanden (${PHASE}). Screenshots: ${OUT}`);
process.exit(STRICT&&bad.length?1:0);
