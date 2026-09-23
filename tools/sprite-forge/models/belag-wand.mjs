// Sprite-Schmiede · Gruppe „belag-wand“: Bodenbeläge (Kachel 64×64 E von oben, nahtlos in x und y) und Wandstreifen
// (Wand entlang x, Länge 64, periodisch; oben die Krone von oben, darunter die Front von vorn).
//
// Grundsätze für Nahtlosigkeit:
// - Jede Geometrie ist eine periodische Höhen- bzw. Reliefkarte (Periode P=64 in x und y), damit auch Schatten- und
//   Verdeckungsstrahlen über den Kachelrand hinaus dieselbe Welt sehen.
// - Jedes Rauschen kommt aus `tn` (auf noiseTile3 aufgebaut, ganzzahlige Zellzahlen je 64 E); kein fbm3.
// - Brettbreiten, Brettlängen, Fliesen, Muster und Zellraster teilen 64. Zufall nur per hash3 über periodische Indizes.
// - Keine großflächigen Helligkeitsverläufe: Böden sind ruhiger Hintergrund, Figuren müssen sich abheben.
import {hash3,noiseTile3,smoothstep,clamp,mix,box,at,union,subtract,extrudeXZ} from '../sdf.mjs';
import {custom,rampFrom,hex} from '../materials.mjs';

const P=64,TAU=Math.PI*2;
/** In [0,p) falten. */
const wrap=(v,p=P)=>v-p*Math.floor(v/p);
/** Kachelbares Rauschen 0..1: fx/fy = Gitterzellen je 64 E in x/y (ganzzahlig), s = Kanal (Saat), oct Oktaven. */
function tn(x,y,s,fx,fy,oct=3){let sum=0,a=.5,n=0;
 for(let i=0;i<oct;i++){sum+=a*noiseTile3(x*fx/P+i*31,y*fy/P+i*17,s*7.31+i*5.3,fx,fy);n+=a;fx*=2;fy*=2;a*=.5;}return sum/n;}
/** Zufallszahl 0..1 für periodische Ganzzahl-Indizes. */
const rnd=(i,j,s)=>hash3(i,j,s*977+13);
/** Höhenkarte als Distanzfeld (Beläge, von oben): Oberfläche z=h(x,y). */
const heightField=h=>(x,y,z)=>z-h(x,y);
/** In x periodische Hülle (Periode 64) für Körper, die über den Streifenrand ragen. */
const perX=f=>(x,y,z)=>{const w=x-P*Math.round(x/P);return Math.min(f(w,y,z),f(w-P,y,z),f(w+P,y,z));};
/** Mischrampen (Stufen 0..n−1) zwischen zwei Farbrampen – für weiche Überblendungen (Staub, Moos) ohne Banding im Code. */
function blendRamps(a,b,n=8){return Array.from({length:n},(_,i)=>a.map((c,k)=>c.map((v,j)=>mix(v,b[k][j],i/(n-1)))));}
const pickRamp=(set,t)=>set[Math.round(clamp(t,0,1)*(set.length-1))];
/** Periodisches Voronoi (n×n Zellen je 64 E): Abstand zur nächsten Zellgrenze `edge` (E), Zell-Hash `id`, Nachbar-Hash `id2`.
 *  r = Suchradius in Zellen (2 = exakt genug für Kanten, 1 = schneller). */
function voronoi(x,y,n,seed,{jit=.64,r=2}={}){const c=P/n,X=wrap(x+32),Y=wrap(y+32),ci=Math.floor(X/c),cj=Math.floor(Y/c),pts=[];let b1=1e9,p1=null;
 for(let di=-r;di<=r;di++)for(let dj=-r;dj<=r;dj++){const i=ci+di,j=cj+dj,ii=wrap(i,n),jj=wrap(j,n),m=(1-jit)/2;
  const p=[(i+m+jit*rnd(ii,jj,seed))*c,(j+m+jit*rnd(ii,jj,seed+1))*c,rnd(ii,jj,seed+2)],d=Math.hypot(X-p[0],Y-p[1]);pts.push(p);if(d<b1){b1=d;p1=p;}}
 let edge=1e9,id2=0;for(const p of pts){if(p===p1)continue;const dx=p[0]-p1[0],dy=p[1]-p1[1],l=Math.hypot(dx,dy),e=-((X-(p[0]+p1[0])/2)*dx+(Y-(p[1]+p1[1])/2)*dy)/l;if(e<edge){edge=e;id2=p[2];}}
 return {edge,id:p1[2],id2};}
