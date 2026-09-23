// Sprite-Schmiede · Figuren: persönliches Beiwerk am Körper (E-56).
// Jede Funktion bekommt (k = Skelett, F = bodyFields, opt) und liefert Körper {f, mat, layer, group, tex}.
// Befestigung: Rücken/Gürtel/Schulter im Oberkörper-Rahmen F.U (folgt Neigung und Drehung), Gesäß im Becken (ungedreht),
// Handgehaltenes am Handgelenk (k.arms.*.hand, Richtung k.arms.*.dir), Kopfschmuck im Kopf-Rahmen F.H.
// Texturen sind am Gegenstand verankert (tex), damit Etiketten und Karos in allen Posen mitwandern.
// Lesbarkeit: Details unter 0,5 E verschwinden in Spielgröße – Kleinteile sind bewusst kräftig überzeichnet und
// tragen Farbe (Etikett, Kronkorken, Karabiner) oder Glanz (Glas, Messing) statt Form.
import {clamp,fbm3,hash3,at,union,subtract,box,cylZ,capsule,ellipsoid,roundCone,torusZ,sphere} from '../sdf.mjs';
import {glass,wood,metal,fabric,leather,plastic,custom,rampFrom,glow} from '../materials.mjs';
import {add,mul,rotXv,rotZv} from './skeleton.mjs';
import {tilt,FZ} from './face.mjs';

// ---------- Vektoren und Rahmen ----------
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];};
/** Orthonormaler Rahmen mit z-Achse entlang d; x liegt möglichst quer zu `hint`. */
const basis=(d,hint=[0,0,1])=>{const ez=unit(d);let ex=cross(hint,ez);if(Math.hypot(ex[0],ex[1],ex[2])<1e-3)ex=cross([0,1,0],ez);ex=unit(ex);return [ex,cross(ez,ex),ez];};
/** Feld f in einem lokalen Rahmen (Ursprung o, Achsen [ex,ey,ez]); f bekommt lokale Koordinaten (auch für tex). */
const inFrame=(o,[ex,ey,ez],f)=>(x,y,z)=>{const d0=x-o[0],d1=y-o[1],d2=z-o[2];return f(d0*ex[0]+d1*ex[1]+d2*ex[2],d0*ey[0]+d1*ey[1]+d2*ey[2],d0*ez[0]+d1*ez[1]+d2*ez[2]);};
const LOC=(x,y,z)=>[x,y,z];
/** Punkt aus dem unbewegten Oberkörper-Rahmen in die Pose bringen (Umkehrung von F.U). */
const posed=(k,p)=>rotZv(rotXv(p,k.lean,k.pivot),k.twist,k.pivot);
/** Rumpfoberfläche (nackt) von innen (c) in Richtung d suchen – im unbewegten Oberkörper-Rahmen. */
function surfU(k,F,c,d){const u=unit(d);let t=0;for(let i=0;i<200;i++){const q=posed(k,add(c,mul(u,t)));if(F.torso(q[0],q[1],q[2])>=0)break;t+=.05;}return add(c,mul(u,t));}
/** Rahmen an der Rumpfoberfläche: Höhe z (absolut), Winkel a in Grad von vorn (+) zur Seite `side`; Abstand off über der Haut.
 * Liefert {o, B:[tangente, normale, oben]} im Oberkörper-Rahmen. */
function onTorso(k,F,{z,a,side=1,off=.6,tilt=0}){const r=a*Math.PI/180,n=[side*Math.sin(r),Math.cos(r),0],c=[0,.2*k.s,z];
 const p=add(surfU(k,F,c,n),mul(n,off*k.s)),up=unit([n[0]*tilt,n[1]*tilt,1]),ex=unit(cross(n,up));return {o:p,B:[ex,cross(up,ex),up]};}
/** Ring um eine Achse (Armreif, Schlauchschelle): Mitte o, Achse d, Radius R, Stärke r, Breite h. */
const band=(o,d,R,r,h)=>inFrame(o,basis(d),(x,y,z)=>Math.max(Math.abs(Math.hypot(x,y)-R)-r,Math.abs(z)-h));
/** Vereinigung vieler kleiner Teile mit Hüllkugel je Teil [c, r, f]: ferne Teile kosten nur einen Abstand. */
const bunch=items=>(x,y,z)=>{let d=1e9;for(const [c,rb,f] of items){const b=Math.hypot(x-c[0],y-c[1],z-c[2])-rb;if(b>=d)continue;const v=b>.4?b:f(x,y,z);if(v<d)d=v;}return d;};
/** Glatte Kurve durch Stützpunkte (Catmull-Rom) als Kette aus Kapseln. */
function tube(pts,r,n=4){const P=[pts[0],...pts,pts[pts.length-1]],seg=[];
 const cr=(a,b,c,d,t)=>a.map((_,i)=>.5*(2*b[i]+(-a[i]+c[i])*t+(2*a[i]-5*b[i]+4*c[i]-d[i])*t*t+(-a[i]+3*b[i]-3*c[i]+d[i])*t*t*t));
 let prev=pts[0];for(let i=1;i<P.length-2;i++)for(let j=1;j<=n;j++){const q=cr(P[i-1],P[i],P[i+1],P[i+2],j/n);seg.push([prev,q]);prev=q;}
 const rr=typeof r==='function'?r:()=>r,parts=seg.map(([a,b],i)=>[a.map((v,j)=>(v+b[j])/2),Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])/2+rr(i/seg.length),capsule(a,b,rr(i/seg.length))]);
 return {seg,f:bunch(parts)};}
/** Kasten mit gerundeten Kanten um die x-Achse (liegender Zylinder). */
const cylX=(rad,x0,x1,r=0)=>(x,y,z)=>cylZ(rad,x0,x1,r)(y,z,x);
const cylY=(rad,y0,y1,r=0)=>(x,y,z)=>cylZ(rad,y0,y1,r)(x,z,y);

// ---------- Materialien für Kleinteile ----------
const RAMPS=new Map(),R=c=>{if(!RAMPS.has(c))RAMPS.set(c,rampFrom(c));return RAMPS.get(c);};
/** Glanzstreifen: senkrechte Flächen, die nach links vorn zeigen (Hauptlicht), bekommen einen gemalten Lichtstreif. */
const glint=(n,lo=-.88,hi=-.28)=>n&&n[0]<hi&&n[0]>lo&&n[1]>.12;
const glassShine=base=>custom('glas',base,(u,v,w,n)=>({k:glint(n)?1.8:1}),{spec:1.1,shine:60,glass:true});
const shiny=(base,{spec=.85,shine=34,name='metall'}={})=>custom(name,base,(u,v,w,n)=>({k:(glint(n)?1.35:1)*(.9+.18*fbm3(u*.9,v*.9,w*.9,2))}),{spec,shine});
const rubber=base=>custom('gummi',base,(u,v,w,n)=>({k:glint(n,-.9,-.35)?1.3:1}),{spec:.45,shine:26});

