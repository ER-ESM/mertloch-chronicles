// Anziehpuppe für NPCs (E-58): jede Figur = Archetyp + Aussehen + Ausrüstung (content/figuren.js), gezeichnet über
// paperdoll-figuren.js. Prüft Abdeckung (NPCs, Dorfbewohner, Berufslehrer, Söldner), gültige Editor-Kennungen, vorhandene
// Quellen im Werkzeug und im Laufzeitkatalog, Schichtregeln und die Umleitung der Zeichenwege.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {FIGUREN,FIGUR_HANDSTUECKE,NPCS,VILLAGERS,PROFESSIONS,COMPANIONS} from '../content/index.js';
import {SKIN_TONES,HAIR_COLORS,FACE_ITEMS,HAIR_STYLES,BEARDS,normalizeTint} from '../hero-tint.js';
import {GEAR} from '../tools/paperdoll/puppe.mjs';
import {figureDef,figureEquipment,FIGURE_PREFIX} from '../paperdoll-figuren.js';
import {paperdoll,paperdollArch,paperdollSources} from '../paperdoll-art.js';

const ARCHS=['dieter','baerbel','kevin'];
const CAT_FILE=new URL('../assets/paperdoll/runtime/catalog.json',import.meta.url);
const source=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const own=Object.entries(FIGUREN).filter(([,f])=>!f.wie);

test('jede NPC-ID, jeder Dorfbewohner, jeder Berufslehrer und jeder Söldner hat eine Figur',()=>{
 for(const id of Object.keys(NPCS))assert.ok(figureDef(id),'NPC ohne Figur: '+id);
 for(const v of VILLAGERS)assert.ok(figureDef('villager'+v.variant),'Dorfbewohner ohne Figur: '+v.name);
 for(const id of Object.keys(PROFESSIONS))assert.ok(figureDef('beruf-'+id),'Berufslehrer ohne Figur: '+id);
 for(const c of COMPANIONS){const f=FIGUREN[c.id];assert.ok(f?.arch,'Söldner ohne Figur: '+c.id);assert.equal(f.arch,c.look,c.id+': Archetyp muss zum look passen (Heldenweg)');}
 for(const [id,f] of Object.entries(FIGUREN))if(f.wie)assert.ok(FIGUREN[f.wie]?.arch,id+': Verweis auf '+f.wie+' führt ins Leere');
});

test('Archetyp und Aussehen sind gültige Editor-Kennungen (hero-tint.js)',()=>{
 const ok={skin:SKIN_TONES,hair:HAIR_COLORS,face:FACE_ITEMS,style:HAIR_STYLES,beard:BEARDS};
 for(const [id,f] of own){assert.ok(ARCHS.includes(f.arch),id+': Archetyp '+f.arch);
  for(const [k,list] of Object.entries(ok))assert.ok(list.some(o=>o.id===f.tint[k]),`${id}: ${k}=${f.tint[k]}`);
  assert.deepEqual(normalizeTint(f.tint),f.tint,id+': Tönung vollständig und unverändert');
  if(f.arch==='baerbel')assert.equal(f.tint.beard,'natur',id+': Schwungvoll ohne Bart');}
});

test('alle Kleidungsstücke existieren als Quelle im Werkzeug und im Laufzeitkatalog',()=>{
 assert.ok(existsSync(CAT_FILE),'Laufzeitkatalog fehlt: node tools/paperdoll/puppe.mjs --runtime');
 const cat=JSON.parse(readFileSync(CAT_FILE,'utf8'));
 for(const [id,f] of own)for(const g of f.gear){assert.ok(GEAR[g],`${id}: ${g} fehlt in GEAR (puppe.mjs/npc-kleidung.mjs)`);
  assert.ok(cat.sources[g],`${id}: ${g} fehlt im Laufzeitkatalog – node tools/paperdoll/puppe.mjs --runtime`);assert.equal(cat.sources[g].slot,GEAR[g].slot,g+': Platz im Katalog veraltet');}
 for(const g of new Set(own.flatMap(([,f])=>f.gear)))for(const [dir,d] of Object.entries(cat.dirs))if(!(dir in cat.own)||cat.own[dir].includes(g))for(const a of ARCHS)
  assert.ok(existsSync(new URL(`../assets/paperdoll/runtime/${g}-${a}${d}.png`,import.meta.url)),`Bogen fehlt: ${g}-${a}${d}.png`);
});

test('Laufzeit: die angemeldete Ausrüstung ergibt genau die Figurteile (Fernkampf blendet Handstücke aus)',()=>{
 const cat=JSON.parse(readFileSync(CAT_FILE,'utf8'));paperdoll.catalog=cat;
 try{for(const [id,f] of own){const eq=figureEquipment(id);assert.deepEqual([...paperdollSources(eq,false)].sort(),[...f.gear].sort(),id);
   const ranged=[...paperdollSources(eq,true)];for(const g of f.gear)if(FIGUR_HANDSTUECKE[g])assert.ok(!ranged.includes(g),id+': '+g+' beim Fernkampf sichtbar');}
  assert.equal(figureEquipment('villager2').find(e=>e.id==='kochmuetze').slot,'head','Kopfteil mit Katalogplatz (verdeckt Brille/Frisur)');}
 finally{paperdoll.catalog=null;}
});

