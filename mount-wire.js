// Cosmetic presence only, under the same client-trusting co-op model as positions and combat.
import {MOUNTS,EQUIPMENT_SLOTS,RARITIES,ITEM_CATALOG} from './content/index.js';
const assets=new Set(['helmet','cap','chain','pauldron','shoulderpad','jacket','raincoat','vest','bracer','glove','belt','trouser','boot','leatherboot','furboot','ring','pendant','medal','badge','pouch','tusk','badgercharm','cup','club','blade','maul','slingshot','sprayer','bottle','wateringcan','whistle','stamp','robotclaw','potlid','shield']);
export function mountPresence(raw={}){
 const mt=typeof raw.mt==='string'&&Object.hasOwn(MOUNTS,raw.mt)&&raw.s!=='dead'?raw.mt:null,md=['se','sw','ne','nw'].includes(raw.md)?raw.md:null,seen=new Set();
 // Ausrüstung auch zu Fuß (Anziehpuppe zeigt sie an jedem Mitspieler); id nur, wenn es den Gegenstand gibt (exakte Zeichnung statt Familie).
 const eq=Array.isArray(raw.eq)?raw.eq.slice(0,16).flatMap(e=>{if(!e||!Object.hasOwn(EQUIPMENT_SLOTS,e.slot)||seen.has(e.slot)||!assets.has(e.asset))return [];seen.add(e.slot);return [{slot:e.slot,...(typeof e.id==='string'&&Object.hasOwn(ITEM_CATALOG,e.id)?{id:e.id}:{}),asset:e.asset,rarity:Object.hasOwn(RARITIES,e.rarity)?e.rarity:'common',hands:[0,1,2].includes(e.hands)?e.hands:null}];}):[];
 return {mt,md,eq};
}
