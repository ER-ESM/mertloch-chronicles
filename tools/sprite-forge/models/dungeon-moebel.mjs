// Sprite-Schmiede · Gruppe „dungeon-moebel“: Requisiten für die Räume des Dungeons „Schloss Big B“ (Doppelgarage mit Keller eines
// Hochstaplers, der sich „Freiherr“ nennt; Leitidee „Schild und Wirklichkeit“). Werkbank, Reifenstapel, Heizkessel, Schaukelpferd,
// Waschmaschine, Greenscreen, Ringlicht, Palettensofa, Zimmerpflanze, Musikbox, Weinfass, Tetrapak-Kiste, Bierkisten-Thron, Pappkulisse.
// Koordinaten: Standfläche mittig um (0,0), x Ost, y Süd (Vorderkante bei +h/2), z ab Boden, Einheit E (4 px je E). Maße aus content/sprite-kit.js.
// Einzige Bildfolge: die Musikbox (Licht = Grund für Bewegung, Anti-Slop-Regel 9). Keine Schrift: Aufdrucke und Bemalung sind Farbfelder.
import {block,box,cylZ,capsule,roundCone,ellipsoid,torusZ,at,rotX,rotY,rotZ,union,smoothUnion,subtract,
 mirrorX,mirrorY,repeatX,repeatY,fbm3,noise3,hash3,clamp,smoothstep} from '../sdf.mjs';
import {wood,metal,fabric,ceramic,glass,paper,plastic,leather,hair,glow,custom,rampFrom,hex} from '../materials.mjs';

const PI=Math.PI,TAU=PI*2;
const frac=v=>v-Math.floor(v);

// ---------- Hilfsformen ----------
/** Quader mit Mittelpunkt und Halbmaßen. */
const hb=(cx,cy,cz,hx,hy,hz,r=0)=>at(cx,cy,cz,box(hx,hy,hz,r));
/** Quader über Eckpunkte. */
const boxAt=(x0,x1,y0,y1,z0,z1,r=0)=>at((x0+x1)/2,(y0+y1)/2,(z0+z1)/2,box((x1-x0)/2,(y1-y0)/2,(z1-z0)/2,r));
/** Waagerechter Zylinder entlang x von x0 bis x1 (Achse bei y,z = 0). */
const cylX=(rad,x0,x1,r=0)=>rotY(PI/2,cylZ(rad,x0,x1,r));
/** Waagerechter Zylinder entlang y von y0 bis y1 (Achse bei x,z = 0). */
const cylY=(rad,y0,y1,r=0)=>rotX(PI/2,cylZ(rad,-y1,-y0,r));
/** Ring in der x-z-Ebene (Achse y): Bullauge, Ringlicht, Handrad. */
const torusY=(R,r)=>rotX(PI/2,torusZ(R,r));
/** Kegelstumpf um die z-Achse: Radius r0 bei z0, r1 bei z1. */
const taper=(r0,r1,z0,z1,rr=0)=>(x,y,z)=>{const k=(r1-r0)/(z1-z0),r=r0+k*clamp(z-z0,0,z1-z0),c=1/Math.hypot(1,k);
 const dr=(Math.hypot(x,y)-r+rr)*c,dz=Math.abs(z-(z0+z1)/2)-(z1-z0)/2+rr;return Math.min(Math.max(dr,dz),0)+Math.hypot(Math.max(dr,0),Math.max(dz,0))-rr;};
/** Balken als gedrehter Quader von a nach b: Halbbreite hw (waagerecht quer), Halbhöhe hh. */
function beam(a,b,hw,hh,r=.15){const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(...d),u=d.map(v=>v/L);
 let s=[u[1],-u[0],0];const sl=Math.hypot(...s)||1;s=s.map(v=>v/sl);const w=[s[1]*u[2]-s[2]*u[1],s[2]*u[0]-s[0]*u[2],s[0]*u[1]-s[1]*u[0]];
 const c=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],q=box(L/2,hw,hh,r);
 return (x,y,z)=>{const px=x-c[0],py=y-c[1],pz=z-c[2];return q(px*u[0]+py*u[1]+pz*u[2],px*s[0]+py*s[1]+pz*s[2],px*w[0]+py*w[1]+pz*w[2]);};}
/** Kette aus Kapseln durch die Punkte (Schläuche, Mähne, Stiele). */
const chain=(pts,r)=>union(...pts.slice(1).map((p,i)=>capsule(pts[i],p,r)));
/** Hüllkugel [cx,cy,cz,r] eines Punktfelds (für s.b im Renderer). */
function bound(pts,pad){const c=[0,0,0];for(const p of pts)for(let k=0;k<3;k++)c[k]+=p[k]/pts.length;
 let r=0;for(const p of pts)r=Math.max(r,Math.hypot(p[0]-c[0],p[1]-c[1],p[2]-c[2]));return [...c,r+pad];}
/** 2D-Abstand zu einer Strecke. */
const seg2=(px,pz,ax,az,bx,bz)=>{const ex=bx-ax,ez=bz-az,h=clamp(((px-ax)*ex+(pz-az)*ez)/(ex*ex+ez*ez),0,1);return Math.hypot(px-ax-ex*h,pz-az-ez*h);};
/** 2D-Rechteck (Mitte, Halbmaße) als Abstand. */
const rect2=(px,pz,cx,cz,hx,hz)=>{const qx=Math.abs(px-cx)-hx,qz=Math.abs(pz-cz)-hz;return Math.hypot(Math.max(qx,0),Math.max(qz,0))+Math.min(Math.max(qx,qz),0);};
/** Ebenes Profil d2(x,z) entlang y zwischen y0 und y1 hochziehen (Musikbox, Kulisse). */
const extY=(d2,y0,y1,r=0)=>(x,y,z)=>{const a=d2(x,z)+r,b=Math.abs(y-(y0+y1)/2)-(y1-y0)/2+r;return Math.min(Math.max(a,b),0)+Math.hypot(Math.max(a,0),Math.max(b,0))-r;};

// ---------- Materialien ----------
const RAMPS=new Map();const R=c=>{let r=RAMPS.get(c);if(!r)RAMPS.set(c,r=rampFrom(c));return r;};
/** Gemalte oder bedruckte Fläche: fn(u,v,w,n) → Farbe oder [Farbe, Helligkeit]. Leichte Körnung. */
const painted=(name,fn,{grain=.08,spec=.03,shine=4,freq=.9}={})=>custom(name,'#808080',(u,v,w,n)=>{const z=fn(u,v,w,n),[c,k=1]=Array.isArray(z)?z:[z];
 return {k:k*(1-grain/2+grain*fbm3(u*freq,v*freq,w*freq,2)),ramp:R(c)};},{spec,shine});
/** Eigene Farbtreppe aus Palettentönen (dunkel → hell): Grün kippt sonst im Schatten ins Oliv-Braun. */
const rampOf=list=>list.map(hex);
const GREEN=rampOf(['#263530','#2d423c','#3d5446','#55704a','#6d824e','#849451','#9fac63']);
const RUST=rampFrom('#8e5a2e');
/** Fugen hinter bündigen Blechen und Schubladen: sehr dunkel, damit der Umriss als Linie steht. */
const GAP=custom('fuge','#2a2026',()=>({k:.5}),{spec:0,shine:1});
const chrome=metal('#c4c8cc',{shine:40,spec:.9}),darkIron=metal('#34333a',{rust:.3,shine:16,spec:.3});
const brass=metal('#b08a3a',{shine:30,spec:.7}),gold=metal('#c8962e',{shine:32,spec:.75}),blackPl=plastic('#2c2a35');
const glowRamp=stops=>glow(stops);
/** Wellpappe (roh) und Kreppband – Kulisse, Pappsäule. */
const CARD='#b69a6c',cardboard=custom('pappe',CARD,(u,v,w)=>({k:.9+.14*fbm3(u*.6,v*.6,w*.6,2)}),{spec:.03,shine:4});
const TAPE=custom('kreppband','#e4cc92',(u,v,w)=>({k:.95+.1*fbm3(u*2,v*2,w*.5,2)}),{spec:.05,shine:4});

// ---------- Bausteine ----------
/** Autoreifen (liegend, Mitte im Ursprung): Innenradius ri, außen ro, halbe Breite hh, Schulterrundung rr. */
const tireF=(ri,ro,hh,rr)=>(x,y,z)=>{const q=Math.hypot(x,y),dx=Math.abs(q-(ri+ro)/2)-(ro-ri)/2+rr,dz=Math.abs(z)-hh+rr;
 return Math.min(Math.max(dx,dz),0)+Math.hypot(Math.max(dx,0),Math.max(dz,0))-rr;};
/** Lage mit Kippung: Welt → Teilkoordinaten (erst um y, dann um x gekippt). Dient auch als Textur-Koordinate. */
const place=(cx,cy,cz,ty=0,tx=0)=>{const cY=Math.cos(ty),sY=Math.sin(ty),cX=Math.cos(tx),sX=Math.sin(tx);
 return (x,y,z)=>{const X=x-cx,Y=y-cy,Z=z-cz,x1=cY*X-sY*Z,z1=sY*X+cY*Z;return [x1,cX*Y+sX*z1,-sX*Y+cX*z1];};};
/** Drehung um die Einheitsachse k um den Winkel th (Rodrigues) – für umgeknickte Pappecken. */
const rodr=(k,th)=>{const c=Math.cos(th),s=Math.sin(th);return v=>{const d=k[0]*v[0]+k[1]*v[1]+k[2]*v[2],x=[k[1]*v[2]-k[2]*v[1],k[2]*v[0]-k[0]*v[2],k[0]*v[1]-k[1]*v[0]];return v.map((q,i)=>q*c+x[i]*s+k[i]*d*(1-c));};};
const posed=(P,f)=>(x,y,z)=>{const [a,b,c]=P(x,y,z);return f(a,b,c);};
/** Blattlage zum Betrachter hin: Blattebene steht senkrecht auf N0 (Blickrichtung, leicht nach oben), beta dreht die Rippe in dieser Ebene. */
const N0=[0,.75,.66].map(v=>v/Math.hypot(.75,.66)),E2=[0,-N0[2],N0[1]];
function faceFrame(beta,twist=0){const cb=Math.cos(beta),sb=Math.sin(beta),d=[cb,E2[1]*sb,E2[2]*sb];
 const t0=[N0[1]*d[2]-N0[2]*d[1],N0[2]*d[0]-N0[0]*d[2],N0[0]*d[1]-N0[1]*d[0]],c=Math.cos(twist),s=Math.sin(twist);
 return {d,t:t0.map((v,k)=>v*c+N0[k]*s),n:N0.map((v,k)=>v*c-t0[k]*s)};}
const inFrame=(o,F)=>(x,y,z)=>{const px=x-o[0],py=y-o[1],pz=z-o[2];
 return [px*F.d[0]+py*F.d[1]+pz*F.d[2],px*F.t[0]+py*F.t[1]+pz*F.t[2],px*F.n[0]+py*F.n[1]+pz*F.n[2]];};
