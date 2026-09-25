// Stufen, Lernreihenfolge und Klassenbuff. Zahlen: content/balance.js, content/skills.js.
import {BALANCE,xpToNext,totalXpForLevel,LESSONS,CLASS_LESSONS,BUFF_SKILLS,CLASS_BUFFS,RESOURCE_SKILLS} from './content/index.js';
export const XP_PER_LEVEL=BALANCE.xpPerLevel;
export {xpToNext,totalXpForLevel,LESSONS};
export const skillLevel=(game,id)=>(CLASS_LESSONS[game.member?.id||game.classId]||LESSONS)[id]??CLASS_BUFFS[id]?.level??RESOURCE_SKILLS[id]?.level??Infinity;
export function available(game,id){const skill=game.skills?.find(s=>s.id===id);/* E-72: Ressourcen-Kniff mit Hauptbaum (Ass im Ärmel) */if(skill?.resourceSpec&&game.rpg?.talents?.spec!==skill.resourceSpec)return false;if(skill?.talent)return game.rpg?.talents?.learned.includes(skill.talent)||false;return game.player.level>=skillLevel(game,id);}
export function nextLesson(game){return Object.entries(CLASS_LESSONS[game.member?.id]||LESSONS).sort((a,b)=>a[1]-b[1]).find(([id])=>!available(game,id));}
export function buffSkill(id){return {...BUFF_SKILLS.common,...(BUFF_SKILLS[id]||BUFF_SKILLS.dieter)};}
export function lessonPanel(game){const unread=game.skills.slice().sort((a,b)=>skillLevel(game,a.id)-skillLevel(game,b.id)).find(s=>available(game,s.id)&&!game.seenSkills.has(s.id)),next=nextLesson(game),nextSkill=next&&game.skills.find(s=>s.id===next[0]);return {unread,next,nextSkill,title:unread?'Neu gelernt · '+unread.name:'Dein nächster Kniff',description:nextSkill?nextSkill.name+' auf Stufe '+next[1]+'. Kills und Aufträge bringen Stufen-EP.':'Grundausbildung fertig. Weitere Kniffe kommen aus deinen Talenten.',progress:game.player.xp/xpToNext(game.player.level)*100};}
