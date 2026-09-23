// Prüfungen der Rolle Klassendesign (classes.js, skills.js, talents.js, talent-layout.js, procs.js).
import {CLAN_MEMBERS} from '../classes.js';
import {KITS,BASE_SKILLS,CLASS_LESSONS,BUFF_SKILLS,THROW_SKILL,GROUND_SKILL,TALENT_SKILLS} from '../skills.js';
import {CLASS_SPECS,TALENT_ROWS,isProcEffect,isClassBuffEffect} from '../talents.js';
import {CLASS_BUFFS,classBuffsFor} from '../class-buffs.js';
import {TUNING,CLASS_BUFF_TUNING} from '../tuning.js';
import {PROC_RULES} from '../procs.js';
import {GLOSSARY,hasTerm,describe,describableIds,element,DESCRIBE_KINDS} from '../glossary.js';
import {categoriesOf,termAudit,categoryTerms,TERM_FUNCTION,FUNCTIONS,MECHANIC_TERMS} from '../categories.js';
// Effektschlüssel ohne Auslöser: reine Werte. Ein Talent darf nicht nur daraus bestehen (Talente sind Regeln, docs/GAMEPLAY-KONZEPT-FLUSS.md §6).
const VALUE_ONLY=['stamina','might','finesse','wit','armorRating','range','shieldBonus','healBonus'];
// Jeder Kniff sagt in `use`, wann man ihn drückt; `text` beschreibt nur die Wirkung (Trennung 2026-09-20, scripts/skill-text-split.mjs).
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
   if(!WHEN.some(w=>(s.use||'').includes(w)))bad('kit '+m.id+'/'+BASE_SKILLS[i].id,'use sagt nicht, wann man den Kniff drückt');
   if(WHEN.slice(0,12).some(w=>(s.text||'').includes(w)))bad('kit '+m.id+'/'+BASE_SKILLS[i].id,'text enthält einen Einsatzhinweis – der gehört nach use');}
  if(!WHEN.some(w=>(BUFF_SKILLS[m.id]?.use||'').includes(w)))bad('buff '+m.id,'use sagt nicht, wann man den Kniff drückt');
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
  const classId=spec.split('-')[0],skills=new Set(['auto','buff','throw','ground',...BASE_SKILLS.map(s=>s.id),...CLASS_SPECS[classId].flatMap(s=>TALENT_ROWS[s].map(t=>t.grants).filter(Boolean)),...classBuffsFor(classId).map(b=>b.id)]);
  if(!Array.isArray(t.skills)||t.skills.some(id=>!skills.has(id))||new Set(t.skills).size!==t.skills.length)bad('talent '+spec+'-'+i,'ungültige oder fehlende Kniffbezüge');
  if(t.grants&&!t.skills?.includes(t.grants))bad('talent '+spec+'-'+i,'erlernten Kniff als Bezug nennen');
  if(keys.length&&!t.grants&&keys.every(k=>VALUE_ONLY.includes(k)))bad('talent '+spec+'-'+i,'reines Wert-Talent ohne Auslöser');
 }
 // Keine toten Proc-Regeln: jede Regel hängt an mindestens einem Talent.
 const used=new Set(Object.values(TALENT_ROWS).flat().flatMap(t=>Object.keys(t.effects||{})).filter(isProcEffect).map(k=>k.slice(5)));
 for(const id of Object.keys(PROC_RULES))if(!used.has(id))bad('proc '+id,'keine Talentregel verweist darauf');
 // Weitere Kniffe: Wurf, Boden und Talentfähigkeiten nennen ebenfalls den Einsatzmoment.
 for(const [id,s] of [['throw',THROW_SKILL],['ground',GROUND_SKILL],...Object.entries(TALENT_SKILLS)])
  if(!WHEN.some(w=>(s.use||'').includes(w)))bad('kniff '+id,'use sagt nicht, wann man ihn drückt');
 checkClassBuffs(bad);
 checkDescriptions(bad);
}
// Klassen-Buffs (content/class-buffs.js): zwei je Klasse, jeder hebt einen anderen Wert, Zahlen aus tuning.js, Talent-Haken mit passendem Text.
export function checkClassBuffs(bad){
 const stats=new Map();
 for(const m of CLAN_MEMBERS){const list=classBuffsFor(m.id);if(list.length<2)bad('classBuff '+m.id,'jede Klasse bringt mindestens zwei Klassen-Buffs mit');
  for(const b of list){const w='classBuff '+b.id;
   if(!TUNING.classBuffs?.[b.id])bad(w,'Zahlen fehlen in TUNING.classBuffs');
   for(const [k,v] of Object.entries(b.effects)){if(!(typeof v==='number'&&v>0))bad(w,'Wert '+k+' fehlt oder ist nicht positiv');if(stats.has(k))bad(w,'hebt '+k+' wie '+stats.get(k)+' – Buffs verschiedener Klassen sollen verschiedene Werte heben');stats.set(k,b.id);}
   if(!WHEN.some(x=>(b.use||'').includes(x)))bad(w,'use sagt nicht, wann man den Buff zaubert');
   if(!(b.level>=1&&b.level<=30))bad(w,'Lernstufe fehlt');
   if(!b.icon)bad(w,'Icon fehlt');}}
 const pct=Math.round(CLASS_BUFF_TUNING.talentStep*100)+' %';
 for(const [spec,rows] of Object.entries(TALENT_ROWS))rows.forEach((t,i)=>{for(const k of Object.keys(t.effects||{}).filter(isClassBuffEffect)){const b=CLASS_BUFFS[k.slice(10)];if(!b)continue;
  if(!t.text.includes(b.name)||!t.text.includes(String(Math.round(t.effects[k]*CLASS_BUFF_TUNING.talentStep*100))+' %'))bad('talent '+spec+'-'+i,'Text nennt '+b.name+' und die Verstärkung ('+pct+' je Stufe) nicht');
  if(!t.skills?.includes(b.id))bad('talent '+spec+'-'+i,'Klassen-Buff '+b.id+' als Kniffbezug nennen');}});
 for(const m of CLAN_MEMBERS)if(!Object.entries(TALENT_ROWS).some(([spec,rows])=>spec.startsWith(m.id+'-')&&rows.some(t=>Object.keys(t.effects||{}).some(isClassBuffEffect))))bad('classBuff '+m.id,'mindestens ein Talent der Klasse verstärkt einen Klassen-Buff');
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
 // Kategorien (content/categories.js): jedes Element hat Art und mindestens eine Funktion; Begriffe decken sich mit den Daten.
 for(const t of categoryTerms())bad('kategorien','Glossarverweis fehlt: '+t);
 for(const [t,f] of Object.entries(TERM_FUNCTION)){if(!hasTerm(t))bad('kategorien','TERM_FUNCTION: kein Glossareintrag "'+t+'"');if(!FUNCTIONS[f])bad('kategorien','TERM_FUNCTION: unbekannte Funktion "'+f+'"');}
 for(const t of MECHANIC_TERMS)if(!hasTerm(t))bad('kategorien','MECHANIC_TERMS: kein Glossareintrag "'+t+'"');
 for(const {kind,id} of describableIds()){const w=kind+' '+id,c=categoriesOf(kind,id);
  if(!c||!c.functions.length)bad(w,'keine Funktions-Kategorie: info.terms nennt keinen Begriff aus TERM_FUNCTION');
  const audit=termAudit(kind,id);
  for(const t of audit.missing)bad(w,'terms: "'+t+'" fehlt, obwohl Kniff-Bezug/Auslöser/Wirkung ihn belegen (node scripts/term-audit.mjs --fix)');
  for(const t of audit.unfounded)bad(w,'terms: "'+t+'" ohne Beleg – gemeint ist der Grundangriff');}
 for(const [id,g] of Object.entries(GLOSSARY)){const w='glossar '+id;
  if(!/^[A-Za-z0-9-]+$/.test(id))bad(w,'ID nur a-zA-Z0-9-');
  if(!g.name||!g.short||!g.long)bad(w,'name/short/long fehlt');
  if(g.long&&g.long.length<60)bad(w,'long erklärt die Mechanik nicht');
  if(g.short&&g.short.length>160)bad(w,'short ist kein einzelner Satz');}
}
