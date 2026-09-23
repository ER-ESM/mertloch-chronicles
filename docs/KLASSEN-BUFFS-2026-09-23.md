# Klassen-Buffs (Entwurf, 23.09.2026)

**Nutzerauftrag.** „Den Helden fehlen außerdem noch dauerhafte Buffs. So kommt etwas Klasseneigenes mit. z. B. Dosen-Dieter hat einen Lebensbuff für 30 Minuten, den er an sich und andere Charaktere casten kann. Mache dir Gedanken, jeder Char sollte 2 Buffs mitbringen, je nach Talent später auch mehr oder durch Talente verstärkt.“

Dieses Dokument ist ein Entwurf der Rolle Klassendesign/Gameplay/Balancing. `docs/ENTSCHEIDUNGEN.md` bleibt unverändert; die Übernahme als Entscheidung macht der Lead.

## Grundidee

- **Zwei Buffs je Klasse.** Jeder Buff hebt einen **anderen** Wert, Aperol-Spritz hebt zwei kleine. Deshalb wirken Buffs verschiedener Klassen in einer Gruppe zusammen (wie Raid-Buffs).
- **Derselbe Buff stapelt nicht.** Je Buff-ID gibt es auf einem Träger genau einen Eintrag: Der stärkere gewinnt, bei gleicher Stärke erneuert der neuere die Dauer.
- **30 Minuten, kostenlos, nur globale Abklingzeit.** Man zaubert die Buffs einmal vor dem Losziehen. Im Kampf kosten sie nur die globale Abklingzeit, es gibt keine eigene Abklingzeit und keine Randale-Kosten.
- **Ziel.** Zuerst ein ausgewählter Söldner oder das Söldner-Hilfsziel. Dann ein ausgewähltes Gruppenmitglied oder das Hilfsziel (E-44). Ohne freundliches Ziel landet der Buff auf dem Zaubernden. Fremde Spieler außerhalb der Gruppe sind kein Ziel. Die Reichweite ist dieselbe wie bei Heilung und Stärkung auf das Hilfsziel (420 Einheiten, `COMPANION_RULES.aidRange` bzw. `SOCIAL_RANGE.aid`).
- **Laufzeit.** Die Restzeit läuft auch in der Kiosk-Instanz und auf anderen Stockwerken weiter. Der Buff steht im Spielstand (Restzeit, Stärke, Quelle) und **endet beim Tod nicht**. Begründung: Das Dorf soll nach einem Tod nicht erst wieder Buffs verteilen müssen. Der Tod kostet schon Laufweg und Kampfstand. Offline steht die Zeit still, weil die Restzeit gespeichert wird und keine Uhrzeit.

## Die sechs Buffs

Die Zahlen stehen in `content/tuning.js` (`TUNING.classBuffs`, jeweils mit `why`/`since`), der Rahmen in `CLASS_BUFF_TUNING`.

| Klasse | Buff (ID) | Lernstufe | Wirkung | Icon |
|---|---|---|---|---|
| Dosen-Dieter | Dosenpfand (`dosenpfand`) | 4 | +8 % maximales Leben; das zusätzliche Leben kommt sofort dazu | `can` |
| Dosen-Dieter | Kutte drüber (`kutteDrueber`) | 8 | +5 Prozentpunkte Schadensminderung (über der Kappe der Dicken Haut) | `vest` |
| Aperol-Anni | Aperol-Spritz (`aperolSpritz`) | 4 | +0,3 Randale/s und +8 % erhaltene Heilung | `cup` |
| Aperol-Anni | Vorher-Nachher-Filter (`vorherNachher`) | 8 | +5 % Tempo (Autoangriff, Abklingzeiten, globale Abklingzeit) | `anni-spray` |
| Klo-Kevin | Kabelbinder-Sohlen (`kabelbinderSohlen`) | 4 | +10 % Laufgeschwindigkeit zu Fuß (auf dem Reittier zählt dessen Tempo) | `boots` |
| Klo-Kevin | Pfandradar (`pfandradar`) | 8 | +4 Prozentpunkte Glückstreffer-Chance (über der Kappe) | `bottle` |

