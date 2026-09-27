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
//   slots  Runde 3: so viele Zustände je Besitzer behalten (z. B. Phasen einer Animation: Lichterketten, Wimpel); ältester fliegt raus
//   alpha  Runde 3: nur bei voller Deckkraft (Standard) – eine Gruppe mit globalAlpha < 1 sähe anders aus als einzeln durchscheinende Formen
const store=new WeakMap();
/** Zähler; `off=true` schaltet die Zwischenbilder ab (Vergleichsprüfung pixelgleich, Diagnose). */
export const layerCacheStats={builds:0,hits:0,fallbacks:0,off:false};
export function cachedLayer(c,owner,key,box,paint,{maxPixels=4e6,slots=1,alpha=false}={}){
 if(layerCacheStats.off||typeof document==='undefined'||typeof c?.getTransform!=='function'||(!alpha&&c.globalAlpha!==1)){layerCacheStats.fallbacks++;return false;}
 const t=c.getTransform();if(t.b||t.c||!(t.a>0)||Math.abs(t.a-t.d)>1e-9){layerCacheStats.fallbacks++;return false;}
 const d=t.a,dx=d*box.x0+t.e,dy=d*box.y0+t.f;if(Math.abs(dx-Math.round(dx))>1e-6||Math.abs(dy-Math.round(dy))>1e-6){layerCacheStats.fallbacks++;return false;}
 const W=Math.ceil((box.x1-box.x0)*d),H=Math.ceil((box.y1-box.y0)*d);if(!(W>0&&H>0)||W*H>maxPixels){layerCacheStats.fallbacks++;return false;}
 /* Runde 3: Treffer ohne Zeichenketten – Schlüssel, Dichte, Rahmen und Glättung einzeln vergleichen (Zahl→Text je Objekt und Bild kostete mehr als das Zeichnen) */
 const sm=c.imageSmoothingEnabled,same=e=>e&&e.key===key&&e.d===d&&e.sm===sm&&e.x0===box.x0&&e.y0===box.y0&&e.x1===box.x1&&e.y1===box.y1;
 let e;
 if(slots>1){let m=store.get(owner);if(!(m instanceof Map))store.set(owner,m=new Map());e=m.get(key);
  if(same(e)){m.delete(key);m.set(key,e);}else{let cv=e?.cv||null;if(e)m.delete(key);else if(m.size>=slots){const [k,old]=m.entries().next().value;m.delete(k);cv=old.cv;}e=entry(build(cv,W,H,d,box,c,paint),key,d,sm,box);m.set(key,e);}}
 else{e=store.get(owner);if(!same(e)){e=entry(build(e?.cv,W,H,d,box,c,paint),key,d,sm,box);store.set(owner,e);}}
 /* Runde 3: Transformation mit sechs Zahlen zurücksetzen statt save/restore bzw. setTransform(DOMMatrix) – das Umwandeln des Matrix-Objekts kostete
    mehr als das Zeichnen selbst */
 c.setTransform(1,0,0,1,0,0);c.drawImage(e.cv,Math.round(dx),Math.round(dy));c.setTransform(t.a,t.b,t.c,t.d,t.e,t.f);layerCacheStats.hits++;return true;
}
const entry=(cv,key,d,sm,box)=>({cv,key,d,sm,x0:box.x0,y0:box.y0,x1:box.x1,y1:box.y1});
function build(cv,W,H,d,box,c,paint){cv||=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
 x.setTransform(d,0,0,d,-box.x0*d,-box.y0*d);x.imageSmoothingEnabled=c.imageSmoothingEnabled;x.imageSmoothingQuality=c.imageSmoothingQuality;paint(x);layerCacheStats.builds++;return cv;}
/** Runde 3: Phase einer Animation mit Periode `period` (s) in `n` Stufen – gerundet auf die nächste Stufe; liefert {k, t} (Stufe, Zeitpunkt der Stufe). */
export function phaseOf(time,period,n){const u=((time%period)+period)%period,k=Math.round(u/period*n)%n;return {k,t:k*period/n};}
/** Runde 3: ganzzahliger Rahmen (Welteinheiten) um x0..x1, y0..y1 mit Rand. */
export const intBox=(x0,y0,x1,y1,pad=2)=>({x0:Math.floor(x0-pad),y0:Math.floor(y0-pad),x1:Math.ceil(x1+pad),y1:Math.ceil(y1+pad)});
