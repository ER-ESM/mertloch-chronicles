// Auswertung der Handy-Messung (perf-handy.mjs), rein und ohne Browser – damit testbar (tests/perf-handy-lib.test.mjs).
// Eingabe: Chrome-Trace-Ereignisse (Tracing.dataCollected) bzw. ein CPU-Profil (Profiler.stop). Ausgabe: Kennzahlen je Bild.
//
// Ein „Bild“ ist die Hauptfaden-Aufgabe, die die requestAnimationFrame-Rückrufe ausführt (BeginMainFrame: rAF, Stil, Layout, Paint,
// Commit in EINER Aufgabe). Hauptfaden-Zeit je Bild = belegte Zeit aller obersten Aufgaben von einem Bildbeginn bis zum nächsten
// (auch Eingabe, Timer, Leerlauf-Rückrufe, GC). Das ist die Zeit, die ein Handy-Prozessor für das Bild rechnen muss.
// Raster/Compositor/GPU-Prozess liegen auf anderen Fäden und werden getrennt ausgewiesen (headless ohne Grafikkarte überzeichnet).

const pct=(sorted,q)=>sorted.length?sorted[Math.min(sorted.length-1,Math.floor(sorted.length*q))]:0;
const round=(v,d=1)=>Math.round(v*10**d)/10**d;
/** p50/p95/p99, Mittel, Maximum und Zahl der Werte über 16,7 / 33 / 50 ms. */
export function stats(values){const s=[...values].sort((a,b)=>a-b),n=s.length;
 return {n,mean:round(n?s.reduce((a,b)=>a+b,0)/n:0,2),p50:round(pct(s,.5),2),p95:round(pct(s,.95),2),p99:round(pct(s,.99),2),max:round(n?s[n-1]:0,2),
  over16:s.filter(v=>v>16.7).length,over33:s.filter(v=>v>33.4).length,over50:s.filter(v=>v>50).length};}

// Ereignisnamen → Kostenart (Selbstzeit, verschachtelte Ereignisse werden abgezogen).
const KIND=new Map([
 ...['FireAnimationFrame','FunctionCall','EventDispatch','TimerFire','EvaluateScript','v8.execute','V8.Execute','RunMicrotasks','v8.callFunction','v8.run','V8.RunMicrotasks','ResizeObserverController::BroadcastObservations','IntersectionObserverController::computeIntersections'].map(n=>[n,'script']),
 ['FireIdleCallback','idle'],
 ...['UpdateLayoutTree','RecalculateStyles','ParseAuthorStyleSheet'].map(n=>[n,'style']),
 ...['Layout','UpdateLayout'].map(n=>[n,'layout']),
 ...['PrePaint','Paint','PaintImage','UpdateLayer','Layerize','Commit','CompositeLayers','UpdateLayerTree','LayerTreeHost::UpdateLayers','LocalFrameView::RunPaintLifecyclePhase','PaintArtifactCompositor::Update'].map(n=>[n,'paint']),
 ...['MinorGC','MajorGC','BlinkGC.AtomicPauseMarkEpilogue','BlinkGC.AtomicPauseSweepAndCompact','CppGC.AtomicMark','V8.GCScavenger','V8.GC_SCAVENGER','V8.GC_MARK_COMPACTOR','V8.GCFinalizeMC','V8.GCIncrementalMarking','V8.GC_MC_INCREMENTAL','V8.GC_MC_INCREMENTAL_FINALIZE','V8.GCCompactor','V8.GC_MINOR_MARK_SWEEPER','MinorMS'].map(n=>[n,'gc']),
 ...['HitTest','EventTiming'].map(n=>[n,'input'])]);
export const KINDS=['script','style','layout','paint','gc','idle','input','other'];
const kindOf=name=>KIND.get(name)||(/^(V8\.GC|BlinkGC|CppGC)/.test(name)?'gc':null);

/** Hauptfaden der Seite: der CrRendererMain mit den meisten FireAnimationFrame-Ereignissen. */
export function mainThread(events){const names=new Map(),count=new Map();
 for(const e of events)if(e.ph==='M'&&e.name==='thread_name')names.set(e.pid+':'+e.tid,e.args?.name);
 for(const e of events)if(e.name==='FireAnimationFrame'){const k=e.pid+':'+e.tid;if(names.get(k)==='CrRendererMain')count.set(k,(count.get(k)||0)+1);}
 const best=[...count].sort((a,b)=>b[1]-a[1])[0];if(!best)return null;const [pid,tid]=best[0].split(':').map(Number);return {pid,tid,names};}

