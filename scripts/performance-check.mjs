// Cold start, frame times and JS heap. Run before/after with the same machine and viewport.
// node scripts/performance-check.mjs [http://localhost:4181/] [before|after]
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {browserSession,wait} from './browser-session.mjs';
const url=process.argv.slice(2).find(a=>a.startsWith('http')),label=process.argv.slice(2).find(a=>['before','after'].includes(a))||'after',out='visual-review/performance';
mkdirSync(out,{recursive:true});const b=await browserSession({url,port:Number(process.env.CDP_PORT||9371)}),report={label,viewport:{width:1280,height:800},scenes:[]};
try{
 await b.resize(1280,800);await b.send('Network.enable');await b.send('Network.setCacheDisabled',{cacheDisabled:true});await b.send('Network.setBypassServiceWorker',{bypass:true});await b.send('Performance.enable');
 // Compare the original two startup modules without checking out or changing any source file.
 const files=['app.js','prerender-art.js'],ref=process.env.PERF_BASE_REF||'3524186';report.baselineRef=ref;
 const source=Object.fromEntries(files.map(p=>[p,label==='before'?execFileSync('git',['show',ref+':'+p]):readFileSync(p)]));
 b.on('Fetch.requestPaused',({requestId,request})=>b.send('Fetch.fulfillRequest',{requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/javascript'}],body:source[new URL(request.url).pathname.split('/').at(-1)].toString('base64')}));
 await b.send('Fetch.enable',{patterns:files.map(p=>({urlPattern:'*/'+p,requestStage:'Request'}))});
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`performance.setResourceTimingBufferSize(10000);localStorage.setItem('mertloch-touch-v1',JSON.stringify({mode:'desktop'}));delete Navigator.prototype.serviceWorker;const timer=setInterval(()=>{if(window.mertloch){window.gameReadyMs=performance.now();clearInterval(timer);}},10);`});
 await b.goto(b.url);await wait(300);
 report.start=await b.evaluate(`(()=>{const r=performance.getEntriesByType('resource');return{readyMs:window.gameReadyMs,requests:r.length,bytes:r.reduce((s,r)=>s+r.transferSize,0),previewRequests:r.filter(r=>r.name.includes('/prerender/runtime/')).length}})()`);
 await b.evaluate(`game.tutorial.completed=true;document.querySelectorAll('[data-window-close]').forEach(b=>b.click());`);
 for(const name of ['village','combat','character']){
  if(name==='combat')await b.evaluate(`(async()=>{const {spawnArena}=await import('./arena.js');spawnArena(game,{kind:'boar',count:3});game.target=game.enemies.find(e=>e.arena);game.startAttack();})()`);
  if(name==='character')await b.click('.game-menu-rail [data-panel="person"]');
  await wait(700);
  const sample=await b.evaluate(`new Promise(resolve=>{const times=[];let last,start;function frame(t){start??=t;if(last!==undefined)times.push(t-last);last=t;if(t-start<5000)requestAnimationFrame(frame);else{times.sort((a,b)=>a-b);resolve({frames:times.length,fps:times.length/((t-start)/1000),p50:times[Math.floor(times.length*.5)],p95:times[Math.floor(times.length*.95)],over50ms:times.filter(t=>t>50).length})}}requestAnimationFrame(frame)})`);
  const {metrics}=await b.send('Performance.getMetrics');sample.jsHeapMiB=metrics.find(m=>m.name==='JSHeapUsedSize').value/1048576;sample.scene=name;report.scenes.push(sample);console.log(name,JSON.stringify(sample));
  if(name==='combat')assert.ok(await b.evaluate('game.arenaStats.damage>0'),'Combat sample must actually deal damage');
 }
 assert.equal(b.errors.length,0,JSON.stringify(b.errors));
 if(label!=='before')assert.equal(report.start.previewRequests,0,'Disabled preview must not fetch its catalog or images');
 writeFileSync(out+'/'+label+'.json',JSON.stringify(report,null,2));console.log('START '+JSON.stringify(report.start));
}finally{b.close();}
