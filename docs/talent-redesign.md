# Talentmenü mit Pfaden und Mehrfachrängen

Umsetzung des freigegebenen Prototyps vom 21. September 2026. Im Spiel über **N → Talente** erreichbar.

- Eine Spezialisierung und darin genau ein Pfad sichtbar. Pfad-Tabs zeigen investierte Punkte und den erreichten Bonus ab 4 bzw. die Krone ab 7 Punkten.
- Drei Icon-Spalten, fünf Reihen mit 3 / 1 / 2 / 3 / 1 Talenten. Freie Zellen bleiben frei. Namen erscheinen in Tooltip und Detailkarte.
- Reihen benötigen 0 / 2 / 4 / 6 / 8 Punkte in **vorherigen Reihen derselben Spezialisierung**, über alle ihre Pfade hinweg. Punkte in derselben oder einer späteren Reihe finanzieren das Tor nicht.
- Zwei direkte Abhängigkeiten je Pfad. Voraussetzung ist Rang 1. Pfeile verlaufen senkrecht oder diagonal um eine Spalte.
- Talente haben 1, 2, 3 oder 5 Ränge. Jeder Rang kostet einen Punkt und zählt für Reihen und Pfadtreue. 29 ausdrücklich festgelegte Kurven erhöhen Chance, Dauer oder Stärke; Rang 1 bewahrt die bisherige Wirkung. Binäre Effekte werden nicht vervielfacht.
- Klick zeigt Details; Doppelklick lernt einen Rang; Rechtsklick nimmt einen Rang zurück. Die Detailkarte bietet beide Aktionen auch für Touch und Tastatur. Rücknahme wird verweigert, wenn andere Talente dadurch ungültig würden.
- Die bestehende Punktevergabe nach Spielerlevel, klassenübergreifende Trennung, Kombination der drei Spezialisierungen sowie Hauptbaum- und Kampfregeln bleiben erhalten. Alle Punkte zurücksetzen bleibt am Clan-Treff möglich.

## Spielstände

Talentstände speichern `version: 2`, eine eindeutige `learned`-ID-Liste und `ranks: { [talentId]: rank }`. Die ID-Liste bleibt für vorhandene Freischaltungen und Aktionsleisten bestehen. Punkte werden mit `spentPoints`, nicht mit `learned.length`, gezählt.

Alte ID-Listen werden als Rang 1 eingelesen. Gültige Auswahlen bleiben erhalten. Auswahlen, die nach der Layoutänderung ihre neue Voraussetzung nicht erfüllen, sowie Punkte oberhalb des Spielerbudgets werden freigegeben. Das Menü meldet diese Freigabe einmal, bis sie bestätigt wird. Es werden weder Level noch verdiente Talentpunkte entfernt. Spezialisierungs- und Figurenwechsel sowie Speichern/Laden erhalten die Ränge.

## Dateien und Prüfungen

`mechanic-help.js` erklärt Auslöser mit den aktuellen Skillnamen, den Geltungsbereich einzelner Talentanteile und die neun Hauptbaum-Mechaniken anhand ihrer Regeln und aktiven Talentmodifikatoren. Gemeinsame Markierungs-Procs, Laufzauber und Flächendauer werden nicht pauschal als hauptbaumgebunden bezeichnet. Gemischte Talente behalten ihre allgemeinen Effekte. Ressourcenanzeigen sind per Hover, Tastaturfokus und Antippen zugänglich; die Statusleisten und verlinkten Begriffe verwenden dieselben Erklärungen. Eigenarten verwenden die tatsächlich eingestellten Klassenwerte. `tests/mechanic-help.test.mjs` prüft insbesondere baumübergreifende Auslöser, Rangzahlen und Ressourcenbedingungen; `node scripts/mechanic-help-check.mjs` prüft die neun HUD-Tooltips und Touch-Details im Browser.

Die kompakte Ansicht zeigt Rollen direkt an den Spezialisierungen, Punktestand und Pfadtreue als kleine Anzeigen und ausschließlich Icons mit Rängen im Baum. Suchhilfe, Reihen-Erklärungen und doppelte Überschriften entfallen. Zusatzinformationen stehen in Hover-/Fokus-Tooltips oder den anklickbaren Touch-Details. Verbindungen laufen unter den Icons von Mittelpunkt zu Mittelpunkt, mit kontrastreichen Linien und Richtungspfeilen; ihre Geometrie bleibt bei geänderter Fensterbreite verbunden. Schriften und Farben verwenden die vorhandenen Bierdeckel-Tokens. Bei 1366 × 768 passt das vollständige Menü ohne Scrollen; bei 390 × 844 bleiben mit aktiven Touch-Steuerelementen 57 Pixel vertikaler Scrollweg.

`talents.js` enthält Layout und Lernregeln, `talent-ranks.js` die expliziten Kurven, `procs.js` wertet die gesteigerten Auslösechancen und Heilanteile im Kampf aus. `talent-tree-view.js` und `talent-tree.css` binden die Ansicht ins bestehende Clanbuch ein. Bilder stammen aus den vorhandenen Talent-Atlanten und dem UI-Kit.

Automatische Prüfungen: `npm test`, `npm run build`. Neue Rangprüfungen liegen in `tests/talent-ranks.test.mjs`. Die Kampftests bauen ihre bisherigen Effekte über einen gültigen Baum einschließlich neuer Voraussetzungen auf (`tests/talent-fixture.mjs`). Browserprüfungen decken Desktop, Tastaturnavigation, Suche, schmale Ansichten, Touch, Rangwechsel, Rücknahme und Speichern/Laden ab.
