import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {WORLD_SCALE,BUILDING_OPENINGS,buildingSkin,buildingSpriteLayout} from '../world-scale.js';
import {buildingVisualBounds,buildingOccludesActor} from '../tiny-architecture.js';
import {maifeld} from '../maifeld-art.js';

// Alpha crops of the shipped atlas; openings are measured within the original PNG.
const crops={cottage:{x:39,y:74,w:438,h:387},tavern:{x:533,y:74,w:453,h:388},thatch:{x:1065,y:86,w:435,h:377},church:{x:42,y:483,w:433,h:475},barn:{x:529,y:662,w:474,h:288},shop:{x:1066,y:563,w:446,h:404}};
const building=(id,w)=>({id,church:id===5,minX:100,maxX:100+w,maxY:500,w,door:{x:100+w*.64,y:512}});
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} ≠ ${b}`);

test('every building skin retains a human-sized opening at minimum and maximum footprint',()=>{
 for(let id=0;id<6;id++)for(const w of [84,120,170,172]){
  const b=building(id,w),name=buildingSkin(b),a=crops[name],l=buildingSpriteLayout(b,a),o=BUILDING_OPENINGS[name];
  const target=name==='church'?42:name==='barn'?46:35;
  near(l.door.h,target);assert.ok(l.door.h>=WORLD_SCALE.adult*1.3);assert.ok(l.door.w>12);
  // Verify the actual source doorway maps to the navigable entry, including its sill.
  const x=l.world[1]+(o.x+o.w/2-l.source[1])*l.scale;
  const y=l.top+(o.y+o.h-a.y)*l.scale;
  near(x,b.door.x);near(y,b.maxY);near(b.door.y-y,12);
  for(let i=0;i<3;i++){assert.ok(l.source[i+1]>l.source[i]);assert.ok(l.world[i+1]>l.world[i]);}
  near(l.bounds.minX,b.minX-12);near(l.bounds.maxX,b.maxX+12);
  assert.ok(l.height>WORLD_SCALE.adult*3);
 }
});

test('occlusion bounds follow the registered sprite instead of the old footprint scaling',()=>{
 Object.assign(maifeld,crops);
 try{for(let id=0;id<6;id++)for(const w of [84,170]){const b=building(id,w),l=buildingSpriteLayout(b,crops[buildingSkin(b)]);assert.deepEqual(buildingVisualBounds(b),l.bounds);}}
 finally{for(const name of Object.keys(crops))delete maifeld[name];}
});

test('all generated Mertloch doors retain their scale and their reachable approach after dressing',()=>{
 const w=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')));
 assert.equal(w.rules.heroHeight,WORLD_SCALE.adult);assert.equal(w.rules.house.doorHeight,WORLD_SCALE.door);
 for(const b of w.buildings){const l=buildingSpriteLayout(b,crops[buildingSkin(b)]);assert.ok(l.door.h>=35);assert.ok(l.world.every(Number.isFinite));assert.equal(w.blocked(b.door.x,b.door.y,9),false);}
 assert.ok(w.report.doorRoutes.every(r=>r.reachable));assert.equal(w.report.accessibleDoors,w.buildings.length);
 for(const site of [...w.hubs,...w.camps])for(const p of site.dressing)if(p.type!=='lantern')assert.equal(p.height,WORLD_SCALE[p.type]);
});
test('houses stay opaque at their doorstep and fade only behind the facade baseline',()=>{
 Object.assign(maifeld,crops);
 try{for(let id=0;id<6;id++){
  const b=building(id,120),x=b.door.x,l=buildingSpriteLayout(b,crops[buildingSkin(b)]);
  assert.equal(buildingOccludesActor(b,{x,y:b.maxY+5}),false);
  assert.equal(buildingOccludesActor(b,{x,y:b.maxY-5}),true);
  assert.equal(buildingOccludesActor(b,{x,y:l.top-1}),false);
 }}finally{for(const name of Object.keys(crops))delete maifeld[name];}
});
