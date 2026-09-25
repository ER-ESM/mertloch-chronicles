// Dungeon „Schloss Big B" (Plan: docs/DUNGEON-SCHLOSS-BIG-B-2026-09-23.md): Grundriss, Erreichbarkeit, Instanz, Tore,
// Geheimnisse, Arena, Boss-Phasen, neue Zaubermerkmale, Gruppentod und Spielstand.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game} from '../engine.js';
import {DUNGEONS,DUNGEON_ENEMIES,DUNGEON_BOSSES,DUNGEON_CASTS,DUNGEON_TEXT,DUNGEON_REWARDS,COMPANION_RULES,DROP_TABLES} from '../content/index.js';
import {toWorld,rectWorld,floorAt,roomAt,dungeonEntrance,resolveDungeonCast,dungeonDamageFactor,dungeonCastSpot,coneReach,coneHits,restoreDungeonRun,dungeonDay} from '../dungeon.js';
import {hitCompanion} from '../companions.js';
import {takeLoot} from '../rpg.js';
import {startAuto} from '../auto-combat.js';
import {rotate} from '../scripts/balance-rotation.mjs';

const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')),{});
const DEF=DUNGEONS['schloss-bigb'];
function game(level=10){const g=new Game(world,{level},{});g.toasts=[];g.toast=t=>g.toasts.push(t);g.random=()=>.5;return g;}
function inside(g){assert.ok(g.enterDungeon('schloss-bigb',{force:true}),'Dungeon betreten');return g.dungeonRun;}
const at=(g,floor,x,y)=>{Object.assign(g.player,toWorld(DEF,floor,x,y));g.player.inCombat=0;};
const run=(g,seconds)=>{for(let t=0;t<seconds;t+=.05)g.tick(.05);};
const quiet=g=>{for(const e of g.enemies)if(!e.dungeonBoss){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}};
const inRect=(r,x,y)=>x>=r[0]&&x<=r[0]+r[2]&&y>=r[1]&&y<=r[1]+r[3];
const overlap=(a,b)=>a[0]<b[0]+b[2]&&b[0]<a[0]+a[2]&&a[1]<b[1]+b[3]&&b[1]<a[1]+a[3];

test('Grundriss: Räume liegen in ihrer Ebene, überlappen nicht, Türen verbinden zwei Räume',()=>{
 for(const r of DEF.rooms){assert.ok(DEF.floors[r.floor],r.id+' Ebene');for(const q of r.rects){const [w,h]=DEF.floors[r.floor].size;assert.ok(q[0]>=0&&q[1]>=0&&q[0]+q[2]<=w&&q[1]+q[3]<=h,r.id+' liegt in der Ebene');}}
 for(let i=0;i<DEF.rooms.length;i++)for(let j=i+1;j<DEF.rooms.length;j++){const a=DEF.rooms[i],b=DEF.rooms[j];if(a.floor!==b.floor)continue;for(const p of a.rects)for(const q of b.rects)assert.ok(!overlap(p,q),a.id+' überlappt '+b.id);}
 for(const d of DEF.doors){const touched=DEF.rooms.filter(r=>r.floor===d.floor&&r.rects.some(q=>overlap(q,d.rect)));assert.ok(touched.length>=2,d.id+' verbindet zwei Räume ('+touched.map(r=>r.id)+')');}
 const ids=new Set(DEF.rooms.map(r=>r.id));
 for(const t of DEF.transitions)for(const s of [t.a,t.b])assert.ok(DEF.rooms.some(r=>r.floor===s.floor&&r.rects.some(q=>inRect(q,s.x,s.y))),t.id+' Ende liegt in einem Raum');
 for(const p of DEF.packs){assert.ok(ids.has(p.room),p.room);const room=DEF.rooms.find(r=>r.id===p.room);assert.ok(room.rects.some(q=>inRect(q,...p.at)),p.room+' Gruppe liegt im Raum');for(const m of p.members)assert.ok(DUNGEON_ENEMIES[m],'Gegner '+m);}
 for(const b of DEF.bosses){const room=DEF.rooms.find(r=>r.id===b.room);assert.ok(room?.rects.some(q=>inRect(q,...b.at)),b.id+' steht in seinem Raum');}
 for(const a of DEF.announcements)assert.ok(DUNGEON_TEXT.announce[a.id],'Durchsage '+a.id);
 for(const t of DEF.transitions)if(t.secret)assert.ok(DEF.secrets.some(s=>s.id===t.secret),t.id+' Geheimnis');
});

