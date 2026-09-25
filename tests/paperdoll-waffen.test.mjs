// Waffenkammer 2026-09-25: acht neue Waffen als Zeichnung an der Anziehpuppe (tools/paperdoll/familien.mjs → Laufzeit-Bögen).
// Jede Kennung hat eine Quelle in allen Richtungen und Archetypen, ist im Stand und in jedem Aktionsbild sichtbar, das das Spiel für sie
// zeigt, liegt mit der Faust am Griffanker, und Zweihand/Schild/Fernkampf sind so eingeordnet, wie paperdoll-art.js sie braucht.
// PAPERDOLL_RT (oder PAPERDOLL_RUNTIME)=<ordner> prüft einen Probebau statt assets/paperdoll/runtime.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {GEAR,HAND_F} from '../tools/paperdoll/puppe.mjs';
import {paperdollSources,paperdollFrameFor,paperdoll} from '../paperdoll-art.js';
import {equipmentAppearance} from '../equipment-appearance.js';
import {compatibleSlots} from '../equipment.js';
import {ITEM_CATALOG} from '../content/index.js';
import {sheetReader} from './paperdoll-sheet.mjs';

const PROBE=process.env.PAPERDOLL_RT||process.env.PAPERDOLL_RUNTIME,RT=PROBE?pathToFileURL(resolve(PROBE)+'/'):new URL('../assets/paperdoll/runtime/',import.meta.url);
const cat=JSON.parse(readFileSync(new URL('catalog.json',RT),'utf8')),sheets=sheetReader(RT,cat);
const EINHAND=['rohrzange','fasskeule','kronkorkenstern','grillzange'],ZWEIHAND=['gartenzwerg'],SCHILD=['masskrugschild'],FERN=['schorlenspritze','blitzschrauber'];
const ALLE=[...EINHAND,...ZWEIHAND,...SCHILD,...FERN],QUELLEN=[...ALLE,...EINHAND.map(id=>id+'_nh')];
const at=(anim,i=0)=>cat.frames.findIndex(f=>f.anim===anim&&(f.i||0)===i);
const name=f=>cat.frames[f].anim+':'+(cat.frames[f].i||0);
/** Bilder, in denen das Spiel die Quelle zeigt (paperdollFrameFor + paperdollSources): Stand/Blinzeln/Laufen immer; Nahkampf nie in
 *  Zielen/Schuss, Zweihand mit hieb2/parade2; Nebenhand wie Einhand; Fernwaffe nur im Fernkampf (Zielen/Schuss, nie im Hieb). */
function shown(id){const s=cat.sources[id],base=[...[0,1,2,3].map(i=>at('stehen',i)),at('blinzeln'),...[0,1,2,3,4,5,6,7].map(i=>at('laufen',i))];
 if(s.slot==='ranged')return [...base,at('zielen'),at('schuss'),at('parade'),at('getroffen'),at('rasten'),at('sprint')];
 const two=s.slot==='weapon'&&s.hands===2;return [...base,...[0,1,2].map(i=>at(two?'hieb2':'hieb',i)),at(two?'parade2':'parade'),at('getroffen'),at('zaubern'),at('rasten'),at('sprint')];}
/** Registrierung wie content/items.js (Waffenart je Familie in equipment-appearance.js) – unabhängig davon, ob der Inhalt schon eingetragen ist. */
const REG={rohrzange:{slot:'weapon',weapon:{type:'club',hands:1}},fasskeule:{slot:'weapon',weapon:{type:'club',hands:1}},kronkorkenstern:{slot:'weapon',weapon:{type:'club',hands:1}},
 grillzange:{slot:'weapon',weapon:{type:'blade',hands:1}},gartenzwerg:{slot:'weapon',weapon:{type:'maul',hands:2}},masskrugschild:{slot:'offhand',shield:true},
 schorlenspritze:{slot:'ranged',weapon:{type:'speaker',hands:0}},blitzschrauber:{slot:'ranged',weapon:{type:'launcher',hands:0}},handschuh:{slot:'hands'}};

