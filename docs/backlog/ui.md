# Backlog · ui

## Basis-Runde 1–4 · 2026-09-17

- [x] HUD-Ressourcenzeile und Desktop-Interaktionshinweis ohne Überschneidung.
- [x] Clanbuch-Höhe und -Breite in kleinen Hoch-/Querformaten korrigiert; Schließen bleibt erreichbar.
- [x] Touch-Kompatibilitätsklick nach Fensteröffnung abgefangen; Belegung, Langdruck und Abbruch im Browser geprüft.
- [x] Laufende Zauber können über den sichtbaren Touch-Abbruchknopf beendet werden.

Belege und offene Gerätegrenzen: `docs/BASIS-STABILISIERUNG-2026-09-17.md`.

Inbox der UI-Rolle (docs/ROLLEN.md). Andere Rollen tragen hier Bedarf ein: Ziel, Grund, Abnahme, betroffene IDs/Dateien. Die Rolle hakt ab, löscht nicht.

## Offen

### Mobile-Iterationen 2026-09-18 (Mobile-Agent, docs/MOBILE-ITERATIONEN-2026-09-18.md)

- [ ] **popup-windows.js: Touch-Clamp quer mit Safe Areas** (M-07/M-11): `clamp()` zentriert Fenster auf `innerWidth/2` und rechnet `innerWidth-400`; mit seitlichen Safe Areas (iPhone quer 47 px) liegt das Fenster über dem Joystick. Heute überbrückt mobile.css das mit einer festen Bahn (left/right + margin auto, `!important`). Sauber wäre: Breite und Mitte aus `env(safe-area-inset-left/right)` bzw. den HUD-Rechtecken (`#touchStick`, `#touchActions`) ableiten. Abnahme: `npm run mobile:check` bleibt grün, nachdem die Bahn-Regel in mobile.css entfernt ist.
- [ ] **Kontrast Stempel-Koralle und Zweittinte** (M-12, WCAG 1.4.3, auch Desktop): `--stamp:#AD5260` erreicht als Textfarbe auf Zeltstoff 2,4:1 (Kniff-/Gegenstands-/Talentnamen in Tooltips und Erklärungen) und auf Pappkarten 2,7:1 (`.clan-card .eyebrow`, `.clan-stamp`, `.quest-entry .eyebrow`); `--ink-2:#4E4A41` auf Pappkarten mit Textur 4,1:1; `.talent-points.has-free` Tinte auf Grün 1,4:1; `.memory-picture-button>span` Tinte auf Grün 1,5:1. mobile.css überschreibt das nur im Touch-Modus (`#F29AA6` / `#6E2531` / `#3A3732` / Creme). Messung: `npm run mobile:check` (Kontrastspalte) – am Desktop identische Regeln in bierdeckel.css nachziehen.
- [ ] **Nach dem Aufstehen kommt eine Erinnerung als zweites Fenster** (M-15, app.js `respawn` → `memoryEvent`): Tod → „Am Treffpunkt zusammenkratzen lassen“ → Erinnerungsfenster. Auf dem Handy sind das zwei Tipps bis zurück ins Spiel. Vorschlag: Erinnerung erst beim nächsten ruhigen Moment (kein Kampf, kein Fenster) oder als Hinweis in der Ortszeile. `npm run mobile:check` zeigt es als Hinweis im Schritt `tod-zurueck`.
- [ ] **popup-windows.js: `clamp()` beim Drehen** (M-17): quer → hochkant rechnet `left=(innerWidth-offsetWidth)/2` mit der noch querformatigen Breite; das Todesfenster (420 px) stand bei x = −13. mobile.css zentriert Touch-Fenster jetzt per `left/right + margin auto` (`!important`); sauber wäre ein Reflow nach `resize`/`orientationchange` vor dem Rechnen.
- [ ] **tutorial-ui.css: Hofprobe-Kasten im Touch-Modus** (M-07, E-24): `.touch-mode #tutorialGuide` sitzt fest bei 84/86 px ohne `env(safe-area-inset-top)` (mobile.css überschreibt), die Knöpfe „?“ und „⌃“ erscheinen weiß/ungestylt statt im Bierdeckel-Stil (siehe `visual-review/mobile-check/quer-linkshand.png`), und der Hilfe-Knopf stand 1 px neben dem Einklapp-Knopf (mobile.css setzt 56 px).

