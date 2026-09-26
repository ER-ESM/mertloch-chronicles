// Vorschau der Dungeon-Figuren (content/dungeon-figuren.js) direkt aus dem Werkzeug – ohne Laufzeitbau, zusammengesetzt mit dem gemeinsamen
// Kern (paperdoll-kern.js), umgefärbt wie im Spiel (paperdoll-art.js recolorMap) und auf Wunsch in Weltgröße verkleinert (Flächenmittel →
// Palette → Kontur wie paperdoll-art.js shrunk). Bibliothek (figurBild, figurBogen) und Werkzeug:
//   node tools/paperdoll/dungeon-vorschau.mjs [id,id|alle] [ordner=visual-review/dungeon-figuren] [S=2]
//   → <id>-nah.png (Richtungen × Posen, S-fach), <id>-welt.png (k = 0,3 / 0,45 / 0,6, dreifach vergrößert)
import {writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {encodePng,surface} from '../sprite-pipeline/png.mjs';
import {composeCore,sources as ordne,useShade} from '../../paperdoll-kern.js';
import {W,H,GROUND,BANDS,FRAMES,SONDER,PAL,GEAR,renderQuelle,renderSonder} from './puppe.mjs';
import {paperdoll,recolorMap,lookSources} from '../../paperdoll-art.js';
import {DUNGEON_FIGUREN} from '../../content/dungeon-figuren.js';

const LID={dieter:'dieter',baerbel:'ida',kevin:'kevin'};
// Schattentabelle, Palette und ein Katalog-Ersatz für recolorMap/lookSources (wie katalogAbleiten in puppe.mjs)
const shade={};for(const v of Object.values(PAL)){if(!Array.isArray(v[0]))continue;for(let k=0;k<v.length-1;k++){const c=v[k],key=c[0]<<16|c[1]<<8|c[2];if(!(key in shade))shade[key]=v[k+1];}}useShade(shade);
const PALETTE=[...new Set(Object.values(PAL).flatMap(v=>(Array.isArray(v[0])?v:[v]).map(c=>c[0]<<16|c[1]<<8|c[2])))].map(k=>[k>>16,k>>8&255,k&255]);
paperdoll.catalog={ramps:Object.fromEntries(['skin','blush','lip','hair','hairBrown','hairBlack'].map(k=>[k,Array.isArray(PAL[k][0])?PAL[k]:[PAL[k]]])),
 archetypes:{dieter:{hair:'hairBrown'},baerbel:{hair:'hair',dutt:true},kevin:{hair:'hairBlack'}},crownLooks:Object.keys(GEAR).filter(id=>GEAR[id].scheitel),
 openHead:Object.keys(GEAR).filter(id=>GEAR[id].slot==='head'&&GEAR[id].offen),items:Object.fromEntries(Object.keys(GEAR).map(k=>[k,k])),families:{},sources:Object.fromEntries(Object.entries(GEAR).map(([k,g])=>[k,{slot:g.slot}]))};
const slots=Object.fromEntries(Object.entries(GEAR).map(([k,g])=>[k,{slot:g.slot}]));
/** Bildangabe → {sonder,f}: 'stehen:0', 'hieb:1', 'laufen:3' (FRAMES) oder Sonderbild 'ausholen'. */
export function bildOf(name){const [a,i='0']=String(name).split(':'),s=SONDER.findIndex(x=>x.anim===a);if(s>=0)return {sonder:true,f:s,name:a};
 const f=FRAMES.findIndex(x=>x.anim===a&&x.i===+i);if(f<0)throw new Error('Bild unbekannt: '+name);return {sonder:false,f,name:a+':'+i};}
const memo=new Map();
function tiles(src,lid,dir,sonder){const k=[src,lid,dir,sonder].join('|');if(memo.has(k))return memo.get(k);
 const sh=sonder?renderSonder(src,lid,dir):renderQuelle(src,lid,dir),NF=sh.nf,T=BANDS.map(()=>new Array(NF).fill(null));
 BANDS.forEach((b,row)=>{for(let f=0;f<NF;f++){const q=sh.boxes[row*NF+f];if(!q)continue;const [x0,y0,x1,y1]=q,w=x1-x0+1,h=y1-y0+1,data=new Uint8ClampedArray(w*h*4);
  for(let y=0;y<h;y++){const si=((row*H+y0+y)*sh.width+f*W+x0)*4;data.set(sh.data.subarray(si,si+w*4),y*w*4);}T[row][f]={data,x:x0,y:y0,w,h};}});
 memo.set(k,T);return T;}
/** Quellen einer Figur in Zeichenfolge (wie paperdoll-art.js layers + lookSources). */
export function quellenOf(fig){const items=fig.gear.map(id=>({id,slot:GEAR[id]?.slot}));const set=new Set(fig.gear);for(const s of lookSources(fig.tint,items))if(GEAR[s])set.add(s);
 return ordne(set,slots).filter(s=>s!=='dutt'||fig.arch==='baerbel');}
/** Zusammengesetztes, umgefärbtes Vollbild (W×H RGBA) einer Figur in Richtung dir und Bild name. */
export function figurBild(id,dir,name){const fig=typeof id==='string'?DUNGEON_FIGUREN[id]:id;const lid=LID[fig.arch],b=bildOf(name),srcs=quellenOf(fig);
 for(const s of srcs)if(s!=='koerper'&&s!=='dutt'&&!GEAR[s])throw new Error('Quelle fehlt: '+s);
 const px=composeCore(W,H,BANDS,srcs,(s,band)=>{if(s==='dutt'&&band!=='kopf')return null;return tiles(s,lid,dir,b.sonder)[BANDS.indexOf(band)][b.f];});
 const m=recolorMap(fig.arch,fig.tint);for(let i=0;i<px.length;i+=4){if(!px[i+3])continue;const c=m.get(px[i]<<16|px[i+1]<<8|px[i+2]);if(c){px[i]=c[0];px[i+1]=c[1];px[i+2]=c[2];}}
 px.m=m;return px;}
function snapWith(pal){const cache=new Map();return (r,g,b)=>{const key=(r>>2)<<12|(g>>2)<<6|(b>>2);let c=cache.get(key);if(c)return c;let bd=1e18;
 for(const q of pal){const dr=r-q[0],dg=g-q[1],db=b-q[2],rm=(r+q[0])/2,d=(2+rm/256)*dr*dr+4*dg*dg+(2+(255-rm)/256)*db*db;if(d<bd){bd=d;c=q;}}cache.set(key,c);return c;};}
const snaps=new WeakMap();
/** Weltbild wie paperdoll-art.js shrunk (Flächenmittel → Palette der Figur → Kontur); k = Bildpunkte je Bogenpixel. */
export function welt(px,k){const m=px.m||new Map();let pick=snaps.get(m);if(!pick){pick=snapWith(PALETTE.map(q=>m.get(q[0]<<16|q[1]<<8|q[2])||q));snaps.set(m,pick);}
 const w=Math.round(W*k),h=Math.round(H*k),o=new Uint8ClampedArray(w*h*4);
 for(let y=0;y<h;y++){const y0=Math.floor(y/k),y1=Math.min(H,Math.ceil((y+1)/k));for(let x=0;x<w;x++){const x0=Math.floor(x/k),x1=Math.min(W,Math.ceil((x+1)/k));let r=0,g=0,b=0,a=0;
  for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++){const i=(yy*W+xx)*4;if(!px[i+3])continue;r+=px[i];g+=px[i+1];b+=px[i+2];a++;}
  if(!a||a/Math.max(1,(y1-y0)*(x1-x0))<.42)continue;const c=pick(r/a,g/a,b/a),j=(y*w+x)*4;o[j]=c[0];o[j+1]=c[1];o[j+2]=c[2];o[j+3]=255;}}
 const edge=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(!o[i+3])continue;const open=(X,Y)=>X<0||Y<0||X>=w||Y>=h||!o[(Y*w+X)*4+3];
  if(open(x+1,y)||open(x,y+1))edge.push([i,.45]);else if(open(x-1,y)||open(x,y-1))edge.push([i,.62]);}
 for(const [i,f] of edge)for(let c=0;c<3;c++)o[i+c]=o[i+c]*f+[44,32,34][c]*(1-f)*.55;return {w,h,data:o};}
