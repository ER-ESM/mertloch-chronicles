// Auflösungs-Automatik (E-49, E-50): reine Logik, ohne Browser prüfbar.
import test from 'node:test';
import assert from 'node:assert/strict';
import {QualityGovernor} from '../quality-governor.js';
import {PERFORMANCE} from '../content/index.js';
import {worldDensity} from '../art-quality.js';
const R=PERFORMANCE.autoRes,run=(g,gap,work,ms)=>{const out=[];for(let t=0;t<ms;t+=typeof gap==='function'?0:gap){const d=typeof gap==='function'?gap():gap;if(typeof gap==='function')t+=d;const s=g.frame(d,work);if(s)out.push(s);}return out;};

test('flüssiges Spiel bleibt, wie es ist; zu langsames senkt die Stufe – und nach jeder Senkung wird neu gemessen',()=>{
 assert.deepEqual(run(new QualityGovernor(R),16.7,8,20000),[]);
 // Überlastet bei 60 Hz: Bilder abwechselnd im Takt und doppelt so spät (so sieht Überlast aus), im Mittel ~25 ms.
 let i=0;const mixed=()=>i++%2?16.7:33.4;assert.deepEqual(run(new QualityGovernor(R),mixed,20,6000).slice(0,2),['down','down']);
});
test('ein 30-Hz-Bildschirm ist nicht „zu langsam“, ein 144-Hz-Bildschirm muss keine 144 Bilder schaffen',()=>{
 assert.deepEqual(run(new QualityGovernor(R),33.4,6,20000),[],'Remote-Sitzung mit 30 Hz, jedes Bild im Takt');
 assert.deepEqual(run(new QualityGovernor(R),16.7,6,20000),[],'144-Hz-Bildschirm, Spiel liefert stabil 60');
 const g=new QualityGovernor(R);run(g,6.9,2,4000);assert.ok(Math.abs(g.target()-1000/R.targetFps)<.01,'Ziel bleibt 60 Hz');
});
test('Pausen zählen nicht als langsame Bilder',()=>{const g=new QualityGovernor(R);run(g,16.7,3,3000);assert.equal(g.frame(5000,3),null);assert.deepEqual(run(g,16.7,3,3000),[]);});
test('hoch geht es erst nach langer guter Phase mit wenig Rechenzeit – und nach zwei gescheiterten Versuchen gar nicht mehr',()=>{
 assert.deepEqual(run(new QualityGovernor(R),16.7,11,R.upAfterMs*2),[],'viel eigene Rechenzeit: keine Luft nach oben');const g=new QualityGovernor(R);
 for(let n=0;n<R.maxUpTries;n++){assert.deepEqual(run(g,16.7,2,R.upAfterMs+2000),['up']);let i=0;assert.deepEqual(run(g,()=>i++%2?16.7:33.4,2,3000).slice(0,1),['down'],'Versuch scheitert');}
 assert.deepEqual(run(g,16.7,2,R.upAfterMs*3),[],'bleibt unten');
});
test('Dichte: Automatik schützt CSS-Pixel auch beim Zoomen; volle Auflösung gewinnt',()=>{
 assert.equal(worldDensity(2,false,1,1),2);assert.equal(worldDensity(2,false,1,3),2);assert.equal(worldDensity(2,false,2,2),2);assert.equal(worldDensity(2,true,1,1),4);assert.equal(worldDensity(2,false,1,null),2);
});

test('Legacy caps and slow frames never reduce world density below CSS resolution',async()=>{
 const {Renderer}=await import('../renderer.js');
 for(const zoom of [1.2,1.6,2,2.2,3.6])for(const ratio of [1,1.5,2]){
  const native=worldDensity(zoom,false,ratio);
  assert.ok(worldDensity(zoom,false,ratio,1)>=zoom);
  const r={game:{settings:{}},zoom,density:native,resize(){this.density=worldDensity(zoom,false,ratio,this.densityCap);}};
  for(let i=0;i<1000;i++)Renderer.prototype.pace.call(r,35,25);
  assert.ok(r.gradeOff);assert.ok(r.density>=zoom);assert.ok(r.density<=native);
 }
});

test('einzelne Hänger (erste Sicht, neue Bodenkachel) senken die Auflösung nicht',()=>{
 const g=new QualityGovernor(R);let i=0;const gaps=()=>++i%40===0?220:16.7;/* alle 40 Bilder ein Hänger von 220 ms */
 assert.deepEqual(run(g,gaps,5,20000),[]);
});

test('dauernd halber Takt mit viel eigener Rechenzeit ist Überlast, mit wenig ein langsamer Bildschirm',()=>{
 assert.deepEqual(run(new QualityGovernor(R),35,25,6000).slice(0,1),['down'],'Überlast');
 assert.deepEqual(run(new QualityGovernor(R),35,4,20000),[],'30-Hz-Bildschirm');
});
