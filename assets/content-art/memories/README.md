# Filmriss: Erinnerungsbilder

Zehn fertige Illustrationen für die zehn bestehenden IDs aus `content/memories.js`. Neun Einzelbilder, ein zweiteiliger Comic (`wurst-ins-gesicht`). Keine neuen Ereignisse, Dialoge oder Freischaltungen.

- Spielgrafiken: `<id>.png`, 768 × 512, zusammen 1.4 MB.
- Originale: `sources/`, 1536 × 1024. Der erste Kastenturm wurde wegen fünf statt sieben Kästen und unnötiger Beschriftungen durch `kastenturm-v2.png` ersetzt.
- Tatsächliche Prompts, Referenzen, ursprüngliche Dateinamen: `generation.json`. Erzeugung über das eingebaute Imagegen-Werkzeug; dessen Modellbezeichnung wurde nicht offengelegt.
- `catalog.json`: ausgewählte Originale, Ausgabegröße, Bildtyp und SHA-256-Prüfsummen.
- Export: `node tools/sprite-pipeline/build-memories.mjs`.
- Integration: `memory-art.js`, `chapter-ui.js`, `app.js`, `akt1.css`, `popup-windows.js`.

## Fortsetzen

Neue Erinnerung zuerst gegen ihre vollständige Story und den Hinweis prüfen. Gesicht des Fremden nicht festlegen, unbekannten Kisteninhalt nicht zeigen. Für einen ganzen Ablauf höchstens zwei klar getrennte Panels; Text bleibt außerhalb des Bildes lesbar und übersetzbar.

Die erste Szene dient als Stilreferenz. Sie darf nicht ungewollt ihre Personen, Requisiten oder Umgebung in jede weitere Szene übertragen. Bekannte Figuren gegen die bestehenden Figurenreferenzen prüfen. Keine zusätzlichen Werbesprüche; nur ausdrücklich benötigte Schrift wie GAME OVER und KOBLENZ HBF. Gegenstände zählen und ihre Handlung kontrollieren: sieben Kästen, Festnetz mit Kabel, blauer Stempel, verschlossene Kiste.

Die 40 Maifeld-Farben werden ausschließlich für diese großen Illustrationen um acht Blautöne ergänzt. Ohne diese Erweiterung wird die für den Text wesentliche blaue Tinte zu graugrünem Schiefer. Welt-Sprites und ihre Palette bleiben unverändert. Export mit festem 2:1-Nearest-Neighbour-Sampling, ohne Weichzeichnen, transparente Kanten oder Sepiafilter.

Neue ID in `memory-art.js` aufnehmen, exportieren, `node --test tests/memory-art.test.mjs` ausführen. Die Abdeckung ist an die tatsächlichen Story-IDs gekoppelt und meldet später hinzugefügte Erinnerungen ohne Bild. Browserprüfung: `tools/sprite-pipeline/review-memories.browser.js`. Echte Exportbilder bei Desktop- und Handygröße ansehen, nicht nur hochauflösende Originale.

Nur die zehn Spielgrafiken kommen in den Offline-Cache; Quellen, Prompts und Reviewbilder bleiben außerhalb. Die Bilder werden in gesperrten Erinnerungen weder als Bild noch als Alternativbeschreibung ins DOM geschrieben. Das ist die Spoilergrenze der Oberfläche, keine Zugriffssperre für die öffentlichen Asset-Dateien.
