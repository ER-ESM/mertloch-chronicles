import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Game} from '../engine.js';
import {World,distance} from '../world.js';
import {mentorSpots} from '../world-layout.js';
import {makeEnemy} from '../encounters.js';
import {tickCasting,tickAuto} from '../auto-combat.js';
import {bindSkill} from '../rpg.js';
import {changeSpec} from '../talents.js';
import {readProgress,writeProgress,previousSaveKey} from '../save-store.js';
import {mountPwa} from '../pwa.js';

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
test('real world mentors use the shared positions and can be addressed without Ida intercepting',()=>{
 const w=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url)))),g=new Game(w,{version:1});
 assert.deepEqual(w.mentors.map(({id,x,y})=>({id,x,y})),mentorSpots(w));
 for(const mentor of w.mentors){Object.assign(g.player,{x:mentor.x,y:mentor.y});assert.ok(distance(g.player,w.npc)>60);assert.equal(g.mentorInteraction()?.id,mentor.id);assert.ok(g.talkToMentor(mentor.id));assert.ok(w.walkClear(w.spawn,mentor,9));}
});
test('invalid, paused and dead movement requests leave the current path untouched; valid movement cancels a cast',()=>{
 const {g}=fight();g.navigate({x:180,y:100});const original=g.routeGoal;
 for(const point of [null,{}, {x:NaN,y:0},{x:2,y:Infinity}]){assert.equal(g.navigate(point),false);assert.equal(g.routeGoal,original);}
 g.paused=true;assert.equal(g.navigate({x:200,y:200}),false);g.paused=false;g.dead=true;assert.equal(g.navigate({x:200,y:200}),false);g.dead=false;
 g.casting={id:'burst'};assert.equal(g.navigate({x:200,y:200}),true);assert.equal(g.casting,null);
});
test('Schrottkoloss builds pressure and guard against ranged enemies from level one',()=>{
 const g=new Game(arena(),{classId:'kevin'});assert.ok(changeSpec(g,'kevin-iron'));const e=makeEnemy({x:280,y:100},1,{hp:10000});g.enemies=[e];g.target=e;g.random=()=>.99;
 assert.equal(g.skills.find(s=>s.id==='strike').weaponSource,'ranged');assert.ok(g.action('strike'));assert.ok(e.hp<e.maxHp);assert.equal(g.player.runes,1);assert.ok(g.classState.guard>0);
 const hp=e.hp;tickAuto(g,1);assert.equal(e.hp,hp,'melee autos do not hit at range');
});
test('finishing a cast on the previous target cannot start an attack on a newly selected neutral enemy',()=>{
 const {g,e}=fight(),neutral=makeEnemy({x:145,y:100},2,{hp:10000,behavior:'neutral'});g.enemies.push(neutral);g.player.runes=3;assert.ok(g.action('burst'));g.target=neutral;
 tickCasting(g,2);assert.ok(e.hp<e.maxHp);assert.equal(g.target,neutral);assert.equal(g.autoAttack.enabled,false);tickAuto(g,2);assert.equal(neutral.hp,neutral.maxHp);
});
test('casts recheck range, sight and retreat without spending resources or cooldown',()=>{
 for(const invalidate of [(g,e)=>{e.x=900;},(g)=>{g.world.lineClear=()=>false;},(g,e)=>{e.ai='returning';},(g,e)=>{e.hp=0;}]){
  const {g,e}=fight();g.player.runes=3;const energy=g.player.energy;assert.ok(g.action('burst'));invalidate(g,e);tickCasting(g,2);assert.equal(g.player.energy,energy);assert.equal(g.cooldowns.burst,0);assert.equal(g.casting,null);
 }
});
test('mouse selection skips returning and arriving targets just like cycling targets',()=>{
 const {g,e}=fight();for(const state of [{ai:'returning',spawnGrace:0},{ai:'idle',spawnGrace:2}]){Object.assign(e,state);g.target=null;assert.equal(g.selectAt(e.x,e.y-10),false);assert.equal(g.target,null);}
});
test('PWA update requires a successful save and activates/reloads only once',async()=>{
 const originals=new Map(),service=new EventTarget(),win=new EventTarget(),doc=new EventTarget();let saved=false,posts=0,reloads=0;const notices=[];
 const reg={waiting:{postMessage(){posts++;}},addEventListener(){},update:async()=>{}};service.register=async()=>reg;service.ready=Promise.resolve();
 const replacements={window:win,document:doc,navigator:{serviceWorker:service,userAgent:'test'},isSecureContext:true,matchMedia:()=>({matches:false}),location:{reload(){reloads++;}},setInterval:()=>0};
 for(const [key,value] of Object.entries(replacements)){originals.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});}
 try{
  const pwa=mountPwa({save:()=>saved,toast:s=>notices.push(s)});await new Promise(resolve=>setImmediate(resolve));assert.equal(pwa.state().update,true);
  assert.equal(pwa.update(),false);assert.equal(posts,0);assert.match(notices.at(-1),/nicht gespeichert/);
  saved=true;assert.equal(pwa.update(),true);assert.equal(pwa.update(),false);assert.equal(posts,1);service.dispatchEvent(new Event('controllerchange'));service.dispatchEvent(new Event('controllerchange'));assert.equal(reloads,1);
 }finally{for(const [key,descriptor] of originals){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
});
