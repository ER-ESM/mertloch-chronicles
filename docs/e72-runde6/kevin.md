# E-72 Runde 6 · Zündmeister: Die Kette hat Grenzen (Kürzel: kevin)

Branch `e72-kevin` (von main 0c2fc790). Gemessen mit `npm run balance:sheet`. Die frische Messung vor der Änderung glich dem Sheet auf main bis aufs Datum.

## Schwächster Punkt zuerst

Die Zahl der ⚑ bleibt bei 8, aber sie **verschieben sich**: Vier ⚑ „zu stark in der Gruppe ohne Ausrüstung“ fallen weg (Pfad 2 St. 5 ohne/ungew., Pfad 0 St. 15/30 ohne).
Vier neue kommen knapp über −15 % dazu: **Pfad 0 „Lunte“ mit Ausrüstung** (St. 10 episch −15,1 %, St. 15 selten −17,4 %, St. 20 selten −16,2 %) und Pfad 1 St. 30 ungew. (+15,1 %).
Pfad 0 mit Ausrüstung war schon vorher schwach (−12 bis −19 %). Die Ursache liegt woanders: Die Lunten-Explosion ist fester Schaden, sie wächst weder mit der Waffe noch mit der Stufe.
Auf Stufe 30 ohne Ausrüstung trägt sie 41 % des Schadens von Pfad 0, auf Stufe 20 mit epischer nur noch 2 %. Das ist ein eigener Umbau und bleibt offen.

## Ursache des Sprungs

Übungskampf: drei Puppen stehen im Kreis mit Radius 32. Jede ist 55–64 Einheiten von den anderen entfernt, die Lunten-Explosion reicht 70. Jede Explosion trifft also alle drei.
Auf Stufe 5 hat Pfad 2 mit vier Punkten schon beide Verstärker: **Kleber für alle** (eine Lunte klebt auf allen drei) und **Funkenüberschlag** (jeder Treffer auf einen Lunten-Träger hat 15 %, den Kurzschluss sofort bereit zu machen).

- Ein Kurzschluss durch drei Lunten würfelt etwa sechsmal Funkenüberschlag: für den eigenen Treffer, die Sprünge und die Explosionen auf Nachbarn, die noch eine Lunte tragen. Damit macht er sich zu **62 % selbst wieder bereit**.
  Dazu kommen seine drei Zündungen. Sie starten sofort die Kettenreaktion, und auch die setzt ihn zurück. Die Kette läuft, bis Lunten oder Flaschen ausgehen.
  Wie lang sie wird, hängt als geometrische Reihe (1/(1−p)) daran, wie viele Lunten-Träger gerade leben. Deshalb reagiert der Pfad so sprunghaft.
- Messung (St. 5, ohne Ausrüstung, Gruppe, Mittel aus drei Läufen): **13,3 Kurzschlüsse in 40 s** statt 6 auf den anderen Pfaden, 6,7 Kettenreaktionen und 9,6 Rücksetzungen durch Funkenüberschlag.
  7,3 dieser Rücksetzungen lösten Treffer desselben Kurzschlusses aus. Gegen den Boss ist Pfad 2 gleichauf mit den anderen (79 zu 81 Schaden/s), in der Gruppe liegt er bei 215 zu 145.
- Weglassen einzelner Talente: ohne Kleber für alle −65 %, ohne Funkenüberschlag −30 %. Nur Zündungen je Kurzschluss zu deckeln half kaum (−1 %), denn die Rücksetzungen kommen vor allem aus Funkenüberschlag.
- Zweiter Verstärker: Zündet ein Kurzschluss drei Lunten, gibt das in der Dreiergruppe 3 × 3 Explosionstreffer. Der Lunten-Schaden wächst also mit dem Quadrat der Gruppengröße.
  Das trug Pfad 0 auf Stufe 30 ohne Ausrüstung: Mit Faktor 0,78 statt 0,74 sprang er von +25 % auf +52 %.
