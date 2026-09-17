# Inhalts-Backlog (Altbestand)

> **Seit 2026-09-17 modular:** Neue Einträge gehören in die Inbox der zuständigen Rolle unter `docs/backlog/<rolle>.md` (Rollen und Dateibesitz: `docs/ROLLEN.md`). Diese Datei bleibt als Verlauf; offene Punkte wurden in die Rollen-Backlogs übertragen.

Ideen, die Engine-Arbeit brauchen oder noch nicht geprüft sind. Der Inhalts-Agent trägt hier ein, was er nicht selbst umsetzen darf; die Engine-Seite hakt ab.

## Erledigt · 0.14

- [x] Vollständige Ausrüstung: 16 Slots, Waffen-Schadensspannen, Nebenhand-/Zweihandwechsel, Schild- und Fernkampfvoraussetzungen, Speichermigration und Vergleichs-UI. Gemeinsame Daten in `content/equipment.js` und `content/items.js`, Dokumentation in `EQUIPMENT.md`.

## Braucht Engine

- [ ] **Feldgegner skalieren mit der Spielerstufe** – Balance-Bericht 0.20: ab Stufe 10 fallen Dachs, Gans, Rabe, Fuchs in unter 2,5 s. Vorschlag: encounters.buildCell nutzt enemyScale(playerLevel-2, def.level) für hp/damage im Umland; Dorfkern bleibt fest.

- [x] **Schwung (Momentum), Proc-Rahmen, Gegnergruppen, Kettenzug** – umgesetzt 2026-09-17 (engine.js, procs.js, encounters.js), Tests in tests/flow.test.mjs.
- [x] **Trainingsarena** – arena.js, Admin-Reiter „Trainingsarena“ (2026-09-17).

- [x] **Akt 1 „Filmriss“: Kapitel 2–4 aktivieren** (docs/AKT-1-FILMRISS.md) – `STORY_CHAPTERS[1..3]` sind fertig (Ziele, Boss, Dialoge mit ongoing/reward/claimed, Belohnung, Hinweis, Fetzen). Nötig: Kapitelzustand in `engine.js` (`quest.chapter`, Fortschritt je Ziel-Art `kill family` / `gather item` / `boss`), Lager in `world-layout.js`: Sperrmüllplatz am Ortsrand (Sigi + Paletten), Festplatz/Kegelbahn (Kegler + Kabel), Bus im Feld am Ortsausgang (Junggesellen + Shirts, Timo auf dem Dach). Archetypen `kegler`/`jga` nur in diesen Lagern, nicht in den freien Spawn-Tabellen. Kapitel 5/6 (Gisela, Automat) sind `reserve:true` und bleiben aus.
- [x] **Erinnerungsfetzen** – `MEMORY_FRAGMENTS` + `triggeredMemories(event, seen)`. Engine meldet Ereignisse `{kind, …}` laut `MEMORY_TRIGGERS` (tutorialDone, consumable{item}, chapterClaimed{chapter}, bossDefeat{boss}, firstDeath, buildingStage{building,stage}, level{level}); Speicher `memories.seen[]`; Event `memory` an die UI mit dem Fetzen.
- [x] **Basisbau** – `BUILDINGS`, `nextStage`, `buildingEffects`. Speicher `buildings{id:stufe}`; Bauen zieht Material aus dem Rucksack ab; Effekte (`BUILDING_EFFECTS`) in `combatStats`/Verpflegung/Beute/EP einrechnen (restRegen, foodHeal, consumableCd, coinDrop, gearChance, xpBonus, damageTaken, buffDuration, dashCd, energyOnKill, respawnHp). Sichtbar erst ab abgeholtem Kapitel 2. Optional: Bude-Grafik je Stufe (Welt).
- [x] **Mentoren als NPCs an der Bude** – Dieter, Anni, Kevin stehen als Figuren am Treffpunkt (`NPCS.*.member`), sprechen `hubLine(id, chapter, index, actDone)`. Der Held trägt „ihre Klamotten“ (= Klassenwahl); Klassenwechsel am Treffpunkt bleibt. Entscheidung Nutzer: Held als Fremder (gebaut) vs. Held = Clanmitglied ohne Gedächtnis (docs/AKT-1-FILMRISS.md §10).

> Die vier Punkte darüber sind am 2026-09-17 umgesetzt (engine.js, world-layout.js, world.js, clan.js, rpg.js, itemization.js; Tests in `tests/story.test.mjs`, Übergabe in docs/UEBERGABE-UI-2026-09-17.md §4).

