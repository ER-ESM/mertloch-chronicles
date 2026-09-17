// HUD, Fenster und echte Touch-Eingaben in einem isolierten Headless-Browser prüfen.
// node scripts/basis-check.mjs
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const url=process.argv[2]||'http://localhost:4198/';
const port=Number(process.argv[3]||process.env.CDP_PORT||9338);
const dir='combat-review/basis';
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

await boot();const b=await browser(),checks=[];
try{
 await b.send('Network.enable');await b.send('Network.setBypassServiceWorker',{bypass:true});
 for(const [width,height,touch] of [[2024,900,false],[1440,900,false],[390,844,true],[320,568,true],[844,390,true],[667,375,true]]){
  const label=width+'x'+height;await b.resize(width,height);await b.send('Emulation.setTouchEmulationEnabled',{enabled:touch,maxTouchPoints:1});
  const {identifier}=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'${touch?'touch':'desktop'}'}));localStorage.setItem('mertloch-chronicles-v2-56753-72-1',JSON.stringify({version:1,classId:'kevin',level:11,tutorial:{version:1,step:8,completed:true}}));`});
  await b.open(url);assert.ok(await b.evaluate(`new Promise(r=>{const t=setInterval(()=>{if(window.game){clearInterval(t);r(true)}},100);setTimeout(()=>{clearInterval(t);r(false)},20000)})`));await b.send('Page.removeScriptToEvaluateOnNewDocument',{identifier});
  await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(e=>e.click());game.tutorial.completed=true;game.enemies=[];game.tick=()=>{};`);await wait(400);
  const hud=await b.evaluate(`(()=>{const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,right:r.right}},panel=box('.player-panel');return{panel,runes:box('.rune-row'),top:box('.touch-topline'),controls:[...document.querySelectorAll('#touchActions button,#touchUtility button')].filter(e=>e.getBoundingClientRect().width).map(e=>({id:e.id||e.dataset.skill,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))}})()`);
  assert.ok(hud.runes.bottom<=hud.panel.bottom,label+' resource row stays inside HUD');if(touch)for(const c of hud.controls)assert.ok(c.w>=44&&c.h>=44,label+' touch size '+c.id);
  if(!touch)assert.ok(await b.evaluate(`document.querySelector('#interact').getBoundingClientRect().bottom<document.querySelector('#specialActions').getBoundingClientRect().top`),label+' interaction prompt clears special actions');
  await b.shot(label+'-hud.png');console.log(label+' HUD '+JSON.stringify(hud));
  const panels=[];
  for(const key of ['i','c','k','n','j','b','m','h']){
   await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(e=>e.click());document.dispatchEvent(new KeyboardEvent('keydown',{key:'${key}',bubbles:true}));`);await wait(250);
   const result=await b.evaluate(`(()=>{const p=[...document.querySelectorAll('.game-popup')].filter(e=>e.getBoundingClientRect().width).at(-1);if(!p)return null;const r=p.getBoundingClientRect(),body=p.querySelector('.popup-body');return{key:'${key}',x:r.x,y:r.y,w:r.width,h:r.height,overflow:body.scrollWidth-body.clientWidth,bodyHeight:body.clientHeight,bodyScroll:body.scrollHeight,closeAccessible:(()=>{const c=p.querySelector('[data-window-close]'),r=c.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('[data-window-close]')===c})()}})()`);panels.push(result);assert.ok(result&&result.bodyHeight>=130,label+' readable panel '+key);assert.ok(result.overflow<=1,label+' horizontal overflow '+key);assert.ok(result.x>=0&&result.x+result.w<=width&&result.y+result.h<=height,label+' panel fits '+key);assert.ok(result.closeAccessible,label+' close button reachable '+key);
   if(key==='i'||key==='c')await b.shot(label+'-'+key+'.png');
  }
  console.log(label+' PANELS '+JSON.stringify(panels));checks.push({label,hud,panels});
  if(width===390){
   await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(e=>e.click())`);
   const center=async selector=>{await b.evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);await wait(100);const p=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,width:r.width,height:r.height,hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest(${JSON.stringify(selector)})===e}})()`);assert.ok(p.width&&p.height&&p.hit,'touch target reachable: '+selector+' '+JSON.stringify(p));return{x:p.x,y:p.y};};
   async function tap(selector,hold=0){const p=await center(selector);await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});if(hold)await wait(hold);await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(220);}
   await tap('#touchConfigure');assert.ok(await b.evaluate('!!document.querySelector("[data-touch-edit-slot]")'));
   await tap('[data-touch-edit-slot="0"]');await tap('[data-touch-bind="strike"]');assert.equal(await b.evaluate('window.mertloch.state().mobile.slots[0]'),'strike');
   await tap('[data-window-close]');await tap('[data-touch-skill="strike"]',650);assert.ok(await b.evaluate('!!document.querySelector(".popup-touchhelp")'));await tap('[data-window-close]');
   const p=await center('#touchStick');await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x+30,y:p.y}]});assert.ok(await b.evaluate('game.touchMove?.x>0'));await b.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});assert.equal(await b.evaluate('game.touchMove'),null);
   await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x+30,y:p.y}]});await b.evaluate(`window.dispatchEvent(new Event('blur'))`);assert.equal(await b.evaluate('game.touchMove'),null);await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await b.evaluate(`game.casting={id:'burst',name:'Test',remaining:99,total:99};`);await wait(220);assert.equal(await b.evaluate('document.querySelector("#touchCancelAim").hidden'),false);await tap('#touchCancelAim');assert.equal(await b.evaluate('game.casting'),null);
   await b.evaluate(`game.aiming='ground';game.aimPoint={...game.player};`);await wait(220);await tap('#touchCancelAim');assert.equal(await b.evaluate('game.aiming'),null);
   await b.evaluate(`(async()=>{const {makeEnemy}=await import('./encounters.js');const e=makeEnemy({x:game.player.x+500,y:game.player.y},999,{hp:10000});game.enemies=[e];game.target=e;game.gcd=0;game.cooldowns.strike=0;game.action('strike')})()`);await wait(220);assert.match(await b.evaluate('document.querySelector("#toast").textContent'),/Zu weit entfernt/);
   console.log('PASS real touch binding, long-press help, joystick cancellation, cast/aim cancellation and range feedback');
  }
 }
 assert.deepEqual(b.errors,[]);writeFileSync(join(dir,'checks.json'),JSON.stringify(checks,null,2));
}catch(error){await b.shot('failure.png');throw error;}finally{b.close();for(const child of children)child.kill();}
/** Server und Browser für diese Prüfung starten. */
async function boot(){
 if(!await reachable(url,2)){
  const port4198=new URL(url).port||'4198';
  children.push(spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port4198},stdio:'ignore'}));
  assert.ok(await reachable(url),'Server antwortet nicht auf '+url);
 }
 try{await fetch('http://127.0.0.1:'+port+'/json/version');return;}catch{}
 const exe=CHROMES.find(p=>existsSync(p));
 assert.ok(exe,'Kein Chrome/Edge gefunden. CHROME=<pfad> setzen.');
 const profile=join(tmpdir(),'basis-'+Date.now());
 children.push(spawn(exe,['--remote-debugging-port='+port,'--user-data-dir='+profile,'--headless=new',
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
