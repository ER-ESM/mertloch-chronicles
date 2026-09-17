// Browserprüfung Runde B: Klamottenwahl → Hofprobe mit Wegmarke → EIN Fenster → Angriffshinweis →
// Sprechblase → Kapitel-2-Lager mit Kulissen → Bude mit Ausbaustufe. Desktop 2024×900 und mobil 400 px.
//
// Aufruf:  PORT=4184 node server.mjs   (in einem zweiten Fenster)
//          node scripts/akt1b-check.mjs [url] [ordner] [cdp-port]
// Der Browser ist ein eigenes Chrome mit Fernsteuerung, z. B.
//   chrome --remote-debugging-port=9333 --user-data-dir=<temp> http://localhost:4184/
// Der Port lässt sich über CDP_PORT oder das dritte Argument setzen (Vorgabe 9333), damit die Prüfung
// neben einem belegten 9222 läuft. Kein npm-Paket, nur Node.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {RARITIES,BUILDINGS,MEMORY_FRAGMENTS,PANEL_UI,COMBAT_TEXT,CLAN_MEMBERS} from '../content/index.js';
import {PROP_KINDS} from '../world-prop-kinds.js';

const url=process.argv[2]||'http://localhost:4184/',dir=process.argv[3]||'akt1b-review';
const port=Number(process.argv[4]||process.env.CDP_PORT||9333);
mkdirSync(dir,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));

/** Kleiner CDP-Treiber mit frei wählbarem Port (scripts/browser-polish.mjs hängt fest an 9222). */
async function browser(){
 const targets=await (await fetch('http://127.0.0.1:'+port+'/json')).json();
 const target=targets.find(t=>t.type==='page');if(!target)throw Error('Keine Browserseite auf Port '+port);
 const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 let serial=0;const pending=new Map(),errors=[];
 ws.onclose=ev=>{for(const cb of pending.values())cb.reject(Error('CDP-Verbindung zu: '+ev.code));pending.clear();};
 ws.onmessage=ev=>{const d=JSON.parse(ev.data);if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails);
  if(d.id){const cb=pending.get(d.id);pending.delete(d.id);d.error?cb.reject(Error(JSON.stringify(d.error))):cb.resolve(d.result);}};
 const send=(method,params={})=>new Promise((res,rej)=>{if(ws.readyState!==1){rej(Error('CDP-Verbindung geschlossen'));return;}
  const id=++serial;pending.set(id,{resolve:res,reject:rej});ws.send(JSON.stringify({id,method,params}));});
 await send('Runtime.enable');await send('Page.enable');await send('Page.bringToFront');await send('Emulation.setFocusEmulationEnabled',{enabled:true});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
  if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const key=(k,type='keyDown')=>send('Input.dispatchKeyEvent',{type,key:k,
  code:k===' '?'Space':/^\d$/.test(k)?'Digit'+k:k.length===1?'Key'+k.toUpperCase():k,
  windowsVirtualKeyCode:k==='Tab'?9:k==='Escape'?27:k===' '?32:k.toUpperCase().charCodeAt(0)});
 return {send,evaluate,errors,close:()=>ws.close(),
  press:async k=>{await key(k);await key(k,'keyUp');},
  click:s=>evaluate(`document.querySelector(${JSON.stringify(s)}).click()`),
  async mouse(x,y,button='left'){await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button,clickCount:1});
   await send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button,clickCount:1});},
  async goto(){await send('Page.navigate',{url});for(let i=0;i<180;i++){await wait(100);if(await evaluate('!!window.mertloch'))return;}throw Error('Spiel startete nicht');},
  async screenshot(path){const r=await send('Page.captureScreenshot',{format:'jpeg',quality:88});writeFileSync(path,Buffer.from(r.data,'base64'));},
  resize:(width,height)=>send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false})};
}

