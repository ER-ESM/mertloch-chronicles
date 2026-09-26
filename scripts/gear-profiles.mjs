// Ausrüstungsprofile für scripts/dungeon-sim.mjs und scripts/playtest-save.mjs (Dungeon-Fix 2, 2026-09-26).
// Anlass: Endabnahme des Prüfers (Build #715, docs/PLAYTEST-2026-09-26-dungeon-endabnahme.md) – die Simulation rechnete nur mit einem
// vollen Satz ungewöhnlich auf Stufe 10 in allen 16 Plätzen; ein echter Held hat den nicht.
//   start   – Startausrüstung (TUTORIAL.starterEquipment): Flasche, Topfdeckel, Schleuder, Clanjacke. Untere Grenze.
//   typical – typische Ausrüstung: was ein Held beim Leveln bis Stufe 10 aus Aufträgen und Beute realistisch trägt, hergeleitet aus
//             content/ (typicalGearStudy, Herleitung im Bericht docs/DUNGEON-FIX2-2026-09-26.md).
//   full    – voller Satz ungewöhnlich auf Stufe 10 in allen 16 Plätzen (bisherige Vorgabe der Simulation, 'uncommon'). Obere Grenze.
import {BALANCE,SPAWN_TABLES,ARCHETYPES,DROP_TABLES,STORY_CHAPTERS,TUTORIAL,itemPoints,killXp} from '../content/index.js';
import {WORLD_RULES} from '../world-rules.js';
import {rollDrop,questChoices,rolledDefinition} from '../itemization.js';
import {pickSpawn} from '../encounters.js';
import {rng} from '../world.js';

/** Ausrüstungsplätze des Helden und welcher gewürfelte Platz dorthin passt (Ringe und Talismane je zweimal wie im Spiel). */
export const HERO_SLOTS=[['weapon','weapon'],['offhand','offhand'],['ranged','ranged'],['head','head'],['neck','neck'],['shoulders','shoulders'],['body','body'],['wrists','wrists'],['hands','hands'],['waist','waist'],['legs','legs'],['feet','feet'],['ring','ring1'],['ring','ring2'],['trinket','trinket1'],['charm','trinket2']];
const SPECS=['tresen','bass','pfand'];

/** Annahmen, die nicht in content/ stehen (Bericht, Abschnitt „Herleitung“): auf welcher Heldenstufe die Aufträge erledigt werden.
 *  Die sechs Nebenaufträge liegen paarweise nah am Treffpunkt, um 1000 und um 1600 Einheiten entfernt (Seed 56753); Kapitel 1 endet mit
 *  Horst (Stufe 4). tierFrom: ab dieser Stufe jagt der Held jenseits von SPAWN_TABLES.tierDistance (Tier-1-Arten). */
export const LEVELING={questLevels:[2,2,5,5,8,8],mainLevel:5,horstLevel:5,tierFrom:4,runs:400,seed:20260926};

/** Ein Leveldurchgang 1 → target: Aufträge, Kapitel 1 und Feldzüge nach den Spawn-Tabellen, Beute mit rollDrop wie im Spiel.
 *  Liefert je Heldenplatz das beste Teil (nach Wertpunkten) als Rohdaten {slot,level,quality}. */
function levelRun(seed,{target=10,ranged=false}={}){
 const random=rng(seed),registry={},rpg={itemSequence:0,generated:{},rewardChoices:{}},g={rpg,world:{seed:WORLD_RULES.seed},player:{level:1},lootRandom:random,baseEffects:()=>({})},got=[];
 const take=id=>{const d=registry[id];if(d?.slot)got.push({slot:d.slot,level:d.level,quality:d.rarity});};
 const quests=WORLD_RULES.quests?.count??6,questXp=Array.from({length:quests},(_,n)=>BALANCE.xp.quest[['gather','scout','hunt'][n%3]]??180);
 for(let level=1;level<target;level++){g.player.level=level;let need=BALANCE.xpPerLevel*level;
  // Nebenaufträge: je Auftrag drei Vorschläge (itemization.questChoices), der Held nimmt den passenden Waffenplatz bzw. das eine Teil
  LEVELING.questLevels.forEach((at,n)=>{if(at!==level||n>=quests)return;const ids=questChoices(g,'56753-quest-'+n,registry);const pick=ids.length===3&&registry[ids[0]].slot==='offhand'?ids[ranged?2:1]:ids[0];take(pick);need-=questXp[n];});
  if(level===LEVELING.mainLevel){const ids=questChoices(g,'main',registry,STORY_CHAPTERS[0].reward.gear);take(ids[0]);need-=STORY_CHAPTERS[0].reward.xp;}
  if(level===LEVELING.horstLevel){for(const it of rollDrop(g,{family:'horst',level:4,type:'boss'},registry).items)take(it.id);need-=BALANCE.xp.kill.boss;}
  // Feldzüge bis zur nächsten Stufe: aggressiv oder neutral wie das Umland (SPAWN_TABLES.aggressiveChance), Art nach Gewicht
  while(need>0){const aggressive=random()<SPAWN_TABLES.aggressiveChance,kind=pickSpawn(aggressive?SPAWN_TABLES.aggressive:SPAWN_TABLES.neutral,random,level>=LEVELING.tierFrom),def=ARCHETYPES[kind];
   const e={...def,level:Math.max(def.level||1,level-(BALANCE.enemies.playerLead??2))};need-=killXp(e);for(const it of rollDrop(g,e,registry).items)take(it.id);}
 }
 // Anlegen: je Platz das Teil mit den meisten Wertpunkten; Ringe und Talismane füllen je zwei Plätze
 const worth=it=>itemPoints(it.level,it.quality),best={};
 for(const [slot,target2] of HERO_SLOTS){const pool=got.filter(it=>it.slot===slot&&!Object.values(best).includes(it)).sort((a,b)=>worth(b)-worth(a));if(pool[0])best[target2]=pool[0];}
 return best;
}

