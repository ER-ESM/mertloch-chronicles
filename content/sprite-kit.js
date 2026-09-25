// Sprite-Baukasten (E-54): Welten, Häuser und Innenräume werden aus Einzel-Sprites zusammengesetzt.
// Jede Sprite-Art erbt über `is` die Regeln ihrer Klasse; eine Art ändert nur, was bei ihr anders ist.
// Maße in Welteinheiten (14,4 E = 1 m). `w`/`h` = Standfläche (x = Mitte, y = Mitte der Standfläche), `height` = Höhe.
//
// Felder der Klassen (vererbt, überschreibbar):
//  layer      Zeichenebene: ground (Belag) · decal (flach am Boden) · wall (Wand/Tür) · wall-decor (an der Wandfront) · standing (tiefensortiert)
//  surface    Wo die Art stehen darf: room (füllt einen Raum) · floor (auf freiem Boden) · wall-line (entlang einer Wandlinie) ·
//             wall-gap (in einer Wandlücke) · wall-face (an einer sichtbaren Wandfront) · top (auf einer Ablage)
//  walkable   Darf man darüber laufen? false = Standfläche sperrt (Kollision und Wege)
//  top        Hat eine Ablage, auf der `tischdeko` stehen darf
//  outdoor    Nur draußen (Hof, Dorf), nie unter einem Dach · indoor: nur drinnen
//  needs      Raum-Merkmale, die der Raum haben muss (z. B. `nass` für Küche und Klo)
//  keepDoors  Standfläche hält den Durchgang vor Türen frei
//  mount      Wandschmuck: Höhe über dem Boden, in der er an der Wand hängt (mount + height ≤ sichtbare Wandfront)
export const KIT_CLASSES={
 sprite:{name:'Sprite',layer:'standing',surface:'floor',walkable:false,shadow:true,w:16,h:12,height:12,color:'#8a6a48'},
 belag:{is:'sprite',name:'Bodenbelag',layer:'ground',surface:'room',walkable:true,shadow:false,tile:true},
 bodendeko:{is:'sprite',name:'Bodendeko',layer:'decal',surface:'floor',walkable:true,shadow:false,height:0,overlap:true},
 wand:{is:'sprite',name:'Wand',layer:'wall',surface:'wall-line',walkable:false,shadow:false,tile:true,cut:28},
 tuer:{is:'sprite',name:'Tür',layer:'wall',surface:'wall-gap',walkable:true,shadow:false,clearance:20},
 wandschmuck:{is:'sprite',name:'Wandschmuck',layer:'wall-decor',surface:'wall-face',walkable:true,shadow:false,h:2,height:8,mount:8},
 moebel:{is:'sprite',name:'Möbel',surface:'floor',walkable:false,keepDoors:true,indoor:true},
 ablage:{is:'moebel',name:'Möbel mit Ablage',top:true},
 sitz:{is:'moebel',name:'Sitzmöbel',w:8,h:8,height:12},
 nassmoebel:{is:'moebel',name:'Sanitär und Spüle',needs:['nass']},
 tischdeko:{is:'sprite',name:'Tischdeko',surface:'top',walkable:true,shadow:false,w:4,h:4,height:6,overlap:true},
 aussen:{is:'moebel',name:'Draußen',indoor:false,outdoor:true},
 zaun:{is:'wand',name:'Zaun',outdoor:true,cut:12},
 basisbau:{is:'moebel',name:'Basisbau',walkable:true,keepDoors:false,indoor:false},
 treppe:{is:'sprite',name:'Treppe',layer:'ground',surface:'stairs',walkable:false,shadow:false}
};

