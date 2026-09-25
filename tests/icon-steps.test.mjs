// Symbolstufen und ein Weg für Gegenstandssymbole (Icon-Review R0, Stilbibel A4; _review/icons-r0/REVIEW-ICONS-R0.md §2/§4).
// 1) Nur 48 / 32 / 24 px, und je Anzeigeort ist die Canvas-Größe die CSS-Größe (icon-steps.js ↔ icon-steps.css).
// 2) Jeder Ort, der ein Gegenstandssymbol zeigt, geht über itemArt (rpg-ui.js) – wie der Rucksack. Vorher zeigten Chat, Leiste,
//    Belohnung, Dungeon-Karte, Journal, Questwahl und Würfelfenster das rohe item.icon (P-B): gewürfelte Keulen etwa eine Flasche.
// Die Sichtprüfung (Knöpfe, Überläufe, Handy) bleibt im Browser; hier steht, was statisch und im Node prüfbar ist.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {STEPS,ICON_STEP,iconStep,touchStep} from '../icon-steps.js';
import {Game} from '../engine.js';
import {ITEMS} from '../rpg.js';
import {registerRoll} from '../itemization.js';
import {itemArt,itemSymbol,itemIcon,inventoryPanel,lootPanel,characterPanel,itemTooltip,itemTooltipR3} from '../rpg-ui.js';
import {iconBook,skillTooltip,rewardPanel} from '../combat-ui.js';
import {talentsPanel,talentTooltip} from '../talent-ui.js';
import {rewardTiles} from '../reward-tiles.js';
import {entryCard} from '../dungeon-entry.js';
import {journalPanel,bossLoot} from '../dungeon-journal.js';
import {TALENTS} from '../talents.js';
import {DUNGEONS} from '../content/index.js';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const arena={id:'icon-steps',seed:56753,spawn:{x:0,y:0},npc:{x:0,y:0},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[b]};
const game=(level=12,member)=>new Game(arena,{level,...(member?{member}:{})});
/** Alle Canvases eines HTML-Stücks: {size, attrs}; Breite = Höhe ist Pflicht. */
function canvases(html){return [...html.matchAll(/<canvas\b([^>]*)>/g)].map(([,a])=>({size:+(/\bwidth="(\d+)"/.exec(a)?.[1]),height:+(/\bheight="(\d+)"/.exec(a)?.[1]),attrs:a}));}
const sizesIn=(html,filter=/data-(item|skill|talent|spec)-art/)=>canvases(html).filter(c=>filter.test(c.attrs)).map(c=>{assert.equal(c.size,c.height,'quadratisch: '+c.attrs);return c.size;});
const only=(html,size,label,filter)=>{const s=sizesIn(html,filter);assert.ok(s.length,label+': keine Symbole gefunden');assert.deepEqual([...new Set(s)],[size],label+': '+s.join(','));};

test('nur drei Stufen 48/32/24, jeder Anzeigeort hat eine davon',()=>{
 assert.deepEqual(STEPS,[48,32,24]);
 for(const [place,size] of Object.entries(ICON_STEP))assert.ok(STEPS.includes(size),place+' = '+size);
 assert.equal(ICON_STEP.bar,48);assert.equal(ICON_STEP.bag,48);assert.equal(ICON_STEP.loot,48);assert.equal(ICON_STEP.book,48);assert.equal(ICON_STEP.talent,48);
 assert.equal(ICON_STEP.gear,32);assert.equal(ICON_STEP.tooltip,32);assert.equal(ICON_STEP.specTab,24);assert.equal(ICON_STEP.chat,24);assert.equal(ICON_STEP.chip,24);
 // Ohne Touch-Schicht (Node, Desktop) gilt die Desktopstufe; Touch-Kniffknöpfe ab 52 px 48, darunter 32.
 assert.equal(iconStep('bag'),48);assert.equal(iconStep('talent'),48);assert.equal(touchStep(56),48);assert.equal(touchStep(64),48);assert.equal(touchStep(48),32);assert.equal(touchStep(50),32);
});

