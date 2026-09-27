// Handy-Leistung (2026-09-27): Messauswertung, „nur schreiben, was sich ändert“, Lesen am Bildanfang, Zwischenbilder – und dass die
// umgebauten Rechenwege (Kontur der Anziehpuppe, dringendes Bodenstück, Kollision) dasselbe liefern wie vorher.
import test from 'node:test';
import assert from 'node:assert/strict';
import {World} from '../world.js';/* vor terrain-prefetch.js laden: sonst Ringimport world-props ↔ content */
import {circleIntersectsBox} from '../world-collision.js';
import {analyzeTrace,stats,mergeRuns,summarizeProfile} from '../scripts/perf-handy-lib.mjs';
import {setText,setHidden,setAttr,setData,setStyle,setVar,setHtml} from '../dom-write.js';
import {onLayoutPhase,runLayoutPhase,rectOf,viewport} from '../layout-phase.js';
import {cachedLayer,layerCacheStats} from '../layer-cache.js';
import {composeCore} from '../paperdoll-kern.js';
import {shrinkPixels,makeSnap} from '../paperdoll-shrink.js';
import {TerrainPrefetch} from '../terrain-prefetch.js';

// ---------- Messauswertung ----------
const ev=(name,ts,dur,extra={})=>({ph:'X',name,ts,dur,pid:1,tid:1,cat:'devtools.timeline',...extra});
const meta=[{ph:'M',name:'thread_name',pid:1,tid:1,args:{name:'CrRendererMain'}},{ph:'M',name:'thread_name',pid:1,tid:2,args:{name:'Compositor'}}];
test('Auswertung: Bild = Aufgabe mit rAF, Hauptfaden-Zeit bis zum nächsten Bildbeginn, Arten als Selbstzeit',()=>{
 const events=[...meta,
  ev('ThreadControllerImpl::RunTask',0,10000),ev('FireAnimationFrame',100,6000),ev('UpdateLayoutTree',6200,2000,{args:{elementCount:12}}),ev('Paint',8300,1000),
  ev('ThreadControllerImpl::RunTask',12000,3000),ev('TimerFire',12100,2500),
  ev('ThreadControllerImpl::RunTask',20000,40000),ev('FireAnimationFrame',20100,39000),ev('MinorGC',30000,5000),
  ev('ThreadControllerImpl::RunTask',70000,5000),ev('FireAnimationFrame',70100,4000)];
 const r=analyzeTrace(events);
 assert.equal(r.frames,2);assert.equal(r.interval.max,50);
 assert.deepEqual(r.raw.busy,[13,40]);/* Bild 1: 10 + 3 ms (Timer zählt mit), Bild 2: 40 ms */
 assert.equal(r.mainPerFrame.over33,1);assert.equal(r.longTasks.count,0);
 assert.equal(r.raw.kinds.style[0],2);assert.equal(r.raw.kinds.gc[1],5);assert.equal(r.raw.kinds.script[1],34);/* 39 − 5 GC */
 assert.equal(r.styleElementsPerFrame,6);
});
test('Kennzahlen und Zusammenfassen mehrerer Läufe',()=>{
 const s=stats([10,20,30,40,60]);assert.equal(s.p50,30);assert.equal(s.max,60);assert.equal(s.over33,2);assert.equal(s.over50,1);
 const run=(busy)=>({raw:{busy,interval:busy,kinds:Object.fromEntries(['script','style','layout','paint','gc','idle','input','other'].map(k=>[k,busy.map(()=>0)])),seconds:1,longTasks:[],gc:[]}});
 const m=mergeRuns([run([10,10]),run([60])]);assert.equal(m.frames,3);assert.equal(m.mainPerFrame.over50,1);assert.equal(m.fps,1.5);
});
test('Profil: Canvas-Aufrufe und Leerlauf getrennt',()=>{
 const nodes=[{id:1,callFrame:{functionName:'(root)',url:''},children:[2,3,4]},{id:2,callFrame:{functionName:'(idle)',url:''}},{id:3,callFrame:{functionName:'draw',url:'http://x/renderer.js',lineNumber:9},children:[5]},{id:4,callFrame:{functionName:'(garbage collector)',url:''}},{id:5,callFrame:{functionName:'drawImage',url:''}}];
 const p=summarizeProfile({nodes,samples:[2,3,5,5,4],timeDeltas:[1000,1000,1000,1000,1000]});
 assert.equal(p.idlePct,20);assert.equal(p.canvasPct,50);assert.equal(p.gcPct,25);assert.equal(p.canvasCallers[0].fn,'drawImage ← draw renderer.js:10');
});

