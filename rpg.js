import {emitCombatFx} from './combat-fx.js';
import {restoreMeterHealth} from './combat-meter.js';
import {EQUIPMENT_SLOTS,equipmentPlan,restoreEquipment,weaponRange} from './equipment.js';
import {talentState,talentEffects,SPECS} from './talents.js';
import {restoreRolls,rollDrop,questChoices} from './itemization.js';
import {available,LESSONS,skillLevel} from './progression.js';
import {BALANCE,ITEM_CATALOG,rating,SYSTEM_LINES} from './content/index.js';
export const BAG_SIZE=24;
export const SLOT_KEYS=['1','2','3','4','5','6','7','8','9','0'];
export const SPECIAL_KEYS={dash:' ',interrupt:'q'};
export const DEFAULT_BAR=['auto','strike','buff','throw','parry','mark','burst','ground','heal',null];
/** Leistenplätze halten Kniffe (Id) oder benutzbare Gegenstände ('item:<id>'). Beide Formen sind Speicherschlüssel. */
export const BAR_ITEM_PREFIX='item:';
export const barItemEntry=id=>BAR_ITEM_PREFIX+id;
export const barItemId=entry=>typeof entry==='string'&&entry.startsWith(BAR_ITEM_PREFIX)?entry.slice(BAR_ITEM_PREFIX.length):null;
/** Benutzbarer Gegenstand: `usable:true` aus content/items.js, Rückfall auf kind==='consumable'. */
export const usableItem=id=>{const d=ITEMS[id];return !!d&&(d.usable===true||(d.usable!==false&&d.kind==='consumable'));};
/** Laufzeitregister: Katalog aus content/items.js plus gewürfelte Gegenstände des Spielstands. */
export const ITEMS=Object.fromEntries(Object.entries(ITEM_CATALOG).map(([id,d])=>[id,structuredClone(d)]));
const integer=(n,max=1e9)=>Math.max(0,Math.min(max,Math.floor(Number(n)||0)));
const validEntry=e=>e&&ITEMS[e.id]&&integer(e.count,ITEMS[e.id].stack||1)>0;
export function createRpg(saved,worldKey,classId='dieter'){const s=saved&&typeof saved==='object'?saved:null;const generated=restoreRolls(s?.generated,ITEMS),restored=restoreEquipment(s?.equipment,ITEMS,s?.version||0),talentBuilds=Object.fromEntries(['dieter','baerbel','kevin'].map(id=>[id,talentState(s?.talentBuilds?.[id]||(id===classId?s?.talents:null),id)]));return {version:4,recovery:[...(Array.isArray(s?.recovery)?s.recovery.filter(id=>ITEMS[id]):[]),...restored.recovered],starterClaimed:!!s?.starterClaimed,generated,itemSequence:integer(s?.itemSequence),lootState:integer(s?.lootState,0xffffffff)||Math.floor(Math.random()*2147483646)+1,talentBuilds,talents:talentBuilds[classId],rewardChoices:s?.rewardChoices&&typeof s.rewardChoices==='object'?Object.fromEntries(Object.entries(s.rewardChoices).filter(([,ids])=>Array.isArray(ids)&&ids.length===3&&ids.every(id=>ITEMS[id]))):{},worldKey,coins:integer(s?.coins),inventory:s&&Array.isArray(s.inventory)?s.inventory.filter(validEntry).slice(0,BAG_SIZE).map(e=>({id:e.id,count:integer(e.count,ITEMS[e.id].stack||1)})):[{id:'brezel',count:3},{id:'wasser',count:2}],equipment:restored.equipment,actionBars:s?.version>=2&&s?.actionBars&&typeof s.actionBars==='object'?structuredClone(s.actionBars):{},barSeen:Array.isArray(s?.barSeen)?s.barSeen.filter(id=>ITEMS[id]).slice(0,80):[],sequence:integer(s?.sequence),loot:s&&s.worldKey===worldKey&&Array.isArray(s.loot)?s.loot.filter(b=>typeof b.id==='string'&&Number.isFinite(b.x)&&Number.isFinite(b.y)&&Math.abs(b.x)<200000&&Math.abs(b.y)<200000).map(b=>({id:b.id,x:b.x,y:b.y,coins:integer(b.coins),source:b.source&&typeof b.source==='object'?{name:String(b.source.name||''),kind:String(b.source.kind||'bag')}:{name:'',kind:'bag'},items:Array.isArray(b.items)?b.items.filter(validEntry).map(e=>({id:e.id,count:integer(e.count,ITEMS[e.id].stack||1)})):[]})):[],consumableReady:0};}
export function equipmentStats(game){const result={stamina:0,might:0,finesse:0,wit:0,armorRating:0,critRating:0,hasteRating:0,masteryRating:0};for(const id of Object.values(game.rpg?.equipment||{})){const d=ITEMS[id];if(!d||(d.level||1)>game.player.level)continue;for(const k in result)result[k]+=d.stats?.[k]||0;}return {...result,health:result.stamina*BALANCE.player.hpPerStamina,power:0,armor:result.armorRating/(result.armorRating+485)};}
export function combatStats(game){
 const P=BALANCE.player,R=BALANCE.ratings,W=BALANCE.power,gear=equipmentStats(game),talent=talentEffects(game),level=game.player.level,spec=game.rpg?.talents?.spec||'dieter-wall',raw={};
 for(const key of ['stamina','might','finesse','wit','armorRating','critRating','hasteRating','masteryRating'])raw[key]=(key==='stamina'?P.baseStamina:['might','finesse','wit'].includes(key)?P.basePrimary:0)+(gear[key]||0)+(talent[key]||0)+(['might','finesse','wit'].includes(key)?(level-1)*P.primaryPerLevel:0);
 const haste=Math.min(R.haste.cap,rating(raw.hasteRating+raw.finesse*R.haste.finesseWeight,R.haste.k))+(game.momentum?.stacks||0)*BALANCE.momentum.hastePerStack+(game.procState&&game.procState.hasteUntil>game.time?game.procState.haste:0),armorValue=raw.armorRating+raw.might*R.armor.mightWeight,procs=Object.values(game.rpg?.equipment||{}).filter(id=>(ITEMS[id]?.level||1)<=level).map(id=>ITEMS[id]?.proc).filter(Boolean);
 return {...talent,...raw,health:(raw.stamina-P.baseStamina)*P.hpPerStamina,power:raw.might*W.might+raw.finesse*W.finesse+raw.wit*W.wit,physicalPower:raw.might*W.physicalMight,technicalPower:raw.wit*W.technicalWit,healPower:raw.wit*W.healWit+raw.might*W.healMight,shieldPower:raw.might*W.shieldMight+raw.wit*W.shieldWit,armor:Math.min(R.armor.cap,rating(armorValue,R.armor.k+level*R.armor.perLevel)),crit:Math.min(R.crit.cap,R.crit.base+rating(raw.critRating+raw.finesse*R.crit.finesseWeight,R.crit.k)),haste,mastery:rating(raw.masteryRating,R.mastery.k),energyRegen:(talent.energyRegen||0)+raw.wit*W.energyRegenWit,gcd:Math.max(P.gcdMin,P.gcdBase*(1-haste)),procs,spec};
}
export const baseHealth=level=>BALANCE.player.baseHp+(level-1)*BALANCE.player.hpPerLevel;
export function refreshEquipment(game){game.player.maxHp=baseHealth(game.player.level)+combatStats(game).health;game.player.hp=Math.min(game.player.hp,game.player.maxHp);}
export const rewardOptions=(g,id,quality)=>questChoices(g,id,ITEMS,quality);
export function savedRpg(g){const r=g.rpg,used=new Set([...r.inventory.map(e=>e.id),...(r.recovery||[]),...Object.values(r.equipment),...r.loot.flatMap(b=>b.items.map(e=>e.id)),...Object.values(r.rewardChoices).flat(),...Object.values(r.actionBars||{}).flat().map(barItemId).filter(Boolean)]);return structuredClone({...r,consumableReady:0,generated:Object.fromEntries(Object.entries(r.generated).filter(([id])=>used.has(id)))});}
export function chooseReward(g,id,choice,quality){const options=rewardOptions(g,id,quality);if(!options.includes(choice)){g.toast('Wähle genau ein Ausrüstungsteil.');return false;}if(addItem(g.rpg,choice)){g.toast('Ein Platz im Rucksack muss für die Belohnung frei sein.');return false;}changed(g);return true;}
export function addItem(rpg,id,count=1){const def=ITEMS[id];if(!def)return count;let remaining=integer(count,999);const max=def.stack||1;for(const entry of rpg.inventory){if(entry.id!==id)continue;const n=Math.min(remaining,max-entry.count);entry.count+=n;remaining-=n;}while(remaining>0&&rpg.inventory.length<BAG_SIZE){const n=Math.min(remaining,max);rpg.inventory.push({id,count:n});remaining-=n;}return remaining;}
function removeItem(rpg,id){const i=rpg.inventory.findIndex(e=>e.id===id);if(i<0)return false;if(--rpg.inventory[i].count===0)rpg.inventory.splice(i,1);return true;}
/** Wie oft liegt ein Gegenstand im Rucksack (über alle Stapel)? */
export function countItem(rpg,id){return rpg.inventory.reduce((n,e)=>e.id===id?n+e.count:n,0);}
/** Prüft eine Materialliste {itemId:menge} gegen den Rucksack. */
export const hasMaterials=(rpg,cost={})=>Object.entries(cost).every(([id,n])=>countItem(rpg,id)>=n);
/** Zieht eine Materialliste ab. Gibt false zurück, wenn etwas fehlt – dann bleibt der Rucksack unverändert. */
export function consumeMaterials(rpg,cost={}){if(!hasMaterials(rpg,cost))return false;for(const [id,n] of Object.entries(cost))for(let i=0;i<n;i++)removeItem(rpg,id);return true;}
const changed=game=>{game.emit('rpgChanged');game.emit('save');};
export function equipItem(game,id,requested){const def=ITEMS[id],r=game.rpg;if(game.dead){game.toast('Erst wieder aufstehen, dann ausrüsten.');return false;}if(!def?.slot||!r.inventory.some(e=>e.id===id))return false;if((def.level||1)>game.player.level){game.toast('Benötigt Stufe '+def.level+'.');return false;}const plan=equipmentPlan(r.equipment,ITEMS,id,requested);if(plan.error){game.toast(plan.error);return false;}const snapshot=r.inventory.map(e=>({...e})),index=r.inventory.findIndex(e=>e.id===id);removeItem(r,id);const displaced=plan.displaced.slice();if(displaced.length&&snapshot[index].count===1)r.inventory.splice(index,0,{id:displaced.shift().id,count:1});for(const old of displaced)if(addItem(r,old.id)){r.inventory=snapshot;game.toast('Für diesen Wechsel braucht der Rucksack '+Math.max(0,plan.displaced.length-1)+' freie Plätze. Beide Hände werden gemeinsam umgerüstet.');return false;}const endedParry=game.player.parry>0;r.equipment=plan.next;game.player.parry=0;game.player.parryCharges=0;game.aiming=null;game.aimPoint=null;refreshEquipment(game);game.toast(def.name+' → '+EQUIPMENT_SLOTS[plan.slot]+'.'+(plan.displaced.length?' Abgelegt: '+plan.displaced.map(e=>ITEMS[e.id].name).join(', ')+'.':'')+(endedParry?' Parade beendet.':''));changed(game);return true;}
export function claimStarterWeapons(game){const r=game.rpg;if(game.dead||!game.atHub()){game.toast('Die Clankiste steht am sicheren Treffpunkt.');return false;}if(r.starterClaimed)return false;const snapshot=r.inventory.map(e=>({...e}));for(const id of ['dosenklinge','tresenhammer'])if(addItem(r,id)){r.inventory=snapshot;game.toast('Zwei freie Rucksackplätze für die Clankiste nötig.');return false;}r.starterClaimed=true;changed(game);game.toast('Dosenklinge und Tresenhammer eingepackt. Probiere deine Waffenkombinationen.');return true;}
export function recoverEquipment(game){if(game.dead)return false;const pending=[];for(const id of game.rpg.recovery||[])if(addItem(game.rpg,id))pending.push(id);game.rpg.recovery=pending;changed(game);return !pending.length;}
export function unequipItem(game,slot){const r=game.rpg,id=r.equipment[slot];if(!id||game.dead)return false;if(addItem(r,id)){game.toast('Dein Rucksack ist voll.');return false;}const endedParry=game.player.parry>0;r.equipment[slot]=null;game.player.parry=0;game.player.parryCharges=0;game.aiming=null;game.aimPoint=null;refreshEquipment(game);if(endedParry)game.toast(ITEMS[id].name+' abgelegt. Parade beendet.');changed(game);return true;}
export function useItem(game,id){const def=ITEMS[id],p=game.player;if(game.paused||game.dead||!usableItem(id))return false;
 if(!game.rpg.inventory.some(e=>e.id===id)){game.toast(def.name+': Davon hast du nichts mehr dabei.');return false;}
 if(game.time<game.rpg.consumableReady){game.toast(def.name+' ist noch nicht bereit · '+Math.max(0,game.rpg.consumableReady-game.time).toFixed(1)+' s.');return false;}if(def.heal&&p.hp>=p.maxHp||def.energy&&p.energy>=100){game.toast('Das brauchst du gerade nicht.');return false;}const hpBefore=p.hp,energyBefore=p.energy;removeItem(game.rpg,id);const b=game.baseEffects?.()||{};if(def.heal)restoreMeterHealth(game,Math.round(def.heal*(1+(b.foodHeal||0))),{id:'item:'+id,name:def.name});if(def.energy)p.energy=Math.min(100,p.energy+Math.round(def.energy*(1+(b.foodHeal||0))));game.rpg.consumableReady=game.time+Math.max(0,BALANCE.player.consumableCooldown-(b.consumableCd||0));if(p.hp>hpBefore)emitCombatFx(game,'heal',p,{amount:p.hp-hpBefore,direct:true});if(p.energy>energyBefore)emitCombatFx(game,'proc',p,{signal:'resource',label:'+'+Math.round(p.energy-energyBefore)+' RANDALE'});game.toast(def.name+' benutzt.');game.memoryEvent?.({kind:'consumable',item:id});changed(game);if(actionBar(game).includes(barItemEntry(id))&&!countItem(game.rpg,id))game.emit('barChanged');return true;}
