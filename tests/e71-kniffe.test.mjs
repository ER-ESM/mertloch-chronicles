// E-72 Kniff-Icons (Klassen-Ressourcen): per Code gezeichnete Originale (tools/sprite-pipeline/e71-kniffe-draw.mjs),
// Herkunft, Kachelform, Export in den Präzisionskatalog und Abdeckung der Leisten von Schorsch, Käthe, Dieter und Kevin.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {IDS,iconPng,PROVENANCE,TOOL} from '../tools/sprite-pipeline/e71-kniffe-draw.mjs';
import {decodePng} from '../tools/sprite-pipeline/png.mjs';
import {RESOURCE_SKILLS,CLASS_BUFFS} from '../content/index.js';
import {skillsFor} from '../clan.js';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root)),sha=b=>createHash('sha256').update(b).digest('hex');
const jobs=JSON.parse(read('tools/sprite-pipeline/e71-kniffe-jobs.json')),catalog=JSON.parse(read('assets/precision/runtime/catalog.json')),prov=JSON.parse(read(PROVENANCE));

test('Auftragsblatt und Zeichenwerkzeug decken dieselben 28 Kniffe ab',()=>{
 assert.equal(jobs.length,28);
 assert.deepEqual([...IDS].sort(),jobs.map(j=>j.id).sort());
 for(const j of jobs){assert.equal(j.output,'assets/precision/sources/2026-09-25/e71-kniffe/'+j.id+'.png');assert.equal(j.kind,'skills');assert.equal(j.width,64);assert.equal(j.height,64);assert.equal(j.padding,3);}
});

test('per Code gezeichnete Originale: Herkunft vollständig und byte-genau nachzeichenbar',()=>{
 assert.equal(prov.kind,'code');
 for(const r of prov.records){
  assert.equal(r.kind,'code');assert.equal(r.tool,TOOL);assert.ok(existsSync(new URL(r.tool,root)));
  const bytes=read(r.output);
  assert.equal(sha(bytes),r.sha256,r.id+': Original ersetzt (z. B. Imagegen)? Dann den Eintrag aus herkunft.json entfernen.');
  assert.deepEqual(iconPng(r.id),bytes,r.id+': Zeichenwerkzeug und Original weichen ab – node '+TOOL+' --only='+r.id);
 }
 // Jedes Original ist belegt: per Code (herkunft.json) oder per Imagegen (generation.json).
 const generated=new Set(JSON.parse(read('assets/precision/generation.json')).records.map(r=>r.output));
 for(const j of jobs)assert.ok(prov.records.some(r=>r.output===j.output)||generated.has(j.output),j.id+' ohne Herkunft');
});

test('Kachelform wie die Dieter-/Kevin-Kniffe: 3 px Rand frei, 58 × 58 deckend, Tintenrand',()=>{
 for(const r of prov.records){
  const im=decodePng(read(r.output));
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){const inside=x>=3&&y>=3&&x<61&&y<61;assert.equal(im.data[(y*64+x)*4+3],inside?255:0,r.id+' '+x+','+y);}
  for(const [x,y] of [[3,3],[60,3],[3,60],[60,60],[30,3],[3,30]])assert.equal([...im.data.subarray((y*64+x)*4,(y*64+x)*4+3)].join(','),'23,31,41',r.id+' Rand '+x+','+y);
 }
});

test('Export: jede Kniff-ID liegt im Präzisionskatalog und zeigt auf ihr Original',()=>{
 for(const j of jobs){const a=catalog.assets[j.id];assert.ok(a,j.id);assert.equal(a.source,j.output);assert.equal(a.kind,'skills');
  assert.equal(a.width,64);assert.equal(a.path,'assets/precision/runtime/skills/'+j.id+'.png');}
});

test('Leisten: jeder Kniff der neuen Klassen und jeder Ressourcen-Kniff hat ein eigenes Bild',()=>{
 // Käthes Plätze 1–3 zeigen die Karte der Hand (prozedural), Klassenbuffs malt paintClassBuffIcon.
 const drawnBySpiel={kaethe:['strike','mark','burst']};
 for(const member of ['schorsch','kaethe'])for(const s of skillsFor(member)){
  if(CLASS_BUFFS[s.id]||drawnBySpiel[member]?.includes(s.id))continue;
  assert.ok(catalog.assets['skill-'+member+'-'+s.id],member+'/'+s.id);}
 for(const [id,def] of Object.entries(RESOURCE_SKILLS))assert.ok(catalog.assets['skill-'+def.cls+'-'+id],def.cls+'/'+id);
});
