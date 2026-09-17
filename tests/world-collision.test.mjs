import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game} from '../engine.js';
import {circleIntersectsBox} from '../world-collision.js';

function fixture(b={minX:100,maxX:180,minY:100,maxY:180}){
  const w=Object.assign(Object.create(World.prototype),{width:1000,height:1000,grid:new Map()});w.addGrid(b);return w;
}
test('feet follow round house corners without entering walls or blocking empty diagonal space',()=>{
  const b={minX:100,maxX:180,minY:100,maxY:180},w=fixture(b);
  assert.equal(w.blocked(96,96,5),false);
  assert.equal(w.blocked(97,97,5),true);
  assert.equal(w.blocked(95,140,5),false);
  assert.equal(w.blocked(95.1,140,5),true);
  assert.equal(w.blocked(140,140,0),true);
  for(let x=94;x<=102;x+=.5)for(let y=94;y<=102;y+=.5){
    const distance=Math.hypot(Math.max(100-x,0),Math.max(100-y,0));
    assert.equal(circleIntersectsBox(x,y,5,b),distance<5);
  }
});
test('actual actor movement cannot tunnel through any house side on a large step',()=>{
  const w=fixture();
  for(const [x,y,dx,dy,axis,limit,sign] of [[80,140,140,0,'x',95,1],[200,140,-140,0,'x',185,-1],[140,80,0,140,'y',95,1],[140,200,0,-140,'y',185,-1]]){
    const p={x,y};Game.prototype.move.call({world:w,player:p},p,dx,dy);
    assert.ok((p[axis]-limit)*sign<=.00001,JSON.stringify(p));assert.equal(w.blocked(p.x,p.y,5),false);
  }
  const p={x:95,y:120};Game.prototype.move.call({world:w,player:p},p,20,30);
  assert.equal(p.x,95);assert.equal(p.y,150,'slides along the wall');
});
test('real Mertloch: every house blocks its four faces and every doorway remains reachable',()=>{
  const w=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')));
  assert.ok(w.buildings.length>400);assert.ok(w.report.valid);
  for(const b of w.buildings){
    for(const [x,y] of [[b.minX+1,b.y],[b.maxX-1,b.y],[b.x,b.minY+1],[b.x,b.maxY-1]])assert.equal(w.blocked(x,y,5),true,`house ${b.id}`);
    assert.equal(w.blocked(b.door.x,b.door.y,9),false,`door ${b.id}`);
  }
  assert.ok(w.report.doorRoutes.every(r=>r.reachable));
});
