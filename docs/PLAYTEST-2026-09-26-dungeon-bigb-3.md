# Playtest Prüfer · Big B nach Dungeon-Fix 4 · 2026-09-26

Persona: `pruefer-agent` (nur Browser), Live-Build #728 · `c2f66547` · v0.20.0, Desktop 2024×900. Testheld „Bigb Drei“ (Dieter
Tresenbrecher, Stufe 10, typische Ausrüstung, vier Söldner), über den Testzugang `playtest-save.mjs --preset=bigb` im Weinkeller.
Die Screenshots liegen außerhalb des Repos (`d:\Dev\.playwright-mcp\page-2026-09-26T<Uhrzeit>Z.jpeg`), unten mit der Uhrzeit abgekürzt.

**Kurzurteil: NACHBESSERN.** Nichts blockiert, aber Nr. 1, 2, 3, 5 und 7 halten nur teilweise, Nr. 6 ist ungeprüft.

- Ausgangsstand: Stufe 10, Leben 1.005/1.365, Siegel 3/3, Beweise 3/3.
- Endstand: Stufe 11, Big B besiegt, Endtruhe noch nicht geöffnet, Held am Hinterausgang.

## Urteile

| Nr | Versprechen | Urteil | Beleg |
|---|---|---|---|
| 1a | Beim Betreten des Thronsaals beginnt kein Kampf | GEHALTEN | Kein Bossrahmen, die Truppe steht auf „Folgen“ (10-17-26-184, 10-17-46-749) |
| 1b | Am Thron „F Beweise vorlegen (3)“; mit F Bossrahmen, Ausreden, Begrüßung, Pull-Timer | GEHALTEN (Anmerkung) | Bossrahmen mit 3 Beweis-Symbolen, Zitat, Banner, „KAMPFBEGINN Big B 8,6 s“ (10-17-53-486). Der Hinweis erscheint schon am Saaleingang, ca. 390 px vom Thron entfernt. Ein erstes F im Gehen tat nichts, weil der Hinweis gerade verschwunden war |
| 1c | Kampf beginnt erst beim eigenen Angriff oder aus der Nähe | TEILWEISE | Nach Ablauf des Timers begann der Kampf von selbst, ohne Angriff und ohne Annäherung (10-18-05-694) |
| 1d | Erster Boss-Zauber erst einige Sekunden nach Kampfbeginn | GEHALTEN | Etwa 4 s nach Kampfbeginn standen alle Zauber noch aus (10-18-05-694) |
| 2a | Warnleiste sagt klar, was zu tun ist | GEHALTEN | „Nachsatz abwarten [A·D] … 3,1 s“, danach „✋ STEHEN BLEIBEN [rechts] … sagt man. Links.“ mit roter Saalhälfte; dazu „UNTERBRECHEN [Q]“, „ADDS ZUERST [Tab]“, „FLÄCHE VERLASSEN [LEER]“ (10-18-39-110, 10-19-09-379, 10-20-46-504) |
| 2b | Nach dem Nachsatz etwa 2 s Zeit bis zur Kanonenkugel | TEILWEISE (Messung unsicher) | Direkt nach dem Wechsel von „Nachsatz abwarten“ zeigte die Leiste nur noch 0,2 s. Geschätztes Fenster 0,7–1,2 s, Werkzeugverzögerung ±0,5 s. Bei „Ich reite nach RECHTS!“ / „… und links.“ starb der Held an der Kugel (988) (10-20-11-165) |
| 2c | Die Zeile blinkt vor dem Knall | NICHT PRÜFBAR | Auf Standbildern nicht belegbar |
| 3a | Absichtlich sterben | GEHALTEN | Zwei Tode (10-20-11-165, 10-20-59-321) |
| 3b | Todesbildschirm zeigt die letzten Treffer mit Summe | TEILWEISE | Die Summe passt nicht zu den Zeilen. Tod 1: Σ 1.972, die Zeilen ergeben 1.268. Tod 2: Σ 844, gezeigt werden nur 5× „Trümmer 70“ = 350, als Ursache steht „Trümmer · 70“ |
| 3c | „Kampf aufgeben“ nachrangig, zweiter Klick, ohne Hover kein Tooltip | TEILWEISE | Nachrangig und ohne Tooltip: ja. Den zweiten Klick konnte er nicht prüfen, weil sich das Fenster vorher schloss (Wiederbelebung, Boss-Tod) |
| 4 | Siegelring auf einem Söldner nur als Info | GEHALTEN | „auf Pils-Peter ↻ Siegelring“ gedämpft, ohne Taste (10-18-05-694, 10-19-56-431) |
| 5a | Erfolge gebündelt nach dem Stufenaufstieg | TEILWEISE | Ein Banner „3 ERFOLGE · Beweislast · Titel: Mieterschützer · Termin eingehalten“ (10-21-09-928). Im Log stehen die Erfolge vor „Big B besiegt · +1500 EP“; den Aufstieg selbst nicht gesehen |
| 5b | Beutefenster links neben der Verfolgung | GEHALTEN | x 1395–1680, die Bildmitte bleibt frei (10-21-09-928) |
| 5c | F bedient das nächste Objekt | TEILWEISE | Hinweis „F ENDTRUHE ÖFFNEN“ bzw. „F ZURÜCK AUF DIE BURGSTRASSE“ passend, Tastendruck an der Truhe nicht geprüft |
| 6a | Rückfrage „Noch nichts gewählt“ am Ausgang | NICHT PRÜFBAR (Budget) | Nachtrag des Orchestrators: F am Ausgang öffnet die Endtruhe mit „Noch nichts gewählt“, also **GEHALTEN** (`orch-6a-rueckfrage.jpg`) |
| 6b | Meldung draußen, was eingesammelt wurde | NICHT PRÜFBAR (Budget) | – |
| 7 | Keine Textwände, nichts scrollt, Mitte frei, WoW-Gefühl | TEILWEISE | Textwand: „ERINNERUNG · Wurst Case“ mit 7 Zeilen Prosa ungefragt am Ausgang (10-21-48-048). Scrollen: „Deine Truppe“ bekommt einen Scrollbalken, Hopfen-Horst ist abgeschnitten (10-18-30-972; laut Orchestrator auch ohne Buffs). Mitte: Todesfenster (ca. 360×320) genau in der Bildmitte |

