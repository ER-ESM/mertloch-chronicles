import test from 'node:test';
import assert from 'node:assert/strict';
let serial=0;
async function fixture(run){
 const descriptors=new Map(),requests=[],loads=[],pending=[];
 const cat={assets:{},gear:{}};
 for(const actor of ['dieter','kevin'])for(const state of ['poses','walk']){
  const id=actor+'-'+state;cat.assets[id]={path:id+'.png'};
  for(const asset of ['hat','boots']){const id=actor+'-gear-'+asset+'-'+state;cat.gear[id]={path:id+'.png'};}
 }
 const control={manual:false,failCatalog:false,failImages:false};
 const replacements={fetch:async url=>{requests.push(url);return{ok:!control.failCatalog,json:async()=>cat};},Image:class{set src(src){loads.push(src);const finish=()=>control.failImages?this.onerror():this.onload();if(control.manual)pending.push(finish);else queueMicrotask(finish);}}};
 for(const [key,value] of Object.entries(replacements)){descriptors.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});}
 try{await run({...await import('../prerender-art.js?test='+ ++serial),requests,loads,pending,control});}
 finally{for(const [key,descriptor] of descriptors){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
}
const turn=()=>new Promise(r=>setImmediate(r));
test('preview import does no IO; loading selects actor and unique equipped assets only',()=>fixture(async({loadPrerenderArt,prerenderArt,requests,loads})=>{
 assert.equal(requests.length,0);assert.equal(loads.length,0);
 assert.equal(await loadPrerenderArt('dieter',[{asset:'hat'},{asset:'hat'}]),true);
 assert.equal(requests.length,1);assert.equal(loads.length,4);assert.equal(prerenderArt.images.size,4);assert.ok(loads.every(p=>p.includes('dieter')&&!p.includes('boots')));
 await loadPrerenderArt('dieter',[{asset:'hat'}]);assert.equal(loads.length,4);
 await loadPrerenderArt('kevin');assert.equal(prerenderArt.images.size,2);assert.ok([...prerenderArt.images.keys()].every(p=>p.startsWith('kevin')));
}));
test('disabling releases images and in-flight requests cannot repopulate them',()=>fixture(async({loadPrerenderArt,releasePrerenderArt,prerenderArt,control,pending})=>{
 control.manual=true;const request=loadPrerenderArt('dieter');await turn();releasePrerenderArt();pending.splice(0).forEach(fn=>fn());
 assert.equal(await request,false);assert.equal(prerenderArt.images.size,0);assert.equal(prerenderArt.ready,false);
}));
test('latest actor wins a race, old actor textures are discarded',()=>fixture(async({loadPrerenderArt,prerenderArt,control,pending})=>{
 control.manual=true;const a=loadPrerenderArt('dieter');await turn();const b=loadPrerenderArt('kevin');await turn();pending.splice(0).reverse().forEach(fn=>fn());
 assert.equal(await a,false);assert.equal(await b,true);assert.deepEqual([...prerenderArt.images.keys()].sort(),['kevin-poses','kevin-walk']);
}));
test('catalog and image failures can retry; missing sheets keep original renderer available',()=>fixture(async({loadPrerenderArt,prerenderArt,control})=>{
 control.failCatalog=true;assert.equal(await loadPrerenderArt('dieter'),false);
 control.failCatalog=false;control.failImages=true;assert.equal(await loadPrerenderArt('dieter'),false);
 control.failImages=false;assert.equal(await loadPrerenderArt('dieter'),true);
 assert.equal(await loadPrerenderArt('missing'),false);assert.equal(prerenderArt.ready,false);
}));
