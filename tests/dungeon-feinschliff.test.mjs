// Dungeon „Schloss Big B“ · Feinschliff 2026-09-26 (docs/DUNGEON-FEINSCHLIFF-2026-09-26.md):
// 1 Reichweiten-Rita: Greenscreen mit klarem Ausweg – spätestens duration + exit Sekunden nach dem Greenscreen ist sie sichtbar, auch wenn
//   ihr Ziel selbst am oder im Greenscreen steht (vorher 480 s bei 4 %, Kevin im Rittergeschoss). Die Mechanik bleibt: unsichtbar, Spott holt sie.
// 2 Arena und Trash getrennt: kein Kämpfer steht, streift oder läuft Streife in einer Arena; Trash bemerkt niemanden in einer Arena;
//   kein Boss bemerkt den Helden, solange Trash kämpft; Flächenschaden weckt keinen Boss; Tür zu → Trash draußen geht zurück.
// 3 Rückweg: Gegner an der Wand finden ihren Weg nach Hause (Wegsuche startet frei), und der Rückweg hat im Dungeon eine Frist – auch mit
//   dem Helden daneben. Kein Pendeln zwischen Rückweg und Kampf.
// 4 Journal: seltener Platz „Selten“, noch nicht gebaute Bosse „Noch nicht entdeckt“ (aria-disabled).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game} from '../engine.js';
import {DUNGEONS,DUNGEON_BOSSES,DUNGEON_CASTS,DUNGEON_UI} from '../content/index.js';
import {toWorld,roomAt,floorAt,rectWorld,resolveDungeonCast,bossZones,spawnRareBoss,dungeonDamageFactor,dungeonNotices,isTrash,heroInArena,trashFighting,arenaEntrance,screenExitPoint} from '../dungeon.js';
import {ENCOUNTER_RULES,beginReturn} from '../encounters.js';
import {journalPanel} from '../dungeon-journal.js';

const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')),{});
const DEF=DUNGEONS['schloss-bigb'],U=8,MERCS=['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst'];
const DAY=Date.UTC(2026,8,26,12);
function game(level=10){const g=new Game(world,{level},{});g.toasts=[];g.toast=t=>g.toasts.push(t);g.random=()=>.5;g.clock=()=>DAY;return g;}
function inside(g){assert.ok(g.enterDungeon('schloss-bigb',{force:true}),'Dungeon betreten');return g.dungeonRun;}
const W=(f,x,y)=>toWorld(DEF,f,x,y);
const at=(g,f,x,y)=>{Object.assign(g.player,W(f,x,y));g.player.inCombat=0;};
const run=(g,s)=>{for(let t=0;t<s;t+=.05)g.tick(.05);};
const boss=(g,id)=>g.enemies.find(e=>e.bossId===id);
const quiet=g=>{for(const e of g.enemies)if(!e.dungeonBoss){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}};
function party(g){for(const id of MERCS)g.hireCompanion(id,{free:true});for(const c of g.companions){const q=g.world.findClear(g.player.x+12,g.player.y+12,9);c.x=q.x;c.y=q.y;}return g;}
const allOpen=r=>{for(const b of DEF.bosses){if(b.seal)r.seals.add(b.seal);}for(const s of DEF.secrets)r.secrets.add(s.id);r.version++;};
const inRect=(R,p)=>p.x>=R.x&&p.x<=R.x+R.w&&p.y>=R.y&&p.y<=R.y+R.h;

