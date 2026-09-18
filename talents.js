// Talentlogik (lernen, Spezialisierung wechseln, Effekte summieren). Daten: content/talents.js + content/talents/<klasse>.js.
// E-32: 10 Reihen × 3 Pfade je Spezialisierung, je Reihe genau ein Talent; Pfadtreue (4/7 Talente eines Pfades) gibt Pfadboni
// aus content/mechanics.js. Speicherschlüssel <spec>-<index>.
import {CLASS_SPECS,SPECS,TALENT_ROWS,TALENT_CELLS,talentGraph,SPEC_MECHANICS,PATH_BONUS_AT,TALENT_ROWS_PER_SPEC} from './content/index.js';
export {CLASS_SPECS,SPECS,PATH_BONUS_AT};
export const TALENTS=Object.fromEntries(Object.entries(TALENT_ROWS).map(([spec,list])=>{const graph=talentGraph(TALENT_CELLS[spec]);return [spec,list.map((t,i)=>({...t,...graph[i],id:spec+'-'+i,spec,icon:spec+'-'+i,tier:graph[i].row===0?0:graph[i].row===TALENT_ROWS_PER_SPEC-1?4:Math.min(3,Math.ceil(graph[i].row/3)),maxRank:1,parents:[]}))];}));
const BY_ID=new Map(Object.values(TALENTS).flat().map(t=>[t.id,t]));
export const talentById=id=>BY_ID.get(id)||null;
/** Reihe n verlangt n verteilte Punkte; je Reihe nur ein Talent. */
export const talentPrerequisites=(t,learned)=>learned.length>=t.spent&&learned.length>=t.row&&!learned.some(id=>id!==t.id&&BY_ID.get(id)?.row===t.row&&BY_ID.get(id)?.spec===t.spec);
export const classSpecs=id=>CLASS_SPECS[id]||CLASS_SPECS.dieter;
export function talentState(raw,classId='dieter'){const spec=classSpecs(classId).includes(raw?.spec)?raw.spec:classSpecs(classId)[0],learned=[];const pending=new Set((Array.isArray(raw?.learned)?raw.learned:[]).slice(0,30));const order=TALENTS[spec].slice().sort((a,b)=>a.row-b.row);for(let pass=0;pass<12;pass++)for(const t of order)if(pending.has(t.id)&&!learned.includes(t.id)&&talentPrerequisites(t,learned))learned.push(t.id);return {spec,learned};}
export const talentPoints=g=>Math.min(TALENT_ROWS_PER_SPEC,Math.max(0,g.player.level-1));
/** Zahl der gelernten Talente je Pfad (0–2) im aktuellen Baum. */
export function pathCounts(g){const state=g.rpg?.talents;const out=[0,0,0];if(!state||!TALENTS[state.spec])return out;for(const id of state.learned){const t=BY_ID.get(id);if(t)out[t.path]++;}return out;}
/** Pfadboni: bonus4 ab 4, bonus7 ab 7 Talenten desselben Pfades (content/mechanics.js paths). */
export function pathEffects(g){const spec=g.rpg?.talents?.spec,paths=SPEC_MECHANICS[spec]?.paths;if(!paths)return {};const counts=pathCounts(g),out={};counts.forEach((n,p)=>{const d=paths[p];if(!d)return;for(const [lvl,key] of [[PATH_BONUS_AT[0],'bonus4'],[PATH_BONUS_AT[1],'bonus7']])if(n>=lvl)for(const [k,v] of Object.entries(d[key]||{}))out[k]=typeof v==='number'?(out[k]||0)+v:v;});return out;}
export function talentEffects(g){const state=g.rpg?.talents;if(!state||!TALENTS[state.spec])return {};const out=TALENTS[state.spec].filter(t=>state.learned.includes(t.id)).reduce((out,t)=>{for(const [k,v] of Object.entries(t.effects))out[k]=typeof v==='number'?(out[k]||0)+v:v;return out;},{});for(const [k,v] of Object.entries(pathEffects(g)))out[k]=typeof v==='number'?(out[k]||0)+v:v;return out;}
export function learnTalent(g,id){const state=g.rpg.talents,t=TALENTS[state.spec].find(t=>t.id===id);if(g.dead||g.player.inCombat>0||!t||state.learned.includes(id)||state.learned.length>=talentPoints(g))return false;if(!talentPrerequisites(t,state.learned))return false;state.learned.push(id);g.refreshStats();g.learnTalentSkill(t.grants);g.emit('rpgChanged');g.emit('save');return true;}
export function changeSpec(g,spec){if(!classSpecs(g.member.id).includes(spec)||g.dead||g.player.inCombat>0||Math.hypot(g.player.x-g.world.spawn.x,g.player.y-g.world.spawn.y)>150){g.toast('Eigene Spezialisierung am Clan-Treff wählen, außerhalb des Kampfes.');return false;}g.rpg.talents={spec,learned:[]};g.rpg.talentBuilds[g.member.id]=g.rpg.talents;g.resetClassState();g.refreshStats();g.emit('rpgChanged');g.emit('save');g.toast(SPECS[spec].name+' · Punkte neu verteilen.');return true;}
export const effectText=effects=>Object.entries(effects).map(([k,v])=>k+': '+v).join(' · ');
export function unlearnTalent(g,id){const state=g.rpg.talents;if(g.dead||g.player.inCombat>0||!state.learned.includes(id))return false;const learned=state.learned.filter(x=>x!==id),valid=talentState({...state,learned},g.member.id);if(valid.learned.length!==learned.length)return false;state.learned=valid.learned;g.refreshStats();g.emit('rpgChanged');g.emit('save');return true;}
/** Ein vollständiger Build entlang eines Pfades (Tests, Vorschau): je Reihe das Talent des Pfades, sonst das erste der Reihe. */
export function pathBuild(spec,path=0){const rows=new Map();for(const t of TALENTS[spec]||[]){const cur=rows.get(t.row);if(!cur||(t.path===path&&cur.path!==path))rows.set(t.row,t);}return [...rows.entries()].sort((a,b)=>a[0]-b[0]).map(([,t])=>t.id);}
