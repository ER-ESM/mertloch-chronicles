# Optimierung Runde 4, Teil C „Handy & Nebenfenster“ · 24.09.2026

Eingang: Grafikbericht R4 (`review-grafik-r4.md`, Zielbild 3, Befunde 5, 7, 8, 9, 11, 12; Teil A übernimmt ihn ins Repo).
Vorbild WoW: Symbole und Tooltips statt Fließtext, nirgends scrollen, kompakt. Teil A (Weltkarte) und Teil B (Welt, Namensschilder, Chat …) liefen
parallel und sind hier nicht berührt; in `renderer.js` ist nur die Farbquelle des Namensschilds getauscht (zwei Zeilen, siehe Nr. 5).

Neue Dateien: `fenster-r4c.css` (zuletzt geladen), `unit-colors.js` (Farblogik Namensschild/Zielrahmen), `tests/unit-colors.test.mjs`,
Prüfskript `scripts/optimierung-r4c-check.mjs` (CDP 9545, Server 4345, über `CDP_PORT`/`SERVER_PORT` änderbar; Bilder in
`visual-review/optimierung-r4c/check/`, lokal, nicht im Repo).

## Umgesetzt

| Nr | Was | Beleg (vorher → nachher) |
|---|---|---|
| 1 | **Spielmenü auf 320 px.** Hochkant ist das Spielmenü modal: Es darf über die Touch-Steuerung reichen (`popup-windows.js`, Steuerung zählt für das Menü nicht als Hindernis), Joystick, Kniffe und Knöpfe ruhen, solange es offen ist (`fenster-r4c.css`). Auf Schirmen ≤ 700 px Höhe stehen die zehn Fensterkacheln als 5 × 2 Symbole ohne Wort (Name als `aria-label`). Auf Schirmen ≤ 600 px Höhe (iPhone SE) gilt „modal bis zur Unterkante“ für jedes Fenster, sonst blieben Figur und Talente ≈ 150 px hoch. | 320×568: Fenster 296×283, Inhalt 397/223 bei `overflow:hidden`, sechs Einträge unerreichbar → Fenster 296×394, Inhalt 334/334, alle 17 Einträge per `elementFromPoint` erreichbar, „Zurück zum Spiel“ schließt per Tipp; auch mit 20 px Statusleiste. `r4c-10-menue-320.jpg` |
| 2 | **Hochkant: kein Rahmen-Geist.** Solange ein Fenster offen ist, ist der Spielerrahmen verborgen (`visibility:hidden`); die Fenster beginnen dafür 14 statt 28 px unter der Safe Area (+14 px Höhe für jedes Hochkant-Fenster). Quer bleibt der Rahmen neben dem Fenster. | 16-px-Streifen über jedem Fenster (`92-handy-hoch-*.jpg`) → Rahmen verborgen, nach dem Schließen wieder da (r4c-check 2–4) |
| 3 | **Handy-Figur.** Puppenplätze im festen 52-px-Schritt (44 + 8) statt 0/20/…/80 % der Puppenhöhe – der Abstand hängt nicht mehr an der Höhe. Hochkant passen sieben Plätze mit 8 px nicht in eine Zeile (356 > 342 px): Ringe und Glücksbringer stehen als zweite Spalte rechts, versetzt zu Hals/Brust/Hände/Beine (WoW-Randspalten), unten nur die Waffenzeile; die Puppe wächst auf bis zu 272 px. Quer: Lebenszahl ohne „/ Höchstwert“ (steht im Tooltip). **Talente**: Brett 264 px, fünf Reihen im 52-px-Schritt; quer beginnt der Baum 8 px unter der Titelzeile und nutzt die volle Körperhöhe; auf 341–370 px breiten Hochkant-Schirmen stehen Wappen und Pfade neben dem Baum. | Abstände an der Figur hoch/quer/klein 5/5/3 px → ≥ 8 px; Talente quer 7 px → 8 px. **Nebenbefund behoben:** Talente liefen mit Safe Areas über (hoch 432/406, klein 488/314, quer 285/265 – Pfadreiter und Punkte unerreichbar) → 396/396, 303/303, 265/265 |
| 4 | **Rucksack-Kopf bei 360 px** 44 × 44 statt 40 × 40 (passt mit 9 px Abstand in eine Zeile); auf ≤ 340 px rückt die Lupe in eine zweite Zeile. | 6 Tipp-Ziele < 44 px → 0 |
| 5 | **Zielrahmen nach WoW.** Die Stufe ist eine Plakette unten mittig am Porträt (Spiegel des Spielerrahmens, Jersey 16) in Schwierigkeitsfarbe: grau ≤ −5, grün −3…−4, gelb ±2, orange +3…+4, rot ≥ +5 gegenüber der eigenen Stufe; der Tooltip des Namens nennt sie („Stufe 2 (kaum der Rede wert)“). Lebensbalken und Namensschild lesen dieselbe Farblogik aus `unit-colors.js` (feindlich rot, neutral gelb, gereizt = feindlich) – `renderer.js` hat keine eigene Kopie mehr. Der Name steht allein in der Zeile. | Freier Ring zwischen Name und Porträt, Balken orange/Schild rot → `r4c-30-zielrahmen-grey.jpg`, `…-red.jpg`; Farben gegen `DIFFICULTY_COLORS`/`REACTION_COLORS` gemessen |
| 6 | **Kampfstatistik im Fensterstil** (`meter-ui.js`). Titelzeile: Balkendiagramm-Symbol, „KAMPFSTATISTIK“ in der Fensterschrift, Schaden (gekreuzte Schwerter) und Heilung (Plus) als 28-px-Symbolreiter mit Tooltip, Optionen als Zahnrad, ×. Auswahlfeld im Spielstil (aus 3b). Fuß nur noch die Kampfdauer mit Uhr; „Abgeschlossen · Pfandkeiler“ steht im Tooltip der Dauer. Leerzustand: ausgegrautes Symbol mit Tooltip statt Satz. | Textreiter „SCHADEN/HEILUNG“, Fuß „104 Gesamt · 13,3 DPS · 7,8 s“ + Statuszeile → `r4c-40-kampfstatistik.jpg` |
| 7 | **Einstellungen ohne Blättern** (Desktop; die Feinschliff-Sitzung hat `options-ui.js`/`content/options.js` seit 15:51 nicht mehr angefasst, Umsetzung ab 18:22). Zeilen 28 px (WoW ≈ 26–30), der Seitentitel entfällt (die Kategorie ist links markiert), Abschnittsköpfe schmaler. Tastenbelegung in vier ausgeglichenen Spalten in einem breiteren Fenster (bis 1480 px, mittig), Suche über die volle Breite. Eigene Kategoriesymbole als Strich-Symbole: Zahnrad (Spiel), Rahmen (Interface), Pinsel (Grafik), Lautsprecher (Ton), Tastenkappe (Tastenbelegung), Monitor (System). `optimierung-r3b-check` misst jetzt **alle** Kategorien (senkrecht und waagerecht). | Interface 740/438, Grafik 492/438, Tastenbelegung 1877/438 → alle sechs 499/499 ohne Überlauf; Rucksack-/Karten-/Kniffe-Symbol doppelt → sechs eigene Symbole. `r4c-50-einstellungen-{interface,keys}.jpg` |

