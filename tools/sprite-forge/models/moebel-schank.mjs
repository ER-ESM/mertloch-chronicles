// Sprite-Schmiede · Gruppe „moebel-schank“: Stehtisch, Barhocker, Sofa, Kommode, Kühlschrank, Fass (Bierfass), Bierkästen.
// Vorbild: imagegen-Bogen assets/precision/sources/2026-09-23/kit-moebel-a.png – Maße aus content/sprite-kit.js gehen vor.
// Koordinaten: Standfläche mittig um (0,0), x Ost, y Süd (Vorderkante bei +h/2), z ab Boden, Einheit E (4 px je E).
// Keine Bildfolgen: nichts in dieser Gruppe hat einen Grund zu leben (kein Feuer, kein Licht, keine Flüssigkeit in Bewegung).
import {box,cylZ,capsule,roundCone,ellipsoid,at,rotZ,rotY,union,smoothUnion,subtract,
 mirrorX,mirrorY,repeatX,repeatY,fbm3,clamp,smoothstep} from '../sdf.mjs';
import {wood,metal,ceramic,glass,paper,fabric,custom,rampFrom} from '../materials.mjs';

// ---------- Hilfsformen ----------
/** Elliptische Scheibe (rx × ry) von z0 bis z1 mit gerundeter Kante r. */
const discZ=(rx,ry,z0,z1,r=0)=>(x,y,z)=>{const m=Math.min(rx,ry),d=(Math.hypot(x/rx,y/ry)-1)*m+r,dz=Math.abs(z-(z0+z1)/2)-(z1-z0)/2+r;
 return Math.min(Math.max(d,dz),0)+Math.hypot(Math.max(d,0),Math.max(dz,0))-r;};
/** Liegender Zylinder entlang y (Armlehnen-Rolle) mit Mittelpunkt (cx,·,cz), Länge y0..y1. */
const cylY=(rad,cx,cz,y0,y1,r=0)=>(x,y,z)=>{const d=Math.hypot(x-cx,z-cz)-rad+r,dy=Math.abs(y-(y0+y1)/2)-(y1-y0)/2+r;
 return Math.min(Math.max(d,dy),0)+Math.hypot(Math.max(d,0),Math.max(dy,0))-r;};
/** Quader über Eckpunkte (bequemer als Mitte + Halbmaße). */
const boxAt=(x0,x1,y0,y1,z0,z1,r=0)=>at((x0+x1)/2,(y0+y1)/2,(z0+z1)/2,box((x1-x0)/2,(y1-y0)/2,(z1-z0)/2,r));
/** Senkrechter Ring um die y-Achse (Tassenhenkel), Radius R, Stärke r. */
const ringY=(R,r)=>(x,y,z)=>Math.hypot(Math.hypot(x,z)-R,y)-r;
/** Drehkörper um die z-Achse aus einem Radiusprofil R(z) zwischen z0 und z1 (flache Steigungen, daher Faktor .9). */
const lathe=(R,z0,z1)=>(x,y,z)=>{const zz=clamp(z,z0,z1),d=(Math.hypot(x,y)-R(zz))*.9,dz=Math.abs(z-(z0+z1)/2)-(z1-z0)/2;
 return Math.min(Math.max(d,dz),0)+Math.hypot(Math.max(d,0),Math.max(dz,0));};
const TAU=Math.PI*2;
const gauss=(v,c,s)=>Math.exp(-(((v-c)/s)**2));

// ---------- Materialien ----------
const iron=metal('#34333a',{rust:.18,shine:20,spec:.4});
const brass=metal('#8a6a36',{shine:30,spec:.7});
const chrome=metal('#8e959c',{shine:44,spec:.9});
const bottleGreen=glass('#2e5a3a'),bottleBrown=glass('#5a3a1c');
const labelPaper=paper('#d8c49a'),capRed=metal('#a8322a',{shine:30,spec:.6}),capGold=metal('#b08a3a',{shine:30,spec:.6});
const mugWhite=ceramic('#e6e0d0'),ashTin=metal('#8a8f94',{shine:30,spec:.6});

