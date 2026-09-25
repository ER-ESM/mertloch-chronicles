# E-72 Runde 5 · welt2: einzelne Weltgegner, Ruhewart, Einstieg (Kürzel „welt2“)

Anlass: Kenner-Nachtest 26.09. nachts (`docs/e72-runde5/kenner/`, `level N`, nur Startausrüstung). Käthe (Stufe 4, 735 Leben)
starb zweimal in rund 3 Minuten: einmal an einem Ruhewart mit „+1“ (kaethe-02), einmal an einem Pfanddachs der Stufe 1 mit „Sprung“
(Dachs 18/450, kaethe-05). Schorsch (Stufe 6) starb gleich nach dem Einstieg an einem Ruhewart der Stufe 3 („Scherbenmeer“, 419/600,
schorsch-02). Fazit des Kenners: „Unter Stufe 7 ist das Dorf tödlich.“

Messwege: `scripts/e72-welt2-messung.mjs` (echte Engine, flache Welt) und Scratchpad-Läufe in der echten Welt (`data/mertloch.json`).
Zellen: Kampfdauer / fehlendes Leben am Ende (netto, nach Eigenheilung). Spielweisen: **Kniffe** = Rotation plus Unterbrechen,
Parade, Ausweichen; **stand** = Rotation ohne Antworten; **langsam** = ein Druck alle 2,5 s; **auto** = nur Autoangriff.

## Was ist der Ruhewart?

- Feldart `warden` („Ruhewart auf Streife“, `content/enemies.js`): Stufe 3, 600 Leben, bemerkt dich auf 12,5 m, streift 14 m um sein
  Heim. 30 % der angriffslustigen Feldreviere im Dorfkern.
- Autoangriff „Aktenklammerwurf“ 26–38 alle 2,4 s aus **18 m**. Alle 5,5 s ein Zauber im Wechsel: „Anzeige ist raus“ 125 (2,1 s,
  unterbrechbar, trifft bis 29 m) und „Scherbenmeer“ 130 (2,4 s, Bodenkreis 7 m).
- **Es gibt keine Nachtregel.** Die Uhr an der Minikarte zeigt die echte Uhrzeit, das Licht hängt an der Zone. Der Ruhewart ist Tag und
  Nacht gleich. „Streife“ ist nur Name und Streifradius, die Nachtruhe nur Hintergrund (Ruhe 22:01 e. V.).
- Ankündigung vorher: keine. Er warf im selben Takt, in dem er dich bemerkte, denn 18 m Wurfweite sind mehr als 12,5 m Bemerk-Reichweite.

## Befund

1. **Einzelkampf ist nicht tödlich, auch nicht auf Stufe 1.** Mit Kniffen ist die gleiche Stufe fordernd und 3 Stufen darüber mühelos.
   Das gilt für alle fünf Klassen (Tabelle unten).
2. **Der tödliche Ruhewart stand am Einstieg.** Angriffslustige Feldreviere hielten nur Abstand zur Kirche (54 m), nicht zu
   Kisten-Ida. Ida ist die erste Auftraggeberin neben der Bude und steht 66 m von der Kirche entfernt. Ein Ruhewart (id 12863) streifte
   47 m östlich von Ida, also noch vor dem Kirchhof (Stufe 1) und auf dem Weg zur Grillwiese (Stufe 2). Die Tracker der Kenner-Bilder
   zeigen 39–41 m bis Ida, der Hintergrund (Bude-Schild, Tanne) passt. Beide Ruhewart-Tode fanden dort statt.
3. **Das „+1“ war ein Leergut-Rabe** (neutral, 61 m von Ida). Käthes Karo und Schorschs Spanferkel treffen im Umkreis mit.
   Nachgestellt in der echten Welt.
