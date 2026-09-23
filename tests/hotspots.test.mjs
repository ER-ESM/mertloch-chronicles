// E-55: Startreihe mit geführten Hotspots, Aushänge in der Welt, Sammelaufträge über Monsterdrops.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Game} from '../engine.js';
import {World,distance} from '../world.js';
import {makeEnemy} from '../encounters.js';
import {countItem} from '../rpg.js';
import {HOTSPOTS,WORLD_NOTICES,ARCHETYPES,ELITES} from '../content/index.js';
import {hotspotLayout,questStatus,acceptHotspotQuest,claimHotspotQuest,readNotice,hotspotInteraction,hotspotDestination,hotspotMapMarks,giverGlyph,questProgress} from '../hotspots.js';

const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')));
const hero=(level=1,saved={})=>{const g=new Game(world,{level,...saved});g.rpg.inventory=[];return g;};
const beast=(g,kind,id)=>{const def=ARCHETYPES[kind]||ELITES[kind];return makeEnemy({x:g.player.x+40,y:g.player.y},id,{...def,archetype:kind,ambient:true});};
const slay=(g,kind,n,base=90000)=>{for(let i=0;i<n;i++){const e=beast(g,kind,base+i);g.enemies.push(e);g.kill(e);}};

test('jeder Hotspot und jeder Aushang liegt in der echten Welt: bewohnbar, erreichbar, abseits der Kapitel-Lager',()=>{
 const L=hotspotLayout(world);
 assert.deepEqual(L.hotspots.map(h=>h.id),HOTSPOTS.map(h=>h.id));
 assert.deepEqual(L.notices.map(n=>n.id),WORLD_NOTICES.map(n=>n.id));
 for(const h of L.hotspots){
  // Stammgäste (E-61): Platz in der Bude, kein eigenes Gebiet, erreichbar vom Aufwachplatz.
  if(!h.def.area){const spot=world.base.house.spots[h.def.anchor.slice(5)];assert.ok(h.regular&&h.area===null,h.id);assert.deepEqual({x:h.giver.x,y:h.giver.y},{x:spot.x,y:spot.y},h.id+' steht auf seinem Platz');
   assert.equal(world.blocked(h.giver.x,h.giver.y,6),false,h.id+' frei');assert.ok(world.findPath(world.base.house.spots.wake,h.giver).length>0,h.id+' erreichbar');continue;}
  assert.ok(distance(h.anchor,h.area)<=h.def.area.distance[1]+1,h.id+' Gebiet nah am Geber');
  assert.ok(world.camps.every(c=>distance(c,h.area)>=320),h.id+' Abstand zu Lagern');
  assert.ok(world.findPath(h.giver,h.area).length>0,h.id+' erreichbar');
  assert.equal(h.area.spawns.length,h.def.area.spawns.reduce((n,s)=>n+s.count,0),h.id+' alle Tiere haben einen Platz');
 }
 assert.equal(hotspotLayout(world),L,'einmal je Welt berechnet');
});

test('die Lage ändert die Welt nicht: Nebenaufträge und Lager bleiben, wo sie waren',()=>{
 const fresh=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')));
 hotspotLayout(fresh);
 assert.deepEqual(fresh.quests.map(q=>[q.id,q.target.x,q.target.y]),world.quests.map(q=>[q.id,q.target.x,q.target.y]));
 assert.deepEqual(fresh.camps.map(c=>[c.id,c.x,c.y]),world.camps.map(c=>[c.id,c.x,c.y]));
});

