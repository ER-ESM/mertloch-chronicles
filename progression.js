export const XP_PER_LEVEL=140;
export const xpToNext=level=>Math.max(1,level)*XP_PER_LEVEL;
export const totalXpForLevel=level=>XP_PER_LEVEL*(level-1)*level/2;
export const LESSONS={strike:1,dash:1,buff:2,throw:3,parry:4,interrupt:4,mark:5,burst:6,heal:8,ground:9};
const classLevels={dieter:LESSONS,baerbel:{...LESSONS,heal:2,buff:3,throw:8,parry:7},kevin:{...LESSONS,throw:2,buff:3,parry:7}};
export const skillLevel=(game,id)=>(classLevels[game.member?.id||game.classId]||LESSONS)[id]??Infinity;
export function available(game,id){const skill=game.skills?.find(s=>s.id===id);if(skill?.talent)return game.rpg?.talents?.learned.includes(skill.talent)||false;return game.player.level>=skillLevel(game,id);}
export function nextLesson(game){return Object.entries(classLevels[game.member?.id]||LESSONS).sort((a,b)=>a[1]-b[1]).find(([id])=>!available(game,id));}
export function buffSkill(id){const common={id:'buff',cd:28,cost:15,duration:10,color:'#aed7aa',bg:'#426c60',icon:'shield'};return {...common,...{
 dieter:{name:'Dosenmut',reduction:.25,text:'10 Sekunden weniger Schaden. Der Türsteher baut zusätzlich Deckung auf.'},
 baerbel:{name:'Heilsamer Refrain',hot:12,text:'10 Sekunden Nachklang: heilt jede Sekunde. Ein Refrain, der den Kater rausbrüllt.'},
 kevin:{name:'Isolierband hält',shield:130,text:'Ein Schutzpolster absorbiert Schaden. Bastelgrips und Handschrift verstärken den Schild.'}
 }[id]};}
export function lessonPanel(game){const unread=game.skills.slice().sort((a,b)=>skillLevel(game,a.id)-skillLevel(game,b.id)).find(s=>available(game,s.id)&&!game.seenSkills.has(s.id)),next=nextLesson(game),nextSkill=next&&game.skills.find(s=>s.id===next[0]);return {unread,next,nextSkill,title:unread?'Neu gelernt · '+unread.name:'Dein nächster Kniff',description:nextSkill?nextSkill.name+' auf Stufe '+next[1]+'. Kills und Aufträge bringen Stufen-EP.':'Grundausbildung fertig. Weitere Kniffe kommen aus deinen Talenten.',progress:game.player.xp/xpToNext(game.player.level)*100};}
