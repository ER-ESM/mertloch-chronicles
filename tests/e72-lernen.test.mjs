// E-72 Runde 3 · „Lernen über das Bild“ (docs/e72-runde3/lernen.md): Käthe und Schorsch ohne Vorwissen spielbar.
// Prüft den Vertrag zwischen Spielzustand und Bild: Wirkung und Tempo je Karte, das nächste Grillgut, die Bild-Schritte der
// Hofprobe, kein Zufallsleuchten auf Ressourcen-Plätzen, kurze Tooltips. Browser-Abnahme: scripts/e72-lernen-check.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {RESOURCES,RESOURCE_HUD_TEXT,TUTORIAL,CLASS_SPECS} from '../content/index.js';
import {resourceHud,resourceVariant,handCard} from '../class-resources.js';
import {CARD_EFFECT_ICON,cardTempo,spriteProblems,spriteSize} from '../resource-art.js';
import {tutorialConfirm,tutorialSignal} from '../tutorial.js';
import {tutorialGuide,guideHtml,guideKey} from '../tutorial-guide.js';
import {tutorialTrackerEntry,trackerHtml} from '../quest-tracker.js';
import {skillStatus} from '../combat-ui.js';
import {skillHelp} from '../mechanic-help.js';

const world=()=>({id:'lernen',seed:1,spawn:{x:500,y:500},npc:{x:500,y:480},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[{...b}]});
function hero(classId,level=12,spec=CLASS_SPECS[classId]?.[0]){const g=new Game(world(),{classId,level,rpg:{talents:{spec,learned:[]}}});g.random=()=>.5;g.player.x=g.player.y=0;g.player.hp=g.player.maxHp;return g;}
function foe(g,x=40){const e=makeEnemy({x,y:0},g.enemies.length+1,{hp:100000,aggro:true,ai:'combat',attackTimer:100});g.enemies.push(e);g.target=e;return e;}
const cast=(g,id)=>{g.gcd=0;g.cooldowns[id]=0;return g.action(id);};

test('jede Kartenfarbe hat ein eigenes Wirkungsbild, jedes Tempo ein Abzeichen (7–9 schnell, 10/Ass stark, Bube Trumpf)',()=>{
 assert.deepEqual(Object.keys(CARD_EFFECT_ICON).sort(),Object.keys(RESOURCES.kaethe.suits).sort());
 assert.equal(new Set(Object.values(CARD_EFFECT_ICON)).size,4,'vier verschiedene Bilder');
 for(const name of Object.values(CARD_EFFECT_ICON)){const {w,h}=spriteSize(name);assert.ok(w>=10&&w<=13&&h>=10&&h<=13,name+' passt in die Karte ('+w+'×'+h+')');}
 const tempo=Object.fromEntries(Object.keys(RESOURCES.kaethe.ranks).map(r=>[r,cardTempo({suit:'herz',rank:r})]));
 assert.deepEqual(tempo,{7:'quick',8:'quick',9:'quick',D:null,K:null,10:'strong',A:'strong',B:'trump'});
 for(const [r,t] of Object.entries(tempo))if(t==='quick')assert.ok(RESOURCES.kaethe.ranks[r].quick,'schnell = kurze globale Abklingzeit: '+r);
 assert.deepEqual(spriteProblems(),[]);
});

test('Käthe: der Karten-Tooltip nennt Wirkung, Abzeichen und Stich – ohne Skat-Vorwissen',()=>{
 const g=hero('kaethe');foe(g);g.res.hand=[{suit:'kreuz',rank:'10'},{suit:'pik',rank:'8'},{suit:'herz',rank:'B'}];
 assert.match(skillHelp(g,'strike'),/trifft dein Ziel.*Stark \(Stern\)/);assert.match(skillHelp(g,'mark'),/Schnell \(»\)/);assert.match(skillHelp(g,'burst'),/Trumpf \(Krone\)/);
 g.res.chain={suit:'herz',n:0};assert.match(skillHelp(g,'burst'),/Kettenrahmen/,'Bube bedient jede Farbe');assert.doesNotMatch(skillHelp(g,'mark'),/Kettenrahmen/);
 g.target.cast={type:'call',name:'Ruf',interruptible:true,remaining:2,total:2,card:{suit:'kreuz',rank:'9'}};
 assert.match(skillHelp(g,'strike'),/Goldschein – sticht/);assert.equal(resourceVariant(g,'strike').tone,'gold','Kreuz-Zehn sticht Kreuz-Neun');assert.notEqual(resourceVariant(g,'mark').tone,'gold','Pik sticht Kreuz nicht');
});

test('Käthes Kartenplätze und Schorschs Auflegen/Servieren leuchten nicht zufällig als „ideales Zeitfenster“',()=>{
 const k=hero('kaethe');foe(k);k.player.inCombat=5;
 for(const id of ['strike','mark','burst']){const st=skillStatus(k,id);assert.ok(st.usable,id+' benutzbar');assert.equal(st.ideal,false,'Käthe '+id);}
 const s=hero('schorsch');foe(s,30);s.player.inCombat=5;s.res.rost=[{item:'wurst',done:.7,smoked:false}];
 assert.equal(skillStatus(s,'mark').ideal,false,'Auflegen leuchtet nicht mehr bei jedem unmarkierten Ziel');assert.equal(skillStatus(s,'burst').ideal,false);
 const d=hero('dieter');foe(d);d.player.energy=100;assert.equal(skillStatus(d,'mark').ideal,true,'Dieters Markierung behält ihr Zeitfenster');
});