/** Abgewetztes Sofa-Leder (olivgrün) mit hellen, aufgeriebenen Flecken und dunklen Knitterfalten. */
const worn=rampFrom('#a88a55');
// Abgeriebene Stellen gezielt wie im Vorbild: rechtes Rückenkissen, rechtes Sitzkissen, linke Sitzkante, rechte Armlehne.
const WORN_SPOTS=[[10.5,-2.6,11,3.4],[8.5,3,7.8,3.2],[-5,7,5.5,2.4],[18.2,4,9.5,2.2]];
const sofaHide=custom('sofaleder','#5a5f38',(u,v,w)=>{const n=fbm3(u*.16+3,v*.16,w*.16,4),g=fbm3(u*.55,v*.55,w*.55,3);
 let m=0;for(const [x,y,z,r] of WORN_SPOTS)m=Math.max(m,1-Math.hypot(u-x,v-y,w-z)/r);
 const e=fbm3(u*.45+11,v*.45,w*.45,3);
 if(m+.7*(e-.5)>.34||n>.64)return {k:.9+.18*g,ramp:worn,spec:.05};return {k:(n<.3?.8:.88)+.3*(g-.5)+.1};},{spec:.22,shine:16});
/** Rote Wolldecke mit Rautenmuster (Rauten ≥ 2 E, damit sie im Spiel lesbar bleiben). */
const blanketRed=rampFrom('#9c2c22'),blanketGold=rampFrom('#d08a3a'),blanketDark=rampFrom('#4a1c1a');
const blanket=custom('decke','#9c2c22',(u,v,w)=>{const s=w-v*.6,px=Math.abs(((u*.55)%2+2)%2-1),pz=Math.abs(((s*.55)%2+2)%2-1),p=px+pz;
 if(p<.34)return {k:1,ramp:blanketGold};if(p>.78&&p<1.02)return {k:.95,ramp:blanketDark};return {k:.9+.1*fbm3(u*.8,v*.8,w*.8,2),ramp:blanketRed};},{spec:.03,shine:4});
const fringe=fabric('#d6c49a',{fuzz:.05});
/** Emaille des alten Kühlschranks: warmweiß, Rostflecken an Kanten und unten. */
const rust=rampFrom('#8e5a2e');
const enamel=custom('emaille','#dcdcd2',(u,v,w)=>{const n=fbm3(u*.32+7,v*.32,w*.32,4),g=fbm3(u*1.3,v*1.3,w*1.3,2),
  edge=.16*smoothstep(4.3,5.6,Math.abs(u))+(w<3.6?.14:0)+(w>26.6?.1:0);
 if(n+edge>.76)return {k:.88+.2*g,ramp:rust,spec:.06};return {k:.95+.06*g};},{spec:.5,shine:30});
/** Häkeldeckchen: Ringe und Löcher, damit es nicht wie ein Teller aussieht. */
const doilyMat=custom('spitze','#e8dcc0',(u,v)=>{const r=Math.hypot(u/1.45,v),a=Math.atan2(v,u);const ring=Math.abs(((r*1.25)%1)-.5),hole=Math.cos(a*14+r*1.3);
 return {k:ring<.17||hole>.72?.5:1};},{spec:.02,shine:4});
const clay=custom('ton','#a4552e',(u,v,w)=>({k:.92+.1*fbm3(u*.5,v*.5,w*.5,2)}),{spec:.08,shine:6});
const leaf=custom('blatt','#4f8a32',(u,v,w)=>({k:.9+.15*fbm3(u*.9,v*.9,w*.9,2)}),{spec:.35,shine:18});
const crateGreen=custom('kunststoff','#3a6e3a',(u,v,w)=>({k:.93+.1*fbm3(u*.35,v*.35,w*.35,3)-(fbm3(u*1.4,v*1.4,w*1.4,2)>.76?.1:0)}),{spec:.3,shine:20});
const kegSteel=metal('#a2a4a0',{rust:.05,shine:34,spec:.75});

