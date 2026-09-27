// Lesen vor Schreiben (Handy-Messung 2026-09-27). Jede Geometrie-Abfrage nach einem DOM-Schreibvorgang im selben Bild erzwingt ein volles
// Stil+Layout (gemessen: 4–6 erzwungene Durchgänge je Bild, im Kampf bei 4× CPU-Drosselung 30–50 ms Stil je Bild). Drei Werkzeuge:
//  - viewport(): innerWidth/innerHeight aus dem letzten resize. Auf Android (Viewport-Meta aktiv) erzwingt schon das LESEN von
//    innerWidth/innerHeight ein Layout (Blink LocalDOMWindow::GetViewportSize) – am Desktop war das unsichtbar.
//  - cssSize(el): Client-Größe über ResizeObserver statt clientWidth/clientHeight je Bild.
//  - rectOf(el) und onLayoutPhase(fn): Rechtecke und Aufgaben, die Geometrie lesen und Positionen schreiben, laufen am Bildanfang
//    (app.js frame() → runLayoutPhase()), bevor dieses Bild etwas ins DOM schreibt. Dort ist das Layout vom letzten Bild noch gültig,
//    Lesen kostet nichts. Ergebnis: Positionen folgen mit höchstens einem Bild Verzug.
const hasDom=typeof window!=='undefined'&&typeof document!=='undefined';
const view={w:hasDom?window.innerWidth:0,h:hasDom?window.innerHeight:0};
if(hasDom)window.addEventListener('resize',()=>{view.w=window.innerWidth;view.h=window.innerHeight;});
/** Größe des Fensters wie innerWidth/innerHeight, ohne Layout zu erzwingen. */
export function viewport(){return view;}

const sizes=new WeakMap();let observer=null;
/** {w,h} = clientWidth/clientHeight von `el`, nachgeführt über ResizeObserver (erste Abfrage misst direkt). */
export function cssSize(el){let s=sizes.get(el);if(s)return s;s={w:el.clientWidth,h:el.clientHeight};sizes.set(el,s);
 if(typeof ResizeObserver==='function'){observer||=new ResizeObserver(list=>{for(const e of list){const t=e.target,v=sizes.get(t);if(v){v.w=t.clientWidth;v.h=t.clientHeight;}}});observer.observe(el);}
 return s;}

const rects=new Map();
/** Rechteck von `el` vom Bildanfang (DOMRect-Werte als einfaches Objekt). Erste Abfrage misst direkt, danach nimmt runLayoutPhase es mit. */
export function rectOf(el){if(!el)return null;let r=rects.get(el);if(!r){r=measure(el);rects.set(el,r);}return r;}
const measure=el=>{const b=el.getBoundingClientRect();return {left:b.left,top:b.top,right:b.right,bottom:b.bottom,width:b.width,height:b.height,x:b.x,y:b.y};};

const tasks=new Set();
/** `fn` läuft ab jetzt am Anfang jedes Bildes (eigene Drosselung in `fn`). Rückgabe: Abmelden. */
export function onLayoutPhase(fn){tasks.add(fn);return ()=>tasks.delete(fn);}
/** Am Bildanfang aufrufen: erst alle beobachteten Rechtecke lesen, dann die Aufgaben. */
export function runLayoutPhase(){
 for(const [el,r] of rects){if(!el.isConnected){rects.delete(el);continue;}const b=el.getBoundingClientRect();r.left=b.left;r.top=b.top;r.right=b.right;r.bottom=b.bottom;r.width=b.width;r.height=b.height;r.x=b.x;r.y=b.y;}
 for(const fn of tasks){try{fn();}catch(e){console.error('Layout-Phase',e);}}
}
