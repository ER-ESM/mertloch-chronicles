// Balance-Sheet (E-57): fertige Rechentabellen je Klasse × Spezialisierung × Talentpfad × Stufe × Ausrüstung.
// Misst Schaden, Heilung, Deckung und verhinderten Schaden je Sekunde in einem festen Übungskampf und zerlegt sie:
// Anteil der Ausrüstung, Beitrag jedes Talents (einmal weglassen), Wert je Wertpunkt (+10 Punkte) und Anteil je Kniff.
// Alles deterministisch – dieselben Zahlen bei jedem Lauf, damit Änderungen an Werten, Talenten oder Kniffen vergleichbar sind.
// Aufruf: npm run balance:sheet [-- --quick] [-- --rows = ohne Zerlegung] [-- --buffs = mit allen sechs Klassen-Buffs, nur generated/balance-sheet-buffs.*]. Ein Worker je Spezialisierung.  → content/BALANCE-SHEET.md, generated/balance-sheet.json, generated/balance-sheet.csv
import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';
import {Game} from '../engine.js';
import {makeEnemy,scaledStats} from '../encounters.js';
import {rng} from '../world.js';
import {startAuto} from '../auto-combat.js';
import {rotate} from './balance-rotation.mjs';
import {changeSpec,pathBuild,learnTalent,unlearnTalent,talentPoints,TALENTS,SPECS as SPEC_DEFS} from '../talents.js';
import {ITEMS,addItem,equipItem} from '../rpg.js';
import {registerRoll} from '../itemization.js';
import {meterReport} from '../combat-meter.js';
import {applyClassBuff} from '../class-buffs.js';
import {CLASS_SPECS,STAT_NAMES,BALANCE,TUTORIAL,ARCHETYPES,CLASS_BUFFS} from '../content/index.js';

export const SHEET={seconds:40,dt:.05,levels:[1,5,10,15,20,30],gear:['none','uncommon','rare','epic'],paths:[0,1,2],attributionLevels:[10,20],attributionGear:'rare',statProbe:10,flag:.15,
 // Zielzahl: Bosse kämpfen allein, Feldgegner kommen per Kettenzug zu zweit oder dritt. Zelle = Mittel beider Lagen.
 targets:[1,3],
 // Gegner sterben (E-60): Feldgegner mit Leben wie im Umland (encounters.scaledStats), der Einzelgegner als Boss mit boss × diesem Leben.
 // Stirbt einer, steht sofort ein neuer da – so zählen Kill-, Hinrichtungs- und Kettentalente mit. Arena-Gegner: keine EP, keine Beute.
 foe:{type:'boar',boss:10},
 // Zufall mit festem Startwert: Krits und Procs unter 50 % Chance lösen aus wie im Spiel, und jeder Lauf bleibt reproduzierbar.
 seeds:[7,8,9],
 // Eingehender Schaden der Übungspuppen: Anteil des Grundlebens je Sekunde, damit Heilung und Rüstung etwas zu tun haben.
 incoming:.03};
const arena=()=>({spawn:{x:0,y:0},npc:{x:0,y:20},landmarks:[],camps:[],quests:[],blocked:()=>false,findClear:(x,y)=>({x,y}),lineClear:()=>true,findPath:(a,b)=>[b]});
// Voller Satz auf Charakterstufe; die drei Werteprofile wechseln sich über die Plätze ab (E-02: jeder Wert hilft jeder Klasse).
const GEAR_SLOTS=[['weapon','weapon',50],['offhand','offhand',500],['ranged','ranged',500],['head','head',500],['neck','neck',500],['shoulders','shoulders',500],['body','body',500],['wrists','wrists',500],['hands','hands',500],['waist','waist',500],['legs','legs',500],['feet','feet',500],['ring','ring1',500],['ring','ring2',501],['trinket','trinket1',500],['charm','trinket2',500]];
const PROFILES=['tresen','bass','pfand'];

