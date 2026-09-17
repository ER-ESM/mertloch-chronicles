# Menü-Bewertung · 2026-09-17

Stand `main` 0.19 (Commit 57485dd). Rundgang durch alle Fenster am Desktop (2024×900) und mobil (390×844), elf Screenshots lokal in `visual-review/round-menu-1/`. Vorgabe des Chefs: **Menüs einfacher, besser zu navigieren, kein Einklappen.**

## Befund in einem Satz

Das Spiel hat 19 Fenstertypen, drei Navigationsebenen übereinander (Hub-Seiten → Fenster → Reiter → Seiten) und lässt beliebig viele Fenster gleichzeitig offen. Jedes einzelne Fenster ist inzwischen ordentlich; die **Struktur dazwischen** ist das Problem.

## Was heute passiert

| Beobachtung | Beleg | Wirkung auf den Spieler |
|---|---|---|
| **Fünf Fenster gleichzeitig offen**, überlappend, Charakter hinter Talenten hinter Skillbuch | mn-02 (Desktop), mn-11 (mobil: Skillbuch über Talenten) | Man verliert den Überblick, welches Fenster gerade zählt; Schließen mit Esc trifft „das oberste“, das man nicht immer sieht |
| **Spielmenü-Hub mit 12 Knöpfen** in zwei Spalten, darunter „Fenster schließen“, „Als App installieren“, „Admin · Neustart prüfen“ gleichrangig neben „Rucksack“ | mn-01 | Alltagsfunktionen und Einmal-Funktionen mischen sich; kein Ort fällt auf |
| **Hub mobil paginiert: Seite 1 zeigt nur Überschrift**, alle Knöpfe liegen auf Seite 2 hinter „›“ | mn-05 | Der Menüknopf führt auf eine leere Seite. Zwei Tipps, bevor irgendetwas passiert |
| **Drei Navigationsebenen in einem Fenster:** Reiter (Ausrüstung · Figur · Werte · Verwalten) und darunter Seiten „1 / 2“ mit ‹ › | mn-06, mn-07, mn-11 | Der Rucksack mit 2 Gegenständen hat zwei Seiten. Man weiß nie, ob der Inhalt „rechts“ oder „im nächsten Reiter“ liegt |
| **Minimieren „−“ an jedem Fenster**, plus Titelleisten-Hilfe „?“ bei Talenten | mn-02, mn-10 | Minimierte Fenster sammeln sich unsichtbar; der Chef will das Einklappen nicht |
| **Querverweise als Knöpfe im Inhalt:** „Charakter C“ im Rucksack, „Talente & Spezialisierung“ im Charakter, „Eigene Spezialisierungen [N]“ im Skillbuch | mn-07, Runde 2 | Jedes Fenster ist ein kleiner Hub; man springt kreuz und quer statt in einer Ordnung |
| **Tastenkürzel doppelt belegt mit Menüpunkten:** C, K, I, J, N, M, H, P/Esc + Icon-Leiste unten rechts (K C J M N) ohne Beschriftung + Hub | mn-02 unten rechts | Drei Wege zu jedem Fenster, keiner davon ist „der“ Weg |
| **Auftragstaste J zeigt während der Hofprobe den Ida-Dialog** statt des Auftragsbuchs | mn-08 | Überrascht; Tutorial überschreibt ein Grundmenü |
| **Talentgraph mobil:** Schwellen-Beschriftungen („3 verteilte Punkte“) liegen über den Knoten | mn-10 | Unlesbar, wirkt kaputt |
| **Fensterbreite mobil:** jedes Fenster deckt die Welt zu 60 % ab, Steuerkreuz und Aktionsknöpfe bleiben frei (gut) | mn-06 bis mn-11 | Positiv: Bedienung bleibt möglich |

Gut gelöst und als Vorbild zu behalten: Gespräch mit Porträt (mn-08), Revierkarte mit Reitern Karte · Orte · Ziel · Legende (mn-09), Kampfhilfe mit drei Reitern statt Textwand (mn-03), HUD-Kasten „Hofprobe 1/8“ mit nächstem Schritt.

## Zielbild: ein Buch statt vieler Fenster

**Ein einziges Menüfenster („Clanbuch“) mit sechs Reitern.** Es gibt genau einen Ort für alles außer Gespräch, Beute und Tod. Nichts überlappt, nichts wird minimiert, nichts hat Seiten.

```
┌ Clanbuch ─────────────────────────────────────────────────  ✕ ┐
│  Figur   Rucksack   Kniffe   Aufträge   Karte   Hilfe            │
├───────────────────────────────────────────────────────────────┤
│  (Inhalt des Reiters, scrollt vertikal, keine Seiten)            │
└───────────────────────────────────────────────────────────────┘
```

| Reiter | Enthält heute | Zusammengelegt aus |
|---|---|---|
| **Figur** | Porträt, Stufe, Ausrüstungsplätze, Werte (eine Liste), Spezialisierung und Talentgraph, Figur wechseln (nur am Treffpunkt aktiv) | Charakter, Clan-Talente, Die Bande |
| **Rucksack** | 24 Plätze, Suche, Sortieren, Pfandmarken; Gegenstand antippen → Werte und Aktionen im selben Reiter rechts/unten | Rucksack, Gegenstand, Details |
| **Kniffe** | Skillbuch-Raster und Aktionsleiste **in einer Ansicht**: oben die gelernten Kniffe, unten die zehn Plätze; antippen, dann Platz antippen | Skillbuch (Kniffe + Belegung), Touchbuttons |
| **Aufträge** | Hauptgeschichte oben, Nebenaufträge darunter, Filter als Chips; „Auf der Karte zeigen“ springt in den Reiter Karte | Auftragsbuch |
| **Karte** | unverändert (Vorbild) | Revierkarte |
| **Hilfe** | Kampfhilfe (drei Abschnitte), Steuerung, Ton, Vollbild, Als App installieren, Admin-Neustart ganz unten | Kampfhilfe, Steuerung & Touchbuttons, Poo-Tang als App, Admin-Werkzeug, Spielmenü |

