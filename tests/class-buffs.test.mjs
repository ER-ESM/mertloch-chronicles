// Klassen-Buffs (content/class-buffs.js, class-buffs.js): Wirkung, Stapelregeln, Spielstand, Söldner, Talente, Netz.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {CLASS_BUFFS,CLASS_BUFF_TUNING,classBuffsFor,describe,validateContent} from '../content/index.js';
import {classBuffValue,applyClassBuff,tickClassBuffs,savedClassBuffs,restoreClassBuffs,classBuffAuras} from '../class-buffs.js';
import {combatStats,actionBar} from '../rpg.js';
import {available,skillLevel} from '../progression.js';
import {selectCompanionAid} from '../companions.js';
import {createNetSocial} from '../net-social.js';
import {createSocialPlay} from '../server/game/social-play.mjs';
import {collectAuras} from '../auras.js';
import {iconBook} from '../combat-ui.js';
import {stepPlayer} from '../movement.js';

const world=()=>({id:'cb-test',seed:1,spawn:{x:0,y:0},npc:{x:-5000,y:-5000},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[{...b}]});
function hero(classId='dieter',level=12,saved={}){const g=new Game(world(),{classId,level,...saved});g.random=()=>.5;g.toast=t=>{g.lastToast=t;};g.player.inCombat=0;return g;}
const cast=(g,id)=>{g.gcd=0;return g.action(id);};
const val=(id,stat)=>CLASS_BUFFS[id].effects[stat];

test('jede Klasse bringt zwei Buffs mit, jeder hebt einen anderen Wert; Inhalt ist gültig',()=>{
 assert.deepEqual(validateContent(),[]);
 const stats=new Set();
 for(const cls of ['dieter','baerbel','kevin']){const list=classBuffsFor(cls);assert.equal(list.length,2,cls);
  for(const b of list){assert.equal(b.duration,CLASS_BUFF_TUNING.duration);for(const k of Object.keys(b.effects)){assert.ok(!stats.has(k),'Wert doppelt: '+k);stats.add(k);}
   assert.ok(describe('classBuff',b.id).numbers.length>=3);}}
 assert.equal(CLASS_BUFF_TUNING.duration,1800);
});

test('Buffs sind Kniffe: im Kniffe-Menü, ab ihrer Stufe gelernt, auf die Leiste legbar, kostenlos mit globaler Abklingzeit',()=>{
 const low=hero('dieter',3);assert.equal(available(low,'dosenpfand'),false);assert.equal(skillLevel(low,'dosenpfand'),CLASS_BUFFS.dosenpfand.level);
 const g=hero('dieter',12);for(const b of classBuffsFor('dieter')){const s=g.skills.find(s=>s.id===b.id);assert.ok(s,b.id);assert.equal(s.cost,0);assert.equal(s.cd,0);assert.ok(available(g,b.id));}
 assert.ok(!g.skills.some(s=>s.id==='aperolSpritz'),'fremde Klassen-Buffs gehören nicht in Dieters Kniffe');
 assert.match(iconBook(g,null,null),/data-book-skill="dosenpfand"/);assert.match(iconBook(g,null,null),/data-book-skill="kutteDrueber"/);
 const bar=actionBar(g);bar[9]='kutteDrueber';assert.equal(actionBar(g)[9],'kutteDrueber','auf die Leiste gelegt bleibt er dort');
 g.player.energy=0;assert.equal(cast(g,'kutteDrueber'),true,'kostet keine Randale');assert.ok(g.gcd>0,'globale Abklingzeit läuft');assert.equal(g.cooldowns.kutteDrueber,0);
 assert.equal(g.action('dosenpfand'),false,'während der globalen Abklingzeit nicht');g.gcd=0;assert.equal(g.action('dosenpfand'),true);
});

