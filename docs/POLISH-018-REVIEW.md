# Welt und Feldkit – fünf Prüfrunden, 0.18.0

Die vorhandene Maifeld-Grafik und Aperol-Anni bleiben die Grundlage. Diese Runde verbessert die Einbindung der Figuren, die Bedienung ohne Scrollseiten und die nutzbare Spielfläche auf Touch-Geräten. Alle Klassen-, Item-, Talent- und Speicherschlüssel bleiben stabil.

## Angewandte Gestaltungsregeln

- Häufige Touch-Ziele mindestens 44 × 44 CSS-Pixel, getrennte Flächen für Bewegung und Fähigkeiten. Die Fenster bleiben zwischen den Daumenbereichen. Größe und Anordnung werden neu berechnet, nicht als Desktopfenster verkleinert.
- Ein Thema je Reiter; Icons zuerst, Erklärungen auf Anfrage. Längere Inhalte werden in gemessene Abschnitte gepackt. Alle Abschnitte und Bedienelemente bleiben erreichbar.
- Das Weltgeschehen läuft bei geöffneten Fenstern weiter. Touch-Hilfe beschreibt den Joystick, Desktop-Hilfe die Tastatur. Kein schwebender Hover-Tooltip durch einen Touch-Fokus.
- Sichtbare Rückmeldung für die ausgewählte Seite, den gewählten Skillplatz und die erreichbaren Talentäste. Der Name des Gegenstands oder Kniffs bleibt im Titel seiner Detailansicht.
- Karten behalten ihr Seitenverhältnis. Charakter- und NPC-Porträts stammen weiter aus denselben Figurenbildern wie die Welt.