- Gegenprobe mit 12 statt 3 Startwerten: Pfad 2 St. 5 ohne liegt tatsächlich bei +25 %, Pfad 0 St. 30 ohne bei **+30 %**. Das Sheet mit drei Startwerten zeigte dort +25,4 %, der Ausreißer war also echt.

## Hebel: zwei Regeln statt eines Faktors

| Regel | Daten | Code |
|---|---|---|
| **Sofort bereit höchstens einmal hintereinander.** Macht Kettenreaktion oder Funkenüberschlag den Kurzschluss sofort bereit, klingt der nächste Einsatz einmal regulär ab. Solange er abklingt, greift keine Rücksetzung. Die Kettenreaktion startet trotzdem und bringt ihre fünf Sprünge. | `chain.instantRow:1` | `spec-mechanics.js` `burstResetBlocked`/`resetBurst`; `procs.js` sperrt Procs mit `reset:'burst'` nur beim Zündmeister |
| **Jede weitere Lunte, die derselbe Kurzschluss zündet, explodiert 20 % schwächer** (1 · 0,8 · 0,64 …). Eine abgebrannte Lunte explodiert voll. | `chain.fuseFalloff:.2` | `afterBurst` → `fuseExplode(…, power)` |

Warum das die Absicht trifft: Das Talent Kettenreaktion soll sich selbst füttern („mehr Sprünge, neue Lunten, nächste Zündung“), und Funkenüberschlag soll mehr Kurzschlüsse bringen. Beides bleibt.
Weg ist nur die Endlosschleife, in der sich ein Kurzschluss an seinen eigenen Treffern immer wieder auflädt. Die Explosionsabnahme bremst die Gegnerdichte, wie es der Blitz mit seinem Verlust je Sprung schon tut.
Einen Faktor habe ich nicht angefasst (0,74). Andere Spezialisierungen fragen die Sperre nie ab: Abriss nach „Zeche prellen“ (Dieter) und Kevins andere Bäume setzen weiter zurück wie bisher.

Verworfen, gemessen über alle Zellen: Funkenüberschlag nur ohne eigene Treffer (+26 %, reicht nicht), Zündungen je Kurzschluss deckeln (P0 St. 30 +38 %), Kurzschluss setzt sich nie selbst zurück, weder über eigene Treffer noch über eigene Zündungen (10 ⚑).
Ebenfalls verworfen: jeder Gegner höchstens eine Explosion je Kurzschluss. In Zahlen gut (6 ⚑, mit 12 Startwerten 8), aber in der Dreiergruppe verpufften die 2. und 3. Lunte ohne Schaden. Weiter verworfen: Abnahme mit dem Sprungverlust (0,45) (P2 St. 20 −19 %) und Abnahme 15 % (bei 12 Startwerten P0 St. 30 +25,2 %).

## Vorher / nachher (kevin-fuse, Schaden/s und Abweichung vom Median)

| Zelle (Pfad · Stufe · Ausrüstung) | vorher | nachher |
|---|---:|---:|
| 2 · 5 · ohne | 147 (**+30,5 %** ⚑) | 127 (+12,2 %) |
| 2 · 5 · ungewöhnlich | 231 (+23,1 % ⚑) | 191 (+1,7 %) |
| 0 · 15 · ohne | 198 (+23,4 % ⚑) | 177 (+10,4 %) |
| 0 · 30 · ohne | 269 (**+25,4 %** ⚑) | 246 (+14,8 %) |
| 1 · 30 · ohne | 250 (+16,4 % ⚑) | 254 (+18,5 % ⚑) |
| 1 · 30 · ungewöhnlich | 656 (+12,3 %) | 672 (+15,1 % ⚑) |
| 0 · 10 · episch | 322 (−13,7 %) | 317 (−15,1 % ⚑) |
| 0 · 15 · selten | 376 (−12,6 %) | 355 (−17,4 % ⚑) |
| 0 · 15 · episch | 435 (−15,8 % ⚑) | 430 (−16,7 % ⚑) |
| 0 · 20 · selten | 446 (−14,8 %) | 433 (−16,2 % ⚑) |
| 0 · 20 · episch | 493 (−19,1 % ⚑) | 510 (−16,2 % ⚑) |
| 1 · 5 · selten | 192 (−16,6 % ⚑) | 192 (−16,4 % ⚑) |

