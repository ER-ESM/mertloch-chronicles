// E-75 Waffenkammer: Wirkungen der acht festen Waffen (content/items.js PROCS mit trigger, Laufzeit procs.js fireItemProcs).
// Je Wirkung: Auslösung, Wirkung, Abklingzeit bzw. Zähler, keine Wirkung ohne angelegte Waffe; dazu Autoangriff über tickAuto,
// Tooltip, Inhaltsregeln und Spielstand. Zufall fest: g.random=()=>0 würfelt jede Chance und jeden Glückstreffer, .99 keinen.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {addItem,equipItem,combatStats} from '../rpg.js';
import {startAuto} from '../auto-combat.js';
import {foeDamageFactor} from '../procs.js';
import {itemTooltipR3,itemTooltip} from '../rpg-ui.js';
import {PROCS,ITEM_CATALOG,ITEM_PROC_TRIGGERS,PROC_TRIGGERS,BAG_UI,describeProc,validateContent} from '../content/index.js';

const WAFFEN={grillzange:'embers',rohrzange:'puddle',masskrugschild:'stein',gartenzwerg:'cowed',fasskeule:'tap',schorlenspritze:'sticky',kronkorkenstern:'capsplash',blitzschrauber:'overload'};
const arena=()=>({spawn:{x:0,y:0},npc:{x:0,y:20},landmarks:[],camps:[],quests:[],blocked:()=>false,findClear:(x,y)=>({x,y}),lineClear:()=>true,findPath:(a,b)=>[b]});
const AT={x:1000,y:1000};
/** Held (Stufe 12) mit angelegten Teilen {Platz: Kennung}, drei festgehaltene Gegner vor ihm; kein Würfelglück, bis der Test es will. */
function setup(classId,equip={},{level=12,bag=[]}={}){
 const g=new Game(arena(),{classId,level,tutorial:{completed:true}});g.toast=()=>{};g.fail=()=>{};g.random=()=>.99;
 for(const [slot,id] of Object.entries(equip)){addItem(g.rpg,id);assert.ok(equipItem(g,id,slot),id+' anlegen');}
 for(const id of bag)addItem(g.rpg,id);
 g.refreshStats();Object.assign(g.player,AT);g.player.hp=g.player.maxHp;g.player.inCombat=7;
 const foes=[0,1,2].map(i=>{const e=makeEnemy({x:AT.x+30,y:AT.y+(i-1)*16},900+i,{hp:99999,roamWait:100,attackTimer:100,stun:1e9,damage:1});e.aggro=true;e.ai='combat';e.arena=true;return e;});
 g.enemies=foes;g.target=foes[0];g.events.length=0;return {g,foes};}
/** Ein Autoangriff wie tickAuto: Waffenwurf 20, Platz der Waffe. */
const auto=(g,e,slot='weapon',n=20)=>g.damage(e,n,'Autoangriff',slot);
const step=(g,foes,seconds,dt=.05)=>{for(let t=0;t<seconds-1e-9;t+=dt){g.tick(dt);g.player.inCombat=7;for(const e of foes){e.x=e.home.x;e.y=e.home.y;}}};
const fired=(g,id)=>g.events.filter(e=>e.type==='itemProc'&&e.id===id).length;
const notes=g=>g.events.filter(e=>e.type==='combat'&&e.area==='note').map(e=>e.text);
/** Treffer je Bezeichnung mitzählen (Kampfstatistik-Name der Wirkung). */
function countHits(g){const hits={},damage=g.damage.bind(g);g.damage=(e,n,label,...rest)=>{const before=e.hp,r=damage(e,n,label,...rest);if(before>e.hp)(hits[label]||=[]).push({e,amount:before-e.hp});return r;};return hits;}