Grundlagen: [Apple Game Controls](https://developer.apple.com/design/human-interface-guidelines/game-controls), [Apple: Design great games for handheld devices](https://developer.apple.com/videos/play/meet-with-apple/243/), [Game Accessibility Guidelines: große, getrennte Bedienelemente](https://gameaccessibilityguidelines.com/ensure-interactive-elements-virtual-controls-are-large-and-well-spaced-particularly-on-small-or-touch-screens/). Die 44 CSS-Pixel sind die hier verwendete Web-Umsetzung; die Prüfung im emulierten Chrome ersetzt keinen Test auf sämtlichen realen Handys.

## Runde 1: Figuren in der erzeugten Welt

Questgeber werden deterministisch um ihren generierten Treffpunkt verteilt. Die Suche berücksichtigt Abstand zu anderen Questgebern, Startplatz und Brunnen, sichtbare Baumkronen, Kollisionen und einen tatsächlich berechneten Laufweg. Sie verwendet keine Listen handplatzierter NPC-Koordinaten. Sechs Seeds geprüft: 1, 42, 56753, 73519, 2026 und 987654.

Das Pflaster hat kleinere Steine für den Maßstab der Figuren. Dezente, schnell verblassende Schrittspuren geben Bewegung Bodenkontakt. Nur der nächste Gesprächspartner bekommt seinen Namen eingeblendet; Auftragszeichen bleiben sichtbar. Baumverdeckung berücksichtigt die gesamte Krone. Die Heldenhöhe folgt der Weltregel. Straßenbeschriftungen haben hellen Text auf dunkler Kontur.

Belege: `scripts/world-presence-check.mjs`, `combat-review/polish-018/01-world/`. Betrachtet wurden die drei Helden am Platz, weitere Treffpunkte, ein Gegnerfeld und beide Touch-Orientierungen.

## Runde 2: Kompakte Desktop-Menüs

Charakter: Ausrüstung / Werte / Verwalten. Glückstreffer, Drehzahl und Handschrift zeigen Wertung und Prozent zusammen in einer Zeile. Skillbuch: Kniffe / Belegung. Rucksack: paginierte Icons mit Suche über alle Seiten. Gegenstände öffnen ein separates Fenster für Anlegen, Vergleich und Geschichte; bisherige Ausrüstung wird beim Anlegen zurück in den Rucksack getauscht. Clanmitglieder stehen auf einzelnen Karten mit abrufbarer Beschreibung.

Die Wahl eines Untermenüs schließt das Hauptmenü. Alle Spielmenüs bleiben unabhängige, minimierbare Fenster. Der Klick auf einen leeren Aktionsplatz öffnet die passenden Kniffe und übernimmt die nächste gelernte Fähigkeit direkt.

Belege: `combat-review/polish-018/02-ui/`, `scripts/polish-playtest.mjs`.

## Runde 3: Talentbaum und Erklärungen

Die verzweigten Talentgraphen bleiben erhalten. Lange Einleitung und Punkteverwaltung liegen hinter der Hilfe. Auf kurzen Displays zeigt ein Umschalter überlappende obere und untere Abschnitte desselben Baums; Talenticons behalten ihre Touch-Größe. Talentlernen und die Freischaltung einer aktiven Fähigkeit wurden über echte Eingaben geprüft.

Gegenstands-, Kniff- und Talentdetails verwenden dieselben Fensterregeln. Touch öffnet eine Erklärung vor dem Lernen; Werte lassen sich antippen. Lange Inhalte verwenden Abschnittsbuttons statt verdeckter Aktionen. Beim Austausch des Fensterinhalts wird die vorherige Seitenstruktur verworfen, damit beispielsweise ein Belohnungsdialog nicht wieder durch den alten Gesprächstext ersetzt wird.

Belege: `combat-review/polish-018/03-all/`, `05-play/`.

## Runde 4: Mobile Menüs und Karte

Reale CDP-Touch-Eingaben bei 390 × 844 und 844 × 390. Inventar, Ausrüstung, Skillbuch, Talentbaum, Questlog, Hilfe, Admin, Touchbelegung, Clan und Karte werden nach verfügbarer Fläche gepackt. Der Toucheditor trennt Plätze, Kniffe und Optionen; die Auswahl eines Platzes führt direkt zur Fähigkeit. Im mobilen Skillbuch führt Belegung zu den Touchbuttons.

Die Karte trennt Karte, Ortsliste, Ziel und Legende. Auswahl eines Ortes öffnet dessen Zielansicht; die Route bleibt direkt startbar. Das Zeichenformat des Canvas folgt seiner tatsächlichen sichtbaren Fläche. Das Kontextmenü nutzt im Querformat fünf Spalten. Die Kampfzielanzeige und Fensteraufteilung lassen die Daumensteuerung erreichbar.

Belege: `combat-review/polish-018/04-touch/`. Dort gefundene Fehler – abgeschnittene Talentknoten, zu hohe Kartenfläche und 42 statt 44 Pixel große Buttons – wurden anschließend korrigiert.

## Runde 5: Durchspielen und Unterseiten prüfen

`scripts/ui-polish-check.mjs … … pages` blättert alle erreichbaren Menüseiten und Reiter durch, erfasst Screenshots, misst Überläufe und prüft Touch-Zielgrößen. Ein geerbtes `nav { height: 100% }` verursachte zu hohe Quest-Blätterleisten; die Fensternavigation hat jetzt eigene Höhen. Die Questüberschrift bleibt beim Blättern erhalten.

`scripts/polish-playtest.mjs` prüft Suche und Ausrüstungstausch, direkte Skillbelegung, Talentfähigkeit, Kartenroute, gespeicherten Ort sowie echte Kämpfe mit offenem Inventar. `scripts/dialog-polish-check.mjs` prüft Tutorialtexte, Gespräche, Auswahlbelohnungen, Beute, Schließen beim Weglaufen und beide Minispiele. Auf Touch öffnet ein Belohnungsicon zuerst die Vorschau; erst „Dieses Teil nehmen“ schließt die Auswahl ab.

Screenshots und maschinenlesbare Ergebnisse liegen lokal unter `combat-review/polish-018/05-pages/`, `05-play/` und `05-dialogs/`. Diese umfangreichen Prüfbilder sind wie bisher nicht Teil des ausgelieferten Spiels. Die Testskripte sind im Repository reproduzierbar.

## Abschlussprüfung

- 163 automatisierte Spieltests und 13 Inhaltstests bestanden; Balance- und Grafikberichte erzeugt. Keine Änderungen an Schadenswerten oder Fortschrittskurven.
- Menüprüfung: 155 Ansichten im ersten vollständigen Durchlauf; anschließend gezielte Nachprüfung aller Questseiten nach dem dauerhaft sichtbaren Questtitel. Desktop 2024 × 900, Touch 390 × 844 und 844 × 390. Kein horizontaler/vertikaler Überlauf in den final geprüften Seiten, alle geprüften Touch-Menübuttons mindestens 44 × 44 CSS-Pixel.
- Gespräche und sieben Tutorialabschnitte, Hauptquest mit Auswahlbelohnung, Beute aufnehmen und weggehen sowie Rhythmus- und Kabelspiel in allen drei Formaten durchgespielt; keine Browserausnahmen.
- Der erzeugte Pages-Build wurde über `http://localhost:4174/mertloch-chronicles/` mit echten Eingaben geprüft. Reproduzierbare Veröffentlichungskontrolle: `node scripts/polish-playtest.mjs https://er-esm.github.io/mertloch-chronicles/ combat-review/polish-018/public-play`.
- Die zwischenzeitlich auf GitHub ergänzte [visuelle Bewertung für 0.17](VISUELLE-BEWERTUNG-2026-09-13.md) bleibt als unabhängiger Ausgangsstand erhalten. Die dort separat vorgeschlagene vollständige Neubebilderung von Dieter, Kevin und Bewohnern ist kein Bestandteil dieser fünf Polishing-Runden.
