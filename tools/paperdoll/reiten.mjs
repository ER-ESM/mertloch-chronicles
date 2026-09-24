// Reiten mit der Anziehpuppe: Laufzeit-Bögen fürs Spiel und Vorschauen.
//   node tools/paperdoll/puppe.mjs --reiten [ziel]      Laufzeit-Bögen nach assets/paperdoll/reiten (je Reittier × Archetyp; dauert Minuten,
//                                                        Arbeits-Threads: REITEN_JOBS=n); danach node scripts/pwa-cache.mjs
//   node tools/paperdoll/reiten.mjs --vorschau [reittiere] [archetypen] [richtungen] [datei]   Kontaktbogen aus den Laufzeit-Bögen
//   node tools/paperdoll/reiten.mjs [ausgabe] [figuren] [reittiere] [richtungen] [vorschau]    Streifen direkt aus dem Werkzeug (9 Bilder)
// Laufzeit-Format (paperdoll-mount.js liest es): catalog.json (Reittiere, Quellen, Palette) + je Reittier <id>.json mit Kacheltabellen und
// je Bild einer Liste [Band, Kachel, X, Y, gespiegelt] in Reittier-Leinwand-Koordinaten (MW×MH, Fußpunkt pivot). Kacheln sind auf ihren
// Inhalt beschnitten, doppelte Kacheln (Fahrzeuge im Leerlauf, gleiche Posen) nur einmal gespeichert und in Atlasseiten gepackt
// (<id>-tier-N.png = Reittier, <id>-<archetyp>-N.png = Reiter). sw/ne = Spiegelung von se/nw, außer seitengebundene Teile oder Schrift.
import {readFileSync,writeFileSync,mkdirSync,rmSync,existsSync} from 'node:fs';
import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';
import {availableParallelism} from 'node:os';
import {createHash} from 'node:crypto';
import {deflateSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {encodePng,decodePng,surface} from '../sprite-pipeline/png.mjs';
import {renderRide,rideRider,rideMount,rideKey,rideSided,rideSources,MOUNT_IDS,MOUNT_INFO,MW,MH,MGROUND,BANDS,PAL,GEAR,LOOK,GAME_ARCH} from './puppe.mjs';
import {composeCore,sources,useShade} from '../../paperdoll-kern.js';
const here=fileURLToPath(new URL('.',import.meta.url));
const TW=160,TH=216,FRAMES=9,PW=1024,PH=2048;
/** Beispiel-Ausrüstung je Figur für Vorschauen. */
export const REITER={ida:['dienstmuetze','kutte','jeans','kabelbinderstiefel','praktikantenausweis'],dieter:['regenjacke','jeans','festivalstiefel','bierbong'],kevin:['dachsdeckel','kutte','jeans','fuchspfote','gansorden']};
const shadeTable=()=>{const shade={};for(const v of Object.values(PAL)){if(!Array.isArray(v[0]))continue;for(let k=0;k<v.length-1;k++){const c=v[k],key=c[0]<<16|c[1]<<8|c[2];if(!(key in shade))shade[key]=v[k+1];}}return shade;};

// ---------- Arbeits-Threads: Reiter je (Reittier, Figur), Reittier je Reittier ----------
/** RGBA-Feld auf den Inhalt beschneiden → {x,y,w,h,data} oder null. */
function crop(px,w,h){let x0=w,y0=h,x1=-1,y1=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(px[(y*w+x)*4+3]){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 if(x1<0)return null;const cw=x1-x0+1,ch=y1-y0+1,data=new Uint8ClampedArray(cw*ch*4);for(let y=0;y<ch;y++)data.set(px.subarray(((y0+y)*w+x0)*4,((y0+y)*w+x1+1)*4),y*cw*4);return {x:x0,y:y0,w:cw,h:ch,data};}
/** Unterscheidet sich die sw/ne-Zeichnung einer Quelle von der gespiegelten se/nw-Zeichnung (z. B. eingepasste Anhänger, die lesbar bleiben)? */
function differs(a={},b={}){for(const band of new Set([...Object.keys(a),...Object.keys(b)])){const p=a[band],q=b[band];if(!p||!q)return true;
 for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const i=(y*TW+x)*4,j=(y*TW+TW-1-x)*4;if(p[i+3]!==q[j+3]||p[i]!==q[j]||p[i+1]!==q[j+1]||p[i+2]!==q[j+2])return true;}}return false;}
/** Reiter: gleiche Anker ⇒ gleiche Pose (einmal rendern). sw/ne: seitengebundene Quellen, Schrift und alles, was gespiegelt anders aussähe, neu; Rest gespiegelt. */
function riderJob(lid,mount){const ids=rideSources(),poses=[],frames={se:[],sw:[],nw:[],ne:[]},own={},first={};
 const put=(r,srcs)=>{const tiles={};for(const id of srcs){const b=r.rider[id];if(!b)continue;for(const band of Object.keys(b)){const c=crop(b[band],TW,TH);if(c)(tiles[id]??={})[band]=c;}}poses.push({off:r.off,tiles});return poses.length-1;};
 for(const dir of ['se','nw']){const seen=new Map();for(let k=0;k<FRAMES;k++){const key=rideKey(mount,dir,k);let i=seen.get(key);if(i===undefined){const r=rideRider(lid,mount,ids,dir,k);if(!k)first[dir]=r;i=put(r,ids);seen.set(key,i);}frames[dir].push({pose:i});}}
 for(const [dir,base] of [['sw','se'],['ne','nw']]){const probe=rideRider(lid,mount,ids,dir,0),seen=new Map();own[dir]=ids.filter(id=>rideSided(id)||probe.text.has(id)||differs(first[base].rider[id],probe.rider[id]));
  for(let k=0;k<FRAMES;k++){const key=rideKey(mount,dir,k);let j=seen.get(key);if(j===undefined){j=put(k===0?probe:rideRider(lid,mount,own[dir],dir,k),own[dir]);seen.set(key,j);}frames[dir].push({mirror:frames[base][k].pose,pose:j});}}
 return {lid,mount,poses,frames,own};}
function mountJob(mount){const frames={se:[],nw:[]};for(const dir of ['se','nw'])for(let k=0;k<FRAMES;k++){const m=rideMount(mount,dir,k),tiles={};for(const band of Object.keys(m)){const c=crop(m[band],MW,MH);if(c)tiles[band]=c;}frames[dir].push(tiles);}return {mount,frames};}
const buffers=o=>{const out=[];(function walk(v){if(!v||typeof v!=='object')return;if(v instanceof Uint8ClampedArray){out.push(v.buffer);return;}for(const k of Object.keys(v))walk(v[k]);})(o);return out;};
if(!isMainThread&&workerData?.reiten)parentPort.on('message',job=>{const r=job.kind==='mount'?mountJob(job.mount):riderJob(job.lid,job.mount);parentPort.postMessage(r,buffers(r));});
async function runJobs(jobs,n,log){const results=[];let next=0;const t0=Date.now();
 await Promise.all(Array.from({length:Math.min(n,jobs.length)},()=>new Promise((resolve,reject)=>{const w=new Worker(new URL(import.meta.url),{workerData:{reiten:true}});
  const take=()=>{if(next>=jobs.length){w.terminate().then(resolve);return;}const job=jobs[next++];w.once('message',r=>{results.push(r);log(`${results.length}/${jobs.length} ${job.kind==='mount'?job.mount:job.mount+'/'+job.lid} ${((Date.now()-t0)/1000).toFixed(0)} s`);take();});w.postMessage(job);};
  w.on('error',reject);take();})));
 return results;}

// ---------- Atlas: Kacheln entdoppeln, in Seiten packen, als PNG (Palette, sonst RGBA) schreiben ----------
function atlas(){const tiles=[],hash=new Map();return {tiles,add(c){const h=createHash('sha1').update(c.w+'x'+c.h+'|').update(new Uint8Array(c.data.buffer,c.data.byteOffset,c.data.byteLength)).digest('base64');let i=hash.get(h);if(i===undefined){i=tiles.length;tiles.push(c);hash.set(h,i);}return i;}};}
/** Regalpacken: nach Höhe sortiert, erstes passendes Regal, sonst neues Regal bzw. neue Seite. → [page,x,y,w,h] je Kachel + Seitenhöhen. */
function pack(tiles){const order=tiles.map((_,i)=>i).sort((a,b)=>tiles[b].h-tiles[a].h||tiles[b].w-tiles[a].w),place=new Array(tiles.length),pages=[];
 for(const i of order){const t=tiles[i];let spot=null;
  for(let p=0;p<pages.length&&!spot;p++)for(const s of pages[p].shelves)if(s.h>=t.h&&PW-s.x>=t.w){spot=[p,s.x,s.y];s.x+=t.w;break;}
  if(!spot){let p=pages.findIndex(pg=>PH-pg.h>=t.h);if(p<0){pages.push({h:0,shelves:[]});p=pages.length-1;}const pg=pages[p],s={y:pg.h,h:t.h,x:t.w};pg.shelves.push(s);pg.h+=t.h;spot=[p,0,s.y];}
  place[i]=[...spot,t.w,t.h];}
 return {place,heights:pages.map(p=>p.h)};}
const crcTable=Array.from({length:256},(_,i)=>{for(let b=0;b<8;b++)i=(i>>>1)^((i&1)?0xedb88320:0);return i>>>0;});
const crc32=b=>{let n=0xffffffff;for(const x of b)n=crcTable[(n^x)&255]^(n>>>8);return (n^0xffffffff)>>>0;};
const chunk=(type,data)=>{const tag=Buffer.from(type),out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length);tag.copy(out,4);data.copy(out,8);out.writeUInt32BE(crc32(Buffer.concat([tag,data])),8+data.length);return out;};
/** Zeilenfilter je Zeile nach kleinster Betragssumme (PNG-Standardheuristik). */
function filtered(raw,w,h,bpp){const stride=w*bpp,out=Buffer.alloc(h*(stride+1)),cand=Array.from({length:5},()=>Buffer.alloc(stride));
 for(let y=0;y<h;y++){const row=raw.subarray(y*stride,(y+1)*stride),up=y?raw.subarray((y-1)*stride,y*stride):null;let best=0,bs=Infinity;
  for(let f=0;f<5;f++){const c=cand[f];let s=0;for(let x=0;x<stride;x++){const a=x>=bpp?row[x-bpp]:0,b=up?up[x]:0,d=up&&x>=bpp?up[x-bpp]:0;let pr=0;
    if(f===1)pr=a;else if(f===2)pr=b;else if(f===3)pr=(a+b)>>1;else if(f===4){const p=a+b-d,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-d);pr=pa<=pb&&pa<=pc?a:pb<=pc?b:d;}
    const v=(row[x]-pr)&255;c[x]=v;s+=v<128?v:256-v;}if(s<bs){bs=s;best=f;}}
  out[y*(stride+1)]=best;cand[best].copy(out,y*(stride+1)+1);}
 return out;}
