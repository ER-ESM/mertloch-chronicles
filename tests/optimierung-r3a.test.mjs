// Optimierung Runde 3a (2026-09-24): Kampfeinstieg & Interaktion. Klickpfade: scripts/optimierung-r3a-check.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {autopilotThreat} from '../autopilot.js';
import {tabChoices,tabTier} from '../tab-target.js';
import {entryCalm,entryAggroRange,ENTRY} from '../entry-path.js';
import {chapterCredit,QUEST_AREA,idaMark} from '../quest-mobs.js';
import {walkToTalk,arrivedToTalk} from '../talk-target.js';
import {spriteHit,plateHit,enemyAt} from '../target-ui.js';
import {createToastQueue} from '../toast-queue.js';
import {TUTORIAL,SYSTEM_LINES} from '../content/index.js';

const arena=(extra={})=>({id:'runde-3a',seed:3,spawn:{x:0,y:0},npc:{x:10,y:0,name:'Kisten-Ida'},shrine:{x:-4000,y:0},mentors:[],landmarks:[],camps:[],quests:[],hubs:[],
 findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,walkClear:()=>true,findPath:(a,b)=>[{x:(a.x+b.x)/2,y:(a.y+b.y)/2},{...b}],...extra});
const enemy=(x,y,id,extra={})=>{const e=makeEnemy({x,y},id,{hp:900,behavior:'aggressive',roamWait:100,attackTimer:100,...extra});e.spawnGrace=0;return e;};
const events=(g,type)=>g.events.filter(e=>e.type===type);

test('Autopilot: navigate startet ihn, ein neuer Angreifer hält ihn an, der bekannte Verfolger nicht',()=>{
 const g=new Game(arena(),{level:1});const known=enemy(40,0,1);known.aggro=true;g.enemies=[known];
 assert.equal(g.navigate({x:600,y:0}),true);assert.ok(g.autopilot&&g.routeGoal);
 assert.equal(autopilotThreat(g,known),false,'wer schon kämpfte, stoppt den Rückzug nicht');assert.ok(g.routeGoal);
 const fresh=enemy(300,0,2);g.enemies.push(fresh);
 assert.equal(autopilotThreat(g,fresh),true);assert.equal(g.routeGoal,null);assert.equal(g.moveTo,null);assert.equal(events(g,'autopilotStop').length,1);
});

test('Autopilot: Aggro im Spieltakt und erster Treffer halten den Laufweg an',()=>{
 const g=new Game(arena(),{level:1});Object.assign(g.player,{x:1000,y:0});const k=enemy(1090,0,1,{aggroRange:115});k.home={x:1090,y:0};g.enemies=[k];
 g.navigate({x:1800,y:0});g.tick(.05);
 assert.equal(k.aggro,true);assert.equal(g.routeGoal,null,'Aggro stoppt');assert.equal(g.target,k,'Angreifer wird Ziel');
 const h=new Game(arena(),{level:1});const e=enemy(20,0,2,{behavior:'neutral',aggroRange:0});h.enemies=[e];h.navigate({x:800,y:0});h.hitPlayer(e,5);
 assert.equal(h.routeGoal,null,'Treffer stoppt');
});

test('Tab: Angreifer, dann Feinde, neutrale Tiere nur ohne Feind in Reichweite',()=>{
 const g=new Game(arena(),{level:3});const rabe=enemy(20,0,1,{behavior:'neutral'}),keiler=enemy(150,0,2);g.enemies=[rabe,keiler];
 assert.equal(tabTier(rabe),2);assert.deepEqual(tabChoices(g),[keiler]);
 g.selectNext();assert.equal(g.target,keiler,'nie der nähere Rabe, solange ein Feind in Reichweite ist');
 const other=enemy(60,0,3);other.aggro=true;g.enemies.push(other);assert.deepEqual(tabChoices(g),[other],'Angreifer zuerst');
 g.enemies=[rabe];g.target=null;g.selectNext();assert.equal(g.target,rabe,'ohne Feind geht auch das Tier');
});

test('Rechtsklick: Treffer auf das gezeichnete Bild, den vordersten Gegner und das Namensschild',()=>{
 const g=new Game(arena(),{level:3});const k=enemy(100,100,1),s=enemy(110,86,2,{type:'cultist'});k.spriteTop=k.y-23;s.spriteTop=s.y-30;g.enemies=[k,s];
 assert.equal(enemyAt(g,97,95),k,'Keiler vorn');assert.equal(enemyAt(g,110,60),s,'Kopf des Schnorrers dahinter');
 assert.ok(spriteHit(k,{x:112,y:90}));
 k.plateAt={x:140,y:70,t:1000};assert.ok(plateHit(k,{x:150,y:74},1100),'Namensschild neben dem Helden');
 assert.ok(!plateHit(k,{x:150,y:74},2000),'nur aktuelle Schilder');
});