test('Inhalt: jeder Zauber trägt ein Merkmal, Phasen und Adds zeigen auf vorhandene Daten',()=>{
 const features=['ground','interruptible','cone','frontGuard','healAllies','callHelp','radius','line','lie','summon','tankDebuff',/* Etappe 4 Teil A */'goal','stack','spread','los','hidden','retreat','persist','decoy'];
 for(const [id,set] of Object.entries(DUNGEON_CASTS))for(const type of set.cycle){const c=set.casts[type];assert.ok(c,id+'/'+type);assert.ok(c.total>0,id+'/'+type+' Zauberzeit');assert.ok(features.some(f=>c[f]),id+'/'+type+' ohne Merkmal');}
 for(const d of [...Object.values(DUNGEON_ENEMIES),...Object.values(DUNGEON_BOSSES)])assert.ok(DUNGEON_CASTS[d.castSet],d.name+' Zaubermuster');
 for(const [id,b] of Object.entries(DUNGEON_BOSSES)){for(const ph of b.phases||[]){if(ph.castSet)assert.ok(DUNGEON_CASTS[ph.castSet],id+' Phase');if(ph.summon)assert.ok(DUNGEON_ENEMIES[ph.summon.kind],id+' Adds');}assert.ok(DUNGEON_TEXT.bossLines[id]?.engage,id+' Spruch');}
 for(const s of Object.values(DUNGEON_TEXT.announce))assert.ok(!s.includes('—'),'kein Gedankenstrich');
});

test('Erreichbarkeit: jede Reihenfolge der drei Siegelträger führt zur Tresortür',()=>{
 // Räume als Knoten, Türen und Übergänge als Kanten; Tore wie im Spiel (Kette von oben erst nach Gerd, Schacht nur abwärts).
 const edges=[];for(const d of DEF.doors){const rooms=DEF.rooms.filter(r=>r.floor===d.floor&&r.rects.some(q=>overlap(q,d.rect)));if(d.lock?.seals||d.lock?.boss)continue;for(const a of rooms)for(const b of rooms)if(a!==b)edges.push({from:a.id,to:b.id});}
 const roomOf=s=>DEF.rooms.find(r=>r.floor===s.floor&&r.rects.some(q=>inRect(q,s.x,s.y))).id;
 for(const t of DEF.transitions){const A=roomOf(t.a),B=roomOf(t.b);if(t.oneWay!=='b')edges.push({from:A,to:B,gate:t.gate?.side==='a'?t.gate.boss:null,unlock:t.unlock==='b'?B:null});if(t.oneWay!=='a')edges.push({from:B,to:A,gate:t.gate?.side==='b'?t.gate.boss:null});}
 const reach=(start,killed,liftFrom)=>{const seen=new Set([start]),queue=[start];while(queue.length){const r=queue.shift();for(const e of edges){if(e.from!==r||seen.has(e.to))continue;if(e.gate&&!killed.has(e.gate))continue;if(e.unlock&&!liftFrom.has(e.unlock))continue;seen.add(e.to);queue.push(e.to);}}return seen;};
 const holders=DEF.bosses.filter(b=>b.seal),perms=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
 for(const order of perms){const killed=new Set(),lift=new Set();let where='hof';
  for(const i of order){const b=holders[i];let seen=reach(where,killed,lift);if(seen.has('weinkeller'))lift.add('weinkeller');seen=reach(where,killed,lift);assert.ok(seen.has(b.room),'Reihenfolge '+order.map(i=>holders[i].id)+': '+b.id+' erreichbar');killed.add(b.id);where=b.room;}
  assert.ok(reach(where,killed,lift).has('gewoelbe'),'Tresortür erreichbar');}
});

test('Eingang an der Burgstraße, frei begehbar, und nur ab Stufe 8',()=>{
 const g=game(7),door=dungeonEntrance(g);assert.equal(door.street,'Burgstraße');assert.equal(world.blocked(door.x,door.y,9),false);
 Object.assign(g.player,{x:door.x,y:door.y});assert.equal(g.interaction()?.kind,'dungeonEnter');
 assert.equal(g.enterDungeon(),false);assert.match(g.toasts.at(-1),/Stufe 8/);
 g.player.level=10;assert.equal(g.enterDungeon(),true);assert.equal(g.instance.kind,'dungeon');
});

test('Betreten und Verlassen tauschen Welt und Gegner; Speichern hält die Position vor dem Tor',()=>{
 const g=game(),outsideEnemies=g.enemies,door=dungeonEntrance(g);Object.assign(g.player,{x:door.x,y:door.y});assert.ok(g.enterDungeon());const r=g.dungeonRun;
 assert.equal(floorAt(DEF,g.player.x,g.player.y),'e0');assert.equal(roomAt(DEF,g.player.x,g.player.y).id,'hof');assert.equal(g.world.blocked(g.player.x,g.player.y,5),false);
 assert.ok(g.enemies.every(e=>e.dungeon==='schloss-bigb'));assert.ok(g.enemies.some(e=>e.bossId==='gerd'));assert.notEqual(g.enemies,outsideEnemies);
 const saved=g.save();assert.ok(Math.hypot(saved.position.x-door.x,saved.position.y-door.y)<1,'Spielstand steht vor dem Tor');assert.ok(saved.dungeons['schloss-bigb']);
 run(g,.5);assert.equal(r.room,'hof');/* Etappe 2: Durchsage als Sprechblase am Lautsprecher (Chatzeile), keine Kurzmeldung */assert.ok(g.messages.some(m=>m.text.includes('Einsturzgefahr')),'Durchsage kommt');assert.ok(!g.toasts.some(t=>t.includes('Einsturzgefahr')),'nicht als Kurzmeldung');
 assert.equal(g.interaction()?.kind,'dungeonLeave');assert.ok(g.leaveDungeon());assert.equal(g.instance,null);assert.equal(g.enemies,outsideEnemies);assert.equal(g.world,world);
});