test('Werkzeug: Kennungen mit Platz und Händigkeit, Nebenhand-Fassung nur für Einhandwaffen', ()=>{
 for(const id of EINHAND){assert.equal(GEAR[id]?.slot,'weapon',id);assert.equal(GEAR[id].hands,1,id);
  assert.equal(GEAR[id+'_nh']?.slot,'offhand',id+'_nh');assert.equal(GEAR[id+'_nh'].hands,1,id+'_nh: Einhandwaffe links, kein Schild');}
 assert.equal(GEAR.gartenzwerg?.slot,'weapon');assert.equal(GEAR.gartenzwerg.hands,2,'Gartenzwerg ist Zweihänder');
 assert.equal(GEAR.masskrugschild?.slot,'offhand');assert.ok(!GEAR.masskrugschild.hands,'Maßkrug ist Schild (Nebenhand ohne Hände)');
 for(const id of FERN){assert.equal(GEAR[id]?.slot,'ranged',id);assert.equal(GEAR[id].hands,0,id);}
 for(const id of [...ZWEIHAND,...SCHILD,...FERN])assert.ok(!GEAR[id+'_nh'],id+': keine Nebenhand-Fassung (laut Platzregel nicht nebenhandfähig)');
});

test('Katalog: Quelle je Kennung mit Bändern, Bögen für alle Archetypen × Richtungen, eigene sw/ne-Bögen', ()=>{
 for(const id of QUELLEN){const s=cat.sources[id];assert.ok(s,id+': Quelle fehlt im Katalog (Laufzeit neu bauen)');assert.equal(s.slot,GEAR[id].slot,id);assert.equal(s.hands,GEAR[id].hands||0,id);
  if(!/_nh$/.test(id))assert.equal(cat.items[id],id,id+': Gegenstand → Quelle');
  if(s.slot==='offhand'&&!s.hands)assert.deepEqual(s.bands,['armVorn'],id+': Schild liegt vorn (wie Topfdeckel)');
  else assert.ok(s.bands.includes('armVorn')&&s.bands.includes(HAND_F),id+': nahe Hand vorn, ferne Hand im Band '+HAND_F);
  for(const dir of ['sw','ne']){assert.ok(cat.own[dir].includes(id),`${id}: seitengebunden, eigener ${dir}-Grundbogen`);assert.ok(cat.ownAkt[dir].includes(id),`${id}: eigener ${dir}-Aktionsbogen`);}
  for(const arch of Object.keys(cat.archetypes))for(const dir of Object.keys(cat.dirs))assert.ok(sheets.has(id,arch,dir,0)&&sheets.has(id,arch,dir,cat.frames.length-1),`${sheets.file(id,arch,dir,0)} fehlt`);}
});

test('Sichtbar im Stand und in jedem gezeigten Aktionsbild, Faust am Griffanker, Waffe reicht über die Faust hinaus', ()=>{
 for(const id of QUELLEN){const s=cat.sources[id],off=s.slot==='offhand';
  for(const arch of Object.keys(cat.archetypes))for(const dir of Object.keys(cat.dirs))for(const f of shown(id)){const tag=`${id}-${arch} ${dir} ${name(f)}`;
   const px=s.bands.flatMap(b=>sheets.pixels(id,arch,dir,b,f)),[ax,ay]=cat.anchors[arch][dir][f][off?'o':'w'],d=([x,y])=>Math.hypot(x+.5-ax,y+.5-ay);
   assert.ok(px.filter(q=>d(q)<=6).length>=20,`${tag}: keine Faust am Griffanker`);
   assert.ok(px.filter(q=>d(q)>10).length>=60,`${tag}: Waffe kaum sichtbar (${px.filter(q=>d(q)>10).length} px außerhalb der Faust)`);}}
});

