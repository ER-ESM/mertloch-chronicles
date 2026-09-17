import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildRefinement,composeFrame} from '../tools/sprite-pipeline/build-refinement.mjs';
import {decodePng,bounds} from '../tools/sprite-pipeline/png.mjs';
import {styles} from '../tools/sprite-pipeline/config.mjs';
import {enumerateRecipes,recipeFromSeed,layout,recolor} from '../refinement-library.js';
const root=new URL('../',import.meta.url),built=buildRefinement(),{catalog,images}=built;
test('refinement artifacts are complete and reproduce from their recorded originals',()=>{
 assert.deepEqual(catalog.missing,[]);for(const[path,data]of built.files)assert.deepEqual(data,readFileSync(new URL(path,root)),path);
 for(const s of catalog.sources){const bytes=readFileSync(new URL(s.path,root));assert.equal(createHash('sha256').update(bytes).digest('hex'),s.hash);const meta=JSON.parse(readFileSync(new URL(s.path.replace('.png','.json'),root)));assert.ok(meta.prompt.length>100);assert.equal(meta.output,s.path);}
});
test('all display PNGs retain hard alpha and the common palette; icons have clean margins',()=>{
 const palette=new Set(styles.find(s=>s.id==='detailpixel').palette.map(h=>h.toLowerCase()));
 for(const[path,bytes]of built.files){if(!path.endsWith('.png')||path.endsWith('-mask.png'))continue;const im=decodePng(bytes);
  for(let i=0;i<im.data.length;i+=4){assert.ok(im.data[i+3]===0||im.data[i+3]===255,path);if(im.data[i+3])assert.ok(palette.has([...im.data.subarray(i,i+3)].map(x=>x.toString(16).padStart(2,'0')).join('')),path);}
 }
 for(const a of [...Object.values(catalog.icons),...Object.values(catalog.future)]){const im=images.get(a.path),b=bounds(im);assert.ok(b.x>=2&&b.y>=2&&b.x+b.w<=im.width-2&&b.y+b.h<=im.height-2,a.path);}
});
test('432 compatible combinations fit every directional pose; distinct heads and clothing produce distinct sprites',()=>{
 const recipes=enumerateRecipes(),hashes=new Set();assert.equal(recipes.length,432);
 for(const r of recipes){for(const dir of catalog.directions)for(const pose of catalog.poses)for(const p of layout(catalog,r,dir,pose)){assert.ok(p.at.x>=0&&p.at.y>=0&&p.at.x+p.rect.w<=96&&p.at.y+p.rect.h<=96,JSON.stringify(r));}
  const im=composeFrame(catalog,images,r,0,0),b=bounds(im);assert.ok(b.x>=2&&b.y>=2&&b.x+b.w<=94&&b.y+b.h<=82);hashes.add(createHash('sha256').update(im.data).digest('hex'));
 }
 assert.equal(hashes.size,432);
 assert.throws(()=>layout(catalog,{...recipes[0],rig:'boar'},'se','idle'));
 assert.throws(()=>layout(catalog,recipes[0],'se','cast'));
});
test('seed and population index are reproducible; invalid recipes are rejected',()=>{
 for(let i=0;i<100;i++)assert.deepEqual(recipeFromSeed('Dorf',i),recipeFromSeed('Dorf',i));
 assert.notDeepEqual(recipeFromSeed('Dorf',0),recipeFromSeed('Dorf',1));
 for(const[seed,i]of [['',0],['x',-1],['x',.5],['x'.repeat(201),0]])assert.throws(()=>recipeFromSeed(seed,i));
});
test('semantic recoloring preserves unmasked face, hands and silhouette alpha',()=>{
 const r=recipeFromSeed('Dorf'),base=images.get(catalog.bodies[r.rig].path),mask=images.get(catalog.bodies[r.rig].maskPath),out=recolor(base.data,mask.data,r);let marked=0;
 for(let i=0;i<out.length;i+=4){assert.equal(out[i+3],base.data[i+3]);if(!mask.data[i+3])assert.deepEqual([...out.subarray(i,i+4)],[...base.data.subarray(i,i+4)]);else marked++;}
 assert.ok(marked>100);
});