// ── 1 · Reichweiten-Rita ───────────────────────────────────────────────────────────────────────────────────────────────
const RITA=['k1',58.4,18.2];
/** Kevin-Fall aus der Simulation: Schutz und Heiler liegen, Rita bei 4 %, ihr Ziel (Radler-Rita) steht am bzw. im Greenscreen. */
function ritaAtScreen(g,focusAt){
 const r=inside(g);quiet(g);at(g,...RITA);party(g);const b=boss(g,'rita');Object.assign(b,{aggro:true,ai:'combat',engaged:true});
 for(const c of g.companions)if(c.def.id!=='merc-radler-rita')Object.assign(c,{hp:0,state:'down'});
 const radler=g.companions.find(c=>c.def.id==='merc-radler-rita');Object.assign(radler,W('k1',...focusAt));
 b.hp=Math.round(b.maxHp*.04);b.threat={[radler.id]:1e6};b.focus=radler.id;b.castSet='d-rita2';b.saidPhases=new Set([.5,.15]);
 const z=bossZones(r,b).hidden;Object.assign(b,{x:z.x+z.w/2,y:z.y+z.h/2});at(g,'k1',59.4,13.4);g.target=null;
 resolveDungeonCast(g,b,{...DUNGEON_CASTS['d-rita2'].casts.greenscreen,type:'greenscreen'},'player');
 b.trackTimers={greenscreen:1e9};/* kein neuer Greenscreen während der Messung */
 return {r,b,z,radler};
}
const SCREEN=DUNGEON_CASTS['d-rita2'].casts.greenscreen.hidden.duration,EXIT=DUNGEON_BOSSES.rita.hidden.exit;

for(const [where,spot] of [['am Rand',[62.7,15.2]],['mitten im Greenscreen',[62.7,13.6]]])
 test('Reichweiten-Rita: ihr Ziel steht '+where+' des Greenscreens – nach spätestens Greenscreen + exit ist sie sichtbar und der Kampf endet (Kevin-Fall)',()=>{
  const g=game(),{b,z,radler}=ritaAtScreen(g,spot);
  run(g,.3);assert.equal(b.hidden,true,'erst unsichtbar: die Mechanik bleibt');
  let seen=null;for(let t=0;t<SCREEN+EXIT+1;t+=.05){g.tick(.05);if(!b.hidden&&seen==null&&g.time>0)seen=t;}
  assert.ok(seen!=null&&seen<=SCREEN+EXIT+.4,'sichtbar nach '+seen?.toFixed(1)+' s (Frist '+(SCREEN+EXIT)+' s)');
  assert.ok(dungeonDamageFactor(g,b)>0,'wieder zu treffen');
  const hp=b.hp;run(g,25);assert.ok(b.hp<hp||b.hp<=0,'der Kampf geht weiter: Rita nimmt Schaden ('+hp+' → '+b.hp+')');
  assert.ok(b.hp<=0||!b.hidden||b.retreat,'kein Hängen im Greenscreen');
  assert.ok(radler.hp>0,'Radler-Rita steht noch');
 });

test('Reichweiten-Rita: ohne Spott ist sie den Greenscreen lang unsichtbar (spürbar), mit Spott früher draußen; der Ausgang liegt außerhalb der Zone',()=>{
 const g=game(),r=inside(g);quiet(g);at(g,...RITA);party(g);const b=boss(g,'rita');Object.assign(b,{aggro:true,ai:'combat',engaged:true});b.trackTimers={greenscreen:1e9};
 const tank=g.companions.find(c=>c.def.role==='tank');Object.assign(tank,{hp:0,state:'down'});
 resolveDungeonCast(g,b,{...DUNGEON_CASTS['d-rita'].casts.greenscreen,type:'greenscreen'},'player');
 let hidden=0;for(let t=0;t<SCREEN+EXIT+2;t+=.05){g.tick(.05);if(b.hidden)hidden+=.05;}
 assert.ok(hidden>=SCREEN*.5,'unsichtbar '+hidden.toFixed(1)+' s ohne Spott');assert.ok(hidden<=SCREEN+EXIT+.1,'höchstens Greenscreen + exit');
 const z=bossZones(r,b).hidden,out=screenExitPoint(g,r,{...b,x:z.x+z.w/2,y:z.y+z.h/2},g.player);assert.ok(out&&!inRect(z,out)&&roomAt(DEF,out.x,out.y)?.id==='studio','Ausgang vor der Zone im Presseamt');
 // Spott: der Schutz holt sie früher heraus
 const h=game(),rh=inside(h);quiet(h);at(h,...RITA);party(h);const c=boss(h,'rita');Object.assign(c,{aggro:true,ai:'combat',engaged:true});c.trackTimers={greenscreen:1e9};
 resolveDungeonCast(h,c,{...DUNGEON_CASTS['d-rita'].casts.greenscreen,type:'greenscreen'},'player');const zz=bossZones(rh,c).hidden;Object.assign(c,{x:zz.x+zz.w/2,y:zz.y+zz.h/2});
 const pils=h.companions.find(o=>o.def.role==='tank');pils.cooldowns.taunt=0;pils.gcd=0;Object.assign(pils,{x:c.x,y:c.y+60});
 let t=0;run(h,.1);for(;t<SCREEN&&c.hidden;t+=.05)h.tick(.05);assert.ok(!c.hidden&&t<SCREEN,'Spott holt sie vor Ablauf heraus ('+t.toFixed(1)+' s)');
});

