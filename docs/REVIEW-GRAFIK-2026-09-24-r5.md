# Grafik-/UI-Review R5 (Endabnahme): Mertloch Chronicles, origin/main f81cda6 (Runde 4a–4c live)

Worktree `D:\Dev\MertlochChronicles-review-r5`, nur lesend, nichts committet. Pfade relativ zum Worktree.
Screenshots: `_review/shots/`, vergrößerte Ausschnitte: `_review/crops/`, Messwerte: `_review/report-*.json`, mobile-check: `_review/mobile-check/REPORT.md`, Szenenskript: `_review/szenen.mjs`.

## Prüfstand (eigene Ports 9460–9469 / 4260–4269, `BOOT_TRIES=450`)

| Prüfung | Ergebnis |
|---|---|
| `optimierung-r4a-check` | 9/9 grün |
| `optimierung-r4b-check` | 20/20 grün |
| `optimierung-r4c-check` | 9/9 grün |
| `optimierung-r3b-check` | 12/12 grün |
| `optimierung-r3a-check` | 19/19 grün (auch „Rechtsklick auf Ida“) |
| `mobile-check` (Kopie mit .jpg) | 2 von 98 Schritten mit Problemen, beide „Beute zeigt Reden“ (Lage, bekannt). 0 Tipp-Ziele < 44 px, 0 Paare < 8 px, 0 Lesetexte < 12 px |
| `hud:check` | rot, `hud-check.mjs:62` (erwartet die alte Reihenfolge des Spielmenüs) |
| `meter:check` | rot, `meter-check.mjs:41` (Esc bricht zuerst den Autoangriff ab) |
| `akt1b-check` | nicht gelaufen, braucht ein von Hand gestartetes Chrome |
| Konsole bei jedem Start | `404 assets/heroes/catalog.json` (Fehler) und die Warnung `apple-mobile-web-app-capable is deprecated` |

**Nicht messbar oder nur teilweise:**
- **Volle Effektstufe** (Regen-Schleier, Licht) lief nicht. Headless ohne Grafikkarte läuft nur die leichte Stufe.
- **„Einstellungen klappen im Kampf ein“:** In 18 Messungen (Kategorie Spiel mit 820 px und Tastenbelegung mit 1480 px, jeweils mit gesetztem Kampfzustand) blieb das Fenster offen. Stattdessen schiebt die Heldenlücke den Helden an den Rand (Punkt 6). Das Einklappen tritt nur auf, wenn keine Lücke existiert. Diesen Zustand habe ich mit den Einstellungen nicht herstellen können.
- **Leere beige Leiste unter dem Spielerrahmen** (`crops/leiste-unter-rahmen.jpg`, nach einem Kampf in `10-fenster-n.jpg`): In einer Nachprobe mit DOM-Suche nicht wieder aufgetreten. Die Quelle ist nicht zugeordnet. Vermutlich ist es eine Cast- oder Schwungleiste, die nach dem Kampf stehen bleibt.
- **Echte Handys:** Alle Handy-Bilder stammen aus der Emulation, Safe Areas nur bei `mobile-check`.
- **Echter Ortswechsel:** Der Zonentitel war in den Szenen per Teleport ausgelöst oder per Klasse erzwungen.

---

## Gesamturteil

Seit R4 ist der Abstand zu WoW deutlich kleiner geworden, am meisten bei der Weltkarte. Die großen Systembrüche sind weg. Übrig sind zwei Arten von Resten:
- **Handy-Randzustände**, die gegen die Nutzervorgaben verstoßen: Fließtext, Scrollen, Text über dem Helden.
- **Kompaktheit einzelner Fenster**: Leerflächen und feste Höhen.

