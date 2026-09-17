# Backlog · klassen

Inbox der Rolle Klassendesign (docs/ROLLEN.md).

## Offen

- [ ] **Dieter killt rund doppelt so schnell wie Bärbel und Kevin** (Balancing, Bericht 2026-09-17). Auf der *eigenen* Stufe fällt Dieter unter jeden Korridor: Pfanddachs 2,1 s, Gans/Rabe 2,4 s, Keiler 3,0 s, Ruhewart 3,1 s, Schnorrer 3,3 s, Praktikant/Kegelbruder/Junggeselle 3,7 s (Korridor 4–12 s); beide Eliten 4,1 s (Korridor 8–24 s); Horst 8,8 s, Gisela 9,5 s, Automat 7,8 s (Boss-Korridor 10–25 s). Bärbel und Kevin liegen bei denselben Gegnern im Korridor.
  Das ist kein Gegnerproblem: der Kegelbruder bräuchte +103 % Leben (640 → 1300), damit Dieter 4,1 s erreicht – dann steht Bärbel bei 12,5 s über dem Korridor. Gegner-Leben kann keinen Klassenabstand schließen; die Korrektur gehört in Dieters Kit (`content/skills.js`, `KITS.dieter`) oder in seine Talentreihen. Balancing zieht sie über `TUNING.skills` nach, sobald Klassendesign die Richtung nennt.
  Abnahme: `npm run content:balance` – Dieter ohne ⚡ auf eigener Stufe bei Feldgegnern; `tests/content-klassen.test.mjs` und das Pacing (5–14 s auf Stufe 1) bleiben grün.
- [ ] **Kevin stirbt an Feldgegnern seiner eigenen Stufe** (Balancing, Bericht 2026-09-17): je 1 von 3 Läufen gegen Ruhewart (Stufe 3) und Ordnungsamt-Praktikant (Stufe 3), gegen den Festzelt-Schnorrer auf Stufe 2 **und** 3 – und wo er überlebt, dauert es 18–28 s bei −37 % Leben. Das verletzt den Korridor härter als jede Trivialität: ein Feldgegner der eigenen Stufe darf keinen Lauf gewinnen. Betroffen sind ausschließlich die menschlichen Gegner mit unterbrechbaren Zaubern (`cultist`, `scrounger`, `inspector`) – der Bericht spielt ohne Ausweichen, aber **mit** Unterbrechen, Kevins Kit kommt auf Stufe 2–3 offenbar nicht gegen den Schadensausstoß an. Bitte Kevins Stufe-2/3-Kurve ansehen (`KITS.kevin`, Heilung/Deckung vor Stufe 5).
  Abnahme: `npm run content:balance` – keine ⚠-Zelle mehr bei einem Feldgegner auf Kevins eigener Stufe.
- [ ] Restliche 72 Talente auf Auslöser-Regeln prüfen: alles, was nur einen Wert addiert oder Sekunden verkürzt, bekommt einen Proc oder eine sichtbare Regel (docs/GAMEPLAY-KONZEPT-FLUSS.md §6).
- [ ] Hofprobe-Texte gegen die Lernreihenfolge prüfen (Buff/Wurf vor Stufe 5 erwähnt?); Textänderungen bei Story anfordern.
- [ ] Ideen aus content/IDEEN-LANDJUNGS.md (Kevin Ladedruck, Dieter „Halt mal mein Bier“, Anni Vorher/Nachher) erst nach Icon-Lieferung und Lead-Freigabe.
- [ ] Reihe-vier-Ausbauten (`zoneUpgrade`, `slamUpgrade`, `encoreUpgrade`, `infusionUpgrade`, `detonateUpgrade`, `magnetUpgrade`, `snareUpgrade`) sind heute Verbesserungen der eigenen Talentfähigkeit („hält länger“, „größerer Radius“). Sie nennen einen Auslöser (das Aufstellen), bleiben aber zahlenlastig — nach den Engine-Auslösern (`inZone`, `cdReduce`) erneut ansehen.
- [ ] Prüfer-Befund 2026-09-17 „Solider Bierbauch / Dienstjacke sind reine Wert-Talente“: Diese Namen gibt es in `content/talents.js` nicht (grep über das ganze Repo leer). Vermutlich Live-Drift der veröffentlichten Seite gegenüber `main` — Herkunft mit Lead/UI klären, bevor etwas geändert wird.


### Aus dem Playtest Akt 1 (docs/PLAYTEST-2026-09-17-AKT1.md)

- [ ] **P13** Klamotten unterscheiden sich auf Stufe 1 nur im Namen der Ressource – sichtbarer Unterschied (Leben, Startkniff-Verhalten) im Rahmen der Passiven.
- [ ] **Balance Runde A**: Dieter fällt auf eigener Stufe unter jeden Korridor (16×), Kevin stirbt auf Stufe 2–3 gegen Ruhewart/Schnorrer/Praktikant (4×) – Klassenabstand ist keine Gegner-Leben-Frage.

## Erledigt

- [x] Restliche Talente auf Auslöser-Regeln gebracht (2026-09-17): acht neue Proc-Regeln in `content/procs.js`, sechs Sekunden-Talente auf sichtbares „sofort bereit“, sieben Wert-Texte auf „Wenn X, dann Y“ umformuliert; Engine-Bedarf in `docs/backlog/engine.md` („Aus Klassendesign“). Neue Invarianten in `content/checks/klassen.js` + `tests/content-klassen.test.mjs`: kein reines Wert-Talent, keine tote Proc-Regel, jeder Kniff-Text nennt den Einsatzmoment.
