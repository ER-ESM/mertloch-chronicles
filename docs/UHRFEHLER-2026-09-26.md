# Uhrfehler der Bodenwirkungen · Mobile-Beute · Chat-Rechtsklick · 2026-09-26

Auftrag: Restliste aus [Heiler-WoW](HEILER-WOW-2026-09-26.md) – der Uhr-Fehler des Nests steckt noch im Zapfmeister (Weizen-/Bockfass)
und in der Putzpyramide (Sporenwolke); Balance danach; `mobile-check` Schritt „Beute“ rot; Rechtsklick auf einen unsichtbaren Chat-Reiter.

## Kurzfassung

- **Wichtigster Befund zuerst:** „Das Weizenfass heilt nie“ stimmt nur für Node-Läufe und für ganz gleichmäßige Bildtakte. Im echten
  Browser schwankt der Bildtakt, und dort wirkten Fass und Sporen schon vorher – unregelmäßig und im Mittel sogar etwas **häufiger** als
  vorgesehen (Chrome, 10 s: Weizenfass 12 statt 10 Heilungen, Bockfass 11 statt 10 Treffer je Gegner). Genau so passt der Prüferbefund
  #741 „das Nest heilte nur die Heldin“: Es heilte live, nur nicht die Söldner. Blind waren Balance-Sheet, Dungeon-Simulation und Tests.
- **Ursache:** Zwei Schleifen teilten sich eine Uhr (`z.tick`). Eine gemeinsame Ursache für Nest, Fass und Sporen.
- **Behoben** mit einer eigenen Uhr je Wirkung (`fieldPulse` in `class-mechanics.js`); jetzt wirken Weizen-, Bock- und Sporenwolke überall
  genau einmal je Takt (1 s bzw. 0,5 s) – in Node, bei 60/144 Hz und bei schwankendem Takt.
- **Alle Bodenwirkungen und Zeitgeber der fünf Klassen** geprüft: Nur Fass und Sporen hatten das Muster noch (Nest war schon repariert).
  Neuer Test `tests/uhrfehler.test.mjs` (11 Tests) prüft jede Wirkung bei vier Bildtakten.
- **Balance:** Zahlen der reparierten Kniffe bleiben. Kein Spec zieht davon (Putzpyramide +2,8 % gegen den Median, Flambierer +2,2 %),
  Dungeon-Simulation 73/73 grün, Bosszeiten ±0–8 %.
- **Mobile „Beute“:** Fehler in der Prüfung, nicht im Spiel. Die Fixture schrieb in den falschen Spielstand. Jetzt grün (hoch und quer).
  Ebenso der zweite rote Schritt „Unterbrechung“ (hochkant, auch auf main): Er tippte, während die Einblendung „Neu freigeschaltet“ die
  Kurzmeldungen gewollt anhält.
- **Chat:** Rechtsklick auf einen unsichtbaren Reiter läuft in die Welt wie in der Lücke daneben. Linksklick öffnet weiter den Reiter.

## Ursache

`tickClass` (`class-mechanics.js`) ruft zuerst `tickMech` (`spec-mechanics.js`) und zählt danach in der allgemeinen Feldschleife für
**jedes** Feld `z.tick` herunter; läuft er ab, setzt sie ihn auf 1 zurück. `tickMech` zählte für Fass und Sporenwolke **denselben**
`z.tick` herunter. Die Uhr lief also doppelt so schnell, und abgelaufen war sie immer in einer der beiden Schleifen:

- Bei festem Takt (Node: 0,05 s; Browser mit exakt gleichmäßigen Bildern) läuft sie immer nach einer geraden Zahl von Schritten ab, also
  in der allgemeinen Schleife. Die setzt sie zurück, der Sonderzweig sieht sie nie ablaufen: **Weizen heilt nie, Bock trifft nie, Sporen
  markieren nie** (500 → 500 Leben in 5 s).
- Bei schwankendem Takt entscheidet der Zufall, welche Schleife den Nullpunkt trifft. Jeder zweite Puls der doppelt schnellen Uhr
  landet im Mittel beim Sonderzweig: Die Wirkung kommt etwa einmal je Sekunde, aber unregelmäßig.

Das Nest hatte Heiler-WoW mit einer eigenen Uhr (`nestTick`) behoben – dasselbe Muster, nur an einer Stelle.

