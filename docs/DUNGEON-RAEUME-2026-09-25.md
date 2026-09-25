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
Maße der Regel stehen in `DUNGEON_SCENERY_RULES` (Inhalt), nicht im Code.

## Punkte

| Nr | Stand | Was | Beleg |
|---|---|---|---|
| 1 | erledigt | **Wände mit Front statt 5-px-Strichen.** Nordwände zeigen eine Wandfront bis 22 E mit Material je Raum (14 Maler: Kalksandstein, Treppenhaus-Fliesen, Raufaser, Brüstung, Damast mit Holzvertäfelung, 70er-Tapete, Ziegel, Waschküchen-Fliesen, Studio-Weiß, Musterwohnung-Streifen, Basalt, feuchter Basalt, Basalt mit Pappverkleidung, Beton), Schatten unter der Krone und Fußleiste; Kronen mit Lichtkante zum Raum und Tintenkante zur Masse; Schatten am Wandfuß auf dem Boden. Figuren an der Nordwand stehen vor der Front, nicht in der Leere (Unit-Test: 2, 10 und 20 E über jeder vollen Nordkante liegt Front). Die Leere ist Masse: Mauerwerk (Erdgeschoss), Erdreich mit Steinen und Wurzeln (Keller 1), Basaltsäulen-Köpfe (Keller 2), je nahtlose 64-E-Kachel. Kollision unverändert (walkRects unberührt, alle Checks grün). | `d-20-hof-nordwand`, `c-20-hof-nordwand`, Unit-Tests „Wände liegen nur in den Lücken“, „Figuren an der Nordwand“ |
| 2 | erledigt | **Böden und Ausstattung je Raum** nach „Schild und Wirklichkeit“: jeder der 15 Räume hat Belag, Wandfront und 3–8 Requisiten-Arten (121 Teile, Tabelle unten). Requisiten sperren nichts und liegen nicht auf Laufwegen, Türen (±12 E), Übergängen, Kontrollpunkten, Packs (3 m, Schwärme 5 m), Bossplätzen (3,5 m), Streifenwegen und in Arenen nur am Rand (≤ 14 E zur Wand); geprüft mit der Wegsuche der Dungeon-Welt (43 Wege, alle Türen offen gedacht). Truhenplatz und Hinterausgang der Schatzkammer frei. | Prüfskript Teil 5, `npm run kit:check`, Unit-Test „Requisiten …“ |
| 3 | erledigt | **Ebenen wiedererkennbar:** Erdgeschoss Garage (Estrich mit Ölflecken und Stellplatzlinien, Kalksandstein, Neonröhren, Pappzinnen auf der Garagenwand, Mauerwerk als Masse), Keller 1 Partykeller und Büro (roter Teppich und Damast mit zwölf Ahnenbildern, Karofliesen, Lichterketten, Musikbox, Erdreich), Keller 2 Weinkeller und Basaltdom (Basaltplatten und -pflaster, Fackeln, Sprinklerrohr, Fassrinnen, Pappsäulen, Thron aus Bierkisten, Basalt als Masse). Das Kellerlicht aus Etappe 2 nimmt seine Lichtpunkte jetzt aus den Leuchten (Neonröhren, Fackeln, Lichterketten, Ringlicht, Musikbox, Tischlampen), große Hallen und Räume ohne Leuchte bekommen ein schwaches Grundlicht. | Vergleichsbilder je Raum |
| 4 | erledigt | **Eingang in der Welt:** Doppelgarage als Gebäude-Sprite der Sprite-Schmiede (100×44 E, Flachdach mit Pappzinnen, Wimpel, Satellitenschüssel, leeres Schild mit Glühbirnen, linkes Tor zu, rechtes halb offen), tiefensortiert wie die Häuser, mit Schlagschatten und ohne Grafikkarte mit eingebackener Farbabstimmung. Das Portal-Flimmern liegt im Spalt des rechten Tors, Schild „PRIVATBESITZ“ daneben. Zwei Bäume, deren Krone vor der Garage lag, fallen beim Weltbau weg (samt Kollision); der Eingangspunkt bleibt derselbe (Unit-Test). | `e-01-eingang-nah`, `e-02-eingang-weit`, `e-03-garage-nah`; Prüfskript Teil 2 (0 Baumkronen, vorher 1) |
| 5 | erledigt | **Geheimnisse:** Verborgene Räume gehören zur Masse – die Ebene mit verborgenem Wehrgang ist im Bereich des Wehrgangs pixelgleich mit einer Ebene ohne Wehrgang (0 abweichende Pixel). Die Pappwand ist vor dem Fund ein Stück Wand mit derselben Damast-Front und Krone wie die Galerie, danach eingedrückt mit Pappresten und Wendeltreppe. | Prüfskript Teil 4, `g-01`…`g-04` |
| 6 | erledigt | **Leistung:** Boden, Wände, Kronen, Bodendeko und stehender Wandschmuck je Ebene einmal in eine Leinwand (Neubau nur bei Ebenenwechsel, neu entdecktem Raum oder anderer Dichte; 5–25 ms). Je Bild eine Kopie des Ausschnitts, außerhalb der Leinwand nur die Randstreifen als Muster (anfangs eine zweite Vollbildfläche – die kostete bei Dichte 3 die Hälfte der Bildrate, siehe Messung). Bildfolgen (Fackel, Neonröhre, Wandlampe) und stehende Requisiten je Bild, Garage als ein vorbereitetes Zwischenbild. | Bildzeit unten |

