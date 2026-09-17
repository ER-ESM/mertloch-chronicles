# Backlog · engine

Inbox der Engine-Rolle (docs/ROLLEN.md). Andere Rollen tragen hier Bedarf ein: Ziel, Grund, Abnahme, betroffene IDs/Dateien. Die Rolle hakt ab, löscht nicht.

## Offen

- [ ] **Feldgegner skalieren mit der Spielerstufe** (Balancing, Bericht 0.20): ab Stufe 10 fallen Dachs, Gans, Rabe, Fuchs in unter 2,5 s. Vorschlag: `encounters.buildCell` nutzt `enemyScale(playerLevel-2, def.level)` für hp/damage im Umland; Dorfkern bleibt fest.
- [ ] **Start ohne Hose** (Story): bis Kapitel 1 abgeholt ist, bleibt der Beinschutz-Slot leer; Horsts Beweismittelkiste liefert die Hose. Reine Item-/Layer-Frage.
- [ ] **Bau-Ortsregel** (Gameplay): `game.build()` prüft heute keinen Ort; die UI erlaubt Bauen nur am Treffpunkt. Regel in die Engine ziehen.
- [ ] **Gegner-Sprüche als Event `bark`** (Story/UI): `ENEMY_BARKS` und Boss-Phasen laufen ins Kampflog; UI will Sprechblasen ohne Textparsen.
- [ ] **Dorfbewohner reden** (Story): `VILLAGERS.says` als Sprechblasentext.
- [ ] **Händler / Handwerk** (Loot/Gameplay): Pfandmarken haben keinen Zweck; Kalle als Händler, Kevin als Werkbank. Erst Konzept von Gameplay abwarten.
- [ ] **Belohnungsgüte `epic`** (Loot): `rolledDefinition` kennt nur uncommon/rare; Kapitel 4 würfelt deshalb `rare`.

## Erledigt

- [x] Akt 1: Kapitelumschalter 1–4, Lager, Erinnerungsfetzen, Basisbau, Mentoren (2026-09-17, tests/story.test.mjs).