// ---------- Nur schreiben, was sich ändert ----------
function fakeEl(){const writes=[];const attrs=new Map();let text='',hidden=false,html='';const style={_v:{},getPropertyValue(k){return this._v[k]||'';},setProperty(k,v){writes.push('var '+k);this._v[k]=v;}};
 return {writes,style,dataset:{},firstChild:null,get textContent(){return text;},set textContent(v){writes.push('text');text=String(v);},get hidden(){return hidden;},set hidden(v){writes.push('hidden');hidden=v;},
  getAttribute:k=>attrs.has(k)?attrs.get(k):null,setAttribute(k,v){writes.push('attr '+k);attrs.set(k,String(v));},get innerHTML(){return html;},set innerHTML(v){writes.push('html');html=v;this.firstChild=v?{}:null;}};}
test('HUD: gleiche Werte erzeugen keine Schreibvorgänge',()=>{
 const el=fakeEl();
 for(let i=0;i<5;i++){setText(el,'12 m');setHidden(el,true);setAttr(el,'aria-valuenow',40);setData(el,'disposition','aggressive');setVar(el,'--gcd-angle','90deg');setHtml(el,'<b>x</b>');}
 assert.deepEqual(el.writes,['text','hidden','attr aria-valuenow','var --gcd-angle','html']);
 setText(el,'13 m');setHidden(el,false);assert.deepEqual(el.writes.slice(-2),['text','hidden']);
 const s={style:{left:'4px'}};setStyle(s,'left','4px');assert.equal(s.style.left,'4px');setStyle(s,'left','5px');assert.equal(s.style.left,'5px');
 setText(null,'x');setHidden(undefined,true);/* fehlende Elemente sind kein Fehler */
});

// ---------- Lesen am Bildanfang ----------
test('Layout-Phase: Rechtecke am Bildanfang nachgeführt, Aufgaben laufen dort, losgelöste Elemente fallen heraus',()=>{
 let y=10,reads=0;const el={isConnected:true,getBoundingClientRect(){reads++;return {left:0,top:y,right:5,bottom:y+5,width:5,height:5,x:0,y};}};
 const r=rectOf(el);assert.equal(r.top,10);assert.equal(reads,1);
 y=30;assert.equal(rectOf(el).top,10,'zwischen zwei Bildern bleibt der Wert stehen (kein Lesen im Takt)');assert.equal(reads,1);
 const order=[];const off=onLayoutPhase(()=>order.push(rectOf(el).top));runLayoutPhase();assert.deepEqual(order,[30]);assert.equal(reads,2);
 off();el.isConnected=false;runLayoutPhase();assert.equal(order.length,1);assert.equal(reads,2);
 assert.deepEqual(viewport(),{w:0,h:0},'ohne DOM: leere Fenstergröße statt Fehler');
});