test('Schichtregeln: je Platz höchstens ein Teil, Beine bedeckt, Schuhe an, Zweihänder ohne Nebenhand',()=>{
 for(const [id,f] of own){const slots=f.gear.map(g=>GEAR[g].slot),count=s=>slots.filter(x=>x===s).length;
  assert.equal(new Set(f.gear).size,f.gear.length,id+': doppelte Teile');
  for(const s of ['head','feet','legs','body','weapon','offhand'])assert.ok(count(s)<=1,`${id}: ${count(s)}× ${s}`);
  assert.equal(count('feet'),1,id+': ohne Schuhe');
  assert.ok(count('legs')||f.gear.some(g=>['latzhose','dirndl'].includes(g)),id+': Beine unbedeckt');
  if(f.gear.some(g=>GEAR[g].slot==='weapon'&&GEAR[g].hands===2))assert.equal(count('offhand'),0,id+': Zweihänder verdrängt die Nebenhand');}
});

test('Handstücke: Platz und Hände wie im Werkzeug, jedes getragene Handstück ist eingetragen',()=>{
 for(const [g,h] of Object.entries(FIGUR_HANDSTUECKE)){assert.ok(GEAR[g],g);assert.equal(h.slot,GEAR[g].slot,g+' Platz');assert.equal(h.hands??null,GEAR[g].hands||null,g+' Hände');}
 for(const [id,f] of own)for(const g of f.gear)if(['weapon','offhand','ranged'].includes(GEAR[g].slot))assert.ok(FIGUR_HANDSTUECKE[g],`${id}: ${g} fehlt in FIGUR_HANDSTUECKE`);
 const eq=figureEquipment('sigi');assert.deepEqual(eq.map(e=>e.id),FIGUREN.sigi.gear);assert.equal(eq.find(e=>e.id==='sigizange').hands,2);
});

test('Figuren sind unterscheidbar: keine zwei eigenen Figuren gleich',()=>{
 const seen=new Map();for(const [id,f] of own){const key=f.arch+'|'+Object.values(f.tint).join('.')+'|'+[...f.gear].sort().join(',');
  assert.ok(!seen.has(key),`${id} sieht aus wie ${seen.get(key)}`);seen.set(key,id);}
});

test('Anmeldung im Namensraum npc:, Mentoren zusätzlich; Helden- und Bosskennungen bleiben unberührt',()=>{
 for(const [id,f] of Object.entries(FIGUREN))assert.equal(paperdollArch(FIGURE_PREFIX+id),figureDef(id).arch,id);
 for(const id of Object.keys(NPCS).filter(id=>NPCS[id].member))assert.equal(paperdollArch('mentor-'+id),FIGUREN[id].arch,'mentor-'+id);
 for(const boss of ['sigi','horst','gisela','klaus','timo','kalle','ida'])assert.equal(paperdollArch(boss),null,boss+' darf nicht roh angemeldet sein');
 assert.equal(paperdollArch('dieter'),'dieter');assert.equal(paperdollArch('anni'),'baerbel');
});

test('Söldner tragen Tönung und Kleidung ihrer Figur in der Renderer-Ansicht',async()=>{
 const {World}=await import('../world.js'),{Game}=await import('../engine.js');
 const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')),{});
 const g=new Game(world,{level:6},{});g.rpg.coins=5000;g.toast=()=>{};
 for(const c of COMPANIONS.slice(0,2))assert.equal(g.hireCompanion(c.id).ok,true);
 for(let t=0;t<.5;t+=.05)g.tick(.05);
 for(const c of g.companions){const f=FIGUREN[c.id];assert.deepEqual(c.view.tint,f.tint,c.id);assert.deepEqual(c.view.visualEquipment.map(e=>e.id),f.gear,c.id);
  for(const e of c.view.visualEquipment)if(FIGUR_HANDSTUECKE[e.id])assert.equal(e.slot,FIGUR_HANDSTUECKE[e.id].slot,e.id);}
});

test('Zeichenwege leiten auf die Anziehpuppe um und behalten den alten Weg als Rückfall',()=>{
 const person=source('person-art.js');assert.match(person,/drawFigure\(c,id,x,y,scale,pose\)\)return;if\(drawLivePerson/,'drawWorldPerson: Puppe vor dem Bogen');
 assert.match(person,/portrait:true/,'Porträts bleiben beim bisherigen Bild');
 assert.match(source('clan-art.js'),/if\(npc&&drawFigure\(c,p\.npcId\|\|'ida',x,y,scale,p\)\)return;drawTinyPerson/,'Ida (NPC-Zweig)');
 assert.match(source('comic-actors.js'),/a\.kind==='villager'&&drawFigure\(c,'villager'\+/,'Dorfbewohner');
 assert.match(source('profession-art.js'),/if\(!drawFigure\(c,'beruf-'\+t\.id,t\.x,t\.y,PERSON_SCALE,\{facing\}\)\)drawWorldPerson/,'Berufslehrer');
 assert.match(source('kiosk-room-art.js'),/drawWorldPerson\(c,'kalle'/,'Kiosk-Kalle läuft über drawWorldPerson');
});