/** Ebenes Flachdach-Tonwert: k≈.68 trifft bei Draufsicht die Grundfarbe, k≈1.05 bei Frontansicht. */
const TOP=.68,FRONT=1.05;

// =====================================================================================================================
// Bretterböden: Reihen entlang x, Reihenbreite 64/rows, je Reihe `c` Stöße (Brettlänge 64/c) mit versetztem Startpunkt.
// =====================================================================================================================
function boardFloor({rows,joints,base,seed,tone=TOP,vari=.1,grain=.13,gap=.45,bev=.9,nails=true,knots=0,stains=0,dust=0,dustBase='#b3a68e',wear=0,grainPeriod=1.35}){
 const bw=P/rows,ramp=rampFrom(base),stainRamp=rampFrom(hex(base).map(c=>c*.85)),dustRamps=blendRamps(ramp,rampFrom(dustBase),8),nailRamp=rampFrom('#3a3438');
 function cell(x,y){const Y=wrap(y+32),r=Math.min(rows-1,Math.floor(Y/bw)),vy=Y-r*bw,[c,o]=joints[r],Ls=P/c,X=wrap(x+32-o),b=Math.min(c-1,Math.floor(X/Ls)),xs=X-b*Ls;
  return {r,b,vy,xs,Ls,id:rnd(r,b,seed),ey:Math.min(vy,bw-vy),ex:Math.min(xs,Ls-xs)};}
 // Nagelköpfe: je Brettende zwei, 1 E vom Stoß entfernt.
 function nailDist(q){if(!nails)return 9;const dx=Math.min(Math.abs(q.xs-1.05),Math.abs(q.Ls-q.xs-1.05)),dy=Math.min(Math.abs(q.vy-bw*.27),Math.abs(q.vy-bw*.73));return Math.hypot(dx,dy);}
 // Astlöcher: höchstens eines je Brett, Lage aus dem Brett-Hash.
 function knotE(q){if(!knots||rnd(q.r,q.b,seed+5)>knots)return 9;const kx=q.Ls*(.2+.6*rnd(q.r,q.b,seed+6)),ky=bw*(.35+.3*rnd(q.r,q.b,seed+7));return Math.hypot((q.xs-kx)/2.1,(q.vy-ky)/1.05);}
 function height(x,y){const q=cell(x,y),d=Math.min(q.ey,q.ex);
  let h=-.25-1.0*(1-smoothstep(gap*.5,gap*.5+bev,d));
  const nd=nailDist(q);if(nd<.45)h+=.16*(1-(nd/.45)**2);
  const ke=knotE(q);if(ke<1)h-=.12*(1-ke);
  return h;}
 const tex=(u,v)=>{const q=cell(u,v);
  // Maserung: Linien entlang x, von langgezogenem Rauschen verbogen; dazu dunkle Streifen und feine Poren.
  const warp=tn(u,v,seed+1,4,rows*2,2)*3.2+(q.id*7);
  const g=Math.sin((q.vy+warp)*TAU/grainPeriod),streak=tn(u,v,seed+2,8,64,3),pore=tn(u,v,seed+3,32,128,1);
  let k=tone*(1+vari*(q.id-.5)*2)*(1-grain*(g>.55?1:0)*.9-grain*.7*smoothstep(.55,.75,streak)+.03*(pore-.5));
  const ke=knotE(q);if(ke<.38)k*=.5;else if(Math.abs(ke-.8)<.13)k*=.72;else if(ke<1.6)k*=1-.07*Math.sin(ke*11);
  let stained=false;if(stains){const s=tn(u,v,seed+4,14,14,3);stained=s>.74;if(stained)k*=1-stains*.5*smoothstep(.74,.79,s);}
  if(wear){const w=tn(u,v,seed+8,3,6,3);k*=1+wear*smoothstep(.55,.7,w);}
  if(nailDist(q)<.42)return {k:.8,ramp:nailRamp,spec:.5};
  let rp=stained?stainRamp:ramp;
  if(dust){// Staub sammelt sich in Fugen und als Schleier in Flecken
   const edge=1-smoothstep(.3,1.4,Math.min(q.ey,q.ex)),fl=smoothstep(.5,.8,tn(u,v,seed+9,32,32,2));
   rp=pickRamp(dustRamps,dust*(.35*fl+.7*edge)+.3*dust);}
  return {k,ramp:rp};};
 return {f:heightField(height),mat:custom('bretter',base,tex,{spec:.08,shine:8}),group:'belag'};
}