4. **Die Tode entstehen durch das Tempo des Playtests.** Über das Browser-Werkzeug liegen 6–8 s zwischen zwei Tasten. Nachgestellt
   mit „ein Druck alle 6 s“ am Ida-Ruhewart:
   - Schorsch stirbt auf Stufe 2, 4 und 6 (nach 38–60 s).
   - Anni, Kevin und Schorsch sterben auf Stufe 1, Käthe auf Stufe 1 mit Rabe.
   - Die übrigen Kämpfe enden mit −44 bis −92 %.

   Beim Dachs stimmt die Rechnung mit dem Bild überein: Käthe 4 muss 735 Leben verlieren, das dauert rund 30 s. In der Zeit richtete
   sie 432 Schaden an, also etwa 14/s. Mit der Rotation schafft sie 92/s.
5. **Sprung ist angekündigt und ausweichbar** (Frage 4). Roter Bodenkreis auf dem Helden (`drawGroundHazard`, gleiche Ellipse wie die
   Trefferprüfung), 1,5 s Zauberzeit, im Zielrahmen „Sprung · ausweichen“. Beides vermeidet den ganzen Schaden:
   - Ausweichen 0,35 s vor dem Einschlag
   - Loslaufen 0,8 s vor dem Einschlag

   Ein Sprung kostet Käthe 4 nur 88 von 735 Leben (12 %).
6. **Käthe und Schorsch sind auf niedriger Stufe nicht zu schwach** (Frage 3). Mit Kniffen sind sie die sichersten Klassen:
   - Käthe verliert 0–4 % gegen Dachs und Keiler: Herz- und Pik-Karten ab Stufe 1, Karo bremst und betäubt.
   - Schorsch verliert 0–19 %: Bratwurst heilt ab Stufe 2.

   Schwach ist nur Schorsch bei langsamem Tastentakt. Die Glut kühlt ab, und bei einem Druck alle 6 s serviert die Rotation bei Glut 0.
   Das gehört zur Klasse, am Einstieg fehlt nichts. **Keine Klassenänderung**, das Balance-Sheet ist unverändert (siehe Prüfung).

### Einzelkampf, gleiche Stufe → 3 Stufen darüber (flache Welt, Startausrüstung; vorher = nachher)

| Gegner | Spielweise | Dieter | Anni | Kevin | Schorsch | Käthe |
|---|---|---|---|---|---|---|
| Dachs 1 · Held 1 → 4 | Kniffe | 8,9 s/−15 % → 6,2/−7 | 7,0/−11 → 5,4/−6 | 8,4/−15 → 4,0/−6 | 7,7/−14 → 7,4/0 | 6,2/−1 → 4,9/0 |
| | langsam | 12,7/−39 → 8,5/−17 | 12,7/−52 → 7,7/−24 | 13,6/−52 → 6,2/−21 | 12,7/−48 → 19,0/−31 | 10,2/−28 → 10,2/−21 |
| Keiler 2 · Held 2 → 5 | Kniffe | 7,6/−12 → 6,2/−9 | 7,0/−15 → 5,4/−8 | 8,4/−15 → 4,0/−8 | 7,2/−2 → 7,4/0 | 6,2/−4 → 4,9/−2 |
| | langsam | 10,6/−30 → 7,7/−16 | 15,2/−34 → 7,7/−23 | 13,2/−55 → 6,2/−24 | 20,2/−52 → 20,2/−36 | 10,2/−29 → 10,2/−22 |
| Ruhewart 3 · Held 3 → 6 | Kniffe | 7,3/−20 → 6,2/−7 | 7,3/−29 → 5,4/−7 | 7,0/−25 → 4,0/−7 | 8,9/−11 → 7,4/0 | 6,4/−2 → 5,8/−9 |
| | langsam | 10,2/−26 → 12,7/−15 | 13,2/−33 → 12,7/−26 | 10,2/−33 → 10,7/−26 | 22,7/−48 → 22,7/−32 | 12,7/−27 → 17,7/−32 |
| Ruhewart 3 · Held 6 | stand | −16 % | −19 % | −6 % | −3 % | −22 % |
| | nur Auto | † 44 s | † 37 s | † 37 s | † 44 s | † 37 s |

