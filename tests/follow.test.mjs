import test from 'node:test';
import assert from 'node:assert/strict';
import {createFollow} from '../follow.js';

function fake(){const g={player:{x:0,y:0},others:[{name:'Moni',x:300,y:0}],keys:new Set(),floor:0,moveTo:null,path:[],routeGoal:null,nav:[],navigate(pt){this.nav.push(pt);this.routeGoal={...pt};this.moveTo=pt;return true;}};return g;}

test('Folgen: plant bei Abstand neu, hält in der Nähe, gedrosselt',()=>{
 const g=fake(),said=[],f=createFollow({game:()=>g,toast:t=>said.push(t)});
 assert.equal(f.start('Fremd'),false);assert.equal(f.start('Moni'),true);f.tick(0);assert.deepEqual(g.nav,[{x:300,y:0}]);
 f.tick(100);assert.equal(g.nav.length,1,'gedrosselt');g.player.x=270;f.tick(1000);assert.equal(g.moveTo,null,'nah genug: anhalten');
});

test('Folgen endet bei eigener Bewegung, eigenem Klick-Lauf und wenn der Mitspieler außer Sicht ist',()=>{
 let g=fake(),said=[],f=createFollow({game:()=>g,toast:t=>said.push(t)});f.start('Moni');f.tick(0);g.keys.add('w');f.tick(1000);assert.equal(f.target,null);
 g=fake();f=createFollow({game:()=>g});f.start('Moni');f.tick(0);g.routeGoal={x:-500,y:0};f.tick(1000);assert.equal(f.target,null,'Klick woandershin');
 g=fake();f=createFollow({game:()=>g,toast:t=>said.push(t)});f.start('Moni');g.others=[];f.tick(0);assert.equal(f.target,null);assert.match(said.at(-1),/außer Sicht/);
});
