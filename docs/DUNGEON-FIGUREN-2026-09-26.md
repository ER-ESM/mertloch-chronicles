# Dungeon-Figuren „Schloss Big B“ · Freigabe und Livegang 2026-09-26

**Status: live seit Build #⟨BUILD⟩ (2026-09-26), standardmäßig an.** Notschalter: URL `?dungeon-figuren=0` oder
`localStorage['mertloch-dungeon-figuren']='0'` (zurück auf die Platzhalter). Entwurf, Runden 1–4 und Technik:
`docs/DUNGEON-FIGUREN-ENTWURF-2026-09-26.md`; Werkzeug: `docs/ANZIEHPUPPE.md`, Abschnitt „Sonderbögen und Motive“.

- **Galerie:** `D:\Dev\_prototypen\dungeon-figuren-2026-09-26\galerie.html` (Stempel „LIVE“, neuer Abschnitt „Seit der Freigabe“ mit
  Freigabe ↔ jetzt, Vergleich vorher im Spiel ↔ jetzt live).
- **Prüfen:** `CDP_PORT=9730 SERVER_PORT=4530 node scripts/dungeon-figuren-check.mjs` (Teil 0 Standard an, Teil 3 Notschalter,
  Teile 4/5 Vergleich, Teile 6/7 Bildrate an/aus) und `tests/dungeon-figuren.test.mjs`.

## Freigabe

Der Nutzer hat den Entwurf freigegeben („Alles so umsetzen“) mit vier Entscheidungen:

1. **Big B** drahtig (Kevin) statt kräftig: ein kleiner Mann im viel zu großen Pelz; Saum am Boden, Ärmel über den Händen; Sonderposen mit dem
   neuen Körper. Das Fell las sich wie Kork: eigene Boss-Version, die Heldenversion der Legende bleibt unverändert. Pelz, Perücke, Pappkrone
   und Selfie-Stick bleiben.
2. **Das halbe Pferd** als brauner Fuchs statt Schimmel, auch in der Beschreibung im Spiel. Huckepack später.
3. **Nachbessern:** Korken-Kurt (Schürze steif, Korkenzieher grau auf grau) und der Anzug des Makler-Praktikanten.
4. Codex-Köpfe für Bosse später, nicht in dieser Runde.

## Runde 5 (Freigabe umgesetzt)

- **Big B:** Archetyp Kevin, neue Quelle `pelzmantel-baron-boss` (Glocke bis zum Boden, staucht sich dort; Ärmel mit Hermelinstulpe über
  der Hand; ausladende Schultern; Leihzettel). `pelzmantel-baron` der Legende ist byte-gleich.
- **Halbes Pferd:** Farbtreppe `dgFuchs` (Fell), Mähne dunkelbraun, weiße Blesse und Fesseln; `content/dungeons.js` („Vorderhälfte eines
  Fuchses“), Reittier `content/mounts.js` braun.
- **Korken-Kurt:** Schürze mit Falten, eigener Boss-Korkenzieher `korkenzieher-boss` (die Legende `korkenzieher-kellermeister` bleibt).
- **Makler-Praktikant:** kastige 80er-Schultern, zweireihig, Ärmel über den Fingern, weißer Kragen, neongrüne Krawatte mit Einstecktuch.
- **Schalter:** standardmäßig an, Notschalter bleibt (`dungeonFigurenSchalter` in `dungeon-figuren-art.js`, Test und Prüfskript Teil 0/3).
- **Werkzeug:** Das Aufräumen der Sonderbögen traf per Präfix auch `pelzmantel-baron-boss-…`, wenn `pelzmantel-baron` wegfiel; jetzt nur
  genau die eigenen Dateien.

## Runde 6 (nach dem Blindgutachten)

Das Blindgutachten nach Runde 5 (Freigabe-Stand gegen Runde 5, Reihenfolge zufällig) fand drei Rückschritte bzw. Restmängel: Big B las sich als
Dame im Kleid (glattes Gesicht, violette Mittelbahn), Kurts neuer Korkenzieher war in Weltgröße unsichtbar (kleines braunes Ding auf Grün,
Note schlechter als vorher), der Schürzensaum wirkte wie ein Zackenrock. Umgesetzt:

