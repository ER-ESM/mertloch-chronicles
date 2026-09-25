// Codex-Lauf 2026-09-26 (docs/ICONS-CODEX-2026-09-26.md): Auftragsblätter aus dem Generator, Motive je Talent,
// Glyphenregel, Reihenfolge der Warteschlange und Export erst mit vorhandenem Original.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {buildSheets,buildCrops,FILES,REFS,NEW_CLASSES} from '../tools/sprite-pipeline/icons-codex-jobs.mjs';
import {TALENT_MOTIFS,GLYPHS} from '../tools/sprite-pipeline/icons-codex-motive.mjs';
import {QUEUE,pendingJobs} from '../tools/sprite-pipeline/icons-codex-lauf.mjs';
import {runJobs} from '../tools/sprite-pipeline/imagegen.mjs';
import {CLASS_SPECS,TALENT_ROWS} from '../content/talents.js';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root)),json=p=>JSON.parse(read(p));

test('Auftragsblätter und Stilvorlagen stimmen mit dem Generator überein',()=>{
 const {sheets,problems}=buildSheets();assert.deepEqual(problems,[]);
 for(const [p,list]of sheets)assert.equal(read(p).toString(),JSON.stringify(list,null,1)+'\n',p+': node tools/sprite-pipeline/icons-codex-jobs.mjs');
 for(const [p,bytes]of buildCrops())assert.ok(read(p).equals(bytes),p);
});

test('jeder Auftrag trägt das Format der Bildpipeline, Referenzen existieren',()=>{
 for(const f of Object.values(FILES))for(const j of json(f)){
  assert.ok(j.id&&j.output&&j.kind&&j.date&&j.tool,f+' '+j.id);assert.ok(j.width>0&&j.height>0&&j.padding>=0,j.id);
  assert.ok(j.prompt.length>100,j.id);assert.ok(j.references.length&&j.references.every(r=>existsSync(new URL(r,root))),j.id+' Referenz');
 }
});

test('Talent-Atlanten: je Spez 30 Motive in Speicherreihenfolge, Glyphen nur oben rechts aus dem festen Satz',()=>{
 const jobs=json(FILES.talente);assert.equal(jobs.length,6);
 for(const cls of NEW_CLASSES)for(const spec of CLASS_SPECS[cls]){
  const j=jobs.find(x=>x.spec===spec);assert.ok(j,spec);assert.equal(j.output,'assets/content-art/e32/sources/'+spec+'-v1.png');
  assert.equal(j.references[0],REFS.talent);assert.equal(j.entries.length,30);
  const lines=j.prompt.split('\n').slice(1);assert.equal(lines.length,30);
  TALENT_ROWS[spec].forEach((t,i)=>{assert.equal(j.entries[i].id,spec+'-'+i);assert.equal(j.entries[i].name,t.name);assert.ok(lines[i].startsWith(`${i+1}. ${t.name}: `),lines[i]);
   const g=TALENT_MOTIFS[spec][i][2];if(g){assert.ok(GLYPHS[g]);assert.ok(Object.keys(t.effects).length,spec+'-'+i+' Freischalt-Talent mit Glyphe');}});
  assert.match(j.prompt,/top-right corner/);assert.match(j.prompt,/bottom-right corner of every cell free/);assert.match(j.prompt,/upper left/);
 }
});

test('Kacheln: Spez-Symbole, geschärfte Kniffe und dichte Dieter-Kniffe nach Stilbibel B',()=>{
 const spez=json(FILES.spez),dicht=json(FILES.dicht),e71=json(FILES.e71);
 assert.deepEqual(spez.map(j=>j.id),NEW_CLASSES.flatMap(c=>CLASS_SPECS[c].map(s=>'skill-'+c+'-'+s)));
 assert.deepEqual(dicht.map(j=>j.id),['skill-dieter-strike','skill-dieter-heal','skill-dieter-parry','skill-dieter-dash']);
 for(const j of [...spez,...dicht,...e71]){
  assert.equal(j.kind,'skills');assert.equal(j.width,64);
  for(const m of ['#263530','#354b36','drop shadow','upper left','55 percent','edge to edge'])assert.ok(j.prompt.includes(m),j.id+' '+m);
  assert.ok(j.references.includes(REFS.kniff),j.id);
 }
 for(const j of e71.filter(j=>j.id.endsWith('-auto')))assert.ok(j.references.includes(REFS.auto)&&/circular arrows/.test(j.prompt),j.id);
});

test('Warteschlange: Talente → Spez → Kniffe (die drei schwächsten zuerst) → dichte Kniffe',()=>{
 assert.deepEqual(QUEUE.map(q=>q.group),['talente','spez','kniffe','dicht']);
 const k=pendingJobs().filter(p=>p.group==='kniffe').map(p=>p.job.id);
 assert.deepEqual(k.slice(0,3),['skill-schorsch-parry','skill-kaethe-dash','skill-kevin-reload']);
});

test('Trockenlauf fordert kein Bild an und schreibt keine Herkunft',()=>{
 const before=read('assets/precision/generation.json').toString();
 for(const f of Object.values(FILES)){const {done}=runJobs(f,{dryRun:true,force:true});assert.equal(done.length,0);}
 assert.equal(read('assets/precision/generation.json').toString(),before);
});

test('Export: neue Kacheln gelten erst mit Original, dann mit ihrer Quelle',()=>{
 const cat=json('assets/precision/runtime/catalog.json').assets;
 for(const j of [...json(FILES.spez),...json(FILES.dicht)]){
  if(existsSync(new URL(j.output,root)))assert.equal(cat[j.id]?.source,j.output,j.id);
  else assert.notEqual(cat[j.id]?.source,j.output,j.id);
 }
});
