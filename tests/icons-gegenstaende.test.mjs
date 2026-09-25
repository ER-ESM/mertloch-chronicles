// Icon-Review R0 (2026-09-25), Familie Gegenstände – Datenseite des Auflösers `itemArt` (rpg-ui.js):
// jede Katalog-Kennung zeigt ein vorhandenes Präzisionsbild ohne Kachelgrund, die 13 Dorflegenden/Seltenen zeigen ihren gear-Zwilling
// (Kennung bleibt Speicherschlüssel, wird Alias), freigestellte Atlas-Motive sind reproduzierbar und konturgeschlossen, es gibt keine
// Doppel-Dateien mehr, und neu gemalte Symbole (icons-uebernehmen.mjs) kommen 1:1 in der Waffen-Palette an.
// Dass alle Aufrufstellen (Chat, Leiste, Beute, Dungeon, Gruppe) `itemArt` benutzen, prüft der Test der Anzeige.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {ITEM_CATALOG,ITEM_ICON_OVERRIDES,ICONS,DETAIL_ICONS,CLASS_BUFFS,TALENT_ROWS,FAMILY_TROPHIES,RESOURCE_SKILLS,TALENT_SKILLS,SPECS} from '../content/index.js';
import {contentArt,contentAsset,contentId} from '../content-art.js';
import {itemArt} from '../rpg-ui.js';
import {decodePng} from '../tools/sprite-pipeline/png.mjs';
import {ZWILLINGE,DOPPEL,RUECKANSICHTEN} from '../tools/sprite-pipeline/items-20260925.mjs';
import {buildFreigestellt,FREISTELLEN_JOBS} from '../tools/sprite-pipeline/freistellen.mjs';
import {checkIcon} from '../tools/sprite-pipeline/icons-uebernehmen.mjs';

