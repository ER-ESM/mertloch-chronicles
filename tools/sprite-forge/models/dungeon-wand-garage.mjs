// Sprite-Schmiede · Dungeon „Schloss Big B“: Wandschmuck der Räume und die Doppelgarage mit Pappzinnen (Eingang in der Welt).
// Leitidee „Schild und Wirklichkeit“: Der Hausherr nennt sich Freiherr und hat seine Doppelgarage mit Pappe zur Burg aufgehübscht.
// Wandschmuck: Rückseite an der Wand bei y=−1, Vorderseite bis etwa y=+1 (Regalbretter bis y≈+2,2), x ∈ ±w/2, z=0 = Unterkante.
//   Bildrand unten: ein Punkt (y,z) bleibt nur sichtbar, wenn y·0,7 − z ≤ 0,7 – vorragende Teile nicht in Bodennähe.
// Garage (Klasse aussen, 100×44, Höhe 52): Front nach Süden bei y=+20, Bildunterkante = Vorderkante der Standfläche (y=+22, z=0).
// Bildinhalte (Ahnenbilder, Schild) sind Farbzonen einer gemalten Textur: keine Schrift, keine Gesichter.
import {box,cylZ,capsule,roundCone,ellipsoid,torusZ,extrudeXZ,at,rotY,union,smoothUnion,subtract,intersect,mirrorX,repeatX,
 fbm3,noise3,hash3,clamp,smoothstep} from '../sdf.mjs';
import {wood,metal,glow,custom,rampFrom} from '../materials.mjs';
import {flicker} from './referenz.mjs';

const TAU=Math.PI*2;

// ---------- Hilfen ----------
/** Achsparalleler Quader von Ecke zu Ecke, Kanten mit Radius r gerundet. */
const cuboid=(x0,x1,y0,y1,z0,z1,r=0)=>at((x0+x1)/2,(y0+y1)/2,(z0+z1)/2,box((x1-x0)/2,(y1-y0)/2,(z1-z0)/2,r));
/** Waagerechter Zylinder entlang x von x0 bis x1 (Achse bei y,z = 0). */
const cylX=(rad,x0,x1,r=0)=>rotY(Math.PI/2,cylZ(rad,x0,x1,r));
/** Kette aus Kapseln durch die Punkte (Schnüre). */
const chain=(pts,r)=>union(...pts.slice(1).map((p,i)=>capsule(pts[i],p,r)));
/** Lage eines Teils: Drehung in der x-z-Ebene um (ox,oz) – Welt → Teilkoordinaten (auch als Textur-Koordinate). */
const pose=(ox,oy,oz,ay=0)=>{const c=Math.cos(ay),s=Math.sin(ay);return (x,y,z)=>{const X=x-ox,Z=z-oz;return [c*X-s*Z,y-oy,s*X+c*Z];};};
const posed=(P,f)=>(x,y,z)=>{const [a,b,c]=P(x,y,z);return f(a,b,c);};
/** Knick: Teil um die Achse A→B um den Winkel phi gedreht (Rodrigues). Liefert Welt → Teilkoordinaten. */
function hingeP(A,B,phi){const d=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],L=Math.hypot(...d),u=d.map(v=>v/L),c=Math.cos(-phi),s=Math.sin(-phi);
 return (x,y,z)=>{const px=x-A[0],py=y-A[1],pz=z-A[2],dot=u[0]*px+u[1]*py+u[2]*pz,cx=u[1]*pz-u[2]*py,cy=u[2]*px-u[0]*pz,cz=u[0]*py-u[1]*px;
  return [px*c+cx*s+u[0]*dot*(1-c)+A[0],py*c+cy*s+u[1]*dot*(1-c)+A[1],pz*c+cz*s+u[2]*dot*(1-c)+A[2]];};}
const ell=(x,z,cx,cz,rx,rz)=>Math.hypot((x-cx)/rx,(z-cz)/rz);
const segDist=(px,pz,ax,az,bx,bz)=>{const ex=bx-ax,ez=bz-az,h=clamp(((px-ax)*ex+(pz-az)*ez)/(ex*ex+ez*ez),0,1);return Math.hypot(px-ax-ex*h,pz-az-ez*h);};
const rectEdge=(px,pz,x0,z0,x1,z1)=>{const cx=(x0+x1)/2,cz=(z0+z1)/2,hx=(x1-x0)/2,hz=(z1-z0)/2,qx=Math.abs(px-cx)-hx,qz=Math.abs(pz-cz)-hz;
 return Math.abs(Math.hypot(Math.max(qx,0),Math.max(qz,0))+Math.min(Math.max(qx,qz),0));};

// Rampen je Farbe zwischenspeichern: gemalte Flächen wählen je Punkt eine Farbzone.
const RAMPS=new Map();const R=c=>{let r=RAMPS.get(c);if(!r)RAMPS.set(c,r=rampFrom(c));return r;};
/** Gemalte Fläche: fn(u,v,w,n) → Farbe oder [Farbe, Helligkeitsfaktor]. Leichte Pinselkörnung. */
const painted=(name,fn,{grain=.08,spec=.03,shine=4,freq=.9}={})=>custom(name,'#808080',(u,v,w,n)=>{const z=fn(u,v,w,n),[c,k=1]=Array.isArray(z)?z:[z];
 return {k:k*(1-grain/2+grain*fbm3(u*freq,v*freq,w*freq,2)),ramp:R(c)};},{spec,shine});

const nailIron=metal('#6a6468',{shine:24,spec:.6});

