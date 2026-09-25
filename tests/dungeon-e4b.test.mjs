// Dungeon Etappe 4 Teil B „Flügel, Beweise, Händler, Kampf-Klarheit“ (E-71, docs/DUNGEON-ETAPPE-4B-2026-09-25.md).
// Browserprüfung: scripts/dungeon-e4b-check.mjs. Zeiten je Flügel: node scripts/dungeon-sim.mjs --only=wings.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World} from '../world.js';
import {Game} from '../engine.js';
import {DUNGEONS,DUNGEON_E4B,DUNGEON_BOSSES,DUNGEON_REWARDS,DUNGEON_TEXT} from '../content/index.js';
import {ITEMS} from '../rpg.js';
import {toWorld,quietFloat,roomAt,dungeonAct,evidenceEffects,vendorStock,vendorBuy,dungeonTitles,normalizeDungeons,restoreDungeonRun} from '../dungeon.js';
import {dungeonFight,dungeonBossFight,BOSS_FIGHT_BARKS} from '../dungeon-clarity.js';
import {BossSpeech} from '../enemy-ui.js';

const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')),{});
const DEF=DUNGEONS['schloss-bigb'],DAY=Date.UTC(2026,8,25,12);
function game(level=10){const g=new Game(world,{level},{});g.toasts=[];g.toast=t=>g.toasts.push(t);g.random=()=>.5;g.clock=()=>DAY;return g;}
function inside(g){assert.ok(g.enterDungeon('schloss-bigb',{force:true}),'Dungeon betreten');return g.dungeonRun;}
const at=(g,floor,x,y)=>{Object.assign(g.player,toWorld(DEF,floor,x,y));g.player.inCombat=0;};
const quiet=g=>{for(const e of g.enemies)if(!e.dungeonBoss){e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=Infinity;}};
const bigbOf=g=>g.enemies.find(e=>e.bossId==='bigb');
const run=(g,seconds)=>{for(let t=0;t<seconds;t+=.05)g.tick(.05);};

test('Kampf-Klarheit: Kampf im Dungeon und Bosskampf werden erkannt',()=>{
 const g=game();inside(g);quiet(g);at(g,'k2',52,20);assert.equal(dungeonFight(g),false);assert.equal(dungeonBossFight(g),false);
 const b=bigbOf(g);b.aggro=true;b.ai='combat';assert.equal(dungeonFight(g),true);assert.equal(dungeonBossFight(g),true);
 at(g,'e0',31,34);assert.equal(dungeonFight(g),false,'weit weg zählt nicht als eigener Kampf');assert.equal(dungeonBossFight(g),true);
});

test('Kampf-Klarheit: im Bosskampf keine Sprechblasen in der Welt (außer Mitspielern); der Boss spricht im Bossrahmen',()=>{
 const g=game();inside(g);quiet(g);at(g,'k2',52,20);for(const id of ['merc-pils-peter','merc-radler-rita'])g.hireCompanion(id,{free:true});
 const b=bigbOf(g),sp=new BossSpeech(),merc=g.companions[0];sp.update(g);
 sp.bark({enemyId:merc.id,name:merc.name,text:'Endlich Bewegung.',kind:'companion',x:merc.x,y:merc.y},g);
 sp.bark({enemyId:b.id,name:b.name,text:'Ich reite nach LINKS!',kind:'boss',x:b.x,y:b.y},g);
 assert.equal(sp.activeBarks(g).length,2,'ohne Kampf beide');
 b.aggro=true;b.ai='combat';assert.deepEqual(sp.activeBarks(g),[],'im Bosskampf keine Blase in der Welt');
 assert.ok(BOSS_FIGHT_BARKS.has('player')&&!BOSS_FIGHT_BARKS.has('companion')&&!BOSS_FIGHT_BARKS.has('boss'));
 g.bark(b,'Willkommen auf Schloss Big B!','boss');assert.equal(b.lastBark?.text,'Willkommen auf Schloss Big B!','der Spruch geht in den Bossrahmen');
});