| Bereich | Note (5 = WoW-Niveau) | Begründung |
|---|---|---|
| **Welt** | **4,5** | Stärkster Teil, Maluntergrund auf Stardew-Niveau. Geschichtete Schrift: Zonentitel mit Vorrang, gestapelte Namensschilder, goldene „!“ und die Wegmarke auf der Kreisbahn wirken wie aus einem Guss (`01-hud-ruhe.jpg`, `80-ida.jpg`, `crops/zone-clantreff-titel.jpg`). Abzug: Neutrale Tiere tragen dauerhaft ein volles Schild mit Balken („Grillgut-Gans“ ×3 in `80-ida.jpg`). Das Holzschild „Baustelle der Bude“ liegt weiter unter dem Zonentitel. |
| **HUD (Desktop)** | **4** | Die Anordnung entspricht WoW: Rahmen links oben, Zielrahmen daneben mit Stufenplakette, Minikarte mit Zonenschild, Verfolgung darunter, Leiste unten mittig, Menüleiste unten rechts. Die Verfolgung ist WoW-treu (`crops/verfolgung.jpg`). Abzüge: Der einzeln belegte Platz ⇧1 schwebt als loses Kästchen über der Leiste (`crops/aktionsflaeche.jpg`). Im Kampf stapeln sich Fehlerzeile, Zonentitel und Namensschild in einem 150-px-Band (`30-hud-kampf.jpg`). Das Zielporträt zeigt nur den Rücken des Keilers (`crops/zielrahmen.jpg`). |
| **Hauptfenster** | **4** | Einheitliche Rahmen, Titelzeile mit Symbol, Versal, Kappe und ×, oben bündig bei y=183, nichts scrollt (`11-vier-fenster.jpg`, alle `measure` leer). Abzüge: Die Aufträge haben ≈ 195 px Leerband zwischen Liste und Detail (`crops/fenster-j.jpg`). Filter-Symbole oben und Bereichsreiter unten sind zwei Symbolreihen mit ähnlichen Motiven (Hütte/Haus). Die Unterkanten liegen bei 668/728/531/575 und sind damit unruhig. |
| **Karte** | **4** Desktop, **4** Handy quer, **3,5** Handy hoch | Vorher Note 2. Jetzt: Symbole, Bündel, POI-Tooltip auf WoW-Niveau (`crops/karte-hover-poi.jpg`), Werkzeuge in der Titelzeile, kein Blättern. Abzüge: Die Gruppentrenner sind 14-px-Symbole, die das Zeilensymbol nur wiederholen (`crops/karte-trenner.jpg`). **7 von 11 Lagernamen** sind abgeschnitten, weil es Auftragssätze sind (`crops/karte-seitenleiste.jpg`). Nicht verfolgte Zielgebiete sind auf den Weizenfeldern fast unsichtbar (`crops/karte-zielgebiete.jpg`). Bude, Verlies und die Nadel „Verfolgen“ fehlen. |
| **Handy** | **3** | Die Fenster sind sauber (mobile-check 0/0/0, Spielmenü 320 px mit 5×2 Kacheln, Figur im 52er-Raster). Das HUD verstößt gegen die Vorgaben: zwei 280–590 px breite Textbalken („4 × PFANDDACHS BESIEGEN 0/4 65 m“, „NEUER KNIFF!“) und die Pergamentkarte „Neuer Auftrag: …“. **Auf 320×568 liegt diese Karte genau auf dem Helden** (`90-handy-klein-hud.jpg`). Die Einstellungen scrollen und zeigen Fließtext (Punkt 1). |
| **Nebenfenster** | **3** | Die Einstellungen am Desktop sind ordentlich (28-px-Zeilen, eigene Symbole). Abzüge: Die Tastenbelegung ist 1480 px breit, liegt über der Verfolgung und kürzt 6 Beschriftungen („Sprechen / Benut…“, `15-einst-keys.jpg`). Die Kampfstatistik hat eine feste Höhe mit ≈ 90 px Leerfläche bei einer Zeile und ein Auswahlfeld über die volle Breite (`crops/kampfstatistik.jpg`). Das Gespräch ist gut (Andocken links, Porträt, ein Knopf). |

---

## Endliste für die letzte Umsetzung (priorisiert)

Legende: ✅ gehört ins Paket für 2–3 Stunden. Summe der ✅-Punkte ≈ 2,5–3 h.

### 1. ✅ Handy-Einstellungen: scrollen und Fließtext · M
- **Ort:** Einstellungen am Handy, alle Lagen (`92-handy-hoch-settings.jpg`, `92-handy-quer-settings.jpg`, `92-handy-klein-settings.jpg`).
- **Problem:**
  - Gemessen scrollt `opt-scroll` quer mit 324/163 und klein mit 438/341.
  - Die Reiterleiste läuft waagerecht über (463/326 hoch, 463/256 klein): „Ton“ ist halb, „System“ gar nicht sichtbar.
  - Unter jeder Zeile stehen 1–3 Zeilen Erklärtext („Beute wandert nach dem Kampf von selbst in den Rucksack.“).
  - Quer bleiben für die Zeilen nur 163 px, weil „Standard/Schließen“ eine eigene 80-px-Fußzeile belegen.
