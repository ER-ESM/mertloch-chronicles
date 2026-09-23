// Referenzmodelle der Sprite-Schmiede (Vorbild für alle weiteren Modelle).
// Koordinaten: Standfläche mittig um (0,0), x Ost, y Süd (Vorderkante bei +h/2), z ab Boden. Maße in E aus content/sprite-kit.js.
// build(t) bekommt die Animationsphase t∈[0,1) – Rauschen läuft über einen Kreis, damit die Schleife nahtlos ist.
import {block,box,cylZ,capsule,at,union,subtract,mirrorX,mirrorY,ellipsoid,torusZ,noise3,clamp} from '../sdf.mjs';
import {wood,metal,glow,ceramic} from '../materials.mjs';

const TAU=Math.PI*2;
/** Flackern: nahtlos geschlossenes Rauschen über die Phase. */
export const flicker=(t,seed=0,speed=1)=>noise3(Math.cos(TAU*t)*speed+seed,Math.sin(TAU*t)*speed,seed*.37);
/** Flammenbild in Objekt-Koordinaten (u quer, w hoch): hell unten, zackig nach oben, bewegt über die Phase. */
export const fireGlow=(t,base=.55)=>(u,v,w)=>{const c=Math.cos(TAU*t)*1.6,s=Math.sin(TAU*t)*1.6,n=noise3(u*1.1+c,w*.9-s,s*.5+c*.5);
 return clamp(base+.55*n-.09*w+.12*flicker(t,3),0,.98);};

const castIron=metal('#2f2e35',{rust:.25,shine:18,spec:.35}),pipeIron=metal('#4a4748',{rust:.1});
const ember=glow(),lampGlow=glow(['#6a4a14','#b8862e','#eec25a','#fbe39a','#fff6d8']);

export const MODELS={
 kanonenofen:{frames:6,fps:8,height:30,build(t){
  const f=.8+.35*flicker(t,1);
  return {solids:[
   // Korpus mit ausgespartem Feuerraum hinter der Tür
   {f:subtract(union(cylZ(5.6,3.2,15.2,.8),cylZ(6.4,14.6,16.4,.4),cylZ(6.2,2.6,3.6,.4)),at(0,5.6,9.4,box(2.3,1.4,2.2,.2))),mat:castIron,group:'ofen'},
   {f:mirrorX(mirrorY(capsule([3.6,3.6,3],[4.6,4.6,.4],.75))),mat:castIron,group:'ofen'},
   // Tür mit Rahmen und Sichtgitter vor der Glut
   {f:subtract(at(0,5.7,9.3,box(3.3,.55,3.3,.3)),at(0,5.8,9.4,box(2.3,1,2.2,.1))),mat:castIron,group:'tuer'},
   {f:union(...[-1.15,0,1.15].map(x=>at(x,5.95,9.4,box(.26,.22,2.25)))),mat:castIron,group:'tuer'},
   {f:at(0,4.6,9.4,box(2.4,.3,2.3)),mat:ember,glow:fireGlow(t),tex:(x,y,z)=>[x,y,z-7.2],group:'glut',noShadow:true},
   {f:at(5.4,5.1,9.2,box(.35,.5,1.2,.2)),mat:pipeIron,group:'tuer'},
   // Ofenrohr mit Manschette
   {f:union(cylZ(1.7,16.2,30,.3),cylZ(2.2,17.5,18.6,.3)),tex:(x,y,z)=>[x,y+1,z],mat:pipeIron,group:'rohr'},
  ],lights:[{p:[0,8.5,9.5],r:16,k:.55*f,color:[1,.55,.2]}]};}},

 stuhl:{height:12,build(){const oak=wood('#7a5230',{axis:'z'}),seat=wood('#80552b',{axis:'x'});
  return {solids:[
   {f:block(3.7,3.7,5.4,6.3,.25),mat:seat,group:'sitz'},
   {f:mirrorX(mirrorY(at(3.1,3.1,0,block(.45,.45,0,5.5,.12)))),mat:oak,group:'beine'},
   {f:mirrorX(at(3.1,-3.1,0,block(.5,.5,6,12,.15))),mat:oak,group:'lehne'},
   {f:union(at(0,-3.1,11.2,box(3.2,.35,.7,.15)),at(0,-3.1,8.9,box(3.2,.3,.45,.12))),mat:seat,group:'lehne'},
   {f:mirrorX(at(1.4,-3.1,8.9,box(.3,.3,2.3,.08))),mat:oak,group:'lehne'},
   {f:mirrorX(at(3.1,0,2,box(.3,3.1,.3,.08))),mat:oak,group:'beine'},
  ]};}},

 'tisch-rund':{height:12,build(){const top=wood('#7d5230',{axis:'x',planks:3.2}),leg=wood('#6a4526',{axis:'z'});
  const disc=(x,y,z)=>{const d=Math.hypot(x/8.6,y/7.6)*7.6-7.6,dz=Math.abs(z-11.4)-.7;return Math.min(Math.max(d,dz),0)+Math.hypot(Math.max(d,0),Math.max(dz,0))-.25;};
  return {solids:[
   {f:disc,mat:top,group:'platte'},
   {f:mirrorX(mirrorY(at(4.8,4,0,block(.6,.6,0,10.8,.15)))),mat:leg,group:'beine'},
   {f:subtract(at(0,0,9.9,box(5.4,4.6,.55,.1)),at(0,0,9.9,box(4.4,3.6,1,.1))),mat:leg,group:'zarge'},
  ]};}},

 wandlampe:{frames:4,fps:6,height:7,extraTop:2,build(t){const f=.8+.3*flicker(t,5,1.4),brass=metal('#8a6a36',{shine:30,spec:.7});
  return {solids:[
   {f:at(0,-.6,3.2,box(1.3,.35,2.4,.25)),mat:brass,group:'halter'},
   {f:capsule([0,-.4,3.6],[0,1.2,4.1],.35),mat:brass,group:'halter'},
   // Schirm als Kegelstumpf: oben schmal, unten offen
   {f:subtract((x,y,z)=>{const r=Math.hypot(x,y-1.3),rr=2.4-.28*(z-3.6),dz=Math.abs(z-5)-1.4;return Math.max((r-rr)*.9,dz);},(x,y,z)=>{const r=Math.hypot(x,y-1.3),rr=2-.28*(z-3.6);return Math.max((r-rr)*.9,z-6.2);}),mat:ceramic('#e9dcc0'),group:'schirm'},
   {f:at(0,1.3,2.5,ellipsoid(1.05,1.05,1.25)),mat:lampGlow,glow:clamp(.72*f,0,.95),group:'birne'},
  ],lights:[{p:[0,2.6,2.2],r:7,k:.55*f,color:[1,.85,.45]}]};}},
};
