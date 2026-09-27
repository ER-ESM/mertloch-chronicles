// Rechen-Worker der Anziehpuppe (Handy-Leistung Runde 2, 27.09.2026). Ein neues Weltbild einer Figur – Kacheln aus den Bögen lesen,
// zusammensetzen, verkleinern – kostete auf einem Mittelklasse-Handy 15–60 ms mitten im Bild (die p95-Spitzen beim Laufen und im Kampf).
// Hier geschieht es auf einem anderen Kern: Der Worker holt und dekodiert die Bögen selbst (fetch + createImageBitmap), liest die
// Kacheln auf einer OffscreenCanvas und rechnet mit demselben Code wie der Hauptfaden (paperdoll-tiles.js, paperdoll-kern.js,
// paperdoll-shrink.js). Zurück geht nur das kleine Weltbild (RGBA); der Hauptfaden legt es per putImageData ab.
// Aufträge tragen eine Vorrangstufe (0 = wird jetzt gebraucht, höher = Vorbereiten); es läuft immer der dringendste zuerst.
import {makeTiles,composeFigure,sheetsFor} from './paperdoll-tiles.js';
import {useShade} from './paperdoll-kern.js';
import {makeSnap,tintPalette,shrinkPixels} from './paperdoll-shrink.js';

let cat=null,base='',palette=[],baseSnap=null;
const bitmaps=new Map(),loading=new Map(),missing=new Set(),tints=new Map(),NONE=new Map(),queue=[];let running=false;
const tiles=makeTiles({getImage:k=>bitmaps.get(k)||null,makeCanvas:()=>new OffscreenCanvas(1,1)});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function load(key){
 if(bitmaps.has(key))return true;if(missing.has(key))return false;let p=loading.get(key);
 if(!p){p=(async()=>{for(const w of [0,1500]){if(w)await sleep(w);try{const r=await fetch(base+key+'.png');if(r.ok){bitmaps.set(key,await createImageBitmap(await r.blob()));return true;}if(r.status===404)break;}catch{}}missing.add(key);return false;})();
  loading.set(key,p);p.finally(()=>loading.delete(key));}
 return p;}
async function run(j){
 const keys=sheetsFor(cat,j.arch,j.dir,j.f,j.srcs),ok=await Promise.all(keys.map(load));
 if(ok.some(x=>!x)){self.postMessage({id:j.id,missing:keys.filter((k,i)=>!ok[i])});return;}
 const px=composeFigure(cat,tiles.tile,j.arch,j.dir,j.f,j.srcs);
 let m=NONE,pick=baseSnap;
 if(j.mKey){let t=tints.get(j.mKey);if(!t&&j.m){const map=new Map(j.m);t={m:map,pick:map.size?makeSnap(tintPalette(palette,map)):baseSnap};tints.set(j.mKey,t);}if(t){m=t.m;pick=t.pick;}}
 const r=shrinkPixels(px,px.box,cat.W,cat.H,j.k,m,pick);
 if(j.audit){self.postMessage({id:j.id,w:r.w,h:r.h,data:r.data,px:px.slice()});return;}/* Prüfmodus: Rohfeld mitschicken */
 self.postMessage({id:j.id,w:r.w,h:r.h,data:r.data},[r.data.buffer]);
}
async function pump(){
 if(running)return;running=true;
 try{while(queue.length){let bi=0;for(let i=1;i<queue.length;i++)if(queue[i].prio<queue[bi].prio)bi=i;const j=queue.splice(bi,1)[0];
  try{await run(j);}catch(err){self.postMessage({id:j.id,error:String(err?.message||err)});}}}
 finally{running=false;}
}
self.onmessage=e=>{const d=e.data;
 if(d.type==='init'){cat=d.catalog;base=d.base;useShade(cat.shade||null);palette=cat.palette.map(k=>[k>>16,k>>8&255,k&255]);baseSnap=makeSnap(palette);return;}
 if(d.type==='job'){queue.push(d);pump();return;}
 if(d.type==='prio'){const j=queue.find(x=>x.id===d.id);if(j)j.prio=Math.min(j.prio,d.prio);return;}
 if(d.type==='stats')self.postMessage({type:'stats',queue:queue.length,sheets:bitmaps.size,missing:[...missing],tiles:tiles.stats()});
};
