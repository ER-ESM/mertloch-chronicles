// Talentlogik (lernen, Spezialisierung wechseln, Effekte summieren). Daten: content/talents.js + content/talents/<klasse>.js.
// E-32: 10 Reihen × 3 Pfade je Spezialisierung, je Reihe genau ein Talent; Pfadtreue (4/7 Talente eines Pfades) gibt Pfadboni
// aus content/mechanics.js. Speicherschlüssel <spec>-<index>.
import {MECHANIC_EFFECTS,BALANCE,CLASS_SPECS,SPECS,TALENT_ROWS,TALENT_CELLS,talentGraph,SPEC_MECHANICS,PATH_BONUS_AT,TALENT_ROWS_PER_SPEC} from './content/index.js';
export {CLASS_SPECS,SPECS,PATH_BONUS_AT};
export const TALENTS=Object.fromEntries(Object.entries(TALENT_ROWS).map(([spec,list])=>{const graph=talentGraph(TALENT_CELLS[spec]);return [spec,list.map((t,i)=>({...t,...graph[i],id:spec+'-'+i,spec,icon:spec+'-'+i,tier:graph[i].row===0?0:graph[i].row===TALENT_ROWS_PER_SPEC-1?4:Math.min(3,Math.ceil(graph[i].row/3)),maxRank:1,parents:[]}))];}));
/** Offene Bäume (E-37, Vorbild WoW Classic): Reihe n verlangt n × TIER_POINTS Punkte IM SELBEN Baum; Punkte sind frei über alle drei Bäume der Klasse verteilbar. */
export const TIER_POINTS=1;
for(const tree of Object.values(TALENTS))for(const t of tree){t.spent=t.row*TIER_POINTS;const own=Number.isInteger(t.requires)?tree[t.requires]:null;t.parents=own&&own.row<t.row?[own.id]:[];} // Pfeile setzt der Inhalt bewusst: `requires:<Index im Baum>` (content/talents/<klasse>.js)
const BY_ID=new Map(Object.values(TALENTS).flat().map(t=>[t.id,t]));
export const talentById=id=>BY_ID.get(id)||null;
const MECH_KEYS=new Set(Array.isArray(MECHANIC_EFFECTS)?MECHANIC_EFFECTS:Object.keys(MECHANIC_EFFECTS||{}));
/** Wirkt dieses Talent nur, wenn sein Baum der Hauptbaum ist? (Es dreht an der Kernmechanik des Baums.) */
export const mainTreeOnly=t=>Object.keys(t?.effects||{}).some(k=>MECH_KEYS.has(k));
export const pointsInTree=(learned,spec,except)=>learned.filter(id=>id!==except&&BY_ID.get(id)?.spec===spec).length;
/** Stufen-Tor des eigenen Baums und alle Pfeile (parents) erfüllt. */
export const talentPrerequisites=(t,learned)=>pointsInTree(learned,t.spec,t.id)>=t.spent&&t.parents.every(id=>learned.includes(id));
export const classSpecs=id=>CLASS_SPECS[id]||CLASS_SPECS.dieter;
/** Hauptbaum (spec) bestimmt Kit und Kernmechanik; ohne gespeicherte Wahl gibt es keinen (neue Helden wählen ab specLevel). Gelernt wird quer über alle Bäume der Klasse. */
export function talentState(raw,classId='dieter'){const specs=classSpecs(classId),spec=specs.includes(raw?.spec)?raw.spec:null,learned=[];const pending=new Set((Array.isArray(raw?.learned)?raw.learned:[]).filter(id=>specs.includes(BY_ID.get(id)?.spec)).slice(0,90));for(let pass=0;pass<30;pass++){let grew=false;for(const id of pending)if(!learned.includes(id)&&talentPrerequisites(BY_ID.get(id),learned)){learned.push(id);grew=true;}if(!grew)break;}return {spec,learned};}
/** Punkte je Stufe: bis perLevelUntil einer je Stufe, danach einer alle thenEvery Stufen (Messlauf scripts/spec-sim.mjs: 29 Punkte verdoppeln den Schaden einzelner Bäume, 16 halten ihn im Rahmen). */
export const pointsAtLevel=level=>{const T=BALANCE.player.talentPoints,l=Math.max(1,Math.min(BALANCE.maxLevel,level|0));return Math.min(l,T.perLevelUntil)-1+Math.max(0,Math.floor((l-T.perLevelUntil)/T.thenEvery));};
export const TALENT_POINT_CAP=pointsAtLevel(BALANCE.maxLevel);
export const talentPoints=g=>pointsAtLevel(g.player.level);
/** Zahl der gelernten Talente je Pfad (0–2) im aktuellen Baum. */
export function pathCounts(g,spec=g.rpg?.talents?.spec){const state=g.rpg?.talents;const out=[0,0,0];if(!state||!TALENTS[spec])return out;for(const id of state.learned){const t=BY_ID.get(id);if(t&&t.spec===spec)out[t.path]++;}return out;}
/** Pfadboni: bonus4 ab 4, bonus7 ab 7 Talenten desselben Pfades (content/mechanics.js paths). */
export function pathEffects(g){const out={};for(const spec of classSpecs(g.member?.id)){const paths=SPEC_MECHANICS[spec]?.paths;if(!paths)continue;pathCounts(g,spec).forEach((n,p)=>{const d=paths[p];if(!d)return;for(const [lvl,key] of [[PATH_BONUS_AT[0],'bonus4'],[PATH_BONUS_AT[1],'bonus7']])if(n>=lvl)for(const [k,v] of Object.entries(d[key]||{}))out[k]=typeof v==='number'?(out[k]||0)+v:v;});}return out;}
export function talentEffects(g){const state=g.rpg?.talents;if(!state)return {};const out={};for(const id of state.learned){const t=BY_ID.get(id);if(t)for(const [k,v] of Object.entries(t.effects))out[k]=typeof v==='number'?(out[k]||0)+v:v;}for(const [k,v] of Object.entries(pathEffects(g)))out[k]=typeof v==='number'?(out[k]||0)+v:v;return out;}
export function learnTalent(g,id){const state=g.rpg.talents,t=BY_ID.get(id);if(!t||!classSpecs(g.member.id).includes(t.spec)||!specUnlocked(g)||g.dead||g.player.inCombat>0||state.learned.includes(id)||state.learned.length>=talentPoints(g))return false;if(!talentPrerequisites(t,state.learned))return false;state.learned.push(id);g.refreshStats();g.learnTalentSkill(t.grants);g.emit('rpgChanged');g.emit('save');return true;}
export const specUnlocked=g=>g.player.level>=BALANCE.player.specLevel;
export function changeSpec(g,spec){if(!classSpecs(g.member.id).includes(spec))return false;if(!specUnlocked(g)){g.toast('Spezialisierungen gibt es ab Stufe '+BALANCE.player.specLevel+'. Deine Talentpunkte werden bis dahin gespart.');return false;}
 const first=!g.rpg.talents?.spec; // die erste Wahl fällt im Feld und ist überall erlaubt, jeder Wechsel danach nur am Clan-Treff
 if(g.dead||g.player.inCombat>0||(!first&&Math.hypot(g.player.x-g.world.spawn.x,g.player.y-g.world.spawn.y)>150)){g.toast(first?'Spezialisierung außerhalb des Kampfes wählen.':'Eigene Spezialisierung am Clan-Treff wählen, außerhalb des Kampfes.');return false;}g.rpg.talents={spec,learned:[...(g.rpg.talents?.learned||[])]};g.rpg.talentBuilds[g.member.id]=g.rpg.talents;g.resetClassState();g.refreshStats();g.emit('rpgChanged');g.emit('save');g.toast(SPECS[spec].name+' ist jetzt dein Hauptbaum.');return true;}
