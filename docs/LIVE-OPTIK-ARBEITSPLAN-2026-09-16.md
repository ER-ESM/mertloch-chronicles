# Durchgängige Maifeld-Optik und sichtbare Ausrüstung

Aktiver Auftrag: den gewählten Detailpixel-Stil im Hauptspiel veröffentlichen, Ausrüstung sichtbar machen und wiederholt visuell prüfen. Subjektive Perfektion ist kein überprüfbarer Abschluss; Maßstab, vollständige Abdeckung und reproduzierbare Bildprüfungen sind die Abnahme.

## Ausgangsbefund

- Hauptspiel zeichnet Personen über `pixel-people.js` und die alten Maifeld-Atlanten; Hofprobe verwendet neuere Richtungsatlanten und ein separates Eber-Rig.
- Angelegte Ausrüstung verändert Werte und Voraussetzungen, aber keine Weltfigur. Charakterfenster und Porträt kennen den Ausrüstungszustand nicht.
- Mischungen aus geglätteten Originalbildern, Code-Pixelgrafik und unterschiedlichen Größen bleiben sichtbar.
- Tiere mit Varianten (Fuchs/Rabe) verwenden bislang Dachs/Gans als Ersatzgrafik.

## Iterationen und Abnahme

1. Gemeinsames Charakter-Rendering, alle drei Helden und aktive NPC-/Gegnertypen; echte Vorder-/Rückenansichten und stabile Animationen. Porträts aus derselben Identität.
2. Sichtbare Ausrüstung: 1H+Schild, zwei 1H, 2H ohne Schild, Fernkampf sowie Kopf, Brust, Schultern, Hände, Gürtel, Beine, Schuhe und kleine Accessoires. Ablegen, Tauschen, Klassenwechsel und Neuladen konsistent. Körpergebundene Ebenen folgen den Posen.
3. Umgebung: Palette, Pixeldichte, Türenmaßstab, Straßenränder, Schatten und Verdeckung. Keine bewegten Tannen. Alle aktiven grafischen Familien ausdrücklich prüfen.
4. UI: konsistente Icons, lesbare Menüs/Tooltips, Charaktervorschau; Desktop und Touch.
5. Browser-Spielrunden: Tutorial, Ausrüstungswechsel, Bewegung in vier Richtungen, Kämpfe, NPC-Gespräch, Inventar/Charakter und Karte. Vorher-/Nachher-Bilder, konkrete Befunde und Korrekturen dokumentieren.
6. Automatisierte Prüfungen und Build; veröffentlichen; öffentliche Version erneut im Browser prüfen.

## Status

Implementiert für Version 0.19.0. 188 automatisierte Tests bestanden; Site-Build erfolgreich. Veröffentlichung und abschließende Prüfung der öffentlichen URL folgen.

### Durchgeführte Bild- und Spielrunden

| Runde | Prüfung / Befund | Korrektur / Ergebnis |
| --- | --- | --- |
| 1 | Hauptspiel und Charakterfenster; lokaler Service Worker lieferte zunächst alte Dateien | Frische isolierte Browserkontexte ohne Service Worker für reproduzierbare Entwicklungstests. Drei Helden und benannte Bewohner im Hauptspiel integriert. |
| 2 | Welt und Figuren nebeneinander: geglättete, stark gesättigte Umgebung; alte Ausrüstungsicons | Gemeinsame Palette und Pixelraster. Für Landschaft zusätzliche aus der Palette abgeleitete Zwischenfarben, damit Stein und Laub nicht grob posterisieren. |
| 3 | Vergrößerte Vorder-/Rückenansichten aller Helden und sieben Tiere | Fuchs und Rabe erhalten eigene Körper. Stabile Rümpfe und unabhängige Beine für Dachs, Fuchs, Katze, Gans, Rabe und Huhn. Start/Stop wird überblendet. |
| 4 | Alle 16 Slots, Schild → Zweihand → zwei Einhandwaffen, Jackentausch, Neuladen über echte Menüs | Änderungen erscheinen in Welt, HUD und drehbarer Charakteransicht. Nebenhand verschwindet bei Zweihand. Kleidung und Waffengriffe folgen den Posen. |
| 5 | 48 Laufbilder und sechs Angriffsbilder mit Ausrüstung; Anni-/Kevin-Wechsel, Ida-Dialog, Weg ins Dorf und Kampf | Großer Hammer verdeckte Gesichter: kleinerer Kopf, gedrehter Tragewinkel und korrigierter Griffpunkt. Gegner-Trefferreaktion vom eigenen Angriff getrennt. Gans per Tab/Auto/Fähigkeiten besiegt; 300 Schaden, ein Kill. Karte geöffnet und geprüft. |
| 6 | Touch mit 390×844 und 844×390, Geräteerkennung, Helm ablegen und nach Reload prüfen | Alte Mobile-Regel versteckte die Figur: eigener Reiter „Figur“ ergänzt. Vorschau und Drehen im Hoch-/Querformat erreichbar; Fenster bleibt im Viewport; Spiel läuft weiter. |

