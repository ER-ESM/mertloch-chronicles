# Minikarte neu (23.09.2026)

Nutzerauftrag: Minimap komplett neu nach WoW-Vorbild, mehr Optionen, hilfreicher, individualisierbar, zoombar, Mouse-Over-Tooltips.

## Was, wo

| Datei | Inhalt |
|---|---|
| `minimap.js` | Aufbau (Ortsschild, Ring, Knöpfe, Uhr, Menüs, Tooltip), Grundkarten-Zwischenspeicher, Symbole, Einstellungen (`mertloch-minimap-v1`), reine Hilfen `readMinimapSettings`, `edgePoint`, `insideDisc`, `minimapDisc` |
| `minimap.css` | Messing-Medaillon (rund, `--chrome-portrait`) bzw. Messingrahmen (eckig, `--chrome-frame`), Knöpfe, Menüs, Tooltip |
| `content/minimap.js` | Zahlen (Zoomstufen, Größen, Takt, Reichweiten) und alle Texte (`MINIMAP`, `MINIMAP_GROUPS`, `MINIMAP_UI`) |
| `renderer.js` | eine Zeile in `map()`: `#minimap` geht an `attachMinimap` (bindet beim ersten Aufruf ein) |
| `index.html` | `#miniButton` ist jetzt ein `div` (Knöpfe dürfen nicht in einem Knopf liegen), `minimap.css` eingebunden |
| `scripts/minimap-check.mjs` | Browserprüfung, Bilder nach `visual-review/minimap/` |
| `tests/minimap.test.mjs` | Einstellungen, Randpunkte, Größen |

`app.js` ist unverändert: Klick auf `#miniButton` öffnet weiter die Weltkarte (`showMap`), Rechtsklick weiter das Kontextmenü; `renderer.map($('#minimap'))` alle 200 ms bindet nur noch an.

## Bedienung

- **Klick** auf die Karte: Weltkarte (wie bisher). **Umschalt + Klick**: Wegmarke setzen und hinlaufen (`game.navigate`).
- **Zoom**: Knöpfe +/− am Ring oder Mausrad über der Minikarte, 5 Stufen (Sichtweite 2600 … 440 Weltpixel, Stufe 3 = alte Umgebungskarte), gemerkt.
- **Lupe** (oben links): Symbolgruppen ein/aus – Aufträge, Händler, Lehrer & Werkstätten, Orte & Dienste (Bude, Fahrstall, Treffpunkte, Verlies-Eingang), Fundstellen, Mitspieler & Gruppe, Gegner & Lager, Laufweg.
- **Zahnrad** (unten links): Form rund/eckig, Größe klein/mittel/groß (136/164/208 px), mit Blickrichtung drehen (Norden-Schild wandert am Ring), Uhrzeit an/aus, Zurücksetzen.
- **Kartenknopf** (oben rechts): Weltkarte (M).
- **Tooltip** über jedem Symbol: Name + Art (z. B. „Wilder Hopfen · Kräutersammeln 25“, „Mara „Katerkiller“ · Auftrag verfügbar“, „Pfandkeiler · Gegner · Stufe 2“); liegen mehrere übereinander, stehen alle untereinander. Auftragsziel außerhalb: goldener Pfeil am Rand, sonst pulsierende Raute; Gruppenmitglieder und Weltbosse ebenfalls am Rand.
- Kiosk und Verlies: der bisherige Innenraum-Zeichner, verkleinert in den Ring.
- Touch-Modus: Minikarte bleibt ausgeblendet (wie bisher).

## Maße (Standard „mittel“, rund, 2024×900)

`#miniButton` rechts oben: `top:12px; right:16px`, **164 × 179 px** (Ortsschild ragt 15 px über den Ring), Unterkante **y = 193** (die Uhr sitzt auf dem unteren Ringrand). Die jeweils aktuelle Unterkante steht als CSS-Variable `--minimap-bottom` am `#gameShell` (auch bei Größe/Form-Wechsel und HUD-Editor-Verschiebung), damit die Auftragsverfolgung darunter andocken kann.

## Leistung

Grundkarte (Flächen, Körnung, Wasser, Wege, Häuser, Bäume) in einem Zwischenspeicher der dreifachen Sichtweite je Zoomstufe/Größe; Neuaufbau nur beim Verlassen der Mitte, Zoom- oder Größenwechsel (gemessen 2–5 ms). Je Bild (höchstens 30/s, nur sichtbar) eine Kopie + Symbole aus vorgezeichneten Kleinbildern: 0,1–0,4 ms. Zum Vergleich: die alte Umgebungskarte zeichnete alle 200 ms die ganze Vektorkarte neu (0,7 ms). Kein Blend-Modus, kein Filter. Bildrate im Prüfbrowser beim Laufen mit/ohne Minikarte gleich (16,6 ms je Bild).

## Offen

- Auftragsverfolgung (`.quest-panel`) muss unter die neue Unterkante (orchestrierende Sitzung).
- Das Ortsschild wiederholt den Ortsnamen, der oben mittig (`.region-label`) ohnehin steht – bei Bedarf dort ausblenden oder nur beim Gebietswechsel einblenden (wie WoW).
- Symbole für Wohnhäuser/Anwohner, Briefkasten, Kalender (WoW-Knöpfe ohne Gegenstück im Spiel) gibt es nicht.
- Innenräume (Kiosk, Verlies) nutzen weiter den alten, schlichten Zeichner ohne Zoom und Tooltips.
