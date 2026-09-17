# Backlog · engine

Inbox der Engine-Rolle (docs/ROLLEN.md). Andere Rollen tragen hier Bedarf ein: Ziel, Grund, Abnahme, betroffene IDs/Dateien. Die Rolle hakt ab, löscht nicht.

## Aus Gegenstände & Loot

- [ ] **Proc-Wirkung `vulnerable` (Unterbrechen macht verwundbar)** — Gameplay wünscht für Olafs Dienstmütze „Unterbrechen macht das Ziel 4 s lang 10 % verwundbar“ (docs/backlog/loot.md). `PROCS` in `content/items.js` kennt nur free/reset/empower/energy/points/shield/haste-artige Felder; die Mütze trägt deshalb vorerst `silence` (Unterbrechen lädt 10 Randale). Abnahme: `PROCS.vermerk={text:'Unterbrechen macht das Ziel 4 s lang 10 % verwundbar.',vulnerable:.1,duration:4}` wirkt beim Unterbrechen wie die Markierung (`e.mark`), HUD zeigt die Sekunden; danach stellt Loot `dienstmuetze.proc` um. Betrifft: `engine.js` (Unterbrechen), `content/items.js` (`PROCS`), `content/schema.js` (Feldliste).
- [ ] **Werkbank und Kiosk lesen die Loot-Daten** — `content/recipes.js` (`RECIPES`, `BENCH_STAGES`) und das Feld `price` an der Verpflegung in `content/items.js` liegen bereit (Konzept `docs/GAMEPLAY-HAENDLER-HANDWERK.md`, Freigabe offen). Abnahme: `craft(id)` prüft Werkstattstufe und Inventar, zieht `input`/`coins` ab und legt `output.count` Stück ins Inventar; `buy(id)` zieht `price` von `rpg.coins` ab; `sell(item)` zahlt `Math.max(1,Math.floor(value/2))` nur für `kind:'material'`.
- [ ] **Satz-Zählung für Set-Boni** (nur wenn Gameplay den Satz freigibt, Konzept in `EQUIPMENT.md`) — Anzahl getragener Teile eines Satzes beim Anlegen zählen und die Satzregel wie einen Proc führen. Betrifft: `rpg.js` (Ausrüstung), `engine.js`.

## Aus Klassendesign

Talente sollen Regeln mit Auslöser sein (docs/GAMEPLAY-KONZEPT-FLUSS.md §6). Diese Auslöser/Wirkungen fehlen der Laufzeit (`procs.js`); die betroffenen Talente stehen bis dahin auf der besten heute möglichen Regel.

- [ ] **Auslöser `skillHit:<id>` mit Zähler („jede dritte Kelle“)** — Konzept §6 nennt Deckelwirtschaft als „Jede dritte Kelle gibt Deckung“. Heute kennt `fireProcs` nur `autoHit` mit Zufall, deshalb steht `dieter-wall-0` auf `autoHit`, Chance 30 %. Abnahme: `{trigger:'skillHit',skill:'strike',every:3}` zündet deterministisch, HUD zählt mit. Betrifft: `proc:deckelwirtschaft`.
- [ ] **Auslöser `markedHit` (Treffer an markiertem Ziel)** — `dieter-brew-0` (Rücklaufleitung) und `baerbel-feedback-0` (Provision vom Schmerz) bleiben Prozent-Effekte (`markedLeech`), weil kein Auslöser dafür existiert. Abnahme: Auslöser feuert in `Game.damage` bei `e.mark>0`, Fenster wie üblich.
- [ ] **Proc-Wirkung `heal` (Leben direkt)** — heute kennt `fireProcs` nur free/reset/empower/energy/points/shield/haste. Ohne `heal` lassen sich Rücklauf- und Provisionsregeln nicht als leuchtende Regel zeigen. Abnahme: `effect:{heal:40}` heilt über `healPlayer`, Schema-Liste in `content/schema.js` ergänzen.
- [ ] **Proc-Wirkung `cdReduce` (Sekunden statt Abklingzeit 0)** — sechs Sekunden-Talente („−3 s“) wurden auf vollen `reset` gehoben, weil es nichts dazwischen gibt: `dieter-brawl-3`, `dieter-brew-7`, `baerbel-feedback-3`, `kevin-fuse-7`, `kevin-hunt-3`, `kevin-hunt-7`. Abnahme: `effect:{cdReduce:{skill:'throw',seconds:3}}`, damit feinere Abstufungen ohne Balance-Sprung möglich sind.
- [ ] **Auslöser `beat` (Treffer im Takt)** — `baerbel-stage-0` (Perfekter Upload) hängt an `context.beat` in `class-mechanics.js` und kann deshalb keine sichtbare Proc-Regel mit Leuchten sein. Abnahme: `fireProcs(g,'beat',cs)` beim Takttreffer.
- [ ] **Auslöser `inZone` (Kniff in eigener Zone)** — `dieter-brew-9` (Letzter Ausschank) prüft die Fasszone direkt im Code (`zoneEnergy`). Abnahme: Auslöser feuert, wenn ein Kniff innerhalb einer eigenen Zone eingesetzt wird.