// =====================================================================================================================
// Teppichboden: Rautengitter (Diagonalperiode 16) mit Rosetten, Flor als feines Rauschen – ohne Bordüre.
// =====================================================================================================================
function carpet(){
 const red=rampFrom('#7c2c28'),deep=rampFrom('#4f1d22'),gold=rampFrom('#c0843a'),ink=rampFrom('#34283a'),S=16;
 const h=(x,y)=>-.3+.12*tn(x,y,41,16,16,2);
 const tex=(x,y)=>{const u=x+y,v=x-y,au=wrap(u,S),av=wrap(v,S),lu=Math.min(au,S-au)/Math.SQRT2,lv=Math.min(av,S-av)/Math.SQRT2;
  const pile=.05*(tn(x,y,42,64,64,2)-.5)+.03*(tn(x,y,43,8,8,2)-.5);
  // Rosette in der Rautenmitte: dunkle Raute mit goldenem Kern und vier goldenen Punkten
  const a=(au-S/2)/Math.SQRT2,b=(av-S/2)/Math.SQRT2,dm=Math.abs(a)+Math.abs(b),rc=Math.hypot(a,b);
  if(rc<.55)return {k:TOP*1.25,ramp:gold};
  if(dm<2.3&&dm>1.35)return {k:TOP*.9,ramp:ink};
  if(dm<=1.35)return {k:TOP*1.05,ramp:deep};
  for(const [px,py] of [[2.6,0],[-2.6,0],[0,2.6],[0,-2.6]])if(Math.hypot(a-px*.7071-py*.7071,b-px*.7071+py*.7071)<.42)return {k:TOP*1.15,ramp:gold};
  // Gitterlinien: gepunktete Goldschnur auf dunklem Grund
  const line=Math.min(lu,lv);
  if(line<.38){const along=lu<lv?v:u,dot=Math.sin(along*TAU*29/P);return dot>.3?{k:TOP*.95,ramp:gold}:{k:TOP*.95,ramp:deep};}
  if(line<.7)return {k:TOP*(1.02+pile),ramp:deep};
  // Feld: zur Rautenmitte leicht heller (Tiefe im Muster), sonst ruhig
  const glow=1-smoothstep(1.5,5.2,rc);
  return {k:TOP*(.95+.1*glow+pile),ramp:red};};
 return {f:heightField(h),mat:custom('teppich','#7c2c28',tex,{spec:.02,shine:4}),group:'belag'};
}

// =====================================================================================================================
// Estrich: ruhiger Zementgrund, Dehnfugen alle 32 E, Haarrisse als verbogene Voronoi-Kanten (nur ein Teil der Kanten
// reißt), dazu feine Poren und wenige kleine Rostflecken.
// =====================================================================================================================
function screed(){
 const grey=rampFrom('#8c8984'),rust=rampFrom('#86725c');
 // Rissnetz: Voronoi (5×5) an verbogenen Koordinaten; eine Kante reißt nur, wenn das Zellpaar es will und die Maske passt.
 const crack=(x,y)=>{const wx=x+2.2*(tn(x,y,56,8,8,2)-.5),wy=y+2.2*(tn(x,y,57,8,8,2)-.5),v=voronoi(wx,wy,5,51,{r:1});
  const pair=hash3(Math.round((v.id+v.id2)*1e4),0,58),mask=tn(x,y,59,4,4,2);return pair>.45&&mask>.42?v.edge:9;};
 const jointD=(x,y)=>Math.min(Math.abs(wrap(x+16,32)-16),Math.abs(wrap(y+16,32)-16));
 const h=(x,y)=>{let z=-.3+.08*tn(x,y,52,6,6,2);const j=jointD(x,y);z-=.6*(1-smoothstep(.2,.55,j));const c=crack(x,y);if(c<.16)z-=.2*(1-c/.16);return z;};
 const tex=(x,y)=>{const j=jointD(x,y),c=crack(x,y),mott=tn(x,y,53,4,4,3),sp=tn(x,y,54,64,64,1);
  let k=TOP*(.95+.1*(mott-.5)+.07*(sp-.5));
  if(sp>.8)k*=.9;// Poren
  if(c<.16)k*=.84;
  if(j<.6)k*=.8;
  const r=tn(x,y,55,10,10,3);if(r>.76)return {k:k*.97,ramp:rust};
  return {k,ramp:grey};};
 return {f:heightField(h),mat:custom('estrich','#8c8984',tex,{spec:.03,shine:4}),group:'belag'};
}

