// Die Bude als begehbares Haus im Echtmaßstab (E-52), eingerichtet aus dem Sprite-Baukasten (E-54, content/sprite-kit.js).
// 14,4 Welteinheiten je Meter, die 26-E-Figur ist 1,80 m. Alle Maße lokal ab der Nordwest-Ecke des Hauses (x nach Osten, y nach Süden).
// Der Hof (7 m) liegt östlich neben dem Haus – hinter dem Haus (Norden) verdeckt ihn das Dach. Zaun im Norden und Osten mit Tor.
// Zwei Geschosse wie die Fassade: Erdgeschoss (die Felder auf oberster Ebene) und `upper` (Obergeschoss über die Treppe).
//
// Einrichtung: `items` = Platzierungen {s: Sprite-Art, x, y} (Mitte der Standfläche). Größe, Höhe, Sperrwirkung und Regeln
// erbt jedes Teil aus seiner Art; world-kit.js prüft die Regeln (Wandschmuck nur an Wandfronten, Möbel frei von Türen …).
export const BUDE_HOUSE={
 id:'bude',metersPerUnit:1/14.4,
 width:230,depth:173,yard:{width:100},
 // Außenansicht: zwei Geschosse (2 × 2,8 m) und Satteldach. Innen zeigen waagerechte Wände ihre Front bis 22 E (1,5 m) –
 // Platz für Wandschmuck –, die südliche Außenwand nur einen Sockel (front), damit man in die Räume sieht; senkrechte Wände nur ihre Krone.
 heights:{wall:81,roof:50,cut:22,front:8},
 thickness:{outer:8,inner:6,zaun:4},
 // Wand-Arten je Wandtyp und Tür-Arten je Tür (Sprite-Baukasten).
 wallStyle:{outer:'wand-aussen',inner:'wand-putz',zaun:'zaun-latten'},
 // Wandlinien; Türöffnungen sind die Lücken dazwischen (je 34 E breit, damit Wege mit Abstand 9 hindurchpassen).
 walls:[
  {kind:'outer',x1:0,y1:0,x2:230,y2:0},
  {kind:'outer',x1:0,y1:0,x2:0,y2:173},
  {kind:'outer',x1:230,y1:0,x2:230,y2:124},{kind:'outer',x1:230,y1:158,x2:230,y2:173},
  {kind:'outer',x1:0,y1:173,x2:95,y2:173},{kind:'outer',x1:129,y1:173,x2:230,y2:173},
  {kind:'inner',x1:0,y1:72,x2:30,y2:72},{kind:'inner',x1:64,y1:72,x2:104,y2:72},{kind:'inner',x1:138,y1:72,x2:152,y2:72},{kind:'inner',x1:186,y1:72,x2:230,y2:72},
  {kind:'inner',x1:92,y1:0,x2:92,y2:72},{kind:'inner',x1:150,y1:0,x2:150,y2:72},
  {kind:'inner',x1:186,y1:72,x2:186,y2:118},
  {kind:'inner',x1:186,y1:118,x2:189,y2:118},{kind:'inner',x1:223,y1:118,x2:230,y2:118},
  // Hofzaun: Norden durchgehend, Osten mit einem 34 E breiten Tor; nach Süden ist der Hof offen.
  {kind:'zaun',x1:234,y1:2,x2:330,y2:2},{kind:'zaun',x1:328,y1:2,x2:328,y2:70},{kind:'zaun',x1:328,y1:104,x2:328,y2:173}
 ],
 doors:[
  {id:'eingang',name:'Eingang',s:'tuer-eingang',x:112,y:173,outside:{x:112,y:196}},
  {id:'hof',name:'Tür zum Hof',s:'tuer-holz',x:230,y:141,outside:{x:252,y:141}},
  {id:'hinterzimmer',name:'Hinterzimmer',s:'tuer-holz',x:47,y:72},
  {id:'pfandlager',name:'Pfandlager',s:'tuer-holz',x:121,y:72},
  {id:'kueche',name:'Küche',s:'tuer-holz',x:169,y:72},
  {id:'klo',name:'Klo',s:'tuer-holz',x:206,y:118},
  {id:'hoftor',name:'Hoftor',s:'tor-hof',x:328,y:87}
 ],
 // Räume als Bodenflächen mit Belag (Sprite-Art) und Merkmalen; der Schankraum ist ein L (zwei Rechtecke).
 rooms:[
  {id:'schankraum',name:'Schankraum',belag:'dielen-dunkel',rects:[{x:0,y:72,w:186,h:101},{x:186,y:118,w:44,h:55}]},
  {id:'hinterzimmer',name:'Clan-Hinterzimmer',belag:'teppichboden-rot',rects:[{x:0,y:0,w:92,h:72}]},
  {id:'pfandlager',name:'Pfandlager',belag:'estrich',rects:[{x:92,y:0,w:58,h:72}]},
  {id:'kueche',name:'Küche',belag:'fliesen-weiss',tags:['nass'],rects:[{x:150,y:0,w:80,h:72}]},
  {id:'klo',name:'Klo',belag:'fliesen-weiss',tags:['nass'],rects:[{x:186,y:72,w:44,h:46}]},
  {id:'hof',name:'Hof',belag:'kies-hof',outdoor:true,rects:[{x:230,y:0,w:100,h:173}]}
 ],
 // Einrichtung des Erdgeschosses (Sprite-Baukasten).
 items:[
  // Schankraum
  {s:'kanonenofen',x:74,y:58},{s:'bild-landschaft',x:15,y:75},{s:'flaschenbord',x:84,y:75},{s:'dartscheibe',x:145,y:75},
  {s:'stehtisch',x:107,y:128},{s:'bierkrug',x:104,y:128},{s:'flasche',x:110,y:126},
  {s:'tisch-rund',x:156,y:110},{s:'aschenbecher',x:156,y:109},{s:'stuhl',x:141,y:110},{s:'stuhl',x:156,y:124},
  {s:'barhocker',x:70,y:118},{s:'barhocker',x:90,y:118},{s:'kisten-stapel',x:200,y:163},
  {s:'laeufer',x:112,y:150},{s:'becher',x:40,y:132},{s:'becher',x:122,y:98},{s:'luftschlangen',x:60,y:118},{s:'socke',x:140,y:160},{s:'scherben',x:170,y:98},
  // Der Morgen danach (Akt 1 „Filmriss“): Spuren der Nacht auf dem freien Dielenboden, ein Fass und verrückte Stühle.
  {s:'fass',x:176,y:100},{s:'stuhl',x:14,y:96},
  {s:'pfuetze',x:134,y:122},{s:'becher',x:88,y:140},{s:'becher',x:171,y:122},{s:'becher',x:30,y:112},{s:'luftschlangen',x:128,y:162},{s:'scherben',x:52,y:126},{s:'luftschlangen',x:204,y:150},
  // Clan-Hinterzimmer
  {s:'bild-landschaft',x:20,y:4},{s:'geweih',x:46,y:4},{s:'kommode',x:74,y:9},{s:'tischlampe',x:80,y:9},{s:'becher',x:60,y:40},{s:'socke',x:18,y:58},
  // Pfandlager
  {s:'regalbrett',x:121,y:4},{s:'sackkarre',x:100,y:62},{s:'eimer',x:144,y:64},
  // Küche
  {s:'kuechenzeile',x:184,y:10},{s:'flasche',x:170,y:9},{s:'kuehlschrank',x:220,y:29},{s:'fass',x:218,y:58},{s:'wandlampe',x:160,y:4},{s:'pfuetze',x:175,y:45},{s:'scherben',x:210,y:58},
  // Klo
  {s:'kloschuessel',x:218,y:86},{s:'waschbecken',x:195,y:80},{s:'spiegel',x:195,y:75},
  // Hof
  {s:'regentonne',x:240,y:10},{s:'kistenstapel-hof',x:315,y:20},{s:'fahrrad',x:245,y:80},{s:'bierbank',x:300,y:164},{s:'gartenstuhl',x:318,y:132},
  {s:'pfuetze',x:270,y:120},{s:'becher',x:310,y:60}
 ],
 // Treppe ins Obergeschoss an der Westwand des Schankraums, nach Norden steigend (die Wand liegt daneben und verdeckt nichts):
 // unten der Treppenfuß östlich des Antritts, oben der Absatz im Matratzenlager.
 // rise = Hub des Helden auf der obersten Stufe (E), topStep = Tiefe der obersten Stufe, ab der ins Obergeschoss umgeschaltet wird.
 stairs:{x:4,y:104,w:18,h:52,foot:{x:36,y:148},arrive:{x:36,y:112},range:22,rise:15,topStep:8},
 // Bauplätze der sechs Basisbau-Gebäude (content/buildings.js) in ihren Räumen.
 slots:{tresen:{x:84,y:100},anlage:{x:150,y:150},landhausecke:{x:40,y:34},pfandlager:{x:121,y:32},grill:{x:262,y:36},werkstatt:{x:298,y:104}},
 // Schild „Baustelle der Bude“ links neben dem Eingang, vor der Fassade.
 sign:{x:60,y:188},
 // Start in der Bude: Aufwachen im Schankraum, Ida am Eingang, die Stammgäste an ihren Plätzen (IDs aus content/npcs.js, E-61):
 // Olli am Tresen-Bauplatz, Nyalol im Hinterzimmer, Ron im Hof bei der Werkstatt.
 // Hofprobe: Laufmarke im Schankraum, Papp-Horst im Hof.
 spots:{wake:{x:62,y:150},ida:{x:80,y:160},olli:{x:120,y:98},nyalol:{x:62,y:34},ron:{x:262,y:104},course:{x:170,y:136},dummy:{x:280,y:146}},
 // Obergeschoss: gleiche Außenmauern, eigene Räume. Das Dachloch der Außenansicht liegt über dem Dachboden.
 upper:{
  walls:[
   {kind:'outer',x1:0,y1:0,x2:230,y2:0},{kind:'outer',x1:0,y1:0,x2:0,y2:173},
   {kind:'outer',x1:230,y1:0,x2:230,y2:173},{kind:'outer',x1:0,y1:173,x2:230,y2:173},
   {kind:'inner',x1:0,y1:90,x2:40,y2:90},{kind:'inner',x1:74,y1:90,x2:100,y2:90},
   {kind:'inner',x1:100,y1:0,x2:100,y2:30},{kind:'inner',x1:100,y1:64,x2:100,y2:110},
   {kind:'inner',x1:100,y1:110,x2:170,y2:110},{kind:'inner',x1:204,y1:110,x2:230,y2:110},
   {kind:'inner',x1:130,y1:110,x2:130,y2:125},{kind:'inner',x1:130,y1:159,x2:130,y2:173}
  ],
  doors:[
   {id:'baubuero',name:'Idas Baubüro',s:'tuer-holz',x:57,y:90},{id:'dachboden',name:'Dachboden',s:'tuer-holz',x:100,y:47},
   {id:'flur-dachboden',name:'Dachboden',s:'tuer-holz',x:187,y:110},{id:'flur-lager',name:'Matratzenlager',s:'tuer-holz',x:130,y:142}
  ],
  rooms:[
   {id:'flur',name:'Flur',belag:'dielen-hell',rects:[{x:130,y:110,w:100,h:63}]},
   {id:'matratzenlager',name:'Matratzenlager',belag:'dielen-hell',rects:[{x:0,y:90,w:100,h:83},{x:100,y:110,w:30,h:63}]},
   {id:'baubuero',name:'Idas Baubüro',belag:'teppichboden-rot',rects:[{x:0,y:0,w:100,h:90}]},
   {id:'dachboden',name:'Dachboden',belag:'bretter-grau',rects:[{x:100,y:0,w:130,h:110}]}
  ],
  items:[
   // Idas Baubüro
   {s:'bauplan-tafel',x:40,y:4},{s:'plakat',x:70,y:4},{s:'schreibtisch',x:40,y:13},{s:'bauplaene',x:34,y:13},{s:'tischlampe',x:54,y:12},
   {s:'stuhl',x:40,y:26},{s:'aktenschrank',x:88,y:9},
   // Dachboden unter dem Dachloch
   {s:'schutthaufen',x:168,y:53},{s:'eimer',x:192,y:50},{s:'truhe',x:117,y:11},{s:'truhe',x:136,y:11},{s:'fass',x:215,y:20},{s:'kisten-stapel',x:218,y:95},{s:'pfuetze',x:175,y:78},{s:'scherben',x:140,y:70},
   // Matratzenlager
   {s:'wimpelkette',x:20,y:93},{s:'hakenleiste',x:87,y:93},{s:'etagenbett',x:77,y:158},{s:'matratze',x:45,y:136},{s:'matratze',x:115,y:140},{s:'socke',x:30,y:162},
   // Flur
   {s:'bild-landschaft',x:150,y:113},{s:'wandlampe',x:215,y:113},{s:'laeufer',x:185,y:150,w:50,h:12}
  ],
  // Treppenloch mit Geländer; oben kommt man östlich davon an.
  // access = Zugang im Nordosten (E ab der Nordkante), durch den man von Osten auf die oberen Stufen tritt.
  stairs:{x:4,y:104,w:18,h:52,landing:{x:30,y:110},range:22,access:22}
 }
};
export const BUDE_HOUSE_TEXT={inside:'Die Bude',outside:'Die Bude · Poo-Tang-Clan',up:'Treppe hoch',down:'Treppe runter',upper:'Obergeschoss',ground:'Erdgeschoss'};
