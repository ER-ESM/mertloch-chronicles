# Grafik-/UI-Review R4: Mertloch Chronicles (origin/main 7890c30 = Runde 3b, 2026-09-24)

Worktree `D:\Dev\MertlochChronicles-review-r4`, nur lesend, nichts committet. Pfade relativ zum Worktree.
Screenshots: `_review/shots/`, zweifach vergrößerte Ausschnitte: `_review/crops/`, Messwerte: `_review/report-*.json`, mobile-check: `_review/mobile-check/REPORT.md`.

**Gelaufen (eigene Ports):**
- `optimierung-r3b-check` (CDP 9460 / Server 4260): 12 grün.
- `optimierung-r2a-check` (9462/4262): 13 grün.
- `minimap-check` (9463/4263): 13 grün.
- `optimierung-r3a-check` (9461/4261, zweiter Lauf 9469/4269): **zweimal rot an derselben Stelle**, „Rechtsklick auf Ida: Figur läuft los“ (`scripts/optimierung-r3a-check.mjs:107`). Davor 8 Prüfungen grün. Ein Teillauf scheiterte zusätzlich an „Game did not initialize“ (Last). Das ist ein Spielablauf-Befund, kein Grafikbefund, aber reproduzierbar auf dem Live-Stand und damit ein Kandidat für eine Regression durch 3b (Klickdurchlässigkeit eingeklappter Fenster oder Treffertest). Ursache nicht geklärt.
- `mobile-check`: Kopie `_review/mobile-check.mjs` mit `.jpg` statt `.png` (PNG-Falle), CDP 9464, eigener Server 4264. 98 Schritte, 6 mit Problemen, 6 Tipp-Ziele < 44 px, 86 Paare < 8 px.
- Eigene Szenen: `_review/szenen.mjs` (Szenen `map, zone, labels, rain, hud, windows, extra, handy-quer, handy-hoch, handy-klein`) auf 9465–9468 / 4265–4268.

**Nicht messbar / Einschränkungen:**
- **Regen** lief in der „leichten“ Effektstufe („ohne Grafikkarte“, `mertloch.state().fx.mode`). Schleier, Abdunkeln und Wetterleuchten der vollen Stufe habe ich nicht gesehen. Bewertet ist nur die leichte Stufe.
- **Echter Gebietswechsel** ist schwer zu treffen. Die Aufnahmen `70–75` erzwingen `.zone-show` an echten Orten. `74-zone-echt-kirchstrasse.jpg` und `85-regen-kirchstrasse.jpg` zeigen den Titel nach echtem Ortswechsel mit demselben Bild.
- **Namensschild-Überdeckung durch den Zonentitel** ist nur für Lehrer und Ida rechnerisch gemessen (Weltposition → Bildschirm über `mertloch.state().viewport`). Für Dorfbewohner, Auftraggeber und Gegner gilt die Sichtprüfung.
- **„Alles“ links in der Welt** (x≈40, y≈660, fast unsichtbar, in fast jedem Weltbild): Der Text liegt nicht als eigenes Blatt-Element im DOM. Vermutlich ist es der Reiter des ruhenden Chatfensters. Nicht eindeutig zugeordnet.
- Kampfstatistik: Mein Ausschnitt per Selektor griff nicht. Der Ausschnitt `_review/crops/kampfstatistik.jpg` stammt darum aus `11-vier-fenster.jpg`.

---

## Stand der Runde-3-Punkte

| Punkt (3a/3b) | Urteil | Beleg |
|---|---|---|
| 3b-1 Handy neue Oberfläche, nichts scrollt | **quer/hoch sauber, 320 px kaputt** | Quer 844×390 und hoch 390×844: kein Fenster scrollt, 0 Ziele < 44 px (`report-handy-*.json`). **320×568:** Das Spielmenü ist 296×283 hoch, sein Inhalt 397/223 bei `overflow:hidden`. Unter „Einstellungen/Tastenbelegung“ sind UI bearbeiten, Hilfe, Charakterauswahl, Abmelden und „Zurück zum Spiel“ **abgeschnitten und nicht erreichbar**, nicht nur verschoben (`91-handy-klein-menue.jpg`). Figur 227/223 knapp abgeschnitten. „Fahrzeu…“ wird gekürzt. |
| 3b-2 Höhe nach Inhalt | **sauber** | Kniffe 348 statt 545, Gespräch 10 Zeilen (r3b-check). Aufträge behalten die volle Höhe mit ≈ 200 px Leerband zwischen Liste und Detail (`11-vier-fenster.jpg`). Das ist bewusst so, bei mehr Aufträgen füllt es sich. |
| 3b-3 Gegenstands-Tooltip | **sauber** | Megafon 300×291, Vergleich daneben, Shift 321 (r3b-check). |
| 3b-4 Hilfe als Tastenliste | **sauber** | 720×366, drei Spalten, Kappe + Wort (`crops/fenster-h.jpg`). Kleinigkeit: Die Kopfsymbole mischen Linien-Icons (Bewegen, Fenster, Kampf, Beute) mit einem gemalten Haus (Dorf). |
| 3b-5 Aktionsfläche 122 px | **sauber, eine Kante** | Haltung im Rahmen, Messingstrich, zweite Leiste spaltengenau (`crops/aktionsflaeche.jpg`). Ein einzeln belegter Platz ⇧1 hat eine eigene dunkle Rundplatte und steht darum weiter wie ein loses Kästchen über Platz 1. |
| 3b-6 Zonentitel nie auf Fenstertiteln | **mit Fenstern sauber, ohne Fenster mit Mängeln** | Mit Fenstern bei y 102–161, keine Titelzeile getroffen (r3b-check). **Ohne Fenster** liegt er bei 18vh (164–230) auf der Welt: auf Bärbel und Gisela (`75-zone-braugarten-dy85.jpg`), auf Hedwigs „!“ am Clan-Treff (`72-zone-clantreff.jpg`), auf dem Weltschild „Baustelle der Bude“ (`80-ida-auftragszeichen.jpg`), 20 px über „Poo-Tang · Mertloch“ und auf den Wimpeln (`crops/regen-mitte.jpg`). → Befund 3. |
| 3b-7 Fenster klappen ein | **sauber** | r3b-check 7, r2a-check 10. |
| 3b-8 Tooltips nicht auf dem Auslöser | **sauber** | r3b-check 8. |
| 3b-9 Einheitliche Knöpfe/Fenster | **mit Mängeln** | Rucksack-Kopf 38 px, sauber. Die Kampfstatistik bleibt ein Fremdkörper (Befund 12). Einstellungen: Interface 740/438, Grafik 492/438 und Tastenbelegung 1877/438 **scrollen**. Der r3b-check prüft nur die erste Kategorie „Spiel“ (Befund 7). |
| 3a-1 Autopilot stoppt, Karte schließt | **sauber (Sicht)** | nicht erneut gemessen, r3a-check-Teile 1–5 grün |
| 3a-6 Zielgebiet als goldene Fläche | **mit Mängeln** | Auf der Karte stehen bei „Alles“ drei blasse Kreise **ohne Beschriftung** (`60-karte-start.jpg`). Die Beschriftung („Pfandkeiler von den Trümmern jagen“) erscheint nur mit Filter „Aufträge“ (`63-karte-filter-auftraege.jpg`), weil `textLabel` sie bei Kollision still verwirft (`cartography.js`, `areaLabels`). Das verfolgte Gebiet unterscheidet sich vom nicht verfolgten nur durch Strich 2 statt 1,2 px. |
| 3a-8 „?“/„…“ über Ida, Auftragszeichen | **sauber** | Große goldene „!“ mit dunkler Kontur, gut lesbar (`crops/regen-mitte.jpg`, `crops/wegmarke.jpg`). |
| Rest 3b-1 Figur-Puppenplätze am Handy | **offen** | mobile-check: hoch 5 px, quer 5 px, klein 3 px zwischen Kopf/Schultern/Hals/Brust/Ringen (≈ 70 der 86 Paare) |
| Rest 3b-2 Spielmenü 320 px | **offen, schlimmer als beschrieben** | Es scrollt nicht leicht, es schneidet ab (siehe oben). |
| Rest 3b-3 Hochkant: Fenster über dem Spielerrahmen | **mit Mängeln** | Das Fenster beginnt bei y=30, der Rahmen bei 14. **Die Oberkante des Rahmens ragt 16 px als zweite Leiste über das Fenster** (`92-handy-hoch-map.jpg`, `92-handy-hoch-person.jpg`) und liest sich wie ein Renderfehler. |
| Rest 3b-4 Einstellungen | **mit Mängeln (Feinschliff-Baustelle)** | Befund 7 |
| Rest 3b-5 Kampfstatistik | **offen** | Befund 12 |
| Rest 3b-7 Zielrahmen-Stufenring | **offen** | Befund 11 |
| mobile-check Tipp-Ziele/Abstände | **unverändert zu 3b** | 6 Ziele < 44 px (alle Rucksack-Kopf, 360 px: 40×40), 86 Paare < 8 px (3b: 87). Nach Ort unten gruppiert. |

