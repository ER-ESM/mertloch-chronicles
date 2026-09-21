// Gezeichnete Kopf-Ebenen: Katalogprüfung, Kachel-Platzierung, Auswahl bleibt leer, solange nichts geliefert ist.
import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeLayerCatalog,layerPlacement,layerBody,drawnStyles,hasDrawn,heroLayers,applyDrawnLayers,LAYER_TILE,ANCHOR_TOP} from '../hero-layers.js';
import {normalizeTint,tintKey,lookKey,parseTintKey} from '../hero-tint.js';

test('Katalog: nur bekannte Körper und saubere Kennungen',()=>{
 const c=normalizeLayerCatalog({bodies:{kevin:{hair:[{id:'kurz',name:'Kurz'},{id:'../x',name:'böse'},{id:'ok2',name:''}],beard:[{id:'backenbart',name:'Backenbart'}]},drache:{hair:[{id:'kamm',name:'Kamm'}]}}});
 assert.deepEqual(c.bodies.kevin.hair,[{id:'kurz',name:'Kurz'}]);assert.equal(c.bodies.kevin.beard[0].id,'backenbart');assert.equal(c.bodies.drache,undefined);assert.deepEqual(normalizeLayerCatalog(null).bodies,{});
});

test('Platzierung: Kachelmitte auf dem Kopf-Anker, Spalte nach Blickrichtung; Anni zählt als baerbel',()=>{
 assert.deepEqual(layerPlacement({direction:'ne',sockets:{head:{x:96.5,y:55}}}),{sx:2*LAYER_TILE,dx:97-LAYER_TILE/2,dy:55-ANCHOR_TOP,dir:'ne'});
 assert.equal(layerPlacement({direction:'quer',sockets:{head:{x:90,y:60}}}).dir,'se');assert.equal(layerPlacement({}),null);assert.equal(layerBody('anni-poses'),'baerbel');assert.equal(layerBody('kevin-heavy'),'kevin');
});

test('ohne gelieferte Dateien: keine Auswahl, kein Zeichnen – mit Katalog: Auswahl je Körper, Kennung reist durchs Netz',()=>{
 assert.deepEqual(drawnStyles('kevin','hair'),[]);assert.equal(applyDrawnLayers({},{direction:'se',sockets:{head:{x:96,y:55}}},'kevin',{style:'kurz'},[1,2,3]),false);
 const before=heroLayers.catalog;heroLayers.catalog=normalizeLayerCatalog({bodies:{kevin:{hair:[{id:'kurz-2',name:'Kurz'}],beard:[]}}});
 try{assert.ok(hasDrawn('kevin','hair','kurz-2'));assert.ok(!hasDrawn('dieter','hair','kurz-2'),'Frisuren gehören zu einem Körper');
  const t=normalizeTint({style:'kurz-2'});assert.equal(t.style,'kurz-2');assert.ok(tintKey(t).endsWith('.kurz-2'),'eigener Platz im Bild-Zwischenspeicher');assert.deepEqual(parseTintKey(lookKey(t)),t);
  assert.equal(normalizeTint({style:'<img>'}).style,'natur');}finally{heroLayers.catalog=before;}
});
