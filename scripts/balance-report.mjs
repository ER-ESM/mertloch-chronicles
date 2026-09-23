// Balance-Matrix: Zeit bis zum Kill (TTK) und verlorenes Leben je Klasse × Gegner × Stufe.
// Stehender Kampf mit derselben Prioritäten-Rotation wie das Balance-Sheet (scripts/balance-rotation.mjs), echte Zauber, kein Ausweichen, keine Verpflegung – misst Stärkeverhältnisse, nicht Spielspaß.
// Aufruf: node scripts/balance-report.mjs [--json]  → schreibt content/BALANCE-REPORT.md (+ generated/balance-report.json).
import {mkdirSync,writeFileSync} from 'node:fs';
import {Game} from '../engine.js';import {makeEnemy,scaledStats} from '../encounters.js';import {rng} from '../world.js';import {ITEMS,addItem,equipItem} from '../rpg.js';import {registerRoll} from '../itemization.js';import {available} from '../progression.js';import {TALENTS,learnTalent,classSpecs} from '../talents.js';import {rotate} from './balance-rotation.mjs';
import {ARCHETYPES,ELITES,BOSSES,BALANCE,xpToNext,TUNING} from '../content/index.js';
const arena=()=>({id:'balance',seed:1,spawn:{x:-5000,y:-5000},npc:{x:-5000,y:-5000},landmarks:[],quests:[],camps:[],blocked:()=>false,lineClear:()=>true,findClear:(x,y)=>({x,y}),findPath:(a,b)=>[{...b}]});
const LEVELS=[1,3,6,10,15],CLASSES=['dieter','baerbel','kevin'],ENEMIES={...ARCHETYPES,...ELITES,...BOSSES};
// Jeder Gegner wird zusätzlich auf seiner eigenen Stufe gemessen – sonst fehlt genau die Zeile, die der Korridor meint
// (Sperrmüll-Sigi Stufe 5 und Trauzeuge Timo Stufe 7 lagen in keiner der festen Stufen).
const levelsFor=def=>[...new Set([...LEVELS,def.level||1])].sort((a,b)=>a-b);
// Korridor auf der eigenen Stufe (content/README.md): [min,max] Sekunden.
const CORRIDOR={field:[4,12],elite:[8,24],boss:[10,25]};
function player(classId,level,seed){const g=new Game(arena(),{classId,level});g.random=rng(seed);g.player.x=g.player.y=0;g.player.inCombat=7;if(level>=2){g.rpg.talents.spec=classSpecs(classId)[seed%3];g.rpg.talentBuilds[classId]=g.rpg.talents;g.refreshStats();for(const t of TALENTS[g.rpg.talents.spec])learnTalent(g,t.id);}for(const slot of ['weapon','ranged','body','feet','charm']){const id=registerRoll(g.rpg,ITEMS,{slot,spec:['tresen','bass','pfand'][seed%3],level,quality:level>=6?'rare':'uncommon',roll:500});addItem(g.rpg,id);equipItem(g,id);}g.player.hp=g.player.maxHp;return g;}
function fight(classId,level,def,seed){const g=player(classId,level,seed),e=makeEnemy({x:classId==='dieter'?30:120,y:0},1,{...def,aggro:true,ai:'combat',bossId:def.id});g.enemies=[e];g.target=e;const hp0=g.player.hp;let steps=0;
 while(e.hp>0&&!g.dead&&steps++<6000){const p=g.player,ready=id=>available(g,id)&&g.cooldowns[id]===0;if(e.cast?.interruptible&&ready('interrupt'))g.action('interrupt');if(!g.casting&&g.gcd<=0)rotate(g,{healAt:.5});g.tick(.05);}
 return {ttk:+g.time.toFixed(1),dead:g.dead,lost:Math.round((hp0-g.player.hp)/hp0*100)};}