/** Belegung der Leiste. Gegenstandsplätze bleiben auch bei leerem Stapel reserviert – die UI graut sie aus. */
export function actionBar(game){const key=game.member.id,bar=game.rpg.actionBars[key];if(!Array.isArray(bar)){game.rpg.actionBars[key]=DEFAULT_BAR.map(id=>id&&available(game,id)?id:null);return game.rpg.actionBars[key];}const seen=new Set();game.rpg.actionBars[key]=Array.from({length:10},(_,i)=>{const id=bar[i],item=barItemId(id);if(item)return !usableItem(item)||seen.has(id)?null:(seen.add(id),id);if(SPECIAL_KEYS[id]!==undefined||!game.skills.some(s=>s.id===id)||!available(game,id)||seen.has(id))return null;seen.add(id);return id;});return game.rpg.actionBars[key];}
/** Ein Leistenplatz für die UI: Kniff, Gegenstand (mit Stapelgröße und Bereitschaft) oder leer. */
export function barSlots(game){const bar=actionBar(game);return bar.map((entry,index)=>{const key=SLOT_KEYS[index],item=barItemId(entry);
 if(item){const d=ITEMS[item],count=countItem(game.rpg,item),wait=Math.max(0,game.rpg.consumableReady-game.time);
  return {index,key,entry,kind:'item',id:item,name:d.name,icon:d.icon||null,count,empty:count===0,cooldown:wait,ready:count>0&&wait<=0,available:count>0};}
 if(!entry)return {index,key,entry:null,kind:'empty',id:null,name:'',icon:null,available:false};
 const s=game.skills.find(s=>s.id===entry);
 return {index,key,entry,kind:'skill',id:entry,name:s?.name||entry,icon:s?.icon||null,available:available(game,entry),cooldown:Math.max(0,game.cooldowns[entry]||0),ready:available(game,entry)&&(game.cooldowns[entry]||0)<=.01};});}