// Ausschnitt je Kachel (Leinwandkoordinaten): Figur samt Überkopf-Schlag, ohne leeren Rand
export const CX0=W/2-112,CX1=W/2+112,CY0=40,CY1=GROUND+14,CW=CX1-CX0,CH=CY1-CY0;
const BG=[0x24,0x33,0x2b];
/** Bogen: Zeilen = [{id,dir}], Spalten = Bildnamen; S-fach. */
export function figurBogen(rows,cols,S=2,bg=BG){const pad=6,o=surface((CW*S+pad)*cols.length+pad,(CH*S+pad)*rows.length+pad);for(let i=0;i<o.data.length;i+=4)o.data.set([...bg,255],i);
 rows.forEach(({id,dir},r)=>cols.forEach((name,c)=>{const img=figurBild(id,dir,name),ox=pad+c*(CW*S+pad),oy=pad+r*(CH*S+pad);
  for(let y=0;y<CH*S;y++)for(let x=0;x<CW*S;x++){const px=CX0+(x/S|0),py=CY0+(y/S|0),q=(py*W+px)*4,dd=((oy+y)*o.width+ox+x)*4;
   if(img[q+3])o.data.set([img[q],img[q+1],img[q+2],255],dd);else{const u=(px+.5-W/2)/30,v=(py+.5-(GROUND-1))/6;if(u*u+v*v<=1)o.data.set([...bg.map(c=>c*.7|0),255],dd);}}}));
 return o;}
