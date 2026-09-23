// Desktop- und Touch-Eingaben sowie Baumtransparenz im echten Browser. Startet einen isolierten Headless-Browser.
// node scripts/combat-integration-check.mjs
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {join} from 'node:path';
import {makeProfile,disposeChrome,LEAN_ARGS} from './chrome-profile.mjs';

const url=process.argv[2]||'http://localhost:4197/';
const port=Number(process.argv[3]||process.env.CDP_PORT||9337);
const dir='combat-review/integration';
mkdirSync(dir,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const children=[];
const CHROMES=[process.env.CHROME,'C:/Program Files/Google/Chrome/Application/chrome.exe',
 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
 '/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean);

async function reachable(target,tries=40){
 for(let i=0;i<tries;i++){try{const r=await fetch(target);if(r.ok||r.status===200)return true;}catch{}await wait(250);}
 return false;
}
/** Server und Browser für diese Prüfung starten. */
async function boot(){
 if(!await reachable(url,2)){
  const port4197=new URL(url).port||'4197';
  children.push(spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port4197},stdio:'ignore'}));
  assert.ok(await reachable(url),'Server antwortet nicht auf '+url);
 }
 try{await fetch('http://127.0.0.1:'+port+'/json/version');return;}catch{}
 const exe=CHROMES.find(p=>existsSync(p));
 assert.ok(exe,'Kein Chrome/Edge gefunden. CHROME=<pfad> setzen.');
 const profile=makeProfile('mertloch-combat-');
 children.push(spawn(exe,['--remote-debugging-port='+port,'--user-data-dir='+profile,'--headless=new',...LEAN_ARGS,
  '--no-first-run','--no-default-browser-check','--disable-gpu','--window-size=2024,900','about:blank'],{stdio:'ignore'}));
 children.at(-1).profile=profile;
 assert.ok(await reachable('http://127.0.0.1:'+port+'/json/version'),'Chrome-Fernsteuerung antwortet nicht auf Port '+port);
}

/** Kleiner CDP-Treiber (wie scripts/akt1b-check.mjs), ohne npm-Paket. */
async function browser(){
 const targets=await (await fetch('http://127.0.0.1:'+port+'/json')).json();
 const target=targets.find(t=>t.type==='page');assert.ok(target,'Keine Browserseite auf Port '+port);
 const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 let serial=0;const pending=new Map(),errors=[];
 ws.onclose=ev=>{for(const cb of pending.values())cb.reject(Error('CDP-Verbindung zu: '+ev.code));pending.clear();};
 ws.onmessage=ev=>{const d=JSON.parse(ev.data);
  if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.text||d.params.exceptionDetails.exception?.description);
  if(d.method==='Runtime.consoleAPICalled'&&d.params.type==='error')errors.push(d.params.args.map(a=>a.value).join(' '));
  if(d.id){const cb=pending.get(d.id);pending.delete(d.id);d.error?cb.reject(Error(JSON.stringify(d.error))):cb.resolve(d.result);}};
 const send=(method,params={})=>new Promise((res,rej)=>{if(ws.readyState!==1){rej(Error('CDP-Verbindung geschlossen'));return;}
  const id=++serial;pending.set(id,{resolve:res,reject:rej});ws.send(JSON.stringify({id,method,params}));});
 await send('Runtime.enable');await send('Page.enable');
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
  if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 return {send,evaluate,errors,close:()=>ws.close(),
  async resize(width,height){await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<800});},
  async open(target){await send('Page.navigate',{url:target});await wait(300);},
  async shot(name){const r=await send('Page.captureScreenshot',{format:'png'});writeFileSync(join(dir,name),Buffer.from(r.data,'base64'));}};
}

