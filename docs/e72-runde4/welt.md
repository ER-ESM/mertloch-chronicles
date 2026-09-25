# E-72 Runde 4 · Welt: Weltgegner, Rudel, Laufwege, Aufwachen (Kürzel „welt“)

Anlass: Kenner-Playtest 25.09. abends (`docs/e72-runde4/kenner/`). Helden auf Stufe 12 (per `level 12`, nur Startausrüstung,
1.095 Leben) starben an Pfandkeilern der Stufe 2 – Käthe einmal in rund 3 s, Kevin im Rudel „Im Thürig“. „Hinlaufen“ führte
mitten durchs Rudel, nach dem Aufwachen bei St. Gangolf stand wieder ein Keiler daneben.

## Ursachen (gemessen, echte Engine)

Messwege im Scratchpad: flache Welt mit Balance-Rotation, kein Ausweichen; echte Welt (`data/mertloch.json`) an der Grillwiese.
Stand „vorher“ = origin/main 77c30249.

1. **Kein Stufenunterschied.** Ein Keiler trifft jeden Helden gleich: Hauer 32–44 alle 2,1 s, Sprung 105 (Wirkzeit 1,5 s,
   dann alle 5,5 s). Gegnerschaden hängt weder an Heldenstufe noch am Maximalleben. Der Zielrahmen zeigt die Stufe 2 für
   Stufe 12 aber grau als „kaum der Rede wert“ (`unit-colors.js`). Das war ein Versprechen ohne Regel.
2. **Startausrüstung auf Stufe 12 schützt weniger.** Dicke Haut aus der Startkleidung: Stufe 2 11,8 %, Stufe 12 3,0 %
   (Kurs wächst mit der Stufe, E-56). Mit Ausrüstung der eigenen Stufe (selten) wären es 12,2 % und 1.605 Leben.
3. **Rudel im Gleichschlag.** Jeder Gegner beginnt 3 s nach dem Bemerken mit seinem Spezialangriff. Fünf Keiler sprangen
   im selben Moment: 5 × 105 in einer halben Sekunde.
4. **Kettenzug ohne Obergrenze.** „Kumpel kommt“ reicht 11 m weit und läuft über Ketten weiter. Aus dem Tiergebiet
   Grillwiese (6 Keiler, Radius 12,5 m) kamen alle sechs, in der echten Welt mit den Feldkeilern drumherum **bis zu 9 zugleich**.
5. **Umland-Skalierung falsch beschriftet und in der Startreihe.** Feldgegner jenseits von 112 m um die Kirche wachsen mit
   (Spielerstufe − 2): Auf Stufe 12 hat ein Keiler 902 Leben und ×1,64 Schaden. Das entspricht Stufe 10, der Zielrahmen
   zeigte aber „Stufe 2“ (Dieters Screenshot 149/902). Die Grenze schneidet durch den Pfandhof: Neben dem Tiergebiet der
   Stufe 2 standen Gruppen von Stufe-10-Keilern.
6. **Laufweg nach dem Tod.** Ein vom Angriff angehaltener Laufweg lief nach dem Aufwachen bis zu 90 s später weiter
   („Weiter auf dem Laufweg.“, kevin-02). Der Held rannte vom Friedhof zurück ins Rudel. Der Wiederbelebungspunkt selbst ist
   frei: Der nächste Keiler erreicht ihn frühestens auf 30 m (Heim 54 m, Streifen 12,5 m, Aggro 12 m).
7. **Laufwege nach reiner Länge.** Es gab entweder die gerade Linie oder das Wegenetz nach Länge, ohne Rücksicht auf Reviere.

**Nicht durch E-72 oder den Dungeon verursacht.** Derselbe Messlauf auf dem Stand vor E-72 (5756aaa1, 24.09.) liefert
dieselben Tode und Schadenswerte. Einzige Abweichung: Dieters Treffer sind seit der Zeche (30 % angeschrieben) kleiner
(⌀ 31 → 22). Punkte 1, 3 und 4 bestehen seit 0.20 (Kettenzug, 17.09.), Punkt 5 seit Runde A, Punkt 4 wurde mit den
Tiergebieten (E-55, 23.09.) akut.

## Änderungen

