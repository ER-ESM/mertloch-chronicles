# Dungeon „Schloss Big B“ · Fix 4 nach der Nachprüfung · 2026-09-26

Grundlage:
- Nachprüfung des Prüfers live auf Build #726: `docs/PLAYTEST-2026-09-26-dungeon-bigb-2.md` (unverändert übernommen).
  Freigabe FREI, Nr. 1, 3, 6 und 7 teilweise.
- Vorarbeiten: `docs/DUNGEON-FIX3-2026-09-26.md`, `docs/DUNGEON-ETAPPE-3-2026-09-25.md`, `docs/DUNGEON-ETAPPE-4B-2026-09-25.md`,
  `docs/PLAYTEST-TESTZUGANG.md`.
- Nutzerentscheidung zu Punkt 10 (über den Orchestrator): Söldner dürfen einen Kampf ohne Held gewinnen. Mit Held als Heiler oder Tank soll
  es normal einen Wipe geben; mit nur zwei Schadens-Söldnern ist ein Sieg in Einzelfällen möglich. Belohnung für Aktivität kommt als eigener
  Auftrag.

Zweig `dungeon-fix4`, Worktree `D:\Dev\MertlochChronicles-dg-fix4`, Basis `main` 4e527c68 (Build #726).

Nicht angefasst: `CLAUDE.md`, `docs/ENTSCHEIDUNGEN.md`, Figurengrafik. Die Balance (Instanzfaktor der Söldner, Aktivität des Helden) ist nur
gemessen, nicht geändert.

## Kurzfassung

- **Richtungszeilen:** Jede Zeile hat eine Handlung. Laufen zeigt Pfeil und Lauftaste („Nach links [A]“). Bleiben zeigt ein grünes
  Halten-Symbol, „Stehen bleiben“ und die sichere Seite als grüne Kappe („links“, „rechts“, „Mitte“).
- **Reaktionszeit:** Die Kanonenkugel dauert 3,2 s, nach dem Nachsatz bleiben 2,2 s (vorher 2,0 s).
  - Gemessen steht die Richtungszeile 25–138 ms nach dem Nachsatz und zeigt 2,1–2,2 s.
  - Die Werte des Prüfers (1,4/1,2/0,1 s) waren Momentaufnahmen seiner Blicke, keine Anzeige-Verzögerung.
  - Die Zeile blinkt beim Nachsatz einmal auf.
- **Einleitung wie in WoW:** Big B bemerkt niemanden von selbst. Der Kampf beginnt, wenn der Held den Thron erreicht, ihn mit F anspricht oder
  angreift.
  - Am Thron steht „F Beweise vorlegen (3)“. Gefundene Beweise legt die Einleitung immer vor.
  - Big B redet sich im Bossrahmen heraus, die Lupen erscheinen, ein Pull-Timer „Kampfbeginn“ zählt herunter.
  - Dann fällt die Tür mit der ganzen Gruppe drin; der erste Zauber kommt nach 6 s Anlaufzeit.
- **Tooltips im Bossrahmen:** Lupen nennen Beweis und Wirkung, „Geständnis“ nennt Schwelle und Wirkung.
  - Ursache: Die Wut-Uhr baute alle Chips jede Sekunde neu, jeder Tooltip verschwand damit sofort wieder.
  - Jetzt werden die Chips an Ort und Stelle nachgeführt.
- **Endtruhe:** Beim Verlassen mit offener Wahl kommt eine Rückfrage. Sie ist die Dreierwahl selbst mit „Noch nichts gewählt“; wer wählt,
  geht gleich hinaus. Liegengebliebene Beute steht nach dem Übergang als kurze Meldung („Eingesammelt: 4 Teile · 25 Pfandmarken“).
- **Todesrückblick:** Das Sterbefenster zeigt die letzten fünf Treffer als Symbolzeilen (Fähigkeit, Quelle, Schaden, Sekunden vor dem Tod),
  darüber die Summe („Σ 918 in 3 s“).
- **Einblendungen:** Erst der Aufstieg, dann alle Erfolge des Siegs als eine Einblendung, mit voller Zeit.
- **F:** F bedient immer das nächste Weltobjekt (Truhe vor fernerem Beutel) und schließt kein Beutefenster mehr. Das Beutefenster steht links
  neben Minikarte und Verfolgung, der Klick auf „Endtruhe“ kommt an.
- **Sterbefenster:** Im Kampf heißt der Knopf „Kampf aufgeben“. Er ist zweitrangig; erst der zweite Klick gibt auf. Kein Tooltip ohne Hover.
- **Söldner-Ziele:** „auf Pils-Peter ↻ Siegelring“ ist nur Info, gedämpft und ohne Taste.
- **Punkt 10 (gemessen):** Ohne Heldenschaden fällt Big B in 229–249 s (14 von 15). Die Tabelle je Boss und Aufstellung steht unter Punkt 10.

## Ursache und Lösung je Punkt

### 1 · Jede Richtungszeile mit Handlung · `alert-answer.js`, `boss-alerts.js`, `content/dungeon-ui.js`, `dungeon-e4b.css`

**Ursache:** `laneAction` gab für „bleiben“ nur den Text („Links bleiben“, „Rechts bleiben“, „Mitte halten“) ohne Pfeil und ohne Taste zurück.
Die Zeile war grün, aber nicht als Handlung erkennbar.

**Lösung:**
- **Laufen:** Pfeil und Lauftaste wie bisher („Nach rechts [D]“, „In die Mitte [A]“).
- **Bleiben:** grünes Halten-Symbol (Hand), „Stehen bleiben“ und die sichere Seite als grüne Kappe. Tooltip des Symbols „Nichts drücken,
  stehen bleiben.“, Tooltip der Kappe „Du stehst schon auf der sicheren Seite. Nicht laufen.“
- Bodenstellen nach dem Nachsatz („Stehen bleiben“) tragen dasselbe Symbol.
- **Unit-Test:** alle Bahn-Zauber mit Lüge, beide Seiten (gespiegelt), 41 Standorte quer durch die Arena. Jede Zeile hat entweder Pfeil und
  Lauftaste oder Halten-Symbol, „Stehen bleiben“ und Seite; „bleiben“ steht nie in einer echten Bahn. Alle vier Fälle kommen vor.

### 2 · Mehr Reaktionszeit nach dem Nachsatz · `content/dungeons.js`, `dungeon.js`, `boss-alerts.js`

**Geprüft, warum der Prüfer weniger sah:**
- Die Spiellogik gab nach dem Nachsatz genau 2,0 s. Die Warnleiste zeigt die Handlung im selben Takt wie der Nachsatz.
  - Gemessen im Browser (`dungeon-fix4-check` Teil 2, drei Läufe, 28 Kanonenkugeln): 25–138 ms zwischen Nachsatz und erster Anzeige der
    Richtungszeile.
  - Gezeigt werden dabei 2,1–2,2 s (3,2 s beim Doppelritt in Phase 3).
- Die Spielzeit läuft nie schneller als die Echtzeit (je Bild höchstens 50 ms).
- Die Werte des Prüfers sind Momentaufnahmen: Seine Bilder entstehen im Abstand von Sekunden, irgendwo im 2-s-Fenster.
- Die 0,1 s beim Betreten waren echt: Der Rechtsklick auf Big B lief hin und griff an. Der Kampf begann beim Betreten, der erste Zauber
  nach 3 s – als das erste Bild entstand, lief die erste Bahn schon aus.

**Lösung:**
- **Kanonenkugel 3,2 s:** Nach dem Nachsatz bleiben 2,2 s. Damit zeigt auch die erste Anzeige sicher mehr als 2,0 s.
  - 3,4 s habe ich gerechnet: In der Simulation fielen dann bei Dieter/Seed 8 alle vier Söldner.
- **Anweisung gleich beim Nachsatz:** Die Richtungszeile blinkt beim Nachsatz einmal auf (Rahmen und kurzer Zoom, ohne bei
  `prefers-reduced-motion`).
- **Nach dem Geständnis** bzw. mit dem passenden Beweis lügt Big B nicht mehr. Die Vorschau zeigt dann „Raus aus der Bahn“ bzw. „Fläche
  verlassen“ statt „Nachsatz abwarten“.
- **Anlaufzeit:** Der Kampf beginnt erst nach der Einleitung (Punkt 3), die Gruppe steht dann drin. Der erste Zauber kommt nach 6 s
  (`DUNGEON_BOSSES.bigb.intro.opener`).

### 3 · Beweise sichtbar vorlegen · `dungeon.js`, `engine.js`, `boss-alerts.js`, `dungeon-clarity.js`, `content/dungeons.js`, `content/dungeon-ui.js`

**Ursache:**
- Big B bemerkte den Helden, sobald er in seinem Raum stand. Der Rechtsklick auf Big B lief per Wegsuche hinein und griff an.
- „F Beweise vorlegen“ gab es nur an der Tresortür. Wer per Rechtsklick durchlief, kam nie daran vorbei.

**Lösung (Rollenspiel-Einleitung wie in WoW, `DUNGEON_BOSSES.bigb.intro`):**
- Ein Boss mit Einleitung bemerkt niemanden von selbst (`dungeonNotices`) und nimmt keinen Schaden, solange er wartet (`bossHeld`).
- **Der Kampf beginnt, wenn der Held:**
  - den Thron erreicht (5 Kacheln um Big B),
  - Big B mit F anspricht (13 Kacheln; „Beweise vorlegen (n)“ mit gefundenen Beweisen, sonst „Big B ansprechen“),
  - oder ihn angreift – der Angriff spricht ihn an, statt Schaden zu machen.
- **Ablauf:**
  - Gefundene Beweise legt die Einleitung immer vor („3 Beweise liegen auf dem Thron. Big B schwitzt.“).
  - Big B antwortet mit je einer Ausrede im Abstand von 2 s, danach seine Begrüßung (3 s).
  - Dann fällt die Tür, die ganze Gruppe steht drin, der erste Zauber kommt nach 6 s.
  - Das Vorlegen an der Tresortür bleibt; es startet keinen Kampf.
- **Sichtbar:**
  - Während der Einleitung steht schon der Bossrahmen. Big B spricht in dessen Sprechzeile, keine Blase in der Welt, der Zonentitel wartet.
  - Die Lupen erscheinen mit dem Vorlegen.
  - Die Warnleiste zählt „Kampfbeginn“ herunter wie ein Pull-Timer.
- **Abbruch:** Geht der Held hinaus oder fällt er, bricht die Einleitung ab. Beim nächsten Ansprechen kommt nur noch die Begrüßung; nach
  einem Wipe ebenso.
- **Tooltips:**
  - Lupe: „Vorgelegt: Leihschein vom Kostümverleih – Leihschein: Die Pappkulisse lügt nicht mehr.“, mit allen drei dazu „Geständnis schon
    bei 30 %“.
  - „Geständnis“: „Ab 30 % lügt Big B nicht mehr: Der Nachsatz kommt sofort, es gibt keine gestrichelte Behauptung. Mit allen drei Beweisen
    nimmt er dazu 10 % mehr Schaden.“
- **Tooltip-Fehler behoben:** Die Statuszeile baute alle Chips neu, sobald sich ein Text änderte, also mit der Wut-Uhr jede Sekunde. Der
  Tooltip ging mit seinem Chip. Jetzt entstehen Chips nur neu, wenn welche kommen oder gehen.

### 4 · Die Endtruhe verfällt nicht still · `dungeon.js` (`chestPending`), `dungeon-ui.js` (`leave`), `rpg-ui.js`, `engine.js`, `content/dungeons.js`

**Ursache:** `leaveDungeon` sammelte jeden Beutel im Dungeon ein. Bei der Truhe nahm `autoLootBag` das erste Teil, ohne Rückfrage.

**Gewählt: Rückfrage wie in WoW, als Dreierwahl selbst.**
- Wer mit offener Wahl geht (Truhe geöffnet und nichts gewählt, oder nach Big B gar nicht geöffnet), bleibt stehen.
- Es öffnet sich das bekannte Beutefenster der Endtruhe: drei Teile, „1 / 3“, darüber „Noch nichts gewählt“ mit Ausgangssymbol. Die
  Erklärung steht im Tooltip.
- **Die Wahl per Klick nimmt das Teil, und der Held geht gleich hinaus.** Wer das Fenster schließt, bleibt. Wer danach trotzdem geht, packt
  das erste Teil ein – mit eigener Meldung „Endtruhe: … eingepackt.“
- Die Rückfrage gilt im ganzen Dungeon, am Hinterausgang wie am Rolltor.

**Begründung:** Diese Variante braucht keinen Fließtext. Sie zeigt ein Fenster, das der Spieler schon kennt, an der Stelle, an der er geht.
Das Nachholen bis zum Tagesreset bräuchte einen neuen Ort (Volker oder ein eigenes Fenster) und müsste die Frist erklären („bis 4 Uhr“).

**Liegengebliebene Beute:** Das Verlassen sammelt weiter ein, wie bisher. Die kurze Meldung nennt jetzt, was drin war, und kommt nach dem
Übergang („Eingesammelt: 4 Teile · 25 Pfandmarken“). Vorher kam sie im dunklen Übergang und war nicht zu sehen.

### 5 · Todesrückblick · `engine.js` (`noteHit`, `recentHits`), `death-screen.js` (`deathRecap`), `content/combat.js`

**Ursache:** Das Todesereignis kannte nur den letzten Treffer.

**Lösung:**
- `hitPlayer` protokolliert jeden Treffer (Quelle, Fähigkeit, Autoangriff oder Fläche, Schaden, Zeit). `die` gibt die Treffer der letzten
  10 s mit.
- Das Sterbefenster zeigt unter dem Todesschlag die letzten fünf als Symbolzeilen: Schwerter bzw. Fläche, Fähigkeit, Quelle, Schaden,
  Sekunden vor dem Tod. Der letzte Treffer steht unten und hebt sich ab.
- Darüber steht die Summe („Σ 918 in 3 s“). Den Zusammenhang erklärt der Tooltip, nicht ein Satz.

### 6 · Erfolg nach dem Stufen-Banner · `milestone-ui.js`, `content/unlocks.js`, `dungeon-e4b.css`

**Ursache:** Beide standen schon in derselben Schlange, der Aufstieg zuerst. Danach wurde der Erfolg aber gekürzt: bei Stau auf 65 %, und
bei wartenden Kurzmeldungen schloss er nach 1,6 s. Beim ersten Abschluss kommen bis zu fünf Erfolge und ein Titel, die liefen einzeln in
kurzen Abständen durch.

**Lösung:**
- Erfolge und Titel, die zusammen fällig werden, stehen als **eine** Einblendung hinter dem Aufstieg, zum Beispiel „4 Erfolge · Beweislast ·
  Titel: Mieterschützer · Termin eingehalten · Ohne Kratzer“, jeder Name mit Symbol und Tooltip.
- Sie bekommt die volle Zeit (3,2 s, bei mehreren bis 5,6 s), ohne Kürzung durch Stau oder Kurzmeldungen.
- Gemessen im Browser: Aufstieg 2,7 s, danach die Erfolge.

### 7 · F doppelt belegt, Beutefenster über der Verfolgung · `app.js`, `popup-windows.js`

**Ursache:**
- F schloss ein offenes Beutefenster, statt zu handeln.
- Ein Beutel ging immer vor der Truhe, auch wenn die Truhe näher stand.
- Das Beutefenster startete fest bei `innerWidth-360`, genau über der Verfolgung.

**Lösung:**
- F bedient immer das nächste Weltobjekt: Steht die Endtruhe näher als ein Beutel, öffnet F die Truhe. Der Beutel einer geöffneten Truhe
  heißt „Endtruhe öffnen“.
- Offene Beutefenster schließt Esc, nicht F. Gespräch und Erinnerung schließt F weiter, dort ist F „weiter“.
- Das Beutefenster steht ohne gemerkte Position links neben der Spalte aus Minikarte und Verfolgung.
- Gemessen: kein Überlapp. Die Zeile „Endtruhe“ liegt oben (`elementFromPoint`), der Klick setzt die Wegmarke und läuft hin.

### 8 · Sterbefenster · `death-screen.js`, `content/combat.js`, `dungeon-e4b.css`

**Ursache:**
- Im Kampf war „Am Kontrollpunkt aufstehen“ der goldene Hauptknopf, dabei gibt er den Kampf auf.
- Der Tooltip stand offen, weil der Bildschirm den Knopf fokussierte und der Fokus Tooltips öffnet.

**Lösung:**
- Im Kampf heißt der Knopf „Kampf aufgeben“, zweitrangig (Umriss, kleiner).
- Der erste Klick macht ihn 3 s scharf („Nochmal: aufgeben“, Laufbalken), erst der zweite gibt auf. Danach wird er wieder entschärft.
- Nach dem Kampf („Hier aufstehen“) und nach einem Wipe bleibt er der goldene Hauptknopf.
- Der Bildschirm fokussiert sich selbst, nicht den Knopf. Der Tooltip erscheint nur beim Hover.

### 9 · Warnzeile für Söldner-Ziele · `alert-answer.js` (`otherTarget`), `boss-alerts.js`

**Ursache:** Die Zeile hängte nur den Namen an („Ausweichen [Leer] · auf Pils-Peter“), die Handlung blieb die des Helden.

**Lösung:**
- Trifft eine Mechanik einen Söldner, ist die Zeile nur Info: „auf Pils-Peter ↻ Siegelring“, gedämpft, ohne Taste.
  - Das gilt für das Zertifikat des Siegelrings, laufend oder vorhergesagt (der Halter von Big B).
  - Ebenso für Einzelziele ohne Fläche.
- Auf dem Helden bleibt es „Ausweichen [Leer]“ bzw. „Parieren [5] / Ausweichen [Leer]“.
- Bahnen und Flächen treffen alle, dort bleibt die Handlung.

### 10 · Söldner allein – nur gemessen (`scripts/dungeon-sim.mjs`)

Die Balance ist nicht geändert. Zwei neue Teile nur mit `--only`, ohne Kriterium: `nohero` und `ohneheld`. `--only=ohneheld` bleibt für den
Folgeauftrag im Repo.

**a) Big B ohne Heldenbeitrag** (`--only=nohero`, 5 Klassen × Seeds 7–9, typische Ausrüstung, vier Söldner):

