# Backlog · ui

Inbox der UI-Rolle (docs/ROLLEN.md). Andere Rollen tragen hier Bedarf ein: Ziel, Grund, Abnahme, betroffene IDs/Dateien. Die Rolle hakt ab, löscht nicht.

## Offen

- [ ] **Verpflegung auf der Aktionsleiste anbinden** (Engine/Loot, Welle D, gefunden beim Rebase 2026-09-17): `game.actionBar` liefert die Einträge `item:wasser` und `item:brezel` auf den Plätzen 9 und 0, und `rpg.inventory` hält beide Gegenstände (Brezel ×3, Wasser ×2) — aber weder `app.js` noch `rpg-ui.js` werten das Präfix `item:` aus, darum stehen beide Plätze als `.skill.empty-slot` da. Betrifft schon `origin/main`, ist also kein Rückschritt aus dem Stil-C-Umbau. Die Gestaltung liegt bereit: `.skill` trägt Stil C, `data-use` und `data-consumable-timer` sind in `rpg-ui.js` vorgesehen. Abnahme: beide Plätze zeigen Symbol und Anzahl, Klick und Taste benutzen den Gegenstand, Abklingzeit läuft sichtbar.

- [ ] **Grafikreview / klare Item-Icons** (Grafik, 2026-09-17): Die 18 Einzeldateien unter `assets/content-art/items/<ID>.png` sind durch lesbarere 24-px-Motive ersetzt, IDs bleiben gleich; Herkunft im `handoff-catalog.json`. Bei der Anbindung ganzzahlige Icongrößen verwenden, auch die CSS-Größe von Canvas prüfen. Vorher/Nachher und Downloads: `art-workshop.html`; Abnahme und Grenzen: `docs/GRAFIK-REVIEW-5-RUNDEN-2026-09-17.md`. Der neue modulare Bewohnerbaukasten ist ein Prototyp und ersetzt noch keine Helden-/Waffengrafik. Nur eingebundene Runtime-Dateien in den PWA-Cache aufnehmen, keine Generierungsquellen.
- [x] **Figur aussuchen nach UI-Abnahme neu bauen** (Produktion, 2026-09-17; erledigt 2026-09-17 auf Branch ui-stil-c mit Stil C, Abnahme in docs/UI-ABNAHME-2026-09-17-stil-c.md): Karten ungleich hoch, Texte abgeschnitten, Seitenscroll, drei Knopfbreiten, Auswahl als ausgegrauter Knopf. `.clan-card` in fünf CSS-Dateien definiert → eine Stildatei nach dem gewählten Stil aus `docs/ui-stile-2026-09-17/index.html`; Prüfliste `docs/UI-ABNAHME.md` (A1, A4, B1, C1, C2, C3 heute nicht bestanden). Abnahme: Screenshots 2024×900 und 390×844, Tabelle in `visual-review/<Datum>/ABNAHME.md`.
- [x] **Alle Fenster auf die Stil-Definition umstellen** (erledigt 2026-09-17 in bierdeckel.css, Themen-Ueberschreibungen abgebaut) — sobald der Stil in `ENTSCHEIDUNGEN.md` gewählt ist: Reihenfolge Clanbuch → HUD/Aktionsleiste → Gespräch/Beute → Einblendungen. Themen-Überschreibungen (`hearth.css`, `maifeld.css`, `comic-theme.css`) dabei abbauen.


