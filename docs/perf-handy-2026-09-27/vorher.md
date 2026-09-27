# Handy-Messung vorher (27.09.2026, Stand origin/main d67b7b86)

**Anlass.** Nutzer: Auf einem Android-Handy (Chrome) ist das Spiel selbst auf den niedrigsten Einstellungen nicht durchgehend flüssig, am meisten beim Laufen und im Kampf.

## Messaufbau

Skript: `node scripts/perf-handy.mjs` (Auswertung `scripts/perf-handy-lib.mjs`, Tests `tests/perf-handy.test.mjs`).

| Punkt | Einstellung |
|---|---|
| Gerät | Headless-Chrome 154, Querformat 915 × 412 CSS-px, Gerätepixel 2,625, Touch (5 Punkte), Android-UA (Pixel 7) → Spiel im Touch-Modus, Zoom 1,5 |
| Prozessor | `Emulation.setCPUThrottlingRate` 4× (Mittelklasse-Android) und 6× (ungünstiger Fall); Messrechner AMD EPYC 4344P |
| Grafik | SwiftShader als „Grafikkarte“ (`--use-angle=swiftshader --enable-gpu-rasterization --enable-accelerated-2d-canvas`) und `?render=gpu`: Canvas ist beschleunigt wie auf dem Handy – der Hauptfaden zeichnet nur auf, gerastert wird im GPU-Prozess. So tauchen die Stellen auf, an denen der Hauptfaden auf die Grafikkarte warten muss (Flush, Rücklesen). |
| Spiel | Stufe 20 (Arena-Stufe), Voreinstellung „Niedrig“ (Licht aus, Effekte aus, niedrige Auflösung = Dichte 2, Automatik an), Söldner angeheuert, Weltleinwand 1216 × 544 |
| Stillstand | 20 s an der Startstelle (Hof der Bude) |
| Laufen | 20 s Joystick über echte Touch-Ereignisse (Finger zittert leicht, pointermove fast jedes Bild), gelenkt entlang einer Route aus dem Wegplaner: Bude → Dorf → Feld (2.130 E), über Kachelgrenzen, an Häusern und Bewohnern vorbei |
| Kampf | 20 s, 4 Keiler Stufe 20 (Nachschub unter 3), Autoangriff, alle 0,65 s ein Kniff per Antippen, Schadenszahlen an, Söldner kämpft mit |

**Maßstab ist die Hauptfaden-Zeit je Bild**: belegte Zeit aller obersten Aufgaben vom Beginn eines Bildes (Aufgabe mit den rAF-Rückrufen) bis zum nächsten – Skript, Stil, Layout, Paint/Commit, GC, Eingabe, Timer. Raster, Compositor und GPU-Prozess laufen auf anderen Fäden und sind ohne echte Grafikkarte überzeichnet; sie stehen nur getrennt da. Unter „Bildabstand“ steht der Abstand der rAF-Aufrufe (was man sieht).

## Ergebnis vorher (je Szene 20 s)

| Drosselung | Szene | Hauptfaden je Bild p50 / p95 / p99 (ms) | Bilder > 33 ms | > 50 ms | Bildabstand p50 / p95 | FPS | lange Aufgaben (> 50 ms) | GC-Pausen (Anzahl · max) |
|---|---|---|---|---|---|---|---|---|
| 4× | Stillstand | 82,0 / 104,2 / 122,5 | 257 von 257 | 252 | 82 / 104 | 12,8 | 248 | 26 · 38,5 ms |
| 4× | Laufen | 105,9 / 171,6 / 266,8 | 191 von 195 | 180 | 106 / 173 | 9,5 | 175 | 88 · 125,4 ms |
| 4× | Kampf | 121,9 / 168,6 / 227,0 | 170 von 170 | 169 | 122 / 169 | 8,3 | 170 | 42 · 57,8 ms |
| 6× | Stillstand | 164,5 / 206,2 / 297,4 | 118 von 118 | 118 | 165 / 207 | 5,9 | 119 | 20 · 44,0 ms |
| 6× | Laufen | 138,4 / 177,6 / 197,6 | 148 von 153 | 144 | 139 / 178 | 7,5 | 141 | 69 · 42,1 ms |
| 6× | Kampf | 172,7 / 246,0 / 255,5 | 116 von 116 | 116 | 173 / 246 | 5,8 | 116 | 20 · 22,2 ms |

Hauptfaden je Bild nach Art (Mittel, ms, 4×):

| Szene | Skript | Stil | Layout | Paint/Commit | GC | Stilberechnungen je Bild · Elemente · davon erzwungen |
|---|---|---|---|---|---|---|
| Stillstand | 55,0 | 12,8 | 1,4 | 5,2 | 0,2 | 1,4 · 258 · 2,4 |
| Laufen | 57,0 | 29,6 | 2,7 | 8,6 | 2,1 | 3,9 · 491 · 4,7 |
| Kampf | 61,7 | 39,0 | 3,4 | 10,5 | 0,8 | 4,4 · 563 · 5,8 |

Andere Fäden (4×, nur zur Einordnung): GPU-Prozess 37–50 % belegt, Compositor unter 5 %. Kalibrierung ohne Drosselung (1×): Stillstand 31 ms, Laufen 32 ms, Kampf 40 ms je Bild – schon ungedrosselt kein 60-Bilder-Takt.

