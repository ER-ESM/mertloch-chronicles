// Browserprüfung Dungeon-Fix 2 (2026-09-26, Endabnahme des Prüfers Build #715, docs/DUNGEON-FIX2-2026-09-26.md). Jeder Punkt des Auftrags
// wird nachgestellt, wo es geht mit echter Maus (CDP Input.dispatchMouseEvent) und echten Tasten.
//  1 Raumtitel: Zonentitel oben beim Betreten, dann weg; in der Welt nur beim Überfahren der Plakette; nie in der Raummitte, nie im Kampf
//    (Trash im Schlosshof, Gerd in der Zugbrücke – Maus auf Raummitte, Gerd und Plakette).
//  2 Söldner-Blasen: im Dungeon und in jedem Kampf nur im Chat; draußen ohne Kampf weiter als Blase.
//  3 Erster Pull wie der Prüfer, in Echtzeit: Testheld (typische Ausrüstung) über den Testzugang, Eingangskarte, vier Söldner per Klick,
//    Rechtsklick auf den Azubi von Hof West, Tasten 1–5, kein Unterbrechen – kein Wipe, kein Tod, nur Hof West kämpft.
//  4 Söldner am Boden: im Kampf „Steht nach dem Kampf auf“ und liegt; nach dem Kampf steht er auf; ohne Kampf zählt die Frist herunter.
//  5 Boss-Beute: öffnet von selbst, sobald der Held lebt, nicht kämpft und in der Arena steht (auch von der Tür aus gewonnen); Rechtsklick auf
//    die Leiche öffnet die Beute, obwohl ein Söldner darauf steht.
//  6 Tod des Helden: kein CSS-Filter auf der Weltfläche, kein schwarzes Bild, Grauschleier blendet weich ein (Helligkeit je 100 ms).
//  7 Warnzeiten: jede Trash-Mechanik zum Ausweichen hat ≥ 2,0 s; die Warnleiste zeigt beim Regenrinnen-Hieb ≥ 2,0 s.
//  8 Testzugang: scripts/playtest-save.mjs – Schnipsel auf /precache-manifest.js, drei Voreinstellungen laden wie geplant.
//  9 Nebenbefunde: Klick auf einen ruhenden Chat-Reiter öffnet ihn (nicht die Welt); Beute legt Verpflegung nicht auf die Leiste.
// Aufruf: CDP_PORT=9703 SERVER_PORT=4503 BOOT_TRIES=450 node scripts/dungeon-fix2-check.mjs   (ONLY=1,2,… einzelne Teile)
// Bilder: visual-review/dungeon-fix2/*.jpg (lokal, nicht im Repo).
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {session,wait} from './r5b-lib.mjs';
import {gearProfile} from './gear-profiles.mjs';
import {buildPlaytestSave,snippet} from './playtest-save.mjs';
import {DUNGEON_CASTS,DUNGEON_ENEMIES} from '../content/index.js';
const dir='visual-review/dungeon-fix2';mkdirSync(dir,{recursive:true});
const only=(process.env.ONLY||'').split(',').filter(Boolean),want=n=>!only.length||only.includes(String(n));
const s=await session({port:9703,serverPort:4503});const {b,read,start,closeAll}=s;
const checks=[],shot=n=>b.screenshot(dir+'/'+n+'.jpg'),ok=t=>{checks.push(t);console.log('PASS '+t);};
const MERCS=`['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst']`;
const TYPICAL=JSON.stringify(gearProfile('typical').rolls);
/** Stufe 10, typische Ausrüstung (wie die Simulation), in den Dungeon, vier Söldner. quiet: übriger Trash liegt. */
const setup=({quiet=false,keep=[]}={})=>read(`g.player.level=10;g.player.inCombat=0;const R=await import('/rpg.js'),I=await import('/itemization.js'),T=await import('/talents.js');window.A=await import('/auto-combat.js');window.D=await import('/dungeon.js');window.DA=await import('/dungeon-art.js');
 T.changeSpec(g,'dieter-brawl');for(const k of Object.keys(g.rpg.equipment))g.rpg.equipment[k]=null;for(const r of ${TYPICAL}){const id=I.registerRoll(g.rpg,R.ITEMS,{slot:r.slot,spec:r.spec,level:r.level,quality:r.quality,roll:r.roll,family:r.family});R.addItem(g.rpg,id);R.equipItem(g,id,r.target);}g.refreshStats();g.player.hp=g.player.maxHp;
 g.enterDungeon('schloss-bigb',{force:true});for(const id of ${MERCS})g.hireCompanion(id,{free:true});
 ${quiet?`const keep=${JSON.stringify(keep)};for(const e of g.enemies)if(!e.dungeonBoss&&!keep.includes(e.pack)){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}`:''}return g.instance?.kind;`);
