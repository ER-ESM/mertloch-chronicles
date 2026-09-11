# Welt-Polishing 0.6 · fünf zusätzliche Spiel- und Verbesserungsrunden

Stand: 11. September 2026. Die Bewertungen sind meine gestalterische Einschätzung nach eigenen Browserdurchläufen, keine unabhängigen Nutzertests. Alle fünf Runden wurden umgesetzt und anschließend im laufenden Spiel betrachtet beziehungsweise bedient.

## Grundumbau vor den fünf Runden

- Spielfigur auf 80 % ihrer bisherigen Zeichenhöhe verkleinert: etwa 26 statt 32 Welteinheiten. Kollisionsradius und Kameramaßstab bleiben spielbar.
- Normale Straßen 72 statt 56 Einheiten, Hauptstraßen 98 statt 78, Feldwege 42 statt 34. Gebäude werden beim Generieren passend versetzt; Türanschlüsse werden erneut geprüft.
- Drei Treffpunkte mit je zwei Nebenquestgebern: Clan-Treff bei St. Gangolf, Pfandhof und Wegestube. Ida bleibt die Anlaufstelle der Hauptgeschichte.
- Haupt- und Jagdlager liegen auf freien Flächen außerhalb der als Wohngebiet markierten Polygone. Reproduzierbare Platzierung mit Anschluss an das Wegenetz. Zelte, Grill, Kisten, Fässer und beschlagnahmte Lautsprecher geben ihnen ein Thema.
- Keine automatischen großen Orts- oder Erfolgsmeldungen in der Mitte. Kleine Randmeldungen, kompakte Ortsanzeige oben, ausführliche Lernerklärungen unterhalb des Canvas.
- Zwei Startfähigkeiten, sechs weitere Freischaltungen durch tatsächlich verdiente Clan-Erfahrung. Drei unterschiedliche Buffs.

## Die fünf Runden

| Runde | Befund beim eigenen Spielen | Umsetzung und erneute Prüfung |
|---|---|---|
| 1 · Sicht und Bedienung | Die Lernleiste lag bei Desktopfenstern unterhalb des sichtbaren Bereichs; Interaktion und Aktionshinweis standen zu dicht zusammen. | Spielhöhe ans Fenster angepasst, Lernleiste sichtbar gehalten, Seitenauftrag kompakter gemacht und Hinweisabstände korrigiert. WASD und Ausweichen bedient. Bei 1440 × 1000 liegt das Ende der Lernleiste bei etwa 935 px; die große Ortsmeldung ist ausgeblendet. |
| 2 · Straßen und Grundstücke | Breitere Straßen wirkten mit den alten großen Pflastersteinen noch zu grob, Grundstücksränder zu leer. | Kleinere Steine mit durchgängigem Muster über Kreuzungen; Getreideähren, Blumenfässer, Holzstapel, kurze Zäune und Erntekisten ergänzt. Den Bereich westlich und südlich von St. Gangolf abgelaufen und die Darstellung geprüft. |
| 3 · Anfahrt und Kampfeinstieg | Wegsuche konnte direkt neben einem Hindernis scheitern, obwohl der Held dort stehen durfte. Routen ins Lagerzentrum zogen mehrere Gegner gleichzeitig. | Geprüfter Übergang vom kleineren Bewegungskollider in den Navigationskorridor. Separate Anlaufpunkte außerhalb des Kampfplatzes, dort kein neuer Aggro-Einstieg. Erste Keilergruppe räumlich verteilt und ihre Patrouillen enger gefasst. Über das Journal zum Lagerrand gelaufen, anschließend mit Bodenklicks in den besetzten Grillplatz gegangen. Ankunft mit 600 Leben; das tatsächliche Lager wird als besetzt angezeigt. |
| 4 · Lernen und Buffs | Neu gelernte Fähigkeiten mussten verständlich erklärt werden, ohne automatisch ein Kampfmenü zu öffnen. Gleichzeitige Freischaltungen brauchten eine sinnvolle Reihenfolge. | Dauerhaft nachlesbare Lernkarten in Freischaltreihenfolge, neue Aktionen rechts angefügt, Buffdauer am Spielerfenster. Mit Bärbel über normale Eingaben zwei Gegner besiegt: 60 Clan-EP, erster Buff freigeschaltet und benutzt; 564 Leben übrig. Der Schild-/Verstärkungszustand und die Erklärung waren sichtbar. Keine manipulierten Kampfwerte in diesem Durchlauf. |
| 5 · Orientierung und Maßstab | Treffpunkte waren auf der Karte schwer von Kampfzonen zu unterscheiden. Gänse und Dachse wirkten neben dem kleineren Helden zu groß. Entfernte alte Ziele blieben im Zielrahmen. | Treffpunkt- und Lagermarkierungen, an die Aufträge angepasster Kartenausschnitt, direkte Treffpunktrouten, örtliche Gebietsnamen; Tiere und normale Menschen nachskaliert, weit entfernte friedliche Ziele abgewählt. Pfandhof über die Oberfläche erreicht und Karte angesehen. Mobil bei 390 × 844 mit allen acht Fähigkeiten geprüft: keine horizontale Überbreite, Aktionsleiste endet bei etwa 368 px, Lernleiste bei 785 px. Für diese späte UI-Ansicht wurde ein separater Testspielstand verwendet und danach zurückgesetzt. |

## Ergebnis meiner Bewertung

**Lesbarkeit 8/10, Weltgestaltung 8/10, Einstieg 8/10, Kampfabwechslung 7/10.** Der größte Gewinn ist die erkennbare Trennung zwischen Dorfleben, Auftragstreffpunkten und einem bewusst betretenen Kampfplatz. Die Lernerklärungen nehmen keine Sicht auf Bodenangriffe. Buffs eröffnen Vorbereitung vor dem eigentlichen Schlagabtausch.

Der Kampf nutzt weiterhin überwiegend denselben Satz von Gegnerangriffen. Zusätzliche Mechaniken, die speziell zu einem besetzten Lager gehören, wären ein sinnvoller nächster Ausbau. Die kleinen Ausstattungsobjekte sind überwiegend Kulisse; eine Wirtschaft oder echte dauerhafte Gebietskontrolle wird dadurch nicht simuliert.

## Belege

- [Runde 1: freie Sicht und Lernleiste](polish-iteration-1.png)
- [Runde 2: Straßen und Grundstücksdetails](polish-iteration-2.png)
- [Runde 3: Lagerrand](polish-iteration-3.png) und [betretenes Außenlager](polish-camp-play.png)
- [Runde 4: im Kampf verdienter und aktivierter Buff](polish-iteration-4.png)
- [Runde 5: Pfandhof](polish-iteration-5-hub.png), [Karte](polish-iteration-5-map.png), [acht Fähigkeiten mobil](polish-iteration-5-mobile.png)

44 automatisierte Tests bestanden. Sechs Weltvarianten bestanden ihre Generierung einschließlich je 499 erreichbarer Haustüren und 40 geprüfter Wege zu Questpunkten, Lagern, Anlaufpunkten und Treffpunkten. Die Browserdurchläufe meldeten keine JavaScript-Ausnahmen. Das ist eine Prüfung des lokalen Prototyps, keine Leistungs- oder Balancegarantie für alle Geräte.
