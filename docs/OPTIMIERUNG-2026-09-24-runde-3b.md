# Optimierung Runde 3, Teil B „UI-Grafik & Handy“ · 24.09.2026

Eingang: Grafikbericht `docs/REVIEW-GRAFIK-2026-09-24-r3.md` (Zielbilder 1–3, übernommen aus dem Review-Worktree).
Vorbild WoW: Symbole und Tooltips statt Fließtext, nirgends scrollen, kompakt. Teil A (Kampf und Interaktion) lief parallel und ist hier nicht berührt.

Prüfskript: `node scripts/optimierung-r3b-check.mjs` (CDP 9515, Server 4315, über `CDP_PORT`/`SERVER_PORT` änderbar). 12 Prüfungen per Klickpfad
auf Desktop 2024×900, Handy quer 844×390 und hoch 390×844; misst je Fenster `scrollHeight` gegen `clientHeight`, Tooltip-Boxen gegen Auslöser,
Verfolgung und Menüleiste, die Leistenhöhe, den Zonentitel gegen alle Fenstertitel und die Zahl der Ortswechsel-Schriftzüge.
Bilder in `visual-review/optimierung-r3b/` (lokal, nicht im Repo): `vorher/` = Review-Aufnahmen auf main 7bc7540, `check/` = dieser Stand,
`messwerte.json` = Maße.

## Umgesetzt

