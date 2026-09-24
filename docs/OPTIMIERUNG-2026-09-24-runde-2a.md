# Optimierung Runde 2a „Fenster“ · 24.09.2026

Eingang: Grafikbericht `docs/REVIEW-GRAFIK-2026-09-24-r2.md` (Zielbilder 1–3) und Neuling-Playtest `docs/PLAYTEST-2026-09-24-r2-neuling.md`.
Vorbild WoW. Keine Fließtexte, Namen und Erklärungen im Tooltip, nirgends scrollen.
Teil B (Zielwahl/Kampf, Zonentitel, Meldungen, Leisten, Handy-Wegmarke) lief parallel und ist hier nicht berührt.

Prüfskript: `node scripts/optimierung-r2a-check.mjs` (CDP 9487, Server 4287, per `CDP_PORT`/`SERVER_PORT` änderbar). 13 Prüfungen per Klickpfad,
misst je Fenster `scrollHeight` gegen `clientHeight`. Bilder in `visual-review/optimierung-r2a/` (lokal, nicht im Repo): `vorher-*` = main 09d07b9,
`r2a-*` = dieser Stand, `*z-*` = zweifach vergrößerte Ausschnitte, `messwerte.json` = Maße und Handy-Scrollwerte.

## Umgesetzt

| Nr | Was | Beleg (vorher → nachher) |
|---|---|---|
| 1 | **Aufträge als WoW-Questlog** (`questlog-ui.js`, `questlog-window.js`). Oben die Titelliste nach Gruppen (Akt, Startreihe, Stammgäste, Im Dorf), je Zeile Symbol (! Hauptgeschichte, ◆ Auftrag, Kalender für Daily, ? zur Abgabe), Titel, Zähler, Meter. Unten das Detail: Häkchen-Schritte (einzeilig, voller Text im Tooltip), Belohnung als 36-px-Kacheln, drei Symbolknöpfe Verfolgen / Ziel auf der Karte / Lesen. Aktiv/Dorf/Erledigt sind Symbolschalter in der Titelzeile, Aufträge/Bude/Erinnerungen ein Symbolreiter unten. Keine Pergamentkarten. Beschreibung und Zitat stehen im Tooltip der Zeile und hinter „Lesen“ als eigene Seite. Doppelklick verfolgt. Passt die Liste nicht, blättert sie (‹ 1/2 ›). Die Bude ist eine Zeile je Gebäude (Stufe als Plakette, Kosten und Vorteil im Tooltip). | 1430/432 → 432/432, 420×484 bei 460/183. `vorher-win-j.jpg` → `r2a-01z-auftraege.jpg`, `r2a-02z-auftrag-lesen.jpg`, `r2a-03z-auftraege-im-dorf.jpg`, `r2a-04z-reiter-{base,memories}.jpg` |
| 1 | **„… auf der Karte“ zeigt das verfolgte Ziel.** Laufende Aufträge öffnen die Karte beim aktuellen Ziel und werden dabei verfolgt; nur noch nicht angenommene zeigen den Auftraggeber (Tooltip sagt, welches von beiden). | Prüfung 1: Karte zeigt „Der übliche Verdächtige“ mit Ziel „Pfandkeiler von den Trümmern jagen“, nicht Kisten-Ida |
| 2 | **Fensterhöhe nur an sichtbaren Leisten** (`popup-windows.js`, `visibleBars()`). Gezählt wird jede sichtbare Leiste der Aktionsfläche einzeln und nur dort, wo sie waagrecht liegt; unsichtbare (visibility:hidden, leer) und die Interaktionspille zählen nicht. | Prüfung 2: mit Haltungs- und zweiter Leiste Unterkante 667, ohne 792 (Hauptleiste 798) |
| 3 | **Ein Fensterraster.** Alle Seitenfenster (Figur, Aufträge, Kniffe, Rucksack) und das Gespräch stehen fest auf y = 183 … 667; die Unterkante ist die niedrigste Grenze über den sichtbaren Leisten unter allen Seitenplätzen, damit nichts springt. Das Gespräch sitzt auf dem Figurplatz (x = 12/y = 183) und ist nicht mehr verschiebbar. Talente und Hilfe stehen mittig auf derselben Oberkante. Spielmenü 220×364. | vorher Oberkanten 183/185/150/21/12, Unterkanten 800/667/629 → alle 183 und 667. `vorher-four.jpg` → `r2a-10-vier-fenster.jpg`, Spielmenü `vorher-menu.jpg` (320×605) → `r2a-32z-spielmenue.jpg` |
| 3 | **Figur passt ins Raster** (Folge von 3): die Zeile „Stufe 12 · … · noch kein Hauptbaum“ ist Tooltip des Namens, „Clankiste“ ein Symbol neben Drehen/Wechseln, die Puppe etwas kleiner. | 617 hoch → 484, kein Scrollen |
| 4 | **Gespräch kompakt** (`dialog-compact.js`). Porträt (40 px) und Name in der Titelzeile, Rolle im Tooltip; keine Kopfkarte, keine Pergamentkarte, keine Zitatkarte. Der Text zeigt höchstens drei Zeilen, der ganze Text steht im Tooltip und hinter „Mehr“. Belohnung als Kacheln (`reward-tiles.js`, auch in Nebenaufträgen, Startreihe, Aushängen, Kapitelabgabe). Knöpfe stehen immer unten sichtbar; der Annehmen-Knopf heißt „Annehmen“, ein langer Ablehnen-Text „Später“, der witzige Satz steht jeweils im Tooltip. Die Dropchance ist ein i-Tooltip am Ziel. Mehrere Aufträge eines Gebers erscheinen als Gossip-Zeilen (! oder ?), ein Klick zeigt den Auftrag. Inhalt behutsam gekürzt: in Idas Kapitel-1-Angebot fiel der Satz über Keiler und Ruhewärter weg (steht als Ziel darunter), im ersten Hofprobe-Schritt „wähle deine Spielweise“ (widersprach „ab Stufe 5“, Playtest). | 897/542 → kein Scrollen. `vorher-dlg-ida.jpg` → `r2a-20z-gespraech.jpg`, `r2a-21z-gespraech-mehr.jpg` |
| 5 | **Hilfe als Tastenkappen-Raster** (`help-keys.js`, Texte `content/panel-ui.js` → `HELP_GRID`). Fünf Themenzeilen (Bewegen, Kampf, Fenster, Beute & Leiste, Dorf), je Kappe „Taste → Symbol“, Erklärung nur im Tooltip. Der wichtigste Neuling-Tipp „Klick auf den Auftragskasten läuft zur Wegmarke“ steht in der ersten Zeile. Reiter Tasten/Kniffe und der Einführungsfilm sind Symbole in der Titelzeile. Der Reiter „Kniffe“ ist das Nachschlagewerk als Symbolraster ohne Suche; die Talente zeigen je Baum einen Umschalter, lange Reihen (Regeln, 117 Kacheln) blättern. | 1896/603 → 560×296 ohne Scrollen. `vorher-win-h.jpg` → `r2a-30z-hilfe.jpg`, `r2a-31z-hilfe-kniffe.jpg` |
| 5 | **Einstellungen raus aus der Hilfe**: Der Eintrag „Einstellungen“ im Spielmenü gab es schon, er öffnete aber die Hilfe. Jetzt ist er ein eigenes Fenster (mittig auf der Oberkante, zwei Spalten, Erklärsätze im Tooltip). | `r2a-33z-einstellungen.jpg`, kein Scrollen |
| 6 | **Kniffe wie das WoW-Zauberbuch** (`combat-ui.js`, `window-compact.js`). 44-px-Slots in der Optik der Aktionsleiste, ein Rahmen, keine Eckbeschläge je Kachel. Sortiert nach Taste (1–0, Q, Leer, zweite Leiste, ungebunden, gesperrt nach Stufe). Tastenlabel oben rechts wie auf der Leiste, kein rundes Badge. Gesperrte entsättigt mit Schloss statt Stern. Ungebundene leuchten kurz golden statt „+“. Eigenarten hinter einem Trenner mit Blatt-Symbol (Name im Tooltip), Zurücksetzen in der Titelzeile, der Textknopf „Eigene Spezialisierungen [N]“ entfällt. | `vorher-win-p.jpg` → `r2a-40z-kniffe.jpg` |
| 7 | **Talente ohne Scrollen** (`window-compact.js`, `talent-tree-view.js`). Keine Suche, keine Pergament-Detailspalte: Details stehen im Tooltip des Talents, Klick lernt, Rechtsklick nimmt zurück (wie im Vorbild). Spec-Wappen, freie Punkte, Hauptbaum und Zurücksetzen als Symbole in der Titelzeile, die drei Pfade als Symbolreiter unten neben der Pfadtreue. Vor Stufe 5 nur eine kompakte Vorschau: drei Wappen und „Ab Stufe 5“ mit Schloss. | 1040×625 bei y = 21 → 760×423 bei y = 183; Stufe 1: 1040×668 → 440×212. `vorher-win-n.jpg`/`vorher-talents-lvl1.jpg` → `r2a-50z-talente.jpg`/`r2a-51z-talente-stufe1.jpg` |
| 8 | **Karte: Ortsliste einzeilig** (`atlas-ui.js`). Symbol, Name, Meter; keine eigene Nummerierung, keine Zweitzeile (Zustand im Tooltip). Das verfolgte Ziel steht hervorgehoben oben, der Rest ist gedimmt. | 1384/753 → 23 Orte ohne Scrollen. `vorher-win-m.jpg` → `r2a-08z-karte-liste.jpg` |
| 9 | **Esc wie in WoW**: Zielen/Zaubern/Aufsitzen abbrechen wie bisher, dann schließt ein Esc **alle** Fenster, dann wählt es das Ziel ab, erst dann kommt das Spielmenü. | Prüfung 9 |
| 10 | **Held nie unter Fenstern verloren** (`hero-reveal.js`). Läuft die Figur von selbst (Auftragskasten, Karte) oder ist sie im Kampf, werden Fenster, die sie überdecken, 30 % durchsichtig und lassen Klicks durch; mit der Maus darüber sind sie sofort wieder voll. Der Renderer zeichnet dann denselben hellen Umriss wie hinter Dächern (`renderer.heroCovered`). Kein Fenster schließt. | `r2a-60-held-unter-fenster.jpg`, `r2a-60z-held-umriss.jpg` |
| 11 | **Scroll-Regel scharf**: `npm run ui:check` meldet am Desktop 2024×900 jede scrollende `.popup-body` (Figur, Aufträge, Talente, Karte, Kniffe, Rucksack, Hilfe, Einstellungen) als Fehler. Ausnahme nur `bag .bag-grid` (voller Rucksack: mehr Stapel als Rasterplätze gehen nicht anders); sie greift heute nicht, der Rucksack scrollt nicht. `SCROLL_STRICT=0` macht sie für eine Messung wieder zur Warnung. | `ui:check` grün |