- [x] **Sprechblasen** für Gegner-/Boss-Sprüche und Dorfbewohner, sobald die Engine das Event `bark` liefert. (Die Blase selbst ist seit der Anbindung 2026-09-17 das gelieferte 9-Slice `ui-speech-bubble`; es fehlt nur der Auslöser.)
- [ ] **Elite-Titel** (`title`) im Zielfenster anzeigen (heute „ELITE ·“ nur bei Bossen). Das Elite-Abzeichen in der Welt hängt seit 2026-09-17 an `ui-elite-badge`.
- [ ] **Porträt für Pit** (Grafik liefert über ART-BRIEF; UI bindet an).
- [x] **Kapitel-Kulissen zeichnen** (Welt liefert Objekte, 0.20): `world.camps[].props` = Liste `{id,kind,x,y,w,h,blocking}`, Mittelpunkt in Weltkoordinaten, Grundfläche in Welteinheiten. Arten, Zeichenhöhe und Fallback-Farbe stehen in `world-prop-kinds.js` (`PROP_KINDS`), Bildhinweise in docs/GRAFIK-BEDARF.md („Kapitel-Kulissen“). Kapitel 2 Sperrmüllplatz (`schrotthaufen`, `haenger`, `kuehlschrank`), Kapitel 3 Festplatz (`kegelbahn`, `bierbank`, `kegelkugel`), Kapitel 4 Bus im Feld (`bus`, `bierkasten`, `bierbong`); `camp.place` nennt den Ort. Zeichnen wie die Lager-Ausstattung in `world-details.js` (`drawOccupiedCamp`), Bildschwelle auf `y + h/2`, Höhe aus `PROP_KINDS[kind].height`. `blocking:true` (nur Bus und Schrotthaufen) ist bereits ein echter Kollisionskörper — nicht zusätzlich blockieren, aber die Figur davor/dahinter richtig verdecken. Abnahme: Screenshot je Kapitel-Lager.
- [x] **Die Bude zeichnen** (Welt liefert das Gelände, 0.20): `world.base` = `{id:'bude',x,y,w,h,minX..maxY,approach,stageProps}`, ~156×110 Einheiten nahe St. Gangolf (Prüfseed 56753: 192 Einheiten von der Kirche). `stageProps[<Gebäude-ID aus content/buildings.js>] = {owner,slot,stages:[{stage,kind,name,x,y,w,h,height}]}`; `stage:0` sind die Trümmer, danach je Ausbaustufe dieselbe Art in wachsender Größe. Gezeichnet wird immer genau die erreichte Stufe (`game.buildings[id]`, 0 = Trümmer). Das Gelände selbst blockiert nicht; Anlaufpunkt `base.approach` ist begehbar und in der Weltprüfung enthalten (Route „Bude“). Abnahme: Bude mit allen sechs Bauplätzen auf Stufe 0 und auf Endstufe.
- [ ] **Kalles Kiosk zeichnen** (Welt liefert den Ort, 0.21): `world.places.kiosk` = `{id:'kiosk',name,title,text,x,y,w,h,minX..maxY,junction,facing,approach,props}` — Vorplatz 86×64 Einheiten an einer Dorfkreuzung im Dorfkern. `props` ist die Liste `{id,kind,name,x,y,w,h,height,blocking}` mit `kiosk` (Bude mit Tresenfenster, `blocking:true` — schon echter Kollisionskörper, nicht zusätzlich blockieren), `stehtisch` und `wett-tafel`; `facing` zeigt zur Kreuzung, davor liegt `approach`. Arten, Zeichenhöhe und Fallback-Farbe in `world-prop-kinds.js` (`PROP_KINDS`), Bildhinweise in docs/GRAFIK-BEDARF.md. Zeichnen wie die Kapitel-Kulissen, Bildschwelle `y + h/2`. Der Ortsname (`title`) darf als Schild/Beschriftung auftauchen. Abnahme: Screenshot vom Vorplatz mit Bude, Stehtisch und Tafel (Prüfseed 56753: 8557/9350).


### Aus dem Playtest Akt 1 (docs/PLAYTEST-2026-09-17-AKT1.md)

- [x] **P4 EIN Fenster** (E-13): Gespräch, Clanbuch, Beute nie gleichzeitig; Ida-Dialog nicht nach „Weiterüben“ selbst wieder öffnen; unsichtbare Fenster dürfen keine Klicks fangen.
- [x] **P7 Klamottenwahl** als sichtbare Auswahl mit drei Karten und Bestätigen; keine Rotation ohne Klick; Unterreiter unter „Figur“ (Ausrüstung/Werte/Verwalten/Talente/Bande) auflösen oder als Abschnitte untereinander zeigen (keine Unterseiten).
- [x] **P1/P2 Kampfleiste**: Autoangriff-Zustand sichtbar (an/aus) und großer Hinweis „Du wirst angegriffen“ auf Event `attacked`; Trefferzahlen am Gegner sichtbar.
- [x] **P5 Wegmarke je Hofproben-Schritt** (Pfeil + Meter wie im Zielfenster) für Hofmarkierung und Clankiste.
- [x] **P9 Erinnerungs-Warteschlange**: Erinnerung nie über Tod-Fenster oder Gespräch legen; erst wenn kein anderes Fenster offen ist.
- [x] **P10 Bude-Reiter**: verdeckte Fetzen als „Noch nicht erinnert“ statt „…“; Überschrift „Erinnerungen“.
- [x] **P11** Clan-Schule-Popup bleibt, bis geklickt; Linksklick ins Spielfeld öffnet kein Menü.
- [x] **P12** Ida-Dialog zeigt die Kapitel-Summary nicht zusätzlich zu den Zeilen (Doppelung).
- [x] **P15** Eigene Taste für Talente (N ist laut app.js schon belegt – prüfen und in Hilfe nennen).
- [x] **Neu aus Engine/Welt Runde A**: Sprechblasen auf Event `bark`, Ausgrauen „Ausbauen“ außerhalb `atHub()`, Güte epic in Belohnung/Rucksack/Tooltip, Kulissen `world.camps[].props` und Bude `world.base.stageProps` zeichnen (Fallback-Farben aus `PROP_KINDS`).