| Nr | Was | Beleg (vorher → nachher) |
|---|---|---|
| 1 | **Handy bekommt die neue Oberfläche.** `window-compact.js` verdichtet Figur, Kniffe und Talente jetzt auch am Handy (die `touch`-Sperren aus Runde 2a sind weg), `fenster-r3.css` ordnet sie mobil an. **Kniffe**: 44-px-Plätze in Leistenoptik mit 8 px Abstand, Tastenlabel oben rechts („3“ bzw. „2·3“ für Seite·Knopf statt Chips „Seite 2 · Knopf 3“, `fenster-r3.js` `touchKeys`), „Touchbuttons belegen“ als Hand-Symbol in der Titelzeile. **Figur**: keine Reiter mehr, Puppe mit Plätzen, Schmuck und Waffen daneben (quer) bzw. darunter (hoch), Werte als Symbolzeilen, Drehen/Wechseln/Clankiste als Symbole in der Titelzeile. **Talente**: wie am Desktop, Wappen und Pfade quer als Spalte rechts, hoch als Zeile unter dem Baum, Knoten 44 px. **Rucksack**: Kopf eine Zeile, 8 bzw. 6 Spalten. **Karte**: Reiter Karte/Orte/Ziel in der Titelzeile, die Karte füllt den Rest, die Ortsliste blättert (‹ 1/3 ›). **Spielmenü**: Berufe, Fahrzeuge und Söldner sind Kacheln im Fensterraster (Symbol + ein Wort, Nunito 11 px mit Auslassung), die übrigen Einträge flache Knöpfe in drei (quer) bzw. zwei (hoch) Spalten. **Spielerrahmen neben offenem Fenster**: Lebenszahl einzeilig (Nunito 9 px, Rahmen quer 134 statt 124 px). **Meldungen**: Solange die Kurzmeldung steht, treten frische Chatzeilen zurück. Hochkant beginnen Talente, Karte, Figur und Spielmenü oben am Rand, damit sie auch mit iPhone-Safe-Areas nicht scrollen. | Scroll quer: Menü 529/286, Kniffe 470/286, Figur 653/286, Rucksack 507/286, Talente 532/270, Karte 347/270 → alle 0. Hoch: 665/411, 470/411, 652/411, 507/411, 545/487, 490/487 → alle 0. Tipp-Ziele < 44 px in diesen Fenstern: 0. `vorher/72-handy-quer-book.jpg` → `check/r3b-91-quer-book.jpg`, `vorher/72-handy-hoch-person.jpg` → `check/r3b-91-hoch-person.jpg`, `vorher/71-handy-quer-menue.jpg` → `check/r3b-90-quer-menue.jpg` |
| 2 | **Höhe nach Inhalt, nur gemeinsame Oberkante** (`popup-windows.js`, `CONTENT_HEIGHT`). Kniffe, Rucksack, Figur und Gespräch sind so hoch wie ihr Inhalt, höchstens bis zur gemeinsamen Unterkante über den sichtbaren Leisten; die Aufträge behalten die volle Höhe (Questlog). Gespräch: Die harte 3-Zeilen-Kappe fällt, der Text zeigt so viele ganze Zeilen, wie das Fenster hergibt (höchstens zehn); „Mehr“ erscheint nur, wenn er dann noch nicht passt, als eigene Zeile rechts unter dem Text (`dialog-compact.js` `measureDialog`). Die Frage steht in Nunito 800 16 px statt Jersey-Versal. | Kniffe 484 → 348 px, 18 px unter dem letzten Platz statt ≈ 160. Gespräch Ida: 3 Zeilen + 270 px leer → 10 Zeilen, Fenster 437 px. `vorher/z/gespraech-ida.jpg` (crops) → `check/r3b-21-gespraech.jpg` |
| 3 | **Gegenstands-Tooltip nach Zielbild 2** (`rpg-ui.js` `itemTooltipR3`, `fenster-r3.js` `placeTooltip`). 300 px breit, Name Nunito 800 15 px in Seltenheitsfarbe (höchstens zwei Zeilen), Seltenheit · Platz · Art und Gegenstandsstufe gedimmt, je Wert eine Zeile, „Benötigt Stufe“, höchstens drei Delta-Zeilen ▲/▼ (Schaden/s, Werte, sonst Wirkungen). Abgeleitete Werte und Beschreibung nur mit Shift. Das angelegte Teil steht als zweiter Tooltip „Angelegt“ links daneben mit gleicher Oberkante (ShoppingTooltip); liegt kein Platz links, dreht sich das Paar. Anker: links vom Rucksack, Oberkante auf Höhe der Zelle, nie über Verfolgung oder Menüleiste. | Megafon 286×610 → 300×291 (Vergleich 240×181), Keilerzahn/Dosenklinge 217, Jacke 219, Brezel 113; mit Shift 321. `vorher/41-tip-gegenstand-vergleich.jpg` → `check/r3b-30-tooltip-gegenstand.jpg` |
| 4 | **Hilfe nach Zielbild 3** (`help-keys.js`, `content/panel-ui.js` `HELP_GRID`). Tastenbelegungsliste in drei Spalten (Bewegen+Kampf, Fenster, Beute & Leiste+Dorf; Handy zwei), je Zeile Kappe + ein Wort (`label`, Nunito 700 13 px), kein Pfeil, kein Zielsymbol. Tooltip nur mit Mehrwert (gepunktete Unterstreichung); tautologische Notizen („WASD läuft.“, „Ausrüstung und Werte.“ …) sind gestrichen, Wörter gekürzt („Wegmarke“, „Aufsitzen“, „Belegen“). Die Kappen zeigen die wirksame Belegung aus der parallel gekommenen Tastenbelegung (Feinschliff, 0987d75). | 560×296 Piktogramm-Raster → 720×366 Liste, 25 Zeilen, kein Scrollen. `vorher/10-fenster-h.jpg` → `check/r3b-50-hilfe.jpg` |
| 5 | **Aktionsfläche nach Zielbild 1** (`fenster-r3.css`, nur CSS). Ausweichen und Unterbrechen sind zwei 40-px-Plätze links im Rahmen der Hauptleiste, abgetrennt durch einen Messingstrich; die zweite Leiste steht ohne Platte spaltengenau darüber (gleiche Spalte, gleiche Innenabstände). Rahmen und Innenabstand der Zusatzleiste bleiben unsichtbar erhalten, damit beim Ziehen (Platte erscheint) kein Platz springt. | Stapel 194 → 122 px, keine losen Kästchen über der Hauptleiste. `vorher/z/aktionsflaeche.jpg` → `check/r3b-60-aktionsflaeche.jpg`; `aktionsleisten-check` grün |
| 6 | **Zonentitel nie auf Fenstertiteln.** Bei offenem Seitenfenster steht er im freien Band über der Oberkante (`top:100px`, 36/14 px, Unterkante ≤ 168), die Fehlerzeile auf 64 px. **Nur ein Ortswechsel-Schriftzug**: `#zoneSplash` (Feinschliff Runde 66, von 2b nur per CSS ausgeblendet) ist in `app.js` zurückgebaut; die Bude-Anzeige „Die Bude · Raum“ läuft weiter über `#zoneName`/`zone-announce.js`. | Zonentitel mit vier Fenstern y 102–161, 0 getroffene Titelzeilen; `#zoneSplash` existiert nicht mehr. `vorher/20b-autolauf-spaeter.jpg` → `check/r3b-70-zonentitel-fenster.jpg` |
| 7 | **Fenster über dem Helden klappen ein** (`hero-reveal.js`, `fenster-r3.css`). Statt 30 %-Geisterbild bleibt nur die Titelzeile stehen, der Körper klappt weg; mit der Maus über der Titelzeile (oder dort, wo der Körper war) klappt es wieder auf. Eingeklappt zählt das volle Rechteck von vorher, sonst flackerte es. Neu: Ein Fenster, das man erst im Kampf oder beim Laufen öffnet, bleibt die ersten 2 s offen – man will es benutzen; danach weicht es wie die anderen (Klicks gehen dann wieder durch, wie Teil A es erwartet). | `vorher/20-autolauf-vier-fenster.jpg` → `check/r3b-80-eingeklappt.jpg` (Kniffe 52 px hoch) |
| 8 | **Tooltips nicht auf dem Auslöser** (`fenster-r3.js` `placeTooltip`). Fenster-Tooltips stehen seitlich neben dem Fenster (rechts angedockte links, links angedockte rechts), Leisten-Tooltips über dem ganzen Leistenstapel, Menüleiste darüber rechtsbündig; nie über Verfolgung oder Menüleiste. Figur-Slot zeigt nur den Namen („Kopf“). Der Tooltip des Auftragskastens schließt beim Klick und sobald sein Träger beim Neuaufbau (Meter zählen beim Laufen) aus dem DOM fällt (`popup-controls.js`). | Kniff-Tooltip 920/632 auf den Plätzen → Unterkante 739 über dem Stapel (745). Auftragskasten: nach 1,5 s Laufen kein Tooltip mehr. `vorher/40-tip-kniff-leiste.jpg`, `44-tip-figur-slot.jpg` |
| 9 | **Einheitliche Knöpfe und Fenster.** Rucksack: Kopf eine Zeile (Filter + Lupe), die Suche klappt über den Filtern auf (Esc/Lupe klappt zu), Münzen, Platz, Sortierart, Sortieren und Laden unten wie im WoW-Beutel. Auswahlfelder in Fenstern und Kampfstatistik im Spielstil (Messingrand, Leder, eigener Pfeil, Nunito). Kampfstatistik im selben Fensterrahmen wie alle Spielfenster. Zielrahmen: Name in gemischter Schreibung (Nunito 800 14 px), Zauberleiste Nunito 12, das Medaillon sitzt im Rahmen. | Rucksack-Kopf ≈ 120 → 38 px. `vorher/z/fenster-i.jpg` → `check/r3b-91-*-bag.jpg`; `vorher/30-hud-kampf.jpg` |

