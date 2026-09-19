// Quellen-Wächter: Konfliktmarker und Syntaxfehler stoppen den Build.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {sourceProblems} from '../scripts/source-guard.mjs';

test('Marker und Syntaxfehler werden gemeldet, saubere Quellen nicht',()=>{
 const dir=mkdtempSync(join(tmpdir(),'mertloch-guard-'));
 try{
  writeFileSync(join(dir,'gut.js'),'export const a=1;// ======= im Kommentar ist harmlos\n');
  assert.deepEqual(sourceProblems(dir),[]);
  writeFileSync(join(dir,'marker.css'),'a{}\n<<<<<<< HEAD\nb{}\n=======\nc{}\n>>>>>>> abc (x)\n');
  writeFileSync(join(dir,'kaputt.js'),'export const =;\n');
  const p=sourceProblems(dir);assert.equal(p.length,2);assert.match(p.join('|'),/marker\.css: Konfliktmarker/);assert.match(p.join('|'),/kaputt\.js: Syntaxfehler/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
