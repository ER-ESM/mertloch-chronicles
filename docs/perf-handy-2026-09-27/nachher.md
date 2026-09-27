# Handy-Messung nachher (27.09.2026, Branch perf-handy)

Messaufbau wie in [vorher.md](vorher.md): Android-Nachbildung 915 × 412, Gerätepixel 2,625, Touch, Grafik „Niedrig“, Stufe 20, Canvas beschleunigt (SwiftShader), `?render=gpu`. Maßstab: **Hauptfaden-Zeit je Bild**.

**Vergleich vorher/nachher im selben Lauf** (`node scripts/perf-handy.mjs --ab=<alter Stand>`): zwei Browser nacheinander, Durchgänge A, B, B, A, je Szene 20 s, also 40 s je Zelle. Vorher = origin/main d67b7b86 (auf eigenem Port ausgeliefert), nachher = dieser Branch. Rohdaten `ab.json`, Profil nachher `nachher-profil.json`.

## Vorher / nachher

| Drosselung | Szene | vorher p50 / p95 / p99 (ms) | **nachher** p50 / p95 / p99 (ms) | vorher Bilder > 33 / > 50 ms | nachher Bilder > 33 / > 50 ms | FPS vorher → nachher | längste GC-Pause |
|---|---|---|---|---|---|---|---|
| 4× | Stillstand | 80 / 107 / 135 | **34 / 57 / 73** | 513 / 505 von 513 | 611 / 130 von 1.169 | 12,8 → 29,2 | 124 → 36 ms |
| 4× | Laufen | 102 / 174 / 222 | **50 / 104 / 149** | 390 / 356 von 401 | 501 / 357 von 711 | 9,8 → 17,4 | 97 → 56 ms |
| 4× | Kampf | 137 / 185 / 217 | **67 / 112 / 139** | 288 / 288 von 288 | 546 / 446 von 594 | 7,1 → 14,5 | 54 → 44 ms |
| 6× | Stillstand | 166 / 210 / 247 | **55 / 90 / 99** | 237 / 237 von 237 | 634 / 429 von 718 | 5,9 → 17,9 | 48 → 57 ms |
| 6× | Laufen | 137 / 190 / 222 | **59 / 101 / 131** | 298 / 279 von 322 | 609 / 435 von 656 | 7,9 → 16,2 | 56 → 67 ms |
| 6× | Kampf | 222 / 300 / 363 | **55 / 115 / 135** | 183 / 183 von 183 | 505 / 395 von 698 | 4,4 → 17,0 | 62 → 44 ms |

Hauptfaden je Bild nach Art (Mittel, ms, 4×):

| Szene | Skript | Stil | Layout | Paint/Commit | GC |
|---|---|---|---|---|---|
| Stillstand | 54,7 → **23,5** | 12,7 → **0,3** | 1,5 → **0,4** | 5,4 → 7,1 | 0,5 → 0,1 |
| Laufen | 54,2 → **36,5** | 29,8 → **2,2** | 2,5 → **0,7** | 7,8 → 9,4 | 2,3 → 0,6 |
| Kampf | 71,0 → **36,3** | 47,6 → **5,2** | 4,3 → **1,5** | 11,4 → 19,9 | 0,7 → 0,1 |

„Paint/Commit“ wächst im Kampf: Vorher zwangen die Bild-Muster der Bude Chrome, die Zeichenbefehle mitten im Bild abzuschicken (erschien als Warten im Skript); jetzt geht alles einmal beim Commit (`LayerTreeHost::DoUpdateLayers`) an den GPU-Prozess – gleiche Arbeit, anderer Posten, weniger Warten.

Abschnitte in `app.js frame()` nachher (Mittel / p95 ms, 4×, aus `?perf=segments`):

| Szene | Welt zeichnen | Logik (tick) | HUD (updateUI) | Layout-Phase | Bodenstücke (rest) |
|---|---|---|---|---|---|
| Stillstand | 14,6 / 30,6 | 4,7 / 16,3 | 2,1 / 10,9 | 0,9 / 4,1 | – |
| Laufen | 15,9 / 45,4 | 6,3 / 18,9 | 4,2 / 18,3 | 2,0 / 9,1 | 4,5 / 18,1 |
| Kampf | 19,8 / 41,1 | 6,5 / 19,5 | 5,7 / 18,9 | 2,9 / 12,8 | – |

