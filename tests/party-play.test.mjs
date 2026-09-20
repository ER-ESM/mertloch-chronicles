// Gruppenspiel (E-39): Würfeln um seltene Beute, geteilter Sammelfortschritt, Gruppen-Buffs, EP-Bonus.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createPartyPlay,cleanItem,PARTY_RULES} from '../server/game/party-play.mjs';
import {createNetParty} from '../net-party.js';
import {Game} from '../engine.js';
import {ITEMS} from '../rpg.js';
import {BALANCE} from '../content/index.js';

function server(rolls=[]){
 const clock={t:1000},groups=new Map(),play=createPartyPlay({members:c=>groups.get(c)||[],send:(c,m)=>c.inbox.push(m),now:()=>clock.t,random:()=>rolls.length?rolls.shift():0});
 const join=(id,name,x=0,y=0,w='welt')=>({id,name,world:w,x,y,placed:true,inbox:[]});
 const party=(...list)=>{for(const c of list)groups.set(c,list);};
 const last=(c,t)=>c.inbox.filter(m=>m.t===t).at(-1);
 return {play,join,party,last,clock};
}
const RARE={id:'roll-body-tresen-5-rare-77-boar-3',name:'Seltene Kutte',rarity:'rare',slot:'body',raw:{slot:'body',spec:'tresen',level:5,quality:'rare',roll:77,family:'boar'}};

test('Würfeln: Bedarf schlägt Gier, höchster Wurf gewinnt, alle erfahren das Ergebnis',()=>{
 const {play,join,party,last}=server([.99,.10,.50]),a=join(1,'Anni'),b=join(2,'Kevin',100),c=join(3,'Dieter',200);party(a,b,c);
 assert.equal(play.offer(a,{item:RARE}),true);assert.equal(last(b,'roll').item.name,'Seltene Kutte');assert.equal(last(b,'roll').from,'Anni');
 play.choice(a,{id:1,c:'greed'});play.choice(b,{id:1,c:'need'});assert.equal(last(c,'rollpick').n,'Kevin');assert.equal(play.choice(b,{id:1,c:'greed'}),false,'nur eine Wahl');
 play.choice(c,{id:1,c:'need'});const r=last(a,'rolled');assert.equal(r.winner,'Dieter','Bedarf 51 schlägt Bedarf 11 und Gier 100');
 assert.deepEqual(r.rolls,[{n:'Anni',c:'greed',v:100},{n:'Kevin',c:'need',v:11},{n:'Dieter',c:'need',v:51}]);assert.equal(play.rolls.size,0);
});

test('Würfeln: allein sofort zurück, außer Reichweite zählt nicht, Zeitablauf = Passen, alle passen → Finder',()=>{
 const {play,join,party,last,clock}=server(),a=join(1,'Anni'),b=join(2,'Kevin',PARTY_RULES.range+1),c=join(3,'Dieter',50);
 play.offer(a,{item:RARE});assert.equal(last(a,'rolled').winner,'Anni','ohne Gruppe');
 party(a,b);play.offer(a,{item:RARE});assert.equal(a.inbox.filter(m=>m.t==='rolled').length,2,'Kevin steht zu weit weg');assert.equal(b.inbox.length,0);
 party(a,b,c);play.offer(a,{item:RARE});assert.ok(last(c,'roll'));clock.t+=PARTY_RULES.rollMs+1;play.tick();assert.equal(last(c,'rolled').winner,'Anni','niemand wählt → Finder behält');
 play.offer(a,{item:RARE});play.choice(c,{id:last(c,'roll').id,c:'greed'});play.gone(a);assert.equal(last(c,'rolled').winner,'Dieter','Finder weg: der Rest würfelt zu Ende');
});

test('Würfeln: Unsinn wird verworfen',()=>{
 assert.equal(cleanItem({id:'x',name:'Y',rarity:'common'}),null,'gewöhnliche Teile werden nicht gewürfelt');
 assert.equal(cleanItem({id:'<script>',name:'Y',rarity:'rare'}),null);
 assert.equal(cleanItem({...RARE,raw:{...RARE.raw,level:9999}}).raw.level,60);
});

