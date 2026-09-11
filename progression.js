export const LESSONS={strike:0,dash:0,buff:40,throw:60,parry:90,mark:160,burst:230,interrupt:120,ground:280,heal:400};
export function available(game,id){return game.trainingXp>=(LESSONS[id]??Infinity);}
export function nextLesson(game){return Object.entries(LESSONS).sort((a,b)=>a[1]-b[1]).find(([id])=>!available(game,id));}
export function buffSkill(id){const common={id:'buff',key:'5',cd:28,cost:15,color:'#aed7aa',bg:'#426c60',icon:'shield',duration:10};return {...common,...{
 dieter:{name:'Dosenmut',reduction:.25,text:'10 s lang 25 % weniger eingehender Schaden. Vor einer Prügelei benutzen. „Ich spüre meine Entscheidungen nicht mehr.“'},
 baerbel:{name:'Auf elf drehen',power:1.25,text:'10 s lang +25 % Schaden. Erst aufdrehen, dann Bass abfeuern. Der Buff gilt auch für Markierungen und Flächenschaden.'},
 kevin:{name:'Isolierband hält',shield:130,text:'Ein Schutzpolster absorbiert insgesamt 130 Schaden und hält höchstens 10 s. Sichtbar unter deinen Lebenspunkten. „Das zählt als Versicherung.“'}
 }[id]};}
export function lessonPanel(game){
 const unread=[...game.skills].sort((a,b)=>LESSONS[a.id]-LESSONS[b.id]).find(s=>available(game,s.id)&&!game.seenSkills.has(s.id));const next=nextLesson(game),nextSkill=next&&game.skills.find(s=>s.id===next[0]);
 return {unread,next,nextSkill,title:unread?'Neu gelernt · '+unread.name:'Dein nächster Kniff',description:unread?`[${unread.key}] ${unread.text}`:nextSkill?`${nextSkill.name} in ${Math.ceil(next[1]-game.trainingXp)} Clan-EP. Erfahrung gibt es durch Erkundung, Aufträge und Kämpfe.`:'Alle Kniffe gelernt. Jetzt entscheidet dein Timing.',progress:next?Math.min(100,game.trainingXp/next[1]*100):100};
}
