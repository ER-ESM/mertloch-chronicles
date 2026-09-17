# Bodendesign und Umgebung: fünf Iterationen

Auftrag: Boden und Umgebung vereinheitlichen, Übergänge visuell prüfen und Hauskollisionen detailliert testen. Bearbeitet im Worktree `art`; der Auftrag umfasst hier ausdrücklich Welt, Renderer und die notwendige Bewegungskorrektur.

## 1. Straßen und Materialübergänge

**Befund:** Auch Erdwege erhielten zunächst eine Pflasterschicht. Die weiche Erdmaske ließ graue Ränder stehen. Zufällige Schulterdetails und ausgesparte Randbereiche der Grasfransen waren an Chunks gebunden.

**Änderung:** Gemeinsame Straßenmasken je Material. Erst Erde, dann nur tatsächlich gepflasterte Straßen. Schmale, auslaufende Bankette; weltgebundene Details mit Überstand an Abschnittsgrenzen. Kreuzungen werden als zusammenhängende Fläche gezeichnet.

**Review:** Dorfplatz und Weggabelungen im laufenden Browser betrachtet. Das zunächst getestete geometrische Kleinpflaster war scharf, aber zu gleichförmig; deshalb in Runde 5 nochmals überarbeitet.

## 2. Wiese, Acker und Wasser

**Befund:** Die Grastextur lag über allen Biomen, einschließlich Wasser. Feldpflanzen endeten an einer harten Polygonkante; Furchen wurden pro Abschnitt mit einer anderen Steigung verbunden.

**Änderung:** Getrennte Oberflächen, weich maskierte Biome, global fortlaufende Furchen, zum Feldrand abnehmender Bewuchs. Wasser hat Ufer, flaches Randwasser, Reflexe, Schilf und einzelne Kiesel. Keine auf Wasser gezeichneten Grasbüschel.

**Review:** Feldweg, Acker und Teich im Browser. Ein dabei entdeckter Filterzustand wurde korrigiert: Der Weichzeichner der Randmaske darf nicht auf jede Pflanze weiterwirken. Die Maske wird außerdem einmal auf die fertige Materialfläche angewendet, statt bei jedem Detail erneut zu mischen.

## 3. Häuser, Füße und Bewegung

**Reproduzierter Fehler:** Ein Akteur bei `(80,140)` konnte mit `dx=140` durch ein Haus von `(100,100)` bis `(180,180)` auf `x=220` gelangen. Geprüft wurde zuvor nur das Bewegungsziel.

**Änderung:** Bewegungen werden in Schritte von höchstens 2,5 Welteinheiten zerlegt. Getrennte Achsen erhalten das Gleiten an Wänden. Kreis-gegen-Rechteck-Kollision bildet den Fußbereich korrekt ab: `(96,96)` mit Radius 5 ist an der Ecke frei, `(97,97)` blockiert. Dachüberstände sind keine zusätzlichen unsichtbaren Wände.

**Prüfung:** Alle 499 Häuser blockieren ihre vier Wandseiten; alle 499 Türzugänge sind frei und vom Start erreichbar. Große Schritte gegen jede Wand, diagonale Eckbereiche und Wandgleiten sind durch Tests abgesichert. Im Browser zusätzlich 650 ms mit gedrücktem W gegen eine echte Fassade gelaufen: Endposition außerhalb der Wand, keine Durchdringung.

## 4. Platzierung und Hausumgebung

**Befund:** Breite Kisten-/Bank-Sprites wurden nur an ihrem Mittelpunkt geprüft. Später versetzte Questgeber konnten außerdem bereits akzeptierte Dekoration in reservierte Bereiche verschieben.

**Änderung:** Kisten, Bänke und Zäune besitzen geprüfte Bodenflächen mit 30–40 Einheiten Breite. Der Generator untersucht die Fläche einschließlich ihrer Ränder, versucht deterministisch bis zu drei Abstände zur Hausseite und verwirft Konflikte mit Wegen, Wasser, Türen oder anderer Dekoration. Eine abschließende Prüfung berücksichtigt die endgültigen Questpositionen. Türschwellen verbinden Fassade und Zuweg.

**Prüfung:** Drei Seeds (`56753`, `42`, `2026`), keine überschneidenden Hausdekorationen oder in Straßen ragenden Kanten. Im Standardseed bleiben 443 Hausdetails und sämtliche Hauseingänge erhalten. Die bestehenden sechs Seed-Prüfungen für große Kulissen laufen ebenfalls durch.

