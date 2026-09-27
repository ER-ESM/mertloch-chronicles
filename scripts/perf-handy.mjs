// Handy-Messung (2026-09-27): Android-Chrome im Querformat nachgestellt – 915×412, Gerätepixel 2,625, Touch, mobiler UA, CPU gedrosselt
// (4× ≈ Mittelklasse-Android, 6× als ungünstiger Fall). Grafik „Niedrig“ (Licht aus, Effekte aus, niedrige Auflösung), Stufe 20.
// Drei Szenen, per Skript reproduzierbar: Stillstand, Laufen (Joystick über echte Touch-Ereignisse, entlang einer Route durchs Dorf aufs
// Feld), Kampf (4 Gegner Stufe 20, Autoangriff, Kniffe per Antippen, Schadenszahlen, Söldner). Je Szene zwei Durchgänge:
//   1. Chrome-Trace → Hauptfaden-Zeit je Bild (Skript, Stil, Layout, Paint/Commit, GC), Bildabstand, lange Aufgaben, GC-Pausen, andere Fäden,
//      dazu die Abschnittszeiten aus app.js frame() (frame-segments.js, falls vorhanden)
//   2. CPU-Profil (Profiler) + DOM-Änderungen je Bild (MutationObserver) → teuerste Funktionen nach Selbstzeit, HUD-Schreiber
// Grafik: Chrome läuft mit SwiftShader als „Grafikkarte“ (Canvas beschleunigt wie auf dem Handy: der Hauptfaden zeichnet nur auf, gerastert
// wird im GPU-Prozess) und mit ?render=gpu (Spielpfad wie auf dem Handy, nicht der Software-Sonderweg aus E-50). Raster/Compositor/GPU
// sind ohne echte Grafikkarte überzeichnet und stehen nur getrennt im Bericht; Maßstab ist die Hauptfaden-Zeit je Bild. --soft misst ohne
// Grafikkarten-Nachbildung (Canvas rastert dann auf dem Hauptfaden, erscheint unter „paint“).
//
// Vergleich vorher/nachher (--ab=<url>): zwei Browser, Szenen abwechselnd A/B, B/A …, damit schwankende Last des Rechners beide gleich trifft.
// Aufruf:  node scripts/perf-handy.mjs [--url=http://localhost:4878/] [--ab=http://localhost:4879/] [--cdp=9878] [--server=4878]
//          [--rates=4,6] [--scenes=idle,walk,combat,walkfar] [--far=x0,y0,x1,y1] [--seconds=20] [--repeat=1] [--out=…json] [--no-profile] [--shots] [--soft] [--assert]
// Runde 3: Szene walkfar = Laufstrecke fern der Bude (Dorfrand → Wiese → Wald, --far=x0,y0,x1,y1). --toggle="<js an>§§<js aus>" schaltet im
// selben Lauf alle --toggle-ms (1500) um und wertet beide Zustände getrennt aus – robust gegen die Laststreuung des geteilten Rechners, z. B.
// --toggle="(await import('./world-layers.js')).setWorldLayers(true)§§(await import('./world-layers.js')).setWorldLayers(false)".
// --assert: rot, wenn der Stillstand mehr als 1 erzwungenen Stil-/Layout-Durchgang oder (mit Profil) mehr als 3 DOM-Änderungen je Bild hat.
// Ohne --url startet das Skript einen eigenen Server auf --server. Ports vorher prüfen: andere Sitzungen nutzen 4173–4399 und 9222+.
import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {makeProfile,disposeChrome,LEAN_ARGS} from './chrome-profile.mjs';
import {browser,wait} from './browser-polish.mjs';
import {analyzeTrace,summarizeProfile,mergeRuns} from './perf-handy-lib.mjs';

const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith('--'+k+'='));return a?a.slice(k.length+3):process.argv.includes('--'+k)?true:d;};
const CDP=Number(arg('cdp',9878)),SERVER=Number(arg('server',4878)),RATES=String(arg('rates','4,6')).split(',').map(Number),SCENES=String(arg('scenes','idle,walk,combat')).split(','),
 SECONDS=Number(arg('seconds',20)),REPEAT=Number(arg('repeat',1)),OUT=arg('out','visual-review/perf-handy/messung.json'),AB=arg('ab',null),PROFILE=!arg('no-profile',false)&&!AB,LABEL=arg('label',''),SOFT=!!arg('soft',false);
