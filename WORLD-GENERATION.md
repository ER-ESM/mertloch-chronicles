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
## Figurenplatzierung (0.18)

`world-presence.js` ergänzt die gemeinsame World-Pipeline nach der Umgebungsdekoration: Questgeber halten 48 Welteinheiten Abstand, meiden Baumkronen, Startplatz und Brunnen und benötigen einen berechneten Laufweg. Die Suche verwendet konzentrische, vom Weltseed deterministisch gedrehte Kandidatenringe. `world.dressingReport.people` protokolliert verschobene und beibehaltene Plätze. Prüfung für sechs Weltvarianten: `node scripts/world-presence-check.mjs`; Details zu den fünf visuellen Prüfrunden in [POLISH-018-REVIEW](docs/POLISH-018-REVIEW.md).

## Kulissen und Bude (0.20)

`world-props.js` setzt nach der Umgebungsdekoration zwei Dinge in die Welt; `world-prop-kinds.js` hält die Stammdaten
(`PROP_KINDS`: Name, Grundfläche, Zeichenhöhe, Fallback-Farbe; `CHAPTER_PROPS`: Kulisse je Kapitel; `PROP_RULES`).

1. **Kapitel-Kulissen.** Jedes Kapitel-Lager bekommt `props` — Sperrmüllplatz (Schrotthaufen, Hänger, Kühlschränke),
   Festplatz (Kegelbahn-Trümmer, Bierbänke, Kugeln), Bus im Feld (Bus mit Girlanden, leere Kästen, Bierbong). Die große
   Signatur-Kulisse steht am Bosslager, die Kleinteile auch am Mob-Lager. Platziert wird auf einem Ring um die Lagermitte,
   deterministisch aus `seed ^ 0x9B17`. Abgelehnt wird jede Lage auf Wegen, Gebäuden, Bäumen, Wasser, Haustüren, am
   Anlaufpunkt, im Korridor Anlaufpunkt → Lagermitte, auf Spawns, Sammelpunkten, Questorten, an Treffpunkten, auf anderen
   Kulissen oder über einem begehbaren Wegenetz-Knoten. Nur Bus und Schrotthaufen sind echte Kollisionskörper; nach dem
   Setzen werden Anlaufpunkt, Spawns und Sammelpunkte erneut auf Begehbarkeit und Anschluss geprüft und die Kulisse sonst
   zurückgebaut. `dressingReport.campProps` nennt gesetzte, ausgelassene, blockierende und zurückgebaute Objekte.
2. **Die Bude.** `world.base` ist das Gelände des Basisbaus hinter St. Gangolf: 156 × 110 Einheiten, frei von Häusern,
   Türen, Wasser und Wegen, Bewuchs auf dem Bauplatz wird gerodet, Anlaufpunkt am Wegenetz. `base.stageProps` trägt je
   Gebäude aus `content/buildings.js` einen festen Bauplatz und je Stufe eine wachsende Kulisse; Stufe 0 sind die Trümmer.
   Die Route „Bude“ steht in der Wegprüfung, `world.base` im Export.

Gezeichnet wird beides von der UI (docs/backlog/ui.md), Bildhinweise in docs/GRAFIK-BEDARF.md.

## Mentorenplätze am Treffpunkt (0.21)

`world-layout.js` liefert mit `mentorSpots(w)` die Plätze von Dosen-Dieter, Aperol-Anni und Klo-Kevin am Treffpunkt —
Welt-Seite des Playtest-Befunds **P3** (docs/PLAYTEST-2026-09-17-AKT1.md): die Mentoren standen so dicht an
Wachtmeisterin Ida, dass die Taste F den Falschen erwischte. Regeln (`MENTOR_RULES`, Welteinheiten):

- **≥ 60 zu Ida** (`idaGap`) — damit liegt jeder Mentor außerhalb ihres F-Radius von 50 (`engine.js`).
  Gewünscht sind **95** (`idaWish`): ab diesem Abstand überschneiden sich Idas F-Radius (50) und der
  Mentorenradius (42) gar nicht mehr. Erst wenn dort nichts frei ist, wird bis auf die Mindestwerte gelockert.
- **≥ 40 untereinander** (`mentorGap`, gewünscht 52), **≥ 34** zur Heilquelle, Abstand zum Budengelände.
- Begehbar (Radius 9), neben der Fahrbahn (`roadMargin` 6, Hauptweg bleibt frei), vom Treffpunkt aus frei erreichbar.
- Reihenfolge = Reihenfolge der Clanmitglieder in `content/npcs.js` (`MENTOR_ORDER`); IDs sind Speicherschlüssel.
- Rein geometrisch gesucht (Ringe 95 → 62, Winkelfächer um die von Ida abgewandte Richtung), **ohne Zufall**:
  gleicher Weltausschnitt, gleiche Plätze. Prüfseed 56753: Dieter 9441/8671, Anni 9434/8729, Kevin 9394/8771 —
  127/133/127 Einheiten von Ida, 58/110/58 untereinander.