## Offen

- [ ] **Elite-Auswahl über `pickElite()`** (Gameplay): `encounters.buildCell` Zeile 32 setzt jenseits von `eliteDistance` fest `kind='alphaBoar'`; die zweite Elite `oberpraktikant` (Oberpraktikant Olaf) kann deshalb nie erscheinen. Ersatz ist fertig und geprüft: `pickElite(townDistance,random)` aus `content/enemies.js` liefert `null` diesseits von `SPAWN_TABLES.eliteDistance` und sonst gewichtet `{kind,def}` aus `ELITE_TABLE`. Änderung: `const pick=pickElite(town,random); if(aggressive&&pick&&random()<S.eliteChance){kind=pick.kind;def=pick.def;}`. Abnahme: über viele Zellen tauchen beide Eliten auf, keine diesseits von 1300. IDs/Dateien: `encounters.js`, `content/enemies.js` (`ELITE_TABLE`, `pickElite`), `tests/content-gameplay.test.mjs`.
- [ ] **Aggressiver Keiler im Wohngebiet (vr-08)** (Gameplay/Welt): `encounters.buildCell` Zeile 30 bestimmt `field` so: `const area=w.areas.find(a=>['farmland','meadow','grass','forest'].includes(a.tags.landuse)&&inside(...))||w.areaAt(p.x,p.y), field=area?.tags.landuse!=='residential';`. Zwei Löcher: (a) eine Wiesen-/Rasen-/Farmland-Fläche, die in einem Wohnpolygon liegt oder es überlappt, gewinnt das `find` – `field` wird `true` **im** Wohngebiet; (b) liegt der Punkt in gar keinem Polygon (Hof, Garten, Lücke zwischen den Flächen), ist `area` `undefined`, `undefined!=='residential'` ist `true` – ebenfalls Feld. Damit greift `aggressive` mitten im Ort. Vorschlag: den vorhandenen Veto-Test aus `world-layout.js` nutzen statt der Reihenfolge der Flächenliste: `import {residential} from './world-layout.js'` und `const field=!residential(w,p);` (prüft `some(...)` über **alle** Wohnpolygone). Optional zusätzlich `w.buildings`-Nähe < 60 als Feld ausschließen. Abnahme: Rundgang durch das Wohngebiet zeigt nur neutrale Arten; Ökologietest zählt null aggressive Reviere in Wohnpolygonen. Dateien: `encounters.js`, `world-layout.js` (nur lesen). **Nachtrag Welt 2026-09-17:** Der Mertloch-Ausschnitt enthält **null** `landuse=residential`-Polygone (0 von 27 Flächen) — Loch (b) ist der eigentliche Fall, Loch (a) kann hier gar nicht auftreten. `residential(w,p)` in `world-layout.js` prüft jetzt zusätzlich eine Bebauungsmaske aus den Häusern (`settlementMask`/`inSettlement`, 250 Einheiten / 3 Häuser, Export `world.settlement`) und ist damit der belastbare Veto-Test. Befund: docs/backlog/welt.md.
- [ ] **Händler / Handwerk** (Loot/Gameplay): Pfandmarken haben keinen Zweck; Kalle als Händler, Kevin als Werkbank. **Konzept liegt vor: `docs/GAMEPLAY-HAENDLER-HANDWERK.md`.** Gebraucht wird: Laden an einem NPC öffnen, `buy`/`sell`/`craft` gegen `rpg.coins` und Inventar, Werkbank-Stufe aus dem Basisbau (`buildings.werkstatt`) lesen. Daten (`content/shop.js`) legt Gameplay erst nach Freigabe an – nicht vorgreifen.


