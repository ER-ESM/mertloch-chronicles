// Hotfix Dungeon „Schloss Big B" 2026-09-25 (Prüfer-Playtest, docs/DUNGEON-HOTFIX-2026-09-25.md):
// 1 Arenatür nach WoW-Vorbild: schließt nur mit dem Helden drin, zieht Draußenstehende an den Eingang innen, kein Söldner zieht einen
//   Boss allein, Rechtsklick aus dem Nachbarraum läuft in die Arena. Datengetrieben für alle Arenen (auch die aus Etappe 4).
// 3 Weltkarte: das Dungeon-Symbol steht nie im Bündel. 4 (Oberfläche) prüft scripts/dungeon-hotfix-check.mjs.
// 5 Verborgene Gegner (Geheimraum noch nicht betreten) sind weder per Maus noch per Tab wählbar.
// 2 Neuladen: geräumter Trash bleibt liegen (auch mit stehender Pappwache), Kontrollpunkte außer Aggro-Reichweite, Schutz nach dem Laden.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game} from '../engine.js';
import {DUNGEONS,DUNGEON_BOSSES} from '../content/index.js';
import {toWorld,roomAt,arenaRule,arenaEntrance,bossOutOfReach,arenaAhead,restoreDungeonRun,RESUME_CALM,concealed} from '../dungeon.js';
import {enemyAt,unitAt} from '../target-ui.js';
import {tabChoices} from '../tab-target.js';
import {approachTarget,inStrike} from '../attack-approach.js';
import {startAuto} from '../auto-combat.js';
import {clusterMarkers,drawAtlas,mapPlaces} from '../cartography.js';

const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')),{});
const DEF=DUNGEONS['schloss-bigb'];
const MERCS=['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst'];
function game(level=10){const g=new Game(world,{level},{});g.toasts=[];g.toast=t=>g.toasts.push(t);g.random=()=>.5;return g;}
function inside(g){assert.ok(g.enterDungeon('schloss-bigb',{force:true}),'Dungeon betreten');return g.dungeonRun;}
const at=(g,floor,x,y)=>{Object.assign(g.player,toWorld(DEF,floor,x,y));g.player.inCombat=0;};
const run=(g,seconds)=>{for(let t=0;t<seconds;t+=.05)g.tick(.05);};
const quiet=g=>{for(const e of g.enemies)if(!e.dungeonBoss){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}};
const gerdOf=g=>g.enemies.find(e=>e.bossId==='gerd');
const roomOf=(g,u)=>roomAt(DEF,u.x,u.y)?.id||null;
function party(g,near=g.player){for(const id of MERCS)g.hireCompanion(id,{free:true});g.companions.forEach((c,i)=>{const q=g.world.findClear(near.x+(i-1.5)*18,near.y+14,9);c.x=q.x;c.y=q.y;});return g;}

test('Türregel: zu nur mit dem Helden drin; einmal zu, hält sie mit jedem der Gruppe drin; sonst setzt der Boss zurück',()=>{
 assert.equal(arenaRule({closed:false,hero:true,party:true}),'close');
 assert.equal(arenaRule({closed:false,hero:false,party:true}),'reset','ein Söldner allein zieht keinen Boss');
 assert.equal(arenaRule({closed:false,hero:false,party:false}),'reset');
 assert.equal(arenaRule({closed:true,hero:false,party:true}),'hold','Held als Geist oder gestürzt: Söldner kämpfen weiter (E-71)');
 assert.equal(arenaRule({closed:true,hero:true,party:true}),'hold');
 assert.equal(arenaRule({closed:true,hero:false,party:false}),'reset');
});

