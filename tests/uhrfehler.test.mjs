// Uhrfehler (2026-09-26, docs/UHRFEHLER-2026-09-26.md): Fass, Sporenwolke und Nest zählten ihre Pulse auf `z.tick`, den auch die allgemeine
// Feldschleife in tickClass herunterzählt und zurücksetzt. Sie lief im selben Bild danach und setzte die Uhr zurück, sobald sie ablief – bei festem
// Bildtakt sah der Sonderzweig sie nie ablaufen: Weizenfass heilte nie (500 → 500 Leben in 5 s), Bockfass traf nie, Sporen markierten nie.
// Jetzt hat jede Sonderwirkung ihre eigene Uhr (class-mechanics fieldPulse). Hier wird jede Bodenwirkung und jeder Zeitgeber der fünf Klassen
// bei mehreren Bildtakten geprüft: wirkt sie, und genau einmal je Takt (nicht nie, nicht doppelt)?
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Game} from '../engine.js';
import {changeSpec,pathBuild,learnTalent,talentPoints} from '../talents.js';
import {makeEnemy} from '../encounters.js';
import {combatStats} from '../rpg.js';
import {performTalent,fieldPulse} from '../class-mechanics.js';
import {M} from '../spec-mechanics.js';
import {TALENT_SKILLS} from '../content/index.js';
import {meterReport} from '../combat-meter.js';

const arena=()=>({spawn:{x:0,y:0},npc:{x:0,y:20},landmarks:[],camps:[],quests:[],blocked:()=>false,findClear:(x,y)=>({x,y}),lineClear:()=>true,findPath:(a,b)=>[b]});
const AT={x:1000,y:1000};
/** Bildtakte: Simulation (Balance-Sheet, Dungeon-Simulation), Browser 60 Hz gleichmäßig, 144 Hz, 60 Hz mit ±5 % Schwankung (fester Startwert). */
const lcg=seed=>{let s=seed;return ()=>(s=(s*1103515245+12345)%2147483648)/2147483648;};
const RATES=[['20 Bilder/s (Simulation)',()=>()=>.05],['60 Hz gleichmäßig',()=>()=>1/60],['144 Hz',()=>()=>1/144],['60 Hz schwankend',()=>{const r=lcg(7);return ()=>(1/60)*(.95+.1*r());}]];
const SIM=RATES[0],JITTER=RATES[3];

/** Held Stufe 20 (alle Kniffe gelernt), drei festgehaltene Gegner 30 Einheiten um AT, optional Talentpfad und ein Söldner an AT. */
function setup(classId,spec,{path=null,mate=false}={}){
 const g=new Game(arena(),{classId,level:20,tutorial:{completed:true}});g.toast=()=>{};g.fail=m=>{g.lastMsg=m;};changeSpec(g,spec);
 if(path!=null)for(const id of pathBuild(spec,path,talentPoints(g)))learnTalent(g,id);
 g.refreshStats();Object.assign(g.player,AT);g.player.hp=g.player.maxHp;g.player.inCombat=7;
 if(mate){g.hireCompanion('merc-pils-peter',{free:true});Object.assign(g.companions[0],{x:AT.x+12,y:AT.y+10,inCombat:6});}
 const foes=[0,1,2].map(i=>{const e=makeEnemy({x:AT.x+Math.round(30*Math.cos(i*2.1)),y:AT.y+Math.round(30*Math.sin(i*2.1))},900+i,{hp:99999,roamWait:100,attackTimer:100,stun:1e9,damage:1});e.aggro=true;e.ai='combat';e.arena=true;return e;});
 g.enemies=[...foes];g.target=null;
 const hits={};const damage=g.damage.bind(g);g.damage=(e,n,label,...rest)=>{const before=e.hp,r=damage(e,n,label,...rest);if(before>e.hp){(hits[label]||=new Map()).set(e,((hits[label]?.get(e))||0)+1);}return r;};
 return {g,foes,hits};
}
/** Ein Bild weiter; Held bleibt im Kampf, Gegner bleiben stehen. */
function step(g,foes,dt){g.tick(dt);g.player.inCombat=7;for(const e of foes){e.x=e.home.x;e.y=e.home.y;}for(const c of g.companions||[]){c.inCombat=6;}}
/** Bodenkniff wirken und die Wirkzeit auslaufen lassen. */
function cast(g,foes,id='ground',point=AT){if(g.player.energy!==undefined)g.player.energy=100;if(g.res&&'glut' in g.res)g.res.glut=70;for(const k of Object.keys(g.cooldowns))g.cooldowns[k]=0;g.gcd=0;
 const ok=g.action(id,point);for(let i=0;i<80&&g.casting;i++)step(g,foes,.05);return ok;}
