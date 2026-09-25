// Effektschicht der Welt (E-47): Werte für world-fx.js. Nur Zahlen und Farben; gezeichnet wird auf der Grafikkarte.
// Die Schicht ist reine Darstellung: Sie liest Spielzustand, würfelt nichts und ändert nichts am Kampf.
export const WORLD_FX={
 // Bloom: helle Bildteile strahlen weich über. Schwelle und Stärke niedrig halten – Pixelgrafik verwäscht sonst.
 bloom:{threshold:.62,strength:.55},
 // Druckwellen verzerren das Bild ringförmig. Je Auslöser: Reichweite in Weltpixeln und Stärke der Verzerrung.
 shock:{max:6,width:20,
  types:{impact:{radius:70,power:5},burst:{radius:95,power:7},interrupt:{radius:60,power:5},death:{radius:80,power:5}},
  kinds:{slam:{radius:130,power:10},detonate:{radius:120,power:10},keg:{radius:110,power:9},burst:{radius:95,power:7},interrupt:{radius:60,power:5},death:{radius:80,power:5},
  // E-72: Ressourcen-Momente, die sofort einschlagen (Zeche prellen, Stichflamme). Wurf-Effekte mit Flugzeit bekommen keine Welle.
  prellen:{radius:110,power:10},overheat:{radius:100,power:9}}},
 // Hitzeflimmern über Feuerstellen und Brandflächen (Lichtquellen-Arten aus content/lighting.js).
 heat:{sources:['campfire','burn','portal'],radius:34,rise:20,power:1.2,max:8},
 // Bodennebel wächst mit dem Dunkelanteil des Gebiets (E-39): darunter keiner, darüber voll.
 fog:{from:.14,full:.38,alpha:.3,rainAlpha:.16,scale:.006,wind:{x:.05,y:.018},day:'#a9b6c2',night:'#38456a'},
 // Wetter folgt der Spielzeit: alle `period` Sekunden ein Schauer von `rain` Sekunden, weich ein- und ausgeblendet. Erster Schauer frühestens nach `first`.
 weather:{period:600,rain:120,fade:14,first:240,tint:'#c4d2e8',dim:.12,streak:.3,
  // Wetterleuchten: je Zeitfenster `slot` Sekunden blitzt es mit Wahrscheinlichkeit `chance`, klingt in `decay` Sekunden ab.
  flash:{slot:9,chance:.3,decay:.7,power:.4}},
 // Partikel laufen vollständig im Vertex-Shader. Funken steigen über Feuerstellen auf, Glühwürmchen erscheinen ab `fireflyFrom` Dunkelanteil.
 particles:{embers:220,fireflies:140,fireflyFrom:.16,fireflyFull:.32,cell:{x:1400,y:900}},
 // Selbstschutz: Kostet die Schicht im Mittel mehr als `budgetMs` je Bild, fällt sie nach `window` Bildern auf die leichte Stufe (ohne Weltbild-Textur) zurück.
 // `slowMs`: Liegt der Bildabstand im Mittel darüber (22 ms ≈ unter 45 FPS), gilt die volle Stufe ebenfalls als zu teuer – Grafikkarten-Last
 // (Weltbild-Textur, Bloom, Vollbild-Shader) erscheint in der CPU-Zeit nicht. Budget 4 ms: ein Bild hat bei 60 FPS nur 16,7 ms für alles.
 // Ohne Grafikkarte (E-50) rechnet die Schicht in diesem Anteil der Auflösung; der Browser skaliert sie hoch.
 softScale:.5,
 guard:{budgetMs:4,window:60,slowMs:22}
};
