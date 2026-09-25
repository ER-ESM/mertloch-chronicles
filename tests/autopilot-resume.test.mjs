// Autopilot mit Söldnern (Playtest Dungeon 2, 2026-09-25): Der Laufweg hält nur an, wenn der Held selbst getroffen wird – nicht,
// weil die Söldner unterwegs kämpfen –, und setzt sich nach dem Kampf fort („Weiter …“). Ohne Begleiter bleibt der Stopp beim
// Bemerken (Runde 3a/5a, tests/optimierung-r3a.test.mjs). Wer nach dem Kampf selbst lenkt, übernimmt.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {AUTOPILOT_RESUME} from '../autopilot.js';
import {AUTOPILOT_UI} from '../content/index.js';

const arena=()=>({id:'autopilot-resume',seed:5,spawn:{x:0,y:0},npc:{x:10,y:0,name:'Kisten-Ida'},shrine:{x:-4000,y:0},mentors:[],landmarks:[],camps:[],quests:[],hubs:[],
 findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,walkClear:()=>true,findPath:(a,b)=>[{x:(a.x+b.x)/2,y:(a.y+b.y)/2},{...b}]});
const enemy=(x,y,id,extra={})=>{const e=makeEnemy({x,y},id,{hp:900,behavior:'aggressive',roamWait:100,attackTimer:100,...extra});e.spawnGrace=0;return e;};
function game(){const g=new Game(arena(),{level:6});g.toasts=[];g.toast=t=>g.toasts.push(t);g.rpg.coins=999;Object.assign(g.player,{x:1000,y:0});return g;}
const tick=(g,s)=>{for(let t=0;t<s;t+=.05)g.tick(.05);};

test('Mit Söldnern: Aggro allein hält den Laufweg nicht an, erst ein Treffer am Helden',()=>{
 const g=game();assert.ok(g.hireCompanion('merc-pils-peter',{free:true}).ok);const k=enemy(1090,0,1,{aggroRange:115});k.home={x:1090,y:0};g.enemies=[k];
 assert.ok(g.navigate({x:1800,y:0}));g.tick(.05);
 assert.equal(k.aggro,true,'der Keiler hat den Helden bemerkt');assert.ok(g.routeGoal,'der Laufweg läuft weiter – der Söldner fängt ab');
 g.hitPlayer(k,5);assert.equal(g.routeGoal,null,'Treffer am Helden hält an');assert.ok(g.autopilotResume,'Ziel zum Fortsetzen gemerkt');
});

test('Nach dem Kampf geht es weiter: Hinweis „Weiter …“, der Laufweg zielt wieder auf dasselbe Ziel',()=>{
 const g=game();const k=enemy(1060,0,1,{aggroRange:115});k.home={x:1060,y:0};g.enemies=[k];
 assert.ok(g.navigate({x:1800,y:0,name:'Schloss Big B'}));g.tick(.05);assert.equal(g.routeGoal,null,'ohne Begleiter: Bemerken hält an (Runde 3a)');
 tick(g,2);assert.equal(g.routeGoal,null,'solange der Gegner kämpft, bleibt der Held stehen');
 k.hp=0;k.aggro=false;k.ai='dead';k.respawnAt=Infinity;tick(g,AUTOPILOT_RESUME.delay/2);assert.equal(g.routeGoal,null,'kurze Pause nach dem Kampf');
 tick(g,AUTOPILOT_RESUME.delay);assert.ok(g.routeGoal,'Laufweg wieder aufgenommen');assert.equal(g.routeGoal.x,1800);
 assert.ok(g.toasts.includes(AUTOPILOT_UI.resumed('Schloss Big B')),'Hinweis „Weiter zu Schloss Big B.“');
});

test('Wer nach dem Kampf selbst lenkt, übernimmt: kein Fortsetzen',()=>{
 const g=game();const k=enemy(1060,0,1,{aggroRange:115});k.home={x:1060,y:0};g.enemies=[k];
 g.navigate({x:1800,y:0});g.tick(.05);assert.ok(g.autopilotResume);
 k.hp=0;k.aggro=false;k.ai='dead';k.respawnAt=Infinity;g.tick(.05);g.keys.add('w');g.tick(.05);g.keys.delete('w');
 tick(g,AUTOPILOT_RESUME.delay*2);assert.equal(g.routeGoal,null,'eigene Steuerung verwirft das Fortsetzen');assert.equal(g.autopilotResume,null);
});
