// Gemalte NPC-Gesprächsporträts (Lieferung 2026-09-24, tools/sprite-pipeline/portraets-20260924-jobs.json).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NPCS,FIGUREN} from '../content/index.js';
import {contentArt} from '../content-art.js';
import {conversationHeader,conversationPortraitId} from '../dialogue-ui.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const catalog=JSON.parse(read('assets/precision/runtime/catalog.json')),jobs=JSON.parse(read('tools/sprite-pipeline/portraets-20260924-jobs.json'));
const CLASSES=['dieter','baerbel','kevin'];

test('jedes Porträt der Lieferung liegt im Katalog: 128 px, Porträtpalette, Figur und NPC vorhanden',()=>{
 assert.ok(jobs.length>0);
 for(const j of jobs){
  const a=catalog.assets[j.id];assert.ok(a,j.id);assert.equal(a.kind,'portraits',j.id);assert.equal(a.width,128);assert.equal(a.height,128);
  assert.equal(a.palette,'portraet',j.id);assert.equal(a.source,j.output,j.id);assert.ok(NPCS[j.npc]&&FIGUREN[j.npc],j.npc);
  assert.equal(j.id,'portrait-'+(CLASSES.includes(j.npc)?'mentor-':'')+j.npc,'Schlüssel '+j.id);
 }
});

test('Klassen-IDs bekommen kein NPC-Porträt: Helden-, Gruppen- und Söldnerrahmen zeichnen weiter die Figur',()=>{
 // paintPersonPortrait(canvas,'dieter') nimmt portrait-dieter, sobald es existiert – das wäre dann Dosen-Dieter statt des eigenen Helden.
 for(const id of CLASSES)assert.equal(catalog.assets['portrait-'+id],undefined,'portrait-'+id);
});

test('Gesprächskopf: Clan-Mitglieder zeigen portrait-mentor-<id>, sobald es geladen ist; alle anderen ihre eigene Kennung',()=>{
 assert.equal(conversationPortraitId('dieter'),'dieter','ohne geladenes Bild bleibt der bisherige Weg');
 const saved={catalog:contentArt.catalog,images:new Map(contentArt.images)};
 try{
  contentArt.catalog={aliases:{},assets:{'portrait-mentor-dieter':{kind:'portraits',width:128,height:128},'portrait-ida':{kind:'portraits',width:128,height:128}}};
  contentArt.images.set('portrait-mentor-dieter',{});contentArt.images.set('portrait-ida',{});
  assert.ok(conversationHeader('dieter').includes('data-person-art="mentor-dieter"'));
  assert.ok(conversationHeader('baerbel').includes('data-person-art="baerbel"'),'ohne eigenes Bild weiter die Kennung');
  assert.ok(conversationHeader('ida').includes('data-person-art="ida"'));
  assert.ok(conversationHeader('dieter').includes('data-conversation-npc="dieter"'),'Gesprächskennung bleibt die NPC-ID');
 }finally{contentArt.catalog=saved.catalog;contentArt.images.clear();for(const [k,v] of saved.images)contentArt.images.set(k,v);}
});
