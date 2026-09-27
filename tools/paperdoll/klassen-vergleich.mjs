// Vergleichsbogen Klassenkleidung (E-72 Runde 3, Entwurf zur Freigabe): alle fünf Klassen nach dem Kleiderhaufen nebeneinander, je Körper
// (Kräftig, Schwungvoll, Drahtig), Richtungen vorn (se), Seite (sw, gespiegelte Vorderseite), hinten (nw). Je Zelle die Nahansicht in
// Bogenpixeln (1×, wie Heldenerstellung und Figurenfenster) und darunter die Weltgröße des Spiels (Desktop-Kamera) 2× vergrößert.
// Zusammengesetzt wie im Spiel: Laufzeit-Bögen (assets/paperdoll/runtime), Kern paperdoll-kern.js, Umfärben/Aussehen aus paperdoll-art.js,
// Weltverkleinerung wie paperdoll-art shrunk (Flächenmittel → Palette → Kontur). Beschriftung über .NET (Windows PowerShell), sonst ohne.
// Weltmaßstab wie paperdoll-art drawPaperdoll: k = unitScale(Archetyp) × PERSON_SCALE × Kamerazoom (Desktop 2,6), auf 1/50 gerundet.
// Aufruf: node tools/paperdoll/klassen-vergleich.mjs [ziel.jpg] [--runtime=<ordner>] [--zoom=2.6]
import {readFileSync,writeFileSync,existsSync,mkdirSync,unlinkSync} from 'node:fs';
import {dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {decodePng,encodePng} from '../sprite-pipeline/png.mjs';
import {composeCore,sources as orderSources,useShade} from '../../paperdoll-kern.js';
import {paperdoll,recolorMap,recolor,lookSources,paperdollSources,unitScale} from '../../paperdoll-art.js';
import {equipmentAppearance} from '../../equipment-appearance.js';
import {ITEM_CATALOG,TUTORIAL,CLASS_CLOTHES} from '../../content/index.js';
import {CLASS_LOOKS} from '../../characters.js';

const arg=k=>process.argv.find(a=>a.startsWith('--'+k+'='))?.split('=').slice(1).join('=');
const OUT=process.argv.slice(2).find(a=>!a.startsWith('--'))||fileURLToPath(new URL('../../docs/e72-runde3/figuren/vergleich.jpg',import.meta.url));
const RT=arg('runtime')?pathToFileURL(arg('runtime').replace(/\/?$/,'/')):new URL('../../assets/paperdoll/runtime/',import.meta.url);
import {PERSON_SCALE} from '../../world-scale.js';
const DESKTOP_ZOOM=2.6;// renderer.js DESKTOP_ZOOM (Kamera Desktop)

const cat=JSON.parse(readFileSync(new URL('catalog.json',RT),'utf8'));paperdoll.catalog=cat;useShade(cat.shade);
const {W,H}=cat,split=cat.split??cat.frames.length;
const kOf=arch=>Math.min(1,Math.round(unitScale(arch)*PERSON_SCALE*(+(arg('zoom')||2.6))*50)/50),KMAX=Math.max(...Object.keys(cat.archetypes).map(kOf));
// ---------- Kacheln wie paperdoll-art tile(): eigener Bogen oder gespiegeltes se/nw ----------
const imgs=new Map(),img=f=>{if(!imgs.has(f))imgs.set(f,existsSync(new URL(f,RT))?decodePng(readFileSync(new URL(f,RT))):null);return imgs.get(f);};
const baseDir=(src,dir,part)=>{if(dir!=='sw'&&dir!=='ne')return dir;return cat.own[dir].includes(src)||part&&cat.ownAkt?.[dir]?.includes(src)?dir:dir==='sw'?'se':'nw';};
function tile(arch,src,dir,band,f){const part=f>=split?1:0,base=baseDir(src,dir,part),mirror=base!==dir,im=img(`${src}-${arch}${cat.dirs[base]}${part?'-akt':''}.png`);if(!im)return null;
 const rows=cat.sources[src]?.bands||cat.bands,row=rows.indexOf(band);if(row<0)return null;const c=cat.sources[src]?.cell||{x:0,y:0,w:W,h:H},col=part?f-split:f,out=new Uint8ClampedArray(W*H*4);let any=false;
 for(let y=0;y<c.h;y++)for(let x=0;x<c.w;x++){const i=((row*c.h+y)*im.width+col*c.w+x)*4;if(!im.data[i+3])continue;const X=mirror?W-1-(x+c.x):x+c.x,Y=y+c.y,j=(Y*W+X)*4;out[j]=im.data[i];out[j+1]=im.data[i+1];out[j+2]=im.data[i+2];out[j+3]=255;any=true;}
 return any?out:null;}
/** Figur wie drawPaperdoll: Quellen aus Ausrüstung + Aussehen, Körper, Dutt nur beim Archetyp mit Dutt; umgefärbt. */
function figur(arch,dir,items,tint,f=0){const srcs=paperdollSources(items,false);for(const s of lookSources(tint,items))if(cat.sources[s])srcs.add(s);
 const list=orderSources(srcs,cat.sources).filter(s=>s!=='dutt'||cat.archetypes[arch].dutt);
 const px=composeCore(W,H,cat.bands,list,(s,band)=>{if(s==='dutt'&&band!=='kopf')return null;if(cat.sources[s]&&!cat.sources[s].bands.includes(band))return null;return tile(arch,s,dir,band,f);});
 const m=recolorMap(arch,tint);return {px:recolor(px,m),m};}
// ---------- Weltgröße wie paperdoll-art shrunk ----------
const PAL=cat.palette.map(k=>[k>>16,k>>8&255,k&255]),snaps=new WeakMap();
function snapper(m){let fn=snaps.get(m);if(fn)return fn;const pal=PAL.map(q=>m.get(q[0]<<16|q[1]<<8|q[2])||q),cache=new Map();
 fn=(r,g,b)=>{const key=(r>>2)<<12|(g>>2)<<6|(b>>2);let c=cache.get(key);if(c)return c;let bd=1e18;for(const q of pal){const dr=r-q[0],dg=g-q[1],db=b-q[2],rm=(r+q[0])/2,d=(2+rm/256)*dr*dr+4*dg*dg+(2+(255-rm)/256)*db*db;if(d<bd){bd=d;c=q;}}cache.set(key,c);return c;};snaps.set(m,fn);return fn;}
function welt({px,m},k){const w=Math.round(W*k),h=Math.round(H*k),o=new Uint8ClampedArray(w*h*4),pick=snapper(m);
 for(let y=0;y<h;y++){const y0=Math.floor(y/k),y1=Math.min(H,Math.ceil((y+1)/k));for(let x=0;x<w;x++){const x0=Math.floor(x/k),x1=Math.min(W,Math.ceil((x+1)/k));let r=0,g=0,b=0,a=0;
  for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++){const i=(yy*W+xx)*4;if(!px[i+3])continue;r+=px[i];g+=px[i+1];b+=px[i+2];a++;}
  if(!a||a/Math.max(1,(y1-y0)*(x1-x0))<.42)continue;const c=pick(r/a,g/a,b/a),j=(y*w+x)*4;o[j]=c[0];o[j+1]=c[1];o[j+2]=c[2];o[j+3]=255;}}
 const edge=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(!o[i+3])continue;const open=(X,Y)=>X<0||Y<0||X>=w||Y>=h||!o[(Y*w+X)*4+3];if(open(x+1,y)||open(x,y+1))edge.push([i,.45]);else if(open(x-1,y)||open(x,y-1))edge.push([i,.62]);}
 for(const [i,f] of edge)for(let c=0;c<3;c++)o[i+c]=o[i+c]*f+[44,32,34][c]*(1-f)*.55;return {w,h,data:o};}
