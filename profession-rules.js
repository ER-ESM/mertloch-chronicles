import {PROFESSIONS as P,PROFESSION_RECIPES as REC,PROFESSION_SOURCES as SRC,PROFESSION_RULES as R,PROFESSION_UI as T,STORY_CHAPTERS} from './content/index.js';
import {addItem,countItem,consumeMaterials} from './rpg.js';
const known=(o,id)=>typeof id==='string'&&Object.hasOwn(o,id);
export function restoreProfessions(raw){const learned={};for(const [id,s]of Object.entries(raw?.learned||{}))if(known(P,id)&&Object.keys(learned).length<R.slots)learned[id]=Math.max(1,Math.min(R.cap,Math.floor(Number(s)||1)));return {version:1,revision:Number.isSafeInteger(raw?.revision)&&raw.revision>=0?raw.revision:0,online:raw?.online===true,learned,solo:raw?.solo&&typeof raw.solo==='object'?raw.solo:{}};}
export const recipeKnown=(state,id)=>known(REC,id)&&(state.learned[REC[id].profession]||0)>=REC[id].required;
export function professionPlan(save,action){
 const state=restoreProfessions(save.professions),rpg={inventory:structuredClone(save.rpg?.inventory||[]),coins:Number(save.rpg?.coins)||0},kind=action.kind,id=action.target,skill=state.learned[id];
 if((save.level||1)<R.level||save.tutorial&&!save.tutorial.completed)return {error:T.level};
 if(kind==='learn'){if(!known(P,id))return {error:T.unknown};if(skill)return {error:T.unknown};if(Object.keys(state.learned).length>=R.slots)return {error:T.slots};if(rpg.coins<R.learnCost)return {error:T.money};rpg.coins-=R.learnCost;state.learned[id]=1;}
 else if(kind==='forget'){if(!known(P,id)||!skill)return {error:T.required};delete state.learned[id];}
 else if(kind==='craft'){
  const d=REC[id];if(!recipeKnown(state,id))return {error:T.required};if(rpg.coins<R.recipeFee)return {error:T.money};
  const q=save.quest,reserve=q?.accepted&&!q.actDone&&q.chapterClaimed<q.chapter?STORY_CHAPTERS.find(c=>c.id===q.chapter)?.objectives||[]:[];
  if(Object.entries(d.materials).some(([i,n])=>countItem(rpg,i)-reserve.filter(o=>o.kind==='gather'&&o.item===i).reduce((v,o)=>v+o.count,0)<n))return {error:T.missing};
  consumeMaterials(rpg,d.materials);if(addItem(rpg,d.output,d.count))return {error:T.full};rpg.coins-=R.recipeFee;if(state.learned[d.profession]<d.grey)state.learned[d.profession]=Math.min(R.cap,state.learned[d.profession]+1);
 }else if(kind==='gather'){
  const d=known(SRC,id)&&SRC[id];if(!d||(state.learned[d.profession]||0)<d.required)return {error:T.required};for(const [i,n]of Object.entries(d.items))if(addItem(rpg,i,n))return {error:T.full};if(state.learned[d.profession]<d.grey)state.learned[d.profession]=Math.min(R.cap,state.learned[d.profession]+1);
 }else return {error:T.unknown};
 state.revision++;return {professions:state,rpg:{...save.rpg,...rpg}};
}
export function resourcePhase(raw={},now=Date.now()){let cycle=Number(raw.cycle)||1,opened=Number(raw.opened)||0;if(opened&&now>=opened+R.windowMs+R.regrowMs){cycle++;opened=0;}return {cycle,opened,phase:!opened?'ready':now<opened+R.windowMs?'window':'empty',until:opened?opened+R.windowMs+(now<opened+R.windowMs?0:R.regrowMs):0};}
export function actionSite(layout,action){if(action.kind==='gather')return layout.nodes.find(n=>n.id===action.node);const p=action.kind==='craft'?P[REC[action.target]?.profession]:P[action.target];return p&&layout.stations.find(s=>s.id===p.station);}
export const actionDuration=a=>a.kind==='gather'?R.gatherSeconds:a.kind==='craft'?R.craftSeconds:0;
export const actionName=a=>a.kind==='gather'?SRC[a.target]?.name:a.kind==='craft'?REC[a.target]?.name:P[a.target]?.name;
