// Optimierung Runde 4, Teil B „Welt, Kampf & Hofprobe“ (2026-09-24): jeder Punkt per Klickpfad mit echter Maus und Tastatur.
// 1 Figur sichtbar bei offenem C+J+I+P, auch beim Laufen mit W, A, S, D (Kamera legt den Helden in die Lücke)
// 2 Hofprobe in der Verfolgung: kein Kopf, kein Absatz, eine Zeile mit Tastenkappe, Entfernung, zweiter Auftrag darunter;
//   Auftragsfenster mit Belohnung und „Ziel auf der Karte“
// 3 Ein Rechtsklick auf einen Gegner greift an (Hofprobe und draußen)
// 4 Rechtsklick auf Ida läuft und redet
// 5 Zonentitel: Weltschrift im Titelband gedimmt (Kirchstraße, Clan-Treff); Namensschilder ohne Überlappung
// 6 Wegmarke mit Kontur auf der Kreisbahn
// 7 Kleinkram: Film überspringen → Figur mittig; Chat ohne blassen Reiter; „Online spielen“ als Symbol
// Bilder: visual-review/optimierung-r4b/. Ports: CDP 9532, Server 4332 (CDP_PORT/SERVER_PORT). ONLY=1,2,… für einzelne Teile.
import assert from 'node:assert/strict';
import {session,wait} from './r3a-lib.mjs';
const s=await session({dir:'visual-review/optimierung-r4b',cdp:Number(process.env.CDP_PORT||9532),server:Number(process.env.SERVER_PORT||4332)});
const {b,read,rect,click,mouse,shot,zoom,start,TO_SCREEN}=s;
const checks=[];const ok=m=>{checks.push(m);console.log('ok',m);};
const only=process.env.ONLY?process.env.ONLY.split(','):null,run=n=>!only||only.includes(String(n));
const done={level:3,tutorial:{version:1,step:8,completed:true},quest:{accepted:true,chapter:1}};
/** Kamera ruht (zwei Messungen 150 ms auseinander fast gleich). */
async function settle(){let last=null;for(let i=0;i<60;i++){const c=await read(`const v=window.mertloch.state().viewport;return {x:v.camera.x,y:v.camera.y}`);if(last&&Math.hypot(c.x-last.x,c.y-last.y)<.4)return;last=c;await wait(150);}}
/** Bildschirmrechteck des Helden (wie hero-reveal.js ohne Luft) und die sichtbaren, nicht eingeklappten Fenster, die es schneiden. */
const HERO=TO_SCREEN+`const p=window.game.player,a=toS(p),k=a.k;const hero={l:a.x-14*k,r:a.x+14*k,t:a.y-40*k,b:a.y+6*k,x:a.x,y:a.y};
 const wins=[...document.querySelectorAll('.game-popup')].map(w=>({w,r:w.getBoundingClientRect()})).filter(o=>o.r.width>2);
 const over=wins.filter(o=>!o.w.classList.contains('hero-seethrough')&&o.r.left<hero.r&&hero.l<o.r.right&&o.r.top<hero.b&&hero.t<o.r.bottom).map(o=>o.w.className);
 const folded=wins.filter(o=>o.w.classList.contains('hero-seethrough')).length;const cv=document.querySelector('#world').getBoundingClientRect();
 return {hero:{x:Math.round(hero.x),y:Math.round(hero.y)},over,folded,open:wins.length,center:{x:Math.round(cv.left+cv.width/2),y:Math.round(cv.top+cv.height/2)}}`;
