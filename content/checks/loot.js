import {PROFESSION_SOURCES,PROFESSION_RECIPES,PROFESSION_ITEMS} from '../professions.js';
import {SHOP_STOCK} from '../shop.js';
// Prüfungen der Rolle Gegenstände & Loot (items.js, drops.js, equipment.js, item-icons.js, recipes.js).
import {ITEM_CATALOG,PROCS} from '../items.js';
import {ITEM_INFO,PROC_INFO,describeItem,describeProc} from '../item-info.js';
import {DROP_TABLES} from '../drops.js';
import {HOTSPOTS,WORLD_NOTICES} from '../hotspots.js';
import {RECIPES,BENCH_STAGES} from '../recipes.js';
import {BUILDINGS} from '../buildings.js';
import {STORY_CHAPTERS} from '../story.js';
import {LOOT_PREFIXES,LOOT_EPITHETS,LOOT_AFFIX_POOLS,SLOT_GROUPS,ADJECTIVE_ENDINGS,SPEC_SUFFIXES,affixFits} from '../affixes.js';
import {STAT_NAMES,ROLLED_BASES,WEAPON_BASE_NAMES,WEAPON_BASE_GENUS,EQUIPMENT_SLOTS,AFFIXES} from '../equipment.js';
import {FAMILY_TROPHIES} from '../item-icons.js';
import {AFFIX_TUNING} from '../tuning.js';
import {BALANCE} from '../balance.js';
export function check(bad){
 // Jede Dorflegende fällt irgendwo (Beutetabelle) oder ist ausdrücklich Questbelohnung (reward:true).
 const dropped=new Set(Object.values(DROP_TABLES).flatMap(t=>[t.unique,...(t.uniques||[]).map(u=>u.id)])/* weitere Dorflegenden je Tabelle (Big B, Etappe 3) */);
 for(const [id,d] of Object.entries(ITEM_CATALOG))if(d.unique&&!d.retired&&!dropped.has(id)&&!d.reward)bad('item '+id,'Dorflegende ohne Beutetabelle und ohne reward:true');
 // Jedes Material wird irgendwo fallen gelassen oder ist Sammelgut (gather:true).
 const materials=new Set([...[...HOTSPOTS.flatMap(h=>h.quests),...WORLD_NOTICES].map(q=>q.objective.item).filter(Boolean),...Object.values(DROP_TABLES).map(t=>t.material),...Object.values(PROFESSION_SOURCES).flatMap(s=>Object.keys(s.items)),...SHOP_STOCK]);
 for(const [id,d] of Object.entries(ITEM_CATALOG))if(d.kind==='material'&&!materials.has(id)&&!d.gather)bad('item '+id,'Material ohne Beutequelle (drops.js) und ohne gather:true');
 // Jeder Gegenstand mit Bildbedarf hat einen look; Verpflegung nennt die Wirkung im Text.
 for(const [id,d] of Object.entries(ITEM_CATALOG)){if(d.unique&&!d.look)bad('item '+id,'Dorflegende ohne look');if(d.kind==='consumable'&&!/\d/.test(d.description))bad('item '+id,'Verpflegungstext nennt keine Zahl');}
 // Kiosk: Verpflegung mit Preis hat einen ganzzahligen Markenpreis über dem halben Verkaufswert (sonst lohnt Kaufen-und-Verkaufen).
 for(const [id,d] of Object.entries(ITEM_CATALOG))if(d.price!==undefined){if(d.kind!=='consumable'&&!(PROFESSION_ITEMS[id]?.kind==='material'&&SHOP_STOCK.includes(id)))bad('item '+id,'price nur bei Verpflegung (Marken kaufen keine Ausrüstung)');if(!(Number.isInteger(d.price)&&d.price>0))bad('item '+id,'price muss eine ganze Zahl > 0 sein');if(d.price<=Math.floor((d.value||0)/2))bad('item '+id,'price unter dem Verkaufserlös – Kaufen und Verkaufen wäre ein Gelddrucker');}
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
 // --- Welle D: benutzbare Gegenstände dürfen in die Aktionsleiste. Heute ist das genau die Verpflegung. ---
 for(const [id,d] of Object.entries(ITEM_CATALOG)){if(d.kind==='consumable'&&d.usable!==true)bad('item '+id,'Verpflegung ohne usable:true – sie käme nicht in die Aktionsleiste');
  if(d.usable&&d.kind!=='consumable')bad('item '+id,'usable nur bei Verpflegung: Ausrüstung und Material werden nicht „benutzt“');}
 // --- Welle D: Beschreibungs-Standard info {effect,numbers,why,links,terms} ---
 const known=new Set([...Object.keys(ITEM_CATALOG),...Object.keys(PROCS),...Object.keys(BUILDINGS)]);
 const infoBlock=(w,info,self)=>{
  if(!info){bad(w,'info fehlt (Beschreibungs-Standard Welle D)');return;}
  for(const k of ['effect','why'])if(typeof info[k]!=='string'||info[k].trim().length<20)bad(w,'info.'+k+' fehlt oder ist zu knapp');
  if(!Array.isArray(info.numbers)||!info.numbers.length)bad(w,'info.numbers leer – jedes Element nennt, was um wie viel steigt');
  for(const n of info.numbers||[]){
   if(!n.label)bad(w,'numbers-Zeile ohne label');
   if(!(typeof n.value==='number'||typeof n.value==='string'&&n.value))bad(w,'numbers-Zeile „'+n.label+'“ ohne Wert');
   if(typeof n.unit!=='string')bad(w,'numbers-Zeile „'+n.label+'“ ohne unit (leer erlaubt)');
   if(!n.source)bad(w,'numbers-Zeile „'+n.label+'“ ohne source – die Zahl muss aus den Daten stammen');}
  const labels=(info.numbers||[]).map(n=>n.label);
  if(new Set(labels).size!==labels.length)bad(w,'doppelte Zeile in numbers');
  if(!Array.isArray(info.links))bad(w,'info.links fehlt');
  for(const l of info.links||[]){if(l===self)bad(w,'links zeigt auf sich selbst');if(!known.has(l))bad(w,'link unbekannt: '+l);}
  if(!Array.isArray(info.terms)||!info.terms.length)bad(w,'info.terms leer – jedes Element nennt seine Fachbegriffe');
  for(const t of info.terms||[])if(typeof t!=='string'||!/^[a-z][a-zA-Z0-9-]*$/.test(t))bad(w,'Begriffs-ID ungültig: '+t);
  if(new Set(info.terms||[]).size!==(info.terms||[]).length)bad(w,'doppelter Begriff in terms');};
 // Ausrüstung und Verpflegung tragen info; Material braucht keine (es hat keine Wirkung im Kampf).
 for(const [id,d] of Object.entries(ITEM_CATALOG)){if(d.retired||d.kind==='material')continue;
  if(!ITEM_INFO[id]){bad('item '+id,'ohne info in content/item-info.js (Ausrüstung und Verpflegung brauchen den Block)');continue;}
  infoBlock('item '+id,describeItem(id),id);
  if(ITEM_INFO[id].effect.trim()===(d.description||'').trim())bad('item '+id,'info.effect wiederholt nur die description');
  if(d.unique&&!ITEM_INFO[id].terms.includes('dorflegende'))bad('item '+id,'Dorflegende ohne Begriff „dorflegende“ in terms');
  if(d.proc&&!ITEM_INFO[id].links.includes(d.proc))bad('item '+id,'Gegenstand mit Proc verlinkt seinen Proc nicht: '+d.proc);}
 // Jeder Proc erklärt sich selbst.
 for(const id of Object.keys(PROCS)){if(!PROC_INFO[id]){bad('proc '+id,'ohne info in content/item-info.js');continue;}
  infoBlock('proc '+id,describeProc(id),id);
  if(PROC_INFO[id].effect.trim()===PROCS[id].text.trim())bad('proc '+id,'info.effect wiederholt nur den text');}
 // --- Zusätze gewürfelter Beute (E-40, content/affixes.js) ---
 const T=AFFIX_TUNING,QUAL=Object.keys(BALANCE.items.quality),groups=Object.keys(SLOT_GROUPS),seen=new Set();
 for(const kind of Object.keys(LOOT_AFFIX_POOLS)){if(!(T.share[kind]>0&&T.share[kind]<=.15))bad('AFFIX_TUNING.share.'+kind,'Budgetanteil je Zusatz muss in (0, 0,15] liegen');}
 if(T.share.prefix+T.share.epithet>T.maxGain+1e-9)bad('AFFIX_TUNING','Vorsilbe + Beiname sprengen maxGain – ein epischer Doppelzusatz darf das Grundbudget höchstens um maxGain heben');
 if(!(T.maxGain>0&&T.maxGain<=.25))bad('AFFIX_TUNING.maxGain','Rahmen muss klein bleiben (≤ 25 % des Grundbudgets)');
 if(!(T.uncommonChance>=0&&T.uncommonChance<=1))bad('AFFIX_TUNING.uncommonChance','muss eine Wahrscheinlichkeit sein');
 for(const k of Object.keys(STAT_NAMES))if(!(T.rate[k]>0))bad('AFFIX_TUNING.rate','Punkte je Budgetpunkt fehlen für '+k);
 for(const spec of Object.keys(AFFIXES))if(!SPEC_SUFFIXES[spec])bad('SPEC_SUFFIXES','Nachsatz fehlt für '+spec);
 const slotsInGroups=Object.values(SLOT_GROUPS).flat();
 for(const slot of Object.keys(ROLLED_BASES)){if(slotsInGroups.filter(s=>s===slot).length!==1)bad('SLOT_GROUPS','Platz '+slot+' muss in genau einer Slotgruppe stehen');if(!ADJECTIVE_ENDINGS[ROLLED_BASES[slot][2]])bad('ROLLED_BASES.'+slot,'Genus (m/f/n/p) fehlt – deklinierte Vorsilben brauchen es');}
 for(const type of Object.keys(WEAPON_BASE_NAMES))if(!ADJECTIVE_ENDINGS[WEAPON_BASE_GENUS[type]])bad('WEAPON_BASE_GENUS.'+type,'Genus (m/f/n/p) fehlt');
 for(const [family,t] of Object.entries(FAMILY_TROPHIES))if(!ADJECTIVE_ENDINGS[t[2]])bad('FAMILY_TROPHIES.'+family,'Genus (m/f/n/p) fehlt');
 if(LOOT_PREFIXES.length<40)bad('LOOT_PREFIXES','mindestens 40 Vorsilben, sonst wiederholen sich die Fundstücke');
 if(LOOT_EPITHETS.length<40)bad('LOOT_EPITHETS','mindestens 40 Beinamen, sonst wiederholen sich die Fundstücke');
 for(const [kind,pool] of Object.entries(LOOT_AFFIX_POOLS)){const labels=new Set();
  for(const a of pool){const w='affix '+a.id;
   if(!/^[a-z][a-z0-9-]*$/.test(a.id||''))bad(w,'id ungültig');
   if(seen.has(a.id))bad(w,'id doppelt (eindeutig über beide Pools)');seen.add(a.id);
   const forms=['stem','fixed','text'].filter(k=>a[k]);
   if(forms.length!==1)bad(w,'genau eine Namensform: stem, fixed oder text');
   if(kind==='prefix'&&a.text)bad(w,'Vorsilben brauchen stem oder fixed');
   if(kind==='epithet'&&!a.text)bad(w,'Beinamen brauchen text');
   if(a.fixed&&!a.fixed.endsWith('-'))bad(w,'fixed endet mit Bindestrich („Kirmes-“)');
   if(a.stem&&/(e|er|es|-)$/.test(a.stem)&&!/(iert|elt|ert)$/.test(a.stem))bad(w,'stem ist der ungebeugte Stamm ohne Endung: '+a.stem);
   if(a.text&&!/^[a-zäöü]/.test(a.text))bad(w,'Beiname beginnt klein (steht mitten im Namen)');
   const label=a.stem||a.fixed||a.text;if(labels.has(label))bad(w,'Name doppelt: '+label);labels.add(label);
   if(label.length>30)bad(w,'Name länger als 30 Zeichen – der Tooltip-Kopf läuft über');
   if(!(Number.isInteger(a.minLevel)&&Number.isInteger(a.maxLevel)&&a.minLevel>=1&&a.maxLevel<=BALANCE.maxLevel&&a.minLevel<=a.maxLevel))bad(w,'Stufenband außerhalb 1–'+BALANCE.maxLevel);
   if(!Array.isArray(a.slots)||!a.slots.length||a.slots.some(g=>g!=='alle'&&!groups.includes(g)))bad(w,'slots: nur Slotgruppen oder „alle“');
   if(!Array.isArray(a.qualities)||!a.qualities.length||a.qualities.some(q=>!QUAL.includes(q)))bad(w,'qualities: nur bekannte Güten');
   const parts=Object.entries(a.stats||{});
   if(parts.length<1||parts.length>2)bad(w,'1–2 Werte je Zusatz');
   for(const [k,v] of parts){if(!STAT_NAMES[k])bad(w,'unbekannter Wert: '+k);if(!(v>=.25&&v<=1))bad(w,'Anteil '+k+' außerhalb 0,25–1');}
   if(Math.abs(parts.reduce((n,[,v])=>n+v,0)-1)>1e-9)bad(w,'Anteile müssen zusammen 1 ergeben (das Zusatzbudget wird verteilt, nicht vergrößert)');}
  // Stufenbänder lückenlos: jeder Platz findet auf jeder Stufe und in jeder Güte mindestens drei passende Zusätze je Art.
  for(const slot of Object.keys(ROLLED_BASES))for(const q of QUAL)for(let level=1;level<=BALANCE.maxLevel;level++){const n=pool.filter(a=>affixFits(a,slot,level,q)).length;if(n<3)bad('affix '+kind,'Lücke: '+slot+' · Stufe '+level+' · '+q+' hat nur '+n+' passende Zusätze');}}
 for(const slot of Object.keys(ROLLED_BASES))if(!EQUIPMENT_SLOTS[slot]&&!['ring','trinket','charm'].includes(slot))bad('ROLLED_BASES.'+slot,'unbekannter Ausrüstungsplatz');
 // Kein totes Material: jedes Material muss irgendwo verbraucht oder gesucht werden.
 const used=new Set(Object.values(PROFESSION_RECIPES).flatMap(r=>Object.keys(r.materials)));
 for(const r of Object.values(RECIPES))for(const item of Object.keys(r.input||{}))used.add(item);
 for(const t of Object.values(DROP_TABLES))used.add(t.material);
 for(const b of Object.values(BUILDINGS))for(const s of b.stages||[])for(const item of Object.keys(s.cost||{}))used.add(item);
 for(const c of STORY_CHAPTERS)for(const o of c.objectives||[])if(o.kind==='gather'&&o.item)used.add(o.item);
 // Questgegenstände der Startreihe und der Aushänge werden bei der Abgabe eingezogen (E-55).
 for(const q of [...HOTSPOTS.flatMap(h=>h.quests),...WORLD_NOTICES])if(q.objective.item)used.add(q.objective.item);
 for(const [id,d] of Object.entries(ITEM_CATALOG))if(d.kind==='material'&&!d.retired&&!used.has(id))bad('item '+id,'totes Material: kommt in keinem Rezept, keiner Beutetabelle, keinem Sammelziel und keinem Basisbau vor');
}
