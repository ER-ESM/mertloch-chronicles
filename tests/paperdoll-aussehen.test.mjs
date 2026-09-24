// Editor-Aussehen an der Anziehpuppe (tools/paperdoll/aussehen.mjs → assets/paperdoll/runtime, paperdoll-art.js lookSources).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {BEARDS,HAIR_STYLES,FACE_ITEMS,DEFAULT_TINT} from '../hero-tint.js';
import {lookSources,paperdoll} from '../paperdoll-art.js';
import {sources,composeCore} from '../paperdoll-kern.js';
import {decodePng} from '../tools/sprite-pipeline/png.mjs';
import {kopfEinrasten} from '../tools/paperdoll/aussehen.mjs';
import {PAL,LOOK} from '../tools/paperdoll/puppe.mjs';
import {sheetReader} from './paperdoll-sheet.mjs';

// PAPERDOLL_RUNTIME=<Ordner>: gegen einen eigenen --runtime-Bau prüfen (Standard: die ausgelieferten Bögen)
const RT=process.env.PAPERDOLL_RUNTIME?pathToFileURL(process.env.PAPERDOLL_RUNTIME.replace(/[\\/]*$/,'/')):new URL('../assets/paperdoll/runtime/',import.meta.url);
const cat=JSON.parse(readFileSync(new URL('catalog.json',RT),'utf8'));
const S=sheetReader(RT,cat),rgb=p=>p.slice(2),key=c=>c[0]<<16|c[1]<<8|c[2];
const OPTIONS=[...BEARDS.map(o=>['beard',o.id]),...HAIR_STYLES.map(o=>['style',o.id]),...FACE_ITEMS.map(o=>['face',o.id])].filter(([,id])=>id!=='natur'&&id!=='ohne');
const TEILE=new URL('../tools/paperdoll/hybrid/teile/',import.meta.url),TJ=JSON.parse(readFileSync(new URL('teile.json',TEILE),'utf8'));
const FIG_ARCH={ida:'baerbel',dieter:'dieter',kevin:'kevin'};

test('jede Editor-Option (Bart, Frisur, Kopfsache) hat eine Quelle im Laufzeit-Katalog – alle Archetypen, vorn und hinten',()=>{
 assert.ok(OPTIONS.length>=6);
 for(const [k,id] of OPTIONS){const s=lookSources({...DEFAULT_TINT,[k]:id},[]);assert.equal(s.length,1,`${k}=${id}`);
  const src=s[0];assert.ok(cat.sources[src],`Quelle ${src} fehlt im Katalog`);assert.equal(cat.sources[src].slot,'look');assert.ok(cat.sources[src].bands.includes('kopf'));
  for(const arch of Object.keys(cat.archetypes))for(const dir of ['se','nw'])assert.ok(S.has(src,arch,dir,0),`${src}-${arch} ${dir}`);}
});

test('Standard-Aussehen braucht keine Ebenen, fehlendes Aussehen auch nicht',()=>{
 assert.deepEqual(lookSources(DEFAULT_TINT,[]),[]);assert.deepEqual(lookSources(null,[]),[]);assert.deepEqual(lookSources(undefined),[]);
});

test('Reihenfolge im Kopfband: Frisur (ganzer Kopf) vor Bart vor Kopfsache',()=>{
 assert.deepEqual(lookSources({...DEFAULT_TINT,style:'irokese',beard:'vollbart',face:'brille'},[]),['frisur-irokese','bart-vollbart','brille']);
 assert.deepEqual(lookSources({...DEFAULT_TINT,beard:'stoppeln',face:'stirnband'},[{slot:'body',id:'kutte',asset:'jacket'}]),['bart-stoppeln','stirnband']);
});

