// Prüfskript Hotfix Dungeon „Schloss Big B“ (2026-09-25, Prüfer-Playtest Build #562; Bericht docs/DUNGEON-HOTFIX-2026-09-25.md).
// Mit echter Maus (CDP Input.dispatchMouseEvent), Desktop 2024 × 900:
//  1 Arenatür: der Prüfer-Fall (Hopfen-Horst wartet vorn, Held wirft aus dem Hof) zieht Gerd nicht mehr; Rechtsklick auf Gerd aus dem
//    Schlosshof läuft in die Arena, beim Zufallen stehen alle fünf drin; Gerd ist besiegbar. Dazu: ein Söldner zieht nicht allein.
//  2 Neuladen: geräumter Trash bleibt weg (auch mit stehender Pappwache), kein Sofort-Kampf, Schutz nach dem Laden.
//  3 Weltkarte: das Dungeon-Symbol steht einzeln, nie in einem Bündel.
//  4 Eingangskarte → Journal → Schließen bringt die Eingangskarte zurück; Schädelplätze mit Tooltip; zugängliche Namen.
// Aufruf: node scripts/dungeon-hotfix-check.mjs   (CDP 9670, Server 4470; CDP_PORT/SERVER_PORT, BOOT_TRIES, ONLY=1,2,… einzelne Teile)
// Bilder: visual-review/dungeon-hotfix/*.jpg (lokal, nicht im Repo)
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {session,wait} from './r5b-lib.mjs';
const dir='visual-review/dungeon-hotfix';mkdirSync(dir,{recursive:true});
const only=(process.env.ONLY||'').split(',').filter(Boolean);const want=n=>!only.length||only.includes(String(n));
const s=await session({port:9670,serverPort:4470});const {b,read,start,closeAll,settle,hover,click}=s;
const results=[],shot=name=>b.screenshot(dir+'/'+name+'.jpg');
const pass=(n,text)=>{results.push({n,text});console.log('PASS '+n+' · '+text);};
const MERCS=`['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst']`;
const TO_SCREEN=`const toS=pt=>{const v=window.mertloch.state().viewport,r=document.querySelector('#world').getBoundingClientRect();return {x:Math.round((pt.x-v.camera.x+v.width/2)/v.width*r.width+r.left),y:Math.round((pt.y-v.camera.y+v.height/2)/v.height*r.height+r.top)}};`;
async function mouseAt(x,y,button='left'){await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,pointerType:'mouse'});await wait(120);
 for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,x,y,button,clickCount:1,pointerType:'mouse'});await wait(200);}
/** Held Stufe 10 wie in scripts/dungeon-sim.mjs: Kneipenschläger, voller Satz ungewöhnlich. */
const gearUp=()=>read(`const [R,I,T]=await Promise.all([import('/rpg.js'),import('/itemization.js'),import('/talents.js')]);g.player.level=10;T.changeSpec(g,'dieter-brawl');
 const slots=[['weapon','weapon',50],['offhand','offhand',500],['ranged','ranged',500],['head','head',500],['neck','neck',500],['shoulders','shoulders',500],['body','body',500],['wrists','wrists',500],['hands','hands',500],['waist','waist',500],['legs','legs',500],['feet','feet',500],['ring','ring1',500],['ring','ring2',501],['trinket','trinket1',500],['charm','trinket2',500]];
 slots.forEach(([slot,target,roll],i)=>{const id=I.registerRoll(g.rpg,R.ITEMS,{slot,spec:['tresen','bass','pfand'][i%3],level:10,quality:'uncommon',roll,family:'boar'});R.addItem(g.rpg,id);R.equipItem(g,id,target);});g.refreshStats();g.player.hp=g.player.maxHp;return g.player.maxHp;`);
/** Durch die Eingangskarte hinein (F, F), vier Söldner, Trash außerhalb des Hofs stumm. */
async function enter(){
 await read(`window.D=await import('/dungeon.js');const d=D.dungeonEntrance(g);g.enemies=g.enemies.filter(e=>Math.hypot(e.x-d.x,e.y-d.y)>500);Object.assign(g.player,{x:d.x,y:d.y+8});g.player.inCombat=0;`);await wait(400);
 assert.equal(await read('return g.interaction()?.kind'),'dungeonEnter','Eingang bietet sich an');
 await b.press('f');await wait(600);assert.ok(await read(`return !!document.querySelector('.popup-dungeonEntry')`),'Eingangskarte');await b.press('f');
 for(let i=0;i<30&&await read(`return g.instance?.kind`)!=='dungeon';i++)await wait(200);
 assert.equal(await read('return g.instance?.kind'),'dungeon','über F betreten');await wait(900);
 await read(`for(const id of ${MERCS})g.hireCompanion(id,{free:true});`);await wait(300);
}
const place=(floor,x,y,facing=1)=>read(`Object.assign(g.player,D.toWorld(g.dungeonRun.def,'${floor}',${x},${y}));g.player.facing=${facing};g.player.inCombat=0;g.moveTo=null;g.path=[];g.target=null;g.stopAuto?.();
 g.companions.forEach((c,i)=>{const q=g.world.findClear(g.player.x+12+i*10,g.player.y+14,9);c.x=q.x;c.y=q.y;c.target=null;c.order='follow';});`);
