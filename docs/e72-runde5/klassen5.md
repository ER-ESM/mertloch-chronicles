# E-72 Runde 5 · klassen5 · Klassen-Feinschliff (Kenner-Nachtest 26.09. nachts)

Branch `e72-klassen5`. Prüfung: `npm test` (neu: `tests/e72-klassen5.test.mjs`), Browser: `scripts/e72-klassen5-check.mjs`
(Bilder `docs/e72-runde5/klassen5/`, Bericht `report.json`).

| Nr | Befund | Umsetzung |
|---|---|---|
| 1a | Kevin: „×7“ neben den Pfandbons wird als Bon-Zahl gelesen | Band neu geordnet (`resource-hud.js ammoLayout`): Bons im eigenen Halter mit Goldrand, 16 px Abstand, dann ein Grasfleck mit Flasche + Stiefel und der Zahl als grünem Abzeichen darin – kein „×“ mehr |
| 1b | Kevin: Pfandautomat-Treffer nicht erkennbar | Balken: Treffer = ganzer Balken golden mit Glanz, Stempel „BON!“ springt darüber, 5 Münzen springen heraus, bleibt 1,1 s (vorher 0,45 s Aufblitzen). Fehlgriff = Stempel „KLEMMT!“ in Rost, zittert, solange der Automat hakt. Held: Goldblitz, Ring, Münzfontäne, goldener Zettel; Fehlgriff Kasten wackelt rot, Funken, Qualm. Das Wort steht am Helden schon als Kampftext-Meldung („BON!“, „KLEMMT! +1 s“) – kein zweites Wort (erster Entwurf hatte eins, stand doppelt). Ton: Treffer hell ansteigend (`unlock`), Fehlgriff dumpf (`hit`) |
| 2a | Schorsch: Glut fällt nach dem Kampf 40 → 9 | Ursache: der Grill rechnete den 7-s-Nachlauf von `p.inCombat` als Kampf und kühlte mit 5/s weiter. Jetzt zählt nur ein Kampf mit lebendem, angreifendem Gegner (`grillEngaged`); außerhalb läuft die Glut zur Ruheglut 35 – heiß langsam (`restCool` 2/s), kalt mit 5/s hoch, nie darunter. Kein Hitzebrand ohne Gegner. Browser: 40 → 36 → 35, 15 s lang nie darunter |
| 2b | Schorsch: Auflegen → warten → Servieren „zäh“ | Hauptursache war 2a: kalt gart ×0,5 → erstes Stück erst nach ~10 s gar, mit Ruheglut nach ~4 s. Dazu: bei Kampfbeginn legt Schorsch das erste Stück selbst auf (nur bei leerem Rost, ab Stufe 2, nicht in der Hofprobe) und Auflegen klingt ab wie nach einem Druck. Begründung: Auflegen ist frei und ohne GCD, die Rotation (`balance-rotation.mjs`) drückt es ohnehin in der ersten Sekunde – Zahlen bleiben gleich, nur die leeren ersten Sekunden fallen weg |
| 3 | Käthe: „Farbe bedienen“ nur im Hover | Band: Plättchen mit großem Farbzeichen auf Kartenpapier, daneben groß „×N“ (Karten in Folge) und darunter „+40%“ in Gold; wächst die Kette, springt es |
| 4 | Man sieht nicht, was heilt | Eckzeichen unten links an jedem Kniff-Knopf (alle Klassen; Handy-Knöpfe mitgedacht, im Browser nicht geprüft): grünes Plus = Heilung, blaues Schild = Schutz, Schaden ohne Zeichen. Quelle: Kategorien (Leistenplatz + Glossarbegriffe; Lebensraub zählt nicht). Laufend: Käthes Karten (Herz/Pik), Schorschs Servieren (Wurst/Käse). Klassen-Buffs (30 min) ohne Zeichen. Ein sichtbares Wortschild hat Vorrang |
| 5 | Bodenziel stoppt den Fluss | Standard bleibt aus. Die ersten 3 Male zweite Zeile im Hinweis: „Einstellung: „Bodenkniffe sofort an der Maus““ (Zähler `settings.groundTips` im Spielstand, am Handy kein Tipp). Kurz gehalten, weil die längere Fassung unter dem Zielfenster verschwand |

Dateien: `class-resources.js` (nur Glut-Ruhe, Kampfbeginn am Rost, `layItem`), `content/resources.js` (`restCool`, Glossar Glut),
`resource-hud.js/.css`, `resource-fx-art.js`, `action-bar-ui.js` (Eckzeichen), `engine.js` (Bodenziel-Hinweis, 3 Zeilen),
`app.js` (Hinweis mit Tipp wird mit dem Zielmodus zurückgezogen), `content/combat.js`, `content/hud.js`.