test('Kollision: Wände halten, offene Türen lassen durch',()=>{
 const g=game();inside(g);const w=g.world;
 const wall=toWorld(DEF,'e0',15.5,22),door=toWorld(DEF,'e0',15.5,28.5),voidPoint=toWorld(DEF,'e0',31,44);
 assert.equal(w.blocked(wall.x,wall.y,3),true,'Wand zwischen Hof und Zugbrücke');assert.equal(w.blocked(door.x,door.y,3),false,'Tür offen');assert.equal(w.blocked(voidPoint.x,voidPoint.y,3),true,'außerhalb der Räume');
 const a=toWorld(DEF,'e0',24,34),b=toWorld(DEF,'e0',8,34);assert.equal(w.lineClear(a,b),false,'keine Sicht durch die Wand');assert.ok(w.findPath(a,b).length>0,'Weg durch die Tür');
});

test('Treppe nach unten erst nach Gerd, Leiter und Schacht, Aufzug nur von unten zu öffnen',()=>{
 const g=game(),r=inside(g);quiet(g);
 at(g,'e0',5,23);const it=g.interaction();assert.equal(it.kind,'dungeonStep');assert.equal(it.id,'treppe-zugbruecke');
 assert.equal(g.dungeonStep('treppe-zugbruecke','a'),false);assert.equal(g.toasts.at(-1),DUNGEON_TEXT.locked.gate);
 at(g,'e0',18.5,21.5);assert.ok(g.dungeonStep('leiter','a'));assert.equal(roomAt(DEF,g.player.x,g.player.y).id,'wehrgang');
 at(g,'e0',42,10);assert.ok(g.dungeonStep('lichtschacht','a'));assert.equal(floorAt(DEF,g.player.x,g.player.y),'k1');
 at(g,'k1',53.5,8);assert.notEqual(g.interaction()?.id,'lichtschacht','Schacht bietet sich von unten nicht an');assert.equal(g.dungeonStep('lichtschacht','b'),false);
 at(g,'k1',10.5,8);assert.ok(g.dungeonStep('treppe-zugbruecke','b'),'von unten ist die Kette offen');assert.equal(roomAt(DEF,g.player.x,g.player.y).id,'zugbruecke');
 at(g,'e0',44,35.5);assert.equal(g.dungeonStep('aufzug','a'),false);assert.equal(g.toasts.at(-1),DUNGEON_TEXT.locked.lift);
 at(g,'k2',6.5,6.5);assert.ok(g.dungeonStep('aufzug','b'));assert.equal(floorAt(DEF,g.player.x,g.player.y),'e0');at(g,'e0',44,35.5);assert.ok(g.dungeonStep('aufzug','a'),'danach in beide Richtungen');
});

test('Pappwand: Wendeltreppe erst nach dem Fund, Fund bleibt im Spielstand',()=>{
 const g=game(),r=inside(g);quiet(g);at(g,'k1',10,36);
 assert.equal(g.interaction()?.kind,'dungeonSecret');assert.equal(g.dungeonStep('wendeltreppe','a'),false);
 assert.ok(g.dungeonSecret('pappwand'));assert.equal(g.interaction()?.kind,'dungeonStep');assert.ok(g.dungeonStep('wendeltreppe','a'));assert.equal(floorAt(DEF,g.player.x,g.player.y),'k2');
 assert.deepEqual(g.save().dungeons['schloss-bigb'].secrets,['pappwand']);
 const again=new Game(world,g.save(),{});assert.deepEqual(again.dungeons['schloss-bigb'].secrets,['pappwand']);
});

test('Gerd: Arena-Tür zu im Kampf, zwei Phasen mit Adds und neuem Zyklus, Siegel nach dem Sieg',()=>{
 const g=game(),r=inside(g);quiet(g);const gerd=g.enemies.find(e=>e.bossId==='gerd');
 at(g,'e0',8.5,26);gerd.aggro=true;gerd.ai='combat';g.target=gerd;g.player.inCombat=7;run(g,.2);
 assert.equal(r.arena,'zugbruecke');const door=toWorld(DEF,'e0',15.5,28.5);assert.equal(g.world.blocked(door.x,door.y,3),true,'Tür zu');
 g.startCast(gerd);assert.ok(g.toasts.length>=0);assert.ok(gerd.engaged,'Eröffnungsspruch');
 gerd.hp=gerd.maxHp*.49;g.startCast(gerd);assert.equal(g.enemies.filter(e=>e.summoner===gerd).length,2);assert.equal(gerd.castSet,'d-gerd');
 gerd.hp=gerd.maxHp*.24;g.startCast(gerd);assert.equal(g.enemies.filter(e=>e.summoner===gerd).length,4);assert.equal(gerd.castSet,'d-gerd2');
 g.kill(gerd);assert.ok(r.seals.has('siegel-gerd'));assert.ok(r.killed.has('gerd'));assert.equal(gerd.respawnAt,Infinity);assert.deepEqual(g.dungeons['schloss-bigb'].bosses,['gerd']);
 for(const e of g.enemies)if(e.summoner){e.hp=0;e.aggro=false;e.ai='dead';}run(g,.2);g.player.inCombat=0;
 assert.equal(r.arena,null);assert.equal(g.world.blocked(door.x,door.y,3),false,'Tür wieder offen');
 at(g,'e0',5,23);assert.ok(g.dungeonStep('treppe-zugbruecke','a'),'Kette offen');
});

