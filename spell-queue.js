// Zauber-Puffer wie in WoW (Runde 5a, 2026-09-24, Kenner-Befund 6): Ein Kniff, der in den letzten QUEUE_WINDOW Sekunden der
// globalen Abklingzeit, einer eigenen Abklingzeit oder eines laufenden Zaubers gedrückt wird, wird vorgemerkt und direkt danach
// ausgelöst – statt stumm verschluckt zu werden. Früher gedrückt gibt es die rote Fehlerzeile „noch nicht bereit“.
// Es gibt genau einen Platz: der zuletzt gedrückte Kniff gewinnt (wie in WoW). Verfällt nach QUEUE_KEEP s ohne Auslösung.
// E-72 Runde 4 (Kenner-Befund „keine Tastenvorwahl“, 2026-09-25): Fenster und Haltezeit aus content/tuning.js (COMBAT_FLOW_TUNING);
// die Sperre zählt Schorschs Handgriff (Auflegen) wie einen Kniff ohne GCD; eine Vormerkung verfällt still, wenn sie nicht mehr passt:
// Esc (clearQueue), Laufen bei einem Kniff mit Zauberzeit, Zielwechsel von Hand, Ziel weg ohne neues.
import {COMBAT_FLOW_TUNING} from './content/index.js';
import {resourceOffGcd} from './class-resources.js';
import {inputMoving} from './auto-combat.js';
import {isMobile} from './spec-mechanics.js';
export const QUEUE_WINDOW=COMBAT_FLOW_TUNING.queueWindow,QUEUE_KEEP=COMBAT_FLOW_TUNING.queueKeep;

const offGcd=(g,s)=>!!s.offGcd||!!g.member&&resourceOffGcd(g,s.id);
/** Was sperrt den Kniff gerade? → {left: Restzeit in s, by: 'cast'|'gcd'|'cd'|null}. Die längste Sperre zählt. */
export function blocker(g,s){
 const gcd=offGcd(g,s)?0:(g.gcd||0),cd=(g.cooldowns?.[s.id]||0)>.01?g.cooldowns[s.id]:0,cast=g.casting&&!s.offGcd?(g.casting.remaining||0):0;
 const left=Math.max(gcd,cd,cast);return {left,by:left<=0?null:left===cast?'cast':left===cd?'cd':'gcd'};
}
/** E-72 Runde 4 (Kenner-Befund Tastenvorwahl): Beginnt eine GCD, laufen Abklingzeiten, die vorher enden würden, mit ihr ab – die Sperre ist
 *  dieselbe (die GCD sperrt ohnehin), aber die Zahl auf dem Knopf stimmt: vorher zeigte er „0,1“, während die GCD noch 1,3 s lief, und der
 *  Spieler drückte viel zu früh („muss noch verschnaufen · 0,1 s“). Wie in WoW zeigt der Knopf die längere der beiden Sperren.
 *  Kniffe ohne GCD (Autoangriff, Pfandautomat, Schorschs Auflegen) behalten ihre eigene Zeit. */
export function alignCooldowns(g){const gcd=g.gcd||0;if(!(gcd>0))return;for(const id in g.cooldowns){const cd=g.cooldowns[id];if(!(cd>.01&&cd<gcd))continue;/* Reste unter 0,01 s zählen überall als bereit – nie hochziehen (sonst sperrt der eigene Zauber seinen Abschluss) */const s=g.skills?.find(x=>x.id===id);if(s&&!offGcd(g,s))g.cooldowns[id]=gcd;}}
/** Restzeit, bis der Kniff frühestens geht (GCD, eigene Abklingzeit, laufender Zauber). */
export const blockedFor=(g,s)=>blocker(g,s).left;
/** Vormerken, wenn die Sperre gleich endet. → 'queued' | 'early' (noch zu früh, Fehlerzeile) | null (nicht gesperrt). */
export function tryQueue(g,s,{point=null,friend=null}={}){
 const left=blockedFor(g,s);if(left<=0)return null;
 if(left>QUEUE_WINDOW)return 'early';
 if(s.ground&&!point)return 'early';
 g.queued={id:s.id,point:point?{...point}:null,friend,at:g.time||0,targetId:g.target?.id??null};
 g.emit?.('skillQueued',{id:s.id});
 return 'queued';
}
/** Vormerkung verwerfen (Esc, neuer Bodenkniff, Tod …). → true, wenn eine da war. */
export function clearQueue(g){if(!g.queued)return false;g.queued=null;g.emit?.('skillQueued',{id:null});return true;}
/** Passt die Vormerkung noch? Laufen bricht nur Kniffe mit Zauberzeit ab; ein Zielwechsel von Hand (altes Ziel lebt noch) verwirft
 *  Kniffe gegen ein Ziel; stirbt das Ziel, geht der Kniff auf das neue – gibt es keins, verfällt er still statt „Kein Ziel“ zu melden. */
export function queueStale(g,q,s){
 if(s.castTime>0&&inputMoving(g)&&!isMobile(g,s))return true;
 if(s.range&&!s.ground&&q.targetId!=null&&g.target?.id!==q.targetId){
  const old=g.enemies?.find(e=>e.id===q.targetId);if(old&&old.hp>0)return true;
  if(!(g.target?.hp>0))return true;
 }
 return false;
}
/** Je Bild nach dem Herunterzählen der Abklingzeiten: den vorgemerkten Kniff auslösen, sobald nichts mehr sperrt. → true, wenn ausgelöst. */
export function tickQueue(g){
 const q=g.queued;if(!q)return false;
 if(g.dead||g.paused||(g.time||0)-q.at>QUEUE_KEEP){clearQueue(g);return false;}
 const s=g.skills?.find(x=>x.id===q.id);if(!s||queueStale(g,q,s)){clearQueue(g);return false;}
 if(blockedFor(g,s)>0)return false;
 g.queued=null;g.emit?.('skillQueued',{id:null});
 g.action(q.id,q.point,false,q.friend===undefined?g.friend:q.friend,{queued:true});
 return true;
}
