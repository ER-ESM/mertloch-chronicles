# Grafikreview: fünf Iterationen · 2026-09-17

## Urteil

Mit der ersten Lieferung war ich **nicht uneingeschränkt zufrieden**. Vor allem kleine Gegenstände wirkten verwaschen, obwohl ihre PNGs bereits binäres Alpha und harte Pixel hatten. Die Ursache war vor allem zu viel Bildinformation auf 24 × 24 Pixeln. Eine neue Vergleichsansicht machte zusätzlich einen Darstellungsfehler sichtbar: CSS verkleinerte Canvas-Flächen auf nicht ganzzahlige Größen.

Die 18 Gegenstände sind jetzt als vereinfachte, besser lesbare Motive unter ihren bisherigen IDs exportiert. Der Charakterbaukasten ist ein **funktionsfähiger Bewohner-Prototyp** mit vier Ansichten und acht Posen, kein fertig abgenommener Ersatz für sämtliche Helden, Waffen-, Zauber- und Todesanimationen.

[Werkstatt mit Vorher/Nachher, Seed-Generator und Downloads](https://er-esm.github.io/mertloch-chronicles/art-workshop.html)

## Die fünf Runden

| Runde | Eigener Sichtbefund | Änderung | Ergebnis / Grenze |
|---|---|---|---|
| 1 · Gegenstände | Currywurst, Dosenblech, Weste und Topfdeckel zerfallen bei 24 px in Farbflecken. | Neuer Imagegen-Bogen mit vereinfachten Silhouetten, großen Materialflächen und eindeutigen Hauptmerkmalen. Alle 18 Motive bei 24/48/96 px nebeneinander geprüft. | Wesentlich leichter zu unterscheiden; gleiche IDs und 24-px-Verträge. Die alte Fassung bleibt als Vergleich erhalten. |
| 2 · Bewegungen / Maßstab | Die Gesamtliste lädt vollständig. Neue generierte Körper wiederholen ähnliche Schritte; ein Grid-Zuschnitt nimmt Fremdfragmente auf. | Gezielter Korrekturauftrag für zwei Körperbögen; Silhouettenerkennung statt blindem Rasterzuschnitt; feste Skalierung und Kragen-/Fußregistrierung. Ganzzahlige Vergrößerung auch in der alten Galerie. | Originale Helden-Laufbögen bleiben erhalten. Die kurzen neuen Gehfolgen haben weiter Prototypstatus; ein anderer Hash beweist keine korrekte Schrittabfolge. |
| 3 · Gemeinsame Teile | Ein statischer Einrichtungsbaukasten reicht nicht. Erste Kappen sitzen zu groß/hoch; pauschales Umfärben gefährdet Haut und Gesicht. | Zwei kopflose Körper, vier Köpfe mit Rückansichten, zwei Huttypen; kleinere Kappe und korrigierter Aufsetzpunkt. Getrennte Kleidungsmasken. | Köpfe/Hüte sind echte separate Teile; Hemd/Hose werden nur in ihren Masken umgefärbt. Alle Teile lassen sich in jeder unterstützten Pose kombinieren. |
| 4 · Zufall / Vorrat | Freies Würfeln ohne gespeicherten Bauplan wäre nicht reproduzierbar. | Versioniertes Rezept, Seed + stabiler Bewohnerindex, gemeinsame Browser-/Node-Komposition, JSON- und PNG-Export; vier Themenrequisiten und vier konkrete Figuren daraus. | 432 unterschiedliche Kombinationen. Tuning-Timo, Gaming-Gina, Wetten-Willi und Putz-Petra sind Art-Entwürfe, keine neu eingebauten Storyfiguren. |
| 5 · Qualität / Übergabe | Technische Tests erkennen weder ein langweiliges Motiv noch falsche Beine. Die Vorschau muss selbst korrekte Pixel zeigen. | Tests für Reproduktion, Alpha, Palette, Masken, 432 Rezepte, ungültige Kombinationen; Browservergleich gegen exportierte PNGs, drei Hintergründe, Richtungswechsel, Downloads und mobile Größen. Projekt-Skill und aktualisierte Artist-/Reviewer-Hinweise. | Automatik prüft die technischen Verträge; die dokumentierte Sichtprüfung bleibt separat notwendig. |

## Bewertung der übrigen Lieferung

- **HUD und Reiter:** Im erneuten Sichtvergleich zusammengehörige warme Palette; Schwungstufen und Proc-Marker unterscheidbar, 9-Slice-Rahmen haben freie Mitte. Karte/Rucksack sind detailreicher als die Funktionssymbole; vor weiterer Miniaturisierung erneut bei Zielgröße prüfen.
- **Dieter/Kevin und Auftraggeber:** Die Proportionen orientieren sich an Anni. Identitäten und Kleidungsfarben bleiben erkennbar. Körperbögen allein bestätigen noch nicht die korrekte Waffenüberlagerung im Spiel.
- **Bewohner:** Die bisherigen individuellen Bögen bleiben die Quelle für benannte Figuren. Der Generator erweitert den Vorrat und soll nicht deren Persönlichkeit durch zufällige Köpfe ersetzen.
- **Gegner/Bosse:** Rabe/Fuchs, Menschen, Bruno und Bosskörper unterscheiden sich im vorgesehenen Maßstab. Aktuelle Stand-, Rück-, Angriffs- und Phasenansichten wurden erneut in der Galerie geprüft. Zwei Gehframes pro Tier sind weiterhin ein kurzer Zyklus, keine achtphasige Tieranimation.
- **Proc-Talente:** 18 Motive bleiben eindeutig; die alten 72 Talente werden nicht überschrieben. Keine weitere Neugenerierung in dieser Runde.

Nach dem Rebase hat die UI-Rolle die ursprüngliche 88-Asset-Lieferung bereits angebunden. Ein zusätzlicher Browser-Starttest im aktuellen Spiel lädt alle 88 Assets ohne JavaScript-Fehler; die Gegenstände melden `revision: readability-v2`. Der neue modulare Baukasten bleibt separat. Beleg: [aktueller Spielstart](../assets/content-art/refinement/review/live-world.png).

Das ist eine Abnahme der Grafikdateien und der Werkstatt. Es ist **kein erneuter vollständiger Kampf-/Quest-Spieltest** und keine Behauptung, dass alle neuen Assets bereits im Spielrenderer angebunden sind.

## Bibliothek und Dateivertrag

`assets/content-art/refinement/` enthält:

- `sources/`: acht unveränderte Imagegen-Ausgaben (sechs finale Quellen und zwei Erstfassungen), mit tatsächlichem Prompt und Referenz in benachbarten JSON-Dateien.
- `generation.json`: vollständige Herkunft und SHA-256 aller acht Quellen. Eingebautes Imagegen verwendet; konkrete Modellversion nicht ausgewiesen.
- `before-items/`: die bisherigen 18 Icons für den ehrlichen Vergleich.
- `runtime/items/`: 18 verbesserte Icons; `build-handoff.mjs` übernimmt diese auch nach `assets/content-art/items/<ID>.png`.
- `runtime/body-{stocky,slim}.png` plus semantische Masken: je 32 Körperposen.
- `runtime/heads.png`: vier Köpfe × vier Richtungen; `headwear.png`: zwei Hüte × vier Richtungen.
- `runtime/examples/`: zwölf reproduzierbare Beispielatlanten.
- `runtime/future/`: Ratsche, Slop-Laptop, Wettschein und Putzeimer (32 px), vier komplette Figurenatlanten und ihre Rezepte.
- `runtime/catalog.json`: Raster, Quellen, Sockets, Größen, unterstützte Posen und Prototypstatus.

Ein Körperframe ist 96 × 96 mit Fußpunkt (48,80). Kopflose Körper haben etwa 38 native Pixel, Köpfe 17 mit drei Pixeln Überlappung: Referenz-Körperhöhe 52 native Pixel = 26 Welteinheiten. Hüte dürfen darüber hinausragen. Eine Skalierung gilt für den ganzen Körperbogen. Masken sind technische Steuerbilder und nicht zum Anzeigen bestimmt.

432 Rezepte = 2 Körper × 4 Köpfe × 6 Hemdfarben × 3 Hosenfarben × 3 Hutoptionen (einschließlich ohne). Hautfarbe, Haare, Gesicht und Stiefel werden nicht global umgefärbt. Es gibt derzeit weder getrennte animierte Jacken/Ärmel noch Waffensockets für diesen neuen Baukasten. Diese Teile müssen mit vollständiger Posenmatrix ergänzt werden; ein Standbild an bewegte Arme zu heften wäre kein gültiger Ausbau.

## Befehle für weitere Sitzungen

```sh
node tools/sprite-pipeline/build-refinement.mjs
node tools/sprite-pipeline/build-handoff.mjs
node tools/sprite-pipeline/export-character.mjs --seed Dorfplatz --index 4 --out generated/characters/bewohner-4
node tools/sprite-pipeline/export-character.mjs --recipe generated/characters/bewohner-4.json --out generated/characters/wiederholung
node --test tests/art-refinement.test.mjs tests/art-handoff.test.mjs
npm test
npm run build
```

Die Verarbeitung eingefrorener Quellen ist deterministisch, die Bildgenerierung selbst nicht. Ein Rezept bleibt nur zusammen mit seiner Bibliotheksversion dauerhaft reproduzierbar. Version 1 nicht still durch andere Proportionen ersetzen.

Browserprüfung: `tools/sprite-pipeline/review-refinement.browser.js` über Playwright `browser_run_code_unsafe(filename=...)`; daneben `review-handoff.browser.js`. Standardserver: localhost:4187. Die Werkstatt schreibt keine Spielstände.

## Nachweise und nächste Schritte

Gesamtes Repository: `npm test` **273/273 bestanden** (nach Zusammenführen mit `2f102fe`), `npm run build` erfolgreich. Der Python-Skillvalidator war lokal mangels ausführbarer Python-Installation nicht startbar; Name, Beschreibung, Frontmatter und fehlende Platzhalter wurden separat geprüft. Die projektgebundene Anleitung ist über die bestehenden Sprite-Rollen und Pipeline-Dokumente verlinkt.

Gezielte Grafiktests: 11/11 bestanden. Alle 432 Rezeptkombinationen sind technisch in allen 32 Posen auf platzierbare Teile geprüft, für ihre Standansicht entstehen 432 unterschiedliche Pixelbilder. Die Sichtprüfung verwendet Kontaktbögen und ausgewählte Bewegungen; sie ist keine Einzelabnahme von 13.824 zusammengesetzten Frames.

Browser: 18 Vorher/Nachher-Vergleiche, helle/dunkle/grüne Hintergründe, vier Richtungen, laufende Animation, Seed-Wiederholung, Änderung des Seeds, JSON-/PNG-Downloads, pixelgleiche Browser-/Exportausgabe über alle 32 Posen eines Beispiels; Desktop 1440 × 1000 und mobil 390 × 844. Kein horizontaler Seitenüberlauf und keine JavaScript-/HTTP-Fehler.

Belege unter [refinement/review](../assets/content-art/refinement/review/): `items-dark.png`, `items-light.png`, `characters-se.png`, `characters-ne.png`, `future.png`, `mobile-builder.png`.

Für den nächsten Ausbau: acht echte Gehphasen pro Körperrig → animierte Kleidungs-/Armebenen → richtungsabhängige Waffen und Requisiten → Porträt aus denselben Teilen → erst dann Spielanbindung. Die vorhandenen vier Zukunftsfiguren brauchen für ein tatsächliches Auftreten einen Auftrag an die Story-/Gameplay-Rolle. Weltkacheln und Gebäude wurden in dieser Runde nicht verändert.
