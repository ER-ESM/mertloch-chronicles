import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {decodePng,encodePng,surface,blit,bounds} from './png.mjs';
import {segment} from './segment.mjs';
import {styles} from './config.mjs';
const root=new URL('../../assets/maifeld-prototype/',import.meta.url),style=styles.find(s=>s.id==='detailpixel'),hash=b=>createHash('sha256').update(b).digest('hex');
export function buildDetail(){const out=new Map(),catalog={version:1,style:'detailpixel',status:'directional-prototype',frameSize:96,pivot:{x:48,y:80},directions:['se','sw','ne','nw'],poses:['idle','walk-a','walk-pass','walk-b','anticipation','impact','cast','hit'],palette:style.palette,actors:[]};
 for(const id of ['anni','dieter','keiler']){const bytes=readFileSync(new URL('sources/'+id+(id==='anni'?'':'-v2')+'.png',root)),im=decodePng(bytes),cells=segment(im,8,4),atlas=surface(768,384),height=id==='keiler'?37:52,scale=height/cells[0].h,frames=[];for(let i=0;i<32;i++){const b=cells[i];if(b.x<2||b.y<2||b.x+b.w>im.width-2||b.y+b.h>im.height-2)throw Error(id+' source clipped '+i);let sum=0,n=0;for(let y=b.y+Math.floor(b.h*.92);y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)if(im.data[(y*im.width+x)*4+3]>=128){sum+=x;n++;}const foot=sum/n,frame=surface(96,96);blit(im,frame,b,{x:48-Math.round((foot-b.x)*scale),y:80-Math.round(b.h*scale)},scale,style.palette.map(h=>[0,2,4].map(k=>parseInt(h.slice(k,k+2),16))));const box=bounds(frame);if(box.x<2||box.y<2||box.x+box.w>94||box.y+box.h>94)throw Error(id+' padding '+i);blit(frame,atlas,{x:0,y:0,w:96,h:96},{x:i%8*96,y:Math.floor(i/8)*96});frames.push({source:b,bounds:box});}const png=encodePng(atlas);out.set(id+'.png',png);catalog.actors.push({id,source:id+(id==='anni'?'':'-v2')+'.png',height,atlas:id+'.png',scale,sourceHash:hash(bytes),atlasHash:hash(png),frames});}
 out.set('catalog.json',Buffer.from(JSON.stringify(catalog,null,2)+'\n'));return out;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){mkdirSync(new URL('runtime/',root),{recursive:true});for(const [name,bytes] of buildDetail())writeFileSync(new URL('runtime/'+name,root),bytes);console.log('Maifeld: 3 actors × 4 directions × 8 poses built.');}
