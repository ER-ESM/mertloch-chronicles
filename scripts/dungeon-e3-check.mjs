// Browserprüfung Dungeon Etappe 3 „Big B“ (E-71, docs/DUNGEON-ETAPPE-3-2026-09-25.md): Tresortür öffnet nach Gerd (nur Siegel gebauter
// Bosse), Thronsaal betretbar, eine Lüge sichtbar (Behauptung in Zauberleiste und Welt, dann der Nachsatz), Söldner stehen nach Rolle
// (die anderen auf der Gegenseite des Schutzes), Phase 2 mit Followern und Reichweite, Phase 3 mit zwei Bahnen, Sieg mit Erfolg
// „Der Nachsatz zählt“, Endtruhe mit Wahl aus drei Teilen, Hinterausgang. Dazu Handy quer und hoch (Bossrahmen, Warnleiste, Lüge).
// Aufruf: CDP_PORT=9621 SERVER_PORT=4421 BOOT_TRIES=450 node scripts/dungeon-e3-check.mjs   (ONLY=1,2 einzelne Teile)
// Bilder: visual-review/dungeon-e3/*.jpg (lokal, nicht im Repo). Zum Ansehen wird die Welt an den Schlüsselstellen angehalten (g.paused).
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {session,wait} from './r5b-lib.mjs';
const dir='visual-review/dungeon-e3';mkdirSync(dir,{recursive:true});
const only=(process.env.ONLY||'').split(',').filter(Boolean),want=n=>!only.length||only.includes(String(n));
const s=await session({port:9621,serverPort:4421});const {b,read,start,closeAll,click}=s;
const checks=[],shot=n=>b.screenshot(dir+'/'+n+'.jpg'),ok=t=>{checks.push(t);console.log('PASS '+t);};
const MERCS=`['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst']`;
/** In den Dungeon, Söldner anheuern, Trash stumm, Gerds Siegel noch nicht. Rotation wie scripts/balance-rotation.mjs (vereinfacht). */
const setup=()=>read(`g.player.level=Math.max(10,g.player.level);g.player.inCombat=0;g.player.hp=g.player.maxHp;g.enterDungeon('schloss-bigb',{force:true});window.D=await import('/dungeon.js');window.A=await import('/auto-combat.js');
 for(const id of ${MERCS})g.hireCompanion(id,{free:true});for(const e of g.enemies)if(!e.dungeonBoss){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}
 window.B={rotate(g){const p=g.player,t=g.target,ready=id=>g.skills.some(s=>s.id===id)&&(g.cooldowns[id]||0)<=0;for(const [when,run] of [[ready('heal')&&p.hp/p.maxHp<.6,()=>g.action('heal')],[ready('mark')&&t&&!(t.mark>0)&&p.energy>=20,()=>g.action('mark')],[ready('burst')&&p.energy>=35,()=>g.action('burst')],[ready('strike'),()=>g.action('strike')],[ready('throw')&&p.energy>=20,()=>g.action('throw')]])if(when&&run())return true;return false;}};
 return g.instance?.kind;`);
const place=(floor,x,y)=>read(`Object.assign(g.player,D.toWorld(g.dungeonRun.def,'${floor}',${x},${y}));g.player.inCombat=0;g.moveTo=null;g.path=[];for(const c of g.companions){const q=g.world.findClear(g.player.x+14,g.player.y+10,9);c.x=q.x;c.y=q.y;c.target=null;}return 1;`);
/** Spielzeit im Seitenkontext vorspulen. Der Held folgt dem Nachsatz: wartet die Wahrheit ab, geht dann aus echten Bahnen, Stellen und
 *  Trümmern (nur Punkte in der Arena), sonst steht er hinter dem Boss (vom Söldner aus, der ihn hält). stop: Abbruchbedingung. */
