# Optimierung Runde 4, Teil A „Weltkarte“ · 24.09.2026

Eingang: Grafikbericht R4 (`docs/REVIEW-GRAFIK-2026-09-24-r4.md`, Zielbild 1 sowie Befunde 1, 2 und 6) und Prüferbericht R4 (`docs/PLAYTEST-2026-09-24-r4-pruefer.md`, unverändert übernommen).
Vorbild ist die WoW-Weltkarte: Symbole statt Ziffern, Namen im Tooltip, Bündel, Questgebiete als Fläche, Werkzeuge in der Titelzeile, nichts scrollt.
Die Teile B (Welt, Kampf, Hofprobe) und C (Handy-Fenster, Zielrahmen, Kampfstatistik, Spielmenü) sind hier nicht angefasst.

- Prüfskript: `node scripts/optimierung-r4a-check.mjs` (CDP 9520, Server 4320; `ONLY=1,2,…`). Es arbeitet mit echter Maus und echten Tipp-Ereignissen.
- Screenshots: `visual-review/optimierung-r4a/` (lokal, nicht im Repo).
- Unit-Tests: `tests/weltkarte-r4a.test.mjs`.

## Neue Bausteine

| Datei | Aufgabe |
|---|---|
| `map-symbols.js` | **Gemeinsame Symbolsprache** für Minikarte und Weltkarte, auf einem 16er-Raster gemalt, mit dunkler Kontur und Zwischenspeicher je Größe (Minikarte 16 px, Weltkarte 22 px, Tooltip und Liste 16–20 px). Die Minikarte bezieht ihre Symbole jetzt von hier (`minimap.js`: nur der Import, die Zeichenlogik ist unverändert). |
| `cartography.js` | `mapPlaces` liefert je Ort Gruppe und Symbol, ohne Ziffern und ohne W/B/R/K. Neu: `clusterMarkers` (rein, getestet), `worldAreas` (Zielgebiete mit Fortschritt, das verfolgte Gebiet markiert), `mapShow` (Filter), `levelTone` (WoW-Schwierigkeitsfarbe). `drawWorldLayer` ist die neue Beschriftungsschicht der großen Karte. Der gemalte Untergrund (Feinschliff 27/38/50) ist unverändert. |
| `atlas-ui.js` | Titelzeile, Filterliste, Seitenleiste, POI-Tooltip, Treffertest, Bündel-Zoom, Zwei-Finger-Zoom, Ortsliste am Handy mit Seiten |
| `weltkarte.css` | Gesamtes Aussehen der Karte, zuletzt geladen. Die alten Regeln für `.atlas-*` greifen nicht mehr, weil die Bausteine weg sind. |
| `content/minimap.js` → `WORLD_MAP_UI` | Texte und Filtergruppen der Weltkarte. Die Tooltip-Wörter (Art je Ort) kommen aus `MINIMAP_UI`, damit beide Karten dieselben Wörter benutzen. |

## Punkte

