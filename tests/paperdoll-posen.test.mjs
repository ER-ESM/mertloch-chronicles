// Anziehpuppe: Kampf- und Aktionsposen (E-58). Prüft die Laufzeit-Bögen (assets/paperdoll/runtime), die Zuordnung
// Spielpose → Bild (paperdoll-art.js) gegen redesignPose und die Skelettposen aus tools/paperdoll/puppe.mjs (ohne Browser).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,openSync,readSync,closeSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {paperdollPose,paperdollFrameFor,PAPERDOLL_POSE_FRAMES} from '../paperdoll-art.js';
import {redesignPose} from '../redesign-art.js';
import {FRAMES,ARCH,LOOK,ACTS,KIT,pose} from '../tools/paperdoll/puppe.mjs';
import {sheetReader} from './paperdoll-sheet.mjs';

// PAPERDOLL_RT=<ordner> prüft einen Probebau statt assets/paperdoll/runtime
const RT=process.env.PAPERDOLL_RT?pathToFileURL(resolve(process.env.PAPERDOLL_RT)+'/'):new URL('../assets/paperdoll/runtime/',import.meta.url);
const cat=JSON.parse(readFileSync(new URL('catalog.json',RT),'utf8')),sheets=sheetReader(RT,cat);
/** Spalten beider Bögen aus den PNG-Köpfen (Dateinamen wie sheetReader, ohne alles zu dekodieren). */
const cols=(src,arch,dir)=>{const w=f=>{const fd=openSync(new URL(f,RT),'r'),b=Buffer.alloc(24);readSync(fd,b,0,24,0);closeSync(fd);return b.readUInt32BE(16);};
 const split=sheets.split;return w(sheets.file(src,arch,dir,0))/cat.W+(split<cat.frames.length?w(sheets.file(src,arch,dir,split))/cat.W:0);};
const NEW=[['hieb',0],['hieb',1],['hieb',2],['hieb2',0],['hieb2',1],['hieb2',2],['getroffen',0],['parade',0],['parade2',0],['zaubern',0],['rasten',0],['sprint',0],['zielen',0],['schuss',0]];
const at=(anim,i=0)=>cat.frames.findIndex(f=>f.anim===anim&&(f.i||0)===i);

test('Katalog: alte 13 Bilder unverändert vorn, alle Kampf-/Aktionsbilder angehängt', ()=>{
 const head=cat.frames.slice(0,13).map(f=>f.anim+(f.i||0));
 assert.deepEqual(head,['stehen0','stehen1','stehen2','stehen3','blinzeln0',...[0,1,2,3,4,5,6,7].map(i=>'laufen'+i)]);
 for(const [a,i] of NEW)assert.ok(at(a,i)>=13,`Bild ${a}:${i} fehlt im Katalog`);
 assert.deepEqual(cat.frames.map(f=>f.anim+':'+f.i),FRAMES.map(f=>f.anim+':'+f.i),'Katalog passt zu FRAMES in puppe.mjs (Laufzeit neu erzeugen)');
});

test('Bögen und Anker decken jedes Bild ab', ()=>{
 for(const src of Object.keys(cat.sources))for(const arch of Object.keys(cat.archetypes))for(const [dir,suffix] of Object.entries(cat.dirs)){
  if((dir==='sw'||dir==='ne')&&!cat.own[dir].includes(src))continue;const tag=`${src}-${arch}${suffix}`;
  assert.ok(sheets.has(src,arch,dir,0)&&sheets.has(src,arch,dir,cat.frames.length-1),tag+': Bogen fehlt');assert.equal(src==='koerper'?sheets.frames(src,arch,dir):cols(src,arch,dir),cat.frames.length,tag+': Spaltenzahl ≠ Bilder');}
 for(const arch of Object.keys(cat.archetypes))for(const dir of Object.keys(cat.dirs))assert.equal(cat.anchors[arch][dir].length,cat.frames.length,`Anker ${arch}/${dir}`);
});

