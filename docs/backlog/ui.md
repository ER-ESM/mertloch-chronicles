# Backlog · ui

Inbox der UI-Rolle (docs/ROLLEN.md). Andere Rollen tragen hier Bedarf ein: Ziel, Grund, Abnahme, betroffene IDs/Dateien. Die Rolle hakt ab, löscht nicht.

## Offen

- [ ] **Sprites je `variant`** (Grafik/Welt): Ladeliste `assets/content-art/<kind>/<id>.png`; Renderer prüft `variant` vor `skin`. Mentoren und Sammelpunkte nutzen heute Ersatzgrafik.
- [ ] **Sprechblasen** für Gegner-/Boss-Sprüche und Dorfbewohner, sobald die Engine das Event `bark` liefert.
- [ ] **Elite-Titel** (`title`) im Zielfenster anzeigen (heute „ELITE ·“ nur bei Bossen).
- [ ] **Porträt für Pit** (Grafik liefert über ART-BRIEF; UI bindet an).
- [ ] **Kapitel-Kulissen zeichnen** (Welt liefert Objekte): Sperrmüllplatz, Kegelbahn-Trümmer, Bus im Feld, Bude mit Ausbaustufen.

## Erledigt

- [x] Akt 1: Kapitel-Dialoge, HUD/Questlog aus content, Reiter „Bude“ mit Erinnerungen, Mentoren, Sammelpunkte, Erinnerungs-Einblendung (2026-09-17, scripts/akt1-check.mjs).
