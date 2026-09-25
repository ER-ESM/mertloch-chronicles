// Reiten mit der Anziehpuppe: Laufzeit-Bögen (tools/paperdoll/puppe.mjs --reiten) vollständig, konsistent und nur bei Bedarf geladen.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {decodePng} from '../tools/sprite-pipeline/png.mjs';
import {MOUNTS,MOUNT_RULES} from '../content/index.js';
import {paperdoll} from '../paperdoll-art.js';
import {rideFrameIndex,rideSourceSet} from '../paperdoll-mount.js';
// REITEN_DIR=<ordner> prüft einen Probebau statt assets/paperdoll/reiten (Offline-Cache-Prüfung nur für die ausgelieferten Bögen)
const PROBE=process.env.REITEN_DIR,dir=PROBE?pathToFileURL(resolve(PROBE)+'/'):new URL('../assets/paperdoll/reiten/',import.meta.url),read=f=>readFileSync(new URL(f,dir));
const cat=JSON.parse(read('catalog.json')),ARCHS=['baerbel','dieter','kevin'],DIRS=['se','sw','nw','ne'],STOWED=['weapon','offhand','ranged'];
const mounts=Object.fromEntries(Object.keys(cat.mounts).map(id=>[id,JSON.parse(read(cat.mounts[id].file))]));
const pngSize=f=>{const b=read(f);return [b.readUInt32BE(16),b.readUInt32BE(20)];};

test('Reittier-IDs im Inhalt entsprechen dem Reit-Katalog (inkl. Esel, Drahtesel, Aufsitzmäher)',()=>{
 /* Dungeon Etappe 4 Teil A: Reittiere mit art (Platzhalter: vorhandener Bogen, getönt) haben keine eigenen Bögen */const own=Object.keys(MOUNTS).filter(id=>!MOUNTS[id].art);
 assert.deepEqual(Object.keys(cat.mounts).sort(),own.sort());for(const [id,d] of Object.entries(MOUNTS))if(d.art)assert.ok(cat.mounts[d.art],id+' → '+d.art);
 for(const id of ['packesel','drahtesel','rasenkoenig'])assert.ok(cat.mounts[id]?.name&&cat.mounts[id].sitz,id);
 assert.equal(own.length,6);
});

test('Katalog vollständig: 6 Reittiere × 3 Archetypen × 4 Richtungen × 9 Bilder, jede Kachel gültig',()=>{
 assert.equal(cat.frames,9);assert.deepEqual(Object.keys(cat.archetypes).sort(),ARCHS);assert.deepEqual(cat.dirs,DIRS);assert.equal(cat.worldHeight,26);
 for(const [id,M] of Object.entries(mounts)){
  for(const key of ['@',...ARCHS]){assert.ok(M.pages[key]?.length,id+' Seiten '+key);const sizes=M.pages[key].map(pngSize);
   for(const [pg,x,y,w,h] of M.tiles[key]){assert.ok(pg<sizes.length&&w>0&&h>0&&x+w<=sizes[pg][0]&&y+h<=sizes[pg][1],`${id} ${key} Kachel außerhalb der Seite`);}}
  const valid=(key,list)=>{for(const [b,t,X,Y,flip] of list)assert.ok(b>=0&&b<cat.bands.length&&t>=0&&t<M.tiles[key].length&&Number.isInteger(X)&&Number.isInteger(Y)&&(flip===0||flip===1),`${id} ${key} Eintrag`);};
  for(const d of DIRS){assert.equal(M.mount[d].length,9,id+' '+d);for(const list of M.mount[d]){assert.ok(list.length,id+' '+d+' leeres Tierbild');valid('@',list);}
   assert.ok(M.shadow['@'][d].rx>0,id+' Schatten');
   for(const a of ARCHS){const R=M.riders[a];assert.equal(R[d].length,9,`${id} ${a} ${d}`);assert.ok(M.shadow[a][d].rx>=20);
    for(const pi of R[d]){const P=R.poses[pi];assert.ok(P?.koerper?.length,`${id} ${a} ${d}: Körper fehlt`);for(const [s,list] of Object.entries(P)){assert.ok(cat.sources[s],s);valid(a,list);}}}}}
});

test('Waffen bleiben beim Reiten verstaut: keine Waffen-, Nebenhand- oder Fernwaffenquellen',()=>{
 assert.equal(cat.sources.koerper.slot,'body-base');
 for(const [s,d] of Object.entries(cat.sources))assert.ok(!STOWED.includes(d.slot),s);
});

test('Atlas-Kacheln tragen Inhalt (Packen und Beschneiden stimmen)',()=>{
 for(const id of ['hofpferd','rasenkoenig']){const M=mounts[id];for(const key of ['@','kevin']){const pages=M.pages[key].map(f=>decodePng(read(f)));
  for(const [pg,x,y,w,h] of M.tiles[key]){const P=pages[pg];let top=false,left=false;for(let i=0;i<w&&!top;i++)top=P.data[(y*P.width+x+i)*4+3]>0;for(let j=0;j<h&&!left;j++)left=P.data[((y+j)*P.width+x)*4+3]>0;
   assert.ok(top&&left,`${id} ${key}: Kachel nicht bündig beschnitten`);}}}
});

test('Reit-Bögen: < 12 MB, nur optional im Offline-Cache (Laden bei Bedarf)',()=>{
 const files=readdirSync(dir),bytes=files.reduce((n,f)=>n+statSync(new URL(f,dir)).size,0);assert.ok(bytes<12*1048576,(bytes/1048576).toFixed(2)+' MB');
 if(PROBE)return;// Probebau: Offline-Cache gilt nur für assets/paperdoll/reiten
 const manifest=JSON.parse(readFileSync(new URL('../precache-manifest.js',import.meta.url),'utf8').match(/self.PRECACHE=(.*);/s)[1]);
 assert.equal(manifest.urls.some(u=>u.startsWith('assets/paperdoll/reiten/')),false);
 for(const f of files.filter(f=>/\.(png|json)$/.test(f)))assert.ok(manifest.optional['assets/paperdoll/reiten/'+f],f+' fehlt im optionalen Cache');
 assert.ok(manifest.urls.includes('paperdoll-mount.js'));
});

test('Laufzeit: Bildwahl nach Wegstrecke, Reiterquellen ohne Waffen',()=>{
 assert.equal(rideFrameIndex({moving:false,walkDistance:500}),0);
 const seen=new Set();for(let d=0;d<MOUNT_RULES.stride;d+=MOUNT_RULES.stride/8)seen.add(rideFrameIndex({moving:true,walkDistance:d}));assert.deepEqual([...seen].sort(),[1,2,3,4,5,6,7,8]);
 paperdoll.catalog=JSON.parse(readFileSync(new URL('../assets/paperdoll/runtime/catalog.json',import.meta.url),'utf8'));
 try{const set=rideSourceSet([{slot:'body',id:'kutte',asset:'jacket'},{slot:'legs',id:'x',asset:'trouser'},{slot:'weapon',id:'flasche',asset:'bottle'},{slot:'offhand',id:'topfdeckel',asset:'potlid'}],null,cat);
  assert.ok(set.has('kutte')&&set.has('jeans'));for(const s of set)assert.ok(!STOWED.includes(cat.sources[s].slot),s);}
 finally{paperdoll.catalog=null;}
});
