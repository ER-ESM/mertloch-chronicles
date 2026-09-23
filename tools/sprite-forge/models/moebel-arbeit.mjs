// Sprite-Schmiede · Gruppe „moebel-arbeit“: Truhe, Schreibtisch, Aktenschrank, Etagenbett, Sackkarre, Schutthaufen,
// Eimer, Küchenzeile, Kloschüssel, Waschbecken. Vorbild: assets/precision/sources/2026-09-23/kit-moebel-b.png.
// Koordinaten: Standfläche mittig um (0,0), x Ost, y Süd (Vorderkante bei +h/2), z ab Boden. Maße aus content/sprite-kit.js.
// Einzige Bildfolge: der tropfende Wasserhahn der Küchenzeile (Flüssigkeit = Grund für Bewegung, Anti-Slop-Regel 9).
import {block,box,cylZ,capsule,at,union,subtract,intersect,mirrorX,mirrorY,ellipsoid,torusZ,rotX,rotY,rotZ,smoothUnion,fbm3,clamp,mix} from '../sdf.mjs';
import {wood,metal,stone,plaster,fabric,ceramic,glass,paper,plastic,custom,rampFrom,glow} from '../materials.mjs';

const PI=Math.PI;
// ---------- Hilfsfunktionen (nur für diese Gruppe) ----------
/** Quader mit Mittelpunkt und Halbmaßen. */
const hb=(cx,cy,cz,hx,hy,hz,r=0)=>at(cx,cy,cz,box(hx,hy,hz,r));
/** Waagerechter Zylinder entlang x von x0 bis x1 (Achse bei y,z = 0). */
const cylX=(rad,x0,x1,r=0)=>rotY(PI/2,cylZ(rad,x0,x1,r));
/** Waagerechter Zylinder entlang y von y0 bis y1. */
const cylY=(rad,y0,y1,r=0)=>rotX(PI/2,cylZ(rad,-y1,-y0,r));
/** Ring in der yz-Ebene (Achse x) – Räder. */
const torusX=(R,r)=>rotY(PI/2,torusZ(R,r));
/** Ring in der xz-Ebene (Achse y) – Henkel, Bügel. */
const torusY=(R,r)=>rotX(PI/2,torusZ(R,r));
/** Kegelstumpf um die z-Achse: Radius r0 bei z0, r1 bei z1 (Eimer, Flaschen). */
const taper=(r0,r1,z0,z1,rr=0)=>(x,y,z)=>{const k=(r1-r0)/(z1-z0),r=r0+k*clamp(z-z0,0,z1-z0),c=1/Math.hypot(1,k);
 const dr=(Math.hypot(x,y)-r+rr)*c,dz=Math.abs(z-(z0+z1)/2)-(z1-z0)/2+rr;return Math.min(Math.max(dr,dz),0)+Math.hypot(Math.max(dr,0),Math.max(dz,0))-rr;};
/** Balken als gedrehter Quader von Punkt a nach b: Halbbreite hw (waagerecht quer), Halbhöhe hh. */
function beam(a,b,hw,hh,r=.15){const d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(...d),u=d.map(v=>v/L);
 let s=[u[1],-u[0],0];const sl=Math.hypot(...s)||1;s=s.map(v=>v/sl);const w=[s[1]*u[2]-s[2]*u[1],s[2]*u[0]-s[0]*u[2],s[0]*u[1]-s[1]*u[0]];
 const c=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],q=box(L/2,hw,hh,r);
 return (x,y,z)=>{const px=x-c[0],py=y-c[1],pz=z-c[2];return q(px*u[0]+py*u[1]+pz*u[2],px*s[0]+py*s[1]+pz*s[2],px*w[0]+py*w[1]+pz*w[2]);};}
