// Prüfungen der Rolle Klassendesign: Talente sind Regeln mit Auslöser, Kniff-Texte nennen den Einsatzmoment.
import test from 'node:test';
import assert from 'node:assert/strict';
import {TALENT_ROWS,CLASS_SPECS,isProcEffect,PROC_RULES,PROC_TRIGGERS,KITS,BASE_SKILLS} from '../content/index.js';

test('jeder Talentbaum hat zehn Talente, genau eine aktive Fähigkeit in Reihe drei und mindestens zwei Auslöser-Regeln',()=>{
 for(const spec of Object.values(CLASS_SPECS).flat()){
  const rows=TALENT_ROWS[spec];
  assert.equal(rows.length,10,spec);
  const actives=rows.map((t,i)=>t.grants?i:-1).filter(i=>i>=0);
  assert.deepEqual(actives,[4],spec+': aktive Fähigkeit nur auf Index 4');
  const procs=rows.filter(t=>Object.keys(t.effects||{}).some(isProcEffect)).length;
  assert.ok(procs>=2,spec+': nur '+procs+' Proc-Talente');
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