test('icon-steps.css zeigt jeden Anzeigeort 1:1 in seiner Stufe und lädt als letzte Stildatei',()=>{
 const css=read('icon-steps.css').replace(/\r/g,''),seen=new Set();
 for(const m of css.matchAll(/\/\* stufe:(\w+) \*\/\s*(?:@media[^{]*\{)?([^{}]+)\{([^}]*)\}/g)){const [,place,selector,body]=m,size=ICON_STEP[place];
  assert.ok(size,'unbekannter Ort '+place);seen.add(place);
  assert.match(selector,/canvas/,place+': Regel gilt dem Canvas');
  assert.match(body,new RegExp('(^|;)width:'+size+'px!important'),place+': Breite '+size);
  assert.match(body,new RegExp(';height:'+size+'px!important'),place+': Höhe '+size);
  assert.match(body,/box-sizing:content-box/,place+': Rand liegt außen, das Symbol bleibt '+size);
  assert.match(body,/max-width:none!important;max-height:none!important/,place+': keine Obergrenze älterer Regeln (panel-pages.css max-width:38px)');
  assert.match(body,/image-rendering:pixelated/,place);
 }
 for(const place of Object.keys(ICON_STEP))assert.ok(seen.has(place),'Ort ohne Stufenregel: '+place);
 // Keine Größe außerhalb der Stufen in der Datei.
 for(const [,n] of css.matchAll(/canvas[^{]*\{[^}]*?width:(\d+)px/g))assert.ok(STEPS.includes(+n),'Canvasbreite '+n);
 const links=[...read('index.html').matchAll(/href="([^"]+\.css)"/g)].map(m=>m[1]);
 assert.equal(links.at(-1),'icon-steps.css','icon-steps.css muss nach allen anderen Stildateien laden');
});

test('Rucksack 48, Beute 48, Figurenplätze 32, Tooltip-Köpfe 32 – Canvas-Größe wie in icon-steps.css',()=>{
 const g=game(12);for(const id of Object.keys(ITEMS).filter(id=>ITEMS[id].slot).slice(0,6))g.rpg.inventory.push({id,count:1});
 const bag=inventoryPanel(g,null);only(bag.slice(bag.indexOf('bag-grid')),ICON_STEP.bag,'Rucksack');
 const bagId=Object.keys(ITEMS).find(id=>ITEMS[id].slot);
 only(lootPanel({id:1,x:g.player.x,y:g.player.y,coins:3,items:[{id:bagId,count:1}]},g),ICON_STEP.loot,'Beute');
 const sheet=characterPanel(g),grid=sheet.slice(sheet.indexOf('equipment-grid'),sheet.indexOf('weapon-summary'));only(grid,ICON_STEP.gear,'Figurenplätze');
 only(itemTooltip(g,bagId),ICON_STEP.tooltip,'Gegenstands-Tooltip');only(itemTooltip(g,'coins'),ICON_STEP.tooltip,'Pfandmarken-Tooltip');
 only(itemTooltipR3(g,bagId).main,ICON_STEP.tooltip,'Tooltip Runde 3');
 assert.match(itemIcon(bagId),/width="48" height="48"/);assert.match(itemSymbol(bagId,24),/width="24" height="24"/);
});

test('Kniff-Buch 48, Kniff-Tooltip 32, Talentknoten 48, Pfad- und Spez-Reiter 24, Talent-Tooltip 32',()=>{
 const g=game(20);
 only(iconBook(g,null,null),ICON_STEP.book,'Kniff-Buch');
 only(skillTooltip(g,g.skills[0].id),ICON_STEP.tooltip,'Kniff-Tooltip');
 const html=talentsPanel(g),nodes=[...html.matchAll(/<button class="tt-node[^>]*>(<canvas[^>]*>)/g)].map(m=>m[1]);
 assert.ok(nodes.length>=5,'Talentknoten');for(const c of nodes)assert.match(c,/width="48" height="48"/,'Knoten 48');
 const paths=html.slice(html.indexOf('tt-path-tabs'),html.indexOf('</nav>',html.indexOf('tt-path-tabs')));
 const specs=html.slice(html.indexOf('tt-spec-tabs'),html.indexOf('tt-path-tabs'));
 only(specs,ICON_STEP.specTab,'Spez-Reiter');
 only(paths,ICON_STEP.pathTab,'Pfadreiter');
 const spec=Object.keys(TALENTS).find(s=>s.startsWith(g.member.id));only(talentTooltip(g,TALENTS[spec][0].id),ICON_STEP.tooltip,'Talent-Tooltip');
 // Vor der Freischaltung: die Vorschau zeigt große Wappen (48 im 72er-Feld).
 const low=game(2),locked=talentsPanel(low);only(locked.slice(locked.indexOf('tt-spec-tabs')),ICON_STEP.specLocked,'Wappen-Vorschau',/data-spec-art/);
});

test('Belohnungskacheln 32, Dungeon-Beute 32, Questwahl 48',()=>{
 const id=Object.keys(ITEMS).find(id=>ITEMS[id].slot);
 only(rewardTiles({xp:100,coins:5,items:[id],choice:true}),ICON_STEP.reward,'Belohnungskacheln',/./);
 const g=game(10),dungeon=Object.keys(DUNGEONS)[0];
 assert.ok(bossLoot(DUNGEONS[dungeon].bosses[0].id).length,'Boss mit Beute');
 only(entryCard(g,dungeon),ICON_STEP.dungeonLoot,'Eingangskarte',/data-item-art/);only(journalPanel(g,null,dungeon),ICON_STEP.dungeonLoot,'Journal',/data-item-art/);
});

test('Anzeigeorte im Quelltext: Leiste, Chat, Touch und Stärkungen nehmen ihre Stufe, kein 64er-Symbolcanvas mehr',()=>{
 const app=read('app.js');
 assert.match(app,/px=barStep\(\),spx=barStep\(true\)/,'Leiste: Stufe aus icon-steps.js');
 assert.match(app,/<canvas width="'\+\(special\?spx:px\)\+'" height="'\+\(special\?spx:px\)\+'" data-skill-art=/,'Leiste: Kniff 48, Leer/Q 32');
 assert.match(app,/<canvas width="'\+px\+'" height="'\+px\+'" data-item-art="'\+itemArt\(slot\.id\)/,'Leiste: Gegenstand');
 assert.match(app,/mountBarButton\(slot,game,px\)/,'Leiste: Reittier');
 assert.match(app,/<canvas width="'\+ICON_STEP\.chat\+'" height="'\+ICON_STEP\.chat\+'" data-item-art="'\+itemArt\(l\.id\)/,'Chat 24 über itemArt');
 assert.doesNotMatch(app,/styleIcon\(c\)\);?\}?\);\s*\n\s*else if\(d\.itemArt/,'kein styleIcon nach Gegenständen');
 assert.doesNotMatch(app,/paint(Item|TalentIcon|SpecIcon|SkillIcon)\([^;]*\);styleIcon/,'kein styleIcon mehr im Malweg der Symbole (A4)');
 const mobile=read('mobile-controls.js');assert.match(mobile,/art\(id,special\?ICON_STEP\.touchSmall:touchStep\(touchSize\(\)\)\)/,'Touch-Kniffknöpfe');
 assert.match(read('aura-ui.js'),/width="'\+ICON_STEP\.aura\+'"/,'Stärkungen 32');
 // Kein Symbolcanvas in einer Größe außerhalb der Stufen (vorher 64er-Talente und -Wappen).
 const files=readdirSync(new URL('../',import.meta.url)).filter(f=>f.endsWith('.js')&&!/demo|proto|workshop|sprite-lab|artbook|art-handoff|redesign|graphics|gait|art-precision|maifeld-prototype/.test(f));
 for(const f of files)for(const [tag] of read(f).matchAll(/<canvas[^>]*data-(?:item|skill|talent|spec|touch)-art[^>]*>/g)){const n=/width="(\d+)"/.exec(tag)?.[1];if(n)assert.ok(STEPS.includes(+n),f+': '+tag);}
});

test('jeder Ort mit Gegenstandssymbol geht über itemArt – auch gewürfelte Ausrüstung zeigt überall dasselbe Bild',()=>{
 // Quelltext: kein rohes item.icon mehr in einem data-item-art (P-B), die genannten Orte rufen itemArt.
 const files=readdirSync(new URL('../',import.meta.url)).filter(f=>f.endsWith('.js'));
 for(const f of files){const src=read(f);for(const m of src.matchAll(/data-item-art="([^"]{0,140})/g)){
  assert.doesNotMatch(m[1],/ITEMS\[[^\]]+\]\??\.icon|ITEM_CATALOG|\bit\.icon|\bd\.icon/,f+': rohes item.icon im Symbol ('+m[1].slice(0,60)+')');}}
 const uses={'app.js':2,'reward-tiles.js':1,'dungeon-entry.js':1,'dungeon-journal.js':1,'combat-ui.js':1,'net-party.js':1};
 for(const [f,n] of Object.entries(uses)){const src=read(f);assert.match(src,/import \{[^}]*\bitemArt\b[^}]*\} from '\.\/rpg-ui\.js'/,f+' importiert itemArt');
  assert.ok((src.match(/data-item-art="'?\+?\$?\{?(?:esc\()?(?:ITEMS\[m\.item\.id\]\?)?itemArt\(/g)||[]).length>=n,f+': '+n+'× data-item-art über itemArt');}
 // Laufzeit: eine gewürfelte Keule – Rucksack, Belohnung, Questwahl, Tooltip und Journal zeigen dasselbe Bild.
 const g=game(11),id=registerRoll(g.rpg,ITEMS,{slot:'weapon',spec:'tresen',level:5,quality:'rare',roll:7});/* roll 7 → Keule */
 assert.equal(ITEMS[id]?.weapon?.type,'club','gewürfelte Keule registriert');const art=itemArt(id);
 const pick=html=>[...html.matchAll(/data-item-art="([^"]+)"/g)].map(m=>m[1]);
 assert.notEqual(art,ITEMS[id].icon,'itemArt nimmt das Figurenteil der Keule, nicht das rohe Symbol „'+ITEMS[id].icon+'“');
 for(const [label,html] of [['Rucksack',itemIcon(id)],['Tooltip',itemTooltip(g,id)],['Belohnung',rewardTiles({items:[id]})],['Symbol',itemSymbol(id,24)]])assert.deepEqual([...new Set(pick(html))],[art],label);
 // Questwahl: jede Option zeigt ihr itemArt in Stufe 48.
 const quest=rewardPanel(g,'main-3'),ids=[...quest.matchAll(/data-reward-choice="([^"]+)"/g)].map(m=>m[1]);
 assert.ok(ids.length,'Questwahl hat Optionen');assert.deepEqual(pick(quest),ids.map(x=>itemArt(x)));only(quest,ICON_STEP.rewardOption,'Questwahl');
});

test('Flächenmittel rastet auf die Farben der Quelle ein: gesättigtes Rot bleibt Rot, halbe Deckung fällt weg',async()=>{
 const {shrinkPixels,sourcePalette}=await import('../content-art.js');
 // 4×4: linke Hälfte Waffenkammer-Rot #ea1d13, rechte Hälfte Tinte #171f29 → 2×2 bleibt exakt in diesen Farben (kein Ziegelorange).
 const red=[0xea,0x1d,0x13],ink=[0x17,0x1f,0x29],src=new Uint8ClampedArray(4*4*4);
 for(let y=0;y<4;y++)for(let x=0;x<4;x++)src.set([...(x<2?red:ink),255],(y*4+x)*4);
 assert.deepEqual(sourcePalette(src).map(c=>c.join(',')),[red.join(','),ink.join(',')]);
 const out=shrinkPixels(src,4,4,2,2);assert.deepEqual([...out.slice(0,4)],[...red,255]);assert.deepEqual([...out.slice(4,8)],[...ink,255]);
 // 3 → 2: jeder Zielpixel mischt Quellpixel anteilig; unter 50 % Deckung bleibt er leer.
 const thin=new Uint8ClampedArray(3*1*4);thin.set([...red,255],0);const t=shrinkPixels(thin,3,1,2,1);assert.equal(t[3],255);assert.equal(t[7],0);
});
