# Dungeon „Schloss Big B“ · Feinschliff · 2026-09-26

Grundlage:
- Restliste aus `docs/DUNGEON-ETAPPE-4B-2026-09-25.md` und `docs/DUNGEON-ETAPPE-4A-2026-09-25.md`
- `docs/DUNGEON-HOTFIX-2026-09-25.md`, Etappen 1 und 2
- `scripts/dungeon-sim.mjs`

Zweig `dungeon-feinschliff`, Worktree `D:\Dev\MertlochChronicles-dg-fein`, rebased auf `main` 0ea813d1 (E-72 Runde 5).

Nicht angefasst:
- Balance der Bosse außer Rita
- Händlerpreise
- E-72
- Figurengrafik

## Kurzfassung

- **Rita hängt nicht mehr.** Der Greenscreen hat einen klaren Ausweg: Spätestens 2 s nach seinem Ende ist sie sichtbar und angreifbar, egal wo sie oder ihr Ziel stehen.
  - Im Flügel dauert Rita mit allen fünf Klassen 78–85 s, vorher bis 231 s.
  - Kevin allein zeigte vorher wie im 4B-Bericht einen Dauerhänger bei 4 %.
- **Boss und Trash ziehen sich nicht mehr gegenseitig mit.**
  - Trash bemerkt niemanden in einer Arena mit lebendem Boss.
  - Ein Boss bemerkt niemanden, solange Trash mit der Gruppe kämpft.
  - Flächenschaden weckt keinen Boss.
  - Fällt die Tür zu, lässt Trash draußen ab.
  - Kein Trash streift in eine Arena.
  - Schorsch im Burghof: vorher 14,2–15,1 min mit Gerd im Pack-Kampf, jetzt 11,9 min.
- **Ratten kommen nach Hause.** Die Wegsuche startete nicht, wenn ein Gegner 5–6 Einheiten vor einer Wand stand. Im Dungeon hat der Rückweg jetzt dazu eine Frist von 8 s.
- **Wichtigster Fund: Die Flügelzeiten waren seit 4B um etwa 2 min je Flügel zu hoch gemessen.** Es ist derselbe Wegsuche-Fehler wie bei den Ratten.
  - Von 6 der 32 Haltepunkte fand die Simulation keinen Weg und rechnete pauschal 60 s.
  - Ehrlich gemessen lagen die Flügel bei 7–10 min.
  - Deshalb gibt es mehr Trash, aber nur Gruppen ohne Funkspruch.
  - Die Trash-EP im Dungeon sind ×0,68 (Entscheidung Orchestrator).
  - Jetzt liegen alle 15 Flügelwerte im Band 10–15 min, und alle Kriterien der Simulation sind grün.
- **Journal-Prüfung:** Sie prüft jetzt das gewollte Verhalten.
  - Der seltene Platz trägt „Selten“.
  - Ein nicht gebauter Boss (nachgestellt) ist gesperrt und trägt „Noch nicht entdeckt“.
- **Handy (mobile-check, neuer Teil „dungeon“):**
  - Tipp-Abstände in Eingangskarte und Journal liegen jetzt bei mindestens 8 px.
  - Bossrahmen und Warnleiste zeigen am Handy kein „Q“ mehr.
  - Die Warnleiste liegt nicht mehr über dem Chat.
  - Im Journal quer ist die vierte Fähigkeit nicht mehr verdeckt.

## Ursache und Lösung je Punkt

### 1 · Reichweiten-Rita hängt im Greenscreen (`dungeon.js`, `companions.js`, `content/dungeons.js`)

**Ursache**, nachgestellt mit der Simulation (Kevin allein, Rittergeschoss):
- Schutz und Heiler lagen. Ritas Fokus war Radler-Rita, die 1,4 m vor der grünen Wand stand.
- Nach dem Greenscreen lief Rita zu ihrem Fokus und blieb 12 Einheiten davor stehen, also noch in der Zone. Dort war sie unsichtbar, nahm keinen Schaden und zauberte nicht.
- Der Held hatte kein Ziel. Ohne Schutz spottete sie niemand heraus.
- So stand sie 480 s und länger bei 4 %. Im Teil-A-Bosslauf fiel das nicht auf, weil der Schutz dort immer stand.

