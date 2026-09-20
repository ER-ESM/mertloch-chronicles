// Menü-Performance im Browser messen (Playwright-MCP: browser_run_code_unsafe mit filename).
// Öffnet jedes Menü viermal per Taste und misst die synchrone Zeit des Tastendrucks; dazu ein CPU-Profil der teuersten Menüs.
// Aufruf: lokaler Server auf PORT 4190 (`PORT=4190 node server.mjs`).
async (page) => {
 const cdp=await page.context().newCDPSession(page);await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 const errs=[];page.on('pageerror',e=>errs.push(e.message.slice(0,200)));
 // Der PWA-Service-Worker würde alte Module ausliefern: Registrierung unterbinden, Bestand löschen.
 await page.addInitScript(()=>{try{Object.defineProperty(navigator.serviceWorker,'register',{value:()=>new Promise(()=>{})});}catch{}});
 await page.goto('http://localhost:4190/');
 await page.evaluate(async()=>{for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister();for(const k of await caches.keys())await caches.delete(k);});await page.reload();await page.waitForSelector('#startScreen[data-step=roster] [data-start=enter]',{timeout:60000});
 await page.click('[data-start=enter]');await page.waitForTimeout(800);
 await page.evaluate(()=>{if(game.tutorial)game.tutorial.completed=true;game.player.level=20;});
 await page.keyboard.press('Escape');await page.waitForTimeout(300);await page.keyboard.press('Escape');await page.waitForTimeout(300);
 const out={errs};
 const press=key=>page.evaluate(key=>{const t0=performance.now();document.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));return Math.round(performance.now()-t0);},key);
 const closeAll=()=>page.evaluate(()=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',shiftKey:true,bubbles:true})));
 for(const [name,key] of [['talents','n'],['person','c'],['bag','i'],['book','k'],['quest','j'],['base','b'],['map','m'],['guide','h'],['menu','p']]){
  const runs=[];
  for(let i=0;i<4;i++){runs.push(await press(key));await page.waitForTimeout(250);if(i===3)await page.screenshot({path:'D:/Dev/MertlochChronicles-target/perf-'+name+'.png'});await closeAll();await page.waitForTimeout(150);}
  out[name]=runs.join(' ');
 }
 await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:150});
 for(const [name,key] of [['guide','h'],['talents','n'],['person','c'],['book','k']]){
  await cdp.send('Profiler.start');
  for(let i=0;i<6;i++){await press(key);await page.waitForTimeout(120);await closeAll();await page.waitForTimeout(60);}
  const {profile}=await cdp.send('Profiler.stop');
  const byId=new Map(profile.nodes.map(n=>[n.id,n])),parent=new Map();for(const n of profile.nodes)for(const c of n.children||[])parent.set(c,n.id);
  const incl=new Map(),dt=profile.timeDeltas;
  profile.samples.forEach((id,i)=>{let cur=id;const chain=[];while(cur){const f=byId.get(cur).callFrame;chain.push(f.functionName+' '+f.url.split('/').pop()+':'+f.lineNumber);cur=parent.get(cur);}if(!chain.some(k=>k.startsWith('showPanel ')))return;for(const k of new Set(chain))incl.set(k,(incl.get(k)||0)+dt[i]/1000);});
  out['prof_'+name]=[...incl].sort((a,b)=>b[1]-a[1]).slice(4,18).map(([k,v])=>k+' '+(v/6).toFixed(1));
 }
 return out;
}