const TOGGLE=arg('toggle',null),TOGGLE_MS=Number(arg('toggle-ms',1500));
const FAR_ROUTE=String(arg('far','8200,10300,5800,10900')).split(',').map(Number);/* walkfar: Start x,y und Ziel x,y (Welteinheiten) */
const DEVICE={width:915,height:412,deviceScaleFactor:2.625,mobile:true,screenOrientation:{type:'landscapePrimary',angle:90}};
const UA='Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36';
const GPU_ARGS=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-gpu-rasterization','--enable-accelerated-2d-canvas','--enable-gpu'];
const CATEGORIES=['toplevel','devtools.timeline','disabled-by-default-devtools.timeline','disabled-by-default-devtools.timeline.frame','blink.user_timing','disabled-by-default-v8.gc','cc','gpu','viz'];

const children=[],chromes=[];
const closeChromes=()=>{for(const [p,d] of chromes)disposeChrome(p,d);chromes.length=0;};
const cleanup=()=>{for(const c of children)c.kill();closeChromes();};
process.on('SIGINT',()=>{cleanup();process.exit(130);});
async function free(port){try{await fetch('http://127.0.0.1:'+port+'/');return false;}catch{return true;}}

/** Eigener Browser mit Handy-Nachbildung; `url` = Spielserver (ohne: eigener Server auf SERVER). Rückgabe: CDP-Sitzung mit `url`. */
async function start({url=arg('url',null),cdp=CDP}={}){
 if(!url){if(!await free(SERVER))throw Error('Serverport '+SERVER+' belegt – --server=<frei> oder --url= setzen');
  children.push(spawn(process.execPath,[fileURLToPath(new URL('../server.mjs',import.meta.url))],{env:{...process.env,PORT:String(SERVER)},stdio:'ignore',windowsHide:true}));url='http://localhost:'+SERVER+'/';
  for(let i=0;i<50&&await free(SERVER);i++)await wait(100);}
 try{await fetch('http://127.0.0.1:'+cdp+'/json/version');throw Error('CDP-Port '+cdp+' belegt – --cdp=<frei> setzen');}catch(e){if(e.message.startsWith('CDP-Port'))throw e;}
 const chrome=[process.env.CHROME,'C:/Program Files/Google/Chrome/Application/chrome.exe','/usr/bin/google-chrome','/usr/bin/chromium'].filter(Boolean).find(existsSync);
 const profile=makeProfile('mertloch-handy-');
 const proc=spawn(chrome,['--headless=new',...LEAN_ARGS,...(SOFT?[]:GPU_ARGS),'--remote-debugging-port='+cdp,'--user-data-dir='+profile,'--hide-scrollbars','about:blank'],{stdio:'ignore',windowsHide:true});chromes.push([proc,profile]);
 for(let i=0;i<80;i++){try{if((await fetch('http://127.0.0.1:'+cdp+'/json')).ok)break;}catch{}await wait(150);}
 const b=await browser({port:cdp});b.url=url;
 await b.send('Emulation.setUserAgentOverride',{userAgent:UA,platform:'Linux armv8l',userAgentMetadata:{platform:'Android',platformVersion:'14',architecture:'arm',model:'Pixel 7',mobile:true,brands:[{brand:'Chromium',version:'140'}]}});
 await b.send('Emulation.setDeviceMetricsOverride',DEVICE);await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
 await b.send('Network.enable');await b.send('Network.setBypassServiceWorker',{bypass:true});
 return b;
}

