// Ausstattung der Dungeon-Räume (Darstellung, keine Spiellogik): Boden, Wandfront, Masse um den Grundriss und Requisiten je Raum
// nach „Schild und Wirklichkeit“ (Plan docs/DUNGEON-SCHLOSS-BIG-B-2026-09-23.md Abschnitt 2, Bericht docs/DUNGEON-RAEUME-2026-09-25.md).
// Grundriss, Türen und Kollision bleiben in content/dungeons.js; Requisiten sperren nichts (dungeon-scenery.js prüft, dass sie
// Laufwege, Arenen, Packs, Übergänge und den Truhenplatz freilassen). Zeichnung: dungeon-scenery-art.js.
//
// Felder je Ebene:
//  mass   Stoff der Leere um den Grundriss (von oben): mauerwerk · erdreich · basalt
//  crown  Farbe der Mauerkrone (Oberkante aller Wände der Ebene)
// Felder je Raum:
//  belag  Bodenbelag aus dem Sprite-Baukasten (content/sprite-kit.js, Klasse belag)
//  wall   Wandfront der Nordwand (Maler in dungeon-scenery-art.js); face = höchste Front in E (Standard 22, Regel E-54)
//  props  Requisiten [Art, x, y] in Metern der Ebene (Mitte der Standfläche) – Möbel, Bodendeko, Tischdeko (auf einer Ablage)
//  decor  Wandschmuck [Art, x] an der Nordwand des Raums (hängt auf der Wandfront, nur wo sie hoch genug ist)
//  lines  eingebaute Zeichnung: stellplatz (Garage) · rinnen (Kelterhalle) · sprinkler (Weinkeller)
// Maße der Requisiten kommen aus dem Baukasten in Welteinheiten (E); die Karte hat 8 E je Meter, die Figur ist 26 E hoch.
export const DUNGEON_SCENERY={
 'schloss-bigb':{
  floors:{
   e0:{mass:'mauerwerk',crown:'#8e897d'},
   k1:{mass:'erdreich',crown:'#d6c7a4'},
   k2:{mass:'basalt',crown:'#5b6168'}
  },
  rooms:{
   // ── Erdgeschoss: Doppelgarage mit Anbau, Kellertreppe und Carport-Dach
   hof:{belag:'estrich',wall:'garage',lines:['stellplatz'],
    props:[['werkbank',27,20.85],['reifenstapel',33.4,21],['kisten-stapel',35.6,20.9],['sackkarre',37.4,21.05],['fahrrad',38.8,37.45],['eimer',17,37.4],['oelfleck',25.5,31],['oelfleck',37,32]],
    decor:[['neonroehre',22],['neonroehre',31],['neonroehre',40]]},
   zugbruecke:{belag:'bretter-grau',wall:'treppenhaus',
    props:[['stehtisch',10.6,20.9],['kisten-stapel',13.9,37.15],['eimer',3.2,37.4],['becher',11.5,34.2],['becher',5.8,33.4]],
    decor:[['neonroehre',9.5],['hakenleiste',12.6]]},
   verwaltung:{belag:'teppich-buero',wall:'buero',
    props:[['aktenschrank',49.2,20.7],['schreibtisch',58.6,20.95],['kaffeemaschine',57.1,20.8],['faxgeraet',59.3,20.85],['tischlampe',60.6,20.8],['stuhl',58.6,22.7],['zimmerpflanze',61.3,37.3]],
    decor:[['ordnerregal',53]]},
   wehrgang:{belag:'kies-hof',wall:'bruestung',face:12,
    props:[['regentonne',17.1,6.9],['gartenstuhl',44.8,7],['eimer',29,15.3],['kistenstapel-hof',35.8,15.1]]},
   // ── Keller 1: Partykeller mit Ringflur, Heizungskeller, Waschküche, Studio, Musterwohnung
   galerie:{belag:'teppichboden-rot',wall:'damast',
    decor:[['ahnenbild',9.3],['ahnenbild-zopf',11.5],['ahnenbild-toupet',13.7],['ahnenbild',15.9],['ahnenbild-zopf',18.1],['ahnenbild-toupet',20.3],
     ['ahnenbild',36],['ahnenbild-zopf',39.4],['ahnenbild-toupet',42.8],['ahnenbild',46.2],['ahnenbild-zopf',49.6],['ahnenbild-toupet',53],['wandlampe',12.6],['wandlampe',17],['wandlampe',37.7],['wandlampe',44.5],['wandlampe',51.3]]},
   rittersaal:{belag:'partykeller-fliesen',wall:'party',garlands:[[14,14.5,50,14.5],[14,29.5,50,29.5]],
    props:[['musikbox',15.2,11.75],['fass',46.4,11.8],['kisten-stapel',48.9,11.9],['sofa',44.6,31.9],['bierbank',21,32.4],['stehtisch',38.6,31.95],['bierkrug',38.3,31.9],
     ['luftschlangen',25,20],['luftschlangen',38,23.5],['luftschlangen',27.5,29]]},
   stall:{belag:'estrich',wall:'ziegel',
    props:[['heizkessel',32.7,1.15],['schaukelpferd',23.3,0.7],['eimer',33.4,4.3]],
    decor:[['regalbrett',28.2]]},
   verlies:{belag:'fliesen-weiss',wall:'waschkueche',
    props:[['waschmaschine',1,16.9],['waschbecken',4.2,16.6],['eimer',0.6,27.3],['pfuetze',2.4,25.2]],
    decor:[['hakenleiste',5.9]]},
   studio:{belag:'dielen-hell',wall:'studio',
    props:[['greenscreen',60.8,12.45],['ringlicht',58.3,14],['palettensofa',60.7,25.1],['zimmerpflanze',63.4,14.5]]},
   musterwohnung:{belag:'laminat',wall:'muster',
    props:[['sofa',24.6,40.1],['kommode',39.4,39.75],['duftstaebchen',38.6,39.7],['tischlampe',40.4,39.7],['tisch-rund',23.4,46.4],['zimmerpflanze',42.3,47.3],['laeufer',32,44]]},
   // ── Keller 2: der echte Basaltkeller, Gewölbe, Kelterhalle, Basaltdom mit Pappe, Abstellraum
   weinkeller:{belag:'basalt-quader',wall:'basalt',lines:['sprinkler'],
    props:[['weinfass',17.6,4.85],['weinfass',20.6,4.85],['weinfass',29.4,4.85],['kisten-stapel',31.9,5.05],['tetrapak-kiste',20,17.2],['tetrapak-kiste',28.8,17.2]],
    decor:[['fackel',11],['fackel',24.5]]},
   gewoelbe:{belag:'basalt-pflaster',wall:'basalt-feucht',
    props:[['pfuetze',38,16],['pfuetze',7.2,33],['pfuetze',28,42.4],['weinfass',40.8,36.5],['tetrapak-kiste',5.1,36],['kisten-stapel',13.2,43.1]],
    decor:[['fackel',38],['fackel',17],['fackel',29.5]]},
   kelterhalle:{belag:'basalt-quader',wall:'basalt',lines:['rinnen'],
    props:[['weinfass',16.3,20.85],['weinfass',19.3,20.85],['weinfass',26.9,20.85],['weinfass',29.9,20.85],['tetrapak-kiste',15.3,35.1],['eimer',31.3,35.4]]},
   thronsaal:{belag:'basalt-quader',wall:'pappe',
    props:[['bierkisten-thron',54,5.1],['pappkulisse',48.8,4.35],['pappkulisse',59.2,4.35],['laeufer',54,9.2],['laeufer',54,14.2],['laeufer',54,19.2],['kisten-stapel',47.2,35.1],
     ['pappsaeule',46.75,9],['basaltsaeule',46.75,16],['pappsaeule',46.75,31.6],['pappsaeule',61.25,9],['pappsaeule',61.25,16],['basaltsaeule',61.25,23],['pappsaeule',61.25,30]],
    decor:[['fackel',51.6],['fackel',56.4]]},
   schatz:{belag:'bretter-staubig',wall:'beton',
    props:[['kisten-stapel',49.1,38.9],['tetrapak-kiste',59,39],['kronkorken-gold',50.6,44.4],['kronkorken-gold',50.4,41.6],['eimer',48.7,45.3]]}
  },
  // Freiräume, die Requisiten meiden (Meter): Truhe und Hinterausgang der Schatzkammer (Etappe 3 stellt sie hin).
  keepFree:[{floor:'k2',x:54,y:41.2,r:2.6},{floor:'k2',x:58,y:44,r:2}],
  // Eingang draußen: Doppelgarage als Gebäude-Sprite; das rechte (halb offene) Tor liegt am Eingangspunkt.
  garage:{sprite:'garage-schloss',dx:-24,clearTrees:true}
 }
};