/** Monstera-Blatt in Blattkoordinaten (s entlang der Rippe ab Stielansatz, t quer, w Normale): Herzform mit Schlitzen. */
function monsteraLeaf(L,W){const a=L/2,b=W/2;
 return (s,t,w)=>{let d=(Math.hypot((s-a)/a,t/b)-1)*Math.min(a,b)*.9;
  d=Math.max(d,-(Math.hypot(s+.15,t)-.5));
  for(const k of [.3,.52,.74])for(const sg of [-1,1]){const sk=L*k;d=Math.max(d,-(seg2(s,t,sk-.25,sg*b*.3,sk+.5,sg*b*1.1)-.23));}
  return Math.max(d,Math.abs(w-.1*t*t/b)-.13);};}

export const MODELS={
 // ---------------------------------------------------------------- Werkbank 36×12, Höhe 16 (Garage)
 // Buchenplatte auf Kantholzbeinen, Schraubstock an der linken vorderen Ecke (von der Seite gesehen: Backen, Spindel, Knebel),
 // Hammer und Maulschlüssel rechts obenauf, die Mitte bleibt frei für Tischdeko. Unten: roter Werkzeugkasten, zwei Farbdosen.
 werkbank:{height:16,build(){const Z=16,T0=14.2;
  const top=wood('#b08050',{axis:'x',planks:1.8,worn:.8}),leg=wood('#7a5a3a',{axis:'z',worn:.8}),rail=wood('#86603a',{axis:'x',worn:.8});
  const shelf=wood('#6f5234',{axis:'x',planks:2.6,worn:1}),front=wood('#9a6c40',{axis:'x'});
  const viseBlue=metal('#3c5968',{rust:.2,shine:22,spec:.45}),steel=metal('#8a8f94',{shine:30,spec:.6}),headSteel=metal('#4e4d4d',{shine:24,spec:.5});
  const handleWood=wood('#c8965a',{axis:'x'}),toolRed=metal('#b74724',{rust:.12,shine:24,spec:.45}),tin=metal('#a4a8aa',{rust:.1,shine:28,spec:.55});
  const VX=-13.4,VY=2.4;
  const hd=[.891,.453],hp=[-hd[1],hd[0]],HC=[9.4,.4];
  const wd=[.895,-.447],wA=[-6.3,1.0],wB=[-1.5,-1.4],wAng=Math.atan2(wd[1],wd[0]);
  return {solids:[
   {f:boxAt(-17.6,17.6,-5.5,5.5,T0,Z,.25),mat:top,group:'platte'},
   {f:mirrorX(mirrorY(at(15.9,4.2,0,block(.8,.8,0,T0,.15)))),mat:leg,group:'beine'},
   {f:mirrorY(boxAt(-15.1,15.1,3.8,4.7,12.2,T0,.12)),mat:rail,group:'zarge'},
   {f:mirrorX(boxAt(15.3,16.5,-3.4,3.4,12.2,T0,.12)),mat:rail,group:'zarge'},
   // Schublade in der vorderen Zarge, dunkle Fuge dahinter
   {f:boxAt(2.7,13.3,4.55,4.85,12.25,14.15),mat:GAP,group:'fuge'},
   {f:boxAt(2.95,13.05,4.6,5.15,12.5,13.9,.15),mat:front,group:'lade'},
   {f:capsule([6.9,5.45,13.2],[9.1,5.45,13.2],.3),mat:steel,group:'griff'},
   // Unterboden
   {f:boxAt(-15.1,15.1,-3.6,3.6,3,3.7,.1),mat:shelf,group:'boden'},
   {f:mirrorX(boxAt(15.3,16.5,-3.4,3.4,2.8,3.8,.1)),mat:rail,group:'boden'},
   {f:boxAt(-12.8,-5.6,-2.6,2.2,3.7,7.2,.3),mat:toolRed,group:'kasten',b:[-9.2,-.2,5.5,5]},
   {f:boxAt(-12.9,-5.5,-2.7,2.3,6.2,6.55,.1),mat:darkIron,group:'kastennaht',b:[-9.2,-.2,6.4,4.8]},
   {f:union(capsule([-10.9,-.2,8.1],[-7.5,-.2,8.1],.3),capsule([-10.9,-.2,7.1],[-10.9,-.2,8.1],.22),capsule([-7.5,-.2,7.1],[-7.5,-.2,8.1],.22)),mat:darkIron,group:'kastengriff',b:[-9.2,-.2,7.7,2.4]},
   {f:union(hb(-11,2.35,6.4,.4,.2,.5,.1),hb(-7.4,2.35,6.4,.4,.2,.5,.1)),mat:chrome,group:'verschluss',b:[-9.2,2.35,6.4,2.4]},
   {f:union(at(7.6,.4,0,cylZ(1.7,3.7,7.3,.2)),at(11.5,-1,0,cylZ(1.45,3.7,6.6,.2))),mat:tin,group:'dosen',b:[9.5,-.3,5.5,4.6]},
   {f:at(7.6,.4,0,cylZ(1.76,4.6,6.5)),mat:paper('#dd7434'),group:'etikett1',b:[7.6,.4,5.5,2.3]},
   {f:at(11.5,-1,0,cylZ(1.51,4.3,5.9)),mat:paper('#4c6976'),group:'etikett2',b:[11.5,-1,5.1,2]},
   // Schraubstock, längs zur Bank: feste Backe rechts, bewegliche links, Spindel mit Knebel nach außen
   {f:hb(VX,VY,Z+.3,2.5,1.5,.3,.12),mat:viseBlue,group:'sst-fuss',b:[VX,VY,Z+.3,3]},
   {f:boxAt(VX+.35,VX+2.5,VY-1.25,VY+1.25,Z+.5,Z+4.1,.3),mat:viseBlue,group:'backe-fest',b:[VX+1.4,VY,Z+2.3,3]},
   {f:boxAt(VX-2.3,VX-.35,VY-1.25,VY+1.25,Z+1.1,Z+4.1,.3),mat:viseBlue,group:'backe-los',b:[VX-1.3,VY,Z+2.6,2.8]},
   {f:boxAt(VX-2.3,VX+.5,VY-.65,VY+.65,Z+.55,Z+1.5,.15),mat:steel,group:'fuehrung',b:[VX-.9,VY,Z+1,2]},
   {f:union(boxAt(VX+.1,VX+.4,VY-1.3,VY+1.3,Z+2.9,Z+4.2,.05),boxAt(VX-.4,VX-.1,VY-1.3,VY+1.3,Z+2.9,Z+4.2,.05)),mat:steel,group:'backenplatten',b:[VX,VY,Z+3.5,2]},
   {f:at(0,VY,Z+2.1,cylX(.36,VX-3.7,VX-2.2,.1)),mat:steel,group:'spindel',b:[VX-3,VY,Z+2.1,1.3]},
   {f:union(capsule([VX-3.55,VY,Z+.6],[VX-3.55,VY,Z+3.7],.25),at(VX-3.55,VY,Z+.55,ellipsoid(.42,.42,.42)),at(VX-3.55,VY,Z+3.75,ellipsoid(.42,.42,.42))),mat:steel,group:'knebel',b:[VX-3.55,VY,Z+2.15,2.2]},
   // Hammer: Stiel schräg, Kopf quer
   {f:capsule([HC[0]-hd[0]*6.2,HC[1]-hd[1]*6.2,Z+.4],[HC[0],HC[1],Z+.4],.4),mat:handleWood,group:'hammerstiel',b:[HC[0]-hd[0]*3.1,HC[1]-hd[1]*3.1,Z+.4,3.6]},
   {f:beam([HC[0]+hp[0]*1.6+hd[0]*.2,HC[1]+hp[1]*1.6+hd[1]*.2,Z+.55],[HC[0]-hp[0]*1.4+hd[0]*.2,HC[1]-hp[1]*1.4+hd[1]*.2,Z+.55],.55,.55,.12),mat:headSteel,group:'hammerkopf',b:[HC[0],HC[1],Z+.55,2.2]},
   // Maulschlüssel: Schaft, offenes Maul, Ring
   {f:union(beam([wA[0],wA[1],Z+.16],[wB[0],wB[1],Z+.16],.42,.16,.08),
     subtract(at(wA[0]-wd[0]*.6,wA[1]-wd[1]*.6,Z+.18,cylZ(1.05,-.18,.18,.06)),at(wA[0]-wd[0]*1.25,wA[1]-wd[1]*1.25,Z+.18,rotZ(wAng,box(.9,.42,1)))),
     at(wB[0]+wd[0]*.55,wB[1]+wd[1]*.55,Z+.22,torusZ(.72,.24))),mat:chrome,group:'schluessel',b:[-3.9,-.2,Z+.3,4.4]},
  ]};}},

 // ---------------------------------------------------------------- Reifenstapel 14×14, Höhe 18
 // Vier Winterreifen ohne Felge, der oberste versetzt und leicht gekippt. Profil als Textur (Längsrillen, V-Lamellen),
 // Staub auf den Deckflächen, Händler-Aufkleber am zweiten Reifen als Farbpunkt.
 reifenstapel:{height:18,build(){const RI=2.9,RO=5.6,HH=2.12;
  const LABEL=R('#ecd59b'),LABEL_RED=R('#b24d32');
  const tireMat=(seed,dust,label)=>custom('gummi','#2b2a2e',(u,v,w,n)=>{const q=Math.hypot(u,v),a=Math.atan2(v,u);let k=.95+.1*fbm3(u*.6+seed,v*.6,w*.6,2);
   if(q>RO-.55){const s=a*RO,cz=Math.abs(w);
    if(label&&a>1.2&&a<1.9&&cz<1)return {k:1.05,ramp:cz<.28?LABEL_RED:LABEL,spec:.05};
    if(Math.abs(cz-.8)<.2)k*=.5;else if(frac((s+cz*.9)/1.25)<.3)k*=.55;}
   else if(q<RI+.5)k*=.6;
   else if(Math.abs(q-(RO-1.35))<.15)k*=.78;
   if(n&&n[2]>.6)k*=1+.4*dust*fbm3(u*.4,v*.4,seed,3);
   return {k};},{spec:.22,shine:12});
  const stack=[[.25,.3,0,0,0,.2],[-.35,-.2,4.24,0,.02,.6],[.3,.15,8.48,0,-.02,.3],[.95,.45,12.8,.07,.035,1]];
  return {solids:stack.map(([cx,cy,z0,ty,tx,dust],i)=>{const P=place(cx,cy,z0+HH,ty,tx);
   return {f:posed(P,tireF(RI,RO,HH,.8)),tex:P,mat:tireMat(i*7.1,dust,i===1),group:'reifen'+i,b:[cx,cy,z0+HH,RO+.6]};})};}},

 // ---------------------------------------------------------------- Heizkessel 18×16, Höhe 30 (Heizungskeller)
 // Alter Öl-Heizkessel: cremeweiße Emaille mit Rost an den Kanten, Brenner vorn, rotes Flammen-Schauglas in der Kesseltür,
 // Manometer und Regler in der Blende, oben Abgasrohr und zwei Kupferrohre mit rotem Handrad, alle zur Wand abgewinkelt.
 heizkessel:{height:30,build(){const B=5;
  const enamel=custom('emaille','#e4dcc3',(u,v,w)=>{const n=fbm3(u*.3+5,v*.3,w*.3,4),g=fbm3(u*1.2,v*1.2,w*1.2,2),edge=(w<3.4?.16:0)+.12*smoothstep(5.8,7,Math.abs(u));
   if(n+edge>.74)return {k:.9+.2*g,ramp:RUST,spec:.05};return {k:.96+.06*g};},{spec:.45,shine:28});
  const burner=metal('#4c6976',{rust:.1,shine:24,spec:.5}),galv=metal('#9aa3a6',{rust:.12,shine:26,spec:.55}),copper=metal('#b0683a',{rust:.05,shine:30,spec:.6});
  const gauge=painted('skala',(u,v,w)=>{const r=Math.hypot(u,w),a=Math.atan2(u,w);
   if(r<.22)return '#2c2a35';if(seg2(u,w,0,0,-.62,.72)<.13)return '#2c2a35';
   if(r>.82&&r<1.08&&a>.55&&a<1.6)return '#b24d32';if(r>.9&&r<1.12&&frac(a/.5)<.2)return '#2c2a35';return '#f8f0d5';},{grain:.03});
  const ember=glowRamp(['#5a1a0c','#a3341a','#e0662a','#f7a64a','#ffe08a']);
  const FX=3.2,FY=-3.8;// Abgasrohr
  const elbow=(x,y0,z0,Rb,r,yEnd)=>{const cy=y0-Rb;return union(at(x,y0,0,cylZ(r,23,z0,.1)),
   (px,py,pz)=>Math.max(Math.hypot(Math.hypot(py-cy,pz-z0)-Rb,px-x)-r,cy-py,z0-pz),at(x,0,z0+Rb,cylY(r,yEnd,cy,.1)));};
  return {solids:[
   {f:boxAt(-6.6,6.6,-6.8,4.6,0,1.3,.2),mat:darkIron,group:'sockel'},
   {f:boxAt(-7,7,-7.2,B,1.2,22.4,1.0),mat:enamel,group:'korpus'},
   {f:boxAt(-7.2,7.2,-7.4,B+.2,22.2,23.3,.5),mat:enamel,group:'deckel'},
   {f:boxAt(-6.5,6.5,B-.2,B+.25,1.9,21.9),mat:GAP,group:'fuge'},
   {f:boxAt(-6.25,6.25,B-.1,B+.45,2.15,13.95,.35),mat:enamel,group:'tuer'},
   {f:boxAt(-6.25,6.25,B-.1,B+.45,14.35,21.65,.35),mat:enamel,group:'blende'},
   // Brenner vor der Kesseltür mit Motor obenauf, Ölschlauch zum Boden
   {f:at(-2,0,8.2,cylY(2.3,B+.4,B+2.5,.5)),mat:burner,group:'brenner',b:[-2,B+1.5,8.2,3.2]},
   {f:at(-2,0,8.2,cylY(1.5,B+2.3,B+2.8,.3)),mat:darkIron,group:'brennerdeckel',b:[-2,B+2.6,8.2,2]},
   {f:at(0,B+1.4,10.9,cylX(1.05,-3.6,-.5,.35)),mat:burner,group:'motor',b:[-2,B+1.4,10.9,2.3]},
   {f:chain([[-3.2,B+1.6,6.2],[-3.9,B+1.9,3.6],[-5,B+1.7,1.1],[-6.9,B+1,.4],[-8.1,B-1,.4]],.36),mat:blackPl,group:'schlauch',b:[-5.5,B+.5,3,5.5]},
   // Schauglas: klein, rot glühend, Messingring
   {f:at(3.9,0,9.4,cylY(.62,B+.3,B+.62)),mat:ember,glow:.38,group:'schauglas',noShadow:true,b:[3.9,B+.5,9.4,.9]},
   {f:at(3.9,B+.55,9.4,torusY(.72,.24)),mat:brass,group:'schauring',b:[3.9,B+.55,9.4,1.1]},
   // Blende: Manometer, Regler, Kontrolllampe, Typenschild
   {f:at(-3.2,0,18.4,cylY(1.28,B+.35,B+.7)),mat:gauge,tex:(x,y,z)=>[x+3.2,y,z-18.4],group:'manometer',b:[-3.2,B+.5,18.4,1.5]},
   {f:at(-3.2,B+.72,18.4,torusY(1.34,.28)),mat:chrome,group:'manometerring',b:[-3.2,B+.72,18.4,1.8]},
   {f:at(2.4,0,18.4,cylY(1.1,B+.35,B+1.05,.3)),mat:blackPl,group:'regler',b:[2.4,B+.7,18.4,1.4]},
   {f:hb(2.4,B+1.1,19.1,.14,.08,.55),mat:paper('#f8f0d5'),group:'reglerstrich',b:[2.4,B+1.1,19.1,.7]},
   {f:at(5,B+.55,18.4,ellipsoid(.45,.35,.45)),mat:glowRamp(['#2d423c','#55704a','#849451','#9fac63','#e4e8c0']),glow:.72,group:'lampe',b:[5,B+.55,18.4,.6]},
   {f:boxAt(-1.7,1.7,B+.4,B+.55,15.3,16.4,.08),mat:chrome,group:'schild',b:[0,B+.5,15.85,2]},
   // Rohre: Abgasrohr (verzinkt) und Vor-/Rücklauf (Kupfer), alle zur Wand hin abgewinkelt
   {f:at(FX,FY,0,cylZ(2.35,23,24.2,.3)),mat:galv,group:'manschette',b:[FX,FY,23.6,2.6]},
   {f:elbow(FX,FY,30.6,2.6,1.9,-8),mat:galv,group:'abgasrohr',b:[FX,FY-2,29,7.5]},
   {f:elbow(-5,-2.6,30.8,1.3,.62,-8),mat:copper,group:'vorlauf',b:[-5,-4.5,27,7]},
   {f:elbow(-2.7,-3.4,31.4,1.3,.62,-8),mat:copper,group:'ruecklauf',b:[-2.7,-5,27.5,7]},
   {f:at(-5,-2.6,0,cylZ(.95,26.4,27.8,.25)),mat:brass,group:'ventil',b:[-5,-2.6,27.1,1.3]},
   {f:union(at(-5,-1.2,27.1,torusY(.95,.24)),capsule([-5,-2.2,27.1],[-5,-1.2,27.1],.2),capsule([-5.9,-1.2,27.1],[-4.1,-1.2,27.1],.16),capsule([-5,-1.2,26.2],[-5,-1.2,28],.16)),mat:plastic('#b24d32'),group:'handrad',b:[-5,-1.5,27.1,1.4]},
  ]};}},

 // ---------------------------------------------------------------- Schaukelpferd 20×8, Höhe 16, daneben ein Hafersack
 // Spielzeug aus Holz: bemalter Apfelschimmel auf Kufen, rotes Sattelchen, Wollmähne, Griffholz durch den Kopf. Keine Augen.
 schaukelpferd:{height:16,build(){const XC=-2.6,XS=7.0;
  const runner=sy=>(x,y,z)=>{const dx=x-XC,rr=Math.hypot(dx,z-20)-19.5;return Math.max(Math.abs(rr)-.5,Math.abs(y-sy)-.42,Math.abs(dx)-6.9);};
  const kufe=wood('#8d5a34',{axis:'x',worn:.6}),board=wood('#a67047',{axis:'y'});
  const body=at(XC,0,9,ellipsoid(4.3,1.85,2.1));
  const neck=roundCone([XC-2.6,0,10.1],[XC-4.3,0,13.4],1.45,1.05);
  const H0=[XC-4.3,0,14.1],H1=[XC-6.3,0,12.4],hl=Math.hypot(H1[0]-H0[0],H1[2]-H0[2]),hdir=[(H1[0]-H0[0])/hl,0,(H1[2]-H0[2])/hl];
  const head=roundCone(H0,H1,1.15,.82);
  const legs=union(...[[-1,-1],[-1,1],[1,-1],[1,1]].map(([sx,sy])=>roundCone([XC+sx*3.4,sy*1.8,1.2],[XC+sx*2.5,sy*.95,8],.55,.75)));
  const horse=smoothUnion(.7,body,neck,head,legs);
  const DAP={base:'#e0dbc2',ring:'#a9a999',leg:'#757975',hoof:'#2c2a35',muzzle:'#656868',strap:'#b24d32'};
  const horseMat=painted('pferd',(u,v,w)=>{
   if(w<2.3)return DAP.hoof;
   const s=((u-H0[0])*hdir[0]+(w-H0[2])*hdir[2])/hl;
   if(w>11&&s>.52&&s<.64)return DAP.strap;
   if(w>11&&s>.78)return DAP.muzzle;
   if(w<5.4)return w<3.2?DAP.leg:[DAP.ring,1];
   const n=noise3(u*.95+3,v*.95,w*.95);if(n>.44&&n<.53)return DAP.ring;return DAP.base;},{grain:.05});
  const saddle=(x,y,z)=>{const d=body(x,y,z);return Math.max(d-.38,-d,Math.abs(x-(XC+.4))-1.8,9.8-z);};
  const cloth=(x,y,z)=>{const d=body(x,y,z);return Math.max(d-.22,-d,Math.abs(x-(XC+.4))-2.4,8.3-z);};
  const lump=(f,a,fr)=>(x,y,z)=>(f(x,y,z)-a*(fbm3(x*fr,y*fr,z*fr,2)-.45))*.8;
  const mane=lump(union(chain([[XC-3.7,.35,15.0],[XC-3.0,.45,13.9],[XC-2.2,.5,12.5],[XC-1.5,.45,11.3]],.52),at(XC-4.75,.25,15.05,ellipsoid(.42,.4,.36))),.3,1.7);
  const tail=lump(chain([[XC+4.1,0,10.1],[XC+4.8,.2,8.6],[XC+5,.3,6.6]],.62),.4,1.8);
  const sack=lump(smoothUnion(.9,at(XS,0,0,cylZ(2.15,0,4.4,1.3)),at(XS,.1,4.7,ellipsoid(1.9,1.7,1.55)),roundCone([XS,.1,5.4],[XS+.1,.2,6.6],1.15,.7),at(XS+.1,.2,6.95,ellipsoid(1.15,.95,.55))),.35,.9);
  const burlap=custom('sackleinen','#b19a61',(u,v,w)=>{const k=.9+.14*fbm3(u*.7,v*.7,w*.7,3);if(w>2.5&&w<3.1)return {k,ramp:R('#a6422b')};return {k:k*(.95+.05*Math.sin(u*9)*Math.sin((v+w)*9))};},{spec:.03,shine:4});
  return {solids:[
   {f:union(runner(-1.8),runner(1.8)),mat:kufe,group:'kufen'},
   // Runde Querstäbe an den Kufenenden (statt Brettern: die liegen in der Schrägsicht wie Klötze)
   {f:union(...[-6,6].map(dx=>{const z=20-Math.sqrt(361-dx*dx)+.25;return capsule([XC+dx,-2.2,z],[XC+dx,2.2,z],.36);})),mat:board,group:'querstab'},
   {f:horse,mat:horseMat,group:'pferd',b:[XC-1,0,8,10]},
   {f:cloth,mat:fabric('#3c5968',{fuzz:.08}),group:'schabracke',b:[XC+.4,0,10,4]},
   {f:saddle,mat:leather('#b74724'),group:'sattel',b:[XC+.4,0,10.4,3.4]},
   {f:union(at(XC-1.2,0,11.5,ellipsoid(.55,1.1,.6)),at(XC+2,0,11.7,ellipsoid(.6,1.3,.75))),mat:leather('#b74724'),group:'sattelwulst',b:[XC+.4,0,11.6,2.6]},
   {f:mane,mat:hair('#3d3530',{axis:'z'}),group:'maehne',b:[XC-3,.35,13.2,3.6]},
   {f:tail,mat:hair('#3d3530',{axis:'z'}),group:'schweif',b:[XC+4.6,.15,8.4,3]},
   {f:union(roundCone([XC-4.45,-.5,14.9],[XC-4.25,-.55,16],.36,.12),roundCone([XC-4.45,.5,14.9],[XC-4.25,.55,16],.36,.12)),mat:horseMat,group:'ohren',b:[XC-4.35,0,15.4,1.3]},
   {f:union(capsule([XC-4.6,-1.95,13.6],[XC-4.6,1.95,13.6],.34),at(XC-4.6,-2.05,13.6,ellipsoid(.45,.35,.45)),at(XC-4.6,2.05,13.6,ellipsoid(.45,.35,.45))),mat:wood('#c8965a',{axis:'y'}),group:'griffholz',b:[XC-4.6,0,13.6,2.6]},
   {f:capsule([XC-1.3,-2.05,8.1],[XC-1.3,2.05,8.1],.3),mat:wood('#c8965a',{axis:'y'}),group:'fussholz',b:[XC-1.3,0,8.1,2.4]},
   // Hafersack: Sackleinen mit rotem Streifen, oben zugebunden, Tragriemen, etwas Hafer davor
   {f:sack,mat:burlap,group:'sack',b:[XS,0,3.7,4.6]},
   {f:at(XS+.05,.12,6.05,torusZ(1.0,.22)),mat:fabric('#6c625d',{fuzz:.05}),group:'kordel',b:[XS,.1,6.05,1.3]},
   {f:chain([[XS+.5,.95,6.4],[XS+1.5,1.75,4.7],[XS+1.9,1.55,2.4]],.27),mat:leather('#5a3a22'),group:'riemen',b:[XS+1.3,1.3,4.4,2.6]},
   {f:(x,y,z)=>at(XS-2.4,1.7,0,ellipsoid(1.4,.95,.45))(x,y,z)-.12*(noise3(x*3,y*3,z*3)-.5),mat:custom('hafer','#d3a856',(u,v,w)=>({k:.85+.3*noise3(u*4,v*4,w*4)}),{spec:.05,shine:4}),group:'hafer',b:[XS-2.4,1.7,.2,1.6]},
  ]};}},

 // ---------------------------------------------------------------- Waschmaschine 12×12, Höhe 16
 // Weißer Frontlader: Bedienblende mit Einspülkasten, Programmwahlknopf und Anzeige, Bullauge mit bunter Wäsche hinter dem Glas.
 waschmaschine:{height:16,build(){const B=4.9,DZ=7.1;
  const white=custom('lack','#e0dbc2',(u,v,w)=>({k:.97+.05*fbm3(u*.4,v*.4,w*.4,2)-(w<2?.05:0)}),{spec:.5,shine:30});
  const LAUND=[R('#4c6976'),R('#a6422b'),R('#d1ceb9'),R('#d3a856')];
  const port=custom('glas','#2c3846',(u,v,w,n)=>{const X=u,Z=w-DZ;
   if(n&&n[1]>.3&&X*.7+Z>.9&&X*.7+Z<1.8)return {k:1.6,ramp:R('#d9d7c2'),spec:1};
   const c=fbm3(X*.5+2,Z*.5,1.3,3);return {k:.62+.12*fbm3(X,Z,2,2),ramp:LAUND[c<.36?0:c<.46?1:c<.54?2:3]};},{spec:1,shine:60,glass:true});
  return {solids:[
   {f:mirrorX(mirrorY(at(4.5,4.2,0,cylZ(.55,0,.9,.15)))),mat:blackPl,group:'fuesse'},
   {f:boxAt(-5.5,5.5,-5.6,B,.8,15.1,.55),mat:white,group:'korpus'},
   {f:boxAt(-5.65,5.65,-5.75,B+.15,15.0,15.9,.35),mat:white,group:'deckel'},
   {f:boxAt(-5.55,5.55,B-.2,B+.12,11.85,12.2),mat:GAP,group:'fuge'},
   {f:boxAt(-5.5,5.5,B-.1,B+.25,12.2,14.95,.2),mat:white,group:'blende'},
   {f:boxAt(-5.0,-1.8,B+.2,B+.6,12.6,14.5,.2),mat:white,group:'einspuel'},
   {f:boxAt(-4.3,-2.5,B+.5,B+.66,12.75,13.15),mat:GAP,group:'griffmulde'},
   {f:at(2.6,0,13.55,cylY(1.02,B+.2,B+.9,.28)),mat:chrome,group:'knopf',b:[2.6,B+.55,13.55,1.3]},
   {f:boxAt(-1.2,.9,B+.2,B+.34,13.1,14.1),mat:plastic('#2c3846'),group:'anzeige'},
   {f:boxAt(-.9,-.05,B+.3,B+.38,13.4,13.8),mat:glowRamp(['#2d423c','#55704a','#849451','#9fac63','#e4e8c0']),glow:.75,group:'ziffern'},
   {f:union(at(4.6,B+.3,13.1,ellipsoid(.36,.25,.3)),at(4.6,B+.3,14.1,ellipsoid(.36,.25,.3))),mat:plastic('#a9a999'),group:'tasten',b:[4.6,B+.3,13.6,1]},
   // Bullauge: dunkle Fuge, Türring, gewölbtes Glas, Griff rechts
   {f:at(0,B-.2,DZ,torusY(3.55,.95)),mat:GAP,group:'tuerfuge',b:[0,B,DZ,4.6]},
   {f:at(0,B+.45,DZ,torusY(3.4,.62)),mat:plastic('#b9b8a4'),group:'tuer',b:[0,B+.45,DZ,4.1]},
   {f:at(0,B+.3,DZ,ellipsoid(2.95,.75,2.95)),mat:port,group:'glas',b:[0,B+.3,DZ,3.1]},
   {f:hb(3.95,B+.8,DZ,.45,.35,1.15,.2),mat:plastic('#b9b8a4'),group:'tuergriff',b:[3.95,B+.8,DZ,1.4]},
   // Obendrauf: gefaltete Handtücher und eine Waschmittelflasche (sonst bleibt der große Deckel leer)
   {f:boxAt(-4.6,-.6,-4.2,-.6,15.9,16.6,.3),mat:fabric('#627f83',{weave:2,fuzz:.1}),group:'tuch1',b:[-2.6,-2.4,16.25,3]},
   {f:boxAt(-4.3,-.9,-3.9,-.9,16.6,17.25,.3),mat:fabric('#d17a55',{weave:2,fuzz:.1}),group:'tuch2',b:[-2.6,-2.4,16.9,2.6]},
   {f:union(boxAt(1.8,4.2,-3.9,-2.3,15.9,18.9,.55),capsule([3.2,-3.1,18.9],[3.9,-3.1,18.2],.3)),mat:plastic('#dd7434'),group:'flasche',b:[3,-3.1,17.4,2.4]},
   {f:at(2.4,-3.1,0,cylZ(.5,18.8,19.5,.12)),mat:plastic('#e4dcc3'),group:'flaschendeckel',b:[2.4,-3.1,19.1,.9]},
   {f:boxAt(1.95,4.05,-2.34,-2.2,16.6,18.1,.1),mat:paper('#e4dcc3'),group:'flaschenetikett',b:[3,-2.3,17.3,1.6]},
   {f:boxAt(-5.1,-2,B-.1,B+.1,1.1,3.1),mat:GAP,group:'klappenfuge'},
   {f:boxAt(-4.9,-2.2,B,B+.25,1.3,2.9,.15),mat:white,group:'klappe'},
  ]};}},

 // ---------------------------------------------------------------- Greenscreen 44×6, Höhe 34
 // Zwei Lampenstative mit Querstange, grünes Tuch mit orangen Klemmen, hängt zwischen den Klemmen durch, liegt unten auf.
 greenscreen:{height:34,build(){const SX=19.8;
  const topZ=x=>33.0-1.0*Math.abs(Math.sin(PI*(x+18)/9));
  const foldY=(x,z)=>{const a=.42+.2*(1-z/33);return -.35+a*(.62*Math.sin(x*1.396+.2)+.38*Math.sin(x*.61+1.7+z*.05));};
  const cloth=(x,y,z)=>Math.max((Math.abs(y-foldY(x,z))-.16)*.72,Math.abs(x)-18.6,(z-topZ(x))*.9,.3-z);
  const pool=(x,y,z)=>{const front=1.9+.35*Math.sin(x*.7+.5)+.2*Math.sin(x*1.9),top=.42+.12*Math.sin(x*1.3+y*1.1);
   return Math.max(Math.abs(x)-18.7,(y-front)*.8,-.9-y,(z-top)*.85,-z);};
  // Chroma-Grün so hell, wie die Palette erlaubt: eigene Treppe eine Stufe höher als GREEN
  const SCREEN=rampOf(['#2d423c','#3d5446','#55704a','#6d824e','#849451','#95a069','#9fac63']);
  const screen=custom('stoff','#6d824e',(u,v,w)=>({k:1.22+.08*(fbm3(u*.35,v*.35,w*.06,3)-.4)+.03*Math.sin(u*7)*Math.sin(w*7),ramp:SCREEN}),{spec:.05,shine:6});
  const stand=sx=>{const m=Math.sign(sx),feet=[[sx+m*1.25,2.3],[sx+m*1.25,-2.3],[sx-m*2.2,-1.6]];
   return [
    {f:union(...feet.map(([fx,fy])=>capsule([sx,0,6.6],[fx,fy,.3],.3))),mat:darkIron,group:'beine'+m,b:[sx,0,3.4,4.6]},
    {f:union(...feet.map(([fx,fy])=>at(fx,fy,.25,ellipsoid(.42,.42,.28)))),mat:blackPl,group:'fuesse'+m,b:[sx,0,.3,3.6]},
    {f:union(at(sx,0,0,cylZ(.44,.6,18.4)),at(sx,0,0,cylZ(.34,18,33.6)),at(sx,0,0,cylZ(.75,5.9,7.3,.2))),mat:darkIron,group:'stange'+m,b:[sx,0,17,17.2]},
    {f:union(at(sx,0,0,cylZ(.64,17.6,18.7,.15)),at(sx,.72,18.15,ellipsoid(.35,.45,.35)),at(sx,0,0,cylZ(.6,33.1,34.7,.15))),mat:blackPl,group:'klemme'+m,b:[sx,0,26,9]},
   ];};
  return {solids:[
   ...stand(-SX),...stand(SX),
   {f:at(0,0,33.9,cylX(.36,-SX,SX)),mat:darkIron,group:'querstange'},
   {f:union(...[-18,-9,0,9,18].map(cx=>hb(cx,.1,33.2,.42,.62,.8,.2))),mat:plastic('#dd7434'),group:'klammern'},
   {f:cloth,mat:screen,group:'tuch'},
   {f:pool,mat:screen,group:'tuch'},
  ]};}},

 // ---------------------------------------------------------------- Ringlicht 10×10, Höhe 30
 // Dreibeinstativ, Ring mit schwarzem Gehäuse und hellweiß leuchtendem Diffusor, in der Mitte ein Handy im Halter (Bildschirm an).
 ringlicht:{height:30,build(){const RC=25.4,RR=3.5;
  const ringSec=(Rr,hr,y0,y1,rr)=>(x,y,z)=>{const q=Math.hypot(x,z)-Rr,dq=Math.abs(q)-hr+rr,dy=Math.abs(y-(y0+y1)/2)-(y1-y0)/2+rr;
   return Math.min(Math.max(dq,dy),0)+Math.hypot(Math.max(dq,0),Math.max(dy,0))-rr;};
  const white=glowRamp(['#8e9e94','#c2c1ad','#e4dcc3','#f8f0d5','#fff2d6']);
  const feet=[[0,-4.2],[3.64,2.1],[-3.64,2.1]];
  return {solids:[
   {f:at(0,0,RC,ringSec(RR,.84,-.95,.15,.3)),mat:blackPl,group:'gehaeuse',b:[0,0,RC,4.6]},
   {f:at(0,0,RC,ringSec(RR,.62,.05,.5,.25)),mat:white,glow:(u,v,w)=>.97-.3*Math.abs(Math.hypot(u,w-RC)-RR)/.62,group:'ring',noShadow:true,b:[0,.3,RC,4.3]},
   {f:boxAt(-.6,.6,-.7,.3,RC-RR-1.9,RC-RR-.55,.15),mat:blackPl,group:'kopf'},
   {f:union(at(0,-.2,0,cylZ(.46,.6,14.2)),at(0,-.2,0,cylZ(.33,13.8,RC-RR-1.7))),mat:darkIron,group:'stange'},
   {f:union(at(0,-.2,0,cylZ(.66,13.5,14.5,.15)),at(0,.55,14,ellipsoid(.34,.45,.34)),at(0,-.2,0,cylZ(.78,6.6,8,.2))),mat:blackPl,group:'klemmen'},
   {f:union(...feet.map(([fx,fy])=>capsule([0,-.2,7.2],[fx,fy,.35],.34))),mat:darkIron,group:'beine',b:[0,-.7,3.6,6.4]},
   {f:union(...feet.map(([fx,fy])=>at(fx,fy,.28,ellipsoid(.45,.45,.3)))),mat:blackPl,group:'fuesse',b:[0,-.7,.3,5.2]},
   // Handyhalter: Stab vom Ring nach oben, Klammer, Handy hochkant, Bildschirm zum Betrachter (Selbstaufnahme)
   {f:union(capsule([0,.2,RC-RR+.45],[0,.2,RC-1.3],.22),hb(0,.25,RC-1.3,1.02,.28,.28,.1)),mat:blackPl,group:'halter',b:[0,.2,RC-2.2,1.8]},
   {f:hb(0,.3,RC+.2,.82,.18,1.45,.25),mat:plastic('#2c3846'),group:'handy',b:[0,.3,RC+.2,1.8]},
   {f:hb(0,.49,RC+.2,.64,.03,1.25,.08),mat:glowRamp(['#1e2c35','#3c5968','#627f83','#8e9e94','#d9d7c2']),glow:.62,group:'bildschirm',b:[0,.49,RC+.2,1.5]},
  ],lights:[{p:[0,2.4,RC],r:10,k:.5,color:[1,.98,.92]}]};}},

 // ---------------------------------------------------------------- Palettensofa 36×14, Höhe 12
 // Zwei Lagen Europaletten (je zwei nebeneinander, Klötze und Durchfahröffnungen sichtbar), Matratze, drei Rückenkissen, zwei Zierkissen.
 palettensofa:{height:12,build(){const Y0=-5.9,Y1=5.6,LH=2.6;
  const board=wood('#c8a070',{axis:'x',worn:.9}),deck=wood('#d0a878',{axis:'x',worn:.9}),blockW=wood('#a8784a',{axis:'z',worn:1}),stringer=wood('#bd9468',{axis:'y',worn:.9});
  const core=custom('schatten','#2a2026',()=>({k:.45}),{spec:0,shine:1});
  const solids=[];
  for(const [x0,x1] of [[-17.4,-.1],[.1,17.4]])for(let l=0;l<2;l++){const z0=l*LH,cx=(x0+x1)/2,g=`p${x0}-${l}`,bx=[x0+1.25,cx,x1-1.25],by=[Y1-.75,(Y0+Y1)/2,Y0+.75];
   const bb=[cx,(Y0+Y1)/2,z0+1.3,Math.hypot((x1-x0)/2,(Y1-Y0)/2,1.3)+.3];
   solids.push(
    {f:union(...by.map(y=>boxAt(x0,x1,y-.75,y+.75,z0,z0+.45,.08))),mat:board,group:g+'b',b:bb},
    {f:union(...bx.flatMap(x=>by.map(y=>boxAt(x-1.25,x+1.25,y-.75,y+.75,z0+.45,z0+1.75,.1)))),mat:blockW,group:g+'k',b:bb},
    {f:union(...bx.map(x=>boxAt(x-1.25,x+1.25,Y0,Y1,z0+1.75,z0+2.15,.08))),mat:stringer,group:g+'q',b:bb},
    {f:union(...[[.72,.72],[3.2,.72],[5.75,1.05],[8.3,.72],[10.78,.72]].map(([o,hw])=>boxAt(x0,x1,Y0+o-hw,Y0+o+hw,z0+2.15,z0+2.6,.08))),mat:deck,group:g+'d',b:bb},
    {f:boxAt(x0+.4,x1-.4,Y0+1.6,Y1-1.6,z0,z0+2.15),mat:core,group:g+'s',b:bb});}
  const matt=custom('stoff','#67787d',(u,v,w)=>{const f=frac((u+17.2)/5.73);let k=.95+.08*fbm3(u*.5,v*.5,w*.5,2);if(f<.05||f>.95)k*=.7;return {k};},{spec:.04,shine:4});
  const pillow=(cx,col)=>({f:at(cx,-4.2,9.3,rotX(.3,smoothUnion(.6,box(5.2,.9,2.2,.9),ellipsoid(4.6,1.3,2)))),mat:fabric(col,{fuzz:.1}),group:'kissen'+cx,b:[cx,-4.2,9.3,6]});
  const stripes=custom('stoff','#627f83',(u,v,w)=>{const k=.95+.08*fbm3(u*.5,v*.5,w*.5,2);return frac(u/1.6)<.3?{k,ramp:R('#e4dcc3')}:{k};},{spec:.03,shine:4});
  return {solids:[...solids,
   {f:boxAt(-17.2,17.2,-5.7,5.3,5.2,7.7,1.1),mat:matt,group:'matratze'},
   pillow(-11.4,'#d3a856'),
   {...pillow(0,'#627f83'),mat:stripes},
   pillow(11.4,'#bd5935'),
   {f:at(-5.6,-2.4,9,rotX(.28,rotY(PI/4,box(1.9,.55,1.9,.6)))),mat:fabric('#a6422b',{fuzz:.1}),group:'zier1',b:[-5.6,-2.4,9,3]},
   {f:at(6.4,-2.3,8.9,rotX(.3,rotY(PI/4+.15,box(1.8,.55,1.8,.6)))),mat:fabric('#849451',{fuzz:.1}),group:'zier2',b:[6.4,-2.3,8.9,3]},
  ]};}},

 // ---------------------------------------------------------------- Zimmerpflanze 8×8, Höhe 18
 // Plastik-Monstera im weißen Topf mit Goldrand: sieben gleich geschnittene, makellos grüne Blätter mit Schlitzen,
 // am vorderen Stiel hängt noch das Preisschild (Schild und Wirklichkeit).
 zimmerpflanze:{height:18,build(){
  const leafMat=custom('kunststoff','#55704a',(u,v,w)=>({k:Math.abs(v)<.16?1.12:1,ramp:GREEN}),{spec:.55,shine:26});
  const stemMat=custom('kunststoff','#55704a',()=>({k:1.05,ramp:GREEN}),{spec:.4,shine:20});
  const D=PI/180;
  // Blätter als Fächer zum Betrachter (in 8 E Breite passen nur wenige große Blätter mit lesbaren Schlitzen):
  // Richtung der Mittelrippe in der Bildebene (90° = hoch), Drehung um die Rippe (Licht-/Schattenseite), Ansatz, Länge, Breite
  const leaves=[[75,-.2,-.4,-1.4,14.6,3.6,3.1],[92,.1,0,-.6,13.4,4.6,3.9],[138,.4,-.1,.1,11.7,4.2,3.5],[44,-.4,.1,-.1,12.1,4.2,3.5],
   [212,.35,-.1,1.1,9.8,3.5,3.0],[-28,-.35,.1,.9,10.2,3.5,3.0]];
  const solids=[];
  leaves.forEach(([beta,tw,x,y,z,L,W],i)=>{const o=[x,y,z],F=faceFrame(beta*D,tw),P=inFrame(o,F);
   const tip=[o[0]+F.d[0]*L,o[1]+F.d[1]*L,o[2]+F.d[2]*L];
   solids.push({f:posed(P,monsteraLeaf(L,W)),tex:P,mat:leafMat,group:'blatt'+i,b:[(o[0]+tip[0])/2,(o[1]+tip[1])/2,(o[2]+tip[2])/2,L/2+W/2]});
   const mid=[o[0]*.3,o[1]*.3,5.8+(z-5.8)*.5];
   solids.push({f:chain([[0,0,5.6],mid,o],.24),mat:stemMat,group:'stiel',b:bound([[0,0,5.6],mid,o],.4)});});
  return {solids:[...solids,
   {f:taper(2.25,2.8,0,5.7,.25),mat:ceramic('#ece5cc'),group:'topf'},
   {f:at(0,0,5.7,torusZ(2.78,.3)),mat:gold,group:'goldrand'},
   {f:cylZ(2.55,5.2,5.65),mat:custom('erde','#3d3530',(u,v,w)=>({k:.8+.3*noise3(u*2.5,v*2.5,w)}),{spec:.02,shine:2}),group:'erde'},
   {f:chain([[.5,1.6,8.4],[1.2,3.0,7.4]],.1),mat:paper('#e4dcc3'),group:'schnur',b:[.85,2.3,7.9,1.2]},
   {f:at(1.35,3.1,6.75,rotZ(-.3,box(.62,.07,.72,.06))),mat:painted('preisschild',(u,v,w)=>w<6.65&&w>6.4?'#b24d32':'#f8f0d5'),group:'preisschild',b:[1.35,3.1,6.75,1]},
  ]};}},

 // ---------------------------------------------------------------- Musikbox 14×10, Höhe 24 · Bildfolge 4 Bilder, 4 fps
 // Jukebox mit gewölbtem Oberteil: Nussbaum-Gehäuse, bunte Leuchtröhre im Bogen und an den Seiten (Helligkeitswelle läuft
 // sanft durch die Farbfelder), Fenster mit Platte, Titelleiste, Lautsprechergitter mit Goldrauten, Chromzier.
 musikbox:{height:24,frames:4,fps:4,build(t){const HW=6.3,ZS=16.2,Y0=-4.4,YF=2.8;
  const arch2=(x,z,hw,zs,z0)=>Math.min(rect2(x,z,0,(z0+zs)/2,hw,(zs-z0)/2),Math.max(Math.hypot(x,z-zs)-hw,z0-z));
  const walnut=wood('#6b4a2f',{axis:'z',worn:.6});
  const cabinet=subtract(extY((x,z)=>arch2(x,z,HW,ZS,0),Y0,YF,.35),extY((x,z)=>arch2(x,z,4.3,ZS,12.9),YF-1.2,YF+1));
  // Leuchtröhre: links hoch, Bogen, rechts runter – in Farbfelder geteilt
  const TR=5.35,Z0=2.2,YT=YF+.3,L1=ZS-Z0,L2=PI*TR,TOT=2*L1+L2,N=16;
  const pathAt=s=>{if(s<=L1)return [-TR,Z0+s];if(s<=L1+L2){const a=PI-(s-L1)/TR;return [TR*Math.cos(a),ZS+TR*Math.sin(a)];}return [TR,ZS-(s-L1-L2)];};
  const COLS=[['#5a1a0c','#953d32','#c3522b','#e57438','#f6c385'],['#6a4a14','#a97941','#e8ac5e','#f9c560','#fff2d6'],
   ['#2d423c','#55704a','#849451','#9fac63','#e4e8c0'],['#1e2c35','#3c5968','#627f83','#8e9e94','#d9e4e0']].map(glowRamp);
  const tubes=[];
  for(let i=0;i<N;i++){const s0=i*TOT/N,s1=(i+1)*TOT/N,n=Math.max(2,Math.ceil((s1-s0)/.9)),pts=[];
   for(let k=0;k<=n;k++){const [x,z]=pathAt(s0+(s1-s0)*k/n);pts.push([x,YT,z]);}
   tubes.push({f:chain(pts,.6),mat:COLS[i%4],glow:.6+.3*Math.cos(TAU*(t-i/8)),group:'roehre',noShadow:true,b:bound(pts,.8)});}
  const grille=painted('gitter',(u,v,w)=>{const a=frac((u+w)/2.3),b=frac((u-w)/2.3);return a<.16||b<.16?'#d3a856':'#2c2a35';},{grain:.04});
  const strip=painted('titelleiste',(u,v,w)=>{const cx=frac((u+4.2)/1.68),row=w>11.3;
   if(cx<.08||cx>.92||Math.abs(w-11.3)<.1)return '#3c3a44';return (w>(row?12.05:11.0))?(Math.floor((u+4.2)/1.68)%2?'#b24d32':'#4c6976'):'#f8f0d5';},{grain:.03});
  return {solids:[
   {f:cabinet,mat:walnut,group:'gehaeuse'},
   {f:extY((x,z)=>arch2(x,z,4.4,ZS,12.8),YF-1.35,YF-1.1),mat:fabric('#5d4b4d',{fuzz:.08}),group:'fenstergrund'},
   {f:at(0,0,16.6,cylY(2.5,YF-1.1,YF-.85,.08)),mat:custom('vinyl','#1e212e',(u,v,w)=>{const r=Math.hypot(u,w-16.6);return {k:Math.abs(r-1.7)<.12?1.8:1};},{spec:.6,shine:30}),group:'platte',b:[0,YF-1,16.6,2.7]},
   {f:at(0,0,16.6,cylY(.85,YF-.9,YF-.75)),mat:paper('#d3a856'),group:'plattenlabel',b:[0,YF-.8,16.6,1]},
   {f:capsule([3.1,YF-.6,19.2],[1.3,YF-.6,17.4],.2),mat:chrome,group:'tonarm',b:[2.2,YF-.6,18.3,1.6]},
   ...tubes,
   {f:at(0,YF+.25,11.3,rotX(.45,box(4.3,.3,1.05,.12))),mat:strip,group:'titel',b:[0,YF+.25,11.3,4.6]},
   {f:boxAt(-4.5,4.5,YF-.1,YF+.3,9.6,10.2,.1),mat:chrome,group:'tastenleiste'},
   {f:repeatX(.9,9,hb(0,YF+.42,9.9,.26,.2,.2,.08)),mat:plastic('#e4dcc3'),group:'tasten'},
   {f:boxAt(-4.5,4.5,YF-.1,YF+.2,2.3,9.3,.1),mat:grille,group:'gitter'},
   {f:capsule([0,YF+.55,2.9],[0,YF+.55,8.7],.34),mat:chrome,group:'zier'},
   {f:boxAt(-6.1,6.1,Y0+.2,YF+.3,0,1.4,.2),mat:wood('#4a3020',{axis:'x'}),group:'sockel'},
   {f:boxAt(-4.6,4.6,YF+.1,YF+.4,.35,1.1,.1),mat:chrome,group:'trittblech'},
   {f:at(0,YF-.4,ZS+HW,ellipsoid(1,.7,.75)),mat:gold,group:'krone',b:[0,YF-.4,ZS+HW,1.2]},
  ],lights:[{p:[0,6,12],r:10,k:.26+.06*Math.cos(TAU*t),color:[1,.62,.38]}]};}},

 // ---------------------------------------------------------------- Weinfass 18×12, Höhe 14
 // Liegendes Eichenfass, Boden zum Betrachter (Kimme, senkrechte Bodenbretter), vier Eisenreifen, Messing-Zapfhahn vorn,
 // auf zwei Lagerbalken mit ausgesägtem Sattel; am rechten Balkenende ein Zinnbecher.
 weinfass:{height:14,build(){const ZC=8.1,RB=5.6,RH=4.85,YC=-.35,HL=5.15;
  const rOf=y=>RH+(RB-RH)*(1-((y-YC)/HL)**2);
  const bodyF=(x,y,z)=>Math.max((Math.hypot(x,z-ZC)-rOf(clamp(y,YC-HL,YC+HL)))*.95,Math.abs(y-YC)-HL);
  const barrel=subtract(bodyF,at(0,YC+HL,ZC,cylY(RH-.4,-.45,1)),at(0,YC-HL,ZC,cylY(RH-.4,-1,.45)));
  const staves=custom('holz','#7a4a28',(u,v,w,n)=>{const X=u,Z=w-ZC,q=Math.hypot(X,Z);let k;
   if(n&&Math.abs(n[1])>.8&&q<RH-.3){const f=frac((X+RH)/2.05);k=.94+.12*fbm3(X*.12,Z*1.2,3,2);if(f<.07||f>.95)k*=.55;if(q>RH-1)k*=.86;
    // Eingebranntes Wappen des „Freiherrn“ (Schild mit Schrägbalken) – nur vorn
    const hw=Z>.9?1.55:1.55*(Z+.9)/1.8,sd=Math.max(Math.abs(X)-hw,Z-2.7,-.9-Z);
    if(n[1]>0&&sd<0&&(sd>-.32||Math.abs(X+(Z-.9)*.8)<.28))return {k:.9,ramp:BURN};}
   else{const a=Math.atan2(X,Z),f=frac(a*RB/1.9);k=.92+.14*fbm3(a*6,v*.25,q,2);if(f<.07||f>.94)k*=.6;}
   return {k};},{spec:.12,shine:8});
  const BURN=R('#3d3530');
  const hoop=yh=>(x,y,z)=>Math.max(Math.abs(Math.hypot(x,z-ZC)-rOf(yh)-.12)-.2,Math.abs(y-yh)-.32);
  const TY=YC+HL-.45,TZ=ZC-2;
  const lager=wood('#8d6344',{axis:'x',worn:.9});
  return {solids:[
   {f:barrel,mat:staves,group:'fass'},
   {f:union(hoop(YC+HL-.75),hoop(YC+HL-2.5),hoop(YC-HL+2.5),hoop(YC-HL+.75)),mat:darkIron,group:'reifen'},
   {f:union(...[-3.3,2.7].map(y=>subtract(boxAt(-7.8,7.8,y-.8,y+.8,0,3.3,.2),(x,yy,z)=>bodyF(x,yy,z)-.06))),mat:lager,group:'lager'},
   {f:union(...[-3.3,2.7].flatMap(y=>[-1,1].map(s=>beam([s*4.6,y,2.9],[s*5.9,y,4.3],.9,.35,.1)))),mat:wood('#6f5234',{axis:'y'}),group:'keile'},
   // Zapfhahn: Flansch, Rohr, Auslauf, Knebel
   {f:union(at(0,0,TZ,cylY(.8,TY-.05,TY+.3,.1)),at(0,0,TZ,cylY(.42,TY,TY+1.5,.12)),capsule([0,TY+1.3,TZ],[0,TY+1.45,TZ-1.1],.36)),mat:brass,group:'hahn',b:[0,TY+.8,TZ-.3,1.8]},
   {f:union(capsule([0,TY+.9,TZ+.3],[0,TY+.9,TZ+1.2],.2),capsule([-.75,TY+.9,TZ+1.25],[.75,TY+.9,TZ+1.25],.24)),mat:brass,group:'knebel',b:[0,TY+.9,TZ+.9,1.2]},
   {f:at(6.9,2.7,3.3,subtract(cylZ(.72,0,1.5,.12),cylZ(.52,.3,2))),mat:metal('#9a9c8e',{shine:26,spec:.55}),group:'becher',b:[6.9,2.7,4,1.2]},
  ]};}},

 // ---------------------------------------------------------------- Tetrapak-Kiste 16×12, Höhe 12
 // Offene Weinkiste mit Latten (Lücke zeigt die Packungen), falsches Brandwappen vorn, 4×4 Tetrapaks rot/weiß
 // (nur Farbfelder), eine fehlt, eine liegt quer obendrauf.
 'tetrapak-kiste':{height:12,build(){const CX=7.5,CY=5.5,CH=4.4,WT=.55,BZ=3.55;// Kistenhöhe, Mitte Brandzeichen
  const crateWood=wood('#b08858',{axis:'x',worn:.7});
  const brand=painted('brandzeichen',(u,v,w)=>{const r=Math.hypot(u/1.7,(w-BZ)/.62);return r>.7||Math.abs(u)<.18||Math.abs(w-BZ)<.1?'#52403c':'#8d6344';},{grain:.1});
  const RED={top:'#953d32',band:'#ecdfbf',stripe:'#d3a856',main:'#953d32',label:'#ecdfbf'},WHITE={top:'#e4dcc3',band:'#6d824e',stripe:'#d3a856',main:'#e4dcc3',label:'#9fac63'};
  const packMat=S=>painted('karton',(u,v,w)=>{if(w>6.62)return Math.abs(v)<.14?[S.top,.8]:S.top;if(w>5.3)return S.band;if(w>4.8)return S.stripe;
   if(Math.hypot(u/1.05,(w-3.7)/1.1)<1)return S.label;return S.main;},{grain:.05,spec:.2,shine:14});
  const mats={r:packMat(RED),w:packMat(WHITE)};
  const kinds='rwrr wrw- rrwr wrrw'.replace(/ /g,'');
  const solids=[];
  for(let j=0;j<4;j++)for(let i=0;i<4;i++){const k=kinds[j*4+i];if(k==='-')continue;const px=-5.1+i*3.4,py=-3.6+j*2.4;
   solids.push({f:hb(px,py,3.85,1.6,1.12,3.35,.18),tex:(x,y,z)=>[x-px,y-py,z-.5],mat:mats[k],group:'pack'+i+j,b:[px,py,3.85,3.9]});
   solids.push({f:at(px+.95,py-.35,7.2,cylZ(.46,0,.45,.12)),mat:plastic(k==='r'?'#e4dcc3':'#a6422b'),group:'deckel'+i+j,b:[px+.95,py-.35,7.4,.7]});}
  const LP=place(-.9,.4,8.75,0,0),lie=(x,y,z)=>{const [a,b,c]=LP(x,y,z),ca=Math.cos(.38),sa=Math.sin(.38),u=ca*a+sa*b,v=-sa*a+ca*b;return [v,c,u+3.35];};
  solids.push({f:posed(lie,(u,v,w)=>hb(0,0,3.35,1.6,1.12,3.35,.18)(u,v,w)),tex:lie,mat:mats.r,group:'liegend',b:[-.9,.4,8.75,4]});
  return {solids:[...solids,
   {f:subtract(mirrorX(boxAt(CX-WT,CX,-CY,CY,0,CH,.12)),mirrorX(boxAt(CX-1,CX+1,-1.5,1.5,2.7,3.5,.3))),mat:crateWood,group:'seiten'},
   {f:mirrorY(union(boxAt(-CX+WT,CX-WT,CY-WT,CY,.25,1.85,.1),boxAt(-CX+WT,CX-WT,CY-WT,CY,2.7,CH,.1))),mat:crateWood,group:'latten'},
   {f:boxAt(-CX+WT,CX-WT,-CY+WT,CY-WT,0,.5),mat:crateWood,group:'boden'},
   {f:(x,y,z)=>Math.max((Math.hypot(x/1.7,(z-BZ)/.62)-1)*.62,Math.abs(y-(CY+.02))-.04),mat:brand,group:'brand',b:[0,CY,BZ,1.9]},
   {f:mirrorX(mirrorY(boxAt(CX-WT-.8,CX-WT,CY-WT-.8,CY-WT,0,CH-.05))),mat:crateWood,group:'pfosten'},
  ]};}},

 // ---------------------------------------------------------------- Bierkisten-Thron 28×16, Höhe 34
 // Grüne und braune Bierkästen mit Flaschen: Sitz aus zwei Kästen, Armlehnen aus je zwei gedrehten Kästen, Rückenlehne vier Lagen
 // hoch plus ein Kasten obenauf, goldlackierte Kanten, rotes Samtkissen mit Goldknöpfen, schief aufgesetzte Pappkrone.
 'bierkisten-thron':{height:34,build(){const LX=4.0,LY=2.7,H=6;
  const green=custom('kunststoff','#55704a',(u,v,w)=>({k:.97+.1*fbm3(u*.35,v*.35,w*.35,3),ramp:GREEN}),{spec:.3,shine:20});
  const brown=custom('kunststoff','#5a3a22',(u,v,w)=>({k:.95+.1*fbm3(u*.35,v*.35,w*.35,3)}),{spec:.3,shine:20});
  const bottleBrown=glass('#5a3a1c'),label=paper('#ccb273');
  const shell=subtract(at(0,0,H/2,box(LX,LY,H/2,.3)),at(0,0,.45+3.3,box(LX-.45,LY-.45,3.3,.2)),
   mirrorY(at(0,LY,2.7,box(2.7,1,1.3,.4))),mirrorX(at(LX,0,4.9,box(1,1.3,.45,.3))));
  const bottles=repeatX(1.9,4,repeatY(1.6,3,union(cylZ(.72,.45,4.3,.25),roundCone([0,0,4.2],[0,0,5.2],.66,.32),cylZ(.33,5,5.85,.1))));
  const labels=repeatX(1.9,4,repeatY(1.6,3,cylZ(.76,2.0,2.9,.05)));
  const rim=union(subtract(at(0,0,H-.3,box(LX+.07,LY+.07,.32,.12)),at(0,0,H-.3,box(LX-.5,LY-.5,1))),mirrorX(mirrorY(at(LX-.22,LY-.22,H/2,box(.3,.3,H/2,.1)))));
  const solids=[];let n=0;
  const crate=(cx,cy,z0,turn,mat)=>{const g='kasten'+(n++),T=f=>at(cx,cy,z0,turn?rotZ(PI/2,f):f),bb=[cx,cy,z0+H/2,5.9];
   solids.push({f:T(shell),mat,group:g,b:bb},{f:T(bottles),mat:bottleBrown,group:g+'f',b:bb},{f:T(labels),mat:label,group:g+'e',b:bb},{f:T(rim),mat:gold,group:g+'g',b:bb});};
  for(let l=0;l<4;l++)for(const s of [-1,1])crate(s*LX,-5.2,l*H,false,(l+(s>0?1:0))%2?brown:green);
  crate(0,-5.2,4*H,false,green);
  for(const s of [-1,1])crate(s*LX,.3,0,false,s>0?green:brown);
  for(const s of [-1,1])for(let l=0;l<2;l++)crate(s*10.75,1.8,l*H,true,(l+(s>0?0:1))%2?brown:green);
  // Samtkissen mit Goldknöpfen und Quasten
  const velvet=fabric('#a6422b',{weave:1.2,fuzz:.1});
  solids.push({f:smoothUnion(.5,at(0,.6,6.95,box(7.8,2.6,.95,.8)),at(0,.6,7.7,ellipsoid(7.2,2.3,.5))),mat:velvet,group:'kissen',b:[0,.6,7.2,8.4]});
  solids.push({f:union(...[-4.8,0,4.8].flatMap(x=>[-.4,1.6].map(y=>at(x,y,8.1,ellipsoid(.36,.36,.25))))),mat:gold,group:'knoepfe',b:[0,.6,8.1,5.6]});
  solids.push({f:mirrorX(union(at(7.6,3.1,6.6,ellipsoid(.4,.4,.5)),roundCone([7.6,3.2,6.3],[7.7,3.35,5.2],.3,.5))),mat:gold,group:'quasten',b:[0,3.2,6,8.2]});
  // Rückenpolster aus demselben Samt, an die Kästen gelehnt: macht aus dem Stapel erst einen Thron
  solids.push({f:at(0,-1.95,13.4,rotX(.16,smoothUnion(.5,box(6.3,.6,4.6,.7),ellipsoid(5.7,1.1,4.1)))),mat:velvet,group:'rueckenkissen',b:[0,-1.95,13.4,8]});
  solids.push({f:union(...[-2.9,2.9].flatMap(x=>[11.5,15.3].map(z=>at(x,-.86-(z-13.4)*.16,z,ellipsoid(.36,.25,.36))))),mat:gold,group:'rueckenknoepfe',b:[0,-.9,13.4,4.2]});
  // Pappkrone: Zackenring aus goldbemalter Pappe mit aufgemalten Steinen, schief aufgesetzt
  const crown=(x,y,z)=>{const q=Math.hypot(x,y)-2.7,a=Math.atan2(y,x),tri=Math.abs(frac(a*5/TAU+.25)-.5)*2,top=1.6+2.2*(1-tri);
   return Math.max(Math.abs(q)-.17,-z,z-top)*.62;};
  const CP=place(0,-5.2,4*H+H,.1,-.12);
  const crownPaint=painted('pappkrone',(u,v,w)=>{const a=Math.atan2(v,u),k=frac(a*5/TAU+.25);
   if(Math.abs(w-.85)<.55&&Math.abs(k-.5)<.12)return (Math.floor(a*5/TAU+.25)&1)?'#b24d32':'#4c6976';
   if(w<.3)return '#c58965';return '#d3a856';},{grain:.14,spec:.08,shine:6});
  solids.push({f:posed(CP,crown),tex:CP,mat:crownPaint,group:'krone',b:[0,-5.2,4*H+H+1.9,4]});
  return {solids};}},

 // ---------------------------------------------------------------- Pappkulisse 40×4, Höhe 40
 // Freistehende Theaterkulisse aus dicker Wellpappe: vorn gemalte Burgmauer mit Zinnen (ausgeschnitten) und Spitzbogenfenster,
 // unbemalter Rand, Kreppband über den Stößen. Hinten Dachlatten als Stützen: in den Zinnenlücken und rechts als Strebe mit Sandsack sichtbar.
 pappkulisse:{height:40,build(){const FX0=-19.6,FX1=17.9,FY0=.7,FY1=1.7,TOPZ=35.2,MZ=39.6,GAP_W=3.2,MW=(FX1-FX0-4*GAP_W)/5,S1=-7.1,S2=5.4,DOG=2.8;
  const merlons=[0,1,2,3,4].map(i=>FX0+i*(MW+GAP_W));
  // Drei Pappbahnen, an den Stößen leicht geknickt wie ein Paravent: die äußeren treten zurück (links heller, rechts dunkler)
  const off=x=>x<S1?(x-S1)*.07:x>S2?-(x-S2)*.07:0;
  const sil0=(x,z)=>{let d=rect2(x,z,(FX0+FX1)/2,TOPZ/2,(FX1-FX0)/2,TOPZ/2);for(const m of merlons)d=Math.min(d,rect2(x,z,m+MW/2,(TOPZ-1+MZ)/2,MW/2,(MZ-TOPZ+1)/2));return d;};
  const dogCut=(x,z)=>((FX1-x)+(MZ-z)-DOG)/Math.SQRT2;// > 0 außerhalb der umgeklappten Ecke
  const slab=extY((x,z)=>Math.max(sil0(x,z),-dogCut(x,z)),FY0,FY1,.12),cornerSlab=extY((x,z)=>Math.max(sil0(x,z),dogCut(x,z)),FY0,FY1,.12);
  const flat=(x,y,z)=>slab(x,y-off(x),z)*.99;
  // Eselsohr: die Ecke oben rechts ist um die Diagonale nach vorn umgeknickt und zeigt ihre rohe Rückseite
  const A=[FX1-DOG/2,FY1+off(FX1-DOG/2),MZ-DOG/2],fold=rodr([Math.SQRT1_2,0,-Math.SQRT1_2],2.25);
  const ear=(x,y,z)=>{const p=fold([x-A[0],y-A[1],z-A[2]]),X=p[0]+A[0],Y=p[1]+A[1],Z=p[2]+A[2];return cornerSlab(X,Y-off(X),Z)*.99;};
  const WX=-1.2,WS=20,WH=3.2;// Fenster: Mitte, Kämpferhöhe, halbe Breite
  const archIn=(x,z,g)=>{if(z<11.9-g)return false;if(z<WS)return Math.abs(x-WX)<WH+g;return Math.hypot(x-(WX+WH),z-WS)<2*WH+g&&Math.hypot(x-(WX-WH),z-WS)<2*WH+g;};
  const STONES=['#9a9c8e','#898c83','#a9a999','#aaab98','#88887f'];
  const paint=painted('kulisse',(u,v,w,n)=>{
   if(n&&n[1]<.7){// Schnittkanten: Wellpappe (zwei Deckschichten, Welle dazwischen); Rückseite roh
    if(n[1]<-.7)return CARD;const lin=v-off(u)<FY0+.2||v-off(u)>FY1-.2;if(lin)return '#cdb98c';const s=Math.abs(n[2])>.5?u:w;return frac(s/.9)<.5?['#8d6942',.9]:'#b09374';}
   const edge=sil0(u,w)+.45+.18*noise3(u*.8,w*.8,3);if(edge>0)return CARD;
   if(Math.abs(u-S1)<.12||Math.abs(u-S2)<.12)return '#52403c';// Stoß der Bahnen
   // Fenster: Nachthimmel mit Bleisprossen, gemalte helle Laibung und Sims
   if(archIn(u,w,0)){if(Math.abs(u-WX)<.22||Math.abs(w-18.6)<.22)return '#3c3a44';return w>22?'#1e2c35':'#243841';}
   if(archIn(u,w,.35))return '#2d323d';
   if(archIn(u,w,1.25))return (w>WS&&Math.abs(u-WX)<.3)?'#3d4a3f':'#c2c1ad';
   if(w>10.9&&w<11.9&&Math.abs(u-WX)<WH+1.9)return '#c2c1ad';
   if(w>10.4&&w<10.9&&Math.abs(u-WX)<WH+1.9)return '#4b4c48';
   // Quader im Verband, von Hand gemalt: leicht wellige Fugen, gemalter Schatten unten, Licht oben
   const ww=w+.14*Math.sin(u*1.1),uu=u+.14*Math.sin(w*1.7),row=Math.floor(ww/3.2),o=(row&1)*3.2,col=Math.floor((uu+o)/6.4),fu=frac((uu+o)/6.4)*6.4,fw=frac(ww/3.2)*3.2;
   if(fu<.32||fw<.32)return '#4b4c48';
   const c=STONES[Math.floor(hash3(col,row,5)*STONES.length)];return fw<.9?[c,.82]:fw>2.75?[c,1.12]:c;},{grain:.1,freq:1.1});
  // Kreppband: kurze Stücke quer über die Stöße, zwei schräge Flicken
  const onFace=d2=>(x,y,z)=>Math.max(Math.abs(y-(FY1+off(x)+.04))-.05,d2(x,z))*.95;
  const tapes=onFace((x,z)=>{let d=1e9;for(const s of [S1,S2])for(const zc of [4.6,13.2,22.8,31.4])d=Math.min(d,rect2(x,z,s+.15*Math.sin(zc),zc,1.3,.45));
   return Math.min(d,seg2(x,z,-18.9,1.1,-15.8,3.6)-.5,seg2(x,z,9.8,31.6,13.1,33.8)-.5);});
  const lath=wood('#c8a070',{axis:'z',worn:1});
  const gapX=[0,3].map(i=>merlons[i]+MW+GAP_W/2);
  return {solids:[
   {f:flat,mat:paint,group:'pappe'},
   {f:ear,mat:cardboard,group:'eselsohr',b:[FX1-1.4,1.5,MZ-1.4,2.6]},
   {f:tapes,mat:TAPE,group:'band'},
   {f:union(...gapX.map(x=>boxAt(x-.6,x+.6,-.9,FY0-.5,0,37.6,.1))),mat:lath,group:'latten'},
   {f:beam([16.2,-.45,30],[19.2,-1.6,.2],.32,.28,.08),mat:lath,group:'strebe'},
   {f:at(18.9,-1.1,.55,ellipsoid(.75,1.05,.55)),mat:fabric('#4b4c48',{fuzz:.15}),group:'sandsack'},
  ]};}},

 // ---------------------------------------------------------------- Basaltsäule 10×10, Höhe 46 (Basaltdom, ganz unten: echt)
 // Sechseckiger Schaft (Fläche nach vorn: links Lichtkante, vorn Mitte, rechts Schatten) aus vier leicht verdrehten Trommeln
 // mit dunklen Fugen, leicht unebene Oberfläche, Sockel und Kapitell grob behauen.
 basaltsaeule:{height:46,build(){return {solids:basaltColumn()};}},

 // ---------------------------------------------------------------- Pappsäule 10×10, Höhe 46 (Schild und Wirklichkeit)
 // Dieselbe Basaltsäule, vorn mit Pappe verkleidet und als weißer Marmor bemalt (Adern, gemalte Kanneluren): Pappe an den
 // Kanten sichtbar, Kreppband hält die Verkleidung, oben rechts ist eine Ecke abgerissen – darunter der Basalt.
 pappsaeule:{height:46,build(){
  const tear=(x,z)=>(z-45.1)+(x-1.2)*1.75+.9*(noise3(x*1.9,z*1.9,7)-.5);// > 0: abgerissen
  const cut=f=>(x,y,z)=>Math.max(f(x,y,z),tear(x,z)/2.6);
  const BACK=-1.1;// hinter dieser Linie keine Verkleidung (Rückseite zur Wand)
  const shaft=(x,y,z)=>Math.max(Math.abs(Math.hypot(x,y)-3.75)-.17,BACK-y,Math.abs(z-22.6)-18.2);
  const boxShell=(h,z0,z1)=>(x,y,z)=>Math.max(Math.abs(box(h,h,(z1-z0)/2,.25)(x,y,z-(z0+z1)/2))-.17,BACK-y);
  const marble=painted('marmor',(u,v,w,n)=>{
   const tr=tear(u,w);if(tr>-.5)return tr>-.22?'#cdb98c':CARD;// Rissrand: Pappe mit hellen Fasern
   const rad=Math.hypot(u,v)>3.3&&w>4.6&&w<40.8,out=rad?(n[0]*u+n[1]*v)/Math.hypot(u,v):Math.max(n[1],Math.abs(n[0]),n[2]);
   if(out<.6||v<BACK+.35)return CARD;// Schnittkanten und Rand zur Wand: rohe Pappe
   const vein=Math.abs(fbm3(u*.3+w*.1,v*.3,w*.18,4)-.5),vein2=Math.abs(fbm3(u*.5+9,v*.5,w*.3,3)-.5);
   if(vein<.022)return '#88887f';if(vein2<.018)return '#c2c1ad';
   if(rad&&frac(Math.atan2(u,v)*14/TAU)<.13)return ['#d9d7c2',.94];// gemalte Kanneluren
   if(!rad&&(Math.abs(w-4.2)<.2||Math.abs(w-41.4)<.2))return '#c2c1ad';
   return '#ece5cc';},{grain:.05,spec:.25,shine:18});
  const tapeBands=(x,y,z)=>Math.max(Math.abs(Math.hypot(x,y)-3.95)-.06,BACK+.3-y,Math.min(Math.abs(z-11.4),Math.abs(z-27.2))-.45);
  return {solids:[...basaltColumn(),
   {f:cut(shaft),mat:marble,group:'verkleidung',b:[0,0,22.6,19.2]},
   {f:cut(boxShell(4.5,0,4.6)),mat:marble,group:'sockelpappe',b:[0,0,2.3,7.4]},
   {f:cut(boxShell(4.5,41,46.2)),mat:marble,group:'kapitellpappe',b:[0,0,43.6,7.5]},
   {f:cut(tapeBands),mat:TAPE,group:'band',b:[0,0,19.3,9.5]},
   {f:cut((x,y,z)=>Math.max(Math.abs(Math.hypot(x,y)-3.95)-.06,Math.abs(seg2(Math.atan2(x,y)*3.95,z,1.0,36.9,2.9,38.7))-.45,-y)),mat:TAPE,group:'flicken',b:[1.8,3.4,37.8,2.4]},
  ]};}},
};

