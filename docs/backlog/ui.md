# Backlog · ui

Inbox der UI-Rolle (docs/ROLLEN.md). Andere Rollen tragen hier Bedarf ein: Ziel, Grund, Abnahme, betroffene IDs/Dateien. Die Rolle hakt ab, löscht nicht.

## Offen

- [ ] **Sprechblasen** für Gegner-/Boss-Sprüche und Dorfbewohner, sobald die Engine das Event `bark` liefert. (Die Blase selbst ist seit der Anbindung 2026-09-17 das gelieferte 9-Slice `ui-speech-bubble`; es fehlt nur der Auslöser.)
- [ ] **Elite-Titel** (`title`) im Zielfenster anzeigen (heute „ELITE ·“ nur bei Bossen). Das Elite-Abzeichen in der Welt hängt seit 2026-09-17 an `ui-elite-badge`.
- [ ] **Porträt für Pit** (Grafik liefert über ART-BRIEF; UI bindet an).
- [ ] **Kapitel-Kulissen zeichnen** (Welt liefert Objekte): Sperrmüllplatz, Kegelbahn-Trümmer, Bus im Feld, Bude mit Ausbaustufen.

## Erledigt

- [x] **Sprites je `variant`** (Grafik/Welt): Ladeliste jetzt `assets/content-art/handoff-catalog.json` statt fester Pfade; `content-art.js` löst die Aliase auf, `live-art.js` wertet `variant` (über `livePersonId`) vor `skin` aus und `clan-art.js` prüft den gelieferten Bogen vor dem alten Rig. Ohne Bild bleibt der bisherige Fallback (2026-09-17).
- [x] Anbindung der Grafiklieferung 2026-09-17: 88 Assets, 6 Clanbuch-Reiter, HUD-Symbole, Figuren mit Fußpunkten und Sockets, 18 Proc-Talente, Schwung, Proc-Rahmen/-Marker, Übungspuppe, PWA-Cache (`content-art.js`, `live-art.js`, `ui-art.js`, `talent-art.js`, `renderer.js`, `scripts/pwa-cache.mjs`).
- [x] Akt 1: Kapitel-Dialoge, HUD/Questlog aus content, Reiter „Bude“ mit Erinnerungen, Mentoren, Sammelpunkte, Erinnerungs-Einblendung (2026-09-17, scripts/akt1-check.mjs).