// Helfer in der Seite: Aufstellung, Route, Lenkung, Kampf am Laufen halten, DOM-Zähler.
const PAGE_HELPER=`(async()=>{const {game,renderer}=__mertloch;const arena=await import('./arena.js');
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 window.__perf={start:{x:game.player.x,y:game.player.y},wps:[],wpi:0,keep:null,
  closeAll(){document.querySelector('[data-intro-skip]')?.click();document.querySelectorAll('[data-window-close]').forEach(b=>b.click());},
  home(){clearInterval(this.keep);this.keep=null;/* Runde 3: Wer beim Laufen oder im Kampf umkippt, steht vor der nächsten Szene wieder auf – sonst misst der Rest des Laufs den Todesbildschirm */if(game.dead){game.respawn();document.querySelector('#deathScreen [data-ds-wake]')?.click();}arena.clearArena(game);Object.assign(game.player,{x:this.start.x,y:this.start.y,inCombat:0,hp:game.player.maxHp});game.moveTo=null;game.path=[];game.routeGoal=null;game.touchMove=null;game.target=null;game.casting=null;game.keys.clear();game.autoAttack&&(game.autoAttack.active=false);this.closeAll();},
  route(target){game.navigate(target);const wps=[game.moveTo,...game.path].filter(Boolean).map(p=>({x:p.x,y:p.y}));game.moveTo=null;game.path=[];game.routeGoal=null;this.wps=wps;this.wpi=0;let len=0,prev=game.player;for(const p of wps){len+=dist(prev,p);prev=p;}return {points:wps.length,length:Math.round(len)};},
  steer(){const p=game.player;while(this.wpi<this.wps.length&&dist(p,this.wps[this.wpi])<20)this.wpi++;if(this.wpi>=this.wps.length)return null;const w=this.wps[this.wpi],d=dist(p,w)||1;return {x:(w.x-p.x)/d,y:(w.y-p.y)/d};},
  fight(n=4){const spawn=k=>arena.spawnArena(game,{kind:'boar',count:k,level:20});spawn(n);const pick=()=>{const alive=game.enemies.filter(e=>e.arena&&e.hp>0).sort((a,b)=>dist(a,game.player)-dist(b,game.player));if(!game.target||game.target.hp<=0||!game.target.arena){game.target=alive[0]||null;if(game.target)game.startAttack();}};pick();
   this.keep=setInterval(()=>{const p=game.player;if(p.hp<p.maxHp*.6)p.hp=p.maxHp;if(game.dead)return;const alive=game.enemies.filter(e=>e.arena&&e.hp>0).length;if(alive<3)spawn(2);pick();},500);},
  info(){return {x:Math.round(game.player.x),y:Math.round(game.player.y),density:renderer.density,canvas:renderer.canvas.width+'x'+renderer.canvas.height,zoom:renderer.zoom,touch:document.body.classList.contains('touch-mode'),
   enemies:game.enemies.filter(e=>e.arena&&e.hp>0).length,companions:game.companions.length,combat:game.player.inCombat>0,dead:game.dead,popups:document.querySelectorAll('.game-popup:not([hidden])').length,level:game.player.level,settings:{light:game.settings.light,fx:game.settings.fx,lowRes:game.settings.lowRes,sct:game.settings.sct},
   damage:game.arenaStats?.damage||0,chunks:renderer.chunks?.size||0,ground:renderer.ground?.stats||null};},
  // DOM-Änderungen je Bild zählen (nur im Profil-Durchgang, der Zähler kostet selbst etwas).
  mutations(on){if(!on){this.mo?.disconnect();cancelAnimationFrame(this.moRaf);const r=this.moStats;this.mo=null;return r;}
   const s=this.moStats={frames:0,records:0,framesWithWrites:0,byTarget:{}};let inFrame=0;const tick=()=>{s.frames++;if(inFrame)s.framesWithWrites++;inFrame=0;this.moRaf=requestAnimationFrame(tick);};this.moRaf=requestAnimationFrame(tick);
   const label=n=>{const el=n.nodeType===1?n:n.parentElement;if(!el)return '?';let e=el,path='';for(let i=0;i<3&&e&&e!==document.body;i++,e=e.parentElement){const id=e.id?'#'+e.id:'',cls=e.classList?.[0]?'.'+e.classList[0]:'';path=(id||e.tagName.toLowerCase()+cls)+(path?'>'+path:'');if(id)break;}return path;};
   this.mo=new MutationObserver(list=>{inFrame+=list.length;s.records+=list.length;for(const r of list){const k=label(r.target)+' '+(r.type==='attributes'?'@'+r.attributeName:r.type);s.byTarget[k]=(s.byTarget[k]||0)+1;}});
   this.mo.observe(document.body,{subtree:true,childList:true,attributes:true,characterData:true});}
 };
 return true;})()`;

