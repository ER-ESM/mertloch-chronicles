# E-72 Runde 3 · Balance, Runde 2 (Kürzel: balance)

Branch `e72-balance2` (von e340597f). Umgesetzt wurden die fünf Entscheidungen des Orchestrators. Gemessen mit `npm run balance:sheet` (content/BALANCE-SHEET.md).

## Ergebnis

| Klasse | ⚑ vorher (Build #638) | ⚑ nachher |
|---|---:|---:|
| Dieter | 97 / 180 | 87 / 180 |
| Bärbel | 71 / 180 | 66 / 180 |
| Kevin | 23 / 180 | 21 / 180 |
| Schorsch | 36 / 180 | 26 / 180 |
| Käthe | 46 / 180 | 27 / 180 |
| **gesamt** | **273 / 900** | **227 / 900** |
| Anteil ⚑ alte Klassen | 35,4 % | 32,2 % |
| Anteil ⚑ neue Klassen | 22,8 % | 14,7 % |

| Spezialisierung | ⚑ vorher | über ±25 % vorher | ⚑ nachher | über ±25 % nachher | größter Ausreißer nachher |
|---|---:|---:|---:|---:|---|
| schorsch-chef | 20 | 5 | 8 | 0 | +22,7 % (Pfad 0, St. 10, ungew.) |
| schorsch-flamme | 10 | 0 | 12 | 0 | +23,8 % (Pfad 0, St. 30, episch) |
| schorsch-rauch | 6 | 0 | 6 | 0 | +18,7 % (Pfad 1, St. 10, ungew.) |
| kaethe-grand | 10 | 0 | 10 | 0 | +24,1 % (Pfad 2, St. 30, Start) |
| kaethe-herz | 28 | 5 | 11 | 0 | +23,8 % (Pfad 0, St. 10, Start) |
| kaethe-falsch | 8 | 1 | 6 | 0 | +23,0 % (Pfad 1, St. 30, episch) |

**Ziel erreicht:** Keine Zelle der neuen Spezialisierungen liegt über ±25 %. Ihr ⚑-Anteil (14,7 %) liegt unter dem der alten Klassen (32,2 %).
Die Ausstoß-Zahlen der alten Zeilen sind unverändert, mit Ausnahme von kevin-fuse (Punkt 3); geprüft wurden alle 540 alten Zeilen.

## Schwächster Punkt

**kevin-fuse hat jetzt eine Zelle über +25 %** (Pfad 2 „Kettenreaktion“, Stufe 5 ohne Ausrüstung: +30 %). Vorher lag der größte Ausreißer bei −24 %.
Die Zahl der ⚑ ist gesunken (11 → 9, Kevin gesamt 23 → 21). Seit die Lunten-Explosion wirklich trifft, reagiert der Pfad Kettenreaktion
sprunghaft auf die Zahlen: Mit Faktor 0,78 statt 0,74 stieg er auf +48 %. Ohne Umbau der Kettenreaktion lässt er sich nicht glatter stellen.

## Was geändert wurde

| Punkt | Änderung | Warum |
|---|---|---|
| 1 · E-53 | `class-resources.js`: Die Heil- und Schildmengen von Wurst, Käse-Schild, Ablöschen, Senf, Herz, Pik, Handlesen und Stich-Heilung bemessen sich am **Grundleben der Stufe** (600 + 45 je Stufe, `lifeBase`) statt am Maximalleben. Sie wachsen nur noch über Heil- bzw. Schildstärke. Heilung auf Freunde bekommt die Heilstärke wie die Heiltaste der Engine. | Standfestigkeit soll nur Leben geben. Vorher wuchs die Chef-Heilung von Start- zu epischer Ausrüstung auf das Vierfache. |
| 1 · Fehler mitbehoben | Grillbuffet und Legekreis bekamen den Stufenfaktor zweimal (beim Aufstellen und je Takt); die Nachheilung der Wurst (Maximalleben × 2 % × Stufenfaktor) ebenso. Jetzt ist der Wert fest wie bei der alten Hauspflege (12), der Takt skaliert. | Die alten Heiler gehen denselben Weg: fester Wert × Stufe × Heilstärke. |
| 1 · neu austariert | Die Entwurfswerte passen wieder: Bratwurst 9 → **12 %**, Nachheilung 1 → **6 s**, Buffet 10 → **14**/s. Herz-Karte 11 → **12 %** Grundleben. Pfadbonus Pik-Schutz zusätzlich **Herz +30 %**. | Pik-Schilde zählen in keiner Heilung, deshalb lag Pfad Pik-Schutz bei −25 bis −32 %. |
| 1 · Texte | Senf, Löschbier, Lokalrunde, Ablöschen (Glossar), Handlesen (Talent und Kniff), Stichfest und Blick über die Schulter sagen jetzt „Grundleben“; die Einheit von `stichHeal` ebenfalls. | Der Begriff „Grundleben“ steht so schon im Glossar (Standfestigkeit). |
| 2 · Sheet | Heiltabelle: Jede Zelle zeigt zusätzlich „· eff. N“ (tatsächlich geheilt, ohne Überheilung). ⚑ und Median bleiben am Ausstoß. Die CSV hat eine neue Spalte `heilung_effektiv_s`. | Im Mittel sind nur 9 % des Ausstoßes der neuen Heiler wirksam, bei den alten 11 %. Die Puppen treffen nur mit 3 % des Grundlebens je Sekunde. |
| 3 · kevin-fuse | Tuning `fuse.explode` trägt wieder `radius:70`. Das Tuning hatte ihn gelöscht, deshalb traf die Lunten-Explosion nie. Explosion 70 → **20**, Faktor 0,8 → **0,74**. | Mit Radius lag Pfad Kettenreaktion bei bis zu +64 %, Kevin gesamt bei 43 ⚑. |
| 4 · Schadensmeter | `combat-meter.js`: Jede Quelle ohne Kniff-Zuordnung bekommt eine eigene Zeile (`src:<Name>`) statt des Topfs „other“. `content/meter.js` ordnet Servieren, Glutbrocken, Schwenkgrill, Spiritus, Abrechnen und Zeche prellen ihrem Kniff zu. | Vorher standen alle Karten, Abrechnen, Stichflamme usw. in einer Zeile namens „Kreuz“ bzw. „Schwenkgrill“, im Sheet wie im Spiel. |
| 5 · Feinschliff | Kreuz-Dame 10 → 5 % | Falschspielerin Pfad 1 lag auf Stufe 30 episch bei +25,3 % |

Die Pfandautomat-Nachladung verursacht keinen Schaden und erscheint deshalb nicht im Schadensmeter.

## Prüfung im Browser (Pflicht: sichtbar)

`SERVER_PORT=4376 CDP_PORT=9776 node scripts/e72-meter-labels-check.mjs`: Schorsch (Flambierer) und Käthe (Grand) kämpfen 24 s gegen drei Übungspuppen. Danach wird die
Kampfstatistik mit V geöffnet und die Figur angeklickt. Ergebnis **PASS**:
- Schorsch: Grillzange, Servieren, Popcorn, Autoangriff, Glutbrand, Glutbrocken (`balance2/meter-schorsch-flambierer.jpg`).
- Käthe: Kreuz, Abrechnen, Karo, Autoangriff (`balance2/meter-kaethe-grand.jpg`).

Beide Bilder habe ich angesehen: eine Zeile je Quelle, keine doppelten Namen.

Nebenbefund: Die Erinnerungs-Randkarte (memory-card.js) legte sich bei 1600×900 über die erst später geöffnete Kampfstatistik. Für die Bilder habe ich sie
ausgeblendet; im Spiel ist das nicht behoben. Die Autoangriff-Zeile heißt „Autoangriff · Zangenklapper“ und wird im schmalen Fenster abgeschnitten (bestand schon vorher).

## Tests

`npm test`: **1076 / 1076 grün**. Neu in `tests/e72-balance.test.mjs`:
- Heilung und Schilde bleiben bei dreifachem Maximalleben gleich groß.
- Das Sheet liefert die effektive Heilung, und sie ist nie größer als der Ausstoß.
- Das Meter trennt Kreuz, Karo, Pik und die Grill-Quellen, und Abrechnen zählt auf den Kniff.
- Die Lunten-Explosion trifft Nachbarn im Radius 70 und keinen weiter entfernten Gegner.

## Offen

- kevin-fuse Pfad 2, Stufe 5 ohne Ausrüstung: +30 % (siehe oben).
- Räuchermeister auf Stufe 5/10 mit Ausrüstung weiterhin +17 bis +19 %, weil Schutz/s gesättigt ist und geschluckten Schaden doppelt zählt.
- baerbel-care: 11 Zellen neu ⚑, 15 fallen weg (netto −4). Der Heil-Median sank, weil die neuen Heiler nicht mehr mit Standfestigkeit wachsen.