/** `seconds` lang mit dem Takt laufen und zählen, in wie vielen Bildern `value()` gestiegen ist (Pulse) und um wie viel. */
function pulses(g,foes,rate,value,seconds=5){const dt=rate[1]();let t=0,last=value(),n=0,sum=0;while(t<seconds-1e-9){const d=dt();step(g,foes,d);t+=d;const v=value();if(v>last+1e-9){n++;sum+=v-last;}last=v;}return {n,sum};}
const heals=(g,id)=>meterReport(g,'current','healing').actors.flatMap(a=>a.abilities).find(a=>a.id===id);
const inWindow=(n,what,rate,lo=4,hi=6)=>assert.ok(n>=lo&&n<=hi,`${what} bei ${rate[0]}: ${n} Pulse in 5 s (erwartet ${lo}–${hi}, einmal je Sekunde)`);

test('Weizenfass (Zapfmeister) heilt jede Sekunde – vorher 500 → 500 Leben in 5 s',()=>{
 for(const rate of RATES){const {g,foes}=setup('dieter','dieter-brew');assert.ok(cast(g,foes),'Anstich ('+g.lastMsg+')');
  const fass=g.fields.find(z=>z.kind==='fass');assert.equal(fass?.sort,'weizen','ohne Pfad steht Weizen');
  g.player.hp=500;const {n}=pulses(g,foes,rate,()=>g.player.hp);
  assert.ok(g.player.hp>500,`${rate[0]}: Leben ${g.player.hp} nach 5 s im Weizenfass`);inWindow(n,'Weizenfass',rate);}
 // Die Kampfstatistik nennt die Heilung beim Namen des Bodenkniffs (vorher „Sonstige Heilung“).
 const {g,foes}=setup('dieter','dieter-brew');cast(g,foes);g.player.hp=500;pulses(g,foes,SIM,()=>g.player.hp);
 assert.equal(heals(g,'ground')?.name,g.skills.find(s=>s.id==='ground').name);
});

test('Bockfass (Zapfmeister, Pfad Bock) trifft jeden Gegner im Kreis jede Sekunde',()=>{
 for(const rate of RATES){const {g,foes,hits}=setup('dieter','dieter-brew',{path:2});assert.ok(cast(g,foes));assert.equal(g.fields.find(z=>z.kind==='fass')?.sort,'bock');
  for(const k of Object.keys(hits))delete hits[k];pulses(g,foes,rate,()=>0);
  for(const e of foes)inWindow(hits.Bockfass?.get(e)||0,'Bockfass an Gegner '+e.id,rate);}
});

test('Pilsfass (Zapfmeister, Pfad Pils) gibt im Kreis Tempo',()=>{
 const {g,foes}=setup('dieter','dieter-brew',{path:0});assert.ok(cast(g,foes));assert.equal(g.fields.find(z=>z.kind==='fass')?.sort,'pils');step(g,foes,.05);
 assert.ok(M(g).fassHaste>0&&M(g).hasteBonus>0,'Tempo im Kreis');g.player.x+=200;step(g,foes,.05);assert.equal(M(g).fassHaste,0,'außerhalb kein Tempo');
});

test('Sporenwolke (Putzpyramide) markiert jeden Gegner im Kreis binnen 0,6 s, die Markierung schadet',()=>{
 for(const rate of RATES){const {g,foes,hits}=setup('baerbel','baerbel-feedback');assert.ok(cast(g,foes),'Sporenwolke ('+g.lastMsg+')');assert.ok(g.fields.some(z=>z.kind==='spores'));
  for(const e of foes){e.mark=0;e.dotTimer=1;}for(const k of Object.keys(hits))delete hits[k];
  pulses(g,foes,rate,()=>0,.6);assert.equal(foes.filter(e=>e.mark>0).length,3,rate[0]+': alle drei markiert');
  pulses(g,foes,rate,()=>0,2.5);for(const e of foes)assert.ok((hits.Markierung?.get(e)||0)>=2,rate[0]+': Markierung schadet Gegner '+e.id);}
});