/** Herleitung der typischen Ausrüstung: LEVELING.runs Leveldurchgänge; je Platz Anteil gefüllt, Median der Stufe, Anteil selten.
 *  Das Profil nimmt einen Platz, wenn er in mindestens der Hälfte der Durchgänge gefüllt ist, dazu so viele der übrigen Plätze, wie
 *  im Mittel gefüllt sind (Durchschnittsheld statt Bestfall). */
export function typicalGearStudy({target=10,ranged=false,runs=LEVELING.runs}={}){
 const rows=Array.from({length:runs},(_,i)=>levelRun(LEVELING.seed+i*7919,{target,ranged})),out=[];
 for(const [,slot] of HERO_SLOTS){const items=rows.map(r=>r[slot]).filter(Boolean),filled=items.length/runs,levels=items.map(i=>i.level).sort((a,b)=>a-b),median=levels.length?levels[Math.floor(levels.length/2)]:0,rare=items.length?items.filter(i=>i.quality!=='uncommon').length/items.length:0;
  out.push({slot,filled:+filled.toFixed(2),level:median,rare:+rare.toFixed(2),take:filled>=.5,quality:rare>=.5?'rare':'uncommon'});}
 // Seltene Plätze (Zufallsbeute, je unter der Hälfte gefüllt): so viele, wie ein Held im Mittel davon trägt, die häufigsten zuerst
 const rest=out.filter(r=>!r.take&&r.level>0).sort((a,b)=>b.filled-a.filled),extra=Math.round(rest.reduce((n,r)=>n+r.filled,0));
 for(const r of rest.slice(0,extra)){r.take=true;r.extra=true;}
 return out;
}
const studyCache=new Map();
/** Rohdaten der Teile eines Profils: [{slot (gewürfelter Platz), target (Heldenplatz), spec, level, quality, roll}] – oder für 'start' die
 *  Katalog-IDs der Startausrüstung. ranged: der Autoangriff der Klasse nutzt die Fernwaffe (Waffenwahl beim Auftrag). */
export function gearProfile(name,{ranged=false,level=10}={}){
 if(name==='start'||name==='none')return {starter:{...TUTORIAL.starterEquipment},rolls:[]};
 if(name==='full'||name==='uncommon')return {starter:{},rolls:HERO_SLOTS.map(([slot,target],i)=>({slot,target,spec:SPECS[i%3],level,quality:'uncommon',roll:i===0?50:target==='ring2'?501:500,family:'boar'}))/* wie equipSet der Simulation */};
 if(name!=='typical')throw Error('Unbekanntes Ausrüstungsprofil: '+name);
 const key=ranged+'|'+level;if(!studyCache.has(key))studyCache.set(key,typicalGearStudy({target:level,ranged}));
 const study=studyCache.get(key),rolls=[],starter={...TUTORIAL.starterEquipment};
 // Gewürfelte Teile tragen eine zufällige Ausrichtung (Beute) – wie im vollen Satz reihum; Auftragsteile hätte der Held passend gewählt,
 // das bleibt hier bewusst unberücksichtigt (eher zu schwach als zu stark).
 study.forEach((row,i)=>{if(!row.take)return;const slot=HERO_SLOTS.find(([,t])=>t===row.slot)[0];rolls.push({slot,target:row.slot,spec:SPECS[i%3],level:row.level,quality:row.quality,roll:500,family:'quest'});delete starter[row.slot];});
 return {starter,rolls,study};
}
/** Legt ein Profil im laufenden Spiel an (Simulation). equip(g,id,slot) und add(rpg,id) aus rpg.js, register aus itemization.js. */
export function applyGearProfile(g,name,{ITEMS,addItem,equipItem,registerRoll},opts={}){
 const ranged=opts.ranged??(g.skills?.find(s=>s.id==='auto')?.weaponSource==='ranged');
 g.rpg.inventory=[];for(const k of Object.keys(g.rpg.equipment))g.rpg.equipment[k]=null;
 const p=gearProfile(name,{ranged,level:opts.level??10});
 for(const [slot,id] of Object.entries(p.starter)){addItem(g.rpg,id);equipItem(g,id,slot);}
 for(const r of p.rolls){const id=registerRoll(g.rpg,ITEMS,{slot:r.slot,spec:r.spec,level:r.level,quality:r.quality,roll:r.roll,family:r.family||'quest'});addItem(g.rpg,id);equipItem(g,id,r.target);}
 return p;
}
export {rolledDefinition};
