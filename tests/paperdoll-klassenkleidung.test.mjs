// E-72 Runde 3 und 6 (Entwurf Figuren): Klassenkleidung vom Kleiderhaufen als Anziehpuppen-Quellen (tools/paperdoll/klassen-kleidung.mjs).
// Jede Hofprobe-Kleidung hat für alle drei Körper und alle Richtungen Bögen, seitengebundene Teile (Tuch, Brusttasche, Putzspray, Pömpel)
// eigene sw/ne-Bögen, und die Schichtung stimmt: Mütze verdrängt den Dutt, Lesebrille (Hals) und Annis Sonnenbrille (Kopf, dutt:true) nicht.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {ITEM_CATALOG,TUTORIAL,CLASS_CLOTHES,CLAN_MEMBERS} from '../content/index.js';
import {equipmentAppearance} from '../equipment-appearance.js';
import {paperdollSources,lookSources,paperdoll} from '../paperdoll-art.js';
import {sources} from '../paperdoll-kern.js';
import {sheetReader} from './paperdoll-sheet.mjs';

const PROBE=process.env.PAPERDOLL_RT||process.env.PAPERDOLL_RUNTIME,RT=PROBE?pathToFileURL(resolve(PROBE)+'/'):new URL('../assets/paperdoll/runtime/',import.meta.url);
const cat=JSON.parse(readFileSync(new URL('catalog.json',RT),'utf8'));
const IDS=['grillschuerze','schorschmuetze','kaethestrickjacke','kaethebrille','annischuerze','annibrille','kevinweste','kevinguertel'];
const SIDED=['grillschuerze','kaethestrickjacke','annischuerze','kevinweste','kevinguertel'];

test('Klassenkleidung: jede Quelle mit Bögen für alle Körper und Richtungen, seitengebundene Teile mit eigenem sw/ne-Bogen',()=>{
 for(const id of IDS){const s=cat.sources[id];assert.ok(s,id+': Quelle fehlt im Katalog');assert.equal(cat.items[id],id);assert.equal(s.slot,ITEM_CATALOG[id].slot,id+': Platz wie im Gegenstand');
  for(const arch of Object.keys(cat.archetypes))for(const [dir,suf] of Object.entries(cat.dirs)){if((dir==='sw'||dir==='ne')&&!cat.own[dir].includes(id))continue;
   assert.ok(existsSync(new URL(`${id}-${arch}${suf}.png`,RT)),`${id}-${arch}${suf}.png fehlt`);assert.ok(existsSync(new URL(`${id}-${arch}${suf}-akt.png`,RT)),`${id}-${arch}${suf}-akt.png fehlt`);}}
 for(const id of SIDED)for(const dir of ['sw','ne'])assert.ok(cat.own[dir].includes(id),id+': eigener '+dir+'-Bogen (Seitenregel)');
 assert.deepEqual(cat.sources.grillschuerze.bands.sort(),['haarHinten','rumpf'],'Schürze: Rock hinten ganz hinten, sonst Rumpf');
 assert.ok(cat.sources.kaethestrickjacke.bands.includes('armVorn')&&cat.sources.kaethestrickjacke.bands.includes('armHinten'),'Strickjacke hat Ärmel');
 assert.deepEqual(cat.sources.kaethebrille.bands,['kopf']);
 assert.deepEqual([...cat.sources.annischuerze.bands].sort(),['armHinten','armVorn','rumpf'],'Annis Schürze: Puffärmel der Bluse und Rumpf');
 assert.deepEqual(cat.sources.annibrille.bands,['kopf']);assert.deepEqual(cat.sources.kevinweste.bands,['rumpf'],'Weste ohne Ärmel');
 assert.deepEqual([...cat.sources.kevinguertel.bands].sort(),['haarHinten','rumpf'],'Werkzeuggürtel: Pömpel von vorn hinter der Figur, sonst Rumpf');
});

test('Klassenkleidung: jede Klasse außer Dieter trägt nach der Hofprobe eigene Kleidung statt der Kutte',()=>{
 paperdoll.catalog=cat;
 assert.deepEqual(Object.keys(CLASS_CLOTHES).sort(),CLAN_MEMBERS.map(m=>m.id).filter(id=>id!=='dieter').sort(),'Eintrag für jede Klasse außer Dieter (Kutte)');
 for(const [cls,slots] of Object.entries(CLASS_CLOTHES)){const eq={...TUTORIAL.starterEquipment,...slots},items=equipmentAppearance(eq,ITEM_CATALOG),set=paperdollSources(items);
  assert.ok(ITEM_CATALOG[slots.body]?.slot==='body',cls+': Brustteil ersetzt die Kutte');
  for(const [slot,id] of Object.entries(slots)){assert.equal(ITEM_CATALOG[id]?.slot,slot,cls+': '+id+' passt in '+slot);assert.ok(set.has(id),cls+': '+id+' wird gezeichnet');}
  assert.ok(!set.has('kutte'),cls+': keine Kutte');
  // Werte wie Schorsch/Käthe: Brustteil = Kutte (1 Dicke Haut), dazu genau ein Punkt im Zusatzteil
  assert.deepEqual(ITEM_CATALOG[slots.body].stats,ITEM_CATALOG.kutte.stats,cls+': Brustteil wie die Kutte');
  for(const [slot,id] of Object.entries(slots))if(slot!=='body')assert.equal(Object.values(ITEM_CATALOG[id].stats).reduce((a,b)=>a+b,0),1,cls+': '+id+' gibt genau einen Punkt');}
});

