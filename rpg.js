import {MOUNT_UI} from './content/index.js';
import {restoreShopHistory} from './shop-state.js';
import {emitCombatFx} from './combat-fx.js';
import {restoreMeterHealth} from './combat-meter.js';
import {EQUIPMENT_SLOTS,equipmentPlan,restoreEquipment,weaponRange,compatibleSlots} from './equipment.js';
import {talentState,talentEffects,SPECS} from './talents.js';
import {restoreRolls,rollDrop,questChoices,registerRoll} from './itemization.js';
import {available,LESSONS,skillLevel} from './progression.js';
import {classBuffValue} from './class-buffs.js';
import {BAR_SIZE,MAX_BARS,DEFAULT_BARS,bindingAt,bindingLabel,cleanBarKeys} from './bar-keys.js';
import {ACTION_BAR_TEXT,BALANCE,ITEM_CATALOG,rating,ratingK,powerRate,SYSTEM_LINES,STAT_NAMES,GEAR_COMPARE,WEAPON_TYPES,BAG_UI,RARITIES} from './content/index.js';
export const BAG_SIZE=24;
/** Standardtasten der ersten Leiste (Touch-Übersetzung). Die wirksame Taste je Platz liefert slotKey() (bar-keys.js). */
export const SLOT_KEYS=['1','2','3','4','5','6','7','8','9','0'];
export {BAR_SIZE,MAX_BARS};
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
export function createRpg(saved,worldKey,classId='dieter'){const s=saved&&typeof saved==='object'?saved:null;const generated=restoreRolls(s?.generated,ITEMS),restored=restoreEquipment(s?.equipment,ITEMS,s?.version||0),talentBuilds=Object.fromEntries(['dieter','baerbel','kevin'].map(id=>[id,talentState(s?.talentBuilds?.[id]||(id===classId?s?.talents:null),id)]));return {version:4,recovery:[...(Array.isArray(s?.recovery)?s.recovery.filter(id=>ITEMS[id]):[]),...restored.recovered],starterClaimed:!!s?.starterClaimed,generated,itemSequence:integer(s?.itemSequence),lootState:integer(s?.lootState,0xffffffff)||Math.floor(Math.random()*2147483646)+1,talentBuilds,talents:talentBuilds[classId],rewardChoices:s?.rewardChoices&&typeof s.rewardChoices==='object'?Object.fromEntries(Object.entries(s.rewardChoices).filter(([,ids])=>Array.isArray(ids)&&ids.length===3&&ids.every(id=>ITEMS[id]))):{},worldKey,buyback:restoreShopHistory(s?.buyback,ITEMS),shopSequence:Number.isSafeInteger(s?.shopSequence)&&s.shopSequence>=0?s.shopSequence:0,coins:integer(s?.coins),inventory:s&&Array.isArray(s.inventory)?s.inventory.filter(validEntry).slice(0,BAG_SIZE).map(e=>({id:e.id,count:integer(e.count,ITEMS[e.id].stack||1)})):[{id:'brezel',count:3},{id:'wasser',count:2}],equipment:restored.equipment,actionBars:s?.version>=2&&s?.actionBars&&typeof s.actionBars==='object'?structuredClone(s.actionBars):{},barCount:Number.isInteger(s?.barCount)&&s.barCount>=1&&s.barCount<=MAX_BARS?s.barCount:DEFAULT_BARS,barKeys:cleanBarKeys(s?.barKeys),barSeen:Array.isArray(s?.barSeen)?s.barSeen.filter(id=>ITEMS[id]).slice(0,80):[],sequence:integer(s?.sequence),loot:s&&s.worldKey===worldKey&&Array.isArray(s.loot)?s.loot.filter(b=>typeof b.id==='string'&&Number.isFinite(b.x)&&Number.isFinite(b.y)&&Math.abs(b.x)<200000&&Math.abs(b.y)<200000).map(b=>({id:b.id,x:b.x,y:b.y,coins:integer(b.coins),source:b.source&&typeof b.source==='object'?{name:String(b.source.name||''),kind:String(b.source.kind||'bag')}:{name:'',kind:'bag'},items:Array.isArray(b.items)?b.items.filter(validEntry).map(e=>({id:e.id,count:integer(e.count,ITEMS[e.id].stack||1)})):[]})):[],consumableReady:0};}
export function equipmentStats(game){const result=Object.fromEntries(Object.keys(STAT_NAMES).map(k=>[k,0]));for(const id of Object.values(game.rpg?.equipment||{})){const d=ITEMS[id];if(!d||(d.level||1)>game.player.level)continue;for(const k in result)result[k]+=d.stats?.[k]||0;}return {...result,health:result.stamina*BALANCE.player.hpPerStamina};}
export function combatStats(game){
 const P=BALANCE.player,R=BALANCE.ratings,W=BALANCE.power,gear=equipmentStats(game),talent=talentEffects(game),level=game.player.level,spec=game.rpg?.talents?.spec||'dieter-wall',raw={};
 // E-53: fünf Werte, jede Mechanik hängt an genau einem – Standfestigkeit → Leben, Wumms → Schaden,
 // Taktgefühl → Glückstreffer-Chance und Tempo, Bastelgrips → Heilung/Deckung/Randale, Dicke Haut → Schadensminderung.
 const primary=k=>k==='might'||k==='finesse'||k==='wit';
 for(const key of Object.keys(STAT_NAMES))raw[key]=(key==='stamina'?P.baseStamina:primary(key)?P.basePrimary+(level-1)*P.primaryPerLevel:0)+(gear[key]||0)+(talent[key]||0);
 const haste=Math.min(R.haste.cap,rating(raw.finesse*R.haste.finesseWeight,ratingK(R.haste,level)))+(game.momentum?.stacks||0)*BALANCE.momentum.hastePerStack+(game.procState&&game.procState.hasteUntil>game.time?game.procState.haste:0)+(game.classState?.m?.hasteBonus||0)+classBuffValue(game,'haste'),procs=Object.values(game.rpg?.equipment||{}).filter(id=>(ITEMS[id]?.level||1)<=level).map(id=>ITEMS[id]?.proc).filter(Boolean);
 return {...talent,...raw,health:(raw.stamina-P.baseStamina)*P.hpPerStamina,power:raw.might*powerRate('might',level),healPower:raw.wit*powerRate('healWit',level),shieldPower:raw.wit*powerRate('shieldWit',level),armor:Math.min(R.armor.cap,rating(raw.armorRating,ratingK(R.armor,level)))+classBuffValue(game,'armor'),crit:Math.min(R.crit.cap,R.crit.base+rating(raw.finesse*R.crit.finesseWeight,ratingK(R.crit,level)))+classBuffValue(game,'crit'),haste,flatScale:1+(level-1)*(P.flatPerLevel||0),energyRegen:(talent.energyRegen||0)+raw.wit*powerRate('energyRegenWit',level)+classBuffValue(game,'energyRegen'),gcd:Math.max(P.gcdMin,P.gcdBase*(1-haste)),procs,spec,
  // Klassen-Buffs (class-buffs.js): Anteile, die nicht an einem der fünf Werte hängen. Tempo, Glückstreffer, Schadensminderung und Randale oben.
  healthPct:classBuffValue(game,'health'),healTaken:classBuffValue(game,'healTaken')};
}
export const baseHealth=level=>BALANCE.player.baseHp+(level-1)*BALANCE.player.hpPerLevel;
export function refreshEquipment(game){const cs=combatStats(game);const hp=baseHealth(game.player.level)+cs.health;game.player.maxHp=cs.healthPct?Math.round(hp*(1+cs.healthPct)):hp;game.player.hp=Math.min(game.player.hp,game.player.maxHp);}
export const rewardOptions=(g,id,quality)=>questChoices(g,id,ITEMS,quality);
export function savedRpg(g){const r=g.rpg,used=new Set([...(r.buyback||[]).map(e=>e.id),...r.inventory.map(e=>e.id),...(r.recovery||[]),...Object.values(r.equipment),...r.loot.flatMap(b=>b.items.map(e=>e.id)),...Object.values(r.rewardChoices).flat(),...Object.values(r.actionBars||{}).flat().map(barItemId).filter(Boolean)]);return structuredClone({...r,consumableReady:0,generated:Object.fromEntries(Object.entries(r.generated).filter(([id])=>used.has(id)))});}
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
/** Belegung aller sichtbaren Leisten als eine Liste: Platz 0–9 = Leiste 1, 10–19 = Leiste 2 usw. (rpg.barCount, Standard 2).
 *  Gegenstandsplätze bleiben auch bei leerem Stapel reserviert – die UI graut sie aus. Alte Spielstände (eine Leiste mit 10 Plätzen) werden aufgefüllt. */
