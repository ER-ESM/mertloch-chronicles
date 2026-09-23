// Zusätze gewürfelter Beute (E-40): Determinismus, Anzahl je Güte, Budgetrahmen, alte Spielstände, Namensvielfalt.
import test from 'node:test';
import assert from 'node:assert/strict';
import {BALANCE,itemPoints,AFFIX_TUNING,LOOT_PREFIXES,LOOT_EPITHETS,LOOT_AFFIX_POOLS,ROLLED_BASES,AFFIXES,STAT_NAMES,ADJECTIVE_ENDINGS,affixedName,affixFits,affixNumbers} from '../content/index.js';
import {rolledDefinition,rolledAffixes,registerRoll,restoreRolls,QUALITIES} from '../itemization.js';

const SLOTS=Object.keys(ROLLED_BASES),SPECS=Object.keys(AFFIXES);
const rng=(s=>()=>(s=(Math.imul(s,1103515245)+12345)>>>0)/4294967296)(56753);
const pick=list=>list[Math.floor(rng()*list.length)];
const randomRaw=quality=>({slot:pick(SLOTS),spec:pick(SPECS),level:1+Math.floor(rng()*BALANCE.maxLevel),quality:quality||(rng()<BALANCE.items.rareChance?'rare':'uncommon'),roll:Math.floor(rng()*1000),family:pick(['warden','boar','quest','horst'])});
/** E-56: Punkte des Grundwurfs aus Gegenstandsstufe (= Fundstufe) und Güte. */
const spread=raw=>1-BALANCE.items.rollSpread/2+(raw.roll%31)/100;
const baseBudget=raw=>itemPoints(raw.level,raw.quality,spread(raw));
const worth=raw=>Math.round((BALANCE.items.worth.base+raw.level*BALANCE.items.worth.perLevel)*BALANCE.items.worth.quality[raw.quality]*spread(raw));
const total=o=>Object.values(o||{}).reduce((n,v)=>n+v,0);

test('gleiche Rohdaten ergeben immer denselben Gegenstand', () => {
 for(let i=0;i<300;i++){const raw=randomRaw(pick(QUALITIES));assert.deepEqual(rolledDefinition({...raw}),rolledDefinition({...raw}));}
 const a=rolledDefinition({slot:'body',spec:'bass',level:12,quality:'epic',roll:761,family:'warden'});
 assert.equal(a.affixes.length,2);
});

test('die Güte steuert die Anzahl: ungewöhnlich 0–1, selten 1, episch Vorsilbe + Beiname', () => {
 const counts={uncommon:[0,0]};
 for(let i=0;i<1500;i++){const raw=randomRaw(pick(QUALITIES)),d=rolledDefinition(raw),n=d.affixes?.length||0;
  if(raw.quality==='uncommon'){assert.ok(n<=1,'ungewöhnlich trägt höchstens einen Zusatz');counts.uncommon[n]++;}
  if(raw.quality==='rare')assert.equal(n,1,'selten trägt genau einen Zusatz');
  if(raw.quality==='epic'){assert.deepEqual(d.affixes.map(a=>a.kind),['prefix','epithet']);}
  for(const a of d.affixes||[]){const def=LOOT_AFFIX_POOLS[a.kind].find(x=>x.id===a.id);assert.ok(def,'Zusatz stammt aus dem Pool');assert.ok(affixFits(def,d.slot,d.level,d.rarity),a.id+' passt nicht zu Platz/Stufe/Güte');}}
 const share=counts.uncommon[1]/(counts.uncommon[0]+counts.uncommon[1]);
 assert.ok(Math.abs(share-AFFIX_TUNING.uncommonChance)<.12,'Anteil ungewöhnlicher Funde mit Zusatz liegt bei uncommonChance: '+share);
});

test('E-56: Grundwurf hat genau die Punkte aus Gegenstandsstufe und Güte, Zusätze je mindestens einen Punkt', () => {
 for(let i=0;i<1500;i++){const raw=randomRaw(pick(QUALITIES)),d=rolledDefinition(raw),budget=baseBudget(raw),primary=AFFIXES[raw.spec].primary;
  let gain=0;for(const a of d.affixes||[]){const n=total(a.stats);assert.equal(n,Math.max(AFFIX_TUNING.minPoints,Math.round(budget*AFFIX_TUNING.share[a.kind])),'Zusatzpunkte');for(const [k,v] of Object.entries(a.stats)){assert.ok(STAT_NAMES[k],'unbekannter Wert '+k);assert.ok(Number.isInteger(v)&&v>=1);}gain+=n;}
  assert.equal(total(d.stats)-gain,budget,'Grundwurf = itemPoints');
  assert.ok(d.stats[primary]>=1,'Hauptwert immer dabei');
  assert.ok(gain<=Math.max(2*AFFIX_TUNING.minPoints,Math.round(budget*AFFIX_TUNING.maxGain)+2),'Zusätze sprengen den Rahmen: +'+gain+' bei '+budget);
  assert.equal(d.itemLevel,raw.level,'Gegenstandsstufe = Fundstufe');
  assert.equal(d.value,worth(raw)*BALANCE.items.valuePerBudget,'Verkaufswert bleibt am alten Wertmaß');}
});

