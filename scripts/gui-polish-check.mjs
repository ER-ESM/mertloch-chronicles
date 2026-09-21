import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/gui-polish/checks';mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:9402}),read=s=>b.evaluate(s),checks=[];
try{
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:30,tutorial:{version:1,step:8,completed:true}};
 const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});localStorage.setItem('mertloch-touch-v1','{"mode":"touch"}');`});
 await b.resize(844,390);await b.goto(b.url);
 await read(`(async()=>{document.querySelectorAll('[data-window-close]').forEach(e=>e.click());game.paused=true;game.hireCompanion('merc-pils-peter',{free:true});game.hireCompanion('merc-radler-rita',{free:true});const {spawnArena}=await import('./arena.js'),{applyMark}=await import('./class-mechanics.js'),{combatStats}=await import('./rpg.js');const [e]=spawnArena(game,{dummy:true});game.target=e;applyMark(game,e,combatStats(game));e.stun=5;game.buffs={...game.skills.find(s=>s.id==='buff'),remaining:8};game.classState.m={hangover:3};})()`);
 for(const [w,h,hand] of (process.argv.includes('--hud-only')?[]:[[844,390,'right'],[844,390,'left'],[568,320,'left'],[568,320,'right'],[390,844,'right'],[320,740,'right']])){
  await b.resize(w,h);await read(`document.body.dataset.touchHand='${hand}';document.body.style.setProperty('--safe-left','12px');document.body.style.setProperty('--safe-right','12px');document.body.style.setProperty('--safe-top','8px');document.body.style.setProperty('--safe-bottom','12px');`);await wait(650);
  const result=await read(`(()=>{const selectors=['.player-panel','#targetPanel','#buffStrip','#debuffStrip','#targetDebuffStrip','#unitGroupDock','#chatWindow','#touchStick','#touchActions','#touchUtility'];return Object.fromEntries(selectors.map(s=>{const e=document.querySelector(s),r=e.getBoundingClientRect();return [s,{x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height,hidden:e.hidden,style:e.style.cssText}]}));})()`);
  await b.screenshot(dir+'/'+w+'x'+h+'-'+hand+'.png');checks.push({w,h,hand,bounds:result});
  const overlap=(a,c)=>Math.min(a.right,c.right)-Math.max(a.x,c.x)>1&&Math.min(a.bottom,c.bottom)-Math.max(a.y,c.y)>1;
  for(const id of ['#buffStrip','#debuffStrip','#targetDebuffStrip','#unitGroupDock']){
   const r=result[id];assert.ok(r.x>=0&&r.y>=0&&r.right<=w&&r.bottom<=h-16,`${w}x${h} ${id} in viewport`);
   for(const other of ['#touchStick','#touchActions','#touchUtility'])assert.equal(overlap(r,result[other]),false,`${w}x${h} ${id} clear of ${other}`);
  }
  assert.equal(overlap(result['#unitGroupDock'],result['#chatWindow']),false,`${w}x${h} group clear of idle chat`);
  console.log(`PASS ${w}x${h} ${hand}: groups, auras, idle chat and combat controls`);
 }
 await b.send('Page.removeScriptToEvaluateOnNewDocument',init);
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-touch-v1','{"mode":"desktop"}');`});
 await read(`localStorage.setItem('mertloch-touch-v1','{"mode":"desktop"}');localStorage.removeItem('mertloch-hud-layouts-v1');`);await b.resize(1440,1000);await b.goto(b.url);
 const rect=selector=>read(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}})()`);
 for(const [id,selector,dx,dy] of [['player','.player-panel',64,160],['chat','#chatWindow',240,80]]){
  await read(`document.querySelectorAll('[data-window-close]').forEach(e=>e.click());game.paused=true;game.hireCompanion('merc-pils-peter',{free:true});`);await wait(350);
  const before=await rect(selector);await b.press('Escape');await read(`document.querySelector('[data-hud-open]').click()`);await wait(250);
  const handle=await rect('[data-hud-handle="'+id+'"]'),p={x:handle.x+25,y:handle.y+20};
  assert.ok(await read(`!!document.elementFromPoint(${p.x},${p.y})?.closest('[data-hud-handle="${id}"]')`),JSON.stringify({id,handle,hit:await read(`document.elementFromPoint(${p.x},${p.y})?.outerHTML.slice(0,250)`)}));
  await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',...p});await b.send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});
  for(let i=1;i<=8;i++){await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:p.x+dx*i/8,y:p.y+dy*i/8,button:'left',buttons:1});await wait(30);}
  await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:p.x+dx,y:p.y+dy,button:'left',clickCount:1});await b.click('[data-hud-save]');await wait(350);
  const moved=await rect(selector);assert.ok(moved.x>before.x+dx-12,JSON.stringify({id,before,handle,moved}));assert.ok(await read(`document.querySelector(${JSON.stringify(selector)}).hasAttribute('data-hud-custom')`));
  await b.goto(b.url);await wait(400);assert.deepEqual(await rect(selector),moved,id+' saved placement survives reload');console.log('PASS '+id+': physical HUD drag and persisted custom position');
 }
 writeFileSync(dir+'/layout.json',JSON.stringify({checks,customHud:true,errors:b.errors},null,2));assert.deepEqual(b.errors,[]);console.log('Saved group/effect stress screenshots and bounds.');
}finally{b.close();}