Rahmen (`CLASS_BUFF_TUNING`): Dauer 1800 s · Verstärkung je Talentstufe +50 % (`talentStep: .5`) · höchste Stärke beim Empfang 2,0 (`maxPower`, Schutz gegen manipulierte Netznachrichten).

Die Texte folgen dem Ton aus `docs/AKT-1-FILMRISS.md` §2: erst die Behauptung, dann der Nachsatz, der sie kaputt macht. Beispiel: „Zwei Kabelbinder pro Schuh, straff gezogen: 10 % schneller zu Fuß für 30 Minuten. TÜV-geprüft ist daran nichts. Aber es quietscht motivierend.“ Die Zahlen in den Texten werden aus `tuning.js` eingesetzt und sind nicht von Hand gepflegt.

### Warum diese Werte

- **Leben und Schadensminderung** (Dieter): Das sind Tank-Werte, sie helfen aber jeder Klasse und jedem Söldner. Sie bringen keinen Schaden und verschieben deshalb den Boss-Korridor nicht.
- **Randale-Regeneration und erhaltene Heilung** (Anni): Beides allein wäre kaum spürbar, deshalb zwei kleine Hebel. Erhaltene Heilung wirkt auf jede Heilung, die beim Ziel ankommt, auch auf fremde (Söldner-Heiler, Gruppenheilung).
- **Tempo** (Anni): Das ist das stärkste Schadenspaket der sechs, deshalb liegt es am unteren Rand (5 %).
- **Laufgeschwindigkeit und Glückstreffer** (Kevin): Der eine ist ein Alltagswert ohne Kampfwirkung, deshalb am oberen Rand (10 %). Der andere ergänzt Tempo, statt es zu verdoppeln; Glückstreffer lösen viele Talent-Procs aus.

## Talent-Haken

Der Effektschlüssel `classBuff:<id>` in einem Talent gibt die Anzahl der Verstärkungsstufen an. Die Stärke beim Zaubern ist `1 + Stufen × talentStep`. Das Schema lässt nur Buffs der eigenen Klasse zu. `content/checks/klassen.js` prüft, dass der Talenttext Buffnamen und Prozentzahl nennt und dass jede Klasse mindestens ein solches Talent hat.

Umgesetzt wurde je Klasse ein Talent. Bestehende Talent-IDs bleiben unverändert; der Effekt kommt zu einem Talent dazu, das keine Rangkurve hat:

| Talent | Spec | neuer Effekt | Text-Zusatz |
|---|---|---|---|
| `dieter-wall-10` Leergut stapeln | Türsteher | `classBuff:dosenpfand: 1` | „Dein Dosenpfand wirkt 50 % stärker.“ |
| `baerbel-care-3` Ein Schluck, ein Plan | Landhaus-Lazarett | `classBuff:aperolSpritz: 1` | „Dein Aperol-Spritz wirkt 50 % stärker.“ |
| `kevin-hunt-27` Glücksrausch | Pfandjäger | `classBuff:pfandradar: 1` | „Dein Pfandradar wirkt 50 % stärker.“ |

Das `info.effect` dieser drei Talente blieb unverändert. Der E32-Talent-Bildkatalog (`assets/content-art/e32/runtime/catalog.json`) speichert es wörtlich, und eine Änderung hätte einen Neubau der Grafik verlangt. Der Hinweis steht deshalb in `text` und `info.why`.

**Dritter Buff über ein Talent (vorbereitet, noch ohne Inhalt):** Eine weitere Definition in `content/class-buffs.js` mit `talent:'<spec>-<index>'` genügt. `clan.js` setzt dann `talent`/`spec` am Kniff, und `available()` schaltet ihn erst frei, wenn das Talent gelernt ist (derselbe Weg wie bei Talentkniffen).

