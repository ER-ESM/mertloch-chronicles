import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:9389});
const dir='visual-review/no-escalation';mkdirSync(dir,{recursive:true});
try{
 for(const touch of [false,true]){
  await b.resize(touch?390:1366,touch?844:768);await b.send('Emulation.setTouchEmulationEnabled',{enabled:touch,maxTouchPoints:1});
  for(const cls of ['dieter','baerbel','kevin']){
   const init=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.clear();localStorage.setItem('mertloch-chronicles-v2-56753-72-1',JSON.stringify({version:1,worldKey:'v2-56753-72-1',classId:'${cls}',level:30,tutorial:{version:1,step:8,completed:true}}));localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'${touch?'touch':'desktop'}'}));`});
   await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',init);await b.evaluate(`game.paused=true;document.querySelectorAll('[data-window-close]').forEach(e=>e.click());`);await wait(250);
   const state=await b.evaluate(`(()=>{const p=document.querySelector('.player-panel'),r=p.getBoundingClientRect(),e=p.querySelector('.energy').getBoundingClientRect();return{hasCombo:!!document.querySelector('#runes,.rune-row,#buffText'),hasPoints:'runes' in game.player,text:p.textContent,energyFits:e.bottom<=r.bottom,mechanic:!!document.querySelector('#classMechanicArt'),inViewport:r.x>=0&&r.right<=innerWidth&&r.y>=0&&r.bottom<=innerHeight};})()`);
   assert.equal(state.hasCombo,false);assert.equal(state.hasPoints,false);assert.doesNotMatch(state.text,/Eskalation|Pegel|Glanz|Druck/);assert.ok(state.energyFits&&state.inViewport&&state.mechanic);
   const tip=await b.evaluate(`import('./combat-ui.js').then(m=>m.skillTooltip(game,'burst',${touch}))`);assert.doesNotMatch(tip,/Aufbaupunkt|pro Punkt|Eskalation|undefined|NaN/);
   await b.screenshot(dir+'/'+cls+'-'+(touch?'touch':'desktop')+'.png');console.log('PASS '+cls+' '+(touch?'touch':'desktop')+': no shared counter; own mechanic and skill tooltip intact');
  }
 }
 assert.deepEqual(b.errors,[]);
}finally{await b.close();}
