// Browserprüfung Dungeon Etappe 1 „Gerd richtig“ (E-71, docs/DUNGEON-ETAPPE-1-2026-09-25.md): Trash-Pack zieht keine Kette,
// Kegel endet an der Wand, Gerd mit vier Söldnern, Tod als Geist mit Aufhelfen (Todesbildschirm mit Fahne des Kontrollpunkts),
// Boss-Beute als Beute-Moment mit Siegelmarken ohne Anlegen, Neuladen setzt den Durchgang fort. Desktop 1600 × 900, dazu der
// Todesbildschirm am Handy (390 × 844). Aufruf: CDP_PORT=9602 SERVER_PORT=4402 BOOT_TRIES=400 node scripts/dungeon-e1-check.mjs
// → Bilder in visual-review/dungeon-e1/ (.jpg).
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/dungeon-e1';mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:Number(process.env.CDP_PORT||9602),serverPort:Number(process.env.SERVER_PORT||4402)}),read=s=>b.evaluate(s),checks=[];
const shot=async n=>{await b.screenshot(dir+'/'+n+'.jpg');};
const ok=t=>{checks.push(t);console.log('PASS '+t);};
const MERCS=`['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst']`;
const place=(floor,x,y)=>read(`(()=>{const g=game;Object.assign(g.player,D.toWorld(g.dungeonRun.def,'${floor}',${x},${y}));g.player.inCombat=0;g.moveTo=null;g.path=[];for(const c of g.companions){const q=g.world.findClear(g.player.x+14,g.player.y+10,9);c.x=q.x;c.y=q.y;c.target=null;}})()`);
/** Spielzeit im Seitenkontext vorspulen (Logik wie im Spiel, ohne auf Bilder zu warten). Der Held spielt dabei wie in
 *  scripts/dungeon-sim.mjs „weicht aus“: steht hinter dem Boss (vom Söldner aus, der ihn hält), Autoangriff, Rotation des
 *  Balance-Sheets. stop: Abbruchbedingung als Ausdruck. */
const fast=(seconds,stop='false')=>read(`(()=>{const g=game;for(let t=0;t<${seconds};t+=.05){if(!g.dead){const foe=[g.enemies.find(e=>e.bossId==='gerd'&&e.hp>0),...g.enemies.filter(e=>e.hp>0&&e.aggro)].find(Boolean);
  if(foe){if(g.target!==foe){g.target=foe;A.startAuto(g);}const h=g.companions.find(c=>c.id===foe.focus&&c.state!=='down');if(h){const d=Math.hypot(foe.x-h.x,foe.y-h.y)||1,q=g.world.findClear(foe.x+(foe.x-h.x)/d*26,foe.y+(foe.y-h.y)/d*26,7);g.moveTo=Math.hypot(q.x-g.player.x,q.y-g.player.y)>6?q:null;g.path=[];}else{const d=Math.hypot(foe.x-g.player.x,foe.y-g.player.y);g.moveTo=d>30?g.world.findClear(foe.x,foe.y,7):null;g.path=[];}
   if(!g.casting&&g.gcd<=0)B.rotate(g);}}g.tick(.05);if(${stop})break;}return Math.round(g.time);})()`);
/** Held wie in der Simulation: Kneipenschläger, voller Satz ungewöhnlich auf Stufe 10. */
const gearUp=()=>read(`Promise.all([import('/rpg.js'),import('/itemization.js'),import('/talents.js'),import('/auto-combat.js')]).then(([R,I,T,A])=>{window.A=A;
 /* Rotation wie scripts/balance-rotation.mjs (vereinfacht: .mjs liefert der Prüfserver nicht als Modul aus) */window.B={rotate(g){const p=g.player,t=g.target,ready=id=>g.skills.some(s=>s.id===id)&&(g.cooldowns[id]||0)<=0;
  for(const [when,run] of [[ready('heal')&&p.hp/p.maxHp<.6,()=>g.action('heal')],[ready('mark')&&t&&!(t.mark>0)&&p.energy>=20,()=>g.action('mark')],[ready('burst')&&p.energy>=35,()=>g.action('burst')],[ready('buff')&&p.energy>=30,()=>g.action('buff')],[ready('strike'),()=>g.action('strike')],[ready('throw')&&p.energy>=20,()=>g.action('throw')]])if(when&&run())return true;return false;}};const g=game;T.changeSpec(g,'dieter-brawl');
 const slots=[['weapon','weapon',50],['offhand','offhand',500],['ranged','ranged',500],['head','head',500],['neck','neck',500],['shoulders','shoulders',500],['body','body',500],['wrists','wrists',500],['hands','hands',500],['waist','waist',500],['legs','legs',500],['feet','feet',500],['ring','ring1',500],['ring','ring2',501],['trinket','trinket1',500],['charm','trinket2',500]];
 slots.forEach(([slot,target,roll],i)=>{const id=I.registerRoll(g.rpg,R.ITEMS,{slot,spec:['tresen','bass','pfand'][i%3],level:10,quality:'uncommon',roll,family:'boar'});R.addItem(g.rpg,id);R.equipItem(g,id,target);});g.refreshStats();g.player.hp=g.player.maxHp;return g.player.maxHp;})`);