test('Jede Arena hat einen Eingang innen – auch die, die Etappe 4 baut (Exposé, Kurt)',()=>{
 const g=game(),r=inside(g);
 for(const room of DEF.rooms.filter(x=>x.arena)){const q=arenaEntrance(r,room.id,null);assert.ok(q,room.id+' hat eine Arenatür');assert.equal(roomAt(DEF,q.x,q.y)?.id,room.id,room.id+': Eingang liegt innen');
  assert.ok(DEF.doors.some(d=>d.arena===room.id),room.id+' Tür mit arena');}
 for(const d of DEF.doors.filter(x=>x.arena))assert.ok(DEF.rooms.find(x=>x.id===d.arena)?.arena,d.id+' zeigt auf eine Arena');
});

test('Vorgelaufener Söldner zieht Gerd nicht allein: Gerd setzt zurück, Tür bleibt offen, Held und Gruppe draußen',()=>{
 const g=game(),r=inside(g);quiet(g);at(g,'e0',20,29);party(g);const gerd=gerdOf(g),horst=g.companions.find(c=>c.def.id==='merc-hopfen-horst');
 const q=toWorld(DEF,'e0',11,29);horst.x=q.x;horst.y=q.y;assert.equal(roomOf(g,horst),'zugbruecke');
 // Befund 8: Horst trifft Gerd (Bedrohung auf Horst), der Held steht im Hof
 gerd.aggro=true;gerd.ai='combat';gerd.threat={[horst.id]:500};run(g,.3);
 assert.equal(r.arena,null,'Tür bleibt offen');assert.ok(!gerd.aggro&&gerd.hp===gerd.maxHp,'Gerd setzt zurück');
 const door=toWorld(DEF,'e0',15.5,28.5);assert.equal(g.world.blocked(door.x,door.y,3),false,'Durchgang frei');
 // Söldner mit Befehl „Angreifen" auf Gerd, Held draußen: niemand greift an, Gerd bleibt ruhig
 g.target=gerd;for(const c of g.companions){c.order='attack';c.retarget=0;}run(g,4);
 assert.ok(!gerd.aggro&&gerd.hp===gerd.maxHp,'kein Söldner zieht Gerd allein');assert.equal(r.arena,null);
 assert.ok(g.companions.every(c=>c.target!==gerd),'Gerd ist kein Söldnerziel, solange der Held draußen steht');
});

test('Söldner warten am Arenarand, wenn ihr Platz in der offenen Arena läge',()=>{
 const g=game(),r=inside(g);quiet(g);at(g,'e0',17.5,28.5);g.player.facing=-1;party(g);
 const pt=toWorld(DEF,'e0',12,29);assert.equal(arenaAhead(g,pt),true,'Platz in der Arena, Held im Hof');
 run(g,3);for(const c of g.companions)assert.notEqual(roomOf(g,c),'zugbruecke',c.name+' wartet draußen');
 at(g,'e0',12,29);assert.equal(arenaAhead(g,pt),false,'mit dem Helden drin gilt die Regel nicht');
 gerdOf(g).hp=0;at(g,'e0',17.5,28.5);assert.equal(arenaAhead(g,pt),false,'nach Gerd ist die Zugbrücke frei');
 assert.equal(r.arena,null);
});

test('Tür fällt zu mit dem Helden drin: alle vier Söldner stehen danach innen, Gerd ist besiegbar',()=>{
 const g=game(),r=inside(g);quiet(g);at(g,'e0',20,33);party(g);const gerd=gerdOf(g);
 at(g,'e0',12,31);assert.equal(roomOf(g,g.player),'zugbruecke');
 gerd.aggro=true;gerd.ai='combat';g.target=gerd;g.player.inCombat=7;run(g,.2);
 assert.equal(r.arena,'zugbruecke','Tür zu');const door=toWorld(DEF,'e0',15.5,28.5);assert.equal(g.world.blocked(door.x,door.y,3),true);
 for(const c of g.companions)assert.equal(roomOf(g,c),'zugbruecke',c.name+' ist in der Arena');
 run(g,3);assert.ok(gerd.aggro&&gerd.hp<gerd.maxHp,'Kampf läuft');assert.equal(r.arena,'zugbruecke');
});

