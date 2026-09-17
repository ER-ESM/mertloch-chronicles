# Grafikbedarf der UI

Für alles, was nicht aus `content/` kommt (UI-Icons, Rahmen, Fenster-Embleme, HUD-Elemente). Inhaltliche Bilder (Items, Gegner, Bosse, NPCs, Skills) stehen automatisch in `content/ART-BRIEF.md`.

Format je Zeile: ID · Zweck · Größe · Bildhinweis · aktueller Fallback.

| ID | Zweck | Größe | Bildhinweis | Fallback |
|---|---|---|---|---|
| `ui-elite-badge` | Elite-Kennzeichen im Zielfenster und auf der Karte | 16×16 | Goldener Bierdeckel mit Stern | Text „ELITE“ |
| `ui-speech-bubble` | Sprechblase für Boss- und Bewohnersprüche | 9-Slice, 32×24 | Pergament-Sprechblase mit Pflaumentinte-Rand | Rechteck |
| `ui-chapter-lock` | Ausgegraute Kapitel 2/3 im Auftragsbuch | 24×24 | Vorhängeschloss aus Kronkorken | Text „bald“ |
| `ui-menu`, `ui-sound`, `ui-fullscreen` | HUD-Knöpfe rechts unten, heute Unicode ☷ ♫ ⛶ | 20×20 | Holzknopf mit Bierdeckel-Motiv: Liste / Note / Rahmen | Unicode-Zeichen |
| `ui-reward` | Belohnungskasten im Dialog, heute ♜ | 24×24 | Goldener Dosenöffner | Unicode ♜ |
| `ui-tab-figur`, `ui-tab-rucksack`, `ui-tab-kniffe`, `ui-tab-auftraege`, `ui-tab-karte`, `ui-tab-hilfe` | Reiterleiste des Clanbuchs (docs/MENUE-BEWERTUNG-2026-09-17.md) | 24×24 | Porträtrahmen / Rucksack / Kronkorken-Kelle / Aushang / Karte / Fragezeichen auf Bierdeckel | Buchstaben K C J M N |
## Ausrüstung 0.14

Die neuen Plätze verwenden eigene Pixel-Fallbacks in `item-art.js`: helmet, necklace, shoulders, bracers, gloves, belt, trousers, trinket, blade, maul und slingshot. Sie sind bereits in Rucksack, Charakter und Tooltips angebunden. Für spätere gezeichnete Varianten gilt dieselbe Clan-Palette und ein transparenter 24/48-Pixel-Export; die vier festen neuen Waffen-/Schild-IDs stehen mit `look` im generierten ART-BRIEF. Das App-Symbol ist ein eigenes SVG mit daraus gerenderten 192-/512-Pixel-PNGs in `assets/app/`.
## Erledigt · UI 0.18.1

Menü, Ton, Vollbild und Journal sind über `ui-art.js` angebunden. Die Dialogbelohnung nutzt nun einen nativen goldenen Dosenöffner (`reward`, 24-Pixel-Raster); die Touchkonfiguration das vorhandene Menü-Sprite. Die früheren Unicode-Fallbacks dieser Bedienelemente sind ersetzt. C1 bleibt als separate Entscheidung offen.

## Dialog-Atlas 4×5 (Story, 2026-09-17)

`content/portraits.js` ist von vier auf fünf Zeilen gewachsen: Zwei neue Gesprächsfiguren aus Akt 1 haben Nebenquests bekommen und brauchen darum eine eigene Zelle im `assets/content-art/npcs/dialogue-atlas.png`.

| Zelle | ID | Figur | Bildhinweis |
|---|---|---|---|
| 16 | `kurt` | Kegelbruder Kurt | Vereinspolo „Alle Neune Kalt“, Bauchansatz, Kegel unterm Arm, Besen statt Kugel – der Versöhnliche aus Kalt |
| 17 | `timo` | Trauzeuge Timo | Schärpe, Bierbong, drei Tage wach, Sonnenbrand, unerschütterlich gut gelaunt |

Bis die Zellen 12–17 gezeichnet sind, malt die Gesprächs-UI Porträts über `PERSON_APPEARANCE`; Pit, Kurt und Timo zeigen ihren Anfangsbuchstaben. Kein Blocker, nur eine Lücke.
