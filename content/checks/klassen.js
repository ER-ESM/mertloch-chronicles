// Prüfungen der Rolle Klassendesign (classes.js, skills.js, talents.js, talent-layout.js, procs.js).
import {CLAN_MEMBERS} from '../classes.js';
import {KITS,BASE_SKILLS,CLASS_LESSONS,BUFF_SKILLS,THROW_SKILL,GROUND_SKILL,TALENT_SKILLS} from '../skills.js';
import {CLASS_SPECS,TALENT_ROWS,isProcEffect} from '../talents.js';
import {PROC_RULES} from '../procs.js';
import {GLOSSARY,hasTerm,describe,describableIds,element,DESCRIBE_KINDS} from '../glossary.js';
// Effektschlüssel ohne Auslöser: reine Werte. Ein Talent darf nicht nur daraus bestehen (Talente sind Regeln, docs/GAMEPLAY-KONZEPT-FLUSS.md §6).
const VALUE_ONLY=['stamina','might','finesse','wit','armorRating','critRating','hasteRating','masteryRating','range','shieldBonus','healBonus'];
// Kniff-Texte sagen, wann man sie drückt.
const WHEN=['drück','Drück','zünde','Zünde','stell','Stell','spring','Spring','leg ','Leg ','wirf','Wirf','wenn','bevor','sobald','solange','Erst ','erst '];
export function check(bad){
 for(const m of CLAN_MEMBERS){
  // Jede Klasse hat drei Spezialisierungen mit je zehn Talenten (Speicherschlüssel <spec>-<index>).
  if(CLASS_SPECS[m.id]?.length!==3)bad('class '+m.id,'genau drei Spezialisierungen');
  for(const spec of CLASS_SPECS[m.id]||[])if(TALENT_ROWS[spec]?.length!==30&&TALENT_ROWS[spec]?.length!==10)bad('spec '+spec,'dreißig Talente nötig');
  // Kein Kniff ohne Lernstufe; Grundangriff und Ausweichen auf Stufe 1.
  const lessons=CLASS_LESSONS[m.id]||{};for(const s of BASE_SKILLS)if(lessons[s.id]===undefined&&!['auto'].includes(s.id))bad('lessons '+m.id,'Lernstufe fehlt für '+s.id);
  // Kit-Texte nennen die Spielerhandlung, nicht nur Zahlen.
  for(const [i,s] of (KITS[m.id]||[]).entries()){if(s.text&&s.text.length<12)bad('kit '+m.id+'/'+BASE_SKILLS[i].id,'text zu kurz');
   if(!WHEN.some(w=>(s.text||'').includes(w)))bad('kit '+m.id+'/'+BASE_SKILLS[i].id,'Text sagt nicht, wann man den Kniff drückt');}
  if(!WHEN.some(w=>(BUFF_SKILLS[m.id]?.text||'').includes(w)))bad('buff '+m.id,'Text sagt nicht, wann man den Kniff drückt');
 }
 // P13: Auf Stufe 1 gibt es nur Autoangriff, Grundangriff und Ausweichen. Die drei Klamotten müssen sich schon dort
 // messbar unterscheiden – nicht nur im Namen der Ressource. Verglichen werden die Werte, die auf Stufe 1 wirken.
 const startValues=id=>{const kit=KITS[id]||[],at=sid=>({...BASE_SKILLS.find(s=>s.id===sid),...kit[BASE_SKILLS.findIndex(s=>s.id===sid)]});
  const strike=at('strike'),dash=at('dash');return {strikeCd:strike.cd,strikeRange:strike.range,strikeGain:strike.gain,dashCd:dash.cd,dashSteps:dash.steps};};
 const start=Object.fromEntries(CLAN_MEMBERS.map(m=>[m.id,startValues(m.id)]));
 for(const [i,a] of CLAN_MEMBERS.entries())for(const b of CLAN_MEMBERS.slice(i+1)){
  const differs=Object.keys(start[a.id]).filter(k=>start[a.id][k]!==start[b.id][k]).length;
  if(differs<3)bad('stufe1 '+a.id+'/'+b.id,'Startkniffe unterscheiden sich in nur '+differs+' von 5 Werten (P13: mindestens 3)');
 }
 // Der Kurztext auf der Klamottenkarte muss den Unterschied nennen, nicht nur die Spezialität ab Stufe 5.
 for(const m of CLAN_MEMBERS){const p=m.passives||{};
  for(const [key,value] of Object.entries(start[m.id]))if(p[key]!==undefined&&p[key]!==value)bad('passives '+m.id,key+' sagt '+p[key]+', das Kit '+value);
  if(!/\d/.test(m.passive||''))bad('passive '+m.id,'Kurztext nennt keine Zahl – der Unterschied bleibt unsichtbar');
 }
 // Talente sind Regeln: kein Talent besteht nur aus Werten ohne Auslöser.
 for(const [spec,rows] of Object.entries(TALENT_ROWS))for(const [i,t] of rows.entries()){
 const keys=Object.keys(t.effects||{});
  const classId=spec.split('-')[0],skills=new Set(['auto','buff','throw','ground',...BASE_SKILLS.map(s=>s.id),...CLASS_SPECS[classId].flatMap(s=>TALENT_ROWS[s].map(t=>t.grants).filter(Boolean))]);
  if(!Array.isArray(t.skills)||t.skills.some(id=>!skills.has(id))||new Set(t.skills).size!==t.skills.length)bad('talent '+spec+'-'+i,'ungültige oder fehlende Kniffbezüge');
  if(t.grants&&!t.skills?.includes(t.grants))bad('talent '+spec+'-'+i,'erlernten Kniff als Bezug nennen');
  if(keys.length&&!t.grants&&keys.every(k=>VALUE_ONLY.includes(k)))bad('talent '+spec+'-'+i,'reines Wert-Talent ohne Auslöser');
 }
 // Keine toten Proc-Regeln: jede Regel hängt an mindestens einem Talent.
 const used=new Set(Object.values(TALENT_ROWS).flat().flatMap(t=>Object.keys(t.effects||{})).filter(isProcEffect).map(k=>k.slice(5)));
 for(const id of Object.keys(PROC_RULES))if(!used.has(id))bad('proc '+id,'keine Talentregel verweist darauf');
 // Weitere Kniffe: Wurf, Boden und Talentfähigkeiten nennen ebenfalls den Einsatzmoment.
 for(const [id,s] of [['throw',THROW_SKILL],['ground',GROUND_SKILL],...Object.entries(TALENT_SKILLS)])
  if(!WHEN.some(w=>(s.text||'').includes(w)))bad('kniff '+id,'Text sagt nicht, wann man ihn drückt');
 checkDescriptions(bad);
}
// Welle D · Beschreibungs-Standard: jedes kampfrelevante Element trägt info{effect,why,links,terms} und ein Icon,
// jeder Begriff steht im Glossar, jeder Verweis zeigt auf eine echte ID, kein effect wiederholt sich oder den Namen.
export function checkDescriptions(bad){
 const seen=new Map();
 for(const {kind,id} of describableIds()){
  const w=kind+' '+id,d=describe(kind,id);
  if(!d){bad(w,'describe() liefert nichts');continue;}
  if(!d.effect)bad(w,'info.effect fehlt');
  if(!d.why)bad(w,'info.why fehlt');
  if(!d.icon)bad(w,'kein Icon');
  if(!d.numbers.length)bad(w,'kein abgeleiteter numbers-Block');
  for(const field of ['effect','why'])if(/\d/.test(element(kind,id)?.info?.[field]||''))bad(w,'info.'+field+' enthält feste Zahlen; Zahlen aus den Regeln ableiten');
  if(d.effect&&d.name&&d.effect.includes(d.name))bad(w,'effect wiederholt den Namen wörtlich');
  if(d.effect){const other=seen.get(d.effect);if(other)bad(w,'gleicher effect wie '+other);else seen.set(d.effect,w);}
  for(const t of d.terms)if(!hasTerm(t))bad(w,'terms: kein Glossareintrag "'+t+'"');
  for(const l of d.links){const [lk,...rest]=String(l).split(':');
   if(!DESCRIBE_KINDS.includes(lk)||!element(lk,rest.join(':')))bad(w,'links: unbekannte ID "'+l+'"');}
 }
 for(const [id,g] of Object.entries(GLOSSARY)){const w='glossar '+id;
  if(!/^[A-Za-z0-9-]+$/.test(id))bad(w,'ID nur a-zA-Z0-9-');
  if(!g.name||!g.short||!g.long)bad(w,'name/short/long fehlt');
  if(g.long&&g.long.length<60)bad(w,'long erklärt die Mechanik nicht');
  if(g.short&&g.short.length>160)bad(w,'short ist kein einzelner Satz');}
}
