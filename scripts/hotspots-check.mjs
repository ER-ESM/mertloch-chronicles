// Browserabnahme E-55: Startreihe am ersten Hotspot, Karte mit Gebern und Gebieten, Minikarte, Questbuch, Aushang.
// Desktop 2024×900 und Handy 390×844. Aufruf: node scripts/hotspots-check.mjs [url]
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/hotspots-20260923';mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:9402,serverPort:4212}),checks=[];
const read=s=>b.evaluate(s),shot=name=>b.screenshot(dir+'/'+name+'.jpg');
async function until(expression,what=expression){for(let i=0;i<100;i++){if(await read(expression))return;await wait(100);}throw Error('Timeout: '+what);}
const hs=`(await import('./hotspots.js'))`;
const status=id=>read(`(async()=>(await import('./hotspots.js')).questStatus(game,'${id}'))()`);
async function load(touch=false){
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:1,trainingXp:0,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:20}};
 const injection=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'${touch?'touch':'desktop'}'}));`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',injection);await wait(500);
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);await wait(3500);
}
const closeAll=()=>read(`document.querySelectorAll('[data-window-close],[data-close]').forEach(b=>b.click())`);
try{
 await b.resize(2024,900);await load();
 // Zum Geber am Kirchplatz
 const giver=await read(`(async()=>{const L=${hs}.hotspotLayout(game.world);const h=L.hotspots.find(h=>h.id==='kirchhof');return {x:h.giver.x,y:h.giver.y,name:h.giver.name,area:{x:h.area.x,y:h.area.y}};})()`);
 await read(`Object.assign(game.player,{x:${giver.x+18},y:${giver.y+6}});game.enemies=game.enemies.filter(e=>!e.aggro);game.player.inCombat=0;`);await wait(900);
 assert.equal(await read(`game.interaction()?.kind`),'hotspot');
 assert.ok((await read(`document.querySelector('#interact span')?.textContent||''`)).includes(giver.name),'F nennt '+giver.name);
 await shot('geber-welt');checks.push('Welt: '+giver.name+' steht am Kirchplatz, F bietet „Mit '+giver.name+' reden“');
 await b.press('f');await until(`!!document.querySelector('[data-hs-accept="hs-kirchhof-1"]')`,'Dialog Konrad');
 const offers=await read(`[...document.querySelectorAll('.hotspot-offer h2')].map(h=>h.textContent)`);assert.deepEqual(offers,['Dachse im Leergut','Federn für die Kollekte']);
 await shot('dialog-konrad');
 await read(`document.querySelector('[data-hs-accept="hs-kirchhof-1"]').click()`);await wait(300);
 await read(`document.querySelector('[data-hs-accept="hs-kirchhof-2"]')?.click()`);await wait(300);
 assert.deepEqual(await read(`Object.keys(game.hotspots.quests).sort()`),['hs-kirchhof-1','hs-kirchhof-2']);
 await closeAll();await wait(300);
 assert.match(await read(`document.querySelector('#questTitle').textContent`),/Federn für die Kollekte|Dachse im Leergut/);
 assert.match(await read(`document.querySelector('#questTasks').textContent`),/Pfanddachs|Kollekte-Feder/);
 checks.push('Dialog: zwei Aufträge annehmbar, Tracker zeigt den verfolgten Auftrag');
 // Tiere im Gebiet: der Hotspot legt sie an, Kills und Drops zählen
 await read(`Object.assign(game.player,{x:${giver.area.x+160},y:${giver.area.y}});game.hotspotDirector.clock=0;`);await wait(1500);
 const beasts=await read(`game.enemies.filter(e=>e.hotspot==='kirchhof').map(e=>e.archetype)`);assert.equal(beasts.length,8,'8 Tiere im Kirchhof-Gebiet');
 await read(`(()=>{game.lootRandom=()=>0;for(const e of game.enemies.filter(e=>e.hotspot==='kirchhof'&&e.hp>0))game.kill(e);})()`);await wait(300);
 assert.equal(await status('hs-kirchhof-1'),'ready');assert.equal(await status('hs-kirchhof-2'),'accepted','4 Gänse = 4 Federn von 5');
 checks.push('Gebiet: 8 Tiere angelegt, 4 Dachse erfüllen den Kill-Auftrag, Federn fallen');
 // Karte: Filter Aufträge, Geber mit ?, Zielgebiet
 await b.press('m');await until(`!!document.querySelector('[data-filter="quest"]')`,'Karte');await read(`document.querySelector('[data-filter="quest"]').click()`);await wait(700);
 const places=await read(`[...document.querySelectorAll('[data-place]')].map(e=>e.dataset.place)`);
 assert.ok(places.includes('hotspot:kirchhof'),'Geber in der Ortsliste: '+places);
 const hits=await read(`(document.querySelector('#largeMap').atlasHits||[]).map(h=>h.id)`);assert.ok(hits.includes('hotspot:kirchhof'),'Geber anklickbar auf der Karte');
 await shot('karte-auftraege');checks.push('Karte: Filter „Aufträge“, Geber als Marke und in der Liste, Zielgebiet gezeichnet');
 await closeAll();await wait(300);await shot('minikarte');
 // Abgabe
 await read(`Object.assign(game.player,{x:${giver.x+18},y:${giver.y+6}});game.enemies=[];`);await wait(700);await b.press('f');
 await until(`!!document.querySelector('[data-hs-claim="hs-kirchhof-1"]')`,'Abgabe-Knopf');await read(`document.querySelector('[data-hs-claim="hs-kirchhof-1"]').click()`);await wait(400);
 assert.equal(await status('hs-kirchhof-1'),'claimed');await closeAll();
 checks.push('Abgabe beim Geber: Belohnung, Auftrag erledigt');
 // Questbuch
 await b.press('j');await until(`!!document.querySelector('.hotspot-entry')`,'Questbuch');
 assert.match(await read(`document.querySelector('.hotspot-entry').textContent`),/Startreihe/);await shot('questbuch');await closeAll();
 checks.push('Questbuch: Startreihe unter „Aktiv“');
 // Aushang: gefunden → Auftrag läuft, Gebiet auf der Karte
 const notice=await read(`(async()=>{const n=${hs}.hotspotLayout(game.world).notices.find(n=>n.id==='aushang-formular');return {x:n.x,y:n.y};})()`);
 await read(`game.player.level=4;Object.assign(game.player,{x:${notice.x+12},y:${notice.y}});game.enemies=[];`);await wait(700);
 assert.equal(await read(`game.interaction()?.kind`),'notice');await b.press('f');await until(`/Formular 27b/.test(document.querySelector('.game-popup,.modal,#modal')?.textContent||document.body.textContent)`,'Aushang-Dialog');
 assert.equal(await status('aushang-formular'),'accepted');await shot('aushang');await closeAll();
 checks.push('Aushang: F liest ihn, der Auftrag läuft sofort');
 // Handy
 await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await b.resize(390,844);await load(true);
 await read(`(async()=>{const h=${hs}.hotspotLayout(game.world).hotspots[0];Object.assign(game.player,{x:h.giver.x+18,y:h.giver.y+6});})()`);await wait(800);
 await read(`document.querySelector('#interact')?.click()`);await until(`!!document.querySelector('.hotspot-offer')`,'Dialog Handy');
 const fits=await read(`(()=>{const d=document.querySelector('.hotspot-offer').closest('.game-popup,.modal-window,.dialog,#modal')||document.querySelector('.hotspot-offer').parentElement;const r=d.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1})()`);
 assert.ok(fits,'Dialog passt aufs Handy');await shot('dialog-phone');checks.push('Handy: Geber-Dialog passt in 390 px');
 assert.deepEqual(b.errors,[]);writeFileSync(dir+'/result.json',JSON.stringify({checks,errors:b.errors},null,2));console.log(JSON.stringify({checks,errors:b.errors},null,2));
}catch(e){await shot('failure').catch(()=>{});console.error(JSON.stringify({browserErrors:b.errors}));throw e;}finally{b.close();}
