// Beschreibungs-API der Engine. Texte und Zahlen kommen aus content/ (Feld `info` bzw. die Helfer
// describe()/describeItem()/describeStage(), sobald es sie gibt – Rückfall auf die Rohfelder text/description/passive).
// Die Engine legt nur `live` obendrauf: was der Wert HEUTE ist, mit Ausrüstung, Talenten, Procs und Basisbau.
import * as CONTENT from './content/index.js';
import {ITEMS,combatStats,countItem,actionBar,barItemEntry,usableItem} from './rpg.js';
import {skillDamage} from './equipment.js';
import {skillCost} from './class-mechanics.js';
import {TALENTS,talentPrerequisites,talentPoints} from './talents.js';
import {available,skillLevel} from './progression.js';
import {procCount,procIds} from './procs.js';

export const DESCRIBE_KINDS=['skill','talent','passive','buff','proc','item','building','cast'];
/** Ein Zahleneintrag: was steigt, um wie viel, in welcher Einheit, aus welcher Quelle. */
export const num=(label,value,unit='',source='')=>({label,value,unit,source});
const round=(n,d=2)=>Math.round(n*10**d)/10**d;
/** Kniffe, deren Schaden über Wumms läuft; der Rest rechnet mit Bastelgrips (siehe Game.damage). */
const PHYSICAL=new Set(['strike','throw','parry','slam','auto']);

/** content/-Helfer, falls vorhanden. Fehlt der Helfer oder wirft er, gilt der Rückfall auf die Rohfelder. */
function fromContent(fn,...args){
 if(typeof fn!=='function')return null;
 try{const out=fn(...args);if(!out||typeof out!=='object')return null;return out.info&&typeof out.info==='object'?out.info:out;}catch{return null;}
}
/** Immer dieselbe Form: effect, numbers, why, links, terms. */
function normalizeInfo(raw,fallback={}){
 const i=raw&&typeof raw==='object'?raw:{};
 return {effect:i.effect||fallback.effect||'',
  numbers:Array.isArray(i.numbers)?i.numbers:fallback.numbers||[],
  why:i.why||fallback.why||'',
  links:Array.isArray(i.links)?i.links:fallback.links||[],
  terms:Array.isArray(i.terms)?i.terms:fallback.terms||[]};
}
const infoFor=(def,fallback,...describeArgs)=>normalizeInfo(def?.info||fromContent(CONTENT.describe,...describeArgs),fallback);

/** Tatsächliche Abklingzeit eines Kniffs in Sekunden – dieselbe Rechnung wie in Game.action. */
export function skillCooldown(game,s,cs=combatStats(game)){
 const base=game.baseEffects?.()||{};
 if(s.id==='dash')return s.cd*(1-(cs.dashCd||0))*(1-(base.dashCd||0))*(cs.procs.includes('fleet')?.85:1);
 if(s.id==='interrupt')return s.cd*(1-(cs.interruptCd||0));
 return s.cd*(1-cs.haste);
}
/** Tatsächlicher Schaden min–max mit Waffe, Talenten und Wertungen (ohne Kritisch, ohne Markierung). */
export function skillDamageRange(game,s,base,points=0){
 if(!Number.isFinite(base))return null;
 const cs=combatStats(game),low=skillDamage({...game,random:()=>0},s,base,ITEMS,points),high=skillDamage({...game,random:()=>1},s,base,ITEMS,points);
 const power=1+cs.power+(PHYSICAL.has(s.id)?cs.physicalPower:cs.technicalPower),crit=1.6+(cs.critDamage||0);
 return {min:Math.round(low*power),max:Math.round(high*power),critMin:Math.round(low*power*crit),critMax:Math.round(high*power*crit)};
}

