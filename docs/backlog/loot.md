# Backlog · loot

Inbox der Rolle Gegenstände & Loot (docs/ROLLEN.md).

## Offen

- [ ] Ideen aus content/IDEEN-LANDJUNGS.md (Kabelbinder-Gürtel, Diagnose-Dongle, Headset …) erst nach Freigabe der Themen durch den Lead.
- [ ] Verpflegung je Kapitel-Familie prüfen (kegler, jga, sigi, klaus, timo nutzen vorhandene Sorten); eigene Sorte für den Bus (z. B. „Bierbong-Rest“) nur, wenn Gameplay einen Zweck nennt.


- [ ] `dienstmuetze.proc` auf den echten Vermerk-Proc umstellen, sobald die Engine `vulnerable` kann (`docs/backlog/engine.md`).
- [ ] Preise der übrigen Waren, sobald Gameplay den Laden freigibt; heute tragen nur die fünf Kioskwaren ein `price`.


### Welle D · Erweiterte Beschreibungen + benutzbare Gegenstände (Nutzerauftrag)

- [ ] Beschreibungs-Standard (Nutzerauftrag 2026-09-17, E-24 vorgeschlagen): Jedes kampfrelevante Element (Kniff, Talent, Passiv, Stärkung/temporärer Buff, Proc, Dorflegende, Verpflegung, Basisbau-Effekt) trägt `info:{effect, numbers:[{label,value,unit,source}], why, links:[ids], terms:[glossar-ids]}` – `effect` präzise auf das Notwendige, nichts doppelt, keine technischen Details auslassen; `numbers` zeigt genau, was um wie viel steigt (Wert + Einheit + Quelle, z. B. „+12 % Eskalationsschaden“); `why` sagt, wozu es im Kampffluss dient; `links` verweist auf zusammenhängende IDs; `terms` auf Einträge in `content/glossary.js` (`GLOSSARY={id:{name,short,long}}`, Besitzer Klassendesign). Jedes Element hat ein Icon (vorhandene `icon`/Atlas-Zellen; fehlende in ART-BRIEF). UI: Tooltip zeigt `effect`+`numbers`; Shift gedrückt blendet `why`, `links` und die `long`-Erklärung aller `terms` ein.
- [x] `info` für PROCS (items.js), alle Dorflegenden, Verpflegung, Basisbau-Effekte (BUILDING_EFFECTS gehören Gameplay → Bedarf dort), Ausrüstungswertungen (`stats` → numbers mit Umrechnung aus BALANCE, Terms aus glossary).
- [x] Verpflegung: Feld `usable:true` und `slotIcon`; Regel: benutzbare Gegenstände dürfen in die Aktionsleiste (Engine setzt um). Prüfung in checks/loot.js.


### Abnahme Welle D

- [ ] Keine abgeleiteten Zahlen im Handtext `effect`/`why` (Regel siehe docs/backlog/klassen.md); Prüfung in checks/loot.js.
- [ ] Materialien ohne Kampfwirkung bekommen einen kurzen `info.effect` („Baumaterial für …“, links auf Rezepte/Gebäude), damit der Shift-Block nie leer ist.

## Erledigt

- [x] **Welle D: `info` für Gegenstände und Procs, Verpflegung benutzbar** (2026-09-17). Neue Datei `content/item-info.js` (Export in `content/index.js`): `ITEM_INFO` und `PROC_INFO` tragen von Hand nur `effect`/`why`/`links`/`terms`, die `numbers` leitet `describeItem(id)` / `describeProc(id)` aus `items.js` ab (stats, weapon, heal, energy, stack, price, level, proc) und rechnet Wertungen über `BALANCE.ratings` um (`ratingShare`, abnehmender Ertrag `r/(r+k)`, Rüstung zusätzlich über die Stufe). Keine Doppelpflege: Wer eine Zahl ändert, ändert sie weiter in `items.js`/`tuning.js`, der Block zieht nach. Abgedeckt: alle sieben `PROCS`, alle 16 Dorflegenden, die fünf Verpflegungen, die sechs Startteile und die zehn festen Ausrüstungsstücke (37 Gegenstände). Material bleibt bewusst ohne `info` – es hat keine Kampfwirkung. Jeder Gegenstand mit Proc verlinkt seinen Proc, jede Dorflegende trägt den Begriff `dorflegende`. Zusätzlich hängt `item-info.js` den fertigen Block als `d.info` an den Katalog, damit die UI ihn ohne Helferaufruf findet.
- [x] **Verpflegung ist benutzbar** (2026-09-17): `usable:true` an den fünf Kioskwaren; Regel in `content/checks/loot.js` und `tests/content-loot.test.mjs`: jede Verpflegung ist benutzbar, sonst nichts (Ausrüstung und Material werden nicht „benutzt“). Engine/UI dürfen die Aktionsleiste darüber öffnen.
- [x] **Basisbau-Effekte weitergereicht** (2026-09-17): Umrechnungstabelle für alle elf `BUILDING_EFFECTS` in `docs/backlog/gameplay.md` – `buildings.js` gehört Gameplay, Loot liefert nur das Muster aus `item-info.js`.
- [x] **Begriffs-IDs angemeldet** (2026-09-17): neun zusätzliche IDs (`leben`, `autoangriff`, `waffenschaden`, `ausweichen`, `unterbrechen`, `parade`, `markierung`, `pfandmarken`, `dorflegende`) in `docs/backlog/klassen.md`; die Glossarprüfung im Test läuft über `try/catch`-Import und wird scharf, sobald `content/glossary.js` existiert.

- [x] **Set-Boni-Konzept** (2026-09-17): Abschnitt „Set-Boni“ in `EQUIPMENT.md` – Satz **Ruhe 22:01** aus `ruhepfeife` + `praktikantenausweis` + `dienstmuetze`, Boni ohne Primärwerte. Daten erst nach Freigabe durch Gameplay; Engine-Bedarf eingetragen.
- [x] **Beutefamilie `oberpraktikant`** angelegt (2026-09-17): Material `kabelbinder`, Dorflegende `dienstmuetze` (Kopf, Stufe 4, Proc `silence` ersatzweise – Wunsch-Proc „Unterbrechen macht verwundbar“ steht in `docs/backlog/engine.md`), `FOOD_DROPS.oberpraktikant` = `brezel`. Umstellung von `ELITES.oberpraktikant.family` liegt bei Gameplay.
- [x] **Händler/Werkbank-Daten** (2026-09-17): `kabeltalisman` (charm, Stufe 4), `blechtalisman` (charm, Stufe 8), `pfandbon` (Verbrauch, Stufe 4); `price` an Brezel 12, Konterwasser 12, Kaltgetränk 28, Currywurst 40, Pfandbon 35; Rezepte in `content/recipes.js`. **Urteil zu `value`:** als *Verkaufs*grundlage taugt `value` (halber Wert, mindestens 1) – er ist bereits die Budget-Ableitung aus `balance.js` und wächst mit Stufe und Qualität. Als *Kauf*preis taugt er nicht: `value` ist bei Verpflegung 3–6, ein Kaufpreis von 12–40 wäre daraus nicht ableitbar, ohne jede Beute mit zu verschieben. Deshalb ein eigenes Feld `price` je Ware, geprüft in `content/checks/loot.js` (ganzzahlig, > halber Verkaufserlös, nur an `kind:consumable`).
- [x] Akt-1-Dorflegenden, Material und Beutefamilien; Bildhinweise für alle Legenden (2026-09-17).