// =====================================================================================================================
// Weiße Fliesen: 8×8 E, Fuge 0,5 E, Kanten leicht gewölbt; wenige Flecken, einzelne Fliese mit Sprung.
// =====================================================================================================================
function tiles(){
 const T=8,white=rampFrom('#d6d8d8'),grout=rampFrom('#7d7a72'),stain=rampFrom('#c9b797');
 const loc=(x,y)=>{const X=wrap(x+32),Y=wrap(y+32),i=Math.floor(X/T),j=Math.floor(Y/T),xs=X-i*T,ys=Y-j*T;return {i,j,xs,ys,d:Math.min(xs,T-xs,ys,T-ys)};};
 const h=(x,y)=>{const q=loc(x,y);return -.25-.7*(1-smoothstep(.22,.75,q.d))-.05*((q.xs-T/2)**2+(q.ys-T/2)**2)/32;};
 const tex=(x,y)=>{const q=loc(x,y);if(q.d<.3)return {k:TOP*(.95+.1*tn(x,y,61,32,32,1)),ramp:grout};
  const id=rnd(q.i,q.j,62);let k=TOP*(.92+.04*(id-.5)+.08*(tn(x,y,63,12,12,3)-.5));
  // Sprung quer über eine von etwa zwölf Fliesen
  if(rnd(q.i,q.j,64)<.08){const a=rnd(q.i,q.j,65)*Math.PI,dist=Math.abs((q.xs-T/2)*Math.sin(a)-(q.ys-T/2)*Math.cos(a)+.6*Math.sin(q.xs*1.7));if(dist<.14)k*=.72;}
  const s=tn(x,y,66,10,10,3);if(s>.74)return {k,ramp:stain};
  return {k,ramp:white};};
 return {f:heightField(h),mat:custom('fliesen','#d7dad4',tex,{spec:.35,shine:30}),group:'belag'};
}

