// E-72 Bilder (npm run e72:bilder): Talentraster der neuen Klassen, Einzelbilder für getauschte alte Talente, gemalte Kniffe.
// Alles offline: kein Imagegen, keine Datei wird geschrieben (Quellen werden über exists/read untergeschoben).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {CLASS_SPECS,TALENT_ROWS,TALENT_CELLS} from '../content/talents.js';
import {buildTalentArt,talentSheetPath,talentOverridePath,checkTalentSheet,checkTalentIcon} from '../tools/class-visuals/build-talents.mjs';
import {sheetJobs,singleJobs,SINGLES,SHEET_JOBS,SINGLE_JOBS,E32_HEAD,NEW_CLASSES} from '../tools/sprite-pipeline/e72-talente-auftraege.mjs';
import {planBlocks,runPlan,isQuotaError,quotaHint,checkKniffTile,main,KNIFF_FIRST,KNIFF_JOBS,GENERATION} from '../tools/sprite-pipeline/e72-bilder.mjs';
import {paintedIds,IDS,DIR,iconPng} from '../tools/sprite-pipeline/e71-kniffe-draw.mjs';
import {encodePng,surface} from '../tools/sprite-pipeline/png.mjs';
import {e32Art,paintE32Talent} from '../e32-art.js';
const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root)),json=p=>JSON.parse(read(p)),sha=b=>createHash('sha256').update(b).digest('hex');
const isNew=p=>NEW_CLASSES.some(m=>p.includes('/'+m+'-')||p.includes('talents-'+m));
// Stand „vor dem Imagegen-Lauf“, auch wenn die Raster später im Repo liegen: neue Quellen und Einzelbilder ausblenden.
const before={exists:p=>existsSync(new URL(p,root))&&!isNew(p)&&!p.includes('/einzeln/'),read};
let baseline;const base=()=>baseline||=buildTalentArt(before);

// Freigestelltes Einzelmotiv (Scheibe mit Rand) auf großem durchsichtigem Grund, wie Imagegen es liefern soll.
function fakeIcon(size=600){const im=surface(size,size),c=size/2,r=size*.3;for(let y=0;y<size;y++)for(let x=0;x<size;x++){const d=Math.hypot(x-c,y-c);if(d<r)im.data.set(d>r-18?[23,31,41,255]:[211,168,86,255],(y*size+x)*4);}return encodePng(im);}
const opaque=(w,h)=>{const im=surface(w,h);for(let i=0;i<w*h;i++)im.data.set([60,90,70,255],i*4);return encodePng(im);};

test('ohne gemaltes Raster: build-talents läuft durch, Schorsch und Käthe bleiben beim gezeichneten Ersatz-Icon',()=>{
 const {files,catalog}=base();
 assert.equal(Object.keys(catalog.talents).length,270);
 assert.ok(!Object.keys(catalog.talents).some(id=>NEW_CLASSES.some(m=>id.startsWith(m+'-'))));
 assert.ok(![...files.keys()].some(p=>/talents-(schorsch|kaethe)\.png$/.test(p)),'kein leerer Atlas für Klassen ohne Raster');
 // Laufzeit: ohne Katalogeintrag meldet paintE32Talent „nicht gemalt“, talent-art.js fällt auf paintVocabTalent zurück.
 const src=read('talent-art.js').toString(),motif=src.slice(src.indexOf('function paintTalentMotif'));
 assert.ok(motif.indexOf('paintE32Talent(canvas,id)')<motif.indexOf('paintVocabTalent('),'gemalt (Katalog) vor gezeichnet (Vokabular)');
});