async function setup(b){
 await b.goto(b.url+(SOFT?'':'?render=gpu'));
 for(let i=0;i<150&&!(await b.evaluate('!!globalThis.__mertloch'));i++)await wait(200);
 await wait(1500);
 await b.evaluate(PAGE_HELPER);
 await b.evaluate(`(async()=>{const {game,renderer}=__mertloch;const arena=await import('./arena.js');if(game.tutorial)game.tutorial.completed=true;__perf.closeAll();arena.setArenaLevel(game,20);
  for(const [k,v] of Object.entries({light:false,fx:false,lowRes:true,autoRes:true,fullRes:false}))game.setSetting(k,v);renderer.resize();
  const offer=game.companionOffers().find(o=>!o.hired);if(offer&&!game.companions.length)game.hireCompanion(offer.def.id,{free:true});})()`);
 // Stufenaufstieg, Meilensteine, Erinnerungskarten: ein paar Sekunden abklingen lassen und alle Fenster schließen.
 for(let i=0;i<8;i++){await wait(700);await b.evaluate('__perf.closeAll();document.querySelector(".milestone-close,[data-milestone-close],[data-memory-close]")?.click()');}
 await b.evaluate(`__perf.start={x:__mertloch.game.player.x,y:__mertloch.game.player.y}`);
 return b.evaluate('__perf.info()');
}


/** Tipp auf einen Kniff-Knopf per Touch-Ereignis. */
async function tap(b,pt){await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:pt.x,y:pt.y}]});await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}

/** Führt die Szene `name` für `ms` aus (Eingaben aus Node wie ein Finger). */
async function runScene(b,name,ms){
 const t0=Date.now(),until=()=>Date.now()-t0<ms;
 if(name==='idle'){await wait(ms);return {};}
 if(name==='walk'||name==='walkfar'){
  const stick=await b.evaluate(`(()=>{const r=document.querySelector('#touchStick').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,r:r.width*.34};})()`);
  await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:stick.x,y:stick.y}]});
  let dir={x:1,y:0},n=0,lastSteer=0,arrived=false;
  while(until()){if(Date.now()-lastSteer>100){lastSteer=Date.now();const d=await b.evaluate('__perf.steer()');if(!d){arrived=true;break;}dir=d;}
   const j=(n++%2)*0.6;/* kleines Zittern: ein echter Finger liegt nie still, pointermove feuert fast jedes Bild */
   await b.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:stick.x+dir.x*stick.r+j,y:stick.y+dir.y*stick.r}]});await wait(24);}
  await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  if(arrived)await wait(Math.max(0,ms-(Date.now()-t0)));
  return {arrivedEarly:arrived};
 }
 if(name==='combat'){
  const buttons=await b.evaluate(`[...document.querySelectorAll('#touchActions .touch-slot button[data-touch-skill]')].filter(x=>!x.disabled&&x.offsetParent).slice(0,4).map(x=>{const r=x.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,id:x.dataset.touchSkill};})`);
  let i=0;while(until()){if(buttons.length)await tap(b,buttons[i++%buttons.length]);await wait(650);}
  return {skills:buttons.map(x=>x.id)};
 }
 throw Error('Szene unbekannt: '+name);
}

async function prepare(b,name){
 await b.evaluate('__perf.home()');await wait(400);
 if(name==='walk'){const r=await b.evaluate(`__perf.route({x:__perf.start.x+1500,y:__perf.start.y+1400})`);return r;}
 /* Runde 3: Laufstrecke fern der Bude – vom Dorfrand über Wiese und Feld in den Wald (Grundlast ohne Bude, Lichterketten, Clan-Lager) */
 if(name==='walkfar'){const [sx,sy,ex,ey]=FAR_ROUTE;await b.evaluate(`(()=>{const {game,renderer}=__mertloch;Object.assign(game.player,{x:${sx},y:${sy}});renderer.camera.x=${sx};renderer.camera.y=${sy};})()`);await wait(1500);return b.evaluate(`__perf.route({x:${ex},y:${ey}})`);}
 if(name==='combat'){await b.evaluate('__perf.fight(4)');return {};}
 return {};
}