- [ ] **Verpflegung auf der Aktionsleiste anbinden** (Engine/Loot, Welle D, gefunden beim Rebase 2026-09-17): `game.actionBar` liefert die Einträge `item:wasser` und `item:brezel` auf den Plätzen 9 und 0, und `rpg.inventory` hält beide Gegenstände (Brezel ×3, Wasser ×2) — aber weder `app.js` noch `rpg-ui.js` werten das Präfix `item:` aus, darum stehen beide Plätze als `.skill.empty-slot` da. Betrifft schon `origin/main`, ist also kein Rückschritt aus dem Stil-C-Umbau. Die Gestaltung liegt bereit: `.skill` trägt Stil C, `data-use` und `data-consumable-timer` sind in `rpg-ui.js` vorgesehen. Abnahme: beide Plätze zeigen Symbol und Anzahl, Klick und Taste benutzen den Gegenstand, Abklingzeit läuft sichtbar.
- [ ] **Aus der Mobile-Prüfung 2026-09-17** (docs/MOBILE-UEBERSETZUNGSSCHICHT-2026-09-17.md §4): Papierpuppen-Bogen auch quer auf dem Handy (Buchbreite 444 px < 640-px-Schwelle); Touch-Editor „Touchbuttons belegen“ mit Drag statt Tipp-Tipp; Gespräch/Beute/Tod in scripts/mobile-check.mjs ergänzen, sobald eine Fixture mit Gegner in Laufnähe liegt.

- [ ] **Aus Playtest Kenner 2026-09-17** (`docs/PLAYTEST-2026-09-17-mmo-kenner.md`): (1) Clan-Schule-Hinweis „Neu gelernt" bleibt die ganze Sitzung stehen, auch über offenen Fenstern → nach erstem Kampf oder Timeout ausblenden; (2) Talentbaum wird nach jedem Punkt komplett neu gebaut, Tooltip verschwindet → nur Knoten-Klassen aktualisieren; (4) Kniff-Taste im Talent-Tooltip, sobald Klassendesign das Feld liefert; (6) Ausweichen auf [LEER] mit Symbol „↗" ohne Erklärung; (8) Tooltip je Wert in der Werte-Liste (Handschrift, Drehzahl, Glückstreffer).

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

- [x] **Talentbuch/Kniffe als Nachschlagewerk**: jedes kampfrelevante Element mit Icon (Kniffe, Talente, Passive, Stärkungen, Procs) im Reiter „Kniffe“ auffindbar; Tooltip zeigt `info.effect` + `numbers` (aus `game.describe`), **Shift gedrückt** blendet `why`, `links` (klickbar → springt zum Element) und Glossar-`long` zu allen `terms` ein; laufende Stärkungen im HUD mit demselben Tooltip.
- [x] **Leiste**: Verpflegung per Drag/Tipp in Leistenplätze ziehen, Stapelzahl am Platz, Abklingzeit sichtbar; Touch ebenso.
- [x] **Beute-Log**: jedes `loot`-Ereignis als Logzeile mit Icon und Seltenheitsfarbe; Hover über die Zeile zeigt den Gegenstands-Tooltip (Shift-Details ebenfalls); Log scrollbar, letzte 50.
- [x] **Service Worker**: neue Version atomar aktivieren (skipWaiting + „Neu laden“-Hinweis), damit nach einem Deploy nie alte und neue Module gemischt laden (Befund 2026-09-17: gecachte enemies.js ohne ELITE_TABLE).

Umgesetzt 2026-09-17: `describe-ui.js` (ein Tooltip-Baustein für alle acht Arten, Shift blendet `why`, `links` und die
Glossar-`long`-Texte ein), Nachschlagewerk im Reiter „Kniffe“ mit Sprungzielen `#kniff-<kind>-<id>`, Verpflegung auf der
Aktionsleiste (Drag, Platz-Kontext, Touch-Platzwahl), Beute-Log aus dem Ereignis `loot` und ein Auto-Loot-Schalter im
Einstellungsreiter. Prüfung: `node scripts/welle-d-check.mjs` (startet Server und Browser selbst, Bilder in `welle-d-review/`).


### Abnahme Welle D

- [ ] Touch: Autoangriff abschaltbar (Story-Fund: kein Esc auf dem Handy) – langer Druck auf Platz 1 oder Schalter am Chip `#autoState`.
- [ ] Clan-Schule-Starthinweis „[1] schaltet Autoangriff um“ aus app.js:128 nach `content/panel-ui.js` holen (Story hat den Wortlaut geliefert).
- [ ] Tooltip-Verweise: Scrollen im Fenster schließt den Tooltip; Lücke Kachel→Tooltip 12 px – Tooltip als Klick-Pin (Klick auf Kachel hält den Tooltip offen) oder Verweise als Buch-Sprung ohne Tooltip.
- [ ] Beschriftungen aus `DESCRIBE_UI` nach `content/panel-ui.js` (Story) – Bedarf dort eintragen.