Die Funktion liefert nur `{id,x,y}`. Figur, Name und Rolle setzt die Engine (`clan.js`, `placeMentors`; die Umstellung
auf `mentorSpots` steht in docs/backlog/engine.md).

## Kalles Kiosk (0.21)

`world-props.js` setzt mit `placeKiosk(w)` den ersten benannten **Ort** in den Dorfkern: `world.places.kiosk`
(`{id,name,title,text,x,y,w,h,minX…maxY,junction,facing,approach,props}`). Regeln aus
content/IDEEN-LANDJUNGS.md §Platzierung — „Kreuzung mit Vorplatz für Kiosk“:

- `roadJunctions(w)` sammelt Dorfkreuzungen: ein Wegpunkt einer Straße, der auf einer **anderen** Straße liegt
  (Toleranz 14, 30er-Raster dedupliziert, Hauszugänge und schmale Pfade zählen nicht). Sortiert nach Zahl der
  beteiligten Straßen, dann Nähe zum Treffpunkt — deterministisch, ohne Zufallsstrom.
- Kandidaten müssen im Dorfkern liegen (`inSettlement`), 220–2600 Einheiten vom Treffpunkt entfernt sein und den
  Kirchvorplatz frei lassen. Um jede Kreuzung wird ein Vorplatz von **86 × 64** Einheiten in fünf Abständen
  (70–126) und 24 Winkeln gesucht.
- Abgelehnt wird jede Lage auf Wegen, Gebäuden, Haustüren, Wasser, an Treffpunkten, am Budengelände, an Lagern oder
  Questorten und über einem begehbaren Wegenetz-Knoten (Hauptwege bleiben frei). Bewuchs auf dem Vorplatz wird gerodet.
- `approach` liegt 30 Einheiten vor der Tresenseite, ist begehbar, hängt am Wegenetz und hat freie Sicht zur Kreuzung;
  die Route steht unter „Kalles Kiosk“ in der Wegprüfung (`world.report.routes`).
- Kulissen (`places.kiosk.props`): `kiosk` (Bude mit Tresenfenster, **einziger Kollisionskörper**), `stehtisch`,
  `wett-tafel` — Tresen zur Kreuzung, Stehtisch und Tafel davor.
- Prüfseed 56753: Vorplatz 8557/9350 an der Kreuzung 8620/9241 (2 Straßen), Anlaufpunkt 8557/9288, 1031 Einheiten vom
  Treffpunkt; Kiosk 8557/9362, Stehtisch 8579/9334, Wett-Tafel 8535/9334. Alle sechs Prüfseeds liefern dasselbe Bild.

`world.places` steht im Export und in `reserved()` (Bewuchs und Dekoration meiden den Vorplatz). **Kioskkönig Kalle
selbst ist kein Weltobjekt** — NPC und Laden liegen bei Story und Engine (docs/backlog/story.md, docs/backlog/engine.md),
gezeichnet wird von der UI (docs/backlog/ui.md).

## Wohngebiet (0.20)

Der Mertloch-Ausschnitt enthält kein `landuse=residential`-Polygon. `world-layout.js` leitet das Wohngebiet deshalb aus
der tatsächlichen Bebauung ab: `settlementMask(w)` zählt Häuser je 40-Einheiten-Zelle im Umkreis von 250 Einheiten; ab
drei Häusern gilt die Zelle als bebaut (`SETTLEMENT_RULES`). `inSettlement(w,p)` fragt die Maske, `residential(w,p)`
prüft Wohnpolygon **oder** Maske. Außenlager, Kulissen und Bosse bleiben dadurch außerhalb des bebauten Gebiets; die
Maske steht als `world.settlement` auch im Export, damit Laufzeitregeln (z. B. Spawns in `encounters.js`) sie nutzen können.

## Boden- und Umgebungsabnahme (2026-09-17)

Fünf Iterationen, visuelle Belege und wiederholbarer Browserablauf:
[Bericht Bodendesign und Umgebung](docs/BODEN-UMGEBUNG-2026-09-17.md).

Bodenmaterialien werden getrennt und weltgebunden maskiert. Präzise Texturen behalten vierfache Auflösung bei unverändertem Weltmaßstab. Hausdekorationen prüfen ihre ganze Bodenfläche; `finalizeDressing` kontrolliert nach den letzten Questplatzierungen noch einmal reservierte Bereiche. `world-collision.js` behandelt runde Füße an rechteckigen Wänden und unterteilt große Bewegungen, damit ein freier Endpunkt nicht zum Durchlaufen von Häusern führt.
