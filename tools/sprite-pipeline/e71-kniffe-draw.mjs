// E-72 (Klassen-Ressourcen) Kniff-Icons per Code – Ersatz, solange das Imagegen-Kontingent gesperrt ist; Dateinamen e71-* bleiben.
// Zeichnet jedes Motiv aus Grundformen (Rechteck, Kreis/Ellipse, Polygon, Linie) als Pixelkunst auf der Fähigkeitskachel
// (ability-tile.js, Stilbibel B): Moos-Kachel randlos 64 × 64 mit Vignette und 1 px Tintenrahmen, ein konturiertes Motiv, Licht
// von oben links, Schlagschatten 2 px nach unten rechts. Motivkoordinaten laufen wie bisher 0..57 (Kachelmitte); die Kachel reicht
// 3 px darüber hinaus, Anschnitt-Formen (Unterarm, Tisch) laufen bis an den Rand. Alle Farben liegen in PRECISION_PALETTE; der
// Export (`precision-september.mjs`, Auftragsblatt `e71-kniffe-jobs.json`) übernimmt das Bild 1 : 1 (Maßstab 1, kein Rand).
//
//   node tools/sprite-pipeline/e71-kniffe-draw.mjs [--only=id,id]   → Originale + herkunft.json
//                                                     [--force]     → auch gemalte (Imagegen-)Originale überschreiben
//   npm run sprites:precision && node scripts/pwa-cache.mjs          → Laufzeit-Assets skill-<klasse>-<kniff>
// Vorrang gemalt vor gezeichnet: Ein Original, das Imagegen ersetzt hat (Eintrag in assets/precision/generation.json mit
// passendem Hash, z. B. über `npm run e72:bilder`), zeichnet dieses Werkzeug ohne --force nicht wieder zu.
//   node tools/sprite-pipeline/e71-kniffe-draw.mjs --kontaktbogen    → docs/e71-abnahme/kniffe/kontaktbogen.png (aus dem Laufzeitkatalog)
//
// Deterministisch (eigener Zufallsgenerator je ID), damit tests/e71-kniffe.test.mjs die Originale byte-genau nachzeichnen kann.
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {encodePng} from './png.mjs';
import {PRECISION_PALETTE} from '../../art-quality.js';
import {tileGround,tileShadowMask,TILE_COLORS} from '../../ability-tile.js';
import {shrinkPixels} from '../../content-art.js';

export const TOOL='tools/sprite-pipeline/e71-kniffe-draw.mjs';
export const DIR='assets/precision/sources/2026-09-25/e71-kniffe/';
export const PROVENANCE=DIR+'herkunft.json';
// N = Motivfeld (Koordinaten 0..N-1), OFF = Überstand der Kachel je Seite: Masken und Bild decken -OFF..N+OFF-1 ab (64 × 64).
const N=58,OFF=3,SIZE=64,LO=-OFF,HI=N+OFF,TAU=Math.PI*2,rad=d=>d*Math.PI/180,at=(x,y)=>(y+OFF)*SIZE+x+OFF,inside=(x,y)=>x>=LO&&y>=LO&&x<HI&&y<HI;

// ------------------------------------------------------------------ Farben
const snapCache=new Map();
function snap(rgb){const k=rgb.join(',');let p=snapCache.get(k);if(p)return p;let best=Infinity;
 for(const q of PRECISION_PALETTE){const d=(rgb[0]-q[0])**2*.8+(rgb[1]-q[1])**2+(rgb[2]-q[2])**2*.7;if(d<best){best=d;p=q;}}snapCache.set(k,p);return p;}
const INK=[23,31,41];
// Rampen: [tief, dunkel, grund, hell, glanz]
const R={
 steel:[[58,65,77],[95,99,104],[136,136,127],[193,197,173],[236,229,204]],
 iron:[[23,31,41],[36,46,58],[58,65,77],[93,90,90],[136,136,127]],
 wood:[[63,51,52],[99,75,55],[146,96,68],[182,123,80],[221,160,113]],
 ember:[[149,61,50],[206,93,49],[236,139,54],[249,197,96],[255,236,201]],
 coal:[[23,31,41],[36,35,51],[54,64,71],[87,81,80],[120,98,89]],
 sausage:[[101,63,61],[143,71,49],[183,97,58],[214,127,81],[233,179,133]],
 raw:[[148,79,59],[194,108,65],[217,156,117],[241,189,151],[250,220,183]],
 brownGlass:[[68,55,53],[107,57,57],[149,81,56],[194,108,65],[243,184,75]],
 beer:[[169,121,65],[211,168,86],[243,184,75],[255,210,116],[255,236,201]],
 steam:[[137,140,131],[170,171,152],[209,206,185],[236,229,204],[255,242,214]],
 smoke:[[61,58,68],[86,85,90],[117,121,117],[152,156,130],[200,197,175]],
 heal:[[69,94,64],[102,125,89],[152,167,110],[193,197,146],[228,220,195]],
 mustard:[[134,118,77],[184,160,99],[215,190,96],[236,213,155],[252,235,200]],
 red:[[107,57,57],[149,61,50],[183,71,36],[206,93,49],[229,116,56]],
 glass:[[62,82,95],[98,127,131],[142,158,148],[200,197,175],[248,240,213]],
 blue:[[36,56,65],[51,77,89],[69,100,118],[113,144,144],[170,171,152]],
 flame:[[183,71,36],[229,116,56],[243,184,75],[255,210,116],[255,242,214]],
 card:[[137,140,131],[200,197,175],[236,229,204],[252,241,214],[255,242,214]],
 back:[[51,44,58],[65,52,64],[93,75,77],[131,99,86],[154,115,86]],
 wine:[[51,44,58],[70,53,57],[107,57,57],[135,80,70],[163,96,69]],
 skin:[[101,68,52],[146,96,68],[197,137,101],[229,170,131],[246,211,182]],
 oldSkin:[[120,98,89],[171,126,95],[217,156,117],[241,189,151],[250,220,183]],
 gold:[[124,88,59],[169,121,65],[211,168,86],[243,184,75],[255,236,201]],
 arrow:[[149,81,56],[209,131,67],[240,162,65],[249,197,96],[255,230,187]],
 paper:[[170,171,152],[209,206,185],[236,229,204],[252,241,214],[255,242,214]],
 bottle:[[38,53,48],[53,75,54],[85,112,74],[132,148,81],[186,196,117]],
 machine:[[44,56,70],[74,81,91],[110,125,125],[154,156,142],[209,206,185]],
 leather:[[61,53,48],[101,68,52],[141,99,68],[176,147,116],[211,179,144]],
 beige:[[116,104,90],[159,128,109],[206,174,148],[228,214,181],[246,219,183]],
 boot:[[63,51,52],[101,68,52],[141,73,46],[166,112,71],[197,137,101]],
 plate:[[137,140,131],[185,184,164],[228,220,195],[248,240,213],[255,242,214]],
 cream:[[176,147,116],[211,179,144],[236,223,191],[252,241,214],[255,242,214]]
};

// ------------------------------------------------------------------ Zufall (deterministisch je ID)
function rng(seedText){let h=2166136261;for(const c of seedText)h=Math.imul(h^c.charCodeAt(0),16777619);let s=h>>>0;
 return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}