// ---------- Bogen ----------
const KLASSEN=[['dieter','Dieter · Kutte'],['baerbel','Anni · Kutte'],['kevin','Kevin · Kutte'],['schorsch','Schorsch · Grillschürze + Mütze'],['kaethe','Käthe · Strickjacke + Lesebrille']];
const KOERPER=[['dieter','Kräftig'],['baerbel','Schwungvoll'],['kevin','Drahtig']];
const RICHTUNG=[['se','vorn'],['sw','Seite'],['nw','hinten']];
const CW=132,NH=226,Z=2,GAP=14,LEFT=120,TOP=64,WT=Math.round((cat.ground-215)*KMAX),WH=Math.round(cat.ground*KMAX)+3-WT,ROWH=NH+WH*Z+14;
const gw=RICHTUNG.length*CW,WIDTH=LEFT+KLASSEN.length*(gw+GAP),HEIGHT=TOP+KOERPER.length*(ROWH+10)+30;
const out={width:WIDTH,height:HEIGHT,data:new Uint8Array(WIDTH*HEIGHT*4)};
const fill=(x,y,w,h,c)=>{for(let yy=Math.max(0,y);yy<Math.min(HEIGHT,y+h);yy++)for(let xx=Math.max(0,x);xx<Math.min(WIDTH,x+w);xx++)out.data.set([...c,255],(yy*WIDTH+xx)*4);};
const paste=(src,sw,sh,x,y,z,crop)=>{for(let yy=0;yy<crop.h*z;yy++)for(let xx=0;xx<crop.w*z;xx++){const sx=crop.x+Math.floor(xx/z),sy=crop.y+Math.floor(yy/z);if(sx<0||sy<0||sx>=sw||sy>=sh)continue;const i=(sy*sw+sx)*4;if(!src[i+3])continue;const X=x+xx,Y=y+yy;if(X<0||Y<0||X>=WIDTH||Y>=HEIGHT)continue;out.data.set([src[i],src[i+1],src[i+2],255],(Y*WIDTH+X)*4);}};
fill(0,0,WIDTH,HEIGHT,[31,36,30]);
const labels=[{x:12,y:10,t:'Klassenkleidung nach dem Kleiderhaufen · Entwurf E-72 · je Zelle oben Nahansicht (Bogenpixel 1×), unten Weltgröße im Spiel (Desktop-Zoom, k '+Object.keys(cat.archetypes).map(a=>kOf(a).toFixed(2)).join('/')+') 2×',s:15,c:'#f0e2c0'}];
KLASSEN.forEach(([cls,name],ci)=>labels.push({x:LEFT+ci*(gw+GAP)+6,y:30,t:name,s:13,c:ci>=3?'#ffcf7a':'#d8cfae'}));
KOERPER.forEach(([arch,bname],ri)=>{const y0=TOP+ri*(ROWH+10);labels.push({x:10,y:y0+NH/2-10,t:bname,s:14,c:'#d8cfae'});
 KLASSEN.forEach(([cls],ci)=>{const eq={...TUTORIAL.starterEquipment,...(CLASS_CLOTHES[cls]||{})},items=equipmentAppearance(eq,ITEM_CATALOG),tint={skin:'hell',hair:'natur',face:'ohne',style:'natur',beard:'natur',...(CLASS_LOOKS[cls]?.tint||{})};
  const gx=LEFT+ci*(gw+GAP);fill(gx-4,y0,gw+8,ROWH,ci>=3?[52,60,44]:[44,54,40]);
  RICHTUNG.forEach(([dir,dname],di)=>{const fig=figur(arch,dir,items,tint),x=gx+di*CW;
   paste(fig.px,W,H,x,y0+4,1,{x:W/2-CW/2,y:cat.ground-NH+14,w:CW,h:NH-4});
   const k=kOf(arch),s=welt(fig,k),wt=Math.round((cat.ground-215)*k),wh=Math.round(cat.ground*k)+3-wt;paste(s.data,s.w,s.h,x+CW/2-s.w,y0+NH+4+(WH-wh)*Z,Z,{x:0,y:wt,w:s.w,h:wh});
   if(ri===0)labels.push({x:x+CW/2-16,y:TOP-16,t:dname,s:11,c:'#a8a08a'});});});});
