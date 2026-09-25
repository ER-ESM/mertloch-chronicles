// Waffenkammer 2026-09-25: acht feste Waffen als normale Gegenstände – Werte, Symbol, Fundort, noch OHNE Sondereffekt
// (Nutzerentscheidung: Effekte kommen in einer eigenen Runde, Ideen in docs/backlog/loot.md).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {ITEM_CATALOG,ICONS,DROP_TABLES,HOTSPOTS,WORLD_NOTICES,PROFESSION_RECIPES,PROFESSIONS,SHOP_STOCK,BALANCE,itemPoints,WEAPON_TYPES,validateContent} from '../content/index.js';
import {equipmentAppearance} from '../equipment-appearance.js';
import {compatibleSlots,itemSlotName} from '../equipment.js';
import {rollDrop} from '../itemization.js';
import {Game} from '../engine.js';
import {World} from '../world.js';
import {ITEMS,countItem} from '../rpg.js';
import {acceptHotspotQuest,claimHotspotQuest,questStatus} from '../hotspots.js';
import {decodePng} from '../tools/sprite-pipeline/png.mjs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const catalog=JSON.parse(read('assets/precision/runtime/catalog.json'));
/** Kennung → Art. Kennungen sind Speicherschlüssel: nie umbenennen. */
const WAFFEN={
 rohrzange:{slot:'weapon',type:'club',hands:1,family:'club'},
 fasskeule:{slot:'weapon',type:'club',hands:1,family:'club'},
 kronkorkenstern:{slot:'weapon',type:'club',hands:1,family:'club'},
 gartenzwerg:{slot:'weapon',type:'maul',hands:2,family:'maul'},
 grillzange:{slot:'weapon',type:'blade',hands:1,family:'blade'},
 masskrugschild:{slot:'offhand',shield:true,family:'shield'},
 schorlenspritze:{slot:'ranged',type:'speaker',hands:0,family:'sprayer'},
 blitzschrauber:{slot:'ranged',type:'launcher',hands:0,family:'slingshot'}
};
const IDS=Object.keys(WAFFEN);

test('alle acht Waffen stehen im Katalog: Name, Symbolwort, Platz, Hände, Stufe 3–12, gemischte Güte, kein Sondereffekt',()=>{
 assert.deepEqual(validateContent(),[]);
 for(const [id,want] of Object.entries(WAFFEN)){const d=ITEM_CATALOG[id];
  assert.ok(d,id+' fehlt');assert.ok(d.name&&d.description&&d.look,id+': Name, Text, Bildhinweis');assert.ok(ICONS.includes(d.icon),id+': Symbolwort');
  assert.equal(d.slot,want.slot,id+': Platz');assert.ok(d.level>=3&&d.level<=12,id+': Stufe '+d.level);
  assert.ok(['uncommon','rare'].includes(d.rarity),id+': Güte '+d.rarity);
  assert.ok(!d.unique&&!d.proc&&!d.retired,id+': normale Ausrüstung ohne Proc');
  if(want.shield){assert.equal(d.shield,true,id+': Schild');assert.equal(d.weapon,undefined,id);assert.deepEqual(compatibleSlots(d),['offhand']);}
  else{assert.equal(d.weapon.type,want.type,id+': Bauart');assert.equal(d.weapon.hands,want.hands,id+': Hände');assert.equal(d.weapon.speed,WEAPON_TYPES[want.type].speed,id+': Takt der Bauart');}
 }
 assert.equal(ITEM_CATALOG.gartenzwerg.weapon.hands,2,'Gartenzwerg ist Zweihänder');
 assert.deepEqual(compatibleSlots(ITEM_CATALOG.gartenzwerg),['weapon']);
 assert.deepEqual(compatibleSlots(ITEM_CATALOG.schorlenspritze),['ranged']);assert.deepEqual(compatibleSlots(ITEM_CATALOG.blitzschrauber),['ranged']);
 const rarities=new Set(IDS.map(id=>ITEM_CATALOG[id].rarity)),levels=new Set(IDS.map(id=>ITEM_CATALOG[id].level));
 assert.ok(rarities.size>=2,'Güten gemischt');assert.ok(levels.size>=6,'Stufen verteilt');
});

