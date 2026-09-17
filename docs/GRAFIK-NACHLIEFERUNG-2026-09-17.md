# Grafik-Nachlieferung · 2026-09-17

Die in `GRAFIK-BEDARF.md` gemeldeten Lücken sind geliefert und an den Renderer angebunden.

## Lieferung

- `ui-tab-bude`: eigener 24×24-Reiter, Bretterbude mit Kasten; verwendet in Reiter und Fenstertitel.
- Anni: neuer Posenbogen und eigener Laufbogen, jeweils 8 Spalten × 4 Richtungen; 96×96-Zellen, 52 native Pixel Körperhöhe = 26 Welteinheiten, Fußpunkt 48/80. Leere Hände für bestehende Ausrüstungsebenen.
- Ruhewärter, Dachs, Gans und Pfandkeiler: je ein Richtungsbogen mit Stand/Schritten/Angriff sowie ein separater Laufbogen mit acht Phasen je Richtung. Menschen- und Tiermaßstäbe bleiben getrennt.
- Pit: eigener Weltbogen und daraus geschnittenes 48×48-Porträt. Dasselbe Gesicht in Dialog und Welt; zusätzlich Zelle 15 im erweiterten 4×5-Dialogatlas. Die bisherigen zwölf Porträtzellen bleiben bytegleich.
- 19 Kulissen-Arten: Schrottplatz, Kegelbahn-Trümmer, Partybus, Kiosk mit Stehtisch/Wett-Tafel und Bude mit sechs Ausbauteilen sowie Trümmern.

## Einbindung und Dateiverträge

Verbindlich ist `assets/content-art/handoff-catalog.json`. Laufzeitdateien liegen unter `heroes/`, `enemies/`, `npcs/`, `portraits/`, `props/` und `ui/`. Der Katalog enthält jetzt insgesamt 120 Einzelassets und 1.180 Figurenframes, ohne fehlende Aufträge. `contentActor()` berücksichtigt separate Laufbögen auch für Gegner. Die Animation folgt weiterhin der zurückgelegten Strecke.

`world-prop-ui.js` liest die vorhandenen `world.camps[].props`, `world.places.kiosk.props` und genau die aktuelle Stufe aus `world.base.stageProps`. Die zwischenzeitlich parallel ergänzte Kulissen-Anbindung wurde übernommen und um den Sprite-Maßstab ergänzt; der bestehende Ersatzkörper bleibt für fehlende Grafiken erhalten. Keine zusätzlichen Platzierungen oder Kollisionskörper. Die Zeichenliste sortiert Kulissen zusammen mit Figuren nach ihrer Bodenkante; transparente PNGs bleiben ungeglättet. Ausbauvarianten wachsen gemäß bestehenden Weltmaßen; sie erhalten keine neue Bau-Mechanik.

Pits eigenständiges Porträt wird offline mitgeladen. Der Atlas wird aus der technischen Sicherung `sources/2026-09-17/dialogue-atlas-before-gap.png` erweitert. Diese Sicherung ist keine neue Generierung. Die anderen noch unbelegten Porträtzellen, insbesondere Kurt/Timo, sind nicht Bestandteil dieser Nachlieferung.

## Herkunft und Reproduktion

33 Imagegen-Ergebnisse einschließlich verworfener Anni-Laufversionen. Tatsächlicher Prompt, Referenzen, unverändertes Original und SHA-256 stehen in `assets/content-art/generation-2026-09-17.json` sowie den JSON-Dateien neben den Originalen. Die Modellversion ist vom eingebauten Werkzeug nicht ausgewiesen. Ein identischer Prompt garantiert keine identische Generierung; der technische Export ist deterministisch.

`node tools/sprite-pipeline/build-handoff.mjs` reproduziert alle Exporte. Annis Lauf verwendet `anni-walk-v3.png`: Version 1 hatte zu ähnliche Phasen, Version 2 berührte benachbarte Zeilen. Version 3 hat getrennte Silhouetten. Originale bleiben zur Nachvollziehbarkeit erhalten. Der Export normalisiert Palette, Alpha, Maßstab und Registrierung, zeichnet aber keine fehlenden Posen hinzu.

## Abnahme

- Vollständiger Testlauf nach Zusammenführung der parallelen Änderungen: **313 Tests bestanden**. Vier zusätzliche Regressionstests prüfen Kulissen-Abdeckung, Auswahl der Baustufe, Richtungs-/Laufzuordnung und Pits Atlaszelle.
- Galerie im Browser: Desktop und 390×844, alle Richtungen/Zustände, keine fehlenden Dateien, keine JavaScript-Fehler und kein horizontaler Überlauf.
- `review-gaps.browser.js`: tatsächliche Spielwelt an Bude (Trümmer/Maximalstufe), Kiosk und drei Kapitel-Bosslagern; Anni gewechselt und per Tastatur bewegt. Für die Ortswechsel wird nur im isolierten Testkontext teleportiert und die Kamera nachgesetzt. Der Tutorialabschluss im Test ist keine Änderung am Spielerfortschritt.
- Visueller Vergleich der nativen Exporte und aller acht Laufphasen: freistehende Silhouetten, erkennbare Tierarten, ruhige Körperregistrierung, gemeinsame Farbpalette. Die acht Bilder sind eine stilisierte Laufanimation; daraus folgt keine pauschale Abnahme sämtlicher vorhandener Animationen des Spiels.

## Hinweise für weitere Sitzungen

Im eigenen Checkout `git pull --ff-only` ausführen. Die Renderer-Anbindung dieser Nachlieferung ist bereits enthalten. Keine zweite Kulissen-Zeichenroutine daneben anlegen. Neue Props brauchen eine bestehende Welt-Art samt Grundfläche/Zeichenhöhe; Registrierung an der Bodenkante statt Zentrierung verhindert schwebende Möbel. Bei Figuren zuerst die tatsächlichen Alpha-Abstände prüfen: ein korrekt wirkendes 8×4-Raster im Prompt reicht nicht. Benannte Porträts möglichst aus derselben Charakterquelle gewinnen.