test('E-56: Stufe 1 bringt 1–2 Punkte, Stufe 10 etwa 10 (ungewöhnlich)', () => {
 assert.ok([1,2].includes(itemPoints(1,'uncommon')));assert.equal(itemPoints(1,'common'),1);
 assert.ok(Math.abs(itemPoints(10,'uncommon')-10)<=1);assert.ok(itemPoints(10,'epic')>itemPoints(10,'rare')&&itemPoints(10,'rare')>itemPoints(10,'uncommon'));
});

test('alte Roll-IDs werden weiter wiederhergestellt, ohne neues Feld im Spielstand', () => {
 const rpg={itemSequence:0,generated:{}},registry={};
 const id=registerRoll(rpg,registry,{slot:'head',spec:'pfand',level:7,quality:'rare',roll:412,family:'warden'});
 const questId=registerRoll(rpg,registry,{slot:'ring',spec:'tresen',level:3,quality:'uncommon',roll:88});
 assert.match(id,/^roll-[a-z]+-[a-z]+-\d+-(uncommon|rare|epic)-\d+-[a-z]+-\d+$/);
 assert.deepEqual(Object.keys(rpg.generated[id]).sort(),['family','level','quality','roll','slot','spec'],'Spielstand trägt nur die sechs Rohfelder');
 const saved=JSON.parse(JSON.stringify(rpg.generated)),restored={},generated=restoreRolls(saved,restored);
 assert.deepEqual(restored[id],registry[id]);
 assert.deepEqual(restored[questId],registry[questId],'Questbelohnung ohne family ergibt vor und nach dem Laden dasselbe Teil');
 assert.deepEqual(generated,saved);
 // Ein Spielstand von vor E-40 (nur Rohdaten) lädt und behält mindestens seine alten Werte.
 const old={'roll-body-bass-3-rare-761-warden-5':{slot:'body',spec:'bass',level:3,quality:'rare',roll:761,family:'warden'}},reg={};
 restoreRolls(old,reg);const d=reg['roll-body-bass-3-rare-761-warden-5'];
 assert.ok(d.name.includes('Festtagsjacke')&&d.name.includes('der Zugabe'));
 assert.equal(total(d.stats)-total(Object.assign({},...(d.affixes||[]).map(a=>a.stats))),baseBudget(old['roll-body-bass-3-rare-761-warden-5']),'E-56: alte Teile tragen die neuen Punkte');
});

test('Namen: Genus stimmt, Tooltip nennt jeden Zusatz mit seinen Werten', () => {
 const stem=LOOT_PREFIXES.find(a=>a.id==='klebrig'),fixed=LOOT_PREFIXES.find(a=>a.id==='kirmes'),tail=LOOT_EPITHETS.find(a=>a.id==='ohne-tuev');
 assert.equal(affixedName('Pfandprügel','m','des Tresens',stem,tail),'Klebriger Pfandprügel des Tresens ohne TÜV');
 assert.equal(affixedName('Festtagsjacke','f','der Zugabe',stem),'Klebrige Festtagsjacke der Zugabe');
 assert.equal(affixedName('Pfandsiegel','n','des Kurzschlusses',stem),'Klebriges Pfandsiegel des Kurzschlusses');
 assert.equal(affixedName('Grillhandschuhe','p','des Tresens',stem),'Klebrige Grillhandschuhe des Tresens');
 assert.equal(affixedName('Festivalhelm','m','der Zugabe',fixed),'Kirmes-Festivalhelm der Zugabe');
 assert.equal(affixedName('Festivalhelm','m','der Zugabe'),'Festivalhelm der Zugabe','ohne Zusatz bleibt der alte Name');
 assert.deepEqual(Object.keys(ADJECTIVE_ENDINGS).sort(),['f','m','n','p']);
 const d=rolledDefinition({slot:'weapon',spec:'tresen',level:20,quality:'epic',roll:333,family:'horst'});
 assert.equal(d.affixText.length,2);
 for(const a of d.affixes){assert.ok(d.description.includes('„'+a.name+'“'),'Beschreibung nennt '+a.name);for(const [k,v] of Object.entries(a.stats))assert.ok(d.description.includes('+'+v+' '+STAT_NAMES[k]));}
 const rows=affixNumbers(d.affixes);assert.ok(rows.length>=2);for(const r of rows)assert.ok(r.label&&r.source.startsWith('affix.')&&typeof r.value==='number');
});

test('Namensvielfalt: 2.000 Würfe wie aus der Beutetabelle ergeben über 500 verschiedene Namen', () => {
 const names=new Set();for(let i=0;i<2000;i++)names.add(rolledDefinition(randomRaw()).name);
 assert.ok(names.size>500,'nur '+names.size+' verschiedene Namen');
 const used=new Set();for(let i=0;i<6000;i++)for(const a of rolledDefinition(randomRaw(pick(QUALITIES))).affixes||[])used.add(a.id);
 assert.equal(used.size,LOOT_PREFIXES.length+LOOT_EPITHETS.length,'jeder Zusatz kommt irgendwann vor');
});
