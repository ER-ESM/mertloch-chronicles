import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {decodePng,encodePng,surface,blit,bounds} from './png.mjs';
import {segment} from './segment.mjs';
import {styles,actors,poses,clips,frameSize as N,pivot} from './config.mjs';
const root=new URL('../../assets/sprite-lab/',import.meta.url);
const hash=b=>createHash('sha256').update(b).digest('hex');
const rgb=h=>[0,2,4].map(i=>parseInt(h.slice(i,i+2),16));
function feet(image,b){let sum=0,n=0;for(let y=b.y+Math.floor(b.h*.92);y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)if(image.data[(y*image.width+x)*4+3]>=128){sum+=x;n++;}return n?sum/n:b.x+b.w/2;}
export function build(){const output=new Map(),catalog={version:1,status:'style-prototypes',frameSize:N,pivot,actors,poses,clips,styles:[],coverage:{drawnDirections:1,mirroredDirections:1,posesPerActor:8,modularStates:['idle']}};
 for(const style of styles){const raw=readFileSync(new URL('sources/'+style.id+'.png',root)),source=decodePng(raw),cells=segment(source,8,4),atlas=surface(N*8,N*4),palette=style.palette.map(rgb),frames=[];
  cells.forEach((b,i)=>{if(b.x<2||b.y<2||b.x+b.w>source.width-2||b.y+b.h>source.height-2)throw Error('Source silhouette touches edge: '+style.id+'/'+i);const row=Math.floor(i/8),scale=(row===3?style.boarHeight:style.bodyHeight)/cells[row*8].h,dx=pivot.x-Math.round((feet(source,b)-b.x)*scale),dy=pivot.y-Math.round(b.h*scale),frame=surface(N,N);blit(source,frame,b,{x:dx,y:dy},scale,palette);const visible=bounds(frame);if(visible.x<2||visible.y<2||visible.x+visible.w>N-2||visible.y+visible.h>N-2)throw Error('Insufficient frame padding');blit(frame,atlas,{x:0,y:0,w:N,h:N},{x:i%8*N,y:row*N});frames.push({actor:actors[row],pose:poses[i%8],source:b,scale,bounds:visible});});
  const partsRaw=readFileSync(new URL('sources/'+style.id+'-parts.png',root)),partsSource=decodePng(partsRaw),partCells=segment(partsSource,4,3),partsAtlas=surface(N*4,N*3),parts=[];
  partCells.forEach((b,i)=>{const row=Math.floor(i/4),kind=['head','torso','legs'][row],height=style.parts[kind],scale=height/b.h,w=Math.round(b.w*scale),h=Math.round(b.h*scale);blit(partsSource,partsAtlas,b,{x:i%4*N,y:row*N},scale,palette);parts.push({id:kind+'-'+i%4,kind,variant:i%4,rig:i%4<2?'stocky':'slim',direction:'se',state:'idle',rect:{x:i%4*N,y:row*N,w,h},source:b,socket:kind==='head'?{x:Math.round(w*.52),y:h-1}:kind==='torso'?{neck:{x:Math.round(w*style.parts.neckX),y:1},waist:{x:Math.round(w*.52),y:Math.round(h*style.parts.waistY)}}:{x:Math.round(w*.5),y:1}});});
  const atlasBytes=encodePng(atlas),partsBytes=encodePng(partsAtlas);output.set(style.id+'.png',atlasBytes);output.set(style.id+'-parts.png',partsBytes);catalog.styles.push({...style,atlas:style.id+'.png',partsAtlas:style.id+'-parts.png',sourceHash:hash(raw),partsSourceHash:hash(partsRaw),atlasHash:hash(atlasBytes),partsHash:hash(partsBytes),frames,modules:parts});
 }
 output.set('catalog.json',Buffer.from(JSON.stringify(catalog,null,2)+'\n'));return output;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){mkdirSync(new URL('runtime/',root),{recursive:true});const output=build();for(const [name,data] of output)writeFileSync(new URL('runtime/'+name,root),data);console.log('Built 96 frames, 36 modules; '+[...output.values()].reduce((n,b)=>n+b.length,0)+' runtime bytes.');}