**Fix:** `fieldPulse(z,key,dt,period,first)` – jede Sonderwirkung zählt unter eigenem Schlüssel in `z.clocks`; `z.tick` gehört allein der
allgemeinen Feldschleife (Kommentar an beiden Stellen). Umgestellt: Fass (`'fass'`, 1 s), Sporenwolke (`'spores'`, 0,5 s), Nest (`'nest'`,
ersetzt `nestTick`), Rauch/Räucherofen/Deckel zu! (`'rauch'`, sofort, dann 1 s; vorher eigene Uhr `z.pulse`, jetzt einheitlich). Die
Heilung aus dem Weizenfass heißt in der Kampfstatistik jetzt wie der Bodenkniff („Anstich“), der Fassanstich wie der Spezialkniff (vorher
beide „Sonstige Heilung“).

## Betroffene Kniffe

| Klasse · Spec | Kniff (Platz) | Wirkung | vorher Node / gleichmäßig | vorher Browser (Chrome, 10 s) | nachher |
|---|---|---|---|---|---|
| Dieter · Zapfmeister | Anstich → **Weizenfass** (7) | heilt dich 12/s im Kreis | nie | 12 Heilungen, unregelmäßig | 10 (1/s) |
| Dieter · Zapfmeister (Pfad Bock) | Anstich → **Bockfass** (7) | 14 Schaden/s an jedem Gegner im Kreis | nie | 11 Treffer je Gegner | 9–10 je Gegner |
| Anni · Putzpyramide | **Sporenwolke** (7) | markiert alle Gegner im Kreis alle 0,5 s | nie | erste Markierung nach 0,63 s | nach 0,50–0,63 s |
| Anni · Landhaus-Lazarett | Nest (8) | schon in Heiler-WoW repariert | – | – | unverändert, jetzt über `fieldPulse` |

Pilsfass (Tempo im Kreis) prüft jedes Bild, nicht über die Uhr – es wirkte immer.

**Weitere Bodenwirkungen und Zeitgeber aller fünf Klassen geprüft** (Muster: dieselbe Uhr in zwei Schleifen). Kein weiterer Fall:

| Wirkung | Uhr | Befund |
|---|---|---|
| Robbi (Schrottkoloss) | `z.fire`, nur spec-mechanics | wirkt (5 Schüsse in 5 s) |
| Brandfläche (Lunte, `burn`), Katerfass, Thermomix-Tafel, Absperrband, Grillbuffet, Legekreis | `z.tick`, nur allgemeine Feldschleife | wirken |
| Pfandseil (`snare`) | eigene Scharfschaltung, überspringt die Uhr | wirkt |
| Räucherofen, Rauch, Deckel zu! | `z.pulse` → `fieldPulse 'rauch'` | wirkte, jetzt einheitlich |
| Heilung über Zeit (`classState.hot`), Heiler-Kit (`hots`), Söldner-Hilfe (`aidHot/aidBuff/aidSave`), Glutbrand (`e.burn`), Handlesen (`res.tick`), Markierung (`e.dotTimer`), Gruppen-Stärkung (`partyBuff`), Dungeon-Gefahren (`h.tick`) | je ein Besitzer | wirken |

## Tests

Neu `tests/uhrfehler.test.mjs` (11 Tests, < 1 s). Bildtakte: 20 Bilder/s (Simulation), 60 Hz gleichmäßig, 144 Hz, 60 Hz ±5 %:

- Weizenfass heilt 4–6-mal in 5 s (vorher: 500 → 500 Leben), die Kampfstatistik nennt den Bodenkniff.
- Bockfass trifft jeden der drei Gegner 4–6-mal in 5 s (Pfad Bock).
- Pilsfass gibt im Kreis Tempo, außerhalb nicht.
- Sporenwolke markiert alle drei Gegner binnen 0,6 s, die Markierung schadet.
- Nest heilt Heldin und Söldner (Stand Heiler-WoW bleibt).
- Robbi schießt, Räucherofen raucht sofort und dann jede Sekunde.
- Grillbuffet, Legekreis, Katerfass, Thermomix-Tafel heilen; Pfandseil schnappt zu; Brandfläche brennt einmal je Sekunde.
- Weizenfass und Katerfass übereinander: beide heilen je 4–6-mal (eigene Uhr neben der allgemeinen Feldschleife).
- Alle Zeitgeber der Klassen (siehe Tabelle) pulsen einmal je Sekunde, bei allen vier Takten.
- `fieldPulse` selbst; Quelltext-Wächter: `spec-mechanics.js`, `class-resources.js`, `healer-kit.js` zählen `z.tick` nicht herunter,
  in `class-mechanics.js` genau eine Stelle.

Gegenprobe: Mit dem alten Stand (Basis 87a9466b) schlagen genau die Tests für Weizen, Bock, Sporen, „zwei Felder übereinander“ und der
Quelltext-Wächter fehl – alle übrigen sind grün.

