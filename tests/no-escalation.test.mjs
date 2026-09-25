import {RESOURCES} from '../content/index.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {tickCasting} from '../auto-combat.js';
import {skillStatus} from '../combat-ui.js';
import {describeCard} from '../describe-ui.js';
import {PROC_RULES,CLASS_SPECS} from '../content/index.js';
import {TALENTS,learnTalent} from '../talents.js';
import {combatStats} from '../rpg.js';
import {fireProcs} from '../procs.js';
import {talentHelp} from '../mechanic-help.js';
import {learnCoreBuild} from './talent-fixture.mjs';
const world=()=>({id:'no-combo',spawn:{x:0,y:0},npc:{x:0,y:20},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[b]});
function fight(cls,spec=CLASS_SPECS[cls][0]){const g=new Game(world(),{classId:cls,level:30,rpg:{talents:{spec,learned:[]}}});g.random=()=>.5;const e=makeEnemy({x:30,y:0},1,{hp:100000,aggro:true,ai:'combat',attackTimer:100});g.enemies=[e];g.target=e;return{g,e};}
const finish=g=>{if(g.casting)tickCasting(g,g.casting.total);};

test('all nine specializations can cast their special skill immediately with no shared build-up',()=>{
 /* E-71: die drei E-32-Klassen; Schorsch und Käthe haben eigene Prüfungen (tests/class-resources.test.mjs) */
 for(const [cls,specs] of Object.entries(CLASS_SPECS).filter(([c])=>['dieter','baerbel','kevin'].includes(c)))for(const spec of specs){
  const {g,e}=fight(cls,spec),before=e.hp;g.player.energy=70;const bottles=g.res.bottles;
  assert.equal('runes' in g.player,false,spec);assert.equal(skillStatus(g,'burst').usable,true,spec);assert.equal(g.action('burst'),true,spec);finish(g);
  assert.ok(e.hp<before,spec);if(cls==='kevin')assert.equal(g.res.bottles,bottles-RESOURCES.kevin.costs.burst,spec);else if(cls==='baerbel')assert.ok(g.player.energy>=35&&g.player.energy<=35+RESOURCES.baerbel.trend.likes.at(-1),spec);else assert.equal(g.player.energy,35,spec);assert.ok(g.cooldowns.burst>0,spec);assert.equal(g.action('burst'),false,spec);assert.equal('runes' in g.player,false,spec);
  assert.doesNotMatch(describeCard(g,'skill','burst'),/Aufbaupunkt|Glanzpunkt|Druckpunkt|je Punkt|Eskalation|undefined|NaN/);
 }
});
test('legacy point values cannot change damage; early strikes no longer auto-escalate',()=>{
 for(const cls of Object.keys(CLASS_SPECS).filter(c=>['dieter','baerbel','kevin'].includes(c))){
  const damage=legacy=>{const {g,e}=fight(cls);if(legacy!==undefined)g.player.runes=legacy;g.player.energy=70;const hp=e.hp;g.action('burst');finish(g);return hp-e.hp;};
  assert.equal(damage(),damage(0));assert.equal(damage(),damage(3));
  const g=new Game(world(),{classId:cls,level:1}),e=makeEnemy({x:30,y:0},1,{hp:100000,aggro:true,ai:'combat'});g.target=e;g.enemies=[e];g.random=()=>.5;const hits=[];
  for(let i=0;i<4;i++){g.gcd=0;g.cooldowns.strike=0;const hp=e.hp;assert.ok(g.action('strike'));hits.push(hp-e.hp);}
  assert.equal(hits[0],hits[2]);assert.equal('runes' in g.player,false);
 }
});
test('converted talents provide energy and burst procs no longer need a three-point condition',()=>{
 const {g}=fight('baerbel','baerbel-care');learnCoreBuild(g,'baerbel-care');g.player.energy=20;g.player.hp-=100;assert.ok(g.action('heal'));finish(g);/* E-71: dazu kommen Likes für neuen Content */assert.ok(g.player.energy>=30);assert.equal('runes' in g.player,false);
 const {g:k}=fight('kevin');k.res.bottles=2;assert.equal(fireProcs(k,'burst',{'proc:rueckstrom':1}),1);/* E-71: Kevin bekommt Flaschen */assert.ok(k.res.bottles>2);
 for(const r of Object.values(PROC_RULES)){assert.notEqual(r.trigger,'burst3');assert.equal('points' in r.effect,false);}
 for(const rows of Object.values(TALENTS))for(const t of rows){const a=fight(t.spec.split('-')[0],t.spec).g,h=talentHelp(a,t);assert.doesNotMatch(h.effect+' '+h.context.join(' '),/Aufbaupunkt|Glanzpunkt|Druckpunkt|mit (?:3|drei) (?:Pegel|Glanz|Druck)|Eskalation|undefined|NaN/,t.id);}
});