test('Kopfteile: Brillen und Bart bleiben immer, Scheitel-Quellen (Irokese, Stirnband) entfallen nur unter scheitelbedeckenden Kopfteilen',()=>{
 // Kleiner Katalog: ein Helm (bedeckt den Scheitel), Kopfhörer (offen), Scheitel-Quellen wie im Laufzeitkatalog
 const mini={sources:{helm:{slot:'head'},kopfhoerer:{slot:'head'},'frisur-irokese':{slot:'look'},stirnband:{slot:'look'},brille:{slot:'look'},sonnenbrille:{slot:'look'},'bart-kinnbart':{slot:'look'}},
  items:{helm:'helm',kopfhoerer:'kopfhoerer'},families:{helmet:'helm'},openHead:['kopfhoerer'],crownLooks:['frisur-irokese','stirnband']};
 const tint={...DEFAULT_TINT,style:'irokese',beard:'kinnbart',face:'sonnenbrille'},head=id=>[{slot:'head',id,asset:'x'},{slot:'legs',id:'jeans',asset:'trouser'}];
 const saved=paperdoll.catalog;paperdoll.catalog=mini;
 try{
  assert.deepEqual(lookSources(tint,head('helm')),['bart-kinnbart','sonnenbrille'],'Helm: Kamm weg, Brille und Bart bleiben');
  assert.deepEqual(lookSources(tint,[{slot:'head',id:'unbekannt',asset:'helmet'}]),['bart-kinnbart','sonnenbrille'],'Helm über die Familie');
  assert.deepEqual(lookSources(tint,head('kopfhoerer')),['frisur-irokese','bart-kinnbart','sonnenbrille'],'Kopfhörer lassen den Scheitel frei');
  assert.deepEqual(lookSources(tint,head('ungezeichnet')),['frisur-irokese','bart-kinnbart','sonnenbrille'],'nicht gezeichnetes Kopfteil verdeckt nichts');
  for(const face of ['brille','sonnenbrille'])assert.deepEqual(lookSources({...DEFAULT_TINT,face},head('helm')),[face]);
  assert.deepEqual(lookSources({...DEFAULT_TINT,face:'stirnband'},head('helm')),[]);
  assert.deepEqual(lookSources({...DEFAULT_TINT,face:'stirnband'},head('kopfhoerer')),['stirnband']);
 }finally{paperdoll.catalog=saved;}
});

test('Laufzeitkatalog führt offene Kopfteile und Scheitel-Quellen (Daten statt fester Liste)',()=>{
 assert.ok(Array.isArray(cat.openHead)&&cat.openHead.includes('kopfhoerer'),'catalog.openHead ohne kopfhoerer – Laufzeit neu bauen');
 assert.deepEqual([...(cat.crownLooks||[])].sort(),['frisur-irokese','stirnband']);
 for(const id of cat.openHead)assert.equal(cat.sources[id]?.slot,'head');
});

test('Dieter rasiert: Stoppeln, Kinnbart und Schnauzer übermalen den gezeichneten Vollbart mit Haut (umfärbbar)',()=>{
 const skin=new Set(cat.ramps.skin.map(key)),hair=new Set(cat.ramps[cat.archetypes.dieter.hair].map(key)),[hx,hy]=cat.anchors.dieter.se[0].h.map(Math.round);
 for(const src of ['bart-stoppeln','bart-kinnbart','bart-schnauzer']){let sk=0,ha=0;
  // Kieferfläche unter dem Mund (dort war vorher nur Bart)
  for(const p of S.pixels(src,'dieter','se','kopf',0)){const [x,y]=p;if(y<hy+13||y>hy+16||Math.abs(x-hx)>9)continue;const c=key(rgb(p));if(skin.has(c))sk++;else if(hair.has(c))ha++;}
  if(src!=='bart-kinnbart')assert.ok(sk>=45,`${src}: Kiefer nicht rasiert (${sk} Hautpixel)`);else assert.ok(ha>=12&&sk>=12,`${src}: Kinnbart auf rasiertem Kiefer fehlt (${sk}/${ha})`);}
 // Kevin und Bärbel werden nicht rasiert: dort bleibt die Ebene licht
 assert.ok(S.pixels('bart-stoppeln','dieter','se','kopf',0).length>S.pixels('bart-stoppeln','kevin','se','kopf',0).length,'Rasur-Ebene fehlt');
});

