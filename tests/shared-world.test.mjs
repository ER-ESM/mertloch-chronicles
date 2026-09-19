// Geteilte Welt (E-35): Serverregeln (Gegner, Bedrohung, Gruppen), Client-Abgleich und die Haken in der Engine.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createSharedWorld,SHARED_RULES} from '../server/game/shared-world.mjs';
import {createNetWorld,TANK_SPECS} from '../net-world.js';
import {parseChatCommand} from '../online.js';
import {Game} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {SPEC_MECHANICS} from '../content/mechanics.js';

function server(){
 const list=[],clock={t:1000},world=createSharedWorld({clients:()=>list,send:(c,m)=>c.inbox.push(m),now:()=>clock.t,random:()=>0});
 const join=(id,name,x=0,y=0,w='welt')=>{const c={id,name,world:w,x,y,l:5,c:'dieter',sp:'',h:100,s:'idle',placed:true,party:null,inbox:[]};list.push(c);return c;};
 const last=(c,t)=>c.inbox.filter(m=>m.t===t).at(-1);
 return {world,join,last,clock,list};
}

test('Gegner: gemeinsame Lebenspunkte, Ziel = höchste Bedrohung mit Trägheit, Tod belohnt Beteiligte',()=>{
 const {world,join,last}=server(),a=join(1,'Anni'),b=join(2,'Kevin',100,0),far=join(3,'Fern',0,0,'andere-welt');
 world.hit(a,{e:'camp:0',d:30,max:100,r:40});
 assert.deepEqual(last(b,'mob'),{t:'mob',e:'camp:0',hp:70,max:100,tg:'Anni',by:'Anni'});assert.equal(far.inbox.length,0,'andere Welt hört nichts');
 world.hit(b,{e:'camp:0',d:32,max:999});assert.equal(last(a,'mob').hp,38,'max des Erstmelders gilt');assert.equal(last(a,'mob').tg,'Anni','32 < 30·1,1 → Ziel bleibt');
 world.hit(b,{e:'camp:0',d:5});assert.equal(last(a,'mob').tg,'Kevin');
 world.hit(a,{e:'camp:0',d:999});const kill=last(b,'kill');assert.deepEqual(kill.credit.sort(),['Anni','Kevin']);assert.equal(kill.r,40);assert.equal(kill.by,'Anni');
 const before=b.inbox.length;world.hit(b,{e:'camp:0',d:10,max:100});assert.equal(b.inbox.length,before,'Treffer auf einen Toten verpuffen');
});

test('Gegner: Ablassen, Rücksetzen, Wiederkehr, Nachzügler bekommen den Stand, Unsinn wird gekappt',()=>{
 const {world,join,last,clock}=server(),a=join(1,'Anni'),b=join(2,'Kevin');
 world.hit(a,{e:'x',d:-50,max:100});assert.equal(last(a,'mob').hp,100);world.hit(a,{e:'x',d:'viel'});assert.equal(last(a,'mob').hp,100);
 world.hit(a,{e:'x',d:10});world.hit(b,{e:'x',d:5});world.evade(a,'x');assert.equal(last(b,'mob').tg,'Kevin');
 world.evade(b);assert.equal(last(a,'reset').e,'x');assert.equal(world.mobs.size,0);
 world.hit(a,{e:'y',d:1,max:50});clock.t+=SHARED_RULES.idleResetMs+1;world.tick();assert.equal(last(b,'reset').e,'y','verwaister Kampf setzt zurück');
 world.hit(a,{e:'z',d:50,max:50,r:10});const late=join(3,'Spät');world.sync(late);assert.deepEqual(last(late,'mobs').list,[{e:'z',dead:10}]);
 clock.t+=10001;world.tick();assert.equal(last(late,'up').e,'z');
 world.hit(a,{e:'q',d:20,max:80});world.gone(a);assert.equal(last(b,'reset').e,'q','Trennung lässt los');
});

