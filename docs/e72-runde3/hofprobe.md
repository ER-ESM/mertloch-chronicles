# E-72 Runde 3 · Hofprobe-Befunde (Kenner 25.09., Befund 10)

Branch `e72-hofprobe`. Prüfung: `node scripts/e72-hofprobe-check.mjs [--phase=vorher|nachher]` (Dieter + Käthe 1600 × 900,
Schorsch 1280 × 720; echter Ablauf Held erstellen → Film überspringen → Ida → Hofprobe mit Tasten → Erinnerung → Hilfe).
Bilder und Berichte: `docs/e72-runde3/hofprobe/` (`vorher-*` = Stand main b78e84cb, `nachher-*` = dieser Branch).
Ergebnis: vorher 48/76, nachher 76/76. Tests: `tests/e72-hofprobe.test.mjs` (6).

| Befund | Ursache | Änderung |
|---|---|---|
| a) „F – mit Ida sprechen“ erst ab ~3 m | Hinweis = `worldInteraction()`, F in der Hofprobe = eigener Weg in `speak()`. Zwischen 60 und 140 E stand „Bude ansehen“ (Baustelle, 75 E um die Bude), obwohl F zu Ida lief; Ida-Hinweis erst unter 50 E (`TUTORIAL.talkRange`). F aus der Ferne lief bis in Ida hinein (Abstand 1) und blieb stumm – zweites F nötig. Name erst ab 70 E. | Hofprobe: Hinweis und F aus einer Quelle (`tutorialInteraction` in app.js, `tutorialIdaReach` in tutorial.js). In den Ida-Schritten „Mit Kisten-Ida sprechen“ aus jeder Entfernung; F/Klick auf den Hinweis läuft hin und spricht an (`walkToTalk`). Angehalten wird im selben Raum (`sameRoom`, talk-target.js) – nicht vor der Tür durch die Wand. Idas Name steht, sobald sie mit „!“/„?“ wartet (`idaShowsName`). |
| b) Erinnerungsfenster blockieren | Overlay 600 px mittig (28 % der Fläche bei 1600 × 900, 35 % bei 1280 × 720, Text und „Weiter“ dort unter dem Rand), lag über Aktionsleiste und Hinweis, F schloss es statt mit Ida zu reden, Rechtsklicks darauf liefen nicht. | Desktop: Randkarte `memory-card.js` rechts unter Minikarte/Verfolgung (7 % bzw. 12 %), Bild wird bei wenig Platz flacher. Laufen, Kampf, Rechtsklick, F gehen weiter; Esc/Kreuz schließt (Esc wirkt im selben Druck weiter auf Ziel/Autoangriff), Klick aufs Bild öffnet das große Bild mit Text. Nachlesbar wie bisher unter Aufträge → Erinnerungen. Handy: unverändert Fenster. |
| c) Hilfe: Tastenbeschriftung überlappt | Feste Tastenspalten 92/30/52 px (fenster-r3.css), seit Runde 5b zeigt die Hilfe beide Tasten („J L“, „P K“), „W A S D“ ist 97 px breit. | Spalte misst sich selbst (`max-content` + `subgrid`), Wörter je Spalte bündig. Nur Desktop. |

Offen: Außerhalb der Hofprobe bleibt Idas Radius 50 E und „Bude ansehen“ gewinnt zwischen 50 und ~110 E (erster Auftrag
„Sprich mit Kisten-Ida“ gleich danach) – bewusst nicht angefasst, weil dort Stammgast Olli (74 E von Ida), Treppe und Schwarzes
Brett konkurrieren. `precache-manifest.js` braucht `memory-card.js` (Orchestrator baut neu).