const barLength=game=>BAR_SIZE*(Number.isInteger(game.rpg.barCount)&&game.rpg.barCount>=1&&game.rpg.barCount<=MAX_BARS?game.rpg.barCount:1);
export function actionBar(game){const key=game.member.id,bar=game.rpg.actionBars[key],length=barLength(game);if(!Array.isArray(bar)){game.rpg.actionBars[key]=Array.from({length},(_,i)=>{const id=DEFAULT_BAR[i];return id&&available(game,id)?id:null;});return game.rpg.actionBars[key];}const seen=new Set();game.rpg.actionBars[key]=Array.from({length},(_,i)=>{const id=bar[i],item=barItemId(id);if(id==='mount')return game.mounts?.owned.length&&!seen.has(id)?(seen.add(id),id):null;if(item)return !usableItem(item)||seen.has(id)?null:(seen.add(id),id);if(SPECIAL_KEYS[id]!==undefined||!game.skills.some(s=>s.id===id)||!available(game,id)||seen.has(id))return null;seen.add(id);return id;});return game.rpg.actionBars[key];}
/** Anzahl sichtbarer Leisten ändern (UI-Einstellung). Plätze einer entfernten Leiste werden geräumt; Gegenstände darauf kehren nicht von allein zurück. */
export function setBarCount(game,count){if(!Number.isInteger(count)||count<1||count>MAX_BARS)return false;const bar=actionBar(game);for(const entry of bar.slice(count*BAR_SIZE)){const item=barItemId(entry);if(item)noteBarItem(game,item);}game.rpg.barCount=count;actionBar(game);changed(game);game.emit('barChanged');return true;}
/** Wirksame Taste eines Platzes, kurz beschriftet („3", „⇧2", „M4"); '' = ohne Taste. */
export const slotKey=(game,index)=>bindingLabel(bindingAt(game.rpg,index));
/** Ein Leistenplatz für die UI: Kniff, Gegenstand (mit Stapelgröße und Bereitschaft) oder leer. */
export function barSlots(game){const bar=actionBar(game);return bar.map((entry,index)=>{const key=slotKey(game,index),item=barItemId(entry),row=Math.floor(index/BAR_SIZE);
 if(entry==='mount')return {index,row,key,entry,kind:'mount',id:'mount',name:MOUNT_UI.barName,available:!!game.mounts?.owned.length};
 if(item){const d=ITEMS[item],count=countItem(game.rpg,item),wait=Math.max(0,game.rpg.consumableReady-game.time);
  return {index,row,key,entry,kind:'item',id:item,name:d.name,icon:d.icon||null,count,empty:count===0,cooldown:wait,ready:count>0&&wait<=0,available:count>0};}
 if(!entry)return {index,row,key,entry:null,kind:'empty',id:null,name:'',icon:null,available:false};
 const s=game.skills.find(s=>s.id===entry);
 return {index,row,key,entry,kind:'skill',id:entry,name:s?.name||entry,icon:s?.icon||null,available:available(game,entry),cooldown:Math.max(0,game.cooldowns[entry]||0),ready:available(game,entry)&&(game.cooldowns[entry]||0)<=.01};});}
