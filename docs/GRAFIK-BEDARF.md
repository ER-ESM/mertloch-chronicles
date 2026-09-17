# Grafikbedarf der UI

Für alles, was nicht aus `content/` kommt (UI-Icons, Rahmen, Fenster-Embleme, HUD-Elemente). Inhaltliche Bilder (Items, Gegner, Bosse, NPCs, Skills) stehen automatisch in `content/ART-BRIEF.md`.

Format je Zeile: ID · Zweck · Größe · Bildhinweis · aktueller Fallback.

| ID | Zweck | Größe | Bildhinweis | Fallback |
|---|---|---|---|---|
| `ui-elite-badge` | Elite-Kennzeichen im Zielfenster und auf der Karte | 16×16 | Goldener Bierdeckel mit Stern | Text „ELITE“ |
| `ui-speech-bubble` | Sprechblase für Boss- und Bewohnersprüche | 9-Slice, 32×24 | Pergament-Sprechblase mit Pflaumentinte-Rand | Rechteck |
| `ui-chapter-lock` | Ausgegraute Kapitel 2/3 im Auftragsbuch | 24×24 | Vorhängeschloss aus Kronkorken | Text „bald“ |
| `ui-menu`, `ui-sound`, `ui-fullscreen` | HUD-Knöpfe rechts unten, heute Unicode ☷ ♫ ⛶ | 20×20 | Holzknopf mit Bierdeckel-Motiv: Liste / Note / Rahmen | Unicode-Zeichen |
| `ui-reward` | Belohnungskasten im Dialog, heute ♜ | 24×24 | Goldener Dosenöffner | Unicode ♜ |
| `ui-tab-figur`, `ui-tab-rucksack`, `ui-tab-kniffe`, `ui-tab-auftraege`, `ui-tab-karte`, `ui-tab-hilfe` | Reiterleiste des Clanbuchs (docs/MENUE-BEWERTUNG-2026-09-17.md) | 24×24 | Porträtrahmen / Rucksack / Kronkorken-Kelle / Aushang / Karte / Fragezeichen auf Bierdeckel | Buchstaben K C J M N |
## Ausrüstung 0.14

Die neuen Plätze verwenden eigene Pixel-Fallbacks in `item-art.js`: helmet, necklace, shoulders, bracers, gloves, belt, trousers, trinket, blade, maul und slingshot. Sie sind bereits in Rucksack, Charakter und Tooltips angebunden. Für spätere gezeichnete Varianten gilt dieselbe Clan-Palette und ein transparenter 24/48-Pixel-Export; die vier festen neuen Waffen-/Schild-IDs stehen mit `look` im generierten ART-BRIEF. Das App-Symbol ist ein eigenes SVG mit daraus gerenderten 192-/512-Pixel-PNGs in `assets/app/`.
## Erledigt · UI 0.18.1

Menü, Ton, Vollbild und Journal sind über `ui-art.js` angebunden. Die Dialogbelohnung nutzt nun einen nativen goldenen Dosenöffner (`reward`, 24-Pixel-Raster); die Touchkonfiguration das vorhandene Menü-Sprite. Die früheren Unicode-Fallbacks dieser Bedienelemente sind ersetzt. C1 bleibt als separate Entscheidung offen.

## Dialog-Atlas 4×5 (Story, 2026-09-17)

`content/portraits.js` ist von vier auf fünf Zeilen gewachsen: Zwei neue Gesprächsfiguren aus Akt 1 haben Nebenquests bekommen und brauchen darum eine eigene Zelle im `assets/content-art/npcs/dialogue-atlas.png`.

| Zelle | ID | Figur | Bildhinweis |
|---|---|---|---|
| 16 | `kurt` | Kegelbruder Kurt | Vereinspolo „Alle Neune Kalt“, Bauchansatz, Kegel unterm Arm, Besen statt Kugel – der Versöhnliche aus Kalt |
| 17 | `timo` | Trauzeuge Timo | Schärpe, Bierbong, drei Tage wach, Sonnenbrand, unerschütterlich gut gelaunt |

Bis die Zellen 12–17 gezeichnet sind, malt die Gesprächs-UI Porträts über `PERSON_APPEARANCE`; Pit, Kurt und Timo zeigen ihren Anfangsbuchstaben. Kein Blocker, nur eine Lücke.

## Offen nach der Anbindung der Lieferung 2026-09-17

Angebunden sind die sechs gelieferten Reiter, sieben HUD-Symbole, Schwungzustände, Proc-Rahmen/-Marker,
Sprechblase (9-Slice), Übungspuppe, alle Helden-, Auftraggeber-, Bewohner-, Gegner- und Bossbögen,
18 Gegenstandsbilder und die 18 neuen Proc-Talente. Nicht aus dieser Lieferung abgedeckt und weiter offen:

