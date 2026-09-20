import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LIGHT} from '../light-convention.js';
import {CAMERA,LIGHTS,SHADOW,FRAME,shadowScreenOffset,lightVector} from '../tools/prerender/stage.js';
const catalog=JSON.parse(readFileSync(new URL('../assets/prerender/runtime/catalog.json',import.meta.url)));

test('light convention is fixed and the 3D sun reproduces the screen shadow direction in the fixed camera',()=>{
 assert.deepEqual(LIGHT.dir,{x:.8,y:.35});assert.deepEqual(LIGHT.shadow,{color:'#1c2a22',alpha:.42,squash:.38});assert.ok(Object.isFrozen(LIGHT));
 assert.equal(LIGHT.sun.cameraPitchDeg,CAMERA.pitchDeg);assert.equal(CAMERA.type,'orthographic');assert.equal(CAMERA.pixelsPerUnit,FRAME.ppu);
 const o=shadowScreenOffset(),n=Math.hypot(o.x,o.y),d=Math.hypot(LIGHT.dir.x,LIGHT.dir.y);
 assert.ok(Math.abs(o.x/n-LIGHT.dir.x/d)<1e-3&&Math.abs(o.y/n-LIGHT.dir.y/d)<1e-3,JSON.stringify(o));
 assert.ok(Math.abs(Math.sin(CAMERA.pitchDeg*Math.PI/180)-LIGHT.shadow.squash)<.01,'ground foreshortening matches the shadow squash');
 assert.ok(lightVector(LIGHTS.key).y>0&&LIGHTS.key.castShadow&&!LIGHTS.fill.castShadow);
 assert.equal(SHADOW.color,LIGHT.shadow.color);assert.equal(SHADOW.maxAlpha,LIGHT.shadow.alpha);assert.ok(SHADOW.maxAlpha*255<128,'baked shadow must stay below the bounds threshold');
});
test('render page and build carry no camera or light numbers of their own',()=>{
 const html=readFileSync(new URL('../tools/prerender/render.html',import.meta.url),'utf8');
 assert.ok(html.includes("from './stage.js'"));assert.equal((html.match(/new THREE\.DirectionalLight/g)||[]).length,1,'lights are created from LIGHTS only');
 assert.ok(!/PITCH=\d/.test(html)&&!/position\.set\(-30,50,40\)/.test(html));
});
test('catalog marks every hero sheet as shadowBaked and records the stage',()=>{
 for(const [id,a] of Object.entries(catalog.assets)){assert.equal(a.shadowBaked,true,id);assert.deepEqual(a.pivot,FRAME.pivot,id);assert.equal(a.frameSize,FRAME.size,id);}
 assert.equal(catalog.stage.camera.pitchDeg,CAMERA.pitchDeg);assert.deepEqual(catalog.stage.light.dir,LIGHT.dir);
});
test('prerenderHasBakedShadow follows catalog flag, aliases and load state',async()=>{
 const saved={fetch:Object.getOwnPropertyDescriptor(globalThis,'fetch'),Image:Object.getOwnPropertyDescriptor(globalThis,'Image')};
 const cat={aliases:{'hero-dieter':'dieter-poses'},gear:{},assets:{'dieter-poses':{path:'a.png',shadowBaked:true},'dieter-walk':{path:'b.png',shadowBaked:true},'kevin-poses':{path:'c.png'},'kevin-walk':{path:'d.png'}}};
 Object.defineProperty(globalThis,'fetch',{value:async()=>({ok:true,json:async()=>cat}),configurable:true,writable:true});
 Object.defineProperty(globalThis,'Image',{value:class{set src(_){queueMicrotask(()=>this.onload());}},configurable:true,writable:true});
 try{
  const {loadPrerenderArt,releasePrerenderArt,prerenderHasBakedShadow}=await import('../prerender-art.js?light');
  assert.equal(prerenderHasBakedShadow('dieter'),false,'nothing loaded');
  await loadPrerenderArt('dieter');
  for(const id of ['dieter','hero-dieter','dieter-poses','dieter-walk'])assert.equal(prerenderHasBakedShadow(id),true,id);
  assert.equal(prerenderHasBakedShadow('kevin'),false);assert.equal(prerenderHasBakedShadow(undefined),false);
  await loadPrerenderArt('kevin');assert.equal(prerenderHasBakedShadow('kevin'),false,'flag missing');assert.equal(prerenderHasBakedShadow('dieter'),false,'not the active actor');
  releasePrerenderArt();assert.equal(prerenderHasBakedShadow('kevin'),false);
 }finally{for(const [k,d] of Object.entries(saved)){if(d)Object.defineProperty(globalThis,k,d);else delete globalThis[k];}}
});