### mobile-check, Befunde nach Ort
| Ort | Gerät | Befund | Anzahl |
|---|---|---|---|
| Figur, Puppenplätze (Kopf↔Schultern, Hals↔Brust, Ring I↔II, Glücksbringer, Haupthand) | hoch 5 px, quer 5 px, klein 3 px | Abstand < 8 px | ≈ 76 Paare (Schritte figur, figur-platz, kampf-figur, drehen) |
| Talente, Knoten nebeneinander (Tresenkante↔Hausverbot, Leergut↔Kronkorken, Pfand↔Ruhe) | quer | 7 px | 6 Paare (talente, talent-tipp) |
| Rucksack-Kopf (Alles, Ausrüstung, Besser, Verpflegung, Material, Suchen) | klein 360 | 40×40 statt 44 | 6 Ziele |
| Zustandsprobleme (Spielstand/Lage) | hoch/quer/klein | Unterbrechung M-15 (hoch), Beute zeigt „Reden“ (hoch, quer: Ida steht daneben), Gespräch, Tod, Aufstehen (klein, Arena) | 6 Schritte, laut 3b wechselnd zwischen Läufen |

---

## Top 12 Befunde (nach Wirkung)

### 1. Weltkarte spricht eine andere Sprache als das restliche Spiel (Marker, Dauerschilder, Legende, Textknöpfe)
- **Ort:** Karte (M), Desktop. `_review/shots/60-karte-start.jpg`, `_review/crops/karte-legende.jpg`, `karte-seitenleiste.jpg`, `karte-hover-poi.jpg`.
- **Problem:**
  - Marker: rote Rauten mit Ziffern 1–11 (Lager), petrolfarbene Kreise mit 1–3 (Treffpunkte), braune Rauten mit W/B/R/K (Händler) und goldene Kreise mit „!“/„…“. Nur die Auftragszeichen sind Symbole. Die Ziffern erklärt keine Stelle der Oberfläche.
  - Neun Dauerschilder in roter Jersey-Tinte, zum Teil ganze Sätze („Kegelkönig Klaus zur Aussage bewegen“, „Trauzeuge Timo vom Busdach holen“).
  - Zweizeilige Textlegende mit 9 Einträgen, darunter die Fußzeile „Norden ist oben · Welt läuft weiter · © OpenStreetMap“.
  - Oben rechts die Textknöpfe „ZU MIR“ und „ÜBERSICHT“ neben „−/+“. Die fünf Filter links sind schon Symbole.
  - In der Seitenleiste der Block „DEIN NÄCHSTER HALT · Dachse im Leergut · Dein Auftragsziel · 65 m Luftlinie“ und der Goldknopf „WEG EINSCHLAGEN →“, obwohl die verfolgte Zeile direkt darüber steht.
  - Der Stempel „MERTLOCH · MAIFELD · REVIER 01“ unten rechts ist praktisch unsichtbar (`crops/karte-stempel.jpg`), also Rauschen.
  - Unter dem Kartenrahmen schauen zwei Chatzeilen hervor („Neue…“, `crops/karte-chat-unten.jpg`).
- **Vorschlag:** Zielbild 1.
- **Ursache:** `atlas-ui.js` (`atlasPanel()`: `.atlas-key`, `.data-note`, `.atlas-stamp`, `[data-zoom=player|fit]` als Text, `#atlasSelection`), `cartography.js` (`mapPlaces`: `number:i+1`, `'W'/'B'/'R'`, `SHOP_UI.mapSymbol`; `drawAtlas`: `fillText(h.number…)`, `pendingLabels`), `window-compact.js:101` (`map()` wandelt nur die Filter in Symbolknöpfe), `einzelfenster.css:10–22`, `fenster-r2.css:281–295`.
- **Überschneidung Feinschliff:** Runden 27, 38 und 50 (Papierkörnung, handgemalte Karte, Tinte). Der Maluntergrund bleibt, nur die Beschriftungsschicht ändert sich.
- **Aufwand:** L.

### 2. Weltkarte: kein POI-Tooltip, kein Hover, Markerklumpen verdeckt den Standort
- **Ort:** Karte. `61-karte-hover-poi.jpg`, `crops/karte-hover-poi.jpg`, `62-karte-zielgebiet-zoom.jpg`.
- **Problem:**
  - Über 6 Markern gefahren: **kein Tooltip, keine Hervorhebung**, der Mauszeiger bleibt Fadenkreuz (`report-map_zone.json` → `poiHover`). Die Minikarte hat Symbol-Tooltips (`.mm-tip`, minimap-check grün), die große Karte nicht. Man muss klicken, um zu erfahren, was „6“ ist.
  - 22 Marker, davon 12 Paare näher als 24 px (Clan-Treff: Hotspot, Treffpunkt 1, W, B, R liegen 4–21 px auseinander). Der eigene Pfeil liegt mitten in diesem Klumpen und ist ohne Hinsehen nicht zu finden.
  - Zielgebiete aus 3a: siehe Stand oben. Bei „Alles“ fehlt ihr Name, das verfolgte Gebiet ist kaum hervorgehoben.
  - Filter: Die fünf Symbolknöpfe schließen sich gegenseitig aus („Aufträge“ blendet Lager und Händler aus). WoW kombiniert: ein Trichter mit Häkchenliste.