test('Startreihe: Aufträge am Hotspot, danach führt eine Überleitung zum nächsten Geber',()=>{
 const g=hero(1);
 assert.equal(questStatus(g,'hs-kirchhof-1'),'available');
 assert.equal(questStatus(g,'hs-kirchhof-3'),'locked','Überleitung erst nach den Aufträgen');
 assert.equal(questStatus(g,'hs-grillwiese-1'),'locked','nächster Hotspot erst nach der Überleitung');
 assert.equal(giverGlyph(g,'kirchhof'),'!');
 // Kill-Auftrag
 assert.ok(acceptHotspotQuest(g,'hs-kirchhof-1'));assert.equal(g.hotspots.tracked,'hs-kirchhof-1');
 slay(g,'badger',3);assert.equal(questStatus(g,'hs-kirchhof-1'),'accepted');
 slay(g,'goose',2,91000);assert.equal(questProgress(g,'hs-kirchhof-1'),3,'andere Arten zählen nicht');
 slay(g,'badger',1,92000);assert.equal(questStatus(g,'hs-kirchhof-1'),'ready');assert.equal(giverGlyph(g,'kirchhof'),'?');
 const xp=g.player.xp,coins=g.rpg.coins;assert.ok(claimHotspotQuest(g,'hs-kirchhof-1'));
 assert.ok(g.player.xp>xp||g.player.level>1);assert.equal(g.rpg.coins,coins+6);
 // Drop-Auftrag: Chance aus dem Inhalt, Gegenstand wird bei der Abgabe eingezogen
 assert.ok(acceptHotspotQuest(g,'hs-kirchhof-2'));g.lootRandom=()=>0;slay(g,'goose',5,93000);
 assert.equal(countItem(g.rpg,'kollektefeder'),5);assert.equal(questStatus(g,'hs-kirchhof-2'),'ready');
 slay(g,'goose',2,94000);assert.equal(countItem(g.rpg,'kollektefeder'),5,'nach Erfüllung fällt nichts mehr');
 assert.ok(claimHotspotQuest(g,'hs-kirchhof-2'));assert.equal(countItem(g.rpg,'kollektefeder'),0,'eingezogen');
 // Überleitung: sofort bereit, Abgabe beim nächsten Geber
 assert.equal(questStatus(g,'hs-kirchhof-3'),'available');assert.ok(acceptHotspotQuest(g,'hs-kirchhof-3'));
 assert.equal(questStatus(g,'hs-kirchhof-3'),'ready');assert.equal(giverGlyph(g,'grillwiese'),'?');
 const oskar=hotspotLayout(world).hotspots.find(h=>h.id==='grillwiese').giver;
 assert.deepEqual(hotspotDestination(g).point,{x:oskar.x,y:oskar.y},'Wegmarke zeigt auf Oskar');
 assert.ok(claimHotspotQuest(g,'hs-kirchhof-3'));assert.ok(countItem(g.rpg,'festivalstiefel')===1,'Gegenstandsbelohnung');
 // Nächster Hotspot: Stufe entscheidet zwischen „zu früh“ und „verfügbar“
 g.player.level=1;assert.equal(questStatus(g,'hs-grillwiese-1'),'low');assert.equal(giverGlyph(g,'grillwiese'),'low');
 g.player.level=2;assert.equal(questStatus(g,'hs-grillwiese-1'),'available');
});

test('Questgegenstände fallen nur, solange der Auftrag läuft',()=>{
 const g=hero(1);g.lootRandom=()=>0;slay(g,'goose',4);
 assert.equal(countItem(g.rpg,'kollektefeder'),0);
});

test('Aushang: der Fund startet den Auftrag, der letzte Treffer schließt ihn mit Belohnung ab',()=>{
 const g=hero(6),n=hotspotLayout(world).notices.find(x=>x.id==='aushang-bruno');
 assert.equal(questStatus(g,'aushang-bruno'),'locked','unbekannt, bis er gefunden ist');
 g.player.x=n.x;g.player.y=n.y;const it=hotspotInteraction(g);assert.equal(it.kind,'notice');assert.equal(it.id,'aushang-bruno');
 assert.ok(readNotice(g,'aushang-bruno'));assert.equal(questStatus(g,'aushang-bruno'),'accepted');
 assert.ok(hotspotMapMarks(g).areas.some(a=>a.id==='aushang-bruno'&&a.active),'Zielgebiet erscheint auf der Karte');
 const coins=g.rpg.coins;slay(g,'alphaBoar',1);
 assert.equal(questStatus(g,'aushang-bruno'),'claimed');assert.equal(g.rpg.coins,coins+25);assert.equal(countItem(g.rpg,'bierdeckelweste'),1);
});