test('Kein Treffer von außen: Autoangriff und Kniffe auf Gerd aus dem Hof laufen erst in die Arena',()=>{
 const g=game(),r=inside(g);quiet(g);at(g,'e0',17.2,28.5);const gerd=gerdOf(g);Object.assign(gerd,toWorld(DEF,'e0',13.5,28.5));gerd.home={x:gerd.x,y:gerd.y};
 g.target=gerd;assert.equal(bossOutOfReach(g,gerd),true);assert.equal(inStrike(g,gerd),false,'nah und in Sicht, aber draußen');
 g.skills.find(s=>s.id==='auto').range=400;startAuto(g);g.autoAttack.enabled=true;const before=gerd.hp;
 for(let i=0;i<20;i++)g.tick(.05);assert.equal(gerd.hp,before,'kein Autoangriff durch die offene Tür');
 at(g,'e0',13,31);assert.equal(bossOutOfReach(g,gerd),false,'in der Arena');assert.equal(r.arena,null);
});

test('Rechtsklick auf Gerd aus dem Schlosshof: Held läuft per Wegsuche in die Arena, alle fünf drin, dann Kampf',()=>{
 const g=game(),r=inside(g);quiet(g);at(g,'e0',30,30);party(g);const gerd=gerdOf(g);
 g.target=gerd;assert.ok(startAuto(g),'Angriff an');assert.ok(approachTarget(g,gerd),'läuft los');
 let closedAt=null;for(let t=0;t<30&&!closedAt;t+=.05){g.tick(.05);if(r.arena)closedAt={hero:roomOf(g,g.player),mercs:g.companions.map(c=>roomOf(g,c))};}
 assert.ok(closedAt,'Tür fällt irgendwann zu');assert.equal(closedAt.hero,'zugbruecke','Held ist drin, als die Tür zufällt');
 assert.deepEqual(closedAt.mercs,['zugbruecke','zugbruecke','zugbruecke','zugbruecke'],'alle vier Söldner sind drin');
 run(g,2);assert.ok(gerd.aggro&&gerd.hp<gerd.maxHp,'Kampf läuft');
});

test('Big B: dieselbe Türregel am Thronsaal (Tresortür), Eingang innen hinter der Tresortür',()=>{
 const g=game(),r=inside(g);quiet(g);for(const s of ['siegel-gerd','siegel-expose','siegel-kurt'])r.seals.add(s);r.killed.add('gerd');r.version++;
 const bigb=g.enemies.find(e=>e.bossId==='bigb');assert.ok(bigb,'Big B steht');at(g,'k2',38,24);party(g);
 bigb.aggro=true;bigb.ai='combat';bigb.threat={[g.companions[3].id]:500};run(g,.2);assert.equal(r.arena,null,'Held im Gang: Tür bleibt offen');assert.ok(!bigb.aggro,'Big B setzt zurück');
 at(g,'k2',50,24);bigb.aggro=true;bigb.ai='combat';g.target=bigb;g.player.inCombat=7;run(g,.2);
 assert.equal(r.arena,'thronsaal');for(const c of g.companions)assert.equal(roomOf(g,c),'thronsaal',c.name+' im Thronsaal');
});

// ── 2 · Neuladen ─────────────────────────────────────────────────────────────────────────────────────────────
const DAY=Date.UTC(2026,8,25,12),clockAt=(g,ms)=>{g.clock=()=>ms;return g;};
function reload(g,ms=DAY+60e3){const save=JSON.parse(JSON.stringify(g.save()));const h=new Game(world,{...save,dungeonRun:null},{});h.clock=()=>ms;h.random=()=>.5;h.toast=()=>{};assert.ok(restoreDungeonRun(h,save.dungeonRun),'Laufstand geladen');return {h,save};}

