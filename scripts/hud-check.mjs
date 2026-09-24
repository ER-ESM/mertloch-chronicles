// Isolated Chrome profile, real input events and real combat-state projections.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/hud';mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:Number(process.env.CDP_PORT||9376),serverPort:4186});
const read=s=>b.evaluate(s),checks=[],pass=s=>{checks.push(s);console.log('PASS '+s);},key='mertloch-hud-layouts-v1';
const rect=sel=>read(`(()=>{const r=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height}})()`);
const editing=()=>read(`!document.querySelector('#hudEditor').hidden`);
const stored=()=>read(`JSON.parse(localStorage.getItem('${key}'))`);
async function click(sel,touch=false){
 await read(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({block:'nearest'})`);await wait(80);
 const r=await rect(sel),p={x:r.x+r.width/2,y:r.y+r.height/2};
 assert.ok(await read(`!!document.elementFromPoint(${p.x},${p.y})?.closest(${JSON.stringify(sel)})`),'unobstructed '+sel);
 if(touch){await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await wait(80);await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 else for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1});
 await wait(250);
}
async function drag(sel,dx,dy,touch=false){
 const r=await rect(sel),p={x:r.x+25,y:r.y+20},q={x:p.x+dx,y:p.y+dy};
 assert.ok(await read(`!!document.elementFromPoint(${p.x},${p.y})?.closest(${JSON.stringify(sel)})`),'drag unobstructed '+sel);
 if(touch){await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await wait(80);await b.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[q]});await wait(80);await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 else {
  // Allow native pointer capture and the layout frame to run between physical input samples.
  await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',...p});await wait(40);
  await b.send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await wait(40);
  for(let i=1;i<=6;i++){await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x+dx*i/6,y:p.y+dy*i/6,button:'left',buttons:1});await wait(25);}
  await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',...q,button:'left',clickCount:1});
 }
 await wait(300);
}
async function field(sel,value,event='change'){
 await read(`document.querySelector(${JSON.stringify(sel)}).value=${JSON.stringify(value)};document.querySelector(${JSON.stringify(sel)}).dispatchEvent(new Event('${event}',{bubbles:true}));`);await wait(250);
}
async function openEditor(){
 const touch=await read(`document.body.classList.contains('touch-mode')`);
 if(touch)await click('#touchMenu',true);else {await b.press('Escape');await wait(100);}
 assert.ok(await read(`!!document.querySelector('.popup-menu')`));await click('.popup-menu [data-hud-open]',touch);
}
async function fixture(touch=false,preserve=false){
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:11,trainingXp:11000,tutorial:{version:1,step:8,completed:true}};
 const script=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-unlock-all','1');${preserve?'':`localStorage.removeItem('${key}');localStorage.removeItem('mertloch-meter-ui-v1');`}localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'${touch?'touch':'desktop'}'}));`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',script);await wait(400);
 await read(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click());game.paused=true;`);
}
async function effects(){
 await read(`(async()=>{const {spawnArena}=await import('./arena.js');const {applyMark}=await import('./class-mechanics.js');const {combatStats}=await import('./rpg.js');const [e]=spawnArena(game,{dummy:true});game.target=e;applyMark(game,e,combatStats(game));e.stun=5;game.buffs={...game.skills.find(s=>s.id==='buff'),remaining:8};game.momentum={stacks:3,until:game.time+9};game.classState.m={...(game.classState.m||{}),hangover:3};})()`);await wait(450);
}
async function auraBounds(){
 const result=await read(`(()=>{const root=document.querySelector('#gameShell').getBoundingClientRect(),controls=['#touchStick','#touchActions','#touchUtility','.rpg-xp'].map(s=>document.querySelector(s).getBoundingClientRect()),bars=[...document.querySelectorAll('.aura-bar')].filter(e=>!e.hidden);return bars.map(e=>{const r=e.getBoundingClientRect();return{id:e.id,inside:r.left>=root.left&&r.top>=root.top&&r.right<=root.right+1&&r.bottom<=root.bottom+1,overlap:controls.some(c=>Math.min(c.right,r.right)-Math.max(c.left,r.left)>1&&Math.min(c.bottom,r.bottom)-Math.max(c.top,r.top)>1),small:[...e.querySelectorAll('button')].some(b=>{const z=b.getBoundingClientRect();return z.width<43.9||z.height<43.9})}})})()`);
 assert.equal(result.length,3);for(const r of result){assert.ok(r.inside,JSON.stringify(r));assert.equal(r.overlap,false,JSON.stringify(r));assert.equal(r.small,false,JSON.stringify(r));}
}
async function menuBounds(){
 const result=await read(`(()=>{const e=document.querySelector('.popup-menu'),r=e.getBoundingClientRect(),controls=['#touchStick','#touchActions','#touchUtility'].map(s=>document.querySelector(s).getBoundingClientRect());return{inside:r.x>=0&&r.y>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,overlap:controls.some(c=>Math.min(c.right,r.right)-Math.max(c.left,r.left)>1&&Math.min(c.bottom,r.bottom)-Math.max(c.top,r.top)>1),overflow:e.querySelector('.popup-body').scrollWidth-e.querySelector('.popup-body').clientWidth,small:[...e.querySelectorAll('button')].some(b=>{const z=b.getBoundingClientRect();return z.width<43.9||z.height<43.9})}})()`);
 assert.ok(result.inside,JSON.stringify(result));assert.equal(result.overlap,false,JSON.stringify(result));assert.ok(result.overflow<2,JSON.stringify(result));assert.equal(result.small,false,JSON.stringify(result));
}
try{
 await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await b.resize(1440,1000);await fixture();const native=await rect('.player-panel');
 const f10=await read(`(()=>{const e=new KeyboardEvent('keydown',{key:'F10',code:'F10',bubbles:true,cancelable:true});document.dispatchEvent(e);return e.defaultPrevented})()`);assert.equal(f10,false);assert.equal(await editing(),false);
 await b.press('i');await b.press('Escape');assert.equal((await b.state()).popups.length,0);
 await b.press('Escape');assert.deepEqual(await read(`[...document.querySelectorAll('.game-menu-actions button')].map(b=>b.textContent)`),['Berufe','Fahrzeuge & Reittiere','Söldner','UI bearbeiten','Hilfe','Einstellungen','Charakterauswahl','Zum Anmeldebildschirm','Zurück zum Spiel']);
 await b.screenshot(dir+'/escape-menu-desktop.png');for(let i=0;i<4;i++)await b.press('Tab');assert.equal(await read(`document.activeElement.dataset.shell`),'guide');for(const type of ['keyDown','keyUp'])await b.send('Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13,...(type==='keyDown'?{text:'\r'}:{})});await wait(250);assert.equal((await b.state()).popups[0].id,'guide');await b.press('Escape');
 await b.press('Escape');await click('.popup-menu [data-shell="settings"]');assert.equal((await b.state()).popups[0].id,'settings','Einstellungen: eigenes Fenster (Runde 2a)');await b.press('Escape');
 await b.press('Escape');assert.equal(await read(`!!document.querySelector('.popup-menu [data-game-book]')`),false,'Desktop: Clanbuch nur über Tasten und Dock (E-43)');await b.press('Escape');
 await b.press('Escape');await click('.popup-menu [data-close]');assert.equal((await b.state()).popups.length,0);
 await read(`game.aiming='ground'`);await b.press('Escape');assert.equal(await read('game.aiming'),null);assert.equal((await b.state()).popups.length,0);
 pass('F10 stays unbound; Esc closes windows/cancels aiming, opens a keyboard-accessible menu and routes every button');

 await read('game.paused=false');await openEditor();assert.ok(await editing());assert.equal(await read('game.paused'),true);
 const before=await read('({x:game.player.x,y:game.player.y,time:game.time})');await b.hold('d',300);await b.press('1');
 assert.deepEqual(await read('({x:game.player.x,y:game.player.y,time:game.time})'),before);
 assert.ok(await read(`document.querySelectorAll('[data-hud-handle]').length>=14`));
 await drag('[data-hud-handle="player"]',64,160);const nudged=await rect('.player-panel');await b.press('ArrowRight');await wait(80);assert.ok(Math.abs((await rect('.player-panel')).x-nudged.x-1)<.1);await field('[data-hud-scale]','115','input');
 await b.screenshot(dir+'/desktop-editor.png');await click('[data-hud-save]');assert.equal(await editing(),false);assert.equal(await read('game.paused'),false);
 const moved=await rect('.player-panel');assert.ok(moved.y>native.y+150);assert.ok(Math.abs(moved.width/native.width-1.15)<.02);
 await fixture(false,true);assert.deepEqual(await rect('.player-panel'),moved);
 pass('Esc menu opens editor, which pauses combat and isolates keys; physical drag, scaling and saved coordinates survive reload');
 await openEditor();await drag('[data-hud-handle="player"]',24,56);await b.press('Escape');assert.deepEqual(await rect('.player-panel'),moved);
 await openEditor();await click('[data-hud-copy]');await field('[data-hud-name]','Raid-Test','input');await click('[data-hud-reset-all]');await click('[data-hud-save]');
 assert.equal((await stored()).profiles.length,2);assert.equal((await stored()).profiles[1].name,'Raid-Test');assert.deepEqual(await rect('.player-panel'),native);
 await openEditor();await field('[data-hud-profile]','0');await click('[data-hud-save]');assert.deepEqual(await rect('.player-panel'),moved);
 await openEditor();await field('[data-hud-profile]','1');await click('[data-hud-delete]');await click('[data-hud-cancel]');assert.equal((await stored()).profiles.length,2);
 pass('cancel restores previous geometry; named profile copies, switching and reset are transactional');
 await openEditor();await read(`window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='${key}')throw Error('test quota');return window.originalSetItem.call(this,k,v);}`);
 await click('[data-hud-save]');assert.ok(await editing());assert.match(await read(`document.querySelector('[data-hud-status]').textContent`),/nicht gespeichert/);
 await read('Storage.prototype.setItem=window.originalSetItem');await click('[data-hud-save]');assert.equal(await editing(),false);pass('storage failure keeps the draft open for a successful retry');
 await effects();assert.equal(await read(`document.querySelector('#debuffStrip [data-aura]').dataset.aura`),'hangover');
 assert.equal(await read(`document.querySelector('#buffStrip [data-aura="buff:momentum:"] .aura-stacks').textContent`),'3');
 await click('#debuffStrip [data-aura]');assert.match(await read(`document.querySelector('#auraTooltip').textContent`),/Kater/);
 await read(`game.classState.m.hangover=0;game.target=null;game.buffs={remaining:0};game.momentum={stacks:0,until:0};`);await wait(400);
 assert.equal(await read(`document.querySelector('#auraTooltip').hidden`),true);assert.equal(await read(`document.querySelector('#targetDebuffStrip').hidden`),true);assert.equal(await read(`document.querySelector('#debuffStrip').hidden`),true);
 pass('real status timers/stacks reach distinct bars; expiry and target loss remove icons and tooltips');
 await openEditor();const chatNative=await rect('#chatWindow');await drag('[data-hud-handle="chat"]',240,-160);await click('[data-hud-save]');const chatEdited=await rect('#chatWindow');
 assert.equal(await read(`document.querySelector('#chatWindow').hasAttribute('data-hud-custom')`),true);assert.ok(chatEdited.x>chatNative.x+200&&Math.abs(chatEdited.y-chatNative.y+160)<1,JSON.stringify({chatNative,chatEdited}));
 await drag('#chatWindow .chat-tabs',64,40);const chatAfter=await rect('#chatWindow');assert.ok(chatAfter.x>chatEdited.x+50&&chatAfter.y>chatEdited.y+30,JSON.stringify({chatEdited,chatAfter}));
 await fixture(false,true);assert.deepEqual(await rect('#chatWindow'),chatAfter);await b.screenshot(dir+'/chat-moved-desktop.png');
 pass('chat window moves in the HUD editor, still drags by its tab bar afterwards and persists');
 await openEditor();await field('[data-hud-element]','meter');await field('[data-hud-scale]','110','input');await click('[data-hud-save]');
 assert.equal(await read("getComputedStyle(document.querySelector('#combatMeter')).transitionDuration"),'0s');
 if(await read("document.querySelector('#combatMeter').hidden"))await b.press('v');const meterBefore=await rect('#combatMeter');await drag('.meter-header',-48,-24);const meterAfter=await rect('#combatMeter');assert.ok(meterAfter.x<meterBefore.x-40,JSON.stringify({meterBefore,meterAfter}));
 await fixture(false,true);assert.deepEqual(await rect('#combatMeter'),meterAfter);await b.press('v');assert.equal(await read(`document.querySelector('#combatMeter').hidden`),true);await b.press('v');
 pass('Details-style meter still drags and persists after being scaled in the HUD editor');
 await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});await b.resize(390,844);await fixture(true,true);await effects();
 assert.equal(await read(`document.querySelector('.player-panel').hasAttribute('data-hud-custom')`),false);
 await click('#touchMenu',true);await b.screenshot(dir+'/escape-menu-touch.png');await click('.popup-menu [data-hud-open]',true);assert.ok(await editing());
 assert.equal(await read(`document.querySelector('.hud-form').hidden`),true);await drag('[data-hud-handle="player"]',0,40,true);await click('[data-hud-save]',true);
 const portrait=await rect('.player-panel');assert.ok((await stored()).profiles[0].views.portrait.player,JSON.stringify(await stored()));await b.resize(844,390);await wait(400);
 assert.equal(await read(`document.querySelector('.player-panel').hasAttribute('data-hud-custom')`),false);await b.resize(390,844);await wait(400);assert.deepEqual(await rect('.player-panel'),portrait);
 await openEditor();await click('[data-hud-options]',true);await field('[data-hud-element]','player');assert.equal(await read(`document.querySelector('[data-hud-scale]').min`),'100');await click('[data-hud-reset-all]',true);await click('[data-hud-save]',true);
 pass('touch game-menu entry, physical finger drag, separate portrait/landscape layouts and touch scale floor');
 await effects();await click('#debuffStrip [data-aura]',true);assert.match(await read(`document.querySelector('#auraTooltip').textContent`),/Kater/);await click('#auraTooltip button',true);
 for(const [w,h,hand] of [[390,844,'right'],[844,390,'right'],[844,390,'left'],[320,568,'right'],[568,320,'left']]){
  await b.resize(w,h);await read(`document.body.dataset.touchHand='${hand}';document.body.style.setProperty('--safe-left','12px');document.body.style.setProperty('--safe-right','12px');document.body.style.setProperty('--safe-top','8px');document.body.style.setProperty('--safe-bottom','12px');`);await wait(450);await auraBounds();await b.screenshot(dir+`/auras-${w}x${h}-${hand}.png`);
  await click('#touchMenu',true);await menuBounds();await b.screenshot(dir+`/menu-${w}x${h}-${hand}.png`);await click('.popup-menu [data-close]',true);
 }
 pass('three active effect bars fit small phones, both orientations/handedness and safe areas without covering combat controls');
 await openEditor();await click('[data-hud-options]',true);await read(`document.querySelector('.hud-form').scrollTop=0`);
 const form=await rect('.hud-form'),swipe={x:form.x+form.width-5,y:form.y+form.height-15};
 await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[swipe]});
 for(let i=1;i<=5;i++){await b.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:swipe.x,y:swipe.y-i*15}]});await wait(50);}
 await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(300);
 assert.ok(await read(`document.querySelector('.hud-form').scrollTop>20`));await click('[data-hud-cancel]',true);pass('editor options scroll with a real finger swipe in short landscape viewports');
 await b.resize(390,844);await wait(300);await openEditor();await b.screenshot(dir+'/touch-editor.png');
 await drag('.hud-toolbar header',0,-300,true);await drag('[data-hud-handle="stick"]',0,-25,true);await click('[data-hud-save]',true);assert.equal(await editing(),false);
 await read('game.paused=false');const start=await read('({x:game.player.x,y:game.player.y})'),r=await rect('#touchStick'),p={x:r.x+r.width/2,y:r.y+r.height/2};
 await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await b.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p.x+32,y:p.y}]});await wait(400);await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 const end=await read('({x:game.player.x,y:game.player.y})');assert.ok(Math.hypot(end.x-start.x,end.y-start.y)>1);pass('moved touch joystick still controls the character after saving');
 assert.deepEqual(b.errors,[]);writeFileSync(dir+'/result.json',JSON.stringify({checks,errors:b.errors},null,2));
}catch(e){console.error(JSON.stringify({browserErrors:b.errors}));await b.screenshot(dir+'/failure.png').catch(()=>{});throw e;}finally{b.close();}
