import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browser,wait} from './browser-polish.mjs';
const url=process.argv[2]||'http://localhost:4173/',dir=process.argv[3]||'combat-review/position',key='mertloch-chronicles-v2-56753-72-1';mkdirSync(dir,{recursive:true});
const b=await browser(),checks=[];let backup,touch=false;
async function load(source){const {identifier}=await b.send('Page.addScriptToEvaluateOnNewDocument',{source});await b.goto(url);await wait(1100);await b.send('Page.removeScriptToEvaluateOnNewDocument',{identifier});}
async function click(selector){const p=await b.evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);if(touch){await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...p,id:0}]});await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}else for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1});await wait(160);}
const storage=()=>b.evaluate(`JSON.parse(localStorage.getItem(${JSON.stringify(key)}))`);
const near=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)<.05;
try{
 await b.send('Network.enable');await b.send('Network.setBypassServiceWorker',{bypass:true});await b.send('Network.setCacheDisabled',{cacheDisabled:true});await b.goto(url);await wait(1000);backup=await b.evaluate('Object.fromEntries(Object.entries(localStorage).filter(([k])=>k.startsWith("mertloch")))');
 await load(`localStorage.setItem(${JSON.stringify(key)},JSON.stringify({version:1,worldKey:'v2-56753-72-1',classId:'dieter'}));`);await b.resize(2024,900);
 await click('#gameMenuButton');await click('[data-shell="clan"]');assert.equal(await b.evaluate('document.querySelectorAll("[data-member]").length'),3);await b.screenshot(dir+'/desktop-classes.jpg');await click('[data-member="baerbel"]');assert.equal((await b.state()).classId,'baerbel');assert.equal((await storage()).classId,'baerbel');
 await b.press('Escape');await b.press('c');await click('[data-rpg-clan]');await click('[data-member="kevin"]');assert.equal((await b.state()).classId,'kevin');await b.press('Escape');await b.press('n');const specs=await b.evaluate('[...document.querySelectorAll("[data-spec]")].map(e=>e.dataset.spec)');assert.equal(specs.length,3);assert.ok(specs.every(s=>s.startsWith('kevin-')));await b.press('Escape');checks.push('Real clicks: direct menu and Character > Figure switch; all three figures available; class and three specs update');
 const start=(await b.state()).player;await b.hold('d',650);await b.hold('s',450);await wait(350);const walked=(await b.state()).player;assert.ok(Math.hypot(walked.x-start.x,walked.y-start.y)>30);
 await wait(5200);assert.ok(near((await storage()).position,walked),'Periodic autosave records movement');await b.goto(url);await wait(1100);assert.ok(near((await b.state()).player,walked),'Reload returns to last place');assert.equal((await b.state()).classId,'kevin');checks.push('Movement autosaves within five seconds; reload restores exact coordinates and selected class');
 // Exercise the page lifecycle handlers directly: this CDP endpoint does not
 // support creating/activating additional browser targets.
 await b.hold('a',300);await wait(250);const hiddenPosition=(await b.state()).player;
 try{await b.evaluate("Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));");assert.equal((await b.state()).paused,true);assert.ok(near((await storage()).position,hiddenPosition),'Hidden event saves immediately');}finally{await b.evaluate("delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));");}
 await b.hold('w',250);await wait(250);const pagehidePosition=(await b.state()).player;await b.evaluate("window.dispatchEvent(new PageTransitionEvent('pagehide'));");assert.ok(near((await storage()).position,pagehidePosition));
 checks.push('Simulated hidden/pagehide lifecycle events save position immediately');
 // Return to the safe meeting place through a clean review save for touch switching.
 await load(`localStorage.setItem(${JSON.stringify(key)},JSON.stringify({version:1,worldKey:'v2-56753-72-1',classId:'kevin'}));`);
 for(const [width,height,name,member] of [[390,844,'phone','baerbel'],[844,390,'landscape','dieter']]){
  touch=true;await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await b.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});await wait(250);await click('#touchMenu');await click('[data-touch-menu="clan"]');await b.screenshot(dir+'/'+name+'-classes.jpg');
  const bounds=await b.evaluate('(()=>{const p=document.querySelector(".popup-clan"),r=p.getBoundingClientRect(),body=p.querySelector(".popup-body");return {left:r.left,right:r.right,overflow:body.scrollWidth-body.clientWidth};})()');assert.ok(bounds.left>=0&&bounds.right<=width&&bounds.overflow<=1);await click('[data-member="'+member+'"]');assert.equal((await b.state()).classId,member);
 }
 checks.push('Real touch taps switch figures in portrait and landscape without horizontal overflow');assert.deepEqual(b.errors,[]);writeFileSync(dir+'/checks.json',JSON.stringify({url,checks},null,2));console.log(JSON.stringify({url,checks}));
}finally{if(backup)await load(`for(const k of Object.keys(localStorage))if(k.startsWith('mertloch'))localStorage.removeItem(k);for(const [k,v] of Object.entries(${JSON.stringify(backup)}))localStorage.setItem(k,v);`);await b.send('Emulation.setTouchEmulationEnabled',{enabled:false});await b.resize(2024,900);await b.send('Network.setBypassServiceWorker',{bypass:false});await b.send('Network.setCacheDisabled',{cacheDisabled:false});b.close();}
