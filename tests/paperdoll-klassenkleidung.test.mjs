// E-72 Runde 3 (Entwurf Figuren): Klassenkleidung vom Kleiderhaufen als Anziehpuppen-Quellen (tools/paperdoll/klassen-kleidung.mjs).
// Jede Hofprobe-Kleidung hat für alle drei Körper und alle Richtungen Bögen, seitengebundene Teile (Tuch, Brusttasche) eigene sw/ne-Bögen,
// und die Schichtung stimmt: Mütze verdrängt den Dutt, die Lesebrille (Hals) nicht.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {ITEM_CATALOG,TUTORIAL,CLASS_CLOTHES} from '../content/index.js';
import {equipmentAppearance} from '../equipment-appearance.js';
import {paperdollSources,paperdoll} from '../paperdoll-art.js';
import {sources} from '../paperdoll-kern.js';
import {sheetReader} from './paperdoll-sheet.mjs';

const PROBE=process.env.PAPERDOLL_RT||process.env.PAPERDOLL_RUNTIME,RT=PROBE?pathToFileURL(resolve(PROBE)+'/'):new URL('../assets/paperdoll/runtime/',import.meta.url);
const cat=JSON.parse(readFileSync(new URL('catalog.json',RT),'utf8'));
const IDS=['grillschuerze','schorschmuetze','kaethestrickjacke','kaethebrille'];

test('Klassenkleidung: jede Quelle mit Bögen für alle Körper und Richtungen, Tuch und Brusttasche seitengebunden',()=>{
 for(const id of IDS){const s=cat.sources[id];assert.ok(s,id+': Quelle fehlt im Katalog');assert.equal(cat.items[id],id);
  for(const arch of Object.keys(cat.archetypes))for(const [dir,suf] of Object.entries(cat.dirs)){if((dir==='sw'||dir==='ne')&&!cat.own[dir].includes(id))continue;
   assert.ok(existsSync(new URL(`${id}-${arch}${suf}.png`,RT)),`${id}-${arch}${suf}.png fehlt`);assert.ok(existsSync(new URL(`${id}-${arch}${suf}-akt.png`,RT)),`${id}-${arch}${suf}-akt.png fehlt`);}}
 for(const id of ['grillschuerze','kaethestrickjacke'])for(const dir of ['sw','ne'])assert.ok(cat.own[dir].includes(id),id+': eigener '+dir+'-Bogen (Seitenregel)');
 assert.deepEqual(cat.sources.grillschuerze.bands.sort(),['haarHinten','rumpf'],'Schürze: Rock hinten ganz hinten, sonst Rumpf');
 assert.ok(cat.sources.kaethestrickjacke.bands.includes('armVorn')&&cat.sources.kaethestrickjacke.bands.includes('armHinten'),'Strickjacke hat Ärmel');
 assert.deepEqual(cat.sources.kaethebrille.bands,['kopf']);
});

test('Klassenkleidung: Schichtung – Mütze verdrängt den Dutt, Lesebrille (Hals) nicht; Schürze/Strickjacke ersetzen die Kutte',()=>{
 paperdoll.catalog=cat;
 for(const [cls,slots] of Object.entries(CLASS_CLOTHES)){const eq={...TUTORIAL.starterEquipment,...slots},items=equipmentAppearance(eq,ITEM_CATALOG),set=paperdollSources(items);
  for(const id of Object.values(slots))assert.ok(set.has(id),cls+': '+id+' wird gezeichnet');assert.ok(!set.has('kutte'),cls+': keine Kutte');}
 const schorsch=sources(paperdollSources(equipmentAppearance({body:'grillschuerze',head:'schorschmuetze'},ITEM_CATALOG)),cat.sources);
 assert.ok(!schorsch.includes('dutt'),'Mütze deckt den Scheitel');
 const kaethe=sources(paperdollSources(equipmentAppearance({body:'kaethestrickjacke',neck:'kaethebrille'},ITEM_CATALOG)),cat.sources);
 assert.ok(kaethe.includes('dutt'),'Lesebrille lässt den Dutt stehen');assert.ok(kaethe.indexOf('kaethebrille')>kaethe.indexOf('kaethestrickjacke'),'Brille/Kette über der Jacke');
});

test('Klassenkleidung: Vorderansicht deckt die Brust in der eigenen Farbe (Schürze dunkel, Strickjacke lila) – in jedem Körper',()=>{
 const R=sheetReader(RT,cat);
 for(const arch of Object.keys(cat.archetypes)){const C=cat.anchors[arch].se[0].c;
  const near=(id,band)=>R.pixels(id,arch,'se',band,0).filter(([x,y])=>x>=C[0]-8&&x<=C[0]&&y>=C[1]+14&&y<=C[1]+30);
  const dark=near('grillschuerze','rumpf').filter(([,,r,g,b])=>r+g+b<300).length;assert.ok(dark>=40,arch+': Schürze deckt die Brust dunkel ('+dark+')');
  const lila=near('kaethestrickjacke','rumpf').filter(([,,r,g,b])=>b>g+20&&r>g+10).length;assert.ok(lila>=40,arch+': Strickjacke lila auf der Brust ('+lila+')');}
});