export const KIT_SPRITES={
 // Beläge (füllen je einen Raum)
 'dielen-dunkel':{is:'belag',name:'Dunkle Dielen',color:'#7a4d2c'},
 'dielen-hell':{is:'belag',name:'Helle Dielen',color:'#9a6a40'},
 'teppichboden-rot':{is:'belag',name:'Roter Teppich auf Dielen',color:'#6f302d'},
 'estrich':{is:'belag',name:'Estrich',color:'#8d8a84'},
 'fliesen-weiss':{is:'belag',name:'Weiße Fliesen',color:'#cfd3cf'},
 'bretter-grau':{is:'belag',name:'Graue Bodenbretter',color:'#6e6a62'},
 'kies-hof':{is:'belag',name:'Kies und Erde',color:'#9c8a6a',outdoor:true},
 'pflaster-stein':{is:'belag',name:'Steinpflaster',color:'#6a6660',outdoor:true},
 'bretter-staubig':{is:'belag',name:'Staubige Bretter',color:'#8a7a60'},
 // Wände
 'wand-aussen':{is:'wand',name:'Außenwand',thickness:8,color:'#b9a27a'},
 'wand-putz':{is:'wand',name:'Innenwand',thickness:6,color:'#cdbb92'},
 'zaun-latten':{is:'zaun',name:'Lattenzaun',thickness:4,color:'#7a5a3a'},
 // Treppen (füllen die Treppenfläche eines Geschosses)
 'treppe-holz':{is:'treppe',name:'Holztreppe nach oben',color:'#9c7450'},
 'treppenloch':{is:'treppe',name:'Treppenloch mit Geländer',color:'#1b1410'},
 // Türen (in Wandlücken)
 'tuer-holz':{is:'tuer',name:'Holztür',color:'#6b4a2f'},
 'tuer-eingang':{is:'tuer',name:'Eingangstür',color:'#5c3f28'},
 'tor-hof':{is:'tuer',name:'Hoftor',outdoor:true,color:'#7a5a3a'},
 // Wandschmuck (nur an sichtbaren Wandfronten)
 'dartscheibe':{is:'wandschmuck',name:'Dartscheibe',w:10,height:10,mount:9,color:'#2f3a2a'},
 'bild-landschaft':{is:'wandschmuck',name:'Landschaftsbild',w:14,height:9,mount:10,color:'#6a7a4a'},
 'geweih':{is:'wandschmuck',name:'Hirschgeweih',w:12,height:8,mount:12,color:'#b89868'},
 'wimpelkette':{is:'wandschmuck',name:'Wimpelkette',w:40,height:5,mount:15,color:'#d0685a'},
 'flaschenbord':{is:'wandschmuck',name:'Flaschenbord',w:34,height:11,mount:7,color:'#6d4527'},
 'wandlampe':{is:'wandschmuck',name:'Wandlampe',w:6,height:7,mount:12,color:'#e0b45c',light:true},
 'spiegel':{is:'wandschmuck',name:'Spiegel',w:10,height:10,mount:10,color:'#9fb4bd'},
 'plakat':{is:'wandschmuck',name:'Festplakat',w:10,height:12,mount:8,color:'#d8c07a'},
 'hakenleiste':{is:'wandschmuck',name:'Hakenleiste mit Jacken',w:16,height:12,mount:8,color:'#5a6a3a'},
 'bauplan-tafel':{is:'wandschmuck',name:'Tafel mit Bauplänen',w:24,height:11,mount:9,color:'#d9d2b8'},
 'regalbrett':{is:'wandschmuck',name:'Regalbrett',w:20,height:8,mount:11,color:'#7a5a3a'},
 // Möbel
 'kanonenofen':{is:'moebel',name:'Kanonenofen',w:16,h:16,height:30,color:'#2e2e2e'},
 'stehtisch':{is:'ablage',name:'Stehtisch',w:14,h:12,height:16,color:'#6b4a2f'},
 'tisch-rund':{is:'ablage',name:'Runder Tisch',w:18,h:16,height:12,color:'#7a5230'},
 'stuhl':{is:'sitz',name:'Holzstuhl',color:'#7a5230'},
 'barhocker':{is:'sitz',name:'Barhocker',w:6,h:6,color:'#5c3f28'},
 'sofa':{is:'sitz',name:'Durchgesessenes Sofa',w:40,h:16,height:14,color:'#4f5a3a'},
 'kommode':{is:'ablage',name:'Kommode',w:28,h:10,height:14,color:'#6b4a2f'},
 'kuehlschrank':{is:'moebel',name:'Kühlschrank',w:12,h:22,height:28,color:'#dfe3e0'},
 'fass':{is:'moebel',name:'Leeres Fass',w:10,h:10,height:14,color:'#9a9a94'},
 'kisten-stapel':{is:'moebel',name:'Bierkästen',w:14,h:12,height:20,color:'#3c6a3a'},
 'sackkarre':{is:'moebel',name:'Sackkarre',w:8,h:10,height:14,color:'#a8452c'},
 'schreibtisch':{is:'ablage',name:'Schreibtisch',w:40,h:14,height:16,color:'#6b4a2f'},
 'aktenschrank':{is:'moebel',name:'Aktenschrank',w:16,h:10,height:30,color:'#6f7a7e'},
 'etagenbett':{is:'moebel',name:'Etagenbett',w:34,h:20,height:30,color:'#7a5230'},
 'truhe':{is:'ablage',name:'Alte Truhe',w:14,h:10,height:10,color:'#6b4a2f'},
 'schutthaufen':{is:'moebel',name:'Schutt unter dem Dachloch',w:36,h:26,height:12,color:'#6f6558'},
 'eimer':{is:'moebel',name:'Eimer',w:6,h:6,height:6,color:'#9aa3a6'},
 'kuechenzeile':{is:'nassmoebel',name:'Küchenzeile mit Spüle',w:60,h:12,height:14,top:true,color:'#a9aea9'},
 'kloschuessel':{is:'nassmoebel',name:'Kloschüssel',w:12,h:12,height:8,color:'#eef0ee'},
 'waschbecken':{is:'nassmoebel',name:'Waschbecken',w:10,h:8,height:10,color:'#eef0ee'},
 // Tischdeko (nur auf Ablagen)
 'bierkrug':{is:'tischdeko',name:'Bierkrug',color:'#e0b45c'},
 'flasche':{is:'tischdeko',name:'Leere Flasche',w:2,h:2,height:7,color:'#3c6a3a'},
 'aschenbecher':{is:'tischdeko',name:'Aschenbecher',color:'#8d8a84'},
 'tischlampe':{is:'tischdeko',name:'Tischlampe',height:10,color:'#e0b45c',light:true},
 'bauplaene':{is:'tischdeko',name:'Baupläne',w:12,h:8,height:1,color:'#e6dcc0'},
 // Bodendeko (flach, begehbar)
 'laeufer':{is:'bodendeko',name:'Läufer',w:14,h:40,color:'#8a3a34'},
 'matratze':{is:'bodendeko',name:'Matratze mit Schlafsack',w:14,h:28,color:'#3a4a6a'},
 'becher':{is:'bodendeko',name:'Plastikbecher',w:3,h:3,color:'#d8d8d0'},
 'luftschlangen':{is:'bodendeko',name:'Luftschlangen',w:8,h:4,color:'#e0b45c'},
 'socke':{is:'bodendeko',name:'Eine Socke',w:4,h:3,color:'#eeeeee'},
 'pfuetze':{is:'bodendeko',name:'Pfütze',w:14,h:8,color:'#4a6a7a'},
 'scherben':{is:'bodendeko',name:'Scherben',w:8,h:6,color:'#5a7a5a'},
 // Draußen
 'bierbank':{is:'aussen',name:'Bierbank',w:30,h:8,height:10,color:'#8a6a48'},
 'gartenstuhl':{is:'aussen',name:'Gartenstuhl',w:8,h:8,height:12,color:'#e8e8e0'},
 'regentonne':{is:'aussen',name:'Regentonne',w:10,h:10,height:16,color:'#3a5a7a'},
 'kistenstapel-hof':{is:'aussen',name:'Leergut-Stapel',w:16,h:12,height:22,color:'#3c6a3a'},
 'fahrrad':{is:'aussen',name:'Altes Fahrrad',w:22,h:6,height:14,color:'#6a6a6a'},

 // ── Dungeon „Schloss Big B“ (Räume nach „Schild und Wirklichkeit“, docs/DUNGEON-RAEUME-2026-09-25.md). Gleiche Klassen und Regeln;
 //    gestellt werden sie über content/dungeon-scenery.js. Maße in E wie oben (die Figur ist 26 E, egal wie groß ein Meter der Karte ist).
 // Beläge
 'partykeller-fliesen':{is:'belag',name:'Partykeller-Fliesen (70er, Karo braun-orange)',color:'#9a5a30'},
 'laminat':{is:'belag',name:'Laminat Eiche hell',color:'#b08a58'},
 'teppich-buero':{is:'belag',name:'Nadelfilz-Teppichfliesen',color:'#56606a'},
 'basalt-quader':{is:'belag',name:'Basaltplatten',color:'#454a50'},
 'basalt-pflaster':{is:'belag',name:'Basaltpflaster, feucht',color:'#3e4348'},
 // Bodendeko
 'oelfleck':{is:'bodendeko',name:'Ölfleck',w:22,h:12,color:'#2a2a2c'},
 'kronkorken-gold':{is:'bodendeko',name:'Goldlackierte Kronkorken',w:12,h:8,color:'#d6a93a'},
 // Wandschmuck
 'neonroehre':{is:'wandschmuck',name:'Neonröhre',w:26,height:3,mount:17,color:'#dff2ff',light:true},
 'ahnenbild':{is:'wandschmuck',name:'Ahnenbild (Big B mit Lockenperücke)',w:10,height:12,mount:6,color:'#c8a040'},
 'ahnenbild-zopf':{is:'wandschmuck',name:'Ahnenbild (Big B mit Zopfperücke)',w:10,height:12,mount:6,color:'#c8a040'},
 'ahnenbild-toupet':{is:'wandschmuck',name:'Ahnenbild (Big B mit Toupet)',w:10,height:12,mount:6,color:'#c8a040'},
 'fackel':{is:'wandschmuck',name:'Fackel im Wandhalter',w:6,height:12,mount:6,color:'#e0a040',light:true},
 'ordnerregal':{is:'wandschmuck',name:'Wandregal mit Aktenordnern',w:24,height:10,mount:8,color:'#6a7a8a'},
 // Möbel und Kulissen
 'werkbank':{is:'ablage',name:'Werkbank mit Schraubstock',w:36,h:12,height:16,color:'#7a5a3a'},
 'reifenstapel':{is:'moebel',name:'Reifenstapel',w:14,h:14,height:18,color:'#2b2a2e'},
 'heizkessel':{is:'moebel',name:'Heizkessel mit Rohren',w:18,h:16,height:30,color:'#c9c5b8'},
 'schaukelpferd':{is:'moebel',name:'Schaukelpferd mit Hafersack',w:20,h:8,height:16,color:'#b0683a'},
 'waschmaschine':{is:'nassmoebel',name:'Waschmaschine',w:12,h:12,height:16,color:'#e8eae6'},
 'greenscreen':{is:'moebel',name:'Greenscreen auf Gestell',w:44,h:6,height:34,color:'#3fa34a'},
 'ringlicht':{is:'moebel',name:'Ringlicht auf Stativ',w:10,h:10,height:30,color:'#e8eef0',light:true},
 'palettensofa':{is:'sitz',name:'Palettensofa mit Kissen',w:36,h:14,height:12,color:'#b89868'},
 'zimmerpflanze':{is:'moebel',name:'Plastikpflanze im Topf',w:8,h:8,height:18,color:'#4a7a3a'},
 'musikbox':{is:'moebel',name:'Musikbox',w:14,h:10,height:24,color:'#b0402a',light:true},
 'weinfass':{is:'moebel',name:'Weinfass auf Lager',w:18,h:12,height:14,color:'#7a4a28'},
 'tetrapak-kiste':{is:'moebel',name:'Holzkiste mit Tetrapak-Wein',w:16,h:12,height:12,color:'#8a6a40'},
 'bierkisten-thron':{is:'sitz',name:'Thron aus Bierkisten',w:28,h:16,height:34,color:'#3c6a3a'},
 'pappkulisse':{is:'moebel',name:'Pappkulisse „Burgmauer“',w:40,h:4,height:40,color:'#b69a6c'},
 'basaltsaeule':{is:'moebel',name:'Basaltsäule',w:10,h:10,height:46,color:'#3a3f46'},
 'pappsaeule':{is:'moebel',name:'Basaltsäule mit Pappe als Marmor verkleidet',w:10,h:10,height:46,color:'#d8d0c0'},
 // Tischdeko
 'kaffeemaschine':{is:'tischdeko',name:'Kaffeemaschine',w:5,h:4,height:7,color:'#2b2a2e'},
 'faxgeraet':{is:'tischdeko',name:'Faxgerät',w:7,h:6,height:4,color:'#d8d4c8'},
 'duftstaebchen':{is:'tischdeko',name:'Duftstäbchen',w:3,h:3,height:6,color:'#8a5a9a'},
 // Eingang draußen (Burgstraße): Doppelgarage mit Pappzinnen als Gebäude-Sprite
 'garage-schloss':{is:'aussen',name:'Doppelgarage mit Pappzinnen',w:100,h:44,height:52,color:'#9a968c'}
};