test('Jede Spielpose hat ihr Bild, Zweihänder ihre Zweihand-Bilder', ()=>{
 for(const [pose,[a,i]] of Object.entries(PAPERDOLL_POSE_FRAMES))assert.ok(at(a,i)>=0,`${pose} → ${a}:${i} fehlt`);
 const one=[{slot:'weapon',hands:1}],two=[{slot:'weapon',hands:2}],f=(p,items=one)=>{const n=paperdollFrameFor(cat.frames,p,0,{stride:cat.stride||64,items});const q=cat.frames[n];return q.anim+':'+(q.i||0);};
 const cases=[[{dash:.1},'sprint:0'],[{hurt:.1},'getroffen:0'],[{parry:.1},'parade:0'],[{parry:.1},'parade2:0',two],[{parry:.1,usingRanged:true},'parade2:0',two],
  [{casting:true},'zaubern:0'],[{castPose:.2},'zaubern:0'],[{casting:true,usingRanged:true},'zielen:0'],
  [{attack:.24},'hieb:0'],[{attack:.13},'hieb:1'],[{attack:.02},'hieb:2'],[{attack:.24},'hieb2:0',two],[{attack:.13},'hieb2:1',two],[{attack:.02},'hieb2:2',two],
  [{attack:.2,usingRanged:true},'zielen:0'],[{attack:.02,usingRanged:true},'schuss:0'],[{attack:.02,usingRanged:true},'schuss:0',two],
  [{resting:true},'rasten:0'],[{resting:true,moving:true,walkDistance:0},'laufen:0'],[{moving:true,walkDistance:(cat.stride||64)*3/8+.1},'laufen:3'],
  [{artPose:'impact'},'hieb:1'],[{artPose:'walk-5'},'laufen:5'],
  // Rangfolge wie redesignPose
  [{dash:.1,hurt:.1,parry:.1},'sprint:0'],[{hurt:.1,parry:.1,attack:.2},'getroffen:0'],[{parry:.1,casting:true},'parade:0'],[{casting:true,attack:.2,moving:true},'zaubern:0'],[{attack:.13,moving:true,walkDistance:30},'hieb:1']];
 for(const [p,want,items] of cases)assert.equal(f(p,items),want,JSON.stringify(p));
 assert.equal(paperdollFrameFor(cat.frames,{dead:true}),0);assert.equal(paperdollFrameFor(cat.frames,{hp:0}),0);
 assert.ok(['stehen','blinzeln'].includes(cat.frames[paperdollFrameFor(cat.frames,{},1234)].anim));
});

test('Rangfolge der Posen deckt sich mit redesignPose', ()=>{
 const flags={dead:true,dash:.1,hurt:.1,parry:.1,casting:true,castPose:.2,attack:.2,usingRanged:true,moving:true,resting:true},keys=Object.keys(flags);
 for(let m=0;m<1<<keys.length;m++){const p={walkDistance:0};keys.forEach((k,b)=>{if(m>>b&1)p[k]=flags[k];});
  for(const a of [.24,.13,.02]){if(p.attack)p.attack=a;const r=redesignPose(p),q=paperdollPose(p);assert.equal(q,r.startsWith('walk-')?'walk':r,JSON.stringify(p));}}
});

test('Ohne Kampfbilder im Katalog fällt jede Pose auf Stehen/Blinzeln zurück', ()=>{
 const old=cat.frames.slice(0,13);for(const p of [{attack:.2},{hurt:.1},{resting:true},{dash:.1}])assert.ok(paperdollFrameFor(old,p,0)<5,JSON.stringify(p));
});

test('Skelett: keine gestreckten Glieder, zweite Hand am Schaft, alle vier Richtungen', ()=>{
 const d=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 for(const [lid,look] of Object.entries(LOOK)){const A=ARCH[look.arch],la=A.leg[0]>36?[29,27]:[27,25];
  for(const [back,swap] of [[false,false],[false,true],[true,true],[true,false]])for(const fr of FRAMES.filter(f=>ACTS[f.anim])){const p=pose(fr,A,look,back,swap),tag=`${lid} ${fr.anim}:${fr.i} back=${back} swap=${swap}`;
   for(const arm of [p.armN,p.armF]){assert.ok(Math.abs(d(arm[0],arm[1])-la[0])<.6&&Math.abs(d(arm[1],arm[2])-la[1])<.6,tag+': Arm gedehnt');assert.ok(d(arm[0],arm[2])>8,tag+': Arm zusammengefaltet');}
   for(const leg of [p.legN,p.legF]){assert.ok(Math.abs(d(leg[0],leg[1])-A.leg[0])<.6&&Math.abs(d(leg[1],leg[2])-A.leg[1])<.6,tag+': Bein gedehnt');assert.ok(leg[2][1]<=204,tag+': Fuß unter der Leinwandkante');}
   for(const v of [p.swingN,p.swingF])assert.ok(Number.isFinite(v),tag+': Schwungwinkel');
   if(p.grip2){const w=swap?p.armF:p.armN,o=swap?p.armN:p.armF,a=swap?p.swingF:p.swingN,h=KIT.handPos(w),s=p.grip2at??12,g=[h[0]-Math.sin(a)*s,h[1]+Math.cos(a)*s];assert.ok(d(KIT.handPos(o),g)<4,tag+': zweite Hand nicht am Schaft');}
  }}
});