// ------------------------------------------------------------------ Masken und Grundformen (Motivkoordinaten, Pixelmitte; Feld -3..60)
class Mask{
 constructor(){this.a=new Uint8Array(SIZE*SIZE);}
 static from(test){const m=new Mask();for(let y=LO;y<HI;y++)for(let x=LO;x<HI;x++)if(test(x+.5,y+.5))m.a[at(x,y)]=1;return m;}
 has(x,y){return inside(x,y)&&this.a[at(x,y)]===1;}
 or(...ms){const m=this.copy();for(const o of ms)for(let i=0;i<m.a.length;i++)m.a[i]|=o.a[i];return m;}
 and(o){const m=this.copy();for(let i=0;i<m.a.length;i++)m.a[i]&=o.a[i];return m;}
 minus(o){const m=this.copy();for(let i=0;i<m.a.length;i++)if(o.a[i])m.a[i]=0;return m;}
 copy(){const m=new Mask();m.a.set(this.a);return m;}
 shift(dx,dy){const m=new Mask();for(let y=LO;y<HI;y++)for(let x=LO;x<HI;x++)if(this.has(x-dx,y-dy))m.a[at(x,y)]=1;return m;}
 shrink(){const m=new Mask();for(let y=LO;y<HI;y++)for(let x=LO;x<HI;x++)if(this.has(x,y)&&this.has(x-1,y)&&this.has(x+1,y)&&this.has(x,y-1)&&this.has(x,y+1))m.a[at(x,y)]=1;return m;}
 grow(){const m=this.copy();for(let y=LO;y<HI;y++)for(let x=LO;x<HI;x++)if(!this.has(x,y)&&(this.has(x-1,y)||this.has(x+1,y)||this.has(x,y-1)||this.has(x,y+1)))m.a[at(x,y)]=1;return m;}
}
const union=(...ms)=>ms.reduce((a,b)=>a.or(b));
const inPoly=(x,y,p)=>{let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const[xi,yi]=p[i],[xj,yj]=p[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c;}return c;};
const segDist=(x,y,x1,y1,x2,y2)=>{const dx=x2-x1,dy=y2-y1,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((x-x1)*dx+(y-y1)*dy)/l)):0;return Math.hypot(x-x1-t*dx,y-y1-t*dy);};
const rect=(x,y,w,h)=>Mask.from((px,py)=>px>=x&&px<x+w&&py>=y&&py<y+h);
const circle=(cx,cy,r)=>Mask.from((x,y)=>(x-cx)**2+(y-cy)**2<=r*r);
const ellipse=(cx,cy,rx,ry,rot=0)=>Mask.from((x,y)=>{const c=Math.cos(rad(rot)),s=Math.sin(rad(rot)),dx=x-cx,dy=y-cy,u=dx*c+dy*s,v=-dx*s+dy*c;return(u/rx)**2+(v/ry)**2<=1;});
const poly=pts=>Mask.from((x,y)=>inPoly(x,y,pts));
const seg=(x1,y1,x2,y2,r)=>Mask.from((x,y)=>segDist(x,y,x1,y1,x2,y2)<=r);
const path=(pts,r)=>union(...pts.slice(1).map((p,i)=>seg(pts[i][0],pts[i][1],p[0],p[1],r)));
/** Ringstück: Winkel in Grad, 0 = rechts, 90 = unten (Bildschirmrichtung), von a0 im Uhrzeigersinn bis a1. */
const arc=(cx,cy,r1,r2,a0,a1)=>Mask.from((x,y)=>{const d=Math.hypot(x-cx,y-cy);if(d<r1||d>r2)return false;const a=(Math.atan2(y-cy,x-cx)*180/Math.PI+360)%360,s=((a0%360)+360)%360,e=((a1-a0)%360+360)%360;return((a-s+360)%360)<=e;});
/** Form im lokalen, gedrehten System (u rechts, v unten) um (cx,cy). */
const local=(cx,cy,rot,test)=>{const c=Math.cos(rad(rot)),s=Math.sin(rad(rot));return Mask.from((x,y)=>{const dx=x-cx,dy=y-cy;return test(dx*c+dy*s,-dx*s+dy*c);});};
const bezier=(p0,p1,p2,n=24)=>Array.from({length:n+1},(_,i)=>{const t=i/n,a=(1-t)**2,b=2*(1-t)*t,c=t*t;return[a*p0[0]+b*p1[0]+c*p2[0],a*p0[1]+b*p1[1]+c*p2[1]];});

// Kartenfarben als lokale Tests (Einheit s = halbe Breite)
const SUIT={
 heart:s=>(u,v)=>(u+.5*s)**2+(v+.25*s)**2<=(.56*s)**2||(u-.5*s)**2+(v+.25*s)**2<=(.56*s)**2||inPoly(u,v,[[-1.05*s,-.1*s],[1.05*s,-.1*s],[0,1.15*s]]),
 diamond:s=>(u,v)=>Math.abs(u)/(.82*s)+Math.abs(v)/(1.18*s)<=1,
 club:s=>(u,v)=>u*u+(v+.58*s)**2<=(.47*s)**2||(u+.55*s)**2+(v-.12*s)**2<=(.47*s)**2||(u-.55*s)**2+(v-.12*s)**2<=(.47*s)**2||u*u+v*v<=(.3*s)**2||inPoly(u,v,[[0,-.1*s],[-.42*s,1.1*s],[.42*s,1.1*s]]),
 spade:s=>(u,v)=>(u+.5*s)**2+(v-.22*s)**2<=(.54*s)**2||(u-.5*s)**2+(v-.22*s)**2<=(.54*s)**2||inPoly(u,v,[[-1.04*s,.12*s],[1.04*s,.12*s],[0,-1.12*s]])||inPoly(u,v,[[0,.2*s],[-.42*s,1.12*s],[.42*s,1.12*s]])
};
const suitColor=s=>s==='heart'||s==='diamond'?[183,71,36]:[36,35,51];
// Pixelschrift 3 × 5 für Ziffern und A
const GLYPH={'1':['.#.','##.','.#.','.#.','###'],'8':['###','#.#','###','#.#','###'],'A':['.#.','#.#','###','#.#','#.#'],'B':['##.','#.#','##.','#.#','##.']};
const glyph=(ch,x,y,scale=1)=>Mask.from((px,py)=>{const gx=Math.floor((px-x)/scale),gy=Math.floor((py-y)/scale),g=GLYPH[ch];return px>=x&&py>=y&&gy<g.length&&gx<g[0].length&&g[gy][gx]==='#';});

// ------------------------------------------------------------------ Zeichenfläche
class Icon{
 constructor(id){this.id=id;this.rand=rng(id);this.col=new Array(SIZE*SIZE).fill(null);this.occ=new Uint8Array(SIZE*SIZE);this.fx=[];}
 set(x,y,c,solid=true){if(!inside(x,y))return;this.col[at(x,y)]=c;if(solid)this.occ[at(x,y)]=1;}
 /** Teil mit Außenkontur und Rampenschattierung (hell oben links, dunkel unten rechts). */
 part(mask,ramp,{outline=INK,light=1,dark=2,tex=null,solid=true,gloss=true}={}){
  if(outline)for(let y=LO;y<HI;y++)for(let x=LO;x<HI;x++)if(!mask.has(x,y)&&(mask.has(x-1,y)||mask.has(x+1,y)||mask.has(x,y-1)||mask.has(x,y+1)))this.set(x,y,outline,solid);
  for(let y=LO;y<HI;y++)for(let x=LO;x<HI;x++){if(!mask.has(x,y))continue;
   const br=!mask.has(x+1,y+1)||!mask.has(x+1,y)||!mask.has(x,y+1)?1:dark>1&&(!mask.has(x+2,y+2)||!mask.has(x+2,y)||!mask.has(x,y+2))?2:9;
   const tl=!mask.has(x-1,y-1)||!mask.has(x-1,y)||!mask.has(x,y-1)?1:light>1&&(!mask.has(x-2,y-2)||!mask.has(x-2,y)||!mask.has(x,y-2))?2:9;
   let i=br===1?0:tl<=light?3:br===2?1:2;if(i===3&&gloss&&!mask.has(x-1,y)&&!mask.has(x,y-1))i=4;if(tex)i=Math.max(0,Math.min(4,i+tex(x,y,i)));this.set(x,y,ramp[i],solid);}
  return this;}
 /** Fläche in einer Farbe, ohne Kontur (Muster, Glanz, Nähte). */
 flat(mask,color,solid=false){for(let y=LO;y<HI;y++)for(let x=LO;x<HI;x++)if(mask.has(x,y))this.set(x,y,color,solid||this.occ[at(x,y)]===1);return this;}
 px(x,y,c){x=Math.round(x);y=Math.round(y);if(inside(x,y))this.set(x,y,c,this.occ[at(x,y)]===1);return this;}
 /** 1-px-Linie (Bresenham), z. B. Bewegungsstriche. */
 line(x1,y1,x2,y2,c){x1=Math.round(x1);y1=Math.round(y1);x2=Math.round(x2);y2=Math.round(y2);const dx=Math.abs(x2-x1),dy=-Math.abs(y2-y1),sx=x1<x2?1:-1,sy=y1<y2?1:-1;let e=dx+dy;
  for(;;){this.px(x1,y1,c);if(x1===x2&&y1===y2)break;const e2=2*e;if(e2>=dy){e+=dy;x1+=sx;}if(e2<=dx){e+=dx;y1+=sy;}}return this;}
 /** Effekte (Funken, Striche) kommen nach dem Schlagschatten und werfen keinen. */
 later(fn){this.fx.push(fn);return this;}
 /** Kachel aus ability-tile.js (Moos-Rezept, Vignette, Rahmen), Schatten des Motivs, Effekte, Motiv; Rahmen zuletzt. */
 render(){
  const out=tileGround(this.id,SIZE).data,shadow=tileShadowMask(this.occ,SIZE);
  for(let i=0;i<SIZE*SIZE;i++)if(shadow[i])out.set([...TILE_COLORS.ink,255],i*4);
  const fxLayer=this.col.slice();this.col=fxLayer;for(const f of this.fx)f(this);
  for(let i=0;i<SIZE*SIZE;i++){const x=i%SIZE,y=(i/SIZE)|0,c=this.col[i];if(c&&x>0&&y>0&&x<SIZE-1&&y<SIZE-1)out.set([...snap(c),255],i*4);}
  return{width:SIZE,height:SIZE,data:out};}
}

