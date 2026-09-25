// Ladeschirm beim Spielstart: Hintergrund aus der Bildpipeline, Bierdeckel mit Strichliste, Bierbalken mit echtem Fortschritt.
// Läuft als eigenes kleines Modul VOR app.js (index.html) – so zählt der Balken schon, während das Spiel seine Module lädt.
// app.js meldet danach die Schritte: boot.phase('karte') … boot.finish(); bei Fehlern boot.fail().
import {LOADING_UI as T} from './content/loading-screen.js';

/** Anteil jedes Schritts am Gesamtbalken (Summe 100). Die Module sind der längste Teil eines kalten Starts. */
export const PHASE_WEIGHT={module:40,karte:10,welt:10,grafik:30,start:10};
const MODULE_KEY='mertloch-boot-modules',BYTES_KEY='mertloch-boot-bytes',SCENE_KEY='mertloch-boot-scene',ROSTER_KEY='mertloch-characters';
const CAP=.97,MIN_VISIBLE_MS=700,TIP_MS=7000;

// E-72 Runde 5 (Kenner-Befund klicks 3 „erst der zweite Esc überspringt den Film“): Nach „Held erstellen“ lädt die Seite neu, dann laufen
// Ladeschirm und Spielstart, erst danach hält der Einführungsfilm die Tasten. Ein Esc in dieser Zeit – noch auf der alten Seite, auf dem
// Ladeschirm oder bevor der Film angefordert ist – ging verloren (gemessen: jeder Druck 0–4,5 s nach dem Klick). Dieses Modul läuft vor
// app.js und merkt sich so ein Esc (bootEscaped); app.js überspringt damit beim automatischen Betreten den Film (intro-ui.js start({skip})).
export const ESC_CARRY_KEY='mertloch-boot-esc',CARRY_MS=15000;
export const isEscape=e=>e?.key==='Escape'||e?.key==='Esc'||e?.code==='Escape'||e?.keyCode===27;
const session=()=>{try{return globalThis.sessionStorage||null;}catch{return null;}};
let escaped=false;
try{const s=session();if(s?.getItem(ESC_CARRY_KEY)==='1')escaped=true;s?.removeItem(ESC_CARRY_KEY);}catch{}
if(typeof addEventListener==='function')addEventListener('keydown',e=>{if(isEscape(e))escaped=true;},true);
/** Wurde seit dem Laden dieser Seite (oder kurz vor dem Neuladen, carryEscape) Esc gedrückt? __bootEsc setzt ein Hörer ganz oben in
 *  index.html – ein Esc in den ersten ~300 ms der neuen Seite kam sonst vor diesem Modul an und ging verloren (gemessen). */
export const bootEscaped=()=>escaped||!!globalThis.__bootEsc;
/** Alte Seite, der Held wird angelegt und die Seite gleich neu geladen: Esc bis dahin für die neue Seite merken und schlucken (sonst
 *  wirkte es noch im Anlegen-Schirm als „Zurück“). Liefert die Aufhebung; hebt sich nach CARRY_MS selbst auf (falls nicht neu geladen wird). */
export function carryEscape(){
 if(typeof addEventListener!=='function')return ()=>{};
 const on=e=>{if(!isEscape(e))return;e.preventDefault();e.stopImmediatePropagation();try{session()?.setItem(ESC_CARRY_KEY,'1');}catch{}};
 addEventListener('keydown',on,true);let timer=setTimeout(off,CARRY_MS);
 /* Aufheben (Anlegen gescheitert oder kein Neuladen): das gemerkte Esc gilt dann nicht mehr */
 function off(){clearTimeout(timer);removeEventListener('keydown',on,true);try{session()?.removeItem(ESC_CARRY_KEY);}catch{}}
 return off;
}

/** Gesamtfortschritt 0..1 aus dem aktuellen Schritt und dem Anteil darin. Reine Funktion (Tests). */
export function bootPercent(phases,index,fraction,weights=PHASE_WEIGHT){
 const w=phases.map(p=>weights[p.id]??0),total=w.reduce((a,b)=>a+b,0)||1;
 if(index>=phases.length)return 1;
 const before=w.slice(0,Math.max(0,index)).reduce((a,b)=>a+b,0);
 return Math.min(1,Math.max(0,(before+w[index]*Math.min(1,Math.max(0,fraction)))/total));
}

