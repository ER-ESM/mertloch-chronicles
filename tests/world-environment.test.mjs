import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {estateFootprint,estatePlacementReason} from '../world-details.js';
const map=JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8'));
test('wide estate decorations respect their complete footprint across world seeds',()=>{
 for(const seed of [56753,42,2026]){
  const w=new World(map,{seed});assert.ok(w.details.length>50);assert.ok(w.report.valid);
  for(const p of w.details){assert.equal(estatePlacementReason(w,p),null);const f=estateFootprint(p);assert.ok(f.maxX-f.minX>=30);}
  for(let i=0;i<w.details.length;i++)for(let j=i+1;j<w.details.length;j++){
   const a=estateFootprint(w.details[i]),b=estateFootprint(w.details[j]);
   assert.equal(a.minX<b.maxX&&a.maxX>b.minX&&a.minY<b.maxY&&a.maxY>b.minY,false);
  }
 }
});
test('a clear object anchor does not allow a crate edge to protrude into a road',()=>{
 const w={areas:[],water:[],buildings:[],props:[],gardens:[],blocked:()=>false,reserved:()=>false,areaAt:()=>null,onRoad:x=>x>=15};
 assert.equal(w.onRoad(0),false);
 assert.equal(estatePlacementReason(w,{x:0,y:0,kind:0}),'road');
});
