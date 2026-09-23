# Grafiklieferung 23.09.2026 · Die Bude als gemaltes Haus (E-52, Runde 2)

**Bestellt:** Die Bude soll die Optik und den Detailgrad der Konzept-Mockups erreichen (`docs/konzept-bude-2026-09-23/`), als „gemaltes Haus in Ebenen“.

## Weg

1. **Vorlage aus den Daten:** `tools/sprite-pipeline/bude-house-guide.mjs` zeichnet den Grundriss aus `content/bude-house.js` im Zielmaßstab mit der Platzhalter-Grafik, innen 1536 × 1024 bei 5 px/E, außen 1024 × 1024 bei 3,4 px/E. Ablage unter `assets/precision/sources/2026-09-23/guides/`.
2. **Erzeugen (E-51):** `npm run sprites:generate -- tools/sprite-pipeline/bude-haus-20260923-jobs.json`. Als Referenzen dienen die Vorlage (verbindliche Lage von Wänden, Türen und Fassade) und das passende Mockup (Stil). Die Herkunft steht in `assets/precision/generation.json`.
3. **Export:** `node tools/sprite-pipeline/build-bude-house.mjs`. Flächengewichtetes Sampling auf 4 px/E und die Präzisionspalette. Die Größe sinkt von 2,5 MB auf rund 0,56 MB je Bild.
   - **Innen:** Die Registrierung der Vorlage bleibt gültig, weil das Original genau ihr Format hat.
   - **Außen:** Die Fassade wird vermessen: linke und rechte Kante sowie Sockel geben 4,29 px/E.
   - **Registrierung:** `assets/precision/runtime/buildings/bude-haus.json`.

## Anbindung (`bude-house-art.js`)

- **Innen:** Das Haus blendet mit dem Dach ein, der Hof ist immer sichtbar und genau auf seine Fläche zugeschnitten.
- **Verdeckung:** Waagerechte Wände werden als Streifen aus dem Innenbild ausgeschnitten und nach Tiefe sortiert. Eine Figur hinter einer Wand verschwindet dadurch bis zur Hüfte dahinter. Senkrechte Wände verdecken nichts, sie stehen neben der Figur.
- **Außen:** Das Haus mit Dach ist nach seiner Vorderkante sortiert.
- **Rückfall:** Bis zum Laden der Bilder zeichnet der Platzhalter aus Formen.

## Abnahme

- `npm test`: 698 von 698 bestanden.
- `scripts/bude-house-check.mjs` im Browser bei 2024 × 900, Screenshots unter `visual-review/bude-house/`:
  - draußen mit Dach
  - durch die Tür in Schankraum und Küche
  - eine Wand hält den Helden auf
  - ein neuer Held wacht im Schankraum auf
  - der Weg zu Papp-Horst führt durch die Hoftür
- Offline-Cache: `bude-haus-innen.png`, `bude-haus-aussen.png` und `bude-haus.json` sind im Manifest.

## Offen

- **Möbel der Basisbau-Plätze:** Tresen, Sofa, Grill und Werkstatt sind noch die kleinen Trümmer- und Stufen-Requisiten. Das gemalte Innenbild lässt die Raummitten dafür frei. Nächster Schritt: je Stufe ein gemaltes Möbel in derselben Kamera.
- **Hoher Hausrat verdeckt noch nicht:** Das Barregal und der Kühlschrank sind ins Innenbild gemalt, Figuren laufen also optisch darüber.

---

## Nachtrag: Sprite-Baukasten (E-54)

Auf Nutzerwunsch ersetzt der Baukasten die gemalten Innenebenen (Regeln: `docs/BAUKASTEN.md`). Geliefert und angebunden:

- **Baukasten-Sprites:** `tools/sprite-pipeline/kit-20260923-jobs.json` (9 Bögen), Export `node tools/sprite-pipeline/build-kit.mjs`, zusammen 60 Sprites unter `assets/precision/runtime/kit/`:
  - 9 Beläge als 64-E-Kacheln
  - 3 Wandstreifen (Krone und Front)
  - 11 Wandschmuck-Teile
  - 20 Möbel
  - 12 Tisch- und Bodendeko-Teile
  - 5 Draußen-Teile
- **Möbel je Basisbau-Stufe:** 16 gemalte Sprites (`bude-moebel-<gebäude>-<stufe>.png`), angebunden über `prop.art`.
- **Obergeschoss:** Baubüro, Dachboden, Matratzenlager und Flur, eingerichtet aus dem Baukasten.
- **Nicht mehr zur Laufzeit genutzt:** die gemalten Innenebenen `bude-haus-innen*.png` und `bude-haus-oben.png`. Sie bleiben als Herkunft und Stilreferenz unter `sources/`.

Abnahme: `npm run kit:check` (beide Geschosse regelkonform), `npm test`, `scripts/bude-house-check.mjs` mit Screenshots unter `visual-review/bude-house/`.

Offen:
- Die Dielen-Kacheln zeigen leichte Helligkeitsfelder an den Kachelgrenzen.
- Die Treppe ist noch Platzhalter-Zeichnung.
