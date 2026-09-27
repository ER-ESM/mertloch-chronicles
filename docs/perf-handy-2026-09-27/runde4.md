# Handy-Messung Runde 4 (27.09.2026, Branch perf-handy): Namensschilder bei „Niedrig“ auf der Weltfläche

**Nutzerentscheidung:** Bei Grafik „Niedrig“ liegen die Namensschilder auf der Weltfläche. Das spart die zweite Leinwand je Bild. Auf allen anderen Stufen bleiben die Schilder scharf auf ihrer eigenen Leinwand.

Messaufbau wie in [vorher.md](vorher.md): Android-Nachbildung 915 × 412, Gerätepixel 2,625, Touch, Grafik „Niedrig“, Stufe 20, SwiftShader, `?render=gpu`. Maßstab ist die Hauptfaden-Zeit je Bild. Vorher = Runde 3 (main 40a1340f, Build #833), nachher = dieser Branch.

## Ergebnis

### Umschalter (belastbar)
Schilder abwechselnd auf der Weltfläche und auf der eigenen Leinwand, im selben Lauf alle 1,5 s. Je Zelle 2 × 24 s, Rohdaten `umschalter-runde4.json`.

| Drosselung | Szene | eigene Leinwand p50 / p95 (ms) | **Weltfläche** p50 / p95 (ms) | Bilder > 50 ms | Paint/Commit (ms) | davon `DoUpdateLayers` (ms) |
|---|---|---|---|---|---|---|
| 4× | Stillstand | 21,4 / 32,1 | **20,6 / 31,8** | 2 von 676 → 2 von 674 | 5,4 → 4,6 | 3,8 → 2,9 |
| 4× | Laufen (Bude → Feld) | 27,7 / 50,6 | **24,0 / 45,0** | 31 von 498 → 13 von 558 | 9,3 → 7,2 | 5,6 → 3,8 |
| 4× | Kampf | 32,5 / 53,5 | **29,8 / 50,7** | 51 von 603 → 36 von 671 | 11,3 → 9,3 | 6,8 → 5,0 |
| 4× | Laufen fern der Bude | 30,2 / 51,0 | **26,7 / 48,7** | 38 von 585 → 27 von 645 | 12,3 → 9,6 | 8,4 → 6,0 |
| 6× | Stillstand | 16,5 / 41,8 | **15,9 / 39,0** | 10 von 759 → 6 von 752 | 6,9 → 5,7 | 5,3 → 4,1 |
| 6× | Laufen (Bude → Feld) | 20,7 / 43,0 | **19,2 / 40,1** | 13 von 694 → 13 von 692 | 8,2 → 6,5 | 5,5 → 3,8 |
| 6× | Kampf | 54,1 / 85,8 | **50,2 / 82,1** | 212 von 371 → 201 von 411 | 20,0 → 16,5 | 13,2 → 10,2 |
| 6× | Laufen fern der Bude | 38,1 / 59,6 | **32,5 / 54,5** | 87 von 522 → 61 von 596 | 15,1 → 11,6 | 11,0 → 7,7 |

- **Alle 8 Zellen werden besser:** p50 um 0,6–5,6 ms, p95 um 0,3–5,6 ms.
- **Paint/Commit** sinkt um 0,8–3,5 ms, `DoUpdateLayers` um 0,9–3,3 ms: Die zweite Leinwand ändert sich nicht mehr je Bild.
- **Skriptzeit** bleibt gleich (±0,8 ms). Die Schilder auf der Weltfläche kommen als fertiges Schriftbild, ein Kopierbefehl je Name.
- **Bilder über 50 ms:** Beim Laufen fallen sie von 31 auf 13, im Kampf von 51 auf 36 (4×).

### Wechselmessung Runde 3 → Runde 4
Zwei Fassungen im Wechsel, je Zelle 2 × 20 s, Rohdaten `ab-runde4.json`.

| Drosselung | Szene | Runde 3 p50 / p95 / p99 | **Runde 4** p50 / p95 / p99 | Bilder > 50 ms R3 → R4 | `DoUpdateLayers` R3 → R4 | Einzelläufe p50 R3 · R4 |
|---|---|---|---|---|---|---|
| 4× | Stillstand | 18 / 36 / 47 | 22 / 37 / 47 | 12 → 14 | 3,7 → 3,1 | 12 · 24 → 21 · 22 |
| 4× | Laufen (Bude → Feld) | 25 / 62 / 84 | **22 / 52 / 79** | 81 → 54 | 5,2 → 3,5 | 19 · 35 → 17 · 29 |
| 4× | Kampf | 27 / 54 / 70 | 38 / 64 / 82 | 110 → 190 | 6,7 → 8,6 | 40 · 18 → 37 · 40 |
| 4× | Laufen fern der Bude | 22 / 49 / 64 | **19 / 43 / 58** | 47 → 21 | 6,3 → 4,6 | 30 · 16 → 26 · 14 |
| 6× | Stillstand | 38 / 57 / 69 | **25 / 49 / 63** | 168 → 62 | 9,7 → 6,3 | 37 · 39 → 34 · 15 |
| 6× | Laufen (Bude → Feld) | 52 / 86 / 108 | **47 / 75 / 110** | 409 → 339 | 10,6 → 8,6 | 52 · 52 → 46 · 49 |
| 6× | Kampf | 64 / 104 / 133 | **61 / 99 / 116** | 464 → 475 | 15,2 → 12,9 | 66 · 61 → 59 · 63 |
| 6× | Laufen fern der Bude | 29 / 64 / 81 | 40 / 62 / 79 | 161 → 241 | 8,3 → 9,3 | 19 · 40 → 40 · 40 |

- Wie in den Runden 2 und 3 streuen die Einzelläufe stark (R3 Kampf 4×: 40 bzw. 18 ms p50).
- 6 von 8 Zellen verbessern sich, 2 Ausreißer liegen innerhalb dieser Streuung.
- Beleg ist die Umschalter-Messung oben.

**Ziel p95 ≤ 16,7 ms bei 4× weiter nicht erreicht:** Laufen p95 45 ms, Kampf 51 ms im Umschalter-Lauf. Zum Vergleich der Ausgangsstand ([vorher.md](vorher.md)): Laufen p95 174, Kampf 185 ms – gemessen bei anderer Last des Rechners, also nur als Größenordnung.

## Maßnahmen

- **Schilder bei „Niedrig“ auf der Weltfläche**
  - Umschaltung in `renderer.js` (`labelsOnWorld`, `flushLabels`). Bedingung: niedrige Auflösung, kein Licht, keine Effekte – genau die Voreinstellung „Niedrig“.
  - Mit Licht oder Effekten bleibt die eigene Leinwand, denn die Schrift muss über der Licht- bzw. Effektebene liegen.
  - Die Schrift-Leinwand wird beim Wechsel einmal geleert und ausgeblendet (`display:none`); danach ändert sie sich nicht mehr.
  - Zurück auf eine andere Stufe erscheint sie im nächsten Bild wieder. Kein Neuladen nötig (geprüft: Niedrig → Mittel → Niedrig → mit Licht → ohne).
- **Gleiche Regeln wie bisher:** Ein gemeinsamer Zeichenweg `paintLabels` gilt für beide Ziele.
  - Blasen verdecken Schilder, Schilder über dem Helden werden durchscheinend.
  - HUD-Flächen sperren, das Titelband lässt Schilder zurücktreten, Kegel blenden sie aus.
  - Stapelung der Gegnerschilder, Auftragszeichen, Wegmarke und Sprechblasen bleiben gleich.
  - Die HUD- und Titelband-Prüfung rechnet auf der Weltfläche mit deren Maßstab (Weltflächen-Pixel je CSS-Pixel).
- **Schriftbild je Name** (`renderer.js`, `labelSprite`):
  - Kontur und Füllung werden einmal in ein kleines Bild gezeichnet. Schlüssel: Schrift, Farbe, Maßstab, Text. Danach kostet jedes Bild nur einen Kopierbefehl.
  - Der Textanker liegt auf ganzen Gerätepixeln; die Schrift sitzt also wie direkt gezeichnet.
  - Durchscheinende Schilder (über dem Helden, im Titelband, beim Ausblenden) werden weiter direkt gezeichnet. Kontur und Füllung mit Deckkraft sähen als Gruppe anders aus.
  - Neu geladene Schriften leeren den Speicher (240 Einträge, der älteste fliegt raus).
- **Weltschrift auf derselben Leinwand:** Schwebende Weltschrift (Wegmarken-Entfernung, „Taucht auf …“, „F · Beute“) läuft über dieselben Schilder. Der Kampftext (MSBT, `combat-text.js`) ist DOM und bleibt unberührt.
- **Diagnose:** `globalThis.__labelsOnWorld=false` erzwingt die eigene Leinwand; `labelSpriteStats` zählt Treffer und Neubauten.

### Weitere Leinwände und DOM-Ebenen je Bild

Gezählt wurde, welche Leinwand in wie vielen Bildern gezeichnet wird (60 Bilder/s, ungedrosselt):

| Leinwand | Stillstand | Laufen | Kampf | fern der Bude |
|---|---|---|---|---|
| Weltfläche 1216 × 544 | 100 % | 100 % | 100 % | 100 % |
| Schrift-Ebene 1822 × 816 (bis Runde 3) | 100 % | 100 % | 100 % | 100 % |
| Klassenleiste `rh-tray-art` 100 × 26 und `rh-meter` 66 × 6 | 26 % | 35 % | 51 % | 19 % |
| Ziel- und Heldenporträt, Kniff-Symbole, Kampftext-Symbole | ≤ 5 % | ≤ 5 % | ≤ 5 % | ≤ 1 % |

- Die Minikarte wird draußen nicht je Bild gezeichnet (vorgerenderter Ring, `minimap.js`).
- Licht- und Effektebene sind bei „Niedrig“ aus.
- **Die Klassenleiste zeichnet höchstens 30-mal je Sekunde.** Umschalter-Messung mit nur noch bei Änderung (10 Hz) statt 30 Hz: 4× Stillstand 18,9 → 19,6 ms p50, Kampf 27,1 → 25,8, Laufen 15,0 → 14,4. Also kein messbarer Unterschied; kleine Leinwände kosten fest kaum etwas. **Nicht geändert.**
- Die feste Kostenstelle gilt für große Leinwände: die Schrift-Ebene mit 1,5 Mio. Pixeln und die Weltfläche.

## Lesbarkeit: Namensschilder bei „Niedrig“ vorher/nachher

Gleiche Szene: Kampf an der Bude, vier Keiler mit Namensschild, Auftragszeichen. Das Bild ist angehalten, das ganze Bild in 2.402 × 1.082 Gerätepixeln.

- vorher (eigene Leinwand): `docs/perf-handy-2026-09-27/namensschilder-niedrig-vorher.jpg`, Ausschnitt ×3: `…-vorher-ausschnitt.jpg`
- nachher (Weltfläche): `docs/perf-handy-2026-09-27/namensschilder-niedrig-nachher.jpg`, Ausschnitt ×3: `…-nachher-ausschnitt.jpg`

**Befund:**
- Schriftgröße, Kontur, Farbe, Lage und Stapelung sind gleich.
- In der dreifachen Vergrößerung ist die Schrift sichtbar gröber: Weltflächen-Raster 1,33 statt 2 Pixel je CSS-Pixel. Das war erwartet und ist mit der Nutzerentscheidung abgedeckt.
- In Originalgröße auf dem Handy ist die Schrift gut lesbar.

## Prüfungen
- `npm test`: 1413/1413 grün (neu: `tests/perf-handy-runde4.test.mjs` – Bedingung je Voreinstellung, Umschalten zur Laufzeit, gleiche Zeichenregeln auf beiden Zielen).
- `hud:check` grün, `ui:check` grün, `performance-check` grün.
- `mobile-check` vollständig grün: 0 von 112 Schritten mit Fehlern, keine Laufzeitfehler.
- `perf-handy --assert` grün.
- `world-layer-check` grün. Die Schilder liegen jetzt in den Pixeln der Weltfläche; die Szenen bleiben wiederholbar.

## Offen
- **p95 ≤ 16,7 ms bei 4×.** Übrig ist die Grundlast: die Weltfläche selbst (fest ~3–6 ms Commit je Bild), Figuren, Logik (4–6 ms), HUD (2–4 ms) und Layout-Phase (1–2 ms).
- **Messung auf einem echten Handy.** Sie fehlt weiter. Die feste Leinwand-Kostenstelle ist unter SwiftShader vermutlich größer als mit echter Grafikkarte.