test('Frisur ersetzt Körperkopf und Dutt beim Zusammensetzen (paperdoll-kern)',()=>{
 const gear={koerper:{slot:'body-base'},brille:{slot:'look'},'frisur-irokese':{slot:'look'},'bart-vollbart':{slot:'look'}};
 assert.ok(sources(new Set(['koerper','brille']),gear).includes('dutt'));
 const order=sources(new Set(['koerper','frisur-irokese','bart-vollbart','brille']),gear);assert.ok(!order.includes('dutt'));
 assert.ok(order.indexOf('frisur-irokese')<order.indexOf('bart-vollbart')&&order.indexOf('bart-vollbart')<order.indexOf('brille'));
 const asked=[];composeCore(2,1,['rumpf','kopf'],['koerper','dutt','frisur-irokese'],(s,band)=>{asked.push(s+'|'+band);return null;});
 assert.ok(!asked.includes('koerper|kopf')&&!asked.includes('dutt|kopf'));assert.ok(asked.includes('koerper|rumpf')&&asked.includes('frisur-irokese|kopf'));
 const plain=[];composeCore(2,1,['kopf'],['koerper','brille'],(s,band)=>{plain.push(s+'|'+band);return null;});assert.deepEqual(plain,['koerper|kopf','brille|kopf']);
});

test('Bart und Kamm in der Haartreppe des Archetyps (Laufzeit-Umfärbung greift), Kopfhaut in der Hauttreppe; Bart hinten unsichtbar',()=>{
 const skin=new Set(cat.ramps.skin.map(key));
 for(const [arch,a] of Object.entries(cat.archetypes)){const hair=new Set(cat.ramps[a.hair].map(key));
  for(const src of ['bart-kinnbart','bart-vollbart','bart-schnauzer']){const px=S.pixels(src,arch,'se','kopf',0).map(rgb);assert.ok(px.length>20,`${src}-${arch} leer`);
   const beard=px.filter(c=>!skin.has(key(c)));// Dieter: die Rasur darunter ist Haut
   assert.ok(beard.filter(c=>hair.has(key(c))).length/beard.length>.9,`${src}-${arch}: Bart nicht in der Haartreppe`);
   assert.equal(S.pixels(src,arch,'nw','kopf',0).length,0,`${src}-${arch}: Bart von hinten sichtbar`);}
  for(const dir of ['se','nw']){const px=S.pixels('frisur-irokese',arch,dir,'kopf',0).map(rgb);
   assert.ok(px.filter(c=>hair.has(key(c))).length>40,`Irokese-${arch} ${dir}: zu wenig Haar`);assert.ok(px.filter(c=>skin.has(key(c))).length>200,`Irokese-${arch} ${dir}: keine Kopfhaut`);}}
});

test('Aussehen folgt dem Kopf in jedem Bild (Atmen, Blinzeln, Laufen, Aktionen): fester Versatz zum Kopfanker',()=>{
 for(const arch of Object.keys(cat.archetypes))for(const src of ['brille','frisur-irokese','stirnband','bart-vollbart','bart-schnauzer']){const dx=[],dy=[];
  cat.frames.forEach((fr,f)=>{const px=S.pixels(src,arch,'se','kopf',f);assert.ok(px.length>0,`${src}-${arch} Bild ${f} leer`);
   const [hx,hy]=cat.anchors[arch].se[f].h;dx.push(px.reduce((a,p)=>a+p[0],0)/px.length-hx);dy.push(px.reduce((a,p)=>a+p[1],0)/px.length-hy);});
  const spread=v=>Math.max(...v)-Math.min(...v);assert.ok(spread(dx)<=1.5&&spread(dy)<=1.5,`${src}-${arch}: Versatz zum Kopf schwankt (${dx.map(v=>v.toFixed(1))} / ${dy.map(v=>v.toFixed(1))})`);}
});

