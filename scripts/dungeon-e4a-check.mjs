// Browserprüfung Dungeon Etappe 4 Teil A „Die restlichen Bosse“ (E-71, docs/DUNGEON-ETAPPE-4A-2026-09-25.md): jeder neue Boss per Pull aus
// dem Nachbarraum (Tür schließt erst mit dem Helden drin, alle Söldner drin), mit Söldnern besiegbar, Warnungen sichtbar (Bossrahmen,
// Warnleiste, Bodenzeichen); Tresortür mit drei Siegeln über eine zufällige Reihenfolge per Klickpfad (Dungeon-Karte: Ebene wählen,
// Umschalt+Klick läuft hin, F am Übergang); Journal der vier Bosse ohne Scrollen auf Desktop und Handy; Handy hoch und quer im Kampf.
// Aufruf: CDP_PORT=9650 SERVER_PORT=4450 BOOT_TRIES=450 node scripts/dungeon-e4a-check.mjs   (ONLY=1,2,… einzelne Teile, SEED=n Reihenfolge)
// Bilder: visual-review/dungeon-e4a/*.jpg (lokal, nicht im Repo). Zum Ansehen wird die Welt an Schlüsselstellen angehalten (g.paused).
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {session,wait} from './r5b-lib.mjs';
const dir='visual-review/dungeon-e4a';mkdirSync(dir,{recursive:true});
const only=(process.env.ONLY||'').split(',').filter(Boolean),want=n=>!only.length||only.includes(String(n));
const s=await session({port:9650,serverPort:4450});const {b,read,start,closeAll}=s;
const checks=[],shot=n=>b.screenshot(dir+'/'+n+'.jpg'),ok=t=>{checks.push(t);console.log('PASS '+t);};
const MERCS=`['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst']`;
/** In den Dungeon, Söldner anheuern, Trash stumm. Fahrer (window.E4): spielt wie „spielt richtig“ in scripts/dungeon-sim.mjs, aber einfacher. */
const setup=()=>read(`g.player.level=Math.max(10,g.player.level);g.player.inCombat=0;g.player.hp=g.player.maxHp;g.enterDungeon('schloss-bigb',{force:true});window.D=await import('/dungeon.js');window.A=await import('/auto-combat.js');
 for(const id of ${MERCS})g.hireCompanion(id,{free:true});for(const e of g.enemies)if(!e.dungeonBoss){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}
 const esc=(q,c,r)=>{const a=Math.atan2(q.y-c.y,q.x-c.x)||0;for(const t of [0,.6,-.6,1.3,-1.3,2.2,-2.2,Math.PI]){const p={x:c.x+Math.cos(a+t)*r,y:c.y+Math.sin(a+t)*r*.75};if(!g.world.blocked(p.x,p.y,9))return p;}return null;};
 window.E4={rotate(g){const p=g.player,t=g.target,ready=id=>g.skills.some(s=>s.id===id)&&(g.cooldowns[id]||0)<=0;for(const [when,run] of [[ready('heal')&&p.hp/p.maxHp<.6,()=>g.action('heal')],[ready('burst')&&p.energy>=35,()=>g.action('burst')],[ready('strike'),()=>g.action('strike')],[ready('throw')&&p.energy>=20,()=>g.action('throw')]])if(when&&run())return true;return false;},
  goal(g,boss){const p=g.player,run=g.dungeonRun,mates=g.companions.filter(c=>c.state!=='down'&&c.hp>0),d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
   for(const e of g.enemies){const k=e.cast;if(!k||!(e.hp>0)||k.total-k.remaining<.35)continue;
    if(k.stack){const m=k.victim==='player'?p:mates.find(c=>c.id===k.victim);if(m&&m!==p&&d(m,p)>k.stack.radius-14)return {x:m.x,y:m.y};if(m)return p;}
    if(k.spread){const r=k.spread.radius+12;if(mates.every(o=>d(o,p)>=r))return p;for(let i=0;i<16;i++){const a=i/16*6.283,q={x:p.x+Math.cos(a)*r*1.3,y:p.y+Math.sin(a)*r*1.3};if(!g.world.blocked(q.x,q.y,9)&&mates.every(o=>d(o,q)>=r)&&D.roomAt(run.def,q.x,q.y)?.id===e.dungeonBoss?.room)return q;}}
    if(k.los){if(!g.world.lineClear(e,p))return p;let best=null;for(const q of D.hideSpots(g,e,k))if(!best||d(p,q)<d(p,best))best=q;if(best)return best;}
    if(k.lanes&&k.told!==false){const bad=(k.truthLanes||[]).map(i=>k.lanes[i]);if(bad.some(r=>D.inLane(r,p,8))){for(const r of bad)for(const q of (r.axis==='y'?[{x:p.x,y:r.y-16},{x:p.x,y:r.y+r.h+16}]:[{x:r.x-16,y:p.y},{x:r.x+r.w+16,y:p.y}]))if(!g.world.blocked(q.x,q.y,9)&&!bad.some(x=>D.inLane(x,q,8)))return q;}}
    if(k.spots&&k.told!==false)for(const sp of k.spots.filter(x=>!x.decoy))if(Math.hypot((p.x-sp.x)/k.radius,(p.y-sp.y)/(k.radius*.75))<1.1)return esc(p,sp,k.radius+16);
    if(k.ground&&!k.spots&&Math.hypot((p.x-k.x)/k.radius,(p.y-k.y)/(k.radius*.75))<1)return esc(p,k,k.radius+14);}
   for(const h of run.hazards||[])if(h.rect&&D.inHazard(h,p,4)){const mid=h.rect.x<boss.x?h.rect.x+h.rect.w+24:h.rect.x-24;return {x:mid,y:p.y};}
   return null;},
  step(g,boss){const p=g.player;if(g.dead)return;const add=g.enemies.filter(e=>e.goalAt&&e.hp>0&&!e.signedOff).sort((a,c)=>Math.hypot(a.x-a.goalAt.x,a.y-a.goalAt.y)-Math.hypot(c.x-c.goalAt.x,c.y-c.goalAt.y))[0];
   const foe=add||(boss.hp>0&&!boss.hidden?boss:null);if(foe&&g.target!==foe){g.target=foe;A.startAuto(g);}
   let goal=this.goal(g,boss);if(!goal&&foe&&Math.hypot(foe.x-p.x,foe.y-p.y)>44)goal={x:foe.x,y:foe.y};
   /* Greenscreen: weg von der Wand, damit sie nicht dort stehen bleibt (Plan 7.3: „Gruppe steht so, dass sie nicht zurückläuft“) */if(!goal&&boss.hidden){const z=D.bossZones(g.dungeonRun,boss);if(z.hidden)goal={x:z.hidden.x+z.hidden.w/2,y:z.hidden.y+z.hidden.h+100};}
   if(goal&&Math.hypot(goal.x-p.x,goal.y-p.y)>6){const to=g.world.findClear(goal.x,goal.y,7);let via=to;if(!g.world.walkClear(p,to,6)){const path=g.world.findPath(p,to);via=path.find(q=>Math.hypot(q.x-p.x,q.y-p.y)>12)||to;}g.moveTo=via;g.path=[];}else g.moveTo=null;
   if(!g.casting&&g.gcd<=0&&g.target)this.rotate(g);}};
 return g.instance?.kind;`);
