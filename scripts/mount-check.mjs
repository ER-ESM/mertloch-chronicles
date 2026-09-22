import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/mounts';mkdirSync(dir,{recursive:true});
const b=await browserSession({port:9412,serverPort:4212});
const run=s=>b.evaluate(`(async()=>{const g=window.game;${s}})()`),checks=[];
const pass=s=>{checks.push(s);console.log('PASS '+s);};
async function click(selector){await run(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'nearest'});`);const p=await run(`const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};`);assert.ok(await run(`return !!document.elementFromPoint(${p.x},${p.y})?.closest(${JSON.stringify(selector)});`),selector+' accessible');for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1});await wait(200);}
async function collection(){await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'P',code:'KeyP',modifiers:8});await b.send('Input.dispatchKeyEvent',{type:'keyUp',key:'P',code:'KeyP',modifiers:8});await wait(400);}
try{
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:6,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:500,inventory:[]}};
 const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',init);await wait(1800);
 await run(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click());g.tutorial.completed=true;g.enemies=[];g.companions=[];g.player.level=6;g.player.inCombat=0;g.stopAuto();g.quest.accepted=false;const {mountStation}=await import('./mounts.js');Object.assign(g.player,mountStation(g.world));g.rpg.coins=500;const {addItem}=await import('./rpg.js');for(const [id,n]of Object.entries({dosenblech:6,kabel:2,wasser:2,brezel:3}))addItem(g.rpg,id,n);`);
 await collection();assert.ok(await run('return !!document.querySelector(".mount-panel");'));await b.screenshot(dir+'/collection-locked.png');
 for(const id of ['klappermofa','blechroller','hofpferd'])await click('[data-mount-acquire="'+id+'"]');
 assert.deepEqual(await run('return g.mounts.owned;'),['klappermofa','blechroller','hofpferd']);assert.equal(await run('return g.rpg.coins;'),340);pass('Three mounts acquired through real collection buttons; costs charged once');
 for(let i=0;i<4;i++){await b.screenshot(dir+'/collection-'+i+'.png');await click('[data-mount-turn]');}
 await click('[data-mount-bind]');await click('[data-mount-slot="9"]');assert.equal(await run('return g.bar()[9].kind;'),'mount');await b.press('Escape');await b.press('x');await wait(200);assert.ok(await run('return !!g.mountCast;'));await b.hold('d',180);assert.equal(await run('return g.mountCast;'),null);pass('X starts mounting; walking cancels it');
 await wait(200);await b.press('x');await wait(1800);assert.equal(await run('return g.player.mount;'),'hofpferd');await b.screenshot(dir+'/world-horse.png');await b.press('0');assert.equal(await run('return g.player.mount;'),null);pass('Mounting completes and action slot toggles dismount');
 await run(`g.emit('save');`);await wait(400);await b.goto(b.url);await wait(700);assert.deepEqual(await run('return g.mounts.owned;'),['klappermofa','blechroller','hofpferd']);assert.equal(await run('return g.bar()[9].kind;'),'mount');assert.equal(await run('return g.player.mount;'),null);pass('Collection and mount action slot survive reload without a stale active mount');
 assert.deepEqual(b.errors,[]);writeFileSync(dir+'/report.json',JSON.stringify({checks,errors:b.errors},null,2));
}catch(error){try{await b.screenshot(dir+'/failure.png');}catch{}throw error;}finally{await b.close();}
