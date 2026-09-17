// Prüfungen der Rolle Klassendesign (classes.js, skills.js, talents.js, talent-layout.js, procs.js).
import {CLAN_MEMBERS} from '../classes.js';
import {KITS,BASE_SKILLS,CLASS_LESSONS} from '../skills.js';
import {CLASS_SPECS,TALENT_ROWS} from '../talents.js';
export function check(bad){
 for(const m of CLAN_MEMBERS){
  // Jede Klasse hat drei Spezialisierungen mit je zehn Talenten (Speicherschlüssel <spec>-<index>).
  if(CLASS_SPECS[m.id]?.length!==3)bad('class '+m.id,'genau drei Spezialisierungen');
  for(const spec of CLASS_SPECS[m.id]||[])if(TALENT_ROWS[spec]?.length!==10)bad('spec '+spec,'zehn Talente nötig');
  // Kein Kniff ohne Lernstufe; Grundangriff und Ausweichen auf Stufe 1.
  const lessons=CLASS_LESSONS[m.id]||{};for(const s of BASE_SKILLS)if(lessons[s.id]===undefined&&!['auto'].includes(s.id))bad('lessons '+m.id,'Lernstufe fehlt für '+s.id);
  // Kit-Texte nennen die Spielerhandlung, nicht nur Zahlen.
  for(const [i,s] of (KITS[m.id]||[]).entries())if(s.text&&s.text.length<12)bad('kit '+m.id+'/'+BASE_SKILLS[i].id,'text zu kurz');
 }
}