- **Vorschlag:** Zielbild 1, Abschnitte „Tooltip“, „Bündeln“ und „Filter“. Den Tooltip-Baustein der Minikarte (`.mm-tip`, Zeilen je Symbol) wiederverwenden, nicht neu bauen.
- **Ursache:** `atlas-ui.js` (nur `canvas.onclick` mit `atlasHits`, kein `pointermove`), `cartography.js` (`hits.push({...r:18})`, Spielerpfeil ohne Vorrang und Halo).
- **Aufwand:** M.

### 3. Zonentitel ohne Fenster liegt auf Figuren, Namen, Auftragszeichen und Weltschildern
- **Ort:** jeder Ortswechsel ohne offenes Fenster. `75-zone-braugarten-dy85.jpg` + `crops/75-braugarten-titel-dy85.jpg` (Beleg des Orchestrators nachgestellt), `72-zone-clantreff.jpg`, `80-ida-auftragszeichen.jpg`, `crops/regen-mitte.jpg`.
- **Problem:**
  - Der Titel steht fest bei 18vh (y 164–230), der Held bei y≈450. Alles, was 85–110 Welteinheiten nördlich des Helden steht, landet unter dem Titel.
  - Gemessen am Braugarten: Held 85 E südlich der Lehrer → Bärbel auf y 227 und Gisela auf y 243. Der Schriftzug „KIRCHSTRASSE“ liegt auf ihren Körpern, ihre Namen kleben an seiner Oberkante.
  - Am Clan-Treff, dem meistbesuchten Ort, steht die Unterzeile „Geschützter Rastplatz“ auf Hedwigs goldenem „!“.
  - Bei „Mertlocher Fluren“ schneidet der Titel das Holzschild „Baustelle der Bude“.
  - Vier Textebenen konkurrieren an derselben Stelle: Zonentitel, NPC-Namen, Auftragszeichen, Weltschilder. WoW gewinnt das, weil der Titel groß und kurz ist *und* Namensschilder darunter zurücktreten.
- **Vorschlag:** Zielbild 2. Kern: Weltbeschriftungen im Titelband treten während der 3,6 s auf 25 % zurück (keine Verschiebung des Titels, keine neue Position).
- **Ursache:** `spielfluss.css:5` (`top:18vh`), `world-labels.js:6` (`HUD`-Liste kennt `.region-label.zone-show` nicht; `labelHudFree` blendet nur gegen HUD-Kästen aus), `renderer.js:188` (Anwendung der Prüfung auf die Schrift-Ebene).
- **Überschneidung Feinschliff:** Runden 2 (Auftragszeichen), 45 (NPC-Namen), 66 (Ortswechsel, von 3b zurückgebaut).
- **Aufwand:** S.

### 4. Namensschilder: Namen fallen weg, Balken bleiben und überlappen
- **Ort:** Gegnergruppen, z. B. Pfanddachse an der Kirchstraße. `crops/schilder-ohne-namen.jpg`, `71-zone-braugarten.jpg`, `30-hud-kampf.jpg` (Schild bei x 665 ohne Namen, „Pfandkeiler“ am oberen Bildrand halb abgeschnitten).
- **Problem:**
  - Von fünf Dachsen tragen zwei einen Namen. Drei zeigen nur „!“ + Balken, zwei Balken überlappen sich.
  - Eine Gans hat einen Balken ohne Namen.
  - Grund: Beschriftungen unter 11 E Schriftgröße werden bei Kollision verworfen, der Balken nicht. Dadurch entstehen namenlose Balken, die wie Ladebalken aussehen.
  - WoW stapelt überlappende Namensschilder senkrecht (Name + Balken als eine Einheit) oder blendet das ganze Schild aus, nie nur den Namen.
- **Vorschlag:**
  - Name und Balken sind eine Einheit mit einem gemeinsamen Kasten.
  - Bei Überlappung rückt das hintere Schild um die Schildhöhe (≈ 14 px) nach oben. Liegen mehr als drei übereinander, fällt das **ganze** Schild weg, außer beim Ziel und bei Angreifern.
  - Schilder, die den Bildrand schneiden, werden an den Rand geklemmt (y ≥ 8), nicht halb gezeichnet.
- **Ursache:** `renderer.js` (`label()`: `if(size<11&&labelBoxes.some(...))return` verwirft nur den Text; `nameplate` zeichnet den Balken unabhängig davon).
- **Überschneidung Feinschliff:** Runde 11 (Lebensbalken mit Rahmen und Verlustspur) bleibt.
- **Aufwand:** M.

### 5. Handy 320 px: Das Spielmenü schneidet sechs Einträge ab
- **Ort:** 320×568 (iPhone SE 1). `_review/shots/91-handy-klein-menue.jpg`.
- **Problem:**
  - Das Fenster ist 296×283 groß, weil es über Joystick und Kniffen enden muss. Der Inhalt ist 397 px hoch bei `overflow:hidden`.
  - Nicht erreichbar: UI bearbeiten, Hilfe (als Zeile), Charakterauswahl, Abmelden, „Zurück zum Spiel“. Das ist schlimmer als der Rest-Punkt „scrollt leicht“.
  - Gleiches Muster, knapp: Figur 227/223.
- **Vorschlag:**
  - Das Spielmenü ist modal. Es darf am Handy über die Touch-Steuerung reichen (max. Höhe = Bildschirm − Safe Areas − 28), solange es offen ist; Joystick und Kniffe sind dann ohnehin nutzlos.
  - Ab ≤ 600 px Höhe: die 7 Fensterkacheln in 4 Spalten mit 52 px (Symbol ohne Wort, Wort im Langdruck-Tooltip), dann 2 Spalten flacher Knöpfe mit 44 px.
  - Rechnung: 36 + 2 × 58 + 4 × 50 + 12 ≈ 364 px < 568 − 47 − 34.
- **Ursache:** `fenster-r3.css:7–8` (`overflow:hidden!important` für `.popup-menu`), `popup-windows.js` (Unterkante über den Touch-Steuerflächen).
- **Aufwand:** S–M.