// Frischer Prozess: precisionColor hat einen prozessweiten Farbcache – nur so zeigt sich, ob Neues (neue Klasse, Einzelbild)
// die Farben der vorhandenen Bilder verschiebt. Das Kind baut mit untergeschobenen Quellen und meldet Katalog + Datei-Hashes.
function buildInFreshProcess(){
 const code=`import {buildTalentArt,talentSheetPath,talentOverridePath} from './tools/class-visuals/build-talents.mjs';
import {encodePng,surface} from './tools/sprite-pipeline/png.mjs';import {readFileSync,existsSync} from 'node:fs';import {createHash} from 'node:crypto';
const size=600,im=surface(size,size),c=size/2,r=size*.3;for(let y=0;y<size;y++)for(let x=0;x<size;x++){const d=Math.hypot(x-c,y-c);if(d<r)im.data.set(d>r-18?[23,31,41,255]:[211,168,86,255],(y*size+x)*4);}
const icon=encodePng(im),sheet=talentSheetPath('schorsch-chef'),single=talentOverridePath('dieter-wall-12');
const hidden=p=>/\\/(schorsch|kaethe)-|talents-(schorsch|kaethe)|\\/einzeln\\//.test(p);
const {files,catalog}=buildTalentArt({exists:p=>p===sheet||p===single||(existsSync(p)&&!hidden(p)),read:p=>p===sheet?readFileSync(talentSheetPath('dieter-wall')):p===single?icon:readFileSync(p)});
console.log(JSON.stringify({catalog,files:Object.fromEntries([...files].map(([p,b])=>[p,createHash('sha256').update(b).digest('hex')])),icon:createHash('sha256').update(icon).digest('hex')}));`;
 const r=spawnSync(process.execPath,['--input-type=module','-e',code],{cwd:fileURLToPath(root),encoding:'utf8',maxBuffer:64*1024*1024});
 assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);
}

test('gemaltes Raster einer neuen Klasse und Einzelbild eines alten Talents werden eingebaut, Vorhandenes bleibt byte-gleich',()=>{
 const sheet=talentSheetPath('schorsch-chef'),single=talentOverridePath('dieter-wall-12'),{catalog,files,icon}=buildInFreshProcess();
 const b=json('assets/content-art/e32/runtime/catalog.json'),atlas='assets/content-art/e32/runtime/talents-schorsch.png';
 assert.ok(files[atlas]);assert.equal(Object.keys(catalog.talents).length,300);
 assert.deepEqual(catalog.skills,b.skills,'Kniff-Motive (skills.png) unverändert');assert.equal(files['assets/content-art/e32/runtime/skills.png'],sha(read('assets/content-art/e32/runtime/skills.png')));
 for(const m of ['baerbel','kevin']){const p='assets/content-art/e32/runtime/talents-'+m+'.png';assert.equal(files[p],sha(read(p)),p+' unverändert');}
 for(const [i,t] of TALENT_ROWS['schorsch-chef'].entries()){const a=catalog.talents['schorsch-chef-'+i],cell=TALENT_CELLS['schorsch-chef'][i];
  assert.equal(a.atlas,atlas);assert.equal(a.name,t.name);assert.equal(a.x,cell.row*64);assert.equal(a.y,cell.path*64);assert.equal(a.source,sheet);}
 assert.ok(!catalog.talents['schorsch-flamme-0']&&!catalog.talents['kaethe-grand-0'],'Spezialisierungen ohne Raster bleiben beim Ersatz-Icon');
 const o=catalog.talents['dieter-wall-12'];assert.equal(o.source,single);assert.equal(o.sheet,talentSheetPath('dieter-wall'));assert.notEqual(o.sha256,b.talents['dieter-wall-12'].sha256);
 assert.ok(o.bounds.x>=2&&o.bounds.y>=2&&o.bounds.x+o.bounds.w<=62&&o.bounds.y+o.bounds.h<=62);
 assert.ok(catalog.sources.some(s=>s.source===single&&s.talent==='dieter-wall-12'&&s.sha256===icon));
 for(const [id,a] of Object.entries(b.talents))if(id!=='dieter-wall-12')assert.equal(catalog.talents[id].sha256,a.sha256,id+' darf sich durch Neues nicht verfärben');
 // Laufzeit: sobald der Katalog das Talent kennt, malt paintE32Talent es (vor jedem Ersatz).
 const drawn=[],canvas={width:48,height:48,dataset:{},getContext:()=>({clearRect(){},drawImage:(...a)=>drawn.push(a)})};
 const keep={catalog:e32Art.catalog,images:e32Art.images};e32Art.catalog=catalog;e32Art.images=new Map([[atlas,{}]]);
 try{assert.ok(paintE32Talent(canvas,'schorsch-chef-0'));assert.equal(canvas.dataset.talentCell,'e32:schorsch-chef-0');assert.ok(!paintE32Talent(canvas,'kaethe-grand-0'));}
 finally{Object.assign(e32Art,keep);}
});

