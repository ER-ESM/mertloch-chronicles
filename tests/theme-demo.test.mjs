import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {decodePng} from '../tools/sprite-pipeline/png.mjs';
import {buildThemeDemo} from '../tools/prerender/build-theme-demo.mjs';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root));
const catalog=JSON.parse(read('assets/theme-demo/runtime/catalog.json'));
test('three authored themes have four real views and documented source prompts',()=>{
 assert.equal(Object.keys(catalog.assets).length,3);assert.equal(catalog.animated,false);assert.equal(catalog.modularGear,false);
 for(const a of Object.values(catalog.assets)){
  assert.equal(a.frames.length,4);assert.equal(a.detailPaths.length,4);assert.equal(a.gear.length,3);
  assert.equal(createHash('sha256').update(read(a.source)).digest('hex'),a.sourceHash);
  assert.ok(read(a.source.replace('.png','.prompt.txt')).length>1000);
  assert.equal(new Set(a.detailPaths.map(p=>createHash('sha256').update(read(p)).digest('hex'))).size,4);
 }
});
test('native sprites keep hard alpha, margins and one scale for each full turnaround',()=>{
 assert.equal(catalog.nativeHeight/catalog.worldHeight,4);
 for(const a of Object.values(catalog.assets)){
  const im=decodePng(read(a.path));assert.equal(im.width,768);assert.equal(im.height,192);
  for(let i=3;i<im.data.length;i+=4)assert.ok(im.data[i]===0||im.data[i]===255);
  assert.equal(a.frames[0].bounds.h,104);
  // Fine isolated hair pixels can disappear at the binary-alpha sampling threshold.
  for(const f of a.frames){assert.ok(f.bounds.count>1000);assert.ok(f.bounds.x>=2&&f.bounds.y>=2);assert.ok(f.bounds.x+f.bounds.w<=190&&f.bounds.y+f.bounds.h<=190);assert.ok(Math.abs(f.bounds.h-f.sourceBounds.h*a.scale)<3);}
 }
});
test('theme exports reproduce byte-for-byte from the saved originals',()=>{
 for(const [path,bytes] of buildThemeDemo().files)assert.deepEqual(bytes,read(path),path);
});