/** Belegt einen Platz mit einem Kniff oder einem Gegenstand ('item:<id>'). `null` räumt den Platz. Liegt der Eintrag schon woanders, tauschen die Plätze. */
export function bindSkill(game,id,index){const bar=actionBar(game);if(!Number.isInteger(index)||index<0||index>=bar.length)return false;
 const item=barItemId(id);
 if(item){if(!usableItem(item))return false;}
 else if(id==='mount'){if(!game.mounts?.owned.length)return false;}
 else if(id&&(SPECIAL_KEYS[id]!==undefined||!game.skills.some(s=>s.id===id&&available(game,id))))return false;
 const old=id?bar.indexOf(id):-1,replaced=bar[index];
 if(old>=0)bar[old]=replaced;else if(barItemId(replaced))noteBarItem(game,barItemId(replaced));
 bar[index]=id||null;
 if(item)noteBarItem(game,item);
 changed(game);game.emit('barChanged');return true;}
/** Merkt sich einen Gegenstand als „war schon auf der Leiste“ – er wandert nicht von allein zurück. */
function noteBarItem(game,id){const seen=game.rpg.barSeen||(game.rpg.barSeen=[]);if(!seen.includes(id))seen.push(id);}
const firstFree=(bar,from=0)=>{for(let i=from;i<bar.length;i++)if(!bar[i])return i;return -1;};
/** Neu gelernte Kniffe auf die Leiste. Leiste 1 zuerst; ist sie voll, rückt ihr letzter Gegenstand auf eine weitere Leiste (oder weicht, wenn keine frei ist).
 *  Klassen-Buffs (30 min, class-buffs.js) nur auf einen freien Platz ab Leiste 2 – sie verdrängen nie Kampfkniffe; ohne freien Platz bleiben sie im Kniffe-Menü. */