test('Prüfung frischer Originale: brauchbares Raster und Einzelbild gehen durch, gemalter Hintergrund nicht',()=>{
 assert.deepEqual(checkTalentSheet(read(talentSheetPath('kevin-hunt'))),[]);
 assert.ok(checkTalentSheet(opaque(1536,1280)).length);assert.ok(checkTalentSheet(fakeIcon()).length,'quadratisch ist kein 6×5-Raster');
 assert.deepEqual(checkTalentIcon(fakeIcon()),[]);assert.ok(checkTalentIcon(opaque(600,600)).length);
 assert.deepEqual(checkKniffTile(iconPng('skill-kevin-reload')),[]);assert.ok(checkKniffTile(fakeIcon()).length,'freigestelltes Motiv ist keine deckende Kachel');
 assert.ok(checkKniffTile(encodePng(surface(10,10))).length,'leeres Bild');
});

test('Auftragsblatt Talentraster: E-32-Format, sechs Spezialisierungen, Reihenfolge wie TALENT_ROWS',()=>{
 const jobs=json(SHEET_JOBS),specs=NEW_CLASSES.flatMap(m=>CLASS_SPECS[m]||[]);
 assert.deepEqual(jobs.map(j=>j.spec),specs);assert.equal(jobs.length,6);
 for(const j of jobs){
  assert.equal(j.id,'talente-'+j.spec);assert.equal(j.output,talentSheetPath(j.spec));assert.equal(j.width,1536);assert.equal(j.height,1280);
  assert.ok(j.prompt.startsWith(E32_HEAD)&&j.prompt.includes('This sheet is '+j.spec));
  for(const r of j.references){assert.match(r,/^assets\/content-art\/e32\/sources\/(dieter|baerbel|kevin)-[a-z]+-v1\.png$/);assert.ok(existsSync(new URL(r,root)),r);}
  assert.deepEqual(j.entries.map(e=>e.id),Array.from({length:30},(_,i)=>j.spec+'-'+i));
  const lines=j.prompt.split('\n').slice(1);assert.equal(lines.length,30);lines.forEach((l,i)=>assert.ok(l.startsWith((i+1)+'. '+j.entries[i].name+':'),l));
 }
 // Frisch aus dem Inhalt erzeugt stimmen Namen, Zellen und Proc-Looks immer; e72-bilder schreibt das Blatt vor dem Lauf neu.
 for(const j of sheetJobs())j.entries.forEach((e,i)=>{assert.equal(e.name,TALENT_ROWS[j.spec][i].name);assert.deepEqual({row:e.row,path:e.path},TALENT_CELLS[j.spec][i]);});
 assert.ok(sheetJobs().some(j=>j.entries.some(e=>e.look)),'Proc-Looks fließen als Motiv ein');
});

test('Auftragsblatt Einzel-Talente: jedes Ziel ist ein getauschtes altes Talent mit eigenem Raster als Stilvorlage',()=>{
 const jobs=json(SINGLE_JOBS);assert.equal(jobs.length,SINGLES.length);
 for(const j of jobs){
  const [m]=j.talent.split('-');assert.ok(['dieter','baerbel','kevin'].includes(m));
  assert.equal(j.output,talentOverridePath(j.talent));assert.deepEqual(j.references,[talentSheetPath(j.spec)]);assert.equal(j.width,64);assert.equal(j.height,64);
  assert.equal(TALENT_ROWS[j.spec][j.index].name,j.name,j.talent+': Auftragsblatt veraltet – node tools/sprite-pipeline/e72-talente-auftraege.mjs');
  assert.ok(j.prompt.includes(j.name)&&j.prompt.includes('ONE single icon'));
 }
 assert.equal(singleJobs().length,jobs.length);
});

test('Plan: Status je Auftrag, schwächste Kniffe zuerst, gemalte Kniffe werden übersprungen',()=>{
 const kn=json(KNIFF_JOBS),painted=kn[5].output,files=new Set([...kn.map(j=>j.output),talentSheetPath('schorsch-chef')]);
 const io={exists:p=>files.has(p),hash:p=>'h:'+p,json:p=>p===GENERATION?{records:[{output:painted,sourceHash:'h:'+painted},{output:kn[6].output,sourceHash:'alt'}]}:null};
 const blocks=planBlocks({io,sheets:{[SHEET_JOBS]:sheetJobs(),[SINGLE_JOBS]:singleJobs(),[KNIFF_JOBS]:kn}});
 assert.deepEqual(blocks.map(b=>b.key),['raster','einzeln','kniffe']);
 assert.equal(blocks[0].jobs.find(j=>j.id==='talente-schorsch-chef').status,'vorhanden');assert.equal(blocks[0].jobs.filter(j=>j.status==='fehlt').length,5);
 assert.ok(blocks[1].jobs.every(j=>j.status==='fehlt'));
 assert.deepEqual(blocks[2].jobs.slice(0,3).map(j=>j.id),KNIFF_FIRST);
 assert.equal(blocks[2].jobs.find(j=>j.output===painted).status,'gemalt');assert.equal(blocks[2].jobs.find(j=>j.id===kn[6].id).status,'gezeichnet','Herkunft mit falschem Hash zählt nicht');
});