test('Gruppe: einladen, annehmen, Gruppen-Belohnung in Reichweite, verlassen, Leitung wechselt, auflösen',()=>{
 const {world,join,last}=server(),a=join(1,'Anni'),b=join(2,'Kevin',200,0),c=join(3,'Baerbel',9000,0),d=join(4,'Dieter');
 world.party(a,{op:'invite',name:'niemand'});assert.match(last(a,'notice').text,/nicht online/);
 world.party(a,{op:'invite',name:'kevin'});assert.equal(last(b,'invite').from,'Anni');world.party(b,{op:'accept'});
 assert.deepEqual(last(a,'party').members.map(m=>m.n),['Anni','Kevin']);assert.equal(last(b,'party').leader,'Anni');
 world.party(b,{op:'invite',name:'Dieter'});assert.match(last(b,'notice').text,/Gruppenleitung/);
 world.party(a,{op:'invite',name:'Baerbel'});world.party(c,{op:'accept'});world.party(a,{op:'invite',name:'Dieter'});world.party(d,{op:'decline'});assert.match(last(a,'notice').text,/abgelehnt/);
 world.hit(a,{e:'keiler',d:100,max:100});assert.deepEqual(last(a,'kill').credit.sort(),['Anni','Kevin'],'Bärbel ist zu weit weg, Dieter nicht in der Gruppe');
 assert.deepEqual(world.partyMembers(b).map(m=>m.name),['Anni','Kevin','Baerbel']);
 world.party(a,{op:'leave'});assert.equal(last(b,'party').leader,'Kevin');assert.deepEqual(last(a,'party').members,[]);
 world.party(b,{op:'kick',name:'Baerbel'});assert.deepEqual(last(b,'party').members,[]);assert.equal(world.parties.size,0,'zu zweit minus eins = aufgelöst');
 world.who(a);assert.equal(last(a,'who').list.length,4);assert.equal(last(a,'who').list.find(p=>p.me).n,'Anni');
});

const arena=()=>({spawn:{x:0,y:0},npc:{x:10,y:0},landmarks:[],camps:[],findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[{...b}]});
function localGame(){const g=new Game(arena()),e=makeEnemy({x:2000,y:1000},1,{behavior:'aggressive',aggroRange:100,speed:60,hp:500,roamWait:100,netId:'camp:0'});g.enemies=[e];g.player.x=2300;g.player.y=1000;if(g.tutorial)g.tutorial.completed=true;return {g,e};}

test('Engine: fremder Schaden ohne Belohnung, fremdes Ziel wird verfolgt statt mich anzugreifen, Tod mit und ohne Anteil',()=>{
 const {g,e}=localGame();
 assert.equal(g.netEnemy('camp:0'),e);assert.equal(g.applyRemoteHp(e,400,'Kevin'),true);assert.equal(e.hp,400);assert.equal(g.applyRemoteHp(e,450),false,'heilt nie');
 g.applyRemoteHp(e,-5);assert.equal(e.hp,1,'den Tod meldet nur der Server');
 const hp=g.player.hp;g.setRemoteTarget(e,{x:1800,y:1000});for(let i=0;i<40;i++){g.setRemoteTarget(e,{x:1800,y:1000});g.tick(.05);}
 assert.ok(e.x<1900,'läuft zum fremden Ziel: '+e.x);assert.ok(g.player.hp>=hp,'kein Schaden an mir');assert.equal(e.aggro,false);
 const xp=g.xp??g.player.xp,kills=g.stats.kills;g.remoteKill(e,{credit:false,respawnIn:20});assert.equal(e.hp,0);assert.equal(g.stats.kills,kills,'ohne Anteil kein Kill');assert.ok(Math.abs(e.respawnAt-g.time-20)<.01);
 const second=localGame();second.g.remoteKill(second.e,{credit:true,respawnIn:30});assert.equal(second.g.stats.kills,1,'mit Anteil volle Belohnung');assert.ok(Math.abs(second.e.respawnAt-second.g.time-30)<.01);
});

