// Sprite-Schmiede · Figuren: Frisuren und Bärte im Kopf-Rahmen (E-56).
// Eine Frisur = Haarkappe (Hülle um den Schädel, oberhalb des Haaransatzes, Ohren ausgespart) + Strähnenbündel
// (gekrümmte, spitz zulaufende Locken, weich verschmolzen) + Beiwerk (Haargummi, Haarband, Sonnenbrille).
// Das Haarmaterial malt Strähnen entlang eines Strömungsfelds (zum Dutt hin, von vorn nach hinten, nach unten beim Bart)
// und prägt sie per bump als Relief ein; einzelne Strähnen sind heller oder dunkler.
//
// face.mjs ruft hairSolids() auf und bekommt Körper mit eigenem Material. HAIR[style]/BEARD[style] liefern für figure.mjs
// nur noch eine verdeckte Kernform (liegt innen, rendert nie sichtbar) – siehe Abschlussbericht E-56 (Kernänderung).
//
// recipe.hair = {style, color, messy?, band?, glasses?, highlight?}   style: 'dutt' | 'hochgesteckt' | 'kurz' | 'zerzaust' | 'glatze'
//   band: Farbe von Haargummi/Haarband (dutt Standard '#a8452f', hochgesteckt Standard '#d9573a'), glasses: Farbe der
//   Sonnenbrille im Haar (hochgesteckt), highlight: hellere Strähnenfarbe, messy 0..1 (abstehende Strähnen)
// recipe.beard = {style, color, highlight?}   style: 'voll' | 'schnauzer' | 'stoppel' (stoppel = nur gemalt, siehe face.mjs)
import {clamp,mix,smoothstep,ellipsoid,capsule,torusZ,fbm3,noise3,hash3} from '../sdf.mjs';
import {custom,rampFrom,hex,plastic,glass,fabric} from '../materials.mjs';
import {tilt,TS,TC,FZ} from './face.mjs';

// ---------- Hilfen ----------
const smin=(a,b,k)=>{const h=clamp(.5+.5*(b-a)/k,0,1);return mix(b,a,h)-k*h*(1-h);};
const toRgb=c=>typeof c==='string'?hex(c):c;
const mixRgb=(a,b,t)=>{a=toRgb(a);b=toRgb(b);return a.map((v,i)=>Math.round(mix(v,b[i],t)));};
const norm=v=>{const l=Math.hypot(...v)||1;return v.map(c=>c/l);};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const R=(i,j,s=0)=>hash3(i*7+3,j*13+5,s*31+11);
/** Kegelstumpf mit runden Enden (inline, schneller als sdf.roundCone in der Schleife). */
function cone(x,y,z,a,b,ra,rb){const bx=b[0]-a[0],by=b[1]-a[1],bz=b[2]-a[2],px=x-a[0],py=y-a[1],pz=z-a[2],l2=bx*bx+by*by+bz*bz||1;
 const t=clamp((px*bx+py*by+pz*bz)/l2,0,1);return Math.hypot(px-bx*t,py-by*t,pz-bz*t)-(ra+(rb-ra)*t);}
/** Strähnenbündel: jede Locke eine quadratische Kurve p0→p1→p2, Radius r0 → r1 (spitz), drei Kegelstücke. */
function lockSet(list){const L=list.map(([a,b,c,r0,r1])=>{const P=t=>[0,1,2].map(i=>(1-t)*(1-t)*a[i]+2*(1-t)*t*b[i]+t*t*c[i]);
  const ts=[0,1/3,2/3,1],pts=ts.map(P),rs=ts.map(t=>mix(r0,r1,t)),cen=[0,1,2].map(i=>pts.reduce((s,p)=>s+p[i],0)/4);
  return {pts,rs,cen,R:Math.max(...pts.map((p,i)=>Math.hypot(p[0]-cen[0],p[1]-cen[1],p[2]-cen[2])+rs[i]))};});
 return (x,y,z,cut)=>{let d=cut;for(const l of L){if(Math.hypot(x-l.cen[0],y-l.cen[1],z-l.cen[2])-l.R>=d)continue;
   for(let i=0;i<3;i++){const v=cone(x,y,z,l.pts[i],l.pts[i+1],l.rs[i],l.rs[i+1]);if(v<d)d=v;}}return d;};}