Treffer am Helden (stand, nach Rüstung):

| Gegner | Autoangriff | Sonderangriff |
|---|---|---|
| Dachs | Biss Ø 11–24 | Sprung 55–93 |
| Keiler | Hauer Ø 16–35 | Sprung 37–97 |
| Ruhewart | Wurf Ø 17–30 | Anzeige 66–116, Scherbenmeer ≈ 100–115 (Stufe 6) |

Kenner-Tempo, flach (ein Druck alle 6 s / 8 s):

| Kampf | 6 s | 8 s |
|---|---|---|
| Käthe 4 gegen Dachs | −43 % | −64 % |
| Käthe 4 gegen Ruhewart | −74 % | −99 % |
| Schorsch 6 gegen Ruhewart | −57 % | −92 % |

## Änderungen

- **Ankündigung** (`foe-rules.js` announce/alertState/alertShown/alertProgress, `BALANCE.foes.alert`). Gilt, wenn ein Weltgegner dich
  von sich aus bemerkt:
  - Er zeigt 1,2 s ein rotes Pixel-„!“ neben dem Schild.
  - Menschen rufen ihre Zeile (`ENEMY_BARKS`). Die Zeile beim ersten Spezialangriff entfällt dann, es bleibt eine Blase je Kampf.
  - **Fernkämpfer** (Ruhewart, Lager-Ruhewart, Schnorrer, Praktikant, Olaf) zücken 1,5 s den Block: roter Balken unter dem Namen,
    kein Wurf, kein Zauber, keine Bewegung.
  - Wer in der Zeit weiter als 1,35 × Bemerk-Reichweite weg ist, den lässt er ziehen („zieht ab“).
  - Ein Treffer beendet die Ankündigung. Eigener Angriff und Kettenzug („Kumpel kommt“) lösen keine aus.
  - Nahkämpfer zeigen nur das „!“.
  - Dungeon und Weltbosse sind ausgenommen (`worldFoe`).
- **Einstieg an Kisten-Ida** (`foe-rules.js` nearEntry, `encounters.js` buildCell): Angriffslustige Feldreviere halten zu Ida
  denselben Abstand wie zur Kirche (54 m). Die Prüfung läuft nach dem Würfeln, der Zufallsstrom bleibt gleich. Ein Abzug aller
  6.842 Feldgegner der Welt vorher/nachher zeigt **genau eine Änderung**: Ruhewart 12863 (47 m östlich von Ida) wird zur Grillgut-Gans.
- `engine.js`: nur die Aufrufe (announce beim Bemerken, alertState im Kampftakt, barkedOnNotice).
- `renderer.js`: „!“ und Balken. Das „!“ ist gepixelt, weil Schrift unter einer Sprechblase entfällt (`flushLabels`).

## Messwerte nachher

Die Tabellen oben ändern sich nicht. Die Messung startet den Kampf direkt, und die Ankündigung ändert keine Kampfzahl: 1,5 s ohne Wurf
sparen rund einen Autoangriff. Mit Ankündigung, Ruhewart bemerkt den Helden aus 11 m:

| Takt | Stufe | Dieter | Anni | Kevin | Schorsch | Käthe |
|---|---|---|---|---|---|---|
| 2,5 s | 4 | −28 → −23 % | −32 → −32 % | −32 → −32 % | −44 → −41 % | −30 → −28 % |
| 2,5 s | 6 | −30 → −24 % | −26 → −26 % | −29 → −26 % | −36 → −41 % | −23 → −22 % |

Echte Welt, Kenner-Weg (von Ida 35 m nach Osten, alle Klassen, Stufe 1/2/4/6, Takt 2,5 s und 6 s):

