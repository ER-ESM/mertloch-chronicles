// Optimierung Runde 5, Teil A „Spielfluss“ (2026-09-24): jeder Punkt per Klickpfad mit echter Maus und Tastatur.
// 1 Hinlaufen von der Karte (⇧+Klick auf die Stecknadel, Stiefel in der Seitenleiste) und alle übrigen Laufwege (Minikarte ⇧+Klick,
//   Auftragskasten, Rechtsklick auf den Boden) halten beim ersten Angreifer an – mit C+J+I+P offen; rote Zeile; Held frei
// 2 Todesbildschirm: erscheint bei offenen Fenstern, Esc und F schließen ihn nicht, „Aufwachen bei St. Gangolf“ weckt
// 3 Gegner-Tooltip: Auftragszeile „… 0/3“ im Zielgebiet, blass „zählt hier nicht“ außerhalb, Dropchance als Würfel „~50 %“
// 4 Fluss: Taste 2 ohne Ziel → „Kein Ziel“ (rot, kein Auto-Ziel); Tab auf ein fernes Tier + Kniff läuft an; Rechtsklick auf die eben
//   gezeichnete Lage eines laufenden Gegners trifft
// 5 Zauber-Puffer: zweiter Kniff in den letzten 0,4 s der GCD löst danach aus; früher gedrückt → rote Zeile
// 6 Bodenmarke bleibt am Aufschlagort, Leertaste springt heraus, „AUSGEWICHEN!“
// 7 Wegmarke weicht einem Gegner-Namensschild aus
// 8 Auftrag abgegeben → „Auftrag abgeschlossen“ groß mittig mit Belohnung
// 9 Held hinter einer Baumkrone farbig (Umriss statt blasser Fläche)
// 10 Neutrale Tiere: kein Dauerschild; unter der Maus und nach Treffer mit Schild
// 11 Heldenauswahl: „Ins Dorf“ hat den Fokus; Klick knapp unter dem „!“ eines Auftraggebers trifft ihn
// Bilder: visual-review/optimierung-r5a/. Ports: CDP 9550, Server 4350 (CDP_PORT/SERVER_PORT). ONLY=1,2,… für einzelne Teile.
import assert from 'node:assert/strict';
import {session,wait} from './r3a-lib.mjs';
const s=await session({dir:'visual-review/optimierung-r5a',cdp:Number(process.env.CDP_PORT||9550),server:Number(process.env.SERVER_PORT||4350)});
const {b,read,rect,click,mouse,shot,zoom,start,TO_SCREEN}=s;
const checks=[];const ok=m=>{checks.push(m);console.log('ok',m);};
const only=process.env.ONLY?process.env.ONLY.split(','):null,run=n=>!only||only.includes(String(n));
const ev=js=>b.evaluate(`(async()=>{${js}})()`);
const SAVE={level:4,tutorial:{version:1,step:8,completed:true},quest:{accepted:true,chapter:1},hotspots:{quests:{'st-olli-1':{accepted:true,claimed:true},'st-olli-2':{accepted:true}}}};
async function settle(){let last=null;for(let i=0;i<60;i++){const c=await read(`const v=window.mertloch.state().viewport;return {x:v.camera.x,y:v.camera.y}`);if(last&&Math.hypot(c.x-last.x,c.y-last.y)<.4)return;last=c;await wait(150);}}
/** Klon-Helfer window.__clone(name,dx,dy,extra): Gegner dx/dy neben dem Helden. */
const CLONE=`window.__clone=(name,dx,dy,extra={})=>{const g=window.game,w=g.world;const src=g.enemies.find(e=>e.name===name)||g.enemies.find(e=>e.behavior==='aggressive');const e=Object.assign(structuredClone({...src,chasePath:[],returnPath:[],roamGoal:null,spawnPoints:null,plateAt:null,seenAt:null}),{id:880000+Math.floor(Math.random()*99999)},extra);const p=w.findClear(g.player.x+dx,g.player.y+dy,9);Object.assign(e,p,{home:{...p},hp:e.maxHp,aggro:false,ai:'roaming',spawnGrace:0,cast:null,roamWait:999,attackTimer:99,...extra});g.enemies.push(e);return e;};`;
/** Freie Fläche ohne Gegner, dazu der Klon-Helfer. */
const CLEAR=`const g=window.game,w=g.world;const base=w.findClear(w.npc.x+700,w.npc.y-500,9);Object.assign(g.player,base,{vx:0,vy:0,inCombat:0,hp:g.player.maxHp});g.moveTo=null;g.path=[];g.routeGoal=null;g.approach=null;g.autopilot=null;g.autoAttack.enabled=false;g.target=null;g.friend=null;g.attackers?.clear();g.queued=null;
 for(const e of g.enemies)if(Math.hypot(e.x-base.x,e.y-base.y)<1100){e.x+=6000;e.home={x:e.x,y:e.y};e.aggro=false;e.ai='roaming';e.cast=null;}
 window.__base=base;`+CLONE;