/** Belegt einen Platz mit einem Kniff oder einem Gegenstand ('item:<id>'). `null` räumt den Platz. */
export function bindSkill(game,id,index){if(!Number.isInteger(index)||index<0||index>9)return false;
 const item=barItemId(id);
 if(item){if(!usableItem(item))return false;}
 else if(id&&(SPECIAL_KEYS[id]!==undefined||!game.skills.some(s=>s.id===id&&available(game,id))))return false;
 const bar=actionBar(game),old=id?bar.indexOf(id):-1,replaced=bar[index];
 if(old>=0)bar[old]=replaced;else if(barItemId(replaced))noteBarItem(game,barItemId(replaced));
 bar[index]=id||null;
 if(item)noteBarItem(game,item);
 changed(game);game.emit('barChanged');return true;}
/** Merkt sich einen Gegenstand als „war schon auf der Leiste“ – er wandert nicht von allein zurück. */
function noteBarItem(game,id){const seen=game.rpg.barSeen||(game.rpg.barSeen=[]);if(!seen.includes(id))seen.push(id);}
/** Neu gelernte Kniffe auf die Leiste. Kniffe haben Vorrang: ist kein Platz frei, weicht der letzte Gegenstand. */
export function unlockOnBar(game,ids){const bar=actionBar(game);let touched=false;
 for(const id of ids.slice().sort((a,b)=>skillLevel(game,a)-skillLevel(game,b))){if(SPECIAL_KEYS[id]!==undefined||bar.includes(id))continue;
  let slot=bar.indexOf(null);
  if(slot<0){slot=bar.map(barItemId).findLastIndex(Boolean);if(slot<0)continue;noteBarItem(game,barItemId(bar[slot]));}
  bar[slot]=id;touched=true;}
 if(touched)game.emit('barChanged');return touched;}