test('Geräumter Pack bleibt nach dem Neuladen liegen, auch wenn die Pappwache noch steht (Befund 10)',()=>{
 const g=clockAt(game(),DAY),r=inside(g),west=g.enemies.filter(e=>e.pack==='hof-west');
 assert.ok(west.some(e=>e.cardboard)&&west.some(e=>!e.cardboard),'hof-west: Kämpfer und Pappwache');
 for(const e of west)if(!e.cardboard)g.kill(e);
 assert.ok(west.find(e=>e.cardboard).hp>0,'die Pappwache steht noch');assert.ok(r.trash.has('hof-west'),'Pack gilt als geräumt');
 at(g,'e0',31,37);run(g,.2);const {h,save}=reload(g);assert.ok(save.dungeonRun.trash.includes('hof-west'));
 assert.ok(h.enemies.filter(e=>e.pack==='hof-west').every(e=>e.hp<=0),'nach dem Neuladen liegt der ganze Pack');
 assert.equal(roomAt(DEF,h.player.x,h.player.y)?.id,'hof','am Kontrollpunkt im Hof');
 run(h,RESUME_CALM+3);assert.ok(!h.enemies.some(e=>e.hp>0&&e.aggro),'kein Gegner greift an');assert.equal(h.player.inCombat,0,'kein Sofort-Kampf');
});

test('Kein Kontrollpunkt (und nicht der Eingang) in Aggro-Reichweite eines Kämpfers: Sicht, Umherstreifen, ganzer Streifenweg',()=>{
 const g=game(),r=inside(g);for(const b of DEF.bosses){r.killed.add(b.id);if(b.seal)r.seals.add(b.seal);}for(const s of DEF.secrets)r.secrets.add(s.id);r.version++;/* alle Türen offen: strengster Fall */
 const seg=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);};
 const spots=[...DEF.rooms.filter(x=>x.checkpoint).map(x=>({id:x.id,floor:x.floor,...x.checkpoint})),{id:'Eingang',...DEF.start}];
 for(const s of spots){const P=toWorld(DEF,s.floor,s.x,s.y);
  for(const e of g.enemies){if(!e.pack||e.cardboard||e.behavior!=='aggressive'||roomAt(DEF,e.home.x,e.home.y)?.floor!==s.floor)continue;
   if(e.patrol){const pts=e.patrol.points;let m=Infinity;for(let i=0;i<pts.length;i++)m=Math.min(m,seg(P,pts[i],pts[(i+1)%pts.length]));assert.ok(m>e.aggroRange,s.id+': Streife '+e.pack+' kommt auf '+Math.round(m)+' heran (Aggro '+e.aggroRange+')');continue;}
   /* auch beim Umherstreifen: von keinem Punkt des Streifkreises mit Sicht näher als die Aggro-Reichweite */
   for(let i=0;i<24;i++){const q={x:e.home.x+Math.cos(i/24*Math.PI*2)*e.roamRadius,y:e.home.y+Math.sin(i/24*Math.PI*2)*e.roamRadius};if(g.world.blocked(q.x,q.y,5)||!g.world.lineClear(q,P))continue;
    assert.ok(Math.hypot(q.x-P.x,q.y-P.y)>e.aggroRange,s.id+': '+e.name+' aus '+e.pack+' sieht ihn beim Umherstreifen');}
   if(!g.world.lineClear(P,e.home))continue;const d=Math.hypot(P.x-e.home.x,P.y-e.home.y);
   assert.ok(d>e.aggroRange+e.roamRadius,s.id+': '+e.name+' aus '+e.pack+' steht '+Math.round(d)+' weg (Aggro '+e.aggroRange+' + Streifen '+e.roamRadius+')');}}
});

test('Schutz nach dem Laden: RESUME_CALM Sekunden bemerkt kein Gegner den Helden, danach wieder',()=>{
 const g=clockAt(game(),DAY);inside(g);at(g,'e0',31,37);run(g,.2);const {h}=reload(g);
 Object.assign(h.player,toWorld(DEF,'e0',37.5,24));const east=h.enemies.filter(e=>e.pack==='hof-ost'&&!e.cardboard);
 run(h,RESUME_CALM-1.5);assert.ok(east.every(e=>!e.aggro),'im Schutz bemerkt ihn niemand');
 run(h,3);assert.ok(east.some(e=>e.aggro),'danach wie immer');
});