test('Nest (Landhaus-Lazarett) heilt dich und den Söldner jede Sekunde – Stand nach Heiler-WoW bleibt',()=>{
 for(const rate of [SIM,JITTER]){const {g,foes}=setup('baerbel','baerbel-care',{mate:true});assert.ok(cast(g,foes));const c=g.companions[0];
  g.player.hp=Math.round(g.player.maxHp*.5);c.hp=Math.round(c.maxHp*.5);let me=0,mate=0;
  const r=pulses(g,foes,rate,()=>(me=g.player.hp)+(mate=c.hp)*1e6);inWindow(r.n,'Nest',rate);
  assert.ok(me>g.player.maxHp*.5&&mate>c.maxHp*.5,rate[0]+': Heldin und Söldner geheilt');}
});

test('Robbi (Schrottkoloss) schießt jede Sekunde, Räucherofen (Räuchermeister) raucht sofort und dann jede Sekunde',()=>{
 for(const rate of [SIM,JITTER]){
  {const {g,foes,hits}=setup('kevin','kevin-iron');assert.ok(cast(g,foes));assert.ok(g.fields.some(z=>z.kind==='robbi'));for(const k of Object.keys(hits))delete hits[k];pulses(g,foes,rate,()=>0);
   inWindow([...(hits.Robbi?.values()||[])].reduce((a,b)=>a+b,0),'Robbi',rate,5,6);}
  {const {g,foes,hits}=setup('schorsch','schorsch-rauch');assert.ok(cast(g,foes),'Räucherofen ('+g.lastMsg+')');assert.ok(g.fields.some(z=>z.kind==='oven'));for(const k of Object.keys(hits))delete hits[k];pulses(g,foes,rate,()=>0);
   for(const e of foes)inWindow(hits.Rauch?.get(e)||0,'Räucherofen an Gegner '+e.id,rate,5,6);}}
});

test('Grillbuffet (Grillhütten-Chef) und Legekreis (Kartenlegerin) heilen jede Sekunde',()=>{
 for(const [cls,spec,kind] of [['schorsch','schorsch-chef','buffet'],['kaethe','kaethe-herz','legekreis']])for(const rate of [SIM,JITTER]){
  const {g,foes}=setup(cls,spec);assert.ok(cast(g,foes),spec+' ('+g.lastMsg+')');assert.ok(g.fields.some(z=>z.kind===kind),kind+' liegt');
  g.player.hp=Math.round(g.player.maxHp*.4);const {n}=pulses(g,foes,rate,()=>g.player.hp);inWindow(n,kind,rate);}
});

test('Talentfelder: Katerfass und Thermomix-Tafel heilen, Pfandseil schnappt zu, Brandfläche (Lunte) brennt jede Sekunde',()=>{
 for(const [cls,spec,id] of [['dieter','dieter-brew','keg'],['baerbel','baerbel-care','sanctuary']]){const {g,foes}=setup(cls,spec);performTalent(g,{id,...TALENT_SKILLS[id]},AT,combatStats(g));
  g.player.hp=Math.round(g.player.maxHp*.4);const {n}=pulses(g,foes,SIM,()=>g.player.hp);inWindow(n,id,SIM);}
 {const {g,foes,hits}=setup('kevin','kevin-hunt');performTalent(g,{id:'snare',...TALENT_SKILLS.snare},AT,combatStats(g));pulses(g,foes,SIM,()=>0,1);assert.ok(hits.Falle?.size>=1,'Pfandseil schnappt zu');}
 {const {g,foes,hits}=setup('kevin','kevin-fuse');assert.ok(cast(g,foes));for(let i=0;i<40&&!g.fields.some(z=>z.kind==='burn');i++)step(g,foes,.05);assert.ok(g.fields.some(z=>z.kind==='burn'),'Brandfläche liegt');
  for(const k of Object.keys(hits))delete hits[k];pulses(g,foes,SIM,()=>0,1.6);assert.ok([...(hits.Nachglut?.values()||[])].every(n=>n===1)&&hits.Nachglut?.size>=1,'Nachglut einmal je Sekunde');}
});

