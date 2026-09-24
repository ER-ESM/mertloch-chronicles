// Einzelfenster (2026-09-23): jede Taste öffnet und schließt ihr eigenes Fenster, links und rechts docken nebeneinander
// ohne Überlappung, die Karte ist fast Vollbild, Esc schließt alle Fenster, die Menüleiste öffnet jedes Fenster,
// Symbolknöpfe tragen ihren Namen als Tooltip, und am Handy erreicht das Touch-Menü jedes Fenster einzeln.
// Screenshots nach visual-review/einzelfenster/. Ports: CDP 9440, Server 4240.
import {createCharacter,characterKey} from '../characters.js';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
import {WINDOW_UI} from '../content/index.js';
const dir='visual-review/einzelfenster';mkdirSync(dir,{recursive:true});
const b=await browserSession({port:Number(process.env.CDP_PORT||9440),serverPort:Number(process.env.SERVER_PORT||4240)});
const read=js=>b.evaluate(`(()=>{${js}})()`);
const rect=sel=>read(`const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height};`);
const open=()=>read(`return [...document.querySelectorAll('.game-popup')].map(e=>e.dataset.window)`);
const closeAll=async()=>{await read(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click())`);await wait(200);};
const overlap=(a,c)=>a.l<c.r-1&&c.l<a.r-1&&a.t<c.b-1&&c.t<a.b-1;
const mouse=(x,y)=>b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,pointerType:'mouse'});
async function hover(sel){await read(`document.querySelector(${JSON.stringify(sel)})?.scrollIntoView({block:"center"})`);await wait(100);const r=await rect(sel);assert.ok(r,'fehlt: '+sel);await mouse(10,450);await wait(80);await mouse(Math.round(r.l+r.w/2),Math.round(r.t+r.h/2));await wait(250);return read(`const t=document.querySelector('#itemTooltip');return t&&!t.classList.contains('hidden')?t.innerText:''`);}
const checks=[];const ok=m=>{checks.push(m);console.log('ok',m);};
const KEYS=WINDOW_UI.windows.map(([id,,,key])=>[id,key.toLowerCase()]);
try{
 const made=createCharacter(null,{name:'Fenster Pruefer',classId:'dieter',look:'dieter'}),save={version:1,savedAt:Date.now(),worldKey:'v2-56753-72-1',level:12,classId:'dieter',tutorial:{version:1,step:8,completed:true},rpg:{inventory:[{id:'brezel',count:3},{id:'dosenklinge',count:1}],coins:200}};
 const seed=touch=>'delete Navigator.prototype.serviceWorker;localStorage.setItem("mertloch-unlock-all","1");localStorage.setItem("mertloch-characters",'+JSON.stringify(JSON.stringify(made.roster))+');localStorage.setItem('+JSON.stringify(characterKey(save.worldKey,made.character))+','+JSON.stringify(JSON.stringify(save))+');'+(touch?'localStorage.setItem("mertloch-touch-v1",JSON.stringify({mode:"touch",size:"normal",layouts:{}}));':'localStorage.removeItem("mertloch-touch-v1");');
 let init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:seed(false)});
 await b.resize(2024,900);await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',init);
 for(let i=0;i<100&&!await b.evaluate('!!window.game');i++)await wait(150);
 await read(`const g=window.game;g.tutorial.completed=true;g.enemies=[];g.player.inCombat=0;`);await closeAll();await wait(400);
 // 1) Jede Taste öffnet ihr Fenster und schließt es wieder.
 for(const [id,key] of KEYS){await b.press(key);await wait(350);assert.deepEqual(await open(),[id],`Taste ${key} öffnet genau „${id}“`);await b.screenshot(`${dir}/taste-${key}.jpg`);await b.press(key);await wait(250);assert.deepEqual(await open(),[],`Taste ${key} schließt „${id}“`);}
 ok('Jede Taste (C J N M P I H) öffnet und schließt ihr Fenster');
 // 2) Links Figur + Aufträge, rechts Rucksack + Kniffe: vier Fenster zugleich, keines überlappt, keines deckt Aktionsleiste oder Minikarte.
 for(const k of 'cjip'){await b.press(k);await wait(300);}
 assert.deepEqual((await open()).sort(),['bag','book','person','quest']);
 const boxes={};for(const id of ['person','quest','bag','book'])boxes[id]=await rect('.game-popup[data-window="'+id+'"]');
 const W=2024;assert.ok(boxes.person.l<30&&boxes.quest.l>boxes.person.r-1,'Figur ganz links, Aufträge daneben');const hudLeft=await read(`return Math.min(...['#miniButton','.minimap','.quest-panel'].map(s=>document.querySelector(s)).filter(Boolean).map(e=>e.getBoundingClientRect().left))`);assert.ok(boxes.bag.r>=Math.min(W-12,hudLeft)-20&&boxes.book.r<=boxes.bag.l+1,'Rucksack rechts vor Minikarte/Auftragsverfolgung, Kniffe daneben '+JSON.stringify({hudLeft,bag:boxes.bag}));
 const ids=Object.keys(boxes);for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)assert.ok(!overlap(boxes[ids[i]],boxes[ids[j]]),`${ids[i]} und ${ids[j]} überlappen nicht `+JSON.stringify(boxes));
 for(const hud of ['#actionBar','#miniButton','.quest-panel','.player-panel','.game-menu-rail']){const h=await rect(hud);if(h)for(const id of ids)assert.ok(!overlap(boxes[id],h),`${id} deckt ${hud} nicht ab`);}
 await b.screenshot(`${dir}/links-rechts-vier.jpg`);ok('Vier Fenster links+rechts gleichzeitig, ohne Überlappung, HUD frei');
 // 3) Esc schließt wie in WoW alle offenen Fenster auf einmal (Runde 2a, 2026-09-24); erst danach kommt das Spielmenü.
 await b.press('Escape');await wait(250);assert.deepEqual(await open(),[],'ein Esc schließt alle vier');await b.press('Escape');await wait(350);assert.deepEqual(await open(),['menu'],'Esc ohne Fenster: Spielmenü');await b.press('Escape');await wait(250);ok('Esc schließt alle Fenster auf einmal, dann Spielmenü');
 // 4) Karte fast Vollbild.
 await b.press('m');await wait(600);const m=await rect('.game-popup[data-window="map"]');assert.ok(m.w>=W*.9&&m.h>=900*.85,'Karte fast Vollbild: '+JSON.stringify(m));const canvas=await rect('#largeMap');assert.ok(canvas.w>W*.6&&canvas.h>500,'Kartenfläche groß: '+JSON.stringify(canvas));await b.screenshot(`${dir}/karte.jpg`);await b.press('m');await wait(250);ok('Karte fast Vollbild, Zeichenfläche füllt das Fenster');
 // 5) Talente mittig.
 await b.press('n');await wait(500);const t=await rect('.game-popup[data-window="talents"]');assert.ok(Math.abs((t.l+t.r)/2-W/2)<30,'Talente mittig');await closeAll();ok('Talente mittig');
 // 6) Menüleiste öffnet und schließt jedes Fenster; Tooltip zeigt Namen und Taste.
 for(const [id,key] of KEYS){await read(`document.querySelector('.game-menu-rail [data-panel="${id}"]').click()`);await wait(300);assert.ok((await open()).includes(id),'Menüleiste öffnet '+id);await read(`document.querySelector('.game-menu-rail [data-panel="${id}"]').click()`);await wait(200);assert.ok(!(await open()).includes(id),'Menüleiste schließt '+id);}
 const railTip=await hover('.game-menu-rail [data-panel="bag"]');assert.match(railTip,/Rucksack \[I\]/i);ok('Menüleiste: jedes Fenster auf/zu, Tooltip mit Namen und Taste');
 // 7) Symbolknöpfe statt Beschriftung: Namen im Tooltip.
 await b.press('i');await wait(400);assert.equal(await read(`return document.querySelector('[data-bag-filter="better"]').innerText.trim()`),'','Filter ohne Text');
 assert.match(await hover('[data-bag-filter="better"]'),/Besser/i);assert.match(await hover('[data-sort-bag]'),/Sortieren/i);await b.screenshot(`${dir}/tooltip-rucksack.jpg`);
 await b.press('c');await wait(400);assert.match(await hover('.compact-stats [data-stat-tip="might"]'),/Wumms/i);assert.match(await hover('.compact-stats>div:first-child'),/Nahkampf/i);await b.screenshot(`${dir}/tooltip-figur.jpg`);
 await b.press('j');await wait(400);assert.match(await hover('[data-quest-filter="done"]'),/Erledigt/i);await b.screenshot(`${dir}/tooltip-auftraege.jpg`);
 await b.press('p');await wait(400);assert.match(await hover('.icon-skillbook [data-book-skill="strike"]'),/Kronkorken-Kelle/i);await b.screenshot(`${dir}/tooltip-kniffe.jpg`);
 await closeAll();ok('Symbolknöpfe tragen Namen als Tooltip (Rucksack, Figur, Aufträge, Kniffe)');
 // 8) Gegenstand anklicken: Detail hängt am Rucksack (links daneben) und schließt mit ihm.
 await b.press('i');await wait(400);await read(`document.querySelector('.popup-bag [data-item]')?.click()`);await wait(400);const ins=await rect('.game-popup[data-window="inspection"]'),bag=await rect('.game-popup[data-window="bag"]');assert.ok(ins&&ins.r<=bag.l+1,'Gegenstand links neben dem Rucksack');await b.screenshot(`${dir}/gegenstand.jpg`);await b.press('i');await wait(250);assert.deepEqual(await open(),[],'Detail schließt mit dem Rucksack');ok('Gegenstandsdetail hängt am Rucksack');
 assert.deepEqual(b.errors,[],'keine Skriptfehler (Desktop)');
 // 9) Touch: Menü → Fenster einzeln, immer nur eines offen, alle erreichbar.
 for(const [name,w,h] of [['quer',844,390],['hoch',390,844]]){
  init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:seed(true)});
  await b.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:2,mobile:true,screenOrientation:{type:w>h?'landscapePrimary':'portraitPrimary',angle:w>h?90:0}});await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',init);for(let i=0;i<100&&!await b.evaluate('!!window.game');i++)await wait(150);await read(`document.querySelector('.intro-skip')?.click();const g=window.game;g.tutorial.completed=true;g.enemies=[];`);await closeAll();await wait(500);
  assert.equal(await read(`return document.body.classList.contains('touch-mode')`),true,'Touch-Modus aktiv');
  for(const [id] of KEYS){await read(`document.querySelector('#touchMenu').click()`);await wait(350);const grid=await read(`return [...document.querySelectorAll('.popup-menu .game-menu-windows [data-shell]')].map(b=>{const r=b.getBoundingClientRect();return {id:b.dataset.shell,w:r.width,h:r.height};})`);
   assert.ok(grid.some(g=>g.id===id),`Touch-Menü bietet ${id} an`);for(const g of grid)assert.ok(g.w>=44&&g.h>=44,'44-px-Treffer: '+JSON.stringify(g));
   await read(`document.querySelector('.popup-menu .game-menu-windows [data-shell="${id}"]').click()`);await wait(500);const now=await open();assert.deepEqual(now,[id],`Touch ${name}: nur „${id}“ offen`);
   const r=await rect('.game-popup[data-window="'+id+'"]');assert.ok(r.l>=0&&r.r<=w+1&&r.t>=0&&r.b<=h+1,`Touch ${name}: ${id} im Bild `+JSON.stringify(r));await b.screenshot(`${dir}/touch-${name}-${id}.jpg`);}
  await closeAll();assert.deepEqual(b.errors,[],'keine Skriptfehler (Touch '+name+')');ok('Touch '+name+': Menü erreicht jedes Fenster einzeln');
 }
 writeFileSync(dir+'/report.json',JSON.stringify({checks},null,2));console.log('PASS Einzelfenster ('+checks.length+' Prüfungen)');
}catch(e){console.error('FAIL',e);try{await b.screenshot(dir+'/failure.jpg');}catch{}process.exitCode=1;}finally{b.close();}