## Balance vorher/nachher

**Balance-Sheet** (`npm run balance:sheet`, 960 Messzeilen). Geändert haben sich nur die beiden Specs mit reparierten Kniffen; alle
anderen Zellen ±0 (nur die Abweichung vom Median verschiebt sich). ⚑ gesamt 255 → 259.

| Spec (Rollengruppe im Sheet) | Kennzahl, Mittel Stufe 5–30 | Abweichung vom Median der Rolle | ⚑ über / unter dem Median |
|---|---|---|---|
| Zapfmeister `dieter-brew` (Heilung*) | 85,8 → 87,4 Heilung/s (+1,8 %) | −3,1 → −0,8 % | 17 → 18 / 26 → 27 |
| Putzpyramide `baerbel-feedback` (Schaden) | 354,1 → 364,7 Schaden/s (+3,0 %) | +0,1 → +2,8 % | 13 → 18 / 8 → 4 |

*Das Sheet ordnet den Zapfmeister („Schutz & Heilung“) nach seiner Rollenbezeichnung der Heilung zu.

Ausrüstung selten, je Pfad (Kennzahl, Abweichung vom Median, ⚑):

| Spec · Pfad | Stufe 10 | Stufe 20 | Stufe 30 |
|---|---|---|---|
| Zapfmeister · 0 Pils | 54 (−20,5 %) ⚑ → 54 (−20,5 %) ⚑ | 105 (−1,7 %) → 105 (−1,7 %) | 131 (−4,2 %) → 134 (−1,9 %) |
| Zapfmeister · 1 Weizen | 104 (+53,4 %) ⚑ → 115 (+70,2 %) ⚑ | 133 (+24,2 %) ⚑ → 133 (+24,2 %) ⚑ | 178 (+30,2 %) ⚑ → 191 (+39,7 %) ⚑ |
| Zapfmeister · 2 Bock | 54 (−20,4 %) ⚑ → 52 (−22,9 %) ⚑ | 88 (−17,6 %) ⚑ → 84 (−21,5 %) ⚑ | 126 (−7,3 %) → 120 (−11,8 %) |
| Putzpyramide · 0 | 295 (−3,9 %) → 302 (−2,9 %) | 420 (−19,8 %) ⚑ → 450 (−14 %) | 585 (−14,6 %) → 596 (−13 %) |
| Putzpyramide · 1 | 305 (−0,9 %) → 314 (+1 %) | 423 (−19,3 %) ⚑ → 438 (−16,3 %) ⚑ | 581 (−15,2 %) ⚑ → 585 (−14,6 %) |
| Putzpyramide · 2 | 348 (+13,2 %) → 362 (+16,3 %) ⚑ | 528 (+0,9 %) → 532 (+1,6 %) | 632 (−7,7 %) → 655 (−4,4 %) |

Rollenvergleich Schaden (Mittel der Abweichung vom Median, nachher): Putzpyramide +2,8 · Flambierer +2,2 · Grand-Spielerin +1,6 ·
Lunte +1,0 · Falschspielerin −0,1 · Pfandjäger −0,7 · Bühne −3,3 · Kneipenschläger −9,1.

**Dungeon-Simulation** (`node scripts/dungeon-sim.mjs`, voll, 25 min): **73/73 grün** wie vorher, darunter „Held passiv verliert“
(unverändert, der passive Held wirkt keine Kniffe), H1–H3 der Heiler und die Fix-6-Kriterien. Bosszeiten: Gerd 90–92 → 89–93 s, Big B
174–199 → 174–197 s, Exposé 92–110 → 92–107 s, Korken-Kurt 97–103 → 94–103 s. Putzpyramide als Held: Big B „folgt dem Nachsatz“
198 → 192 s, „folgt der Behauptung“ 270 → 249 s, alle übrigen Fälle ±0–4 %.

**Entscheidung: Zahlen der reparierten Kniffe bleiben.** Begründung:
1. Kein Spec wird deutlich stärker als die anderen seiner Rolle. Die Putzpyramide rückt im Mittel von +0,1 auf +2,8 % – 0,6 Punkte vor dem
   Flambierer; neue ⚑ nach oben nur in fünf Zellen (Stufe 5 Pfad 0, Pfad 2 auf 10/15/20), dafür vier ⚑ nach unten weg.
2. Der Weizen-Pfad des Zapfmeisters war schon vorher Ausreißer; der Zuwachs (+10 Heilung/s auf Stufe 10) ist reine Überheilung – die
   tatsächlich geheilte Menge („eff.“) bleibt 10–11 Heilung/s. Im Mittel bleibt der Zapfmeister unter dem Median seiner Rollengruppe.
