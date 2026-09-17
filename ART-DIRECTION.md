# Maifeld-Präzisionspixel · aktiver Grafikstandard

Seit 17.09.2026 gilt auf ausdrücklichen Nutzerwunsch [Präzisionspixel](docs/PRAEZISIONSPIXEL-2026-09-17.md): 104 native Körperpixel bei 26 Welteinheiten, feinere Materialrampen, 48–64-px-Icons aus den Originalen. `assets/precision/runtime/catalog.json` ist die aktive Lieferung; `npm run sprites:precision` reproduziert sie. Die folgenden Fassungen sind historische Referenzen, ihre 52-px-Begrenzung gilt nicht mehr.

---

# Maifeld-Detailpixel · Art Direction 0.19

Seit 16.09.2026 ist **Maifeld-Detailpixel** der verbindliche Stil des Hauptspiels. Aktueller Vertrag: [Live-Optik und Ausrüstung](docs/LIVE-OPTIK-ARBEITSPLAN-2026-09-16.md). Die folgenden Abschnitte dokumentieren die früheren Grafikstände; bei Widersprüchen gilt dieser Vertrag.

- `live-art.js`: gemeinsame Figuren für Welt, Gespräch und Charakteransicht. Drei Helden, 26 weitere Identitäten und sieben Tierarten.
- Weltmaßstab: [Größenverhältnisse 0.19.1](docs/MASSSTAB-2026-09-17.md). `world-scale.js` registriert Türöffnungen, Figuren und freistehende Requisiten; die Kartenbreite darf keine Türen mehr schrumpfen lassen.
- Helden: 52 native Pixel Körperhöhe, 26 Welteinheiten, vier Ansichten und acht distanzabhängige Laufphasen. Ausrüstung folgt registrierten Griff-, Rumpf-, Kopf- und Fußpunkten.
- `art-style.js`: 40 Ankerfarben aus `tools/sprite-pipeline/config.mjs`; Umgebung mit abgeleiteten Zwischenfarben. Warmes Licht von links oben, dunkle Schieferkontur, keine geglätteten UI-Icons.
- Originale bleiben erhalten. Neue Rastergrafik wird über den eingebauten Bilddienst erzeugt, anschließend deterministisch segmentiert, registriert, auf die Palette gebracht und gepackt. `npm run sprites:live` und `npm run sprites:check` sind verbindlich.
- Gear muss in Tasche, Ausrüstungsplatz, Porträt und Welt dasselbe Objekt zeigen. Keine fest eingebackenen Waffen an den Helden. Zweihand entfernt die sichtbare Nebenhand; die aktive Fähigkeit entscheidet über die Fernkampfwaffe.
- Tiere behalten beim Laufen einen unveränderten Rumpf; nur Beine bewegen sich. Kein Wackeln der Tannen. Kartenkollisionen und Hauszugänge bleiben vom visuellen Import unabhängig.

---

# Maifeld-Märchen · Art Direction 0.8

Comicartige Pixelgrafik mit regionalen Motiven: Tinte, Honiglicht, Apfelwiesen, Schiefer und Fachwerk. Die Welt soll auch in einer kleinen Ansicht erkennbare Formen besitzen. Detail entsteht durch Material, Konstruktion und kleine Geschichten am Objekt.

Die aktuelle Umsetzung erweitert Pixel Frogs ?ltere CC0-Ausgabe von Tiny Swords. D?cher, Blattwerk, Steine, Boden und Effekte liefern die Materialvorlagen; `pixel-people.js` zeichnet eigene menschliche Pixelsprites f?r den Clan und die Bewohner. H?user folgen weiterhin den tats?chlichen Grundfl?chen. Vollst?ndiger Umbau: [GRAPHICS-REBUILD.md](GRAPHICS-REBUILD.md).

## Palette

| Funktion | Farbe | Verwendung |
| --- | --- | --- |
| Schiefertinte | `#293B44` | Außenkonturen, Fugen, Augen, Beschläge |
| Honigpapier | `#EBD9A4` | Kantenlicht, Fensterrahmen, kleine Reflexe |
| Korallrot | `#E18569` | Schal, Äpfel, Blumen, Akzente |
| Ziegelrose | `#AD5260` | Dachschatten, Stoff und Leder |
| Flussjade | `#429D96` | Glas, Wasser, Fensterläden |
| Schieferblau | `#628EB3` | Dächer, Rüstung, Stein |
| Apfelgrün | `#78A865` | Laub, Kräuter und Moos |
| Abendgold | `#ECB95C` | Zunftschilder, Metall, Licht |