## Angepasste Prüfskripte

- `ui-regression-check.mjs`: Scroll-Regel scharf (s. o.); ein Esc schließt Rucksack und Figur zugleich; Talente: Klick lernt, keine Detailspalte, keine Suche.
- `einzelfenster-check.mjs`: ein Esc schließt alle vier Fenster, das nächste öffnet das Spielmenü. Ports über `CDP_PORT`/`SERVER_PORT`.
- `optimierung-r1-check.mjs`: Gesprächsname steht einmal, jetzt in der Titelzeile mit Porträt.
- `quest-tracker-hud-check.mjs`: Ports über `CDP_PORT`/`SERVER_PORT`.
- `hud-check.mjs`: „Einstellungen“ öffnet ein eigenes Fenster statt eines Hilfe-Reiters.

## Nicht umgesetzt

- **Handy: Kniffe, Figur, Rucksack scrollen noch** (quer 470/286, 653/286, 507/286; hoch 470/411, 652/411, 507/411; `messwerte.json`). Am Handy darf ein Fenster bildschirmfüllend sein und notfalls scrollen; Aufträge und Hilfe scrollen dort nicht mehr.
- **Karte**: Buchstaben/Nummern auf den Kartenmarkern, Textlegende und die Textknöpfe „Zu mir/Übersicht“ (Grafikbericht 12, nicht Teil dieses Auftrags).
- **Gossip-Zeilen** sind nur im Code und im Aufbau geprüft; ein Geber mit zwei offenen Aufträgen kommt im Prüfskript nicht vor.