- **Lösung:**
  - Reiter nur als Symbol: 6 × 44 px mit 8 px Abstand (= 304 px). Den Namen im Langdruck-Tooltip zeigen, die gewählte Kategorie als Wort in der Titelzeile („EINSTELLUNGEN · SPIEL“).
  - Die Erklärung wandert in ein ⓘ (Tippen = Tooltip), genau wie am Desktop mit `data-tooltip-note`. Zeilen einzeilig 44 px.
  - „Standard“ wird ein ↺-Symbolknopf in der Titelzeile, „Schließen“ entfällt (× reicht). Die Fußzeile fällt damit weg.
  - Quer die Zeilen in 2 Spalten (506 px Fensterbreite, 2 × 240). Interface mit 11 Zeilen = 6 Reihen × 44 = 264 ≤ 278.
- **Datei/Selektor:** `options-ui.js` (Zeile 69 `opt-window`, Zeilenbau mit `row(T.x,T.xHint,…)` – auf Touch den Hint nicht als `<small>` rendern), `fenster-r4c.css` (`.touch-mode .popup-settings .opt-nav`, `.opt-scroll`, `.opt-foot`).
- **Mess-Soll:** `optimierung-r3b-check` bzw. `r4c-check` misst alle 6 Kategorien auch in 844×390 / 390×844 / 320×568, `scrollHeight ≤ clientHeight` und `scrollWidth ≤ clientWidth`.

### 2. ✅ Handy-HUD: Textbalken oben und Meldungskarte auf dem Helden · S
- **Ort:** Handy hoch und klein (`90-handy-hoch-hud.jpg`, `90-handy-klein-hud.jpg`, quer `90-handy-quer-hud.jpg`).
- **Problem:**
  - `#touchWaypoint` ist ein 560 × 80 px (Gerätepixel) großer Balken mit Versaltext, auf 320 px gekürzt zu „4 × PFANDDACHS BESIEGEN 0…“.
  - `#touchLesson` „NEUER KNIFF!“ ist ein zweiter gleich großer Balken darunter. Beide verdecken die Kirche und damit die halbe obere Welt.
  - Der Toast „Neuer Auftrag: Dachse im Leergut“ ist eine beige Pergamentkarte. Auf 320×568 liegt er bei y≈285–335 CSS-px, **genau über dem Helden** (Mitte y≈284). Nur „Fiete“ schaut daneben hervor.
- **Lösung:**
  - `#touchWaypoint` als kompakte Pille: Auftragssymbol 20 + „0/4 · 65 m“ in Nunito 800 13 px, Höhe 36 px, Breite nach Inhalt (max. 60 %). Den Auftragstitel nur als Tooltip. Tippen öffnet wie heute das Auftragsfenster.
  - `#touchLesson` entfällt als Balken. Stattdessen ein „!“-Punkt am Kniffe-Symbol im Spielmenü (das „!“ am Menüknopf gibt es schon).
  - Toast im Hochformat oben unter der Pille (top = 102 + safe-top + 44), einzeilig, dunkler Grund wie die Desktop-Meldungszeilen statt Pergament, `max-width: calc(100% - 104px)`. So ist er nie über der Bildmitte.
- **Datei/Selektor:** `mobile-controls.js` (`.touch-topline`, `#touchWaypoint`, `#touchLesson`), `mobile.css:11,19`, `mobile-polish.css:89–91`, `bierdeckel.css:412,440`.
- **Mess-Soll:** Kein HUD-Text-Kasten schneidet den Heldenkasten (±60 px um die Bildmitte) in hoch, quer und klein.

### 3. ✅ Aufträge: Leerband zwischen Liste und Detail · S
- **Ort:** J, Desktop (`crops/fenster-j.jpg`, `20-auftraege.jpg`) und Handy hoch (`92-handy-hoch-quest.jpg`: Liste endet bei ≈ 250, Fenster 561 hoch).
- **Problem:** Bei 3 Aufträgen liegt zwischen der letzten Zeile (y≈360) und dem Detailkopf (y≈575) ein Leerband von ≈ 195 px. `.ql-list` wächst mit `flex:1 1 auto`, das Fenster hat eine feste Höhe von 545 px.
- **Lösung:**
  - `.ql-list{flex:0 1 auto}`, damit das Detail direkt unter der Liste folgt.
  - Fensterhöhe nach Inhalt (Regel „Höhe nach Inhalt“ aus 3b auch für `popup-quest`), `min-height` ≈ 360, `max-height` wie heute 545. Bei vielen Aufträgen blättert der vorhandene `ql-pager`.
  - Am Handy ebenso: das Fenster endet unter der letzten Zeile plus den Bereichsreitern.
