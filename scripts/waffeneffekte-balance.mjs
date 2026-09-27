// E-75 Waffenkammer: Vorher-nachher-Vergleich der acht Waffenwirkungen mit dem Übungskampf des Balance-Sheets (simulate aus balance-sheet.mjs).
// Je Waffe: die Spezialisierungen, bei denen die Wirkung überhaupt greifen kann (Nahkampfwaffe → Nahkampf-Autoangriff, Fernkampfwaffe →
// Fernkampf-Autoangriff, Abwehr-Wirkungen → alle), Stufe = max(Spec-Stufe, Waffenstufe), Ausrüstung „selten“, die Waffe auf ihrem Platz –
// einmal ohne Wirkung (proc entfernt = Stand E-73), einmal mit. Gemessen wie im Sheet (Boss und Dreiergruppe, feste Startwerte), nur mit
// mehr Startwerten, weil würfelnde Wirkungen die Zufallsfolge verschieben. Abwehr-Wirkungen laufen im Abwehr-Kampf: Der Held pariert bzw.
// weicht dem Puppenschlag aus, sobald es geht (die Prioritäten-Rotation tut beides nie). Maßstab: Dorflegenden mit Proc (verdict, rage,
// thirst, stout) auf dieselbe Weise. Deterministisch – gleiche Zahlen bei jedem Lauf.
// Aufruf: node scripts/waffeneffekte-balance.mjs [--quick] [--seeds=12]  → Tabelle auf der Konsole, generated/waffeneffekte-balance.json
import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {simulate,SHEET,roleGroup} from './balance-sheet.mjs';
import {Game} from '../engine.js';
import {changeSpec,SPECS} from '../talents.js';
import {ITEMS} from '../rpg.js';
import {compatibleSlots} from '../equipment.js';
import {CLASS_SPECS,BALANCE,PROCS} from '../content/index.js';

export const WAFFEN=['grillzange','rohrzange','masskrugschild','gartenzwerg','fasskeule','schorlenspritze','kronkorkenstern','blitzschrauber'];
/** Dorflegenden als Maßstab: dieselbe Messung, Proc an/aus. */
export const LEGENDEN=['horststempel','sigizange','korkenzieher-kellermeister','automatenarm'];
const arena=()=>({spawn:{x:0,y:0},npc:{x:0,y:20},landmarks:[],camps:[],quests:[],blocked:()=>false,findClear:(x,y)=>({x,y}),lineClear:()=>true,findPath:(a,b)=>[b]});
/** Nahkampf- oder Fernkampf-Autoangriff einer Spezialisierung (Kevin als Schrottkoloss schlägt im Nahkampf). */
function autoSource(classId,spec,level){const g=new Game(arena(),{classId,level,tutorial:{completed:true}});changeSpec(g,spec);return g.skills.find(s=>s.id==='auto')?.weaponSource||'melee';}
const triggers=id=>[].concat(PROCS[ITEMS[id]?.proc]?.trigger||[]);
const specsFor=(id,level)=>{const d=ITEMS[id],r=PROCS[d.proc],want=!r?.weapon?null:d.weapon?.hands===0?'ranged':'melee';
 return Object.entries(CLASS_SPECS).flatMap(([classId,specs])=>specs.map(spec=>({classId,spec}))).filter(s=>!want||autoSource(s.classId,s.spec,level)===want);};
const METRIC={dps:'dps',heal:'hps',tank:'protection'};
const pct=(a,b)=>b>1e-9?Math.round((a/b-1)*1000)/10:0,r1=n=>Math.round(n*10)/10;
/** Mittel über Boss/Gruppe und die Startwerte (wie blend() im Sheet). */
function measure(o,seeds){const runs=SHEET.targets.flatMap(targets=>seeds.map(seed=>simulate({...o,targets,seed})));
 const m=k=>runs.reduce((n,r)=>n+(r[k]||0),0)/runs.length;return {dps:m('dps'),hps:m('hps'),protection:m('mitigated')+m('shield'),taken:m('taken'),slowed:m('slowed'),parries:m('parries'),dodges:m('dodges')};}
