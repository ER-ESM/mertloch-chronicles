import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {runJobs} from '../tools/sprite-pipeline/imagegen.mjs';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8');

// Trockenlauf: prüft Auswahl und Auftragsformat, ohne ein Bild anzufordern.
test('imagegen dry run selects jobs and writes nothing', ()=>{
 const before=existsSync(new URL('assets/precision/generation.json',root))&&read('assets/precision/generation.json');
 const {done,skipped}=runJobs('tools/sprite-pipeline/grafik-20260923-jobs.json',{dryRun:true,force:true});
 assert.equal(done.length,0);
 assert.equal(skipped.length,0);
 assert.equal(read('assets/precision/generation.json'),before);
});

test('imagegen skips delivered motifs unless forced', ()=>{
 const {done,skipped}=runJobs('tools/sprite-pipeline/grafik-20260923-jobs.json',{only:['prop-bude-schild']});
 assert.deepEqual(done,[]);
 assert.deepEqual(skipped,['prop-bude-schild']);
});

test('imagegen refuses an unknown job id', ()=>{
 assert.throws(()=>runJobs('tools/sprite-pipeline/grafik-20260923-jobs.json',{only:['gibt-es-nicht']}),/Kein Auftrag/);
});

// Jeder Auftrag muss das tragen, was die Herkunft in generation.json braucht.
test('every job sheet entry carries id, output, size and a real prompt', ()=>{
 for(const job of JSON.parse(read('tools/sprite-pipeline/grafik-20260923-jobs.json'))){
  assert.ok(job.id&&job.output.startsWith('assets/precision/sources/'),job.id);
  assert.ok(job.width>0&&job.height>0,job.id);
  assert.ok(job.prompt.length>100,job.id);
 }
});