// ------------------------------------------------------------------ Bausteine
function sparkle(k,x,y,size=2,c=[255,236,201],core=[255,242,214]){k.later(k=>{for(let d=1;d<=size;d++){k.px(x+d,y,c);k.px(x-d,y,c);k.px(x,y+d,c);k.px(x,y-d,c);}k.px(x,y,core);});}
function streaks(k,lines,c=[186,196,117]){k.later(k=>{for(const l of lines)k.line(...l,c);});}
function plus(k,cx,cy,s=5,ramp=R.heal){const t=Math.max(2,Math.round(s*.8));k.part(union(rect(cx-t/2,cy-s,t,2*s),rect(cx-s,cy-t/2,2*s,t)),ramp);}
function puff(k,balls,ramp=R.steam,outline=[86,85,90]){k.part(union(...balls.map(([x,y,r])=>circle(x,y,r))),ramp,{outline,light:2});}
function flame(k,cx,by,w,h,lean=0,layers=[R.flame]){
 const m=(cx,by,w,h,lean)=>union(circle(cx,by-w/2,w/2),poly([[cx-w/2,by-w/2],[cx+w/2,by-w/2],[cx+lean,by-h]]),poly([[cx-w/2+1,by-w/2],[cx-w*.15,by-w],[cx-w*.55+lean*.5,by-h*.62]]),poly([[cx+w/2-1,by-w/2],[cx+w*.2,by-w],[cx+w*.5+lean*.6,by-h*.55]]));
 k.part(m(cx,by,w,h,lean),[R.flame[0],R.flame[0],R.flame[1],R.flame[1],R.flame[2]],{outline:[149,61,50]});
 k.part(m(cx+lean*.1,by-1,w*.62,h*.72,lean*.7),[R.flame[1],R.flame[2],R.flame[2],R.flame[3],R.flame[3]],{outline:null});
 k.part(m(cx+lean*.15,by-2,w*.3,h*.42,lean*.4),[R.flame[3],R.flame[3],R.flame[4],R.flame[4],R.flame[4]],{outline:null});}
function coals(k,cx,cy,w,h){
 const lumps=[];const r=k.rand;for(let i=0;i<9;i++){const a=i/9*TAU+r()*.4,d=r()*.75;lumps.push([cx+Math.cos(a)*w*.5*d,cy+Math.sin(a)*h*.4*d,2.2+r()*1.8]);}
 k.part(ellipse(cx,cy+1,w*.62,h*.5),[R.ember[0],R.ember[0],R.ember[1],R.ember[2],R.ember[3]],{outline:INK});
 for(const [x,y,s] of lumps)k.part(circle(x,y,s),R.coal,{outline:[36,35,51],tex:(px,py)=>((px*7+py*3)%5===0?1:0)});
 for(const [x,y] of lumps.slice(0,6))k.flat(rect(Math.round(x),Math.round(y),1,1),R.ember[3]);}
function tongs(k,x0,y0,x1,y1,{open=3,handle=.42,pad=true}={}){
 const L=Math.hypot(x1-x0,y1-y0),dx=(x1-x0)/L,dy=(y1-y0)/L,nx=-dy,ny=dx,deg=Math.atan2(dy,dx)*180/Math.PI;
 const P=(t,s,o)=>[x0+dx*L*t+nx*o*s,y0+dy*L*t+ny*o*s],off=t=>1.8+(open-1.8)*t;
 const arm=s=>{const a=P(0,s,1.8),b=P(1,s,open);return seg(a[0],a[1],b[0],b[1],1.7);};
 const padM=s=>{const c=P(1,s,open+.4*s*0);return local(c[0]+dx*1.2,c[1]+dy*1.2,deg,(u,v)=>(u/4.8)**2+(v/2.3)**2<=1);};
 const grip=s=>{const a=P(.1,s,off(.1)),b=P(handle,s,off(handle));return seg(a[0],a[1],b[0],b[1],2.7);};
 const wood={tex:(x,y,i)=>(x+y)%4===0&&i===2?-1:0};
 for(const s of[-1,1]){k.part(pad?arm(s).or(padM(s)):arm(s),R.steel,{light:1});
  if(pad){const c=P(1,s,open);k.flat(union(...[-2,0,2].map(d=>rect(Math.round(c[0]+dx*(1.2+d)-nx*s*1.6),Math.round(c[1]+dy*(1.2+d)-ny*s*1.6),1,1))),R.steel[0]);}
  k.part(grip(s),R.wood,wood);}
 const h=P(0,1,0);k.part(circle(h[0]-dx*2,h[1]-dy*2,3.4).minus(circle(h[0]-dx*2,h[1]-dy*2,1.4)),R.steel);}
function sausage(k,pts,r,ramp=R.sausage,marks=true){
 const m=union(...pts.map(([x,y])=>circle(x,y,r)));k.part(m,ramp,{light:2});
 if(marks){for(let i=1;i<pts.length-1;i+=2){const[x,y]=pts[i];k.flat(seg(x-r*.4,y-r*.7,x+r*.4,y+r*.7,.6).and(m),ramp[0]);}}
 const[a,b]=[pts[0],pts[pts.length-1]];return m;}
function grate(k,cx,cy,rx,ry){
 const outer=ellipse(cx,cy,rx,ry),inner=ellipse(cx,cy,rx-2.4,ry-2);
 k.part(ellipse(cx,cy+1,rx-2,ry-1.6),[R.ember[0],R.ember[1],R.ember[1],R.ember[2],R.ember[3]],{outline:null});
 for(let i=0;i<14;i++){const x=cx-rx+4+k.rand()*(rx*2-8),y=cy-ry+3+k.rand()*(ry*2-5);if(inner.has(Math.floor(x),Math.floor(y)))k.part(circle(x,y,1.6),R.coal,{outline:null});}
 const bars=union(...Array.from({length:Math.floor(rx*2/4)},(_,i)=>rect(cx-rx+2+i*4,cy-ry,1.2,ry*2))).and(inner);
 k.part(outer.minus(inner),R.iron,{light:1});k.flat(bars,R.iron[3],true);}
/** Spielkarte, gedreht um rot Grad; face={suit,rank} oder null (Rückseite). */
function card(k,cx,cy,w,h,rot,face,{suitScale=.3,outline=INK}={}){
 const m=local(cx,cy,rot,(u,v)=>Math.abs(u)<=w/2&&Math.abs(v)<=h/2&&!(Math.abs(u)>w/2-1.2&&Math.abs(v)>h/2-1.2));
 if(!face){k.part(m,R.back,{outline});const inner=local(cx,cy,rot,(u,v)=>Math.abs(u)<=w/2-2&&Math.abs(v)<=h/2-2);
  k.flat(inner.and(local(cx,cy,rot,(u,v)=>((Math.floor(u+50)+Math.floor(v+50))%4===0)||((Math.floor(u+50)-Math.floor(v+50)+400)%4===0))),R.back[3]);
  k.flat(m.minus(inner).minus(local(cx,cy,rot,(u,v)=>Math.abs(u)>w/2-1||Math.abs(v)>h/2-1)),R.cream[1]);return m;}
 k.part(m,R.card,{outline});
 if(face.suit)k.flat(local(cx,cy,rot,(u,v)=>SUIT[face.suit](w*suitScale)(u,v)),suitColor(face.suit),true);
 if(face.rank){const c=face.suit?suitColor(face.suit):INK;k.flat(local(cx,cy,rot,(u,v)=>{const gx=Math.floor(u+w/2-1.5),gy=Math.floor(v+h/2-1.5),g=GLYPH[face.rank];return gx>=0&&gy>=0&&gy<5&&gx<3&&g[gy][gx]==='#';}),c,true);}
 return m;}
function arcArrow(k,cx,cy,r1,r2,a0,a1,ramp){const t=rad(a1),r=(r1+r2)/2,px=cx+Math.cos(t)*r,py=cy+Math.sin(t)*r,tx=-Math.sin(t),ty=Math.cos(t),nx=Math.cos(t),ny=Math.sin(t);
 k.part(arc(cx,cy,r1,r2,a0,a1).or(poly([[px+nx*5.5,py+ny*5.5],[px-nx*5.5,py-ny*5.5],[px+tx*7,py+ty*7]])),ramp,{light:1});}