/** Vollständige Ereignisse ('X', dazu B/E-Paare) eines Fadens, sortiert und verschachtelt: je Ereignis Selbstzeit und Eltern. */
function threadEvents(events,pid,tid){const list=[],open=[];
 for(const e of events){if(e.pid!==pid||e.tid!==tid)continue;
  if(e.ph==='X'&&e.dur>=0)list.push({name:e.name,ts:e.ts,dur:e.dur,args:e.args,cat:e.cat});
  else if(e.ph==='B')open.push(e);else if(e.ph==='E'){for(let i=open.length-1;i>=0;i--)if(open[i].name===e.name||!e.name){const b=open.splice(i,1)[0];list.push({name:b.name,ts:b.ts,dur:e.ts-b.ts,args:b.args,cat:b.cat});break;}}}
 list.sort((a,b)=>a.ts-b.ts||b.dur-a.dur);
 const stack=[];for(const e of list){while(stack.length&&stack.at(-1).ts+stack.at(-1).dur<=e.ts)stack.pop();e.parent=stack.at(-1)||null;e.depth=stack.length;e.self=e.dur;if(e.parent)e.parent.self-=Math.min(e.dur,e.parent.ts+e.parent.dur-e.ts);stack.push(e);}
 return list;}

/** Kennzahlen aus einem Trace. `fromTs`/`toTs` (µs) begrenzen auf das Messfenster. */
export function analyzeTrace(events,{fromTs=-Infinity,toTs=Infinity}={}){
 const m=mainThread(events);if(!m)return {error:'kein Hauptfaden mit Bildern gefunden'};
 const all=threadEvents(events,m.pid,m.tid).filter(e=>e.ts>=fromTs&&e.ts<=toTs);
 const top=all.filter(e=>e.depth===0);
 // Bildbeginn = oberste Aufgabe, die rAF-Rückrufe enthält.
 const rafTasks=new Set();for(const e of all)if(e.name==='FireAnimationFrame'){let t=e;while(t.parent)t=t.parent;rafTasks.add(t);}
 const starts=[...rafTasks].sort((a,b)=>a.ts-b.ts);
 const frames=[];let ti=0;
 for(let i=0;i+1<starts.length;i++){const a=starts[i].ts,b=starts[i+1].ts,f={start:a,interval:(b-a)/1000,busy:0,raf:starts[i].dur/1000,kinds:Object.fromEntries(KINDS.map(k=>[k,0])),styleRecalcs:0,styleElements:0,layouts:0,forced:0,gcCount:0};
  while(ti<top.length&&top[ti].ts<a)ti++;
  for(let j=ti;j<top.length&&top[j].ts<b;j++){const t=top[j];f.busy+=Math.min(t.dur,Math.max(0,b-t.ts))/1000;}
  frames.push(f);}
 // Selbstzeiten nach Art dem Bild zuordnen, in dem das Ereignis beginnt.
 const frameAt=ts=>{let lo=0,hi=frames.length-1;if(hi<0||ts<frames[0].start)return null;while(lo<hi){const mid=(lo+hi+1)>>1;if(frames[mid].start<=ts)lo=mid;else hi=mid-1;}const f=frames[lo];return ts<f.start+f.interval*1000?f:null;};
 const inScript=e=>{for(let p=e.parent;p;p=p.parent)if(kindOf(p.name)==='script'||kindOf(p.name)==='idle')return true;return false;};
 const gcPauses=[];
 for(const e of all){const f=frameAt(e.ts);const k=kindOf(e.name)||(e.depth===0?'other':null);
  if(k==='gc'&&(e.name==='MinorGC'||e.name==='MajorGC'||(!e.parent||kindOf(e.parent.name)!=='gc')))gcPauses.push({name:e.name,ms:e.dur/1000});
  if(!f)continue;if(k){let self=e.self;/* Selbstzeit einer unbekannten Kind-Art gehört zur nächsten bekannten Elternart */f.kinds[k]+=Math.max(0,self)/1000;}
  else{let p=e.parent;while(p&&!kindOf(p.name)&&p.depth>0)p=p.parent;const pk=p?(kindOf(p.name)||'other'):'other';f.kinds[pk]+=Math.max(0,e.self)/1000;}
  if(e.name==='UpdateLayoutTree'||e.name==='RecalculateStyles'){f.styleRecalcs++;f.styleElements+=e.args?.elementCount||e.args?.data?.elementCount||0;if(inScript(e))f.forced++;}
  if(e.name==='Layout'){f.layouts++;if(inScript(e))f.forced++;}
  if(e.name==='MinorGC'||e.name==='MajorGC')f.gcCount++;}
 const longTasks=top.filter(t=>t.dur>50000).map(t=>round(t.dur/1000));
 // Teuerste Ereignisnamen nach Selbstzeit (ms je Bild) – zeigt, was sich hinter „paint“/„other“ verbirgt.
 const selfBy=new Map();for(const e of all)if(frameAt(e.ts))selfBy.set(e.name,(selfBy.get(e.name)||0)+Math.max(0,e.self));
 const topEvents=[...selfBy].sort((a,b)=>b[1]-a[1]).slice(0,14).map(([n,v])=>({name:n,msPerFrame:round(v/1000/Math.max(1,frames.length),2)}));
 // Andere Fäden (Raster, Compositor, GPU): belegte Zeit in % des Fensters, oberste Ereignisse vereinigt.
 const span=[Math.max(fromTs,Math.min(...top.map(t=>t.ts))),Math.min(toTs,Math.max(...top.map(t=>t.ts+t.dur)))],busy=new Map();
 const byThread=new Map();for(const e of events){if(e.ph!=='X'||!e.dur||e.ts<span[0]||e.ts>span[1])continue;const k=e.pid+':'+e.tid;let a=byThread.get(k);if(!a)byThread.set(k,a=[]);a.push(e);}
 for(const [k,list] of byThread){list.sort((a,b)=>a.ts-b.ts);let end=-1,sum=0;for(const e of list){const s=Math.max(e.ts,end),f=e.ts+e.dur;if(f>s){sum+=f-s;end=f;}}busy.set(k,sum);}
 const total=span[1]-span[0];
 const threads=[...busy].map(([k,b])=>({thread:m.names.get(k)||k,busyPct:round(b/total*100)})).filter(t=>t.busyPct>=1).sort((a,b)=>b.busyPct-a.busyPct).slice(0,10);
 const perKind=Object.fromEntries(KINDS.map(k=>[k,stats(frames.map(f=>f.kinds[k]))]));
 return {frames:frames.length,seconds:round(total/1e6,1),fps:round(frames.length/(total/1e6),1),
  mainPerFrame:stats(frames.map(f=>f.busy)),rafTask:stats(frames.map(f=>f.raf)),interval:stats(frames.map(f=>f.interval)),
  kindsMean:Object.fromEntries(KINDS.map(k=>[k,perKind[k].mean])),kindsP95:Object.fromEntries(KINDS.map(k=>[k,perKind[k].p95])),
  styleRecalcsPerFrame:round(frames.reduce((a,f)=>a+f.styleRecalcs,0)/Math.max(1,frames.length),2),styleElementsPerFrame:round(frames.reduce((a,f)=>a+f.styleElements,0)/Math.max(1,frames.length),1),
  layoutsPerFrame:round(frames.reduce((a,f)=>a+f.layouts,0)/Math.max(1,frames.length),2),forcedPerFrame:round(frames.reduce((a,f)=>a+f.forced,0)/Math.max(1,frames.length),2),
  longTasks:{count:longTasks.length,max:longTasks.length?Math.max(...longTasks):0},
  gc:{count:gcPauses.length,totalMs:round(gcPauses.reduce((a,g)=>a+g.ms,0)),maxMs:round(gcPauses.reduce((a,g)=>Math.max(a,g.ms),0)),perSecond:round(gcPauses.length/(total/1e6),1)},
  worstFrames:[...frames].sort((a,b)=>b.busy-a.busy).slice(0,6).map(f=>({ms:round(f.busy),kinds:Object.fromEntries(Object.entries(f.kinds).filter(([,v])=>v>=.5).map(([k,v])=>[k,round(v)]))})),
  topEvents,threads,raw:{busy:frames.map(f=>round(f.busy,2)),interval:frames.map(f=>round(f.interval,2)),kinds:Object.fromEntries(KINDS.map(k=>[k,frames.map(f=>round(f.kinds[k],2))])),seconds:total/1e6,longTasks,gc:gcPauses.map(g=>round(g.ms,2))}};
}