- kevin-fuse: **⚑ 8 → 8**, Zellen über ±25 %: **2 → 0**, größte Abweichung +30,5 % → **+18,5 %**. Mit 12 Startwerten: ⚑ 7, größte Abweichung +20,4 %, keine Zelle über ±25 %.
- Glätte, Faktor 0,70 → 0,78: Pfad 0 St. 30 ohne liegt jetzt bei 247 → 271 Schaden/s (vorher 256 → 326), Pfad 2 St. 5 ohne bei 126 → 129 (vorher 135 → 148).
  **Risiko:** Pfad 1 St. 30 ohne reagiert weiter stark auf den Faktor (239 → 282). Schon ab Faktor 0,76 läge er über +25 %. Eine Stärkung des ganzen Zündmeisters würde also zuerst dort anschlagen.
- **Andere Spezialisierungen:** Ausstoß (Schaden, Heilung, Schutz, Ressource) in **0 von 896 Zeilen** geändert. Ihre Zerlegungen sind unverändert, nur die von kevin-fuse Pfad 0/2 haben sich bewegt.
  Weil kevin-fuse in vielen Zellen selbst am Median steht, verschiebt sich die **Median-Abweichung** in 162 Schadenszeilen. Sechs ⚑ kippen dadurch (drei an, drei aus):
  dieter-brawl 24 → 23, baerbel-feedback 22 → 23, baerbel-stage 10 → 9, kaethe-grand 7 → 8, kaethe-falsch ±0. Gesamt bleibt es bei **259 ⚑**.

## Texte

Kurzschluss-Kit (`content/mechanics.js`): je Sprung **45 %** statt der veralteten 30 % (Tuning seit E-72 0,45), dazu „jede weitere 20 % schwächer“ und „Sofort bereit höchstens einmal hintereinander“.
Tooltip und Hilfe (`mechanic-help.js`) übernehmen die Zahlen aus den Daten. Angepasst sind auch das Talent und der Proc Funkenüberschlag („nicht zweimal hintereinander“) sowie die Glossarbegriffe Lunte, Kurzschluss und Kettenreaktion.
Der Talentkatalog (`assets/content-art/e32/runtime/catalog.json`) wurde neu erzeugt, weil sich nur der Wirktext von Funkenüberschlag geändert hat. Die Bilder sind unverändert.

## Tests

`npm test`: **1361 / 1361 grün**. Neu: `tests/e72-zuendmeister-kette.test.mjs` prüft
- die Explosionen 1 · 0,8 · 0,64 in der Dreiergruppe und die volle Explosion einer abgebrannten Lunte,
- den Ablauf Kettenreaktion → sofort bereit → zweiter Kurzschluss klingt ab → nach regulärem Abklingen wieder sofort bereit,
- dass Funkenüberschlag gesperrt ist und danach wieder frei, dass andere Spezialisierungen (Dieter, Kevins andere Bäume, Käthe) nie gesperrt werden,
- dass die Zahlen im Kit-Text zu den Daten passen.

Keine Browserprüfung (laut Auftrag nicht nötig). Sichtbar ändern sich nur die Tooltip- und Glossartexte.

## Offen / Nebenbefunde

- Pfad 0 „Lunte“ mit Ausrüstung −15 bis −17 %: Die Explosion ist fester Schaden (siehe oben). Vorschlag: Explosion an Waffe/Stufe koppeln wie `skillDamage`. Das wäre ein eigener Auftrag.
- Die Kettenreaktion setzt die Sprünge fest auf 5 (`reaction.jumps`). Mit Zündleitung und Kettenreaktion springt der Kurzschluss aber sonst schon 6-mal, die Reaktion kürzt ihn also.
  Das zeigt sich nur ab sieben Gegnern und stammt nicht aus dieser Runde. Ich habe es nicht geändert.
