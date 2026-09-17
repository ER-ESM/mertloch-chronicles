// Tests der Rolle Gameplay: Eliten, Zaubermuster, Spawn-Regeln, Basisbau.
import test from 'node:test';
import assert from 'node:assert/strict';
import {ARCHETYPES,ELITES,ELITE_TABLE,CAST_SETS,SPAWN_TABLES,pickElite} from '../content/enemies.js';
import {ENEMY_AUTOS} from '../content/combat.js';
import {DROP_TABLES} from '../content/drops.js';
import {BUILDINGS,nextStage,buildingEffects} from '../content/buildings.js';

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