| Fall | Siege | Dauer |
|---|---|---|
| mit Held (Kriterium, zum Vergleich) | 15/15 | 166–194 s |
| Held lebt, weicht aus, macht keinen Schaden (Autoangriff aus) | 14/15 | 229–249 s |
| Held liegt ab 20 s (wie beim Prüfer) | 15/15 | 220–243 s |

Ohne Held dauert es rund 25 % länger, liegt aber weit vor der Wut (360 s). Die einzige Niederlage (Kevin, Seed 8) war ein Wipe durch
Siegelring-Stapel auf dem Schutz.

**b) Jeder Boss, der Held fällt bei 50 % und bleibt liegen** (`--only=ohneheld`, Seeds 7–9):
- (a) Held Tank (Dieter Zapfhahn, Kevin Eisen, Schorsch Rauch) + Heilung + 2× Schaden, kein Söldner-Tank
- (b) Held Heiler (Bärbel Pflege, Schorsch Chef, Käthe Herz) + Schutz + 2× Schaden, kein Söldner-Heiler; der Held heilt vor dem Fall wie ein
  Spieler den schwächsten Söldner
- (c) Held Schaden (fünf Klassen) + Schutz, Heilung, 2× Schaden (Normalfall)
- (d) wie (c), bei 50 % fallen auch Schutz und Heilung, nur die zwei Schadens-Söldner stehen

