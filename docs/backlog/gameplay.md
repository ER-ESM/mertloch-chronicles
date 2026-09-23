# Backlog · gameplay

## Händlerauftrag · 2026-09-19

- [x] Kalles Kiosk: Sortiment, Kaufen, bestätigter Verkauf von Material/Verpflegung/abgelegter Ausrüstung, gespeicherter Rückkauf, Kartenroute und Desktop-/Touch-Oberfläche nach E-34. [Umfang und Abnahme](../HAENDLER-2026-09-19.md).
- [ ] Werkbank/Handwerk und Pfandbon-Bonus bleiben offen; frühere Sammelaufträge „Händler/Handwerk“ sind damit nur im Händlerteil erledigt.
- Charaktererstellung ist auf Nutzerwunsch zurückgestellt. Die frühere Zurückstellung des Händlers weiter unten ist historisch und durch E-34 aufgehoben.


Inbox der Rolle Gameplay (docs/ROLLEN.md).

## Offen

- [ ] **Dungeon „Schloss Big B"** (wartet auf V-D1 bis V-D11): `content/dungeons.js` mit Grundriss über drei Ebenen, Verbindungen, Toren, Streifen, Ereignissen und Beweisen; Trash und sechs Bosse; Zaubermuster mit den neuen Merkmalen. Auftrag und Datenbeispiele: [DUNGEON-SCHLOSS-BIG-B-2026-09-23.md](../DUNGEON-SCHLOSS-BIG-B-2026-09-23.md) Abschnitte 4, 6, 7, 9, 13.
- [ ] **Aggro und Leine geprüft, Zahlen in tuning.js** (UI/Balancing 2026-09-18, Nutzerbefund): Feldgegner-Aggro von 14–19 m auf 11–14 m, Standard-Leine 47 m → 70 m ab Heimatpunkt, Abbruch bei Spielerabstand 78 m statt 56 m, Lager-Menschen 105. Gameplay bitte in die Definitionen einpflegen (Tuning-Zeilen löschen), wenn ein Playtest die Werte bestätigt. Test: tests/aggro-kiting.test.mjs.

- [ ] **Tote Kit-Felder `damage`, `base`, `perPoint` in `content/skills.js`** (Nebenbefund Klassendesign, Runde B): seit `damageModel` ignoriert `equipment.skillDamage()` den übergebenen Grundwert, sobald ein Modell existiert – die drei Felder wirken nirgends mehr. Lebende Schadensschalter der Kits sind nur noch `multiplier`, `splash`, `knockback`. Entscheidung gemeinsam mit Klassendesign: entweder raus aus `skills.js` oder das Modell so umbauen, dass der Grundwert wieder trägt. Gameplay entscheidet mit, weil `SKILL_DAMAGE` hier liegt.
- [ ] Händler/Handwerk als Daten (`content/shop.js`: `SHOP_STOCK`, `SELL_RATE`, `RECIPES`, `benchStage()`) – **erst nach Freigabe** des Konzepts `docs/GAMEPLAY-HAENDLER-HANDWERK.md`, dann Prüfung in `checks/gameplay.js` und Test.
- [ ] Restliche 72 Talente als Regeln mit Auslöser, gemeinsam mit Klassendesign (docs/GAMEPLAY-KONZEPT-FLUSS.md §6).
- [ ] Bau-Ortsregel als Engine-Regel beauftragt (docs/backlog/engine.md); Basisbau-Effekt `respawnHp` ist als Deckung umgesetzt.


### Welle D (Nutzerauftrag)

- [x] `info` für BUILDING_EFFECTS/BUILDINGS-Stufen und Boss-/Gegner-Zauber (`CAST_SETS` casts) – siehe „Erledigt“.
- [ ] **UI-Bedarf aus Welle D** (an UI): Tooltip zeigt `info.effect` + `info.numbers` (jede Zahl `{label,value,unit,source}`), Shift blendet `info.why`, `info.links` und die Glossar-Langtexte der `info.terms` ein. Fertig vorhanden an: `BUILDINGS[].stages[].info`, `CAST_SETS[].casts[].info` (Gegner-Zauberleiste, Boss-Balken), `ENEMY_AUTOS[].info` (Gegnerfenster), `COMBAT_RULE_INFO` (Glossar/Hilfe). `chapter-ui.js` kann die Effektzeile der Bude weiterhin über `BUILDING_EFFECTS[key]` bauen – der Text kommt jetzt aus `BUILDING_EFFECT_INFO[key].label`, zusätzlich stehen dort `name`, `short`, `long` und `unit`.