const rows=[];for(const [id,def] of Object.entries(ENEMIES))for(const level of levelsFor(def)){if(level<(def.level||1)-2)continue;const row={enemy:id,name:def.name,enemyLevel:def.level||1,level,boss:def.type==='boss',elite:!!def.elite,tuned:!!TUNING.enemies[id]};for(const c of CLASSES){const runs=[1,2,3].map(seed=>fight(c,level,def,seed));row[c]={ttk:+(runs.reduce((n,r)=>n+r.ttk,0)/3).toFixed(1),lost:Math.round(runs.reduce((n,r)=>n+r.lost,0)/3),deaths:runs.filter(r=>r.dead).length};}rows.push(row);}
const corridor=row=>CORRIDOR[row.boss?'boss':row.elite?'elite':'field'];
// Zweiter Lauf: die Engine lässt Feldgegner im Umland mit der Spielerstufe wachsen (encounters.scaledStats).
// Ohne diesen Lauf misst der Bericht Gegner, die so nur im Dorfkern stehen – und meldet trivial, wo keiner mehr trivial ist.
const FIELD=Object.entries(ARCHETYPES).filter(([,def])=>!def.chapter),FIELD_IDS=new Set(FIELD.map(([id])=>id));
const wild=[];for(const [id,def] of FIELD)for(const level of LEVELS){if(level<(def.level||1))continue;
 const scaled={...def,...scaledStats(def,level,true)};
 const row={enemy:id,name:def.name,enemyLevel:def.level||1,level,boss:false,elite:!!def.elite,tuned:!!TUNING.enemies[id],hp:scaled.hp};
 for(const c of CLASSES){const runs=[1,2,3].map(seed=>fight(c,level,scaled,seed));row[c]={ttk:+(runs.reduce((n,r)=>n+r.ttk,0)/3).toFixed(1),lost:Math.round(runs.reduce((n,r)=>n+r.lost,0)/3),deaths:runs.filter(r=>r.dead).length};}
 wild.push(row);}
const flag=(row,c)=>{const r=row[c];if(r.deaths===3)return '☠';if(r.deaths)return '⚠';if(row.level>=row.enemyLevel+3&&r.ttk<2.5)return '·';
 if(row.level===row.enemyLevel){const [lo,hi]=corridor(row);if(r.ttk>hi)return '⏳';if(r.ttk<lo)return '⚡';}
 if(row.level<=row.enemyLevel&&r.ttk>25&&!row.boss)return '⏳';return '';};
