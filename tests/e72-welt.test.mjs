// E-72 Runde 4 · Weltgegner (foe-rules.js), Laufwege mit Wegkosten (safe-route.js), Wiederbelebung.
// Anlass: Kenner-Playtest 25.09. – Stufe-12-Helden mit Startausrüstung starben an Pfandkeilern der Stufe 2 (Käthe in ~3 s),
// „Hinlaufen“ führte mitten durchs Rudel, nach dem Aufwachen bei St. Gangolf lief der Held zurück in die Keiler.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Game} from '../engine.js';
import {World,distance} from '../world.js';
import {makeEnemy,ENCOUNTER_RULES} from '../encounters.js';
import {ARCHETYPES,ELITES,BALANCE} from '../content/index.js';
import {rotate} from '../scripts/balance-rotation.mjs';
import {xpToNext} from '../progression.js';
import {gapDamage,gapAggro,greyFoe,worldFoe} from '../foe-rules.js';
import {safeRoute,routeRisk,routeLength,dangerZones} from '../safe-route.js';
import {hotspotLayout} from '../hotspots.js';
import {collectAuras} from '../auras.js';

const flat=()=>({id:'welt-test',spawn:{x:0,y:0},npc:{x:0,y:10},landmarks:[],camps:[],quests:[],blocked:()=>false,lineClear:()=>true,walkClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[{...b}]});
const CLASSES=['dieter','baerbel','kevin','schorsch','kaethe'];
/** Held wie per Admin „level N“: Stufenaufstiege, keine Ausrüstung außer der Startkleidung, keine Talente. */
function hero(classId,level,world=flat()){const g=new Game(world,{classId});g.random=()=>.5;Object.assign(g.player,{x:500,y:500});
 while(g.player.level<level)g.gainXp(xpToNext(g.player.level)-g.player.xp);g.player.hp=g.player.maxHp;return g;}
const boar=(g,i,extra={})=>makeEnemy({x:g.player.x+Math.cos(i*2.1)*30,y:g.player.y+Math.sin(i*2.1)*30},100+i,{...ARCHETYPES.boar,ambient:true,archetype:'boar',...extra});
/** Stehender Kampf mit der Balance-Rotation, ohne Ausweichen. Liefert Treffer, Zauberstarts und die schlimmsten 3 s. */
function fight(g,list,seconds=40){
 const hits=[],casts=[],hit=g.hitPlayer.bind(g),cast=g.startCast.bind(g);
 g.hitPlayer=(e,n,...r)=>{const b=g.player.hp;hit(e,n,...r);hits.push({t:g.time,lost:b-g.player.hp});};
 g.startCast=e=>{casts.push({t:g.time,id:e.id});cast(e);};
 for(const e of list){e.aggro=true;e.ai='combat';}g.enemies=list;g.target=list[0];g.autoAttack.enabled=true;
 for(let i=0;i<seconds/.05&&!g.dead&&list.some(e=>e.hp>0);i++){if(!g.target||g.target.hp<=0)g.target=list.find(e=>e.hp>0);if(!g.casting&&g.gcd<=0)rotate(g,{healAt:.6});g.tick(.05);}
 const worst3=Math.max(0,...hits.map(h=>hits.filter(x=>x.t>=h.t&&x.t<h.t+3).reduce((n,x)=>n+x.lost,0)));
 return {hits,casts,worst3,lost:g.player.maxHp-g.player.hp};
}

test('Stufenabstand wie am Zielrahmen: ±2 unverändert, darunter weniger Schaden und Aggro, grau greift nicht an',()=>{
 const g=hero('kevin',12),at=level=>boar(g,0,{level});
 assert.equal(gapDamage(g,at(10)),1,'Stufe 10 gegen 12: gelb, voller Schaden');
 assert.equal(gapAggro(g,at(10)),1);
 assert.ok(gapDamage(g,at(8))<1&&gapDamage(g,at(8))>.5,'Stufe 8: grün, etwas weniger');
 assert.ok(greyFoe(g,at(7))&&gapAggro(g,at(7))===0,'Stufe 7 gegen 12: grau, bemerkt den Helden nicht');
 assert.equal(gapDamage(g,at(2)),BALANCE.foes.gap.damageFloor,'Stufe 2 gegen 12: ein Viertel');
 // nur Weltgegner: Dungeon, Weltbosse und frei erzeugte Testgegner bleiben unberührt
 for(const extra of [{dungeon:true},{worldBoss:true},{ambient:false}])assert.equal(gapDamage(g,makeEnemy({x:0,y:0},9,{...ARCHETYPES.boar,...extra})),1,JSON.stringify(extra));
 assert.ok(worldFoe(makeEnemy({x:0,y:0},9,{campId:'main-wolf'})),'Lagergegner zählen');
});