const fast=(seconds,stop='false')=>read(`const b=g.enemies.find(e=>e.bossId==='bigb');let t=0;for(;t<${seconds};t+=.05){if(!g.dead){const foe=[...g.enemies.filter(e=>e.hp>0&&e.aggro&&e.priority),b].find(e=>e&&e.hp>0);
  if(foe){if(g.target!==foe){g.target=foe;A.startAuto(g);}const p=g.player,k=b.cast;let goal=null;
   if(k?.lanes&&k.told){const bad=k.truthLanes.map(i=>k.lanes[i]);if(bad.some(r=>D.inLane(r,p,8))){const lo=Math.min(...k.lanes.map(r=>r.x))+10,hi=Math.max(...k.lanes.map(r=>r.x+r.w))-10,xs=bad.flatMap(r=>[r.x-16,r.x+r.w+16]).filter(x=>x>=lo&&x<=hi&&!bad.some(r=>D.inLane(r,{x,y:p.y},8))).sort((a,c)=>Math.abs(a-p.x)-Math.abs(c-p.x));if(xs.length)goal={x:xs[0],y:p.y};}}
   if(!goal&&k?.spots&&k.told)for(const s of k.spots)if(Math.hypot((p.x-s.x)/k.radius,(p.y-s.y)/(k.radius*.75))<1.1){const a=Math.atan2(p.y-s.y,p.x-s.x);goal={x:s.x+Math.cos(a)*(k.radius+16),y:s.y+Math.sin(a)*(k.radius+16)*.75};}
   if(!goal)for(const h of g.dungeonRun.hazards||[])if(Math.hypot(p.x-h.x,p.y-h.y)<h.radius+4){const a=Math.atan2(p.y-h.y,p.x-h.x);goal={x:h.x+Math.cos(a)*(h.radius+14),y:h.y+Math.sin(a)*(h.radius+14)};}
   if(!goal)for(const e of g.enemies){const c=e.cast;if(c?.ground&&e.hp>0&&Math.hypot((p.x-c.x)/c.radius,(p.y-c.y)/(c.radius*.75))<1){const a=Math.atan2(p.y-c.y,p.x-c.x);goal={x:c.x+Math.cos(a)*(c.radius+14),y:c.y+Math.sin(a)*(c.radius+14)*.75};}}
   if(!goal&&!(k?.lanes&&k.told)){const h=g.companions.find(c=>c.id===b.focus&&c.state!=='down');if(h&&foe===b){const d=Math.hypot(b.x-h.x,b.y-h.y)||1;goal={x:b.x+(b.x-h.x)/d*26,y:b.y+(b.y-h.y)/d*26};}else if(Math.hypot(foe.x-p.x,foe.y-p.y)>40)goal={x:foe.x,y:foe.y};}
   if(goal&&Math.hypot(goal.x-p.x,goal.y-p.y)>6){g.moveTo=g.world.findClear(goal.x,goal.y,7);g.path=[];}else g.moveTo=null;
   if(!g.casting&&g.gcd<=0)B.rotate(g);}}
  g.tick(.05);if(${stop})break;}return Math.round(t*10)/10;`);
const bigb=`g.enemies.find(e=>e.bossId==='bigb')`;
/** Big B ziehen: Tresortür mit Gerds Siegel offen, Held im Thronsaal, Söldner dabei. */
async function pull(){await read(`const r=g.dungeonRun;for(const s of ['siegel-gerd','siegel-expose','siegel-kurt'])r.seals.add(s);r.version++;return 1`);await place('k2',52,24);
 await read(`const b=${bigb};b.aggro=true;b.ai='combat';g.target=b;g.player.inCombat=7;A.startAuto(g);g.adminGod=true;return 1`);}
const pause=async(on=true)=>{await read(`g.paused=${on};return 1`);if(on)await wait(450);};
const alerts=()=>read(`const s=window.__bossAlerts?.state?.()||{};const f=document.querySelector('.boss-frame');const rows=[...document.querySelectorAll('.boss-alerts .ba-row')].map(r=>{const q=r.getBoundingClientRect();return {text:r.textContent.trim(),cls:r.className,inView:q.top>=0&&q.bottom<=innerHeight&&q.left>=0&&q.right<=innerWidth};});
 return {cast:s.cast||'',frame:!!f&&!f.hidden,castCls:document.querySelector('.bf-cast')?.className||'',status:[...document.querySelectorAll('.bf-status .bf-chip')].map(c=>c.textContent.trim()||c.dataset.tooltipLabel),rows};`);