- **Datei/Selektor:** `fenster-r2.css:19` (`.ql-list`), `fenster-r2.css:14–16`, Höhenregel in `popup-windows.js`/`fenster-r3.css:7–8`.

### 4. ✅ Tastenbelegung: 1480 px, liegt über der Verfolgung, 6 Namen gekürzt · S
- **Ort:** Einstellungen → Tastenbelegung (`15-einst-keys.jpg`, `17-tasten-im-kampf.jpg`).
- **Problem:**
  - Das Fenster reicht von 274 bis 1754 und liegt damit über der Verfolgung (1712–2002).
  - Es kürzt 6 Beschriftungen: Aufsitzen/Absitzen, Sprechen/Benutzen, Aggro-Radius zeigen, Ziel übernehmen (Gruppe), Fahrzeuge & Reittiere, Spielmenü/Abbrechen.
  - Die Tastenkappen „UMSCHALT+TAB“ sind ≈ 8 px Schrift.
  - Unter den Spalten bleiben ≈ 120 px leer.
- **Lösung:**
  - **3 Spalten** statt 4. ≈ 59 Zeilen / 3 = 20 × 24 px = 480 ≤ 499 Höhe, also passt es ohne Blättern.
  - Kappen kurz schreiben: „⇧1“, „⇧Tab“, „Strg+“ (WoW: „S-1“), Kappenbreite 64 statt 80, Beschriftung 160 px.
  - Fenster ≈ 1180 px, mittig (422–1602). Frei bleiben Verfolgung und Minikarte.
  - Nebenbei: Alle Einstellungsfenster enden bei y=803 und schneiden die Leiste (Oberkante 790) um 13 px. Die Oberkante auf 170 legen oder die Höhe 600 statt 620.
- **Datei/Selektor:** `fenster-r4c.css` (`.popup-settings.opt-cat-keys`, Spaltenzahl), `options-ui.js` (Kappentext über eine `keyLabel()`-Kurzform), `content/keybinds.js` (Anzeigenamen).

### 5. ✅ Weltkarte-Seitenleiste: Gruppentrenner und abgeschnittene Lagernamen · S
- **Ort:** Karte, Seitenleiste (`crops/karte-seitenleiste.jpg`, `crops/karte-trenner.jpg`).
- **Problem:**
  - Die Trenner sind ein 14-px-Symbol plus Linie. Das Symbol wiederholt nur das Zeilensymbol darunter („!“ über „!“-Zeilen), Information bringt es nicht.
  - Bei Lagern sind 7 von 11 Namen Auftragssätze und darum gekürzt („Festzelt-Schnorrer von der …“, „Kegelkönig Klaus zur Aussa…“, „Trauzeuge Timo vom Busda…“).
- **Lösung:**
  - Trenner als WoW-Questlog-Kopf: Symbol 16 + **ein Wort** in Jersey 13 px Gold gedimmt + Anzahl („AUFTRÄGE 4“, „TREFFPUNKTE 3“, „LAGER 11“, „HÄNDLER 4“), Höhe 20 px. Ein einzelnes Kopfwort ist Beschriftung, kein Fließtext (siehe Frage 1).
  - Lager in der Liste mit dem **Ortsnamen** führen (der Ort des Lagers, z. B. „Festplatz“, „Busdach“). Der Auftragssatz steht dann nur im Tooltip, dort ist er schon.
  - Wo es keinen kurzen Ort gibt, ein Feld `short` im Inhalt ergänzen.
  - Höhenbudget: 4 × 6 px mehr, die Leiste hat unten ≈ 60 px frei.
- **Datei/Selektor:** `atlas-ui.js` (`.wk-sep`, Zeilentext der Gruppe `camp`), `weltkarte.css:50–52`, Inhalt `content/minimap.js` → `WORLD_MAP_UI` (Gruppenwörter) bzw. Lagerdaten (`short`).

### 6. ✅ Modale Fenster (Einstellungen, Spielmenü) aus Heldenlücke und Einklappen nehmen · S
- **Ort:** Einstellungen im Kampf (`16-einst-im-kampf.jpg`: Held bei x=551; `17-tasten-im-kampf.jpg`: Held bei x=221, der Gegner hinter dem Fenster).
- **Problem:** Die Heldenlücke aus 4b schiebt den Helden neben das Einstellungsfenster, bei der Tastenbelegung bis an den linken Rand (221 von 2020). Die Kamera folgt, der Kampf spielt dann halb hinter dem Fenster. Ohne Lücke klappt das Fenster ein (Rest 4c). Beides passt nicht zu einem modalen Fenster: In WoW bleibt das Optionsfenster stehen, und die Welt liegt einfach dahinter.
- **Lösung:** `.popup-settings` und `.popup-menu` zählen in `hero-frame.js` nicht als Hindernis und bekommen in `hero-reveal.js` nie `hero-seethrough`. Solange ein modales Fenster offen ist, steht der Held mittig. Optional (Frage 3): ein Abdunkeln der Welt auf 35 %.
- **Datei/Selektor:** `hero-reveal.js:35` (Filter `wins` um `:not(.popup-settings,.popup-menu)`), `hero-frame.js` (Hindernisliste).