test('Weiterreichen: Sammelfortschritt und Buffs gehen nur an Gruppenmitglieder in Reichweite',()=>{
 const {play,join,party,last}=server(),a=join(1,'Anni'),b=join(2,'Kevin',100),c=join(3,'Fern',0,0,'andere'),d=join(4,'Fremd',10);party(a,b,c);
 assert.equal(play.share(a,{t:'qshare',item:'kronkorken'}),1);assert.deepEqual(last(b,'qshare'),{t:'qshare',from:'Anni',k:'gather',item:'kronkorken'});assert.equal(c.inbox.length+d.inbox.length,0);
 play.share(a,{t:'buff',b:{name:'Dosenmut',duration:999,reduction:3,shield:-5}});assert.deepEqual(last(b,'buff').b,{name:'Dosenmut',icon:'',duration:60,reduction:.5,hot:0,shield:0});
});

function client(){
 const g=new Game({spawn:{x:0,y:0},npc:{x:10,y:0},landmarks:[],camps:[],findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[{...b}]}),sent=[],ui={log:[],roll(m,v){this.log.push(['roll',m.id,v]);},pick(){},result(m,mine){this.log.push(['result',mine]);},clear(){}};
 const others=[{name:'Kevin',x:g.player.x+50,y:g.player.y,party:true}];
 const net=createNetParty({game:()=>g,me:()=>'Anni',send:m=>sent.push(m),others:()=>others,ui});net.tick();
 return {g,sent,ui,others,net};
}

test('Client: seltene Beute geht in den Wurf, Gewinn landet im Rucksack, Trennung gibt sie zurück',()=>{
 const {g,sent,net,others}=client(),rare=Object.keys(ITEMS).find(id=>ITEMS[id].rarity==='rare'&&ITEMS[id].slot),common=Object.keys(ITEMS).find(id=>ITEMS[id].rarity==='common'&&ITEMS[id].kind==='material');
 assert.ok(rare&&common);const kept=g.netParty.loot([{id:rare,count:1},{id:common,count:2}],{name:'Keiler'});
 assert.deepEqual(kept,[{id:common,count:2}]);assert.equal(sent[0].t,'offer');assert.equal(sent[0].item.id,rare);
 const has=()=>g.rpg.inventory.some(e=>e.id===rare)||Object.values(g.rpg.equipment).includes(rare);
 net.receive({t:'rolled',id:1,item:sent[0].item,winner:'Kevin',rolls:[]});assert.equal(has(),false,'Kevin gewinnt: nichts für mich');assert.equal(net.pending.length,0);
 g.netParty.loot([{id:rare,count:1}],{name:'Keiler'});net.reset();assert.equal(has(),true,'Verbindung weg → Teil bleibt beim Finder');
 others.length=0;assert.deepEqual(g.netParty.loot([{id:rare,count:1}],{}),[{id:rare,count:1}],'allein: kein Wurf');
});

test('Client: gewürfeltes Teil reist als Bauplan und wird beim Gewinner neu registriert',()=>{
 const {g,net}=client(),before=Object.keys(g.rpg.generated).length;
 net.receive({t:'rolled',id:2,item:RARE,winner:'Anni',rolls:[]});
 const ids=Object.keys(g.rpg.generated);assert.equal(ids.length,before+1);assert.equal(ITEMS[ids.at(-1)].rarity,'rare');
});

test('Engine: Gruppen-Buff wirkt anteilig, EP-Bonus zählt nur Mitglieder in der Nähe',()=>{
 const {g,others}=client();
 g.applyPartyBuff({name:'Isolierband hält',duration:10,shield:100,reduction:.2,hot:0},'Kevin');
 assert.equal(g.partyBuff.shield,Math.round(100*BALANCE.party.buffShare));assert.ok(g.activeBuffs().some(b=>b.id==='party-buff'&&/Kevin/.test(b.name)));
 assert.equal(g.netParty.near(),1);others[0].x+=BALANCE.party.range+100;assert.equal(g.netParty.near(),0,'zu weit weg zählt nicht');
});
