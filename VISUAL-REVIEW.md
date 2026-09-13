# Aktuelle Sichtprüfung · 0.18.1 · 13.09.2026

Block A und B aus der visuellen Bewertung sind abgeschlossen. [Aufgaben, Vorher-/Nachher-Bildpaare und Prüfberichte](docs/UI-BLOCK-AB-2026-09-13.md). Die Bewertung unten ist eine eigene Sichtprüfung des tatsächlichen Browsers, keine aus Testzahlen abgeleitete Grafiknote.

| Bildschirm | Note / 5 | Aktueller Befund |
|---|---:|---|
| Dorfkern | 3 | Bewohner deckend, Kronentransparenz begrenzt, Straßenlabel lesbar; Stilentscheidung C1 offen. |
| HUD | 4 | Leere Plätze ruhig, echte Symbole, Ausweichen ohne abgeschnittenes Wort. |
| Gespräch | 5 | Personenbild, kurze Abschnitte, semantisches Belohnungsbild und klare Auswahl. |
| Die Bande | 4 | Gleiche Kartenhöhen und kurze Bio; Figurenstil noch uneinheitlich. |
| Charakter | 4 | Acht eindeutige Attributzeilen, kompakte Ausrüstung ohne Füllkopf. |
| Skillbuch | 4 | Icons und Auswahlstatus ohne Bedienabsätze; Hilfe zentral erreichbar. |
| Talente | 4 | Graph und Voraussetzungen lesbar; Bedienfuß entfernt, Icon-Stil C2 offen. |
| Kampfhilfe | 4 | Drei kurze Themenblöcke, gerätespezifische Tabelle und Skillkarten. Tabelle bleibt beim Blättern korrekt. |
| Rucksack | 4 | Klare Iconflächen, Suche und separate Gegenstandsdetails ohne Maus-Hinweisfuß. |
| Auftragsbuch | 4 | Kein doppelter Kicker, lesbare Aufgaben und Seiten. |
| Revierkarte | 5 | Orte, Ziele, Legende und Route weiterhin gut getrennt. |
| Mobil | 4 | Ausklappbare Hofprobe unter Spieler/Ziel, freie Kampfbuttons, passende Hilfetexte. |

**Gesamt: 4,1 / 5.** Die Vereinheitlichung der Weltgrafik bleibt von C1 abhängig.

Validierung: 163 Spieltests; 175 Menüzustände in drei Bildschirmformaten; 52 gezielte Nachprüfungen; Dialog-/Loot-/Minispiel- und Kampfbedienungstests. Ausführliche Belege im verlinkten Bericht.

---

# Sichtprüfung und fünf Überarbeitungsrunden

Stand: 11.09.2026 · Mertloch Chronicles 0.9.

Die fünf Runden wurden nacheinander implementiert, im Browser bedient und anhand der tatsächlich aufgenommenen Bilder bewertet. Die Bildübersicht mit umschaltbaren Runden steht unter [visual-review/index.html](visual-review/index.html).

## Ausgangslage 0.8

[Vorherbild](visual-review/before.png): blau umrandete Tannen neben Laubbäumen aus vergrößerten Büschen; gestreckte Pack-Dächer auf geometrischen Fassaden; Papierfiguren neben simplen Tieren; konkurrierende Namen und Questmarker; zu große HUD-Flächen. Die vorherigen Funktionstests belegten diese Bildqualität nicht.

## Runde 1 – Natur und Bodenanker

- Gemeinsame Vorlagen für Eiche, Apfelbaum, Tanne, Felsen und Lagerrequisiten erstellt. Die RGB-Hintergründe des Exports werden beim Spriteimport freigestellt.
- Spieltest: Startplatz, Laufen, Tab-Zielwahl, Clanauswahl, Karte und Handyansicht.
- Sichtbefund: Baumformen und Licht passen besser zusammen; im Apfelbaum waren noch helle Hintergrundlöcher sichtbar. Freistellung korrigiert und übermäßige Wiederholung kleiner Felsbüsche reduziert.
- Offen für die nächste Runde: Hausdächer, Fassaden und Figuren stammen sichtbar aus anderen Zeichenregeln.
- [Dorf](visual-review/round-1/village.png) · [Prüfbericht](visual-review/round-1/checks.json).

## Runde 2 – Vollständige Architektur

- Sechs Gebäudemotive statt gestreckter Dachfragmente: Fachwerkhaus, Wirtshaus, Strohhaus, Kirche, Scheune und Laden. Proportionales Zeichnen, gemeinsamer Fußpunkt am bestehenden Hauseingang.
- Neue Zelte und Vorräte für besetzte Lager; Gebäudekollisionen und Wegberechnung bleiben Bestandteil des vorhandenen Regelwerks.
- Spieltest: vom Kirchplatz auf die angrenzende Straße laufen, Zielwahl, Karte und mobile Darstellung.
- Sichtbefund: stimmigere Häuser und Baumgruppen; die alte Figurenfamilie und das gleichmäßige Pflaster fallen jetzt besonders auf.
- [Straße](visual-review/round-2/walking.png) · [Prüfbericht](visual-review/round-2/checks.json).

## Runde 3 – Clanfiguren

