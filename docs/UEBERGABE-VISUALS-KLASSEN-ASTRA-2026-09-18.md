# Übergabe an OpenAI Astra · Visuals für Klassen-Kernmechaniken und Talentbäume (E-32)

**Lieferstand 19.09.:** [Astra-Lieferung mit Laufkorrektur](ASTRA-E32-LIEFERUNG-2026-09-19.md) enthält 270 zugeordnete Talenticons, 45 Skill-/Variantenfelder, Weltobjekte, Effekte, HUD und Talentbaumdarstellung. Die Reihen-Fallbacks werden bei geladener Lieferung nicht mehr benutzt. 35 menschliche Figuren haben korrigierte Vier-Richtungs-Laufzyklen. Die folgende Liste bleibt als ursprünglicher Auftrag erhalten; ihre Platzhalterhinweise beschreiben den Stand vor dieser Lieferung.

Stand 2026-09-18. Diese Liste nennt alles Sichtbare, das die Umsetzung von [E-32](ENTSCHEIDUNGEN.md) braucht. Bis die
Grafiken da sind, läuft alles mit Platzhaltern (Farbfilter auf bestehenden Icons, Kreise/Linien im Renderer). Stil und
Pipeline wie in [UEBERGABE-3D-ASTRA-2026-09-18.md](UEBERGABE-3D-ASTRA-2026-09-18.md) und [GRAFIK-BEDARF.md](GRAFIK-BEDARF.md):
Präzisionspixel, 4× Dichte, Kraftpapier/Grün-Palette (Stil C „Bierdeckel", runde Linien nach E-28). Lieferung als PNG-
Bögen mit `catalog.json` wie bei `assets/content-art/`.

## 1 · Skill-Icons je Spezialisierung (48×48, Bogen `skills`)

Ab Stufe 5 deuten die Spezialisierungen vier Leistenplätze um. Je Spec ein Icon-Satz für Markierung / Eskalation /
Bodenkniff / Stärkung, plus die Variante (Zustand erfüllt). Namen in Anführungszeichen sind Spielnamen.

| Spec | Markierung (2) | Eskalation (3) | Bodenkniff (7) | Variante der Eskalation |
|---|---|---|---|---|
| Dieter · Türsteher | „Pfandschuld" (Bestand) | „Rausschmiss" – Stoß mit Tresenkante, Deckung fliegt weg | „Absperrband" (Bestand) | „HAUSVERBOT" (Goldrand, Türschild) |
| Dieter · Kneipenschläger | (Bestand) | „Abriss" – Bierkrug zerschellt, 10 Pegelstriche | „Tresensprung" (Bestand) | „ABRISS ×10" (voller Pegel) |
| Dieter · Zapfmeister | (Bestand) | „Fassanstich" – Zapfhahn schlägt ein Fass an | „Anstich" – Fass stellen | „FASSANSTICH" (Bierschaum-Explosion) |
| Bärbel · Landhaus-Lazarett | (Bestand) | „Großreinemachen" – Wischmopp mit Funken | „Nest" – Gans Gisela auf dem Nest | „GROSSREINEMACHEN" |
| Bärbel · Putzpyramide | „Schimmel" – grüner Fleck mit Sporen | „Durchputzen" – Sporen platzen | „Sporenwolke" – Wolke über Boden | „DURCHPUTZEN" |
| Bärbel · Filter-Furie | (Bestand) | „Auswringen" – Lappen wird ausgewrungen, Randale spritzt | „Wischer" – Kegel | „PUTZWUT" (rosa Glanz, alle Kniffe) |
| Kevin · Zündmeister | „Lunte" – Kabel mit Funkenlauf | „Kurzschluss" – Blitz springt über drei Ziele | (Bestand) | „KETTENREAKTION" |
| Kevin · Schrottkoloss | (Bestand) | „Überlast" – Robbi platzt | „Aufstellen" – Dosen-Robbi | „ÜBERLAST" |
| Kevin · Pfandjäger | (Bestand) | (Bestand) | (Bestand) | „JACKPOT" (drei Sterne) |

Bis dahin: bestehende Icons mit Farbfilter + Beschriftung (`.skill.variant`, seit Build #118 live).

## 2 · Talent-Icons (64×64, Bogen `talents`, 5 Spalten × 6 Reihen je Klasse heute)

Neu: **30 Talente je Spezialisierung = 90 je Klasse** (bisher 30 je Klasse). Bogenlayout neu: 10 Spalten × 9 Reihen je
Klasse (Reihe = Pfad, Spalte = Talentreihe 1–10). Motive kommen aus `content/talents.js` (Name + `info.effect`), je Pfad
eine Grundfarbe:

| Klasse | Pfad A | Pfad B | Pfad C |
|---|---|---|---|
| Dieter · Türsteher | „Türsteher-Kodex" (Deckung) | „Rausschmeißer" (Konter) | „Hausrecht" (Fläche) |
| Dieter · Kneipenschläger | „Dauerpegel" | „Blitzabriss" | „Rundenkämpfer" |
| Dieter · Zapfmeister | „Pils" (Tempo) | „Weizen" (Heilung) | „Bock" (Schaden) |
| Bärbel · Lazarett | „Vorrat" | „Gisela" | „Reinemachen" |
| Bärbel · Putzpyramide | „Sporen" (Ausbreitung) | „Provision" (Heilung) | „Downline" (Fläche) |
| Bärbel · Filter-Furie | „Dauerglanz" | „Putzwut" | „Wischer" |
| Kevin · Zündmeister | „Lunte" | „Kurzschluss" | „Kettenreaktion" |
| Kevin · Schrottkoloss | „Robbi" | „Nieten" (Deckung) | „Überlast" |
| Kevin · Pfandjäger | „Glückssträhne" | „Fangschuss" | „Jackpot" |

Bis dahin: Fallback-Icons je Reihe (`TALENT_ICON_FALLBACK`) mit Pfadfarbe.

## 3 · Platzierte Objekte in der Welt (Bogen `world-objects`, 4 Richtungen nicht nötig, 32×32 Welt-Pixel)

| Objekt | Beschreibung | Zustände |
|---|---|---|
| Fass „Pils" | Holzfass, grüner Anstich-Hahn, Schaumkrone | stehend · angestochen (Schaum sprudelt) · leer (Fass kippt) |
| Fass „Weizen" | Holzfass, goldener Hahn, Weizenähre am Deckel | wie oben |
| Fass „Bock" | dunkles Fass, roter Hahn, Bocksymbol | wie oben, leer = geplatzt |
| Dosen-Robbi | Automat aus Dosen, Greifarm (Asset `robotclaw` existiert als Item-Icon), Antennenlicht | steht · feuert (Arm vor) · Überlast (glüht rot) · Schrotthaufen |
| Gisela auf dem Nest | Gans (Familie `goose` existiert als Gegnerbogen) sitzt auf Strohnest | sitzt · schnattert (Hals gestreckt) |
| Sporenwolke | grüne, halbtransparente Wolke mit Sporenpunkten | 3 Frames Wabern |

## 4 · Effekte (Renderer, Bogen `fx`)

| Effekt | Beschreibung |
|---|---|
| Kettenblitz | gezackte Blitzlinie zwischen zwei Punkten, 3 Frames Flackern, hellblau/weiß; Endpunkt-Funke |
| Lunten-Explosion | kleiner Sprengkreis mit Kabelfunken, 4 Frames |
| Schimmel-Sprung | Sporenspur, die von Gegner A zu B fliegt, 3 Frames |
| Fassanstich | Schaumfontäne 5 Frames |
| Überlast | rot glühender Ring, dann Blechsplitter, 5 Frames |
| Pegel-Ablauf „Kater" | kleine Wolke mit Sternen über dem Helden, 3 Frames |
| „Prost!" | zwei anstoßende Gläser mit Spritzer über dem Helden (Filter-Furie: Parade während einer Gegner-Ansage), 3 Frames |

## 5 · HUD-Elemente (UI-Bogen, 2× Dichte)

| Element | Beschreibung |
|---|---|
| Pegel-Uhr | 10 Striche im Halbkreis über der Leiste, Ablaufring außen; Farbe von grün (frisch) nach rot (läuft ab) |
| Vorrat (Lazarett) | 5 Einmachgläser, füllen sich |
| Zustandsring „Putzwut" | rosa Ring um die Leiste mit Restzeit |
| Glücksrad (Pfandjäger) | drei Felder: Fehlzündung (grau), Normal (creme), Überzündung (gold); Zeiger |
| Fass-Restzeit | Miniatur der drei Fässer mit Uhr-Segment |
| Robbi-Leben | Mini-Balken mit Dosen-Symbol |

## 6 · Talentbaum-Redesign (UI-Bogen)

- Hintergrund: Bierdeckel-Netz aus Kraftpapier, drei Bahnen von unten nach oben (Pfadfarbe je Bahn), Wahlreihen als
  runde Untersetzer (64 px), Pfadknoten-Verbindungen als Kronkorken-Kette.
- Zustände je Untersetzer: gesperrt (grau, gestrichelt), wählbar (Kraftpapier, goldener Rand pulsiert), gelernt (Pfadfarbe
  gefüllt, Stempel „gelernt"), ausgeschlossen (verblasst, X-Stempel – in derselben Reihe wurde ein anderer gewählt).
- Pfadtreue-Anzeige: kleine Krone am Bahnkopf, die sich bei 4 und 7 Talenten desselben Pfades füllt.
- Mobil: eine Bahn je Bildschirmbreite, Wischgeste, langes Drücken = Tooltip.

## 7 · Lieferformat und Rückweg

PNG-Bögen + `catalog.json` (Frame-Rechtecke, Pivot, Namen wie in den Tabellen) nach `assets/content-art/<bogen>/`.
Der Renderer bindet über die bestehenden Katalog-Leser (`content-art.js`, `talent-art.js`, `skill-art.js`) an; fehlende
Motive fallen automatisch auf die Platzhalter zurück, das Spiel bricht nie.