Objekte ergänzen diese Ankerfarben um wenige abgestufte Materialfarben. Licht kommt von links oben. Schatten sind kühl und violett; helle Kanten gehen in warmes Creme über. Transparenz bleibt für Schatten, Rauch, Wasser und Sichtfreigabe reserviert.

## Form und Detail

- Außenkonturen: meist 1–2 Weltpixel, innen feinere Linien. Helle Kanten werden nur auf der Lichtseite gesetzt. Zeichnung auf einem Raster von einem halben Weltpixel; Zeichenauflösung weiterhin 2 × 2 pro Weltpixel.
- Dächer: leicht geschwungene Traufen, überlappende Schindeln mit Kerben, wenigen Moosflecken und unterschiedlichen Farbstufen. Gauben erhalten runde Rosetten und ein eigenes kleines Dach.
- Fassaden: honigfarbener Putz, kräftiges Fachwerk, zurückgesetzte Türbögen, farbige Läden, Blumenkästen, Holzstapel und hängende Zunftschilder. Brot, Kräuter, Werkzeug und Ähren unterscheiden Häuser. St. Gangolf bekommt Schiefer, Steinbänder und ein ausgearbeitetes Zifferblatt.
- Vegetation: große gelappte Kronen mit untergeordneten Blattgruppen; Äpfel, Pilze und ein Vogelhaus als Akzente. Wiesen bekommen vereinzelte Klee- und Grashorste. Boden bleibt ruhiger als Figuren und Gebäude.
- Figuren: klare Kopf- und Körpersilhouette, erkennbare Gesichter, Stofffalten, Beschläge und Kantenlicht. Der Runenwächter trägt Türkis und einen korallfarbenen Schal. Gold kennzeichnet Ida. Bewohner variieren Kleidung, Hüte und Körbe.
- Gegner: blaugraue Wölfe, violette Aschenrufer und ein steinerner Dornenvogt mit Geweih, Moos und goldener Kernrune. Zielmarkierungen, Lebensbalken und Kampfankündigungen bleiben gut erkennbar.

## Implementierung

`pixel-style.js` enthält Palette und gemeinsame Zeichenfunktionen. `comic-architecture.js`, `comic-nature.js` und `comic-actors.js` zeichnen die tatsächlichen Spielobjekte. `architecture.js` und der Figurenexport in `village-life.js` halten bestehende Imports kompatibel. Terrain, Brunnen und Benutzeroberfläche verwenden dieselbe Richtung.

Varianten hängen von bestehenden Gebäude-IDs und Baumvarianten ab. Die Zeichnung verändert keine geografischen Daten oder Navigationshindernisse. Heldenhöhe, Türen, Reichweiten und Weltmaßstab bleiben in den bestehenden Weltkoordinaten. Zeitabhängige Motive verwenden im Spiel die pausierbare Spielzeit. Das Artbook stellt diese Funktionen separat und teilweise vergrößert dar.

## Prüfung dieser Überarbeitung

### Fortschreibung 0.6

Die folgende historische Prüfung beschreibt Version 0.4. Aktuell zeichnen `clan-art.js` und `world-details.js` Clanmitglieder, kleinere Tiere, Marktstände, Feldlager und Grundstücksdetails. Der Held wird mit Faktor 0,8 gezeichnet, normale Menschen und Tiere passend abgestuft; Horsts übergroßer Hausordnungs-Panzer bleibt ein bewusstes Elite-Motiv. Pflastersteine folgen einem durchgängigen 9 × 6 Raster. Weiterhin gelten Schiefertinte, Honiglicht und die gemeinsame Comic-Palette. Große automatische Meldungen sind abgeschaltet. Prüfungen und Bilder des aktuellen Standes: [POLISH-ITERATIONS.md](POLISH-ITERATIONS.md).

25 bestehende Tests zu Kampf, Questabläufen, Kollisionen, Weltvarianten und Bewohnerbewegung bestehen. Desktop, 390-Pixel-Mobilansicht, Karte, animierte Weltschmiede und Artbook wurden im Browser geprüft. Ein separater Testspielstand wurde zu den Wölfen bewegt und per Tab und Aethermal in den Kampf gebracht. Die Bildzeit am Kirchplatz lag im getesteten Browser bei etwa 16,7 ms; dies ist keine Aussage über alle Geräte. Baumverdeckung und die Position von Hinweismeldungen wurden beim Kampftest nachgebessert.
