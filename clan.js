import {mentorSpots} from './world-layout.js';
// Figuren, Fähigkeitssätze und Geschichte der Welt. Alle Inhalte kommen aus content/; hier wird nur zusammengesetzt.
import {TALENTS,classSpecs} from './talents.js';
import {buffSkill} from './progression.js';
import {CLAN_MEMBERS,ALL_MEMBERS,BASE_SKILLS,KITS,THROW_SKILL,GROUND_SKILL,TALENT_SKILLS,STORY,NPCS,AUTO_ATTACK,AUTO_KITS,pickTemplates,questReward,classBuffsFor,CLASS_BUFF_SKILL,RESOURCE_SKILLS} from './content/index.js';
/** Mentoren an der Bude: die Clanmitglieder aus npcs.js (member:true). Ihre Klamotten sind die Klassenwahl. */
export const MENTOR_IDS=Object.keys(NPCS).filter(id=>NPCS[id].member);
export {CLAN_MEMBERS,STORY};
export function member(id){return CLAN_MEMBERS.find(m=>m.id===id)||CLAN_MEMBERS[0];}
/** E-72: Kniffe der Klassenressource (Zeche prellen, Pfandautomat, Ass im Ärmel). */
const resourceSkills=cls=>Object.entries(RESOURCE_SKILLS).filter(([,d])=>d.cls===cls).map(([id,d])=>({id,name:d.name,text:d.text,use:d.use,flavor:d.flavor,info:d.info,icon:id,cd:d.cd,cost:d.cost||0,color:d.color,bg:d.bg,offGcd:!!d.offGcd,mobile:!!d.mobile,...(d.spec?{resourceSpec:d.spec}:{})}));
/** Klassen-Buffs (content/class-buffs.js) als Kniffe: im Kniffe-Menü, auf die Leiste legbar. icon = eigene ID wie bei Talentkniffen. */
const classBuffSkills=cls=>classBuffsFor(cls).map(b=>({...CLASS_BUFF_SKILL,id:b.id,name:b.name,text:b.text,use:b.use,flavor:b.flavor,info:b.info,icon:b.id,duration:b.duration,effects:{...b.effects},...(b.talent?{talent:b.talent,spec:b.talent.replace(/-\d+$/,'')}:{})}));
function talentSkills(id){return classSpecs(id).flatMap(spec=>TALENTS[spec].filter(t=>t.grants).map(t=>({id:t.grants,...TALENT_SKILLS[t.grants],talent:t.id,spec,icon:t.grants,offGcd:false,color:'#e6c585',bg:'#48644b'})));}
export function skillsFor(id){const cls=member(id).id,kit=KITS[cls],{names:tn,flavor,text:tt,overrides:to={},...throwBase}=THROW_SKILL,{names:gn,overrides:go={},...groundBase}=GROUND_SKILL;return [{...AUTO_ATTACK,...AUTO_KITS[cls]},...BASE_SKILLS.map((s,i)=>({...s,...kit[i],offGcd:['dash','interrupt'].includes(s.id)})),buffSkill(cls),{...throwBase,name:tn[cls],text:flavor[cls]+tt,...to[cls]},{...groundBase,name:gn[cls],...go[cls]},...classBuffSkills(cls),...resourceSkills(cls),...talentSkills(cls)];}
/** Stellt Dieter, Anni und Kevin als ansprechbare Figuren an den Treffpunkt (Bude). Positionen sind begehbar und
 * halten Abstand zu Ida, Heilquelle und untereinander; die Reihenfolge kommt aus npcs.js und ist damit stabil. */
export function placeMentors(world){return mentorSpots(world).map(p=>({...p,classId:p.id,name:NPCS[p.id].name,role:NPCS[p.id].role,type:'mentor'}));}
/** Benennt Ida und bestückt die generierten Nebenquests mit Vorlagen aus content/quests.js (seedabhängig, ohne Wiederholung). */
export function dressStory(world){
  world.npc.name=STORY.giver;
  // Die Helden stehen nicht mehr als Mentoren in der Bude (Nutzerentscheidung 2026-09-23, E-61): Dieter, Anni und Kevin sind die
  // spielbaren Klassen. In der Bude stehen jetzt die Stammgäste Ron, Nyalol und Olli (content/hotspots.js, Anker bude:*).
  world.mentors=[];
  const templates=pickTemplates(world.quests,world.seed);
  for(const [i,q] of world.quests.entries()){const t=templates[i];q.template=t.id;q.giver.npc=t.npc;q.giver.name=NPCS[t.npc].name;q.title=t.title;q.description=t.description(q.location);q.quote=t.quote;q.lines=t.lines;q.reward=questReward(t);if(t.itemName)q.itemName=t.itemName;if(t.enemyName)q.enemyName=t.enemyName;if(q.type==='scout')q.activity=t.activity;}
}
