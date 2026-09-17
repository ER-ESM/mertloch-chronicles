# Inhalts-Backlog

Ideen, die Engine-Arbeit brauchen oder noch nicht geprüft sind. Der Inhalts-Agent trägt hier ein, was er nicht selbst umsetzen darf; die Engine-Seite hakt ab.

## Erledigt · 0.14

- [x] Vollständige Ausrüstung: 16 Slots, Waffen-Schadensspannen, Nebenhand-/Zweihandwechsel, Schild- und Fernkampfvoraussetzungen, Speichermigration und Vergleichs-UI. Gemeinsame Daten in `content/equipment.js` und `content/items.js`, Dokumentation in `EQUIPMENT.md`.

## Braucht Engine

- [ ] **Feldgegner skalieren mit der Spielerstufe** – Balance-Bericht 0.20: ab Stufe 10 fallen Dachs, Gans, Rabe, Fuchs in unter 2,5 s. Vorschlag: encounters.buildCell nutzt enemyScale(playerLevel-2, def.level) für hp/damage im Umland; Dorfkern bleibt fest.

- [x] **Schwung (Momentum), Proc-Rahmen, Gegnergruppen, Kettenzug** – umgesetzt 2026-09-17 (engine.js, procs.js, encounters.js), Tests in tests/flow.test.mjs.
- [x] **Trainingsarena** – arena.js, Admin-Reiter „Trainingsarena“ (2026-09-17).

- [ ] **Story-Kapitel 2 und 3 aktivieren** – `STORY_CHAPTERS[1..2]` sind fertig (Ziele, Boss, Dialoge, Belohnung). Nötig: Kapitelzustand in `engine.js` (`quest.chapter`), Lager für Gisela und den Pfandautomaten in `world-layout.js`, Anzeige in `app.js`/`questlog-ui.js`.
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
- [ ] Mehr Quest-Vorlagen für Kapitel 2/3 (Praktikanten vertreiben, Dosenblech sammeln), sobald die Kapitel laufen.
- [ ] Zweite Elite für die Außenbezirke (menschlich, z. B. „Oberpraktikant Olaf“).
- [ ] Set-Boni für Dorflegenden (z. B. drei Ruhe-22:01-Teile).
## Erledigt · Hofprobe und Talentbäume 0.16

- [x] Geführter Start aus `TUTORIAL`, Engine-Schritte und Speicherung, kompakte Desktop-/Touch-Anleitung.
- [x] Gerichtete Talentbäume aus `TALENT_GRAPH`, echte Voraussetzungen, einzelne Punkte zurücknehmen, 90 eigene Motive.
- [x] Gemeinsame Personenidentität für Welt, Gespräche und Heldenporträt aus `PERSON_APPEARANCE`.
## Erledigt · Aperol-Anni 0.17

- [x] Bass-Bärbels sichtbare Identität, Fähigkeiten und 30 Talente durch Aperol-Anni / Landhaus-Lazarett / Putzpyramide / Filter-Furie ersetzt; Spielstand-IDs erhalten.
- [x] Stand-/Laufgrafik, Personenbilder, 47 Skill-/Spec-/Talentmotive und Hygiene-Hochdruckspray integriert. Neue Motive im Offline-Cache; alte separate Bärbel-Atlanten werden nicht mehr vorab geladen.
