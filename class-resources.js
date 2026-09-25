// Klassenressourcen (E-72, docs/KLASSEN-RESSOURCEN-2026-09-25.md). Jede Klasse hat ein eigenes Modell:
//   rage  · Dieter   Randale als Wut (0 → aus Treffern) + Zeche (angeschriebener Schaden, Ausgaben bezahlen ihn)
//   trend · Anni     Likes (Währung) + Trend (Abwechslung hebt, Wiederholung senkt)
//   ammo  · Kevin    Leergut-Kasten, Flaschen am Boden aufsammeln, Pfandautomat mit Bon-Zone
//   grill · Schorsch Glut (Temperaturfenster) + Grillrost (Garzeiten), Stichflamme bei 100
//   cards · Käthe    Blatt (Kartenhand) + Augen (Skat-Zählung), Stich gegen Gegnerzauber, Abrechnen ab 61
// Daten und Zahlen: content/resources.js. Zustand: g.res (Kampfzustand, nicht im Spielstand). Die Engine ruft nur die
// exportierten Haken; ohne Eintrag (fremde Klasse) verhalten sich alle Haken neutral.
import {RESOURCES,RESOURCE_SKILLS,SPEC_MECHANICS,BALANCE,SKILL_DAMAGE} from './content/index.js';
import {emitCombatFx} from './combat-fx.js';
import {fireProcs} from './procs.js';
import {healPlayer,addGuard} from './class-mechanics.js';
import {healCompanionByPlayer,addThreat} from './companions.js';
import {helpTarget} from './help-target.js';
import {skillDamage} from './equipment.js';
import {ITEMS} from './rpg.js';
import {distance} from './world.js';
import {available} from './progression.js';

const R=g=>RESOURCES[g.member?.id]||null;
export const resourceKind=g=>R(g)?.kind||null;
const spec=g=>g.rpg?.talents?.spec;
const mech=g=>SPEC_MECHANICS[spec(g)]||null;
const num=(cs,k)=>cs?.[k]||0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const note=(g,text,color='#ffd77a',skill=null)=>{const p=g.player;if(!g.sct?.({area:'note',kind:'momentum',text,color,skill}))g.float?.(p.x,p.y-48,text,color);};
const live=(g,e)=>e&&e.hp>0&&e.ai!=='returning'&&!(e.spawnGrace>0);
const foes=(g,point,radius,except=null)=>g.enemies.filter(e=>e!==except&&live(g,e)&&distance(e,point)<=radius&&g.world.lineClear(point,e)).sort((a,b)=>distance(a,point)-distance(b,point));
const validTarget=(g,range)=>{const e=g.target,p=g.player;return live(g,e)&&distance(p,e)<=range&&g.world.lineClear(p,e)?e:null;};

// ---------------------------------------------------------------------------------------------------------------
// Anfangszustand
export function freshResource(g){
 const r=R(g),p=g.player;if(!r)return {};
 if(r.kind==='rage'){p.energy=r.start;return {tab:0,calm:0,paid:0};}
 if(r.kind==='trend'){p.energy=r.start;return {trend:0,last:[],idle:0,viral:0,calm:0,fight:false};}
 if(r.kind==='ammo')return {bottles:r.max,frac:0,bons:0,bonNow:false,reload:null,pickups:[],refill:0,serial:0};
 if(r.kind==='grill')return {glut:r.start,lock:0,rost:[],plan:0,noDecay:0,perfectCd:0,wasPerfect:false,cookBoost:0,parryBonus:0,serial:0};
 if(r.kind==='cards'){const st={deck:[],hand:[],discard:[],sleeve:null,augen:0,chain:{suit:null,n:0},bubes:0,forget:0,noAugen:false,readHand:0,readHandTarget:null,tick:1};shuffleInto(g,st,fullDeck(r));draw(g,st);return st;}
 return {};
}
const S=g=>g.res||(g.res=freshResource(g));
/** Neustart (Wiederbeleben, Quelle): Wut und Augen weg, Likes/Kasten voll, Glut auf Ruhewert. */
export function resetResource(g,mode='start'){const r=R(g),p=g.player;if(!r)return;g.res=freshResource(g);if(mode==='full'&&(r.kind==='trend'||r.kind==='rage'))p.energy=r.kind==='trend'?r.max:p.energy;}

// ---------------------------------------------------------------------------------------------------------------
// Gutschriften aus klassenfremden Quellen (Proc `energy`, Verpflegung, Kill-Schwung, Parade, Bastelgrips je Sekunde)
export function grantResource(g,n,source=''){
 const r=R(g),p=g.player;if(!r||!(n>0))return 0;const st=S(g);
 if(r.kind==='rage'||r.kind==='trend'){const before=p.energy;p.energy=Math.min(r.max,p.energy+n*r.grantRate);return p.energy-before;}
 if(r.kind==='ammo'){st.frac+=n*r.grantRate;let got=0;while(st.frac>=1){st.frac-=1;if(st.bottles<crateMax(g)){st.bottles++;got++;}}return got;}
 if(r.kind==='grill'){const add=n*r.grantRate;st.glut=Math.min(95,st.glut+add);return add;}
 if(r.kind==='cards'){const add=Math.round(n*r.grantRate);if(add>0)addAugen(g,st,add);return add;}
 return 0;
}
/** Voll? (Verpflegung, die Ressource gibt, wird dann abgelehnt.) */
export function resourceFull(g){const r=R(g),st=S(g),p=g.player;if(!r)return true;if(r.kind==='rage'||r.kind==='trend')return p.energy>=r.max;if(r.kind==='ammo')return st.bottles>=crateMax(g);return false;}

// ---------------------------------------------------------------------------------------------------------------
// Kosten
const crateMax=(g,cs=g.cs)=>R(g).max+num(cs||{},'crateSize');
export function resourceCost(g,s,cs,base){
 const r=R(g),st=S(g);if(!r)return base;
 if(r.kind==='rage')return s.id==='throw'?0:base;/* Dieters Wurf eröffnet den Streit: kostenlos, bringt Randale (resourceAfterSkill) */
 if(r.kind==='trend')return st.viral>0&&base>0?0:base;
 if(r.kind==='ammo'){if(s.id==='strike'&&st.bottles<=0)return 0;return base>0||r.costs[s.id]?(r.costs[s.id]||0):0;}
 if(r.kind==='grill')return r.spend[s.id]&&s.id!=='heal'?r.spend[s.id]:0;
 return 0;
}
/** Fehlermeldung, wenn die Ressource nicht reicht oder der Kniff gerade nicht geht – geprüft vor Abklingzeit und Kosten. */
export function resourceFailure(g,s,cs,cost){
 const r=R(g),st=S(g),p=g.player;if(!r)return p.energy<cost?'Nicht genug Randale.':null;const T=r.hud;
 if(r.kind==='rage')return p.energy<cost?'Nicht genug Randale – steck erst was ein.':null;
 if(r.kind==='trend')return p.energy<cost?'Nicht genug Likes – bring neuen Content.':null;
 if(r.kind==='ammo')return st.bottles<cost?'Kasten leer – Leergut einsammeln oder nachladen.':null;
 if(r.kind==='grill'){if(st.lock>0&&['strike','throw','ground','buff','spiritus'].includes(s.id))return T.locked+' · '+st.lock.toFixed(1).replace('.',',')+' s';if(st.glut<cost)return 'Zu wenig Glut – erst mit der Zange anheizen.';return null;}
 return null;
}
export function payResource(g,s,cs,cost){
 const r=R(g),st=S(g),p=g.player;if(!r){p.energy-=cost;return;}
 if(r.kind==='rage'){if(cost>0){p.energy-=cost;payTab(g,st,cost,cs);}return;}
 if(r.kind==='trend'){if(st.viral>0&&s.cost>0&&cost===0)st.viral--;p.energy-=cost;return;}
 if(r.kind==='ammo'){if(cost>0){st.bottles=Math.max(0,st.bottles-cost);st.reload=null;if(st.bons>0){st.bons--;st.bonNow=true;fireProcs(g,'bonUsed',cs);}}return;}
 if(r.kind==='grill'){if(cost>0)st.glut=Math.max(0,st.glut-cost);return;}
}
/** Nur Dieter: „In Fahrt“ ab 80 Randale (E-36) bleibt seine Schwelle. */
export function resourceSurge(g){const r=R(g);return r?.kind==='rage'&&g.player.energy>=r.surgeAt;}

