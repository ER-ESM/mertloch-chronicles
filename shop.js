import {inKiosk,kioskEntrance,roomWorld} from './kiosk-instance.js';
import {KIOSK_ROOM,KIOSK_TEXT} from './content/index.js';
import {SHOP_STOCK,SHOP_RULES as R,SHOP_UI as UI,ITEM_CATALOG,NPCS} from './content/index.js';
import {ITEMS,addItem,countItem,consumeMaterials} from './rpg.js';
import {tutorialActive} from './tutorial.js';

export const merchantPoint=g=>inKiosk(g)?KIOSK_ROOM.service:kioskEntrance(g);
/** Leave the navigation destination free, with Kalle beside the customer. */
export const merchantActorPoint=g=>inKiosk(g)?KIOSK_ROOM.keeper:null;
export function shopUnavailable(g){
 if(g.dead)return UI.dead;
 if(g.paused)return UI.paused;
 if(tutorialActive(g))return UI.tutorial;
 if(g.player.inCombat>0||g.casting)return UI.combat;
 if(!inKiosk(g))return KIOSK_TEXT.firstEnter;
 const p=merchantPoint(g);
 if(!p||Math.hypot(p.x-g.player.x,p.y-g.player.y)>KIOSK_ROOM.range||!roomWorld.lineClear(g.player,p))return UI.far;
 return '';
}
export function shopInteraction(g){const p=kioskEntrance(g);return !inKiosk(g)&&p&&Math.hypot(p.x-g.player.x,p.y-g.player.y)<=KIOSK_ROOM.range?{kind:'enterKiosk',id:UI.npc,name:UI.title,point:{...p},priority:4}:null;}
export const salePrice=id=>{const d=ITEMS[id];return d&&!d.quest&&!d.unique&&Number.isFinite(d.value)&&d.value>=0&&(d.slot||['material','consumable'].includes(d.kind))?Math.max(R.minSell,Math.floor((d.value||0)*R.sellRate)):0;};
export function reservedCount(g,id){
 if(!g.quest?.accepted||g.quest.actDone||g.quest.chapterClaimed>=g.quest.chapter)return 0;
 return (g.objectives?.()||[]).filter(o=>o.kind==='gather'&&o.item===id).reduce((n,o)=>n+o.count,0);
}
export const sellableCount=(g,id)=>Math.max(0,countItem(g.rpg,id)-reservedCount(g,id));
const quantity=n=>Number.isInteger(n)&&n>=1&&n<=R.maxQuantity;
const fail=(g,text)=>{g.toast(text);return false;};
const changed=g=>{g.emit('rpgChanged');g.emit('save');};
function purchasedInventory(g,id,count){const draft={inventory:g.rpg.inventory.map(e=>({...e}))};return addItem(draft,id,count)?null:draft.inventory;}
export function buyItem(g,id,count=1){
 const reason=shopUnavailable(g);if(reason)return fail(g,reason);
 const d=ITEM_CATALOG[id];
 if(!SHOP_STOCK.includes(id)||!quantity(count)||!d)return fail(g,UI.invalid);
 if(g.player.level<(d.level||1))return fail(g,UI.neededLevel(d.level));
 const total=d.price*count;if(g.rpg.coins<total)return fail(g,UI.money);
 const next=purchasedInventory(g,id,count);if(!next)return fail(g,UI.full);
 g.rpg.inventory=next;g.rpg.coins-=total;/* Dungeon-Fix 2: Gekauftes legt sich nicht mehr ungefragt auf die Leiste */g.toast(UI.bought(d.name,count));changed(g);return true;
}
export function sellItem(g,id,count=1){
 const reason=shopUnavailable(g);if(reason)return fail(g,reason);
 const price=salePrice(id);if(!price||!quantity(count))return fail(g,UI.invalid);
 if(count>sellableCount(g,id))return fail(g,UI.protected);
 const total=price*count;if(g.rpg.coins+total>R.maxCoins)return fail(g,UI.limit);
 const history=g.rpg.buyback||[],token=Math.max(g.rpg.shopSequence||0,...history.map(e=>e.token))+1;
 if(!Number.isSafeInteger(token))return fail(g,UI.invalid);
 if(!consumeMaterials(g.rpg,{[id]:count}))return fail(g,UI.invalid);
 g.rpg.shopSequence=token;g.rpg.buyback=[...history,{token,id,count,total}].slice(-R.buybackLimit);g.rpg.coins+=total;
 g.toast(UI.sold(ITEMS[id].name,count));changed(g);return true;
}
export function buybackItem(g,token){
 const reason=shopUnavailable(g);if(reason)return fail(g,reason);
 const entry=g.rpg.buyback?.find(e=>e.token===token);if(!entry)return fail(g,UI.invalid);
 if(g.rpg.coins<entry.total)return fail(g,UI.money);
 const next=purchasedInventory(g,entry.id,entry.count);if(!next)return fail(g,UI.full);
 g.rpg.inventory=next;g.rpg.coins-=entry.total;g.rpg.buyback=g.rpg.buyback.filter(e=>e.token!==token);
 g.toast(UI.recovered(ITEMS[entry.id].name,entry.count));changed(g);return true;
}