async function boot(touch){
 await b.resize(touch?390:1600,touch?844:900);await b.send('Emulation.setTouchEmulationEnabled',{enabled:touch,maxTouchPoints:1});
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:10,trainingXp:9000,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:200}};
 const script=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.clear();localStorage.setItem('mertloch-unlock-all','1');localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'${touch?'touch':'desktop'}'}));`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',script);await module();
}
const module=()=>read(`import('/dungeon.js').then(m=>{window.D=m;for(const w of document.querySelectorAll('.popup-close,[data-close]'))w.click();return 1;})`);
async function enter(){
 await read(`(()=>{const d=D.dungeonEntrance(game);game.enemies=game.enemies.filter(e=>Math.hypot(e.x-d.x,e.y-d.y)>500);Object.assign(game.player,{x:d.x,y:d.y+8});game.player.inCombat=0;})()`);await wait(400);
 assert.equal(await read('game.interaction()?.kind'),'dungeonEnter','Eingang bietet sich an');await b.press('f');await wait(500);
 assert.equal(await read('game.instance?.kind'),'dungeon','über F betreten');
 await read(`(()=>{for(const id of ${MERCS})game.hireCompanion(id,{free:true});})()`);await wait(300);
}
const deathState=()=>read(`(()=>{const s=document.querySelector('#deathScreen');return {open:!!s&&!s.hidden,wake:s?.querySelector('[data-ds-wake]')?.textContent||'',flag:s?.querySelector('[data-ds-flag]')?.textContent||'',ghost:s?.querySelector('[data-ds-ghost-text]')?.textContent||'',dead:game.dead};})()`);
try{
 // ---------- Desktop ----------
 await boot(false);await gearUp();await enter();await wait(900);await shot('01-hof-mit-soeldnern');
 // 1) Trash-Pack zieht keine Kette: Held zieht hof-west, hof-ost 18 m daneben bleibt stehen
 await read(`(()=>{for(const e of game.enemies)if(!e.dungeonBoss&&e.pack!=='hof-west'&&e.pack!=='hof-ost'){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}})()`);
 await place('e0',22,28.5);await wait(2500);
 const packs=await read(`(()=>{const f=p=>game.enemies.filter(e=>e.pack===p&&!e.cardboard);return {west:f('hof-west').map(e=>e.aggro),east:f('hof-ost').map(e=>e.aggro)};})()`);
 assert.ok(packs.west.every(Boolean),'eigener Pack kommt mit '+JSON.stringify(packs));assert.ok(packs.east.every(x=>!x),'Nachbarpack bleibt stehen '+JSON.stringify(packs));
 await shot('02-pack-ohne-kette');ok('Trash-Pack: hof-west kommt geschlossen, hof-ost bleibt stehen (keine Kette)');
 await read(`(()=>{for(const e of game.enemies)if(e.pack==='hof-west'||e.pack==='hof-ost')if(e.hp>0)game.kill(e);game.player.inCombat=0;})()`);await wait(600);
 // 2) Kegel endet an der Wand: Gerd an der Arenawand, Kegel Richtung Hof; Held hinter der Wand nimmt nichts
 await place('e0',17.5,22.5);
 const wall=await read(`(()=>{const g=game,gerd=g.enemies.find(e=>e.bossId==='gerd');Object.assign(gerd,D.toWorld(g.dungeonRun.def,'e0',13,28.5));const angle=Math.atan2(g.player.y-gerd.y,g.player.x-gerd.x);
  for(const c of g.companions){const q=g.world.findClear(...Object.values(D.toWorld(g.dungeonRun.def,'e0',34+g.companions.indexOf(c)*2,34)),9);c.x=q.x;c.y=q.y;c.order='stay';}
  const base={name:'Rausschmiss · nicht vor ihm stehen',total:1.8,damage:650,pct:.6,cone:{angle:70,range:88},tankSafe:.25,knockback:64};gerd.cast={...base,type:'rausschmiss',remaining:1.1,angle};const reach=D.coneReach(g.world,gerd,gerd.cast);
  const hp=g.player.hp;D.resolveDungeonCast(g,gerd,{...base,angle},'merc');return {hit:hp-g.player.hp,short:Math.min(...reach),range:base.cone.range,sight:g.world.lineClear(gerd,g.player)};})()`);
 await wait(250);await shot('03-kegel-endet-an-der-wand');
 assert.equal(wall.hit,0,'kein Treffer durch die Wand '+JSON.stringify(wall));assert.ok(wall.short<wall.range&&!wall.sight,'Warnfläche an der Wand gekürzt '+JSON.stringify(wall));
 ok('Kegel: Warnfläche und Treffer enden an der Wand, der Held dahinter nimmt nichts');
 await read(`(()=>{const gerd=game.enemies.find(e=>e.bossId==='gerd');gerd.cast=null;Object.assign(gerd,gerd.home);for(const c of game.companions)c.order='follow';})()`);
 // 3) Gerd mit vier Söldnern
 await place('e0',12,34);
 await read(`(()=>{const g=game,gerd=g.enemies.find(e=>e.bossId==='gerd');for(const e of g.enemies)if(!e.dungeonBoss&&e.hp>0){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}gerd.aggro=true;gerd.ai='combat';g.target=gerd;g.player.inCombat=7;g.startAuto?.();})()`);
 await wait(3500);assert.equal(await read('game.dungeonRun.arena'),'zugbruecke','Arena zu');await shot('04-gerd-mit-soeldnern');
 // 4) Tod als Geist: Held fällt, Söldner kämpfen weiter, Schorle-Susi hilft auf
 await read(`(()=>{const g=game,gerd=g.enemies.find(e=>e.bossId==='gerd');window.__revived=null;const o=g.emit.bind(g);g.emit=(t,d)=>{if(t==='revived')window.__revived={pct:Math.round(g.player.hp/g.player.maxHp*100),from:d?.from};return o(t,d);};g.hitPlayer(gerd,1e6,false);})()`);await wait(900);
 let ds=await deathState();assert.ok(ds.open&&ds.dead,'Todesbildschirm offen');assert.match(ds.wake,/Am Kontrollpunkt aufstehen/,'Knopf im Dungeon');assert.match(ds.flag,/Schlosshof/,'Fahne des Kontrollpunkts sichtbar');
 const world=await read(`(()=>{const gerd=game.enemies.find(e=>e.bossId==='gerd');return {hp:gerd.hp,time:game.time}})()`);await wait(1500);
 const later=await read(`(()=>{const gerd=game.enemies.find(e=>e.bossId==='gerd');return {hp:gerd.hp,time:game.time,channel:game.companions.find(c=>c.channel)?.name||''}})()`);
 assert.ok(later.time>world.time&&later.hp<world.hp,'Welt läuft weiter, Söldner treffen Gerd '+JSON.stringify([world,later]));
 await wait(2500);ds=await deathState();await shot('05-geist-soeldner-helfen-auf');
 assert.match(ds.ghost,/hilft dir auf|kämpfen weiter/,'Streifen zeigt Aufhelfen '+ds.ghost);
 for(let i=0;i<30&&(await read('game.dead'));i++)await wait(500);
 ds=await deathState();assert.ok(!ds.dead&&!ds.open,'aufgeholfen, Todesbildschirm weg '+JSON.stringify(ds));
 const rev=await read('window.__revived');const hpPct=rev?.pct;assert.ok(hpPct>=30&&hpPct<=40&&rev.from==='Schorle-Susi','beim Aufhelfen 35 % Leben '+JSON.stringify(rev));
 await wait(500);await shot('06-aufgeholfen');ok('Tod als Geist: Welt läuft weiter, Todesbildschirm mit Fahne „Schlosshof“, Schorle-Susi hilft auf ('+hpPct+' % Leben)');
 // Rest des Kampfs vorspulen; bei Phase 2 die Warnlinie der Kante zeigen
 await read('game.adminGod=true');await fast(120,`(()=>{const e=g.enemies.find(e=>e.bossId==='gerd');return e.hp<e.maxHp*.45;})()`);await wait(700);await shot('07-gerd-phase2-kante');
 const equippedBefore=await read(`Object.values(game.rpg.equipment).filter(Boolean).length`);
 await fast(360,`g.enemies.find(e=>e.bossId==='gerd').hp<=0`);
 const won=await read(`(()=>{const g=game,r=g.dungeonRun,gerd=g.enemies.find(e=>e.bossId==='gerd');return {hp:gerd.hp,killed:r.killed.has('gerd'),seal:r.seals.has('siegel-gerd'),marks:g.dungeons['schloss-bigb'].marks,bag:g.rpg.loot.find(b=>b.moment)?.id||null};})()`);
 assert.ok(won.hp===0&&won.killed&&won.seal,'Gerd besiegt '+JSON.stringify(won));assert.equal(won.marks,4,'2 Siegelmarken plus 2 Tagesbonus');assert.ok(won.bag,'Boss-Beute liegt als Beutel');
 ok('Gerd mit Held und vier Söldnern besiegt, Siegel erhalten');
 await read('game.adminGod=false;game.player.inCombat=0');
 // 5) Beute-Moment: Fenster öffnet sich, Siegelmarken im Kopf, nichts wird angelegt
 for(let i=0;i<12&&!(await read(`!!document.querySelector('.game-popup[data-window="loot"] [data-loot-moment]')`));i++)await wait(250);
 const loot=await read(`(()=>{const w=document.querySelector('.game-popup[data-window="loot"]');return {open:!!w,head:w?.querySelector('.loot-moment-title')?.textContent||'',chips:[...(w?.querySelectorAll('.loot-chip')||[])].map(c=>c.textContent.trim()),items:w?.querySelectorAll('[data-loot-item]').length||0};})()`);
 assert.ok(loot.open&&/Gerd/.test(loot.head),'Beute-Moment offen '+JSON.stringify(loot));assert.ok(loot.chips.some(c=>c==='+4'),'Siegelmarken im Kopf '+JSON.stringify(loot));assert.ok(loot.items>=1,'mindestens ein Teil');
 await wait(300);await shot('08-beute-moment');
 await read(`document.querySelector('.game-popup[data-window="loot"] [data-take-loot]')?.click()`);await wait(500);
 const after=await read(`({equipped:Object.values(game.rpg.equipment).filter(Boolean).length,bag:game.rpg.loot.some(b=>b.moment),inv:game.rpg.inventory.length})`);
 assert.equal(after.equipped,equippedBefore,'nichts ungefragt angelegt '+JSON.stringify(after));assert.ok(!after.bag&&after.inv>0,'Beute im Rucksack');
 ok('Boss-Beute: Beute-Moment mit Siegelmarken (+4) und '+loot.items+' Teil(en), nichts angelegt');
 // 6) Neuladen setzt fort
 await read(`game.emit('save')`);await wait(800);await b.goto(b.url);await module();await wait(1200);
 const resumed=await read(`(()=>{const r=game.dungeonRun;return r?{inside:game.instance?.kind,killed:r.killed.has('gerd'),seal:r.seals.has('siegel-gerd'),room:D.roomAt(r.def,game.player.x,game.player.y)?.id,gerd:game.enemies.find(e=>e.bossId==='gerd').hp,trash:[...r.trash].length}:null;})()`);
 assert.ok(resumed&&resumed.inside==='dungeon'&&resumed.killed&&resumed.seal&&resumed.gerd===0,'Neuladen setzt fort '+JSON.stringify(resumed));
 await shot('09-neuladen-setzt-fort');ok('Neuladen: wieder im Dungeon am Kontrollpunkt ('+resumed.room+'), Gerd liegt, Siegel da, '+resumed.trash+' geräumte Packs');
 // ---------- Handy: Todesbildschirm im Dungeon ----------
 await boot(true);await read(`(()=>{game.enterDungeon('schloss-bigb',{force:true});for(const id of ${MERCS})game.hireCompanion(id,{free:true});})()`);await wait(500);
 await place('e0',12,34);await read(`(()=>{const g=game,gerd=g.enemies.find(e=>e.bossId==='gerd');for(const e of g.enemies)if(!e.dungeonBoss){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}gerd.aggro=true;gerd.ai='combat';g.target=gerd;})()`);
 await wait(2500);await read(`game.hitPlayer(game.enemies.find(e=>e.bossId==='gerd'),1e6,false)`);await wait(2500);
 ds=await deathState();assert.ok(ds.open&&/Kontrollpunkt/.test(ds.wake),'Handy: Todesbildschirm im Dungeon');await shot('10-handy-geist');
 await read(`document.querySelector('[data-ds-wake]').click()`);await wait(800);
 const wake=await read(`({dead:game.dead,room:D.roomAt(game.dungeonRun.def,game.player.x,game.player.y)?.id,gerd:game.enemies.find(e=>e.bossId==='gerd').hp===game.enemies.find(e=>e.bossId==='gerd').maxHp})`);
 assert.ok(!wake.dead&&wake.room==='hof'&&wake.gerd,'Am Kontrollpunkt aufstehen: Hof, Gerd zurückgesetzt '+JSON.stringify(wake));await shot('11-handy-kontrollpunkt');
 ok('Handy: „Am Kontrollpunkt aufstehen“ gibt den Kampf auf, Held steht im Schlosshof, Gerd setzt zurück');
 assert.deepEqual(b.errors,[],'keine Fehler im Browser');writeFileSync(dir+'/result.json',JSON.stringify({checks,errors:b.errors},null,2));
 console.log('dungeon-e1-check: '+checks.length+' Prüfungen grün');
}catch(e){await b.screenshot(dir+'/failure.jpg').catch(()=>{});console.error(JSON.stringify({browserErrors:b.errors}).slice(0,1500));throw e;}finally{b.close();}
