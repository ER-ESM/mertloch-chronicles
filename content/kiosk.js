// Separate shop interior. Coordinates belong only to this instance, never the village.
export const KIOSK_ROOM={
 id:'kiosk',width:360,height:280,spawn:{x:180,y:212},exit:{x:180,y:252},
 service:{x:190,y:142},keeper:{x:190,y:84},range:34,
 // Ground footprints, not the full standing sprite. The renderer shares these anchors.
 furniture:[
  {kind:'shelf',art:'bude-pfandlager',x:99,y:30,w:68,h:28},
  {kind:'shelf',art:'bude-pfandlager',x:205,y:30,w:68,h:28},
  {kind:'fridge',art:'kuehlschrank',x:30,y:54,w:30,h:24},
  {kind:'fridge',art:'kuehlschrank',x:30,y:117,w:30,h:24},
  {kind:'shelf',art:'bude-pfandlager',x:284,y:61,w:48,h:27},
  {kind:'fridge',art:'kuehlschrank',x:300,y:127,w:30,h:24},
  {kind:'counter',art:'bude-tresen',x:129,y:104,w:122,h:24},
  {kind:'crates',art:'bierkasten',x:30,y:190,w:24,h:19},
  {kind:'crates',art:'bierkasten',x:54,y:207,w:22,h:18},
  {kind:'seating',art:'bude-landhausecke',x:286,y:218,w:46,h:27},
  {kind:'board',art:'wett-tafel',x:34,y:171,w:27,h:9}
 ]
};
export const KIOSK_TEXT={enter:'Kiosk betreten',leave:'Zurück ins Dorf',inside:'Kalles Kiosk',zone:'Innenraum · Dorfladen',counter:'Verkaufstheke',exit:'Ausgang',sign:'KALLES KIOSK',welcome:'Willkommen bei Kalle. Geh zur Theke, um zu handeln.',outside:'Wieder vor Kalles Kiosk.',firstEnter:'Betritt zuerst den Kiosk und geh zur Theke.',noCombat:'Im Kiosk wird gehandelt, nicht gekämpft.',cannotEnter:'Den Kiosk kannst du erst nach der Hofprobe und außerhalb eines Kampfes betreten.',far:'Geh zuerst zur Eingangstür des Kiosks.',roomMap:'Die Verkaufstheke steht gegenüber dem Eingang.',toCounter:'Zur Theke gehen',toExit:'Zum Ausgang gehen'};