export function unlockOnBar(game,ids){const bar=actionBar(game);let touched=false;
 for(const id of ids.slice().sort((a,b)=>skillLevel(game,a)-skillLevel(game,b))){if(SPECIAL_KEYS[id]!==undefined||bar.includes(id))continue;
  if(game.skills.find(s=>s.id===id)?.classBuff){const slot=firstFree(bar,BAR_SIZE);if(slot>=0){bar[slot]=id;touched=true;}continue;}
  let slot=bar.slice(0,BAR_SIZE).indexOf(null);
  if(slot<0){slot=bar.slice(0,BAR_SIZE).map(barItemId).findLastIndex(Boolean);const spare=firstFree(bar,BAR_SIZE);
   if(slot>=0){if(spare>=0)bar[spare]=bar[slot];else noteBarItem(game,barItemId(bar[slot]));}else slot=spare;
   if(slot<0)continue;}
  bar[slot]=id;touched=true;}
 if(touched)game.emit('barChanged');return touched;}
/** Neue Verpflegung nimmt einmalig einen freien Leistenplatz (Leiste 1 von hinten, sonst die nächste Leiste). Wer sie abräumt, bekommt sie nicht ungefragt zurück. */
export function placeUsables(game,ids){const bar=actionBar(game),seen=game.rpg.barSeen||(game.rpg.barSeen=[]);let touched=false;
 for(const id of ids){if(!usableItem(id)||seen.includes(id))continue;const entry=barItemEntry(id);
  if(bar.includes(entry)){noteBarItem(game,id);continue;}
  let slot=bar.slice(0,BAR_SIZE).lastIndexOf(null);if(slot<0)slot=firstFree(bar,BAR_SIZE);if(slot<0){noteBarItem(game,id);continue;}bar[slot]=entry;noteBarItem(game,id);touched=true;}
 if(touched){game.emit('barChanged');game.emit('save');}
 return touched;}
export function keyFor(game,id){if(SPECIAL_KEYS[id]!==undefined)return id==='dash'?'LEER':'Q';const i=actionBar(game).indexOf(id);return i<0?'Skillbuch':slotKey(game,i)||ACTION_BAR_TEXT.noKey;}
/** Beute als Ereignis – gleich, ob sie automatisch oder von Hand eingesammelt wurde. */
function lootEvent(game,items,coins,source){game.emit('loot',{items:items.map(e=>({id:e.id,count:e.count,rarity:ITEMS[e.id]?.rarity||'common',rolled:e.id.startsWith('roll-')})),coins,source:{name:source?.name||'',kind:source?.kind||'bag'}});}
/** Wirkungen einer Ausrüstung (E-53): Leben, Schaden, Glückstreffer, Tempo, Waffe je Sekunde, Heilung, Deckung, Randale, Schutz. */
export function gearProfile(game,equipment=game.rpg.equipment){const shadow={...game,rpg:{...game.rpg,equipment}},cs=combatStats(shadow),dps=source=>{const r=weaponRange(shadow,ITEMS,source),d=ITEMS[equipment[source==='ranged'?'ranged':'weapon']],speed=d?.weapon?.speed||WEAPON_TYPES[d?.weapon?.type]?.speed||0;return speed?(r.min+r.max)/2/speed:0;};
 return {health:cs.health,power:cs.power,crit:cs.crit,haste:cs.haste,melee:dps('melee'),ranged:dps('ranged'),heal:cs.healPower,shield:cs.shieldPower,energy:cs.energyRegen,armor:cs.armor};}
