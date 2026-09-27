# Handy-Messung Runde 3 (27.09.2026, Branch perf-handy)

Messaufbau wie in [vorher.md](vorher.md): Android-Nachbildung 915 × 412, Gerätepixel 2,625, Touch, Grafik „Niedrig“, Stufe 20, Canvas beschleunigt (SwiftShader), `?render=gpu`. Maßstab ist die **Hauptfaden-Zeit je Bild**.

- **Vorher** ist Runde 2, also main 660f4ac4 (Build #832), aus einer Kopie auf eigenem Port ausgeliefert. **Nachher** ist dieser Branch.
- **Neue Szene** „Laufen fern der Bude“ (`--scenes=walkfar`): vom Dorfrand (8200/10300) über Wiese und Feld in den Wald (5800/10900).
- **Neue Messart** „Umschalter“ (`--toggle`): Die Runde-3-Schalter werden im selben Lauf alle 1,5 s an- und ausgeschaltet, jeder Zustand wird getrennt ausgewertet. Laständerungen des geteilten Rechners treffen so beide Zustände gleich. Beim klassischen Vergleich zweier Fassungen streuen die Einzelläufe dagegen um bis zu ±50 %.
- **Gültigkeit:** Kampfläufe ohne Schaden und Läufe mit totem Helden werden jetzt wiederholt oder nicht gewertet. Im ersten Vergleichslauf war der Held der Runde-2-Fassung beim Laufen gestorben; alle folgenden Szenen hatten danach den Todesbildschirm gemessen.

Rohdaten: `ab-runde3.json` (Vergleich R2 → R3), `umschalter-runde3.json` (Umschalter), `world-layers.json` (Pixelprüfung).

## Runde 2 → Runde 3 (Wechselmessung, je Zelle 2 × 20 s)

| Drosselung | Szene | Runde 2 p50 / p95 / p99 (ms) | **Runde 3** p50 / p95 / p99 (ms) | Bilder > 50 ms R2 → R3 | FPS R2 → R3 | Einzelläufe p50 R2 · R3 |
|---|---|---|---|---|---|---|
| 4× | Stillstand | 34 / 59 / 68 | **28 / 43 / 52** | 135 von 1.094 → 21 von 1.312 | 27,3 → 32,8 | 45 · 30 → 29 · 26 |
| 4× | Laufen (Bude → Feld) | 39 / 105 / 155 | **31 / 72 / 93** | 249 von 760 → 150 von 799 | 18,8 → 19,8 | 57 · 33 → 24 · 40 |
| 4× | Kampf | 42 / 73 / 89 | 48 / 77 / 99 | 264 von 934 → 369 von 842 | 22,5 → 20,6 | 51 · 35 → 51 · 42 |
| 4× | Laufen fern der Bude | 24 / 61 / 69 | 35 / 65 / 75 | 145 von 1.068 → 196 von 967 | 26,5 → 23,9 | 43 · 15 → 43 · 31 |
| 6× | Stillstand | 31 / 66 / 75 | 31 / 65 / 72 | 186 von 1.038 → 180 von 1.043 | 25,9 → 26,1 | 49 · 20 → 48 · 21 |
| 6× | Laufen (Bude → Feld) | 39 / 73 / 92 | 34 / 88 / 114 | 258 von 937 → 252 von 863 | 23,2 → 21,3 | 31 · 46 → 62 · 24 |
| 6× | Kampf | 52 / 88 / 111 | 66 / 119 / 147 | 428 von 791 → 454 von 575 | 19,2 → 14,1 | 42 · 59 → 87 · 59 |
| 6× | Laufen fern der Bude | 45 / 79 / 105 | 51 / 108 / 146 | 327 von 855 → 364 von 699 | 21,2 → 17,3 | 56 · 37 → 74 · 44 |

**Diese Tabelle taugt nicht als Beleg, in keine Richtung.** Dieselbe Fassung misst in derselben Stunde 15 bzw. 43 ms (R2 fern der Bude) oder 59 bzw. 87 ms (R3, Kampf 6×). Die Unterschiede zwischen den Fassungen sind kleiner als diese Streuung. Belastbar ist die Umschalter-Messung.

### Umschalter: Runde-3-Schalter an/aus im selben Lauf (je Zelle 2 × 24 s)

| Drosselung | Szene | aus p50 / p95 | **an** p50 / p95 | Bilder > 50 ms aus → an | Skript aus → an (ms) | Paint/Commit aus → an (ms) |
|---|---|---|---|---|---|---|
| 4× | Stillstand | 27,3 / 38,9 | **25,4 / 38,8** | 6 von 668 → 3 von 672 | 18,8 → 17,2 | 5,9 → 5,9 |
| 4× | Laufen (Bude → Feld) | 35,7 / 61,7 | 35,9 / 65,0 | 100 von 510 → 110 von 467 | 20,8 → 21,3 | 11,1 → 11,2 |
| 4× | Kampf | 36,3 / 60,3 | **35,1 / 59,6** | 107 von 539 → 85 von 586 | 21,2 → 18,5 | 11,4 → 12,1 |
| 4× | Laufen fern der Bude | 26,0 / 48,5 | 25,9 / 50,1 | 53 von 601 → 46 von 573 | 14,5 → 13,6 | 9,2 → 10,1 |
| 6× | Stillstand | 29,1 / 53,6 | 29,8 / 53,3 | 76 von 587 → 63 von 597 | 19,8 → 19,6 | 9,9 → 10,4 |
| 6× | Laufen (Bude → Feld) | 36,1 / 68,3 | 36,6 / 68,1 | 150 von 503 → 145 von 476 | 19,7 → 20,3 | 12,4 → 12,6 |
| 6× | Kampf | 43,9 / 83,7 | 43,7 / 83,9 | 170 von 435 → 186 von 451 | 22,7 → 23,3 | 15,4 → 15,6 |
| 6× | Laufen fern der Bude | 47,0 / 78,9 | 51,7 / 78,0 | 187 von 433 → 229 von 424 | 26,6 → 26,5 | 15,2 → 17,2 |

- **Zeichenbefehle:** Die Welt-Ebenen halbieren sie (Tabelle unten).
- **Skriptzeit:** sinkt an der Bude und im Kampf bei 4× um 1,5–2,7 ms je Bild.
- **Paint/Commit:** bleibt gleich.
- **Laufen und 6×:** Die Unterschiede liegen im Rauschen.

## Ziel erreicht?

Nein. Ziel war bei 4×, Grafik niedrig, beim Laufen und im Kampf p95 ≤ 16,7 ms und keine Bilder über 50 ms. Gemessen sind p95 60–65 ms (Laufen) und 60 ms (Kampf) im Umschalter-Lauf.

## Wo die Grundlast liegt (4×, gemessen mit Umschaltern im selben Lauf)

| Versuch | Stillstand an der Bude p50 | Laufen fern der Bude p50 |
|---|---|---|
| normal | 30 ms (Skript 20, Paint 7,4) | 22 ms |
| **Welt gar nicht zeichnen** | **4 ms** (Skript 4,3, Paint 0,7) | **7,6 ms** |
| nur den Boden zeichnen | 10,5 ms | 13,9 ms |
| Namensschilder-Ebene nicht zeichnen | 26 statt 29 ms | 31 statt 36 ms |

1. **Die Weltfläche ist fast die ganze Last.** Ohne sie bleiben bei 4× nur 4–8 ms für Logik, HUD und Layout.
2. **Schon das Aktualisieren einer Leinwand kostet fest ~4–5 ms je Bild** (`DoUpdateLayers`, etwa 1,2 ms echte Rechenzeit ungedrosselt). Ein einziges 20 × 20-Rechteck je Bild kostet so viel wie ein Vollbild. Die zweite Leinwand, die Namensschilder, kostet noch einmal 3–5 ms. Weniger Zeichenbefehle senken diesen Teil kaum: Die Befehle an der Bude sanken von 1.085 auf 505, der Commit blieb bei 5,9 ms.
3. **Figuren** kosten in Skriptzeit je Bild ungedrosselt:
   - Held 55–120 µs
   - Söldner 50–70 µs
   - Ida 83 µs
   - Auftraggeber 48 µs
   - Gegner 17–34 µs
   - Bäume 4–9 µs, Häuser 5–8 µs
   Bei 4× das Vierfache. Beim Laufen und im Kampf sind Gegner, Held und Söldner die teuersten Objekte.
4. **Fern der Bude** wurde das Clan-Lager immer gezeichnet, auch weit außerhalb des Bilds: 122 von 250–460 Befehlen je Bild. Jetzt gekappt. Sonst sind es wenige Bäume und Häuser, dazu Figuren, Pollen, Logik (4–6 ms), HUD (2–4 ms) und Layout-Phase (1–2 ms).

## Maßnahmen

Die Pixelprüfung `scripts/world-layer-check.mjs` zeichnet feste Szenen mit eingefrorener Zeit (auch `performance.now`), Kamera und Haus-Überblendung. Sie schaltet jede Maßnahme einzeln zu und vergleicht Pixel für Pixel mit dem Stand von Runde 2 (Ergebnis in `world-layers.json`). In Klammern der Anteil der Pixel, die um mehr als 8 Stufen abweichen:

| Szene | Befehle je Bild R2 → R3 | cull | garlands | camp | props | neutral | pollen | memo | alle |
|---|---|---|---|---|---|---|---|---|---|
| Bude | 1.074 → 494 | 0 | 0,24 % (0,009 %) | 0 | 0,65 % (0,007 %) | 0 | 0,013 % (0) | 0 | 0,87 % (0,007 %) |
| Hof (drinnen) | 1.087 → 497 | 0 | 0,31 % (0,011 %) | 0 | 0,87 % (0,008 %) | 0 | 0,014 % (0) | 0 | 1,14 % (0,008 %) |
| Kirche/Clan-Lager | 1.054 → 660 | 0 | 0 | 0,36 % (0,107 %) | 0,086 % (0) | 0 | 0,013 % (0) | 0 | 0,46 % (0,107 %) |
| Dorf | 450 → 177 | 0 | 0 | 0 | 0,034 % (0,013 %) | 0 | 0,014 % (0) | 0 | 0,034 % (0) |
| Feld | 281 → 142 | 0 | 0 | 0 | 0 | 0 | 0,016 % (0) | 0 | 0,016 % (0) |
| Wald | 312 → 145 | 0 | 0 | 0 | 0 | 0 | 0,015 % (0) | 0 | 0,015 % (0) |
| Kampf (Bude) | 1.152 → 572 | 0 | 0,17 % (0) | 0 | 0,65 % (0,007 %) | 0 | 0,015 % (0) | 0 | 0,83 % (0,007 %) |

### 1. Welt-Ebenen (`world-layers.js:12`, Schalter einzeln abschaltbar, `?layers=off` bzw. `?layers=off:garlands,camp`)
- **Zwischenbild-Speicher** `layer-cache.js:16`:
  - Mehrere Zustände je Objekt (`slots`, für Animationsphasen).
  - Nur bei voller Deckkraft; bei Deckkraft unter 1 wird wie bisher direkt gezeichnet.
  - Treffer ohne Zeichenketten: Zahl→Text je Objekt und Bild kostete mehr als das Zeichnen.
  - Zurücksetzen mit `setTransform` und sechs Zahlen. Das Umwandeln eines `DOMMatrix`-Objekts war der teuerste Teil.
- **Ruhende Kulissen:** Schatten und Bild werden je Objekt ein Zwischenbild.
  - Kulissen `world-prop-ui.js:43` (legte vorher je Bild einen neuen Verlauf an)
  - Stufenmöbel `bude-house-art.js:128`
  - Baukasten-Teile `bude-house-art.js:114`, nur ruhende Bilder
  - Zaunstücke `world-details.js:73`
  - Berufs-Stationen verwenden ihre Kulisse wieder (`profession-art.js:20`).
- **Clan-Lager, Brunnen und Schild:** Die Sichtprüfung kappt Clan-Lager und Brunnen außerhalb des Bilds (`renderer.js:306`, `:291`, bitgleich). Wimpelkette und Schild sind Zwischenbilder in 24 bzw. 16 Phasen (`clan-art.js:49`). Die Wimpelspitzen weichen höchstens 0,07 E von der fließenden Bewegung ab.
- **Lichterketten** (`bude-house-art.js:182`): Alle Birnen funkeln mit derselben Frequenz, nur versetzt. Das ganze Bild wiederholt sich also alle 2,86 s. 24 Zwischenbilder je Periode ersetzen ~200 Befehle je Bild. Jede Birne funkelt weiter für sich; ihre Helligkeit springt höchstens um 0,03.
- **Pollen** (`renderer.js:76`): 7 Deckkraftstufen mit je einem Pfad statt 28 Einzelflächen samt Farbwechseln. Die Deckkraft weicht höchstens 0,024 ab.

### 2. save/restore je Objekt (`renderer.js:320`, `world-layers.js:20`)
- **Ohne Klammer** zeichnen Bäume, Wände, Baukasten-Teile, Kulissen (ohne Kiosk), Hofteile, Häuser, das Clan-Lager, Berufs-Stationen und Fundstellen. Ihre Ersatzwege klammern sich jetzt selbst (`tiny-architecture.js:41`, `kit-art.js:133`, `world-details.js`).
- **Figuren** behalten die Klammer.
- **Zustand geprüft:** Vor und nach jedem Objekt werden Transformation, Deckkraft, Stile, Schrift, Filter, Mischmodus, Schatten, Strichmuster, Clip und Klammer-Gleichgewicht verglichen, in 7 Szenen: keine Änderung.
- **Pixel:** neutral an/aus ist bitgleich.

### 3. Rechenzeit
- Die Anziehpuppe merkt sich, welche Bögen vollständig da sind und was schon vorbestellt ist (`paperdoll-art.js:266`, `:239`). Die Quellenliste wird einmal statt dreimal je Aufruf sortiert.
- Verkleinerte Bogenfelder der Gegner werden je Feld gemerkt (`live-art.js:37`). Beides ist bitgleich (Schalter `memo`).

### 4. mobile-check „Gespräch“ (klein): bei Runde 3 rot, Ursache ein Spielfehler, jetzt grün
- **Ablauf:** Im Schritt „kampf-kniff“ sprintet der Held. Je nach Kampf endet der Sprint an der Treppe der Bude, etwa bei 9651/9067 oder 9657/9062 (Runde 2 zufällig bei 9668/9058).
- **Ursache:** Dort bewegt er sich in der Treppenspur (`engine.js stairsWorld`, Bewegungsradius 5). Die Wegsuche rechnet aber mit der Welt ohne Spur (Radius 9); dort ist der Punkt blockiert, zwischen Treppe und Außenwand liegt nur ein 13 E schmaler Gang. `navigate` fand keinen Weg, F bzw. „Reden“ tat nichts. Das Gesprächsfenster blieb aus, die zwei Folgeschritte scheiterten daran.
- **Belegt im Browser:** Blockiert in der Welt, frei in der Treppenspur, `navigate` gibt `false`.
- **Behebung** `world.js:133` und `engine.js:544`: Findet die Wegsuche keinen Weg, führt ein kurzer Fluchtweg (`World.escapePath`, `world.js:84`) zum nächsten Punkt, der für die Wegsuche frei ist. Gesucht wird per Breitensuche im 2,5-E-Raster, in der Bewegungswelt und ohne Eckenschneiden. Was vorher einen Weg fand, bleibt unverändert.
- **Ergebnis:** Der Held läuft von allen drei Punkten zu Ida. Zwei vollständige mobile-check-Läufe: 0 von 112 Schritten mit Fehlern.

### Messwerkzeug
- `perf-handy.mjs`:
  - Szene `walkfar` (`:33`)
  - Umschalter (`:144`)
  - Held wird vor jeder Szene wiederbelebt (`:67`), ungültige Läufe werden wiederholt (`:189`)
  - Teilzeiten der Welt (Boden, flach, sortieren, Objekte, Schilder …) und Zeit je Objektart mit `?perf=segments` (`frame-segments.js:8`)
- `world-layer-check.mjs`: Pixelprüfung je Maßnahme und Zustandsprüfung.

## Was offen bleibt und warum

1. **p95 ≤ 16,7 ms bei 4× ist nicht erreicht.** Übrig ist Grundlast: Weltleinwand ~4–5 ms fest je Bild, Namensschilder-Leinwand 3–5 ms, Figuren (Held, Söldner, Gegner) je 0,1–0,5 ms, Logik 4–6 ms, HUD 2–4 ms, Layout-Phase 1–2 ms.
2. **Weltbereiche als ein Bild (Punkt 5): nicht umgesetzt.**
   - Fern der Bude machen ruhende Objekte nur 10–15 % der Welt-Rechenzeit aus. Die Umschalter zeigen: Halb so viele Befehle bringen 1–3 ms.
   - Ein Sammelbild bräuchte eine zweite Ebene für alles, was vor Figuren steht. Mit „source-atop“ ginge das rechnerisch exakt. Aber durchscheinende Bäume und Häuser (Held oder Ziel dahinter) und die Haus-Überblendung erzwingen Neuaufbauten, jeweils eine Spitze.
   - Hohes Risiko für wenig Gewinn. Der Entwurf steht im E-76-Nachtrag.
3. **Namensschilder auf die Weltfläche legen: braucht eine Entscheidung.** Das spart eine Leinwand je Bild (3–5 ms bei 4×). Die Schrift läge dann aber in Weltauflösung, 1,33 statt 2 Pixel je CSS-Pixel, also sichtbar unschärfer.
4. **`combatStats` zwischenspeichern:** weiter nicht (0,3–0,7 ms). Ein Zwischenspeicher müsste jede Änderung an Buffs und Ausrüstung innerhalb eines Takts mitbekommen.
5. **Messplatz:** Klassische Vergleiche streuen um ±50 %. Eine Messung auf einem echten Mittelklasse-Handy fehlt weiter. SwiftShader überzeichnet Raster und Commit.
