# Mertloch 0.11 · fünf Iterationen für Menüs und Gegenstände

Stand: 11. September 2026. Umgesetzt und in einem separaten lokalen Chrome-Testprofil geprüft. Die Browserprüfungen sichern dessen bestehende Spielstände und spielen sie nach dem Test zurück.

## 1. Unabhängige Fenster und gemeinsame Grafik

Der bisherige einzelne `showModal()`-Dialog wurde durch mehrere verschiebbare Fenster ersetzt. Jedes hat einen eigenen Inhalt, Fokus, Schließknopf und Minimierung. Der Hintergrund fängt keine Eingaben ab. Nur ein inaktiver Browser-Tab pausiert; Menüs beeinflussen die Simulation nicht. Inventar und Charakter starten an den Rändern, Fensterpositionen werden gespeichert.

24 neue Icons verbinden Gegenstände, Fähigkeiten, Beute und Menüs mit der Maifeld-Grafik. Holzleisten, moosgrüne Flächen und kantige Konturen ersetzen die bisher gemischten Oberflächen. [Erste Sichtprüfung](popup-review/round-1/first-popups.jpg), [Atlas](assets/maifeld-ui-011/icons.png), [Prompt und Importvertrag](assets/maifeld-ui-011/PROMPTS.md).

## 2. Gegenstände bedienen und vergleichen

Einzelne Beuteicons und separate Pfandmarken; Hover-Tooltips mit Seltenheit, Anforderungen und Vergleich. Direktes Tauschen per Rechtsklick, Doppelklick oder Ziehen auf den passenden Ausrüstungsplatz. Der alte Gegenstand wandert in den Rucksack. Verpflegung funktioniert bei geöffneten Fenstern. Suchfeld, Sortierung und Beschriftungen helfen beim Finden und Benutzen.

Echte Maus-Drags auf Ausrüstungsplätze und vom Skillbuch auf die Aktionsleiste geprüft; falsche Ausrüstungsplätze werden abgewiesen. Gleichzeitige Fenster, Bewegung, Suchfeldeingaben, Minimierung, selektive Beute und Persistenz geprüft. Eine gefundene Überlappung langer Fenster mit der Aktionsleiste bei 1920 px wurde durch die Begrenzung an der vollständigen Fensterhöhe behoben. [Prüfergebnisse](popup-review/round-2/checks.json), [Tooltip](popup-review/round-2/tooltip-debug.jpg).

## 3. Echter Kampf und verdiente Ausrüstung

Mit einer neuen Bärbel und zwei Startfähigkeiten Idas Auftrag angenommen, über die Weltkarte zum Lager gelaufen und den Kampf tatsächlich über Weltklicks und Tasten gespielt. Rucksack und Charakter blieben gleichzeitig offen. Ein Plünderer wurde nach 288 Schaden besiegt; Bärbel hatte danach 376 Leben. Seine Regenjacke wurde einzeln aufgenommen und mit noch sieben Sekunden Kampfstatus gegen die Kutte getauscht. Die übrige Beute, Rückweg, Neuladen sowie Admin-Reset und Wiederherstellung wurden ebenfalls geprüft.

[Kampf mit offenen Fenstern](popup-review/round-3/combat-with-inventory.jpg), [verdiente Beute](popup-review/round-3/earned-loot-popup.jpg), [Messwerte](popup-review/round-3/playtest.json). Das ist ein echter Kampfdurchlauf; die gezielten Inventar-Randfälle in den anderen Runden verwenden vorbereitete Spielstände.

## 4. Bequemere Abläufe und Randfälle

Die Beute öffnet auf breiten Displays neben dem Rucksack, damit neu aufgenommene Gegenstände erreichbar bleiben. Mit physischen Mausklicks geprüft, dass beide Fenster bedienbar sind. Ausrüstungstausch funktioniert auch bei 24/24 belegten Plätzen. Nicht passende Restbeute bleibt liegen. Offene Beutefenster zeigen die Entfernung laufend an und erlauben keinen Fernzugriff. Gespräche prüfen die Entfernung erneut beim Annehmen eines Auftrags.

Minimierte Fenster lassen sich auch über Verknüpfungen anderer Menüs wiederherstellen. Aktuelle Lebenspunkte, Auftragsfortschritte, Kartenposition und Verpflegungs-Abklingzeit werden nachgeführt. Shift+F sammelt direkt; Shift+Esc räumt alle Fenster weg. Scrollen und Drag-and-drop entfernen überholte Tooltips. [Volles Inventar und daneben Beute](popup-review/round-4/full-bag-adjacent-loot.jpg), [Randfallprüfungen](popup-review/round-4/checks.json).

## 5. Abschließende Prüfung

Die vollständige aktuelle Oberfläche erneut bei 390×844, 320×700 und 1920×1080 geprüft. Inventar, Charakter, Skillbuch, Karte, Questlog, Spielmenü und Hilfe bleiben innerhalb des Bildschirms; die Aktionsleiste wird nicht überdeckt. Desktopprüfungen verwenden zusätzlich 1440×1000. Der kleine Bildschirm verwendet scrollbare, minimierbare Fenster. Alle Interaktionsprüfungen und 66 Engine-/Regeltests bestanden; keine unbehandelten Browser-Ausnahmen in den abgeschlossenen Läufen.

Die zusätzliche Tooltip-Prüfung bestätigt Hover- und Fokusdarstellung; Ereignisse anderer Elemente schließen den Gegenstandsvergleich nicht mehr. [Vergleich zur getragenen Ausrüstung](popup-review/round-5/tooltip-comparison.jpg).

[Abschlussprüfung](popup-review/round-5/checks.json), [Inventar auf 390 px](popup-review/round-5/bag-390.jpg), [Skillbuch auf 1920 px](popup-review/round-5/book-1920.jpg), [Karte auf 320 px](popup-review/round-5/map-320.jpg).

## Reproduzieren

Spielserver: `npm start`, Port 4173. Die vorhandenen Browser-Treiber benötigen ein separates Chrome-Testprofil mit CDP auf Port 9222 und Node 22+ für dessen integrierten WebSocket. Browserprüfungen nacheinander starten, da sie dasselbe Testfenster nutzen.

```text
npm test
node scripts/popup-ui-check.mjs 5
node scripts/popup-playtest.mjs
node scripts/popup-edge-check.mjs
node scripts/popup-tooltip-check.mjs
```

Die Prüfläufe decken die beschriebenen Abläufe in Chrome ab; sie sind keine Zusage völliger Fehlerfreiheit oder eine Prüfung aller Browser und Touchgeräte. Das Spiel bleibt der lokale Einzelspieler-Prototyp mit lokalem Admin-Reset.
