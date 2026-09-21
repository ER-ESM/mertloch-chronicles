# GUI-Politur in fünf Iterationen

Auftrag: durchgängige hochwertige UI-Materialien, Spielerporträt und Lebensbalken sichtbar aufwerten, Spieler-/Online-/Begleiterrahmen angleichen. Jede Runde wird mit `node scripts/gui-polish-review.mjs --round=N http://127.0.0.1:4398/` aufgenommen. Screenshots liegen unter `visual-review/gui-polish/iteration-N/`.

## Ausgangszustand (Runde 0)

Desktop und Handy sowie Figur, Inventar, Talente, Menü und Begleiterfenster aufgenommen. Befund: drei getrennte Rahmenfamilien; Spielerporträt sehr klein, Begleiter und Gruppe ohne Porträts; verschiedene Balkenhöhen/Schriften; flache Flächen in Fenstern; auf Touch überdeckt der Begleiterkopf die Kontextzeile.

## 1 — Gemeinsame Einheitenrahmen

Generierte transparente Messing-/Eichenrahmen und Porträtmedaillons eingebaut. Spieler, Begleiter und Online-Gruppe teilen die Materialien und die Porträtkomponente. Online-Hilfszielwahl ist ein echter tastaturbedienbarer Button; Aufhelfen bleibt separat.

Bewertung der Screenshots: Material und Porträtformen wirken zusammenhängend, Gesichter und Level sind besser sichtbar. Die alten Balken passen noch nicht zusammen. Online-Rahmen beginnen zu hoch und kollidieren mit Effekten/Chat; Touch-Kontextkollision besteht noch. Balken folgen in Runde 2, Anordnung in Runde 5.

## 2 — Lebens- und Ressourcenanzeigen

Generierte grüne und bernsteinfarbene Emailletexturen für gemeinsame Balken. Einheitliche Zahlen in Nunito, größere Lebensbalken, kleinere Randaleleiste. Niedrige Lebenspunkte, besiegte Einheiten und gewählte Hilfsziele bekommen abgestimmte optische Zustände. Werte bleiben durch die Spielmechanik bestimmt.

Bewertung: Die Balken sind jetzt als eine Familie erkennbar und Zahlen deutlich ruhiger. Dunkle freie Balkenfläche und helle Füllkante trennen den Füllstand. Die alten Fensterflächen, weißen Menüknöpfe und dünnen Standardrahmen fallen stärker auf und werden in den nächsten beiden Runden angeglichen.

## 3 — Fenster und Flächen

Zusätzliche dunkelgrüne Materialtextur generiert. Fenster, Minikarte, Auftrag, Chat, Statistik, Tooltip und Karten verwenden zentrale Materialvariablen und passende Rahmensprites. Fenstertitel und Gesprächsporträts an die Einheitenrahmen angeglichen. Die Dekoration liegt innerhalb der bestehenden Fenster und bleibt ohne Zeigerereignisse.

Bewertung: Die Holz-/Messingecken und ruhigen Flächen verbinden Fenster und HUD sichtbar. Titel bleiben gut lesbar. Im Rucksack bricht der Hilfereiter in eine zweite Zeile um; die alten hellen Knöpfe und flachen Inventarfächer passen noch nicht zur neuen Gestaltung.

## 4 — Knöpfe, Reiter und Fächer

Gemeinsame vertiefte Rahmen für Knöpfe, Eingaben und Auswahlfelder; Primäraktionen in dunklem Bernstein. Aktive Reiter bekommen eine Messingkante und klare Auswahlmarkierung. Desktop-Buchreiter nutzen ein festes Raster, damit Hilfe nicht allein in eine zweite Zeile rutscht. Aktionsleiste und Inventarfächer verwenden dieselben Materialien. Seltenheits- und Proc-Farben bleiben an den vorhandenen Rahmen erhalten.