test('Gartenzwerg: in der Ruhe aufrecht (Zwerg über der Hand), im Zweihand-Hieb am Schaft mit zweiter Faust', ()=>{
 for(const arch of Object.keys(cat.archetypes))for(const dir of Object.keys(cat.dirs)){
  for(const f of [at('stehen'),at('laufen',2),at('laufen',6)]){const px=cat.sources.gartenzwerg.bands.flatMap(b=>sheets.pixels('gartenzwerg',arch,dir,b,f)),top=Math.min(...px.map(q=>q[1]));
   assert.ok(top<cat.anchors[arch][dir][f].w[1]-45,`${arch} ${dir} ${name(f)}: Zwerg nicht oben (${top} gegen Hand ${cat.anchors[arch][dir][f].w[1]})`);}
  for(const f of [at('hieb2',1),at('parade2')]){const px=cat.sources.gartenzwerg.bands.flatMap(b=>sheets.pixels('gartenzwerg',arch,dir,b,f)),[ox,oy]=cat.anchors[arch][dir][f].o;
   assert.ok(px.filter(([x,y])=>Math.hypot(x+.5-ox,y+.5-oy)<=5).length>=15,`${arch} ${dir} ${name(f)}: zweite Faust fehlt`);}}
});

test('Spiel-Einordnung: Zweihand verdrängt den Schild, Einhand links als _nh, Fernwaffe nur im Fernkampf, Schildfaust mit Handschuh', ()=>{
 paperdoll.catalog=cat;const src=(eq,r=false)=>paperdollSources(equipmentAppearance(eq,REG),r);
 const two=src({weapon:'gartenzwerg',offhand:'masskrugschild'});assert.ok(two.has('gartenzwerg')&&!two.has('masskrugschild'),'Zweihänder belegt beide Hände');
 assert.deepEqual([...src({weapon:'rohrzange',offhand:'grillzange'})].sort(),['grillzange_nh','rohrzange']);
 for(const id of EINHAND)assert.ok(src({weapon:'fasskeule',offhand:id}).has(id+'_nh'),id+' in der Nebenhand');
 const shield=src({weapon:'fasskeule',offhand:'masskrugschild',hands:'handschuh'});assert.ok(shield.has('masskrugschild')&&shield.has('grillhandschuhe_faust'),'Schild: Handschuh über der Schildfaust');
 for(const id of FERN){const eq={weapon:'kronkorkenstern',offhand:'masskrugschild',ranged:id},melee=src(eq),ranged=src(eq,true);
  assert.ok(melee.has('kronkorkenstern')&&melee.has('masskrugschild')&&!melee.has(id),id+': im Nahkampf verstaut');assert.deepEqual([...ranged],[id],id+': im Fernkampf allein in der Hand');}
 const fr=(p,id)=>name(paperdollFrameFor(cat.frames,p,0,{stride:cat.stride||64,items:[{slot:'weapon',hands:cat.sources[id].hands}]}));
 assert.equal(fr({attack:.13},'gartenzwerg'),'hieb2:1');assert.equal(fr({parry:.1},'gartenzwerg'),'parade2:0');
 for(const id of EINHAND){assert.equal(fr({attack:.13},id),'hieb:1');assert.equal(fr({parry:.1},id),'parade:0');}
});

test('Inhalt (content/items.js) passt zur Puppe, sobald die Kennungen eingetragen sind', t=>{
 const da=ALLE.filter(id=>ITEM_CATALOG[id]);if(!da.length){t.skip('Waffen noch nicht im Inhalt');return;}
 const want={...Object.fromEntries(EINHAND.map(id=>[id,['weapon','offhand']])),gartenzwerg:['weapon'],masskrugschild:['offhand'],...Object.fromEntries(FERN.map(id=>[id,['ranged']]))};
 for(const id of da){assert.deepEqual(compatibleSlots(ITEM_CATALOG[id]),want[id],id+': Plätze wie die Puppe');
  for(const slot of want[id]){const [it]=equipmentAppearance({[slot]:id},ITEM_CATALOG);assert.equal(cat.items[it.id],id,id+': feste Kennung vor Familie');}}
 assert.ok(ITEM_CATALOG.masskrugschild?.shield!==false,'Maßkrug ist ein Schild');
});

test('Bildfläche: jede neue Quelle mit mindestens 12 px Rand (Zelle = Hülle aller Bilder)', ()=>{
 for(const id of QUELLEN){const c=cat.sources[id].cell,frei={links:c.x,oben:c.y,rechts:cat.W-c.x-c.w,unten:cat.H-c.y-c.h};
  for(const [k,v] of Object.entries(frei))assert.ok(v>=12,`${id}: Rand ${k} nur ${v} px (Zelle ${JSON.stringify(c)})`);}
});
