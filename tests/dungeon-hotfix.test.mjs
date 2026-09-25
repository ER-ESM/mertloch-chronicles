// Hotfix Dungeon „Schloss Big B" 2026-09-25 (Prüfer-Playtest, docs/DUNGEON-HOTFIX-2026-09-25.md):
// 1 Arenatür nach WoW-Vorbild: schließt nur mit dem Helden drin, zieht Draußenstehende an den Eingang innen, kein Söldner zieht einen
//   Boss allein, Rechtsklick aus dem Nachbarraum läuft in die Arena. Datengetrieben für alle Arenen (auch die aus Etappe 4).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game} from '../engine.js';
import {DUNGEONS,DUNGEON_BOSSES} from '../content/index.js';
import {toWorld,roomAt,arenaRule,arenaEntrance,bossOutOfReach,arenaAhead} from '../dungeon.js';
import {approachTarget,inStrike} from '../attack-approach.js';
import {startAuto} from '../auto-combat.js';

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