/** Anteil eines Schritts aus gezählten Einheiten. Mit bekanntem Ziel linear, sonst eine weiche Kurve; nie ganz fertig, bevor der Schritt es sagt. */
export function unitFraction(count,expected,soft=60){
 if(!(count>0))return 0;
 return Math.min(CAP,expected>0?count/expected:1-Math.exp(-count/soft));
}

/** Motivwahl: beim allerersten Start das Story-Motiv (`first`), sonst zufällig, nie zweimal hintereinander dasselbe. */
export function pickScene(scenes,{last=null,firstStart=false,random=Math.random}={}){
 if(!scenes.length)return null;
 if(firstStart){const first=scenes.find(s=>s.first);if(first)return first;}
 const pool=scenes.length>1?scenes.filter(s=>s.id!==last):scenes;
 return pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];
}

/** Text über dem Balken: Schrittname, bei zählenden Schritten mit „(3/10)". */
export function phaseText(phase,done=0,total=0){
 if(!phase)return T.ready;
 return phase.label+(phase.count&&total?` (${done}/${total})`:'')+' …';
}

const store=()=>{try{return globalThis.localStorage||null;}catch{return null;}};
const read=(k)=>{try{return store()?.getItem(k)??null;}catch{return null;}};
const write=(k,v)=>{try{store()?.setItem(k,String(v));}catch{}};
const nextFrame=()=>new Promise(r=>{let done=false;const go=()=>{if(!done){done=true;r();}};
 /* zwei Bilder: eins zum Setzen, eins zum Malen; Hintergrund-Tabs haben kein rAF */
 if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>requestAnimationFrame(go));setTimeout(go,50);});

/** Ohne DOM (Tests, Node) ein stummer Schirm mit derselben Schnittstelle. */
const silent={phase:async()=>{},progress:()=>{},track:p=>Promise.all(p),json:r=>r.json(),finish:async()=>{},fail:()=>{},state:()=>({phase:null,percent:0})};

