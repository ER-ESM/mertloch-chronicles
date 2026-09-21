// A/B-Messung der Kampfszene (Playwright-Schnipsel, über browser_run_code): schaltet einzelne Kostenposten ab und misst FPS + Zeichenzeit.
// Varianten laufen verschränkt in mehreren Runden, damit schwankende Maschinenlast alle gleich trifft. Effektschicht ist aus (?fx=aus).
async (page) => {
 const URL='http://localhost:4395/?fx=aus',ROUNDS=3,MS=2000;
 const cdp=await page.context().newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setBypassServiceWorker',{bypass:true});await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 await page.bringToFront();await page.setViewportSize({width:2024,height:900});await page.goto(URL);await page.waitForFunction(()=>!!globalThis.__mertloch,null,{timeout:30000});await page.waitForTimeout(1500);
 await page.evaluate(()=>{[...document.querySelectorAll('.start-screen button')].find(b=>/Ins Dorf/i.test(b.innerText))?.click();});await page.waitForTimeout(1500);
 await page.evaluate(async()=>{const {game,renderer}=__mertloch;game.settings.autoRes=false;renderer.pace(16,1);/* Automatik aus: Varianten sollen sich nur im genannten Posten unterscheiden */if(game.tutorial)game.tutorial.completed=true;document.querySelectorAll('[data-window-close]').forEach(b=>b.click());const {spawnArena}=await import('./arena.js');spawnArena(game,{kind:'boar',count:6});game.target=game.enemies.find(e=>e.arena);game.startAttack();});
 await page.waitForTimeout(1000);
 // Varianten leben in der Seite; gemessen wird von außen, damit die Hauptfaden-Zeit (CDP TaskDuration) je Variante vorliegt.
 await page.evaluate(()=>{const {game,renderer}=__mertloch,st=document.createElement('style');document.head.append(st);const css=t=>{st.textContent=t;return()=>{st.textContent='';};};
  globalThis.__ab={off:null,V:{
   basis:()=>()=>{},
   ohneFilter:()=>css('#world{filter:none!important}'),
   ohneLichtebene:()=>css('.world-light{display:none!important}'),
   lichtAus:()=>{game.settings.light=false;return()=>{game.settings.light=true;};},
   ohneHud:()=>css('#gameShell>*:not(canvas){visibility:hidden!important}'),
   dichte1:()=>{const r=renderer.resize;renderer.resize=function(){r.call(this);this.density=1;this.canvas.width=this.viewWidth;this.canvas.height=this.viewHeight;};renderer.resize();const u=css('#world{image-rendering:pixelated}');return()=>{renderer.resize=r;renderer.resize();u();};},
   allesAus:()=>{game.settings.light=false;const u=css('#world{filter:none!important}#gameShell>*:not(canvas){visibility:hidden!important}');return()=>{game.settings.light=true;u();};},
   ...(globalThis.__abExtra||{})},
   sample:ms=>new Promise(res=>{let n=0,draw=0;const d0=renderer.draw;renderer.draw=function(){const t=performance.now();d0.call(this);draw+=performance.now()-t;};const t0=performance.now();function f(){n++;if(game.player.hp<game.player.maxHp*.5)game.player.hp=game.player.maxHp;for(let i=0;i<4;i++)game.useSkill?.(i);if(performance.now()-t0<ms)requestAnimationFrame(f);else{renderer.draw=d0;res({n,draw:draw/n,density:renderer.density});}}requestAnimationFrame(f);})};});
 await cdp.send('Performance.enable');const metric=async()=>{const m=(await cdp.send('Performance.getMetrics')).metrics,g=k=>m.find(x=>x.name===k).value*1000;return {task:g('TaskDuration'),script:g('ScriptDuration'),layout:g('LayoutDuration')+g('RecalcStyleDuration')};};
 const names=await page.evaluate(()=>Object.keys(__ab.V)),sum={};
 for(let r=0;r<ROUNDS;r++)for(const name of names){await page.evaluate(n=>{__ab.off=__ab.V[n]();},name);await page.waitForTimeout(250);const a=await metric(),s=await page.evaluate(ms=>__ab.sample(ms),MS),b=await metric();await page.evaluate(()=>{__ab.off();});
  const v=sum[name]||={task:0,script:0,layout:0,draw:0,fps:0};v.task+=(b.task-a.task)/s.n/ROUNDS;v.script+=(b.script-a.script)/s.n/ROUNDS;v.layout+=(b.layout-a.layout)/s.n/ROUNDS;v.draw+=s.draw/ROUNDS;v.fps+=s.n/(MS/1000)/ROUNDS;v.density=s.density;}
 await page.evaluate(()=>{__mertloch.game.setSetting('autoRes',true);});/* Spielstand nicht mit abgeschalteter Automatik zurücklassen */
 return Object.fromEntries(Object.entries(sum).map(([k,v])=>[k,`Hauptfaden ${v.task.toFixed(1)} ms/Bild (Skript ${v.script.toFixed(1)}, davon zeichnen ${v.draw.toFixed(1)}; Layout/Stil ${v.layout.toFixed(1)}) · ${v.fps.toFixed(0)} FPS · Dichte ${v.density}`]));
}
