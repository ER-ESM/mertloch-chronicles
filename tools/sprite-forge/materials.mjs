// Sprite-Schmiede · Materialien. Ein Material liefert eine Farbrampe (dunkel → hell, Schatten kühl-violett,
// Lichter warm) und eine Texturfunktion in Objekt-Koordinaten (u,v,w in E), damit Muster bei Animationen mitwandern.
import {clamp,mix,fbm3,noise3} from './sdf.mjs';

export const hex=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));
const SHADOW=hex('#2a2440'),LIGHT=hex('#fff0cc');
/** Sieben Stufen aus einer Grundfarbe: 0–2 zum kühlen Violett, 3 = Grundfarbe, 4–6 zum warmen Licht. */
export function rampFrom(base,{deep=.78,hi=.62}={}){const b=typeof base==='string'?hex(base):base;
 return [deep,deep*.64,deep*.3].map(t=>b.map((c,k)=>mix(c,SHADOW[k],t))).concat([b],[hi*.3,hi*.62,hi].map(t=>b.map((c,k)=>mix(c,LIGHT[k],t))));}
export function rampColor(ramp,v){const f=clamp(v,0,.9999)*(ramp.length-1),i=Math.floor(f),t=f-i,a=ramp[i],b=ramp[i+1]||a;return [mix(a[0],b[0],t),mix(a[1],b[1],t),mix(a[2],b[2],t)];}

const plain=()=>({k:1});
function make(name,base,{spec=.15,shine=14,tex=plain,emissive=false,ramp=null,deep,...rest}={}){return {name,ramp:ramp||rampFrom(base,deep?{deep}:{}),spec,shine,tex,emissive,...rest};}
const axisOf=(a,u,v,w)=>a==='x'?[u,v,w]:a==='y'?[v,u,w]:[w,u,v];

/** Holz: Maserung entlang `axis`, optional Brettfugen quer zur Achse (`planks` = Brettbreite in E). */
export function wood(base='#80552b',{axis='x',planks=0,worn=.5,seed=0}={}){
 return make('holz',base,{spec:.12,shine:8,tex:(u,v,w)=>{const [s,c1,c2]=axisOf(axis,u,v,w);
  const g=Math.sin((c1*1.7+c2*1.1)*2.1+5*fbm3(s*.07+seed,c1*.35,c2*.35,3));let k=.9+.1*g;if(g>.86)k*=.78;
  if(fbm3(s*.25+seed*3,c1*1.4,c2*1.4,2)>.7)k*=.85;
  if(planks){const q=(c1+c2*.0001)/planks,f=q-Math.floor(q);if(f<.06||f>.94)k*=.55;}
  return {k:k*(1-.08*worn*fbm3(u*.2,v*.2,w*.2,2))};}});
}
/** Metall: feine Sprenkel, optional Rostflecken (Anteil 0..1) mit eigener Rampe. */
export function metal(base='#5b534e',{rust=0,shine=26,spec=.55}={}){const rustRamp=rampFrom('#9a4f24');
 return make('metall',base,{spec,shine,tex:(u,v,w)=>{const k=.86+.26*fbm3(u*.9,v*.9,w*.9,3);
  if(rust&&fbm3(u*.22+9,v*.22,w*.22,4)>1-rust*.6)return {k:k*.92,ramp:rustRamp,spec:.08};return {k};}});
}
export function plaster(base='#d8c4a0'){return make('putz',base,{spec:.03,shine:4,tex:(u,v,w)=>({k:.9+.2*fbm3(u*.12,v*.12,w*.12,4)-(fbm3(u*.9,v*.9,w*.9,2)>.78?.08:0)})});}
export function stone(base='#7d7a74'){return make('stein',base,{spec:.05,shine:6,tex:(u,v,w)=>({k:.8+.35*fbm3(u*.4,v*.4,w*.4,4)})});}
export function fabric(base='#6b3a2a',{weave=1.6,fuzz=.12}={}){return make('stoff',base,{spec:.03,shine:4,tex:(u,v,w)=>({k:.92+.05*Math.sin(u*weave*6)*Math.sin((v+w)*weave*6)+fuzz*(fbm3(u*.5,v*.5,w*.5,3)-.5)})});}
export function leather(base='#5a3a22'){return make('leder',base,{spec:.25,shine:18,tex:(u,v,w)=>({k:.88+.22*fbm3(u*.7,v*.7,w*.7,3)})});}
export function skin(base='#e0a986'){return make('haut',base,{spec:.12,shine:10,deep:.7,tex:(u,v,w)=>({k:.97+.06*fbm3(u*.3,v*.3,w*.3,2)})});}
/** Haar: Strähnen entlang `axis`. */
export function hair(base='#5a3b24',{axis='z'}={}){return make('haar',base,{spec:.35,shine:22,tex:(u,v,w)=>{const [s,c1,c2]=axisOf(axis,u,v,w);return {k:.9+.07*Math.sin((c1+c2)*3.4+4*fbm3(s*.25,c1*.7,c2*.7,2))+.08*(fbm3(u*.8,v*.8,w*.8,2)-.5)};}});}
export function ceramic(base='#e8e2d4'){return make('keramik',base,{spec:.6,shine:40,tex:(u,v,w)=>({k:.97+.05*fbm3(u*.3,v*.3,w*.3,2)})});}
export function glass(base='#2e5a3a'){return make('glas',base,{spec:1.1,shine:60,glass:true});}
export function paper(base='#e6dcc0'){return make('papier',base,{spec:.02,shine:4,tex:(u,v,w)=>({k:.93+.1*fbm3(u*.6,v*.6,w*.6,2)})});}
export function plastic(base='#2f6b3a'){return make('kunststoff',base,{spec:.4,shine:24});}
/** Leuchtende Materialien (Glut, Flamme, Lampenschirm): Farbe allein aus der Helligkeit `glow` des Körpers. */
export function glow(stops=['#5a1a0c','#a3341a','#e0662a','#f7a64a','#ffe08a']){return {name:'glut',ramp:stops.map(hex),emissive:true,tex:plain,spec:0,shine:1};}
export const noiseAt=noise3;
/** Eigenes Material mit eigener Texturfunktion tex(u,v,w,n)→{k, ramp?, spec?} – z. B. kachelbare Beläge mit fbmTile3. */
export const custom=(name,base,tex,opts={})=>make(name,base,{...opts,tex});