function describeSkill(game,id){
 const s=game.skills.find(s=>s.id===id);if(!s)return null;
 const cs=combatStats(game),cd=skillCooldown(game,s,cs),cost=skillCost(game,s,cs);
 const damage=s.damage!==undefined?skillDamageRange(game,s,s.damage):s.base!==undefined?skillDamageRange(game,s,s.base+game.player.runes*(s.perPoint||0),game.player.runes):null;
 const numbers=[];
 if(damage)numbers.push(num('Schaden',damage.min===damage.max?damage.min:damage.min+'–'+damage.max,'','Waffe + Wertungen'));
 if(s.heal)numbers.push(num('Heilung',Math.round(s.heal*(1+cs.healPower+(cs.healBonus||0)+cs.mastery*.4)),'','Handschrift + Meisterschaft'));
 if(s.cd)numbers.push(num('Abklingzeit',round(cd,1),'s','Tempo'));
 if(s.cost)numbers.push(num('Kosten',cost,'Randale',''));
 if(s.range)numbers.push(num('Reichweite',Math.round((s.range+(cs.range||0))/8),'m',''));
 return {icon:s.icon||null,name:s.name,
  info:infoFor(s,{effect:s.text||'',numbers},'skill',id),
  live:{available:available(game,id),level:skillLevel(game,id),cooldown:round(cd,2),baseCooldown:s.cd||0,remaining:round(Math.max(0,game.cooldowns[id]||0),2),
   ready:available(game,id)&&(game.cooldowns[id]||0)<=.01,cost,baseCost:s.cost||0,damage,
   heal:s.heal?Math.round(s.heal*(1+cs.healPower+(cs.healBonus||0)+cs.mastery*.4)):0,
   range:s.range?s.range+(cs.range||0):0,castTime:s.castTime||0,gcd:round(cs.gcd,2),crit:round(cs.crit,3),onBar:actionBar(game).indexOf(id)}};
}

function describeTalent(game,id){
 const spec=game.rpg?.talents?.spec,list=TALENTS[spec]||[];
 const t=list.find(t=>t.id===id)||Object.values(TALENTS).flat().find(t=>t.id===id);
 if(!t)return null;
 const state=game.rpg.talents,mine=list.includes(t),learned=!!state?.learned.includes(id);
 return {icon:t.icon||null,name:t.name,
  info:infoFor(t,{effect:t.text||'',numbers:Object.entries(t.effects||{}).map(([k,v])=>num(k,v))},'talent',id),
  live:{learned,spec:mine?spec:Object.keys(TALENTS).find(s=>TALENTS[s].includes(t)),tier:t.tier,
   open:mine&&!learned&&talentPrerequisites(t,state.learned)&&state.learned.length<talentPoints(game),
   pointsLeft:Math.max(0,talentPoints(game)-(state?.learned.length||0)),grants:t.grants||null,effects:{...t.effects}}};
}

function describePassive(game,id){
 const members=CONTENT.CLAN_MEMBERS||[],m=members.find(x=>x.id===id)||members.find(x=>x.id===game.member?.id);
 if(!m)return null;
 const values=m.passives||{};
 return {icon:m.icon||null,name:m.name?m.name+' · Eigenart':'Eigenart',
  info:infoFor(m,{effect:m.passive||'',numbers:Object.entries(values).map(([k,v])=>num(k,Array.isArray(v)?v.join('–'):v))},'passive',id),
  live:{classId:m.id||id,active:game.member?.id===(m.id||id),values:{...values}}};
}

function describeBuff(game,id){
 const t=game.time;
 if(id==='momentum')return {icon:'auto',name:'Schwung',info:infoFor(null,{effect:'Kills geben Schwung: mehr Tempo, Randale und ein Pegel.'},'buff','momentum'),
  live:{active:game.momentum.stacks>0&&game.momentum.until>t,stacks:game.momentum.stacks,remaining:round(Math.max(0,game.momentum.until-t),2)}};
 if(id==='guard')return {icon:'shield',name:'Deckung',info:infoFor(null,{effect:'Deckung fängt Schaden ab, bevor er auf dein Leben geht.'},'buff','guard'),
  live:{active:game.classState.guard>0,value:Math.round(game.classState.guard),remaining:null}};
 if(id==='hot')return {icon:'pretzel',name:'Hauspflege',info:infoFor(null,{effect:'Heilung über Zeit aus Annis Pflege.'},'buff','hot'),
  live:{active:game.classState.hot>0,remaining:round(Math.max(0,game.classState.hot),2),value:game.classState.hotPower||0}};
 const entry=describeSkill(game,id==='buff'?'buff':id);
 if(!entry)return null;
 const running=game.buffs?.remaining>0&&(id==='buff'||game.buffs.id===id);
 return {...entry,live:{...entry.live,active:!!running,remaining:running?round(game.buffs.remaining,2):0,shield:running?game.buffs.shield||0:0,duration:game.buffs.duration||entry.live.duration||0}};
}