// ---------------------------------------------------------------------------------------------------------------
// Dieter · Zeche
function payTab(g,st,randale,cs){if(!(st.tab>0))return;const paid=Math.min(st.tab,randale*(R(g).tab.payPerRandale+num(cs,'zechePay')));st.tab-=paid;st.paid=.6;emitCombatFx(g,'tab-pay',g.player,{amount:Math.round(paid)});fireProcs(g,'tabPaid',cs,{amount:paid});}
function selfDamage(g,n,label){const p=g.player;if(!(n>0)||g.dead)return;const before=p.hp;p.hp=Math.max(0,p.hp-n);if(p.hp<before)emitCombatFx(g,'hurt',p,{amount:before-p.hp,self:true});if(p.hp===0)g.die?.(label,'',false);}

// ---------------------------------------------------------------------------------------------------------------
// Treffer am Helden: Rückgabe = Schaden, der jetzt ankommt
export function resourceHit(g,n,e,cs,{noTab=false}={}){
 const r=R(g),st=S(g),p=g.player;if(!r||!(n>0))return n;
 if(r.kind==='rage'){
  const gain=r.hitGain*(n/p.maxHp*100)*(1+num(cs,'hitRage'));p.energy=Math.min(r.max,p.energy+gain);
  const cap=p.maxHp*(r.tab.cap+num(cs,'zecheCap')),room=noTab?0:Math.max(0,cap-st.tab),deferred=Math.min(room,n*(r.tab.share+num(cs,'zecheShare')));
  if(deferred>0){st.tab+=deferred;emitCombatFx(g,'tab-write',p,{amount:Math.round(deferred)});}
  return n-deferred;
 }
 if(r.kind==='trend'&&n>p.maxHp*r.trend.shitstorm){
  if(cs.shitstormGuard){addGuard(g,p.maxHp*.1,cs,true);}else if(st.trend>0){st.trend--;emitCombatFx(g,'shitstorm',p,{});note(g,r.hud.shitstorm,'#b58a5a');}
  fireProcs(g,'shitstorm',cs);
 }
 return n;
}
/** Schaden, den Gegner im Rauch des Räuchermeisters austeilen. */
export function resourceIncoming(g,e){const st=g.res;if(!st||resourceKind(g)!=='grill'||!e)return 1;const weak=g.fields.filter(z=>(z.kind==='rauch'||z.kind==='oven'||z.kind==='deckelzu')&&z.remaining>0&&distance(e,z)<=z.radius);return weak.length?1-Math.max(...weak.map(z=>z.weaken||0)):1;}

// ---------------------------------------------------------------------------------------------------------------
// Schadens- und Heilfaktor aus dem Zustand
export function resourceDamageFactor(g,label,e){
 const r=R(g),st=g.res;if(!r||!st)return 1;const cs=g.cs||{};
 if(r.kind==='trend')return 1+st.trend*(r.trend.bonusPerLevel+num(cs,'trendBonus'));
 if(r.kind==='grill')return 1+zoneOf(g,st.glut,cs).damage;
 if(r.kind==='ammo')return st.bonNow?1+R(g).bon.power+num(cs,'bonPower'):1;
 return 1;
}
export function resourceHealFactor(g){const r=R(g),st=g.res;if(!r||!st)return 1;if(r.kind==='trend')return 1+st.trend*(r.trend.bonusPerLevel+num(g.cs,'trendBonus'));return 1;}

// ---------------------------------------------------------------------------------------------------------------
// Takt
export function tickResource(g,dt,cs){
 const r=R(g),p=g.player;if(!r)return;const st=S(g);g.cs=cs;const inCombat=p.inCombat>0;
 const regen=num(cs,'energyRegen');if(regen>0&&inCombat)grantResource(g,regen*dt,'regen');
 if(r.kind==='rage'){
  st.paid=Math.max(0,st.paid-dt);
  if(st.tab>0){const pay=Math.min(st.tab,Math.max(st.tab*r.tab.payRate,2)*dt);st.tab-=pay;selfDamage(g,pay,'Zeche');}
  if(inCombat){st.calm=0;if(!st.fight){st.fight=true;p.energy=Math.min(r.max,p.energy+r.combatStart);note(g,'KAMPFESLUST +'+r.combatStart,'#e2563d');}}else{st.calm+=dt;if(st.calm>r.decay.delay){st.fight=false;p.energy=Math.max(0,p.energy-r.decay.perSecond*dt);}}
  return;
 }
 if(r.kind==='trend'){
  if(inCombat){if(!st.fight){st.fight=true;st.trend=Math.max(st.trend,Math.min(r.trend.max,num(cs,'trendStart')));}st.calm=0;st.idle+=dt;if(st.idle>=r.trend.decayAfter+num(cs,'trendDecay')){st.idle=0;if(st.trend>0){st.trend--;emitCombatFx(g,'trend-down',p,{trend:st.trend});}}}
  else{st.calm+=dt;p.energy=Math.min(r.max,p.energy+r.restRegen*dt);if(st.calm>5){st.trend=0;st.last=[];st.fight=false;st.viral=0;}}
  return;
 }
 if(r.kind==='ammo'){tickAmmo(g,st,r,dt,cs,inCombat);return;}
 if(r.kind==='grill'){tickGrill(g,st,r,dt,cs,inCombat);return;}
 if(r.kind==='cards'){tickCards(g,st,r,dt,cs,inCombat);return;}
}

// ---------------------------------------------------------------------------------------------------------------
// Kevin · Leergut
function tickAmmo(g,st,r,dt,cs,inCombat){
 const p=g.player,max=crateMax(g,cs);
 if(!inCombat&&!st.reload){st.refill+=dt;if(st.refill>=r.restRefill){st.refill=0;if(st.bottles<max)st.bottles++;}}else st.refill=0;
 if(st.reload){const rl=st.reload;rl.t+=dt;if(rl.t>=rl.total+rl.jam){st.bottles=Math.min(max,st.bottles+r.reload.fill+num(cs,'reloadFill'));st.reload=null;emitCombatFx(g,'reload',p,{bottles:st.bottles});}}
 const radius=r.pickupRadius+num(cs,'pickupRadius'),robbis=cs.robbiPickup?g.fields.filter(z=>z.kind==='robbi'&&z.remaining>0):[];
 for(const b of st.pickups){b.life-=dt;if(b.life<=0)continue;const byRobbi=robbis.some(z=>distance(z,b)<=z.radius);if(distance(p,b)<=radius||byRobbi){b.life=0;if(st.bottles<max)st.bottles++;emitCombatFx(g,'pickup',b,{to:{x:p.x,y:p.y},robbi:byRobbi&&distance(p,b)>radius});fireProcs(g,'pickup',cs);if(!g.sct?.({area:'in',kind:'momentum',text:r.hud.pickup,color:'#b9d98b'}))g.float?.(p.x,p.y-30,r.hud.pickup,'#b9d98b');}}
 st.pickups=st.pickups.filter(b=>b.life>0);
}
function dropBottles(g,st,at,count,cs){const r=R(g);for(let i=0;i<count;i++){const a=g.random()*Math.PI*2,d=r.drop.spread*(.5+g.random()*.8);let x=at.x+Math.cos(a)*d,y=at.y+Math.sin(a)*d*.75;if(g.world.blocked?.(x,y,2)){x=at.x;y=at.y;}const b={id:++st.serial,x,y,life:r.drop.life,max:r.drop.life};st.pickups.push(b);emitCombatFx(g,'bottle-drop',b,{from:{x:at.x,y:at.y}});}if(st.pickups.length>24)st.pickups.splice(0,st.pickups.length-24);}
function startReload(g,st,r,cs){const w=num(cs,'reloadZone')/2;st.reload={t:0,total:r.reload.channel,zone:[Math.max(.05,r.reload.zone[0]-w),Math.min(.98,r.reload.zone[1]+w)],jam:0,tried:false};emitCombatFx(g,'reload',g.player,{start:true});}
function reloadPress(g,st,r,cs){
 const rl=st.reload,f=rl.t/rl.total,p=g.player;if(rl.tried)return;rl.tried=true;
 if(f>=rl.zone[0]&&f<=rl.zone[1]){st.bottles=crateMax(g,cs);st.bons=Math.min(r.bon.max+num(cs,'bonMax'),st.bons+1);st.reload=null;emitCombatFx(g,'reload-perfect',p,{});note(g,r.hud.bon,'#f2d067','reload');fireProcs(g,'perfectReload',cs);}
 else{rl.jam=r.reload.jam;emitCombatFx(g,'reload-jam',p,{});note(g,r.hud.jam,'#e08a5a','reload');}
}

