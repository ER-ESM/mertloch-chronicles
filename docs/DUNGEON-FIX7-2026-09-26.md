# Dungeon „Schloss Big B“ · Fix 7 nach Prüfer-Playtest 5 (passive Gruppe gewinnt unter Wut) · 2026-09-26

Grundlage:
- Prüfer-Playtest live auf Build #770: `docs/PLAYTEST-2026-09-26-dungeon-bigb-5.md` (unverändert übernommen). Urteil NACHBESSERN, Freigabe gesperrt:
  Die passive Gruppe legte Big B unter „Wut ×4“. Zwei Schadens-Söldner schafften die letzten 4 % mit dem Letzten Aufgebot.
- Vorarbeit: `docs/DUNGEON-FIX6-2026-09-26.md` (Wut nach Laufstand, Teil `live`), `docs/DUNGEON-AKTIV-2026-09-26.md`, `docs/HEILER-WOW-2026-09-26.md`.
- E-71 samt Nachtrag (`docs/ENTSCHEIDUNGEN.md`), nur gelesen.

Zweig `dungeon-fix7`, Worktree `D:\Dev\MertlochChronicles-dg-fix7`, Basis `main` 87a9466b (#770).

Nicht angefasst: `CLAUDE.md`, `docs/ENTSCHEIDUNGEN.md`, Figurenbögen (nur der Maßstab), Klassen-Kits.

## Kurzfassung

- **Warum die passive Gruppe gewann:**
  - Die Wut war kein harter Wipe. Nach dem Ausbruch lebte eine passive Gruppe noch 20–46 s.
  - In dieser Zeit reichten wenige Prozent mehr Bossschaden. Die Prüferin hatte ihn am Anfang mit 20 s Autoangriff selbst verursacht, dazu kam
    das Letzte Aufgebot („Ausweichen“ 8 s, doppelter Schaden).
  - Die Simulation hat keine Art „erst 20 s Autoangriff, dann passiv“ gespielt, und je Fall nur zwei Seeds.
- **Wut ist jetzt ein harter Wipe wie in WoW (alle Hauptbosse):**
  - Ab dem Ausbruch trifft eine **Wutwelle** alle 2 s die ganze Gruppe: 8 % des Höchstlebens je Wutstufe, jede Stufe dauert 5 s.
  - Ausweichen schützt nicht, unter Wut auch nicht mehr vor den Schlägen des Bosses.
  - Gemessen stirbt die Gruppe 10–18 s nach dem Ausbruch.
- **Quoten im echten Spiel** (Serien-Nachstellen, je Variante 60 Läufe: 3 Rollen × 20 Seeds, Testzugang der Prüferin):

  | Variante | vorher | jetzt |
  |---|---|---|
  | (i) wie die Prüferin | 12 % | **0 %** |
  | (ii) passiv ab dem Pull | 0 % | 0 % |
  | (iii) passiv und tot | 0 % | 0 % |
  | aktiv | 100 % | 100 %, mit 50–72 s Luft |
- **Simulation:** trifft den Live-Fall jetzt. Mit den Regeln von #770 hält die Gruppe die Wut 30–36 s und gewinnt einmal in acht Läufen, sonst
  verliert sie knapp. Jetzt liegt sie 12–14 s nach der Wut. Alle Kriterien sind grün, auch (a)–(d).
- **Weitere Punkte:**
  - Big B ist bis „bereit“ nicht angreifbar.
  - Das Todesfenster erscheint sofort, mit „Schorle-Susi hilft dir gleich auf“ und Balken.
  - Verbrauchsgüter-Tooltips folgen dem WoW-Muster. Die leeren Werte waren eine CSS-Farbe.
  - Einsatz-Zeile: Name und Wert je Feld, Ausweichen im Sammel-Tooltip, Megafon für „Angefeuert“.
  - Big B ist ×1,5 statt ×1,35 groß.
  - Die Kostenzeile der Löffelkur passt in eine Zeile, der Wut-Tooltip ist klar.

## 1 · Warum die passive Gruppe gewann

**Nachgestellt im echten Spiel.** `scripts/dungeon-serie.mjs` ist neu und baut den Live-Fall-Test aus Fix 6 aus:
- Spielstand aus `playtest-save.mjs --preset=bigb` je Rolle, geladen wie im Browser (`new Game(world, save)`).
- Takt wie im Browser: meist 1/60 s, dazu Aussetzer von 1/30 und 0,05 s.
- Zufall je Lauf (Seed).
- Derselbe Spieler-Bot wie die Simulation; die Kampfschleife ist dafür nach `scripts/sim-fight.mjs` ausgelagert.

Rollen:
- Heilerin `baerbel-care` wie die Prüferin
- Tank `dieter-wall`
- Schaden `dieter-brawl`

Laufstand: drei Beweise, Rita liegt, Wut 3:35.

Varianten:
- (i) wie die Prüferin: nach der Rede ziehen, 20 s nur Autoangriff, dann passiv (weicht aus)
- (ii) passiv ab dem Pull
- (iii) passiv und tot ab 20 s
- aktiv

Befunde:
1. **Die Wut ließ Zeit.** Mit den Regeln von #770 lebte die passive Gruppe nach dem Ausbruch noch **20–46 s**, egal in welcher Variante.
   - Die Wut hob nur den Schaden des Bosses auf sein Ziel.
   - Wer nicht Ziel war, bekam nichts ab. Wer im Letzten Aufgebot auswich, ebenfalls nichts.
   - Siege der Variante (i) kamen 20–28 s nach dem Ausbruch (235–243 s). Live war es „Wut ×4“, also 15–20 s danach.
2. **Die ersten 20 s machten den Unterschied.**
   - Der Autoangriff der Prüferin hielt „Angefeuert“ rund 26 s und brachte eigenen Schaden: etwa 4–5 % mehr Bossschaden vor der Wut.
   - Fix 6 hatte gemessen, dass die passive Gruppe bei 1–12 % Bossleben verliert. Genau dieser Spielraum reichte in (i) für 12 % Siege, beim
     Schadens-Helden für 25 %.
   - Ganz passiv (ii, iii): 0 %.
3. **Die Simulation hat die Variante nicht gespielt.**
   - Alle drei Arten aus Fix 6 hörten nach dem Pull sofort auf.
   - Je Kombination liefen zwei Seeds. Quoten von 10–25 % sieht man damit kaum: Heiler S3 dort 0/6, im echten Spiel 2/20.
4. **Geprüft und verworfen:**
   - **Takt:** Mit festen 0,05 s statt der Bildrate kamen 22 % statt 23 % Siege heraus, gleiche Serie.
   - **Sim-Aufbau gegen echten Spielstand:** Bei gleichem Verhalten liegen die Ergebnisse gleich (ii: 0/60 im echten Spiel, „passiv“ in der Simulation 0 % an Big B).
5. **Nebenbefund:** Die ersten Serienläufe hingen von der Reihenfolge im Prozess ab (Gegner-Nummern). Eine erste Messung ergab deshalb 23 %.
   Jetzt setzt jeder Lauf die Nummern zurück, wie die Simulation. Alle Zahlen hier sind mit unabhängigen Läufen gemessen.

## 2 · Wut als harter Wipe · `dungeon.js`, `dungeon-einsatz.js`, `content/dungeon-einsatz.js`

**Wutwelle** (`EINSATZ_RULES.enrage.wave = {every:2, pct:.08}`, `dungeon.js enrageWave`):
- Ab dem Ausbruch trifft der Boss alle 2 s den Helden und jeden stehenden Söldner mit 8 % des Höchstlebens je Wutstufe.
- Die Stufe steigt alle 5 s, die Treffer wachsen also so: 8 · 8 · 8 · 16 · 16 · 24 … Prozent.
- Ohne Heilung liegt jeder nach etwa 12 s, mit Heilern nach 15–18 s.
- Schilde und Schadensminderung wirken wie sonst, halten die Welle aber nicht auf.
- Sichtbar: ein Ring am Boss (Kampfeffekt „burst“) und ein Wackeln. Im Treffer und im Todesrückblick steht der Name: „Die ganze Wahrheit“,
  „Sperrstunde“, „Letztes Angebot“, „Zapfenstreich“.

**Wahl beim Letzten Aufgebot:** „Ausweichen schützt nicht vor Wut-Schaden“ (`EINSATZ_RULES.enrage.evade = false`, `bossAutoFactor`):
- Die Wutwelle ignoriert das Ausweichen, und unter Wut hält das Ausweichen auch die Schläge des Bosses nicht mehr ab.
- Das Letzte Aufgebot darf unter Wut weiter auslösen und bleibt sichtbar. Es verlängert aber nichts: Die Gruppe liegt trotzdem nach 10–18 s.

Begründung:
- **Unabhängig vom Zeitpunkt:** „Löst unter Wut nicht aus“ allein hilft nicht, wenn das Letzte Aufgebot kurz vor der Wut beginnt. Das Ausweichen
  (8 s) und der doppelte Schaden (20 s) liefen sonst in die Wut hinein. Jetzt ist die Wut selbst unausweichlich.
- **Fall (d) bleibt:** Vor der Wut ist das Letzte Aufgebot unverändert. (d) liegt weiter bei 13 %; bei 25 % gewinnt Gerd 23/40 in 107–128 s, also
  vor seiner Wut bei 130 s.

**Andere Hauptbosse** (Unit-Test je Boss, Simulation):
- Gerd, Exposé, Kurt und Big B: Nach dem Ausbruch liegt die ganze Gruppe spätestens nach 20 s, auch wer ausweicht und nicht Ziel ist.
- Simulation, alle passiven Läufe bis zur Wut: **0–18 s** nach dem Ausbruch (523 Läufe). Mit den Regeln von #770 waren es 0–45 s.
- Exposé-Läufe mit „VERKAUFT“ (Rücksetzen) zählen dabei nicht: Die Wut zählt nach dem Rücksetzen von vorn.

**Tooltip der Wut:**
- Vorher: „… Mit dir im Kampf liegt er vorher.“
- Jetzt: „Nach 3:35 min Kampf: 150 % mehr Schaden, alle 5 s noch einmal, und alle 2 s trifft die Wut die ganze Gruppe. Das überlebt niemand.
  Wer mitkämpft, legt den Boss lange vorher. Früher als 4:50: Rita liegt −0:50 · Kirmes-Urkunde −0:25.“

## 3 · Quoten vorher/nachher

### Echtes Spiel (`node scripts/dungeon-serie.mjs --runs=20`, je Rolle und Variante 20 Läufe)

„Vorher“ ist der Stand #770 mit dem Serien-Nachstellen (Commit `ae55bcb5`), „jetzt“ ist dieser Zweig.

| Variante | Rolle | Siege vorher | Siege jetzt | Wipe nach der Wut vorher → jetzt | Bossleben beim Wipe jetzt |
|---|---|---|---|---|---|
| (i) wie die Prüferin | Heilerin | 2/20 (239–243 s) | **0/20** | 29–41 s → **12–17 s** | 6–13 % |
| | Tank | 0/20 | 0/20 | 31–45 s → 14–16 s | 6–14 % |
| | Schaden | 5/20 (235–241 s) | **0/20** | 20–46 s → 12–18 s | 2–15 % |
| (ii) passiv ab dem Pull | Heilerin · Tank · Schaden | 0 · 0 · 0 | 0 · 0 · 0 | 20–44 s → 10–16 s | 9–18 % |
| (iii) passiv und tot | Heilerin · Tank · Schaden | 0 · 0 · 0 | 0 · 0 · 0 | 30–40 s → 12–16 s | 7–14 % |
| aktiv | Heilerin | 20/20 in 153–165 s | 20/20 in 153–165 s | – | Einsatz 76–80 (+1) |
| | Tank | 20/20 in 143–156 s | 20/20 in 143–156 s | – | Einsatz 30–31 |
| | Schaden | 20/20 in 149–158 s | 20/20 in 149–158 s | – | Einsatz 78–80 (+1) |

Kriterien (grün):
- passiv je Variante ≤ 10 %: jetzt 0/60, 0/60, 0/60; vorher 7/60 in (i)
- aktiv ≥ 90 % Siege mit ≥ 20 s Luft vor der Wut: 60/60, die Luft beträgt 50–72 s

### Simulation (`node scripts/dungeon-sim.mjs`, voll)

Neu: Art **„anfang“** (20 s Autoangriff, dann passiv) im Teil `passiv` und der Live-Fall #770 im Teil `live`. „Vorher“ ist derselbe Lauf mit
`SIM_TUNE='{"rules":{"enrage":{"wave":{"pct":0},"evade":true}}}'` (Regeln von #770).

| Messung | vorher (#770) | jetzt |
|---|---|---|
| Live-Fall #770 (Bärbel Heilung, S3, anfang, 8 Seeds) | 1/8. Ende 30–36 s nach der Wut, sonst verloren bei 1–15 % | 0/8, Wipe 12–14 s nach der Wut, verloren bei 6–16 % |
| Big B „anfang“, alle Laufstände, 15 Specs | 6/90 (S3: Tank 1/6, Heiler 0/6, Schaden 5/18) | **0/90** |
| passiv (Fix-6-Arten passiv/steht/liegt), Hauptbosse | 2 % (9/540) | 1 % (3/540), keine Kombination über 1/6 |
| harter Wipe: passive Läufe bis zur Wut | 0–45 s danach | **0–18 s** danach |
| Gerd „anfang“ (Angabe) | 29/30 | 20/30, Siege 131–144 s (Wut 130 s) |
| Kurt „anfang“ (Angabe) | 16/30 | 10/30, Siege 141–152 s (Wut 150 s) |
| Exposé „anfang“ (Angabe) | 0/30 | 0/30 |

Kriterien (neu, grün):
- Live-Fall #770 getroffen: Mit den Regeln von #770 hält die Gruppe die Wut über 20 s, gewinnt mindestens einmal und verliert sonst knapp
  (Median ≤ 8 %). Jetzt: höchstens 10 % Siege, Wipe spätestens 20 s nach der Wut.
- „Wie die Prüferin“ an Big B in jedem Laufstand und jeder Rolle: ≤ 10 % Siege.
- Harter Wipe: Jede passive Gruppe liegt spätestens 20 s nach der Wut.

**Gerd und Kurt „anfang“:** Nur Angabe, begründet.
- 20 s Autoangriff sind dort ein Sechstel des Kampfs, also echtes Mitkämpfen am Anfang.
- Die Siege fallen in die ersten 14 s nach der Wut. Die Gruppe steht dann schon bei wenigen Prozent, der Wipe bleibt hart.
- Siehe Restliste.

**Bestehende Kriterien** (alle grün):
- Big B aktiv 174–199 s, Gerd 90–92, Exposé 92–110, Kurt 97–103, Rita 94–106, Pferd 82–87 s
- Flügel 12,9 · 12,1 · 11,4 min, Durchgang 38,7 min
- Ausrüstung, Farm-Schleife und Heiler-WoW (H1–H3)
- Fix 6, aktiv3: jeder Sieg ≥ 40 s vor der Wut

Gewollte Änderungen durch den harten Wipe:
- (c) „Schaden-Held fällt bei 50 %“: 71 % → 70 %. Gerd 37 → 36/40, Big B S0 31 → 30/40. Siege, die erst tief in der Wut kamen, entfallen.
- (a) 0 %, (b) 15 % und (d) 13 % sind unverändert.

## 4 · Weitere Punkte

**4 · Laufklick während der Rede** (`dungeon.js bossUnready`, `auto-combat.js`, `app.js`): Bis „bereit“ ist ein Boss mit Einleitung nicht angreifbar.
- Rechtsklick auf ihn oder den Boden neben ihm läuft nur.
- `startAuto` lehnt ab, ein laufender Autoangriff geht aus. Bei „bereit“ zieht deshalb nichts von selbst.
- Erst der nächste Angriff zieht. Vorher schaltete der Rechtsklick den Autoangriff an, und bei „bereit“ zog der erste Autotreffer Big B.

**5 · Todesfenster beim ersten Tod** (`death-screen.js`, `dungeon.js ghostState`, `content/combat.js`):
- In automatischen Läufen erschien das Fenster bei jedem ersten Tod. Die Ursache der Prüferin habe ich nicht nachstellen können. Das Fenster ist
  deshalb jetzt robust:
  - Im Dungeon ist es sofort voll da, ohne Einblenden (vorher 0,35 s).
  - Liegt der Held und das Fenster ist zu, egal warum, öffnet es sich im 100-ms-Takt wieder.
  - Hat ein Heil-Söldner sein Aufhelfen noch frei, steht „Schorle-Susi hilft dir gleich auf“ mit Balken da, dann „… hilft dir auf“ mit laufendem Balken.
- Gemessen: 89 ms nach dem Tod, rechts neben dem Bossrahmen (330×185), Rückblick darin.

**6 · Tooltip der Notfallbrezel** (`popup-ui.css`, `describe-ui.js`, `describe.js`, `content/panel-ui.js`, `content/item-info.js`):
- **Ursache der leeren Werte:**
  - `.describe-numbers .is-live b{color:var(--green,#cae5a3)}` erwartete ein helles Grün.
  - Seit dem Bierdeckel-Stil ist `--green` der Fenstergrund (#223A2F). Alle Laufzeitwerte standen deshalb in Hintergrundfarbe.
  - Betroffen waren alle Verbrauchsgüter und jede andere Beschreibungskarte mit Laufzeitwerten. Jetzt fest #cae5a3.
- **WoW-Muster** wie die Kniff-Tooltips:
  - Name und „Stapel n“
  - Kopfzeile „Verpflegung · 15 s Abklingzeit, geteilt“
  - ein Satz Wirkung
  - Zahlenzeile „Heilt 160“ bzw. „+40 Likes“
  - ⇧ Details: dort alle Zahlen, Warum und Begriffe
- **Details ohne Dopplung:** „Leben sofort“ und „Gemeinsame Abklingzeit“ stehen nur noch einmal. Neben „Stapelgröße“ steht „Im Rucksack“.
- Alle 8 Verbrauchsgüter geprüft: jedes mit Kopfzeile und gefüllter Zahlenzeile, höchstens 215 Zeichen.
- Brezel im Browser: 340×196 px, mit Umschalttaste die Werte 15, 160 und 3 sichtbar.

**7 · Einsatz-Zeile** (`dungeon-einsatz-ui.js`, `content/dungeon-einsatz.js`):
- Jedes Feld nennt im eigenen Tooltip Namen und Wert, als Überschrift und als `aria-label`: „Heilungsanteil 44 %“, „Unterbrechungen 1“, „Warnungen 19/19“,
  „Ausweichen 7“, „Angefeuert 73 %“, „Einsatz-Bonus +2“.
- Der Punkte-Tooltip führt alle Felder, auch Ausweichen, danach die Punkte.
- „Angefeuert“ zeigt das Megafon wie Buffleiste und Truppenrahmen, statt eines Funkens. So hat jedes Symbol eine Bedeutung.
- Die Zeile bleibt Symbole und Zahlen, unter 80 Zeichen.

**8 · Big B größer** (`content/dungeons.js drawScale`, `dungeon-actors.js`, `hero-reveal.js`):
- **Vorher gemessen** (Anziehpuppe, gezeichnet wie im Spiel): 46 Welteinheiten mit Krone gegen 28–29 der Söldner, also 1,6×; ohne Krone 1,46×.
  - Die Zahl lag schon im gewünschten Bereich. Im Kampf wirkte er trotzdem klein: Er ist schmal (Archetyp Kevin), und Namensschilder und
    Zahlen der Söldner lagen über seinem Kopf (Beleg 17-21-02).
- **Jetzt ×1,5 statt ×1,35:**
  - 51,3 Welteinheiten, 1,77× die Söldner (Browserprüfung). Damit ist er der größte im Dungeon.
  - Die anderen Bosse bleiben ×1,35. Die Bögen sind unverändert, der Gag bleibt (Mantel am Boden, Ärmel über den Händen).
- **Trefferfläche:** Sie wächst mit, denn `spriteTop` folgt der Schildhöhe. Ein Rechtsklick auf die Krone zieht ihn.
- **Heldenfreiraum:** `hero-reveal.js` rechnet mit ×1,5.
- **Wegsuche:** `dungeon-raeume-check` Teil 5 grün (45 Wege, 121 Requisiten). Im aktiven Lauf blieb Big B im Thronsaal, der Schutz stand bei ihm.
  Bewegung und Kollision rechnen mit Punkten und sind vom Maßstab unberührt.

**9 · Kosmetik:**
- Kostenzeile der Löffelkur: „kostenlos“ entfällt, wie in WoW steht nur da, was etwas kostet. Jetzt „2,5 s Zauberzeit · im Laufen · 5,4 s Abklingzeit ·
  53 m“, 276 px bei 316 px Platz, `white-space:nowrap`. Gilt für alle kostenlosen Kniffe.
- Wut-Tooltip siehe Abschnitt 2.

## 5 · Prüfungen

Ports: CDP 9741–9747, Server 4541–4547, `BOOT_TRIES=450`. Der Rechner war durch parallele Sitzungen stark belastet.

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 1336/1336 grün (neu `tests/dungeon-fix7.test.mjs`, 15 Tests) |
| `npm run content:check` | 57/57 grün |
| `npm run build` | grün (Quellen-Wächter sauber) |
| `npm run ui:check` | 14/14 grün |
| `node scripts/dungeon-sim.mjs` voll | alle Kriterien grün (Abschnitt 3) |
| `node scripts/dungeon-serie.mjs --runs=20` (neu, echtes Spiel) | alle Kriterien grün (Abschnitt 3) |
| `dungeon-check` | Desktop und Handy grün |
| `dungeon-e4a-check` · `dungeon-e4b-check` | 36 · 11 grün |
| `dungeon-fix5-check` · `dungeon-fix6-check` | 13 · 8 grün. Fix 6 passiv: verloren, zwei Todesfenster rechts neben dem Bossrahmen |
| `dungeon-aktiv-check` · `heiler-wow-check` | 4 · 35 grün |
| `dungeon-figuren-check` | 33 grün |
| `mobile-check` Dungeon | hoch und quer, 10 Schritte, 0 Befunde, keine Laufzeitfehler (eigener Server 4545) |
| `dungeon-raeume-check` Teile 1–5 | grün. Teil 6 (Bildzeit) nicht gelaufen: Der Maßstab ist nur ein Faktor, siehe Vorgabe |
| `dungeon-fix7-check` (neu) | 7 grün, siehe unten |

`scripts/dungeon-fix7-check.mjs`:
- Testzugang der Prüferin (Bärbel Heilung, typische Ausrüstung, drei Beweise, Rita liegt)
- echte Maus und Tasten, Aufruf mit `ONLY=1,…`

| Teil | Ergebnis |
|---|---|
| 1 Rede | Rechtsklick auf den Boden bei Big B und auf Big B, während „Angreifbar in …“ läuft: kein Autoangriff, kein Pull, der Held läuft; bei „bereit“ zieht nichts von selbst. Big B 51,3 WE gegen 28–29 (1,77×), Rechtsklick auf den Kopf zieht ihn |
| 2 Erster Tod | Todesfenster nach 89 ms, rechts neben dem Bossrahmen, „Schorle-Susi hilft dir auf“ mit laufendem Balken |
| 3 Tooltips | Notfallbrezel 340×196 px mit „Heilt 160“, mit Umschalttaste die Werte sichtbar (Farbe ≠ Fenstergrund). Löffelkur-Kopfzeile eine Zeile |
| 4 Passiv wie die Prüferin | nach der Rede Rechtsklick, 20 s Autoangriff, Esc, nur Ausweichen (W/A/S/D): **verloren**, Wut nach 215 s, 8 Wutwellen, **Wipe 14 s nach dem Ausbruch** |
| 5 Aktiv als Heilerin | **Sieg nach 186 s**. „EINSATZ 88 · 44 % · 1 · 19/19 · 7 · 73 % · +2“, jeder Tooltip mit Name und Wert, Sammel-Tooltip mit „Ausweichen 7“; Big B blieb im Thronsaal |

Bilder `visual-review/dungeon-fix7/*.jpg` (lokal, nicht im Repo):

| Bild | zeigt |
|---|---|
| `10-rede-rechtsklick.jpg` | Rede läuft, Held läuft nach dem Rechtsklick, kein Autoangriff |
| `11-bigb-groesse.jpg` | Big B ×1,5 neben den Söldnern |
| `20-erster-tod.jpg`, `21-tod-rettung.jpg` | Todesfenster beim ersten Tod, Rettung mit Balken |
| `30-brezel-tooltip.jpg`, `31-brezel-details.jpg` | Notfallbrezel nach WoW-Muster, Details mit sichtbaren Werten |
| `32-loeffelkur-tooltip.jpg` | Kopfzeile in einer Zeile |
| `40-wut.jpg`, `41-unter-wut-*.jpg`, `42-passiv-ende.jpg` | Wutwelle, Wipe der passiven Gruppe |
| `50-einsatz-zeile.jpg`, `51-einsatz-tooltip.jpg` | Einsatz-Zeile mit Megafon, Tooltip mit Name und Wert |

Angepasste bestehende Tests (Verhalten gewollt geändert):
- `tests/dungeon-fix6.test.mjs`: Der Punkte-Tooltip beginnt jetzt mit allen Feldern.
- `tests/dungeon-fix5.test.mjs`: `heroPulls` steht in `scripts/sim-fight.mjs`.

## 6 · Geänderte Dateien

| Bereich | Dateien |
|---|---|
| Laufzeit | `dungeon.js`: Wutwelle, `bossUnready`, `ghostState.soon`<br>`dungeon-einsatz.js`: Ausweichen unter Wut<br>`auto-combat.js`: kein Autoangriff vor „bereit“<br>`app.js`: Rechtsklick in der Rede läuft<br>`death-screen.js`: sofort, Wächter, Rettung<br>`describe.js`, `describe-ui.js`: Verbrauchsgüter-Tooltip<br>`combat-ui.js`: Kopfzeile ohne „kostenlos“<br>`dungeon-einsatz-ui.js`: Name und Wert, Sammel-Tooltip, Megafon<br>`dungeon-actors.js`, `hero-reveal.js`: Boss-Maßstab |
| Daten | `content/dungeon-einsatz.js`: `enrage.wave`, `enrage.evade`, Wut-Tooltip, Feldnamen<br>`content/dungeons.js`: `bigb.drawScale`<br>`content/panel-ui.js`: `ITEM_TIP`<br>`content/item-info.js`: Stapelgröße<br>`content/combat.js`: „hilft dir gleich auf“ |
| Stil | `dungeon-fix7.css` (neu), `popup-ui.css` (Farbe der Laufzeitwerte), `index.html` |
| Prüfungen | `scripts/sim-fight.mjs` (neu, ausgelagert)<br>`scripts/dungeon-serie.mjs` (neu)<br>`scripts/dungeon-sim.mjs`: Art „anfang“, Live-Fall #770, Kriterien<br>`scripts/dungeon-fix7-check.mjs` (neu)<br>`tests/dungeon-fix7.test.mjs` (neu)<br>`tests/dungeon-fix5.test.mjs`, `tests/dungeon-fix6.test.mjs` |
| Doku | `docs/DUNGEON-FIX7-2026-09-26.md`, `docs/PLAYTEST-2026-09-26-dungeon-bigb-5.md` (Prüferbericht, unverändert) |

## 7 · Restliste

1. **Gerd und Kurt „erst 20 s Autoangriff, dann passiv“** gewinnen 20/30 bzw. 10/30.
   - Der Wipe ist hart, aber diese Gruppen stehen beim Ausbruch schon bei wenigen Prozent und schaffen es in den ersten 14 s.
   - An Big B gilt das Kriterium (0/90).
   - Soll auch das an Gerd verlieren, wäre der Hebel eine frühere Wut (130 → 115 s). Aktiv bleiben dann noch rund 20 s Luft.
2. **Aktiver Tank-Held neben dem Söldner-Tank:** Einsatz 30 ohne Bonus.
   - Pils-Peter hält den Boss, gewertet wird aber der Anteil am Halten.
   - Die Wertung bei doppelter Rolle gehört in eine eigene Runde; `heroRole` doppelt, siehe Restliste Fix 6.
3. **Todesfenster:** Die Ursache beim ersten Tod der Prüferin ist nicht nachgestellt. Das Fenster ist jetzt robust (sofort, Wächter); ein
   Nachtest der Prüferin steht aus.
4. **Namensschilder der Söldner über dem Boss** im Getümmel verdecken seinen Kopf. Mit ×1,5 besser. WoW blendet Freundes-Schilder im Kampf aus;
   das wäre der nächste Schritt.
5. **Wut als harter Wipe, Wutwelle und Ausweichen unter Wut** sind Designentscheidungen zu E-71 (Nachtrag, Punkt 2). Sie gehören nach
   `docs/ENTSCHEIDUNGEN.md`; von mir nicht geändert.
6. **`mobile-check` nimmt ohne Adresse http://localhost:4181/** (fremder Server anderer Sitzungen). Immer die eigene Adresse übergeben
   (`node scripts/mobile-check.mjs http://localhost:<port>/ <ordner>`).
7. **Playtest:** Ein Prüfer-Durchgang auf dem neuen Stand steht aus, passiv wie die Prüferin und aktiv als Heilerin.

## 8 · Veröffentlichung

16 Commits auf `main` als Fast-Forward, danach `node scripts/server-refresh.mjs`.
- Vor dem Push auf den parallelen Auftrag „Uhrfehler“ (#777/#778) rebased, ohne Konflikt; `precache-manifest.js` neu gebaut.
- Danach erneut grün: `npm test` (1347/1347), `npm run build` und die betroffenen Simulationsteile `passiv,live,ohneheld,nohero,aktiv3`
  mit allen Kriterien, auch (c) 70 % und (d) 13 %.
- **Live: Build #793 · `3fef3c3a` · 2026-09-26** (vorher #778 · `2602f6aa`), https://mertloch.esm-consultant.de
- Dieser Nachtrag folgt als eigener Commit (reine Doku).
