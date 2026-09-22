# Übergabe Berufe an UI/Server – 22.09.2026

Die erste Stufe ist vollständig angebunden; keine offene UI-Implementierung aus diesem Paket.

- Daten: `PROFESSIONS`, `PROFESSION_STATIONS`, `PROFESSION_SOURCES`, `PROFESSION_RECIPES`, `PROFESSION_ITEMS`, `PROFESSION_RULES`, `PROFESSION_UI` aus `content/index.js`.
- Welt: `professionWorld(world) → {stations,nodes}`, stabile IDs je Welt. Raum-ID mit Standardwerten ergibt jetzt dieselben Straßenregeln wie implizite Standards (`world-rules.js`).
- Game: `professions = {version,revision,online,learned,solo}` wird je Held gespeichert. `professionCast = {action,site,name,total,remaining,...}` dient dem bestehenden Fortschrittsbalken. `professionCommit` sperrt Simulation, Eingaben und Save-Uploads bis zur bestätigten Speicherung.
- Controller: `mountProfessions(host).start(action)`, `.poll()`, `.retry()`. Aktionen `learn`, `forget`, `craft` mit `target`, `gather` mit `node`. `cancelProfession(game)`/`tickProfession(game,dt)` behandeln Abbruch und Ablauf.
- Erfolg: erst `host.write(save)` erfolgreich, dann Inventar/Fertigkeit aktualisieren und die vorhandenen Events `rpgChanged` und `save` auslösen. Cloud-Stale liefert den kanonischen Spielstand zum Neuladen. Keine Beute vor bestätigter Speicherung.
- Online: authentifiziertes POST `/api/professions`, `op=state|begin|finish|cancel`, `hero`, `room`, für Arbeit `id`, `save`, `action` beziehungsweise `token`. Antworten enthalten `nodes`, `token`, `save` oder `error`; Konflikte außerdem `stale/server`. Normale Cloud-Saves prüfen Berufsrevisionen.
- Rendering: `drawProfession` im vorhandenen Y-Sortierlauf, bestehende NPC-/Prop-Sprites. Karte über vorhandenen Läden-Filter, Lern-/Rezept-/Fundstellenfenster über Shift+B und Esc. Gegenstände verwenden denselben Icon-Auflöser wie der Rucksack.

Betrieb und Grenzen: [Berufsbericht](BERUFE-2026-09-22.md). Neuer Node-Dienst erforderlich (API 7), gemeinsames Backup einschließlich `professions.json`. Mobile-spezifische Berufsbedienung bleibt zurückgestellt.