Siege je Aufstellung (Siege/Läufe, Dauer der Siege). Bei Niederlagen steht die Art dabei:
- Wipe: alle liegen
- Limit: nach 420 s kein Sieg, der Boss steht wieder bei 100 %
- tiefst: tiefstes Bossleben im verlorenen Lauf

| Boss | (a) Held Tank | (b) Held Heiler | (c) Held Schaden | (d) nur 2× Schaden |
|---|---|---|---|---|
| Gerd | 9/9 (125–312 s) | 0/9 · Wipe 9 · tiefst 27–41 % | 15/15 (99–104 s) | 0/15 · Wipe 15 · tiefst 42–49 % |
| Frau Dr. Exposé | 0/9 · Limit 9 · tiefst 14–28 % | 0/9 · Limit 9 · tiefst 6–24 % | 1/15 (109 s) · Limit 14 · tiefst 9–44 % | 0/15 · Wipe 3, Limit 12 · tiefst 31–49 % |
| Korken-Kurt | 2/9 (146–178 s) · Wipe 7 · tiefst 10–16 % | 0/9 · Wipe 9 · tiefst 21–43 % | 14/15 (102–122 s) · Wipe 1 bei 28 % | 0/15 · Wipe 15 · tiefst 43–48 % |
| Reichweiten-Rita | 9/9 (167–189 s) | 9/9 (122–144 s) | 15/15 (101–119 s) | 0/15 · Wipe 15 · tiefst 11–22 % |
| Das halbe Pferd | 0/9 · Limit 9 · tiefst 88–92 % ¹ | 0/9 · Wipe 9 · tiefst 16–28 % | 15/15 (87–96 s) | 0/15 · Wipe 15 · tiefst 36–50 % |
| Big B | 5/9 (321–361 s) · Wipe 4 · tiefst 21–47 % | 0/9 · Wipe 9 · tiefst 33–44 % | 14/15 (200–212 s) · Wipe 1 bei 26 % | 0/15 · Wipe 15 · tiefst 45–49 % |
| **alle** | **25/54** | **9/54** | **74/90** | **0/90** |

