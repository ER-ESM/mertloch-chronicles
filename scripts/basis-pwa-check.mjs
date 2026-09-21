// Real service-worker releases, native dialogs and storage preservation in an owned profile.
// npm run build && node scripts/basis-pwa-check.mjs
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import http from 'node:http';
import {browserSession,wait} from './browser-session.mjs';
const url='http://127.0.0.1:4199/mertloch-chronicles/',dir='combat-review/basis-pwa';
mkdirSync(dir,{recursive:true});
let release='';
const server=http.createServer((req,res)=>{
 try{const path=new URL(req.url,url).pathname;if(!path.startsWith('/mertloch-chronicles/'))throw Error('scope');const relative=decodeURIComponent(path.slice('/mertloch-chronicles/'.length))||'index.html';if(relative.split('/').includes('..'))throw Error('path');
  let data=readFileSync(join('_site',relative));if(relative==='precache-manifest.js'&&release)data=Buffer.from(data.toString().replace(/"version": "([^"]+)"/,'"version": "$1-'+release+'"'));
  res.writeHead(200,{'Content-Type':relative.endsWith('.js')?'text/javascript':relative.endsWith('.css')?'text/css':relative.endsWith('.html')?'text/html':relative.endsWith('.json')||relative.endsWith('.webmanifest')?'application/json':'application/octet-stream','Cache-Control':'no-store'}).end(data);
 }catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(4199,'127.0.0.1',r));
let b,key;const checks=[],answers=[],dialogs=[];
async function until(expression,message){for(let i=0;i<240;i++){try{if(await b.evaluate(expression))return;}catch{}await wait(250);}throw Error(message);}
const pass=name=>{checks.push(name);console.log('PASS '+name);};
async function reload(){const origin=await b.evaluate('performance.timeOrigin');await b.send('Page.navigate',{url});await until(`performance.timeOrigin!==${origin}&&!!window.mertloch`,'reload');}
async function offer(name){release=name;await b.evaluate('(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update()})()');await until('window.mertloch.state().pwa.update','waiting '+name);}
async function apply(){const origin=await b.evaluate('performance.timeOrigin');await b.click('#updateHint button');await until(`performance.timeOrigin!==${origin}&&!!window.mertloch`,'update reload');await until('!window.mertloch.state().pwa.update','active release');}
const network=offline=>b.send('Network.emulateNetworkConditions',{offline,latency:0,downloadThroughput:offline?0:-1,uploadThroughput:offline?0:-1});
try{
 b=await browserSession({url,port:Number(process.env.CDP_PORT||9339)});
 b.on('Page.javascriptDialogOpening',async p=>{dialogs.push(p);const answer=answers.shift();await b.send('Page.handleJavaScriptDialog',{accept:answer??false});if(answer===undefined)throw Error('Unexpected confirmation: '+p.message);});
 await b.send('Network.enable');await b.resize(390,844);await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});await b.goto(url);
 await until('window.mertloch.state().pwa.offline&&!!navigator.serviceWorker.controller','initial offline cache');
 // Seit den Helden-Slots legt goto() einen benannten Testhelden an. Fehler müssen dessen
 // tatsächlichen Speicherplatz treffen, nicht den ungenutzten Legacy-Spielstand.
 key=await b.evaluate(`(async()=>{const {characterKey}=await import('./characters.js');return characterKey(game.world.id,game.hero)})()`);
 const cachedPreview=()=>b.evaluate(`(async()=>{const cache=await caches.open((await caches.keys()).find(k=>k.startsWith('mertloch-pwa-')));return (await cache.keys()).filter(r=>r.url.includes('/prerender/runtime/')).map(r=>r.url)})()`);
 assert.deepEqual(await cachedPreview(),[]);pass('core install skips optional preview assets');
 await b.evaluate(`document.querySelectorAll('[data-window-close]').forEach(e=>e.click());game.tutorial.completed=true;game.rpg.coins=173;game.settings.autoLoot=false;localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'touch',size:'large',layouts:{dieter:{slots:['strike','auto'],learned:game.skills.filter(s=>!s.offGcd||s.auto).map(s=>s.id)}}}));window.dispatchEvent(new Event('pagehide'));`);
 await network(true);await reload();assert.equal(await b.evaluate('game.rpg.coins'),173);assert.equal(await b.evaluate('game.settings.autoLoot'),false);assert.equal((await b.state()).mobile.size,'large');assert.deepEqual((await b.state()).mobile.slots.slice(0,2),['strike','auto']);await b.screenshot(dir+'/offline.png');pass('cold offline start preserves progress and touch preferences');
 await network(false);await offer('retry');answers.push(false);
 await b.evaluate(`game.rpg.coins=231;window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError')};document.querySelector('#updateHint button').click();`);
 await wait(200);assert.equal(dialogs.length,1);assert.match(dialogs[0].message,/nicht gespeichert/);assert.equal(await b.evaluate('game.rpg.coins'),231);assert.equal((await b.state()).pwa.update,true);
 await b.evaluate('Storage.prototype.setItem=window.originalSetItem');await apply();assert.equal(await b.evaluate('game.rpg.coins'),231);assert.deepEqual((await b.state()).mobile.slots.slice(0,2),['strike','auto']);pass('cancelled failed save keeps session; retry preserves progress');
 await offer('accepted');answers.push(true);
 await b.evaluate(`game.rpg.coins=999;Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError')};`);await apply();assert.equal(dialogs.length,2);assert.equal(await b.evaluate('game.rpg.coins'),231);pass('accepted failed save reloads last saved progress');
 const {identifier}=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`window.expectedBackupCoins=JSON.parse(localStorage.getItem('${key}-previous')).rpg.coins;localStorage.setItem('${key}','{broken');`});await reload();await b.send('Page.removeScriptToEvaluateOnNewDocument',{identifier});assert.equal(await b.evaluate('game.rpg.coins'),await b.evaluate('window.expectedBackupCoins'));assert.match(await b.evaluate('document.querySelector("#toast").textContent'),/Sicherung/);pass('damaged save recovers readable backup');
 for(const [name,raw] of [['future',JSON.stringify({version:99,precious:'unchanged'})],['unreadable','{unreadable']]){
  const {identifier}=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.removeItem('${key}-previous');localStorage.setItem('${key}',${JSON.stringify(raw)});`});await reload();await b.send('Page.removeScriptToEvaluateOnNewDocument',{identifier});
  await offer(name);await apply();assert.equal(await b.evaluate(`localStorage.getItem('${key}')`),raw);assert.equal(dialogs.length,2);pass(name+' save survives update byte-for-byte without confirmation');
 }
 // Reset only this script's isolated profile before checking preview offline restoration.
 const clean=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.removeItem('${key}');localStorage.removeItem('${key}-previous');`});await reload();await b.send('Page.removeScriptToEvaluateOnNewDocument',clean);
 await b.evaluate(`game.setSetting('prerender',true)`);await until(`(async()=>{const {prerenderArt:a}=await import('./prerender-art.js');return a.enabled&&a.ready})()`,'selected preview');
 const preview=await cachedPreview();assert.ok(preview.length>2&&preview.length<30);assert.ok(preview.every(p=>p.endsWith('catalog.json')||p.includes('/dieter-')));await b.evaluate(`window.dispatchEvent(new Event('pagehide'))`);
 await network(true);await reload();await until(`(async()=>{const {prerenderArt:a}=await import('./prerender-art.js');return a.enabled&&a.ready})()`,'offline selected preview');pass('selected preview alone cached and restored offline');
 const caches=await b.evaluate('window.caches.keys()');assert.equal(caches.filter(k=>k.startsWith('mertloch-pwa-')).length,1);assert.ok(caches.some(k=>k.endsWith('unreadable')));
 assert.deepEqual(answers,[]);assert.deepEqual(b.errors,[]);writeFileSync(join(dir,'checks.json'),JSON.stringify({checks,dialogs:dialogs.length,previewAssets:preview.length,errors:b.errors},null,2));
}finally{b?.close();server.closeAllConnections();server.close();}
