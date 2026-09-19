# Mertloch Chronicles — Poo-Tang-Clan

**[▶ Jetzt Testspielen – aktuelle Spielversion](https://er-esm.github.io/mertloch-chronicles/)**

**[Helden, Bewegung und Ausrüstung testen](https://er-esm.github.io/mertloch-chronicles/redesign-demo.html?hero=dieter&outfit=theme&action=walk)** · [Roadmap](docs/ROADMAP.md) · [GitHub-Repository](https://github.com/ER-ESM/mertloch-chronicles)

Ein spielbares 2D-Browser-Rollenspiel rund um den Poo-Tang-Clan und St. Gangolf in **56753 Mertloch**: Gegner auswählen, Kniffe kombinieren, Beute sammeln und die Dorfgeschichte erleben. Auf PC und Handy ohne Installation und ohne Konto spielbar.

Der erste Link öffnet das vollständige Testspiel. Die separate Helden-Demo zeigt die aktuellen Figuren mit Ausrüstung, Animationen und vier Blickrichtungen; sie verändert keinen Hauptspielstand. Alte Grafikprototypen stehen weiter unten unter „Werkstätten und Demos“.

## Aktueller Stand

- **Dosen-Dieter, Aperol-Anni und Klo-Kevin** mit eigenen Kampfmechaniken, Spezialisierungen und Talenten.
- **Getrennte Zielwahl und Autoangriff:** Ein Gegner wird erst angegriffen, wenn du den Angriff einschaltest oder einen offensiven Kniff einsetzt. Nahkampfangriffe treffen nur in Reichweite.
- **16 Ausrüstungsplätze**, unterschiedliche Waffenarten, Beutevergleich und eine drehbare Figurenvorschau. Die Plätze im Charakterfenster sind den Körperteilen zugeordnet.
- **Clanbuch mit vier Reitern:** Figur, Rucksack, Aufträge und Karte; daneben Hilfe. Kniffe und Talente liegen unter Figur, Bude und Erinnerungen unter Aufträge.
- **Desktop- und Touchbedienung**, Hofprobe als Einstieg, Aufträge, Bosskämpfe und Basisbau im Maifeld.
- **Kompaktes Damage-/Heal-Meter:** dauerhaftes Desktop-Fenster mit Rangbalken, DPS/HPS, Fähigkeitsdetails und den letzten zehn Kämpfen. **V** blendet es ein/aus; mobil öffnet der **Balken-Knopf unter dem Menü** die Anzeige. Position, Größe und Sichtbarkeit werden gemerkt.
- **Bearbeitbare Oberfläche:** Spieler-/Zielfenster, Aktionsleisten, Minikarte, Effektleisten, Kampfstatistik und Touchsteuerung verschieben und skalieren. Benannte Layouts mit getrennten Ansichten für Desktop, Handy hochkant und quer.
- **Buffs und Debuffs:** getrennte Leisten für eigene Stärkungen, eigene negative Effekte und Ziel-Debuffs; mit Restzeit, Stapeln und Erklärungen per Maus oder Antippen.
- **Speichern, Offlinebetrieb und Updates** sowie automatische Prüfungen für Spiellogik, Oberfläche und Browser-Updates.

Die aktuelle Priorität ist **erst die technische und spielerische Basis, danach neuer Content**. Ladeverhalten, Update-Regressionen und UI-Prüfungen wurden überarbeitet. Die vollständige Passform-Abnahme der Ausrüstung und Tests auf physischen Mobilgeräten bleiben offen; Browseremulation ersetzt diese Geräteprüfung nicht. Akt 2 ist noch nicht beauftragt.

Details: [aktuelle Roadmap](docs/ROADMAP.md), [Basis-Nachschliff und Prüfergebnisse](docs/BASIS-NACHSCHLIFF-2026-09-18.md), [Grafikpipeline und bekannte Grenzen](docs/REDESIGN-PIPELINE-2026-09-18.md).

## Schnellstart im Spiel

Wähle deine Clanfigur und sprich am Treffpunkt mit **Ida**. Die Hofprobe führt durch Bewegung, Zielwahl und Kampf. Aufträge und ihre Wegmarken findest du im Clanbuch.

| Aktion | PC | Handy / Touch |
|---|---|---|
| Bewegen | WASD; Rechtsklick auf den Boden plant einen Laufweg | Joystick |
| Gegner auswählen | Linksklick oder Tab; Shift + Tab zurück | Gegner antippen oder „Ziel“ |
| Autoangriff | Angriffsbutton ein/aus; standardmäßig Taste 1. Rechtsklick auf einen Gegner startet ihn ebenfalls | Angriffsbutton antippen; erneut antippen stoppt |
| Kniffe einsetzen | Belegte Aktionsplätze mit 1–0; offensive Kniffe starten auch den Autoangriff | Kniffbutton antippen; lange halten zeigt die Erklärung |
| Interagieren | F | „Aktion“ |
| Ausweichen / Unterbrechen | Leertaste / Q | Stiefel- / Handbutton |
| Figur / Rucksack / Aufträge / Karte | C / I / J / M | „Menü“ → „Clanbuch“, dann den Reiter wählen |
| Kniffe / Talente / Hilfe | K / N / H | Unter Figur bzw. über das Hilfe-Symbol |
| Kampfstatistik | Standardmäßig sichtbar; V oder HUD-Button zum Ein-/Ausblenden | Balken-Knopf unter dem Menü; auch Figur → Werte → Kampfstatistik |
| Spielmenü / UI bearbeiten | Esc → UI bearbeiten; auch P oder der Menüknopf | Menü → UI bearbeiten |
| Schließen / Angriff stoppen | Esc schließt zuerst Fenster bzw. bricht Zielen/Zaubern ab; aus der Welt öffnet es das Spielmenü und beendet den Autoangriff | × schließt das Clanbuch; Angriffsbutton stoppt den Angriff |

Die Aktionsleiste ist frei belegbar. Unter **Hilfe → Einstellungen → Steuerung & Touchbuttons** lassen sich die Touchbelegung, Buttongröße und Joystickseite einstellen. Geöffnete Menüs halten den Kampf nicht an.

Im **UI-Bearbeitungsmodus** pausiert die Welt. Ziehe die blauen Rahmen, wähle die Größe und speichere dein Layout. **Abbrechen / Esc** verwirft die offenen Änderungen. Auf Touch öffnet **Optionen** die Einstellungen; das Bedienfeld selbst lässt sich an seiner Überschrift verschieben. Raster, feines Verschieben, Layoutkopien und Zurücksetzen sind eingebaut. Die Layouts werden lokal im Browser gespeichert. Leere Effektleisten und die Zauberleiste erscheinen zum Platzieren als Rahmen. [Bedienung und Prüfbericht](docs/HUD-EDITOR-2026-09-18.md).

Im **Damage-/Heal-Meter** wechselst du zwischen Schaden und Heilung sowie aktuellem/letztem Kampf, einzelnen vergangenen Kämpfen und der gesamten Sitzung. Wähle eine Figur für ihre Fähigkeiten und einen Fähigkeitsbalken für Treffer, Durchschnitt, Spitzenwert, kritische Treffer und Überheilung bzw. Überschaden. Auf dem Desktop lässt sich das Fenster an der Titelleiste verschieben; auf Touch passt es sich dem freien Bereich zwischen bzw. über den Kampfbuttons an. Die Statistik läuft auch bei eingeklappter Anzeige weiter und beginnt nach dem Neuladen neu. [Messregeln und Prüfbericht](docs/KAMPFSTATISTIK-2026-09-18.md).

## Kalles Kiosk

Nach der Hofprobe findest du **Kalles Kiosk** auf der Karte unter **Läden**; im Rucksack führt „Kalles Kiosk auf der Karte“ direkt dorthin. An der Haustür betrittst du mit **F** beziehungsweise mobil **Aktion** den eigenen Kiosk-Innenraum. Drinnen läufst du mit WASD, Klick oder Touch-Joystick zur Theke; **F/Aktion** öffnet dort den Handel. Kalle lässt sich auch anklicken oder antippen. Am Ausgang führt **F/Aktion** zurück zur selben Tür im Dorf. Neuladen erhält deinen Platz im Laden.

- **Kaufen:** Brezel, Konterwasser, Kaltgetränk und Currywurst gegen Pfandmarken, mit Mengenwahl und Stufenanforderung. Bei zu wenig Platz oder Geld wird nichts abgezogen.
- **Verkaufen:** Der Rucksack steht direkt neben dem Händler. Rechtsklick auf einen Gegenstand verkauft den Stapel sofort, ohne Rückfrage; mobil genügt Antippen. Linksklick am Desktop zeigt Werte und Erlös, Enter verkauft den fokussierten Stapel. Benötigtes Hauptauftragsmaterial und Dorflegenden bleiben geschützt.
- **Rückkauf:** Die letzten zwölf Verkäufe zum gleichen Preis zurückholen, auch nach Neuladen. Ältere Einträge fallen bei weiteren Verkäufen heraus.

Der Handel endet beim Weglaufen oder Kampfbeginn. [Regeln und Prüfbericht](docs/HAENDLER-2026-09-19.md). Charaktererstellung und Handwerk bleiben zurückgestellt.

## Spielstand, App und Updates

Der Fortschritt wird lokal im Browser des jeweiligen Geräts gespeichert. Die Online-Adresse und `localhost` haben getrennte Spielstände; es gibt keine automatische Synchronisierung zwischen Geräten oder Browsern.

Unter **Hilfe → Einstellungen → Als App installieren** findest du die Installation für deinen Browser. Sobald „Offline bereit“ angezeigt wird, kann das Spiel auch ohne Verbindung starten. Optionale Vorschaugrafiken werden bei Bedarf geladen und zwischengespeichert.

Eine neue Version wird im Spiel angeboten. Vor dem Neustart versucht das Spiel zu speichern; schlägt das fehl, kannst du den Neustart abbrechen oder ausdrücklich trotzdem fortfahren. Geschützte, nicht lesbare oder neuere Spielstände werden dabei nicht überschrieben. Die **Buildnummer** am HUD und unter Hilfe → Einstellungen zeigt, welchen veröffentlichten Stand du gerade spielst.

## Werkstätten und Demos

Alle Links öffnen die veröffentlichten Browserseiten, keine Quellcodedateien.

| Seite | Zweck |
|---|---|
| [Aktuelles Testspiel](https://er-esm.github.io/mertloch-chronicles/) | Vollständiges Spiel mit Fortschritt und Aufträgen |
| [Helden in Bewegung](https://er-esm.github.io/mertloch-chronicles/redesign-demo.html?hero=dieter&outfit=theme&action=walk) | Aktuelle Figuren, Ausrüstung, Animationen, Einzelbilder und Richtungen |
| [Hopfen, Zitrus & Pfand](https://er-esm.github.io/mertloch-chronicles/theme-demo.html) | Themenkollektion und Detailansichten der drei Helden |
| [Weltschmiede](https://er-esm.github.io/mertloch-chronicles/world-forge.html) | Weltvarianten, Seeds, Navigation und Geometrieprüfungen |
| [Maifeld-Märchen / Artbook](https://er-esm.github.io/mertloch-chronicles/artbook.html) | Weltgestaltung und Motive |
| [Frühere Pre-Render-Demo](https://er-esm.github.io/mertloch-chronicles/prerender-demo.html) | Technischer Vergleich mit dem älteren Figuren-Rig |
| [Frühere Sprite-Werkstatt](https://er-esm.github.io/mertloch-chronicles/sprite-lab.html) | Vergleich der ursprünglichen drei Sprite-Stile |
| [Früherer Maifeld-Prototyp](https://er-esm.github.io/mertloch-chronicles/maifeld-prototype.html) | Eigenständige ältere Hofprobe mit Anni und Dieter |

## Lokal starten

Für Entwicklung und Prüfskripte wird **Node.js 24** verwendet, ebenso in GitHub Actions. Es gibt keine npm-Abhängigkeiten; `npm install` ist nicht nötig.

```sh
git clone https://github.com/ER-ESM/mertloch-chronicles.git
cd mertloch-chronicles
npm start
```

Anschließend [http://localhost:4173](http://localhost:4173) öffnen. Unter Windows startet auch [Start-Spiel.cmd](Start-Spiel.cmd) den lokalen Server. Für einen anderen Port in PowerShell: `$env:PORT=4181; npm start`.

## Entwickeln und prüfen

Das Spiel nutzt JavaScript-ES-Module, Canvas 2D und einen kleinen Node-HTTP-Server. Inhalte und Balancing liegen als Daten in [`content/`](content/README.md), die Engine liest sie über `content/index.js`. IDs von Gegenständen, Fähigkeiten, Klassen und Talenten sind Bestandteil gespeicherter Spielstände und müssen stabil bleiben.

```sh
npm test                   # Spiellogik, Inhalte, Welt, Grafik und Speicherregeln
npm run content:check      # Inhaltsschema und Invarianten
npm run world:validate     # Weltgenerierung über mehrere Seeds
npm run ui:check           # Clanbuch sowie Desktop- und Touchlayouts im Browser
npm run meter:check        # Damage-/Heal-Meter, Details, Zurücksetzen und Touch
npm run hud:check          # UI-Layouts, Buff-/Debuffleisten und Touchbearbeitung
npm run pwa:check          # Produktionsbuild, Offline-Starts und Updatefälle
npm run performance:check  # Ladezeit, Anfragen und Bildzeiten
npm run build              # Statische Website nach _site/
```

Die Browserprüfungen benötigen Chrome/Chromium oder Edge. Falls der Browser nicht automatisch gefunden wird, `CHROME` auf den Pfad der ausführbaren Datei setzen. `ui:check` und `performance:check` starten ihren lokalen Server selbst; `pwa:check` baut und prüft die Website in einem eigenen lokalen Browserprofil.

Weitere Werkzeuge: `npm run content:balance` erzeugt den [Balance-Bericht](content/BALANCE-REPORT.md), `npm run content:art` das [Grafik-Briefing](content/ART-BRIEF.md). Die aktuelle Figurenpipeline wird mit `npm run redesign:build` exportiert und mit `npm run redesign:check` gezielt geprüft.

- [Roadmap und offene Arbeiten](docs/ROADMAP.md)
- [Entwicklungsablauf](docs/PIPELINE.md) und [Entscheidungen](docs/ENTSCHEIDUNGEN.md)
- [Inhaltsstruktur](content/README.md) und [Ausrüstungsregeln](EQUIPMENT.md)
- [Weltgenerierung](WORLD-GENERATION.md) und [Figuren-/Ausrüstungspipeline](docs/REDESIGN-PIPELINE-2026-09-18.md)

## Veröffentlichung

[GitHub Actions](https://github.com/ER-ESM/mertloch-chronicles/actions/workflows/pages.yml) prüft Änderungen mit `npm test`, baut `_site/` und führt UI- sowie Offline-/Updateprüfungen durch. Erfolgreiche Builds von `main` werden auf GitHub Pages veröffentlicht; Pull Requests werden geprüft. Der Testspiel-Link zeigt den zuletzt erfolgreich veröffentlichten Build.

Im Repository ist **Settings → Pages → Source → GitHub Actions** vorgesehen. Über **Actions → Test and publish game → Run workflow** lässt sich der Ablauf erneut starten. Spiel, Kartendaten, Schriften und Laufzeitgrafiken werden mitgeliefert; Grafikquellen und Reviewbilder gehören nicht zum Offline-Spielpaket.

## Mitwirkende

- [Oliver Schiemann (@Checkov23)](https://github.com/Checkov23) — Code-Review, Fehlerbehebungen, Bedienung, Performance sowie Regressionstests.

## Daten und Quellen

- [OpenStreetMap-Datenausschnitt](https://api.openstreetmap.org/api/0.6/map?bbox=7.293,50.262,7.321,50.280): geografische Vorlage für Straßen, Grundrisse und Tags. Die Spielwelt vereinfacht und gestaltet diese Vorlage nach eigenen Regeln.
- [OpenStreetMap-Lizenz und Namensnennung](https://www.openstreetmap.org/copyright): © OpenStreetMap-Mitwirkende. OSM-Daten und abgeleitete Kartendaten stehen unter ODbL 1.0; Namensnennung ist im Spiel und auf der Karte vorhanden.
- [OSM API 0.6](https://wiki.openstreetmap.org/wiki/API_v0.6): Schnittstelle für den Snapshot-Import.
- [Overpass-Ausgabeformate](https://dev.overpass-api.de/output_formats.html): alternative Schnittstelle; der vorhandene Snapshot stammt aus der direkten OSM-API.

Die Rohdaten liegen in `data/mertloch.osm`, die für das Spiel reduzierte Datenbank in `data/mertloch.json`. Bei Weitergabe die OSM-Lizenz und Attribution beibehalten. Das Spiel ist derzeit Einzelspieler ohne MMO-Server, Accounts oder geräteübergreifende Synchronisierung.
