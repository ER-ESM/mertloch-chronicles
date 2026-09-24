// Autopilot stoppt beim ersten Treffer (Runde 3a, 2026-09-24, Kenner-Befund 1, WoW-Vorbild): Jeder Laufweg aus game.navigate
// (Klick auf den Auftragskasten, Karte „Weg einschlagen“, Minikarte, Rechtsklick auf den Boden) hält an, sobald ein Gegner den
// Helden neu angreift – beim Aggro, beim Kettenzug („Kumpel kommt“) oder beim ersten Treffer. Gegner, die schon beim Losgehen
// im Kampf waren, zählen nicht: Wer aus einem Kampf wegläuft, wird von seinen Verfolgern nicht festgehalten.
// Der Lauf zum Gegner nach Rechtsklick (attack-approach.js) ist kein Autopilot, er ist ein Angriff.

import {AUTOPILOT_UI} from './content/index.js';
/** Beim Start eines Laufwegs: merken, wer schon kämpft. */
export function startAutopilot(g){
 g.autopilot={known:new Set((g.enemies||[]).filter(e=>e.aggro&&e.hp>0).map(e=>e.id))};
 return g.autopilot;
}
/** Läuft gerade ein Autopilot-Laufweg? */
export const autopiloting=g=>!!(g.autopilot&&g.routeGoal&&!g.approach);
/** Gegner e greift an (Aggro oder Treffer): einen laufenden Autopiloten anhalten. → true, wenn angehalten. */
export function autopilotThreat(g,e){
 const a=g.autopilot;if(!a||!e)return false;
 if(!g.routeGoal||g.approach){g.autopilot=null;return false;}
 if(a.known.has(e.id))return false;
 g.moveTo=null;g.path=[];g.routeGoal=null;g.autopilot=null;g.stairsAutoDown=false;
 g.emit?.('autopilotStop',{enemyId:e.id});/* Runde 5a: rote Zeile, damit der Stopp auch hinter Fenstern auffällt */g.fail?.(AUTOPILOT_UI.stopped);
 return true;
}
