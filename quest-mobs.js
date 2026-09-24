// Auftragsgegner erkennbar und zählbar (Runde 3a, 2026-09-24, Kenner-Befund 6, WoW-Vorbild):
// - Wer für einen laufenden Auftrag zählt, trägt am Namensschild und im Zielrahmen ein kleines Auftragszeichen.
// - Kapitelziel „Pfandkeiler von den Trümmern jagen“: Gezählt wurden nur die drei Lagergegner („Grillplatz-Plünderer“), nicht die
//   gleichartigen Pfandkeiler, die im selben Gebiet herumlaufen und angreifen. Jetzt zählt im Zielgebiet (QUEST_AREA um das Lager)
//   jeder Gegner derselben Art; außerhalb zählen nur die Lagergegner selbst. Das Zielgebiet steht als Fläche auf Karte und Minikarte.
import {distance} from './world.js';
import {ARCHETYPES,CAMP_ENEMIES,TUTORIAL} from './content/index.js';
import {speciesOf,hotspotQuest,questProgress,giverOffers} from './hotspots.js';

/** Halbmesser des Zielgebiets um ein Kapitel-Lager (Welteinheiten, 8 = 1 m). Reicht bis über den Lagerrand (camp.approach). */
export const QUEST_AREA=330;
/** Art (family) der Gegner eines Lagers. */
export function campFamily(c){return c?.archetype?ARCHETYPES[c.archetype]?.family:CAMP_ENEMIES[c?.type]?.family;}
/** Zählt Gegner e für das Kapitelziel o? */
export function chapterCredit(g,e,o,camp=g.campFor?.(o)){
 if(!o||!e)return false;
 if(o.kind==='boss')return !e.ambient&&e.type==='boss'&&(!e.bossId||e.bossId===o.boss);
 if(o.kind!=='kill')return false;
 if(!(o.type?e.type===o.type:e.family===o.family))return false;
 if(!e.ambient)return true;
 return !!camp&&e.family===campFamily(camp)&&distance(e,camp)<=QUEST_AREA;
}
/** Offenes Kapitelziel, für das e zählt (Index) oder -1. */
export function chapterObjectiveFor(g,e){
 const q=g.quest;if(!q?.accepted||q.chapterClaimed>=q.chapter||e.questId||e.worldBoss||e.dungeon||e.arena||e.tutorial)return -1;
 const list=g.objectives?.()||[];
 for(let i=0;i<list.length;i++){const p=g.objectiveProgress(i);if(p&&!p.complete&&chapterCredit(g,e,list[i]))return i;}
 return -1;
}
/** Zählt e gerade für irgendeinen laufenden Auftrag (Kapitel, Nebenauftrag, Treffpunkt-Auftrag)? */
export function questMob(g,e){
 if(!e||!(e.hp>0))return false;
 if(chapterObjectiveFor(g,e)>=0)return true;
 const sq=e.questId&&g.sideQuests?.[e.questId];if(sq?.accepted&&!sq.claimed){const def=g.world.quests?.find(q=>q.id===e.questId);if(def&&sq.progress<def.required)return true;}
 if(g.hotspots&&!e.arena&&!e.tutorial){const kind=speciesOf(e);for(const [id,s] of Object.entries(g.hotspots.quests||{})){if(!s.accepted||s.claimed)continue;const o=hotspotQuest(id)?.objective;if(o&&o.species===kind&&questProgress(g,id)<o.count)return true;}}
 return false;
}
/** Zielgebiete der laufenden Kapitel-Tötungsziele für Karte und Minikarte: [{x,y,r,label}]. */
export function chapterAreas(g){
 const q=g.quest;if(!q?.accepted||q.chapterClaimed>=q.chapter)return [];
 return (g.objectives?.()||[]).map((o,i)=>{const pr=g.objectiveProgress(i);if(o.kind!=='kill'||pr?.complete)return null;const c=g.campFor(o);/* done/need: Fortschritt für den Tooltip der Weltkarte (Runde 4a) */return c?{x:c.x,y:c.y,r:QUEST_AREA,label:o.label,done:pr?.done??0,need:pr?.need??o.count??0}:null;}).filter(Boolean);
}
/** Zeichen über Ida (Runde 3a, Kenner-Befund 7, WoW): „?“, sobald bei ihr etwas abzugeben ist – Kapitel fertig, Hofprobe zurück
 *  bei Ida oder ein Treffpunkt-Auftrag mit Abgabe bei ihr; „…“ solange ein Auftrag läuft; „!“ nur für einen neuen Auftrag. */
export function idaMark(g){
 const t=g.tutorial;if(t&&!t.completed){const back=TUTORIAL.steps.findIndex(s=>s.id==='return');return t.step===0?'!':t.step>=back?'?':'…';}
 const claim=giverOffers(g,'ida').some(o=>o.action==='claim');
 if(claim||!g.quest.actDone&&g.questReady())return '?';
 if(g.quest.actDone)return null;
 return g.quest.accepted?'…':'!';
}