test('Katalog: jede der acht Waffen trägt ihre milde Wirkung – keine Dorflegende, Auslöser aus dem Proc-Vokabular, Zahlen im Text',()=>{
 assert.deepEqual(validateContent(),[]);
 for(const t of ITEM_PROC_TRIGGERS)assert.ok(PROC_TRIGGERS.includes(t),t+': Waffen und Talente teilen die Auslöser');
 for(const [id,proc] of Object.entries(WAFFEN)){const d=ITEM_CATALOG[id],p=PROCS[proc];
  assert.equal(d.proc,proc,id+': Wirkung');assert.ok(p&&p.trigger,proc+': Waffenwirkung mit Auslöser');assert.ok(!d.unique&&d.rarity!=='epic',id+': keine Dorflegende');
  assert.ok(p.name&&p.label,proc+': Name für Kampfstatistik und Kampftext');
  // jede Zahl aus den Daten steht im Tooltip-Text (außer dem Umkreis) – Text und Wirkung laufen nicht auseinander
  for(const n of describeProc(proc).numbers){if(n.label==='Umkreis')continue;assert.ok(p.text.includes(String(n.value).replace('.',',')),proc+': „'+n.label+' '+n.value+'“ fehlt im Text: '+p.text);}
  // Autoangriffs-Wirkungen würfeln, zählen oder ruhen – nie bei jedem Treffer (milder als die Legenden)
  if([].concat(p.trigger).includes('autoHit'))assert.ok(p.chance<1||p.every>1||p.icd>0,proc+': gebremst');}
 // Die Parade braucht einen Schild – deshalb löst Gerd (Zweihänder) über Ausweichen und Unterbrechen aus, der Maßkrug über die Parade.
 assert.deepEqual([].concat(PROCS.cowed.trigger).sort(),['dodge','interrupt']);assert.equal(PROCS.stein.trigger,'parry');assert.equal(ITEM_CATALOG.masskrugschild.shield,true);
});

test('Tooltip: grüne Zeile „Anlegen: …“ mit dem Wirkungstext – auch für Dorflegenden',()=>{
 const {g}=setup('dieter',{},{bag:['rohrzange','keilerzahn']});
 for(const [id,proc] of Object.entries(WAFFEN)){const main=itemTooltipR3(g,id).main;assert.ok(main.includes(BAG_UI.tipProc+PROCS[proc].text),id+': Wirkungszeile fehlt');assert.match(main,/tooltip-affixes tip-proc/);}
 assert.ok(itemTooltip(g,'rohrzange').includes(PROCS.puddle.text),'auch der einfache Tooltip');
 assert.ok(itemTooltipR3(g,'keilerzahn').main.includes(PROCS.rage.text),'Dorflegende zeigt ihren Proc');
 assert.ok(!itemTooltipR3(g,'dosenbrecher').main.includes('tip-proc'),'ohne Proc keine Zeile');
});

test('Grillzange: Autoangriffe setzen mit 20 % Glut – Glutbrand für jede Klasse, drei Ticks, stärkerer Brand bleibt, ohne Waffe nichts',()=>{
 const {g,foes}=setup('dieter',{weapon:'grillzange'}),e=foes[0],hits=countHits(g);
 auto(g,e);assert.equal(e.burn,undefined,'Wurf .99 ≥ 20 %: keine Glut');
 g.random=()=>0;auto(g,e);assert.equal(fired(g,'embers'),1);
 assert.equal(e.burn.dps,Math.round(20*PROCS.embers.burn/PROCS.embers.duration),'Nachbrennen aus dem Grundtreffer');assert.equal(e.burn.label,PROCS.embers.name);
 g.random=()=>.99;step(g,foes,PROCS.embers.duration+.5);
 assert.equal(hits[PROCS.embers.name]?.length,PROCS.embers.duration,'ein Tick je Sekunde, bei Dosen-Dieter (nicht nur am Grill)');assert.ok(!(e.burn.t>0),'Brand erloschen');
 e.burn={t:6,tick:1,dps:50};g.random=()=>0;auto(g,e);assert.equal(e.burn.dps,50,'ein stärkerer Brand (Glutbrocken) wird nicht überschrieben');
 // keine Wirkung ohne angelegte Waffe, und nur der eigene Autoangriff zählt
 const bag=setup('dieter',{},{bag:['grillzange']});bag.g.random=()=>0;auto(bag.g,bag.foes[0]);assert.equal(bag.foes[0].burn,undefined,'im Rucksack wirkt sie nicht');
 const other=setup('dieter',{weapon:'grillzange'});other.g.random=()=>0;auto(other.g,other.foes[0],'ranged');assert.equal(other.foes[0].burn,undefined,'Fernkampf-Autoangriff zählt nicht für die Klinge');
 other.g.damage(other.foes[0],20,'Kelle');assert.equal(other.foes[0].burn,undefined,'Kniffe zählen nicht, nur Autoangriffe');
});