test('Rückzug oder Gruppentod: Gerd setzt zurück, Adds verschwinden, Phasen beginnen von vorn, Aufstehen am Kontrollpunkt',()=>{
 const g=game(),r=inside(g);quiet(g);const gerd=g.enemies.find(e=>e.bossId==='gerd');
 at(g,'e0',8.5,26);gerd.aggro=true;gerd.ai='combat';gerd.hp=gerd.maxHp*.4;g.startCast(gerd);assert.equal(g.enemies.filter(e=>e.summoner===gerd).length,2);
 g.player.hp=0;g.dead=true;g.respawn();run(g,.1);
 assert.equal(gerd.hp,gerd.maxHp);assert.equal(g.enemies.filter(e=>e.summoner===gerd).length,0,'Adds weg');assert.equal(gerd.saidPhases,null);assert.equal(gerd.castSet,'d-gerd');
 assert.equal(roomAt(DEF,g.player.x,g.player.y).id,'hof','am Kontrollpunkt im Hof');assert.ok(g.instance,'noch im Dungeon');assert.match(g.toasts.join(' '),/Kontrollpunkt Schlosshof/);
});

test('Kegel: vorn trifft, hinten nicht; Schutz-Spec nimmt wenig; Rückstoß über die Treppenkante führt ins Rittergeschoss',()=>{
 const g=game(),r=inside(g);quiet(g);const gerd=g.enemies.find(e=>e.bossId==='gerd');gerd.aggro=true;gerd.ai='combat';
 const cast=(angle)=>({...DUNGEON_CASTS['d-gerd'].casts.rausschmiss,angle});
 at(g,'e0',8.5,27);let before=g.player.hp;resolveDungeonCast(g,gerd,cast(-Math.PI/2),'player');assert.ok(g.player.hp<before,'vorn getroffen');
 g.player.hp=g.player.maxHp;at(g,'e0',8.5,35);before=g.player.hp;resolveDungeonCast(g,gerd,cast(-Math.PI/2),'player');assert.equal(g.player.hp,before,'hinten sicher');
 // Schutz-Spec: gedämpft, kein Rückstoß
 g.player.hp=g.player.maxHp;at(g,'e0',8.5,27);g.rpg.talents.spec='dieter-wall';const x0=g.player.y;before=g.player.hp;resolveDungeonCast(g,gerd,cast(-Math.PI/2),'player');
 assert.ok(before-g.player.hp<DUNGEON_CASTS['d-gerd'].casts.rausschmiss.damage*.5,'Schutz nimmt wenig');assert.equal(g.player.y,x0,'kein Rückstoß');
 // Rückstoß Richtung Treppe: in Phase 1 bleibt der Held oben (E-71: kein Rauswurf schon beim Pull), ab Phase 2 fliegt er ins Rittergeschoss
 g.rpg.talents.spec=null;g.player.hp=g.player.maxHp;at(g,'e0',6,26.5);
 Object.assign(gerd,toWorld(DEF,'e0',8.5,30));resolveDungeonCast(g,gerd,{...cast(Math.atan2(g.player.y-gerd.y,g.player.x-gerd.x)),pct:.01},'player');
 assert.equal(floorAt(DEF,g.player.x,g.player.y),'e0','Phase 1: die Kante wirft niemanden hinaus');
 gerd.hp=gerd.maxHp*.45;g.player.hp=g.player.maxHp;at(g,'e0',6,26.5);resolveDungeonCast(g,gerd,{...cast(Math.atan2(g.player.y-gerd.y,g.player.x-gerd.x)),pct:.01},'player');
 assert.equal(floorAt(DEF,g.player.x,g.player.y),'k1','Phase 2: über die Kante gefallen');assert.equal(g.toasts.at(-1),DUNGEON_TEXT.fell);
});

