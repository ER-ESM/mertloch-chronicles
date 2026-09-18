import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {DEMO_HEROES,DEMO_PRESETS,resolveDemoEquipment,demoPose} from '../prerender-demo-presets.js';
import {ITEM_CATALOG} from '../content/items.js';
import {compatibleSlots} from '../equipment.js';
const catalog=JSON.parse(readFileSync(new URL('../assets/prerender/runtime/catalog.json',import.meta.url)));

test('nine demo sets use real, slot-compatible equipment and complete prerender sheets',()=>{
 assert.equal(DEMO_PRESETS.length,9);
 assert.equal(new Set(DEMO_PRESETS.map(p=>p.id)).size,9);
 for(const hero of DEMO_HEROES){
  assert.equal(DEMO_PRESETS.filter(p=>p.hero===hero.id).length,3);
  for(const state of ['poses','walk'])assert.equal(catalog.assets[hero.id+'-'+state].frames.length,32);
 }
 for(const preset of DEMO_PRESETS){
  const resolved=resolveDemoEquipment(preset.equipment);
  for(const [slot,id] of Object.entries(preset.equipment))assert.ok(compatibleSlots(ITEM_CATALOG[id]).includes(slot),preset.id+': '+id);
  assert.equal(resolved.visualEquipment.length,Object.keys(preset.equipment).length,preset.id);
  if(preset.ranged)assert.ok(resolved.equipment.ranged,preset.id);
  if(ITEM_CATALOG[resolved.equipment.weapon]?.weapon.hands===2)assert.ok(!resolved.equipment.offhand,preset.id);
  for(const item of resolved.visualEquipment)for(const state of ['poses','walk']){
   const id=`${preset.hero}-gear-${item.asset}-${state}`,sheet=catalog.gear[id];
   assert.ok(sheet,id);assert.equal(sheet.frames.length,32,id);
   assert.ok(existsSync(new URL('../'+sheet.path,import.meta.url)),id);
   assert.ok(sheet.frames.some(f=>f.bounds.count>0),id+' must be visible in at least one frame');
  }
 }
});
test('demo equipment resolver enforces two-handed displacement and rejects incompatible slots',()=>{
 const heavy=resolveDemoEquipment({offhand:'topfdeckel',weapon:'tresenhammer'});
 assert.ok(!heavy.equipment.offhand);assert.deepEqual(heavy.visualEquipment.map(i=>i.asset),['maul']);
 assert.throws(()=>resolveDemoEquipment({feet:'flasche'}));
});
test('walking is distance-driven and combat preview exercises both attack frames',()=>{
 assert.deepEqual(demoPose('walk',8,30),{moving:true,walkDistance:30});
 assert.ok(demoPose('attack',0).attack>.165);assert.ok(demoPose('attack',.5).attack<.165);
 assert.deepEqual(demoPose('idle'),{});assert.deepEqual(demoPose('hit'),{hurt:1});assert.deepEqual(demoPose('rest'),{resting:true});
});
