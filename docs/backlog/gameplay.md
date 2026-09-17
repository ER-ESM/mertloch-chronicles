# Backlog · gameplay

Inbox der Rolle Gameplay (docs/ROLLEN.md).

## Offen

- [ ] **Tote Kit-Felder `damage`, `base`, `perPoint` in `content/skills.js`** (Nebenbefund Klassendesign, Runde B): seit `damageModel` ignoriert `equipment.skillDamage()` den übergebenen Grundwert, sobald ein Modell existiert – die drei Felder wirken nirgends mehr. Lebende Schadensschalter der Kits sind nur noch `multiplier`, `splash`, `knockback`. Entscheidung gemeinsam mit Klassendesign: entweder raus aus `skills.js` oder das Modell so umbauen, dass der Grundwert wieder trägt. Gameplay entscheidet mit, weil `SKILL_DAMAGE` hier liegt.
- [ ] Händler/Handwerk als Daten (`content/shop.js`: `SHOP_STOCK`, `SELL_RATE`, `RECIPES`, `benchStage()`) – **erst nach Freigabe** des Konzepts `docs/GAMEPLAY-HAENDLER-HANDWERK.md`, dann Prüfung in `checks/gameplay.js` und Test.
- [ ] Restliche 72 Talente als Regeln mit Auslöser, gemeinsam mit Klassendesign (docs/GAMEPLAY-KONZEPT-FLUSS.md §6).
- [ ] Bau-Ortsregel als Engine-Regel beauftragt (docs/backlog/engine.md); Basisbau-Effekt `respawnHp` ist als Deckung umgesetzt.


### Welle D (Nutzerauftrag)

- [ ] `info` für BUILDING_EFFECTS/BUILDINGS-Stufen und Boss-/Gegner-Zauber (`CAST_SETS` casts: effect/numbers/terms), nach dem Standard in docs/backlog/klassen.md.

## Erledigt

- [x] **Dieters Waffenfaktor auf Klassenmaß** (2026-09-17): `SKILL_DAMAGE.dieter.strike.weapon` 3 → 2 und `burst.weaponPerPoint` 3,2 → 2,8 in `content/combat.js`. Beleg `npm run content:balance`: Pfandkeiler auf eigener Stufe 3,6 → 4,5 s (Flagge weg), Pfandautomat 9,4 → 10,6 s (Flagge weg), Borsten-Bruno 4,2 → 5,5 s, Oberpraktikant Olaf 4,6 → 6,1 s, Pfanddachs 2,6 → 3,2 s. Auffälligkeiten 8 → 6; Bärbel und Kevin unverändert (Zelle für Zelle gleich). Folge: die feste Zahl im Resonanz-Test (`tests/game.test.mjs`, Dieters `burst`) von 349,92 auf 316,9 nachgezogen.
- [x] Beutefamilie `oberpraktikant` für Olaf eingepflegt – `ELITES.oberpraktikant.family` steht auf `oberpraktikant` (Tabelle in `content/drops.js`), `ENEMY_AUTOS.oberpraktikant` war schon da (2026-09-17).
- [x] `COMBAT_TEXT.underAttack` („Du kriegst auf die Fresse von“, dahinter setzt die UI den Gegnernamen) und `COMBAT_TEXT.cooldown=(name,sekunden)=>…` („… muss noch verschnaufen · 2.4 s.“) ergänzt – Wortlaut von Story, wie in diesem Backlog geliefert. Engine (`engine.js`) und UI (`app.js`) nutzen sie über ihre Rückfälle automatisch (2026-09-17).
- [x] Horst steht nur noch einmal in den Daten: `CAMP_ENEMIES.boss` und `BOSSES.horst` sind dasselbe Objekt (`const HORST`) statt einer Spread-Kopie. Damit wirkt eine Korrektur aus `content/tuning.js` unter jedem der beiden Schlüssel auf den echten Gegner; ID und Werte unverändert. Prüfung in `checks/gameplay.js` und Test (2026-09-17).

- [x] Akt-1-Gegner, Bosse, Zaubermuster, Basisbau-Daten (2026-09-17).
- [x] Zweite Elite für die Außenbezirke: **Oberpraktikant Olaf** (`ELITES.oberpraktikant`, Stufe 4, 1480 Leben, Schaden ×1,22, Leine 520, eigenes Muster `oberpraktikant` mit vier Antworten), dazu `ELITE_TABLE` + `pickElite()` und Tests (2026-09-17). Engine muss die feste `alphaBoar`-Wahl in `encounters.buildCell` ersetzen → `docs/backlog/engine.md`.
- [x] Konzept „Händler und Handwerk“: `docs/GAMEPLAY-HAENDLER-HANDWERK.md` (Pfandmarken-Zweck, Kalle als Händler, Kevins Werkstatt als Werkbank, Preis- und Rezeptentwurf); Bedarf bei Loot, Engine, Story und Welt eingetragen (2026-09-17).
- [x] Aggressiver Keiler im Wohngebiet (vr-08) analysiert: Ursache ist die `field`-Bestimmung in `encounters.buildCell` (erste passende Fläche statt Wohnpolygon-Veto, plus Punkte ganz ohne Fläche). Befund und Vorschlag (`residential()` aus `world-layout.js`) in `docs/backlog/engine.md` und `docs/backlog/welt.md` (2026-09-17).
- [x] Basisbau auf Stufenzuwachs geprüft: alle sechs Gebäude wachsen je Stufe, jedes hat bereits einen „Was du davon merkst“-Satz im `text` – nichts zu ergänzen; Prüfung jetzt zusätzlich als Test (2026-09-17).
