# Backlog · ui

Inbox der UI-Rolle (docs/ROLLEN.md). Andere Rollen tragen hier Bedarf ein: Ziel, Grund, Abnahme, betroffene IDs/Dateien. Die Rolle hakt ab, löscht nicht.

## Offen

- [ ] **Sprechblasen** für Gegner-/Boss-Sprüche und Dorfbewohner, sobald die Engine das Event `bark` liefert. (Die Blase selbst ist seit der Anbindung 2026-09-17 das gelieferte 9-Slice `ui-speech-bubble`; es fehlt nur der Auslöser.)
- [ ] **Elite-Titel** (`title`) im Zielfenster anzeigen (heute „ELITE ·“ nur bei Bossen). Das Elite-Abzeichen in der Welt hängt seit 2026-09-17 an `ui-elite-badge`.
- [ ] **Porträt für Pit** (Grafik liefert über ART-BRIEF; UI bindet an).
- [ ] **Kapitel-Kulissen zeichnen** (Welt liefert Objekte, 0.20): `world.camps[].props` = Liste `{id,kind,x,y,w,h,blocking}`, Mittelpunkt in Weltkoordinaten, Grundfläche in Welteinheiten. Arten, Zeichenhöhe und Fallback-Farbe stehen in `world-prop-kinds.js` (`PROP_KINDS`), Bildhinweise in docs/GRAFIK-BEDARF.md („Kapitel-Kulissen“). Kapitel 2 Sperrmüllplatz (`schrotthaufen`, `haenger`, `kuehlschrank`), Kapitel 3 Festplatz (`kegelbahn`, `bierbank`, `kegelkugel`), Kapitel 4 Bus im Feld (`bus`, `bierkasten`, `bierbong`); `camp.place` nennt den Ort. Zeichnen wie die Lager-Ausstattung in `world-details.js` (`drawOccupiedCamp`), Bildschwelle auf `y + h/2`, Höhe aus `PROP_KINDS[kind].height`. `blocking:true` (nur Bus und Schrotthaufen) ist bereits ein echter Kollisionskörper — nicht zusätzlich blockieren, aber die Figur davor/dahinter richtig verdecken. Abnahme: Screenshot je Kapitel-Lager.
- [ ] **Die Bude zeichnen** (Welt liefert das Gelände, 0.20): `world.base` = `{id:'bude',x,y,w,h,minX..maxY,approach,stageProps}`, ~156×110 Einheiten nahe St. Gangolf (Prüfseed 56753: 192 Einheiten von der Kirche). `stageProps[<Gebäude-ID aus content/buildings.js>] = {owner,slot,stages:[{stage,kind,name,x,y,w,h,height}]}`; `stage:0` sind die Trümmer, danach je Ausbaustufe dieselbe Art in wachsender Größe. Gezeichnet wird immer genau die erreichte Stufe (`game.buildings[id]`, 0 = Trümmer). Das Gelände selbst blockiert nicht; Anlaufpunkt `base.approach` ist begehbar und in der Weltprüfung enthalten (Route „Bude“). Abnahme: Bude mit allen sechs Bauplätzen auf Stufe 0 und auf Endstufe.


### Aus dem Playtest Akt 1 (docs/PLAYTEST-2026-09-17-AKT1.md)

- [ ] **P4 EIN Fenster** (E-13): Gespräch, Clanbuch, Beute nie gleichzeitig; Ida-Dialog nicht nach „Weiterüben“ selbst wieder öffnen; unsichtbare Fenster dürfen keine Klicks fangen.
- [ ] **P7 Klamottenwahl** als sichtbare Auswahl mit drei Karten und Bestätigen; keine Rotation ohne Klick; Unterreiter unter „Figur“ (Ausrüstung/Werte/Verwalten/Talente/Bande) auflösen oder als Abschnitte untereinander zeigen (keine Unterseiten).
- [ ] **P1/P2 Kampfleiste**: Autoangriff-Zustand sichtbar (an/aus) und großer Hinweis „Du wirst angegriffen“ auf Event `attacked`; Trefferzahlen am Gegner sichtbar.
- [ ] **P5 Wegmarke je Hofproben-Schritt** (Pfeil + Meter wie im Zielfenster) für Hofmarkierung und Clankiste.
- [ ] **P9 Erinnerungs-Warteschlange**: Erinnerung nie über Tod-Fenster oder Gespräch legen; erst wenn kein anderes Fenster offen ist.
- [ ] **P10 Bude-Reiter**: verdeckte Fetzen als „Noch nicht erinnert“ statt „…“; Überschrift „Erinnerungen“.
- [ ] **P11** Clan-Schule-Popup bleibt, bis geklickt; Linksklick ins Spielfeld öffnet kein Menü.
- [ ] **P12** Ida-Dialog zeigt die Kapitel-Summary nicht zusätzlich zu den Zeilen (Doppelung).
- [ ] **P15** Eigene Taste für Talente (N ist laut app.js schon belegt – prüfen und in Hilfe nennen).
- [ ] **Neu aus Engine/Welt Runde A**: Sprechblasen auf Event `bark`, Ausgrauen „Ausbauen“ außerhalb `atHub()`, Güte epic in Belohnung/Rucksack/Tooltip, Kulissen `world.camps[].props` und Bude `world.base.stageProps` zeichnen (Fallback-Farben aus `PROP_KINDS`).

## Erledigt

- [x] **Sprites je `variant`** (Grafik/Welt): Ladeliste jetzt `assets/content-art/handoff-catalog.json` statt fester Pfade; `content-art.js` löst die Aliase auf, `live-art.js` wertet `variant` (über `livePersonId`) vor `skin` aus und `clan-art.js` prüft den gelieferten Bogen vor dem alten Rig. Ohne Bild bleibt der bisherige Fallback (2026-09-17).
- [x] Anbindung der Grafiklieferung 2026-09-17: 88 Assets, 6 Clanbuch-Reiter, HUD-Symbole, Figuren mit Fußpunkten und Sockets, 18 Proc-Talente, Schwung, Proc-Rahmen/-Marker, Übungspuppe, PWA-Cache (`content-art.js`, `live-art.js`, `ui-art.js`, `talent-art.js`, `renderer.js`, `scripts/pwa-cache.mjs`).
- [x] Akt 1: Kapitel-Dialoge, HUD/Questlog aus content, Reiter „Bude“ mit Erinnerungen, Mentoren, Sammelpunkte, Erinnerungs-Einblendung (2026-09-17, scripts/akt1-check.mjs).
