# Backlog · ui

Inbox der UI-Rolle (docs/ROLLEN.md). Andere Rollen tragen hier Bedarf ein: Ziel, Grund, Abnahme, betroffene IDs/Dateien. Die Rolle hakt ab, löscht nicht.

## Offen

- [ ] **Sprechblasen** für Gegner-/Boss-Sprüche und Dorfbewohner, sobald die Engine das Event `bark` liefert. (Die Blase selbst ist seit der Anbindung 2026-09-17 das gelieferte 9-Slice `ui-speech-bubble`; es fehlt nur der Auslöser.)
- [ ] **Elite-Titel** (`title`) im Zielfenster anzeigen (heute „ELITE ·“ nur bei Bossen). Das Elite-Abzeichen in der Welt hängt seit 2026-09-17 an `ui-elite-badge`.
- [ ] **Porträt für Pit** (Grafik liefert über ART-BRIEF; UI bindet an).
- [ ] **Kapitel-Kulissen zeichnen** (Welt liefert Objekte, 0.20): `world.camps[].props` = Liste `{id,kind,x,y,w,h,blocking}`, Mittelpunkt in Weltkoordinaten, Grundfläche in Welteinheiten. Arten, Zeichenhöhe und Fallback-Farbe stehen in `world-prop-kinds.js` (`PROP_KINDS`), Bildhinweise in docs/GRAFIK-BEDARF.md („Kapitel-Kulissen“). Kapitel 2 Sperrmüllplatz (`schrotthaufen`, `haenger`, `kuehlschrank`), Kapitel 3 Festplatz (`kegelbahn`, `bierbank`, `kegelkugel`), Kapitel 4 Bus im Feld (`bus`, `bierkasten`, `bierbong`); `camp.place` nennt den Ort. Zeichnen wie die Lager-Ausstattung in `world-details.js` (`drawOccupiedCamp`), Bildschwelle auf `y + h/2`, Höhe aus `PROP_KINDS[kind].height`. `blocking:true` (nur Bus und Schrotthaufen) ist bereits ein echter Kollisionskörper — nicht zusätzlich blockieren, aber die Figur davor/dahinter richtig verdecken. Abnahme: Screenshot je Kapitel-Lager.
- [ ] **Die Bude zeichnen** (Welt liefert das Gelände, 0.20): `world.base` = `{id:'bude',x,y,w,h,minX..maxY,approach,stageProps}`, ~156×110 Einheiten nahe St. Gangolf (Prüfseed 56753: 192 Einheiten von der Kirche). `stageProps[<Gebäude-ID aus content/buildings.js>] = {owner,slot,stages:[{stage,kind,name,x,y,w,h,height}]}`; `stage:0` sind die Trümmer, danach je Ausbaustufe dieselbe Art in wachsender Größe. Gezeichnet wird immer genau die erreichte Stufe (`game.buildings[id]`, 0 = Trümmer). Das Gelände selbst blockiert nicht; Anlaufpunkt `base.approach` ist begehbar und in der Weltprüfung enthalten (Route „Bude“). Abnahme: Bude mit allen sechs Bauplätzen auf Stufe 0 und auf Endstufe.

## Erledigt

- [x] **Sprites je `variant`** (Grafik/Welt): Ladeliste jetzt `assets/content-art/handoff-catalog.json` statt fester Pfade; `content-art.js` löst die Aliase auf, `live-art.js` wertet `variant` (über `livePersonId`) vor `skin` aus und `clan-art.js` prüft den gelieferten Bogen vor dem alten Rig. Ohne Bild bleibt der bisherige Fallback (2026-09-17).
- [x] Anbindung der Grafiklieferung 2026-09-17: 88 Assets, 6 Clanbuch-Reiter, HUD-Symbole, Figuren mit Fußpunkten und Sockets, 18 Proc-Talente, Schwung, Proc-Rahmen/-Marker, Übungspuppe, PWA-Cache (`content-art.js`, `live-art.js`, `ui-art.js`, `talent-art.js`, `renderer.js`, `scripts/pwa-cache.mjs`).
- [x] Akt 1: Kapitel-Dialoge, HUD/Questlog aus content, Reiter „Bude“ mit Erinnerungen, Mentoren, Sammelpunkte, Erinnerungs-Einblendung (2026-09-17, scripts/akt1-check.mjs).