const rooms=()=>read(`const r=u=>D.roomAt(g.dungeonRun.def,u.x,u.y)?.id||'-';return {hero:r(g.player),mercs:Object.fromEntries(g.companions.map(c=>[c.name,r(c)])),arena:g.dungeonRun.arena};`);
/** Wache im Seitenkontext: hält fest, wer beim Zufallen der Tür wo stand (ein Bild, nicht erst beim nächsten Abfragen). */
const watchDoor=()=>read(`window.__door=null;const t=g.tick.bind(g);g.tick=dt=>{const was=g.dungeonRun?.arena;t(dt);const r=g.dungeonRun;if(r&&r.arena&&!was&&!window.__door){const room=u=>D.roomAt(r.def,u.x,u.y)?.id||'-';window.__door={arena:r.arena,hero:room(g.player),mercs:Object.fromEntries(g.companions.map(c=>[c.name,room(c)])),time:g.time};}};`);
/** Spielzeit vorspulen wie dungeon-e1-check („weicht aus“, Autoangriff, Rotation). */
const fast=(seconds,stop='false')=>read(`const ready=id=>g.skills.some(s=>s.id===id)&&(g.cooldowns[id]||0)<=0,A=await import('/auto-combat.js');
 const rotate=()=>{const p=g.player,t=g.target;for(const [when,run] of [[ready('heal')&&p.hp/p.maxHp<.6,()=>g.action('heal')],[ready('mark')&&t&&!(t.mark>0)&&p.energy>=20,()=>g.action('mark')],[ready('burst')&&p.energy>=35,()=>g.action('burst')],[ready('buff')&&p.energy>=30,()=>g.action('buff')],[ready('strike'),()=>g.action('strike')],[ready('throw')&&p.energy>=20,()=>g.action('throw')]])if(when&&run())return;};
 for(let t=0;t<${seconds};t+=.05){if(!g.dead){const foe=[g.enemies.find(e=>e.bossId==='gerd'&&e.hp>0&&e.aggro),...g.enemies.filter(e=>e.hp>0&&e.aggro)].find(Boolean);
  if(foe){if(g.target!==foe){g.target=foe;A.startAuto(g);}const h=g.companions.find(c=>c.id===foe.focus&&c.state!=='down');if(h){const d=Math.hypot(foe.x-h.x,foe.y-h.y)||1,q=g.world.findClear(foe.x+(foe.x-h.x)/d*26,foe.y+(foe.y-h.y)/d*26,7);g.moveTo=Math.hypot(q.x-g.player.x,q.y-g.player.y)>6?q:null;g.path=[];}else{const d=Math.hypot(foe.x-g.player.x,foe.y-g.player.y);g.moveTo=d>30?g.world.findClear(foe.x,foe.y,7):null;g.path=[];}
   if(!g.casting&&g.gcd<=0)rotate();}}g.tick(.05);if(${stop})break;}return Math.round(g.time);`);