test('Kampf-Klarheit: Welt-Worte, die der Bossrahmen zeigt, entstehen im Bosskampf nicht; eigene Schwäche am Helden bleibt',()=>{
 const g=game();inside(g);quiet(g);at(g,'k2',52,20);g.hireCompanion('merc-pils-peter',{free:true});const b=bigbOf(g),merc=g.companions[0];Object.assign(merc,{x:b.x+30,y:b.y+10});
 g.texts.length=0;g.float(b.x,b.y-60,'GESTÄNDNIS');assert.equal(g.texts.length,1,'ohne Kampf erlaubt');
 b.aggro=true;b.ai='combat';g.texts.length=0;
 for(const w of ['GESTÄNDNIS','DIE GANZE WAHRHEIT','REICHWEITE +8 %','UNTERBROCHEN 1/2','+7300 · SELBST RAUSGEZOGEN'])g.float(b.x,b.y-60,w);
 g.float(merc.x,merc.y-58,'ZERTIFIKAT ×2');assert.equal(g.texts.length,0,'Doppelungen und Söldner-Schwäche fallen weg '+JSON.stringify(g.texts.map(t=>t.text)));
 g.float(g.player.x,g.player.y-58,'ZERTIFIKAT ×1');g.float(g.player.x,g.player.y-62,'GELOGEN');g.float(b.x,b.y-40,'1234');
 assert.deepEqual(g.texts.map(t=>t.text),['ZERTIFIKAT ×1','GELOGEN','1234'],'am Helden bleibt die eigene Schwäche, Treffer-Rückmeldung und Zahlen');
 assert.equal(quietFloat(g,'REICHWEITE +8 %',b.x,b.y),true);assert.ok(DUNGEON_E4B.clarity.hudFloats.length>=5);
});

// ── Flügel, Abkürzungen, Truhen, Beweise, Ereignisse, Händler, Erfolge ─────────────────────────────────────────────────────────────
const gerdOf=g=>g.enemies.find(e=>e.bossId==='gerd');
const act=(g,kind)=>{const it=g.interaction();assert.equal(it?.kind,'dungeonAct','F-Ziel da ('+kind+'): '+JSON.stringify(it));assert.equal(it.act,kind);return dungeonAct(g,it);};
/** Probe-Boss, solange Teil A ihn nicht gebaut hat (wie tests/dungeon-e3: Siegel greifen ohne Datenänderung). */
function probe(id,fn){const had=DUNGEON_BOSSES[id];if(!had)DUNGEON_BOSSES[id]={...DUNGEON_BOSSES.gerd,name:'Probe '+id,phases:[],fall:null};try{return fn();}finally{if(!had)delete DUNGEON_BOSSES[id];}}