const place=(floor,x,y)=>read(`Object.assign(g.player,D.toWorld(g.dungeonRun.def,'${floor}',${x},${y}));g.player.inCombat=0;g.moveTo=null;g.path=[];for(const c of g.companions){const q=g.world.findClear(g.player.x+14,g.player.y+10,9);c.x=q.x;c.y=q.y;c.target=null;}return 1;`);
const B=id=>`g.enemies.find(e=>e.bossId==='${id}')`;
/** Spielzeit vorspulen, der Held spielt richtig (E4.step); stop: Abbruchbedingung (JS-Ausdruck). */
const fast=(id,seconds,stop='false')=>read(`const b=${B(id)};let t=0;for(;t<${seconds};t+=.05){E4.step(g,b);g.tick(.05);if(${stop})break;}return Math.round(t*10)/10;`);
/** Bossrahmen-Chips: der Rahmen baut im nächsten Bild neu – bis 1,2 s warten, bis ein Chip zu re passt (sonst liest die Prüfung zu früh). */
const chipAlerts=async re=>{let a=await alerts();for(let i=0;i<24&&!a.status.some(t=>re.test(t));i++){await wait(50);a=await alerts();}return a;};
const pause=async(on=true)=>{await read(`g.paused=${on};return 1`);if(on)await wait(450);};
const alerts=()=>read(`const s=window.__bossAlerts?.state?.()||{};const f=document.querySelector('.boss-frame');const rows=[...document.querySelectorAll('.boss-alerts .ba-row')].map(r=>{const q=r.getBoundingClientRect();return {text:r.textContent.trim(),inView:q.top>=0&&q.bottom<=innerHeight&&q.left>=0&&q.right<=innerWidth};});
 return {cast:s.cast||'',frame:!!f&&!f.hidden,status:[...document.querySelectorAll('.bf-status .bf-chip')].map(c=>c.textContent.trim()||c.dataset.tooltipLabel),rows};`);
