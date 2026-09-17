import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildHandoff} from '../tools/sprite-pipeline/build-handoff.mjs';
import {decodePng,bounds} from '../tools/sprite-pipeline/png.mjs';
import {styles} from '../tools/sprite-pipeline/config.mjs';
const root=new URL('../',import.meta.url),jobs=JSON.parse(readFileSync(new URL('../tools/sprite-pipeline/handoff-jobs.json',import.meta.url))),catalog=JSON.parse(readFileSync(new URL('../assets/content-art/handoff-catalog.json',import.meta.url)));
const palette=new Set(styles.find(s=>s.id==='detailpixel').palette.map(x=>x.toLowerCase()));

test('all generated originals have recorded prompts, provenance and matching checksums',()=>{
 const records=JSON.parse(readFileSync(new URL('../assets/content-art/generation-2026-09-17.json',import.meta.url)));
 const revised=JSON.parse(readFileSync(new URL('../assets/content-art/refinement/runtime/catalog.json',import.meta.url)));for(const s of revised.sources)records.push({...JSON.parse(readFileSync(new URL(s.path.replace('.png','.json'),root))),sourceHash:s.hash});
 assert.equal(new Set(records.map(r=>r.output)).size,records.length);
 for(const r of records){
  assert.ok(r.prompt.length>100,r.output);assert.equal(r.tool,'built-in imagegen');assert.ok(r.originalFile.endsWith('.png'));
  assert.equal(createHash('sha256').update(readFileSync(new URL(r.output,root))).digest('hex'),r.sourceHash,r.output);
  for(const reference of r.references||[])assert.ok(existsSync(new URL(reference,root)),reference);
 }
 for(const a of Object.values(catalog.assets)){const r=records.find(r=>r.output===a.source);assert.ok(r,a.source);assert.equal(r.sourceHash,a.sourceHash);}
});
test('delivered artwork exports reproduce exactly from their documented sources',()=>{for(const[path,bytes]of buildHandoff())assert.deepEqual(bytes,readFileSync(new URL(path,root)),path);});
test('every delivered PNG uses hard alpha, the shared palette and transparent cell margins',()=>{
 for(const[id,a]of Object.entries(catalog.assets)){
  const im=decodePng(readFileSync(new URL(a.path,root)));assert.equal(im.width,a.width);assert.equal(im.height,a.height);
  for(let i=0;i<im.data.length;i+=4){const alpha=im.data[i+3];assert.ok(alpha===0||alpha===255,id+' soft alpha');if(alpha)assert.ok(palette.has([...im.data.subarray(i,i+3)].map(x=>x.toString(16).padStart(2,'0')).join('')),id+' palette');}
  for(const f of a.frames||[{x:0,y:0}]){const b=bounds(im,{x:f.x,y:f.y,w:a.frames?a.frameSize:im.width,h:a.frames?a.frameSize:im.height});assert.ok(b.x>=f.x+(a.padding??2)&&b.y>=f.y+(a.padding??2),id+' upper margin');assert.ok(b.x+b.w<=f.x+(a.frames?a.frameSize-2:im.width-(a.padding??2))&&b.y+b.h<=f.y+(a.frames?a.frameSize-2:im.height-(a.padding??2)),id+' lower margin');}
 }
});
test('each declared delivery has a stable ID and generated actors have four complete directions',()=>{
 assert.equal(new Set(jobs.map(j=>j.id)).size,jobs.length);
 for(const[id,a]of Object.entries(catalog.assets)){const job=jobs.find(j=>j.id===(a.job||id));assert.ok(job,id);assert.ok(existsSync(new URL(a.source,root)));if(a.frames){assert.equal(a.frames.length,job.cols*4);assert.equal(a.height,a.frameSize*4);assert.ok(a.worldHeight>0);for(const f of a.frames)if(f.sockets)for(const p of [f.sockets.main,f.sockets.off,f.sockets.head,...f.sockets.feet])assert.ok(p.x>0&&p.x<96&&p.y>0&&p.y<96,id+' gear socket');}else{assert.equal(a.width,job.motifs?48:job.width);assert.equal(a.height,job.motifs?48:job.height);}}
});
test('the complete handoff and all eighteen proc motives are present',()=>{
 assert.deepEqual(catalog.missing,[]);
 assert.equal(Object.keys(catalog.assets).length,jobs.reduce((n,j)=>n+(j.motifs?.length||1),0));
 for(const j of jobs)for(const id of j.motifs?.map(m=>m.id)||[j.id])assert.ok(catalog.assets[id],id);
 const hashes=Object.values(catalog.assets).filter(a=>!a.frames).map(a=>a.hash);assert.equal(new Set(hashes).size,hashes.length,'Icons must have distinct images');
 for(const id of Object.values(catalog.aliases))assert.ok(catalog.assets[id]);
 for(const a of Object.values(catalog.assets).filter(a=>a.frames))assert.equal(a.nativeHeight,a.worldHeight*2);
});
test('proc patches retain the original talent indices and leave other cells empty',()=>{
 for(const[member,p]of Object.entries(catalog.patches)){
  assert.deepEqual(p.indices,[1,5,11,15,21,25]);const atlas=decodePng(readFileSync(new URL(p.path,root)));
  for(let i=0;i<30;i++){const a=Object.values(catalog.assets).find(a=>a.member===member&&a.talentIndex===i),icon=a&&decodePng(readFileSync(new URL(a.path,root)));
   for(let y=0;y<48;y++)for(let x=0;x<48;x++){const at=((Math.floor(i/5)*48+y)*240+i%5*48+x)*4;
    if(icon)assert.deepEqual(atlas.data.subarray(at,at+4),icon.data.subarray((y*48+x)*4,(y*48+x)*4+4));
    else assert.equal(atlas.data[at+3],0,'untouched talent '+member+':'+i);
   }
  }
 }
 const frame=catalog.assets['ui-proc-frame'],im=decodePng(readFileSync(new URL(frame.path,root)));assert.equal(im.data[(24*48+24)*4+3],0,'Proc frame must not obscure skill icon');
});
