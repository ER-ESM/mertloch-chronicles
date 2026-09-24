// Optimierung Runde 2b (2026-09-24): Angreifer wird Ziel, Rechtsklick läuft hin, Kurzmeldungen nacheinander.
// Der Klickpfad im echten Spiel steht in scripts/optimierung-r2b-check.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {startAuto} from '../auto-combat.js';
import {adoptAttacker,preferAttacker,idleTarget} from '../attacker-target.js';
import {approachTarget,tickApproach} from '../attack-approach.js';
import {createToastQueue,TOAST_FULL,TOAST_MIN} from '../toast-queue.js';
import {selectFriend} from '../help-target.js';

const arena=()=>({id:'runde-2b',seed:3,spawn:{x:0,y:0},npc:{x:10,y:0,name:'Kisten-Ida'},shrine:{x:-4000,y:0},mentors:[],landmarks:[],camps:[],quests:[],hubs:[],
 findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,walkClear:()=>true,findPath:(a,b)=>[{...b}]});
function scene(){
 const g=new Game(arena(),{level:8,trainingXp:9000});
 const dachs=makeEnemy({x:25,y:0},1,{hp:900,behavior:'neutral',roamWait:100,attackTimer:100});
 const keiler=makeEnemy({x:-80,y:0},2,{hp:900,behavior:'aggressive',roamWait:100,attackTimer:100});
 dachs.name='Pfanddachs';keiler.name='Pfandkeiler';dachs.spawnGrace=keiler.spawnGrace=0;g.enemies=[dachs,keiler];return {g,dachs,keiler};
}

test('Angreifer wird Ziel: statt nichts und statt eines neutralen, unbeteiligten Dachses',()=>{
 let {g,dachs,keiler}=scene();keiler.aggro=true;
 assert.equal(idleTarget(g),true);assert.equal(adoptAttacker(g,keiler),true);assert.equal(g.target,keiler);
 ({g,dachs,keiler}=scene());g.target=dachs;keiler.aggro=true;assert.equal(adoptAttacker(g,keiler),true,'neutraler Dachs weicht dem Angreifer');assert.equal(g.target,keiler);
 ({g,dachs,keiler}=scene());g.target=dachs;dachs.aggro=true;keiler.aggro=true;assert.equal(adoptAttacker(g,keiler),false,'wer den Dachs schon bekämpft, behält ihn');
});

test('Angreifer wird Ziel: ein gewählter Söldner bleibt Ziel (E-65, Heiler wird nicht umgelenkt)',()=>{
 const {g,keiler}=scene();keiler.aggro=true;const buddy={id:'c1',name:'Karl',hp:100,maxHp:100};g.companions=[buddy];selectFriend(g,'companion',buddy);
 assert.equal(adoptAttacker(g,keiler),false);assert.equal(g.friend?.ref,buddy);
});

test('Taste 1 / Angriff: nie der Dachs, solange ein Feind angreift',()=>{
 const {g,dachs,keiler}=scene();g.target=dachs;keiler.aggro=true;
 assert.equal(preferAttacker(g),true);assert.equal(g.target,keiler);
 const s2=scene();s2.g.target=s2.dachs;s2.keiler.aggro=true;startAuto(s2.g);assert.equal(s2.g.target,s2.keiler,'startAuto wählt den Angreifer');assert.equal(s2.g.autoAttack.enabled,true);
 const s3=scene();s3.g.target=null;s3.keiler.aggro=true;s3.g.selectNext();assert.equal(s3.g.target,s3.keiler,'Tab: wer angreift, kommt zuerst – auch vor dem ersten Treffer');
 const s4=scene();s4.g.target=s4.dachs;startAuto(s4.g);assert.equal(s4.g.target,s4.dachs,'ohne Angreifer bleibt der Dachs angreifbar');
});

test('Rechtsklick: läuft zum Ziel außer Reichweite und hält in Reichweite an; eigene Bewegung bricht ab',()=>{
 const {g,keiler}=scene();keiler.x=-200;g.target=keiler;startAuto(g);
 assert.equal(approachTarget(g),true);assert.ok(g.moveTo,'läuft los');
 for(let i=0;i<200&&g.approach;i++)g.tick(.05);
 assert.equal(g.approach,null,'angekommen');assert.ok(Math.hypot(g.player.x-keiler.x,g.player.y-keiler.y)<=40,'in Reichweite '+Math.round(Math.hypot(g.player.x-keiler.x,g.player.y-keiler.y)));assert.equal(g.moveTo,null,'bleibt stehen');
 const s2=scene();s2.keiler.x=-300;s2.g.target=s2.keiler;startAuto(s2.g);approachTarget(s2.g);s2.g.keys.add('d');tickApproach(s2.g,.05);assert.equal(s2.g.approach,null,'Taste bricht ab');
 const s3=scene();s3.keiler.x=-300;s3.g.target=s3.keiler;startAuto(s3.g);approachTarget(s3.g);s3.g.target=null;tickApproach(s3.g,.05);assert.equal(s3.g.approach,null,'Zielwechsel bricht ab');
 const s4=scene();s4.g.target=s4.dachs;startAuto(s4.g);assert.equal(approachTarget(s4.g),false,'schon in Reichweite: kein Laufweg');
});

function fakeEl(){const cls=new Set();return {textContent:'',classList:{add:c=>cls.add(c),remove:c=>cls.delete(c),contains:c=>cls.has(c)}};}
test('Kurzmeldungen: nacheinander, doppelte (auch mit anderer Zahl) nur einmal, warten während einer großen Einblendung',()=>{
 let t=0,hold=false;const el=fakeEl(),q=createToastQueue(el,{now:()=>t,hold:()=>hold});
 q.push('A');q.push('B');q.push('A');q.push('Noch 2,2 s');q.push('Noch 1,9 s');
 assert.equal(el.textContent,'A');assert.deepEqual(q.state().queue,['B','Noch 1,9 s'],'Dublette und gleiche Meldung mit anderer Zahl zusammengefasst');
 t+=TOAST_MIN;q.tick(t);assert.equal(el.textContent,'B');t+=TOAST_MIN;q.tick(t);assert.equal(el.textContent,'Noch 1,9 s');
 t+=TOAST_FULL;q.tick(t);assert.equal(el.classList.contains('visible'),false);
 hold=true;q.push('C');assert.equal(el.classList.contains('visible'),false,'wartet während der Einblendung');hold=false;q.tick(t);assert.equal(el.textContent,'C');
 assert.equal(q.ready(t),false,'frische Meldung: Einblendung wartet');assert.equal(q.ready(t+TOAST_MIN),true);assert.equal(el.classList.contains('visible'),false,'Meldung weicht der Einblendung');
});