- [ ] **Start ohne Hose** – kosmetisch: bis zum Abschluss von Kapitel 1 hat der Held keinen Beinschutz-Slot bestückt (Horsts Beweismittelkiste liefert die Hose). Reine Item-/Layer-Frage; Startausrüstung sonst unverändert.
- [ ] **Gegner-Sprüche im HUD** – `ENEMY_BARKS` und `BOSSES.*.phases` laufen heute ins Kampflog. Sprechblase über dem Gegner wäre besser sichtbar.
- [ ] **Dorfbewohner reden** – `VILLAGERS.says` als Sprechblasentext in `village-life.js`/Renderer.
- [ ] **Sprites je `variant`** – Ladeliste `assets/content-art/<kind>/<id>.png`; Renderer soll `variant` vor `skin` prüfen.
- [ ] **Händler** – Pfandmarken haben bisher keinen Zweck. Kioskkönig Kalle als Händler für Verpflegung; Pfandautomat nach Kapitel 3.
- [ ] **Handwerk** – Material (Borste, Feder, Kronkorken, Dosenblech, Hopfen) in Verpflegung oder Talismane wandeln. Kevin als Werkbank am Clan-Treff.
- [ ] **Aggressiver Keiler im Wohngebiet** – Sichtprüfung 2026-09-13 (docs/VISUELLE-BEWERTUNG-2026-09-13.md, vr-08): Pfandkeiler 82 m vom Treffpunkt zwischen Wohnhäusern. `buildCell` in encounters.js: Prüfen, ob `field` bei Grasflächen innerhalb der Wohnpolygone falsch wahr wird.
- [ ] **Neue aktive Fähigkeiten** – erst nach Icon-Lieferung (skill-art.js SKILL_ICON_ORDER).

## Braucht UI
- **UI-Beschriftungen des Tooltip-Bausteins** (`describe-ui.js` → `DESCRIBE_UI`): die Spaltennamen der Laufzeitzeilen
  (Schaden, Glückstreffer, Heilung, Stapel, Restzeit, Bereit in, Zählstand, Stufe, Erwarteter Schaden, Grundwert) und die
  Abschnittsnamen des Nachschlagewerks (Eigenart, Regeln, Laufende Stärkungen) stehen heute in der UI. Sie gehören nach
  `content/panel-ui.js`, damit es nur eine Wortwahl gibt. Angemeldet 2026-09-17 (Welle D).


Siehe docs/UEBERGABE-UI-2026-09-12.md (Questdialog aus q.lines, Elite im Zielfenster, Boss-Sprechblasen, Ida-Dialoge aus MAIN_DIALOGUE, Proc-Zeile im Tooltip, Dorfbewohner-Sprüche, Grafik-Anbindung).

- [ ] Engine-Event `bark` (Gegner-/Boss-Spruch) statt Kampflog-Zeile, damit die UI Sprechblasen ohne Textparsen zeichnen kann.

### Aus dem UI-Umbau Akt 1 (2026-09-17)

- [x] Hardcodes aus docs/UEBERGABE-UI-2026-09-17.md §1 ersetzt (app.js, clan-ui.js, questlog-ui.js, index.html); Kapitel-Dialoge, Belohnung, HUD, Questlog, Bude, Erinnerungen und Mentoren liegen jetzt in `chapter-ui.js`.
- [ ] **`PANEL_UI` braucht zwei Reiterbeschriftungen**: `tabBase` („Bude“) und `tabMemories` („Erinnerungen“). Die UI setzt sie heute als Fensterbeschriftung in `popup-windows.js` (wie „Beute“, „Gespräch“), damit im UI-Code kein Inhaltstext steht. Dazu die Schaltflächenwörter „Ausbauen“, „Weiter“ (Erinnerungs-Einblendung), „Trümmer“, „Endausbau erreicht“, „Was wir wissen“ und die Kapitelstatus „offen / läuft / erledigt“.
- [ ] **`PLAY_HELP` nennt „Ein Buch, sechs Reiter“** – es sind jetzt sieben (Figur, Rucksack, Kniffe, Aufträge, **Bude**, Karte, Hilfe). Auch `desktopKeys` kennt die neue Taste **B** noch nicht. Beides in `content/panel-ui.js` nachziehen.
- [ ] **Kapitel 1 wird nie angeboten**: `tutorialConfirm` (Schritt 7) ruft `acceptQuest()` selbst auf, deshalb sieht ein Erstspieler `MAIN_DIALOGUE.ida.intro` (Angebot mit `accept`/`decline`) nie – direkt nach der Hofprobe steht die `ongoing`-Zeile. Entweder die Hofprobe endet ohne Annahme (Engine) oder Kapitel 1 bekommt keinen Angebotszustand (Inhalt). Die UI zeigt das Angebot heute nur, wenn `quest.accepted` falsch ist.
- [ ] **Erinnerungsfetzen für den Stufenaufstieg** fehlt (`MEMORY_TRIGGERS.level` wird gemeldet, `MEMORY_FRAGMENTS` hat keinen Eintrag dazu).
- [ ] **Bau an der Bude ist eine UI-Regel**: `game.build()` prüft keinen Ort, die UI sperrt „Ausbauen“ außerhalb von 150 px um den Treffpunkt (gleiche Regel wie der Klamottenwechsel). Wenn das verbindlich sein soll, gehört es in die Engine.
- [ ] **Sammelpunkte und Mentoren brauchen Bilder**: der Renderer zeichnet Sammelpunkte heute als Materialkiste mit Item-Icon und Mentoren mit der Heldengrafik ihrer `classId`. Eigene Sprites → `content/ART-BRIEF.md`.

