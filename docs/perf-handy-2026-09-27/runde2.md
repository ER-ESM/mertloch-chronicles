# Handy-Messung Runde 2 (27.09.2026, Branch perf-handy)

Messaufbau wie in [vorher.md](vorher.md): Android-Nachbildung 915 × 412, Gerätepixel 2,625, Touch, Grafik „Niedrig“, Stufe 20, Canvas beschleunigt (SwiftShader), `?render=gpu`. Maßstab ist die **Hauptfaden-Zeit je Bild**.

**Vorher** ist Runde 1, also origin/main f6ed8654 (Build #831), aus einer Kopie auf eigenem Port ausgeliefert. **Nachher** ist dieser Branch. Gemessen wurde mit `node scripts/perf-handy.mjs --ab=<Runde 1>`: die Durchgänge laufen nacheinander in der Folge A, B, B, A, je Szene 20 s, zusammen 40 s je Zelle. Die Rohdaten stehen in `ab-runde2.json`. Den Kampf bei 6× habe ich zusätzlich einzeln gemessen, dazu unten mehr (`ab-runde2-kampf6.json`, `ab-runde2-worker-aus.json`).

## Runde 1 → Runde 2

| Drosselung | Szene | Runde 1 p50 / p95 / p99 (ms) | **Runde 2** p50 / p95 / p99 (ms) | Bilder > 50 ms R1 → R2 | FPS R1 → R2 | längste GC-Pause |
|---|---|---|---|---|---|---|
| 4× | Stillstand | 28 / 55 / 71 | **31 / 45 / 54** | 116 von 1.331 → **21 von 1.283** | 33 → 32 | 64 → 61 ms |
| 4× | Laufen | 57 / 116 / 176 | **50 / 84 / 109** | 406 von 641 → **358 von 731** | 15,6 → 18,1 | 61 → 36 ms |
| 4× | Kampf | 59 / 111 / 140 | **32 / 65 / 84** | 447 von 648 → **189 von 1.104** | 15,9 → 26,7 | 43 → 53 ms |
| 6× | Stillstand | 53 / 89 / 102 | **34 / 63 / 72** | 416 von 717 → **193 von 1.148** | 17,9 → 28,7 | 47 → 41 ms |
| 6× | Laufen | 58 / 102 / 126 | **58 / 98 / 128** | 439 von 665 → 444 von 661 | 16,4 → 16,2 | 50 → 55 ms |
| 6× | Kampf¹ | 84 / 144 / 193 | 95 / 182 / 220 | 619 von 690 → 552 von 616 | 11,2 → 10,0 | 39 → 77 ms |

¹ Eigene Messung, nur diese Szene, je Fassung drei Läufe à 20 s. In der Gesamtmessung kam bei Runde 1 ein Kampf nicht zustande: kein Schaden, also wurde Stillstand gemessen (p50 42 ms). Dadurch sah Runde 1 dort mit 59 / 101 zu gut aus. `perf-handy.mjs` wiederholt solche Läufe jetzt (`scripts/perf-handy.mjs:174`).

**Bei 6× im Kampf zeigt Runde 2 keinen Gewinn. Ein Rückschritt ist das nach allen Messungen nicht, die Einzelläufe streuen dafür zu stark.**
- Die zwei langsamsten Runde-2-Läufe (103 und 107 ms p50) liefen direkt hintereinander in einer Lastspitze des Rechners. Der Runde-1-Lauf danach stieg ebenfalls, auf 87 ms.
- Gegenprobe: Runde 2 mit und ohne Rechen-Worker (`?noworker=all`), abwechselnd gemessen, ergab 54 / 147 mit Workern und 68 / 161 ohne. Die Worker verschlechtern den Kampf also nicht.
- Dieselbe Fassung maß in derselben Stunde einmal 43 und einmal 113 ms p50.

Hauptfaden je Bild nach Art (Mittel ms, 4×, Runde 1 → Runde 2):

| Szene | Skript | Stil | Layout | Paint/Commit | GC |
|---|---|---|---|---|---|
| Stillstand | 20,1 → 21,4 | 0,3 → 0,3 | 0,3 → 0,3 | 6,6 → 7,3 | 0,2 → 0,2 |
| Laufen | 44,6 → **30,4** | 2,4 → 2,7 | 0,9 → 0,9 | 10,3 → 13,1 | 0,7 → **0,4** |
| Kampf | 35,6 → **17,7** | 4,4 → **2,4** | 1,4 → **0,6** | 16,7 → **11,2** | 0,5 → 0,3 |

Abschnitte in `app.js frame()` (Mittel / p95 ms, gültige Läufe, Runde 1 → Runde 2):

| Drosselung | Szene | Welt zeichnen | Logik (tick) | HUD (updateUI) | Layout-Phase | Rest (Bodenstücke, Vorbestellen) |
|---|---|---|---|---|---|---|
| 4× | Stillstand | 13,9 / 27,5 → **14,2 / 22,7** | 4,2 / 12,3 → 3,7 / 12,4 | 2,0 / 9,5 → 1,7 / 7,7 | 0,6 / 2,3 → 0,5 / 1,8 | 0,1 / 0,2 → 0,2 / 1,1 |
| 4× | Laufen | 19,6 / 51,6 → **12,7 / 28,3** | 7,1 / 18,4 → **6,2 / 13,8** | 4,9 / 18,3 → 4,4 / 18,0 | 2,1 / 9,4 → 2,0 / 8,8 | 5,0 / 17,2 → **0,5 / 1,9** |
| 4× | Kampf | 20,4 / 40,8 → **10,4 / 26,6** | 6,5 / 18,4 → **3,1 / 9,6** | 5,5 / 19,4 → **2,1 / 12,7** | 2,5 / 10,4 → **1,4 / 4,5** | 0,1 / 0,2 → 0,2 / 1,1 |
| 6× | Stillstand | 16,1 / 30,3 → **10,4 / 24,9** | 9,2 / 20,3 → **5,5 / 14,8** | 4,2 / 13,5 → 2,2 / 11,3 | 2,3 / 12,3 → 0,8 / 3,4 | 0,1 / 0,3 → 0,2 / 1,6 |
| 6× | Laufen | 14,4 / 32,8 → 12,6 / 27,5 | 8,2 / 17,4 → 8,1 / 17,0 | 5,5 / 17,1 → 5,3 / 16,5 | 3,5 / 11,1 → 3,2 / 11,1 | 3,5 / 17,4 → **0,6 / 2,3** |

Beim Laufen bleibt der Rest-Abschnitt jetzt unter 1 ms (vorher 3,5–5 ms, Spitzen 17 ms), weil der Boden-Worker die Bodenstücke baut. Welt zeichnen hat bei 4× im Laufen und im Kampf nur noch die halbe p95-Spitze: Neue Haltungen der Anziehpuppe und neue Sprites entstehen im Worker.

## Ziel erreicht?

Ziel bei 4×, Grafik „Niedrig“: p95 ≤ 16,7 ms Hauptfaden je Bild, keine Bilder über 50 ms außer beim Szenenwechsel. **Nicht erreicht.**
- p95 liegt bei 45 ms (Stillstand), 84 ms (Laufen) und 65 ms (Kampf).
- Über 50 ms sind noch 2 % der Bilder im Stillstand, 17 % im Kampf und 49 % beim Laufen.

Die Spitzen aus dem Rechnen sind weitgehend weg: Anziehpuppe, Bodenstücke, Sprites und Wegsuche. Was bleibt, ist Grundlast in jedem Bild, bei 4×:

1. **Welt zeichnen, 10–14 ms je Bild.** An der Bude sind das rund 1.340 Zeichenbefehle je Bild und 750 Zustandswechsel. Davon entfallen 180 auf `save`/`restore` je Objekt (`renderer.js:312`) und etwa 190 auf die Lichterketten mit 8 Befehlen je Birne (`bude-house-art.js:164`). Die Kit-Möbel (`kit-art.js:138`) und das Clan-Lager in Vektorformen (`clan-art.js:39`) kommen hinzu.
2. **Commit an den GPU-Prozess, 5–9 ms** (`DoUpdateLayers`). Dieser Posten wächst mit der Zahl der Befehle. Ohne echte Grafikkarte ist er überzeichnet.
3. **Logik 3–6 ms, HUD 2–4 ms**, Spitzen je 10–18 ms.
4. **Beim Laufen: Bildabstand.** SwiftShader ist beim Laufen zu 99 % belegt. Das Rastern im GPU-Prozess bremst hier stärker als auf einem echten Handy.

## Maßnahmen

### 1. Anziehpuppe: Rechen-Worker, bitgleich
- **Worker** `paperdoll-worker.js`: lädt die Bögen selbst per `fetch` und `createImageBitmap`. Er setzt mit demselben Code zusammen wie der Hauptfaden (`paperdoll-tiles.js:23` Kachelspeicher, `:43` `composeFigure`), tönt und verkleinert (`paperdoll-shrink.js`). Zurück gehen die fertigen Pixel.
- **Anbindung** in `paperdoll-art.js`:
  - `pdWorker` (`:219`), `onPdMessage` (`:225`), `orderWorld` (`:229`).
  - `warmFigure` (`:236`) bestellt vor: übrige Bilder des laufenden Zyklus, Atmen in allen vier Richtungen, bei Kämpfern auch Laufen und Aktionsbilder.
  - Ist ein Bild noch nicht da, zeigt der Hauptfaden das letzte Bild derselben Richtung (`:269`). Selbst zusammengesetzt wird nur noch beim allerersten Anblick einer Richtung.
  - Der Speicher fasst 1.400 Weltbilder (`:192`).
- **Genaues Einrasten** (`paperdoll-shrink.js:14`): Der alte Farbzwischenspeicher hing von der Reihenfolge ab. Worker und Hauptfaden wichen deshalb in etwa 1 % der Pixel voneinander ab. Jetzt wird die exakt nächste Palettenfarbe gesucht, über Kandidatenlisten je 8³-Würfel. Bei Gleichstand gewinnt die frühere Palettenfarbe.
- **Belegt:**
  - 111 Worker-Bilder, 3,9 MB, stimmen Byte für Byte mit dem Hauptfaden überein. Das gilt auch für die Zusammensetzung vor dem Einrasten (`paperdoll.debug.audit(true)`, danach `await paperdoll.debug.compareWorker(300)`).
  - Test: 20.000 Zufallsfarben gegen den vollen Durchlauf, in beiden Reihenfolgen.

### 2. Bodenstücke: Boden-Worker
- **Worker** `terrain-worker.js`: baut die Stücke mit `terrain.js` auf OffscreenCanvas (`:16`) und gibt je Stück ein ImageBitmap zurück.
  - Bodentexturen bekommt er fertig vom Hauptfaden (`maifeld-art.js:40` `groundTile`).
  - Die Weltgeometrie steckt ohne DOM in `world-geometry.js:8`. `World.blocked`/`onRoad` nutzen dieselben Funktionen.
- **Anbindung:**
  - `renderer.js:216` startet den Worker.
  - `terrain-prefetch.js:38/44/49` bestellt: nur Stücke bis 400 E vor dem Sichtrand, höchstens drei gleichzeitig.
  - Weiter voraus sättigte das Hochladen die Grafik: p95 beim Laufen 179 ms. Der dringende Weg im Hauptfaden bleibt als Rückfall.
- **Belegt:** 12 Stücke aus dem Worker sind bitgleich zum Hauptfaden.

### 3. Welt zeichnen
- **Sprite-Worker** `sprite-worker.js` und `sprite-jobs.js:20`: verkleinert Bäume, Steine und Häuser vorab und rastert sie auf die Palette (`normalizeArt`). Das kostete vorher im Bild 3–30 ms je neuem Sprite.
  - `renderer.js:209` `prefetchSprites` bestellt alle 250 ms, was im Ring von 250 E um die Sicht liegt, plus 500 E in Laufrichtung.
  - Die Zeichenfunktionen erkennen die Vorbestellung (`maifeld-art.js:45`, `tiny-architecture.js:36`).
- **Belegt:** 70 von 70 Leinwand-Sprites bitgleich, bei zwei Größen und ein- wie dreiteilig. Bilddateien (`<img>`) verkleinert Chrome im Hauptfaden auf einem anderen Weg; dort wichen bis zu 255 Stufen ab. Sie bleiben deshalb im Hauptfaden (heute nur Bodentexturen und Bärbel, `sprite-jobs.js:23`).
- **Warnflächen:** Die Randmarken einer Fläche sind jetzt ein einziger Pfad statt eines Pfads je Marke (`hazard-art.js:12`). Das Bild ist gleich.

### 4. Logik und HUD
- **Wegsuche:** höchstens eine je Bild (`world.js:120` `findPathSoon`, Bildzähler `app.js:563`). Dorfbewohner (`village-life.js:14`) und Söldner (`companions.js:113/135`) behalten sonst ihren alten Weg und fragen im nächsten Bild erneut. Vorher konnten mehrere Suchen à etwa 10 ms (4×) in dasselbe Bild fallen.
- **Auren:** Die Knöpfe kommen aus einem Vorrat (`aura-ui.js:65`), statt bei jeder Änderung neu gebaut zu werden.
- **HUD im Kampf:** 5,5 → 2,1 ms im Mittel (4×).
- **`combatStats` zwischenspeichern:** nicht umgesetzt. Gemessen waren es 0,3 ms je Bild. Ein Zwischenspeicher müsste jede Ausrüstungs-, Talent- und Aurenänderung mitbekommen; das Risiko falscher Werte wiegt schwerer.

### 5. mobile-check „Unterbrechung (M-15)“: veraltete Prüfung, jetzt grün
- **Ursache:** Commit f1077898 (24.09., „Meldungen nacheinander“) hat die Kurzmeldungs-Schlange eingeführt. Solange eine große Einblendung steht oder wartet (Stufe 6 „Neu freigeschaltet“), hält sie gewollt an (`toast-queue.js`, `hold`).
- **Warum rot:** Commit b2694201 (26.09.) ließ die Prüfung nur auf die *sichtbare* Einblendung warten. Die *eingereihte* Einblendung hielt „Kein passendes Ziel“ weiter 2,3 s zurück. Der Tipp wirkte also, die Rückmeldung kam nur später, als die Prüfung nachsah.
- **Neu** (`scripts/mobile-check.mjs:163`): Die Prüfung wartet, bis keine Einblendung mehr steht oder eingereiht ist. Danach tippt sie und wartet bis zu 1 s auf eine *neue* Meldung oder ein Ziel.
- **Ergebnis:** `mobile-check` komplett grün, 0 von 112 Schritten mit Fehlern, keine Laufzeitfehler.

### Messwerkzeug
- `?perf=segments` meldet jetzt auch die 8 langsamsten Bilder mit ihren Abschnitten (`frame-segments.js:13`, `perf-handy.mjs --worst`).
- Kampfläufe ohne Schaden werden wiederholt.
- **Diagnose auf dem Gerät:** `?noworker=all` schaltet alle drei Rechen-Worker ab, `?noworker=paperdoll,terrain,sprite` einzelne (`frame-segments.js:17`). Ohne Worker, OffscreenCanvas oder `createImageBitmap` läuft alles wie in Runde 1 im Hauptfaden.

## Was offen bleibt und warum

- **Welt zeichnen, 1.340 Befehle an der Bude.**
  - Die Lichterketten funkeln je Birne mit eigener Deckkraft. Weder Stapeln noch ein Zwischenbild geht, ohne das Bild zu ändern.
  - Das `save`/`restore` je Objekt schützt 90 Zeichenwege vor liegengebliebenem Zustand. Es wegzulassen, verlangt eine Prüfung jedes Weges.
  - Beides wäre nächste Runde „Welt-Ebenen“: Möbel und Lager an der Bude als Zwischenbild wie die Wände (E-76 Punkt 5), dann bleiben nur noch Bewegtes und Figuren.
- **Commit an den GPU-Prozess.** Er sinkt nur mit weniger Befehlen, siehe oben. Seine Größe ist erst auf einem echten Handy belastbar.
- **Bei 6× Laufen und Kampf kein Gewinn.** Beides ist Grundlast (Zeichnen, Commit, Logik, HUD), keine Spitzen. Was Runde 2 an Spitzen abbaut, fällt bei 6× in der Streuung nicht auf.
- **Messplatz.** Der Rechner wird geteilt; dieselbe Fassung misst 43 bis 113 ms p50. Belastbar ist nur, was sich über mehrere Läufe im Wechsel hält: 4× Laufen, 4× Kampf, 6× Stillstand. Eine Messung auf einem echten Mittelklasse-Handy steht noch aus.
