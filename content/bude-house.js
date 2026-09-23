// Die Bude als begehbares Haus im Echtmaßstab (E-52): 14,4 Welteinheiten je Meter, die 26-E-Figur ist 1,80 m.
// Alle Maße in Welteinheiten, lokal ab der Nordwest-Ecke des Hauses (x nach Osten, y nach Süden).
// Der Hof liegt östlich neben dem Haus – hinter dem Haus (Norden) verdeckt ihn das Dach.
export const BUDE_HOUSE={
 id:'bude',metersPerUnit:1/14.4,
 width:230,depth:173,yard:{width:60},
 // Außenansicht: zwei Geschosse (2 × 2,8 m) und Satteldach; innen werden die Wände auf Hüfthöhe geschnitten.
 heights:{wall:81,roof:50,cut:14},
 thickness:{outer:8,inner:6},
 // Wandlinien; Türöffnungen sind die Lücken dazwischen (je 34 E breit, damit Wege mit Abstand 9 hindurchpassen).
 walls:[
  {kind:'outer',x1:0,y1:0,x2:230,y2:0},
  {kind:'outer',x1:0,y1:0,x2:0,y2:173},
  {kind:'outer',x1:230,y1:0,x2:230,y2:124},{kind:'outer',x1:230,y1:158,x2:230,y2:173},
  {kind:'outer',x1:0,y1:173,x2:95,y2:173},{kind:'outer',x1:129,y1:173,x2:230,y2:173},
  {kind:'inner',x1:0,y1:72,x2:30,y2:72},{kind:'inner',x1:64,y1:72,x2:104,y2:72},{kind:'inner',x1:138,y1:72,x2:152,y2:72},{kind:'inner',x1:186,y1:72,x2:230,y2:72},
  {kind:'inner',x1:92,y1:0,x2:92,y2:72},{kind:'inner',x1:150,y1:0,x2:150,y2:72},
  {kind:'inner',x1:186,y1:72,x2:186,y2:118},
  {kind:'inner',x1:186,y1:118,x2:189,y2:118},{kind:'inner',x1:223,y1:118,x2:230,y2:118}
 ],
 doors:[
  {id:'eingang',name:'Eingang',x:112,y:173,outside:{x:112,y:196}},
  {id:'hof',name:'Tür zum Hof',x:230,y:141,outside:{x:252,y:141}},
  {id:'hinterzimmer',name:'Hinterzimmer',x:47,y:72},
  {id:'pfandlager',name:'Pfandlager',x:121,y:72},
  {id:'kueche',name:'Küche',x:169,y:72},
  {id:'klo',name:'Klo',x:206,y:118}
 ],
 // Räume als Bodenflächen; der Schankraum ist ein L (zwei Rechtecke).
 rooms:[
  {id:'schankraum',name:'Schankraum',floor:'dielen',rects:[{x:0,y:72,w:186,h:101},{x:186,y:118,w:44,h:55}]},
  {id:'hinterzimmer',name:'Clan-Hinterzimmer',floor:'teppich',rects:[{x:0,y:0,w:92,h:72}]},
  {id:'pfandlager',name:'Pfandlager',floor:'estrich',rects:[{x:92,y:0,w:58,h:72}]},
  {id:'kueche',name:'Küche',floor:'fliesen',rects:[{x:150,y:0,w:80,h:72}]},
  {id:'klo',name:'Klo',floor:'fliesen',rects:[{x:186,y:72,w:44,h:46}]},
  {id:'hof',name:'Hof',floor:'hof',outdoor:true,rects:[{x:230,y:0,w:60,h:173}]}
 ],
 // Bauplätze der sechs Basisbau-Gebäude (content/buildings.js) in ihren Räumen.
 slots:{tresen:{x:127,y:94},anlage:{x:30,y:98},landhausecke:{x:40,y:34},pfandlager:{x:121,y:32},grill:{x:258,y:35},werkstatt:{x:260,y:95}},
 // Schild „Baustelle der Bude“ links neben dem Eingang, vor der Fassade.
 sign:{x:60,y:188},
 // Start in der Bude: Aufwachen im Schankraum, Ida am Eingang, die Mentoren in ihren Räumen (IDs aus content/npcs.js),
 // Hofprobe: Laufmarke im Schankraum, Papp-Horst im Hof.
 spots:{wake:{x:60,y:140},ida:{x:112,y:158},dieter:{x:166,y:92},baerbel:{x:62,y:52},kevin:{x:200,y:50},course:{x:170,y:138},dummy:{x:264,y:148}}
};
export const BUDE_HOUSE_TEXT={inside:'Die Bude',outside:'Die Bude · Poo-Tang-Clan'};
