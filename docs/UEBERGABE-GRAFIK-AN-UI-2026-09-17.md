# Grafik an UI · 2026-09-17

Die Grafiklieferung zu `UEBERGABE-GRAFIK-2026-09-17.md` ist fertig. Einbezogen ist die ergänzte Liste `FEHLENDE-SPRITES.md` einschließlich Schwung, Übungspuppe, Horst, vier Waffen und 18 neuer Proc-Talente. Die Spielrenderer sind in diesem Grafikauftrag **nicht umgestellt**: Ihre Anbindung gehört laut `PIPELINE.md` zur UI-Rolle.

Aktueller Stand nach UI-Anbindung: Die ursprüngliche Lieferung ist inzwischen im Renderer integriert. Die überarbeiteten Gegenstände werden über dieselben IDs/Pfade geladen; der zusätzliche Bewohnerbaukasten bleibt ein separater Prototyp.

Nachtrag: Die 18 Gegenstände wurden nach eigenem Sichtreview unter denselben Pfaden durch klarere Motive ersetzt. Neuer [Review mit fünf Iterationen](GRAFIK-REVIEW-5-RUNDEN-2026-09-17.md), [Figurenwerkstatt](https://er-esm.github.io/mertloch-chronicles/art-workshop.html) und modulare Bewohner-Prototypen sind vorhanden. Der Katalog verweist für diese Icons auf die neuen Originale; die übrige Lieferung bleibt bestehen.

## Lieferung und Vorschau

**88 Assets, 908 Animationsframes, dazu drei Talent-Overlay-Atlanten: insgesamt 91 fertige PNG-Dateien.** Alle Exporte verwenden harte Transparenz und dieselbe 40-Farben-Palette. Die unveränderten Imagegen-Originale bleiben zusätzlich erhalten.

| Bereich | Lieferumfang | Ablage unter `assets/content-art/` |
|---|---|---|
| Oberfläche | 6 Reiter, 7 HUD-Symbole, 3 Schwungzustände, Proc-Rahmen und 2 Proc-Marker | `ui/<ID>.png` |
| Helden | Dieter und Kevin, je Posenbogen und eigener 8-Frame-Laufzyklus | `heroes/{dieter,kevin}-{poses,walk}.png` |
| Auftraggeber | Ida, Mara, Leander, Oskar, Fenja, Tilo, Jonna, Hedwig, Konrad, Fiete, Elke, Bürgermeister | `npcs/<Inhalts-ID>.png` |
| Bewohner | 8 Varianten, jeweils vier Richtungen und acht Posen | `npcs/villager0.png` bis `villager7.png` |
| Gegner | Rabe, Fuchs, Schnorrer, Praktikant, Borsten-Bruno | `enemies/{raven,fox,scrounger,inspector,alphaBoar}.png` |
| Bosse | Gisela, Pfandautomat 3000, Horst; einschließlich Phasenpose | `bosses/{gisela,automat,horst}.png` |
| Gegenstände | alle 18 IDs aus der ergänzten Bedarfsliste | `items/<ID>.png` |
| Neue Talente | 18 einzelne Motive und 3 sparsame Overlay-Atlanten | `talents/procs/` |
| Arena | Übungspuppe auf Bierkasten, ein Frame | `props/ui-arena-dummy.png` |

[Interaktive Abnahme](https://er-esm.github.io/mertloch-chronicles/art-handoff.html): echte Exportdateien, Richtungswechsel, Laufanimation, Angriffs- und Phasenpose, Einzelbildprüfung, native Icongröße und 9-Slice-Probe. Anni steht jeweils als Maßstabs- und Stilreferenz daneben. Lokal mit `node server.mjs` und `/art-handoff.html` öffnen.

Gespeicherte Browserbelege: [Helden neben Anni](../assets/content-art/review/2026-09-17/heroes-front.png), [Bewohner](../assets/content-art/review/2026-09-17/npcs-front.png), [Bosse mit Phasenpose](../assets/content-art/review/2026-09-17/bosses-0-phase.png), [Oberfläche](../assets/content-art/review/2026-09-17/ui-front.png), [Gegenstände](../assets/content-art/review/2026-09-17/items-front.png), [Proc-Talente](../assets/content-art/review/2026-09-17/talents-front.png), [Mobilansicht](../assets/content-art/review/2026-09-17/mobile-ui.png).

## Verbindlicher Datenvertrag

Die Ladeliste ist [handoff-catalog.json](../assets/content-art/handoff-catalog.json). `assets[id].path` ist der tatsächliche Dateipfad; `aliases` übersetzt die Präfix-IDs der Bedarfsliste auf die Inhalts-IDs. Beispielsweise:

- `hero-dieter` → `dieter-poses`; den Laufbogen separat über `dieter-walk` laden.
- `enemy-raven` → `raven`, `boss-gisela` → `gisela`, `npc-ida` → `ida`.
- `villager-0` → `villager0` usw.
- `megafon` ist die beibehaltene Inhalts-ID für **Annis Hygiene-Hochdruckspray**. Das Bild zeigt entsprechend eine Sprühflasche.
- `fuchspfote` ist ein Stiefel mit Pfoten-Anhänger; `fuchsschwanz` der tierische Beutedrop.

Die Metadaten enthalten Dateimaße, SHA-256 des Originals und Exports, Raster, Fußpunkt, Posenbezeichnungen und pro Frame Ausschnitt/Bounds. Die Identität der Auftraggeber orientiert sich an ihrem bestehenden Feld im Dialogporträt-Atlas.

### Maßstab und Animation

Für alle Weltfiguren gilt **2 native Pixel = 1 Welteinheit**. Die Körperhöhe ist die Referenzhöhe des Bogens; Ausholen, Hut und hochgehaltene Gegenstände dürfen über diese Höhe hinausreichen. Es gibt keine Skalierung einzelner Frames auf eine identische Bounding-Box.

| Figuren | Native Referenzhöhe | Welthöhe | Zelle / Fußpunkt |
|---|---:|---:|---|
| Dieter, Kevin, Auftraggeber, Bewohner, Schnorrer, Praktikant | 52 | 26 | 96 × 96 / (48, 80) |
| Leergut-Rabe | 36 | 18 | 96 × 96 / (48, 80) |
| Pfandfuchs | 40 | 20 | 96 × 96 / (48, 80) |
| Borsten-Bruno | 60 | 30 | 128 × 128 / (64, 104) |
| Gisela, Horst, Pfandautomat | 104 | 52 | 192 × 192 / (96, 160) |
| Übungspuppe | 52 | 26 | 96 × 96 / (48, 80) |

**Immer `frameSize` und `pivot` am Asset lesen.** Die Standardwerte am Katalogkopf gelten nicht für Bruno oder Bosse. Die vergrößerten Bosszellen lassen Greifarm, Gießkanne und Stempel vollständig sichtbar.

Zeilen: Südost, Südwest, Nordost, Nordwest. Spalten stehen jeweils in `columns`:

- Helden-/NPC-Posen: Stand, Schritt A, Durchgang, Schritt B, Ausholen, Treffer/Interaktion, getroffen, Ruhe.
- Helden-Laufbogen: acht vollständige Schritte. In der Spielanbindung über zurückgelegte Strecke takten und im Stand anhalten; die Galerie verwendet zur Sichtprüfung eine Uhr.
- Gegner: Stand, Schritt A, Schritt B, Angriff.
- Bosse: zusätzlich Phasenpose.
- Übungspuppe: ein Sprite; Wackeln bei Treffern ist Aufgabe des Renderers.

Die Heldensprites halten keine fest eingebrannten Waffen. `frames[].sockets` liefert die vorhandene Registrierung für Haupt-/Nebenhand, Kopf, Torso, Taille, Schultern und Füße. Der bestehende Socket-Ermittler aus `build-live.mjs` wird dafür nur exportiert, seine bisherige Funktion bleibt gleich. **Ausrüstung muss die UI-Rolle noch in allen vier Richtungen und Lauf-/Angriffsphasen mit diesen neuen Körpern im Spiel prüfen.** Die Galerie prüft die Körperbögen, nicht den fertigen Ausrüstungsrenderer.

### Icons und Panels

Icons in nativer Größe oder ganzzahlig vergrößert mit `image-rendering: pixelated` zeichnen. Canvas: `imageSmoothingEnabled=false`.

- Reiter, Belohnung, Schloss und Gegenstände: 24 × 24.
- Menü, Ton, Vollbild, Schwung: 20 × 20.
- Elite: 16 × 16; Proc-Eckmarker: 12 × 12.
- Sprechblase: 32 × 24, 9-Slice `left=6, right=5, top=5, bottom=7`.
- Proc-Rahmen: 48 × 48, 9-Slice an allen vier Seiten 12; die Mitte ist transparent.

### Die 18 Talent-Motive

Jedes neue Talent hat eine eigene Datei `talents/procs/<Talent-ID>.png` in 48 × 48. Die Talent-ID bleibt unverändert, etwa `dieter-wall-1` oder `baerbel-care-5`. `baerbel` bleibt hier die bestehende Speicher-/Klassen-ID von Aperol-Anni.

Alternativ stehen `proc-dieter.png`, `proc-baerbel.png`, `proc-kevin.png` als 240 × 288 große **Overlay-Atlanten** bereit. Sie enthalten ausschließlich die absoluten Atlasindizes **1, 5, 11, 15, 21, 25** (fünf Spalten, Zellen 48 × 48). Die anderen 24 Zellen je Klasse sind transparent.

**Diese Dateien nicht als vollständigen Ersatz der alten Talent-Atlanten laden.** Entweder die sechs neuen Zellen darüber zeichnen oder für diese Talent-IDs direkt die Einzeldateien verwenden. Alle 72 unveränderten Talentbilder bleiben erhalten.

## Anbindung durch die UI-Sitzung

1. Nach Veröffentlichung im eigenen Checkout `git pull --ff-only` ausführen; eigene offene Änderungen vorher wie üblich sichern.
2. Katalog laden, Alias auflösen und die fertigen PNGs erfolgreich laden. Im Welt-Renderer `variant` vor `skin` auswerten; bei fehlendem/nicht geladenem Bild den vorhandenen Fallback erhalten.
3. Die sechs Clanbuch-Reiter und HUD-Icons an ihre IDs binden. Bestehende Tooltips und zugängliche Beschriftungen beibehalten.
4. Figuren mit den obigen Fußpunkten und Größen binden; Lebensbalken, Zielringe und Kollision bleiben an der Weltposition. Gear-Überlagerung visuell prüfen.
5. Talente gezielt überlagern, Schwungzustände und Proc-Rahmen/Marker anbinden. Übungspuppe über ihr eigenes Sprite darstellen.
6. Die tatsächlich verwendeten Exporte und den Katalog in den PWA-Cache aufnehmen. **Quellbilder, Metadaten und Abnahmebilder nicht als Spielressourcen vorladen.**
7. Im Spiel auf Desktop und Mobil prüfen: Dialogportrait gegen Weltfigur, NPC-Requisiten beim Gehen, Ausrüstung beim Richtungswechsel, Boss-Ausholpose, Loot-Icons und alle Zustände des HUD.

Die Grafikrolle hat die Galerie einschließlich mobiler Ansicht geprüft. Eine Bestätigung der fertigen Darstellung in der laufenden Spielwelt kann erst nach dieser Renderer-Anbindung erfolgen.

## Reproduktion, Herkunft und Prüfungen

- `node tools/sprite-pipeline/build-handoff.mjs`: alle 91 PNGs und Katalog deterministisch aus den Originalen exportieren.
- `node --test tests/art-handoff.test.mjs`: byteidentische Reproduktion, Palette/Alpha, Ränder, Vollständigkeit, Aliasziele, Maßstab und gezielte Talent-Überlagerung.
- Browserprüfung: `tools/sprite-pipeline/review-handoff.browser.js` mit Playwright `browser_run_code_unsafe(filename=...)`. Standardserver ist `http://localhost:4187/`; die Funktion nimmt optional `baseURL` und `outputDir`.
- Nach Rebase auf den Spielstand `52f5700`: `npm test` **235/235 grün**, `npm run build` erfolgreich. Der Build aktualisiert auch das generierte `precache-manifest.js`; zusätzliche Laufzeitordner muss die UI bei der Anbindung ergänzen.
- Browserergebnis: 88 Assets geladen, 908 Frames, keine fehlenden Assets, keine JavaScript-/HTTP-Fehler; Animation läuft; 1500 × 1100 und 390 × 844 ohne horizontalen Überlauf.
- Tatsächliche Imagegen-Prompts, Referenzen und Originaldateien: [PROMPTS.md](../assets/content-art/PROMPTS.md), [87 Herkunftsdatensätze](../assets/content-art/generation-2026-09-17.json). Konkrete Modellversion vom eingebauten Werkzeug nicht ausgewiesen.
- Finale Exportparameter einschließlich Zuschnittgrenzen: [handoff-jobs.json](../tools/sprite-pipeline/handoff-jobs.json). Historische Größen in den Herkunftsdatensätzen beschreiben die jeweilige Erzeugung; verbindlich für die Anbindung ist der Exportkatalog.

In den Sichtprüfungen korrigiert: schwache HUD-Kontraste, falscher Öffner, verlorene Requisiten bei zwei Bewohnern, Raben-Erstfassung, uneinheitliche Bierdeckel-Ausrichtung, Fremdfragmente an Talent-Zuschnitten und zu kleine Boss-Referenzhöhen. Verworfene Originale bleiben mit Versionssuffix dokumentiert.

Es wurden keine neuen Gebäude oder Geländekacheln geliefert (C1 bleibt offen), keine vorhandenen Skillbilder ersetzt und keine unveränderten Talente neu gestaltet.

## Nachlieferung der gemeldeten Lücken

Bude-Reiter, Anni, vier Gegner mit separaten Laufbögen, Pit und alle 19 Kulissen-Arten sind einschließlich Renderer-Anbindung nachgeliefert. Details, Herkunft, Prüfungen und Grenzen: [Grafik-Nachlieferung](GRAFIK-NACHLIEFERUNG-2026-09-17.md).