test('Rohrzange: Pfütze unter dem Ziel bremst Gegner darin, höchstens alle 6 s, Chance 25 %',()=>{
 const {g,foes}=setup('dieter',{weapon:'rohrzange'}),P=PROCS.puddle;
 auto(g,foes[0]);assert.equal(g.fields.length,0,'Wurf .99: keine Pfütze');
 g.random=()=>0;auto(g,foes[0]);const z=g.fields.find(f=>f.kind===P.field);
 assert.ok(z&&z.slow&&z.radius===P.radius&&z.remaining===P.duration,'Bodenfläche wie die Hopfenpfütze');assert.deepEqual([z.x,z.y],[foes[0].x,foes[0].y]);
 const far=makeEnemy({x:AT.x+300,y:AT.y},990,{hp:9999,stun:1e9,attackTimer:100});far.aggro=true;far.ai='combat';far.arena=true;g.enemies.push(far);foes.push(far);
 step(g,foes,.2);assert.ok(foes[0].controlSlow>0&&foes[1].controlSlow>0,'Gegner in der Pfütze laufen langsamer');assert.equal(far.controlSlow||0,0,'außerhalb nicht');
 auto(g,foes[0]);assert.equal(g.fields.filter(f=>f.kind===P.field).length,1,'interne Abklingzeit: keine zweite Pfütze');
 step(g,foes,P.icd);assert.equal(g.fields.filter(f=>f.kind===P.field).length,0,'Pfütze nach '+P.duration+' s weg');
 auto(g,foes[0]);assert.equal(g.fields.filter(f=>f.kind===P.field).length,1,'nach '+P.icd+' s wieder bereit');
 assert.equal(fired(g,'puddle'),2);assert.ok(notes(g).includes(P.label),'Kampftext „PFÜTZE“');
 // Nebenhand: auch die zweite Rohrzange zählt mit ihrem eigenen Autoangriff
 const off=setup('dieter',{weapon:'dosenbrecher',offhand:'rohrzange'});off.g.random=()=>0;auto(off.g,off.foes[0],'weapon');assert.equal(off.g.fields.length,0,'Haupthand-Schlag der anderen Waffe');
 auto(off.g,off.foes[0],'offhand');assert.equal(off.g.fields.length,1,'Nebenhand-Schlag der Rohrzange');
});

test('Fasskeule: jeder 3. Autoangriff heilt und gibt Randale – Zähler läuft weiter, ohne Waffe nichts',()=>{
 const {g,foes}=setup('dieter',{weapon:'fasskeule'}),P=PROCS.tap;g.player.hp=200;g.player.energy=0;
 auto(g,foes[0]);auto(g,foes[0]);assert.equal(g.player.hp,200,'nach zwei Schlägen noch nichts');const energy=g.player.energy;
 auto(g,foes[0]);assert.ok(g.player.hp>=200+P.heal,'Leben zurück: '+g.player.hp);assert.equal(g.player.energy-energy,P.energy,'Randale 1:1 aus Ressourcenpunkten');assert.equal(fired(g,'tap'),1);
 for(let i=0;i<3;i++)auto(g,foes[0]);assert.equal(fired(g,'tap'),2,'der 6. Schlag zapft wieder');
 // Klassenressource je Klasse umgerechnet: Kevins Kasten füllt sich in Flaschen (10 : 1)
 const kev=setup('kevin',{weapon:'fasskeule'});kev.g.res.frac=.9;kev.g.res.bottles=0;for(let i=0;i<3;i++)auto(kev.g,kev.foes[0]);assert.equal(kev.g.res.bottles,1,'3 Punkte = 0,3 Flaschen, mit Rest 0,9 eine Flasche');
 const bag=setup('dieter',{},{bag:['fasskeule']});bag.g.player.hp=200;for(let i=0;i<6;i++)auto(bag.g,bag.foes[0]);assert.equal(bag.g.player.hp,200,'im Rucksack wirkt sie nicht');
});

test('Kronkorken-Morgenstern: nur Glückstreffer der Autoangriffe streuen 30 % an kämpfende Nachbarn, keine Kette',()=>{
 const {g,foes}=setup('dieter',{weapon:'kronkorkenstern'}),P=PROCS.capsplash,hits=countHits(g);
 auto(g,foes[0]);assert.equal(hits[P.name],undefined,'ohne Glückstreffer kein Korken');
 foes[2].aggro=false;foes[2].ai='idle';
 g.random=()=>0;auto(g,foes[0]);assert.equal(fired(g,'capsplash'),1,'genau ein Korken – die Streutreffer lösen keinen weiteren aus');
 const hit=hits[P.name]||[];assert.deepEqual(hit.map(h=>h.e),[foes[1]],'nur der kämpfende Nachbar, nicht das Ziel, nicht der neutrale');
 assert.ok(foes[2].aggro===false,'der neutrale Gegner bleibt ruhig');
 g.damage(foes[0],20,'Kelle');assert.equal(fired(g,'capsplash'),1,'Glückstreffer eines Kniffs zählt nicht');
 const bag=setup('dieter',{},{bag:['kronkorkenstern']});bag.g.random=()=>0;const h2=countHits(bag.g);auto(bag.g,bag.foes[0]);assert.equal(h2[P.name],undefined,'im Rucksack wirkt er nicht');
});

