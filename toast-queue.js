// Meldungen nacheinander statt übereinander (Runde 2b, 2026-09-24, Neuling-Befund 5): Kurzmeldungen (#toast) laufen über eine
// Warteschlange. Jede steht FULL ms; warten weitere, nur MIN ms. Dieselbe Meldung erscheint nie doppelt: gleicher Wortlaut (Zahlen
// zählen nicht, „noch 2,2 s“ ≈ „noch 1,9 s“) frischt die stehende oder wartende Meldung auf. Während eine große Einblendung
// (milestone-ui.js) steht, wartet die Schlange (hold); die Einblendung wartet ihrerseits, bis die stehende Meldung MIN ms stand.
export const TOAST_FULL=3300,TOAST_MIN=1400,TOAST_MAX=4;
const same=t=>String(t).replace(/\d+([.,]\d+)?/g,'#').trim();
export function createToastQueue(el,{hold=()=>false,now=()=>performance.now(),render=(e,t)=>{e.textContent=t;}}={}){
 const queue=[];let current='',shownAt=0,until=0;
 const visible=()=>el.classList.contains('visible');
 function show(text){current=text;render(el,text);el.classList.add('visible');shownAt=now();until=shownAt+(queue.length?TOAST_MIN:TOAST_FULL);}
 function hide(){el.classList.remove('visible');current='';}
 return {
  /** Neue Meldung: sofort, wenn frei; sonst hinten an (höchstens TOAST_MAX warten, die älteste fällt weg). */
  /** urgent (Runde 3a): Ablehnungen („noch nicht bereit“, „zu weit“ …) warten nicht in der Schlange – wie die rote Fehlerzeile in WoW
   *  ersetzen sie die stehende Meldung sofort (die wandert an den Anfang der Schlange zurück). */
  push(text,{urgent=false}={}){text=String(text||'');if(!text)return;const key=same(text);
   if(urgent&&!hold()&&!(visible()&&same(current)===key)){const i=queue.findIndex(q=>same(q)===key);if(i>=0)queue.splice(i,1);if(visible()&&current)queue.unshift(current);if(queue.length>TOAST_MAX)queue.length=TOAST_MAX;show(text);return;}
   if(visible()&&same(current)===key){if(current!==text){current=text;render(el,text);}until=Math.max(until,now()+(queue.length?TOAST_MIN:TOAST_FULL));return;}
   const i=queue.findIndex(q=>same(q)===key);if(i>=0){queue[i]=text;return;}
   if(!visible()&&!hold()){show(text);return;}
   queue.push(text);if(queue.length>TOAST_MAX)queue.shift();if(visible())until=Math.min(until,Math.max(now(),shownAt+TOAST_MIN));},
  /** Je Bild: abgelaufene Meldung ausblenden, nächste zeigen. */
  tick(t=now()){if(visible()&&t<until)return;if(queue.length&&!hold()){show(queue.shift());return;}if(visible())hide();},
  /** Große Einblendung will starten: frei, sobald die stehende Meldung MIN ms stand; dann weicht sie (steht danach nicht darunter). */
  ready(t=now()){if(!visible())return true;if(t-shownAt<TOAST_MIN)return false;hide();return true;},
  /** Warten Meldungen? (Die große Einblendung kürzt sich dann.) */
  waiting:()=>queue.length>0,
  state:()=>({current:visible()?current:'',queue:[...queue]}),
 };
}
/** Handy (Runde 2b, Neuling-/Grafikbefund): dieselbe Meldung stand als Kurzmeldung UND als Chatzeile übereinander. Solange die
 *  Kurzmeldung steht, tritt die gleichlautende Chatzeile zurück (sie bleibt im Verlauf und erscheint danach wieder). */
export function hideChatTwin(line,ms=TOAST_FULL){if(!line||!document.body.classList.contains('touch-mode'))return;line.classList.add('toast-twin');setTimeout(()=>line.classList.remove('toast-twin'),ms);}
export const chatTwins=text=>[...document.querySelectorAll('.chat-line')].slice(-4).filter(l=>l.textContent.trim()===String(text).trim());