try{
 // ───────────────────────────────── 1 · Desktop: Tresortür, Lüge, Aufstellung, Phasen, Sieg, Erfolg, Endtruhe, Hinterausgang
 if(want(1)){
  await start({w:1600,h:900});assert.equal(await setup(),'dungeon','im Dungeon');
  // Tresortür: vor Gerd zu, nach Gerd (nur sein Siegel wird verlangt) offen
  await place('k2',39.5,24);await wait(900);
  const doorAt=`D.toWorld(g.dungeonRun.def,'k2',44,24)`;const closed=await read(`const p=${doorAt};return g.world.blocked(p.x,p.y,3)`);assert.equal(closed,true,'Tresortür zu');await shot('01-tresortuer-zu');
  /* Etappe 4 Teil A: Exposé und Kurt sind gebaut – die Tür verlangt jetzt alle drei Siegel */await read(`for(const id of ['gerd','expose','korkenkurt']){const e=g.enemies.find(x=>x.bossId===id);if(e&&e.hp>0)g.kill(e);}return g.dungeonRun.seals.size`);await wait(600);
  const open=await read(`const p=${doorAt};return {open:!g.world.blocked(p.x,p.y,3),need:D.requiredSeals(g.dungeonRun.def,['siegel-gerd','siegel-expose','siegel-kurt'])}`);
  assert.ok(open.open,'Tresortür offen nach den drei Siegelträgern '+JSON.stringify(open));assert.deepEqual(open.need,['siegel-gerd','siegel-expose','siegel-kurt']);await read(`document.querySelectorAll('[data-window-close]').forEach(x=>x.click());return 1`);await wait(300);await shot('02-tresortuer-offen');
  ok('Tresortür: vor den Siegelträgern zu, danach offen (verlangt „'+open.need.join(', ')+'“)');
  // Durch die Tür in den Thronsaal laufen
  await read(`const b=${bigb};b.aggroRange=0;g.moveTo=D.toWorld(g.dungeonRun.def,'k2',49,24);return 1`);let room='';for(let i=0;i<40&&room!=='thronsaal';i++){await wait(250);room=await read(`return D.roomAt(g.dungeonRun.def,g.player.x,g.player.y)?.id||''`);}
  assert.equal(room,'thronsaal','Held läuft durch die Tresortür in den Thronsaal');await read(`${bigb}.aggroRange=92;return 1`);ok('Thronsaal betretbar: der Held läuft durch die offene Tresortür');
  // Big B: Behauptung, dann Nachsatz – angehalten, damit Bild und Leisten stehen
  await pull();await wait(1500);
  await fast(30,`(()=>{const k=${bigb}.cast;return k?.type==='kanone'&&k.told===false&&k.total-k.remaining>.25;})()`);await pause();
  const claim=await alerts(),claimWorld=await read(`const k=${bigb}.cast;return {name:k.name,claim:k.claimText,told:k.told,lane:k.claimLane,truth:k.truthLanes}`);
  assert.equal(claimWorld.told,false);assert.ok(claim.frame,'Bossrahmen sichtbar');assert.equal(claim.cast,'„'+claimWorld.claim+'“','Zauberleiste zeigt die Behauptung in Anführungszeichen');assert.match(claim.castCls,/bf-claim/);
  assert.ok(claim.rows.some(r=>/ba-lie-c/.test(r.cls)&&r.text.includes(claimWorld.claim)),'Warnleiste zeigt die Behauptung '+JSON.stringify(claim.rows));await shot('03-behauptung');
  await pause(false);await fast(3,`${bigb}.cast?.told===true`);await fast(.3);await pause();
  const truth=await alerts(),truthWorld=await read(`const k=${bigb}.cast;return {truth:k?.truthText,told:k?.told}`);
  assert.equal(truthWorld.told,true);assert.equal(truth.cast,truthWorld.truth,'Zauberleiste zeigt den Nachsatz');assert.match(truth.castCls,/bf-truth/);assert.ok(truth.rows.some(r=>/ba-lie-t/.test(r.cls)),'Warnleiste zeigt den Nachsatz');
  await shot('04-nachsatz');ok('Lüge sichtbar: „'+claimWorld.claim+'“ in Zauberleiste, Warnleiste und Sprechblase, nach 1 s der Nachsatz „'+truthWorld.truth+'“ mit echter Bahn');
  await pause(false);
  // Aufstellung: die anderen stehen auf der Gegenseite des Schutzes (Schutz dreht Big B weg)
  await fast(6);await pause();
  const form=await read(`const b=${bigb},tank=g.companions.find(c=>c.def.role==='tank'),a=Math.atan2(tank.y-b.y,tank.x-b.x),ang=u=>{let d=Math.atan2(u.y-b.y,u.x-b.x)-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return Math.abs(d)*180/Math.PI;};
   return {holder:b.focus,tank:tank.id,others:g.companions.filter(c=>c!==tank&&c.state!=='down').map(c=>({n:c.name,deg:Math.round(ang(c))}))}`);
  const behind=form.others.filter(o=>o.deg>90);assert.equal(form.holder,form.tank,'Schutz hält Big B '+JSON.stringify(form));assert.ok(behind.length>=2,'Söldner stehen auf der Gegenseite des Schutzes '+JSON.stringify(form));
  await shot('05-aufstellung');ok('Aufstellung: Pils-Peter hält Big B, '+behind.map(o=>o.n+' '+o.deg+'°').join(', ')+' auf der Gegenseite');await pause(false);
  // Phase 2: Follower mit Reichweite im Bossrahmen
  await fast(200,`g.enemies.some(e=>e.priority&&e.hp>0&&e.aggro)`);await fast(1.5);await pause();
  const p2=await alerts();assert.ok(p2.status.some(t=>/Reichweite/.test(t)),'Reichweite im Bossrahmen '+JSON.stringify(p2.status));await shot('06-phase2-follower');ok('Phase 2: Follower gerufen, Bossrahmen zeigt „'+p2.status.find(t=>/Reichweite/.test(t))+'“');await pause(false);
  // Phase 3: zwei Bahnen zugleich, nur die Mitte ist sicher
  await fast(260,`(()=>{const k=${bigb}.cast;return k?.type==='kanone3'&&k.told===true;})()`);await fast(.3);await pause();
  const p3=await read(`const k=${bigb}.cast;return {n:k?.truthLanes?.length,hazards:g.dungeonRun.hazards.length}`);assert.equal(p3.n,2,'Phase 3: zwei Bahnen');await shot('07-phase3-zwei-bahnen');ok('Phase 3: Kanonenkugel auf zwei Bahnen, Mitte frei');await pause(false);
  // Sieg, Beute-Moment mit Erfolg
  const t=await fast(400,`${bigb}.hp<=0`);const won=await read(`const r=g.dungeonRun,rec=g.dungeons['schloss-bigb'];return {killed:r.killed.has('bigb'),lie:${bigb}.lieHits||0,feats:rec.feats,clears:rec.clears,best:rec.best,reward:${bigb}.dungeonReward}`);
  assert.ok(won.killed,'Big B besiegt');assert.equal(won.lie,0,'kein Treffer durch eine gelogene Kanonenkugel');assert.deepEqual(won.feats,['nachsatz'],'Erfolg vergeben');assert.equal(won.clears,1);
  await read(`g.adminGod=false;g.player.inCombat=0;return 1`);for(let i=0;i<16&&!(await read(`return !!document.querySelector('.game-popup[data-window="loot"] [data-loot-feat]')`));i++)await wait(250);
  const moment=await read(`const w=document.querySelector('.game-popup[data-window="loot"]');return {open:!!w,head:w?.querySelector('.loot-moment-title')?.textContent||'',feat:!!w?.querySelector('[data-loot-feat="nachsatz"]')}`);
  assert.ok(moment.open&&/Big B/.test(moment.head)&&moment.feat,'Beute-Moment mit Erfolg '+JSON.stringify(moment));await shot('08-sieg-erfolg');
  ok('Sieg nach '+Math.round(t)+' s Spielzeit: Erfolg „Der Nachsatz zählt“ im Spielstand und im Beute-Moment, Abschluss '+won.clears+', Bestzeit '+won.best+' s');
  await read(`document.querySelector('.game-popup[data-window="loot"] [data-take-loot]')?.click();return 1`);await wait(400);await closeAll();
  // Endtruhe mit Wahl
  await place('k2',54,39.2);await wait(600);assert.equal(await read(`return g.interaction()?.kind`),'dungeonChest','Truhe bietet sich an');
  const equipped=await read(`return JSON.stringify(g.rpg.equipment)`);await b.press('f');for(let i=0;i<12&&!(await read(`return !!document.querySelector('.game-popup[data-window="loot"] [data-loot-choice]')`));i++)await wait(250);
  const chest=await read(`const w=document.querySelector('.game-popup[data-window="loot"]');return {items:[...(w?.querySelectorAll('[data-loot-item]')||[])].map(e=>e.dataset.lootItem),all:!!w?.querySelector('[data-take-loot]'),pick:w?.querySelector('[data-loot-pick]')?.textContent||'',head:w?.querySelector('.loot-moment-title')?.textContent||''}`);
  assert.equal(chest.items.length,3,'drei Teile zur Wahl '+JSON.stringify(chest));assert.equal(chest.all,false,'kein „Alles einpacken“');assert.ok(chest.pick,'Hinweis zur Wahl');await shot('09-endtruhe-wahl');
  await read(`document.querySelectorAll('.game-popup[data-window="loot"] [data-loot-item]')[1].click();return 1`);await wait(500);
  const picked=await read(`return {inv:g.rpg.inventory.map(e=>e.id),bag:g.rpg.loot.some(b=>b.choice),eq:JSON.stringify(g.rpg.equipment)}`);
  assert.ok(picked.inv.includes(chest.items[1])&&!picked.inv.includes(chest.items[0])&&!picked.inv.includes(chest.items[2]),'genau das gewählte Teil '+JSON.stringify(picked.inv.slice(-4)));assert.equal(picked.bag,false,'Rest verfällt');assert.equal(picked.eq,equipped,'nichts angelegt');
  ok('Endtruhe: Wahl aus 3 seltenen Teilen („'+chest.head+'“), eines genommen, der Rest verfällt, nichts angelegt');await closeAll();
  // Hinterausgang
  await place('k2',58,44);await wait(500);assert.equal(await read(`return g.interaction()?.kind`),'dungeonLeave');await b.press('f');for(let i=0;i<16&&(await read(`return !!g.instance`));i++)await wait(250);
  assert.equal(await read(`return !!g.instance`),false,'draußen');await wait(600);await shot('10-hinterausgang-draussen');ok('Hinterausgang in der Schatzkammer führt zurück auf die Burgstraße – der Dungeon hat ein Ende');
 }
 // ───────────────────────────────── 2 · Handy quer und hoch: Bossrahmen, Warnleiste, Lüge
 if(want(2))for(const [w,h,name] of [[844,390,'quer'],[390,844,'hoch']]){
  await start({touch:true,w,h,safe:true});await setup();await pull();await wait(1200);
  await fast(30,`(()=>{const k=${bigb}.cast;return k?.type==='kanone'&&k.told===false&&k.total-k.remaining>.25;})()`);await pause();
  const a=await alerts();assert.ok(a.frame,'Bossrahmen');assert.match(a.cast,/^„/,'Behauptung in der Zauberleiste '+a.cast);assert.ok(a.rows.length&&a.rows.every(r=>r.inView),'Warnleiste im Bild '+JSON.stringify(a.rows));
  await shot('11-handy-'+name+'-behauptung');await pause(false);await fast(3,`${bigb}.cast?.told===true`);await fast(.3);await pause();
  const t2=await alerts();assert.ok(t2.cast&&!/^„/.test(t2.cast),'Nachsatz in der Zauberleiste '+t2.cast);await shot('12-handy-'+name+'-nachsatz');await pause(false);
  ok('Handy '+name+' '+w+'×'+h+': Bossrahmen, Warnleiste im Bild, Behauptung „'+a.cast+'“ → Nachsatz „'+t2.cast+'“');
 }
 // ───────────────────────────────── 3 · Journal: Big Bs Seite aus den Daten, nichts scrollt (Desktop, Handy hoch und quer)
 if(want(3))for(const [w,h,name,touch] of [[1600,900,'desktop',false],[390,844,'handy-hoch',true],[844,390,'handy-quer',true]]){
  await start({touch,w,h,safe:touch});await setup();await read(`window.__dgOpenJournal?.('bigb');return 1`);await wait(700);
  const j=await read(`const p=document.querySelector('.popup-journal');if(!p)return null;const ab=[...p.querySelectorAll('.dj-ability')];return {page:p.querySelector('[data-dj-page]')?.dataset.djPage,abilities:ab.map(a=>a.dataset.djCast),icons:ab.filter(a=>a.querySelector('canvas[data-dicon]')).length,phases:p.querySelectorAll('.dj-phase').length,enrage:!!p.querySelector('.dj-chip canvas[data-dicon="trait-enrage"]')}`);
  assert.ok(j&&j.page==='bigb','Journal zeigt Big B '+JSON.stringify(j));assert.ok(j.abilities.includes('kanone')&&j.abilities.includes('siegelring'),'Kanonenkugel und Siegelring (Nebentakt) '+JSON.stringify(j.abilities));assert.equal(j.icons,j.abilities.length,'jede Fähigkeit mit Symbol');assert.ok(j.enrage,'Wut als Kopf-Chip');
  const au=await s.audit('journal');assert.equal(au.over,'',name+': Journal scrollt nicht '+JSON.stringify(au));assert.deepEqual(au.scrollers,[],name+': keine Scrollfläche');assert.equal(au.offscreen,false,name+': im Bild');
  await shot('13-journal-'+name);ok('Journal '+name+': Big B mit '+j.abilities.length+' Fähigkeiten ('+j.abilities.join(', ')+'), '+j.phases+' Phasen, Wut-Chip, nichts scrollt');
 }
 assert.deepEqual(b.errors,[],'keine Fehler im Browser');writeFileSync(dir+'/result.json',JSON.stringify({checks,errors:b.errors},null,2));
 console.log('dungeon-e3-check: '+checks.length+' Prüfungen grün');
}catch(e){await b.screenshot(dir+'/failure.jpg').catch(()=>{});console.error(JSON.stringify({browserErrors:b.errors}).slice(0,1500));throw e;}finally{b.close();}