/** Trace einer Szene. Die Ereignisse gehen je Sitzung in einen eigenen Puffer. */
async function traceScene(b,name,ms){
 await b.evaluate('window.mertloch.segments?.(true)');
 if(!b.traceHooked){b.traceHooked=true;b.on('Tracing.dataCollected',e=>{if(b.sink)for(const ev of e.value)b.sink.push(ev);});b.on('Tracing.tracingComplete',()=>b.onComplete?.());}
 const events=b.sink=[];const complete=new Promise(r=>{b.onComplete=r;});
 await b.send('Tracing.start',{traceConfig:{includedCategories:CATEGORIES,recordMode:'recordContinuously'},transferMode:'ReportEvents',bufferUsageReportingInterval:1000});
 await b.evaluate(`performance.mark('perf-handy-start')`);
 /* Runde 3: --toggle=<js an>§§<js aus> schaltet im selben Lauf alle --toggle-ms hin und her (Marke je Wechsel) – Lastschwankungen des Rechners treffen
    beide Zustände gleich; ausgewertet wird je Zustand über alle seine Fenster */
 let toggling=null;if(TOGGLE){const [on,off]=TOGGLE.split('§§');let st=true,stop=false;toggling={done:(async()=>{while(!stop){await b.evaluate(`(async()=>{${st?on:off};performance.mark('perf-toggle-${st?'an':'aus'}');})()`);st=!st;await wait(TOGGLE_MS);}})(),stop:()=>{stop=true;}};}
 const extra=await runScene(b,name,ms);
 if(toggling){toggling.stop();await toggling.done;}
 await b.evaluate(`performance.mark('perf-handy-end')`);
 await b.send('Tracing.end');await complete;
 const mark=n=>events.find(e=>e.name===n&&e.cat?.includes('blink.user_timing'))?.ts;
 const res=analyzeTrace(events,{fromTs:mark('perf-handy-start')??-Infinity,toTs:mark('perf-handy-end')??Infinity});
 if(TOGGLE){const end=mark('perf-handy-end')??Infinity,marks=events.filter(e=>e.cat?.includes('blink.user_timing')&&e.name.startsWith('perf-toggle-')).sort((a,b)=>a.ts-b.ts),parts={an:[],aus:[]};
  for(let i=0;i<marks.length;i++){const from=marks[i].ts+150e3/* 150 ms nach dem Umschalten: laufendes Bild gehört noch zum alten Zustand */,to=i+1<marks.length?marks[i+1].ts:end;if(to-from<300e3)continue;const r=analyzeTrace(events,{fromTs:from,toTs:to});if(!r.error)parts[marks[i].name.slice(12)].push(r);}
  res.toggle=Object.fromEntries(Object.entries(parts).map(([k,v])=>{const m=mergeRuns(v);if(m){delete m.raw;const ev=new Map();let fr=0;for(const r of v){fr+=r.frames;for(const e of r.topEvents||[])ev.set(e.name,(ev.get(e.name)||0)+e.msPerFrame*r.frames);}m.topEvents=[...ev].sort((x,y)=>y[1]-x[1]).slice(0,10).map(([n,t])=>({name:n,msPerFrame:+(t/Math.max(1,fr)).toFixed(2)}));}return [k,m];}));}
 const segments=await b.evaluate('window.mertloch.segments?.(false)||null');
 b.sink=null;events.length=0;return {...res,segments,extra};
}

async function profileScene(b,name,ms){
 await b.send('Profiler.enable');await b.send('Profiler.setSamplingInterval',{interval:250});
 await b.evaluate('__perf.mutations(true)');const heap0=(await b.send('Runtime.getHeapUsage')).usedSize;
 await b.send('Profiler.start');const extra=await runScene(b,name,ms);const {profile}=await b.send('Profiler.stop');
 const mo=await b.evaluate('__perf.mutations(false)');
 const topWriters=Object.entries(mo.byTarget).sort((a,b)=>b[1]-a[1]).slice(0,14).map(([k,v])=>({target:k,perFrame:+(v/Math.max(1,mo.frames)).toFixed(2)}));
 return {profile:summarizeProfile(profile),dom:{frames:mo.frames,recordsPerFrame:+(mo.records/Math.max(1,mo.frames)).toFixed(2),framesWithWritesPct:+(mo.framesWithWrites/Math.max(1,mo.frames)*100).toFixed(1),topWriters},heapDeltaMiB:+(((await b.send('Runtime.getHeapUsage')).usedSize-heap0)/1048576).toFixed(1),extra};
}