// ---------- Tragegurte (für alle Rucksäcke) ----------
/** Zwei Gurte über die Schultern, vorn bis `down` E über der Hüfte, mit Schnallen auf der Brust. */
function straps(k,F,{x=.5,width=.4,off=.62,down=3.8,color='#3a2a22',buckle='#c9a045',layer='beiwerk',zBuckle=4.9}={}){
 const {s,hipZ,sw}=k,r0=k.root[2],xs=x*sw,zMin=r0+hipZ+down*s;
 const slab=F.U((x,y,z)=>Math.max(Math.abs(Math.abs(x)-xs)-width*s,zMin-z));
 const strap=(x,y,z)=>{const sl=slab(x,y,z);return sl>.3?sl:Math.max(Math.abs(F.torso(x,y,z)-(off+.13)*s)-.13*s,sl);};
 const bk=[-1,1].map(side=>{const p=surfU(k,F,[side*xs,0,r0+hipZ+zBuckle*s],[0,1,0]);return F.U(at(p[0],p[1]+(off+.3)*s,p[2],box(width*s+.14*s,.16*s,.36*s,.08*s)));});
 const tongue=[-1,1].map(side=>{const p=surfU(k,F,[side*xs,0,r0+hipZ+zBuckle*s],[0,1,0]);return F.U(at(p[0],p[1]+(off+.44)*s,p[2],box(.12*s,.08*s,.3*s)));});
 return [{f:strap,mat:leather(color),layer,group:'riemen',tex:F.U(LOC)},{f:union(...bk),mat:shiny(buckle),layer,group:'schnalle'},{f:union(...tongue),mat:leather(color),layer,group:'schnalle'}];}

