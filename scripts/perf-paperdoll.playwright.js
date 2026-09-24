// Leistung mit der Anziehpuppe (Playwright-Schnipsel für browser_run_code): Dorf mit NPCs und Kampf, Grafik „Niedrig“,
// wahlweise CPU-Drosselung (schwächere Geräte) und Handy-Ansicht. Misst je Variante FPS, Arbeitszeit je Bild (CDP TaskDuration)
// und die teuersten Funktionen; A/B Anziehpuppe an/aus (paperdoll.ready). Parameter über globalThis.__perf = {url, throttle, mobile, seconds}.
async (page) => {
 const P={url:'http://localhost:4173/',throttle:1,mobile:false,seconds:4,...(globalThis.__perf||{})};
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Network.enable');await cdp.send('Network.setBypassServiceWorker',{bypass:true});await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 await page.bringToFront();
 if(P.mobile){await page.setViewportSize({width:412,height:915});await cdp.send('Emulation.setDeviceMetricsOverride',{width:412,height:915,deviceScaleFactor:2.625,mobile:true});await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});}
 else{await cdp.send('Emulation.clearDeviceMetricsOverride').catch(()=>{});await page.setViewportSize({width:2024,height:900});}
 await page.goto(P.url);await page.waitForFunction(()=>!!globalThis.__mertloch?.game,null,{timeout:60000});await page.waitForTimeout(1500);
 await page.evaluate(()=>{[...document.querySelectorAll('button')].find(b=>/Ins Dorf/i.test(b.innerText))?.click();});await page.waitForTimeout(2500);
 // Grafik „Niedrig“ wie das Einstellungsfenster (content/options.js presets.low)
 await page.evaluate(async()=>{const {game}=__mertloch;const {OPTIONS_UI}=await import('./content/index.js');const low=(OPTIONS_UI.presets||[]).find(p=>p.id==='low')?.values||{light:false,fx:false,autoRes:true,fullRes:false};for(const [k,v] of Object.entries(low))game.setSetting?game.setSetting(k,v):(game.settings[k]=v);if(game.tutorial)game.tutorial.completed=true;document.querySelectorAll('[data-window-close]').forEach(b=>b.click());});
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:P.throttle});
 const scene=async name=>page.evaluate(async name=>{const {game}=__mertloch;game.enemies=game.enemies.filter(e=>!e.arena);
  if(name==='dorf'){const A=game.life.actors;let best=A[0],bn=0;for(const a of A){const n=A.filter(b=>Math.hypot(b.x-a.x,b.y-a.y)<260).length;if(n>bn){bn=n;best=a;}}game.floor=0;Object.assign(game.player,{x:best.x+30,y:best.y+30});}
  else{const {spawnArena}=await import('./arena.js');spawnArena(game,{kind:'boar',count:6});game.target=game.enemies.find(e=>e.arena);game.startAttack?.();}},name);
 const measure=async()=>{const m0=await cdp.send('Performance.getMetrics');const t0=Date.now();
  const fr=await page.evaluate(async s=>{const d=[];let last=performance.now();await new Promise(res=>{const end=performance.now()+s*1000;const f=t=>{d.push(t-last);last=t;if(t<end)requestAnimationFrame(f);else res();};requestAnimationFrame(f);});d.shift();d.sort((a,b)=>a-b);return {fps:+(1000/(d.reduce((a,b)=>a+b,0)/d.length)).toFixed(1),p95:+d[Math.floor(d.length*.95)].toFixed(1),n:d.length};},P.seconds);
  const m1=await cdp.send('Performance.getMetrics');const g=(m,k)=>m.metrics.find(x=>x.name===k)?.value||0;const secs=(Date.now()-t0)/1000;
  return {...fr,taskMsPerFrame:+((g(m1,'TaskDuration')-g(m0,'TaskDuration'))*1000/fr.n).toFixed(1),scriptMsPerFrame:+((g(m1,'ScriptDuration')-g(m0,'ScriptDuration'))*1000/fr.n).toFixed(1),busy:+((g(m1,'TaskDuration')-g(m0,'TaskDuration'))/secs*100).toFixed(0)+'%'};};
 await cdp.send('Performance.enable');
 const setPd=on=>page.evaluate(async on=>{(await import('./paperdoll-art.js')).paperdoll.ready=on;},on);
 const out={throttle:P.throttle,mobile:P.mobile,density:null,rows:[]};
 for(const name of ['dorf','kampf']){await scene(name);await page.waitForTimeout(2500);
  for(const round of [1,2])for(const pd of [true,false]){await setPd(pd);await page.waitForTimeout(600);out.rows.push({scene:name,paperdoll:pd,round,...await measure()});}
  await setPd(true);}
 out.density=await page.evaluate(()=>({density:__mertloch.renderer.density,zoom:+__mertloch.renderer.zoom.toFixed(2),canvas:__mertloch.renderer.canvas.width+'x'+__mertloch.renderer.canvas.height,dpr:devicePixelRatio,stats:{...(globalThis.__pdStats||{})}}));
 // CPU-Profil der Kampfszene mit Anziehpuppe
 await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:200});await cdp.send('Profiler.start');await page.waitForTimeout(P.seconds*1000);const {profile}=await cdp.send('Profiler.stop');
 const self=new Map(),byId=new Map(profile.nodes.map(n=>[n.id,n]));const dt=profile.timeDeltas||[];profile.samples.forEach((id,i)=>{const n=byId.get(id);const cf=n.callFrame;const key=(cf.functionName||'(anon)')+' '+(cf.url.split('/').pop()||'')+':'+cf.lineNumber;self.set(key,(self.get(key)||0)+(dt[i]||0));});
 const total=[...self.values()].reduce((a,b)=>a+b,0);out.top=[...self.entries()].sort((a,b)=>b[1]-a[1]).slice(0,14).map(([k,v])=>k+' '+(v/total*100).toFixed(1)+'%');
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});return out;
}
