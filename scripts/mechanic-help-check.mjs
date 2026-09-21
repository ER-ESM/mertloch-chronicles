import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:Number(process.env.CDP_PORT||9387)});
const dir='visual-review/mechanic-help';mkdirSync(dir,{recursive:true});
const read=s=>b.evaluate(s);
async function pointer(selector,touch=false){const r=await read(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);assert.ok(await read(`document.elementFromPoint(${r.x},${r.y})?.closest(${JSON.stringify(selector)})!==null`));if(touch){await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[r]});await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}else await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',...r});await wait(150);}
async function fixture(classId,touch=false){const save={version:1,worldKey:'v2-56753-72-1',classId,level:30,tutorial:{version:1,step:8,completed:true}};
 const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.clear();localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'${touch?'touch':'desktop'}'}));`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',init);await read(`game.paused=true;document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);
}
try{
 await b.resize(1366,768);
 for(const cls of ['baerbel','dieter','kevin']){
  await fixture(cls);
  const specs=await read(`import('./talents.js').then(m=>m.classSpecs(game.member.id))`);
  for(const spec of specs){await read(`import('./talents.js').then(m=>{game.player.inCombat=0;Object.assign(game.player,game.world.spawn);m.changeSpec(game,${JSON.stringify(spec)});})`);await wait(250);await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:4,y:4});await pointer('#classMechanicArt');
   const tip=await read(`document.querySelector('#itemTooltip').textContent`);assert.match(tip,/Hauptbaum/);assert.doesNotMatch(tip,/undefined|NaN/);
   if(spec==='baerbel-care'){assert.match(tip,/Landhaus-Löffelkur/);assert.match(tip,/passive Heilprocs füllt keine/);await b.screenshot(dir+'/vorrat-desktop.png');}
   if(spec==='baerbel-feedback'){assert.match(tip,/Pinsel-Piekser/);assert.match(tip,/Sporenwolke/);await b.screenshot(dir+'/schimmel-desktop.png');}
   if(spec==='baerbel-stage'){assert.match(tip,/im Kampf automatisch/);await b.screenshot(dir+'/putzwut-desktop.png');}
   const bounds=await read(`(()=>{const r=document.querySelector('#itemTooltip').getBoundingClientRect();return{top:r.top,bottom:r.bottom};})()`);assert.ok(bounds.top>=0&&bounds.bottom<=768,spec+' tooltip fits');
  }
  console.log('PASS '+cls+': all resource displays explain their triggers and fit the desktop viewport');
 }
 await b.resize(390,844);await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});await fixture('baerbel',true);
 for(const spec of ['baerbel-care','baerbel-stage']){await read(`import('./talents.js').then(m=>m.changeSpec(game,'${spec}'))`);await wait(250);await pointer('#classMechanicArt',true);assert.ok(await read(`!!document.querySelector('.popup-detail .describe-card')`),'touch opens mechanic detail');await b.screenshot(dir+'/'+spec+'-touch.png');await read(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);}
 console.log('PASS touch: tapping Vorrat and Putzwut opens readable details');assert.deepEqual(b.errors,[]);
}finally{await b.close();}