// ================================================================ Neonröhre (Garage)
// Blechgehäuse an der Wand, darunter die Röhre (kaltweiß). Alte Röhre: Enden geschwärzt, ein Bild der Folge etwas dunkler.
const neonGlow=glow(['#44575f','#8e9e94','#c8c5af','#d9d7c2','#eeeadc']);
function neonroehre(t){const i=Math.round(t*4)%4,g0=i===2?.8:.93;
 // Verzinktes Blech, fleckig; oben Staub. Dunkler als die Röhre, damit sie sich abhebt.
 const zinc=custom('blech','#848a82',(u,v,w,n)=>{let k=.9+.2*fbm3(u*.45,v*.45,w*.45,3);if(n&&n[2]>.6)k*=.88+.12*fbm3(u*.3+4,v,w,2);
  return {k};},{spec:.45,shine:24});
 const tube=(u)=>clamp(g0*(1-.5*smoothstep(9.2,11.4,Math.abs(u))),0,.97);// alte Röhre: Enden geschwärzt
 return {solids:[
  {f:cuboid(-12.8,12.8,-1,-.05,1.85,3.0,.2),mat:zinc,group:'gehaeuse'},
  // Reflektor: schräges Blech über der Röhre
  {f:(x,y,z)=>Math.max(Math.abs(x)-12.9,Math.abs((y-.1)*.83+(z-2.4)*.56)-.13,Math.abs(-(y-.1)*.56+(z-2.4)*.83)-.75),mat:zinc,group:'reflektor'},
  {f:mirrorX(cuboid(11.6,12.5,-.4,.9,.4,1.85,.18)),mat:custom('fassung','#5a5c5e',()=>({k:1}),{spec:.3,shine:18}),group:'fassung'},
  {f:at(0,.4,1.02,cylX(.62,-11.65,11.65,.34)),mat:neonGlow,glow:(u)=>tube(u),group:'roehre',noShadow:true},
 ],lights:[-7,0,7].map(x=>({p:[x,1.5,.4],r:5.5,k:.35*g0,color:[.8,.92,1]}))};}

// ================================================================ Ahnenbilder (Ahnengalerie)
// Dreimal derselbe Schattenriss (der Hausherr, im Profil nach links), nur Perücke und Grund wechseln – die „Ahnen“ sind alle er.
const SIL='#2a2226';
/** Brustbild-Schattenriss: Kopf, Nasenbuckel, Kinn, Hals, Büste. Leinwand x ∈ ±3,45, z ∈ 1,95…9,75. */
const silhouette=(x,z)=>ell(x,z,.35,6.7,1.5,1.85)<1||ell(x,z,-1.22,6.3,.44,.36)<1||ell(x,z,-.5,5.4,.85,.55)<1
 ||(x>-.45&&x<1.1&&z>4.2&&z<5.9)||(z<4.75&&ell(x,z,.45,2.1,3.4,2.65)<1);
const FACE=(x,z)=>x<-.25&&z>5.0&&z<7.35;// Gesichtspartie bleibt Schattenriss (Profil nach links)
/** Allongeperücke: drei Massen mit gewelltem Rand, darin Lockenreihen (Licht von links oben). */
function lockenWig(x,z){if(FACE(x,z))return null;
 const lobe=(cx,cz,rx,rz,ph)=>{const a=Math.atan2((z-cz)/rz,(x-cx)/rx);return ell(x,z,cx,cz,rx,rz)*(1+.08*Math.sin(a*9+ph));};
 const d=Math.min(lobe(.55,7.9,2.05,1.45,0),lobe(1.8,5.2,1.25,2.55,1),lobe(-.35,4.15,.75,1.4,2));if(d>=1)return null;
 if(d>.86)return '#a39c90';
 const j=Math.floor(z/1.05),cx=Math.floor((x+(j&1)*.55)/1.1)*1.1-(j&1)*.55+.55,cz=j*1.05+.52,r=Math.hypot(x-cx,z-cz);
 if(r>.5&&r<.6)return '#bcb4a6';
 return (x-cx)*-.6+(z-cz)*.8>.12?'#f6f0e2':'#ddd6c6';}
const WIG={
 locken:lockenWig,
 zopf:(x,z)=>{
  // Schleife (vorn), Zopf, Seitenrollen, Haube
  const bow=Math.min(ell(x,z,1.4,5.45,.68,.44),ell(x,z,2.7,5.45,.68,.44));
  if(Math.hypot(x-2.05,z-5.35)<.3)return '#6e1e1c';
  if(bow<1)return bow>.7?'#6e1e1c':'#b8362a';
  if(segDist(x,z,1.95,5.15,1.6,4.3)<.2||segDist(x,z,2.15,5.15,2.6,4.35)<.2)return '#8a2622';
  const q=Math.min(segDist(x,z,1.75,6.3,2.05,5.2),segDist(x,z,2.05,5.2,2.3,3.7)),qr=.4-.06*clamp((5.2-z)/1.5,0,1);
  if(q<qr)return q>qr-.12?'#9e988c':'#dcd6ca';
  for(const [z0,r] of [[6.4,.44],[5.6,.4]]){const d=segDist(x,z,-.05,z0,1.45,z0);if(d<r)return d>r*.72?'#9e988c':(z>z0?'#f4f0e6':'#d6d1c6');}
  const e=ell(x,z,.6,7.45,1.62,1.32);
  if(e<1&&!(x<-.3&&z<7.5))return e>.86?'#a8a296':(x<.5&&z>7.9?'#f4f0e6':'#dcd6ca');
  return null;},
 toupet:(x,z)=>{
  const a=-.44,c=Math.cos(a),s=Math.sin(a),X=(x-1.3)*c+(z-8.5)*s,Z=-(x-1.3)*s+(z-8.5)*c,rz=.7*(1+.2*Math.sin(X*6.5+.6)*(Z<0?1:.3));
  const d=Math.hypot(X/1.9,Z/rz);
  if(d<1)return d>.8?'#5a3620':(Z>.18?'#d09a58':(Math.sin(X*6)>.55?'#7e4e28':'#a86e36'));
  if(segDist(x,z,-.4,9.3,-.8,9.85)<.1||segDist(x,z,-.12,9.35,-.2,9.95)<.09)return '#9a6432';// abstehende Strähnen vorn
  if(ell(x,z,1.6,6.55,.42,.7)<1&&x>1.3)return '#7a726a';// echter Haarkranz, grau
  if(ell(x,z,.2,7.95,.85,.42)<1&&ell(x,z,.2,7.95,.85,.42)>.55&&z>7.95)return '#463c40';// Glanz auf der Glatze
  return null;},
};
function portrait(kind,bg){return painted('oelbild',(x,y,z)=>{const Z=z+.3,w=WIG[kind](x,Z);if(w)return w;if(silhouette(x,Z))return SIL;
 const d=Math.hypot((x-.3)/3.3,(z-6.9)/3.8);return [bg,1.22-.34*d];},{grain:.1,freq:1.4});}
