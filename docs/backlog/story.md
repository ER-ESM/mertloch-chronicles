# Backlog · story

Inbox der Rolle Story-Teller (docs/ROLLEN.md).

## Offen

- [ ] **Dungeon „Schloss Big B"** (wartet auf V-D1 bis V-D8): Sprüche der Bosse, Raumschilder mit Wirklichkeit, Aufträge, Einschreiben, Mentor-Zeilen, Geständnis; E-20-Prüfung, dass „Big B" keine reale Person erkennbar macht. Entwürfe: [DUNGEON-SCHLOSS-BIG-B-2026-09-23.md](../DUNGEON-SCHLOSS-BIG-B-2026-09-23.md) Abschnitte 6 und 11.
- [ ] **Hilfetext „Ein Buch, sieben Reiter"** (UI, 2026-09-17, E-27): PLAY_HELP (Abschnitt Clanbuch) nennt sieben Reiter und die Tasten C I K J B M H. Neu: vier Reiter Figur/Rucksack/Aufträge/Karte plus Hilfe; K, N, B springen zu den Abschnitten Kniffe, Talente, Bude. Abnahme: Hilfe → Tasten zeigt die neue Zeile.

- [ ] Akt 2 erst nach Auftrag: Haken sind Bastian, die Kiste, die Hochzeit in Koblenz; Gisela/Automat bleiben Reserve.
- [ ] Nach dem nächsten Playtest prüfen, ob die gestrafften Ida-Belohnungen noch alle Pointen tragen (Kapitel 4 ist der Prüfstein).
- [ ] Sprechblasen der Dorfbewohner: Sobald die UI `VILLAGERS.says` zeigt, Zeilen je Kapitel staffeln statt gleichmäßig mischen (heute fünf Zeilen je Bewohner, Akt-1-Bezug).

- [ ] **Zwei Werkbank-Zeilen für Kevin** (Rest aus dem Händler-/Handwerk-Konzept `docs/GAMEPLAY-HAENDLER-HANDWERK.md`, noch nicht freigegeben): z. B. „Gib her. Wird schon halten.“ — kommt, sobald die Werkbank wirklich bedienbar ist.


### Aus dem Playtest Akt 1 (docs/PLAYTEST-2026-09-17-AKT1.md)


## Erledigt

- [x] **`SYSTEM_LINES.lootFull(n)`** im geforderten Wortlaut in `content/dialogues.js`; dazu `SYSTEM_LINES.autoLoot(name,count)` als kurzer Toast je Beute (Nutzung in `rpg.js`/Beutelog im Engine-Backlog vermerkt) (2026-09-17).
- [x] **Autoangriff-Regel in allen eigenen Texten**: 1 schaltet ein, Esc schaltet aus — Hofprobe-Schritt `attack` (`content/tutorial.js`), `PLAY_HELP` Kämpfen + Tastenliste (`content/panel-ui.js`). Der feste Starthinweis in `app.js` und ein Aus-Weg auf Touch liegen im UI-Backlog (2026-09-17).
- [x] **Hilfe-Abschnitt „Rucksack & Beute“** in `PLAY_HELP` für Desktop und Touch: Shift bzw. „Mehr dazu“ am Tooltip, Verpflegung aus dem Rucksack auf die Leiste ziehen, Auto-Loot ins Beutelog, voller Rucksack → „Ausrüstung zurückholen“ (2026-09-17).
- [x] **`ENEMY_BARKS.oberpraktikant`** — vier Zeilen für Olaf (`content/dialogues.js`); die Schema-Prüfung lässt Sprüche für menschliche **Eliten** jetzt zu (`content/schema.js`) (2026-09-17).
- [x] **P12** geprüft: Idas Kapitel-1-Zeilen bleiben, die Doppelung kam aus der UI — `chapter-ui.js` zeigt `chapter.summary` nur noch, wenn der Dialog keine `lines` hat. Kein Textwechsel nötig (2026-09-17).

- [x] `PANEL_UI.memoryHidden` gesetzt („Noch nichts. Da ist nur Rauschen und ein pelziger Nachgeschmack.“); Überschrift `tabMemories` steht auf „Erinnerungen“ (P10, 2026-09-17).
- [x] **P14** Kurz-Glossar „Wörter im Dorf“ in `PLAY_HELP` für Desktop und Touch: Randale, Pegel/Glanz/Druck, Kniffe, Klamotten, Pfandmarken — je ein Satz (2026-09-17).
- [x] Hilfezeile „Klick auf den Auftragskasten läuft zur Wegmarke“ in `PLAY_HELP` (Desktop und Touch) (2026-09-17).
- [x] `SYSTEM_LINES.buildPlace(name)` in `content/dialogues.js` — Bau nur an der Bude, außerhalb des Kampfes (2026-09-17).
- [x] Kioskkönig Kalle als NPC `kalle` (Händler, `place:'kiosk'`, `home:'Pfandhof'` bis Welt „Kalles Kiosk“ in `HUBS` aufnimmt) mit `look` und `HUB_TALK.kalle` (greet, Kapitel 1–4, `done`, `tooExpensive`); in `VILLAGERS` bleibt er unverändert stehen (2026-09-17).
- [x] Wortlaut für `COMBAT_TEXT.underAttack` und `COMBAT_TEXT.cooldown(name,s)` an Gameplay weitergereicht (docs/backlog/gameplay.md), da `content/combat.js` Gameplay gehört (2026-09-17).
- [x] Bedarf an Welt gemeldet: Treffpunkt „Kalles Kiosk“ in `HUBS` und zweiter Standplatz am Vorplatz für Quoten-Quirin (docs/backlog/welt.md, 2026-09-17).

- [x] Akt 1 „Filmriss“ komplett (2026-09-17, docs/AKT-1-FILMRISS.md).
- [x] Erinnerungsfetzen für den Trigger `level` (Stufe 5): `naturtalent`, Erzählplatz 5, alle `order` neu durchnummeriert; Prüfung in `content/checks/story.js` ergänzt (2026-09-17).
- [x] Sechs weitere Nebenquest-Vorlagen für Kapitel 3/4 (Kegelbahn, Bus, Clan-Alltag); Pools je Typ acht, Scout im Wechsel Rhythmus/Kabel (2026-09-17).
- [x] `VILLAGERS.says` je Bewohner um zwei Akt-1-Zeilen erweitert (Bus, Shirts, Sigi, Kegelclub) (2026-09-17).
- [x] Ida-Belohnungsdialoge auf höchstens drei kurze Absätze gestrafft (2026-09-17).

## Von UI · 2026-09-17 (Stil C „Bierdeckel")

- [ ] **Wortlaut für den getragenen Zustand in der Klamottenwahl.** Die Karte der gerade getragenen Figur zeigt statt eines ausgegrauten Knopfes einen schrägen Stempel (UI-ABNAHME A4). Dort steht heute der vorhandene Text `Ist am Start`. Gewünscht ist ein kurzer Stempeltext je Geschlecht, z. B. „Trägt er gerade" / „Trägt sie gerade", als `PANEL_UI.wornStamp` (oder je Figur in `CLAN_MEMBERS`). Bis dahin bleibt `Ist am Start`.