// =====================================================================================================================
// Kies und Erde: Erdgrund, Kiesel in einem Zellraster (8×8 große, 16×16 kleine), vereinzelte Kräuter-Rosetten.
// =====================================================================================================================
function gravel(){
 const earth=rampFrom('#7f6242'),stoneR=[rampFrom('#8e8a86'),rampFrom('#9c9384'),rampFrom('#7c7a7e')],leaf=rampFrom('#6f8a3c');
 // Kiesel einer Zelle: Lage, Radius, Art (Rampe) – über periodische Indizes.
 function pebbles(x,y,n,s,prob,r0,r1){const c=P/n,X=wrap(x+32),Y=wrap(y+32),ci=Math.floor(X/c),cj=Math.floor(Y/c);let best=null;
  for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){const i=ci+di,j=cj+dj,ii=wrap(i,n),jj=wrap(j,n);if(rnd(ii,jj,s)>prob)continue;
   const r=r0+(r1-r0)*rnd(ii,jj,s+1),px=(i+.25+.5*rnd(ii,jj,s+2))*c,py=(j+.25+.5*rnd(ii,jj,s+3))*c,
    a=rnd(ii,jj,s+4)*Math.PI,dx=X-px,dy=Y-py,ex=(dx*Math.cos(a)+dy*Math.sin(a))/1.25,ey=-dx*Math.sin(a)+dy*Math.cos(a),d=Math.hypot(ex,ey);
   if(d<r){const hh=r*.55*(1-(d/r)**2);if(!best||hh>best.h)best={h:hh,id:rnd(ii,jj,s+5),nx:ex/r,ny:ey/r};}}
  return best;}
 function weed(x,y){const n=8,c=P/n,X=wrap(x+32),Y=wrap(y+32),i=Math.floor(X/c),j=Math.floor(Y/c);if(rnd(i,j,77)>.24)return 0;
  const px=(i+.3+.4*rnd(i,j,78))*c,py=(j+.3+.4*rnd(i,j,79))*c,dx=X-px,dy=Y-py,d=Math.hypot(dx,dy),ang=Math.atan2(dy,dx)+rnd(i,j,80)*6,R=2.7*(.7+.3*rnd(i,j,81));
  const leafR=R*(.45+.55*Math.abs(Math.cos(ang*3)));return d<leafR?1-d/leafR+.05:0;}
 const ground=(x,y)=>-1.2+.25*tn(x,y,71,8,8,3);
 const h=(x,y)=>{let z=ground(x,y);const a=pebbles(x,y,8,72,.66,1.2,2.0),b=pebbles(x,y,16,74,.55,.5,.9);
  if(a)z=Math.max(z,-1.35+a.h*1.1);if(b)z=Math.max(z,-1.25+b.h);const w=weed(x,y);if(w)z=Math.max(z,-1.05+.25*w);return z;};
 const tex=(x,y)=>{const g=ground(x,y),a=pebbles(x,y,8,72,.66,1.2,2.0),b=pebbles(x,y,16,74,.55,.5,.9),hz=h(x,y);
  const w=weed(x,y);if(w&&hz<=-1.05+.25*w+1e-6&&(!a||-1.35+a.h*1.1<hz+1e-6))return {k:TOP*(.85+.4*w),ramp:leaf};
  const pa=a&&Math.abs(-1.35+a.h*1.1-hz)<1e-6,pb=!pa&&b&&Math.abs(-1.25+b.h-hz)<1e-6;
  if(pa||pb){const p=pa?a:b;return {k:TOP*(.95+.14*(p.id-.5)+.06*(tn(x,y,75,32,32,1)-.5)),ramp:stoneR[Math.floor(p.id*3)%3],spec:.12};}
  // Erde: Krümel und feiner Grus
  const cr=tn(x,y,76,32,32,2);let k=TOP*(.94+.14*(tn(x,y,73,6,6,3)-.5));if(cr>.7)k*=1.12;else if(cr<.3)k*=.9;
  return {k:k+(g+1.2)*.05,ramp:earth};};
 return {f:heightField(h),mat:custom('kies','#8d6a44',tex,{spec:.05,shine:6}),group:'belag'};
}

// =====================================================================================================================
// Steinpflaster: periodische Voronoi-Zellen (6×6 je Kachel) als gewölbte Steine, moosige Fugen dazwischen.
// =====================================================================================================================
function cobbles(){
 const n=6,stones=[rampFrom('#6b645c'),rampFrom('#726558'),rampFrom('#65615e')],moss=rampFrom('#4d5236');
 const vor=(x,y)=>voronoi(x,y,n,91);
 const h=(x,y)=>{const v=vor(x,y);return -.2-1.3*(1-smoothstep(.4,2.1,v.edge))**1.6+.12*(tn(x,y,94,16,16,2)-.5)+.25*(v.id-.5)*.4;};
 const tex=(x,y)=>{const v=vor(x,y);
  if(v.edge<.5)return {k:TOP*(.85+.3*tn(x,y,95,32,32,2)),ramp:moss};
  let k=TOP*(.97+.12*(v.id-.5)+.1*(tn(x,y,96,16,16,3)-.5));const sp=tn(x,y,97,48,48,1);if(sp>.72)k*=1.08;else if(sp<.26)k*=.92;
  return {k,ramp:stones[Math.floor(v.id*7)%3]};};
 return {f:heightField(h),mat:custom('pflaster','#6d6862',tex,{spec:.1,shine:10}),group:'belag'};
}

