import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildLive} from '../tools/sprite-pipeline/build-live.mjs';
import {equipmentAppearance} from '../equipment-appearance.js';
import {ITEMS,addItem,equipItem,unequipItem} from '../rpg.js';
import {Game} from '../engine.js';
import {registerRoll} from '../itemization.js';
import {EQUIPMENT_SLOTS,compatibleSlots} from '../equipment.js';
import {ARCHETYPES,ELITES,CAMP_ENEMIES,BOSSES} from '../content/enemies.js';
import {PERSON_APPEARANCE} from '../content/person-appearance.js';
import {livePersonId} from '../live-art.js';
import {boarPose} from '../maifeld-boar-rig.js';
import {itemIcon} from '../rpg-ui.js';
const root=new URL('../assets/maifeld-live/runtime/',import.meta.url),catalog=JSON.parse(readFileSync(new URL('catalog.json',root)));
const arena={id:'live-art',seed:56753,spawn:{x:0,y:0},npc:{x:0,y:0},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[b]};
test('live sprites reproduce exactly and every hero socket remains within its registered frame',()=>{
 for(const [name,bytes] of buildLive())assert.deepEqual(bytes,readFileSync(new URL(name,root)),name);
 for(const h of Object.values(catalog.heroes))for(const sheet of Object.values(h.sheets)){assert.equal(sheet.frames.length,32);for(const f of sheet.frames){assert.ok(f.bounds.x>0&&f.bounds.y>0);for(const p of [f.sockets.main,f.sockets.off,f.sockets.head,...f.sockets.feet])assert.ok(p.x>0&&p.x<96&&p.y>0&&p.y<96);}}
});
test('all named people and enemy families resolve to live art, including fox, raven and bosses',()=>{
 for(const id of Object.keys(PERSON_APPEARANCE)){const key=livePersonId(id);assert.ok(catalog.heroes[key]||catalog.people[key],id);}
 for(const e of Object.values({...ARCHETYPES,...ELITES,...CAMP_ENEMIES,...BOSSES})){const ids=[e.variant,e.family,e.skin];assert.ok(ids.some(id=>id==='boar'||catalog.animals[id]||catalog.people[id]),e.name);}
 assert.ok(catalog.people.automat);assert.equal(Object.keys(catalog.animals).length,6);
});
test('every catalog item and generated slot has a visible family; UI uses the same equipment piece',()=>{
 const g=new Game(arena,{level:11});for(const slot of Object.keys(EQUIPMENT_SLOTS)){const category=slot.startsWith('ring')?'ring':slot.startsWith('trinket')?'trinket':slot;registerRoll(g.rpg,ITEMS,{slot:category,spec:'tresen',level:3,quality:'rare',roll:125});}
 for(const [id,item] of Object.entries(ITEMS)){if(!item.slot)continue;for(const slot of compatibleSlots(item)){const [p]=equipmentAppearance({[slot]:id},ITEMS);assert.ok(catalog.equipment[p.asset],id+' '+slot);assert.match(itemIcon(id),new RegExp('data-item-art="'+p.asset+'"'));}}
});
test('visible gear follows real transactional swaps, unequips, two hand rules and saved reloads',()=>{
 const g=new Game(arena,{level:11});for(const id of ['tresenhammer','dosenklinge','regenjacke'])addItem(g.rpg,id);
 assert.ok(equipItem(g,'tresenhammer'));let a=equipmentAppearance(g.rpg.equipment,ITEMS);assert.ok(a.some(p=>p.asset==='maul'));assert.ok(!a.some(p=>p.slot==='offhand'));
 assert.ok(equipItem(g,'dosenklinge','offhand'));assert.ok(equipItem(g,'regenjacke'));assert.ok(equipmentAppearance(g.rpg.equipment,ITEMS).some(p=>p.asset==='raincoat'));
 assert.ok(unequipItem(g,'body'));a=equipmentAppearance(g.rpg.equipment,ITEMS);assert.ok(!a.some(p=>p.slot==='body'));assert.deepEqual(equipmentAppearance(new Game(arena,g.save()).rpg.equipment,ITEMS),a);
});
test('all six animals keep fixed torsos and continuous independent feet through walk and settling',()=>{
 for(const [id,file] of Object.entries(catalog.animals)){const rig=JSON.parse(readFileSync(new URL(file,root)));for(const dir of catalog.directions){const body=boarPose(rig,dir,0).body;let last;for(let i=0;i<=120;i++){const pose=boarPose(rig,dir,i/120*rig.stride);assert.deepEqual(pose.body,body);assert.equal(pose.legs.length,['goose','raven','chicken'].includes(id)?2:4);for(const [j,p] of pose.legs.entries()){assert.ok(Number.isFinite(p.angle));if(last)assert.ok(Math.hypot(p.foot.x-last.legs[j].foot.x,p.foot.y-last.legs[j].foot.y)<.6);}last=pose;}assert.deepEqual(boarPose(rig,dir,2,0),boarPose(rig,dir,2,false));}}
});
