# Übergabe an die Bild-KI · 2026-09-17

Für: die KI, die Sprites, Icons und Porträts erzeugt. Von: Inhalt/UI. Alles, was das Spiel heute zeichnet, läuft mit Fallbacks weiter; jede Lieferung ersetzt einen Fallback, ohne dass etwas kaputtgeht.

## Stil, verbindlich

- **Maifeld-Detailpixel** nach `ART-DIRECTION.md` (Stand 0.19): warme 40-Farben-Ankerpalette, dunkle Schieferkonturen, Licht von links oben, klare Pixelcluster, echte Transparenz. Keine weichen Verläufe, kein Texturrauschen.
- **Maßstab:** Held 52 native Pixel hoch = 26 Welteinheiten; Tür 35 px; ein Meter = 8 Welteinheiten. Tiere 18–24 px, Menschen 26 px, Bosse ca. 52 px.
- **Referenzen:** `assets/content-art/aperol-anni/` (Heldin im Zielstil), `assets/maifeld-live/sources` (Rig-Vorlagen), `assets/content-art/npcs/dialogue-atlas.png` (Porträts), `assets/content-art/PROMPTS.md` (bisherige Prompts, Format der Atlanten).
- **Pipeline:** `tools/sprite-pipeline/build-live.mjs` baut Laufzyklen aus Quellbögen; Anforderungen an Bögen stehen dort in `config.mjs`.

## Reihenfolge der Lieferung

Die vollständige, priorisierte Liste aller fehlenden Sprites mit IDs und Formaten steht in `docs/FEHLENDE-SPRITES.md` (Stand 2026-09-17, inklusive Clanbuch-Reiter, Schwung- und Proc-Anzeige, Übungspuppe, 18 neue Talent-Motive).

### 1 · Clanbuch-Reiter (6 Icons, 24×24, sofort sichtbar)

| ID | Motiv | Ersetzt heute |
|---|---|---|
| `ui-tab-figur` | Porträtrahmen mit Clankutte | Person-Icon |
| `ui-tab-rucksack` | Lederrucksack mit Pfandflasche | Bag-Icon |
| `ui-tab-kniffe` | Kronkorken-Kelle, gekreuzt mit Pinsel | Buch-Icon |
| `ui-tab-auftraege` | Aushang mit Reißzwecke | Quest-Icon |
| `ui-tab-karte` | gefaltete Karte mit Bierdeckel-Kompass | Karten-Icon |
| `ui-tab-hilfe` | Fragezeichen auf Bierdeckel | Buch-Icon |

Ablage: `assets/content-art/ui/<ID>.png`, transparenter Hintergrund, ein Bild je Datei.

### 2 · HUD-Symbole (20×20 und 24×24)

`ui-menu`, `ui-sound`, `ui-fullscreen` (Holzknöpfe mit Bierdeckel-Motiv), `ui-reward` (goldener Dosenöffner), `ui-elite-badge` (goldener Bierdeckel mit Stern), `ui-speech-bubble` (9-Slice-Sprechblase, Pergament mit Pflaumentinte-Rand), `ui-chapter-lock` (Vorhängeschloss aus Kronkorken). Details in `docs/GRAFIK-BEDARF.md`.

### 3 · Helden angleichen (Stilbruch schließen)

Dosen-Dieter und Klo-Kevin im selben Detailstil wie Aperol-Anni: vier Richtungen, Stand/Gehen/Angriff, freie Hände für Ausrüstungsebenen (Waffe, Nebenhand, Fernkampf, Brust). Vorlagenformat wie `assets/content-art/aperol-anni/hero.png`. Look-Texte stehen in `content/classes.js` (`look`).

### 4 · Bewohner und Auftraggeber im Detailstil

Acht Bewohner-Varianten (`content/npcs.js` VILLAGERS) und die zwölf Auftraggeber (Sprites, nicht nur Porträts). Ein Bogen je Figur, gleiches Rig wie die Helden.

### 5 · Gegner und Bosse

Aus `content/ART-BRIEF.md` (Abschnitt enemy/boss): Leergut-Rabe, Pfandfuchs, Festzelt-Schnorrer, Ordnungsamt-Praktikant, Borsten-Bruno (Elite), Gisela Gießkanne, Der Pfandautomat 3000. Je Gegner: vier Richtungen, zwei Gehframes, ein Angriffsframe; Bosse zusätzlich Idle und Phasenpose. Bis zur Lieferung zeichnet das Spiel den Fallback-`skin` (Dachs, Gans, Keiler, Ruhewart, Horst).

### 6 · Gegenstände (24×24)

Aus `content/ART-BRIEF.md` (Abschnitt item): Currywurst, Kaltgetränk, Fuchsschwanz, Flugblatt, Hopfen, Dosenblech, Bierdeckel-Panzerweste, Kabelbinder-Stiefel, Megafon, Fuchspfote, Schnorrerbecher, Praktikantenausweis, Gießkanne, Greifarm. Ablage `assets/content-art/items/<ID>.png`.

### 7 · Schwung- und Proc-Anzeige (nach Umsetzung des Gameplay-Konzepts)

Drei Bierdeckel-Pfeile (Schwung-Stapel), ein Leuchtrahmen für Proc-Kniffe (9-Slice, gold, 48×48), siehe `docs/GAMEPLAY-KONZEPT-FLUSS.md` Abschnitte 4 und 5.

## Abnahme

- Datei heißt wie die ID, liegt im genannten Ordner, PNG mit Transparenz, Größe wie angegeben, keine Beschriftung im Bild.
- Prompt und Herkunft in `assets/content-art/PROMPTS.md` ergänzen (Datum, Modell, finaler Prompt), wie bei den Porträts.
- Vor der Übergabe an die UI ein Vergleichsbild neben dem Aperol-Anni-Bogen: gleiche Konturstärke, gleiche Lichtrichtung, gleiche Palette.
- Die UI-Rolle bindet an (Renderer: `variant` vor `skin`, Icons: Ladeliste `assets/content-art/ui`). Bis dahin bleibt der Fallback sichtbar; nichts darf ohne Bild fehlen.

## Nicht liefern

- Keine neuen Gebäude oder Karten-Kacheln, bis die Zeichensprache der Welt entschieden ist (`docs/VISUELLE-BEWERTUNG-2026-09-13.md`, Punkt C1).
- Keine Icons für Skills (Atlanten vorhanden) und für die 72 unveränderten Talente. Nur die 18 neuen Proc-Talente brauchen ein Motiv (`docs/FEHLENDE-SPRITES.md`, Abschnitt 6).
- Keine Bilder mit Text, Logos, echten Marken oder realen Personen.