/** Pull aus dem Nachbarraum: Held steht mit den Söldnern vor der Arenatür und läuft hinein; die Tür darf erst mit ihm drin schließen,
 *  und beim Schließen müssen alle Söldner drin sein. */
async function pullFrom(id,[f,x,y],[tx,ty]){await place(f,x,y);await wait(300);
 const before=await read(`const r=g.dungeonRun;return {arena:r.arena,room:D.roomAt(r.def,g.player.x,g.player.y)?.id}`);assert.equal(before.arena,null,'vor dem Pull ist die Tür offen');
 await read(`g.moveTo=D.toWorld(g.dungeonRun.def,'${f}',${tx},${ty});g.path=[];g.player.hp=g.player.maxHp;return 1`);
 let st=null;for(let i=0;i<60;i++){await wait(150);st=await read(`const r=g.dungeonRun,b=${B(id)},room=b.dungeonBoss.room,inRoom=u=>D.roomAt(r.def,u.x,u.y)?.id===room;return {arena:r.arena,hero:inRoom(g.player),mercs:g.companions.filter(inRoom).length,aggro:b.aggro}`);if(st.arena)break;}
 assert.ok(st?.arena&&st.hero,id+': Tür schließt erst mit dem Helden drin '+JSON.stringify(st));assert.equal(st.mercs,4,id+': alle vier Söldner drin '+JSON.stringify(st));return st;}
