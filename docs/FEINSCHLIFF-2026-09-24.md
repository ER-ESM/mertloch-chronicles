# Visueller Feinschliff 2026-09-23/24 – Bude, Kampf, Items, Talente, Kniffe

Nutzerauftrag: „visueller Feinschliff mit Live-Bewertung … Bude in allen Inhalten, Items, Talente, Kniffe, Kampfanimationen … mindestens 20 Iterationen“.
Arbeitsweise: je Runde Aufnahme (Headless oder Playwright), Vergleich mit WoW/Diablo IV/Hades/Stardew/Eastward, gezielte Änderung, `npm test` grün, Fast-Forward nach `main`, `server-refresh`.
Branch `visual-polish`, Worktree `D:\Dev\MertlochChronicles-polish`. Figuren- und NPC-Grafik wurde bewusst **nicht** angefasst (Freigabe-Regel).

## Runden (live ab #329 bis #375)

| # | Bereich | Änderung | Dateien |
|---|---|---|---|
| 1 | Bude | Kneipendämmerung drinnen (nur über der Grundfläche), Lampen-/Ofenlicht aus Baukasten-Teilen mit `light`, Lichtschacht mit Staub durchs Dachloch, Schatten am Wandfuß | `world-light.js`, `content/lighting.js` (`interior`, `lamp`, `stove`, `skylight`), `bude-house-art.js` |
| 2 | Welt | Auftragszeichen als goldenes „!“/„?“ mit atmendem Schein (Schrift-Ebene) statt rosa Pille; Raumnamen nur für den eigenen Raum und unter der Maus | `renderer.js` (`questBadge`) |
| 3 | Bude | Nichts scheint mehr durchs Dach (Schilder von Figuren unter sichtbarem Dach aus); weicher Kontaktschatten unter Kulissen (Trümmer sahen wie Löcher aus) | `renderer.js` (`hideLabels`), `world-prop-ui.js` |
| 4 | Bude | Schankraum als „Morgen danach“ (Fass, Stühle, Becher, Luftschlangen, Pfütze, Scherben) – `kit:check` grün, Bauplätze/Treppe frei | `content/bude-house.js` |
| 5 | Kampf | Treffer-Blitz mit Rückstoß; Kampftext größer, dicke Kontur, Glückstreffer golden federnd, Drift je Laufbereich | `renderer.js` (`hitFlash`), `bierdeckel.css` (`.sct-*`) |
| 6 | Talente | Motive füllen den Rahmen (Umriss einpassen), größere Knoten, Gold-Schein gelernt, grünes Atmen verfügbar | `talent-art.js`, `icon-fit.js`, `talent-tree.css` |
| 7 | Items | Qualitätsschimmer hinter Gegenständen (episch atmend), Tooltip-Rand in Qualitätsfarbe, Fachbegriffe leiser unterstrichen | `ui-chrome.css` |
| 8 | Kniffe/HUD | Kniffe-Buch-Symbole im Messingrahmen; leere Fächer der 2. Leiste ohne Tastenschild | `bierdeckel.css` |
| 9 | Bude | Senkrechte Wände mit Licht-/Schattenseite und Putzfugen; Tageslicht der Südfenster auf den Dielen | `kit-art.js`, `world-light.js`, `content/lighting.js` (`window`) |
| 10 | Kampf | Warnfläche der Gegner: Verlaufsfüllung, wachsende Innenfläche, rotierender Markenkranz | `renderer.js` |
| 11 | Kampf | Gegner-Lebensbalken mit Rahmen, Glanzkante, nachlaufender Verlust-Spur; Elite/Boss Goldrand | `renderer.js` (`nameplate`) |
| 12 | Bude | Funken über dem Ofen, Staub im Lampenlicht | `world-light.js`, `content/lighting.js` |
| 13 | Clanbuch | Reitersymbole größer und randfüllend | `icon-fit.js`, `ui-art.js`, `ui-chrome.css` |
| 14 | Figur | Held auf einer Bühne (Lichtkegel, Bodenschatten) | `ui-chrome.css` |
| 15 | Bude | Schlagschatten des Hauses in Lichtrichtung (drinnen kurz) | `bude-house-art.js` (`castShadow`) |
| 16 | Maus | Eigene Zeiger: Messingpfeil, Schwert (Gegner), Sprechblase (Freunde), Hand (Sammelpunkt) | `ui-chrome.css`, `app.js` (`data-cursor`) |
| 17 | Kampf | Kampftext 28 px, Glückstreffer 40 px | `bierdeckel.css` |
| 18 | Aufstieg | Goldene Lichtsäule, Bodenring, Funken am Helden (mit Lichtschein) | `app.js`, `renderer.js` (`drawLevelUp`), `world-light.js` |
| 19 | Kampf | Gegner kippen beim Tod vom Helden weg um, liegen entsättigt, verblassen; Staub statt Explosion | `renderer.js` (`drawCorpse`), `asset-art.js` |
| 20 | Bude | Lichterketten über dem Hof mit eigenem Lichtschein | `content/bude-house.js` (`garlands`), `world-house.js`, `bude-house-art.js`, `world-light.js` |
| 21 | Aufstieg | Banner ohne sichtbaren Kasten | `bierdeckel.css` |
| 22 | Kampf | Zielmarke: vier rotierende Klammerbögen mit Kontur und Bodenschein | `renderer.js` |
| 23 | Persona | Leere 2. Leiste unsichtbar; Hausschatten läuft weich aus; Trümmerschilder nur unter der Maus | `ui-chrome.css`, `bude-house-art.js`, `renderer.js` |
| 24 | Gespräch | Dockt wie in WoW links unter dem Spielerrahmen – Held und Gesprächspartner bleiben sichtbar | `popup-windows.js`, `ui-chrome.css` |
| 25 | Kniffe | Gesperrte Kniffe lesbar (nur Symbol entsättigt), Namen 12 px | `ui-chrome.css` |
| 26 | Hof | Südkante läuft unregelmäßig ins Gras aus | `bude-house-art.js` (`softEdge`) |
| 27 | Karte | Papierkörnung, abgegriffene Ränder | `ui-chrome.css` |
| 28 | Welt | Schilder/Auftragszeichen über dem eigenen Helden durchscheinend | `renderer.js` (`labelQueue.hero`) |
| 29 | HUD | Menüknöpfe unten rechts 46 × 50 mit randfüllenden Symbolen | `ui-art.js`, `ui-chrome.css` |
| 30 | HUD | EP-Leiste mit Glanzkante und leuchtender Spitze | `ui-chrome.css` |