### 6. Handy-Karte: Die Werkzeugleiste frisst die halbe Karte
- **Ort:** Karte am Handy. `92-handy-quer-map.jpg`, `92-handy-hoch-map.jpg`.
- **Problem:**
  - Quer ist das Fenster 506×346. Darin stehen zwei Reihen 44-px-Knöpfe (5 Filter; −, +, „ZU MIR“, „ÜBERSICHT“) mit ≈ 100 px. Die Karte selbst ist ≈ 470×165.
  - Hoch ist die Karte ≈ 330×245 bei 366×427 Fenster, darunter bleiben bis zum Joystick ≈ 150 px Welt ungenutzt.
  - Handy-Nutzer haben Zwei-Finger-Zoom und Ziehen; die Knöpfe „−/+“ sind dort Beiwerk.
- **Vorschlag:**
  - Filter als **ein** Trichter-Symbol in der Titelzeile, neben Karte/Orte/Ziel.
  - „Zu mir“ und „Übersicht“ als zwei 44-px-Rundknöpfe **auf** der Karte unten rechts (halbtransparent, wie die Minikarten-Knöpfe). −/+ entfallen am Handy.
  - Karte quer ≈ 490×290, hoch Fensterhöhe bis 560.
- **Ursache:** `fenster-r3.css:131–141` (`.atlas-toolbar{flex-wrap:wrap}`), `atlas-ui.js` (Textknöpfe).
- **Aufwand:** M.

### 7. Einstellungen: drei Kategorien scrollen, Zeilen zu hoch, Symbole doppelt belegt
- **Ort:** Spielmenü → Einstellungen. `crops/einstellungen.jpg`, `crops/einst-interface.jpg`, `einst-graphics.jpg`, `einst-keys.jpg`.
- **Problem:**
  - Gemessen: Interface 740/438, Grafik 492/438, Tastenbelegung 1877/438 (`report-extra.json`). Bei Interface enden die sichtbaren Zeilen bei „Auftragsverfolgung“.
  - Zeilen sind ≈ 48 px hoch. „Spiel“ nutzt 5 Zeilen und lässt ≈ 45 % des 820×620-Fensters leer.
  - Kategorie-Symbole sind wiederverwendete Fenstersymbole: Rucksack = Interface, Karte = Grafik, Kniffe-Werkzeug = Tastenbelegung, System = Spielmenü-Wappen. Der Rucksack bedeutet überall sonst „I“.
  - WoW-Maß: Einstellungszeilen ≈ 26–30 px, Kategorien links nur als Text.
- **Vorschlag:**
  - Desktop-Zeilen 32 px. Interface passt dann: 3 Köpfe × 28 + 11 Zeilen × 32 ≈ 436.
  - Grafik ebenso.
  - Die Tastenbelegung darf als einzige Liste blättern, wie in WoW, aber mit eingeklappten Gruppen als Standard (heute aufgeklappt).
  - Eigene Kategoriesymbole: Zahnrad-Spiel, Rahmen, Pinsel, Lautsprecher, Tastenkappe, Monitor.
- **Ursache:** `options-ui.js` (`.opt-scroll` mit `overflow:auto`, Zeilenmaß), `content/options.js`, `ui-chrome.css`.
- **Überschneidung Feinschliff:** **Runden 73–99 sind deren Baustelle.** Nur bewertet, nicht parallel umbauen. `optimierung-r3b-check` sollte alle Kategorien messen, nicht nur die erste.
- **Aufwand:** M.

### 8. Handy-Figur: Puppenplätze 3–5 px auseinander
- **Ort:** Figur hoch/quer/klein mit simulierten Safe Areas. `_review/mobile-check/hoch-figur.jpg`, `quer-figur.jpg`, `klein-figur.jpg`, eigene Aufnahmen ohne Safe Areas `92-handy-quer-person.jpg`, `92-handy-hoch-person.jpg`.
- **Problem:**
  - Sechs Plätze pro Spalte à 44 px mit 5 px Abstand (klein 3 px), das ergibt ≈ 76 der 86 Befundpaare.
  - Hochkant ist das Fenster 366×547 und hat unter den Werten ≈ 80 px leeren Platz (`92-handy-hoch-person.jpg`). Die Puppe könnte also höher werden, statt die Plätze zu quetschen.
  - Quer ist die Lebenszahl im Werteraster auf „1.095 / 1.…“ gekürzt.
- **Vorschlag:**
  - Hochkant: Puppenhöhe = Fensterinhalt − Werte, Plätze 44 + 8. Rechnung: 6 × 52 = 312 px, heute ≈ 260 px.
  - Quer: Waffenzeile (3 Plätze) unter die Puppe statt neben die Werte, dann haben die Spalten 6 × 52 = 312 bei 346 Fensterhöhe. Lebenszahl ohne „/ max“.
- **Ursache:** `fenster-r3.css` (Figur mobil), `window-compact.js` (`person`).
- **Aufwand:** S–M.

### 9. Handy hochkant: Der Spielerrahmen ragt über das Fenster
- **Ort:** Jedes Fenster hochkant. `92-handy-hoch-map.jpg`, `92-handy-hoch-person.jpg`, `91-handy-klein-menue.jpg`.
- **Problem:** Fenster ab y=30, Rahmen 14–108. Oben schaut ein 16-px-Streifen des Rahmens mit einem halben Namen hervor. Das wirkt wie ein zweites, verrutschtes Fenster.
- **Vorschlag:** Solange am Handy ein Fenster offen ist, den Spielerrahmen ausblenden (`visibility:hidden`, 120 ms). Leben sieht man im Kampf ohnehin nicht mit offenem Vollfenster. Alternative: Fenster exakt auf `top:14px` (bündig), dann deckt es den Rahmen ganz.
- **Ursache:** `fenster-r3.css` (hochkant: Fenster „oben am Rand“, 3b Rest 3), `mobile-polish.css`.
- **Aufwand:** S.

### 10. Wegmarke/Entfernungspfeil: blass, klein, ohne Kontur
- **Ort:** Welt, verfolgtes Ziel. `crops/wegmarke.jpg`, `80-ida-auftragszeichen.jpg` („68 m ◄“), `90-handy-hoch-hud.jpg` (Chatzeile liegt auf „65 m“).
- **Problem:**
  - Das cremefarbene Dreieck (≈ 14 px) ohne dunkle Kontur verschwindet auf Gras und Pflaster. „65 m“ schwebt als loses Wort in der Welt.
  - Am Handy liegen die Chatzeilen „Neuer Auftrag: …“ direkt auf der Wegmarke.
  - Es ist das einzige Weltelement, das dem Spieler die Richtung zeigt, und hat die schwächste Kontur von allen.
- **Vorschlag:**
  - Goldener Pfeil 20 px mit 2-px-Kontur `#0b1216` und weichem Schatten, im Stil der Auftrags-„!“.
  - Entfernung darunter in Nunito 800 12 px mit Kontur.
  - Der Pfeil kreist auf einem Radius von 70 px um den Helden (WoW-Retail-Supertracking), statt frei an der Wegspitze zu stehen.
  - Handy: Chat hat Vorrang nach unten, die Wegmarke weicht über den Helden aus.
- **Ursache:** `renderer.js` (Wegmarke und Pfeil), `mobile-polish.css` (Chat-Lage).
- **Aufwand:** S.

