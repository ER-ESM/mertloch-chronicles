// Tests der Rolle Gameplay: Eliten, Zaubermuster, Spawn-Regeln, Basisbau.
import test from 'node:test';
import assert from 'node:assert/strict';
import {ARCHETYPES,ELITES,ELITE_TABLE,CAST_SETS,SPAWN_TABLES,pickElite,CAMP_ENEMIES,BOSSES,CAST_INFO,ANSWER_INFO,answerOf,describeCast} from '../content/enemies.js';
import {ENEMY_AUTOS,COMBAT_TEXT,SKILL_DAMAGE,COMBAT_RULES,COMBAT_RULE_INFO,describeAuto} from '../content/combat.js';
import {DROP_TABLES} from '../content/drops.js';
import {BUILDINGS,BUILDING_EFFECTS,BUILDING_EFFECT_INFO,nextStage,buildingEffects,describeStage,effectNumber} from '../content/buildings.js';
import {existsSync} from 'node:fs';

const answers=setId=>new Set(Object.values(CAST_SETS[setId].casts).map(c=>c.name.split('·').pop().trim()));

test('Oberpraktikant Olaf ist eine vollwertige Elite mit eigenem Zaubermuster', ()=>{
  const olaf=ELITES.oberpraktikant;
  assert.ok(olaf,'Elite oberpraktikant fehlt');
  assert.equal(olaf.name,'Oberpraktikant Olaf');
  assert.equal(olaf.type,'cultist','menschlicher Gegner');
  assert.equal(olaf.skin,'warden','vorhandene Zeichenroutine');
  assert.ok(olaf.variant&&olaf.look,'variant und look als Grafikhinweis');
  assert.equal(olaf.elite,true);
  assert.ok(olaf.damage>1,'Elite braucht Schadensfaktor');
  assert.ok(olaf.title.startsWith('Elite ·'));
  assert.equal(olaf.leash,ELITES.alphaBoar.leash,'Elite-Distanz wie Borsten-Bruno');
  assert.ok(DROP_TABLES[olaf.family],'Beutefamilie muss in drops.js existieren');
  assert.ok(ENEMY_AUTOS[olaf.family],'Autoangriff der Beutefamilie muss existieren');
  // Eigenes Muster mit mindestens drei verschiedenen Antworten.
  assert.equal(olaf.castSet,'oberpraktikant');
  assert.notEqual(olaf.castSet,ELITES.alphaBoar.castSet,'eigenes Muster, nicht Brunos');
  assert.ok(answers('oberpraktikant').size>=3,'mindestens drei verschiedene Antworten');
  for(const c of Object.values(CAST_SETS.oberpraktikant.casts))assert.ok(c.total>=.6,'Zauberzeit reagierbar: '+c.name);
});

test('Olaf erscheint nur jenseits der Elite-Distanz', ()=>{
  const D=SPAWN_TABLES.eliteDistance;
  // Diesseits: nie eine Elite, egal welcher Würfel.
  for(const d of [0,100,SPAWN_TABLES.aggressiveMinDistance,SPAWN_TABLES.tierDistance,D-1])
    for(const r of [0,.25,.5,.75,.999])assert.equal(pickElite(d,()=>r),null,'Elite bei Entfernung '+d);
  // Jenseits: immer eine Elite, und Olaf ist darunter.
  const seen=new Set();
  for(let i=0;i<200;i++){const pick=pickElite(D+i,()=>i/200);assert.ok(pick&&pick.def.elite,'keine Elite jenseits von '+D);seen.add(pick.kind);}
  assert.ok(seen.has('oberpraktikant'),'Olaf kommt jenseits der Elite-Distanz vor');
  assert.ok(seen.has('alphaBoar'),'Borsten-Bruno bleibt in der Auswahl');
  // Und er steht in keiner freien Spawn-Tabelle, die schon ab tierDistance greift.
  for(const side of ['aggressive','neutral'])for(const row of SPAWN_TABLES[side]){
    assert.ok(!ELITES[row.kind],'Elite in freier Spawn-Tabelle: '+row.kind);
    assert.ok(ARCHETYPES[row.kind],'unbekannte Art in Spawn-Tabelle: '+row.kind);
  }
  assert.ok(SPAWN_TABLES.eliteDistance>SPAWN_TABLES.tierDistance,'Elite-Distanz liegt hinter der Tier-Distanz');
});

