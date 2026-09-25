# Dungeon „Schloss Big B“ · Räume wie echte Orte · 25.09.2026

Auftrag: Die 15 Räume sollen wie Orte aussehen statt wie Grundrisse. Grundlage sind das Grafik-Review
(`docs/REVIEW-GRAFIK-DUNGEON-2026-09-24.md`: Befunde 3, 4, 8 und 10, Zielbild C, Tabelle „Grafikbedarf“) und die Leitidee
„Schild und Wirklichkeit“ aus dem Plan (§2): An der Tür steht „Rittersaal“, drin ist ein Partykeller; der Basaltdom ganz unten
ist echt und mit Pappe verkleidet. Vorbild ist WoW.

Unverändert bleiben: Kollision und Wege, Logik (`dungeon.js` nur Darstellung), Warnflächen (`hazard-art.js`), Warnleiste,
Journal und Karte. Etappe 3 (Big B, Truhe, Tresortür-Logik) lief parallel und wurde nicht angefasst; in der Schatzkammer bleibt
die Mitte für ihre Endtruhe frei.

- Worktree `D:\Dev\MertlochChronicles-dg-raeume`, Zweig `dungeon-raeume`. Die Prüfungen liefen aus einem zweiten Worktree
  (`-dg-raeume-gate`), damit Änderungen während der Läufe sie nicht treffen.
- Prüfskript `scripts/dungeon-raeume-check.mjs` (CDP 9630, Server 4430; `TAG=vorher|nachher`, `ONLY=1…7`, `DENS=2,3,4`),
  Unit-Tests `tests/dungeon-raeume.test.mjs`, dazu prüft `npm run kit:check` jetzt auch den Dungeon.
- Bilder unter `visual-review/dungeon-raeume/<TAG>/` (lokal, nicht im Repo), Vergleiche unter `…/nachher/vergleich/`.

## Aufbau

| Datei | Aufgabe |
|---|---|
| `content/dungeon-scenery.js` | Darstellungsdaten (keine Logik): Masse je Ebene, Belag, Wandfront und Requisiten je Raum, Lichterketten, Freiräume (Truhe, Hinterausgang), Garage draußen. Eigene Datei statt Felder in `content/dungeons.js`, damit die parallele Etappe 3 keine Zusammenführungskonflikte bekommt. |
| `dungeon-scenery.js` | Logik ohne DOM: Raster der Ebene (2 E je Zelle) mit begehbar, Wandfront, Mauerkrone, Masse; Requisiten in Weltkoordinaten; Lichtpunkte der Leuchten; Garagen-Bauplatz und Bäume davor; Prüfung (`auditScenery`). |
| `dungeon-scenery-art.js` | Zeichnung: Masse-Kacheln, Wandfront-Maler, Kronen, gebackene Leinwand je Ebene, Kopie je Bild, Requisiten für die Tiefensortierung, Lichterketten, Garage. |
| `dungeon-art.js` | Nutzt die Leinwand statt Rechtecken; Übergänge als Dinge (Treppenschacht mit Kette, Leiter, Lichtschacht, Wendeltreppe, Getränkeaufzug), geschlossene Türen als Türblatt, Rolltor mit Tageslicht, Pappwand als Wand, Plaketten auf der Wandfront, Kellerlicht aus den Leuchten. |
| `renderer.js` | drei Haken: Requisiten und Garage in der Tiefensortierung, Lichterketten über den Figuren. |
| `app.js` | ein Aufruf nach dem Weltbau: Bäume vor der Garage entfernen. |
| `kit-art.js` | zwei kleine Exporte (`kitReady`, `kitFrames`) für den Zwischenspeicher. |

**Wandregel** (Baukasten E-54, angepasst an die Lücken der Dungeon-Karte): Die Nordkante eines Raums bekommt eine Wandfront nach
oben in die Lücke, höchstens 22 E. Ist die Lücke zum nächsten Raum schmaler, wird die Front so niedrig, dass die Mauerkrone (4 E)
noch darüber passt – eine geschnittene Innenwand. So deckt keine Front begehbaren Boden ab (Unit-Test). Seiten- und Südkanten zeigen
nur die Krone. Alles Übrige ist die Masse der Ebene. Türen sind Lücken, über Türen in Seitenwänden steht die Stirnseite der Wand.

(in Arbeit)