### 11. Zielrahmen: Stufe als freier Ring, Farben nicht aus einem System
- **Ort:** Zielrahmen im Kampf. `crops/zielrahmen.jpg`, `30-hud-kampf.jpg`.
- **Problem:**
  - Die Stufe „2“ steht als eigener Ring zwischen Name und Porträt. Beim Spielerrahmen sitzt die Stufe als Plakette unten am Porträt; die Rahmen sind also nicht spiegelbildlich.
  - Die Stufenzahl hat keine Schwierigkeitsfarbe: Ein Stufe-2-Gegner für einen Stufe-12-Helden müsste grau sein, in WoW ist das die wichtigste Information des Rahmens.
  - Der Lebensbalken des Ziels ist orange, das Namensschild desselben Pfandkeilers in der Welt rot.
- **Vorschlag:**
  - Plakette „2“ unten rechts am Porträt (Spiegel des Spielerrahmens), Farbe nach Stufenabstand (grau ≤ −5, grün −3…−4, gelb ±2, orange +3…+4, rot ≥ +5).
  - Balkenfarbe = Namensschildfarbe (feindlich rot, neutral gelb).
  - Der Name steht dann allein in der Zeile und bekommt 30 px mehr Breite.
- **Ursache:** `spielfluss.css:58–60` (`#targetLevel::after` als Ring), `enemy-ui.js:10–15`, `unit-frame.js`.
- **Überschneidung Feinschliff:** Runde 63 (Porträt) bleibt.
- **Aufwand:** S.

### 12. Kampfstatistik: eigenes Fenster neben dem Fenstersystem
- **Ort:** V. `crops/kampfstatistik.jpg`, `11-vier-fenster.jpg`.
- **Problem:**
  - Titel „Kampfstatistik“ in kleiner gemischter Pixelschrift, ohne Fenstersymbol. Alle anderen Fenster haben Symbol + Jersey-Versal.
  - Textreiter „SCHADEN/HEILUNG“, darunter ein Auswahlfeld „Aktueller / letzter Kampf“.
  - Das Fenster steht frei über der Verfolgung unten rechts, nicht im Fensterraster.
  - Die Fußzeile ist doppelt: „104 Gesamt · 13,3 DPS · 7,8 s“ wiederholt die Balkenzeile „104 · 13,3 DPS · 100 %“.
- **Vorschlag:**
  - Titelzeile wie alle Fenster (Symbol Balkendiagramm, „KAMPFSTATISTIK“, V-Kappe, ×).
  - Schaden/Heilung als zwei 28-px-Symbolreiter in der Titelzeile, der Kampf als ‹ › Blätterer statt Auswahlfeld.
  - Fußzeile nur „Dauer 7,8 s“ und „Abgeschlossen · Pfandkeiler“ als Tooltip auf der Dauer.
  - Leerzustand: Symbol gekreuzte Schwerter ausgegraut, ohne Satz.
- **Ursache:** `meter-ui.js`, `meter.css`, `combat-meter.js`.
- **Aufwand:** S–M.

---

## Zielbilder

### Zielbild 1: Weltkarte wie die WoW-Weltkarte (Desktop 2024×900, Fenster 1922×847 bei 53/20 bleibt)

```
x=53                                                                                                        x=1975
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐ y=20
│[🗺] MERTLOCH · MAIFELD     [▽ Filter] [⌖] [⛶]                                      (M)  [×]              │ 36 Titelzeile
├───────────────────────────────────────────────────────────────────────────────┬──────────────────────────┤ y=56
│                                                                        N ✦    │ ◉ Dachse im Leergut  65 m│ 34 verfolgt (gold)
│    ⚑ Wegestube                                                                │   4×Pfanddachs 0/4 [👢][📍]│ 22 Zeile 2 nur verfolgt/gewählt
│                    ⚔                ⚔                                          │ ── Aufträge ───────────── │ 12 Trenner = Symbol + Linie
│              ⚔ ╭────╮                                                         │ ! Mara „Katerkiller“ 15 m│ 26 je Zeile
│                │ ░░ │ ← verfolgtes Zielgebiet: Gold 18 % + 2 px, Symbol Kralle │ ! Hotfix-Olli        65 m│
│     ③          ╰────╯   in der Mitte, Name nur beim Hover                     │ ! Nyalol             54 m│
│   (Bündel)    ▲ ← Standort 24 px, weißer Halo, IMMER oben                      │ ! Racing Ron         80 m│
│       🍺 🔨 🐎        !  !      ⚑                                              │ ── Treffpunkte ────────── │
│         ⚔           ┊Tooltip┊                                                 │ ⚑ Clan-Treff          8 m│
│              ⚔      ┌───────────────────────────┐                             │ ⚑ Pfandhof          120 m│
│                     │[!] Hotfix-Olli            │ 260 breit                    │ ⚑ Wegestube         203 m│
│   ⚔                 │    Auftrag · Stufe 10–12  │ Nunito 800 14 gold           │ ── Lager ─────────────── │
│                     │    Ollis Co-Working-Space │ 12 gedimmt                   │ ⚔ Grillplatz        176 m│
│         ⚔           │    65 m                   │                              │ ⚔ Bollerboxen       361 m│
│                     │ [Maus] Wegmarke [⇧] Laufen│ 11 gedimmt, Symbolkappen     │   … (nach Abstand sortiert)
│                     └───────────────────────────┘                             │ ── Händler ───────────── │
│  ═50 m                                             © OSM ⓘ  (10 px, 60 %)     │ 🛍 Kalles Kiosk     132 m│
└───────────────────────────────────────────────────────────────────────────────┴──────────────────────────┘ y=867
 Karte x 65–1665 (1600 × 799)                                                    Seitenleiste 290
```

**Maße und Regeln**
- **Titelzeile 36 px** trägt alles, was heute Werkzeugleiste, Legende und Fuß ist:
  - Filter-Trichter 32 px öffnet eine Häkchenliste: Aufträge, Zielgebiete, Treffpunkte, Lager, Händler, Berufe, Tiergebiete, Lebewesen. Das ist derselbe Baustein wie die Lupe der Minikarte, die Gruppen sind **kombinierbar**.
  - ⌖ „Zu mir“ und ⛶ „Übersicht“ je 32 px, Name nur als Tooltip. −/+ entfallen (Mausrad und Ziehen gibt es schon), auf Wunsch als ± unten rechts auf der Karte.
  - Der Ortsname „MERTLOCH · MAIFELD“ ersetzt „KARTE“ (WoW zeigt die Zone als Fenstertitel).