function describeProc(game,id){
 const rules=CONTENT.PROC_RULES||{},r=rules[id];if(!r)return null;
 const cs=combatStats(game),st=game.procState||{},armed=procIds(cs).includes(id),t=game.time;
 const glow=r.glow?Math.max(st.free?.[r.glow]||0,st.empower?.[r.glow]||0,st.glow?.[r.glow]||0):0;
 const numbers=[num('Auslöser',r.trigger),...(r.chance<1?[num('Chance',Math.round(r.chance*100),'%')]:[]),...(r.every>1?[num('Jeder',r.every,'. Treffer')]:[]),num('Fenster',r.window,'s')];
 return {icon:r.glow||null,name:r.name||id,
  info:infoFor(r,{effect:r.text||'',numbers},'proc',id),
  live:{armed,trigger:r.trigger,skill:r.skill||null,every:r.every||0,count:procCount(game,id),
   active:glow>t,remaining:glow>t?round(glow-t,2):0,chance:r.chance??1,window:r.window||0,effect:{...r.effect}}};
}

function describeItem(game,id){
 const d=ITEMS[id];if(!d)return null;
 const base=game.baseEffects?.()||{},count=countItem(game.rpg,id),slot=Object.entries(game.rpg.equipment).find(([,v])=>v===id)?.[0]||null;
 const heal=d.heal?Math.round(d.heal*(1+(base.foodHeal||0))):0,energy=d.energy?Math.round(d.energy*(1+(base.foodHeal||0))):0;
 const numbers=[...(heal?[num('Heilung',heal,'Leben','Grill')]:[]),...(energy?[num('Randale',energy,'','Grill')]:[]),
  ...Object.entries(d.stats||{}).map(([k,v])=>num(k,Math.round(v)))];
 const info=normalizeInfo(d.info||fromContent(CONTENT.describeItem,id)||fromContent(CONTENT.describe,'item',id),{effect:d.description||'',numbers});
 const cd=Math.max(0,(BAL(game).consumableCooldown||0)-(base.consumableCd||0));
 return {icon:d.icon||null,name:d.name,info,
  live:{count,rarity:d.rarity||'common',level:d.level||1,kind:d.kind||null,slot:d.slot||null,equipped:slot,usable:usableItem(id),
   heal,energy,cooldown:round(cd,1),remaining:round(Math.max(0,game.rpg.consumableReady-game.time),2),
   ready:count>0&&game.time>=game.rpg.consumableReady,onBar:actionBar(game).indexOf(barItemEntry(id)),rolled:id.startsWith('roll-')}};
}
const BAL=game=>CONTENT.BALANCE.player;

function describeBuilding(game,id){
 const b=(CONTENT.BUILDINGS||{})[id];if(!b)return null;
 const stage=game.buildings[id]||0,current=b.stages[stage-1]||null,next=game.nextBuildStage(id);
 const effect=CONTENT.buildingEffects({[id]:stage});
 const info=normalizeInfo(b.info||fromContent(CONTENT.describeStage,id,stage)||fromContent(CONTENT.describe,'building',id),
  {effect:current?.text||b.text||'',numbers:Object.entries(effect).map(([k,v])=>num(CONTENT.BUILDING_EFFECTS?.[k]||k,v))});
 return {icon:b.icon||null,name:b.name,info,
  live:{stage,maxStage:b.stages.length,owner:b.owner,effect,
   current:current?{stage:current.stage,name:current.name,text:current.text}:null,
   next:next?{stage:next.stage,name:next.name,cost:{...next.cost},text:next.text,
    affordable:Object.entries(next.cost).every(([item,n])=>countItem(game.rpg,item)>=n),
    have:Object.fromEntries(Object.keys(next.cost).map(item=>[item,countItem(game.rpg,item)]))}:null,
   atHub:game.atHub()}};
}