// ---------- Basaltsäule (echt; die Pappsäule verkleidet dieselbe Form) ----------
/** 2D-Sechseck (Fläche nach ±y), Inkreisradius r – nach Quilez. */
const HK=[-.8660254,.5,.57735027];
function hex2(x,y,r){x=Math.abs(x);y=Math.abs(y);const d=2*Math.min(HK[0]*x+HK[1]*y,0);x-=d*HK[0];y-=d*HK[1];x-=clamp(x,-HK[2]*r,HK[2]*r);y-=r;return Math.hypot(x,y)*Math.sign(y);}
const hexPrism=(r,z0,z1,rr=0)=>(x,y,z)=>{const a=hex2(x,y,r)+rr,b=Math.abs(z-(z0+z1)/2)-(z1-z0)/2+rr;return Math.min(Math.max(a,b),0)+Math.hypot(Math.max(a,0),Math.max(b,0))-rr;};
function basaltColumn(){const J=[14,23.5,32.8],R0=3.0;
 const basalt=custom('basalt','#3a414d',(u,v,w)=>{let k=.9+.2*fbm3(u*.8,v*.8,w*.8,3);if(noise3(u*2.6,v*2.6,w*2.6)>.8)k*=1.12;
  for(const j of J)if(Math.abs(w-j)<.3)k*=.5;return {k};},{spec:.22,shine:16});
 const rough=(f,a=.4,fr=.7)=>(x,y,z)=>(f(x,y,z)-a*(fbm3(x*fr+4,y*fr,z*fr,3)-.45))*.6;
 const uneven=f=>(x,y,z)=>(f(x,y,z)-.16*(fbm3(x*1.1,y*1.1,z*.45,2)-.45))*.85;
 const segs=[[4.4,14,.04,0,0],[14,23.5,-.07,.1,-.05],[23.5,32.8,.03,-.08,.05],[32.8,40.9,-.05,.05,.07]];
 const flare=(x,y,z)=>{const h=Math.min(4.05,3.1+Math.max(0,z-40.6)*.75);return Math.max(Math.abs(x)-h,Math.abs(y)-h,z-42.6,40.6-z)*.75;};
 return [
  {f:rough(boxAt(-4.1,4.1,-4.1,4.1,0,3.6,.4)),mat:basalt,group:'sockel',b:[0,0,1.8,6.8]},
  {f:rough(hexPrism(3.55,3.4,4.6,.3),.3,.9),mat:basalt,group:'plinthe',b:[0,0,4,4.4]},
  ...segs.map(([z0,z1,a,ox,oy],i)=>({f:rotZ(a,at(ox,oy,0,uneven(hexPrism(R0,z0,z1,.32)))),mat:basalt,group:'trommel'+i,b:[0,0,(z0+z1)/2,Math.hypot(3.7,(z1-z0)/2)+.4]})),
  {f:rough(union(flare,boxAt(-4.1,4.1,-4.1,4.1,42.4,46,.4))),mat:basalt,group:'kapitell',b:[0,0,43.3,7.2]},
 ];}
