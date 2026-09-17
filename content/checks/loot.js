// Prüfungen der Rolle Gegenstände & Loot (items.js, drops.js, equipment.js, item-icons.js, recipes.js).
import {ITEM_CATALOG} from '../items.js';
import {DROP_TABLES} from '../drops.js';
import {RECIPES,BENCH_STAGES} from '../recipes.js';
import {BUILDINGS} from '../buildings.js';
import {STORY_CHAPTERS} from '../story.js';
export function check(bad){
 // Jede Dorflegende fällt irgendwo (Beutetabelle) oder ist ausdrücklich Questbelohnung (reward:true).
 const dropped=new Set(Object.values(DROP_TABLES).map(t=>t.unique));
 for(const [id,d] of Object.entries(ITEM_CATALOG))if(d.unique&&!d.retired&&!dropped.has(id)&&!d.reward)bad('item '+id,'Dorflegende ohne Beutetabelle und ohne reward:true');
 // Jedes Material wird irgendwo fallen gelassen oder ist Sammelgut (gather:true).
 const materials=new Set(Object.values(DROP_TABLES).map(t=>t.material));
 for(const [id,d] of Object.entries(ITEM_CATALOG))if(d.kind==='material'&&!materials.has(id)&&!d.gather)bad('item '+id,'Material ohne Beutequelle (drops.js) und ohne gather:true');
 // Jeder Gegenstand mit Bildbedarf hat einen look; Verpflegung nennt die Wirkung im Text.
 for(const [id,d] of Object.entries(ITEM_CATALOG)){if(d.unique&&!d.look)bad('item '+id,'Dorflegende ohne look');if(d.kind==='consumable'&&!/\d/.test(d.description))bad('item '+id,'Verpflegungstext nennt keine Zahl');}
 // Kiosk: Verpflegung mit Preis hat einen ganzzahligen Markenpreis über dem halben Verkaufswert (sonst lohnt Kaufen-und-Verkaufen).
 for(const [id,d] of Object.entries(ITEM_CATALOG))if(d.price!==undefined){if(d.kind!=='consumable')bad('item '+id,'price nur bei Verpflegung (Marken kaufen keine Ausrüstung)');if(!(Number.isInteger(d.price)&&d.price>0))bad('item '+id,'price muss eine ganze Zahl > 0 sein');if(d.price<=Math.floor((d.value||0)/2))bad('item '+id,'price unter dem Verkaufserlös – Kaufen und Verkaufen wäre ein Gelddrucker');}
 // Werkbank-Rezepte: Eingaben sind Material, Ausgabe ist Verpflegung oder Talisman, Werkbankstufe 1–3.
 for(const [id,r] of Object.entries(RECIPES)){const w='recipe '+id;
  if(!r.name||!r.text)bad(w,'name/text fehlt');
  if(!BENCH_STAGES[r.bench])bad(w,'bench muss eine Werkbankstufe 1–3 sein: '+r.bench);
  if(!r.input||!Object.keys(r.input).length)bad(w,'input fehlt');
  for(const [item,n] of Object.entries(r.input||{})){if(ITEM_CATALOG[item]?.kind!=='material')bad(w,'Eingabe ist kein Material: '+item);if(!(Number.isInteger(n)&&n>=1))bad(w,'Eingabemenge '+item+' muss eine ganze Zahl ≥ 1 sein');}
  if(r.coins!==undefined&&!(Number.isInteger(r.coins)&&r.coins>=0))bad(w,'coins muss eine ganze Zahl ≥ 0 sein');
  const out=r.output||{},d=ITEM_CATALOG[out.item];
  if(!d)bad(w,'output unbekannt: '+out.item);
  else{if(!(d.kind==='consumable'||d.slot==='charm'))bad(w,'Werkbank baut nur Verpflegung oder Talismane, nicht '+(d.slot||d.kind)+' ('+out.item+')');
   if(d.unique)bad(w,'Dorflegenden bleiben Beute: '+out.item);}
  if(!(Number.isInteger(out.count)&&out.count>=1))bad(w,'output.count muss eine ganze Zahl ≥ 1 sein');}
 // Kein totes Material: jedes Material muss irgendwo verbraucht oder gesucht werden.
 const used=new Set();
 for(const r of Object.values(RECIPES))for(const item of Object.keys(r.input||{}))used.add(item);
 for(const t of Object.values(DROP_TABLES))used.add(t.material);
 for(const b of Object.values(BUILDINGS))for(const s of b.stages||[])for(const item of Object.keys(s.cost||{}))used.add(item);
 for(const c of STORY_CHAPTERS)for(const o of c.objectives||[])if(o.kind==='gather'&&o.item)used.add(o.item);
 for(const [id,d] of Object.entries(ITEM_CATALOG))if(d.kind==='material'&&!d.retired&&!used.has(id))bad('item '+id,'totes Material: kommt in keinem Rezept, keiner Beutetabelle, keinem Sammelziel und keinem Basisbau vor');
}
