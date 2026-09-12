// Fähigkeiten. Stabile IDs (strike, mark, burst, interrupt, parry, dash, heal, buff, throw, ground + Talentfähigkeiten)
// sind Speicherschlüssel und Icon-Schlüssel (skill-art.js SKILL_ICON_ORDER). Neue aktive Fähigkeiten brauchen dort ein Icon.
// BASE = gemeinsames Gerüst je Slot, KITS = klassenspezifische Überschreibungen in derselben Reihenfolge.
export const BASE_SKILLS=[
 {id:'strike',key:'1',cd:.85,cost:0,range:55,damage:65,gain:14,color:'#ecdca3',bg:'#655d35',icon:'bottle'},
 {id:'mark',key:'2',cd:6,cost:20,range:155,dot:12,duration:10,color:'#a7dacf',bg:'#306359',icon:'tag'},
 {id:'burst',key:'3',cd:4,cost:35,range:125,base:55,perPoint:55,multiplier:1.6,color:'#e6c2fa',bg:'#665080',icon:'speaker'},
 {id:'interrupt',key:'4',cd:9,cost:10,range:140,damage:35,color:'#94cadb',bg:'#30546b',icon:'mute'},
 {id:'parry',key:'E',cd:7,cost:0,window:.8,reflect:75,color:'#e8d894',bg:'#74603b',icon:'shield'},
 {id:'dash',key:'LEER',cd:4,cost:0,steps:19,color:'#bbdfb8',bg:'#3b6952',icon:'dash'},
 {id:'heal',key:'Q',cd:22,cost:0,heal:240,color:'#edb0a2',bg:'#764a41',icon:'pretzel'}
];
export const KITS={
 dieter:[
  {name:'Kronkorken-Kelle',text:'300 % Autoschaden + 14 Schaden im Nahkampf. +1 Pegel und 14 Randale. „Das ist kein Streit. Das ist Leergutklärung.“'},
  {name:'Du schuldest mir Pfand!',text:'Markiert 10 s lang: 12 Schaden pro Sekunde. Dein Abriss trifft ein markiertes Ziel 60 % härter.'},
  {name:'Bierzelt-Abriss',text:'Verbraucht 1–3 Pegel: 30 Schaden + (150 % + 320 % pro Pegel) Autoschaden. Mit Pfandschuld 60 % stärker. Danach steht kein Tisch mehr gerade.'},
  {name:'Halt die Fresse!',text:'35 Schaden. Unterbricht gelbe Zauber, betäubt 2 s und macht das Ziel 4 s verwundbar (+35 % Schaden). Außerhalb der globalen Abklingzeit.'},
  {name:'Deckel drauf!',text:'Pariert den nächsten Treffer innerhalb von 0,8 s. Reflektiert 75 Schaden, heilt 35 Leben und gibt +1 Pegel sowie 20 Randale.'},
  {name:'Ab durch die Hecke',text:'Ein beherzter Abgang. Weicht in Laufrichtung aus; ohne Eingabe vom Ziel weg. 0,4 s Schutz vor Treffern.'},
  {name:'Konterfrühstück',text:'240 Leben aus einer sehr verdächtigen Brezel. Im Spiel erstaunlich wirksam, kulinarisch ein Straftatbestand.'}
 ],
 baerbel:[
  {name:'Pinsel-Piekser',cd:.95,range:155,damage:48,gain:10,icon:'speaker',text:'200 % Autoschaden + 14 Fernkampfschaden, +1 Glanz und 10 Randale. Triff nach 0,85–1,5 s erneut für einen zusätzlichen Glanzpunkt.'},
  {name:'Fleckentest, Schätzchen!',range:190,dot:10,text:'10 s Markierung, 10 Schaden pro Sekunde. Verstärkt deinen nächsten Turbo-Einschlag um 60 %.'},
  {name:'Thermomix-Turbostufe',range:175,base:40,perPoint:48,splash:95,text:'14 Schaden + (150 % + 280 % pro Glanz) Autoschaden, markiert +60 %. Gegner im Umkreis von 12 m erhalten 55 % des Einschlags – auch neutrale! Verbraucht alle Glanzpunkte.'},
  {name:'Kommentarspalte zu!',range:190,cd:10,text:'35 Schaden. Unterbricht gelbe Zauber und macht das Ziel 4 s verwundbar. „Deine Meinung hat Sendepause.“'},
  {name:'Hygiene-Handschuh',window:.9,reflect:55,text:'0,9 s Parierfenster. Reflektiert 55 Schaden, gibt einen Glanzpunkt und 20 Randale. Keine Heilung.'},
  {name:'Raus aus meinem Reel',cd:6,steps:24,text:'Ein längerer Ausweichsprung mit 0,4 s Schutz. „Du stehst im Bild, verdammte Axt!“'},
  {name:'Landhaus-Löffelkur',cd:8,heal:145,text:'Heilt dich direkt. Bastelgrips, Wumms und Handschrift verstärken die Wirkung. Talente verwandeln die Heilung in Hauspflege, Schutz oder einen offensiven Frischekick.'}
 ],
 kevin:[
  {name:'Pfandgeschoss',range:195,damage:42,gain:16,icon:'bottle',text:'200 % Autoschaden + 8 Fernkampfschaden, +1 Druck und 16 Randale. Eine Flasche mit erstaunlich überzeugender Flugbahn.'},
  {name:'Kleb die Scheiße fest',range:210,dot:9,slow:.5,text:'10 s Markierung und 9 Schaden pro Sekunde. Halbiert das Bewegungstempo des Ziels, solange es markiert ist.'},
  {name:'Restmüll-Rakete',range:205,base:60,perPoint:44,multiplier:1.8,knockback:28,text:'34 Schaden + (150 % + 260 % pro Druckpunkt) Autoschaden, markiert +80 %. Verbraucht Druck und stößt das Ziel zurück. Funktioniert laut Bauplan überhaupt nicht.'},
  {name:'Sicherung raus!',range:210,text:'35 Schaden, Unterbrechung und 4 s Verwundbarkeit. Erfolgreich: +1 Druck, Restmüll-Rakete wird 2 s früher bereit.'},
  {name:'Pömpel-Panzer',window:1.1,reflect:60,text:'1,1 s Parierfenster. Reflektiert 60 Schaden, gibt +1 Druck und 20 Randale. Der Pömpel dichtet alles ab.'},
  {name:'Kabelbrand-Flucht',steps:20,text:'Aus dem Gefahrenbereich flitzen. 0,4 s Schutz. „Das hat vorhin noch nicht geraucht.“'},
  {name:'Notfall-Laugengebäck',heal:225,text:'225 Leben. Die Serviette ist gleichzeitig Garantieschein und Brandschutzkonzept.'}
 ]
};
/** Klassenbuff (Slot „buff“). */
export const BUFF_SKILLS={
 common:{id:'buff',cd:28,cost:15,duration:10,color:'#aed7aa',bg:'#426c60',icon:'shield'},
 dieter:{name:'Dosenmut',reduction:.25,text:'10 Sekunden weniger Schaden. Der Türsteher baut zusätzlich Deckung auf.'},
 baerbel:{name:'Aperol-Nachsorge',hot:12,text:'10 Sekunden Hauspflege: heilt jede Sekunde. Orange im Glas, Grün im Lebensbalken. Annis fragwürdiges Wellnessprogramm.'},
 kevin:{name:'Isolierband hält',shield:130,text:'Ein Schutzpolster absorbiert Schaden. Bastelgrips und Handschrift verstärken den Schild.'}
};
/** Gezielter Wurf und Bodenangriff, je Klasse benannt. */
export const THROW_SKILL={id:'throw',key:'3',cd:6,cost:18,range:235,damage:75,icon:'bottle',color:'#dbc083',bg:'#5b6036',
 names:{dieter:'Pfand auf die Zwölf',baerbel:'Puderdose ins Gesicht',kevin:'Dosen-Drohne'},
 flavor:{dieter:'Eine gezielt geworfene Mehrwegflasche',baerbel:'Eine fliegende Puderdose',kevin:'Eine ferngesteuerte Pfanddose'},
 text:' trifft ein einzelnes Ziel. 300 % Autoschaden + 24 Schaden, 18 Randale. Ideal, um einen Gegner aus der Gruppe zu ziehen.'};
