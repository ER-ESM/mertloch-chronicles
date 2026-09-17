# Entscheidungen — Mertloch Chronicles

Protokoll der Produktion. Jede Entscheidung, die Design, Schema, Rollen oder Ablauf ändert, steht hier mit Begründung und verworfener Alternative. Neueste zuerst. Was hier nicht steht, ist nicht entschieden.

| Datum | Entscheidung | Begründung | Verworfen |
|---|---|---|---|
| 2026-09-17 | Mertloch folgt der studio-weiten Pipeline (`eresm-github-migration/docs/spielentwicklung/PIPELINE.md`): Rollen nur mit Artefakt und Gate, Playtest durch Personas ohne Spielwissen vor jedem Release, dieses Protokoll. `docs/PIPELINE.md` bleibt die Ausprägung. | Rollen ohne Artefakt erzeugen Overhead; wer das Spiel baut, findet keine Bedienhänger mehr. | Studio-Organigramm mit allen Rollen; generisches Framework auf Vorrat. |
| 2026-09-17 | Gemeinsame Engine-Bausteine mit TicketTower erst, wenn TicketTower sie braucht und sie hier laufen (Inhaltsloader mit Schema-Prüfung, Spielstand-Migration, Ereignis-Bus, Debug-Leiste). Kampf, Talente, Weltkarte nie. | Engine ohne zweites Spiel ist eine Engine ohne Spiel. | Framework-Repo jetzt anlegen. |
| 2026-09-17 | Menüs: ein Fenster „Clanbuch" mit sechs Reitern (Figur, Rucksack, Kniffe, Aufträge, Karte, Hilfe). Keine Seiten, kein Minimieren, kein Einklappen, nichts überlappt. | 19 Fenstertypen und drei Navigationsebenen übereinander; der Spieler verlor den Überblick (`MENUE-BEWERTUNG-2026-09-17.md`). | Fenster behalten und nur aufräumen; einklappbare Fenster. |
| 2026-09-17 | Kampffluss nach `GAMEPLAY-KONZEPT-FLUSS.md`: Kill gibt Schwung, vier Tasten ab Stufe 4 (1·1·2·1·3 plus Antwort), Procs mit 6-Sekunden-Fenster, Talente sind Regeln statt Prozente, Gegner in Gruppen, keine Warteressource. Trainingsarena als Admin-Werkzeug. | Gemessene Pausen von 3 bis 8 Sekunden nach jedem Kill und 16 bis 24 Sekunden Laufweg; 60 von 90 Talenten waren reine Zahlen. | Rotation ab Stufe 6 belassen; Talente als Prozentwerte. |
| 2026-09-17 | Weltmaßstab über registrierte, menschengroße Türöffnungen (`MASSSTAB-2026-09-17.md`). | Figuren und Häuser passten nicht zueinander. | Maßstab je Asset von Hand. |
| 2026-09-16 | Verbindlicher Grafikstil des Hauptspiels: **Maifeld-Detailpixel** (vier Blickrichtungen, sichtbare Ausrüstung, sieben Tierarten). | Von drei Prototypen (Dorfcomic, Maifeld-Detailpixel, Krawall-Karikatur) der mit eigener Sprache und lesbarer Ausrüstung. | Dorfcomic; Krawall-Karikatur. |
| 2026-09-13 | Heilerin heißt Aperol-Anni (vorher Bass-Bärbel). | Sprechname mit klarerer Figur und Getränk-Bezug wie Dosen-Dieter. | Bass-Bärbel. |
| 2026-09-13 | Anti-Slop-Guideline mit zehn prüfbaren Regeln und Scorecard je Bildschirm (`VISUELLE-BEWERTUNG-2026-09-13.md`). Ziel je Bildschirm mindestens 4 von 5. | Bildschirme sahen generiert statt entschieden aus (Gesamt 3,0 in 0.13). | Optik nach Gefühl. |
| 2026-09-12 | Pipeline mit festen Rollen Inhalt, Engine, UI, Grafik, Welt; je Rolle Branch und Worktree; Übergabe nur über Dateien; Merge nach `main` nur Fast-Forward nach grünem `npm test`. Reihenfolge Inhalt vor Engine vor UI vor Grafik. | Zwei Sitzungen und eine Bild-KI arbeiten parallel im selben Repo. | Zuruf; Merge-Commits. |
| 2026-09-12 | Autoangriff im Waffentempo, Zauber mit Stehenbleiben, 16 Ausrüstungsplätze mit echter Waffenwahl, Touch-Modus mit Joystick und sechs Skillbuttons, installierbare Web-App. | Handy ist gleichberechtigte Plattform; Ausrüstung soll Spielweise ändern, nicht nur Zahlen. | Desktop-only; Ausrüstung als reine Werteliste. |
| 2026-09-11 | Inhaltsschicht `content/` mit Schema und `content:check`; Engine liest nur über `content/index.js`; eigener Inhalts-Agent. IDs sind Speicherschlüssel und werden nie umbenannt oder gelöscht. | Inhalt soll im Hintergrund wachsen, während UI und Grafik parallel laufen; Spielstände dürfen nicht brechen. | Inhalte in den Engine-Modulen belassen. |
| 2026-09-11 | Drei Clan-Archetypen (Tank, Heilerin, Fernkampf), universelle Werte Wumms, Taktgefühl, Bastelgrips für jede Klasse, drei Spezialisierungen je Figur. | Jeder Wert soll jeder Klasse helfen; keine toten Stats. | Klassengebundene Werte. |
| 2026-09-11 | Veröffentlichung über GitHub Pages per Actions auf `main`; Spielstand im Browserspeicher; kein Server, kein Konto, kein Mehrspieler. | Ohne Installation und ohne Betriebskosten spielbar. | Eigener Server mit Konten. |

## Offen (noch nicht entschieden)

| Frage | Optionen | Empfehlung | Seit |
|---|---|---|---|
| Kapitel 2 und 3 aktivieren (Lager, Kapitelumschalter) | jetzt; nach dem Fluss-Playtest | nach dem Playtest, damit der Fluss zuerst stimmt | 2026-09-11 |
| Händler und Handwerk | ja; nein; später | später, erst wenn Beute ohne Händler langweilig wird (Playtest-Befund) | 2026-09-11 |
| Geräteübergreifender Spielstand | nie; Export/Import-Datei; Konto | Export/Import-Datei, kein Konto | 2026-09-12 |
