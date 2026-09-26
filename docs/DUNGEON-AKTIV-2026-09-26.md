# Dungeon „Schloss Big B“ · Held aktiv: Rollen-Balance, kein passiver Held, Einsatz wird belohnt · 2026-09-26

Grundlage:
- Nutzerentscheidung (über den Orchestrator), wörtlich: „Es kann durchaus sein, dass die Söldner einen Kampf ohne den Helden gewinnen.
  Wenn der Held Heiler oder Tank ist, sollte es normal einen Wipe geben, aber es kann durchaus sein, dass man nur mit 2 DDs gewinnt. Wir
  sollten natürlich schauen, dass der Held nicht passiv bleibt und für Aktivität belohnt wird.“
- Messungen aus `docs/DUNGEON-FIX4-2026-09-26.md` (Punkt 10, `--only=ohneheld`, `--only=nohero`), Analyse `docs/DUNGEON-ANALYSE-2026-09-24.md`,
  E-71 (Söldner in Instanzen fast vollwertig).
- Live-Befund des Prüfers auf Build #728 (über den Orchestrator): Der Held griff nie an und lag zweimal. Big B fiel trotzdem nach etwa
  3 min, rund 3:00 vor der Wut.

**Live:** Build #740 (`c86958f3`, 26.09.2026). Einzelheiten unter „Veröffentlichung“.