test('Flügel: jeder Siegelträger öffnet seine Abkürzung zum Hof, sie hält bis zum Tagesreset – auch im nächsten Durchgang',()=>{
 const g=game(),r=inside(g);quiet(g);at(g,'e0',5,23);assert.equal(g.dungeonStep('treppe-zugbruecke','a'),false,'Kette vor Gerd zu');
 g.kill(gerdOf(g));assert.ok(r.unlocked.has('treppe-zugbruecke'),'Kette ist Abkürzung');assert.ok(g.toasts.some(t=>/Abkürzung offen/.test(t)));
 assert.ok(g.dungeons['schloss-bigb'].daily.shortcuts.includes('treppe-zugbruecke'),'im Tagesstand');
 g.leaveDungeon({force:true});g.time+=DEF.resetAfter+5;assert.ok(g.enterDungeon('schloss-bigb',{force:true}));const r2=g.dungeonRun;assert.notEqual(r2,r);
 assert.ok(gerdOf(g).hp>0,'Gerd steht im neuen Durchgang wieder');at(g,'e0',5,23);assert.ok(g.dungeonStep('treppe-zugbruecke','a'),'Kette bleibt offen');
 g.leaveDungeon({force:true});g.time+=DEF.resetAfter+5;g.clock=()=>DAY+86400e3;assert.ok(g.enterDungeon('schloss-bigb',{force:true}));at(g,'e0',5,23);assert.equal(g.dungeonStep('treppe-zugbruecke','a'),false,'am nächsten Tag wieder zu');
});
test('Flügel: Pappwand aus der Musterwohnung ist zu, bis Exposé liegt; Kurt öffnet den Aufzug auch von oben, der Hebel unten bleibt',()=>{
 const t=DEF.transitions.find(x=>x.id==='pappwand-hof');assert.equal(t.shortcut.boss,'expose');assert.equal(t.label,'pappwand');
 {const g=game();inside(g);quiet(g);at(g,'e0',20,36.5);assert.equal(g.dungeonStep('pappwand-hof','a'),false,'ohne Exposé zu');at(g,'e0',44,35.5);assert.equal(g.dungeonStep('aufzug','a'),false,'Aufzug von oben zu');at(g,'k2',6.5,6.5);assert.ok(g.dungeonStep('aufzug','b'),'Hebel unten wie bisher (Etappe 1)');}
 probe('expose',()=>probe('korkenkurt',()=>{const g=game(),r=inside(g);quiet(g);
  const ex=g.enemies.find(e=>e.bossId==='expose'),ku=g.enemies.find(e=>e.bossId==='korkenkurt');assert.ok(ex&&ku,'Probe-Bosse stehen');g.kill(ex);g.kill(ku);
  assert.ok(r.unlocked.has('pappwand-hof')&&r.unlocked.has('aufzug'));at(g,'e0',20,36.5);assert.ok(g.dungeonStep('pappwand-hof','a'),'Pappwand offen');
  assert.equal(roomAt(DEF,g.player.x,g.player.y)?.id,'musterwohnung');at(g,'e0',44,35.5);assert.ok(g.dungeonStep('aufzug','a'),'Aufzug nach Kurt auch von oben offen');}));
});
test('Kleine Truhe je Flügel: nach dem Siegelträger einmal je Durchgang ein Teil und eine Siegelmarke, nichts wird angelegt',()=>{
 const g=game(),r=inside(g);quiet(g);const w=DEF.wings.find(x=>x.id==='burghof');at(g,'e0',w.chest.x,w.chest.y);assert.notEqual(g.interaction()?.act,'wingChest','vor Gerd nichts');
 g.kill(gerdOf(g));at(g,'e0',w.chest.x,w.chest.y);const m0=g.dungeons['schloss-bigb'].marks;const res=act(g,'wingChest');
 assert.ok(res.ok&&res.bag,'Beutel');assert.equal(res.bag.items.length,1);assert.equal(res.bag.noEquip,true);assert.equal(g.dungeons['schloss-bigb'].marks,m0+DUNGEON_REWARDS.wingChest.marks);
 assert.ok(r.wingChests.has('burghof'));assert.notEqual(g.interaction()?.act,'wingChest','zweites Mal nicht');
});
test('Beweise: Leihschein auf dem Carport-Dach finden, im Thronsaal vorlegen – erst dann greift die Wirkung (Etappe 3), Big B redet sich raus',()=>{
 const g=game(),r=inside(g);quiet(g);const f=DEF.evidence.finds.leihschein;at(g,f.floor,f.x,f.y);assert.equal(act(g,'find').ok,true);
 assert.ok(r.found.has('leihschein')&&!r.evidence.has('leihschein'),'gefunden, nicht vorgelegt');assert.equal(evidenceEffects(r).noLie.size,0,'noch keine Wirkung');
 r.seals.add('siegel-gerd');r.version++;const pr=DEF.evidence.present;at(g,pr.floor,pr.x,pr.y);const it=g.interaction();assert.match(it.name,/Beweise vorlegen \(1\)/);
 assert.ok(dungeonAct(g,it).ok);assert.ok(r.evidence.has('leihschein'));assert.ok(evidenceEffects(r).noLie.has('kulisse'),'Pappkulisse lügt nicht mehr');
 g.events.length=0;run(g,.2);assert.ok(g.events.some(e=>e.type==='bark'&&e.text===DUNGEON_TEXT.bossLines.bigb.excuses.leihschein),'Ausrede');
 assert.equal(g.save().dungeonRun.evidence.includes('leihschein'),true,'im Laufstand');
});
test('Kirmes-Urkunde liegt bei Rita: erst nach ihr, solange sie steht, ist sie bewacht',()=>{
 const f=DEF.evidence.finds.kirmesurkunde;assert.equal(f.after,'rita');
 probe('rita',()=>{const g=game(),r=inside(g);quiet(g);at(g,f.floor,f.x,f.y);assert.equal(g.interaction()?.act,'guarded');assert.equal(dungeonAct(g,g.interaction()).ok,false);
  g.kill(g.enemies.find(e=>e.bossId==='rita'));assert.equal(act(g,'find').ok,true);assert.ok(r.found.has('kirmesurkunde'));});
});
test('Ereignis Vermieter Volker: erst die Wachen, dann das Fahrradschloss – Mietvertrag, Aufzug offen, danach Händler im Hof',()=>{
 const g=game(),r=inside(g);quiet(g);const ev=DEF.events.find(e=>e.id==='volker');r.trash.delete(ev.guards);at(g,ev.floor,ev.x,ev.y);assert.equal(g.interaction()?.act,'guarded','Wachen stehen');
 r.trash.add(ev.guards);const res=act(g,'event');assert.ok(res.ok&&r.freed);assert.ok(r.found.has('mietvertrag'),'Mietvertrag');assert.ok(r.unlocked.has('aufzug'),'Aufzugschlüssel');
 assert.equal(g.dungeons['schloss-bigb'].volker,true);g.events.length=0;run(g,3);assert.ok(g.events.some(e=>e.type==='bark'&&/Tetrapak/.test(e.text)),'Volker erzählt');
 at(g,'e0',DEF.vendor.x,DEF.vendor.y);assert.equal(g.interaction()?.act,'vendor','Händler im Hof');
 const saved=normalizeDungeons(JSON.parse(JSON.stringify(g.save().dungeons)));assert.equal(saved['schloss-bigb'].volker,true,'bleibt im Spielstand');
});
test('Ereignis Beamer: solange er läuft, ist das Gespenst nur ein Bild; ausgesteckt verschwindet es mit seinen EP',()=>{
 const g=game(),r=inside(g);quiet(g);const ghost=g.enemies.find(e=>e.dungeonKind==='schlossgespenst');assert.ok(ghost&&ghost.patrol,'Gespenst-Streife');ghost.hp=ghost.maxHp;ghost.ai='roaming';
 at(g,'k2',38,30);ghost.aggro=true;ghost.ai='combat';g.target=ghost;run(g,.1);g.damage(ghost,5000,'Schlag');run(g,.1);assert.equal(ghost.hp,ghost.maxHp,'unverwundbar');
 const ev=DEF.events.find(e=>e.id==='beamer');at(g,ev.floor,ev.x,ev.y);const xp=g.trainingXp;const res=act(g,'event');assert.ok(res.ok&&r.beamer);assert.ok(!(ghost.hp>0),'Gespenst weg');assert.ok(g.trainingXp>xp,'EP');
});
test('Ereignis Beamer: die Projektion hält niemanden fest – ohne echten Gegner daneben verblasst sie nach 4 s',()=>{
 const g=game();inside(g);quiet(g);const ghost=g.enemies.find(e=>e.dungeonKind==='schlossgespenst');ghost.hp=ghost.maxHp;ghost.ai='roaming';
 const mate=g.enemies.find(e=>e.pack==='gewoelbe-tresor');Object.assign(mate,{hp:mate.maxHp,aggro:true,ai:'combat',respawnAt:0});
 at(g,'k2',38,30);Object.assign(mate,{x:g.player.x+20,y:g.player.y});ghost.aggro=true;ghost.ai='combat';ghost.x=g.player.x-20;ghost.y=g.player.y;
 g.adminGod=true;run(g,5);assert.ok(ghost.aggro,'mit echtem Gegner daneben bleibt sie im Kampf');
 g.kill(mate);run(g,5);assert.equal(ghost.aggro,false,'allein verblasst sie');assert.ok(ghost.hp>0,'und läuft ihre Runde weiter');
});
test('Händler: Dorflegenden der gebauten Bosse gegen Siegelmarken, Hafersack vorgemerkt; Einzelstücke nur einmal',()=>{
 const g=game();inside(g);const stock=vendorStock(g),ids=stock.map(o=>o.id);assert.ok(ids.includes('gaesteliste')&&ids.includes('siegelring-echtgold')&&ids.includes('pelzmantel-baron'),JSON.stringify(ids));
 const oat=stock.find(o=>o.id==='hafersack');assert.ok(oat,'Platz für den Hafersack');if(!ITEMS.hafersack)assert.equal(oat.locked,true);
 assert.equal(vendorBuy(g,'gaesteliste').ok,false,'ohne Marken nicht');g.dungeons['schloss-bigb'].marks=160;const res=vendorBuy(g,'gaesteliste');assert.ok(res.ok,res.message);
 assert.ok(g.rpg.inventory.some(x=>x.id==='gaesteliste'));assert.equal(g.dungeons['schloss-bigb'].marks,160-DUNGEON_E4B.prices.gerd);assert.equal(vendorBuy(g,'gaesteliste').ok,false,'Einzelstück nur einmal');
});
test('Händler-Preise: ein Wunschteil nach 4–6 vollen Durchgängen sicher, nie schon nach ein, zwei',()=>{
 // Ein Lauf = voller Durchgang aller gebauten Bosse ohne den seltenen (halbes Pferd): 2 je Boss, 2 Tagesbonus je Boss beim ersten des Tages,
 // 1 je kleiner Truhe, 3 aus der Endtruhe.
 const R=DUNGEON_REWARDS,bosses=DEF.bosses.filter(b=>DUNGEON_BOSSES[b.id]&&!b.rare),chests=DEF.wings.filter(w=>w.chest&&DUNGEON_BOSSES[w.boss]).length;
 const repeat=bosses.length*R.marksPerBoss+chests*R.wingChest.marks+R.chest.marks,first=repeat+bosses.length*R.daily.marks;
 const P=DUNGEON_E4B.prices,runs=price=>{let m=0,n=0;while(m<price){m+=n===0?first:repeat;n++;}return n;};
 for(const [id,price] of Object.entries(P)){if(id==='hafersack')continue;const n=runs(price),daily=Math.ceil(price/first);
  assert.ok(n>=4&&n<=6,id+': '+n+' Läufe (erster des Tages '+first+', danach '+repeat+' Marken)');assert.ok(daily>=3,id+': schon nach '+daily+' Läufen mit lauter ersten des Tages');}
 assert.ok(runs(10*P.hafersack)<=6,'zehn Hafersäcke für das halbe Pferd nach höchstens 6 Läufen');
});
test('Erfolge: Beweislast mit Titel „Mieterschützer“, Stempelkarte, Zeit und „ohne Kratzer“ nur im vollen Durchgang',()=>{
 const g=game(),r=inside(g);quiet(g);const sealers=DEF.bosses.filter(b=>b.seal&&DUNGEON_BOSSES[b.id]).map(b=>g.enemies.find(e=>e.bossId===b.id));for(const e of sealers.slice(0,-1))g.kill(e);
 assert.ok(!g.dungeons['schloss-bigb'].feats.includes('stempelkarte'),'noch nicht alle Siegel');g.kill(sealers.at(-1));assert.ok(g.dungeons['schloss-bigb'].feats.includes('stempelkarte'),'alle gebauten Siegel an einem Tag');
 const rita=g.enemies.find(e=>e.bossId==='rita');if(rita)g.kill(rita);
 for(const id of DEF.evidence.ids)r.evidence.add(id);const b=bigbOf(g);b.aggro=true;b.ai='combat';g.adminGod=true;run(g,2);g.kill(b);const feats=g.dungeons['schloss-bigb'].feats;
 assert.ok(feats.includes('beweislast'),'Beweislast '+feats);assert.ok(feats.includes('termin')&&feats.includes('kratzer'),'voller Durchgang schnell und ohne Tod '+feats);
 assert.deepEqual(dungeonTitles(g).map(t=>t.name),['Mieterschützer']);assert.ok(g.toasts.some(t=>/Mieterschützer/.test(t)));
 const h=game(),r2=inside(h);quiet(h);r2.seals.add('siegel-gerd');r2.version++;r2.deaths=1;const b2=bigbOf(h);b2.aggro=true;b2.ai='combat';h.adminGod=true;run(h,2);h.kill(b2);
 assert.ok(!h.dungeons['schloss-bigb'].feats.includes('termin')&&!h.dungeons['schloss-bigb'].feats.includes('kratzer'),'ohne Gerd im Durchgang kein voller Durchgang');
});
test('Laufstand: Funde, Volker, Beamer, kleine Truhen und Tode überleben das Neuladen',()=>{
 const g=game(),r=inside(g);quiet(g);r.found.add('leihschein');r.freed=true;r.beamer=true;r.wingChests.add('burghof');r.deaths=2;
 const save=JSON.parse(JSON.stringify(g.save()));const h=new Game(world,{...save,dungeonRun:null},{});h.clock=()=>DAY+60e3;restoreDungeonRun(h,save.dungeonRun);const r2=h.dungeonRun;
 assert.ok(r2.found.has('leihschein')&&r2.freed&&r2.beamer&&r2.wingChests.has('burghof'));assert.equal(r2.deaths,2);
});
test('Erinnerungen: im Dungeon-Kampf und in der Boss-Arena warten sie; gesehene bleiben je Held gemerkt (älterer Wolkenstand zeigt sie nicht noch mal)',async()=>{
 const {memoryBlocked,rememberSeen,mergeSeen}=await import('../memory-seen.js');
 const g=game();assert.equal(memoryBlocked(g),false,'draußen frei');inside(g);quiet(g);at(g,'e0',31,34);assert.equal(memoryBlocked(g),false,'im ruhigen Hof frei');
 at(g,'k2',52,20);assert.equal(memoryBlocked(g),true,'in der Boss-Arena nicht');at(g,'e0',31,34);const b=bigbOf(g);b.aggro=true;b.ai='combat';assert.equal(memoryBlocked(g),true,'während eines Bosskampfs nicht');
 const store=new Map();globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))};
 try{rememberSeen('held-1','stempel');rememberSeen('held-1','stempel');const h=game();h.memories.seen=[];assert.equal(mergeSeen(h,'held-1'),1);assert.deepEqual(h.memories.seen,['stempel']);assert.equal(mergeSeen(h,'held-2'),0,'je Held getrennt');}
 finally{delete globalThis.localStorage;}
});