// Aktionsposen hängen an der Seitenregel (Waffenarm = armF bei swap): gespiegeltes se ist dort nicht sw. Jede Quelle braucht für sw/ne
// eigene Aktionsbögen (cat.ownAkt), sonst passen Körper (gespiegelt) und Kleidung/Waffe (eigen) nicht zusammen – nackter Waffenarm.
// Schwellen geeicht am Fehlerbild 2026-09-24: Ärmel auf Haut kaputt 6–15 %, heil ≥ 52 % (Dirndl-Puffärmel) bzw. ≥ 59 %; bedeckt kaputt ≤ 22 %, heil ≥ 45 %.
const OLD=cat.version<2&&'Laufzeit noch im alten Format (v1) – nach dem Neubau aktiv';
test('sw/ne: jede Quelle hat eigene Aktionsbögen', {skip:OLD}, ()=>{
 const split=cat.split??cat.frames.length;assert.ok(split<cat.frames.length,'keine Aktionsbilder im Katalog');
 for(const src of Object.keys(cat.sources))for(const dir of ['sw','ne']){assert.ok(cat.ownAkt?.[dir]?.includes(src),`${src} ${dir}: kein eigener Aktionsbogen in cat.ownAkt`);
  for(const arch of Object.keys(cat.archetypes))assert.ok(sheets.has(src,arch,dir,split),`${sheets.file(src,arch,dir,split)} fehlt`);}
});
test('sw/ne-Aktionsbilder: Ärmel liegen auf dem Waffenarm (Stoff statt Haut), alle Oberteile mit Ärmeln', {skip:OLD}, ()=>{
 const split=cat.split,sleeved=Object.keys(cat.sources).filter(s=>cat.sources[s].slot==='body'&&cat.sources[s].bands.some(b=>b==='armVorn'||b==='armHinten'));
 assert.ok(sleeved.length>=2,'keine Oberteile mit Ärmeln im Katalog');
 // Bogenwahl wie paperdoll-art.js (baseDir): sw/ne ohne eigenen Bogen = gespiegeltes se/nw – so wie das Spiel es zeigt
 const pix=(src,arch,dir,band,f)=>{const own=(f>=split?cat.ownAkt?.[dir]:null)?.includes(src)||cat.own[dir].includes(src);if(own)return sheets.pixels(src,arch,dir,band,f);
  return sheets.pixels(src,arch,dir==='sw'?'se':'nw',band,f).map(([x,y,...c])=>[cat.W-1-x,y,...c]);};
 // sw: Waffenarm = ferner Arm (armHinten), ne: naher Arm (armVorn) – Seitenregel wie im Quellen-Wrapper
 for(const arch of Object.keys(cat.archetypes))for(const [dir,band] of [['sw','armHinten'],['ne','armVorn']])for(let f=split;f<cat.frames.length;f++){
  const body=pix('koerper',arch,dir,band,f),arm=new Set(body.map(p=>p[0]+','+p[1]));assert.ok(arm.size>50,`koerper-${arch} ${dir} Bild ${f}: Waffenarm fehlt`);
  const [wx,wy]=cat.anchors[arch][dir][f].w;assert.ok(body.filter(([x,y])=>Math.hypot(x+.5-wx,y+.5-wy)<=5).length>=20,`koerper-${arch} ${dir} ${cat.frames[f].anim}:${cat.frames[f].i}: Hand nicht am Waffengriff (Anker w)`);
  for(const s of sleeved){const sl=pix(s,arch,dir,band,f);if(sl.length<30)continue;const on=sl.filter(p=>arm.has(p[0]+','+p[1])).length;
   assert.ok(on/sl.length>=.45,`${s}-${arch} ${dir} ${cat.frames[f].anim}:${cat.frames[f].i}: Ärmel neben dem Arm (${(on/sl.length*100).toFixed(0)} % auf Haut)`);
   assert.ok(on/arm.size>=.35,`${s}-${arch} ${dir} ${cat.frames[f].anim}:${cat.frames[f].i}: Waffenarm nackt (${(on/arm.size*100).toFixed(0)} % bedeckt)`);}}
});