function describeCast(game,id){
 const sets=CONTENT.CAST_SETS||{};
 let def=null,setId=null;
 for(const [key,set] of Object.entries(sets))if(set.casts?.[id]){def=set.casts[id];setId=key;break;}
 if(!def)return null;
 const cs=combatStats(game),running=game.target?.cast?.type===id?game.target.cast:null;
 const numbers=[num('Schaden',Math.round(def.damage*(1-cs.armor)),'','nach deiner Rüstung'),num('Zauberzeit',def.total,'s'),
  ...(def.radius?[num('Radius',Math.round(def.radius/8),'m')]:[])];
 return {icon:def.interruptible?'mute':def.ground?'dash':'shield',name:def.name,
  info:infoFor(def,{effect:def.name,numbers,why:def.interruptible?'Mit Q unterbrechen.':def.ground?'Fläche verlassen.':'Parieren oder ausweichen.'},'cast',id),
  live:{set:setId,interruptible:!!def.interruptible,ground:!!def.ground,radius:def.radius||0,total:def.total,
   raw:def.damage,expected:Math.round(def.damage*(1-cs.armor)*(game.baseEffects?.().damageTaken??1)),
   casting:!!running,remaining:running?round(running.remaining,2):0}};
}

/** game.describe(kind,id): content-Info plus Laufzeitwerte. Unbekannte Art oder Id → null. */
export function describeEntry(game,kind,id){
 switch(kind){
  case 'skill':return describeSkill(game,id);
  case 'talent':return describeTalent(game,id);
  case 'passive':return describePassive(game,id);
  case 'buff':return describeBuff(game,id);
  case 'proc':return describeProc(game,id);
  case 'item':return describeItem(game,id);
  case 'building':return describeBuilding(game,id);
  case 'cast':return describeCast(game,id);
  default:return null;
 }
}

/** Laufende Stärkungen und Proc-Fenster mit Restzeit. `describe` nennt Art und Id für game.describe(). */
export function activeBuffs(game){
 const t=game.time,out=[],name=id=>game.skills.find(s=>s.id===id)?.name||id;
 if(game.buffs?.remaining>0)out.push({kind:'buff',id:'buff',name:game.buffs.name||'Stärkung',remaining:round(game.buffs.remaining,2),shield:game.buffs.shield||0,describe:{kind:'buff',id:'buff'}});
 if(game.momentum?.stacks>0&&game.momentum.until>t)out.push({kind:'buff',id:'momentum',name:'Schwung',remaining:round(game.momentum.until-t,2),stacks:game.momentum.stacks,describe:{kind:'buff',id:'momentum'}});
 if(game.classState?.guard>0)out.push({kind:'buff',id:'guard',name:'Deckung',remaining:null,value:Math.round(game.classState.guard),describe:{kind:'buff',id:'guard'}});
 if(game.classState?.hot>0)out.push({kind:'buff',id:'hot',name:'Hauspflege',remaining:round(game.classState.hot,2),value:game.classState.hotPower||0,describe:{kind:'buff',id:'hot'}});
 const st=game.procState||{};
 for(const [mode,label] of [['free','gratis'],['empower','×2'],['glow','bereit']])
  for(const [skill,until] of Object.entries(st[mode]||{}))if(until>t)out.push({kind:'proc',id:skill,mode,name:name(skill)+' '+label,remaining:round(until-t,2),describe:{kind:'skill',id:skill}});
 if(st.hasteUntil>t&&st.haste)out.push({kind:'buff',id:'proc-haste',name:'Tempo',remaining:round(st.hasteUntil-t,2),value:st.haste,describe:{kind:'buff',id:'proc-haste'}});
 const rules=CONTENT.PROC_RULES||{};
 for(const id of procIds(combatStats(game)))if(rules[id]?.every>1&&procCount(game,id)%rules[id].every)
  out.push({kind:'proc',id,mode:'count',name:rules[id].glow?name(rules[id].glow):id,count:procCount(game,id)%rules[id].every,every:rules[id].every,remaining:null,describe:{kind:'proc',id}});
 return out;
}
