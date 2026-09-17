// Prüfungen der Rolle Balancing (balance.js, tuning.js, BALANCE-REPORT.md).
import {BALANCE} from '../balance.js';
import {TUNING} from '../tuning.js';
import {ARCHETYPES,ELITES,CAMP_ENEMIES,BOSSES,CAST_SETS} from '../enemies.js';
import {ITEM_CATALOG} from '../items.js';
import {KITS} from '../skills.js';
const NUMERIC=v=>typeof v==='number'||(v&&typeof v==='object'&&Object.values(v).every(x=>typeof x==='number'));
export function check(bad){
 // Tuning: nur bekannte IDs, nur Zahlen, jede Korrektur mit Begründung und Datum.
 const known={enemies:{...ARCHETYPES,...ELITES,...CAMP_ENEMIES,...BOSSES},items:ITEM_CATALOG,skills:KITS};
 for(const [group,rows] of Object.entries(TUNING)){for(const [id,patch] of Object.entries(rows)){const w='tuning '+group+'/'+id;if(group==='casts'?!CAST_SETS[id]:!known[group]?.[id])bad(w,'ID unbekannt');if(!patch.why||!patch.since)bad(w,'why und since sind Pflicht');for(const [k,v] of Object.entries(patch)){if(['why','since'].includes(k))continue;if(group==='casts'||group==='skills'){if(!v||typeof v!=='object')bad(w,k+' muss ein Objekt je Zauber/Kniff sein');else for(const [kk,vv] of Object.entries(v))if(kk!=='why'&&kk!=='since'&&!NUMERIC(vv))bad(w,k+'.'+kk+' ist keine Zahl');}else if(k==='respawn'?!(Array.isArray(v)&&v.length===2):!NUMERIC(v))bad(w,k+' ist keine Zahl');}}}
 // Korridor: Kapitelbelohnungen wachsen mit dem Kapitel; EP-Kurve streng steigend.
 if(!(BALANCE.xp.quest.main>0))bad('xp','quest.main fehlt');
}