try{
 // ───────────────────────────────── 1 · Frau Dr. Exposé: Pull aus der Ahnengalerie, Interessenten, Attrappen, Provision, Sieg
 if(want(1)){
  await start({w:1600,h:900});assert.equal(await setup(),'dungeon');await read(`g.adminGod=true;return 1`);
  await pullFrom('expose',['k1',32,35.8],[32,41.5]);ok('Exposé: Pull aus der Ahnengalerie – Tür schließt mit dem Helden drin, alle vier Söldner drin');
  await fast('expose',30,`g.enemies.some(e=>e.goalAt&&e.hp>0&&e.goalVia?.length===0)`);await pause();
  const adds=await read(`return g.enemies.filter(e=>e.goalAt&&e.hp>0).length`);assert.ok(adds>=1,'Interessenten unterwegs');await shot('01-expose-interessenten');ok('Exposé: '+adds+' Interessenten laufen zum Vertragstisch (goldene Spur), Söldner nehmen sie');await pause(false);
  await fast('expose',30,`(()=>{const k=${B('expose')}.cast;return k?.decoy&&k.told===false&&k.total-k.remaining>.2;})()`);await pause();
  const a1=await alerts();assert.ok(a1.rows.some(r=>/Stempel abwarten/.test(r.text)),'Warnleiste: Stempel abwarten '+JSON.stringify(a1.rows));await shot('02-expose-attrappen');await pause(false);
  await fast('expose',3,`${B('expose')}.cast?.told===true`);await fast('expose',.2);await pause();const dec=await read(`const k=${B('expose')}.cast;return k?{real:k.spots.filter(s=>!s.decoy).length,decoy:k.spots.filter(s=>s.decoy).length}:null`);
  await shot('03-expose-stempel');ok('Exposé: vier Stellen erst gleich (gestrichelt, „?“), nach dem Stempel '+(dec?dec.real+' echte, '+dec.decoy+' Attrappen':'aufgelöst')+'; Warnleiste „Stempel abwarten“');await pause(false);
  await read(`const b=${B('expose')};b.provision=2;return 1`);await fast('expose',.4);const a2=await chipAlerts(/Provision/);assert.ok(a2.status.some(t=>/Provision/.test(t)),'Bossrahmen: Provision '+JSON.stringify(a2.status));await pause();await shot('04-expose-provision');await pause(false);ok('Exposé: Bossrahmen zeigt „'+a2.status.find(t=>/Provision/.test(t))+'“');
  const t=await fast('expose',300,`${B('expose')}.hp<=0`);const won=await read(`const r=g.dungeonRun;return {killed:r.killed.has('expose'),seal:r.seals.has('siegel-expose'),downs:g.companions.filter(c=>c.state==='down').length}`);
  assert.ok(won.killed&&won.seal,'Exposé besiegt '+JSON.stringify(won));ok('Exposé besiegt nach '+t+' s mit Söldnern, Siegel „Notarsiegel“');await read(`g.adminGod=false;g.player.inCombat=0;return 1`);await closeAll();
 }
 // ───────────────────────────────── 2 · Korken-Kurt: Pull aus dem Gewölbegang, Sammeln, Verteilen, Rinnen, Sprinkler, Sieg
 if(want(2)){
  await start({w:1600,h:900});assert.equal(await setup(),'dungeon');await read(`g.adminGod=true;return 1`);
  await pullFrom('korkenkurt',['k2',8,28],[16.5,28]);ok('Korken-Kurt: Pull aus dem Gewölbegang – Tür schließt mit dem Helden drin, alle vier Söldner drin');
  for(const [type,name,cond] of [['runde','05-kurt-sammeln','k.stack'],['zahlen','06-kurt-verteilen','k.spread'],['fass','07-kurt-rinne','k.lanes']]){
   await fast('korkenkurt',40,`(()=>{const k=${B('korkenkurt')}.cast;return k&&${cond}&&k.total-k.remaining>1.2;})()`);await pause();const a=await alerts();assert.ok(a.frame,'Bossrahmen');await shot(name);await pause(false);ok('Korken-Kurt: '+type+' sichtbar – Warnleiste „'+(a.rows[0]?.text||'').slice(0,40)+'“');}
  /* Phase 3: der erste Streifen kommt vom Nebentakt; zwei weitere für das Bild gleich dazu (sonst liegt Kurt vorher) */await read(`const b=${B('korkenkurt')};b.hp=b.maxHp*.19;return 1`);await fast('korkenkurt',25,`g.dungeonRun.hazards.filter(h=>h.rect).length>=1`);
  await read(`const C=await import('/content/index.js'),b=${B('korkenkurt')},sp={...C.DUNGEON_CASTS['d-kurt3'].casts.sprinkler,type:'sprinkler'};D.resolveDungeonCast(g,b,sp,'player');D.resolveDungeonCast(g,b,sp,'player');b.hp=Math.max(b.hp,b.maxHp*.1);return 1`);await fast('korkenkurt',1);await pause();
  const wet=await read(`return g.dungeonRun.hazards.filter(h=>h.rect).length`);const a3=await chipAlerts(/Nass/);assert.ok(wet>=2,'nasse Streifen');assert.ok(a3.status.some(t=>/Nass/.test(t)),'Bossrahmen: Nass '+JSON.stringify(a3.status));await shot('08-kurt-sprinkler');ok('Korken-Kurt: Sprinkleranlage – '+wet+' nasse Streifen vom Rand, Bossrahmen „'+a3.status.find(t=>/Nass/.test(t))+'“');await pause(false);
  const t=await fast('korkenkurt',200,`${B('korkenkurt')}.hp<=0`);const won=await read(`const r=g.dungeonRun;return {killed:r.killed.has('korkenkurt'),seal:r.seals.has('siegel-kurt')}`);assert.ok(won.killed&&won.seal,'Kurt besiegt');ok('Korken-Kurt besiegt ('+t+' s ab 19 %), Siegel „Weinsiegel“');await read(`g.adminGod=false;return 1`);
 }
 // ───────────────────────────────── 3 · Reichweiten-Rita: Pull aus der Galerie, Blitzlicht hinter Deckung, Greenscreen, Sieg
 if(want(3)){
  await start({w:1600,h:900});assert.equal(await setup(),'dungeon');await read(`g.adminGod=true;return 1`);
  await pullFrom('rita',['k1',54,19],[58.4,18.2]);ok('Reichweiten-Rita: Pull aus der Galerie – Tür schließt mit dem Helden drin, alle vier Söldner drin');
  await fast('rita',40,`(()=>{const k=${B('rita')}.cast;return k?.los&&k.total-k.remaining>1.9;})()`);await pause();
  const hid=await read(`const b=${B('rita')};return {hidden:[g.player,...g.companions].filter(u=>!g.world.lineClear(b,u)).length}`);await shot('09-rita-blitzlicht');ok('Rita: Blitzlicht – '+hid.hidden+' von 5 hinter Deckung (Auge über Rita, Deckung leuchtet, Plätze golden)');await pause(false);
  await read(`const b=${B('rita')},z=D.bossZones(g.dungeonRun,b);b.cast=null;Object.assign(b,{x:z.hidden.x+z.hidden.w/2,y:z.hidden.y+z.hidden.h/2});b.retreat={to:{x:b.x,y:b.y},until:g.time+4,kind:'hidden'};b.screenUntil=b.retreat.until+2;/* Feinschliff 2026-09-26: Greenscreen-Fenster wie beim echten Zauber (dungeon.js screenUntil) */return 1`);await fast('rita',.3);await pause();
  const a=await chipAlerts(/Unsichtbar/);assert.ok(a.status.some(t=>/Unsichtbar/.test(t)),'Bossrahmen: Unsichtbar '+JSON.stringify(a.status));await shot('10-rita-greenscreen');await pause(false);
  await fast('rita',12,`!${B('rita')}.hidden`);const out=await read(`const b=${B('rita')},o=g.dungeonRun.def.floors.k1.origin,m=u=>((u.x-o.x)/8).toFixed(1)+','+((u.y-o.y)/8).toFixed(1);return {hidden:b.hidden,retreat:!!b.retreat,focus:b.focus,rita:m(b),held:m(g.player),mercs:g.companions.map(c=>c.name.slice(0,4)+'@'+m(c)+c.state[0]).join(' ')}`);assert.equal(out.hidden,false,'Schutz zieht sie weg '+JSON.stringify(out));ok('Rita: Greenscreen – unsichtbar, Bossrahmen „Unsichtbar“, der Schutz-Söldner zieht sie wieder weg');
  const t=await fast('rita',260,`${B('rita')}.hp<=0`);assert.equal(await read(`return g.dungeonRun.killed.has('rita')`),true,'Rita besiegt');ok('Reichweiten-Rita besiegt nach '+t+' s');await read(`g.adminGod=false;return 1`);
 }
 // ───────────────────────────────── 4 · Das halbe Pferd: erzwungen, Pull aus der Galerie, Trog, Sieg mit Reittier
 if(want(4)){
  await start({w:1600,h:900});assert.equal(await setup(),'dungeon');await read(`D.spawnRareBoss(g,'halbespferd');g.adminGod=true;return 1`);
  await pullFrom('halbespferd',['k1',28,7.2],[28,3.4]);ok('Das halbe Pferd: Pull aus der Galerie – Tür schließt mit dem Helden drin, alle vier Söldner drin');
  await read(`const b=${B('halbespferd')},z=D.bossZones(g.dungeonRun,b);b.cast=null;b.attackTimer=5;b.retreat={to:{x:z.trough.x,y:z.trough.y},until:g.time+5,kind:'feeds'};return 1`);
  await fast('halbespferd',4,`${B('halbespferd')}.drinking`);await fast('halbespferd',.3);await pause();const a=await alerts();await shot('11-pferd-trog');await pause(false);
  ok('Das halbe Pferd: säuft am Trog'+(a.status.some(t=>/Säuft/.test(t))?' (Bossrahmen „Säuft“)':'')+', getönter Schimmel in Bossgröße');
  await read(`g.lootRandom=()=>.01;return 1`);const t=await fast('halbespferd',260,`${B('halbespferd')}.hp<=0`);const won=await read(`return {killed:g.dungeonRun.killed.has('halbespferd'),mount:g.mounts.owned.includes('halbespferd')}`);
  assert.ok(won.killed&&won.mount,'besiegt, Reittier bei 3 % '+JSON.stringify(won));await wait(1600);await shot('12-pferd-beute');ok('Das halbe Pferd besiegt nach '+t+' s, Reittier „Das halbe Pferd“ freigeschaltet (Wurf < 3 %)');
 }
 // ───────────────────────────────── 5 · Klickpfad: zufällige Reihenfolge der drei Siegelträger über die Dungeon-Karte, dann die Tresortür
 if(want(5)){
  const perms=[['gerd','expose','korkenkurt'],['gerd','korkenkurt','expose'],['expose','gerd','korkenkurt'],['expose','korkenkurt','gerd'],['korkenkurt','gerd','expose'],['korkenkurt','expose','gerd']];
  const order=perms[Number(process.env.SEED??Math.floor(Math.random()*6))%6];
  await start({w:1600,h:900});assert.equal(await setup(),'dungeon');await read(`g.adminGod=true;return 1`);
  const ROOM={gerd:'zugbruecke',expose:'musterwohnung',korkenkurt:'kelterhalle',bigb:'thronsaal'},SPOT={zugbruecke:[8.5,24],musterwohnung:[26,43.5],kelterhalle:[17,24],thronsaal:[54,30]};/* Klickpunkte neben dem Boss-Symbol (das öffnet das Journal) */
  /** Karte öffnen, Ebene wählen, Umschalt+Klick auf einen Punkt (Welt) im Raum; läuft hin; F an Übergängen. */
  async function mapWalk(roomId,wx=null,wy=null,exact=false){if(wx==null&&SPOT[roomId])[wx,wy]=SPOT[roomId];
   for(let hop=0;hop<10;hop++){const st=await read(`const r=g.dungeonRun,room=D.roomAt(r.def,g.player.x,g.player.y);return {room:room?.id,floor:D.floorAt(r.def,g.player.x,g.player.y)}`);if(st.room===roomId&&!exact)return true;
    const target=await read(`const r=g.dungeonRun,room=r.def.rooms.find(x=>x.id==='${roomId}');return {floor:room.floor}`);
    await read(`window.__dgShowMap();return 1`);await wait(500);await read(`document.querySelector('[data-dungeon-floor="${target.floor}"]')?.click();return 1`);await wait(400);
    const pt=await read(`const cv=document.querySelector('canvas.dungeon-map'),r=g.dungeonRun,room=r.def.rooms.find(x=>x.id==='${roomId}'),hit=(cv.dungeonHits||[]).find(h=>h.kind==='room'&&h.id==='${roomId}');if(!hit)return null;const q=hit.rects[0],b=cv.getBoundingClientRect(),w=D.rectWorld(r.def,room.floor,room.rects[0]);
     const fx=${wx==null?'.5':`(D.toWorld(r.def,room.floor,${wx},${wy}).x-w.x)/w.w`},fy=${wy==null?'.5':`(D.toWorld(r.def,room.floor,${wx},${wy}).y-w.y)/w.h`};return {x:b.left+q.x+q.w*fx,y:b.top+q.y+q.h*fy};`);
    assert.ok(pt,'Raum '+roomId+' auf der Karte');for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,x:pt.x,y:pt.y,button:'left',clickCount:1,modifiers:8});await wait(300);
    let moved=false;for(let i=0;i<80;i++){await wait(200);const m=await read(`return {path:(g.path||[]).length,moving:g.player.moving,kind:g.interaction()?.kind,room:D.roomAt(g.dungeonRun.def,g.player.x,g.player.y)?.id}`);if(m.moving)moved=true;if(!m.moving&&!m.path&&i>3)break;}
    const inter=await read(`return g.interaction()?.kind`);if(inter==='dungeonStep'){await b.press('f');await wait(700);continue;}
    if(exact)return true;
    if(!moved){/* kein Weg auf dieser Ebene (vor Gerd führt nur die Leiter aufs Carport-Dach): zur Leiter im Hof und hinauf */
     const here=await read(`return D.roomAt(g.dungeonRun.def,g.player.x,g.player.y)?.id`);if(here==='hof'){await mapWalk('hof',18.5,22,true);await b.press('f');await wait(700);continue;}
     return false;}}
   return (await read(`return D.roomAt(g.dungeonRun.def,g.player.x,g.player.y)?.id`))===roomId;}
  for(const id of order){assert.ok(await mapWalk(ROOM[id]),id+' per Klickpfad erreichbar ('+order.join(' → ')+')');await wait(500);
   const need=await read(`const r=g.dungeonRun,d=r.def.doors.find(x=>x.id==='tresor');return {open:D.doorOpen(r,d),seals:r.seals.size}`);assert.equal(need.open,false,'Tresortür vor dem dritten Siegel zu');
   await read(`const e=${B(id)};e.aggro=true;e.ai='combat';return 1`);await wait(400);await read(`g.kill(${B(id)});g.player.inCombat=0;return 1`);await wait(800);ok('Klickpfad: '+id+' in '+ROOM[id]+' erreicht und gelegt ('+(need.seals+1)+'/3 Siegel)');}
  const door=await read(`const r=g.dungeonRun,d=r.def.doors.find(x=>x.id==='tresor');return {open:D.doorOpen(r,d),seals:[...r.seals]}`);assert.ok(door.open,'Tresortür offen mit drei Siegeln '+JSON.stringify(door));
  await read(`${B('bigb')}.aggroRange=0;return 1`);assert.ok(await mapWalk('thronsaal'),'Thronsaal per Klickpfad durch die Tresortür');await wait(400);await shot('13-klickpfad-thronsaal');
  ok('Klickpfad '+order.join(' → ')+': Tresortür öffnet erst mit allen drei Siegeln, der Held läuft per Karte in den Thronsaal');
 }
 // ───────────────────────────────── 6 · Handy hoch und quer: Korken-Kurt (Sammeln) mit Bossrahmen und Warnleiste im Bild
 if(want(6))for(const [w,h,name] of [[390,844,'hoch'],[844,390,'quer']]){
  await start({touch:true,w,h,safe:true});await setup();await read(`g.adminGod=true;return 1`);await place('k2',16.2,27.6);await read(`const b=${B('korkenkurt')};b.aggro=true;b.ai='combat';g.target=b;g.player.inCombat=7;A.startAuto(g);return 1`);
  await fast('korkenkurt',40,`(()=>{const k=${B('korkenkurt')}.cast;return k?.stack&&k.total-k.remaining>1;})()`);await pause();const a=await alerts();
  assert.ok(a.frame,'Bossrahmen');assert.ok(a.rows.length&&a.rows.every(r=>r.inView),'Warnleiste im Bild '+JSON.stringify(a.rows));await shot('14-handy-'+name+'-kurt');await pause(false);ok('Handy '+name+': Bossrahmen und Warnleiste im Bild bei „Runde auf mich!“');
 }
 // ───────────────────────────────── 7 · Journal der vier neuen Bosse: Desktop, Handy hoch und quer, nichts scrollt
 if(want(7))for(const [w,h,name,touch] of [[1600,900,'desktop',false],[390,844,'handy-hoch',true],[844,390,'handy-quer',true]]){
  await start({touch,w,h,safe:touch});await setup();
  for(const id of ['expose','korkenkurt','rita','halbespferd']){await read(`window.__dgOpenJournal?.('${id}');return 1`);await wait(600);
   const j=await read(`const p=document.querySelector('.popup-journal');if(!p)return null;const ab=[...p.querySelectorAll('.dj-ability')];return {page:p.querySelector('[data-dj-page]')?.dataset.djPage,abilities:ab.map(a=>a.dataset.djCast),icons:ab.filter(a=>a.querySelector('canvas[data-dicon]')).length,loot:p.querySelectorAll('.dj-loot:not(.empty)').length}`);
   assert.ok(j&&j.page===id,'Journal zeigt '+id+' '+JSON.stringify(j));assert.equal(j.icons,j.abilities.length,'jede Fähigkeit mit Symbol');assert.ok(j.loot>=1,id+': Beutevorschau');
   const au=await s.audit('journal');assert.equal(au.over,'',name+' '+id+': Journal scrollt nicht '+JSON.stringify(au));assert.deepEqual(au.scrollers,[],name+' '+id+': keine Scrollfläche');assert.equal(au.offscreen,false,name+': im Bild');
   await shot('15-journal-'+id+'-'+name);ok('Journal '+name+' '+id+': '+j.abilities.length+' Fähigkeiten mit Symbol ('+j.abilities.join(', ')+'), '+j.loot+' Beuteteile, nichts scrollt');await closeAll();}
 }
 assert.deepEqual(b.errors,[],'keine Fehler im Browser');writeFileSync(dir+'/result.json',JSON.stringify({checks,errors:b.errors},null,2));
 console.log('dungeon-e4a-check: '+checks.length+' Prüfungen grün');
}catch(e){await b.screenshot(dir+'/failure.jpg').catch(()=>{});console.error(JSON.stringify({browserErrors:b.errors}).slice(0,1500));throw e;}finally{b.close();}