function autoArrows(k){
 const ring=(a0,a1)=>arc(28.5,28.5,22,26,a0,a1);
 const head=a=>{const t=rad(a),cx=28.5+Math.cos(t)*24,cy=28.5+Math.sin(t)*24,tx=-Math.sin(t),ty=Math.cos(t),nx=Math.cos(t),ny=Math.sin(t);
  return poly([[cx+nx*5.5-tx*1,cy+ny*5.5-ty*1],[cx-nx*5.5-tx*1,cy-ny*5.5-ty*1],[cx+tx*7,cy+ty*7]]);};
 k.part(ring(196,282).or(head(282)),R.arrow,{light:1});k.part(ring(16,102).or(head(102)),R.arrow,{light:1});}
function fist(k,cx,cy,ramp,cuff,cuffTex){
 // Faust von vorn, Knöchel nach unten (haut auf den Tisch); Unterarm gerade nach oben aus der Kachel
 k.part(seg(cx+1,cy-10,cx+3,cy-40,8),ramp,{light:2});
 k.part(local(cx+1.6,cy-17,-4,(u,v)=>Math.abs(u)<=9.5&&Math.abs(v)<=4.5),cuff,{tex:cuffTex});
 k.part(local(cx,cy,-4,(u,v)=>Math.abs(u)<=12&&v>=-12&&v<=0&&!(Math.abs(u)>9&&v<-9)),ramp,{light:2});
 for(let i=0;i<4;i++){const u=-8.6+i*5.75;k.part(local(cx,cy,-4,(a,b)=>segDist(a,b,u,-3,u,6)<=3.1),ramp,{light:1});
  k.flat(local(cx,cy,-4,(a,b)=>Math.abs(a-u+.8)<=.7&&b>=6.3&&b<=7.4),ramp[4]);}
 k.part(local(cx,cy,-4,(a,b)=>segDist(a,b,-13,-6,1.5,-3.2)<=3.2),ramp,{light:1});
 k.flat(local(cx,cy,-4,(a,b)=>Math.abs(b+2)<=.6&&a>1.5&&a<=4.5),ramp[0]);}