test('Wirkung: Leben, Schadensminderung, Tempo, Glückstreffer, Randale, erhaltene Heilung und Laufgeschwindigkeit',()=>{
 const g=hero('dieter');const hp=g.player.maxHp,cur=g.player.hp,before=combatStats(g);
 cast(g,'dosenpfand');assert.equal(g.player.maxHp,Math.round(hp*(1+val('dosenpfand','health'))));assert.equal(g.player.hp,cur+(g.player.maxHp-hp),'zusätzliches Leben kommt sofort dazu');
 cast(g,'kutteDrueber');assert.ok(Math.abs(combatStats(g).armor-before.armor-val('kutteDrueber','armor'))<1e-9);
 const hit=n=>{const e={x:10,y:0,damage:1,name:'Puppe',id:'p'};g.player.hp=g.player.maxHp;g.classState.guard=0;const h=g.player.hp;g.hitPlayer?.(e,n);return h-g.player.hp;};
 if(typeof g.hitPlayer==='function'){const withKutte=hit(200);delete g.classBuffs.kutteDrueber;const without=hit(200);assert.ok(withKutte<without,'Kutte senkt den Schaden: '+withKutte+' < '+without);}
 const a=hero('baerbel'),s=combatStats(a);cast(a,'vorherNachher');cast(a,'aperolSpritz');const t=combatStats(a);
 assert.ok(Math.abs(t.haste-s.haste-val('vorherNachher','haste'))<1e-9);assert.ok(t.gcd<s.gcd||t.gcd===1,'kürzere globale Abklingzeit');
 assert.ok(Math.abs(t.energyRegen-s.energyRegen-val('aperolSpritz','energyRegen'))<1e-9);assert.equal(t.healTaken,val('aperolSpritz','healTaken'));
 a.player.hp=100;a.receiveAid({from:'Kevin',heal:100});assert.equal(a.player.hp,100+Math.round(100*(1+val('aperolSpritz','healTaken'))),'erhaltene Heilung steigt');
 const k=hero('kevin'),c0=combatStats(k).crit;cast(k,'pfandradar');assert.ok(Math.abs(combatStats(k).crit-c0-val('pfandradar','crit'))<1e-9);
 const walk=g=>{g.player.x=0;g.player.y=0;g.player.vx=0;g.player.vy=0;for(let i=0;i<60;i++)stepPlayer(g,1,0,1/60);return g.player.x;};
 const k2=hero('kevin'),slow=walk(k2);cast(k2,'kabelbinderSohlen');const fast=walk(k2);assert.ok(fast>slow*(1+val('kabelbinderSohlen','speed'))*.97,'schneller zu Fuß: '+fast+' vs '+slow);
});

test('Stapelregeln: verschiedene Buffs wirken zusammen, derselbe nicht; der stärkere gewinnt, gleich stark erneuert die Dauer',()=>{
 const g=hero('dieter');
 assert.equal(applyClassBuff(g,g,{id:'dosenpfand',power:1,remaining:600,from:'Eddi'}),'new');
 assert.equal(applyClassBuff(g,g,{id:'vorherNachher',power:1,remaining:1800,from:'Anni'}),'new');
 assert.equal(applyClassBuff(g,g,{id:'pfandradar',power:1,remaining:1800,from:'Kevin'}),'new');
 assert.equal(Object.keys(g.classBuffs).length,3,'drei Klassen, drei Buffs');
 assert.equal(applyClassBuff(g,g,{id:'dosenpfand',power:1,remaining:1800,from:'Dieter'}),'refreshed');assert.equal(g.classBuffs.dosenpfand.remaining,1800,'gleich stark: neuere Dauer');
 assert.equal(applyClassBuff(g,g,{id:'dosenpfand',power:1.5,remaining:900,from:'Tank'}),'refreshed');assert.equal(g.classBuffs.dosenpfand.power,1.5);
 assert.equal(applyClassBuff(g,g,{id:'dosenpfand',power:1,remaining:1800,from:'Dieter'}),'weaker');assert.equal(g.classBuffs.dosenpfand.power,1.5,'schwächerer ersetzt den stärkeren nicht');
 assert.ok(Math.abs(classBuffValue(g,'health')-val('dosenpfand','health')*1.5)<1e-9,'derselbe Buff zählt einmal');
 assert.equal(applyClassBuff(g,g,{id:'unbekannt',power:1}),null);
 assert.equal(applyClassBuff(g,g,{id:'kutteDrueber',power:99,remaining:99999}),'new');assert.equal(g.classBuffs.kutteDrueber.power,CLASS_BUFF_TUNING.maxPower);assert.equal(g.classBuffs.kutteDrueber.remaining,CLASS_BUFF_TUNING.duration);
});