test('Gartenzwerg: Ausweichen oder Unterbrechen schüchtert ein – 15 % weniger Schaden für 4 s, höchstens alle 12 s',()=>{
 const P=PROCS.cowed,{g,foes}=setup('kevin',{weapon:'gartenzwerg'}),e=foes[0],p=g.player;
 const hurt=(foe)=>{g.classState.guard=0;p.invulnerable=0;p.parry=0;p.hp=p.maxHp;g.hitPlayer(foe,1000);return p.maxHp-p.hp;};
 const plain=hurt(foes[1]);
 p.hp=p.maxHp;p.invulnerable=.4;g.hitPlayer(e,1000);assert.equal(p.hp,p.maxHp,'ausgewichen');assert.equal(e.cowed,P.duration);assert.equal(foeDamageFactor(e),1-P.weaken);
 assert.ok(notes(g).includes(P.label),'Kampftext „EINGESCHÜCHTERT“');
 const cowed=hurt(e);assert.ok(cowed<plain&&Math.abs(cowed/plain-(1-P.weaken))<.02,'eingeschüchtert trifft schwächer: '+cowed+' statt '+plain);
 step(g,foes,P.duration+.1);assert.equal(foeDamageFactor(e),1,'nach '+P.duration+' s vorbei');
 p.invulnerable=.4;g.hitPlayer(e,1000);assert.equal(e.cowed||0,0,'interne Abklingzeit '+P.icd+' s');
 step(g,foes,P.icd-P.duration);
 // Unterbrechen (Kniff „interrupt“) löst ebenso aus
 foes[1].cast={type:'call',name:'Ruf',interruptible:true,remaining:2,total:2};g.target=foes[1];g.gcd=0;g.cooldowns.interrupt=0;
 assert.ok(g.action('interrupt'),'unterbrochen');assert.equal(foes[1].cowed,P.duration,'nach dem Unterbrechen eingeschüchtert');
 // Ohne Gerd: Ausweichen ohne Folgen
 const bag=setup('kevin',{},{bag:['gartenzwerg']});bag.g.player.invulnerable=.4;bag.g.hitPlayer(bag.foes[0],1000);assert.equal(bag.foes[0].cowed||0,0);
});

test('Maßkrug-Schild: geglückte Paraden füllen den Krug (1/3, 2/3), die dritte gibt 40 Leben – der Topfdeckel nicht',()=>{
 const P=PROCS.stein,{g,foes}=setup('dieter',{offhand:'masskrugschild'}),p=g.player,parry=()=>{p.parry=.8;g.hitPlayer(foes[0],50);};
 p.hp=300;parry();parry();assert.deepEqual(notes(g).filter(t=>t.startsWith(P.countLabel)),[P.countLabel+' 1/3',P.countLabel+' 2/3'],'Zählstand im Kampftext');
 const before=p.hp;assert.equal(fired(g,'stein'),0);parry();assert.equal(fired(g,'stein'),1);assert.ok(p.hp>=before+P.heal,'Schluck: '+(p.hp-before));
 assert.ok(notes(g).includes(P.label),'Kampftext „SCHLUCK“');
 parry();assert.ok(notes(g).filter(t=>t===P.countLabel+' 1/3').length===2,'der Krug fängt von vorn an');
 const deckel=setup('dieter',{offhand:'topfdeckel'});deckel.g.player.hp=300;for(let i=0;i<3;i++){deckel.g.player.parry=.8;deckel.g.hitPlayer(deckel.foes[0],50);}assert.equal(fired(deckel.g,'stein'),0,'ohne Maßkrug kein Schluck');
});

test('Schorlen-Spritze: der Strahl macht das Ziel mit 30 % klebrig – 3 s langsamer, nur mit Fernkampf-Autoangriff',()=>{
 const P=PROCS.sticky,{g,foes}=setup('kevin',{ranged:'schorlenspritze'});
 auto(g,foes[0],'ranged');assert.equal(foes[0].controlSlow||0,0,'Wurf .99: nicht klebrig');
 g.random=()=>0;auto(g,foes[0],'ranged');assert.equal(foes[0].controlSlow,P.slow);assert.ok(notes(g).includes(P.label));
 auto(g,foes[1],'weapon');assert.equal(foes[1].controlSlow||0,0,'Nahkampf-Autoangriff zählt nicht für die Spritze');
 step(g,foes,P.slow+.1);assert.equal(foes[0].controlSlow,0,'nach '+P.slow+' s wieder frei');
 const bag=setup('kevin',{},{bag:['schorlenspritze']});bag.g.random=()=>0;auto(bag.g,bag.foes[0],'ranged');assert.equal(bag.foes[0].controlSlow||0,0);
});