/** Eine Waffe (oder Dorflegende): je passender Spezialisierung ohne/mit Wirkung. */
export function compare(id,{quick=false,seeds=SHEET.seeds}={}){
 const d=ITEMS[id],proc=d.proc,level=Math.max(BALANCE.player.specLevel,d.level||1),slot=compatibleSlots(d)[0],rows=[];
 const t=triggers(id),parry=t.includes('parry'),dodge=t.includes('dodge');
 let specs=specsFor(id,level);if(quick)specs=specs.filter((s,i,a)=>a.findIndex(x=>x.classId===s.classId)===i);
 for(const {classId,spec} of specs){const base={classId,spec,path:0,level,gear:'rare',equip:{[slot]:id},parry,dodge};
  delete d.proc;const off=measure(base,seeds);d.proc=proc;const on=measure(base,seeds);
  const group=roleGroup(SPECS[spec]?.role||''),key=METRIC[group];
  rows.push({classId,spec,group,metric:key,off:r1(off[key]),on:r1(on[key]),delta:pct(on[key],off[key]),dps:pct(on.dps,off.dps),hps:pct(on.hps,off.hps),hpsAdd:r1(on.hps-off.hps),protection:pct(on.protection,off.protection),taken:pct(on.taken,off.taken),
   slowedOff:Math.round(off.slowed*100),slowedOn:Math.round(on.slowed*100),parries:r1(on.parries),dodges:r1(on.dodges)});}
 const avg=k=>r1(rows.reduce((n,r)=>n+r[k],0)/Math.max(1,rows.length)),max=k=>rows.reduce((n,r)=>Math.max(n,r[k]),-Infinity);
 return {id,proc,level,slot,defend:parry?'Parade':dodge?'Ausweichen':'',rows,avgDelta:avg('delta'),maxDelta:max('delta'),avgDps:avg('dps'),maxDps:max('dps'),avgHps:avg('hpsAdd'),avgProtection:avg('protection'),avgTaken:avg('taken'),slowed:[avg('slowedOff'),avg('slowedOn')]};}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 const quick=process.argv.includes('--quick'),n=Number((process.argv.find(a=>a.startsWith('--seeds='))||'').slice(8))||12,seeds=Array.from({length:n},(_,i)=>7+i);
 const t0=Date.now(),out={date:new Date().toISOString().slice(0,10),rules:{seconds:SHEET.seconds,targets:SHEET.targets,seeds,gear:'rare'},waffen:[],legenden:[]};
 const f=v=>String(v).padStart(5);
 const line=r=>`${r.id.padEnd(27)} ${String(r.proc).padEnd(9)} St.${String(r.level).padStart(2)} ${r.defend.padEnd(10)} Kennzahl Ø${f(r.avgDelta)} % (max${f(r.maxDelta)} %) · Schaden Ø${f(r.avgDps)} % (max${f(r.maxDps)} %) · Heilung +${r.avgHps}/s · Schutz Ø${f(r.avgProtection)} % · erlitten Ø${f(r.avgTaken)} % · gebremst ${r.slowed[0]} → ${r.slowed[1]} %`;
 for(const id of WAFFEN){const r=compare(id,{quick,seeds});out.waffen.push(r);console.log(line(r));}
 console.log('--- Dorflegenden (Maßstab) ---');
 for(const id of LEGENDEN){const r=compare(id,{quick,seeds});out.legenden.push(r);console.log(line(r));}
 mkdirSync(new URL('../generated/',import.meta.url),{recursive:true});
 writeFileSync(new URL('../generated/waffeneffekte-balance.json',import.meta.url),JSON.stringify(out,null,1));
 console.log(seeds.length+' Startwerte · '+Math.round((Date.now()-t0)/1000)+' s');
}
