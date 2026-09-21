// Miteinander (E-44): Hilfe auf Mitspieler, Aufhelfen, Handel, Weltboss – Serverregeln, Client-Abgleich, Engine-Haken.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createSocialPlay,cleanGoods,SOCIAL_RULES} from '../server/game/social-play.mjs';
import {createSharedWorld} from '../server/game/shared-world.mjs';
import {createNetSocial} from '../net-social.js';
import {Game} from '../engine.js';
import {ITEMS,addItem,countItem} from '../rpg.js';
import {BALANCE,BOSSES} from '../content/index.js';

function server({bossFirstMs}={}){
 const list=[],clock={t:1000},groups=new Map(),said=[];
 const send=(c,m)=>c.inbox.push(m),shared=createSharedWorld({clients:()=>list,send,now:()=>clock.t,random:()=>0,onKill:(w,e,credit)=>social.bossKilled(w,e,credit)});
 const social=createSocialPlay({clients:()=>list,members:c=>groups.get(c)||[],send,shared,say:t=>said.push(t),now:()=>clock.t,random:()=>0,bossFirstMs});
 const join=(id,name,x=0,y=0,w='welt')=>{const c={id,name,world:w,x,y,placed:true,s:'idle',party:null,inbox:[]};list.push(c);return c;};
 const party=(...m)=>{for(const c of m)groups.set(c,m);};
 const last=(c,t)=>c.inbox.filter(m=>m.t===t).at(-1);
 return {social,shared,join,party,last,clock,said,list};
}

test('Hilfe: nur Gruppenmitglieder in Reichweite, Werte gekappt, Tote bekommen nichts',()=>{
 const {social,join,party,last}=server(),a=join(1,'Anni'),b=join(2,'Kevin',100),c=join(3,'Fremd',50);party(a,b);
 assert.equal(social.aid(a,{to:'Kevin',heal:99999,name:'Pflaster'}),true);assert.equal(last(b,'aid').heal,5000);assert.equal(last(b,'aid').from,'Anni');
 assert.equal(social.aid(a,{to:'Fremd',heal:10}),false,'nicht in der Gruppe');
 b.x=SOCIAL_RULES.aidRange+1;assert.equal(social.aid(a,{to:'Kevin',heal:10}),false);assert.match(last(a,'notice').text,/zu weit/);
 b.x=10;b.s='dead';assert.equal(social.aid(a,{to:'Kevin',heal:10}),false);
});

test('Aufhelfen: jeder darf, aber nur Liegende, nur aus der Nähe und nur wer selbst steht',()=>{
 const {social,join,last}=server(),a=join(1,'Anni'),b=join(2,'Kevin',50);
 assert.equal(social.revive(a,{to:'Kevin'}),false,'steht noch');b.s='dead';
 a.s='dead';assert.equal(social.revive(a,{to:'Kevin'}),false);a.s='idle';
 b.x=SOCIAL_RULES.reviveRange+1;assert.equal(social.revive(a,{to:'Kevin'}),false);b.x=50;
 assert.equal(social.revive(a,{to:'Kevin'}),true);assert.equal(last(b,'revived').from,'Anni');assert.equal(social.revive(a,{to:'Kevin'}),false,'kein zweites Mal');
});

