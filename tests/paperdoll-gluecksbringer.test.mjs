// Glücksbringer an der Anziehpuppe (2026-09-27): zwei gleichzeitig getragene Glücksbringer überdecken sich nie. Jeder Glücksbringer hat
// Fassungen (Stammplatz + Ausweichfassungen `_gegen` = andere Körperseite, `_guertel` = am Gürtel statt am Hals); die Werkzeugkette misst
// die Deckung aller Fassungspaare aus den Laufzeit-Bögen (tools/paperdoll/gluecksbringer.mjs → cat.gluecksbringer), die Wahl trifft
// paperdoll-kern.js gluecksbringerWahl – im Spiel über paperdollSources, im Werkzeug über waffen-vorschau.mjs.
// PAPERDOLL_RT (oder PAPERDOLL_RUNTIME)=<ordner> prüft einen Probebau statt assets/paperdoll/runtime.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {GEAR,GLUECKSBRINGER} from '../tools/paperdoll/puppe.mjs';
import {deckungMessen,TOLERANZ} from '../tools/paperdoll/gluecksbringer.mjs';
import {gluecksbringerWahl,sources as zeichenfolge} from '../paperdoll-kern.js';
import {paperdoll,paperdollSources} from '../paperdoll-art.js';
import {figureEquipment} from '../paperdoll-figuren.js';
import {equipmentAppearance} from '../equipment-appearance.js';
import {compatibleSlots} from '../equipment.js';
import {ITEM_CATALOG,FIGUREN} from '../content/index.js';
import {sheetReader} from './paperdoll-sheet.mjs';

const PROBE=process.env.PAPERDOLL_RT||process.env.PAPERDOLL_RUNTIME,RT=PROBE?pathToFileURL(resolve(PROBE)+'/'):new URL('../assets/paperdoll/runtime/',import.meta.url);
const cat=JSON.parse(readFileSync(new URL('catalog.json',RT),'utf8')),gb=cat.gluecksbringer,sheets=sheetReader(RT,cat);
const ARCHS=Object.keys(cat.archetypes),DIRS=Object.keys(cat.dirs);
// Glücksbringer-Gegenstände: alles, was in die Plätze trinket1/trinket2 passt, dazu ein Zufalls-Glücksbringer (Familie pendant)
const ROLLED={'zufall-a':{slot:'trinket',rarity:'rare'},'zufall-b':{slot:'trinket',rarity:'uncommon'}},REG={...ITEM_CATALOG,...ROLLED};
const TRINKETS=Object.keys(REG).filter(id=>compatibleSlots(REG[id]).includes('trinket1'));
const quellen=eq=>{paperdoll.catalog=cat;try{return [...paperdollSources(equipmentAppearance(eq,REG))];}finally{paperdoll.catalog=null;}};
const fassung=s=>Object.values(gb.fassungen).some(l=>l.includes(s));
let frisch=null;const gemessen=()=>frisch??=deckungMessen(fileURLToPath(RT).replace(/[\\/]$/,''),cat,[...new Set(Object.values(gb.fassungen).flat())]);

test('Kern: I bleibt, II weicht aus; ohne deckungsfreie Anordnung die kleinste Deckung; gleiche Fassung deckt sich immer', ()=>{
 const g={fassungen:{a:['a','a_gegen'],b:['b','b_gegen'],c:['c']},deckung:{'a>b':40,'b>a':40,'a>c':9,'c>a':12,'a_gegen>c':5,'c>a_gegen':30}};
 assert.deepEqual(gluecksbringerWahl(['a','b'],g),['a','b_gegen'],'II weicht aus');
 assert.deepEqual(gluecksbringerWahl(['b','a'],g),['b','a_gegen']);
 assert.deepEqual(gluecksbringerWahl(['c','a'],g),['a_gegen','c'],'II hat keine deckungsfreie Fassung in dieser Folge → andere Zeichenfolge (c zuletzt) ist die kleinste Deckung 5');
 assert.deepEqual(gluecksbringerWahl(['a','a'],g),['a','a_gegen'],'zweimal derselbe Glücksbringer → beide Seiten');
 assert.deepEqual(gluecksbringerWahl(['c','c'],g),['c','c'],'ohne Ausweichfassung bleibt es beim Stammplatz');
 assert.deepEqual(gluecksbringerWahl(['a'],g),['a']);assert.deepEqual(gluecksbringerWahl(['a','b'],null),['a','b'],'ohne Katalogeintrag unverändert');
});

