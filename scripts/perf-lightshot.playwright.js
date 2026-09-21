// Vergleichsbild der Lichtschicht (Playwright-Schnipsel): gleicher Ort, fester Dunkelanteil. PORT/NAME/DARK anpassen; SAVE = Spielstand von 4395 übernehmen.
async (page) => {
 const PORT=4395,NAME='e49',DARKS=[.4];
 const cdp=await page.context().newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setBypassServiceWorker',{bypass:true});await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 await page.setViewportSize({width:2024,height:900});
 await page.goto('http://localhost:4395/');const store=await page.evaluate(()=>JSON.stringify(Object.fromEntries(Object.entries(localStorage))));
 if(PORT!==4395){await page.goto('http://localhost:'+PORT+'/');await page.evaluate(s=>{for(const [k,v] of Object.entries(JSON.parse(s)))localStorage.setItem(k,v);},store);}
 await page.bringToFront();await page.goto('http://localhost:'+PORT+'/?fx=aus');await page.waitForFunction(()=>!!globalThis.__mertloch,null,{timeout:30000});await page.waitForTimeout(1500);
 await page.evaluate(()=>{[...document.querySelectorAll('.start-screen button')].find(b=>/Ins Dorf/i.test(b.innerText))?.click();});await page.waitForTimeout(1500);
 const out=[];
 for(const dark of DARKS){
  await page.evaluate(d=>{const {game,renderer}=__mertloch;if(game.tutorial)game.tutorial.completed=true;document.querySelectorAll('[data-window-close]').forEach(b=>b.click());game.settings.light=true;renderer.light.zoneDark=()=>d;game.time=100;const tick=game.tick.bind(game);game.tick=()=>{};globalThis.__tick=tick;},dark);
  await page.waitForTimeout(600);const file='MertlochChronicles-perf/visual-review/performance/licht-'+NAME+'-'+String(dark).replace('.','')+'.png';await page.screenshot({path:file,clip:{x:500,y:0,width:1024,height:700}});out.push(file);
 }
 return out;
}