/** Deterministischer Zufall (LCG) für Schuttbrocken – kein Math.random. */
function rng(seed){let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
/** Karo-Stoff (Bettdecken): Streifen quer (u) und längs (v+w), Kreuzungen dunkel; `light` = Grundton der hellen Felder. */
const gingham=(base,light,period=2.6)=>{const lr=light?rampFrom(light):null;
 return custom('decke',base,(u,v,w)=>{const band=a=>{const f=a/period-Math.floor(a/period);return f<.5;},a=band(u),b=band(v+w),fz=.95+.1*fbm3(u*.5,v*.5,w*.5,2);
  if(a&&b)return {k:.74*fz};if(a||b)return {k:.95*fz};return lr?{k:1.02*fz,ramp:lr}:{k:1.12*fz};},{spec:.03,shine:4});};
/** Bretter quer liegend auf senkrechten Flächen: Textur so drehen, dass die Brettfugen waagerecht laufen. */
const planksZ=(x,y,z)=>[x,z+.35,y];

/** Keramik mit dunklerer Innenseite (Becken, Schüssel): die Lichtrechnung allein lässt Mulden zu hell. */
const ceramicIn=(base,inside,dk=.74)=>custom('keramik',base,(u,v,w)=>({k:(.97+.05*fbm3(u*.3,v*.3,w*.3,2))*(inside(u,v,w)?dk:1)}),{spec:.6,shine:40});
/** Verzinktes Blech mit dunklerer Innenwand (Eimer). */
const zincIn=(base,inside,dk=.58)=>custom('metall',base,(u,v,w)=>({k:(.86+.26*fbm3(u*.9,v*.9,w*.9,3))*(inside(u,v,w)?dk:1)}),{spec:.6,shine:30});
/** Alle Körper einer Szene um die Hochachse drehen (Schrägansicht auf die Sackkarre). */
const turn=(a,solids)=>solids.map(q=>({...q,f:rotZ(a,q.f)}));

// Materialien, die mehrere Arten teilen
const chrome=metal('#c4c8cc',{shine:40,spec:.9}),darkIron=metal('#34333a',{rust:.3,shine:16,spec:.3});
const brass=metal('#b08a3a',{shine:30,spec:.7}),rubber=plastic('#2b2a2e');

export const MODELS={
 // ---------------------------------------------------------------- Truhe 14×10, Höhe 10
 truhe:{height:10,build(){const oak=wood('#6b4a2f',{axis:'x',planks:2.4,worn:.9}),lid=wood('#71502f',{axis:'x',planks:2.3,worn:.9});
  return {solids:[
   {f:block(6.4,4.4,.3,6.2,.2),mat:oak,tex:planksZ,group:'korpus'},
   {f:block(6.55,4.55,6.6,9.3,.55),mat:lid,group:'deckel'},
   // Eisenbeschläge: Band um die Deckelfuge, Fußband, zwei Bänder über Deckel und Korpus, Eckwinkel
   {f:block(6.7,4.7,5.9,6.8,.2),mat:darkIron,group:'band'},
   {f:block(6.65,4.65,0,.9,.2),mat:darkIron,group:'band'},
   {f:mirrorX(at(4.4,0,0,block(.6,4.75,.1,9.55,.35))),mat:darkIron,group:'band'},
   {f:mirrorX(mirrorY(hb(6.35,4.35,3.3,.5,.5,3,.2))),mat:darkIron,group:'ecke'},
   // Messingschloss mit Überfalle
   {f:hb(0,4.6,6.1,1.05,.3,1.25,.2),mat:brass,group:'schloss'},
   {f:hb(0,4.72,7.4,.55,.22,.9,.2),mat:brass,group:'ueberfalle'},
   {f:hb(0,4.88,5.6,.22,.1,.38),mat:darkIron,group:'schluesselloch'},
  ]};}},

 // ---------------------------------------------------------------- Schreibtisch 40×14, Höhe 16
 schreibtisch:{height:16,build(){const top=wood('#76502d',{axis:'x',planks:3.4,worn:.9}),body=wood('#5e3f24',{axis:'z'}),
   front=wood('#74502e',{axis:'x'}),gap=wood('#2e1f14',{axis:'z'});
  const drawers=[];
  for(const sx of [-1,1])for(const [z0,z1] of [[1.6,5.1],[5.5,9.4],[9.8,13.6]]){const cx=sx*14.9,cz=(z0+z1)/2;
   drawers.push({f:hb(cx,6.0,cz,3.75,.35,(z1-z0)/2,.3),mat:front,group:'lade'+sx+z0,b:[cx,6.0,cz,4.6]});
   drawers.push({f:at(cx,6.45,cz,ellipsoid(.55,.4,.55)),mat:brass,group:'knopf',b:[cx,6.45,cz,.8]});}
  return {solids:[
   {f:block(19.7,6.8,14.4,16,.3),mat:top,group:'platte'},
   // Zwei Unterschränke mit dunkler Fuge hinter den Schubladenfronten
   {f:mirrorX(at(14.9,0,0,block(4.3,6.1,1,14.4,.15))),mat:body,group:'korpus'},
   {f:mirrorX(at(14.9,.3,0,block(3.9,5.9,1.3,14.2))),mat:gap,group:'fuge'},
   {f:mirrorX(mirrorY(at(18.6,5.6,0,block(.65,.55,0,1.4,.12)))),mat:body,group:'fuss'},
   {f:mirrorX(mirrorY(at(11.2,5.6,0,block(.65,.55,0,1.4,.12)))),mat:body,group:'fuss'},
   // Mittelschublade unter der Platte, Rückwand im Knieraum, Fußleiste
   {f:hb(0,5.8,13.2,10.2,.5,1.05,.25),mat:front,group:'mittellade'},
   {f:at(0,6.4,13.2,ellipsoid(.55,.4,.5)),mat:brass,group:'knopf'},
   {f:hb(0,-5.2,8.2,10.7,.45,4.8),mat:body,group:'rueckwand'},
   {f:hb(0,-4.8,2.2,10.7,.5,.5),mat:body,group:'rueckwand'},
   ...drawers,
  ]};}},

 // ---------------------------------------------------------------- Aktenschrank 16×10, Höhe 30
 aktenschrank:{height:30,build(){const steel=metal('#7b868a',{rust:.18,shine:22,spec:.45}),inner=metal('#3a3f44',{shine:10,spec:.2}),
   lid=metal('#c2c5c0',{rust:.22,shine:18,spec:.35}),card=paper('#e6dcc0');
  const parts=[];
  for(let i=0;i<4;i++){const z0=1.3+i*6.95,z1=z0+6.55,cz=(z0+z1)/2,g='lade'+i;
   parts.push({f:hb(0,4.5,cz,7,.4,(z1-z0)/2,.35),mat:steel,group:g,b:[0,4.5,cz,8]});
   // Schildhalter mit Karte, darunter der Griff
   parts.push({f:subtract(hb(0,4.95,cz+1.3,1.75,.2,.95,.1),hb(0,5.1,cz+1.25,1.3,.3,.58)),mat:chrome,group:'halter',b:[0,5,cz+1.3,2.1]});
   parts.push({f:hb(0,4.95,cz+1.25,1.3,.1,.58),mat:card,group:'karte',b:[0,5,cz+1.25,1.5]});
   parts.push({f:union(capsule([-1.9,5.45,cz-1],[1.9,5.45,cz-1],.36),mirrorX(capsule([1.9,5.45,cz-1],[1.9,4.9,cz-.8],.3))),mat:chrome,group:'griff',b:[0,5.2,cz-1,2.4]});}
  return {solids:[
   {f:block(7.6,4.3,.6,29.2,.2),mat:inner,group:'korpus'},
   {f:mirrorX(at(7.35,0,0,block(.4,4.55,0,29.2,.15))),mat:steel,group:'wange'},
   {f:block(7.7,4.7,29,30,.3),mat:lid,group:'deckel'},
   {f:hb(0,4.3,.5,7.4,.35,.5),mat:inner,group:'sockel'},
   ...parts,
  ].map(q=>({...q,f:at(0,-.8,0,q.f),b:q.b&&[q.b[0],q.b[1]-.8,q.b[2],q.b[3]]}))};}},

 // ---------------------------------------------------------------- Etagenbett 34×20, Höhe 30
 etagenbett:{height:30,build(){const post=wood('#7a5230',{axis:'z',worn:.8}),rail=wood('#80552b',{axis:'x',worn:.8}),endr=wood('#7a5230',{axis:'y'});
  const sheet=fabric('#d9d3c3',{weave:1.2,fuzz:.1}),pillow=fabric('#f4f0e4',{weave:1,fuzz:.06});
  const red=gingham('#b23a2a',null),blue=gingham('#4a6a9a','#e2dccb');
  const level=(z,deck,cover,g)=>[
   // Rahmen vorn/hinten und an den Enden
   {f:mirrorY(hb(0,9,z+1,15.4,.5,1,.2)),mat:rail,group:'rahmen'+g},
   {f:mirrorX(hb(16.1,0,z+1,.55,8.3,1,.2)),mat:endr,group:'ende'+g},
   // Matratze, Decke (vom Fußende bis vor das Kissen), Kissen am Kopfende links
   {f:hb(0,0,z+3.1,15.2,8.3,1.2,.5),mat:sheet,group:'matratze'+g},
   {f:hb(2.9,0,z+3.5,12.3,8.6,1.35,.55),mat:deck,tex:(x,y,zz)=>[x,y,zz-z],group:'decke'+g},
   {f:smoothUnion(.8,hb(-12.3,0,z+4.2,2.2,5.6,.5,.5),at(-12.3,0,z+4.5,ellipsoid(2.3,5.7,1.35))),mat:pillow,group:'kissen'+g,noShadow:true},
  ];
  const rungs=[];for(let z=3;z<24;z+=3.9)rungs.push(capsule([7.3,9.55,z],[11.4,9.55,z],.38));
  return {solids:[
   {f:mirrorX(mirrorY(at(16.1,9,0,block(.8,.75,0,29.6,.3)))),mat:post,group:'pfosten'},
   ...level(3.2,blue,'blau','u'),
   ...level(16.2,red,'rot','o'),
   // Kopf- und Fußteile: Querriegel auf halber Höhe und oben
   {f:mirrorX(union(hb(16.1,0,10.2,.55,8.3,.8,.2),hb(16.1,0,23.6,.55,8.3,.8,.2),hb(16.1,0,28.5,.55,8.3,.8,.2))),mat:endr,group:'kopfteil'},
   {f:mirrorX(hb(16.1,0,26,.4,.5,2.2)),mat:endr,group:'kopfteil'},
   // Rausfallschutz oben: hinten ganz, vorn bis zur Leiter
   {f:hb(0,-9,23.6,15.4,.45,.8,.2),mat:rail,group:'schutz'},
   {f:hb(-5.3,9,23.6,10.1,.45,.8,.2),mat:rail,group:'schutz'},
   // Leiter vorn rechts
   {f:union(at(7,9.5,0,block(.45,.4,0,25.5,.15)),at(11.7,9.5,0,block(.45,.4,0,25.5,.15))),mat:post,group:'leiter'},
   {f:union(...rungs),mat:rail,group:'sprossen'},
  ]};}},

 // ---------------------------------------------------------------- Sackkarre 8×10, Höhe 14
 sackkarre:{height:14,build(){const red=metal('#b0452c',{rust:.22,shine:24,spec:.5}),hub=metal('#8a8680',{rust:.2});
  // Gebaut frontal (Schaufel nach Süden), dann um die Hochachse gedreht: die linke, beleuchtete Radseite zeigt zum Betrachter.
  const yAt=z=>.4-3.2*(z-.6)/12.6,W=1.8;
  const bar=(z,r=.32)=>capsule([-W,yAt(z),z],[W,yAt(z),z],r);
  return {solids:turn(-.3,[
   // Räder mit Nabe außen am Rahmen, Achse quer
   {f:mirrorX(at(2.65,-1.2,1.8,torusX(1.28,.52))),mat:rubber,group:'rad'},
   {f:mirrorX(at(0,-1.2,1.8,cylX(.8,2.35,3.05,.2))),mat:hub,group:'nabe'},
   {f:at(0,-1.2,1.8,cylX(.3,-2.4,2.4)),mat:hub,group:'achse'},
   // Rahmen: zwei schräge Holme, Streben, Mittelstäbe
   {f:mirrorX(capsule([W,yAt(.6),.6],[W,yAt(13),13],.44)),mat:red,group:'rahmen'},
   {f:union(bar(4.2),bar(8),bar(11.6),mirrorX(capsule([.65,yAt(1),1],[.65,yAt(11.6),11.6],.28))),mat:red,group:'streben'},
   // Stützen Achse–Rahmen, Schaufel vorn mit Aufkantung
   {f:mirrorX(capsule([W,-1.2,1.8],[W,yAt(5),5],.32)),mat:red,group:'stuetze'},
   {f:hb(0,1.55,.22,2.2,1.3,.22,.08),mat:red,group:'schaufel'},
   {f:hb(0,.5,1,2,.25,.9,.08),mat:red,group:'schaufel'},
   // Griffe oben mit schwarzem Gummi
   {f:mirrorX(capsule([W,yAt(13),13],[1.9,-3.1,13.8],.44)),mat:red,group:'rahmen'},
   {f:mirrorX(capsule([1.9,-3.1,13.8],[2,-3.4,15.1],.55)),mat:rubber,group:'griff'},
  ])};}},

 // ---------------------------------------------------------------- Schutthaufen 36×26, Höhe 12
 schutthaufen:{height:12,build(){const dirt=stone('#6f6558'),slate=stone('#5e6068'),slate2=stone('#727480'),plast=plaster('#d8cfb8');
  const beamWood=wood('#6b4526',{axis:'x',worn:1}),beamWood2=wood('#7a5230',{axis:'x',worn:1});
  const moundZ=(x,y)=>3.4*Math.sqrt(Math.max(0,1-(x/15)**2-(y/10.5)**2));
  const solids=[
   {f:(x,y,z)=>Math.max(ellipsoid(15,10.5,3.4)(x,y,z)-.9*(fbm3(x*.35,y*.35,z*.35,3)-.5),-z),mat:dirt,group:'schutt'},
  ];
  // Große Steinplatten und Putzbrocken: feste Plätze (Bildaufbau), Drehung und Neigung aus dem Zufall mit festem Samen
  const R=rng(7),chunks=[
   [-6,-3,3.2,2.4,1.2,slate],[1,-5,3,2,1.1,slate2],[-2,2.5,3.4,2.2,1.2,slate],[7,1,2.6,2.2,1,slate2],[-10,3,2.6,1.8,1,slate2],
   [4,5.5,2.4,1.8,1,slate],[10,-4,2.2,1.7,.9,slate],[-11,-4,2.2,1.6,.9,slate],
   [-4,7,1.8,1.5,1.1,plast],[8.5,6.5,1.6,1.4,1,plast],[-13,.5,1.5,1.3,1,plast],[12,2,1.5,1.2,.9,plast],[2,-8,1.6,1.3,.9,plast],[-7,-7.5,1.4,1.2,.8,plast],
  ];
  chunks.forEach(([x,y,hx,hy,hz,mat],i)=>{const a=R()*PI,tx=(R()-.5)*.5,ty=(R()-.5)*.5,z=moundZ(x,y)+hz*.4;
   solids.push({f:at(x,y,z,rotZ(a,rotX(tx,rotY(ty,box(hx,hy,hz,.25))))),mat,group:'brocken'+i,b:[x,y,z,Math.hypot(hx,hy,hz)+.3]});});
  // Zwei gebrochene Balken quer über den Haufen, ein kurzes Stück darunter
  solids.push({f:beam([-13.5,8.5,1.1],[8,-8.5,8.2],1.15,.95),mat:beamWood,group:'balken1',b:[-2.75,0,4.6,14.5]});
  solids.push({f:beam([-10.5,10.2,1],[10.5,-6.5,7.2],1,.85),mat:beamWood2,group:'balken2',b:[0,1.85,4.1,14]});
  solids.push({f:beam([1,9.5,1],[12.5,4.5,3.4],.8,.7),mat:beamWood,group:'balken3',b:[6.75,7,2.2,7]});
  // Kleinzeug am Rand
  const Q=rng(23);
  for(let i=0;i<22;i++){const ang=i/22*PI*2+Q()*.25,rr=.78+Q()*.22,x=Math.cos(ang)*15.8*rr,y=Math.sin(ang)*11.2*rr,s=.45+Q()*.4,mat=i%3===0?plast:i%3===1?slate:dirt;
   solids.push({f:at(x,y,s*.7,rotZ(Q()*PI,box(s,s*.8,s*.7,.15))),mat,group:'krume'+i,b:[x,y,s*.7,s*1.6]});}
  return {solids};}},

 // ---------------------------------------------------------------- Eimer 6×6, Höhe 6
 eimer:{height:6,build(){const zinc=metal('#9aa3a6',{rust:.12,shine:30,spec:.6}),
   zinc2=zincIn('#9aa3a6',(u,v,w)=>w>.3&&w<5.3&&Math.hypot(u,v)<1.83+.096*(w-.45),.48);
  return {solids:[
   {f:subtract(taper(2.05,2.55,0,5.4,.15),taper(1.8,2.35,.45,6.2)),mat:zinc2,group:'eimer'},
   {f:at(0,0,5.35,torusZ(2.5,.3)),mat:zinc,group:'rand'},
   {f:union(at(0,0,1.3,torusZ(2.16,.17)),at(0,0,3.7,torusZ(2.36,.17))),mat:zinc,group:'sicke'},
   {f:at(0,0,.55,cylZ(1.85,.4,.6)),mat:metal('#4a4540',{rust:.5}),group:'boden'},
   {f:mirrorX(hb(2.5,0,4.6,.3,.45,.55,.15)),mat:zinc,group:'ohr'},
   // Bügel nach vorn gekippt: nur so kreuzt er in der Schrägsicht die Öffnung und bleibt sichtbar
   {f:at(0,0,4.6,rotX(-.6,intersect(torusY(2.55,.22),(x,y,z)=>-z))),mat:darkIron,group:'buegel'},
  ]};}},

 // ---------------------------------------------------------------- Küchenzeile 60×12, Höhe 14 (tropfender Hahn)
 kuechenzeile:{height:14,frames:6,fps:5,build(t){
  const steel=metal('#a9afae',{rust:.05,shine:34,spec:.7}),body=metal('#7c807e',{rust:.15,shine:20,spec:.4}),dark=metal('#3c4044',{shine:10,spec:.2});
  const plate=ceramic('#e6e2d6'),SX=4,SY=.2;
  // Wasser liest sich in 2–3 px nur als heller Punkt mit Kontur: eigene helle Rampe statt Glas.
  // Becken innen dunkler als die Platte, sonst verschwimmt die Spüle mit der Arbeitsfläche
  const basinSteel=custom('metall','#a9afae',(u,v,w)=>({k:(.86+.26*fbm3(u*.9,v*.9,w*.9,3))*(w<13.5&&Math.abs(u-SX)<5.2&&Math.abs(v-SY)<3.8?.62:1)}),{spec:.7,shine:34});
  const water=glow(['#2c4a5c','#4a7a94','#7eb4cc','#bfe2ef','#f2fbff']);
  const solids=[
   // Arbeitsplatte mit ausgeschnittenem Becken und Aufkantung hinten
   {f:subtract(block(29.6,5.6,12.4,13.6,.25),hb(SX,SY,12.6,5.1,3.7,1.4,.5)),mat:steel,group:'platte'},
   {f:subtract(hb(SX,SY,12.2,5.5,4.1,1.4,.5),hb(SX,SY,12.6,5.1,3.7,1.4,.5)),mat:basinSteel,group:'becken'},
   {f:hb(0,-5.35,14.1,29.6,.25,.5,.15),mat:steel,group:'aufkantung'},
   {f:at(SX+1.8,-2.2,0,cylZ(.65,11.15,11.3)),mat:dark,group:'abfluss'},
   {f:at(SX-.6,-1.6,11.2,ellipsoid(2.4,1.6,.12)),mat:glass('#6f96a8'),group:'pfuetze'},
   // Rechter Unterbau: Korpus dunkel, vier Türen mit Griffen, Füße
   {f:subtract(hb(9.1,-.1,7,20.1,5.1,5.4),hb(SX,SY,12.2,5.6,4.2,1.5,.5)),mat:dark,group:'korpus'},
   {f:hb(-10.6,5.2,12,.5,.4,.4),mat:body,group:'korpus'},
  ];
  [[-10.6,-.9],[-.5,9.2],[9.6,19.3],[19.7,29.2]].forEach(([a,b],i)=>{const cx=(a+b)/2;
   solids.push({f:hb(cx,5.1,6.7,(b-a)/2,.3,4.9,.25),mat:body,group:'tuer'+i,b:[cx,5.1,6.7,7.2]});
   const hx=i%2?a+1.1:b-1.1;solids.push({f:capsule([hx,5.65,9.4],[hx,5.65,6.2],.32),mat:chrome,group:'griff',b:[hx,5.65,7.8,2]});});
  solids.push({f:union(...[-10.2,9.4,28.6].map(x=>mirrorY(at(x,4.3,0,cylZ(.6,0,1.8))))),mat:steel,group:'fuss'});
  // Linkes offenes Gestell: Beine, Zarge, Ablageboden mit Topf und Rohrstücken
  solids.push({f:union(...[-28.9,-11.9].map(x=>mirrorY(at(x,4.8,0,cylZ(.6,0,12.4,.15))))),mat:steel,group:'bein'});
  solids.push({f:hb(-20.4,5.1,11.7,8.6,.35,.7,.15),mat:steel,group:'zarge'});
  solids.push({f:hb(-20.4,0,2.8,8.6,4.9,.3,.15),mat:steel,group:'boden'});
  solids.push({f:subtract(at(-24.5,.5,0,cylZ(2.3,3.1,6.6,.3)),at(-24.5,.5,0,cylZ(1.9,3.6,7.5))),mat:darkIron,group:'topf',b:[-24.5,.5,5,3.5]});
  solids.push({f:union(at(-17,1.8,3.9,cylX(.8,-4.2,4.2,.1)),at(-15.8,-1.2,3.9,cylX(.8,-3.2,3.2,.1)),at(-14.5,.3,5.4,cylX(.8,-3,3,.1))),mat:body,group:'rohre',b:[-16,0,4.5,6]});
  // Auf der Platte: Glasgefäß, zwei Tellerstapel, Becher, Flaschen, Topf mit Deckel, Tuch vorn
  const plates=(x,y,n,g)=>({f:union(...Array.from({length:n},(_,i)=>at(x,y,0,cylZ(2.3,13.6+i*.55,13.95+i*.55,.14))),at(x,y,0,cylZ(1.9,13.6,13.6+n*.55))),mat:plate,group:g,b:[x,y,13.6+n*.28,n*.3+2.6]});
  solids.push(plates(-21.6,-.3,5,'teller1'),plates(-16.3,1.6,3,'teller2'));
  solids.push({f:subtract(at(-26.6,-2.4,0,cylZ(1.55,13.6,18.4,.3)),at(-26.6,-2.4,0,cylZ(1.2,14,19))),mat:glass('#3e5e34'),group:'glas',b:[-26.6,-2.4,16,3]});
  solids.push({f:union(subtract(at(-18.3,-3.6,0,cylZ(1.05,13.6,16.2,.15)),at(-18.3,-3.6,0,cylZ(.8,14,17))),at(-17.1,-3.6,15,torusY(.65,.2))),mat:metal('#9aa0a2',{shine:24}),group:'becher',b:[-18,-3.6,15,2.2]});
  const bottle=(x,y,h,mat,g)=>({f:smoothUnion(.4,at(x,y,0,cylZ(.95,13.6,13.6+h,.3)),capsule([x,y,13.6+h],[x,y,13.6+h+2],.42)),mat,group:g,b:[x,y,13.6+h/2+1,h/2+2.2]});
  solids.push(bottle(-7,-1.6,2.6,glass('#6a3a1a'),'flasche1'),bottle(-3.9,-2.9,3.4,glass('#2e5a3a'),'flasche2'));
  solids.push({f:union(at(-7,-1.6,0,cylZ(1.0,14.3,15.5)),at(-3.9,-2.9,0,cylZ(1.0,14.6,16.2))),mat:paper('#e2d6b4'),group:'etikett',b:[-5.4,-2.2,15.2,3.2]});
  solids.push({f:union(at(-7,-1.6,0,cylZ(.5,17.9,18.5,.1)),at(-3.9,-2.9,0,cylZ(.5,18.6,19.2,.1))),mat:plastic('#a8302a'),group:'deckel',b:[-5.4,-2.2,18.6,2.6]});
  solids.push({f:at(17,-.6,0,cylZ(2.7,13.6,16.9,.35)),mat:ceramic('#d07a2a'),group:'topf2',b:[17,-.6,15.3,3.9]});
  solids.push({f:union(at(17,-.6,0,cylZ(2.85,16.7,17.3,.25)),at(17,-.6,17.7,ellipsoid(.7,.7,.45))),mat:ceramic('#e8e0cc'),group:'topfdeckel',b:[17,-.6,17.3,3.2]});
  solids.push({f:mirrorX(at(17,-.6,15.8,capsule([2.6,0,0],[3.3,0,0],.3))),mat:darkIron,group:'topfgriff',b:[17,-.6,15.8,3.6]});
  solids.push({f:union(hb(22.4,5.8,10.6,1.9,.15,2.8,.12),hb(22.4,4.2,13.75,1.9,1.6,.12,.1)),mat:fabric('#e8e4d8',{weave:1.4}),group:'tuch',b:[22.4,5,12,4]});
  solids.push({f:union(hb(22.4,5.96,9.2,1.9,.04,.35),hb(22.4,5.96,10.4,1.9,.04,.25)),mat:fabric('#4a6a9a'),group:'tuchstreifen',b:[22.4,5.9,9.8,2.2]});
  // Wasserhahn: Sockel, Säule, Schwanenhals, zwei Drehgriffe
  const tip=[SX,-1.3,15.9];
  solids.push({f:union(at(SX,-4.3,0,cylZ(.75,13.6,14.8,.2)),capsule([SX,-4.3,14.5],[SX,-4.3,17.2],.42),capsule([SX,-4.3,17.2],[SX,-2.9,17.8],.42),capsule([SX,-2.9,17.8],[SX,-1.6,17.2],.4),capsule([SX,-1.6,17.2],tip,.38)),mat:chrome,group:'hahn',b:[SX,-2.8,16,3.5]});
  solids.push({f:union(...[-1.6,1.6].map(d=>union(capsule([SX+d,-4.3,13.6],[SX+d,-4.3,15.2],.3),capsule([SX+d-.6,-4.3,15.3],[SX+d+.6,-4.3,15.3],.28)))),mat:chrome,group:'griffe',b:[SX,-4.3,14.6,3]});
  // Tropfen: hängt an, wird schwer, fällt, platscht auf den Beckenboden – eine nahtlose Schleife
  const floorZ=11.3,step=Math.round(t*6);
  const drop=[
   ()=>at(tip[0],tip[1],tip[2]-.5,ellipsoid(.3,.3,.32)),
   ()=>at(tip[0],tip[1],tip[2]-.65,ellipsoid(.4,.4,.5)),
   ()=>at(tip[0],tip[1],14.4,ellipsoid(.38,.38,.6)),
   ()=>at(tip[0],tip[1],12.5,ellipsoid(.34,.34,.75)),
   ()=>union(at(tip[0],tip[1],floorZ,ellipsoid(1.05,.8,.16)),at(tip[0]-.7,tip[1],floorZ+.8,ellipsoid(.22,.22,.22)),at(tip[0]+.8,tip[1],floorZ+.6,ellipsoid(.2,.2,.2))),
   ()=>at(tip[0],tip[1],floorZ-.05,(x,y,z)=>Math.hypot(Math.hypot(x,y*1.35)-1.35,z*1.6)-.2),
  ][step%6]();
  solids.push({f:drop,mat:water,glow:step<4?.72:step===4?.6:.42,group:'tropfen',b:[tip[0],tip[1],13.6,4]});
  return {solids};}},

 // ---------------------------------------------------------------- Kloschüssel 12×12, Höhe 8 (Spülkasten ragt nach oben)
 kloschuessel:{height:8,build(){const por=ceramic('#eef0ee'),seat=plastic('#f4f3ec');
  const bowlOuter=smoothUnion(.9,
   (x,y,z)=>Math.max(at(0,.6,4.1,ellipsoid(3.7,4.5,2.4))(x,y,z),z-6),
   (x,y,z)=>Math.max(at(0,.1,1.2,ellipsoid(2.3,2.9,3.4))(x,y,z),-z),
   hb(0,-2.2,3,2.5,1.8,3,.6));
  const seatRing=(x,y,z)=>{const q=Math.hypot(x,(y-.6)*.82)-2.85;const dq=Math.abs(q)-.9,dz=Math.abs(z-6.15)-.28;return Math.min(Math.max(dq,dz),0)+Math.hypot(Math.max(dq,0),Math.max(dz,0))-.12;};
  return {solids:[
   {f:subtract(bowlOuter,at(0,.7,6,ellipsoid(2.9,3.6,3.3))),mat:ceramicIn('#eef0ee',(u,v,w)=>w<5.9&&Math.hypot(u/2.95,(v-.7)/3.65)<1.02,.7),group:'schuessel'},
   {f:at(0,.9,3.2,ellipsoid(2,2.5,.12)),mat:glass('#9ab8c0'),group:'wasser'},
   {f:seatRing,mat:seat,group:'brille'},
   {f:mirrorX(hb(1.9,-3.1,6.4,.55,.35,.3,.12)),mat:chrome,group:'scharnier'},
   {f:hb(0,-4.3,8.8,4.3,1.55,3,.45),mat:por,group:'kasten'},
   {f:hb(0,-4.3,11.9,4.6,1.8,.4,.3),mat:por,group:'kastendeckel'},
   {f:at(0,-4.3,0,cylZ(.7,12.2,12.5,.1)),mat:chrome,group:'knopf'},
  ]};}},

 // ---------------------------------------------------------------- Waschbecken 10×8, Höhe 10 (an der Wand, Siphon darunter)
 waschbecken:{height:10,build(){const por=ceramic('#eef0ee');
  // D-förmiges Becken: hinten gerade an der Wand, vorn rund
  const dShape=(x,y,z)=>{const e=y>-.5?Math.hypot(x/4.6,(y+.5)/3.9)*3.9-3.9:Math.abs(x)-4.6;const dy=-3.8-y,d2=Math.max(e,dy),dz=Math.abs(z-8.9)-1.1;
   return Math.min(Math.max(d2+.45,dz+.45),0)+Math.hypot(Math.max(d2+.45,0),Math.max(dz+.45,0))-.45;};
  return {solids:[
   {f:subtract(smoothUnion(.6,dShape,at(0,-.2,7.9,ellipsoid(3.4,2.9,1.5))),at(0,.45,10.25,ellipsoid(3.55,2.55,2.3))),mat:ceramicIn('#eef0ee',(u,v,w)=>w<9.95&&Math.hypot(u/3.6,(v-.45)/2.6)<1.02,.76),group:'becken'},
   {f:at(0,.5,0,cylZ(.5,7.95,8.15)),mat:metal('#3c4044'),group:'abfluss'},
   // Armatur: Auslauf in der Mitte, Griffe rot/blau
   {f:union(at(0,-2.9,0,cylZ(.45,9.9,11.3,.15)),capsule([0,-2.9,11.1],[0,-1.7,11],.35)),mat:chrome,group:'auslauf'},
   {f:mirrorX(at(2.3,-2.9,0,cylZ(.36,9.9,11,.1))),mat:chrome,group:'ventil'},
   {f:at(-2.3,-2.9,0,cylZ(.62,11,11.6,.2)),mat:plastic('#b8322a'),group:'rot'},
   {f:at(2.3,-2.9,0,cylZ(.62,11,11.6,.2)),mat:plastic('#2f5fa8'),group:'blau'},
   // Siphon: senkrecht herunter, U-Bogen, zur Wand
   {f:union(capsule([0,-.3,6.8],[0,-.3,4.2],.45),capsule([0,-.3,4.2],[0,-1.2,3.3],.5),capsule([0,-1.2,3.3],[0,-3.6,3.3],.45)),mat:chrome,group:'siphon'},
   {f:at(0,-3.7,3.3,cylY(1,-3.85,-3.5,.1)),mat:chrome,group:'rosette'},
  ]};}},
};