test('Werte folgen der Kurve gewürfelter Waffen gleicher Bauart, Stufe und Güte – nie stärker als Beute oder Dorflegenden',()=>{
 const W=BALANCE.weapons,hi=W.rollFloor+(W.rollSteps-1)/100;
 for(const id of IDS){const d=ITEM_CATALOG[id],sum=Object.values(d.stats||{}).reduce((n,v)=>n+v,0);
  // Wertpunkte = Grundbudget ohne Streuung und ohne Zusätze (gewürfelte Seltene bekommen Zusätze obendrauf)
  assert.equal(sum,itemPoints(d.level,d.rarity),id+': Wertpunkte');
  if(!d.weapon)continue;
  const t=WEAPON_TYPES[d.weapon.type],f=(1+(d.level-1)*W.perLevel)*W.quality[d.rarity];
  assert.ok(d.weapon.min>=Math.floor(t.min*f*W.rollFloor)&&d.weapon.min<=Math.ceil(t.min*f*hi),id+': min '+d.weapon.min);
  assert.ok(d.weapon.max>=Math.floor(t.max*f*W.rollFloor)&&d.weapon.max<=Math.ceil(t.max*f*hi),id+': max '+d.weapon.max);
  // Dorflegenden derselben Handklasse ab gleicher Stufe schlagen im Mittel härter
  const avg=(d.weapon.min+d.weapon.max)/2;
  for(const [uid,u] of Object.entries(ITEM_CATALOG))if(u.unique&&u.weapon?.hands===d.weapon.hands&&(u.level||1)>=d.level)assert.ok(avg<=(u.weapon.min+u.weapon.max)/2,id+' schlägt härter als '+uid);
 }
});

test('jede Waffe hat ihr gemaltes Symbol (64 px, Katalog, Laufzeitdatei, Offline-Cache) und eine sichtbare Familie an der Figur',()=>{
 const urls=JSON.parse(read('precache-manifest.js').toString().match(/self.PRECACHE=(.*);/s)[1]).urls;
 for(const [id,want] of Object.entries(WAFFEN)){const a=catalog.assets[id];
  assert.ok(a,id+': Symbol fehlt im Präzisionskatalog');assert.equal(a.kind,'items');assert.equal(a.width,64);assert.equal(a.height,64);
  assert.equal(a.path,'assets/precision/runtime/items/'+id+'.png');assert.equal(a.source,'assets/precision/sources/2026-09-25/'+id+'.png');
  assert.ok(existsSync(new URL('../'+a.path,import.meta.url)),id+': Laufzeitdatei');assert.ok(urls.includes(a.path),id+': nicht im Offline-Cache');
  // unverändert übernommen: Laufzeitbild = gemaltes Original, Pixel für Pixel
  assert.deepEqual(decodePng(read(a.path)).data,decodePng(read(a.source)).data,id+': Symbol verändert');
  for(const slot of compatibleSlots(ITEM_CATALOG[id])){const [p]=equipmentAppearance({[slot]:id},ITEMS);assert.equal(p.asset,want.family,id+' '+slot);assert.ok(catalog.equipment[p.asset],id+': Familie '+p.asset);}
 }
});

/** Alle Fundorte einer Kennung: Beute (drops.js extra/unique), Auftragsbelohnung (hotspots.js), Berufsrezept, Kiosk. */
function sources(id){const out=[];
 for(const [family,t] of Object.entries(DROP_TABLES)){if(t.unique===id)out.push('drop:'+family);for(const x of t.extra||[])if(x.item===id)out.push('drop:'+family);}
 for(const q of [...HOTSPOTS.flatMap(h=>h.quests),...WORLD_NOTICES])if(q.reward?.item===id)out.push('quest:'+q.id);
 for(const [rid,r] of Object.entries(PROFESSION_RECIPES))if(r.output===id&&PROFESSIONS[r.profession]?.kind==='craft')out.push('recipe:'+rid);
 if(SHOP_STOCK.includes(id))out.push('shop');
 return out;}

