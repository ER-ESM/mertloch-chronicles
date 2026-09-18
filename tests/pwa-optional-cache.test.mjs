import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';
const manifest=JSON.parse(readFileSync(new URL('../precache-manifest.js',import.meta.url),'utf8').match(/self.PRECACHE=(.*);/s)[1]);
test('preview sheets are optional and integrity-pinned, never eagerly installed',()=>{
 assert.ok(Object.keys(manifest.optional).length>200);
 assert.equal(manifest.urls.some(p=>p.startsWith('assets/prerender/')),false);
 for(const [path,integrity] of Object.entries(manifest.optional))assert.equal(integrity,'sha256-'+createHash('sha256').update(readFileSync(new URL('../'+path,import.meta.url))).digest('base64'));
});
function fixture(){
 const events={},stored=new Map(),requests=[],installed=[],control={quota:false,networkFailure:false};
 const cache={match:async k=>stored.get(k)?.clone(),addAll:async urls=>installed.push(...urls),put:async(k,v)=>{if(control.quota)throw Error('quota');stored.set(k,v);}};
 const self={PRECACHE:{version:'test',urls:['index.html'],optional:{'preview.png':'sha256-test'}},location:{href:'https://game.test/prefix/sw.js'},addEventListener:(name,handler)=>events[name]=handler};
 runInNewContext(readFileSync(new URL('../sw.js',import.meta.url),'utf8'),{self,URL,Request,importScripts(){},caches:{open:async()=>cache},fetch:async req=>{requests.push(req);if(control.networkFailure)throw Error('integrity or offline');return new Response('image');}});
 return{control,requests,installed,stored,async install(){let work;events.install({waitUntil:p=>work=p});await work;},async get(path='preview.png'){let response,work;events.fetch({request:new Request('https://game.test/prefix/'+path),respondWith:p=>response=p,waitUntil:p=>work=p});try{return await response;}finally{await work;}}};
}
test('optional assets use release integrity on first request and cache hits offline',async()=>{
 const f=fixture();await f.install();assert.equal(f.installed.length,1);assert.equal(f.requests.length,0);
 assert.equal(await(await f.get()).text(),'image');assert.equal(f.requests[0].integrity,'sha256-test');assert.equal(f.requests[0].cache,'no-cache');
 f.control.networkFailure=true;assert.equal(await(await f.get()).text(),'image');assert.equal(f.requests.length,1);
});
test('rejected optional fetches are not cached; quota errors still return the online image',async()=>{
 const f=fixture();f.control.networkFailure=true;await assert.rejects(f.get(),/integrity/);assert.equal(f.stored.size,0);
 f.control.networkFailure=false;f.control.quota=true;assert.equal(await(await f.get()).text(),'image');assert.equal(f.stored.size,0);
});
