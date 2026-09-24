// Begleiter (E-45): Anheuern, Folgen, Bedrohung und Zielwahl, Rollenverhalten, Ansagen (Fläche/Unterbrechen), Boden, Vertrag, Speichern.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {World,distance} from '../world.js';
import {Game} from '../engine.js';
import {COMPANIONS,COMPANION_RULES,COMPANION_TEXT,companionCost,companionStats,COMPANION_ABILITIES,COMPANION_ROLES,CAST_SETS} from '../content/index.js';
import {companionFocus,addThreat,companionSlots} from '../companions.js';

const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')),{});
const TANK='merc-pils-peter',HEALER='merc-schorle-susi',SHOOTER='merc-radler-rita',BRAWLER='merc-hopfen-horst';

function game(level=6,coins=5000){const g=new Game(world,{level},{});g.rpg.coins=coins;g.toasts=[];g.toast=t=>g.toasts.push(t);return g;}
const run=(g,seconds,each)=>{for(let t=0;t<seconds;t+=.05){each?.(t);g.tick(.05);}};
/** Spieler neben einen Lagergegner stellen; der Gegner ist wach und kämpft. */
function engage(g,type='wolf',gap=70,{alone=true}={}){
 const e=g.enemies.find(x=>x.netId&&x.type===type);assert.ok(e,'Lagergegner '+type);
 if(alone)for(const o of g.enemies)if(o!==e){o.hp=0;o.aggro=false;o.ai='dead';o.respawnAt=1e9;} // Einzeltest: Lagerkumpel mischen sich nicht ein
 const spot=world.findClear(e.x-gap,e.y,9);Object.assign(g.player,spot);e.spawnGrace=0;e.aggro=true;e.ai='combat';g.target=e;
 for(const c of g.companions){const s=world.findClear(spot.x-30,spot.y+20*(g.companions.indexOf(c)+1),9);c.x=s.x;c.y=s.y;}
 return e;
}

test('Inhalt: jeder Begleiter hat Rolle, Fähigkeiten und Texte, die es gibt',()=>{
 assert.ok(COMPANIONS.length>=3);const ids=new Set();
 for(const c of COMPANIONS){assert.ok(!ids.has(c.id),'doppelte ID '+c.id);ids.add(c.id);assert.ok(COMPANION_ROLES[c.role],c.id+' Rolle');assert.ok(c.name&&c.description&&c.look,c.id+' Texte');
  assert.ok(c.abilities.length,c.id+' Fähigkeiten');for(const a of c.abilities)assert.ok(COMPANION_ABILITIES[a],c.id+' kennt '+a);for(const k of ['hire','down','revive','dismiss'])assert.ok(c.lines[k],c.id+' Zeile '+k);}
 for(const role of Object.keys(COMPANION_ROLES))assert.ok(COMPANIONS.some(c=>c.role===role),'Rolle '+role+' ist besetzt');
 const low=companionStats('tank',1),high=companionStats('tank',20);assert.ok(high.maxHp>low.maxHp&&high.damage>low.damage,'Werte wachsen mit der Stufe');
});

test('Anheuern kostet Münzen, ist begrenzt und lässt sich rückgängig machen',()=>{
 const g=game(6,1000),cost=companionCost(6);
 assert.equal(g.hireCompanion('gibt-es-nicht').ok,false);
 const r=g.hireCompanion(TANK);assert.equal(r.ok,true);assert.equal(g.rpg.coins,1000-cost);assert.equal(g.companions.length,1);assert.equal(g.companions[0].level,6);
 assert.equal(g.hireCompanion(TANK).ok,false,'nicht doppelt');
 const poor=game(6,0);assert.equal(poor.hireCompanion(TANK).ok,false);assert.equal(poor.toasts.at(-1),COMPANION_TEXT.money);
 for(const c of COMPANIONS.filter(c=>c.id!==TANK).slice(0,3))assert.equal(g.hireCompanion(c.id).ok,true);
 assert.equal(companionSlots(g),0);const fifth=COMPANIONS.find(c=>!g.companions.some(x=>x.id===c.id));assert.equal(g.hireCompanion(fifth.id).ok,false,'höchstens vier');
 assert.equal(g.dismissCompanion(TANK).ok,true);assert.equal(g.companions.length,3);
 const offers=g.companionOffers();assert.equal(offers.length,COMPANIONS.filter(c=>c.kind==='merc').length);assert.ok(offers.some(o=>o.hired)&&offers.some(o=>!o.hired));
});

