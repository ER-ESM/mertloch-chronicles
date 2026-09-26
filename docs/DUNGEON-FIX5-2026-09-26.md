# Dungeon „Schloss Big B“ · Fix 5 nach dem Prüfer-Playtest am Endboss · 2026-09-26

Grundlage:
- Prüfer-Playtest live auf Build #728: `docs/PLAYTEST-2026-09-26-dungeon-bigb-3.md` (unverändert übernommen). Urteil NACHBESSERN; Nr. 1, 2, 3, 5
  und 7 nur teilweise, Nr. 6 ungeprüft.
- Vorarbeit: `docs/DUNGEON-FIX4-2026-09-26.md`.
- Vorgabe des Orchestrators zu Punkt 5: WoW-Muster. Die Rede läuft, danach wartet Big B, bis der Held angreift oder ganz nah herangeht.

Zweig `dungeon-fix5`, Worktree `D:\Dev\MertlochChronicles-dg-fix5`, Basis `main` c2f66547 (Build #728).

Nicht angefasst: `CLAUDE.md`, `docs/ENTSCHEIDUNGEN.md`, Figurengrafik, das Söldner-Verhalten und die Frage „Söldner gewinnen ohne Held“
(Auftrag „Held aktiv“ im Zweig `dungeon-aktiv`). Im Söldner-Code steht nur eine Zeile: Ein wartender Boss nimmt vor dem Kampf keinen Schaden
von Söldnern.

## Kurzfassung

- **Reaktionsfenster:** In jeder Lügen-Variante vergehen jetzt mindestens 2,09 s von der sichtbaren Handlungszeile bis zum Einschlag. Gemessen
  im Spiel, je Variante mit drei Beweisen und ohne Beweise.
  - Vorher lagen Parkett und Pappkulisse ohne Beweise bei 1,75 bzw. 1,55 s. Beide dauern jetzt 3,2 s wie die Kanonenkugel.
  - Die Kanonenkugel lag schon vorher bei 2,07–2,50 s. Die 0,2 s des Prüfers waren die Verzögerung seines Werkzeugs zwischen zwei Bildern.
  - Nach „… und links.“ liegt die Mitte als grüner Streifen mit Haken am Boden. Die Leiste sagt „In die Mitte [A/D]“ oder „Stehen bleiben [Mitte]“.
- **Todesrückblick:** Gleiche Treffer stehen gebündelt in einer Zeile („Trümmer 6× · 420“), der Todesschlag unten mit Totenkopf. Was nicht
  passt, steht als „+ n weitere“ darin. Die Zeilen ergeben genau Σ. Als Ursache steht der größte Brocken, also die Kugel und nicht „Trümmer 70“.
- **Deine Truppe:** Am Desktop 54 px je Söldner statt 82. Mit vier Buffs belegt die Truppe 266 von 266 px, ohne Scrollbalken. Befehl und
  Vertrag stehen im Tooltip. Wird der Platz knapp, rücken die Rahmen dichter, statt zu scrollen.
- **Erinnerung:** Statt Bild und sieben Zeilen Prosa erscheint eine Zeile mit Symbol, „Erinnerung“ und Titel (249×50 px). Der Text steht im
  Tooltip, ein Klick öffnet Bild und Text. Das gilt auch am Handy, wo vorher ein Fenster aufging.
- **Kampfbeginn wie in WoW:** Nach der Rede bleibt Big B auf dem Thron und wartet, im Bossrahmen steht ein kleines „bereit“ mit Tooltip.
  - Der Kampf beginnt erst, wenn der Held angreift oder den Nahbereich (5 Kacheln) neu betritt. Der Timer heißt „Angreifbar in“.
  - Söldner ziehen nicht von selbst. Der erste Zauber kommt 6 s nach dem echten Kampfbeginn.
  - Die Simulation zieht selbst.
- **Kosmetik:**
  - F-Hinweis:
    - Er erscheint erst 13 Kacheln vor dem Thron und geht erst jenseits von 16 Kacheln (Hysterese).
    - Das zweite „Beweise vorlegen“ am Saaleingang entfällt. F im Gehen greift noch 0,45 s nach dem Verschwinden.
    - Er überdeckt „Deckelstriche“ nie (34 Bilder gemessen).
  - Todesfenster: 330 px breit, oben mittig unter dem Bossrahmen. Die Bildmitte bleibt frei.
  - Tooltips erscheinen erst nach echter Mausbewegung, nach „Ins Dorf“ steht keiner mehr.
- **Nachgewiesen im Prüfskript** (echte Maus und Tasten):
  - Die Warnzeile blinkt vor dem Einschlag, in 19 von 19 Lügen.
  - „Kampf aufgeben“ gibt erst mit dem zweiten Klick binnen 3 s auf.
  - Die Erfolge kommen gebündelt nach dem Aufstieg.
  - F an der Endtruhe öffnet sie.
  - Nach dem Verlassen ohne Wahl steht draußen „Eingesammelt: 2 Teile · 30 Pfandmarken“.

## Ursache und Lösung je Punkt

### 1 · Reaktionsfenster nach dem Nachsatz · `content/dungeons.js`, `boss-alerts.js`, `dungeon-bigb-art.js`

**Messung:** `scripts/dungeon-fix5-check.mjs` Teil 2 misst im Spiel.
- Je Bild wird festgehalten:
  - wann die Handlungszeile nach dem Nachsatz sichtbar wird (`.ba-row.ba-now.ba-lie-t` im DOM)
  - wann der Zauber endet, also der Einschlag
- Fenster = Einschlag − sichtbare Zeile, in Echtzeit.
- Die Phasen steuert das Skript über das Bossleben. Der Held ist dabei unverwundbar: Gemessen wird die Anzeige, nicht das Ausweichen. Ausweichen
  und Tasten laufen trotzdem echt.
- Zwei Läufe:
  - A: drei Beweise wie beim Prüfer. Parkett und Pappkulisse lügen dann nicht.
  - B: ohne Beweise, alle lügen.
- „Vorher“ ist derselbe Messlauf gegen den Live-Stand c2f66547 (`MEASURE_ONLY=1`).

| Variante | Lauf | vorher (Live #728) | nachher |
|---|---|---|---|
| Kanonenkugel, Phase 1 | A | 2,12–2,20 s (3×) | 2,15–2,18 s (3×) |
| Kanonenkugel, Phase 1 | B | 2,12–2,21 s (2×) | 2,28–2,29 s (2×) |
| Doppelritt, Phase 2 | A | 2,10–2,13 s (2×) | 2,15–2,16 s (2×) |
| Doppelritt, Phase 2 | B | 2,12–2,45 s (4×) | 2,09–2,19 s (4×) |
| „… und links.“ / „… und rechts.“, Phase 3 | A | 2,12–2,15 s (2×) | 2,12–2,15 s (2×) |
| „… und links.“ / „… und rechts.“, Phase 3 | B | 2,07–2,50 s (2×) | 2,12–2,13 s (2×) |
| Parkett (lügt ohne Mietvertrag) | B | **1,75–1,80 s** (2×) | 2,14–2,15 s (2×) |
| Pappkulisse (lügt ohne Leihschein) | B | **1,55–1,56 s** (2×) | 2,14–2,17 s (2×) |
| Parkett / Pappkulisse ohne Lüge | A | 2,75 / 2,55–2,59 s | 3,21 / 3,18–3,20 s |
| Live-Schalte (ruft Adds, nichts auszuweichen) | A/B | 1,16–1,22 s | 1,11–1,18 s |

- Zwischen Nachsatz und sichtbarer Zeile vergingen vorher 28–102 ms, nachher 20–86 ms.
- Die Zeile zeigt beim Erscheinen „2,1 s“ bzw. „2,2 s“.

**Ursache:**
- Die Kanonenkugel hielt das Ziel schon: Nach dem Nachsatz blieben 2,2 s Spielzeit, sichtbar mindestens 2,07 s.
  - Die Spielzeit läuft nie schneller als die Echtzeit.
  - Die 0,2 s des Prüfers waren der Abstand zwischen zwei Werkzeugbildern: Sein Bild mit „3,1 s“ zeigte die Vorschau, das nächste kam knapp
    3 s später.
- Zu knapp waren Parkett und Pappkulisse, sobald sie lügen, also ohne die passenden Beweise. Nach dem Nachsatz blieben 1,8 bzw. 1,6 s
  (Restliste Fix 4, Punkt 3).
- Bei „… und links.“ war die sichere Mitte am Boden nicht markiert. Die Leiste sagte zwar „In die Mitte [A/D]“, aber auf dem Boden lagen
  nur zwei rote Hälften.

**Lösung:**
- **Parkett und Pappkulisse 3,2 s** (vorher 2,8/2,6 s): Nach dem Nachsatz bleiben 2,2 s, wie bei der Kanonenkugel.
  - Die Abstände danach zu kürzen, damit der Takt gleich bleibt, habe ich gerechnet. Dann starb das Profil „folgt der Behauptung“ in zwei von
    15 Läufen gar nicht mehr (Kriterium rot).
  - Daher sind die Zauber nur länger; der Kampf dauert 1–4 s länger (siehe Simulation).
- **Kanonenkugel bleibt 3,2 s.** Sie erfüllt das Ziel schon: 2,09–2,29 s sichtbar.
- **Sofort zeichnen:** Die Warnleiste zeichnet in dem Bild neu, in dem der Nachsatz kommt, statt ihren 50-ms-Takt abzuwarten.
- **Sicherer Platz am Boden:** Nach dem Nachsatz liegt jeder sichere Streifen quer zu den echten Bahnen grün gestrichelt und pulsierend am
  Boden, mit Haken (`drawSafe`).
  - Bei „… und links.“ ist das die Mitte, bei „… sagt man. Rechts.“ die andere Hälfte.
  - Die Rechnung ist dieselbe wie in der Leiste (`laneAction`).
  - Leiste: „In die Mitte [A]“ bzw. „[D]“ von außen, „✋ Stehen bleiben [Mitte]“ in der Mitte (Unit-Test beide Seiten, gespiegelt).
- **Blinken:** Die Zeile blinkt in der letzten 1,2 s (`ba-soon`), gemessen in 19 von 19 Lügen.
  - Der Prüfrechner meldet „Bewegung reduzieren“ (Windows Server). Dann blinkt nichts, das ist so gewollt, und wohl deshalb konnte es der Prüfer
    nicht sehen.
  - Das Prüfskript prüft die Grundeinstellung.
  - Mit „Bewegung reduzieren“ steht die Zeile jetzt hell umrandet, statt gar nichts zu zeigen.

### 2 · Todesrückblick erklärt die Summe · `death-screen.js`, `content/combat.js`

**Ursache:** Die Zeilen zeigten die letzten fünf Treffer, Σ zählte alle Treffer der letzten 10 s. Die Ursache war immer der letzte Treffer
(„Trümmer · 70“), auch wenn vorher eine Kugel mit 988 traf.

**Lösung (wie der Death Recap in WoW):**
- **Bündeln:** Treffer derselben Quelle und Fähigkeit stehen in einer Zeile („Trümmer 6×“, Summe). Die Reihenfolge richtet sich nach dem
  letzten Treffer der Zeile, der Todesschlag steht unten mit Totenkopf.
- **Rest-Zeile:** Passen nicht alle Zeilen in `DEATH_UI.recap.rows` (4), bleiben der Todesschlag und die größten Brocken. Der Rest steht
  gedämpft oben als „+ n weitere“.
- **Die Zeilen ergeben genau Σ.** Jeder Treffer wird vor dem Summieren gerundet.
- **Ursache = größter Brocken:** Quelle und Fähigkeit mit dem meisten Schaden in den 10 s, gebündelt. Beispiel: „Big B · Ritt auf der
  Kanonenkugel · 876“ statt „Trümmer · 70“.
- Gemessen im Spiel: „Σ 1.296 in 1 s = Ritt auf der Kanonenkugel 876 + Trümmer 6× 420“.
- Unit-Test mit Tod 2 des Prüfers: eine Kugel 494 und fünfmal Trümmer 70 ergeben Σ 844, Ursache Kugel.

### 3 · „Deine Truppe“ ohne Scrollen · `dungeon-fix5.css`, `companion-ui.js`, `unit-layout.js`

**Ursache:**
- Die Rahmen waren am Desktop 82 px hoch; vier Söldner und der Kopf brauchten 382 px.
- Die Spalte beginnt unter der Buffleiste und endet über dem Chat. Mit Buffs und offenem Chat blieb weniger Platz, die Spalte bekam einen
  Scrollbalken, und Söldner 4 war abgeschnitten.

**Lösung (kompakt wie WoW-Gruppenrahmen):**
- **Rahmen:** 54 px mit Porträt 36 px, Name und Rolle, Lebensbalken.
- **Tooltip statt Zeile:** Befehl („Folgen“) und Vertrag („Noch 2 h 0 min“) stehen im Tooltip des Rahmens. Das bisherige `title` des Browsers
  entfällt.
- **Dichter statt Scrollen:** Passt die Truppe trotzdem nicht, setzt `unit-layout.js` `unit-dock-dense`: 44 px, kein Kopf. Zurück erst mit
  60 px mehr Platz.
- Gemessen bei 2024×900 im Kampf mit vier Buff-Symbolen: 4 × 54 px, 266/266 px, kein Scrollbalken, kein Rahmen abgeschnitten.
- Am Handy (`mobile-check` Dungeon, hoch und quer) passt die Truppe ohne Befund.

### 4 · Erinnerung ohne Textwand · `memory-card.js`, `content/memories.js`, `app.js`, `dungeon-fix5.css`

**Quelle:**
- Die Erinnerung „Wurst Case“ kommt beim ersten Tod (`firstDeath`).
- Im Kampf und in der Boss-Arena wartet sie (`memoryBlocked`). Beim Prüfer kam sie deshalb erst in der Schatzkammer am Hinterausgang.
- Am Desktop war sie eine Randkarte mit Bild und dem ganzen Text, am Handy ein Fenster mitten im Bild.

**Lösung:**
- **Eine Zeile:** Papier-Symbol, „Erinnerung“ und der Titel. Der Text steht im Tooltip, ein Klick öffnet Bild und Text (das bekannte
  Bildfenster).
- **Standzeit:** Die Meldung geht nach 9 s von selbst, statt nach der Lesedauer des Texts (12–40 s). Maus darüber hält sie an.
- **Am Handy:** Dieselbe Meldung oben mittig unter der Kopfleiste, Tipp-Ziele 44 px. Vorher ging dort ein Fenster mit Prosa auf.
- Nachlesbar bleibt alles unter Aufträge → Erinnerungen; die Zeitsteuerung (warten bei Kampf, Tod, Einblendung) ist unverändert.
- Gemessen: „Erinnerung · Wurst Case“ als Zeile 249×50 px ohne Bild und Prosa, Tooltip mit dem Text.

### 5 · Kampfbeginn durch den Helden · `dungeon.js`, `engine.js`, `companions.js`, `boss-alerts.js`, `content/`, `scripts/dungeon-sim.mjs`

**Ursache:** Die Einleitung endete mit `engageBoss`, sobald der Timer ablief. Der Kampf begann also ohne Zutun des Spielers.

**Lösung (WoW-Muster):**
- **Nach der Rede wartet Big B** (`run.intro.ready`) auf dem Thron. Er bemerkt niemanden und nimmt keinen Schaden.
- **Der Kampf beginnt:**
  - beim Angriff des Helden: `pullBoss` aus `engine.js damage`, der Treffer zählt;
  - wenn der Held den Nahbereich neu betritt (`intro.reach`, 5 Kacheln). Wer beim Ende der Rede schon dort steht, muss angreifen: Der Kampf
    beginnt nicht von selbst.
- **Söldner** ziehen nicht von selbst. Mit Angriffsbefehl zieht ihr Treffer ihn nach der Rede; während der Rede macht er keinen Schaden
  (eine Zeile in `companions.js`).
- **Anzeige:**
  - Der Pull-Timer heißt „Angreifbar in“ (Tooltip: Rede, danach wartet er).
  - Danach steht im Bossrahmen ein kleines „bereit“ mit Schwertern. Der Tooltip sagt: „Big B wartet auf dem Thron. Greif ihn an oder geh ganz
    nah heran – dann fällt die Tür zu und der Kampf beginnt.“
- **Erster Zauber** 6 s nach dem echten Kampfbeginn (gemessen: 6,0 s nach dem Nahbereich, 6,0 s nach dem Rechtsklick-Angriff).
- **Verlässt der Held den Saal**, bleibt Big B bereit; der Bossrahmen zeigt ihn nur im Saal.
- **Simulation:** Der Sim-Held spricht Big B an, die Rede läuft, dann zieht er selbst (`heroPulls` → `pullBoss`, derselbe Weg wie ein
  Angriff). Die Rede zählt nicht zur Kampfzeit, im vollen Durchgang aber zur Gesamtzeit.

### 6 · Kosmetik

- **F-Hinweis über „Deckelstriche“** (`app.js`):
  - Die Klassenanzeige rückt über den Hinweis. `updateClassHud` lief aber vor dem Umschalten des Hinweises, also einen Takt zu spät.
  - Jetzt rückt sie im selben Takt, in dem der Hinweis kommt oder geht. Gemessen in 34 Bildern mit Hinweis: nie ein Überlapp.
- **F-Hinweis am Saaleingang, flackernd** (`dungeon.js`, `app.js`, `content/dungeons.js`):
  - Ursache: Das war das Vorlegen an der Tresortür (Punkt 15 Kacheln vor dem Thron, Umkreis 4,5). Es verschwand beim Weitergehen, bis bei
    13 Kacheln das Ansprechen kam.
  - Solange Big B auf seine Einleitung wartet, legt jetzt nur das Ansprechen am Thron die Beweise vor.
  - Der Hinweis kommt bei 13 Kacheln und geht erst jenseits von 16 (`intro.keep` 3). Gemessen: kommt bei 12,3, geht bei 16,7 Kacheln; die
    Messung hinkt beim Lauftempo von 15 Kacheln/s etwas.
  - F greift noch 0,45 s, nachdem der Hinweis verschwunden ist.
- **Todesfenster** (`death-screen.js`, `dungeon-fix5.css`):
  - Im Dungeon am Desktop 330 px breit, Titel 22 px, Zeilen 17 px.
  - Es sitzt oben mittig direkt unter dem Bossrahmen und seiner Fehlerzeile. Wächst der Rahmen (Zauberleiste), rückt es einmal nach unten
    und springt danach nicht mehr.
  - Gemessen: 330×203 px ab y 138, der Held steht ab y 346. Die Mitte ist frei.
  - Vorher stand es mit 360×317 über der Aktionsleiste in der Bildmitte.
- **Tooltip nach dem Start** (`popup-controls.js`):
  - Ändert sich nur das Bild unter der ruhenden Maus (Start, Fenster, Teleport), meldet der Browser ein `pointerover` an derselben Stelle.
    Das zählt nicht mehr.
  - Die erste echte Bewegung zeigt den Tooltip.
  - Gemessen: „Ins Dorf“ per Maus, 2,5 s kein Tooltip. Erst die Bewegung auf den Knopf zeigt „Autoangriff · Flasche kreist“.

### 7 · Ungeprüftes nachgewiesen (`scripts/dungeon-fix5-check.mjs`)

| Punkt | Ergebnis |
|---|---|
| Warnzeile blinkt vor dem Einschlag | Klasse `ba-soon` und wechselnde Randfarbe in der letzten 1,2 s in 19 von 19 Lügen (Lauf A 7/7, Lauf B 12/12) |
| „Kampf aufgeben“ mit zweitem Klick binnen 3 s | 1. Klick „Nochmal: aufgeben“, nach 3,4 s wieder „Kampf aufgeben“, erneut scharf, 2. Klick nach 0,9 s: aufgestanden am Kontrollpunkt. Der Heil-Söldner lag, damit niemand vorher aufhilft (daran scheiterte der Prüfer) |
| Erfolge gebündelt nach dem Aufstieg | „Aufgestiegen · Stufe 11“ → eine Einblendung „5 Erfolge · Der Nachsatz zählt · Beweislast …“ |
| F an der Endtruhe | „F Endtruhe öffnen“ → Dreierwahl „1 / 3“ |
| Verlassen ohne Wahl | F am Hinterausgang → Rückfrage „Noch nichts gewählt“ mit drei Teilen, Esc, F erneut → Burgstraße, Kurzmeldung „Eingesammelt: 2 Teile · 30 Pfandmarken“ |

## Simulation (`node scripts/dungeon-sim.mjs`, alle Teile)

Voller Lauf ohne `--only`, **alle Kriterien grün** (0 × ROT). Auszug:

| Kriterium | Fix 4 | Fix 5 |
|---|---|---|
| Big B mit Held + 4 Söldnern 150–200 s | 171–194 s | 173–198 s (Parkett und Pappkulisse je 0,4/0,6 s länger) |
| „folgt der Behauptung“ stirbt mindestens einmal | grün | Tode je Lauf 2/2/1/2/1/1/2/2/2 |
| „folgt dem Nachsatz“ stirbt höchstens einmal | grün | 0 in allen Läufen |
| Jeder Flügel 10–15 min | 12,0 · 12,1 · 10,9 min | 12 · 12,1 · 10,9 min |
| Voller Durchgang unter 50 min | 37,5 min | 37,4 min |
| übrige Kriterien (Gerd, Etappe-4-Bosse, Ausrüstung, Farm) | grün | grün, unverändert |

Die Variante mit gekürzten Abständen (gleicher Takt) ergab 172–196 s, aber zweimal 0 Tode bei „folgt der Behauptung“ (rot). Sie ist deshalb
verworfen.

## Prüfungen

Ports CDP 9751–9756, Server 4551–4556, `BOOT_TRIES=450`. Der Rechner war stark belastet (weitere Prüf-Browser und Simulationen anderer Sitzungen).

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 1282/1282 grün (inkl. `tests/dungeon-fix5.test.mjs`, 16 Tests) |
| `npm run content:check` | 57/57 grün |
| `npm run build` | grün (Quellen-Wächter sauber) |
| `npm run ui:check` | 14/14 grün, Desktop 2024×900: kein Fenster scrollt |
| `node scripts/dungeon-sim.mjs` | alle Kriterien grün (siehe oben) |
| `dungeon-check` | Desktop und Handy grün (Eingang, Betreten, Laufen, Gerds Kegel, Siegel, Treppe, Karte, Verlassen) |
| `dungeon-e4a-check` | 36 grün |
| `dungeon-e4b-check` | 11 grün (nach Anpassung: Beweise am Thron vorlegen) |
| `dungeon-fix3-check` | 9 grün. Erster Lauf rot: Die Endtruhe lag hinter der Klassenanzeige, der Rechtsklick traf die Anzeige. Das hängt davon ab, wo der Held nach dem Kampf steht. Jetzt geht das Skript erst ein paar Schritte (S). |
| `dungeon-fix4-check` | 8 grün. Teile 1–3 im ersten Lauf; Teil 4 nach Anpassung: Die ruhende Maus stand auf dem jetzt oben sitzenden Todesfenster. |
| `mobile-check` Dungeon (hoch/quer) | 10 Schritte, 0 Befunde, keine Laufzeitfehler |
| `mobile-check` hoch (ganzer Teil, mit Tod und Erinnerung) | 0 Befunde |
| `dungeon-fix5-check` (neu) | Teile 1–3: 8 grün, Teil 4: 5 grün |
| `dungeon-raeume-check` | nicht gelaufen: Fix 5 ändert das Zeichnen der Räume nicht. `dungeon-bigb-art.js` zeichnet nur während eines Bahn-Zaubers den grünen Streifen. Teil 6 (Bildzeit) wird unter Last rot, auch für den Live-Stand (Fix 4) |

Anpassungen an bestehenden Prüfungen (Verhalten gewollt geändert):
- `tests/dungeon-fix4.test.mjs`:
  - Einleitung: Nach der Rede wartet Big B, der Angriff zieht ihn.
  - Rückblick: gebündelte Zeilen, Zeilen = Σ.
- `tests/dungeon-e4b.test.mjs`: Beweise legt das Ansprechen am Thron vor, am Saaleingang gibt es kein F.
- `tests/e72-hofprobe.test.mjs`: Die Erinnerungskarte ist kompakt, ohne Bild und Prosa, der Text steht im Tooltip.
- `scripts/dungeon-fix4-check.mjs`: nach der Rede Rechtsklick-Angriff (Teil 1); läuft der Autoangriff nicht mehr, noch ein Rechtsklick (Teil 4).
- `scripts/dungeon-fix3-check.mjs`: Beweise am Thron vorlegen statt an der Tresortür. Liegt die Endtruhe hinter der Klassenanzeige, erst ein paar Schritte gehen.
- `scripts/dungeon-e4b-check.mjs`: Beweise am Thron vorlegen.

`scripts/dungeon-fix5-check.mjs` (CDP 9751, Server 4551; `ONLY=1,…`, `MEASURE_ONLY=1`, `FIX5_LIB` für den Vergleich mit einem anderen Stand)
spielt Big B mit dem Testzugang `bigb`. Die Teile:
1. Start, F-Hinweis, Einleitung, Warten, Nahbereich, Truppe
2. Reaktionsfenster (Läufe A und B), Blinken, „In die Mitte“
3. Nach dem Sieg: Einblendungen, Endtruhe, Verlassen ohne Wahl
4. Lauf B mit Tod: Rückblick, Todesfenster, Kampf aufgeben, Erinnerung

## Screenshots

`visual-review/dungeon-fix5/*.jpg` (lokal, nicht im Repo), angesehen:

| Bild | zeigt |
|---|---|
| `00-nach-start.jpg` | nach „Ins Dorf“ per Maus kein Tooltip, obwohl die Maus über dem Autoangriff ruht |
| `11-f-hinweis-thron.jpg`, `12-rede-angreifbar-in.jpg` | F-Hinweis am Thron über der Klassenanzeige; Rede mit „Angreifbar in 8,4 s“ |
| `13-bereit.jpg`, `14-bereit-tooltip.jpg` | Bossrahmen mit „bereit“ und Lupen; Tooltip „Bereit zum Kampf …“; Truppe kompakt |
| `15-nahbereich-kampf.jpg`, `16-truppe.jpg` | Kampf nach dem Nahbereich; Truppe mit vier Buff-Symbolen ohne Scrollbalken |
| `A-20-mitte-sicher.jpg`, `B-20-mitte-sicher.jpg` | „… und rechts.“: zwei rote Hälften, die Mitte grün mit Haken, Leiste „✋ Stehen bleiben [Mitte]“ |
| `A-21-haelfte-sicher.jpg`, `B-21-haelfte-sicher.jpg` | „… sagt man. Links.“: die sichere Hälfte grün |
| `30-erfolge-nach-aufstieg.jpg` | eine Einblendung mit fünf Erfolgen nach dem Aufstieg |
| `31-f-endtruhe.jpg`, `32-rueckfrage.jpg`, `33-draussen-eingesammelt.jpg` | F öffnet die Endtruhe; Rückfrage am Hinterausgang; draußen „Eingesammelt: 2 Teile · 30 Pfandmarken“ |
| `40-tod-oben.jpg`, `41-aufgeben-scharf.jpg` | Todesfenster klein oben mittig: „Big B · Ritt auf der Kanonenkugel · 876“, Σ 1.296 = 876 + Trümmer 6× 420; „Nochmal: aufgeben“ |
| `42-erinnerung-kompakt.jpg`, `43-erinnerung-tooltip.jpg` | „Erinnerung · Wurst Case“ als Zeile unter der Verfolgung; Text im Tooltip |
| `mobile/hoch-dg-bosskampf.jpg` | Handy hochkant: vier Söldner ohne Scrollen |

## Geänderte Dateien

| Bereich | Dateien |
|---|---|
| Laufzeit | `dungeon.js` (Warten nach der Rede `ready`/`bossReady`/`pullBoss`, Nahbereich, F-Hinweis mit Hysterese, kein Vorlegen an der Tresortür, solange Big B wartet), `engine.js` (Angriff zieht den wartenden Boss), `companions.js` (eine Zeile: vor dem Kampf kein Söldner-Schaden) |
| Oberfläche | `boss-alerts.js` („bereit“, „Angreifbar in“, sofort zeichnen beim Nachsatz), `death-screen.js` (Rückblick gebündelt, Ursache, oben mittig), `memory-card.js` (kompakte Meldung, auch am Handy), `companion-ui.js` (Tooltip statt Zeile), `unit-layout.js` (dichter statt Scrollen), `popup-controls.js` (Tooltips erst nach Bewegung), `app.js` (F-Nachlauf, Klassenanzeige im selben Takt, Erinnerung überall kompakt), `dungeon-fix5.css` (neu), `index.html` |
| Grafik | `dungeon-bigb-art.js` (grüne sichere Streifen nach dem Nachsatz) |
| Daten | `content/dungeons.js` (Parkett/Pappkulisse 3,2 s, `intro.keep`, Texte „Angreifbar in“), `content/dungeon-ui.js` („bereit“), `content/combat.js` (Rückblick), `content/memories.js` (kompakte Meldung) |
| Prüfungen | `scripts/dungeon-fix5-check.mjs` (neu), `tests/dungeon-fix5.test.mjs` (neu, 16 Tests), `scripts/dungeon-sim.mjs` (Held zieht selbst), `scripts/dungeon-fix3-check.mjs`, `scripts/dungeon-fix4-check.mjs`, `tests/dungeon-fix4.test.mjs`, `tests/dungeon-e4b.test.mjs`, `tests/e72-hofprobe.test.mjs` |
| Doku | `docs/DUNGEON-FIX5-2026-09-26.md`, `docs/PLAYTEST-2026-09-26-dungeon-bigb-3.md` (Prüferbericht, unverändert) |

## Restliste

1. **Held aktiv / Söldner gewinnen ohne Held:** Das gehört dem Auftrag „Held aktiv“ (Zweig `dungeon-aktiv`).
2. **Live-Schalte:**
   - Nach dem Nachsatz „… mit Follower.“ bleiben 1,1–1,2 s bis die Adds kommen.
   - Nichts ist auszuweichen („Adds zuerst [Tab]“), deshalb gilt das 2-s-Ziel dort nicht. Soll die Zeile länger stehen, wäre das eine eigene
     Entscheidung.
3. **Kanonenkugel mit wenig Reserve:** Sichtbar 2,09–2,29 s. Das hält das Ziel, aber knapp.
   - 3,4 s kippte in Fix 4 die Simulation; nicht erneut versucht.
   - Wer mehr Luft will, müsste den Vorlauf `tell` kürzen (V-D5: 1,0 s).
4. **Andere Prüfskripte der Erinnerungskarte:** `e72-klicks-check` und `e72-hofprobe-check` klicken auf `[data-memory-card-art]`. Den Selektor
   gibt es weiter, jetzt ist es die ganze Zeile; der Klick öffnet weiter Bild und Text. Die Skripte standen nicht auf der Liste und sind nicht
   gelaufen.
5. **Playtest:** Ein Prüfer-Durchgang auf dem neuen Stand steht aus: Warten nach der Rede, grüne Mitte, Rückblick, Truppe, Erinnerung.

## Veröffentlichung

ERGEBNIS-VEROEFFENTLICHUNG