/** Eine Szene in einer Sitzung: aufstellen (ungedrosselt), gedrosselt einschwingen, Trace. */
async function measure(b,rate,name){
 await b.send('Emulation.setCPUThrottlingRate',{rate:1});const prep=await prepare(b,name);await b.send('Emulation.setCPUThrottlingRate',{rate});await wait(2500);
 const before=await b.evaluate('__perf.info()');const trace=await traceScene(b,name,SECONDS*1000);const after=await b.evaluate('__perf.info()');
 await b.send('Emulation.setCPUThrottlingRate',{rate:1});return {prep,before,after,trace};
}
const line=(tag,t)=>`${tag}: Hauptfaden/Bild p50 ${t.mainPerFrame?.p50} p95 ${t.mainPerFrame?.p95} p99 ${t.mainPerFrame?.p99} >33 ${t.mainPerFrame?.over33} >50 ${t.mainPerFrame?.over50} · Abstand p50 ${t.interval?.p50} p95 ${t.interval?.p95} >50 ${t.interval?.over50} · ${t.fps} FPS · Arten ${JSON.stringify(t.kindsMean)} · lange Aufgaben ${t.longTasks?.count} · GC ${JSON.stringify(t.gc)}`;

export {start,setup,prepare,runScene,traceScene,profileScene,measure,cleanup,wait};
const isMain=process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href;
if(isMain){
 const report={label:LABEL,date:new Date().toISOString(),device:{...DEVICE,ua:UA},gpuArgs:SOFT?[]:GPU_ARGS,seconds:SECONDS,repeat:REPEAT,runs:[],setup:{}};
 // Varianten nacheinander in je EINEM Browser (zwei gleichzeitig laufende Spiele belasteten sich gegenseitig, auch eingefroren – gemessen
 // 2–3× langsamer). Bei --ab wechseln die Durchgänge A, B, B, A, A, B …, damit langsame Laständerungen des Rechners beide gleich treffen.
 const variants=[{tag:'A',url:arg('url',null)},...(AB?[{tag:'B',url:AB}]:[])],got=new Map();
 try{
  for(let r=0;r<REPEAT;r++)for(const v of (r%2?[...variants].reverse():variants)){
   const b=await start({url:v.url});
   try{const info=await setup(b);report.setup[v.tag]||={url:b.url,...info};console.log('Aufstellung',v.tag,'#'+(r+1),JSON.stringify(info));
    for(const rate of RATES)for(const name of SCENES){let m=await measure(b,rate,name);const k=v.tag+'|'+rate+'|'+name;
     /* Runde 2/3: ungültig sind Kämpfe ohne Schaden im Messfenster (gemessen wurde Stillstand) und Läufe, in denen der Held tot ist (gemessen wurde der
        Todesbildschirm) – bis zu zweimal wiederholen, sonst nicht werten */
     const invalid=x=>x.before?.dead||x.after?.dead?'Held tot':name==='combat'&&!(x.after?.damage>(x.before?.damage||0))?'kein Schaden im Messfenster':null;
     for(let t=0;t<2&&invalid(m);t++){console.log(`   ${rate}× ${name} ${AB?v.tag+' ':''}#${r+1}: ${invalid(m)} – wiederholt`);m=await measure(b,rate,name);}
     if(invalid(m)){console.log('   '+invalid(m)+' – Lauf nicht gewertet');continue;}if(!got.has(k))got.set(k,[]);got.get(k).push(m);
     console.log(line(`${rate}× ${name} ${AB?v.tag+' ':''}#${r+1}`,m.trace));
     if(m.trace.toggle)for(const [k,t] of Object.entries(m.trace.toggle))if(t)console.log(line(`   Umschalter ${k}`,t)+' · Ereignisse '+JSON.stringify(t.topEvents?.slice(0,7).map(e=>e.name.replace(/^.*::/,'')+' '+e.msPerFrame)));
     if(m.trace.segments)console.log('   Abschnitte (Mittel/p95 ms)',Object.entries(m.trace.segments.ms).map(([k,x])=>k+' '+x.mean+'/'+x.p95).join(' · '));
     if(m.trace.segments?.parts&&Object.keys(m.trace.segments.parts).length)console.log('   Welt-Teile (Mittel/p95 ms)',Object.entries(m.trace.segments.parts).map(([k,x])=>k+' '+x.mean+'/'+x.p95).join(' · '),'| je Objektart',Object.entries(m.trace.segments.kinds||{}).slice(0,10).map(([k,v])=>k+' '+v).join(' · '));
     if(m.trace.segments?.worst&&arg('worst',false))console.log('   langsamste Bilder',JSON.stringify(m.trace.segments.worst));
     console.log('   Ereignisse',JSON.stringify(m.trace.topEvents?.slice(0,8).map(e=>e.name+' '+e.msPerFrame)),'Stil/Bild',m.trace.styleRecalcsPerFrame,'Elemente',m.trace.styleElementsPerFrame,'erzwungen',m.trace.forcedPerFrame,'Fäden',JSON.stringify(m.trace.threads?.slice(0,4)));
     if(r===REPEAT-1&&arg('shots',false)){mkdirSync(dirname(OUT),{recursive:true});await b.screenshot(OUT.replace(/\.json$/,'')+'-'+(AB?v.tag+'-':'')+rate+'x-'+name+'.jpg');}
     if(r===REPEAT-1&&PROFILE){await prepare(b,name);await b.send('Emulation.setCPUThrottlingRate',{rate});await wait(2500);m.prof=await profileScene(b,name,Math.min(SECONDS,12)*1000);await b.send('Emulation.setCPUThrottlingRate',{rate:1});
      console.log('   Profil',JSON.stringify(m.prof.profile.top.slice(0,10).map(x=>x.fn+' '+x.pct+'%')),'Canvas',m.prof.profile.canvasPct+'%','DOM/Bild',m.prof.dom.recordsPerFrame);}}
    if(b.errors.length)console.log('Seitenfehler',v.tag,JSON.stringify(b.errors.slice(0,3)));
   }finally{try{b.close();}catch{}closeChromes();}
  }
  for(const v of variants)for(const rate of RATES)for(const name of SCENES){const runs=got.get(v.tag+'|'+rate+'|'+name)||[];if(!runs.length)continue;const merged=mergeRuns(runs.map(m=>m.trace));
   const prof=runs.find(m=>m.prof)?.prof||null;for(const m of runs){delete m.trace.raw;delete m.prof;}
   report.runs.push({rate,scene:name,session:v.tag,url:report.setup[v.tag]?.url,merged,runs,prof});
   console.log(line(`== ${rate}× ${name} ${v.tag} (${runs.length} Läufe)`,merged));}
  mkdirSync(dirname(OUT),{recursive:true});writeFileSync(OUT,JSON.stringify(report,null,1));console.log('Bericht: '+OUT);
  // --assert: Stillstand ohne Zustandsänderung darf das DOM kaum anfassen und kein Layout erzwingen (Regressionsschutz der Runde 2026-09-27).
  if(arg('assert',false)){const bad=[];for(const run of report.runs.filter(x=>x.session==='A'&&x.scene==='idle')){const forced=Math.max(...run.runs.map(m=>m.trace.forcedPerFrame||0));if(forced>1)bad.push(run.rate+'× Stillstand: '+forced+' erzwungene Stil-/Layout-Durchgänge je Bild (Grenze 1)');const dom=run.prof?.dom?.recordsPerFrame;if(dom!=null&&dom>3)bad.push(run.rate+'× Stillstand: '+dom+' DOM-Änderungen je Bild (Grenze 3)');}
   if(bad.length){console.error('PRÜFUNG ROT\n'+bad.join('\n'));process.exitCode=1;}else console.log('PRÜFUNG GRÜN: Stillstand ohne erzwungenes Layout und DOM-Schreiben');}
 }finally{cleanup();}
}
