import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {restorePosition} from '../player-save.js';
const arena=()=>({id:'position-world',width:1000,height:1000,spawn:{x:100,y:100},npc:{x:100,y:80},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[{...b}]});
test('Position and facing survive JSON save/reload with class and progression',()=>{
 const w=arena(),g=new Game(w,{classId:'kevin',level:5});Object.assign(g.player,{x:455.125,y:376.5,facing:-1});
 const save=g.save(),next=new Game(w,JSON.parse(JSON.stringify(save)));g.player.x=600;
 assert.deepEqual(save.position,{x:455.125,y:376.5,facing:-1});assert.equal(next.player.x,455.125);assert.equal(next.player.y,376.5);assert.equal(next.player.facing,-1);assert.equal(next.member.id,'kevin');assert.equal(next.player.level,5);assert.equal(next.moveTo,null);assert.equal(next.target,null);
});
test('Legacy, other-world, malformed and out-of-bounds positions use the spawn',()=>{
 const w=arena(),spawn={...w.spawn,facing:1};
 for(const position of [undefined,null,{},'broken',{x:'200',y:300},{x:NaN,y:300},{x:300,y:Infinity},{x:-30,y:100},{x:1001,y:500},{x:500,y:1001}])assert.deepEqual(restorePosition(w,{worldKey:w.id,position}),spawn);
 assert.deepEqual(restorePosition(w,{worldKey:'other',position:{x:400,y:400}}),spawn);
 assert.deepEqual(restorePosition(w,{worldKey:w.id,position:{x:400,y:400,facing:123}}),{x:400,y:400,facing:1});
});
test('World changes relocate blocked positions, failed or invalid relocation returns home',()=>{
 const w=arena(),saved={worldKey:w.id,position:{x:400,y:400,facing:-1}};w.blocked=(x,y,r)=>{assert.equal(r,5);return x===400;};w.findClear=()=>({x:410,y:400});
 assert.deepEqual(restorePosition(w,saved),{x:410,y:400,facing:-1});
 for(const find of [()=>{throw Error('No place');},()=>({x:400,y:400}),()=>({x:2000,y:400}),()=>({x:NaN,y:400})]){w.findClear=find;assert.deepEqual(restorePosition(w,saved),{...w.spawn,facing:1});}
});
test('Death cannot reload alive at the death site; reset and respawn stay at home',()=>{
 const w=arena(),g=new Game(w);Object.assign(g.player,{x:500,y:500});g.dead=true;g.player.hp=0;
 const next=new Game(w,g.save());assert.equal(next.player.x,w.spawn.x);assert.equal(next.player.y,w.spawn.y);
 g.respawn();assert.deepEqual(g.save().position,{...w.spawn,facing:1});assert.deepEqual(new Game(w,{}).save().position,{...w.spawn,facing:1});
});
