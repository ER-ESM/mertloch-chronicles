import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {bootPercent,unitFraction,pickScene,phaseText,PHASE_WEIGHT,boot} from '../loading-screen.js';
import {LOADING_UI} from '../content/index.js';

const phases=LOADING_UI.phases;

test('Ladeschritte: fünf Schritte = ein Fünferbündel auf dem Bierdeckel, Gewichte summieren sich zu 100',()=>{
 assert.equal(phases.length,5);
 assert.deepEqual(phases.map(p=>p.id),Object.keys(PHASE_WEIGHT));
 assert.equal(Object.values(PHASE_WEIGHT).reduce((a,b)=>a+b,0),100);
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.equal((html.match(/<path pathLength="1"/g)||[]).length,phases.length,'ein Strich je Schritt');
});

test('Gesamtfortschritt steigt monoton und endet bei 1',()=>{
 let last=-1;
 for(let i=0;i<phases.length;i++)for(const f of [0,.5,1]){const p=bootPercent(phases,i,f);assert.ok(p>=last,`Schritt ${i} Anteil ${f}`);last=p;}
 assert.equal(bootPercent(phases,phases.length,0),1);
 assert.equal(bootPercent(phases,0,0),0);
 assert.equal(bootPercent(phases,1,0),PHASE_WEIGHT.module/100);
});

test('Zählanteil kommt nie ganz an, bevor der Schritt es meldet',()=>{
 assert.equal(unitFraction(0,10),0);
 assert.equal(unitFraction(5,10),.5);
 assert.ok(unitFraction(12,10)<1);
 assert.ok(unitFraction(500,0)<1&&unitFraction(500,0)>unitFraction(50,0));
});

test('Motivwahl: erster Start zeigt die Bude, danach nie zweimal dasselbe Motiv',()=>{
 const scenes=LOADING_UI.scenes;
 assert.equal(pickScene(scenes,{firstStart:true}).id,'lade-bude-morgen');
 for(const s of scenes)for(const r of [0,.5,.999])assert.notEqual(pickScene(scenes,{last:s.id,random:()=>r}).id,s.id);
 assert.equal(pickScene([],{}),null);
});

test('Schritttext zeigt bei den Grafiken den Zähler',()=>{
 const grafik=phases.find(p=>p.id==='grafik');
 assert.match(phaseText(grafik,3,10),/\(3\/10\)/);
 assert.doesNotMatch(phaseText(phases[0],3,10),/\(/);
 assert.equal(phaseText(null),LOADING_UI.ready);
});

test('Jedes Motiv hat sein Laufzeitbild, Deckel und Tresenleiste liegen bereit',()=>{
 for(const s of LOADING_UI.scenes)assert.ok(existsSync(new URL(`../assets/loading/${s.id}.webp`,import.meta.url)),s.id);
 for(const f of ['deckel.png','rahmen.png'])assert.ok(existsSync(new URL('../assets/loading/'+f,import.meta.url)),f);
 assert.ok(LOADING_UI.tips.length>=8);
});

test('Ohne DOM ist der Schirm stumm und bricht nichts',async()=>{
 await boot.phase('karte');boot.progress(.5);
 assert.deepEqual(await boot.track([Promise.resolve(1),2]),[1,2]);
 await boot.finish();
});

test('index.html: Schirm steht vor jedem Skript, Modul läuft vor app.js',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.ok(html.indexOf('loading-screen.css')<html.indexOf('style.css'));
 assert.ok(html.indexOf('src="loading-screen.js"')<html.indexOf('src="app.js"'));
 assert.ok(html.indexOf('id="loading"')<html.indexOf('id="gameShell"'),'Schirm liegt außerhalb der Spielfläche');
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 for(const step of phases.slice(1))assert.ok(app.includes(`boot.phase('${step.id}')`),step.id);
 assert.ok(app.includes('boot.finish()')&&app.includes('boot.fail(err)'));
});