/** Mehrere Läufe derselben Szene zu einer Kennzahl zusammenfassen (alle Bilder zusammen, nicht Mittel der Mittel). */
export function mergeRuns(results){const ok=results.filter(r=>r&&r.raw);if(!ok.length)return results[0]||null;const cat=k=>ok.flatMap(r=>r.raw[k]);const busy=cat('busy'),interval=cat('interval'),seconds=ok.reduce((a,r)=>a+r.raw.seconds,0),lt=ok.flatMap(r=>r.raw.longTasks),gc=ok.flatMap(r=>r.raw.gc);
 return {frames:busy.length,seconds:round(seconds,1),fps:round(busy.length/Math.max(1e-9,seconds),1),mainPerFrame:stats(busy),interval:stats(interval),
  kindsMean:Object.fromEntries(KINDS.map(k=>[k,stats(ok.flatMap(r=>r.raw.kinds[k])).mean])),kindsP95:Object.fromEntries(KINDS.map(k=>[k,stats(ok.flatMap(r=>r.raw.kinds[k])).p95])),
  longTasks:{count:lt.length,max:lt.length?Math.max(...lt):0},gc:{count:gc.length,totalMs:round(gc.reduce((a,b)=>a+b,0)),maxMs:round(gc.reduce((a,b)=>Math.max(a,b),0)),perSecond:round(gc.length/Math.max(1e-9,seconds),1)},runs:ok.length};}