### Abdeckung und technische Grundlage

- Drei Helden: 192 registrierte Bilder (je 32 Grundposen und 32 Laufphasen). Leere Hände in den Grundbildern; vorhandene Fähigkeiten behalten ihre Regeln.
- 26 weitere Identitäten: alle benannten Dorfbewohner, acht Passanten, Ruhewart/Schnorrer/Praktikant, Horst, Gisela und ein eigener Pfandautomat. Je gezeichnete Vorder- und Rückenansicht, horizontale Spiegelung; Passanten laufen mit kleinen, distanzgesteuerten Fußbewegungen.
- Sieben Tierarten einschließlich des zuvor abgenommenen Eber-Rigs. Vier Körperansichten; vier bewegliche Beine bei Vierbeinern, zwei bei Vögeln. Elite-Eber bleibt über Größe, Markierung und Namen unterscheidbar.
- 40 kombinierbare Ausrüstungsteile. Alle festen Items und generierten Ausrüstungskategorien werden abgedeckt. Kleine Ringe/Anhänger sind im Spielmaßstab bewusst nur Akzente. Zufallswerte erzeugen keine neue einzigartige Silhouette für jeden einzelnen Roll.
- Umgebung: Gebäude, Bäume, Felsen, Requisiten und Bodenimporte werden auf die gemeinsame Farbfamilie und Pixeldichte gebracht. Bestehende Karten-, Straßenübergangs-, Platzierungs- und Verdeckungsregeln bleiben wirksam.
- Welt und Vorschau greifen auf dieselbe Renderfunktion und dieselben angelegten IDs zu. Die Fernkampf-Darstellung richtet sich nach dem tatsächlich verwendeten Skill/Autoangriff, einschließlich anderer Spezialisierungen.
- PWA-Precache enthält alle neuen Laufzeitdateien.

### Quellen, Pipeline, Wiederholung

Originale: `assets/maifeld-live/sources/`. Erzeugung: eingebautes Bildwerkzeug, keine externe Bild-API. Prompts und Referenzen: [live-prompts.json](../tools/sprite-pipeline/live-prompts.json). Ein erster Kevin-Laufatlas hatte zusammenhängende Zeilen; aktiv ist die Korrektur `kevin-walk-v2.png`. Die Originalversion bleibt zur Herkunftskontrolle erhalten.

Technischer Import: [build-live.mjs](../tools/sprite-pipeline/build-live.mjs), [build-live-animals.mjs](../tools/sprite-pipeline/build-live-animals.mjs). Palette, Quell-/Atlas-Hashes, Rechtecke und Ausrüstungspunkte stehen in `assets/maifeld-live/runtime/catalog.json` bzw. den Tier-Rigs. Reproduzierbarer Build: `npm run sprites:live`; Regressionsprüfung: `npm run sprites:check`.

Spieltest-Fixture: `node scripts/live-art-fixture.mjs`; ausschließlich in einem neuen isolierten Browserkontext laden. Bildkontaktbogen: [live-art-gallery.playwright.js](../scripts/live-art-gallery.playwright.js), ausgeführt über den Playwright-Browserdienst. Dieser verwendet dieselben Renderfunktionen wie das Spiel. Screenshots liegen lokal unter `visual-review/live-*`; ausgewählte Abnahmebilder werden unten verlinkt.

„Nichts mehr zu meckern“ ist subjektiv. Die Abnahme prüft fehlende/alte aktive Figuren, sichtbare Ausrüstungswechsel, falsche Itemmotive, schwebende Griffe, verdeckte Gesichter, zitternde Tierkörper und abgeschnittene Menüs. Einzelne neue Kleidungsdesigns oder aufwendigere eigenständige NPC-Kampfclips sind damit nicht automatisch erstellt.
### Abnahmebilder

[Hauptspiel und angelegte Ausrüstung](images/live-optik/desktop.png) · [Mobile Drehansicht](images/live-optik/mobile.png) · [Laufphasen mit Ausrüstung](images/live-optik/walk-gear.png)