Stilberechnung je Bild (4×, Stillstand / Laufen / Kampf): neu berechnete Elemente 255 / 490 / 605 → **1,5 / 8 / 21**, erzwungene Stil-/Layout-Durchgänge 2,3 / 4,7 / 6,3 → **0,1 / 1,0 / 1,3**. DOM-Änderungen je Bild im Stillstand 28 → 1,5. `node scripts/perf-handy.mjs --scenes=idle --assert` prüft das (höchstens 1 erzwungener Stil-/Layout-Durchgang und 3 DOM-Änderungen je Bild) – grün.

**Streuung.** Der Messrechner wird von anderen Sitzungen mitbenutzt. Gleiche Fassung, zwei Läufe: Kampf 6× p50 85 bzw. 41 ms, Laufen 4× 37 bzw. 64 ms. Die Einzelläufe stehen in `ab.json`; Aussagen deshalb nur über beide Läufe zusammen. Laufen legt nachher im selben Zeitraum mehr Weg zurück (mehr Bilder, Spielzeit läuft schneller) und sieht damit mehr neue Gegend.

## Ziel erreicht?

Ziel bei 4×, Grafik „Niedrig“: p95 ≤ 16,7 ms Hauptfaden je Bild, keine Bilder über 50 ms. **Nicht erreicht.** Die Bildzeit hat sich halbiert (4×) bzw. gedrittelt (6×), der Stil ist im Kampf fast weg, aber p95 liegt bei 57 (Stillstand), 104 (Laufen) und 112 ms (Kampf). Was im Weg steht, in der Reihenfolge der Kosten (4×):

1. **Welt zeichnen 15–20 ms je Bild, Spitzen 40–45 ms.** Eigene Skriptarbeit im Renderer (je Objekt Sichtprüfung, Tiefensortierung, Schilder, Figurenbilder wählen) plus ~350 Canvas-Befehle, die beim Commit an den GPU-Prozess gehen (`DoUpdateLayers` 5–13 ms). Die Spitzen sind **Anziehpuppen beim ersten Anblick einer Haltung**: Kacheln lesen (`getImageData`), zusammensetzen, verkleinern – 15–60 ms je neuem Bild auf dem Handy. Weiter kommt man nur mit einem Rechen-Worker samt Bögen (verdoppelt deren Speicher) oder mit vorberechneten Weltbildern.
2. **Bodenstücke beim Laufen 4,5 / 18 ms.** Ohne freie Zeit baut jedes Bild ein dringendes Stück (1–10 ms ungedrosselt, CSS-Weichzeichner in Masken). Abhilfe wäre ein OffscreenCanvas-Worker (E-50 hatte ihn verworfen, weil das Vorausladen damals reichte; auf dem Handy reicht es nicht).
3. **Logik 5–6 ms, Spitzen 16–19 ms**: Söldner-KI, Sichtlinien, Dorfleben, Kampfwerte je Aufruf neu berechnet (`combatStats` → `talentEffects`/`equipmentStats`).
4. **HUD 2–6 ms, Spitzen 11–19 ms**: `updateUI` läuft bei 15 Bildern/s in jedem Bild; einzelne Takte bauen Teile neu (Abklingzeiten, Kampftext-Symbole beim ersten Mal).
5. Raster/Compositor/GPU-Prozess: ohne echte Grafikkarte nicht belastbar (hier 30–65 % belegt).

Bei 6× gilt dasselbe in größer; p95 100–115 ms.

## Profil nachher (4×, 12 s)

| Szene | Top-Funktionen (Selbstzeit) | Canvas-Aufrufe | DOM je Bild |
|---|---|---|---|
| Stillstand | (program) 38 %, `drawImage` 8 %, `drawScene` 3 %, `tick` 2,5 %, `blocked` 1,5 %, `drawPaperdoll` 1,3 % | 16 % | 1,5 |
| Laufen | (program) 46 %, `drawImage` 4 %, `drawScene` 3 %, `getBoundingClientRect` 3 % (Layout-Phase am Bildanfang), `tick` 2,4 %, `getImageData` 1,6 % | 10 % | 6 |
| Kampf | (program) 49 %, `drawImage` 5 %, `getBoundingClientRect` 4 %, `drawScene` 2 %, `tick` 1,8 % | 11 % | 10 |

„(program)“ ist Arbeit in Chrome selbst ohne JavaScript-Zuordnung (Aufzeichnen der Zeichenbefehle, Commit, Stil) – kein einzelner Posten mehr über 10 %.

Bilder: [vorher-4x-walk.jpg](vorher-4x-walk.jpg), [vorher-4x-combat.jpg](vorher-4x-combat.jpg) (Szenen, wie sie gemessen werden).