test('Stufe-12-Held mit Startausrüstung legt ein Rudel aus fünf Stufe-2-Keilern mühelos (alle fünf Klassen)',()=>{
 for(const c of CLASSES){const g=hero(c,12),list=[0,1,2,3,4].map(i=>boar(g,i)),r=fight(g,list,60);
  assert.ok(!g.dead,c+' ist gestorben');assert.equal(list.filter(e=>e.hp>0).length,0,c+' hat nicht alle erledigt');
  assert.ok(r.lost/g.player.maxHp<.35,c+' verliert '+Math.round(r.lost)+' von '+g.player.maxHp);}
});

test('Grauer Keiler bemerkt den Stufe-12-Helden nicht und zieht keinen Kumpel nach',()=>{
 const g=hero('schorsch',12),a=boar(g,0),b=boar(g,1);Object.assign(a,{x:g.player.x+40,y:g.player.y});Object.assign(b,{x:a.x+30,y:a.y});g.enemies=[a,b];
 for(let i=0;i<40;i++)g.tick(.05);assert.equal(a.aggro,false,'kein Angriff aus 5 m');
 a.aggro=true;a.ai='combat';a.autoTimer=99;a.attackTimer=99;for(let i=0;i<80;i++)g.tick(.05);assert.equal(b.aggro,false,'kein „Kumpel kommt“');
});

test('Stufe-2-Held gegen einen Stufe-2-Keiler: fordernd, aber fair',()=>{
 for(const c of CLASSES){const g=hero(c,2),e=boar(g,0),r=fight(g,[e]);const took=g.time;
  assert.ok(!g.dead&&e.hp<=0,c+' verliert gegen einen Keiler');
  assert.ok(r.lost/g.player.maxHp>=.1&&r.lost/g.player.maxHp<=.5,c+': '+Math.round(r.lost/g.player.maxHp*100)+' % Leben verloren');
  assert.ok(took>=4&&took<=12,c+': Kampf dauert '+took.toFixed(1)+' s (Feld-Korridor 4–12 s)');}
});

test('Ein Rudel tötet nicht in 3 s: fünf Keiler gegen Stufe 2, Spezialangriffe zeitversetzt',()=>{
 for(const c of CLASSES){const g=hero(c,2),list=[0,1,2,3,4].map(i=>boar(g,i)),r=fight(g,list,20);
  assert.ok(r.worst3<g.player.maxHp*.75,c+': '+Math.round(r.worst3)+' Schaden in 3 s bei '+g.player.maxHp+' Leben');
  const starts=r.casts.map(x=>x.t).sort((a,b)=>a-b);for(let i=1;i<starts.length;i++)assert.ok(starts[i]-starts[i-1]>=BALANCE.foes.pack.specialGap-.06,c+': Sprünge im Gleichschlag '+starts.join(', '));}
});

test('Kettenzug: aus einem Tiergebiet mit sechs Keilern kommen höchstens drei zugleich',()=>{
 const g=hero('kevin',2);g.adminGod=true;const list=[0,1,2,3,4,5].map(i=>makeEnemy({x:1000+Math.cos(i)*40,y:500+Math.sin(i)*40},200+i,{...ARCHETYPES.boar,ambient:true,hotspot:'grillwiese',roamRadius:30}));
 g.enemies=list;list[0].aggro=true;list[0].ai='combat';g.target=list[0];let most=0;
 for(let i=0;i<20/.05;i++){g.tick(.05);most=Math.max(most,list.filter(e=>e.aggro&&e.hp>0).length);}
 assert.ok(most>=2,'Kettenzug wirkt weiterhin');assert.ok(most<=BALANCE.foes.pack.max,'zugleich im Kampf: '+most);
});

