// Bewohner mit Namen. IDs werden von quests.js und dialogues.js referenziert. look = Bildhinweis für Porträts/Sprites.
export const NPCS={
 ida:{name:'Kisten-Ida',role:'Logistik auf zwei Promille · Hauptquestgeberin',home:'St. Gangolf',faction:'clan',look:'Resolute Frau Ende 40, Bierkasten unter dem Arm, Schlüsselbund, Zigarette hinterm Ohr'},
 mara:{name:'Mara „Katerkiller“',role:'Kräuterhexe mit Mixer',home:'Clan-Treff',faction:'clan',look:'Junge Frau mit Bandana, Mörser, grüne Finger, Augenringe'},
 leander:{name:'Lauti-Leander',role:'Tontechniker ohne Gehör',home:'Clan-Treff',faction:'clan',look:'Dünner Typ mit Kopfhörern, Bollerbox, Kabelsalat um den Hals'},
 oskar:{name:'Grill-Oskar',role:'Grillmeister und Wurstphilosoph',home:'Pfandhof',faction:'clan',look:'Dicker Mann mit Schürze „Kiss the Grill“, Grillzange, Brandflecken'},
 fenja:{name:'Fenja Flaschenfee',role:'Barkeeperin mit Botanik-Diplom',home:'Pfandhof',faction:'clan',look:'Frau mit Blumenkranz, Shaker, Flaschenkorb am Rücken'},
 tilo:{name:'Tilo Tapedeck',role:'Kassettensammler, Repeat-Knopf-Opfer',home:'Wegestube',faction:'clan',look:'Mann mit Walkman, Kassettenkette, Trainingsjacke'},
 jonna:{name:'Jonna Jägermeisterin',role:'Leergut-Aufseherin',home:'Wegestube',faction:'clan',look:'Frau in Jägerweste, Pfandbon-Block, strenger Blick'},
 // --- neue Auftraggeber ---
 hedwig:{name:'Hedwig Hopfenkranz',role:'Hobbybrauerin, Giselas Erzfeindin',home:'Wegestube',faction:'clan',look:'Ältere Frau mit Hopfenkranz, Braukessel-Schürze, verschmitztes Grinsen'},
 konrad:{name:'Küster Konrad',role:'Küster von St. Gangolf, sammelt heimlich Kronkorken',home:'Clan-Treff',faction:'neutral',look:'Schmaler Mann in schwarzem Mantel, Klingelbeutel voller Kronkorken'},
 fiete:{name:'Feuerwehr-Fiete',role:'Löschzugführer, Sirenenfan',home:'Pfandhof',faction:'clan',look:'Feuerwehrmann in Einsatzhose, Helm unterm Arm, Sirenen-Fernbedienung'},
 elke:{name:'Elektro-Elke',role:'Elektrikerin, Lichterketten-Aktivistin',home:'Wegestube',faction:'clan',look:'Frau mit Werkzeuggürtel, Lichterkette um den Hals, Spannungsprüfer'},
 // --- Gegenseite ---
 horst:{name:'Horst Nüchternmann',role:'Vorstand für Hausordnung · Ruhe 22:01 e. V.',faction:'ruhe',look:'siehe enemies.js BOSSES.horst'},
 gisela:{name:'Gisela Gießkanne',role:'Erste Vorsitzende · Ruhe 22:01 e. V.',faction:'ruhe',look:'siehe enemies.js BOSSES.gisela'},
 buergermeister:{name:'Bürgermeister Bernd Beschluss',role:'Will nur seine Ruhe. Und wiedergewählt werden.',faction:'neutral',look:'Mann im Anzug mit Amtskette, Schweißperlen, Handy am Ohr'}
};
export const FACTIONS={
 clan:{name:'Poo-Tang-Clan',motto:'Gleiche Bande. Neuer Totalschaden.'},
 ruhe:{name:'Ruhe 22:01 e. V.',motto:'Lärm ist Gewalt.'},
 neutral:{name:'Mertloch',motto:'Wir wollen einfach nur unsere Ruhe. Aber nicht so.'}
};
/** Dekorative Bewohner (village-life.js zeichnet Varianten 0–7). Namen und Sprüche für spätere Sprechblasen. */
export const VILLAGERS=[
 {variant:0,name:'Opa Alwin',says:['Früher war hier mehr Lärm.','Der Horst? Der war schon als Kind so.']},
 {variant:1,name:'Postbotin Petra',says:['Ruhe 22:01 kriegt jeden Tag neue Post. Alles Beschwerden.','Nicht wieder ein Paket voller Kronkorken.']},
 {variant:2,name:'Bäcker Bruno',says:['Brezeln sind aus. Wieder.','Wer hat den Ofen auf Bass gestellt?']},
 {variant:3,name:'Schülerin Sina',says:['Mein Bruder ist beim Clan. Sagt er.','Die Gans hat mein Pausenbrot.']},
 {variant:4,name:'Bauer Berthold',says:['Die Keiler fressen mein Leergut.','Wenn Gisela kommt, geh ich in den Stall.']},
 {variant:5,name:'Pfarrer Paul',says:['Auch der Herr hat am siebten Tag gefeiert.','Konrad, die Kollekte klingelt wieder metallisch.']},
 {variant:6,name:'Kioskkönig Kalle',says:['Pfand geb ich nur gegen Pfand.','Der Automat nimmt meine Dosen nicht. Nie.']},
 {variant:7,name:'Nachbarin Nelli',says:['Ich bin nicht bei Ruhe 22:01. Ich bin nur laut dagegen.','Gießkanne? Die hat schon meinen Rasen verklagt.']}
];