| Nr | Stand | Was | Beleg (Prüfung) |
|---|---|---|---|
| 1 | erledigt | **Symbole statt Ziffern und Buchstaben** nach der Symboltabelle des Berichts: goldenes „!“/„?“ ohne Kreis, graues „!“ für zu niedrige Aufträge, Fahne in Petrol für Treffpunkte (goldener Punkt, wenn Aufträge offen sind), gekreuzte Schwerter auf rotem Schild für Lager (grau, wenn freigeräumt), Beutel für den Kiosk, Amboss für den Werkhof, Krug für den Braugarten, Hufeisen für den Fahrstall, Stecknadel für das verfolgte Ziel und Kralle für das Zielgebiet. Die Minikarte zeigt dieselben Symbole, auch in ihrer Lupe. | 1: Auf der Karte stehen nur Ortsnamen, „N“, „50 m“ und Bündelzahlen (gemessen über `fillText` auf der Karte) |
| 2 | erledigt | **Keine Dauerschilder.** Name, Art, Stufe bzw. Auftrag, Entfernung und die Klick-Belegung stehen im **POI-Tooltip** (260 px, rechts unten am Marker, nie über der Seitenleiste). Lager zeigen die Gegnerstufe in Schwierigkeitsfarbe. Beim Überfahren leuchtet ein Ring, der Zeiger wird zur Hand. Beim Überfahren einer Listenzeile leuchtet der Marker auf der Karte. Dauerhaft stehen nur die großen Ortsnamen (Treffpunkte, St. Gangolf) in Tinte, dazu der Name des gewählten Orts. | 2 |
| 3 | erledigt | **Bündel:** Marker näher als 24 px werden ein Kreis mit Zahl, Creme auf Braun, mit dem wichtigsten Symbol klein am Rand. Der Tooltip listet alle Orte mit Symbol, Art und Entfernung. Ein Klick zoomt ×2 auf das Bündel. **Standort:** Pfeil 24 px mit weißem Halo, zuletzt gezeichnet, dreht sich in Laufrichtung. Marker näher als 20 px am Standort liegen auf 50 %. | 3: Mindestabstand 24 px, Bündel mit 4 Orten, heller Pixel an der Pfeilspitze |
| 4 | erledigt | **Zielgebiete wie Questgebiete in WoW Retail:** schraffierte Fläche. Das verfolgte Gebiet ist golden (18 %, 2-px-Rand) und trägt die Kralle. Andere Auftragsgebiete: 8 % mit gestricheltem Rand. Tiergebiete erscheinen nur über den Filter. Name, „Verfolgtes Zielgebiet · 0/3“ und Entfernung stehen im Tooltip; beim Überfahren wird das Gebiet heller. Umschalt+Klick läuft hin. | 4 |
| 5 | erledigt | **Titelzeile** „MERTLOCH · MAIFELD“ mit Filter-Trichter, „Zu mir“ und „Übersicht“ als Symbolknöpfe (Name im Tooltip). **Filter** als Häkchenliste wie die Lupe der Minikarte, 8 kombinierbare Gruppen: Aufträge, Zielgebiete, Treffpunkte, Lager, Händler, Berufe, Tiergebiete, Lebewesen. Die Auswahl wird je Browser gemerkt (`mertloch-weltkarte-v1`), Esc schließt nur die Liste. Die Legende entfällt, ebenso die Fußzeile „Norden ist oben · Welt läuft weiter“ und der Stempel. **OSM-Nennung** bleibt klein auf der Karte unten rechts (10 px, 60 %, Link zur Lizenz), weil die ODbL das verlangt. −/+ liegen als kleine Knöpfe unten rechts auf der Karte. Der Chat ist bei offener Karte verborgen. | 5, 7 |
| 6 | erledigt | **Seitenleiste:** Das verfolgte Ziel steht golden oben. Darunter folgen Gruppentrenner aus Symbol und Linie (Wort im Tooltip) für Aufträge, Treffpunkte, Lager sowie Händler & Berufe, innerhalb der Gruppe nach Entfernung sortiert. Jeder Eintrag ist einzeilig (26 px) und hat einen **Stiefel** am Ende. Der Block „Dein nächster Halt“ und der Goldknopf sind weg. Stiefel = hinlaufen, Karte zu (Verhalten aus 3a). Ein Ziel von außen (Aufträge „auf der Karte“) wird die gewählte Zeile. | 6, 7: 23 Zeilen und 4 Trenner ohne Blättern |
| 7 | erledigt | **Kartenfläche 1592 × 779 px** (vorher 1572 × 653, +21 %), Fenster unverändert 1922 × 847. Die fehlenden ≈ 20 px zum Zielmaß 1600 × 799 stecken in Rahmen und Titelzeile. Nichts scrollt. | 7 |
| 8 | erledigt | **Handy:** keine Reiter „Karte/Orte/Ziel“ mehr. Die Werkzeuge (Filter, Zu mir, Übersicht, Ortsliste) stehen als 44-px-Knöpfe in der Titelzeile. Die Karte füllt das Fenster; quer reicht das Fenster jetzt bis an den rechten Rand über die Kniff-Knöpfe. Tippen zeigt den Tooltip mit einem 44-px-Knopf „Hinlaufen“. Zwei Finger zoomen, ± liegen als runde 44-px-Knöpfe auf der Karte. Die **Ortsliste** klappt über das Listensymbol auf: 44-px-Zeilen mit Stiefel, quer zweispaltig, seitenweise statt scrollend. | 8: quer Karte 538 × 242 (vorher ≈ 470 × 165), hoch 326 × 383 (vorher ≈ 330 × 245) |

## Vorher / nachher

- **Vorher** (Review-Worktree, Stand 7890c30):
  - `D:\Dev\MertlochChronicles-review-r4\_review\shots\60-karte-start.jpg`
  - `61-karte-hover-poi.jpg`
  - `92-handy-quer-map.jpg`, `92-handy-hoch-map.jpg`
  - Ausschnitte `crops/karte-legende.jpg` und `karte-seitenleiste.jpg`