function equipSet(g,quality,level){g.rpg.inventory=[];for(const k of Object.keys(g.rpg.equipment))g.rpg.equipment[k]=null;if(quality==='none'){for(const [slot,id] of Object.entries(TUTORIAL.starterEquipment)){addItem(g.rpg,id);equipItem(g,id,slot);}return;}
 GEAR_SLOTS.forEach(([slot,target,roll],i)=>{const id=registerRoll(g.rpg,ITEMS,{slot,spec:PROFILES[i%3],level,quality,roll,family:'boar'});addItem(g.rpg,id);equipItem(g,id,target);});}
function learnBuild(g,spec,path){const budget=Math.max(0,talentPoints(g)),ids=[];
 if(path!=null)for(const id of pathBuild(spec,path,budget))ids.push(id);
 for(const id of ids)learnTalent(g,id);
 // Restpunkte wie spec-sim: erst der eigene Baum Reihe für Reihe, dann die Nachbarbäume.
 for(const tree of [spec,...Object.values(CLASS_SPECS).find(l=>l.includes(spec)).filter(x=>x!==spec)])for(const t of TALENTS[tree].slice().sort((a,b)=>a.row-b.row))if(g.rpg.talents.learned.length<budget)learnTalent(g,t.id);
 return [...g.rpg.talents.learned];}

/** Leben einer Puppe: Feldgegner wie im Umland; allein steht ein Boss mit SHEET.foe.boss × diesem Leben. */
export const foeLife=(level,targets)=>Math.round(scaledStats(ARCHETYPES[SHEET.foe.type],level,true).hp*(targets===1?SHEET.foe.boss:1));