/** Alle Punkte zurück – nur am Clan-Treff, außerhalb des Kampfes. */
export function resetTalents(g){if(g.dead||g.player.inCombat>0||Math.hypot(g.player.x-g.world.spawn.x,g.player.y-g.world.spawn.y)>150){g.toast('Talente am Clan-Treff zurücksetzen, außerhalb des Kampfes.');return false;}g.rpg.talents.learned=[];g.refreshStats();g.emit('rpgChanged');g.emit('save');return true;}
export const effectText=effects=>Object.entries(effects).map(([k,v])=>k+': '+v).join(' · ');
export function unlearnTalent(g,id){const state=g.rpg.talents;if(g.dead||g.player.inCombat>0||!state.learned.includes(id))return false;const learned=state.learned.filter(x=>x!==id),valid=talentState({...state,learned},g.member.id);if(valid.learned.length!==learned.length)return false;state.learned=valid.learned;g.refreshStats();g.emit('rpgChanged');g.emit('save');return true;}
/** Ein vollständiger Build entlang eines Pfades (Tests, Vorschau): je Reihe das Talent des Pfades, sonst das erste der Reihe. */
/** Lernreihenfolge für einen Pfad: je Reihe das Pfadtalent, davor so viele Nachbarn aus früheren Reihen, dass das Stufen-Tor aufgeht. */
export function pathBuild(spec,path=0,points=TALENT_POINT_CAP){const tree=TALENTS[spec]||[],out=[];for(let r=0;r<TALENT_ROWS_PER_SPEC&&out.length<points;r++){const fill=tree.filter(t=>t.path!==path&&t.row<r&&!out.includes(t.id)).sort((a,b)=>a.row-b.row||a.path-b.path);while(out.length<r*TIER_POINTS&&fill.length&&out.length<points){const t=fill.find(t=>talentPrerequisites(t,out));if(!t)break;fill.splice(fill.indexOf(t),1);out.push(t.id);}const own=tree.find(t=>t.row===r&&t.path===path);if(own&&out.length<points&&talentPrerequisites(own,out))out.push(own.id);}return out;}