test('Greenscreen-Text nennt die Frist aus den Daten (Greenscreen + exit)',()=>{
 const s=(DUNGEON_CASTS['d-rita'].casts.greenscreen.hidden.duration+EXIT)+' s';
 assert.ok(DUNGEON_UI.alerts.hiddenNote.includes(s),DUNGEON_UI.alerts.hiddenNote);assert.ok(DUNGEON_UI.traits.hidden.tip.includes(s),DUNGEON_UI.traits.hidden.tip);
 assert.equal(DUNGEON_CASTS['d-rita2'].casts.greenscreen.hidden.duration,DUNGEON_CASTS['d-rita'].casts.greenscreen.hidden.duration,'beide Phasen gleich lang');
});

// ── 2 · Arena und Trash getrennt ──────────────────────────────────────────────────────────────────────────────────────
/** Arena-Fläche einer Ebene als Punkte: Arenaraum oder Arenatür, soweit die Tür nicht in einem anderen Raum liegt (Gang davor). */
function arenaArea(f){const out=[];for(const room of DEF.rooms.filter(x=>x.arena&&x.floor===f)){
 for(const R of [...room.rects,...DEF.doors.filter(d=>d.arena===room.id).map(d=>d.rect)].map(q=>rectWorld(DEF,f,q)))for(let x=R.x;x<=R.x+R.w;x+=2)for(let y=R.y;y<=R.y+R.h;y+=2){const rm=roomAt(DEF,x,y);if(rm&&rm.id!==room.id)continue;out.push({x,y,room:room.id});}}return out;}

test('Boss-Arena und Pack-Aggro überschneiden sich nicht: kein Kämpfer steht, streift oder läuft Streife in einer Arena oder Arenatür (≥ 0,5 m)',()=>{
 /* Umherstreifen: encounters.js idleEnemy mit dem Dungeon-Filter noRoam – ohne ihn kämen Ratten aus „Gewölbe West“ bis in die Kelterhallentür */
 const g=game(),r=inside(g);allOpen(r);const M=.5*U,areas={};
 for(const e of g.enemies){if(!isTrash(e)||e.behavior!=='aggressive')continue;const f=floorAt(DEF,e.home.x,e.home.y),A=areas[f]||(areas[f]=arenaArea(f)),pts=[{...e.home}];
  if(e.patrol){const P=e.patrol.points;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/4);for(let k=0;k<=n;k++)pts.push({x:a.x+(b.x-a.x)*k/n+e.patrol.dx,y:a.y+(b.y-a.y)*k/n+e.patrol.dy});}}
  /* Umherstreifen wie encounters.js idleEnemy: 20 + roamRadius um den Heimatpunkt, frei und ohne Hindernis erreichbar */
  else for(let i=0;i<72;i++)for(const rr of [20,20+e.roamRadius/2,20+e.roamRadius]){const q={x:e.home.x+Math.cos(i/72*Math.PI*2)*rr,y:e.home.y+Math.sin(i/72*Math.PI*2)*rr};if(!g.world.blocked(q.x,q.y,9)&&!g.world.noRoam(q.x,q.y,e)&&g.world.walkClear(e.home,q,9))pts.push(q);}
  let m=Infinity,near=null;for(const q of pts)for(const p of A){const d=Math.hypot(p.x-q.x,p.y-q.y);if(d<m){m=d;near=p.room;}}
  assert.ok(m>M,e.name+' aus '+e.pack+' kommt der Arena '+near+' auf '+(m/U).toFixed(2)+' m nahe');}
 // und kein Pack liegt in einem Arenaraum
 for(const p of DEF.packs)assert.ok(!DEF.rooms.find(x=>x.id===p.room)?.arena,p.id+' liegt nicht in einer Arena');
});