/** Änderung je Wirkung in Prozent (Leben relativ zum Maximalleben, Randale relativ zum Nachschub im Kampf). */
function profileDelta(game,before,after){const pct=(a,b)=>((1+a)/(1+b)-1)*100,rel=(a,b)=>b>0?(a/b-1)*100:a>0?100:0,maxHp=baseHealth(game.player.level)+before.health;
 return {health:(after.health-before.health)/maxHp*100,power:pct(after.power,before.power),crit:(after.crit-before.crit)*100,haste:(after.haste-before.haste)*100,melee:rel(after.melee,before.melee),ranged:rel(after.ranged,before.ranged),heal:pct(after.heal,before.heal),shield:pct(after.shield,before.shield),energy:(after.energy-before.energy)/BALANCE.momentum.combatEnergyRegen*100,armor:(after.armor-before.armor)*100};}
/**
 * Vergleich eines Ausrüstungsteils mit dem, was es verdrängt (E-53), für genau einen Platz.
 * changes: [{key,label,value,unit,percent}] – nur Wirkungen, die sich ändern; value in Anzeigeeinheit (Leben absolut, sonst %).
 * score: Kampfkraft = Σ Gewicht(Klasse) × Änderung in %.
 */
export function gearComparison(game,id,slot){const r=game.rpg,plan=equipmentPlan(r.equipment,ITEMS,id,slot);if(plan.error)return {error:plan.error};
 const before=gearProfile(game),after=gearProfile(game,plan.next),delta=profileDelta(game,before,after),weights=GEAR_COMPARE.weights[game.member?.id]||GEAR_COMPARE.weights.dieter;
 const changes=Object.keys(GEAR_COMPARE.labels).filter(k=>Math.abs(delta[k])>=.05).map(k=>({key:k,label:GEAR_COMPARE.labels[k],percent:delta[k],value:k==='health'?Math.round(after.health-before.health):Math.round(delta[k]*10)/10,unit:k==='health'?'':'%'}));
 const score=Object.keys(delta).reduce((n,k)=>n+(weights[k]||0)*delta[k],0);
 return {slot:plan.slot,plan,changes,score:Math.round(score*10)/10};}
/**
 * Einschätzung eines Ausrüstungsteils gegen das, was es verdrängen würde.
 * verdict: 'empty' (Platz frei) | 'upgrade' | 'downgrade' | 'sidegrade' | 'blocked' (Stufe/Hand passt nicht) | null (kein Ausrüstungsteil, schon angelegt)
 * Bei zwei Plätzen (Ringe, Schmuck, Einhandwaffe) zählt ein freier Platz, sonst der Platz mit dem besten Ergebnis.
 * score/changes aus gearComparison (Wirkungen statt roher Werte, gewichtet je Klasse).
 */
export function upgradeVerdict(game,id){const d=ITEMS[id],r=game.rpg;if(!d?.slot)return null;const choices=compatibleSlots(d);
 if(!choices.length||choices.every(slot=>r.equipment[slot]===id)||(d.unique&&Object.values(r.equipment).includes(id)))return null;
 if((d.level||1)>game.player.level)return {verdict:'blocked',score:0,reason:'level',changes:[]};
 // Ein Schild in der Nebenhand bleibt außen vor: er schaltet die Parade frei, die keine Wirkungszahl hat.
 const options=choices.filter(slot=>r.equipment[slot]!==id&&!(slot==='offhand'&&d.weapon&&ITEMS[r.equipment.offhand]?.shield)).map(slot=>gearComparison(game,id,slot)).filter(c=>!c.error);if(!options.length)return {verdict:'blocked',score:0,reason:'slot',changes:[]};
 const free=options.find(c=>!c.plan.displaced.length),best=free||options.reduce((a,b)=>b.score>a.score?b:a);
 const verdict=free?'empty':best.score>GEAR_COMPARE.threshold?'upgrade':best.score<-GEAR_COMPARE.threshold?'downgrade':'sidegrade';
 return {verdict,score:best.score,slot:best.slot,changes:best.changes,displaced:best.plan.displaced};}
