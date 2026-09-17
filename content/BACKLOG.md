# Inhalts-Backlog

Ideen, die Engine-Arbeit brauchen oder noch nicht geprüft sind. Der Inhalts-Agent trägt hier ein, was er nicht selbst umsetzen darf; die Engine-Seite hakt ab.

## Erledigt · 0.14

- [x] Vollständige Ausrüstung: 16 Slots, Waffen-Schadensspannen, Nebenhand-/Zweihandwechsel, Schild- und Fernkampfvoraussetzungen, Speichermigration und Vergleichs-UI. Gemeinsame Daten in `content/equipment.js` und `content/items.js`, Dokumentation in `EQUIPMENT.md`.

## Braucht Engine

- [ ] **Feldgegner skalieren mit der Spielerstufe** – Balance-Bericht 0.20: ab Stufe 10 fallen Dachs, Gans, Rabe, Fuchs in unter 2,5 s. Vorschlag: encounters.buildCell nutzt enemyScale(playerLevel-2, def.level) für hp/damage im Umland; Dorfkern bleibt fest.

- [x] **Schwung (Momentum), Proc-Rahmen, Gegnergruppen, Kettenzug** – umgesetzt 2026-09-17 (engine.js, procs.js, encounters.js), Tests in tests/flow.test.mjs.
- [x] **Trainingsarena** – arena.js, Admin-Reiter „Trainingsarena“ (2026-09-17).

- [ ] **Akt 1 „Filmriss“: Kapitel 2–4 aktivieren** (docs/AKT-1-FILMRISS.md) – `STORY_CHAPTERS[1..3]` sind fertig (Ziele, Boss, Dialoge mit ongoing/reward/claimed, Belohnung, Hinweis, Fetzen). Nötig: Kapitelzustand in `engine.js` (`quest.chapter`, Fortschritt je Ziel-Art `kill family` / `gather item` / `boss`), Lager in `world-layout.js`: Sperrmüllplatz am Ortsrand (Sigi + Paletten), Festplatz/Kegelbahn (Kegler + Kabel), Bus im Feld am Ortsausgang (Junggesellen + Shirts, Timo auf dem Dach). Archetypen `kegler`/`jga` nur in diesen Lagern, nicht in den freien Spawn-Tabellen. Kapitel 5/6 (Gisela, Automat) sind `reserve:true` und bleiben aus.
- [ ] **Erinnerungsfetzen** – `MEMORY_FRAGMENTS` + `triggeredMemories(event, seen)`. Engine meldet Ereignisse `{kind, …}` laut `MEMORY_TRIGGERS` (tutorialDone, consumable{item}, chapterClaimed{chapter}, bossDefeat{boss}, firstDeath, buildingStage{building,stage}, level{level}); Speicher `memories.seen[]`; Event `memory` an die UI mit dem Fetzen.
- [ ] **Basisbau** – `BUILDINGS`, `nextStage`, `buildingEffects`. Speicher `buildings{id:stufe}`; Bauen zieht Material aus dem Rucksack ab; Effekte (`BUILDING_EFFECTS`) in `combatStats`/Verpflegung/Beute/EP einrechnen (restRegen, foodHeal, consumableCd, coinDrop, gearChance, xpBonus, damageTaken, buffDuration, dashCd, energyOnKill, respawnHp). Sichtbar erst ab abgeholtem Kapitel 2. Optional: Bude-Grafik je Stufe (Welt).
- [ ] **Mentoren als NPCs an der Bude** – Dieter, Anni, Kevin stehen als Figuren am Treffpunkt (`NPCS.*.member`), sprechen `hubLine(id, chapter, index, actDone)`. Der Held trägt „ihre Klamotten“ (= Klassenwahl); Klassenwechsel am Treffpunkt bleibt. Entscheidung Nutzer: Held als Fremder (gebaut) vs. Held = Clanmitglied ohne Gedächtnis (docs/AKT-1-FILMRISS.md §10).
- [ ] **Start ohne Hose** – kosmetisch: bis zum Abschluss von Kapitel 1 hat der Held keinen Beinschutz-Slot bestückt (Horsts Beweismittelkiste liefert die Hose). Reine Item-/Layer-Frage; Startausrüstung sonst unverändert.
- [ ] **Gegner-Sprüche im HUD** – `ENEMY_BARKS` und `BOSSES.*.phases` laufen heute ins Kampflog. Sprechblase über dem Gegner wäre besser sichtbar.
- [ ] **Dorfbewohner reden** – `VILLAGERS.says` als Sprechblasentext in `village-life.js`/Renderer.
- [ ] **Sprites je `variant`** – Ladeliste `assets/content-art/<kind>/<id>.png`; Renderer soll `variant` vor `skin` prüfen.
- [ ] **Händler** – Pfandmarken haben bisher keinen Zweck. Kioskkönig Kalle als Händler für Verpflegung; Pfandautomat nach Kapitel 3.
- [ ] **Handwerk** – Material (Borste, Feder, Kronkorken, Dosenblech, Hopfen) in Verpflegung oder Talismane wandeln. Kevin als Werkbank am Clan-Treff.
- [ ] **Aggressiver Keiler im Wohngebiet** – Sichtprüfung 2026-09-13 (docs/VISUELLE-BEWERTUNG-2026-09-13.md, vr-08): Pfandkeiler 82 m vom Treffpunkt zwischen Wohnhäusern. `buildCell` in encounters.js: Prüfen, ob `field` bei Grasflächen innerhalb der Wohnpolygone falsch wahr wird.
- [ ] **Neue aktive Fähigkeiten** – erst nach Icon-Lieferung (skill-art.js SKILL_ICON_ORDER).