test('Trash streift nie in eine Arena (noRoam), Bosse streifen in ihrer eigenen weiter',()=>{
 const g=game(),r=inside(g);const rat=g.enemies.find(e=>e.pack==='gewoelbe-west'),kurt=boss(g,'korkenkurt'),door=W('k2',23,38);
 assert.equal(g.world.noRoam(door.x,door.y,rat),true,'Kelterhallentür');assert.equal(g.world.noRoam(kurt.x+10,kurt.y,kurt),false,'Kurt in seiner Halle');
 const hall=W('k2',20,30);assert.equal(g.world.noRoam(hall.x,hall.y,rat),true,'Kelterhalle');const gang=W('k2',17,42);assert.equal(g.world.noRoam(gang.x,gang.y,rat),false,'Gang');
 // 200 Streifzüge der östlichsten Ratte: nie in der Tür
 const east=g.enemies.filter(e=>e.pack==='gewoelbe-west').sort((a,b)=>b.home.x-a.home.x)[0];let rnd=7;g.random=()=>(rnd=(rnd*9301+49297)%233280)/233280;Object.assign(g.player,W('e0',31,37));
 for(let i=0;i<4000;i++){g.tick(.05);assert.ok(!r.def.rooms.find(x=>x.id==='kelterhalle').rects.some(q=>inRect(rectWorld(DEF,'k2',q),east))&&roomAt(DEF,east.x,east.y)?.id==='gewoelbe','Ratte bleibt im Gang ('+((east.x-DEF.floors.k2.origin.x)/U).toFixed(1)+','+((east.y-DEF.floors.k2.origin.y)/U).toFixed(1)+')');}
});

test('Pack-Aggro endet an der Arena: Trash bemerkt den Helden in keiner Arena mit lebendem Boss – im Gang davor schon',()=>{
 for(const room of DEF.rooms.filter(x=>x.arena)){
  const g=game(),r=inside(g);allOpen(r);if(DEF.bosses.find(b=>b.room===room.id)?.rare)spawnRareBoss(g,room.arena);
  const b=g.enemies.find(e=>e.dungeonBoss?.room===room.id);assert.ok(b,room.id+': Boss steht');
  // jeder begehbare Punkt der Arena (1-m-Raster): kein Trash bemerkt ihn
  const trash=g.enemies.filter(e=>isTrash(e)&&e.hp>0&&e.behavior==='aggressive');
  for(const q of room.rects.map(x=>rectWorld(DEF,room.floor,x)))for(let x=q.x+4;x<q.x+q.w;x+=U)for(let y=q.y+4;y<q.y+q.h;y+=U){if(g.world.blocked(x,y,5))continue;Object.assign(g.player,{x,y});
   assert.equal(heroInArena(g),true);for(const e of trash)assert.equal(dungeonNotices(g,e),false,room.id+': '+e.name+' bemerkt ihn nicht');}
  // echter Takt: alle Kämpfer der Ebene 3 m vor der Arenatür, der Held 2 m hinter der Tür in der Arena – niemand vom Trash kommt
  const door=DEF.doors.find(d=>d.arena===room.id),[dx,dy,dw,dh]=door.rect,c=W(room.floor,dx+dw/2,dy+dh/2),inn=arenaEntrance(r,room.id,c);
  const outside=[3,2.5,2].flatMap(k=>[[dw/2+k,0],[-dw/2-k,0],[0,dh/2+k],[0,-dh/2-k]]).map(([ox,oy])=>W(room.floor,dx+dw/2+ox,dy+dh/2+oy)).find(q=>{const rm=roomAt(DEF,q.x,q.y);return rm&&rm.id!==room.id&&!g.world.blocked(q.x,q.y,9);});
  assert.ok(outside,room.id+': Gang vor der Tür');
  const near=trash.filter(e=>roomAt(DEF,e.home.x,e.home.y)?.floor===room.floor).slice(0,6);for(const [i,e] of near.entries()){const q=g.world.findClear(outside.x+(i%3-1)*10,outside.y+(i<3?0:10),7);Object.assign(e,{x:q.x,y:q.y,home:{...q},patrol:null,spawnGrace:0,roamWait:99});}
  Object.assign(g.player,inn);g.player.inCombat=0;g.enemies=g.enemies.filter(e=>!e.dungeonBoss||e===b);g.instance.run.enemies=g.enemies;b.aggroRange=0;/* nur der Trash zählt hier */
  run(g,1.2);assert.deepEqual(near.filter(e=>e.aggro).map(e=>e.name),[],room.id+': kein Trash kommt in die Arena');
  // Gegenprobe: im Gang vor der Tür bemerken sie ihn
  Object.assign(g.player,g.world.findClear(outside.x,outside.y,9));run(g,1.2);assert.ok(near.some(e=>e.aggro),room.id+': im Gang wird er bemerkt');
 }
});