// ── 3 · Weltkarte ────────────────────────────────────────────────────────────────────────────────────────────
test('Bündeln: ein solo-Marker (Dungeon) steht nie im Bündel, ein Lager daneben weicht aus',()=>{
 const out=clusterMarkers([{x:100,y:100,id:'dungeon',solo:true,prio:3.5},{x:104,y:103,id:'lager',prio:1},{x:112,y:96,id:'laden',prio:2},{x:300,y:300,id:'weit'}],24);
 const dg=out.find(c=>c.members.some(m=>m.id==='dungeon'));assert.equal(dg.members.length,1,'Dungeon allein');assert.deepEqual([dg.x,dg.y],[100,100],'an seinem Ort');
 for(const c of out)if(c!==dg)assert.ok(Math.hypot(c.x-dg.x,c.y-dg.y)>=24-1e-6,'Abstand zum Dungeon '+c.members.map(m=>m.id));
 assert.equal(out.reduce((n,c)=>n+c.members.length,0),4,'kein Marker geht verloren');
 assert.deepEqual(clusterMarkers([{x:0,y:0},{x:5,y:0}],24).map(c=>c.members.length),[2],'ohne solo wie bisher');
});

test('Weltkarte (echte Welt, mehrere Zoomstufen): das Dungeon-Symbol ist nie Teil eines Bündels',()=>{
 const g=game();const ctx=new Proxy({measureText:s=>({width:String(s).length*6})},{get:(o,k)=>o[k]||(()=>{})});
 const door=mapPlaces(g).find(h=>h.id==='dungeon:schloss-bigb');assert.ok(door,'Eingang auf der Karte');
 for(const zoom of [1,1.5,2,3,4]){const canvas={width:780,height:580,getContext:()=>ctx};drawAtlas({world:g.world,game:g},canvas,true,null,{zoom,center:{...door.point}});
  const hits=canvas.atlasHits||[],mine=hits.filter(h=>h.ids.includes('dungeon:schloss-bigb'));
  assert.equal(mine.length,1,'Zoom '+zoom+': genau ein Treffer');assert.equal(mine[0].cluster,false,'Zoom '+zoom+': einzeln, nicht „'+mine[0].ids.length+' Orte hier“ ('+mine[0].ids+')');}
});

// ── 5 · Verborgene Gegner (Befund vom Rechtsklick-Fix, 15650507) ─────────────────────────────────────────────
test('Gegner in einem noch nicht betretenen Geheimraum: kein Hover, kein Rechtsklick, kein Tab – nach dem Betreten schon',()=>{
 const g=game(),r=inside(g);at(g,'e0',20,24);const hidden=g.enemies.filter(e=>e.hp>0&&roomAt(DEF,e.x,e.y)?.id==='wehrgang');assert.ok(hidden.length>=3,'Pappschützen im Wehrgang');
 assert.ok(hidden.every(e=>concealed(g,e)),'Wehrgang noch nicht betreten');const s=hidden[0];
 assert.equal(enemyAt(g,s.x,s.y-8),null,'Maus über dem verborgenen Gegner trifft nichts (Hover und Rechtsklick)');
 assert.equal(unitAt(g,s.x,s.y-8),null,'unitAt ebenso');
 const los=g.world.lineClear;g.world.lineClear=()=>true;/* Sicht zählt hier nicht – nur der verborgene Raum */
 for(const e of g.enemies)if(!hidden.includes(e)){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}/* nur die Pappschützen stehen */
 assert.ok(!tabChoices(g).some(e=>hidden.includes(e)),'Tab überspringt verborgene Gegner');
 r.visited.add('wehrgang');assert.equal(enemyAt(g,s.x,s.y-8),s,'nach dem Betreten wählbar');assert.ok(tabChoices(g).some(e=>hidden.includes(e)),'nach dem Betreten per Tab wählbar');
 g.world.lineClear=los;
});