// =====================================================================================================================
// Wandstreifen-Bausteine (Front zeigt nach +y, Fuß z=0, Länge 64 periodisch).
// =====================================================================================================================
/** Holz mit Maserung entlang x (waagerecht) oder z (senkrecht), kachelbar in x. */
function timber(base,{axis='x',seed=0,tone=FRONT,grain=.12}={}){const ramp=rampFrom(base);
 return custom('holz',base,(x,y,z)=>{const s=axis==='x'?tn(x,z,seed,4,96,3):tn(x,z,seed,64,6,3),g=axis==='x'?Math.sin((z*2.4+y*.3+4*tn(x,z,seed+1,6,24,2))*TAU/1.4):Math.sin((x*2.4+y*.3+4*tn(x,z,seed+1,32,3,2))*TAU/1.2);
  return {k:tone*(1-grain*smoothstep(.5,.7,s)-.05*(g>.6?1:0)+.05*(tn(x,z,seed+2,32,32,1)-.5)),ramp};},{spec:.1,shine:8});}
/** Putz: ruhig, feine Körnung, am Fuß angeschmutzt, vereinzelte Haarrisse. */
function plasterMat(base,{seed=0,z0=7,dirt=.1}={}){const ramp=rampFrom(base),dirtR=rampFrom('#b89c6c'),blend=blendRamps(ramp,dirtR,6);
 return custom('putz',base,(x,y,z)=>{const n=tn(x,z,seed,8,8,3),g=tn(x,z,seed+1,64,64,1),cr=Math.abs(tn(x,z,seed+2,5,5,3)-.5);
  let k=FRONT*(.97+.08*(n-.5)+.05*(g-.5));if(cr<.005&&tn(x,z,seed+3,3,3,2)>.6)k*=.9;
  const d=dirt*(1-smoothstep(z0,z0+4,z))+.35*dirt*smoothstep(.62,.75,tn(x,z,seed+4,6,4,3));
  return {k,ramp:pickRamp(blend,d*2)};},{spec:.03,shine:4});}
/** Mauerabdeckung als Krone: rundkantiger Balken mit Stoßfugen alle 64/segs E. */
function coping({thick,z0,z1,base,segs=5,offset=0,seed=0}){const L=P/segs,ramp=rampFrom(base);
 const body=(x,y,z)=>box(P,thick/2,(z1-z0)/2,.45)(0,y,z-(z0+z1)/2);
 const joint=(x,y,z)=>{const xx=wrap(x-offset+L/2,L)-L/2;return box(.16,thick,1.2)(xx,y,z-z1);};
 const tex=(x,y,z)=>{const i=Math.floor(wrap(x-offset,P)/L);return {k:FRONT*(.975+.03*(tn(x,y,seed+1,64,64,1)-.5)),ramp};};
 return {f:subtract(body,joint),mat:custom('abdeckung',base,tex,{spec:.05,shine:6}),group:'krone'};}

