# Backlog · balance

Inbox der Rolle Balancing (docs/ROLLEN.md).

## Offen

- [ ] Bericht 0.20: Feldgegner ab Stufe 10 trivial (Dachs, Gans, Rabe, Fuchs unter 2,5 s). Vorschlag liegt bei Engine (Skalierung mit Spielerstufe); bis dahin Umland-Tiere über `tuning.js` anheben oder bewusst lassen (Entscheidung Lead).
- [ ] Sigi zwei Stufen unter der Heilerin 40 s (⏳), gewollt zäh; nach Playtest prüfen.
- [ ] Basisbau-Kosten nach erstem Playtest gegen den Materialfluss je Kapitel prüfen (docs/AKT-1-FILMRISS.md §6).
- [ ] **Drei Zahlen aus Runde A der Engine** (jeweils Rückfall im Code, bitte in `content/balance.js` nachziehen):
  - `BALANCE.enemies.playerLead` – Vorsprung des Spielers bei der Umland-Skalierung (`enemyScale(playerLevel − playerLead, def.level)`); Engine rechnet ersatzweise mit 2.
  - `BALANCE.weapons.quality.epic` – Waffenfaktor der neuen Güte `epic`; `rolledDefinition` nimmt ersatzweise den `rare`-Faktor, epische Waffen sind dadurch heute zu schwach für ihr Budget.
  - `BALANCE.items.quality.common` – Story wünscht für das Kapitel-1-Beinteil die Güte „common“; es gibt nur `uncommon` aufwärts, die Engine nimmt die unterste Güte.

## Erledigt
