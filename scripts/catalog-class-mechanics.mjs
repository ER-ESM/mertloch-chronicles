// Catalog the generated PNGs without changing their pixels or alpha.
import {readFileSync,writeFileSync} from 'node:fs';
import {decodePng,bounds} from '../tools/sprite-pipeline/png.mjs';
const layouts={
 dieter:{x:[0,420,825,1254],y:[0,545,865,1254],specs:['wall','brawl','brew']},
 baerbel:{x:[0,435,836,1254],y:[0,424,835,1254],specs:['care','feedback','stage']},
 kevin:{x:[0,423,795,1254],y:[0,622,906,1254],specs:['fuse','iron','hunt']}
};
const catalog={version:1,atlases:{},sprites:{}};
for(const [cls,{x,y,specs}]of Object.entries(layouts)){
 const file='assets/class-mechanics/runtime/'+cls+'.png',im=decodePng(readFileSync(new URL('../'+file,import.meta.url)));
 catalog.atlases[file]={width:im.width,height:im.height};
 for(let col=0;col<3;col++)for(let row=0;row<3;row++){
  const {count,...rect}=bounds(im,{x:x[col],y:y[row],w:x[col+1]-x[col],h:y[row+1]-y[row]});
  catalog.sprites[cls+'-'+specs[col]+'/'+['emblem','empty','full'][row]]={atlas:file,...rect};
 }
}
writeFileSync(new URL('../assets/class-mechanics/runtime/catalog.json',import.meta.url),JSON.stringify(catalog,null,2)+'\n');
console.log('Cataloged 27 class mechanic sprites; original PNG pixels preserved.');