// ---------------------------------------------------------------------------------------------------------------
// Schorsch · Glut und Grillrost
export function zoneOf(g,glut,cs=g.cs||{}){const r=R(g),z=r.zones,lo=z[1].to+num(cs,'perfectLow'),hi=z[2].to+num(cs,'perfectHigh');if(glut<z[0].to)return z[0];if(glut<lo)return z[1];if(glut<hi)return z[2];return z[3];}
function addGlut(g,st,n,cs){const r=R(g),before=st.glut;const wasHot=zoneOf(g,before,cs).id==='heiss';st.glut=clamp(st.glut+n,0,st.cool>0?r.max-1:r.max);/* nach einer Stichflamme erholt sich der Grill: 8 s keine zweite */const was=zoneOf(g,before,cs).id,now=zoneOf(g,st.glut,cs).id;if(now==='perfekt'&&was!=='perfekt'&&st.perfectCd<=0){st.perfectCd=3;fireProcs(g,'glutPerfect',cs);emitCombatFx(g,'glut',g.player,{zone:now});}
 if(now==='heiss'&&!wasHot&&st.glut<r.max){emitCombatFx(g,'glut',g.player,{zone:'heiss'});note(g,r.hud.hot,'#ff6a3a','heal');}if(st.glut>=r.max)overheat(g,st,cs);}
function overheat(g,st,cs){
 const r=R(g),o=r.overheat,p=g.player,m=mech(g),flamme=!!m?.flamme,factor=(1+num(cs,'overheatDamage'))*(flamme?m.flamme.overheatFactor:1),dmg=Math.round(o.damage*(cs.flatScale||1)*factor);
 for(const e of foes(g,p,o.radius))g.damage(e,dmg,'Stichflamme');
 if(!cs.overheatSafe&&!flamme)selfDamage(g,Math.round(p.maxHp*o.self),'Stichflamme');
 st.glut=o.dropTo;st.cool=o.cooldown;st.lock=Math.max(0,o.lock+num(cs,'overheatLock'));for(const it of st.rost)it.done+=o.cook;
 emitCombatFx(g,'overheat',p,{radius:o.radius});g.emit?.('shake',{strength:5});note(g,r.hud.overheat,'#ff7a3a');fireProcs(g,'overheat',cs);
}
function cookStep(g,st,dt,cs){const r=R(g),z=zoneOf(g,st.glut,cs),m=mech(g),smoke=!!m?.rauch&&st.glut<m.rauch.below;let rate=dt/r.rost.cookTime*z.cook*(1+num(cs,'cookSpeed'))*(st.cookBoost>0?1.5:1);if(smoke)rate*=m.rauch.cook;for(const it of st.rost){it.done+=rate;if(smoke&&it.done<.6)it.smoked=true;}}
function tickGrill(g,st,r,dt,cs,inCombat){
 const p=g.player;st.cool=Math.max(0,(st.cool||0)-dt);st.lock=Math.max(0,st.lock-dt);st.perfectCd=Math.max(0,st.perfectCd-dt);st.noDecay=Math.max(0,st.noDecay-dt);st.cookBoost=Math.max(0,st.cookBoost-dt);st.parryBonus=Math.max(0,st.parryBonus-dt);
 if(inCombat){if(st.noDecay<=0)st.glut=Math.max(0,st.glut-(r.decay+num(cs,'glutDecay'))*dt);}
 else{const d=r.rest-st.glut;st.glut+=Math.sign(d)*Math.min(Math.abs(d),r.decay*dt);}
 const z=zoneOf(g,st.glut,cs);if(inCombat&&z.burn)selfDamage(g,p.maxHp*z.burn*dt,'Hitze');
 cookStep(g,st,dt,cs);
 const charcoal=r.rost.charcoal+num(cs,'burntGrace');for(const it of st.rost)if(it.done>=charcoal){it.gone=true;emitCombatFx(g,'serve',p,{item:it.item,charcoal:true});}st.rost=st.rost.filter(it=>!it.gone);
 for(const e of g.enemies){if(!(e.burn?.t>0))continue;e.burn.t-=dt;e.burn.tick-=dt;if(e.burn.tick<=0&&e.hp>0){e.burn.tick=1;g.damage(e,e.burn.dps,'Glutbrand');}}
 for(const z of g.fields){if(!['rauch','oven','deckelzu'].includes(z.kind)||z.remaining<=0)continue;z.pulse=(z.pulse||0)-dt;if(z.pulse>0)continue;z.pulse=1;for(const e of foes(g,z,z.radius)){if(z.taunt){addThreat(e,'player',400);e.aggro=true;e.ai='combat';}if(z.damage)g.damage(e,z.damage,'Rauch');}}
}
function planOf(g,cs){const r=R(g),m=mech(g),base=[...(m?.chef?.plan||m?.rauch?.plan||m?.flamme?.plan||r.plan)];for(const [k,item] of [['planWurst','wurst'],['planBraten','braten'],['planMais','mais'],['planKaese','kaese']])if(cs[k])base.push(item);return base;}
const rostSlots=(g,cs)=>R(g).rost.slots+num(cs,'rostSlots');
/** Was „Auflegen“ als Nächstes auf den Rost legt (Anzeige am Knopf, E-72 Runde 3). */
const nextItem=(g,st,cs)=>{const plan=planOf(g,cs);return plan.length?plan[(st.plan||0)%plan.length]:null;};
function ripest(g,st,cs){const r=R(g),charcoal=r.rost.charcoal+num(cs,'burntGrace');return st.rost.filter(it=>it.done<charcoal).sort((a,b)=>b.done-a.done)[0]||null;}
function doneness(g,it,cs){const r=R(g),garHi=r.rost.gar[1]+num(cs,'garWindow'),burnt=r.rost.burnt+num(cs,'burntGrace');if(it.done<r.rost.gar[0])return {state:'roh',factor:r.burntFactor};if(it.done<=garHi)return {state:'gar',factor:1,perfect:true};if(it.done<burnt)return {state:'durch',factor:1};return {state:'verkohlt',factor:r.burntFactor};}
export function rostState(g){const st=g.res,r=R(g);if(!st||r?.kind!=='grill')return [];const cs=g.cs||{};return st.rost.map(it=>({item:it.item,name:r.items[it.item].name,done:it.done,state:doneness(g,it,cs).state,smoked:!!it.smoked}));}

