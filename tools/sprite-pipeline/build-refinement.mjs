import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {surface,decodePng,encodePng,blit,bounds,gridCell} from './png.mjs';
import {styles} from './config.mjs';
import {segment} from './segment.mjs';
import {layout,recolor,heads,directions,poses,recipeFromSeed} from '../../refinement-library.js';
const root=new URL('../../',import.meta.url),folder='assets/content-art/refinement/',palette=styles.find(s=>s.id==='detailpixel').palette.map(h=>[0,2,4].map(k=>parseInt(h.slice(k,k+2),16))),sha=b=>createHash('sha256').update(b).digest('hex');
export const itemIds=['currywurst','kaltgetraenk','fuchsschwanz','flugblatt','hopfen','dosenblech','bierdeckelweste','kabelbinderstiefel','megafon','fuchspfote','schnorrerbecher','praktikantenausweis','giesskanne','automatenarm','topfdeckel','pfandschleuder','dosenklinge','tresenhammer'];
export function buildRefinement({onlyItems=false}={}){
 const files=new Map(),catalog={version:1,status:'reviewed-prototype',style:'Maifeld-Detailpixel',frameSize:96,pivot:{x:48,y:80},humanHeight:52,worldHeight:26,directions,poses,bodies:{},heads:{},hats:{},icons:{},future:{},sources:[],missing:[]},images=new Map();
 const write=(name,im)=>{const path=folder+'runtime/'+name;files.set(path,encodePng(im));images.set(path,im);return path;};
 const jobs=JSON.parse(readFileSync(new URL('refinement-jobs.json',import.meta.url)));
 for(const job of jobs.filter(j=>!onlyItems||j.type==='icons')){
  const source=folder+'sources/'+job.id+'.png';if(!existsSync(new URL(source,root))){catalog.missing.push(job.id);continue;}
  const raw=readFileSync(new URL(source,root)),im=decodePng(raw),cells=segment(im,job.cols,job.rows);
  catalog.sources.push({id:job.id,path:source,hash:sha(raw)});
  if(['icons','future'].includes(job.type)){
   cells.forEach((b,i)=>{const id=job.type==='icons'?itemIds[i]:['ratsche','slop-laptop','wettschein','putzeimer'][i],size=job.type==='icons'?24:32,out=surface(size,size),s=Math.min((size-4)/b.w,(size-4)/b.h);blit(im,out,b,{x:Math.floor((size-Math.round(b.w*s))/2),y:Math.floor((size-Math.round(b.h*s))/2)},s,palette);
    const path=write((job.type==='icons'?'items/':'future/')+id+'.png',out);catalog[job.type==='icons'?'icons':'future'][id]={path,width:size,height:size,source,cell:i,sourceBounds:b};});continue;
  }
  if(job.type==='body'){
   const h=[...cells.filter((_,i)=>[0,2,7].includes(i%8)).map(b=>b.h)].sort((a,b)=>a-b),scale=38/h[Math.floor(h.length/2)],atlas=surface(768,384),mask=surface(768,384),frames=[];
   cells.forEach((b,i)=>{
    const frame=surface(96,96),m=surface(96,96);
    // Collar registration follows the top neck cluster; limbs never define horizontal pivot.
    let sx=0,n=0;for(let y=b.y;y<b.y+Math.max(2,Math.round(b.h*.035));y++)for(let x=b.x;x<b.x+b.w;x++)if(im.data[(y*im.width+x)*4+3]>=128){sx+=x;n++;}
    const x=48-Math.round((sx/n-b.x)*scale),y=80-Math.round(b.h*scale);blit(im,frame,b,{x,y},scale,palette);
    for(let yy=0;yy<Math.round(b.h*scale);yy++)for(let xx=0;xx<Math.round(b.w*scale);xx++){
     const at=((y+yy)*96+x+xx)*4,src=((b.y+Math.min(b.h-1,Math.floor(yy/scale)))*im.width+b.x+Math.min(b.w-1,Math.floor(xx/scale)))*4,[r,g,blue,a]=im.data.subarray(src,src+4);if(a<128)continue;
     const shirt=blue>r*1.2&&blue>g*1.03,pants=!shirt&&g>r*.9&&g>blue*1.10&&yy>38*.4&&yy<38*.9;
     if(shirt||pants){const lum=.2126*r+.7152*g+.0722*blue,shade=lum<(shirt?60:55)?0:lum<(shirt?92:83)?1:2;m.data.set([shirt?255:0,pants?255:0,shade*85,255],at);}
    }
    blit(frame,atlas,{x:0,y:0,w:96,h:96},{x:i%8*96,y:Math.floor(i/8)*96});blit(m,mask,{x:0,y:0,w:96,h:96},{x:i%8*96,y:Math.floor(i/8)*96});
    frames.push({bounds:bounds(frame),neck:{x:48,y:y+3},cell:i});
   });
   const path=write(job.id+'.png',atlas),maskPath=write(job.id+'-mask.png',mask);catalog.bodies[job.rig]={path,maskPath,scale,frames,source};continue;
  }
  if(job.type==='heads'||job.type==='headwear'){
   const atlas=surface(256,256),entries={};
   cells.forEach((b,i)=>{const head=job.type==='heads',row=Math.floor(i/job.cols),col=i%job.cols,id=head?heads[col]:['cap','straw'][row],dir=head?row:col,scale=head?17/b.h:(row===0?16:22)/b.w,w=Math.round(b.w*scale),h=Math.round(b.h*scale),at={x:col*64+Math.floor((64-w)/2),y:row*64+8};
    blit(im,atlas,b,at,scale,palette);entries[id]??={frames:[]};entries[id].frames[dir]={rect:{...at,w,h},socket:head?{x:Math.round(w/2),y:h}:{x:Math.round(w/2),y:Math.min(h-2,Math.round(h*.7))},...(head?{crown:{x:Math.round(w/2),y:6}}:{})};
   });const path=write(job.id+'.png',atlas);for(const[id,entry]of Object.entries(entries))catalog[job.type==='heads'?'heads':'hats'][id]={...entry,path,source};
  }
 }
 if(!catalog.missing.length&&!onlyItems){
  catalog.prototypes=[
   {id:'tuning-timo',name:'Tuning-Timo',prop:'ratsche',recipe:{version:1,rig:'stocky',head:'stubble',shirt:'rust',trousers:'charcoal',hat:'cap'}},
   {id:'gaming-gina',name:'Gaming-Gina',prop:'slop-laptop',recipe:{version:1,rig:'slim',head:'glasses',shirt:'plum',trousers:'charcoal',hat:'none'}},
   {id:'wetten-willi',name:'Wetten-Willi',prop:'wettschein',recipe:{version:1,rig:'stocky',head:'silver',shirt:'moss',trousers:'brown',hat:'straw'}},
   {id:'putz-petra',name:'Putz-Petra',prop:'putzeimer',recipe:{version:1,rig:'slim',head:'copper',shirt:'cream',trousers:'olive',hat:'none'}}
  ];for(const p of catalog.prototypes){p.path=write('future/'+p.id+'.png',composeAtlas(catalog,images,p.recipe));p.recipePath=folder+'runtime/future/'+p.id+'.json';files.set(p.recipePath,Buffer.from(JSON.stringify(p.recipe,null,2)+'\n'));}
  catalog.recipes=[];for(let index=0;index<12;index++){const recipe=recipeFromSeed('Mertloch-Werkstatt',index),atlas=composeAtlas(catalog,images,recipe),path=write('examples/resident-'+index+'.png',atlas);catalog.recipes.push({id:'resident-'+index,recipe,path});}
 }
 if(!onlyItems){const records=readdirSync(new URL(folder+'sources/',root)).filter(n=>n.endsWith('.json')).sort().map(name=>{const meta=JSON.parse(readFileSync(new URL(folder+'sources/'+name,root))),output=folder+'sources/'+name.replace('.json','.png');return{...meta,output,sourceHash:sha(readFileSync(new URL(output,root)))};});catalog.generation=folder+'generation.json';files.set(catalog.generation,Buffer.from(JSON.stringify(records,null,2)+'\n'));}
 files.set(folder+'runtime/catalog.json',Buffer.from(JSON.stringify(catalog,null,2)+'\n'));return{files,catalog,images};
}
export function composeFrame(catalog,images,recipe,row,col){
 const parts=layout(catalog,recipe,directions[row],poses[col]),out=surface(96,96),base=parts[0],source=images.get(base.path),mask=images.get(catalog.bodies[recipe.rig].maskPath),body=surface(96,96),m=surface(96,96);blit(source,body,base.rect,base.at);blit(mask,m,base.rect,base.at);body.data.set(recolor(body.data,m.data,recipe));blit(body,out,{x:0,y:0,w:96,h:96},{x:0,y:0});
 for(const part of parts.slice(1))blit(images.get(part.path),out,part.rect,part.at);return out;
}
export function composeAtlas(catalog,images,recipe){const atlas=surface(768,384);for(let row=0;row<4;row++)for(let col=0;col<8;col++)blit(composeFrame(catalog,images,recipe,row,col),atlas,{x:0,y:0,w:96,h:96},{x:col*96,y:row*96});return atlas;}
if(process.argv[1]===fileURLToPath(import.meta.url)){const{files,catalog}=buildRefinement();for(const[path,data]of files){const url=new URL(path,root);mkdirSync(new URL('./',url),{recursive:true});writeFileSync(url,data);}console.log(JSON.stringify({outputs:files.size,missing:catalog.missing}));}