## Die größten Verursacher

CPU-Profil (Selbstzeit, 4×) und DOM-Zähler (MutationObserver) je Szene:

| Szene | Top-Funktionen (Anteil der belegten Zeit) | Canvas-Aufrufe | DOM-Änderungen je Bild |
|---|---|---|---|
| Stillstand | `fillRect` 34 % (← `drawBelag` kit-art.js:48, 33 %), `drawImage` 14 % (← `drawMaifeld`), `renderTracker` quest-tracker.js:90 7 %, `getBoundingClientRect` 4 % | 50 % | 28 (53 % der Bilder mit Änderung) |
| Laufen | `drawImage` 14 %, `fillRect` 13 % (← `drawBelag`), `renderTracker` 10 %, `getBoundingClientRect` 5 %, `getImageData` (← Anziehpuppe, Sprite-Normalisierung) | 30 % | 28 (98 %) |
| Kampf | `fillRect` 28 % (← `drawBelag`), `drawImage` 11 %, `renderTracker` 10 %, `getBoundingClientRect` 6 %, `fit` resource-hud.js:116 5 %, `loop` minimap.js:237 2 % | 40 % | 58 (89 %) |

Befunde im Einzelnen:

1. **Belag der Bude als Muster aus einem `<img>`** (`kit-art.js` `drawBelag`): Auf einer beschleunigten Leinwand zwingt jedes `fillRect` mit einem Bild-Muster Chrome, alle bis dahin aufgezeichneten Befehle abzuschicken und auf den GPU-Prozess zu warten (`CommandBufferProxyImpl::WaitForGetOffset` 8–15 ms je Bild). 7 Flächen × 1–4 ms. Ein Muster aus einer Leinwand kostet 0,01 ms. Ohne Grafikkarten-Nachbildung (`--soft`) unsichtbar – deshalb in E-46–E-50 nie aufgefallen.
2. **HUD liest Geometrie mitten zwischen seinen Schreibvorgängen**: 2,4–5,8 erzwungene Stil-/Layout-Durchgänge je Bild. Auf Android erzwingt schon das Lesen von `innerWidth`/`innerHeight` ein volles Layout (Viewport-Meta aktiv, Blink `LocalDOMWindow::GetViewportSize`) – `renderTracker` liest `innerHeight` bei jedem HUD-Takt (7–15 % der Zeit). Dazu `clientWidth`/`clientHeight` in `resource-hud.js fit` (4× je Bild), `offsetParent` in der Minikarte, `getBoundingClientRect` in Schadenszahlen, Beschriftungen, Truppenrahmen, Aurenleisten, Erinnerungskarte.
3. **HUD schreibt gleiche Werte neu**: `textContent=` ersetzt immer den Textknoten, `hidden=`/`setAttribute` erzeugen Mutationen – im Stillstand 28 Änderungen je Bild (Kniff-Lampen, Ortszeile, Kampftipp zweimal als `innerHTML`, aria-Werte der Lebensbalken). Mehrere `:has()`-Regeln am `body` machen Kinderänderungen teuer (Stil-Invalidierung über den ganzen Baum).
4. **HUD-Takt skaliert schlecht**: `updateUI` läuft alle 100 ms – bei 8–12 Bildern/s also in jedem Bild; ebenso Minikarte (33 ms) und Ressourcenleiste.
5. **Bude aus Einzelbefehlen**: ~950 Zeichenbefehle je Bild für Wände (Putzfugen, Tapetenmuster) und Böden (Kiesränder, Wandschatten) – im Aufzeichnen und im Übertragen an den GPU-Prozess (`DoUpdateLayers`).
6. **Laufen**: Bodenstücke werden bei Überlast in jedem Bild „dringend“ gebaut (1–10 ms je Stück ungedrosselt); das Suchen des Stücks baut je Bild einige hundert Kandidaten-Objekte samt Sortierung. Neue Sprites werden auf beschleunigten Leinwänden normalisiert → GPU-Rücklesen (`ReadbackImagePixels` 2–3 ms je Bild). GC-Pausen bis 125 ms: 550 KB Müll je Bild (Kandidatenlisten, 10–20 Hilfsleinwände je Bodenstück, Konturlisten der Anziehpuppe, `nearby()`-Sets in der Kollision).
7. **Anziehpuppe beim ersten Anblick einer Haltung**: Zusammensetzen 4–16 ms (ungedrosselt), bis zu zwei je Bild; im Kampf ~9 je Sekunde, bis alle Angriffsbilder im Speicher liegen.
8. **Wegmarke und Kampftext**: Die Touch-Wegmarke baut bei jeder neuen Entfernung (beim Laufen mehrmals je Sekunde) eine neue Symbol-Leinwand samt Neuzeichnen (~3 ms); jede Schadenszahl mit Symbol ebenso. Schadenszahlen verschwinden per `setTimeout` zwischen zwei Bildern und erzwingen dort eine eigene Stilberechnung.

Rohdaten: `vorher-gpu.json` (Trace-Kennzahlen, Profile, DOM-Schreiber je Szene).