test('Engine: fremdes Ziel läuft aus → Gegner kehrt heim; Lagergegner tragen einen stabilen Netzschlüssel',()=>{
 const {g,e}=localGame();g.setRemoteTarget(e,{x:1800,y:1000});for(let i=0;i<70;i++)g.tick(.05);assert.equal(e.remoteTarget,null);assert.equal(e.ai,'returning');
 const w={...arena(),camps:[{id:'hof',type:'wolf',x:500,y:500,count:2}]},h=new Game(w);assert.deepEqual(h.enemies.filter(x=>x.campId==='hof').map(x=>x.netId),['hof:0','hof:1']);
});

test('Client-Abgleich: meldet nur eigenen Schaden, Bedrohung der Schutz-Specs ×3, Ablassen, Tod, fremde Treffer nicht',()=>{
 const {g,e}=localGame(),sent=[],net=createNetWorld({game:()=>g,me:()=>'Anni',send:m=>sent.push(m),others:()=>[{name:'Kevin',x:1800,y:1000}]});
 g.rpg.talents.spec='dieter-brawl';net.tick('welt');assert.equal(sent.length,0);
 e.hp-=40;net.tick('welt');assert.deepEqual(sent.at(-1),{t:'hit',e:'camp:0',d:40,max:500,th:40,r:35});
 net.receive({t:'mob',e:'camp:0',hp:400,max:500,tg:'Kevin',by:'Kevin'});assert.equal(e.hp,400);const n=sent.length;net.tick('welt');assert.equal(sent.length,n,'fremder Schaden wird nicht als eigener gemeldet');
 assert.ok(e.remoteTarget,'Kevin ist das Ziel, der Gegner läuft ihm nach');net.receive({t:'mob',e:'camp:0',hp:400,max:500,tg:'Anni'});assert.equal(e.remoteTarget,null);
 g.rpg.talents.spec=TANK_SPECS[0];e.hp-=10;net.tick('welt');assert.equal(sent.at(-1).th,30);
 e.hp=e.maxHp;net.tick('welt');assert.deepEqual(sent.at(-1),{t:'evade',e:'camp:0'});
 e.aggro=true;net.tick('welt');assert.equal(sent.at(-1).d,0,'Körperpull meldet Bedrohung ohne Schaden');
 net.receive({t:'kill',e:'camp:0',credit:['Anni'],r:25});assert.equal(e.hp,0);assert.equal(g.stats.kills,1);const m=sent.length;net.tick('welt');assert.equal(sent.length,m,'der Tod wird nicht als Treffer zurückgemeldet');
 net.receive({t:'up',e:'camp:0'});assert.ok(e.respawnAt<=g.time);assert.equal(net.receive({t:'chat'}),false);assert.equal(net.receive({t:'mob',e:'unbekannt',hp:1}),true);
 g.dead=true;net.tick('welt');assert.equal(sent.at(-1).t,'dead');
 for(const s of TANK_SPECS)assert.ok(SPEC_MECHANICS[s],s);
});

test('Chat-Befehle',()=>{
 assert.deepEqual(parseChatCommand('Hallo','world'),{kind:'chat',ch:'world',text:'Hallo'});
 assert.deepEqual(parseChatCommand('/g auf den Keiler'),{kind:'chat',ch:'party',text:'auf den Keiler'});
 assert.deepEqual(parseChatCommand('/f "Zapf Meister" komm her'),{kind:'chat',ch:'whisper',to:'Zapf Meister',text:'komm her'});
 assert.deepEqual(parseChatCommand('/f Kevin hi'),{kind:'chat',ch:'whisper',to:'Kevin',text:'hi'});
 assert.equal(parseChatCommand('/f Kevin').kind,'error');assert.deepEqual(parseChatCommand('/einladen Kevin'),{kind:'party',op:'invite',name:'Kevin'});
 assert.deepEqual(parseChatCommand('/verlassen'),{kind:'party',op:'leave'});assert.equal(parseChatCommand('/wer').kind,'who');assert.equal(parseChatCommand('/tanzen').kind,'error');assert.equal(parseChatCommand('/hilfe').kind,'help');
});
