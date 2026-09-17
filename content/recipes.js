// Werkbank-Rezepte (Kevins Werkstatt). Reine Daten – Entwurf nach docs/GAMEPLAY-HAENDLER-HANDWERK.md,
// Freigabe steht aus; die Engine liest hier erst, wenn Werkbank und Laden gebaut sind (docs/backlog/engine.md).
// Feld `bench` = nötige Stufe der Werkstatt (1–3, buildings.js → werkstatt). `input` nur Material aus items.js,
// `coins` optionale Pfandmarken obendrauf, `output` genau ein Gegenstand (consumable oder charm) mit Stückzahl.
// Die Werkbank baut nie Waffen, Rüstung oder Dorflegenden – die bleiben Beute (Regel aus dem Konzept, geprüft in checks/loot.js).
export const RECIPES={
 'brezel-2':{name:'Notfallbrezel ×2',bench:1,input:{feder:3,kronkorken:2},output:{item:'brezel',count:2},text:'Federkiel, Kronkorken, Oskars Rezept von der Rückseite eines Flugblatts.'},
 'wasser-2':{name:'Konterwasser ×2',bench:1,input:{dosenblech:3},output:{item:'wasser',count:2},text:'Blech zu Dose, Dose an den Hahn. Fragt keiner, woher das Wasser kommt.'},
 'kaltgetraenk-1':{name:'Eiskaltes Kaltgetränk',bench:2,input:{dosenblech:4,kabel:2},output:{item:'kaltgetraenk',count:1},text:'Braucht Strom: die zweite Werkstattstufe kühlt.'},
 'currywurst-1':{name:'Oskars Currywurst',bench:2,input:{hopfen:2,borste:3},coins:10,output:{item:'currywurst',count:1},text:'Die Soße kostet extra. Oskar nimmt nur Marken.'},
 'kabeltalisman-1':{name:'Kabelbinder-Talisman',bench:2,input:{kabel:6,kronkorken:4},output:{item:'kabeltalisman',count:1},text:'Der einzige Weg, den Talisman-Platz vor Stufe 6 zu füllen, ohne ein Tier zu erschlagen.'},
 'blechtalisman-1':{name:'Dosenblech-Talisman',bench:3,input:{dosenblech:10,borste:6,flugblatt:2},output:{item:'blechtalisman',count:1},text:'Das Flugblatt ist die Dämmung. Ruhe 22:01 zahlt drauf.'},
 'pfandbon-1':{name:'Pfandbon-Bündel',bench:3,input:{kabelbinder:4,kronkorken:12},coins:10,output:{item:'pfandbon',count:1},text:'Olafs Kabelbinder halten das Bündel zusammen. Vermerkt.'}
};
/** Stufennamen der Werkbank – dieselbe Stufe wie die Werkstatt im Basisbau. */
export const BENCH_STAGES={1:'Kühlschrank-Werkbank',2:'Werkstatt mit Strom',3:'Pfand-Ingenieurbüro'};