/** Fundstücke wandern direkt an den Körper, wenn ihr Platz leer ist (nie im Kampf-Tod, nie mit Verdrängen). Meldung ins Ereignis-Log. */
export function autoEquipFound(game,ids){const done=[];for(const id of ids){const v=upgradeVerdict(game,id);if(v?.verdict!=='empty')continue;if(equipItem(game,id)){done.push(id);game.log('Angelegt: '+ITEMS[id].name+' – der Platz war frei.');}}return done;}
/** Auto-Loot: der ganze Beutel wandert sofort in den Rucksack. Was nicht passt, geht nach rpg.recovery. */
export function autoLootBag(game,bag){const r=game.rpg,taken=[],coins=bag.coins;let lost=0;
 r.coins+=coins;bag.coins=0;
 for(const e of bag.items){const rest=addItem(r,e.id,e.count);if(e.count-rest>0)taken.push({id:e.id,count:e.count-rest});for(let i=0;i<rest;i++){r.recovery.push(e.id);lost++;}}
 bag.items=[];r.loot=r.loot.filter(b=>b.id!==bag.id);
 placeUsables(game,taken.map(e=>e.id));
 lootEvent(game,taken,coins,bag.source);autoEquipFound(game,taken.map(e=>e.id));
 if(lost)game.toast(SYSTEM_LINES.lootFull?.(lost)||`Rucksack voll · ${lost} Fundstück${lost===1?'':'e'} warten unter „Ausrüstung zurückholen“.`);
 changed(game);return {items:taken,coins,lost};}