## Überschneidungen mit der Feinschliff-Sitzung

- **Runde 40 (Ablage an der Leiste)**: Aufgebaut, nicht ersetzt – `#specialActions` bleibt das Element aus Runde 40, sitzt aber jetzt im Rahmen der Hauptleiste statt als Platte darüber (nur CSS in `fenster-r3.css`).
- **Runde 54/55 (Gespräch)**: 128-px-Porträt war schon durch 2a ersetzt; die Sprechblase (55) bleibt unverändert.
- **Runde 66 (`#zoneSplash`)**: im Code zurückgebaut (2b hatte ihn nur ausgeblendet). Die Bude-Ortsanzeige aus demselben Commit bleibt.
- **Runde 47 (Tooltip-Symbol 36 px im Qualitätsrahmen)**: bleibt, der neue Tooltip nutzt denselben Kopf.
- **Runden 33/37/53 (heller Umriss)**: bleiben; der Umriss wird gezeichnet, solange ein nicht eingeklapptes Fenster über dem Helden liegt.
- **Runde 63 (Zielporträt)**: bleibt, nur ins Innere des Rahmens gerückt (54 statt 64 px).
- **Einstellungen/Tastenbelegung/Spielmenü (fde7e12, 8a10565, 0987d75, parallel auf main)**: Beim Rebase übernommen. Die Hilfe zeigt die wirksamen Tasten weiter (deren `liveKeys`, meine Liste). Das neue Einstellungsfenster habe ich nicht umgebaut, nur die Auswahlfelder im Spielstil vereinheitlicht; das Spielmenü am Handy nutzt deren neue Reihenfolge.

## Angepasste Prüfskripte

- `optimierung-r2a-check.mjs`: Raster prüft nur noch die gemeinsame Oberkante (keine Unterkante unter der des Questlogs); Gespräch bis zehn Zeilen; Hilfe als Liste (≤ 740×400, ≥ 20 Zeilen, Tooltip mit Mehrwert); Held: eingeklappt statt 30 %.
- `ui-regression-check.mjs`: Scroll-Regel jetzt auch am Handy scharf (Figur, Rucksack, Aufträge, Karte, Hilfe auf phone/small/landscape, mit Safe Areas); Rucksack-Suche über die Lupe; `SERVER_PORT` wählbar.
- `optimierung-r1-check.mjs`: Rucksack und Kniffe enden über der Unterkante der Aufträge statt auf derselben Unterkante.
- `optimierung-r2a-check.mjs`: Spielmenü ≤ 420 px hoch (neues Menü der Feinschliff-Sitzung) und scrollt nicht.
- `aktionsleisten-check.mjs`: Ports über `CDP_PORT`/`SERVER_PORT` (Aussagen unverändert, grün).

## Prüfungen

