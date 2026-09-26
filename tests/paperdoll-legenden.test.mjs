// Dorflegenden aus Schloss Big B an der Anziehpuppe (tools/paperdoll/familien.mjs → Laufzeit-Bögen): Pelzmantel des Barons, Hochglanz-Exposé,
// Korkenzieher des Kellermeisters (auch links als _nh), Ringlicht der Reichweite, das vordere Hufeisen – und die Kegelkugel blau marmoriert
// wie ihr Symbol. Jede Kennung hat eine eigene Quelle (statt Familie: Festtagsjacke, Zeltplatz-Schild, Dosenklinge oder gar nichts), Bögen in
// allen Richtungen und Archetypen, ist sichtbar und richtig eingeordnet.
// PAPERDOLL_RT (oder PAPERDOLL_RUNTIME)=<ordner> prüft einen Probebau statt assets/paperdoll/runtime.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {GEAR,HAND_F} from '../tools/paperdoll/puppe.mjs';
import {paperdollSources,paperdoll} from '../paperdoll-art.js';
import {equipmentAppearance} from '../equipment-appearance.js';
import {compatibleSlots} from '../equipment.js';
import {ITEM_CATALOG} from '../content/index.js';
import {sheetReader} from './paperdoll-sheet.mjs';

const PROBE=process.env.PAPERDOLL_RT||process.env.PAPERDOLL_RUNTIME,RT=PROBE?pathToFileURL(resolve(PROBE)+'/'):new URL('../assets/paperdoll/runtime/',import.meta.url);
const cat=JSON.parse(readFileSync(new URL('catalog.json',RT),'utf8')),sheets=sheetReader(RT,cat);
const MANTEL='pelzmantel-baron',EXPOSE='hochglanz-expose',KORKEN='korkenzieher-kellermeister',TALISMANE=['ringlicht-reichweite','halbes-hufeisen','kegelkugel'];
const QUELLEN=[MANTEL,EXPOSE,KORKEN,KORKEN+'_nh',...TALISMANE],ARCHS=Object.keys(cat.archetypes),DIRS=Object.keys(cat.dirs);
const at=(anim,i=0)=>cat.frames.findIndex(f=>f.anim===anim&&(f.i||0)===i);
/** Pixel wie das Spiel sie zeigt: sw/ne ohne eigenen Bogen = gespiegeltes se/nw (paperdoll-art.js baseDir). */
const own=(src,dir,f)=>dir==='se'||dir==='nw'||cat.own[dir]?.includes(src)||(f>=cat.split&&cat.ownAkt?.[dir]?.includes(src));
const px=(src,arch,dir,f)=>cat.sources[src].bands.flatMap(b=>own(src,dir,f)?sheets.pixels(src,arch,dir,b,f):sheets.pixels(src,arch,dir==='sw'?'se':'nw',b,f).map(([x,y,...c])=>[cat.W-1-x,y,...c]));
const STAND=[at('stehen'),at('laufen',2),at('laufen',6)];

test('Werkzeug: Kennungen mit Platz, Händigkeit und Nebenhand-Fassung', ()=>{
 assert.equal(GEAR[MANTEL]?.slot,'body');assert.ok(GEAR[MANTEL].armVorn&&GEAR[MANTEL].armHinten&&GEAR[MANTEL].rumpf,'Mantel mit Ärmeln und Rumpf');
 assert.equal(GEAR[EXPOSE]?.slot,'offhand');assert.ok(!GEAR[EXPOSE].hands,'Exposé ist Schild (Nebenhand ohne Hände)');
 assert.equal(GEAR[KORKEN]?.slot,'weapon');assert.equal(GEAR[KORKEN].hands,1);assert.equal(GEAR[KORKEN+'_nh']?.slot,'offhand');assert.equal(GEAR[KORKEN+'_nh'].hands,1);
 for(const id of TALISMANE)assert.equal(GEAR[id]?.slot,'charm',id);
});

test('Katalog: eigene Quelle je Legende, Bögen in allen Richtungen und Archetypen', ()=>{
 for(const id of QUELLEN){const s=cat.sources[id];assert.ok(s,id+': Quelle fehlt im Katalog (Laufzeit neu bauen)');assert.equal(s.slot,GEAR[id].slot,id);
  if(!/_nh$/.test(id))assert.equal(cat.items[id],id,id+': Gegenstand → eigene Quelle');
  for(const arch of ARCHS)for(const dir of DIRS){const mir=dir==='sw'||dir==='ne';
   if(!mir||cat.own[dir].includes(id))assert.ok(sheets.has(id,arch,dir,0),sheets.file(id,arch,dir,0)+' fehlt');
   if(mir)assert.ok(cat.ownAkt[dir].includes(id),`${id}: eigener ${dir}-Aktionsbogen`);
   assert.ok(sheets.has(id,arch,dir,cat.split),sheets.file(id,arch,dir,cat.split)+' fehlt');}}
 assert.deepEqual(cat.sources[EXPOSE].bands,['armVorn'],'Schild liegt vorn (wie Topfdeckel)');
 for(const id of [KORKEN,KORKEN+'_nh'])assert.ok(cat.sources[id].bands.includes('armVorn')&&cat.sources[id].bands.includes(HAND_F),id+': nahe Hand vorn, ferne Hand im Band '+HAND_F);
 for(const b of ['armHinten','rumpf','armVorn'])assert.ok(cat.sources[MANTEL].bands.includes(b),'Mantel: Band '+b);
 for(const id of ['ringlicht-reichweite','halbes-hufeisen','kegelkugel'])for(const d of ['sw','ne'])assert.ok(cat.own[d].includes(id),`${id}: seitengebunden (Gürtelseite), eigener ${d}-Bogen`);
});