/** Regeln im Klartext – Grundlage für den Prüfer (world-kit.js) und die Doku (docs/BAUKASTEN.md). */
export const KIT_RULES=[
 {id:'belag',text:'Ein Bodenbelag füllt genau einen Raum; draußen nur Beläge mit outdoor.'},
 {id:'wand',text:'Wände liegen auf Wandlinien und sperren; Türen nur in Lücken einer Wandlinie.'},
 {id:'wandschmuck',text:'Wandschmuck hängt nur an sichtbaren Wandfronten (waagerechte Wand, Raum südlich davon), innerhalb der Wand, nicht überlappend, und passt mit Aufhängehöhe plus eigener Höhe in die Wandfront.'},
 {id:'boden',text:'Möbel und Bodendeko stehen vollständig auf freiem Boden eines Raums: nicht in Wänden, nicht außerhalb.'},
 {id:'sperrt',text:'Was nicht begehbar ist, sperrt mit seiner Standfläche (Kollision und Wege); sperrende Teile überlappen sich nicht.'},
 {id:'tueren',text:'Möbel halten vor jeder Tür einen Durchgang von 20 E Tiefe frei.'},
 {id:'ablage',text:'Tischdeko steht nur auf einem Möbel mit Ablage, innerhalb seiner Fläche.'},
 {id:'draussen',text:'Teile mit outdoor nur in Außenräumen, Teile mit indoor nur drinnen.'},
 {id:'merkmale',text:'Teile mit needs nur in Räumen, die diese Merkmale tragen (z. B. nass).'},
 {id:'erreichbar',text:'Nach dem Einrichten bleiben alle Türen und Stellplätze auf echten Wegen erreichbar.'}
];
