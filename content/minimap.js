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
// Weltkarte (M), Runde 4a (2026-09-24): gleiche Symbolsprache wie die Minikarte, Namen nur im Tooltip, kombinierbarer Filter.
export const WORLD_MAP_UI={
 title:'Mertloch · Maifeld',
 filter:'Kartensymbole',filterNote:'Welche Symbole die Karte zeigt – beliebig kombinierbar.',
 toMe:'Zu mir',toMeNote:'Karte auf deinen Standort',overview:'Übersicht',overviewNote:'Ganzes Revier zeigen',
 list:'Orte',listNote:'Liste aller Orte ein- und ausklappen',zoomIn:'Näher heran',zoomOut:'Weiter weg',
 // Filtergruppen in Reihenfolge der Liste; `on` = Standard.
 groups:[
  {id:'quest',name:'Aufträge',icon:'quest',on:true},{id:'area',name:'Zielgebiete',icon:'claw',on:true},
  {id:'hub',name:'Treffpunkte',icon:'hub',on:true},{id:'camp',name:'Lager',icon:'camp',on:true},
  {id:'shop',name:'Händler',icon:'trade',on:true},{id:'trainer',name:'Berufe',icon:'trainer-werkhof',on:true},
  {id:'spawn',name:'Tiergebiete',icon:'neutral',on:false},{id:'creatures',name:'Lebewesen',icon:'enemy',on:false}
 ],
 // Seitenleiste: Gruppentrenner (Symbol + Linie, Wort im Tooltip).
 sections:{tracked:'Verfolgt',quest:'Aufträge',hub:'Treffpunkte',camp:'Lager',shop:'Händler & Berufe'},
 /** Runde 5b: Gruppenköpfe der Seitenleiste wie im WoW-Questlog – Symbol, EIN Wort, Anzahl („LAGER 11“). */
 sectionWords:{quest:'Aufträge',hub:'Treffpunkte',camp:'Lager',shop:'Händler'},
 /** Runde 5b: Ortsnamen der freien Lager (Titel aus world-layout.js setCampApproaches) für die Kartenliste. */
 campShort:{'Geplünderter Grillplatz':'Grillplatz','Beschlagnahmte Bollerboxen':'Bollerboxen-Lager','Besetzter Pfandplatz':'Pfandplatz','Horsts Ruhezone':'Horsts Ruhezone'},
 walk:'Hinlaufen',walkNote:'Läuft los und schließt die Karte',
 you:'Dein Standort',tracked:'Verfolgtes Ziel',cluster:n=>n+' Orte hier',clusterNote:'Klick zoomt hinein',
 area:'Zielgebiet',areaActive:'Verfolgtes Zielgebiet',spawnArea:'Tiergebiet',progress:(d,n)=>d+'/'+n,
 camp:'Gegnerlager',hub:'Geschützter Treffpunkt',meters:m=>m+' m',
 click:'Route zeigen',shiftClick:'hinlaufen',tapWalk:'Hinlaufen',
 osm:'© OpenStreetMap',osmNote:'Kartendaten © OpenStreetMap-Mitwirkende, ODbL'
};