// ---------- Bausteine ----------
/** Bierflasche (grün, Etikett, Kronkorken) auf der Fläche z0 an (x,y). */
function bottle(x,y,z0,{mat=bottleGreen,cap=capGold,group='flasche'}={}){
 return [
  {f:at(x,y,0,union(cylZ(.72,z0,z0+2.5,.2),roundCone([0,0,z0+2.4],[0,0,z0+3.4],.66,.34),cylZ(.36,z0+3.1,z0+4.6,.1))),mat,group,b:[x,y,z0+2.4,3]},
  {f:at(x,y,0,cylZ(.76,z0+.8,z0+1.9,.05)),mat:labelPaper,group:group+'-etikett',b:[x,y,z0+1.3,1.5]},
  {f:at(x,y,0,cylZ(.42,z0+4.5,z0+4.95,.1)),mat:cap,group,b:[x,y,z0+4.7,1]},
 ];}

export const MODELS={
 // Stehtisch: runde Holzplatte auf Gusseisensäule mit Tellerfuß, darauf Flasche, Krug und Blechascher.
 stehtisch:{height:16,build(){const top=wood('#7a5230',{axis:'x',planks:3.4}),Z=16;
  return {solids:[
   {f:discZ(6.55,5.6,15,Z,.35),mat:top,group:'platte'},
   {f:union(cylZ(2.3,14.2,15,.25),cylZ(.95,1,14.4,.2)),mat:iron,group:'saeule'},
   {f:union(discZ(4.6,4.4,0,.9,.35),cylZ(1.6,.6,1.9,.35),mirrorX(mirrorY(at(2.35,2.35,.9,ellipsoid(.45,.45,.35))))),mat:iron,group:'fuss'},
   ...bottle(-2.4,-1.8,Z),
   // Krug: Becher mit Henkel rechts, innen dunkel
   {f:subtract(union(cylZ(1.05,Z,Z+1.9,.2),at(1.12,.6,Z+1,ringY(.6,.24))),cylZ(.78,Z+.35,Z+3)),mat:mugWhite,group:'krug',b:[1.3,.6,Z+1,2.2]},
   // Blechascher
   {f:at(-2.9,1.9,0,subtract(cylZ(.9,Z,Z+.45,.12),cylZ(.62,Z+.18,Z+1))),mat:ashTin,group:'ascher',b:[-2.9,1.9,Z+.3,1.2]},
  ]};}},

 // Barhocker: runder Sitz mit Brettfuge, vier gespreizte Beine, Sprossenkranz unten, Querstreben vorn/hinten oben.
 barhocker:{height:12,build(){const seat=wood('#80552b',{axis:'x',planks:2.7}),leg=wood('#6a4526',{axis:'z'});
  const at1=z=>1.75+.55*(11.3-z)/11;// Beinabstand zur Mitte auf Höhe z
  const a=at1(3.8),b=at1(7.4);
  return {solids:[
   {f:cylZ(2.62,11.1,12,.3),mat:seat,group:'sitz'},
   {f:cylZ(2,10.3,11.2,.15),mat:leg,group:'zarge'},
   {f:mirrorX(mirrorY(capsule([1.75,1.75,11],[2.3,2.3,.4],.4))),mat:leg,group:'beine'},
   {f:union(mirrorY(capsule([-a,a,3.8],[a,a,3.8],.28)),mirrorX(capsule([a,-a,3.8],[a,a,3.8],.28)),mirrorY(capsule([-b,b,7.4],[b,b,7.4],.26))),mat:leg,group:'sprossen'},
  ]};}},

 // Durchgesessenes Sofa: olivgrünes Leder mit abgeriebenen Stellen, Rollarmlehnen, zwei durchgesackte Sitzkissen,
 // rote Rautendecke über der linken Lehne mit heller Franse.
 sofa:{height:14,build(){const foot=wood('#4a3020',{axis:'z'});
  // Sitzkissen sacken in der Mitte ein (Verformung klein genug für das Distanzfeld)
  const sag=(cx,f)=>(x,y,z)=>f(x,y,z+.75*gauss(x,cx,4.5)*gauss(y,1.8,3.2));
  const backPart=union(boxAt(-19.3,19.3,-7.7,-4.4,1.2,13.6,1.3));
  const backCush=union(boxAt(-16.5,-.15,-5.6,-2.5,6.8,13,1.3),boxAt(.15,16.5,-5.6,-2.5,6.8,13,1.3));
  const drapeBase=union(backPart,backCush);
  // Decke: Haut von 0,45 E um Lehne und Rückenkissen, begrenzt auf einen Streifen links, Saum gewellt
  const drape=(x,y,z)=>{const d=drapeBase(x,y,z),skin=Math.max(d-.45,-d),hem=8.6+.45*Math.sin(x*1.9);
   return Math.max(skin,Math.abs(x+12.9)-3,hem-z,-7.3-y);};
  return {solids:[
   {f:mirrorX(mirrorY(at(17.6,5.6,0,cylZ(.8,0,1.6,.25)))),mat:foot,group:'fuesse'},
   {f:boxAt(-19,19,-7.4,7.3,1.2,5.4,.9),mat:sofaHide,group:'sockel'},
   {f:backPart,mat:sofaHide,group:'lehne'},
   {f:mirrorX(smoothUnion(.6,boxAt(16.6,19.4,-7.4,7.3,1.2,8.6,.9),cylY(1.55,17.95,8.7,-7.3,7.35,.7))),mat:sofaHide,group:'arm'},
   {f:mirrorX(union(cylY(1.85,17.95,8.6,6.8,7.5,.35),boxAt(16.3,19.5,6.8,7.5,1.3,8.6,.35))),mat:sofaHide,group:'armstirn'},
   {f:sag(-8.3,boxAt(-16.5,-.15,-4.6,7.2,4.9,7.9,1.25)),mat:sofaHide,group:'kissen-l'},
   {f:sag(8.3,boxAt(.15,16.5,-4.6,7.2,4.9,7.9,1.25)),mat:sofaHide,group:'kissen-r'},
   {f:boxAt(-16.5,-.15,-5.6,-2.5,6.8,13,1.3),mat:sofaHide,group:'ruecken-l'},
   {f:boxAt(.15,16.5,-5.6,-2.5,6.8,13,1.3),mat:sofaHide,group:'ruecken-r'},
   {f:drape,mat:blanket,group:'decke',tex:(x,y,z)=>[x,y,z]},
   {f:(x,y,z)=>{const xx=x+12.9;if(Math.abs(xx)>3.2)return Math.abs(xx)-3+.2;return repeatX(.75,8,capsule([0,-2.05,8.8],[0,-1.9,7.5],.24))(xx,y,z);},mat:fringe,group:'franse',b:[-12.9,-2,8.2,4]},
  ]};}},

 // Kommode: breites, niedriges Holzmöbel, oben zwei kleine, darunter zwei große Schubladen mit Messingknäufen,
 // obendrauf Häkeldeckchen und Topfpflanze.
 kommode:{height:14,extraTop:6,build(){const body=wood('#5c3f28',{axis:'z'}),top=wood('#74502f',{axis:'x',planks:3.3}),front=wood('#86603a',{axis:'x'});
  const F=4.0;// Vorderfläche des Korpus
  const drawers=[[-12.6,-.25,10.2,12.4],[.25,12.6,10.2,12.4],[-12.6,12.6,6.2,9.6],[-12.6,12.6,2.1,5.6]];
  const openings=union(...drawers.map(([a,b,c,d])=>boxAt(a-.22,b+.22,F-1.6,F+1,c-.22,d+.22)));
  const knobs=[[-6.4,11.3],[6.4,11.3],[-6.8,7.9],[6.8,7.9],[-6.8,3.85],[6.8,3.85]];
  const px=9.2,py=-1.2;// Topfpflanze
  // Blatt: spitzes Ellipsoid, radial nach außen gedreht, Spitze angehoben (tilt); zwei Kränze für Innenlinien zwischen den Blättern
  const leafAt=(a,rad,z,tilt,len)=>at(px+Math.cos(a)*rad,py+Math.sin(a)*rad*.85,z,rotZ(a,rotY(-tilt,ellipsoid(len,.85,.3))));
  const leavesA=union(...[0,1,2,3,4,5,6].map(i=>leafAt(i*TAU/7+.2,1.5,17.1+.3*(i%2),.5,1.6)));
  const leavesB=union(...[0,1,2,3,4].map(i=>leafAt(i*TAU/5+.6,.8,18+.25*(i%2),.85,1.35)));
  return {solids:[
   {f:subtract(boxAt(-13.3,13.3,-4.6,F,1.1,13.1,.25),openings),mat:body,group:'korpus'},
   {f:boxAt(-13.7,13.7,-4.9,4.55,13,14,.3),mat:top,group:'platte'},
   {f:mirrorX(union(at(12.6,3.3,0,cylZ(.8,0,1.4,.3)),at(12.6,-3.9,0,cylZ(.8,0,1.4,.3)))),mat:body,group:'fuesse'},
   ...drawers.map(([a,b,c,d],i)=>({f:boxAt(a,b,F-1.4,F+.35,c,d,.28),mat:front,group:'lade'+i})),
   {f:union(...knobs.map(([x,z])=>at(x,F+.52,z,ellipsoid(.48,.4,.48)))),mat:brass,group:'knauf'},
   {f:(x,y,z)=>{const xx=x+3.8,yy=y-.2,a=Math.atan2(yy,xx/1.45),r=Math.hypot(xx/1.45,yy)-3.2*(1+.05*Math.sin(a*14));return Math.max(r,Math.abs(z-14.08)-.08);},
    mat:doilyMat,group:'deckchen',tex:(x,y,z)=>[x+3.8,y-.2,z]},
   {f:subtract(union(at(px,py,0,(x,y,z)=>{const r=1.15+.17*(z-14);return Math.max((Math.hypot(x,y)-r)*.98,Math.abs(z-15.1)-1.1);}),at(px,py,16.15,(x,y,z)=>Math.hypot(Math.hypot(x,y)-1.4,z)-.28)),at(px,py,16.4,cylZ(1.2,-.2,1))),mat:clay,group:'topf'},
   {f:leavesA,mat:leaf,group:'blaetter-a',b:[px,py,17.5,4]},
   {f:leavesB,mat:leaf,group:'blaetter-b',b:[px,py,18.5,3]},
  ]};}},

 // Kühlschrank: alter, runder Emaille-Kühlschrank mit Gefrierfach oben, Chromgriffen links und Rost an den Kanten.
 // Die Standfläche ist 22 E tief; der Korpus (12 E tief) steht vorn bündig, damit der Anker (Vorderkante) stimmt.
 kuehlschrank:{height:28,build(){const B=9.3;// Vorderfläche des Korpus
  return {solids:[
   {f:mirrorX(union(at(4.6,B-1.1,0,cylZ(.55,0,1.2,.15)),at(4.6,B-10.9,0,cylZ(.55,0,1.2,.15)))),mat:iron,group:'fuesse'},
   {f:subtract(boxAt(-5.65,5.65,B-12,B,.9,27.8,1.5),boxAt(-7,7,B-.9,B+1,19.35,19.95)),mat:enamel,group:'korpus'},
   {f:boxAt(-5.4,5.4,B-.4,B+.55,2.1,19.3,.75),mat:enamel,group:'tuer-unten'},
   {f:boxAt(-5.4,5.4,B-.4,B+.55,20.0,27.1,.75),mat:enamel,group:'tuer-oben'},
   {f:subtract(boxAt(-4.9,4.9,B-.6,B+.35,1.05,1.95,.15),repeatX(1.2,7,boxAt(-.25,.25,B+.1,B+1,1.3,1.7))),mat:iron,group:'gitter'},
   {f:union(capsule([-4.25,B+1.05,15.9],[-4.25,B+1.05,11.9],.36),capsule([-4.25,B+.3,15.6],[-4.25,B+1.05,15.6],.25),capsule([-4.25,B+.3,12.2],[-4.25,B+1.05,12.2],.25),
     capsule([-4.25,B+1.05,25],[-4.25,B+1.05,22.6],.36),capsule([-4.25,B+.3,24.7],[-4.25,B+1.05,24.7],.25),capsule([-4.25,B+.3,22.9],[-4.25,B+1.05,22.9],.25)),mat:chrome,group:'griffe'},
  ]};}},

 // Fass: leeres Stahl-Bierfass (Keg) mit Rollringen, Griffausschnitten im oberen Rand und Zapfkopf-Ventil in der Mitte.
 fass:{height:14,build(){
  const R=z=>4.05+.14*Math.sin(Math.PI*clamp((z-1.2)/11,0,1))+.34*gauss(z,4.4,.5)+.34*gauss(z,9.3,.5)+.18*gauss(z,.6,.35)-.25*gauss(z,1.25,.25);
  const body=lathe(R,0,12.6);
  const chime=subtract(cylZ(4.12,12.2,13.9,.3),cylZ(3.55,12,15),mirrorY(at(0,3.9,13.1,box(1.9,1.2,.55,.4))));
  return {solids:[
   {f:subtract(body,at(0,0,12.9,ellipsoid(3.4,3.4,.7))),mat:kegSteel,group:'fass'},
   {f:chime,mat:kegSteel,group:'rand'},
   {f:subtract(union(cylZ(1.15,12,13.05,.25),cylZ(.6,12.9,13.3,.1)),cylZ(.38,13,14)),mat:iron,group:'ventil'},
  ]};}},

 // Bierkästen: zwei grüne Kunststoffkästen gestapelt, oben volle Flaschen mit roten Kronkorken,
 // durch die Fenster des unteren Kastens sieht man die Etiketten.
 'kisten-stapel':{height:20,build(){
  const crate=z0=>subtract(at(0,0,z0+4.9,box(6.6,5.4,4.9,.35)),at(0,0,z0+10,box(6.05,4.85,9.2,.2)),
   mirrorY(at(0,5.4,z0+4.3,box(4.7,1,2.05,.45))),mirrorX(at(6.6,0,z0+4.3,box(1,3.4,2.05,.45))),
   mirrorY(at(0,5.4,z0+8.1,box(2.1,1,.55,.45))));
  const rows=(z0,top)=>repeatX(3,4,repeatY(3.1,3,union(cylZ(1.12,z0+.8,z0+6.6,.3),roundCone([0,0,z0+6.4],[0,0,z0+8],1.02,.5),cylZ(.5,z0+7.6,z0+top,.15))));
  const labels=z0=>repeatX(3,4,repeatY(3.1,3,cylZ(1.16,z0+2.6,z0+4.6,.05)));
  const caps=z0=>repeatX(3,4,repeatY(3.1,3,cylZ(.62,z0+10.3,z0+10.95,.15)));
  const Z2=10.05;
  return {solids:[
   {f:crate(0),mat:crateGreen,group:'kasten-unten'},
   {f:rows(0,9.4),mat:bottleBrown,group:'flaschen-unten'},
   {f:labels(0),mat:labelPaper,group:'etiketten-unten'},
   {f:crate(Z2),mat:crateGreen,group:'kasten-oben'},
   {f:rows(Z2,10.4),mat:bottleBrown,group:'flaschen-oben'},
   {f:labels(Z2),mat:labelPaper,group:'etiketten-oben'},
   {f:caps(Z2),mat:capRed,group:'korken'},
  ]};}},
};
