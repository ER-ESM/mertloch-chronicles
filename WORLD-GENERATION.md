# Weltschmiede: Karte → bewohnbare Spielwelt

Die Kartenkoordinaten geben Orientierung, Straßenverläufe und Landmarken vor. Sie werden nicht mehr als winzige Häuserumrisse direkt gezeichnet. Das gemeinsame Regelwerk steht in [`world-rules.js`](world-rules.js); Spiel, Browserwerkzeug und Kommandozeilenwerkzeug benutzen dieselbe `World`-Implementierung.

**Stand 0.6:** Normale Straßen sind standardmäßig 72 Welteinheiten breit, Hauptstraßen 98, Feldwege 42. Die Figur wird etwa 26 Einheiten hoch gezeichnet. `world-layout.js` erzeugt drei Treffpunkte mit je zwei Nebenquestgebern und fünf besetzte Lager außerhalb der Wohnpolygone. Geschützte Anlaufpunkte führen vor die Lager. `world-details.js` zeichnet ihre Ausstattung und ergänzt geprüfte Hausränder. Der Export enthält Treffpunkte, Anlaufpunkte und Details; die Wegprüfung berücksichtigt sie. Regeln für Population und Schutzbereiche: [ENCOUNTERS.md](ENCOUNTERS.md). Sichtprüfung und fünf zusätzliche Iterationen: [POLISH-ITERATIONS.md](POLISH-ITERATIONS.md).

## Werkzeug benutzen