test('jede Elite steht genau einmal in ELITE_TABLE', ()=>{
  assert.deepEqual([...ELITE_TABLE.map(r=>r.kind)].sort(),Object.keys(ELITES).sort());
  for(const r of ELITE_TABLE)assert.ok(r.weight>0,'Gewicht fehlt: '+r.kind);
});

test('Basisbau: jede Stufe bringt Zuwachs und „Was du davon merkst“ steht im Text', ()=>{
  for(const [id,b] of Object.entries(BUILDINGS)){
    assert.ok(b.text.trim().split(/(?<=\.)\s+/).length>=2,'Gebäude '+id+' ohne „Was du davon merkst“-Satz');
    for(let i=1;i<b.stages.length;i++){
      const a=b.stages[i-1].effect,c=b.stages[i].effect;
      const grows=Object.entries(c).some(([k,v])=>k==='damageTaken'?v<(a[k]??1):v>(a[k]||0));
      assert.ok(grows,'Gebäude '+id+' Stufe '+(i+1)+' bringt keinen Zuwachs');
    }
    assert.ok(nextStage(id,0,4)||b.unlock?.chapter>4,'Gebäude '+id+' hat keine baubare erste Stufe');
  }
  const effects=buildingEffects(Object.fromEntries(Object.keys(BUILDINGS).map(id=>[id,9])));
  assert.ok(effects.restRegen>0&&effects.damageTaken<1,'Vollausbau muss spürbar sein');
});

test('Horst steht genau einmal in den Daten – Lagergegner und Boss sind dasselbe Objekt', ()=>{
  assert.equal(CAMP_ENEMIES.boss, BOSSES.horst, 'CAMP_ENEMIES.boss und BOSSES.horst müssen dasselbe Objekt sein, sonst greift Tuning nur auf einer Kopie');
  assert.equal(BOSSES.horst.id,'horst');
  assert.equal(BOSSES.horst.hp,3000);
  assert.equal(BOSSES.horst.castSet,'horst');
  assert.ok(BOSSES.horst.phases.length>=3,'Horst braucht seine drei Phasenzeilen');
  // Gegenprobe: eine Korrektur an einem Schlüssel wirkt auf beiden Wegen.
  const before=CAMP_ENEMIES.boss.hp;CAMP_ENEMIES.boss.hp=1;assert.equal(BOSSES.horst.hp,1);CAMP_ENEMIES.boss.hp=before;
});

test('Kampfmeldungen: Angriffshinweis und Abklingzeit mit Restzeit stehen in den Daten', ()=>{
  assert.ok(COMBAT_TEXT.underAttack?.trim(),'COMBAT_TEXT.underAttack fehlt (großer Hinweis auf das Ereignis attacked)');
  assert.equal(typeof COMBAT_TEXT.cooldown,'function','COMBAT_TEXT.cooldown muss (name,sekunden) annehmen');
  const line=COMBAT_TEXT.cooldown('Kellenschwung','2.4');
  assert.ok(line.includes('Kellenschwung'),'Abklingzeit-Meldung nennt den Kniff nicht');
  assert.ok(line.includes('2.4'),'Abklingzeit-Meldung nennt die Restzeit nicht');
});

test('Dieters Schadensmodell liegt auf demselben Waffenfaktor wie Bärbel und Kevin', ()=>{
  assert.equal(SKILL_DAMAGE.dieter.strike.weapon,SKILL_DAMAGE.baerbel.strike.weapon,'Klassenabstand gehört in Kit und Waffe, nicht in den Waffenfaktor von strike');
  assert.equal(SKILL_DAMAGE.dieter.burst.weapon,SKILL_DAMAGE.baerbel.burst.weapon,'gleicher fester Waffenfaktor ohne Punkte');
});

// --- Beschreibungs-Standard (docs/backlog/klassen.md, Welle D) ---
const allTerms=()=>[...new Set([
  ...Object.entries(BUILDINGS).flatMap(([,b])=>b.stages.flatMap(s=>s.info.terms)),
  ...Object.values(BUILDING_EFFECT_INFO).flatMap(d=>d.terms||[]),
  ...Object.values(CAST_SETS).flatMap(set=>Object.values(set.casts).flatMap(c=>c.info.terms)),
  ...Object.values(ENEMY_AUTOS).flatMap(a=>a.info.terms),
  ...Object.values(COMBAT_RULE_INFO).flatMap(e=>e.terms||[])])];