**Lösung**, wie der klare Ausweg bei WoW-Mechaniken:
- **Frist:**
  - Unsichtbar ist Rita nur in der Zone *und* im Greenscreen-Fenster: `screenUntil` = Ende des Greenscreens + `hidden.exit` (2 s, `DUNGEON_BOSSES.rita.hidden.exit`).
  - Spott verkürzt das Fenster.
  - Danach ist sie sichtbar und kämpft normal weiter, auch wenn sie noch vor der Wand steht.
- **Heraus:** Nach dem Greenscreen läuft sie zum nächsten Punkt außerhalb der Zone (`screenExitPoint`), nicht mehr nur zu ihrem Ziel.
- **Söldner räumen den Greenscreen:** Kein Söldnerplatz liegt in der Zone eines kämpfenden Bosses (`inScreen` in `companions.js unsafe`).
- **Spürbar bleibt es:**
  - Ohne Spott ist sie den Greenscreen lang unsichtbar, höchstens 8 s.
  - Der Schutz holt sie früher heraus.
  - Bossrahmen „Unsichtbar“ und Journal nennen die Frist: „… sonst tritt sie nach 8 s von selbst heraus.“
- **Balance (erlaubt, nur Rita):**
  - Leben 68 000 → 77 000. Ohne den Hänger lag sie im Flügel bei 69–78 s, Käthe darunter.
  - Jetzt 78–97 s im Bosslauf (alle fünf Klassen, Seeds 7–9) und 78–85 s im Flügel.

### 2 · Gerd zieht den Pack „Hof West“ (Arena und Trash getrennt, `dungeon.js`, `engine.js`, `encounters.js`)

**Ursache**, nachgestellt mit Schorsch, Seed 7–9:
- Schorschs Maiskolben stößt Gegner zurück. Ein Azubi aus Hof West landete in der Zugbrückentür.
- Der Held stellte sich „hinter“ ihn, also in Gerds Arena.
- Der Maiskolben (Fläche um das Ziel, 70 Einheiten) traf Gerd durch die offene Tür.
- Gerd kämpfte, die Tür fiel zu, und der Azubi stand draußen im Kampf ohne Weg. Das kostete 299–422 s.
- Dasselbe Muster gab es an Ritas Tür mit der Galerie-Streife: 600 s Hänger bei Schorsch.

**Lösung:** Regeln, damit ein Boss-Pull nie Trash mitzieht und umgekehrt, dazu Daten:
1. **Trash bemerkt den Helden nicht in einer Arena mit lebendem Boss** (`heroInArena`). Die Arena ist aggro-dicht, auch bei offener Tür.
2. **Kein Boss bemerkt den Helden, solange Trash auf der Ebene mit der Gruppe kämpft** (`trashFighting`). Wer Trash in die Arena zieht, erledigt ihn dort; danach kommt der Boss wie immer.
3. **Flächenschaden weckt keinen Boss** (`engine.damage`). Ein Boss beginnt nur, wenn er den Helden bemerkt oder als Ziel angegriffen wird.
4. **Tür zu:** Trash im Kampf außerhalb der Arena lässt ab und geht zurück (`sealArena`).
5. **Kein Trash streift in eine Arena oder Arenatür** (`noRoam` der Dungeon-Welt, von `encounters.js idleEnemy` abgefragt). Bosse streifen weiter in ihrer eigenen Arena.
6. **Daten:**
   - „Hof West“ 21,24 → 22,23, 1,4 m weiter von der Zugbrücke.
   - „Gewölbe West“ (Ratten) 42 → 42,5: Eine Ratte wohnte 0,16 m vor der Kelterhallentür.
   - Helfer eines gefallenen Bosses verschwinden. Ein Interessent blieb nach Exposé stehen und hielt die Simulation fest.

**Unit-Tests** (`tests/dungeon-feinschliff.test.mjs`):
- **Boss-Arena und Pack-Aggro überschneiden sich nicht:**
  - Kein Kämpfer steht, streift oder läuft Streife in einer Arena oder Arenatür, mit mindestens 0,5 m Abstand.
  - Umherstreifen ist wie im Spiel gemessen (20 + roamRadius, frei erreichbar, `noRoam`).
- **Trash bemerkt den Helden nicht:**
  - an keinem Punkt einer Arena (1-m-Raster)
  - auch nicht, wenn der Trash 3 m vor der Tür steht
  - Gegenprobe: Im Gang davor bemerkt er ihn.
