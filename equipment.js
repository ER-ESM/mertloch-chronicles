import {EQUIPMENT_SLOTS,SLOT_ICONS,WEAPON_TYPES,WEAPON_REQUIREMENT_NAMES,BALANCE} from './content/index.js';
export {EQUIPMENT_SLOTS,SLOT_ICONS,WEAPON_TYPES};
// Slot rules are shared by saves, swaps, tooltips and combat. No UI dependency.
export const weaponDefinition=(type='club',factor=1)=>{const t=WEAPON_TYPES[type]||WEAPON_TYPES.club;return {type:WEAPON_TYPES[type]?type:'club',hands:t.hands,speed:t.speed,min:Math.max(1,Math.round(t.min*factor)),max:Math.max(2,Math.round(t.max*factor))};};
export const itemSlotName=d=>d?.weapon?WEAPON_TYPES[d.weapon.type]?.name||'Waffe':d?.slot==='ring'?'Ring':d?.slot==='trinket'||d?.slot==='charm'?'Glücksbringer':d?.shield?'Schild · Nebenhand':EQUIPMENT_SLOTS[d?.slot]||'';
export function compatibleSlots(d){if(!d?.slot)return [];if(d.weapon)return d.weapon.hands===0?['ranged']:d.weapon.hands===2?['weapon']:['weapon','offhand'];if(d.slot==='ring')return ['ring1','ring2'];if(d.slot==='trinket'||d.slot==='charm')return ['trinket1','trinket2'];return Object.hasOwn(EQUIPMENT_SLOTS,d.slot)?[d.slot]:[];}
export function targetSlot(equipment,d,requested){const choices=compatibleSlots(d);if(requested)return choices.includes(requested)?requested:null;return choices.find(slot=>!equipment[slot])||choices[0]||null;}
export function equipmentPlan(equipment,registry,id,requested){const d=registry[id],slot=targetSlot(equipment,d,requested||(!requested&&d?.weapon?.hands===1&&registry[equipment.weapon]?.weapon?.hands===2?'weapon':undefined));if(!slot)return {error:'Dieser Gegenstand passt nicht auf diesen Platz.'};const next={...equipment},displaced=[];const clear=key=>{if(next[key])displaced.push({slot:key,id:next[key]});next[key]=null;};clear(slot);if(slot==='weapon'&&d.weapon?.hands===2)clear('offhand');if(slot==='offhand'&&registry[next.weapon]?.weapon?.hands===2)clear('weapon');if(d.unique&&Object.values(next).includes(id))return {error:'Dorflegenden sind einzigartig: Du kannst dieses Teil nur einmal tragen.'};next[slot]=id;return {slot,next,displaced};}
export function restoreEquipment(saved,registry,version=0){const next=Object.fromEntries(Object.keys(EQUIPMENT_SLOTS).map(slot=>[slot,null]));if(!saved){return {equipment:{...next,weapon:'flasche',offhand:'topfdeckel',ranged:'pfandschleuder',body:'kutte'},recovered:[]};}
 const source={...saved};if(source.charm){const d=registry[source.charm];source[d?.slot==='ring'?'ring1':'trinket1']??=source.charm;delete source.charm;}
 const recovered=[];for(const slot of Object.keys(next)){const id=source[slot],d=registry[id];if(!d)continue;if(!compatibleSlots(d).includes(slot)){const alternate=compatibleSlots(d).find(key=>!next[key]&&!source[key]);if(alternate)next[alternate]=id;else recovered.push(id);continue;}if(d.unique&&Object.values(next).includes(id)){recovered.push(id);continue;}next[slot]=id;}
 if(registry[next.weapon]?.weapon?.hands===2&&next.offhand){recovered.push(next.offhand);next.offhand=null;}
 // Old saves had no secondary/ranged slot. Grant the basic tools exactly once.
 if(version<4){if(!Object.hasOwn(saved,'offhand')&&registry[next.weapon]?.weapon?.hands!==2)next.offhand='topfdeckel';if(!Object.hasOwn(saved,'ranged')&&!next.ranged)next.ranged='pfandschleuder';}
 // Recovery is kept separately if the bag is full; never silently delete gear.
 return {equipment:next,recovered};
}
const validGear=(g,registry,slot)=>{const d=registry[g.rpg.equipment[slot]];return d&&(d.level||1)<=g.player.level?d:null;};
export function weaponRequirement(g,s,registry){const main=validGear(g,registry,'weapon'),off=validGear(g,registry,'offhand'),ranged=validGear(g,registry,'ranged'),melee=!!main?.weapon?.hands;
 const conditions={melee,shield:!!off?.shield,ranged:ranged?.weapon?.hands===0,heavy:melee&&(main.weapon.hands===2||off?.weapon?.hands===1)};
 const names=WEAPON_REQUIREMENT_NAMES;
 return s.requiresWeapon?{name:names[s.requiresWeapon],met:!!conditions[s.requiresWeapon]}:null;
}
export function weaponRange(g,registry,source='melee'){const d=validGear(g,registry,source==='ranged'?'ranged':'weapon');if(!d?.weapon)return {min:0,max:0};const off=source==='melee'?validGear(g,registry,'offhand'):null,mult=d.weapon.hands===1&&off?.weapon?.hands===1?BALANCE.weapons.offhandShare:0;return {min:d.weapon.min+(off?.weapon?.min||0)*mult,max:d.weapon.max+(off?.weapon?.max||0)*mult};}
export function weaponSkillDamage(g,s,base,registry){if(!s.weaponSource)return base;const range=weaponRange(g,registry,s.weaponSource),rolled=range.min+Math.max(0,Math.min(1,g.random()))*(range.max-range.min);return base*rolled/BALANCE.weapons.referenceDamage;}

/** Declarative skill damage. No model retains the old weapon-normalized formula. */
export function skillDamage(g,s,base,registry,points=0){const m=s.damageModel;if(!m)return weaponSkillDamage(g,s,base,registry);const range=weaponRange(g,registry,s.weaponSource||'melee'),roll=range.min+g.random()*(range.max-range.min);return ((m.flat||0)+(m.flatPerPoint||0)*points+roll*((m.weapon||0)+(m.weaponPerPoint||0)*points))*(1+(m.bonusPct||0));}