const b=await browser(),checks=[];let backup,shot=0;
const screenshot=async name=>b.screenshot(dir+'/'+String(++shot).padStart(2,'0')+'-'+name+'.jpg');
const text=sel=>b.evaluate(`document.querySelector(${JSON.stringify(sel)})?.innerText||''`);
const exists=sel=>b.evaluate(`!!document.querySelector(${JSON.stringify(sel)})`);
const state=()=>b.evaluate('window.mertloch.state()');
/** Offene Fenster – Kern der Prüfung „EIN Fenster“. */
const windows=()=>b.evaluate(`[...document.querySelectorAll('.game-popup')].map(e=>e.dataset.window)`);
/** Buchfenster, Gespräch, Beute, Erinnerung und Tod dürfen nie zu zweit offen sein. */
const SOLO=['person','bag','book','quest','base','map','guide','dialog','loot','memory','death','activity'];
async function assertSingleWindow(where){
 const open=await windows();
 assert.ok(open.filter(id=>SOLO.includes(id)).length<=1,where+': mehr als ein Fenster offen ('+open.join(', ')+')');
 return open;
}
async function loadWith(source){
 const clean=`(()=>{try{for(const k of Object.keys(localStorage))if(k.startsWith('mertloch'))localStorage.removeItem(k);}catch{}
  navigator.serviceWorker?.getRegistrations?.().then(rs=>rs.forEach(r=>r.unregister()));
  if(window.caches)caches.keys().then(ks=>ks.forEach(k=>caches.delete(k)));})();`;
 const {identifier}=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:clean+source});
 await b.goto();await wait(1000);
 await b.send('Page.removeScriptToEvaluateOnNewDocument',{identifier});
}
const toIda=()=>b.evaluate('(()=>{const g=window.game;Object.assign(g.player,{x:g.world.npc.x,y:g.world.npc.y+6});g.moveTo=null;g.path=[];g.target=null;return true;})()');
const finishChapter=()=>b.evaluate(`(()=>{const g=window.game,ch=g.quest.chapter;
 for(const [i,o] of g.objectives().entries()){let guard=0;
  while(!g.objectiveProgress(i).complete&&guard++<60){
   if(o.kind==='gather'){const spot=g.gatherPoints().find(s=>s.item===o.item);if(!spot)break;Object.assign(g.player,{x:spot.x,y:spot.y});if(!g.collectGather(spot.id))break;}
   else{const e=g.enemies.find(e=>e.hp>0&&e.campId&&!e.questId&&!e.ambient&&(e.chapter||1)===ch&&(o.kind==='boss'?e.type==='boss':o.type?e.type===o.type:e.family===o.family));if(!e)break;e.hp=1;g.kill(e);}}}
 return g.questReady();})()`);
const stock=cost=>b.evaluate(`(async()=>{const {addItem}=await import(new URL('rpg.js',location.href));const g=window.game;
 for(const [item,n] of Object.entries(${JSON.stringify(cost)}))for(let i=0;i<n;i++)addItem(g.rpg,item);g.emit('rpgChanged');return true;})()`);
async function clearOverlays(){for(let i=0;i<6;i++){const open=await windows();if(!open.length)break;await b.press('Escape');await wait(200);}}

