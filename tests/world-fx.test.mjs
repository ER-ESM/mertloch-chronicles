// Effektschicht (E-47): Die Ableitungen aus dem Spielzustand sind reine Funktionen und laufen ohne Browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import {weatherAt,fogAt,shocksFrom,firefliesAt} from '../world-fx.js';
import {WORLD_FX,LIGHTING} from '../content/index.js';

const W=WORLD_FX.weather;

test('vor dem ersten Schauer bleibt es trocken, der Schauer blendet weich ein und aus',()=>{
 assert.deepEqual(weatherAt(0),{rain:0,flash:0});
 assert.equal(weatherAt(W.first-1).rain,0);
 const start=W.first,mid=start+W.rain/2;
 assert.equal(weatherAt(mid).rain,1);
 assert.ok(weatherAt(start+W.fade/2).rain>0&&weatherAt(start+W.fade/2).rain<1);
 assert.ok(weatherAt(start+W.rain-W.fade/2).rain<1);
 assert.equal(weatherAt(start+W.rain+1).rain,0);
 assert.equal(weatherAt(mid+W.period).rain,1,'der Schauer kehrt im Takt wieder');
});

test('Wetter ist deterministisch und blitzt nur im Regen',()=>{
 for(let t=0;t<W.first+W.period*2;t+=3.7){const a=weatherAt(t),b=weatherAt(t);assert.deepEqual(a,b);if(a.rain<=.5)assert.equal(a.flash,0);assert.ok(a.flash>=0&&a.flash<=W.flash.power);}
 let flashes=0;for(let t=W.first+W.fade;t<W.first+W.rain-W.fade;t+=W.flash.slot)if(weatherAt(Math.floor(t/W.flash.slot)*W.flash.slot+.01).flash>0)flashes++;
 assert.ok(flashes>0,'in einem ganzen Schauer blitzt es mindestens einmal');
});

test('Nebel folgt dem Dunkelanteil der Gebiete aus E-39',()=>{
 const Z=LIGHTING.ambient.zones;
 assert.equal(fogAt(Z.rest),0,'Rastplatz bleibt klar');
 assert.equal(fogAt(Z.fields),0,'Fluren bleiben klar');
 assert.ok(fogAt(Z.forest)>0,'im Wald liegt Nebel');
 assert.ok(fogAt(Z.boss)>=fogAt(Z.camp)&&fogAt(Z.camp)>=fogAt(Z.forest));
 assert.ok(fogAt(Z.boss)<=WORLD_FX.fog.alpha+1e-9);
 assert.ok(fogAt(Z.rest,1)>0&&fogAt(1,1)<=1,'Regen legt einen Schleier dazu, gedeckelt');
});

test('Druckwellen entstehen nur aus bekannten Ereignissen, wachsen und klingen ab',()=>{
 assert.deepEqual(shocksFrom([]),[]);
 assert.deepEqual(shocksFrom([{type:'slash',x:1,y:2,life:.2,max:.5},{type:'combat',kind:'heal',x:1,y:2,life:.2,max:.5},{type:'burst',x:1,y:2,life:.2}]),[],'unbekannte Art, unbekannter Kniff, fehlende Dauer');
 const young=shocksFrom([{type:'burst',x:10,y:20,life:.45,max:.5}])[0],old=shocksFrom([{type:'burst',x:10,y:20,life:.05,max:.5}])[0];
 assert.deepEqual(young.slice(0,2),[10,20]);
 assert.ok(old[2]>young[2],'Ring wächst');assert.ok(old[3]<young[3],'Stärke klingt ab');
 assert.ok(old[2]<=WORLD_FX.shock.types.burst.radius);
 const slam=shocksFrom([{type:'combat',kind:'slam',x:0,y:0,life:.6,max:.7}])[0];assert.ok(slam[3]>young[3]*.9,'schwere Kniffe drücken stärker');
});

test('höchstens so viele Druckwellen, wie der Shader fasst – die stärksten zuerst',()=>{
 const many=Array.from({length:20},(_,i)=>({type:'impact',x:i,y:0,life:.5-i*.02,max:.5})),out=shocksFrom(many);
 assert.equal(out.length,WORLD_FX.shock.max);
 for(let i=1;i<out.length;i++)assert.ok(out[i-1][3]>=out[i][3]);
});

test('Glühwürmchen kommen erst mit der Dunkelheit',()=>{
 const Z=LIGHTING.ambient.zones;
 assert.equal(firefliesAt(Z.rest),0);assert.equal(firefliesAt(Z.fields),0);
 assert.ok(firefliesAt(Z.forest)>0);assert.equal(firefliesAt(Z.boss),WORLD_FX.particles.fireflies);
});

test('Werte der Effektschicht sind in sich stimmig',()=>{
 assert.ok(W.fade*2<W.rain&&W.rain<W.period);
 for(const kind of WORLD_FX.heat.sources)assert.ok(LIGHTING.sources[kind],'Hitzequelle '+kind+' ist eine Lichtquelle');
 for(const def of [...Object.values(WORLD_FX.shock.types),...Object.values(WORLD_FX.shock.kinds)])assert.ok(def.radius>0&&def.power>0&&def.power<=12);
 assert.ok(WORLD_FX.bloom.threshold>.4,'Bloom darf die Pixelgrafik nicht flächig aufhellen');
});

test('die Einstellung „Wetter & Effekte" steht im Spielstand und ist standardmäßig an',async()=>{
 const {World}=await import('../world.js'),{Game}=await import('../engine.js'),fs=await import('node:fs');
 const world=new World(JSON.parse(fs.readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')));
 const game=new Game(world,{classId:'dieter',version:1});assert.equal(game.settings.fx,true);
 assert.notEqual(game.setSetting('fx',false),false);assert.equal(game.settings.fx,false);
 const again=new Game(world,{classId:'dieter',version:1,settings:{fx:false}});assert.equal(again.settings.fx,false);
});