/** Ein Übungskampf: 40 s gegen targets Gegner (1 = Boss, 3 = Feldgruppe) mit der gemeinsamen Prioritäten-Rotation. */
export function simulate({classId,spec,path=0,level=10,gear='none',extra=null,drop=null,seconds=SHEET.seconds,targets=3,seed=SHEET.seeds[0],buffs=false}){
 const g=new Game(arena(),{classId,level,tutorial:{completed:true}});g.random=typeof seed==='function'?seed():rng(seed);g.lootRandom=()=>.99;
 const specOk=level>=BALANCE.player.specLevel&&spec;if(specOk)changeSpec(g,spec);
 equipSet(g,gear,level);
 if(extra){ITEMS.__probe={slot:'charm',level:1,stats:extra};g.rpg.equipment.trinket2='__probe';}
 g.refreshStats?.();
 const talents=specOk?learnBuild(g,spec,path):[];
 // Talentbeitrag: genau dieses Talent wieder verlernen; geht das nicht (andere bauen darauf auf), ist es gebunden.
 let dropped=null;if(drop){dropped=unlearnTalent(g,drop);}g.refreshStats?.();
 // „Mit Klassen-Buffs“: volle Gruppe – alle sechs Buffs ohne Talentverstärkung, wie aus drei Klassen gezaubert.
 if(buffs)for(const id of Object.keys(CLASS_BUFFS))applyClassBuff(g,g,{id,power:1});
 g.player.x=1000;g.player.y=1000;g.player.hp=g.player.maxHp;
 const foeHp=foeLife(level,targets),spawn=i=>{const e=makeEnemy({x:1000+Math.round(32*Math.cos(i*2.1)),y:1000+Math.round(32*Math.sin(i*2.1))},i+1,{hp:foeHp,roamWait:100,attackTimer:100,stun:1e9,damage:1});e.aggro=true;e.ai='combat';e.arena=true;return e;};
 const foes=Array.from({length:targets},(_,i)=>spawn(i));g.enemies.push(...foes);let killed=0;
 g.target=foes[0];g.player.inCombat=7;startAuto(g);const healer=/Heilung/.test(SPEC_DEFS[spec]?.role||'');
 const hitSize=(BALANCE.player.baseHp+(level-1)*BALANCE.player.hpPerLevel)*SHEET.incoming;let raw=0,taken=0,healed=0,shield=0,energySum=0,ticks=0,clock=0;
 for(let t=0;t<seconds;t+=SHEET.dt){
  g.player.inCombat=7;
  // Puppen bleiben stehen (Rückstoß würde sie aus der Reichweite schieben, echte Spieler gehen nach); gefallene ersetzt sofort eine neue.
  foes.forEach((e,i)=>{if(e.hp>0){e.x=e.home.x;e.y=e.home.y;return;}killed++;const n=spawn(i);g.enemies[g.enemies.indexOf(e)]=n;foes[i]=n;});
  if(!(g.target?.hp>0)){g.target=foes.find(e=>e.hp>0);startAuto(g);}
  const p=g.player;if(!g.casting&&g.gcd<=0)rotate(g,{healer,healBelow:1/* Heiler-WoW: wie vor den Heiler-Kits heilt der Heiler, sobald Leben fehlt */});
  clock+=SHEET.dt;if(clock>=1){clock-=1;const hp=p.hp,guard=g.classState?.guard||0;raw+=hitSize;g.hitPlayer(foes[0],hitSize);taken+=Math.max(0,hp-p.hp);shield+=Math.max(0,guard-(g.classState?.guard||0));if(p.hp<1)p.hp=1;}
  energySum+=p.energy;ticks++;
  g.tick(SHEET.dt);/* g.tick schreitet den Zauber selbst voran (tickCasting) – ein zweiter Aufruf halbierte bis E-59 jede Zauberzeit */
  for(const ev of g.events)if(ev.type==='combat'&&ev.kind==='heal'&&ev.area==='in')healed+=ev.value||0;g.events.length=0;g.dead=false;if(p.hp<1)p.hp=1;
 }
 if(extra)delete ITEMS.__probe;
 const dealt=killed*foeHp+foes.reduce((a,e)=>a+(foeHp-Math.max(0,e.hp)),0),report=meterReport(g,'current','damage'),me=report.actors?.[0],heal=meterReport(g,'current','healing');
 return {dropped,kills:killed,dps:dealt/seconds,hps:Math.max(healed,(heal.total||0)+(heal.excess||0))/seconds,hpsEff:(heal.total||0)/seconds,/* E-72 R3: effektiv = ohne Überheilung */mitigated:(raw-taken)/seconds,shield:shield/seconds,energy:energySum/ticks,talents,
  skills:(me?.abilities||[]).map(a=>({name:a.name,share:a.share}))};
}

const round=n=>Math.round(n*10)/10,pct=n=>Math.round(n*1000)/10;
/** Rollengruppe und Kennzahl: Tank → Schutz/s (verhindert + Deckung), Heilung → Heilung/s, sonst Schaden/s. */
export const roleGroup=role=>/Tank/.test(role)?'tank':/Heilung/.test(role)?'heal':'dps';
export const METRIC={dps:{key:'dps',label:'Schaden/s'},heal:{key:'hps',label:'Heilung/s'},tank:{key:'protection',label:'Schutz/s'}};
const talentName=id=>Object.values(TALENTS).flat().find(t=>t.id===id)?.name||id;
const specsOf=()=>Object.entries(CLASS_SPECS).flatMap(([classId,specs])=>specs.map(spec=>({classId,spec})));
const mean=(runs,keys)=>Object.fromEntries(keys.map(k=>[k,runs.reduce((n,r)=>n+r[k],0)/runs.length]));
const KEYS=['dps','hps','hpsEff','mitigated','shield','energy','kills'];
/** Kennzahl einer Zelle: je Zielzahl (Boss, Feldgruppe) Mittel über SHEET.seeds, dann Mittel beider Lagen. Tabelle und Zerlegung nutzen dasselbe. */
export function blend(o){
 const runs=SHEET.targets.map(targets=>{const rs=SHEET.seeds.map(seed=>simulate({...o,targets,seed}));return {...rs[0],...mean(rs,KEYS)};});
 return {...runs.at(-1),...mean(runs,KEYS),dropped:runs[0].dropped,single:runs[0],group:runs.at(-1)};}