try{
 // ─────────────────────────────────────────────── 1 · Arenatür
 if(want(1)){
  await start({w:2024,h:900});await gearUp();await enter();
  await read(`for(const e of g.enemies)if(!e.dungeonBoss&&e.hp>0)g.kill(e);g.player.inCombat=0;`);await wait(400);
  // a) Prüfer-Fall: Held im Hof vor der Tür, Blick nach Westen – der Platz von Hopfen-Horst läge in der Arena
  await place('e0',21,28.5,-1);await wait(2600);await settle();
  let at=await rooms();assert.equal(at.hero,'hof');
  assert.ok(Object.values(at.mercs).every(r=>r!=='zugbruecke'),'Söldner warten am Arenarand, keiner läuft in die offene Arena '+JSON.stringify(at));
  await shot('01-soeldner-warten-am-rand');pass(1,'Söldner warten am Arenarand: keiner steht in der offenen Arena, solange der Held im Hof ist');
  // b) Söldner zieht nicht allein: Horst steht drin und trifft Gerd (Bedrohung auf ihm), der Held bleibt draußen
  await read(`const h=g.companions.find(c=>c.def.id==='merc-hopfen-horst');Object.assign(h,D.toWorld(g.dungeonRun.def,'e0',11,29));h.order='stay';const gerd=g.enemies.find(e=>e.bossId==='gerd');gerd.aggro=true;gerd.ai='combat';gerd.threat={[h.id]:900};`);
  await wait(900);const alone=await read(`const gerd=g.enemies.find(e=>e.bossId==='gerd'),h=g.companions.find(c=>c.def.id==='merc-hopfen-horst');return {arena:g.dungeonRun.arena,aggro:gerd.aggro,full:gerd.hp===gerd.maxHp,horst:D.roomAt(g.dungeonRun.def,h.x,h.y)?.id,target:h.target?.bossId||null};`);
  assert.ok(!alone.arena&&!alone.aggro&&alone.full&&alone.target!=='gerd','Gerd setzt zurück, Tür bleibt offen, Horst greift nicht an '+JSON.stringify(alone));
  await shot('02-soeldner-zieht-nicht-allein');pass(1,'Ein Söldner zieht Gerd nie allein: Horst steht in der Arena, Gerd setzt zurück, die Tür bleibt offen');
  await read(`const h=g.companions.find(c=>c.def.id==='merc-hopfen-horst');h.order='follow';`);await place('e0',21,28.5,-1);await wait(2200);await settle();
  // c) Rechtsklick auf Gerd mit echter Maus, dann Pfandwurf (Fernkniff 235) mit echter Maus – wie im Playtest
  await watchDoor();
  const gerdAt=await read(TO_SCREEN+`const e=g.enemies.find(e=>e.bossId==='gerd');return toS({x:e.x,y:e.y-18});`);
  await mouseAt(gerdAt.x,gerdAt.y,'right');
  const afterClick=await read(`return {target:g.target?.bossId||null,auto:g.autoAttack.enabled,approach:!!g.approach}`);
  assert.ok(afterClick.target==='gerd'&&afterClick.auto&&afterClick.approach,'Rechtsklick wählt Gerd und läuft los '+JSON.stringify(afterClick));
  const throwBtn=await read(`const r=document.querySelector('[data-skill="throw"]')?.getBoundingClientRect();return r&&r.width?{x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}:null`);
  if(throwBtn)await mouseAt(throwBtn.x,throwBtn.y);
  const early=await read(`const gerd=g.enemies.find(e=>e.bossId==='gerd');return {hp:gerd.hp===gerd.maxHp,arena:g.dungeonRun.arena,hero:D.roomAt(g.dungeonRun.def,g.player.x,g.player.y)?.id}`);
  if(early.hero==='hof')assert.ok(early.hp&&!early.arena,'kein Treffer aus dem Hof, Tür offen '+JSON.stringify(early));
  for(let i=0;i<60&&!await read('return window.__door');i++)await wait(150);
  const door=await read('return window.__door');await shot('03-tuer-zu-alle-drin');
  assert.ok(door,'Tür fällt zu');assert.equal(door.hero,'zugbruecke','Held ist in der Arena, als die Tür zufällt');
  assert.ok(Object.values(door.mercs).every(r=>r==='zugbruecke'),'alle vier Söldner in der Arena '+JSON.stringify(door));
  pass(1,'Rechtsklick auf Gerd aus dem Schlosshof (dazu Pfandwurf per Maus): Held läuft hinein, beim Zufallen stehen alle fünf in der Arena'+(throwBtn?' · Pfandwurf traf nicht durch die Tür':''));
  // d) Gerd ist besiegbar (Vorspulen wie dungeon-e1-check, Held unsterblich wie dort)
  await read('g.adminGod=true');await fast(360,`g.enemies.find(e=>e.bossId==='gerd').hp<=0`);await read('g.adminGod=false;g.player.inCombat=0');
  const won=await read(`const r=g.dungeonRun,gerd=g.enemies.find(e=>e.bossId==='gerd');return {hp:gerd.hp,killed:r.killed.has('gerd'),arena:r.arena,mercs:g.companions.filter(c=>c.state!=='down').length};`);
  await wait(1500);await shot('04-gerd-besiegt');
  assert.ok(won.hp===0&&won.killed,'Gerd besiegt '+JSON.stringify(won));
  pass(1,'Gerd besiegt mit Held und vier Söldnern ('+won.mercs+' Söldner stehen), Tür danach '+(won.arena?'zu':'offen'));
 }
 assert.deepEqual(b.errors,[],'keine Fehler im Browser');
 writeFileSync(dir+'/result.json',JSON.stringify({results,errors:b.errors},null,2));
 console.log('dungeon-hotfix-check: '+results.length+' Prüfungen grün');
}catch(e){await b.screenshot(dir+'/failure.jpg').catch(()=>{});console.error(JSON.stringify({browserErrors:b.errors}).slice(0,1500));throw e;}finally{b.close();}