export function mountBoot(el){
 if(!el||typeof document==='undefined')return silent;
 const $=id=>el.querySelector('#'+id);
 const bar=$('bootBar'),pct=$('bootPct'),step=$('bootStep'),tip=$('bootTip'),art=$('bootArt'),caption=$('bootCaption'),coaster=el.querySelector('.boot-coaster'),strokes=[...el.querySelectorAll('.boot-tally path')];
 const phases=T.phases,started=performance.now();
 const s={index:0,fraction:0,count:[0,0],shown:0,finished:false,failed:false};
 for(const node of el.querySelectorAll('[data-boot]'))node.textContent=T[node.dataset.boot]??node.textContent;

 // Hintergrund: erst zeigen, wenn das Bild da ist – bis dahin trägt der Zeltstoff-Grund.
 const scene=pickScene(T.scenes,{last:read(SCENE_KEY),firstStart:!read(ROSTER_KEY)});
 if(scene&&art){
  write(SCENE_KEY,scene.id);
  art.onload=()=>el.classList.add('art-ready');
  art.src='assets/loading/'+scene.id+'.webp';
  if(caption)caption.textContent=scene.caption;
 }

 // Ladetipps: zufälliger Einstieg, dann reihum.
 let tipAt=Math.floor(Math.random()*T.tips.length);
 const showTip=()=>{if(!tip||s.failed)return;tip.classList.remove('in');void tip.offsetWidth;tip.innerHTML=`<b>${T.tipLabel}</b> `;tip.append(T.tips[tipAt%T.tips.length]);tip.classList.add('in');tipAt++;};
 showTip();const tipTimer=setInterval(showTip,TIP_MS);

 // Schritt 1 zählt die Module, die der Browser für das Spiel holt. Ziel = Zahl vom letzten Start.
 const expectedModules=Number(read(MODULE_KEY))||0;
 const seen=new Set();
 const countModule=e=>{if(!/\.m?js(\?|$)/.test(e.name)||seen.has(e.name))return;seen.add(e.name);if(s.index===0){s.fraction=unitFraction(seen.size,expectedModules);render();}};
 let observer=null;
 try{observer=new PerformanceObserver(list=>list.getEntries().forEach(countModule));observer.observe({type:'resource',buffered:true});}catch{performance.getEntriesByType?.('resource').forEach(countModule);}

 function render(){
  const target=s.finished?1:bootPercent(phases,s.index,s.fraction);
  s.shown=Math.max(s.shown,target);
  const p=Math.round(s.shown*100);
  el.style.setProperty('--boot-p',(s.shown*100).toFixed(1));
  if(pct)pct.textContent=p+' %';
  bar?.setAttribute('aria-valuenow',String(p));
  if(step&&!s.failed)step.textContent=s.finished?T.ready:phaseText(phases[s.index],s.count[0],s.count[1]);
  // Strichliste: jeder abgeschlossene Schritt ein Strich, der fünfte kreuzt das Bündel.
  const done=s.finished?phases.length:s.index;
  strokes.forEach((path,i)=>{const on=i<done;if(on&&!path.classList.contains('on')&&coaster){coaster.classList.remove('thunk');void coaster.offsetWidth;coaster.classList.add('thunk');}path.classList.toggle('on',on);});
 }

 const api={
  /** Nächster Schritt; wartet ein gemaltes Bild ab, damit der Wechsel sichtbar wird, bevor schwere Arbeit den Faden belegt. */
  async phase(id){
   const at=phases.findIndex(p=>p.id===id);if(at<=s.index)return nextFrame();
   if(s.index===0&&seen.size>8)write(MODULE_KEY,seen.size);
   if(s.index===0){observer?.disconnect();observer=null;}
   s.index=at;s.fraction=0;s.count=[0,0];render();
   return nextFrame();
  },
  progress(fraction){s.fraction=Math.min(CAP,Math.max(s.fraction,fraction));render();},
  /** Mehrere Ladeaufträge gleichzeitig, jeder erledigte zählt (für „Grafiken werden gezapft (3/10)"). */
  track(promises){
   s.count=[0,promises.length];render();
   return Promise.all(promises.map(p=>Promise.resolve(p).then(v=>{s.count[0]++;s.fraction=unitFraction(s.count[0],s.count[1]);render();return v;})));
  },
  /** Liest eine JSON-Antwort mit Fortschritt (Bytes), wenn der Browser den Datenstrom hergibt. */
  async json(response){
   const reader=response.body?.getReader?.();
   if(!reader)return response.json();
   const total=Number(response.headers.get('content-length'))||Number(read(BYTES_KEY))||0,chunks=[];let got=0;
   for(;;){const {done,value}=await reader.read();if(done)break;chunks.push(value);got+=value.length;api.progress(unitFraction(got,total,150000));}
   if(got)write(BYTES_KEY,got);
   const all=new Uint8Array(got);let o=0;for(const c of chunks){all.set(c,o);o+=c.length;}
   return JSON.parse(new TextDecoder().decode(all));
  },
  /** Balken voll, kurz stehen lassen, ausblenden. `#loading` bekommt am Ende `.hidden` (Prüfskripte warten darauf). */
  async finish(){
   if(s.finished)return;s.finished=true;render();clearInterval(tipTimer);observer?.disconnect();
   el.setAttribute('aria-busy','false');
   const rest=Math.max(0,MIN_VISIBLE_MS-(performance.now()-started));
   await new Promise(r=>setTimeout(r,rest+260));
   el.classList.add('boot-out');
   await new Promise(r=>setTimeout(r,matchMedia?.('(prefers-reduced-motion: reduce)').matches?0:460));
   el.classList.add('hidden');
  },
  /** Start gescheitert: Bild bleibt, Balken wird rot, Knopf lädt neu. */
  fail(err){
   s.failed=true;clearInterval(tipTimer);observer?.disconnect();
   el.classList.add('boot-failed');el.setAttribute('aria-busy','false');
   if(step)step.textContent=T.fail.title;
   if(tip){tip.textContent=T.fail.text;tip.classList.add('in');}
   const button=document.createElement('button');button.type='button';button.className='gold-button ui-button boot-retry';button.id='retryWorld';button.dataset.uiVariant='primary';button.textContent=T.fail.retry;button.onclick=()=>location.reload();
   el.querySelector('.boot-main')?.append(button);button.focus?.();
   if(err)console.error(err);
  },
  state:()=>({phase:s.finished?null:phases[s.index]?.id,percent:Math.round(s.shown*100),failed:s.failed})
 };
 render();
 return api;
}

export const boot=mountBoot(typeof document!=='undefined'?document.getElementById('loading'):null);
