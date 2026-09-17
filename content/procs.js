// Proc-Regeln: Auslöser → Wirkung mit Zeitfenster. Talente verweisen über den Effektschlüssel `proc:<id>` darauf.
// trigger: siehe PROC_TRIGGERS; skill und zone filtern, every zählt passende Ereignisse.
// effect: free/reset/empower, energy/points/shield/haste, heal (Leben oder {damage: Anteil}), cdReduce ({skill,seconds}).
// glow: dieser Kniff leuchtet auf der Leiste, solange das Fenster offen ist. chance 1 = immer.
import {BALANCE} from './balance.js';
const W=BALANCE.procs.defaultWindow;
export const PROC_TRIGGERS=['crit','kill','parry','interrupt','dodge','dash','markTick','autoHit','heal','burst3','lowHealth','skillHit','markedHit','beat','inZone'];
export const PROC_RULES={
 'ruecklaufleitung':{"chance":1,"window":6,"trigger":"markedHit","effect":{"heal":{"damage":0.05}},"text":"Treffer an markierten Gegnern heilen zusätzlich 5 % des tatsächlich verursachten Schadens."},
 'provision-vom-schmerz':{"chance":1,"window":6,"trigger":"markedHit","effect":{"heal":{"damage":0.06}},"text":"Treffer an markierten Gegnern heilen zusätzlich 6 % des tatsächlich verursachten Schadens."},
 'perfekter-upload':{"chance":1,"window":6,"trigger":"beat","effect":{"energy":12},"text":"Ein Grundangriff im Takt gibt 12 zusätzliche Randale."},
 'letzter-ausschank':{"chance":1,"window":6,"trigger":"inZone","skill":"strike","zone":"keg","effect":{"energy":15},"text":"Grundangriffe in deiner Fasszone geben 15 zusätzliche Randale."},
 // --- Dieter ---
 'deckelwirtschaft':{"trigger":"skillHit","chance":1,"window":6,"effect":{"shield":25,"energy":10},"text":"Jede dritte Kelle gibt 25 Deckung und 10 Randale.","skill":"strike","every":3},
 'hinterher':{"trigger":"dash","chance":1,"window":6,"effect":{"cdReduce":{"skill":"throw","seconds":3}},"glow":"throw","text":"Ausweichen verkürzt die Wurf-Abklingzeit um 3 Sekunden."},
 'gut-gekuehlt':{"trigger":"parry","chance":1,"window":6,"effect":{"cdReduce":{"skill":"heal","seconds":3}},"glow":"heal","text":"Eine Parade verkürzt die Heilungs-Abklingzeit um 3 Sekunden."},
 'deckel-reflex':{trigger:'parry',chance:1,window:W,effect:{free:'mark'},glow:'mark',text:'Eine Parade macht die nächste Pfandschuld kostenlos.'},
 'tresenkante':{trigger:'crit',chance:.35,window:W,effect:{shield:40,reset:'parry'},glow:'parry',text:'Ein kritischer Treffer gibt 40 Deckung und macht Deckel drauf sofort bereit.'},
 'kellenwut':{trigger:'crit',chance:.35,window:W,effect:{free:'burst'},glow:'burst',text:'Ein kritischer Treffer macht den nächsten Abriss kostenlos.'},
 'nachschlag':{trigger:'kill',chance:1,window:W,effect:{empower:'strike',energy:15},glow:'strike',text:'Nach einem Kill trifft die nächste Kelle doppelt und gibt 15 Randale.'},
 'nachfuellen':{trigger:'markTick',chance:.25,window:W,effect:{points:1},text:'Jeder Tick der Pfandschuld hat 25 %, einen Pegel zu geben.'},
 'zapfhahn-auf':{trigger:'heal',chance:1,window:W,effect:{reset:'mark',free:'strike'},glow:'strike',text:'Heilung setzt die Pfandschuld zurück und macht die nächste Kelle kostenlos.'},
 // --- Anni ---
 'kurzer-hausbesuch':{"trigger":"heal","chance":1,"window":6,"effect":{"cdReduce":{"skill":"mark","seconds":3}},"glow":"mark","text":"Heilung verkürzt die Markierungs-Abklingzeit um 3 Sekunden."},
 'frisch-gewischt':{"trigger":"heal","chance":1,"window":6,"effect":{"empower":"strike"},"glow":"strike","text":"Jede zweite Heilung lädt einen doppelten Pinsel-Piekser.","every":2},
 'landfrauen-glanz':{trigger:'crit',chance:1,window:W,effect:{energy:15,points:1},text:'Kritische Treffer geben 15 Randale und einen Glanzpunkt.'},
 'putzprovision':{trigger:'markTick',chance:.3,window:W,effect:{energy:10,shield:20},text:'Fleckentest-Ticks haben 30 %, 10 Randale und 20 Deckung zu geben.'},
 'mehrwegflasche':{trigger:'interrupt',chance:1,window:W,effect:{free:'burst'},glow:'burst',text:'Eine Unterbrechung macht die nächste Turbostufe kostenlos.'},
 'buehnenfunke':{trigger:'crit',chance:.35,window:W,effect:{free:'throw'},glow:'throw',text:'Kritische Treffer haben 35 %, den nächsten Wurf kostenlos zu machen.'},
 'zugabe-rhythmus':{trigger:'burst3',chance:1,window:W,effect:{reset:'throw',energy:20},glow:'throw',text:'Eine Turbostufe mit drei Glanz setzt den Wurf zurück und gibt 20 Randale.'},
 // --- Kevin ---
 'frisch-verschraubt':{trigger:'burst3',chance:1,window:W,effect:{shield:40},text:'Eine Rakete mit drei Druckpunkten schweißt 40 Deckung auf.'},
 'doppelte-sicherung':{"trigger":"heal","chance":1,"window":6,"effect":{"cdReduce":{"skill":"ground","seconds":3}},"glow":"ground","text":"Heilung verkürzt die Bodenangriffs-Abklingzeit um 3 Sekunden."},
 'nachladen-im-rennen':{"trigger":"dash","chance":1,"window":6,"effect":{"cdReduce":{"skill":"throw","seconds":3}},"glow":"throw","text":"Ausweichen verkürzt die Wurf-Abklingzeit um 3 Sekunden."},
 'schritt-voraus':{"trigger":"interrupt","chance":1,"window":6,"effect":{"cdReduce":{"skill":"dash","seconds":2}},"glow":"dash","text":"Unterbrechen verkürzt die Ausweich-Abklingzeit um 2 Sekunden."},
 'zuendfunke':{trigger:'markTick',chance:.25,window:W,effect:{points:1},text:'Kleber-Ticks haben 25 %, einen Druckpunkt zu geben.'},
 'kurzschluss':{trigger:'crit',chance:.35,window:W,effect:{reset:'ground'},glow:'ground',text:'Kritische Treffer haben 35 %, den Bodenangriff sofort bereitzumachen.'},
 'nietenpanzer':{trigger:'autoHit',chance:.3,window:W,effect:{shield:25},text:'Autoangriffe haben 30 %, 25 Deckung zu geben.'},
 'dampfdruck':{trigger:'parry',chance:1,window:W,effect:{free:'burst'},glow:'burst',text:'Eine Parade macht die nächste Rakete kostenlos.'},
 'fangschuss':{trigger:'dodge',chance:1,window:W,effect:{empower:'throw'},glow:'throw',text:'Ein während des Ausweichens vermiedener Treffer lädt einen doppelt starken Wurf.'},
 'beutefieber':{trigger:'kill',chance:1,window:W,effect:{reset:'dash',energy:20,points:1},glow:'dash',text:'Ein Kill setzt Ausweichen zurück, gibt 20 Randale und einen Druckpunkt.'}
};
export const procId=key=>key.startsWith('proc:')?key.slice(5):null;