/** Haaransatz-Höhe über dem Winkel um den Kopf: vorn zF, Schläfe mit Ecke, Seite zS, Nacken zB. */
function hairline(x,y,{zF=1.2,zS=-.2,zB=-1.4,temple=.25}){const p=Math.atan2(y,Math.abs(x));
 return p>0?mix(zS,zF,smoothstep(.2,1.3,p))-temple*Math.exp(-(((p-.72)/.22)**2)):mix(zS,zB,smoothstep(0,-1.1,p));}
/** Haarkappe um den Schädel (Einheiten h): Dicke T, Unruhe `messy`, Ohren ausgespart. */
function capField(o){const {T=.24,messy=.3,line,earGap=true,top=null,wave=0}=o,cr=ellipsoid(2.28+T,2.4+T,2.3+T);
 return (x,y,z)=>{let d=cr(x,y+.12,z)-messy*.3*(fbm3(x*2.2,y*2.2,z*2.2,2)-.5)-wave*.06*Math.sin(y*3.2+x*1.3);
  if(top)d=Math.min(d,top(x,y,z));
  const hl=hairline(x,y,line)+.1*(noise3(x*2.3,y*2.3,4)-.5);d=Math.max(d,(hl-z)*.7);
  if(earGap){const e=ellipsoid(.5,.62,.86)(Math.abs(x)-2.12,y+.1,z+.12);d=Math.max(d,-e);}
  return d;};}
/** Punkt in einen Rahmen mit Achse `ax` (Dutt, Haargummi): liefert [radial-x, radial-y, entlang]. */
function frame(ax){const a=norm(ax),t=norm(cross(a,Math.abs(a[0])<.9?[1,0,0]:[0,1,0])),b=cross(a,t);
 return (x,y,z)=>[x*t[0]+y*t[1]+z*t[2],x*b[0]+y*b[1]+z*b[2],x*a[0]+y*a[1]+z*a[2]];}

// ---------- Material ----------
/** Haar mit Strähnenmalerei: flow(x,y,z) (in h) liefert den Strähnenwinkel, n Strähnen je Umlauf. */
function hairMaterial(color,h,flow,{n=26,highlight=null,depth=.055,seed=0,warp=1.3}={}){
 const base=rampFrom(color,{deep:.74,hi:.66}),hi=rampFrom(highlight?toRgb(highlight):mixRgb(color,'#ffe2a0',.3),{deep:.7,hi:.75}),lo=rampFrom(mixRgb(color,'#5a2412',.5),{deep:.8,hi:.35});// warme Schattenbüschel wie in den gemalten Bögen
 const strand=(u,v,w)=>{const x=u/h,y=v/h,z=w/h;return flow(x,y,z)*n+warp*fbm3(x*1.1+seed,y*1.1,z*1.1,2);};
 // Büschel (je zwei Strähnen) heller oder dunkler, feine Strähnen als Relief
 const tex=(u,v,w)=>{const s=strand(u,v,w),id=Math.floor(s/(2*Math.PI)),r=hash3(id+400,seed,9);
  return {k:.9+.1*Math.sin(s*2)+.1*(r-.5),ramp:r>.84?hi:r<.3?lo:base};};
 const bump=(u,v,w)=>{const s=strand(u,v,w);return depth*(Math.abs(Math.sin(s*.5))+.4*Math.abs(Math.sin(s*1.7)));};
 return custom('haar',color,tex,{spec:.32,shine:20,bump,bumpScale:1});}