¹ Das halbe Pferd kam mit Held-Tank in 420 s nie auf 50 %. Der Held fiel also gar nicht. Der Simulations-Held zieht das Pferd nicht vom Trog
weg (das tut sonst der Schutz-Söldner), es säuft und heilt sich. Das ist eine Grenze der Simulation, kein Befund über Tanks.

Einordnung gegen die Erwartung der Nutzerentscheidung:
- **(a) Held Tank → „meist Wipe“:** 25 von 54 gewonnen, also nicht „meist Wipe“.
  - Gerd und Rita fallen ohne Söldner-Tank immer, Big B in 5 von 9 Läufen (alle drei mit Dieter, zwei mit Schorsch, keiner mit Kevin).
  - Wipes gibt es bei Kurt und Big B, Exposé läuft ins Zeitlimit.
- **(b) Held Heiler → „meist Wipe“:** trifft zu, 9 von 54 gewonnen, alle bei Rita.
- **(c) Held Schaden → „Sieg möglich“:** trifft zu, 74 von 90 gewonnen.
  - Ohne Heldenbeitrag ab 50 % legen die Söldner jeden Boss außer Exposé fast immer.
  - Nur Exposé (1 von 15) scheitert: Ohne Held läuft sie ins Zeitlimit und setzt zurück.