test('Blitzschrauber: der 12. Autoangriff entlädt einen Überlast-Stoß (100 % des Treffers); stirbt das Ziel, wartet die Ladung',()=>{
 const P=PROCS.overload,{g,foes}=setup('kevin',{ranged:'blitzschrauber'}),hits=countHits(g);
 for(let i=1;i<P.every;i++)auto(g,foes[0],'ranged');assert.equal(hits[P.name],undefined,'Akku lädt noch');
 auto(g,foes[0],'ranged');assert.equal(hits[P.name]?.length,1,'Überlast beim '+P.every+'. Schlag');
 const plain=hits.Autoangriff[0].amount;/* der letzte Eintrag enthält den Stoß mit – er fällt ans Ende desselben Treffers */assert.equal(hits[P.name][0].amount,plain,'gleich stark wie ein Treffer (100 %)');
 // Ziel stirbt am vollen Akku: die Ladung geht auf das nächste lebende Ziel
 for(let i=1;i<P.every;i++)auto(g,foes[0],'ranged');foes[0].hp=1;auto(g,foes[0],'ranged');assert.equal(hits[P.name].length,1,'kein Stoß ins tote Ziel');
 auto(g,foes[1],'ranged');assert.equal(hits[P.name].length,2,'die volle Ladung trifft das nächste');assert.equal(hits[P.name][1].e,foes[1]);
 const bag=setup('kevin',{},{bag:['blitzschrauber']});const h2=countHits(bag.g);for(let i=0;i<P.every;i++)auto(bag.g,bag.foes[0],'ranged');assert.equal(h2[P.name],undefined,'im Rucksack wirkt er nicht');
});

test('Im Spiel: echte Autoangriffe (tickAuto) lösen die Waffenwirkung aus – eine Nahkampfwaffe bei Fernkampf-Autoangriff nie',()=>{
 for(const [cls,slot,id] of [['dieter','weapon','grillzange'],['dieter','weapon','rohrzange'],['dieter','weapon','fasskeule'],['dieter','weapon','kronkorkenstern'],['kevin','ranged','schorlenspritze'],['kevin','ranged','blitzschrauber']]){
  const {g,foes}=setup(cls,{[slot]:id});g.random=()=>0;assert.ok(startAuto(g));step(g,foes,30);
  assert.ok(fired(g,WAFFEN[id])>0,cls+' + '+id+': Wirkung über den Autoangriff');}
 const miss=setup('kevin',{weapon:'rohrzange'});miss.g.random=()=>0;startAuto(miss.g);step(miss.g,miss.foes,20);assert.equal(fired(miss.g,'puddle'),0,'Kevin schießt – die Rohrzange schwingt nie');
});

test('Spielstand: Waffen mit Wirkung laden aus alten Ständen, und nichts von der Wirkung landet im Stand',()=>{
 const {g,foes}=setup('dieter',{weapon:'rohrzange',offhand:'masskrugschild'});g.random=()=>0;auto(g,foes[0]);foes[0].cowed=3;
 const saved=JSON.parse(JSON.stringify(g.save())),text=JSON.stringify(saved);
 for(const k of ['itemCd','item:puddle','cowed','procState'])assert.ok(!text.includes(k),k+' gehört nicht in den Spielstand');
 assert.equal(saved.rpg.equipment.weapon,'rohrzange');
 // Stand wie vor E-75 (dieselben Kennungen, kein Proc-Feld irgendwo): lädt, und die Wirkung greift sofort
 const back=new Game(arena(),saved);back.toast=()=>{};back.random=()=>0;assert.equal(back.rpg.equipment.weapon,'rohrzange');assert.equal(back.rpg.equipment.offhand,'masskrugschild');
 Object.assign(back.player,AT);const e=makeEnemy({x:AT.x+30,y:AT.y},901,{hp:9999,stun:1e9,attackTimer:100});e.aggro=true;e.ai='combat';e.arena=true;back.enemies=[e];
 auto(back,e);assert.equal(back.fields.filter(z=>z.kind==='pfuetze').length,1,'Pfütze nach dem Laden');
 assert.ok(combatStats(back).procs.includes('puddle')&&combatStats(back).procs.includes('stein'));
});