/** Messzeilen und Zerlegung EINER Spezialisierung – die Einheit, die ein Worker rechnet. */
export function specPart({classId,spec},{quick=false,attribution:withAttribution=true,buffs=false}={}){
 const levels=quick?[1,10]:SHEET.levels,gear=quick?['none','rare']:SHEET.gear,paths=quick?[0]:SHEET.paths,rows=[],attribution=[];
 for(const level of levels)for(const path of level>=BALANCE.player.specLevel?paths:[null])for(const g of gear){
  const b=blend({classId,spec,path,level,gear:g,buffs}),role=SPEC_DEFS[spec]?.role||'';
  rows.push({classId,spec,role,group:roleGroup(role),path,level,gear:g,dps:round(b.dps),dpsSingle:round(b.single.dps),dpsGroup:round(b.group.dps),hps:round(b.hps),hpsEff:round(b.hpsEff),mitigated:round(b.mitigated),shield:round(b.shield),protection:round(b.mitigated+b.shield),energy:round(b.energy),skills:b.group.skills.slice(0,6).map(s=>({name:s.name,share:round(s.share)}))});}
 if(withAttribution)for(const level of quick?[10]:SHEET.attributionLevels)for(const path of quick?[0]:SHEET.paths){
  const at={classId,spec,path,level,gear:SHEET.attributionGear},base=blend(at),bare=blend({...at,gear:'none'}),probe0=blend({...at,extra:{}});
  const talents=base.talents.map(id=>{const r=blend({...at,drop:id});return r.dropped?{id,name:talentName(id),dps:pct(base.dps/Math.max(1,r.dps)-1),hps:pct(base.hps/Math.max(1,r.hps)-1)}:{id,name:talentName(id),bound:true};}).sort((a,b)=>(b.dps??-1e9)-(a.dps??-1e9));
  const stats=Object.keys(STAT_NAMES).map(k=>{const r=blend({...at,extra:{[k]:SHEET.statProbe}});/* gegen dieselbe Probe ohne Werte: die Probe belegt trinket2 */return {stat:k,name:STAT_NAMES[k],dpsPerPoint:round((r.dps-probe0.dps)/SHEET.statProbe),hpsPerPoint:round((r.hps-probe0.hps)/SHEET.statProbe),mitigatedPerPoint:round((r.mitigated-probe0.mitigated)/SHEET.statProbe)};});
  attribution.push({classId,spec,level,path,gear:SHEET.attributionGear,dps:round(base.dps),gearShare:pct(base.dps/Math.max(1,bare.dps)-1),talents:quick?talents.slice(0,3):talents,stats,skills:base.skills.map(s=>({name:s.name,share:round(s.share)}))});}
 return {rows,attribution};
}
/** Teile zusammenführen: Abweichung vom Median je Stufe × Ausrüstung – die Zahl, auf die alle Specs zulaufen sollen.
 *  Je Rollengruppe eigener Median; Stufe 1 hat noch keine Spezialisierung und läuft außer Wertung. */
