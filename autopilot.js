// Autopilot stoppt beim ersten Treffer (Runde 3a, 2026-09-24, Kenner-Befund 1, WoW-Vorbild): Jeder Laufweg aus game.navigate
// (Klick auf den Auftragskasten, Karte „Weg einschlagen“, Minikarte, Rechtsklick auf den Boden) hält an, sobald ein Gegner den
// Helden neu angreift – beim Aggro, beim Kettenzug („Kumpel kommt“) oder beim ersten Treffer. Gegner, die schon beim Losgehen
// im Kampf waren, zählen nicht: Wer aus einem Kampf wegläuft, wird von seinen Verfolgern nicht festgehalten.
// Der Lauf zum Gegner nach Rechtsklick (attack-approach.js) ist kein Autopilot, er ist ein Angriff.
//
// 2026-09-25 (Playtest Dungeon 2, Stufe-9-Held mit vier Söldnern): Der Laufweg hielt an, sobald die Söldner unterwegs einen Keiler
// angingen, und die Figur blieb danach dauerhaft stehen. Jetzt wie in WoW:
//  - Mit stehenden Begleitern hält nur ein TREFFER am Helden den Laufweg an. Aggro oder Kettenzug allein fangen die Söldner ab;
//    ohne Begleiter bleibt es beim Stopp schon beim Bemerken (Runde 3a/5a).
//  - Nach dem Kampf geht es weiter, sobald kein Gegner mehr in der Nähe kämpft (kurzer Hinweis „Weiter …“). Wer selbst lenkt
//    (Laufen per Taste, neuer Laufweg, Klick auf den Boden), übernimmt – dann entfällt das Fortsetzen.

import {AUTOPILOT_UI} from './content/index.js';
/** Wie lange nach dem letzten kämpfenden Gegner der Laufweg wieder aufgenommen wird, wie nah ein Gegner „bedroht“ und wie lange
 *  ein angehaltener Laufweg höchstens auf das Fortsetzen wartet. */
export const AUTOPILOT_RESUME={delay:1.2,threatRange:420,keep:90};
/** Beim Start eines Laufwegs: merken, wer schon kämpft. */
export function startAutopilot(g){
 g.autopilot={known:new Set((g.enemies||[]).filter(e=>e.aggro&&e.hp>0).map(e=>e.id))};
 g.autopilotResume=null;
 return g.autopilot;
}
/** Läuft gerade ein Autopilot-Laufweg? */
export const autopiloting=g=>!!(g.autopilot&&g.routeGoal&&!g.approach);
const guarded=g=>(g.companions||[]).some(c=>c.state!=='down'&&c.hp>0);
/** Gegner e greift an. how: 'hit' (Treffer am Helden) oder 'aggro' (bemerkt ihn bzw. Kettenzug). Mit stehenden Begleitern zählt nur
 *  der Treffer. Hält einen laufenden Autopiloten an und merkt sich das Ziel zum Fortsetzen. → true, wenn angehalten. */
export function autopilotThreat(g,e,how='hit'){
 const a=g.autopilot;if(!a||!e)return false;
 if(!g.routeGoal||g.approach){g.autopilot=null;return false;}
 if(a.known.has(e.id))return false;
 if(how==='aggro'&&guarded(g))return false;
 const goal=g.routeGoal;g.autopilotResume={goal:{x:goal.x,y:goal.y},name:goal.name||'',since:g.time||0,quietAt:null};
 g.moveTo=null;g.path=[];g.routeGoal=null;g.autopilot=null;g.stairsAutoDown=false;
 g.emit?.('autopilotStop',{enemyId:e.id});/* Runde 5a: rote Zeile, damit der Stopp auch hinter Fenstern auffällt */g.fail?.(AUTOPILOT_UI.stopped);
 return true;
}
/** Je Takt: angehaltenen Laufweg nach dem Kampf fortsetzen. Eigene Steuerung, Tod, Instanzwechsel oder Zeitablauf verwerfen ihn. */
export function tickAutopilot(g){
 const r=g.autopilotResume;if(!r)return false;const p=g.player,t=g.time||0;
 const steering=g.keys?.size>0||!!(g.touchMove&&(g.touchMove.x||g.touchMove.y));
 if(g.dead||g.paused||t-r.since>AUTOPILOT_RESUME.keep||steering&&!r.fighting){g.autopilotResume=null;return false;}
 if(g.routeGoal||g.approach){r.fighting=true;r.quietAt=null;return false;}/* Angriffslauf (attack-approach.js) oder Ausweichen im Kampf: warten */
 const threat=(g.enemies||[]).some(e=>e.hp>0&&e.aggro&&e.ai!=='returning'&&!e.dummy&&Math.hypot(e.x-p.x,e.y-p.y)<AUTOPILOT_RESUME.threatRange);
 if(threat){r.fighting=true;r.quietAt=null;return false;}
 r.fighting=false;r.quietAt??=t;if(t-r.quietAt<AUTOPILOT_RESUME.delay)return false;
 g.autopilotResume=null;
 if(!g.navigate?.(r.goal))return false;
 g.toast?.(AUTOPILOT_UI.resumed(r.name));g.emit?.('autopilotResume',{goal:r.goal});
 return true;
}
