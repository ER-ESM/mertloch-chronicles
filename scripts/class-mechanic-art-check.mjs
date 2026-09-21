import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:9391}),dir='visual-review/class-mechanics';mkdirSync(dir,{recursive:true});
try{
 await b.resize(1440,960);
 const save={version:1,worldKey:'v2-56753-72-1',classId:'baerbel',level:30,tutorial:{version:1,step:8,completed:true}};
 const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.clear();localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'desktop'}));`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',init);
 await b.evaluate(`game.paused=true;document.querySelectorAll('[data-window-close]').forEach(e=>e.click());`);
 await b.evaluate(`import('./talents.js').then(m=>m.changeSpec(game,'baerbel-care'))`);
 await b.evaluate(`import('./class-mechanic-art.js').then(m=>m.loadMechanicArt())`);
 assert.equal(await b.evaluate(`import('./class-mechanic-art.js').then(m=>m.mechanicArt.images.size)`),3);
 await b.evaluate(`import('./class-hud.js').then(m=>{game.classState.m={supply:3};m.updateClassHud(game);})`);await wait(150);
 await b.screenshot(dir+'/desktop.png');
 await b.resize(390,844);
 await b.evaluate(`localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'touch'}))`);await b.goto(b.url);
 await b.evaluate(`game.paused=true;document.querySelectorAll('[data-window-close]').forEach(e=>e.click());import('./talents.js').then(m=>m.changeSpec(game,'baerbel-care'))`);
 await b.evaluate(`import('./class-mechanic-art.js').then(m=>m.loadMechanicArt())`);
 await b.evaluate(`import('./class-hud.js').then(m=>{game.classState.m={supply:3};m.updateClassHud(game);})`);await wait(150);
 const bounds=await b.evaluate(`(()=>{const r=document.getElementById('classMechanicArt').getBoundingClientRect();return {x:r.x,right:r.right,top:r.top,bottom:r.bottom};})()`);
 assert.ok(bounds.x>=0&&bounds.right<=390&&bounds.top>=0&&bounds.bottom<=844);
 await b.screenshot(dir+'/touch.png');
 await b.resize(1440,1160);
 const checks=await b.evaluate(`(async()=>{
  const {drawClassHud,classHudState}=await import('./class-hud.js'),{Game}=await import('./engine.js'),{SPEC_MECHANICS}=await import('./content/index.js');
  const root=document.createElement('div');root.id='spriteReview';root.style.cssText='position:fixed;inset:0;z-index:999999;background:#142b23;color:#f0deb6;padding:32px;font-family:Nunito;overflow:auto';
  root.innerHTML='<h1 style="margin:0 0 4px;font-size:28px">Klassenmechaniken</h1><p style="margin:0 0 22px;color:#b2bda0">Neue Sprites · leer / gefüllt · Originalgröße darunter</p>';
  const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(3,440px);gap:24px 20px';root.append(grid);document.body.append(root);
  const specs=['dieter-wall','baerbel-care','kevin-fuse','dieter-brawl','baerbel-feedback','kevin-iron','dieter-brew','baerbel-stage','kevin-hunt'],results=[];
  for(const spec of specs){
   const g=new Game(game.world,{classId:spec.split('-')[0],level:30,rpg:{talents:{spec,learned:[]}}}),s=classHudState(g),card=document.createElement('div');grid.append(card);
   const label=document.createElement('div');label.textContent=s.title;label.style.cssText='font-size:15px;margin:0 0 6px;color:#c5bb98';card.append(label);
   const empty={...s,count:0,left:0,fields:[]},full={...s,count:s.max,left:0,fields:[]};
   if(s.kind==='fields')full.fields=Array.from({length:s.max},(_,i)=>({remaining:12-i*3,visualDuration:20,sort:['weizen','pils','bock'][i]}));
   if(s.kind==='spores')full.count=4;
   if(s.kind==='luck'){full.title='Jackpot';full.last='over';full.left=6;full.total=8;}
   const images=[];
   for(const state of [empty,full]){const cv=document.createElement('canvas');cv.width=440;cv.height=112;cv.style.cssText='display:block;margin-bottom:6px;width:440px;height:112px';card.append(cv);drawClassHud(cv.getContext('2d'),state);images.push(cv.toDataURL());}
   const small=document.createElement('canvas');small.width=440;small.height=112;small.style.cssText='display:block;width:220px;height:56px;margin-top:8px';card.append(small);drawClassHud(small.getContext('2d'),full);
   results.push({spec,distinct:images[0]!==images[1]});
  }return results;
 })()`);
 assert.ok(checks.every(x=>x.distinct));await b.screenshot(dir+'/overview.png');
 await b.evaluate(`document.getElementById('spriteReview').remove()`);
 assert.deepEqual(b.errors,[]);console.log('PASS: 27 sprites loaded, nine empty/full HUDs distinct, desktop and touch fit. '+dir+'/overview.png');
}finally{await b.close();}
