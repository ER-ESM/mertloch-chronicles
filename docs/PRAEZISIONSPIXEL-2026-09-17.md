# Präzisionspixel – 17. September 2026

Der Nutzer bevorzugt den feineren, klar lesbaren Comic-Pixellook. Dieser Vertrag ersetzt für neue Lieferungen die alte Begrenzung auf 52 Körperpixel und 40 Farben. Alte Kataloge bleiben als reproduzierbare Vergleichsstände erhalten.

## Verbindlicher Export

- Laufzeitkatalog: `assets/precision/runtime/catalog.json`.
- Erwachsene: 104 native Körperpixel bei weiterhin 26 Welteinheiten. Vier native Pixel je Welteinheit; keine Änderung von Kollision, Türen, Gehgeschwindigkeit oder Kamera-Zoom.
- Standardzelle 192 × 192, Fußpunkt 96/160. Abweichende Bosszellen stehen im Katalog.
- Kleine Tiere behalten ihre eigenen Welthöhen. Nicht alle Figuren auf die gleiche Bounding-Box strecken.
- Skills und allgemeine Gegenstandsicons 64 × 64; die überarbeiteten 18 kleinen Gegenstandsmotive mindestens 48 × 48; Proc-Talente 96 × 96. Ziel ist Lesbarkeit bei echter Anzeigegröße.
- Flächengewichtetes Sampling aus dem detaillierten ORIGINAL, vormultipliziertes Alpha, anschließend harte Alpha-Kante und definierte Farbrampen. Alte kleine Exporte hochzuskalieren erzeugt keine Details.
- `art-quality.js`: gemeinsame warme Farbanker plus Zwischenstufen. Baum-/Hausimporte behalten die bereits vorhandenen verwandten Weltrampen.
- Alte Ausrüstungssockets bleiben logisch im 96er-Rig. `gearScale:2` registriert sie auf dem neuen Bogen. Laufphasen richten sich nach Weltstrecke, niemals nach neuer Bitmaphöhe.
- Weltcanvas, Haus- und Objektcaches zeichnen mit Dichte 4. Terrainflächen behalten Dichte 2: sie sind großflächige prozedurale Bodenfüllungen, keine Figurensprites. Cachelimits wurden wegen größerer Flächen reduziert.

## Lieferumfang und Abdeckung

339 Laufzeitassets: sämtliche bisherigen Figuren, Richtungs-/Laufbögen, benannten Anlaufstellen, Bewohner, Gegner, Bosse, Kapitelrequisiten, Reiter/HUD-Motive, 90 Talente, 48 Skill-/Spezialisierungsmotive plus drei Autoangriffe, Gegenstandsicons und kombinierbare Ausrüstungsteile.

Neu generiert: Kegler, JGA-Gegner, Kurt, Kalle, Sigi, Klaus, Timo, Katze, Huhn und Lagerfeuer. Porträts der neuen Menschen werden aus ihren eigenen Bögen gewonnen. Bastian ist in den Inhaltsdaten ausdrücklich abwesend; sein bestehendes Erinnerungsbild bleibt erhalten. Die bereits detaillierten Erinnerungsillustrationen bleiben unverändert.

Die tatsächlich vorhandenen NPCs, alle Gegner-/Boss-IDs, alle registrierten Itemicons und Skills sowie jedes Talent werden automatisch gegen den neuen Katalog geprüft. Alte Renderer bleiben ausschließlich als Fehler-Fallback erhalten. Archivgalerien zeigen absichtlich alte Vergleichsstände.

## Visuelle Befunde und Korrekturen

1. 52-px-Figuren waren trotz großer Originale körnig, Gesichter gingen verloren. Neu aus den Originalen exportiert: Augen, Nase, Ärmel, Hände und Schuhformen deutlich lesbarer.
2. Skills wurden durch `styleIcon` auf 32 px verkleinert und danach hochgezogen. Präzise Icons umgehen diesen Weg.
3. Ausrüstung und Inventarbilder verwenden dieselben hochauflösenden Originalteile. Der HUD-Porträtpuffer wurde verdoppelt, seine sichtbare Größe bleibt gleich.
4. Falsches Megafonmotiv (Sprühflasche) ersetzt; bei allgemeinen UI-Icons Komponenten statt starrer Zellränder verwendet, um Nachbarfragmente zu vermeiden.
5. Generierte Kurts hatten doppelte Besenköpfe, Kegler zusätzliche Kugeln. Gezielte Bildkorrekturen und anschließendes Neuordnen mit Abständen; Quellen einschließlich verworfener Zwischenstände dokumentiert.
6. Hinteransichten des Huhns nachbearbeitet. Vier Richtungen und stabile Fußpunkte werden getrennt von gut aussehenden Einzelbildern beurteilt.

## Reproduzieren und prüfen

```sh
node tools/sprite-pipeline/build-precision.mjs
node --test tests/art-precision.test.mjs
npm test
npm run build
```

`art-precision.html` zeigt Alt/Neu bei gleicher Weltgröße, Richtungswahl und animierte Posen. `tools/sprite-pipeline/review-precision.browser.js` prüft Laden aller Assets, Bewegung aller drei Klassen, Ausrüstung in vier Ansichten und mobile Darstellung in einem isolierten Browserkontext. Screenshots liegen unter `visual-review/precision-*.png`; ausgewählte Abnahmebilder unter `assets/precision/review/`.

Automatik prüft IDs, Quellen- und Exporthashes, harte Transparenz, Palette, Ränder, Maße, einzigartige Skillmotive und bytegenaue Reproduzierbarkeit. Sie bewertet keine Anatomie und keine gute Animation. Dafür immer Original, nativen Export, Bewegungsfolge und tatsächliche Spielsituation ansehen.

## Hinweise für weitere Sitzungen

- Generierte Raster sind keine garantierten Schnittgrenzen. Zusammenhängende Figuren erkennen; überlappende Posen im Original korrigieren. Ein größerer Export repariert keine abgeschnittene Hand.
- Quellen, exakte Prompts, verwendete Referenzen und Toolherkunft in `assets/precision/generation.json`; ausgewählte Originale in `assets/precision/sources/`. Das Tool legt seinen Modellnamen nicht offen.
- Kleine Icons brauchen zuerst eine klare Silhouette. Zusätzliche feine Pixel dürfen die Bedeutung nicht verdecken.
- Geprüfte Skill-/Itemmotive und Ausrüstungsteile wiederverwenden. Benannte Figuren behalten ihre Identität; die bestehende modulare Bewohnerbibliothek ist ein separater Prototyp und kein Ersatz für vollständige Heldenanimation.
- Native Auflösung und CSS-Größe unterscheiden. 104 Körperpixel bedeuten bei Desktopzoom 2 ungefähr 52 CSS-Pixel. Auf Displays mit höherer Pixeldichte bleiben mehr echte Details erhalten.
- Nur Runtime-Dateien in den Offline-Cache aufnehmen, niemals Quellen, verworfene Generationen oder Reviewbilder.
## Abschließende Abnahme

Nach Zusammenführung mit dem parallelen UI-Stand `58ac284`: 331 Tests erfolgreich, Produktionsbuild erfolgreich. Browser: alle 339 Assets geladen, alle drei Klassen bewegt, vier Ausrüstungsansichten geprüft, Touchmodus bei 390 × 844 und Pixeldichte 2 geprüft, keine Lade- oder JavaScriptfehler. Die separate neue UI-Bedarfsliste für zusätzliche Rahmen und Stofftexturen bleibt ein weiterer Gestaltungsauftrag; die hier bereits vorhandenen Sprites sind vollständig umgestellt.
