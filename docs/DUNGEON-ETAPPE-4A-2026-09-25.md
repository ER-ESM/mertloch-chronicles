# Dungeon „Schloss Big B“ · Etappe 4 Teil A „Die restlichen Bosse“ · 2026-09-25

Grundlage: E-71 und E-70 (`docs/ENTSCHEIDUNGEN.md`), Ton E-20, Bauplan Etappe 4 aus `docs/DUNGEON-ANALYSE-2026-09-24.md`, Planung 7.2–7.5,
6, 8, 9 und 11 aus `docs/DUNGEON-SCHLOSS-BIG-B-2026-09-23.md`, Berichte der Etappen 1–3 und des Arenatür-Hotfixes.
Zweig `dungeon-e4a`, Worktree `D:\Dev\MertlochChronicles-dg-e4a`, zuletzt auf `main` 45625e4a (Hotfix Build #623, E-72, Etappe 4 Teil B (1)) aufgesetzt.

## Kurzfassung

- **Alle Siegelträger stehen:** Frau Dr. Exposé (Siegel 2, Rittergeschoss) und Kellermeister Korken-Kurt (Siegel 3, Basaltgewölbe).
  Die Tresortür verlangt damit ohne Datenänderung alle drei Siegel. Alle sechs Reihenfolgen sind im Spiel erreichbar und getestet.
- **Dazu zwei Nebenbosse:** Reichweiten-Rita (optional, Presseamt) und das halbe Pferd (selten, 30 % der Durchgänge, Stallungen).
  Beide zählen nicht für die Tresortür. Das halbe Pferd gibt zu 3 % das Reittier und immer Hafersäcke; zehn Hafersäcke tauscht der
  Fahrstall gegen das Reittier (V-D8).
- **Neue Merkmale, alle datengetrieben:** `summon.goal` (Interessenten laufen zum Vertragstisch), `decoy` (Attrappen, erst der Stempel
  zeigt die echten Stellen), `signAll`, `stack`/`spread`, waagrechte Bahnen (`line.axis:'y'`, `pick`, `aim`), `persist.edge`
  (nasse Streifen vom Rand, bremsen), `los` (Blitzlicht nur mit Sichtlinie, Deckung sperrt Laufen und Sicht), `hidden` (Greenscreen),
  `retreat` und `feeds` (Trog), `brand` auch auf Flächen, Kreisen und Blitzlicht.
- **Söldner spielen die Mechaniken mit:** Schaden nimmt den Interessenten am nächsten zum Tisch, der Schutz spottet ihn nicht. Unterbrechen
  zu zweit, Sammeln beim Markierten, Verteilen mit Abstand, Rinnen senkrecht verlassen, Deckung beim Blitzlicht. Der Schutz zieht Rita vom
  Greenscreen und das Pferd vom Trog weg.
- **Balance mit fünf Klassen (E-72-Rotation):** Alle Kriterien sind grün, für Gerd, Big B und die vier neuen Bosse. Der Nebenbefund aus
  Etappe 3 ist behoben: Gerds Schutz-Söldner fällt jetzt in 0 von 9 Läufen, vorher in 9 von 9, mit zwei verlorenen Läufen.
  Gerd bleibt trotzdem gefährlich: Wer nie ausweicht, stirbt in jedem Lauf.
- **Mit dem Boss fliehen seine Helfer:** Das gilt für Gerds Neffen, Big Bs Follower, Interessenten und Kommentatoren. Danach öffnet die
  Arenatür. Die neuen Arenen (Musterwohnung, Kelterhalle, Presseamt, Stallungen) nutzen die Arenatür-Regel des Hotfixes.

## Stand je Punkt

| # | Punkt | Stand |
|---|---|---|
| 1 | Frau Dr. Exposé | erledigt: `summon` mit `goal`, `decoy`, `interrupts:2` (Notartermin), drei Phasen, eigene Beute, Notarsiegel; Söldner unterbrechen und nehmen Adds nach Rolle |
| 2 | Korken-Kurt | erledigt: `stack`, `spread`, `line` (waagrecht, gezielt) und `persist` (Sprinkler); Söldner sammeln und verteilen auf Zuruf; eigene Beute, Weinsiegel |
| 3 | Reichweiten-Rita, das halbe Pferd | erledigt: Rita optional mit Deckung und Greenscreen. Pferd selten (30 %, im Durchgang gemerkt) mit Trog; Reittier 3 % plus zehn Hafersäcke. Reittier in `content/mounts.js` ohne neue Figurengrafik: Bogen des Hofpferds, zum Schimmel getönt, nur das Tier |
| 4 | Tresortür, sechs Reihenfolgen | erledigt: `requiredSeals` greift automatisch alle drei. Unit-Test läuft alle sechs Reihenfolgen mit echten Wegen, Toren und Türen. Die Browserprüfung läuft eine zufällige Reihenfolge per Kartenklick |
| 5 | Warnungen | erledigt: je Fähigkeit Symbol (`map-symbols.js`), Antwort in 2–3 Wörtern (`content/dungeon-ui.js`), Timer auf der Warnleiste, Journalseite über `describeCast`. Ab fünf Fähigkeiten zeigt das Journal Kacheln und scrollt auch am Handy nicht. Neue Chips im Bossrahmen: Provision, Unsichtbar, Säuft, Nass |
| 6 | Balance | erledigt: alle Kriterien grün (Tabelle unten). Gerds Schutz überlebt. `dungeon-sim` kennt alle Bosse und alle fünf Klassen |
| 7 | Figuren, Texte | Platzhalter mit Tönung und Bossgröße. Exposé = Gisela, Kurt = Horst, Rita = Elke, Pferd = Hofpferd (Reittier-Bogen ohne Reiter). Texte im Ton E-20 als Entwurf |

### Die Bosse im Einzelnen

**Frau Dr. Exposé** (Musterwohnung, K1; 66 000 Leben, Stufe 9)
- *Besichtigungstermin* (Nebentakt alle 30 s, in Phase 2/3 alle 20 s aus beiden Eingängen): Interessenten gehen über einen Wegpunkt zum
  Vertragstisch und unterschreiben. Jede Unterschrift gibt ihr +15 % Schaden (Provision). Bei fünf Unterschriften heißt es **VERKAUFT**:
  Alle fliegen aus der Wohnung, der Kampf setzt zurück.
- *Grundstück verkauft*: vier gleich aussehende Stellen. Nach 0,8 s bekommen die zwei echten den Stempel, nur die treffen.
  Dazu stapelt sich die Grundbuchsperre.
- *Provisionsforderung*: unterbrechen.
- Phase 3, *Notartermin*: zweimal unterbrechen, sonst heilt sie 10 % und alle Interessenten unterschreiben sofort.

**Kellermeister Korken-Kurt** (Kelterhalle, K2; 86 000 Leben)
- *Runde auf mich!*: Der Schaden wird durch alle im Kreis geteilt. Allein ist er tödlich.
- *Jeder zahlt selbst*: auseinander, Überlappung addiert.
- *Fass rollt*: in der Rinne, in der jemand steht, auf den drei gezeichneten Fassrinnen.
- Phase 2 bringt zwei Rinnen und *Korken knallen*.
- Phase 3, *Sprinkleranlage*: alle 10 s ein nasser Streifen mehr vom Rand. Er bremst um 40 % und kostet Leben (Zeitgrenze).

**Reichweiten-Rita** (Presseamt, K1, optional; 68 000 Leben)
- *Blitzlicht*: trifft und blendet nur mit Sichtlinie (4 s halber Schaden), stapelt Überbelichtet.
  Kühlschrank und Palettenwand sperren Laufen und Sicht.
- *Story posten*: unterbrechen, sonst kommen zwei Kommentatoren.
- *Greenscreen*: Sie läuft vor die grüne Wand und ist dort unsichtbar und nicht zu treffen. Der Schutz zieht sie mit Spott weg.
- Steht Deckung zwischen ihr und ihrem Ziel, läuft sie herum (`lostSight`). Söldnerplätze hinter Deckung weichen ohne Blitzlicht auf
  einen Platz mit Sicht aus (`sightSpot`).

**Das halbe Pferd** (Stallungen, K1, selten; 74 000 Leben)
- *Huftritt*: Kegel nach vorn.
- *Wiehern*: Fläche um sich selbst, stapelt Ohrensausen.
- *Säuft am Trog* (Nebentakt alle 15 s): Es läuft zum Trog und heilt dort 2 % je Sekunde. Der Schutz zieht es weg.
- Beute: Hafersack (95 %), Dorflegende „Das vordere Hufeisen“ (8 %), Reittier 3 %.

Beute der Siegelträger und Ritas: je eine eigene Tabelle mit Dorflegende zu 15 %:
- Hochglanz-Exposé (Nebenhand, Schild)
- Korkenzieher des Kellermeisters (Einhandklinge)
- Ringlicht der Reichweite (Talisman)

Wie bei Gerd legt der Dungeon ein seltenes Teil nach, wenn keines fällt.

## Messtabelle (`scripts/dungeon-sim.mjs`)

Held Stufe 10, voller Satz ungewöhnlich, vier Söldner Stufe 10, Seeds 7/8/9, Helden spielen die geübte E-72-Rotation
(`scripts/balance-rotation.mjs`). Kernklassen Dieter (Kneipenschläger), Bärbel (Putzpyramide), Kevin (Pfandjäger). Schorsch
(Flambierer) und Käthe (Grand-Spielerin) sind spielbar und laufen als Info-Zeilen mit.
„vorher“ = `origin/main` 45625e4a mit dem Messskript von `main`.

| Lauf | vorher | nachher |
|---|---:|---:|
| Gerd mit Held und 4 Söldnern | 68–96 s, **2 von 9 verloren** (Bärbel) | 79–87 s, alle gewonnen |
| Gerd: Schutz-Söldner fällt | **9 von 9** Läufen (meist „Funkspruch“) | 0 von 9 |
| Gerd „weicht aus“, Tode je Lauf | 0/0/0/1/1/0/1/0/0 | 0 in allen 9 |
| Gerd „weicht nie aus“, Tode je Lauf | 2/1/2/2/1/2/1/2/2 | 1/2/2/1/2/2/2/2/2 |
| Gerd, Nicht-Tanks im Kegel (Mittel) | 0,22 | 0,37 |
| Big B, folgt dem Nachsatz | 167–188 s | 162–189 s |
| Big B, folgt der Behauptung, Tode je Lauf | **0**/2/2/2/2/2/2/2/2 | 1/2/2/2/2/2/2/2/1 |
| Frau Dr. Exposé, spielt richtig (D / B / K) | – | 105/94/94 · 104/87/88 · 83/86/87 s, 0 Tode |
| Exposé, ignoriert Mechanik, Tode | – | 2 in allen 9 (verliert fast immer durch VERKAUFT) |
| Korken-Kurt, spielt richtig (D / B / K) | – | 91/89/92 · 87/90/91 · 90/87/87 s, Tode 0/0/0/0/0/0/1/1/0 |
| Korken-Kurt, ignoriert Mechanik, Tode | – | 2/2/2/1/2/1/2/2/2 |
| Reichweiten-Rita, spielt richtig (D / B / K) | – | 86/87/88 · 82/80/81 · 77/78/72 s, 0 Tode |
| Rita, ignoriert Mechanik, Tode | – | 2 in allen 9 |
| Das halbe Pferd, spielt richtig (D / B / K) | – | 81/81/83 · 77/77/77 · 71/72/71 s, 0 Tode |
| Pferd, ignoriert Mechanik, Tode | – | 2/2/1/2/2/2/2/2/2 |
| Held allein (unsterblich, Kernklassen) | 287–406 s | 249–351 s |
| Flügel Burghof am Stück | mind. 107 EP/min (Kevin verlor Gerd) | mind. 395 EP/min |
| Farm Flügel, 60 min mit 30-min-Sperre | 105 EP/min | 110 EP/min (Feld 86) |

Info (Schorsch / Käthe, nicht Teil der Kriterien):

| Lauf | Schorsch | Käthe |
|---|---|---|
| Gerd | 77–85 s, 0 Tode | 72–80 s, 0 Tode |
| Big B (Nachsatz) | 160–162 s, 0 Tode | 149–156 s, 0 Tode |
| Exposé / Kurt / Rita / Pferd, spielt richtig | 76–80 / 84–86 / 78–80 / 76–78 s, 0 Tode | 75–79 / 77–82 / 76–89 / 68–73 s, 0 Tode |
| ignoriert Mechanik, Tode | 2 bei allen vier Bossen | Exposé 2, Kurt 1/0/1, Rita 1/2/2, **Pferd 0/0/0** |
| Held allein | 267 s | **182 s** (unter 240 s) |

## Prüfkriterien

Ausgabe von `node scripts/dungeon-sim.mjs`: **alle 24 Kriterien grün**, dazu 7 Info-Zeilen für Schorsch und Käthe.

| Kriterium | Wert |
|---|---|
| Gerd mit Held und 4 Söldnern 60–100 s | 79–87 s |
| „weicht nie aus“ stirbt mindestens einmal | 1/2/2/1/2/2/2/2/2 |
| „weicht aus“ stirbt höchstens einmal | 0 in allen 9 |
| Gerd: im Mittel höchstens ein Nicht-Tank im Kegel | 0,37 |
| Held allein über 240 s | 249–351 s |
| EP je Minute Flügel Burghof ≥ Feld Stufe 10 | Flügel mind. 395 · Feld höchstens 86 |
| Trash-Pack zieht keine Kette | hof-ost 0/2 |
| Big B mit Held und 4 Söldnern 150–200 s | 162–189 s |
| „folgt der Behauptung“ stirbt mindestens einmal | 1/2/2/2/2/2/2/2/1 |
| „folgt dem Nachsatz“ stirbt höchstens einmal | 0 in allen 9 |
| Frau Dr. Exposé 70–110 s · ignoriert ≥ 1 · richtig ≤ 1 | 83–105 s · 2 in allen · 0 in allen |
| Korken-Kurt 70–110 s · ignoriert ≥ 1 · richtig ≤ 1 | 87–92 s · 2/2/2/1/2/1/2/2/2 · 0/0/0/0/0/0/1/1/0 |
| Reichweiten-Rita 70–110 s · ignoriert ≥ 1 · richtig ≤ 1 | 72–88 s · 2 in allen · 0 in allen |
| Das halbe Pferd 70–110 s · ignoriert ≥ 1 · richtig ≤ 1 | 71–83 s · 2/2/1/2/2/2/2/2/2 · 0 in allen |
| Gerd: Schutz-Söldner überlebt die meisten Läufe | fällt in 0 von 9 |
| Farm-Schleife über eine Stunde ≤ 2× Feld (30-min-Sperre) | Gerd 105 · Flügel 110 EP/min · Feld 86 |

Was die Zahlen bewegt hat (nur Dungeon-Zahlen und Söldner-KI, E-72 selbst unverändert):
- **Neue Bosse:** Leben und Schaden sind in `content/dungeons.js` eingestellt. Der Söldner-Instanzfaktor (`content/companions.js`) ist
  unverändert.
- **Gerds Schutz:**
  - Der Schutz stellt Gerd nicht mehr mit dem Rücken zur Wand. Er sucht einen Platz mit freiem Raum hinter dem Boss (16 Richtungen,
    Wand dahinter kostet).
  - In engen Arenen (Seite ≤ 6 m) zieht er den Boss zur Mitte.
  - Vorher klemmte Gerd in der Ecke, und Funkspruch plus Autoangriff trafen den Schutz ohne Heilungspause.
- **Rita:** Die Lücke war keine Zahl. Boss und Söldner standen beiderseits von Kühlschrank und Palettenwand, keiner traf den anderen.
  Ein Lauf blieb 420 s bei 14 % stehen. Jetzt geht der Boss um die Deckung herum. Söldner und der Held der Simulation suchen ohne
  Blitzlicht einen Platz mit Sicht. Danach Leben 58 000 → 68 000.
- **Simulation:**
  - Profil „spielt richtig“ (`e4Goal`) und „ignoriert Mechanik“ (`lie:'none'`).
  - Nach VERKAUFT zieht der Held den Boss neu.
  - Der Held geht Wegpunkte über 12 Einheiten an (vorher blieb er am eigenen Standort hängen).
  - `SIM_TRACE`, `SIM_POS`, `SIM_CLASS`, `SIM_SEED` zur Fehlersuche.

Grenzen der Simulation:
- „spielt richtig“ weicht mit 0,35 s Reaktionszeit ideal aus.
- „ignoriert Mechanik“ steht einfach und schlägt.
- Käthe (Info) stirbt als „ignoriert Mechanik“ am Pferd nicht. Die Ursache ist nicht untersucht (Info-Zeile, kein Kriterium).

## Prüfungen vor dem Push

Nach dem letzten Rebase auf `main` 45625e4a:

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 1062 von 1062 grün (neu: 19 Tests in `tests/dungeon-e4a.test.mjs`) |
| `npm run content:check` | grün (57) |
| `npm run build` | grün |
| `scripts/dungeon-check.mjs` | grün, Desktop und Handy |
| `scripts/dungeon-e1-check.mjs` | 7 von 7 grün |
| `scripts/dungeon-e2-check.mjs` | 17 von 17 grün |
| `scripts/dungeon-e3-check.mjs` (angepasst: Gerd, Exposé, Kurt legen, dann Tresortür) | 14 von 14 grün |
| `scripts/dungeon-e4a-check.mjs` (neu) | 36 von 36 grün |
| `scripts/dungeon-e4b-check.mjs` (Teil B, zur Sicherheit auf diesem Stand) | 4 von 4 grün |
| `scripts/dungeon-sim.mjs` | alle 24 Kriterien grün |
| `scripts/optimierung-r5a-check.mjs` | 23 von 23 grün (war vorbestehend rot, auf diesem Stand grün) |

`scripts/dungeon-e4a-check.mjs` nutzt CDP 9650 und Server 4450. Teile mit `ONLY=1,…`, `SEED=n` wählt die Reihenfolge. Es prüft:
1. **Exposé:**
   - Pull aus der Ahnengalerie: Die Tür schließt mit dem Helden und allen vier Söldnern drin.
   - Interessenten auf der goldenen Spur zum Tisch, die Söldner nehmen sie.
   - Attrappen gestrichelt mit „?“, nach dem Stempel 2 echte; Warnleiste „Stempel abwarten“.
   - Bossrahmen „Provision ×2 · +30 %“.
   - Sieg mit Söldnern (84 s), Notarsiegel.
2. **Kurt:**
   - Pull aus dem Gewölbegang.
   - Warnleiste für Runde, Zahlen und Fass.
   - Sprinkler: drei nasse Streifen, Bossrahmen „Nass ×3“.
   - Sieg, Weinsiegel.
3. **Rita:**
   - Pull aus der Galerie.
   - Blitzlicht: 5 von 5 hinter Deckung (Auge über Rita, Deckung leuchtet, Plätze golden).
   - Greenscreen: unsichtbar, Bossrahmen „Unsichtbar“, der Schutz zieht sie weg.
   - Sieg (81 s).
4. **Pferd:**
   - Pull aus der Galerie in die 5 m schmalen Stallungen.
   - Säuft am Trog; getönter Schimmel in Bossgröße.
   - Sieg (90 s), Reittier freigeschaltet (erzwungener Wurf).
5. **Klickpfad:**
   - Zufällige Reihenfolge der drei Siegelträger nur per Kartenklick (⇧+Klick), F an Übergängen, Leitern.
   - Die Tresortür öffnet erst mit dem dritten Siegel, der Held läuft per Karte in den Thronsaal.
6. **Handy** hoch und quer: Bossrahmen und Warnleiste bei „Runde auf mich!“ im Bild.
7. **Journal** aller vier Bosse auf Desktop, Handy hoch und Handy quer: Fähigkeiten mit Symbol, Beute, nichts scrollt.

## Screenshots (`visual-review/dungeon-e4a/`, nicht im Repo)

| Bild | Inhalt |
|---|---|
| `01-expose-interessenten.jpg` | Interessenten auf der goldenen Spur zum Vertragstisch |
| `02-expose-attrappen.jpg` | vier gleiche Stellen, gestrichelt mit „?“ |
| `03-expose-stempel.jpg` | nach 0,8 s: zwei echte mit Stempel, zwei Attrappen |
| `04-expose-provision.jpg` | Bossrahmen „Provision ×2 · +30 %“, Warnleiste |
| `05-kurt-sammeln.jpg` · `06-kurt-verteilen.jpg` · `07-kurt-rinne.jpg` | Sammeln, Verteilen, Fassrinne |
| `08-kurt-sprinkler.jpg` | nasse Streifen vom Rand, „Nass ×3“ |
| `09-rita-blitzlicht.jpg` · `10-rita-greenscreen.jpg` | Deckung und Plätze, Rita unsichtbar |
| `11-pferd-trog.jpg` · `12-pferd-beute.jpg` | Trog und Säuft-Chip, Beute-Moment |
| `13-klickpfad-thronsaal.jpg` | nach drei Siegeln per Karte im Thronsaal |
| `14-handy-hoch-kurt.jpg` · `14-handy-quer-kurt.jpg` | Handy, Bossrahmen und Warnleiste |
| `15-journal-<boss>-<gerät>.jpg` | Journal je Boss und Gerät (12 Bilder) |

## Geänderte Dateien

**Daten**
- `content/dungeons.js`: Bosse, Zaubermuster, Räume, Arenen, Sprüche, `DUNGEON_TEXT.e4a`.
- `content/combat.js`: Autoangriffe, Merkmale, Zahlen.
- `content/dungeon-ui.js`: Antworten, Rollen, Chips.
- `content/items.js`, `content/item-info.js`, `content/drops.js`: Beute.
- `content/mounts.js`: Reittier.
- `content/companions.js`: Söldner-Abstände.
- `content/dungeon-e4b.js`: Welt-Worte der neuen Chips in `clarity.hudFloats`, abgestimmt mit Teil B.

**Laufzeit**
- `dungeon.js`: Etappe-4A-Block am Ende, `onDungeonKill` mit fliehenden Helfern, Reittier-Wurf (`grantMount`).
- `companions.js`: Mechaniken, Aufstellung, Deckung.
- `engine.js`: `dungeonMove`, `lostSight`.
- `movement.js`: Bremsen auf nassem Boden.

**Grafik**
- `dungeon-e4a-art.js` (neu): Boden-Zeichnungen.
- `renderer.js`, `dungeon-bigb-art.js`: waagrechte Rinnen, Attrappen.
- `boss-alerts.js`, `map-symbols.js`, `dungeon-journal.js`.
- `paperdoll-mount.js`, `mount-art.js`, `clan-art.js`: Reittier-Platzhalter mit Tönung.

**Prüfungen**
- `tests/dungeon-e4a.test.mjs` (neu).
- `tests/dungeon-e3.test.mjs`, `tests/dungeon.test.mjs`, `tests/mounts.test.mjs`, `tests/paperdoll-mount.test.mjs`.
- `scripts/dungeon-sim.mjs`, `scripts/dungeon-e3-check.mjs`, `scripts/dungeon-e4a-check.mjs` (neu).

## Restliste

1. **Figuren sind Platzhalter**, freigabepflichtig:
   - Exposé = Gisela, Kurt = Horst, Rita = Elke, jeweils getönt.
   - Das halbe Pferd = Hofpferd-Bogen ohne Reiter, zum Schimmel getönt, auch als Reittier.
   - Eigene Grafik erst nach Freigabe.
2. **Texte sind Entwürfe** im Ton E-20: Sprüche, Titel, Beute, Hafersack. Story nimmt sie ab.
3. **Reittier im Beute-Moment:** Es erscheint nur als Meldung (Toast), noch nicht als eigene Karte im Beute-Moment (`reward.mount` liegt bereit).
4. **Um Deckung herumgehen** (`lostSight`) gilt nur in Räumen mit Boss-Deckung (Presseamt). Anderswo bleibt ein Gegner hinter einer Säule
   ohne Sicht stehen, wie bisher.
5. **Hotfix-Funktion berührt:** `pullIntoArena` prüft „drin“ jetzt mit Laufradius 5 statt Raumgrenze allein. Sonst blieb ein Söldner auf
   der Schwelle der 1 m dünnen Stallwand hängen, wenn die Tür zufiel. Dazu kommt ein Aufräumschritt in `companions.js`: Wer eingeklemmt
   ist, geht zum nächsten freien Punkt.
6. **Käthe (Info):**
   - Allein braucht sie 182 s gegen 240 s Ziel.
   - Als „ignoriert Mechanik“ stirbt sie am Pferd nie.
   - „Allein“ hängt an E-72 (Klassenwerte), nicht an Dungeon-Zahlen; E-72 ist nicht angefasst. Das Pferd-Profil ist nicht untersucht.
7. **„ignoriert Mechanik“ bei Exposé** verliert fast immer durch VERKAUFT (Rücksetzen). Das ist gewollt, aber hart. Beim Playtest prüfen, ob
   Erstspieler die Tisch-Mechanik ohne Hilfe verstehen.
8. **Teil B:** `--only=wings` (Flügel-Simulation aus Teil B) ist auf `main` noch nicht vorhanden. Nach dem Merge von Teil B erneut laufen
   lassen.
