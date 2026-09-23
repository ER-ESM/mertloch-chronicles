// Browserprüfung Dungeon „Schloss Big B" (Plan Abschnitt 14): Eingang an der Burgstraße, Betreten über F bzw. Aktion,
// Laufen im Hof, Gerds Arena mit Kegel-Warnfläche, Dungeon-Karte, Verlassen am Rolltor. Desktop und Handy.
// Aufruf: node scripts/dungeon-check.mjs [http://localhost:4173/]  → Bilder in visual-review/dungeon/
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/dungeon';mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:Number(process.env.CDP_PORT||9384),serverPort:4194}),read=s=>b.evaluate(s),checks=[];
async function tap(sel){await read(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({block:'nearest'})`);await wait(100);const p=await read(`(()=>{const r=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await wait(70);await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
async function interact(touch){if(touch&&await read(`!!document.querySelector('#touchInteract')?.offsetParent`))await tap('#touchInteract');else await b.press('f');await wait(350);}
try{
 for(const touch of [false,true]){
  const name=touch?'phone':'desktop';await b.resize(touch?390:1440,touch?844:1000);await b.send('Emulation.setTouchEmulationEnabled',{enabled:touch,maxTouchPoints:1});
  const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:10,trainingXp:9000,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:200}};
  const script=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-unlock-all','1');localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'${touch?'touch':'desktop'}'}));`});
  await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',script);
  await read(`import('/dungeon.js').then(m=>{window.D=m;const d=m.dungeonEntrance(game);game.enemies=[];Object.assign(game.player,{x:d.x,y:d.y+8});game.player.inCombat=0;for(const w of document.querySelectorAll('.popup-close,[data-close]'))w.click();return d.street;})`);
  await wait(500);assert.equal(await read(`game.interaction()?.kind`),'dungeonEnter','Eingang bietet sich an');await b.screenshot(dir+'/'+name+'-eingang.png');
  await interact(touch);assert.equal(await read('game.instance?.kind'),'dungeon','über F/Aktion betreten');
  await read(`(()=>{for(const e of game.enemies)if(!e.dungeonBoss){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}})()`);
  const y=await read('game.player.y');
  if(!touch){await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'w',code:'KeyW'});await wait(600);await b.send('Input.dispatchKeyEvent',{type:'keyUp',key:'w',code:'KeyW'});await wait(200);assert.ok(await read('game.player.y')<y-15,'Laufen im Hof');}
  assert.equal(await read(`D.roomAt(game.dungeonRun.def,game.player.x,game.player.y)?.id`),'hof');await b.screenshot(dir+'/'+name+'-hof.png');
  // Arena: Gerd greift an, Rausschmiss zeigt den Kegel
  await read(`(()=>{const g=game,r=g.dungeonRun,gerd=g.enemies.find(e=>e.bossId==='gerd');Object.assign(g.player,D.toWorld(r.def,'e0',8.5,25));gerd.aggro=true;gerd.ai='combat';g.target=gerd;g.player.inCombat=7;gerd.cycle=1;g.startCast(gerd);return gerd.cast?.type;})()`);
  await wait(500);assert.equal(await read('game.dungeonRun.arena'),'zugbruecke','Arena-Tür zu');assert.ok(await read(`!!game.enemies.find(e=>e.bossId==='gerd').cast?.cone`),'Kegel läuft');
  await b.screenshot(dir+'/'+name+'-gerd-kegel.png');
  await read(`(()=>{const gerd=game.enemies.find(e=>e.bossId==='gerd');game.kill(gerd);for(const e of game.enemies)if(e.summoner){e.hp=0;e.aggro=false;e.ai='dead';}game.player.inCombat=0;game.player.hp=game.player.maxHp;})()`);await wait(400);
  assert.ok(await read(`game.dungeonRun.seals.has('siegel-gerd')`),'Siegel erhalten');
  // Treppe runter, Karte zeigt Rittergeschoss mit Prospekt
  await read(`(()=>{Object.assign(game.player,D.toWorld(game.dungeonRun.def,'e0',5,23));game.player.inCombat=0;})()`);await wait(250);assert.equal(await read(`game.interaction()?.kind`),'dungeonStep');await interact(touch);
  assert.equal(await read(`D.floorAt(game.dungeonRun.def,game.player.x,game.player.y)`),'k1','Treppe ins Rittergeschoss');await wait(600);await b.screenshot(dir+'/'+name+'-rittergeschoss.png');
  await b.press('m');await wait(500);assert.ok(await read(`!!document.querySelector('canvas.dungeon-map')`),'Dungeon-Karte offen');assert.match(await read(`document.querySelector('canvas.dungeon-map').closest('[aria-label]')?.getAttribute('aria-label')||''`),/Karte/,'Fenster heißt Karte');assert.ok(await read(`(()=>{const c=document.querySelector('canvas.dungeon-map');return Math.abs(c.width-Math.round(c.clientWidth*Math.min(2,devicePixelRatio||1)))<=2})()`),'Karte in Bildschirmauflösung');await b.screenshot(dir+'/'+name+'-karte.png');
  await read(`document.querySelector('[data-dungeon-floor="e0"]')?.click()`);await wait(300);assert.ok(await read(`document.querySelector('[data-dungeon-floor="e0"]').classList.contains('gold-button')`),'Reiter Erdgeschoss aktiv');await wait(500);assert.ok(await read(`document.querySelector('[data-dungeon-floor="e0"]').classList.contains('gold-button')`),'Wahl bleibt beim Mitlaufen');await b.screenshot(dir+'/'+name+'-karte-e0.png');await b.press('Escape');await wait(200);
  // Zurück und raus
  await read(`(()=>{const r=game.dungeonRun;Object.assign(game.player,D.toWorld(r.def,'k1',10.5,8));game.player.inCombat=0;game.dungeonStep('treppe-zugbruecke','b');Object.assign(game.player,D.toWorld(r.def,'e0',31,36.4));})()`);await wait(300);
  assert.equal(await read(`game.interaction()?.kind`),'dungeonLeave');await interact(touch);assert.equal(await read('game.instance'),null,'am Rolltor verlassen');
  const result=name+': Eingang an der Burgstraße, Betreten, Laufen, Gerds Kegel, Siegel, Treppe, Dungeon-Karte, Verlassen';checks.push(result);console.log('PASS '+result);
 }
 assert.deepEqual(b.errors,[]);writeFileSync(dir+'/result.json',JSON.stringify({checks,errors:b.errors},null,2));
}catch(e){await b.screenshot(dir+'/failure.png').catch(()=>{});console.error(JSON.stringify({browserErrors:b.errors}));throw e;}finally{b.close();}