test('Werkzeug und Katalog: jeder Glücksbringer mit Fassungen, Ausweichfassungen seitengebunden mit Bögen in allen Archetypen × Richtungen', ()=>{
 assert.ok(gb?.fassungen&&gb.deckung,'cat.gluecksbringer fehlt – node tools/paperdoll/puppe.mjs --runtime --nur <Fassungen>');
 assert.equal(gb.toleranz,TOLERANZ);assert.deepEqual(gb.fassungen,GLUECKSBRINGER,'Fassungen im Katalog = Werkzeug (Laufzeit neu bauen)');
 // jeder Glücksbringer-Gegenstand, der am Körper hängt (nicht als Kopfteil wie der Dachsdeckel), steht in der Fassungstabelle
 for(const id of TRINKETS)for(const s of quellen({trinket1:id}))if(cat.sources[s].slot==='charm')assert.ok(gb.fassungen[s],`${id} → ${s}: Glücksbringer ohne Fassungen (ausweich in familien.mjs/puppe.mjs)`);
 for(const [id,list] of Object.entries(gb.fassungen)){assert.equal(list[0],id);
  for(const f of list.slice(1)){assert.equal(GEAR[f]?.slot,'charm',f);assert.ok(cat.sources[f],f+' fehlt im Katalog');
   for(const d of ['sw','ne']){assert.ok(cat.own[d].includes(f),`${f}: eigener ${d}-Bogen (hängt an einer Körperseite)`);assert.ok(cat.ownAkt[d].includes(f),`${f}: eigener ${d}-Aktionsbogen`);}
   for(const arch of ARCHS)for(const dir of DIRS){assert.ok(sheets.has(f,arch,dir,0),sheets.file(f,arch,dir,0)+' fehlt');assert.ok(sheets.has(f,arch,dir,cat.split),sheets.file(f,arch,dir,cat.split)+' fehlt');}}}
});

test('Katalog-Deckung ist aktuell: aus den Laufzeit-Bögen neu gemessen, gleiche Werte', ()=>{
 assert.deepEqual(gemessen(),gb.deckung,'Deckung veraltet – Teilneubau (--nur) misst sie neu');
});

test('Zwei getragene Glücksbringer überdecken sich nie – jedes Paar, alle Archetypen × Richtungen × Bilder', ()=>{
 const dk=gemessen(),gear=cat.sources;let paare=0,umgesetzt=0;
 for(const a of TRINKETS)for(const b of TRINKETS){if(a===b&&REG[a].unique)continue;// einzigartige Gegenstände trägt man nie doppelt
  const all=quellen({trinket1:a,trinket2:b}),g=zeichenfolge(new Set(all.filter(fassung)),gear).filter(s=>s!=='koerper'&&s!=='dutt');if(g.length<2)continue;paare++;
  if(g.some(s=>!gb.fassungen[s]))umgesetzt++;
  for(let i=0;i<g.length;i++)for(let j=i+1;j<g.length;j++){assert.notEqual(g[i],g[j],`${a} + ${b}: zweimal ${g[i]}`);const d=dk[g[i]+'>'+g[j]]||0;
   assert.ok(d<=TOLERANZ,`${a} + ${b} → ${g.join(' + ')}: ${d} px überdeckt`);}}
 assert.ok(paare>=150,'zu wenige Paare geprüft: '+paare);assert.ok(umgesetzt>=40,'Ausweichfassungen kommen zum Einsatz: '+umgesetzt);
});