| ID | Zweck | Größe | Bildhinweis | Fallback heute |
|---|---|---|---|---|
| `ui-tab-bude` | Siebter Reiter „Bude“ des Clanbuchs — die Lieferung enthält nur sechs Reiter | 24×24 | Bretterbude mit Bierkasten davor, gleiche Machart wie die sechs anderen Reiter | altes `reinforced`-Sprite |
| `anni-poses`, `anni-walk` | Aperol-Anni als dritte Spielfigur; Dieter und Kevin haben neue Bögen, Anni steht weiter auf dem alten `maifeld-live`-Bogen | 96×96, 4 Richtungen | wie Dieter/Kevin, Maßstab 52 nativ | `assets/maifeld-live/runtime/anni-*.png` |
| `warden` | Ruhewärter (Feldgegner, `skin:'warden'`) | 96×96, 4 Richtungen × 4 Spalten | wie Schnorrer/Praktikant | alte Rigfigur |
| `badger`, `goose`, `boar` | Dachs, Gans, Pfandkeiler als Richtungsbögen wie Rabe und Fuchs | 96×96 | wie `raven`/`fox` | Rig-Animation aus `maifeld-live` |
| Porträt `pit` | Zelle 15 des Dialogatlas (`content/portraits.js`) | Atlaszelle | siehe `docs/backlog/ui.md` | Anfangsbuchstabe |
| Kapitel-Kulissen | Sperrmüllplatz, Kegelbahn-Trümmer, Bus im Feld, Bude mit Ausbaustufen | siehe Abschnitt „Kapitel-Kulissen“ unten | Arten, Maße und Farben in der Tabelle unten; Objekte liefert die Welt (`world.camps[].props`, `world.base`) | gezeichnete Ersatzobjekte |

## Kapitel-Kulissen (Welt 0.20, `world-prop-kinds.js`)

Die Welt setzt an jedem Kapitel-Lager feste Kulissen-Objekte und legt das Gelände der Bude an (`world.camps[].props`,
`world.base.stageProps`). Jedes Objekt hat `kind`, Mittelpunkt `x`/`y`, Grundfläche `w`×`h` in Welteinheiten, eine
Zeichenhöhe und eine Fallback-Farbe; gezeichnet wird in der UI (docs/backlog/ui.md). Maßstab: ein Erwachsener ist
26 Einheiten hoch (docs/MASSSTAB-2026-09-17.md). Nur `bus` und `schrotthaufen` sind echte Hindernisse.

| ID | Kapitel / Ort | Grundfläche | Höhe | Bildhinweis | Fallback |
|---|---|---|---|---|---|
| `schrotthaufen` | 2 · Sperrmüllplatz | 56×40 | 34 | Berg aus Felgen, Heizkörpern, Fahrradrahmen, oben eine Waschmaschinentrommel | Fläche `#7d7a72` |
| `haenger` | 2 · Sperrmüllplatz | 46×26 | 20 | Einachser mit Bordwand, Nummernschild schief, Gitter-Aufsatz voll Schrott | `#8c5a44` |
| `kuehlschrank` | 2 · Sperrmüllplatz | 16×13 | 22 | Alter Kühlschrank ohne Tür, Aufkleber, Rost am Fuß, liegt halb schräg | `#d7d2c2` |
| `kegelbahn` | 3 · Festplatz | 62×18 | 11 | Zerlegte Bahn: zwei Bohlen, Kabelrolle, Kugelrücklauf, ein Kegel steht noch | `#c8a469` |
| `bierbank` | 3 · Festplatz | 44×12 | 12 | Umgestürzte Bierzeltgarnitur, ein Bein geknickt, Bierring auf dem Brett | `#b88a4f` |
| `kegelkugel` | 3 · Festplatz | 9×9 | 9 | Schwarze Kugel mit drei Löchern, im Gras eingesunken | `#3b3540` |
| `bus` | 4 · Bus im Feld | 104×30 | 44 | Reisebus quer im Acker, Girlanden und Schärpe an den Spiegeln, Tank leer, Tür offen | `#d8c04e` |
| `bierkasten` | 4 · Bus im Feld | 14×11 | 12 | Leerer Kasten, Flaschen quer, einer als Hocker umgedreht | `#9c5c39` |
| `bierbong` | 4 · Bus im Feld | 12×12 | 16 | Trichter mit Schlauch an einem Stock, Edding-Beschriftung | `#5f8f6a` |
| `bude-truemmer` | Bude · Stufe 0 | 34×22 | 12 | Bretterhaufen, halbes Dach, umgekippter Grill, Absperrband | `#6f6558` |
| `bude-tresen` | Bude · Dieter | 54×20 | 20 | Europaletten-Tresen, Bierdeckel als Fliesen, Kronkorken-Leiste, später Zapfhahn | `#a97c4c` |
| `bude-grill` | Bude · Oskar | 32×22 | 24 | Halbe Öltonne auf Beinen, Rost aus Einkaufswagen, Rauchfahne | `#6d6a66` |
| `bude-werkstatt` | Bude · Kevin | 40×26 | 26 | Ausgeschlachteter Kühlschrank als Werkbank, Kabelbinder, Schild „HÄLT SCHON“ | `#8a9298` |
| `bude-anlage` | Bude · Leander | 34×30 | 30 | Turm aus Bollerboxen auf Bierkästen, Kabelsalat, später Subwoofer-Wand | `#4d4757` |
| `bude-landhausecke` | Bude · Anni | 46×28 | 22 | Palettensofa mit karierten Kissen, Lichterkette, Aperol-Bar, Ringlicht | `#c9a8b4` |
| `bude-pfandlager` | Bude · Ida | 44×26 | 28 | Palettenregal voller Bierkästen, Pfandbon-Rolle, Klemmbrett | `#7f9a6d` |

Jede Stufe eines Basisbau-Gebäudes ist dieselbe Art in wachsender Größe (`0.6 → 1.0` der Tabellengröße); der Stufenname
kommt aus `content/buildings.js`. Für gezeichnete Varianten gilt die Clan-Palette aus ART-DIRECTION.md.
