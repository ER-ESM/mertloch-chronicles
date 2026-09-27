// Handy-Leistung Runde 4 (27.09.2026, Nutzerentscheidung): Bei Grafik „Niedrig“ liegen die Namensschilder auf der Weltfläche statt auf einer
// eigenen Leinwand. Geprüft: wann (nur niedrige Auflösung ohne Licht- und Effektebene), dass die Schrift-Ebene dann ausgeblendet ist und beim
// Umschalten zurückkommt, und dass beide Wege dieselben Schilder mit denselben Regeln zeichnen.
import test from 'node:test';
import assert from 'node:assert/strict';
import {OPTIONS_UI} from '../content/index.js';

test('Schilder auf der Weltfläche genau bei „Niedrig“ (niedrige Auflösung, kein Licht, keine Effekte), sonst eigene Leinwand',async()=>{
 const {Renderer}=await import('../renderer.js');const on=settings=>Renderer.prototype.labelsOnWorld.call({game:{settings}});
 const low=OPTIONS_UI.presets.find(p=>p.id==='low').values;assert.equal(on({...low}),true,'Voreinstellung Niedrig');
 for(const p of OPTIONS_UI.presets.filter(p=>p.id!=='low'))assert.equal(on({...p.values}),false,p.id);
 assert.equal(on({...low,light:true}),false,'mit Licht: Schrift muss über der Lichtebene liegen');
 assert.equal(on({...low,fx:true}),false,'mit Effekten');assert.equal(on({...low,fullRes:true}),false,'volle Auflösung gewinnt');
 globalThis.__labelsOnWorld=false;try{assert.equal(on({...low}),false,'Diagnose-Schalter');}finally{delete globalThis.__labelsOnWorld;}
});
test('Umschalten zur Laufzeit: Schrift-Ebene wird ausgeblendet und geleert, danach wieder gezeigt',async()=>{
 const {Renderer}=await import('../renderer.js');const cleared=[];
 const r={game:{settings:{lowRes:true,light:false,fx:false}},canvas:{parentNode:null,width:1216},ctx:{},labelCanvas:{style:{display:''},width:10,height:10},labelCtx:{clearRect:(...a)=>cleared.push(a)},labelDirty:true,labelHidden:false,labelsOnWorld:Renderer.prototype.labelsOnWorld,paintLabels(){throw Error('ohne DOM nichts zeichnen');}};
 Renderer.prototype.flushLabels.call(r,[]);assert.equal(r.labelCanvas.style.display,'none');assert.equal(cleared.length,1,'einmal geleert');assert.equal(r.labelDirty,false);
 Renderer.prototype.flushLabels.call(r,[]);assert.equal(cleared.length,1,'danach unberührt – die Ebene ändert sich nicht mehr je Bild');
 r.game.settings.lowRes=false;Renderer.prototype.flushLabels.call(r,null);assert.equal(r.labelCanvas.style.display,'','zurück auf der eigenen Leinwand');assert.equal(r.labelHidden,false);
});
test('Beide Wege zeichnen dieselben Schilder: Blasen, HUD, Held, Titelband wie bisher; ohne DOM direkt (Kontur + Füllung)',async()=>{
 const {Renderer}=await import('../renderer.js');const calls=[];
 const c={set textAlign(v){},set lineJoin(v){},set strokeStyle(v){},set font(v){calls.push(['font',v]);},set lineWidth(v){},set fillStyle(v){},set globalAlpha(v){calls.push(['alpha',+v.toFixed(2)]);},
  setTransform(...a){calls.push(['T',...a]);},strokeText(t,x,y){calls.push(['stroke',t,x,y]);},fillText(t,x,y){calls.push(['fill',t,x,y]);},save(){},restore(){}};
 const t={a:2,b:0,c:0,d:2,e:-100,f:-40},q=[{t,a:1,font:'800 7px Nunito',text:'Pfandkeiler',x:120,y:60,color:'#f0a0a0',b:{x:100,y:52,w:40,h:12}},{t,a:1,paint:(cc,fade)=>calls.push(['paint',fade]),b:{x:10,y:10,w:10,h:10}}];
 q.hero={x:500,y:500,w:22,h:34};
 globalThis.document={querySelector:()=>null,querySelectorAll:()=>[]};
 try{const cv={getBoundingClientRect:()=>({left:0,top:0,width:915,height:412})};
  Renderer.prototype.paintLabels.call({},c,q,cv,1216/915,1,true);
  assert.deepEqual(calls.filter(x=>x[0]==='stroke'||x[0]==='fill').map(x=>x.slice(0,4)),[['stroke','Pfandkeiler',120,60],['fill','Pfandkeiler',120,60]],'ohne Schriftbild (kein Canvas im Node): direkt');
  assert.ok(calls.some(x=>x[0]==='T'&&x[1]===2&&x[5]===-100),'Weltfläche: Transformation des Schilds unverändert (k = 1)');assert.ok(calls.some(x=>x[0]==='paint'&&x[1]===1),'Auftragszeichen gemalt');
  calls.length=0;Renderer.prototype.paintLabels.call({},c,q,cv,2,1830/1216,false);assert.ok(calls.some(x=>x[0]==='T'&&Math.abs(x[1]-2*1830/1216)<1e-9),'eigene Leinwand: auf deren Auflösung skaliert');
 }finally{delete globalThis.document;}
});
