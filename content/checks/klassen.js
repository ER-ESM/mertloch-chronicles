// Prüfungen der Rolle Klassendesign (classes.js, skills.js, talents.js, talent-layout.js, procs.js).
import {CLAN_MEMBERS} from '../classes.js';
import {KITS,BASE_SKILLS,CLASS_LESSONS,BUFF_SKILLS,THROW_SKILL,GROUND_SKILL,TALENT_SKILLS} from '../skills.js';
import {CLASS_SPECS,TALENT_ROWS,isProcEffect} from '../talents.js';
import {PROC_RULES} from '../procs.js';
// Effektschlüssel ohne Auslöser: reine Werte. Ein Talent darf nicht nur daraus bestehen (Talente sind Regeln, docs/GAMEPLAY-KONZEPT-FLUSS.md §6).
const VALUE_ONLY=['stamina','might','finesse','wit','armorRating','critRating','hasteRating','masteryRating','range','shieldBonus','healBonus'];
// Kniff-Texte sagen, wann man sie drückt.
const WHEN=['drück','Drück','zünde','Zünde','stell','Stell','spring','Spring','leg ','Leg ','wirf','Wirf','wenn','bevor','sobald','solange','Erst ','erst '];
export function check(bad){
 for(const m of CLAN_MEMBERS){
  // Jede Klasse hat drei Spezialisierungen mit je zehn Talenten (Speicherschlüssel <spec>-<index>).
  if(CLASS_SPECS[m.id]?.length!==3)bad('class '+m.id,'genau drei Spezialisierungen');
  for(const spec of CLASS_SPECS[m.id]||[])if(TALENT_ROWS[spec]?.length!==10)bad('spec '+spec,'zehn Talente nötig');
  // Kein Kniff ohne Lernstufe; Grundangriff und Ausweichen auf Stufe 1.
  const lessons=CLASS_LESSONS[m.id]||{};for(const s of BASE_SKILLS)if(lessons[s.id]===undefined&&!['auto'].includes(s.id))bad('lessons '+m.id,'Lernstufe fehlt für '+s.id);
  // Kit-Texte nennen die Spielerhandlung, nicht nur Zahlen.
  for(const [i,s] of (KITS[m.id]||[]).entries()){if(s.text&&s.text.length<12)bad('kit '+m.id+'/'+BASE_SKILLS[i].id,'text zu kurz');
   if(!WHEN.some(w=>(s.text||'').includes(w)))bad('kit '+m.id+'/'+BASE_SKILLS[i].id,'Text sagt nicht, wann man den Kniff drückt');}
  if(!WHEN.some(w=>(BUFF_SKILLS[m.id]?.text||'').includes(w)))bad('buff '+m.id,'Text sagt nicht, wann man den Kniff drückt');
 }
 // Talente sind Regeln: kein Talent besteht nur aus Werten ohne Auslöser.
 for(const [spec,rows] of Object.entries(TALENT_ROWS))for(const [i,t] of rows.entries()){
  const keys=Object.keys(t.effects||{});
  if(keys.length&&!t.grants&&keys.every(k=>VALUE_ONLY.includes(k)))bad('talent '+spec+'-'+i,'reines Wert-Talent ohne Auslöser');
 }
 // Keine toten Proc-Regeln: jede Regel hängt an mindestens einem Talent.
 const used=new Set(Object.values(TALENT_ROWS).flat().flatMap(t=>Object.keys(t.effects||{})).filter(isProcEffect).map(k=>k.slice(5)));
 for(const id of Object.keys(PROC_RULES))if(!used.has(id))bad('proc '+id,'keine Talentregel verweist darauf');
 // Weitere Kniffe: Wurf, Boden und Talentfähigkeiten nennen ebenfalls den Einsatzmoment.
 for(const [id,s] of [['throw',THROW_SKILL],['ground',GROUND_SKILL],...Object.entries(TALENT_SKILLS)])
  if(!WHEN.some(w=>(s.text||'').includes(w)))bad('kniff '+id,'Text sagt nicht, wann man ihn drückt');
}