/** Knoten (Dutt): gedrehte Lappen um einen Kern im Rahmen der Achse, Strähnen laufen spiralig herum. */
function bunField(F,C,size,n,seed){const lobes=[...Array(n)].map((_,i)=>{const a=i/n*Math.PI*2+.5*R(i,seed),r=(.45+.15*R(i,seed+2))*size;return [Math.cos(a)*r,Math.sin(a)*r,(-.12+.42*R(i,seed+1))*size,a];});
 return (x,y,z)=>{const [a,b,c]=F(x-C[0],y-C[1],z-C[2]);let d=ellipsoid(.78*size,.78*size,.6*size)(a,b,c);
  for(const L of lobes){const ca=Math.cos(L[3]+1.2),sa=Math.sin(L[3]+1.2),pa=a-L[0],pb=b-L[1];d=smin(d,ellipsoid(.5*size,.28*size,.34*size)(ca*pa+sa*pb,-sa*pa+ca*pb,c-L[2]),.08);}
  return d;};}
/** Strömung: gekämmte Kappe von vorn nach hinten, im Knoten spiralig. */
const combed=(x,y,z)=>Math.atan2(x,z+1.2);
function bunFlow(F,C,r){return (x,y,z)=>{const [a,b,c]=F(x-C[0],y-C[1],z-C[2]);if(a*a+b*b+c*c<r*r)return Math.atan2(b,a)+.9*c+1.1*fbm3(a*1.6,b*1.6,c*1.6,2);return combed(x,y,z);};}