## Räume

| Ebene | Schild | Wirklichkeit | Boden | Wand | Requisiten |
|---|---|---|---|---|---|
| E0 | Schlosshof | Doppelgarage mit Pappzinnen | `estrich` | Kalksandstein | Werkbank, Reifenstapel, Bierkästen, Sackkarre, Fahrrad, Eimer, Ölflecken, 3 Neonröhren · Stellplatzlinien, Pappzinnen |
| E0 | Zugbrücke | Kellertreppe mit Kette | `bretter-grau` | Treppenhaus | Stehpult (Stehtisch), Bierkästen, Eimer, Becher, Neonröhre, Hakenleiste · Treppenschacht mit Kette und Vorhängeschloss |
| E0 | Hofkanzlei | Büro im Anbau | `teppich-buero` | Raufaser | Aktenschrank, Schreibtisch mit Kaffeemaschine, Faxgerät und Tischlampe, Stuhl, Plastikpflanze, Ordnerregal |
| E0 | Wehrgang | Carport-Dach | `kies-hof` | Brüstung (12 E) | Regentonne, Gartenstuhl, Eimer, Leergut · Pappzinnen an der Dachkante |
| K1 | Ahnengalerie | Ringflur mit zwölf Big-B-Porträts | `teppichboden-rot` | Damast mit Holzvertäfelung | 12 Ahnenbilder (Locken, Zopf, Toupet), 5 Wandlampen |
| K1 | Rittersaal | Partykeller mit Styropor-Stuck | `partykeller-fliesen` | 70er-Tapete (geschnittene Wand) | Musikbox, Fass, Bierkästen, Sofa, Bierbank, Stehtisch mit Bierkrug, Luftschlangen · 2 Lichterketten |
| K1 | Stallungen | Heizungskeller mit Schaukelpferd | `estrich` | Ziegel | Heizkessel, Schaukelpferd mit Hafersack, Eimer, Regalbrett |
| K1 | Burgverlies | Waschküche | `fliesen-weiss` | Waschküchen-Fliesen | Waschmaschine, Waschbecken, Eimer, Pfütze, Hakenleiste |
| K1 | Presseamt | Content-Studio mit Greenscreen | `dielen-hell` | Studio-Weiß | Greenscreen, Ringlicht, Palettensofa, Plastikpflanze |
| K1 | Musterwohnung | Kellerabteil mit Laminat | `laminat` | Streifen | Sofa, Kommode mit Duftstäbchen und Tischlampe, runder Tisch, Plastikpflanze, Läufer |
| K2 | Weinkeller | echter Basaltkeller | `basalt-quader` | Basalt | 3 Weinfässer, Bierkästen, 2 Tetrapak-Kisten, 2 Fackeln · Sprinklerrohr |
| K2 | Gewölbegänge | alte Basaltgänge | `basalt-pflaster` | feuchter Basalt | 3 Pfützen, Weinfass, Tetrapak-Kiste, Bierkästen, 3 Fackeln |
| K2 | Kelterhalle | Gewölbe mit Fassrinnen | `basalt-quader` | Basalt (12 E) | 4 Weinfässer, Tetrapak-Kiste, Eimer · drei Fassrinnen |
| K2 | Thronsaal | echter Basaltdom, mit Pappe verkleidet | `basalt-quader` | Basalt mit Pappbahnen | Thron aus Bierkisten, 2 Pappkulissen „Burgmauer“, roter Läufer, 5 Pappsäulen, 2 Basaltsäulen, 2 Fackeln, Bierkästen |
| K2 | Schatzkammer | Abstellraum | `bretter-staubig` | Beton (12 E) | Bierkästen, Tetrapak-Kiste, goldlackierte Kronkorken, Eimer · Mitte frei für die Endtruhe |

