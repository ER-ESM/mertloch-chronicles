// Kontaktbögen für Waffen, Kleidung und Glücksbringer an der Anziehpuppe – direkt aus dem Werkzeug gezeichnet (kein Laufzeitbau nötig), zusammengesetzt mit
// dem gemeinsamen Kern wie im Spiel. Je Kennung:
//   <id>.png        Figur ida, Zeilen se/sw/nw/ne, Spalten die Bilder, in denen das Spiel die Waffe zeigt (Maßstab S, Standard 2)
//   <id>-alle.png   alle drei Archetypen × vier Richtungen (Maßstab 1)
//   <id>-welt.png   Weltgrößen-Simulation wie paperdoll-art.js shrunk (Flächenmittel → Palette → Kontur) bei k = 0,3 / 0,45 / 0,6, 3-fach vergrößert
//   <id>_nh.png     Einhandwaffe zusätzlich in der Nebenhand (Beidhändig mit derselben Waffe)
//   <id>-symbol.png Gegenstandssymbol (assets/precision/runtime/items/<id>.png) ×2 neben der Figur se und nw in Weltgröße 0,45 (ebenfalls ×2)
// node tools/paperdoll/waffen-vorschau.mjs [kennung,kennung,…] [ordner=tools/paperdoll/out-waffen] [S=2]
import {writeFileSync,mkdirSync,readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {encodePng,decodePng,surface} from '../sprite-pipeline/png.mjs';
import {composeCore,sources,useShade} from '../../paperdoll-kern.js';
import {W,H,GROUND,BANDS,FRAMES,PAL,GEAR,renderQuelle} from './puppe.mjs';

export const NEUE_WAFFEN=['rohrzange','fasskeule','kronkorkenstern','gartenzwerg','grillzange','masskrugschild','schorlenspritze','blitzschrauber'];
const ids=(process.argv[2]||NEUE_WAFFEN.join(',')).split(',').filter(Boolean);
const out=process.argv[3]||fileURLToPath(new URL('./out-waffen/',import.meta.url)),S=+(process.argv[4]||2);mkdirSync(out,{recursive:true});
const FIGS=['ida','dieter','kevin'],DIRN=['se','sw','nw','ne'],KLEID=['jeans','festivalstiefel'];
// Farbtreppen → nächstdunklere Stufe (Kontaktschatten), wie buildRuntime (cat.shade)
const shade={};for(const v of Object.values(PAL)){if(!Array.isArray(v[0]))continue;for(let k=0;k<v.length-1;k++){const c=v[k],key=c[0]<<16|c[1]<<8|c[2];if(!(key in shade))shade[key]=v[k+1];}}useShade(shade);
const PALETTE=[...new Set(Object.values(PAL).flatMap(v=>(Array.isArray(v[0])?v:[v]).map(c=>c[0]<<16|c[1]<<8|c[2])))].map(k=>[k>>16,k>>8&255,k&255]);
const at=(anim,i=0)=>FRAMES.findIndex(f=>f.anim===anim&&f.i===i);
/** Bilder, in denen das Spiel die Waffe zeigt (Nahkampf nie in Zielen/Schuss, Fernkampf nie im Hieb); Kleidung und Glücksbringer: Querschnitt aller Posen. */
function framesOf(id){const g=GEAR[id];
 if(!['weapon','offhand','ranged'].includes(g.slot))return [at('stehen'),at('laufen',1),at('laufen',5),at('hieb',0),at('hieb',1),at('parade'),at('zaubern'),at('rasten'),at('sprint'),at('zielen')];
 if(g.slot==='ranged')return [at('stehen'),at('laufen',1),at('laufen',5),at('zielen'),at('schuss'),at('parade'),at('parade2'),at('getroffen'),at('sprint')];
 const h=g.hands===2?'hieb2':'hieb';return [at('stehen'),at('laufen',1),at('laufen',5),at(h,0),at(h,1),at(h,2),at(g.hands===2?'parade2':'parade'),at('getroffen'),at('zaubern'),at('rasten'),at('sprint')];}
/** Ausrüstung der Vorschau: Schild mit Einhandwaffe, Nebenhand-Fassung zusammen mit der Hauptwaffe. */
function setOf(id){const g=GEAR[id];if(g.slot==='offhand'&&!/_nh$/.test(id))return [...KLEID,'fasskeule',id];if(/_nh$/.test(id))return [...KLEID,id.slice(0,-3),id];return [...KLEID,id];}
/** Bogen einer Quelle, gleich auf die Inhaltshülle je Band × Bild zugeschnitten ({data,x,y,w,h} wie die Laufzeit-Kacheln; der volle Bogen wäre ~70 MB). */
const memo=new Map();
function tiles(s,fig,d){const k=s+'|'+fig+'|'+d;if(memo.has(k))return memo.get(k);const sh=renderQuelle(s,fig,d),T=BANDS.map(()=>FRAMES.map(()=>null));
 BANDS.forEach((b,row)=>FRAMES.forEach((fr,f)=>{const q=sh.boxes[row*FRAMES.length+f];if(!q)return;const [x0,y0,x1,y1]=q,w=x1-x0+1,h=y1-y0+1,data=new Uint8ClampedArray(w*h*4);
  for(let y=0;y<h;y++){const si=((row*H+y0+y)*sh.width+f*W+x0)*4;data.set(sh.data.subarray(si,si+w*4),y*w*4);}T[row][f]={data,x:x0,y:y0,w,h};}));
 memo.set(k,T);return T;}
const gear=Object.fromEntries(Object.entries(GEAR).map(([k,g])=>[k,{slot:g.slot}]));
function compose(fig,d,set,f){return composeCore(W,H,BANDS,sources(new Set(set),gear),(s,band)=>{if(s==='dutt'&&(band!=='kopf'||fig!=='ida'))return null;return tiles(s,fig,d)[BANDS.indexOf(band)][f];});}
// Ausschnitt je Kachel (Leinwandkoordinaten): die Figur samt Überkopf-Schlag, ohne leeren Rand
const CX0=W/2-112,CX1=W/2+112,CY0=56,CY1=GROUND+14,CW=CX1-CX0,CH=CY1-CY0;
const BG=[0x2a,0x25,0x2c];
/** Bogen: rows = [{fig,d,set}], cols = Bildnummern. */
function bogen(rows,cols,s,file){const pad=6,o=surface((CW*s+pad)*cols.length+pad,(CH*s+pad)*rows.length+pad);for(let i=0;i<o.data.length;i+=4)o.data.set([...BG,255],i);
 rows.forEach(({fig,d,set},r)=>cols.forEach((f,c)=>{const img=compose(fig,d,set,f),ox=pad+c*(CW*s+pad),oy=pad+r*(CH*s+pad);
  for(let y=0;y<CH*s;y++)for(let x=0;x<CW*s;x++){const px=CX0+(x/s|0),py=CY0+(y/s|0),q=(py*W+px)*4,dd=((oy+y)*o.width+ox+x)*4;
   if(img[q+3])o.data.set([img[q],img[q+1],img[q+2],255],dd);else{const u=(px+.5-W/2)/30,v=(py+.5-(GROUND-1))/6;if(u*u+v*v<=1)o.data.set([...BG.map(c=>c*.7|0),255],dd);}
   if((px===CX0||py===CY0)&&!img[q+3])o.data.set([60,54,64,255],dd);}}));
 writeFileSync(out+'/'+file,encodePng(o));return o;}
function snap(r,g,b){let bd=1e18,c;for(const q of PALETTE){const dr=r-q[0],dg=g-q[1],db=b-q[2],rm=(r+q[0])/2,d=(2+rm/256)*dr*dr+4*dg*dg+(2+(255-rm)/256)*db*db;if(d<bd){bd=d;c=q;}}return c;}
/** Weltbild wie paperdoll-art.js shrunk. */
function shrunk(px,k){const w=Math.round(W*k),h=Math.round(H*k),o=new Uint8ClampedArray(w*h*4);
 for(let y=0;y<h;y++){const y0=Math.floor(y/k),y1=Math.min(H,Math.ceil((y+1)/k));for(let x=0;x<w;x++){const x0=Math.floor(x/k),x1=Math.min(W,Math.ceil((x+1)/k));let r=0,g=0,b=0,a=0;
  for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++){const i=(yy*W+xx)*4;if(!px[i+3])continue;r+=px[i];g+=px[i+1];b+=px[i+2];a++;}
  if(!a||a/Math.max(1,(y1-y0)*(x1-x0))<.42)continue;const c=snap(r/a,g/a,b/a),j=(y*w+x)*4;o[j]=c[0];o[j+1]=c[1];o[j+2]=c[2];o[j+3]=255;}}
 const edge=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(!o[i+3])continue;const open=(X,Y)=>X<0||Y<0||X>=w||Y>=h||!o[(Y*w+X)*4+3];
  if(open(x+1,y)||open(x,y+1))edge.push([i,.45]);else if(open(x-1,y)||open(x,y-1))edge.push([i,.62]);}
 for(const [i,f] of edge)for(let c=0;c<3;c++)o[i+c]=o[i+c]*f+[44,32,34][c]*(1-f)*.55;return {w,h,o};}