test('Dauer läuft ab, übersteht Tod und Wiederbeleben; danach fällt die Wirkung weg',()=>{
 const g=hero('dieter'),base=g.player.maxHp;cast(g,'dosenpfand');
 tickClassBuffs(g,600);assert.ok(Math.abs(g.classBuffs.dosenpfand.remaining-1200)<1e-6);
 g.player.hp=0;g.dead=true;g.respawn();assert.ok(g.classBuffs.dosenpfand,'Tod beendet den Buff nicht');assert.ok(g.player.maxHp>base);
 g.tick(.05);assert.ok(g.classBuffs.dosenpfand.remaining<1200);
 tickClassBuffs(g,1300);assert.equal(g.classBuffs.dosenpfand,undefined);assert.equal(g.player.maxHp,base,'maximales Leben zurück');
});

test('Spielstand: Restzeit, Stärke und Quelle werden gespeichert und beim Laden wiederhergestellt; Unsinn fällt weg',()=>{
 const g=hero('baerbel');cast(g,'aperolSpritz');applyClassBuff(g,g,{id:'dosenpfand',power:1.5,remaining:700,from:'Eddi'});tickClassBuffs(g,100);
 const save=JSON.parse(JSON.stringify(g.save()));assert.equal(save.classBuffs.length,2);
 const again=new Game(world(),save);assert.ok(Math.abs(again.classBuffs.dosenpfand.remaining-600)<.2);assert.equal(again.classBuffs.dosenpfand.power,1.5);assert.equal(again.classBuffs.dosenpfand.from,'Eddi');
 assert.equal(again.player.maxHp,Math.round((new Game(world(),{classId:'baerbel',level:12}).player.maxHp)*(1+val('dosenpfand','health')*1.5)),'Leben aus dem Buff gilt nach dem Laden');
 assert.deepEqual(restoreClassBuffs([{id:'x',remaining:5},{id:'kutteDrueber',remaining:-1},{id:'pfandradar',remaining:9e9,power:7},null]),{pfandradar:{id:'pfandradar',power:CLASS_BUFF_TUNING.maxPower,remaining:CLASS_BUFF_TUNING.duration,from:''}});
 assert.deepEqual(savedClassBuffs({}),[]);
});

test('Söldner: Buff auf den ausgewählten Söldner wirkt dort (Leben, Kutte, Glück), wird gespeichert und zählt ab',()=>{
 const g=hero('dieter');g.hireCompanion('merc-hopfen-horst',{free:true});const c=g.companions[0];Object.assign(c,{x:60,y:0});
 const hp=c.maxHp;selectCompanionAid(g,c.id);
 assert.equal(cast(g,'dosenpfand'),true);assert.equal(g.classBuffs.dosenpfand,undefined,'nicht auf mich');assert.ok(c.classBuffs.dosenpfand);
 g.tick(.05);assert.equal(c.maxHp,Math.round(hp*(1+val('dosenpfand','health'))),'Söldner bekommt mehr Leben');
 assert.equal(cast(g,'kutteDrueber'),true);assert.equal(classBuffValue(c,'armor'),val('kutteDrueber','armor'));
 const saved=JSON.parse(JSON.stringify(g.save())).companions[0];assert.equal(saved.classBuffs.length,2);
 const again=new Game(world(),JSON.parse(JSON.stringify(g.save())));assert.ok(again.companions[0].classBuffs.kutteDrueber);
 Object.assign(c,{x:5000,y:0});assert.equal(cast(g,'dosenpfand'),false,'zu weit weg: kein Zauber, keine globale Abklingzeit');
 selectCompanionAid(g,null);g.friend=null;assert.equal(cast(g,'dosenpfand'),true);assert.ok(g.classBuffs.dosenpfand,'ohne freundliches Ziel auf mich selbst');
});

