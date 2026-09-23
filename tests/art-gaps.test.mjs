import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PROP_KINDS} from '../world-prop-kinds.js';
import {campProps,baseProps,propDrawRect as chapterPropRect} from '../world-prop-ui.js';
const chapterSceneProps=(world,buildings)=>[...campProps(world),...baseProps(world,buildings)];
import {contentArt,contentActor,contentFrame} from '../content-art.js';
import {decodePng} from '../tools/sprite-pipeline/png.mjs';
const root=new URL('../',import.meta.url);
const catalog=JSON.parse(readFileSync(new URL('assets/content-art/handoff-catalog.json',root)));

test('all chapter prop types have matching generated sprites and ground anchors',()=>{
 const active=JSON.parse(readFileSync(new URL('assets/precision/runtime/catalog.json',root)));
 for(const [id,p] of Object.entries(PROP_KINDS)){
  const a=active.assets['prop-'+id];assert.ok(a,id);
  assert.deepEqual(a.worldProp,{id,w:p.w,h:p.h,height:p.height});
  const r=chapterPropRect({...p,kind:id,x:100,y:200});
  assert.equal(r.w,p.w);assert.equal(r.y+r.h,200+p.h/2);assert.equal(r.depth,200+p.h/2);
 }
});
test('scene uses one current building stage without mutating world placements',()=>{
 const a={kind:'bude-truemmer',stage:0},b={kind:'bude-tresen',stage:1},c={kind:'bus',blocking:true};
 const w={camps:[{props:[c]}],places:{kiosk:{props:[{kind:'kiosk'}]}},base:{stageProps:{tresen:{stages:[a,b]}}}};
 const before=JSON.stringify(w);
 assert.deepEqual(chapterSceneProps(w).map(x=>x.kind),['bus','kiosk','bude-truemmer']);
 assert.deepEqual(chapterSceneProps(w,{tresen:1}).map(x=>x.kind),['bus','kiosk','bude-tresen']);
 assert.equal(JSON.stringify(w),before);assert.equal(chapterSceneProps(w)[0],c);
});
test('Anni and each missing enemy use their own complete directional walk sheet',()=>{
 contentArt.catalog=catalog;
 for(const id of Object.keys(catalog.assets))contentArt.images.set(id,{id});
 for(const id of ['hero-anni','baerbel','enemy-warden','enemy-badger','enemy-goose','enemy-boar']){
  const a=contentActor(id);assert.ok(a?.walk,id);assert.equal(a.walk.meta.frames.length,32);
  for(let row=0;row<4;row++)for(let step=0;step<8;step++){
   const f=contentFrame(a,row,{moving:true,walkDistance:(step+.1)*a.stride/8});
   assert.equal(f.image,a.walk.image);assert.equal(f.frame,a.walk.meta.frames[row*8+step]);
  }
 }
 contentArt.catalog=null;contentArt.images.clear();
});
test('Pit portrait patch preserves all original portraits and occupies slot 15',()=>{
 const p=catalog.portraitPatch;
 const old=decodePng(readFileSync(new URL(p.source,root))),now=decodePng(readFileSync(new URL(p.path,root)));
 assert.equal(now.width,old.width);assert.equal(now.height,now.width/4*5);
 assert.deepEqual(now.data.subarray(0,old.data.length),old.data);
 const cell=now.width/4,colors=new Set();
 for(let y=cell*3;y<cell*4;y++)for(let x=cell*3;x<cell*4;x++)colors.add(now.data.subarray((y*now.width+x)*4,(y*now.width+x)*4+4).join(','));
 assert.ok(colors.size>10);assert.equal(catalog.assets['portrait-pit'].source,catalog.assets.pit.source);
 assert.ok(catalog.assets['ui-tab-bude']);
});