test('Basisbau: jeder Effekt erklärt sich, jede Stufe trägt info mit abgeleiteten Zahlen', ()=>{
  for(const [key,label] of Object.entries(BUILDING_EFFECTS)){
    const d=BUILDING_EFFECT_INFO[key];
    assert.ok(d,'Effekt ohne Erklärung: '+key);
    assert.equal(label,d.label,'BUILDING_EFFECTS muss aus BUILDING_EFFECT_INFO kommen (keine zweite Pflegestelle)');
    assert.ok(d.name&&d.short&&d.long&&d.unit&&d.kind,'name/short/long/unit/kind fehlen: '+key);
    assert.notEqual(d.short,d.long,'short und long sagen dasselbe: '+key);
  }
  // Einheiten und Vorzeichen: Anteil, Faktor, Sekunden und flache Punkte werden verschieden gelesen.
  assert.deepEqual(effectNumber('restRegen',.25,'x'),{label:'Regeneration an der Bude',value:'+25',unit:'%',source:'x',effect:'restRegen'});
  assert.equal(effectNumber('damageTaken',.97).value,'−3','Faktor 0,97 muss als −3 % erscheinen');
  assert.equal(effectNumber('dashCd',.1).value,'−10','Anteil weniger muss negativ erscheinen');
  assert.equal(effectNumber('consumableCd',3).value,'−3','Sekunden weniger');
  assert.equal(effectNumber('consumableCd',3).unit,'s');
  assert.equal(effectNumber('energyOnKill',5).value,'+5','flache Punkte');
  assert.equal(effectNumber('coinDrop',.1).value,'+10','additive Prozentpunkte');
  for(const [id,b] of Object.entries(BUILDINGS))b.stages.forEach((s,i)=>{
    const w=id+'/'+(i+1);
    assert.ok(s.info?.effect?.trim(),'info.effect fehlt: '+w);
    assert.ok(s.info.why.trim(),'info.why fehlt: '+w);
    assert.equal(s.info.numbers.length,Object.keys(s.effect).length,'je Effekt genau eine Zahl: '+w);
    for(const n of s.info.numbers)assert.ok(n.label&&n.value&&n.source,'unvollständige Zahl: '+w);
    for(const l of s.info.links||[])assert.ok(BUILDINGS[l],'links zeigt auf kein Gebäude: '+w+' → '+l);
    assert.ok(s.info.terms.includes('basisbau'),'Basisbau-Begriff fehlt: '+w);
  });
  // Keine doppelte Pflege: ändert sich der Effektwert, ändert sich die Zahl mit.
  const stage=BUILDINGS.tresen.stages[0],before=stage.effect.restRegen;
  stage.effect.restRegen=.4;
  assert.equal(describeStage('tresen',1).numbers[0].value,'+40','describeStage muss aus effect ableiten');
  stage.effect.restRegen=before;
  assert.equal(describeStage('tresen',1).numbers[0].value,'+25');
  assert.equal(describeStage('tresen',99),null,'unbekannte Stufe liefert null');
});

test('Zauber: jeder Zauber sagt, was der Gegner tut, mit Zahlen, Antwort und Begriffen', ()=>{
  for(const [setId,set] of Object.entries(CAST_SETS))for(const [castId,c] of Object.entries(set.casts)){
    const w=setId+'.'+castId;
    assert.ok(CAST_INFO[setId]?.[castId],'geschriebene Erklärung fehlt in CAST_INFO: '+w);
    assert.ok(c.info?.effect?.trim(),'info.effect fehlt: '+w);
    assert.ok(c.info.why.trim(),'info.why fehlt: '+w);
    const answer=answerOf(c);
    assert.ok(ANSWER_INFO[answer],'unbekannte Antwort: '+w+' · '+answer);
    assert.equal(c.info.answer,answer,'info.answer muss aus dem Namen kommen: '+w);
    assert.ok(c.info.why.includes(ANSWER_INFO[answer].rule),'why muss die Grundregel der Antwort nennen: '+w);
    assert.ok(c.info.terms.includes(ANSWER_INFO[answer].term),'terms nennt die Antwort nicht: '+w);
    const n=Object.fromEntries(c.info.numbers.map(x=>[x.label,x.value]));
    assert.equal(n['Zauberzeit'],c.total,'Zauberzeit weicht ab: '+w);
    assert.equal(n['Schaden'],c.damage,'Schaden weicht ab: '+w);
    if(c.radius)assert.equal(n['Flächenradius']??n['Trefferradius'],c.radius,'Radius weicht ab: '+w);
    if(c.ground)assert.ok(n['Flächenradius'],'Bodenzauber braucht einen Flächenradius: '+w);
  }
  // Keine doppelte Pflege: die Zahlen stammen aus dem Zauber, nicht aus dem Text.
  const cast=CAST_SETS.horst.casts.call,before=cast.damage;
  cast.damage=999;
  assert.equal(describeCast('horst','call').numbers[1].value,999,'describeCast muss den Zauber lesen');
  cast.damage=before;
  assert.equal(describeCast('horst','call').numbers[1].value,before);
  assert.equal(describeCast('horst','gibtsnicht'),null,'unbekannter Zauber liefert null');
});

