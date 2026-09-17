// Offline-Start, Service-Worker-Update und Save-Wiederherstellung im isolierten Browser prüfen.
// node scripts/basis-pwa-check.mjs
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,existsSync,readFileSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import http from 'node:http';

const url=process.argv[2]||'http://localhost:4199/mertloch-chronicles/';
const port=Number(process.argv[3]||process.env.CDP_PORT||9339);
const dir='combat-review/basis-pwa';
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

// Serve an isolated build under a Pages-style prefix. Simulated releases never edit repository files.
let release='';
const server=http.createServer((req,res)=>{
 try{const path=new URL(req.url,url).pathname;if(!path.startsWith('/mertloch-chronicles/'))throw Error('scope');const relative=decodeURIComponent(path.slice('/mertloch-chronicles/'.length))||'index.html';if(relative.split('/').includes('..'))throw Error('path');
  let data=readFileSync(join('_site',relative));if(relative==='precache-manifest.js'&&release)data=Buffer.from(data.toString().replace(/"version": "([^"]+)"/,'"version": "$1-'+release+'"'));
  res.writeHead(200,{'Content-Type':relative.endsWith('.js')?'text/javascript':relative.endsWith('.css')?'text/css':relative.endsWith('.html')?'text/html':relative.endsWith('.json')||relative.endsWith('.webmanifest')?'application/json':'application/octet-stream','Cache-Control':'no-store'}).end(data);
 }catch{res.writeHead(404).end();}
});await new Promise(r=>server.listen(4199,'127.0.0.1',r));
await boot();const b=await browser();
async function until(expression,message){for(let i=0;i<240;i++){try{if(await b.evaluate(expression))return;}catch{}await wait(250);}throw Error(message);}
try{
 await b.send('Network.enable');await b.resize(390,844);await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});await b.open(url);
 await until('!!window.game','game start');await until('window.mertloch.state().pwa.offline&&!!navigator.serviceWorker.controller','initial offline cache');
 console.log('PASS install and offline cache');
 await b.evaluate(`(()=>{document.querySelectorAll('[data-window-close]').forEach(e=>e.click());game.tutorial.completed=true;game.rpg.coins=173;game.settings.autoLoot=false;localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'touch',size:'large',layouts:{dieter:{slots:['strike','auto'],learned:game.skills.filter(s=>!s.offGcd||s.auto).map(s=>s.id)}}}));window.dispatchEvent(new Event('pagehide'));})()`);
 const key='mertloch-chronicles-v2-56753-72-1';assert.equal(await b.evaluate(`JSON.parse(localStorage.getItem('${key}')).rpg.coins`),173);
 await b.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});await b.open(url);await until('window.game?.rpg.coins===173','offline save restore');assert.equal(await b.evaluate('game.settings.autoLoot'),false);assert.equal(await b.evaluate('window.mertloch.state().mobile.size'),'large');assert.deepEqual(await b.evaluate('window.mertloch.state().mobile.slots.slice(0,2)'),['strike','auto']);
 await b.shot('offline.png');console.log('PASS cold offline start, progression and touch preferences');
 await b.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});release='basis-update';await b.evaluate('(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update()})()');await until('window.mertloch.state().pwa.update','waiting update');
 await b.evaluate(`game.rpg.coins=231;window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError')};document.querySelector('#updateHint button').click();`);await wait(400);assert.equal(await b.evaluate('game.rpg.coins'),231);assert.equal(await b.evaluate('window.mertloch.state().pwa.update'),true);assert.match(await b.evaluate('document.querySelector("#toast").textContent'),/Update wartet/);
 await b.evaluate(`Storage.prototype.setItem=window.originalSetItem;document.querySelector('#updateHint button').click();`);await until('window.game?.rpg.coins===231&&!window.mertloch.state().pwa.update','updated save restore');assert.deepEqual(await b.evaluate('window.mertloch.state().mobile.slots.slice(0,2)'),['strike','auto']);
 const caches=await b.evaluate('window.caches.keys()');assert.equal(caches.filter(k=>k.startsWith('mertloch-pwa-')).length,1);assert.ok(caches.some(k=>k.endsWith('basis-update')));console.log('PASS failed save blocks update, successful retry preserves progress, release cache replaced');
 // Damage storage after the old page's pagehide save, just before the new app reads it.
 const {identifier}=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`window.expectedBackupCoins=JSON.parse(localStorage.getItem('${key}-previous')).rpg.coins;localStorage.setItem('${key}','{broken');`});await b.open(url);await until('!!window.game','recovery reload');await b.send('Page.removeScriptToEvaluateOnNewDocument',{identifier});assert.equal(await b.evaluate('game.rpg.coins'),await b.evaluate('window.expectedBackupCoins'));assert.match(await b.evaluate('document.querySelector("#toast").textContent'),/Sicherung/);console.log('PASS damaged save recovers last readable backup');
 assert.deepEqual(b.errors,[]);writeFileSync(join(dir,'checks.json'),JSON.stringify({offline:true,touchPreferences:true,updateBlockedOnSaveFailure:true,updatedProgress:true,backupRecovery:true,errors:b.errors},null,2));
}finally{b.close();for(const child of children)child.kill();server.closeAllConnections();server.close();}
/** Server und Browser für diese Prüfung starten. */
async function boot(){
 if(!await reachable(url,2)){
  const port4199=new URL(url).port||'4199';
  children.push(spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:port4199},stdio:'ignore'}));
  assert.ok(await reachable(url),'Server antwortet nicht auf '+url);
 }
 try{await fetch('http://127.0.0.1:'+port+'/json/version');return;}catch{}
 const exe=CHROMES.find(p=>existsSync(p));
 assert.ok(exe,'Kein Chrome/Edge gefunden. CHROME=<pfad> setzen.');
 const profile=join(tmpdir(),'basis-pwa-'+Date.now());
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