- **Hof West gegen Gerd:**
  - Held in Gerds Arena, Azubi in der Tür: Gerd bleibt ruhig, die Tür bleibt offen, danach kommt Gerd.
  - Flächenschaden auf Gerd wirkt nicht, als Ziel schon.
  - Tür zu → Hof West lässt ab und steht voll zu Hause.
  - Boss-Pull an jeder Arena: Kein Trash kommt mit.
- Der Kontrollpunkt-Test aus dem Hotfix ist grün.

### 3 · Ratten hängen auf dem Rückweg (`dungeon.js findPath`, `encounters.js`)

**Ursache** (ohne die Rattenhilfe der Simulation nachgestellt):
- Acht Ratten aus „Gewölbe West“ standen nach einem Kampf in der Nordostecke des Gewölbes (41,3/4,6), 5–6 Einheiten vor der Wand.
- Gegner laufen mit Radius 5 (`world-collision.js`). Die Wegsuche prüft aber mit Radius 6.
- Vom Startpunkt fand sie deshalb keinen einzigen Nachbarn und gab einen leeren Weg zurück, jeden Takt neu.
- `encounters.js` setzt Rückweg-Gegner erst zurück, wenn der Held weit weg ist. Stand er in der Nähe, hing die Ratte, im Spiel wie in der Simulation.

**Lösung:**
- Die Wegsuche startet an einem Punkt, der vor einer Wand liegt, am nächsten freien Punkt, wie es das Ziel schon tat.
- Neuer Rückweg höchstens alle 0,5 s, vorher je Takt eine Wegsuche je Gegner.
- Im Dungeon hat der Rückweg eine Frist (`ENCOUNTER_RULES.dungeonReturnLimit` = 8 s). Wer bis dahin nicht zu Hause ist, setzt sich dort zurück, auch mit dem Helden daneben (Ausweichen wie in WoW).
- Rückweg-Gegner sind unverwundbar und nehmen keinen Kampf auf. Danach stehen sie mit vollem Leben zu Hause und kämpfen regulär, ohne Pendeln (Unit-Test: 10 s ohne Wechsel zwischen Rückweg und Kampf).
- Die Simulation setzt Ratten nicht mehr selbst zurück. Das neue Kriterium „Rückweg-Gegner nach spätestens 8 s zu Hause“ misst höchstens 3,6 s.

### 4 · `dungeon-hotfix-check` erwartete einen gesperrten Journal-Platz

Seit Teil A sind alle Bosse gebaut; einen gesperrten Platz gibt es im Spiel nicht mehr. Teil 4 prüft jetzt das gewollte Verhalten:
- Jeder Platz hat Namen und Tooltip.
- Der Stern-Platz sagt „Das halbe Pferd · Selten · Erscheint nicht in jedem Durchgang.“
- Die Aussage „gesperrte Plätze haben einen Tooltip“ bleibt erhalten: Rita wird kurz aus `DUNGEON_BOSSES` genommen. Ihr Platz ist dann gesperrt (`aria-disabled`) und sagt „Noch nicht entdeckt · Boss · Optional“, danach kommt sie zurück.
- Derselbe Fall steht als Unit-Test in `tests/dungeon-feinschliff.test.mjs`.

### 5 · `mobile-check` über den Dungeon

`mobile-check` kannte den Dungeon nicht. Neuer Teil `MOBILE_PART=dungeon` (auch in „alle“), hochkant 390×844 und quer 844×390. Er misst dieselben Regeln wie die übrigen Schritte:
- Eingangskarte per Aktion-Knopf
- Journal, zurück zur Eingangskarte
- Bosskampf gegen Gerd: Bossrahmen und Warnleiste im Bild und nicht über Joystick oder Kniffen, Schrift mindestens 10 px, kein Tastenkürzel, Warnleiste nicht über dem Chat
- Händlerfenster per Aktion-Knopf

Aufruf mit eigenen Ports: `MOBILE_PART=dungeon CDP_PORT=9682 node scripts/mobile-check.mjs http://localhost:4481/`.

| Befund (Dungeon) | behoben |
|---|---|
| Eingangskarte: Söldner-Knöpfe 6–7 px auseinander (M-02) | `.touch-mode .dg-hire{gap:9px}` |
| Journal: Bossplätze 6 px auseinander (M-02) | `.touch-mode .dj-tabs{gap:8px}` |
| Bosskampf: „Q“ in Zauberleiste und Warnleiste am Handy | `.touch-mode .boss-hud kbd{display:none}` |
| Bosskampf hochkant: Warnleiste liegt über den Chatzeilen | im Bosskampf am Handy ruht der Chat (über Menü → Chat offen) |
| Journal quer: Rollen und Beute verdecken die vierte Fähigkeit (Gerd: „Verstärkung“) | vier Fähigkeiten quer als Symbolkacheln wie ab fünf (`dj-four`), Name und Antwort im Tooltip |

