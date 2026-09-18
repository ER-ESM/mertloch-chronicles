# Detaillierte Themen-Demo · Hopfen, Zitrus & Pfand

Der Nutzer hat die Detailqualität des Kasten-Rigs gegenüber den bestehenden Pixelhelden abgelehnt. Diese Lieferung erstellt deshalb drei ausgearbeitete Themenlooks als eigenständige visuelle Demo: [theme-demo.html](../theme-demo.html). Die bisherige technische Rig-Demo verlinkt diese neue Ansicht.

## Lieferung

- **Dosen-Dieter / Hopfen & Hämmer:** Bierkrug-Hammer, Fassschild mit Messinghahn, Kupferschultern, Hopfen, Lederschürze und Rückenfass.
- **Aperol-Anni / Zitrus & Zauber:** Kupfersprüher, Zitrus-Glasschild, Reservoir mit Schlauch, Blumenbluse, bestickte Schürze und Elixiere. Gesicht, Haar und Sonnenbrille orientieren sich am vorhandenen Anni-Original.
- **Klo-Kevin / Pfand & Präzision:** mechanische Pfandschleuder, Flaschenträger, Kronkorken-Schulterteile, Denim, Cargo-Taschen, Karabiner und Werkzeuge.

Jeder Look hat vier ausgearbeitete Ansichten (SE, SW, NE, NW). Die Seite zeigt alle drei Figuren groß, Gear-Detailausschnitte, eine drehbare Ansichten-Auswahl, eine Dorfkomposition mit vorhandenen Weltassets und die bisherigen Pixelhelden unmittelbar neben den neuen Themensets bei gleicher nativer Höhe. PNG-Downloads für Kollektion und Dorfansicht sind eingebaut.

## Dateien und Herkunft

Die neuen Bildmotive wurden mit dem **eingebauten Imagegen-Werkzeug** erzeugt. Referenzen: `assets/content-art/aperol-anni/hero.png` und `assets/precision/review/precision-gear.png`. Die bestehenden Originale wurden nicht verändert.

- [Generierungsprotokoll mit vollständigen Prompts](../assets/theme-demo/generation.json)
- Originale: `assets/theme-demo/sources/{dieter-braumeister,anni-aperol,kevin-pfand}.png`; tatsächliche Prompts daneben als `.prompt.txt`.
- Runtime: zwölf transparente Detailansichten, drei Sprite-Bögen und [Katalog](../assets/theme-demo/runtime/catalog.json).
- Reproduzierbarer Import: `node tools/prerender/build-theme-demo.mjs`.
- Bildnachweise: [Kollektion](../assets/theme-demo/review/kollektion.png), [Rückseiten](../assets/theme-demo/review/kollektion-ruecken.png), [Dorf im Detail](../assets/theme-demo/review/dorf-detail.png), [Dorf im Spielmaßstab](../assets/theme-demo/review/dorf-spielmassstab.png), [Pixelvergleich](../assets/theme-demo/review/pixelvergleich.png), [Desktop](../assets/theme-demo/review/desktop.png), [Mobil](../assets/theme-demo/review/mobile.png).

Die Importfunktion verwendet die vorhandene Präzisionspalette und flächengewichtetes Sampling. Ein fester Skalierungsfaktor gilt pro Vierer-Bogen. Die erste Ansicht hat 104 Körperpixel bei 26 Welteinheiten; kleine Unterschiede der gezeichneten Rückansichten bleiben erhalten (101–105 Pixel), statt jede Richtung separat zu strecken. Ausgabeframes: 192 × 192, Fußpunkt 96/160, harte Alpha-Kanten. Quellenhashes und tatsächlich verwendete Zuschnitte stehen im Katalog.

Der normale Site-Build liefert die Seite und Assets mit aus. Der Offline-Cache nimmt ausschließlich die Runtime-Dateien auf, keine Quellen oder Reviewbilder. Lokal: `npm start`, dann `http://localhost:4173/theme-demo.html`; in dieser Sitzung zusätzlich Port 4283.

## Einordnung für die Spielintegration

Diese Lieferung ist eine ausgearbeitete **visuelle Themen-Demo aus Rastermotiven**, keine neue 3D-Modelllieferung. Gear ist in den neuen Ansichten Teil des Figurenbilds, die Ausschnitte in der Detailgalerie sind keine freigestellten Ausrüstungsebenen. Der Katalog markiert ausdrücklich `animated:false` und `modularGear:false`. Es gibt keine erfundenen Laufbilder, keine kosmetische Umdeutung der Bilder als GLB-Rigs und keine Änderung der tatsächlichen Spielstände, Item-Stats oder bestehenden Heldenrenderer.

Die zusätzlichen Ausrüstungsnamen sind Beschriftungen dieser Art-Demo, keine neu eingeführten Loot-IDs. Für die austauschbare 3D-Pipeline bleibt die Modellierung und das Rigging dieser Formen einschließlich korrekter Griffpunkte, Gear-Verdeckung und echter Lauf-/Kampfposen ein weiterer Umsetzungsschritt. Die Darstellungen aus dieser Lieferung können dabei als konkrete visuelle Vorgabe dienen.

## Validierung

Abschlussprüfung: `npm test` **381/381 erfolgreich**, `npm run build` erfolgreich, `git diff --check` ohne Befund.

Die drei neuen Node-Tests prüfen Quellen/Prompts, vier individuelle Ansichten je Thema, harte Transparenz, freie Frame-Ränder, festen Maßstab und bytegenaue Wiederholbarkeit des Exports. Browserprüfung über `tools/prerender/review-themes.browser.js`: alle 18 benötigten Figurenbilder geladen, zwölf Themen-/Richtungskombinationen, Gear-Auswahl, PNG-Downloads, Ansichtswechsel und 390 × 844 ohne horizontalen Überlauf; keine JavaScript- oder HTTP-Fehler. Desktop und Mobilansicht sowie Pixelvergleich und Gear-Details wurden visuell geprüft.

Die feinen Gravuren und Nähte sind in den Originalen und Detailansichten deutlich. Im Spielmaßstab bleiben vor allem Gesicht, Farbgruppen, Ausrüstungssilhouette und größere Materialkanten erhalten; die Seite zeigt diese Größenwirkung ausdrücklich nebeneinander.
