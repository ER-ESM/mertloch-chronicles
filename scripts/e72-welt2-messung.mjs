// E-72 Runde 5 · welt2: Messlauf „Held Stufe N gegen einen Weltgegner“ mit der echten Engine (flache Welt).
// Anlass: Kenner-Nachtest 26.09. – Käthe Stufe 4 starb an einem Pfanddachs Stufe 1 und an einem Ruhewart, Schorsch Stufe 6 an
// einem Ruhewart Stufe 3. Held wie per Admin „level N“: Stufenaufstiege, nur Startkleidung, keine Talente.
// Spielweisen:
//  - stand: Balance-Rotation (scripts/balance-rotation.mjs), keine Antwort auf Gegnerzauber – „Kniffe nicht genutzt“.
//  - kniffe: dieselbe Rotation plus Antworten wie ein aufmerksamer Spieler: Unterbrechen (gelber Balken, 0,5 s Reaktion),
//    Parade vor Nahkampfzaubern, Ausweichen aus Boden-Zaubern (0,35 s vor dem Einschlag), Heilung unter 60 %.
//  - langsam: ein Tastendruck der Rotation alle --every s (Standard 2,5), sonst nur Autoangriff. Der Kenner-Playtest über das
//    Browser-Werkzeug liegt bei etwa 6–8 s je Druck (Screenshot, Überlegen, Taste).
//  - auto: nur Autoangriff.
// Aufruf: node scripts/e72-welt2-messung.mjs [--classes=kaethe,schorsch] [--levels=1,2,4,6] [--foes=badger,boar,warden]
//        [--modes=stand,kniffe,langsam,auto] [--every=2.5] [--json]
import {Game} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {ARCHETYPES} from '../content/index.js';
import {rotate} from './balance-rotation.mjs';
import {xpToNext,available} from '../progression.js';

export const CLASSES=['dieter','baerbel','kevin','schorsch','kaethe'];
const flat=()=>({id:'welt2-mess',spawn:{x:0,y:0},npc:{x:0,y:10},landmarks:[],camps:[],quests:[],blocked:()=>false,lineClear:()=>true,walkClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[{...b}]});
/** Held wie per Admin „level N“. */
export function hero(classId,level,seed=.5){const g=new Game(flat(),{classId});g.random=typeof seed==='function'?seed:()=>seed;Object.assign(g.player,{x:500,y:500});
 while(g.player.level<level)g.gainXp(xpToNext(g.player.level)-g.player.xp);g.player.hp=g.player.maxHp;return g;}
/** Weltgegner der Startreihe mit seiner echten Stufe (Tiergebiet/Feld, ambient → Stufenabstand greift). */
export function foe(g,kind,{dist=40,angle=0,id=100,extra={}}={}){const def=ARCHETYPES[kind];
 return makeEnemy({x:g.player.x+Math.cos(angle)*dist,y:g.player.y+Math.sin(angle)*dist},id,{...def,ambient:true,archetype:kind,...extra});}
