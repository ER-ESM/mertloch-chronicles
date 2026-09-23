// Minikarte rechts oben (Vorbild: WoW-Minimap): Maße, Zoomstufen, Symbolgruppen und alle Texte. Gezeichnet wird in minimap.js.
export const MINIMAP={
 // Sichtweite in Weltpixeln quer über die Karte, von weit nach nah. Stufe 2 entspricht der alten Umgebungskarte.
 zoomSpans:[2600,1700,1050,680,440],defaultZoom:2,
 // Außenmaß des Rings in CSS-Pixeln; die Karte füllt `disc` davon (rund) bzw. `discSquare` (eckig).
 sizes:{s:136,m:164,l:208},disc:.74,discSquare:.84,
 // Zeichentakt der Symbole (ms) und Umfang des Grundkarten-Zwischenspeichers als Vielfaches der Sichtweite.
 frameMs:33,cacheSpan:3,
 // Bäume erst ab dieser Zoomstufe in die Grundkarte (weit weg wären es nur Krümel).
 treesFromZoom:2,
 // Gegner nur im Umkreis (Weltpixel) um den Helden, damit die Karte nicht zuläuft.
 creatureRange:520,neutralRange:150,
 // Trefferradius für Mouse-Over in CSS-Pixeln.
 hitRadius:3,
 // Symbolgröße je Zoomstufe (weit weg kleiner, damit das Dorf nicht zuläuft).
 iconScale:[.72,.84,1,1,1],
 // Wie schnell die Blickrichtung beim Drehen nachzieht (Anteil je Bild).
 turnEase:.18,
 // Kartenmaßstab unten links (Meter).
 scaleMeters:[100,50,50,20,20]
};
export const MINIMAP_GROUPS=['quest','trade','trainer','places','nodes','people','enemies','route'];
export const MINIMAP_UI={
 label:'Minikarte',openMap:'Weltkarte öffnen',openMapKey:'M',walkHint:'Umschalt + Klick: hinlaufen',
 zoomIn:'Näher heran',zoomOut:'Weiter weg',zoomLevel:n=>'Zoom '+n+'/5',wheel:'Mausrad zoomt',
 tracking:'Kartensymbole',options:'Kartenoptionen',north:'N',northTip:'Norden',
 groups:{
  quest:'Aufträge',trade:'Händler',trainer:'Lehrer & Werkstätten',places:'Orte & Dienste',
  nodes:'Fundstellen',people:'Mitspieler & Gruppe',enemies:'Gegner & Lager',route:'Laufweg'
 },
 shape:'Form',round:'Rund',square:'Eckig',size:'Größe',sizes:{s:'Klein',m:'Mittel',l:'Groß'},
 rotate:'Mit Blickrichtung drehen',clock:'Uhrzeit',zone:'Ortsname',reset:'Zurücksetzen',
 // Art hinter dem Namen im Tooltip.
 kinds:{
  destination:'Auftragsziel',waypoint:'Wegmarke',questGiver:'Auftrag verfügbar',questLow:'Auftrag (niedrige Stufe)',questReady:'Auftrag abgeben',
  area:'Auftragsgebiet',trader:'Händler',trainer:'Lehrer & Werkstatt',stable:'Fahrstall',base:'Deine Bude',hub:'Geschützter Treffpunkt',
  dungeon:'Verlies',campBusy:'Besetztes Lager',campFree:'Lager freigeräumt',player:'Mitspieler',party:'Gruppe',companion:'Begleiter',
  enemy:'Gegner',elite:'Elite',boss:'Weltboss',node:'Fundstelle'
 },
 level:n=>'Stufe '+n,levels:(a,b)=>'Stufe '+a+'–'+b,quests:n=>n+(n===1?' Auftrag':' Aufträge'),
 nodeLine:(prof,req)=>prof+' '+req,nodeSpent:'Gerade leer · wächst nach',teaches:list=>'Lehrt '+list
};