- Vorher: Kampf mit dem Ruhewart, bei 6 s 7 von 20 Helden tot.
- Nachher: **kein Kampf**. An der Stelle grasen Gänse (e1).

## Prüfung

- `npm test`: **1.177/1.177 grün** (vorher 1.169). Neu ist `tests/e72-welt2.test.mjs` mit 8 Tests:
  - Stufe-4-Käthe (und alle Klassen) schlägt einen Stufe-1-Dachs, auch langsam
  - Ruhewart 3 legt Stufe 6 nicht um: Kniffe ≤ 15 %, stand ≤ 30 %, langsam ≤ 40 %, nur Autoangriff frühestens nach 30 s tot
  - gleiche Stufe mit Kniffen ≤ 45 %, 4–15 s
  - Ankündigung: „!“, eine Zeile, kein Wurf in 1,5 s
  - Weggehen → kein Treffer, Treffer beendet die Ankündigung, eine veraltete Ankündigung beendet keinen Kampf
  - Nahkämpfer, eigener Angriff, Kettenzug
  - Sprung: Kreis auf dem Helden, Ausweichen/Laufen → 0
  - Ida: kein angriffslustiges Revier unter 54 m
- `npm run content:check` grün. `npm run balance:sheet` ist **identisch** mit einem frischen Lauf vor der Änderung. Die eingecheckte
  Fassung wich schon vorher in fünf Zellen und der Überblickszeile ab. Das Sheet ist nicht committet.
- Headless: `SERVER_PORT=4472 CDP_PORT=9872 node scripts/e72-welt2-check.mjs` → `docs/e72-runde5/welt2/`:
  - `a1`: Ruhewart bemerkt Käthe 4 → „!“ + Balken + „Ich hab’s dokumentiert.“, erster Wurf nach 1,5 s
  - `a2`: Weggehen → „zieht ab“, kein Treffer
  - `b1`/`b2`: Sprung-Kreis mit „Sprung · ausweichen“ im Zielrahmen, ausgewichen, 0 Schaden
  - `c1`/`c2`: Käthe 4 schlägt Dachs 1
  - `d1`/`d2`: Schorsch 6 schlägt Ruhewart 3 (einfacher Tastentreiber, je Lauf −4 bis −28 %)
  - `e1`: Kenner-Todesort ohne Ruhewart
- Die Runde-4-Prüfung `scripts/e72-welt-check.mjs` ist weiter PASS.

## Offen / Risiken

- **Kenner-Tempo bleibt tödlich.** Bei einem Druck alle 6 s legt ein einzelner Ruhewart Schorsch 6 nach rund 60 s um, die anderen
  enden bei −40 bis −75 %. Das ist nicht das Tempo eines Menschen. Kampf-Playtests über das Browser-Werkzeug fallen damit deutlich zu
  pessimistisch aus, Zahlen sollten aus den Node-Messungen kommen.
- **Stufenabstand (R4) wirkt erst spät.** 3 Stufen darüber heißt nur −10 % Schaden. Mit Kniffen ist das mühelos (0–9 %), ohne Kniffe
  oder langsam nicht. Nicht geändert, weil es eine Balance-Entscheidung ist. Möglich wäre `gap.damagePerLevel` .1 → .15 oder
  `grace` 2 → 1; letzteres bricht den Gleichlauf mit den Farben am Zielrahmen.
- Die Ankündigung erscheint nur in der Welt („!“, Balken, Blase), nicht im Zielrahmen. Der Balken im Zielrahmen wäre UI-Arbeit
  (target-ui.js), wegen der parallelen HUD-Runde nicht angefasst.
- Beim Bemerken hält der Autopilot weiter an (R5a). Der Held bleibt vor dem Ruhewart stehen, die 1,5 s reichen aber zum Weggehen von Hand.
- Der Ruf beim Bemerken nutzt die Blasen-Drossel (4 s je Art). Bei zwei Menschen zugleich ruft nur einer.