- **(d) Nur 2× Schaden → „in Einzelfällen Sieg“:** trifft nicht zu, 0 von 90. Die tiefsten Stände liegen bei 11–50 %; am weitesten kommen die
  zwei bei Rita (bis 11 %).
- **Heute:** Ein Sieg ohne Heldenbeitrag ab der Hälfte gelingt im Normalfall (c) in 82 % der Läufe, bei Big B in 14 von 15. Bei Big B ganz
  ohne Heldenschaden 14 von 15 (siehe a).

## Simulation (`node scripts/dungeon-sim.mjs`, alle Teile)

Endstand, voller Lauf ohne `--only`, **alle Kriterien grün** (Orchestrator hat den Lauf nach dem Handback zu Ende laufen lassen, Log
`scratchpad/dgfix4/sim-final.log`). Auszug:

| Kriterium | Ergebnis |
|---|---|
| Big B mit Held + 4 Söldnern 150–200 s | 171–194 s (neue Klassen als Angabe: Schorsch 180–186 s, Käthe 166–172 s) |
| Gerd: Schutz-Söldner überlebt die meisten Läufe | fällt in 0 von 9 |
| Jeder Flügel 10–15 min (ein Pack je Zug) | Burghof 12,0 · Rittergeschoss 12,1 · Basaltgewölbe 10,9 min |
| Voller Durchgang unter 50 min | 37,5 min (Nachbarn ziehen mit, nur Angabe: 50,8 min) |
| Rita im Flügel 70–110 s | 83 s |
| Rückweg-Gegner nach spätestens 8 s zu Hause | längster Rückweg 0 s |
| EP je Minute je Flügel 1–2× Feld (Wiederholung) | 119–152 · erster Lauf des Tages 192–269 · Feld 84 |
| Typische Ausrüstung: jeder Pack ohne Wipe/Tod | 81 Pulls, Heilung Median 40 % |
| Startausrüstung: jeder Pack schaffbar | 81 Pulls, 0 Ausfälle |
| Erster Pull wie ein Neuling (Hof West, ohne Unterbrechen) | kein Ausfall (typisch), kein Wipe (Start) |
| Startausrüstung: jeder Boss schaffbar | gewonnen, z. B. Gerd 96 s, Exposé 96 s, Kurt 101 s, Rita 109 s |
| Farm-Schleife über eine Stunde ≤ 2× Feld | Gerd 103 · Flügel 99 · Feld 84 EP/min |

