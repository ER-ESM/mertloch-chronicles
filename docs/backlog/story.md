# Backlog · story

Inbox der Rolle Story-Teller (docs/ROLLEN.md).

## Offen

- [ ] Akt 2 erst nach Auftrag: Haken sind Bastian, die Kiste, die Hochzeit in Koblenz; Gisela/Automat bleiben Reserve.
- [ ] Nach dem nächsten Playtest prüfen, ob die gestrafften Ida-Belohnungen noch alle Pointen tragen (Kapitel 4 ist der Prüfstein).
- [ ] Sprechblasen der Dorfbewohner: Sobald die UI `VILLAGERS.says` zeigt, Zeilen je Kapitel staffeln statt gleichmäßig mischen (heute fünf Zeilen je Bewohner, Akt-1-Bezug).

- [ ] **Zwei Werkbank-Zeilen für Kevin** (Rest aus dem Händler-/Handwerk-Konzept `docs/GAMEPLAY-HAENDLER-HANDWERK.md`, noch nicht freigegeben): z. B. „Gib her. Wird schon halten.“ — kommt, sobald die Werkbank wirklich bedienbar ist.
- [ ] **Oberpraktikant Olaf** (`content/enemies.js`, Elite der Außenbezirke, menschlich): `ENEMY_BARKS` gelten heute nur für Archetypen – wenn Sprüche auch für Eliten kommen sollen, ist Olaf der erste Kandidat („Das ist hier keine Fläche für so etwas.“ / „Ich mache einen Vermerk.“ / „Mein Anleiter kommt gleich.“). Kein Kapitelbezug nötig, er gehört der freien Welt.

- [ ] **`SYSTEM_LINES.lootFull(anzahl)`** (Engine, Welle D 2026-09-17): Auto-Loot sammelt Beute beim Kill automatisch ein; passt etwas nicht mehr in den Rucksack, wandert es nach `rpg.recovery` („Ausrüstung zurückholen“). Gebraucht wird eine Zeile im Wortlaut „Rucksack voll · <n> Fundstücke warten unter Ausrüstung zurückholen.“ – Ton wie `SYSTEM_LINES.buildPlace`. Bis dahin nutzt `rpg.js` einen Rückfalltext im gleichen Wortlaut. Betrifft: `content/dialogues.js` (`SYSTEM_LINES`).

### Aus dem Playtest Akt 1 (docs/PLAYTEST-2026-09-17-AKT1.md)

- [ ] **P12** Ida Kapitel 1: Absatz 4 wiederholt die Summary – Summary bleibt im Auftragsbuch, Dialog ohne Doppelung (UI setzt um, Text prüfen).

## Erledigt

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
