# Renderer-Prototypen A–D (2026-09-21)

**Anlass.** Frage des Nutzers: Lohnt ein Umstieg auf three.js für mehr Effekte, Interaktivität und Immersion? Mobile ist dafür vorerst nicht maßgeblich.
**Ergebnis.** Vier lauffähige Prototypen auf derselben echten Welt und Engine. Einstieg: `proto-renderer.html`. Kein Teil des Spiels, nichts davon ist in `index.html` eingebunden. **Entschieden ist nichts** – das gehört nach `docs/ENTSCHEIDUNGEN.md`, sobald der Nutzer gewählt hat.

| | Datei | Idee | Aufwand fürs echte Spiel | Berührt |
|---|---|---|---|---|
| A | `proto-a.js` | Canvas 2D weiter ausbauen (wie E-39) | läuft | nur Effekt-Ebenen |
| B | `proto-b.js` | WebGL2-Shader über dem fertigen 2D-Bild + GPU-Partikel, ohne Bibliothek | 3–5 Tage | neue Schicht hinter Schalter; Renderer unberührt |
| C | `proto-c.js` | three.js zeichnet; Sprites als Tafeln auf Bodenfläche, gebacken aus den bestehenden Zeichnern | 2–3 Wochen | `renderer.js`, Beschriftungen/Balken/Sprechblasen, ~35 Prüfskripte, Nebenseiten |
| D | `proto-d.js` | Live-3D: extrudierte Häuser, Instanz-Bäume, Kasten-Rig aus E-30 | 2–4 Monate + neue Grafik | alles Sichtbare; widerspricht E-10 und E-30 |

Gemeinsam: `proto-common.js` (Welt + Engine starten, Tasten, Lichtquellen, Bedienfeld, Messung), `proto.css`, Bilder `assets/proto-renderer/`.

## Was die Prototypen belegen
- **Die Engine ist vom Bild getrennt.** Alle vier fahren `new Game(world,…)`, `game.tick(dt)`, `game.keys`, `game.navigate(p)` unverändert; C und D ersetzen `screenToWorld` durch einen Strahl auf die Bodenebene.
- **C kann die vorhandenen Zeichner weiterverwenden:** `createTerrainChunk` → Bodentextur, `drawBuilding`/`drawAssetTree` einmal gebacken, `drawClanHero`/`drawClanEnemy`/`drawComicResident` je Bild in eine kleine Leinwand. Alle 3324 Bäume sind zehn Zeichenaufrufe.
- **B bekommt fast alles, was nach „mehr Effekte" aussieht,** ohne eine Zeile am Renderer: Licht, Bloom, Farbstimmung, Nebel, Wolken, Regen, Flimmern, Verzerrung, Partikel.
- **D zeigt den Preis:** Sobald die Kamera dreht, ist die Pixelgrafik wertlos. Was dort steht, sind Grundformen.

## Bekannte Grenzen
- Gemessen wurde nur im automatisierten Browser mit Software-Grafik; die Bildraten dort sagen nichts. Aussagekräftig ist die Anzeige oben links auf dem eigenen Rechner. B zeigt zusätzlich die Zeit für den Textur-Upload – die Weltleinwand ist wegen `WORLD_ART_DENSITY=4` sehr groß (bei 1700 px Breite 3448×1800).
- Ladereihenfolge: `terrain.js`/Zeichner hängen zirkulär zusammen; C und D importieren deshalb zuerst `renderer.js`, wie das Spiel.
- C: Hauslicht wird am Fußpunkt berechnet (ganzes Haus gleich hell); gemalte und geworfene Schatten doppeln sich bei Bäumen. D: Steuerung rundet auf acht Richtungen, weil die Engine nur Tasten kennt.
- Kein HUD, keine Namensschilder, kein Kampfbild in C/D – das wäre der Hauptteil der 2–3 Wochen.