### Aus dem Playtest Akt 1 (docs/PLAYTEST-2026-09-17-AKT1.md)

- [ ] **P2 Taste 1 darf den Autoangriff nie ausschalten** (bricht ab für Erstspieler): Autoangriff bleibt an, solange ein Ziel steht; Abwählen nur über Esc/Zielverlust. Tab startet ihn wie heute.
- [ ] **P1 Angriffshinweis**: Event `attacked {enemyId,damage}` beim ersten Treffer eines neuen Angreifers und Wechsel `inCombat` 0→1, damit die UI groß „Du wirst angegriffen“ zeigen kann; Auto-Zielwahl auf den Angreifer, wenn kein Ziel steht.
- [ ] **P3/P5 F-Priorität**: Aktionstaste bevorzugt das aktuelle Auftragsziel (Ida bei „Sprich mit Ida“, Kiste bei „Beute“) vor Mentoren und anderen Personen; Mentoren nur, wenn kein Auftragsziel in Reichweite.
- [ ] **P6 Laufweg**: Rechtsklick-Laufweg bis zum Klickpunkt (heute ~10 m je Klick); Prüfung mit 127 m Strecke in einem Klick.
- [ ] **P8 Hofprobe**: kein Schritt erledigt sich ohne Eingabe (Schritt 3 übersprungen, „Auto 1/2“ vorab erfüllt, „Autoangriff aus.“ ohne Eingabe, „Nochmal:“ beim ersten Versuch); Cooldown-Meldung mit Restzeit.

## Erledigt

- [x] **Feldgegner skalieren mit der Spielerstufe** (Balancing, Bericht 0.20): ab Stufe 10 fallen Dachs, Gans, Rabe, Fuchs in unter 2,5 s. Vorschlag: `encounters.buildCell` nutzt `enemyScale(playerLevel-2, def.level)` für hp/damage im Umland; Dorfkern bleibt fest. Runde A, 2026-09-17, tests/engine-rules.test.mjs.
- [x] **Start ohne Hose** (Story): bis Kapitel 1 abgeholt ist, bleibt der Beinschutz-Slot leer; Horsts Beweismittelkiste liefert die Hose. Reine Item-/Layer-Frage. Runde A, 2026-09-17, tests/engine-rules.test.mjs.
- [x] **Bau-Ortsregel** (Gameplay): `game.build()` prüft heute keinen Ort; die UI erlaubt Bauen nur am Treffpunkt. Regel in die Engine ziehen. Runde A, 2026-09-17, tests/engine-rules.test.mjs.
- [x] **Gegner-Sprüche als Event `bark`** (Story/UI): `ENEMY_BARKS` und Boss-Phasen laufen ins Kampflog; UI will Sprechblasen ohne Textparsen. Runde A, 2026-09-17, tests/engine-rules.test.mjs.
- [x] **Dorfbewohner reden** (Story): `VILLAGERS.says` als Sprechblasentext. Runde A, 2026-09-17, tests/engine-rules.test.mjs.
- [x] **Belohnungsgüte `epic`** (Loot): `rolledDefinition` kennt nur uncommon/rare; Kapitel 4 würfelt deshalb `rare`. Runde A, 2026-09-17, tests/engine-rules.test.mjs.
- [x] Akt 1: Kapitelumschalter 1–4, Lager, Erinnerungsfetzen, Basisbau, Mentoren (2026-09-17, tests/story.test.mjs).