Danach ist der Dungeon-Teil grün: 10 Schritte, 0 Tipp-Ziele unter 44 px, 0 Abstände unter 8 px. Die Bilder `visual-review/mobile-check-dungeon/*.jpg` sind angesehen.

Andere Befunde des vollen Laufs (vorher, nur berichtet):
- `unterbrechung` hoch/quer: „Ein Tipp nach Unterbrechung ohne Wirkung (M-15)“
- `gespraech` quer: „kein Gespräch in Reichweite“
- `tod-zurueck` quer: Admin-Fenster bleibt
- `beute` hoch/quer: Der Einstiegsdialog (Kisten-Ida) liegt über der Fixture.

### Messfehler der Simulation und Flügel-Tuning (`scripts/dungeon-sim.mjs`, `content/dungeons.js`)

**Befund:**
- Die Flügelwege rechnet `legSeconds` mit der Wegsuche des Spiels. Von 6 der 32 Haltepunkte fand sie keinen Weg; das ist der Fehler aus Punkt 3.
- Kanzlei-Archiv, Wehrgang Ost, Kirmes-Urkunde, Gewölbe West, Gewölbe Süd und Exposé bekamen dann pauschal 60 s je Weg.
- Mit der Korrektur sanken die Flügel um etwa 2 min, auf 7–10 min (Zwischenstand in der Tabelle).

**Weitere Korrekturen, damit „ein Pack je Zug“ misst, was es verspricht:**
- Das halbe Pferd ist wirklich immer dabei. Setup würfelte es; bei Käthe fehlte es.
- Nach einem Wipe geht es am Kontrollpunkt weiter, und der Pack wird noch einmal gezogen. Vorher blieb er stehen und zählte als erledigt.
- Wer sorgfältig spielt:
  - unterbricht den Funkspruch
  - trifft ruhende Nachbarn nicht mit Fläche
  - verschnauft, ohne dass ein Nachbar hinsieht
  - tritt beim Trash nicht in eine offene Boss-Arena
- Die Erholung ist nicht mehr wehrlos. Vorher starb der Held dabei unbemerkt und stand als Geist im nächsten Zug; der Kampf hing 600 s.
- Kommt ein Kampf 30 s (mit Boss 60 s) nicht voran, handelt der Held wie ein Spieler: aufstehen bzw. weggehen.
- Neue Kriterien:
  - Rita mit allen fünf Klassen 70–110 s
  - Rita im Flügel 70–110 s
  - Rückweg ≤ 8 s
- `SIM_WING_SEED` für die Streuung

**Trash-Dichte:**
- Wie in 4B nur Anzahl und Verteilung, keine Werte je Gegner.
- Nur Gruppen ohne Funkspruch (kein Azubi, der Nachbarn ruft) und nie zwei Makler zusammen (die heilten sich zu Tode).
- Neu:

| Flügel | Änderungen |
|---|---|
| Burghof | neu „Hof Nordost“ (Ritter, Makler), „Kanzlei Ost“ (Ritter, Makler, Pappschütze), „Wehrgang Nord“ (Ritter, Makler); je ein Ritter mehr in Hof West/Ost und Kanzlei Nord, ein Pappschütze mehr im Archiv |
| Rittergeschoss | neu „Galerie West“ (Ritter, Makler, Pappschütze); ein Pappschütze mehr in Rittersaal West, Ost und Süd |
| Basaltgewölbe | neu „Weinkeller-Wache“ (Ritter, Makler, Pappschütze), „Weinkeller-Fass“ (2 Ritter, Makler, Pappschütze), „Gewölbe Nord“ (2 Ritter, Makler, Pappschütze); Makler und Pappschütze mehr im Gewölbe Ost; die Rattenschwärme im Weinkeller 8 → 10 |

- Alle neuen Packs halten die Kontrollpunkt-Regel, die Requisiten-Regel, die Arena-Regel und die Schwarm-Schilder ein.