// ---------------------------------------------------------------------------------------------------------------------
// Außenwand: Bruchsteinsockel, darauf Fachwerk (Schwelle, Ständer, Rähm) mit Putzgefachen, oben die Abdeckung.
// ---------------------------------------------------------------------------------------------------------------------
function outerWall(){const th=8,hy=th/2,cut=22,Z_S=7;
 // Sockelsteine: Längen summieren sich auf 64, zwei Lagen mit unterschiedlicher Teilung (Bruchstein-Verband).
 const courses=[{z0:0,z1:3.6,lens:[8,6.5,9,7,5.5,10,8,10],off:0},{z1:Z_S,z0:3.6,lens:[10,7,6,11,8.5,6.5,9,6],off:3}];
 const stoneR=[rampFrom('#7e7880'),rampFrom('#8a8279'),rampFrom('#74727a')],moss=rampFrom('#5d6a40');
 function stoneAt(x,z){const c=z<3.6?courses[0]:courses[1],ci=z<3.6?0:1;let X=wrap(x+32-c.off),i=0;for(;i<c.lens.length-1&&X>=c.lens[i];i++)X-=c.lens[i];
  const ex=Math.min(X,c.lens[i]-X),ez=Math.min(z-c.z0+(ci===0?1:0),c.z1-z+(ci===1?.6:0));return {i:i+ci*16,e:Math.min(ex,ez),ci};}
 const plinth=(x,y,z)=>{const s=stoneAt(x,z),inset=.25*rnd(s.i,0,11)+.15*tn(x,z,12,16,16,2),r=.9*(1-smoothstep(.2,.95,s.e))+inset;
  return Math.max(y-(hy-r),-y-hy,z-Z_S,-z-1);};
 const plinthTex=(x,y,z)=>{const s=stoneAt(x,z);let k=FRONT*(.95+.12*(rnd(s.i,0,13)-.5)+.1*(tn(x,z,14,16,16,3)-.5));
  if(s.e<.3)k*=.8;
  if(z<1.1&&tn(x,z,15,24,12,2)>.6)return {k:k*.95,ramp:moss};
  return {k,ramp:stoneR[Math.floor(rnd(s.i,0,16)*3)]};};
 // Fachwerk: Ständer an festen Stellen (Gefache 14, 20, 16, 14 E), Schwelle und Rähm durchgehend.
 const posts=[-30,-16,4,20].map(px=>at(px,0,0,box(1.1,hy-.3,(18-8.4)/2+.2,.2)));
 const post=perX((x,y,z)=>{let d=1e9;for(const p of posts){const v=p(x,y,z-(8.4+18)/2);if(v<d)d=v;}return d;});
 const beams=union(at(0,0,(Z_S+8.4)/2,box(P,hy-.3,(8.4-Z_S)/2,.2)),at(0,0,19,box(P,hy-.3,1,.2)));
 const wall=(x,y,z)=>Math.max(Math.abs(y)-(hy-1.5),z-20.2,Z_S-.1-z);
 return {length:P,thickness:th,build(){return {solids:[
  {f:plinth,mat:custom('bruchstein','#7e7880',plinthTex,{spec:.06,shine:6}),group:'sockel'},
  {f:wall,mat:plasterMat('#e2cda2',{seed:21,z0:8.4,dirt:.12}),group:'putz',noShadow:true},
  {f:post,mat:timber('#5c3b22',{axis:'z',seed:22}),group:'fachwerk'},
  {f:beams,mat:timber('#5c3b22',{axis:'x',seed:23}),group:'fachwerk'},
  coping({thick:th,z0:20,z1:cut,base:'#e6d3ac',segs:5,offset:7,seed:24}),
 ]};}};}

// ---------------------------------------------------------------------------------------------------------------------
// Innenwand: Abdeckung, dunkle Deckleiste, Putzfeld, Brüstungsleiste, senkrechte Vertäfelung, Sockelleiste.
// ---------------------------------------------------------------------------------------------------------------------
function innerWall(){const th=6,hy=th/2,cut=22;
 const panelW=4;// 16 Bretter je 64 E
 const panel=(x,y,z)=>{const xs=wrap(x,panelW),e=Math.min(xs,panelW-xs),r=.45*(1-smoothstep(.12,.45,e));return Math.max(y-(hy-.6-r),-y-hy,z-10.2,1.1-z);};
 const panelTex=(()=>{const t=timber('#5e3d24',{axis:'z',seed:31});return (x,y,z,n)=>{const i=Math.floor(wrap(x,P)/panelW),o=t.tex(x,y,z,n);return {...o,k:o.k*(.95+.1*(rnd(i,0,32)-.5))};};})();
 return {length:P,thickness:th,build(){return {solids:[
  {f:(x,y,z)=>Math.max(Math.abs(y)-(hy-1.3),z-20.8,-z),mat:plasterMat('#e0c89c',{seed:33,z0:11.4,dirt:.06}),group:'putz',noShadow:true},
  {f:panel,mat:custom('vertaefelung','#5e3d24',panelTex,{spec:.1,shine:8}),group:'holz'},
  {f:at(0,0,10.8,box(P,hy-.25,.75,.25)),mat:timber('#6a4428',{axis:'x',seed:34}),group:'leiste'},
  {f:at(0,0,.6,box(P,hy-.35,.75,.2)),mat:timber('#4f331f',{axis:'x',seed:35}),group:'leiste'},
  {f:at(0,0,20.1,box(P,hy-.3,.7,.2)),mat:timber('#553822',{axis:'x',seed:36}),group:'deckleiste'},
  coping({thick:th,z0:20.7,z1:cut,base:'#e4d0a8',segs:5,offset:3,seed:37}),
 ]};}};}

