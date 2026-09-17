// Hauptgeschichte. Akt 1 „Filmriss“ = Kapitel 1–4. Kapitel 1 läuft im Spiel (engine.js quest.wolves/cultists/boss),
// Kapitel 2–4 sind vollständig beschrieben (Ziele, Boss, Dialoge, Belohnung, Erinnerungsfetzen, Basisbau) und warten auf
// den Kapitelumschalter (content/BACKLOG.md). Kapitel 5–6 sind Altbestand (Gisela, Pfandautomat) für einen späteren Akt;
// sie bleiben nur, weil ihre Bosse Speicher- und Schemaschlüssel sind. Gestaltung: docs/AKT-1-FILMRISS.md.
import {BALANCE} from './balance.js';
export const STORY={title:'Filmriss',act:1,giver:'Kisten-Ida',reward:'Goldener Dosenöffner',boss:'Horst Nüchternmann',faction:'Ruhe 22:01 e. V.',
 hero:{state:'Unterhose, eine Socke, Stempel auf dem Unterarm',pocket:'Ein Pfandbon über 0,08 €. Ausgestellt Samstag, 23:58.',stamp:'NIE WIEDER MONTAG · ZUTRITT',memory:'weg. Komplett. Nicht mal der eigene Name.'}};
export const LORE={
 setting:'Mertloch im Maifeld, 56753. Ein Dorf mit Kirche, Grillplatz, Pfandhof, einem Schrottplatz am Ortsrand und mehr Vereinen als Einwohnern. Sonntagmorgen. Es riecht nach kaltem Grill und Reue.',
 clan:'Der Poo-Tang-Clan: Kisten-Ida, Dosen-Dieter, Aperol-Anni, Klo-Kevin und Anhang. Geboren, geblieben, nie leise gewesen. Vereinsheim: „die Bude“, eine ehemalige Milchsammelstelle hinter St. Gangolf. Seit 2007 Vereinsheim ohne Verein.',
 fest:'„Nie wieder Montag“ – das Jahresfest des Clans, jeden dritten Samstag im September. Regel 1: Die Kiste wird geöffnet. Regel 2: Es gibt keine Regel 2. Diesmal endete es um 22:01 Uhr mit dem ersten Polizeianruf und irgendwann danach mit Totalschaden.',
 destruction:'In der Nacht wurde die Bude zerlegt. Tresen raus, Anlage weg, Grill umgekippt, Dach halb ab, und die Kiste ist verschwunden. Wer es war, weiß niemand. Wer nüchtern war, auch nicht. Das ist dasselbe Problem.',
 hero:'Der Held wacht in den Trümmern auf. Unterhose, eine Socke, ein Stempel „NIE WIEDER MONTAG · ZUTRITT“ auf dem Unterarm und ein Pfandbon über acht Cent. Keine Erinnerung. Niemand im Dorf kennt ihn. Der Clan hat drei Theorien: Zeuge, Täter oder Sperrmüll. Für alle drei gibt es Verwendung.',
 suspects:'Ruhe 22:01 e. V. (immer schuld), Sperrmüll-Sigi (hat den Tresen), der Kegelclub „Alle Neune Kalt“ (Erzfeind seit dem Dorfpokal 2011), ein Bus mit Koblenzer Kennzeichen (hat keiner gesehen, alle gehört) – und der Held selbst, dem sein eigener Stempel nicht geheuer ist.',
 antagonist:'Ruhe 22:01 e. V. – gegründet nach dem Fest „Nie wieder Montag“ 2019, als um 22:01 Uhr zum ersten Mal jemand die Polizei rief. Ziel: absolute Nachtruhe. Mittel: Hausordnungen, Petitionen, Praktikanten. In Akt 1 vor allem: der übliche Verdächtige.',
 macguffin:'Die Kiste. Nicht irgendeine Kiste: die Kiste vom ersten Fest 2007, seitdem jedes Jahr neu befüllt, nie ganz geleert. Wer sie hat, hat die Party. Am Sonntagmorgen hat sie niemand. Behauptet jeder.'
};
export const ACTS=[
 {id:1,title:'Filmriss',subtitle:'Kein Hemd. Kein Plan. Kein Clan.',chapters:[1,2,3,4],
  arc:'Wiederaufbau der Bude, Suche nach den Unbekannten, Erinnerungsfetzen des Helden. Jeder Verdächtige hat ein Alibi und einen Hinweis. Am Ende weiß der Clan, wer es war – und der Held weiß, dass er dabei war.',
  ending:'Trauzeuge Timo erkennt den Helden: Er ist in Koblenz in den falschen Bus gestiegen, hat auf dem Fest mitgesoffen, mitgeprügelt und die Kiste selbst aus der Bude getragen. Freiwillig. Wem er sie gegeben hat, weiß er noch nicht. Der Clan nimmt ihn trotzdem auf: „Wer mit uns kaputt macht, baut mit uns auf.“'},
 {id:2,title:'(offen)',subtitle:'Wird erst gestaltet, wenn Akt 1 fertig ist.',chapters:[5,6],reserve:true,
  arc:'Hinweise aus Akt 1: der Bräutigam Bastian, die Kiste als Hochzeitsgeschenk, eine Hochzeit in Koblenz am nächsten Samstag. Gisela und der Pfandautomat sind Altbestand und können hier oder gar nicht vorkommen.'}
];
export const STORY_CHAPTERS=[
 {id:1,act:1,title:'Der übliche Verdächtige',boss:'horst',dialogue:'intro',implemented:true,
  summary:'Die Bude liegt in Trümmern, die Kiste ist weg, und Ruhe 22:01 war verdächtig schnell da, um „Beweise zu sichern“. Pfandkeiler fressen die Reste, Ruhewärter tragen den Rest weg, und Horst Nüchternmann hält in seinem Hausordnungs-Panzer eine Beweismittelkiste fest. In der liegt auch deine Hose.',
  objectives:[{kind:'kill',type:'wolf',count:3,label:'Pfandkeiler von den Trümmern jagen'},{kind:'kill',type:'cultist',count:2,label:'Ruhewärter beim „Beweise sichern“ stoppen'},{kind:'boss',boss:'horst',label:'Horst Nüchternmann samt Beweismittelkiste stellen'}],
  reward:{xp:BALANCE.xp.quest.main,coins:25,relic:'Goldener Dosenöffner',relicEffect:'+12 % Eskalationsschaden',gear:'rare'},
  clue:'Horst hat ein Alibi: Um 22:01 Uhr hat er, wie jedes Jahr, vom Festnetz die Polizei gerufen. Protokolliert. In seiner Beweismittelkiste: deine Hose, darin ein Busticket Koblenz–Mertloch, und ein Handy, das nicht deins ist.',
  memories:['kasten-feuerzeug','pizzeria'],
  unlocks:['Deine Hose zurück','Baustelle Bude freigelegt (Basisbau ab Kapitel 2)','Erinnerungsfetzen 1–2']},
 {id:2,act:1,title:'Wiederaufbau mit Restpromille',boss:'sigi',dialogue:'wiederaufbau',implemented:false,requires:1,
  summary:'Ohne Tresen kein Clan. Sperrmüll-Sigi hat in der Nacht mit dem Hänger alles abgeholt, was auf der Straße lag – Tresen, Bänke, halbe Anlage – und beruft sich auf Finderrecht. Festzelt-Schnorrer plündern derweil die Baustelle. Dieter braucht Paletten, Kevin braucht Kabel, Ida braucht Ruhe. Bekommt keiner.',
  objectives:[{kind:'gather',item:'palettenholz',count:6,label:'Palettenholz vom Sperrmüllplatz holen'},{kind:'kill',family:'scrounger',count:4,label:'Festzelt-Schnorrer von der Baustelle scheuchen'},{kind:'boss',boss:'sigi',label:'Sperrmüll-Sigi den Tresen abnehmen'}],
  reward:{xp:800,coins:35,relic:'Sigis Greifzange',relicEffect:'8 % weniger Schaden unter 35 % Leben',gear:'rare'},
  clue:'Sigi kam um drei mit dem Hänger. Da war die Bude schon kaputt. Er hat einen Bus mit Koblenzer Kennzeichen wegfahren sehen – und hinten dran „einen in Unterhose mit Bierkasten auf dem Kopf“. Er hat gewunken. Der Kasten hat zurückgewunken.',
  memories:['kastenturm','shirt-zu-klein'],
  unlocks:['Basisbau: Tresen, Grill, Werkstatt (Stufe 1)','Sperrmüllplatz als Materialquelle','Hinweis: Bus aus Koblenz']},
 {id:3,act:1,title:'Alle Neune, kein Alibi',boss:'klaus',dialogue:'kegelclub',implemented:false,requires:2,
  summary:'Der Kegelclub „Alle Neune Kalt“ aus dem Nachbardorf hasst den Clan seit dem Dorfpokal 2011 (Dieter hat die Kugel behalten). Ihre Kegelbahn wurde in derselben Nacht zerlegt, und Kegelkönig Klaus ist sicher: Das war Poo-Tang. Er kommt mit dem ganzen Verein zum Festplatz. Leander braucht außerdem Kabel für die Anlage, und die liegen ausgerechnet auf der Kegelbahn.',
  objectives:[{kind:'kill',family:'kegler',count:5,label:'Kegelbrüder aus Kalt vom Festplatz kegeln'},{kind:'gather',item:'kabel',count:5,label:'Anlagenkabel von der zerlegten Kegelbahn holen'},{kind:'boss',boss:'klaus',label:'Kegelkönig Klaus zur Aussage bewegen'}],
  reward:{xp:1000,coins:45,relic:'Die Kugel des Anstoßes',relicEffect:'Glückstreffer geben 4 Randale zurück',gear:'rare'},
  clue:'Klaus hat sie gesehen: „Zwölf Mann in gleichen weißen T-Shirts, GAME OVER draufgedruckt. Und einer in Unterhose, der die ganze Zeit ‚NEUES SPIEL!‘ geschrien hat.“ Du kennst die Stimme. Es ist deine.',
  memories:['neues-spiel','wurst-ins-gesicht','der-bus'],
  unlocks:['Basisbau: Anlage (Stufe 1), Tresen Stufe 2','Kegelclub als Nachbarn mit Groll','Hinweis: GAME-OVER-Shirts']},
 {id:4,act:1,title:'Der Bus nach nirgendwo',boss:'timo',dialogue:'bus',implemented:false,requires:3,
  summary:'Der Bus steht seit Sonntag im Feld am Ortsausgang: Tank leer, Fahrer weg, zwölf Junggesellen seit Samstag wach. Auf dem Dach: Trauzeuge Timo mit Schärpe, Bierbong und der festen Überzeugung, dass der Junggesellenabschied noch läuft. Polizeiobermeister Pit will keinen Papierkram und bittet um Amtshilfe. Der Clan will Antworten. Du willst dein Handy.',
  objectives:[{kind:'kill',family:'jga',count:6,label:'Junggesellen einsammeln, bevor Pit es tut'},{kind:'gather',item:'jga-shirt',count:4,label:'GAME-OVER-Shirts als Beweise sichern'},{kind:'boss',boss:'timo',label:'Trauzeuge Timo vom Busdach holen'}],
  reward:{xp:1400,coins:60,relic:'Die Schärpe der Wahrheit',relicEffect:'Ausweichen wird 15 % schneller bereit',gear:'rare'},
  clue:'Timo erkennt dich: „DU! Du bist in Koblenz eingestiegen, weil du dachtest, das wär der Nachtbus! Du hast Bastians Shirt gekriegt, weil er gekotzt hat!“ Die Unbekannten waren zwölf Junggesellen, ein sturzbetrunkener Clan und du. Die Kiste hat der Bräutigam. Bastian. Du hast sie ihm gegeben. Warum, weißt du nicht.',
  memories:['die-kiste'],
  unlocks:['Aktschluss: Aufnahme in den Poo-Tang-Clan','Basisbau: Stufe 2 überall, Landhaus-Ecke und Pfandlager','Akt 2 (offen): Bastian, die Kiste, die Hochzeit in Koblenz']},
 // --- Altbestand für einen späteren Akt. Nicht Teil von Akt 1; bleibt wegen Boss-Speicherschlüsseln. ---
 {id:5,act:2,reserve:true,title:'Der grüne Daumen der Macht',boss:'gisela',dialogue:'chapter2',implemented:false,requires:4,
  summary:'Altbestand. Gisela Gießkanne, Erste Vorsitzende von Ruhe 22:01, ihr Garten eine Festung aus Petunien.',
  objectives:[{kind:'kill',family:'inspector',count:4,label:'Ordnungsamt-Praktikanten vertreiben'},{kind:'gather',item:'hopfen',count:5,label:'Wilden Eifelhopfen für Hedwig sichern'},{kind:'boss',boss:'gisela',label:'Gisela im Beet stellen'}],
  reward:{xp:900,coins:40,relic:'Hedwigs Trotzsud',relicEffect:'+10 % Heilung und Schilde',gear:'rare'}},
 {id:6,act:2,reserve:true,title:'Nicht angenommen',boss:'automat',dialogue:'chapter3',implemented:false,requires:5,
  summary:'Altbestand. Der Pfandautomat 3000 nimmt nichts an, frisst Drohnen und druckt Bußgelder statt Bons.',
  objectives:[{kind:'gather',item:'dosenblech',count:6,label:'Dosenblech vom Automaten sammeln'},{kind:'kill',family:'scrounger',count:5,label:'Festzelt-Schnorrer vom Automaten fernhalten'},{kind:'boss',boss:'automat',label:'Den Pfandautomaten 3000 abschalten'}],
  reward:{xp:1400,coins:60,relic:'Kevins Chip',relicEffect:'Verpflegung 5 s schneller bereit',gear:'epic'}}
];
export const chapterFor=id=>STORY_CHAPTERS.find(c=>c.id===id)||STORY_CHAPTERS[0];
export const actChapters=actId=>STORY_CHAPTERS.filter(c=>c.act===actId);
