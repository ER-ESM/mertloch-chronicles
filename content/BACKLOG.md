# Inhalts-Backlog

Ideen, die Engine-Arbeit brauchen oder noch nicht geprüft sind. Der Inhalts-Agent trägt hier ein, was er nicht selbst umsetzen darf; die Engine-Seite hakt ab.

## Braucht Engine

- [ ] **Story-Kapitel 2 und 3 aktivieren** – `STORY_CHAPTERS[1..2]` sind fertig (Ziele, Boss, Dialoge, Belohnung). Nötig: Kapitelzustand in `engine.js` (`quest.chapter`), Lager für Gisela und den Pfandautomaten in `world-layout.js`, Anzeige in `app.js`/`questlog-ui.js`.
- [ ] **Gegner-Sprüche im HUD** – `ENEMY_BARKS` und `BOSSES.*.phases` laufen heute ins Kampflog. Sprechblase über dem Gegner wäre besser sichtbar.
- [ ] **Dorfbewohner reden** – `VILLAGERS.says` als Sprechblasentext in `village-life.js`/Renderer.
- [ ] **Sprites je `variant`** – Ladeliste `assets/content-art/<kind>/<id>.png`; Renderer soll `variant` vor `skin` prüfen.
- [ ] **Händler** – Pfandmarken haben bisher keinen Zweck. Kioskkönig Kalle als Händler für Verpflegung; Pfandautomat nach Kapitel 3.
- [ ] **Handwerk** – Material (Borste, Feder, Kronkorken, Dosenblech, Hopfen) in Verpflegung oder Talismane wandeln. Kevin als Werkbank am Clan-Treff.
- [ ] **Neue aktive Fähigkeiten** – erst nach Icon-Lieferung (skill-art.js SKILL_ICON_ORDER).

## Braucht UI

Siehe docs/UEBERGABE-UI-2026-09-12.md (Questdialog aus q.lines, Elite im Zielfenster, Boss-Sprechblasen, Ida-Dialoge aus MAIN_DIALOGUE, Proc-Zeile im Tooltip, Dorfbewohner-Sprüche, Grafik-Anbindung).

- [ ] Engine-Event `bark` (Gegner-/Boss-Spruch) statt Kampflog-Zeile, damit die UI Sprechblasen ohne Textparsen zeichnen kann.

## Inhaltlich offen

- [ ] Elite-Titel (`title`) im Zielfenster anzeigen (heute „ELITE ·“ nur bei Bossen).
- [ ] Mehr Quest-Vorlagen für Kapitel 2/3 (Praktikanten vertreiben, Dosenblech sammeln), sobald die Kapitel laufen.
- [ ] Zweite Elite für die Außenbezirke (menschlich, z. B. „Oberpraktikant Olaf“).
- [ ] Set-Boni für Dorflegenden (z. B. drei Ruhe-22:01-Teile).
