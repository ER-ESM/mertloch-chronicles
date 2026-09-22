# Berufsfiguren und Weltauflösung · 22.09.2026

## Befund und Korrektur

Am Braugarten wurde die große Gisela-Grafik ohne Anpassung an die NPC-Größe gezeichnet. Der Berufsstand verwendet weiterhin die bekleidete Grafik, skaliert sie aber anhand der gelieferten Assethöhe auf `WORLD_SCALE.npc` (26 Welteinheiten). Gleiches gilt für den Werkhof. Die Auswahl liegt jetzt in `PROFESSION_STATIONS.look`; die Namensschilder stehen passend über den kleineren Figuren. Andere Verwendungen der Grafiken, insbesondere Bosse, ändern ihre Größe nicht.

Die automatische Leistungsregelung konnte die Weltfläche nach einigen langsamen Bildern bis auf Dichte 1 absenken. Bei Standardzoom 2 wurde anschließend jedes Canvas-Pixel auf 2 × 2 CSS-Pixel vergrößert; Welt und eingebrannte Beschriftungen wirkten plötzlich grob. `worldDensity` schützt nun mindestens Dichte 2 und bei höherem Zoom mindestens die benötigte CSS-Auflösung (innerhalb der maximalen Grafikdichte 4). Auch alte niedrigere Caps werden begrenzt. Die Regelung reduziert weiterhin zuerst den Farbfilter und gegebenenfalls zusätzliche HiDPI-Pixel. Auf schwachen Geräten kann die höhere Mindestauflösung Bildrate kosten; volle Dichte 4 wird nicht pauschal erzwungen.

## Reproduzierbare Prüfung

- `tests/quality-governor.test.mjs`: Lastphasen, Rückkehr zu höherer Qualität, alte Caps, mehrere Zoomfaktoren und Pixeldichten; Renderer darf nicht unter die neue Grenze sinken.
- `node scripts/world-clarity-check.mjs`: echte Browserdarstellung beider Berufsstände, gemessene Sprite-Zielgröße sowie längere simulierte Last bei Standardzoom, maximalem Zoom und DPR 1/1,5/2. Screenshots und Messwerte unter `visual-review/world-clarity/`.

Der eigene Spielserver wird durch einen Git-Push nicht aktualisiert; dort muss der neue Client-Build separat ausgeliefert werden.
`npm test`: 675/675 bestanden. Inhaltsprüfung, Build und Browserprüfung erfolgreich. Beide Berufsfiguren messen sichtbar 26 Welteinheiten; bei Zoom 2 bleibt die Dichte mindestens 2, bei Zoom 3,6 mindestens 4.