**Trash-EP:**
- Entscheidung des Orchestrators: ein Wert, nur Dungeon-Trash (`DUNGEON_REWARDS.trashXp`).
- Etwa 20 % reichten nicht: Mit ehrlichen Wegen lag Käthe im Basaltgewölbe bei 174–177 EP/min (Grenze 172).
- 0,68, also −32 %, bringt die Wiederholung in allen 45 Messungen (drei Seeds) auf 100–170 EP/min, im seriellen Lauf auf 111–165.
- Die Untergrenze Feld (86) hält überall.
- Boss- und Feld-EP sind unverändert (Unit-Test).

## Zeittabelle je Klasse und Flügel

`node scripts/dungeon-sim.mjs --only=wings`, Held Stufe 10 mit vier Söldnern, „ein Pack je Zug“, Minuten. Serieller Lauf, alle fünf Klassen hintereinander wie im Kriterium.

| Klasse | Burghof vorher → nachher | Rittergeschoss | Basaltgewölbe | Big B | voller Durchgang | Rita im Flügel (s) |
|---|---|---|---|---|---|---|
| Dieter | 10,4 → **11,7** | 11,0 → **13,0** | 10,9 → **11,4** | 2,4 → 2,3 | 34,8 → **38,6** | 103 → **85** |
| Bärbel | 10,2 → **11,4** | 15,4 → **14,1** | 10,8 → **12,3** | 2,3 → 2,4 | 38,8 → **40,2** | 79 → **84** |
| Kevin | 10,0 → **12,1** | 12,9 → **14,8** | 10,8 → **11,6** | 2,2 → 2,6 | 36,8 → **41,2** | 231 → **78** |
| Schorsch | 14,2 → **11,9** | 20,4 → **12,4** | 10,6 → **12,1** | 2,3 → 2,3 | 47,5 → **38,9** | 78 → **78** |
| Käthe | 9,4 → **10,8** | 8,5 → **11,8** | 10,5 → **10,5** | 2,8 → 2,2 | 32,2 → **35,3** | 79 → **79** |

- **Vorher:** `main` 3817db18 mit derselben Simulation wie 4B.
  - Dazu die 4B-Zahlen: Kevin im Rittergeschoss 22,0 (Rita 480 s), Schorsch im Burghof 15,1 (Gerd im Pack).
  - Rot: 4 von 15 Flügelwerten außerhalb von 10–15 min. EP-Wiederholung 74–158, bei Schorsch im Rittergeschoss 74 < Feld.
- **Zwischenstand** nach Spielkorrekturen und ehrlichen Wegen, vor Trash und Trash-EP:

  | Klasse | Burghof | Rittergeschoss | Basaltgewölbe |
  |---|---|---|---|
  | Dieter | 8,6 | 10,5 | 7,9 |
  | Bärbel | 8,4 | 9,3 | 7,5 |
  | Kevin | 8,5 | 10,3 | 8,2 |
  | Schorsch | 8,0 | 9,7 | 6,7 |
  | Käthe | 7,6 | 9,7 | 7,4 |

  EP-Wiederholung 141–204.
- **Nachher:**
  - Alle 15 Flügelwerte 10,5–14,8 min.
  - Voller Durchgang 35,3–41,2 min.
  - EP je Minute (Wiederholung) 111–165, erster Lauf des Tages 191–265, Feld 86.
  - Rückweg höchstens 3,6 s.
  - „Nachbarn ziehen mit“ (nur Angabe): 41,3–49,7 min.
- **Streuung** (`SIM_WING_SEED` 7/8/9, je Klasse einzeln, 45 Werte):
  - Burghof 10,3–14,3, Rittergeschoss 11,6–14,6, Basaltgewölbe 10,2–13,0 min
  - EP-Wiederholung 100–170, Rita 74–95 s
  - Alle Werte im Band.
- Rita im Bosslauf (spielt richtig, fünf Klassen, Seeds 7–9): 78–97 s. „Ignoriert Mechanik“ stirbt in jedem Lauf, „spielt richtig“ nie.

## Prüfungen

Stand nach dem Rebase auf 0ea813d1. Ports: CDP 9680–9689, Server 4480–4489, `BOOT_TRIES=450`.

