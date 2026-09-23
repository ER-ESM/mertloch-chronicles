import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {browserSession,wait} from './browser-session.mjs';
const dir='visual-review/grafik-20260923';mkdirSync(dir,{recursive:true});
const b=await browserSession({url:process.argv.find(a=>a.startsWith('http')),port:9397,serverPort:4207}),checks=[];
const read=s=>b.evaluate(s),shot=name=>b.screenshot(dir+'/'+name+'.jpg');
async function until(expression){for(let i=0;i<80;i++){if(await read(expression))return;await wait(100);}throw Error('Timeout: '+expression);}
async function stillFits(){
 const r=await read(`(()=>{const img=document.querySelector('.intro-still'),top=document.querySelector('.intro-top').getBoundingClientRect(),bottom=document.querySelector('.intro-bottom').getBoundingClientRect(),film=document.querySelector('.intro-film').getBoundingClientRect(),a=img.getBoundingClientRect(),button=document.querySelector('.intro-skip').getBoundingClientRect();return{loaded:img.complete&&img.naturalWidth===1280&&!img.hidden,fits:a.top>=top.bottom-1&&a.bottom<=bottom.top+1,fullWidth:Math.abs(a.width-film.width)<3,skip:!!document.elementFromPoint(button.x+button.width/2,button.y+button.height/2)?.closest('.intro-skip')}})()`);
 assert.deepEqual(r,{loaded:true,fits:true,fullWidth:true,skip:true});
}
try{
 const save={version:1,worldKey:'v2-56753-72-1',classId:'dieter',level:2,trainingXp:140,tutorial:{version:1,step:8,completed:true},rpg:{version:4,coins:200}};
 const injection=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`delete Navigator.prototype.serviceWorker;localStorage.setItem('mertloch-chronicles-v2-56753-72-1',${JSON.stringify(JSON.stringify(save))});`});
 await b.goto(b.url);await b.send('Page.removeScriptToEvaluateOnNewDocument',injection);await wait(500);
 await read(`document.querySelector('.intro-skip')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());game.enemies=[];`);await wait(6500);
 const assets=await read(`(async()=>{const {contentArt,contentAsset}=await import('./content-art.js');return Object.entries(contentArt.catalog.assets).filter(([,a])=>a.delivery==='2026-09-23').map(([id])=>({id,loaded:!!contentAsset(id)?.image?.complete}));})()`);
 assert.equal(assets.length,12);assert.ok(assets.every(a=>a.loaded));checks.push('12 runtime images loaded');
 await read(`Object.assign(game.player,{x:game.world.base.x,y:game.world.base.y+75});__mertloch.renderer.cameraFocus={x:game.world.base.x,y:game.world.base.y,speed:20};`);await wait(700);await shot('bude-desktop');
 const rubble=await read(`(async()=>{const {baseProps}=await import('./world-prop-ui.js');return baseProps(game.world,{}).map(p=>p.kind)})()`);
 assert.equal(new Set(rubble.filter(id=>id.startsWith('bude-truemmer-'))).size,6);assert.ok(rubble.includes('bude-schild'));checks.push('six distinct ruins and physical sign in the scene');
 await read(`__mertloch.renderer.cameraFocus=null;game.gainXp(280);`);
 await until(`!!document.querySelector('.milestone-level.show .milestone-crest')?.complete`);await wait(250);await shot('levelup');
 checks.push('actual level-up event displays the crest');
 await wait(10500);await b.press('Escape');await wait(250);await shot('unlock');
 assert.ok(await read(`!!Array.from(document.querySelectorAll('.game-menu-actions [data-shell=professions]')).find(el=>getComputedStyle(el,'::before').backgroundImage.includes('ui-unlock-seal'))`));
 await read(`document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);
 for(const phone of [false,true]){
  const name=phone?'phone':'desktop';await b.resize(phone?390:1440,phone?844:900);
  await read(`window.dispatchEvent(new CustomEvent('mertloch-intro'))`);
  await until(`!document.querySelector('.intro-still').hidden&&document.querySelector('.intro-still').complete`);await stillFits();await shot('intro-filmriss-'+name);
  for(let i=0;i<4;i++)await b.press('Enter');
  await until(`document.querySelector('.intro-still').src.includes('intro-maifeld')&&!document.querySelector('.intro-still').hidden`);await stillFits();await shot('intro-maifeld-'+name);
  await b.press('Escape');assert.equal(await read(`document.body.classList.contains('intro-open')`),false);
  checks.push(name+': both intro images fit between captions and skip controls');
 }
 await read(`Object.assign(game.player,game.world.places.kiosk.entrance);game.player.inCombat=0;game.enemies=[];`);await b.press('f');await until(`game.instance?.id==='kiosk'`);
 for(const phone of [false,true]){await b.resize(phone?390:1440,phone?844:900);await wait(500);await shot('kiosk-'+(phone?'phone':'desktop'));}
 await read(`game.navigate({x:180,y:252})`);await until(`game.interaction()?.kind==='leaveKiosk'`);await b.press('f');await until(`!game.instance`);checks.push('kiosk frame renders on desktop/phone and exit stays usable');
 assert.deepEqual(b.errors,[]);writeFileSync(dir+'/result.json',JSON.stringify({checks,assets,errors:b.errors},null,2));console.log(JSON.stringify({checks,errors:b.errors},null,2));
}catch(e){await shot('failure').catch(()=>{});console.error(JSON.stringify({browserErrors:b.errors}));throw e;}finally{b.close();}