function assemble(parts){
 const rows=parts.flatMap(p=>p.rows),attribution=parts.flatMap(p=>p.attribution);
 for(const level of new Set(rows.map(r=>r.level)))for(const g of new Set(rows.map(r=>r.gear)))for(const group of Object.keys(METRIC)){const key=METRIC[group].key,cell=rows.filter(r=>r.level===level&&r.gear===g&&r.group===group),med=[...cell.map(r=>r[key])].sort((a,b)=>a-b)[cell.length>>1]||1;for(const r of cell){r.metric=r[key];r.vsMedian=pct(r[key]/med-1);r.flag=level>=BALANCE.player.specLevel&&Math.abs(r[key]/med-1)>SHEET.flag;}}
 return {date:new Date().toISOString().slice(0,10),rules:SHEET,rows,attribution};
}
/** Das ganze Raster plus Zerlegung in einem Thread (Tests). `quick` misst weniger Stufen und Pfade. */
export function buildSheet(opts={}){return assemble(specsOf().map(s=>specPart(s,opts)));}
/** Dasselbe parallel: ein Worker je Spezialisierung. */
export function buildSheetParallel(opts={}){
 return Promise.all(specsOf().map(s=>new Promise((resolve,reject)=>{const w=new Worker(new URL(import.meta.url),{workerData:{spec:s,opts}});w.once('message',resolve);w.once('error',reject);w.once('exit',code=>code&&reject(new Error(s.spec+': Worker-Ende '+code)));}))).then(assemble);
}
if(!isMainThread&&workerData?.spec)parentPort.postMessage(specPart(workerData.spec,workerData.opts));

function markdown(sheet){const L=[],gearName={none:'Startausrüstung',uncommon:'ungewöhnlich',rare:'selten',epic:'episch'},groupName={dps:'Schaden',heal:'Heilung',tank:'Tank'};
 L.push('# Balance-Sheet','',`Automatisch erzeugt von \`npm run balance:sheet\` · ${sheet.date} · ${SHEET.seconds} s Übungskampf, jede Zelle und jede Zerlegung als Mittel aus Boss (${SHEET.foe.boss}× Feldleben) und Feldgruppe (drei Gegner mit Umland-Leben); gefallene Gegner ersetzt sofort ein neuer (Kill-Talente zählen), Zufall mit ${SHEET.seeds.length} festen Startwerten gemittelt, gemeinsame Prioritäten-Rotation (Heiler heilen zuerst), Puppen treffen jede Sekunde mit ${pct(SHEET.incoming)} % des Grundlebens. Voller Ausrüstungssatz auf Charakterstufe (Werteprofile im Wechsel); „Startausrüstung“ = Flasche, Topfdeckel, Schleuder, Kutte. Talentpfad 0–2 über \`pathBuild\`, Stufe 1 ohne Spezialisierung.`,'',
  'Jede Rolle misst sich an ihrer Kennzahl: **Schaden** → Schaden/s, **Heilung** → Heilung/s (Ausstoß inkl. Überheilung; dahinter „eff.“ = tatsächlich geheilt, ohne Überheilung – ⚑ und Median bleiben am Ausstoß), **Tank** → Schutz/s (verhinderter Schaden + Deckung). Zelle: Kennzahl (Abweichung vom Median der Rolle auf dieser Stufe × Ausrüstung). ⚑ = mehr als '+pct(SHEET.flag)+' % daneben (ab Stufe '+BALANCE.player.specLevel+').','');
 const levels=[...new Set(sheet.rows.map(r=>r.level))],gears=[...new Set(sheet.rows.map(r=>r.gear))];
 const flags=sheet.rows.filter(r=>r.flag);L.push('## Überblick','',`${flags.length} von ${sheet.rows.filter(r=>r.level>=BALANCE.player.specLevel).length} Messungen liegen mehr als ${pct(SHEET.flag)} % neben dem Median ihrer Rolle.`,'');
 for(const g of gears){L.push('## Ausrüstung: '+gearName[g],'');
  for(const group of Object.keys(METRIC)){const specs=[...new Set(sheet.rows.filter(r=>r.group===group).map(r=>r.spec))];if(!specs.length)continue;
   L.push('### '+groupName[group]+' · '+METRIC[group].label,'','| Spezialisierung | Pfad | '+levels.map(l=>'Stufe '+l).join(' | ')+' |','|---|---|'+levels.map(()=>'---:').join('|')+'|');
   for(const spec of specs)for(const path of SHEET.paths.filter(p=>sheet.rows.some(r=>r.spec===spec&&r.path===p))){const cells=levels.map(l=>{const r=sheet.rows.find(x=>x.gear===g&&x.spec===spec&&x.level===l&&(x.path===path||x.path==null));return r?`${Math.round(r.metric)} (${r.vsMedian>0?'+':''}${r.vsMedian} %)${r.flag?' ⚑':''}${group==='heal'&&r.hpsEff!=null?' · eff. '+Math.round(r.hpsEff):''}`:'–';});
    L.push(`| ${spec} | ${path} | ${cells.join(' | ')} |`);}
   L.push('');}}
 L.push('## Zerlegung (je Pfad, Ausrüstung '+gearName[SHEET.attributionGear]+')','');
 for(const a of sheet.attribution){L.push(`### ${a.spec} · Pfad ${a.path} · Stufe ${a.level} ·${Math.round(a.dps)} Schaden/s · Ausrüstung +${a.gearShare} % gegenüber Startausrüstung`,'',
  '**Wert je Punkt:** '+a.stats.map(s=>`${s.name} ${s.dpsPerPoint} Schaden/s${s.hpsPerPoint?' · '+s.hpsPerPoint+' Heilung/s':''}${s.mitigatedPerPoint?' · '+s.mitigatedPerPoint+' verhindert/s':''}`).join(' · '),'',
  '**Kniffe (Anteil am Schaden):** '+a.skills.map(s=>`${s.name} ${s.share} %`).join(' · '),'',
  '**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** '+a.talents.map(t=>t.bound?`${t.name} gebunden`:`${t.name} ${t.dps>0?'+':''}${t.dps} %`).join(' · '),'');}
 return L.join('\n');}