test('Klassenkleidung: Schichtung – Mütze verdrängt den Dutt, Lesebrille und Annis Sonnenbrille nicht',()=>{
 paperdoll.catalog=cat;
 const schorsch=sources(paperdollSources(equipmentAppearance({body:'grillschuerze',head:'schorschmuetze'},ITEM_CATALOG)),cat.sources);
 assert.ok(!schorsch.includes('dutt'),'Mütze deckt den Scheitel');
 const kaethe=sources(paperdollSources(equipmentAppearance({body:'kaethestrickjacke',neck:'kaethebrille'},ITEM_CATALOG)),cat.sources);
 assert.ok(kaethe.includes('dutt'),'Lesebrille lässt den Dutt stehen');assert.ok(kaethe.indexOf('kaethebrille')>kaethe.indexOf('kaethestrickjacke'),'Brille/Kette über der Jacke');
 assert.equal(cat.sources.annibrille.dutt,true,'Katalog: Sonnenbrille lässt den Dutt stehen');assert.ok(cat.openHead.includes('annibrille'),'Katalog: Sonnenbrille lässt den Scheitel offen');
 const anni=sources(paperdollSources(equipmentAppearance({body:'annischuerze',head:'annibrille'},ITEM_CATALOG)),cat.sources);
 assert.ok(anni.includes('dutt'),'Sonnenbrille im Haar: Dutt bleibt');assert.ok(anni.indexOf('annibrille')>anni.indexOf('dutt'),'Brille über dem Haar');
 assert.ok(lookSources({style:'natur',face:'ohne',beard:'natur'},equipmentAppearance({head:'annibrille'},ITEM_CATALOG)).length===0);
 const kevin=sources(paperdollSources(equipmentAppearance({body:'kevinweste',waist:'kevinguertel'},ITEM_CATALOG)),cat.sources);
 assert.ok(kevin.indexOf('kevinguertel')>kevin.indexOf('kevinweste'),'Gürtel über der Weste');
});

test('Klassenkleidung: Vorderansicht zeigt die eigene Farbe (Schürze dunkel, Strickjacke lila, Karo blau-weiß, Weste petrol) – in jedem Körper',()=>{
 const R=sheetReader(RT,cat);
 for(const arch of Object.keys(cat.archetypes)){const C=cat.anchors[arch].se[0].c;
  const near=(id,band)=>R.pixels(id,arch,'se',band,0).filter(([x,y])=>x>=C[0]-8&&x<=C[0]&&y>=C[1]+14&&y<=C[1]+30);
  const dark=near('grillschuerze','rumpf').filter(([,,r,g,b])=>r+g+b<300).length;assert.ok(dark>=40,arch+': Schürze deckt die Brust dunkel ('+dark+')');
  const lila=near('kaethestrickjacke','rumpf').filter(([,,r,g,b])=>b>g+20&&r>g+10).length;assert.ok(lila>=40,arch+': Strickjacke lila auf der Brust ('+lila+')');
  const karo=near('annischuerze','rumpf'),blau=karo.filter(([,,r,,b])=>b>r+40).length,weiss=karo.filter(([,,r,g,b])=>r>200&&g>200&&b>200).length;
  assert.ok(blau>=20&&weiss>=8,arch+': Latz blau-weiß kariert ('+blau+'/'+weiss+')');
  const petrol=near('kevinweste','rumpf').filter(([,,r,g,b])=>g>r+25&&b>r+15).length;assert.ok(petrol>=30,arch+': Weste petrol ('+petrol+')');
  // Rock bis über die Oberschenkel, Bluse orange an den Puffärmeln
  assert.ok(R.pixels('annischuerze',arch,'se','rumpf',0).filter(([,y])=>y>=C[1]+60).length>=40,arch+': Rock reicht bis zum Knie');
  assert.ok(R.pixels('annischuerze',arch,'se','armVorn',0).filter(([,,r,g,b])=>r>200&&g>80&&g<190&&b<110).length>=25,arch+': orange Puffärmel');
  // Pömpel: rote Saugglocke über der Schulter (von vorn hinter der Figur, von hinten auf dem Rücken)
  const rot=(dir,band)=>R.pixels('kevinguertel',arch,dir,band,0).filter(([,y,r,g,b])=>y<C[1]-12&&r>140&&g<90&&b<90).length;
  assert.ok(rot('se','haarHinten')>=20,arch+': Pömpel über der Schulter ('+rot('se','haarHinten')+')');assert.ok(rot('nw','rumpf')>=20,arch+': Pömpel auf dem Rücken');}
});