- **Big B:** Kinnbart statt Schnauzer; Mantel vorn offen über dunklem Wams, Hose und Reitstiefel, Futter nur als Kante (kein Kleid mehr);
  Fellbahnen (Nähte wie beim echten Pelzmantel) und gröbere Strähnen statt Körnung; Ringlicht am Selfie-Stick breiter, Handy kleiner.
- **Korken-Kurt:** Korkenzieher nach außen gehalten wie ein Kellnermesser: Griff aus dunklem Holz mit Messingknäufen, helle Spirale mit
  dunklen Gängen, heller Korken mit Weinrand (Farbtreppe `dgKork`); Schürze bis übers Schienbein, nur vorn (Hose an den Seiten sichtbar),
  drei ungleiche Falten statt Plissee, weicher Saum.
- **Halbes Pferd:** Fuchs rotbrauner statt kürbisorange.

### Noten der Blindgutachten (1–10, Unter-Agent, nur Bilder, Fassungen anonym)

| Figur | Freigabe-Stand | Runde 5 | Runde 6 |
|---|---|---|---|
| Big B | 5 / 5 | 6 | 6 |
| Das halbe Pferd | 6 / 5,5 | 7 | 7 |
| Korken-Kurt | 6 / 5,5 | 5,5 (Rückschritt) | 6,5 |
| Makler-Praktikant | 5,5 | 5,5–6 | – (nicht geändert) |

Zwei Gutachten mit frischem Unter-Agenten: nach Runde 5 (vier Figuren) und nach Runde 6 (drei Figuren), jeweils Freigabe-Stand gegen neuen
Stand. Wo zwei Werte stehen, hat der Freigabe-Stand in den beiden Gutachten unterschiedlich abgeschnitten. Kurts letzte Nachbesserung
(dunkler Griff, Schürze nur vorn, drei Falten) kam nach dem zweiten Gutachten und ist nicht erneut benotet.

**Restmängel laut Gutachten:** Big B: Gesicht weich (der Kinnbart ist in Weltgröße klein), Fell eher Kord/Rinde als Pelz, Rückansicht ein
flacher Block. Pferd: „halb“ liest sich nur von hinten, Rumpf ohne Kostümdetails. Kurt: Hauttöne flach, Gesicht generisch. Makler: „zu groß“
kaum sichtbar, Sandgrau auf Sandgrau. Alles davon ist Feinschliff; die Codex-Köpfe (Punkt 4) würden die Gesichter lösen.

## Prüfungen (paarweise, Worktree `D:\Dev\MertlochChronicles-dg-figuren`, Ports 9730–9737 / 4530–4537)

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 1315/1315 grün |
| `npm run content:check` | grün (57 Tests) |
| `npm run build` | grün |
| `npm run ui:check` | grün |
| `dungeon-figuren-check` | 33 PASS (Standard an, Notschalter, Bosse mit Ansagen, Vergleich, Bildrate) |
| `dungeon-check` | desktop + phone grün |
| `dungeon-e4a-check` | 36 PASS |
| `dungeon-e4b-check` | 11 PASS |
| `dungeon-fix5-check` | 13 PASS (ein Lauf davor rot bei „Kampf aufgeben“: Klick unter Last nicht angekommen; Wiederholung grün) |
| `dungeon-aktiv-check` | 4 PASS |
| `dungeon-fix6-check` | 8 PASS (ein Lauf davor rot bei einem Tooltip 0,9 s nach dem Tod; Wiederholung parallel mit `origin/main`: beide grün) |
| `mobile-check` (`MOBILE_PART=dungeon`) | grün, keine Laufzeitfehler |
| `dungeon-raeume-check` | Teile 1–5 PASS, Teil 6 A/B gegen `origin/main` grün (Bildabstand nicht schlechter), Teil 7 Bilder |

## Zeichenzeit (A/B gegen `origin/main`, `dungeon-raeume-check` Teil 6)

