import test from 'node:test';
import assert from 'node:assert/strict';
import {distance} from '../world.js';
import {Game} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {ARCHETYPES,ELITES} from '../content/index.js';

const arena=()=>({spawn:{x:0,y:0},npc:{x:10,y:0},landmarks:[],camps:[],findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[{...b}]});
const step=(g,s,fn)=>{for(let i=0;i<Math.ceil(s/.05);i++){fn?.(.05);g.tick(.05);}};

test('Aggro-Reichweiten der Feldgegner liegen zwischen 10 und 14 m, Elite bis 15 m (8 px = 1 m)',()=>{
 for(const [id,a] of Object.entries(ARCHETYPES)){if(a.behavior!=='aggressive'||a.reserve)continue;assert.ok(a.aggroRange>=80&&a.aggroRange<=112,id+' aggro '+a.aggroRange);}
 for(const [id,a] of Object.entries(ELITES)){if(a.reserve)continue;assert.ok(a.aggroRange<=120,id+' Elite-Aggro '+a.aggroRange);assert.ok(a.leash>=560,id+' Elite-Leine '+a.leash);}
});

test('Kiten: ein Gegner folgt dem zurückweichenden Helden mindestens 60 m, bevor er abdreht',()=>{
 const g=new Game(arena()),e=makeEnemy({x:2000,y:1000},1,{behavior:'aggressive',aggroRange:100,speed:51,hp:5000,roamWait:100});
 g.enemies=[e];g.player.x=1910;g.player.y=1000;g.tick(.05);
 assert.equal(e.aggro,true,'Aggro bei 11 m');
 // Held weicht mit 12 m/s nach Westen zurück, Gegner (6 m/s) folgt
 let travelled=0;const back=dt=>{g.player.x-=96*dt;travelled+=96*dt;};
 step(g,5,back);
 assert.equal(e.ai,'combat','nach 60 m Rückzug noch dran');
 assert.ok(distance(e,e.home)>200,'Gegner ist der Leine gefolgt');
 step(g,10,back);
 assert.equal(e.ai,'returning','irgendwann (Leine 70 m ab Heimat oder 78 m Abstand) dreht er ab');
});
