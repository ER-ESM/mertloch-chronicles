# Zehn Spiel- und Verbesserungsrunden · Version 0.10

11.09.2026. Lokale Chromium-Spieltests über Maus, Tastatur und DOM-Ereignisse, dazu Screenshots der Welt und Menüs. Die Testskripte verwenden ein eigenes Browserprofil auf Port 9222. Das Spiel bleibt unter http://localhost:4173 erreichbar.

| Runde | Umsetzung und Befund | Nachweis |
|---|---|---|
| 1 | Spielfläche füllt das Browserfenster. Seitenkopf und Außenrahmen entfernt, Menüknöpfe und Lernhinweise direkt im Spiel, durchgehender EP-Balken. | `visual-review/round-rpg-1/` |
| 2 | Lauftempo von 145 auf 122 reduziert; Beschleunigen, Abbremsen und Kamera geglättet. Laufphase folgt der zurückgelegten Strecke. Dieters Kasten aus beiden Sprites entfernt. | `rpg-review/round-2/`, Bewegungstests |
| 3 | Größeres Pflaster, weiche Straßenränder und Übergänge zwischen Bodenflächen. Sichtprüfung fand eine unerwünscht weichgezeichnete Pflastertextur. | `rpg-review/round-3/` |
| 4 | Blur-Filter nach der Kantenmaske zurückgesetzt: Pflaster wieder scharf. Dekoration prüft Wasser, Türen, Wege, reservierte Questflächen und Abstände. | `rpg-review/round-4/`, drei Seeds im Platzierungstest |
| 5 | Rucksack mit 24 Plätzen, Gegenstandsvergleich, Verpflegung, vier Ausrüstungsplätze und Charakterwerte. Anlegen, Ablegen und gespeicherte Werte geprüft; Anlegen heilt nicht kostenlos. | `rpg-review/round-5/` |
| 6 | Skillbuch mit gesperrten und gelernten Fähigkeiten. Ziehen auf die eingeblendete Aktionsleiste, Tauschen und klassenweise Speichern der Belegung. Der Test löst den verschobenen Buff über seine neue Taste aus. | `rpg-review/round-6/` |
| 7 | Besiegte Gegner hinterlassen sichtbare Beutel mit Gegenständen und Pfandmarken. F und Mausklick öffnen die Beute. Volle Rucksäcke lassen den Rest liegen; Neuladen dupliziert bereits eingesammelte Beute nicht. | `rpg-review/round-7/` |
| 8 | Neues Questlog: Aktiv, Im Dorf, Erledigt, Alle; Fortschritt, Kartenverknüpfung, Verfolgung und Belohnungen. Nebenaufträge geben zusätzlich zehn, die Hauptgeschichte 25 Pfandmarken. | `rpg-review/round-8/` |
| 9 | Echte Reise zum Lager, Kampf mit zwei Startfähigkeiten, erster Drop, Rückkehr, Ausrüsten, Neuladen und Admin-Reset/Wiederherstellung. Versteckte Questbelohnungen durch alte CSS-Regel korrigiert. Wasserprüfung berücksichtigt Polygonränder, Gärten ihren ganzen Grundriss; Lagerdekoration sucht freie Ersatzplätze. | `rpg-review/round-9/` |
| 10 | Ganzer Ablauf erneut, zusätzlich erzeugten Erkundungsauftrag angenommen, Bollerbox besucht und getestet, zurückgekehrt und abgegeben. 100 Trainings-EP regulär verdient; Buff und Parade freigeschaltet, Buff neu belegt und benutzt. Einzelne Questkarte nutzt die Breite. Leeren eines Slots korrigiert, Bedienung ohne Rechtsklick ergänzt, 320-Pixel-Leiste und erreichbaren Schließen-Knopf verbessert. Questobjekte bekommen freie Plätze neben der Straße; Gemüsebeete nutzen Erde und organische Blattgruppen statt eines starren grünen Rasters. | `rpg-review/round-10/` |

## Ergebnisse