## Runde B · 2026-09-17 (Branch ui-akt1-b, scripts/akt1b-check.mjs)

Umgesetzt: EIN Fenster für Buch, Gespräch, Beute, Erinnerung und Tod (`popup-windows.js`); Klamottenwahl mit drei
Karten und Bestätigen; „Figur“ ohne Unterseiten (Abschnitte untereinander, E-13); Autoangriff-Zustand und großer
Angriffshinweis an der Kampfleiste; Wegmarke mit Metern in jedem Hofproben-Schritt; Erinnerungs-Warteschlange wartet
auf ein leeres Fenster; verdeckte Fetzen als Text; Clan-Schule bleibt bis zum Klick; Ida ohne doppelte Summary;
Sprechblasen auf Ereignis `bark`; „Ausbauen“ außerhalb `game.atHub()` ausgegraut mit Hinweis; Güte `epic` in
Rucksack, Belohnungsauswahl und Tooltip; Kulissen und Bude gezeichnet (`world-prop-ui.js`, Fallback aus `PROP_KINDS`).

Offen / abhängig von anderen Rollen:

- [ ] **Elite-Titel** (`title`) im Zielfenster auch ohne Boss anzeigen (unverändert offen).
- [ ] **Porträt für Pit** (Grafik liefert über ART-BRIEF).
- [ ] Bilder für die Kulissen: `content-art.js`-IDs `prop-<kind>` (z. B. `prop-schrotthaufen`, `prop-bude-tresen`).
      Ohne Bild zeichnet der Ersatzkörper in der Fallback-Farbe aus `PROP_KINDS`.
- [ ] Texte aus `content/`: `PANEL_UI.memoryHidden` und `COMBAT_TEXT.underAttack` (in docs/backlog/story.md eingetragen).

### Aus Engine Runde B (2026-09-17, docs/UEBERGABE-UI-2026-09-17.md §6)

- [x] **Esc muss `game.stopAuto()` rufen** (P2): Taste 1 schaltet den Autoangriff nicht mehr aus. Ohne diesen Aufruf gibt es keinen Weg mehr, ihn abzuwählen. Reihenfolge im Esc-Zweig von `app.js`: Zauber, Zielhilfe, dann `game.stopAuto()`, dann Fenster.
- [x] **Ereignis `attacked {enemyId,damage,first}`** (P1): großer Hinweis „Du wirst angegriffen“; die Figur findet sich über `enemyId` in `game.enemies`.
- [x] **Aktionstaste über `game.interaction()`** (P3/P5): Rangfolge aus der Engine übernehmen, statt in `worldInteraction()` nur nach Entfernung zu sortieren; Beschriftungen weiter aus content.
- [x] **Wegmarke anklickbar → `game.navigateDestination()`** (P6): ein Laufbefehl zum Auftragsziel statt zwölf Klicks an den Bildschirmrand.
- [ ] **Zählstand der Proc-Regeln** (offen, nicht Teil der UI-Runde B2): `procCount(game,id)` für Auslöser mit `every` (z. B. „2/3 Kellen“) auf dem Proc-Chip anzeigen.


### Welle D (Nutzerauftrag 2026-09-17)

- [ ] **Talentbuch/Kniffe als Nachschlagewerk**: jedes kampfrelevante Element mit Icon (Kniffe, Talente, Passive, Stärkungen, Procs) im Reiter „Kniffe“ auffindbar; Tooltip zeigt `info.effect` + `numbers` (aus `game.describe`), **Shift gedrückt** blendet `why`, `links` (klickbar → springt zum Element) und Glossar-`long` zu allen `terms` ein; laufende Stärkungen im HUD mit demselben Tooltip.
- [ ] **Leiste**: Verpflegung per Drag/Tipp in Leistenplätze ziehen, Stapelzahl am Platz, Abklingzeit sichtbar; Touch ebenso.
- [ ] **Beute-Log**: jedes `loot`-Ereignis als Logzeile mit Icon und Seltenheitsfarbe; Hover über die Zeile zeigt den Gegenstands-Tooltip (Shift-Details ebenfalls); Log scrollbar, letzte 50.
- [ ] **Service Worker**: neue Version atomar aktivieren (skipWaiting + „Neu laden“-Hinweis), damit nach einem Deploy nie alte und neue Module gemischt laden (Befund 2026-09-17: gecachte enemies.js ohne ELITE_TABLE).