- [x] **Bedarf von Loot (2026-09-17): Basisbau-Effekte brauchen ihren `info`-Block.** Erledigt mit Welle D (siehe unten): `BUILDING_EFFECT_INFO` deckt alle elf Schlüssel mit derselben Umrechnung wie in der Tabelle ab (`kind` statt Formel im Text), `describeStage()` baut die `numbers`-Zeile aus `stage.effect`. Abweichungen zur Wunschliste: Beschriftungen sind kürzer („Pfandmarken-Chance“ statt „Chance auf Pfandmarken“), und statt `leben`/`glueckstreffer` verweisen die Effekte auf `beute`, `schadensminderung`, `staerkung`, `basisbau` (angemeldet in docs/backlog/klassen.md). Die gewünschten Verlinkungen auf Loot-Daten stehen in den `long`-Texten, nicht als `links` – `links` zeigt bei Gebäuden auf andere Gebäude. Ursprünglicher Auftrag zum Nachlesen:

 `BUILDING_EFFECTS` und die Stufen in `content/buildings.js` gehören Gameplay – die Stufentexte nennen die Zahlen heute nur als Prosa („Regeneration +25 %“), daraus kann die UI keine `numbers`-Zeile bauen. Muster steht fertig in `content/item-info.js` (`itemNumbers`, `procNumbers`): von Hand nur `effect`/`why`/`links`/`terms`, die Zahlen aus `stage.effect` ableiten. Umrechnungstabelle je Effektschlüssel (Vorschlag von Loot, deckt alle elf Schlüssel ab):

  | Schlüssel | Beschriftung | Einheit | Umrechnung aus `stage.effect[k]` |
  |---|---|---|---|
  | `restRegen` | Regeneration außerhalb des Kampfes | % | `v*100` (additiv auf `BALANCE.player.outOfCombatRegen` = 16 Leben/s) |
  | `foodHeal` | Wirkung der Verpflegung | % | `v*100` (auf `heal` und `energy` des Gegenstands) |
  | `consumableCd` | Verpflegung früher bereit | s | `v` (abgezogen von `BALANCE.player.consumableCooldown` = 15 s) |
  | `coinDrop` | Chance auf Pfandmarken | Prozentpunkte | `v*100` (additiv auf `DROP_TABLES[…].coinsChance`) |
  | `gearChance` | Chance auf Ausrüstung | Prozentpunkte | `v*100` (additiv auf `DROP_TABLES[…].gearChance`) |
  | `xpBonus` | Erfahrung aus Kills und Aufträgen | % | `v*100` |
  | `damageTaken` | erlittener Schaden | % | `(1-v)*100`, Wortlaut „weniger“ (Faktor, multiplikativ) |
  | `buffDuration` | Dauer der Klassen-Stärkung | % | `v*100` |
  | `dashCd` | Ausweichen schneller bereit | % | `v*100` (dieselbe Größe wie der Proc `fleet`) |
  | `energyOnKill` | Randale je Kill | Randale | `v` (flach, additiv auf `BALANCE.momentum.energyOnKill` = 25) |
  | `respawnHp` | Deckung beim Erwachen bei St. Gangolf | % vom Maximalleben | `v*100` |

  Begriffs-IDs dafür aus `content/glossary.js`: `verpflegung`, `abklingzeit`, `randale`, `leben`, `deckung`, `ausweichen`, `pfandmarken`, `glueckstreffer`. Loot hat die Blöcke für Gegenstände, Procs und Verpflegung geliefert (`content/item-info.js`); die Gebäude bleiben bei Gameplay, weil `buildings.js` Gameplay gehört. Zwei Stellen hängen dabei an Loot-Daten und sollten verlinkt werden: `foodHeal`/`consumableCd` auf die fünf Kioskwaren, `gearChance`/`coinDrop` auf `content/drops.js`.



### Abnahme Welle D

- [ ] Keine abgeleiteten Zahlen im Handtext (CAST_INFO, BUILDING_EFFECT_INFO); Prüfung in checks/gameplay.js.

## Erledigt

