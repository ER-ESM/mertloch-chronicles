# Backlog · gameplay

Inbox der Rolle Gameplay (docs/ROLLEN.md).

## Offen

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