- `npm test`: **63 Tests bestanden**, einschließlich Kampfrotationen, Buffs, Respawns, Navigation, Klassenwechsel, Speicher-Migration, Inventar und Beute.
- `npm run world:validate`: Seeds **1, 42, 56753, 73519, 2026, 987654** gültig; je **499 erreichbare Hauseingänge, sechs Nebenquests und 40 geprüfte Zielrouten**.
- Runde 10 im realen Spiel: **288 Schaden, ein besiegter Gegner, 15 verdiente Pfandmarken, 100 Trainings-EP**. Kein Testzugriff auf veränderbare Spielobjekte; Kämpfen, Interagieren und Navigieren erfolgen über die UI.
- Die Weltschmiede wurde im Browser auf Seed 42 neu generiert; Platzierungsbericht und Nahansicht wurden geprüft (`forge-checks.json`, `forge-tool.jpg`, `forge-scene.jpg`). Für Seed 56753 wurden 1.588 von 2.986 Dekorationskandidaten sowie 23 Lager-/Treffpunktobjekte angenommen; sechs ungeeignete Lagerobjekte entfallen.
- Menütests verwenden gesonderte Speicherfixtures, um Ausrüstungslevel, volle Beutel und Fähigkeitsbelegungen gezielt zu prüfen. Sie ersetzen nicht den vollständigen Spielablauf.
- Alle drei Clanfiguren sowie Fensterbreiten 320, 390, 768, 1024 und 1920 Pixel im Browser geprüft: acht Aktionsplätze sichtbar, Menüs ohne horizontalen Überlauf, Schließen-Knopf auch nach dem Scrollen erreichbar. Der abschließende Skillbuchtest benutzt native Mausbewegungen samt Drag-and-drop.
- Einzelberichte und Screenshots liegen in den genannten Ordnern. Runde 9 protokollierte die Kampfzähler versehentlich erst nach dem Neuladen (Sitzungszähler wieder null); der Kampf wurde während des Laufs mit 288 Schaden und einem Kill geprüft. Runde 10 erfasst die Werte vor dem Neuladen.

## Automatisches Weltwerkzeug

`world-dressing.js` prüft die aus den Kartendaten erzeugten Kandidaten: Abstand zu Türen, Straßen, Wasser und Hindernissen; unterschiedliche Dichten für Wiesen und genutzte Flächen; räumliche Abstände zwischen Dekorationen. Wasserflächen werden unabhängig von darüberliegenden Landnutzungspolygonen geprüft. Gemüsebeete werden mit ihrer gesamten Grundfläche geprüft.

`site-dressing.js` verschiebt Sammelobjekte und Bollerboxen auf erreichbare freie Plätze neben Straßen. Die neuen Standorte bleiben für Vegetation reserviert. Das Modul beschreibt Treffpunkte und Lager über wiederverwendbare Vorlagen. Für Zelt, Vorräte, Laterne und Anschlagbrett werden nahe Alternativen geprüft. Straßen, Bewohner und Gegner-Startplätze bleiben frei. Ist keine Stelle geeignet, wird das Objekt weggelassen. `world.dressingReport` zählt angenommene und verworfene Kandidaten samt Gründen. Dieselben Regeln gelten für alle Seeds; es gibt keine nachträglich von Hand korrigierte Mertloch-Koordinatenliste.

`terrain.js` zeichnet Straßen als gemeinsame Fläche mit gerundeten Kurven, durchgängiger Pflastertextur, begrünten Rändern und weich auslaufenden Erdwegen. Vergrößerte Masken verhindern abgeschnittene Straßenränder an Chunk-Grenzen.

## Bedienung der neuen Systeme

- **K:** Skillbuch. Fähigkeit auf einen Platz ziehen oder Fähigkeit und Platz nacheinander anklicken. „Platz leeren“ funktioniert auch per Touch. Die belegte Leiste wird im Buch direkt bearbeitet und beim Schließen unverändert im Spiel verwendet.
- **I:** Rucksack. Gegenstand auswählen, vergleichen, benutzen oder ausrüsten.
- **C:** Charakter, Ausrüstung und Zugang zum Clanwechsel am Treffpunkt.
- **J:** Questlog mit Kartenverknüpfungen.
- **F / Klick auf nahen Beutel:** Beute ansehen und einpacken.
- **Esc / P / PTC-Knopf:** Spielmenü, dort auch Admin-Reset mit Sicherung.

Der Prototyp bleibt ein lokales Einzelspielerspiel. Die neue Ausrüstung verändert Kampfwerte; die Charaktergrafiken bleiben ihre jeweiligen Clanfiguren. Materialien und Pfandmarken sind gespeichert, ein Handwerks- oder Händlersystem gehört noch nicht zu dieser Version.
