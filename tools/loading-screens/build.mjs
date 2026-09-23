// Ladeschirm-Export: macht aus den Originalen der Bildpipeline (assets/precision/sources/2026-09-23/ladeschirm/)
// die Laufzeitdateien unter assets/loading/. Hintergründe als WebP (klein genug für den Spiel-Cache),
// Bierdeckel und Tresenleiste als PNG mit Alpha, auf den sichtbaren Inhalt zugeschnitten.
// Rechnet im kopflosen Chrome (Canvas), damit das Projekt ohne Bild-Abhängigkeiten auskommt.
// Aufruf: node tools/loading-screens/build.mjs   (CDP_PORT setzen, wenn 9370 belegt ist)
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {browserSession} from '../../scripts/browser-session.mjs';
import {LOADING_UI} from '../../content/loading-screen.js';

const ROOT=new URL('../../',import.meta.url);
const SRC='assets/precision/sources/2026-09-23/ladeschirm/';
const OUT='assets/loading/';

/** Was entsteht: Motive 1536 breit als WebP, Deckel 256², Leiste 1200 breit. `key` stanzt einen hellen Hintergrund aus, falls das Original keinen Alphakanal hat. */
export const EXPORTS=[
 ...LOADING_UI.scenes.map(s=>({id:s.id,src:SRC+s.id+'.png',out:OUT+s.id+'.webp',type:'image/webp',quality:.74,width:1536})),
 {id:'deckel',src:SRC+'ladebalken-deckel.png',out:OUT+'deckel.png',type:'image/png',trim:true,box:256,key:true},
 {id:'rahmen',src:SRC+'ladebalken-rahmen.png',out:OUT+'rahmen.png',type:'image/png',trim:true,width:1200,key:true}
];

// Läuft im Browser: Bild laden, optional Hintergrund ausstanzen, zuschneiden, skalieren, kodieren.
const PAGE_FN=`async (job,data)=>{
 const img=new Image();img.src='data:image/png;base64,'+data;await img.decode();
 let c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
 let x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);
 let px=x.getImageData(0,0,c.width,c.height),d=px.data,opaque=0;
 for(let i=3;i<d.length;i+=4)if(d[i]>250)opaque++;
 const hasAlpha=opaque<d.length/4*.98;
 if(job.key&&!hasAlpha){
  // Hintergrundfarbe aus den Ecken, alles Ähnliche vom Rand her freistellen (Flutfüllung).
  const w=c.width,h=c.height,at=(i)=>[d[i*4],d[i*4+1],d[i*4+2]];
  const corners=[0,w-1,(h-1)*w,h*w-1].map(at),bg=[0,1,2].map(k=>corners.reduce((a,v)=>a+v[k],0)/4);
  const near=i=>Math.hypot(d[i*4]-bg[0],d[i*4+1]-bg[1],d[i*4+2]-bg[2])<42;
  const seen=new Uint8Array(w*h),stack=[];
  for(let i=0;i<w;i++){stack.push(i,(h-1)*w+i);}for(let j=0;j<h;j++){stack.push(j*w,j*w+w-1);}
  while(stack.length){const i=stack.pop();if(seen[i]||!near(i))continue;seen[i]=1;d[i*4+3]=0;const xx=i%w,yy=(i/w)|0;
   if(xx>0)stack.push(i-1);if(xx<w-1)stack.push(i+1);if(yy>0)stack.push(i-w);if(yy<h-1)stack.push(i+w);}
  x.putImageData(px,0,0);
 }
 let sx=0,sy=0,sw=c.width,sh=c.height;
 if(job.trim){let minX=sw,minY=sh,maxX=-1,maxY=-1;for(let yy=0;yy<c.height;yy++)for(let xx=0;xx<c.width;xx++)if(d[(yy*c.width+xx)*4+3]>24){if(xx<minX)minX=xx;if(xx>maxX)maxX=xx;if(yy<minY)minY=yy;if(yy>maxY)maxY=yy;}
  if(maxX>=0){sx=minX;sy=minY;sw=maxX-minX+1;sh=maxY-minY+1;}}
 let tw=sw,th=sh;
 if(job.box){const s=job.box/Math.max(sw,sh);tw=Math.round(sw*s);th=Math.round(sh*s);}
 else if(job.width&&sw>job.width){tw=job.width;th=Math.round(sh*job.width/sw);}
 const o=document.createElement('canvas');o.width=job.box||tw;o.height=job.box||th;const ox=o.getContext('2d');
 ox.imageSmoothingEnabled=true;ox.imageSmoothingQuality='high';
 ox.drawImage(c,sx,sy,sw,sh,Math.round((o.width-tw)/2),Math.round((o.height-th)/2),tw,th);
 const url=o.toDataURL(job.type,job.quality);
 return {data:url.slice(url.indexOf(',')+1),width:o.width,height:o.height,hadAlpha:hasAlpha,trim:[sx,sy,sw,sh]};
}`;

if(process.argv[1]&&import.meta.url.endsWith(process.argv[1].replace(/\\/g,'/').split('/').pop())){
 const only=(process.argv.find(a=>a.startsWith('--only='))||'').slice(7).split(',').filter(Boolean);
 const jobs=EXPORTS.filter(j=>(!only.length||only.includes(j.id))&&existsSync(new URL(j.src,ROOT)));
 if(!jobs.length){console.log('Keine Originale gefunden – erst npm run sprites:generate -- tools/sprite-pipeline/ladeschirm-20260923-jobs.json');process.exit(0);}
 mkdirSync(new URL(OUT,ROOT),{recursive:true});
 const b=await browserSession({url:'about:blank'});
 try{
  for(const job of jobs){
   const data=readFileSync(new URL(job.src,ROOT)).toString('base64');
   const r=await b.evaluate(`(${PAGE_FN})(${JSON.stringify(job)},${JSON.stringify(data)})`);
   const bytes=Buffer.from(r.data,'base64');writeFileSync(new URL(job.out,ROOT),bytes);
   console.log(`${job.id}: ${r.width}×${r.height} → ${job.out} (${(bytes.length/1024).toFixed(0)} kB${job.key?', Alpha im Original: '+(r.hadAlpha?'ja':'nein, ausgestanzt'):''})`);
  }
 }finally{b.close();}
}
