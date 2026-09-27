// Welt-Ebenen-Prüfung (Handy-Leistung Runde 3, 27.09.2026): Jede Maßnahme aus world-layers.js wird in festen Szenen Pixel für Pixel mit dem
// alten Zeichenweg verglichen. Ablauf je Szene: Held hinsetzen, einschwingen (Boden, Sprites, Anziehpuppen fertig), Bildschleife anhalten,
// Zeit einfrieren, dann dasselbe Bild mit verschiedenen Schaltern zeichnen und die Weltfläche auslesen.
//   Grundlage  alle Schalter aus (Stand Runde 2), zweimal gezeichnet – muss gleich sein (sonst ist die Szene nicht fest)
//   je Schalter  nur dieser an → Anteil abweichender Pixel (> 0 Stufen, > 2 Stufen, > 8 Stufen), größte Abweichung
//   alle an      Stand Runde 3; dazu Zeichenbefehle je Bild (Welt-Leinwand) vorher/nachher
// Außerdem Zustandsprüfung für NEUTRAL_ITEMS: Vor und nach jedem Objekt werden Transformation, Deckkraft, Stile, Schrift, Filter, Mischmodus,
// Schatten, Strichmuster und Clip verglichen (mit save/restore drumherum, damit ein Leck nichts verfälscht).
// Rot, wenn: Grundlage nicht wiederholbar, `cull`, `neutral` oder `memo` nicht bitgleich, eine NEUTRAL-Art ihren Zustand ändert, oder eine optisch
// gleiche Maßnahme mehr als 0,5 % der Pixel um mehr als 8 Stufen ändert.
// Aufruf: node scripts/world-layer-check.mjs [--url=http://localhost:4878/] [--cdp=9884] [--out=visual-review/world-layers/bericht.json]
import {writeFileSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
const arg=(k,d)=>{const a=process.argv.find(x=>x.startsWith('--'+k+'='));return a?a.slice(k.length+3):d;};
if(!process.argv.some(a=>a.startsWith('--cdp=')))process.argv.push('--cdp='+arg('cdp','9884'));
const {start,setup,cleanup,wait}=await import('./perf-handy.mjs');
const OUT=arg('out','visual-review/world-layers/bericht.json');

const PAGE=`(()=>{const {game,renderer}=__mertloch;const L=window.__wl;
 window.__wlc={
  hold(){if(window.__rafOrig)return;window.__rafOrig=window.requestAnimationFrame;window.requestAnimationFrame=cb=>{window.__held=cb;return 0;};},
  resume(){this.thawClock?.();if(!window.__rafOrig)return;window.requestAnimationFrame=window.__rafOrig;window.__rafOrig=null;const cb=window.__held;window.__held=null;if(cb)requestAnimationFrame(cb);},
  async settle(){const pd=(await import('./paperdoll-art.js')).paperdoll,sj=await import('./sprite-jobs.js');for(let i=0;i<60;i++){const w=pd.debug?.worker?.()||{},s=sj.spriteJobStats,t=renderer.prefetch;const busy=(w.pending||0)>0||s.sent>s.done+s.failed||(t?.waiting?.size||0)>0;if(!busy)return i;await new Promise(r=>setTimeout(r,150));}return -1;},
  /* Echtzeit einfrieren: manches läuft nach performance.now() (Bildfolgen im Baukasten, Söldner-Übergänge, Anziehpuppen-Ersatzbilder) */
  freezeClock(){if(this.realNow)return;const P=performance,real=P.now.bind(P),at=real();this.realNow=real;P.now=()=>at;},
  thawClock(){if(!this.realNow)return;performance.now=this.realNow;this.realNow=null;},
  freeze(t){this.freezeClock();this.t=t;game.time=t;renderer.shake=0;renderer.heroShiftNow={x:0,y:0};renderer.camera.x=game.player.x;renderer.camera.y=game.player.y;renderer.lastDrawTime=t-.016;},
  draw(){const g=game;g.time=this.t;renderer.shake=0;renderer.lastDrawTime=this.t-.016;/* Kamera fest: Heldenversatz (offene Fenster im Kampf) ist schon am Ziel, Kamera steht darauf */const hs=renderer.heroShift;renderer.heroShiftNow={x:hs?.x||0,y:hs?.y||0};renderer.camera.x=g.player.x-renderer.heroShiftNow.x;renderer.camera.y=g.player.y-renderer.heroShiftNow.y;/* Haus-Überblendung am Ziel (läuft sonst je Bild weiter, wenn der Held im Kampf über die Schwelle trat) */const h=g.world.base?.house;if(h&&this.inside)renderer.houseFade=this.inside(h,g.player.x,g.player.y)?1:0;renderer.draw();const cv=renderer.canvas;return renderer.ctx.getImageData(0,0,cv.width,cv.height).data;},
  countOps(fn){const P=CanvasRenderingContext2D.prototype,main=renderer.canvas,names=['fillRect','drawImage','fill','stroke','clearRect','fillText','strokeText','putImageData','save','restore','setTransform','translate','scale','rotate','beginPath','clip','arc','ellipse','moveTo','lineTo','rect','closePath','transform','createLinearGradient','createRadialGradient','measureText','strokeRect','setLineDash','quadraticCurveTo','bezierCurveTo'],undo=[];let n=0;
   for(const k of names){const o=P[k];if(typeof o!=='function')continue;undo.push(()=>P[k]=o);P[k]=function(...a){if(this.canvas===main)n++;return o.apply(this,a);};}
   try{fn();}finally{undo.forEach(u=>u());}return n;},
  cmp(a,b){let d0=0,d2=0,d8=0,mx=0;const n=a.length/4;for(let i=0;i<a.length;i+=4){const m=Math.max(Math.abs(a[i]-b[i]),Math.abs(a[i+1]-b[i+1]),Math.abs(a[i+2]-b[i+2]),Math.abs(a[i+3]-b[i+3]));if(m){d0++;if(m>2)d2++;if(m>8)d8++;if(m>mx)mx=m;}}const pct=v=>+(v/n*100).toFixed(3);return {pixels:n,diff:pct(d0),over2:pct(d2),over8:pct(d8),max:mx};},
  /* Zustand je Objekt: vor/nach dem Zeichnen (mit save/restore drumherum) */
  states(){const keys=['globalAlpha','globalCompositeOperation','filter','fillStyle','strokeStyle','lineWidth','lineCap','lineJoin','miterLimit','lineDashOffset','font','textAlign','textBaseline','direction','imageSmoothingEnabled','imageSmoothingQuality','shadowBlur','shadowColor','shadowOffsetX','shadowOffsetY'];
   const snap=c=>{const t=c.getTransform(),o={t:[t.a,t.b,t.c,t.d,t.e,t.f].join(','),dash:c.getLineDash().join(',')};for(const k of keys){const v=c[k];o[k]=typeof v==='object'?'[obj]':v;}return o;};
   const P=CanvasRenderingContext2D.prototype,so=P.save,ro=P.restore,co=P.clip,main=renderer.canvas;let depth=0,base=-1,clipAtBase=false,unbalanced=0;
   P.save=function(){if(this.canvas===main)depth++;return so.apply(this,arguments);};P.restore=function(){if(this.canvas===main)depth--;return ro.apply(this,arguments);};P.clip=function(){if(this.canvas===main&&depth===base)clipAtBase=true;return co.apply(this,arguments);};
   const by={};let before=null;
   renderer.itemHook=(c,item,phase)=>{if(phase==='vor'){before=snap(c);base=depth;clipAtBase=false;return;}const after=snap(c),e=by[item.type]||={n:0,leaks:{}};e.n++;for(const k in before)if(before[k]!==after[k])e.leaks[k]=(e.leaks[k]||0)+1;if(clipAtBase)e.leaks.clip=(e.leaks.clip||0)+1;if(depth!==base)e.leaks.saveBalance=(e.leaks.saveBalance||0)+1;base=-1;};
   try{renderer.draw();}finally{renderer.itemHook=null;P.save=so;P.restore=ro;P.clip=co;}return by;}
 };return true;})()`;

const scenes=[
 {name:'Bude',at:'start'},
 {name:'Hof (drinnen)',at:'house'},
 {name:'Kirche/Clan-Lager',at:'church'},
 {name:'Dorf',at:[8700,10500]},
 {name:'Feld',at:[11202,10453]},
 {name:'Wald',at:[2100,2700]},
 {name:'Kampf (Bude)',at:'start',fight:true},
];
const report={date:new Date().toISOString(),scenes:[],problems:[]};
let b;try{
 b=await start();await setup(b);await b.evaluate(PAGE);
 const {keys,neutral}=await b.evaluate(`(async()=>{const m=await import('./world-layers.js');window.__wl=m;return {keys:m.WORLD_LAYER_KEYS,neutral:[...m.NEUTRAL_ITEMS]};})()`);
 const EXACT=['cull','neutral','memo'],OPTICAL=keys.filter(k=>!EXACT.includes(k));
 const only=arg('only',null);/* --only=Kampf: nur Szenen, deren Name das enthält */
 for(const sc of scenes.filter(x=>!only||x.name.includes(only))){
  await b.evaluate('__wlc.resume();__perf.home()');await wait(300);
  const pos=await b.evaluate(`(()=>{const {game,renderer}=__mertloch,w=game.world,at=${JSON.stringify(sc.at)};let x,y;if(at==='start'){x=__perf.start.x;y=__perf.start.y;}else if(at==='house'){const h=w.base.house;x=(h.minX+h.maxX)/2;y=(h.minY+h.maxY)/2;}else if(at==='church'){x=w.church.x;y=w.church.maxY+60;}else [x,y]=at;Object.assign(game.player,{x,y});renderer.camera.x=x;renderer.camera.y=y;return [Math.round(x),Math.round(y)];})()`);
  if(sc.fight)await b.evaluate('__perf.fight(4)');
  await wait(4000);const settled=await b.evaluate('__wlc.settle()');
  /* Kampf: Nachschub-/Heil-Takt anhalten, sonst ändert sich die Szene zwischen zwei Bildern */await b.evaluate('clearInterval(__perf.keep);__perf.keep=null;__wlc.hold()');await wait(250);
  const r=await b.evaluate(`(async()=>{const W=window.__wl,C=window.__wlc,out={};C.inside=(await import('./world-house.js')).insideHouse;C.freeze(__mertloch.game.time);
   const set=v=>W.setWorldLayers(v);
   set(false);C.draw();const base=C.draw(),again=C.draw();out.repeat=C.cmp(base,again);out.opsBefore=C.countOps(()=>C.draw());
   out.states=C.states();
   out.features={};for(const k of W.WORLD_LAYER_KEYS){set(false);W.worldLayers[k]=true;C.draw();const img=C.draw();out.features[k]=C.cmp(base,img);}
   set(true);C.draw();const all=C.draw();out.features.alle=C.cmp(base,all);out.opsAfter=C.countOps(()=>C.draw());
   return out;})()`);
  report.scenes.push({...sc,pos,settled,...r});
  const bad=[];if(r.repeat.diff>0)bad.push('Grundlage nicht wiederholbar ('+r.repeat.diff+' %)');
  for(const k of EXACT.filter(k=>r.features[k]))if(r.features[k].diff>0)bad.push(k+' nicht bitgleich: '+r.features[k].diff+' % der Pixel, bis '+r.features[k].max+' Stufen');
  for(const k of OPTICAL)if(r.features[k].over8>.5)bad.push(k+': '+r.features[k].over8+' % der Pixel um mehr als 8 Stufen');
  for(const t of neutral){const e=r.states[t],leaks=e?Object.keys(e.leaks).filter(k=>k!=='globalAlpha'):[];if(leaks.length)bad.push('NEUTRAL „'+t+'“ ändert den Zustand: '+JSON.stringify(e.leaks)+' bei '+e.n+' Objekten');}
  for(const p of bad)report.problems.push(sc.name+': '+p);
  console.log(`== ${sc.name} ${JSON.stringify(pos)} · eingeschwungen ${settled} · Befehle je Bild ${r.opsBefore} → ${r.opsAfter} · Wiederholung ${r.repeat.diff} %`);
  for(const [k,v] of Object.entries(r.features))console.log(`   ${k.padEnd(9)} abweichend ${v.diff} % · > 2 Stufen ${v.over2} % · > 8 Stufen ${v.over8} % · max ${v.max}`);
  const leaky=Object.entries(r.states).filter(([,e])=>Object.keys(e.leaks).length).map(([t,e])=>t+'('+e.n+'):'+Object.keys(e.leaks).join('/'));console.log('   Zustand geändert von: '+(leaky.join(' · ')||'–')+' | sauber: '+Object.entries(r.states).filter(([,e])=>!Object.keys(e.leaks).length).map(([t,e])=>t+'('+e.n+')').join(' '));
  if(bad.length)console.log('   PROBLEME: '+bad.join(' | '));
 }
 await b.evaluate('__wlc.resume()');
 mkdirSync(dirname(OUT),{recursive:true});writeFileSync(OUT,JSON.stringify(report,null,1));console.log('Bericht: '+OUT);
 if(report.problems.length){console.error('PRÜFUNG ROT\n'+report.problems.join('\n'));process.exitCode=1;}else console.log('PRÜFUNG GRÜN: cull/neutral/memo bitgleich, NEUTRAL-Arten ohne Zustandsänderung, übrige Maßnahmen optisch gleich');
}finally{try{b?.close();}catch{}cleanup();}