// ---------- Frisuren ----------
// Jede Frisur liefert {f (in h), flow, n, extra:[{f, mat}], core} – f und extra in Kopfeinheiten.
const STYLES={
 /** Zerzauster Dutt oben hinten mit Haargummi, losen Strähnen an Schläfen und Nacken (Ida). */
 dutt(o){const messy=o.messy??.55,size=(o.size||1)*1.35,G=[0,-1.0,2.15],ax=norm([0,-.6,1]),F=frame(ax),C=[G[0]+ax[0]*.92*size,G[1]+ax[1]*.92*size,G[2]+ax[2]*.92*size];
  const cap=capField({T:.2,messy,line:{zF:1.22,zS:-.3,zB:-1.45,temple:.3}});
  const bun=bunField(F,C,size,7,1);
  // Ansatz: kurzer Zopf zwischen Kopf und Knoten, darum der Haargummi
  const stem=(x,y,z)=>{const [a,b,c]=F(x-G[0],y-G[1],z-G[2]);return Math.max(Math.hypot(a,b)-.5,Math.abs(c-.1)-.4);};
  const strands=lockSet([
   // lose Strähnen vor den Ohren (Gesichtsrahmen)
   [[1.6,1.5,1.0],[2.15,1.6,.15],[1.95,1.8,-.95],.15,.05],[[-1.6,1.5,1.0],[-2.15,1.55,.1],[-1.98,1.7,-.8],.15,.05],
   [[1.95,1.1,.65],[2.35,1.0,-.2],[2.25,1.25,-.6],.11,.04],
   // gekämmte Büschel über den Oberkopf zum Knoten
   ...[-1.1,-.35,.45,1.15].map((x,i)=>[[x*.95,1.6,1.62],[x*.9+.15*(R(i,2)-.5),.5,2.45],[x*.3,-.6,2.35],.19,.14]),
   // abstehende Strähnen aus dem Knoten
   ...[0,1,2,3].map(i=>{const a=i/4*Math.PI*2+.7,d=[Math.cos(a),Math.sin(a)],p=[C[0]+d[0]*.55,C[1]+d[1]*.45,C[2]+.3];
    return [p,[p[0]+d[0]*.45,p[1]+d[1]*.4,p[2]+.4+.15*R(i,4)],[p[0]+d[0]*.75+.15*R(i,5),p[1]+d[1]*.65,p[2]+.2*R(i,6)],.1,.03];}),
   // Nacken: kurze Härchen, die nicht im Gummi gelandet sind
   [[.5,-2.2,-1.1],[.7,-2.55,-1.45],[.6,-2.45,-1.85],.13,.04],[[-.45,-2.25,-1.05],[-.7,-2.55,-1.4],[-.75,-2.4,-1.8],.12,.04],
   [[1.7,-1.4,-.5],[2.1,-1.45,-.9],[2.1,-1.25,-1.3],.12,.04]]);
  const band=(x,y,z)=>{const [a,b,c]=F(x-G[0],y-G[1],z-G[2]);return torusZ(.5,.17)(a,b,c-.3);};
  return {f:(x,y,z)=>{let d=smin(cap(x,y,z),stem(x,y,z),.15);d=smin(d,bun(x,y,z),.1);return smin(d,strands(x,y,z,d+.1),.09);},core:cap,
   flow:bunFlow(F,C,1.1*size),n:16,
   extra:[{f:band,mat:fabric(o.band||'#a8452f',{weave:3}),group:'haarband'}]};},
 /** Lockige, voluminöse Hochsteckfrisur (Ida, nach dem gemalten Bogen): Lockenberg oben, freie Stirn,
  *  Korkenzieherlocken rahmen das Gesicht bis zum Kiefer, abstehende Kringel, kleiner Haargummi hinten. */
 locken(o){const messy=o.messy??.7,G=[0,-.55,2.35],ax=norm([0,-.45,1]),F=frame(ax),size=1.45,C=[G[0]+ax[0]*.5,G[1]+ax[1]*.5,G[2]+ax[2]*.5];
  // Volumen zur Seite statt in die Höhe: dicke Kappe mit breitem Lockenpolster über den Schläfen
  const cap=capField({T:.42,messy,line:{zF:1.32,zS:-.15,zB:-1.3,temple:.22},top:(x,y,z)=>ellipsoid(2.8,2.5,1.1)(x,y+.3,z-1.35)-.55*(fbm3(x*2.4,y*2.4,z*2.4,2)-.5)-.18*Math.sin(x*4.1+z*2.3)*Math.sin(y*3.7-z*1.9)});// Lockenpolster: unruhige Oberfläche statt glatter Haube
  const bun=bunField(F,C,size,11,5);
  const curl=(s,x0,y0,len)=>{const pts=[[s*x0,y0,.95]];for(let i=1;i<=len;i++)pts.push([s*(x0+.12+.2*(i%2)),y0+.1*(i%2),.95-.46*i]);
   return pts.slice(0,-1).map((p,i)=>[p,[(p[0]+pts[i+1][0])/2+s*.26,(p[1]+pts[i+1][1])/2+.16,(p[2]+pts[i+1][2])/2],pts[i+1],.26-.022*i,.21-.024*i]);};
  const strands=lockSet([...curl(1,1.95,1.15,5),...curl(-1,1.95,1.15,5),...curl(1,2.2,.45,4),...curl(-1,2.2,.45,4),
   // Stirnlocken: fallen über die Schläfen bis auf Wangenhöhe und rahmen das Gesicht (gemalter Bogen)
   [[1.05,1.95,1.25],[1.7,2.1,.3],[1.45,2.05,-.75],.3,.14],[[-1.05,1.95,1.25],[-1.7,2.1,.3],[-1.45,2.05,-.75],.3,.14],
   [[.4,2.0,1.4],[1.0,2.25,.9],[1.25,2.15,.35],.22,.1],
   // lockere Strähnen über der Stirn zum Lockenberg
   ...[-.9,-.2,.55,1.1].map((x,i)=>[[x,1.75,1.45],[x*.8+.2*(R(i,8)-.5),1.35,2.3],[x*.4,.2,2.75],.24,.2]),
   // Locken am Rand des Polsters (Silhouette unruhig wie im gemalten Bogen)
   ...[0,1,2,3,4,5,6,7].map(i=>{const a=i/8*Math.PI*2+.2,d=[Math.cos(a),Math.sin(a)*.9],p=[d[0]*2.55,d[1]*2.3-.3,1.3+.3*R(i,11)];return [p,[p[0]+d[0]*.5,p[1]+d[1]*.45,p[2]+.35],[p[0]+d[0]*.3,p[1]+d[1]*.25,p[2]-.35],.24,.12];}),
   // abstehende Kringel oben
   ...[0,1,2,3,4].map(i=>{const a=i/5*Math.PI*2+.3,d=[Math.cos(a),Math.sin(a)],p=[C[0]+d[0]*1.1,C[1]+d[1]*.9,C[2]+.45];return [p,[p[0]+d[0]*.4,p[1]+d[1]*.3,p[2]+.5],[p[0]+d[0]*.7,p[1]+d[1]*.5,p[2]+.2],.13,.05];})]);
  const band=(x,y,z)=>{const [a,b,c]=F(x-G[0],y-G[1],z-G[2]);return torusZ(.62,.14)(a,b+.55,c-.05);};
  return {f:(x,y,z)=>{let d=smin(cap(x,y,z),bun(x,y,z),.3);return smin(d,strands(x,y,z,d+.1),.1);},core:cap,
   flow:bunFlow(F,C,1.2*size),n:22,extra:[{f:band,mat:fabric(o.band||'#8a3a2a',{weave:3}),group:'haarband'}]};},
 /** Voluminöse Hochsteckfrisur (Anni): toupierter Oberkopf, großer Knoten, Pony-Schwung, Korkenzieherlocken, Haarband, Sonnenbrille. */
 hochgesteckt(o){const messy=o.messy??.4,G=[0,-1.05,2.3],ax=norm([0,-.7,1]),F=frame(ax),size=1.6,C=[G[0]+ax[0]*.8,G[1]+ax[1]*.8,G[2]+ax[2]*.8];
  const cap=capField({T:.28,messy,line:{zF:1.08,zS:-.25,zB:-1.35,temple:.15},top:(x,y,z)=>ellipsoid(2.1,1.9,1.0)(x,y-.45,z-2.0)});
  const bun=bunField(F,C,size,6,7);
  const curl=(s)=>{const pts=[[s*1.8,1.3,.6]];for(let i=1;i<=4;i++)pts.push([s*(1.98+.2*(i%2)),1.35+.12*(i%2),.6-.42*i]);
   return pts.slice(0,-1).map((p,i)=>[p,[(p[0]+pts[i+1][0])/2+s*.2,(p[1]+pts[i+1][1])/2+.15,(p[2]+pts[i+1][2])/2],pts[i+1],.17-.02*i,.14-.025*i]);};
  const strands=lockSet([
   // Pony: seitlich gekämmte Schwünge vom Scheitel (links) über die Stirn nach rechts
   [[-.7,1.6,2.0],[.4,2.45,1.5],[1.45,2.25,.8],.25,.1],[[-.3,1.8,1.9],[.9,2.42,1.3],[1.75,1.95,.55],.2,.06],[[-1.1,1.65,1.75],[-.6,2.35,1.35],[-.35,2.45,1.0],.16,.05],
   ...curl(1),...curl(-1),
   // abstehende Kringel am Knoten
   ...[0,1,2].map(i=>{const a=i/3*Math.PI*2+.5,d=[Math.cos(a),Math.sin(a)],p=[C[0]+d[0]*.9,C[1]+d[1]*.75,C[2]+.35];return [p,[p[0]+d[0]*.45,p[1]+d[1]*.35,p[2]+.5],[p[0]+d[0]*.75,p[1]+d[1]*.55,p[2]+.15],.11,.04];})]);
  // Haarband quer über den Oberkopf (vor dem Knoten), Sonnenbrille davor im Haar
  const band=(x,y,z)=>{const c=cap(x,y,z);return Math.max(Math.abs(c-.03)-.1,Math.abs(y-.05+.1*z)-.2,-z+.6);};
  const lens=(x,y,z)=>{const X=Math.abs(x)-.6,Y=y-1.45,Z=z-2.98;return ellipsoid(.48,.08,.33)(X,Y*.31+Z*.95,-Y*.95+Z*.31);};
  const frameF=(x,y,z)=>Math.min(capsule([-.2,1.52,3.03],[.2,1.52,3.03],.07)(x,y,z),capsule([-1.06,1.4,2.98],[-1.95,.3,2.35],.06)(x,y,z),capsule([1.06,1.4,2.98],[1.95,.3,2.35],.06)(x,y,z),
   torusZ(.45,.06)((Math.abs(x)-.6)/1.05,(y-1.45)*.31+(z-2.98)*.95,-(y-1.45)*.95+(z-2.98)*.31));
  const extra=[{f:band,mat:fabric(o.band||'#d9573a',{weave:2.5}),group:'haarband'}];
  if(o.glasses!==null&&o.glasses!==false)extra.push({f:lens,mat:glass(o.glasses||'#2c2a36'),group:'brille'},{f:frameF,mat:plastic(o.frame||'#c0492c'),group:'brille'});
  return {f:(x,y,z)=>{let d=smin(cap(x,y,z),bun(x,y,z),.2);return smin(d,strands(x,y,z,d+.1),.09);},core:cap,
   flow:bunFlow(F,C,1.25*size),n:20,extra};},
 /** Kurzes, dichtes, leicht gewelltes Haar (Dieter): Seitenscheitel, Büschel oben, Koteletten zum Bart. */
 kurz(o){const messy=o.messy??.35,cap=capField({T:.34,messy:messy+.2,wave:.5,line:{zF:1.42,zS:-.75,zB:-1.35,temple:.4}});
  const part=capsule([.72,1.9,1.75],[.8,-.4,2.45],.07);
  const strands=lockSet([
   // Büschel über der Stirn, nach hinten-oben gebürstet, eins fällt nach vorn
   ...[-1.2,-.55,.1,.95,1.5].map((x,i)=>[[x*.95,1.85,1.3],[x*1.02+.1*R(i,7),1.5,2.12+.1*R(i,8)],[x*.95,.5,2.3],.26,.14]),
   [[.3,2.0,1.6],[.15,2.5,1.45],[-.1,2.55,1.05],.17,.06],
   // Hinterkopf: ein paar Büschel nach unten
   ...[-1.2,-.4,.4,1.2].map((x,i)=>[[x,-1.1,1.95],[x*1.12,-2.2,1.15],[x*1.08+.1*R(i,9),-2.5,.1],.24,.1])]);
  return {f:(x,y,z)=>{let d=cap(x,y,z);d=Math.max(d,-part(x,y,z)+.02);return smin(d,strands(x,y,z,d+.12),.12);},core:cap,
   flow:(x,y,z)=>Math.atan2(x,z+3.2)*1.6+.1*Math.sin(y*2.6),n:34,warp:.7};},
 /** Zerzauste Strähnen in alle Richtungen (Kevin); unter einem Hut (recipe.clothes 'hut') nur, was unter der Krempe hervorschaut. */
 zerzaust(o){const messy=o.messy??1,hat=o._hat,cap0=capField({T:.24,messy,line:{zF:.95,zS:-.55,zB:-1.65,temple:.1}}),cap=cap0;
  const L=[];
  // Pony: Strähnen fallen ungleich in die Stirn
  [-1.35,-.8,-.25,.35,.95,1.45].forEach((x,i)=>{const r=R(i,10);L.push([[x*.9,1.75,1.45],[x+.25*(r-.5),2.45,.95],[x*1.05+.35*(R(i,11)-.5),2.5-.1*r,.35+.3*r],.22,.05]);});
  // über den Ohren und im Nacken abstehend
  for(const s of [-1,1])[0,1,2].forEach(i=>{const y=.75-.85*i,r=R(i,12+s);L.push([[s*2.05,y,.85],[s*(2.55+.2*r),y-.1,.25],[s*(2.45+.35*r),y+.15*(r-.5),-.3-.25*r],.2,.05]);});
  [-.9,-.3,.35,.95].forEach((x,i)=>{const r=R(i,15);L.push([[x,-2.1,-.2],[x*1.2,-2.65,-.85],[x*1.3+.3*(r-.5),-2.55,-1.45-.2*r],.2,.05]);});
  // ohne Hut: Spitzen oben
  if(!hat)[0,1,2,3,4,5].forEach(i=>{const a=i/6*Math.PI*2,r=R(i,16),p=[Math.cos(a)*1.1,Math.sin(a)*1.1-.2,2.2];L.push([p,[p[0]*1.3,p[1]*1.3,2.85],[p[0]*1.6+.3*(r-.5),p[1]*1.6,2.9+.3*r],.24,.05]);});
  const strands=lockSet(L);
  return {f:(x,y,z)=>{const c=cap(x,y,z);return smin(c,strands(x,y,z,c+.1),.1);},core:cap,flow:(x,y,z)=>Math.atan2(x,z+.5)+1.3*fbm3(x*.7,y*.7,z*.7,2),n:28};},
};
STYLES.dutt.hull=[0,-.35,.55,3.1,3.35,3.25];STYLES.locken.hull=[0,-.15,.5,3.6,3.5,3.4];STYLES.hochgesteckt.hull=[0,-.15,.8,3.2,3.4,3.35];STYLES.kurz.hull=[0,-.05,.4,2.95,3.1,2.95];STYLES.zerzaust.hull=[0,.05,.4,3.2,3.35,3.2];

