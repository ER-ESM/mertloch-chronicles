// Proc-Regeln: Auslöser → Wirkung mit Zeitfenster. Talente verweisen über den Effektschlüssel `proc:<id>` darauf.
// Die Regeln liegen je Klasse in content/procs/<klasse>.js (E-32). Format je Regel:
// trigger: siehe PROC_TRIGGERS; skill und zone filtern, every zählt passende Ereignisse.
// effect: free/reset/empower, energy/points/shield/haste, heal (Leben oder {damage: Anteil}), cdReduce ({skill,seconds}).
// E-72: Ressourcen-Wirkungen bottles/glut/cook/augen/draw/trend/tab (content/resources.js RESOURCE_PROC_EFFECTS).
// glow: dieser Kniff leuchtet auf der Leiste, solange das Fenster offen ist. chance 1 = immer.
// Beschreibung (Welle D): name, icon (Vokabular content/items.js ICONS), look (Bildwunsch) und info:{effect,why,links,terms};
// Zahlen kommen aus der Regel selbst: describe('proc',id) baut daraus Auslöser, Chance, Zeitfenster und jede Wirkung.
import {PROC_RULES_DIETER} from './procs/dieter.js';
import {PROC_RULES_BAERBEL} from './procs/baerbel.js';
import {PROC_RULES_KEVIN} from './procs/kevin.js';
import {PROC_RULES_SCHORSCH} from './procs/schorsch.js';
import {PROC_RULES_KAETHE} from './procs/kaethe.js';
import {RESOURCE_PROC_TRIGGERS} from './resources.js';
export const PROC_TRIGGERS=['crit','kill','parry','interrupt','dodge','dash','markTick','autoHit','heal','burst','lowHealth','skillHit','markedHit','beat','inZone','overcharge','misfire','jackpotStart','reactionStart',...RESOURCE_PROC_TRIGGERS];
const BY_CLASS=[['dieter',PROC_RULES_DIETER],['baerbel',PROC_RULES_BAERBEL],['kevin',PROC_RULES_KEVIN],['schorsch',PROC_RULES_SCHORSCH],['kaethe',PROC_RULES_KAETHE]];
export const PROC_RULES=Object.assign({},...BY_CLASS.map(([,rules])=>rules));
/** Proc-IDs müssen über alle Klassen eindeutig sein (Schema-Prüfung meldet Doppelte). */
export const PROC_DUPLICATES=(()=>{const seen=new Map(),out=[];for(const [cls,rules] of BY_CLASS)for(const id of Object.keys(rules)){if(seen.has(id))out.push(id+' ('+seen.get(id)+' und '+cls+')');seen.set(id,cls);}return out;})();
export const procId=key=>key.startsWith('proc:')?key.slice(5):null;
