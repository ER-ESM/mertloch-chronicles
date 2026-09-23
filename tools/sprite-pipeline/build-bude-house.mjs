// Laufzeitexport der gemalten Bude (E-52): Innenansicht (Haus + Hof, Wände auf Hüfthöhe) und Außenansicht (Haus mit Dach)
// aus den unveränderten Originalen in assets/precision/sources/2026-09-23/. Flächengewichtetes Sampling auf 4 px je
// Welteinheit wie alle Präzisionsgrafiken. Die Registrierung (Laufzeitpixel ↔ Hauskoordinaten) steht in bude-haus.json.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {decodePng,encodePng,surface} from './png.mjs';
import {resample} from './precision-resample.mjs';
import {BUDE_HOUSE} from '../../content/bude-house.js';
import {BUILDINGS,BUILDING_IDS} from '../../content/buildings.js';
import {PROP_KINDS} from '../../world-prop-kinds.js';
import {components} from './segment.mjs';
import {existsSync} from 'node:fs';

const SRC='assets/precision/sources/2026-09-23/',OUT='assets/precision/runtime/buildings/',PX=4;
const W=BUDE_HOUSE.width,D=BUDE_HOUSE.depth;
mkdirSync(OUT,{recursive:true});
const load=name=>decodePng(readFileSync(SRC+name));
function exportRegion(src,box,scale,file){
 const dst=surface(Math.round(box.w*scale),Math.round(box.h*scale));
 resample(src,dst,box,{x:0,y:0},scale,{palette:true});
 // Innenansicht ist deckend; außen bleibt die harte Alpha-Kante des Originals.
 writeFileSync(OUT+file,encodePng(dst));return {file,width:dst.width,height:dst.height};
}

// Innenräume und Hof entstehen seit E-54 aus dem Sprite-Baukasten (build-kit.mjs); die gemalten Innenebenen
// (bude-haus-innen*.png, bude-haus-oben.png) bleiben nur als Herkunft und Stilreferenz unter sources/.

// Möbel je Ausbaustufe: ein Bogen je Gebäude, Stufen von links nach rechts. Die N größten Bildteile geben die Stufen vor,
// kleinere Teile (Kabel, Deckel, Funken) gehören zur Stufe, in deren Spalte sie liegen. Breite = Weltbreite der Stufe × 4 px.
const stages={};
for(const id of BUILDING_IDS){const file='bude-moebel-'+id+'.png';if(!existsSync(SRC+file))continue;const img=load(file),n=BUILDINGS[id].stages.length,def=PROP_KINDS['bude-'+id];
 const parts=components(img),big=[...parts].sort((a,b)=>b.count-a.count).slice(0,n).sort((a,b)=>a.cx-b.cx);
 if(big.length!==n)throw Error(file+': erwartet '+n+' Möbel, gefunden '+big.length);
 const cuts=big.slice(1).map((b,i)=>(big[i].cx+b.cx)/2);
 for(const [i,s] of BUILDINGS[id].stages.entries()){const lo=i?cuts[i-1]:-1,hi=i<cuts.length?cuts[i]:img.width+1,mine=parts.filter(p=>p.cx>lo&&p.cx<hi&&p.count>=30);
  const x0=Math.min(...mine.map(p=>p.x)),y0=Math.min(...mine.map(p=>p.y)),x1=Math.max(...mine.map(p=>p.x+p.w)),y1=Math.max(...mine.map(p=>p.y+p.h));
  const worldW=Math.round(def.w*(.6+.4*s.stage/n)),scale=worldW*PX/(x1-x0);
  stages[id+'-'+s.stage]={...exportRegion(img,{x:x0,y:y0,w:x1-x0,h:y1-y0},scale,'bude-moebel-'+id+'-'+s.stage+'.png'),worldWidth:worldW};}}

// Außen: Fassade vermessen – linke/rechte Kante auf halber Sockelhöhe, Unterkante in der Mitte = Hausfront (y = D).
const aussen=load('bude-haus-aussen.png'),A=aussen,opaque=(x,y)=>A.data[(y*A.width+x)*4+3]>=128;
let bottom=A.height-1;const mid=Math.round(A.width/2);while(bottom>0&&!opaque(mid,bottom))bottom--;
const row=bottom-12;let x0=0,x1=A.width-1;while(x0<A.width&&!opaque(x0,row))x0++;while(x1>0&&!opaque(x1,row))x1--;
const s=(x1-x0+1)/W;let top=0;while(top<A.height&&![...Array(A.width).keys()].some(x=>opaque(x,top)))top++;
let left=0,right=A.width-1;const colHas=x=>{for(let y=top;y<=bottom;y++)if(opaque(x,y))return true;return false;};while(!colHas(left))left++;while(!colHas(right))right--;
const aussenBox={x:left,y:top,w:right-left+1,h:bottom-top+1};
const aussenOut=exportRegion(aussen,aussenBox,PX/s,'bude-haus-aussen.png');

const meta={
 format:'bude-haus-v2',pxPerUnit:PX,
 stages,
 aussen:{...aussenOut,local:{x:(left-x0)/s,y:D-(bottom-top+1)/s},measured:{facadeLeft:x0,facadeRight:x1,bottom,sourcePxPerUnit:+s.toFixed(4)}}
};
writeFileSync(OUT+'bude-haus.json',JSON.stringify(meta,null,1)+'\n');
console.log(JSON.stringify(meta));
