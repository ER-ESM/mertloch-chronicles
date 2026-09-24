// Einstellung „Niedrige Auflösung“ (Grafik „Niedrig“): Welt fest mit Dichte 2, auch unter der Bildschirmauflösung; Automatik ruht dann.
import test from 'node:test';
import assert from 'node:assert/strict';
import {OPTIONS_UI,SETTING_DEFAULTS} from '../content/index.js';
import {worldDensity} from '../art-quality.js';

test('Voreinstellungen: nur „Niedrig“ schaltet die niedrige Auflösung ein, Standard ist aus',()=>{
 const by=Object.fromEntries(OPTIONS_UI.presets.map(p=>[p.id,p.values]));
 assert.equal(by.low.lowRes,true);for(const id of ['mid','high','ultra'])assert.equal(by[id].lowRes,false,id);
 assert.equal(SETTING_DEFAULTS.lowRes,false);
 assert.ok(OPTIONS_UI.sections.graphics.some(s=>s.rows?.some(r=>r.setting==='lowRes')),'Zeile im Grafikfenster');
});

test('Renderer: niedrige Auflösung = Dichte 2 unabhängig von Zoom und Pixeldichte, volle Auflösung gewinnt',async()=>{
 const {Renderer}=await import('../renderer.js');
 for(const [zoom,ratio] of [[2.6,1],[1.35,2.625],[5.2,2]]){
  const r={game:{settings:{lowRes:true}},zoom,density:worldDensity(zoom,false,ratio),resized:0,resize(){this.resized++;this.density=this.game.settings.lowRes&&!this.game.settings.fullRes?2:worldDensity(zoom,this.game.settings.fullRes,ratio,this.densityCap);}};
  Renderer.prototype.pace.call(r,40,30);assert.equal(r.density,2,`Zoom ${zoom} × ${ratio}`);
  for(let i=0;i<500;i++)Renderer.prototype.pace.call(r,40,30);assert.equal(r.density,2,'Automatik ruht');
  r.game.settings.fullRes=true;r.resize();assert.equal(r.density,4);
 }
});

test('Spielstand: wer Licht und Effekte schon aus hatte (bisher „Niedrig“), bekommt die niedrige Auflösung mit',async()=>{
 const {Game}=await import('../engine.js');const src=Game.toString();
 assert.match(src,/lowRes:saved\.settings\?\.lowRes===undefined\?saved\.settings\?\.light===false&&saved\.settings\?\.fx===false:saved\.settings\.lowRes===true/);
});
