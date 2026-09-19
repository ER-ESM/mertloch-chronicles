// Current Clanbook regression suites. Each run owns its Chrome profile and optional server.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {browserSession,wait} from './browser-session.mjs';
export async function runUI(suites=['navigation','inventory','classes','combat','layout']){
 const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:Number(process.env.CDP_PORT||9372)}),dir='visual-review/ui-regression',checks=[];
 mkdirSync(dir,{recursive:true});
 const pass=name=>{checks.push(name);console.log('PASS '+name);};
 const state=()=>b.state(),read=expression=>b.evaluate(expression);
 async function fixture(save={},touch=false){
  const data={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:11,trainingXp:11000,tutorial:{version:1,step:8,completed:true},...save};
  const script=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(data))});localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'${touch?'touch':'desktop'}'}));`});
  await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',script);await wait(200);await read(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click())`);
 }
 async function point(selector){await read(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);await wait(100);return read(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);}
 async function click(selector,{right=false,touch=false}={}){
  await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:2,y:2});
  // The intentional tooltip grace period lets players cross into linked explanations.
  for(let i=0;i<12&&await read(`!document.querySelector('#itemTooltip').classList.contains('hidden')`);i++)await wait(35);
  const p=await point(selector);if(!touch){await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',...p});await wait(50);}
  assert.ok(await read(`!!document.elementFromPoint(${p.x},${p.y})?.closest(${JSON.stringify(selector)})`),'unobstructed '+selector);
  if(touch){await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  else for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,...p,button:right?'right':'left',clickCount:1});await wait(120);
 }
 async function panel(id){const touch=await read(`document.body.classList.contains('touch-mode')`);if(touch&&!await read(`!!document.querySelector('[data-book-tab]')`)){await click('#touchMenu',{touch:true});await click('[data-game-book]',{touch:true});}const selector=await read(`document.querySelector('[data-book-tab="${id}"]')?'[data-book-tab="${id}"]':'.game-menu-rail [data-panel="${id}"]'`);await click(selector,{touch});}
 async function hover(selector){const p=await point(selector);await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',...p});await wait(100);assert.ok(await read(`!document.querySelector('#itemTooltip').classList.contains('hidden')`));}
 async function drag(from,to){const a=await point(from),z=await point(to);await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',...a});await b.send('Input.dispatchMouseEvent',{type:'mousePressed',...a,button:'left',clickCount:1});for(let i=1;i<=16;i++){await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:a.x+(z.x-a.x)*i/16,y:a.y+(z.y-a.y)*i/16,buttons:1,button:'left'});await wait(25);}await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',...z,button:'left',clickCount:1});await wait(150);}
 async function persist(){await read(`window.dispatchEvent(new Event('pagehide'))`);await b.goto(b.url);await wait(200);}
 try{
  await b.send('Network.enable');await b.send('Network.setBypassServiceWorker',{bypass:true});
  // Keep reload/persistence checks isolated too; the PWA suite owns offline installation.
  await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'delete Navigator.prototype.serviceWorker;'});
  if(suites.includes('navigation')){
   await fixture();await panel('bag');await panel('person');assert.deepEqual((await state()).popups.map(p=>p.id),['person']);
   for(const id of ['bag','person','quest','map','guide']){await panel(id);assert.deepEqual((await state()).popups.map(p=>p.id),[id]);const before=await state();await b.hold('s',300);const after=await state();assert.equal(after.paused,false);assert.ok(after.time>before.time);assert.ok(Math.hypot(after.player.x-before.player.x,after.player.y-before.player.y)>1);}
   await panel('person');await click('[data-equipped="body"]');assert.ok((await state()).popups.some(p=>p.id==='detail'));await click('.popup-detail [data-window-close]');assert.deepEqual((await state()).popups.map(p=>p.id),['person']);await b.press('Escape');assert.equal((await state()).popups.length,0);
   pass('one Clanbook, tab navigation, world movement and detail return');
  }
  if(suites.includes('inventory')){
   await fixture({rpg:{inventory:[{id:'regenjacke',count:1},{id:'brezel',count:3},{id:'wasser',count:2},{id:'festivalstiefel',count:1}]}});await panel('bag');
   await hover('[data-item="regenjacke"]');assert.match(await read(`document.querySelector('#itemTooltip').textContent`),/Regenjacke/);
   await click('[data-item="regenjacke"]',{right:true});assert.equal((await state()).rpg.equipment.body,'regenjacke');
   await panel('person');await click('[data-equipped="body"]');await click('[data-unequip="body"]');assert.equal((await state()).rpg.equipment.body,null);await b.press('Escape');await panel('bag');
   await click('[data-item="regenjacke"]');await click('[data-equip="regenjacke"][data-equip-slot="body"]');assert.equal((await state()).rpg.equipment.body,'regenjacke');await b.press('Escape');await panel('bag');
   await read('game.player.hp=100');await click('[data-item="brezel"]');await click('[data-use="brezel"]');assert.ok((await state()).player.hp>100);assert.ok((await state()).rpg.inventory.find(i=>i.id==='brezel').count<3);await b.press('Escape');await panel('bag');
   await click('[data-bag-search]');await b.send('Input.insertText',{text:'wasser'});const p=(await state()).player;await b.hold('d',200);assert.ok(Math.hypot((await state()).player.x-p.x,(await state()).player.y-p.y)<2);assert.deepEqual(await read(`[...document.querySelectorAll('[data-item]:not([hidden])')].map(e=>e.dataset.item)`),['wasser']);
   await persist();assert.equal((await state()).rpg.equipment.body,'regenjacke');pass('physical equip/unequip, consumables, search keyboard isolation and persistence');
   await fixture({rpg:{inventory:Array.from({length:24},(_,i)=>({id:i===3?'regenjacke':'flasche',count:1}))}});await panel('bag');await click('[data-item="regenjacke"]',{right:true});assert.equal((await state()).rpg.inventory.length,24);assert.equal((await state()).rpg.equipment.body,'regenjacke');
   await read(`game.settings.autoLoot=false;game.rpg.loot=[{id:'test',x:game.player.x,y:game.player.y,coins:8,items:[{id:'kabel',count:2}]}]`);await b.press('f');await click('[data-loot-coins]');assert.equal((await state()).rpg.coins,8);await click('[data-take-loot]');assert.equal((await state()).rpg.loot[0].items[0].count,2);pass('full inventory swap and partial loot preservation');
  }
  if(suites.includes('classes')){
   const icons=[];
   for(const classId of ['dieter','baerbel','kevin']){
    await fixture({classId});await b.press('k');assert.deepEqual((await state()).popups.map(p=>p.id),['person']);
    const images=await read(`[...document.querySelectorAll('[data-book-skill] canvas')].map(c=>c.toDataURL())`);assert.equal(images.length,(await state()).skills.length);assert.equal(new Set(images).size,images.length);icons.push(...images);
    const specs=await read(`[...document.querySelectorAll('[data-spec]')].map(e=>e.dataset.spec)`);assert.equal(specs.length,3);
    for(const spec of specs){await click('[data-spec="'+spec+'"]');const nodes=await read(`[...document.querySelectorAll('[data-talent]')].map(e=>e.dataset.talent)`);assert.equal(nodes.length,30);await click('[data-talent="'+nodes.at(-1)+'"]');assert.equal((await state()).rpg.talents.learned.length,0);for(const node of nodes.filter((_,i)=>i%3===0))await click('[data-talent="'+node+'"]');const s=await state();assert.equal(s.rpg.talents.learned.length,10);for(const skill of s.skills.filter(x=>x.talent&&s.rpg.talents.learned.includes(x.talent))){assert.ok(s.unlocked.includes(skill.id));assert.ok(s.actionBar.includes(skill.id));}}
    await persist();assert.equal((await state()).rpg.talents.learned.length,10);pass(classId+': three trees, 90 choices with ten learned talents, granted skills and persistence');
   }
   assert.equal(new Set(icons).size,icons.length);
   await fixture();await b.press('k');await drag('[data-book-skill="buff"]','#actionBar [data-action-slot="8"]');assert.equal((await state()).actionBar[8],'buff');await b.press('9');assert.ok((await state()).buffs.remaining>0);await persist();assert.equal((await state()).actionBar[8],'buff');pass('native skill drag to action bar and persistence');
  }
  if(suites.includes('combat')){
   await fixture();await read(`(async()=>{const {spawnArena}=await import('./arena.js');spawnArena(game,{kind:'boar',count:1,dummy:true});game.target=game.enemies.find(e=>e.arena)})()`);assert.equal((await state()).autoAttack.enabled,false);await b.press('1');assert.equal((await state()).autoAttack.enabled,true);await wait(1600);assert.ok(await read('game.arenaStats.damage>0'));await b.press('1');assert.equal((await state()).autoAttack.enabled,false);
   await b.press('k');await hover('[data-book-skill="auto"]');assert.ok(await read(`document.querySelector('[data-book-skill="auto"] canvas').getContext('2d').getImageData(0,0,64,64).data.some((v,i)=>i%4===3&&v)`));await b.press('Escape');await b.press('1');await b.press('Escape');assert.equal((await state()).autoAttack.enabled,false);pass('selection, autoattack toggle, escape and skill icons');
  }
  if(suites.includes('layout')){
   for(const [name,width,height,touch,hand] of [['desktop',1440,1000,false,'right'],['phone',390,844,true,'right'],['small',320,740,true,'right'],['landscape',844,390,true,'right'],['landscape-left',844,390,true,'left']]){
    await b.resize(width,height);await b.send('Emulation.setTouchEmulationEnabled',{enabled:touch,maxTouchPoints:5});await fixture({tutorial:{version:1,step:3,completed:false}},touch);
    if(touch)await read(`document.body.dataset.touchHand='${hand}';for(const [k,v] of Object.entries(${JSON.stringify(width>height?{left:47,right:47,top:0,bottom:21}:{left:0,right:0,top:47,bottom:34})}))document.body.style.setProperty('--safe-'+k,v+'px')`);
    await wait(200);const tutorial=await read(`(()=>{const g=document.querySelector('#tutorialGuide'),a=g.querySelector('[data-tutorial-collapse]'),b=g.querySelector('[data-tutorial-help]'),box=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};return{guide:box(g),a:box(a),b:box(b),styled:[a,b].every(e=>e.classList.contains('outline-button')),collapsed:g.classList.contains('collapsed')}})()`);
    assert.ok(tutorial.styled);for(const r of [tutorial.a,tutorial.b])assert.ok(r.w>=44&&r.h>=44);assert.ok(tutorial.guide.x>=0&&tutorial.guide.right<=width+1);
    if(touch){assert.ok(tutorial.a.x-tutorial.b.right>=8);assert.ok(tutorial.collapsed);await click('[data-tutorial-collapse]',{touch:true});assert.equal(await read(`document.querySelector('[data-tutorial-collapse]').getAttribute('aria-expanded')`),'true');await click('[data-tutorial-collapse]',{touch:true});await b.click('#touchTarget');await wait(250);assert.equal(await read(`(()=>{const a=document.querySelector('#tutorialGuide').getBoundingClientRect(),b=document.querySelector('#targetPanel').getBoundingClientRect();return b.width>0&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top})()`),false);}
    if(touch)assert.equal(await read(`(()=>{const a=document.querySelector('#tutorialGuide').getBoundingClientRect();return [...document.querySelectorAll('#touchUtility button,#touchActions button,#touchStick')].some(el=>{const b=el.getBoundingClientRect();return b.width>0&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top})})()`),false,'tutorial must leave movement and action controls clear');
    await b.screenshot(dir+'/'+name+'-tutorial.png');await click('[data-tutorial-help]',{touch});assert.ok((await state()).popups.some(p=>p.id==='dialog'));await b.press('Escape');
    for(const id of ['person','bag','quest','map','guide']){await panel(id);const box=await read(`(()=>{const el=document.querySelector('.popup-${id}'),r=el.getBoundingClientRect(),body=el.querySelector('.popup-body');return{x:r.x,right:r.right,y:r.y,bottom:r.bottom,overflow:body.scrollWidth-body.clientWidth}})()`);assert.ok(box.x>=-1&&box.right<=width+1&&box.y>=-1&&box.bottom<=height+1,JSON.stringify({name,id,box}));if(box.overflow>=2){console.log(await read(`(()=>{const b=document.querySelector('.popup-${id} .popup-body'),r=b.getBoundingClientRect();return [...b.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().right>r.right-5).map(e=>({tag:e.tagName,cls:e.className,right:e.getBoundingClientRect().right,body:r.right})).slice(0,15)})()`));await b.screenshot(dir+'/'+name+'-overflow.png');}assert.ok(box.overflow<2,JSON.stringify({name,id,box}));}
    await b.screenshot(dir+'/'+name+'-book.png');pass(name+': tutorial controls, target clearance and five Clanbook tabs');
   }
  }
  assert.deepEqual(b.errors,[]);writeFileSync(dir+'/checks-'+suites.join('-')+'.json',JSON.stringify({checks,errors:b.errors},null,2));
 }finally{b.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await runUI();
