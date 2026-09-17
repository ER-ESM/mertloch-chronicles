# Fehlende Sprites · Stand 2026-09-17

Übergabe an die Bild-KI: alles, was das Spiel heute nur mit einem Fallback zeichnet. Reihenfolge = Priorität. Stil, Maßstab, Ablage und Abnahme stehen in `docs/UEBERGABE-GRAFIK-2026-09-17.md`; Bildhinweise (`look`) kommen aus `content/` und stehen ausführlich in `content/ART-BRIEF.md` (`npm run content:art`).

Jede Zeile: **ID** · Motiv · Format · was das Spiel heute zeigt. Datei heißt wie die ID.

## 1 · Oberfläche (neu durch Clanbuch, Schwung und Procs)

| ID | Motiv | Format | Heute |
|---|---|---|---|
| `ui-tab-figur` | Porträtrahmen mit Clankutte | 24×24 | Person-Icon aus ui-art.js |
| `ui-tab-rucksack` | Lederrucksack mit Pfandflasche | 24×24 | Bag-Icon |
| `ui-tab-kniffe` | Kronkorken-Kelle gekreuzt mit Pinsel | 24×24 | Buch-Icon |
| `ui-tab-auftraege` | Aushang mit Reißzwecke | 24×24 | Quest-Icon |
| `ui-tab-karte` | gefaltete Karte mit Bierdeckel-Kompass | 24×24 | Karten-Icon |
| `ui-tab-hilfe` | Fragezeichen auf Bierdeckel | 24×24 | Buch-Icon |
| `ui-momentum-1/2/3` | ein, zwei, drei Bierdeckel-Pfeile (Schwung-Stapel) | 3 × 20×20 | Text-Chip „Schwung ▲▲“ |
| `ui-proc-frame` | goldener Leuchtrahmen für Proc-Kniffe, 9-Slice | 48×48 | CSS-Klasse `ready` (gelber Rand) |
| `ui-proc-free` / `ui-proc-empower` | kleine Ecken-Marker „gratis“ (Pfandmarke) und „×2“ (Doppelkelle) | 12×12 | Text-Chips |
| `ui-menu`, `ui-sound`, `ui-fullscreen` | Holzknöpfe mit Bierdeckel-Motiv | 20×20 | Unicode ☷ ♫ ⛶ |
| `ui-reward` | goldener Dosenöffner | 24×24 | Unicode ♜ |
| `ui-elite-badge` | goldener Bierdeckel mit Stern | 16×16 | Text „ELITE“ |
| `ui-speech-bubble` | Pergament-Sprechblase, Pflaumentinte-Rand, 9-Slice | 32×24 | Rechteck |
| `ui-chapter-lock` | Vorhängeschloss aus Kronkorken | 24×24 | Text „bald“ |
| `ui-arena-dummy` | Übungspuppe: Strohsack auf Bierkasten mit Zielscheibe | Sprite 26 px, 1 Frame + Wackeln | Fallback-Skin des gewählten Gegners |

## 2 · Helden im Detailstil (Stilbruch schließen)

| ID | Motiv | Format | Heute |
|---|---|---|---|
| `hero-dieter` | Dosen-Dieter wie `assets/content-art/aperol-anni/hero.png`: vier Richtungen, Stand/Gehen/Angriff, freie Hände für Ausrüstungsebenen | Bogen wie Anni | flache Comic-Figur |
| `hero-kevin` | Klo-Kevin, gleiches Rig | Bogen wie Anni | flache Comic-Figur |

## 3 · Gegner und Bosse (ohne eigenes Sprite)

| ID | Motiv (`look` in content/enemies.js) | Format | Heute |
|---|---|---|---|
| `enemy-raven` | Leergut-Rabe: schwarzer Rabe mit Kronkorken im Schnabel | 4 Richtungen, 2 Gehframes, 1 Angriff, 18–24 px | Gans |
| `enemy-fox` | Pfandfuchs: rostroter Fuchs mit Pfandbon im Maul | wie oben | Dachs |
| `enemy-scrounger` | Festzelt-Schnorrer: Bauchtasche, Bierbecher-Kette, Trainingsjacke | 26 px | Ruhewart |
| `enemy-inspector` | Ordnungsamt-Praktikant: Warnweste, Klemmbrett, zu große Dienstmütze | 26 px | Ruhewart |
| `enemy-alphaBoar` | Borsten-Bruno: riesiger Keiler mit Narbe, abgebrochener Hauer, Bierkasten-Aufkleber | 30 px | Keiler |
| `boss-gisela` | Gisela Gießkanne: Gartenschürze, Strohhut, riesige Gießkanne | 52 px, Idle + Angriff + Phasenpose | Horst |
| `boss-automat` | Der Pfandautomat 3000: mannshoher Automat auf Raupenketten, Greifarm, rotes Display | 52 px, Idle + Angriff + Phasenpose | Horst |
| `boss-horst` | Horst Nüchternmann im Detailstil (Panzer aus Hausordnungen, Aktenordner, Stempel) | 52 px | alter Comic-Sprite |

