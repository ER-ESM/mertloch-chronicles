// Dungeon-Fix 7 (Prüferin #770, docs/PLAYTEST-2026-09-26-dungeon-bigb-5.md, Bericht docs/DUNGEON-FIX7-2026-09-26.md): Serien-Nachstellen im echten
// Spiel. Zweimal in Folge gewann live eine passive Gruppe Big B, obwohl die Simulation 2 % meldete. Hier läuft der Kampf deshalb nicht mit dem
// Sim-Aufbau (setup), sondern mit dem echten Testzugang der Prüferin: Spielstand aus scripts/playtest-save.mjs (--preset=bigb, typische Ausrüstung,
// Rita liegt, drei Beweise, vier Söldner), geladen wie im Browser (new Game(world, save)), Takt wie im Browser (Bildrate 60 Hz mit Aussetzern,
// app.js frame: dt = min(Abstand, 0,05 s)) und Zufall je Lauf (Seed). Der Spieler-Bot ist derselbe wie in der Simulation (scripts/sim-fight.mjs).
// Varianten (je Rolle: Heilerin baerbel-care wie die Prüferin, Tank dieter-wall, Schaden dieter-brawl):
//   i    wie die Prüferin: nach der Rede ziehen, etwa 20 s nur Autoangriff, dann passiv (weicht aus, kein Schaden, keine Kniffe)
//   ii   ganz passiv ab dem Pull (ein Angriff zieht, danach nichts mehr außer Ausweichen)
//   iii  passiv und tot: zieht, fällt nach 20 s und bleibt liegen
//   aktiv  spielt richtig (Rotation, weicht aus, pariert; die Heilerin heilt den Schwächsten)
// Kriterien: passiv ≤ 10 % Siege je Variante (über alle Rollen) · aktiv ≥ 90 % Siege, jeder mit Luft vor der Wut (≥ AIR s).
// Aufruf: node scripts/dungeon-serie.mjs [--runs=20] [--roles=heal,tank,damage] [--variants=i,ii,iii,aktiv] [--dt=frame|0.05] [--jobs=6] [--json] [--verbose]
// Ausgabe: je Variante die Quote (Einzelläufe nur mit --verbose).
// SIM_TUNE (JSON) wie in dungeon-sim.mjs, z. B. für einen Vorher-Lauf. Rückgabewert 1, wenn ein Kriterium rot ist.
import {readFileSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {World,rng} from '../world.js';
import {Game} from '../engine.js';
import {DUNGEONS,DUNGEON_BOSSES,EINSATZ_RULES,COMPANION_RULES} from '../content/index.js';
import {toWorld,enrageAfter,resetEnemySerial} from '../dungeon.js';
import {buildPlaytestSave} from './playtest-save.mjs';
import {fight,heroPulls} from './sim-fight.mjs';

{const tune=process.env.SIM_TUNE?JSON.parse(process.env.SIM_TUNE):null,merge=(to,from)=>{for(const [k,v] of Object.entries(from||{})){if(v&&typeof v==='object'&&!Array.isArray(v)&&to[k]&&typeof to[k]==='object')merge(to[k],v);else to[k]=v;}};
 if(tune){merge(EINSATZ_RULES,tune.rules);merge(DUNGEON_BOSSES,tune.bosses);merge(COMPANION_RULES,tune.companions);}}
const arg=(k,d)=>(process.argv.find(a=>a.startsWith('--'+k+'='))||'').slice(k.length+3)||d;
const JSON_OUT=process.argv.includes('--json'),VERBOSE=process.argv.includes('--verbose')/* Einzelläufe ausgeben; sonst nur die Quoten */,RUNS=Number(arg('runs',20)),SEED0=Number(arg('seed',1)),JOBS=Math.max(1,Number(arg('jobs',process.env.SIM_JOBS||6))),AIR=Number(arg('air',20));
export const SERIE_ROLES={heal:{classId:'baerbel',spec:'baerbel-care'},tank:{classId:'dieter',spec:'dieter-wall'},damage:{classId:'dieter',spec:'dieter-brawl'}};
export const SERIE_VARIANTS={i:{noDamage:true,autoFor:20},ii:{noDamage:true},iii:{noDamage:true,stayDead:20},aktiv:{}};
const ROLES=arg('roles','heal,tank,damage').split(','),VARIANTS=arg('variants','i,ii,iii,aktiv').split(','),DT=arg('dt','frame');
const world=new World(JSON.parse(readFileSync(new URL('../data/mertloch.json',import.meta.url),'utf8')),{});
const DEF=DUNGEONS['schloss-bigb'],saves={};
/** Takt wie im Browser: meist 1/60 s, manchmal ein ausgelassenes Bild (1/30 s), selten die Obergrenze 0,05 s (app.js frame). */
export function frameDt(seed){const r=rng(seed*7919+13);return ()=>{const x=r();return x<.85?1/60:x<.97?1/30:.05;};}
/** Ein Lauf im echten Spiel: Testzugang laden, im Thronsaal ansprechen (die Beweise werden vorgelegt), nach der Rede ziehen, dann je Variante. */
export function serieRun({role='heal',variant='i',seed=1,dt='frame'}){
 const h=SERIE_ROLES[role];saves[role]||=JSON.stringify(buildPlaytestSave({preset:'bigb',classId:h.classId,spec:h.spec,gear:'typical'}).save);
 resetEnemySerial();/* jeder Lauf unabhängig von den vorigen im selben Prozess (wie die Simulation) */const g=new Game(world,JSON.parse(saves[role]),{});g.toast=()=>{};g.clock=()=>Date.UTC(2026,8,26,12);g.random=rng(seed);g.lootRandom=rng(seed+1000);
 for(const e of g.enemies)if(!e.dungeonBoss)e.respawnAt=Infinity;
 Object.assign(g.player,g.world.findClear(...Object.values(toWorld(DEF,'k2',59,17)),9));for(const c of g.companions){const q=g.world.findClear(g.player.x-20,g.player.y+14,9);c.x=q.x;c.y=q.y;}
 const run=g.dungeonRun,big=g.enemies.find(e=>e.bossId==='bigb');heroPulls(g,big);
 const r=fight(g,[big],{limit:420,dt:dt==='frame'?frameDt(seed):Number(dt),healer:role==='heal'&&variant==='aktiv',...SERIE_VARIANTS[variant]});
 const x=big.dungeonReward?.einsatz;
 return {role,variant,seed,won:r.won,time:r.time,enrage:enrageAfter(run,'bigb'),bossMin:r.bossMin??null,deaths:r.deaths,mercDowns:r.mercDowns,evidence:run.evidence.size,rita:run.killed.has('rita'),einsatz:x?.score??null,bonus:x?.bonus??null,rally:x?.rally??null};
}
const main=/dungeon-serie\.mjs$/.test(process.argv[1]||'');/* als Modul (Tests) ohne Lauf */
if(main){
 const tasks=[];for(const role of ROLES)for(const variant of VARIANTS)tasks.push({role,variant});
 let rows=[];
 if(process.env.SERIE_CHILD||JOBS===1||tasks.length===1){for(const t of tasks)for(let i=0;i<RUNS;i++){const r=serieRun({...t,seed:SEED0+i,dt:DT});rows.push(r);if(!JSON_OUT&&VERBOSE)console.log(('Big B · '+t.role+' · '+t.variant+' · Seed '+(SEED0+i)).padEnd(40),JSON.stringify(r));}}
 else rows=await new Promise((done,fail)=>{const queue=[...tasks],res=[];let running=0;const next=()=>{if(!queue.length&&!running)return done(res);while(running<JOBS&&queue.length){const t=queue.shift();running++;let buf='';
  const ch=spawn(process.execPath,[fileURLToPath(import.meta.url),'--json','--roles='+t.role,'--variants='+t.variant,'--runs='+RUNS,'--seed='+SEED0,'--dt='+DT],{env:{...process.env,SERIE_CHILD:'1'},stdio:['ignore','pipe','inherit'],windowsHide:true});ch.stdout.on('data',d=>buf+=d);
  ch.on('close',code=>{running--;try{const j=JSON.parse(buf);res.push(...j.rows);if(!JSON_OUT&&VERBOSE)for(const r of j.rows)console.log(('Big B · '+r.role+' · '+r.variant+' · Seed '+r.seed).padEnd(40),JSON.stringify(r));}catch(e){return fail(Error('Teillauf '+t.role+'/'+t.variant+' ohne Ergebnis (Code '+code+')'));}next();});}};next();});
 const frac=rs=>rs.filter(r=>r.won).length+'/'+rs.length,rate=rs=>rs.length?rs.filter(r=>r.won).length/rs.length:0,pc=x=>Math.round(x*100)+' %';
 const checks=[];
 for(const v of VARIANTS.filter(v=>v!=='aktiv')){const rs=rows.filter(r=>r.variant===v),lost=rs.filter(r=>!r.won).map(r=>r.bossMin),won=rs.filter(r=>r.won).map(r=>r.time);
  checks.push({name:'Passiv ('+v+'): ≤ 10 % Siege',ok:rate(rs)<=.1,value:pc(rate(rs))+' ('+frac(rs)+') · je Rolle '+ROLES.map(ro=>ro+' '+frac(rs.filter(r=>r.role===ro))).join(', ')+(won.length?' · Siege nach '+Math.min(...won)+'–'+Math.max(...won)+' s':'')+(lost.length?' · verloren bei '+Math.min(...lost)+'–'+Math.max(...lost)+' % Bossleben':'')});}
 const ak=rows.filter(r=>r.variant==='aktiv');if(ak.length){const good=ak.filter(r=>r.won&&r.time<=r.enrage-AIR),t=ak.filter(r=>r.won).map(r=>r.time);
  checks.push({name:'Aktiv: ≥ 90 % Siege mit ≥ '+AIR+' s Luft vor der Wut',ok:good.length/ak.length>=.9,value:pc(good.length/ak.length)+' ('+good.length+'/'+ak.length+') · je Rolle '+ROLES.map(ro=>{const x=ak.filter(r=>r.role===ro),w=x.filter(r=>r.won).map(r=>r.time);return ro+' '+frac(x)+(w.length?' '+Math.min(...w)+'–'+Math.max(...w)+' s':'');}).join(', ')+' · Wut '+(ak[0]?.enrage??'?')+' s · Einsatz '+(ak.filter(r=>r.einsatz!=null).map(r=>r.einsatz).sort((a,b)=>a-b).join('/')||'–')});}
 if(JSON_OUT)console.log(JSON.stringify({rows,checks}));
 else{console.log('\nPrüfkriterien (echtes Spiel, '+RUNS+' Läufe je Rolle und Variante, Takt '+DT+')');for(const c of checks)console.log((c.ok?'GRÜN ':'ROT  ')+c.name.padEnd(50)+c.value);}
 if(checks.some(c=>!c.ok))process.exitCode=1;
}