Grün auf diesem Stand (nach Rebase auf main 7ced461, eigene Ports 9510–9519/4310–4319):
`npm test` (818), `npm run content:check` (57), `npm run build`, `optimierung-r3b-check` (12), `optimierung-r2a-check` (13), `optimierung-r1-check` (16),
`einzelfenster-check`, `aktionsleisten-check`, `quest-tracker-hud-check`, `npm run ui:check` (Scroll-Regel jetzt auch am Handy: phone, small, landscape,
landscape-left mit Safe Areas), dazu Teil As `optimierung-r3a-check` (19).

Schon auf main rot (gleicher Lauf, eigener Worktree auf main 7ced461/4552626):

| Prüfung | main | Runde 3b | Befund |
|---|---|---|---|
| `hud:check` | rot | rot | gleiche Stelle `hud-check.mjs:62`: erwartet die alte Spielmenü-Reihenfolge („Berufe, Fahrzeuge …“), das Spielmenü nach WoW-Vorbild (Feinschliff 8a10565) beginnt mit „Einstellungen, Tastenbelegung“ |
| `akt1b-check` | rot | rot | gleiche Stelle `akt1b-check.mjs:93` („Abschnitt ‚Ausrüstung‘ steht untereinander“) |
| `optimierung-r2a-check`, Spielmenü-Höhe | rot | grün | das neue Spielmenü ist 393 statt ≤ 380 px hoch; die Prüfung erlaubt jetzt ≤ 420 und prüft zusätzlich „scrollt nicht“ |
| `optimierung-r3a-check` | rot („Erinnerung erst nach Ruhe“) | grün | zustandsabhängig; auf diesem Stand grün |

**mobile-check vorher/nachher** (gleiches Skript, gleiche Geräte, eigener Server): main 7ced461 **2 Problemschritte** (hoch Unterbrechung M-15, quer Gespräch),
Runde 3b **2 Problemschritte** (quer/klein Kampf-Kniff M-04, der Held war im Arena-Kampf gestorben). Alle vier hängen an Lage und Kampf aus dem Spielstand und wechseln
zwischen Läufen (Runde 2a und der erste Vergleichslauf auf 7bc7540 zeigten andere). Tipp-Ziele unter 44 px: main 0, Runde 3b **6** (klein 360 px: die sechs Kopfknöpfe
des Rucksacks sind 40 px, sonst passen Filter und Lupe nicht in eine Zeile). Paare unter 8 px Abstand: main 25 (Filter der Aufträge, Reiter der Hilfe – **behoben**),
Runde 3b **87**, fast alle an den Puppenplätzen der Figur mit simulierten Safe Areas (5 px statt 8 px, die Puppe bekommt dort nur ≈ 245 statt 260 px Höhe) – schlechter als main, siehe Rest.
Scroll am Handy: vorher 6 Fenster quer/hoch, nachher 0 (ui:check und r3b-check scharf).

Hinweis Prüfumgebung: Die Maschine lief mit ≈ 85 % CPU (viele parallele Sitzungen); `ui:check` scheiterte dabei mehrmals zufällig an „Game did not initialize“
(Start > 16 s, auch auf main gemessen 6–9 s). Gewertet sind nur vollständige Läufe.

## Nicht umgesetzt / Rest

1. **Figur am Handy mit Safe Areas**: Die Puppenplätze stehen 5 px statt 8 px auseinander (mobile-check M-02-Befund). Ohne Safe Areas sind es ≥ 8 px. Lösung wäre, Schmuck und Waffen hochkant in den Werte-Reiter zu legen (wie jetzt schon auf ≤ 370 px); bewusst offen, weil der Grafikbericht die Figur ohne Reiter wollte.
2. **Spielmenü auf 320-px-Schirmen** scrollt noch leicht (Kacheln + sieben Einträge); quer/hoch 390 passen.
3. **Hochkant** beginnen die Fenster jetzt oben am Rand und liegen über dem Spielerrahmen (wie Talente/Karte schon vorher) – am Handy ist immer nur ein Fenster offen.
4. **Einstellungen**: Das neue Fenster der Feinschliff-Sitzung (Kategorien, Tastenbelegung) ist nicht umgebaut, nur die Auswahlfelder vereinheitlicht. „Ton“ als Schalter und die Dubletten Kampfstatistik/UI im Spielmenü sind deren Baustelle.
5. **Kampfstatistik**: Rahmen und Auswahlfeld vereinheitlicht; Auswahl als Symbolreiter und Leerzustand als Symbol stehen aus.
6. **Weltkarte** (Marker, Legende, Textknöpfe) – Runde 4.
7. **Zielrahmen**: Name und Medaillon angepasst; Stufenring aufs Porträt (spiegelbildlich zum Spielerrahmen) steht aus.
8. **Tooltips**: Der Figur-Slot-Tooltip steht rechts neben der Figur; der WoW-Standardanker unten rechts für Leisten-Tooltips wurde bewusst nicht genommen – der Auftrag verlangte „über der Leiste“.
