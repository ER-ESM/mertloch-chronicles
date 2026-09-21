// Stable content IDs and skill unlocks; ranks and the approved five-tier layout live here.
import {MECHANIC_EFFECTS,BALANCE,CLASS_SPECS,SPECS,TALENT_ROWS,TALENT_CELLS,SPEC_MECHANICS,PATH_BONUS_AT} from './content/index.js';
import {RANKS,effectsAt} from './talent-ranks.js';
export {CLASS_SPECS,SPECS,PATH_BONUS_AT};
export const TIER_POINTS=2;
export const TALENT_TIERS=5;
const CELLS=[[0,0],[0,1],[0,2],[1,1],[2,0],[2,2],[3,0],[3,1],[3,2],[4,1]];
export const TALENTS=Object.fromEntries(Object.entries(TALENT_ROWS).map(([spec,list])=>{
 const tree=list.map((t,i)=>{const c=TALENT_CELLS[spec][i],id=spec+'-'+i,scaling=RANKS[id];return {...t,...c,id,spec,icon:id,scaling,maxRank:scaling?.values.length||1};});
 for(const path of [0,1,2]){const nodes=tree.filter(t=>t.path===path).sort((a,b)=>a.row-b.row);nodes.forEach((t,i)=>{const [tier,slot]=CELLS[i];Object.assign(t,{tier,slot:i===9?path:slot,spent:tier*TIER_POINTS,parents:i===4?[nodes[0].id]:i===9?[nodes[7].id]:[]});});}
 return [spec,tree];
}));
const BY_ID=new Map(Object.values(TALENTS).flat().map(t=>[t.id,t]));
export const talentById=id=>BY_ID.get(id)||null;
const MECH_KEYS=new Set(Array.isArray(MECHANIC_EFFECTS)?MECHANIC_EFFECTS:Object.keys(MECHANIC_EFFECTS||{}));
export const mainTreeOnly=t=>Object.keys(t?.effects||{}).some(k=>MECH_KEYS.has(k));
const ids=state=>Array.isArray(state)?state:state?.learned||[];
// ID arrays remain supported for fixtures and old saves. Live state stores each ID once.
export const talentRank=(state,id)=>ids(state).includes(id)?Math.max(1,Math.min(BY_ID.get(id)?.maxRank||1,Number.isInteger(state?.ranks?.[id])?state.ranks[id]:1)):0;
export const spentPoints=state=>ids(state).reduce((n,id)=>n+talentRank(state,id),0);
export const pointsInTree=(state,spec,except)=>ids(state).reduce((n,id)=>n+(id!==except&&BY_ID.get(id)?.spec===spec?talentRank(state,id):0),0);
export const pointsBelow=(state,spec,tier)=>ids(state).reduce((n,id)=>{const t=BY_ID.get(id);return n+(t?.spec===spec&&t.tier<tier?talentRank(state,id):0);},0);
export const talentPrerequisites=(t,state)=>!!t&&pointsBelow(state,t.spec,t.tier)>=t.spent&&t.parents.every(id=>talentRank(state,id)>0);
export const classSpecs=id=>CLASS_SPECS[id]||CLASS_SPECS.dieter;
export const pointsAtLevel=level=>{const T=BALANCE.player.talentPoints,l=Math.max(1,Math.min(BALANCE.maxLevel,level|0));return Math.min(l,T.perLevelUntil)-1+Math.max(0,Math.floor((l-T.perLevelUntil)/T.thenEvery));};
export const TALENT_POINT_CAP=pointsAtLevel(BALANCE.maxLevel);
export const talentPoints=g=>pointsAtLevel(g.player.level);
/** Replay old/new saves through the same rules. Unplaceable points become free; report them in the menu. */
export function talentState(raw,classId='dieter',budget=TALENT_POINT_CAP){
 const specs=classSpecs(classId),state={version:2,spec:specs.includes(raw?.spec)?raw.spec:null,learned:[],ranks:{}};
 const pending=[...new Set(ids(raw))].filter(id=>specs.includes(BY_ID.get(id)?.spec)).slice(0,90);
 const targets=new Map(pending.map(id=>[id,talentRank(raw,id)]));let spent=0;
 for(let pass=0;pass<90&&spent<budget;pass++){let grew=false;for(const id of pending){if(spent>=budget)break;const t=BY_ID.get(id),rank=talentRank(state,id);if(rank>=targets.get(id)||!talentPrerequisites(t,state))continue;if(!rank)state.learned.push(id);state.ranks[id]=rank+1;spent++;grew=true;}if(!grew)break;}
 const refunded=Math.max(0,[...targets.values()].reduce((a,b)=>a+b,0)-spent)+(Number.isSafeInteger(raw?.refundedPoints)?Math.max(0,raw.refundedPoints):0);
 if(refunded)state.refundedPoints=refunded;
 return state;
}
export function pathCounts(g,spec=g.rpg?.talents?.spec){const state=g.rpg?.talents,out=[0,0,0];if(!state||!TALENTS[spec])return out;for(const id of state.learned){const t=BY_ID.get(id);if(t?.spec===spec)out[t.path]+=talentRank(state,id);}return out;}
export function pathEffects(g){const out={};for(const spec of classSpecs(g.member?.id)){const paths=SPEC_MECHANICS[spec]?.paths;if(!paths)continue;pathCounts(g,spec).forEach((n,p)=>{const d=paths[p];if(!d)return;for(const [lvl,key] of [[PATH_BONUS_AT[0],'bonus4'],[PATH_BONUS_AT[1],'bonus7']])if(n>=lvl)for(const [k,v] of Object.entries(d[key]||{}))out[k]=typeof v==='number'?(out[k]||0)+v:v;});}return out;}
export function talentEffects(g){const state=g.rpg?.talents;if(!state)return {};const out={};for(const id of state.learned){const t=BY_ID.get(id);if(t)for(const [k,v] of Object.entries(effectsAt(t,talentRank(state,id))))out[k]=typeof v==='number'?(out[k]||0)+v:v;}for(const [k,v] of Object.entries(pathEffects(g)))out[k]=typeof v==='number'?(out[k]||0)+v:v;return out;}
export const specUnlocked=g=>g.player.level>=BALANCE.player.specLevel;
export const canLearnTalent=(g,id)=>{const s=g.rpg.talents,t=BY_ID.get(id);return !!t&&classSpecs(g.member.id).includes(t.spec)&&specUnlocked(g)&&!g.dead&&g.player.inCombat<=0&&talentRank(s,id)<t.maxRank&&spentPoints(s)<talentPoints(g)&&talentPrerequisites(t,s);};
const changed=g=>{g.refreshStats();g.emit('rpgChanged');g.emit('save');};
export function learnTalent(g,id){if(!canLearnTalent(g,id))return false;const state=g.rpg.talents,t=BY_ID.get(id),rank=talentRank(state,id);state.ranks||={};if(!rank)state.learned.push(id);state.ranks[id]=rank+1;if(!rank)g.learnTalentSkill(t.grants);changed(g);return true;}
export function changeSpec(g,spec){if(!classSpecs(g.member.id).includes(spec))return false;if(!specUnlocked(g)){g.toast('Spezialisierungen gibt es ab Stufe '+BALANCE.player.specLevel+'. Deine Talentpunkte werden bis dahin gespart.');return false;}
 const first=!g.rpg.talents?.spec;
 if(g.dead||g.player.inCombat>0||(!first&&Math.hypot(g.player.x-g.world.spawn.x,g.player.y-g.world.spawn.y)>150)){g.toast(first?'Spezialisierung außerhalb des Kampfes wählen.':'Eigene Spezialisierung am Clan-Treff wählen, außerhalb des Kampfes.');return false;}g.rpg.talents.spec=spec;g.rpg.talentBuilds[g.member.id]=g.rpg.talents;g.resetClassState();changed(g);g.toast(SPECS[spec].name+' ist jetzt dein Hauptbaum.');return true;
}
export function resetTalents(g){if(g.dead||g.player.inCombat>0||Math.hypot(g.player.x-g.world.spawn.x,g.player.y-g.world.spawn.y)>150){g.toast('Talente am Clan-Treff zurücksetzen, außerhalb des Kampfes.');return false;}Object.assign(g.rpg.talents,{learned:[],ranks:{}});delete g.rpg.talents.refundedPoints;changed(g);return true;}
export const effectText=effects=>Object.entries(effects).map(([k,v])=>k+': '+v).join(' · ');
function refundedState(state,id){const rank=talentRank(state,id);return {...state,learned:rank===1?state.learned.filter(x=>x!==id):[...state.learned],ranks:{...state.ranks,[id]:rank-1}};}
export function canUnlearnTalent(g,id){if(g.dead||g.player.inCombat>0||!talentRank(g.rpg.talents,id))return false;const next=refundedState(g.rpg.talents,id);return next.learned.every(x=>talentPrerequisites(BY_ID.get(x),next));}
export function unlearnTalent(g,id){if(!canUnlearnTalent(g,id))return false;const state=g.rpg.talents,next=refundedState(state,id);if(!next.ranks[id])delete next.ranks[id];Object.assign(state,next);changed(g);return true;}
/** Rank-one fixture build, preferring a path before filling other paths. */
export function pathBuild(spec,path=0,points=TALENT_POINT_CAP){const tree=[...(TALENTS[spec]||[])].sort((a,b)=>(a.path===path?0:1)-(b.path===path?0:1)||a.tier-b.tier||a.row-b.row),out=[];while(out.length<points){const t=tree.find(t=>!out.includes(t.id)&&talentPrerequisites(t,out));if(!t)break;out.push(t.id);}return out;}
