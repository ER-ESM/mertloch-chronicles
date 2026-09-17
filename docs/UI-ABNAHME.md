# UI-Abnahme — Mertloch Chronicles (verbindlich ab 2026-09-17)

Jedes UI-Element (Fenster, Reiter, Karte, Knopf, Leiste, Tooltip, Einblendung) wird vor dem Merge nach dieser Liste abgenommen. Ziel: weg vom gestochen scharfen Web-Look hin zu einer Oberfläche, die aus derselben Hand stammt wie die Spielwelt (Maifeld-Detailpixel, `ART-DIRECTION.md`). Die Stil-Definition steht in [ui-stile-2026-09-17/index.html](ui-stile-2026-09-17/index.html) (drei Mockups; der gewählte Stil wird hier eingetragen).

**Gewählter Stil:** ☐ A Kneipentafel ☐ B Fachwerk & Honigpapier ☐ C Bierdeckel — Entscheidung in `ENTSCHEIDUNGEN.md`.

## Anlass

„Figur aussuchen" (Klamottenwahl, Clanbuch → Figur) am 2026-09-17: Karten unterschiedlich hoch, Text abgeschnitten („Tank · Tresenbr…"), horizontales Scrollen, drei verschiedene Knopfbreiten, der ausgewählte Zustand als ausgegrauter Knopf „Ist am Start". Ursache: `.clan-card` wird in fünf Dateien überschrieben (`clan.css`, `hearth.css`, `maifeld.css`, `panel-pages.css`, `popup-ui.css`), jede mit eigenen Farben, Rastern und Mindesthöhen. Kein Element darf mehr als **eine** Stildefinition haben.

## A · Ein Stil, eine Quelle

| Nr | Prüfung | Bestanden wenn |
|---|---|---|
| A1 | Eine Stildatei je Baustein | Farben, Rahmen, Schrift, Abstände eines Bausteins stehen in genau einer CSS-Datei; Themen-Dateien (`hearth.css`, `maifeld.css`, `comic-theme.css`) überschreiben keine Bausteine mehr |
| A2 | Nur Tokens | Jede Farbe kommt aus `:root`-Variablen der Stil-Definition; keine Hex-Werte in Bausteinregeln |
| A3 | Kein `!important` | Ausnahme: `[hidden]` |
| A4 | Ein Knopf-Set | Genau drei Knopfarten: Primär (Gold), Sekundär (Rahmen), Gefahr. Zustand „aktuell/gewählt" ist ein Abzeichen, kein ausgegrauter Knopf |

## B · Pixel statt Web

| Nr | Prüfung | Bestanden wenn |
|---|---|---|
| B1 | Kanten | Kein `border-radius` außer 0; Rahmen in 2-px-Schritten, gestuft statt gerundet; kein `blur`, kein weicher Schatten (nur versetzter harter Schatten, 2 px) |
| B2 | Pixelraster | Icons und Sprites nativ oder ganzzahlig vergrößert, `image-rendering: pixelated`; kein Sprite in halber Größe |
| B3 | Schrift | Überschriften in der Pixel-Display-Schrift der Stil-Definition, Fließtext in der Lese-Schrift; Größen aus der Skala (11/13/16/20/28), keine Zwischenwerte |
| B4 | Farben | Nur die Ankerfarben aus `ART-DIRECTION.md` und ihre definierten Abstufungen; Gold nur für Primäraktion und Auswahl, Korallrot nur für Gefahr/Schaden |
| B5 | Flächen | Höchstens zwei Flächenstufen je Fenster (Grund, Karte); keine Verläufe mit mehr als zwei Stufen, kein Glas/Transparenz auf Text |

## C · Raster und Lesbarkeit

| Nr | Prüfung | Bestanden wenn |
|---|---|---|
| C1 | Kein Abschneiden | Jeder Text vollständig sichtbar oder bewusst gekürzt („…" mit Tooltip); Eyebrows umbrechen |
| C2 | Gleiche Kacheln | Wiederholte Karten haben gleiche Höhe, gleiche Innenabstände, Knöpfe auf derselben Grundlinie (`grid` + `gap`, kein Einzel-Margin) |
| C3 | Kein Seitenscroll | Fenster passt bei 2024×900 und 390×844 ohne horizontales Scrollen; Spalten brechen auf eine um |
| C4 | Ein Fenster | Clanbuch bleibt EIN Fenster mit Reitern (Menü-Zielbild); Details als Bereich im Reiter, nie als zweites Fenster |
| C5 | Kontrast | Text auf Fläche mindestens 4,5:1; Ortsnamen und Werte auf Karte mit Kontur oder Plakette |
| C6 | Touch | Zielgröße ≥ 44 px; keine „Überfahren"/„Rechtsklick"-Hinweise im Touch-Modus |

## D · Verhalten

| Nr | Prüfung | Bestanden wenn |
|---|---|---|
| D1 | Zustände | Jeder Knopf hat Ruhe, Hover, Aktiv, Fokus (sichtbarer Rahmen), Deaktiviert; Deaktiviert erklärt sich (Tooltip oder Zeile darunter) |
| D2 | Rückmeldung | Jede schreibende Aktion zeigt ihr Ergebnis (Einblendung, Zustandswechsel), Wortlaut aus `content/` |
| D3 | Reduced Motion | `prefers-reduced-motion` schaltet Animation ab |
| D4 | Tastatur | Reiter und Karten per Tab erreichbar, Esc schließt |

## Ablauf der Abnahme

1. UI-Rolle baut nach der Stil-Definition, füllt diese Liste als Tabelle (Nr · bestanden/nicht · Beleg) in `visual-review/<Datum>/ABNAHME.md`.
2. Screenshots Desktop 2024×900 und Handy 390×844 je Bildschirm.
3. Nicht bestandene Punkte sperren den Merge, bis sie behoben oder in `ENTSCHEIDUNGEN.md` bewusst ausgenommen sind.
4. Playtest-Personas prüfen danach nur Bedienung, nicht Optik.

## Erster Prüffall: Figur aussuchen (Stand 2026-09-17, vor dem Umbau)

| Nr | Ergebnis | Beleg |
|---|---|---|
| A1 | nicht bestanden | fünf CSS-Dateien definieren `.clan-card` |
| A4 | nicht bestanden | „Ist am Start" als deaktivierter Knopf; drei Knopfbreiten |
| B1 | nicht bestanden | weiche Schatten, Verläufe, `drop-shadow` am Sprite |
| C1 | nicht bestanden | „Tank · Tresenbr", „Klo-Kevin", „Persönlichkeit & Spielwe" abgeschnitten |
| C2 | nicht bestanden | Kartenhöhen und Knopf-Grundlinien verschieden |
| C3 | nicht bestanden | horizontales Scrollen im Fenster |

Umsetzung: `docs/backlog/ui.md` („Figur aussuchen nach UI-Abnahme neu bauen").
