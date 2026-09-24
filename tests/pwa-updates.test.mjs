import test from 'node:test';
import assert from 'node:assert/strict';
import {mountPwa} from '../pwa.js';

async function scenario(run,{startQuiet=0}={}){
 const originals=new Map(),service=new EventTarget(),timers=new Map();
 const state={saved:true,blocked:false,confirmed:false,saveThrows:false,postThrows:false,posts:0,reloads:0,questions:0};
 const reg={waiting:{postMessage(message){if(state.postThrows)throw Error('gone');assert.deepEqual(message,{type:'ACTIVATE_UPDATE'});state.posts++;}},addEventListener(){},update:async()=>{}};
 service.register=async()=>reg;service.ready=Promise.resolve();
 let serial=0;
 const replacements={window:new EventTarget(),document:new EventTarget(),navigator:{serviceWorker:service,userAgent:'test'},isSecureContext:true,matchMedia:()=>({matches:false}),location:{reload(){state.reloads++;}},setInterval:()=>0,setTimeout:(fn,ms)=>{assert.equal(ms,2500);timers.set(++serial,fn);return serial;},clearTimeout:id=>timers.delete(id),confirm:()=>{state.questions++;return state.confirmed;}};
 for(const [key,value] of Object.entries(replacements)){originals.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,configurable:true,writable:true});}
 try{
  state.ready=0;state.quiet=0;const pwa=mountPwa({save(){if(state.saveThrows)throw Error('quota');return state.saved;},saveBlocked:()=>state.blocked,startQuiet,updateReady:()=>state.ready++,updateQuiet:()=>state.quiet++});
  await new Promise(resolve=>setImmediate(resolve));if(!startQuiet)assert.equal(pwa.state().update,true);
  await run({state,pwa,service,timers});
 }finally{for(const [key,descriptor] of originals){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
}
test('PWA: saved progress activates once and controller change cancels fallback',()=>scenario(({state,pwa,service,timers})=>{
 assert.equal(pwa.update(),true);assert.equal(pwa.update(),false);assert.equal(state.posts,1);assert.equal(state.questions,0);
 const lateFallback=[...timers.values()][0];service.dispatchEvent(new Event('controllerchange'));service.dispatchEvent(new Event('controllerchange'));lateFallback();
 assert.equal(state.reloads,1);assert.equal(timers.size,0);
}));
test('PWA: failed save can be cancelled and successfully retried',()=>scenario(({state,pwa,timers})=>{
 state.saved=false;assert.equal(pwa.update(),false);assert.equal(state.questions,1);assert.equal(state.posts,0);assert.equal(timers.size,0);assert.equal(pwa.state().update,true);
 state.saved=true;assert.equal(pwa.update(),true);assert.equal(state.posts,1);
}));
for(const throws of [false,true])test('PWA: explicitly accepted '+(throws?'throwing':'failed')+' save activates',()=>scenario(({state,pwa})=>{
 Object.assign(state,{saved:false,saveThrows:throws,confirmed:true});assert.equal(pwa.update(),true);assert.equal(state.questions,1);assert.equal(state.posts,1);
}));
test('PWA: protected newer or unreadable progress does not prompt',()=>scenario(({state,pwa})=>{
 Object.assign(state,{saved:false,blocked:true});assert.equal(pwa.update(),true);assert.equal(state.questions,0);assert.equal(state.posts,1);
}));
test('PWA: fallback reload works without controller event, late event cannot reload twice',()=>scenario(({state,pwa,service,timers})=>{
 pwa.update();[...timers.values()][0]();service.dispatchEvent(new Event('controllerchange'));assert.equal(state.reloads,1);assert.equal(timers.size,0);
}));
test('PWA: disappearing waiting worker leaves update retryable without stray reload',()=>scenario(({state,pwa,service,timers})=>{
 state.postThrows=true;assert.equal(pwa.update(),false);service.dispatchEvent(new Event('controllerchange'));assert.equal(state.reloads,0);assert.equal(timers.size,0);
 state.postThrows=false;assert.equal(pwa.update(),true);assert.equal(state.posts,1);
}));
test('PWA: eine beim Start wartende Fassung wird still übernommen – kein Hinweis beim Erststart (Runde 2b)',()=>scenario(({state})=>{
 assert.equal(state.ready,0,'kein Hinweis');assert.equal(state.quiet,1);assert.equal(state.posts,1,'still aktiviert');assert.equal(state.reloads,0,'kein Neuladen');assert.equal(state.questions,0);
},{startQuiet:90000}));
test('PWA: ohne Ruhezeit meldet eine wartende Fassung den Hinweis',()=>scenario(({state})=>{assert.equal(state.ready,1);assert.equal(state.quiet,0);assert.equal(state.posts,0);}));