Gleiche Sitzung, zwei Browser (CDP 9630/9636), abwechselnd gemessen, die jeweils andere Seite eingefroren: **live** = dieser Stand mit
Figuren, **main** = `origin/main` mit den Platzhaltern (zweiter Server aus einem Worktree auf `origin/main`). Zeichenzeit je Bild
(`renderer.draw`), Median / p90 in ms, 3,2 s je Messung, kopfloses Chrome ohne Grafikkarte unter Last:

| Ebene | Dichte 2: live · main | Dichte 3: live · main | Dichte 4: live · main |
|---|---|---|---|
| Welt am Eingang | 1,6/2,6 · 2,0/6,6 | 1,8/2,7 · 1,6/3,6 | 5,5/7,3 · 6,4/25,5 |
| e0 (Burghof, Trash) | 3,2/5,9 · 2,7/3,9 | 2,9/4,4 · 3,0/4,8 | 3,4/5,7 · 8,9/11,3 |
| k1 | 2,3/3,2 · 4,8/5,8 | 2,9/4,9 · 5,7/7,4 | 2,8/4,1 · 11,1/14,1 |
| k2 (Keller) | 3,6/5,1 · 6,0/8,0 | 2,9/4,8 · 7,5/10,0 | 3,0/4,5 · 13,5/16,9 |

Die Puppenfiguren zeichnen sich billiger als die Platzhalter (die Platzhalter werden je Bild aus vielen Formen gemalt, die Figuren sind wenige
fertige Bögen); nur der Burghof bei Dichte 2 liegt 0,5 ms darüber. Bildabstand (Median) überall gleich oder besser (16,7 ms bzw. bei Dichte 4
33,3 ms, main teils 33,4 ms). Messwerte: `visual-review/dungeon-raeume/nachher/bildzeit.json` (lokal).

**Bildrate** (`dungeon-figuren-check` Teile 6/7, gleiche Sitzung, Notschalter aus/an, Rechner unter Last):

| Ort | Figuren aus (Platzhalter) | Figuren an |
|---|---|---|
| Burghof (Trash, Pappwachen) | 46–60 FPS, Median 16,7 ms | 51–60 FPS, Median 16,7 ms |
| Weinkeller (16 Ratten, Trash) | 14–37 FPS, Median 33–67 ms | 36–39 FPS, Median 16,7 ms |

Drei Läufe; die Spannen kommen von der Rechnerlast (parallele Prüfungen). Mit Figuren nie schlechter als ohne.

## Größe

- **Server:** `assets/paperdoll/runtime` 13,4 MB (1984 Dateien) → 24,7 MB (3170 Dateien). Davon Boss-Pelz 1,5 MB (28 Bögen, Fell lässt sich
  schlecht packen), Sonderbögen 3,2 MB (332), Motive 61 KB.
- **Ganzer Dungeon** (alle Figuren, je ihr Archetyp, vier Richtungen, geteilte Bögen einmal): 912 Dateien, 7,5 MB (Grundbögen 1,6 MB) plus
  Motive: rund 6 s bei 10 Mbit/s, 1,3 s bei 50 Mbit/s, verteilt auf den Durchgang. Big B allein 1,3 MB (106 Dateien).
- Offline-Cache: Puppenbögen wie bisher optional (`precache-manifest.js`).

## Offene Punkte

- **Codex-Köpfe** für die Bosse (Freigabe Punkt 4, nach dem Reset): lösen die weichen, gleichen Gesichter.
- **Huckepack** fürs halbe Pferd (Vorschlag im Entwurfsbericht), später.
- **Fell:** besser als vorher, aber noch kein echter Pelz; Rückansicht des Mantels schlicht.
- **Makler-Praktikant:** „eine Nummer zu groß“ in Weltgröße kaum zu sehen; Anzug hebt sich wenig vom Sandstein ab.
- **Söldner-Namensschilder** über dem Boss im Kampf (kein Figurenthema, aus dem ersten Gutachten).
- **Weinkeller-Bildrate** unter Last (schon ohne Figuren).