test('Handel: Anfrage, Angebot, jede Änderung nimmt Zusagen zurück, beide Zusagen schließen ab, Abbruch und Trennung',()=>{
 const {social,join,last}=server(),a=join(1,'Anni'),b=join(2,'Kevin',50),c=join(3,'Dieter',60);
 social.trade(a,{op:'ask',name:'Kevin'});assert.equal(last(b,'tradeask').from,'Anni');social.trade(b,{op:'accept'});assert.equal(last(a,'trade').with,'Kevin');
 social.trade(c,{op:'ask',name:'Kevin'});assert.match(last(c,'notice').text,/handelt gerade/);
 social.trade(a,{op:'offer',items:[{id:'kronkorken',name:'Kronkorken',rarity:'common',count:500}],coins:-5});
 assert.deepEqual(last(b,'trade').theirs,{items:[{id:'kronkorken',name:'Kronkorken',rarity:'common',icon:'',slot:'',count:99}],coins:0,ok:false});
 social.trade(b,{op:'confirm'});assert.equal(last(a,'trade').theirs.ok,true);social.trade(b,{op:'offer',items:[],coins:12});assert.equal(last(a,'trade').theirs.ok,false,'Änderung nimmt die Zusage zurück');
 social.trade(a,{op:'confirm'});social.trade(b,{op:'confirm'});const done=last(a,'tradedone');assert.equal(done.get.coins,12);assert.equal(done.give.items[0].count,99);assert.equal(last(b,'tradedone').get.items[0].id,'kronkorken');assert.equal(social.trades.size,0);
 social.trade(a,{op:'ask',name:'Kevin'});social.trade(b,{op:'accept'});social.gone(a);assert.ok(last(b,'tradeend'));assert.equal(social.trades.size,0);
 assert.equal(cleanGoods([{id:'<x>',name:'a'},{id:'ok',name:'B',count:0}]).length,1);
});

test('Weltboss: Ansage nach Zeitplan, Lebenspunkte skalieren mit Spielern, Nachzügler, Sieg-Ansage mit Namen, Abzug',()=>{
 const {social,shared,join,last,clock,said}=server({bossFirstMs:5000}),a=join(1,'Anni'),b=join(2,'Kevin');
 social.tick();assert.equal(social.bosses.size,0);clock.t+=5001;social.tick();const w=last(a,'wboss');assert.ok(w);assert.equal(w.hpx,1+SOCIAL_RULES.boss.hpPerPlayer);assert.deepEqual(last(b,'wboss'),w);
 social.bossSeen(a,{e:w.e,name:'Gisela',where:'bei „Kirche“'});social.bossSeen(b,{e:w.e,name:'Quatsch'});assert.equal(said.length,1);assert.match(said[0],/Gisela.*Kirche/);
 const late=join(3,'Spät');social.sync(late);assert.equal(last(late,'wboss').e,w.e);
 social.bossHit(b,w.e);shared.hit(a,{e:w.e,d:100,max:100});assert.match(said[1],/liegt am Boden.*Anni.*Kevin/);assert.equal(social.bosses.size,0);
 const second=social.spawnBoss('welt','sigi');clock.t+=SOCIAL_RULES.boss.lifeMs+1;social.tick();assert.equal(last(a,'wbossgone').e,second.e);
});

const arena=()=>({spawn:{x:0,y:0},npc:{x:10,y:0},landmarks:[{name:'Kirche',x:300,y:0}],camps:[{x:400,y:0,type:'boar'}],findClear:(x,y)=>({x,y}),blocked:()=>false,lineClear:()=>true,findPath:(a,b)=>[{...b}]});
function client(){
 const g=new Game(arena()),sent=[],hooks={},others=[{name:'Kevin',x:50,y:0,party:true,state:'idle'}],ui={shown:null,trade(m){this.shown=m;},tradeClose(){this.shown=null;}};
 const social=createNetSocial({game:()=>g,me:()=>'Anni',send:m=>sent.push(m),others:()=>others,hooks,ui});g.netParty=hooks;return {g,sent,hooks,others,social,ui};
}

