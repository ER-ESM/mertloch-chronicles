// Proc-Regeln: Auslöser → Wirkung mit Zeitfenster. Talente verweisen über den Effektschlüssel `proc:<id>` darauf.
// Die Regeln liegen je Klasse in content/procs/<klasse>.js (E-32). Format je Regel:
// trigger: siehe PROC_TRIGGERS; skill und zone filtern, every zählt passende Ereignisse.
// effect: free/reset/empower, energy/points/shield/haste, heal (Leben oder {damage: Anteil}), cdReduce ({skill,seconds}).
// glow: dieser Kniff leuchtet auf der Leiste, solange das Fenster offen ist. chance 1 = immer.
// Beschreibung (Welle D): name, icon (Vokabular content/items.js ICONS), look (Bildwunsch) und info:{effect,why,links,terms};
// Zahlen kommen aus der Regel selbst: describe('proc',id) baut daraus Auslöser, Chance, Zeitfenster und jede Wirkung.
import {PROC_RULES_DIETER} from './procs/dieter.js';
import {PROC_RULES_BAERBEL} from './procs/baerbel.js';
import {PROC_RULES_KEVIN} from './procs/kevin.js';
export const PROC_TRIGGERS=['crit','kill','parry','interrupt','dodge','dash','markTick','autoHit','heal','burst','lowHealth','skillHit','markedHit','beat','inZone','overcharge','misfire','jackpotStart','reactionStart'];
export const PROC_RULES={...PROC_RULES_DIETER,...PROC_RULES_BAERBEL,...PROC_RULES_KEVIN};
/** Proc-IDs müssen über alle Klassen eindeutig sein (Schema-Prüfung meldet Doppelte). */
export const PROC_DUPLICATES=(()=>{const seen=new Map(),out=[];for(const [cls,rules] of [['dieter',PROC_RULES_DIETER],['baerbel',PROC_RULES_BAERBEL],['kevin',PROC_RULES_KEVIN]])for(const id of Object.keys(rules)){if(seen.has(id))out.push(id+' ('+seen.get(id)+' und '+cls+')');seen.set(id,cls);}return out;})();
export const procId=key=>key.startsWith('proc:')?key.slice(5):null;
