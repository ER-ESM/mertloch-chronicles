// Nebenquest-Vorlagen. Die Weltgenerierung erzeugt je Welt `rules.quests.count` Quests mit festem Typmuster
// (gather, scout, hunt, gather, …). dressStory() in clan.js wählt je Typ eine Vorlage, seedabhängig und ohne Wiederholung.
// Felder: id, npc (npcs.js), type, title, description(location), quote (Angebot), lines {progress, complete, claimed},
// activity (scout: rhythm|wires), itemName (gather), enemyName (hunt), reward (EP, sonst BALANCE.xp.quest[type]).
import {BALANCE} from './balance.js';
export const SIDE_QUESTS=[
 {id:'minze-mara',npc:'mara',type:'gather',title:'Morgen ist ein Problem',itemName:'Antikater-Minze',
  description:l=>`Drei Büschel Antikater-Minze bei ${l}. Mara will die Bande morgen wieder aufrecht sehen. Optimistische Scheiße.`,
  quote:'Minze her. Moralpredigt kannst du behalten.',
  lines:{progress:'Riecht schon nach Minze an dir. Weiter, es fehlt noch was.',complete:'Perfekt. Das kommt in den Mixer, und morgen kann keiner mehr sagen, wir wären nicht standfest.',claimed:'Der Kater ist besiegt. Der nächste kommt am Samstag.'}},
 {id:'bollerbox-leander',npc:'leander',type:'scout',activity:'rhythm',title:'Der Bass muss durch',
  description:l=>`Bring die Bollerbox bei ${l} in Takt. Drei präzise Bassimpulse im goldenen Zeitfenster – einfach nur Anschalten zählt nicht.`,
  quote:'Die Box klingt wie ein Sack Besteck im Trockner. Guck mal nach.',
  lines:{progress:'Wenn die Oma drei Straßen weiter mitschimpft, stimmt der Pegel.',complete:'DAS ist ein Bass. Ich hab nichts gehört, aber ich hab’s gespürt.',claimed:'Die Box läuft. Ruhe 22:01 hat schon zweimal angerufen. Erfolg.'}},
 {id:'grillplatz-oskar',npc:'oskar',type:'hunt',enemyName:'Pfandkeiler am Grillplatz',title:'Wurst Case Scenario',
  description:l=>`Zwei Pfandkeiler bei ${l} haben den Grillplatz übernommen. Hol Oskar seine Würde zurück. Die Würste sind vermutlich durch.`,
  quote:'Ich diskutiere doch nicht mit einem Schwein über meine letzte Bratwurst.',
  lines:{progress:'Ein Keiler weniger ist ein Steak mehr. Weiter.',complete:'Grillplatz frei. Würste durch. Würde wiederhergestellt. In der Reihenfolge.',claimed:'Die Currywurst ist heute aufs Haus. Morgen nicht mehr.'}},
 {id:'minze-fenja',npc:'fenja',type:'gather',itemName:'Antikater-Minze',title:'Botanik gegen Totalschaden',
  description:l=>`Sammle drei Portionen Antikater-Minze bei ${l}. Fenjas Mixer klingt bereits wie eine Waschmaschine voller Kies.`,
  quote:'Grünzeug rein, schlechte Entscheidungen raus. So der Plan.',
  lines:{progress:'Der Mixer wartet. Der Mixer hat wenig Geduld.',complete:'Grün, bitter, wirksam. Wie ich. Danke.',claimed:'Ich hab dir einen Drink gemacht. Er ist grün. Frag nicht.'}},
 {id:'bollerbox-tilo',npc:'tilo',type:'scout',activity:'wires',title:'Die Bollerbox des Grauens',
  description:l=>`Tilo hat die Anschlüsse bei ${l} verwechselt. Merke dir die Kabelreihenfolge und stecke sie korrekt zurück. Drei Patzer: noch mal von vorn.`,
  quote:'Find den verdammten Repeat-Knopf, bevor ich das Ding heirate oder anzünde.',
  lines:{progress:'Immer noch derselbe Refrain. Ich höre ihn im Schlaf.',complete:'Stille. Endlich Stille. Und jetzt mach was Lautes an.',claimed:'Ich hab die Kassette verbrannt. Aus Sicherheitsgründen.'}},
 {id:'leergut-jonna',npc:'jonna',type:'hunt',enemyName:'Pfandkeiler am Leergutlager',title:'Pfand ist kein Ponyhof',
  description:l=>`Vertreibe zwei Pfandkeiler bei ${l}. Die Viecher kauen auf unseren Kästen. Das ist Sachbeschädigung mit Schnauze.`,
  quote:'Fass meine Leute nicht an. Und schon gar nicht deren Leergut.',
  lines:{progress:'Ein Kasten weniger angeknabbert. Weiter so.',complete:'Kästen gezählt, Keiler weg. Du bist eingestellt. Unbezahlt.',claimed:'Jeder Bon stimmt heute. Das ist nie passiert.'}},
 // --- neue Vorlagen ---
 {id:'hopfen-hedwig',npc:'hedwig',type:'gather',itemName:'Wilder Eifelhopfen',title:'Hopfen und Malz, Gisela verloren',
  description:l=>`Pflücke drei Dolden wilden Eifelhopfen bei ${l}. Hedwig braut damit etwas, das Ruhe 22:01 als Sprengstoff einstufen würde.`,
  quote:'Gisela hat mir den Braukessel verklagt. Ich brau jetzt aus Trotz.',
  lines:{progress:'Riecht gut. Nicht dran lutschen, das ist für den Kessel.',complete:'Drei Dolden. Das reicht für ein Fass Widerstand.',claimed:'Der Sud gärt. Wenn es knallt, war’s Gisela.'}},
 {id:'kronkorken-konrad',npc:'konrad',type:'gather',itemName:'Kronkorken-Kollekte',title:'Die Kollekte klingelt',
  description:l=>`Sammle drei Handvoll Kronkorken bei ${l}. Konrad zählt sie im Klingelbeutel und nennt es Spende.`,
  quote:'Der Herr sieht alles. Der Pfarrer zum Glück nicht.',
  lines:{progress:'Psst. Nicht so laut mit dem Blech.',complete:'Segen für dich. Und ein neues Fahrrad für mich.',claimed:'Der Pfarrer fragt, warum die Kollekte klimpert. Ich sage: Wunder.'}},
 {id:'sirene-fiete',npc:'fiete',type:'scout',activity:'rhythm',title:'Die Sirene von Mertloch',
  description:l=>`Teste die Feuerwehrsirene bei ${l} im Takt. Drei saubere Impulse im goldenen Fenster, sonst rückt der Löschzug aus.`,
  quote:'Wenn die Sirene nicht groovt, kommt keiner. Das ist Physik.',
  lines:{progress:'Nicht zu früh, nicht zu spät. Wie beim Löschen.',complete:'Das war ein Takt! Der Löschzug tanzt. Der Löschzug soll nicht tanzen.',claimed:'Ruhe 22:01 hat die Sirene angezeigt. Die Sirene ist amtlich.'}},
 {id:'lichterkette-elke',npc:'elke',type:'scout',activity:'wires',title:'Lichterkette mit Kurzschluss',
  description:l=>`Die Lichterkette am Festzelt bei ${l} ist falsch gesteckt. Merke dir die Reihenfolge der Anschlüsse und stecke sie richtig.`,
  quote:'Vier Stecker, eine Reihenfolge, null Toleranz. Wie bei mir.',
  lines:{progress:'Wenn es funkt, war’s falsch. Wenn es leuchtet, war’s ich.',complete:'Leuchtet! Und Horst kann uns jetzt aus dem All sehen.',claimed:'Die Kette blinkt im Takt der Anlage. Kevin hat einen Chip eingebaut. Frag nicht.'}},
 {id:'friedhof-konrad',npc:'konrad',type:'hunt',enemyName:'Pfandkeiler am Friedhof',title:'Ruhe in Frieden, nicht in Keilern',
  description:l=>`Zwei Pfandkeiler bei ${l} wühlen den Friedhof um. Konrad hat Angst um die Gräber. Und um seinen Kronkorkenvorrat darunter.`,
  quote:'Die Toten ruhen. Die Keiler nicht. Kümmere dich.',
  lines:{progress:'Einer weniger. Der Herr dankt. Ich auch.',complete:'Friedhof still. Vorrat unentdeckt. Amen.',claimed:'Ich hab eine Kerze für dich angezündet. Aus Kronkorken.'}},
 {id:'hopfengarten-hedwig',npc:'hedwig',type:'hunt',enemyName:'Pfandkeiler im Hopfengarten',title:'Keiler im Hopfengarten',
  description:l=>`Vertreibe zwei Pfandkeiler bei ${l}. Sie fressen Hedwigs Hopfen, und betrunkene Keiler sind schlimmer als nüchterne.`,
  quote:'Ein besoffener Keiler hat mir den Zaun umgelegt. Mit Anlauf.',
  lines:{progress:'Der Zaun steht wieder. Halb.',complete:'Hopfen gerettet. Du kriegst das erste Glas. Auf eigene Gefahr.',claimed:'Das Bier heißt jetzt „Keilerkiller“. Du stehst auf dem Etikett.'}}
];
export const questReward=t=>t.reward??BALANCE.xp.quest[t.type]??180;
/** Deterministische Auswahl: je Typ eine Rotation der Vorlagen abhängig vom Welt-Seed, ohne Wiederholung innerhalb einer Welt. */
export function pickTemplates(quests,seed=0){const used=new Set(),out=[];for(const [i,q] of quests.entries()){const pool=SIDE_QUESTS.filter(t=>t.type===q.type);const shift=(Math.abs(seed|0)%Math.max(1,Math.floor(pool.length/2)))*2,offset=(Math.floor(i/3)+shift)%pool.length;let t=null;for(let k=0;k<pool.length;k++){const c=pool[(offset+k)%pool.length];if(!used.has(c.id)){t=c;break;}}t||=pool[offset];used.add(t.id);out.push(t);}return out;}
