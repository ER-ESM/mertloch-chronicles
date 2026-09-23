// Prüfungen der Rolle Balancing (balance.js, tuning.js, BALANCE-REPORT.md).
import {BALANCE,xpToNext,totalXpForLevel} from '../balance.js';
import {TUNING} from '../tuning.js';
import {SPEC_MECHANICS} from '../mechanics.js';
import {ARCHETYPES,ELITES,CAMP_ENEMIES,BOSSES,CAST_SETS} from '../enemies.js';
import {ITEM_CATALOG} from '../items.js';
import {KITS} from '../skills.js';
import {CLASS_BUFFS} from '../class-buffs.js';
import {STORY_CHAPTERS} from '../story.js';
const NUMERIC=v=>typeof v==='number'||(v&&typeof v==='object'&&Object.values(v).every(x=>typeof x==='number'));
const ELITE_FACTOR=[1.1,1.6];   // Korridor für den Schadensfaktor einer Elite (README: „Elite doppelt so lang, sichtbarer Lebensverlust“)
export function check(bad){
 // Tuning: nur bekannte IDs, nur Zahlen, jede Korrektur mit Begründung und Datum.
 const known={enemies:{...ARCHETYPES,...ELITES,...CAMP_ENEMIES,...BOSSES},items:ITEM_CATALOG,skills:KITS,mechanics:SPEC_MECHANICS,classBuffs:CLASS_BUFFS};const DEEP=v=>typeof v==='number'||(v&&typeof v==='object'&&Object.values(v).every(DEEP));
 for(const [group,rows] of Object.entries(TUNING)){for(const [id,patch] of Object.entries(rows)){const w='tuning '+group+'/'+id;if(group==='casts'?!CAST_SETS[id]:!known[group]?.[id])bad(w,'ID unbekannt');if(!patch.why||!patch.since)bad(w,'why und since sind Pflicht');for(const [k,v] of Object.entries(patch)){if(['why','since'].includes(k))continue;if(group==='casts'||group==='skills'){if(!v||typeof v!=='object')bad(w,k+' muss ein Objekt je Zauber/Kniff sein');else for(const [kk,vv] of Object.entries(v))if(kk!=='why'&&kk!=='since'&&!NUMERIC(vv))bad(w,k+'.'+kk+' ist keine Zahl');}else if(group==='mechanics'||group==='classBuffs'){if(!DEEP(v))bad(w,k+' ist keine Zahl');}else if(k==='respawn'?!(Array.isArray(v)&&v.length===2):!NUMERIC(v))bad(w,k+' ist keine Zahl');}}}
 // EP-Kurve: Bedarf je Stufe und Gesamtbedarf müssen streng steigen – sonst fühlt sich eine Stufe wie ein Rückschritt an.
 if(!(BALANCE.xp.quest.main>0))bad('xp','quest.main fehlt');
 for(let l=1;l<BALANCE.maxLevel;l++){
  if(!(xpToNext(l+1)>xpToNext(l)))bad('xp-kurve','Stufe '+(l+1)+' verlangt nicht mehr EP als Stufe '+l+' ('+xpToNext(l+1)+' ≤ '+xpToNext(l)+')');
  if(!(totalXpForLevel(l+1)>totalXpForLevel(l)))bad('xp-kurve','Gesamt-EP bis Stufe '+(l+1)+' steigen nicht');
 }
 // Kill-EP: je gefährlicher der Gegner, desto mehr EP.
 const kill=BALANCE.xp.kill;
 if(!(kill.creature<kill.human&&kill.human<kill.elite&&kill.elite<kill.boss))bad('xp-kurve','kill-EP steigen nicht von Tier über Mensch und Elite zum Boss');
 // Kapitelbelohnungen wachsen mit dem Kapitel – je Akt getrennt, weil jeder Akt bei kleineren Zahlen neu anfängt.
 // STORY_CHAPTERS gehört der Rolle Story und wird hier nur gelesen.
 const acts=new Map();
 for(const c of STORY_CHAPTERS)if(c.reward){if(!acts.has(c.act))acts.set(c.act,[]);acts.get(c.act).push(c);}
 for(const [act,chapters] of acts){
  chapters.sort((a,b)=>a.id-b.id);
  for(let i=1;i<chapters.length;i++){const prev=chapters[i-1],cur=chapters[i],w='kapitelbelohnung Akt '+act;
   if(!(cur.reward.xp>prev.reward.xp))bad(w,'Kapitel '+cur.id+' gibt nicht mehr EP als Kapitel '+prev.id+' ('+cur.reward.xp+' ≤ '+prev.reward.xp+')');
   if(!(cur.reward.coins>prev.reward.coins))bad(w,'Kapitel '+cur.id+' gibt nicht mehr Münzen als Kapitel '+prev.id+' ('+cur.reward.coins+' ≤ '+prev.reward.coins+')');
  }
 }
 // Elite-Faktor: spürbar härter, aber kein zweiter Boss.
 const [lo,hi]=ELITE_FACTOR;
 const inRange=(v,w,what)=>{if(typeof v!=='number'||!(v>=lo&&v<=hi))bad(w,what+' muss zwischen '+lo+' und '+hi+' liegen, ist '+v);};
 inRange(BALANCE.enemies.eliteDamage,'elite','enemies.eliteDamage');
 for(const [id,def] of Object.entries(ELITES))if(def.damage!==undefined)inRange(def.damage,'elite/'+id,'damage');
}