/** Gewonnenes oder zurückgegebenes Würfelteil (E-42) einbuchen. Gewürfelte Teile kommen als Bauplan `raw` und werden hier neu registriert. */
export function grantLoot(game,item,source,count=1){const r=game.rpg;let id=item?.id;if(item?.raw)id=registerRoll(r,ITEMS,item.raw);if(!ITEMS[id])return null;return autoLootBag(game,{id:'won-'+(++r.sequence),coins:0,items:[{id,count:Math.max(1,Math.min(99,Math.round(count)||1))}],source:source||{name:'Gruppe',kind:'enemy'}});}
/** Handel (E-44): Rucksack-Eintrag als Handelsgut beschreiben; gewürfelte Teile tragen ihren Bauplan. */
export function tradeGood(game,id,count=1){const d=ITEMS[id];if(!d)return null;const raw=game.rpg.generated?.[id];return {id,name:d.name,rarity:d.rarity||'common',icon:d.icon||'',slot:d.slot||'',count:Math.max(1,Math.min(countItem(game.rpg,id),count)),...(raw?{raw:{...raw}}:{})};}
/** Handel (E-44): Zugesagtes abgeben. Gibt false zurück, wenn etwas fehlt – dann wird nichts angerührt. */
export function tradeAway(game,items=[],coins=0){const r=game.rpg;coins=Math.max(0,Math.round(coins)||0);if(r.coins<coins||items.some(e=>countItem(r,e.id)<e.count))return false;r.coins-=coins;for(const e of items){for(let i=0;i<e.count;i++)removeItem(r,e.id);if(e.raw&&!countItem(r,e.id))delete r.generated[e.id];}changed(game);return true;}
/** Weltboss (E-44): jeder Beteiligte findet sicher ein seltenes Teil – in der Gruppe wird es ausgewürfelt. */
function worldBossBonus(game,enemy,drop){if(!enemy?.worldBoss)return drop;const slots=['weapon','head','shoulders','body','hands','legs','feet','ring','trinket'],specs=['tresen','bass','pfand'],rnd=()=>game.lootRandom();const probe={slot:slots[Math.floor(rnd()*slots.length)],spec:specs[Math.floor(rnd()*specs.length)],level:Math.max(1,Math.min(game.player.level+1,enemy.level||1)),quality:'rare',family:enemy.family||'quest',roll:Math.floor(rnd()*1000)};drop.items.push({id:registerRoll(game.rpg,ITEMS,probe),count:1});drop.coins+=BALANCE.loot.coinsBoss;return drop;}
export function createDrop(game,enemy){const r=game.rpg,n=++r.sequence,drop=worldBossBonus(game,enemy,rollDrop(game,enemy,ITEMS)),coins=drop.coins,items=game.netParty?.loot?game.netParty.loot(drop.items,enemy):drop.items;if(!items.length&&!coins)return null;const bag={id:'drop-'+n,x:enemy.x,y:enemy.y,coins,items,source:{name:enemy.name,kind:enemy.type==='boss'?'boss':'enemy'}};r.loot.push(bag);game.emit('rpgChanged');if(game.settings?.autoLoot)autoLootBag(game,bag);return bag;}
export function nearestLoot(game){return game.rpg.loot.filter(b=>Math.hypot(b.x-game.player.x,b.y-game.player.y)<43).sort((a,b)=>Math.hypot(a.x-game.player.x,a.y-game.player.y)-Math.hypot(b.x-game.player.x,b.y-game.player.y))[0]||null;}
/** Stapel zusammenlegen und ordnen (E-53). mode: kind (Ausrüstung, Verpflegung, Material) | rarity | level | name | better. */
export function sortInventory(game,mode='kind'){const inventory=[];for(const item of game.rpg.inventory)addItem({inventory},item.id,item.count);
 const kind=d=>d.slot?0:d.kind==='consumable'?1:2,grade=Object.keys(RARITIES),rarityRank=d=>-grade.indexOf(d.rarity),level=d=>-(d.itemLevel||d.level||0),verdicts={upgrade:0,empty:0,sidegrade:1,downgrade:2,blocked:3},better=id=>{const v=upgradeVerdict(game,id);return v?[verdicts[v.verdict]??4,-v.score]:[4,0];};
 const keys={kind:id=>[kind(ITEMS[id])],rarity:id=>[rarityRank(ITEMS[id]),kind(ITEMS[id])],level:id=>[level(ITEMS[id]),kind(ITEMS[id])],name:()=>[],better:id=>better(id)},key=keys[mode]?mode:'kind',cache=new Map(inventory.map(e=>[e.id,keys[key](e.id)]));
 inventory.sort((a,b)=>{const x=cache.get(a.id),y=cache.get(b.id);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return x[i]-y[i];return ITEMS[a.id].name.localeCompare(ITEMS[b.id].name,'de');});
 game.rpg.inventory=inventory;changed(game);game.toast(BAG_UI.sorted+(BAG_UI.sortModes.find(([m])=>m===key)?.[1]||key)+'.');}
export function takeLoot(game,id,selection=null){const r=game.rpg,bag=r.loot.find(b=>b.id===id);if(!bag||game.dead)return false;if(Math.hypot(bag.x-game.player.x,bag.y-game.player.y)>43){game.toast('Der Beutel ist zu weit weg. Geh näher heran.');return false;}if(selection&&selection!=='coins'&&!bag.items.some(e=>e.id===selection))return false;let coins=0;if(!selection||selection==='coins'){coins=bag.coins;r.coins+=coins;bag.coins=0;}const taken=[];for(const item of bag.items)if(!selection||selection===item.id){const rest=addItem(r,item.id,item.count);if(item.count-rest>0)taken.push({id:item.id,count:item.count-rest});item.count=rest;}bag.items=bag.items.filter(e=>e.count>0);if(!bag.items.length&&!bag.coins)r.loot=r.loot.filter(b=>b.id!==id);placeUsables(game,taken.map(e=>e.id));lootEvent(game,taken,coins,{...bag.source,kind:bag.source?.kind||'chest'});autoEquipFound(game,taken.map(e=>e.id));game.toast(bag.items.some(e=>!selection||e.id===selection)?'Rucksack voll. Der Rest bleibt liegen.':'Beute eingepackt.');changed(game);return true;}
