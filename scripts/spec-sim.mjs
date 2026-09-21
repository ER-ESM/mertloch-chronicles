// Balancing-Werkzeug (E-32): jede Spezialisierung 45 s gegen eine Übungspuppe mit naiver Rotation (Markierung → Kelle bis
// 3 Schwung → Eskalation, Bodenkniff/Stärkung wenn bereit). Ausgabe: Schaden je Sekunde und Heilung je Sekunde je Spec,
// Abweichung vom Median. Aufruf: node scripts/spec-sim.mjs [sekunden] [pfad 0-2|none]
import {Game} from '../engine.js';
import {makeEnemy} from '../encounters.js';
import {changeSpec,pathBuild,learnTalent,TALENTS} from '../talents.js';
import {tickCasting} from '../auto-combat.js';
import {CLASS_SPECS} from '../content/index.js';
const seconds=Number(process.argv[2]||45),pathArg=process.argv[3]??'none',level=Number(process.argv[4]||11),points=Number(process.argv[5]||level-1);
// Aufruf: node scripts/spec-sim.mjs [sekunden] [pfad 0-2|none] [stufe] [punkte] – offene Bäume (E-37): pathBuild füllt mit Nachbartalenten auf
const arena=()=>({spawn:{x:0,y:0},npc:{x:0,y:20},landmarks:[],camps:[],blocked:()=>false,findClear:(x,y)=>({x,y}),lineClear:()=>true,findPath:(a,b)=>[b]});
function run(classId,spec){
 const g=new Game(arena(),{classId,level});changeSpec(g,spec);if(pathArg!=='none'){for(const id of pathBuild(spec,Number(pathArg),points))learnTalent(g,id);/* Restpunkte: erst der eigene Baum Reihe für Reihe, dann die Nachbarbäume */for(const tree of [spec,...CLASS_SPECS[classId].filter(x=>x!==spec)])for(const t of TALENTS[tree].slice().sort((a,b)=>a.row-b.row))if(g.rpg.talents.learned.length<points)learnTalent(g,t.id);}
 g.random=()=>.5;g.player.x=1000;g.player.y=1000;
 const foes=[0,1,2].map(i=>{const e=makeEnemy({x:1040+i*40,y:1000+(i%2)*30},i+1,{hp:1e7,roamWait:100,attackTimer:100,stun:1e9});e.aggro=true;e.ai='combat';g.enemies.push(e);return e;});
 g.target=foes[0];g.player.inCombat=7;const hp0=foes.reduce((a,e)=>a+e.hp,0);let healed=0,energySum=0,low=0,ticks=0;const origHeal=g.player;void origHeal;
 g.on?.('combat',()=>{});const heals=[];g.events.length=0;
 const has=id=>g.skills.some(s=>s.id===id);
 for(let t=0;t<seconds;t+=.05){
  g.player.inCombat=7;for(const e of foes){e.hp=Math.max(e.hp,1e6);}
  const p=g.player;if(!g.casting&&g.gcd<=0){
   if(has('mark')&&g.target.mark<=0&&g.cooldowns.mark<=0&&p.energy>=20)g.action('mark');
   else if(g.cooldowns.ground<=0&&has('ground')&&p.energy>=35)g.action('ground',{x:1050,y:1010});
   else if(g.cooldowns.burst<=0&&p.energy>=35)g.action('burst');
   else if(has('buff')&&g.cooldowns.buff<=0&&p.energy>=30)g.action('buff');
   else if(g.cooldowns.strike<=0)g.action('strike');
   else if(has('throw')&&g.cooldowns.throw<=0&&p.energy>=20)g.action('throw');
  }
  energySum+=g.player.energy;ticks++;if(g.player.energy<35)low++;
  if(g.casting)tickCasting(g,.05);
  g.tick(.05);
  for(const ev of g.events)if(ev.type==='combat'&&ev.kind==='heal'&&ev.area==='in')healed+=ev.value||0;g.events.length=0;
 }
 const dealt=hp0-foes.reduce((a,e)=>a+e.hp,0)+0;const taken=foes.reduce((a,e)=>a+(1e7-e.hp),0);void dealt;
 return {dps:Math.round(taken/seconds),hps:Math.round(healed/seconds),energy:Math.round(energySum/ticks),low:Math.round(100*low/ticks)};
}
const rows=[];for(const [cls,specs] of Object.entries(CLASS_SPECS))for(const spec of specs)rows.push({spec,...run(cls,spec)});
const med=rows.map(r=>r.dps).sort((a,b)=>a-b)[Math.floor(rows.length/2)];
for(const r of rows)console.log(r.spec.padEnd(18),String(r.dps).padStart(5),'DPS',String(r.hps).padStart(4),'HPS',(Math.round((r.dps/med-1)*100)>=0?'+':'')+Math.round((r.dps/med-1)*100)+' % zum Median','· Randale Ø',String(r.energy).padStart(3),'· knapp (<35)',String(r.low).padStart(3)+' % der Zeit');
