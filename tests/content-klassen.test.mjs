// Prüfungen der Rolle Klassendesign: Talente sind Regeln mit Auslöser, Kniff-Texte nennen den Einsatzmoment.
import test from 'node:test';
import assert from 'node:assert/strict';
import {TALENT_ROWS,TALENT_CELLS,CLASS_SPECS,isProcEffect,PROC_RULES,PROC_TRIGGERS,KITS,BASE_SKILLS,CLAN_MEMBERS,CLASS_LESSONS} from '../content/index.js';

test('jeder Talentbaum hat dreißig Talente in zehn Reihen × drei Pfaden, mindestens eine aktive Fähigkeit und mindestens vier Auslöser-Regeln',()=>{
 for(const spec of Object.values(CLASS_SPECS).flat()){
  const rows=TALENT_ROWS[spec];
  assert.equal(rows.length,30,spec);
  const cells=new Set(TALENT_CELLS[spec].map(c=>c.row+'/'+c.path));assert.equal(cells.size,30,spec+': jede Zelle genau einmal');
  assert.ok(rows.some(t=>t.grants),spec+': keine aktive Talentfähigkeit');
  const procs=rows.filter(t=>Object.keys(t.effects||{}).some(isProcEffect)).length;
  assert.ok(procs>=4,spec+': nur '+procs+' Proc-Talente');
 }
});

test('jede Proc-Regel hat einen bekannten Auslöser, ein Zeitfenster und hängt an einem Talent',()=>{
 const used=new Set(Object.values(TALENT_ROWS).flat().flatMap(t=>Object.keys(t.effects||{})).filter(isProcEffect).map(k=>k.slice(5)));
 for(const [id,r] of Object.entries(PROC_RULES)){
  assert.ok(PROC_TRIGGERS.includes(r.trigger),id+': Auslöser '+r.trigger);
  assert.ok(r.window>0&&r.chance>0&&r.chance<=1,id+': Fenster/Chance');
  assert.ok(used.has(id),id+': keine Talentregel verweist darauf');
 }
 for(const id of used)assert.ok(PROC_RULES[id],id+': Talent verweist auf unbekannte Regel');
});

test('kein Talent ist eine reine Zahl ohne Auslöser',()=>{
 const wert=['stamina','might','finesse','wit','armorRating','critRating','hasteRating','masteryRating','range','shieldBonus','healBonus'];
 for(const [spec,rows] of Object.entries(TALENT_ROWS))for(const [i,t] of rows.entries()){
  const keys=Object.keys(t.effects||{});
  assert.ok(!(keys.length&&!t.grants&&keys.every(k=>wert.includes(k))),spec+'-'+i+': reines Wert-Talent');
  assert.ok(t.text.length>20,spec+'-'+i+': Text zu dünn');
 }
});

test('jeder Kniff-Text sagt, wann man ihn drückt',()=>{
 const when=['drück','Drück','zünde','Zünde','Stell','Spring','Leg ','Wirf','wenn','bevor','sobald'];
 for(const [cls,kit] of Object.entries(KITS))for(const [i,s] of kit.entries())
  assert.ok(when.some(w=>(s.text||'').includes(w)),cls+'/'+BASE_SKILLS[i].id+': kein Einsatzmoment im Text');
});

test('die drei Klamotten unterscheiden sich schon auf Stufe 1 (P13)',()=>{
 // Auf Stufe 1 gibt es nur Autoangriff, Grundangriff und Ausweichen – der Unterschied muss dort liegen.
 for(const m of CLAN_MEMBERS)for(const id of ['strike','dash'])assert.equal(CLASS_LESSONS[m.id][id],1,m.id+'/'+id+' muss auf Stufe 1 liegen');
 const start=id=>{const kit=KITS[id],at=sid=>({...BASE_SKILLS.find(s=>s.id===sid),...kit[BASE_SKILLS.findIndex(s=>s.id===sid)]});
  const s=at('strike'),d=at('dash');return {strikeCd:s.cd,strikeRange:s.range,strikeGain:s.gain,dashCd:d.cd,dashSteps:d.steps};};
 const values=Object.fromEntries(CLAN_MEMBERS.map(m=>[m.id,start(m.id)]));
 for(const [i,a] of CLAN_MEMBERS.entries())for(const b of CLAN_MEMBERS.slice(i+1)){
  const differs=Object.keys(values[a.id]).filter(k=>values[a.id][k]!==values[b.id][k]);
  assert.ok(differs.length>=3,a.id+' vs '+b.id+': nur '+differs.length+' abweichende Startwerte ('+differs.join(', ')+')');
 }
 // Der Kurztext der Klamottenkarte nennt den Unterschied mit Zahl und widerspricht dem Kit nicht.
 for(const m of CLAN_MEMBERS){assert.ok(/\d/.test(m.passive),m.id+': Kurztext ohne Zahl');
  for(const [key,value] of Object.entries(values[m.id]))if(m.passives?.[key]!==undefined)assert.equal(m.passives[key],value,m.id+'/'+key);}
 // Genau eine Klasse ist der langsame Schwerschläger, genau eine die Fernste.
 assert.equal(Math.max(...CLAN_MEMBERS.map(m=>values[m.id].strikeCd)),values.dieter.strikeCd,'Dieter schlägt am langsamsten');
 assert.equal(Math.max(...CLAN_MEMBERS.map(m=>values[m.id].strikeRange)),values.kevin.strikeRange,'Kevin trifft am weitesten');
 assert.equal(Math.min(...CLAN_MEMBERS.map(m=>values[m.id].dashCd)),values.kevin.dashCd,'Kevin weicht am häufigsten aus');
});