function csv(sheet){const head=['klasse','spec','rolle','gruppe','pfad','stufe','ausruestung','schaden_s','schaden_einzelziel_s','schaden_drei_ziele_s','heilung_s','verhindert_s','deckung_s','schutz_s','kennzahl','abweichung_median_pct','randale_avg','heilung_effektiv_s'];
 return [head.join(';'),...sheet.rows.map(r=>[r.classId,r.spec,r.role,r.group,r.path??'kern',r.level,r.gear,r.dps,r.dpsSingle,r.dpsGroup,r.hps,r.mitigated,r.shield,r.protection,r.metric,r.vsMedian,r.energy,r.hpsEff].join(';'))].join('\n')+'\n';}

if(isMainThread&&process.argv[1]===fileURLToPath(import.meta.url)){
 const quick=process.argv.includes('--quick'),buffs=process.argv.includes('--buffs'),attribution=!buffs&&!process.argv.includes('--rows'),t0=Date.now(),sheet=await buildSheetParallel({quick,attribution,buffs});
 mkdirSync(new URL('../generated/',import.meta.url),{recursive:true});
 if(buffs){writeFileSync(new URL('../generated/balance-sheet-buffs.json',import.meta.url),JSON.stringify(sheet,null,1));writeFileSync(new URL('../generated/balance-sheet-buffs.csv',import.meta.url),csv(sheet));console.log('mit Klassen-Buffs: '+sheet.rows.length+' Messzeilen, '+sheet.rows.filter(r=>r.flag).length+' ⚑ · '+Math.round((Date.now()-t0)/1000)+' s');process.exit(0);}
 writeFileSync(new URL('../generated/balance-sheet.json',import.meta.url),JSON.stringify(sheet,null,1));
 writeFileSync(new URL('../generated/balance-sheet.csv',import.meta.url),csv(sheet));
 writeFileSync(new URL('../content/BALANCE-SHEET.md',import.meta.url),markdown(sheet)+'\n');
 console.log(`${sheet.rows.length} Messzeilen, ${sheet.attribution.length} Zerlegungen, ${sheet.rows.filter(r=>r.flag).length} ⚑ · ${Math.round((Date.now()-t0)/1000)} s`);
}