## Technik (wo was steht)

| Teil | Datei |
|---|---|
| Definitionen, Texte, Glossarbegriff `klassenbuff`, Oberflächentexte | `content/class-buffs.js` (Export über `content/index.js`) |
| Zahlen | `content/tuning.js` → `TUNING.classBuffs`, `CLASS_BUFF_TUNING` |
| Laufzeit: Anwenden, Stapeln, Ticken, Speichern, Ziel wählen, Netz empfangen, Buffleiste | `class-buffs.js` |
| Kniffe (Kniffe-Menü, Leiste) | `clan.js` `skillsFor` (`classBuff:true`, `cd 0`, `cost 0`); Lernstufe über `progression.js` `skillLevel` |
| Wirkung | `rpg.js` `combatStats` (Tempo, Glückstreffer, Schadensminderung, Randale, `healthPct`, `healTaken`), `refreshEquipment` (max. Leben), `class-mechanics.js` `healPlayer` (erhaltene Heilung), `movement.js` (Laufgeschwindigkeit), `engine.js` `receiveAid` (Heilung von Gruppenmitgliedern) |
| Söldner | `companions.js`: Leben (`refreshStats`), Schadensminderung (`hitCompanion`), Glückstreffer, Tempo (Abklingzeiten/Pause), Laufgeschwindigkeit, erhaltene Heilung, Speichern (`savedCompanions`) |
| Engine | `engine.js`: `action()` Zweig `s.classBuff`, `tick()` (vor dem Kiosk-Rücksprung), `save()`/Konstruktor, `gainXp` (Buffs werden **nicht** automatisch auf die Leiste gelegt, damit sie keine Kampfkniffe verdrängen) |
| Netz | `net-social.js` `hooks.classBuffTo` → `{t:'aid',to,name,cb:{id,power,duration}}`; Server `server/game/social-play.mjs` `aid()` reicht `cb` gestutzt weiter (Stärke ≤ 2, Dauer ≤ 1800 s); der Empfänger prüft die ID selbst (`receiveClassBuff`) |
| Oberfläche | `auras.js` (Buffleiste), `aura-ui.js` (Restzeit ab 60 s in Minuten „30m“, Tooltip „von Eddi (Dosen-Dieter)“ nur bei fremden Buffs), `skill-art.js` (Icon aus dem Gegenstands-Icon, `skillIconKey`), `combat-ui.js` (Tooltip „Nur globale Abklingzeit“), `describe-ui.js`/`describe.js`/`content/glossary.js`/`content/categories.js` (Beschreibungsart `classBuff`, Kniffe-Referenz, laufende Buffs), `combat-fx.js` (Bild der Stärkung am Ziel) |

**Warum der Kanal `aid` und nicht `buff`:** `{t:'buff'}` ist ein Rundruf an alle Gruppenmitglieder in Reichweite, und der Server kappt ihn auf 60 s. Ein Klassen-Buff geht aber gezielt an eine Person. Der `aid`-Kanal (Hilfsziel, E-44) ist schon adressiert, prüft Reichweite und Gruppenzugehörigkeit und brauchte nur das zusätzliche Feld `cb`.

## Prüfung

- `tests/class-buffs.test.mjs`, 10 Tests:
  - Inhalt ist gültig, jeder Wert kommt nur einmal vor.
  - Kniffe-Menü, Lernstufe, auf die Leiste legbar, kostenlos mit globaler Abklingzeit.
  - Wirkung aller sieben Werte.
  - Stapelregeln.
  - Ablauf, Tod und Wiederbeleben.
  - Speichern und Laden.
  - Zauber auf den Söldner, samt Speichern.
  - Talentverstärkung aller drei Klassen.
  - Netz: Senden, Server-Relais mit Stutzen, Empfang mit Quelle.
  - Buffleiste ohne doppelte Einträge.
