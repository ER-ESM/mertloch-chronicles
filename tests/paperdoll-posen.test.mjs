// Anziehpuppe: Kampf- und Aktionsposen (E-58). Prüft die Laufzeit-Bögen (assets/paperdoll/runtime), die Zuordnung
// Spielpose → Bild (paperdoll-art.js) gegen redesignPose und die Skelettposen aus tools/paperdoll/puppe.mjs (ohne Browser).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,openSync,readSync,closeSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {paperdollPose,paperdollFrameFor,PAPERDOLL_POSE_FRAMES} from '../paperdoll-art.js';
import {redesignPose} from '../redesign-art.js';
import {FRAMES,ARCH,LOOK,ACTS,KIT,HAND_F,pose} from '../tools/paperdoll/puppe.mjs';
import {sources as schichten} from '../paperdoll-kern.js';
import {sheetReader} from './paperdoll-sheet.mjs';

// PAPERDOLL_RT=<ordner> prüft einen Probebau statt assets/paperdoll/runtime
const RT=process.env.PAPERDOLL_RT?pathToFileURL(resolve(process.env.PAPERDOLL_RT)+'/'):new URL('../assets/paperdoll/runtime/',import.meta.url);
const cat=JSON.parse(readFileSync(new URL('catalog.json',RT),'utf8')),sheets=sheetReader(RT,cat);
/** Spalten beider Bögen aus den PNG-Köpfen (Dateinamen wie sheetReader, ohne alles zu dekodieren). */
const cols=(src,arch,dir)=>{const w=f=>{const fd=openSync(new URL(f,RT),'r'),b=Buffer.alloc(24);readSync(fd,b,0,24,0);closeSync(fd);return b.readUInt32BE(16);};
 const split=sheets.split,cw=sheets.cell(src).w;return w(sheets.file(src,arch,dir,0))/cw+(split<cat.frames.length?w(sheets.file(src,arch,dir,split))/cw:0);};
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