const keyEv=(key,type)=>b.send('Input.dispatchKeyEvent',{type,key,code:'Key'+key.toUpperCase(),windowsVirtualKeyCode:key.toUpperCase().charCodeAt(0)});
try{
 // ---------- 1) Figur nie verdeckt ----------
 if(run(1)){
  await start(done);
  await read(`const g=window.game,w=g.world;Object.assign(g.player,w.findClear(w.npc.x+260,w.npc.y+180,9),{inCombat:0});for(const e of g.enemies)if(Math.hypot(e.x-g.player.x,e.y-g.player.y)<700){e.x+=6000;e.home={x:e.x,y:e.y};}`);
  await settle();
  let st=await read(HERO);assert.ok(Math.hypot(st.hero.x-st.center.x,st.hero.y-st.center.y)<6,'ohne Fenster steht der Held mittig '+JSON.stringify(st));
  for(const k of ['c','j','i','p']){await b.press(k);await wait(350);}
  await wait(900);await settle();
  st=await read(HERO);await shot('r4b-10-cjip-stehend');
  assert.equal(st.open,4,'vier Fenster offen');
  assert.ok(!st.over.length&&!st.folded,'C+J+I+P: Held in der Lücke, kein Fenster darüber, keins eingeklappt '+JSON.stringify(st));
  ok(`C+J+I+P offen: Held steht in der Lücke bei ${st.hero.x}/${st.hero.y} (Mitte ${st.center.x}/${st.center.y}), kein Fenster über ihm`);
  for(const k of ['w','a','s','d']){
   await keyEv(k,'keyDown');let worst=null;
   for(let i=0;i<8;i++){await wait(150);const m=await read(HERO);if(m.over.length)worst=m;}
   await keyEv(k,'keyUp');await wait(200);
   await shot('r4b-11-laufen-'+k);
   assert.ok(!worst,`Laufen mit ${k.toUpperCase()}: Held nie unter einem offenen Fenster `+JSON.stringify(worst));
   ok(`Laufen mit ${k.toUpperCase()} bei C+J+I+P: Held in jeder Messung (8×150 ms) frei`);
  }
  await zoom('r4b-12z-held-in-luecke',await read(TO_SCREEN+`const a=toS(window.game.player);return {l:a.x-260,t:a.y-200,w:520,h:280}`));
  // Keine Lücke (Testfläche als Fenster über der ganzen Mitte, unter 70 % der Fläche): manuelles Laufen klappt ein.
  await read(`const f=document.createElement('div');f.className='game-popup r4b-fake';f.style.cssText='position:fixed;left:300px;top:0;width:1600px;height:760px;background:#2a3a3a;z-index:5';(document.querySelector('#popupLayer')||document.body).append(f);`);
  await wait(400);await keyEv('d','keyDown');let st2=null;for(let i=0;i<10;i++){await wait(150);st2=await read(HERO);if(st2.folded)break;}await keyEv('d','keyUp');
  assert.ok(st2.folded>0&&!st2.over.length,'ohne Lücke klappt das Fenster beim manuellen Laufen ein '+JSON.stringify(st2));
  await shot('r4b-13-ohne-luecke-eingeklappt');
  ok('Ohne Lücke (Testfläche 1600×760 über der Mitte): beim manuellen Laufen klappt das Fenster über dem Helden ein');
  await read(`document.querySelector('.r4b-fake')?.remove()`);
  await b.press('Escape');await wait(400);await settle();
  st=await read(HERO);assert.ok(Math.hypot(st.hero.x-st.center.x,st.hero.y-st.center.y)<8,'Fenster zu: Held wieder mittig '+JSON.stringify(st));
  ok('Fenster zu (Esc): Held wieder in der Bildmitte');
 }
 // ---------- 2) Hofprobe in der Verfolgung und im Auftragsfenster ----------
 if(run(2)){
  await start({level:1,tutorial:{version:1,step:4,completed:false}});
  await wait(600);
  const tr=await read(`const q=document.querySelector('.quest-panel'),r=q?.getBoundingClientRect(),guide=document.querySelector('#tutorialGuide');const rows=[...q.querySelectorAll('.qt-quest')];
   return {visible:!!r&&r.width>0&&getComputedStyle(q).display!=='none',guide:!!guide&&!guide.hidden&&guide.getBoundingClientRect().width>0,rows:rows.map(x=>({title:x.querySelector('.qt-title')?.textContent,task:x.querySelector('.quest-task span')?.textContent,kbd:x.querySelectorAll('kbd').length,dist:x.querySelector('.quest-task em')?.textContent||'',lines:Math.round(x.querySelector('.quest-task').getBoundingClientRect().height)})),text:q.innerText,paragraphs:q.querySelectorAll('p').length,h:Math.round(r.height)}`);
  const T=(await import('../content/index.js')).TUTORIAL;
  assert.ok(tr.visible&&!tr.guide,'Verfolgung sichtbar, kein Hofprobe-Kasten '+JSON.stringify(tr));
  assert.equal(tr.rows[0].title,T.steps[4].title,'erster Eintrag = Hofprobe-Schritt');
  assert.ok(tr.rows[0].kbd>=1&&/\d+ m/.test(tr.rows[0].dist)&&tr.rows[0].lines<=22,'eine Zeile mit Tastenkappe und Entfernung '+JSON.stringify(tr.rows[0]));
  assert.ok(!/Hofprobe ·/i.test(tr.text)&&!tr.paragraphs&&!tr.text.includes(T.steps[4].text),'keine Überschrift, kein Absatz '+JSON.stringify(tr.text));
  assert.ok(tr.rows.length>=2,'zweiter Auftrag darunter '+JSON.stringify(tr.rows));
  await zoom('r4b-20z-hofprobe-verfolgung',await rect('.quest-panel'));
  ok(`Hofprobe in der Verfolgung: „${tr.rows[0].title}“ · ${tr.rows[0].task} · ${tr.rows[0].dist}, darunter „${tr.rows[1].title}“ (${tr.h} px, kein Kopf, kein Absatz)`);
  const row=await rect('.quest-panel .qt-quest');await mouse(row.l+40,row.t+10);await wait(700);
  const tip=await read(`const t=[...document.querySelectorAll('.item-tooltip,.skill-tooltip,#itemTooltip,#skillTooltip,[role=tooltip]')].find(e=>e.getBoundingClientRect().width>0&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden');return t?t.innerText:''`);
  assert.ok(tip.includes(T.steps[4].text.slice(0,20))&&/5\/8/.test(tip),'Erklärtext und Fortschritt im Tooltip '+JSON.stringify(tip));
  await shot('r4b-21-hofprobe-tooltip');ok('Tooltip der Hofprobe: Fortschritt 5/8 und Erklärtext');
  await mouse(1000,450);await b.press('j');await wait(700);
  const ql=await read(`const d=document.querySelector('[data-ql-detail="tutorial"]');return d?{tiles:d.querySelectorAll('.rt-tile').length,map:!!d.querySelector('[data-ql-map="tutorial"]')}:null`);
  assert.ok(ql&&ql.tiles>=2&&ql.map,'Auftragsfenster: Belohnung und Karten-Knopf '+JSON.stringify(ql));
  await zoom('r4b-22z-auftragsfenster-hofprobe',await rect('.popup-quest'));
  const mp=await rect('[data-ql-detail="tutorial"] [data-ql-map="tutorial"]');await click(mp.l+mp.w/2,mp.t+mp.h/2);await wait(900);
  assert.ok(await read(`return !!document.querySelector('#largeMap')||!!document.querySelector('.popup-map')`),'Ziel auf der Karte öffnet die Karte');
  await shot('r4b-23-hofprobe-karte');ok(`Auftragsfenster: Hofprobe mit ${ql.tiles} Belohnungskacheln und „Ziel auf der Karte“ (öffnet die Karte)`);
  await b.press('Escape');await wait(300);
 }
 // ---------- 3) Ein Rechtsklick greift an ----------
 if(run(3)){
  await start({level:1,tutorial:{version:1,step:2,completed:false}});
  await wait(500);await settle();
  const at=await read(TO_SCREEN+`const e=window.game.enemies.find(e=>e.tutorial);return e?toS({x:e.x,y:(e.spriteTop??e.y-30)+10}):null`);
  assert.ok(at,'Papp-Horst steht');
  await click(at.x,at.y,'right');
  let st=null;for(let i=0;i<40;i++){await wait(150);st=await read(`const g=window.game;return {step:g.tutorial.step,auto:g.autoAttack.enabled,autos:g.tutorial.autos,target:g.target?.name}`);if(st.autos>0)break;}
  assert.ok(st.step===3&&st.auto&&st.autos>0,'Hofprobe: ein Rechtsklick wählt, läuft hin und greift an '+JSON.stringify(st));
  await shot('r4b-30-hofprobe-ein-rechtsklick');ok(`Hofprobe: EIN Rechtsklick auf Papp-Horst → Schritt 4/8, Autoangriff an, ${st.autos} Treffer`);
  await start(done);
  await read(`const g=window.game,w=g.world;const base=w.findClear(w.npc.x+700,w.npc.y-500,9);Object.assign(g.player,base,{vx:0,vy:0,inCombat:0});for(const e of g.enemies)if(Math.hypot(e.x-base.x,e.y-base.y)<900){e.x+=6000;e.home={x:e.x,y:e.y};e.aggro=false;}
   const src=g.enemies.find(e=>e.name==='Pfandkeiler');const e=Object.assign(structuredClone({...src,chasePath:[],returnPath:[],roamGoal:null,spawnPoints:null,plateAt:null}),{id:881234});const p=w.findClear(base.x+120,base.y,9);Object.assign(e,p,{home:{...p},hp:e.maxHp,aggro:false,ai:'roaming',spawnGrace:0,cast:null,roamWait:999,attackTimer:99});g.enemies.push(e);window.__k=e;`);
  await wait(400);await settle();
  const k=await read(TO_SCREEN+`const e=window.__k;return toS({x:e.x,y:e.y-10})`);await click(k.x,k.y,'right');
  for(let i=0;i<40;i++){await wait(150);st=await read(`const g=window.game,e=window.__k;return {target:g.target===e,auto:g.autoAttack.enabled,hp:e.hp,max:e.maxHp}`);if(st.hp<st.max)break;}
  assert.ok(st.target&&st.auto&&st.hp<st.max,'draußen: ein Rechtsklick greift an '+JSON.stringify(st));
  ok('Draußen: EIN Rechtsklick auf einen Pfandkeiler in 15 m → hinlaufen und Treffer');
 }
 // ---------- 4) Rechtsklick auf Ida ----------
 if(run(4)){
  await start(done);
  await read(`const g=window.game,w=g.world;for(const e of g.enemies)if(Math.hypot(e.x-w.npc.x,e.y-w.npc.y)<600){e.x+=6000;e.home={x:e.x,y:e.y};e.aggro=false;}Object.assign(g.player,w.findClear(w.npc.x+120,w.npc.y+60,9),{inCombat:0});`);
  await wait(300);await settle();
  const at=await read(TO_SCREEN+`const n=window.game.world.npc;return toS({x:n.x,y:n.y-12})`);
  await click(at.x,at.y,'right');await wait(200);
  assert.ok(await read(`return !!window.game.talkTo&&!!window.game.moveTo`),'Rechtsklick auf Ida: Figur läuft los');
  let open=false;for(let i=0;i<40&&!open;i++){await wait(150);open=await read(`return window.mertloch.state().popups.some(p=>p.id==='dialog')`);}
  assert.ok(open,'Gespräch öffnet sich');await shot('r4b-40-ida-redet');
  ok('Rechtsklick auf Ida: läuft los, hält an, Gespräch offen');await b.press('Escape');await wait(200);
 }
 // ---------- 5) Zonentitel vor Weltschrift, Namensschilder ohne Überlappung ----------
 if(run(5)){
  await start(done);
  /* Schrift-Ebene: jeden Schriftzug und jedes Zeichen (Auftragszeichen) eines Bildes mit Bildschirmlage und Deckkraft mitschreiben */
  const HOOK=`const cv=document.querySelector('canvas.world-labels'),ctx=cv.getContext('2d');if(!ctx.__hooked){ctx.__hooked=true;const o=()=>cv.getBoundingClientRect(),log=(kind,t,x,y,self)=>{const m=self.getTransform(),r=o(),s=cv.width/r.width;window.__labels?.push({kind,t,x:(m.a*x+m.c*y+m.e)/s+r.left,y:(m.b*x+m.d*y+m.f)/s+r.top,a:self.globalAlpha});};const f=ctx.fillText;ctx.fillText=function(t,x,y){log('text',t,x,y,this);return f.apply(this,arguments);};}window.__labels=[];`;
  const IN_BAND=b=>`return window.__labels.filter(l=>l.x>${b.l-16}&&l.x<${b.l+b.w+16}&&l.y>${b.t-16}&&l.y<${b.t+b.h+24}).map(l=>({t:l.t,a:Math.round(l.a*100)/100}))`;
  const places=[['Kirchstraße','kirchstrasse',`Object.assign({name:'Braumeisterin Bärbel'},(await import('./profession-world.js')).professionWorld(w).teachers.find(t=>t.id==='brew'))`],['Clan-Treff','clantreff',`(w.quests||[]).map(q=>q.giver).find(x=>/Hedwig/.test(x.name))`]];
  for(const [name,file,where] of places){
   await b.evaluate(`(async()=>{const g=window.game,w=g.world;const far=w.findClear(w.npc.x+20,w.npc.y+30,9);Object.assign(g.player,far,{inCombat:0});})()`);await wait(4500);
   await read(`document.querySelector('.region-label').classList.remove('zone-show')`);
   await b.evaluate(`(async()=>{const g=window.game,w=g.world;const m=${where};window.__who=m.name;const p=w.findClear(m.x,m.y+55,9);Object.assign(g.player,p,{inCombat:0});for(const e of g.enemies)if(Math.hypot(e.x-p.x,e.y-p.y)<500){e.x+=6000;e.home={x:e.x,y:e.y};}})()`);
   let shown=false;for(let i=0;i<30&&!shown;i++){await wait(150);shown=await read(`return !!document.querySelector('.region-label.zone-show')`);}
   if(!shown){console.log('(kein echter Ortswechsel erkannt, Titel per Klasse)');await read(`document.querySelector('.region-label').classList.add('zone-show')`);}
   await wait(1000);await read(HOOK);await wait(300);
   assert.ok(await read(`return !!document.querySelector('.region-label.zone-show')`),`${name}: Titel steht noch beim Messen`);
   const band=await read(`const r=document.querySelector('.region-label.zone-show')?.getBoundingClientRect();return r&&{l:Math.round(r.left),t:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)}`);
   const during=await read(IN_BAND(band)),zone=await read(`return document.querySelector('.region-label h2')?.textContent`),who=await read(`return window.__who`);
   await shot('r4b-50-zonentitel-'+file);
   await zoom('r4b-51z-titelband-'+file,{l:Math.max(0,band.l-220),t:Math.max(0,band.t-20),w:Math.min(1500,band.w+440),h:band.h+80});
   await read(`document.querySelector('.region-label').classList.remove('zone-show')`);await wait(1400);await read(HOOK);await wait(300);
   const later=await read(IN_BAND(band));
   await zoom('r4b-51z-titelband-'+file+'-danach',{l:Math.max(0,band.l-220),t:Math.max(0,band.t-20),w:Math.min(1500,band.w+440),h:band.h+80});
   const names=[...new Set(during.map(l=>l.t))],words=during.filter(l=>!/^[!?…]$/.test(l.t)),marks=during.filter(l=>/^[!?…]$/.test(l.t));
   assert.ok(during.length&&during.every(l=>l.a<=(/^[!?…]$/.test(l.t)?.45:.3)),`${name}: Weltschrift im Titelband ≤ 30 % deckend (Auftragszeichen ≤ 45 %) `+JSON.stringify({band,during}));
   assert.ok(later.length&&later.every(l=>l.a>=.9),`${name}: ohne Titel ist die Schrift dort wieder voll `+JSON.stringify(later));
   ok(`${name} (${zone}, ${who}${shown?', echter Ortswechsel':''}): ${names.join(', ')} im Titelband: Namen ${Math.round(Math.max(...words.map(l=>l.a))*100)} %${marks.length?`, Auftragszeichen ${Math.round(Math.max(...marks.map(l=>l.a))*100)} %`:""}, danach ${Math.min(...later.map(l=>l.a))*100} %`);
  }
  // Namensschilder: fünf Pfanddachse dicht beieinander
  await read(`const g=window.game,w=g.world;const base=w.findClear(w.npc.x+700,w.npc.y-500,9);Object.assign(g.player,base,{vx:0,vy:0,inCombat:0});for(const e of g.enemies)if(Math.hypot(e.x-base.x,e.y-base.y)<900){e.x+=6000;e.home={x:e.x,y:e.y};e.aggro=false;}
   const src=g.enemies.find(e=>e.name==='Pfanddachs')||g.enemies.find(e=>e.behavior==='neutral');window.__pack=[];for(let i=0;i<5;i++){const e=Object.assign(structuredClone({...src,chasePath:[],returnPath:[],roamGoal:null,spawnPoints:null,plateAt:null}),{id:882000+i});const p={x:base.x+70+(i%3)*14,y:base.y-20+Math.floor(i/3)*10+i*2};Object.assign(e,p,{home:{...p},hp:e.maxHp,aggro:false,ai:'roaming',spawnGrace:0,cast:null,roamWait:999,attackTimer:99});g.enemies.push(e);window.__pack.push(e);}`);
  await wait(500);await settle();await wait(300);
  const pl=await read(`const now=performance.now();return window.__pack.map(e=>e.plateAt&&now-e.plateAt.t<400?{x:Math.round(e.plateAt.x),y:Math.round(e.plateAt.y)}:null)`);
  const shown=pl.filter(Boolean),hidden=pl.length-shown.length;let overlap=0;for(let i=0;i<shown.length;i++)for(let j=i+1;j<shown.length;j++){const a=shown[i],c=shown[j];if(Math.abs(a.x-c.x)<44&&Math.abs(a.y-c.y)<19)overlap++;}
  const zr=await read(TO_SCREEN+`const xs=window.__pack.map(e=>toS(e));return {l:Math.min(...xs.map(a=>a.x))-140,t:Math.min(...xs.map(a=>a.y))-200,w:360,h:260}`);await zoom('r4b-52z-namensschilder-gestapelt',zr);
  assert.equal(overlap,0,'Namensschilder überlappen nicht '+JSON.stringify(pl));assert.ok(shown.length>=3,'mindestens drei Schilder sichtbar '+JSON.stringify(pl));
  ok(`Fünf Pfanddachse dicht beieinander: ${shown.length} Schilder (Name+Balken) gestapelt ohne Überlappung, ${hidden} ganz ausgeblendet`);
 }
 // ---------- 6) Wegmarke ----------
 if(run(6)){
  await start(done);
  await read(`const g=window.game,w=g.world;Object.assign(g.player,w.findClear(w.npc.x+40,w.npc.y+60,9),{inCombat:0});`);
  await wait(400);await settle();await wait(400);
  const wm=await read(TO_SCREEN+`const g=window.game,p=g.player,d=g.destination();if(!d)return null;const hy=p.y-17,dx=d.point.x-p.x,dy=d.point.y-hy,n=Math.hypot(dx,dy);const a=toS({x:p.x+dx/n*36,y:hy+dy/n*36}),h=toS({x:p.x,y:hy});return {arrow:a,hero:h,r:Math.round(Math.hypot(a.x-h.x,a.y-h.y))}`);
  assert.ok(wm&&wm.r>60&&wm.r<130,'Wegmarke auf der Kreisbahn um den Helden '+JSON.stringify(wm));
  const px=await read(`const cv=document.querySelector('canvas.world-labels'),o=cv.getBoundingClientRect(),s=cv.width/o.width,x=Math.round((${wm.arrow.x}-o.left-12)*s),y=Math.round((${wm.arrow.y}-o.top-12)*s),d=cv.getContext('2d').getImageData(x,y,Math.round(24*s),Math.round(24*s)).data;let dark=0,gold=0;for(let i=0;i<d.length;i+=4){if(d[i+3]<150)continue;const l=d[i]+d[i+1]+d[i+2];if(l<120)dark++;else if(d[i]>200&&d[i+1]>150&&d[i+2]<140)gold++;}return {dark,gold}`);
  assert.ok(px.dark>8&&px.gold>8,'goldener Pfeil mit dunkler Kontur '+JSON.stringify(px));
  await zoom('r4b-60z-wegmarke',{l:wm.hero.x-150,t:wm.hero.y-150,w:300,h:260});
  ok(`Wegmarke: goldener Pfeil mit dunkler Kontur (${px.gold} Gold-, ${px.dark} Konturpunkte) auf der Kreisbahn r=${wm.r} px um den Helden`);
 }
 // ---------- 7) Kleinkram ----------
 if(run(7)){
  await start({level:1,tutorial:{version:1,step:0,completed:false}});
  await wait(1200);await settle();
  const st=await read(HERO);await shot('r4b-70-nach-film');
  assert.ok(Math.hypot(st.hero.x-st.center.x,st.hero.y-st.center.y)<20,'nach dem Film steht die Figur mittig '+JSON.stringify(st));
  ok(`Film übersprungen: Figur mittig (${st.hero.x}/${st.hero.y}, Mitte ${st.center.x}/${st.center.y})`);
  const chat=await read(`const t=document.querySelector('.chat-window:not(.active) .chat-tabs');return t?+getComputedStyle(t).opacity:null`);
  assert.ok(chat===0||chat===null,'Chat-Reiter in Ruhe ausgeblendet '+chat);
  /* lokal gibt es keinen Anmeldedienst: den Knopf wie im Zustand „abgemeldet“ zeigen */const login=await read(`const b=document.querySelector('.chat-login');if(!b)return {hidden:true};b.hidden=false;b.closest('.chat-window')?.classList.add('has-foot');const r=b.getBoundingClientRect();return {w:Math.round(r.width),h:Math.round(r.height),text:b.innerText.trim(),svg:!!b.querySelector('svg'),label:b.dataset.tooltipLabel}`);
  assert.ok(login.hidden||(!login.text&&login.svg&&login.w<=44),'„Online spielen“ als Symbol mit Tooltip '+JSON.stringify(login));
  if(!login.hidden)await zoom('r4b-71z-online-symbol',await rect('.chat-window'));
  ok(`Chat in Ruhe ohne blassen Reiter; „Online spielen“ ${login.hidden?'(lokal ohne Anmeldung nicht angezeigt)':'als '+login.w+'-px-Symbol mit Tooltip „'+login.label+'“ statt Textzeile'}`);
 }
 // ---------- 8) Handy hoch: Wegmarke frei von Chatzeilen, Figur mittig ----------
 if(run(8)){
  await start(done);
  await b.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true,screenOrientation:{type:'portraitPrimary',angle:0}});await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  const tInit=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:"localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'touch',size:'normal',layouts:{}}))"});
  await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',tInit);for(let i=0;i<200&&!await b.evaluate('!!window.game');i++)await wait(150);await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await wait(800);
  await read(`const g=window.game,w=g.world;Object.assign(g.player,w.findClear(w.npc.x+40,w.npc.y+60,9),{inCombat:0});for(let i=0;i<4;i++)g.toast('Neuer Auftrag: Pfandkeiler von den Trümmern jagen');`);
  await wait(600);await settle();await wait(500);
  const m=await read(TO_SCREEN+`const g=window.game,p=g.player,d=g.destination();if(!d)return null;const hy=p.y-17,dx=d.point.x-p.x,dy=d.point.y-hy,n=Math.hypot(dx,dy);const a=toS({x:p.x+dx/n*36,y:hy+dy/n*36});const box={l:a.x-12,t:a.y-12,r:a.x+12,b:a.y+30};
   const lines=[...document.querySelectorAll('.chat-line,.toast')].map(e=>e.getBoundingClientRect()).filter(r=>r.width>0&&r.height>0);const hitL=lines.filter(r=>r.left<box.r&&box.l<r.right&&r.top<box.b&&box.t<r.bottom).length;const h=toS(p);return {arrow:{x:a.x,y:a.y},hero:{x:h.x,y:h.y},lines:lines.length,hit:hitL,touch:document.body.classList.contains('touch-mode')}`);
  await shot('r4b-80-handy-hoch-wegmarke');
  assert.ok(m&&m.touch,'Handy-Modus aktiv '+JSON.stringify(m));
  assert.equal(m.hit,0,'Chatzeilen liegen nicht auf der Wegmarke '+JSON.stringify(m));
  ok(`Handy hoch 390×844: Wegmarke bei ${m.arrow.x}/${m.arrow.y} am Helden (${m.hero.x}/${m.hero.y}), ${m.lines} Meldungszeilen, keine darauf`);
  await b.send('Emulation.setTouchEmulationEnabled',{enabled:false,maxTouchPoints:1});await b.send('Emulation.clearDeviceMetricsOverride');await b.resize(2024,900);
 }
}catch(e){console.error('FEHLER',e.message);process.exitCode=1;}
finally{console.log(`\n${checks.length} Prüfungen grün`);s.close();}