const gold=custom('gold','#d8aa4a',(u,v,w)=>({k:.84+.34*fbm3(u*1.3,v*1.3,w*1.3,3)}),{spec:.85,shine:30}),goldDk=metal('#8a6424',{shine:20,spec:.5});
/** Freiherrenkrone: Reif mit fünf Zacken (Mitte höchste), flach nach vorn. */
const CROWN=[[-2,11.0],[2,11.0],[2.05,12.55],[1.45,12.0],[1.0,12.85],[.5,12.1],[0,13.15],[-.5,12.1],[-1.0,12.85],[-1.45,12.0],[-2.05,12.55]];
function ahnenbild(kind,bg){const Z=5.85;
 return {solids:[
  {f:subtract(at(0,-.2,Z,box(4.9,.8,5.5,.55)),at(0,0,Z,box(3.45,2,3.9,.12))),mat:gold,group:'rahmen'},
  {f:subtract(at(0,.3,Z,box(3.95,.4,4.4,.3)),at(0,0,Z,box(3.45,2,3.9,.1))),mat:goldDk,group:'leiste'},
  {f:union(...[[-4.15,1.1],[4.15,1.1],[-4.15,10.6],[4.15,10.6]].map(([x,z])=>at(x,.5,z,ellipsoid(.95,.45,.95)))),mat:gold,group:'zier'},
  {f:union(at(0,.05,0,extrudeXZ(CROWN,.35,.12)),...[[-2.05,12.6],[-1,12.9],[0,13.25],[1,12.9],[2.05,12.6]].map(([x,z])=>at(x,.1,z,ellipsoid(.34,.34,.34)))),mat:gold,group:'krone'},
  {f:cuboid(-1.35,1.35,.45,.8,.7,1.5,.1),mat:metal('#c8a050',{shine:30,spec:.7}),group:'schild'},
  {f:cuboid(-3.55,3.55,-.95,-.5,1.85,9.85),mat:portrait(kind,bg),group:'bild',noShadow:true},
  {f:union(capsule([-3.2,-.8,10.9],[0,-.85,13.9],.2),capsule([3.2,-.8,10.9],[0,-.85,13.9],.2)),mat:custom('schnur','#8a2a24',()=>({k:1})),group:'schnur'},
  {f:at(0,-.6,14.0,ellipsoid(.45,.4,.45)),mat:nailIron,group:'nagel'},
 ]};}

// ================================================================ Fackel (Basaltkeller)
const fireRamp=glow(['#6a1e0e','#b8401a','#e8762a','#f8b04a','#ffe89a']);
function fackel(t){const c=Math.cos(TAU*t),s=Math.sin(TAU*t),sway=.28*s+.3*(flicker(t,2,1.2)-.5),H=4.3+1.1*flicker(t,7,1.3);
 const base=[0,1.25,8.7],tip=[sway*1.8,1.25,8.7+H];
 const core=roundCone(base,tip,1.12,.1);
 const tongueL=roundCone([-.55,1.25,9.4],[-.9+sway,1.25,9.6+2.2*flicker(t,11,1.5)],.45,.06);
 const tongueR=roundCone([.6,1.25,9.2],[1.0+sway*.6,1.25,9.4+1.9*flicker(t,17,1.5)],.4,.06);
 const flameF=(x,y,z)=>{const n=noise3(x*.9+c*1.4,(z-8.7)*.7-s*1.4,y*.5+s*.7+c*.5);
  return (smoothUnion(.5,core,tongueL,tongueR)(x,y,z)+.5*(n-.5)*smoothstep(8.9,11,z))*.8;};
 const flameGlow=(u,v,w)=>{const h=(w-8.7)/H,cx=sway*1.8*clamp(h,0,1),n=noise3(u*1.3+c,w*1.1-s*1.3,s*.6+c*.4);
  return clamp(.99-.55*h-.22*Math.abs(u-cx)+.3*(n-.5),.2,.98);};
 const f=.85+.3*flicker(t,4,1.4);
 // Kopf aus pechgetränktem Werg: helle Wickelbänder, dunkle Pechfugen, oben verkohlt
 const head=custom('pechkopf','#6a5238',(u,v,w)=>{const b=Math.sin(w*3.3+Math.atan2(u,v-1.1)*1.2);let k=(b>.2?1.1:.62)*(.9+.16*fbm3(u*1.4,v*1.4,w*1.4,2));
  if(w>7.9)return {k:k*.8,ramp:R('#3a2a22')};return {k};},{spec:.2,shine:10});
 const iron=metal('#5e5250',{rust:.55,shine:22,spec:.5});
 return {solids:[
  {f:subtract(cuboid(-1.55,1.55,-1,-.5,2.0,6.6,.28),cuboid(-.95,.95,-.58,0,2.6,6.0,.2)),mat:iron,group:'platte'},
  {f:union(...[[-1.22,2.35],[1.22,2.35],[-1.22,6.25],[1.22,6.25]].map(([x,z])=>at(x,-.45,z,ellipsoid(.3,.22,.3)))),mat:nailIron,group:'niete'},
  {f:union(capsule([0,-.65,5.7],[0,.88,5.15],.3),at(0,.9,5.15,torusZ(.8,.24)),capsule([0,-.65,3.2],[0,.6,2.35],.26),at(0,.58,2.35,torusZ(.62,.22)),
   chain([[0,-.7,2.3],[0,-.55,1.5],[0,-.2,1.1],[0,.15,1.3],[0,.12,1.7]],.2)),mat:iron,group:'halter'},
  {f:roundCone([0,.3,.55],[0,1.02,7.0],.38,.5),mat:wood('#7a5230',{axis:'z'}),group:'stiel'},
  {f:roundCone([0,1.0,6.4],[0,1.2,8.3],.85,1.1),mat:head,group:'kopf'},
  {f:flameF,mat:fireRamp,glow:flameGlow,group:'flamme',noShadow:true},
 ],lights:[{p:[0,2.3,9.3],r:8.5,k:.7*f,color:[1,.6,.26]}]};}