Bewertung: Rucksack, Figur und Menü passen jetzt zum Spielerrahmen. Die Hilfe bleibt auf Desktop in derselben Reiterzeile. Die bisherigen zwei Schriftfamilien bleiben erhalten. In Touch-Querformat fällt noch die Konkurrenz zwischen Gruppenanzeigen, Effektleisten und Chat auf; diese Anordnung wird in Runde 5 korrigiert.

## 5 — Anordnung und abschließender Bildvergleich

Online-Gruppe und Begleiter teilen einen automatisch platzierten, bei Platzmangel scrollbareren Bereich. Online-Mitspieler stehen zuerst. Im Querformat stehen kompakte Begleiterrahmen nebeneinander. Kontextzeile, Ziel, Tutorial, Effekte und Kampfsteuerung werden bei der Platzierung berücksichtigt. Auf sehr kurzen Displays stehen die drei Effektgruppen nebeneinander; jeder Effekt bleibt mindestens 44 px groß und horizontal erreichbar. Ruhender Chat verwendet auf Touch eine kompakte Höhe. Manuell positionierte Fenster bleiben dem HUD-Editor zugeordnet.

Die Klassenmechanik zeichnet den gleichen generierten Rahmen wie die HTML-Fenster. Porträtidentitäten und Spielwerte stammen weiter aus den bestehenden Spielsystemen. Es gibt keine neue Eskalationsmechanik.

Abschlussbewertung der Desktop-, Online-Gruppen-, Figuren-, Inventar-, Talent-, Menü-, Touch- und Querformatbilder: gleiche Messingkanten und grüne Oberflächen, klarere Gesichter und Zahlen, erkennbare Auswahl und niedrige Lebenspunkte. Die Unterschiede zwischen Spieler- und Gruppenrahmen sind jetzt Größenunterschiede innerhalb derselben Gestaltung. Auf kleinen Bildschirmen bleibt Scrollen im Gruppenbereich bei vielen Mitgliedern notwendig; die Kampfsteuerung bleibt frei.

## Nachweise

- Runden 0 bis 5: je acht beziehungsweise neun echte Browser-Screenshots unter `visual-review/gui-polish/iteration-N/`; `report.json` enthält die Aufnahme- und Fehlerliste. Runde 5 enthält die Abschlusskorrekturen und wartet auf geladene Klassenmechanik-Sprites.
- Sechs neue PNG-Assets unter `assets/ui-chrome/runtime/`, erzeugt mit dem eingebauten `image_gen`-Werkzeug. Vollständige Prompts in [PROMPTS.md](../assets/ui-chrome/PROMPTS.md), Originalpfade und SHA-256 in `generation.json`. Transparenz und Originaldateien bleiben erhalten.
- `npm test`: 656 Tests bestanden, keine Fehler. Neue Tests prüfen die sechs Originalgrafiken, transparente Öffnungen sowie sichere Gruppenrahmen mit Auswahl-/Aufhelfverhalten.
- Navigation und Inventar: echte Klicks, Ausrüstung, Verbrauchsgüter, Suchfeld-Isolation und gespeicherter Zustand bestanden.
- `runUI(['layout'])`: Desktop, 390er/320er Hochformat und Querformat mit beiden Bedienseiten bestanden; Tutorial-Hilfe, Zielabstand und Buchfenster geprüft.
- `scripts/companion-aid-check.mjs`: tatsächliche Begleiterauswahl und Heilung auf Desktop/Touch bestanden.
- `scripts/gui-polish-check.mjs`: Gruppen-/Effekt-/Chat-Abstände bei 844×390, 568×320, 390×844 und 320×740, links/rechts im Querformat; Bild- und Geometrienachweise unter `visual-review/gui-polish/checks/`.
- Derselbe Browsercheck verschiebt Spielerrahmen und Chat mit echten Mausereignissen und prüft, dass die gespeicherten Positionen nach dem Neuladen erhalten bleiben.
- `npm run build`: Quellen-Wächter und Build-Selbstprüfung bestanden. Die neuen Laufzeitgrafiken sind im PWA-Cache enthalten, Generierungsmetadaten werden nicht in den Build übernommen.