- `scripts/class-buffs-check.mjs` (Browser, 2024×900, Port 9433/4233), Screenshots unter `visual-review/class-buffs/`. Je Klasse wird geprüft:
  - beide Buffs im Kniffe-Menü (gelernt, ziehbar, mit Icon);
  - Zaubern auf sich selbst, die Buffleiste zeigt „30m“;
  - der Tooltip des eigenen Buffs hat keine Quelle;
  - ein fremder Buff über `receiveAid` zeigt „von Eddi (Klasse)“;
  - die Restzeit läuft, und die Buffs stehen im Spielstand.
- **Balance-Sheet mit Klassen-Buffs:** `node scripts/balance-sheet.mjs --buffs` misst dieselben 576 Zellen mit allen sechs Buffs (volle Gruppe, ohne Talentverstärkung) und schreibt nach `generated/balance-sheet-buffs.*`. `content/BALANCE-SHEET.md` bleibt der Messweg ohne Buffs. Ergebnis (Stufe 10–30, alle Pfade und Ausrüstungen):
  - 145 statt 156 Zellen mit ⚑ (mehr als 15 % neben dem Median ihrer Rolle).
  - Schaden je Spec +4 bis +7 %.
  - Die Lage zum Median der eigenen Rolle verschiebt sich um höchstens 1,6 Punkte.
  - Heiler-Kennzahl +12 bis +15 %, weil „erhaltene Heilung“ auch die eigene Selbstheilung verstärkt.
  - Tank-Kennzahl ±1 %: Die Kutte senkt den Schaden, dafür verbraucht sich weniger Deckung.
  - Die Buffs werfen den Messweg nicht aus dem Korridor.

## Offene Punkte

1. **Rahmen des Söldners und des Gruppenmitglieds:** Buffs auf Söldnern wirken und stehen im Spielstand, sind aber noch nirgends sichtbar (Söldnerrahmen und Zielrahmen haben keine Buffleiste). Vorschlag an die UI: kleine Buff-Symbole im Söldner- und Gruppenrahmen.
2. **Eigene Icons:** Die Buffs nutzen vorerst die Gegenstands-Icons (Dose, Kutte, Glas, Sprühflasche, Stiefel, Flasche). Eigene Kniff-Grafiken gehören in `content/ART-BRIEF.md` bzw. `docs/GRAFIK-BEDARF.md`; `skill-art.js` nimmt eine gelieferte `skill-<klasse>-<id>` automatisch vor dem Rückfall.
3. **Nur je ein Talent je Klasse verstärkt einen Buff.** Kneipenschläger, Zapfmeister, Putzpyramide, Filter-Furie, Zündmeister und Schrottkoloss haben noch keinen Haken. Ein dritter, talentgebundener Buff ist technisch vorbereitet, aber noch nicht gebaut.
4. **Offline-Zeit:** Die Restzeit steht offline still. Soll ein Buff auch offline ablaufen (Echtzeit), bräuchte der Spielstand einen Zeitstempel.
5. **Auto-Leiste:** Neu gelernte Klassen-Buffs landen bewusst nicht von selbst auf der Aktionsleiste. Sobald die zweite Leiste (paralleler Umbau) steht, wäre sie ein guter Standardplatz dafür.
6. **Rundruf-Variante:** Ein „für alle in der Nähe“-Modus über den `buff`-Kanal (Server-Kappe 60 s müsste für Klassen-Buffs fallen) ist bewusst nicht gebaut: Der Nutzer wünscht „an sich und andere Charaktere casten“, also gezielt.
7. **Schadensminderung und Glückstreffer über der Kappe:** Die Buffs zählen nach der Kappe (`R.armor.cap`, `R.crit.cap`), damit sie auch bei voller Ausrüstung wirken. Balancing sollte das bei künftigen Kappen mitdenken.
