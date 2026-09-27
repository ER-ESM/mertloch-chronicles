// Sprite-Worker (Handy-Leistung Runde 2, 27.09.2026): Neue Welt-Sprites – Bäume, Steine, Schilder (maifeld-art.js drawMaifeld) und
// Häuser (tiny-architecture.js drawBuilding) – werden einmal hochwertig verkleinert und auf die Weltpalette gerastet (normalizeArt).
// Das kostete beim Laufen je neuem Sprite 3–30 ms im Bild (Mittelklasse-Handy ×4). Hier geschieht es vorab auf einem anderen Kern:
// Der Renderer bestellt die Sprites der Objekte kurz vor dem Sichtrand (Renderer.prefetchSprites), zurück kommt ein ImageBitmap.
// Gleicher Weg wie im Hauptfaden: Hauptspeicher-Leinwand, Glättung „high“, dieselbe normalizeArt.
import {normalizeArt} from './art-style.js';
const sheets=new Map();
self.onmessage=e=>{const d=e.data;
 if(d.type==='sheet'){sheets.set(d.id,d.bmp);return;}
 if(d.type!=='job')return;
 try{const img=sheets.get(d.sheet);if(!img){self.postMessage({id:d.id,error:'Bogen fehlt'});return;}
  const cv=new OffscreenCanvas(d.W,d.H),c=cv.getContext('2d',{willReadFrequently:true});c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  if(d.filter)c.filter=d.filter;for(const p of d.parts)c.drawImage(img,p.sx,p.sy,p.sw,p.sh,p.dx,p.dy,p.dw,p.dh);if(d.filter)c.filter='none';
  normalizeArt(cv,true);const bmp=cv.transferToImageBitmap();self.postMessage({id:d.id,bmp},[bmp]);
 }catch(err){self.postMessage({id:d.id,error:String(err?.message||err)});}
};