test('Zwei Felder übereinander: Weizenfass (eigene Uhr) und Katerfass (allgemeine Feldschleife) heilen beide jede Sekunde',()=>{
 for(const rate of RATES){const {g,foes}=setup('dieter','dieter-brew');assert.ok(cast(g,foes));performTalent(g,{id:'keg',...TALENT_SKILLS.keg},AT,combatStats(g));
  g.player.hp=100;pulses(g,foes,rate,()=>0);inWindow(heals(g,'ground')?.hits||0,'Weizenfass neben Katerfass',rate);inWindow(heals(g,'keg')?.hits||0,'Katerfass neben Weizenfass',rate);}
});

test('Zeitgeber der Klassen zählen einmal je Sekunde: Heilung über Zeit, Nachheilung am Söldner, Glutbrand, Handlesen, Markierung, Gruppen-Stärkung',()=>{
 const cases=[
  ['Anni: Heilung über Zeit (classState.hot)','baerbel','baerbel-care',(g)=>{Object.assign(g.classState,{hot:5.01,hotPower:10,hotTick:1});g.player.hp=100;return ()=>g.player.hp;}],
  ['Heiler-Kit: Nachsorge am Helden (classState.hots)','baerbel','baerbel-care',(g)=>{g.classState.hots=[{id:'mark',remaining:5.01,tick:1,power:10}];g.player.hp=100;return ()=>g.player.hp;}],
  ['Söldner: Nachheilung (aidHot)','schorsch','schorsch-chef',(g,foes)=>{g.hireCompanion('merc-pils-peter',{free:true});const c=g.companions[0];Object.assign(c,{x:AT.x+12,y:AT.y+10,hp:100,aidHot:{remaining:5.01,power:5,tick:1}});return ()=>c.hp;}],
  ['Schorsch: Glutbrand (e.burn)','schorsch','schorsch-flamme',(g,foes)=>{foes[0].burn={t:5.01,tick:1,dps:10};return ()=>99999-foes[0].hp;}],
  ['Käthe: Handlesen (res.tick)','kaethe','kaethe-herz',(g)=>{Object.assign(g.res,{readHand:5.01,readHandTarget:g.player,tick:1});g.player.hp=100;return ()=>g.player.hp;}],
  ['Markierung (e.dotTimer)','dieter','dieter-wall',(g,foes)=>{Object.assign(foes[0],{mark:5.01,dotTimer:1,dotDamage:12});return ()=>99999-foes[0].hp;}],
  ['Gruppen-Stärkung mit Heilung (partyBuff)','kevin','kevin-hunt',(g)=>{g.partyBuff={name:'Probe',remaining:5.01,hot:10,tick:1};g.player.hp=100;return ()=>g.player.hp;}]];
 for(const [what,cls,spec,arm] of cases)for(const rate of RATES){const {g,foes}=setup(cls,spec);const value=arm(g,foes);const {n}=pulses(g,foes,rate,value);inWindow(n,what,rate);}
});

test('fieldPulse: jede Wirkung hat ihre eigene Uhr; nur die allgemeine Feldschleife zählt z.tick',()=>{
 const z={tick:1};let a=0,b=0,c=0;for(let i=0;i<100;i++){z.tick-=.05;if(z.tick<=0)z.tick=1;/* allgemeine Schleife wie in tickClass */if(fieldPulse(z,'fass',.05))a++;if(fieldPulse(z,'spores',.05,.5))b++;if(fieldPulse(z,'rauch',.05,1,0))c++;}
 assert.ok(a>=4&&a<=5,'1-s-Uhr: '+a);assert.ok(b>=9&&b<=10,'0,5-s-Uhr: '+b);assert.ok(c>=5&&c<=6,'sofort, dann jede Sekunde: '+c);
 // Quelltext-Wächter: Sonderwirkungen dürfen z.tick nicht mehr herunterzählen (genau der Fehler von Nest, Fass und Sporen).
 for(const file of ['spec-mechanics.js','class-resources.js','healer-kit.js']){const src=readFileSync(new URL('../'+file,import.meta.url),'utf8');
  assert.doesNotMatch(src,/\bz\.tick\s*-=|\bz\.tick\s*=|\bnestTick\b|\bz\.pulse\b/,file+': eigene Uhr über fieldPulse statt z.tick');}
 const cm=readFileSync(new URL('../class-mechanics.js',import.meta.url),'utf8');assert.equal(cm.match(/\bz\.tick\s*-=/g)?.length,1,'class-mechanics: nur die allgemeine Feldschleife zählt z.tick');
});
