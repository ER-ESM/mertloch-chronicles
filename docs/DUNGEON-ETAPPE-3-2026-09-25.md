# Dungeon „Schloss Big B“ · Etappe 3 „Big B“ · 2026-09-25

Grundlage: E-71 (`docs/ENTSCHEIDUNGEN.md`), Bauplan Etappe 3 und die Verbesserungen 10 und 12 aus
`docs/DUNGEON-ANALYSE-2026-09-24.md`, Planung 7.6, 8, 9, 11, 13 und 4.3 aus `docs/DUNGEON-SCHLOSS-BIG-B-2026-09-23.md`.
Zweig `dungeon-e3`, Worktree `D:\Dev\MertlochChronicles-dg-e3`, auf Etappe 1 (Build #556) und Etappe 2 (Build #559, ac87c87) aufgesetzt.

## Kurzfassung

- **Der Dungeon hat zum ersten Mal ein Ende:** Eingang → Gerd → Tresortür → Big B → Endtruhe → Hinterausgang.
- **Big B** steht im Thronsaal: drei Phasen und das Geständnis nach Planung 7.6, Follower als Adds, Sprüche aus der Planung.
  Mit Held und vier Söldnern dauert er **162–188 s** (Ziel 150–200 s).
- **Behauptung und Nachsatz (`lie`):** Big B sagt die Lüge an, erst nach 1,0 s kommt der Nachsatz mit Ton, und erst dann liegt die
  echte Markierung am Boden. Die Behauptung steht in Zauberleiste, Warnleiste und Sprechblase, am Boden nur als gestrichelter Umriss
  mit Fragezeichen. Wer ihr glaubt, stirbt in jedem Simulationslauf mindestens einmal; wer den Nachsatz abwartet, in keinem.
- **Neue Merkmale:** `line` (Bahnen durch die Arena), `tracks` (Siegelring alle 12 s neben dem Hauptzyklus), `enrage` (Wut nach 6 min),
  dazu `tankDebuff` (Zertifikat), `persist` (Trümmer), `interrupts` (zweimal unterbrechen), `summon` am Zauberende, `selfHeal`.
- **Söldner stehen nach Rolle:** Der Schutz dreht den Boss von der Gruppe weg, Nahkampf steht dahinter, Fernkampf und Heilung im
  Fächer. Bei Gerd stehen beim Zauberbeginn im Mittel **0,31 Nicht-Tanks im Kegel** (vorher 0,98). Söldner folgen dem Nachsatz,
  mit 5 % Fehlerquote.
- **Tresortür** verlangt nur die Siegel gebauter Bosse (heute Gerd). Mit Exposé und Kurt greifen alle drei ohne Datenänderung.
- **Endtruhe** mit Wahl aus drei seltenen Teilen plus 3 Siegelmarken, **Erfolg „Der Nachsatz zählt“** im Spielstand, Abschlüsse und
  Bestzeit.
- **Farm-Lücke geschlossen:** Boss-EP (und die EP seiner Helfer) nur beim ersten Sieg des Tages voll, jede Wiederholung ein Drittel.
  Über eine Stunde mit der 30-min-Sperre des Spiels: 101–106 EP/min gegen 82 im Feld.
- **Warnleiste, Bossrahmen, Journal** von Etappe 2 kennen die neuen Merkmale: Behauptung → Nachsatz, Nebentakt mit eigenem Timer,
  Wut-Uhr, Reichweite, Geständnis und Beweise als Chips im Bossrahmen.

## Stand je Punkt

| # | Punkt | Stand |
|---|---|---|
| 1 | Engine-Merkmale `lie`, `line`, `tracks`, `enrage` | erledigt, datengetrieben, je Merkmal Unit-Tests |
| 2 | Big B in `DUNGEON_BOSSES` und `DUNGEON_CASTS` | erledigt; Figur = Kegelkönig Klaus mit Tönung, keine neue Figurengrafik |
| 3 | Söldner-Aufstellung nach Rolle, Reaktion auf `line` und `lie` | erledigt |
| 4 | Tresortür, Thronsaal, Endtruhe, Erfolg | erledigt |
| 5 | Beweise | Datenfeld und Wirkung vorbereitet (noch nicht im Dungeon verteilt, Etappe 4) |
| 6 | Farm-Lücke | erledigt; Befund: Gerd gab nach Ablauf eines Durchgangs am selben Tag wieder volle 600 EP |
| 7 | Warnungen für Big B | erledigt: Etappe 2 war vor dem Umbau auf `main`, die Merkmale stehen direkt in `boss-alerts.js`, Journal und Symbolen |

### 1 · Engine-Merkmale (`content/dungeons.js`, `dungeon.js`)

- **`lie {claim,truth,tell,mirror}`**
  - Beim Zauberbeginn (`prepareCast` aus `dungeonCastSpot`, Spieler- und Söldner-Zweig) zeigen Zauberleiste (`cast.name`) und
    Big Bs Sprechblase die Behauptung.
  - Nach `tell` (Grundwert 1,0 s, V-D5) wechselt `tickBossMechanics` auf den Nachsatz: Sprechblase, Ton `nachsatz`
    (`app.js sound`), Ereignis `dungeonLie`. Erst jetzt entstehen die echten Stellen am Boden.
  - `mirror`: Seite zufällig, Wortlaut gespiegelt („Ich reite nach RECHTS!“ / „… sagt man. Links.“).
  - Kein `tell` nach dem Geständnis oder wenn ein Beweis die Lüge streicht.
- **`line {lanes,claim,truth}`**: Bahnen über die ganze Länge der Arena als Anteile der Raumbreite von West nach Ost.
  - Phase 1 und 2: zwei Hälften. Die behauptete Bahn ist sicher, die andere trifft.
  - Phase 3: zwei äußere Bahnen zugleich, die Mitte (28 %) ist sicher („Ich reite nach LINKS!“ – „… und rechts.“).
  - Getroffen wird, wer beim Zauberende darin steht (Anteil 0,6 des Lebens).
- **`tracks [{cast,every,first}]`**: parallele Timer je Zaubermuster. Der Nebenzauber läuft als `sideCast` neben `e.cast`,
  die Timer laufen über Phasenwechsel weiter. Big B: Siegelring alle 12 s, erster nach 6 s.
- **`enrage {after,every,damage}`**: nach 360 s Kampf +50 % Schaden, alle 30 s erneut („Die ganze Wahrheit“). Wirkt auf Autoangriff
  (`e.damage`) und Anteils-Schaden (`strike`). Rückzug oder Wipe setzt zurück.
- Weitere Merkmale für Big B:
  - `tankDebuff` (Zertifikat): +10 % erlittener Schaden je Stapel, höchstens drei, 30 s. Parade des Helden bzw. „Deckel hoch“ des
    Schutz-Söldners löscht alle Stapel.
  - `circles`: Bodenstellen unter jedem Nicht-Schutz in der Arena, der Rest zufällig abseits von Boss und Schutz.
  - `persist`: Trümmer bleiben 8 s liegen, 5 % Leben je Sekunde darin.
  - `interrupts: 2`: „Am eigenen Schopf“ bricht erst nach zwei Unterbrechungen (Held in `engine.js`, Söldner in `companions.js`).
    Kommt der Zauber durch, heilt Big B 5 % (`selfHeal`).
  - `summon` am Zauberende (Live-Schalte ruft drei Follower).
  - `reach`: jeder lebende Follower gibt Big B +8 % Schaden.
  - `say`: Spruch beim Zauberbeginn ohne Lüge („Das ist nur ein Anruf.“).

### 2 · Big B

| Phase | Ablauf (Hauptzyklus) | Nebenher | Planung 7.6 |
|---|---|---|---|
| 1 (100–70 %) Empfang | Ritt auf der Kanonenkugel (lie, line), Mein Anwalt ruft gleich an (unterbrechbar, trifft einen Nicht-Tank) | Siegelring | wie geplant; Siegelring als Nebentakt statt im Zyklus |
| 2 (70–40 %) Follower | Live-Schalte (lie, 3 Follower), Kanonenkugel zweimal hintereinander (1 s Abstand), Das Parkett ist echt (lie, sechs Stellen) | Siegelring | wie geplant |
| 3 (40–0 %) Das Schloss bröckelt | Pappkulisse fällt (lie, vier Stellen, Trümmer), Kanonenkugel auf zwei Bahnen, Am eigenen Schopf (zweimal unterbrechen) | Siegelring | wie geplant |
| Geständnis (15 %, mit drei Beweisen 30 %) | keine Lügen mehr; mit drei Beweisen +10 % erlittener Schaden | – | wie geplant |

- **Zahlen** gegen die gemessene Gruppe gesetzt: 146.000 Leben, Schadensfaktor 2,2, 1.500 EP, Wut nach 6 min.
  Follower: 3.600 Leben, Schadensfaktor 1,2, 15 EP, keine Beute.
- **Sprüche** aus der Planung übernommen: Beginn, 70 %, 40 %, Geständnis, Tod und die Ausreden zu den Beweisen. Die Zeile „Rita? RITA!“
  liegt bereit, sobald Rita gebaut ist.
- **Figur:** `art:'klaus'` (Kegelkönig Klaus mit goldener Kette) mit violetter Tönung. Die Tönung läuft über eine kleine Ebene in
  `clan-art.js`, ohne Canvas-Filter. Die Bossgröße ×1,35 kommt aus Etappe 2 (`dungeonScale`). Eigene Big-B-Figur erst nach Freigabe.
- **Beute** `bigb` in `content/drops.js`: Dorflegenden „Siegelring ‚Echt Gold‘“ (Ring) und „Pelzmantel des Barons“ (Brust) je 12 %
  (Plan 11), Kronkorken, sicheres seltenes Teil wie bei Gerd. `rollDrop` kennt dafür `uniques` mit eigener Chance.

### 3 · Söldner-Aufstellung nach Rolle (`content/companions.js`, `companions.js`)

- **Rollen:** `COMPANION_ROLES.*.position`: Schutz `tank`, Heilung `spread`, Schaden `behind`. Radler-Rita (Fernkampf) überschreibt auf
  `spread`.
- **Wirkt** nur gegen Dungeon-Bosse und -Eliten (`formationSpot`), die offene Welt bleibt unverändert.
  - `tank`: stellt sich auf die Gegenseite des Gruppenschwerpunkts und dreht den Gegner damit von der Gruppe weg. Hält er ihn noch
    nicht, kommt er von der Seite, nie durch den Kegel.
  - `behind`: hinter dem Gegner, von dem aus gesehen, den er angreift. Liegen dort Trümmer oder eine Wand, weicht er seitlich aus.
  - `spread`: im Fächer ±40°/±72° hinter ihm, Abstand 112, mit Sichtlinie.
  - Plätze in schon angesagten Gefahren (echte Bahnen, Stellen, Trümmer) sind tabu. Ohne sicheren Platz bleibt der Söldner stehen.
    Das hat das Pendeln an der Bahnkante beseitigt.
- **Lüge:** Söldner warten den Nachsatz ab und gehen `reaction` (0,35 s) danach aus der echten Bahn bzw. Fläche.
  - Mit `lieError` 5 % fallen sie herein: Sie laufen nach der Behauptung in die Gegenbahn und bleiben 0,8 s nach dem Nachsatz dabei.
- **Weitere Reaktionen:**
  - Schadens-Söldner nehmen Follower zuerst (`priority`).
  - Bis zu zwei Söldner beanspruchen „Am eigenen Schopf“.
  - Der Schutz nutzt „Deckel hoch“ gegen den Siegelring, sobald er ein Zertifikat trägt.

### 4 · Tresortür, Thronsaal, Endtruhe, Erfolg

- **Tresortür:** `requiredSeals(def,lock.seals)` filtert gegen `DUNGEON_BOSSES`. Die Daten behalten alle drei Siegel.
  - Welt, Karte, Minikarte und Verfolgung zeigen nur die verlangten Siegelfelder (heute 1/1).
  - Die Durchsage „Die Tür ist offen.“ stimmt jetzt sogar.
- **Endtruhe** in der Schatzkammer (hinter Big B, `lock.boss`):
  - F „Endtruhe öffnen“ legt einen Beutel mit Wahl (`choice:1`): drei seltene Teile auf verschiedenen Plätzen, Stufe = Big Bs Stufe + 1,
    dazu 3 Siegelmarken. Einmal je Durchgang, im Laufstand gespeichert.
  - Das Beutefenster zeigt „1 / 3“ statt „Alles einpacken“. Nach der Wahl verfällt der Rest, nichts wird angelegt.
  - Beim Verlassen ohne Wahl wird das erste Teil eingesammelt.
- **Hinterausgang** in der Schatzkammer: F führt zurück auf die Burgstraße.
- **Abschluss:** `dungeons[id].clears`, `best` (Bestzeit in Spielsekunden des Durchgangs) und `firstClear`. Der erste Abschluss des Tages
  gibt den Tagesbonus. Etappe 2 liest die Bestzeit auf der Eingangskarte.
- **Erfolg „Der Nachsatz zählt“** (`DUNGEON_FEATS`): Big B besiegt ohne einen Treffer durch eine gelogene Kanonenkugel (`e.lieHits`).
  - Er steht im Spielstand unter `dungeons[id].feats`, unbekannte Einträge fallen beim Laden heraus.
  - Anzeige: Kurzmeldung „Erfolg: Der Nachsatz zählt“ und Haken-Chip im Beute-Moment.

### 5 · Beweise (V-D11 geändert)

Im Datenmodell gab es noch keine Beweise. Deshalb gibt es jetzt nur das Feld und die Wirkung, verteilt werden sie in Etappe 4.
- `DUNGEONS['schloss-bigb'].evidence`:
  - Mietvertrag: Das Parkett lügt nicht mehr.
  - Leihschein: Die Pappkulisse lügt nicht mehr.
  - Kirmes-Urkunde: Big B nimmt 10 % mehr Schaden.
  - Alle drei: Geständnis schon bei 30 %, danach +10 %.
- Laufstand `run.evidence`, gespeichert und geladen. `evidenceEffects(run)` liefert die Wirkung.
- Jede Wirkung hat Symbol und Tooltip und steht als Chip im Bossrahmen, sobald der Beweis im Durchgang liegt. Etappe 2 zählt schon
  `run.evidence` in Verfolgung und Karte.

### 6 · Farm-Lücke

- **Befund:** Ja. Nach Ablauf eines Durchgangs (30 min nach dem Verlassen) stand Gerd am selben Tag wieder mit vollen 600 EP.
- **Umbau** (`DUNGEON_REWARDS.repeatXp = 1/3`, `dungeons[id].daily.kills`):
  - Der erste Sieg des Tages über einen Boss gibt die vollen Boss-EP, jede Wiederholung am selben Tag ein Drittel.
  - Das gilt auch für die Helfer dieses Bosses.
  - Beute, Siegelmarken und der Tagesbonus des Flügels bleiben unverändert.
  - Das Beutefenster zeigt dann „⅓“ mit Tooltip.
- **Messung** `scripts/dungeon-sim.mjs --only=farm`, Held Dieter mit vier Söldnern, 60 min Spielzeit am selben Tag, siehe Tabelle.

### 7 · Warnungen (`boss-alerts.js`, `dungeon-journal.js`, `content/dungeon-ui.js`, `content/combat.js`, `map-symbols.js`)

Etappe 2 war vor dem Einbau auf `main` (ac87c87). Die Merkmale stehen deshalb direkt in deren Bausteinen.
- **Zauberleiste im Bossrahmen:** erst die Behauptung in Anführungszeichen, kursiv und gestrichelt (`bf-claim`), dann der Nachsatz
  mit rotem Rand (`bf-truth`).
- **Warnleiste:**
  - Die laufende Lüge zeigt dieselben zwei Stufen.
  - Nebentakt-Zeilen (`trackCasts`) haben einen eigenen Timer, z. B. „Parieren · ↻ Siegelring 3,9 s“.
- **Statuszeile im Bossrahmen:** Wut-Uhr („Wut in 5:56“, ab 30 s gelb, danach „Wut ×n“ rot), „Reichweite +24 %“, „Geständnis“ und je
  Beweis eine Lupe. Beim Eintritt der Wut und beim Geständnis kommt eine Ansage mittig.
- **Merkmale** in `castTraits`/`castSymbols` mit Zahlen im Tooltip: `tankDebuff`, `persist`, `interrupts`, dazu `lie` mit
  Nachsatz-Zeit und `line` mit Bahnen. `DUNGEON_UI.traits` hat zusätzlich `track`, `enrage` und `reach`, alle mit Rollenhinweisen.
- **Symbole:** `trait-tankDebuff`, `trait-track`, `trait-persist`, `trait-interrupts`, `trait-enrage`, `trait-reach`.
- **Journal:**
  - Big Bs Seite mit sieben Fähigkeiten: die Kanonenkugel nur einmal, der Siegelring als Nebentakt mit ↻.
  - Dazu drei Phasen (70/40/15 %) und ein Wut-Chip „6 min“.
  - Am Handy werden es bei mehr als fünf Fähigkeiten Symbolkacheln (Tippen zeigt Name und Antwort), damit nichts scrollt.

## Messtabelle (`scripts/dungeon-sim.mjs`)

Held Stufe 10, voller Satz ungewöhnlich, vier Söldner Stufe 10, Seeds 7/8/9. „vorher“ = `origin/main` ac87c87 mit demselben Messskript.

| Lauf | vorher | nachher |
|---|---:|---:|
| Big B, folgt dem Nachsatz (Dieter / Bärbel / Kevin) | nicht gebaut | 181/188/186 · 178/180/180 · 163/162/162 s (162–188 s), 0 Söldner am Boden |
| Big B, folgt der Behauptung, Tode je Lauf | – | 2/2/1/2/2/2/2/2/2 |
| Big B, folgt dem Nachsatz, Tode je Lauf | – | 0 in allen 9 |
| Gerd mit Held und 4 Söldnern | 76–96 s | 75–85 s |
| Gerd, Nicht-Tanks im Kegel beim Zauberbeginn (Mittel) | 0,98 | 0,31 |
| Gerd, „weicht aus“, Tode je Lauf | 0 in allen 9 | 0/0/0/0/1/0/0/0/0 |
| Gerd, „weicht nie aus“, Tode je Lauf | 2/1/2/1/2/2/1/2/2 | 1/2/2/2/2/2/1/2/2 |
| Held allein (unsterblich) | 245–385 s | 245–385 s |
| Flügel Burghof am Stück | 395–430 EP/min | 388–433 EP/min |
| Farm Hof West + Gerd, 60 min, 30-min-Sperre, Rest Feld | 111 EP/min | 101 EP/min |
| Farm Flügel Burghof, 60 min, 30-min-Sperre, Rest Feld | 115 EP/min | 106 EP/min |
| Farm Hof West + Gerd, 60 min ohne Sperre (nur Info) | 529 EP/min | 199 EP/min (Gerd 600, danach 200) |
| Feld Stufe 10 (höchster Wert) | 82 EP/min | 82 EP/min |

## Prüfkriterien

Ausgabe von `node scripts/dungeon-sim.mjs` (alle 11 grün):

| Kriterium | Wert |
|---|---|
| Big B mit Held und 4 Söldnern 150–200 s | 162–188 s |
| „folgt der Behauptung“ stirbt mindestens einmal | Tode je Lauf 2/2/1/2/2/2/2/2/2 |
| „folgt dem Nachsatz“ stirbt höchstens einmal | 0 in allen 9 Läufen |
| Gerd: im Mittel höchstens ein Nicht-Tank im Kegel | 0,31 je Rausschmiss beim Zauberbeginn (vorher 0,98) |
| Farm-Schleife über eine Stunde ≤ 2× Feld (30-min-Sperre wie im Spiel) | Gerd 101, Flügel 106 EP/min, Feld 82 |
| Etappe 1: Gerd 60–100 s | 75–85 s |
| Etappe 1: „weicht nie aus“ stirbt mindestens einmal | 1/2/2/2/2/2/1/2/2 |
| Etappe 1: „weicht aus“ stirbt höchstens einmal | 0/0/0/0/1/0/0/0/0 |
| Etappe 1: Held allein über 240 s | 245–385 s |
| Etappe 1: EP je Minute Flügel ≥ Feld | Flügel mindestens 388, Feld höchstens 82 |
| Etappe 1: Trash-Pack zieht keine Kette | hof-ost 0/2 |

Anmerkungen:
- **Farm ohne Sperre:** Diese Zeile ist nur ein Hinweis. Im Spiel ist ein verlassener Durchgang 30 Minuten gesperrt (`resetAfter`),
  auch über das Neuladen hinweg. Ohne diese Sperre läge die Farm-Schleife noch bei rund 2,4× Feld, weil der Trash volle EP gibt.
  Das wird wichtig, sobald Etappe 5 Instanzen zurücksetzen lässt.
- **Gerds Schutz-Söldner** fällt in den meisten Gerd-Läufen, schon vorher (vorher `mercDowns` 1 in 8 von 9 Läufen). Das Kriterium hält,
  bleibt aber ein Balancing-Punkt für Etappe 4 (Heilung gegen Liste und Adds).
- **Zufallsfolge:** Andere Bosse liefen im Hintergrund mit, würfelten beim Umherlaufen und verschoben so die Zufallsfolge. Das hatte
  „Held allein“ von 245 auf 225–235 s gedrückt. Die Simulation lässt jetzt nur den Boss stehen, um den es geht (`onlyBoss`).
  Mechanisch hat sich an Gerd nichts geändert.
- **Grenzen der Simulation:**
  - Das Profil „folgt dem Nachsatz“ weicht ideal aus.
  - Das Profil „folgt der Behauptung“ läuft bei jeder Ansage in die Gegenbahn und weicht sonst nichts aus.

## Prüfungen vor dem Push

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 967 von 967 grün (neu: 14 Tests in `tests/dungeon-e3.test.mjs`) |
| `npm run content:check` | grün (57) |
| `npm run build` | grün |
| `scripts/dungeon-check.mjs` | grün, Desktop und Handy |
| `scripts/dungeon-e1-check.mjs` | 7 von 7 grün |
| `scripts/dungeon-e3-check.mjs` (neu) | 14 von 14 grün |
| `scripts/dungeon-sim.mjs` | alle 11 Kriterien grün |
| `scripts/dungeon-e2-check.mjs` (zur Sicherheit) | grün |
| `scripts/optimierung-r5a-check.mjs` | **rot, vorbestehend, separat in Arbeit.** Fehlschlag: „Rechtsklick auf die eben gezeichnete Lage trifft den laufenden Gegner“. Auf 382ac5d (Etappe 1) grün, auf 9910d55 (Etappe 2 Teil 2) und ac87c87 (`main` ohne Etappe 3) mit demselben Fehler rot. Ein eigener Agent klärt das (`fix-rk`); die Rechtsklick-Logik ist hier nicht angefasst. |

`scripts/dungeon-e3-check.mjs` (CDP 9621, Server 4421, Bilder in `visual-review/dungeon-e3/`) prüft:
1. Tresortür vor Gerd zu, danach offen (verlangt nur Gerds Siegel); der Held läuft hindurch in den Thronsaal.
2. Lüge sichtbar: Zauberleiste und Warnleiste zeigen die Behauptung in Anführungszeichen, nach 1 s den Nachsatz. Die Welt wird zum
   Ansehen angehalten.
3. Aufstellung: Der Schutz hält Big B, die drei anderen Söldner stehen auf der Gegenseite (108–173°).
4. Phase 2 mit Followern und „Reichweite +24 %“ im Bossrahmen, Phase 3 mit zwei Bahnen.
5. Sieg ohne Lügen-Treffer: Erfolg im Spielstand und im Beute-Moment, Abschluss und Bestzeit.
6. Endtruhe: drei Teile, kein „Alles einpacken“, genau das gewählte Teil im Rucksack, nichts angelegt. Hinterausgang führt hinaus.
7. Handy quer (844 × 390) und hoch (390 × 844): Bossrahmen, Warnleiste im Bild, Behauptung und dann Nachsatz.
8. Journal Big B auf Desktop, Handy hoch und quer: sieben Fähigkeiten mit Symbol, Wut-Chip, nichts scrollt.

## Screenshots (`visual-review/dungeon-e3/`, nicht im Repo)

| Datei | Zeigt |
|---|---|
| `01-tresortuer-zu.jpg` | Tresortür vor Gerd |
| `02-tresortuer-offen.jpg` | offene Tresortür nach Gerds Siegel, Big B getönt im Thronsaal, Durchsage „Die Tür ist offen.“ |
| `03-behauptung.jpg` | „Ich reite nach LINKS!“ in Bossrahmen, Warnleiste, Zielrahmen und Sprechblase; am Boden die behauptete Bahn gestrichelt mit „?“ |
| `04-nachsatz.jpg` | „… sagt man. Rechts.“: echte Bahn rot mit Pfeilen und Kugel, die Behauptung durchgestrichen |
| `05-aufstellung.jpg` | Pils-Peter hält Big B, die anderen auf der Gegenseite |
| `06-phase2-follower.jpg` | drei Follower, „Reichweite +24 %“ im Bossrahmen |
| `07-phase3-zwei-bahnen.jpg` | Kanonenkugel auf zwei Bahnen, Mitte frei |
| `08-sieg-erfolg.jpg` | Geständnis und „Schnitt. Das nehmen wir nochmal.“, Beute-Moment mit +4 Marken, +2250 EP, Tagesbonus und Erfolg |
| `09-endtruhe-wahl.jpg` | Endtruhe: drei seltene Teile zur Wahl, „1 / 3“, +3 Siegelmarken |
| `10-hinterausgang-draussen.jpg` | nach dem Hinterausgang wieder auf der Burgstraße |
| `11/12-handy-quer-*.jpg`, `11/12-handy-hoch-*.jpg` | Handy: Behauptung und Nachsatz |
| `13-journal-*.jpg` | Journal Big B auf Desktop, Handy hoch und quer |

Hinweis zu den Bildern: Beim Vorspulen im Prüfskript sammeln sich Kampftexte, siehe `07`. Im Spiel laufen sie einzeln durch.

## Geänderte Dateien

| Bereich | Dateien |
|---|---|
| Daten | `content/dungeons.js` (Big B, Follower, Zaubermuster, Endtruhe, Hinterausgang, Beweise, Belohnungen, Erfolge, Texte), `content/companions.js` (Positionen, Fehlerquote), `content/drops.js`, `content/items.js`, `content/item-info.js`, `content/dungeon-ui.js` (Merkmale, Bossrahmen), `content/combat.js` (`castTraits`/`castSymbols`), `content/checks/loot.js` (`uniques`) |
| Laufzeit | `dungeon.js` (Merkmale, Tresortür, Endtruhe, Erfolg, Farm-Faktor, Abschluss), `companions.js` (Aufstellung, Nachsatz, Unterbrechen zu zweit, Zertifikat), `engine.js` (Zertifikat, Mehrfach-Unterbrechen, `dungeonChest`), `rpg.js` und `itemization.js` (Beutel mit Wahl, zweite Dorflegende, Helfer ohne Beute) |
| Oberfläche | `boss-alerts.js`, `dungeon-journal.js`, `dungeon-ui.css`, `map-symbols.js`, `rpg-ui.js` (Beute-Moment mit Erfolg und Wahl), `app.js` (Endtruhe anbieten, Ton), neue Datei `dungeon-bigb-art.js` (Bahnen, Stellen, Trümmer, Truhe, Hinterausgang; ein Aufruf in `renderer.js`), `clan-art.js` (Tönung), Siegelanzeige in `dungeon-art.js`, `dungeon-map-art.js`, `dungeon-map-ui.js`, `dungeon-ui.js` |
| Prüfungen | `tests/dungeon-e3.test.mjs` (neu, 14 Tests), `tests/dungeon.test.mjs` (Merkmalliste), `scripts/dungeon-sim.mjs` (Big B, Profile, Kegel, Farm, `--only`), `scripts/dungeon-e3-check.mjs` (neu) |

## Restliste

1. **Prüfer-Playtest am Handy** („liest Behauptung und Nachsatz ohne Hilfe“, Bauplan Etappe 3) ist nicht gelaufen. Er sollte vor
   Etappe 4 kommen, denn V-D5 knüpft die Attrappen bei Exposé daran.
2. **Texte sind Entwurf im Ton E-20**, Story muss sie abnehmen. Neu von mir sind die Endtruhe, der Abschluss, „⅓“, die Kampftexte
   (GELOGEN, DIE GANZE WAHRHEIT, SELBST RAUSGEZOGEN, GESTÄNDNIS), die Merkmal-Tooltips und die Beweis-Notizen. Die Spiegel-Varianten der
   Kanonenkugel („… sagt man. Links.“, „… und links.“) sind aus der Planung gespiegelt.
3. **Beweise** sind noch nicht im Dungeon verteilt (Etappe 4: Vermieter, Wehrgang, Rita). Das Vorlegen am Thron mit den drei Ausreden
   liegt als Text bereit.
4. **Figuren (freigabepflichtig):**
   - Big B ist ein getönter Kegelkönig Klaus, die Follower sind Schnorrer.
   - Eigene Grafik für Big B, Kanone, Thron und Pappkulissen braucht die Freigabe des Nutzers.
5. **Farm ohne Sperre** liegt bei rund 2,4× Feld (Trash voll). Das wird relevant, sobald Instanzen zurückgesetzt werden können
   (Etappe 5).
6. **Weitere Erfolge** aus Plan 11 („Beweislast“, „Schlossführung“, …) und der Titel fehlen; eine Erfolgsübersicht gibt es noch nicht.
7. **Gerds Schutz-Söldner** fällt in den meisten Läufen (schon vor Etappe 3). Das Heilbudget gegen Liste und Adds sollte Balancing
   ansehen.
8. **Big B am Handy hochkant:** Die Warnleiste hat mit dem Siegelring drei Zeilen und deckt mehr Arena ab als bei Gerd. Sie bleibt über
   den Kampfknöpfen und im Bild.
9. **Siegelmarken-Händler** (Vermieter Volker) fehlt weiter (Etappe 4).