// ------------------------------------------------------------------ Motive
const MOTIFS={
 'skill-schorsch-auto':k=>{autoArrows(k);tongs(k,14,44,40,16,{open:2.4,handle:.42});sparkle(k,42,13,2);k.later(k=>{k.line(45,18,48,17,[255,236,201]);k.line(41,10,42,7,[255,236,201]);});},
 'skill-schorsch-strike':k=>{
  streaks(k,[[4,26,15,15],[6,34,20,20],[11,41,25,27]]);
  tongs(k,5,53,40,15,{open:4.4,handle:.46});
  k.part(poly([[45,1],[48,8],[56,5],[51,12],[57,17],[49,17],[47,26],[43,18],[35,20],[40,13],[34,7],[42,9]]),R.ember,{outline:[149,61,50]});
  k.part(poly([[45,7],[47,11],[51,10],[48,14],[50,17],[46,15],[43,18],[43,14],[39,12],[43,11]]),[R.ember[3],R.ember[3],R.ember[4],R.ember[4],R.ember[4]],{outline:null});
  for(const[x,y]of[[53,25],[31,7],[54,2],[37,25]])sparkle(k,x,y,1,R.ember[3],R.ember[4]);},
 'skill-schorsch-mark':k=>{
  const rim=ellipse(29,39,27,14),bed=ellipse(29,39,24,11.5);
  k.part(bed,R.coal,{outline:null,tex:(x,y)=>((x*5+y*3)%7===0?2:(x+y*2)%9===0?1:0)});
  for(let i=0;i<16;i++){const x=Math.floor(8+k.rand()*42),y=Math.floor(31+k.rand()*16);if(bed.has(x,y))k.flat(rect(x,y,2,1),k.rand()<.5?R.ember[2]:R.ember[1]);}
  k.part(union(...[31,35,39,43,47].map(y=>rect(0,y,58,2))).and(bed),R.iron,{outline:INK,light:1,gloss:false});
  k.part(rim.minus(bed),R.iron,{light:1});
  sausage(k,bezier([10,34],[26,24],[43,31],10),5,R.raw,false);
  tongs(k,56,3,42,26,{open:2.6,handle:.55});
  k.later(k=>{for(const x of [14,24,34]){k.line(x,21,x-1,18,R.steam[3]);k.line(x-1,18,x,15,R.steam[3]);k.line(x,15,x-1,12,R.steam[2]);}});},
 'skill-schorsch-burst':k=>{
  k.part(ellipse(28,45,26.5,10),R.plate,{light:1});k.flat(ellipse(28,44,19.5,6.5).minus(ellipse(28,43.2,18.5,5.8)),R.plate[1]);
  const steak=local(22,37,-12,(u,v)=>(u/15.5)**2+(v/9)**2<=1&&!((u-10)**2+(v+9)**2<=18));
  k.part(steak,R.sausage,{light:2});
  const core=steak.shrink().shrink();
  k.flat(steak.minus(steak.shrink()).and(Mask.from((x,y)=>y<35||x<12)),R.cream[2]);
  k.flat(union(seg(12,43,19,29,.8),seg(18,45,25,30,.8),seg(24,45,31,31,.8),seg(30,43,35,33,.8)).and(core),R.sausage[0]);
  sausage(k,bezier([33,39],[43,30],[53,37],10),4.5);
  k.later(k=>{for(const[x,h]of[[14,0],[26,2],[38,0]]){k.line(x,20-h,x+1,17-h,R.steam[3]);k.line(x+1,17-h,x,14-h,R.steam[3]);k.line(x,14-h,x+1,11-h,R.steam[2]);}});
  sparkle(k,50,15,2,R.gold[3],R.gold[4]);sparkle(k,6,22,2,R.gold[3],R.gold[4]);sparkle(k,54,48,1,R.gold[3],R.gold[4]);},
 'skill-schorsch-interrupt':k=>{
  // Scherengrillzange von vorn: Griffe unten, Drehpunkt, Backen oben zu – beißt einen Zauberblitz entzwei
  const bolt=[R.beer[1],R.beer[2],R.beer[3],R.beer[4],R.beer[4]];
  k.part(poly([[2,12],[9,6],[10,11],[18,6],[20,10],[12,15],[11,11],[3,17]]),bolt,{outline:INK});
  k.part(poly([[38,6],[46,9],[45,4],[56,10],[50,12],[51,17],[42,12],[40,15]]),bolt,{outline:INK});
  const armL=path([[13,54],[22,36],[27,26],[27,14],[29,8]],2),armR=path([[45,54],[36,36],[31,26],[31,14],[29,8]],2);
  k.part(armR,R.steel,{light:1});k.part(armL,R.steel,{light:1});
  k.part(local(24,12,95,(u,v)=>(u/5)**2+(v/3)**2<=1),R.steel,{light:1});k.part(local(34,12,85,(u,v)=>(u/5)**2+(v/3)**2<=1),R.steel,{light:1});
  k.flat(union(...[9,12,15].map(y=>rect(28,y,1,1).or(rect(30,y,1,1)))),R.steel[0]);
  k.part(seg(14,52,20,40,3),R.wood,{tex:(x,y,i)=>(x+y)%4===0&&i===2?-1:0});k.part(seg(44,52,38,40,3),R.wood,{tex:(x,y,i)=>(x+y)%4===0&&i===2?-1:0});
  k.part(circle(29,29,3),R.gold);
  k.part(poly([[29,-1],[31,4],[36,2],[33,6],[37,9],[32,9],[30,13],[28,9],[22,10],[26,6],[22,2],[27,4]]),R.steam,{outline:[137,140,131]});
  k.flat(rect(28,5,3,2),[255,242,214]);
  for(const[x,y]of[[6,26],[52,24],[20,22],[40,21]])sparkle(k,x,y,1,R.beer[3],R.beer[4]);},
 'skill-schorsch-parry':k=>{
  const dome=(u,v)=>(u/23)**2+(v/19)**2<=1&&v<=7;
  k.part(local(31,33,-22,dome),R.iron,{light:2});
  k.flat(local(31,33,-22,(u,v)=>dome(u,v)&&v>3.5),R.iron[3],true);k.flat(local(31,33,-22,(u,v)=>dome(u,v)&&v>5.5),R.iron[2],true);
  k.flat(local(31,33,-22,(u,v)=>{const d=Math.hypot(u/20,v/16);return d>.78&&d<.9&&u<-3&&v<-3;}),R.iron[4],true);
  for(const u of [-10,0,10])k.flat(local(31,33,-22,(a,b)=>(a-u)**2+(b+1)**2<=2.3),INK,true);
  for(const u of [-7,7])k.part(local(31,33,-22,(a,b)=>Math.abs(a-u)<=1.4&&b>=-23&&b<=-17),R.steel,{light:1});
  k.part(local(31,33,-22,(u,v)=>Math.abs(u)<=10.5&&v>=-28&&v<=-22.5),R.wood,{light:1});
  k.part(poly([[5,9],[9,13],[15,10],[12,16],[18,20],[11,19],[9,26],[6,19],[1,21],[5,15],[1,11],[6,13]]),R.ember,{outline:[149,61,50]});
  k.flat(rect(8,15,2,2),R.ember[4],true);
  streaks(k,[[3,30,11,27],[4,36,13,32],[19,4,23,9]],R.ember[3]);},
 'skill-schorsch-dash':k=>{
  streaks(k,[[2,14,13,14],[1,20,12,20],[3,26,11,26]],R.steam[2]);
  for(const[x,y,rx]of[[8,50,5],[19,46,4.4]]){k.part(ellipse(x,y,rx,2.4),R.ember,{outline:[149,61,50],light:1});k.flat(rect(x-1,y-1,2,1),R.ember[4],true);}
  for(const[x,y]of[[3,44],[13,53],[26,52],[29,42]])sparkle(k,x,y,1,R.ember[3],R.ember[4]);
  const boot=poly([[21,7],[38,7],[38,26],[48,28],[54,33],[55,40],[21,40],[19,26]]);
  k.part(boot,R.boot,{light:2});
  k.part(rect(19,39,37,5),R.coal,{light:1});k.flat(union(...[23,29,35,41,47,52].map(x=>rect(x,43,2,1))),R.coal[3]);
  k.part(rect(19,5,20,5),R.boot,{light:1});
  k.flat(seg(38,29,52,32,.7),R.boot[4]);
  k.later(k=>{for(const y of[13,18,23]){k.line(33,y,38,y-2,R.cream[3]);k.line(33,y-2,38,y,R.cream[3]);}});},
 'skill-schorsch-heal':k=>{
  coals(k,31,50,34,9);
  const wisp=(x0,y0,h,ph,amp)=>{const p=Array.from({length:14},(_,i)=>[x0+Math.sin(i*.62+ph)*amp+i*.45,y0-i*h/13]);return union(...p.slice(1).map((q,i)=>seg(p[i][0],p[i][1],q[0],q[1],1.9-i*.09)));};
  k.part(union(wisp(29,42,28,0,2.3),wisp(37,42,33,1.7,2.6),wisp(45,43,24,3.1,2)),R.steam,{outline:[86,85,90],light:1});
  puff(k,[[34,44,4.2],[41,45,3.8],[27,45,3.4]]);
  const bottle=(u,v)=>(Math.abs(u)<=5.5&&v>=-14&&v<=3)||(Math.abs(u)<=5.5-(v-3)*.85&&v>3&&v<=7)||(Math.abs(u)<=2.3&&v>7&&v<=14);
  k.part(local(15,13,-35,bottle),R.brownGlass,{light:2});
  k.part(local(15,13,-35,(u,v)=>Math.abs(u)<=5.5&&v>=-8&&v<=-1),R.cream,{light:1});
  k.flat(local(15,13,-35,(u,v)=>Math.abs(u)<=2.5&&v>=-6&&v<=-3),R.red[2],true);
  k.part(poly([[23,24],[26,23],[30,36],[26,37]]),R.beer,{outline:[124,88,59],light:1});
  plus(k,47,12,5);
  for(const[x,y]of[[21,25],[53,24],[11,33]])sparkle(k,x,y,1,R.steam[3],R.steam[4]);},
 'skill-schorsch-buff':k=>{
  coals(k,43,49,24,10);
  flame(k,44,46,13,26,1);
  // Blasebalg schräg von oben: Holzbrett (Birnenform), darunter die Lederfalten, zwei Griffe hinten, Messingdüse zur Glut
  const pear=(u,v)=>(u+4)**2+v*v<=118||(u>=-4&&u<=11&&Math.abs(v)<=10.8-(u+4)*.5);
  const L=(t)=>local(23,25,38,t),leather=[[36,35,51],[61,53,48],[99,75,55],[141,99,68],[176,147,116]];
  k.part(L((u,v)=>u>=-25&&u<=-13&&Math.abs(v-4.5)<=1.9),R.wood,{light:1});
  k.part(L((u,v)=>pear(u,v-5)),R.wood,{light:1});
  k.part(L((u,v)=>pear(u,v-3.4)),leather,{outline:null});
  k.flat(L((u,v)=>pear(u,v-3.4)&&!pear(u,v)&&((u+40)%3.2)<1.3),leather[3]);
  k.part(L((u,v)=>u>=-25&&u<=-13&&Math.abs(v)<=1.9),R.wood,{light:1});
  k.part(L(pear),R.wood,{light:2,tex:(x,y,i)=>(x+2*y)%9===0&&i===2?-1:0});
  k.flat(L((u,v)=>{const a=(u+4)**2+v*v;return a<=49&&a>=32||(u>=-1&&u<=8&&Math.abs(Math.abs(v)-4.2+(u+2)*.28)<=.6);}),R.wood[1]);
  k.part(L((u,v)=>u>=10&&u<=20&&Math.abs(v-1.5)<=3.2-(u-10)*.17),R.gold);
  streaks(k,[[36,37,39,40],[34,41,37,44],[38,33,41,35]],R.steam[3]);
  for(const[x,y]of[[37,13],[51,10],[54,25],[30,33]])sparkle(k,x,y,1,R.ember[3],R.ember[4]);},
 'skill-schorsch-throw':k=>{
  const tear=(r,L,w=0)=>(u,v)=>u*u+v*v<=r*r||(u<0&&u>=-L&&Math.abs(v)<=r*Math.pow((u+L)/L,.8)*(1+w*Math.sin(u*.55)));
  k.part(local(39,19,-45,tear(10.5,46,.18)),[R.flame[0],R.flame[0],R.flame[1],R.flame[1],R.flame[2]],{outline:[149,61,50]});
  k.part(local(39,19,-45,tear(8,34,.22)),[R.flame[1],R.flame[2],R.flame[2],R.flame[3],R.flame[3]],{outline:null});
  k.part(local(39,19,-45,tear(5.5,20,.25)),[R.flame[3],R.flame[4],R.flame[4],R.flame[4],R.flame[4]],{outline:null});
  const hot=[[107,57,57],[149,61,50],[183,71,36],[229,116,56],[249,197,96]];
  const lump=poly([[33,17],[37,10],[45,8],[51,13],[51,22],[45,27],[37,27]]);
  k.part(lump,hot,{outline:[36,35,51],light:2});
  k.part(poly([[38,12],[45,10],[48,14],[43,16],[39,16]]).or(poly([[44,20],[49,19],[47,24],[43,24]])).or(poly([[35,19],[38,21],[37,24]])),R.coal,{outline:null,gloss:false});
  k.flat(rect(40,18,3,2),R.ember[4],true);
  puff(k,[[7,53,3.4],[3,49,2.4]],R.smoke,[61,58,68]);
  for(const[x,y]of[[55,4],[26,10],[54,32],[12,33],[28,44]])sparkle(k,x,y,1,R.ember[3],R.ember[4]);},
 'skill-schorsch-ground':k=>{
  k.part(seg(29,5,33,49,1.5),R.steel,{light:1});
  k.part(seg(28,5,7,54,1.9),R.steel);k.part(seg(30,5,51,54,1.9),R.steel);
  k.part(circle(29,5,3.4),R.steel);
  flame(k,29,56,14,17,0);
  k.part(seg(29,8,29,28,.9),R.steel,{light:1});
  k.later(k=>{for(let y=9;y<28;y+=2)k.px(28+(y%4===1?2:0),y,R.steel[3]);});
  k.part(ellipse(29,35,21,7.2),R.iron,{light:1});
  k.flat(ellipse(29,34.5,18,5).and(union(...[-15,-10,-5,0,5,10,15].map(d=>rect(29+d,28,1,14)))),R.iron[4]);
  sausage(k,[[16,33],[20,32],[24,32]],2.4);sausage(k,[[33,32],[37,32],[41,33]],2.4);
  k.later(k=>{for(const[a0,a1] of [[196,232],[308,344]])for(let a=a0;a<=a1;a+=3.5){const t=rad(a);k.px(29+Math.cos(t)*27,31+Math.sin(t)*17,R.steam[3]);}});},
 'skill-schorsch-senf':k=>{
  sausage(k,bezier([6,46],[28,56],[52,42],12),5.3);
  const wave=Array.from({length:30},(_,i)=>{const t=i/29,x=10+t*38,y=(1-t)**2*44+2*(1-t)*t*52.5+t*t*41-3+Math.sin(i*.85)*1.8;return[x,y];});
  k.part(path(wave,.9),R.mustard,{outline:[134,118,77],light:1,gloss:false});
  const tube=(u,v)=>v>=-15&&v<=8&&Math.abs(u)<=7.5-(v>2?(v-2)*.6:0);
  k.part(local(19,18,-37,tube),R.mustard,{light:2});
  k.part(local(19,18,-37,(u,v)=>v>=-20&&v<=-14.5&&Math.abs(u)<=8.6),R.steel,{tex:(x,y)=>((x+y)%2?0:-1)});
  k.part(local(19,18,-37,(u,v)=>v>=-9&&v<=-3&&Math.abs(u)<=7.5),R.red,{light:1});
  k.part(local(19,18,-37,(u,v)=>v>8&&v<=15&&Math.abs(u)<=1.8+(15-v)*.22),R.red);
  k.part(seg(29,33,30,39,1.4),R.mustard,{outline:[134,118,77],gloss:false});
  plus(k,45,13,5);},
 'skill-schorsch-spiritus':k=>{
  flame(k,42,54,20,48,3);
  k.part(poly([[27,26],[31,25],[37,40],[33,41]]),[R.blue[2],R.blue[3],R.blue[3],R.glass[3],R.glass[4]],{outline:[51,77,89],light:1});
  const sg=[[53,78,92],[91,122,131],[142,158,148],[209,206,185],[248,240,213]];
  const bottle=(u,v)=>(Math.abs(u)<=7&&v>=-15&&v<=4)||(Math.abs(u)<=7-(v-4)*1.1&&v>4&&v<=8)||(Math.abs(u)<=2.4&&v>7&&v<=14);
  k.part(local(15,16,-50,bottle),sg,{light:2});
  k.part(local(15,16,-50,(u,v)=>bottle(u,v)&&u>=1.5),[[36,56,65],[51,77,89],[69,100,118],[113,144,144],[170,171,152]],{outline:null});
  k.part(local(15,16,-50,(u,v)=>Math.abs(u)<=7&&v>=-10&&v<=-1),R.red,{light:1});
  k.flat(local(15,16,-50,(u,v)=>SUIT.spade(2.6)(v+5.5,-u)),R.flame[4],true);
  k.part(local(15,16,-50,(u,v)=>Math.abs(u)<=3&&v>=-19&&v<-15),R.red);},
 'skill-schorsch-deckelzu':k=>{
  puff(k,[[13,31,5],[8,25,4.6],[11,18,3.6]],R.smoke,[36,35,51]);
  puff(k,[[45,30,6],[50,23,6.5],[45,15,5.5],[50,7,4.2]],R.smoke,[36,35,51]);
  for(const x of[19,39])k.part(seg(x,43,x+(x<29?-5:5),55,1.6),R.steel);
  k.part(seg(29,45,29,55,1.6),R.steel);
  const ball=circle(29,33,15);k.part(ball.and(rect(0,32,58,26)),R.iron,{light:2});
  k.part(ball.and(rect(0,12,58,20)).or(rect(13,29,32,3)),R.iron,{light:2});
  k.flat(seg(19,23,25,19,1),R.iron[4]);k.flat(seg(17,37,20,42,.8),R.iron[3]);
  for(const x of[23,29,35])k.flat(rect(x,23,2,2),INK);
  k.part(rect(23,13,13,3),R.wood,{light:1});k.part(rect(25,16,2,2).or(rect(32,16,2,2)),R.steel,{outline:null});
  k.later(k=>{for(const[x1,y1,x2,y2]of[[29,10,29,3],[21,11,18,6],[37,11,40,6]])k.line(x1,y1,x2,y2,R.steam[4]);});},
 'skill-kaethe-auto':k=>{
  autoArrows(k);
  streaks(k,[[12,30,19,28],[13,35,20,33],[16,24,22,24]],R.steam[3]);
  card(k,31,28,16,22,24,{suit:'club',rank:'A'},{suitScale:.34});},
 'skill-kaethe-interrupt':k=>{
  card(k,28,47,30,13,-4,{suit:'club',rank:'A'},{suitScale:.2});
  fist(k,28,35,R.oldSkin,R.wine,(x,y)=>x%2===0?-1:0);
  k.later(k=>{for(const[x1,y1,x2,y2]of[[10,40,3,37],[9,46,2,47],[46,40,53,37],[47,47,54,49]])k.line(x1,y1,x2,y2,R.steam[4]);});
  k.part(poly([[6,3],[13,10],[10,11],[16,18],[8,12],[11,11]]),[R.beer[1],R.beer[2],R.beer[3],R.beer[4],R.beer[4]]);
  sparkle(k,6,18,1,R.beer[3],R.beer[4]);sparkle(k,50,20,2,R.beer[3],R.beer[4]);},
 'skill-kaethe-parry':k=>{
  const rows=[[40,[4,19,34],15],[27,[11,26,41],15],[14,[19,34],15]];
  const wall=[[36,35,51],[107,57,57],[126,66,56],[148,79,59],[166,92,65]];
  for(const[y,xs,w] of rows)for(const x of xs){const m=rect(x,y,w-1,12);k.part(m,R.cream,{light:1});k.part(rect(x+2,y+2,w-5,8),wall,{outline:null});
   k.flat(rect(x+2,y+2,w-5,8).and(Mask.from((px,py)=>((Math.floor(px)+Math.floor(py))%4===0)||((Math.floor(px)-Math.floor(py)+400)%4===0))),R.cream[1]);}
  k.part(poly([[3,2],[7,6],[12,3],[9,8],[14,11],[8,11],[6,16],[4,11],[0,12],[3,8],[0,4],[4,5]]),R.ember,{outline:[149,61,50]});
  streaks(k,[[16,6,20,10],[13,15,17,16],[48,8,52,4],[51,16,55,14]],R.steam[4]);},
 'skill-kaethe-dash':k=>{
  streaks(k,[[1,24,10,24],[2,30,12,30],[3,36,10,36]],R.steam[2]);
  card(k,9,10,9,12,-28,{suit:'heart'},{suitScale:.32});card(k,50,10,9,12,22,{suit:'spade'},{suitScale:.32});
  puff(k,[[13,49,4],[8,52,3]],R.steam,[137,140,131]);
  const stocking=[[120,98,89],[171,126,95],[206,174,148],[228,204,146],[246,219,183]];
  k.part(seg(21,-3,27,27,5.2),stocking,{light:2});
  const shoe=poly([[19,31],[23,26],[31,29],[41,30],[49,33],[54,38],[54,42],[27,42],[20,40]]);
  k.part(shoe,R.wine,{light:2});
  k.flat(seg(22,30,31,31,.6),R.wine[4]);
  k.part(rect(19,41,36,3),R.leather,{light:1});k.part(rect(19,43,8,7),R.leather,{light:1});
  k.part(seg(27,32,37,33,1.3),R.wine,{light:1});k.part(circle(38,33,2.2),R.gold);
  k.flat(seg(43,34,50,37,.6),R.wine[4]);},
 'skill-kaethe-heal':k=>{
  k.part(ellipse(29,51,11,3.4),R.glass,{light:1});
  k.part(rect(27.5,36,3,14),R.glass,{light:1});
  const bowl=Mask.from((x,y)=>y>=14&&y<=37&&Math.abs(x-29)<=15-(y-14)*.52);
  k.part(bowl,R.glass,{light:2});
  const liq=Mask.from((x,y)=>y>=18&&y<=35&&Math.abs(x-29)<=12.6-(y-18)*.5).or(ellipse(29,18,12.6,3.5));
  k.part(liq,[R.beer[1],R.mustard[2],R.mustard[3],R.mustard[4],R.mustard[4]],{outline:null,light:2});
  k.flat(ellipse(26,17,6,1.4),[255,242,214]);
  k.part(seg(40,21,41,29,1.5),[R.mustard[1],R.mustard[2],R.mustard[3],R.mustard[4],R.mustard[4]],{outline:[134,118,77]});
  k.flat(seg(18,21,20,33,.7),R.glass[4]);
  plus(k,49,10,5);sparkle(k,8,12,2,R.steam[3],R.steam[4]);},
 'skill-kaethe-buff':k=>{
  arcArrow(k,28.5,30,21,25,205,505,R.heal);
  card(k,19,31,14,20,-24,null);card(k,29,28,14,20,0,null);card(k,39,31,14,20,24,{suit:'club',rank:'B'},{suitScale:.3});
  sparkle(k,8,10,2,R.gold[3],R.gold[4]);sparkle(k,50,51,1,R.gold[3],R.gold[4]);},
 'skill-kaethe-throw':k=>{
  k.part(poly([[29,1],[33,10],[43,6],[39,16],[50,19],[39,24],[43,33],[31,28],[23,36],[23,24],[11,21],[21,15],[16,5],[27,11]]),R.gold,{outline:[124,88,59],light:2});
  const pad=local(28,31,-8,(u,v)=>Math.abs(u)<=15&&Math.abs(v)<=19);
  k.part(pad,R.paper,{light:1});
  k.part(local(28,31,-8,(u,v)=>Math.abs(u)<=15&&v>=-19&&v<=-15),R.red);
  k.flat(local(28,31,-8,(u,v)=>Math.abs(u+4)<=.5&&v>-15&&v<=16||Math.abs(u-5)<=.5&&v>-15&&v<=16),R.blue[3]);
  k.flat(local(28,31,-8,(u,v)=>{const row=Math.floor((v+12)/4);return v>=-12&&v<=6&&(v+12)%4<1.2&&((u>-13&&u<-6-(row%3))||(u>-2&&u<3-(row%2))||(u>7&&u<13-(row%3)));}),[62,82,95]);
  k.flat(local(28,31,-8,(u,v)=>u>-13&&u<13&&((v>=9&&v<10.2)||(v>=11.5&&v<12.7))),R.red[2]);
  k.flat(local(28,31,-8,(u,v)=>u>7&&u<13&&v>=14&&v<=16),INK);
  k.part(seg(40,52,55,33,1.8),[R.beer[1],R.beer[1],R.beer[2],R.beer[3],R.beer[4]]);k.part(seg(40,52,42.5,49,1.8),R.cream);k.flat(rect(39,52,2,2),INK,true);},
 'skill-kaethe-ground':k=>{
  k.part(ellipse(29,48,24,6).minus(ellipse(29,48,19,3.6)),[R.gold[1],R.gold[2],R.gold[3],R.gold[4],R.gold[4]],{outline:[124,88,59]});
  card(k,13,17,11,15,-22,{suit:'heart'},{suitScale:.3});card(k,30,11,11,15,10,{suit:'club'},{suitScale:.3});
  card(k,45,21,11,15,28,{suit:'diamond'},{suitScale:.3});card(k,23,36,11,15,14,{suit:'spade'},{suitScale:.3});card(k,39,40,11,15,-18,{suit:'heart'},{suitScale:.3});
  streaks(k,[[13,5,13,8],[30,0,30,2],[45,8,45,12],[23,24,23,27],[39,28,39,31]],R.steam[3]);},
 'skill-kaethe-reizen':k=>{
  card(k,13,45,11,15,-22,null);card(k,20,44,11,15,-4,null);card(k,27,46,11,15,16,{suit:'club'},{suitScale:.3});
  const bubble=union(ellipse(33,19,22,15),poly([[16,26],[24,30],[11,39]]));
  k.part(bubble,R.cream,{light:2});
  k.flat(union(glyph('1',19,9,3),glyph('8',32,9,3)).minus(rect(0,0,19,58).and(rect(0,0,0,0))),R.red[2],true);
  k.flat(union(glyph('1',19,9,3),glyph('8',32,9,3)).shift(1,1).minus(union(glyph('1',19,9,3),glyph('8',32,9,3))).and(bubble),R.red[0],true);},
 'skill-kaethe-handlesen':k=>{
  k.part(rect(17,46,24,11),R.wine,{tex:(x)=>x%2?-1:0});
  const palm=union(ellipse(29,34,12,12),...[[20,11,19],[26,8,17],[32,8,17],[38,12,19]].map(([x,top,bot])=>seg(x,top,x,bot+6,2.8)),seg(16,32,9,22,3));
  k.part(palm,R.oldSkin,{light:2});
  for(const x of[23,29,35])k.flat(rect(x,16,1,9),R.oldSkin[1]);
  k.flat(path(bezier([19,31],[28,26],[39,29],10),.55).or(path(bezier([21,36],[29,31],[34,40],10),.55)).or(path(bezier([27,44],[25,36],[30,27],10),.55)),R.oldSkin[0]);
  k.part(Mask.from((x,y)=>SUIT.heart(4.4)(x-29,y-35)),R.red,{outline:[107,57,57],light:1});
  for(const[x,y]of[[8,12],[49,9],[50,24],[9,42]])sparkle(k,x,y,1,R.heal[3],R.heal[4]);
  sparkle(k,46,40,2,R.heal[3],R.heal[4]);},
 'skill-kaethe-gezinkt':k=>{
  card(k,23,29,24,34,-10,{suit:'club',rank:'A'},{suitScale:.3});
  k.part(seg(40,40,52,53,2.6),R.wood,{light:1});
  k.part(circle(34,33,12).minus(circle(34,33,8.8)),R.steel,{light:1});
  const lens=circle(34,33,8.8);
  k.flat(lens,[200,197,175]);k.flat(lens.and(Mask.from((x,y)=>(x+y)%9===0)),[228,220,195]);
  k.flat(circle(34,33,3.4),R.red[2]);k.flat(circle(34,33,1.6),R.red[4]);
  k.flat(seg(29,28,32,26,.8),[255,242,214]);
  sparkle(k,49,10,2,R.gold[3],R.gold[4]);},
 'skill-kaethe-aermel':k=>{
  // Ärmel der Strickjacke von links unten, Hand kommt heraus, das Ass rutscht unter dem Bündchen hervor
  card(k,33,20,17,24,32,{suit:'spade',rank:'A'},{suitScale:.33});
  const hand=R.oldSkin;
  k.part(local(35,35,-35,(u,v)=>(u/9)**2+(v/6.5)**2<=1||segDist(u,v,4,-3,14,-4)<=2.2||segDist(u,v,5,1,15,1.5)<=2.1||segDist(u,v,4,4.5,13,6)<=2),hand,{light:1});
  k.flat(local(35,35,-35,(u,v)=>Math.abs(v+.7)<=.5&&u>6&&u<14||Math.abs(v-3.1)<=.5&&u>6&&u<13),hand[1]);
  const sleeve=local(15,43,-35,(u,v)=>u>=-26&&u<=8&&Math.abs(v)<=11.5+u*.08);
  k.part(sleeve,R.wine,{light:2,tex:(x,y,i)=>((x+y)%5===0&&i>=2?-1:(x-y+60)%10===0&&i>=1?1:0)});
  k.part(local(15,43,-35,(u,v)=>u>=7&&u<=14&&Math.abs(v)<=12.8),[R.wine[1],R.wine[2],R.wine[3],R.wine[4],R.wine[4]],{light:1,tex:(x,y)=>((x+y)%2?-1:0)});
  k.flat(local(15,43,-35,(u,v)=>(u+10)**2+(v+5)**2<=2||(u+10)**2+(v-5)**2<=2),R.gold[3],true);
  sparkle(k,53,6,2,[255,236,201]);sparkle(k,27,6,1,R.gold[3],R.gold[4]);},
 'skill-kaethe-mark':k=>{
  // Aura „markiert“: eine Kreuzkarte, von Käthes Hutnadel durchstochen. Die Spitze tritt unten links aus, der Perlenkopf sitzt oben rechts.
  k.part(seg(21,37,7,52,1.3),R.steel,{light:1});
  card(k,26,29,25,34,-12,{suit:'club',rank:'A'},{suitScale:.34});
  k.part(seg(46,10,31,26,1.3),R.steel,{light:1});
  k.flat(circle(30.5,26.5,1.8),INK,true);
  k.part(circle(48,8,6),R.red,{light:2});
  k.flat(rect(45,5,2,2),[255,242,214],true);
  sparkle(k,53,19,2,R.gold[3],R.gold[4]);},
 'skill-dieter-zeche':k=>{
  k.part(rect(-3,45,64,16),R.wood,{light:1,tex:(x,y,i)=>(y===50||y===54)&&i>=2?-1:0});
  k.part(local(26,45,-5,(u,v)=>Math.abs(u)<=19&&Math.abs(v)<=4.4&&!((u>15&&(Math.floor(u)%2===0)&&v<-2))),R.paper,{light:1});
  k.flat(local(26,45,-5,(u,v)=>Math.abs(v+1.2)<=.5&&u>-17&&u<-6||Math.abs(v-1.6)<=.5&&u>-17&&u<-2||Math.abs(v-1.6)<=.5&&u>9&&u<16),[137,140,131]);
  for(const[x,y,r]of[[6,27,4],[51,23,4],[48,36,3.4],[8,38,3.4],[53,9,3],[5,13,2.6]]){k.part(circle(x,y,r),R.gold,{outline:[101,63,61]});k.flat(rect(x-1,y-1,2,1),R.gold[4]);}
  fist(k,28,34,R.skin,R.leather,(x,y)=>y%3===0?-1:0);
  k.later(k=>{for(const[x1,y1,x2,y2]of[[11,46,4,43],[45,46,52,43],[13,41,9,36],[43,41,47,36]])k.line(x1,y1,x2,y2,[255,236,201]);});},
 'skill-kevin-reload':k=>{
  k.part(rect(6,4,40,52),R.machine,{light:2});
  k.part(rect(11,8,30,8),[R.bottle[0],R.bottle[1],R.bottle[1],R.bottle[2],R.bottle[3]],{light:1});
  k.flat(rect(14,11,4,2).or(rect(20,11,8,2)),R.bottle[4]);
  k.part(circle(26,31,9.5),R.iron,{light:1});
  k.part(circle(26,31,7),[R.bottle[0],R.bottle[1],R.bottle[2],R.bottle[3],R.bottle[4]],{outline:INK,light:2});
  k.flat(circle(26,31,4.2),INK);
  const bottle=local(38,22,-50,(u,v)=>(Math.abs(u)<=4.6&&v>=-4&&v<=13)||(Math.abs(u)<=2&&v>=-12&&v<-4)||(Math.abs(u)<=3.4&&v>=-6&&v<-3));
  k.part(bottle.minus(circle(26,31,6)),R.bottle,{light:2});
  k.part(local(38,22,-50,(u,v)=>Math.abs(u)<=4.6&&v>=2&&v<=7).minus(circle(26,31,6)),R.cream);
  k.part(rect(14,46,24,3),R.iron,{light:1});
  k.part(local(30,52,-8,(u,v)=>Math.abs(u)<=7&&v>=-5&&v<=3),[R.gold[1],R.gold[2],R.gold[3],R.gold[4],R.gold[4]],{outline:[124,88,59],light:1});
  k.flat(local(30,52,-8,(u,v)=>Math.abs(u)<=4&&(Math.abs(v+2)<.5||Math.abs(v)<.5)),R.gold[0]);
  sparkle(k,47,44,2,R.gold[3],R.gold[4]);sparkle(k,52,34,1,R.gold[3],R.gold[4]);}
};