test('Nach dem Tod läuft kein angehaltener Laufweg weiter, „kurzer Schutz“ hält Gegner fern, bis du angreifst',()=>{
 const g=hero('kevin',4);g.navigate({x:1500,y:500});assert.ok(g.routeGoal,'Laufweg läuft');
 const e=boar(g,0);g.enemies=[e];e.aggro=true;e.ai='combat';g.hitPlayer(e,10);assert.ok(g.autopilotResume,'Angriff hält den Laufweg an');
 g.die('Pfandkeiler');g.respawn();assert.equal(g.autopilotResume,null);
 const f=boar(g,1);g.enemies=[f];Object.assign(g.player,{x:500,y:500});Object.assign(f,{x:540,y:500,home:{x:540,y:500},spawnGrace:0,aggro:false,ai:'roaming'});
 for(let i=0;i<60;i++)g.tick(.05);
 assert.equal(g.routeGoal,null,'kein Weiterlaufen nach dem Aufwachen');assert.equal(f.aggro,false,'Keiler in 5 m bemerkt den frisch Aufgewachten nicht');
 assert.deepEqual(collectAuras(g).buffs.map(b=>b.id),['wakeGuard'],'Symbol „Kurzer Schutz“');
 g.player.inCombat=7;g.tick(.05);assert.equal(g.player.wakeGuard,0,'eigener Angriff beendet den Schutz');
 g.player.inCombat=0;for(let i=0;i<10;i++)g.tick(.05);assert.equal(f.aggro,true,'danach greift er an');
});

const realWorld=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')));
test('Wiederbelebungspunkt St. Gangolf: kein angriffslustiger Weltgegner erreicht dich in 25 m Umkreis',()=>{
 const R=200,spawn=realWorld.spawn,C=ENCOUNTER_RULES.cellSize,g=new Game(realWorld,{classId:'kevin',level:2});Object.assign(g.player,{x:spawn.x,y:spawn.y});
 const reach=[];const cx0=Math.floor(spawn.x/C),cy0=Math.floor(spawn.y/C);
 for(let cy=cy0-5;cy<=cy0+5;cy++)for(let cx=cx0-5;cx<=cx0+5;cx++)for(const e of g.ecology.buildCell(cx,cy))if(e.behavior==='aggressive')reach.push({name:e.name,at:e.home,roam:e.roamRadius,aggro:e.aggroRange});
 for(const a of hotspotLayout(realWorld).areas)for(const s of a.spawns){const def=ARCHETYPES[s.kind]||ELITES[s.kind];if(def.behavior==='aggressive')reach.push({name:def.name,at:s,roam:Math.min(def.roamRadius,Math.round(a.r*.7)),aggro:def.aggroRange});}
 for(const c of realWorld.camps)for(const s of c.spawns||[c])reach.push({name:c.id,at:s,roam:40,aggro:105});
 assert.ok(reach.length>20,'Gegner gefunden: '+reach.length);
 for(const r of reach)assert.ok(distance(r.at,spawn)-r.roam-r.aggro>=R,r.name+' reicht bis '+Math.round((distance(r.at,spawn)-r.roam-r.aggro)/8)+' m an den Wiederbelebungspunkt');
});

test('Laufweg meidet ein Keilerrudel, wenn es einen Umweg gibt – und nicht, wenn die Keiler grau sind',()=>{
 const s=realWorld.spawn,t=realWorld.hubs.find(h=>h.id==='wegestube'),base=realWorld.findPath(s,t),i=Math.floor(base.length/2),m={x:(base[i].x+(base[i-1]||s).x)/2,y:(base[i].y+(base[i-1]||s).y)/2};
 const plant=g=>{g.enemies=[0,1,2].map(k=>makeEnemy(realWorld.findClear(m.x+(k-1)*30,m.y+(k%2)*20,9),900+k,{...ARCHETYPES.boar,ambient:true,archetype:'boar'}));return dangerZones(g).filter(z=>z.id>=900&&z.id<903);};
 const low=new Game(realWorld,{classId:'kevin',level:2}),zones=plant(low),path=safeRoute(low,realWorld,{...s},t);
 assert.equal(zones.length,3);assert.ok(routeRisk(s,base,zones)>0,'der kürzeste Weg führt durchs Rudel');
 assert.ok(routeRisk(s,path,zones)<routeRisk(s,base,zones)*.5,'Umweg meidet das Rudel');
 assert.ok(routeLength(s,path)<=routeLength(s,base)*BALANCE.foes.route.detour+BALANCE.foes.route.slack,'Umweg bleibt kurz');
 const high=new Game(realWorld,{classId:'kevin',level:12});assert.equal(plant(high).length,0,'graue Keiler sind kein Revier');
 // Umweg-Strecken werden bekannt gemacht: die Feldzellen am neuen Weg sind danach gebaut (sonst lief der Umweg in ein unbekanntes Revier)
 const C=ENCOUNTER_RULES.cellSize,mid=path[Math.floor(path.length/2)];assert.ok(low.ecology.cells.has(Math.floor(mid.x/C)+','+Math.floor(mid.y/C)),'Zellen am Umweg bekannt');
});
