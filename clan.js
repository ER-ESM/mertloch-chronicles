// Figuren, Fähigkeitssätze und Geschichte der Welt. Alle Inhalte kommen aus content/; hier wird nur zusammengesetzt.
import {TALENTS,classSpecs} from './talents.js';
import {buffSkill} from './progression.js';
import {CLAN_MEMBERS,BASE_SKILLS,KITS,THROW_SKILL,GROUND_SKILL,TALENT_SKILLS,STORY,NPCS,AUTO_ATTACK,AUTO_KITS,pickTemplates,questReward} from './content/index.js';
/** Mentoren an der Bude: die Clanmitglieder aus npcs.js (member:true). Ihre Klamotten sind die Klassenwahl. */
export const MENTOR_IDS=Object.keys(NPCS).filter(id=>NPCS[id].member);
const MENTOR_PLACEMENT=Object.freeze({radius:52,startAngle:-.9,spread:.8,clearance:9,space:26});
export {CLAN_MEMBERS,STORY};
export function member(id){return CLAN_MEMBERS.find(m=>m.id===id)||CLAN_MEMBERS[0];}
function talentSkills(id){return classSpecs(id).flatMap(spec=>TALENTS[spec].filter(t=>t.grants).map(t=>({id:t.grants,...TALENT_SKILLS[t.grants],talent:t.id,spec,icon:t.grants,offGcd:false,color:'#e6c585',bg:'#48644b'})));}
export function skillsFor(id){const cls=member(id).id,kit=KITS[cls],{names:tn,flavor,text:tt,...throwBase}=THROW_SKILL,{names:gn,...groundBase}=GROUND_SKILL;return [{...AUTO_ATTACK,...AUTO_KITS[cls]},...BASE_SKILLS.map((s,i)=>({...s,...kit[i],offGcd:['dash','interrupt'].includes(s.id)})),buffSkill(cls),{...throwBase,name:tn[cls],text:flavor[cls]+tt},{...groundBase,name:gn[cls]},...talentSkills(cls)];}
/** Stellt Dieter, Anni und Kevin als ansprechbare Figuren an den Treffpunkt (Bude). Positionen sind begehbar und
 * halten Abstand zu Ida, Heilquelle und untereinander; die Reihenfolge kommt aus npcs.js und ist damit stabil. */
export function placeMentors(world){
  const P=MENTOR_PLACEMENT,taken=[world.npc,world.shrine].filter(Boolean),out=[];
  for(const [i,id] of MENTOR_IDS.entries()){
    const angle=P.startAngle+i*P.spread;let spot=null;
    for(let ring=0;ring<6&&!spot;ring++){
      const d=P.radius+ring*P.space,p={x:world.spawn.x+Math.cos(angle)*d,y:world.spawn.y+Math.sin(angle)*d};
      if(world.blocked(p.x,p.y,P.clearance)||taken.some(o=>Math.hypot(o.x-p.x,o.y-p.y)<P.space))continue;
      spot=p;
    }
    spot||=world.findClear(world.spawn.x+Math.cos(angle)*P.radius,world.spawn.y+Math.sin(angle)*P.radius,P.clearance);
    const mentor={id,classId:id,name:NPCS[id].name,role:NPCS[id].role,type:'mentor',x:Math.round(spot.x),y:Math.round(spot.y)};
    taken.push(mentor);out.push(mentor);
  }
  return out;
}
/** Benennt Ida und bestückt die generierten Nebenquests mit Vorlagen aus content/quests.js (seedabhängig, ohne Wiederholung). */
export function dressStory(world){
  world.npc.name=STORY.giver;
  world.mentors=placeMentors(world);
  const templates=pickTemplates(world.quests,world.seed);
  for(const [i,q] of world.quests.entries()){const t=templates[i];q.template=t.id;q.giver.npc=t.npc;q.giver.name=NPCS[t.npc].name;q.title=t.title;q.description=t.description(q.location);q.quote=t.quote;q.lines=t.lines;q.reward=questReward(t);if(t.itemName)q.itemName=t.itemName;if(t.enemyName)q.enemyName=t.enemyName;if(q.type==='scout')q.activity=t.activity;}
}
