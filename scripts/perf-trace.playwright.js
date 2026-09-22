// Thread-Auslastung einer Kampfszene (Playwright-Schnipsel, über browser_run_code): zeichnet einen Chrome-Trace auf und meldet je Thread
// (Hauptfaden, Compositor, GPU-Prozess, Raster), wie viel Prozent der Zeit er beschäftigt war. Zeigt, WER die Bildrate begrenzt –
// FPS und Hauptfaden-Zeit allein sagen das nicht, wenn Grafikarbeit in einem anderen Prozess liegt (ohne Grafikkarte: SwiftShader).
// Varianten in `globalThis.__traceVariants` (Name → Code als Text, läuft in der Seite) oder die eingebauten unten.
async (page) => {
 const URL='http://localhost:4395/?fx=aus',MS=2500;
 const VARIANTS=globalThis.__traceVariants||{
  basis:'',
  dichte1_ohneFilter:"__mertloch.renderer.densityCap=1;__mertloch.renderer.gradeOff=true;__mertloch.renderer.resize();",
 };
 const cdp=await page.context().newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setBypassServiceWorker',{bypass:true});await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 await page.bringToFront();await page.setViewportSize({width:2024,height:900});
 // Referenz: Bildrate einer leeren Seite = was der Bildschirm dieser Sitzung überhaupt liefert (Remote-Sitzungen schalten zwischen 30 und 60 Hz).
 const blank=async()=>{await page.goto('about:blank');return page.evaluate(()=>new Promise(res=>{let n=0;const t0=performance.now();function f(){n++;if(performance.now()-t0<1000)requestAnimationFrame(f);else res(n);}requestAnimationFrame(f);}));};
 const out={bildschirmHz:await blank()};
 for(const [name,code] of Object.entries(VARIANTS)){
  await page.goto(URL);await page.waitForFunction(()=>!!globalThis.__mertloch,null,{timeout:30000});await page.waitForTimeout(1500);
  await page.evaluate(()=>{[...document.querySelectorAll('.start-screen button')].find(b=>/Ins Dorf/i.test(b.innerText))?.click();});await page.waitForTimeout(1500);
  await page.evaluate(async code=>{const {game,renderer}=__mertloch;game.settings.autoRes=false;renderer.pace(16,1);if(game.tutorial)game.tutorial.completed=true;document.querySelectorAll('[data-window-close]').forEach(b=>b.click());const {spawnArena}=await import('./arena.js');spawnArena(game,{kind:'boar',count:6});game.target=game.enemies.find(e=>e.arena);game.startAttack();globalThis.__keep=setInterval(()=>{game.player.hp=game.player.maxHp;for(let i=0;i<4;i++)game.useSkill?.(i);},200);(0,eval)(code);},code);
  await page.waitForTimeout(800);
  const events=[];const onData=e=>{for(const ev of e.value)events.push(ev);};cdp.on('Tracing.dataCollected',onData);
  const done=new Promise(r=>cdp.once('Tracing.tracingComplete',r));
  await cdp.send('Tracing.start',{traceConfig:{includedCategories:['toplevel','viz','gpu','cc','disabled-by-default-devtools.timeline','devtools.timeline']},transferMode:'ReportEvents'});
  const fps=await page.evaluate(ms=>new Promise(res=>{let n=0;const t0=performance.now();function f(){n++;if(performance.now()-t0<ms)requestAnimationFrame(f);else res(+(n/(ms/1000)).toFixed(1));}requestAnimationFrame(f);}),MS);
  await cdp.send('Tracing.end');await done;cdp.off('Tracing.dataCollected',onData);
  await page.evaluate(()=>{clearInterval(__keep);__mertloch.game.setSetting('autoRes',true);});
  // Threadnamen, dann je Thread die Vereinigung der obersten Ereignisdauern (verschachtelte Ereignisse nicht doppelt zählen).
  const names=new Map();for(const e of events)if(e.ph==='M'&&e.name==='thread_name')names.set(e.pid+':'+e.tid,e.args.name);
  const span=[Infinity,-Infinity],busy=new Map(),top=new Map();
  const byThread=new Map();for(const e of events){if(e.ph!=='X'||!e.dur)continue;span[0]=Math.min(span[0],e.ts);span[1]=Math.max(span[1],e.ts+e.dur);const k=e.pid+':'+e.tid;let a=byThread.get(k);if(!a)byThread.set(k,a=[]);a.push(e);}
  for(const [k,list] of byThread){list.sort((a,b)=>a.ts-b.ts);let end=-1,sum=0;for(const e of list){const s=Math.max(e.ts,end),f=e.ts+e.dur;if(f>s){sum+=f-s;end=f;}}busy.set(k,sum);
   const GENERIC=/^(RunTask|ThreadControllerImpl::RunTask|ThreadPool_RunTask|TaskGraphRunner::RunTask|Graphics.Pipeline|Receive mojo message)$/;const t=new Map();for(const e of list)if(!GENERIC.test(e.name))t.set(e.name,(t.get(e.name)||0)+e.dur);top.set(k,[...t].sort((a,b)=>b[1]-a[1]).slice(0,globalThis.__traceDepth||4).map(([n,d])=>n+' '+(d/1000/(MS/1000*1)).toFixed(0)+'ms/s'));}
  const total=span[1]-span[0],frames=fps*MS/1000,KEY=['FireAnimationFrame','LayerTreeHost::DoUpdateLayers','Commit','SoftwareRenderer::DoDrawQuad','DirectRenderer::DrawFrame','Paint','RasterTask'];
  const perFrame=Object.fromEntries(KEY.map(n=>[n,+(events.filter(e=>e.ph==='X'&&e.name===n).reduce((a,e)=>a+e.dur,0)/1000/frames).toFixed(2)]));
  if(globalThis.__traceCompact){out[name]={fps,msJeBild:perFrame};continue;}
  out[name]={fps,threads:[...busy].sort((a,b)=>b[1]-a[1]).slice(0,7).map(([k,b])=>`${names.get(k)||k}: ${Math.round(b/total*100)} % · ${top.get(k).join(', ')}`)};
 }
 out.bildschirmHzDanach=await blank();return out;
}
