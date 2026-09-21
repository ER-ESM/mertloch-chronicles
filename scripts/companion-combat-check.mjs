import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/companion-combat';mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:Number(process.env.CDP_PORT||9391),serverPort:4197});
const checks=[],pass=s=>{checks.push(s);console.log('PASS '+s);};
const run=s=>b.evaluate(`(async()=>{const g=window.game;${s}})()`);
async function click(selector){const p=await run(`const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};`);for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1});await wait(300);}
async function strike(){return run(`
 const {tickCompanions}=await import('./companions.js');const {redesignPose}=await import('./redesign-art.js');
 const c=g.companions[0];c.gcd=0;c.cooldowns={};g.events=[];tickCompanions(g,.01);
 return {pose:redesignPose(c.view),attack:c.view.attack,events:g.events.filter(e=>e.type==='combat'),fx:g.fx.filter(e=>e.companion===c.id)};`);}
try{
 await b.resize(1440,1000);
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:6,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:200,inventory:[]}};
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});`});
 await b.goto(b.url);await wait(1300);
 await run(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click());g.paused=true;g.tutorial.completed=true;g.enemies=[];g.companions=[];g.random=()=>.5;g.hireCompanion('merc-hopfen-horst',{free:true});g.hireCompanion('merc-schorle-susi',{free:true});
 const {spawnArena}=await import('./arena.js');const [e]=spawnArena(g,{kind:'wolf'});Object.assign(e,{x:g.player.x+90,y:g.player.y+40,hp:100000,maxHp:100000});
 Object.assign(g.companions[0],{x:e.x-30,y:e.y,order:'stay'});Object.assign(g.companions[1],{x:g.player.x-50,y:g.player.y+35,order:'stay',stance:'passive'});g.target=e;`);
 const first=await strike();assert.equal(first.pose,'anticipation');assert.ok(first.events.some(e=>e.actor==='merc-hopfen-horst'&&e.kind==='damage'));
 await wait(300);
 assert.match(await run(`return document.querySelector('.sct-companion[data-companion="merc-hopfen-horst"] .sct-out').textContent;`),/Hopfen-Horst/);
 // Inspect real canvas calls: the other-actor renderer must use the same action frame as the companion view.
 assert.ok(await run(`const {redesignFrame}=await import('./redesign-art.js');const c=g.companions[0],expected=redesignFrame(c.def.look,c.view),ctx=__mertloch.renderer.canvas.getContext('2d'),original=ctx.drawImage;let found=false;ctx.drawImage=function(...a){if(a[0]===expected.image&&a[1]===expected.frame.x&&a[2]===expected.frame.y)found=true;return original.apply(this,a);};try{__mertloch.renderer.draw();}finally{ctx.drawImage=original;}return found;`),'renderer paints attack frame');
 await b.press('v');await wait(350);await strike();await wait(180);await b.screenshot(dir+'/desktop-attack.jpg');
 assert.match(await run(`return document.querySelector('[data-meter-actor="merc-hopfen-horst"]').textContent;`),/Hopfen-Horst/);
 await click('[data-meter-actor="merc-hopfen-horst"]');assert.match(await run(`return document.querySelector('.meter-rows').textContent;`),/Kellenhieb/);
 pass('Real melee attack frame, companion-anchored combat text and clickable damage/ability rows');
 await run(`g.player.hp=1;`);await strike();await wait(250);
 assert.match(await run(`return document.querySelector('.sct-companion[data-companion="merc-schorle-susi"] .sct-out').textContent;`),/Schorle-Susi/);
 await click('[data-meter-back]');await click('[data-meter-mode="healing"]');
 assert.match(await run(`return document.querySelector('[data-meter-actor="merc-schorle-susi"]').textContent;`),/Schorle-Susi/);
 await click('[data-meter-actor="merc-schorle-susi"]');await click('[data-meter-ability="round"]');assert.match(await run(`return document.querySelector('.meter-detail').textContent;`),/Überheilung/);
 await b.screenshot(dir+'/desktop-healing.jpg');pass('Healer combat text, own healing row, ability details and overheal');
 await run(`const {tickEnemyOnCompanion,tickCompanions}=await import('./companions.js');const c=g.companions[0],e=g.target;e.autoTimer=0;e.attackTimer=99;e.cast=null;tickEnemyOnCompanion(g,e,c,.01);tickCompanions(g,.01);`);await wait(200);
 assert.match(await run(`return document.querySelector('.sct-companion[data-companion="merc-hopfen-horst"] .sct-in').textContent;`),/−/);
 await run(`const c=g.companions[0];c.x+=80;`);await wait(100);
 assert.ok(await run(`return document.querySelector('.sct-companion').style.transform.includes('translate');`));
 await run(`g.dismissCompanion('merc-hopfen-horst');`);await wait(150);
 assert.equal(await run(`return !!document.querySelector('.sct-companion[data-companion="merc-hopfen-horst"]');`),false);pass('Incoming damage text, moving anchors and cleanup after dismissal');
 await b.resize(390,844);await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await run(`document.body.classList.add('touch-mode');const {tickCompanions}=await import('./companions.js');const c=g.companions[0];c.gcd=0;c.cooldowns={};g.player.hp=1;tickCompanions(g,.01);`);await wait(250);
 assert.ok(await run(`return !!document.querySelector('.sct-companion .sct-heal');`));await b.screenshot(dir+'/touch-healing.jpg');
 await run(`g.setSetting('sct',false);`);await wait(100);assert.equal(await run(`return document.querySelector('#sct').hidden;`),true);pass('Touch combat text and SCT setting');
 assert.deepEqual(b.errors,[]);writeFileSync(dir+'/report.json',JSON.stringify({checks,errors:b.errors},null,2));
}catch(e){try{await b.screenshot(dir+'/failure.jpg');}catch{}throw e;}finally{await b.close();}
