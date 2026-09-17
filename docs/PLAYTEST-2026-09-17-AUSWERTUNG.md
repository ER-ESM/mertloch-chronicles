# Playtest-Auswertung — Mertloch Chronicles 0.19.1 (Commit dabf31c) · 2026-09-17

Erster Persona-Lauf nach der Studio-Pipeline. Drei Berichte: [Neuling](PLAYTEST-2026-09-17-neuling.md) · [Kenner](PLAYTEST-2026-09-17-kenner.md) · [Prüfer](PLAYTEST-2026-09-17-pruefer.md). Screenshots lokal unter `visual-review/playtest-2026-09-17/` (nicht versioniert).

## Ergebnis in einem Satz

Das Spiel sagt an jeder Stelle klar, WAS zu tun ist (Neuling 4/5, Kenner 4/5), aber der Kampffluss aus dem Gameplay-Konzept ist auf Stufe 1 noch nicht erlebbar: nach jedem Kill Beute-Dialog, Laufweg, kein Gegner in der Nähe, und zwei Stufe-1-Gegner kosten die Hälfte des Lebens.

## Freigabe-Empfehlung

**FREI** für den Stand `main` 0.19.1. Kein Spielbefund der Stufe „bricht ab":
- Neuling Nr. 1, 2, 10 („bricht ab") sind Werkzeugbefunde (Tastentipp statt gehaltener Taste), nachgewiesen durch den Orchestrator.
- Kenner Nr. 5 („bricht ab", Schaden 45 bis 50 Prozent je Trash-Gegner) ist ein Balancing-Befund; der Spieler kommt weiter (Rast, Brezel). Er sperrt nicht, gehört aber als erster Punkt auf die Entscheidungsliste, weil er Grundsatz 1 des Gameplay-Konzepts direkt widerspricht.

## Bewertung (1–5)

| Frage | Neuling | Kenner | Prüfer |
|---|---|---|---|
| Wusste ich, was zu tun ist? | 4 | 4 | – |
| Wusste ich, was passiert ist? | 3 | 3 | – |
| Wollte ich weiterspielen? | 2 | 2 | – |
| Kam ich ohne Pausen von Gegner zu Gegner? | – | 2 | – |
| Versprechen gehalten / teilweise / gebrochen / nicht prüfbar | – | – | 2 / 5 / 0 / 1 |

Das Erfolgskriterium aus `PITCH.md` (Neuling schafft Hofprobe und drei Gegner ohne Erklärung in unter 15 Minuten) ist **nicht nachgewiesen**: Der Neuling scheiterte am Werkzeug, nicht am Spiel, aber ein Nachweis fehlt damit weiterhin. Wiederholung mit funktionierender Bewegung ist der erste Punkt der nächsten Runde.

## Entscheidungen für die Produktion („stockt" und „wundert sich")

Sortiert nach Wirkung auf den Fluss. Ziel je Zeile: Eintrag in `ENTSCHEIDUNGEN.md` (Design) oder `content/BACKLOG.md` (Umsetzung), oder bewusst „bleibt so".

| Nr | Befund | Quelle | Vorschlag | Ziel |
|---|---|---|---|---|
| 1 | Stufe-1-Dachs nimmt 45 %, Stufe-2-Keiler 50 % Leben; nach zwei Kills bei 19 % | Kenner 5 | Trash-Schaden auf 10 bis 20 % je Kampf; Konterfrühstück/Regeneration im Kampf prüfen | Inhalt (`content/balance.js`, Balance-Bericht) |
| 2 | Nach dem Kill kein Gegner in der Nähe („Kein passendes Ziel"); Auftragsgegner 57 bis 82 m weit | Prüfer 2, Kenner 3/4 | Gegnergruppen 2 bis 3 laut Konzept §2.6 auch im Dorfrand; Wegmarke auf den Pfad | Engine/Welt (Backlog) |
| 3 | Randale-Anzeige steht immer auf 100; Pegel ◆◆◆ voll ohne Verbraucher auf Stufe 1 | Kenner 6, Prüfer 2 | Randale erst anzeigen, wenn ein Kniff sie kostet; Pegel-Anzeige mit „Finisher ab Stufe 3"-Hinweis | UI (Backlog) |
| 4 | Figur läuft nicht zum Nahkampf-Ziel nach („Zu weit entfernt · 7 m") | Kenner 8, Neuling 10 | Auto-Nachlaufen bei Kniff außer Reichweite | Engine (Backlog) |
| 5 | Beute = F + „Alles einpacken" nach jedem Kill | Kenner 7 | F packt alles ein; Dialog nur bei Auswahl | UI (Backlog) |
| 6 | Kein Name/Markierung über der eigenen Figur; Neuling wusste nicht, wer er ist | Neuling 3 | Namensschild oder Ring während der Hofprobe | UI (Backlog) |
| 7 | Karte: Ziel-Reiter vergisst das Ziel; Karte bleibt beim „Weg einschlagen" offen; zwei Knöpfe für ein Fenster | Neuling 7, 8, Lauf 1 | Ziel persistent; Fenster schließt beim Losgehen; einen Kartenknopf streichen | UI (Backlog) |
| 8 | Hofprobe: Ring hinter dem Gesprächsfenster; Schritt 3/8 beim Autolauf übersprungen; Ausweich-Kreis erst nach 6 s; F trifft Ida statt Kiste | Neuling 4, 9, Kenner 1, 2 | Gesprächsfenster nicht über dem Ziel; Schritte einzeln bestätigen; Kreis sofort; F priorisiert Auftragsobjekt | UI/Engine (Backlog) |
| 9 | Gegenstandsfenster öffnet als zweites Fenster neben dem Clanbuch | Prüfer 1 | Detailbereich im Rucksack-Reiter | UI (Backlog); Menü-Zielbild ergänzen |
| 10 | Zwei Wert-Talente ohne Auslöser (Solider Bierbauch, Dienstjacke) | Prüfer 4 | Auslöser + Folge formulieren oder streichen (Konzept §2.4) | Inhalt (`content/talents.js`) |
| 11 | Kniff-Tooltip mit acht Sätzen inkl. Formel | Prüfer 6 | Kurzsatz + Zahlen; Formel in Hilfe | UI/Inhalt |
| 12 | Handy: Steuerkreuz statt Joystick, Kniff-Leiste klein und unten | Prüfer 8 | **Erst Befund-Herkunft klären:** Touch-Modus greift eventuell nur bei Touch-Ereignissen, nicht bei Fenstergröße 390×844 | UI prüft im echten Touch-Emulator |
| 13 | Sprungrichtung „Ab durch die Hecke" nicht nachvollziehbar | Neuling 5 | Sprung in Blick-/Laufrichtung, Richtung anzeigen | Engine (Backlog) |
| 14 | Hilfe „?" wiederholt den Seitenkasten wortgleich | Neuling 6 | Zweite Stufe der Hilfe mit konkretem Tipp | Inhalt/UI |

Nicht prüfbar geblieben: Versprechen 5 (Vier-Tasten-Rotation ab Stufe 4). Keine Persona kam über Stufe 1 hinaus. Für die nächste Runde: Prüfer-Lauf mit einem vorbereiteten Spielstand auf Stufe 4 (Orchestrator legt ihn per Arena/Admin an, die Persona weiß nichts davon).

## Werkzeug-Erkenntnisse (in PIPELINE.md §Playtest übernommen)

1. **Bewegung braucht gehaltene Tasten.** `browser_press_key` bewegt die Figur nicht, `browser_click` trifft nur die Spielfeldmitte. Die drei Persona-Definitionen haben jetzt einen Pflicht-Abschnitt mit zwei `run_code`-Snippets (Taste halten, Klick an Bildposition). Neue Agenten-Definitionen werden erst beim nächsten Sitzungsstart geladen; bis dahin Persona-Text in einen `general-purpose`-Agenten einbetten.
2. **Spielstand wird beim Entladen zurückgeschrieben.** Nach `localStorage.clear()` und Neuladen war der alte Stand wieder da. Reihenfolge, die funktioniert: Speicher leeren, neu laden, sofort erneut leeren, neu laden, Startbild per Screenshot prüfen (Stufe 1, Hofprobe 1/8).
3. **Screenshots mit absolutem Pfad** speichern; relative Pfade landen in `D:\Dev\visual-review\`, nicht im Repo.
4. Ein Persona-Lauf kostet 90 bis 130 k Token und 4 bis 6 Minuten. Drei Personas seriell: rund 20 Minuten mit Vorbereitung.
