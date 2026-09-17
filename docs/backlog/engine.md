# Backlog · engine

Inbox der Engine-Rolle (docs/ROLLEN.md). Andere Rollen tragen hier Bedarf ein: Ziel, Grund, Abnahme, betroffene IDs/Dateien. Die Rolle hakt ab, löscht nicht.

## Aus Klassendesign

Talente sollen Regeln mit Auslöser sein (docs/GAMEPLAY-KONZEPT-FLUSS.md §6). Diese Auslöser/Wirkungen fehlen der Laufzeit (`procs.js`); die betroffenen Talente stehen bis dahin auf der besten heute möglichen Regel.

- [ ] **Auslöser `skillHit:<id>` mit Zähler („jede dritte Kelle“)** — Konzept §6 nennt Deckelwirtschaft als „Jede dritte Kelle gibt Deckung“. Heute kennt `fireProcs` nur `autoHit` mit Zufall, deshalb steht `dieter-wall-0` auf `autoHit`, Chance 30 %. Abnahme: `{trigger:'skillHit',skill:'strike',every:3}` zündet deterministisch, HUD zählt mit. Betrifft: `proc:deckelwirtschaft`.
- [ ] **Auslöser `markedHit` (Treffer an markiertem Ziel)** — `dieter-brew-0` (Rücklaufleitung) und `baerbel-feedback-0` (Provision vom Schmerz) bleiben Prozent-Effekte (`markedLeech`), weil kein Auslöser dafür existiert. Abnahme: Auslöser feuert in `Game.damage` bei `e.mark>0`, Fenster wie üblich.
- [ ] **Proc-Wirkung `heal` (Leben direkt)** — heute kennt `fireProcs` nur free/reset/empower/energy/points/shield/haste. Ohne `heal` lassen sich Rücklauf- und Provisionsregeln nicht als leuchtende Regel zeigen. Abnahme: `effect:{heal:40}` heilt über `healPlayer`, Schema-Liste in `content/schema.js` ergänzen.
- [ ] **Proc-Wirkung `cdReduce` (Sekunden statt Abklingzeit 0)** — sechs Sekunden-Talente („−3 s“) wurden auf vollen `reset` gehoben, weil es nichts dazwischen gibt: `dieter-brawl-3`, `dieter-brew-7`, `baerbel-feedback-3`, `kevin-fuse-7`, `kevin-hunt-3`, `kevin-hunt-7`. Abnahme: `effect:{cdReduce:{skill:'throw',seconds:3}}`, damit feinere Abstufungen ohne Balance-Sprung möglich sind.
- [ ] **Auslöser `beat` (Treffer im Takt)** — `baerbel-stage-0` (Perfekter Upload) hängt an `context.beat` in `class-mechanics.js` und kann deshalb keine sichtbare Proc-Regel mit Leuchten sein. Abnahme: `fireProcs(g,'beat',cs)` beim Takttreffer.
- [ ] **Auslöser `inZone` (Kniff in eigener Zone)** — `dieter-brew-9` (Letzter Ausschank) prüft die Fasszone direkt im Code (`zoneEnergy`). Abnahme: Auslöser feuert, wenn ein Kniff innerhalb einer eigenen Zone eingesetzt wird.

## Offen

