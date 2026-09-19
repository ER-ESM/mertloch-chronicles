import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/shop';mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:Number(process.env.CDP_PORT||9378),serverPort:4189});
const read=s=>b.evaluate(s),checks=[],pass=s=>{checks.push(s);console.log('PASS '+s);};
async function click(sel,touch=false){
 await read(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({block:'nearest'})`);await wait(100);
 const p=await read(`(()=>{const r=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
 assert.ok(await read(`!!document.elementFromPoint(${p.x},${p.y})?.closest(${JSON.stringify(sel)})`),'unobstructed '+sel);
 if(touch){await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await wait(80);await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 else for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1});
 await wait(200);
}
async function fixture(touch=false){
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:6,trainingXp:2100,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:200,inventory:[{id:'kabel',count:10},{id:'regenjacke',count:1}]}};
 const script=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'${touch?'touch':'desktop'}'}));`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',script);await wait(300);await atShop();
}
async function atShop(){await read(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click());game.enemies=[];Object.assign(game.player,game.world.places.kiosk.approach);game.player.inCombat=0;game.moveTo=null;game.path=[];game.keys.clear();game.paused=false;`);await wait(350);}
async function open(touch=false){if(touch)await click('#touchInteract',true);else await b.press('f');await wait(200);assert.ok(await read(`!!document.querySelector('.popup-shop')`));}
async function amount(id,n){await read(`(()=>{const e=document.querySelector('[data-shop-row="${id}"] input');e.value='${n}';e.dispatchEvent(new Event('input',{bubbles:true}));})()`);}
async function bounds(touch){
 const a=await read(`(()=>{const e=document.querySelector('.popup-shop'),r=e.getBoundingClientRect(),body=e.querySelector('.popup-body'),controls=[...document.querySelectorAll('#touchStick,#touchActions,#touchUtility')].map(e=>e.getBoundingClientRect());return{inside:r.x>=0&&r.y>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,overflow:body.scrollWidth-body.clientWidth,small:[...e.querySelectorAll('button,input')].filter(e=>e.getClientRects().length).some(e=>{const r=e.getBoundingClientRect();return r.width<43.9||r.height<43.9}),overlap:controls.some(c=>Math.min(c.right,r.right)-Math.max(c.left,r.left)>1&&Math.min(c.bottom,r.bottom)-Math.max(c.top,r.top)>1)}})()`);
 assert.ok(a.inside,JSON.stringify(a));assert.ok(a.overflow<2,JSON.stringify(a));assert.equal(a.small,false,JSON.stringify(a));if(touch)assert.equal(a.overlap,false,JSON.stringify(a));
}
try{
 await b.resize(1440,1000);await fixture();await b.screenshot(dir+'/kiosk-world.png');await open();await bounds(false);await b.screenshot(dir+'/desktop-buy.png');
 assert.equal(await read(`document.querySelectorAll('[data-shop-trade="buy"]').length`),4);
 await b.press('Tab');assert.equal(await read('document.activeElement.dataset.shopTab'),'sell');for(const type of ['keyDown','keyUp'])await b.send('Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13,...(type==='keyDown'?{text:'\r'}:{})});await wait(150);assert.equal(await read(`document.querySelector('[data-shop-tab="sell"]').getAttribute('aria-pressed')`),'true');await click('[data-shop-tab="buy"]');
 await amount('brezel',2);await click('[data-shop-id="brezel"]');assert.equal(await read('game.rpg.coins'),176);assert.equal(await read(`game.rpg.inventory.find(e=>e.id==='brezel').count`),2);
 await amount('currywurst',99);assert.equal(await read(`document.querySelector('[data-shop-id="currywurst"]').disabled`),true);
 pass('world interaction opens Kalle; quantities, prices and affordability match inventory and wallet');
 await click('[data-shop-tab="sell"]');await amount('kabel',3);await click('[data-shop-id="kabel"]');assert.equal(await read('game.rpg.coins'),176);
 await click('[data-shop-cancel]');assert.equal(await read('game.rpg.coins'),176);await amount('kabel',3);await click('[data-shop-id="kabel"]');await click('[data-shop-confirm]');assert.equal(await read('game.rpg.coins'),179);
 await click('[data-shop-id="regenjacke"]');await b.screenshot(dir+'/desktop-confirm.png');await click('[data-shop-confirm]');assert.equal(await read('game.rpg.coins'),187);
 await click('[data-shop-tab="buyback"]');assert.equal(await read(`document.querySelectorAll('[data-shop-trade="buyback"]').length`),2);await b.screenshot(dir+'/desktop-buyback.png');
 pass('material and equipment sales require confirmation; cancellation does not mutate inventory');
 await b.goto(b.url);await atShop();await open();await click('[data-shop-tab="buyback"]');assert.equal(await read(`document.querySelectorAll('[data-shop-trade="buyback"]').length`),2);
 await click('[data-shop-id="regenjacke"]');assert.equal(await read('game.rpg.coins'),179);assert.ok(await read(`game.rpg.inventory.some(e=>e.id==='regenjacke')`));
 await click('[data-shop-id="kabel"]');assert.equal(await read('game.rpg.coins'),176);assert.equal(await read('game.rpg.buyback.length'),0);
 pass('wallet, inventory and buyback persist across reload; each item returns once at its original price');
 await read('game.player.x+=150');await wait(200);assert.equal(await read(`!!document.querySelector('.popup-shop')`),false);
 await atShop();await open();await read('game.player.inCombat=4');await wait(200);assert.equal(await read(`!!document.querySelector('.popup-shop')`),false);
 await atShop();await b.press('i');await click('[data-shop-find]');assert.ok(await read(`document.querySelector('#atlasSelection').textContent.includes('Kalles Kiosk')`));await read('game.player.x+=100');await click('[data-navigate]');assert.ok(await read('game.moveTo||game.path.length'));
 pass('leaving or combat closes the shop; inventory and atlas expose a route to the walkable kiosk approach');
 for(const [name,w,h,hand] of (process.argv.includes('--desktop-only')?[]:[['phone',390,844,'right'],['small',320,568,'right'],['landscape',844,390,'right'],['landscape-left',844,390,'left'],['short',568,320,'left']])){
  await b.resize(w,h);await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await fixture(true);
  await read(`document.body.dataset.touchHand='${hand}';for(const [k,v] of Object.entries(${JSON.stringify(w>h?{left:24,right:24,top:0,bottom:12}:{left:0,right:0,top:24,bottom:12})}))document.body.style.setProperty('--safe-'+k,v+'px')`);await wait(250);
  await open(true);await bounds(true);await b.screenshot(dir+'/'+name+'-buy.png');await click('[data-shop-id="brezel"]',true);assert.equal(await read('game.rpg.coins'),188);
  await click('[data-shop-tab="sell"]',true);await click('[data-shop-id="regenjacke"]',true);await bounds(true);await b.screenshot(dir+'/'+name+'-confirm.png');await click('[data-shop-confirm]',true);
  await click('[data-shop-tab="buyback"]',true);await click('[data-shop-id="regenjacke"]',true);assert.equal(await read('game.rpg.coins'),188);
  await click('.popup-shop [data-window-close]',true);assert.equal(await read(`!!document.querySelector('.popup-shop')`),false);
  pass(name+': physical touch buy/sell/buyback, 44px controls, safe areas and combat-control clearance');
 }
 assert.deepEqual(b.errors,[]);writeFileSync(dir+(process.argv.includes('--desktop-only')?'/desktop-result.json':'/result.json'),JSON.stringify({checks,errors:b.errors},null,2));
}catch(e){await b.screenshot(dir+'/failure.png').catch(()=>{});console.error(JSON.stringify({browserErrors:b.errors}));throw e;}finally{b.close();}