const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root));
const catalog=JSON.parse(read('assets/precision/runtime/catalog.json'));
const image=path=>decodePng(read(path)),pixels=path=>createHash('sha256').update(image(path).data).digest('hex');
/** Wie analyse.mjs (Review R0): Kachel = deckende Hülle fast quadratisch, ≥ 80 % der Kante und zu > 92 % gefüllt. */
function tile(im){let x0=im.width,y0=im.height,x1=-1,y1=-1,n=0;for(let y=0;y<im.height;y++)for(let x=0;x<im.width;x++)if(im.data[(y*im.width+x)*4+3]>=128){n++;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 const w=x1-x0+1,h=y1-y0+1;return n/(w*h)>.92&&Math.abs(w-h)<=2&&w>=im.width*.8;}
/** Stilbibel A1: Anteil dunkler Außenkantenpixel (Luminanz < 70). */
function contour(im){let edge=0,dark=0;const A=(x,y)=>x<0||y<0||x>=im.width||y>=im.height?0:im.data[(y*im.width+x)*4+3];
 for(let y=0;y<im.height;y++)for(let x=0;x<im.width;x++){const i=(y*im.width+x)*4;if(!im.data[i+3]||A(x-1,y)&&A(x+1,y)&&A(x,y-1)&&A(x,y+1))continue;edge++;if(.299*im.data[i]+.587*im.data[i+1]+.114*im.data[i+2]<70)dark++;}
 return dark/edge;}
function withCatalog(fn){contentArt.catalog=catalog;for(const id of Object.keys(catalog.assets))contentArt.images.set(id,{id});try{return fn();}finally{contentArt.catalog=null;contentArt.images.clear();}}
/** Bildpfad, den der Rucksack für eine Kennung zeigt (P-A: Kennungsdatei, sonst Symbolwort bzw. Ausrüstungsfamilie). */
const shown=id=>contentAsset(itemArt(id))?.meta.path;
/** Autoangriff-Symbole sind Kniffe (Kachel gewollt) und liegen nur aus Altgründen im Gegenstandsordner. */
const ITEM_ASSETS=Object.entries(catalog.assets).filter(([id,a])=>a.kind==='items'&&!id.startsWith('auto-'));
/** Offene Maler-Aufträge: Kennungen, die sich noch ein Bild teilen dürfen (Gruppen). Seit der Übernahme vom 2026-09-25 leer – neue Doppel
 *  darf es nicht geben; wer einen Auftrag offen lässt, trägt die Gruppe hier ein. */
const OFFEN=[];

test('jede Katalog-Kennung zeigt über itemArt ein vorhandenes Präzisionsbild ohne Kachelgrund',()=>withCatalog(()=>{
 for(const id of Object.keys(ITEM_CATALOG)){const a=contentAsset(itemArt(id));
  assert.ok(a,id+': kein Präzisionsbild für '+itemArt(id));assert.equal(a.meta.kind,'items',id);assert.ok(existsSync(new URL(a.meta.path,root)),id+': Datei fehlt');
  assert.ok(!tile(image(a.meta.path)),id+': Kachelgrund in '+a.meta.path);}
}));

test('kein Gegenstandssymbol trägt eine Atlas-Kachel',()=>{
 for(const [id,a] of ITEM_ASSETS)assert.ok(!tile(image(a.path)),id+': Kachelgrund');
});

test('gear-Zwillinge: Kennung bleibt Speicherschlüssel, Rucksack- und Symbolweg zeigen denselben Zwilling',()=>withCatalog(()=>{
 for(const [id,twin] of Object.entries(ZWILLINGE)){
  assert.ok(ITEM_CATALOG[id],id+' ist Katalog-Kennung');assert.ok(!catalog.assets[id],id+': schwächere Kennungsdatei fällt weg');
  assert.ok(catalog.assets[twin],twin);assert.equal(contentId(id),twin,id);
  assert.equal(shown(id),catalog.assets[twin].path,id+' (Kennungsweg)');
  assert.equal(contentAsset(ITEM_CATALOG[id].icon)?.meta.path,catalog.assets[twin].path,id+' (Symbolwort '+ITEM_CATALOG[id].icon+')');
 }
 // fuchspfote: gear-furboot mit Pfotenabzeichen als eigene Datei; Symbolwort foxboots zeigt es mit
 const boot=image(catalog.assets['gear-furboot'].path),paw=image(catalog.assets.fuchspfote.path);let diff=0,x0=64,y0=64,x1=0,y1=0;
 for(let i=0;i<64*64;i++)if(boot.data.subarray(i*4,i*4+4).some((v,k)=>v!==paw.data[i*4+k])){diff++;x0=Math.min(x0,i%64);x1=Math.max(x1,i%64);y0=Math.min(y0,i/64|0);y1=Math.max(y1,i/64|0);}
 assert.ok(diff>40&&x1-x0<13&&y1-y0<13,'Pfotenabzeichen: höchstens 13×13 Pixel verändert');
 assert.equal(shown('fuchspfote'),catalog.assets.fuchspfote.path);assert.equal(contentId('foxboots'),'fuchspfote');
}));

test('Symbolwörter ohne eigene Datei bleiben gültig: Talent-Ersatz, Klassen-Buffs, Kniff-Ersatz, Trophäen, Vokabular',()=>{
 const src=read('skill-art.js').toString(),m=src.match(/const NEW_CLASS_ICONS=(\{.*?\}\});/);assert.ok(m,'NEW_CLASS_ICONS gefunden');
 const words=new Set([...DETAIL_ICONS,...ICONS,...Object.values(ITEM_ICON_OVERRIDES),...Object.values(FAMILY_TROPHIES).map(t=>t[1]),
  ...Object.values(CLASS_BUFFS).map(b=>b.icon),...Object.values(TALENT_ROWS).flat().map(r=>r?.icon),...Object.values(RESOURCE_SKILLS||{}).map(r=>r.icon),
  ...Object.values(TALENT_SKILLS||{}).map(r=>r.icon),...Object.values(SPECS).map(s=>s.icon),...Object.values(Function('return '+m[1])()).flatMap(Object.values)].filter(w=>typeof w==='string'));
 for(const w of words)assert.ok(catalog.assets[catalog.aliases[w]||w],w+': Symbolwort ohne Bild');
 for(const [from,to] of Object.entries(catalog.aliases))assert.ok(catalog.assets[to]||catalog.aliases[to],from+' → '+to+': Ziel fehlt');
 for(const [word,to] of Object.entries(DOPPEL))assert.equal(catalog.aliases[word],to,word);
});

