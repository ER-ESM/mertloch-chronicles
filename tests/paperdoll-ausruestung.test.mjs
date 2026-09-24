// Sichtbare Ausrüstung an der Anziehpuppe (tools/paperdoll/familien.mjs → assets/paperdoll/runtime, paperdoll-art.js paperdollSources).
// Jeder ausrüstbare Gegenstand und jede Familie aus equipment-appearance.js muss nach `node tools/paperdoll/puppe.mjs --runtime`
// eine Quelle mit Bögen haben – sonst fehlt das Teil an der Figur.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {ITEM_CATALOG} from '../content/index.js';
import {compatibleSlots} from '../equipment.js';
import {equipmentAppearance} from '../equipment-appearance.js';
import {paperdollSources,paperdoll} from '../paperdoll-art.js';
import {ORDER,sources} from '../paperdoll-kern.js';

const RT=new URL('../assets/paperdoll/runtime/',import.meta.url);
const cat=JSON.parse(readFileSync(new URL('catalog.json',RT),'utf8'));
/** Familien-Tabellen aus equipment-appearance.js (nicht exportiert): special/weapons/slots als Objektliteral lesen. */
const TABLES=(()=>{const src=readFileSync(new URL('../equipment-appearance.js',import.meta.url),'utf8'),out={};
 for(const name of ['special','weapons','slots']){const m=src.match(new RegExp(`const ${name}=(\\{[^}]*\\})`));assert.ok(m,`Tabelle ${name} nicht gefunden`);out[name]=Function(`return ${m[1]}`)();}return out;})();
const sourceOf=it=>cat.items[it.id]||cat.families[it.asset];
/** Quelle vorhanden und für jeden Archetyp mit Bögen in se/nw (sw/ne nur, wenn seitengebunden). */
function assertSource(src,what){assert.ok(src,`${what}: keine Quelle`);assert.ok(cat.sources[src],`${what}: Quelle ${src} fehlt im Katalog`);
 for(const arch of Object.keys(cat.archetypes))for(const [dir,suffix] of Object.entries(cat.dirs)){if((dir==='sw'||dir==='ne')&&!cat.own[dir].includes(src))continue;
  assert.ok(existsSync(new URL(`${src}-${arch}${suffix}.png`,RT)),`${what}: Bogen ${src}-${arch}${suffix}.png fehlt`);}}

test('jeder ausrüstbare Gegenstand hat in jedem passenden Platz eine Puppen-Quelle',()=>{
 const equip=Object.entries(ITEM_CATALOG).filter(([,d])=>d.slot&&!d.retired);assert.ok(equip.length>=30);
 for(const [id,d] of equip){const slots=compatibleSlots(d);assert.ok(slots.length,`${id}: kein Platz`);
  for(const slot of slots){const [it]=equipmentAppearance({[slot]:id},ITEM_CATALOG);let src=sourceOf(it);
   if(slot==='offhand'&&cat.sources[src]?.slot==='weapon')src+='_nh';// Einhandwaffe links
   assertSource(src,`${id} in ${slot}`);}}
});

test('jede Familie aus equipment-appearance.js (Plätze, Waffenarten, Sonderteile, Schild) zeigt auf eine Quelle',()=>{
 const fams=new Set([...Object.values(TABLES.slots),...Object.values(TABLES.weapons),...Object.values(TABLES.special),'shield']);
 assert.ok(fams.size>=30);for(const f of fams)assertSource(cat.families[f],`Familie ${f}`);
 // Zufallsgegenstände: gewürfelte Teile ohne feste Kennung laufen über die Familie
 for(const [slot,fam] of Object.entries(TABLES.slots)){const [it]=equipmentAppearance({[slot]:'wurf'},{wurf:{slot}});assert.equal(it.asset,fam);assertSource(sourceOf(it),`Zufall ${slot}`);}
 for(const [type,fam] of Object.entries(TABLES.weapons)){const hands=type==='maul'?2:type==='launcher'||type==='speaker'?0:1,slot=hands===0?'ranged':'weapon';
  const [it]=equipmentAppearance({[slot]:'wurf'},{wurf:{slot,weapon:{type,hands}}});assert.equal(it.asset,fam);assertSource(sourceOf(it),`Zufallswaffe ${type}`);}
});

test('Fernwaffen und Rüstungsplätze haben eigene Ebenen in der Schichtreihenfolge',()=>{
 for(const slot of ['legs','feet','body','charm','head','weapon','offhand'])assert.ok(ORDER.includes(slot));
 const at=s=>ORDER.indexOf(s);assert.ok(at('legs')<at('feet')&&at('feet')<at('body')&&at('body')<at('charm')&&at('charm')<at('head')&&at('head')<at('weapon')&&at('weapon')<at('offhand'),'alte Reihenfolge bleibt');
 const fams=[...Object.values(TABLES.slots),...Object.values(TABLES.weapons),...Object.values(TABLES.special),'shield'];
 const used=new Set([...fams.map(f=>cat.families[f]),...Object.keys(ITEM_CATALOG).map(id=>cat.items[id])].filter(Boolean));
 for(const id of used)assert.ok(ORDER.includes(cat.sources[id].slot),`${id}: Platz ${cat.sources[id].slot} fehlt in ORDER`);
 assert.ok(at('waist')>at('body'),'Gürtel über der Jacke');assert.ok(at('hands')>at('offhand')&&at('hands')>at('weapon'),'Handschuh über der Faust der Waffe');
 for(const id of ['pfandschleuder','megafon','ruhepfeife']){assert.equal(cat.sources[id].slot,'ranged');assert.ok(cat.sources[id].bands.includes('armVorn')&&cat.sources[id].bands.includes('armHinten'),id);
  assert.ok(cat.own.sw.includes(id)&&cat.own.ne.includes(id),`${id} seitengebunden (Waffenhand rechts)`);}
});

test('paperdollSources: Fernkampf zeigt die Fernwaffe, sonst Haupt- und Nebenhand; Nebenhand-Waffe und Handschuh über Schildfaust',()=>{
 paperdoll.catalog=cat;
 const eq={weapon:'flasche',offhand:'topfdeckel',ranged:'pfandschleuder',body:'kutte',hands:'handschuh'},reg={...ITEM_CATALOG,handschuh:{slot:'hands'}};
 const items=equipmentAppearance(eq,reg);
 const melee=paperdollSources(items,false),ranged=paperdollSources(items,true);
 assert.ok(melee.has('flasche')&&melee.has('topfdeckel')&&!melee.has('pfandschleuder'));
 assert.ok(ranged.has('pfandschleuder')&&!ranged.has('flasche')&&!ranged.has('topfdeckel'));
 assert.ok(melee.has('grillhandschuhe')&&melee.has('grillhandschuhe_faust'),'Handschuh über der Schildfaust');
 assert.ok(!ranged.has('grillhandschuhe_faust'),'ohne Schild keine Schildfaust');
 const dual=paperdollSources(equipmentAppearance({weapon:'dosenbrecher',offhand:'dosenklinge'},ITEM_CATALOG));
 assert.deepEqual([...dual].sort(),['dosenbrecher','dosenklinge_nh']);
 assert.equal(cat.sources.dosenklinge_nh.slot,'offhand');
 const order=sources(ranged,cat.sources);assert.ok(order.indexOf('pfandschleuder')>order.indexOf('kutte'));
 const two=paperdollSources(equipmentAppearance({weapon:'tresenhammer',offhand:'topfdeckel'},ITEM_CATALOG));assert.ok(two.has('tresenhammer')&&!two.has('topfdeckel'));
});
