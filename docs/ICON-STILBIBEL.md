# Icon-Stilbibel (E-74, 25./26.09.2026)

Verbindlich für alle Symbole (Gegenstände, Kniffe, Talente) und für Codex-Aufträge.
- Herleitung: vier Grafikdesign-Reviews R0–R4 unter `D:\Dev\_review\icons-r0 … icons-r4\`.
- Skala 1–5, 5 = WoW-Niveau (E-70).
- Gegenstände stehen seit R4 bei **5**.

## Anzeige (gilt für alle Familien)
- **Nur 1:1-Stufen 48 / 32 / 24 px.** Canvas = CSS-Größe (`icon-steps.js`, `icon-steps.css`). Der Test `tests/icon-steps.test.mjs` prüft das.
- **Verkleinern nur per Flächenmittel**, danach Einrasten auf die **eigenen Farben des Symbols** (`shrinkPixels`/`sourcePalette` in `content-art.js`).
  - Kein Nächster Nachbar, kein `styleIcon` (32 px, 40 Farben) für Katalogbilder.
  - Kein festes Einrasten auf `PRECISION_PALETTE`, sonst gehen Blau, Rosa, Lila und helles Grün verloren.
- **Ein Weg je Gegenstand:** `itemArt` (rpg-ui.js) überall, also Rucksack, Leiste, Chat, Beute, Belohnungen und Dungeon.
- **Rahmenregel:** Leiste = Moos-Kachel (`ability-tile.js`), Rucksack, Figur und Talentbaum = frei. Der Bildspeicher (`paintOnce`) trennt beide Orte im Schlüssel.

## Alle Familien
| Regel | Soll |
|---|---|
| Kontur | 1 px `#171f29`, außen geschlossen (≥ 95 % der Außenkante dunkel) |
| Licht | oben links; Glanz oben links, dunkelste Stufe unten rechts |
| Palette | Alpha nur 0/255. Gemalte Gegenstände: `tools/sprite-pipeline/waffen-palette.json` |
| Motiv | Name wörtlich und dörflich; **kein lesbarer Text im Symbol**; nie ein Platzhalter aus dem Vokabular |
| Lesbarkeit | Das Schlüsselmotiv muss in 48 **und** 32 px sofort lesbar sein. Lesbarkeit geht vor jeder Messregel. |

## Gegenstände (freigestellt)
- **Format:** 64 × 64, Motiv-Langseite 58 px (Füllung 0,91), 3 px Rand.
- **Deckung:** ≥ 0,30; bei dünnen Dingen ≥ 0,18 und Kopf ≥ 16 × 16.
- **Blickwinkel:**
  - Waffen und Werkzeug 45° ± 8°, Griff links unten.
  - Kleidung frontal oder ¾ nach links.
  - Schuhe seitlich, Spitze rechts.
- **Materialregel** (R1, gemessen mit `D:\Dev\_review\icons-r1\r1pruef\tools\glatt.mjs`):
  - Soll: Unruhe ≤ 16, harte Helligkeitssprünge ≤ 0,20, weiche Übergänge ≥ 0,45.
  - Toleranz für ein Schlüsselmotiv: ≤ 18 / ≤ 0,24.
  - Technik:
    - eine Treppe mit 4–6 Stufen je Material
    - Textur nur ±1 Stufe
    - Nähte und Nieten in der dunklen Nachbarstufe
    - höchstens 3 Glanzpunkte
    - gestufter Innenrand an der Tinte (`randverlauf`/`weichrand`)
- **Leitbilder:** `items/gear-helmet.png`, `gear-furboot.png`, `rohrzange.png`, `dienstmuetze.png` (bestes Maler-Symbol).
- **Symbol ↔ Figur:** Das Hauptmaterial kommt aus derselben PAL-Treppe wie an der Figur (`tools/paperdoll/familien.mjs`). Die Figur ist abgenommen, deshalb folgt das Symbol der Figur.
- **Doppel:** Kein Katalog-Gegenstand teilt sich ein Bild. `tests/icons-gegenstaende.test.mjs` prüft das, zusammen mit gear-Zwillingen, Freistellungen und Doppeln.

## Kniffe und Fähigkeiten (Moos-Kachel)
- **Kachel:** vollflächig 64, ohne Leerrand, 1 px Tintenrahmen. Der Knopf rahmt.
- **Grund** (`ability-tile.js`):
  - Basis `#263530`
  - 20–35 % Moosflecken `#354b36`
  - 10–25 % Tupfen `#171f29` in kleinen Gruppen
  - ≤ 8 % warm `#3d3530`
  - Vignette 4 px
  - **kein `#1e2c35`**
- **Motiv:** ≈ 85 %, Schlagschatten 2 px nach rechts unten. Ein Hauptobjekt ≥ 55 %, höchstens 2 Effekte. Effektfarbe nach Wirkung (Glut, Heilung grün, Schutz Blaustahl).
- **Käthes Karten:** Papier-Treppe `#f8f0d5`/`#e4dcc3`/`#c8c5af`, Tintenrahmen, 2-px-Rundung, Schatten. Der Aufbau folgt E-72 Runde 3: Filz, Wirkung groß.

## Talente
- **Motiv:** 59/64 aus der Quelle exportiert (`build-talents.mjs`), frei auf dem Knoten, im 48er-Knoten 1:1.
- **Glyphe:** Genau eine oben rechts (12 × 12 bei 48), nur bei Modifikatoren. Unten rechts bleibt frei für die Rang-Plakette.

## Werkzeuge
- **Pixelmaler:** `D:\Dev\_prototypen\waffen-2026-09-25\maler.mjs`, dazu je Gruppe ein eigenes `maler2.mjs` unter `D:\Dev\_prototypen\icons-2026-09-25\<gruppe>\`.
  - Arbeitsweise: Hi-Res S=4, Flächenmittel auf 64 px, Einrasten auf die Waffenkammer-Palette.
- **Übernahme:** `node tools/sprite-pipeline/icons-uebernehmen.mjs [--gruppe x] [--nur ids] [--ohne-build]`. Danach `npm run sprites:precision`, `node tools/class-visuals/build-talents.mjs` und `node scripts/pwa-cache.mjs`.
- **Codex:**
  - `docs/ICONS-CODEX-2026-09-26.md`: Spez-Wappen und dichte Dieter-Kniffe, Aufgabe „MertlochIcons“.
  - `docs/e72-runde3/bilder.md`: Talentraster Schorsch/Käthe, Einzeltalente und Code-Kniffe über `npm run e72:bilder`.
