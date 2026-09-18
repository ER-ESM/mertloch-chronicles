import {ITEM_CATALOG} from './content/items.js';
import {equipmentAppearance} from './equipment-appearance.js';
import {equipmentPlan} from './equipment.js';

export const DEMO_HEROES = [
 {id:'dieter',name:'Dosen-Dieter',role:'Der hält das aus.',color:'#d9b77e'},
 {id:'baerbel',name:'Aperol-Anni',role:'Heilung mit Nachdruck.',color:'#edab79'},
 {id:'kevin',name:'Klo-Kevin',role:'Ein guter Schuss reicht.',color:'#a6bc8e'}
];
// Real inventory IDs. Resolve slots, two-handed rules and appearances exactly as in the game.
export const DEMO_PRESETS = [
 {id:'dieter-start',hero:'dieter',name:'Feierabend',note:'Mehrwegflasche & Omas Topfdeckel',equipment:{body:'kutte',feet:'festivalstiefel',weapon:'flasche',offhand:'topfdeckel',ranged:'pfandschleuder'}},
 {id:'dieter-tank',hero:'dieter',name:'Dorfverteidiger',note:'Dosenbrecher & Bierdeckel-Panzerweste',equipment:{body:'bierdeckelweste',head:'dienstmuetze',feet:'kabelbinderstiefel',trinket1:'gansorden',weapon:'dosenbrecher',offhand:'topfdeckel'}},
 {id:'dieter-heavy',hero:'dieter',name:'Tresenabriss',note:'Zweihandhammer & Festival-Regenjacke',equipment:{body:'regenjacke',feet:'fuchspfote',trinket1:'keilerzahn',weapon:'tresenhammer'}},
 {id:'anni-spray',hero:'baerbel',name:'Hygieneeinsatz',note:'Hochdruckspray & Regenjacke',ranged:true,equipment:{body:'regenjacke',feet:'festivalstiefel',trinket1:'gansorden',ranged:'megafon',weapon:'flasche',offhand:'topfdeckel'}},
 {id:'anni-garden',hero:'baerbel',name:'Gießkommando',note:'Giselas Gießkanne & Glückspfote',equipment:{body:'kutte',feet:'fuchspfote',ring1:'pfandring',weapon:'giesskanne'}},
 {id:'anni-order',hero:'baerbel',name:'Ruhe im Dorf',note:'Trillerpfeife & Praktikantenausweis',ranged:true,equipment:{body:'bierdeckelweste',feet:'kabelbinderstiefel',trinket1:'praktikantenausweis',ranged:'ruhepfeife'}},
 {id:'kevin-range',hero:'kevin',name:'Pfandjäger',note:'Pfandschleuder & Dachsdeckel',ranged:true,equipment:{body:'bierdeckelweste',feet:'kabelbinderstiefel',trinket1:'dachsdeckel',ranged:'pfandschleuder',weapon:'dosenklinge',offhand:'topfdeckel'}},
 {id:'kevin-blade',hero:'kevin',name:'Dosen-Duell',note:'Dosenklinge & Topfdeckel',equipment:{body:'kutte',feet:'festivalstiefel',ring1:'pfandring',weapon:'dosenklinge',offhand:'topfdeckel'}},
 {id:'kevin-stamp',hero:'kevin',name:'Letzte Mahnung',note:'Horststempel & Schnorrerbecher',equipment:{body:'regenjacke',head:'dienstmuetze',feet:'fuchspfote',trinket1:'schnorrerbecher',weapon:'horststempel'}}
];
export function resolveDemoEquipment(equipment){
 let next={};
 for(const [slot,id] of Object.entries(equipment)){
  if(!id)continue;
  const plan=equipmentPlan(next,ITEM_CATALOG,id,slot);
  if(plan.error)throw Error(`${slot}: ${id}: ${plan.error}`);
  next=plan.next;
 }
 return {equipment:next,visualEquipment:equipmentAppearance(next,ITEM_CATALOG)};
}
export function demoPose(action,time=0,distance=0){
 if(action==='walk')return {moving:true,walkDistance:distance};
 if(action==='attack')return {attack:time%1.1<.32?.28:.06};
 if(action==='hit')return {hurt:1};
 if(action==='rest')return {resting:true};
 return {};
}
