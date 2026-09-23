// E-53: Vergleich über Wirkungen, beide Plätze bei Ringen/Schmuck, Sortierarten und Rucksackfilter.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {ITEMS,addItem,upgradeVerdict,gearComparison,sortInventory,combatStats} from '../rpg.js';
import {itemTooltip,inventoryPanel,characterPanel} from '../rpg-ui.js';
import {STAT_NAMES,STAT_EFFECTS,BAG_UI} from '../content/index.js';

const arena=()=>({spawn:{x:0,y:0},npc:{x:10,y:0},landmarks:[],camps:[],findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[{...b}]});
const hero=(classId='dieter')=>{const g=new Game(arena(),{level:11,classId});for(const k of Object.keys(g.rpg.equipment))g.rpg.equipment[k]=null;g.rpg.inventory=[];return g;};

test('fünf Werte, jeder mit höchstens drei Wirkungen',()=>{
 assert.deepEqual(Object.keys(STAT_NAMES),['stamina','might','finesse','wit','armorRating']);
 for(const k of Object.keys(STAT_NAMES))assert.ok(STAT_EFFECTS[k]?.length>=1&&STAT_EFFECTS[k].length<=3,k);
});

test('zwei Schmuckplätze: verglichen wird mit dem Platz, dessen Tausch sich am meisten lohnt',()=>{
 const g=hero();g.rpg.equipment.trinket1='automatenarm';g.rpg.equipment.trinket2='kabeltalisman';addItem(g.rpg,'blechtalisman');
 const v=upgradeVerdict(g,'blechtalisman');
 assert.equal(v.slot,'trinket2','der schwächere Talisman wird verdrängt, nicht der erste Platz');
 assert.equal(v.verdict,'upgrade');
 assert.deepEqual(v.displaced.map(e=>e.id),['kabeltalisman']);
});

test('zweites Exemplar eines getragenen Rings bekommt eine Einschätzung für den freien Platz',()=>{
 const g=hero();g.rpg.equipment.ring1='pfandring';addItem(g.rpg,'pfandring');
 const v=upgradeVerdict(g,'pfandring');
 assert.equal(v.verdict,'empty');assert.equal(v.slot,'ring2');
 g.rpg.equipment.ring2='pfandring';assert.equal(upgradeVerdict(g,'pfandring'),null,'beide Plätze tragen es schon');
});

test('der Vergleich nennt Wirkungen, nicht rohe Werte – Bastelgrips ändert Heilung, Deckung und Randale, nicht den Schaden',()=>{
 const g=hero();const c=gearComparison(g,'pfandring','ring1');
 const keys=c.changes.map(x=>x.key).sort();
 assert.deepEqual(keys,['energy','heal','shield']);
 assert.ok(c.changes.every(x=>x.percent>0));
 assert.ok(c.score>0);
});

test('Gewichtung je Klasse: die Heilerin schätzt Bastelgrips höher als der Tank',()=>{
 const tank=hero('dieter'),healer=hero('baerbel');
 assert.ok(gearComparison(healer,'pfandring','ring1').score>gearComparison(tank,'pfandring','ring1').score);
});

test('Sortieren nach Güte, Name und Verbesserung',()=>{
 const g=hero();for(const id of ['brezel','kutte','pfandring','dosenbrecher'])addItem(g.rpg,id);
 sortInventory(g,'rarity');assert.equal(g.rpg.inventory[0].id,'pfandring','selten vor ungewöhnlich');
 sortInventory(g,'name');const names=g.rpg.inventory.map(e=>ITEMS[e.id].name);assert.deepEqual(names,[...names].sort((a,b)=>a.localeCompare(b,'de')));
 sortInventory(g,'better');assert.notEqual(g.rpg.inventory.at(-1).id,'kutte','ein freier Platz ist eine Verbesserung und steht vorn');assert.equal(g.rpg.inventory.at(-1).id,'brezel','Verpflegung hat keine Einschätzung und steht hinten');
 assert.ok(g.events.some(e=>e.type==='toast'&&e.text===BAG_UI.sorted+'Verbesserung zuerst.'),'Meldung nennt die gewählte Reihenfolge');
});

test('Rucksack trägt Filter, Sortierwahl und deutsche Suchbegriffe',()=>{
 const g=hero();addItem(g.rpg,'brezel');addItem(g.rpg,'pfandring');
 const html=inventoryPanel(g,null,{filter:'gear',sort:'rarity'});
 assert.match(html,/data-bag-filter="gear" aria-pressed="true"/);
 assert.match(html,/<option value="rarity" selected>/);
 assert.match(html,/data-item="brezel"[^>]*data-item-group="food"[^>]*data-item-name="[^"]*Verpflegung/);
 assert.match(html,/data-item="pfandring"[^>]*data-item-better="1"[^>]*data-item-name="[^"]*Bastelgrips/);
});

test('Tooltip zeigt jeden Wert mit seiner Wirkung und den Vergleich als Wirkungen',()=>{
 const g=hero();addItem(g.rpg,'dosenbrecher');
 const tip=itemTooltip(g,'dosenbrecher');
 assert.match(tip,/\+\d+ Wumms<\/b><small><span>Schaden \+[\d,]+ %<\/span>/);
 assert.match(tip,/class="tooltip-compare"/);assert.match(tip,/stat-gain">Schaden \+/);
 assert.doesNotMatch(tip,/Wertung\)/,'keine einheitenlose Wertung mehr');
 assert.match(tip,/class="compare-stats">Werte: <span class="stat-gain">\+\d+ Wumms<\/span>/,'Ursache: welche Werte sich ändern');
 assert.match(tip,/Ø je Treffer/);
});

test('Figurenseite zeigt, was jeder Wert gerade bewirkt',()=>{
 const g=hero(),s=combatStats(g),html=characterPanel(g);
 assert.doesNotMatch(html,/Schadensbonus|<small>Schutz</,'keine Doppelung von Wumms und Dicke Haut');
 assert.match(html,/Leben \+\d+ · gesamt \d+/);
 for(const k of Object.keys(STAT_NAMES))assert.match(html,new RegExp('data-stat-tip="'+k+'"[^>]*><span>[^<]+</span><b>'+s[k]+'</b><small class="stat-effect">[^<]+</small>'));
});

test('eine Einhandwaffe wird nicht gegen einen Schild in der Nebenhand verglichen',()=>{
 const g=hero();g.rpg.equipment.offhand=Object.keys(ITEMS).find(k=>ITEMS[k].shield&&ITEMS[k].slot==='offhand');g.rpg.equipment.weapon=null;addItem(g.rpg,'dosenbrecher');
 assert.ok(g.rpg.equipment.offhand,'Testaufbau: Schild vorhanden');
 const v=upgradeVerdict(g,'dosenbrecher');assert.equal(v.slot,'weapon');assert.equal(v.verdict,'empty');
});
