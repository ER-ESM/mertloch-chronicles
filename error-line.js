// Leise Fehlerzeile für „zu früh gedrückt“ (E-72 Runde 5, Kenner-Befund klicks 5, 26.09.): „Grillzange muss noch verschnaufen · 0,7 s“
// stand bei jedem zu frühen Druck als große rote Meldung in der Bildmitte (Kurzmeldung, 22 px, ersetzt sofort jede goldene Meldung) –
// beim Hämmern auf die Taste Dauerfeuer. Wie der WoW-Fehlertext steht die Zeile jetzt klein, gedämpft rot und ohne Kasten oben in der
// Mitte und blendet nach COMBAT_FLOW_TUNING.earlyFail.show s aus; je Kniff kommt sie höchstens alle earlyFail.repeat s. Sie geht nicht in
// den Chat und verdrängt keine Kurzmeldung. Andere Ablehnungen („Zu wenig Glut“, „Kein Ziel“ …) bleiben rote Kurzmeldungen.
import {COMBAT_FLOW_TUNING} from './content/index.js';
const T=COMBAT_FLOW_TUNING.earlyFail;

/** Darf die Zeile für diesen Schlüssel (Kniff) jetzt erscheinen? last = Map Schlüssel → Zeitpunkt (ms). Rein, getestet. */
export function earlyGate(last,key,now,repeatMs=T.repeat*1000){
 const at=last.get(key);if(at!==undefined&&now-at<repeatMs)return false;
 last.set(key,now);if(last.size>40)last.delete(last.keys().next().value);return true;
}

/** Zeile in `shell` einhängen. push(text, key) → true, wenn gezeigt. */
export function mountErrorLine(shell,{now=()=>performance.now(),translate=t=>t}={}){
 const el=document.createElement('p');el.className='error-line';el.setAttribute('role','status');el.setAttribute('aria-live','polite');shell.append(el);
 const last=new Map();let timer=0;
 function push(text,key=text){
  if(!text||!earlyGate(last,String(key),now()))return false;
  el.textContent=translate(String(text));el.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>el.classList.remove('show'),T.show*1000);return true;
 }
 return {el,push,state:()=>({text:el.classList.contains('show')?el.textContent:'',keys:[...last.keys()]})};
}
