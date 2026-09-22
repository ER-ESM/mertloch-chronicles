# Prüfbericht: Berufe und gemeinsame Veröffentlichung mit Mounts

22.09.2026 · Ausgangspunkt `9f94f43` (Mounts), davor `origin/main` auf `e2c5cc8`.

**673/673 Node-Tests bestanden.** `npm run build` mit Quellen-Wächter und Offline-Manifest erfolgreich; `npm run content:check` erfolgreich (56 Tests). Balance-Bericht und Grafik-Briefing wurden mit den vorhandenen Generatoren aktualisiert.

| Prüfung | Ergebnis |
|---|---|
| Berufsregeln und Transaktionen | Zwei Plätze pro Held, Lerngebühr, Verlernen, Fertigkeitsschwellen und graue Rezepte; alle sechs Ergebnisse; Rucksack-Atomarität, Questreservierung und Abbrüche geprüft |
| Gemeinsame Ressourcen | Zwei echte Konten ernten dieselben zwei Schrottfundstellen persönlich; zweiter Ernteversuch bleibt gesperrt; gemeinsamer Zustand und individuelle Materialien geprüft |
| Server-Persistenz | Wiederholte Abschluss-ID liefert dasselbe Ergebnis; veralteter Save mit zukünftigem Zeitstempel wird abgewiesen; Journal repariert absichtlich zurückgesetzten Cloud-Save nach Neustart |
| Ausfälle | Nicht erreichbarer Berufsserver sperrt Online-Berufe; verlorene Abschlussantwort und lokaler Speicherfehler halten die Abschluss-Sperre bis zum Wiederholungsversuch; identische ID verhindert Doppelvergabe |
| Herstellungsablauf im Browser | Lehrer anlaufen, zwei Berufe lernen, sammeln, Dosenklinge herstellen; Bewegung unterbricht ohne Materialverlust; Neuladen und Serverneustart erhalten Fertigkeiten und Ergebnis |
| Hausbrauerei im Browser | Berufe beim Lehrer verlernen, Kräuter/Brauen lernen, Feldkraut sammeln, beide Zutaten im begehbaren Kiosk kaufen, Kontersud herstellen |
| Solo und Bedienung | Lernen/Sammeln, lokaler Save, wiederholtes F am geöffneten Stationsfenster, Absteigen beim Sammeln, gesperrtes Aufsteigen während der Arbeit, Tastaturbedienung ohne versehentlichen Kampfbefehl |
| Oberfläche | 1440×900 und 2024×900; scrollbare Rezepte, gemeinsame Item-Symbole; Werkstätten und Fundstellen in der Welt visuell geprüft |
| Mounts | Erwerb aller drei Modelle, Auswahl/Aktionsleiste, Bewegung/Absteigen, Neuladen; alle Körperformen und vier Richtungen; Darstellung, Kleidung und Wiederverbindung mit zwei Konten bestanden |
| Bestehende UI | HUD-Gesamtskript bestanden, einschließlich Esc-Menü, Tastatur, Editor, Chat, Meter und vorhandener Touch-Layouts; Kiosk-Skript am Desktop bestanden |

Reproduzierbare Skripte: `scripts/profession-check.mjs`, `scripts/profession-solo-check.mjs`, `scripts/mount-check.mjs`, `scripts/mount-art-check.mjs`, `scripts/mount-online-check.mjs`, `scripts/hud-check.mjs`, `scripts/shop-check.mjs --desktop-only`. Screenshots und JSON-Berichte liegen lokal in `visual-review/professions/` beziehungsweise den jeweiligen Review-Unterordnern.

Im neuen Berufsfenster wurde Mobile nicht gesondert abgenommen, entsprechend der Nutzervorgabe. Separate unabhängige Neuling-/Kenner-/Prüfer-Sitzungen wurden nicht durchgeführt; die dokumentierten Perspektiven werden hier durch automatisierte Funktionsprüfungen und Sichtprüfung des Implementierers abgedeckt. Solo-Wiederherstellung wird im Regeltest mit neuem Game aus dem gespeicherten Zustand geprüft; der echte Browser-Neuladetest betrifft den Online-Helden. Ein zusätzlicher Solo-Browser-Neuladeversuch blieb wegen Abbruch der CDP-Verbindung unbestätigt und wird nicht als bestandene Prüfung gezählt.

Gefundene und behobene Probleme:

- Explizite Standard-Straßenbreite änderte bisher die Hauptstraßenbreite, ohne die Welt-ID zu ändern. Client und Server platzieren die Berufsobjekte jetzt bei gleichen Weltoptionen identisch.
- Berufsfenster blieb beim wiederholten Öffnen desselben Fensters leer; Rendercache wird beim Öffnen zurückgesetzt.
- Lehrstation hinter großer Baumkrone: Platzierung berücksichtigt jetzt die sichtbare Krone großzügiger.
- Rezeptbilder nutzen denselben Auflöser wie der Rucksack statt generischer Platzhalter.
- Die bisherige Chat-Ziehprüfung lief in die untere Bildschirmbegrenzung (118 statt erwarteter >120 px). Sie prüft jetzt eine exakte Bewegung nach oben mit freiem Platz; die Chat-Implementierung blieb unverändert.
- Kiosk- und Menü-Erwartungen berücksichtigen die neuen Zutaten, Stationsmarker und den Berufseintrag.

Die neue GitHub-Prüfung enthält auch Berufe und Mounts. Ein Push nach `main` ist keine Bestätigung, dass der eigene Testspielserver aktualisiert wurde: dort Client und Node-Spielserver (API 7) zusammen ausliefern und den Node-Dienst neu starten.