### 7. ✅ Heldenlücke rutscht an den unteren Rand · S
- **Ort:** Fünf Fenster offen, C+J+P+I+N (`40-held-fuenf-fenster.jpg`).
- **Problem:** Gemessen steht der Held bei 1382/722, also 81 % der Bildhöhe, 68 px über der Aktionsleiste und rechts daneben, eingeklemmt zwischen Leiste und Menüleiste. Er ist dort schwer zu finden. Der Rand unten rechnet mit 12 % der Bildhöhe (108 px), die Aktionsleiste ist aber 110 px hoch, dazu kommt die Figurhöhe.
- **Lösung:**
  - Rand unten = Oberkante der Aktionsfläche − 1 Figurhöhe (≈ 120 px) statt 12 % der Bildhöhe. Seitlich kein Fußpunkt neben der Aktionsleiste.
  - Senkrechten Versatz auf höchstens +25 % der Bildhöhe unter die Mitte begrenzen. Reicht das nicht, klappt wie ohne Lücke ein Fenster ein.
  - Beim ersten Sprung in die Lücke einmal den Bodenring pulsen (0,4 s), damit das Auge folgt.
- **Datei/Selektor:** `hero-frame.js:19` (`margin.bottom`), `hero-reveal.js` (Hindernis Aktionsfläche mit Figurhöhe aufblähen).

### 8. ✅ Kampfstatistik: feste Höhe, Leerfläche, breites Auswahlfeld · S
- **Ort:** V (`31-kampfstatistik.jpg`, `crops/kampfstatistik.jpg`).
- **Problem:** Bei einem Teilnehmer bleiben ≈ 90 px der Balkenfläche leer. Das Auswahlfeld „Aktueller / letzter Kampf“ ist eine 36-px-Zeile über die volle Breite.
- **Lösung:**
  - Höhe nach Zeilen: mindestens 1, höchstens 8 Zeilen à 28 px.
  - Den Kampf als ‹ › Blätterer mit Uhr-Symbol in die Fußzeile neben „8,5 s“ (so stand es schon im R4-Zielbild). Das Auswahlfeld entfällt, der Name des Kampfs steht im Tooltip.
- **Datei/Selektor:** `meter-ui.js` (`.meter-scroll`, `#meterSegment`), `meter.css`.

### 9. Zielgebiete auf der Karte: kaum sichtbar, nur ein Symbol · M (Kontrast allein S ✅)
- **Ort:** Karte (`crops/karte-zielgebiete.jpg`).
- **Problem:**
  - Die nicht verfolgten Gebiete sind 8 % Gold mit goldenem Strichrand und damit auf den Weizenfeldern (gleiche Farbe) praktisch unsichtbar.
  - Das verfolgte Gebiet ist klein, nur Nadel und Kralle heben es heraus.
  - Es gibt nur die Kralle (besiegen), keine Hand (sammeln) und keine Sprechblase (reden).
- **Lösung:**
  - Randfarbe dunkle Tinte `#5a3a14` mit 1,5 px Strich und 60 % Deckkraft. Füllung als Schraffur in Tinte statt Gold, damit sie auf Feld und Wiese gleich wirkt.
  - Verfolgtes Gebiet: Gold 18 % mit 2-px-Tintenrand und weißer Außenkante.
  - Symbole nach Zieltyp aus `map-symbols.js`: `hand` für Sammelziele (sobald `worldAreas` sie liefert), `speech` für Reden.
- **Datei/Selektor:** `cartography.js` (`worldAreas`, `drawWorldLayer`, Gebietsfarben), `map-symbols.js`.

