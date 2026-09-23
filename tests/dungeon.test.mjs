// Dungeon „Schloss Big B" (Plan: docs/DUNGEON-SCHLOSS-BIG-B-2026-09-23.md): Grundriss, Erreichbarkeit, Instanz, Tore,
// Geheimnisse, Arena, Boss-Phasen, neue Zaubermerkmale, Gruppentod und Spielstand.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game} from '../engine.js';
import {DUNGEONS,DUNGEON_ENEMIES,DUNGEON_BOSSES,DUNGEON_CASTS,DUNGEON_TEXT} from '../content/index.js';
import {toWorld,rectWorld,floorAt,roomAt,dungeonEntrance,resolveDungeonCast,dungeonDamageFactor} from '../dungeon.js';

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
 const features=['ground','interruptible','cone','frontGuard','healAllies','callHelp','radius'];
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
 run(g,.5);assert.equal(r.room,'hof');assert.ok(g.toasts.some(t=>t.includes('Einsturzgefahr')),'Durchsage kommt');
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
 // Rückstoß Richtung Treppe: Spieler fliegt ins Rittergeschoss
 g.rpg.talents.spec=null;g.player.hp=g.player.maxHp;at(g,'e0',6,26.5);const toStairs=Math.atan2(toWorld(DEF,'e0',4,23).y-gerd.y,toWorld(DEF,'e0',4,23).x-gerd.x);
 Object.assign(gerd,toWorld(DEF,'e0',8.5,30));resolveDungeonCast(g,gerd,{...cast(Math.atan2(g.player.y-gerd.y,g.player.x-gerd.x)),damage:1},'player');
 assert.equal(floorAt(DEF,g.player.x,g.player.y),'k1','über die Kante gefallen');assert.equal(g.toasts.at(-1),DUNGEON_TEXT.fell);
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