// Zellen (Katalog version 3): jede Quelle hat eine Zelle in der Leinwand, jeder Bogen ist genau Bilder × cell.w breit und Bänder × cell.h hoch
test('Zellen: Bögen auf die Zelle der Quelle zugeschnitten, Zelle liegt in der Leinwand', {skip:cat.version<3&&'Katalog ohne Zellen (version < 3)'}, ()=>{
 const size=f=>{const fd=openSync(new URL(f,RT),'r'),b=Buffer.alloc(24);readSync(fd,b,0,24,0);closeSync(fd);return [b.readUInt32BE(16),b.readUInt32BE(20)];},split=sheets.split;
 let kleiner=0,voll=0;
 for(const [src,d] of Object.entries(cat.sources)){const c=d.cell;assert.ok(c&&[c.x,c.y,c.w,c.h].every(Number.isInteger)&&c.w>=1&&c.h>=1&&c.x>=0&&c.y>=0&&c.x+c.w<=cat.W&&c.y+c.h<=cat.H,src+': Zelle '+JSON.stringify(c));
  voll+=cat.W*cat.H;kleiner+=c.w*c.h;
  for(const arch of Object.keys(cat.archetypes))for(const dir of Object.keys(cat.dirs))for(const [f,n] of [[0,split],[split,cat.frames.length-split]]){if(!n||!sheets.has(src,arch,dir,f))continue;
   assert.deepEqual(size(sheets.file(src,arch,dir,f)),[n*c.w,Math.max(1,d.bands.length)*c.h],sheets.file(src,arch,dir,f)+': Bogenmaß passt nicht zur Zelle');}}
 assert.ok(kleiner<voll*.5,'Zellen kaum kleiner als die Leinwand ('+(kleiner/voll*100).toFixed(0)+' %)');
 assert.ok(cat.sources.koerper.cell.w>60&&cat.sources.koerper.cell.h>150,'Körperzelle zu klein');
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
   for(const leg of [p.legN,p.legF]){assert.ok(Math.abs(d(leg[0],leg[1])-A.leg[0])<.6&&Math.abs(d(leg[1],leg[2])-A.leg[1])<.6,tag+': Bein gedehnt');assert.ok(leg[2][1]<=KIT.GROUND-2,tag+': Fuß unter dem Boden');}
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

// ---------- Bildfläche (tools/paperdoll/puppe.mjs W×H, docs/ANZIEHPUPPE.md): nichts stößt an den Rand ----------
// cat.huelle = Hülle aller gezeichneten Pixel relativ zum Fußpunkt, beim Bau gemessen. Stichprobe gegen die Bögen: die weitesten und
// höchsten Quellen (Greifzange, Kochmütze) und der Körper liegen darin.
const NO_HULL=!cat.huelle&&'Katalog ohne Hülle – Laufzeit mit der neuen Leinwand bauen';
test('Bildfläche: jedes Bild mit mindestens 12 px Rand, Fußpunkt mittig unten, Maße wie im Werkzeug', {skip:NO_HULL}, ()=>{
 const h=cat.huelle,R=12,px=cat.pivot.x,py=cat.pivot.y;
 assert.equal(px,cat.W/2);assert.equal(py,cat.ground);assert.deepEqual([cat.W,cat.H,cat.ground],[KIT.W,KIT.H,KIT.GROUND],'Katalog und Werkzeug haben dieselbe Leinwand');
 const frei={links:px+h.x0,rechts:cat.W-1-px-h.x1,oben:py+h.y0,unten:cat.H-1-py-h.y1};
 for(const [k,v] of Object.entries(frei))assert.ok(v>=R,`Rand ${k}: nur ${v} px frei (Hülle ${JSON.stringify(h)}, Leinwand ${cat.W}×${cat.H})`);
 for(const src of ['sigizange','kochmuetze','koerper'].filter(s=>cat.sources[s]))for(const arch of Object.keys(cat.archetypes))for(const dir of Object.keys(cat.dirs)){
  if(!sheets.has(src,arch,dir,0))continue;for(let f=0;f<cat.frames.length;f++)for(const band of cat.sources[src].bands){if(!sheets.has(src,arch,dir,f))continue;
   for(const [x,y] of sheets.pixels(src,arch,dir,band,f))assert.ok(x-px>=h.x0&&x-px<=h.x1&&y-py>=h.y0&&y-py<=h.y1,`${src}-${arch} ${dir} Bild ${f}: Pixel ${x},${y} außerhalb der Hülle`);}}
});

// ---------- Waffe in der fernen Hand (Band HAND_F vor dem fernen Bein) ----------
// sw/nw halten die Waffe in der fernen Hand (Seitenregel), die Nebenhand-Waffe (_nh) liegt in se/ne fern. Früher lag sie in armHinten
// hinter dem fernen Bein und verschwand in manchen Stand-/Laufbildern ganz (Dosenklinge, Flasche, Schleuder: 0 %). Gezählt wird, wie viel
// der Waffe im fertigen Bild oben liegt – mit Hose und breiten Gummistiefeln, verglichen mit der nahen Hand (se bzw. sw).
test('Waffe in der fernen Hand bleibt in jedem Stand-/Laufbild sichtbar und liegt hinter dem Rumpf', ()=>{
 const W=cat.W,split=cat.split??cat.frames.length,memo=new Map();assert.equal(HAND_F,'beinHinten');
 const tile=(src,arch,dir,band,f)=>{const k=[src,arch,dir,band,f].join('|');if(memo.has(k))return memo.get(k);
  const own=dir==='se'||dir==='nw'||cat.own[dir]?.includes(src)||(f>=split&&cat.ownAkt?.[dir]?.includes(src));
  const px=own?sheets.pixels(src,arch,dir,band,f):sheets.pixels(src,arch,dir==='sw'?'se':'nw',band,f).map(([x,y])=>[W-1-x,y]);const t=new Set(px.map(([x,y])=>y*W+x));memo.set(k,t);return t;};
 /** Oberste Quelle je Pixel (Zeichenfolge wie paperdoll-kern: Bänder außen, Quellen innen). */
 const top=(arch,dir,f,set)=>{const t=new Map();for(const band of cat.bands)for(const s of schichten(new Set(set),cat.sources)){if(s==='dutt'&&(band!=='kopf'||!cat.archetypes[arch].dutt))continue;
  if(!cat.sources[s]?.bands.includes(band))continue;for(const i of tile(s,arch,dir,band,f))t.set(i,s);}return t;};
 /** [oben liegende Waffenpixel, alle Waffenpixel]: je Waffenpixel die zuletzt gezeichnete Ebene suchen (Hose, Gummistiefel). */
 const seen=(w,arch,dir,f)=>{const L=[];for(const band of cat.bands)for(const s of schichten(new Set(['jeans','festivalstiefel',w]),cat.sources)){if(s==='dutt'&&(band!=='kopf'||!cat.archetypes[arch].dutt))continue;if(cat.sources[s]?.bands.includes(band))L.push([s,tile(s,arch,dir,band,f)]);}
  const all=new Set();for(const [s,t] of L)if(s===w)for(const i of t)all.add(i);let n=0;for(const i of all){for(let k=L.length-1;k>=0;k--)if(L[k][1].has(i)){if(L[k][0]===w)n++;break;}}return [n,all.size];};
 const weapons=Object.keys(cat.sources).filter(s=>['weapon','ranged'].includes(cat.sources[s].slot)||/_nh$/.test(s));assert.ok(weapons.length>=10);
 const walk=cat.frames.map((fr,i)=>['stehen','blinzeln','laufen'].includes(fr.anim)?i:-1).filter(i=>i>=0);const mean={};
 for(const w of weapons){const nh=/_nh$/.test(w),far=nh?['se','ne']:['sw','nw'],near=nh?'sw':'se';assert.ok(cat.sources[w].bands.includes(HAND_F),w+': fernes Band fehlt');
  for(const arch of Object.keys(cat.archetypes))for(const f of walk){const [vn]=seen(w,arch,near,f);
   for(const dir of far){const [v,t]=seen(w,arch,dir,f),q=v/t,m=(mean[w+' '+dir]??=[0,0]);m[0]+=q;m[1]++;
    assert.ok(q>=.15,`${w}-${arch} ${dir} ${cat.frames[f].anim}:${cat.frames[f].i}: nur ${(q*100).toFixed(0)} % der Waffe sichtbar`);
    assert.ok(v>=vn*.15,`${w}-${arch} ${dir} Bild ${f}: ${v} sichtbare Pixel gegen ${vn} in ${near}`);}}}
 // im Mittel über Stand/Laufen fast ganz sichtbar (vorher sw ~40 %, nw ~75 %)
 for(const [k,[q,n]] of Object.entries(mean))assert.ok(q/n>=.7,`${k}: im Mittel nur ${(q/n*100).toFixed(0)} % sichtbar`);
 // hinter dem Rumpf: im fernen Band liegt der Rumpf (Hose am Becken, Körper) über der Waffe
 for(const arch of Object.keys(cat.archetypes)){const t=top(arch,'sw',0,['jeans','dosenklinge']);for(const i of tile('jeans',arch,'sw','rumpf',0))if(tile('dosenklinge',arch,'sw',HAND_F,0).has(i)){assert.notEqual(t.get(i),'dosenklinge',arch+': Waffe vor dem Rumpf');}}
 // Handschuh über der Waffenfaust der fernen Hand (Handschuh liegt im selben Band nach der Waffe)
 for(const arch of Object.keys(cat.archetypes))for(const dir of ['sw','nw']){const [wx,wy]=cat.anchors[arch][dir][0].w,t=top(arch,dir,0,['dosenklinge','grillhandschuhe']);let g=0,n=0;
  for(let y=Math.round(wy)-2;y<=Math.round(wy)+2;y++)for(let x=Math.round(wx)-2;x<=Math.round(wx)+2;x++){n++;if(t.get(y*W+x)==='grillhandschuhe')g++;}
  assert.ok(g/n>=.6,`${arch} ${dir}: Waffenfaust ohne Handschuh (${g}/${n})`);}
});
