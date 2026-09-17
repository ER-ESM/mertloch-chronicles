// Proc-Regeln: Auslöser → Wirkung mit Zeitfenster. Talente verweisen über den Effektschlüssel `proc:<id>` darauf.
// trigger: crit | kill | parry | interrupt | dodge | markTick | autoHit | heal | burst3 | lowHealth
// effect: free (Kniff kostenlos) · reset (Abklingzeit 0) · empower (nächster Kniff ×2) · energy · points · shield · haste (Anteil, Zeitfenster)
// glow: dieser Kniff leuchtet auf der Leiste, solange das Fenster offen ist. chance 1 = immer.
import {BALANCE} from './balance.js';
const W=BALANCE.procs.defaultWindow;
export const PROC_TRIGGERS=['crit','kill','parry','interrupt','dodge','markTick','autoHit','heal','burst3','lowHealth'];
export const PROC_RULES={
 // --- Dieter ---
 'deckel-reflex':{trigger:'parry',chance:1,window:W,effect:{free:'mark'},glow:'mark',text:'Eine Parade macht die nächste Pfandschuld kostenlos.'},
 'tresenkante':{trigger:'crit',chance:.35,window:W,effect:{shield:40,reset:'parry'},glow:'parry',text:'Ein kritischer Treffer gibt 40 Deckung und macht Deckel drauf sofort bereit.'},
 'kellenwut':{trigger:'crit',chance:.35,window:W,effect:{free:'burst'},glow:'burst',text:'Ein kritischer Treffer macht den nächsten Abriss kostenlos.'},
 'nachschlag':{trigger:'kill',chance:1,window:W,effect:{empower:'strike',energy:15},glow:'strike',text:'Nach einem Kill trifft die nächste Kelle doppelt und gibt 15 Randale.'},
 'nachfuellen':{trigger:'markTick',chance:.25,window:W,effect:{points:1},text:'Jeder Tick der Pfandschuld hat 25 %, einen Pegel zu geben.'},
 'zapfhahn-auf':{trigger:'heal',chance:1,window:W,effect:{reset:'mark',free:'strike'},glow:'strike',text:'Heilung setzt die Pfandschuld zurück und macht die nächste Kelle kostenlos.'},
 // --- Anni ---
 'frisch-gewischt':{trigger:'heal',chance:.5,window:W,effect:{empower:'strike'},glow:'strike',text:'Jede zweite Heilung lädt einen doppelten Pinsel-Piekser.'},
 'landfrauen-glanz':{trigger:'crit',chance:1,window:W,effect:{energy:15,points:1},text:'Kritische Treffer geben 15 Randale und einen Glanzpunkt.'},
 'putzprovision':{trigger:'markTick',chance:.3,window:W,effect:{energy:10,shield:20},text:'Fleckentest-Ticks haben 30 %, 10 Randale und 20 Deckung zu geben.'},
 'mehrwegflasche':{trigger:'interrupt',chance:1,window:W,effect:{free:'burst'},glow:'burst',text:'Eine Unterbrechung macht die nächste Turbostufe kostenlos.'},
 'buehnenfunke':{trigger:'crit',chance:.35,window:W,effect:{free:'throw'},glow:'throw',text:'Kritische Treffer haben 35 %, den nächsten Wurf kostenlos zu machen.'},
 'zugabe-rhythmus':{trigger:'burst3',chance:1,window:W,effect:{reset:'throw',energy:20},glow:'throw',text:'Eine Turbostufe mit drei Glanz setzt den Wurf zurück und gibt 20 Randale.'},
 // --- Kevin ---
 'zuendfunke':{trigger:'markTick',chance:.25,window:W,effect:{points:1},text:'Kleber-Ticks haben 25 %, einen Druckpunkt zu geben.'},
 'kurzschluss':{trigger:'crit',chance:.35,window:W,effect:{reset:'ground'},glow:'ground',text:'Kritische Treffer haben 35 %, den Bodenangriff sofort bereitzumachen.'},
 'nietenpanzer':{trigger:'autoHit',chance:.3,window:W,effect:{shield:25},text:'Autoangriffe haben 30 %, 25 Deckung zu geben.'},
 'dampfdruck':{trigger:'parry',chance:1,window:W,effect:{free:'burst'},glow:'burst',text:'Eine Parade macht die nächste Rakete kostenlos.'},
 'fangschuss':{trigger:'dodge',chance:1,window:W,effect:{empower:'throw'},glow:'throw',text:'Ein Ausweichen lädt einen doppelt starken Wurf.'},
 'beutefieber':{trigger:'kill',chance:1,window:W,effect:{reset:'dash',energy:20,points:1},glow:'dash',text:'Ein Kill setzt Ausweichen zurück, gibt 20 Randale und einen Druckpunkt.'}
};
export const procId=key=>key.startsWith('proc:')?key.slice(5):null;