export const IDS=Object.keys(MOTIFS);
export function drawIcon(id){const f=MOTIFS[id];if(!f)throw Error('Unbekanntes Motiv: '+id);const k=new Icon(id);f(k);return k.render();}
export function iconPng(id){return encodePng(drawIcon(id));}
const sha=b=>createHash('sha256').update(b).digest('hex');
/** Kniff-IDs, deren Original gemalt ist: Imagegen-Herkunft (generation.json) mit demselben Hash wie die Datei. */
export function paintedIds(records,readFile){const out=new Set();for(const id of IDS){const output=DIR+id+'.png',r=records.find(r=>r.output===output);if(!r)continue;let bytes;try{bytes=readFile(output);}catch{continue;}if(sha(bytes)===r.sourceHash)out.add(id);}return out;}

// Kontaktbogen: Laufzeit-Assets bei 48 px wie im Spiel (drawContentIcon: Flächenmittel shrinkPixels, 64 → 48), zweifach vergrößert.
// Spalte 1 = alte Kniffe zum Vergleich, dann je Zeile sieben neue; letzte Zeile nur alte (Dieter, Kevin, Anni).
export const CONTACT_ROWS=[
 ['skill-dieter-strike','skill-schorsch-auto','skill-schorsch-strike','skill-schorsch-mark','skill-schorsch-burst','skill-schorsch-interrupt','skill-schorsch-parry','skill-schorsch-dash'],
 ['skill-kevin-throw','skill-schorsch-heal','skill-schorsch-buff','skill-schorsch-throw','skill-schorsch-ground','skill-schorsch-senf','skill-schorsch-spiritus','skill-schorsch-deckelzu'],
 ['skill-dieter-heal','skill-kaethe-auto','skill-kaethe-interrupt','skill-kaethe-parry','skill-kaethe-dash','skill-kaethe-heal','skill-kaethe-buff','skill-kaethe-throw'],
 ['skill-kevin-heal','skill-kaethe-ground','skill-kaethe-reizen','skill-kaethe-handlesen','skill-kaethe-gezinkt','skill-kaethe-aermel','skill-dieter-zeche','skill-kevin-reload'],
 ['skill-dieter-mark','skill-dieter-interrupt','skill-dieter-auto','skill-kevin-strike','skill-kevin-buff','skill-kevin-auto','skill-baerbel-heal','skill-baerbel-buff'],
 ['skill-kaethe-aermel','skill-kaethe-mark']];
