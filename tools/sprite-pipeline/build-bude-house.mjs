// Laufzeitexport der gemalten Bude (E-52): Innenansicht (Haus + Hof, Wände auf Hüfthöhe) und Außenansicht (Haus mit Dach)
// aus den unveränderten Originalen in assets/precision/sources/2026-09-23/. Flächengewichtetes Sampling auf 4 px je
// Welteinheit wie alle Präzisionsgrafiken. Die Registrierung (Laufzeitpixel ↔ Hauskoordinaten) steht in bude-haus.json.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {decodePng,encodePng,surface} from './png.mjs';
import {resample} from './precision-resample.mjs';
import {GUIDE} from './bude-house-guide.mjs';
import {BUDE_HOUSE} from '../../content/bude-house.js';

const SRC='assets/precision/sources/2026-09-23/',OUT='assets/precision/runtime/buildings/',PX=4;
const W=BUDE_HOUSE.width,D=BUDE_HOUSE.depth,PLOT=W+BUDE_HOUSE.yard.width,CUT=BUDE_HOUSE.heights.cut;
mkdirSync(OUT,{recursive:true});
const load=name=>decodePng(readFileSync(SRC+name));
function exportRegion(src,box,scale,file){
 const dst=surface(Math.round(box.w*scale),Math.round(box.h*scale));
 resample(src,dst,box,{x:0,y:0},scale,{palette:true});
 // Innenansicht ist deckend; außen bleibt die harte Alpha-Kante des Originals.
 writeFileSync(OUT+file,encodePng(dst));return {file,width:dst.width,height:dst.height};
}

// Innen: das Original folgt der Vorlage, also gilt ihre Registrierung (5 px/E, Nordwest-Ecke bei origin).
const innen=load('bude-haus-innen.png'),g=GUIDE.innen;
if(innen.width!==g.width||innen.height!==g.height)throw Error('Innenansicht hat nicht das Format der Vorlage');
const inner={x:-4,y:-CUT-4,w:PLOT+4,h:D+4+CUT+4}; // Hauskoordinaten: linke Außenwand bis Hofrand, Wandkrone bis Sockel
const innenBox={x:Math.round(g.origin.x+inner.x*g.scale),y:Math.round(g.origin.y+inner.y*g.scale),w:Math.round(inner.w*g.scale),h:Math.round(inner.h*g.scale)};
const innenOut=exportRegion(innen,innenBox,PX/g.scale,'bude-haus-innen.png');

// Außen: Fassade vermessen – linke/rechte Kante auf halber Sockelhöhe, Unterkante in der Mitte = Hausfront (y = D).
const aussen=load('bude-haus-aussen.png'),A=aussen,opaque=(x,y)=>A.data[(y*A.width+x)*4+3]>=128;
let bottom=A.height-1;const mid=Math.round(A.width/2);while(bottom>0&&!opaque(mid,bottom))bottom--;
const row=bottom-12;let x0=0,x1=A.width-1;while(x0<A.width&&!opaque(x0,row))x0++;while(x1>0&&!opaque(x1,row))x1--;
const s=(x1-x0+1)/W;let top=0;while(top<A.height&&![...Array(A.width).keys()].some(x=>opaque(x,top)))top++;
let left=0,right=A.width-1;const colHas=x=>{for(let y=top;y<=bottom;y++)if(opaque(x,y))return true;return false;};while(!colHas(left))left++;while(!colHas(right))right--;
const aussenBox={x:left,y:top,w:right-left+1,h:bottom-top+1};
const aussenOut=exportRegion(aussen,aussenBox,PX/s,'bude-haus-aussen.png');

const meta={
 format:'bude-haus-v1',pxPerUnit:PX,
 innen:{...innenOut,local:{x:inner.x,y:inner.y},houseWidth:W},
 aussen:{...aussenOut,local:{x:(left-x0)/s,y:D-(bottom-top+1)/s},measured:{facadeLeft:x0,facadeRight:x1,bottom,sourcePxPerUnit:+s.toFixed(4)}}
};
writeFileSync(OUT+'bude-haus.json',JSON.stringify(meta,null,1)+'\n');
console.log(JSON.stringify(meta));