// ---------- Zwischenbilder ----------
test('Zwischenbild: ohne DOM direkt zeichnen; mit DOM einmal bauen, dann kopieren; neuer Schlüssel baut neu; halbe Pixel zeichnen direkt',()=>{
 const main=(t)=>{const calls=[];return {calls,globalAlpha:1,imageSmoothingEnabled:false,imageSmoothingQuality:'low',getTransform:()=>t,save(){},restore(){},setTransform(){},drawImage(cv,x,y){calls.push([x,y,cv.width,cv.height]);}};};
 assert.equal(cachedLayer(main({a:2,b:0,c:0,d:2,e:0,f:0}),{},'k',{x0:0,y0:0,x1:10,y1:10},()=>{}),false);
 globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({setTransform(){},set imageSmoothingEnabled(v){},set imageSmoothingQuality(v){}})})};
 try{
  const owner={},box={x0:100,y0:50,x1:140,y1:70};let paints=0;const paint=()=>{paints++;};
  const c=main({a:2,b:0,c:0,d:2,e:-150,f:-60});
  assert.equal(cachedLayer(c,owner,'k1',box,paint),true);assert.equal(cachedLayer(c,owner,'k1',box,paint),true);
  assert.equal(paints,1);assert.deepEqual(c.calls[0],[50,40,80,40]);/* 2×100−150, 2×50−60; 40×20 Einheiten bei Dichte 2 */
  assert.equal(cachedLayer(c,owner,'k2',box,paint),true);assert.equal(paints,2);
  assert.equal(cachedLayer(main({a:3,b:0,c:0,d:3,e:-150.5,f:0}),owner,'k2',box,paint),false,'Versatz auf halben Gerätepixeln');
  assert.equal(cachedLayer(main({a:2,b:.1,c:0,d:2,e:0,f:0}),owner,'k2',box,paint),false,'gedreht');
  layerCacheStats.off=true;assert.equal(cachedLayer(c,owner,'k2',box,paint),false);layerCacheStats.off=false;
 }finally{delete globalThis.document;}
});

// ---------- Umgebaute Rechenwege liefern dasselbe ----------
const rand=seed=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};
/** Frühere Fassung der Kontur (vor 2026-09-27): erst sammeln, dann nachdunkeln. */
function oldContour(out,W,H,box){const sil=[],T=[44,32,34];for(let y=box.y0;y<=box.y1;y++)for(let x=box.x0;x<=box.x1;x++){const i=y*W+x;if(!out[i*4+3])continue;
 const r=x+1>=W||!out[(i+1)*4+3],b=y+1>=H||!out[(i+W)*4+3],l=x<1||!out[(i-1)*4+3],t=y<1||!out[(i-W)*4+3];if(r||b)sil.push([i,.42]);else if(l||t)sil.push([i,.6]);}
 for(const [i,f] of sil)for(let c=0;c<3;c++)out[i*4+c]=out[i*4+c]*f+T[c]*(1-f)*.55;}
test('Anziehpuppe: Kontur im selben Durchgang ergibt dieselben Pixel wie die frühere Zwei-Schritt-Fassung',()=>{
 const R=rand(7),W=40,H=36;const tiles=new Map();
 for(const [s,x0,y0] of [['koerper',6,4],['jacke',10,12],['hut',12,2]]){const w=20,h=18,data=new Uint8ClampedArray(w*h*4);for(let i=0;i<w*h;i++)if(R()<.7){data[i*4]=R()*255;data[i*4+1]=R()*255;data[i*4+2]=R()*255;data[i*4+3]=255;}tiles.set(s,{data,x:x0,y:y0,w,h});}
 const out=composeCore(W,H,['rumpf'],['koerper','jacke','hut'],s=>tiles.get(s)||null);
 // Referenz: Kern ohne Kontur nachgebaut (Schatten + Kopieren), darauf die alte Zwei-Schritt-Kontur
 const plain=composeCorePlain(W,H,['koerper','jacke','hut'],tiles);oldContour(plain.out,W,H,plain.box);
 assert.deepEqual([...out],[...plain.out]);
});
/** Nachbau des Kerns ohne Kontur (Schatten + Kopieren wie paperdoll-kern.js), damit die alte Kontur daneben laufen kann. */
function composeCorePlain(W,H,srcs,tiles){const out=new Uint8ClampedArray(W*H*4),dark=new Uint8Array(W*H),SH=[[0,1],[1,1],[1,0],[0,2],[1,2]];let bx0=W,by0=H,bx1=-1,by1=-1;
 for(const s of srcs){const t=tiles.get(s);const td=t.data,ox=t.x,oy=t.y,tw=t.w,th=t.h;if(ox<bx0)bx0=ox;if(oy<by0)by0=oy;if(ox+tw-1>bx1)bx1=ox+tw-1;if(oy+th-1>by1)by1=oy+th-1;
  for(let yy=0;yy<th;yy++)for(let xx=0;xx<tw;xx++){if(!td[(yy*tw+xx)*4+3])continue;const x=xx+ox,y=yy+oy;for(const [dx,dy] of SH){const X=x+dx,Y=y+dy;if(X>=W||Y>=H)continue;const ax=xx+dx,ay=yy+dy;if(ax<tw&&ay<th&&td[(ay*tw+ax)*4+3])continue;const j=Y*W+X;if(!out[j*4+3]||dark[j])continue;dark[j]=1;out[j*4]*=.8;out[j*4+1]*=.75;out[j*4+2]*=.84;}}
  for(let yy=0;yy<th;yy++)for(let xx=0;xx<tw;xx++){const si=(yy*tw+xx)*4;if(!td[si+3])continue;const i=(yy+oy)*W+xx+ox;out[i*4]=td[si];out[i*4+1]=td[si+1];out[i*4+2]=td[si+2];out[i*4+3]=255;dark[i]=0;}}
 return {out,box:{x0:bx0,y0:by0,x1:bx1,y1:by1}};}
