// Prüfungen der Rolle Gegenstände & Loot: Beutefamilien, Werkbank-Rezepte, Kioskpreise, totes Material.
import test from 'node:test';
import assert from 'node:assert/strict';
import {ITEM_CATALOG,DROP_TABLES,FOOD_DROPS,RECIPES,BENCH_STAGES,BUILDINGS,STORY_CHAPTERS} from '../content/index.js';

test('jede Beutefamilie lohnt sich: Material, Dorflegende und Verpflegung hängen zusammen', () => {
 for(const [family,t] of Object.entries(DROP_TABLES)){
  assert.ok(ITEM_CATALOG[t.material],family+': Material unbekannt');
  assert.equal(ITEM_CATALOG[t.unique]?.unique,true,family+': Dorflegende unbekannt');
  assert.ok(t.uniqueChance<=.2,family+': Dorflegende zu häufig');
  if(FOOD_DROPS[family])assert.equal(ITEM_CATALOG[FOOD_DROPS[family]].kind,'consumable',family+': Verpflegung ist keine Verpflegung');
 }
 const olaf=DROP_TABLES.oberpraktikant;
 assert.equal(olaf.material,'kabelbinder');
 assert.equal(olaf.unique,'dienstmuetze');
 assert.ok(olaf.gearChance>DROP_TABLES.inspector.gearChance,'die Elite muss mehr geben als ein Ordnungsamt-Praktikant');
 assert.ok(olaf.slots.includes('charm'),'Olaf lässt auch Talismane fallen');
});

test('die Werkbank baut nur Verpflegung und Talismane, nie Beute', () => {
 assert.ok(Object.keys(RECIPES).length>0);
 for(const [id,r] of Object.entries(RECIPES)){
  assert.ok(BENCH_STAGES[r.bench],id+': Werkbankstufe außerhalb 1–3');
  for(const item of Object.keys(r.input))assert.equal(ITEM_CATALOG[item]?.kind,'material',id+': Eingabe '+item+' ist kein Material');
  const out=ITEM_CATALOG[r.output.item];
  assert.ok(out,id+': Ergebnis unbekannt');
  assert.ok(out.kind==='consumable'||out.slot==='charm',id+': Ergebnis ist weder Verpflegung noch Talisman');
  assert.notEqual(out.unique,true,id+': Dorflegenden bleiben Beute');
 }
});

test('gebaute Talismane bleiben unter gewürfelter seltener Ausrüstung', () => {
 for(const id of ['kabeltalisman','blechtalisman']){
  const d=ITEM_CATALOG[id];
  assert.equal(d.slot,'charm');
  assert.equal(d.rarity,'uncommon',id+': gebaute Ware darf nicht selten sein');
  assert.notEqual(d.unique,true);
 }
});

test('Kioskpreise sind ganzzahlig und über dem Verkaufserlös', () => {
 const priced=Object.entries(ITEM_CATALOG).filter(([,d])=>d.price!==undefined);
 assert.ok(priced.length>=5,'die fünf Kioskwaren brauchen einen Preis');
 for(const [id,d] of priced){
  assert.equal(d.kind,'consumable',id+': Marken kaufen keine Ausrüstung');
  assert.ok(Number.isInteger(d.price)&&d.price>0,id+': Preis ungültig');
  assert.ok(d.price>Math.floor((d.value||0)/2),id+': Kaufen und Verkaufen wäre ein Gelddrucker');
 }
});

test('kein totes Material: jedes Material wird gebraucht', () => {
 const used=new Set();
 for(const r of Object.values(RECIPES))for(const item of Object.keys(r.input))used.add(item);
 for(const t of Object.values(DROP_TABLES))used.add(t.material);
 for(const b of Object.values(BUILDINGS))for(const s of b.stages||[])for(const item of Object.keys(s.cost||{}))used.add(item);
 for(const c of STORY_CHAPTERS)for(const o of c.objectives||[])if(o.kind==='gather'&&o.item)used.add(o.item);
 for(const [id,d] of Object.entries(ITEM_CATALOG))if(d.kind==='material'&&!d.retired)assert.ok(used.has(id),id+': totes Material');
});