test('Schildwall dämpft Treffer von vorn, Provision heilt Verbündete, Funkspruch ruft die Nachbarn',()=>{
 const g=game(),r=inside(g);const knight=g.enemies.find(e=>e.dungeonKind==='baumarktritter'),healer=g.enemies.find(e=>e.dungeonKind==='maklerpraktikant'&&Math.hypot(e.x-knight.x,e.y-knight.y)<200);
 Object.assign(g.player,{x:knight.x+40,y:knight.y});resolveDungeonCast(g,knight,DUNGEON_CASTS['d-ritter'].casts.schild,'player');
 assert.ok(knight.frontGuard>0);assert.equal(dungeonDamageFactor(g,knight),.2,'vorn gedämpft');Object.assign(g.player,{x:knight.x-40,y:knight.y});assert.equal(dungeonDamageFactor(g,knight),1,'hinten voll');
 knight.hp=knight.maxHp*.5;const before=knight.hp;resolveDungeonCast(g,healer,DUNGEON_CASTS['d-makler'].casts.provision,'player');assert.ok(knight.hp>before,'Ritter geheilt');
 const azubi=g.enemies.find(e=>e.dungeonKind==='securityazubi'),mate=g.enemies.find(e=>e!==azubi&&e.dungeonKind==='securityazubi'&&Math.hypot(e.x-azubi.x,e.y-azubi.y)<240&&!e.aggro);
 resolveDungeonCast(g,azubi,DUNGEON_CASTS['d-azubi'].casts.funk,'player');assert.ok(mate.aggro,'Nachbar kommt');
});

test('Streife läuft den Ringflur ab, solange sie nicht kämpft',()=>{
 const g=game(),r=inside(g);at(g,'e0',31,36);const patrol=g.enemies.filter(e=>e.patrol);assert.equal(patrol.length,3);
 const start=patrol.map(e=>({x:e.x,y:e.y}));run(g,3);assert.ok(patrol.every((e,i)=>Math.hypot(e.x-start[i].x,e.y-start[i].y)>20),'Streife bewegt sich');
 assert.ok(patrol.every(e=>roomAt(DEF,e.x,e.y)?.id==='galerie'),'bleibt im Ringflur');
});

test('Pappe fällt beim ersten Treffer; Dungeon-Kills zählen nicht fürs Kapitel und kommen nicht wieder',()=>{
 const g=game(),r=inside(g);const papp=g.enemies.find(e=>e.cardboard);const progress=JSON.stringify(g.quest);
 g.kill(papp);assert.equal(papp.respawnAt,Infinity);assert.ok(g.toasts.some(t=>DUNGEON_TEXT.cardboard.includes(t)),'Pappe-Spruch');assert.equal(JSON.stringify(g.quest),progress);
 run(g,1);assert.equal(papp.hp,0,'bleibt liegen');
});

test('Verlassen sammelt liegengebliebene Beute ein; Wiederkehr innerhalb von 30 Minuten setzt den Durchgang fort',()=>{
 const g=game(),r=inside(g);quiet(g);const gerd=g.enemies.find(e=>e.bossId==='gerd');g.kill(gerd);
 const inDungeonBags=g.rpg.loot.filter(b=>floorAt(DEF,b.x,b.y));
 g.leaveDungeon({force:true});assert.equal(g.rpg.loot.filter(b=>floorAt(DEF,b.x,b.y)).length,0,'keine Beutel im Keller zurück');if(inDungeonBags.length)assert.ok(g.toasts.some(t=>t.includes('Beutebeutel')));
 const door=dungeonEntrance(g);Object.assign(g.player,{x:door.x,y:door.y});g.player.inCombat=0;assert.ok(g.enterDungeon());assert.equal(g.dungeonRun,r,'derselbe Durchgang');assert.ok(g.dungeonRun.killed.has('gerd'));
 g.leaveDungeon({force:true});g.time+=DEF.resetAfter+1;Object.assign(g.player,{x:door.x,y:door.y});assert.ok(g.enterDungeon());assert.notEqual(g.dungeonRun,r,'nach 30 Minuten frisch');
});

// ── Etappe 1 „Gerd richtig" (E-71, docs/DUNGEON-ETAPPE-1-2026-09-25.md) ─────────────────────────────────────────
const MERCS=['merc-pils-peter','merc-schorle-susi','merc-radler-rita','merc-hopfen-horst'];
const DAY=Date.UTC(2026,8,25,12),clockAt=(g,ms)=>{g.clock=()=>ms;return g;};
function party(g){for(const id of MERCS)g.hireCompanion(id,{free:true});for(const c of g.companions){const q=g.world.findClear(g.player.x+12,g.player.y+12,9);c.x=q.x;c.y=q.y;}return g;}
const gerdOf=g=>g.enemies.find(e=>e.bossId==='gerd');
function pullGerd(g,x=8.5,y=26){quiet(g);at(g,'e0',x,y);party(g);const gerd=gerdOf(g);gerd.aggro=true;gerd.ai='combat';g.target=gerd;g.player.inCombat=7;return gerd;}

test('Söldner: Instanzfaktor nur im Dungeon, draußen unverändert',()=>{
 const g=game();g.rpg.coins=999;assert.ok(g.hireCompanion('merc-radler-rita',{free:true}).ok);const c=g.companions[0];run(g,.1);const out={hp:c.maxHp,dmg:c.damage};
 inside(g);run(g,.1);const F=COMPANION_RULES.instanceFactor;assert.ok(Math.abs(c.damage-out.dmg*F.damage)<1e-6,'Schaden × '+F.damage);assert.equal(c.maxHp,Math.round(out.hp*F.health));
 g.leaveDungeon({force:true});run(g,.1);assert.equal(c.damage,out.dmg,'draußen wieder Weltwerte');assert.equal(c.maxHp,out.hp);
});

