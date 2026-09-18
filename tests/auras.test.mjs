import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {collectAuras} from '../auras.js';
import {makeEnemy} from '../encounters.js';
import {changeSpec} from '../talents.js';
import {combatStats} from '../rpg.js';
import {onStrikeMech,tickMech} from '../spec-mechanics.js';
import {applyMark} from '../class-mechanics.js';
import {consumeProc} from '../procs.js';
const world=()=>({spawn:{x:0,y:0},npc:{x:0,y:20},landmarks:[],camps:[],blocked:()=>false,findClear:(x,y)=>({x,y}),lineClear:()=>true,findPath:(a,b)=>[b]});
const game=(id='dieter')=>new Game(world(),{classId:id,level:11});
test('auras preserve real buff timers, stacks, shields and read-only game state',()=>{
 const g=game();g.buffs={...g.skills.find(s=>s.id==='buff'),remaining:9,shield:50};g.momentum={stacks:3,until:g.time+7};g.classState.guard=40;g.classState.hot=4;
 const before=JSON.stringify({st:g.classState,b:g.buffs,p:g.procState,m:g.momentum,save:g.save()});let rolls=0;g.random=()=>{rolls++;return .5;};
 const a=collectAuras(g);assert.equal(a.buffs.find(a=>a.id==='buff:buff:').remaining,9);assert.equal(a.buffs.find(a=>a.id==='buff:buff:').shield,50);assert.equal(a.buffs.find(a=>a.id==='buff:momentum:').stacks,3);assert.equal(a.buffs.find(a=>a.id==='buff:guard:').remaining,null);assert.equal(rolls,0);
 assert.equal(JSON.stringify({st:g.classState,b:g.buffs,p:g.procState,m:g.momentum,save:g.save()}),before);
});
test('expired Pegel creates an actual Kater debuff and is never mislabeled as a buff',()=>{
 const g=game();assert.ok(changeSpec(g,'dieter-brawl'));const cs=combatStats(g);onStrikeMech(g,null,cs);assert.ok(collectAuras(g).buffs.some(a=>a.id==='stack'));
 g.time=g.classState.m.stackUntil+.01;tickMech(g,.05,cs);const a=collectAuras(g);assert.ok(a.debuffs.some(a=>a.id==='hangover'));assert.ok(!a.buffs.some(a=>['stack','hangover'].includes(a.id)));
 tickMech(g,4,cs);assert.equal(collectAuras(g).debuffs.length,0);
});
test('target debuffs follow real marking and control state and clear on target loss or death',()=>{
 const g=game(),e=makeEnemy({x:30,y:0},1,{hp:1000});g.target=e;applyMark(g,e,combatStats(g));e.stun=2;e.vulnerable=4;e.controlSlow=.2;
 const ids=collectAuras(g).targetDebuffs.map(a=>a.id);assert.ok(ids.includes('mark')&&ids.includes('stun')&&ids.includes('vulnerable')&&ids.includes('controlSlow'));
 g.target=makeEnemy({x:30,y:0},2,{hp:1000});assert.equal(collectAuras(g).targetDebuffs.length,0);g.target=e;e.hp=0;assert.equal(collectAuras(g).targetDebuffs.length,0);e.hp=500;e.ai='returning';assert.equal(collectAuras(g).targetDebuffs.length,0);
});
test('proc expiration, consuming charges and respawn leave no stale aura icons',()=>{
 const g=game();g.procState.free.strike=g.time+3;g.procState.empower.strike=g.time+5;g.classState.empowered=2;
 assert.equal(collectAuras(g).buffs.filter(a=>a.id.startsWith('proc:strike')).length,2);consumeProc(g,'free','strike');assert.equal(collectAuras(g).buffs.filter(a=>a.id.startsWith('proc:strike')).length,1);
 g.time+=6;assert.equal(collectAuras(g).buffs.filter(a=>a.id.startsWith('proc:strike')).length,0);g.dead=true;assert.deepEqual(collectAuras(g),{buffs:[],debuffs:[],targetDebuffs:[]});g.respawn();assert.equal(collectAuras(g).buffs.length,0);
});
test('all nine class mechanisms expose active states without creating state during a read',()=>{
 for(const [id,spec] of [['dieter','dieter-wall'],['dieter','dieter-brawl'],['dieter','dieter-brew'],['baerbel','baerbel-care'],['baerbel','baerbel-feedback'],['baerbel','baerbel-stage'],['kevin','kevin-fuse'],['kevin','kevin-iron'],['kevin','kevin-hunt']]){
  const g=game(id);assert.ok(changeSpec(g,spec));const before=JSON.stringify(g.classState);collectAuras(g);assert.equal(JSON.stringify(g.classState),before,spec);
 }
});
test('parry charges and proc counters use their actual rule instead of the generic buff description',()=>{
 const g=game();g.rpg.talents.learned=['dieter-wall-0'];g.player.parry=.7;g.player.parryCharges=2;
 g.procState.counts={deckelwirtschaft:1};
 const a=collectAuras(g);assert.equal(a.buffs.find(a=>a.id==='parry').stacks,2);
 const counter=a.buffs.find(a=>a.id==='proc:deckelwirtschaft:count');assert.ok(counter);assert.match(counter.text,/dritte Kelle/);assert.equal(counter.every,3);
});