// ---------------------------------------------------------------------------------------------------------------------
// Lattenzaun: 20 spitze Latten (Teilung 3,2 E), zwei Querriegel vorn mit Nagelköpfen, Riegelstoß alle 32 E.
// ---------------------------------------------------------------------------------------------------------------------
function fence(){const th=4,pitch=3.2,n=P/pitch,cut=12;
 const pw=1.15,yb=-.9;// halbe Lattenbreite, Lattenmitte in y
 const lat=(i)=>{const top=11.2+.5*rnd(wrap(i,n),0,41);return extrudeXZ([[-pw,0],[pw,0],[pw,top-1.5],[0,top],[-pw,top-1.5]],.55,.12);};
 const lats=Array.from({length:n},(_,i)=>lat(i));
 const picket=(x,y,z)=>{const X=x+32,i=Math.floor(X/pitch+.5),xl=X-i*pitch;// Mitte jeder Latte bei x=i·pitch−32
  let d=1e9;for(const di of [-1,0,1]){const j=i+di,f=lats[wrap(j,n)];const v=f(xl-di*pitch,y-yb,z);if(v<d)d=v;}return d;};
 const railY=.1,railD=.45;
 const rail=(x,y,z)=>{const xs=wrap(x+32,32),gap=Math.min(xs,32-xs);let d=Math.min(box(P,railD,.72,.25)(0,y-railY,z-3.1),box(P,railD,.72,.25)(0,y-railY,z-8.4));return Math.max(d,.12-gap);};
 const nail=(x,y,z)=>{const X=x+32,xl=X-pitch*Math.round(X/pitch);return Math.min(Math.hypot(xl,y-railY-railD,z-3.1),Math.hypot(xl,y-railY-railD,z-8.4))-.32;};
 const pwood=rampFrom('#8a5b35'),grass=rampFrom('#6a7a3c'),picketTex=(x,y,z)=>{const i=Math.floor((x+32)/pitch+.5),s=tn(x,z,43,64,6,3);
  let k=FRONT*(.96+.12*(rnd(wrap(i,n),0,44)-.5)-.12*smoothstep(.55,.72,s)+.05*(tn(x,z,45,32,32,1)-.5));
  if(z<1.1+.6*tn(x,z,46,16,4,2))return {k:k*.9,ramp:grass};
  return {k,ramp:pwood};};
 return {length:P,thickness:th,build(){return {solids:[
  {f:picket,mat:custom('latten','#8a5b35',picketTex,{spec:.08,shine:8}),group:'latten'},
  {f:rail,mat:timber('#6b4428',{axis:'x',seed:47}),group:'riegel'},
  {f:nail,mat:custom('nagel','#3d3a3e',()=>({k:.9}),{spec:.6,shine:30}),group:'riegel'},
 ]};}};}

// =====================================================================================================================
// Stoßfolgen der Bretterböden: je Reihe [Stöße je 64 E, Versatz] – Nachbarreihen nie auf gleicher Höhe.
// =====================================================================================================================
const J10=[[1,5],[2,19],[1,41],[2,9],[1,27],[2,30],[1,55],[2,14],[1,35],[2,24]];
const J8=[[2,4],[1,23],[2,15],[1,47],[2,26],[1,9],[2,20],[1,37]];
const J7=[[1,11],[1,43],[1,27],[1,58],[1,19],[1,49],[1,34]];

const floor=(make,extra={})=>({tile:P,height:1,...extra,build:()=>({solids:[make()]})});
export const MODELS={
 'dielen-dunkel':floor(()=>boardFloor({rows:10,joints:J10,base:'#604331',seed:1,vari:.09,grain:.17,stains:.18})),
 'dielen-hell':floor(()=>boardFloor({rows:10,joints:J10.map(([c,o])=>[c,wrap(o+13)]),base:'#b08a5c',seed:2,vari:.08,stains:.12,grain:.09})),
 'teppichboden-rot':floor(carpet),
 estrich:floor(screed),
 'fliesen-weiss':floor(tiles),
 'bretter-grau':floor(()=>boardFloor({rows:8,joints:J8,base:'#6b665e',seed:3,vari:.1,grain:.15,wear:.06})),
 'kies-hof':floor(gravel),
 'pflaster-stein':floor(cobbles),
 'bretter-staubig':floor(()=>boardFloor({rows:7,joints:J7,base:'#80603f',dustBase:'#ad9c8c',seed:4,vari:.1,grain:.14,knots:.5,dust:.35,nails:false,grainPeriod:1.6})),
 'wand-aussen':outerWall(),
 'wand-putz':innerWall(),
 'zaun-latten':fence(),
};