- **Karte ≈ 1600×799** statt 1572×653 (+24 % Fläche), weil die Werkzeugleiste (44 px), die Legende (≈ 40 px) und der Fuß (≈ 20 px) wegfallen.
- **Markersprache** (einmal definiert, Minikarte und Karte gleich; Größe 22 px Karte / 14 px Minikarte, 2-px-Kontur `#1a120c`):

  | Art | heute | Ziel |
  |---|---|---|
  | Auftrag annehmbar | goldener Kreis „!“ | goldenes „!“ ohne Kreis wie über den NPCs (gleiche Form wie in der Welt) |
  | Abgabe | „?“ | goldenes „?“ |
  | Auftrag zu niedrig | halbtransparent | graues „!“ |
  | Treffpunkt | petrolfarbener Kreis 1–3 | Fahne ⚑ in Petrol, dazu goldener Punkt, wenn Aufträge offen sind (gibt es schon) |
  | Gegnerlager | rote Raute 1–11 | gekreuzte Schwerter auf rotem Schild, **ohne Zahl** |
  | Kiosk | Raute „K“ | Beutel |
  | Werkhof | „W“ | Amboss |
  | Braugarten | „B“ | Krug |
  | Fahrstall | „R“ | Hufeisen |
  | Standort | Pfeil im Kreis | Pfeil 24 px, weißer Halo 3 px, immer als letztes gezeichnet; Marker unter ihm auf 50 % |
  | Verfolgtes Ziel | Ring 7 px | Stecknadel 24 px, pulsiert einmal beim Öffnen |

- **Keine Dauerschilder.**
  - Name nur für das überfahrene, das gewählte und das verfolgte Ziel.
  - Ausnahme ab Zoom ≥ 2: Treffpunkt- und Ortsnamen als Tinte (heute `textLabel`) wie Städtenamen auf der WoW-Zonenkarte.
  - Lagernamen, die Sätze sind („Kegelkönig Klaus zur Aussage bewegen“), gibt es nur im Tooltip.
- **Bündeln:** Marker näher als 24 px → ein Bündel-Symbol mit Zahl (Kreis 22 px, Creme auf Braun). Hover zeigt die Liste der Gebündelten (Symbol + Name je Zeile), Klick zoomt auf das Bündel (`options.zoom*=2`, Mitte = Bündel). Am Clan-Treff wären das heute 5 Marker → 1 Bündel.
- **POI-Tooltip** (WoW `WorldMapTooltip`), 260 px, Anker rechts unten am Marker mit 12 px Abstand, nie über der Seitenleiste:
  - Zeile 1: Symbol 20 + Name, Nunito 800 14, Gold bzw. Rot bei Lagern.
  - Zeile 2: Art · Stufe (Lager: Gegnerstufe in Schwierigkeitsfarbe).
  - Zeile 3: Detail, 12 px gedimmt, höchstens eine Zeile.
  - Zeile 4: Entfernung.
  - Fuß 11 px: Kappen „Klick = Wegmarke“, „⇧ Klick = hinlaufen“ als Symbole (gleiche Belegung wie Minikarte).
  - Bei Zielgebieten: Auftragsname + Fortschritt „0/4 Pfanddachs“.
- **Zielgebiete (Questgebiete wie in WoW-Retail):**
  - Verfolgtes Gebiet: Goldfläche 18 %, Rand 2 px durchgezogen, in der Mitte das Zielsymbol 18 px (Kralle = besiegen, Hand = sammeln, Sprechblase = reden).
  - Andere Auftragsgebiete: Fläche 8 %, Rand 1,2 px gestrichelt.
  - Tiergebiete: nur mit Filter.
  - Beim Überfahren wird das Gebiet heller, dazu der Tooltip. Nie Dauertext; das löst auch die heute verschluckten Beschriftungen.
- **Seitenleiste 290 px:**
  - Gruppenköpfe als 12-px-Trenner (Symbol + Linie, kein Wort nötig, Wort im Tooltip), innerhalb der Gruppe nach Abstand sortiert.
  - Die verfolgte oder gewählte Zeile bekommt eine zweite Zeile mit Zielschritt und zwei 28-px-Symbolen: Stiefel = „Weg einschlagen“ (schließt die Karte wie heute), Nadel = „Verfolgen“.
  - Der Block „Dein nächster Halt“ und der Goldknopf entfallen.
  - Zeilenhöhe 26 (heute 24 + Rahmen), 23 Zeilen + 4 Trenner ≈ 650 px < 799, kein Blättern.
- **Legende:** entfällt. Wer ein Symbol nicht kennt, fährt darüber. Optional ⓘ unten rechts auf der Karte mit der Symbolliste als Tooltip.
- **OSM-Nennung:** Die ODbL verlangt eine sichtbare Nennung. Also nicht nur als Tooltip, sondern als 10-px-Zeile „© OpenStreetMap“ auf der Karte unten rechts bei 60 % Deckkraft, wie bei Kartenkacheln üblich. „Norden ist oben · Welt läuft weiter“ entfällt, der Nordpfeil sagt es.
- **Stempel** entfällt (unsichtbar). **Chat** bei offener Karte ausblenden (`body:has(.popup-map)`), wie WoW die UI bei der Vollbildkarte ausblendet.
- **Handy:** gleiche Symbole und Tooltips (Tippen = Tooltip, zweites Tippen = Wegmarke). Werkzeuge nach Befund 6.

### Zielbild 2: Beschriftungsschichten in der Welt, der Zonentitel hat 3,6 s Vorrang (Befunde 3, 4, 10)

```
Bildschirm 2024×900, Held bei (1012, 450)

y=164 ┌──────────────── Titelband (Kasten der .region-label + 16 px Rand) ────────────────┐
      │                       KIRCHSTRASSE        (Jersey 40, Gold, Umriss)             │
      │ Kräuter-Gisela  Braumeisterin Bärbel   → während zone-show: Alpha .25           │
      │     !                                   → Auftragszeichen: Alpha .45 (bleibt)  │
      │                   Mertloch · Maifeld    (Nunito 800 15)                         │
y=246 └──────────────────────────────────────────────────────────────────────────────────┘
      Figuren selbst (Canvas-Welt) bleiben unverändert; nur die Schrift-Ebene tritt zurück.
      Ausblenden 0,45 s mit dem Titel, Einblenden 0,6 s nach dem Titel.

Schichtordnung (oben → unten), eine Regel je Schicht:
 1 Fehlerzeile (11vh)            nie verdeckt
 2 Zonentitel (18vh, 3,6 s)      hat Vorrang im Titelband
 3 Ziel-Namensschild             nie ausgeblendet, nie gestapelt
 4 Angreifer-Schilder            stapeln senkrecht (Δy 14 px), nie ausgeblendet
 5 Auftragszeichen ! ? …         im Titelband 45 %, sonst voll
 6 Übrige Namensschilder         Name+Balken = EINE Einheit; stapeln bis 3, danach ganzes Schild weg
 7 Freundliche Namen             nur Auftraggeber/Lehrer ≤ 12 m oder unter der Maus (Nutzervorgabe „Namen nur beim Mouse-Over“)
 8 Weltschilder (Holzschild Clan-Treff, Baustelle der Bude)   Grafik, kein Text über 11 E im Titelband
 9 Wegmarke                      Gold 20 px mit Kontur, Kreisbahn r=70 px um den Helden, Entfernung Nunito 12
```