test('Schaden als Anteil am Leben; Hausverbot stapelt nur bei dem, der vorn stehen bleibt',()=>{
 const g=game(),r=inside(g);quiet(g);const gerd=gerdOf(g),k=DUNGEON_CASTS['d-gerd'].casts.rausschmiss;gerd.aggro=true;gerd.ai='combat';
 at(g,'e0',8.5,27.5);const cast=()=>({...k,knockback:0,angle:Math.atan2(g.player.y-gerd.y,g.player.x-gerd.x)});
 let before=g.player.hp;resolveDungeonCast(g,gerd,cast(),'merc');const first=before-g.player.hp;
 assert.ok(first>=g.player.maxHp*k.pct*.8&&first<=g.player.maxHp*k.pct+2,'erster Treffer ≈ pct × Höchstleben, nur Deckung und Klassenschutz mindern ('+first+')');
 g.player.hp=g.player.maxHp;before=g.player.hp;resolveDungeonCast(g,gerd,cast(),'merc');const second=before-g.player.hp;
 assert.ok(second>first*1.5,'zweiter Treffer mit Hausverbot deutlich stärker ('+second+' gegen '+first+')');
 g.time+=k.brand.duration+1;g.player.hp=g.player.maxHp;before=g.player.hp;resolveDungeonCast(g,gerd,cast(),'merc');assert.ok(Math.abs(before-g.player.hp-first)<=2,'nach Ablauf wieder normal');
});

test('Flächen und Liste treffen einen zufälligen Nicht-Tank, nie den Schutz-Söldner, der Gerd hält',()=>{
 const g=game(),r=inside(g),gerd=pullGerd(g),tank=g.companions.find(c=>c.def.role==='tank');const seen=new Set();
 for(let i=0;i<24;i++){g.random=()=>i/24;for(const type of ['dresscode','liste']){const k={...DUNGEON_CASTS['d-gerd'].casts[type],x:tank.x,y:tank.y};dungeonCastSpot(g,gerd,k,tank);assert.notEqual(k.victim,tank.id,type+' nie auf den Tank');seen.add(k.victim);
  if(k.ground){const u=k.victim==='player'?g.player:g.companions.find(c=>c.id===k.victim);assert.ok(Math.hypot(k.x-u.x,k.y-u.y)<1,'Fläche liegt unter dem Ziel');}}}
 assert.ok(seen.has('player')&&seen.size>=3,'Held und mehrere Söldner kommen dran: '+[...seen]);
});

test('Kegel trifft nicht durch Wände: Warnfläche und Treffer enden an der Wand',()=>{
 const g=game(),r=inside(g);quiet(g);const gerd=gerdOf(g);Object.assign(gerd,toWorld(DEF,'e0',13,28.5));gerd.aggro=true;
 // Hof hinter der Wand (nördlich der Türöffnung), in Reichweite und im Winkel
 at(g,'e0',17.5,22.5);const angle=Math.atan2(g.player.y-gerd.y,g.player.x-gerd.x),k={...DUNGEON_CASTS['d-gerd'].casts.rausschmiss,angle};
 assert.ok(Math.hypot(g.player.x-gerd.x,g.player.y-gerd.y)<k.cone.range,'Held stünde in Reichweite');assert.equal(g.world.lineClear(gerd,g.player),false,'Wand dazwischen');
 const before=g.player.hp;resolveDungeonCast(g,gerd,k,'merc');assert.equal(g.player.hp,before,'kein Treffer durch die Wand');
 const reach=coneReach(g.world,gerd,k);assert.ok(Math.min(...reach)<k.cone.range,'Strahlen sind an der Wand gekürzt');assert.equal(coneHits(gerd,k,g.player,g),false);
});

test('Trash in festen Gruppen: der eigene Pack kommt sofort, der Nachbarpack bleibt stehen (keine Kette)',()=>{
 const g=game(),r=inside(g);quiet(g);for(const e of g.enemies)if(e.pack==='hof-west'||e.pack==='hof-ost'){e.hp=e.maxHp;e.ai='roaming';e.respawnAt=0;}
 assert.ok(DEF.packs.every(p=>p.id)&&new Set(DEF.packs.map(p=>p.id)).size===DEF.packs.length,'Packs tragen eindeutige IDs');
 const west=g.enemies.filter(e=>e.pack==='hof-west'&&!e.cardboard),east=g.enemies.filter(e=>e.pack==='hof-ost'&&!e.cardboard);
 Object.assign(g.player,g.world.findClear(west[0].x,west[0].y+26,9));g.adminGod=true;west[0].aggro=true;west[0].ai='combat';
 for(let t=0;t<8;t+=.05){g.tick(.05);for(const e of g.enemies)if(e.cast?.callHelp)e.cast=null;}
 assert.ok(west.every(e=>e.aggro||e.hp<=0),'eigener Pack kämpft mit');assert.ok(east.every(e=>!e.aggro),'Nachbarpack bleibt stehen');
});