## Prüfungen

Ports CDP 9721–9729, Server 4521–4529, `BOOT_TRIES=450`. Der Rechner war stark belastet (bis zu sieben Prüf-Browser und zwei Simulationen
parallel).

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 1266/1266 grün (inkl. `tests/dungeon-fix4.test.mjs`) |
| `npm run content:check` | 57/57 grün |
| `npm run build` | grün |
| `npm run ui:check` | 14/14 grün, Desktop 2024×900: kein Fenster scrollt |
| `dungeon-check` | Desktop und Handy grün (Eingang, Betreten, Gerds Kegel, Siegel, Treppe, Karte, Verlassen) |
| `dungeon-e1-check` | 7 grün |
| `dungeon-e2-check` | 17 grün |
| `dungeon-e3-check` | 14 grün |
| `dungeon-e4a-check` | 36 grün |
| `dungeon-e4b-check` | 11 grün |
| `dungeon-hotfix-check` | 8 grün |
| `dungeon-fix2-check` | 15 grün |
| `dungeon-fix3-check` | 9 grün (erster Lauf unter Parallel-Last einmal rot „Text in der Bildmitte“; allein wiederholt grün, 1621 Messungen ohne Überlappung) |
| `dungeon-fix4-check` | 8/8 grün |
| `mobile-check` Dungeon (hoch/quer) | 10 Schritte, 0 Befunde, keine Laufzeitfehler |
| `dungeon-raeume-check` | Teile 1–5 grün (15 Räume, Eingang ohne Baumkronen, Handy, Geheimnisse, 45 Wege / 121 Requisiten). Teil 6 (Bildzeit) rot unter Last, **gleichauf mit dem Live-Stand** (siehe unten) |

**Bildzeit A/B** (`ONLY=6 DENS=2,3 AB_URL=…`, Fix 4 gegen den Live-Stand `4e527c68` im selben Zeitfenster; auf dem Rechner liefen
dabei gut 30 Chrome-Prozesse anderer Sitzungen):

