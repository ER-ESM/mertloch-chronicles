import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildClassVisuals} from '../tools/class-visuals/build.mjs';
import {decodePng} from '../tools/sprite-pipeline/png.mjs';
import {PRECISION_PALETTE} from '../art-quality.js';
import {CLASS_VISUAL_BINDINGS} from '../tools/class-visuals/contract.mjs';
import {drawClassLink,drawClassEffect,drawClassObject} from '../tools/class-visuals/art.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const hash=b=>createHash('sha256').update(b).digest('hex');
const cat=JSON.parse(read('assets/class-visuals/runtime/catalog.json'));

test('class art rebuild is byte identical and source provenance is intact',()=>{
 for(const [path,bytes] of buildClassVisuals())assert.deepEqual(bytes,read(path),path);
 const generation=JSON.parse(read('assets/class-visuals/generation.json'));
 for(const s of cat.sources){assert.equal(hash(read(s.path)),s.sha256);const job=generation.jobs.find(j=>j.source===s.path);assert.equal(job.sha256,s.sha256);assert.ok(job.prompt&&job.original);}
});

test('56 authored exports have distinct states, transparent margins and the shared palette',()=>{
 const groups=[...Object.values(cat.objects).map(e=>({cell:e.cell,frames:Object.values(e.states)})),...Object.values(cat.effects)];
 assert.equal(groups.reduce((n,e)=>n+e.frames.length,0),44);
 assert.equal(Object.keys(cat.icons).length,12);
 for(const e of groups){assert.equal(new Set(e.frames.map(f=>f.sha256)).size,e.frames.length);for(const f of e.frames){const b=f.bounds;assert.ok(b.w>0&&b.h>0&&b.x>=2&&b.y>=2&&b.x+b.w<=e.cell-2&&b.y+b.h<=e.cell-2);}}
 const palette=new Set(PRECISION_PALETTE.map(p=>p.join(',')));
 for(const [path,meta] of Object.entries(cat.atlases)){const bytes=read(path);assert.equal(hash(bytes),meta.sha256);const im=decodePng(bytes);for(let i=0;i<im.data.length;i+=4){assert.ok(im.data[i+3]===0||im.data[i+3]===255);if(im.data[i+3])assert.ok(palette.has(Array.from(im.data.subarray(i,i+3)).join(',')));}}
});

test('every proposed specialization binding resolves to an authored asset',()=>{
 assert.equal(Object.keys(CLASS_VISUAL_BINDINGS).length,10);
 for(const binding of Object.values(CLASS_VISUAL_BINDINGS))for(const kind of ['icons','effects','objects'])for(const id of binding[kind]||[])assert.ok(cat[kind][id],kind+':'+id);
});

test('lightning anchors land at both authoritative endpoints through every frame',()=>{
 const art={catalog:cat,images:{}},from={x:7,y:-4},to={x:-26,y:38};
 for(let i=0;i<4;i++){
  const calls={},c={globalAlpha:1,save(){},restore(){},translate(x,y){calls.origin={x,y};},rotate(v){calls.angle=v;},scale(x,y){calls.scale={x,y};},drawImage(...args){calls.draw=args;}};
  drawClassLink(c,art,from,to,(i+.5)/4);
  const f=cat.effects['chain-link'].frames[i];
  for(const [anchor,target] of [[f.anchors.from,from],[f.anchors.to,to]]){
   const x=(anchor.x+calls.draw[5])*calls.scale.x,y=(anchor.y+calls.draw[6])*calls.scale.y;
   const actual={x:calls.origin.x+x*Math.cos(calls.angle)-y*Math.sin(calls.angle),y:calls.origin.y+x*Math.sin(calls.angle)+y*Math.cos(calls.angle)};
   assert.ok(Math.abs(actual.x-target.x)<1e-9&&Math.abs(actual.y-target.y)<1e-9);
  }
 }
});

test('effects do not paint before their event or after expiry and invalid states fail explicitly',()=>{
 const art={catalog:cat,images:{}},c={save(){throw Error('Unexpected draw');}};
 for(const t of [-1,1,2]){drawClassEffect(c,art,'mold-spread',0,0,t);drawClassLink(c,art,{x:0,y:0},{x:10,y:10},t);}
 assert.throws(()=>drawClassObject(c,art,'gisela-nest','walk',0,0),/Unbekannter Objektzustand/);
});
