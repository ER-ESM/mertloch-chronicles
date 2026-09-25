// Sprite-Schmiede · Dungeon „Schloss Big B“: Wandschmuck der Räume und die Doppelgarage mit Pappzinnen (Eingang in der Welt).
// Leitidee „Schild und Wirklichkeit“: Der Hausherr nennt sich Freiherr und hat seine Doppelgarage mit Pappe zur Burg aufgehübscht.
// Wandschmuck: Rückseite an der Wand bei y=−1, Vorderseite bis etwa y=+1 (Regalbretter bis y≈+2,2), x ∈ ±w/2, z=0 = Unterkante.
//   Bildrand unten: ein Punkt (y,z) bleibt nur sichtbar, wenn y·0,7 − z ≤ 0,7 – vorragende Teile nicht in Bodennähe.
// Garage (Klasse aussen, 100×44, Höhe 52): Front nach Süden bei y=+20, Bildunterkante = Vorderkante der Standfläche (y=+22, z=0).
// Bildinhalte (Ahnenbilder, Schild) sind Farbzonen einer gemalten Textur: keine Schrift, keine Gesichter.
import {box,cylZ,capsule,roundCone,ellipsoid,torusZ,extrudeXZ,at,rotY,union,smoothUnion,subtract,mirrorX,repeatX,
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
const YF=20,ZW=31.4,GH=23.4,REC=1.2,YG=YF-REC;// Fassade, Wandhöhe, Torhöhe, Rücksprung der Tore, Torebene
const MC=[-42.4,-21.2,0,21.2,42.4],HW=5,ZB=32.3,ZP=37.4,ZM=44.4,YC=19.6;// Zinnen: Mitten, halbe Breite, Fuß, Brüstung, Zacke, Ebene
const CARD='#b69a6c';
/** Putz grau-beige: links etwas heller (Licht von links), Schmutzfahnen unter der Dachkante, Spritzwasser über dem Sockel. */
const plasterG=custom('putz','#a89c86',(u,v,w)=>{let k=.93+.14*fbm3(u*.14,v*.14,w*.14,4)+.05*(fbm3(u*.9,v*.9,w*.9,2)-.5);
 k*=1.05-.1*clamp((u+48)/96,0,1);
 if(w>ZW-10)k*=1-.24*smoothstep(.45,.62,fbm3(u*.45,3.1,w*.02,3))*smoothstep(ZW-10,ZW-1,w);
 if(w<5)k*=.9+.1*smoothstep(2.6,5,w);return {k};},{spec:.03,shine:4});
const sockelM=custom('beton','#6e6a62',(u,v,w)=>({k:.88+.2*fbm3(u*.5,v*.5,w*.5,3)}),{spec:.05,shine:6});
/** Sektionaltor: vier Felder à 5,85 E mit Fuge und Lichtkante, je eine Sicke in der Mitte, unten Schmutz. */
const gateMat=(x0,z0)=>custom('tor','#d4cebd',(u,v,w,n)=>{if(n&&n[1]<.5)return {k:.95};
 const zl=w-z0,f=zl-Math.floor(zl/5.85)*5.85;let k=1;
 if(f<.34)k=.5;else if(f<.66)k=1.12;else if(Math.abs(f-2.95)<.15)k=.8;else if(Math.abs(f-3.22)<.12)k=1.08;
 k*=(.96+.07*fbm3(u*.3,v*.3,w*.3,2))*(1.04-.08*clamp((u-x0)/38,0,1));if(zl<2.6)k*=.84+.16*zl/2.6;return {k};},{spec:.25,shine:18});
const cardMat=custom('pappe',CARD,(u,v,w,n)=>{
 const sheet=u<-31.8?0:u<-10.6?1:u<10.6?2:u<31.8?3:4;
 let k=[1,.93,1.05,.97,1.02][sheet]*(.95+.08*fbm3(u*.4,v*.4,w*.4,3));
 if(n&&n[2]>.6)k*=.84+.2*Math.sin(u*9);else k*=1+.035*Math.sin(u*5.2);// Schnittkante zeigt die Wellen
 if(w<35.5&&fbm3(u*.2,7,w*.25,3)>.56)k*=.84;// Wasserränder unten
 // „Oben“-Pfeile (↑↑) auf der zweiten Zacke – Umzugskarton
 for(const ax of [-22.3,-20.1]){if(Math.abs(u-ax)<.26&&w>39.6&&w<41.6)return {k:.9,ramp:R('#2e2a2a')};
  if(w>=41.3&&w<42.6&&Math.abs(u-ax)<(42.6-w)*.7)return {k:.9,ramp:R('#2e2a2a')};}
 if(Math.abs(w-39.2)<.2&&u>-23.2&&u<-19.2)return {k:.9,ramp:R('#2e2a2a')};
 return {k};},{spec:.03,shine:4});
const tape=custom('klebeband','#b4b6b0',(u,v,w)=>({k:.92+.2*fbm3(u*1.5,v*1.5,w*1.5,2)}),{spec:.6,shine:26});
/** Klebestreifen quer über eine Fuge: kurzer, leicht schräger Streifen vor der Pappe (Mitte cx/cz, Länge len, Winkel ang). */
const tapeStrip=(cx,cz,len,ang)=>posed(pose(cx,YC,cz,ang),cuboid(-len/2,len/2,-.42,.42,-.5,.5,.05));
const J=(i,k)=>(hash3(i,k,23)-.5)*.7;
/** Umriss der Pappe: Brüstung mit fünf Zacken, Kanten leicht schief geschnitten. Die vierte Zacke ist an der Brüstungskante
 * geknickt: sie fehlt im Bogen und steht als eigenes Teil schief (garage()). */
const KNICK=[26.2,ZP];
function cardPoly(){const p=[[-47.4,ZB],[47.4,ZB]];
 for(let m=4;m>=0;m--){const c=MC[m],xr=c+HW,xl=c-HW;
  if(m<4)p.push([xr,ZP+J(m,0)*.4]);
  if(m!==3)p.push([xr,ZM+J(m,1)],[xl,ZM+J(m,2)]);
  if(m>0)p.push([xl,ZP+J(m,3)*.4]);}
 return p;}
function garage(){
 const openL=cuboid(-43,-5,YG,YF+3,-1,GH),openR=cuboid(5,43,YG,YF+3,-1,GH),cave=cuboid(5.2,42.8,-12,YF+3,-1,9);
 const flapPoly=[[16.2,ZP-.9],[26.2,ZP-.9],[26.2,ZM+J(3,1)],[16.2,ZM+J(3,2)]];
 // Knick: die Zacke kippt um ihren rechten Fußpunkt nach links und etwas nach vorn
 const KB=[KNICK[0],YC,KNICK[1]],P1=hingeP(KB,[KB[0],KB[1]+1,KB[2]],-.27),P2=hingeP(KB,[KB[0]+1,KB[1],KB[2]],-.12);
 const FP=(x,y,z)=>{const q=P2(x,y,z);return P1(q[0],q[1],q[2]);};
 // Satellitenschüssel hinten rechts auf dem Dach (Wirklichkeit), nach Süden gekippt
 const DC=[33,-9,37.2],DP=hingeP(DC,[DC[0]+1,DC[1],DC[2]],.55);
 const bulb=ellipsoid(.52,.4,.52),BY=YF+.72,pennant=extrudeXZ([[1.9,66.9],[1.9,61.6],[13.4,64.1]],.16,.05);
 const bulbs=union(at(0,BY,30.25,repeatX(3.4,15,bulb)),at(0,BY,24.45,repeatX(3.4,15,bulb)),mirrorX(at(24.7,BY,27.35,bulb)));
 const signWood=custom('holz','#3e2a1c',(u,v,w)=>{const k=.9+.1*Math.sin(w*5+3*fbm3(u*.08,v,w*.4,3));return rectEdge(u,w,-22.4,25.85,22.4,28.85)<.14?{k:1.05,ramp:R('#b8892e')}:{k};},{spec:.12,shine:8});
 // Bitumenbahnen (Stöße quer), fleckig, wenig Moos an den Rändern, eine Pfütze
 const bitumen=custom('bitumen','#5e5e62',(u,v,w)=>{const strip=Math.floor((v+21)/9.5),f=(v+21)-strip*9.5;let k=(.9+.16*fbm3(u*.3,v*.3,w*.3,3))*(.95+.1*hash3(strip,3,7));if(f<.45)k*=.87;
  if((u>-38&&u<-27&&v>-15&&v<-9)||(u>6&&u<13&&v>2&&v<7))k*=.82;// Flicken
  if(Math.hypot((u-27)/7,(v+6)/3.2)<1+.15*fbm3(u*.4,v*.4,1,2))return {k:.8,ramp:R('#4a5460'),spec:.6};
  const edge=Math.min(48.7-Math.abs(u),20.7-Math.abs(v));if(edge<3&&fbm3(u*.3+5,v*.3,1,3)>.52)return {k:k*.95,ramp:R('#5d6a44')};return {k};},{spec:.12,shine:10});
 const solids=[
  // Baukörper mit Toröffnungen; hinter dem halb offenen rechten Tor ein Hohlraum
  {f:subtract(cuboid(-48,48,-20,YF,0,ZW,.15),openL,openR,cave),mat:plasterG,group:'wand'},
  {f:union(cuboid(-48.3,-43,YF-.5,YF+.35,0,2.6,.1),cuboid(-5,5,YF-.5,YF+.35,0,2.6,.1),cuboid(43,48.3,YF-.5,YF+.35,0,2.6,.1)),mat:sockelM,group:'sockel'},
  {f:cuboid(5.2,42.8,-12,YF,-.08,0),mat:custom('innen','#1e1c24',(u,v)=>({k:.3+.35*clamp((v-12)/8,0,1)}),{spec:0,shine:2}),group:'innen',noShadow:true},
  // Tore: links geschlossen, rechts um 9 E hochgefahren
  {f:cuboid(-42.9,-5.1,YG-.6,YG,0,GH-.1,.1),mat:gateMat(-43,0),group:'torL'},
  {f:cuboid(5.1,42.9,YG-.6,YG,9,GH-.1,.1),mat:gateMat(5,9),group:'torR'},
  {f:union(...[[-43,-5],[5,43]].map(([a,b])=>subtract(cuboid(a,b,YG,YG+.5,0,GH,.08),cuboid(a+.5,b-.5,YG-1,YG+1,-1,GH-.5)))),mat:metal('#5c5c60',{shine:20,spec:.4}),group:'zarge'},
  {f:union(capsule([-25.3,YG+.55,4.2],[-22.7,YG+.55,4.2],.3),capsule([-25.1,YG,4.2],[-25.1,YG+.55,4.2],.2),capsule([-22.9,YG,4.2],[-22.9,YG+.55,4.2],.2),
   capsule([22.7,YG+.55,13.2],[25.3,YG+.55,13.2],.3),capsule([22.9,YG,13.2],[22.9,YG+.55,13.2],.2),capsule([25.1,YG,13.2],[25.1,YG+.55,13.2],.2)),mat:metal('#2b2a2e',{shine:26,spec:.5}),group:'griff'},
  {f:union(at(-24,YG+.1,5.6,ellipsoid(.42,.2,.42)),at(24,YG+.1,14.6,ellipsoid(.42,.2,.42))),mat:metal('#c4c8cc',{shine:40,spec:.9}),group:'schloss'},
  // Flachdach mit Blechkante
  {f:cuboid(-48.9,48.9,-20.9,20.9,ZW-.2,ZW+1.2,.1),mat:bitumen,group:'dach'},
  {f:subtract(cuboid(-49.3,49.3,-21.3,21.3,ZW-.45,ZW+2.0,.12),cuboid(-48.75,48.75,-20.75,20.75,ZW,ZW+3)),mat:metal('#a4a8a6',{shine:30,spec:.6}),group:'blech'},
  // Pappzinnen: ein Bogen (aus mehreren Kartons), die vierte Zacke abgeknickt (lehnt nach links vorn)
  {f:at(0,YC,0,extrudeXZ(cardPoly(),.3,.08)),mat:cardMat,group:'pappe'},
  {f:posed(FP,at(0,YC,0,extrudeXZ(flapPoly,.3,.08))),tex:FP,mat:cardMat,group:'klappe'},
  // Klebeband: je Fuge zwei kurze Streifen quer, auf der ersten Zacke ein Kreuz als Flicken, an der Knickstelle ein Streifen
  {f:union(...[-31.8,-10.6,10.6,31.8].flatMap((x,i)=>[tapeStrip(x+J(i,5)*.6,36.3,3.2,J(i,6)*.3),tapeStrip(x+J(i,7)*.6,34.2,3.0,J(i,8)*.3)]),
   tapeStrip(-42.6,40.6,4.4,.7),tapeStrip(-42.6,40.6,4.4,-.7),tapeStrip(25.3,ZP+.3,3.0,-1.42)),mat:tape,group:'band'},
  // Satellitenschüssel und Entlüfter auf dem Dach
  {f:union(at(DC[0],DC[1],0,cylZ(.3,ZW+1,DC[2]-.4)),posed(DP,union(at(DC[0],DC[1],DC[2],ellipsoid(2.7,.42,2.4)),capsule([DC[0],DC[1],DC[2]],[DC[0],DC[1]+2.6,DC[2]-.3],.15),
   at(DC[0],DC[1]+2.7,DC[2]-.3,box(.35,.35,.3,.1))))),mat:custom('kunststoff','#b8b6ac',(u,v,w)=>({k:.95+.08*fbm3(u*.6,v*.6,w*.6,2)}),{spec:.35,shine:20}),group:'schuessel'},
  {f:union(at(-31,-13,0,cylZ(.65,ZW+1,ZW+3.6,.15)),at(-31,-13,ZW+3.7,cylZ(1.05,-.3,.3,.15))),mat:metal('#8a8e8c',{shine:26,spec:.5}),group:'luefter'},
  // Fahnenmast (Besenstiel) an der mittleren Zacke, Wimpel rot-gelb
  // Fahnenmast hinter der mittleren Zacke, mit Klebeband an die Pappe gebunden; der Wimpel weht über der Dachhinterkante
  {f:union(capsule([1.6,YC-.75,33],[1.6,YC-.75,67.2],.32),at(1.6,YC-.75,67.7,ellipsoid(.55,.55,.55))),mat:wood('#b08a58',{axis:'z'}),group:'mast'},
  {f:union(cuboid(.8,2.4,YC-1.2,YC+.42,40.4,41.3,.06),cuboid(.8,2.4,YC-1.2,YC+.42,42.6,43.5,.06)),mat:tape,group:'mastband'},
  {f:(x,y,z)=>pennant(x,y-(YC-.75)-.5*Math.sin((x-1.9)*.7),z)*.85,
   mat:painted('wimpel',(u,v,w)=>(w-64.3)>(u-1.9)*-.02?'#b8362a':'#d4a52a',{grain:.06}),group:'wimpel'},
  // leeres Schild über den Toren: dunkles Holz, Goldrahmen, Glühbirnen
  {f:cuboid(-25,25,YF,YF+.55,24.1,30.6,.15),mat:signWood,group:'schild'},
  {f:subtract(cuboid(-25.35,25.35,YF,YF+.8,23.75,30.95,.2),cuboid(-23.9,23.9,YF-1,YF+2,25.2,29.4)),mat:gold,group:'schildrahmen'},
  {f:bulbs,mat:glow(['#7a5a1c','#c8922e','#f0c050','#fbe39a','#fff6d8']),glow:.82,group:'birnen',noShadow:true},
  // Außenleuchte am Mittelpfeiler (Baumarkt-Laterne)
  {f:union(cuboid(-.7,.7,YF-.2,YF+.35,15.6,19.3,.1),capsule([0,YF+.2,18.9],[0,YF+1.35,18.9],.2),
   subtract(cuboid(-1.25,1.25,YF+.55,YF+2.2,15.15,18.45,.1),cuboid(-.95,.95,YF+.4,YF+2.4,15.5,18.1),cuboid(-1.5,1.5,YF+.85,YF+1.9,15.5,18.1)),
   roundCone([0,YF+1.38,18.35],[0,YF+1.38,19.4],1.45,.25)),mat:metal('#26252a',{shine:24,spec:.5}),group:'lampe'},
  {f:cuboid(-1.05,1.05,YF+.7,YF+2.05,15.3,18.3,.1),mat:glow(['#5a4a2a','#9a7a3a','#d8b060','#f4d890','#fff0c8']),glow:.55,group:'glas'},
  // Fallrohr an der rechten Ecke: Kessel unter der Dachkante, Schellen, Standrohr
  {f:union(at(46.8,YF+.9,0,cylZ(.62,2.4,30.4,.1)),cuboid(45.9,47.7,YF+.1,YF+1.7,29.9,31.1,.15),at(46.8,YF+.85,0,cylZ(.78,0,3.0,.1))),mat:metal('#9ea3a2',{shine:30,spec:.6}),group:'rohr'},
  {f:union(...[9,18,26.5].map(z=>at(46.8,YF+.9,z,torusZ(.66,.18)))),mat:nailIron,group:'schelle'},
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