| Ebene @ Dichte | Fix 4 Median / p90 | Live Median / p90 | Zeichnen Fix 4 / Live (Median) |
|---|---|---|---|
| draußen @2 | 16,7 / 33,3 ms | 16,7 / 33,4 ms | 1,7 / 1,8 ms |
| Erdgeschoss @2 | 16,7 / 16,7 ms | 16,7 / 16,8 ms | 3,1 / 3,1 ms |
| Keller 1 @2 | 16,7 / 33,3 ms | 16,7 / 33,3 ms | 4,4 / 4,5 ms |
| Keller 2 @2 | 16,7 / 33,3 ms | 16,7 / 33,4 ms | 5,4 / 5,7 ms |
| draußen @3 | 16,7 / 33,4 ms | 49,9 / 967 ms (ausgehungert) | 1,5 / 2,1 ms |
| Erdgeschoss @3 | 33,3 / 33,4 ms | 16,7 / 33,4 ms | 3,4 / 2,8 ms |
| Keller 1 @3 | 33,3 / 49,9 ms | 33,3 / 33,5 ms | 6,2 / 6,1 ms |
| Keller 2 @3 | 33,3 / 33,4 ms | 33,3 / 49,9 ms | 7,0 / 8,0 ms |

Die Zeichenzeit ist auf beiden Seiten gleich, und der Bildabstand schwankt in beide Richtungen: Der Live-Stand scheitert im selben
Zeitfenster an der festen Schwelle von 17,5 ms genauso. Fix 4 ändert nichts am Zeichnen der Räume. Muster wie in Fix 2 und im Feinschliff:
unter Last rot, auf ruhigem Rechner grün.

`scripts/dungeon-fix4-check.mjs` (CDP 9721, Server 4521; `ONLY=1,…`) spielt Big B mit dem Testzugang `bigb` wie beim Prüfer: Tresenbrecher,
typische Ausrüstung ohne Schild, vier Söldner, drei Beweise gefunden. Echte Maus und echte Tasten, ein Spieler-Bot weicht aus.
1. **Einleitung:**
   - Mit D durch die Tresortür: beim Betreten kein Kampf (keine Einleitung, Tür offen).
   - Am Thron „F Beweise vorlegen (3)“; F → Bossrahmen mit Ausreden und Begrüßung, Pull-Timer.
   - Lupe per Maus: Tooltip mit Wirkung, der nach 1,6 s noch steht.
   - Tür zu mit vier Söldnern drin, erster Zauber nach 6,0 s.
2. **Kampf:**
   - Jede Kanonenkugel: Richtungszeile im selben Takt wie der Nachsatz, gezeigt ≥ 2,0 s, mit Handlung.
   - Jede Zeile hat eine Handlung.
   - Siegelring auf Pils-Peter bzw. Hopfen-Horst nur als Info, nie mit Taste.
   - Geständnis-Tooltip per Maus.
3. **Nach dem Sieg:**
   - Aufstieg, dann die Erfolge.
   - Beutefenster ohne Überlapp mit der Verfolgung; Klick auf „Endtruhe“ im Tracker läuft hin.
   - F bei offenem Big-B-Fenster öffnet die Truhe.
   - Rechtsklick auf den Hinterausgang → Rückfrage mit drei Teilen → Wahl per Maus → Burgstraße, Teil im Rucksack, Meldung „Eingesammelt: …“.
4. **Tod im Kampf** (per Rechtsklick aus dem Gang, Einleitung am Thron):
   - Rückblick mit fünf Zeilen und Summe.
   - „Kampf aufgeben“ zweitrangig, kein Fokus, kein Tooltip ohne Hover.
   - Erster Klick nur scharf, nach 3 s wieder entschärft; Tooltip beim Hover.

Bilder `visual-review/dungeon-fix4/*.jpg` (lokal, nicht im Repo), angesehen:

| Bild | zeigt |
|---|---|
| `10-betreten-kein-kampf.jpg`, `11-f-beweise-vorlegen.jpg` | Held im Thronsaal ohne Kampf; „F Beweise vorlegen (3)“ am Thron |
| `12-einleitung-ausrede.jpg`, `13-lupe-tooltip.jpg` | Bossrahmen mit Ausrede und drei Lupen, „Kampfbeginn 7,0 s“; Tooltip „Vorgelegt: Leihschein … Alle drei Beweise: Geständnis schon bei 30 %.“ |
| `14-kampfbeginn.jpg` | Tür zu, Begrüßung im Bossrahmen, „auf Hopfen-Horst ↻ Siegelring“ als Info, „Nachsatz abwarten [A·D] 8,6 s“ |
| `20-nachsatz-handlung.jpg`, `21-stehen-bleiben.jpg` | „✋ Stehen bleiben [links] … sagt man. Rechts.“ neben der roten Bahn |
| `22-siegelring-info.jpg`, `24-gestaendnis-tooltip.jpg` | „auf Pils-Peter ↻ Siegelring“; Tooltip „Geständnis: Ab 30 % …“ |
| `30-tod-rueckblick.jpg`, `31-aufgeben-scharf.jpg` | Rückblick „Σ … in 3 s“ mit fünf Zeilen, „Kampf aufgeben“ als Umrissknopf; nach dem ersten Klick „Nochmal: aufgeben“ |
| `39-erfolge-nach-aufstieg.jpg` | „4 Erfolge · Beweislast · Titel: Mieterschützer · Termin eingehalten · Ohne Kratzer“ oben |
| `40-beute-neben-verfolgung.jpg`, `41-f-oeffnet-truhe.jpg` | Beutefenster links neben der Verfolgung; nach F die Endtruhe „1 / 3“ |
| `42-rueckfrage-truhe.jpg`, `43-draussen-meldung.jpg` | Rückfrage „Noch nichts gewählt“ am Hinterausgang; draußen „Eingesammelt: 4 Teile · 25 Pfandmarken“ |