- **`foe-rules.js` (neu), `BALANCE.foes` (`content/balance.js`):** Regeln für Weltgegner (Feld, Tiergebiete, Lager, Arena).
  Dungeon (E-71) und Weltbosse sind ausgenommen.
  - Stufenabstand wie am Zielrahmen: Bis ±2 Stufen ändert sich nichts. Ab 3 Stufen darunter gibt es je Stufe −10 % Schaden
    (mindestens 25 %) und −15 % Aggro-Reichweite. Graue Gegner (5 und mehr Stufen darunter) greifen nicht von sich aus an
    und ziehen keinen Kumpel. Nach oben bleibt alles unverändert (Boss-Korridore).
  - Kettenzug holt höchstens **3** Gegner zugleich (entspricht „Gruppen 2–3“ aus GAMEPLAY-KONZEPT-FLUSS §7). Nach einem
    Kill kommt der nächste Kumpel erst nach der normalen Wartezeit.
  - Spezialangriffe eines Rudels starten mindestens **1,2 s** nacheinander.
  - „Kurzer Schutz“ nach dem Aufwachen: 10 s lang bemerkt dich kein Gegner, bis du selbst angreifst. Dazu gibt es ein Symbol
    mit Tooltip in der Buffleiste (`auras.js`, `AURA_TEXT.wakeGuard`).
  - Startreihe (`inStartArea`): Feldgegner bis 56 m um ein Tiergebiet der Startreihe oder einen Treffpunkt wachsen nicht
    mit. Das betrifft 12 von 4.100 Umland-Angreifern.
- **`encounters.js`:** `scaledStats` gibt die echte Stufe mit (`level` = Spielerstufe − 2). Zielrahmen, Stufenabstand und
  **Beutestufe** sehen damit die Wahrheit.
- **`safe-route.js` (neu):** Laufwege mit Wegkosten.
  - Führt der kürzeste Weg durch ein Revier (Heim + 0,8 × Streifradius + Aggro-Reichweite + 2 m), sucht das Wegenetz eine
    Strecke, bei der jeder Meter im Revier 4-fach zählt. Der Umweg darf höchstens 1,6 × die Länge + 50 m haben; ist er
    länger, wird mit halber und viertel Strafe erneut gesucht.
  - Feldzellen am Weg werden beim Planen angelegt, damit ein Umweg nicht in ein unbekanntes Revier führt.
  - Das gilt für `navigate` und `repath` sowie für die Wegvorschau der Weltkarte (`cartography.js`).
- **`engine.js`:** Hier stehen nur die Aufrufe: `gapDamage` in `hitPlayer`, `noticeFactor`/`chainAllowed` beim Bemerken,
  `specialSlot` vor `startCast`, `startWakeGuard`/`tickWakeGuard`, `safeRoute`. Außerdem verwirft `die()` einen angehaltenen
  Laufweg.

## Messwerte vorher → nachher

Flache Welt, Startausrüstung, alle Gegner zugleich im Kampf. Zelle: verlorenes Leben bzw. † Tod nach s / schlimmste 3 s.

| Kampf | Dieter | Anni | Kevin | Schorsch | Käthe |
|---|---|---|---|---|---|
| St. 12 gegen 5 Keiler St. 2 · vorher | 79 % / 435 | † 11,6 s / 593 | 99 % / 593 | † 10 s / 640 | 30 % / 332 |
| · nachher | 28 % / 66 | 20 % / 120 | 17 % / 90 | 2 % / 125 | 7 % / 52 |
| St. 2 gegen 1 Keiler (fordernd, fair) · vorher = nachher | 22 % | 35 % | 35–38 % | 15 % | 24 % |
| St. 2 gegen 3 Keiler · vorher | † 11,6 / 243 | † 11,6 / 381 | † 7,8 / 381 | † 11,6 / 351 | † 10,7 / 381 |
| · nachher | † 13,6 / 243 | † 12,9 / 381 | † 7,8 / 381 | † 13,6 / 351 | † 11,1 / 288 |
| St. 2 gegen 5 Keiler · vorher | † 5,7 / 405 | † 5,7 / 635 | † 4,5 / 475 | † 4,5 / 553 | † 5,5 / 342 |
| · nachher | † 7,8 / 331 | † 7,0 / 477 | † 5,8 / 399 | † 7,0 / 413 | † 6,7 / 342 |

Echte Welt, Held zieht einen Keiler am Rand der Grillwiese (höchstens gleichzeitig kämpfende Keiler · schlimmste 3 s):

- **Stufe 12 vorher:** 8–9 Keiler, 522–1.209 Schaden in 3 s (mehr als 1.095 Leben), 4 von 5 Klassen tot nach 6–8,5 s.
- **Stufe 12 nachher:** 0–5 Keiler, 0–86 Schaden in 3 s, alle leben (≥ 80 %). Beim Hineinlaufen greift keiner an.
- **Stufe 2/4 vorher:** 8–9 Keiler, tot nach 4,5–7,2 s.
- **Stufe 2/4 nachher:** 3–5 Keiler (mehr als 3 nur durch eigene Flächenkniffe), 243–415 in 3 s, tot nach 6,4–17,5 s,
  Anni auf Stufe 4 überlebt knapp. Das bleibt ein gefährliches Rudel.