/** Beiwerk am Körper. */
export const PROPS={
 // ================= Kisten-Ida =================
 /** Bierkasten unter dem Arm (side −1 = links): Grifflöcher, Rippen, Etikett in der Mulde, 15 Flaschen mit Halsschleife und Kronkorken.
  * Echte Maße 40 × 30 × 30 cm ≈ 5,8 × 4,3 × 4,3 E; lange Seite in Blickrichtung, an die Hüfte gedrückt (Innenseite an der Kleidung). */
 kasten(k,F,{side=-1,color='#2f4a33',label='#ecdcb0',band='#b5382a',text='#4a2a1a',bottle='#5a3814',cap='#d6aa48',foil='#e2c66e',layer='beiwerk'}={}){
  const {s,hipZ}=k,r0=k.root[2],hx=2.05*s,hy=2.85*s,hz=2.05*s,zc=r0+hipZ+1.05*s;
  const inner=surfU(k,F,[0,.3*s,zc],[side,0,0]),c=[inner[0]+side*(.62*s+hx),.35*s,zc];
  // Kasten-Koordinaten: X nach außen (weg vom Körper), Y nach vorn, Z nach oben
  const Lc=f=>F.U((x,y,z)=>f((x-c[0])*side,y-c[1],z-c[2]));
  const crate=(X,Y,Z)=>{let d=box(hx,hy,hz,.3*s)(X,Y,Z);
   d=Math.max(d,-box(hx-.28*s,hy-.28*s,hz)(X,Y,Z-.55*s));                          // Innenraum, oben offen
   d=Math.max(d,-box(1.05*s,hy+.5*s,.36*s,.3*s)(X,Y,Z-(hz-.8*s)));                 // Grifflöcher an den Stirnseiten
   d=Math.max(d,-box(.12*s,hy-.55*s,hz-1.0*s,.1*s)(Math.abs(X)-hx,Y,Z+.25*s));     // Mulde für den Aufdruck
   return d;};
  const crateMat=custom('kunststoff',color,(X,Y,Z,n)=>{let kk=.93+.12*(fbm3(X*.8,Y*.8,Z*.8,2)-.5);
   if(n&&Math.abs(n[2])<.6){const f=(Z+hz)/(.62*s);if(f-Math.floor(f)<.17)kk*=.76;}                      // waagerechte Rippen
   if(Z>hz-.3*s)kk*=1.12;return {k:kk};},{spec:.35,shine:22});
  const plate=(X,Y,Z)=>box(.07*s,hy-.85*s,hz-1.3*s,.06*s)(Math.abs(X)-(hx-.08*s),Y,Z+.25*s);
  const plateMat=custom('etikett',label,(X,Y,Z)=>{const e=Math.hypot(Y/(hy-.95*s),(Z+.25*s)/(hz-1.35*s));
   if(e>.86)return {k:1,ramp:R(band)};if(Math.abs(Z+.25*s)<.2*s&&Math.abs(Y)<1.25*s)return {k:.95,ramp:R(text)};return {k:1.02};},{spec:.08,shine:6});
  // Flaschen 3 × 5, Hälse ragen über den Rand
  const cell=(X,Y,f)=>{const gx=clamp(Math.round(X/(1.15*s)),-1,1),gy=clamp(Math.round(Y/(1.02*s)),-2,2);return f(X-gx*1.15*s,Y-gy*1.02*s);};
  const bot=(X,Y,Z)=>cell(X,Y,(x,y)=>union(cylZ(.46*s,-hz+.5*s,.7*s,.12*s),roundCone([0,0,.7*s],[0,0,1.5*s],.44*s,.2*s),cylZ(.2*s,1.4*s,hz+.52*s,.05*s))(x,y,Z));
  const foilF=(X,Y,Z)=>cell(X,Y,(x,y)=>cylZ(.25*s,1.55*s,2.05*s,.04*s)(x,y,Z));
  const capF=(X,Y,Z)=>cell(X,Y,(x,y)=>cylZ(.29*s,hz+.45*s,hz+.7*s,.06*s)(x,y,Z));
  const tex=Lc(LOC);
  return [{f:Lc(crate),mat:crateMat,layer,group:'kasten',tex},{f:Lc(plate),mat:plateMat,layer,group:'kasten',tex},
   {f:Lc(bot),mat:glassShine(bottle),layer,group:'flaschen',tex},{f:Lc(foilF),mat:shiny(foil,{spec:.6,shine:24}),layer,group:'flaschen',tex},
   {f:Lc(capF),mat:shiny(cap),layer,group:'flaschen',tex}];},

 /** Schlüsselbund am Hosenbund: roter Karabiner, Ring, vier Schlüssel (Messing/Silber) im Fächer. */
 schluessel(k,F,{side=1,a=78,z=1.2,layer='beiwerk',clip='#c23a2c'}={}){const {s,hipZ}=k,r0=k.root[2];
  const {o,B}=onTorso(k,F,{z:r0+hipZ+z*s,a,side,off:.62}),L=f=>F.U(inFrame(o,B,f));
  // lokal: x = entlang der Hüfte, y = nach außen, z = oben
  const kara=(x,y,z)=>{const q=Math.hypot(x,Math.max(Math.abs(z+.45*s)-.32*s,0))-.3*s;return Math.hypot(q,y)-.11*s;};
  const ring=(x,y,z)=>Math.hypot(Math.hypot(x,z+1.2*s)-.36*s,y)-.09*s;
  const key=(i)=>{const a=(-38+i*25)*Math.PI/180,c=Math.cos(a),sn=Math.sin(a);
   // Schlüssel hängt am Ring: Reide (Scheibe), Halm, Bart; um den Aufhängepunkt gefächert
   return (x,y,z)=>{const X=c*x+sn*(z+1.5*s),Z=-sn*x+c*(z+1.5*s);
    return Math.min(cylY(.3*s,-.07*s,.07*s,.03)(X,y,Z+.25*s),box(.12*s,.06*s,.55*s,.03)(X,y,Z+1.0*s),box(.12*s,.06*s,.12*s)(X-.14*s,y,Z+1.3*s));};};
  const brass=union(key(0),key(2)),steel=union(key(1),key(3));
  return [{f:L(kara),mat:shiny(clip,{spec:.6,shine:30}),layer,group:'schluessel'},{f:L(ring),mat:shiny('#b8bcbe'),layer,group:'schluessel'},
   {f:L(brass),mat:shiny('#d4aa4a'),layer,group:'schluessel'},{f:L(steel),mat:shiny('#c4c8ca'),layer,group:'schluessel'}];},

 /** Zigarette hinterm Ohr (Kopf-Rahmen), Filter nach vorn. */
 zigarette(k,F,{side=1,layer='beiwerk'}={}){const hs=k.b.head*k.s,s=k.s;
  const a=[side*2.28*hs,1.2*hs,.42*hs],b=[side*2.36*hs,-1.0*hs,.66*hs];
  const mat=custom('papier','#f4efe4',(x,y,z)=>y>.5*hs?{k:1.05,ramp:R('#d8873a')}:y<-.9*hs?{k:.8,ramp:R('#8a8580')}:{k:1.02},{spec:.05,shine:6});
  return [{f:F.H(capsule(a,b,.24*s)),mat,layer,group:'zigarette',tex:F.H(LOC)}];},

 /** Gelber Zollstock steckt in der Gesäßtasche (Becken-Rahmen): Gliederpaket mit Teilstrichen und Nietkopf. */
 zollstock(k,F,{side=1,layer='beiwerk',color='#e6c02c'}={}){const {s,hipZ}=k,r0=k.root[2],c=[0,0,r0+hipZ+.9*s];
  const n=unit([side*.45,-.9,0]);let t=0;while(t<8&&F.torso(c[0]+n[0]*t,c[1]+n[1]*t,c[2])<0)t+=.05;
  const o=add(add(c,mul(n,t+.78*s)),[0,0,-.4*s]),up=unit([n[0]*.12+side*.18,n[1]*.12,1]),ex=unit(cross(n,up)),B=[ex,cross(up,ex),up];
  const f=inFrame(o,B,(x,y,z)=>box(.42*s,.15*s,1.2*s,.05*s)(x,y,z-.6*s));
  const mat=custom('lack',color,(x,y,z)=>{const q=(z+.2*s)/(.42*s);if(q-Math.floor(q)<.2&&x>-.1*s)return {k:.5,ramp:R('#2a2420')};if(z>1.65*s)return {k:.9,ramp:R('#b8bcbe')};return {k:1};},{spec:.3,shine:20});
  return [{f,mat,layer,group:'zollstock',tex:inFrame(o,B,LOC)}];},

 /** Zimmermannsbleistift (rot, flach) quer im Latz. */
 bleistift(k,F,{side=-1,z=5.4,a=28,layer='beiwerk'}={}){const {s,hipZ}=k,r0=k.root[2];
  const {o,B}=onTorso(k,F,{z:r0+hipZ+z*s,a,side,off:.62}),L=f=>F.U(inFrame(o,B,f));
  const f=L((x,y,z)=>{const c=Math.cos(.35),sn=Math.sin(.35),X=c*x+sn*z,Z=-sn*x+c*z;return box(.2*s,.12*s,.95*s,.05*s)(X,y,Z);});
  const mat=custom('lack','#c2362a',(x,y,z)=>{const Z=-Math.sin(.35)*x+Math.cos(.35)*z;return Z>.72*s?{k:1,ramp:R('#e2c48e')}:{k:1};},{spec:.3,shine:20});
  return [{f,mat,layer,group:'bleistift',tex:F.U(inFrame(o,B,LOC))}];},

 // ================= Dosen-Dieter =================
 /** Liegendes Fass als Rucksack: Dauben, vier Reifen, Spund, Messing-Zapfhahn an der Stirnseite, Tragegurte, Hopfenranke mit Dolden. */
 fass(k,F,{wood:wc='#8a5a2e',hoop='#6a6660',brass='#caa044',strap='#6e4024',hops=true,layer='beiwerk'}={}){
  const {s,hipZ}=k,r0=k.root[2],zc=r0+hipZ+5.4*s,L=2.75*s,R0=2.0*s,bul=.3*s;
  const back=surfU(k,F,[0,0,zc],[0,-1,0])[1],c=[0,back-(.62*s+R0+bul),zc];
  const Lc=f=>F.U((x,y,z)=>f(x-c[0],y-c[1],z-c[2])),rad=X=>R0+bul*Math.cos(X/L*1.25);
  const keg=(X,Y,Z)=>{const dr=Math.hypot(Y,Z)-rad(X),dx=Math.abs(X)-L;return Math.min(Math.max(dr,dx),0)+Math.hypot(Math.max(dr,0),Math.max(dx,0))-.12*s;};
  const staves=custom('holz',wc,(X,Y,Z)=>{const a=Math.atan2(Z,Y)/(2*Math.PI)*18,f=a-Math.floor(a);
   if(Math.abs(X)>L-.1*s){const rr=Math.hypot(Y,Z);return {k:.8+.1*Math.sin(rr*4.5/s+2*fbm3(Y,Z,0,2)),ramp:R('#7a4c26')};}
   let kk=.9+.08*Math.sin(X*2.4/s+5*fbm3(X*.12,a*.7,0,2))+.12*(fbm3(X*.6,Y*.6,Z*.6,2)-.5);if(f<.08||f>.92)kk*=.55;return {k:kk};},{spec:.12,shine:8});
  const HX=[-L+.4*s,-.95*s,.95*s,L-.4*s];
  const hoops=(X,Y,Z)=>{let hx=HX[0];for(const h of HX)if(Math.abs(X-h)<Math.abs(X-hx))hx=h;return Math.max(Math.hypot(Y,Z)-rad(X)-.16*s,Math.abs(X-hx)-.24*s)-.03;};
  // Zapfhahn: Körper aus der Stirnseite, Auslauf nach unten, Hebel mit schwarzem Knauf
  const zh=-.75*s,tap=union((X,Y,Z)=>cylX(.38*s,L-.2*s,L+.75*s,.1*s)(X,Y,Z-zh),
   (X,Y,Z)=>capsule([L+.62*s,0,zh],[L+.66*s,0,zh-1.05*s],.24*s)(X,Y,Z),(X,Y,Z)=>capsule([L+.45*s,0,zh+.1*s],[L+.4*s,0,zh+1.05*s],.17*s)(X,Y,Z));
  const knob=(X,Y,Z)=>sphere(.36*s)(X-L-.4*s,Y,Z-zh-1.25*s);
  const bung=(X,Y,Z)=>cylZ(.4*s,rad(.8*s)-.2*s,rad(.8*s)+.24*s,.08*s)(X-.8*s,Y,Z);
  const out=[{f:Lc(keg),mat:staves,layer,group:'fass',tex:Lc(LOC)},{f:Lc(hoops),mat:metal(hoop,{rust:.25,shine:30,spec:.6}),layer,group:'reifen',tex:Lc(LOC)},
   {f:Lc(tap),mat:shiny(brass),layer,group:'zapfhahn',tex:Lc(LOC)},{f:Lc(knob),mat:plastic('#2a2624'),layer,group:'zapfhahn'},
   {f:Lc(bung),mat:wood('#5a3a1e',{axis:'z'}),layer,group:'fass',tex:Lc(LOC)},...straps(k,F,{color:strap,off:.66,x:.52,width:.46,layer})];
  if(hops){// Ranke vom Fass über die linke Stirnseite am Rücken hinab bis zur Hüfte
   const P=[[-1.4*s,c[1]+.4*s,zc+R0+bul+.1*s],[-L-.1*s,c[1]+.5*s,zc+1.5*s],[-L-.55*s,c[1]+1.3*s,zc-.6*s],[-k.sw-.35*s,c[1]+2.3*s,zc-3.2*s],[-k.sw-.1*s,c[1]+2.9*s,zc-6.0*s]];
   const vine=tube(P,.14*s,4),pts=vine.seg.map(q=>q[1]);
   const cones=[],leaves=[];pts.forEach((p,i)=>{const h=hash3(i,7,3),h2=hash3(i,3,9),side=i%2?1:-1,sz=.85+.3*h2;
    {const c=[p[0]+side*.5*s,p[1]+(h-.5)*.7*s,p[2]-.4*s];cones.push([c,.7*s*sz,at(...c,ellipsoid(.42*s*sz,.42*s*sz,.64*s*sz))]);}
    if(i%3===1){const c=[p[0]-side*.25*s,p[1]+.35*s,p[2]-.95*s];cones.push([c,.6*s,at(...c,ellipsoid(.36*s,.36*s,.54*s))]);}
    const a=h*Math.PI;leaves.push([[p[0]-side*.55*s,p[1],p[2]-.25*s],.95*s,(x,y,z)=>{const X=x-p[0]+side*.55*s,Y=y-p[1],Z=z-p[2]+.25*s,c2=Math.cos(a),s2=Math.sin(a);return ellipsoid(.9*s,.2*s,.7*s)(c2*X+s2*Y,-s2*X+c2*Y,Z);}]);});
   const coneMat=custom('dolde','#a8c25a',(u,v,w)=>{const q=w*2.8/s+Math.floor(Math.atan2(v,u)*1.3)*.5;return {k:(q-Math.floor(q)<.3?.78:1.05)};},{spec:.1,shine:8});
   out.push({f:F.U(vine.f),mat:fabric('#56642a',{weave:3}),layer,group:'hopfen'},{f:F.U(bunch(cones)),mat:coneMat,layer,group:'dolden',tex:F.U(LOC)},
    {f:F.U(bunch(leaves)),mat:fabric('#3f6a2a',{weave:2.4,fuzz:.2}),layer,group:'hopfen',tex:F.U(LOC)});}
  return out;},

 /** Kariertes Geschirrtuch, über den Schürzenbund geschlagen (Karos 0,7 E, rot/weiß). */
 geschirrtuch(k,F,{side=1,a=62,z=2.6,colors=['#b8402e','#dc9a88','#efe6d2'],layer='beiwerk'}={}){const {s,hipZ}=k,r0=k.root[2];
  const {o,B}=onTorso(k,F,{z:r0+hipZ+z*s,a,side,off:.78}),L=f=>F.U(inFrame(o,B,f));
  const sheet=(x,y,z)=>{const hw=.8*s+.08*Math.max(0,-z),wave=.14*s*Math.sin(z*1.7/s+x*1.3/s);
   const hang=Math.max(Math.abs(x)-hw,Math.abs(y-wave+.05*z)-.11*s,z-.35*s,-z-3.3*s);
   const fold=Math.max(Math.abs(x)-.84*s,Math.abs(y-.2*s)-.14*s,Math.abs(z-.05*s)-.42*s);return Math.min(hang,fold)-.02;};
  const mat=custom('stoff',colors[2],(x,y,z)=>{const q=.7*s,a=Math.floor(x/q+50)&1,b=Math.floor(z/q+50)&1,k=.93+.1*(fbm3(x*.8,y*.8,z*.8,2)-.5);
   return a&&b?{k,ramp:R(colors[0])}:a||b?{k,ramp:R(colors[1])}:{k};},{spec:.03,shine:4});
  return [{f:L(sheet),mat,layer,group:'tuch',tex:F.U(inFrame(o,B,LOC))}];},

 /** Flaschenöffner am roten Band vom Schürzenbund. */
 oeffner(k,F,{side=-1,a=38,z=2.6,layer='beiwerk'}={}){const {s,hipZ}=k,r0=k.root[2];
  const {o,B}=onTorso(k,F,{z:r0+hipZ+z*s,a,side,off:.72}),L=f=>F.U(inFrame(o,B,f));
  const cord=(x,y,z)=>capsule([0,0,0],[.12*s,.1*s,-1.3*s],.15*s)(x,y,z);
  const opener=(x,y,z)=>Math.max(box(.34*s,.09*s,.62*s,.08*s)(x-.14*s,y-.1*s,z+1.95*s),-cylY(.18*s,-1,1)(x-.14*s,y,z+1.62*s));
  return [{f:L(cord),mat:fabric('#8a2a24',{weave:2}),layer,group:'band'},{f:L(opener),mat:shiny('#c4c8ca'),layer,group:'oeffner'}];},

 /** Bierdose in der Hand (aufrecht): Goldblech, rotes Band mit weißem Schriftzug, Deckel mit Lasche. */
 dose(k,F,{hand='l',body='#d2aa4a',band='#b8322a',layer='beiwerk'}={}){const {s}=k,h=k.arms[hand].hand,o=add(h,[0,.12*s,.12*s]);
  const f=at(...o,cylZ(.6*s,-1.05*s,1.05*s,.16*s)),tex=(x,y,z)=>[x-o[0],y-o[1],z-o[2]];
  const mat=custom('dose',body,(x,y,z,n)=>{const g=glint(n)?1.35:1;if(z>.9*s)return {k:1.05*g,ramp:R('#c8ccce')};
   if(Math.abs(z)<.45*s)return Math.abs(z)<.1*s&&n&&n[1]>0?{k:1.1*g,ramp:R('#f0e8d8')}:{k:g,ramp:R(band)};return {k:g};},{spec:.8,shine:34});
  return [{f,mat,layer,group:'dose',tex}];},

 // ================= Aperol-Anni =================
 /** Drucksprüher-Tank: orange mit Etikettband (Kreis-Emblem), dunkle Sicken, Pumpgriff, Gurte, Schlauch in Schlaufe zur Sprühlanze in der Hand. */
 tank(k,F,{color='#e0782a',label='#f0e0c0',emblem='#c83a1e',hand='r',layer='beiwerk'}={}){
  const {s,hipZ,sw}=k,r0=k.root[2],zc=r0+hipZ+4.4*s,rT=1.65*s;
  const back=surfU(k,F,[0,0,zc],[0,-1,0])[1],c=[0,back-(.5*s+rT),zc];
  const Lc=f=>F.U((x,y,z)=>f(x-c[0],y-c[1],z-c[2]));
  const body=(X,Y,Z)=>cylZ(rT,-2.7*s,2.5*s,.8*s)(X,Y,Z);
  const mat=custom('metall',color,(X,Y,Z,n)=>{const g=glint(n)?1.3:1;
   if(Z>-1.05*s&&Z<.85*s){if(Z<-.88*s||Z>.68*s)return {k:g,ramp:R(emblem)};
    if(Y<0&&Math.hypot(X,Z+.1*s)<.62*s)return {k:g,ramp:R(emblem)};if(Y<0&&Math.hypot(X,Z+.1*s)<.8*s)return {k:g,ramp:R('#e8b848')};return {k:g*1.02,ramp:R(label)};}
   return {k:g*(.94+.1*fbm3(X*.6,Y*.6,Z*.6,2))};},{spec:.6,shine:26});
  const beads=(X,Y,Z)=>Math.min(torusZ(rT+.02*s,.15*s)(X,Y,Z-1.55*s),torusZ(rT+.02*s,.15*s)(X,Y,Z+1.95*s));
  const pump=(X,Y,Z)=>Math.min(cylZ(.5*s,2.3*s,3.0*s,.12*s)(X,Y,Z),capsule([0,0,2.9*s],[0,0,3.55*s],.17*s)(X,Y,Z),capsule([-.8*s,0,3.6*s],[.8*s,0,3.6*s],.2*s)(X,Y,Z));
  // Schlauch: Auslass unten rechts → Schlaufe am Oberschenkel → Griff in der Hand
  const hd=k.arms[hand],sd=hand==='r'?1:-1,out0=posed(k,[c[0]+sd*1.0*s,c[1]+.2*s,c[2]-2.6*s]);
  const grip=add(hd.hand,mul(hd.dir,-.1*s)),below=add(grip,[0,0,-.55*s]);
  const P=[out0,add(out0,[sd*.5*s,.1*s,-1.0*s]),[sd*(sw+1.1*s),-1.1*s,r0+hipZ-3.2*s],[sd*(sw+1.3*s),.5*s,r0+hipZ-4.2*s],[sd*(sw+1.0*s),grip[1]-.9*s,Math.min(grip[2]-2.2*s,r0+hipZ-1.0*s)],below];
  const hose=tube(P,.27*s,4);
  // Sprühlanze entlang des Unterarms mit Messingdüse
  const d=hd.dir,lance=capsule(add(grip,mul(d,.2*s)),add(grip,mul(d,2.7*s)),.2*s),nozzle=roundCone(add(grip,mul(d,2.6*s)),add(grip,mul(d,3.25*s)),.2*s,.34*s);
  const valve=at(...below,ellipsoid(.36*s,.36*s,.3*s));
  return [{f:Lc(body),mat,layer,group:'tank',tex:Lc(LOC)},{f:Lc(beads),mat:metal('#3a2c28',{shine:26,spec:.5}),layer,group:'tank'},
   {f:Lc(pump),mat:plastic('#2c2828'),layer,group:'pumpe'},...straps(k,F,{color:'#3a2a22',off:.46,x:.5,width:.38,layer,down:3.6,zBuckle:4.6}),
   {f:hose.f,mat:rubber('#2f5a3c'),layer,group:'schlauch'},{f:union(lance,valve),mat:shiny('#b8bcbe'),layer,group:'lanze'},{f:nozzle,mat:shiny('#caa044'),layer,group:'duese'}];},

 /** Goldene Creolen (Kopf-Rahmen). */
 creolen(k,F,{color='#e2b444',layer='beiwerk'}={}){const hs=k.b.head*k.s;
  const ring=x=>inFrame([x,-.05*hs,-1.05*hs],[[0,1,0],[0,0,1],[1,0,0]],torusZ(.46*hs,.14*hs));
  return [{f:F.H(union(ring(2.15*hs),ring(-2.15*hs))),mat:shiny(color,{spec:1,shine:40}),layer,group:'schmuck'}];},

 /** Armreifen am Handgelenk (zwei, golden). */
 armreif(k,F,{hand='l',color='#e2b444',layer='beiwerk'}={}){const {s}=k,a=k.arms[hand],lr=.85+.4*k.b.build,R0=.6*s*lr+.42*s;
  const d=unit(sub(a.wrist,a.elbow)),f=union(band(add(a.wrist,mul(d,-.45*s)),d,R0,.13*s,.16*s),band(add(a.wrist,mul(d,-.95*s)),d,R0+.06*s,.1*s,.12*s));
  return [{f,mat:shiny(color,{spec:1,shine:40}),layer,group:'schmuck'}];},

 /** Putzspray am Gürtel: blaue Flasche mit Etikett, weißer Sprühkopf mit Abzug. */
 putzspray(k,F,{side=-1,a=86,z=2.8,layer='beiwerk'}={}){const {s,hipZ}=k,r0=k.root[2];
  const {o,B}=onTorso(k,F,{z:r0+hipZ+z*s,a,side,off:.95}),L=f=>F.U(inFrame(o,B,f));
  const bottle=(x,y,z)=>union(cylZ(.52*s,-2.3*s,-.3*s,.2*s),roundCone([0,0,-.4*s],[0,0,.15*s],.48*s,.24*s))(x,y-.1*s,z);
  const head=(x,y,z)=>{const Y=y-.1*s;return Math.min(box(.3*s,.62*s,.3*s,.1*s)(x,Y-.25*s,z-.45*s),capsule([0,.35*s,.2*s],[0,.45*s,-.35*s],.13*s)(x,Y,z));};
  const mat=custom('kunststoff','#5aa4c8',(x,y,z,n)=>{const g=glint(n)?1.4:1;return z<-.75*s&&z>-1.75*s?{k:g,ramp:R('#e880a8')}:{k:g};},{spec:.7,shine:30});
  return [{f:L(bottle),mat,layer,group:'spray',tex:F.U(inFrame(o,B,LOC))},{f:L(head),mat:plastic('#eeeae0'),layer,group:'sprühkopf'}];},

 // ================= Klo-Kevin =================
 /** Flaschenkiste als Rucksack: Kunststoffrahmen mit Fenstern, 3 × 2 Flaschen (grün/braun) mit Etikett und Kronkorken, Gurte. */
 kiste(k,F,{color='#3a3f40',caps='#d8782a',layer='beiwerk'}={}){const {s,hipZ}=k,r0=k.root[2],zc=r0+hipZ+4.3*s,hx=2.0*s,hy=1.4*s,hz=2.0*s;
  const back=surfU(k,F,[0,0,zc],[0,-1,0])[1],c=[0,back-(.66*s+hy),zc],Lc=f=>F.U((x,y,z)=>f(x-c[0],y-c[1],z-c[2]));
  const crate=(X,Y,Z)=>{let d=box(hx,hy,hz,.22*s)(X,Y,Z);d=Math.max(d,-box(hx-.24*s,hy-.24*s,hz)(X,Y,Z-.45*s));
   d=Math.max(d,-box((hx-.55*s)/2,hy+1,.72*s,.15*s)(Math.abs(X)-(hx+.1*s)/2,Y,Z+.05*s));               // zwei Fenster vorn/hinten (Mittelsteg)
   d=Math.max(d,-box(hx+1,hy-.45*s,.72*s,.15*s)(X,Y,Z+.05*s));                                          // Fenster an den Seiten
   d=Math.max(d,-box(.8*s,hy+1,.3*s,.25*s)(X,Y,Z-(hz-.62*s)));                                           // Griffloch oben
   return d;};
  // Flaschen 3 × 2 über die nächste Zelle (grün und braun im Wechsel, Farbe über das Material)
  const cell=(X,Y,f)=>{const gx=clamp(Math.round(X/(1.2*s)),-1,1),gy=Y<0?-.5:.5;return f(X-gx*1.2*s,Y-gy*1.3*s);};
  const parity=(X,Y)=>(clamp(Math.round(X/(1.2*s)),-1,1)+(Y<0?0:1)+2)&1;
  const bottle=(X,Y,Z)=>cell(X,Y,(x,y)=>Math.min(cylZ(.48*s,-hz+.45*s,.9*s,.12*s)(x,y,Z),roundCone([0,0,.9*s],[0,0,1.7*s],.46*s,.2*s)(x,y,Z),cylZ(.2*s,1.5*s,hz+1.15*s,.05*s)(x,y,Z)));
  const labelF=(X,Y,Z)=>cell(X,Y,(x,y)=>cylZ(.51*s,-.9*s,.2*s,.04*s)(x,y,Z));
  const capF=(X,Y,Z)=>cell(X,Y,(x,y)=>cylZ(.28*s,hz+1.08*s,hz+1.32*s,.06*s)(x,y,Z));
  const glassMat=custom('glas','#3f6a3a',(X,Y,Z,n)=>({k:glint(n)?1.8:1,ramp:parity(X,Y)?R('#6a4a1e'):R('#3f6a3a')}),{spec:1.1,shine:60,glass:true});
  const labelMat=custom('papier','#e8dcc0',(X,Y,Z)=>Math.abs(Z+.35*s)<.14*s?{k:1,ramp:R('#b8302a')}:{k:1},{spec:.05,shine:4});
  return [{f:Lc(crate),mat:custom('kunststoff',color,(X,Y,Z,n)=>({k:(n&&Math.abs(n[2])<.6&&((Z+hz)/(.5*s))%1<.18?.8:1)*(.94+.1*fbm3(X,Y,Z,2))}),{spec:.35,shine:22}),layer,group:'kiste',tex:Lc(LOC)},
   {f:Lc(bottle),mat:glassMat,layer,group:'flaschen',tex:Lc(LOC)},
   {f:Lc(labelF),mat:labelMat,layer,group:'flaschen',tex:Lc(LOC)},{f:Lc(capF),mat:shiny(caps),layer,group:'flaschen'},
   ...straps(k,F,{color:'#2e2a26',off:.66,x:.5,width:.38,layer,down:3.4,zBuckle:4.7})];},

 /** Pümpel (Saugglocke) in der Hand, über die Schulter gelegt: Holzstiel, rote Gummiglocke nach hinten oben. */
 puempel(k,F,{hand='l',wood:wc='#c89a5c',cup='#a22a24',layer='beiwerk'}={}){const {s}=k,a=k.arms[hand],sd=hand==='r'?1:-1;
  const tgt=posed(k,[sd*(k.sw+1.0*s),-2.6*s,k.root[2]+k.shoulderZ+4.2*s]),h=a.hand,raised=h[2]>a.elbow[2];
  const d=raised?unit(sub(tgt,h)):unit(a.dir),B=basis(d,[1,0,0]);
  const stick=inFrame(h,B,(x,y,z)=>capsule([0,0,-1.3*s],[0,0,5.4*s],.28*s)(x,y,z));
  const bell=inFrame(h,B,(x,y,z)=>{const outer=roundCone([0,0,5.2*s],[0,0,6.3*s],.42*s,1.22*s)(x,y,z),inner=roundCone([0,0,5.7*s],[0,0,6.75*s],.2*s,.98*s)(x,y,z);return Math.max(outer,-inner);});
  return [{f:stick,mat:wood(wc,{axis:'z'}),layer,group:'stiel',tex:inFrame(h,B,LOC)},{f:bell,mat:rubber(cup),layer,group:'glocke'}];},

 /** Werkzeuggürtel: zwei Ledertaschen, Schraubendreher, Maulschlüssel, Rolle Panzertape. */
 werkzeug(k,F,{z=1.6,layer='beiwerk'}={}){const {s,hipZ}=k,r0=k.root[2],zb=r0+hipZ+z*s;
  const pouch=(side,a)=>{const {o,B}=onTorso(k,F,{z:zb,a,side,off:.55});
   return {o,B,f:F.U(inFrame(o,B,(x,y,z)=>box(.62*s,.36*s,.78*s,.14*s)(x,y-.32*s,z+.72*s))),flap:F.U(inFrame(o,B,(x,y,z)=>box(.68*s,.42*s,.18*s,.08*s)(x,y-.34*s,z+.02*s)))};};
  const pr=pouch(1,72),pl=pouch(-1,70);
  const driver=F.U(inFrame(pr.o,pr.B,(x,y,z)=>capsule([.2*s,.3*s,.1*s],[.42*s,.34*s,1.25*s],.22*s)(x,y,z)));
  const wrench=F.U(inFrame(add(pl.o,mul(pl.B[0],-.95*s)),pl.B,(x,y,z)=>{const bar=box(.16*s,.08*s,.9*s,.05*s)(x,y-.1*s,z+1.1*s);
   const jaw=Math.max(Math.hypot(x,z+2.15*s)-.42*s,-(Math.hypot(x,z+2.25*s)-.2*s),-Math.max(Math.abs(x)-.16*s,-(z+2.3*s)),Math.abs(y-.1*s)-.08*s);
   const eye=Math.max(Math.abs(Math.hypot(x,z)-.28*s)-.1*s,Math.abs(y-.1*s)-.08*s);return Math.min(bar,jaw,eye);}));
  const {o:to,B:tB}=onTorso(k,F,{z:zb-.2*s,a:150,side:1,off:.5});
  const tape=F.U(inFrame(to,tB,(x,y,z)=>Math.max(Math.abs(Math.hypot(x,z+.45*s)-.42*s)-.2*s,Math.abs(y-.25*s)-.22*s)));
  return [{f:union(pr.f,pl.f),mat:leather('#8a5a32'),layer,group:'taschen'},{f:union(pr.flap,pl.flap),mat:leather('#5e3a22'),layer,group:'klappen'},
   {f:driver,mat:custom('kunststoff','#d8a020',(u,v,w,n)=>({k:glint(n)?1.35:1}),{spec:.5,shine:26}),layer,group:'werkzeug'},
   {f:wrench,mat:shiny('#b4b8bc'),layer,group:'werkzeug'},{f:tape,mat:shiny('#9ea2a4',{spec:.5,shine:20}),layer,group:'tape'}];},

 /** Schutzbrille: zwei runde Gläser mit Gummiband, auf Stirn oder Mütze geschoben (Höhe z im Kopf-Rahmen). */
 schutzbrille(k,F,{z=1.85,y=2.1,band='#2a2826',lens='#d0903a',layer='beiwerk'}={}){const hs=k.b.head*k.s;
  const lensF=x=>(X,Y,Z)=>cylY(.46*hs,-.2*hs,.24*hs,.12*hs)(X-x,Y-y*hs,Z-z*hs);
  const rims=(X,Y,Z)=>Math.min(...[.72,-.72].map(x=>Math.max(Math.abs(Math.hypot(X-x*hs,Z-z*hs)-.48*hs)-.13*hs,Math.abs(Y-y*hs+.05*hs)-.22*hs)));
  const strap=(X,Y,Z)=>Math.max(Math.abs(Math.hypot(X/1.02,Y+.05*hs)-2.42*hs)-.14*hs,Math.abs(Z-z*hs+.05*hs)-.2*hs,Y-y*hs+.3*hs);
  return [{f:F.H(union(lensF(.72*hs),lensF(-.72*hs))),mat:glassShine(lens),layer,group:'brille'},{f:F.H(union(rims,strap)),mat:rubber(band),layer,group:'brille'}];},

 // ================= Stammgäste (E-61): Racing Ron, Nyalol, Hotfix-Olli =================
 /** Brille auf der Nase (Kopf-Rahmen, im geneigten Entwurfsrahmen von face.mjs): kind 'pilot' = Pilotensonnenbrille (Tropfengläser,
  *  Doppelsteg, Goldfassung) | 'eckig' = eckige Fassung ohne Tönung. Die Gläser tragen die Lesbarkeit, die Fassung ist Beiwerk. */
 brille(k,F,{kind='pilot',frame,lens,layer='beiwerk'}={}){const h=k.b.head*k.s,pilot=kind==='pilot';
  frame=frame||(pilot?'#b89a5a':'#1e1c20');lens=lens===undefined?(pilot?'#2a2a36':'#b4cadc'):lens;
  const S=f=>F.H((x,y,z)=>{const [a,b,c]=tilt(x/h,y/h,z/h);return f(a,b,c)*h;});
  const Y0=2.66,Z0=FZ+.02,yp=x=>Y0-.16*x*x;// Glasebene folgt der Gesichtsrundung
  const slab=(y,x,t)=>Math.abs(y-yp(x))-t;
  let glas,rand;
  if(pilot){// Tropfenform: oben flach, unten außen bauchig
   const e2=(x,z)=>{const X=Math.abs(x)-.86-.16*Math.max(0,-(z-Z0)),Z=z-Z0;return (Math.hypot(X/.64,Z/(Z<0?.6:.38))-1)*.42;};
   glas=(x,y,z)=>Math.max(e2(x,z),slab(y,x,.08));
   rand=(x,y,z)=>{const e=e2(x,z);return Math.min(Math.max(Math.abs(e)-.045,slab(y,x,.09)),
    capsule([-.46,Y0-.02,Z0+.36],[.46,Y0-.02,Z0+.36],.08)(x,y,z),capsule([-.3,Y0+.02,Z0+.1],[.3,Y0+.02,Z0+.1],.07)(x,y,z),
    capsule([-1.45,yp(1.45),Z0+.28],[-2.28,.2,Z0+.2],.08)(x,y,z),capsule([1.45,yp(1.45),Z0+.28],[2.28,.2,Z0+.2],.08)(x,y,z));};}
  else{// Eckige Fassung: kräftiger Rahmen, damit sie in Spielgröße als Brille liest
   const bx=(x,z,hx,hz,r)=>{const qx=Math.abs(Math.abs(x)-.84)-hx+r,qz=Math.abs(z-Z0+.02)-hz+r;return Math.min(Math.max(qx,qz),0)+Math.hypot(Math.max(qx,0),Math.max(qz,0))-r;};
   glas=(x,y,z)=>Math.max(bx(x,z,.46,.3,.08),slab(y,x,.03));
   rand=(x,y,z)=>Math.min(Math.max(bx(x,z,.6,.44,.12),-bx(x,z,.43,.27,.06),slab(y,x,.1)),
    capsule([-.4,Y0+.02,Z0+.14],[.4,Y0+.02,Z0+.14],.09)(x,y,z),
    capsule([-1.44,yp(1.44),Z0+.2],[-2.28,.2,Z0+.16],.09)(x,y,z),capsule([1.44,yp(1.44),Z0+.2],[2.28,.2,Z0+.16],.09)(x,y,z));}
  const out=[{f:S(rand),mat:pilot?shiny(frame,{spec:1,shine:40}):plastic(frame),layer,group:'brille'}];
  // Gläser ohne Glas-Fresnel (der hellt schräge Flächen weiß auf): getönt = dunkle, flache Rampe (liest in Spielgröße als Sonnenbrille);
  // klar = helles Blaugrau mit Lichtpunkt, weil eine dunkle Fassung allein mit den Augen verschmilzt
  if(lens)out.push({f:S(glas),mat:custom('glas',lens,(u,v,w,n)=>({k:glint(n,-.8,-.4)?1.2:1}),pilot?{spec:.25,shine:50,ramp:rampFrom(lens,{deep:.5,hi:.18})}:{spec:.6,shine:40}),layer,group:'brille'});
  return out;},

 /** Abnehmbares Sportlenkrad locker in der Hand, am Kranz gegriffen: schwarzer Lederkranz, drei silberne Speichen, Nabe mit Hupenknopf,
  *  rote 12-Uhr-Markierung. Ø ≈ 35 cm ≈ 4,6 E. Radebene senkrecht, um `dreh` Grad aus der Körperseite nach vorn gedreht; `marke` =
  *  Winkel der Markierung von der Griffstelle nach vorn. Hängt die Hand tief (Sitzen), liegt das Rad flach auf dem Oberschenkel. */
 lenkrad(k,F,{hand='l',leder='#2a2624',metall='#c8ccd0',rot='#cc2e26',knopf='#222022',dreh=72,marke=55,layer='beiwerk'}={}){
  const {s}=k,a=k.arms[hand],sd=hand==='r'?1:-1,Rw=2.3*s,tr=.4*s,low=a.hand[2]<6*s;
  const r=dreh*Math.PI/180,ez=low?unit([sd*.25,.1,1]):unit([sd*Math.cos(r),Math.sin(r),0]),ex=low?unit(cross([0,1,0],ez)):[0,0,1],ey=cross(ez,ex);
  const c=low?add(a.hand,mul(ex,-Rw*.9)):add(a.hand,[0,0,-Rw+.05*s]),m0=-sd*marke*Math.PI/180;
  const L=f=>inFrame(c,[ex,ey,ez],f),ang=(X,Y)=>{let d=Math.atan2(Y,X)-m0;d-=2*Math.PI*Math.round(d/(2*Math.PI));return d;};
  // Kranz leicht oval im Querschnitt (flacher zur Radebene), Griffmulden als Relief über das Material
  const rim=(X,Y,Z)=>{const q=Math.hypot(X,Y)-Rw;return Math.hypot(q,Z*1.25)-tr;};
  const mark=(X,Y,Z)=>Math.max(Math.hypot(Math.hypot(X,Y)-Rw,Z*1.25)-tr-.05*s,Math.abs(ang(X,Y))*Rw-.42*s);
  const spoke=phi=>{const c1=Math.cos(phi),s1=Math.sin(phi);return (X,Y,Z)=>{const Xr=c1*X+s1*Y,Yr=-s1*X+c1*Y,t=clamp(Xr/Rw,0,1);
   return box((Rw-.4*s)/2,(.44-.16*t)*s,.13*s,.06*s)(Xr-(Rw+.4*s)/2,Yr,Z+.12*s);};};
  const spokes=union(spoke(m0+Math.PI/2),spoke(m0-Math.PI/2),spoke(m0+Math.PI));
  const hub=(X,Y,Z)=>cylZ(.78*s,-.42*s,.2*s,.12*s)(X,Y,Z),horn=(X,Y,Z)=>cylZ(.56*s,.12*s,.36*s,.14*s)(X,Y,Z);
  const lederM=custom('leder',leder,(X,Y,Z,n)=>({k:(glint(n,-.9,-.3)?1.35:1)*(.9+.12*fbm3(X*1.4,Y*1.4,Z*1.4,2))}),{spec:.35,shine:20});
  const tex=L(LOC);
  return [{f:L(rim),mat:lederM,layer,group:'kranz',tex},{f:L(mark),mat:custom('leder',rot,()=>({k:1.05}),{spec:.3,shine:18}),layer,group:'kranz',tex},
   {f:L(union(spokes,hub)),mat:shiny(metall,{spec:1,shine:40}),layer,group:'speichen',tex},{f:L(horn),mat:plastic(knopf),layer,group:'nabe',tex}];},

 /** Over-Ear-Headset um den Hals: zwei Muscheln liegen auf dem Kragen (Außenring leuchtet grün), Bügel im Nacken, Mikrofonarm auf der
  *  Seite `mic` schwenkt nach vorn oben, grüner Schaumkopf. Im Oberkörper-Rahmen, folgt Neigung und Drehung. */
 headset(k,F,{color='#1e1e24',accent=['#3d4a3f','#55704a','#849451','#bac475','#cace9c'],mic=-1,layer='beiwerk'}={}){const {s}=k,r0=k.root[2],zc=r0+k.shoulderZ+1.55*s;
  // Muscheln liegen vorn auf dem Kragen, Außenseite schräg nach vorn oben (zur Kamera) – groß genug für Spielgröße (Ø ≈ 2,4 E)
  const cups=[-1,1].map(sd=>{const c=[sd*1.8*s,.95*s,zc],n=unit([sd*.5,.55,.68]);return {sd,c,B:basis(n,[0,0,1])};});
  const cupF=union(...cups.map(({c,B})=>inFrame(c,B,(x,y,z)=>cylZ(1.2*s,-.5*s,.4*s,.26*s)(x,y,z))));
  const ringF=union(...cups.map(({c,B})=>inFrame(c,B,(x,y,z)=>torusZ(.74*s,.2*s)(x,y,z-.38*s))));
  const band=tube([add(cups[0].c,[-.1*s,-.9*s,.3*s]),[-1.75*s,-1.6*s,zc+.7*s],[0,-2.25*s,zc+.9*s],[1.75*s,-1.6*s,zc+.7*s],add(cups[1].c,[.1*s,-.9*s,.3*s])],.28*s,4);
  const mc=cups.find(q=>q.sd===mic)||cups[0],p0=add(mc.c,[-mic*.2*s,.8*s,.25*s]),end=[mic*.8*s,2.7*s,zc+.35*s];
  const arm=tube([p0,[mic*1.45*s,2.2*s,zc+.35*s],end],.2*s,4),tip=at(...end,sphere(.4*s));
  const neon=glow(accent);
  return [{f:F.U(union(cupF,band.f,arm.f)),mat:custom('kunststoff',color,(u,v,w,n)=>({k:glint(n,-.9,-.3)?1.5:1}),{spec:.6,shine:28}),layer,group:'headset',tex:F.U(LOC)},
   {f:F.U(ringF),mat:neon,glow:.8,layer,group:'headset-ring'},{f:F.U(tip),mat:custom('schaum','#26262c',(u,v,w)=>({k:.9+.2*fbm3(u*3,v*3,w*3,2)}),{spec:.05,shine:4}),layer,group:'mikro',tex:F.U(LOC)}];},

 /** Aufgeklappter silberner Laptop auf dem Unterarm, Bildschirm zeigt nach vorn (Olli pitcht): Tastatur und Touchpad auf der Grundplatte,
  *  Deckel an der Kante zum Körper um `offen` Grad aufgeklappt, leuchtender Bildschirm mit Balkendiagramm (selbstleuchtend, bläulich). */
 laptop(k,F,{hand='l',color='#c4c8cc',tasten='#34363a',offen=104,layer='beiwerk'}={}){const {s}=k,a=k.arms[hand];
  const fw=unit([a.dir[0],a.dir[1],0]),ez=[0,0,1],ex=cross(fw,ez),B=[ex,fw,ez];
  const W=2.3*s,Dp=1.6*s,T=.14*s,Lh=1.55*s,Lt=.1*s,o=add(add(a.wrist,mul(fw,.2*s)),[0,0,.72*s]),L=f=>inFrame(o,B,f);
  const an=(offen-90)*Math.PI/180,u=[0,-Math.sin(an),Math.cos(an)],nL=[0,Math.cos(an),Math.sin(an)],hy=-Dp+.05*s;
  const lidC=(X,Y,Z)=>{const y=Y-hy,z=Z-T;return [X,y*nL[1]+z*nL[2],y*u[1]+z*u[2]];};// [quer, Normale (Bildschirmseite +), entlang Deckel]
  const base=(X,Y,Z)=>box(W,Dp,T,.07*s)(X,Y,Z);
  const lid=(X,Y,Z)=>{const [x,p,q]=lidC(X,Y,Z);return box(W,Lt,Lh,.07*s)(x,p-Lt,q-Lh);};
  const scr=(X,Y,Z)=>{const [x,p,q]=lidC(X,Y,Z);return box(W-.2*s,.04*s,Lh-.2*s,.03*s)(x,p-2*Lt,q-Lh-.04*s);};
  const kb=Dp*.2;// Tastatur zwischen Scharnier und Touchpad
  const body=custom('metall',color,(X,Y,Z,n)=>{const g=glint(n)?1.35:1;
   if(Z>T-.03*s&&n&&n[2]>.5){if(Math.abs(X)<W-.32*s&&Y>-Dp+.3*s&&Y<kb){const fx=((X/(.42*s))%1+1)%1,fy=(((Y-(-Dp))/(.4*s))%1+1)%1;return fx<.74&&fy<.72?{k:1.05,ramp:R(tasten)}:{k:.62,ramp:R(tasten)};}
    if(Math.abs(X)<.75*s&&Y>kb+.2*s&&Y<Dp-.2*s)return {k:.9*g};}
   return {k:g*(.95+.08*fbm3(X*.6,Y*.6,Z*.6,2))};},{spec:.8,shine:32});
  const lcd=glow(['#142038','#223c68','#34609c','#5a8ccc','#9cc8f0']),bars=[[-1.45,.55],[-.75,.95],[-.05,1.3],[.65,1.75]];
  const glowF=(X,Y,Z)=>{const [x,p,q]=lidC(X,Y,Z),U=x/s,V=q/s;if(V>2.45&&V<2.7&&U>-1.6&&U<.6)return .78;
   for(const [b0,hh] of bars)if(U>b0&&U<b0+.5&&V>.45&&V<.45+hh)return b0>.5?.95:.82;return .42+.05*Math.sin(V*9);};
  return [{f:L(base),mat:body,layer,group:'laptop',tex:L(LOC)},{f:L(lid),mat:body,layer,group:'deckel',tex:L(LOC)},
   {f:L(scr),mat:lcd,glow:(X,Y,Z)=>glowF(X,Y,Z),layer,group:'bildschirm',tex:L(LOC)}];},

 /** Kaffeebecher zum Mitnehmen in der Hand (aufrecht): weißer Pappbecher, braune Manschette, Deckel mit Trinköffnung. */
 kaffeebecher(k,F,{hand='r',color='#f2efe8',manschette='#8a5630',deckel='#e8e4dc',layer='beiwerk'}={}){const {s}=k,o=add(k.arms[hand].hand,[0,.14*s,.3*s]),H=1.2*s;
  const rz=z=>.5*s+.2*s*clamp((z+H)/(2*H),0,1);
  const cup=at(...o,(x,y,z)=>Math.max(Math.hypot(x,y)-rz(z),Math.abs(z)-H)*.95);
  const sleeve=at(...o,(x,y,z)=>Math.max(Math.hypot(x,y)-rz(z)-.07*s,Math.abs(z+.05*s)-.5*s)*.95);
  const lid=at(...o,(x,y,z)=>Math.min(cylZ(.78*s,H-.04*s,H+.24*s,.1*s)(x,y,z),cylZ(.6*s,H+.18*s,H+.44*s,.14*s)(x,y,z)));
  const tex=(x,y,z)=>[x-o[0],y-o[1],z-o[2]];
  return [{f:cup,mat:custom('papier',color,(x,y,z,n)=>({k:glint(n)?1.25:1}),{spec:.2,shine:12}),layer,group:'becher',tex},
   {f:sleeve,mat:custom('papier',manschette,(x,y,z)=>({k:Math.hypot(Math.atan2(x,y)-.4,z/(.35*s))<.5&&y>0?1.35:1}),{spec:.05,shine:6}),layer,group:'manschette',tex},
   {f:lid,mat:plastic(deckel),layer,group:'deckel',tex}];},
};