### 10. ✅ Neutrale Tiere mit Dauerschild · S
- **Ort:** Welt (`80-ida.jpg`: drei „Grillgut-Gans“ mit gelbem Balken bei vollem Leben).
- **Problem:** Harmlose Tiere tragen dieselbe Schildgröße wie Gegner. Die Wiese liest sich wie ein Kampfplatz, außerdem widerspricht es „Namen nur beim Mouse-Over“. WoW zeigt über Kleintieren kein Schild.
- **Lösung:** Neutrale Einheiten, die weder Ziel noch Angreifer sind, bei vollem Leben ohne Schild zeigen. Name und Balken nur unter der Maus, als Ziel oder nach dem ersten Treffer. Feindliche Schilder bleiben wie sie sind.
- **Datei/Selektor:** `renderer.js` (`nameplate`/`stackPlates`, Bedingung vor dem Zeichnen), `unit-colors.js` (Reaktion `neutral`).

### 11. Weltkarte: Bude, Verlies-Eingang, Nadel „Verfolgen“ · M
- **Ort:** Karte (`60-karte-start.jpg`; die Bude erscheint nur als Bündel „3“ aus Nyalol, Olli und Ron, `report-settings_map.json` → `karteOrte`).
- **Problem:**
  - Der wichtigste Ort des Spiels, die Bude, hat kein eigenes Symbol. Das Verlies fehlt ganz.
  - Aufträge lassen sich auf der Karte nicht verfolgen.
- **Lösung:**
  - Bude als Ort der Gruppe Treffpunkte: Haus-Symbol mit Tintenname „Bude“ ab Zoom 1 (wie Pfandhof).
  - Verlies als Tor-Symbol in einer Gruppe „Verliese“ mit sicherem Laufpunkt am Eingang.
  - In Auftragszeilen links vom Stiefel ein 28-px-Nadelsymbol (verfolgen an/aus, gold wenn aktiv). Es nutzt dieselbe Funktion wie das Auge im Auftragsfenster (`[data-ql-track]`).
- **Datei/Selektor:** `cartography.js` (`mapPlaces`), `map-symbols.js` (`house`, `gate`), `atlas-ui.js` (Zeilenbau, Gruppe `quest`).

### 12. ✅ Konsole sauber: 404 auf `catalog.json`, veraltetes Meta-Tag · S
- **Ort:** jeder Start (`report-*.json` → `console`).
- **Problem:** `hero-layers.js:27` probt absichtlich eine Datei, die nicht existiert. Ergebnis: ein roter Konsolenfehler bei jedem Start, dazu die Chrome-Warnung zu `apple-mobile-web-app-capable`.
- **Lösung:**
  - Entweder `assets/heroes/catalog.json` als leeren Katalog `{"version":1,"bodies":{}}` ausliefern (plus Precache) und prüfen, dass die Auswahl im Startschirm bei leerem Katalog aus bleibt.
  - Oder die Probe hinter einen Schalter im Inhalt legen (`HERO_LAYERS:false`), den die Sprite-Pipeline beim Erzeugen der Dateien umstellt.
  - In `index.html:7` zusätzlich `<meta name="mobile-web-app-capable" content="yes">` setzen.
- **Datei/Selektor:** `hero-layers.js:24–27`, `index.html:7`, `precache-manifest.js`.

### 13. ✅ Rote Prüfskripte auf den gewollten Stand bringen · S
- **Ort:** `scripts/hud-check.mjs:62`, `scripts/meter-check.mjs:41` und `:75`, `scripts/akt1b-check.mjs:93`.
- **Problem:** Die Skripte erwarten Stände vor 3a/3b. Rote Gates auf main verdecken echte Regressionen.
- **Lösung:**
  - hud: die Liste auf die neue Menüfolge setzen (Einstellungen, Tastenbelegung, UI bearbeiten, Hilfe | Berufe, Fahrzeuge & Reittiere, Söldner | Charakterauswahl, Zum Anmeldebildschirm | Zurück zum Spiel).
  - meter:41: das erste Esc bricht den Autoangriff ab, erst das zweite öffnet das Menü.
  - meter:75: `.meter-entry` gibt es nicht mehr, also über V oder Einstellungen → Interface → Kampfstatistik „Öffnen“ gehen.
  - akt1b:93: die Zusicherung „Ausrüstung untereinander“ an das 52er-Raster aus 4c anpassen und auf `browserSession` umstellen, damit sie ohne Hand-Chrome läuft.
- **Datei:** die drei Skripte (keine Spieländerung).