- Dieter, Bärbel, Kevin, Ida, Ruhewärter und Horst mit individuellen Comic-Silhouetten; Stand- und Gehpose, Richtungswechsel und feste Fußpunkte.
- Die Spielfigur ist etwa 26 Weltpixel hoch. Klassenportraits und Clanauswahl greifen auf dieselben Motive zu.
- Spieltest: laufen, die drei Klassenportraits öffnen und vergleichen, Tab-Zielwahl und Handyansicht.
- Sichtbefund: Clanidentitäten sind wesentlich besser lesbar. Bewohner-Dubletten, alte Tiere und glatte Dorfmöbel bleiben als sichtbare Brüche.
- [Clanauswahl](visual-review/round-3/clan.png) · [Prüfbericht](visual-review/round-3/checks.json).

## Runde 4 – Dorfleben, Wege und Kampfansicht

- Neue Dorfbewohner, Keiler, Dachs, Gans, Huhn, Katze, Bank, Bollerwagen, Brunnen und Questtafel.
- Natürlicheres Pflaster und ruhiger Wiesenuntergrund. Materialien werden über gemeinsame Straßenmasken gelegt; gespiegelte Wiederholung verhindert offene Texturanschlüsse.
- Kompakteres HUD, mehr sichtbare Welt, kollisionsbewusste Beschriftung. Hausüberdeckung folgt der tatsächlichen neuen Grafikfläche.
- Spieltest: Dorf, Kartenroute zum Grillplatz, Zielen per Maus/Tab, Buff, Markierung, Grundangriffe und Eskalation. Ein Gegner besiegt, 418 verursachter Gesamtschaden in dieser Runde.
- Sichtbefund: Figuren und Umgebung bilden eine gemeinsame Familie. Der alte explosive Trefferblitz verdeckt den Gegner; die glatte Lagerellipse wirkt künstlich. Beides geht in Runde 5.
- [Kampf vor der Effektkorrektur](visual-review/round-4/combat.png) · [Prüfbericht](visual-review/round-4/checks.json).

## Runde 5 – Korrekturen und erneute Sichtprüfung

- Offene Ringe und kleine Funken statt des deckenden Explosionssprites. Lager erhalten unregelmäßige Abnutzung statt großer Kreisflächen.
- Laternen und weitere Requisiten angepasst; Pfandhof und Wegestube ebenfalls mit den neuen Motiven ausgestattet.
- Zuschnittfehler an der Gehpose und am alten Dorfbewohner sowie weißer Hintergrund zwischen den Banklatten korrigiert. Alle 41 registrierten Motive und Materialausschnitte in einer eigenen Übersicht angesehen.
- Questgeberbilder ihren Personen zugeordnet; Namensabstand verkürzt, unnötige Tafelschrift entfernt und überlagernde Schutzkreisgrafiken entfernt.
- Artbook und Grafikwerkstatt zeigen die aktuelle Familie; verzogene Vorschauen, Leerflächen und fehlerhafte Umlaute korrigiert.
- Spieltests: erneuter Lagerkampf mit Buff und Eskalation, ein Gegner besiegt und 322 Gesamtschaden; beide äußeren Treffpunkte über die Kartenroute erreicht; Admin-Reset, Neuladen und Wiederherstellung; Kartenfilter, Zoom und Routen; Darstellung mit zwei, drei und acht Fähigkeiten.
- Sichtprüfungen bei 390×844, 768×1024, 1440×1000 und 1920×1080. Keine horizontalen Überläufe oder Laufzeitfehler. Baumdarstellung bei Weltzeit 0 und 999 pixelgleich.
- Ergebnis: In den geprüften Dorf-, Lager-, Menü- und Geräteansichten sind die identifizierten Stilbrüche, Zuschnittfehler und störenden Überlagerungen behoben.
- [Dorf](visual-review/round-5/village.png) · [Kampf](visual-review/round-5/combat.png) · [Acht Fähigkeiten mobil](visual-review/round-5/mobile-eight-skills.png) · [Pfandhof](visual-review/round-5/hub-pfandhof.png) · [Wegestube](visual-review/round-5/hub-wegestube.png).
- [Spriteübersicht](visual-review/round-5/sprite-review.png) · [Grafikprüfung](visual-review/round-5/art-audit.json) · [UI-Prüfung](visual-review/round-5/checks.json).

## Nachweise und Wiederholung

- `npm test`: 51 bestanden, 0 fehlgeschlagen.
- `scripts/visual-round.mjs N`: reale Tastaturbewegung, Zielwahl, Clan, Karte, Handyansicht und Screenshots pro Runde.
- `scripts/play-restyle.mjs`: Kartenroute, tatsächliche Bewegung, Gegnerauswahl, Buff und Kampf; temporärer Trainingsspielstand wird zurückgespielt.
- `scripts/test-admin-atlas.mjs`: Reset einschließlich widersprüchlichem Altspeicherstand, Neuladen, Sicherung wiederherstellen, Filter und Navigation.
- `scripts/audit-maifeld.mjs`: 41 gültige Ausschnitte, stehende Tanne, Spriteübersicht, vier Bildschirmgrößen sowie Artbook, Grafikwerkstatt und Weltschmiede. Im separaten Headless-Testbrowser lagen die gemessenen Frameabstände bei etwa 31 ms.
- `scripts/visit-polished-hubs.mjs`: Pfandhof und Wegestube über die bedienbare Weltkarte erreichen.

Die Browsertests wurden mit dem separaten Chrome-Profil `D:\Dev\tmp\mertloch-polish-browser` auf CDP-Port 9222 ausgeführt. Sie greifen nicht auf das normale Browserprofil des Nutzers zu. Server: localhost:4173. Neue Quelldateien und vollständige Prompts: [assets/maifeld-09/PROMPTS.md](assets/maifeld-09/PROMPTS.md).
