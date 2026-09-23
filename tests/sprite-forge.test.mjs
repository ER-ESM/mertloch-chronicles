// Sprite-Schmiede (E-58): Katalog und Dateien passen zusammen, nur Palettenfarben mit harter Alphakante, Export reproduzierbar.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {decodePng,encodePng} from '../tools/sprite-pipeline/png.mjs';
import {PRECISION_PALETTE} from '../art-quality.js';
import {KIT_SPRITES} from '../content/sprite-kit.js';

const KIT='assets/forge/runtime/kit/',FIG='assets/forge/runtime/figures/';
const palette=new Set(PRECISION_PALETTE.map(p=>p.join(',')));

test('Schmiede-Baukasten: jede Katalogzeile hat ihr Bild in passender Größe und gehört zu einer Art',()=>{
 if(!existsSync(KIT+'kit-forge.json'))return;
 const cat=JSON.parse(readFileSync(KIT+'kit-forge.json','utf8'));
 assert.equal(cat.pxPerUnit,4);
 for(const [id,s] of Object.entries(cat.sprites)){
  assert.ok(KIT_SPRITES[id],'unbekannte Art: '+id);
  const img=decodePng(readFileSync(KIT+s.file));
  assert.equal(img.width,s.width*(s.frames||1),id+': Breite × Bilder');assert.equal(img.height,s.height,id+': Höhe');
  if(s.frames)assert.ok(s.frames<=8&&s.fps>0,id+': höchstens 8 Bilder mit Takt');
 }
});

test('Schmiede-Sprites: nur Palettenfarben und harte Alphakante',()=>{
 const files=[];
 if(existsSync(KIT+'kit-forge.json'))for(const s of Object.values(JSON.parse(readFileSync(KIT+'kit-forge.json','utf8')).sprites))files.push(KIT+s.file);
 if(existsSync(FIG+'catalog.json'))for(const a of Object.values(JSON.parse(readFileSync(FIG+'catalog.json','utf8')).assets))files.push(a.path);
 for(const f of files){const {data}=decodePng(readFileSync(f));
  for(let i=0;i<data.length;i+=4){const a=data[i+3];if(!a)continue;assert.equal(a,255,f+': weiche Alphakante');
   const c=data[i]+','+data[i+1]+','+data[i+2];assert.ok(palette.has(c)||c==='41,59,68',f+': Farbe außerhalb der Palette '+c);}}
});

test('Schmiede-Figuren: Bogenformat des Präzisionskatalogs',()=>{
 if(!existsSync(FIG+'catalog.json'))return;
 const cat=JSON.parse(readFileSync(FIG+'catalog.json','utf8'));
 assert.deepEqual(cat.directions,['se','sw','ne','nw']);
 for(const [id,a] of Object.entries(cat.assets)){const img=decodePng(readFileSync(a.path));
  assert.equal(a.frameSize,192);assert.deepEqual(a.pivot,{x:96,y:160});assert.equal(a.nativeHeight,104);assert.equal(a.worldHeight,26);
  assert.equal(img.width,192*a.columns.length,id);assert.equal(img.height,192*4,id);assert.equal(a.frames.length,a.columns.length*4,id);}
});

test('Schmiede-Export ist byte-gleich reproduzierbar',async()=>{
 const {loadModels,renderModel}=await import('../tools/sprite-forge/kit.mjs');
 const m=(await loadModels()).stuhl;if(!m)return;
 const a=encodePng(renderModel('stuhl',m).sheet),b=encodePng(renderModel('stuhl',m).sheet);
 assert.ok(a.equals(b));
});