3. Live wirkten Fass und Sporen schon vorher, sogar etwas häufiger (Browsermessung oben). Kleinere Zahlen würden Spielern etwas
   wegnehmen, das sie hatten; der Fix macht Live und Simulation gleich und die Wirkung gleichmäßig.
4. Dungeon-Simulation ganz grün, Bosszeiten im Rahmen.

## Mobile „Beute“

`mobile-check` Schritt „Beute“ (hochkant und quer) war rot: „Aktion-Knopf zeigt ‚Reden‘ statt ‚Beute‘“, im Bild das Hofprobe-Gespräch mit
Kisten-Ida – auch auf main ohne andere Änderungen.

**Ursache: die Prüfung.** Die Fixture (Hofprobe fertig, Beutel neben dem Helden) schrieb in den **ersten** Schlüssel, der auf
`mertloch-chronicles-v2-*` passt. Seit den Helden-Slots (E-38) hat jeder Held einen eigenen Schlüssel (`characterKey`), und in einem
frischen Browser legt das Spiel vor der Heldenwahl zusätzlich einen Stand ohne Held an (`…-72-1`, sortiert vor `…-72-1-<Held>`). Die
Fixture landete in diesem Stand; geladen wurde der des Helden – ohne Beutel, Hofprobe offen, der Knopf bot „Reden“ (Ida).
Nachgestellt im Browser: vor der Fixture liegen `…-72-1` und `…-72-1-hmuiovsfhgq`, die Fixture ändert den ersten, der geladene Held hat
weiter `tutorial.completed=false` und keinen Beutel.

**Fix** (`scripts/mobile-check.mjs`): Die Fixture nimmt den Schlüssel des aktiven Helden mit der Spiellogik selbst
(`characters.js`: `loadRoster` → `activeCharacter` → `characterKey`); gibt es ihn noch nicht, nimmt sie `game.save()`. Ergebnis: „Beute“
hoch und quer grün, Beutefenster geht auf, Wiederkehr grün.

Das Spiel verhält sich richtig (mit dem richtigen Stand: Knopf „Beute“, Beutefenster). Der erste Besuch verliert auch nichts
(nachgeprüft: 777 Münzen im ersten Besuch sind im zweiten da). Nebenbefund siehe Restliste.

**Zweiter roter Schritt, ebenfalls die Prüfung:** Im Teillauf „hoch“ war „Unterbrechung“ rot („Ein Tipp nach Unterbrechung ohne
Wirkung (M-15)“) – auch auf main (Basis 87a9466b, gleicher Lauf gegen einen Server mit dem alten Stand). Zu dem Zeitpunkt steht noch die
große Einblendung „Neu freigeschaltet“ aus dem Arena-Schritt (Stufe 6); solange hält die Kurzmeldungs-Schlange gewollt an
(`toast-queue.js`, hold), die Meldung des Tipps kommt danach. Der Schritt wartet jetzt, bis die Einblendung weg ist, und tippt dann.
In Heiler-WoW war er „unter Last einmal“ rot – es hing nur davon ab, wie lange die Schritte davor dauerten.

## Chat: Rechtsklick auf einen unsichtbaren Reiter

Vorher: Die Reiter nehmen in Ruhe seit Dungeon-Fix 3 die Maus an. Dadurch ging das Fenster schon beim Überfahren eines Reiters auf
(`:hover`, ohne Verweilen), und ein Rechtsklick im Vorbeigehen traf den gerade erscheinenden Reiter – er öffnete das Kontextmenü
„Chatfenster“ statt zu laufen. In der Lücke daneben lief derselbe Rechtsklick.

Jetzt (`chat-window.js`, `bierdeckel.css`):
- **Rechtsklick auf einen unsichtbaren Reiter** geht an das, was darunter liegt (WoW-Muster): laufen, Gegner angreifen, Figur ansprechen –
  genau wie in der Lücke. Kein Kontextmenü an der unsichtbaren Stelle, das Fenster bleibt in Ruhe.
- **Linksklick** auf einen unsichtbaren Reiter öffnet ihn wie bisher.
- `:hover` hält nur ein offenes Fenster offen; in Ruhe geht es nach dem Verweilen (wie über der Lücke) oder per Klick auf einen Reiter
  auf. Am Handy unverändert (dort sind die Reiter in Ruhe ausgeblendet, der Chat öffnet über das Menü).