## Inhaltlich offen

- [x] **Lernreihenfolge Stufe 1–4** und **18 Talente als Proc-Regeln** – umgesetzt 2026-09-17 (content/skills.js, content/talents.js, content/procs.js).
- [x] **Zaubern in Bewegung** für Markierung – umgesetzt 2026-09-17.
- [ ] **Restliche 72 Talente** auf Auslöser-Regeln prüfen: alles, was nur einen Wert addiert oder Sekunden verkürzt, bekommt einen Proc oder eine sichtbare Regel.
- [ ] **Hofprobe** an die neue Reihenfolge anpassen, falls Schritt-Texte Buff oder Wurf vor Stufe 5 nennen.

- [ ] **Landjungs-Themen ausbauen** – Zukunftsideen in [IDEEN-LANDJUNGS.md](IDEEN-LANDJUNGS.md): Schrauberhof (Racing/Tuning), Kalles Kiosk (Sport- und Dorfwetten), LAN-Scheune (Gaming/Nerds), Prompt & Partner (Vibe-Coding-/KI-Slop-Parodie). Mit NPCs, Dialogen, Questketten, Items, Skillvarianten und Platzierungsregeln; noch nicht implementiert. Als Einstieg LAN-Scheune mit vorhandenen Figuren und Kabelspiel prüfen.
- [ ] Elite-Titel (`title`) im Zielfenster anzeigen (heute „ELITE ·“ nur bei Bossen).
- [ ] Mehr Quest-Vorlagen für Akt 1, Kapitel 3/4 (Kegelbahn aufräumen, Bus entladen), sobald die Kapitel laufen. Fünf Akt-1-Vorlagen sind drin (Dieter, Kevin, Anni, Pit, Ida).
- [ ] Akt 1 perfektionieren, bevor Neues kommt: Spieltest der Dialoglänge (Ida-Belohnungen haben drei Absätze), Fetzen-Timing, Basisbau-Kosten (docs/AKT-1-FILMRISS.md §10).
- [ ] **`strom-kevin` wird nie platziert** (gefunden beim Kapitelumbau 2026-09-17): `pickTemplates` erreicht je Welt nur zwei Scout-Vorlagen ab `offset` bzw. `offset+1`; `strom-kevin` steht an fünfter Stelle des Scout-Pools und kommt dadurch bei keinem Seed vor. Entweder Reihenfolge im Pool ändern oder die Rotation vom Inhalt her anders schneiden. Test: `tests/story.test.mjs` („die Akt-1-Nebenquests …“).
- [ ] **Grund-Erwachensleben für `respawnHp`** – `BUILDING_EFFECTS.respawnHp` („Leben nach dem Erwachen, Anteil vom Maximum“) ist wirkungslos, solange der Held bei St. Gangolf ohnehin mit vollem Leben erwacht. Die Engine rechnet den Anteil deshalb vorläufig als Deckung (Schild) beim Erwachen. Entweder eine Grundquote in `BALANCE.player` ergänzen (dann erwacht man unter 100 %) oder den Vorteilstext auf „Deckung beim Erwachen“ umstellen.
- [ ] **Belohnungsgüte `gear:'epic'`** – Kapitel 4 verspricht ein episches Teil; gewürfelte Ausrüstung kennt nur `uncommon`/`rare` (BALANCE.items.quality hat `epic`, `rolledDefinition` nicht). Die Engine würfelt deshalb `rare`. Entweder `epic` in der Gegenstandsstufe zulassen (Engine) oder den Wert im Kapitel auf `rare` setzen.
- [ ] Zweite Elite für die Außenbezirke (menschlich, z. B. „Oberpraktikant Olaf“).
- [ ] Set-Boni für Dorflegenden (z. B. drei Ruhe-22:01-Teile).
## Erledigt · Hofprobe und Talentbäume 0.16

- [x] Geführter Start aus `TUTORIAL`, Engine-Schritte und Speicherung, kompakte Desktop-/Touch-Anleitung.
- [x] Gerichtete Talentbäume aus `TALENT_GRAPH`, echte Voraussetzungen, einzelne Punkte zurücknehmen, 90 eigene Motive.
- [x] Gemeinsame Personenidentität für Welt, Gespräche und Heldenporträt aus `PERSON_APPEARANCE`.
## Erledigt · Aperol-Anni 0.17

- [x] Bass-Bärbels sichtbare Identität, Fähigkeiten und 30 Talente durch Aperol-Anni / Landhaus-Lazarett / Putzpyramide / Filter-Furie ersetzt; Spielstand-IDs erhalten.
- [x] Stand-/Laufgrafik, Personenbilder, 47 Skill-/Spec-/Talentmotive und Hygiene-Hochdruckspray integriert. Neue Motive im Offline-Cache; alte separate Bärbel-Atlanten werden nicht mehr vorab geladen.