## Überschneidungen

- **Feinschliff-Sitzung (Einstellungen, Runden 70–99)**: aufgebaut, nicht ersetzt. Logik, Texte und Reihenfolge bleiben; neu sind nur `glyph` je Kategorie, die Klasse `opt-cat-<id>` am Fenster und die Maße in `fenster-r4c.css`. Die offene Änderung „Niedrige Auflösung“ im Worktree `anziehpuppe` (eine Zeile mehr in Grafik) passt: Grafik nutzt 8 von 17 möglichen Zeilen.
- **Runde 3b**: `touchPopupBounds` bleibt; das Spielmenü (und auf ≤ 600 px Höhe jedes Fenster) übergibt nur keine Steuerflächen mehr. Die Figur-Reiter auf ≤ 370 px bleiben.
- **Feinschliff Runde 63 (Zielporträt)** bleibt; die Plakette hängt daran.

## Prüfungen

Grün (eigene Ports 9540–9549 / 4340–4349, nacheinander – parallel scheiterten Läufe an „Game did not initialize“, die Maschine war stark belastet):
`npm test` (891, neu `tests/unit-colors.test.mjs`), `npm run content:check`, `npm run build`, `npm run ui:check` (Scroll-Regel Desktop + phone/small/landscape),
`optimierung-r4c-check` (9), `optimierung-r3b-check` (12, jetzt mit allen sechs Einstellungskategorien), `optimierung-r2a-check` (13), `einzelfenster-check` (10).