- [ ] **Feldgegner skalieren mit der Spielerstufe** (Balancing, Bericht 0.20): ab Stufe 10 fallen Dachs, Gans, Rabe, Fuchs in unter 2,5 s. Vorschlag: `encounters.buildCell` nutzt `enemyScale(playerLevel-2, def.level)` für hp/damage im Umland; Dorfkern bleibt fest.
- [ ] **Start ohne Hose** (Story): bis Kapitel 1 abgeholt ist, bleibt der Beinschutz-Slot leer; Horsts Beweismittelkiste liefert die Hose. Reine Item-/Layer-Frage.
- [ ] **Bau-Ortsregel** (Gameplay): `game.build()` prüft heute keinen Ort; die UI erlaubt Bauen nur am Treffpunkt. Regel in die Engine ziehen.
- [ ] **Gegner-Sprüche als Event `bark`** (Story/UI): `ENEMY_BARKS` und Boss-Phasen laufen ins Kampflog; UI will Sprechblasen ohne Textparsen.
- [ ] **Dorfbewohner reden** (Story): `VILLAGERS.says` als Sprechblasentext.
- [ ] **Elite-Auswahl über `pickElite()`** (Gameplay): `encounters.buildCell` Zeile 32 setzt jenseits von `eliteDistance` fest `kind='alphaBoar'`; die zweite Elite `oberpraktikant` (Oberpraktikant Olaf) kann deshalb nie erscheinen. Ersatz ist fertig und geprüft: `pickElite(townDistance,random)` aus `content/enemies.js` liefert `null` diesseits von `SPAWN_TABLES.eliteDistance` und sonst gewichtet `{kind,def}` aus `ELITE_TABLE`. Änderung: `const pick=pickElite(town,random); if(aggressive&&pick&&random()<S.eliteChance){kind=pick.kind;def=pick.def;}`. Abnahme: über viele Zellen tauchen beide Eliten auf, keine diesseits von 1300. IDs/Dateien: `encounters.js`, `content/enemies.js` (`ELITE_TABLE`, `pickElite`), `tests/content-gameplay.test.mjs`.
- [ ] **Aggressiver Keiler im Wohngebiet (vr-08)** (Gameplay/Welt): `encounters.buildCell` Zeile 30 bestimmt `field` so: `const area=w.areas.find(a=>['farmland','meadow','grass','forest'].includes(a.tags.landuse)&&inside(...))||w.areaAt(p.x,p.y), field=area?.tags.landuse!=='residential';`. Zwei Löcher: (a) eine Wiesen-/Rasen-/Farmland-Fläche, die in einem Wohnpolygon liegt oder es überlappt, gewinnt das `find` – `field` wird `true` **im** Wohngebiet; (b) liegt der Punkt in gar keinem Polygon (Hof, Garten, Lücke zwischen den Flächen), ist `area` `undefined`, `undefined!=='residential'` ist `true` – ebenfalls Feld. Damit greift `aggressive` mitten im Ort. Vorschlag: den vorhandenen Veto-Test aus `world-layout.js` nutzen statt der Reihenfolge der Flächenliste: `import {residential} from './world-layout.js'` und `const field=!residential(w,p);` (prüft `some(...)` über **alle** Wohnpolygone). Optional zusätzlich `w.buildings`-Nähe < 60 als Feld ausschließen. Abnahme: Rundgang durch das Wohngebiet zeigt nur neutrale Arten; Ökologietest zählt null aggressive Reviere in Wohnpolygonen. Dateien: `encounters.js`, `world-layout.js` (nur lesen).
- [ ] **Händler / Handwerk** (Loot/Gameplay): Pfandmarken haben keinen Zweck; Kalle als Händler, Kevin als Werkbank. **Konzept liegt vor: `docs/GAMEPLAY-HAENDLER-HANDWERK.md`.** Gebraucht wird: Laden an einem NPC öffnen, `buy`/`sell`/`craft` gegen `rpg.coins` und Inventar, Werkbank-Stufe aus dem Basisbau (`buildings.werkstatt`) lesen. Daten (`content/shop.js`) legt Gameplay erst nach Freigabe an – nicht vorgreifen.
- [ ] **Belohnungsgüte `epic`** (Loot): `rolledDefinition` kennt nur uncommon/rare; Kapitel 4 würfelt deshalb `rare`.

## Erledigt

- [x] Akt 1: Kapitelumschalter 1–4, Lager, Erinnerungsfetzen, Basisbau, Mentoren (2026-09-17, tests/story.test.mjs).