export function contactSheet(catalog,readFile,decode){
 const zoom=2,cell=48*zoom,gap=8,split=12,cols=Math.max(...CONTACT_ROWS.map(r=>r.length)),W=gap*2+split+cols*cell+(cols-1)*gap,H=gap+CONTACT_ROWS.length*(cell+gap),img={width:W,height:H,data:new Uint8Array(W*H*4)};
 for(let i=0;i<W*H;i++)img.data.set([29,36,32,255],i*4);
 CONTACT_ROWS.forEach((row,ry)=>row.forEach((id,cx)=>{const a=catalog.assets[catalog.aliases?.[id]||id],im=decode(readFile(a.path)),ox=gap+cx*(cell+gap)+(cx>0?split:0),oy=gap+ry*(cell+gap);
  const small=shrinkPixels(im.data,im.width,im.height,48,48);
  for(let y=0;y<cell;y++)for(let x=0;x<cell;x++){const i=(Math.floor(y/zoom)*48+Math.floor(x/zoom))*4;
   if(small[i+3]<128)continue;const k=((oy+y)*W+ox+x)*4;img.data[k]=small[i];img.data[k+1]=small[i+1];img.data[k+2]=small[i+2];}}));
 for(let y=gap;y<H-gap;y++)for(let x=0;x<2;x++)img.data.set([211,168,86,255],(y*W+gap+cell+gap/2+split/2-1+x)*4);
 return img;}

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]&&process.argv.includes('--kontaktbogen')){
 const root=new URL('../../',import.meta.url),{decodePng}=await import('./png.mjs'),catalog=JSON.parse(readFileSync(new URL('assets/precision/runtime/catalog.json',root)));
 const out='docs/e71-abnahme/kniffe/kontaktbogen.png';mkdirSync(new URL('docs/e71-abnahme/kniffe/',root),{recursive:true});
 writeFileSync(new URL(out,root),encodePng(contactSheet(catalog,p=>readFileSync(new URL(p,root)),decodePng)));console.log('Kontaktbogen →',out);
}else if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const root=new URL('../../',import.meta.url),onlyArg=process.argv.find(a=>a.startsWith('--only=')),wanted=onlyArg?onlyArg.slice(7).split(','):IDS;
 const genFile=new URL('assets/precision/generation.json',root),records=existsSync(genFile)?JSON.parse(readFileSync(genFile,'utf8')).records:[];
 const painted=process.argv.includes('--force')?new Set():paintedIds(records,p=>readFileSync(new URL(p,root))),only=wanted.filter(id=>!painted.has(id));
 for(const id of wanted.filter(id=>painted.has(id)))console.log('-',id,'gemalt (Imagegen) – bleibt, --force zeichnet es neu');
 mkdirSync(new URL(DIR,root),{recursive:true});
 const file=new URL(PROVENANCE,root),prov=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{tool:TOOL,kind:'code',records:[]};
 for(const id of only){const bytes=iconPng(id),output=DIR+id+'.png';writeFileSync(new URL(output,root),bytes);
  const rec={id,output,kind:'code',tool:TOOL,date:'2026-09-25',width:SIZE,height:SIZE,sha256:sha(bytes)};
  const at=prov.records.findIndex(r=>r.id===id);if(at>=0)prov.records[at]=rec;else prov.records.push(rec);console.log('-',id,rec.sha256.slice(0,12));}
 prov.records.sort((a,b)=>IDS.indexOf(a.id)-IDS.indexOf(b.id));
 writeFileSync(file,JSON.stringify(prov,null,1)+'\n');console.log(`${only.length} Motive gezeichnet → ${DIR}`);
 // --force über ein gemaltes Original: dessen Imagegen-Herkunft stimmt nicht mehr, sie fällt weg (sonst meldet art-precision den Hash).
 const drawnOutputs=new Set(only.map(id=>DIR+id+'.png'));
 if(records.some(r=>drawnOutputs.has(r.output))){const g=JSON.parse(readFileSync(genFile,'utf8'));g.records=g.records.filter(r=>!drawnOutputs.has(r.output));writeFileSync(genFile,JSON.stringify(g,null,2)+'\n');console.log('Imagegen-Herkunft der neu gezeichneten Originale entfernt.');}
}
