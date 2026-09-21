# Söldner-Oberfläche · 21.09.2026

Arbeitsstand im Worktree `MertlochChronicles-begleiter`, auf der vorhandenen E-45-Engine.

- Schwarzes Brett am Clan-Treff: in Reichweite mit F bzw. dem Touch-Interaktionsknopf öffnen. Auch über Spielmenü → Söldner und Taste U erreichbar.
- Sechs Angebote mit Rolle, Beschreibung, Stufe, Münzkosten und Vertragsbedingungen. Fehlende Münzen und volle Gruppen erklären gesperrte Anheuerknöpfe; bereits angeheuerte Söldner sind markiert.
- „Deine Truppe“: einzelne oder alle Söldner auswählen, Folgen / Warten / Mein Ziel angreifen und Unterstützen / Verteidigen / Passiv. Angriff erfordert ein lebendes, angreifbares Ziel. Passiv bleibt auch nach einem Angriffsbefehl passiv, entsprechend der Engine.
- Gruppenrahmen mit Rolle, Leben, Zustand und Vertragsrestzeit; Antippen öffnet die Einzelverwaltung. Am Boden mit Wiederaufstehzeit und liegender Figur in der Welt. Anheuern, Entlassen und Vertragsablauf aktualisieren die Anzeige ohne Neuladen.
- Fenster nutzt das vorhandene Desktop-/Touch-Fenstersystem. Werte werden im bestehenden DOM aktualisiert; Fokus und Klickziele bleiben beim Lebens- und Vertragstakt erhalten. Neue Texte liegen in `content/companion-ui.js`, additiv über `content/index.js` exportiert.

Prüfung: `node scripts/companion-check.mjs` startet einen eigenen Server und ein isoliertes Browserprofil. Optional eine lokale URL als Argument. Desktop 2024×900, Touch 390×844 und 844×390; echte Maus-/Touch-Eingaben, Vertragsablauf, fehlende Münzen, Viererlimit, Tastatur, Einzel-/Gruppenbefehle und leere Truppe. Screenshots und `report.json` in `visual-review/companions/`. Der große HUD-Screenshot verwendet JPEG, damit der CDP-Transport des lokalen Node-Treibers nicht an der PNG-Größe abbricht.

Die UI übernimmt die Anzahl anderer Menschen aus der vorhandenen Online-Gruppenansicht für die Anheuerprüfung. Automatisches Entlassen bei späterem Beitritt weiterer Menschen bleibt der bestehende Engine-/Netzauftrag in `docs/backlog/engine.md`; ebenso fremde Begleiter im Netzwerk und eigene Kampfstatistik-Zeilen. Individuelle Söldner-Sprites sind weiterhin Grafikbedarf.

Technischer Ereignishinweis: `Game.emit(type, data)` lässt `data.type` den äußeren Typ überschreiben. Daher berücksichtigt die UI sowohl `companion` als auch die aktuellen Untertypen `hired`, `dismissed`, `expired`, `down`, `revived`, `order`, `stance`. Die periodische Aktualisierung deckt außerdem Vertragszeit und Leben ab.