/** Weltgröße: Zeilen = k, Spalten = (Figur, Richtung, Bild); Z-fach vergrößert auf Wiesengrün. */
function welt(set,cells,file,KS=[.3,.45,.6],Z=3){const pad=4,cw=KS.map(k=>Math.round(CW*k*.8)*Z),ch=KS.map(k=>Math.round(CH*k)*Z),oyOf=r=>pad+ch.slice(0,r).reduce((a,b)=>a+b+pad,0);
 const o=surface((Math.max(...cw)+pad)*cells.length+pad,oyOf(KS.length));for(let i=0;i<o.data.length;i+=4)o.data.set([0x3b,0x50,0x30,255],i);
 KS.forEach((k,r)=>cells.forEach(([fig,d,f],c)=>{const {w,h,o:img}=shrunk(compose(fig,d,set,f),k),x0=Math.floor((W/2-CW*.4)*k),y0=Math.floor(CY0*k),ox=pad+c*(Math.max(...cw)+pad),oy=oyOf(r);
  for(let y=0;y<ch[r];y++)for(let x=0;x<cw[r];x++){const sx=x0+(x/Z|0),sy=y0+(y/Z|0);if(sx>=w||sy>=h)continue;const q=(sy*w+sx)*4;if(img[q+3])o.data.set([img[q],img[q+1],img[q+2],255],((oy+y)*o.width+ox+x)*4);}}));
 writeFileSync(out+'/'+file,encodePng(o));}