// ================================================================ Wandregal mit Aktenordnern (Büro)
const BINDER={red:'#b0342a',blue:'#2f5c96',yellow:'#d4a52a',green:'#3a7a3e',black:'#2b2a2e',gray:'#8a8e92'};
/** Ordner: Rücken vorn mit Griffloch (Metallring) und leerem Rückenschild, oben Papierkante zwischen den Deckeln.
 * Lokale Koordinaten (pose): a ∈ [0,wd] quer, b Tiefe (Rücken bei +dp/2), c ∈ [0,ht] hoch. */
function binder(ox,z0,col,{wd=1.36,ht=3.85,dp=2.55,yc=.45,ang=0,id=0}={}){const P=pose(ox,yc,z0,ang);
 const mat=painted('ordner',(a,b,c,n)=>{
  if(b>dp/2-.08){// Rücken
   const d=Math.hypot(a-wd/2,c-.95);if(d<.34)return '#1e1c22';if(d<.47)return '#b8b8ae';
   if(Math.abs(a-wd/2)<.42&&c>1.75&&c<3.3)return Math.abs(a-wd/2)>.33||c<1.84||c>3.21?'#b8ae94':'#ece4cc';
   return col;}
  if(c>ht-.08&&a>.32&&a<wd-.32&&b<dp/2-.5&&b>-dp/2+.3)return ['#d4c8a8',.85];// Papier zwischen den Deckeln
  return [col,.9];},{grain:.05});
 return {f:posed(P,cuboid(0,wd,-dp/2,dp/2,0,ht,.14)),tex:P,mat,group:'ordner'+id};}
function ordnerregal(){
 const board=wood('#c49a64',{axis:'x'}),rail=metal('#3a3a40',{shine:24,spec:.5});
 const r1=['red','blue','blue','yellow','black','green','red','gray','blue','yellow','black','red','green'],
  r2=['blue','gray','red','green','black','yellow','blue','red','gray','green'];
 const solids=[
  {f:union(cuboid(-11.95,11.95,-.95,2.2,.95,1.45,.12),cuboid(-11.95,11.95,-.95,2.2,5.55,6.05,.12)),mat:board,group:'bretter'},
  {f:mirrorX(cuboid(8.3,8.8,-1,-.72,.25,10.4,.1)),mat:rail,group:'schiene'},
  {f:mirrorX(union(cuboid(8.35,8.75,-.8,1.6,.6,.95,.06),cuboid(8.35,8.75,-.8,1.6,5.2,5.55,.06))),mat:rail,group:'traeger'},
  // Wand im Schatten hinter den Ordnern (Lücken bleiben dunkel)
  {f:union(cuboid(-11.9,11.9,-1,-.9,1.45,5.55),cuboid(-11.9,11.9,-1,-.9,6.05,9.9)),mat:custom('schatten','#3a3336',()=>({k:.6})),group:'rueckwand'},
 ];
 // Reihe 1: 13 stehende Ordner, zwei lehnen rechts schräg
 r1.forEach((c,i)=>solids.push(binder(-11.55+i*1.48,1.45,BINDER[c],{id:'a'+i,yc:.45+(i%5===3?-.35:0)})));
 const th=.33,s=Math.sin(th);
 solids.push(binder(7.72+3.85*s+.05,1.45,BINDER.blue,{ang:-th,id:'a13'}),binder(7.72+3.85*s+.05+1.36/Math.cos(th)+.02,1.45,BINDER.gray,{ang:-th,id:'a14'}));
 // Reihe 2: zehn stehende, einer lehnt, rechts ein Stapel liegender Ordner
 r2.forEach((c,i)=>solids.push(binder(-11.55+i*1.48,6.05,BINDER[c],{id:'b'+i,ht:3.7})));
 const th2=.42;solids.push(binder(3.3+3.7*Math.sin(th2),6.05,BINDER.yellow,{ang:-th2,ht:3.7,id:'b10'}));
 [['red',11.6],['black',11.35],['blue',11.7]].forEach(([c,x],k)=>solids.push(binder(x,6.05+k*1.38,BINDER[c],{ang:-Math.PI/2,ht:3.8,id:'l'+k})));
 return {solids};}