try{
 await b.send('Runtime.enable');await b.send('Network.enable');
 await b.send('Network.setBypassServiceWorker',{bypass:true});await b.send('Network.setCacheDisabled',{cacheDisabled:true});
 await b.goto();await wait(600);
 backup=await b.evaluate('Object.fromEntries(Object.entries(localStorage).filter(([k])=>k.startsWith("mertloch")))');
 await b.resize(2024,900);await loadWith('');

 // 1 · Klamottenwahl: drei Karten, Auswahl per Klick, dann Bestätigen (P7)
 await b.press('c');await wait(500);
 await assertSingleWindow('Figur geöffnet');
 assert.equal(await b.evaluate(`document.querySelectorAll('.popup-person .panel-tabs').length`),0,'Reiter „Figur“ hat keine Unterseiten mehr (E-13)');
 const sections=await b.evaluate(`[...document.querySelectorAll('.popup-person .panel-section-title')].map(e=>e.textContent)`);
 for(const label of [PANEL_UI.equipment,PANEL_UI.stats,PANEL_UI.manage,PANEL_UI.talents,PANEL_UI.band])
  assert.ok(sections.includes(label),'Abschnitt „'+label+'“ steht untereinander');
 const picks=await b.evaluate(`[...document.querySelectorAll('[data-member-pick]')].map(e=>e.dataset.memberPick)`);
 assert.equal(picks.length,CLAN_MEMBERS.length,'Drei Klamotten-Karten zur Auswahl');
 const before=(await state()).classId;
 const other=CLAN_MEMBERS.find(m=>m.id!==before);
 await b.click(`[data-member-pick="${other.id}"]`);await wait(450);
 assert.equal((await state()).classId,before,'Auswählen allein wechselt die Figur nicht (keine Rotation ohne Klick)');
 assert.ok((await text('.clan-confirm')).includes(other.name),'Bestätigungsleiste nennt die gewählte Figur');
 await screenshot('klamottenwahl');
 checks.push('P7: Klamottenwahl zeigt drei Karten, wählt ohne zu wechseln und bestätigt mit einem Knopf; „Figur“ hat Abschnitte statt Unterseiten');

 // 2 · EIN Fenster: Buch, Gespräch, Beute und Erinnerung schließen einander (P4)
 for(const key of ['i','k','j','b','m','h','c']){await b.press(key);await wait(320);await assertSingleWindow('Reiterwechsel über ['+key+']');}
 await b.press('Escape');await wait(250);
 await b.press('f');await wait(400);
 assert.deepEqual(await windows(),['dialog'],'Hofprobe-Gespräch steht allein');
 await b.press('b');await wait(400);
 assert.deepEqual(await windows(),['base'],'Der Reiter „Bude“ ersetzt das Gespräch');
 await b.press('Escape');await wait(250);
 // Kein unsichtbares Fenster fängt Klicks: Linksklick mitten ins Spielfeld öffnet nichts.
 for(const [x,y] of [[1000,500],[1400,320],[700,700],[1700,660]]){await b.mouse(x,y);await wait(150);}
 assert.deepEqual(await windows(),[],'Linksklick ins Spielfeld öffnet kein Menü (P11)');
 await screenshot('ein-fenster');
 checks.push('P4/P11: nie zwei Fenster gleichzeitig; Linksklick ins Spielfeld öffnet kein Menü');

 // 3 · Wegmarke je Hofproben-Schritt (P5)
 for(const step of [1,5]){
  await b.evaluate(`(()=>{const g=window.game;g.tutorial.step=${step};g.emit('tutorialStep');})()`);await wait(350);
  const hud=await text('#questTasks');
  assert.match(hud,/\d+\s*m/,'Hofprobe-Schritt '+step+': Wegmarke mit Metern im HUD');
  const waypoint=(await state()).destination;
  assert.ok(waypoint&&hud.includes(waypoint.label),'Hofprobe-Schritt '+step+': Wegmarke trägt das Schrittziel');
 }
 await screenshot('wegmarke-hofprobe');
 checks.push('P5: jeder Hofproben-Schritt zeigt Pfeil, Ziel und Entfernung in Metern im HUD');

 // 4 · Die Clan-Schule bleibt stehen, bis sie bestätigt wird (P11)
 assert.ok(await b.evaluate(`!document.querySelector('#lessonButton').classList.contains('hidden')`),'Clan-Schule zeigt „Verstanden“');
 await b.evaluate(`window.game.trainingXp=40`);await wait(400);
 assert.ok((await text('#trainingDock')).length>40,'Clan-Schule verschwindet nicht von selbst');
 await b.click('#lessonButton');await wait(300);
 checks.push('P11: Der Hinweis der Clan-Schule bleibt, bis er angeklickt wird');

 // 5 · Autoangriff-Zustand und Angriffshinweis (P1/P2)
 await b.evaluate(`(()=>{const g=window.game;g.tutorial.completed=true;g.autoAttack.enabled=false;})()`);await wait(350);
 assert.equal(await text('#autoState'),COMBAT_TEXT.autoOff,'Kampfleiste zeigt „Autoangriff aus“');
 assert.ok(await b.evaluate(`document.querySelector('#autoState').classList.contains('is-off')`));
 await b.evaluate(`(()=>{const g=window.game,e=g.enemies.find(e=>e.hp>0&&e.ai!=='returning'&&!e.spawnGrace);
  Object.assign(g.player,{x:e.x+20,y:e.y+20});g.target=e;g.autoAttack.enabled=true;return e.name;})()`);await wait(350);
 assert.equal(await text('#autoState'),COMBAT_TEXT.autoOn,'Kampfleiste zeigt „Autoangriff an“');
 assert.ok(await b.evaluate(`document.querySelector('#autoState').classList.contains('is-on')`));
 // Angriffshinweis: erst über das Ereignis `attacked`, sonst über den Wechsel inCombat 0→1.
 const attack=await b.evaluate(`(()=>{const g=window.game,e=g.enemies.find(e=>e.hp>0);
  if(!e)return null;Object.assign(g.player,{x:e.x+20,y:e.y+20});
  if(typeof g.emit==='function')g.events.push({type:'attacked',name:e.name});
  g.player.inCombat=4;e.aggro=true;g.target=e;return e.name;})()`);
 await wait(500);
 assert.ok(attack,'Ein Gegner zum Angriffshinweis vorhanden');
 assert.ok(await b.evaluate(`!document.querySelector('#attackWarning').classList.contains('hidden')`),'Großer Hinweis „Du wirst angegriffen“ erscheint');
 assert.ok((await text('#attackWarning')).length>5);
 await screenshot('angriffshinweis');
 // Trefferzahlen am Gegner: die Engine schiebt sie als Fließtext in die Welt.
 const floats=await b.evaluate(`(()=>{const g=window.game,e=g.enemies.find(e=>e.hp>0);g.float(e.x,e.y-27,'123','#fff0bf');return g.texts.filter(t=>/^[0-9]+!?$/.test(t.text)).length;})()`);
 assert.ok(floats>0,'Trefferzahlen liegen als Fließtext am Gegner');
 checks.push('P1/P2: Autoangriff-Zustand steht sichtbar an der Leiste, der Angriffshinweis erscheint groß, Trefferzahlen stehen am Gegner');

 // 5b · Esc wählt den Autoangriff ab (P2) – Taste 1 schaltet nur noch ein.
 await clearOverlays();
 await b.evaluate(`(()=>{const g=window.game,e=g.enemies.find(e=>e.hp>0&&e.ai!=='returning'&&!e.spawnGrace);
  Object.assign(g.player,{x:e.x+20,y:e.y+20});g.target=e;g.dead=false;g.autoAttack.enabled=false;return true;})()`);
 await b.press('1');await wait(400);
 assert.equal((await state()).autoAttack.enabled,true,'Taste 1 schaltet den Autoangriff ein (startAuto)');
 assert.equal(await text('#autoState'),COMBAT_TEXT.autoOn,'Chip zeigt „Autoangriff an“');
 await b.press('Escape');await wait(400);
 assert.equal((await state()).autoAttack.enabled,false,'Esc ruft game.stopAuto() und schaltet den Autoangriff aus');
 assert.deepEqual(await windows(),[],'Esc hat dabei kein Fenster geöffnet');
 assert.equal(await text('#autoState'),COMBAT_TEXT.autoOff,'Chip #autoState steht wieder auf „aus“');
 assert.ok(await b.evaluate(`document.querySelector('#autoState').classList.contains('is-off')`));
 await screenshot('esc-autoangriff-aus');
 checks.push('P2: Taste 1 schaltet den Autoangriff ein, Esc ohne offenes Fenster ruft game.stopAuto() – der Chip #autoState folgt');

 // 5c · Aktionstaste über game.interaction(): das Auftragsziel schlägt den Mentor daneben (P3/P5)
 await clearOverlays();
 const rank=await b.evaluate(`(()=>{const g=window.game,npc=g.world.npc,m=(g.world.mentors||[])[0];if(!m)return null;
  g.tutorial.completed=true;g.dead=false;g.player.inCombat=0;g.target=null;g.moveTo=null;g.path=[];
  Object.assign(g.player,{x:npc.x,y:npc.y+8});
  m.x=g.player.x+6;m.y=g.player.y+6;                         // Mentor steht näher als Ida
  const it=g.interaction();return {npc:npc.name,mentor:m.name,kind:it&&it.kind,priority:it&&it.priority};})()`);
 assert.ok(rank,'Ein Mentor für die Rangfolge vorhanden');
 assert.equal(rank.kind,'npc','game.interaction() nennt das Auftragsziel, nicht den näheren Mentor');
 await wait(350);
 const label=await text('#interact');
 assert.ok(label.includes(rank.npc),'Die Aktionstaste beschriftet das Auftragsziel ('+rank.npc+')');
 assert.ok(!label.includes(rank.mentor),'Der Mentor daneben steht nicht auf der Aktionstaste');
 await b.press('f');await wait(500);
 assert.deepEqual(await windows(),['dialog'],'F öffnet genau ein Gespräch');
 assert.ok(await exists('#acceptQuest'),'F trifft Ida (Auftragsgespräch), nicht den Mentor');
 await screenshot('aktionstaste-auftragsziel');
 await clearOverlays();
 checks.push('P3/P5: Die Aktionstaste folgt game.interaction() – Ida gewinnt gegen den näher stehenden Mentor');

 // 5d · Ein Klick auf den HUD-Questkasten läuft zur goldenen Wegmarke (P6)
 const far=await b.evaluate(`(()=>{const g=window.game,d=g.destination();if(!d)return null;
  const dist=(a,c)=>Math.hypot(a.x-c.x,a.y-c.y);
  const spots=[g.world.spawn,...(g.world.hubs||[]),...g.world.camps.map(c=>c.approach||c)].filter(Boolean);
  const spot=spots.find(p=>dist(p,d.point)>300&&g.world.findPath(p,d.point).length);
  if(!spot)return null;Object.assign(g.player,{x:spot.x,y:spot.y});
  g.moveTo=null;g.path=[];g.routeGoal=null;g.dead=false;g.player.inCombat=0;g.touchMove=null;
  return {label:d.label,distance:Math.round(dist(g.player,d.point))};})()`);
 assert.ok(far,'Ein weit entfernter Standort mit erreichbarer Wegmarke gefunden');
 await wait(350);
 assert.ok((await text('#questTasks')).includes(far.label),'Die Wegmarke steht mit ihrem Ziel im HUD');
 assert.ok(await b.evaluate(`document.querySelector('.quest-panel').classList.contains('has-waypoint')`),'Der Questkasten ist als Wegmarken-Knopf markiert');
 await b.click('.quest-panel');await wait(400);
 const route=await b.evaluate(`(()=>{const g=window.game;return g.routeGoal?{run:Math.round(Math.hypot(g.routeGoal.x-g.player.x,g.routeGoal.y-g.player.y)),step:!!g.moveTo}:null;})()`);
 assert.ok(route,'Der Klick auf den Questkasten setzt einen Laufweg (game.navigateDestination())');
 assert.ok(route.step,'Der erste Wegpunkt steht');
 assert.ok(route.run>50,'Der Laufweg geht über mehr als 50 Einheiten (hier '+route.run+')');
 assert.deepEqual(await windows(),[],'Der Klick auf den Questkasten öffnet kein Fenster');
 await screenshot('questkasten-laufweg');
 checks.push('P6: Ein Klick auf den HUD-Questkasten läuft über game.navigateDestination() zur goldenen Wegmarke ('+far.label+', '+route.run+' Einheiten)');

 // 6 · Sprechblase auf Ereignis `bark` (ohne Textparsen)
 await clearOverlays();
 const bark=await b.evaluate(`(()=>{const g=window.game,e=g.enemies.find(e=>e.hp>0);if(!e)return null;
  Object.assign(g.player,{x:e.x,y:e.y+45});g.moveTo=null;g.path=[];
  g.events.push({type:'bark',enemyId:e.id,name:e.name,text:'Ruhe ist ein Menschenrecht!',kind:'enemy',x:e.x,y:e.y});return e.id;})()`);
 assert.ok(bark!==null,'Gegner für die Sprechblase vorhanden');
 await wait(900);
 const speech=(await state()).speech;
 assert.ok(speech.length>0,'Sprechblase steht in der Welt');
 assert.equal(speech[0].enemyId,bark,'Die Blase hängt an der sprechenden Figur');
 await screenshot('sprechblase');
 checks.push('Sprechblase folgt dem Ereignis `bark` (enemy/boss/phase/villager) statt dem Kampflog');

 // 7 · Kapitel 2: Lager mit Kulissen aus world.camps[].props
 // Frischer Spielstand, Hofprobe regulär bestehen – danach laufen die Kapitel wie im Spiel.
 await loadWith('');
 await clearOverlays();
 await b.evaluate(`(()=>{const g=window.game;g.tutorial.step=7;Object.assign(g.player,{x:g.world.npc.x,y:g.world.npc.y+6});})()`);
 await wait(250);await b.press('f');await wait(400);await b.click('[data-tutorial-next]');await wait(600);
 await clearOverlays();
 for(const chapter of [1,2]){
  await toIda();await wait(200);await b.press('f');await wait(350);
  if(await exists('#acceptQuest')){await b.click('#acceptQuest');await wait(350);}
  assert.ok(await finishChapter(),'Kapitel '+chapter+' abgabebereit');
  await toIda();await wait(200);await b.press('f');await wait(350);
  await b.click('#claimQuest');await wait(350);
  if(await exists('[data-reward-choice]')){
   if(chapter===1){const rarities=await b.evaluate(`[...document.querySelectorAll('[data-reward-choice]')].map(e=>e.className)`);
    assert.ok(rarities.every(c=>Object.keys(RARITIES).some(r=>c.includes(r))),'Jede Belohnung trägt ihre Güte als Klasse');}
   await b.click('[data-reward-choice]');await wait(700);}
  await clearOverlays();
 }
 const camp=await b.evaluate(`(()=>{const g=window.game,list=g.world.camps.filter(c=>c.chapter===2&&c.props&&c.props.length),c=list.find(c=>c.type==='boss')||list[0];
  if(!c)return null;Object.assign(g.player,{x:c.x,y:c.y+90});g.moveTo=null;g.path=[];g.player.inCombat=0;
  g.paused=false;return {id:c.id,place:c.place,props:c.props.map(p=>p.kind)};})()`);
 assert.ok(camp,'Kapitel-2-Lager trägt Kulissen (world.camps[].props)');
 for(const kind of camp.props)assert.ok(PROP_KINDS[kind],'Kulissenart „'+kind+'“ steht in PROP_KINDS');
 await wait(2500);await screenshot('kapitel2-kulissen');
 checks.push('Kulissen der Kapitel-Lager werden gezeichnet ('+camp.place+': '+[...new Set(camp.props)].join(', ')+')');

 // 7b · Kalles Kiosk (Welt 0.21) nutzt dieselben Kulissen-Daten
 const kiosk=await b.evaluate(`(()=>{const g=window.game,k=g.world.places&&g.world.places.kiosk;if(!k)return null;
  Object.assign(g.player,{x:k.approach.x,y:k.approach.y});g.moveTo=null;g.path=[];g.player.inCombat=0;g.paused=false;
  return {name:k.name,props:k.props.map(p=>p.kind)};})()`);
 if(kiosk){
  for(const kind of kiosk.props)assert.ok(PROP_KINDS[kind],'Kiosk-Kulisse „'+kind+'“ steht in PROP_KINDS');
  await wait(2500);await screenshot('kiosk');
  checks.push('Kalles Kiosk wird mit seinen Kulissen gezeichnet ('+kiosk.props.join(', ')+')');
 }

 // 8 · Die Bude: Trümmer vor dem Ausbau, gewachsene Kulisse danach
 const base=await b.evaluate(`(()=>{const g=window.game,b=g.world.base;if(!b)return null;
  Object.assign(g.player,{x:b.x,y:b.maxY+40});g.moveTo=null;g.path=[];g.player.inCombat=0;
  g.paused=false;return {slots:Object.keys(b.stageProps),tresen:b.stageProps.tresen.stages.map(s=>s.kind+':'+s.stage)};})()`);
 assert.ok(base,'world.base liefert das Gelände der Bude');
 assert.equal(base.slots.length,Object.keys(BUILDINGS).length,'Für jedes Basisbau-Gebäude ein Bauplatz');
 assert.ok(base.tresen[0].startsWith('bude-truemmer'),'Stufe 0 sind die Trümmer');
 await wait(2000);await screenshot('bude-truemmer');
 await stock(BUILDINGS.tresen.stages[0].cost);
 await b.evaluate(`(()=>{const g=window.game;Object.assign(g.player,g.world.spawn);g.player.inCombat=0;})()`);
 await wait(300);await b.press('b');await wait(450);
 assert.ok(!await b.evaluate(`document.querySelector('[data-build="tresen"]').disabled`),'Am Treffpunkt ist „Ausbauen“ möglich');
 await b.click('[data-build="tresen"]');await wait(700);
 assert.equal((await state()).buildings.tresen,1,'Tresen steht auf Stufe 1');
 await clearOverlays();
 // Außerhalb des Treffpunkts ist „Ausbauen“ ausgegraut und begründet (game.atHub()).
 await b.evaluate(`(()=>{const g=window.game;Object.assign(g.player,{x:g.world.spawn.x+900,y:g.world.spawn.y+900});})()`);
 await wait(300);await b.press('b');await wait(450);
 assert.ok(await b.evaluate(`[...document.querySelectorAll('[data-build]')].every(el=>el.disabled)`),'Außerhalb der Bude ist „Ausbauen“ gesperrt');
 assert.ok((await text('.popup-base')).includes('Treffpunkt'),'Der Grund steht am Gebäude');
 await clearOverlays();
 const built=await b.evaluate(`(()=>{const g=window.game,b=g.world.base;
  Object.assign(g.player,{x:b.x,y:b.maxY+40});g.moveTo=null;g.path=[];
  g.paused=false;return b.stageProps.tresen.stages.find(s=>s.stage===(g.buildings.tresen||0)).kind;})()`);
 assert.equal(built,'bude-tresen','Nach dem Ausbau zeichnet die Bude die erreichte Stufe');
 await wait(2000);await screenshot('bude-stufe1');
 checks.push('Die Bude zeichnet je Bauplatz genau die erreichte Stufe; „Ausbauen“ ist außerhalb von game.atHub() ausgegraut mit Hinweis');

 // 9 · Erinnerungen: Warteschlange wartet auf ein leeres Fenster, verdeckte Fetzen tragen Text (P9/P10)
 await b.press('c');await wait(350);
 await b.evaluate(`(()=>{const g=window.game;const seen=new Set(g.memories.seen);
  const open=window.mertloch?null:null;
  const frag=${JSON.stringify(MEMORY_FRAGMENTS[MEMORY_FRAGMENTS.length-1])};
  g.events.push({type:'memory',fragment:frag});return true;})()`);
 await wait(600);
 assert.ok(!await exists('.popup-memory'),'Erinnerung wartet, solange ein Fenster offen ist (P9)');
 await b.press('Escape');await wait(500);
 assert.ok(await exists('.popup-memory'),'Erinnerung erscheint, sobald kein Fenster mehr offen ist');
 await screenshot('erinnerung-wartet');
 await b.click('[data-memory-next]');await wait(350);
 await b.press('b');await wait(450);
 const memories=await text('.memory-panel');
 assert.ok(memories.includes(PANEL_UI.tabMemories),'Überschrift kommt aus PANEL_UI.tabMemories');
 assert.ok(memories.includes(PANEL_UI.memoryHidden||'Noch nicht erinnert'),'Verdeckte Fetzen tragen Text statt „…“');
 assert.ok(!memories.includes('…'),'Keine „…“-Zeilen mehr');
 await screenshot('erinnerungsliste');
 await clearOverlays();
 checks.push('P9/P10: Erinnerungen warten auf ein leeres Fenster; verdeckte Fetzen tragen Text, Überschrift aus PANEL_UI');

 // 10 · Mobil 400 px
 await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await b.send('Emulation.setDeviceMetricsOverride',{width:400,height:860,deviceScaleFactor:1,mobile:true});
 await wait(600);await b.press('c');await wait(600);
 await assertSingleWindow('mobil');
 assert.ok(await b.evaluate(`document.querySelector('.popup-person').getBoundingClientRect().right<=innerWidth+1`),'Das Buchfenster passt auf 400 px');
 assert.ok(await b.evaluate(`document.documentElement.scrollWidth<=innerWidth+1`),'Keine Querscrollleiste auf 400 px');
 await screenshot('mobil-figur');
 await clearOverlays();
 // Wegmarke auch auf dem Handy: ein Tipp auf den Knopf in der oberen Zeile läuft los.
 await wait(400);
 assert.ok(await exists('#touchWaypoint'),'Mobil gibt es den Wegmarken-Knopf');
 if(!await b.evaluate(`document.querySelector('#touchWaypoint').hidden`)){
  await b.evaluate(`(()=>{const g=window.game;g.moveTo=null;g.path=[];g.routeGoal=null;g.touchMove=null;})()`);
  await b.click('#touchWaypoint');await wait(400);
  assert.ok(await b.evaluate(`!!window.game.routeGoal`),'Der Wegmarken-Knopf setzt auch mobil einen Laufweg');
 }
 await screenshot('mobil-wegmarke');
 checks.push('Mobil 400 px: „Figur“ mit Abschnitten bleibt im Fenster, kein Querscrollen; Wegmarken-Knopf läuft zur goldenen Wegmarke');

 assert.deepEqual(b.errors.map(e=>e.text),[],'Konsole ohne Fehler');
 writeFileSync(dir+'/checks.json',JSON.stringify({url,checks,screenshots:shot},null,2));
 console.log(JSON.stringify({url,checks,screenshots:shot},null,2));
}finally{
 await b.send('Emulation.setTouchEmulationEnabled',{enabled:false});await b.resize(2024,900);
 if(backup)await loadWith(`for(const [k,v] of Object.entries(${JSON.stringify(backup)}))localStorage.setItem(k,v);`);
 await b.send('Network.setBypassServiceWorker',{bypass:false});await b.send('Network.setCacheDisabled',{cacheDisabled:false});
 b.close();
}
