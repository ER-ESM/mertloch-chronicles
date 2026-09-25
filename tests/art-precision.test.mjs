import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {NPCS,ARCHETYPES,BOSSES,ICONS,CLASS_SPECS} from '../content/index.js';
import {SKILL_ICON_ORDER} from '../skill-art.js';
import {PRECISION_PALETTE,WORLD_ART_DENSITY} from '../art-quality.js';
import {decodePng} from '../tools/sprite-pipeline/png.mjs';
import {buildPrecision} from '../tools/sprite-pipeline/build-precision.mjs';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root)),catalog=JSON.parse(read('assets/precision/runtime/catalog.json')),asset=id=>catalog.assets[catalog.aliases[id]||id],hash=b=>createHash('sha256').update(b).digest('hex');
test('precision covers every present person, mob, boss, item icon, skill and talent',()=>{
 // Personen ohne Präzisionsbogen brauchen eine Figur aus der Sprite-Schmiede (E-58), z. B. die Stammgäste (E-61).
 const forge=JSON.parse(read('assets/forge/runtime/figures/catalog.json')),forged=id=>(forge.assets||forge)[id]?.frames;
 for(const [id,n] of Object.entries(NPCS))if(!n.absent)assert.ok(asset(id)?.frames||forged(id),id);
 for(const id of [...Object.keys(ARCHETYPES),...Object.keys(BOSSES),'cat','chicken',...Array.from({length:8},(_,i)=>'villager'+i)])assert.equal(asset(id)?.frames.length,asset(id)?.columns.length*4,id);
 for(const id of ICONS)assert.ok(asset(id),id);
 const skillHashes=[];for(const [member,ids] of Object.entries(SKILL_ICON_ORDER))for(const id of [...ids,'auto']){const a=asset('skill-'+member+'-'+id);assert.ok(a,id);assert.ok(a.width>=64,id);skillHashes.push(a.hash);}
 assert.equal(new Set(skillHashes).size,skillHashes.length,'Skills have unique art');
 /* E-72: Präzisions-Talentbilder gibt es für die drei E-32-Klassen; Schorsch und Käthe zeichnen ihr Talent-Icon */for(const [member,specs] of Object.entries(CLASS_SPECS).filter(([m])=>['dieter','baerbel','kevin'].includes(m)))for(const spec of specs)for(let i=0;i<10;i++)assert.ok(asset(spec+'-'+i),spec+':'+i);
 assert.deepEqual(catalog.missing,[]);
});
test('precision exports have hard alpha, registered scale, unclipped margins and source hashes',()=>{
 const palette=new Set(PRECISION_PALETTE.map(p=>p.join(','))),sourceHashes=new Map();
 // Eigene Paletten (a.palette): NPC-Porträts tragen die Farben der Anziehpuppe, eingefroren in portraet-palette.json
 const own={portraet:new Set(JSON.parse(read('tools/sprite-pipeline/portraet-palette.json')).map(p=>p.join(',')))};
 for(const [id,a]of Object.entries(catalog.assets)){
  const bytes=read(a.path),im=decodePng(bytes),pal=a.palette?own[a.palette]:palette;assert.ok(pal,id+' Palette '+a.palette);assert.equal(hash(bytes),a.hash,id);assert.equal(im.width,a.width);assert.equal(im.height,a.height);
  if(!sourceHashes.has(a.source))sourceHashes.set(a.source,hash(read(a.source)));assert.equal(sourceHashes.get(a.source),a.sourceHash,id);
  for(let i=0;i<im.data.length;i+=4){assert.ok(im.data[i+3]===0||im.data[i+3]===255,id+' alpha');if(im.data[i+3])assert.ok(pal.has([...im.data.subarray(i,i+3)].join(',')),id+' palette');}
  if(a.columns){assert.equal(a.nativeHeight/a.worldHeight,WORLD_ART_DENSITY,id);for(const f of a.frames){assert.ok(f.bounds.x>=2&&f.bounds.y>=2,id);assert.ok(f.bounds.x+f.bounds.w<=a.frameSize-2&&f.bounds.y+f.bounds.h<=a.frameSize-2,id);}}
 }
});
test('precision originals preserve actual generation prompts, references and provenance',()=>{
 const records=JSON.parse(read('assets/precision/generation.json')).records;
 for(const r of records){assert.ok(r.prompt.length>100);assert.equal(r.tool,'built-in imagegen');assert.equal(hash(read(r.output)),r.sourceHash);for(const p of r.references)assert.ok(read(p).length);}
});
test('precision export is byte reproducible from original sources',()=>{for(const[p,b]of buildPrecision().files)assert.deepEqual(b,read(p),p);});
test('offline cache includes every precision asset and excludes source and review files',()=>{
 const manifest=read('precache-manifest.js').toString(),urls=JSON.parse(manifest.match(/self.PRECACHE=(.*);/s)[1]).urls;
 for(const a of Object.values(catalog.assets))assert.ok(urls.includes(a.path),a.path);
 assert.ok(urls.includes('assets/precision/runtime/catalog.json'));
 assert.ok(!urls.some(p=>p.startsWith('assets/precision/sources/')||p.startsWith('assets/precision/review/')));
});