const ready=(g,id)=>g.skills.some(s=>s.id===id)&&available(g,id)&&(g.cooldowns[id]||0)<=0;
/** Antworten auf Gegnerzauber wie ein aufmerksamer Spieler. Rückgabe true = ein Kniff wurde benutzt. */
export function answer(g,list,react=.5){
 const p=g.player;
 for(const e of list){const c=e.cast;if(!c||e.hp<=0)continue;const gone=c.total-c.remaining;
  if(c.interruptible&&gone>=react&&ready(g,'interrupt')){const t=g.target;g.target=e;const ok=g.action('interrupt');if(!ok)g.target=t;if(ok)return true;}
  if(c.ground&&c.remaining<=.35&&Math.hypot((p.x-c.x)/c.radius,(p.y-c.y)/(c.radius*.75))<1&&ready(g,'dash')&&g.action('dash'))return true;
  if(!c.ground&&!c.interruptible&&c.radius&&c.remaining<=.5&&!(p.parry>0)&&ready(g,'parry')&&g.action('parry'))return true;
  // ohne Ausweichen: aus der Fläche herauslaufen (so weit wie nötig, dann zurück)
  if(c.ground&&c.remaining<=1.2&&!ready(g,'dash')&&Math.hypot((p.x-c.x)/c.radius,(p.y-c.y)/(c.radius*.75))<1){const d=Math.hypot(p.x-c.x,p.y-c.y)||1,dx=d>1?(p.x-c.x)/d:1,dy=d>1?(p.y-c.y)/d:0;g.moveTo={x:c.x+dx*(c.radius+14),y:c.y+dy*(c.radius*.75+14)};g.path=[];}
 }
 return false;
}
/** Ein Kampf bis Sieg, Tod oder Zeitende. Liefert Messwerte je Trefferart. */
export function duel(g,list,{mode='stand',seconds=60,healAt=.6,every=2.5}={}){
 const hits=[],casts=[],hit=g.hitPlayer.bind(g),cast=g.startCast.bind(g);
 g.hitPlayer=(e,n,...r)=>{const b=g.player.hp;hit(e,n,...r);hits.push({t:g.time,lost:b-g.player.hp,kind:e.lastCast?e.lastCast.type:'auto',name:e.lastCast?.name||e.autoAttack?.name,raw:n});};
 g.startCast=e=>{cast(e);casts.push({t:g.time,id:e.id,type:e.cast?.type,name:e.cast?.name});};
 for(const e of list){e.aggro=true;e.ai='combat';e.spawnGrace=0;}g.enemies=list;g.target=list[0];g.autoAttack.enabled=true;
 const t0=g.time;let answers=0,next=0;
 for(let i=0;i<seconds/.05&&!g.dead&&list.some(e=>e.hp>0);i++){
  if(!g.target||g.target.hp<=0)g.target=list.find(e=>e.hp>0);
  if(mode==='kniffe'&&answer(g,list))answers++;
  if(g.moveTo&&Math.hypot(g.moveTo.x-g.player.x,g.moveTo.y-g.player.y)<6)g.moveTo=null;
  if(mode==='langsam'){if(g.time>=next&&!g.casting&&g.gcd<=0&&rotate(g,{healAt}))next=g.time+every;}
  else if(mode!=='auto'&&!g.moveTo&&!g.casting&&g.gcd<=0)rotate(g,{healAt});
  g.tick(.05);
 }
 const by=k=>hits.filter(h=>h.kind===k),avg=a=>a.length?Math.round(a.reduce((n,h)=>n+h.lost,0)/a.length):0;
 const worst3=Math.max(0,...hits.map(h=>hits.filter(x=>x.t>=h.t&&x.t<h.t+3).reduce((n,x)=>n+x.lost,0)));
 const kinds=[...new Set(hits.map(h=>h.kind))];
 return {win:list.every(e=>e.hp<=0),dead:g.dead,time:+(g.time-t0).toFixed(1),lostPct:Math.round((g.player.maxHp-g.player.hp)/g.player.maxHp*100),maxHp:g.player.maxHp,
  foeHp:list.reduce((n,e)=>n+Math.max(0,e.hp),0),foeMax:list.reduce((n,e)=>n+e.maxHp,0),worst3:Math.round(worst3),answers,
  perKind:Object.fromEntries(kinds.map(k=>[k,{n:by(k).length,avg:avg(by(k)),sum:by(k).reduce((n,h)=>n+h.lost,0)}])),casts:casts.length};
}
function cell(r){if(r.dead)return '† '+r.time+' s ('+Math.round(r.foeHp/r.foeMax*100)+' % übrig)';if(!r.win)return 'offen '+r.time+' s / −'+r.lostPct+' %';return r.time+' s / −'+r.lostPct+' %';}
const isMain=process.argv[1]&&import.meta.url.endsWith(process.argv[1].replace(/\\/g,'/').split('/').pop());
if(isMain){
 const arg=k=>process.argv.find(a=>a.startsWith('--'+k+'='))?.split('=')[1];
 const classes=(arg('classes')||CLASSES.join(',')).split(','),levels=(arg('levels')||'1,2,4,6').split(',').map(Number),foes=(arg('foes')||'badger,boar,warden').split(',');
 const modes=(arg('modes')||'stand,kniffe').split(','),every=Number(arg('every')||2.5),json=process.argv.includes('--json'),out=[];
 for(const kind of foes){
  console.log('\n## '+ARCHETYPES[kind].name+' (Stufe '+ARCHETYPES[kind].level+', '+ARCHETYPES[kind].hp+' Leben)\n');
  console.log('| Held | '+levels.map(l=>'St. '+l).join(' | ')+' |');console.log('|---|'+levels.map(()=>'---').join('|')+'|');
  for(const c of classes)for(const mode of modes){const row=[];for(const lv of levels){const g=hero(c,lv),r=duel(g,[foe(g,kind)],{mode,every});row.push(cell(r));out.push({kind,c,lv,mode,...r});}
   console.log('| '+c+' · '+mode+' | '+row.join(' | ')+' |');}
 }
 if(json)console.log(JSON.stringify(out,null,1));
 else{console.log('\n## Treffer je Art (Mittel verlorenes Leben je Treffer, Spielweise „stand“)\n');
  for(const r of out.filter(r=>r.mode==='stand'))console.log(r.kind,r.c,'St.'+r.lv,'Leben '+r.maxHp,JSON.stringify(r.perKind),'schlimmste 3 s '+r.worst3);}
}