test('Echte Gruppenmitglieder belegen Plätze: nie mehr als fünf Köpfe',()=>{
 const g=game();g.partyHumans=3;assert.equal(companionSlots(g),1);assert.equal(g.hireCompanion(TANK).ok,true);
 assert.equal(g.hireCompanion(HEALER).ok,false);assert.equal(g.toasts.at(-1),COMPANION_TEXT.partyFull);
});

test('Begleiter folgen dem Spieler und holen nach einem Sprung wieder auf',()=>{
 const g=game();g.hireCompanion(TANK);g.hireCompanion(HEALER);
 const start={x:g.player.x,y:g.player.y},goal=world.candidates(250,420)[0];g.navigate(goal);run(g,9);
 assert.ok(distance(g.player,start)>150,'Spieler ist gelaufen');
 for(const c of g.companions)assert.ok(distance(c,g.player)<140,c.name+' ist beim Spieler ('+Math.round(distance(c,g.player))+')');
 Object.assign(g.player,world.findClear(g.player.x+1500,g.player.y,9));run(g,.2);
 for(const c of g.companions)assert.ok(distance(c,g.player)<140,c.name+' ist nach dem Sprung wieder da');
});

test('Schadens-Begleiter helfen beim Ziel des Spielers; der Kill zählt für den Spieler',()=>{
 const g=game();g.hireCompanion(SHOOTER);g.hireCompanion(BRAWLER);const e=engage(g),kills=g.stats.kills;
 run(g,40,()=>{if(e.hp>0&&!g.dead)g.player.hp=g.player.maxHp;});
 assert.equal(e.hp,0,'Gegner fällt ohne einen Schlag des Spielers');assert.equal(g.stats.kills,kills+1);assert.ok(e.respawnAt>g.time,'normale Wiederkehr läuft');
});

test('Schutz-Begleiter zieht den Gegner auf sich; der Spieler bleibt heil',()=>{
 const g=game();g.hireCompanion(TANK);const e=engage(g,'wolf',140);addThreat(e,'player',30);e.maxHp=e.hp=1e6; // Abstand: der Spieler steht nicht in der Sprungfläche
 const tank=g.companions[0],hpBefore=g.player.hp;run(g,8);
 assert.equal(companionFocus(g,e),tank,'Gegner hat den Schutz-Begleiter im Ziel');
 assert.ok(tank.hp<tank.maxHp,'der Begleiter steckt ein');assert.ok(g.player.hp>=hpBefore-60,'der Spieler bekommt höchstens den ersten Schlag ab');
});

test('Schutz-Begleiter sammelt nachrückende Gegner ein',()=>{
 const g=game();g.hireCompanion(TANK);const e=engage(g,'wolf',70,{alone:false}),pack=g.enemies.filter(x=>x.netId&&x.campId===e.campId);assert.ok(pack.length>=2,'Lager hat mehrere Gegner');
 for(const x of pack){x.maxHp=x.hp=1e6;x.spawnGrace=0;x.aggro=true;x.ai='combat';addThreat(x,'player',20);}
 const tank=g.companions[0];run(g,20,()=>{g.player.hp=g.player.maxHp;tank.hp=tank.maxHp;});
 for(const x of pack)assert.equal(companionFocus(g,x),tank,x.netId+' hängt am Schutz-Begleiter');
});

test('Hohe Bedrohung des Spielers holt den Gegner zurück – Spott holt ihn wieder',()=>{
 const g=game();g.hireCompanion(TANK);const e=engage(g);e.maxHp=e.hp=1e6;const tank=g.companions[0];run(g,4);assert.equal(companionFocus(g,e),tank);
 addThreat(e,'player',1e5);assert.equal(companionFocus(g,e),null,'Spieler hat wieder das Ziel');
 tank.cooldowns.taunt=0;run(g,2);assert.equal(companionFocus(g,e),tank,'Spott setzt den Begleiter über den Spieler');
});

