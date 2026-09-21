// CPU-Profil einer Kampfszene (Playwright-Schnipsel für browser_run_code / page-Objekt): meldet FPS und die teuersten Funktionen.
// Aufruf über das Playwright-Werkzeug; URL und Gegnerzahl oben anpassen. Service Worker wird umgangen, damit frischer Code läuft.
async (page) => {
 const NATIVE=['restore','drawImage','fill','fillRect','stroke','clip','save'],TOP=12,URL='http://localhost:4395/',COUNT=6,SECONDS=5;
 const cdp=await page.context().newCDPSession(page);
 await cdp.send('Network.enable');await cdp.send('Network.setBypassServiceWorker',{bypass:true});await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 await page.bringToFront();await page.setViewportSize({width:2024,height:900});await page.goto(URL);await page.waitForFunction(()=>!!globalThis.__mertloch,null,{timeout:30000});
 await page.waitForTimeout(1500);
 await page.evaluate(()=>{[...document.querySelectorAll('.start-screen button')].find(b=>/Ins Dorf/i.test(b.innerText))?.click();});
 await page.waitForTimeout(1500);
 await page.evaluate(async count=>{const {game}=__mertloch;if(game.tutorial)game.tutorial.completed=true;document.querySelectorAll('[data-window-close]').forEach(b=>b.click());const {spawnArena}=await import('./arena.js');spawnArena(game,{kind:'boar',count});game.target=game.enemies.find(e=>e.arena);game.startAttack();},COUNT);
 await page.waitForTimeout(1200);
 await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:200});await cdp.send('Profiler.start');
 const fps=await page.evaluate(sec=>new Promise(res=>{const {game}=__mertloch;let n=0,worst=0,last;const t0=performance.now();function f(t){if(last!==undefined)worst=Math.max(worst,t-last);last=t;n++;if(game.player.hp<game.player.maxHp*.5)game.player.hp=game.player.maxHp;for(let i=0;i<4;i++)game.useSkill?.(i);if(performance.now()-t0<sec*1000)requestAnimationFrame(f);else res({fps:+(n/sec).toFixed(1),worstMs:Math.round(worst),enemies:game.enemies.filter(e=>e.arena&&e.hp>0).length,canvas:__mertloch.renderer.canvas.width+'x'+__mertloch.renderer.canvas.height});}requestAnimationFrame(f);}),SECONDS);
 const {profile}=await cdp.send('Profiler.stop');
 const self=new Map(),dt=profile.timeDeltas,byId=new Map(profile.nodes.map(n=>[n.id,n]));let total=0;
 profile.samples.forEach((id,i)=>{const n=byId.get(id),c=n.callFrame,key=(c.functionName||'(anonym)')+' '+c.url.split('/').pop()+':'+c.lineNumber;self.set(key,(self.get(key)||0)+dt[i]/1000);total+=dt[i]/1000;});
 const top=[...self].sort((a,b)=>b[1]-a[1]).slice(0,28).map(([k,ms])=>k+'  '+(ms/total*100).toFixed(1)+'%');
 const parent=new Map();for(const n of profile.nodes)for(const ch of n.children||[])parent.set(ch,n);
 const callers=new Map();profile.samples.forEach((id,i)=>{const n=byId.get(id);if(!NATIVE.includes(n.callFrame.functionName))return;const p=parent.get(id)?.callFrame,key=n.callFrame.functionName+' ← '+(p?(p.functionName||'(anonym)')+' '+p.url.split('/').pop()+':'+p.lineNumber:'?');callers.set(key,(callers.get(key)||0)+dt[i]/1000);});
 const nativeCallers=[...callers].sort((a,b)=>b[1]-a[1]).slice(0,14).map(([k,ms])=>k+'  '+(ms/total*100).toFixed(1)+'%');
 return {fps,top:top.slice(0,TOP),nativeCallers};
}