// ================================================================ Doppelgarage mit Pappzinnen (Eingang Burgstraße)
// Stil wie die gemalten Nachbarhäuser: warmer Putz, Satteldach mit rotbraunen Bitumenschindeln, dunkle Holzakzente,
// Sockel aus Bruchstein. Davor die „Burg“: Pappzinnen auf der Traufe und zwei Papprohr-Türmchen mit Spitzhelm aus Pappe.
const YF=20,ZW=31.4,GH=23.2,REC=1.2,YG=YF-REC;// Fassade, Wandhöhe, Torhöhe, Rücksprung der Tore, Torebene
const PITCH=.47,TP=Math.tan(PITCH),CP=Math.cos(PITCH),YE=21.3,ZE=31.9,TH=1.0;// Dachneigung, Traufe (y, Oberkante), Dachstärke
const roofTop=y=>ZE+TP*(YE-Math.abs(y));
const MC=[-27,-9,9,27],HW=5,ZB=31.0,ZP=38.2,ZM=47.0,YC=20.7;// Zinnen: Mitten, halbe Breite, Fuß, Brüstung, Zacke, Ebene
const TX=43.9,TY=16.4,TR=4.7,TZ0=30.8,TZ1=53.4,CR=5.6,CZ=66.4;// Türmchen: Lage, Rohrradius, Rohr unten/oben, Helmradius, Helmspitze
const CARD='#b69a6c';
const GREEN=['#263530','#2d423c','#354b36','#455e40','#55704a','#6d824e','#849451'].map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)));
/** Putz creme-ocker wie die Nachbarhäuser: leicht wolkig, links etwas heller, unten Spritzwasser. */
const plasterG=custom('putz','#ecd9ae',(u,v,w)=>{let k=1.02+.12*fbm3(u*.14,v*.14,w*.14,4)+.05*(fbm3(u*.9,v*.9,w*.9,2)-.5);
 k*=1.05-.1*clamp((u+48)/96,0,1);if(w<6)k*=.88+.12*smoothstep(3.4,6,w);
 if(fbm3(u*.09+2,v*.09,w*.09,3)>.58)return {k,ramp:R('#e0c48c')};// ockerfarbene Flecken
 return {k};},{spec:.03,shine:4});
/** Bruchstein: unregelmäßige Steine (Zellen), dunkle Fugen, drei Steintöne. */
const rubble=custom('bruchstein','#9a8a74',(u,v,w)=>{const cu=u/2.1,cw=w/1.3,iu=Math.floor(cu),iw=Math.floor(cw);let d1=9,d2=9,id=0;
 for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const gx=iu+a,gz=iw+b,px=gx+.15+.7*hash3(gx,gz,1),pz=gz+.15+.7*hash3(gx,gz,2),d=Math.hypot((cu-px)*2.1,(cw-pz)*1.3);
  if(d<d1){d2=d1;d1=d;id=gx*7+gz*13;}else if(d<d2)d2=d;}
 if(d2-d1<.24)return {k:.6,ramp:R('#5a4e44')};const h=hash3(id,3,3);
 return {k:(.9+.18*h)*(1-.12*smoothstep(.4,1.2,d1)),ramp:h<.3?R('#8a7a66'):h>.7?R('#b0a084'):undefined};},{spec:.06,shine:8});
const darkWood=wood('#4a2e1c',{axis:'x'}),darkWoodZ=wood('#4a2e1c',{axis:'z'}),copper=metal('#a0643a',{shine:30,spec:.6,rust:.1});
/** Sektionaltor in Holzdekor: Maserung quer, Felderfugen dunkel, unten Schmutz; die Kassetten sind echte Vertiefungen. */
const gateMat=(x0,z0)=>custom('tor','#b87a44',(u,v,w,n)=>{const zl=w-z0,f=zl-Math.floor(zl/5.8)*5.8;
 let k=(.97+.035*Math.sin(w*4.4+3*fbm3(u*.05,v,w*.3,3)))*(.94+.1*fbm3(u*.25,v*.25,w*.6,3));
 if(f<.3)k*=.5;else if(f<.55)k*=1.12;k*=1.04-.08*clamp((u-x0)/38,0,1);if(zl<2.4)k*=.84+.16*zl/2.4;return {k};},{spec:.18,shine:12});
/** Kassetten eines Tors: je Feld (5,8 E) acht erhabene Füllungen mit gerundeten Kanten (Lichtkante oben links, Schatten unten rechts). */
const cassettes=(x0,zb)=>{const CW=37.8/8,cell=box(1.75,.32,2.0,.3);
 return (x,y,z)=>{const j=clamp(Math.floor((x-x0)/CW),0,7),i=clamp(Math.floor((z-zb)/5.8),0,4);return cell(x-(x0+(j+.5)*CW),y-YG,z-(zb+(i+.5)*5.8));};};
/** Schindeln rotbraun: Reihen entlang der Traufe, versetzte Zungen mit gerundetem Fuß (wie die Ziegel der Nachbarhäuser),
 * Schattenfuge unter jeder Reihe, einzelne Zungen heller/dunkler. */
const shingles=custom('schindel','#b04a22',(u,v,w,n)=>{const s=(YE-Math.abs(v))/CP,row=Math.floor(s/3.0),f=s/3.0-row,off=(row&1)*2.1,q=(u+off+64)/4.2,tab=Math.floor(q),g=q-tab;
 let k=.8+.12*(hash3(tab,row,5)-.5)+.06*(fbm3(u*.5,v*.5,w*.5,2)-.5);
 const e=.3*(1-Math.sqrt(Math.max(0,1-((g-.5)/.5)**2)));// Fuß der Zunge rund: an den Seiten steigt die Kante
 if(f>.82||f<e)k*=.4;else if(f<e+.13)k*=1.2;else k*=(1.06-.18*f)*(1.08-.16*g);// Licht von links oben je Ziegel
 if(fbm3(u*.2+3,v*.3,1,3)>.66&&Math.abs(v)>12)return {k:k*.95,ramp:GREEN};// etwas Moos zur Traufe hin
 const r=hash3(tab,row,9);return {k,ramp:r<.18?R('#843c28'):r>.86?R('#b0583a'):undefined};},{spec:.14,shine:10});
