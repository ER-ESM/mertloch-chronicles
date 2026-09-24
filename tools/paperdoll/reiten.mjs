// Reitbilder zusammensetzen: je Figur, Reittier und Richtung ein Streifen aus 9 Bildern (Stand + 8 Bewegung), Band für Band verschränkt.
// node reiten.mjs [ausgabe] [figuren] [reittiere] [richtungen] [vorschau]   z. B.  node reiten.mjs reit ida,dieter hofpferd se vorschau
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {encodePng,surface} from '../sprite-pipeline/png.mjs';
import {renderRide,MOUNT_IDS,MOUNT_INFO,MW,MH,MGROUND,BANDS,PAL} from './puppe.mjs';
import {composeCore,sources,useShade} from '../../paperdoll-kern.js';
const here=new URL('.',import.meta.url).pathname.replace(/^\/(\w:)/,'$1');
const meta=JSON.parse(readFileSync(here+'out/puppe.json','utf8'));
const shade={};for(const v of Object.values(PAL)){if(!Array.isArray(v[0]))continue;for(let k=0;k<v.length-1;k++){const c=v[k],key=c[0]<<16|c[1]<<8|c[2];if(!(key in shade))shade[key]=v[k+1];}}useShade(shade);
export const REITER={ida:['dienstmuetze','kutte','jeans','kabelbinderstiefel','praktikantenausweis'],dieter:['regenjacke','jeans','festivalstiefel','bierbong'],kevin:['dachsdeckel','kutte','jeans','fuchspfote','gansorden']};
const [outArg='reit',figArg='ida,dieter,kevin',mArg=MOUNT_IDS.join(','),dArg='se,sw,nw,ne',prev='']=process.argv.slice(2),out=here+outArg+'/';mkdirSync(out,{recursive:true});
const TW=160,TH=216;
export function rideFrame(lid,m,dir,k){const set=new Set(REITER[lid]),ids=sources(set,meta.gear),r=renderRide(lid,m,ids,dir,k);
 return composeCore(MW,MH,BANDS,[...ids,'@'],(s,band)=>{if(s==='@')return r.mount[band]||null;const t=r.rider[s]?.[band];if(!t)return null;const o=new Uint8ClampedArray(MW*MH*4);
  for(let y=0;y<TH;y++){const Y=y+r.off[1];if(Y<0||Y>=MH)continue;for(let x=0;x<TW;x++){const X=x+r.off[0];if(X<0||X>=MW)continue;const i=(y*TW+x)*4;if(t[i+3])o.set(t.subarray(i,i+4),(Y*MW+X)*4);}}return o;});}
const t0=Date.now(),strips={},shadow={};
for(const lid of figArg.split(','))for(const m of mArg.split(','))for(const dir of dArg.split(',')){const s=surface(MW*9,MH);
 for(let k=0;k<9;k++){const px=rideFrame(lid,m,dir,k);for(let y=0;y<MH;y++)s.data.set(px.subarray(y*MW*4,(y+1)*MW*4),(y*MW*9+k*MW)*4);}
 {let x0=MW,x1=0;for(let y=MGROUND-22;y<=MGROUND;y++)for(let x=0;x<MW;x++)if(s.data[(y*s.width+x)*4+3]){if(x<x0)x0=x;if(x>x1)x1=x;}shadow[`${m}-${lid}-${dir}`]={cx:(x0+x1)/2,rx:Math.max(20,(x1-x0)/2+4)};}
 writeFileSync(`${out}${m}-${lid}-${dir}.png`,encodePng(s));strips[`${m}-${lid}-${dir}`]=s;}
{let old={};try{old=JSON.parse(readFileSync(out+'reiten.json','utf8')).shadow||{};}catch(e){}writeFileSync(out+'reiten.json',JSON.stringify({MW,MH,ground:MGROUND,frames:9,mounts:MOUNT_INFO,reiter:REITER,shadow:{...old,...shadow}}));}
// Vorschau: Zeilen = Streifen, Spalten = Bild 0, 2, 4, 6 (2×) auf Bühnengrund
if(prev){const keys=Object.keys(strips),cols=[0,2,4,6],Z=+(process.env.ZOOM||1),g=6,Wd=cols.length*(MW*Z+g)+g,Hd=keys.length*(MH*Z+g)+g,sh=surface(Wd,Hd);for(let i=0;i<sh.data.length;i+=4)sh.data.set([0x2c,0x24,0x27,255],i);
 keys.forEach((key,r)=>cols.forEach((k,c)=>{const s=strips[key];for(let y=0;y<MH*Z;y++)for(let x=0;x<MW*Z;x++){const i=((y/Z|0)*s.width+k*MW+(x/Z|0))*4;const dx=((x/Z)+.5-MW/2)/34,dy=((y/Z)+.5-(MGROUND-1))/7,j=((g+r*(MH*Z+g)+y)*Wd+g+c*(MW*Z+g)+x)*4;
  if(s.data[i+3])sh.data.set([s.data[i],s.data[i+1],s.data[i+2],255],j);else if(dx*dx+dy*dy<=1)sh.data.set([0x1f,0x19,0x1b,255],j);}}));
 writeFileSync(here+'out/'+prev+'.png',encodePng(sh));}
console.log('Reitbilder',Object.keys(strips).length,'Streifen',(Date.now()-t0)+' ms');