- **Nachher** (`visual-review/optimierung-r4a/`):
  - Desktop: `r4a-01-karte.jpg`, `r4a-01z-titelzeile.jpg`, `r4a-02z-tooltip.jpg`, `r4a-03-buendel-tooltip.jpg`, `r4a-04-buendel-gezoomt.jpg`, `r4a-05z-zielgebiet.jpg`, `r4a-06z-filterliste.jpg`, `r4a-07z-seitenleiste.jpg`
  - Handy: `r4a-81-handy-quer.jpg`, `r4a-81b-handy-quer-tipp.jpg`, `r4a-82-handy-quer-liste.jpg`, `r4a-83-handy-hoch.jpg`, `r4a-84-handy-hoch-liste.jpg`

## Überschneidungen

- **Minikarte:** Nur die Symbole sind neu, gezeichnet in `map-symbols.js`. Geändert sind Treffpunkt (Fahne statt Schild), Lager (Schwerter auf Schild statt Raute), Kiosk (Beutel statt Münze), Werkhof (Amboss statt Hammer) und das verfolgte Ziel (Stecknadel statt Raute). `minimap-check` bleibt grün (13).
- `quest-mobs.js` `chapterAreas` liefert zusätzlich `done/need` für den Tooltip.
- `panel-pages.js`: keine Karten-Reiter am Handy, kein `pageGrid` mehr für die Ortsliste.
- `window-compact.js` `map()`: leer, weil die Karte ihre Titelzeile selbst baut.
- `optimierung-r2a-check`: Prüfschritt „Karte zeigt das Ziel“ liest jetzt die gewählte Listenzeile statt des entfallenen Blocks „Dein nächster Halt“.
- Nicht angefasst: `renderer.js`, `world-labels.js`, Zonentitel, Namensschilder, Hofprobe, Verfolgung, Zielwahl, andere Fenster, `app.js` (keine Änderung nötig), `popup-windows.js` (die Fenstergröße am Handy regelt allein `weltkarte.css`).

## Prüfungen

Alle Browser-Prüfungen liefen auf eigenen Ports 9520–9527 / 4320–4327.

- **Grün:**
  - `npm test` (896)
  - `npm run content:check`
  - `npm run build`
  - `npm run ui:check`
  - `optimierung-r4a-check` (9)
  - `minimap-check` (13)
  - `optimierung-r3a-check` (19)
  - `optimierung-r2a-check` (13)
- **`optimierung-r3a-check`:** Der Schritt „Rechtsklick auf Ida“, im Review zweimal rot, war hier grün. Er ist also wechselhaft; Teil B klärt die Ursache.
- **Unter Last:** `minimap-check` scheiterte im ersten Anlauf an „Game did not initialize“ und lief allein grün.
- **`hud:check`: schon auf main rot.** Kopie mit Server-Port über `SERVER_PORT`. Auf main 239fc20 (eigene Arbeitskopie) und auf diesem Stand rot an derselben Stelle (`hud-check.mjs:62`): Die Einträge des Spielmenüs lauten „Einstellungen/Tastenbelegung“ statt „Berufe/Fahrzeuge/Söldner“. Das betrifft nicht die Karte.
- **`mobile-check`:** siehe Nachtrag unten.
- **`akt1b-check`:** nicht gelaufen. Er braucht ein von Hand gestartetes Chrome mit Fernsteuerung und ist laut 3a/3b auf main rot an derselben Zusicherung. Die Karte berührt er nicht.

## Rest

1. Das Symbol „Nadel = Verfolgen“ in der Listenzeile (Zielbild) fehlt: Verfolgen gibt es nur für Aufträge, und das läuft über das Auftragsfenster.
2. Die Bude und der Verlies-Eingang stehen auf der Minikarte, auf der Weltkarte noch nicht (eigener Ort nötig, mit sicherem Laufpunkt).
3. Hochkant bleibt die Karte über der Touch-Steuerung stehen (366 × 466). Ganz nach unten zu reichen hieße, Joystick und Kniffe zu verdecken; das ist eine Fensterfrage von Teil C.
4. Die Zielgebiet-Symbole kennen nur „besiegen“ (Kralle). Hand für „sammeln“ und Sprechblase für „reden“ folgen, sobald die Minikarte auch Sammelgebiete zeigt (Rest 3a/3).
5. `hud:check` und `akt1b-check` bleiben rot wie auf main.