test('Tod des Helden ist kein Wipe: Geist, Söldner kämpfen weiter, Heil-Söldner hilft auf, Sieg über Gerd',()=>{
 const g=game(),r=inside(g),gerd=pullGerd(g,12,34);g.random=()=>.35;for(const c of g.companions)c.hp=c.maxHp;run(g,4);
 g.hitPlayer(gerd,1e6,false);assert.equal(g.dead,true);const events=[];
 // Nach dem Aufhelfen kämpft der Held wieder mit: hinter Gerd (vom Söldner aus, der ihn hält), Autoangriff und Rotation.
 for(let t=0;t<260&&gerd.hp>0;t+=.05){if(!g.dead){const foe=gerd.hp>0?gerd:null,holder=g.companions.find(c=>c.id===gerd.focus);if(foe&&g.target!==foe){g.target=foe;startAuto(g);}
   if(holder){const d=Math.hypot(gerd.x-holder.x,gerd.y-holder.y)||1,spot=g.world.findClear(gerd.x+(gerd.x-holder.x)/d*26,gerd.y+(gerd.y-holder.y)/d*26,7);g.moveTo=Math.hypot(spot.x-g.player.x,spot.y-g.player.y)>6?spot:null;}
   if(!g.casting&&g.gcd<=0)rotate(g);}
  g.tick(.05);for(const ev of g.events)events.push(ev);g.events.length=0;}
 assert.ok(events.some(e=>e.type==='dungeonGhost'),'Geist statt Weltstillstand');assert.ok(events.some(e=>e.type==='revived'&&e.from==='Schorle-Susi'),'Schorle-Susi hilft auf');
 assert.ok(!events.some(e=>e.type==='dungeonWipe'),'kein Wipe');assert.equal(gerd.hp,0,'Gerd liegt');assert.ok(r.killed.has('gerd'));assert.ok(g.instance,'noch im Dungeon');
});

test('Aufhelfen: 8 s Wirkzeit, 35 % Leben, einmal je Kampf; Wipe erst, wenn alle liegen, dann Kontrollpunkt',()=>{
 const g=game(),r=inside(g),gerd=pullGerd(g,12,34);run(g,1);g.hitPlayer(gerd,1e6,false);run(g,.1);
 const susi=g.companions.find(c=>c.def.id==='merc-schorle-susi');susi.x=g.player.x+20;susi.y=g.player.y;gerd.cast=null;
 for(let t=0;t<7&&g.dead;t+=.05){g.tick(.05);for(const c of g.companions)c.hp=c.maxHp;}assert.equal(g.dead,true,'nach 7 s liegt er noch');
 for(let t=0;t<3&&g.dead;t+=.05){g.tick(.05);for(const c of g.companions)c.hp=c.maxHp;}assert.equal(g.dead,false,'nach 8 s steht er');
 assert.ok(Math.abs(g.player.hp/g.player.maxHp-.35)<.05,'mit 35 % Leben');
 g.hitPlayer(gerd,1e6,false);run(g,.2);for(const c of g.companions)hitCompanion(g,gerd,c,1e7);g.events.length=0;run(g,9);
 assert.equal(g.dead,true,'kein zweites Aufhelfen (alle liegen, einmal je Kampf)');assert.ok(!gerd.aggro&&gerd.hp===gerd.maxHp,'alle am Boden: Gerd setzt zurück');
 g.respawn();assert.equal(g.dead,false);assert.equal(roomAt(DEF,g.player.x,g.player.y).id,'hof','Am Kontrollpunkt aufstehen');
});

test('Laufstand überlebt Neuladen: Gerd liegt, Kette offen, geräumter Pack bleibt liegen, Kontrollpunkt',()=>{
 const g=clockAt(game(),DAY),r=inside(g);for(const e of g.enemies.filter(e=>e.pack==='hof-west'))g.kill(e);quiet(g);const gerd=gerdOf(g);g.kill(gerd);at(g,'e0',31,34);run(g,.2);
 const save=JSON.parse(JSON.stringify(g.save()));assert.equal(save.dungeonRun.inside,true);assert.deepEqual(save.dungeonRun.killed,['gerd']);assert.ok(save.dungeonRun.trash.includes('hof-west'));
 const resumed=(()=>{const h=new Game(world,{...save,dungeonRun:null},{});h.clock=()=>DAY+60e3;restoreDungeonRun(h,save.dungeonRun);return h;})();const r2=resumed.dungeonRun;
 assert.ok(r2&&r2!==r,'wieder im Dungeon');assert.ok(r2.killed.has('gerd')&&r2.seals.has('siegel-gerd'));assert.equal(gerdOf(resumed).hp,0,'Gerd bleibt liegen');
 assert.ok(resumed.enemies.filter(e=>e.pack==='hof-west').every(e=>e.hp<=0),'Pack bleibt geräumt');assert.equal(roomAt(DEF,resumed.player.x,resumed.player.y).id,'hof');
 at(resumed,'e0',5,23);assert.ok(resumed.dungeonStep('treppe-zugbruecke','a'),'Kette ist offen');
 const late=new Game(world,{...save,dungeonRun:null},{});late.clock=()=>DAY+(DEF.resetAfter+60)*1000;assert.equal(restoreDungeonRun(late,save.dungeonRun),false,'nach resetAfter verfallen');assert.ok(!late.instance,'vor dem Tor');
});