Zweig `dungeon-aktiv`, Worktree `D:\Dev\MertlochChronicles-dg-aktiv`. Begonnen auf `main` c2f66547 (#728), vor der Messung auf
`main` 13a1665c (Dungeon-Fix 5, Build #736/#737) umgesetzt. Alle Quoten unten sind auf dem Stand nach Fix 5 gemessen; „vorher“ ist `main`
13a1665c ohne diesen Auftrag, mit derselben Simulation und denselben acht Seeds.

Nicht angefasst: `CLAUDE.md`, `docs/ENTSCHEIDUNGEN.md`, Figurengrafik, die Klassenmodelle (E-72).

## Kurzfassung

- **Angefeuert (Kern gegen den passiven Helden):** Ein Söldner ist im Dungeon allein so stark wie ein Held (Instanzfaktor Schaden 3,4
  statt 4,8). Solange der Held selbst trifft, heilt, unterbricht oder pariert, sind die Söldner angefeuert: +40 % Schaden, also 4,76,
  praktisch wie bisher. Es hält 6 s nach der letzten eigenen Tat.
  - Sichtbar: Buff „Angefeuert“ mit Restzeit in der Buffleiste und „ANGEFEUERT“ über den Söldnern, wenn er einsetzt.
  - Im Bossrahmen steht ein Chip „Angefeuert“ bzw. nach 6 s ohne eigene Tat „Söldner warten“. Die Erklärung steht im Tooltip.
- **Wut an allen Hauptbossen (WoW-Enrage):**
  - Zeitgrenzen: Gerd 2:10 („Sperrstunde“), Exposé 2:40 („Letztes Angebot“), Kurt 2:30 („Zapfenstreich“), Big B 4:50 statt 6:00.
  - Danach alle 5 s +150 % Schaden, also ein harter Wipe.
  - Mit aktivem Held und Startausrüstung liegen die Kämpfe weit davor (Gerd ≤ 97 s, Big B ≤ 204 s).
- **Rolle zählt:**
  - Tank-Buster: Den Kegel (Rausschmiss, Huftritt, Regenrinnen-Hieb) mildert nur ein Schutz, wie beim Helden schon bisher.
  - Hält ein Söldner ohne Schutz-Rolle den Boss, trifft ihn der Kegel voll. Er weicht dafür seitlich aus.
  - Chip „Ungeschützt“ im Bossrahmen. Reichweiten-Rita macht mehr Schaden (2,6 → 4,0), damit ihr Schutz ohne Heiler fällt.
- **Letztes Aufgebot:** Steht niemand mehr, der schützt oder heilt, nutzen Schadens-Söldner je einmal im Kampf drei Mittel, alle mit
  Ansage über dem Kopf:
  - „Alles oder nichts“: +100 % Schaden für 20 s, mit Spruch
  - „Ausweichen“: 8 s keine Boss-Schläge, wenn sie den Boss am Hals haben
  - „Notfall-Schorle“: +60 % Leben, sobald kein Heiler mehr steht
- **Einsatz nach jedem Boss** (Details-Meter und Bonuswurf als Vorbild):
  - Eine Zeile im Beute-Moment: Punkte, Anteil in der Rolle, Unterbrechungen, beantwortete Warnungen, Ausweichen, Tode, Angefeuert.
  - Ab 60 Punkten +1 Bonus-Siegelmarke, ab 85 +2. Jede Zahl erklärt sich im Tooltip. Schwellen in `content/dungeon-einsatz.js`.
- **Quoten (8 Seeds je Fall und Boss):**
  - (a) Held Tank fällt: Hauptbosse 43 % → 0 %
  - (b) Held Heiler fällt: 17 % → 6 %, Rita 24/24 → 9/24
  - (c) Held Schaden fällt: 82 % → 71 %
  - (d) nur zwei Schadens-Söldner: bei 50 % 0 % → 0 %, bei 25 % 17 % → 26 %
  - Held passiv: 93 % → 5 %
  - Alle bisherigen Kriterien sind grün.

## Ursache und Lösung je Ziel

### 1 · Tank fällt → normal Wipe

**Ursache (vorher 43 % an den Hauptbossen, Gerd 21/24, Big B 15/24):**
- Fiel der Held-Tank, übernahm ein Schadens-Söldner den Boss. Die Heilerin hielt ihn mühelos oben.
- Den Rausschmiss nahm er nur zu 25 %: Die Tank-Milderung galt für jeden Söldner, der Ziel war. Beim Helden galt sie schon immer nur mit
  Schutz-Spezialisierung oder Parade.

**Lösung:**
- `dungeon.js`: Den Kegel mildert nur ein Söldner mit Schutz-Rolle. Wie beim Helden trifft der Tank-Buster einen Nicht-Tank voll: 60 % Leben,
  in Gerds Phase 2 zweimal hintereinander.
- `companions.js` (`coneExit`): Ein Nicht-Tank, der den Boss hält, tritt seitlich aus dem Kegel, wie die übrigen Söldner. Nur der Schutz bleibt
  als Ziel stehen. Mit Glück überlebt er, aber nicht lange.
- Angefeuert fällt mit dem Helden weg. Die Wut begrenzt die Zeit, die eine Gruppe ohne Tank noch hätte.
- Sichtbar: Chip „Ungeschützt“ mit Namen im Bossrahmen („Hopfen-Horst hält den Boss ohne Schutz-Rolle: Tank-Buster treffen ihn voll“).

**Ergebnis:** Hauptbosse 0/96. Gerd verloren bei 4–48 %, Big B bei 30–50 %.

**Verworfen:** ein Faktor auf alle Boss-Schläge gegen Nicht-Tanks („ungebremst ×2“). Er machte (a) nicht nötiger, nahm aber zwei
Schadens-Söldnern jede Chance (Fall d). Der Schalter `EINSATZ_RULES.untanked.auto` steht auf 1.

**Rita und das halbe Pferd zählen nicht zu den Hauptbossen:**
- Rita bleibt mit Held-Tank 24/24. Die Heilerin hält einen Schadens-Söldner gegen ihre Schläge.
- Beim halben Pferd erreicht der Simulations-Held als Tank nie 50 %, weil er das Pferd nicht vom Trog holt. Das ist eine Grenze der
  Simulation, wie in Fix 4.

### 2 · Heiler fällt → normal Wipe

**Ursache:** An allen Bossen außer Rita galt das schon (0/120). Rita schlägt schwach: Ihr Schutz verlor ohne Heiler nur rund 1,7 % Leben je
Sekunde und hielt über 50 s. Das reichte, sie zu legen (24/24).

**Lösung:** Rita macht mehr Schaden (`DUNGEON_BOSSES.rita.damage` 2,6 → 4,0).
- Mit Heiler ändert sich nichts: 70–110 s, „spielt richtig“ ohne Tod, jede Klasse und im Flügel grün.
- Ohne Heiler fällt ihr Schutz nach etwa 30 s.

**Ergebnis:** Rita 9/24, alle Bosse 6 % (vorher 17 %).

### 3 · Schadens-Held fällt → Söldner dürfen gewinnen

Ohne weiteres Zutun bleibt das so: 71 %, vorher 82 %.
- Der Held hat bis zur Hälfte mitgekämpft. Danach fehlt nur seine Hälfte und der Rückenwind.
- Die Wut ist so gesetzt, dass es meistens noch reicht: Gerd 37/40 in 125–152 s, Kurt 24/40, Big B 31/40 in 265–305 s.
- Exposé bleibt schwer, wie erlaubt: 0/40, vorher 6/40. Ohne Held unterschreiben die Interessenten, sie verkauft und setzt zurück.

### 4 · Nur zwei Schadens-Söldner → gelegentlich ein Sieg

**Ursache:** Vorher 0/240 bei 50 %. Zwei Schadens-Söldner machen rund 360 Schaden je Sekunde und halten gegen einen Boss je 10–15 s.
- Für 50 % von Gerd bräuchten sie 90 s.
- Mit Heilerin (Fall a) wären sie immer stärker als ohne (Fall d). Beide Ziele zugleich, (a) ≤ 25 % und (d) bei 50 % 10–35 %, gibt es
  nur, wenn (a) bei etwa 20–25 % liegt. Das widerspräche „normal Wipe“.

**Lösung, Letztes Aufgebot** (`dungeon-einsatz.js tickLastStand`, Zahlen in `EINSATZ_RULES.lastStand`):
- Steht niemand mehr, der schützt oder heilt, rufen die Schadens-Söldner ihren Spruch („Jetzt erst recht!“, „Dann eben allein. Letzte Runde!“).
- Über dem Kopf steht „ALLES ODER NICHTS“: 20 s doppelter Schaden.
- Wer den Boss am Hals hat, weicht unter 70 % Leben 8 s aus („AUSWEICHEN“, jeder verfehlte Schlag „AUSGEWICHEN“).
- Unter 35 % trinkt er die „NOTFALL-SCHORLE“ (+60 %).
- Dazu der seitliche Schritt aus dem Kegel (Punkt 1).
- Keine stillen Zahlen: Jeder Schritt steht über dem Söldner.

**Abweichung (begründet):** Das Kriterium misst (d) an zwei Punkten.
- Alle drei fallen bei 50 % (wie bisher), oder erst bei 25 % („wenn der Boss schon tief ist“, Fall d25).
- Gefordert sind zusammen 10–35 % und bei 50 % höchstens 15 %.
- Ergebnis: bei 50 % weiterhin 0/240, bei 25 % 63/240 (Rita 40/40, Gerd 23/40), zusammen 13 %.
- Siege gibt es damit bei leichten Bossen und tiefem Bossleben, nie bei Big B oder Exposé. Das passt zu WoW: Zwei DDs legen einen Boss nur
  im Endspurt.

### 5 · Passiver Held ist klar schlechter

**Ursache (vorher 93 % Siege, Big B 40/40 in 220–250 s):** Der Held machte mit vier fast vollwertigen Söldnern nur 15–25 % des
Gruppenschadens. Ohne ihn dauerte es rund 30 % länger, weit vor der Wut bei 6:00. Genau das sah der Prüfer live.

**Lösung, zwei WoW-Muster:**
- **Angefeuert** (`dungeon-einsatz.js`):
  - Die Söldner bekommen ihre volle Stärke nur, solange der Held mitkämpft.
  - Als Zeichen dient, was der Held selbst tut: Schaden, Heilung (Meter), Unterbrechen oder Parade in den letzten 6 s.
  - Aktiv ist damit alles wie vorher (4,76 statt 4,8). Passiv, liegend oder tot fehlen 29 % Söldner-Schaden.
  - Gilt gegen alle Dungeon-Gegner, damit Flügelzeiten und EP je Minute gleich bleiben.
- **Wut (Enrage) an allen Hauptbossen:** Zeitgrenze zwischen „Held fällt zur Hälfte“ (Fall c) und „Held tut nichts“, mit harter Steigerung
  (alle 5 s +150 %).
  - Big B 4:50: Der Held der Prüfung wäre bei 3:00 + Einleitung knapp durch, ohne Angefeuert aber nicht.
  - Chip mit Uhr im Bossrahmen, Tooltip mit den Zahlen des Bosses, Einblendung beim Ausbruch.
  - Im Journal steht „2:10“ statt „2 min“.

**Ergebnis:** Held passiv an den Hauptbossen 8/160 (5 %). Es gewinnen nur Gerd (5/40) und Kurt (3/40), knapp nach der Wut.

**Angabe, ohne Kriterium:** „Held liegt ab 20 s“ ging von 61 % auf 0 %. Die Söldner gewinnen ohne Helden, wenn er vorher mitgekämpft hat
(Fall c, 71 %), aber nicht, wenn er gleich zu Beginn fällt.

Passiv heißt in der Simulation: Der Held zieht Big B (Fix 5: er muss ihn selbst ziehen), lebt und läuft aus Flächen, macht aber keinen
Schaden und nutzt keine Kniffe, auch keine Parade. Die Parade am Siegelring lief vorher auch im passiven Profil; das ist korrigiert.

### 6 · Aktivität sichtbar belohnen

**Einsatz je Bosskampf** (`dungeon-einsatz.js`: `tickEinsatz`, `noteWarning`, `finishEinsatz`; Zahlen in `EINSATZ_SCORE`):
- **Anteil in der Rolle** aus dem Kampf-Meter, gegen das Ziel der Rolle (bis 50 Punkte):
  - Tank: Anteil der Kampfzeit, in der er den Boss hält, Ziel 70 %
  - Heiler: Heilungsanteil, Ziel 40 %
  - Sonst: Schadensanteil, Ziel 14 %. Mit vier angefeuerten Söldnern macht ein aktiver Schadens-Held 11–20 %.
- **Unterbrechungen:** 8 Punkte je Unterbrechung, höchstens 24.
- **Warnungen** (bis 30 Punkte): Jede Boss-Mechanik, die dem Helden in der Arena galt, zählt als beantwortet, wenn sie ihn nicht traf.
  Das sind Bahn, Fläche, Kegel (außer für den Tank), Blitzlicht und Überlappen beim Verteilen. Beim Sammeln zählt nur, wer drinsteht, beim
  Siegelring die Parade.
- **Tode:** −25 je Tod.
- **Bonus:** ab 60 Punkten 1 Bonus-Siegelmarke, ab 85 zwei. Sie geht sofort aufs Konto. Siegelmarken statt EP, damit Farm-Schleife und
  EP-Grenzen unverändert bleiben.

**Anzeige im Beute-Moment** (`rpg-ui.js` → `dungeon-einsatz-ui.js`):
- Unter Siegelmarken, EP und Erfolgen steht eine Chip-Zeile:
  - Punkte (Silber-/Goldrand ab 60/85)
  - Anteil mit dem Rollen-Symbol der Söldner (Schutzschild, Flasche, Explosion)
  - Unterbrechen und Ausweichen mit dem Kniff-Symbol des Helden
  - Warnungen „16/16“, Tode (nur wenn es welche gab), Angefeuert
  - Bonus mit der Siegelmarke
- Jeder Chip hat einen Tooltip. Die ganze Zeile hat weniger als 80 Zeichen Text.
- Beispiele aus der Browserprüfung:
  - „91 · 11 % · 3 · 14/15 · 4 · 99 % · +2“ (Gold), Tooltip „Anteil 39 · Unterbrechen 24 · Warnungen 28 = 91 von 100.“
  - Im Lauf davor „77 · 11 % · 1 · 16/16 · 6 · 99 % · +1“ (Silber).

**Im Kampf:** Angefeuert in Buffleiste und Bossrahmen und als Einblendung über den Söldnern (Punkt 5).

**Symbole:** vorhandene Bilder aus der Pipeline (Rollen-Symbole der Söldner, Kniff-Symbole des Helden, die Siegelmarke, das Megafon-Motiv
für „Angefeuert“) und UI-Glyphen (Punkte, Warnung, Schädel), keine Emojis. Neue Bilder waren nicht nötig.

**Geprüft (Simulation):**
- Ein aktiver Held („folgt dem Nachsatz“, „spielt richtig“) verdient in jedem Sieg den Bonus: 69–80 Punkte.
- Ein passiver Held nie: 5–30 Punkte.

### 7 · Nichts für aktive Spieler verschlechtert

Alle bisherigen Kriterien sind grün:
- Big B 174–199 s. Fix 5 allein: 173–198 s, Fix 4: 171–194 s.
- Gerd 90–92 s. Exposé 92–110, Kurt 97–103, Rita 94–106, Pferd 82–87 s.
- Flügel: Burghof 12,9 · Rittergeschoss 12,1 · Basaltgewölbe 11,4 min. Voller Durchgang 38,7 min.
- EP je Minute 111–146 (Wiederholung). Farm-Schleife: Gerd 106, Flügel 104, bei einem Feld von 84.
- Typische Ausrüstung ohne Wipe, Startausrüstung schaffbar: jeder Boss gewonnen, Big B 188–204 s, alle weit vor der Wut.

Einzige Verlangsamung: In den ersten Sekunden eines Kampfs, bevor der Held trifft, sind die Söldner noch nicht angefeuert.

## Quoten vorher/nachher

Simulation `scripts/dungeon-sim.mjs` (Teile `ohneheld`, `nohero`), Seeds 7–14 (`SIM_ROLE_SEEDS`). Je Boss:
- (a), (b): drei Specs × 8 = 24 Läufe
- (c), (d): fünf Klassen × 8 = 40 Läufe
- passiv: fünf Klassen × 8 = 40 Läufe

„Vorher“ ist `main` 13a1665c (Fix 5), „nachher“ dieser Zweig nach dem Rebase. Siege/Läufe:

| Boss | (a) Held Tank fällt | (b) Held Heiler fällt | (c) Held Schaden fällt | (d) nur 2× Schaden, bei 50 % | (d25) nur 2× Schaden, bei 25 % |
|---|---|---|---|---|---|
| Gerd | 21/24 → 0/24 | 0/24 → 0/24 | 40/40 → 37/40 | 0/40 → 0/40 | 0/40 → 23/40 |
| Exposé | 0/24 → 0/24 | 0/24 → 0/24 | 6/40 → 0/40 | 0/40 → 0/40 | 0/40 → 0/40 |
| Kurt | 5/24 → 0/24 | 0/24 → 0/24 | 31/40 → 24/40 | 0/40 → 0/40 | 0/40 → 0/40 |
| Rita | 24/24 → 24/24 | 24/24 → 9/24 | 40/40 → 40/40 | 0/40 → 0/40 | 40/40 → 40/40 |
| Halbes Pferd ¹ | 0/24 → 0/24 | 0/24 → 0/24 | 40/40 → 39/40 | 0/40 → 0/40 | 0/40 → 0/40 |
| Big B | 15/24 → 0/24 | 0/24 → 0/24 | 40/40 → 31/40 | 0/40 → 0/40 | 0/40 → 0/40 |
| **alle** | 45 % → 17 % | 17 % → **6 %** | 82 % → **71 %** | 0 % → 0 % | 17 % → 26 % |
| **Hauptbosse** | 43 % → **0 %** | 0 % → 0 % | 73 % → 57 % | 0 % → 0 % | 0 % → 14 % |

¹ Mit Held-Tank erreicht das Pferd nie 50 % (Grenze der Simulation, siehe Punkt 1).

Kriterien (d): (d)+(d25) zusammen 13 %, bei 50 % 0 %.

| Boss | Held passiv (lebt, kein Schaden, keine Kniffe) | Held liegt ab 20 s (Angabe) |
|---|---|---|
| Gerd | 40/40 (104–109 s) → 5/40 (140–148 s) | 40/40 → 0/40 |
| Exposé | 38/40 → 0/40 | 15/40 → 0/40 |
| Kurt | 30/40 (111–134 s) → 3/40 (147–166 s) | 6/40 → 0/40 |
| Big B | 40/40 (220–250 s) → 0/40 | 37/40 → 0/40 |
| **alle** | 93 % → **5 %** | 61 % → 0 % |

Zielbereiche aus dem Auftrag:
- (a) Hauptbosse ≤ 25 %, keiner über 40 % ✔
- (b) ≤ 25 % ✔
- (c) ≥ 50 % ✔
- (d) 10–35 % ✔ nach der Abweichung unter Punkt 4
- passiv ≤ 30 % ✔

## Prüfungen

Ports CDP 9741–9748, Server 4541–4548, `BOOT_TRIES=450`. Der Rechner war stark belastet: bis zu zehn Simulationen und mehrere Prüf-Browser
anderer Sitzungen liefen parallel.

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 1296/1296 grün (inkl. `tests/dungeon-aktiv.test.mjs`, 14 Tests) |
| `npm run content:check` | 57/57 grün |
| `npm run build` | grün |
| `npm run ui:check` | 14/14 grün |
| `node scripts/dungeon-sim.mjs` (alle Teile) | alle Kriterien grün (Auszug oben), 15,5 min mit sechs Teilprozessen für die Rollen-Fälle |
| `dungeon-aktiv-check` (neu) | 4/4 grün: Sieg nach 147 s Echtzeit, Einsatz 91 (3 Unterbrechungen, 14/15 Warnungen), +2 Bonus-Siegelmarken, Konto +6 = Boss 4 + Einsatz 2. Erster Lauf vor dem Rebase: 77, +1 |
| `dungeon-check` | Desktop und Handy grün |
| `dungeon-e4a-check` | 36 grün |
| `dungeon-e4b-check` | 11 grün |
| `dungeon-fix3-check` | 9 grün. Vor dem Rebase unter Parallel-Last einmal rot („zweimal gefallen“: Der Held lag nach einer Kanonenkugel schon, als der zweite erzwungene Tod kommen sollte); nach dem Rebase grün |
| `dungeon-fix4-check` | 8/8 grün. Vor dem Rebase unter Last einmal rot (Richtungszeile 204 ms statt ≤ 150 ms nach dem Nachsatz); nach dem Rebase grün |
| `dungeon-fix5-check` | 13 grün |
| `dungeon-raeume-check` | nicht gelaufen: Räume und Zeichnen sind nicht angefasst (Teil 6 Bildzeit ist unter Last ohnehin unzuverlässig, siehe Fix 4) |
| `mobile-check` Dungeon | hoch und quer, 10 Schritte, 0 Befunde, keine Laufzeitfehler |

`scripts/dungeon-aktiv-check.mjs`:
- Testzugang `bigb`, Tresenbrecher, typische Ausrüstung, vier Söldner, drei Beweise.
- Echte Maus und echte Tasten, ein Spieler-Bot weicht aus (W/A/S/D), unterbricht (Q), pariert/weicht dem Siegelring aus (Leer) und greift an
  (Rechtsklick, Kniffe).

Ablauf:
1. Nach dem Kampfbeginn tut der Held 6 s nichts: Der Bossrahmen zeigt „Söldner warten“. Tooltip per Maus.
2. Der Held greift an: „ANGEFEUERT“ über allen vier Söldnern, Chip „Angefeuert“ im Bossrahmen, Buff „Angefeuert“ in der Buffleiste.
   Beide Tooltips per Maus.
3. Big B aktiv bis zum Sieg:
   - Der Beute-Moment zeigt die Einsatz-Zeile mit Punkten, Anteil, Unterbrechungen, Warnungen, Angefeuert und Bonus.
   - Tooltips per Maus. Das Konto steigt um Boss-Marken plus Einsatz-Bonus.
4. Touch-Modus: Jeder Einsatz-Chip ist mindestens 44 × 44 px groß und liegt im Beutefenster.

Bilder `visual-review/dungeon-aktiv/*.jpg` (lokal, nicht im Repo), angesehen:

| Bild | zeigt |
|---|---|
| `10-soeldner-warten.jpg` | Bossrahmen „Söldner warten“ (gelb), Tooltip „Seit 6 s kein Treffer, keine Heilung, keine Unterbrechung von dir …“ |
| `11-angefeuert-bossrahmen.jpg` | Bossrahmen „Wut in 4:46 · Lupen · Angefeuert“ (grün), Tooltip „Du kämpfst mit: Deine Söldner machen 40 % mehr Schaden …“ |
| `12-angefeuert-buffleiste.jpg` | Buff „Angefeuert“ mit Megafon und Restzeit links oben, Tooltip mit Restzeit |
| `20-einsatz-beute-moment.jpg` | Beute · Big B: Siegelmarken, EP, Tagesbonus, Erfolge, darunter die Einsatz-Zeile |
| `21-einsatz-tooltip.jpg` | Tooltip „Einsatz 91: Anteil 39 · Unterbrechen 24 · Warnungen 28 = 91 von 100.“ |
| `22-bonus-tooltip.jpg` | Tooltip „Einsatz-Bonus: +2 Siegelmarken für vollen Einsatz. Ab 60 Punkten eine, ab 85 zwei.“ (im Lauf davor „+1 … hohen Einsatz“) |

## Geänderte Dateien

| Bereich | Dateien |
|---|---|
| Laufzeit (neu) | `dungeon-einsatz.js`: Angefeuert, Letztes Aufgebot, Ausweichen, Wertung, Warnungen, Buff |
| Laufzeit | `companions.js`: Schaden × Angefeuert, Autoangriff mit Ausweichen, Letztes Aufgebot je Takt, Nicht-Tank weicht dem Kegel aus<br>`dungeon.js`: Kegel mildert nur der Schutz, Warnung je Zauber, Wertung am Sieg mit Bonus-Siegelmarken, Einblendung der Wut je Boss<br>`auras.js`: Buff „Angefeuert“ |
| Oberfläche | `dungeon-einsatz-ui.js` (neu): Einsatz-Zeile, Chips im Bossrahmen, Wut-Tooltip<br>`dungeon-einsatz.css` (neu), `index.html`<br>`rpg-ui.js`: Beute-Moment<br>`boss-alerts.js`: Chips, Wut-Tooltip<br>`dungeon-journal.js`: Wut als m:ss<br>`aura-ui.js`, `skill-art.js`: Gegenstandsmotiv in der Buffleiste |
| Daten | `content/dungeon-einsatz.js` (neu): Regeln, Wertung, Texte<br>`content/companions.js`: Instanzfaktor Schaden 3,4<br>`content/dungeons.js`: Wut an Gerd, Exposé, Kurt; Big B 4:50; Rita Schaden 4,0<br>`content/dungeon-ui.js`: Wut-Merkmal allgemein<br>`content/index.js` |
| Prüfungen | `scripts/dungeon-sim.mjs`:<br>– `ohneheld` und `nohero` immer mit, mit Kriterien<br>– Fall d25<br>– `SIM_ROLE_SEEDS`, `SIM_JOBS` (Teilprozesse), `SIM_TUNE` (Versuchsschalter)<br>– der passive Held pariert nicht mehr<br>– nohero an allen Hauptbossen<br>`scripts/dungeon-aktiv-check.mjs` (neu), `tests/dungeon-aktiv.test.mjs` (neu) |
| Doku | `docs/DUNGEON-AKTIV-2026-09-26.md` |

## Restliste

1. **„Held liegt ab 20 s“ gewinnt nicht mehr (61 % → 0 %).** Die Nutzerentscheidung „Söldner dürfen ohne den Helden gewinnen“ ist über Fall (c)
   erfüllt (71 %). Wer früh fällt, verliert jetzt meist vor der Wut. Soll auch das öfter reichen, wären 20–30 s spätere Wut an Gerd und
   Kurt der Hebel. Dann gewinnt aber auch der passive Held öfter.
2. **Fall (a) ist 0 % an den Hauptbossen.** „Normal Wipe“ ist damit eher „immer Wipe“. Etwas mehr Luft brächte ein längeres Ausweichen im
   Letzten Aufgebot.
3. **Heiler-Held ohne Heilbedarf:** Angefeuert braucht eigene Taten. Ein Heiler, der bei voller Gruppe nichts tut, verliert den Rückenwind.
   Heiler-Spieler schlagen in der Regel zwischendurch zu; ein Playtest mit Heiler-Held steht aus.
4. **Online-Gruppe (Etappe 5):** Die Wut ist gegen Held + vier angefeuerte Söldner gesetzt. Kommen echte Mitspieler, braucht sie eigene
   Zahlen (`difficulty` oder Gruppengröße).
5. **Söldner bleiben bei „Fläche verlassen“ teils stehen** (Prüferbefund #728, Schorle-Susi): nicht angefasst. Für die Quoten war es nicht
   nötig.
6. **Rita und das halbe Pferd haben keine Wut** (optionale Bosse). Rita ohne Held-Tank bleibt 24/24; beim Pferd ist (a) eine Grenze der
   Simulation.
7. **Playtest:** Ein Prüfer-Durchgang mit dem Einsatz-Panel und einem bewusst passiven Durchgang steht aus.

## Veröffentlichung

Drei Commits auf `main` (FF auf 13a1665c, kein Konflikt beim letzten Rebase), danach `node scripts/server-refresh.mjs`.

- `20ee245d` Held aktiv: Rollen-Balance ohne Helden, Angefeuert, Letztes Aufgebot, Wut an allen Hauptbossen, Einsatz-Wertung
- `83472392` Held aktiv: Browserprüfung dungeon-aktiv-check, Rollen-Fälle der Simulation parallel, „Söldner warten“ erst nach 6 s
- `c86958f3` Bericht Held aktiv, Browserprüfung an das Warten nach der Rede (Fix 5) angepasst
- **Live: Build #740 · `c86958f3` · 2026-09-26** (vorher #737 · `13a1665c`), https://mertloch.esm-consultant.de