test('keine Doppel-Dateien: keine Atlas-Doppel, keine Rückansichten, keine verdeckten Talentbilder, kein Bild zweimal',()=>{
 const paths=new Set(Object.values(catalog.assets).map(a=>a.path));
 for(const f of readdirSync(new URL('assets/precision/runtime/items/',root)))assert.ok(paths.has('assets/precision/runtime/items/'+f),f+': Datei ohne Katalogeintrag');
 assert.ok(!existsSync(new URL('assets/precision/runtime/talents/',root)),'Präzisions-Talentbilder (vom e32-Atlas verdeckt) entfernt');
 for(const id of [...Object.keys(DOPPEL),...RUECKANSICHTEN])assert.ok(!catalog.assets[id],id+': Doppel-Datei');
 for(const id of Object.keys(catalog.assets))assert.ok(!catalog.aliases[id],id+': Datei und Alias zugleich');
 const seen=new Map();for(const [id,a] of Object.entries(catalog.assets).filter(([,a])=>a.kind==='items')){const h=pixels(a.path);assert.ok(!seen.has(h),id+' gleicht '+seen.get(h));seen.set(h,id);}
});

test('ein Bild je Gegenstand – geteilt nur, wo ein Maler-Auftrag offen ist',()=>withCatalog(()=>{
 const by=new Map();for(const id of Object.keys(ITEM_CATALOG)){const p=shown(id);by.set(p,[...(by.get(p)||[]),id]);}
 const allowed=new Map(OFFEN.flatMap(g=>g.map(id=>[id,g])));
 for(const [p,ids] of by)if(ids.length>1)for(const id of ids)assert.ok(allowed.get(id)?.includes(ids.find(x=>x!==id)),ids.join(', ')+' teilen sich '+p);
}));

test('Freistellungen: reproduzierbar aus dem Atlas, Kontur geschlossen, Motiv füllt 58/64, Export 1:1',()=>{
 for(const [path,bytes] of buildFreigestellt())assert.deepEqual(bytes,read(path),path+' nicht reproduzierbar');
 for(const job of FREISTELLEN_JOBS){const im=image(job.output),a=catalog.assets[job.id];
  assert.ok(!tile(im),job.id+': Kachel');assert.ok(contour(im)>=.95,job.id+': Kontur '+contour(im).toFixed(2));
  let x0=64,x1=-1,y0=64,y1=-1;for(let i=0;i<64*64;i++)if(im.data[i*4+3]){x0=Math.min(x0,i%64);x1=Math.max(x1,i%64);y0=Math.min(y0,i/64|0);y1=Math.max(y1,i/64|0);}
  assert.ok(Math.max(x1-x0,y1-y0)+1>=52&&x0>=2&&y0>=2&&x1<=61&&y1<=61,job.id+': Motiv '+(x1-x0+1)+'×'+(y1-y0+1));
  assert.ok(a&&a.source===job.output&&a.palette===job.palette,job.id+': Katalog');assert.deepEqual(image(a.path).data,im.data,job.id+': Export 1:1');}
});

test('Einbauweg gemalter Symbole: Auftragsbogen, 64 px, Waffen-Palette, Export 1:1, Kennung gewinnt über Aliase',()=>withCatalog(()=>{
 const jobs=JSON.parse(read('tools/sprite-pipeline/icons-20260925-jobs.json'));
 for(const job of jobs){const src=image(job.output),a=catalog.assets[job.id];
  assert.deepEqual(checkIcon(src),[],job.id);assert.equal(job.padding,0);assert.equal(job.palette,'waffen');assert.ok(job.painter,job.id+': Maler-Verweis');
  assert.ok(a&&a.source===job.output&&a.kind==='items',job.id+': Katalog');assert.deepEqual(image(a.path).data,src.data,job.id+': Export 1:1');
  assert.equal(contentId(job.id),job.id,job.id+': Alias verdeckt das gemalte Bild');
  if(ITEM_CATALOG[job.id])assert.equal(shown(job.id),a.path,job.id+': Rucksack zeigt das gemalte Bild');}
 // Prüfung lehnt fremde Größe, Halbtransparenz und Farben außerhalb der Palette ab
 const bad={width:48,height:48,data:new Uint8Array(48*48*4).fill(128)};assert.equal(checkIcon(bad).length,3);
}));