// ---------- Bärte ----------
const BEARDS={
 /** Vollbart mit Schnurrbart (Dieter): buschig, spitz zulaufende Strähnen am Kinn, Mund bleibt frei. */
 voll(o,head,h,mouthW=.62){const hd=head;// Kopfform im Entwurfsrahmen (Einheiten h)
  const tips=lockSet([...[-1.25,-.8,-.35,.1,.55,1.0,1.35].map((x,i)=>{const r=R(i,20),y0=1.35+.55*(1-Math.abs(x)/1.4);
    return [[x,y0,-2.25+.35*Math.abs(x)],[x*1.1+.15*(r-.5),y0+.15,-2.85+.3*Math.abs(x)],[x*1.05+.25*(r-.5),y0+.05,-3.25+.35*Math.abs(x)-.2*r],.3,.05];})]);
  const stache=lockSet([
   // Schnurrbart: buschig, die Enden hängen über die Mundwinkel
   [[.06,2.32,-.84],[.45,2.28,-.86],[.8,2.05,-1.0],.16,.06],[[-.06,2.32,-.84],[-.45,2.28,-.86],[-.8,2.05,-1.0],.16,.06]]);
  const mouth=ellipsoid(mouthW*1.2,.9,.32);
  const f=(x,y,z)=>{const ax=Math.abs(x),zf=z-FZ;if(z>1.2||y<-.9)return Math.max(z-1.2,-.9-y,.1);
   const line=FZ+-.66-.3*Math.max(0,1-ax/.9)+1.05*smoothstep(1.45,2.1,ax)+.1*(fbm3(x*2.5,y*2.5,z*2.5,2)-.5);
   let d=hd(x,y,z)-.3-.1*fbm3(x*2,y*2,z*2,2);d=Math.max(d,(z-line)*.8,(-.35-y)*.8);
   d=smin(d,ellipsoid(1.05,.85,.72)(x,y-1.72,z+2.52),.35);
   d=Math.max(d,-mouth(x,y-2.15,zf+1.4));
   d=smin(d,stache(x,y,zf,d+.12),.1);
   return smin(d,tips(x,y,z,d+.12),.12);};
  return {f,core:(x,y,z)=>Math.max(hd(x,y,z)-.12,z+1.4,-y),flow:(x,y)=>Math.atan2(x,y+.6),n:34};},
 schnauzer(o){const t=lockSet([[[.08,2.42,-.92],[.5,2.4,-1.02],[.78,2.18,-1.38],.2,.08],[[-.08,2.42,-.92],[-.5,2.4,-1.02],[-.78,2.18,-1.38],.2,.08]]);
  return {f:(x,y,z)=>t(x,y,z,1e3),core:()=>1e3,flow:(x,y)=>Math.atan2(x,y),n:20};},
 stoppel(){return null;},
};

