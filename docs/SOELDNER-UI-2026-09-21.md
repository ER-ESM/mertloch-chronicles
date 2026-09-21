# Söldner-Oberfläche · 21.09.2026

Arbeitsstand im Worktree `MertlochChronicles-begleiter`, auf der vorhandenen E-45-Engine.

- Schwarzes Brett am Clan-Treff: in Reichweite mit F bzw. dem Touch-Interaktionsknopf öffnen. Auch über Spielmenü → Söldner und Taste U erreichbar.
- Sechs Angebote mit Rolle, Beschreibung, Stufe, Münzkosten und Vertragsbedingungen. Fehlende Münzen und volle Gruppen erklären gesperrte Anheuerknöpfe; bereits angeheuerte Söldner sind markiert.
- „Deine Truppe“: einzelne oder alle Söldner auswählen, Folgen / Warten / Mein Ziel angreifen und Unterstützen / Verteidigen / Passiv. Angriff erfordert ein lebendes, angreifbares Ziel. Passiv bleibt auch nach einem Angriffsbefehl passiv, entsprechend der Engine.
- Gruppenrahmen mit Rolle, Leben, Zustand und Vertragsrestzeit; Antippen öffnet die Einzelverwaltung. Am Boden mit Wiederaufstehzeit und liegender Figur in der Welt. Anheuern, Entlassen und Vertragsablauf aktualisieren die Anzeige ohne Neuladen.
- Fenster nutzt das vorhandene Desktop-/Touch-Fenstersystem. Werte werden im bestehenden DOM aktualisiert; Fokus und Klickziele bleiben beim Lebens- und Vertragstakt erhalten. Neue Texte liegen in `content/companion-ui.js`, additiv über `content/index.js` exportiert.

Prüfung: `node scripts/companion-check.mjs` startet einen eigenen Server und ein isoliertes Browserprofil. Optional eine lokale URL als Argument. Desktop 2024×900, Touch 390×844 und 844×390; echte Maus-/Touch-Eingaben, Vertragsablauf, fehlende Münzen, Viererlimit, Tastatur, Einzel-/Gruppenbefehle und leere Truppe. Screenshots und `report.json` in `visual-review/companions/`. Der große HUD-Screenshot verwendet JPEG, damit der CDP-Transport des lokalen Node-Treibers nicht an der PNG-Größe abbricht.

Die UI übernimmt die Anzahl anderer Menschen aus der vorhandenen Online-Gruppenansicht für die Anheuerprüfung. Automatisches Entlassen bei späterem Beitritt weiterer Menschen bleibt der bestehende Engine-/Netzauftrag in `docs/backlog/engine.md`; ebenso fremde Begleiter im Netzwerk. Individuelle Söldner-Sprites sind weiterhin Grafikbedarf.

Technischer Ereignishinweis: `Game.emit(type, data)` lässt `data.type` den äußeren Typ überschreiben. Daher berücksichtigt die UI sowohl `companion` als auch die aktuellen Untertypen `hired`, `dismissed`, `expired`, `down`, `revived`, `order`, `stance`. Die periodische Aktualisierung deckt außerdem Vertragszeit und Leben ab.

Kampf-R?ckmeldung erg?nzt: Angriffs-, Fernkampf-, Heil-, Treffer- und Deckungsposen sowie Laufrichtung und zur?ckgelegte Strecke erreichen die Heldengrafik. Nahkampfeffekte werden ausgel?st; Effekte verwenden die Klasse des S?ldners. Eigene SCT-Laufbereiche folgen den S?ldnern, trennen eingehenden Schaden, ausgehenden Schaden und Heilung und verschwinden beim Entlassen. Bei ausgeschaltetem SCT bleiben die Welttexte erhalten.

Die Kampfstatistik f?hrt jeden S?ldner unter seiner stabilen ID und seinem Namen, mit einzelnen F?higkeiten, wirksamen Werten, kritischen Treffern, ?berschaden und ?berheilung. Spielerschaden wird nicht erh?ht; Heilung au?erhalb des Kampfes bleibt ausgeschlossen. Historie und Gesamtwerte bleiben nach Entlassung lesbar. Regression: tests/companion-combat-feedback.test.mjs und scripts/companion-combat-check.mjs (echter Renderer-Angriffsframe, DOM-Kampftext, Statistik-Navigation, Touch und Einstellungen; Screenshots in visual-review/companion-combat/).