await boot();
const b=await browser(),checks=[];
try{
 await b.send('Network.enable');await b.send('Network.setBypassServiceWorker',{bypass:true});
 for(const [label,width,height,touch] of [['desktop',1440,900,false],['mobile',390,844,true],['mobile-landscape',844,390,true]]){
  await b.resize(width,height);await b.send('Emulation.setTouchEmulationEnabled',{enabled:touch,maxTouchPoints:1});
  const {identifier}=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'${touch?'touch':'desktop'}'}));localStorage.setItem('mertloch-chronicles-v2-56753-72-1',JSON.stringify({version:1,classId:'dieter',level:11,tutorial:{version:1,step:8,completed:true}}));`});
  await b.open(url);assert.ok(await b.evaluate(`new Promise(r=>{const t=setInterval(()=>{if(window.game){clearInterval(t);r(true)}},100);setTimeout(()=>{clearInterval(t);r(false)},20000)})`));
  await b.send('Page.removeScriptToEvaluateOnNewDocument',{identifier});
  // Seit dem Anmeldebildschirm (start-screen.js, f408516) liegt vor dem Spiel die Figurenwahl und das Spiel ist pausiert;
  // wie ein Spieler mit dem vorbereiteten Helden „Ins Dorf" gehen (Gast-Weg, falls der Anmeldeschritt davorsteht).
  assert.ok(await b.evaluate(`new Promise(r=>{const t=setInterval(()=>{const s=document.querySelector('#startScreen');if(!s||s.hidden){if(!game.paused){clearInterval(t);r(true);}return;}s.querySelector('[data-start=guest]')?.click();s.querySelector('[data-start=enter]:not([disabled])')?.click();},100);setTimeout(()=>{clearInterval(t);r(false)},10000)})`),label+' start screen passed');
  await b.evaluate(`(async()=>{document.querySelectorAll('[data-window-close]').forEach(b=>b.click());const {makeEnemy}=await import('./encounters.js');const g=window.game;g.tutorial.completed=true;g.keys.clear();g.stopAuto();g.target=null;g.rpg.loot=[];g.events=[];g.moveTo=null;g.path=[];g.world.blocked=()=>false;g.world.lineClear=()=>true;g.player.hp=g.player.maxHp;g.player.inCombat=0;const e=makeEnemy({x:g.player.x+35,y:g.player.y},991,{hp:999999,behavior:'neutral',roamWait:100,attackTimer:100});g.enemies=[e];g.reviewEnemy=e;g.tick=()=>{};})()`);
  await wait(500);
  const spot=await b.evaluate(`(()=>{const v=window.mertloch.state().viewport,r=document.querySelector('#world').getBoundingClientRect(),e=game.reviewEnemy;return{x:r.left+(e.x-v.camera.x+v.width/2)/v.width*r.width,y:r.top+(e.y-10-v.camera.y+v.height/2)/v.height*r.height}})()`);
  async function pointer(x,y,button='left'){
   if(touch){await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
   else{await b.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button,clickCount:1});await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button,clickCount:1});}
   await wait(180);
  }
  await pointer(spot.x,spot.y);assert.equal(await b.evaluate('game.target===game.reviewEnemy'),true,label+' target selection');assert.equal(await b.evaluate('game.autoAttack.enabled'),false,label+' selection remains passive');
  const selector=touch?'[data-touch-skill="auto"]':'#actionBar [data-skill="auto"]';
  const button=await b.evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)}),r=el.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height}})()`);
  assert.ok(button.w>0&&button.h>0&&button.y<height,label+' attack control visible');
  await pointer(button.x,button.y);assert.equal(await b.evaluate('game.autoAttack.enabled'),true,label+' button starts');
  assert.equal(await b.evaluate(`document.querySelector(${JSON.stringify(selector)}).getAttribute('aria-pressed')`),'true');
  await pointer(button.x,button.y);assert.equal(await b.evaluate('game.autoAttack.enabled'),false,label+' button stops');
  if(!touch){
   await pointer(spot.x,spot.y,'right');assert.equal(await b.evaluate('game.autoAttack.enabled'),true);await pointer(spot.x,spot.y,'right');assert.equal(await b.evaluate('game.autoAttack.enabled'),true);
   await b.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await b.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});assert.equal(await b.evaluate('game.autoAttack.enabled'),false);
  }
  // Alpha-Prüfung am echten Baum-Asset; der untere Stamm muss ebenso verblassen wie die Krone.
  const alpha=await b.evaluate(`(async()=>{const {drawTreeOcclusion}=await import('./world-presence.js'),{drawAssetTree}=await import('./asset-art.js');const t={x:100,y:150,size:1,variant:0,type:'oak'},sample=focus=>{const c=document.createElement('canvas').getContext('2d');c.canvas.width=200;c.canvas.height=180;drawTreeOcclusion(c,t,focus,()=>{if(!drawAssetTree(c,t,0))throw Error('Baum-Asset fehlt')});const d=c.getImageData(0,0,200,180).data;let low=0,high=0;for(let y=0;y<180;y++)for(let x=0;x<200;x++){const a=d[(y*200+x)*4+3];if(y>130)low+=a;else high+=a;}return{low,high,restored:c.globalAlpha}};const solid=sample([{x:100,y:160}]),faded=sample([{x:100,y:145}]);return{low:faded.low/solid.low,high:faded.high/solid.high,restored:faded.restored}})()`);
  assert.ok(alpha.low>.24&&alpha.low<.33,label+' lower trunk fades');assert.ok(alpha.high>.24&&alpha.high<.33);assert.equal(alpha.restored,1);
  await b.evaluate(`(()=>{game.stopAuto();game.target=null;game.enemies=[];game.world.trees=[{x:game.player.x,y:game.player.y+8,size:1.3,variant:0,type:'oak'}];})()`);await wait(300);await b.shot(label+'-behind-tree.png');
  checks.push({label,button,alpha,selection:true,toggle:true});
 }
 assert.deepEqual(b.errors,[]);writeFileSync(join(dir,'checks.json'),JSON.stringify(checks,null,2));console.log(JSON.stringify(checks));
}finally{
 b.close();for(const child of children)disposeChrome(child,child.profile);
}
