# Backlog · klassen

Inbox der Rolle Klassendesign (docs/ROLLEN.md).

## Offen

- [ ] Hofprobe-Texte gegen die Lernreihenfolge prüfen (Buff/Wurf vor Stufe 5 erwähnt?); Textänderungen bei Story anfordern.
- [ ] Ideen aus content/IDEEN-LANDJUNGS.md (Kevin Ladedruck, Dieter „Halt mal mein Bier“, Anni Vorher/Nachher) erst nach Icon-Lieferung und Lead-Freigabe.
- [ ] Reihe-vier-Ausbauten (`zoneUpgrade`, `slamUpgrade`, `encoreUpgrade`, `infusionUpgrade`, `detonateUpgrade`, `magnetUpgrade`, `snareUpgrade`) sind heute Verbesserungen der eigenen Talentfähigkeit („hält länger“, „größerer Radius“). Sie nennen einen Auslöser (das Aufstellen), bleiben aber zahlenlastig — nach den Engine-Auslösern (`inZone`, `cdReduce`) erneut ansehen.
- [ ] Prüfer-Befund 2026-09-17 „Solider Bierbauch / Dienstjacke sind reine Wert-Talente“: Diese Namen gibt es in `content/talents.js` nicht (grep über das ganze Repo leer). Vermutlich Live-Drift der veröffentlichten Seite gegenüber `main` — Herkunft mit Lead/UI klären, bevor etwas geändert wird.

## Erledigt

- [x] Restliche Talente auf Auslöser-Regeln gebracht (2026-09-17): acht neue Proc-Regeln in `content/procs.js`, sechs Sekunden-Talente auf sichtbares „sofort bereit“, sieben Wert-Texte auf „Wenn X, dann Y“ umformuliert; Engine-Bedarf in `docs/backlog/engine.md` („Aus Klassendesign“). Neue Invarianten in `content/checks/klassen.js` + `tests/content-klassen.test.mjs`: kein reines Wert-Talent, keine tote Proc-Regel, jeder Kniff-Text nennt den Einsatzmoment.