const fakeBlocks=()=>[
 {key:'raster',title:'R',build:[],jobs:[{id:'r1',status:'fehlt'},{id:'r2',status:'vorhanden'},{id:'r3',status:'fehlt'}]},
 {key:'einzeln',title:'E',build:[],jobs:[{id:'e1',status:'fehlt'},{id:'e2',status:'fehlt'}]},
 {key:'kniffe',title:'K',build:[],jobs:[{id:'k1',status:'gezeichnet'},{id:'k2',status:'gemalt'}]}];
const quiet=()=>{};

test('Lauf: Kontingentende mittendrin baut Fertiges ein und nennt, was fehlt',()=>{
 const calls=[],built=[],quota="You've hit your usage limit. Upgrade to Pro or try again at Sep 26th, 2026 9:21 PM.";
 const r=runPlan(fakeBlocks(),{generate:(b,j)=>{calls.push(j.id);if(calls.length===3)throw Error('Kein Bild erzeugt.\n'+quota);},check:()=>[],reject:()=>assert.fail(),accept:()=>{},build:b=>{built.push(b.key);return true;},log:quiet});
 assert.deepEqual(calls,['r1','r3','e1'],'Fertiges (vorhanden/gemalt) wird nie angefordert');
 assert.deepEqual(built,['raster']);assert.equal(r.quota,'Sep 26th, 2026 9:21 PM');
 assert.deepEqual(r.missing.map(m=>m.id),['e1','e2','k1']);assert.ok(r.missing.every(m=>m.reason==='Kontingent erschöpft'));
});

test('Lauf: abgelehntes Original wird nicht eingebaut, fehlende Voraussetzung stoppt sofort',()=>{
 const rejected=[],built=[];
 let r=runPlan(fakeBlocks(),{generate:()=>{},check:(b,j)=>j.id==='r1'?['kaum durchsichtiger Grund']:[],reject:(b,j)=>rejected.push(j.id),accept:()=>{},build:b=>{built.push(b.key);return true;},log:quiet});
 assert.deepEqual(rejected,['r1']);assert.deepEqual(built,['raster','einzeln','kniffe']);assert.equal(r.made.length,4);assert.deepEqual(r.missing.map(m=>m.id),['r1']);
 const calls=[];r=runPlan(fakeBlocks(),{generate:(b,j)=>{calls.push(j.id);throw Error('Kein vollständiger Codex gefunden');},check:()=>[],reject:()=>{},accept:()=>{},build:()=>true,log:quiet});
 assert.deepEqual(calls,['r1']);assert.equal(r.missing.length,5);assert.match(r.stopped,/Voraussetzung/);
});

test('Kontingent-Erkennung und Trockenlauf ohne Imagegen',()=>{
 assert.ok(isQuotaError("ERROR: You've hit your usage limit. Try again at Sep 26th, 2026 9:21 PM."));assert.equal(quotaHint('… try again at Sep 26th, 2026 9:21 PM.'),'Sep 26th, 2026 9:21 PM');
 assert.ok(!isQuotaError('Kein Bild erzeugt.\nDas Bild konnte nicht gespeichert werden.'));
 const log=console.log;const out=[];console.log=(...a)=>out.push(a.join(' '));
 try{assert.equal(main(['--dry'],{generate:()=>assert.fail('Trockenlauf darf kein Bild anfordern')}),0);}finally{console.log=log;}
 assert.ok(out.join('\n').includes('Summe:'));
});

test('Vorrang gemalt vor gezeichnet: das Zeichenwerkzeug erkennt Imagegen-Originale am Hash',()=>{
 const id=IDS[0],output=DIR+id+'.png',bytes=read(output);
 assert.deepEqual([...paintedIds([{output,sourceHash:sha(bytes)}],read)],[id]);
 assert.equal(paintedIds([{output,sourceHash:'veraltet'}],read).size,0);
 assert.equal(paintedIds(json(GENERATION).records,read).size,IDS.filter(i=>json(GENERATION).records.some(r=>r.output===DIR+i+'.png')).length);
});