/** Weltgrößen-Bogen: Zeilen = k, Spalten = [{id,dir,name}], Z-fach vergrößert. */
export function weltBogen(cells,KS=[.3,.45,.6],Z=3,bg=[0x3b,0x50,0x30]){const pad=4,cw=KS.map(k=>Math.round(CW*k*.8)*Z),ch=KS.map(k=>Math.round(CH*k)*Z),oyOf=r=>pad+ch.slice(0,r).reduce((a,b)=>a+b+pad,0);
 const o=surface((Math.max(...cw)+pad)*cells.length+pad,oyOf(KS.length));for(let i=0;i<o.data.length;i+=4)o.data.set([...bg,255],i);
 KS.forEach((k,r)=>cells.forEach(({id,dir,name},c)=>{const {w,h,data:img}=welt(figurBild(id,dir,name),k),x0=Math.floor((W/2-CW*.4)*k),y0=Math.floor(CY0*k),ox=pad+c*(Math.max(...cw)+pad),oy=oyOf(r);
  for(let y=0;y<ch[r];y++)for(let x=0;x<cw[r];x++){const sx=x0+(x/Z|0),sy=y0+(y/Z|0);if(sx>=w||sy>=h)continue;const q=(sy*w+sx)*4;if(img[q+3])o.data.set([img[q],img[q+1],img[q+2],255],((oy+y)*o.width+ox+x)*4);}}));
 return o;}
/** Posen, die eine Figur zeigt: Stand, zwei Laufbilder, Hieb, Getroffen und ihre Sonderbilder. */
export function posenOf(fig){const out=['stehen:0','laufen:1','laufen:5','hieb:1','getroffen:0'],norm=n=>SONDER.some(s=>s.anim===n)||n.includes(':')?n:n+':0',add=n=>{if(!n)return;n=norm(n);if(!out.includes(n))out.push(n);};
 for(const p of Object.values(fig.posen||{})){add(p.cast);add(p.end);}if(fig.lie){add(fig.lie.claim);add(fig.lie.truth);}add(fig.confess);add(fig.drink);add(fig.idle);return out;}

const CLI=process.argv[1]&&process.argv[1].endsWith('dungeon-vorschau.mjs');
if(CLI&&process.argv[2]!=='--uebersicht'){const want=process.argv[2]&&process.argv[2]!=='alle'?process.argv[2].split(','):Object.keys(DUNGEON_FIGUREN).filter(k=>DUNGEON_FIGUREN[k].arch);
 const out=process.argv[3]||fileURLToPath(new URL('../../visual-review/dungeon-figuren/',import.meta.url)),S=+(process.argv[4]||2);mkdirSync(out,{recursive:true});
 for(const id of want){const t0=Date.now(),fig=DUNGEON_FIGUREN[id];if(!fig?.arch){console.log('kein Mensch:',id);continue;}const cols=posenOf(fig);
  writeFileSync(out+'/'+id+'-nah.png',encodePng(figurBogen(['se','sw','nw','ne'].map(dir=>({id,dir})),cols,S)));
  writeFileSync(out+'/'+id+'-welt.png',encodePng(weltBogen([['se','stehen:0'],['sw','laufen:2'],['nw','stehen:0'],['ne','laufen:5'],...cols.slice(5).map(n=>['se',n]),['sw','hieb:1']].map(([dir,name])=>({id,dir,name})))));
  console.log(id,cols.join(' '),(Date.now()-t0)+' ms');}}
// Übersicht: alle Menschen nebeneinander (se Stand, nw Stand, sw Laufen) nah (S=1) und in Weltgröße k=0,45 (×3) → uebersicht-nah.png / -welt.png
if(CLI&&process.argv[2]==='--uebersicht'){const out=process.argv[3]||fileURLToPath(new URL('../../visual-review/dungeon-figuren/',import.meta.url));mkdirSync(out,{recursive:true});
 const ids=Object.keys(DUNGEON_FIGUREN).filter(k=>DUNGEON_FIGUREN[k].arch),rows=['se','nw'];
 const o=figurBogenMulti(ids,rows);writeFileSync(out+'/uebersicht-nah.png',encodePng(o));
 writeFileSync(out+'/uebersicht-welt.png',encodePng(weltBogen(ids.flatMap(id=>[{id,dir:'se',name:'stehen:0'}]),[.45],3)));console.log('Übersicht',ids.length);}
function figurBogenMulti(ids,dirs,S=1){const pad=4,cw=150,o=surface((cw*S+pad)*ids.length+pad,(CH*S+pad)*dirs.length+pad);for(let i=0;i<o.data.length;i+=4)o.data.set([0x24,0x33,0x2b,255],i);
 ids.forEach((id,c)=>dirs.forEach((dir,r)=>{const img=figurBild(id,dir,'stehen:0'),ox=pad+c*(cw*S+pad),oy=pad+r*(CH*S+pad),x0=W/2-cw/2;
  for(let y=0;y<CH*S;y++)for(let x=0;x<cw*S;x++){const q=((CY0+(y/S|0))*W+x0+(x/S|0))*4;if(img[q+3])o.data.set([img[q],img[q+1],img[q+2],255],((oy+y)*o.width+ox+x)*4);}}));return o;}