- [x] **Welle D: Beschreibungs-Standard in den Gameplay-Daten** (2026-09-17). Nichts wird doppelt gepflegt – jede Zahl wird aus der Definition abgeleitet:
  - `content/buildings.js`: `BUILDING_EFFECT_INFO` erklärt alle elf Effekte mit `name`/`short`/`long`/`unit` plus `kind` (wie der Rohwert zur lesbaren Zahl wird: Anteil, Faktor, Sekunden, Prozentpunkte, flach). `BUILDING_EFFECTS` (die alte Textkarte für `chapter-ui.js`) wird daraus erzeugt. `effectNumber(key,value,quelle)` macht aus `damageTaken:.97` ein „−3 %“, aus `coinDrop:.1` ein „+10 Punkte Chance“. `describeStage(id,stufe)` baut `info:{effect,numbers,why,links,terms}`; alle 16 Ausbaustufen tragen es.
  - `content/enemies.js`: `ANSWER_INFO` gibt jeder der vier Antworten ihre Grundregel, `CAST_INFO` den geschriebenen Teil je Zauber (48 Zauber in 15 Mustern), `describeCast(setId,castId)` ergänzt Zauberzeit, Schaden und Radius (mit Meterangabe) aus dem Zauber selbst. Der Block steht **nach** `applyTuning`, damit die Zahlen die getunten sind.
  - `content/combat.js`: `AUTO_INFO` + `describeAuto(id)` erklären alle 13 Gegner-Autoangriffe inklusive errechnetem Schaden je Sekunde. `COMBAT_RULE_INFO` erklärt jede Kampfregel mit Zahl glossartauglich (`unarmed`, `specialInterval`, `firstSpecial`, `lootRange`, `autoRange`, `castTime`, `skillDamage`, `enemyAuto`) – `rules` nennt den abgedeckten Pfad in `COMBAT_RULES`.
  - Prüfungen in `content/checks/gameplay.js` und Tests in `tests/content-gameplay.test.mjs`: jedes Element hat `effect`/`why`/`numbers`/`terms`, jede Zahl trägt Quelle, die Zahlen müssen mit der Definition übereinstimmen (Gegenprobe: Wert ändern → abgeleitete Zahl ändert sich), jeder Zauber nennt die Antwort aus seinem Namen in `terms`, jede Zahl in `COMBAT_RULES` ist von `COMBAT_RULE_INFO` abgedeckt. Begriffe werden als IDs geprüft; sobald `content/glossary.js` existiert, prüft der Test zusätzlich, dass jeder Begriff dort steht.

- [x] **Dieters Waffenfaktor auf Klassenmaß** (2026-09-17): `SKILL_DAMAGE.dieter.strike.weapon` 3 → 2 und `burst.weaponPerPoint` 3,2 → 2,8 in `content/combat.js`. Beleg `npm run content:balance`: Pfandkeiler auf eigener Stufe 3,6 → 4,5 s (Flagge weg), Pfandautomat 9,4 → 10,6 s (Flagge weg), Borsten-Bruno 4,2 → 5,5 s, Oberpraktikant Olaf 4,6 → 6,1 s, Pfanddachs 2,6 → 3,2 s. Auffälligkeiten 8 → 6; Bärbel und Kevin unverändert (Zelle für Zelle gleich). Folge: die feste Zahl im Resonanz-Test (`tests/game.test.mjs`, Dieters `burst`) von 349,92 auf 316,9 nachgezogen.
- [x] Beutefamilie `oberpraktikant` für Olaf eingepflegt – `ELITES.oberpraktikant.family` steht auf `oberpraktikant` (Tabelle in `content/drops.js`), `ENEMY_AUTOS.oberpraktikant` war schon da (2026-09-17).
- [x] `COMBAT_TEXT.underAttack` („Du kriegst auf die Fresse von“, dahinter setzt die UI den Gegnernamen) und `COMBAT_TEXT.cooldown=(name,sekunden)=>…` („… muss noch verschnaufen · 2.4 s.“) ergänzt – Wortlaut von Story, wie in diesem Backlog geliefert. Engine (`engine.js`) und UI (`app.js`) nutzen sie über ihre Rückfälle automatisch (2026-09-17).
- [x] Horst steht nur noch einmal in den Daten: `CAMP_ENEMIES.boss` und `BOSSES.horst` sind dasselbe Objekt (`const HORST`) statt einer Spread-Kopie. Damit wirkt eine Korrektur aus `content/tuning.js` unter jedem der beiden Schlüssel auf den echten Gegner; ID und Werte unverändert. Prüfung in `checks/gameplay.js` und Test (2026-09-17).