**Umsetzung (klein):**
- `world-labels.js`: neben `HUD` eine zweite Liste `YIELD=['.region-label.zone-show']`.
- `labelHudFree` gibt für Kästen, die das Titelband schneiden, einen Alpha-Faktor zurück (0,25 bzw. 0,45 für Auftragszeichen) statt `false`.
- `renderer.js:188` multipliziert `l.a` damit.
- Der Titel bleibt bei 18vh; der R2-Befund (Clan-Schild bei y≈60) bleibt gelöst.

**Mess-Soll für ein Prüfskript:** Am Braugarten (Held 85 E südlich der Lehrer) mit `.zone-show` ist die Schrift-Ebene im Titelkasten ≤ 30 % deckend. Ohne Titel sind die Namen dort wieder 100 %.

**Frage an den Nutzer:** Freundliche Namen dauerhaft (heute Standard, WoW-Standard) oder nur beim Überfahren und in der Nähe (Nutzervorgabe)? Regel 7 folgt der Nutzervorgabe. Der Schalter „Freundliche Figuren“ in Einstellungen → Interface bleibt.

### Zielbild 3: Handy-Fenster ohne Rahmen-Geist und ohne Abschneiden (Befunde 5, 8, 9; hoch 390×844, klein 320×568)

```
Hochkant 390×844 (Safe Area oben 47, unten 34)       Klein 320×568, Spielmenü

y=47 ┌────────────────────────────────────┐           y=20 ┌──────────────────────────────┐
     │[☺] GRAFIK VIER   [⟳][☺][🎒]    [×] │ 44            │[☰] SPIELMENÜ              [×] │ 36
     ├────────────────────────────────────┤               ├──────────────────────────────┤
     │ [Kopf]                     [Hals]  │               │ [Fig] [Auf] [Tal] [Kar]      │ 52 Kacheln, nur Symbol
     │ [Schu]      ┌────────┐     [Brust] │ 6 × 52        │ [Kni] [Ruc] [Hil] [Ber]      │ 52 (Wort = Langdruck)
     │ [Rück]      │ Puppe  │     [Hand]  │ = 312         │ [Fah] [Söl]                  │ 52
     │ [Taill]     │ 210 px │     [Ring]  │ (heute 260,   │──────────────────────────────│
     │ [Beine]     └────────┘     [Ring]  │  Abstand 5)   │ [Einstellungen][Tasten]      │ 44 zwei Spalten
     │ [Füße]                     [Glück] │               │ [UI bearbeiten][Hilfe]       │ 44
     │ [Waffe][Neben][Fern]               │ 52            │ [Heldenwahl  ][Abmelden]     │ 44
     │ ♥1.095  ⚔14–20·7,7  ✦237  …        │ 3 × 34        │ [   ZURÜCK ZUM SPIEL   ]     │ 44 gold
     └────────────────────────────────────┘ ≈ 596        └──────────────────────────────┘ y≈386
     Spielerrahmen: visibility:hidden,                   modal: darf über Joystick/Kniffe (sonst ungenutzt),
     solange ein Fenster offen ist (kein 16-px-Geist)     max-height = 100dvh − Safe Areas − 28; overflow:visible
```

- **Hochkant:** Das Fenster beginnt an der Safe Area (47), der Spielerrahmen ist verborgen, solange ein Fenster offen ist. Die freie Höhe bis über die Touch-Steuerung (≈ 620) geht an die Puppe: Plätze 44 + **8** Abstand. Das löst ≈ 76 Befundpaare.
- **Quer (844×390):** Waffenzeile unter die Puppe, Spalten 6 × 52 = 312 ≤ 346. Werteraster rechts ohne „/ max“.
- **320 px:** Das Spielmenü ist das einzige Fenster, das über die Touch-Steuerung reichen darf (modal). 36 + 3 × 58 + 4 × 50 + 12 ≈ 422 px < 568 − 20 − 34 = 514.
- **Prüf-Soll:** `mobile-check` Abstand < 8 px an der Figur = 0; Spielmenü 320×568: `scrollHeight ≤ clientHeight` bei `overflow:hidden` (heute prüft niemand abgeschnittene Inhalte, nur Scrollen).

---

## Quick Wins (Minuten bis eine Stunde)
1. `world-labels.js` + `renderer.js:188`: Schrift-Ebene im Kasten von `.region-label.zone-show` auf Alpha 0,25 (Befund 3). Größte Wirkung pro Zeile Code.
2. `atlas-ui.js`: `.data-note` bis auf „© OpenStreetMap“ (10 px, auf der Karte) streichen, `.atlas-stamp` streichen.
3. `atlas-ui.js` / `window-compact.js` `map()`: `[data-zoom=player]` und `[data-zoom=fit]` mit `iconButton` zu Symbolknöpfen, wie die Filter schon.
4. `cartography.js`: Spielerpfeil mit 3-px-Halo; Marker im Umkreis von 20 px um den Spieler auf 50 %.
5. `cartography.js`: Ziffern aus Lager- und Treffpunktmarkern entfernen (`fillText(h.number)` nur für „!“/„?“), Buchstaben W/B/R/K durch `glyph()`-Symbole ersetzen, die die Liste schon nutzt (`placeMark`).
6. Desktop: `#atlasSelection` ausblenden, Stiefel-Symbol in die verfolgte oder gewählte Listenzeile.
7. `fenster-r3.css`: `.touch-mode .popup-menu` darf über die Touch-Steuerung reichen, `overflow:visible` (Befund 5).
8. `.touch-mode:has(.game-popup) .player-panel{visibility:hidden}` nur hochkant (Befund 9).
9. `spielfluss.css:59`: `#targetLevel` als Plakette am Porträt, Farbe nach Stufenabstand (Befund 11).
10. `renderer.js` `label()`: Wird der Name eines Namensschilds verworfen, auch den Balken nicht zeichnen (außer Ziel und Angreifer). Das ist die Hälfte von Befund 4.
11. Wegmarke: Kontur `#0b1216` 2 px und Gold statt Creme (Befund 10).
12. `options-ui.js`: Zeilenhöhe am Desktop 32 px (Feinschliff-Sitzung fragen). `optimierung-r3b-check` soll alle sechs Kategorien messen.
13. `body:has(.popup-map) .chat-window{visibility:hidden}`, damit keine Chatzeilen unter dem Kartenrahmen hervorschauen.

## Gesamteindruck
**Wie aus einem Guss?** Bei den Hauptfenstern ja, zum ersten Mal: Figur, Aufträge, Kniffe, Rucksack, Talente, Hilfe, Spielmenü und Gespräch teilen Rahmen, Titelzeile (Symbol + Jersey-Versal + Tastenkappe + ×), Oberkante, Slot-Sprache und Tooltip-Anker. Die Aktionsfläche ist ein System. Der Gegenstands-Tooltip ist auf WoW-Niveau. Die Außenwelt ist mit Abstand der stärkste Teil.