export const GROUND_SKILL={id:'ground',key:'7',cd:12,cost:35,ground:true,range:210,radius:70,damage:125,delay:1.1,icon:'burst',color:'#e6b769',bg:'#79633e',
 names:{dieter:'Böller unterm Biertisch',baerbel:'Grundreinigung auf eigene Gefahr',kevin:'Restmüll mit Zündschnur'},
 text:'Mit der Maus einen freien Bodenpunkt wählen. Nach 1,1 s: 125 Grundschaden im Umkreis von 9 m an bis zu 5 Zielen – auch neutralen. Rechtsklick oder Esc bricht das Zielen ab.'};
/** Aktive Talentfähigkeiten (Schlüssel = grants in talents.js). */
export const TALENT_SKILLS={
 barricade:{name:'Absperrband',ground:true,range:170,radius:85,duration:8,cd:24,cost:25,text:'Platziere eine Zone: darin 30 % weniger Schaden. Bleib hinter deiner Absperrung, statt blind hinterherzulaufen.'},
 slam:{name:'Tresensprung',ground:true,range:145,radius:60,damage:95,cd:16,cost:20,text:'Springe zum freien Zielpunkt, triff bis zu 5 Gegner und erhalte 1 Pegel. Hindernisse kannst du nicht überspringen.'},
 keg:{name:'Katerfass',ground:true,range:160,radius:80,duration:10,cd:25,cost:25,text:'Platziere ein heilendes Fass: 24 Leben pro Sekunde, solange du darin stehst. Gegner in der Pfütze werden langsamer.'},
 sanctuary:{name:'Thermomix-Tafel',ground:true,range:190,radius:85,duration:10,cd:24,cost:25,text:'Heilzone für 28 Leben pro Sekunde. Du musst darin stehen bleiben; Bewegung und Heilung sinnvoll abwägen.'},
 infusion:{name:'Provisionskur',duration:8,cd:24,cost:15,text:'8 Sekunden lang heilen dich 35 % deines verursachten Schadens zusätzlich. Dein Schmerz, meine Provision. Schön sauber abrechnen.'},
 encore:{name:'Noch ein Reel, ihr Opfer!',cd:25,cost:10,text:'Setzt die Abklingzeit von Thermomix-Turbostufe zurück und gibt sofort 3 Glanz. Fleckentest vorbereiten, Reel neu starten, Turbostufe zünden.'},
 detonate:{name:'Kettenzündung',radius:210,cd:14,cost:25,text:'Sprengt bis zu 5 markierte Ziele in Sicht und Reichweite für je 110 Schaden. Verbraucht deren Markierungen. Erst verteilen, dann zünden.'},
 magnet:{name:'Magnetpanzer',radius:120,cd:22,cost:25,text:'Gibt 140 Deckung, zieht bis zu 5 nahe Gegner an und hält sie kurz fest. Das zieht auch bislang neutrale Ziele in den Kampf.'},
 snare:{name:'Pfandseil',ground:true,range:220,radius:48,duration:14,cd:16,cost:20,text:'Legt eine Falle aus. Der erste Eindringling löst 75 Schaden und 3 Sekunden Festhalten aus. Du kannst währenddessen weiterkämpfen.'}
};
/** Stufen, auf denen Kernfähigkeiten gelernt werden. Klassen überschreiben einzelne Einträge. */
export const LESSONS={auto:1,strike:1,dash:1,buff:2,throw:3,parry:4,interrupt:4,mark:5,burst:6,heal:8,ground:9};
export const CLASS_LESSONS={dieter:LESSONS,baerbel:{...LESSONS,heal:2,buff:3,throw:8,parry:7},kevin:{...LESSONS,throw:2,buff:3,parry:7}};