const CANVAS=new Set(['drawImage','fillRect','fill','stroke','save','restore','clip','beginPath','moveTo','lineTo','arc','ellipse','rect','fillText','strokeText','measureText','setTransform','transform','translate','scale','rotate','createLinearGradient','createRadialGradient','addColorStop','putImageData','getImageData','strokeRect','clearRect','closePath','quadraticCurveTo','bezierCurveTo','resetTransform','getTransform','createPattern','roundRect','arcTo','isPointInPath','drawFocusIfNeeded','set fillStyle','set strokeStyle','set globalAlpha','set font','set filter','set lineWidth','set globalCompositeOperation','set imageSmoothingEnabled','set shadowBlur','set shadowColor','set textAlign','set textBaseline','getContext']);
/** CPU-Profil: Selbstzeit je Funktion (Name Datei:Zeile), Anteile für Canvas-Aufrufe, GC, Leerlauf. */
export function summarizeProfile(profile,{top=25}={}){
 const byId=new Map(profile.nodes.map(n=>[n.id,n])),self=new Map(),parent=new Map();for(const n of profile.nodes)for(const c of n.children||[])parent.set(c,n);
 let total=0,idle=0,gc=0,program=0,canvas=0;const canvasBy=new Map(),canvasCallers=new Map();
 profile.samples.forEach((id,i)=>{const dt=(profile.timeDeltas[i]||0)/1000,n=byId.get(id),c=n.callFrame,fn=c.functionName||'(anonym)';total+=dt;
  if(fn==='(idle)'){idle+=dt;return;}if(fn==='(garbage collector)')gc+=dt;if(fn==='(program)')program+=dt;
  if(CANVAS.has(fn)&&!c.url){canvas+=dt;canvasBy.set(fn,(canvasBy.get(fn)||0)+dt);const p=parent.get(id)?.callFrame;const k=fn+' ← '+(p?(p.functionName||'(anonym)')+' '+p.url.split('/').pop()+':'+(p.lineNumber+1):'?');canvasCallers.set(k,(canvasCallers.get(k)||0)+dt);}
  const key=fn+(c.url?' '+c.url.split('/').pop()+':'+(c.lineNumber+1):'');self.set(key,(self.get(key)||0)+dt);});
 const busy=total-idle,share=v=>round(v/busy*100);
 return {busyMs:round(busy),idlePct:round(idle/total*100),canvasPct:share(canvas),gcPct:share(gc),programPct:share(program),
  top:[...self].filter(([k])=>k!=='(idle)').sort((a,b)=>b[1]-a[1]).slice(0,top).map(([k,v])=>({fn:k,pct:share(v),ms:round(v)})),
  canvas:[...canvasBy].sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v])=>({fn:k,pct:share(v)})),
  canvasCallers:[...canvasCallers].sort((a,b)=>b[1]-a[1]).slice(0,12).map(([k,v])=>({fn:k,pct:share(v)}))};
}