## Braucht UI

Siehe docs/UEBERGABE-UI-2026-09-12.md (Questdialog aus q.lines, Elite im Zielfenster, Boss-Sprechblasen, Ida-Dialoge aus MAIN_DIALOGUE, Proc-Zeile im Tooltip, Dorfbewohner-Sprüche, Grafik-Anbindung).

- [ ] Engine-Event `bark` (Gegner-/Boss-Spruch) statt Kampflog-Zeile, damit die UI Sprechblasen ohne Textparsen zeichnen kann.

## Inhaltlich offen

- [x] **Lernreihenfolge Stufe 1–4** und **18 Talente als Proc-Regeln** – umgesetzt 2026-09-17 (content/skills.js, content/talents.js, content/procs.js).
- [x] **Zaubern in Bewegung** für Markierung – umgesetzt 2026-09-17.
- [ ] **Restliche 72 Talente** auf Auslöser-Regeln prüfen: alles, was nur einen Wert addiert oder Sekunden verkürzt, bekommt einen Proc oder eine sichtbare Regel.
- [ ] **Hofprobe** an die neue Reihenfolge anpassen, falls Schritt-Texte Buff oder Wurf vor Stufe 5 nennen.

- [ ] **Landjungs-Themen ausbauen** – Zukunftsideen in [IDEEN-LANDJUNGS.md](IDEEN-LANDJUNGS.md): Schrauberhof (Racing/Tuning), Kalles Kiosk (Sport- und Dorfwetten), LAN-Scheune (Gaming/Nerds), Prompt & Partner (Vibe-Coding-/KI-Slop-Parodie). Mit NPCs, Dialogen, Questketten, Items, Skillvarianten und Platzierungsregeln; noch nicht implementiert. Als Einstieg LAN-Scheune mit vorhandenen Figuren und Kabelspiel prüfen.
- [ ] Elite-Titel (`title`) im Zielfenster anzeigen (heute „ELITE ·“ nur bei Bossen).
- [ ] Mehr Quest-Vorlagen für Akt 1, Kapitel 3/4 (Kegelbahn aufräumen, Bus entladen), sobald die Kapitel laufen. Fünf Akt-1-Vorlagen sind drin (Dieter, Kevin, Anni, Pit, Ida).
- [ ] Akt 1 perfektionieren, bevor Neues kommt: Spieltest der Dialoglänge (Ida-Belohnungen haben drei Absätze), Fetzen-Timing, Basisbau-Kosten (docs/AKT-1-FILMRISS.md §10).
- [ ] Zweite Elite für die Außenbezirke (menschlich, z. B. „Oberpraktikant Olaf“).
- [ ] Set-Boni für Dorflegenden (z. B. drei Ruhe-22:01-Teile).
## Erledigt · Hofprobe und Talentbäume 0.16

- [x] Geführter Start aus `TUTORIAL`, Engine-Schritte und Speicherung, kompakte Desktop-/Touch-Anleitung.
- [x] Gerichtete Talentbäume aus `TALENT_GRAPH`, echte Voraussetzungen, einzelne Punkte zurücknehmen, 90 eigene Motive.
- [x] Gemeinsame Personenidentität für Welt, Gespräche und Heldenporträt aus `PERSON_APPEARANCE`.
## Erledigt · Aperol-Anni 0.17

- [x] Bass-Bärbels sichtbare Identität, Fähigkeiten und 30 Talente durch Aperol-Anni / Landhaus-Lazarett / Putzpyramide / Filter-Furie ersetzt; Spielstand-IDs erhalten.
- [x] Stand-/Laufgrafik, Personenbilder, 47 Skill-/Spec-/Talentmotive und Hygiene-Hochdruckspray integriert. Neue Motive im Offline-Cache; alte separate Bärbel-Atlanten werden nicht mehr vorab geladen.
