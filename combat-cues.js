// Kampfhinweise ohne Text (Runde 3a, 2026-09-24, Kenner-Befunde 1, 3 und 6, WoW-Vorbild):
// - Roter Bildrand-Puls, wenn dich etwas angreift, während ein Fenster offen ist (die Karte deckt die Mitte, die Figur ist weg).
// - Ablehnungen („noch nicht bereit“, „zu weit“, „nicht genug Randale“ …) stehen als rote Fehlerzeile statt als goldene Meldung.
// - Zielrahmen: Auftragszeichen, wenn der Gegner für einen laufenden Auftrag zählt; Symbol mit Tooltip statt des Satzes
//   „Dieses Ziel zieht gerade ab oder kommt erst an.“
import {glyph} from './ui-glyphs.js';
import {questMob} from './quest-mobs.js';

export const CUE_TEXT={
 quest:{label:'Auftragsgegner',note:'Zählt für einen laufenden Auftrag.'},
 leaving:{label:'Zieht ab',note:'Läuft heim und ist dabei unverwundbar.'},
 arriving:{label:'Kommt gerade an',note:'Gleich angreifbar.'},
};
/** Ist die Meldung eine Ablehnung? (engine.fail markiert sie; bekannte Wortlaute aus älteren Stellen zählen mit.) */
export const REJECT=/noch nicht bereit|Zu weit entfernt|Nicht genug|versperrt die Sicht|brauchst du gerade nicht|nichts mehr dabei|lernst du später|Kein passendes Ziel|Kein Weg dorthin|Zum Zaubern|nicht im Kampf|Freien Boden/i;
export function createCombatCues({doc=document,popups}={}){
 const errors=new Set();let rimTimer=0;
 const shell=()=>doc.querySelector('#gameShell')||doc.body;
 function rimEl(){let el=doc.querySelector('#attackRim');if(!el){el=doc.createElement('div');el.id='attackRim';el.className='attack-rim';el.setAttribute('aria-hidden','true');shell().append(el);}return el;}
 /** Offenes Fenster (nicht minimiert) über der Spielwelt? */
 const windowOpen=()=>!!popups?.state?.().some(w=>!w.minimized&&!['chat','meter'].includes(w.id));
 return {
  /** Angriff: roter Rand pulsiert (nur bei offenem Fenster; ohne Fenster sieht man Kampftext und Figur). → true, wenn gepulst. */
  attacked(force=false){if(!force&&!windowOpen())return false;const el=rimEl();el.classList.remove('pulse');void el.offsetWidth;el.classList.add('pulse');clearTimeout(rimTimer);rimTimer=setTimeout(()=>el.classList.remove('pulse'),1300);return true;},
  /** Meldung als Fehler merken (rote Zeile). */
  markError(text){if(text)errors.add(String(text));if(errors.size>60)errors.delete(errors.values().next().value);},
  isError:text=>errors.has(String(text))||REJECT.test(String(text)),
  /** Zielrahmen: Auftragszeichen und Zustandssymbol nachführen. */
  target(g,e){
   const row=doc.querySelector('#targetPanel .unit-name');if(!row)return;
   let q=row.querySelector('.target-quest'),s=row.querySelector('.target-state');
   if(!q){q=doc.createElement('i');q.className='target-quest';q.dataset.tooltipLabel=CUE_TEXT.quest.label;q.dataset.tooltipNote=CUE_TEXT.quest.note;q.setAttribute('aria-label',CUE_TEXT.quest.label);row.prepend(q);}
   if(!s){s=doc.createElement('i');s.className='target-state';row.append(s);}
   const quest=!!e&&questMob(g,e);q.hidden=!quest;
   const state=!e?null:e.ai==='returning'?'leaving':e.spawnGrace>0?'arriving':null;
   if(s.dataset.state!==(state||'')){s.dataset.state=state||'';s.innerHTML=state?glyph(state==='leaving'?'back':'spark'):'';if(state){s.dataset.tooltipLabel=CUE_TEXT[state].label;s.dataset.tooltipNote=CUE_TEXT[state].note;s.setAttribute('aria-label',CUE_TEXT[state].label);}}
   s.hidden=!state;
  },
  /** Angriff auf ein abziehendes/ankommendes Ziel: das Symbol blinkt statt eines Satzes. */
  flashState(){const s=doc.querySelector('#targetPanel .target-state');if(!s)return;s.classList.remove('flash');void s.offsetWidth;s.classList.add('flash');},
 };
}
