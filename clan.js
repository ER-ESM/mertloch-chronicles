// Figuren, Fähigkeitssätze und Geschichte der Welt. Alle Inhalte kommen aus content/; hier wird nur zusammengesetzt.
import {TALENTS,classSpecs} from './talents.js';
import {buffSkill} from './progression.js';
import {CLAN_MEMBERS,BASE_SKILLS,KITS,THROW_SKILL,GROUND_SKILL,TALENT_SKILLS,STORY,NPCS,AUTO_ATTACK,AUTO_KITS,pickTemplates,questReward} from './content/index.js';
export {CLAN_MEMBERS,STORY};
export function member(id){return CLAN_MEMBERS.find(m=>m.id===id)||CLAN_MEMBERS[0];}
function talentSkills(id){return classSpecs(id).flatMap(spec=>TALENTS[spec].filter(t=>t.grants).map(t=>({id:t.grants,...TALENT_SKILLS[t.grants],talent:t.id,spec,icon:t.grants,offGcd:false,color:'#e6c585',bg:'#48644b'})));}
export function skillsFor(id){const cls=member(id).id,kit=KITS[cls],{names:tn,flavor,text:tt,...throwBase}=THROW_SKILL,{names:gn,...groundBase}=GROUND_SKILL;return [{...AUTO_ATTACK,...AUTO_KITS[cls]},...BASE_SKILLS.map((s,i)=>({...s,...kit[i],offGcd:['dash','interrupt'].includes(s.id)})),buffSkill(cls),{...throwBase,name:tn[cls],text:flavor[cls]+tt},{...groundBase,name:gn[cls]},...talentSkills(cls)];}
/** Benennt Ida und bestückt die generierten Nebenquests mit Vorlagen aus content/quests.js (seedabhängig, ohne Wiederholung). */
export function dressStory(world){
  world.npc.name=STORY.giver;
  const templates=pickTemplates(world.quests,world.seed);
  for(const [i,q] of world.quests.entries()){const t=templates[i];q.template=t.id;q.giver.npc=t.npc;q.giver.name=NPCS[t.npc].name;q.title=t.title;q.description=t.description(q.location);q.quote=t.quote;q.lines=t.lines;q.reward=questReward(t);if(t.itemName)q.itemName=t.itemName;if(t.enemyName)q.enemyName=t.enemyName;if(q.type==='scout')q.activity=t.activity;}
}