/** Neue Verpflegung nimmt einmalig einen freien Leistenplatz. Wer sie abräumt, bekommt sie nicht ungefragt zurück. */
export function placeUsables(game,ids){const bar=actionBar(game),seen=game.rpg.barSeen||(game.rpg.barSeen=[]);let touched=false;
 for(const id of ids){if(!usableItem(id)||seen.includes(id))continue;const entry=barItemEntry(id);
  if(bar.includes(entry)){noteBarItem(game,id);continue;}
  const slot=bar.lastIndexOf(null);if(slot<0){noteBarItem(game,id);continue;}bar[slot]=entry;noteBarItem(game,id);touched=true;}
 if(touched){game.emit('barChanged');game.emit('save');}
 return touched;}
export function keyFor(game,id){if(SPECIAL_KEYS[id]!==undefined)return id==='dash'?'LEER':'Q';const i=actionBar(game).indexOf(id);return i<0?'Skillbuch':SLOT_KEYS[i]===' '?'LEER':SLOT_KEYS[i].toUpperCase();}
/** Beute als Ereignis – gleich, ob sie automatisch oder von Hand eingesammelt wurde. */
function lootEvent(game,items,coins,source){game.emit('loot',{items:items.map(e=>({id:e.id,count:e.count,rarity:ITEMS[e.id]?.rarity||'common',rolled:e.id.startsWith('roll-')})),coins,source:{name:source?.name||'',kind:source?.kind||'bag'}});}
/** Auto-Loot: der ganze Beutel wandert sofort in den Rucksack. Was nicht passt, geht nach rpg.recovery. */
export function autoLootBag(game,bag){const r=game.rpg,taken=[],coins=bag.coins;let lost=0;
 r.coins+=coins;bag.coins=0;
 for(const e of bag.items){const rest=addItem(r,e.id,e.count);if(e.count-rest>0)taken.push({id:e.id,count:e.count-rest});for(let i=0;i<rest;i++){r.recovery.push(e.id);lost++;}}
 bag.items=[];r.loot=r.loot.filter(b=>b.id!==bag.id);
 placeUsables(game,taken.map(e=>e.id));
 lootEvent(game,taken,coins,bag.source);
 if(lost)game.toast(SYSTEM_LINES.lootFull?.(lost)||`Rucksack voll · ${lost} Fundstück${lost===1?'':'e'} warten unter „Ausrüstung zurückholen“.`);
 changed(game);return {items:taken,coins,lost};}