// --- Beschreibungen (Welle D · Beschreibungs-Standard, docs/backlog/klassen.md) ---------------
// Je Regel: name (Anzeige im Talentbuch), icon (Vokabular content/items.js ICONS), look (Bildwunsch → ART-BRIEF)
// und info:{effect,why,links,terms}. Zahlen kommen aus der Regel selbst: describe('proc',id) baut daraus
// Auslöser, Chance, Zeitfenster und jede Wirkung (content/glossary.js).
export const PROC_DESCRIPTIONS={
 'ruecklaufleitung':{"name":"Rücklaufleitung","icon":"water","look":"Rücklaufleitung als bestehendes Talentmotiv","info":{"effect":"Verwandelt einen Anteil jedes Treffers auf ein markiertes Ziel in zusätzliche Heilung.","why":"Markieren verbindet deine Angriffe mit stetiger Heilung.","links":["talent:dieter-brew-0"],"terms":["markierung","heilung","lebensraub"]}},
 'provision-vom-schmerz':{"name":"Provision vom Schmerz","icon":"cup","look":"Provision vom Schmerz als bestehendes Talentmotiv","info":{"effect":"Heilt Anni zusätzlich anhand des tatsächlich zugefügten Schadens am markierten Gegner.","why":"Deine eigene Markierung hält die Heilquelle offen.","links":["talent:baerbel-feedback-0"],"terms":["markierung","heilung","lebensraub"]}},
 'perfekter-upload':{"name":"Perfekter Upload","icon":"sound","look":"Perfekter Upload als bestehendes Talentmotiv","info":{"effect":"Belohnt den eingehaltenen Takt mit zusätzlicher Randale.","why":"Der richtige Abstand zwischen zwei Grundangriffen bezahlt die nächste Fähigkeit.","links":["talent:baerbel-stage-0"],"terms":["takt","randale"]}},
 'letzter-ausschank':{"name":"Letzter Ausschank","icon":"hops","look":"Letzter Ausschank als bestehendes Talentmotiv","info":{"effect":"Gibt beim Grundangriff innerhalb einer noch aktiven eigenen Fasszone Randale zurück.","why":"In deiner Zone zu kämpfen hält den Nachschub für die Rotation bereit.","links":["talent:dieter-brew-9"],"terms":["flaeche","randale"]}},
 'deckelwirtschaft':{"name":"Deckelwirtschaft","icon":"potlid","look":"Stapel Bierdeckel mit einem Kronkorken obenauf, warmes Streiflicht","info":{"effect":"Zählt erfolgreiche Kellen; nach dem dritten Treffer kommen Deckung und Randale dazu.","why":"Die Kellen zählen sichtbar mit; ein verfehlter oder abgebrochener Einsatz zählt nicht.","links":["talent:dieter-wall-0","skill:dieter/strike"],"terms":["autoangriff","deckung","randale"]}},
 'hinterher':{"name":"Hinterher!","icon":"boots","look":"Abgewetzter Stiefel mit Staubwolke, Bewegungsstriche nach vorn","info":{"effect":"Zieht nach einem Ausweichschritt Zeit von der laufenden Wurf-Abklingzeit ab.","why":"Ohne die Regel ist Ausweichen ein verlorener Zug – mit ihr ein Schadensschritt.","links":["talent:dieter-brawl-3","throw:dieter"],"terms":["ausweichen","wurf","abklingzeit"]}},
 'gut-gekuehlt':{"name":"Gut gekühlt","icon":"can","look":"Beschlagene Dose im Eiswasser, Kondenstropfen","info":{"effect":"Lässt Dieters Heilung nach einer erfolgreichen Parade früher wieder bereitstehen.","why":"Jede Parade bringt das nächste Konterfrühstück näher, ohne die ganze Wartezeit zu überspringen.","links":["talent:dieter-brew-7","skill:dieter/heal"],"terms":["parade","heilung","abklingzeit"]}},
 'deckel-reflex':{name:'Deckel-Reflex',icon:'shield',look:'Bierdeckel, der wie ein kleiner Schild vor eine Faust gehalten wird',
  info:{effect:'Auslöser geglückte Parade: die nächste Markierung kostet keine Randale.',why:'Bezahlt den Wiedereinstieg in die Rotation direkt aus der Verteidigung.',links:['talent:dieter-wall-1','skill:dieter/mark'],terms:['parade','markierung','randale']}},
 'tresenkante':{name:'Tresenkante',icon:'reinforced',look:'Massive Tresenkante aus Eichenholz mit Messingschiene, abgestoßene Ecke',
  info:{effect:'Auslöser Glückstreffer: legt Deckung an und setzt die Parade zurück.',why:'Macht aus einer Schadenswertung eine Verteidigungswertung – der Kern des Türsteher-Baums.',links:['talent:dieter-wall-5','skill:dieter/parry'],terms:['glueckstreffer','deckung','parade']}},
 'kellenwut':{name:'Kellenwut',icon:'burst',look:'Rote Zornwolke um eine erhobene Kronkorken-Kelle',
  info:{effect:'Auslöser Glückstreffer: der nächste Finisher kostet keine Randale.',why:'Verkürzt den Abstand zwischen zwei Abrissen, ohne den Aufbau zu beschleunigen.',links:['talent:dieter-brawl-1','skill:dieter/burst'],terms:['glueckstreffer','eskalation','randale']}},
 'nachschlag':{name:'Nachschlag',icon:'maul',look:'Tresenhammer, der zum zweiten Mal ausholt, doppelte Schlagspur',
  info:{effect:'Auslöser Kill: der nächste Grundangriff schlägt doppelt und gibt zusätzlich Randale.',why:'Der Übergang von einem Gegner zum nächsten, ohne Leerlauf.',links:['talent:dieter-brawl-5','skill:dieter/strike'],terms:['schwung','grundangriff','randale']}},
 'nachfuellen':{name:'Nachfüllen',icon:'hops',look:'Hopfendolde über einem überlaufenden Glas',
  info:{effect:'Auslöser Marken-Tick: gibt mit einer Chance je Tick einen Aufbaupunkt.',why:'Aufbau, der weiterläuft, während du dich um Paraden und Flächen kümmerst.',links:['talent:dieter-brew-1','skill:dieter/mark'],terms:['markierung','pegel']}},
 'zapfhahn-auf':{name:'Zapfhahn auf',icon:'water',look:'Geöffneter Messing-Zapfhahn mit kräftigem Strahl',
  info:{effect:'Auslöser Heilung: setzt die Markierung zurück und macht den nächsten Grundangriff kostenlos.',why:'Zwei Rotationsschritte aus einem Knopf – die Heilung kostet keinen Schaden mehr.',links:['talent:dieter-brew-5','skill:dieter/mark'],terms:['heilung','markierung','randale']}},
 'kurzer-hausbesuch':{"name":"Kurzer Hausbesuch","icon":"wateringcan","look":"Gießkanne vor einer halb geöffneten Haustür","info":{"effect":"Verkürzt nach einer direkten Heilung die verbleibende Wartezeit auf die Markierung.","why":"Hält den Lebensraub am Laufen, denn die Marke ist Annis Heilquelle.","links":["talent:baerbel-feedback-3","skill:baerbel/mark"],"terms":["heilung","markierung","lebensraub"]}},
 'frisch-gewischt':{"name":"Frisch gewischt","icon":"anni-spray","look":"Sprühflasche mit glänzendem Wischstreifen dahinter","info":{"effect":"Jede zweite direkte Heilung lädt einen doppelt starken Grundangriff.","why":"Gleicht den Schadensverlust aus, den eine Heilpause sonst bedeutet.","links":["talent:baerbel-care-1","skill:baerbel/strike"],"terms":["heilung","grundangriff"]}},
 'landfrauen-glanz':{name:'Landfrauen-Glanz',icon:'medal',look:'Blecherne Vereinsmedaille mit Blumenprägung an grünem Band',
  info:{effect:'Auslöser Glückstreffer: gibt sofort Randale und einen Aufbaupunkt.',why:'Die verlässlichste Randale-Quelle der Heilerin, ganz ohne zusätzlichen Tastendruck.',links:['talent:baerbel-care-5'],terms:['glueckstreffer','randale','glanz']}},
 'putzprovision':{name:'Putzprovision',icon:'cup',look:'Plastikbecher voller Münzen neben einem Putzlappen',
  info:{effect:'Auslöser Marken-Tick: gibt mit einer Chance je Tick Randale und Deckung.',why:'Bezahlt Annis Rotation aus der Marke, die ohnehin klebt.',links:['talent:baerbel-feedback-1','skill:baerbel/mark'],terms:['markierung','randale','deckung']}},
 'mehrwegflasche':{name:'Mehrwegflasche',icon:'bottle',look:'Mehrwegflasche mit Pfandsymbol und Kreislaufpfeilen',
  info:{effect:'Auslöser geglückte Unterbrechung: der nächste Finisher kostet keine Randale.',why:'Der Grund, den gelben Balken zu bewachen, auch wenn der Zauber dich kaum trifft.',links:['talent:baerbel-feedback-5','skill:baerbel/interrupt'],terms:['unterbrechen','eskalation','randale']}},
 'buehnenfunke':{name:'Bühnenfunke',icon:'speaker',look:'Lautsprecherbox mit Funkenschlag am Kabelanschluss',
  info:{effect:'Auslöser Glückstreffer: der nächste Wurf kostet keine Randale.',why:'Hält den Wurf im Schadensbaum bezahlbar, statt ihn gegen Glanz-Aufbau abzuwägen.',links:['talent:baerbel-stage-1','throw:baerbel'],terms:['glueckstreffer','wurf','randale']}},
 'zugabe-rhythmus':{name:'Zugabe-Rhythmus',icon:'sound',look:'Schallwellen-Ringe über einem Mischpultregler',
  info:{effect:'Auslöser Finisher mit drei Punkten: setzt den Wurf zurück und gibt Randale.',why:'Füllt das Loch direkt nach der Eskalation, in dem sonst nur der Grundangriff bleibt.',links:['talent:baerbel-stage-5','throw:baerbel'],terms:['eskalation','wurf','randale']}},
 'frisch-verschraubt':{name:'Frisch verschraubt',icon:'vest',look:'Blechweste mit frisch angezogenen Schrauben und Funkenrest',
  info:{effect:'Auslöser Finisher mit drei Punkten: schweißt sofort Deckung auf.',why:'Der Schrottkoloss holt sich sein Polster aus dem Angriff, nicht aus einem Extraknopf.',links:['talent:kevin-iron-0','skill:kevin/burst'],terms:['eskalation','deckung']}},
 'doppelte-sicherung':{"name":"Doppelte Sicherung","icon":"cable","look":"Zwei parallele Schmelzsicherungen mit Kabelbinder verbunden","info":{"effect":"Bringt durch direkte Heilung den nächsten Bodenangriff zeitlich näher.","why":"Die Heilpause bringt die nächste Fläche näher; ihre Randale-Kosten bleiben bestehen.","links":["talent:kevin-fuse-7","ground:kevin"],"terms":["heilung","bodenangriff","randale"]}},
 'nachladen-im-rennen':{"name":"Nachladen im Rennen","icon":"foxboots","look":"Laufender Stiefel neben nachgezogenem Wurfgeschoss","info":{"effect":"Reduziert Kevins verbleibende Wurf-Abklingzeit beim Ausweichen.","why":"Die Regel, aus der Kevins Abstandsspiel eine echte Rotation wird.","links":["talent:kevin-hunt-3","throw:kevin"],"terms":["ausweichen","wurf","randale"]}},
 'schritt-voraus':{"name":"Schritt voraus","icon":"whistle","look":"Trillerpfeife mit angedeutetem Schrittmuster darunter","info":{"effect":"Senkt nach erfolgreichem Unterbrechen die restliche Abklingzeit von Ausweichen.","why":"Erlaubt zwei Antworten kurz hintereinander, statt zwischen Balken und Fläche wählen zu müssen.","links":["talent:kevin-hunt-7","skill:kevin/dash"],"terms":["unterbrechen","ausweichen"]}},
 'zuendfunke':{name:'Zündfunke',icon:'scrap',look:'Glimmender Funke an einer Zündschnur über Schrottblech',
  info:{effect:'Auslöser Marken-Tick: gibt mit einer Chance je Tick einen Druckpunkt.',why:'Aufbau ohne Tastendruck – genau das, was ein ständig ausweichender Fernkämpfer braucht.',links:['talent:kevin-fuse-1','skill:kevin/mark'],terms:['markierung','druck']}},
 'kurzschluss':{name:'Kurzschluss',icon:'metal',look:'Blechplatte mit Lichtbogen zwischen zwei blanken Drähten',
  info:{effect:'Auslöser Glückstreffer: setzt den Bodenangriff zurück.',why:'Die einzige Abkürzung an der längsten Abklingzeit in Kevins Kit vorbei.',links:['talent:kevin-fuse-5','ground:kevin'],terms:['glueckstreffer','bodenangriff','abklingzeit']}},
 'nietenpanzer':{name:'Nietenpanzer',icon:'shoulders',look:'Genietete Schulterplatte aus Dosenblech',
  info:{effect:'Auslöser Autoangriffs-Treffer: legt mit einer Chance je Treffer Deckung an.',why:'Polster, das im Nahkampf von allein entsteht – die Existenzgrundlage des Schrottkolosses.',links:['talent:kevin-iron-1'],terms:['autoangriff','deckung']}},
 'dampfdruck':{name:'Dampfdruck',icon:'robotclaw',look:'Zischendes Überdruckventil an einem Blechrohr',
  info:{effect:'Auslöser geglückte Parade: der nächste Finisher kostet keine Randale.',why:'Im Nahkampf pariert Kevin ständig – die Regel verwandelt das direkt in Schaden.',links:['talent:kevin-iron-5','skill:kevin/burst'],terms:['parade','eskalation','randale']}},
 'fangschuss':{name:'Fangschuss',icon:'slingshot',look:'Gespannte Kabelbinder-Schleuder mit anvisiertem Pfandgeschoss',
  info:{effect:'Auslöser vermiedener Treffer: der nächste Wurf trifft doppelt.',why:'Der Schadensanteil des Abstandsspiels – Fliehen und Treffen im selben Zug.',links:['talent:kevin-hunt-1','throw:kevin'],terms:['ausweichen','wurf']}},
 'beutefieber':{name:'Beutefieber',icon:'tusk',look:'Keilerzahn an einer Lederschnur, leicht vibrierend dargestellt',
  info:{effect:'Auslöser Kill: setzt das Ausweichen zurück und gibt Randale und einen Druckpunkt.',why:'Startet den nächsten Gegner mit vollem Werkzeugkasten statt bei null.',links:['talent:kevin-hunt-5','skill:kevin/dash'],terms:['schwung','ausweichen','druck','randale']}}
};
for(const [id,d] of Object.entries(PROC_DESCRIPTIONS)){const r=PROC_RULES[id];if(!r)continue;r.name=d.name;r.icon=d.icon;r.look=d.look;r.info=d.info;}