test('jede Waffe ist im Spiel erreichbar: Beute, Auftrag oder Rezept – und keine verdrängt eine alte Belohnung',()=>{
 for(const id of IDS)assert.ok(sources(id).length,id+': kein Fundort');
 // die thematischen Fundorte (Auftrag an Grill-Oskars Grillwiese, Horst, Kegelbahn, Hopfengarten, Bude, Braugarten, Werkhof)
 assert.ok(sources('grillzange').includes('quest:hs-grillwiese-1'));
 assert.ok(sources('rohrzange').includes('drop:horst'));
 assert.ok(sources('fasskeule').includes('drop:klaus')&&sources('fasskeule').includes('drop:kegler'));
 assert.ok(sources('gartenzwerg').includes('quest:hs-wegestube-1'));
 assert.ok(sources('masskrugschild').includes('quest:st-nyalol-3'));
 assert.ok(sources('schorlenspritze').includes('recipe:schorlenfuellung'));
 assert.ok(sources('kronkorkenstern').includes('recipe:morgenstern')&&sources('blitzschrauber').includes('recipe:akkuschrauber'));
 // Die alten Gegenstandsbelohnungen bleiben: vier Überleitungen der Startreihe, zwei Aushänge
 const old={'hs-kirchhof-3':'festivalstiefel','hs-grillwiese-3':'regenjacke','hs-kioskhof-3':'pfandring','hs-wegestube-3':'kabelbinderstiefel','aushang-bruno':'bierdeckelweste','aushang-olaf':'kabeltalisman'};
 for(const q of [...HOTSPOTS.flatMap(h=>h.quests),...WORLD_NOTICES])if(old[q.id])assert.equal(q.reward.item,old[q.id],q.id);
 // Rezepte: Stufe der Waffe passt zur Fertigkeit, Fertigkeit weit über den Einstiegsrezepten
 for(const r of Object.values(PROFESSION_RECIPES))if(IDS.includes(r.output))assert.ok(r.required>=40&&!r.starter&&r.cost>=40,r.name);
});

test('feste Zusatzbeute wird als letzter Wurf gezogen und fällt nur bei den eingetragenen Familien',()=>{
 const g=new Game(new World(JSON.parse(read('data/mertloch.json').toString())),{version:1,level:6});
 const drop=(e,draws)=>{let i=0;g.lootRandom=()=>draws[i++]??.999;return {...rollDrop(g,e,ITEMS),used:i};};
 // Horst: Material, Ausrüstung, Dorflegende, Verpflegung, Marken – alles verfehlt; erst der sechste Wurf trifft die Rohrzange
 const horst=drop({type:'boss',family:'horst',level:4},[.999,.999,.999,.999,.999,0]);
 assert.deepEqual(horst.items,[{id:'rohrzange',count:1}]);assert.equal(horst.used,6);
 const klaus=drop({type:'boss',family:'klaus',level:6},[.999,.999,.999,.999,.999,0]);assert.deepEqual(klaus.items,[{id:'fasskeule',count:1}]);
 // Familien ohne Zusatzbeute ziehen keinen Wurf mehr als vorher
 const warden=drop({type:'cultist',family:'warden',level:3},[]);assert.equal(warden.used,5);assert.deepEqual(warden.items,[]);
 const everything=drop({type:'boss',family:'horst',level:4},Array(40).fill(0));assert.ok(everything.items.some(x=>x.id==='rohrzange'));assert.ok(everything.items.some(x=>x.id==='horststempel'),'Dorflegende bleibt');
});

test('Auftragsbelohnung landet im Rucksack: Keiler am Grillrost gibt die Grillzange',()=>{
 const g=new Game(new World(JSON.parse(read('data/mertloch.json').toString())),{version:1,level:3});
 g.hotspots.quests={'hs-kirchhof-3':{accepted:true,count:0,claimed:true}};g.hotspots.tracked=null;
 assert.equal(questStatus(g,'hs-grillwiese-1'),'available');assert.ok(acceptHotspotQuest(g,'hs-grillwiese-1'));
 g.hotspots.quests['hs-grillwiese-1'].count=5;assert.equal(questStatus(g,'hs-grillwiese-1'),'ready');
 assert.equal(countItem(g.rpg,'grillzange'),0);assert.ok(claimHotspotQuest(g,'hs-grillwiese-1'));assert.equal(countItem(g.rpg,'grillzange'),1);
});

test('Tooltip-Art: der Blitzschrauber heißt Akkuschrauber, nicht Pfandschleuder – die übrigen nennen ihre Bauart',()=>{
 assert.equal(itemSlotName(ITEM_CATALOG.blitzschrauber),'Fernkampf · Akkuschrauber');
 assert.equal(itemSlotName(ITEM_CATALOG.schorlenspritze),WEAPON_TYPES.speaker.name);
 assert.equal(itemSlotName(ITEM_CATALOG.pfandschleuder),WEAPON_TYPES.launcher.name,'Grundausstattung unverändert');
});