## 4 · Bewohner und Auftraggeber als Sprites

Porträts existieren (`assets/content-art/npcs/dialogue-atlas.png`), Welt-Sprites fehlen. Je Figur ein Bogen im Helden-Rig, 26 px: `npc-ida`, `npc-mara`, `npc-leander`, `npc-oskar`, `npc-fenja`, `npc-tilo`, `npc-jonna`, `npc-hedwig`, `npc-konrad`, `npc-fiete`, `npc-elke`, `npc-buergermeister`. Dazu die acht Bewohner-Varianten aus `content/npcs.js` VILLAGERS (`villager-0` … `villager-7`). Heute: Comic-Bewohner-Varianten.

## 5 · Gegenstände ohne eigenes Bild

Heute aus dem semantischen Icon-Atlas (`assets/content-art/items/semantic-atlas.png`) oder Pixel-Fallback. Je Gegenstand 24×24, Ablage `assets/content-art/items/<ID>.png`:

`topfdeckel`, `pfandschleuder`, `dosenklinge`, `tresenhammer`, `currywurst`, `kaltgetraenk`, `fuchsschwanz`, `flugblatt`, `hopfen`, `dosenblech`, `bierdeckelweste`, `kabelbinderstiefel`, `megafon` (Annis Hygiene-Hochdruckspray), `fuchspfote`, `schnorrerbecher`, `praktikantenausweis`, `giesskanne`, `automatenarm`. Bildhinweise: `look` in `content/items.js`.

## 6 · Talent-Motive für die 18 neuen Proc-Talente

Die Talent-Atlanten (`assets/content-art/talents/<figur>.png`) zeigen noch die alten Motive an diesen Positionen (Index 1 und 5 je Baum). Neue Motive 48×48 an derselben Atlasposition:

| Baum | Index | Talent | Motiv |
|---|---|---|---|
| dieter-wall | 1 | Deckel-Reflex | Bierdeckel prallt an einer Faust ab |
| dieter-wall | 5 | Tresenkante | Tresenkante mit Funken |
| dieter-brawl | 1 | Kellenwut | Kelle mit rotem Wutblitz |
| dieter-brawl | 5 | Nachschlag | zwei Kellen übereinander, Pfeil |
| dieter-brew | 1 | Nachfüllen | Zapfhahn tropft in ein Glas |
| dieter-brew | 5 | Zapfhahn auf | Zapfhahn ganz offen, Schaum |
| baerbel-care | 1 | Frisch gewischt | Pinsel mit Glanzstern |
| baerbel-care | 5 | Landfrauen-Glanz | Aperol-Glas mit Funkeln |
| baerbel-feedback | 1 | Putzprovision | Münze auf Putzlappen |
| baerbel-feedback | 5 | Mehrwegflasche | Flasche mit Rückgabepfeil |
| baerbel-stage | 1 | Bühnenfunke | Funke über Scheinwerfer |
| baerbel-stage | 5 | Zugabe-Rhythmus | drei Takte mit Zugabe-Stern |
| kevin-fuse | 1 | Zündfunke | Zündschnur mit Funke |
| kevin-fuse | 5 | Kurzschluss | zwei Kabel, Blitz |
| kevin-iron | 1 | Nietenpanzer | Blechplatte mit Nieten |
| kevin-iron | 5 | Dampfdruck | Manometer im roten Bereich |
| kevin-hunt | 1 | Fangschuss | Flasche im Flug, Zielkreuz |
| kevin-hunt | 5 | Beutefieber | Pfandbon mit Herzschlag |

## Reihenfolge und Abnahme

1. Abschnitt 1 (Oberfläche) zuerst: sofort sichtbar, kleine Bilder.
2. Abschnitt 2 (Helden): schließt den Stilbruch, größter Effekt auf den Gesamteindruck.
3. Abschnitte 3 bis 6 in dieser Reihenfolge.

Abnahme je Datei: Name = ID, PNG mit Transparenz, Größe wie angegeben, keine Beschriftung im Bild, Prompt in `assets/content-art/PROMPTS.md` nachgetragen. Die UI-Rolle bindet an (`docs/PIPELINE.md`, Rolle Grafik); bis dahin läuft das Spiel mit dem Fallback.