const place=(floor,x,y)=>read(`Object.assign(g.player,D.toWorld(g.dungeonRun.def,'${floor}',${x},${y}));g.player.inCombat=0;g.moveTo=null;g.path=[];for(const c of g.companions){const q=g.world.findClear(g.player.x+14,g.player.y+10,9);c.x=q.x;c.y=q.y;c.target=null;}return 1;`);
/** Weltpunkt → Bildschirmpunkt (wie dungeon-e2-check). */
const screen=js=>read(`const o=(${js});if(!o)return null;const st=window.mertloch.state().viewport,cv=document.querySelector('#world').getBoundingClientRect(),k=cv.width/st.width;return {x:(o.x-st.camera.x+st.width/2)*k+cv.left,y:(o.y-st.camera.y+st.height/2)/st.height*cv.height+cv.top};`);
const mouse=async(p,type='mouseMoved',button='none')=>{await b.send('Input.dispatchMouseEvent',{type,x:p.x,y:p.y,button,clickCount:type==='mouseMoved'?0:1});};
const moveMouse=async p=>{await mouse(p);await wait(120);};
const clickAt=async(p,button='left')=>{await mouse(p);await wait(60);await mouse(p,'mousePressed',button);await wait(60);await mouse(p,'mouseReleased',button);await wait(250);};
const worldTexts=()=>read(`return DA.dungeonTextStats.last`);
const settleCam=()=>s.settle();
const fightOff=()=>read(`for(const e of g.enemies)if(e.hp>0&&e.aggro){g.kill(e);}g.player.inCombat=0;g.adminGod=false;return 1;`);
const results={};
try{
 // ─────────────────────────────────────────────── 1 · Raumtitel
 if(want(1)){
  await start({w:2024,h:900});assert.equal(await setup({quiet:true,keep:['hof-west']}),'dungeon');await closeAll();
  await place('e0',50,30);await wait(1600);/* Hofkanzlei: Titel dort durch */await wait(4200);
  await place('e0',31,36);let shown=false,label='';for(let i=0;i<16&&!shown;i++){await wait(200);[shown,label]=await read(`const l=document.querySelector('.region-label');return [l.classList.contains('zone-show')&&getComputedStyle(l).visibility!=='hidden',l.innerText.replace(/\\s+/g,' ').trim()];`);}
  const top=await read(`return Math.round(document.querySelector('.region-label').getBoundingClientRect().top)`);
  await shot('01-zonentitel-oben');assert.ok(shown&&/Schlosshof/i.test(label),'Zonentitel beim Betreten: '+label);assert.ok(top<innerHeightGuess(),'Zonentitel oben ('+top+' px)');
  await wait(4600);const gone=await read(`return !document.querySelector('.region-label').classList.contains('zone-show')`);assert.ok(gone,'Zonentitel verschwindet wieder');
  ok('Zonentitel „Schlosshof“ oben beim Betreten ('+top+' px von oben), nach 3,6 s wieder weg');
  // Maus in der Raummitte und auf der Plakette, ohne Kampf
  await settleCam();const mid=await screen(`D.toWorld(g.dungeonRun.def,'e0',31,29)`);await moveMouse(mid);await wait(300);const tMid=await worldTexts();
  const plate=await screen(`(q=>q&&{x:q.x,y:q.y+3})(DA.currentPlaques(g).find(p=>p.id==='hof'))`);await moveMouse(plate);await wait(300);const tPlate=await worldTexts();await shot('02-plakette-unter-der-maus');
  assert.deepEqual(tMid,[],'Raummitte ohne Schrift: '+tMid.join(' | '));assert.ok(tPlate.includes('Schlosshof'),'Name an der Plakette: '+tPlate.join(' | '));
  ok('Ohne Kampf: Maus in der Raummitte → keine Schrift in der Welt; Maus auf der Plakette → „'+tPlate.join(' · ')+'“ an der Wand');
  // Trash-Kampf im Hof: weder Zonentitel noch Raumname, auch mit der Maus auf Raummitte oder Plakette
  await read(`g.adminGod=true;for(const e of g.enemies)if(e.pack==='hof-west'&&!e.cardboard){e.aggro=true;e.ai='combat';}return 1`);await place('e0',50,30);await wait(700);await place('e0',24,27);await wait(900);
  const fight=[];for(const p of [mid,plate,await screen(`g.enemies.find(e=>e.pack==='hof-west'&&e.hp>0)`)]){await moveMouse(p);await wait(250);fight.push(...await worldTexts());}
  const zone=await read(`const l=document.querySelector('.region-label');return {fight:document.body.classList.contains('dg-fight'),visible:l.classList.contains('zone-show')&&getComputedStyle(l).visibility!=='hidden'&&+getComputedStyle(l).opacity>.05}`);
  await moveMouse(mid);await wait(200);await shot('03-trash-kampf-ohne-titel');
  assert.ok(zone.fight,'Kampf erkannt');assert.equal(zone.visible,false,'kein Zonentitel im Kampf');assert.deepEqual(fight,[],'keine Schrift in der Welt im Kampf: '+fight.join(' | '));
  ok('Trash-Kampf im Schlosshof: kein Zonentitel, keine Schrift in der Welt (Maus auf Raummitte, Plakette und Gegner)');
  // Gerd in der Zugbrücke: Maus auf Gerd und auf die Plakette der Arena
  await fightOff();await read(`for(const e of g.enemies)if(!e.dungeonBoss&&e.hp>0){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}return 1`);await wait(500);
  await place('e0',9,29);await read(`g.adminGod=true;const gerd=g.enemies.find(e=>e.bossId==='gerd');gerd.aggro=true;gerd.ai='combat';g.target=gerd;A.startAuto(g);return 1`);await wait(2500);await settleCam();
  const onGerd=[];for(const p of [await screen(`g.enemies.find(e=>e.bossId==='gerd')`),await screen(`(q=>q&&{x:q.x,y:q.y+3})(DA.currentPlaques(g).find(p=>p.id==='zugbruecke'))`),await screen(`D.toWorld(g.dungeonRun.def,'e0',8.5,28)`)]){await moveMouse(p);await wait(250);onGerd.push(...await worldTexts());}
  await moveMouse(await screen(`g.enemies.find(e=>e.bossId==='gerd')`));await wait(200);await shot('04-gerd-ohne-raumname');
  assert.deepEqual(onGerd,[],'kein Raumname über Gerd: '+onGerd.join(' | '));
  ok('Gerds Arena im Kampf: kein Raumname über Gerds Namensschild und Balken (Maus auf Gerd, Plakette, Raummitte)');
  await fightOff();
 }
 // ─────────────────────────────────────────────── 2 · Söldner-Blasen
 if(want(2)){
  await start({w:2024,h:900});assert.equal(await setup({quiet:true,keep:['hof-west']}),'dungeon');await closeAll();await place('e0',31,36);await wait(800);
  const calmBark=await read(`const m=g.companions[1];g.bark(m,'Ruhe im Hof.','companion');await new Promise(r=>setTimeout(r,250));return {speech:(window.mertloch.state().speech||[]).map(x=>x.enemyId)}`);
  await read(`g.adminGod=true;for(const e of g.enemies)if(e.pack==='hof-west'&&!e.cardboard){e.aggro=true;e.ai='combat';}return 1`);await place('e0',24,27);await wait(1500);
  const down=await read(`const m=g.companions.find(c=>c.def.role==='damage');const C=await import('/companions.js');m.hp=1;C.hitCompanion(g,g.enemies.find(e=>e.hp>0&&e.aggro)||g.enemies[0],m,1e6);await new Promise(r=>setTimeout(r,600));const line=m.def.lines?.down||'';return {line,name:m.name,speech:(window.mertloch.state().speech||[]).map(x=>x.enemyId),chat:document.querySelector('#chatWindow .chat-log')?.innerText||''}`);
  await shot('10-soeldner-am-boden-nur-im-chat');
  assert.ok(!calmBark.speech.some(id=>String(id).startsWith('merc')),'im Dungeon keine Söldner-Blase, auch ohne Kampf');
  assert.ok(!down.speech.some(id=>String(id).startsWith('merc')),'keine Blase „'+down.line+'“ über dem Kampf');assert.ok(down.chat.includes(down.line),'Zeile steht im Chat');
  ok('Dungeon: „'+down.line+'“ ('+down.name+') nur im Chat, keine Blase; auch ohne Kampf keine Söldner-Blase im Dungeon');
  await fightOff();await read(`g.leaveDungeon({force:true});g.player.inCombat=0;return 1`);await wait(1200);
  const outside=await read(`const m=g.companions[1];g.enemies=g.enemies.filter(e=>Math.hypot(e.x-g.player.x,e.y-g.player.y)>700);g.player.inCombat=0;for(const c of g.companions)c.state='follow';await new Promise(r=>setTimeout(r,300));g.bark(m,'Schönes Wetter.','companion');await new Promise(r=>setTimeout(r,250));const calm=(window.mertloch.state().speech||[]).map(x=>x.enemyId);
   g.player.inCombat=5;g.bark(g.companions[0],'Auf sie!','companion');await new Promise(r=>setTimeout(r,250));const fight=(window.mertloch.state().speech||[]).map(x=>x.enemyId);g.player.inCombat=0;return {calm,fight,id:m.id};`);
  await shot('11-draussen-ruhe-blase');
  assert.ok(outside.calm.includes(outside.id),'draußen ohne Kampf bleibt die Blase');assert.ok(!outside.fight.includes(outside.id),'draußen im Kampf keine Söldner-Blase');
  ok('Draußen: ohne Kampf spricht der Söldner als Blase, im Kampf nur im Chat');
 }
 // ─────────────────────────────────────────────── 3 · Erster Pull wie der Prüfer (Echtzeit)
 if(want(3)){
  const built=buildPlaytestSave({preset:'vor',classId:'dieter',gear:'typical',coins:600}),code=snippet(built,'Endabnahme Zwei');
  await b.send('Page.navigate',{url:b.url+'precache-manifest.js'});await wait(1500);await b.evaluate(`localStorage.clear();localStorage.setItem('mertloch-unlock-all','1');1`);
  const hero=await b.evaluate(code);assert.match(String(hero),/Endabnahme/);await b.evaluate(`localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'desktop'}));1`);
  await b.resize(2024,900);await b.goto(b.url);await wait(2500);await read(`document.querySelector('.intro-skip')?.click();return 1`);await closeAll();
  const st0=await read(`return {level:g.player.level,hp:g.player.maxHp,slots:Object.values(g.rpg.equipment).filter(Boolean).length,coins:g.rpg.coins,name:g.heroName}`);
  // Eingangskarte mit F, vier Söldner per Klick, zweites F betritt
  await read(`const d=(await import('/dungeon.js')).dungeonEntrance(g);Object.assign(g.player,g.world.findClear(d.x,d.y+10,9));g.player.inCombat=0;return 1`);await wait(500);
  await b.press('f');await wait(700);const offers=await read(`return [...document.querySelectorAll('[data-dg-hire]')].map(x=>x.dataset.dgHire)`);
  for(const id of ['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst'])if(offers.includes(id)){await s.click(`[data-dg-hire="${id}"]`);await wait(300);}
  const hired=await read(`return g.companions.map(c=>c.name)`);await shot('20-eingangskarte-soeldner');await b.press('f');await wait(1800);
  assert.equal(await read(`return g.instance?.kind`),'dungeon','durch die Eingangskarte hinein');assert.equal(hired.length,4,'vier Söldner per Klick: '+hired.join(', '));
  await read(`window.D=await import('/dungeon.js');const p=D.toWorld(g.dungeonRun.def,'e0',31,36);Object.assign(g.player,g.world.findClear(p.x,p.y,9));for(const c of g.companions){const q=g.world.findClear(g.player.x+(Math.random()-.5)*40,g.player.y+18,9);c.x=q.x;c.y=q.y;}return 1`);await wait(1500);await settleCam();
  const target=await screen(`g.enemies.filter(e=>e.pack==='hof-west'&&!e.cardboard&&e.hp>0).sort((a,b)=>Math.hypot(a.x-g.player.x,a.y-g.player.y)-Math.hypot(b.x-g.player.x,b.y-g.player.y))[0]`);
  await clickAt({x:target.x,y:target.y-18},'right');/* Rechtsklick: hinlaufen und angreifen */
  const t0=Date.now(),log=[];let k=0,mid=false;
  while(Date.now()-t0<110000){await wait(1500);await b.press(String(1+(k++%5)));
   const st=await read(`const on=g.enemies.filter(e=>e.hp>0&&e.aggro&&e.ai==='combat');return {t:Math.round(g.time),dead:g.dead,hero:Math.round(g.player.hp/g.player.maxHp*100),down:g.companions.filter(c=>c.state==='down').map(c=>c.name),min:Math.min(...g.companions.map(c=>Math.round(c.hp/c.maxHp*100))),packs:[...new Set(on.map(e=>e.pack))],left:on.length}`);
   log.push(st);if(!mid&&Date.now()-t0>12000){mid=true;await shot('21-erster-pull-kampf');}if(Date.now()-t0>8000&&!st.left)break;}
  await wait(1500);await shot('22-erster-pull-danach');
  const downs=new Set(log.flatMap(x=>x.down)),packs=new Set(log.flatMap(x=>x.packs)),deaths=log.some(x=>x.dead),fought=log.length;
  const westLeft=await read(`return g.enemies.filter(e=>e.pack==='hof-west'&&!e.cardboard&&e.hp>0).length`);
  results.firstPull={hero:st0,log:log.map(x=>x.t+'s H'+x.hero+'% Söldner min '+x.min+'% '+x.packs.join('+')+(x.down.length?' ↓'+x.down.join(','):'')+(x.dead?' TOT':''))};
  assert.ok(!deaths,'Held stirbt nicht');assert.equal(downs.size,0,'kein Söldner fällt: '+[...downs].join(', '));assert.deepEqual([...packs].filter(p=>p!=='hof-west'),[],'nur Hof West kämpft: '+[...packs].join(', '));assert.equal(westLeft,0,'Hof West liegt');
  ok('Erster Pull wie der Prüfer (Stufe 10, typische Ausrüstung '+st0.hp+' LP, '+st0.slots+' Plätze, Rechtsklick, Tasten 1–5, kein Unterbrechen): nur Hof West, kein Tod, kein Söldner am Boden, tiefster Söldner '+Math.min(...log.map(x=>x.min))+' %');
 }
 // ─────────────────────────────────────────────── 4 · Söldner am Boden
 if(want(4)){
  await start({w:2024,h:900});assert.equal(await setup({quiet:true,keep:['hof-west']}),'dungeon');await closeAll();await place('e0',31,36);await wait(600);
  await read(`g.adminGod=true;for(const e of g.enemies)if(e.pack==='hof-west'&&!e.cardboard){e.aggro=true;e.ai='combat';}return 1`);await place('e0',24,27);await wait(1500);
  const state=()=>read(`const m=g.companions.find(c=>c.name==='Radler-Rita');const row=document.querySelector('[data-companion-row="'+m.id+'"] [data-companion-state]');return {state:m.state,text:row?.textContent||'',left:Math.round(m.downUntil-g.time)}`);
  await read(`const m=g.companions.find(c=>c.name==='Radler-Rita');const C=await import('/companions.js');m.hp=1;C.hitCompanion(g,g.enemies.find(e=>e.hp>0&&e.aggro)||g.enemies[0],m,1e6);return 1`);await wait(700);const a=await state();
  await read(`const m=g.companions.find(c=>c.name==='Radler-Rita');m.downUntil=g.time-1;return 1`);await wait(2500);const b2=await state();await shot('30-am-boden-nach-dem-kampf');
  assert.equal(a.state,'down');assert.match(a.text,/Steht nach dem Kampf auf/,'Anzeige im Kampf: '+a.text);assert.equal(b2.state,'down','im Kampf steht niemand auf, auch nach der Frist');assert.match(b2.text,/Steht nach dem Kampf auf/,'Anzeige bleibt ehrlich: '+b2.text);assert.doesNotMatch(b2.text,/in 0 s/);
  await fightOff();let c2=null;for(let i=0;i<12;i++){await wait(250);c2=await state();if(c2.state!=='down')break;}
  assert.notEqual(c2.state,'down','nach dem Kampf steht Rita auf: '+JSON.stringify(c2));
  await read(`const m=g.companions.find(c=>c.name==='Radler-Rita');const C=await import('/companions.js');m.hp=1;C.hitCompanion(g,g.enemies.find(e=>e.hp>0&&e.aggro)||g.enemies[0],m,1e6);return 1`);await wait(700);const d=await state();await read(`const m=g.companions.find(c=>c.name==='Radler-Rita');m.downUntil=g.time+2;return 1`);let e2=null;for(let i=0;i<20;i++){await wait(250);e2=await state();if(e2.state!=='down')break;}
  assert.match(d.text,/Steht in \d+ s wieder auf/,'ohne Kampf die Frist: '+d.text);assert.notEqual(e2.state,'down','nach der Frist steht sie auf');
  ok('Söldner am Boden: im Kampf „'+a.text+'“, bleibt nach Ablauf der Frist liegen, steht nach dem Kampf auf; ohne Kampf „'+d.text+'“ und steht nach der Frist auf');
 }
 // ─────────────────────────────────────────────── 5 · Boss-Beute
 if(want(5)){
  await start({w:2024,h:900});assert.equal(await setup({quiet:true}),'dungeon');await closeAll();
  // A · Der Held liegt beim Sieg als Geist (wie beim Prüfer nach dem Trash-Wipe): kein Fenster, solange er liegt; er steht am Kontrollpunkt
  //     im Hof auf (außer Reichweite) – noch kein Fenster; er betritt die Arena → das Fenster öffnet von selbst (vorher: ein Versuch nach 1,4 s)
  const lootOpen=`return !!document.querySelector('.game-popup[data-window="loot"]')`;
  await place('e0',9,29);await read(`g.adminGod=false;const gerd=g.enemies.find(e=>e.bossId==='gerd');gerd.aggro=true;gerd.ai='combat';return 1`);await wait(1500);
  const ghost=await read(`const gerd=g.enemies.find(e=>e.bossId==='gerd');g.hitPlayer(gerd,g.player.maxHp*5);await new Promise(r=>setTimeout(r,300));g.kill(gerd);await new Promise(r=>setTimeout(r,2600));return {dead:g.dead,open:!!document.querySelector('.game-popup[data-window="loot"]'),bag:!!g.rpg.loot.find(x=>x.moment)}`);
  assert.ok(ghost.dead&&ghost.bag,'Held liegt, Beutel liegt '+JSON.stringify(ghost));assert.equal(ghost.open,false,'als Geist kein Fenster');
  /* Dungeon-Fix 3 (Big-B-Abnahme #721): Der Kampf ist vorbei – der Knopf heißt jetzt „Hier aufstehen“ statt „Am Kontrollpunkt aufstehen“
     (= Kampf aufgeben), und der Held steht am Ort auf; hilft die Heilerin vorher auf, ebenso. Mit echter Maus. */
  const btn=await read(`const b=document.querySelector('[data-ds-wake]'),r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,label:b.textContent,dead:g.dead}`);if(btn.dead){assert.equal(btn.label,'Hier aufstehen','nach dem Sieg kein „Kampf aufgeben“');await clickAt(btn);}
  let opened=false;for(let i=0;i<20&&!opened;i++){await wait(200);opened=await read(lootOpen);}
  const far=await read(`return {dead:g.dead,room:D.roomAt(g.dungeonRun.def,g.player.x,g.player.y)?.id}`);
  await shot('40-beute-moment-arena');assert.equal(far.dead,false,'am Ort aufgestanden');assert.equal(far.room,'zugbruecke','in der Arena, nicht am Kontrollpunkt');assert.ok(opened,'in der Arena öffnet der Beute-Moment von selbst');
  ok('Boss-Beute: Held lag beim Sieg als Geist → kein Fenster; nach dem Sieg '+(btn.dead?'„Hier aufstehen“ per Maus':'von der Heilerin aufgeholfen')+', am Ort in der Arena öffnet es von selbst');
  // B · Rechtsklick auf die Leiche, Hopfen-Horst steht darauf
  await closeAll();await read(`document.querySelector('.game-popup[data-window="loot"] [data-window-close]')?.click();return 1`);await wait(300);
  await read(`const bag=g.rpg.loot.find(x=>x.moment);const h=g.companions.find(c=>c.name==='Hopfen-Horst');h.order='stay';h.x=bag.x;h.y=bag.y+2;const p=g.world.findClear(bag.x+30,bag.y+20,9);Object.assign(g.player,p);return 1`);await wait(600);await settleCam();
  const corpse=await screen(`g.rpg.loot.find(x=>x.moment)`);await clickAt({x:corpse.x,y:corpse.y-8},'right');await wait(400);
  const rc=await read(`return {loot:!!document.querySelector('.game-popup[data-window="loot"]'),companions:!!document.querySelector('.game-popup[data-window="companions"]')}`);await shot('41-rechtsklick-leiche');
  assert.ok(rc.loot,'Rechtsklick öffnet die Beute');assert.equal(rc.companions,false,'nicht das Söldnerfenster');
  ok('Rechtsklick auf die Leiche mit Hopfen-Horst darauf: Beutefenster, kein Söldnerfenster');
 }
 // ─────────────────────────────────────────────── 6 · Tod des Helden
 if(want(6)){
  await start({w:2024,h:900});assert.equal(await setup({quiet:true,keep:['hof-west']}),'dungeon');await closeAll();await place('e0',31,36);await wait(600);
  await read(`for(const e of g.enemies)if(e.pack==='hof-west'&&!e.cardboard){e.aggro=true;e.ai='combat';}return 1`);await place('e0',24,27);await wait(1500);await settleCam();
  const lum=`const c=document.querySelector('#world'),x=window.__lx||(window.__lx=document.createElement('canvas'));x.width=96;x.height=48;const k=x.getContext('2d');k.drawImage(c,0,0,96,48);const d=k.getImageData(0,0,96,48).data;let s=0;for(let i=0;i<d.length;i+=4)s+=d[i]*.3+d[i+1]*.59+d[i+2]*.11;return {lum:Math.round(s/(d.length/4)),filter:getComputedStyle(c).filter,dead:g.dead}`;
  const before=[];for(let i=0;i<5;i++){before.push(await read(lum));await wait(100);}
  await read(`const e=g.enemies.find(e=>e.pack==='hof-west'&&e.hp>0&&!e.cardboard);g.hitPlayer(e,g.player.maxHp*5);return g.dead`);
  const after=[];for(let i=0;i<22;i++){after.push(await read(lum));if([1,3,6,12,20].includes(i))await shot('50-tod-'+String(i*100).padStart(4,'0')+'ms');await wait(100);}
  const base=before.reduce((n,x)=>n+x.lum,0)/before.length,min=Math.min(...after.map(x=>x.lum)),filters=[...new Set(after.map(x=>x.filter))],steps=after.slice(1).map((x,i)=>Math.abs(x.lum-after[i].lum));
  results.death={base:Math.round(base),series:after.map(x=>x.lum),dead:after.map(x=>x.dead?1:0).join(''),filters};console.log('Helligkeit',JSON.stringify(results.death));
  assert.ok(after.some(x=>x.dead),'Held ist tot');assert.deepEqual(filters,['none'],'kein CSS-Filter auf der Weltfläche');assert.ok(min>base*.35,'nie schwarz: tiefste Helligkeit '+min+' gegen '+Math.round(base));
  assert.ok(Math.max(...steps)<base*.3,'weicher Übergang: größter Sprung '+Math.max(...steps)+' je 100 ms');assert.ok(after.at(-1).lum<base*.9,'danach liegt der Grauschleier');
  ok('Tod des Helden: kein CSS-Filter, Helligkeit '+Math.round(base)+' → '+after.at(-1).lum+' in Schritten ≤ '+Math.max(...steps)+' je 100 ms, nie unter '+min+' (kein schwarzes Bild)');
 }
 // ─────────────────────────────────────────────── 7 · Warnzeiten
 if(want(7)){
  const trashSets=new Set(Object.values(DUNGEON_ENEMIES).map(e=>e.castSet)),short=[];
  for(const set of trashSets)for(const [id,c] of Object.entries(DUNGEON_CASTS[set]?.casts||{}))if((c.cone||c.ground)&&c.total<2)short.push(set+'.'+id+' '+c.total+' s');
  assert.deepEqual(short,[],'Trash-Mechaniken unter 2,0 s: '+short.join(', '));
  await start({w:2024,h:900});assert.equal(await setup({quiet:true,keep:['hof-west']}),'dungeon');await closeAll();await place('e0',31,36);await wait(600);
  await read(`g.adminGod=true;for(const e of g.enemies)if(e.pack==='hof-west'&&!e.cardboard){e.aggro=true;e.ai='combat';}return 1`);await place('e0',24,27);
  let seen=null;const t0=Date.now();while(!seen&&Date.now()-t0<40000){seen=await read(`const r=[...document.querySelectorAll('.boss-alerts .ba-row')].find(x=>/Regenrinnen-Hieb/.test(x.textContent));return r?r.querySelector('.ba-time').textContent:null`);if(!seen)await wait(60);}
  await shot('60-warnleiste-hieb');const secs=parseFloat(String(seen).replace(',','.'));
  assert.ok(secs>=2,'Warnleiste zeigt beim Erscheinen ≥ 2,0 s: '+seen);
  ok('Warnzeiten: keine Trash-Mechanik zum Ausweichen unter 2,0 s; die Warnleiste zeigt „Regenrinnen-Hieb“ beim Erscheinen mit '+seen);
  await fightOff();
 }
 // ─────────────────────────────────────────────── 8 · Testzugang
 if(want(8)){
  const res={};
  for(const preset of ['vor','siegel','bigb']){
   const built=buildPlaytestSave({preset,classId:'dieter',gear:'typical',coins:600}),code=snippet(built,'Test '+preset);
   await b.send('Page.navigate',{url:b.url+'precache-manifest.js'});await wait(1200);await b.evaluate(`localStorage.clear();localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'desktop'}));1`);
   const name=await b.evaluate(code);await b.resize(2024,900);await b.goto(b.url);await wait(2500);await read(`document.querySelector('.intro-skip')?.click();return 1`);await closeAll();
   const st=await read(`const D=await import('/dungeon.js'),r=g.dungeonRun;return {name:g.heroName,level:g.player.level,xp:g.player.xp,coins:g.rpg.coins,slots:Object.values(g.rpg.equipment).filter(Boolean).length,mercs:g.companions.map(c=>c.name),inside:g.instance?.kind||'',room:r?D.roomAt(r.def,g.player.x,g.player.y)?.id:null,seals:r?[...r.seals]:[],killed:r?[...r.killed]:[],found:r?[...(r.found||[])]:[],trash:r?r.trash.size:0}`);
   res[preset]=st;await shot('70-testzugang-'+preset);
   assert.equal(st.level,10);assert.equal(st.xp,0,'Stufe 10 · 0 EP');assert.equal(st.coins,600);assert.ok(st.slots>=10,'typische Ausrüstung: '+st.slots+' Plätze');
   if(preset==='vor'){assert.equal(st.inside,'');const d=await read(`const d=(await import('/dungeon.js')).dungeonEntrance(g);return Math.round(Math.hypot(d.x-g.player.x,d.y-g.player.y))`);assert.ok(d<80,'vor der Garage ('+d+' E)');}
   else{assert.equal(st.inside,'dungeon');assert.equal(st.mercs.length,4);assert.deepEqual(st.seals.sort(),['siegel-expose','siegel-gerd','siegel-kurt']);assert.equal(st.room,'gewoelbe','am Kontrollpunkt Weinkeller (Gang davor)');
    const door=await read(`const D=await import('/dungeon.js'),r=g.dungeonRun,d=r.def.doors.find(x=>x.id==='tresor');return D.doorOpen(r,d)`);assert.ok(door,'Tresortür offen');}
   if(preset==='bigb'){assert.equal(st.found.length,3,'drei Beweise gefunden');for(const k of ['gerd','expose','rita','halbespferd','korkenkurt'])assert.ok(st.killed.includes(k),k+' liegt');assert.ok(!st.killed.includes('bigb'));}
  }
  results.playtest=res;
  ok('Testzugang: „vor“ (draußen, '+res.vor.slots+' Plätze, 600 Pfandmarken), „siegel“ (drei Siegel, Tresortür offen, '+res.siegel.trash+' Packs geräumt, vier Söldner), „bigb“ (alle Bosse bis Big B, drei Beweise, '+res.bigb.trash+' Packs geräumt) – nur Heldenliste und Spielstand im localStorage');
 }
 // ─────────────────────────────────────────────── 9 · Chat-Reiter und Verpflegung
 if(want(9)){
  await start({w:2024,h:900});await closeAll();await read(`g.enemies=g.enemies.filter(e=>Math.hypot(e.x-g.player.x,e.y-g.player.y)>700);return 1`);
  await moveMouse({x:1000,y:420});await wait(900);
  const tabs=await read(`const w=document.querySelector('#chatWindow');return {active:w.classList.contains('active'),tabs:[...w.querySelectorAll('[data-chat-tab]')].map(b=>{const r=b.getBoundingClientRect();return {id:b.dataset.chatTab,x:r.x+r.width/2,y:r.y+r.height/2,w:r.width}})}`);
  assert.equal(tabs.active,false,'Chat ruht');const loot=tabs.tabs.find(t=>t.id==='loot')||tabs.tabs.at(-1);
  const before=await read(`return {moveTo:!!g.moveTo,target:g.target?.id??null}`);
  await clickAt({x:loot.x,y:loot.y});await wait(300);
  const after=await read(`const w=document.querySelector('#chatWindow');return {active:w.classList.contains('active'),tab:w.querySelector('[aria-selected=true]')?.dataset.chatTab,moveTo:!!g.moveTo}`);await shot('80-chat-reiter-geklickt');
  assert.ok(after.active,'Chat geht auf');assert.equal(after.tab,loot.id,'der geklickte Reiter ist gewählt');assert.equal(after.moveTo,false,'die Welt bekam den Klick nicht');
  ok('Chat in Ruhe: Klick auf den Reiter „'+loot.id+'“ öffnet das Fenster mit diesem Reiter, die Welt bekommt den Klick nicht');
  // Verpflegung aus Beute legt sich nicht auf die Leiste
  const food=await read(`const R=await import('/rpg.js');g.rpg.barSeen=(g.rpg.barSeen||[]).filter(x=>x!=='brezel');const bar=R.actionBar(g);for(let i=0;i<bar.length;i++)if(bar[i]==='item:brezel')bar[i]=null;const was=JSON.stringify(R.actionBar(g));
   g.settings.autoLoot=true;const bag={id:'drop-test',x:g.player.x+4,y:g.player.y,coins:0,items:[{id:'brezel',count:1}],source:{name:'Security-Azubi',kind:'enemy'}};g.rpg.loot.push(bag);R.autoLootBag(g,bag);return {was,now:JSON.stringify(R.actionBar(g)),has:R.countItem(g.rpg,'brezel')}`);
  assert.equal(food.now,food.was,'Leiste unverändert');assert.ok(food.has>0,'Brezel im Rucksack');
  ok('Verpflegung aus Beute (Notfallbrezel) landet im Rucksack, nicht ungefragt auf der Leiste');
 }
 console.log('\n'+checks.length+' Prüfungen grün');writeFileSync(dir+'/ergebnis.json',JSON.stringify({checks,results},null,1));
}catch(e){console.error('ROT',e.message);try{await shot('zz-fehler');}catch{}process.exitCode=1;}
finally{b.close();}
function innerHeightGuess(){return 330;}