test('Schorsch: die Anzeige nennt das nächste Grillgut – und Auflegen legt genau das auf',()=>{
 for(const spec of CLASS_SPECS.schorsch){const g=hero('schorsch',12,spec);foe(g,30);g.player.inCombat=5;
  for(let i=0;i<3;i++){const next=resourceHud(g).nextItem;assert.ok(RESOURCES.schorsch.items[next],spec+': '+next);cast(g,'mark');assert.equal(g.res.rost.at(-1).item,next,spec+': gelegt wie angezeigt');g.res.rost=[];}
  assert.match(skillHelp(g,'mark'),/Als Nächstes: /);}
 const g=hero('schorsch');foe(g,30);g.res.rost=[{item:'braten',done:.7,smoked:false}];assert.deepEqual(resourceVariant(g,'burst'),{name:'SCHWENKBRATEN GAR',tone:'gold',item:'braten'});
 g.res.rost=[{item:'braten',done:1.3,smoked:false}];assert.equal(resourceVariant(g,'burst').item,'braten','verkohlt trägt das Stück');
});

test('Hofprobe Käthe „Karten auf den Tisch“: drei Bild-Schritte – Karte spielen, Augen sammeln, ab 61 abrechnen',()=>{
 const g=new Game(world(),{classId:'kaethe'},{guidedStart:true}),tick=(n=1)=>{for(let i=0;i<n;i++)g.tick(.05);};
 assert.equal(tutorialGuide(g),null,'vor dem Kampfschritt keine Bild-Schritte');
 Object.assign(g.player,g.world.npc);tutorialConfirm(g);Object.assign(g.player,g.tutorial.course);tick(3);const e=g.enemies.find(x=>x.tutorial);g.target=e;tick(3);assert.equal(g.tutorial.step,3);
 let list=tutorialGuide(g);assert.deepEqual(list.map(s=>s.id),['play','augen','settle']);assert.deepEqual(list.map(s=>s.state),['now','next','locked'],'Abrechnen erst ab Stufe 2');
 assert.equal(list[0].key,'2','die Taste der Karte steht dabei');assert.ok(list[0].card&&list[0].card.suit,'die echte Karte von der Leiste');assert.equal(list[2].text,'Ab '+RESOURCES.kaethe.win+' abrechnen');assert.match(list[2].tip,/Stufe 2/);
 for(const s of list){assert.ok(s.text.length<=20,'eine kurze Zeile: '+s.text);assert.ok(s.tip.length<=140,'Tooltip kurz: '+s.tip);}
 Object.assign(g.player,{x:e.x-24,y:e.y});g.target=e;cast(g,'strike');tick(2);
 list=tutorialGuide(g);assert.equal(list[0].count,'1/'+TUTORIAL.hits);assert.equal(list[1].state,'now','Augen laufen');assert.ok(Number(list[1].count)>=RESOURCES.kaethe.augenPerCard,'Augenstand: '+list[1].count);
 const html=guideHtml(list);assert.equal((html.match(/<li /g)||[]).length,3);assert.match(html,/<kbd>2<\/kbd>/);assert.match(html,/data-tooltip-note=/);assert.ok(guideKey(list).includes('play'));
 const entry=tutorialTrackerEntry(g);assert.equal(entry.guide.length,3);const tracker=trackerHtml(g);assert.match(tracker,/class="tut-guide"/,'Verfolgung zeigt die Bild-Schritte');assert.doesNotMatch(tracker,/class="qt-hint"/,'statt der Erklärzeile');
 for(const cls of ['dieter','baerbel','kevin','schorsch']){const o=new Game(world(),{classId:cls},{guidedStart:true});o.tutorial.step=3;assert.equal(tutorialGuide(o),null,cls+' behält seine Zeile');}
 tutorialSignal(g,'strike');
});

test('Tooltips der neuen Marken und Zielbereiche bleiben kurz und nennen die Stufe beim Namen',()=>{
 const T=RESOURCE_HUD_TEXT;for(const s of [T.perfect.note(60,85,20),T.marks.win.note(61,true),T.marks.win.note(61,false),T.marks.schneider.note(90),T.marks.schwarz.note(120),T.trendRule]){assert.equal(typeof s,'string');assert.ok(s.length>8&&s.length<90,s);}
 assert.deepEqual([T.marks.win.label,T.marks.schneider.label,T.marks.schwarz.label],['Gewonnen','Schneider','Schwarz']);
 assert.match(T.marks.schneider.note(90),new RegExp('×'+String(RESOURCES.kaethe.abrechnen.schneider).replace('.',',')),'Faktor aus den Regeln, nicht festgeschrieben');
});