test('Heiler hält Spieler und Begleiter am Leben',()=>{
 const g=game();g.hireCompanion(HEALER);g.hireCompanion(TANK);const e=engage(g);e.maxHp=e.hp=1e6;
 g.player.hp=Math.round(g.player.maxHp*.3);const before=g.player.hp;run(g,5);
 assert.ok(g.player.hp>before+60,'Spieler wurde geheilt ('+before+' → '+g.player.hp+')');
});

test('Angesagte Fläche: Begleiter gehen rechtzeitig raus',()=>{
 const g=game();g.hireCompanion(BRAWLER);const e=engage(g,'cultist',60);e.maxHp=e.hp=1e6;const c=g.companions[0];
 run(g,1.5);const k=CAST_SETS.cultist.casts.circle;e.cast={...k,type:'circle',remaining:k.total,x:c.x,y:c.y,focus:c.id};e.focus=c.id;e.threat={[c.id]:1e6};
 const hp=c.hp;let landed=false;run(g,k.total+.3,()=>{if(!e.cast)landed=true;else{e.autoTimer=9;}});
 assert.ok(landed,'Zauber ist durchgelaufen');assert.equal(c.hp,hp,'Begleiter stand nicht mehr in der Fläche');
});

test('Unterbrechbarer Zauber wird nach der Reaktionszeit unterbrochen',()=>{
 const g=game();g.hireCompanion(SHOOTER);const e=engage(g,'cultist',90);e.maxHp=e.hp=1e6;run(g,.5);
 const k=CAST_SETS.cultist.casts.bolt;e.cast={...k,type:'bolt',remaining:k.total,x:e.x,y:e.y};const c=g.companions[0];c.cooldowns.shush=0;c.gcd=0;
 run(g,COMPANION_RULES.reaction-.1);assert.ok(e.cast,'nicht sofort – erst nach der Reaktionszeit');
 run(g,.6);assert.equal(e.cast,null,'Zauber ist abgebrochen');assert.ok(c.cooldowns.shush>0,'Fähigkeit ist auf Abklingzeit');
});

test('Besiegte Begleiter liegen am Boden, geben das Ziel frei und stehen nach dem Kampf wieder auf',()=>{
 const g=game();g.hireCompanion(TANK);const e=engage(g);e.maxHp=e.hp=1e6;const c=g.companions[0];run(g,3);assert.equal(companionFocus(g,e),c);
 c.hp=1;e.autoTimer=0;run(g,4,()=>{g.player.hp=g.player.maxHp;});
 assert.equal(c.state,'down');assert.equal(companionFocus(g,e),null,'Gegner wendet sich dem Spieler zu');assert.equal(c.view.state,'dead');
 e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=g.time+999;run(g,COMPANION_RULES.downSeconds+1);
 assert.equal(c.state,'follow');assert.ok(c.hp>=Math.round(c.maxHp*COMPANION_RULES.reviveHealth),'steht mit halbem Leben auf und erholt sich');
});

test('Befehle und Haltung: Warten bleibt stehen, Passiv greift nicht an, Angriff zieht ein ruhendes Ziel',()=>{
 const g=game();g.hireCompanion(BRAWLER);const c=g.companions[0];
 g.orderCompanions('stay');const at={x:c.x,y:c.y};g.navigate(world.candidates(250,420)[0]);run(g,5);assert.ok(distance(c,at)<2,'wartet');
 g.orderCompanions('follow');g.setCompanionStance('passive');const e=engage(g);e.maxHp=e.hp=5000;run(g,4,()=>{g.player.hp=g.player.maxHp;});assert.equal(e.hp,5000,'passiv schlägt nicht zu');
 g.setCompanionStance('assist');const calm=g.enemies.find(x=>x.netId&&x.type==='wolf'&&x!==e);calm.hp=calm.maxHp;calm.dead=0;calm.aggro=false;calm.ai='roaming';e.hp=0;e.aggro=false;e.ai='dead';e.respawnAt=g.time+999;
 Object.assign(g.player,world.findClear(calm.x-90,calm.y,9));calm.spawnGrace=0;g.target=calm;g.orderCompanions('attack');const hp=calm.hp;run(g,5,()=>{g.player.hp=g.player.maxHp;});
 assert.ok(calm.hp<hp,'Angriffsbefehl eröffnet den Kampf');
});

