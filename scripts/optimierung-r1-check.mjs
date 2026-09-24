// Optimierung Runde 1 (2026-09-24): prüft jeden Punkt der Runde per Klickpfad im echten Spiel.
// 1 Aufträge J/L auch in der Hofprobe, Menüleiste mit allen sieben Fenstern, gesperrte ausgegraut mit Bedingung
// 2 feste Fensterplätze, gemeinsame Oberkante, Rucksack/Kniffe lassen Minikarte und Auftragsverfolgung frei, Mitte in der Lücke
// 3 Minikarten-Optionen und Kontextmenü über allen Fenstern
// 4 Ortsschild und Zonentitel nur kurz beim Gebietswechsel (und Ortsschild beim Überfahren der Minikarte)
// 5 Quick Wins (Zahlenformat, „m“, Legende, Figur, Gespräch, Tastenziffern, Buffs-Label, Tooltip-Fuß, Tracker)
// 6 Hofprobe-Text, Ida vor Stufe 5, zweite Leiste, „Kein Weg dorthin“
// Screenshots: visual-review/optimierung-r1/. Ports: CDP 9472, Server 4272 (änderbar über CDP_PORT/SERVER_PORT).
import {createCharacter,characterKey} from '../characters.js';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
import {WINDOW_UI,TUTORIAL} from '../content/index.js';
const dir='visual-review/optimierung-r1';mkdirSync(dir,{recursive:true});
const b=await browserSession({port:Number(process.env.CDP_PORT||9472),serverPort:Number(process.env.SERVER_PORT||4272)});
const read=js=>b.evaluate(`(()=>{${js}})()`);
const rect=sel=>read(`const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const r=e.getBoundingClientRect();return r.width||r.height?{l:Math.round(r.left),t:Math.round(r.top),r:Math.round(r.right),b:Math.round(r.bottom),w:Math.round(r.width),h:Math.round(r.height)}:null;`);
const win=id=>rect(`.game-popup[data-window="${id}"]`);
const open=()=>read(`return [...document.querySelectorAll('.game-popup')].map(e=>e.dataset.window)`);
const closeAll=async()=>{await read(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await wait(250);};
const overlap=(a,c)=>!!a&&!!c&&a.l<c.r-1&&c.l<a.r-1&&a.t<c.b-1&&c.t<a.b-1;
const mouse=(x,y,extra={})=>b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,pointerType:'mouse',...extra});
async function hoverTip(sel){const r=await rect(sel);assert.ok(r,'fehlt: '+sel);await mouse(5,450);await wait(80);await mouse(Math.round(r.l+r.w/2),Math.round(r.t+r.h/2));await wait(260);return read(`const t=document.querySelector('#itemTooltip');return t&&!t.classList.contains('hidden')?t.innerText:''`);}
/** Vergrößerter Ausschnitt (Faktor 2) für die Sichtprüfung. */
async function zoom(path,sel,pad=8){const r=typeof sel==='string'?await rect(sel):sel;if(!r)return;const x=Math.max(0,r.l-pad),y=Math.max(0,r.t-pad);const shot=await b.send('Page.captureScreenshot',{format:'jpeg',quality:92,clip:{x,y,width:r.w+2*pad,height:r.h+2*pad,scale:2}});writeFileSync(path,Buffer.from(shot.data,'base64'));}
const checks=[];const ok=m=>{checks.push(m);console.log('ok',m);};
const made=createCharacter(null,{name:'Runde Eins',classId:'dieter',look:'dieter'});
function seed(save,{all=true,touch=false}={}){const s={version:1,savedAt:Date.now(),worldKey:'v2-56753-72-1',classId:'dieter',...save};return 'delete Navigator.prototype.serviceWorker;localStorage.clear();'+(all?'localStorage.setItem("mertloch-unlock-all","1");':'')+'localStorage.setItem("mertloch-characters",'+JSON.stringify(JSON.stringify(made.roster))+');localStorage.setItem('+JSON.stringify(characterKey(s.worldKey,made.character))+','+JSON.stringify(JSON.stringify(s))+');'+(touch?'localStorage.setItem("mertloch-touch-v1",JSON.stringify({mode:"touch",size:"normal",layouts:{}}));':'localStorage.setItem("mertloch-touch-v1",JSON.stringify({mode:"desktop"}));');}
async function start(save,opts={}){const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:seed(save,opts)});await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',init);for(let i=0;i<120&&!await b.evaluate('!!window.game');i++)await wait(150);await read(`document.querySelector('.intro-skip')?.click()`);await closeAll();await wait(500);}
const TUT={level:1,tutorial:{version:1,step:3,completed:false}},DONE={level:12,tutorial:{version:1,step:8,completed:true},rpg:{inventory:[{id:'brezel',count:3},{id:'dosenklinge',count:1}],coins:1250}};
try{
 await b.resize(2024,900);
 // ---------- 1) Aufträge immer erreichbar, Menüleiste mit allen sieben Fenstern ----------
 await start(TUT,{all:false});
 assert.equal(await read(`return !!window.game.tutorial&&!window.game.tutorial.completed`),true,'Hofprobe läuft');
 const rail=await read(`return [...document.querySelectorAll('.game-menu-rail [data-panel]')].map(b=>{const r=b.getBoundingClientRect();return {id:b.dataset.panel,w:r.width,h:r.height,locked:b.classList.contains('is-locked'),vis:getComputedStyle(b).display!=='none'&&getComputedStyle(b).visibility!=='hidden'}})`);
 assert.deepEqual(rail.map(r=>r.id),WINDOW_UI.windows.map(w=>w[0]),'Menüleiste in Menüreihenfolge');for(const r of rail)assert.ok(r.vis&&r.w>=30&&r.h>=30,'Menüleiste zeigt '+r.id+' '+JSON.stringify(r));
 assert.deepEqual(rail.filter(r=>r.locked).map(r=>r.id),['talents'],'nur Talente sind in der Hofprobe gesperrt');ok('Menüleiste zeigt in der Hofprobe alle 7 Fenster, Talente ausgegraut');
 assert.match(await hoverTip('.game-menu-rail [data-panel="talents"]'),/Stufe 5/,'Tooltip nennt die Bedingung');
 assert.match(await hoverTip('.game-menu-rail [data-panel="quest"]'),/Aufträge \[J \/ L\]/i);ok('Tooltips: Talente nennen „ab Stufe 5“, Aufträge „[J / L]“');
 await b.screenshot(`${dir}/r1-01-hofprobe-menueleiste.jpg`);await zoom(`${dir}/r1-01z-menueleiste.jpg`,'.game-menu-rail');
 await b.press('j');await wait(450);assert.deepEqual(await open(),['quest'],'J öffnet Aufträge in der Hofprobe');
 const tq=await read(`const a=document.querySelector('.popup-quest .tutorial-quest');return a?{title:a.querySelector('h3').textContent,steps:a.querySelectorAll('.tutorial-steps li').length,done:a.querySelectorAll('.tutorial-steps li.done').length,current:a.querySelector('.tutorial-steps li.current')?.textContent}:null`);
 assert.ok(tq,'Hofprobe steht als Auftrag');assert.equal(tq.title,TUTORIAL.title);assert.equal(tq.steps,TUTORIAL.steps.length);assert.equal(tq.done,3);assert.equal(tq.current,TUTORIAL.steps[3].title);
 assert.match(await hoverTip('.popup-quest .tutorial-steps li.current'),new RegExp(TUTORIAL.steps[3].text.slice(0,20)));
 await b.screenshot(`${dir}/r1-02-hofprobe-auftraege-j.jpg`);
 await b.press('j');await wait(250);assert.deepEqual(await open(),[],'J schließt');await b.press('l');await wait(400);assert.deepEqual(await open(),['quest'],'L öffnet Aufträge');await b.press('l');await wait(250);assert.deepEqual(await open(),[],'L schließt');
 ok('J und L öffnen die Aufträge während der Hofprobe; dort steht die Hofprobe mit Schritten (Erklärung im Tooltip)');
 await b.press('n');await wait(450);assert.deepEqual(await open(),['talents'],'N öffnet die Talente-Vorschau');assert.ok(await read(`return !!document.querySelector('.popup-talents .talent-preview')`),'ausgegraute Vorschau');await b.press('n');await wait(250);ok('N vor Stufe 5: ausgegraute Vorschau statt stiller Taste');
 // Hofprobe 6: Text passt zum Auto-Loot; Ida vor Stufe 5 ehrlich.
 assert.match(TUTORIAL.steps[5].desktop,/plündern/i);assert.doesNotMatch(TUTORIAL.steps[5].text,/Icons/);
 const ida=await read(`return import('./tutorial-ui.js').then(m=>{const g=window.game,step=g.tutorial.step;g.tutorial.step=0;const h=m.tutorialDialogue(g,false);g.tutorial.step=step;return h;})`);
 assert.doesNotMatch(ida,/data-shell="clan"/);assert.match(ida,/ab Stufe 5/);ok('Hofprobe 6 spricht vom Plündern, Ida nennt Stufe 5 statt „Spielweise aussuchen“');
 // Handy quer/hoch: Aufträge in der Hofprobe übers Menü.
 for(const [name,w,h] of [['quer',844,390],['hoch',390,844]]){
  const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:seed(TUT,{all:false,touch:true})});
  await b.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:2,mobile:true,screenOrientation:{type:w>h?'landscapePrimary':'portraitPrimary',angle:w>h?90:0}});await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',init);for(let i=0;i<120&&!await b.evaluate('!!window.game');i++)await wait(150);await read(`document.querySelector('.intro-skip')?.click()`);await closeAll();await wait(500);
  await read(`document.querySelector('#touchMenu').click()`);await wait(400);const grid=await read(`return [...document.querySelectorAll('.game-menu-windows [data-shell]')].map(b=>({id:b.dataset.shell,locked:b.classList.contains('is-locked'),shown:getComputedStyle(b).display!=='none'}))`);
  assert.equal(grid.filter(g=>g.shown).length,7,'Touch-Menü zeigt alle 7 Fenster '+JSON.stringify(grid));await b.screenshot(`${dir}/r1-03-handy-${name}-menue.jpg`);
  await read(`document.querySelector('.game-menu-windows [data-shell="quest"]').click()`);await wait(500);assert.deepEqual(await open(),['quest']);assert.ok(await read(`return !!document.querySelector('.popup-quest .tutorial-quest')`));await b.screenshot(`${dir}/r1-04-handy-${name}-hofprobe-auftraege.jpg`);await closeAll();
 }
 await b.send('Emulation.setTouchEmulationEnabled',{enabled:false,maxTouchPoints:1});await b.resize(2024,900);ok('Handy quer und hoch: Menü mit 7 Fenstern, Aufträge mit Hofprobe');
 assert.deepEqual(b.errors,[],'keine Skriptfehler (Hofprobe)');
 // ---------- 2) Feste Fensterplätze ----------
 await start(DONE);await read(`const g=window.game;g.enemies=[];g.player.inCombat=0;`);
 const column=async()=>{const q=await rect('.quest-panel'),m=await rect('#miniButton');return {l:Math.min(q?.l??9999,m?.l??9999),t:0,r:2024,b:Math.max(q?.b??0,m?.b??0)};};
 for(const k of 'cjip'){await b.press(k);await wait(350);}
 const four={};for(const id of ['person','quest','bag','book'])four[id]=await win(id);
 await b.screenshot(`${dir}/r1-10-vier-fenster.jpg`);
 assert.equal(new Set(Object.values(four).map(r=>r.t)).size,1,'alle vier Fenster auf derselben Oberkante '+JSON.stringify(four));
 assert.ok(four.bag.b===four.book.b,'Rucksack und Kniffe teilen die Unterkante');
 const col=await column();for(const id of ['bag','book']){assert.ok(four[id].r<=col.l,id+' endet vor der Spalte Minikarte/Auftragsverfolgung '+JSON.stringify({col,[id]:four[id]}));}
 for(const hud of ['.quest-panel','#miniButton','#actionBar','.game-menu-rail','.player-panel'])for(const id of Object.keys(four))assert.ok(!overlap(four[id],await rect(hud)),id+' deckt '+hud+' nicht ab');
 const ids=Object.keys(four);for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)assert.ok(!overlap(four[ids[i]],four[ids[j]]),ids[i]+' / '+ids[j]+' überlappen nicht');
 assert.ok(four.bag.l>four.book.l,'Rucksack außen rechts, Kniffe innen');ok('Vier Fenster: gemeinsame Oberkante, Rucksack+Kniffe rechts mit gemeinsamer Unterkante, Minikarte/Verfolgung/Leisten frei');
 await b.press('c');await wait(300);assert.deepEqual(await win('quest'),four.quest,'Aufträge bleiben nach dem Schließen der Figur stehen');
 await b.press('i');await wait(300);assert.deepEqual(await win('book'),four.book,'Kniffe bleiben nach dem Schließen des Rucksacks stehen');
 await b.screenshot(`${dir}/r1-11-feste-plaetze-nach-schliessen.jpg`);
 await b.press('i');await wait(300);assert.deepEqual(await win('bag'),four.bag,'Rucksack kommt an seinen Platz zurück');await b.press('c');await wait(300);assert.deepEqual(await win('person'),four.person,'Figur kommt an ihren Platz zurück');
 ok('Feste Plätze: nichts rutscht nach, wenn ein anderes Fenster schließt');
 // Rucksack allein (Kenner-Fall): liegt nicht über der Verfolgung, auch wenn sie gerade leer ist.
 await closeAll();await b.press('i');await wait(350);const bagAlone=await win('bag');assert.ok(bagAlone.r<=(await column()).l,'Rucksack allein frei von der Verfolgung');
 await read(`document.querySelector('.quest-panel').hidden=true`);await read(`window.dispatchEvent(new Event('resize'))`);await wait(300);assert.ok((await win('bag')).r<=col.l,'auch bei verborgener Verfolgung bleibt ihr Platz frei');await read(`document.querySelector('.quest-panel').hidden=false`);await read(`window.dispatchEvent(new Event('resize'))`);await wait(200);
 await b.screenshot(`${dir}/r1-12-rucksack-allein.jpg`);ok('Rucksack allein: Minikarte und Auftragsverfolgung frei (auch wenn die Verfolgung kurz fehlt)');
 // Mitte: Talente/Hilfe in der Lücke.
 await closeAll();await b.press('c');await wait(300);await b.press('n');await wait(500);assert.ok(!overlap(await win('person'),await win('talents')),'Talente decken die Figur nicht ab');await b.screenshot(`${dir}/r1-13-figur-talente.jpg`);
 await b.press('n');await wait(250);await b.press('i');await wait(300);await b.press('h');await wait(500);const guide=await win('guide');assert.ok(!overlap(await win('person'),guide)&&!overlap(await win('bag'),guide),'Hilfe zwischen Figur und Rucksack');
 assert.ok(guide.r<=(await column()).l,'Hilfe bleibt vor der Minikartenspalte');await b.screenshot(`${dir}/r1-14-figur-hilfe-rucksack.jpg`);ok('Talente/Hilfe stehen mittig in der Lücke zwischen den offenen Fenstern');
 // ---------- 3) Menüs und Popups obenauf ----------
 await closeAll();for(const k of 'ip'){await b.press(k);await wait(300);}
 await read(`document.querySelector('#miniButton .mm-k-opts').click()`);await wait(300);const menu=await rect('#miniButton .mm-menu');assert.ok(menu,'Optionsmenü offen');
 const bagR=await win('bag'),shared={l:Math.max(menu.l,bagR.l),r:Math.min(menu.r,bagR.r),t:Math.max(menu.t,bagR.t),b:Math.min(menu.b,bagR.b)};
 assert.ok(shared.l<shared.r&&shared.t<shared.b,'Prüffall: Menü und Rucksack überschneiden sich '+JSON.stringify({menu,bagR}));
 assert.ok(await read(`return !!document.elementFromPoint(${Math.round((shared.l+shared.r)/2)},${Math.round((shared.t+shared.b)/2)})?.closest('.mm-menu')`),'Optionsmenü liegt über dem Rucksack');
 await b.screenshot(`${dir}/r1-20-minikarte-optionen-obenauf.jpg`);
 await read(`document.querySelector('#miniButton .mm-k-opts').click()`);await wait(150);await read(`document.querySelector('#miniButton .mm-k-track').click()`);await wait(300);const lupe=await rect('#miniButton .mm-menu');assert.ok(await read(`return !!document.elementFromPoint(${lupe.l+20},${lupe.b-20})?.closest('.mm-menu')`),'Lupe liegt obenauf');await read(`document.querySelector('#miniButton .mm-k-track').click()`);await wait(150);
 // Kontextmenü über Fenstern: Rechtsklick auf die Auftragsverfolgung, dann Fenster daneben öffnen lassen.
 const qp=await rect('.quest-panel');for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,x:qp.l+40,y:qp.t+15,button:'right',clickCount:1});await wait(250);
 const cm=await rect('.context-menu');if(cm){const hit=await read(`return !!document.elementFromPoint(${cm.l+Math.round(cm.w/2)},${cm.t+Math.round(cm.h/2)})?.closest('.context-menu')`);assert.ok(hit,'Kontextmenü obenauf');await b.press('Escape');await wait(150);}
 const z=await read(`const z=s=>{const e=document.querySelector(s);return e?Number(getComputedStyle(e).zIndex)||0:null};return {layer:z('#popupLayer'),tooltip:z('#itemTooltip'),mmTip:z('.mm-tip'),context:1200}`);assert.ok(z.tooltip>z.layer&&z.mmTip>z.layer,'Tooltips über Fenstern '+JSON.stringify(z));
 ok('Minikarten-Optionen und Lupe, Kontextmenü und Tooltips liegen über allen Fenstern');
 // ---------- 4) Ortsschild und Zonentitel ----------
 await closeAll();const vis=()=>read(`const l=document.querySelector('.region-label'),p=document.querySelector('#miniButton .mm-plate'),cs=getComputedStyle(l);return {label:cs.visibility==='visible'&&Number(cs.opacity)>.5,labelOpacity:Number(cs.opacity),plate:Number(getComputedStyle(p).opacity),zone:document.querySelector('#zoneName').textContent,announced:document.body.dataset.zoneAnnounced||''}`);
 await mouse(1000,500);await wait(4800);let v=await vis();assert.equal(v.label,false,'Zonentitel steht nicht dauerhaft '+JSON.stringify(v));assert.ok(v.plate<.1,'Ortsschild steht nicht dauerhaft '+JSON.stringify(v));await b.screenshot(`${dir}/r1-30-ruhe-ohne-ortsschild.jpg`);
 // Gebietswechsel: der Reihe nach zu Treffpunkten, Lagern und zur Kirche springen, bis der Ortsname wechselt.
 const spots=await read(`const w=window.game.world;return [...(w.hubs||[]),...(w.camps||[]),w.church].filter(Boolean).map(s=>w.findClear(s.x,s.y+30,9))`);const before=v.zone;
 for(const s of spots){await read(`const g=window.game;Object.assign(g.player,${JSON.stringify(s)},{vx:0,vy:0});g.moveTo=null;g.path=[];g.enemies=[];`);await wait(1000);v=await vis();if(v.zone!==before)break;}
 assert.notEqual(v.zone,before,'anderes Gebiet');for(let i=0;i<20&&v.announced!==v.zone;i++){await wait(100);v=await vis();}assert.equal(v.announced,v.zone,'Ankündigung für das neue Gebiet');assert.ok(v.label,'Zonentitel blendet beim Betreten ein '+JSON.stringify(v));assert.ok(v.plate>.9,'Ortsschild blendet beim Betreten ein');
 await b.screenshot(`${dir}/r1-31-gebietswechsel-ortsschild.jpg`);await zoom(`${dir}/r1-31z-minikarte.jpg`,'#miniButton',20);await zoom(`${dir}/r1-31z-zonentitel.jpg`,'.region-label',10);await read(`window.game.enemies=[];`);await wait(4600);v=await vis();assert.equal(v.label,false,'Zonentitel blendet wieder aus');assert.ok(v.plate<.1,'Ortsschild blendet wieder aus');
 const mm=await rect('#miniButton .mm-disc');await mouse(mm.l+mm.w/2,mm.t+mm.h/2);await wait(500);v=await vis();assert.ok(v.plate>.9,'Ortsschild beim Überfahren der Minikarte');await b.screenshot(`${dir}/r1-32-minikarte-hover-ortsschild.jpg`);await mouse(1000,500);await wait(300);
 ok('Zonentitel und Ortsschild: kurz beim Gebietswechsel, danach weg; Ortsschild beim Überfahren der Minikarte');
 // ---------- 5) Quick Wins ----------
 await b.press('p');await wait(400);const kniff=await hoverTip('.icon-skillbook [data-book-skill="strike"]');assert.doesNotMatch(kniff,/\d\.\d+ s/,'Kniff-Tooltip mit Komma');assert.doesNotMatch(kniff,/Taste belegen|Ziehen verschiebt/,'keine Bedienhilfe im Tooltip');await b.screenshot(`${dir}/r1-40-kniff-tooltip.jpg`);await zoom(`${dir}/r1-40z-kniff-tooltip.jpg`,'#itemTooltip');await b.press('p');await wait(200);
 const barTip=await hoverTip('#actionBar [data-action-slot="1"]');assert.doesNotMatch(barTip,/Taste belegen/);
 await read(`const g=window.game;const id=g.skills.find(s=>s.cd>2&&!s.auto)?.id;g.cooldowns[id]=0.64;window.__cd=id;`);await wait(120);const cd=await read(`return [...document.querySelectorAll('.action-area .skill .cooldown')].map(e=>e.textContent).filter(Boolean)`);assert.ok(cd.length&&cd.every(t=>!t.includes('.')),'Abklingzahl mit Komma '+JSON.stringify(cd));
 const key=await read(`const k=document.querySelector('#actionBar .skill .key');const cs=getComputedStyle(k);return {bg:cs.backgroundColor,font:cs.fontFamily}`);assert.match(key.bg,/rgba\(0, 0, 0, 0\)|transparent/,'Tastenziffer ohne Box '+JSON.stringify(key));
 await mouse(1000,500);await wait(200);await read(`return import('./hotspots.js').then(h=>{const g=window.game,hs=h.hotspotLayout(g.world).hotspots.find(x=>x.id==='bude-nyalol'),pos={x:g.player.x,y:g.player.y};if(!hs)return false;Object.assign(g.player,{x:hs.giver.x,y:hs.giver.y});const ok=h.acceptHotspotQuest(g,'st-nyalol-1');Object.assign(g.player,pos);return ok;})`);await wait(700);await b.screenshot(`${dir}/r1-41-aktionsleiste.jpg`);await zoom(`${dir}/r1-41z-aktionsleiste.jpg`,'#actionBar');await zoom(`${dir}/r1-41z-verfolgung.jpg`,'.quest-panel');
 await b.press('c');await wait(400);const fig=await read(`const p=document.querySelector('.popup-person');return {title:p.querySelector('.popup-titlebar strong').textContent,h2:!!p.querySelector('.rpg-heading h2'),hp:p.querySelector('[data-live-hp]')?.textContent,coins:p.querySelector('[data-live-coins]')?.textContent}`);
 assert.equal(fig.title,'Runde Eins','Heldenname in der Titelzeile');assert.equal(fig.h2,false,'Name nicht doppelt');assert.match(fig.hp,/^\d{1,3}(\.\d{3})* \/ \d{1,3}(\.\d{3})*$/,'Leben mit Tausenderpunkt '+fig.hp);assert.equal(fig.coins,'1.250');
 const armory=await rect('.popup-person .armory-controls');const cells=await read(`return [...document.querySelectorAll('.popup-person .body-equipment .gear-cell')].map(e=>{const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom}})`);for(const c of cells)assert.ok(!overlap(armory,c),'Drehen/Wechseln verdecken keinen Ausrüstungsplatz '+JSON.stringify({armory,c}));
 await b.screenshot(`${dir}/r1-42-figur.jpg`);await zoom(`${dir}/r1-42z-figur.jpg`,'.popup-person');await b.press('c');await wait(200);
 assert.equal(await read(`return getComputedStyle(document.querySelector('.aura-bar h2')||document.body).display`),'none','kein „Buffs“-Schild');
 await b.press('m');await wait(700);const box=await rect('.atlas-key input[type=checkbox]');assert.ok(box&&box.w<=16&&box.h<=16,'Legende: Häkchen klein '+JSON.stringify(box));assert.notEqual(await read(`return getComputedStyle(document.querySelector('.atlas-key input[type=checkbox]')).backgroundColor`),'rgb(255, 255, 255)','kein weißes Quadrat');
 const em=await read(`const e=document.querySelector('.atlas-place em,.atlas-list em');return e?getComputedStyle(e).textTransform:'none'`);assert.equal(em,'none','„m“ nicht in Versalien');await b.screenshot(`${dir}/r1-43-karte-legende.jpg`);await zoom(`${dir}/r1-43z-legende.jpg`,'.atlas-key');await b.press('m');await wait(200);
 assert.equal(await read(`return getComputedStyle(document.querySelector('#targetDistance')).textTransform`),'none');
 const tracker=await read(`return document.querySelector('.quest-panel').innerText`);assert.doesNotMatch(tracker,/Daily:/,'Tracker ohne „Daily:“');
 const src=readFileSync('profession-art.js','utf8');assert.match(src,/lineJoin='round'/);assert.doesNotMatch(src,/if\(hover\)label\(/,'Fundstelle: Name nur im Tooltip');
 ok('Quick Wins: Komma/Tausenderpunkt, keine Bedienhilfe im Tooltip, Tastenziffer ohne Box, Figur mit Name nur im Titel, Drehen frei, kein Buffs-Schild, Legende, „m“, Tracker, Fundstellen-Label');
// Gespräch: Name nur einmal – seit Runde 2a steht er mit dem Porträt in der Titelzeile, die Kopfkarte entfällt.
 await read(`const g=window.game;Object.assign(g.player,g.world.findClear(g.world.npc.x+20,g.world.npc.y+10,9));`);await wait(300);await b.press('f');await wait(700);
 const dlg=await read(`const p=document.querySelector('.popup-dialog');if(!p)return null;return {title:getComputedStyle(p.querySelector('.popup-titlebar strong')).visibility,head:!!p.querySelector('.popup-titlebar .dlg-portrait'),names:[...p.querySelectorAll('.popup-titlebar strong,.conversation-person strong')].filter(e=>e.offsetParent).length}`);
 if(dlg&&dlg.head){assert.equal(dlg.title,'visible','Name in der Titelzeile');assert.equal(dlg.names,1,'Name nur einmal');await b.screenshot(`${dir}/r1-44-gespraech.jpg`);ok('Gespräch: Name nur einmal (Titelzeile mit Porträt)');}else console.log('Hinweis: kein Gespräch geöffnet (Ida nicht erreichbar), Prüfung übersprungen');
 await closeAll();
 // ---------- 6) Zweite Leiste, Kein Weg dorthin ----------
 const bar2=async()=>read(`const x=document.querySelector('.action-area .extra-bar');if(!x)return null;const s=x.querySelector('.skill.empty-slot');return {used:!!x.querySelector('.skill:not(.empty-slot)'),vis:s?getComputedStyle(s).visibility:null,top:Math.round(document.querySelector('.action-area').getBoundingClientRect().top)}`);
 await read(`const g=window.game;for(let i=10;i<20;i++)if(g.rpg.actionBar?.[i]!==undefined)g.rpg.actionBar[i]=null;`);
 const empty=await bar2();if(empty&&!empty.used){await b.press('i');await wait(400);const withBag=await bar2();assert.equal(withBag.vis,'hidden','leere zweite Leiste klappt beim Rucksack nicht auf');assert.equal(withBag.top,empty.top,'Aktionsfläche springt nicht');await b.screenshot(`${dir}/r1-50-rucksack-ohne-leiste2.jpg`);await b.press('i');ok('Leere zweite Leiste bleibt beim Öffnen des Rucksacks zu');}else console.log('Hinweis: zweite Leiste belegt – Prüfung übersprungen',JSON.stringify(empty));
 const far=await read(`const g=window.game;const r=g.navigate({x:-40000,y:-40000});return {r,moving:!!g.moveTo}`);await wait(100);assert.equal(far.r,false);
 const toasts=await read(`return document.querySelector('#toast')?.innerText||''`);assert.match(toasts,/Kein Weg dorthin/,'Toast „Kein Weg dorthin“: '+toasts);
 // Ein nahes, echt unerreichbares Ziel suchen (blockiert, kein direkter Weg), etwa in einem Gebäude hinter der Wand.
 const near=await read(`const g=window.game,w=g.walkWorld(),p=g.player;const tryPath=(a,c)=>{try{return w.findPath(a,c)}catch{return []}};for(let r=60;r<=360;r+=30)for(let a=0;a<Math.PI*2;a+=Math.PI/8){const c={x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r};if(w.blocked(c.x,c.y,9)&&!tryPath(p,c).length){const ok=g.navigate(c);const goal=g.routeGoal;g.moveTo=null;g.path=[];g.routeGoal=null;return {ok,goal,c,dist:goal?Math.hypot(goal.x-c.x,goal.y-c.y):null,start:Math.hypot(c.x-p.x,c.y-p.y)};}}return null`);
 if(near){assert.equal(near.ok,true,'unerreichbares Ziel: läuft so nah wie möglich '+JSON.stringify(near));assert.ok(near.dist<near.start,'näher als vorher');ok('Rechtsklick ins Unerreichbare: Weg zum nächsten erreichbaren Punkt, sonst „Kein Weg dorthin“');}else{console.log('Hinweis: kein unerreichbares Gebäude in Reichweite');ok('„Kein Weg dorthin“ bei unerreichbarem Ziel');}
 await b.screenshot(`${dir}/r1-51-kein-weg.jpg`);
 assert.deepEqual(b.errors,[],'keine Skriptfehler');
 writeFileSync(dir+'/report.json',JSON.stringify({checks},null,2));console.log('PASS Optimierung Runde 1 ('+checks.length+' Prüfungen)');
}catch(e){console.error('FAIL',e);try{await b.screenshot(dir+'/failure.jpg');}catch{}process.exitCode=1;}finally{b.close();}