Anpassungen an bestehenden Prüfungen (Verhalten gewollt geändert):
- `tests/dungeon-fix3.test.mjs`: „bleiben“ heißt jetzt „Stehen bleiben“ mit Symbol und Seite; im Kampf „Kampf aufgeben“.
- `tests/dungeon.test.mjs`: Die Beute-Meldung beim Verlassen steht im Chat und kommt als Kurzmeldung aus `run.gathered`.
- `scripts/dungeon-e1-check.mjs`: im Kampf „Kampf aufgeben“; am Handy gibt erst der zweite Tipp auf.
- `scripts/dungeon-fix3-check.mjs`: Knopf „Kampf aufgeben“; Siegelring auf einem Söldner zählt als Info.

## Geänderte Dateien

| Bereich | Dateien |
|---|---|
| Laufzeit | `dungeon.js` (Einleitung `bossHeld`/`introState`/`addressBoss`/`engageBoss`, F am Thron, `chestPending`, Beute-Meldung beim Verlassen), `engine.js` (Angriff spricht an, Treffer-Protokoll, Rückfrage-Beutel erreichbar), `alert-answer.js` (Halten, Info, keine Lüge), `dungeon-clarity.js` |
| Oberfläche | `boss-alerts.js` (Halten-Symbol, Seite, Info, Blinken, Chips an Ort und Stelle, Einleitung mit Pull-Timer), `death-screen.js` (Rückblick, Kampf aufgeben, Fokus), `milestone-ui.js` (Erfolge gebündelt, volle Zeit), `dungeon-ui.js` (Rückfrage, Meldung nach dem Übergang), `rpg-ui.js`, `app.js` (F), `popup-windows.js` (Beute neben der Verfolgung), `dungeon-e4b.css` |
| Daten | `content/dungeons.js` (Kanonenkugel 3,2 s, `bigb.intro`, Texte), `content/dungeon-ui.js`, `content/combat.js` (Rückblick, Aufgeben), `content/unlocks.js` |
| Prüfungen | `scripts/dungeon-fix4-check.mjs` (neu), `tests/dungeon-fix4.test.mjs` (neu, 13 Tests), `scripts/dungeon-sim.mjs` (Einleitung, `--only=nohero`, `--only=ohneheld`), `scripts/dungeon-e1-check.mjs`, `scripts/dungeon-fix3-check.mjs`, `tests/dungeon-fix3.test.mjs`, `tests/dungeon.test.mjs` |
| Doku | `docs/DUNGEON-FIX4-2026-09-26.md`, `docs/PLAYTEST-2026-09-26-dungeon-bigb-2.md` (Prüferbericht, unverändert) |

## Restliste

1. **Held nicht passiv, Aktivität belohnen** (Nutzerentscheidung): eigener Auftrag. Grundlage sind die Zahlen unter Punkt 10 und
   `--only=ohneheld`.
2. **Einleitung und Anlaufzeit:** Mit drei Beweisen dauert die Einleitung 9 s, dazu 6 s bis zum ersten Zauber. Ob das zu lang ist, sollte
   der nächste Playtest zeigen. Die Einleitung gibt es nur bei Big B.
3. **Parkett und Pappkulisse** lassen nach dem Nachsatz weiter 1,8 bzw. 1,6 s (aus Fix 3; mit 3,0 s fiel dort in der Simulation eine Gruppe).
4. **Nicht beauftragte Nebenbefunde des Prüfers**, nicht angefasst:
   - Beim Verlassen ging ungefragt die große Erinnerung „Wurst Case“ auf.
   - Nach dem Verlassen haben die Söldner weniger Höchstleben (Instanzfaktor, z. B. Schorle-Susi 782 statt 1.408).
5. **Playtest:** Ein Prüfer-Durchgang auf dem neuen Stand (Einleitung, Rückfrage, Rückblick) steht aus.

## Veröffentlichung

Fix 4 als ein Commit auf `main` (FF, ohne Rebase-Konflikt; `main` stand unverändert auf `4e527c68`), danach
`node scripts/server-refresh.mjs`. Build-Nummer und Commit stehen im Nachtrag-Commit „Bericht Dungeon-Fix 4: Live-Stand“.
