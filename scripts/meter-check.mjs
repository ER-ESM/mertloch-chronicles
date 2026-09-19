// Own browser/profile; real game combat paths plus physical mouse/touch UI interaction.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/meter';mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:Number(process.env.CDP_PORT||9375),serverPort:4187}),checks=[];
const read=s=>b.evaluate(s),pass=s=>{checks.push(s);console.log('PASS '+s);};
async function click(selector,touch=false){
 await read(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'nearest'})`);await wait(150);
 const p=await read(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
 assert.ok(await read(`!!document.elementFromPoint(${p.x},${p.y})?.closest(${JSON.stringify(selector)})`),'unobstructed '+selector);
 if(touch){await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 else for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1});
 await wait(300);
}
async function fixture(touch=false,preservePrefs=false){
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:11,trainingXp:11000,tutorial:{version:1,step:8,completed:true}};
 const script=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;${preservePrefs?'':"localStorage.removeItem('mertloch-meter-ui-v1');"}localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'${touch?'touch':'desktop'}'}));`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',script);await wait(200);
 await read(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);
 await read(`(async()=>{const {spawnArena}=await import('./arena.js');const {healPlayer}=await import('./class-mechanics.js');const {combatStats}=await import('./rpg.js');const [e]=spawnArena(game,{dummy:true});game.paused=true;game.random=()=>.5;game.damage(e,170,'Kelle');game.time+=2;game.damage(e,70,'Autoangriff');game.time+=2;game.damage(e,40,'Markierung');game.player.hp-=100;healPlayer(game,300,combatStats(game),true);game.time+=2;})()`);
 await wait(350);
}
async function bounds(){
 const result=await read(`(()=>{const e=document.querySelector('#combatMeter'),r=e.getBoundingClientRect(),root=document.querySelector('#gameShell').getBoundingClientRect();const controls=['#touchStick','#touchActions','#touchUtility'].map(s=>document.querySelector(s)?.getBoundingClientRect()).filter(b=>b?.width&&b.height);return {inside:r.left>=root.left&&r.top>=root.top&&r.right<=root.right+1&&r.bottom<=root.bottom+1,overlap:controls.some(b=>Math.min(b.right,r.right)-Math.max(b.left,r.left)>1&&Math.min(b.bottom,r.bottom)-Math.max(b.top,r.top)>1),overflow:e.scrollWidth>e.clientWidth+1,small:[...e.querySelectorAll('button,select,summary')].filter(b=>b.getClientRects().length).filter(b=>{const z=b.getBoundingClientRect();return z.width<44||z.height<44}).map(b=>b.textContent)}})()`);
 assert.ok(result.inside,JSON.stringify(result));assert.equal(result.overlap,false,JSON.stringify(result));assert.equal(result.overflow,false,JSON.stringify(result));assert.deepEqual(result.small,[]);
}
try{
 await b.resize(1440,1000);await fixture();
 assert.equal(await read(`document.querySelector('#combatMeter').hidden`),false);
 assert.ok(await read(`document.querySelector('#combatMeter').getBoundingClientRect().height<=240`));
 await b.screenshot(dir+'/desktop-ranking.png');
 await b.press('v');assert.equal(await read(`document.querySelector('#combatMeter').hidden`),true);
 await b.press('V');await wait(300);
 assert.equal(await read(`document.querySelector('#combatMeter').hidden`),false);
 await read(`document.querySelector('#meterSegment').focus();`);await b.press('v');assert.equal(await read(`document.querySelector('#combatMeter').hidden`),true);await b.press('v');
 await read(`game.paused=false;game.startAttack();game.paused=true;document.activeElement.blur();`);assert.equal(await read('game.autoAttack.enabled'),true);await b.press('Escape');
 assert.equal(await read(`document.querySelector('#combatMeter').hidden`),false);assert.equal(await read('game.autoAttack.enabled'),false);
 assert.equal((await b.state()).popups.length,0);
 pass('compact meter visible by default; V/Shift+V toggle; combat Escape keeps the HUD open');
 await click('[data-meter-actor="dieter"]');assert.ok(await read(`document.querySelectorAll('[data-meter-ability]').length>=3`));
 await click('[data-meter-ability="strike"]');assert.match(await read(`document.querySelector('.meter-detail').textContent`),/Kritisch/);
 await b.screenshot(dir+'/desktop-damage.png');
 await click('[data-meter-mode="healing"]');await click('[data-meter-ability="heal"]');
 assert.match(await read(`document.querySelector('.meter-detail').textContent`),/Überheilung/);await b.screenshot(dir+'/desktop-healing.png');
 const dash=await read('game.player.dash||0');await b.press(' ');assert.equal(await read('game.player.dash||0'),dash);pass('desktop toggle, actor and skill breakdown, effective healing/overheal, keyboard isolation');
 await read(`document.querySelector('#meterSegment').value='overall';document.querySelector('#meterSegment').dispatchEvent(new Event('change',{bubbles:true}));`);await wait(300);
 await click('[data-meter-options]');await click('[data-meter-reset]');await click('[data-meter-cancel]');assert.ok((await b.state()).meter.damage>0);
 await click('[data-meter-reset]');await click('[data-meter-confirm]');assert.equal((await b.state()).meter.damage,0);assert.equal((await b.state()).meter.healing,0);pass('overall selection and two-step reset with cancel');
 await read('game.paused=false;game.startAttack();');await wait(2100);assert.ok((await b.state()).meter.damage>0);
 const beforeMove=(await b.state()).player;await b.hold('d',250);const afterMove=(await b.state()).player;assert.ok(Math.hypot(afterMove.x-beforeMove.x,afterMove.y-beforeMove.y)>1);pass('real autoattacks update the open meter while world movement continues');
 await click('[data-meter-close]');assert.equal(await read(`document.querySelector('#combatMeter').hidden`),true);
 await fixture(false,true);assert.equal(await read(`document.querySelector('#combatMeter').hidden`),true);await b.press('v');
 assert.equal(await read(`document.querySelector('#combatMeter').dataset.mode`),'healing');
 const start=await read(`(()=>{const r=document.querySelector('.meter-header').getBoundingClientRect();return{x:r.x+80,y:r.y+12}})()`);
 await b.send('Input.dispatchMouseEvent',{type:'mousePressed',...start,button:'left',clickCount:1});
 await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:start.x-180,y:start.y-80,button:'left',buttons:1});
 await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:start.x-180,y:start.y-80,button:'left',clickCount:1});
 const handle=await read(`(()=>{const r=document.querySelector('[data-meter-resize]').getBoundingClientRect();return{x:r.x+9,y:r.y+9}})()`);
 await b.send('Input.dispatchMouseEvent',{type:'mousePressed',...handle,button:'left',clickCount:1});
 await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:handle.x+60,y:handle.y+80,button:'left',buttons:1});
 await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:handle.x+60,y:handle.y+80,button:'left',clickCount:1});
 const geometry=await read(`(()=>{const r=document.querySelector('#combatMeter').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()`);
 assert.ok(geometry.width>=379&&geometry.height>=299,JSON.stringify(geometry));
 await fixture(false,true);assert.equal(await read(`document.querySelector('#combatMeter').hidden`),false);
 assert.deepEqual(await read(`(()=>{const r=document.querySelector('#combatMeter').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()`),geometry);
 pass('physical drag/resize and mode, visibility, position and size persist across reloads');
 await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});await b.resize(390,844);await fixture(true);
 assert.equal(await read(`document.querySelector('#combatMeter').hidden`),true);await click('#meterToggle',true);
 await bounds();await click('[data-meter-close]',true);
 await click('#touchMenu',true);await click('[data-book-tab="person"]',true);
 await click('.meter-entry',true);assert.equal((await b.state()).popups.length,0);
 await click('[data-meter-actor="dieter"]',true);await bounds();await b.screenshot(dir+'/mobile-portrait.png');
 await click('[data-meter-mode="healing"]',true);await click('[data-meter-ability="heal"]',true);await bounds();pass('touch opens from Clanbook and supports both modes and ability details');
 await read('game.paused=false;');const beforeTouch=(await b.state()).player;
 const stick=await read(`(()=>{const r=document.querySelector('#touchStick').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
 await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[stick]});await b.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:stick.x+35,y:stick.y}]});await wait(300);await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 const afterTouch=(await b.state()).player;assert.ok(Math.hypot(afterTouch.x-beforeTouch.x,afterTouch.y-beforeTouch.y)>1);await read('game.paused=true;');pass('physical joystick remains usable with meter open');
 for(const [width,height,hand] of [[844,390,'right'],[844,390,'left'],[320,568,'right'],[568,320,'left'],[390,844,'right']]){
  await b.resize(width,height);await read(`document.body.dataset.touchHand='${hand}';document.body.style.setProperty('--safe-left','12px');document.body.style.setProperty('--safe-right','12px');document.body.style.setProperty('--safe-top','8px');document.body.style.setProperty('--safe-bottom','12px');`);await wait(400);await bounds();
  await b.screenshot(dir+`/mobile-${width}x${height}-${hand}.png`);
 }
 pass('portrait/landscape rotation, 320px width, both handedness modes and safe areas without combat-control overlap');
 await click('[data-meter-close]',true);assert.equal(await read(`document.querySelector('#combatMeter').hidden`),true);
 await b.goto(b.url);await wait(300);assert.equal((await b.state()).meter.damage,0);assert.ok((await b.state()).player.level>=11);assert.equal(await read(`document.querySelector('#combatMeter').hidden`),true);pass('closing returns to game; reload keeps it closed, clears session statistics and preserves progress');
 assert.deepEqual(b.errors,[]);writeFileSync(dir+'/result.json',JSON.stringify({checks,errors:b.errors},null,2));
}finally{b.close();}
