// Minikarte (minimap.js): Einstellungen werden bereinigt, Randpunkte für Ziele außerhalb, Größen aus content/minimap.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readMinimapSettings,edgePoint,insideDisc,minimapDisc} from '../minimap.js';
import {MINIMAP,MINIMAP_GROUPS,MINIMAP_UI} from '../content/index.js';

test('Einstellungen: Standard, Grenzen und unbekannte Werte',()=>{
 const d=readMinimapSettings(null);
 assert.deepEqual([d.zoom,d.shape,d.size,d.rotate,d.clock],[MINIMAP.defaultZoom,'round','m',false,true]);
 assert.ok(MINIMAP_GROUPS.every(g=>d.track[g]===true));
 const s=readMinimapSettings({zoom:99,shape:'hex',size:'xxl',rotate:'ja',clock:false,track:{nodes:false,unbekannt:false}});
 assert.deepEqual([s.zoom,s.shape,s.size,s.rotate,s.clock,s.track.nodes,'unbekannt' in s.track],[MINIMAP.defaultZoom,'round','m',false,false,false,false]);
 assert.equal(readMinimapSettings({zoom:0,shape:'square',size:'l',rotate:true}).zoom,0);
 assert.equal(readMinimapSettings({zoom:1.5}).zoom,MINIMAP.defaultZoom);
});
test('Randpunkt: rund auf dem Kreis, eckig auf dem Quadrat',()=>{
 const r=edgePoint(30,40,10,'round');assert.ok(Math.abs(Math.hypot(r.x,r.y)-10)<1e-9);assert.ok(Math.abs(r.x-6)<1e-9);
 const q=edgePoint(30,15,10,'square');assert.deepEqual(q,{x:10,y:5});
 assert.equal(insideDisc(7,7,10,'round'),true);assert.equal(insideDisc(8,8,10,'round'),false);assert.equal(insideDisc(9,-9,10,'square'),true);
});
test('Größen: mittel entspricht etwa der alten Umgebungskarte, Texte für jede Gruppe',()=>{
 assert.ok(MINIMAP.sizes.s<MINIMAP.sizes.m&&MINIMAP.sizes.m<MINIMAP.sizes.l);
 const disc=minimapDisc({size:'m',shape:'round'});assert.ok(disc>=110&&disc<=130,'Kartendurchmesser '+disc);
 assert.equal(MINIMAP.zoomSpans.length,MINIMAP.iconScale.length);assert.equal(MINIMAP.zoomSpans.length,MINIMAP.scaleMeters.length);
 for(const g of MINIMAP_GROUPS)assert.ok(MINIMAP_UI.groups[g],g);
});