// ---------- Haarpixel der Codex-Köpfe auf die Haartreppe (kopfEinrasten, beim Laden in puppe.mjs hyb) ----------
/** Fremdfarben eines Kopfbildes: nicht in Haar-/Hauttreppe, Wangenrot, Haarband, Augen/Lippen/Zähne – ohne die dunkle Kontur direkt an Haut (Gesicht, Ohr, Nacken). */
function fremd(img,fig){const ok=new Set([...LOOK[fig].hair,...PAL.skin,PAL.blush,...PAL.patch,...PAL.eye,...PAL.iris,PAL.lash,...PAL.lip,...PAL.white,[255,255,255]].map(key)),skin=new Set(PAL.skin.map(key)),out=new Map();
 const at=(x,y)=>x<0||y<0||x>=img.width||y>=img.height||!img.data[(y*img.width+x)*4+3]?-1:key([...img.data.subarray((y*img.width+x)*4,(y*img.width+x)*4+3)]);
 for(let y=0;y<img.height;y++)for(let x=0;x<img.width;x++){const k=at(x,y);if(k<0||ok.has(k))continue;if([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>skin.has(at(x+dx,y+dy))))continue;out.set(k,(out.get(k)||0)+1);}return out;}
const eingerastet=id=>{const raw=decodePng(readFileSync(new URL(id+'.png',TEILE))),t={...TJ[id],img:{...raw,data:new Uint8Array(raw.data)}};const n=kopfEinrasten(id,t,{PAL,LOOK});return {raw,img:t.img,n};};

test('Codex-Köpfe: Haarpixel außerhalb der Haartreppe werden eingerastet, das Gesicht bleibt',()=>{
 for(const id of Object.keys(TJ).filter(k=>/^kopf-[a-z]+-(se|nw)(-blink)?$/.test(k))){const fig=id.split('-')[1],{raw,img,n}=eingerastet(id);
  assert.ok(n>50,`${id}: nichts eingerastet`);
  const vor=[...fremd(raw,fig).values()].reduce((a,b)=>a+b,0),nach=[...fremd(img,fig).values()].reduce((a,b)=>a+b,0);
  assert.ok(nach<=8,`${id}: noch ${nach} Fremdpixel (vorher ${vor})`);
  // natürliches Aussehen praktisch gleich: Gesichtsmitte unberührt, eingerastete Pixel behalten ihre Helligkeit
  const t=TJ[id],lum=(d,i)=>.299*d[i]+.587*d[i+1]+.114*d[i+2];let dl=0,m=0,mitte=0;
  for(let y=0;y<raw.height;y++)for(let x=0;x<raw.width;x++){const i=(y*raw.width+x)*4;if(!raw.data[i+3])continue;const same=raw.data[i]===img.data[i]&&raw.data[i+1]===img.data[i+1]&&raw.data[i+2]===img.data[i+2];if(same)continue;
   m++;dl+=Math.abs(lum(raw.data,i)-lum(img.data,i));if(id.includes('-se')&&Math.abs(x+t.dx)<=7&&y+t.dy>=-5&&y+t.dy<=2)mitte++;/* Augen, Nase – Dieters Bart beginnt darunter */}
  assert.equal(mitte,0,`${id}: Gesichtsmitte verändert`);assert.ok(dl/m<=30,`${id}: Helligkeit weicht ab (${(dl/m).toFixed(1)})`);}
});

test('Laufzeit: Kopf des Körpers ohne Fremdfarben im Haarbereich (hinten, alle Archetypen)',()=>{
 for(const [fig,arch] of Object.entries(FIG_ARCH)){const hair=new Set(cat.ramps[cat.archetypes[arch].hair].map(key)),skin=new Set([...cat.ramps.skin,...cat.ramps.blush].map(key)),patch=new Set(PAL.patch.map(key));
  const px=S.pixels('koerper',arch,'nw','kopf',0),col=new Map(px.map(p=>[p[0]+','+p[1],key(rgb(p))])),skinAt=(x,y)=>skin.has(col.get(x+','+y));
  const bad=px.filter(p=>{const k=key(rgb(p));return !hair.has(k)&&!skin.has(k)&&!patch.has(k)&&![[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>skinAt(p[0]+dx,p[1]+dy));});// Kontur an Ohr/Nacken zählt nicht
  assert.ok(bad.length<=8,`koerper-${arch} nw: ${bad.length} Fremdpixel im Kopf (${[...new Set(bad.map(p=>rgb(p).join(',')))].slice(0,8).join(' | ')})`);}
});