/** Hof West kämpft mit dem Helden, der Held steht schon in Gerds Arena (Azubi an der Tür, wie Schorsch in der Simulation). */
function hofWestFight(g){const r=inside(g);at(g,'e0',22.5,27);party(g);const west=g.enemies.filter(e=>e.pack==='hof-west'&&!e.cardboard);
 for(const e of g.enemies)if(isTrash(e)&&e.pack!=='hof-west'){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}
 for(const e of west){e.aggro=true;e.ai='combat';}Object.assign(west[0],W('e0',16.2,27.8));at(g,'e0',13.2,28.3);g.player.inCombat=7;g.target=west[0];
 return {r,west,gerd:boss(g,'gerd')};}

test('Ein Pack-Pull zieht nie den Boss mit: kämpft Hof West, bleibt Gerd ruhig, auch wenn der Held in der Arena steht – danach bemerkt er ihn',()=>{
 const g=game(),{r,west,gerd}=hofWestFight(g);assert.equal(trashFighting(g),true);assert.equal(roomAt(DEF,g.player.x,g.player.y)?.id,'zugbruecke');
 run(g,2);assert.equal(gerd.aggro,false,'Gerd bleibt ruhig');assert.equal(r.arena,null,'Tür bleibt offen');assert.equal(gerd.hp,gerd.maxHp);
 for(const e of west)g.kill(e);g.player.inCombat=0;at(g,'e0',13.2,28.3);run(g,1);
 assert.equal(trashFighting(g),false);assert.equal(gerd.aggro,true,'danach bemerkt Gerd den Helden in seiner Arena');run(g,.2);assert.equal(r.arena,'zugbruecke','Tür zu');
});

test('Flächenschaden weckt keinen Boss: nur als Ziel oder wenn er den Helden bemerkt',()=>{
 const g=game(),{west,gerd}=hofWestFight(g);g.target=west[0];
 g.damage(gerd,500,'Popcorn');assert.equal(gerd.aggro,false,'Maiskolben am Azubi trifft Gerd nicht');assert.equal(gerd.hp,gerd.maxHp);
 g.target=gerd;g.damage(gerd,500,'Schlag');assert.equal(gerd.aggro,true,'als Ziel angegriffen: Kampf');assert.ok(gerd.hp<gerd.maxHp);
});

test('Ein Boss-Pull zieht nie Trash mit: fällt die Arenatür zu, lässt Trash draußen ab, geht zurück und steht voll wieder zu Hause',()=>{
 const g=game(),{r,west,gerd}=hofWestFight(g);for(const e of west){e.hp=Math.round(e.maxHp*.5);Object.assign(e,W('e0',34,31));}
 g.target=gerd;g.damage(gerd,500,'Schlag');for(let i=0;i<20&&!r.arena;i++)g.tick(.05);assert.equal(r.arena,'zugbruecke','Tür zu');
 const out=west.filter(e=>roomAt(DEF,e.x,e.y)?.id!=='zugbruecke');assert.ok(out.length,'Trash steht draußen');
 for(const e of out){assert.equal(e.aggro,false,e.name+' lässt ab');assert.equal(e.ai,'returning');}
 run(g,ENCOUNTER_RULES.dungeonReturnLimit+.5);for(const e of out){assert.notEqual(e.ai,'returning',e.name+' ist zu Hause');assert.equal(e.hp,e.maxHp);assert.ok(Math.hypot(e.x-e.home.x,e.y-e.home.y)<30);}
});