test('Sichtbar: Mantel und Schild in jeder Richtung, Waffe mit Faust am Griff, Talismane vorn am Gürtel', ()=>{
 for(const arch of ARCHS)for(const dir of DIRS)for(const f of STAND){const tag=`${arch} ${dir} ${cat.frames[f].anim}:${cat.frames[f].i}`;
  assert.ok(px(MANTEL,arch,dir,f).length>2500,`${MANTEL} ${tag}: Mantel zu klein`);
  const e=px(EXPOSE,arch,dir,f),[ox,oy]=cat.anchors[arch][dir][f].o;assert.ok(e.length>300,`${EXPOSE} ${tag}: Mappe kaum sichtbar`);assert.ok(e.some(([x,y])=>Math.hypot(x+.5-ox,y+.5-oy)<5),`${EXPOSE} ${tag}: nicht in der Nebenhand`);
  for(const [id,a] of [[KORKEN,'w'],[KORKEN+'_nh','o']]){const k=px(id,arch,dir,f),[hx,hy]=cat.anchors[arch][dir][f][a],d=([x,y])=>Math.hypot(x+.5-hx,y+.5-hy);
   assert.ok(k.filter(q=>d(q)<=6).length>=20,`${id} ${tag}: keine Faust am Griff`);assert.ok(k.filter(q=>d(q)>10).length>=80,`${id} ${tag}: Messer kaum sichtbar`);}
  if(dir==='se'||dir==='sw')for(const id of TALISMANE)assert.ok(px(id,arch,dir,f).length>=60,`${id} ${tag}: am Gürtel kaum sichtbar`);}
});

test('Kegelkugel ist blau marmoriert wie ihr Symbol (nicht mehr schwarz), Mantel nerzbraun mit weißem Kragen und violettem Futter', ()=>{
 for(const arch of ARCHS){const k=px('kegelkugel',arch,'se',0),blue=k.filter(([,,r,g,b])=>b>r+30&&b>g+10).length;assert.ok(blue/k.length>.5,`kegelkugel-${arch}: nur ${(blue/k.length*100).toFixed(0)} % blau`);
  const m=px(MANTEL,arch,'se',0),braun=m.filter(([,,r,g,b])=>r>g+15&&g>b&&r<220).length,weiss=m.filter(([,,r,g,b])=>r>200&&g>190&&b>170).length,violett=m.filter(([,,r,g,b])=>b>g+30&&r>g+10).length;
  assert.ok(braun/m.length>.5,`Mantel-${arch}: zu wenig Nerzbraun`);assert.ok(weiss>80,`Mantel-${arch}: Hermelinkragen fehlt`);assert.ok(violett>40,`Mantel-${arch}: violettes Futter fehlt`);}
});

test('Spiel-Einordnung: eigene Quellen statt Familie, Korkenzieher links als _nh, Exposé als Schild mit Schildfaust', ()=>{
 paperdoll.catalog=cat;const reg={...ITEM_CATALOG,handschuh:{slot:'hands'}},src=eq=>paperdollSources(equipmentAppearance(eq,reg));
 for(const id of [MANTEL,EXPOSE,KORKEN,...TALISMANE])assert.ok(ITEM_CATALOG[id],id+': Gegenstand fehlt im Inhalt');
 assert.deepEqual(compatibleSlots(ITEM_CATALOG[KORKEN]),['weapon','offhand']);assert.ok(ITEM_CATALOG[EXPOSE].shield,'Exposé ist Schild');
 const a=src({body:MANTEL,weapon:KORKEN,offhand:EXPOSE,hands:'handschuh',trinket1:'ringlicht-reichweite',trinket2:'halbes-hufeisen'});
 for(const id of [MANTEL,KORKEN,EXPOSE,'ringlicht-reichweite','halbes-hufeisen'])assert.ok(a.has(id),id+' an der Figur');
 for(const id of ['festtagsjacke','zeltplatzschild','dosenklinge','clanandenken'])assert.ok(!a.has(id),id+': keine Familien-Ersatzzeichnung mehr');
 assert.ok(a.has('grillhandschuhe_faust'),'Handschuh über der Schildfaust des Exposés');
 assert.ok(src({weapon:'rohrzange',offhand:KORKEN}).has(KORKEN+'_nh'),'Korkenzieher in der Nebenhand');
 assert.ok(src({trinket1:'kegelkugel'}).has('kegelkugel'));
});

test('Bildfläche: jede Legende mit mindestens 12 px Rand (Zelle = Hülle aller Bilder)', ()=>{
 for(const id of QUELLEN){const c=cat.sources[id].cell,frei={links:c.x,oben:c.y,rechts:cat.W-c.x-c.w,unten:cat.H-c.y-c.h};
  for(const [k,v] of Object.entries(frei))assert.ok(v>=12,`${id}: Rand ${k} nur ${v} px (Zelle ${JSON.stringify(c)})`);}
});
