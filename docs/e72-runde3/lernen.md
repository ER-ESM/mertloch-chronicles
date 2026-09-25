# E-72 Runde 3 · Lernen über das Bild (Kürzel `lernen`)

Anlass: Kenner-Playtest „Käthe ohne Skatwissen nicht verständlich“ (Spaß 2/5), Schorsch „Grundidee verständlich“ (3/5).
Ziel: Die Regeln werden über das Bild gelernt, nicht über Text. Namen und Zahlen stehen nur im Tooltip. An den Zahlen der Regeln ändert sich nichts.

| Nr | Umsetzung | Dateien |
|---|---|---|
| 1 | Karte auf der Leiste: Wirkung als großes Symbol (♣ Klinge, ♠ Schild, ♥ grünes Plus, ♦ Knall), Farbzeichen und Rang klein oben rechts (oben links liegt die Taste), Tempo-Abzeichen unten rechts: » schnell (7–9), Stern stark (10, Ass), Krone Trumpf (Bube). Die Farbfilter der Varianten verfälschten die Kartenfarben (Pik wurde lila) – für Karten jetzt aus | `resource-art.js` (`drawEffectCard`, `cardTempo`, `drawBadge`), `skill-art.js`, `resource-hud.css` |
| 2 | Augen-Leiste: Marken 61 rot, 90 gold, 120 schwarz mit Kerben; eigener Tooltip je Marke (Gewonnen, Schneider, Schwarz). Abrechnen leuchtet ab 61 und stärker ab 90/120, drei Punkte am Knopf wie die Marken. Nebenbefund: die Tooltip-Flächen auf der Leiste (seit Runde 2) waren durch die Textregeln der Leiste unsichtbar und bekamen nie die Maus | `resource-hud.js/.css`, `content/hud.js` |
| 3 | Stich: Handkarten, die den Karten-Zauber des Ziels stechen, leuchten golden mit Abzeichen (zerschlagene Karte) an der Ecke; Karten, die die Farbe bedienen, tragen einen silbernen Kettenrahmen. Wortschild „STICH 10“ entfällt. Die Gegnerkarte am Zauberbalken gab es schon | `resource-hud.js/.css` |
| 4 | Hofprobe „Karten auf den Tisch“ (Käthe): drei Bild-Schritte statt Erklärzeile – echte Karte + Taste „Karte spielen“, Skatblock „Augen sammeln“ (Stand), rote 61 „Ab 61 abrechnen“ (vor Stufe 2 mit Schloss); die Kartentaste pulsiert bis zur ersten Karte. Verfolgung (Desktop) und Handyleiste | `tutorial-guide.js` (neu), `content/tutorial.js` (`guide`), `quest-tracker.js`, `tutorial-ui.js` (eine Zeile) |
| 5 | Schorsch: Servieren zeigt das garste Stück mit Garring und leuchtet in der Farbe der Garstufe (gar golden pulsierend, durch kupfern, verkohlt rauchig, leer gar nicht); Auflegen zeigt das nächste Grillgut mit Plus; perfekte Glut auf der Leiste schraffiert und geklammert, Tooltip „Perfekte Glut“ | `resource-hud.js/.css`, `class-resources.js` (`nextItem` in der Anzeige, `item` an der Servieren-Variante) |
| 6 | Gegenprüfung: Anni – Trendherzen und Algorithmus-Ring sichtbar, aber nirgends stand, was den Trend hebt/bricht → eine Zeile im Trend-Tooltip. Dieter – Bon mit Strichen und Betrag sichtbar, nichts geändert | `content/hud.js` |
| – | Leuchten „Ideales Zeitfenster“ auf Käthes Kartenplätzen und Schorschs Auflegen/Servieren abgeschaltet (war Zufall aus der Markierungsregel: Karte 2 und Auflegen glühten dauernd) | `combat-ui.js` |

Prüfung: `node --test tests/e72-lernen.test.mjs` (6 Tests), `npm test` grün, Browser `node scripts/e72-lernen-check.mjs` (Screenshots in `docs/e72-runde3/lernen/`).