const cell=(row,c)=>`${row[c].ttk} s / −${row[c].lost} % ${flag(row,c)}`.trim();
const md=['# Balance-Bericht','',`Automatisch erzeugt von \`node scripts/balance-report.mjs\` · ${new Date().toISOString().slice(0,10)} · stehender Kampf, 3 Seeds je Zelle, fünf repräsentative Ausrüstungsteile der Stufe einschließlich Fernkampfplatz (ab Stufe 6 selten), keine vollständige Bestückung aller 16 Plätze, alle Talente der Spezialisierung Seed % 3.`,'',`Lesart: **Zeit bis zum Kill / verlorenes Leben**. ☠ = stirbt in allen Läufen, ⚠ = stirbt manchmal, ⏳ = über dem Korridor auf eigener Stufe (zäh), ⚡ = unter dem Korridor auf eigener Stufe (zu schnell), · = unter 2,5 s drei Stufen darüber (trivial). \* = Wert über \`content/tuning.js\` korrigiert (Fußnote unten). Korridor auf eigener Stufe: Feld ${CORRIDOR.field.join('–')} s, Elite ${CORRIDOR.elite.join('–')} s, Boss ${CORRIDOR.boss.join('–')} s. EP je Stufe: ${BALANCE.xpPerLevel} × Stufe (Stufe 6 = ${Array.from({length:5},(_,i)=>xpToNext(i+1)).reduce((a,b)=>a+b)} EP gesamt).`,'','| Gegner (St.) | Spielerstufe | Dieter | Bärbel | Kevin |','|---|---:|---|---|---|',...rows.map(r=>`| ${r.name}${r.tuned?' \*':''} (${r.enemyLevel}) | ${r.level} | ${cell(r,'dieter')} | ${cell(r,'baerbel')} | ${cell(r,'kevin')} |`),'','## Auffälligkeiten',''];
const notes=[];for(const r of rows)for(const c of CLASSES){const f=flag(r,c),[lo,hi]=corridor(r);if(f==='☠'&&r.level>=r.enemyLevel+2)notes.push(`- ${r.name} tötet ${c} auf Stufe ${r.level} in jedem Lauf, obwohl der Spieler zwei Stufen darüber liegt.`);if(f==='⚠'&&!r.boss&&!r.elite)notes.push('- '+r.name+' tötet '+c+' auf Stufe '+r.level+' in '+r[c].deaths+' von 3 Läufen – ein Feldgegner darf das nicht.');if(f==='·'&&!FIELD_IDS.has(r.enemy))notes.push(`- ${r.name} fällt für ${c} auf Stufe ${r.level} in unter 2,5 s – kaum noch eine Begegnung.`);if(f==='⏳')notes.push(`- ${r.name} braucht für ${c} auf Stufe ${r.level} ${r.level===r.enemyLevel?r[c].ttk+' s statt höchstens '+hi+' s':'über 25 s'} – zäh.`);if(f==='⚡')notes.push(`- ${r.name} fällt für ${c} auf eigener Stufe in ${r[c].ttk} s statt mindestens ${lo} s – zu schnell für den Korridor.`);}
const tuned=Object.entries(TUNING.enemies);
const tuneLine=([id,patch])=>{const {why,since,...vals}=patch;return '- \* `'+id+'` ('+(ENEMIES[id]?.name||'?')+'): '+Object.entries(vals).map(([k,v])=>k+' = '+JSON.stringify(v)).join(', ')+' · '+why+' · seit '+since;};
const wildNotes=[];for(const r of wild)for(const c of CLASSES){const f=flag(r,c);if(f==='·')wildNotes.push('- '+r.name+' fällt für '+c+' auf Stufe '+r.level+' auch im Umland in unter 2,5 s.');}
md.push(...(notes.length?notes:['- Keine. Alle Zellen liegen im erwarteten Korridor.']),'','## Umland: Feldgegner mit Spielerstufen-Skalierung','',
 'Dieselben Arten, wie sie jenseits von `SPAWN_TABLES.tierDistance` wirklich erscheinen: `encounters.scaledStats` hebt Leben und Schaden auf (Spielerstufe − `BALANCE.enemies.playerLead`). Der Dorfkern bleibt auf den Werten der Haupttabelle – deshalb steht die Triviality-Frage (`·`) für diese Arten nur hier und nicht oben.','',
 '| Gegner (St.) | Spielerstufe | Leben | Dieter | Bärbel | Kevin |','|---|---:|---:|---|---|---|',
 ...wild.map(r=>'| '+r.name+' ('+r.enemyLevel+') | '+r.level+' | '+r.hp+' | '+cell(r,'dieter')+' | '+cell(r,'baerbel')+' | '+cell(r,'kevin')+' |'),
 '',...(wildNotes.length?wildNotes:['- Keine Art fällt im Umland unter 2,5 s.']),
 '','## Tuning-Korrekturen','',
 ...(tuned.length?tuned.map(tuneLine):['- Keine. Alle Gegnerwerte stehen unverändert in `content/enemies.js`.']),
 '','Die Fachrolle pflegt diese Zeilen bei Gelegenheit in die Definition ein und löscht sie aus `content/tuning.js`.','','Grenzen: keine Ausweichbewegung, kein Kiting, kein Positionsspiel, keine Verpflegung. Bosse und Elite sollen ohne Ausweichen tödlich sein; Feldgegner nicht.');
writeFileSync('content/BALANCE-REPORT.md',md.join('\n')+'\n');if(process.argv.includes('--json')){mkdirSync('generated',{recursive:true});writeFileSync('generated/balance-report.json',JSON.stringify(rows,null,1));}
console.table(rows.map(r=>({enemy:r.name,lvl:r.level,dieter:cell(r,'dieter'),baerbel:cell(r,'baerbel'),kevin:cell(r,'kevin')})));console.log(notes.length+' Auffälligkeiten → content/BALANCE-REPORT.md');