/** Symbol ×2 neben der Figur se und nw (Stand) in Weltgröße k, ebenfalls ×2 – prüft, ob die Figur dem Symbol folgt. */
function symbol(id,set,k=.45,Z=2){const f=new URL('../../assets/precision/runtime/items/'+id+'.png',import.meta.url);if(!existsSync(f))return;const ic=decodePng(readFileSync(f)),pad=8;
 const figs=['se','nw'].map(d=>shrunk(compose('ida',d,set,0),k)),cw=Math.round(CW*k*.8),ch=Math.round(CH*k),x0=Math.floor((W/2-CW*.4)*k),y0=Math.floor(CY0*k),BGG=[0x3b,0x50,0x30];
 const o=surface(pad+ic.width*Z+pad+(cw*Z+pad)*2,pad+Math.max(ic.height,ch)*Z+pad);for(let i=0;i<o.data.length;i+=4)o.data.set([...BGG,255],i);
 for(let y=0;y<ic.height*Z;y++)for(let x=0;x<ic.width*Z;x++){const q=((y/Z|0)*ic.width+(x/Z|0))*4,a=ic.data[q+3]/255;if(!a)continue;o.data.set([0,1,2].map(c=>Math.round(ic.data[q+c]*a+BGG[c]*(1-a))).concat(255),((pad+y)*o.width+pad+x)*4);}
 figs.forEach(({w,h,o:img},n)=>{const ox=pad+ic.width*Z+pad+n*(cw*Z+pad);for(let y=0;y<ch*Z;y++)for(let x=0;x<cw*Z;x++){const sx=x0+(x/Z|0),sy=y0+(y/Z|0);if(sx>=w||sy>=h)continue;const q=(sy*w+sx)*4;if(img[q+3])o.data.set([img[q],img[q+1],img[q+2],255],((pad+y)*o.width+ox+x)*4);}});
 writeFileSync(out+'/'+id+'-symbol.png',encodePng(o));}
const t0=Date.now();
// Nahblick: 5. Argument "fig@dir:bild,…" (z. B. "ida@se:0,dieter@nw:14") → nur <id>-nah.png mit diesen Zellen im Maßstab S
const NAH=process.argv[5]&&process.argv[5].split(',').map(z=>{const [fd,f]=z.split(':'),[fig,d='se']=fd.split('@');return {fig,d,f:+f};});
if(NAH){const pad=6;for(const id of ids){const set=setOf(id),o=surface((CW*S+pad)*NAH.length+pad,CH*S+2*pad);for(let i=0;i<o.data.length;i+=4)o.data.set([...BG,255],i);
 NAH.forEach(({fig,d,f},c)=>{const img=compose(fig,d,set,f),ox=pad+c*(CW*S+pad);for(let y=0;y<CH*S;y++)for(let x=0;x<CW*S;x++){const q=((CY0+(y/S|0))*W+CX0+(x/S|0))*4;if(img[q+3])o.data.set([img[q],img[q+1],img[q+2],255],((pad+y)*o.width+ox+x)*4);}});
 writeFileSync(out+'/'+id+'-nah.png',encodePng(o));console.log(id,'nah');}process.exit(0);}
for(const id of ids){if(!GEAR[id]){console.log('unbekannt',id);continue;}
 const cols=framesOf(id),set=setOf(id);
 bogen(DIRN.map(d=>({fig:'ida',d,set})),cols,S,id+'.png');
 bogen(FIGS.flatMap(fig=>DIRN.map(d=>({fig,d,set}))),cols,1,id+'-alle.png');
 const g=GEAR[id],act=g.slot==='ranged'?[at('zielen'),at('schuss')]:g.hands===2?[at('hieb2',1),at('parade2')]:[at('hieb',1),at('parade')];
 welt(set,[['ida','se',0],['ida','sw',at('laufen',2)],['dieter','se',act[0]],['dieter','nw',0],['kevin','ne',at('laufen',5)],['kevin','sw',act[1]],['ida','nw',act[0]]],id+'-welt.png');
 symbol(id,set);
 if(GEAR[id+'_nh'])bogen(DIRN.map(d=>({fig:'ida',d,set:setOf(id+'_nh')})),framesOf(id),S,id+'_nh.png');
 console.log(id,'fertig',(Date.now()-t0)+' ms');}