function serve(g,st,cs,e,context){
 const r=R(g),p=g.player,m=mech(g),it=ripest(g,st,cs);if(!it)return;st.rost.splice(st.rost.indexOf(it),1);
 const def=r.items[it.item],d=doneness(g,it,cs),flambe=!!m?.flamme&&st.glut>=m.flamme.at,fl=(flambe?1+m.flamme.bonus:1)*(context.pm||1);
 const target=['braten','mais'].includes(it.item)?e:null;
 if(it.item==='wurst'){
  const chef=!!m?.chef,amount=p.maxHp*def.value*d.factor*(1+num(cs,'wurstHeal'))*(chef?1+m.chef.wurstBonus:1)*fl;
  const help=helpTarget(g),mate=help.kind==='companion'?help.ref:null;
  if(mate)healCompanionByPlayer(g,mate,Math.round(amount),'Bratwurst');else healPlayer(g,amount,cs,true,'heal',true);
  if(d.perfect){g.classState.hot=Math.max(g.classState.hot||0,def.perfect.hot);g.classState.hotPower=Math.max(g.classState.hotPower||0,Math.round(p.maxHp*.02));}
  if(chef&&m.chef.wurstChain){const second=(g.companions||[]).filter(c=>c!==mate&&c.hp>0&&c.hp<c.maxHp&&distance(c,p)<220).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(second)healCompanionByPlayer(g,second,Math.round(amount*.5),'Bratwurst');else if(mate)healPlayer(g,amount*.5,cs,false,'heal',true);}
 }
 if(it.item==='braten'&&target){const n=skillDamage(g,{damageModel:SKILL_DAMAGE.schorsch.burst,weaponSource:'melee'},0,ITEMS)*d.factor*(d.perfect?def.perfect.factor:1)*(1+num(cs,'bratenDamage'))*fl;g.damage(target,Math.round(n),'Servieren');cleave(g,target,n,cs,flambe);}
 if(it.item==='mais'&&target){const n=skillDamage(g,{damageModel:SKILL_DAMAGE.schorsch.burst,weaponSource:'melee'},0,ITEMS)*def.value*d.factor*(1+num(cs,'bratenDamage')*0)*fl,radius=def.radius+num(cs,'maisRadius');for(const o of foes(g,target,radius)){g.damage(o,Math.round(n),'Popcorn');if(d.perfect&&o.hp>0){const dd=distance(target,o)||1;for(let i=0;i<6;i++)g.move(o,(o.x-target.x)/dd*def.perfect.knockback/6,(o.y-target.y)/dd*def.perfect.knockback/6);}}}
 if(it.item==='kaese'){addGuard(g,p.maxHp*def.value*d.factor*(1+num(cs,'kaeseShield'))*fl*(d.perfect?1.3:1),cs,true);if(d.perfect)st.parryBonus=8;}
 if(it.smoked||cs.smokeTaunt){const at=target||p,sm=m?.rauch?.smoke||{radius:80,duration:6,weaken:.25};g.fields.push({x:at.x,y:at.y,kind:'rauch',radius:sm.radius,remaining:sm.duration,weaken:sm.weaken,taunt:true,tick:1,pulse:0});}
 emitCombatFx(g,'serve',target||p,{item:it.item,state:d.state,from:{x:p.x,y:p.y},flambe,smoked:!!it.smoked});
 if(d.perfect)note(g,def.name.toUpperCase()+' · '+r.hud.gar,'#f2c14e','burst');else if(d.state==='verkohlt')note(g,r.hud.burnt,'#8a7a6a','burst');
 fireProcs(g,'serve',cs,{item:it.item});if(d.perfect)fireProcs(g,'perfectServe',cs,{item:it.item});fireProcs(g,'burst',cs,{damage:0});
}
function cleave(g,target,n,cs,flambe){const m=mech(g),c=R(g).cleave;const extra=[];if(cs.serveCleave)extra.push(...foes(g,target,c.radius,target).slice(0,c.targets).map(o=>[o,c.share]));if(flambe)extra.push(...foes(g,target,m.flamme.splash.radius,target).map(o=>[o,m.flamme.splash.share]));const seen=new Set();for(const [o,share] of extra){if(seen.has(o))continue;seen.add(o);g.damage(o,Math.round(n*share),flambe?'Flambiert':'Servieren');}}