## Erledigt

- [x] **Sprites je `variant`** (Grafik/Welt): Ladeliste jetzt `assets/content-art/handoff-catalog.json` statt fester Pfade; `content-art.js` löst die Aliase auf, `live-art.js` wertet `variant` (über `livePersonId`) vor `skin` aus und `clan-art.js` prüft den gelieferten Bogen vor dem alten Rig. Ohne Bild bleibt der bisherige Fallback (2026-09-17).
- [x] Anbindung der Grafiklieferung 2026-09-17: 88 Assets, 6 Clanbuch-Reiter, HUD-Symbole, Figuren mit Fußpunkten und Sockets, 18 Proc-Talente, Schwung, Proc-Rahmen/-Marker, Übungspuppe, PWA-Cache (`content-art.js`, `live-art.js`, `ui-art.js`, `talent-art.js`, `renderer.js`, `scripts/pwa-cache.mjs`).
- [x] Akt 1: Kapitel-Dialoge, HUD/Questlog aus content, Reiter „Bude“ mit Erinnerungen, Mentoren, Sammelpunkte, Erinnerungs-Einblendung (2026-09-17, scripts/akt1-check.mjs).

## 2026-09-17 · Erinnerungsbilder auf Nutzerauftrag integriert

- [x] Zehn große Bilder, davon „Wurst Case“ als Comic, bei Freischaltung und im Clanbuch → Bude → Erinnerungen.
- [x] Nicht pausierende Vergrößerung mit verschiebbarer Pixelansicht auf Touchgeräten. Gesperrte Erinnerungen bleiben verdeckt.
- [x] Minimale Anbindung direkt umgesetzt (Nutzerauftrag): `chapter-ui.js`, `app.js`, `popup-windows.js`, `akt1.css`, neuer Katalog `memory-art.js`; PWA-Cache um die zehn Runtime-PNGs ergänzt.
- Belege und Fortsetzungsregeln: `docs/ERINNERUNGSBILDER-2026-09-17.md`, `assets/content-art/memories/README.md`. Nach Übernahme einmal `git pull`.
- Zusätzlich im Offline-Browsertest gefunden und behoben: `scripts/pwa-cache.mjs` nahm `content/checks/` nicht mit. Die rekursive Modulliste ermöglicht wieder den Offline-Neustart; zehn Bilddateien im Cache und Stempel-Bild nach Offline-Reload geprüft.

### UI Runde B2 (2026-09-17, Branch ui-akt1-b)

Gebunden: Esc ruft ohne offenes Fenster `game.stopAuto()` (Chip `#autoState` folgt, Taste 1 / Aktion `auto` schaltet nur ein);
`worldInteraction()` in `app.js` übernimmt die ganze Rangfolge aus `game.interaction()` (F und die Touch-Aktion, Beschriftungen
weiter aus dem Spielzustand); der HUD-Questkasten samt Wegmarkenzeile ist ein Laufbefehl über `game.navigateDestination()`,
auf Mobil der neue Knopf `#touchWaypoint` in der oberen Zeile. Prüfpunkte in `scripts/akt1b-check.mjs` (5b/5c/5d + mobil).
Hilfetext dafür fehlt in `PLAY_HELP` — Bedarf steht in docs/backlog/story.md.

- [ ] **Starthinweis der Clan-Schule auf die neue Autoangriff-Regel** (Story, 2026-09-17): In `app.js:128` steht der Text fest im Code: „Tab wählt ein Ziel, [1] schaltet Autoangriff um, [2] nutzt den ersten Kniff …“. Seit `app.js:195` schaltet **1 nur ein, Esc aus**. Neuer Wortlaut: „Tab wählt ein Ziel, [1] schaltet den Autoangriff ein ([Esc] wieder aus), [2] nutzt den ersten Kniff. Mit [LEER] weichst du aus. Sprich zuerst mit Ida [F]. Weitere Kniffe kommen nach und nach.“ Besser wäre eine Zeile in `content/panel-ui.js` statt Text im Code — dann pflegt Story sie mit. Hilfe (`PLAY_HELP`) und Hofprobe (`content/tutorial.js`) sind bereits umgestellt.
- [ ] **Touch: Autoangriff wieder ausschalten** (Story, 2026-09-17): Auf Touch gibt es kein Esc; `game.action('auto')` ruft nur `startAuto`. Damit lässt sich der Autoangriff auf dem Handy nie abschalten. Gebraucht wird ein Aus-Weg (langes Halten des Autoangriff-Knopfes oder ein zweiter Tipp, der `game.stopAuto()` ruft). Die Hilfe sagt auf Touch heute nur „schaltet nur ein“.