const cardMat=custom('pappe',CARD,(u,v,w,n)=>{
 const sheet=u<-18?0:u<0?1:u<18?2:3;
 let k=[1.1,1.03,1.14,1.06][sheet]*(.95+.08*fbm3(u*.4,v*.4,w*.4,3));
 if(n&&n[2]>.6)k*=.84+.2*Math.sin(u*9);else k*=1+.035*Math.sin(u*5.2);// Schnittkante zeigt die Wellen
 if(w<ZB+4.2&&fbm3(u*.2,7,w*.25,3)>.56)k*=.84;// Wasserränder unten
 // „Oben“-Pfeile (↑↑) auf der zweiten Zacke – Umzugskarton
 const zs=ZP+2.2;for(const ax of [MC[1]-1.1,MC[1]+1.1]){if(Math.abs(u-ax)<.28&&w>zs+.4&&w<zs+2.4)return {k:.9,ramp:R('#2e2a2a')};
  if(w>=zs+2.1&&w<zs+3.5&&Math.abs(u-ax)<(zs+3.5-w)*.7)return {k:.9,ramp:R('#2e2a2a')};}
 if(Math.abs(w-zs)<.22&&Math.abs(u-MC[1])<2.1)return {k:.9,ramp:R('#2e2a2a')};
 return {k};},{spec:.03,shine:4});
/** Papprohr (Schalrohr) mit Spiralnaht und mit Filzstift aufgemalten Steinfugen – Big Bs Turmmauerwerk. */
const tubeMat=cx=>custom('papprohr','#a8865a',(u,v,w)=>{const a=Math.atan2(v-TY,u-cx)/TAU+.5,z=w-TZ0,row=Math.floor(z/2.5),fz=z/2.5-row;
 let k=.98+.08*fbm3(u*.5,v*.5,w*.5,2);if(((a*1+z/9)%1+1)%1<.02)k*=.72;// Spiralnaht
 if(fz<.1)return {k:.85,ramp:R('#3a2e28')};const fa=(a*12+(row&1)*.5)%1;if(fa<.035)return {k:.85,ramp:R('#3a2e28')};
 return {k};},{spec:.04,shine:5});
const coneMat=custom('pappe','#c4a676',(u,v,w)=>{let k=1.02+.08*fbm3(u*.5,v*.5,w*.5,2);const a=Math.atan2(v-TY,Math.abs(u)-TX);if(Math.abs(a-2.2)<.06)k*=.7;// Klebenaht
 return {k};},{spec:.04,shine:5});
const tape=custom('klebeband','#b4b6b0',(u,v,w)=>({k:.92+.2*fbm3(u*1.5,v*1.5,w*1.5,2)}),{spec:.6,shine:26});
/** Klebestreifen quer über eine Fuge: kurzer, leicht schräger Streifen vor der Pappe (Mitte cx/cz, Länge len, Winkel ang). */
const tapeStrip=(cx,cz,len,ang)=>posed(pose(cx,YC,cz,ang),cuboid(-len/2,len/2,-.42,.42,-.5,.5,.05));
const J=(i,k)=>(hash3(i,k,23)-.5)*.7;
/** Kegel um die z-Achse (Spitzhelm): Radius R bei z0, Spitze bei z1. */
const cone=(R0,z0,z1)=>{const k=R0/(z1-z0),c=1/Math.hypot(1,k);return (x,y,z)=>Math.max((Math.hypot(x,y)-k*(z1-z))*c,z0-z,z-z1);};
/** Umriss der Pappe zwischen den Türmchen: Brüstung mit vier Zacken, Kanten leicht schief geschnitten. Die vierte Zacke ist an
 * der Brüstungskante geknickt: sie fehlt im Bogen und steht als eigenes Teil schief (garage()). */
function cardPoly(){const xe=TX-TR+.6,p=[[-xe,ZB],[xe,ZB],[xe,ZP+J(9,0)*.4]];
 for(let m=3;m>=0;m--){const c=MC[m],xr=c+HW,xl=c-HW;
  p.push([xr,ZP+J(m,0)*.4]);if(m!==3)p.push([xr,ZM+J(m,1)],[xl,ZM+J(m,2)]);p.push([xl,ZP+J(m,3)*.4]);}
 p.push([-xe,ZP+J(9,1)*.4]);return p;}