test('Interaktion am Geber, Kartenmarken und Spielstand',()=>{
 const g=hero(1),h=hotspotLayout(world).hotspots[0];g.player.x=h.giver.x+10;g.player.y=h.giver.y;
 const it=hotspotInteraction(g);assert.equal(it.kind,'hotspot');assert.equal(it.giver,'kirchhof');
 const marks=hotspotMapMarks(g);assert.ok(marks.givers.some(m=>m.id==='hotspot:kirchhof'&&m.glyph==='!'));
 assert.ok(marks.areas.some(a=>a.id==='kirchhof'&&/Pfanddachs/.test(a.label)),'Tiergebiet mit Artnamen');
 assert.ok(!marks.areas.some(a=>a.id==='grillwiese'),'gesperrte Hotspots bleiben verborgen');
 acceptHotspotQuest(g,'hs-kirchhof-1');slay(g,'badger',2);
 const saved=JSON.parse(JSON.stringify(g.save())),again=new Game(world,saved);
 assert.equal(questProgress(again,'hs-kirchhof-1'),2);assert.equal(again.hotspots.tracked,'hs-kirchhof-1');
 const odd=new Game(world,{...saved,hotspots:{quests:{'gibt-es-nicht':{accepted:true}},found:['auch-nicht'],tracked:'nein'}});
 assert.deepEqual(odd.hotspots,{quests:{},found:[],tracked:null},'fremde IDs fallen heraus');
});

test('Tiergebiete werden in Spielernähe angelegt und zählen nicht für Kapitel-Aufträge',()=>{
 const g=hero(1),h=hotspotLayout(world).hotspots[0];g.player.x=h.area.x+400;g.player.y=h.area.y;
 g.hotspotDirector.clock=0;g.hotspotDirector.tick(1);
 const mine=g.enemies.filter(e=>e.hotspot==='kirchhof');
 assert.equal(mine.length,8);assert.deepEqual([...new Set(mine.map(e=>e.archetype))].sort(),['badger','goose']);
 assert.ok(mine.every(e=>e.ambient),'wie Feldtiere: keine Kapitel-Kills');
 g.hotspotDirector.clock=0;g.hotspotDirector.tick(1);assert.equal(g.enemies.filter(e=>e.hotspot==='kirchhof').length,8,'nicht doppelt');
});

test('Hofprobe 5/8 hält niemanden vor den Aufträgen fest: nach vier verpassten Kreisen geht es weiter',async()=>{
 const {TUTORIAL}=await import('../content/index.js');
 const g=new Game(world,{level:1,tutorial:{version:1,step:4,completed:false}});
 let t=0;while(g.tutorial.step===4&&t<60){g.tick(.05);t+=.05;}
 assert.equal(g.tutorial.step,5,'ohne Ausweichen weiter nach '+TUTORIAL.maxDodgeTries+' Kreisen');
 assert.ok(t<=(TUTORIAL.castTime+TUTORIAL.castPause)*TUTORIAL.maxDodgeTries+1,'nach spätestens vier Runden');
 assert.ok(g.events.some(e=>e.type==='toast'&&e.text===TUTORIAL.giveUp));
});

test('keine doppelten Leute: Hotspot-Geber vergeben in dieser Welt keine Nebenaufträge, Namen stehen im Text',async()=>{
 const {fillText,hotspotQuest}=await import('../hotspots.js');const L=hotspotLayout(world),npcs=L.hotspots.map(h=>h.giver.npc);
 assert.equal(new Set(npcs).size,npcs.length,'vier verschiedene Geber');
 for(const n of npcs){assert.ok(!world.quests.some(q=>q.giver.npc===n),n+' vergibt schon Nebenaufträge');assert.ok(!['ida','dieter','baerbel','kevin'].includes(n),n+' ist Mentor oder Ida');}
 const g=hero(1),lead=hotspotQuest('hs-kirchhof-3'),next=L.hotspots.find(h=>h.id==='grillwiese').giver.name,own=L.hotspots.find(h=>h.id==='kirchhof').giver.name;
 assert.equal(fillText(g,lead,lead.title),'Ein Wort bei '+next);
 assert.ok(fillText(g,lead,lead.lines.done).startsWith(own+' schickt dich?'),'der nächste Geber nennt den Absender');
 for(const q of HOTSPOTS.flatMap(h=>h.quests))for(const t of [q.title,q.text,...Object.values(q.lines)])assert.ok(!/[{}]/.test(fillText(g,q,t)),q.id+': Platzhalter bleibt stehen');
});