test('Vertrag läuft ab; Spielstand merkt sich Begleiter, Leben, Haltung und Restzeit',()=>{
 const g=game();g.hireCompanion(TANK);g.hireCompanion(HEALER);g.setCompanionStance('passive',HEALER);
 run(g,2);g.companions[0].hp=Math.round(g.companions[0].maxHp*.5);const save=JSON.parse(JSON.stringify(g.save()));assert.equal(save.companions.length,2);
 const again=new Game(world,save,{});assert.deepEqual(again.companions.map(c=>c.id),[TANK,HEALER]);
 assert.equal(again.companions[1].stance,'passive');assert.ok(Math.abs(again.companions[0].hp/again.companions[0].maxHp-.5)<.08,'Leben bleibt');
 assert.ok(again.companions[0].contract<COMPANION_RULES.contractHours*3600,'Restzeit läuft weiter');
 again.toast=()=>{};again.companions[0].contract=.04;again.tick(.05);again.tick(.05);assert.deepEqual(again.companions.map(c=>c.id),[HEALER],'abgelaufener Vertrag endet');
});

test('Tod des Spielers: Begleiter stehen nach der Rückkehr geheilt neben ihm',()=>{
 const g=game();g.hireCompanion(TANK);const e=engage(g);run(g,2);g.companions[0].hp=10;g.dead=true;g.respawn();
 const c=g.companions[0];assert.equal(c.hp,c.maxHp);assert.ok(distance(c,g.player)<140);assert.equal(e.threat??null,null);
});

test('Chat-Befehle: Brett zeigen, anheuern, befehlen, entlassen',async()=>{
 const {parseChatCommand}=await import('../online.js');const {companionCommand}=await import('../companions.js');const g=game();
 assert.deepEqual(parseChatCommand('/söldner'),{kind:'companion',op:'board',name:''});
 const board=companionCommand(g,parseChatCommand('/söldner'));assert.ok(board.length>=COMPANIONS.length&&board.some(l=>l.includes('Pils-Peter')));
 companionCommand(g,parseChatCommand('/söldner peter'));assert.deepEqual(g.companions.map(c=>c.id),[TANK]);
 companionCommand(g,parseChatCommand('/befehl warten'));assert.equal(g.companions[0].order,'stay');
 companionCommand(g,parseChatCommand('/haltung passiv'));assert.equal(g.companions[0].stance,'passive');
 assert.deepEqual(companionCommand(g,parseChatCommand('/befehl tanzen')),[COMPANION_TEXT.chat.needOrder]);
 companionCommand(g,parseChatCommand('/entlassen'));assert.equal(g.companions.length,0);
});

test('Zielmarkierung: Schadens-Söldner greift den Totenkopf an, nicht das Ziel des Spielers; Angriffsbefehl geht vor',async()=>{
 const {setMark}=await import('../target-marks.js');
 const g=game(12);g.hireCompanion(BRAWLER);const e=engage(g,'wolf',70,{alone:false}),other=g.enemies.find(o=>o!==e&&o.campId===e.campId&&o.hp>0);assert.ok(other,'zweiter Lagergegner');
 other.spawnGrace=0;other.aggro=true;other.ai='combat';const c=g.companions[0];
 setMark(g,other,'skull');run(g,.6);assert.equal(c.target,other,'Totenkopf vor Spielerziel');
 setMark(g,other,'');setMark(g,e,'cross');c.retarget=0;run(g,.6);assert.equal(c.target,e);
 c.order='attack';g.target=other;c.retarget=0;run(g,.6);assert.equal(c.target,other,'ausdrücklicher Befehl geht vor');
});