## Erledigt

- [x] **Nutzerbefunde 2026-09-18**: Sirenen-Spiel mobil sichtbar (Takt-Leiste und Score hatten im Bierdeckel keine Farben); Tooltip-Wechsel auf Touch (wiederverwendetes Fenster wird wieder nach vorn geholt); Langdruck öffnet jeden Tooltip als Fenster mit Umschalter „Details anzeigen/ausblenden"; Story-NPC (Ida) mit gerahmtem, pulsierendem Abzeichen, Nebenauftraggeber ohne Zeichen nach Abschluss; Belohnungswahl mobil als Zeilen mit lesbaren Farben; Fenster-Inhalte auf Touch nie breiter als das Fenster; Figur wechseln (Karte trug data-member-pick und -wear, Pick gewann); frühe Eskalation E-29. Belege visual-review/fix-2026-09-18/.

- [x] **Polish Kampf & Talentbäume, 10 Iterationen** (Nutzerauftrag 2026-09-18): Nachschlagewerk → Hilfe, Clan-Schule-Timeout, Kampflog mittig, Proc-Leuchten + Abklingzeit-Uhr + Autoangriff-Ring, Schadenszahlen nach Art, Zauberbalken/Elite-Stempel, Randale erst bei Kosten, Talentbaum gespreizt + Tooltip bleibt + Build-Chips + Reset-Rückfrage, Leiste lesbar, Angriffsbanner unter dem Ziel, Talent-Tooltip-Kopf. Doku docs/POLISH-KAMPF-TALENTE-2026-09-18.md. Erledigt damit: Kenner-Hänger 1, 2, 3 (teilweise), Auswertung Nr. 3 und 11 (Tooltip-Kopf), Elite-Titel im Zielfenster.

- [x] **Runde Linien (E-28) und Figur kompakt** (Nutzerauftrag 2026-09-18): Rundungs-Regelgruppe am Ende von bierdeckel.css (Fenster 12 px, Knöpfe/Plätze 8 px, Chips/Balken Pille, Talente rund/10 px, Touch rund), Werte als Chip-Zeilen unter der Ausrüstung statt Seitenspalte, Bande nur am Treffpunkt sonst ein Satz, Buchbreite 700 px. Belege visual-review/rund-2026-09-18/.
- [x] **Mobile-Agent + Mobile-Gaming-Guidelines** (Nutzerauftrag 2026-09-18): .claude/agents/mobile-agent.md, Regelwerk M-01…M-21 in docs/MOBILE-GUIDELINES-2026-09-18.md (Apple HIG, Google Play Level Up, WCAG 2.2, Material, Thumb-Zone, WANDR).

- [x] **Menü-Reduktion E-27** (Nutzerauftrag 2026-09-17): 50 → 33 Navigationsziele; vier Reiter plus Hilfe, Abschnitte mit Sprungleiste, HUD-Leiste 4 Knöpfe, Weltknöpfe/Journal-Symbol raus, Unterreiter reduziert. Inventur und Belege: docs/MENUE-REDUKTION-2026-09-17.md, visual-review/menu-2026-09-17/.

- [x] **Mobile Übersetzungsschicht + Mobile-Prüfung** (Nutzerauftrag 2026-09-17): `mobile-translate.js` übersetzt Fenster, Toasts und Clan-Schule in Touch-Begriffe (Tasten → Knöpfe, Tab → Ziel-Knopf, Rechtsklick → Antippen, <kbd> → Touch-Chip); `npm run mobile:check` prüft 3 Geräte × 16 Schritte headless (Layout, Überdeckung, Tipp-Ziele, Desktop-Begriffe). Doku `docs/MOBILE-UEBERSETZUNGSSCHICHT-2026-09-17.md`.

- [x] **MMO-Vorbilder, zehn Iterationen** (Nutzerauftrag 2026-09-17, Branch `ui-mmo-2026-09-17`): Buchbreite wächst mit dem Bildschirm, Charakterbogen als Papierpuppe, Talentbaum mit Formen/Schwellenbändern, Kniff-Tooltip in zwei Kopfzeilen, Kniffe mit Namen, Zielfenster neben dem Spielerfenster, Buff-Restzeit, Punkte-Abzeichen. Recherche + Belege: `docs/MMO-VORBILDER-2026-09-17.md`, `visual-review/iter-2026-09-17/`.

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
