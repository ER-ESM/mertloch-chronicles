// Angreifer wird Ziel (Runde 2b, 2026-09-24, Neuling-Befund 2, WoW-Vorbild): Wer kein feindliches Ziel hat – gar keins, ein
// totes oder ein neutrales, unbeteiligtes Tier wie den Pfanddachs –, bekommt den Gegner, der ihn angreift, automatisch als Ziel.
// Ein gewählter Söldner oder Mitspieler bleibt Ziel (E-65: der Heiler wird nicht umgelenkt); ein NPC als Freund zählt wie „nichts“.
// Dieselbe Regel gilt vor Angriffen (Taste 1, Rechtsklick, Kniff): solange dich ein Feind angreift, trifft der Angriff nie den Dachs.
import {helpTarget} from './help-target.js';
import {distance} from './world.js';

/** Reichweite, in der ein Angreifer als „greift dich an“ zählt. */
export const ATTACKER_RANGE=260;
/** Ein Gegner, gegen den man kämpft oder kämpfen will: lebt und ist aggressiv oder schon im Kampf. */
export const hostile=e=>!!e&&e.hp>0&&(!!e.aggro||e.behavior!=='neutral');
/** Kein feindliches Ziel: nichts, tot oder neutral und unbeteiligt. */
export const idleTarget=g=>!hostile(g.target);
/** Gegner, die dich gerade angreifen, der nächste zuerst. */
export function attackersOf(g){const p=g.player;return (g.enemies||[]).filter(e=>e.hp>0&&e.aggro&&e.ai!=='returning'&&!(e.spawnGrace>0)&&!e.remoteTarget&&distance(e,p)<ATTACKER_RANGE).sort((a,b)=>distance(a,p)-distance(b,p));}
/** Den Angreifer e zum Ziel machen, wenn kein feindliches Ziel steht und kein Söldner/Mitspieler gewählt ist. → true, wenn gewechselt. */
export function adoptAttacker(g,e){
 if(!e||!(e.hp>0)||!idleTarget(g)||helpTarget(g).kind!=='self')return false;
 g.friend=null;g.target=e;g.emit?.('target');return true;
}
/** Vor einem Angriff: steht ein neutrales, unbeteiligtes Ziel (oder keins), während dich ein Feind angreift, wird der Feind Ziel. */
export function preferAttacker(g){if(!idleTarget(g))return false;const e=attackersOf(g)[0];return e?adoptAttacker(g,e):false;}
