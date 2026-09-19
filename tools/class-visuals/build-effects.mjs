import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {decodePng,encodePng,surface,bounds,blit} from '../sprite-pipeline/png.mjs';
import {resample} from '../sprite-pipeline/precision-resample.mjs';
const root=new URL('../../',import.meta.url),base='assets/content-art/e32/',source=base+'sources/effects-v1.png',bytes=readFileSync(new URL(source,root)),im=decodePng(bytes);
if(im.width!==1402||im.height!==1122)throw Error('Unreviewed effect source');
const xs=[0,280,561,841,1122,1402],ys=[0,355,647,860,1122],atlas=surface(640,512),scale=112/355;
const catalog={source,sha256:createHash('sha256').update(bytes).digest('hex'),cuts:{x:xs,y:ys},path:base+'runtime/effects.png',effects:{}};
for(let i=3;i<im.data.length;i+=4)im.data[i]=im.data[i]>=128?255:0;
for(const [row,id]of ['foam-fountain','metal-overload','prost','spore-cloud'].entries()){
 const e={cell:128,duration:id==='prost'?1:.8,frames:[]};
 for(let col=0;col<5;col++){const b={x:xs[col],y:ys[row],w:xs[col+1]-xs[col],h:ys[row+1]-ys[row]},f=surface(128,128);resample(im,f,b,{x:Math.round((128-b.w*scale)/2),y:Math.round((128-b.h*scale)/2)},scale);const box=bounds(f);if(box.x<2||box.y<2||box.x+box.w>126||box.y+box.h>126)throw Error('Clipped effect');blit(f,atlas,{x:0,y:0,w:128,h:128},{x:col*128,y:row*128});e.frames.push({x:col*128,y:row*128,bounds:box,sha256:createHash('sha256').update(f.data).digest('hex')});}catalog.effects[id]=e;
}
writeFileSync(new URL(catalog.path,root),encodePng(atlas));writeFileSync(new URL(base+'runtime/effects.json',root),JSON.stringify(catalog,null,2)+'\n');
