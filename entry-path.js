// Einstiegsweg entschärft (Runde 3a, 2026-09-24, Kenner-Befund 3): Der Weg von Ida zum ersten Kapitelziel führte einen frischen
// Helden (Stufe 1, 600 Leben) an zwei bis vier Pfandkeilern (Stufe 2) vorbei, dazu ein Rudel aus drei Keilern direkt am Lager.
// Gemessen (scripts/optimierung-r3a-check.mjs, Stufe 1 gegen Stufe 2): ein Keiler ~10 s und −170 Leben, zwei ~17 s und
// −500 Leben, drei töten den Helden nach ~12 s. Auf der Karte angeklickt, lief die Figur mit Autopilot durch alle hindurch.
// Nur auf diesem Einstiegsweg und nur bis Stufe ENTRY.maxLevel gilt deshalb: Feldgegner (ambient) entlang des Laufwegs
// Ida → Lagerrand → Lager und im Lagerumkreis bemerken den Helden erst auf ENTRY.aggroFactor ihrer Aggro-Reichweite und
// ziehen keine Kumpel nach („Kumpel kommt“). Lagergegner und das übrige Balancing bleiben unverändert.
import {distance,segmentDistance} from './world.js';
import {STORY_CHAPTERS,STORY} from './content/index.js';

export const ENTRY={maxLevel:3,corridor:150,campPad:300,aggroFactor:.4};
const FIRST=STORY_CHAPTERS.find(c=>!c.reserve&&c.act===STORY.act)?.id??1;
/** Laufweg des Einstiegs: Ida → Lagerrand → Lager des ersten Kapitel-Tötungsziels; null, sobald er nicht (mehr) gilt. */
export function entryRoute(g){
 const q=g.quest,p=g.player;
 if(!q?.accepted||q.chapter!==FIRST||q.chapterClaimed>=q.chapter||!(p?.level<=ENTRY.maxLevel)||g.instance)return null;
 const o=(g.objectives?.()||[]).find(o=>o.kind==='kill'),camp=o&&g.campFor?.(o),npc=g.world?.npc;if(!camp||!npc)return null;
 const key=camp.id+':'+Math.round(npc.x)+':'+Math.round(npc.y);if(g.entryRoute?.key===key)return g.entryRoute;
 const via=camp.approach||camp,from=g.world.findClear?.(npc.x,npc.y+30,9)||npc;let path=[];try{path=g.world.findPath?.(from,via)||[];}catch{path=[];}
 const line=[{x:npc.x,y:npc.y},...path,{x:via.x,y:via.y},{x:camp.x,y:camp.y}];
 return g.entryRoute={key,camp,line};
}
/** Abstand eines Punkts zum Einstiegsweg. */
export function entryDistance(r,pt){let d=Infinity;for(let i=1;i<r.line.length;i++)d=Math.min(d,segmentDistance(pt.x,pt.y,r.line[i-1],r.line[i]));return d;}
/** Steht der Feldgegner e am Einstiegsweg? */
export function entryCalm(g,e){
 if(!e?.ambient||e.elite||e.behavior!=='aggressive')return false;
 const r=entryRoute(g);if(!r)return false;
 return distance(e,r.camp)<ENTRY.campPad||entryDistance(r,e.home||e)<ENTRY.corridor||entryDistance(r,e)<ENTRY.corridor;
}
/** Aggro-Reichweite, mit der e den Helden bemerkt. */
export const entryAggroRange=(g,e)=>entryCalm(g,e)?e.aggroRange*ENTRY.aggroFactor:e.aggroRange;
