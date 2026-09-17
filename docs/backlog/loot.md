# Backlog · loot

Inbox der Rolle Gegenstände & Loot (docs/ROLLEN.md).

## Offen

- [ ] Set-Boni für Dorflegenden (z. B. drei Ruhe-22:01-Teile), Konzept mit Gameplay.
- [ ] Ideen aus content/IDEEN-LANDJUNGS.md (Kabelbinder-Gürtel, Diagnose-Dongle, Headset …) erst nach Freigabe der Themen durch den Lead.
- [ ] Verpflegung je Kapitel-Familie prüfen (kegler, jga, sigi, klaus, timo nutzen vorhandene Sorten); eigene Sorte für den Bus (z. B. „Bierbong-Rest“) nur, wenn Gameplay einen Zweck nennt.

- [ ] **Beutetabelle `oberpraktikant`** für die neue Elite „Oberpraktikant Olaf“ (`content/enemies.js`, elite, Stufe 4, menschlich, jenseits `eliteDistance`). Olaf erbt bis dahin die Familie `inspector` – das ist Absicht, aber keine Dauerlösung: eine Elite soll sich lohnen. Vorschlag: Material **`kabelbinder`** („Dienstlicher Kabelbinder“, common, icon `cable`, value 2, „Er hat sie dutzendweise dabei. Keiner weiß, wofür.“) und Dorflegende **`dienstmuetze`** („Olafs Dienstmütze“, epic, Kopf, Proc-Idee: Unterbrechen macht das Ziel 4 s lang 10 % verwundbar – „Vermerkt.“). Zahlenrahmen wie `elite`, aber menschlich: `materialChance` ~.7, `gearChance` ~.5, `uniqueChance` ~.05, `coinsChance` ~.9, `slots` wie `inspector` plus `charm`. `FOOD_DROPS.oberpraktikant` = `brezel` wie bei `inspector`. Gameplay trägt die Familie danach in `enemies.js` nach; `ENEMY_AUTOS.oberpraktikant` (Dienstmützen-Wurf) liegt in `content/combat.js` schon bereit.
- [ ] **Gegenstände für Händler/Werkbank** (Konzept `docs/GAMEPLAY-HAENDLER-HANDWERK.md`, noch nicht freigegeben – nur Urteil erbeten): zwei baubare Talismane (`charm`, Stufe 4 aus Kabel/Kronkorken, Stufe 8 aus Dosenblech/Borste) und ein Verbrauchsgegenstand „Pfandbon-Bündel“ (nächster Kill gibt dreifache Pfandmarken, 60 s). Frage an Loot: taugt `value` als Grundlage für Verkaufspreise (halber `value`, mindestens 1), oder braucht es eine eigene Zahl je Gegenstand?

## Erledigt

- [x] Akt-1-Dorflegenden, Material und Beutefamilien; Bildhinweise für alle Legenden (2026-09-17).