test('Einstiegsweg: Feldgegner am Laufweg zu Idas erstem Ziel bemerken spät und ziehen keine Kumpel – nur bis Stufe 3',()=>{
 const camp={id:'main-wolf',type:'wolf',x:1000,y:0,approach:{x:700,y:0},count:3};
 const g=new Game(arena({camps:[camp]}),{level:1});g.quest.accepted=true;
 const onPath=enemy(400,40,1,{ambient:true,aggroRange:115}),away=enemy(400,700,2,{ambient:true,aggroRange:115}),campMob=enemy(990,10,3,{aggroRange:78});
 assert.equal(entryCalm(g,onPath),true);assert.equal(entryAggroRange(g,onPath),115*ENTRY.aggroFactor);
 assert.equal(entryCalm(g,away),false,'abseits des Wegs unverändert');assert.equal(entryCalm(g,campMob),false,'Lagergegner unverändert');
 g.player.level=ENTRY.maxLevel+1;assert.equal(entryCalm(g,onPath),false,'ab Stufe 4 gilt das normale Balancing');
});

test('Kapitelziel: Pfandkeiler im Zielgebiet zählen, draußen nicht; Lagergegner zählen immer',()=>{
 const camp={id:'main-wolf',type:'wolf',x:1000,y:0,approach:{x:700,y:0},count:3};
 const g=new Game(arena({camps:[camp]}),{level:2});g.quest.accepted=true;const o=g.objectives()[0];
 const inside=enemy(1000-QUEST_AREA+20,0,1,{ambient:true,family:'boar',type:'wolf'}),outside=enemy(200,0,2,{ambient:true,family:'boar',type:'wolf'}),dachs=enemy(1000,20,3,{ambient:true,family:'badger',type:'wolf'});
 assert.equal(chapterCredit(g,inside,o),true);assert.equal(chapterCredit(g,outside,o),false);assert.equal(chapterCredit(g,dachs,o),false,'Dachs ist kein Keiler');
 g.enemies=[inside];g.kill(inside);assert.equal(g.quest.wolves,1);
 const d=g.destination();assert.deepEqual(d.point,{x:1000,y:0},'Wegmarke fest auf der Gebietsmitte');assert.deepEqual(d.route,{x:700,y:0},'Laufweg aus der Ferne über den Lagerrand');
});

test('Rechtsklick auf einen NPC: hinlaufen, in Gesprächsweite anhalten, Abbruch bei eigener Bewegung',()=>{
 const g=new Game(arena({npc:{x:300,y:0,name:'Kisten-Ida'}}),{level:2});const u={kind:'npc',ref:g.world.npc};
 assert.equal(walkToTalk(g,u),'walk');assert.equal(arrivedToTalk(g),null);
 g.player.x=270;assert.equal(arrivedToTalk(g)?.kind,'npc');assert.equal(g.moveTo,null,'bleibt stehen statt auf Ida');
 g.player.x=0;walkToTalk(g,u);g.keys.add('w');assert.equal(arrivedToTalk(g),null);assert.equal(g.talkTo,null);
});

test('Ablehnungen: rote Fehlerzeile überholt die Schlange; Autoangriff ohne Kurzmeldung',()=>{
 const el={classList:{c:new Set(),contains(k){return this.c.has(k);},add(k){this.c.add(k);},remove(k){this.c.delete(k);}},textContent:''};let t=0;
 const q=createToastQueue(el,{now:()=>t});q.push('A');q.push('B');q.push('Zu weit entfernt · 9 m.',{urgent:true});
 assert.equal(el.textContent,'Zu weit entfernt · 9 m.');assert.deepEqual(q.state().queue,['A','B']);
 const g=new Game(arena(),{level:1});const e=enemy(20,0,1);g.enemies=[e];g.target=e;g.action('auto');
 assert.equal(g.events.filter(x=>x.type==='toast').length,0);
});

test('Notfallbrezel wirkt im Kampf, sonst rote Ablehnung mit Grund',()=>{
 const g=new Game(arena(),{level:1});g.player.hp=6;g.player.inCombat=7;
 assert.equal(g.action('item:brezel'),true);assert.ok(g.player.hp>100);
 g.events.length=0;assert.equal(g.action('item:brezel'),false);
 const fail=g.events.find(e=>e.type==='toast');assert.ok(fail?.error&&/noch nicht bereit · \d+,\d s/.test(fail.text),JSON.stringify(fail));
});

test('Ida: „?“ zur Abgabe (auch Hofprobe), „…“ solange ein Auftrag läuft, „!“ nur für Neues; Tod-Satz passt zur Hose; zwei Hofprobe-Versuche',()=>{
 const g=new Game(arena(),{level:1,tutorial:{version:1,step:7,completed:false}});assert.equal(idaMark(g),'?');
 g.tutorial.step=0;assert.equal(idaMark(g),'!');g.tutorial.step=3;assert.equal(idaMark(g),'…');
 const h=new Game(arena(),{level:1});assert.equal(idaMark(h),'!');h.quest.accepted=true;assert.equal(idaMark(h),'…');
 assert.equal(TUTORIAL.maxDodgeTries,2);assert.ok(SYSTEM_LINES.respawnNoPants&&!/mit Hose/.test(SYSTEM_LINES.respawnNoPants));
});