Server mit `npm start` starten, dann [Weltschmiede](http://localhost:4173/world-forge.html) öffnen.

- **Seed:** reproduzierbare Variation von Hausstil, Vegetation, Questgebern und Auftragszielen. Ein neuer Seed erzeugt andere Platzierungen.
- **Baumdichte:** 0,3–1,8-fache Verteilung. Die Freihaltezonen gelten bei jeder Dichte.
- **Straßenbreite:** 44–80 logische Pixel; Hauptstraßen bleiben breiter, Fußwege schmaler.
- **Spielwelt / OSM-Vorlage / Laufwege:** vergleichen die gestalteten Grundstücke mit den originalen Umrissen und zeigen das verbundene Wegenetz. Goldene Kreise markieren Questgeber, goldene Quadrate Ziele.
- **Nahansicht:** zeigt die tatsächliche Spielgrafik mit Figur als Größenreferenz.
- **Welt betreten:** öffnet das Spiel mit genau den geprüften Parametern im URL. Änderungen überschreiben keine Quelldaten. Spielstände sind nach Weltparametern getrennt.
- **Download:** exportiert Geometrie, Dekoration, Gegnerlager, Quests, Regeln und Prüfbericht als JSON mit OSM-Attribution.

Die Vorschau lässt sich durch Ziehen verschieben und mit dem Mausrad zoomen. „Ort zeigen“ springt zu einem generierten Questziel. Bei einem ungültigen Ergebnis wird die Generierung abgelehnt; die letzte gültige Vorschau bleibt erhalten.

## Automatisierter Build

Keine npm-Pakete notwendig. Node.js 20 oder neuer genügt.

```powershell
npm run world:build
npm run world:build -- --seed 42 --density 1.3 --road-width 64
npm run world:validate
```

Ausgabe: `generated/world-SEED.json` und `generated/report-SEED.json`. `world:validate` prüft sechs verschiedene Seeds und schreibt einen Fehlerstatus, wenn mindestens einer die Prüfung nicht besteht. Gleiche Seeds mit anderen Parametern überschreiben die entsprechenden lokalen Exportdateien; die Parameter stehen im Export.

Die Laufzeit verwendet denselben Generator direkt aus dem mitgelieferten OSM-Snapshot. Exportdateien sind überprüfbare Build-Artefakte; das Spiel muss sie nicht erneut herunterladen. Ein vorhandener OSM-Snapshot lässt sich mit `npm run world:import` neu aufbereiten; `npm run world:import -- --download` aktualisiert zuerst die öffentlichen Quelldaten.

## Gestaltungsregeln

1. **Menschlicher Maßstab.** Eine Figur ist 32 logische Pixel hoch. Eine normale Tür ist 18 × 35 Pixel groß. Wohnhäuser sind mindestens 84 Pixel breit und 60 Pixel tief, mit 62–78 Pixel hohen Fassaden und zusätzlichem Dach. Weltabstände werden mit 8 Pixeln pro Kartenmeter projiziert; Fassaden folgen einer eigenen, lesbaren Spielperspektive.
2. **Straßen vor Grundstücken.** Die echten Straßenachsen bleiben erhalten, bekommen aber spielbare Breiten und Freiraum. Gebäude werden zu Cottage-, Fachwerk-, Scheunen- und Kapellen-Archetypen. Kleine Nebengebäude entfallen. Grundstücke dürfen von ihrer Vorlage abrücken, wenn dadurch Straßenraum oder Abstand entsteht. Überlappende bzw. unpassende Grundstücke werden verworfen.
3. **Sicherer Startplatz.** Vor St. Gangolf wird ein Kirchvorplatz reserviert, mit Anschluss an das Straßennetz, Ida, Mara, Quelle und Möbeln. Gebäude und Baumstämme dürfen diesen Platz nicht versperren.
4. **Ein Zugang pro Haus.** Jeder dargestellte Eingang bekommt einen Pfad zur Straße. Der Generator prüft direkte und um das Gebäude führende Varianten. Ohne brauchbaren Zugang wird das Grundstück ausgelassen. Nach dem Vegetationsaufbau wird jeder verbleibende Eingang vom Spielerstart aus erneut auf Erreichbarkeit geprüft.
5. **Zusammenhängende Navigation.** Straßen und Zugänge werden in ungefähr 34 Pixel langen Abschnitten abgetastet. Kreuzungen und nahe Anschlüsse werden nur verbunden, wenn die Verbindung kollisionsfrei ist. Die vom Kirchvorplatz erreichbare Komponente bestimmt die zulässigen Questorte. Lange Strecken nutzen A* auf diesem Netz, freie Abschnitte werden vereinfacht; für lokale Sonderfälle existiert ein Raster-A*.
6. **Vegetation als Gestaltung.** OSM-Flächentypen steuern Wald-, Feld- und Wiesendichte. Zusätzliche Bäume und Gartenbeete beleben die Siedlung. Straßen, Zugänge, Startplatz und Quest-/Kampfbereiche besitzen Puffer. Baumpositionen werden vor der Prüfung auf das Pixelraster gerundet. Baumstämme haben dieselbe Kollision in Navigation und Spiel.
7. **Zufällige, spielbare Geschichten.** Pro Seed entstehen zwei Sammel-, zwei Erkundungs- und zwei Jagdaufträge mit eigenen Bewohnern und räumlich getrennten Zielen. Ortsbezeichnungen werden aus nahen benannten Straßen übernommen. Standorte werden aus der erreichbaren Wegkomponente ausgewählt, auf Platz und Abstand geprüft und nach der Dekoration erneut validiert. Jagdaufträge zählen nur Gegner ihres zugewiesenen Lagers.
8. **Prüfung vor Freigabe.** Der Export und Spielstart verlangen erreichbare Rastpunkte, Gegnerpositionen, Questgeber, Sammelobjekte, Wegsteine, Auftragsziele und Hauseingänge. Der Bericht nennt Anzahl, Weglängen und Fehler. Zielgeometrie und tatsächlich gelaufene Pfade verwenden dieselben Kollisionen.

## Quests im Spiel

Bewohner tragen ein goldenes `!`. Gehe hin und drücke **F**, um ihren Auftrag anzunehmen. Im Journal stehen alle sechs Nebenaufträge. Ein angenommener Auftrag lässt sich verfolgen; die Welt zeigt eine Richtungsmarke, die Karte den berechneten Weg. „Weg dorthin einschlagen“ läuft die Strecke ab und kann mit WASD unterbrochen werden.

Sammle Kräuter bzw. untersuche Wegsteine vor Ort mit F. Eine Jagd zählt die Wölfe im passenden Lager. Abgeschlossene Ziele werden beim jeweiligen Questgeber abgegeben. Belohnungen können nur einmal abgeholt werden; Fortschritt, bereits gesammelte Objekte und Abschluss werden für die jeweilige Welt gespeichert.

Das ist ein reproduzierbarer Questgenerator für eine Region. Er erzeugt keine unbegrenzten Live-Aufträge und noch keine Gebäudeinnenräume, Wirtschaftssimulation oder Multiplayer-Welt.

## Validierung

`npm test` prüft den Kampf sowie Maßstab, Türzugänge, Freihaltezonen, Reproduzierbarkeit, andere Seeds, veränderte Straßenbreiten/Baumdichte, alle drei Questabläufe und getrennte Welt-Spielstände. `npm run world:validate` baut zusätzlich mehrere vollständige Varianten und prüft jeweils sämtliche Endpunkte.

Im Browser wurden Generierung mit verändertem Seed und Baumdichte, die Ansichtswechsel und das Öffnen der passenden Welt geprüft. Ein Sammelauftrag wurde mit realer Eingabe angenommen, über die Wegführung aufgesucht, vollständig gesammelt, beim NPC abgegeben und nach Neuladen als abgeschlossen wiederhergestellt.

## Gestaltungsregeln der Version 0.3

- `terrain.js` fasst alle Straßen einschließlich Hauszugängen und Kirchplatz in gemeinsamen Masken zusammen. Erst wird der Rand, dann die gesamte Pflasterfläche gezeichnet. Weltweit verankerte Steinreihen vermeiden Textureinschnitte an den 512-Pixel-Kachelgrenzen. Kurven werden innerhalb der bestehenden Straßenkorridore gerundet. Feldwege erhalten eine eigene Erdtextur.
- Ein Weltpixel enthält nun 2 × 2 Zeichenpixel. Die Kamera und Klickkoordinaten verwenden weiterhin Weltkoordinaten. Der Held bleibt 32 Weltpixel hoch; Häuser, Kollisionsradien und Reichweiten behalten ihren Maßstab.
- `architecture.js` leitet Material, Gauben, Efeu, Blumen, Holzstapel und kleine Fassadenstände aus der Gebäude-ID ab. Dekorationen verändern keine Durchgänge. Baumgrafiken und Terrainkacheln werden zwischengespeichert; maximal 40 Terrainkacheln bleiben im Cache.
- `village-life.js` erzeugt eine reproduzierbare Bevölkerung aus erreichbaren Wegpunkten. Anwohner gehen auf berechneten Wegen hin und zurück, Tiere bewegen sich in kurzen geprüften Bereichen. Jede Bewegung prüft Hindernisse erneut. Die Figuren blockieren weder den Spieler noch Questwege und pausieren mit der Simulation.
- `atmosphere.js` bindet Schmetterlinge an die Bepflanzung, Vögel an den Bereich um die Kirche und Wasseranimationen an die Heilquelle. Animationen verwenden Spielzeit, auch in der Szenenvorschau.

Für 0.3 bestehen 25 automatisierte Tests einschließlich einer simulierten Minute mit allen 40 Bewohnern/Tieren und einer Pausenprüfung. Im Browser wurden Kirchplatz und angrenzende Straßen begangen, Rechtsklicknavigation, 390-Pixel-Mobilansicht und Szenen-/Routenwechsel geprüft. Eine Pixelprüfung bestätigt, dass die Kreuzungsmitte unabhängig von der Zeichenreihenfolge der Straßen bleibt. Die gemessene Bildzeit im bereits geladenen Dorfausschnitt betrug rund 16,7 ms; dies ist keine Garantie für alle Geräte oder neu ladende Bereiche.

## Zeichenstil der Version 0.4

Die Version 0.4 verwendet für alle generierten Varianten den eigenen Comic-Pixelstil **Maifeld-Märchen**. Gebäude-IDs bestimmen Dach-, Fenster- und Zunftzeichenvarianten; Baumvarianten bestimmen Kronenfarbe und Details. Diese Darstellung verändert weder Wege noch Questorte. Palette und Zeichenregeln: [ART-DIRECTION.md](ART-DIRECTION.md), direkte Vorschau: [Artbook](http://localhost:4173/artbook.html).

## Quellen

Geografische Grundlage: [© OpenStreetMap-Mitwirkende, ODbL](https://www.openstreetmap.org/copyright). Die Originaldatei und die reduzierte Spielquelle bleiben in `data/`. Alle Pixelgebäude und Dekorationen werden aus eigenem Zeichencode erzeugt; keine Google-Maps-Bildauswertung und keine übernommenen Spielgrafiken.