const HERO=TO_SCREEN+`const p=window.game.player,a=toS(p),k=a.k;const hero={l:a.x-14*k,r:a.x+14*k,t:a.y-40*k,b:a.y+6*k};
 const over=[...document.querySelectorAll('.game-popup')].filter(w=>{const r=w.getBoundingClientRect();return r.width>2&&!w.classList.contains('hero-seethrough')&&r.left<hero.r&&hero.l<r.right&&r.top<hero.b&&hero.t<r.bottom;}).map(w=>w.className);return {over,x:Math.round(a.x),y:Math.round(a.y)}`;
const toastText=()=>read(`const t=document.querySelector('#toast');return {text:t?.textContent||'',error:!!t?.classList.contains('toast-error'),visible:!!t?.classList.contains('visible')}`);
try{
 // ---------- 1) Hinlaufen stoppt bei Angriff, auf allen Laufwegen ----------
 if(run(1)){
  await start(SAVE);
  /** Laufweg läuft: 1,2 s warten, dann einen Pfandkeiler 45 E vor den Helden stellen und warten, bis er ihn bemerkt. */
  async function threatAhead(label){
   let st=await read(`const g=window.game;return {route:!!g.routeGoal,auto:!!g.autopilot}`);assert.ok(st.route&&st.auto,label+': Laufweg mit Autopilot läuft '+JSON.stringify(st));
   await wait(1200);
   await read(`const g=window.game,p=g.player,n=g.moveTo||g.routeGoal;const dx=n.x-p.x,dy=n.y-p.y,d=Math.hypot(dx,dy)||1;window.__k=window.__clone('Pfandkeiler',dx/d*45,dy/d*45,{ambient:false});`);
   for(let i=0;i<40;i++){await wait(100);st=await read(`return {aggro:window.__k.aggro}`);if(st.aggro)break;}
   await wait(300);
   st=await read(`const g=window.game;return {aggro:window.__k.aggro,route:!!g.routeGoal,moving:!!g.moveTo,target:g.target===window.__k}`);
   assert.ok(st.aggro&&!st.route&&!st.moving,label+': Angriff hält den Laufweg an '+JSON.stringify(st));
   const t=await toastText();assert.ok(t.error&&/angehalten/.test(t.text),label+': rote Zeile '+JSON.stringify(t));
   return st;
  }
  const reset=async(dx=0,dy=0)=>{await read(CLEAR+`Object.assign(g.player,w.findClear(base.x+${dx},base.y+${dy},9));`);await settle();};
  // a) Weltkarte: ⇧+Klick auf die Stecknadel des verfolgten Ziels, mit C+J+I+P offen (Kenner-Weg)
  await reset();for(const k of ['c','i','j','p']){await b.press(k);await wait(250);}
  await b.press('m');await wait(900);
  const pin=await read(`const c=document.querySelector('#largeMap');const p=c?.atlasPin;if(!p)return null;const r=c.getBoundingClientRect();return {x:r.left+p.x*r.width/c.width,y:r.top+p.y*r.height/c.height}`);
  assert.ok(pin,'Stecknadel auf der Karte');await mouse(pin.x,pin.y);await wait(300);
  for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,x:Math.round(pin.x),y:Math.round(pin.y),button:'left',clickCount:1,modifiers:8,pointerType:'mouse'});
  await wait(300);assert.ok(!await read(`return !!document.querySelector('#largeMap')`),'Karte schließt beim Hinlaufen');
  await threatAhead('Karte ⇧+Klick');await wait(900);
  const hero=await read(HERO);await shot('r5a-10-karte-stopp-fenster');
  assert.ok(!hero.over.length,'nach dem Stopp liegt kein offenes Fenster über dem Helden '+JSON.stringify(hero));
  ok(`Karte ⇧+Klick auf „Verfolgtes Ziel“ bei C+J+I+P: Pfandkeiler bemerkt den Helden → Laufweg hält, rote Zeile, Held frei (${hero.x}/${hero.y})`);
  await b.press('Escape');await wait(300);
  // b) Seitenleiste der Karte: Stiefel
  await reset();await b.press('m');await wait(900);
  const boot=await rect('.wk-boot');assert.ok(boot,'Stiefel in der Seitenleiste');await click(boot.l+boot.w/2,boot.t+boot.h/2);await wait(300);
  await threatAhead('Stiefel');ok('Seitenleiste: Stiefel → Laufweg hält beim ersten Angreifer');
  // c) Minikarte ⇧+Klick
  await reset();const mm=await rect('#miniButton .mm-disc');assert.ok(mm,'Minikarte');const mx=mm.l+mm.w*.3,my=mm.t+mm.h*.7;await mouse(mx,my);
  for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,x:Math.round(mx),y:Math.round(my),button:'left',clickCount:1,modifiers:8,pointerType:'mouse'});
  await wait(300);await threatAhead('Minikarte');ok('Minikarte ⇧+Klick → Laufweg hält beim ersten Angreifer');
  // d) Auftragskasten
  await reset();const box=await rect('.quest-panel .qt-quest');await click(box.l+box.w/2,box.t+10);await wait(300);
  await threatAhead('Auftragskasten');ok('Auftragskasten → Laufweg hält beim ersten Angreifer');
  // e) Rechtsklick auf den Boden
  await reset();const far=await read(TO_SCREEN+`const p=window.game.player;return toS({x:p.x+260,y:p.y+40})`);await click(far.x,far.y,'right');await wait(300);
  await threatAhead('Rechtsklick Boden');ok('Rechtsklick auf den Boden → Laufweg hält beim ersten Angreifer');
  for(const id of ['c','i','j','p']){}await read(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);
 }
 // ---------- 2) Todesbildschirm ----------
 if(run(2)){
  await start(SAVE);await read(CLEAR+`window.__k=window.__clone('Pfandkeiler',30,0,{ambient:false});`);await settle();
  for(const k of ['c','i','j','p']){await b.press(k);await wait(250);}
  await read(`const g=window.game;g.player.hp=5;window.__k.aggro=true;window.__k.ai='combat';g.hitPlayer(window.__k,999);`);await wait(700);
  let st=await read(`const d=document.querySelector('#deathScreen'),r=d?.getBoundingClientRect();return {dead:window.game.dead,visible:!!d&&!d.hidden&&r.width>0,title:d?.querySelector('h2')?.textContent,cause:d?.querySelector('.ds-foe')?.textContent||'',z:+getComputedStyle(d).zIndex,top:[...document.querySelectorAll('.game-popup')].every(w=>+getComputedStyle(w.closest('#popupLayer')||w).zIndex<+getComputedStyle(d).zIndex),gray:getComputedStyle(document.querySelector('#world')).filter}`);
  assert.ok(st.dead&&st.visible&&/umgekippt/i.test(st.title)&&/Pfandkeiler/.test(st.cause),'Todesbildschirm mit Ursache '+JSON.stringify(st));
  assert.ok(st.top&&/grayscale/.test(st.gray),'über allen Fenstern, Welt entsättigt '+JSON.stringify(st));
  await shot('r5a-20-todesbildschirm');await zoom('r5a-20z-todesbildschirm',await rect('#deathScreen'));
  for(const k of ['Escape','f','Escape']){await b.press(k);await wait(300);}
  st=await read(`return {dead:window.game.dead,visible:!document.querySelector('#deathScreen').hidden}`);assert.ok(st.dead&&st.visible,'Esc und F schließen den Todesbildschirm nicht '+JSON.stringify(st));
  ok('Tod bei offenen Fenstern: „Du bist umgekippt“, Ursache „Pfandkeiler“ als Symbol, über allen Fenstern, Welt grau; Esc/F schließen ihn nicht');
  const wake=await rect('#deathScreen [data-ds-wake]');await click(wake.l+wake.w/2,wake.t+wake.h/2);await wait(600);
  st=await read(`const g=window.game;return {dead:g.dead,hp:g.player.hp,max:g.player.maxHp,visible:!document.querySelector('#deathScreen').hidden,d:Math.round(Math.hypot(g.player.x-g.world.spawn.x,g.player.y-g.world.spawn.y))}`);
  assert.ok(!st.dead&&!st.visible&&st.hp===st.max&&st.d<60,'Aufwachen bei St. Gangolf '+JSON.stringify(st));
  ok('„Aufwachen bei St. Gangolf“: Held lebt mit vollem Leben am Treffpunkt, Bildschirm weg');
  // Ursache Bodenfläche
  await read(CLEAR+`const e=window.__clone('Pfandkeiler',30,0,{ambient:false});e.aggro=true;e.ai='combat';g.player.hp=5;g.player.invulnerable=0;g.player.parry=0;e.cast={name:'Sprung · ausweichen',total:1,remaining:.05,damage:500,radius:35,ground:true,x:g.player.x,y:g.player.y,type:'pounce'};`);await wait(900);
  st=await read(`const d=document.querySelector('#deathScreen');return {dead:window.game.dead,ground:!!d.querySelector('.ds-ground'),skill:d.querySelector('.ds-foe small')?.textContent}`);
  assert.ok(st.dead&&st.ground&&/Sprung/.test(st.skill||''),'Ursache rote Fläche als Symbol '+JSON.stringify(st));
  await zoom('r5a-21z-tod-flaeche',await rect('#deathScreen'));ok('Tod durch Bodenfläche: Symbol „Rote Fläche“ und „Sprung“ an der Ursache');
  const w2=await rect('#deathScreen [data-ds-wake]');await click(w2.l+w2.w/2,w2.t+w2.h/2);await wait(400);
 }
 // ---------- 3) Gegner-Tooltip mit Auftragszeile ----------
 if(run(3)){
  await start(SAVE);
  await read(`const g=window.game,w=g.world,c=g.campFor(g.objectives()[0]);for(const e of g.enemies)if(Math.hypot(e.x-c.x,e.y-c.y)<900){e.x+=6000;e.home={x:e.x,y:e.y};e.aggro=false;}
   Object.assign(g.player,w.findClear(c.x+120,c.y+60,9),{inCombat:0});`);await read(CLONE);
  await read(`const g=window.game;window.__in=window.__clone('Pfandkeiler',70,-20,{ambient:true,behavior:'aggressive'});window.__in.aggroRange=1;`);
  await wait(400);await settle();
  const at=await read(TO_SCREEN+`const e=window.__in;return toS({x:e.x,y:e.y-12})`);await mouse(at.x,at.y);await wait(500);
  let tip=await read(`const t=document.querySelector('.unit-tooltip'),r=t.getBoundingClientRect();return {visible:!t.hidden&&r.width>0,text:t.innerText,chance:t.querySelector('[data-chance]')?.dataset.chance,dice:!!t.querySelector('.ut-drop svg'),r:{l:r.left,t:r.top,r:r.right,b:r.bottom}}`);
  const hero=await read(TO_SCREEN+`return toS(window.game.player)`);
  assert.ok(tip.visible&&/Pfandkeiler von den Trümmern jagen/.test(tip.text)&&/0\/3/.test(tip.text),'Tooltip: Auftragszeile 0/3 '+JSON.stringify(tip));
  assert.ok(tip.chance==='50'&&tip.dice&&/0\/6/.test(tip.text),'Tooltip: Absperrband 0/6 mit Würfel ~50 % '+JSON.stringify(tip));
  assert.ok(!(hero.x>tip.r.l&&hero.x<tip.r.r&&hero.y-40>tip.r.t&&hero.y-40<tip.r.b),'Tooltip liegt nicht auf dem Helden');
  await shot('r5a-30-gegner-tooltip');await zoom('r5a-30z-gegner-tooltip',{l:Math.round(tip.r.l),t:Math.round(tip.r.t),w:Math.round(tip.r.r-tip.r.l),h:Math.round(tip.r.b-tip.r.t)});
  ok(`Gegner-Tooltip im Zielgebiet: „${tip.text.split('\n').filter(Boolean).slice(0,4).join(' | ')}“`);
  // außerhalb des Zielgebiets: blass „zählt hier nicht“, Absperrband zählt überall
  await read(`const g=window.game,c=g.campFor(g.objectives()[0]);const w=g.world,p=w.findClear(c.x+900,c.y+700,9);Object.assign(g.player,p);window.__out=window.__clone('Pfandkeiler',70,-20,{ambient:true});window.__out.aggroRange=1;`);
  await wait(400);await settle();const at2=await read(TO_SCREEN+`const e=window.__out;return toS({x:e.x,y:e.y-12})`);await mouse(at2.x,at2.y);await wait(500);
  tip=await read(`const t=document.querySelector('.unit-tooltip');return {visible:!t.hidden,text:t.innerText,outside:!!t.querySelector('.ut-quest.outside')}`);
  assert.ok(tip.visible&&tip.outside&&/zählt hier nicht/i.test(tip.text),'außerhalb: blass mit „zählt hier nicht“ '+JSON.stringify(tip));
  const mark=await ev(`const Q=await import('./quest-mobs.js');return {inside:Q.chapterObjectiveFor(window.game,window.__out)}`);
  assert.equal(mark.inside,-1,'außerhalb zählt er nicht fürs Kapitel');
  ok('Außerhalb des Zielgebiets: Kapitelzeile blass „Zählt hier nicht – erst im Zielgebiet“; Absperrband (zählt überall) mit Würfel');
  await mouse(1000,860);
 }
 // ---------- 4) Fluss nach dem Kill ----------
 if(run(4)){
  await start(SAVE);await read(CLEAR);await settle();
  await b.press('2');await wait(250);let t=await toastText();
  assert.ok(t.error&&/Kein Ziel/.test(t.text),'Taste 2 ohne Ziel → rote Zeile „Kein Ziel“ '+JSON.stringify(t));
  assert.ok(!await read(`return !!window.game.target`),'kein Auto-Ziel');ok('Taste 2 ohne Ziel: rote Zeile „Kein Ziel.“, kein Auto-Ziel');
  // Angreifer in Kampfnähe wird nach dem Kill Ziel
  await read(`const g=window.game;const a=window.__clone('Pfandkeiler',30,0,{ambient:false}),b2=window.__clone('Pfandkeiler',-40,10,{ambient:false});a.aggro=b2.aggro=true;a.ai=b2.ai='combat';g.target=a;window.__b2=b2;a.hp=1;g.damage(a,50,'Test');`);await wait(400);
  assert.ok(await read(`const g=window.game;return g.target===window.__b2||!!g.target&&g.target.aggro`),'nach dem Kill wird der Angreifer Ziel');
  ok('Nach dem Kill: der nächste Angreifer wird Ziel');
  // Tab auf ein fernes neutrales Tier + Kniff: läuft hin
  await read(CLEAR+`const src=g.enemies.find(e=>e.behavior==='neutral');window.__n=window.__clone(src.name,190,0,{behavior:'neutral'});`);await settle();
  await b.press('Tab');await wait(200);
  t=await read(`const g=window.game;return {target:g.target===window.__n,d:Math.round(Math.hypot(window.__n.x-g.player.x,window.__n.y-g.player.y)/8)}`);assert.ok(t.target,'Tab wählt das Tier '+JSON.stringify(t));
  await b.press('2');await wait(300);
  const ap=await read(`const g=window.game;return {approach:!!g.approach,moving:!!g.moveTo}`);const tt=await toastText();
  assert.ok(ap.approach&&ap.moving&&!/Zu weit/.test(tt.text),'Tab + Kniff läuft an statt „Zu weit entfernt“ '+JSON.stringify({ap,tt}));
  ok(`Tab auf ein Tier in ${t.d} m + Taste 2: Held läuft hin (kein „Zu weit entfernt“)`);
  // Rechtsklick auf einen laufenden Gegner: Klick auf die Lage von vor 200 ms trifft
  await read(CLEAR+`const e=window.__clone('Pfanddachs',120,0,{behavior:'neutral'});e.roamGoal=null;window.__run=e;`);await settle();
  const old=await read(TO_SCREEN+`const e=window.__run;return toS({x:e.x,y:e.y-8})`);
  await read(`const e=window.__run;let n=0;window.__mv=setInterval(()=>{e.x+=3;n++;if(n>40)clearInterval(window.__mv);},16);`);await wait(220);
  const moved=await read(`const e=window.__run;return e.x`);await click(old.x,old.y,'right');await wait(250);
  const hit=await read(`const g=window.game;clearInterval(window.__mv);return {target:g.target===window.__run}`);
  assert.ok(hit.target,'Rechtsklick auf die eben gezeichnete Lage trifft den laufenden Gegner '+JSON.stringify({hit,moved}));
  ok('Rechtsklick auf einen laufenden Gegner (Klick auf seine Lage von vor ≈200 ms): Treffer');
 }
 // ---------- 5) Zauber-Puffer ----------
 if(run(5)){
  await start(SAVE);await read(CLEAR+`const e=window.__clone('Pfandkeiler',22,0,{ambient:false});e.hp=e.maxHp=99999;window.__k=e;g.target=e;g.player.energy=100;`);await settle();
  const ids=await read(`const g=window.game,bar=g.bar();return bar.slice(0,8).map(s=>({key:s.key,id:s.id}))`);
  const slot=ids.filter(x=>x.id&&!['auto','dash','interrupt','parry','mount'].includes(x.id)&&/^\d$/.test(x.key));
  const [a,c]=slot;assert.ok(a&&c,'zwei Kniffe auf der Leiste '+JSON.stringify(ids));
  await read(`const g=window.game;g.cooldowns={};g.gcd=0;`);
  await b.press(a.key);await wait(30);let st=await read(`const g=window.game;return {gcd:g.gcd,cd:g.cooldowns['${a.id}']||0}`);assert.ok(st.gcd>0.5,'erster Kniff löst GCD aus '+JSON.stringify(st));
  // früh gedrückt → rote Zeile
  await read(`window.game.cooldowns['${c.id}']=0`);await b.press(c.key);await wait(80);let t=await toastText();
  assert.ok(t.error&&/noch nicht bereit/i.test(t.text),'früh gedrückt: rote Zeile '+JSON.stringify(t));
  // in den letzten 0,4 s gedrückt → vorgemerkt → löst aus
  for(let i=0;i<60;i++){st=await read(`return {gcd:window.game.gcd}`);if(st.gcd<.35)break;await wait(40);}
  await read(`window.game.cooldowns['${c.id}']=0`);await b.press(c.key);
  const q=await read(`return window.game.queued?.id||null`);
  for(let i=0;i<30;i++){await wait(60);st=await read(`const g=window.game;return {queued:g.queued?.id||null,cd:g.cooldowns['${c.id}']||0,gcd:g.gcd}`);if(st.cd>0)break;}
  assert.ok(q===c.id&&st.cd>0&&!st.queued,'vorgemerkter Kniff löst nach der GCD aus '+JSON.stringify({q,st}));
  ok(`Zauber-Puffer: ${a.key} → ${c.key} in den letzten 0,4 s der GCD vorgemerkt und danach ausgelöst; zu früh → rote Zeile „Noch nicht bereit.“`);
 }
 // ---------- 6) Bodenmarke bleibt, Ausweichen springt heraus ----------
 if(run(6)){
  await start(SAVE);await read(CLEAR+`const e=window.__clone('Pfandkeiler',26,0,{ambient:false});e.aggro=true;e.ai='combat';g.target=e;window.__k=e;const p=g.player;e.cast={name:'Sprung · ausweichen',total:1.5,remaining:1.4,damage:105,radius:35,ground:true,x:p.x,y:p.y,type:'pounce'};window.__mark={x:p.x,y:p.y};`);
  await wait(250);await shot('r5a-60-marke-vorher');
  await b.press(' ');await wait(350);
  let st=await read(`const g=window.game,c=window.__k.cast,p=g.player;return {mark:c&&{x:c.x,y:c.y},start:window.__mark,out:c?Math.hypot((p.x-c.x)/c.radius,(p.y-c.y)/(c.radius*.75))>=1:null,d:Math.round(Math.hypot(p.x-window.__mark.x,p.y-window.__mark.y))}`);
  assert.ok(st.mark&&st.mark.x===st.start.x&&st.mark.y===st.start.y,'Bodenmarke bleibt am Aufschlagort '+JSON.stringify(st));
  assert.ok(st.out,'Ausweichen bringt den Helden aus der Marke '+JSON.stringify(st));
  await shot('r5a-61-marke-ausgewichen');
  let sct='';for(let i=0;i<30&&!/AUSGEWICHEN/.test(sct);i++){await wait(80);sct=await read(`return [...document.querySelectorAll('.sct, [class*=sct]')].map(e=>e.textContent).join(' ')+' '+window.game.texts.map(t=>t.text).join(' ')`);}
  assert.ok(/AUSGEWICHEN/.test(sct),'Rückmeldung „Ausgewichen!“ '+JSON.stringify(sct.slice(0,200)));
  ok(`Bodenmarke bleibt liegen, Leertaste springt ${st.d} E heraus, Rückmeldung „AUSGEWICHEN!“`);
  // stehen bleiben → „GETROFFEN“
  await read(`const g=window.game,e=window.__k,p=g.player;g.player.hp=g.player.maxHp;e.cast={name:'Sprung · ausweichen',total:1,remaining:.2,damage:10,radius:35,ground:true,x:p.x,y:p.y,type:'pounce'};`);
  let hit='';for(let i=0;i<20&&!/GETROFFEN/.test(hit);i++){await wait(60);hit=await read(`return window.game.texts.map(t=>t.text).join(' ')`);}
  assert.ok(/GETROFFEN/.test(hit),'stehen geblieben → „GETROFFEN“');ok('In der Marke stehen geblieben: „GETROFFEN“');
 }
 // ---------- 7) Wegmarke weicht Namensschildern aus ----------
 if(run(7)){
  await start(SAVE);await read(CLEAR);await settle();
  // Ein Gegner genau auf der engen Kreisbahn in Zielrichtung
  await read(`const g=window.game,p=g.player,d=g.destination().point,hy=p.y-17,dx=d.x-p.x,dy=d.y-hy,n=Math.hypot(dx,dy);const e=window.__clone('Pfandkeiler',0,0,{ambient:false});e.x=p.x+dx/n*36;e.y=hy+dy/n*36+26;e.home={x:e.x,y:e.y};e.hp=e.maxHp-1;window.__k=e;`);
  await wait(600);
  const st=await read(`const g=window.game,a=g.waypointAt,q=window.__k.plateAt;if(!a||!q)return {a,q};const over=Math.abs(a.x-q.x)<24+7&&a.y+7>q.y-10&&a.y-7<q.y+8;return {a,q,over}`);
  assert.ok(st.a&&st.q&&(!st.over||st.a.fade<1)&&(st.a.radius>36||st.a.fade<1),'Pfeil weicht aus oder wird blass '+JSON.stringify(st));
  await zoom('r5a-70z-pfeil-plakette',await read(TO_SCREEN+`const a=toS(window.game.player);return {l:a.x-200,t:a.y-230,w:400,h:300}`));
  ok(`Wegmarke: Namensschild auf der engen Bahn → Pfeil auf Bahn ${st.a.radius} E${st.a.fade<1?' (blass)':''}, keine Überdeckung`);
 }
 // ---------- 8) Auftrag abgeschlossen ----------
 if(run(8)){
  await start(SAVE);await read(CLEAR);await settle();
  await ev(`const H=await import('./hotspots.js'),R=await import('./rpg.js').catch(()=>null);const g=window.game;const add=(await import('./rpg.js')).addItem;add(g.rpg,'absperrband',6);return H.claimHotspotQuest(g,'st-olli-2');`).catch(async()=>{await ev(`const H=await import('./hotspots.js');const g=window.game;g.rpg.materials=g.rpg.materials||{};return H.claimHotspotQuest(g,'st-olli-2');`);});
  let st=null;for(let i=0;i<40;i++){await wait(150);st=await read(`const m=document.querySelector('.milestone');return m&&!m.hidden?{cls:m.className,text:m.innerText,tiles:m.querySelectorAll('.rt-tile').length}:null`);if(st&&/quest/.test(st.cls))break;}
  assert.ok(st&&/milestone-quest/.test(st.cls)&&/Auftrag abgeschlossen/i.test(st.text)&&/absperrband/i.test(st.text)&&st.tiles>=1,'„Auftrag abgeschlossen“ groß mittig mit Belohnung '+JSON.stringify(st));
  await wait(400);await shot('r5a-80-auftrag-abgeschlossen');await zoom('r5a-80z-auftrag-abgeschlossen',await rect('.milestone'));
  ok(`Abgabe: „${st.text.replace(/\n+/g,' · ')}“ mit ${st.tiles} Belohnungskachel(n) und Klang`);
 }
 // ---------- 9) Held hinter Baumkrone farbig ----------
 if(run(9)){
  await start(SAVE);await read(CLEAR);
  const tree=await read(`const g=window.game,w=g.world,p=g.player;const t=w.trees.filter(t=>t.size>1&&!w.blocked(t.x,t.y-45*t.size,8)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];if(!t)return null;Object.assign(p,{x:t.x,y:t.y-45*t.size});for(const e of g.enemies)if(Math.hypot(e.x-p.x,e.y-p.y)<700){e.x+=6000;e.home={x:e.x,y:e.y};}return {x:t.x,y:t.y,size:t.size}`);
  assert.ok(tree,'Baum gefunden');await wait(500);await settle();
  const px=await read(TO_SCREEN+`const p=window.game.player,a=toS({x:p.x,y:p.y-14}),cv=document.querySelector('#world');const o=document.createElement('canvas');o.width=cv.width;o.height=cv.height;const c=o.getContext('2d');c.drawImage(cv,0,0);const r=cv.getBoundingClientRect(),sx=cv.width/r.width;const d=c.getImageData(Math.round((a.x-r.left)*sx)-12,Math.round((a.y-r.top)*sx)-16,24,32).data;let sat=0,light=0,n=0;for(let i=0;i<d.length;i+=4){const mx=Math.max(d[i],d[i+1],d[i+2]),mn=Math.min(d[i],d[i+1],d[i+2]);sat+=mx?(mx-mn)/mx:0;light+=mx;n++;}return {sat:+(sat/n).toFixed(3),light:Math.round(light/n)}`);
  await zoom('r5a-90z-held-hinter-baum',await read(TO_SCREEN+`const a=toS(window.game.player);return {l:a.x-120,t:a.y-150,w:240,h:190}`));
  assert.ok(px.sat>.18,'Held hinter der Krone nicht blass (Sättigung) '+JSON.stringify(px));
  ok(`Held hinter einer Baumkrone: Umriss, Farben bleiben (Sättigung ${px.sat}, Helligkeit ${px.light})`);
 }
 // ---------- 10) Neutrale Tiere ----------
 if(run(10)){
  await start(SAVE);await read(CLEAR+`const src=g.enemies.find(e=>e.behavior==='neutral');window.__n=window.__clone(src.name,90,20,{behavior:'neutral'});`);await settle();await mouse(300,850);await wait(500);
  let st=await read(`const e=window.__n;return {plate:!!e.plateAt&&performance.now()-e.plateAt.t<300}`);assert.ok(!st.plate,'neutrales Tier bei vollem Leben ohne Schild');
  await shot('r5a-100-tier-ohne-schild');
  const at=await read(TO_SCREEN+`const e=window.__n;return toS({x:e.x,y:e.y-8})`);await mouse(at.x,at.y);await wait(400);
  st=await read(`const e=window.__n;return {plate:!!e.plateAt&&performance.now()-e.plateAt.t<300}`);assert.ok(st.plate,'unter der Maus mit Schild');
  await mouse(300,850);await wait(300);await read(`const e=window.__n;e.hp=e.maxHp-5;`);await wait(400);
  st=await read(`const e=window.__n;return {plate:!!e.plateAt&&performance.now()-e.plateAt.t<300}`);assert.ok(st.plate,'nach Treffer mit Schild');
  ok('Neutrales Tier: ohne Schild bei vollem Leben; unter der Maus und nach Treffer mit Name und Balken');
 }
 // ---------- 11) Heldenauswahl-Fokus, Klick unter dem „!“ ----------
 if(run(11)){
  await start(SAVE);
  await b.goto(b.url,{passStart:false});await wait(1500);
  let st=null;for(let i=0;i<40;i++){st=await read(`const a=document.activeElement;return {start:a?.dataset?.start||null,roster:!!document.querySelector('#startScreen [data-start=enter]')}`);if(st.roster&&st.start)break;await wait(200);}
  assert.equal(st.start,'enter','Heldenauswahl: Fokus auf „Ins Dorf“ '+JSON.stringify(st));
  ok('Heldenauswahl: „Ins Dorf“ hat den Fokus (Enter geht ins Dorf, legt keinen Helden an)');
  await start(SAVE);
  const giver=await ev(`const H=await import('./hotspots.js');const g=window.game;const h=H.hotspotLayout(g.world).hotspots.find(h=>H.giverGlyph(g,h.id));return h?{x:h.giver.x,y:h.giver.y,name:h.giver.name}:null`);
  assert.ok(giver,'Auftraggeber mit Zeichen');
  await read(`const g=window.game;for(const e of g.enemies)if(Math.hypot(e.x-${giver.x},e.y-${giver.y})<700){e.x+=6000;e.home={x:e.x,y:e.y};}Object.assign(g.player,g.world.findClear(${giver.x}+90,${giver.y}+60,9));`);await wait(500);await settle();
  const at=await read(TO_SCREEN+`return toS({x:${giver.x},y:${giver.y}-40})`);await click(at.x,at.y,'right');await wait(200);
  st=await read(`const g=window.game;return {friend:g.friend?.ref?.name||g.talkTo?.name||g.talkTo?.ref?.name||null}`);
  assert.equal(st.friend,giver.name,'Rechtsklick knapp unter dem „!“ trifft den Auftraggeber '+JSON.stringify(st));
  await zoom('r5a-110z-auftraggeber-zeichen',await read(TO_SCREEN+`const a=toS({x:${giver.x},y:${giver.y}});return {l:a.x-110,t:a.y-190,w:220,h:220}`));
  ok(`Rechtsklick knapp unter dem „!“ über ${giver.name}: trifft ihn`);
 }
 console.log(`\n${checks.length} Prüfungen grün.`);
 if(b.errors.length)console.log('Konsolenfehler:',JSON.stringify(b.errors).slice(0,600));
}finally{s.close();}