Geprüft: `e72-klicks-check` Teil chat (neu: Rechtsklick auf den Reiter läuft, kein Kontextmenü, Fenster bleibt in Ruhe),
`dungeon-fix3-check` Teil 5 (Linksklick auf „Ereignisse“/„Beute“ öffnet den Reiter), `tests/e72-klicks.test.mjs`.

## Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 1332 grün (neu 11 in `tests/uhrfehler.test.mjs`, 5 Zeilen in `e72-klicks.test.mjs`) |
| `npm run content:check` | grün |
| `npm run build` | grün (Build #776 lokal, Precache neu) |
| `npm run ui:check` | grün |
| `npm run balance:sheet` | läuft, 960 Messzeilen, ⚑ 255 → 259 (siehe oben) |
| `node scripts/dungeon-sim.mjs` voll | 73/73 grün |
| `tests/uhrfehler.test.mjs` | 11 grün |
| `scripts/e72-klassen-smoke.mjs` | grün (fünf Klassen) |
| `scripts/e72-klicks-check.mjs` | 109/109 (neu: Rechtsklick auf den unsichtbaren Reiter) |
| `scripts/heiler-wow-check.mjs` | 35 grün |
| `dungeon-check` | grün (Desktop und Handy) |
| `dungeon-fix3-check` Teil 5 (Chat-Reiter) | grün |
| `mobile-check` | grün, alle Teile: hoch 0/34, quer 0/34, klein 0/34, sitzung 0/14, dungeon 0/10, desktop 0/6 |
| Browsermessung Fass/Sporen (Chrome, echte Bilder, 10 s) | vorher Weizen 12, Bock 33 (3 Gegner), Sporen 0,63 s · nachher 10, 27, 0,63 s |

Alle Browserprüfungen mit eigenem Server (4561–4567) und eigenem Chrome (9761–9767). Eingecheckte Screenshots unter `docs/e72-runde*/`
nach den E-72-Prüfungen zurückgeholt.

Drei Prüfskripte wackelten unabhängig von dieser Arbeit (Gegenprobe gegen den alten Stand) und sind jetzt fest:
- `heiler-wow-check` „Gegner gewählt → du“: Unter Last lief das Nest aus dem Gruppenheilungs-Schritt noch und heilte Peter über die
  Schwelle. Die Gruppenheilung wird vor dem Schritt abgeräumt.
- `e72-klicks-check` Teil karte: „Statik kommt nach der Ruhezeit“ lief in die Zeitschranke, wenn ein umherziehender Gegner den laufenden
  Helden angriff (die Karte wartet im Kampf gewollt); Gegner bis dahin beiseite. Im Wechsel-Teil stand `[k%4]` wörtlich im
  Browser-Ausdruck („k is not defined“, sobald gerade keine Karte offen war).
- `mobile-check` „Unterbrechung“: siehe oben.

## Restliste

- **Weizen-Pfad stellt Pils:** Die Sorte folgt dem Vorrang Bock > Pils > Weizen. Wer auf dem Weizen-Pfad (ab 11 Punkten) auch „Pils
  zuerst“ lernt, stellt Pilsfässer – im Sheet ab Stufe 20. Ob der gewählte Pfad gewinnen soll, ist eine Designfrage.
- **Zwei Weizenfässer übereinander** heilen doppelt (je Fass ein Puls). Das war schon so gedacht (höchstens zwei Fässer). Falls der
  Zapfmeister als Tank zu viel Selbstheilung bekommt, dann hier ansetzen, nicht an der Uhr.
- **Stand ohne Held:** Ein frischer Browser speichert vor der Heldenwahl einen Stand unter dem alten Schlüssel (`…-72-1`). Er stört nicht
  (wird nur übernommen, wenn die Heldenliste leer ist), liegt aber als toter Stand im Speicher.
- **Balance-Sheet-Kennzahl der Heilung** zählt Überheilung (schon in Heiler-WoW notiert); der Zapfmeister-Ausreißer ist fast nur das.
- Die Zeitgeber außerhalb der Klassen (Tutorial, Aktivitäten, Hotspots) nutzen eigene Namen (`clock`) je Objekt; nicht als Fehler gefunden,
  nicht einzeln getestet.

## Live-Stand

- Build **#777** (e945a3c6), `server-refresh` ✔; live geprüft: `/api/version` meldet #777, `spec-mechanics.js` mit `fieldPulse(z,'fass'…)` und `chat-window.js` mit `toWorld` werden ausgeliefert.
- Vor dem Push: `origin/main` unverändert (87a9466b), kein Rebase nötig; Sperrdatei der Prüferin war weg.
