# Backlog · story

Inbox der Rolle Story-Teller (docs/ROLLEN.md).

## Offen

- [ ] **Systemzeile für die Bau-Ortsregel** (Engine, Runde A): `game.build()` baut jetzt nur am Treffpunkt und außerhalb des Kampfes. Gewünscht: `SYSTEM_LINES.buildPlace(gebaeudeName)` in `content/dialogues.js`. Solange sie fehlt, meldet die Engine einen Rückfall im Wortlaut der Clanwechsel-Zeile („… nur am sicheren Treffpunkt, außerhalb eines Kampfes.“).
- [ ] Akt 2 erst nach Auftrag: Haken sind Bastian, die Kiste, die Hochzeit in Koblenz; Gisela/Automat bleiben Reserve.
- [ ] Nach dem nächsten Playtest prüfen, ob die gestrafften Ida-Belohnungen noch alle Pointen tragen (Kapitel 4 ist der Prüfstein).
- [ ] Sprechblasen der Dorfbewohner: Sobald die UI `VILLAGERS.says` zeigt, Zeilen je Kapitel staffeln statt gleichmäßig mischen (heute fünf Zeilen je Bewohner, Akt-1-Bezug).

- [ ] **Kioskkönig Kalle als Händler** (Konzept `docs/GAMEPLAY-HAENDLER-HANDWERK.md`, noch nicht freigegeben): Kalle steht heute nur in `VILLAGERS` (variant 6). Als Händler bräuchte er einen Eintrag in `NPCS` (Rolle „Kiosk · Händler“, faction Dorf, kein Clanmitglied), eine Begrüßung, drei Kaufzeilen und eine Zeile für „zu teuer“. Haltung: hasst den Pfandautomaten, hasst den Bus, liebt Bargeld. Dazu zwei Werkbank-Zeilen für Kevin („Gib her. Wird schon halten.“).
- [ ] **Der Kiosk steht** (Welt 0.21): `world.places.kiosk` gibt es jetzt als Ort im Dorfkern — Vorplatz an einer Dorfkreuzung, Bude mit Tresenfenster, Stehtisch und Wett-Tafel, Anlaufpunkt am Wegenetz. Was fehlt, ist die Figur: Kalle in `NPCS` (siehe Eintrag oben) plus ein, zwei Zeilen, die den Ort tragen (Tafelspruch „Quote gut, Ende schlecht“, Kreisliga-Radio). Für Quoten-Quirin (content/IDEEN-LANDJUNGS.md §2) hat die Welt noch keinen Platz reserviert — sagt Bescheid, wenn er einen zweiten Standplatz am Vorplatz braucht.
- [ ] **Oberpraktikant Olaf** (`content/enemies.js`, Elite der Außenbezirke, menschlich): `ENEMY_BARKS` gelten heute nur für Archetypen – wenn Sprüche auch für Eliten kommen sollen, ist Olaf der erste Kandidat („Das ist hier keine Fläche für so etwas.“ / „Ich mache einen Vermerk.“ / „Mein Anleiter kommt gleich.“). Kein Kapitelbezug nötig, er gehört der freien Welt.


### Aus dem Playtest Akt 1 (docs/PLAYTEST-2026-09-17-AKT1.md)

- [ ] **P10** Text für verdeckte Erinnerung („Noch nicht erinnert.“) in `panel-ui.js`; Überschrift „Erinnerungen“.
- [ ] **P14** Kurz-Glossar in der Hilfe (Randale, Pegel/Glanz/Druck → Eskalation, Kniffe, Klamotten, Pfandmarken) in `PLAY_HELP`.
- [ ] **P12** Ida Kapitel 1: Absatz 4 wiederholt die Summary – Summary bleibt im Auftragsbuch, Dialog ohne Doppelung (UI setzt um, Text prüfen).

### Aus Engine Runde B (2026-09-17)

- [ ] **Abklingzeit-Meldung mit Restzeit** (P8, Playtest Akt 1): `COMBAT_TEXT` in `content/combat.js` hat keine Zeile für „Kniff noch nicht bereit“. Die Engine meldet deshalb einen Rückfall im Wortlaut `<Kniffname> ist noch nicht bereit · 2.4 s.`. Gebraucht wird eine Zeile mit zwei Platzhaltern, z. B. `cooldown:(name,sekunden)=>…`; die Engine nutzt sie automatisch, sobald es sie gibt (`COMBAT_TEXT.cooldown?.(name,rest)`). Hinweis: `content/combat.js` gehört Gameplay – wenn nur der Wortlaut von Story kommt, bitte dorthin weiterreichen.

## Erledigt

- [x] Akt 1 „Filmriss“ komplett (2026-09-17, docs/AKT-1-FILMRISS.md).
- [x] Erinnerungsfetzen für den Trigger `level` (Stufe 5): `naturtalent`, Erzählplatz 5, alle `order` neu durchnummeriert; Prüfung in `content/checks/story.js` ergänzt (2026-09-17).
- [x] Sechs weitere Nebenquest-Vorlagen für Kapitel 3/4 (Kegelbahn, Bus, Clan-Alltag); Pools je Typ acht, Scout im Wechsel Rhythmus/Kabel (2026-09-17).
- [x] `VILLAGERS.says` je Bewohner um zwei Akt-1-Zeilen erweitert (Bus, Shirts, Sigi, Kegelclub) (2026-09-17).
- [x] Ida-Belohnungsdialoge auf höchstens drei kurze Absätze gestrafft (2026-09-17).