// --- Welle D · Erweiterte Beschreibungen ------------------------------------------------------
import {GLOSSARY,describe as describeElement,describableIds,element,DESCRIBE_KINDS,hasTerm,termsOf,BALANCE} from '../content/index.js';

test('jedes kampfrelevante Element hat info mit effect und why, ein Icon und einen abgeleiteten numbers-Block',()=>{
 const all=describableIds();
 assert.ok(all.length>=150,'nur '+all.length+' beschreibbare Elemente');
 for(const {kind,id} of all){
  const d=describeElement(kind,id),w=kind+' '+id;
  assert.ok(d,w+': describe() liefert nichts');
  assert.ok(d.effect&&d.effect.length>20,w+': effect fehlt oder ist zu dünn');
  assert.ok(d.why&&d.why.length>20,w+': why fehlt oder ist zu dünn');
  assert.ok(d.icon&&(d.icon.set==='skills'||d.icon.set==='talents'||d.icon.set==='icons'||d.icon.set==='clan'),w+': kein Icon');
  assert.ok(d.numbers.length>0,w+': numbers-Block leer');
  for(const row of d.numbers)assert.ok(row.label&&row.value!==undefined&&row.source,w+': unvollständige Zahlenzeile');
 }
});

test('kein effect wiederholt den Namen und keine zwei Elemente haben denselben effect',()=>{
 const seen=new Map();
 for(const {kind,id} of describableIds()){
  const d=describeElement(kind,id),w=kind+' '+id;
  assert.ok(!d.effect.includes(d.name),w+': effect wiederholt den Namen wörtlich');
  assert.ok(!seen.has(d.effect),w+': gleicher effect wie '+seen.get(d.effect));
  seen.set(d.effect,w);
 }
});

test('jeder terms-Eintrag steht im Glossar, jeder links-Eintrag ist eine echte ID',()=>{
 for(const {kind,id} of describableIds()){
  const d=describeElement(kind,id),w=kind+' '+id;
  for(const t of d.terms)assert.ok(hasTerm(t),w+': kein Glossareintrag "'+t+'"');
  for(const l of d.links){
   const [lk,...rest]=l.split(':');
   assert.ok(DESCRIBE_KINDS.includes(lk),w+': unbekannte Art in "'+l+'"');
   assert.ok(element(lk,rest.join(':')),w+': toter Verweis "'+l+'"');
  }
 }
});

test('das Glossar erklärt jeden Begriff kurz und lang, mit Zahlen aus BALANCE',()=>{
 for(const [id,g] of Object.entries(GLOSSARY)){
  assert.match(id,/^[A-Za-z0-9-]+$/,id+': ID nur a-zA-Z0-9-');
  assert.ok(g.name&&g.short&&g.long,id+': name/short/long fehlt');
  assert.ok(g.long.length>=60,id+': long erklärt die Mechanik nicht');
  assert.ok(g.short.length<=160,id+': short ist kein einzelner Satz');
 }
 // Kein Doppelpflege-Risiko: die Zahlen im Glossar stammen aus BALANCE, nicht aus dem Text.
 assert.ok(GLOSSARY.gcd.long.includes(String(BALANCE.player.gcdBase).replace('.',',')),'gcd nennt den BALANCE-Grundwert nicht');
 assert.ok(GLOSSARY.schwung.long.includes(String(BALANCE.momentum.restRegen)),'schwung nennt die BALANCE-Regeneration nicht');
 // Die Shift-Ansicht liefert zu jedem Begriff eines Elements die lange Erklärung.
 const shift=termsOf('skill','dieter/strike');
 assert.ok(shift.length>=3&&shift.every(t=>t.long),'termsOf() liefert keine langen Erklärungen');
});