## Rest für Runde 3+

1. Handy: Figur, Kniffe, Rucksack ohne Scrollen (Figur mit Reiter-freier Werteleiste, Kniffe 5 Spalten × 44 px, Rucksack 6 Spalten).
2. Karte: Minikarten-Symbole statt Buchstaben, Marker bündeln, Legende weg, „Zu mir/Übersicht“ als Symbole (Grafik 12).
3. Tooltips: Gegenstand ≤ 360 px mit Vergleich daneben, fester Anker über der Menüleiste (Grafik 7).
4. Hilfe/Kniffe: die „Regeln“ (117 Kacheln über alle Klassen) nach der eigenen Klasse filtern statt zu blättern.
5. Gespräch: Nebenaufträge ohne eigenen Text (nur Zitat) könnten die drei Zeilen besser nutzen; Idas weitere Kapitel wie Kapitel 1 prüfen, sobald sie spielbar sind.

## Prüfungen

Grün auf diesem Stand: `npm test` (811), `npm run content:check`, `npm run build`, `node scripts/optimierung-r2a-check.mjs` (13),
`npm run ui:check`, `einzelfenster-check` (10), `optimierung-r1-check` (16), `quest-tracker-hud-check`. Alle auf eigenen Ports 9481–9487/4281–4287.
Schon auf main rot und nicht aus dieser Runde: siehe Rückmeldung (Vergleichslauf main ↔ Runde 2a).
