# Backlog · loot

Inbox der Rolle Gegenstände & Loot (docs/ROLLEN.md).

## Offen

- [ ] Ideen aus content/IDEEN-LANDJUNGS.md (Kabelbinder-Gürtel, Diagnose-Dongle, Headset …) erst nach Freigabe der Themen durch den Lead.
- [ ] Verpflegung je Kapitel-Familie prüfen (kegler, jga, sigi, klaus, timo nutzen vorhandene Sorten); eigene Sorte für den Bus (z. B. „Bierbong-Rest“) nur, wenn Gameplay einen Zweck nennt.


- [ ] `dienstmuetze.proc` auf den echten Vermerk-Proc umstellen, sobald die Engine `vulnerable` kann (`docs/backlog/engine.md`).
- [ ] Preise der übrigen Waren, sobald Gameplay den Laden freigibt; heute tragen nur die fünf Kioskwaren ein `price`.


### Welle D · Erweiterte Beschreibungen + benutzbare Gegenstände (Nutzerauftrag)

- [ ] Beschreibungs-Standard (Nutzerauftrag 2026-09-17, E-24 vorgeschlagen): Jedes kampfrelevante Element (Kniff, Talent, Passiv, Stärkung/temporärer Buff, Proc, Dorflegende, Verpflegung, Basisbau-Effekt) trägt `info:{effect, numbers:[{label,value,unit,source}], why, links:[ids], terms:[glossar-ids]}` – `effect` präzise auf das Notwendige, nichts doppelt, keine technischen Details auslassen; `numbers` zeigt genau, was um wie viel steigt (Wert + Einheit + Quelle, z. B. „+12 % Eskalationsschaden“); `why` sagt, wozu es im Kampffluss dient; `links` verweist auf zusammenhängende IDs; `terms` auf Einträge in `content/glossary.js` (`GLOSSARY={id:{name,short,long}}`, Besitzer Klassendesign). Jedes Element hat ein Icon (vorhandene `icon`/Atlas-Zellen; fehlende in ART-BRIEF). UI: Tooltip zeigt `effect`+`numbers`; Shift gedrückt blendet `why`, `links` und die `long`-Erklärung aller `terms` ein.
- [ ] `info` für PROCS (items.js), alle Dorflegenden, Verpflegung, Basisbau-Effekte (BUILDING_EFFECTS gehören Gameplay → Bedarf dort), Ausrüstungswertungen (`stats` → numbers mit Umrechnung aus BALANCE, Terms aus glossary).
- [ ] Verpflegung: Feld `usable:true` und `slotIcon`; Regel: benutzbare Gegenstände dürfen in die Aktionsleiste (Engine setzt um). Prüfung in checks/loot.js.

## Erledigt

- [x] **Set-Boni-Konzept** (2026-09-17): Abschnitt „Set-Boni“ in `EQUIPMENT.md` – Satz **Ruhe 22:01** aus `ruhepfeife` + `praktikantenausweis` + `dienstmuetze`, Boni ohne Primärwerte. Daten erst nach Freigabe durch Gameplay; Engine-Bedarf eingetragen.
- [x] **Beutefamilie `oberpraktikant`** angelegt (2026-09-17): Material `kabelbinder`, Dorflegende `dienstmuetze` (Kopf, Stufe 4, Proc `silence` ersatzweise – Wunsch-Proc „Unterbrechen macht verwundbar“ steht in `docs/backlog/engine.md`), `FOOD_DROPS.oberpraktikant` = `brezel`. Umstellung von `ELITES.oberpraktikant.family` liegt bei Gameplay.
- [x] **Händler/Werkbank-Daten** (2026-09-17): `kabeltalisman` (charm, Stufe 4), `blechtalisman` (charm, Stufe 8), `pfandbon` (Verbrauch, Stufe 4); `price` an Brezel 12, Konterwasser 12, Kaltgetränk 28, Currywurst 40, Pfandbon 35; Rezepte in `content/recipes.js`. **Urteil zu `value`:** als *Verkaufs*grundlage taugt `value` (halber Wert, mindestens 1) – er ist bereits die Budget-Ableitung aus `balance.js` und wächst mit Stufe und Qualität. Als *Kauf*preis taugt er nicht: `value` ist bei Verpflegung 3–6, ein Kaufpreis von 12–40 wäre daraus nicht ableitbar, ohne jede Beute mit zu verschieben. Deshalb ein eigenes Feld `price` je Ware, geprüft in `content/checks/loot.js` (ganzzahlig, > halber Verkaufserlös, nur an `kind:consumable`).
- [x] Akt-1-Dorflegenden, Material und Beutefamilien; Bildhinweise für alle Legenden (2026-09-17).