test('Anziehpuppe: Verkleinern (gemeinsam für Hauptfaden und Worker) wie die frühere Fassung mit Konturliste',()=>{
 const R=rand(11),W=60,H=50,px=new Uint8ClampedArray(W*H*4);for(let i=0;i<W*H;i++)if(R()<.6){px[i*4]=R()*255;px[i*4+1]=R()*255;px[i*4+2]=R()*255;px[i*4+3]=R()<.1?128:255;}
 const pal=[[20,20,30],[200,80,60],[90,160,70],[240,230,200],[60,60,140]],m=new Map([[px[0]<<16|px[1]<<8|px[2],[1,2,3]]]);
 const got=shrinkPixels(px,{x0:0,y0:0,x1:W-1,y1:H-1},W,H,.31,m,makeSnap(pal));
 // Referenz: frühere Rechnung mit Konturliste und [44,32,34][c]
 const pick=makeSnap(pal),w=Math.max(1,Math.round(W*.31)),h=Math.max(1,Math.round(H*.31)),o=new Uint8ClampedArray(w*h*4),k=.31;
 for(let y=0;y<h;y++){const y0=Math.floor(y/k),y1=Math.min(H,Math.ceil((y+1)/k));for(let x=0;x<w;x++){const x0=Math.floor(x/k),x1=Math.min(W,Math.ceil((x+1)/k));let r=0,g=0,b=0,a=0;
  for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++){const i=(yy*W+xx)*4;if(!px[i+3])continue;const al=px[i+3]/255,rc=m.get(px[i]<<16|px[i+1]<<8|px[i+2]);if(rc){r+=rc[0]*al;g+=rc[1]*al;b+=rc[2]*al;}else{r+=px[i]*al;g+=px[i+1]*al;b+=px[i+2]*al;}a+=al;}
  if(!a||a/Math.max(1,(y1-y0)*(x1-x0))<.42)continue;const c=pick(r/a,g/a,b/a),j=(y*w+x)*4;o[j]=c[0];o[j+1]=c[1];o[j+2]=c[2];o[j+3]=255;}}
 const edge=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(!o[i+3])continue;const open=(X,Y)=>X<0||Y<0||X>=w||Y>=h||!o[(Y*w+X)*4+3];if(open(x+1,y)||open(x,y+1))edge.push([i,.45]);else if(open(x-1,y)||open(x,y-1))edge.push([i,.62]);}
 for(const [i,f] of edge)for(let c=0;c<3;c++)o[i+c]=o[i+c]*f+[44,32,34][c]*(1-f)*.55;
 assert.equal(got.w,w);assert.deepEqual([...got.data],[...o]);
});
test('Boden: dringendes Stück ohne Kandidatenliste wählt dasselbe Stück wie die frühere Sortierung',()=>{
 const rules={pieces:8,ring:160,lead:1100,urgentDist:200};
 for(const [ox,oy,dxMove] of [[1000,1000,40],[3000,2000,-30],[512,512,0]]){
  const p=new TerrainPrefetch({},rules),chosen=[];p.build=(key,gx,gy)=>({key,gx,gy,done:new Uint8Array(64),count:0,filter:''});p.piece=(b,i,j)=>chosen.push(b.key+':'+i+','+j);
  const keyOf=(gx,gy)=>gx+','+gy,has=k=>k==='2,2';
  p.step({ox:ox-dxMove,oy,W:608,H:272},0,keyOf,has,()=>{});p.step({ox,oy,W:608,H:272},0,keyOf,has,()=>{});/* Laufrichtung setzen */
  p.urgent({ox,oy,W:608,H:272},keyOf,has,()=>{});
  // Referenz: alle Kandidaten, stabil sortiert, erstes nur im Abstand urgentDist
  const {dx,dy,moving}=p.motion,S=512,n=8,s=S/n,W=608,H=272,cx=ox+W/2,cy=oy+H/2,R=rules,cand=[];
  const x0=ox-R.ring-(moving&&dx<0?-dx*R.lead:0),x1=ox+W+R.ring+(moving&&dx>0?dx*R.lead:0),y0=oy-R.ring-(moving&&dy<0?-dy*R.lead:0),y1=oy+H+R.ring+(moving&&dy>0?dy*R.lead:0);
  for(let gx=Math.floor(x0/S);gx<=Math.floor(x1/S);gx++)for(let gy=Math.floor(y0/S);gy<=Math.floor(y1/S);gy++){const key=keyOf(gx,gy);if(has(key))continue;for(let j=0;j<n;j++)for(let i=0;i<n;i++){const px=gx*S+(i+.5)*s,py=gy*S+(j+.5)*s;if(px<x0-s||px>x1+s||py<y0-s||py>y1+s)continue;const ex=Math.max(ox-px,0,px-ox-W),ey=Math.max(oy-py,0,py-oy-H),dist=Math.hypot(ex,ey),rx=px-cx,ry=py-cy,cos=moving?(rx*dx+ry*dy)/(Math.hypot(rx,ry)||1):0;cand.push({key,i,j,dist,score:dist*(1-.5*cos)});}}
  cand.sort((a,b)=>a.score-b.score);const expect=moving&&cand[0]?.dist<=R.urgentDist?[cand[0].key+':'+cand[0].i+','+cand[0].j]:[];
  assert.deepEqual(chosen,expect,`Sicht ${ox},${oy}`);
 }
});
test('Kollision: blocked() ohne nearby() meldet dasselbe',()=>{
 const R=rand(3),w={width:5000,height:5000,grid:new Map()};const add=o=>World.prototype.addGrid.call(w,o);
 for(let i=0;i<80;i++){const x=200+R()*1500,y=200+R()*1500;if(R()<.3)add({x,y,radius:5+R()*20,minX:x-25,maxX:x+25,minY:y-25,maxY:y+25});else{const bw=10+R()*120,bh=10+R()*80;add({minX:x,minY:y,maxX:x+bw,maxY:y+bh});}}
 const old=(x,y,r)=>{if(x<20||y<20||x>w.width-20||y>w.height-20)return true;for(const b of World.prototype.nearby.call(w,x,y,r)){if(b.radius){if(Math.hypot(x-b.x,y-b.y)<r+b.radius)return true;continue;}if(circleIntersectsBox(x,y,r,b))return true;}return false;};
 let hits=0;for(let i=0;i<3000;i++){const x=R()*1900,y=R()*1900,r=1+R()*12,a=World.prototype.blocked.call(w,x,y,r);if(a)hits++;assert.equal(a,old(x,y,r),`${x},${y},${r}`);}
 assert.ok(hits>100&&hits<2900,'Stichprobe trifft und verfehlt');
});
