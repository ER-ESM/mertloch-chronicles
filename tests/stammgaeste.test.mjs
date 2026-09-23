// Stammgäste der Bude (E-61): Racing Ron, Nyalol und Hotfix-Olli ersetzen die Helden-Mentoren in der Bude.
// Plätze, Gespräche je Kapitel, eigene Auftragsreihen im Hotspot-System, Stockwerk und Wegmarke.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World,distance} from '../world.js';
import {Game} from '../engine.js';
import {hotspotLayout,hotspotInteraction,giverChatter,giverOffers,acceptHotspotQuest,claimHotspotQuest,questStatus,onHotspotKill,hotspotDestination,fillText,hotspotQuest} from '../hotspots.js';
import {hotspotDialogue} from '../hotspot-ui.js';
import {HOTSPOTS,NPCS,HUB_TALK,hubLine} from '../content/index.js';

const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')));
const REGULARS={olli:'bude-olli',nyalol:'bude-nyalol',ron:'bude-ron'};
const giver=id=>hotspotLayout(world).hotspots.find(h=>h.id===REGULARS[id]).giver;
const game=(level=1)=>{const g=new Game(world,{version:1,level});g.hotspots.quests={};g.hotspots.tracked=null;g.floor=0;return g;};

test('die Helden stehen nicht mehr in der Bude, dort stehen die drei Stammgäste (E-61)',()=>{
 assert.deepEqual(world.mentors,[]);
 const g=game();for(const id of ['dieter','baerbel','kevin'])assert.equal(world.base.house.spots[id],undefined);
 assert.equal(g.mentorInteraction(),null);
 assert.deepEqual(Object.keys(NPCS).filter(id=>NPCS[id].regular).sort(),['nyalol','olli','ron']);
 const L=hotspotLayout(world);
 for(const [id,hs] of Object.entries(REGULARS)){const h=L.hotspots.find(x=>x.id===hs);
  assert.ok(h?.regular,hs);assert.equal(h.giver.npc,id);assert.equal(h.giver.name,NPCS[id].name);
  assert.deepEqual({x:h.giver.x,y:h.giver.y},world.base.house.spots[id]);
  assert.ok(distance(h.giver,world.npc)>50,id+' steht nicht in Idas Gesprächsradius');}
});

test('Stammgäste reden immer: erst die Begrüßung, dann reihum die Zeilen des Kapitels, nach dem Akt die done-Zeilen',()=>{
 const g=game();Object.assign(g.player,giver('ron'));
 const it=hotspotInteraction(g);assert.equal(it?.kind,'hotspot');assert.equal(it.giver,'bude-ron');
 assert.equal(giverChatter(g,'bude-ron'),HUB_TALK.ron.greet);
 const a=giverChatter(g,'bude-ron'),b=giverChatter(g,'bude-ron');
 assert.equal(a,hubLine('ron',g.quest.chapter,0,false));assert.equal(b,hubLine('ron',g.quest.chapter,1,false));assert.notEqual(a,b);
 assert.equal(g.mentorTalks.ron,3,'Zähler liegt im Spielstand');
 g.quest.actDone=true;assert.ok(HUB_TALK.ron.done.includes(giverChatter(g,'bude-ron')));
 assert.equal(giverChatter(g,'kirchhof'),null,'die Startreihe plaudert nicht');
 const html=hotspotDialogue(g,'bude-ron','„Testzeile“');assert.match(html,/hotspot-chatter/);assert.match(html,/Racing Ron/);
});

test('oben in der Bude ist unten niemand ansprechbar',()=>{
 const g=game();Object.assign(g.player,giver('olli'));assert.ok(hotspotInteraction(g));
 g.floor=1;assert.equal(hotspotInteraction(g),null);
});

test('Nyalols Daily: Dachse lassen Kabel fallen, Abgabe beim Stammgast, danach wartet die nächste Stufe',()=>{
 const g=game(1);g.lootRandom=()=>0;Object.assign(g.player,giver('nyalol'));
 assert.equal(questStatus(g,'st-nyalol-1'),'available');assert.equal(giverOffers(g,'bude-nyalol')[0].action,'accept');
 assert.ok(acceptHotspotQuest(g,'st-nyalol-1'));
 const dest=hotspotDestination(g);assert.ok(dest,'Wegmarke zum nächsten Dachsgebiet');
 const badgers=hotspotLayout(world).areas.filter(a=>a.species.includes('badger'));assert.ok(badgers.some(a=>a.x===dest.point.x&&a.y===dest.point.y));
 for(let i=0;i<5;i++)onHotspotKill(g,{archetype:'badger',x:0,y:0});
 assert.equal(questStatus(g,'st-nyalol-1'),'ready');
 const xp=g.player.xp,coins=g.rpg.coins;assert.ok(claimHotspotQuest(g,'st-nyalol-1'));assert.ok(g.player.xp>xp||g.player.level>1);assert.equal(g.rpg.coins,coins+hotspotQuest('st-nyalol-1').reward.coins);
 assert.equal(questStatus(g,'st-nyalol-2'),'low','Trash clearen erst ab Stufe 2');
});

test('Ollis Pitch endet bei Kisten-Ida, die Reihe läuft unabhängig von der Startreihe',()=>{
 const g=game(1);Object.assign(g.player,giver('olli'));
 assert.ok(acceptHotspotQuest(g,'st-olli-1'));assert.equal(questStatus(g,'st-olli-1'),'ready');
 assert.equal(giverOffers(g,'ida')[0]?.action,'claim');
 Object.assign(g.player,{x:world.npc.x,y:world.npc.y});const it=hotspotInteraction(g);assert.equal(it?.giver,'ida');
 assert.ok(claimHotspotQuest(g,'st-olli-1'));assert.equal(questStatus(g,'st-olli-2'),'low');
 assert.equal(questStatus(g,'hs-grillwiese-1'),'locked','die Startreihe bleibt an ihre eigene Kette gebunden');
});

test('Stammgäste-Reihen verschieben die Startreihe nicht: Überleitungen führen weiter zum nächsten Ort bzw. zu Ida',()=>{
 const g=game();const series=HOTSPOTS.filter(h=>h.area);
 for(const [i,h] of series.entries()){const lead=h.quests.find(q=>q.objective.kind==='talk');assert.equal(lead.turnIn,series[i+1]?.id||'ida',h.id);
  assert.ok(!/[{}]/.test(fillText(g,hotspotQuest(lead.id),lead.lines.offer)));}
 for(const id of Object.values(REGULARS))for(const q of HOTSPOTS.find(h=>h.id===id).quests)for(const t of [q.title,q.text,...Object.values(q.lines)])assert.ok(!/[{}]/.test(fillText(g,hotspotQuest(q.id),t)),q.id);
});
