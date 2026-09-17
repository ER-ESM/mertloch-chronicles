# Backlog · gameplay

Inbox der Rolle Gameplay (docs/ROLLEN.md).

## Offen

- [ ] **Dieters Schadensmodell trägt den Klassenabstand, nicht sein Kit** (Klassendesign, Runde B 2026-09-17). `SKILL_DAMAGE` in `content/combat.js` gibt Dieter den Waffenfaktor 3 auf `strike` (Bärbel und Kevin: 2) und 3,2 je Punkt auf `burst` (2,8 / 2,6). Mit der Zweihandwaffe schlägt eine Kelle dadurch 108, ein Pinsel-Piekser 63 – bei gleicher Ausrüstungsstufe. Klassendesign kann daran nichts drehen: die Kit-Felder `damage`, `base` und `perPoint` sind seit Einführung von `damageModel` **tot**, weil `equipment.skillDamage()` den übergebenen Grundwert ignoriert, sobald ein Modell existiert. Übrig blieb die Schlagfrequenz; Dieters Kelle liegt jetzt auf 1,5 s statt 0,85 s, das hat 16 ⚡ auf 8 gedrückt.
  **Bitte:** `SKILL_DAMAGE.dieter.strike.weapon` 3 → 2 und `burst.weaponPerPoint` 3,2 → 2,8. Gemessen mit demselben Aufbau wie `scripts/balance-report.mjs`, Dieter auf eigener Stufe, mit der neuen Kelle: Pfandkeiler 3,6 → 4,5 s und Pfandautomat 9,4 → 10,6 s (beide damit im Korridor), Borsten-Bruno 4,2 → 5,5 s, Oberpraktikant Olaf 4,6 → 6,1 s, Pfanddachs 2,6 → 3,2 s. Danach bleiben fünf ⚡ statt acht.
  **Gegenprobe, warum das nicht über `cd` geht:** Kelle auf 2,2 s – absurd für einen Grundangriff – lässt den Pfanddachs trotzdem bei 3,2 s und die Eliten bei 5,4 / 6,0 s. Den Rest trägt Dieters Autoangriff mit der Zweihandwaffe (Restposten → `docs/backlog/balance.md`).
  **Nebenbefund:** Dieselbe Regel macht `multiplier`, `splash` und `knockback` zu den einzigen noch lebenden Schadensschaltern der Kits. Bleiben `damage`/`base`/`perPoint` dauerhaft tot, sollten sie aus `content/skills.js` verschwinden; das entscheidet Gameplay mit, weil das Modell dort liegt.
- [ ] Beutefamilie `oberpraktikant` für Olaf einpflegen, sobald Loot die Tabelle angelegt hat (heute erbt er `inspector`; `ENEMY_AUTOS.oberpraktikant` liegt bereit).
- [ ] `ELITES.oberpraktikant.family` von `inspector` auf `oberpraktikant` umstellen – die Beutetabelle steht jetzt in `content/drops.js` (Material `kabelbinder`, Dorflegende `dienstmuetze`, `FOOD_DROPS.oberpraktikant`).
- [ ] Händler/Handwerk als Daten (`content/shop.js`: `SHOP_STOCK`, `SELL_RATE`, `RECIPES`, `benchStage()`) – **erst nach Freigabe** des Konzepts `docs/GAMEPLAY-HAENDLER-HANDWERK.md`, dann Prüfung in `checks/gameplay.js` und Test.
- [ ] Restliche 72 Talente als Regeln mit Auslöser, gemeinsam mit Klassendesign (docs/GAMEPLAY-KONZEPT-FLUSS.md §6).
- [ ] Bau-Ortsregel als Engine-Regel beauftragt (docs/backlog/engine.md); Basisbau-Effekt `respawnHp` ist als Deckung umgesetzt.

## Erledigt

- [x] Akt-1-Gegner, Bosse, Zaubermuster, Basisbau-Daten (2026-09-17).
- [x] Zweite Elite für die Außenbezirke: **Oberpraktikant Olaf** (`ELITES.oberpraktikant`, Stufe 4, 1480 Leben, Schaden ×1,22, Leine 520, eigenes Muster `oberpraktikant` mit vier Antworten), dazu `ELITE_TABLE` + `pickElite()` und Tests (2026-09-17). Engine muss die feste `alphaBoar`-Wahl in `encounters.buildCell` ersetzen → `docs/backlog/engine.md`.
- [x] Konzept „Händler und Handwerk“: `docs/GAMEPLAY-HAENDLER-HANDWERK.md` (Pfandmarken-Zweck, Kalle als Händler, Kevins Werkstatt als Werkbank, Preis- und Rezeptentwurf); Bedarf bei Loot, Engine, Story und Welt eingetragen (2026-09-17).
- [x] Aggressiver Keiler im Wohngebiet (vr-08) analysiert: Ursache ist die `field`-Bestimmung in `encounters.buildCell` (erste passende Fläche statt Wohnpolygon-Veto, plus Punkte ganz ohne Fläche). Befund und Vorschlag (`residential()` aus `world-layout.js`) in `docs/backlog/engine.md` und `docs/backlog/welt.md` (2026-09-17).
- [x] Basisbau auf Stufenzuwachs geprüft: alle sechs Gebäude wachsen je Stufe, jedes hat bereits einen „Was du davon merkst“-Satz im `text` – nichts zu ergänzen; Prüfung jetzt zusätzlich als Test (2026-09-17).
