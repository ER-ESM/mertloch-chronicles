// Real layout, equipment interactions and character preview in an isolated Chrome profile.
// node scripts/character-sheet-check.mjs [url]
import assert from 'node:assert/strict';
import {existsSync,mkdirSync,mkdtempSync,writeFileSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {browser,wait} from './browser-polish.mjs';
import {makeProfile,disposeChrome,LEAN_ARGS} from './chrome-profile.mjs';
const url=process.argv[2]||'http://localhost:4181/',port=Number(process.env.CDP_PORT||9346),dir='visual-review/character-sheet';
mkdirSync(dir,{recursive:true});
const chrome=process.env.CHROME||['C:/Program Files/Google/Chrome/Application/chrome.exe','/usr/bin/google-chrome','/usr/bin/chromium'].find(existsSync);
const profile=makeProfile('mertloch-sheet-'),proc=spawn(chrome,['--headless=new',...LEAN_ARGS,'--remote-debugging-port='+port,'--user-data-dir='+profile,'--no-first-run','--hide-scrollbars','about:blank'],{stdio:'ignore'});
let b;const report=[];
try{
 for(let i=0;i<60;i++){try{await fetch('http://127.0.0.1:'+port+'/json');break;}catch{await wait(200);}}
 b=await browser({port});await b.send('Network.enable');await b.send('Network.setBypassServiceWorker',{bypass:true});
 for(const [name,w,h,touch] of [['desktop',2024,900,false],['laptop',1280,800,false],['phone',390,844,true],['small',320,740,true],['landscape',844,390,true]]){
  await b.resize(w,h);await b.send('Emulation.setTouchEmulationEnabled',{enabled:touch,maxTouchPoints:5});
  const {identifier}=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'${touch?'touch':'desktop'}'}));localStorage.removeItem('mertloch-popup-positions');`});
  await b.goto(url);await b.send('Page.removeScriptToEvaluateOnNewDocument',{identifier});
  if(touch)await b.evaluate(`for(const [k,v] of Object.entries(${JSON.stringify(w>h?{left:47,right:47,top:0,bottom:21}:{left:0,right:0,top:47,bottom:34})}))document.body.style.setProperty('--safe-'+k,v+'px')`);
  await b.click('.game-menu-rail [data-panel="person"]');await wait(400);
  const state=await b.evaluate(`(()=>{const q=s=>document.querySelector(s),box=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};},root=q('.equipment-grid'),stage=q('.body-equipment'),canvas=q('.gear-doll canvas');return{panel:box(q('.popup-person')),root:box(root),stage:box(stage),art:box(canvas),scrollWidth:root.scrollWidth,cells:[...root.querySelectorAll('.gear-cell')].map(e=>({slot:e.dataset.equipmentSlot,...box(e.querySelector('button')),label:box(e.querySelector('small'))})),canvasVisible:getComputedStyle(q('.gear-doll')).display!=='none',canTurn:!q('[data-preview-turn]').closest('[aria-hidden=true]'),painted:canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data.some((v,i)=>i%4===3&&v>0)};})()`);
  assert.equal(state.cells.length,16,name+' all equipment slots');assert.ok(state.canvasVisible&&state.painted,name+' visible character');assert.ok(state.art.h>=300,name+' full-height preview');assert.ok(state.canTurn,name+' accessible controls');
  assert.ok(state.scrollWidth<=state.root.w+1,name+' no horizontal overflow');assert.ok(state.panel.x>=0&&state.panel.right<=w+1,name+' panel within viewport');
  const by=id=>state.cells.find(c=>c.slot===id);for(const [upper,lower] of [['head','neck'],['neck','shoulders'],['shoulders','body'],['body','wrists'],['wrists','hands'],['hands','waist'],['waist','legs'],['legs','feet']])assert.ok(by(upper).y<by(lower).y,name+' body order '+upper+'/'+lower);
  for(const [i,a] of state.cells.entries()){
   assert.ok(a.w>=44&&a.h>=44,name+' slot target '+a.slot);assert.ok(a.x>=state.root.x-1&&a.right<=state.root.right+1,name+' slot bounds '+a.slot);
   for(const c of state.cells.slice(i+1))assert.ok(!(a.x<c.right&&a.right>c.x&&a.y<c.bottom&&a.bottom>c.y),name+' overlapping slots '+a.slot+'/'+c.slot);
  }
  await b.screenshot(dir+'/'+name+'.png');
  if(name==='desktop'){
   const p=state.panel,{data}=await b.send('Page.captureScreenshot',{format:'png',clip:{x:p.x,y:p.y,width:p.w,height:p.h,scale:1}});
   writeFileSync(dir+'/desktop-panel.png',Buffer.from(data,'base64'));
  }
  // Inspect a worn item using an actual mouse/touch click, even after scrolling a small window.
  const interact=async selector=>{await b.evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);await wait(150);const p=await b.evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);if(touch){await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}else{await b.send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...p});await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...p});}await wait(200);};
  await interact('[data-equipped="body"]');assert.ok(await b.evaluate(`!!document.querySelector('.popup-detail [data-unequip]')`),name+' inspect chest');
  if(name==='desktop'||name==='phone'){
   const item=(await b.state()).rpg.equipment.body;await interact('[data-unequip="body"]');assert.equal((await b.state()).rpg.equipment.body,null,name+' unequip');
   await b.click('.game-menu-rail [data-panel="bag"]');await wait(150);await interact('[data-item="'+item+'"]');await interact('[data-equip="'+item+'"][data-equip-slot="body"]');assert.equal((await b.state()).rpg.equipment.body,item,name+' equip again');
   await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(e=>e.click())`);await b.click('.game-menu-rail [data-panel="person"]');await wait(200);
  }else await b.click('.popup-detail [data-window-close]');
  const before=await b.evaluate(`document.querySelector('.gear-doll canvas').toDataURL()`);await interact('[data-preview-turn]');assert.notEqual(await b.evaluate(`document.querySelector('.gear-doll canvas').toDataURL()`),before,name+' turn character');
  await b.evaluate(`document.querySelector('.gear-footer').scrollIntoView({block:'center'})`);await wait(150);await b.screenshot(dir+'/'+name+'-weapons.png');
  await interact('[data-equipped="weapon"]');assert.ok(await b.evaluate(`!!document.querySelector('.popup-detail [data-unequip]')`),name+' inspect weapon');
  if(name==='desktop'){
   await b.click('.popup-detail [data-window-close]');
   for(const member of ['baerbel','kevin','dieter']){
    await interact('[data-rpg-clan]');await b.click('[data-member-wear="'+member+'"]');assert.equal((await b.state()).classId,member);await b.click('.game-menu-rail [data-panel="person"]');await wait(250);
    const frames=new Set();for(let i=0;i<4;i++){frames.add(await b.evaluate(`document.querySelector('.gear-doll canvas').toDataURL()`));await b.click('[data-preview-turn]');}
    assert.equal(frames.size,4,member+' has four working preview directions');await b.screenshot(dir+'/class-'+member+'.png');
   }
  }
  report.push({name,...state});console.log('PASS '+name);
 }
 assert.equal(b.errors.length,0,JSON.stringify(b.errors));writeFileSync(dir+'/checks.json',JSON.stringify(report,null,2));
}finally{b?.close();disposeChrome(proc,profile);}