### 14. Handy hoch: Karte und Ortsliste nutzen die Höhe nicht ganz · S
- **Ort:** `92-handy-hoch-map.jpg` (Fenster endet bei 577, erste Kniff-Reihe bei ≈ 635, dazwischen die Seitenkappe „1/2“), `93-handy-quer-ortsliste.jpg` (quer jetzt 5 Zeilen, 5 Seiten).
- **Problem:** Hochkant bleiben ≈ 58 px Welt zwischen Karte und Kniff-Knöpfen ungenutzt. Quer ist die Ortsliste mit 5 Seiten brauchbar, aber lang.
- **Lösung:**
  - Hochkant endet das Kartenfenster an der Oberkante von `#touchActions` − 8 statt über `.touch-action-head`. Die Seitenkappe „1/2“ ist bei offenem Fenster ohnehin nutzlos und kann so lange ausgeblendet werden.
  - Quer in der Ortsliste die Gruppentrenner auf 0 px setzen und Gruppen über das Zeilensymbol unterscheiden. Das ergibt 6 Zeilen je Seite.
- **Datei/Selektor:** `weltkarte.css` (Handy-Maße), `popup-windows.js` (`touchPopupBounds` für `popup-map`), `mobile.css` (`.touch-action-head` bei `:has(.game-popup)`).

### 15. Aufträge: zwei ähnliche Symbolreihen · S
- **Ort:** J (`crops/fenster-j.jpg`: oben Filter Rolle, Hütte, Haken; unten Bereiche Brett, Haus, Foto).
- **Problem:** Hütte und Haus bedeuten verschiedene Dinge (Filter „Bude“ bzw. Bereich „Bude“) und sehen fast gleich aus. Die Filter gelten nur im Bereich „Auftragsbuch“.
- **Lösung:** Den Filter „Bude“ streichen, weil der Bereich „Bude“ dasselbe zeigt. Oben bleiben „Offen“ und „Erledigt“ als Zweierschalter. Die Bereichsreiter unten bekommen die aktive Goldkante wie die Figur-Reiter.
- **Datei/Selektor:** `questlog-ui.js:79` (`T.filters`), `questlog-window.js:14,50`, `fenster-r2.css:79–82`.

**Paket für 2–3 Stunden:** 2, 3, 4, 5, 6, 7, 8, 10, 12, 13 (je S, zusammen ≈ 2 h) plus 1 (M, ≈ 1 h) oder ersatzweise der Kontrastteil von 9. Die Punkte 11, 14 und 15 und der Symbolteil von 9 gehören in eine spätere Runde.

---

## Was bewusst so bleiben soll (Schutzliste)

- **Weltkarte:** Symbolsprache aus `map-symbols.js` (Karte und Minikarte gleich), POI-Tooltip mit Art, Stufe und Entfernung, Bündel mit Zahl und Tooltip-Liste, Titelzeile „MERTLOCH · MAIFELD“ mit Trichter, Zu mir und Übersicht, OSM-Nennung klein auf der Karte, gemalter Untergrund, Chat bei offener Karte verborgen.
- **Minikarte** mit Zonenschild darüber und Uhr, die Symbol-Tooltips.
- **Zonentitel** (Gold, Jersey, Unterzeile) und das Zurücktreten der Weltschrift auf 18 %/40 % während der Einblendung.
- **Namensschilder als Einheit** mit Stapeln bis drei Lagen und Klemmen am Rand. **NPC-Namen dauerhaft** (entschieden).
- **Wegmarke** als goldener Pfeil auf der Kreisbahn um den Helden, mit Entfernung.
- **Auftragszeichen** „!“ und „?“ in Gold mit Kontur, gleiche Form in Welt, Karte und Liste.
- **Verfolgung** rechts unter der Minikarte (Titel gold, Ziel, Zähler und Meter rechtsbündig), Hofprobe als Auftrag darin.
- **Zielrahmen** mit Stufenplakette in Schwierigkeitsfarbe und gleicher Farblogik wie das Namensschild (`unit-colors.js`).
- **Aktionsfläche** 122 px mit Haltung im Rahmen, Messingstrich und Tastenkappen.
- **Fensterdock** oben bündig bei y=183 mit einheitlicher Titelzeile. **Heldenlücke** als Prinzip (nur die Ränder und die modalen Fenster ändern, Punkte 6/7).
- **Spielmenü** Desktop als WoW-Liste mit Tastenkappen und Gruppen; Handy als 5×2-Kacheln + Knöpfe, modal bis zur Unterkante.
- **Einstellungen Desktop:** feste Größe 820×620 (kein Springen beim Kategoriewechsel), eigene Kategoriesymbole, 28-px-Zeilen, Erklärung nur als Tooltip.
- **Handy-Fenster:** 52er-Raster der Figur, Rahmen verborgen bei offenem Fenster, 44-px-Ziele, kein Scrollen (außer Punkt 1).
- **Gegenstands-Tooltip** mit Vergleich, **Hilfe als Tastenliste**, **Gespräch links angedockt** mit Porträt.
- **Welt-Grafik** (Figuren, NPC, Häuser, Bude): nur nach Freigabe des Nutzers anfassen.