// ---------- Schnittstellen ----------
const hasHat=recipe=>(recipe.clothes||[]).some(([n])=>n==='hut');
/** Sichtbare Körper für Frisur und Bart mit Strähnenmaterial (im Kopf-Rahmen F.H). */
export function hairSolids(k,F,recipe,{head,h}){const out=[],hairCol=recipe.hair?.color||'#5a3b24',tex=F.H((x,y,z)=>tilt(x/h,y/h,z/h).map(v=>v*h));
 const scaled=f=>(x,y,z)=>{const [a,b,c]=tilt(x/h,y/h,z/h);return f(a,b,c)*h;};
 const S=recipe.hair&&STYLES[recipe.hair.style];
 if(S){const hat=hasHat(recipe),st=S({...recipe.hair,_hat:hat}),[cx,cy,cz,rx,ry,rz]=S.hull,hull=ellipsoid(rx,ry,rz);
  // Unter einem Hut (wardrobe.mjs 'hut') bleibt nur, was unterhalb von z = 1,25 h (Kopf-Rahmen, ungeneigt) hervorschaut.
  const f=(x,y,z)=>{const e=hull(x-cx,y-cy,z-cz);if(e>.3)return e;const d=st.f(x,y,z);return hat?Math.max(d,TS*y+TC*z+.12-1.2):d;};
  out.push({f:F.H(scaled(f)),mat:hairMaterial(hairCol,h,st.flow,{n:st.n,warp:st.warp,highlight:recipe.hair.highlight,seed:hairCol.length}),tex,layer:'haar',group:'haar'});
  for(const e of st.extra||[])out.push({f:F.H(scaled(e.f)),mat:e.mat,tex,layer:'haar',group:e.group||'haar'});}
 const Bd=recipe.beard&&BEARDS[recipe.beard.style];
 if(Bd){const mouthW=recipe.face?.mouth==='grinsen'?.66:.55,st=Bd(recipe.beard,head,h,mouthW);
  if(st){const col=recipe.beard.color||hairCol,f=(x,y,z)=>{const e=Math.hypot(x/2.8,(y-.9)/2.6,(z+1.3)/2.4)-1;return e>.25?e*2.4:st.f(x,y,z);};
   out.push({f:F.H(scaled(f)),mat:hairMaterial(col,h,st.flow,{n:st.n,highlight:recipe.beard.highlight||mixRgb(col,'#c8683a',.45),depth:.045,seed:3}),tex,layer:'bart',group:'bart'});}}
 return out;}

/** Für figure.mjs: nur ein billiger, verdeckter Kern im Schädel (die sichtbare Frisur kommt aus hairSolids über face.mjs).
 *  Solange figure.mjs HAIR/BEARD als eine Form mit Standard-Haarmaterial einsetzt, darf hier nichts sichtbar werden. */
const hidden=(k)=>{const h=k.b.head*k.s,e=ellipsoid(1.4*h,1.4*h,1.3*h);return (x,y,z)=>e(x,y,z-.3*h);};
export const HAIR=Object.fromEntries(Object.keys(STYLES).map(name=>[name,k=>hidden(k)]));
HAIR.glatze=()=>null;
export const BEARD=Object.fromEntries(Object.keys(BEARDS).map(name=>[name,name==='stoppel'?()=>()=>1e3:k=>hidden(k)]));