test('Client: Hilfsziel schickt Heilung und Schutz, Engine nimmt Hilfe und Aufhelfen an',()=>{
 const {g,sent,hooks,others,social}=client();
 assert.equal(hooks.aidHeal(80,'Pflaster'),false,'ohne Hilfsziel nichts');social.setFriend('Kevin');assert.equal(hooks.aidHeal(80,'Pflaster'),true);assert.deepEqual(sent.at(-1),{t:'aid',to:'Kevin',heal:80,name:'Pflaster'});
 others[0].x=9999;assert.equal(hooks.buffFriend({name:'Dosenmut'}),false,'zu weit weg');
 g.player.hp=100;g.receiveAid({from:'Kevin',name:'Pflaster',heal:50,b:{name:'Isolierband hält',duration:10,shield:100}});assert.equal(g.player.hp,150);assert.equal(g.partyBuff.shield,100,'gezielter Schutz wirkt voll');
 g.player.hp=0;g.dead=true;assert.equal(g.reviveHere('Kevin'),true);assert.equal(g.dead,false);assert.equal(g.player.hp,Math.round(g.player.maxHp*BALANCE.party.reviveHp));assert.equal(g.reviveHere('Kevin'),false);
 others[0].x=50;others[0].state='dead';assert.equal(social.canRevive('Kevin'),true);others[0].state='idle';assert.equal(social.canRevive('Kevin'),false);
});

test('Client: Handel bucht Abgabe und Erhalt, geplatzter Handel rührt nichts an',()=>{
 const {g,sent,social,ui}=client(),mat=Object.keys(ITEMS).find(id=>ITEMS[id].kind==='material'),other=Object.keys(ITEMS).find(id=>ITEMS[id].kind==='material'&&id!==mat);
 addItem(g.rpg,mat,5);g.rpg.coins=30;social.receive({t:'trade',with:'Kevin',mine:{items:[],coins:0,ok:false},theirs:{items:[],coins:0,ok:false}});assert.equal(ui.shown.with,'Kevin');
 assert.equal(social.tradeAdd(mat),true);assert.equal(sent.at(-1).items[0].count,5);social.tradeCoins(999);assert.equal(sent.at(-1).coins,30,'mehr Marken als vorhanden geht nicht');
 social.receive({t:'tradedone',with:'Kevin',give:{items:[{id:mat,count:5}],coins:10},get:{items:[{id:other,name:'x',rarity:'common',count:3}],coins:7}});
 assert.equal(countItem(g.rpg,mat),0);assert.equal(countItem(g.rpg,other),3);assert.equal(g.rpg.coins,27);assert.equal(ui.shown,null);
 social.receive({t:'tradedone',with:'Kevin',give:{items:[{id:mat,count:1}],coins:0},get:{items:[{id:other,count:9}],coins:50}});assert.equal(countItem(g.rpg,other),3,'fehlt etwas, platzt der Handel ganz');assert.equal(g.rpg.coins,27);
});

test('Client/Engine: Weltboss erscheint am Lager, meldet sich, zählt nicht für die Geschichte, verschwindet nach dem Sieg',()=>{
 const {g,sent,social}=client(),boss=Object.keys(BOSSES)[0];
 social.receive({t:'wboss',e:'wboss:1',boss,spot:7,hpx:2});const e=g.netEnemy('wboss:1');assert.ok(e?.worldBoss);assert.equal(e.maxHp,Math.round(BOSSES[boss].hp*BALANCE.party.worldBossHp*2));
 assert.equal(sent.at(-1).t,'wbseen');assert.equal(sent.at(-1).where,'östlich vom Clan-Treff');social.receive({t:'wboss',e:'wboss:1',boss,spot:7,hpx:2});assert.equal(g.enemies.filter(x=>x.worldBoss).length,1,'kein Doppelgänger');
 const before=JSON.stringify(g.quest);g.kill(e);assert.equal(JSON.stringify(g.quest),before,'Hauptquest bleibt unberührt');
 assert.ok(g.rpg.inventory.some(i=>ITEMS[i.id]?.rarity==='rare')||Object.values(g.rpg.equipment).some(id=>ITEMS[id]?.rarity==='rare'),'sicheres seltenes Teil');
 social.tick();assert.equal(e.respawnAt,Infinity);g.time+=21;social.tick();assert.equal(g.netEnemy('wboss:1'),null);
});