const png=OUT.replace(/\.jpg$/,'.png');mkdirSync(dirname(OUT),{recursive:true});writeFileSync(png,encodePng(out));
if(process.platform==='win32'&&OUT.endsWith('.jpg')){const lf=png+'.labels.json';writeFileSync(lf,JSON.stringify(labels));
 const ps=`Add-Type -AssemblyName System.Drawing;$b=[System.Drawing.Bitmap]::FromFile('${png}');$g=[System.Drawing.Graphics]::FromImage($b);$g.TextRenderingHint='AntiAliasGridFit';
 foreach($l in (Get-Content -Raw -Encoding UTF8 '${lf}'|ConvertFrom-Json)){$f=New-Object System.Drawing.Font('Segoe UI',[float]$l.s,[System.Drawing.FontStyle]::Bold,[System.Drawing.GraphicsUnit]::Pixel);$br=New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml($l.c));$g.DrawString($l.t,$f,$br,[float]$l.x,[float]$l.y)}
 $c=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()|?{$_.MimeType -eq 'image/jpeg'};$p=New-Object System.Drawing.Imaging.EncoderParameters(1);$p.Param[0]=New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality,[long]92);$b.Save('${OUT}',$c,$p);$g.Dispose();$b.Dispose()`;
 execFileSync('powershell.exe',['-NoProfile','-Command',ps],{stdio:'inherit'});for(const x of [png,lf])try{unlinkSync(x);}catch{}}
console.log('Vergleichsbogen',OUT,WIDTH+'×'+HEIGHT);
