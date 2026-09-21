// Auflösungs-Automatik (E-49): reine Logik, ohne Browser prüfbar.
import test from 'node:test';
import assert from 'node:assert/strict';
import {QualityGovernor} from '../quality-governor.js';
import {PERFORMANCE} from '../content/index.js';
import {worldDensity} from '../art-quality.js';
const R=PERFORMANCE.autoRes,run=(g,gap,work,ms)=>{const out=[];for(let t=0;t<ms;t+=gap){const s=g.frame(gap,work);if(s)out.push(s);}return out;};

test('flüssiges Spiel bleibt, wie es ist; zu langsames senkt die Stufe – und nach jeder Senkung wird neu gemessen',()=>{
 assert.deepEqual(run(new QualityGovernor(R),16.7,8,20000),[]);
 const steps=run(new QualityGovernor(R),31,20,R.window*31*2+100);assert.deepEqual(steps,['down','down']);
});
test('Pausen zählen nicht als langsame Bilder',()=>{const g=new QualityGovernor(R);run(g,16.7,3,3000);assert.equal(g.frame(5000,3),null);assert.deepEqual(run(g,16.7,3,3000),[]);});
test('hoch geht es erst nach langer guter Phase mit wenig Rechenzeit – und nach zwei gescheiterten Versuchen gar nicht mehr',()=>{
 assert.deepEqual(run(new QualityGovernor(R),16.7,R.upWorkMs+4,R.upAfterMs*2),[],'viel eigene Rechenzeit: keine Luft nach oben');const g=new QualityGovernor(R);
 for(let i=0;i<R.maxUpTries;i++){assert.deepEqual(run(g,16.7,2,R.upAfterMs+2000),['up']);assert.deepEqual(run(g,30,2,240),['down'],'Versuch scheitert: nach wenigen langsamen Bildern wieder herunter');}
 assert.deepEqual(run(g,16.7,2,R.upAfterMs*3),[],'bleibt unten');
});
test('Dichte: Deckel der Automatik darf unter 2 liegen, nie über der Bildschirmdichte; volle Auflösung gewinnt',()=>{
 assert.equal(worldDensity(2,false,1,1),1);assert.equal(worldDensity(2,false,1,3),2);assert.equal(worldDensity(2,false,2,2),2);assert.equal(worldDensity(2,true,1,1),4);assert.equal(worldDensity(2,false,1,null),2);
});