**Regeln für das Clanbuch**

1. **Ein Fenster.** Öffnen eines Reiters ersetzt den vorherigen. Es gibt kein zweites Fenster, keine Stapel, kein „−“.
2. **Keine Seiten.** Inhalt scrollt vertikal. Der Rucksack zeigt 24 Plätze auf einmal (mobil 4×6).
3. **Eine Taste, ein Reiter.** `C` Figur, `I` Rucksack, `K` Kniffe, `J` Aufträge, `M` Karte, `H` Hilfe, `Esc` schließt. Dieselbe Taste noch einmal schließt. `N` und `P` entfallen (Talente liegen in Figur, das Spielmenü in Hilfe).
4. **Ein Knopf am Bildschirm.** Mobil öffnet „Menü“ direkt den zuletzt genutzten Reiter, nie eine leere Seite. Desktop: die Icon-Leiste unten rechts wird die Reiterleiste des Clanbuchs (sechs beschriftete Icons), die schwebende Topbar entfällt im Vollbild.
5. **Querverweise nur als Reiterwechsel.** „Charakter C“-Knöpfe im Inhalt entfallen; wer im Rucksack einen Gegenstand anlegt, bleibt im Rucksack und sieht das Ergebnis dort.
6. **Gespräch, Beute, Tod, Anlagenprüfung bleiben eigene Overlays**, weil sie an einem Ort in der Welt hängen. Sie schließen sich mit `F`/`Esc` und öffnen nie das Clanbuch.
7. **Tutorial überschreibt kein Grundmenü.** Die Hofprobe lebt im HUD-Kasten und im Gespräch mit Ida; `J` zeigt immer die Aufträge.
8. **Mobil = Desktop, nur schmaler.** Reiterleiste oben fest, Inhalt scrollt, Steuerkreuz und Aktionsknöpfe bleiben frei. Talentgraph mobil zweispaltig mit Schwellen als Trennlinie, nicht als Text über Knoten.

## Bewertung heute → Ziel

| Kriterium | Heute | Ziel |
|---|---:|---:|
| Fenstertypen | 19 | 1 Buch + 4 Overlays |
| Navigationsebenen | 3 (Hub-Seiten, Fenster, Reiter/Seiten) | 1 (Reiter) |
| Schritte vom Spiel zur Aktionsleisten-Belegung mobil | Menü › Seite 2 › Skillbuch › Reiter Belegung › Platz › Reiter Kniffe › Kniff = 7 | Menü › Kniff › Platz = 3 |
| Schritte zum Talentpunkt mobil | Menü › › › Talente › Knoten = 4, oder Charakter › Verwalten › Talente › Knoten | Figur › Knoten = 2 |
| Gleichzeitig offene Fenster | unbegrenzt | 1 |
| Tasten für Menüs | 9 (C K I J N M H P Esc) | 7 (C I K J M H Esc) |
| Note Übersichtlichkeit | 2 / 5 | 4 / 5 (Ziel) |
| Note Navigation | 2 / 5 | 4 / 5 (Ziel) |

## Umsetzung in Reihenfolge

Jeder Schritt ist einzeln merge-fähig und lässt das Spiel spielbar.

1. **Popup-Schicht auf „ein Fenster“ umstellen** (`popup-windows.js`): `open(id)` schließt das vorherige Buchfenster; `−` entfernen; Positionen nicht mehr speichern. Overlays (dialog, loot, death, activity) bleiben ausgenommen. Prüfung: kein Zustand mit zwei Buchfenstern.
2. **Seiten abschaffen** (`popup-controls.js`, `rpg-ui.js`): Pagination ‹ 1/2 › durch vertikales Scrollen ersetzen; Rucksack 24 Plätze auf einmal. Prüfung: kein „1 / 2“ mehr im Spiel.
3. **Reiterleiste als Rahmen** (`popup-windows.js`, `popup-ui.css`): sechs Reiter im Fensterkopf, aktiver Reiter markiert; Fensterinhalte der bisherigen Typen werden Reiterinhalte. Tasten auf Reiter mappen, `N`/`P` entfernen. Icon-Leiste unten rechts = Reiterleiste, beschriftet.
4. **Zusammenlegen:** Talente und Bande in Figur (Abschnitte untereinander, kein Reiter-im-Reiter); Belegung in Kniffe (eine Ansicht); Steuerung/App/Admin/Ton/Vollbild in Hilfe.
5. **Querverweis-Knöpfe entfernen**, Hofprobe von `J` lösen.
6. **Mobil nachziehen:** Reiterleiste fest oben, Talentgraph zweispaltig, Schwellen als Linien.
7. **Browsertest** als `scripts/menu-check.mjs`: alle sechs Reiter Desktop + mobil, Tastenkürzel, Esc, Schrittzählung; Screenshots nach `visual-review/round-menu-<n>/`.

## Was nicht angefasst wird

Inhalt der Reiter (Werte, Talentgraph, Kartenlogik, Gesprächsporträts) bleibt. Diese Runde ordnet nur, sie gestaltet nicht neu. Grafikbedarf: sechs Reiter-Icons 24×24 (Figur, Rucksack, Kniffe, Aufträge, Karte, Hilfe) → `docs/GRAFIK-BEDARF.md`.
