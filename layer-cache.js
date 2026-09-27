// Zwischenbild für ruhende Vektorgrafik (Handy-Messung 2026-09-27): Wände und Böden der Bude bestehen aus ~950 Zeichenbefehlen je Bild
// (Putzfugen, Tapetenmuster, Kiesränder). Sie ändern sich nie – also EINMAL in Zieldichte in eine Leinwand zeichnen und danach je Bild
// eine Kopie. Die Kopie liegt auf ganzen Gerätepixeln und wird 1:1 übertragen (ohne Skalierung); passt die aktuelle Transformation nicht
// dazu (schief, ungleich skaliert, Versatz auf halben Pixeln), liefert cachedLayer false und der Aufrufer zeichnet wie bisher direkt.
// Optisch gleich, nicht bitgleich: Vergleich an der Bude 1,7 % der Pixel um 1–2 Stufen (Rundung halbdurchsichtiger Flächen), 0,1 % mehr –
// dort liegt ein Wandbild auf halben Texeln, und Zwischenbild und Weltfläche wählen beim Verkleinern ohne Glättung den Nachbartexel.
//   owner  Objekt, an dem das Zwischenbild hängt (Wand, Haus) – WeakMap, verschwindet mit ihm
//   key    alles, wovon das Bild abhängt (Zustand, geladene Bilder); ändert er sich, wird neu gezeichnet
//   box    {x0,y0,x1,y1} in Welteinheiten, ganze Zahlen, deckt alles ab, was `paint` zeichnet
//   paint  (ctx) zeichnet in Weltkoordinaten
const store=new WeakMap();
/** Zähler; `off=true` schaltet die Zwischenbilder ab (Vergleichsprüfung pixelgleich, Diagnose). */
export const layerCacheStats={builds:0,hits:0,fallbacks:0,off:false};
export function cachedLayer(c,owner,key,box,paint,{maxPixels=4e6}={}){
 if(layerCacheStats.off||typeof document==='undefined'||typeof c?.getTransform!=='function'){layerCacheStats.fallbacks++;return false;}
 const t=c.getTransform();if(t.b||t.c||!(t.a>0)||Math.abs(t.a-t.d)>1e-9){layerCacheStats.fallbacks++;return false;}
 const d=t.a,dx=d*box.x0+t.e,dy=d*box.y0+t.f;if(Math.abs(dx-Math.round(dx))>1e-6||Math.abs(dy-Math.round(dy))>1e-6){layerCacheStats.fallbacks++;return false;}
 const W=Math.ceil((box.x1-box.x0)*d),H=Math.ceil((box.y1-box.y0)*d);if(!(W>0&&H>0)||W*H>maxPixels){layerCacheStats.fallbacks++;return false;}
 const full=key+'@'+d+'|'+box.x0+','+box.y0+','+box.x1+','+box.y1+'|'+(c.imageSmoothingEnabled?1:0);
 let e=store.get(owner);
 if(!e||e.key!==full){const cv=e?.cv||document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
  x.setTransform(d,0,0,d,-box.x0*d,-box.y0*d);x.imageSmoothingEnabled=c.imageSmoothingEnabled;x.imageSmoothingQuality=c.imageSmoothingQuality;paint(x);
  e={cv,key:full};store.set(owner,e);layerCacheStats.builds++;}
 c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(e.cv,Math.round(dx),Math.round(dy));c.restore();layerCacheStats.hits++;return true;
}