test('Hufeisen und Kegelkugel hängen an verschiedenen Hüften (Glücksbringer I bleibt, II weicht auf die andere Seite)', ()=>{
 assert.deepEqual(quellen({trinket1:'halbes-hufeisen',trinket2:'kegelkugel'}).filter(fassung),['halbes-hufeisen','kegelkugel_gegen']);
 assert.deepEqual(quellen({trinket1:'kegelkugel',trinket2:'halbes-hufeisen'}).filter(fassung),['kegelkugel','halbes-hufeisen_gegen']);
 assert.deepEqual(quellen({trinket2:'kegelkugel',trinket1:'halbes-hufeisen'}).filter(fassung),['halbes-hufeisen','kegelkugel_gegen'],'Rangfolge nach Platz, nicht nach Eintrag');
 // im Bild: Mittelpunkte links und rechts der Rumpfmitte (Brustanker c), in jeder Richtung und jedem Archetyp (Stand)
 const px=(src,arch,dir)=>{const own=dir==='se'||dir==='nw'||cat.own[dir].includes(src);return cat.sources[src].bands.flatMap(b=>own?sheets.pixels(src,arch,dir,b,0):sheets.pixels(src,arch,dir==='sw'?'se':'nw',b,0).map(([x,y,...c])=>[cat.W-1-x,y,...c]));};
 for(const arch of ARCHS)for(const dir of ['se','sw']){const c=cat.anchors[arch][dir][0].c[0],mx=s=>{const p=px(s,arch,dir);return p.reduce((t,q)=>t+q[0],0)/p.length-c;};
  const h=mx('halbes-hufeisen'),k=mx('kegelkugel_gegen');assert.ok(Math.sign(h)!==Math.sign(k),`${arch} ${dir}: Hufeisen (${h.toFixed(1)}) und Kegelkugel (${k.toFixed(1)}) an derselben Seite`);}
});

test('Ohne Deckung bleibt jeder am Stammplatz; zwei gleiche Zufalls-Andenken hängen an beiden Hüften; NPC-Figuren wie Helden', ()=>{
 assert.deepEqual(quellen({trinket1:'ringlicht-reichweite',trinket2:'halbes-hufeisen'}).filter(fassung),['ringlicht-reichweite','halbes-hufeisen'],'rechte und linke Hüfte decken sich nicht');
 const z=quellen({trinket1:'zufall-a',trinket2:'zufall-b'});assert.ok(z.includes('clanandenken')&&z.includes('clanandenken_gegen'),'Zufalls-Andenken: '+z.join(','));
 assert.deepEqual(quellen({trinket1:'keilerzahn',trinket2:'kabeltalisman'}).filter(fassung),['keilerzahn','kabeltalisman_guertel'],'zweiter Halsanhänger an den Gürtel');
 assert.deepEqual(quellen({trinket1:'keilerzahn',trinket2:'schaerpe'}).filter(fassung),['keilerzahn_guertel','schaerpe'],'die Schärpe bleibt, der Anhänger weicht aus');
 // Timo trägt Schärpe und Bierbong (content/figuren.js): Bierbong an der anderen Hüfte, keine Deckung
 paperdoll.catalog=cat;try{const t=[...paperdollSources(figureEquipment('timo'))].filter(fassung);assert.equal(t.length,FIGUREN.timo.gear.filter(g=>gb.fassungen[g]).length);
  for(let i=0;i<t.length;i++)for(let j=i+1;j<t.length;j++)assert.ok((gemessen()[t[i]+'>'+t[j]]||0)<=TOLERANZ,'Timo: '+t.join(' + '));}
 finally{paperdoll.catalog=null;}
});

test('Laufzeit-Bögen der Ausweichfassungen tragen Inhalt; der Offline-Cache kennt sie (optional)', ()=>{
 const manifest=readFileSync(new URL('../precache-manifest.js',import.meta.url),'utf8');
 for(const f of Object.values(gb.fassungen).flatMap(l=>l.slice(1))){let n=0;for(const b of cat.sources[f].bands)n+=sheets.pixels(f,'dieter','se',b,0).length;assert.ok(n>=60,f+': kaum sichtbar ('+n+' px)');
  if(!PROBE)assert.ok(manifest.includes(`assets/paperdoll/runtime/${f}-dieter.png`),f+': fehlt im Offline-Cache (node scripts/pwa-cache.mjs)');}
 assert.ok(existsSync(new URL('../tools/paperdoll/gluecksbringer.mjs',import.meta.url)));
});
