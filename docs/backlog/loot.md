# Backlog · loot

Inbox der Rolle Gegenstände & Loot (docs/ROLLEN.md).

## Offen

- [ ] Ideen aus content/IDEEN-LANDJUNGS.md (Kabelbinder-Gürtel, Diagnose-Dongle, Headset …) erst nach Freigabe der Themen durch den Lead.
- [ ] Verpflegung je Kapitel-Familie prüfen (kegler, jga, sigi, klaus, timo nutzen vorhandene Sorten); eigene Sorte für den Bus (z. B. „Bierbong-Rest“) nur, wenn Gameplay einen Zweck nennt.


- [ ] `dienstmuetze.proc` auf den echten Vermerk-Proc umstellen, sobald die Engine `vulnerable` kann (`docs/backlog/engine.md`).
- [ ] Preise der übrigen Waren, sobald Gameplay den Laden freigibt; heute tragen nur die fünf Kioskwaren ein `price`.

## Erledigt

- [x] **Set-Boni-Konzept** (2026-09-17): Abschnitt „Set-Boni“ in `EQUIPMENT.md` – Satz **Ruhe 22:01** aus `ruhepfeife` + `praktikantenausweis` + `dienstmuetze`, Boni ohne Primärwerte. Daten erst nach Freigabe durch Gameplay; Engine-Bedarf eingetragen.
- [x] **Beutefamilie `oberpraktikant`** angelegt (2026-09-17): Material `kabelbinder`, Dorflegende `dienstmuetze` (Kopf, Stufe 4, Proc `silence` ersatzweise – Wunsch-Proc „Unterbrechen macht verwundbar“ steht in `docs/backlog/engine.md`), `FOOD_DROPS.oberpraktikant` = `brezel`. Umstellung von `ELITES.oberpraktikant.family` liegt bei Gameplay.
- [x] **Händler/Werkbank-Daten** (2026-09-17): `kabeltalisman` (charm, Stufe 4), `blechtalisman` (charm, Stufe 8), `pfandbon` (Verbrauch, Stufe 4); `price` an Brezel 12, Konterwasser 12, Kaltgetränk 28, Currywurst 40, Pfandbon 35; Rezepte in `content/recipes.js`. **Urteil zu `value`:** als *Verkaufs*grundlage taugt `value` (halber Wert, mindestens 1) – er ist bereits die Budget-Ableitung aus `balance.js` und wächst mit Stufe und Qualität. Als *Kauf*preis taugt er nicht: `value` ist bei Verpflegung 3–6, ein Kaufpreis von 12–40 wäre daraus nicht ableitbar, ohne jede Beute mit zu verschieben. Deshalb ein eigenes Feld `price` je Ware, geprüft in `content/checks/loot.js` (ganzzahlig, > halber Verkaufserlös, nur an `kind:consumable`).
- [x] Akt-1-Dorflegenden, Material und Beutefamilien; Bildhinweise für alle Legenden (2026-09-17).