---

## Offene Designfragen an den Nutzer

1. **Kopfzeilen in Listen:** Sollen Gruppenköpfe (Weltkarte-Seitenleiste, später auch andere Listen) **ein Wort plus Anzahl** tragen, etwa „LAGER 11“ wie der WoW-Questlog? Oder bleibt es bei reinen Symbolen, dann größer (20 px) und ohne Wiederholung des Zeilensymbols? Ich empfehle das Wort: Es ist Beschriftung, kein Fließtext.
2. **Neutrale Tiere und harmlose Gegner:** Namensschild und Balken nur beim Überfahren, als Ziel oder im Kampf (WoW-Verhalten)? Oder dauerhaft wie heute? NPC-Namen bleiben in beiden Fällen dauerhaft.
3. **Modale Fenster (Einstellungen, Spielmenü):** Welt dahinter weiterlaufen lassen, Held darf verdeckt sein, kein Ausweichen (WoW)? Oder Welt abdunkeln bzw. im Einzelspiel pausieren? Punkt 6 funktioniert mit beiden Antworten.

---

## Screenshot-Pfade (alle unter `D:\Dev\MertlochChronicles-review-r5\_review\`)

- **HUD/Kampf:** `shots/01-hud-ruhe.jpg`, `30-hud-kampf.jpg`, `31-kampfstatistik.jpg`, `32-nach-kill.jpg`; Ausschnitte `crops/aktionsflaeche.jpg`, `aktionsflaeche-kampf.jpg`, `verfolgung.jpg`, `zielrahmen.jpg`, `hud-links-oben.jpg`, `menueleiste.jpg`, `minikarte.jpg`, `chat-links-unten.jpg`, `kampf-mitte.jpg`, `kampfstatistik.jpg`, `leiste-unter-rahmen.jpg`, `probe-rahmen.jpg`
- **Fenster:** `shots/10-fenster-{c,j,i,p,n,h,b}.jpg`, `11-vier-fenster.jpg`, `12-rucksack-tooltip.jpg`, `13-spielmenue.jpg`, `20-auftraege.jpg`; `crops/fenster-*.jpg`, `auftraege.jpg`, `spielmenue.jpg`, `item-tooltip.jpg`
- **Einstellungen:** `shots/14-einstellungen.jpg`, `15-einst-{game,interface,graphics,audio,keys,system}.jpg`, `16-einst-im-kampf.jpg`, `17-tasten-im-kampf.jpg`; `crops/einst-*.jpg`
- **Weltkarte:** `shots/60-karte-start.jpg`, `61-karte-hover-poi.jpg`; `crops/karte-voll.jpg`, `karte-seitenleiste.jpg`, `karte-trenner.jpg`, `karte-titelzeile.jpg`, `karte-hover-poi.jpg`, `karte-zielgebiete.jpg`, `minikarte-nah.jpg`
- **Welt:** `shots/70-zone-clantreff.jpg`, `71-clantreff-ruhe.jpg`, `80-ida.jpg`, `81-spawn-wegmarke.jpg`, `82-gegner-schilder.jpg`, `50-gespraech.jpg`; `crops/zone-clantreff-titel.jpg`, `clantreff-mitte.jpg`, `ida-mitte.jpg`, `wegmarke.jpg`, `gegner-schilder.jpg`, `gespraech.jpg`
- **Heldenlücke:** `shots/40-held-fuenf-fenster.jpg`, `41-held-fuenf-laufen.jpg`
- **Handy:** `shots/90-handy-{quer,hoch,klein}-hud.jpg`, `91-handy-{quer,hoch,klein}-menue.jpg`, `92-handy-{quer,hoch,klein}-{quest,book,person,bag,talents,map,settings}.jpg`, `93-handy-{quer,hoch,klein}-ortsliste.jpg`
- **mobile-check:** `mobile-check/REPORT.md` und Bilder; Prüfskript-Bilder unter `visual-review/optimierung-r4{a,b,c}/`, `visual-review/optimierung-r3{a,b}/`
- **Logs/Messwerte:** `r4a.log`, `r4b.log`, `r4c.log`, `r3a.log`, `r3b.log`, `mobile.log`, `hud.log`, `meter.log`, `s1.log`–`s5.log`, `report-*.json`