Mit Ausrüstung der eigenen Stufe (selten) überleben alle fünf Klassen auf Stufe 12 drei Umland-Keiler der Stufe 10 mit
57–97 % Leben. Mit Stufe-2/3/4-Ausrüstung gegen drei Keiler der Stufe 2: Auf Stufe 2 sterben Anni und Kevin, ab Stufe 3
überleben alle.

Laufwege auf Stufe 2 (kürzester Weg → neu, Meter im Revier):

| Strecke | vorher | nachher |
|---|---|---|
| St. Gangolf → Wegestube | 285 m / 188 m | 346 m / 39 m |
| Bude → Wegestube | 400 m / 179 m | 448 m / 36 m |
| Bude → Kiosk | 194 m / 43 m | 194 m / 0 m |
| Pfandhof → Grillplatz | 180 m / 444 m | 214 m / 397 m |

Rund um den Pfandhof gibt es kaum Umwege, weil dort alles Revier ist. Planung dauert 5–50 ms.

## Prüfung

- `npm test`: **1.100/1.100 grün**. Neu ist `tests/e72-welt.test.mjs` mit 9 Tests:
  - Stufenabstand
  - Stufe-12-Held gegen 5 Keiler, alle fünf Klassen
  - grau ohne Aggro und ohne Kumpel
  - Stufe 2 gegen 1 Keiler 10–50 % in 4–12 s
  - kein Tod in 3 s, Sprünge ≥ 1,2 s versetzt
  - Kettenzug ≤ 3
  - Tod verwirft Laufweg, „Kurzer Schutz“
  - Wiederbelebungspunkt ohne Angreifer-Reichweite in 25 m
  - Umweg um ein Rudel
- Angepasst: `tests/auras.test.mjs` (nach dem Aufwachen nur „Kurzer Schutz“) und `tests/engine-rules.test.mjs` (Stufe
  wächst mit, Startreihe fest). `content:check` ist grün.
- Headless: `SERVER_PORT=4384 CDP_PORT=9784 node scripts/e72-welt-check.mjs` → Screenshots in `docs/e72-runde4/welt/`:
  - `a1`: Käthe 12 mitten in der Grillwiese zwischen neun Keilern (2–6 davon je Lauf in 12 m), keiner greift an
  - `a2`: Kampf, −9 je Treffer, 1.066/1.095
  - `b1`: Umland-Keiler mit Plakette 10
  - `c1`/`c2`: Tod und Aufwachen, steht still, Symbol „Kurzer Schutz“ mit Tooltip
  - `d1`/`d2`: kürzester Weg → angegriffen, Umweg → 37 m am Rudel vorbei, kein Angriff

## Offen / Risiken

- **Beutestufe im Umland steigt:** Umland-Gegner lassen jetzt Beute ihrer echten Stufe fallen. Bisher war das die Stufe
  des Archetyps, 1–4, bei jedem Helden. Das halte ich für richtig, es verschiebt aber die Ausrüstungskurve. Balance-Rolle
  bitte ansehen.
- Stufe 2 gegen 3 Keiler bleibt ohne Ausweichen tödlich (7,8–13,6 s). Das ist ein Rudel, aber die Grillwiese
  (6 Keiler dicht) ist für eine Stufe-2-Aufgabe hart. Mögliche Inhaltsänderung: weitere Abstände oder 4 statt 6 Keiler.
- Hineinlaufen zählt nicht zum Kettenzug: Wer mitten in ein Rudel läuft, bemerkt alle in Aggro-Reichweite.
- Balance-Bericht und -Sheet erzeugen Gegner ohne `ambient`, dort greift der Stufenabstand nicht. Die Korridore sind
  unverändert, Zeilen „Spieler 3+ Stufen über dem Gegner“ überschätzen jetzt den Schaden.
- Kenner-Tests mit `level 12` ohne Ausrüstung sind schwächer als echte Stufe-12-Helden (Rüstung 3 % statt 12 %, 1.095 statt
  1.605 Leben). Ein Admin-Befehl „passende Ausrüstung“ wäre für Playtests sinnvoll (nicht umgesetzt).
- Beobachtung am Rand (fremd, e72-eingabe/balance): Käthe meldet „Zu weit für Kreuz-Ass · 18 m (höchstens 25 m)“ (a2-Lauf).
