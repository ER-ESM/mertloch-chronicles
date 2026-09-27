import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/companions';mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:Number(process.env.CDP_PORT||9386),serverPort:Number(process.env.SERVER_PORT||4196)});
const read=s=>b.evaluate(`(()=>{const g=window.game;return (${s});})()`);
const run=s=>b.evaluate(`(()=>{const g=window.game;${s}})()`);
const checks=[],pass=s=>{checks.push(s);console.log('PASS '+s);};
async function click(selector,touch=false){
 await read(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'nearest'})`);await wait(100);
 const p=await read(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
 assert.ok(await read(`!!document.elementFromPoint(${p.x},${p.y})?.closest(${JSON.stringify(selector)})`),'unobstructed '+selector);
 if(touch){await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await wait(60);await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 else for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1});
 await wait(180);
}
async function fixture(touch=false){
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:6,trainingXp:2100,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:200,inventory:[]}};
 const seed=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'${touch?'touch':'desktop'}'}));`});
 await b.goto(b.url);await wait(1200);await b.send('Page.removeScriptToEvaluateOnNewDocument',seed);
 for(let i=0;i<100;i++){if(await read('!!g&&!!window.mertloch&&document.querySelector("#startScreen")?.hidden'))break;await wait(100);}
 await run(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click());g.tutorial.completed=true;g.enemies=[];g.companions=[];g.rpg.coins=200;g.player.inCombat=0;g.dead=false;g.paused=false;g.moveTo=null;g.path=[];g.keys.clear();Object.assign(g.player,window.mertloch.companions.board());`);await wait(350);
}
/** Fenster ganz im Bild, kein Quer- und (E-70, 27.09.2026) kein Hochscrollen – weder die .popup-body noch ein Innenbereich. */
async function bounds(label=''){const r=await read(`(()=>{const e=document.querySelector('.popup-companions'),r=e.getBoundingClientRect(),b=e.querySelector('.popup-body');return{size:innerWidth+'x'+innerHeight,inside:r.left>=0&&r.top>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1,overflow:b.scrollWidth-b.clientWidth,scroll:b.scrollHeight-b.clientHeight,inner:[...b.querySelectorAll('*')].filter(x=>x.offsetParent&&/auto|scroll/.test(getComputedStyle(x).overflowY)&&x.scrollHeight>x.clientHeight+2).map(x=>x.className)};})()`);const tag=label+' '+JSON.stringify(r);assert.ok(r.inside,tag);assert.ok(r.overflow<2,tag);assert.ok(r.scroll<=2,'Söldner-Fenster scrollt: '+tag);assert.deepEqual(r.inner,[],tag);}
try{
 await b.resize(2024,900);await fixture();assert.ok(await read('!!window.mertloch.companions.board()'),'board exists');
 await b.press('f');await wait(250);assert.ok(await read("!!document.querySelector('.popup-companions')"),'F at board opens offers');await bounds('desktop offers');
 assert.equal(await read("document.querySelectorAll('[data-offer]').length"),6);
 await b.screenshot(dir+'/desktop-board.jpg');
 const offers=await read('window.mertloch.companions.offers()'),a=offers[0].id,c=offers[1].id;
 await click(`[data-companion-hire="${a}"]`);assert.equal(await read('g.rpg.coins'),200-offers[0].cost);assert.equal((await read('window.mertloch.companions.list()')).length,1);
 await click(`[data-companion-hire="${c}"]`);await click('[data-companion-tab="team"]');
 await click('[data-companion-order="stay"]');assert.ok((await read('window.mertloch.companions.list()')).every(c=>c.order==='stay'));
 await read(`(()=>{const s=document.querySelector('[data-companion-scope]');s.value='${a}';s.dispatchEvent(new Event('change',{bubbles:true}));})()`);
 await click('[data-companion-stance="passive"]');assert.equal(await read('g.companions[0].stance'),'passive');assert.notEqual(await read('g.companions[1].stance'),'passive');
 assert.ok(await read("document.querySelector('[data-companion-order=attack]').disabled"));
 await run(`g.target={id:'test-target',name:'Testziel',hp:100,maxHp:100,x:g.player.x+100,y:g.player.y,ai:'idle'};`);await wait(200);
 await click('[data-companion-order="attack"]');assert.equal(await read('g.companions[0].order'),'attack');
 await bounds('desktop team');await b.screenshot(dir+'/desktop-team.jpg');
 await run(`g.target=null;g.companions[0].state='down';g.companions[0].hp=0;g.companions[0].downUntil=g.time+25;g.companions[0].contract=95;`);await wait(200);
 assert.ok(await read("document.querySelector('.companion-roster-row').classList.contains('is-down')"));assert.match(await read("document.querySelector('[data-companion-contract]').textContent"),/2 min/);
 await b.screenshot(dir+'/desktop-down.jpg');pass('Board interaction, paid hire, group and individual commands, target gating, health and recovery');
 await click(`[data-companion-dismiss="${a}"]`);assert.equal((await read('window.mertloch.companions.list()')).length,1);
 await run('g.companions[0].contract=.1;');await wait(400);assert.equal((await read('window.mertloch.companions.list()')).length,0);assert.ok(await read("!!document.querySelector('.companion-empty')"));
 await click('[data-companion-tab="offers"]');await run('g.rpg.coins=0;');await wait(200);assert.ok(await read("[...document.querySelectorAll('[data-companion-hire]')].every(b=>b.disabled)"));
 await run('g.rpg.coins=500;');await wait(200);for(const o of offers.slice(0,4)){await click(`[data-companion-hire="${o.id}"]`);}
 assert.ok(await read(`document.querySelector('[data-companion-hire="${offers[4].id}"]').disabled`));
 await b.press('Escape');await wait(150);assert.equal(await read("document.querySelectorAll('.companion-frame').length"),4);
 for(const [w,h] of [[2024,900],[1280,720]]){await b.resize(w,h);await wait(250);await b.press('u');await wait(250);for(const tab of ['offers','team']){await read(`document.querySelector('[data-companion-tab="${tab}"]').click()`);await wait(200);await bounds('desktop '+w+'x'+h+' '+tab+' (4 Söldner)');await b.screenshot(dir+'/desktop-'+w+'-'+tab+'4.jpg');}await b.press('Escape');await wait(150);}await b.resize(2024,900);await wait(200);
 await b.screenshot(dir+'/desktop-hud.jpg');await click(`[data-companion-select="${c}"]`);assert.equal(await read('g.friend?.ref?.id'),c);await click('[data-companion-manage=""]');assert.ok(await read("!!document.querySelector('[data-companion-scope]')"));
 pass('Dismissal, expiry, empty state, affordability, four-companion limit and HUD entry');
 await b.press('Escape');await b.press('u');await wait(150);assert.ok(await read("!!document.querySelector('.popup-companions')"));
 await b.press('Tab');assert.ok(await read("!!document.activeElement.closest('.popup-companions')"));await b.press('Escape');
 /* Ein Ziel (E-65): das erste Esc wählt den Söldner ab, das zweite öffnet das Spielmenü */await b.press('Escape');await wait(100);await b.press('Escape');await wait(100);await click('[data-shell="companions"]');assert.ok(await read("!!document.querySelector('.popup-companions')"));pass('Keyboard shortcut U, dialog keyboard navigation and game-menu entry');
 await b.resize(390,844);await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await fixture(true);
 await click('#touchInteract',true);await bounds('touch portrait offers');await b.screenshot(dir+'/touch-board.jpg');
 /* Handy: kein Hover – ein Tipp auf den Kartenkopf zeigt Beschreibung und Rolle als Detail */await click(`[data-offer="${a}"] header`,true);await wait(200);assert.ok(await read("[...document.querySelectorAll('.game-popup')].some(p=>p.offsetParent&&p.textContent.includes('Schutz hält Gegner fern'))"),'touch info tap shows the description');await run("document.querySelectorAll('.popup-detail [data-window-close]').forEach(x=>x.click())");await wait(150);
 await click(`[data-companion-hire="${a}"]`,true);await click('[data-companion-tab="team"]',true);await click('[data-companion-order="stay"]',true);assert.equal(await read('g.companions[0].order'),'stay');
 await click('[data-companion-stance="passive"]',true);await bounds('touch portrait team');await b.screenshot(dir+'/touch-team.jpg');
 assert.ok(await read("[...document.querySelectorAll('.popup-companions button,.popup-companions select')].filter(e=>e.getClientRects().length).every(e=>{const r=e.getBoundingClientRect();return r.width>=43.9&&r.height>=43.9;})"));
 await click(`[data-companion-dismiss="${a}"]`,true);assert.equal((await read('window.mertloch.companions.list()')).length,0);
 await click('[data-companion-tab="offers"]',true);await b.resize(844,390);await wait(300);await bounds('touch landscape offers');await b.screenshot(dir+'/touch-landscape.jpg');
 /* volle Truppe am Handy, hoch und quer: kein Scrollen, alle Ziele 44 px */await run("g.rpg.coins=900;for(const o of window.mertloch.companions.offers().slice(0,4))g.hireCompanion(o.def?.id||o.id,{free:true});");await wait(250);
 for(const [w,h] of [[844,390],[390,844]]){await b.resize(w,h);await wait(300);for(const tab of ['offers','team']){await read(`document.querySelector('[data-companion-tab="${tab}"]').click()`);await wait(250);await bounds('touch '+w+'x'+h+' '+tab+' (4 Söldner)');assert.ok(await read("[...document.querySelectorAll('.popup-companions button,.popup-companions select')].filter(e=>e.getClientRects().length).every(e=>{const r=e.getBoundingClientRect();return r.width>=43.9&&r.height>=43.9;})"),'44 px '+w+'x'+h+' '+tab);await b.screenshot(dir+'/touch-'+w+'-'+tab+'4.jpg');}}pass('Touch hire, orders, stance, dismissal, 44px controls, portrait and landscape bounds');
 assert.deepEqual(b.errors,[]);writeFileSync(dir+'/report.json',JSON.stringify({checks,errors:b.errors},null,2));
}catch(error){console.error("CHECK FAILED",error);try{await b.screenshot(dir+'/failure.jpg');console.log(await read(`({start:document.querySelector('#startScreen')?.hidden,body:document.body.className,active:document.activeElement?.outerHTML,text:document.querySelector('#popupLayer')?.textContent,errors:${JSON.stringify(b.errors)}})`));}catch{}throw error;}finally{await b.close();}