Nicht aus einem Guss sind drei Randbereiche. In der Reihenfolge des Abstands zu WoW:
1. **Die Weltkarte** ist ein eigenes Produkt mit eigener Sprache: Ziffern, Buchstaben, Satz-Schilder, Legende, Textknöpfe, kein Hover. In WoW ist die Karte nach den Taschen das meistbenutzte Fenster. Ihre Stärke sind Symbole, die man ohne Legende versteht, und POI-Tooltips. Hier ist der Abstand am größten (Zielbild 1).
2. **Die Welt hat keine Vorrangregeln für Text.** Zonentitel, NPC-Namen, Auftragszeichen, Weltschilder, Namensschilder mit und ohne Namen, Wegmarke und Chatzeilen liegen übereinander, jede Schicht mit eigener Regel. WoW stapelt Namensschilder, lässt nie einen Balken ohne Namen stehen und setzt den Zonentitel sichtbar vor alles (Zielbild 2).
3. **Nebenfenster und Randzustände:** Einstellungen (scrollt in 3 von 6 Kategorien, 48-px-Zeilen, doppelt belegte Symbole), Kampfstatistik (fremder Stil) und Handy 320 px (abgeschnittenes Menü). Bei Blizzard kommen alle Fenster aus einer Vorlage, auch die selten geöffneten. Hier sind die selten geöffneten sichtbar älter.

## Was bleiben soll
- **Hilfe als Tastenliste** (Kappe + Wort, Tooltip nur mit Mehrwert): genau das WoW-Muster.
- **Aktionsfläche 122 px** mit Haltung im Rahmen und Messingstrich.
- **Gegenstands-Tooltip** mit Vergleich daneben, **Kniffe inhaltshoch**, **Einklappen über dem Helden**.
- **Sammelobjekt:** leuchtender Bodenring beim Überfahren, eigener Zeiger („use“) und kompakter Tooltip „Schrotthaufen · Benötigt Schrottsammeln (1)“ (`crops/sammelobjekt-hover.jpg`). Nur „Deine Fertigkeit: 5 · Erntereif“ ist mehr als WoW zeigt, das kann bleiben. Im Ruhezustand ist der Haufen klein, der „+“-Funke aber sichtbar genug.
- **Auftragszeichen „!“/„?“** über NPCs und am Gegnerschild: groß, gold, mit Kontur, sofort lesbar.
- **Zonentitel-Gestaltung** selbst (Gold 40 px mit Umriss, Unterzeile Nunito): nur die Nachbarschaft ist das Problem.
- **Karten-Untergrund** (handgemalt, Dächer, Felder, Wege) und die **Listenzeilen** mit Symbol und Meterangabe.
- **Minikarte** (13/13 grün, Symbol-Tooltips): das Vorbild für die große Karte.
- **Regen (leichte Stufe):** dezente Streifen, Welt und Schrift bleiben lesbar (`85-regen-kirchstrasse.jpg`).
- **Handy quer/hoch:** keine Scrollfenster mehr, Spielmenü-Kacheln, Figur quer.

## Screenshot-Pfade (alle unter `D:\Dev\MertlochChronicles-review-r4\_review\`)
- **Weltkarte:**
  - `shots/60-karte-start.jpg`, `61-karte-hover-poi.jpg`, `62-karte-zielgebiet-zoom.jpg`, `63-karte-filter-auftraege.jpg`, `64-karte-ort-gewaehlt.jpg`, `65-karte-lebewesen.jpg`
  - Ausschnitte: `crops/karte-voll.jpg`, `karte-seitenleiste.jpg`, `karte-seitenleiste-auswahl.jpg`, `karte-toolbar.jpg`, `karte-legende.jpg`, `karte-fuss.jpg`, `karte-hover-poi.jpg`, `karte-zielgebiet.jpg`, `karte-stempel.jpg`, `karte-chat-unten.jpg`
  - Handy: `shots/92-handy-quer-map.jpg`, `92-handy-hoch-map.jpg`, `92-handy-klein-map.jpg`
- **Zonentitel/Weltschrift:**
  - `shots/70-zone-kirchstrasse.jpg`, `71-zone-braugarten.jpg`, `72-zone-clantreff.jpg`, `73-zone-treffpunkt2.jpg`, `74-zone-echt-kirchstrasse.jpg`, `75-zone-braugarten-dy{70,85,100}.jpg`
  - Ausschnitte: `crops/75-braugarten-titel-dy85.jpg`, `crops/*-titel.jpg`
- **Namensschilder/Marker/Wegmarke:**
  - `crops/schilder-ohne-namen.jpg`, `gegner-schild.jpg`, `wegmarke.jpg`, `ida-zeichen.jpg` (zeigt den Titel auf dem Schild „Baustelle der Bude“)
  - `shots/80-ida-auftragszeichen.jpg`, `82-gegner-schild.jpg`
- **Sammelobjekt:** `shots/81-sammelobjekt.jpg`, `81b-sammelobjekt-hover.jpg`, `crops/sammelobjekt.jpg`, `sammelobjekt-hover.jpg`
- **Regen:** `shots/85-regen-kirchstrasse.jpg`, `86-regen-zonentitel.jpg`, `crops/regen-mitte.jpg`
- **HUD/Kampf:**
  - `shots/01-hud-ruhe.jpg`, `30-hud-kampf.jpg`, `31-kampfstatistik.jpg`
  - Ausschnitte: `crops/zielrahmen.jpg`, `aktionsflaeche.jpg`, `aktionsflaeche-kampf.jpg`, `hud-links-oben.jpg`, `kampfstatistik.jpg`, `kampf-mitte.jpg`
- **Fenster:**
  - `shots/10-fenster-{c,j,i,p,n,h}.jpg`, `11-vier-fenster.jpg`, `13-spielmenue.jpg`, `14-einstellungen.jpg`
  - Ausschnitte: `crops/fenster-*.jpg`, `spielmenue.jpg`, `einstellungen.jpg`, `einst-{game,interface,graphics,audio,keys,system}.jpg`
- **Handy:** `shots/90-handy-{quer,hoch,klein}-hud.jpg`, `91-handy-{quer,hoch,klein}-menue.jpg`, `92-handy-{quer,hoch}-{quest,guide,book,person,bag,talents,map}.jpg`, `92-handy-klein-{person,map}.jpg`, `crops/handy-{quer,hoch}-figur.jpg`
- **mobile-check:** `mobile-check/REPORT.md`, `mobile-check/{hoch,quer,klein}-figur.jpg`, `klein-rucksack.jpg`, `quer-talente.jpg`
- **Logs:** `r3b.log`, `r2a.log`, `minimap.log`, `r3a.log`, `r3a-3.log` (beide rot bei „Rechtsklick auf Ida“), `mobile.log`, `s1.log`–`s3.log`, `extra.log`, `handy-*.log`
