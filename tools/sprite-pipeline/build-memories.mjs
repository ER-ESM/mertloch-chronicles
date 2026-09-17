// Technical export only: fixed half-size nearest-neighbour sampling, shared Maifeld palette.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {decodePng,encodePng,surface,blit} from './png.mjs';
import {styles} from './config.mjs';
import {MEMORY_FRAGMENTS} from '../../content/memories.js';
const root=new URL('../../assets/content-art/memories/',import.meta.url);
const palette=styles.find(s=>s.id==='detailpixel').palette.map(c=>[0,2,4].map(i=>parseInt(c.slice(i,i+2),16)));
// Narrative clues need actual blue ink/balls; the world palette has only desaturated slate blues.
palette.push(...['0e1640','152263','223487','354fb0','456acf','6590e0','a7b8e4','7953a6'].map(c=>[0,2,4].map(i=>parseInt(c.slice(i,i+2),16))));
const entries=[];
await mkdir(root,{recursive:true});
for(const memory of MEMORY_FRAGMENTS){
 const source='sources/'+(memory.id==='kastenturm'?'kastenturm-v2':memory.id)+'.png';
 const bytes=await readFile(new URL(source,root)),image=decodePng(bytes);
 if(image.width!==1536||image.height!==1024)throw Error(memory.id+': expected landscape 1536 × 1024');
 const output=surface(768,512);
 blit(image,output,{x:0,y:0,w:1536,h:1024},{x:0,y:0},.5,palette);
 const png=encodePng(output);await writeFile(new URL(memory.id+'.png',root),png);
 entries.push({id:memory.id,title:memory.title,file:memory.id+'.png',source,width:768,height:512,panels:memory.id==='wurst-ins-gesicht'?2:1,bytes:png.length,sha256:createHash('sha256').update(png).digest('hex'),sourceSha256:createHash('sha256').update(bytes).digest('hex')});
}
await writeFile(new URL('catalog.json',root),JSON.stringify({version:1,palette:'Maifeld-Detailpixel / 40 base + 8 illustration blues',sampling:'nearest-neighbour 2:1; no blur; opaque',entries},null,2)+'\n');
console.log(JSON.stringify({images:entries.length,bytes:entries.reduce((n,e)=>n+e.bytes,0)}));