## Befunde nach Schwere

**Blockierend:** keine.

**Störend:**
1. Reaktionsfenster nach dem Nachsatz etwa 1 s statt 2 s (Thronsaal, Beleg 10-19-09-379). Die Variante „… und links.“ zeigt keinen erkennbaren sicheren Platz.
2. Die Todesliste deckt die Summe nicht ab, die Ursache wirkt irreführend (10-20-11-165, 10-20-59-321).
3. Das Truppenfenster scrollt, Söldner 4 ist abgeschnitten (10-18-30-972).
4. „Erinnerung“-Fenster mit Prosa-Block ungefragt am Hinterausgang (10-21-48-048).
5. Kampf startet durch den Timer statt durch den Spieler (10-18-05-694).

**Kosmetik:**
- Der F-Hinweis überdeckt den Rahmen „Deckelstriche“ (10-17-46-749).
- Der F-Hinweis erscheint schon am Saaleingang und verschwindet beim Weglaufen (10-17-26-184, 10-17-39-223).
- Das Todesfenster ist groß und sitzt in der Bildmitte; in WoW ist es klein und oben (10-20-11-165).

## Nebenbefunde (nicht benotet)
- **Söldner tragen den Kampf:** Der Held hat nie angegriffen und lag zweimal am Boden. Big B starb trotzdem nach etwa 3 min, mit rund 3:00 Rest bis zur Wut. Dieser Punkt geht an den Auftrag „Held aktiv“.
- Ein Klick auf „Big B“ in der Verfolgung öffnet das Dungeon-Journal mitten im Bild.
- Direkt nach „Ins Dorf“ stand der Tooltip „Autoangriff · Flasche kreist“ neben der Bildmitte, vermutlich wegen der Mausposition vom Startbildschirm (10-16-45-195).
- Das Beutefenster schloss sich beim Weglaufen von selbst; die Endtruhe blieb unbeachtet (10-21-38-982).
- Bei „Fläche verlassen“ bleiben die Söldner teils stehen; Schorle-Susi ging zu Boden.

## Vergleich mit WoW
1. Gut: Einleitung mit Zitaten, Bossrahmen, Beweis-Symbolen und Pull-Timer wirkt wie WoW mit DBM/BigWigs.
2. Gut: Die Warnleiste nennt Handlung und Taste und markiert die Bahn, klarer als WoW ohne Addons.
3. Gut: Den Todesrückblick hat WoW ohne Addon nicht; nur fehlen die großen Treffer in der Liste.
4. Schlecht: Der Kampf beginnt ohne den Spieler, und die Söldner gewinnen ihn ohne ihn.
5. Schlecht: Das knappe Fenster nach dem Nachsatz und „… und links.“ ohne sicheren Platz lassen den Tod eher wie Pech wirken.