- [x] Akt-1-Gegner, Bosse, Zaubermuster, Basisbau-Daten (2026-09-17).
- [x] Zweite Elite für die Außenbezirke: **Oberpraktikant Olaf** (`ELITES.oberpraktikant`, Stufe 4, 1480 Leben, Schaden ×1,22, Leine 520, eigenes Muster `oberpraktikant` mit vier Antworten), dazu `ELITE_TABLE` + `pickElite()` und Tests (2026-09-17). Engine muss die feste `alphaBoar`-Wahl in `encounters.buildCell` ersetzen → `docs/backlog/engine.md`.
- [x] Konzept „Händler und Handwerk“: `docs/GAMEPLAY-HAENDLER-HANDWERK.md` (Pfandmarken-Zweck, Kalle als Händler, Kevins Werkstatt als Werkbank, Preis- und Rezeptentwurf); Bedarf bei Loot, Engine, Story und Welt eingetragen (2026-09-17).
- [x] Aggressiver Keiler im Wohngebiet (vr-08) analysiert: Ursache ist die `field`-Bestimmung in `encounters.buildCell` (erste passende Fläche statt Wohnpolygon-Veto, plus Punkte ganz ohne Fläche). Befund und Vorschlag (`residential()` aus `world-layout.js`) in `docs/backlog/engine.md` und `docs/backlog/welt.md` (2026-09-17).
- [x] Basisbau auf Stufenzuwachs geprüft: alle sechs Gebäude wachsen je Stufe, jedes hat bereits einen „Was du davon merkst“-Satz im `text` – nichts zu ergänzen; Prüfung jetzt zusätzlich als Test (2026-09-17).

## Begleiter / Söldner (E-45) · 2026-09-21

Herkunft und Schnittstelle: [Begleiter-Übergabe](../BEGLEITER-2026-09-21.md).

- [ ] Für den Meilenstein Dungeons: jede Boss-Fähigkeit trägt ein maschinenlesbares Merkmal (ground, interruptible, künftig sammeln/verteilen/tankwechsel). Ohne Merkmal können Begleiter nicht reagieren – Prüfung in content/checks/gameplay.js ergänzen.

## Erledigt · Berufe (22.09.2026)

- [x] Erste Sammel-/Handwerksstufe: Schrottsammeln, Kräutersammeln, Schrauberei, Hausbrauerei; zwei Hauptberufe pro Held, Fertigkeit 1–75, sechs Rezepte, Stationen, Kiosk-Zutaten und Berufsfenster.
- [x] Online-Fundstellen mit persönlichen Ernten, atomaren Ergebnisquittungen und Schutz gegen veraltete Cloud-Saves; explizite Solo-Zyklen ohne Konto. Regeln und weitere Grenzen: [Berufsbericht](../BERUFE-2026-09-22.md).

## Playtest Kenner 2026-09-23 (E-53, Bericht `docs/PLAYTEST-2026-09-23-kenner.md`)

- [ ] **Hofprobe 5/8 „Der rote Kreis ist kein Tanzplatz“ – Kenner: bricht ab.** Drei Versuche (Leertaste nach „JETZT AUSWEICHEN!“, erneut, 1 s S gehalten) zählten nicht; der rote Kreis lag auch 27–30 m vom Papp-Horst noch unter der Figur. Mitursache Werkzeugverzögerung möglich. Unit-Test `tests/tutorial-talents.test.mjs` (Wiederholung nach Fehlversuch) grün; das Browserskript `scripts/tutorial-talents-check.mjs` bricht schon vorher ab (`null.dataset`) und prüft den Schritt derzeit nicht. Nicht Teil von E-53 – vor dem nächsten Release mit einem Menschen oder repariertem Skript nachstellen.
- [ ] Kniff/Autoangriff aus 7 m: nur „Zu weit entfernt“, die Figur läuft nicht selbst hin (Genre-Erwartung).
- [ ] Rechtsklick-Laufweg in der Welt landet zweimal nicht am Klickpunkt (einmal weit hinter der Kirche); WASD zuverlässig.
- [ ] **Neuling 23.09. (L2 H4, bricht ab):** Alte Nebenaufträge (`world.quests`) schicken Stufe-1-Helden 200–460 m ins aggressive Umland (Fuchs, Praktikant, Ruhewärter in Gruppe) – Tod nach 5 s auf dem ersten Weg. Vorschlag: Stufenempfehlung an Nebenaufträgen oder Ziele näher an den Ort; die Startreihe (E-55) ist der ruhige Einstieg.
- [ ] Neuling (L2 H3): F-Reihenfolge allgemein – das Schwarze Brett gewinnt gegen die Figur daneben. Nächstes Ziel statt fester Reihenfolge?
- [ ] Neuling (L2 H1/H2): Ida 1/8 – erster Klick auf „Ausrüstung nehmen und Hofprobe anfangen“ ohne Wirkung; „Spielweise aussuchen“ öffnet die Figur ohne sichtbare Wahl.
- [ ] Neuling (L2 H8): nach „Bereit für den üblichen Verdächtigen“ drei Fenster gleichzeitig.
- [ ] Balance E-55: Startreihe ~1 420 EP + Aushänge 740 EP zusätzlich – prüfen, ob Kapitel 2 dadurch zu leicht wird.
