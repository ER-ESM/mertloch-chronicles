// Tägliche Aufträge (Runde 2b, 2026-09-24, Grafikbefund Quick Win d): Der Titel heißt nur noch „Kabelsalat“, die Tagesmarke ist ein
// Kalendersymbol statt „Daily:“ – in der Verfolgung, im Chat und in Kurzmeldungen. Tägliche Aufträge tragen `daily:true` in
// content/hotspots.js; hier wird vor jedem ihrer Titel das Symbol eingesetzt (Chatzeile, Kurzmeldung).
import {HOTSPOTS} from './content/index.js';
const TITLES=[...new Set(HOTSPOTS.flatMap(h=>h.quests||[]).filter(q=>q.daily).map(q=>q.title))].sort((a,b)=>b.length-a.length);
export const DAILY_ICON='<i class="qt-daily" aria-label="Täglich"></i>';
/** Ist das ein Titel eines täglichen Auftrags? */
export const isDailyTitle=t=>TITLES.includes(String(t||'').trim());
/** Setzt vor jedem Titel eines täglichen Auftrags in den Textknoten von el das Kalendersymbol ein. */
export function markDaily(el){
 if(!el||!TITLES.length)return el;const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),hits=[];
 for(let n=walker.nextNode();n;n=walker.nextNode())if(!n.parentElement?.closest('.qt-daily')&&TITLES.some(t=>n.data.includes(t)))hits.push(n);
 for(const n of hits){const t=TITLES.find(x=>n.data.includes(x)),i=n.data.indexOf(t),mark=document.createElement('i');mark.className='qt-daily';mark.setAttribute('aria-label','Täglich');
  const rest=n.splitText(i);n.parentNode.insertBefore(mark,rest);}
 return el;
}