## Neue Grafiken

Alle über die Sprite-Schmiede (E-58, reproduzierbar, Palette, keine Bild-KI), Modelle in `tools/sprite-forge/models/dungeon-*.mjs`,
Arten in `content/sprite-kit.js` (Block „Dungeon Schloss Big B“), Bilder in `assets/forge/runtime/kit/`. Keine Figuren.

- **Beläge (5):** `partykeller-fliesen`, `laminat`, `teppich-buero`, `basalt-quader`, `basalt-pflaster`
- **Bodendeko (2):** `oelfleck`, `kronkorken-gold`
- **Tischdeko (3):** `kaffeemaschine`, `faxgeraet`, `duftstaebchen`
- **Wandschmuck (6):** `neonroehre` (4 Bilder), `fackel` (6 Bilder), `ahnenbild`, `ahnenbild-zopf`, `ahnenbild-toupet` (nur Schattenriss mit Perücke, kein Gesicht), `ordnerregal`
- **Möbel und Kulissen (16):** `werkbank`, `reifenstapel`, `heizkessel`, `schaukelpferd`, `waschmaschine`, `greenscreen`, `ringlicht`, `palettensofa`, `zimmerpflanze`, `musikbox` (4 Bilder), `weinfass`, `tetrapak-kiste`, `bierkisten-thron`, `pappkulisse`, `basaltsaeule`, `pappsaeule`
- **Gebäude (1):** `garage-schloss`
- **Im Code gezeichnet (keine Bilder):** Masse-Kacheln Mauerwerk/Erdreich/Basalt, 14 Wandfront-Maler, Kronen, Pappzinnen, Stellplatzlinien, Fassrinnen, Sprinklerrohr, Treppenschacht mit Kette, Leiter, Lichtschacht, Wendeltreppe, Getränkeaufzug, Türblätter, Rolltor mit Tageslicht, Lichterketten.

Die Modelle entstanden in drei parallelen Schmiede-Aufträgen mit je 4–10 Runden „ansehen, schärfen“ (Kontaktbögen unter
`visual-review/forge/`); Nachbesserung auf Sicht im Spiel: `basalt-quader` ohne diagonale Bruchplatten (bildeten im Thronsaal ein
Schrägmuster), Säulen für den Basaltdom nachbestellt.

## Iterationen (Bilder selbst angesehen)

1. **Runde 1** (`r1`): Masse als Mauerwerk zu hell und zu grob (las sich als Ziegelwand von vorn); fehlende Bilder zeichneten
   Platzhalter; Treppe sah aus wie eine Kiste. → Masse dunkler, größere Blöcke, nahtlose Rauschperioden; Treppenschacht mit Wangen,
   Handlauf, Kette und Schloss.
2. **Runde 2** (`r2`, `r2b`): Bildrate bei Dichte 3 halbiert (33 ms): außerhalb der Leinwand füllte ein Muster die ganze Sicht, dann kam
   die Kopie – zwei Vollbildflächen. → nur Randstreifen füllen, danach 16,7 ms. Geheimnis-Prüfung schlug an (7050 Pixel), weil die
   Leinwand je nach sichtbaren Räumen anders groß war. → Ausdehnung immer die ganze Ebene.
3. **Runde 3** (`r3`, `r4`): Beläge im Spiel; Thronsaal leer und mit Schrägmuster im Boden. → Basaltplatten neu, sieben Säulen
   (Pappe/Basalt) an den Seiten, Wandlampen zwischen den Ahnenbildern, Tischlampen, Grundlicht für große Hallen.
4. **Runde 4** (`r5`, `nachher`): Garage wirkte blass neben den Häusern → mit eingebackener Farbabstimmung wie die Häuser, Portal in den
   Torspalt; Plaketten lagen bei geschnittenen Wänden wie Fußmatten auf dem Boden → auf die Wand.

(Bildzeit, Prüfungen und Rest folgen.)