test('Tagesstand: Siegelmarken je Boss, Tagesbonus einmal je Flügel und Tag, Siegel bis zum Tagesreset',()=>{
 const g=clockAt(game(),DAY),r=inside(g);quiet(g);let gerd=gerdOf(g);const xp0=g.trainingXp;g.kill(gerd);
 const rec=g.dungeons['schloss-bigb'];assert.equal(rec.marks,DUNGEON_REWARDS.marksPerBoss+DUNGEON_REWARDS.daily.marks);assert.deepEqual(rec.daily.wings,['burghof']);
 assert.equal(gerd.dungeonReward.daily,true);assert.equal(gerd.dungeonReward.xp,Math.round(DUNGEON_BOSSES.gerd.xp*(1+DUNGEON_REWARDS.daily.xp)));assert.ok(g.trainingXp-xp0>=DUNGEON_BOSSES.gerd.xp,'Boss-EP nach Zielzeit');
 g.leaveDungeon({force:true});g.time+=DEF.resetAfter+1;Object.assign(g.player,dungeonEntrance(g));g.player.inCombat=0;assert.ok(g.enterDungeon());
 assert.notEqual(g.dungeonRun,r,'neuer Durchgang');assert.ok(g.dungeonRun.seals.has('siegel-gerd'),'Siegel bleibt bis zum Tagesreset');quiet(g);gerd=gerdOf(g);assert.ok(gerd.hp>0,'Gerd steht wieder (keine Sperre)');
 g.kill(gerd);assert.equal(rec.marks,2*DUNGEON_REWARDS.marksPerBoss+DUNGEON_REWARDS.daily.marks,'zweiter Sieg am Tag: nur Marken');assert.equal(gerd.dungeonReward.daily,false);
 g.leaveDungeon({force:true});g.time+=DEF.resetAfter+1;clockAt(g,DAY+864e5);Object.assign(g.player,dungeonEntrance(g));assert.ok(g.enterDungeon());assert.equal(g.dungeonRun.seals.size,0,'neuer Tag: Siegel von vorn');
});

test('Beute von Gerd: eigene Tabelle, Beute-Moment als Beutel, nichts wird ungefragt angelegt',()=>{
 assert.equal(DUNGEON_BOSSES.gerd.family,'gerd');assert.ok(DROP_TABLES.gerd&&DROP_TABLES.schlosstrash);for(const d of Object.values(DUNGEON_ENEMIES))assert.equal(d.family,'schlosstrash',d.name);
 const g=game(),r=inside(g);quiet(g);for(const k of Object.keys(g.rpg.equipment))g.rpg.equipment[k]=null;g.refreshStats();g.settings.autoLoot=true;
 const gerd=gerdOf(g);g.events.length=0;g.kill(gerd);const bag=g.rpg.loot.find(b=>b.moment);
 assert.ok(bag,'Beutel bleibt liegen');assert.ok(g.events.some(e=>e.type==='lootMoment'&&e.bagId===bag.id),'Beute-Moment');assert.ok(bag.items.some(e=>e.id.startsWith('roll-')),'mindestens ein Ausrüstungsteil');
 assert.equal(bag.reward.marks,DUNGEON_REWARDS.marksPerBoss+DUNGEON_REWARDS.daily.marks);
 at(g,'e0',14,34);assert.ok(Math.hypot(bag.x-g.player.x,bag.y-g.player.y)>43,'weiter weg als ein normaler Beutel');assert.ok(takeLoot(g,bag.id),'in der Arena erreichbar');
 assert.ok(Object.values(g.rpg.equipment).every(v=>!v),'nichts angelegt');
});

test('Schwierigkeit: Datenfeld mit Faktor je Stufe, heute nur Normal',()=>{
 assert.deepEqual(Object.keys(DEF.difficulty),['normal']);const g=clockAt(game(),DAY);inside(g);assert.equal(g.dungeonRun.difficulty,'normal');const base=gerdOf(g).maxHp;g.leaveDungeon({force:true});
 DEF.difficulty.probe={name:'Probe',hp:2,damage:1.5};try{const h=clockAt(game(),DAY);restoreDungeonRun(h,{id:'schloss-bigb',inside:true,difficulty:'probe',day:dungeonDay(h),savedAt:DAY,killed:[],seals:[]});
  assert.equal(h.dungeonRun.difficulty,'probe');assert.equal(gerdOf(h).maxHp,base*2);assert.equal(gerdOf(h).damage,DUNGEON_BOSSES.gerd.damage*1.5);}finally{delete DEF.difficulty.probe;}
});