## Werkzeuge

- `visual-review/shot.mjs` (nicht eingecheckt, `visual-review/` ist ignoriert): Headless-Aufnahmen mit voller Bildrate. Szenen `sct`, `fight`, `kill`, `aoe`, `bude:x:y:zoom:geschoss`, `ui:<taste>` (mit `PRE`/`HOVER`), `eval` (mit `EVAL`/`WAIT`/`CLIP`).
- Falle: Das Playwright-MCP-Fenster läuft gedrosselt (Dokument-Zeitleiste steht, rAF ~4/s) – CSS-Animationen und Kampftext sind dort unsichtbar. Für Animationen Headless-Chrome über `scripts/browser-session.mjs` nehmen.

## Persona-Bewertung (Kenner, Build #360)

Gesamt 6/10; stark: Startbildschirm/Film, Fassaden, UI-Rahmen. Abgearbeitet in Runden 23–29: leere Leiste, Rechteckschatten, Dialog-Lage, gesperrte Kniffe, Hofkante, Karte, Held unter Schildern, Menüknöpfe.
Offen (bewusst nicht angefasst):
- **Held klein** (Echtmaßstab E-52) und **Innenwände nur als Krone** (Entscheidung E-52/E-54) – Umbau wäre eine Nutzerentscheidung.
- **Talente erst ab Stufe 5 sichtbar** (Freischaltung `content/unlocks.js`) – Persona wünscht ausgegrauten Baum als Vorschau.
- **Figuren/NPC-Grafik** – nur nach Freigabe des Nutzers.
- **`hud-check` rot** an der Chat-Fensterlage (`chatNative`/`chatEdited`) – gleicher Fehler auf dem Live-Stand vor dieser Arbeit, gehört zum verschiebbaren Chat.
