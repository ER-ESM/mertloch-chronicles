# Mount-Sprites

Originale Modelle für dieses Repository: Klappermofa, alter Blechroller und Hofpferd. Keine heruntergeladenen Fahrzeug-/Tiergrafiken und keine zusätzlichen Drittanbieter-Assets.

- Modellquellen: `tools/prerender/mount-models.js`.
- Export: `tools/prerender/mount-render.html`, vorhandenes gebündeltes Three.js, Licht aus `tools/prerender/stage.js`, `PRECISION_PALETTE` aus `art-quality.js`.
- `npm run mounts:build` erzeugt `runtime/*.png` und `runtime/catalog.json` reproduzierbar über einen isolierten lokalen Browser.
- Je Modell 4 Richtungen × 9 Bilder, 256 × 256 Pixel je Bild; 4 Pixel pro Welteinheit, Bodenanker (128,224).
- `catalog.json` enthält Sitz-, Hand-, Hüft-, Knie- und Fußanker je Bild. Die Blickrotation ist an die bestehenden Redesign-Helden angepasst; die Renderfläche lässt Platz für Pferdekopf und Ohren.
- Der Reiter entsteht zur Laufzeit aus den vorhandenen Helden-/Kleidungsassets, siehe `mount-art.js`. Diese ursprünglichen Assets behalten ihre bestehende Herkunft/Lizenz. Ausgerüstete Waffen erscheinen während der Reise nicht in den Händen.
- `node scripts/mount-art-check.mjs` rendert eine Kontrollübersicht nach `visual-review/mounts/contact-sheet.png`.

Die veröffentlichten PNGs sind unter 0,5 MB zusammen; Quellen und Werkstatt werden nicht für das Spielen benötigt.