test('Talente: der Haken classBuff:<id> verstärkt den Buff um talentStep je Stufe; Text nennt die Verstärkung',()=>{
 for(const [cls,spec,talent,id,stat] of [['dieter','dieter-wall','dieter-wall-10','dosenpfand','health'],['baerbel','baerbel-care','baerbel-care-3','aperolSpritz','healTaken'],['kevin','kevin-hunt','kevin-hunt-27','pfandradar','crit']]){
  const g=hero(cls,20);g.rpg.talents.spec=spec;g.rpg.talents.learned=[talent];g.refreshStats();
  const power=1+CLASS_BUFF_TUNING.talentStep;assert.match(g.skills.find(s=>s.id===id).text,/stärker/);
  cast(g,id);assert.equal(g.classBuffs[id].power,power,talent);assert.ok(Math.abs(classBuffValue(g,stat)-val(id,stat)*power)<1e-9);
 }
});

test('Netz: Buff auf ein Gruppenmitglied geht als gezielte Hilfe über den Server, der Empfänger wendet ihn an',()=>{
 const g=hero('dieter'),sent=[],hooks={},others=[{name:'Kevin',x:50,y:0,party:true,state:'idle'},{name:'Fremd',x:40,y:0,party:false}];
 createNetSocial({game:()=>g,me:()=>'Eddi',send:m=>sent.push(m),others:()=>others,hooks});g.netParty=hooks;
 g.friend={kind:'party',ref:others[0],player:true};assert.equal(cast(g,'dosenpfand'),true);
 assert.deepEqual(sent.at(-1),{t:'aid',to:'Kevin',name:'Dosenpfand',cb:{id:'dosenpfand',power:1,duration:CLASS_BUFF_TUNING.duration}});assert.equal(g.classBuffs.dosenpfand,undefined);
 g.friend={kind:'player',ref:others[1],player:true};const n=sent.length;assert.equal(cast(g,'dosenpfand'),false,'Fremde sind kein Ziel');assert.equal(sent.length,n);
 others[0].x=9999;g.friend={kind:'party',ref:others[0],player:true};assert.equal(cast(g,'dosenpfand'),false,'zu weit weg');
 // Server: reicht nur an Gruppenmitglieder weiter und stutzt Stärke/Dauer.
 const a={id:1,name:'Eddi',x:0,y:0,placed:true,world:'w'},b={id:2,name:'Kevin',x:50,y:0,placed:true,world:'w'},out=[];
 const social=createSocialPlay({clients:()=>[a,b],members:()=>[a,b],send:(c,m)=>out.push([c,m]),now:()=>0});
 social.aid(a,{t:'aid',to:'Kevin',name:'Dosenpfand',cb:{id:'dosenpfand',power:9,duration:99999}});
 const [to,msg]=out.find(([,m])=>m.t==='aid');assert.equal(to,b);assert.deepEqual(msg.cb,{id:'dosenpfand',power:2,duration:1800});
 // Empfänger: Kevin bekommt Dieters Dosenpfand, mit Quelle für den Tooltip.
 const k=hero('kevin');const kh={};createNetSocial({game:()=>k,me:()=>'Kevin',send:()=>{},others:()=>[],hooks:kh});
 k.receiveAid(msg);assert.equal(k.classBuffs.dosenpfand.power,2);assert.equal(k.classBuffs.dosenpfand.from,'Eddi');
 const aura=collectAuras(k).buffs.find(x=>x.id==='classBuff:dosenpfand');assert.ok(aura,'in der Buffleiste');assert.match(aura.source,/von Eddi \(Dosen-Dieter\)/);assert.ok(aura.remaining>1700);
 k.receiveAid({from:'X',cb:{id:'gibtsnicht',power:1,duration:10}});assert.equal(Object.keys(k.classBuffs).length,1,'unbekannte ID wird ignoriert');
});

test('Buffleiste: eigener Buff ohne Quelle, fremder mit Quelle; kein doppelter Eintrag',()=>{
 const g=hero('baerbel');cast(g,'vorherNachher');applyClassBuff(g,g,{id:'pfandradar',power:1,remaining:1800,from:'Kevin'});
 const own=classBuffAuras(g).find(a=>a.id==='classBuff:vorherNachher');assert.equal(own.source,'');assert.equal(own.icon,'vorherNachher');
 const list=collectAuras(g).buffs.filter(a=>String(a.id).includes('pfandradar'));assert.equal(list.length,1);assert.match(list[0].source,/von Kevin/);
});
