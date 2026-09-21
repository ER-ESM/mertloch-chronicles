import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {spawnArena} from '../arena.js';
import {tickCompanions,tickEnemyOnCompanion} from '../companions.js';
import {meterReport,finishMeterCombat} from '../combat-meter.js';
import {redesignPose} from '../redesign-art.js';

function fixture(ids=['merc-hopfen-horst']){
 const world={id:'feedback-test',seed:1,spawn:{x:0,y:0},npc:{x:-5000,y:-5000},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[{...b}]};
 const g=new Game(world,{level:6});g.random=()=>.5;
 for(const id of ids){g.hireCompanion(id,{free:true});Object.assign(g.companions.at(-1),{x:20,y:0,order:'stay'});}
 const [e]=spawnArena(g,{kind:'wolf'});Object.assign(e,{x:40,y:0,hp:10000,maxHp:10000});g.events=[];g.fx=[];
 return {g,e,c:g.companions[0]};
}
const combat=(g,c)=>g.events.filter(e=>e.type==='combat'&&e.actor===c.id);

test('companion damage has its own actor, ability, critical/overkill totals and combat text',()=>{
 const {g,e,c}=fixture();e.hp=5;g.random=()=>0;tickCompanions(g,.01);
 const report=meterReport(g),row=report.actors[0];
 assert.equal(e.hp,0);assert.equal(report.total,5);assert.ok(report.excess>0);
 assert.equal(row.id,c.id);assert.equal(row.name,c.name);assert.equal(row.abilities[0].id,'swing');assert.equal(row.abilities[0].crit,1);
 assert.equal(g.stats.damage,0);assert.equal(g.arenaStats.hits,0);
 assert.equal(combat(g,c)[0].ability,'swing');assert.equal(combat(g,c)[0].crit,true);
 assert.equal(redesignPose(c.view),'anticipation');
 assert.ok(g.fx.some(e=>e.kind==='attack'&&e.companion===c.id&&e.ranged===false));
 g.time=3;finishMeterCombat(g);g.dismissCompanion(c.id);
 assert.equal(meterReport(g).actors[0].name,c.name);assert.equal(meterReport(g,'overall').total,5);
});

test('player and two companions with the same appearance keep distinct rows and do not double-count',()=>{
 const {g,e}=fixture(['merc-hopfen-horst','merc-pils-peter']);g.companions[1].cooldowns.taunt=100;
 g.damage(e,100,'Kelle');tickCompanions(g,.01);
 const report=meterReport(g);assert.equal(report.actors.length,3);
 assert.equal(report.total,10000-e.hp);assert.equal(report.actors.find(a=>a.id===g.member.id).amount,g.stats.damage);
 for(const c of g.companions)assert.equal(report.actors.find(a=>a.id===c.id).abilities[0].hits,1);
});

test('ranged attack and received damage propagate animation and separate text with the companion theme',()=>{
 const {g,e,c}=fixture(['merc-radler-rita']);tickCompanions(g,.01);
 assert.equal(redesignPose(c.view),'ranged-aim');assert.equal(c.view.usingRanged,true);
 assert.ok(g.fx.some(e=>e.kind==='attack'&&e.classId==='kevin'&&e.companion===c.id&&e.ranged));
 e.autoTimer=0;e.attackTimer=99;e.cast=null;tickEnemyOnCompanion(g,e,c,.01);tickCompanions(g,.01);
 assert.equal(redesignPose(c.view),'hit');assert.ok(combat(g,c).some(e=>e.area==='in'&&e.kind==='damage'&&e.value>0));
 tickCompanions(g,.4);assert.equal(c.view.attack,0);assert.equal(c.view.hurt,0);
});

test('healing player or companion credits the healer, including overheal and cast animation',()=>{
 for(const targetCompanion of [false,true]){
  const {g,c}=fixture(['merc-schorle-susi','merc-pils-peter']);
  const target=targetCompanion?g.companions[1]:g.player;target.maxHp=100;target.hp=77;
  g.companions[1].cooldowns.taunt=100;tickCompanions(g,.01);
  const report=meterReport(g,'current','healing');assert.equal(report.total,23);assert.ok(report.excess>0);
  assert.equal(report.actors.length,1);assert.equal(report.actors[0].id,c.id);assert.equal(report.actors[0].abilities[0].id,'round');
  assert.equal(redesignPose(c.view),'cast');assert.ok(combat(g,c).some(e=>e.kind==='heal'&&e.value===23));
 }
});

test('out-of-combat healing stays out of the meter; disabled SCT retains world text and damage values',()=>{
 const {g,c}=fixture(['merc-schorle-susi']);g.enemies=[];g.target=null;g.player.inCombat=0;g.player.hp=1;tickCompanions(g,.01);
 assert.ok(combat(g,c).some(e=>e.kind==='heal'));assert.equal(meterReport(g,'overall','healing').total,0);assert.equal(g.meter.current,null);
 const a=fixture(),b=fixture();b.g.settings.sct=false;tickCompanions(a.g,.01);tickCompanions(b.g,.01);
 assert.equal(a.e.hp,b.e.hp);assert.equal(meterReport(a.g).total,meterReport(b.g).total);
 assert.ok(b.g.texts.some(t=>/^\d+/.test(t.text)));assert.ok(!a.g.texts.some(t=>/^\d+/.test(t.text)));
});
