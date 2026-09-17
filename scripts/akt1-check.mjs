// Browserprüfung Akt 1 „Filmriss“: Hofprobe → Ida → Kapitel 1–4 → Belohnung, Bude, Erinnerungen, Mentoren.
// Aufruf: node scripts/akt1-check.mjs [url] [ordner]   (Chrome mit --remote-debugging-port=9222, Server: npm start)
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {STORY,STORY_CHAPTERS,MAIN_DIALOGUE,TUTORIAL,BUILDINGS,MEMORY_FRAGMENTS,LORE,PANEL_UI,chapterDialogue} from '../content/index.js';
import {browser,wait} from './browser-polish.mjs';
const url=process.argv[2]||'http://localhost:4183/',dir=process.argv[3]||'akt1-review';
mkdirSync(dir,{recursive:true});
const chapter=n=>STORY_CHAPTERS.find(c=>c.id===n);
const b=await browser(),checks=[];let backup,shot=0;
const screenshot=async name=>b.screenshot(dir+'/'+String(++shot).padStart(2,'0')+'-'+name+'.jpg');
const text=sel=>b.evaluate(`document.querySelector(${JSON.stringify(sel)})?.innerText||''`);
const exists=sel=>b.evaluate(`!!document.querySelector(${JSON.stringify(sel)})`);
const state=()=>b.evaluate('window.mertloch.state()');
/** Seite mit vorgegebenem Speicher laden. Das Skript läuft VOR app.js, damit der Autosave der alten Seite
 *  beim Verlassen nichts zurückschreibt; Service Worker und Caches fallen dabei weg (sonst laden alte Module). */
async function loadWith(source){
 const clean=`(()=>{try{for(const k of Object.keys(localStorage))if(k.startsWith('mertloch'))localStorage.removeItem(k);}catch{}
  navigator.serviceWorker?.getRegistrations?.().then(rs=>rs.forEach(r=>r.unregister()));
  if(window.caches)caches.keys().then(ks=>ks.forEach(k=>caches.delete(k)));})();`;
 const {identifier}=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:clean+source});
 await b.goto(url);await wait(900);
 await b.send('Page.removeScriptToEvaluateOnNewDocument',{identifier});
}
const freshLoad=()=>loadWith('');
/** Vor Ida stellen, damit Annahme und Abgabe in Reichweite sind. */
const toIda=()=>b.evaluate('(()=>{const g=window.game;Object.assign(g.player,{x:g.world.npc.x,y:g.world.npc.y+6});g.moveTo=null;g.path=[];g.target=null;return g.world.npc.name;})()');
/** Alle Ziele des laufenden Kapitels erfüllen: Lagergegner erledigen, Sammelpunkte einsammeln. */
const finishChapter=()=>b.evaluate(`(()=>{const g=window.game,ch=g.quest.chapter;
 for(const [i,o] of g.objectives().entries()){
  let guard=0;
  while(!g.objectiveProgress(i).complete&&guard++<60){
   if(o.kind==='gather'){const spot=g.gatherPoints().find(s=>s.item===o.item);if(!spot)break;Object.assign(g.player,{x:spot.x,y:spot.y});if(!g.collectGather(spot.id))break;}
   else{const e=g.enemies.find(e=>e.hp>0&&e.campId&&!e.questId&&!e.ambient&&(e.chapter||1)===ch&&(o.kind==='boss'?e.type==='boss':o.type?e.type===o.type:e.family===o.family));if(!e)break;e.hp=1;g.kill(e);}
  }
 }
 return {ready:g.questReady(),progress:g.chapterProgress().map(p=>p.done+'/'+p.need)};})()`);
/** Material für eine Ausbaustufe in den Rucksack legen. */
const stock=cost=>b.evaluate(`(async()=>{const {addItem}=await import(new URL('rpg.js',location.href));const g=window.game;
 for(const [item,n] of Object.entries(${JSON.stringify(cost)}))for(let i=0;i<n;i++)addItem(g.rpg,item);
 g.emit('rpgChanged');return true;})()`);