// ---------------------------------------------------------------------------------------------------------------
// Käthe · Blatt und Augen
const SUITS=['kreuz','pik','herz','karo'],RANKS=['7','8','9','10','B','D','K','A'];
function fullDeck(){const d=[];for(const suit of SUITS)for(const rank of RANKS)d.push({suit,rank});return d;}
function shuffleInto(g,st,cards){const d=[...cards];for(let i=d.length-1;i>0;i--){const j=Math.floor(g.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}st.deck.push(...d);}
const handSize=(g,cs=g.cs||{})=>Math.min(5,['strike','mark','burst'].filter(id=>available(g,id)).length+num(cs,'handSize'));
function drawOne(g,st,cs){if(!st.deck.length){if(!st.discard.length)return null;shuffleInto(g,st,st.discard);st.discard=[];emitCombatFx(g,'shuffle',g.player,{});fireProcs(g,'shuffle',cs||g.cs||{});}return st.deck.shift()||null;}
function draw(g,st,cs){const want=handSize(g,cs);while(st.hand.length<want){const c=drawOne(g,st,cs);if(!c)break;st.hand.push(c);}}
function addAugen(g,st,n){const r=R(g),cs=g.cs||{},win=r.win+num(cs,'augenWin'),before=st.augen;st.augen=Math.min(r.max,st.augen+n);for(const [at,text] of [[win,r.hud.won],[r.schneider,r.hud.schneider],[r.schwarz,r.hud.schwarz]])if(before<at&&st.augen>=at){note(g,text,'#e8d27a','throw');emitCombatFx(g,'augen',g.player,{at,text});}}
export const cardName=c=>c?RESOURCES.kaethe.suits[c.suit].name+'-'+RESOURCES.kaethe.ranks[c.rank].name:'';
const beats=(mine,theirs)=>{const ranks=RESOURCES.kaethe.ranks;if(ranks[mine.rank].trump)return !ranks[theirs.rank].trump||ranks[mine.rank].order>ranks[theirs.rank].order;return mine.suit===theirs.suit&&!ranks[theirs.rank].trump&&ranks[mine.rank].order>ranks[theirs.rank].order;};
/** Gegner beginnt einen Zauber: Käthe sieht dazu eine Karte (feste Farbe je Zauberart, gewürfelter Rang ohne Buben). */
export function resourceEnemyCast(g,e){if(resourceKind(g)!=='cards'||!e?.cast)return;const type=String(e.cast.type||e.cast.name||''),h=[...type].reduce((a,c)=>a+c.charCodeAt(0),0),suit=SUITS[h%4],pool=['7','8','9','D','K','10','A'];e.cast.card={suit,rank:pool[Math.floor(g.random()*pool.length)]};}
function tryStich(g,st,card,cs,viaKontra=false){
 const e=g.target,r=R(g);if(!live(g,e)||!e.cast?.card)return false;if(!viaKontra&&!beats(card,e.cast.card))return false;
 const interrupt=e.cast.interruptible,any=cs.stichAny;if(!interrupt&&!any&&!viaKontra)return false;
 const theirs=e.cast.card,augen=r.ranks[theirs.rank].augen+r.stich.bonus+num(cs,'stichAugen');
 if(interrupt&&!viaKontra){e.cast=null;e.stun=Math.max(e.stun||0,2);e.attackTimer=3;e.vulnerable=4;g.stats.interrupts++;fireProcs(g,'interrupt',cs);}
 addAugen(g,st,augen);if(cs.stichHeal)healPlayer(g,g.player.maxHp*cs.stichHeal,cs,false,'stich',true);
 const m=mech(g);if(m?.falsch){addThreat(e,'player',600);e.aggro=true;e.ai='combat';}
 emitCombatFx(g,'stich',e,{card,theirs});note(g,r.hud.stich+' +'+augen,'#f4e3a0','strike');fireProcs(g,'stich',cs);return true;
}
function cardPower(g,st,card,cs){const r=R(g),rk=r.ranks[card.rank],m=mech(g);let p=rk.power*(1+num(cs,card.suit+'Power'));if(rk.trump)p*=1+num(cs,'bubePower');if(rk.quick)p*=1+num(cs,'luschenPower');if(card.suit==='herz'&&m?.herz)p*=1+m.herz.bonus;if(card.suit==='pik'&&m?.falsch)p*=1+m.falsch.pikBonus;return p*(1+st.chain.n*(r.follow.bonus+num(cs,'followBonus')));}
/** Wirkung einer Karte am Ziel (Einzelkarte) oder im Kreis (Kartenregen, share < 1). */
function cardEffect(g,st,card,cs,{target=null,point=null,share=1}={}){
 const r=R(g),p=g.player,power=cardPower(g,st,card,cs)*share*(st.pmNow||1),rk=r.ranks[card.rank],ef=r.effects;
 if(card.suit==='kreuz'){const list=point?foes(g,point,70):target?[target]:[];for(const e of list)g.damage(e,Math.round(skillDamage(g,{damageModel:ef.damage,weaponSource:'ranged'},0,ITEMS)*power),'Kreuz');}
 if(card.suit==='karo'){const at=point||target;if(at)for(const e of foes(g,at,ef.control.radius)){g.damage(e,Math.round(skillDamage(g,{damageModel:{flat:ef.control.flat,weapon:ef.control.weapon},weaponSource:'ranged'},0,ITEMS)*power),'Karo');e.controlSlow=Math.max(e.controlSlow||0,ef.control.duration);if(['10','A'].includes(card.rank))e.stun=Math.max(e.stun||0,ef.control.stun+num(cs,'karoStun'));}}
 if(card.suit==='herz'){const amount=p.maxHp*ef.heal*power,help=point?{kind:'self'}:helpTarget(g),mate=help.kind==='companion'?help.ref:null;if(mate)healCompanionByPlayer(g,mate,Math.round(amount),'Herz');else healPlayer(g,amount,cs,false,'heal',true);
  if(cs.herzChain||mech(g)?.herz?.chain){const other=(g.companions||[]).filter(c=>c!==mate&&c.hp>0&&c.hp<c.maxHp&&distance(c,p)<240).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(other)healCompanionByPlayer(g,other,Math.round(amount*.5),'Herz');else if(mate)healPlayer(g,amount*.5,cs,false,'heal',true);}
  if(st.readHand>0)st.readHand+=r.handlesen.extend;}
 if(card.suit==='pik'){const amount=p.maxHp*ef.shield*power;addGuard(g,amount,cs,true);if(cs.pikTaunt)for(const e of foes(g,p,80)){addThreat(e,'player',300);e.aggro=true;e.ai='combat';}if(cs.pikReflect)st.pikReflect={share:cs.pikReflect,until:g.time+6};}
 return rk;
}
function playCard(g,st,index,cs,context){
 const r=R(g),card=index==='sleeve'?st.sleeve:st.hand[index];if(!card)return false;
 /* Kenner-Befund: die Hand rückt nicht nach – die neue Karte landet auf dem Platz der gespielten (feste Tasten). */
 if(index==='sleeve')st.sleeve=null;else{const next=drawOne(g,st,cs);if(next)st.hand[index]=next;else st.hand.splice(index,1);}
 const rk=r.ranks[card.rank],e=['kreuz','karo'].includes(card.suit)?g.target:null;
 const follow=st.chain.suit&&(card.suit===st.chain.suit||rk.trump);st.chain=follow?{suit:st.chain.suit,n:Math.min(r.follow.max+num(cs,'followMax'),st.chain.n+1)}:{suit:card.suit,n:0};
 tryStich(g,st,card,cs);
 st.pmNow=context.pm||1;cardEffect(g,st,card,cs,{target:e});st.pmNow=1;
 if(!st.noAugen)addAugen(g,st,r.augenPerCard+rk.augen+num(cs,'augenGain'));st.noAugen=false;
 if(rk.trump){st.bubes++;fireProcs(g,'bubePlayed',cs);}
 if(follow)fireProcs(g,'follow',cs,{suit:card.suit});
 fireProcs(g,'cardPlayed',cs,{suit:card.suit});
 st.discard.push(card);draw(g,st,cs);
 emitCombatFx(g,'card-throw',e||g.player,{card,from:{x:g.player.x,y:g.player.y},chain:st.chain.n,self:!e});
 if(e){g.autoAttack.enabled=true;e.aggro=true;e.ai='combat';g.player.inCombat=7;}
 return true;
}
function abrechnen(g,st,cs,e,context={}){
 const r=R(g),a=r.abrechnen,p=g.player,m=mech(g),grand=!!m?.grand&&st.bubes>=m.grand.bubes;
 let mult=(context.pm||1)*(1+num(cs,'abrechnenPower'))*(st.augen>=r.schwarz?a.schwarz:st.augen>=r.schneider?a.schneider:1)*(grand?m.grand.factor:1);
 const n=skillDamage(g,{damageModel:{flat:st.augen*a.perAuge,weapon:st.augen*a.perAugeWeapon},weaponSource:'ranged'},0,ITEMS)*mult;
 const list=st.augen>=r.schwarz||grand?[e,...foes(g,e,grand?m.grand.radius:a.radius,e)]:[e];
 for(const o of list)g.damage(o,Math.round(o===e?n:n*.6),'Abrechnen');
 emitCombatFx(g,'abrechnen',e,{augen:st.augen,grand,schwarz:st.augen>=r.schwarz,cards:Math.min(12,st.discard.length+st.hand.length)});g.emit?.('shake',{strength:grand?6:4});
 if(grand)note(g,r.hud.grand,'#ffd25a','throw');
 st.augen=0;st.bubes=0;st.chain={suit:null,n:0};fireProcs(g,'gameWon',cs);
}
function tickCards(g,st,r,dt,cs,inCombat){
 draw(g,st,cs);
 if(inCombat)st.forget=0;else{st.forget+=dt;if(st.forget>r.forget&&st.augen>0){st.augen=0;st.bubes=0;st.chain={suit:null,n:0};}}
 if(st.readHand>0){st.readHand=Math.max(0,st.readHand-dt);st.tick-=dt;if(st.tick<=0){st.tick=1;const t=st.readHandTarget,amount=Math.round(g.player.maxHp*r.handlesen.perSecond);if(t?.hp>0&&t!==g.player)healCompanionByPlayer(g,t,amount,'Handlesen');else healPlayer(g,amount,cs,false,'hot',true);}}
}
/** Käthe: Karte auf einem Leistenplatz (1–3) – für Leiste, Tooltip und Anzeige. */
export function handCard(g,id){const st=g.res;if(resourceKind(g)!=='cards'||!st)return null;const i={strike:0,mark:1,burst:2}[id];return i===undefined?null:st.hand[i]||null;}

// ---------------------------------------------------------------------------------------------------------------
// Vorprüfung (vor Kosten und Abklingzeit): Ziel, Rost, Augen
export function resourcePrecheck(g,id,s,cs){
 const r=R(g),st=S(g);if(!r)return null;const p=g.player;
 if(r.kind==='ammo'&&id==='strike'&&st.bottles<=0){const e=g.target;if(!live(g,e))return 'Kein Ziel.';if(distance(p,e)>r.empty.range+(cs.range||0))return 'Kasten leer – für den Pömpel ran ans Ziel, Leergut einsammeln oder nachladen.';}
 if(r.kind==='grill'){
  if(id==='mark'&&st.rost.length>=rostSlots(g,cs))return r.hud.full+'.';
  if(id==='burst'){const it=ripest(g,st,cs);if(!it)return r.hud.empty+' – erst auflegen.';if(['braten','mais'].includes(it.item)&&!validTarget(g,175+(cs.range||0)))return 'Kein Ziel für '+r.items[it.item].name+' in Reichweite.';}
 }
 if(r.kind==='cards'){
  const i={strike:0,mark:1,burst:2}[id];
  if(i!==undefined){const c=st.hand[i];if(!c)return 'Keine Karte auf diesem Platz.';if(['kreuz','karo'].includes(c.suit)&&!validTarget(g,200+(cs.range||0)))return live(g,g.target)?'Zu weit für '+cardName(c)+' · '+Math.ceil(distance(p,g.target)/8)+' m (höchstens '+Math.round((200+(cs.range||0))/8)+' m).':'Kein Ziel für '+cardName(c)+'.';}
  if(id==='throw'){const win=r.win+num(cs,'augenWin');if(st.augen<win)return 'Abrechnen erst ab '+win+' Augen – noch '+(win-st.augen)+'.';if(!validTarget(g,200+(cs.range||0)))return 'Kein Ziel zum Abrechnen.';}
  if(id==='aermel'&&!st.sleeve&&!st.hand.length)return 'Keine Karte auf der Hand.';
  if(id==='aermel'&&st.sleeve&&['kreuz','karo'].includes(st.sleeve.suit)&&!validTarget(g,200+(cs.range||0)))return 'Kein Ziel für '+cardName(st.sleeve)+'.';
 }
 return null;
}
/** Diese Klasse wirkt ihre Heiltaste auch bei vollem Leben (Schorschs Ablöschen). */
export const resourceHealAlways=(g,id)=>id==='heal'&&resourceKind(g)==='grill';
/** Sieben, Acht, Neun gehen schneller (kurzer GCD) oder ganz ohne (Talent luschenGcd). */
export function resourceQuickGcd(g,id){const c=handCard(g,id);return !!c&&!!RESOURCES.kaethe.ranks[c.rank].quick;}
export function resourceOffGcd(g,id){return id==='mark'&&resourceKind(g)==='grill';/* Auflegen ist ein Handgriff */}
/** Eigene Länge der globalen Abklingzeit: Luschen mit „Flinke Finger“ (luschenGcd) sperren nur kurz. */
export function resourceGcd(g,id,cs){const c=handCard(g,id);return c&&RESOURCES.kaethe.ranks[c.rank].quick&&cs?.luschenGcd?RESOURCES.kaethe.luschenGcd:null;}
export function resourceParryBonus(g){return resourceKind(g)==='grill'&&g.res?.parryBonus>0?.3:0;}

// ---------------------------------------------------------------------------------------------------------------
// Kniffe, die das Modell selbst ausführt. Rückgabe true = der allgemeine Zweig der Engine entfällt.
export function performClassSkill(g,id,s,e,point,cs,context){
 const r=R(g),st=S(g),p=g.player;if(!r)return false;
 if(r.kind==='rage'&&id==='zeche'){
  const tab=st.tab,dmg=Math.round(tab*(r.prellen.share+num(cs,'prellenPower'))*(p.energy>=r.surgeAt?1+r.prellen.surgeBonus:1));st.tab=0;
  for(const o of foes(g,p,r.prellen.radius))g.damage(o,dmg,'Zeche prellen');
  emitCombatFx(g,'prellen',p,{amount:dmg,radius:r.prellen.radius});g.emit?.('shake',{strength:tab>p.maxHp*.2?5:3});note(g,r.hud.prellen+' · '+dmg,'#f2c14e','zeche');fireProcs(g,'prellen',cs,{damage:dmg});return true;
 }
 if(r.kind==='ammo'){
  if(id==='reload'){if(st.reload)reloadPress(g,st,r,cs);else if(st.bottles<crateMax(g,cs))startReload(g,st,r,cs);else note(g,r.hud.full,'#b9d98b','reload');return true;}
  if(id==='strike'&&st.bottles<=0&&e){context.pompel=true;const n=skillDamage(g,{damageModel:SKILL_DAMAGE.kevin.strike,weaponSource:'melee'},0,ITEMS)*r.empty.share;g.damage(e,Math.round(n),'Pömpel');p.attack=.25;p.attackSource='melee';emitCombatFx(g,'attack',e,{from:{x:p.x,y:p.y},skillId:'strike'});return true;}
  return false;
 }
 if(r.kind==='grill'){
  if(id==='mark'){const plan=planOf(g,cs),item=plan[st.plan%plan.length];st.plan++;st.rost.push({item,done:0,smoked:false});emitCombatFx(g,'serve',p,{item,lay:true});return true;}
  if(id==='burst'){serve(g,st,cs,validTarget(g,175+(cs.range||0)),context);return true;}
  if(id==='heal'){const v=r.vent;addGlut(g,st,-r.spend.heal,cs);healPlayer(g,p.maxHp*(v.heal+num(cs,'ventHeal')),cs,true,'heal',true);const steam=v.steam,n=skillDamage(g,{damageModel:SKILL_DAMAGE.schorsch.strike,weaponSource:'melee'},0,ITEMS)*steam.damage*(1+num(cs,'ventSteam'));for(const o of foes(g,p,steam.radius)){g.damage(o,Math.round(n),'Dampf');o.controlSlow=Math.max(o.controlSlow||0,steam.duration);}emitCombatFx(g,'steam',p,{radius:steam.radius});fireProcs(g,'vent',cs);fireProcs(g,'heal',cs);return true;}
  if(id==='buff'){st.noDecay=s.duration||6;addGlut(g,st,s.glut||r.gain.buff,cs);emitCombatFx(g,'glut',p,{bellows:true});return true;}
  if(id==='throw'&&e){const z=zoneOf(g,st.glut+s.cost,cs);g.damage(e,Math.round(skillDamage(g,s,s.damage,ITEMS)),'Glutbrocken');e.burn={t:r.ember.duration,tick:1,dps:Math.round(r.ember.dot*(cs.flatScale||1)*(1+num(cs,'emberDot'))*(1+z.damage))};emitCombatFx(g,'ember',e,{from:{x:p.x,y:p.y}});return true;}
  if(id==='ground'&&point){
   const m=mech(g),z=zoneOf(g,st.glut+(s.cost||0),cs);for(const it of st.rost)it.done+=r.swing.cook+num(cs,'swingCook');
   if(m?.chef){const b=m.chef.buffet;g.fields.push({x:point.x,y:point.y,kind:'buffet',radius:b.radius,remaining:b.duration,tick:1,power:Math.round(b.heal*(cs.flatScale||1))});}
   else if(m?.rauch){const o=m.rauch.oven;g.fields.push({x:point.x,y:point.y,kind:'oven',radius:o.radius,remaining:o.duration,weaken:m.rauch.smoke.weaken,taunt:true,damage:Math.round(o.damage*(cs.flatScale||1)),tick:1,pulse:0});}
   else{const n=skillDamage(g,{damageModel:{flat:125},weaponSource:'melee'},0,ITEMS)*(1+z.damage);for(const o of foes(g,point,s.radius))g.damage(o,Math.round(n),'Schwenkgrill');}
   emitCombatFx(g,'grill-swing',point,{from:{x:p.x,y:p.y},radius:s.radius,kind:m?.chef?'buffet':m?.rauch?'oven':'swing'});return true;
  }
  if(id==='senf'){const help=helpTarget(g),mate=help.kind==='companion'?help.ref:null,amount=p.maxHp*.1;if(mate)healCompanionByPlayer(g,mate,Math.round(amount),'Senf');else healPlayer(g,amount,cs,true,'heal',true);st.cookBoost=s.duration||8;emitCombatFx(g,'heal',mate||p,{amount:Math.round(amount),direct:true});return true;}
  if(id==='spiritus'){addGlut(g,st,30,cs);const face=p.facing||1,n=skillDamage(g,{damageModel:{flat:70,weapon:2},weaponSource:'melee'},0,ITEMS)*(1+zoneOf(g,st.glut,cs).damage);for(const o of foes(g,p,s.radius||95))if((o.x-p.x)*face>-8)g.damage(o,Math.round(n),'Spiritus');emitCombatFx(g,'overheat',p,{radius:s.radius||95,cone:face});return true;}
  if(id==='deckelzu'){g.fields.push({x:p.x,y:p.y,kind:'deckelzu',radius:s.radius||100,remaining:s.duration||6,weaken:.25,taunt:true,tick:1,pulse:0});for(const o of foes(g,p,s.radius||100)){addThreat(o,'player',800);o.aggro=true;o.ai='combat';}emitCombatFx(g,'steam',p,{radius:s.radius||100,smoke:true});return true;}
  return false;
 }
 if(r.kind==='cards'){
  const i={strike:0,mark:1,burst:2}[id];
  if(i!==undefined)return playCard(g,st,i,cs,context);
  if(id==='aermel'){if(st.sleeve)return playCard(g,st,'sleeve',cs,context);st.sleeve=st.hand.shift();draw(g,st,cs);emitCombatFx(g,'shuffle',p,{sleeve:true});return true;}
  if(id==='throw'&&e){abrechnen(g,st,cs,e,context);return true;}
  if(id==='buff'){st.discard.push(...st.hand);st.hand=[];draw(g,st,cs);if(!st.hand.some(c=>c.rank==='B')){const from=[st.deck,st.discard].find(list=>list.some(c=>c.rank==='B'));if(from){const k=from.findIndex(c=>c.rank==='B'),bube=from.splice(k,1)[0];if(st.hand.length)st.discard.push(st.hand.pop());st.hand.push(bube);}}emitCombatFx(g,'shuffle',p,{redeal:true});fireProcs(g,'shuffle',cs);return true;}
  if(id==='ground'&&point){
   const m=mech(g),cards=[...st.hand];st.hand=[];
   for(const c of cards){cardEffect(g,st,c,cs,{point,share:.6});addAugen(g,st,r.augenPerCard+r.ranks[c.rank].augen+num(cs,'augenGain'));if(r.ranks[c.rank].trump)st.bubes++;fireProcs(g,'cardPlayed',cs,{suit:c.suit});st.discard.push(c);}
   if(m?.herz){const c=m.herz.circle;g.fields.push({x:point.x,y:point.y,kind:'legekreis',radius:c.radius,remaining:c.duration,tick:1,power:Math.round(c.heal*(cs.flatScale||1))});}
   draw(g,st,cs);emitCombatFx(g,'card-burst',point,{cards,radius:s.radius||70});return true;
  }
  if(id==='reizen'){addAugen(g,st,25);st.noAugen=true;note(g,'Achtzehn, zwanzig, zwo …','#e8d27a','reizen');return true;}
  if(id==='handlesen'){const help=helpTarget(g);st.readHand=s.duration||10;st.readHandTarget=help.kind==='companion'?help.ref:g.player;st.tick=1;emitCombatFx(g,'heal',help.kind==='companion'?help.ref:p,{amount:0,direct:false});return true;}
  if(id==='gezinkt'){const first=st.hand[0];if(first)for(const c of st.hand)if(c.rank!=='B')c.suit=first.suit;emitCombatFx(g,'shuffle',p,{marked:true});return true;}
  return false;
 }
 return false;
}
/** Nach dem allgemeinen Zweig: Leergut fällt, Grillzange und Parade heizen, Kontra sticht. */
export function resourceAfterSkill(g,id,e,point,cs,context){
 const r=R(g),st=S(g);if(!r)return;
 if(r.kind==='ammo'){
  const drop=r.drop,chance=x=>g.random()<Math.min(1,x+num(cs,'dropChance'));
  if((id==='strike'&&!context.pompel||id==='throw')&&e&&chance(drop[id]))dropBottles(g,st,e,1,cs);
  if(id==='burst'&&e)dropBottles(g,st,e,Math.min(drop.burst,Math.round(drop.burst*(1+num(cs,'dropChance')))),cs);
  if(id==='ground'&&point&&chance(drop.ground/3))dropBottles(g,st,point,1,cs);
  st.bonNow=false;
 }
 if(r.kind==='rage'&&id==='throw'&&e)grantResource(g,r.throwGain,'throw');
 if(r.kind==='grill'&&id==='strike')addGlut(g,S(g),r.gain.strike+num(cs,'glutStrike'),cs);
 if(r.kind==='cards'&&id==='interrupt'&&context.interrupted&&context.castCard){const held=st.hand.find(c=>c.suit===context.castCard.suit||r.ranks[c.rank].trump);if(held){const e2=g.target;g.target=context.castEnemy||e2;tryStich(g,st,held,cs,true);g.target=e2;}}
}
/** Geglückte Parade: klassengerechte Gutschrift statt der alten 20 Randale. */
export function resourceParry(g,e,cs){const r=R(g);if(!r)return;if(r.kind==='grill'){addGlut(g,S(g),r.gain.parry+num(cs,'glutParry'),cs);return;}if(r.kind==='cards')return;grantResource(g,20,'parry');}
/** Kill: Kevins Leergut. */
export function resourceKill(g,e,cs){const r=R(g);if(r?.kind!=='ammo')return;const n=r.drop.kill+num(cs,'killBottles');if(n>0)dropBottles(g,S(g),e,n,cs);}
/** Jeder erfolgreiche Kniff (außer Autoangriff): Annis Trend und Likes. */
export function resourceCast(g,id,s,cs,context={}){
 const r=R(g),st=S(g),p=g.player;if(r?.kind!=='trend'||id==='auto')return;
 const beatForgive=id==='strike'&&(context.beat||cs.repeatForgive);st.idle=0;
 if(st.last[0]===id&&!beatForgive){if(st.trend>0){st.trend--;emitCombatFx(g,'trend-down',p,{trend:st.trend});note(g,r.hud.down,'#b8a4a0',id);}}
 else if(!st.last.includes(id)){const before=st.trend;st.trend=Math.min(r.trend.max,st.trend+1);if(st.trend>before){emitCombatFx(g,'trend-up',p,{trend:st.trend});fireProcs(g,'trendUp',cs);if(st.trend===r.trend.max){st.viral+=r.trend.viralFree+num(cs,'viralFree');emitCombatFx(g,'viral',p,{});note(g,r.hud.viral,'#ff7ab0',id);fireProcs(g,'viral',cs);}}}
 const likes=r.trend.likes[st.trend]+num(cs,'likesPerCast')+(context.beat?(g.member.passives?.beatEnergy??r.beat.likes):0);p.energy=Math.min(r.max,p.energy+likes);emitCombatFx(g,'likes',p,{amount:likes,trend:st.trend});
 st.last=[id,st.last[0]].filter(Boolean);
}
/** Proc-Wirkungen der Ressourcen (bottles, glut, cook, augen, draw, trend, tab). */
export function resourceProcEffect(g,ef,cs){
 const r=R(g),st=g.res;if(!r||!st)return;
 if(ef.bottles&&r.kind==='ammo')st.bottles=Math.min(crateMax(g,cs),st.bottles+ef.bottles);
 if(ef.glut&&r.kind==='grill')addGlut(g,st,ef.glut,cs);
 if(ef.cook&&r.kind==='grill')for(const it of st.rost)it.done+=ef.cook;
 if(ef.augen&&r.kind==='cards')addAugen(g,st,ef.augen);
 if(ef.draw&&r.kind==='cards'){st.discard.push(...st.hand);st.hand=[];draw(g,st,cs);}
 if(ef.trend&&r.kind==='trend')st.trend=clamp(st.trend+ef.trend,0,r.trend.max);
 if(ef.tab&&r.kind==='rage')st.tab=Math.max(0,st.tab*(1-ef.tab));
}
/** Pik-Schild der Kartenlegerin wirft geschluckten Schaden zurück. */
export function resourceAbsorbed(g,e,absorbed){const st=g.res;if(resourceKind(g)!=='cards'||!st?.pikReflect||st.pikReflect.until<g.time||!(absorbed>0)||!live(g,e))return;g.damage(e,Math.round(absorbed*st.pikReflect.share),'Pik');}

// ---------------------------------------------------------------------------------------------------------------
// Leiste und Anzeige
export function resourceVariant(g,id){
 const r=R(g),st=g.res;if(!r||!st)return null;const cs=g.cs||{};
 if(r.kind==='rage'&&id==='zeche'&&st.tab>g.player.maxHp*.1)return {name:'PRELLEN '+Math.round(st.tab),tone:'burst'};
 if(r.kind==='trend'&&st.viral>0){const s=g.skills.find(x=>x.id===id);if(s?.cost>0)return {name:'VIRAL',tone:'gold'};}
 if(r.kind==='ammo'){if(id==='strike'&&st.bottles<=0)return {name:r.hud.empty,tone:'burst'};if(id==='reload'&&st.reload)return {name:'JETZT!',tone:'gold'};if(st.bons>0&&(r.costs[id]||0)>0)return {name:'BON',tone:'gold'};}
 if(r.kind==='grill'){
  if(id==='burst'){const it=ripest(g,st,cs);if(!it)return null;const d=doneness(g,it,cs),m=mech(g),name=r.items[it.item].name.toUpperCase();if(m?.flamme&&st.glut>=m.flamme.at)return {name:'FLAMBIEREN',tone:'burst'};if(it.smoked&&m?.rauch)return {name:'GERÄUCHERT',tone:'gold'};return d.perfect?{name:name+' GAR',tone:'gold',item:it.item}:d.state==='verkohlt'?{name:name+' VERKOHLT',tone:'free',item:it.item}:null;}
  if(id==='heal'&&st.glut>=85)return {name:'ABLÖSCHEN!',tone:'burst'};
 }
 if(r.kind==='cards'){const c=handCard(g,id);if(c){const rk=r.ranks[c.rank],beat=live(g,g.target)&&g.target.cast?.card&&(g.target.cast.interruptible||cs.stichAny)&&beats(c,g.target.cast.card);return {name:beat?'STICH '+rk.short:(r.suits[c.suit].symbol+' '+rk.short),tone:beat?'gold':c.suit==='herz'||c.suit==='karo'?'burst':'free',card:c};}
  if(id==='throw'&&st.augen>=r.win+num(cs,'augenWin')){const m=mech(g),grand=m?.grand&&st.bubes>=m.grand.bubes;return {name:grand?r.hud.grand:st.augen>=r.schwarz?r.hud.schwarz:st.augen>=r.schneider?r.hud.schneider:r.hud.won,tone:'gold'};}}
 return null;
}
/** Anzeigezustand für die UI (resource-hud). */
export function resourceHud(g){
 const r=R(g),st=g.res,p=g.player;if(!r||!st)return null;const cs=g.cs||{};const base={kind:r.kind,name:r.name,unit:r.unit,color:r.color};
 if(r.kind==='rage')return {...base,value:p.energy,max:r.max,surgeAt:r.surgeAt,tab:st.tab,tabMax:p.maxHp*(r.tab.cap+num(cs,'zecheCap')),paid:st.paid};
 if(r.kind==='trend')return {...base,value:p.energy,max:r.max,trend:st.trend,trendMax:r.trend.max,trendName:r.trend.names[st.trend],viewers:r.trend.viewers[st.trend],viral:st.viral,last:st.last[0]||null,idle:st.idle,decayAfter:r.trend.decayAfter+num(cs,'trendDecay')};
 if(r.kind==='ammo')return {...base,value:st.bottles,max:crateMax(g,cs),bons:st.bons,bonMax:r.bon.max+num(cs,'bonMax'),reload:st.reload?{t:st.reload.t,total:st.reload.total,zone:st.reload.zone,jam:st.reload.jam,tried:st.reload.tried}:null,pickups:st.pickups.length};
 if(r.kind==='grill'){const z=zoneOf(g,st.glut,cs);return {...base,value:st.glut,max:r.max,zone:z.id,zoneName:z.name,zones:r.zones.map(x=>({...x})),perfect:[r.zones[1].to+num(cs,'perfectLow'),r.zones[2].to+num(cs,'perfectHigh')],locked:st.lock,noDecay:st.noDecay,slots:rostSlots(g,cs),rost:rostState(g),nextItem:nextItem(g,st,cs)};}
 if(r.kind==='cards')return {...base,value:st.augen,max:r.max,win:r.win+num(cs,'augenWin'),schneider:r.schneider,schwarz:r.schwarz,hand:st.hand.map(c=>({...c})),sleeve:st.sleeve?{...st.sleeve}:null,deck:st.deck.length,chain:{...st.chain},bubes:st.bubes,next:(cs.seeNext||mech(g)?.herz?.seeNext)&&st.deck[0]?{...st.deck[0]}:null};
 return null;
}
/** Text für die schmale Leiste am Spielerfenster. */
export function resourceLine(g){const h=resourceHud(g);if(!h)return '';const n=v=>Math.floor(v);
 if(h.kind==='rage')return n(h.value)+' Randale'+(h.tab>=1?' · Zeche '+n(h.tab):'');
 if(h.kind==='trend')return n(h.value)+' Likes';/* Runde 4 (hud4): der Trend steht getrennt als Herzen + Stufenname unter dem Porträt */
 if(h.kind==='ammo')return h.value+'/'+h.max+' Flaschen'+(h.bons?' · '+h.bons+' Bon':'');
 if(h.kind==='grill')return 'Glut '+n(h.value)+' · '+h.zoneName;
 if(h.kind==='cards')return n(h.value)+'/'+h.win+' Augen';
 return '';}
/** Gutschrift als Text in der Einheit der Klasse (Hilfe, Tooltips): 10 → „10 Randale“, „1 Flasche“, „4 Glut“, „2 Augen“. */
export function resourceGrantText(cls,n){const r=RESOURCES[cls];if(!r)return n+' Randale';const v=r.kind==='ammo'?Math.max(1,Math.ceil(n*r.grantRate)):r.kind==='grill'||r.kind==='cards'?Math.max(1,Math.round(n*r.grantRate)):n;return v+' '+(r.kind==='ammo'?(v===1?'Flasche':'Flaschen'):r.unit);}
/** Name der Ressource einer Klasse („Randale“, „Likes“, „Flaschen“, „Glut“, „Augen“). */
export const resourceUnit=cls=>RESOURCES[cls]?.unit||'Randale';
/** Verfügbarkeit der Ressourcen-Kniffe (Lernstufe, Hauptbaum). */
export function resourceSkillLevel(id){return RESOURCE_SKILLS[id]?.level;}
export function resourceSkillAllowed(g,id){const d=RESOURCE_SKILLS[id];if(!d)return true;return d.cls===g.member?.id&&(!d.spec||spec(g)===d.spec);}
export function resourceSkillsFor(cls){return Object.entries(RESOURCE_SKILLS).filter(([,d])=>d.cls===cls).map(([id,d])=>({id,...d,offGcd:!!d.offGcd}));}
void BALANCE;