/** PNG mit Palette (≤ 255 Farben + durchsichtig), sonst RGBA. */
export function encodeCompact({width:w,height:h,data}){const head=Buffer.alloc(13);head.writeUInt32BE(w);head.writeUInt32BE(h,4);head[8]=8;
 const map=new Map(),pal=[[0,0,0]],idx=Buffer.alloc(w*h);let ok=true;
 for(let i=0;i<w*h&&ok;i++){if(!data[i*4+3])continue;const k=data[i*4]<<16|data[i*4+1]<<8|data[i*4+2];let n=map.get(k);if(n===undefined){if(pal.length>=256){ok=false;break;}n=pal.length;map.set(k,n);pal.push([data[i*4],data[i*4+1],data[i*4+2]]);}idx[i]=n;}
 if(!ok){head[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',head),chunk('IDAT',deflateSync(filtered(Buffer.from(data.buffer,data.byteOffset,w*h*4),w,h,4),{level:9})),chunk('IEND',Buffer.alloc(0))]);}
 head[9]=3;const trns=Buffer.from([0]);
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',head),chunk('PLTE',Buffer.from(pal.flat())),chunk('tRNS',trns),chunk('IDAT',deflateSync(filtered(idx,w,h,1),{level:9})),chunk('IEND',Buffer.alloc(0))]);}
function writeAtlas(out,name,A){const {place,heights}=pack(A.tiles),files=[];let bytes=0;
 heights.forEach((ph,p)=>{const s=surface(PW,ph);A.tiles.forEach((t,i)=>{const [pg,x,y]=place[i];if(pg!==p)return;for(let r=0;r<t.h;r++)s.data.set(t.data.subarray(r*t.w*4,(r+1)*t.w*4),((y+r)*PW+x)*4);});
  const file=`${name}-${p}.png`,png=encodeCompact(s);writeFileSync(out+file,png);bytes+=png.length;files.push(file);});
 return {files,tiles:place,bytes};}

// ---------- Aufbau ----------
const mirrorX=(X,w)=>MW-(X+w);
/** Schattenmaß über alle 9 Bilder: Deckung in den untersten 22 Zeilen (Reittier + Körper). */
function shadowOf(frameEntries){let x0=MW*2,x1=-MW;for(const list of frameEntries)for(const [c,X,Y,flip] of list){
 for(let r=0;r<c.h;r++){const Yr=Y+r;if(Yr<MGROUND-22||Yr>MGROUND)continue;for(let x=0;x<c.w;x++)if(c.data[(r*c.w+x)*4+3]){const Xc=X+(flip?c.w-1-x:x);if(Xc<x0)x0=Xc;if(Xc>x1)x1=Xc;}}}
 return x1<x0?{cx:MW/2,rx:20}:{cx:+((x0+x1)/2).toFixed(1),rx:+Math.max(20,(x1-x0)/2+4).toFixed(1)};}
export async function buildRideRuntime(outDir,{mounts=MOUNT_IDS,jobs=+(process.env.REITEN_JOBS||Math.max(1,Math.min(8,availableParallelism()-2)))}={}){
 const out=outDir.replace(/[\\/]?$/,'/'),t0=Date.now(),archOf=Object.fromEntries(Object.entries(GAME_ARCH));
 if(existsSync(out))rmSync(out,{recursive:true,force:true});mkdirSync(out,{recursive:true});
 const list=[...mounts.map(mount=>({kind:'mount',mount})),...mounts.flatMap(mount=>Object.keys(LOOK).map(lid=>({kind:'rider',mount,lid})))];
 console.log(`Reit-Bögen: ${list.length} Aufträge, ${jobs} Threads`);
 const results=await runJobs(list,jobs,s=>console.log(' ',s));
 const ids=rideSources(),cat={version:1,W:MW,H:MH,ground:MGROUND,pivot:{x:MW/2,y:MGROUND},frames:FRAMES,worldHeight:26,bands:BANDS,dirs:['se','sw','nw','ne'],
  archetypes:Object.fromEntries(Object.entries(GAME_ARCH).map(([lid,a])=>[a,{look:lid}])),
  sources:Object.fromEntries(ids.map(id=>[id,{slot:id==='koerper'?'body-base':id==='dutt'?'hair':GEAR[id].slot}])),mounts:{},shade:shadeTable(),
  palette:[...new Set(Object.values(PAL).flatMap(v=>(Array.isArray(v[0])?v:[v]).map(c=>c[0]<<16|c[1]<<8|c[2])))]};
 let total=0;
 for(const mount of mounts){const M={id:mount,pages:{},tiles:{},mount:{},riders:{},shadow:{}},mr=results.find(r=>!r.lid&&r.mount===mount);
  // Reittier: se/nw gerendert, sw/ne gespiegelt
  const A=atlas();for(const dir of ['se','nw']){M.mount[dir]=mr.frames[dir].map(tiles=>BANDS.filter(b=>tiles[b]).map(b=>{const c=tiles[b];return [BANDS.indexOf(b),A.add(c),c.x,c.y,0];}));}
  for(const [dir,base] of [['sw','se'],['ne','nw']])M.mount[dir]=M.mount[base].map(list=>list.map(([b,t,X,Y])=>[b,t,mirrorX(X,A.tiles[t].w),Y,1]));
  const tileList=(list,T)=>list.map(([,t,X,Y,f])=>[T[t],X,Y,f]);
  M.shadow['@']=Object.fromEntries(cat.dirs.map(d=>[d,shadowOf(M.mount[d].map(l=>tileList(l,A.tiles)))]));
  {const w=writeAtlas(out,`${mount}-tier`,A);M.pages['@']=w.files;M.tiles['@']=w.tiles;total+=w.bytes;}
  // Reiter je Archetyp
  for(const r of results.filter(r=>r.lid&&r.mount===mount)){const arch=archOf[r.lid],R=atlas(),poses=[],index=new Map(),rd={poses};
   const place=(P,src,flip)=>{const o={};for(const [id,bands] of Object.entries(P.tiles)){if(!src(id))continue;o[id]=BANDS.filter(b=>bands[b]).map(b=>{const c=bands[b],X=P.off[0]+c.x,Y=P.off[1]+c.y,t=R.add(c);return flip?[BANDS.indexOf(b),t,mirrorX(X,c.w),Y,1]:[BANDS.indexOf(b),t,X,Y,0];});}return o;};
   const pose=o=>{const key=JSON.stringify(o);let i=index.get(key);if(i===undefined){i=poses.length;poses.push(o);index.set(key,i);}return i;};
   for(const dir of cat.dirs)rd[dir]=r.frames[dir].map(f=>f.mirror===undefined?pose(place(r.poses[f.pose],()=>true,false)):pose({...place(r.poses[f.mirror],id=>!r.own[dir].includes(id),true),...place(r.poses[f.pose],()=>true,false)}));
   rd.own=r.own;M.riders[arch]=rd;
   M.shadow[arch]=Object.fromEntries(cat.dirs.map(d=>[d,shadowOf(M.mount[d].map((list,k)=>[...tileList(list,A.tiles),...tileList(poses[rd[d][k]].koerper||[],R.tiles)]))]));
   const w=writeAtlas(out,`${mount}-${arch}`,R);M.pages[arch]=w.files;M.tiles[arch]=w.tiles;total+=w.bytes;}
  const json=JSON.stringify(M);writeFileSync(out+mount+'.json',json);total+=json.length;
  cat.mounts[mount]={...MOUNT_INFO[mount],file:mount+'.json',pages:M.pages};
  console.log(`  ${mount}: ${Object.entries(M.pages).map(([k,v])=>k+' '+v.length).join(', ')}`);}
 const json=JSON.stringify(cat);writeFileSync(out+'catalog.json',json);total+=json.length;
 console.log(`Reit-Bögen fertig: ${(total/1048576).toFixed(2)} MB, ${((Date.now()-t0)/1000).toFixed(0)} s → ${out}`);return {bytes:total};}

// ---------- Zusammensetzen aus den Laufzeit-Bögen (Node-Gegenstück zu paperdoll-mount.js, für Vorschau und Prüfung) ----------
export function loadRideRuntime(dir){const cat=JSON.parse(readFileSync(dir+'/catalog.json','utf8')),mounts={},pages=new Map();
 const page=f=>{if(!pages.has(f))pages.set(f,decodePng(readFileSync(dir+'/'+f)));return pages.get(f);};
 for(const id of Object.keys(cat.mounts))mounts[id]=JSON.parse(readFileSync(dir+'/'+cat.mounts[id].file,'utf8'));
 return {cat,mounts,page};}
/** Ein Bild (Richtung, Bild k) mit Reiter arch (oder null) und Quellenmenge; → {data,x0,y0,w,h} in Reittier-Leinwand-Koordinaten. */
export function composeRide(rt,mountId,arch,dir,k,set=new Set()){const {cat}=rt,M=rt.mounts[mountId],entries=[],gear=cat.sources;
 for(const e of M.mount[dir][k])entries.push(['@',e]);
 const order=arch?sources(new Set([...set].filter(s=>gear[s]&&gear[s].slot!=='body-base')),gear):[];
 if(arch){const P=M.riders[arch].poses[M.riders[arch][dir][k]];for(const s of order)for(const e of P[s]||[])entries.push([s,e]);}
 let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [s,[,t,X,Y]] of entries){const T=M.tiles[s==='@'?'@':arch][t];x0=Math.min(x0,X);y0=Math.min(y0,Y);x1=Math.max(x1,X+T[3]);y1=Math.max(y1,Y+T[4]);}
 const w=x1-x0,h=y1-y0,buf=new Uint8ClampedArray(w*h*4);
 const data=composeCore(w,h,cat.bands,[...order,'@'],(s,band)=>{const bi=cat.bands.indexOf(band),list=entries.filter(([q,e])=>q===s&&e[0]===bi);if(!list.length)return null;buf.fill(0);
  for(const [q,[,t,X,Y,flip]] of list){const key=q==='@'?'@':arch,[pg,px,py,tw,th]=M.tiles[key][t],img=rt.page(M.pages[key][pg]);
   for(let r=0;r<th;r++)for(let c=0;c<tw;c++){const si=((py+r)*img.width+px+c)*4;if(!img.data[si+3])continue;const di=((Y-y0+r)*w+X-x0+(flip?tw-1-c:c))*4;buf[di]=img.data[si];buf[di+1]=img.data[si+1];buf[di+2]=img.data[si+2];buf[di+3]=255;}}
  return buf;});
 return {data,x0,y0,w,h};}
function contactSheet(rt,rows,file){const cols=[0,2,4,6],g=6,Wd=cols.length*(MW+g)+g,Hd=rows.length*(MH+g)+g,sh=surface(Wd,Hd);for(let i=0;i<sh.data.length;i+=4)sh.data.set([0x2c,0x24,0x27,255],i);
 rows.forEach(({mount,arch,dir,set},r)=>{const shd=rt.mounts[mount].shadow[arch||'@'][dir];cols.forEach((k,c)=>{const f=composeRide(rt,mount,arch,dir,k,set),ox=g+c*(MW+g),oy=g+r*(MH+g);
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const dx=(x+.5-shd.cx-.5)/shd.rx,dy=(y+.5-(MGROUND-1))/(shd.rx*.22);if(dx*dx+dy*dy<=1)sh.data.set([0x1f,0x19,0x1b,255],((oy+y)*Wd+ox+x)*4);}
  for(let y=0;y<f.h;y++)for(let x=0;x<f.w;x++){const X=f.x0+x,Y=f.y0+y,si=(y*f.w+x)*4;if(!f.data[si+3]||X<0||Y<0||X>=MW||Y>=MH)continue;sh.data.set([f.data[si],f.data[si+1],f.data[si+2],255],((oy+Y)*Wd+ox+X)*4);}});});
 writeFileSync(file,encodePng(sh));return file;}

// ---------- Kommandozeile ----------
if(isMainThread&&process.argv[1]&&process.argv[1].endsWith('reiten.mjs')){const args=process.argv.slice(2);
 if(args[0]==='--vorschau'){// Kontaktbogen aus den Laufzeit-Bögen (so, wie das Spiel sie zusammensetzt)
  const [,mArg='hofpferd,drahtesel',aArg='baerbel,kevin',dArg='se,nw',name]=args,rt=loadRideRuntime(process.env.REITEN_DIR||here+'../../assets/paperdoll/reiten');useShade(rt.cat.shade);
  const lidOf=Object.fromEntries(Object.entries(GAME_ARCH).map(([l,a])=>[a,l])),rows=[];
  for(const mount of mArg.split(','))for(const arch of aArg.split(','))for(const dir of dArg.split(','))rows.push({mount,arch:arch==='-'?null:arch,dir,set:new Set(arch==='-'?[]:REITER[lidOf[arch]])});
  const file=name||here+'../../visual-review/mounts/reiten-vorschau.png';mkdirSync(file.replace(/[\\/][^\\/]*$/,''),{recursive:true});console.log('Vorschau',contactSheet(rt,rows,file));}
 else{// Streifen direkt aus dem Werkzeug (Band für Band verschränkt) + Schattenmaß, optional Vorschau
  const [outArg='reit',figArg='ida,dieter,kevin',mArg=MOUNT_IDS.join(','),dArg='se,sw,nw,ne',prev='']=args,out=here+outArg+'/';mkdirSync(out,{recursive:true});useShade(shadeTable());
  const rideFrame=(lid,m,dir,k)=>{const ids=sources(new Set(REITER[lid]),GEAR),r=renderRide(lid,m,ids,dir,k);
   return composeCore(MW,MH,BANDS,[...ids,'@'],(s,band)=>{if(s==='@')return r.mount[band]||null;const t=r.rider[s]?.[band];if(!t)return null;const o=new Uint8ClampedArray(MW*MH*4);
    for(let y=0;y<TH;y++){const Y=y+r.off[1];if(Y<0||Y>=MH)continue;for(let x=0;x<TW;x++){const X=x+r.off[0];if(X<0||X>=MW)continue;const i=(y*TW+x)*4;if(t[i+3])o.set(t.subarray(i,i+4),(Y*MW+X)*4);}}return o;});};
  const t0=Date.now(),strips={},shadow={};
  for(const lid of figArg.split(','))for(const m of mArg.split(','))for(const dir of dArg.split(',')){const s=surface(MW*9,MH);
   for(let k=0;k<9;k++){const px=rideFrame(lid,m,dir,k);for(let y=0;y<MH;y++)s.data.set(px.subarray(y*MW*4,(y+1)*MW*4),(y*MW*9+k*MW)*4);}
   {let x0=MW,x1=0;for(let y=MGROUND-22;y<=MGROUND;y++)for(let x=0;x<MW;x++)if(s.data[(y*s.width+x)*4+3]){if(x<x0)x0=x;if(x>x1)x1=x;}shadow[`${m}-${lid}-${dir}`]={cx:(x0+x1)/2,rx:Math.max(20,(x1-x0)/2+4)};}
   writeFileSync(`${out}${m}-${lid}-${dir}.png`,encodePng(s));strips[`${m}-${lid}-${dir}`]=s;}
  {let old={};try{old=JSON.parse(readFileSync(out+'reiten.json','utf8')).shadow||{};}catch(e){}writeFileSync(out+'reiten.json',JSON.stringify({MW,MH,ground:MGROUND,frames:9,mounts:MOUNT_INFO,reiter:REITER,shadow:{...old,...shadow}}));}
  // Vorschau: Zeilen = Streifen, Spalten = Bild 0, 2, 4, 6 (ZOOM=n) auf Bühnengrund
  if(prev){const keys=Object.keys(strips),cols=[0,2,4,6],Z=+(process.env.ZOOM||1),g=6,Wd=cols.length*(MW*Z+g)+g,Hd=keys.length*(MH*Z+g)+g,sh=surface(Wd,Hd);for(let i=0;i<sh.data.length;i+=4)sh.data.set([0x2c,0x24,0x27,255],i);
   keys.forEach((key,r)=>cols.forEach((k,c)=>{const s=strips[key];for(let y=0;y<MH*Z;y++)for(let x=0;x<MW*Z;x++){const i=((y/Z|0)*s.width+k*MW+(x/Z|0))*4;const dx=((x/Z)+.5-MW/2)/34,dy=((y/Z)+.5-(MGROUND-1))/7,j=((g+r*(MH*Z+g)+y)*Wd+g+c*(MW*Z+g)+x)*4;
    if(s.data[i+3])sh.data.set([s.data[i],s.data[i+1],s.data[i+2],255],j);else if(dx*dx+dy*dy<=1)sh.data.set([0x1f,0x19,0x1b,255],j);}}));
   mkdirSync(here+'out',{recursive:true});writeFileSync(here+'out/'+prev+'.png',encodePng(sh));}
  console.log('Reitbilder',Object.keys(strips).length,'Streifen',(Date.now()-t0)+' ms');}}
