import {PROFESSION_RECIPES} from '../content/index.js';
// Prüfungen der Rolle Gegenstände & Loot: Beutefamilien, Werkbank-Rezepte, Kioskpreise, totes Material.
import test from 'node:test';
import assert from 'node:assert/strict';
import {ITEM_CATALOG,DROP_TABLES,FOOD_DROPS,RECIPES,BENCH_STAGES,BUILDINGS,STORY_CHAPTERS,HOTSPOTS,WORLD_NOTICES} from '../content/index.js';

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
  assert.ok(d.kind==='consumable'||d.kind==='material'&&['brauwasser','leerflasche'].includes(id),id+': nur Verpflegung und Brauzutaten');
  assert.ok(Number.isInteger(d.price)&&d.price>0,id+': Preis ungültig');
  assert.ok(d.price>Math.floor((d.value||0)/2),id+': Kaufen und Verkaufen wäre ein Gelddrucker');
 }
});

test('kein totes Material: jedes Material wird gebraucht', () => {
 const used=new Set(Object.values(PROFESSION_RECIPES).flatMap(r=>Object.keys(r.materials)));
 for(const r of Object.values(RECIPES))for(const item of Object.keys(r.input))used.add(item);
 for(const t of Object.values(DROP_TABLES))used.add(t.material);
 for(const b of Object.values(BUILDINGS))for(const s of b.stages||[])for(const item of Object.keys(s.cost||{}))used.add(item);
 for(const c of STORY_CHAPTERS)for(const o of c.objectives||[])if(o.kind==='gather'&&o.item)used.add(o.item);
 for(const q of [...HOTSPOTS.flatMap(h=>h.quests),...WORLD_NOTICES])if(q.objective.item)used.add(q.objective.item);
 for(const [id,d] of Object.entries(ITEM_CATALOG))if(d.kind==='material'&&!d.retired)assert.ok(used.has(id),id+': totes Material');
});

// --- Welle D: Beschreibungs-Standard und benutzbare Gegenstände ---
import {ITEM_INFO,PROC_INFO,PROCS,describeItem,describeProc,itemNumbers,ratingShare,LOOT_TERMS,BALANCE} from '../content/index.js';

test('jede Ausrüstung und jede Verpflegung trägt einen info-Block, Material nicht', () => {
 for(const [id,d] of Object.entries(ITEM_CATALOG)){
  if(d.retired)continue;
  if(d.kind==='material'){assert.equal(ITEM_INFO[id],undefined,id+': Material braucht keinen info-Block');continue;}
  const info=describeItem(id);
  assert.ok(info,id+': ohne info');
  assert.ok(info.effect.length>=20&&info.why.length>=20,id+': effect/why zu knapp');
  assert.notEqual(info.effect.trim(),d.description.trim(),id+': effect wiederholt die description');
  assert.ok(info.numbers.length,id+': keine Zahlen');
  assert.ok(info.terms.length,id+': keine Begriffe');
  assert.deepEqual(info,d.info,id+': info am Gegenstand weicht von describeItem() ab');
 }
});

test('die Zahlen im info-Block sind abgeleitet, nicht abgeschrieben', () => {
 for(const [id,d] of Object.entries(ITEM_CATALOG)){
  if(!ITEM_INFO[id])continue;
  const by=Object.fromEntries(itemNumbers(id).map(n=>[n.label,n.value]));
  if(d.heal)assert.equal(by['Leben sofort'],d.heal,id+': heal nicht übernommen');
  if(d.energy)assert.equal(by['Randale sofort'],d.energy,id+': energy nicht übernommen');
  if(d.weapon)assert.equal(by.Waffenschaden,d.weapon.min+'–'+d.weapon.max,id+': Waffenspanne nicht übernommen');
  if(d.stats?.might)assert.equal(by.Wumms,d.stats.might,id+': Wumms nicht übernommen');
  if(d.stats?.stamina)assert.equal(by['Leben daraus'],d.stats.stamina*BALANCE.player.hpPerStamina,id+': Leben aus Standfestigkeit falsch');
  if(d.stats?.finesse)assert.equal(by['Glückstreffer-Chance daraus'],Math.round(ratingShare('crit',d.stats.finesse)*1000)/10,id+': Umrechnung Taktgefühl → Glückstreffer falsch');
 }
 // Die Umrechnung liest BALANCE und nichts anderes: doppelte Wertung ⇒ weniger als doppelter Ertrag.
 const einfach=ratingShare('haste',20),doppelt=ratingShare('haste',40);
 assert.ok(doppelt<einfach*2,'Tempo aus Taktgefühl muss abnehmenden Ertrag zeigen');
 assert.ok(ratingShare('armorRating',100,1)>ratingShare('armorRating',100,10),'Rüstung wirkt auf höherer Stufe schwächer');
});

test('jeder Proc erklärt sich mit Wirkung, Zahl und Zweck', () => {
 for(const id of Object.keys(PROCS)){
  const info=describeProc(id);
  assert.ok(info,id+': Proc ohne info');
  assert.ok(info.numbers.length,id+': Proc ohne Zahl');
  assert.notEqual(info.effect.trim(),PROCS[id].text.trim(),id+': effect wiederholt den Kurztext');
 }
 // Gegenstände mit Proc verweisen darauf.
 for(const [id,d] of Object.entries(ITEM_CATALOG))if(d.proc)assert.ok(ITEM_INFO[id].links.includes(d.proc),id+': verlinkt seinen Proc nicht');
});

test('benutzbar ist genau die Verpflegung – sie darf in die Aktionsleiste', () => {
 for(const [id,d] of Object.entries(ITEM_CATALOG)){
  if(d.kind==='consumable')assert.equal(d.usable,true,id+': Verpflegung ohne usable:true');
  else assert.notEqual(d.usable,true,id+': nur Verpflegung ist benutzbar');
 }
 assert.ok(Object.values(ITEM_CATALOG).filter(d=>d.usable).length>=5,'mindestens die fünf Kioskwaren sind benutzbar');
});

test('alle Begriffe stehen im Glossar, sobald es existiert', async () => {
 let GLOSSARY=null;
 try{({GLOSSARY}=await import('../content/glossary.js'));}catch{/* Klassendesign liefert glossary.js in Welle D nach */}
 if(!GLOSSARY){assert.ok(LOOT_TERMS.length>0,'ohne Glossar wird nur geprüft, dass Loot Begriffe nennt');return;}
 for(const term of LOOT_TERMS)assert.ok(GLOSSARY[term],'Begriff fehlt im Glossar: '+term);
});
