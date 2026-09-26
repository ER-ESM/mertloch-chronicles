# Dungeon „Schloss Big B“ · Fix 6 nach dem Prüfer-Playtest am Endboss (Heilerin passiv) · 2026-09-26

Grundlage:
- Prüfer-Playtest live auf Build #741: `docs/PLAYTEST-2026-09-26-dungeon-bigb-4.md` (unverändert übernommen). Urteil NACHBESSERN, Freigabe
  gesperrt: Eine passive Heilerin gewann Big B ohne eigenes Zutun, etwa 35 s vor der Wut.
- Vorarbeit: `docs/DUNGEON-AKTIV-2026-09-26.md` (Angefeuert, Wut, Rolle, Letztes Aufgebot, Einsatz) und `docs/DUNGEON-FIX5-2026-09-26.md`.
- E-71 samt Nachtrag vom 26.09. (`docs/ENTSCHEIDUNGEN.md`), nur gelesen.

Zweig `dungeon-fix6`, Worktree `D:\Dev\MertlochChronicles-dg-fix6`, Basis `main` 60680d56 (#741).

Nicht angefasst: `CLAUDE.md`, `docs/ENTSCHEIDUNGEN.md`, Klassen-Kits und Klassen-Ressourcen (E-72), Figurengrafik.

## Kurzfassung

- **Ursache Sim ≠ Spiel:** Die Simulation hat Big B nur im schwersten Laufstand gemessen: Rita steht, keine Beweise. Der Testzugang
  (`--preset=bigb`) und jeder volle Durchgang haben Rita gelegt und alle drei Beweise.
  - Mit liegender Rita ruft die Live-Schalte nur einen Follower, und „Reichweite“ fällt weg. Mit der Kirmes-Urkunde nimmt Big B 10 % mehr Schaden.
  - Das verkürzt einen passiven Kampf von rund 400 s auf 251–270 s, einen aktiven nur von 173–202 s auf 141–157 s.
  - Die Wut bei 4:50 kam dann zu spät. Rolle, doppelte Heilung und Tod statt Stehen machen je nur ±5 s aus.
  - Die Simulation trifft den Live-Fall jetzt: Mit den Regeln von #741 gewinnt die passive Heilerin 8 von 8 Mal in 252–263 s mit je zwei Toden.
    Live waren es etwa 250 s und zwei Tode. Mit dem echten Spielstand des Testzugangs im Spiel nachgestellt: Sieg nach 258 s, zwei Tode.
- **Lösung, Wut nach Laufstand:** Was den Kampf leichter macht, zieht die Wut vor.
  - Liegt Rita: 4:50 → 4:00. Liegt dazu die Kirmes-Urkunde vor: 3:35.
  - Der Tooltip der Wut nennt den Grund („Früher als 4:50: Rita liegt −0:50 · Kirmes-Urkunde −0:25“), die Lupe der Urkunde auch.
  - Aktiv bleibt der Abstand zur Wut etwa gleich groß (S0: Wut 290 s bei 173–202 s, S3: Wut 215 s bei 138–158 s).
- **Quoten:**
  - Passiv (jede der 15 Spezialisierungen, Testzugang-Gruppe, drei Arten passiv, Big B in drei Laufständen) gewinnt jetzt 2 % an den Hauptbossen.
  - Big B mit allen Beweisen: vorher 100 %, jetzt 2 %. Über alle Hauptbosse und Rollen gewann passiv vorher 34 %. Keine Kombination liegt jetzt über 17 %.
  - Aktiv gewinnt jede Rolle, auch die Heilerin mit doppelter Heilung, ≥ 57 s vor der Wut. Alle bisherigen Kriterien sind grün, darunter die Quoten (a)–(d).
- **Rollen auffüllen:** Die Eingangskarte zeigt in den freien Plätzen die fehlenden Rollen. Passende Söldner stehen vorn und leuchten, eine zweite
  Heilung bzw. ein zweiter Schutz neben einem Helden derselben Rolle steht hinten und gedämpft. Anheuern kann man weiter jeden.
- **Oberfläche:**
  - Einsatz-Zeile mit dem Wort „Einsatz“, Warnungen als Anzahl und Punkte, Ausweichen immer
  - Buffs auf den Truppenrahmen: Angefeuert, eigene HoTs und Schilde, Letztes Aufgebot
  - „ANGEFEUERT“ im Bosskampf lesbar
  - Säulen blenden aus, wenn der Held dahinter steht
  - Todesfenster neben dem Bossrahmen
  - Toter Held zeigt „Söldner warten“, die Plakette des Freundes stimmt, der eingehende Treffer nennt die Fähigkeit

## 1 · Ursache Sim ≠ Spiel

Nachgestellt mit einer Versuchsreihe (Big B, Bärbel Heilung, typische Ausrüstung, Testzugang-Gruppe, Seeds 7–10, Regeln von #741). Jede
Zeile ändert eine Sache. Angegeben sind Siege und Kampfzeit bzw. das tiefste Bossleben beim Wipe.

| Laufstand | passiv, weicht aus | steht nur da (wie live) | liegt ab 20 s |
|---|---|---|---|
| Rita steht, 0 Beweise (bisher gemessen) | 0/4, Wipe bei 31–39 % | 0/4, Wipe | 0/4, Wipe |
| Rita liegt, 0 Beweise | 4/4 in 283–297 s | – | – |
| Rita liegt, Mietvertrag + Leihschein | 4/4 in 289–295 s | – | – |
| Rita liegt, Kirmes-Urkunde | 4/4 in 259–271 s | – | – |
| Rita liegt, 3 Beweise (Testzugang) | **4/4 in 256–261 s** | **4/4 in 251–270 s, 2 Tode** | 4/4 in 252–260 s |

Ohne Wut gemessen: Passiv braucht Big B im schwersten Stand 394–419 s, mit liegender Rita 283–297 s und mit allen Beweisen 256–261 s. Aktiv
sind es 173–202 s, 165–172 s und 141–157 s.

Der zweite Follower kostet die passive Gruppe über 100 s. Die angefeuerte Gruppe mit Held legt ihn nebenbei.

Geprüfte Vermutungen aus dem Auftrag:
- **Drei Beweise / Geständnis früher:** ja, zusammen mit Rita der ganze Unterschied. Mietvertrag und Leihschein streichen nur Lügen (±3 s).
  Die Kirmes-Urkunde kostet 25–30 s, das frühere Geständnis mit allen drei noch einmal etwa 5 s.
- **Heiler- statt Schadens-Held:** nein. Baerbel-care und baerbel-feedback liegen passiv innerhalb von ±8 s.
- **Doppelte Heilung:** nein. Passiv heilt die Heldin nicht; Susi heilt wie immer. Der Unterschied Held-Tank/Heiler/Schaden passiv liegt bei ±5 s.
- **Held liegt statt passiv zu stehen:** nein, ±5 s.
- **Angefeuert-Anteil 6 %:** nein. Ein Angriff zum Ziehen hält den Rückenwind 6 s, das sind wenige Sekunden weniger Kampf.
- **Sim-Pfad gegen Spielpfad:** Beide nutzen dieselbe Spiellogik. Mit dem echten Spielstand aus `playtest-save.mjs --preset=bigb --class=baerbel
  --spec=baerbel-care` im Spiel geladen, die Beweise am Thron vorgelegt, einmal angegriffen und dann nichts mehr getan: Sieg nach 258 s mit
  zwei Toden (`tests/dungeon-fix6.test.mjs`, Regeln von #741). Die Simulation liefert im selben Fall 252–263 s.

## 2 · Lösung: Wut nach Laufstand · `dungeon.js`, `content/dungeons.js`, `boss-alerts.js`, `dungeon-journal.js`, `dungeon-einsatz-ui.js`

`DUNGEON_BOSSES.bigb.enrage.sooner = {rita: 50, kirmesurkunde: 25}`: Liegt Rita bzw. ist die Kirmes-Urkunde vorgelegt, kommt die Wut so viele
Sekunden früher (`enrageInfo`/`enrageAfter` in `dungeon.js`).

| Laufstand | Wut vorher | Wut jetzt | aktiv (Sim, Testzugang-Gruppe) | passiv ohne Wut |
|---|---|---|---|---|
| S0 Rita steht, 0 Beweise | 4:50 | 4:50 | 173–202 s | 394–419 s |
| S1 Rita liegt, 0–2 Beweise | 4:50 | 4:00 | 165–172 s | 283–297 s |
| S3 Rita liegt, 3 Beweise | 4:50 | 3:35 | 138–158 s | 251–270 s |

**Begründung:**
- Eine Wut ist eine Zeitgrenze gegen die erwartete Gruppenleistung. Rita und die Urkunde senken die nötige Leistung, also muss die Grenze mitgehen.
- Der Abstand für aktive Spieler bleibt dabei etwa gleich (S0: +44 %, S3: +36 % über dem langsamsten aktiven Sieg).
- Mietvertrag und Leihschein beschleunigen nicht, deshalb ziehen sie nichts vor.
- Thematisch passt es: Big Bs Wut heißt „Die ganze Wahrheit“. Je weniger Publikum (Rita) und je mehr Beweise, desto früher platzt sie.

**Verworfen:**
- **Eine feste frühere Wut für alle (etwa 3:40):** Aktiv im schwersten Stand braucht die Startausrüstung bis 210 s. Das ließe echten Spielern
  kaum Luft.
- **Grundstärke der Söldner senken, Angefeuert stärker (3,4 → 2,7, +76 %):** Passiv S3 wäre knapp verloren. Aber „Held Schaden fällt bei 50 %“
  (c) fiele unter 50 %, dazu (d25).
- **Ritas Wirkung ändern (zwei Follower, nur ohne Reichweite):** Passiv mit allen Beweisen läge noch um 300 s und bräuchte trotzdem eine
  frühere Wut. Die sichtbare Belohnung für Rita wäre dabei weg.

**Anzeige:**
- Der Bossrahmen zählt die Wut nach Laufstand herunter („Wut in 3:35“).
- Der Tooltip lautet „Nach 3:35 min Kampf … Früher als 4:50: Rita liegt −0:50 · Kirmes-Urkunde −0:25.“
- Die Lupe der Kirmes-Urkunde sagt „… Seine Wut kommt 0:25 früher.“
- Im Durchgang zeigt das Journal dieselbe Zeit.

## 3 · Quoten vorher/nachher

Simulation `scripts/dungeon-sim.mjs`, neue Teile `passiv`, `live`, `aktiv3` mit Kriterien. „Vorher“ = dieselbe Simulation mit den Regeln von #741
(`SIM_TUNE` ohne `sooner`); Gerd, Exposé und Kurt sind von der Änderung nicht betroffen.

**Passiv** (Teil `passiv`):
- jede der 15 Spezialisierungen, Seeds 7 und 8, Testzugang-Gruppe (Schutz, Heilung, 2× Schaden)
- als Tank oder Heiler also mit doppelter Rolle
- drei Arten:
  - „passiv“: lebt, weicht aus, kein Schaden, keine Kniffe
  - „steht“: wie die Prüferin – zieht, steht dann nur da, fällt und wird aufgehoben
  - „liegt“: fällt nach 20 s und bleibt liegen

Siege je Rolle (Tank 6 Läufe, Heiler 6, Schaden 18 je Zelle), passiv/steht/liegt:

| Boss · Laufstand | Tank vorher → jetzt | Heiler vorher → jetzt | Schaden vorher → jetzt |
|---|---|---|---|
| Gerd | 1/6 · 1/6 · 0/6 (unverändert) | 0 · 0 · 0 (unverändert) | 1/18 · 2/18 · 0/18 (unverändert) |
| Exposé | 0 · 0 · 0 | 0 · 0 · 0 | 0 · 0 · 0 |
| Kurt | 1/6 · 0 · 0 (unverändert) | 0 · 0 · 0 | 1/18 · 0 · 0 (unverändert) |
| Big B S0 (Rita steht, 0 Beweise) | 0 · 0 · 0 | 0 · 0 · 0 | 0 · 0 · 0 |
| Big B S1 (Rita liegt, 0 Beweise) | **6/6 · 6/6 · 6/6** → 0 · 0 · 0 | **6/6 · 5/6 · 6/6** → 0 · 0 · 0 | **18/18 · 17/18 · 18/18** → 0 · 0 · 0 |
| Big B S3 (Rita liegt, 3 Beweise, Testzugang) | **6/6 · 6/6 · 6/6** → 0 · 0 · 0 | **6/6 · 6/6 · 6/6** → 0 · 0 · 0 | **18/18 · 18/18 · 18/18** → 0 · 2/18 · 0 |

Zusammengefasst:

| | vorher (Regeln #741) | jetzt |
|---|---|---|
| Hauptbosse zusammen | 34 % (185/540) | **2 % (9/540)** |
| je Rolle | Tank 36 %, Heiler 32 %, Schaden 34 % | Tank 3 %, Heiler 0 %, Schaden 2 % |
| Big B je Laufstand | S0 0 %, S1 98 %, S3 100 % | S0 0 %, S1 0 %, S3 2 % |
| höchste Kombination | 100 % (Big B S1/S3, jede Rolle) | 17 % (Gerd Tank passiv/steht, Kurt Tank passiv, je 1/6) |

Kriterien (neu, grün):
- Hauptbosse zusammen ≤ 30 %: **2 %** (9/540), je Rolle Tank 3 %, Heiler 0 %, Schaden 2 %, je Art passiv 2 %, steht 3 %, liegt 0 %.
- Jede Kombination Boss × Laufstand × Rolle × Art ≤ 40 %: höchste Gerd Tank passiv 1/6, Gerd Tank steht 1/6, Kurt Tank passiv 1/6 (je 17 %).
- Einsatz: Der passive Held bekommt nie einen Bonus (0–30 Punkte).
- Live-Fall #741 in der Simulation getroffen: Regeln von #741 8/8 in 252–263 s mit je zwei Toden. Jetzt 0/8, Wipe nach der Wut (Seeds 7 und 8: bei 10 % bzw. 8 % Bossleben).

**Aktiv** (Teil `aktiv3`, Testzugang-Gruppe, jede Rolle: 3 Tank-, 3 Heiler-, 5 Schadens-Specs, Seeds 7 und 8):

| Laufstand | Tank | Heiler (doppelte Heilung) | Schaden | Wut |
|---|---|---|---|---|
| S0 | 6/6 in 188–202 s | 6/6 in 189–202 s | 10/10 in 173–198 s | 290 s |
| S3 | 6/6 in 148–158 s | 6/6 in 145–158 s | 10/10 in 138–155 s | 215 s |

Kriterium (neu, grün): jeder aktive Sieg ≥ 40 s vor der Wut.

Big B mit allen Beweisen, Held fällt bei 50 % (Angabe): (a) Tank 0/12, (b) Heiler 0/12, (c) Schaden 20/20 in 192–214 s. Die Söldner dürfen also
auch mit der früheren Wut gewinnen, wenn der Held die erste Hälfte mitgekämpft hat.

**Bestehende Kriterien** (voller Lauf, alle grün, unverändert gegenüber #741):
- Big B aktiv 174–199 s (S0)
- „folgt der Behauptung“ stirbt, „folgt dem Nachsatz“ höchstens einmal
- Gerd 90–92 s, Exposé 92–110, Kurt 97–103, Rita 94–106, Pferd 82–87 s
- Flügel 12,9 · 12,1 · 11,4 min, voller Durchgang 38,7 min
- Typische Ausrüstung ohne Wipe, Startausrüstung jeder Boss schaffbar (Big B 197–204 s)
- EP je Minute, Farm-Schleife
- Quoten (a)–(d): (a) 0 %, (b) 6 %, (c) 71 %, (d) 13 %
- Held passiv (alter Teil) 5 %, Einsatz aktiv 69–80 Punkte mit Bonus

## 4 · Rollen auffüllen (Follower-Dungeon) · `dungeon-entry.js`, `content/dungeon-ui.js`, `dungeon-fix6.css`

WoW-Muster: Im Follower-Dungeon füllen die Begleiter die Rollen, die der Spieler nicht hat.
- `missingRoles`: Gruppe aus 1 Schutz, 1 Heilung, 3 Schaden, abzüglich Held und angeheuerter Söldner.
- Freie Plätze zeigen das Rollensymbol der fehlenden Rolle, Tooltip „Fehlt noch: Schutz“.
- Angebote der fehlenden Rollen stehen vorn und leuchten, Tooltip „… · fehlt in deiner Gruppe“.
- Eine zweite Heilung neben einer Heilerin (bzw. ein zweiter Schutz neben einem Tank) steht hinten und gedämpft, Tooltip „du bist selbst Heilung,
  doppelt ist ein Sonderfall“.
- Vorbelegt wird nichts: Anheuern kostet Pfandmarken, und die Wahl bleibt beim Spieler. Die Browserprüfung heuert nach Pils-Peter auch Schorle-Susi an.

Das Verhalten doppelt besetzter Söldner habe ich nicht geändert. Passiv verliert auch mit doppelter Heilung (Abschnitt 3), aktiv gewinnt die
Heilerin mit Susi; eine Sonderregel war nicht nötig.

## 5 · Weitere Punkte

**5 · Einsatz-Zeile** (`dungeon-einsatz-ui.js`, `content/dungeon-einsatz.js`):
- Der Punkte-Chip trägt klein das Wort „Einsatz“.
- „10/21“ gegen „Warnungen 14“ war Anzahl gegen Punkte: 10 von 21 Warnungen × 30 Punkte = 14. Jetzt steht beides da.
  - Chip-Tooltip: „10 von 21 Boss-Warnungen rechtzeitig beantwortet … Das sind 14 von 30 Punkten.“
  - Punkte-Tooltip: „Punkte: Anteil 0 · Unterbrechen 0 · Warnungen 14 (10/21) · Tode -50 = 0 von 100.“
- Ausweichen steht immer, auch mit 0, wie im Bericht „Held aktiv“ versprochen.
- Aus der Browserprüfung, aktive Heilerin: „EINSATZ 96 · 55 % · 7 % · 2 · 17/17 · 5 · 99 % · +2“. Das sind unter 80 Zeichen.

**6 · Angefeuert bei den Söldnern** (`companion-ui.js`, `dungeon-einsatz.js`, `combat-text.js`, `icon-steps.*`):
- **Truppenrahmen** wie WoW-Gruppenrahmen:
  - Rechts neben dem Lebensbalken stehen drei Plätze für 24er-Symbole: Angefeuert (Megafon, goldener Rand), deine Heilung über Zeit, dein
    Schild bzw. deine Stärkung auf diesem Söldner, Alles oder nichts, Ausweichen.
  - Die Liste ist generisch: Jedes Feld `aid…` mit Restzeit und eine Liste `c.buffs` erscheinen. So greift sie auch die neuen Heiler-HoTs des
    parallelen Auftrags auf.
  - Name und Restzeit stehen im Tooltip des Rahmens („Angefeuert 6 s · Deine Heilung über Zeit 6 s“). Kurz vor dem Ende blinkt das Symbol.
  - Der Rahmen bleibt 54 px, die Truppe 262/262 px, nichts scrollt. Am Handy liegen höchstens zwei Symbole oben rechts im Rahmen.
- **Schriftzug:** Im Bosskampf zeigten Meldungszeilen nur ihr Symbol (Text-Diät aus Etappe 4 B). Deshalb sah die Prüferin „ANGEFEUERT“ nie.
  - Ansagen über Söldnern sind jetzt Ausrufe: 19 px, farbig, 2,8 s.
  - „ANGEFEUERT“ steht einmal als Wort über dem Söldner, der dem Helden am nächsten ist. Über den anderen erscheint das Megafon.
  - Vier gleiche Wörter um Big B verletzten die Text-Diät (`dungeon-e4b-check`: höchstens ein Textelement um den Boss).
  - Gemessen: „ANGEFEUERT“ 19 px mit Text im Bosskampf.

**7 · Figur hinter der Säule** (`kit-art.js kitItemOccludes`, `dungeon-scenery-art.js`, `renderer.js`):
- Die Häuser hatten das schon (`buildingOccludesActor`, Alpha .38). Requisiten im Dungeon jetzt auch.
- Steht der Held oder sein Ziel hinter einem Teil, das mindestens 16 px hoch ist, und in dessen Bild, blendet das Teil auf .38 aus.
- Niedrige Teile (Kisten, Eimer) verdecken nur die Füße und bleiben.
- Bilder `25-saeule-vorher.jpg` und `25-saeule-nachher.jpg`: vorher war die Heilerin hinter der rechten Pappsäule unsichtbar, jetzt ist sie durch
  die Säule zu sehen.

**8 · Todesfenster** (`death-screen.js placeSide`):
- Am Desktop steht es neben dem Bossrahmen, auf dessen Höhe: rechts, sonst links, wo kein anderer Rahmen steht (Spielerrahmen, Minikarte,
  Verfolgung, Warnleiste, Truppe, Zielrahmen).
- Passt beides nicht, steht es wie bisher darunter. Nach dem Sieg bleibt es, wo es war.
- Gemessen bei 2024×900: 330×203 ab x 1246, y 10, Bossrahmen x 792–1232. Big B, der Tank und die Bildmitte sind frei, auch in beiden Toden des
  passiven Laufs.
- Am Handy unverändert.

**9 · Kleinere Punkte:**
- **Rückblick je Tod:** Er wird bei jedem Tod neu gebaut. Die gleichen Zahlen kommen aus Big Bs Anteils-Treffern: Die Kanonenkugel nimmt 70 %
  des Höchstlebens (955 von 1.365), die Pappkulisse 30 % (410). Wer zweimal an derselben Stelle steht, bekommt denselben Rückblick.
  Unit-Test: gleicher Ablauf, gleiche Zahlen; anderer Ablauf, andere Zahlen.
- **Countdown der Warnleiste:** Er läuft. 8,4 s und 16 s später 8,1 s waren zwei verschiedene Kanonenkugeln: In Phase 1 kommt sie alle 16,6 s
  (3,2 s Zauber, 5,5 s Abstand, Anwalt 2,4 s, 5,5 s). Die Browserprüfung liest 3,5 s lang mit: 10,7 → 6,2 s.
- **„−955 Big B“:** Das war der eingehende Treffer der Heldin, deren Figur hinter der Säule stand; er schwebte deshalb scheinbar über Big B.
  Eingehende Treffer nennen jetzt die Fähigkeit („−955 Ritt auf der Kanonenkugel“), nur Autoangriffe den Angreifer. Mit der ausblendenden Säule
  sieht man auch, wem die Zahl gehört.
- **Zielrahmen „10“, Truppenrahmen „11“:** Die Plakette liest `data-level`, und das setzte nur der Gegner-Zweig. Beim gewählten Söldner stand noch
  Big Bs Stufe 10. Jetzt setzt `app.js` die Stufe des Freundes (gemessen: 11 = 11).
- **Toter Held:** Der Bossrahmen zeigt „Söldner warten“. Tooltip: „Du liegst: Deine Söldner kämpfen ohne Rückenwind …“.

## 6 · Prüfungen

Ports CDP 9741–9746, Server 4541–4546, `BOOT_TRIES=450`. Der Rechner war stark belastet: Simulationen und Prüf-Browser anderer Sitzungen liefen
parallel.

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 1309/1309 grün (inkl. `tests/dungeon-fix6.test.mjs`, 13 Tests) |
| `npm run content:check` | 57/57 grün |
| `npm run build` | grün (Quellen-Wächter sauber) |
| `npm run ui:check` | 14/14 grün, Desktop 2024×900: kein Fenster scrollt |
| `node scripts/dungeon-sim.mjs` (alle Teile) | alle Kriterien grün, die neuen eingeschlossen (Auszug in Abschnitt 3) |
| `dungeon-check` | Desktop und Handy grün |
| `dungeon-e4a-check` | 36 grün |
| `dungeon-e4b-check` | 11 grün; erster Lauf rot, Anpassung siehe unten |
| `dungeon-fix3-check` | 9 grün; erster Lauf rot, Anpassung siehe unten |
| `dungeon-fix4-check` | 8 grün |
| `dungeon-fix5-check` | Teile 1–3 grün; Teil 4 nach Anpassung 5 grün |
| `dungeon-aktiv-check` | 4 grün |
| `dungeon-fix6-check` (neu) | alle Teile grün (Ergebnisse unten) |
| `mobile-check` Dungeon (`MOBILE_PART=dungeon`) | hoch und quer, 10 Schritte, 0 Befunde, keine Laufzeitfehler |
| `dungeon-raeume-check` | Teile 1–5 grün. Teil 6 (Bildzeit) unter Last rot, siehe unten |

**`dungeon-raeume-check` Teil 6:**
- Gelaufen, weil die Säule jetzt ausblendet. A/B mit `AB_URL` gegen `origin/main` (60680d56), ohne `CDP_PORT` (9630/9636), dreimal, dazu ein
  A/A-Lauf mit zweimal diesem Stand.
- Rot wird es jedes Mal an einer anderen Stelle: e0 Dichte 3, e0 Dichte 3, k2 Dichte 3. Der Bildabstand springt unter Last zwischen 16,7, 33,3
  und 50 ms, auch A/A bei gleichem Stand (e0 Dichte 4: 49,9 gegen 33,4 ms).
- Zeichenzeit Median nachher gegen vorher:
  - e0 Dichte 3: 6,0/3,7 · 4,3/3,4 · 4,6/5,0 ms
  - k1 Dichte 3: 7,4/7,8 · 6,5/6,6 · 11,1/14,6 ms
  - k2 Dichte 3: 8,9/7,8 · 7,6/9,0 · 13,7/10,6 ms
- Keine Richtung, die sich wiederholt. Die neue Prüfung je Requisit ist ein Rechteckvergleich ohne Zeichnen.

`scripts/dungeon-fix6-check.mjs`:
- Testzugang wie bei der Prüferin (Bärbel Heilung, typische Ausrüstung), echte Maus und Tasten
- `ONLY=1,…`; `FIX6_OLD=1` spielt Teil 2 mit den Regeln von #741

| Teil | Ergebnis |
|---|---|
| 1 Eingangskarte (`--preset=vor`) | freie Plätze Schutz/Schaden/Schaden/Schaden; vorn Pils-Peter, Radler-Rita, Hopfen-Horst, Zapf-Hannes; hinten gedämpft Schorle-Susi, Tresen-Tina; Tooltips per Maus; nach dem Anheuern fehlt kein Schutz mehr; Susi lässt sich trotzdem anheuern |
| 2 Passiv wie die Prüferin | hinter der rechten Säule: sie blendet aus; F, Rechtsklick, Esc, dann nichts. „Söldner warten“, Wut-Tooltip mit Grund, Countdown fällt. Zwei Tode: Todesfenster rechts neben dem Bossrahmen (330×221 ab x 1246, y 10), Big B, Tank und Mitte frei, Bossrahmen „Söldner warten“. **Verloren**: Wipe nach der Wut, Big B zuletzt bei 10 % |
| 3 Aktiv als Heilerin | Bot weicht aus, unterbricht, pariert, wählt verletzte Söldner per Klick auf den Truppenrahmen und heilt (9, 3), sonst Rechtsklick und Kniffe. **Sieg nach 173 s**; Angefeuert auf 4/4 Rahmen (54 px, nichts scrollt), HoT auf Pils-Peter, „ANGEFEUERT“ als Wort (19 px) über dem nächsten Söldner; Einsatz 96 (Anteil 50, Unterbrechen 16, Warnungen 30 bei 17/17), +2; Plakette 11 = 11. Ein früherer Lauf: 174 s, Einsatz 88, +2 |
| 4 Touch | Rahmen-Buffs höchstens zwei, im Rahmen |

Bilder `visual-review/dungeon-fix6/*.jpg` (lokal, nicht im Repo), angesehen:

| Bild | zeigt |
|---|---|
| `10-eingangskarte-vorschlag.jpg`, `11-eingangskarte-tooltip.jpg` | freie Plätze mit Rollensymbol, vorn die passenden Söldner, hinten gedämpft die Heilungen; Tooltip „du bist selbst Heilung, doppelt ist ein Sonderfall“ |
| `20-saeule-blendet-aus.jpg`, `25-saeule-vorher.jpg`, `25-saeule-nachher.jpg` | Heldin hinter der rechten Pappsäule: vorher verdeckt, jetzt durchscheinend |
| `22-tod-1.jpg`, `23-tod-2.jpg` | Todesfenster rechts neben dem Bossrahmen, Big B und Pils-Peter am Thron frei, Bossrahmen „Söldner warten“ |
| `30-truppe-angefeuert.jpg`, `31-truppe-hot.jpg` | Megafon auf allen vier Rahmen, dazu der HoT auf Pils-Peter; Balken kürzer, Truppe ohne Scrollbalken |
| `32-ausruf-angefeuert.jpg` | „ANGEFEUERT“ über dem nächsten Söldner, Megafone über den anderen |
| `33-einsatz-zeile.jpg`, `34-einsatz-tooltip.jpg` | „EINSATZ 96 · 55 % · 7 % · 2 · 17/17 · 5 · 99 % · +2“, Tooltip „Punkte: Anteil 50 · Unterbrechen 16 · Warnungen 30 (17/17) = 96 von 100.“ |
| `35-plakette.jpg` | Zielrahmen Pils-Peter „11“, Truppenrahmen „11“ |

Angepasste bestehende Prüfungen (Verhalten gewollt geändert):
- `dungeon-e4b-check`: Ausrufe über Söldnern (`sct-callout`) zählen nicht zu „Kampfrufe nur als Symbol“; vom Ausruf zählt höchstens das eine Wort.
- `dungeon-fix5-check` Teil 4: Todesfenster neben dem Bossrahmen statt mittig darunter (daneben, auf Höhe des Rahmens, Bildmitte frei).
- `dungeon-fix3-check` Lauf 2: nach dem Todesstoß bis zu 4 s warten, bis der Knopf von „Kampf aufgeben“ auf „Hier aufstehen“ springt. Er folgt
  dem Kampfstand im 100-ms-Takt; unter Last las das Skript einen Takt zu früh. Das Bild eine Sekunde später zeigte schon „Hier aufstehen“.

## 7 · Geänderte Dateien

| Bereich | Dateien |
|---|---|
| Laufzeit | `dungeon.js` (`enrageInfo`, `enrageAfter`, Wut nach Laufstand), `engine.js` (eingehender Treffer nennt die Fähigkeit), `dungeon-einsatz.js` (Ausrufe, ein Wort + Megafone), `companion-ui.js` (`frameBuffs`, Symbole im Rahmen), `combat-text.js` (Ausrufe länger, Klassen), `death-screen.js` (`placeSide`), `dungeon-entry.js` (`missingRoles`, Vorschläge), `app.js` (Plakette des Freundes), `boss-alerts.js`, `dungeon-journal.js`, `dungeon-einsatz-ui.js` (Wut nach Laufstand, Einsatz-Zeile, toter Held) |
| Grafik | `kit-art.js` (`kitItemOccludes`), `dungeon-scenery-art.js` (Requisit blendet aus), `renderer.js` |
| Stil | `dungeon-fix6.css` (neu), `icon-steps.js` / `icon-steps.css` (Stufe `unitBuff` 24), `index.html` |
| Daten | `content/dungeons.js` (`enrage.sooner`, Lupe der Urkunde), `content/dungeon-einsatz.js` (Wut-Tooltip, Warnungen mit Punkten, Ausweichen, toter Held), `content/dungeon-ui.js` (Rollen auffüllen), `content/companion-ui.js` (Rahmen-Buffs) |
| Prüfungen | `scripts/dungeon-sim.mjs` (Laufstände `BIGB_STATES`, Teile `passiv`/`live`/`aktiv3` mit Kriterien, `stand`, Bossleben beim Wipe), `scripts/dungeon-fix6-check.mjs` (neu), `tests/dungeon-fix6.test.mjs` (neu, 13 Tests), `scripts/dungeon-e4b-check.mjs`, `scripts/dungeon-fix5-check.mjs`, `scripts/dungeon-fix3-check.mjs` |
| Doku | `docs/DUNGEON-FIX6-2026-09-26.md`, `docs/PLAYTEST-2026-09-26-dungeon-bigb-4.md` (Prüferbericht, unverändert) |

## 8 · Restliste

Befunde außerhalb dieses Auftrags (Klassen-Kits, E-72) oder bewusst offen:

1. **Heilerin hat nur einen gezielten Heilkniff** (Landhaus-Löffelkur, 1,3 s Zauber, 7,2 s Abklingzeit). Aperol-Nachsorge und Nest heilen laut
   Tooltip nur „dich“. Das Heiler-Kit gehört dem parallelen Auftrag `heiler-wow`. Die Rahmen-Buffs greifen dessen HoTs und Schilde generisch auf
   (`aid…`-Felder, `c.buffs`). Nach dessen Merge `dungeon-sim --only=passiv,aktiv3` erneut laufen lassen: Die Kriterien sichern, dass passiv
   weiter verliert.
2. **Kniff-Tooltips mit 14–20 Zeilen** (Löffelkur, Großreinemachen): Textwände; ebenfalls `heiler-wow` bzw. Klassen-Arbeit.
3. **„Vorrat 0/8“-Leiste** sitzt dauerhaft unten im Spielfeld (x 893–1105, y 668–718) über den Söldnern. Die Ressourcenleiste gehört zu E-72;
   `heiler-wow` dockt sie laut Orchestrator an die Aktionsleiste an.
4. **Heldenauswahl zeigt die Heilerin ohne Ausrüstung** (Unterhemd und Shorts trotz typischer Ausrüstung): Figurengrafik, nicht angefasst.
5. **Wut nach Laufstand ist eine Designentscheidung** zu E-71 (Nachtrag, Punkt 2): In `docs/ENTSCHEIDUNGEN.md` nachtragen – nicht von mir geändert.
6. **Knapper Verlust passiv mit allen Beweisen:** Die passive Gruppe kommt vor dem Wipe bis auf 1–12 % Bossleben. Die Kriterien halten
   (2 %, keine Kombination über 17 %). Soll es deutlicher werden, wären 3:25 statt 3:35 der Hebel; aktiv bliebe dann ≥ 47 s Abstand.
7. **`heroRole` doppelt:** Die Eingangskarte zählt „Schutz & Heilung“ (dieter-brew) als Heilung, die Einsatz-Wertung als Schaden. Das ist älter
   und für dieses Ergebnis ohne Belang.
8. **Rita und das halbe Pferd haben weiter keine Wut** (optionale Bosse; Rita (a) 24/24 wie bisher).
9. **Playtest:** Ein Prüfer-Durchgang auf dem neuen Stand steht aus, passiv und aktiv als Heilerin.

## 9 · Veröffentlichung

Neun Commits auf `main` als Fast-Forward: `main` stand unverändert auf 60680d56, beim Rebase gab es keinen Konflikt. Danach
`node scripts/server-refresh.mjs`.

- `890cb4d9` Prüferbericht
- `1868847b` Wut nach Laufstand, Simulation mit Laufständen, Live-Fall
- `cfd284cc` Oberfläche
- `60babfb2` Tests
- `51644fb4` … `8ffb4187` Browserprüfung, Anpassungen, Manifest
- **Live: Build #751 · `8ffb4187` · 2026-09-26** (vorher #742 · `60680d56`), https://mertloch.esm-consultant.de
- Dieser Bericht folgt als eigener Commit (reine Doku).