test('Boss-Pull an jeder Arena: der Held betritt die Arena, nur der Boss kommt – kein Trash, auch nicht die Streife vor der Tür',()=>{
 for(const room of DEF.rooms.filter(x=>x.arena&&x.id!=='thronsaal')){
  const g=game(),r=inside(g);allOpen(r);if(DEF.bosses.find(b=>b.room===room.id)?.rare)spawnRareBoss(g,room.arena);party(g);
  const b=g.enemies.find(e=>e.dungeonBoss?.room===room.id),door=DEF.doors.find(d=>d.arena===room.id),[dx,dy,dw,dh]=door.rect,inn=arenaEntrance(r,room.id,W(room.floor,dx+dw/2,dy+dh/2));
  const trash=g.enemies.filter(e=>isTrash(e)&&e.hp>0&&roomAt(DEF,e.home.x,e.home.y)?.floor===room.floor);
  Object.assign(g.player,inn);for(const c of g.companions){const q=g.world.findClear(inn.x+6,inn.y+6,9);c.x=q.x;c.y=q.y;}
  run(g,2);
  assert.deepEqual(trash.filter(e=>e.aggro).map(e=>e.name+'/'+e.pack),[],room.id+': kein Trash im Kampf');
 }
});

// ── 3 · Rückweg ────────────────────────────────────────────────────────────────────────────────────────────────────
/** Stelle an der Wand: frei für Radius 5 (so laufen Gegner), gesperrt für Radius 6 (so prüfte die Wegsuche) – wie die Ecke im Gewölbe. */
function wallSpot(g,f,x,y){const c=W(f,x,y);for(let d=0;d<24;d+=.5)for(let i=0;i<16;i++){const q={x:c.x+Math.cos(i/16*Math.PI*2)*d,y:c.y+Math.sin(i/16*Math.PI*2)*d};if(!g.world.blocked(q.x,q.y,5)&&g.world.blocked(q.x,q.y,6))return q;}return null;}

test('Wegsuche startet auch 5–6 Einheiten vor der Wand (Ecke im Gewölbe, wo die Ratten hingen)',()=>{
 const g=game();inside(g);const q=wallSpot(g,'k2',41.3,4.6);assert.ok(q,'Stelle an der Wand gefunden');
 const rat=g.enemies.find(e=>e.pack==='gewoelbe-west');const path=g.world.findPath(q,rat.home);assert.ok(path.length>0,'Weg nach Hause');
});

test('Ratten auf dem Rückweg kommen nach Hause, auch wenn der Held danebensteht – ohne Pendeln',()=>{
 const g=game(),r=inside(g);const rats=g.enemies.filter(e=>e.pack==='gewoelbe-west');for(const e of g.enemies)if(isTrash(e)&&e.pack!=='gewoelbe-west'){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}
 const q=wallSpot(g,'k2',41.3,4.6);for(const e of rats){Object.assign(e,{x:q.x,y:q.y,hp:Math.round(e.maxHp*.6)});beginReturn(g,e);}
 Object.assign(g.player,{x:q.x-28,y:q.y+4});g.player.inCombat=0;
 const back=new Map();for(let t=0;t<ENCOUNTER_RULES.dungeonReturnLimit+1;t+=.05){g.tick(.05);for(const e of rats)if(e.ai!=='returning'&&!back.has(e))back.set(e,t);}
 for(const e of rats){assert.ok(back.has(e),e.name+' ist innerhalb der Frist zu Hause');assert.ok(Math.hypot(e.x-e.home.x,e.y-e.home.y)<40,'am Platz');assert.equal(e.hp,e.maxHp,'voll');}
 const walked=[...back.values()].filter(t=>t<ENCOUNTER_RULES.dungeonReturnLimit).length;assert.ok(walked>=rats.length/2,'die meisten laufen selbst zurück ('+walked+'/'+rats.length+')');
 // kein Pendeln: der Held bleibt stehen (weit weg von ihrem Platz) – niemand geht wieder in den Kampf und wieder zurück
 let flips=0;const was=new Map(rats.map(e=>[e,e.ai]));for(let t=0;t<10;t+=.05){g.tick(.05);for(const e of rats){if(was.get(e)!==e.ai&&(e.ai==='returning'||was.get(e)==='returning'))flips++;was.set(e,e.ai);}}
 assert.equal(flips,0,'kein Pendeln');
});