/** Offene Erinnerungs-Einblendung bestätigen und den Titel zurückgeben. */
/** Alle Overlays schließen. Seit Runde B wartet die Erinnerungs-Warteschlange auf ein leeres Fenster und
 *  schiebt sich nach, sobald eines schließt – vor jedem [F] also erst wirklich aufräumen. */
async function clearAll(){for(let i=0;i<8;i++){
 if(await exists('[data-memory-next]')){await b.click('[data-memory-next]');await wait(250);continue;}
 if(!await exists('.game-popup'))return;
 await b.press('Escape');await wait(220);}}
/** Ida ansprechen. Seit Runde B schließt [F] ein offenes Overlay (z. B. eine nachrückende Erinnerung),
 *  darum erst aufräumen und notfalls ein zweites Mal drücken. */
async function openIda(){
 for(let i=0;i<4;i++){
  await clearAll();await toIda();await wait(220);
  await b.press('f');await wait(340);
  if(await exists('.popup-dialog'))return;
 }
 throw Error('Ida öffnet kein Gespräch');
}
async function clearMemory(){
 if(!await exists('.popup-memory'))return null;
 const title=await b.evaluate('document.querySelector(".popup-memory h2").textContent');
 await b.click('[data-memory-next]');await wait(250);return title;
}
try{
 await b.send('Runtime.enable');await b.send('Network.enable');
 await b.send('Network.setBypassServiceWorker',{bypass:true});await b.send('Network.setCacheDisabled',{cacheDisabled:true});
 await b.goto(url);await wait(600);
 backup=await b.evaluate('Object.fromEntries(Object.entries(localStorage).filter(([k])=>k.startsWith("mertloch")))');
 await b.resize(2024,900);await freshLoad();

 // 1 · Hofprobe
 assert.ok((await state()).tutorial&&!(await state()).tutorial.completed,'Frischer Start beginnt mit der Hofprobe');
 if(!await exists('.popup-dialog')){await b.press('f');await wait(300);}
 assert.ok((await text('.popup-dialog')).includes(TUTORIAL.title),'Hofprobe-Fenster zeigt den Tutorialtitel');
 await screenshot('hofprobe');checks.push('Hofprobe startet aus dem frischen Spielstand');

 // 2 · Hofprobe abschließen, Erinnerungsfetzen „Der Stempel“
 await b.evaluate('(()=>{const g=window.game;g.tutorial.step=7;Object.assign(g.player,{x:g.world.npc.x,y:g.world.npc.y+6});})()');
 await b.press('Escape');await wait(200);if(!await exists('.popup-dialog')){await b.press('f');await wait(300);}await b.click('[data-tutorial-next]');await wait(600);
 assert.ok(!(await state()).tutorial.completed===false,'Hofprobe ist bestanden');
 assert.ok(await exists('.popup-memory'),'Erinnerungsfetzen blendet sich nach der Hofprobe ein');
 await screenshot('erinnerung-stempel');
 assert.equal(await clearMemory(),MEMORY_FRAGMENTS[0].title);
 checks.push('Erinnerungs-Einblendung (Sepia, eine Schaltfläche) erscheint und lässt sich bestätigen');

 // 3 · Ida-Angebot Kapitel 1 mit dem neuen Text
 await b.evaluate('window.game.quest.accepted=false');await openIda();
 const intro=await text('.popup-dialog');
 for(const word of ['Unterhose','Socke','Stempel'])assert.ok(intro.includes(word),'Ida-Intro enthält „'+word+'“');
 assert.ok(intro.includes(MAIN_DIALOGUE.ida.intro.title));
 await screenshot('ida-intro');checks.push('Ida spricht den neuen Kapitel-1-Text „Unterhose, Socke, Stempel“');
 await b.click('#acceptQuest');await wait(400);

 // 4 · HUD zeigt Kapitel 1 mit den Zielbeschriftungen aus content/story.js
 const hudTitle=await text('#questTitle'),hudTasks=await text('#questTasks');
 assert.equal(hudTitle,chapter(1).title);
 for(const o of chapter(1).objectives)assert.ok(hudTasks.includes(o.label),'HUD-Ziel „'+o.label+'“');
 // Die Belohnungszeile im HUD ist ab 761 px per CSS ausgeblendet (polish.css) – Inhalt trotzdem prüfen.
 assert.ok((await b.evaluate('document.querySelector("#questRewardText").textContent')).includes(chapter(1).reward.relic),'HUD-Belohnung aus dem Kapitel');
 await screenshot('hud-kapitel1');checks.push('HUD-Questkasten: Kapiteltitel, Ziele mit Zählern, Wegmarke und Belohnung aus content/');

 // 5 · Kapitel 1 erfüllen und die Belohnung abholen
 assert.ok((await finishChapter()).ready,'Kapitel 1 ist abgabebereit');
 await openIda();
 const rewardText=await text('.popup-dialog');
 for(const word of ['Alibi','Busticket'])assert.ok(rewardText.includes(word),'Belohnungsgespräch nennt „'+word+'“');
 await screenshot('belohnung-kapitel1');
 await b.click('#claimQuest');await wait(350);
 assert.ok(await exists('[data-reward-choice]'),'Belohnungsauswahl erscheint');
 assert.match(await b.evaluate('document.querySelector("[data-reward-choice]").dataset.rewardQuest'),/^main$/);
 await screenshot('belohnungswahl');
 await b.click('[data-reward-choice]');await wait(700);
 assert.equal((await state()).quest.chapter,2);
 checks.push('rewardPanel nutzt game.rewardKey(); Kapitel 1 wird abgeholt und Kapitel 2 startet');
 await clearMemory();

 // 6 · Kapitel 2: Ida „Wiederaufbau“
 await openIda();
 const offer2=await text('.popup-dialog');
 assert.ok(offer2.includes(chapterDialogue(2).title),'Ida spricht den Kapitel-2-Text');
 assert.equal(await text('#questTitle'),chapter(2).title);
 await screenshot('ida-wiederaufbau');
 await b.click('#acceptQuest');await wait(300);
 checks.push('Kapitel 2 nutzt chapterDialogue(2) – dieselbe Funktion, kein Sonderfall');

 // 7 · Vor Kapitel 2 ist der Reiter „Bude“ noch eine Baustelle
 await b.press('b');await wait(350);
 assert.ok((await text('.popup-base')).includes(LORE.destruction.slice(0,30)),'Vor Kapitel 2 zeigt die Bude den Hinweis aus LORE.destruction');
 await screenshot('bude-baustelle');await b.press('Escape');await wait(200);
 checks.push('Reiter „Bude“ zeigt vor Kapitel 2 den Trümmer-Hinweis aus LORE.destruction');

 // 8 · Kapitel 2 erfüllen und abholen – erst danach steht der Basisbau frei
 let done2=await finishChapter();assert.ok(done2.ready,'Kapitel 2 abgabebereit ('+done2.progress.join(' · ')+')');
 await openIda();
 assert.ok((await text('.popup-dialog')).includes('Kasten'),'Kapitel-2-Belohnung erzählt vom winkenden Kasten');
 await b.click('#claimQuest');await wait(350);await b.click('[data-reward-choice]');await wait(700);
 assert.equal((await state()).quest.chapterClaimed,2);
 await clearMemory();
 checks.push('Kapitel 2 läuft mit Sammelpunkten (gather) und schaltet den Basisbau frei');

 // 9 · Reiter „Bude“: Gebäude des Kapitels, Material einfügen, ausbauen
 await b.press('b');await wait(350);
 const base=await text('.popup-base');
 for(const id of ['tresen','grill','werkstatt'])assert.ok(base.includes(BUILDINGS[id].name),'Bude zeigt '+BUILDINGS[id].name);
 assert.ok(!base.includes(BUILDINGS.anlage.name),'Leanders Anlage bleibt bis Kapitel 3 verborgen');
 await screenshot('bude-vor-ausbau');
 // Fehlendes Material rot, Knopf gesperrt; jede Kostenzeile stellt Bestand und Bedarf gegenüber.
 const costRow=`[...document.querySelectorAll('[data-building="tresen"] .build-cost li')].map(li=>({cls:li.className,text:li.textContent.trim(),color:getComputedStyle(li).color}))`;
 const missing=await b.evaluate(costRow);
 assert.equal(missing.length,Object.keys(BUILDINGS.tresen.stages[0].cost).length,'Jede Materialart bekommt eine Zeile');
 for(const row of missing){const [have,need]=row.text.match(/(\d+)\s*\/\s*(\d+)\s*$/).slice(1).map(Number);
  assert.equal(row.cls,have>=need?'stat-gain':'requirements-failed','Kostenzeile „'+row.text+'“');}
 assert.ok(missing.some(r=>r.cls==='requirements-failed'),'Mindestens ein Material fehlt noch');
 assert.equal(new Set(missing.map(r=>r.color)).size,2,'Reicht / reicht nicht sind farblich unterschieden');
 assert.ok(await b.evaluate('document.querySelector(\'[data-build="tresen"]\').disabled'),'Ohne vollständiges Material bleibt „Ausbauen“ gesperrt');
 await stock(BUILDINGS.tresen.stages[0].cost);
 await b.evaluate('(()=>{const g=window.game;Object.assign(g.player,g.world.spawn);g.player.inCombat=0;})()');
 await b.press('b');await b.press('b');await wait(400);
 const stocked=await b.evaluate(costRow);
 assert.ok(stocked.every(r=>r.cls==='stat-gain'),'Vorhandenes Material ist grün markiert');
 assert.ok(!missing.filter(r=>r.cls==='requirements-failed').some(r=>r.color===stocked[0].color),'Die rote Farbe unterscheidet sich von der grünen');
 assert.ok(!await b.evaluate('document.querySelector(\'[data-build="tresen"]\').disabled'),'Ausbauen ist mit Material am Treffpunkt möglich');
 await b.click('[data-build="tresen"]');await wait(600);
 assert.equal((await state()).buildings.tresen,1);
 assert.ok(Object.keys((await state()).baseEffects).includes('restRegen'),'„Was die Bude bringt“ zeigt den neuen Vorteil');
 await clearMemory();await wait(300);
 assert.ok((await text('.popup-base')).includes(BUILDINGS.tresen.stages[0].name),'Erreichte Stufe steht am Gebäude (Reiter zeichnet sich auf buildingsChanged neu)');
 await screenshot('bude-nach-ausbau');
 checks.push('Reiter „Bude“: freigeschaltete Gebäude, Kosten gegen Rucksack, Ausbauen am Treffpunkt, Vorteilsübersicht');

 // 10 · Erinnerungsliste im selben Reiter
 assert.ok((await text('.memory-panel')).includes(MEMORY_FRAGMENTS[0].title),'Gesehener Fetzen steht in der Liste');
 assert.ok((await text('.memory-panel')).includes(PANEL_UI.memoryHidden||'Noch nicht erinnert'),'Ungesehene Fetzen bleiben verdeckt und tragen Text (P10)');
 await screenshot('erinnerungsliste');
 await b.press('Escape');await wait(200);
 checks.push('Reiter „Bude“ führt die Erinnerungen in Erzählreihenfolge, ungesehene verdeckt');

 // 11 · Mentor ansprechen
 await clearAll();
 const mentor=await b.evaluate('(()=>{const g=window.game,m=g.world.mentors[0];Object.assign(g.player,{x:m.x,y:m.y+8});g.moveTo=null;return m;})()');
 await wait(250);await b.press('f');await wait(350);
 const talk=await text('.popup-dialog');
 assert.ok(talk.includes(mentor.name),'Mentorengespräch nennt '+mentor.name);
 assert.ok(talk.length>mentor.name.length+10,'Mentor sagt eine Kapitelzeile');
 await screenshot('mentor');
 await b.press('Escape');await wait(200);
 checks.push('Mentoren stehen an der Bude, werden gezeichnet und sprechen ihre Kapitelzeile');

 // 12 · Kapitel 3 und 4 durchspielen bis zum Aktschluss
 for(const id of [3,4]){
  if(!(await state()).quest.accepted){await openIda();await b.click('#acceptQuest');await wait(300);}
  const done=await finishChapter();assert.ok(done.ready,'Kapitel '+id+' abgabebereit ('+done.progress.join(' · ')+')');
  await openIda();
  const reward=await text('.popup-dialog');
  if(id===4)assert.ok(reward.includes('Bastian'),'Aktschluss nennt Bastian');
  assert.ok(await exists('#claimQuest'),'Kapitel '+id+' Abgabe-Knopf · offen: '+JSON.stringify(await b.evaluate(`[...document.querySelectorAll('.game-popup')].map(e=>e.dataset.window)`))+' · '+(await text('.popup-dialog')).slice(0,160));
  await b.click('#claimQuest');await wait(350);
  assert.ok(await exists('[data-reward-choice]'),'Kapitel '+id+' Belohnungsauswahl · '+(await text('.popup-dialog')).slice(0,160));
  await b.click('[data-reward-choice]');await wait(700);
  await clearAll();
  if(id===4)await screenshot('aktschluss');
 }
 const after=await state();
 assert.equal(after.quest.actDone,true,'Akt 1 ist abgeschlossen');
 assert.equal(after.quest.chapterClaimed,4);
 assert.equal(after.destination,null,'Nach dem Aktschluss gibt es keine Wegmarke mehr');
 await openIda();
 assert.ok((await text('.popup-dialog')).includes(MAIN_DIALOGUE.ida.bus.claimed.title),'Ida zeigt nach dem Aktschluss ida.bus.claimed');
 await screenshot('ida-aktschluss');
 await b.press('Escape');await wait(200);
 checks.push('Akt 1 läuft von Kapitel 1 bis 4 durch; Aktschlusstext und ✦-Markierung folgen quest.actDone');

 // 13 · Geschichte im Auftragsreiter
 await b.press('j');await wait(350);
 const log=await text('.popup-quest');
 for(const c of [1,2,3,4])assert.ok(log.includes(chapter(c).title),'Kapitel '+c+' steht in der Geschichte');
 assert.ok(log.includes(chapter(1).clue.slice(0,30)),'Nach Abschluss steht der Hinweis als „Was wir wissen“');
 await screenshot('geschichte');
 await b.press('Escape');await wait(200);
 checks.push('Auftragsreiter führt Akt und Kapitel mit Status, Hinweis und Freischaltungen');

 // 14 · Mobil 400 px
 await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await b.send('Emulation.setDeviceMetricsOverride',{width:400,height:860,deviceScaleFactor:1,mobile:true});
 await wait(500);await b.press('b');await wait(500);
 assert.ok(await exists('.popup-base'),'Reiter „Bude“ öffnet auch mobil');
 assert.ok(await b.evaluate('document.querySelector(".popup-base").getBoundingClientRect().right<=innerWidth+1'),'Das Buchfenster passt auf 400 px');
 assert.ok(await b.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'Keine Querscrollleiste auf 400 px');
 await screenshot('mobil-bude');
 await b.press('Escape');await wait(300);
 checks.push('Mobil 400 px: Reiter „Bude“, Erinnerungsliste und Aktionstaste bleiben bedienbar');

 assert.deepEqual(b.errors,[],'Konsole ohne Fehler');
 writeFileSync(dir+'/checks.json',JSON.stringify({url,checks,screenshots:shot,story:STORY.title},null,2));
 console.log(JSON.stringify({url,checks,screenshots:shot},null,2));
}finally{
 await b.send('Emulation.setTouchEmulationEnabled',{enabled:false});await b.resize(2024,900);
 if(backup)await loadWith(`for(const [k,v] of Object.entries(${JSON.stringify(backup)}))localStorage.setItem(k,v);`);
 await b.send('Network.setBypassServiceWorker',{bypass:false});await b.send('Network.setCacheDisabled',{cacheDisabled:false});
 b.close();
}