function garage(){
 const openL=cuboid(-43,-5,YG-.8,YF+3,-1,GH),openR=cuboid(5,43,YG-.8,YF+3,-1,GH),cave=cuboid(5.2,42.8,-12,YF+3,-1,9);
 const km=MC[3],flapPoly=[[km-HW,ZP-.9],[km+HW,ZP-.9],[km+HW,ZM+J(3,1)],[km-HW,ZM+J(3,2)]];
 // Knick: die Zacke kippt um ihren rechten Fußpunkt nach links und etwas nach vorn
 const KB=[km+HW,YC,ZP],P1=hingeP(KB,[KB[0],KB[1]+1,KB[2]],-.27),P2=hingeP(KB,[KB[0]+1,KB[1],KB[2]],-.12);
 const FP=(x,y,z)=>{const q=P2(x,y,z);return P1(q[0],q[1],q[2]);};
 const bulb=ellipsoid(.5,.4,.5),BY=YF+.72,pennant=extrudeXZ([[-43.6,72.0],[-43.6,68.6],[-35.8,70.4]],.16,.05);
 const bulbs=union(at(0,BY,29.6,repeatX(3.4,15,bulb)),at(0,BY,23.95,repeatX(3.4,15,bulb)),mirrorX(at(24.7,BY,26.8,bulb)));
 const signWood=custom('holz','#3e2a1c',(u,v,w)=>{const k=.9+.1*Math.sin(w*5+3*fbm3(u*.08,v,w*.4,3));return rectEdge(u,w,-22.4,25.4,22.4,28.1)<.14?{k:1.05,ramp:R('#b8892e')}:{k};},{spec:.12,shine:8});
 // Satellitenschüssel auf dem Dach (Wirklichkeit), nach Süden gekippt
 const DC=[31,5,41.8],DP=hingeP(DC,[DC[0]+1,DC[1],DC[2]],.55);
 // Rechter Spitzhelm leicht schief (von Hand gerollt)
 const HP=hingeP([TX,TY,TZ1],[TX,TY+1,TZ1],-.09);
 const pot=(x0)=>(x,y,z)=>{const X=x-x0,Y=y-20.85,r=1.1+.16*clamp(z,0,2.8),c=.99;return Math.max((Math.hypot(X,Y)-r)*c,-z,z-2.8);};
 const bush=(x0)=>(x,y,z)=>(Math.hypot(x-x0,(y-20.9)*1.05,z-4.6)-1.8+.35*(noise3(x*1.7,y*1.7,z*1.7)-.5))*.8;
 const solids=[
  // Baukörper mit Toröffnungen; hinter dem halb offenen rechten Tor ein Hohlraum
  {f:subtract(cuboid(-48,48,-20,YF,0,ZW,.15),openL,openR,cave),mat:plasterG,group:'wand'},
  {f:union(cuboid(-48.4,-43,YF-.5,YF+.45,0,3.4,.15),cuboid(-5,5,YF-.5,YF+.45,0,3.4,.15),cuboid(43,48.4,YF-.5,YF+.45,0,3.4,.15)),mat:rubble,group:'sockel'},
  {f:cuboid(5.2,42.8,-12,YF,-.08,0),mat:custom('innen','#1e1c24',(u,v)=>({k:.3+.35*clamp((v-12)/8,0,1)}),{spec:0,shine:2}),group:'innen',noShadow:true},
  // Tore in Holzdekor mit Kassetten: links geschlossen, rechts um 9 E hochgefahren
  {f:union(cuboid(-42.9,-5.1,YG-.7,YG-.1,0,GH-.1,.1),intersect(cassettes(-42.9,0),cuboid(-42.9,-5.1,YG-1,YG+1,0,GH-.1))),mat:gateMat(-43,0),group:'torL'},
  {f:union(cuboid(5.1,42.9,YG-.7,YG-.1,9,GH-.1,.1),intersect(cassettes(5.1,9),cuboid(5.1,42.9,YG-1,YG+1,9,GH-.1))),mat:gateMat(5,9),group:'torR'},
  // Eckpfosten aus dunklem Holz (Fachwerk-Anmutung, Big B hübscht auf)
  {f:mirrorX(cuboid(47.2,48.15,YF-.2,YF+.4,3.3,30.6,.12)),mat:darkWoodZ,group:'eckpfosten'},
  // Zarge und Sturzbalken aus dunklem Holz
  {f:union(...[[-43,-5],[5,43]].map(([a,b])=>union(subtract(cuboid(a,b,YG,YG+.55,0,GH,.08),cuboid(a+.6,b-.6,YG-1,YG+1,-1,GH-.6)),cuboid(a-.7,b+.7,YF-.1,YF+.5,GH,GH+1.3,.15)))),mat:darkWood,group:'zarge'},
  {f:union(capsule([-25.3,YG+.55,4.2],[-22.7,YG+.55,4.2],.3),capsule([-25.1,YG,4.2],[-25.1,YG+.55,4.2],.2),capsule([-22.9,YG,4.2],[-22.9,YG+.55,4.2],.2),
   capsule([22.7,YG+.55,13.2],[25.3,YG+.55,13.2],.3),capsule([22.9,YG,13.2],[22.9,YG+.55,13.2],.2),capsule([25.1,YG,13.2],[25.1,YG+.55,13.2],.2)),mat:metal('#b08a3a',{shine:30,spec:.7}),group:'griff'},
  // Satteldach mit Schindeln, First, Traufbrett, Ortgang, Rinne
  {f:(x,y,z)=>{const ay=Math.abs(y),up=roofTop(y);return Math.max(Math.abs(x)-49.4,(z-up)*CP,(up-TH-z)*CP,ay-YE);},mat:shingles,group:'dach'},
  {f:at(0,0,roofTop(0)+.1,cylX(.75,-49.6,49.6,.2)),mat:custom('first','#6a3222',(u,v,w)=>({k:.9+.14*fbm3(u*.6,v,w,2)*(Math.abs(u%3.2)<.15?.7:1)}),{spec:.2,shine:12}),group:'first'},
  {f:cuboid(-49.7,49.7,YE-.05,YE+.45,30.5,32.2,.1),mat:darkWood,group:'traufe'},
  {f:(x,y,z)=>Math.max(Math.abs(x)-49.85,49.3-Math.abs(x),Math.abs((z-roofTop(y)-.25)*CP)-.55,Math.abs(y)-YE-.45),mat:darkWoodZ,group:'ortgang'},
  {f:at(0,YE+.95,30.8,cylX(.5,-49.7,49.7,.1)),mat:copper,group:'rinne'},
  // Pappzinnen: ein Bogen (aus mehreren Kartons) zwischen den Türmchen, die vierte Zacke abgeknickt (lehnt nach links vorn)
  {f:at(0,YC,0,extrudeXZ(cardPoly(),.3,.08)),mat:cardMat,group:'pappe'},
  {f:posed(FP,at(0,YC,0,extrudeXZ(flapPoly,.3,.08))),tex:FP,mat:cardMat,group:'klappe'},
  // Klebeband: je Fuge zwei kurze Streifen quer, auf der ersten Zacke ein Kreuz als Flicken, an der Knickstelle ein Streifen
  {f:union(...[-18,0,18].flatMap((x,i)=>[tapeStrip(x+J(i,5)*.6,ZB+5.4,3.2,J(i,6)*.3),tapeStrip(x+J(i,7)*.6,ZB+3.1,3.0,J(i,8)*.3)]),
   tapeStrip(MC[0],ZP+4.4,4.6,.7),tapeStrip(MC[0],ZP+4.4,4.6,-.7),tapeStrip(km+HW-.9,ZP+.3,3.0,-1.42)),mat:tape,group:'band'},
  // Türmchen: Papprohr mit aufgemalten Steinen, Spitzhelm aus Pappe (rechts schief), Klebebandring am Helmfuß
  {f:union(at(-TX,TY,0,cylZ(TR,TZ0,TZ1,.25))),mat:tubeMat(-TX),group:'turmL'},
  {f:union(at(TX,TY,0,cylZ(TR,TZ0,TZ1,.25))),mat:tubeMat(TX),group:'turmR'},
  {f:at(-TX,TY,TZ1-.2,cone(CR,0,CZ-TZ1)),mat:coneMat,group:'helmL'},
  {f:posed(HP,at(TX,TY,TZ1-.2,cone(CR,0,CZ-TZ1))),mat:coneMat,group:'helmR'},
  {f:union(at(-TX,TY,TZ1-.9,cylZ(TR+.12,0,.9)),at(TX,TY,TZ1-.9,cylZ(TR+.12,0,.9))),mat:tape,group:'helmband'},
  // Wimpel auf dem linken Helm
  {f:capsule([-TX,TY,CZ-1.2],[-TX,TY,72.4],.22),mat:wood('#b08a58',{axis:'z'}),group:'mast'},
  {f:(x,y,z)=>pennant(x,y-TY-.45*Math.sin((x+43.6)*.8),z)*.85,mat:painted('wimpel',(u,v,w)=>(w-70.3)>(u+43.6)*-.03?'#b8362a':'#d4a52a',{grain:.06}),group:'wimpel'},
  // Satellitenschüssel
  {f:union(at(DC[0],DC[1],0,cylZ(.3,roofTop(DC[1])-.5,DC[2]-.4)),posed(DP,union(at(DC[0],DC[1],DC[2],ellipsoid(2.3,.4,2.05)),capsule([DC[0],DC[1],DC[2]],[DC[0],DC[1]+2.2,DC[2]-.3],.15),
   at(DC[0],DC[1]+2.3,DC[2]-.3,box(.32,.32,.28,.1))))),mat:custom('kunststoff','#b8b6ac',(u,v,w)=>({k:.95+.08*fbm3(u*.6,v*.6,w*.6,2)}),{spec:.35,shine:20}),group:'schuessel'},
  // leeres Schild über den Toren: dunkles Holz, Goldrahmen, Glühbirnen
  {f:cuboid(-25,25,YF,YF+.55,23.6,30.0,.15),mat:signWood,group:'schild'},
  {f:subtract(cuboid(-25.35,25.35,YF,YF+.8,23.3,30.3,.2),cuboid(-23.9,23.9,YF-1,YF+2,24.6,28.9)),mat:gold,group:'schildrahmen'},
  {f:bulbs,mat:glow(['#7a5a1c','#c8922e','#f0c050','#fbe39a','#fff6d8']),glow:.82,group:'birnen',noShadow:true},
  // Kitschige Laterne am Mittelpfeiler (schwarz mit Gold), darunter zwei Buchskugeln in Terrakotta
  {f:union(cuboid(-.7,.7,YF-.2,YF+.35,15.6,19.3,.1),capsule([0,YF+.2,18.9],[0,YF+1.35,18.9],.2),
   subtract(cuboid(-1.25,1.25,YF+.55,YF+2.2,15.15,18.45,.1),cuboid(-.95,.95,YF+.4,YF+2.4,15.5,18.1),cuboid(-1.5,1.5,YF+.85,YF+1.9,15.5,18.1)),
   roundCone([0,YF+1.38,18.35],[0,YF+1.38,19.4],1.45,.25)),mat:metal('#26252a',{shine:24,spec:.5}),group:'lampe'},
  {f:union(at(0,YF+1.38,19.75,ellipsoid(.4,.4,.5)),at(0,YF+1.38,15.0,ellipsoid(.55,.55,.3))),mat:gold,group:'lampengold'},
  {f:cuboid(-1.05,1.05,YF+.7,YF+2.05,15.3,18.3,.1),mat:glow(['#5a4a2a','#9a7a3a','#d8b060','#f4d890','#fff0c8']),glow:.62,group:'glas'},
  {f:union(pot(-2.6),pot(2.6),at(-2.6,20.85,2.8,torusZ(1.58,.22)),at(2.6,20.85,2.8,torusZ(1.58,.22))),mat:custom('terrakotta','#b0603a',(u,v,w)=>({k:.92+.14*fbm3(u*.8,v*.8,w*.8,2)}),{spec:.1,shine:8}),group:'topf'},
  {f:union(bush(-2.6),bush(2.6)),mat:custom('buchs','#455e40',(u,v,w)=>({k:.8+.45*(noise3(u*2.2,v*2.2,w*2.2)-.5)+.1,ramp:GREEN}),{spec:.18,shine:10}),group:'buchs'},
  // Fallrohr an der rechten Ecke: von der Rinne, Schellen, Standrohr
  {f:union(at(46.8,YF+.9,0,cylZ(.62,2.4,30.4,.1)),capsule([46.8,YF+.9,30.2],[46.8,YE+.95,30.8],.55),at(46.8,YF+.85,0,cylZ(.78,0,3.0,.1))),mat:copper,group:'rohr'},
  {f:union(...[9,18,26].map(z=>at(46.8,YF+.9,z,torusZ(.66,.18)))),mat:nailIron,group:'schelle'},
 ];
 return {solids};}

export const MODELS={
 neonroehre:{frames:4,fps:6,height:3,build:neonroehre},
 ahnenbild:{height:12,build:()=>ahnenbild('locken','#8a3028')},
 'ahnenbild-zopf':{height:12,build:()=>ahnenbild('zopf','#3e6446')},
 'ahnenbild-toupet':{height:12,build:()=>ahnenbild('toupet','#3c4c7c')},
 fackel:{frames:6,fps:8,height:12,build:fackel},
 ordnerregal:{height:10,build:ordnerregal},
 'garage-schloss':{height:52,ss:1,build:garage},
};