Schon auf main rot (gleiche Stelle auf main 2367089 gemessen bzw. belegt):

| Prüfung | Befund |
|---|---|
| `meter:check` | main und 4c rot an derselben Stelle `meter-check.mjs:41`: Esc bricht zuerst nur den Autoangriff ab, das Spielmenü öffnet nicht mehr (Esc nach WoW, Runde 3a). Mit übersprungener Zeile laufen auf 4c alle fünf Desktop-Blöcke grün (Ziehen am Titel, Größe, Modus über die Symbolreiter, Speichern über Neuladen); danach rot an `meter-check.mjs:75`, weil 3b den Eintrag „Kampfstatistik“ aus der Figur entfernt hat (`.meter-entry`). Nebenbei behoben: Das Auswahlfeld der Kampfstatistik war am Handy seit 3b nur 28 px hoch – jetzt 44. |
| `hud:check`, `akt1b-check` | rot an denselben Stellen wie in 3b auf main belegt: `hud-check.mjs:62` (erwartet die alte Spielmenü-Reihenfolge, das Menü nach WoW-Vorbild beginnt mit Einstellungen/Tastenbelegung) und `akt1b-check.mjs:93` („Abschnitt ‚Ausrüstung‘ steht untereinander“). Beide auf 4c erneut gelaufen, gleiche Zeile, gleiche Meldung. |
| `optimierung-r3a-check` | „Rechtsklick auf Ida“ – behebt Teil B, hier nicht gelaufen |

**mobile-check vorher/nachher** (gleiches Skript mit `.jpg`-Aufnahmen, eigener Server, vorher = Abzug von main 2367089):

| | vorher | nachher |
|---|---|---|
| Tipp-Ziele < 44 px | 6 (Rucksack-Kopf 360 px) | **0** |
| Paare mit Abstand < 8 px | 86 (Figur ≈ 80, Talente quer 6) | **0** |
| Lesetexte < 12 px | 0 | 0 |
| Schritte mit Problemen | 3 (klein Gespräch, hoch/quer Beute „Reden“) | 3 (hoch Unterbrechung M-15, hoch/quer Beute „Reden“) |

Die Problemschritte hängen an Lage und Spielstand (Ida steht neben dem Beutel, Unterbrechung) und wechseln zwischen Läufen wie in 3b beschrieben; keiner betrifft Figur, Talente, Rucksack oder das Spielmenü.

## Rest / Übergabe

- **Einstellungen am Handy**: nicht umgebaut (Zeilen 44 px, Kategorien als Reiter). Gemessen wird nur der Desktop.
- **Tastenbelegung**: vier Spalten brauchen ≥ 1480 px Fensterbreite; auf kleineren Desktops (≤ 1300 px) läuft sie wie bisher in einer blätternden Liste (Rückfall über `overflow:auto`).
- **Fenster klappen im Kampf ein** (Runde 3b, `hero-reveal.js`) – auch das mittige Einstellungsfenster, wenn es über dem Helden liegt. Kein 4c-Befund, aber für ein modales Fenster fragwürdig.
- **Spielmenü am Handy**: „Zum Anmeldebildschirm“ wird auf 320 px zu „Zum Anmeldebil…“ gekürzt (Wortlaut der Feinschliff-Sitzung).
- **Figur 320–370 px**: bleibt mit den Reitern Ausrüstung | Werte (Runde 3b); die Puppe ist dort jetzt 252–280 px statt 224–236 px.