| Prüfung | Ergebnis |
|---|---|
| `npm test` | grün (1226, davon 16 neu in `tests/dungeon-feinschliff.test.mjs`) |
| `npm run content:check` | grün (57) |
| `npm run build` | grün |
| `npm run ui:check` | grün |
| `dungeon-check` | grün, Desktop und Handy |
| `dungeon-e1-check` | grün (7) |
| `dungeon-e2-check` | grün (17; angepasst: verborgene Pappschützen nur im Wehrgang) |
| `dungeon-e3-check` | grün (14) |
| `dungeon-e4a-check` | grün (36; angepasst: Greenscreen-Fenster wie beim echten Zauber) |
| `dungeon-e4b-check` | grün (11) |
| `dungeon-hotfix-check` | grün (8; Teil 4 neu). Unter Last einmal rot bei „Neuladen“ (Spielstand noch nicht geladen); allein und im letzten Lauf grün |
| `dungeon-raeume-check` | grün (Teile 1–6). Unter Last einmal rot bei der Bildzeit (Median 33 ms bei acht parallelen Prüfungen); allein grün |
| `dungeon-sim` (alle Teile) | alle 37 Zeilen grün |
| `dungeon-sim --only=wings` | alle Kriterien grün (Tabelle oben) |
| `mobile-check` Teil `dungeon` | grün (10 Schritte, hochkant und quer) |
| `mobile-check` voll | 6 rote Schritte außerhalb des Dungeons, vorbestehend (siehe Punkt 5) |

## Geänderte Dateien

| Bereich | Dateien |
|---|---|
| Laufzeit | `dungeon.js` (Greenscreen-Frist und Ausgang, Arena und Trash, Wegsuche, `noRoam`, Trash-EP, Helfer gefallener Bosse), `encounters.js` (Rückweg-Frist, seltener neu suchen, `noRoam`), `engine.js` (Flächenschaden weckt keinen Boss), `companions.js` (nicht vor den Greenscreen), `dungeon-journal.js` (`dj-four`) |
| Oberfläche | `dungeon-ui.css` (Handy: Abstände, kein „Q“, Chat im Bosskampf, Journal quer) |
| Daten | `content/dungeons.js` (Rita `hidden.exit` und Leben, Pack-Lagen und -Dichte, `trashXp`), `content/dungeon-ui.js` (Greenscreen-Texte) |
| Prüfungen | `tests/dungeon-feinschliff.test.mjs` (neu), `tests/dungeon.test.mjs` (nächster Makler), `scripts/dungeon-sim.mjs`, `scripts/dungeon-hotfix-check.mjs`, `scripts/dungeon-e2-check.mjs`, `scripts/dungeon-e4a-check.mjs`, `scripts/mobile-check.mjs` |

## Restliste

1. **Knapp im Band:**
   - Kevin im Rittergeschoss liegt im seriellen Lauf bei 14,8 min. Das halbe Pferd kam dort zweimal 60 s nicht voran (Trog), und die Simulation zog es neu.
   - Käthe liegt im Basaltgewölbe bei 10,5.
   - Kleine Änderungen an Klassen oder Bossen können einzelne Werte über die Grenze schieben. Zuerst die Streuung mit `SIM_WING_SEED` ansehen.
2. **Trash-EP −32 % statt etwa 20 %:** Mit ehrlichen Wegen reichten 20 % nicht (Käthe im Basaltgewölbe 174–177). Die Folge: Die EP je Minute im Dungeon sinken für alle.
3. **Trash-Dichte:**
   - Sieben neue Packs, acht Packs mit ein oder zwei Gegnern mehr, zwei Rattenschwärme mit je zwei Ratten mehr.
   - Nicht im Browser gespielt: Wie sich die dichteren Räume anfühlen, besonders die Kanzlei mit vier Gruppen und der Weinkeller.
   - Ein Playtest ist offen.
4. **Pferd im Flügel:** Das halbe Pferd kam mit Kevin im Flügel zweimal nicht voran (säuft am Trog, der Schutz zog es nicht weg). Im Bosslauf (Teil A) nicht nachstellbar. Balance und Söldner-KI des Pferds sind nicht angefasst.
5. **Neue Regel „Boss wartet, solange Trash kämpft“:**
   - Sie gilt für alle Trash-Gegner auf der Ebene.
   - Klemmt irgendwo Trash im Kampf, bemerkt kein Boss den Helden. Angreifen startet den Kampf trotzdem.
   - Beim Playtest darauf achten.
6. **mobile-check außerhalb des Dungeons:** sechs vorbestehende rote Schritte (M-15 Unterbrechung, Gespräch quer, Tod quer, Beute mit Einstiegsdialog), nicht behoben.
7. **Journal-Porträts** in den Bossplätzen sind am Handy sehr klein (Figurengrafik, nicht angefasst).
8. **Prüfer-Durchgang** durch einen Spieler folgt (Auftrag).
