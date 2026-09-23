import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Game} from '../engine.js';
import {World,distance} from '../world.js';
import {makeEnemy} from '../encounters.js';
import {tickCasting,tickAuto} from '../auto-combat.js';
import {bindSkill} from '../rpg.js';
import {changeSpec} from '../talents.js';
import {readProgress,writeProgress,previousSaveKey} from '../save-store.js';


const arena=()=>({id:'basis',width:1000,height:1000,spawn:{x:100,y:100},npc:{x:100,y:80},quests:[],camps:[],landmarks:[],blocked:()=>false,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[{...b}]});
const storage=()=>{const entries=new Map();return{getItem:k=>entries.get(k)||null,setItem:(k,v)=>entries.set(k,v),entries};};
function fight(classId='kevin'){const g=new Game(arena(),{classId,level:11}),e=makeEnemy({x:130,y:100},1,{hp:10000,behavior:'neutral',roamWait:100});g.enemies=[e];g.target=e;g.random=()=>.99;return{g,e};}

test('saved equipment, progression, talents and action bars survive storage and JSON reload',()=>{
 const {g}=fight();changeSpec(g,'kevin-iron');g.rpg.coins=173;g.player.x=244;bindSkill(g,'strike',0);bindSkill(g,'auto',1);bindSkill(g,null,2);g.settings.autoLoot=false;
 const db=storage();writeProgress(db,'test',g.save());const h=new Game(arena(),readProgress(db,'test').save);
 assert.equal(h.rpg.coins,173);assert.equal(h.player.x,244);assert.equal(h.member.id,'kevin');assert.equal(h.settings.autoLoot,false);assert.deepEqual(h.rpg.actionBars,g.rpg.actionBars);
 assert.equal(h.player.level,g.player.level);assert.equal(h.trainingXp,g.trainingXp);assert.deepEqual(h.rpg.equipment,g.rpg.equipment);assert.deepEqual(h.rpg.inventory,g.rpg.inventory);assert.deepEqual(h.rpg.talents,g.rpg.talents);
});
test('a damaged save recovers the previous readable save and failed writes preserve progress',()=>{
 const db=storage(),a={version:1,level:5},b={version:1,level:6};writeProgress(db,'test',a);writeProgress(db,'test',b);
 assert.deepEqual(JSON.parse(db.getItem(previousSaveKey('test'))),a);db.setItem('test','{broken');const recovered=readProgress(db,'test');assert.equal(recovered.recovered,true);assert.deepEqual(recovered.save,a);
 writeProgress(db,'test',b);const set=db.setItem;db.setItem=(k,v)=>{if(k==='test')throw Error('QuotaExceededError');set(k,v);};assert.throws(()=>writeProgress(db,'test',{version:1,level:7}));assert.deepEqual(readProgress(db,'test').save,b);
});
test('unreadable and future saves block autosave instead of being silently replaced; legacy saves still load',()=>{
 const db=storage();for(const save of ['{oops',JSON.stringify({version:1,seenSkills:{}}),JSON.stringify({version:1,rpg:{loot:[null]}}),JSON.stringify({version:2,level:20})]){db.setItem('test',save);assert.equal(readProgress(db,'test').blocked,true);assert.equal(db.getItem('test'),save);}
 db.entries.delete('test');db.setItem('legacy',JSON.stringify({version:1,level:4}));assert.equal(readProgress(db,'test',['legacy']).save.level,4);
 assert.ok(readProgress({getItem(){throw Error('SecurityError');}},'test').notice);
});
test('invalid, paused and dead movement requests leave the current path untouched; valid movement cancels a cast',()=>{
 const {g}=fight();g.navigate({x:180,y:100});const original=g.routeGoal;
 for(const point of [null,{}, {x:NaN,y:0},{x:2,y:Infinity}]){assert.equal(g.navigate(point),false);assert.equal(g.routeGoal,original);}
 g.paused=true;assert.equal(g.navigate({x:200,y:200}),false);g.paused=false;g.dead=true;assert.equal(g.navigate({x:200,y:200}),false);g.dead=false;
 g.casting={id:'burst'};assert.equal(g.navigate({x:200,y:200}),true);assert.equal(g.casting,null);
});
test('Schrottkoloss builds pressure and guard against ranged enemies from the spec gate on',()=>{
 const g=new Game(arena(),{classId:'kevin',level:5});assert.ok(changeSpec(g,'kevin-iron'));const e=makeEnemy({x:280,y:100},1,{hp:10000});g.enemies=[e];g.target=e;g.random=()=>.99;
 assert.equal(g.skills.find(s=>s.id==='strike').weaponSource,'ranged');assert.ok(g.action('strike'));assert.ok(e.hp<e.maxHp);assert.equal('runes' in g.player,false);assert.ok(g.classState.guard>0);
 const hp=e.hp;tickAuto(g,1);assert.equal(e.hp,hp,'melee autos do not hit at range');
});
test('finishing a cast on the previous target cannot start an attack on a newly selected neutral enemy',()=>{
 const {g,e}=fight(),neutral=makeEnemy({x:145,y:100},2,{hp:10000,behavior:'neutral'});g.enemies.push(neutral);assert.ok(g.action('burst'));g.target=neutral;
 tickCasting(g,2);assert.ok(e.hp<e.maxHp);assert.equal(g.target,neutral);assert.equal(g.autoAttack.enabled,false);tickAuto(g,2);assert.equal(neutral.hp,neutral.maxHp);
});
test('casts recheck range, sight and retreat without spending resources or cooldown',()=>{
 for(const invalidate of [(g,e)=>{e.x=900;},(g)=>{g.world.lineClear=()=>false;},(g,e)=>{e.ai='returning';},(g,e)=>{e.hp=0;}]){
  const {g,e}=fight();const energy=g.player.energy;assert.ok(g.action('burst'));invalidate(g,e);tickCasting(g,2);assert.equal(g.player.energy,energy);assert.equal(g.cooldowns.burst,0);assert.equal(g.casting,null);
 }
});
test('mouse selection skips returning and arriving targets just like cycling targets',()=>{
 const {g,e}=fight();for(const state of [{ai:'returning',spawnGrace:0},{ai:'idle',spawnGrace:2}]){Object.assign(e,state);g.target=null;assert.equal(g.selectAt(e.x,e.y-10),false);assert.equal(g.target,null);}
});