export function createDrop(game,enemy){const r=game.rpg,n=++r.sequence,{items,coins}=rollDrop(game,enemy,ITEMS);if(!items.length&&!coins)return null;const bag={id:'drop-'+n,x:enemy.x,y:enemy.y,coins,items,source:{name:enemy.name,kind:enemy.type==='boss'?'boss':'enemy'}};r.loot.push(bag);game.emit('rpgChanged');if(game.settings?.autoLoot)autoLootBag(game,bag);return bag;}
export function nearestLoot(game){return game.rpg.loot.filter(b=>Math.hypot(b.x-game.player.x,b.y-game.player.y)<43).sort((a,b)=>Math.hypot(a.x-game.player.x,a.y-game.player.y)-Math.hypot(b.x-game.player.x,b.y-game.player.y))[0]||null;}
export function sortInventory(game){const inventory=[];for(const item of game.rpg.inventory)addItem({inventory},item.id,item.count);inventory.sort((a,b)=>{const rank=d=>d.slot?0:d.kind==='consumable'?1:2;return rank(ITEMS[a.id])-rank(ITEMS[b.id])||ITEMS[a.id].name.localeCompare(ITEMS[b.id].name,'de');});game.rpg.inventory=inventory;changed(game);game.toast('Rucksack sortiert: Ausrüstung, Verpflegung, Material.');}
export function takeLoot(game,id,selection=null){const r=game.rpg,bag=r.loot.find(b=>b.id===id);if(!bag||game.dead)return false;if(Math.hypot(bag.x-game.player.x,bag.y-game.player.y)>43){game.toast('Der Beutel ist zu weit weg. Geh näher heran.');return false;}if(selection&&selection!=='coins'&&!bag.items.some(e=>e.id===selection))return false;let coins=0;if(!selection||selection==='coins'){coins=bag.coins;r.coins+=coins;bag.coins=0;}const taken=[];for(const item of bag.items)if(!selection||selection===item.id){const rest=addItem(r,item.id,item.count);if(item.count-rest>0)taken.push({id:item.id,count:item.count-rest});item.count=rest;}bag.items=bag.items.filter(e=>e.count>0);if(!bag.items.length&&!bag.coins)r.loot=r.loot.filter(b=>b.id!==id);placeUsables(game,taken.map(e=>e.id));lootEvent(game,taken,coins,{...bag.source,kind:bag.source?.kind||'chest'});game.toast(bag.items.some(e=>!selection||e.id===selection)?'Rucksack voll. Der Rest bleibt liegen.':'Beute eingepackt.');changed(game);return true;}
