// Prüfungen der Rolle Gegenstände & Loot (items.js, drops.js, equipment.js, item-icons.js).
import {ITEM_CATALOG} from '../items.js';
import {DROP_TABLES} from '../drops.js';
export function check(bad){
 // Jede Dorflegende fällt irgendwo (Beutetabelle) oder ist ausdrücklich Questbelohnung (reward:true).
 const dropped=new Set(Object.values(DROP_TABLES).map(t=>t.unique));
 for(const [id,d] of Object.entries(ITEM_CATALOG))if(d.unique&&!d.retired&&!dropped.has(id)&&!d.reward)bad('item '+id,'Dorflegende ohne Beutetabelle und ohne reward:true');
 // Jedes Material wird irgendwo fallen gelassen oder ist Sammelgut (gather:true).
 const materials=new Set(Object.values(DROP_TABLES).map(t=>t.material));
 for(const [id,d] of Object.entries(ITEM_CATALOG))if(d.kind==='material'&&!materials.has(id)&&!d.gather)bad('item '+id,'Material ohne Beutequelle (drops.js) und ohne gather:true');
 // Jeder Gegenstand mit Bildbedarf hat einen look; Verpflegung nennt die Wirkung im Text.
 for(const [id,d] of Object.entries(ITEM_CATALOG)){if(d.unique&&!d.look)bad('item '+id,'Dorflegende ohne look');if(d.kind==='consumable'&&!/\d/.test(d.description))bad('item '+id,'Verpflegungstext nennt keine Zahl');}
}