test('Gegner-Autoangriffe erklären Schaden, Takt und Reichweite', ()=>{
  for(const [id,a] of Object.entries(ENEMY_AUTOS)){
    assert.ok(a.info?.effect?.trim(),'info.effect fehlt: '+id);
    assert.ok(a.info.why.trim(),'info.why fehlt: '+id);
    assert.ok(a.info.terms.includes('autoangriff'),'Begriff autoangriff fehlt: '+id);
    const n=Object.fromEntries(a.info.numbers.map(x=>[x.label,x.value]));
    assert.equal(n['Schaden je Treffer'],a.min+'–'+a.max,'Schadensspanne weicht ab: '+id);
    assert.equal(n['Schlagtempo'],a.speed,'Schlagtempo weicht ab: '+id);
    assert.equal(n['Reichweite'],a.range,'Reichweite weicht ab: '+id);
    assert.ok(n['Schaden je Sekunde']>0,'Schaden je Sekunde fehlt: '+id);
    assert.deepEqual(a.info,describeAuto(id),'info muss aus describeAuto kommen');
  }
});

test('COMBAT_RULE_INFO erklärt jede Kampfregel, die eine Zahl trägt', ()=>{
  const paths=[];
  const walk=(o,p='')=>{for(const [k,v] of Object.entries(o)){const q=p?p+'.'+k:k;if(typeof v==='number')paths.push(q);else if(v&&typeof v==='object')walk(v,q);}};
  walk(COMBAT_RULES);
  const covered=new Set(Object.values(COMBAT_RULE_INFO).flatMap(e=>e.rules||[]));
  for(const p of paths)assert.ok(covered.has(p),'Kampfregel ohne Erklärsatz: COMBAT_RULES.'+p);
  for(const [id,e] of Object.entries(COMBAT_RULE_INFO)){
    assert.ok(e.name&&e.short?.trim()&&e.long?.trim(),'name/short/long fehlen: '+id);
    assert.ok(e.numbers?.length,'Regel ohne Zahl gehört nicht ins Glossar: '+id);
    for(const n of e.numbers)assert.ok(n.label&&n.source,'Zahl ohne Quelle: '+id+' · '+n.label);
    for(const p of e.rules||[])assert.ok(paths.includes(p),'rules zeigt ins Leere: '+id+' → '+p);
  }
  // Die Zahlen im Erklärsatz stammen aus den Daten, nicht aus dem Text.
  assert.equal(COMBAT_RULE_INFO.lootRange.numbers[0].value,COMBAT_RULES.lootRange);
  assert.equal(COMBAT_RULE_INFO.specialInterval.numbers[0].value,COMBAT_RULES.specialInterval);
  assert.equal(COMBAT_RULE_INFO.firstSpecial.numbers[0].value,COMBAT_RULES.firstSpecial);
});

test('Begriffe sind Glossar-IDs – und stehen im Glossar, sobald es da ist', async ()=>{
  const terms=allTerms();
  assert.ok(terms.length>=10,'zu wenige Begriffe verknüpft');
  for(const t of terms)assert.match(t,/^[a-z0-9-]+$/,'Begriffs-ID nur a-z0-9-: '+t);
  // Pflichtbegriffe aus dem Auftrag, die in Gameplay-Daten vorkommen müssen.
  for(const t of ['parade','ausweichen','unterbrechen','flaeche','deckung','randale','regeneration','verpflegung','abklingzeit','erfahrung','pfandmarken'])
    assert.ok(terms.includes(t),'Pflichtbegriff nirgends verknüpft: '+t);
  // content/glossary.js gehört Klassendesign; solange es fehlt, wird nicht hart geprüft.
  const url=new URL('../content/glossary.js',import.meta.url);
  if(!existsSync(url))return;
  const {GLOSSARY}=await import('../content/glossary.js');
  for(const t of terms)assert.ok(GLOSSARY[t],'Begriff fehlt in content/glossary.js: '+t);
});
