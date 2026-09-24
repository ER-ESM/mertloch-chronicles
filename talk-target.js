// Rechtsklick auf einen NPC = hinlaufen und reden; F nimmt das gewählte Ziel zuerst (Runde 3a, 2026-09-24, Kenner-Befund 4, WoW).
// Bisher lief die Figur nach Rechtsklick nur hin (bei Ida sogar vorbei) und blieb stumm; F nahm Treppe, Bude oder Schwarzes Brett,
// obwohl ein NPC gewählt war. Jetzt merkt sich der Rechtsklick das Gesprächsziel; sobald die Figur in Gesprächsweite ist, bleibt sie
// stehen und das Gespräch öffnet sich. Eigene Bewegung oder ein anderer Laufbefehl bricht das ab.
import {distance} from './world.js';

/** Figurenarten, mit denen man reden kann, und ihre Gesprächsweite (wie TALK_RANGE/MENTOR_RANGE in engine.js). */
export const TALK_REACH={npc:46,mentor:40,regular:46,questgiver:46};
export const talkable=u=>!!u&&u.kind in TALK_REACH&&!!u.ref;
const keyMoving=g=>!!(g.touchMove?.x||g.touchMove?.y)||['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].some(k=>g.keys?.has(k));
/** In Gesprächsweite? */
export const inTalkReach=(g,u)=>talkable(u)&&distance(g.player,u.ref)<=TALK_REACH[u.kind];
/** Nach Rechtsklick: zum NPC laufen und danach reden. → 'now' (schon nah), 'walk' (läuft) oder null (kein Weg). */
export function walkToTalk(g,u){
 g.talkTo=null;if(!talkable(u))return null;
 if(inTalkReach(g,u))return 'now';
 if(!g.navigate(u.ref))return null;
 g.talkTo={kind:u.kind,ref:u.ref,goal:g.routeGoal};return 'walk';
}
/** Je Bild: angekommen? Dann anhalten und das Gesprächsziel liefern; bei Abbruch still vergessen. → {kind,ref}|null */
export function arrivedToTalk(g){
 const t=g.talkTo;if(!t)return null;
 if(g.dead||keyMoving(g)||g.routeGoal&&g.routeGoal!==t.goal){g.talkTo=null;return null;}
 if(inTalkReach(g,t)){g.talkTo=null;if(g.routeGoal===t.goal){g.moveTo=null;g.path=[];g.routeGoal=null;}return t;}
 if(!g.routeGoal){g.talkTo=null;return null;}
 return null;
}
/** Gewähltes freundliches Ziel, mit dem man gerade reden kann (für F). */
export function focusedTalk(g,unit){return unit&&inTalkReach(g,unit)?unit:null;}
