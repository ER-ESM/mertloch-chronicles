// Feste Stammdaten der Welt-Kulissen: Arten, Kapitel-Zuordnung und Platzierungsregeln. Bewusst ohne Importe,
// damit auch die Inhaltsprüfung (content/checks/welt.js) sie ohne den ganzen Weltgenerator lesen kann.
/** Feste Liste aller Kulissen-Arten: Anzeigename, Grundfläche (w × h in Welteinheiten), Zeichenhöhe und Fallback-Farbe,
 * solange es keine Grafik gibt (docs/GRAFIK-BEDARF.md). `blocking` bedeutet: echter Kollisionskörper in der Welt. */
export const PROP_KINDS=Object.freeze({
 // Kapitel 2 · Sperrmüllplatz
 schrotthaufen:{name:'Schrotthaufen',w:56,h:40,height:34,blocking:true,color:'#7d7a72'},
 haenger:{name:'Sigis Hänger',w:46,h:26,height:20,blocking:false,color:'#8c5a44'},
 kuehlschrank:{name:'Kühlschrank ohne Tür',w:16,h:13,height:22,blocking:false,color:'#d7d2c2'},
 // Kapitel 3 · Festplatz mit zerlegter Kegelbahn
 kegelbahn:{name:'Kegelbahn-Trümmer',w:62,h:18,height:11,blocking:false,color:'#c8a469'},
 bierbank:{name:'Umgestürzte Bierbank',w:44,h:12,height:12,blocking:false,color:'#b88a4f'},
 kegelkugel:{name:'Kegelkugel',w:9,h:9,height:9,blocking:false,color:'#3b3540'},
 // Kapitel 4 · Bus im Feld
 bus:{name:'Bus mit Girlanden',w:104,h:30,height:44,blocking:true,color:'#d8c04e'},
 bierkasten:{name:'Leerer Bierkasten',w:14,h:11,height:12,blocking:false,color:'#9c5c39'},
 bierbong:{name:'Bierbong-Trichter',w:12,h:12,height:16,blocking:false,color:'#5f8f6a'},
 // Dorfkern · Kalles Kiosk an der Kreuzung (world.places.kiosk)
 kiosk:{name:'Kalles Kiosk',w:52,h:34,height:40,blocking:true,color:'#9d5f4a'},
 stehtisch:{name:'Stehtisch vorm Kiosk',w:16,h:16,height:20,blocking:false,color:'#b9a27f'},
 'wett-tafel':{name:'Wett-Tafel · Quote gut, Ende schlecht',w:26,h:9,height:26,blocking:false,color:'#3f4a3d'},
 // Bude: Trümmer und die sechs Basisbau-Gebäude (Maße gelten für die höchste Stufe, siehe stageProps)
 'bude-truemmer':{name:'Trümmer der Bude',w:34,h:22,height:12,blocking:false,color:'#6f6558'},
 'bude-tresen':{name:'Der Tresen',w:54,h:20,height:20,blocking:false,color:'#a97c4c'},
 'bude-grill':{name:'Oskars Grill',w:32,h:22,height:24,blocking:false,color:'#6d6a66'},
 'bude-werkstatt':{name:'Kevins Werkstatt',w:40,h:26,height:26,blocking:false,color:'#8a9298'},
 'bude-anlage':{name:'Leanders Anlage',w:34,h:30,height:30,blocking:false,color:'#4d4757'},
 'bude-landhausecke':{name:'Annis Landhaus-Ecke',w:46,h:28,height:22,blocking:false,color:'#c9a8b4'},
 'bude-pfandlager':{name:'Idas Pfandlager',w:44,h:26,height:28,blocking:false,color:'#7f9a6d'}
});
export const PROP_KIND_IDS=Object.freeze(Object.keys(PROP_KINDS));
/** Kulisse je Akt-1-Kapitel. Die große Signatur-Kulisse steht am Bosslager, die Kleinteile auch am Mob-Lager. */
export const CHAPTER_PROPS=Object.freeze({
 2:{place:'Sperrmüllplatz',boss:['schrotthaufen','haenger','kuehlschrank','kuehlschrank'],mob:['haenger','kuehlschrank']},
 3:{place:'Festplatz mit zerlegter Kegelbahn',boss:['kegelbahn','bierbank','bierbank','kegelkugel','kegelkugel'],mob:['bierbank','kegelkugel']},
 4:{place:'Bus im Feld am Ortsausgang',boss:['bus','bierkasten','bierkasten','bierbong'],mob:['bierkasten','bierbong']}
});
export const PROP_RULES=Object.freeze({
 campSalt:0x9B17,baseSalt:0x4D0B,
 roadMargin:10,      // zusätzlicher Abstand zur Fahrbahn/zum Weg
 approachMargin:34,  // Abstand zum Anlaufpunkt des Lagers
 corridorMargin:24,  // freier Korridor Anlaufpunkt → Lagermitte (Hauptweg ins Lager)
 spawnMargin:20,gatherMargin:16,questMargin:44,propGap:10,
 nodeMargin:{blocking:18,loose:8}, // Abstand zum begehbaren Wegenetz
 ring:{min:52,max:142,tries:150},
 kiosk:{w:86,h:64,minDistance:220,maxDistance:2600,plazaGap:40,hubGap:40,baseGap:30,questGap:60,
  junctionTolerance:14,junctionGrid:30,minRoadWidth:42,distances:Object.freeze([70,84,98,112,126]),angles:24,approach:30,
  props:Object.freeze({counter:12,front:16,side:22})},
 base:{w:156,h:110,minDistance:150,maxDistance:700,step:14,angles:36,slotX:50,slotY:30,approach:32,rubble:.55}
});