test('Rückweg ohne Weg: im Dungeon setzt sich der Gegner nach der Frist zu Hause zurück, auch mit dem Helden daneben',()=>{
 const g=game();inside(g);const e=g.enemies.find(x=>x.pack==='gewoelbe-west');for(const o of g.enemies)if(isTrash(o)&&o!==e){o.hp=0;o.aggro=false;o.ai='dead';o.respawnAt=Infinity;}
 const home={...e.home};Object.assign(e,W('k2',38,10));e.hp=100;beginReturn(g,e);e.returnPath=[];
 const find=g.world.findPath;g.world.findPath=()=>[];/* kein Weg */Object.assign(g.player,{x:e.x+20,y:e.y});g.player.inCombat=0;
 try{run(g,ENCOUNTER_RULES.dungeonReturnLimit+.5);}finally{g.world.findPath=find;}
 assert.notEqual(e.ai,'returning','nicht mehr auf dem Rückweg');assert.ok(Math.hypot(e.x-home.x,e.y-home.y)<1,'zu Hause');assert.equal(e.hp,e.maxHp);
});

// ── 4 · Journal ────────────────────────────────────────────────────────────────────────────────────────────────────
test('Journal: seltener Platz trägt „Selten“, optionaler „Optional“; ein noch nicht gebauter Boss „Noch nicht entdeckt“ und ist gesperrt',()=>{
 const J=DUNGEON_UI.journal,tabs=html=>[...html.matchAll(/<button type="button" class="dj-tab[^>]*>/g)].map(m=>m[0]);
 const list=tabs(journalPanel(null));assert.equal(list.length,DEF.bosses.length,'ein Platz je Boss');
 for(const t of list){assert.match(t,/aria-label="[^"]+"/);assert.match(t,/data-tooltip-note="[^"]*"/);}
 const rare=DEF.bosses.find(b=>b.rare),opt=DEF.bosses.find(b=>b.optional);
 assert.match(list.find(t=>t.includes('data-dj-boss="'+rare.id+'"')),new RegExp('data-tooltip-note="'+J.rare));
 assert.match(list.find(t=>t.includes('data-dj-boss="'+opt.id+'"')),new RegExp(J.optional));
 const kept=DUNGEON_BOSSES.rita;delete DUNGEON_BOSSES.rita;
 try{const t=tabs(journalPanel(null,'gerd')).find(x=>x.includes('data-dj-boss="rita"'));assert.match(t,/aria-disabled="true"/);assert.match(t,new RegExp('data-tooltip-label="'+J.unknown+'"'));}
 finally{DUNGEON_BOSSES.rita=kept;}
});

// ── 5 · Trash-EP (Entscheidung Orchestrator 2026-09-26) ─────────────────────────────────────────────────────────────────
test('Trash-EP im Dungeon: ein Wert (DUNGEON_REWARDS.trashXp) nur für Pack-Gegner – Bosse und ihre Helfer behalten ihre EP',async()=>{
 const {DUNGEON_REWARDS,DUNGEON_ENEMIES}=await import('../content/index.js');const f=DUNGEON_REWARDS.trashXp;
 assert.ok(f>0&&f<1,'weniger als voll');assert.ok(f>=.6,'höchstens 40 % weniger');
 const g=game();inside(g);
 for(const e of g.enemies.filter(isTrash))assert.equal(e.xp,Math.round(DUNGEON_ENEMIES[e.dungeonKind].xp*f),e.name);
 for(const b of g.enemies.filter(e=>e.dungeonBoss))assert.equal(b.xp,DUNGEON_BOSSES[b.bossId].xp,b.name+' unverändert');
});