## 5. Stilabgleich, Sichtbarkeit und Abnahme

**Änderung:** Die gezeichneten Bodenmotive bleiben die Stilreferenz. Ihre Textur-Zwischenbilder verwenden jetzt vierfache Auflösung bei identischer Weltgröße; dadurch bleiben Steinstruktur, Risse und Grashalme scharf. Das einfache geometrische Pflaster dient nur noch als Ladefallback. Kleine Bodendetails liegen auf dem halben Weltpixelraster. Häuser werden an der Tür nicht mehr transparent: Sichtausblendung greift nur hinter der Fassaden-Grundlinie.

**Visuell geprüft:** Dorfplatz, Feldgabelung, Acker, Uferweg, dichtes Wohnviertel, Pflaster-/Erdübergang; Desktop 1440×900 und Touch-Viewport 390×844 bei DPR 2. Keine Browser-JavaScript-Fehler. Die Abschlussscreenshots wurden tatsächlich angesehen. Stilbewertung: Der gezeichnete Boden passt wesentlich besser zur detaillierten Architektur als das verworfene geometrische Pflaster; Wege und begehbare Zwischenräume bleiben lesbar.

**Nahttest:** Vier unabhängig erzeugte Chunks werden an einer gemeinsamen Ecke gegen eine durchgehend gerenderte Referenzfläche verglichen. Drei reale Regionen: mittlere Kanalabweichung `0,00045`, `0,02708` und `0,01801` von 255; kein Pixel mit aufsummierter RGB-Abweichung über 30. Kleine Antialiasing-Abweichungen sind erlaubt, sichtbare Streifen nicht. Je Vergleich einschließlich vier Chunks und Referenz etwa 0,42–0,61 s auf dem Testrechner; dies ist eine Aufbauzeit, keine FPS-Messung.

## Belege und Wiederholung

- [Dorfplatz vorher](reviews/boden-2026-09-17/vorher.png), [Dorfplatz nachher](reviews/boden-2026-09-17/platz.png)
- [Pflaster und Erde](reviews/boden-2026-09-17/uebergang.png), [Ufer](reviews/boden-2026-09-17/ufer.png)
- [Hauskollisionen: rot = Grundfläche, grün = erreichbare Tür](reviews/boden-2026-09-17/kollision.png)
- [Mobile Ansicht](reviews/boden-2026-09-17/mobil.png)
- Browserablauf: `tools/world-environment-review.browser.js` über Playwright `browser_run_code` ausführen. Lokalen Server auf Port 4187 starten; Ausgabeverzeichnis bei anderem Worktree anpassen. Der Test nutzt einen eigenen Browserkontext ohne Service Worker und verändert keine bestehenden Spielstände.
- Automatisch: `tests/world-collision.test.mjs`, `tests/world-environment.test.mjs`, `tests/world-scale.test.mjs`, vorhandene Dressing-, Bewegungs- und Weltprüfungen.
- Gesamtabnahme: `npm test` – **337/337 bestanden**, keine übersprungenen Tests; `npm run build` erfolgreich (126 Anwendungsdateien, 36 Inhaltsmodule).

## Regeln für kommende Sitzungen

1. Texturauflösung und Weltmaßstab getrennt behandeln. Nicht präzise Quellen früh auf grobe Zwischenbilder reduzieren.
2. Oberflächen nach Material maskieren; Wasser bekommt keine gemeinsame Grasdeckschicht.
3. Detailpositionen aus Weltkoordinaten ableiten und mit Überstand rendern. Nahttests mit einer verschobenen Referenzfläche prüfen beide Achsen zugleich.
4. Canvas-Filter und Mischmodus nach jeder Maskenoperation zurücksetzen. Material zuerst zeichnen, anschließend einmal maskieren.
5. Dekorationsflächen und den endgültigen Layoutzustand prüfen, nicht nur Ankerpunkte oder frühe Entwürfe.
6. Kollisionen mit echten Bewegungsschritten testen. Freie Endpunkte allein beweisen keinen freien Weg.
7. Sichtausblendung folgt der Tiefensortierung an der Fassadenlinie; transparente Ränder einer Grafik dürfen vor dem Haus keinen Fade auslösen.

Die visuelle Abnahme deckt die genannten Ansichten ab; sie behauptet keine manuelle Sichtprüfung jedes einzelnen Kartenpixels oder jeder möglichen Spielsituation.
