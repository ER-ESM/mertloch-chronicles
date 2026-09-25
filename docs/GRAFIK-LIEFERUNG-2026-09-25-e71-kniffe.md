# Kniff-Icons für E-72 (Klassen-Ressourcen) · 25.09.2026 · geliefert, per Code gezeichnet

**Stand:** Alle 28 Kniff-Icons sind im Spiel. Die Laufzeit findet sie selbst über `contentAsset('skill-<klasse>-<kniff>')`
in `paintSkillIcon` (`skill-art.js`), ohne Codeänderung an Engine oder Oberfläche. Die Icons sind **per Code gezeichnet**,
nicht mit Imagegen erzeugt: Codex hat den Bildauftrag abgelehnt, weil das Nutzungskontingent des ChatGPT-Abos erschöpft ist
(„try again at Sep 26th, 2026 9:21 PM"). Das Imagegen-Auftragsblatt bleibt für einen späteren Ersatz liegen (unten).

(Die Dateinamen tragen noch `e71`, weil die Entscheidung erst nachträglich E-72 heißt; E-71 ist die Dungeon-Sitzung.)

## Was geliefert ist

| Klasse | Kniffe (Asset `skill-<klasse>-<kniff>`) | Motiv bei 48 px |
|---|---|---|
| Schwenker-Schorsch (14) | `auto` Zangenklapper · `strike` Grillzange · `mark` Auflegen · `burst` Servieren · `interrupt` Zange zu! · `parry` Grilldeckel · `dash` Kohlen-Sprint · `heal` Ablöschen · `buff` Blasebalg · `throw` Glutbrocken · `ground` Schwenkgrill · `senf` Senf drauf! · `spiritus` Spiritus-Schwall · `deckelzu` Deckel zu! | Grillzange in Goldpfeilen · Zange mit Funkenstern · rohe Wurst auf Rost über Glut, Zange · Teller mit Schwenkbraten und Wurst, Dampf · Scherenzange beißt Blitz entzwei · Kugelgrilldeckel als Schild, Funken · Arbeitsstiefel, glühende Fußspur · Bierflasche über Glut, Dampffahnen, grünes Plus · Blasebalg (Brett, Lederfalten, Messingdüse) facht Flamme an · glühender Brocken mit Flammenschweif · Rost an Kette am Dreibein über Feuer · Senftube über Bratwurst, grünes Plus · Spiritusflasche, Strahl, Stichflamme · zugeklappter Kugelgrill, Rauch quillt |
| Kreuz-Käthe (12) | `auto` Kartenschnipsen · `interrupt` Kontra! · `parry` Gemauert · `dash` Abgang · `heal` Eierlikörchen · `buff` Neu geben · `throw` Abrechnen · `ground` Kartenregen · `reizen` · `handlesen` · `gezinkt` · `aermel` | Karte (Kreuz-Ass) in Goldpfeilen · Faust mit Strickjackenbündchen auf Karte · Mauer aus Karten · Bein in Strumpf, weinroter Schuh, Staub · Stielglas Eierlikör, grünes Plus · gefächerte Karten im Pfeilkreis · Skatblock mit Summendoppelstrich, Bleistift · fallende Karten ♥♣♦♠, Goldring · Sprechblase „18" · Handfläche mit Linien und Herz · Karte unter Lupe mit Markierung · Pik-Ass steckt im Ärmel |
| Dosen-Dieter (1) | `zeche` Zeche prellen | Faust auf Kassenbon am Tresen, Münzen fliegen |
| Klo-Kevin (1) | `reload` Pfandautomat | Rückgabeautomat, grüne Flasche im Einwurf, goldener Pfandbon |

Keine Bilder für Käthes Plätze 1–3 (`strike`/`mark`/`burst`): die Karten zeichnet das Spiel selbst. Die Klassenbuffs
(`grillteller`, `wurstbroetchen`, `glueckspfennig`, `strickschal`) malt weiterhin `paintClassBuffIcon`.

**Kontaktbogen:** `docs/e71-abnahme/kniffe/kontaktbogen.png`. Die Icons sind in 48-px-Darstellung wie im Spiel gezeigt
(`drawContentIcon`: Nächster Nachbar 64 → 48) und zweifach vergrößert. Spalte 1 zeigt alte Kniffe zum Vergleich, rechts
vom Goldstrich folgen je Zeile sieben neue:
Schorsch 1–7, Schorsch 8–14, Käthe 1–7, Käthe 8–12 + Zeche + Pfandautomat. Die letzte Zeile zeigt nur alte Kniffe von
Dieter, Kevin und Anni.

## Stil

Die neuen Icons folgen den Kacheln der Dieter-/Kevin-Kniffe:
- moosgrüner, fleckiger Vollgrund 58 × 58 mit 1 px Tintenrand (`23,31,41`) auf 64 × 64, dazu 3 px freier Rand, wie der Export ihn bei allen Kniffen setzt;
- ein Motiv mit 1 px Tintenkontur und Rampenschattierung: Licht und Glanz oben links, dunkle Kante unten rechts;
- Schlagschatten 2 px nach unten rechts auf den Grund;
- Funken und Bewegungsstriche ohne Schatten.

Die Autoangriffe tragen wie `auto-dieter`/`auto-kevin` die zwei goldenen Kreispfeile. Alle Farben stammen aus
`PRECISION_PALETTE`.

**Ehrlich zur Qualität:** Neben den Imagegen-Kacheln wirken die Code-Icons klarer, aber flacher und weniger gemalt. Die
Motive füllen oft 65–80 % der Kachel statt 85 %. Lesbar bei 48 px sind alle. Am schwächsten wirken im Vergleich:
- `schorsch-parry` (Deckel eher flache Halbkugel);
- `kaethe-dash` (Bein und Schuh blockig);
- `kevin-reload` (Automat wirkt wie ein Tresor).

Das sind die ersten Kandidaten für den Imagegen-Ersatz.

## Werkzeug, Herkunft, Export

| Datei | Zweck |
|---|---|
| `tools/sprite-pipeline/e71-kniffe-draw.mjs` | Zeichenwerkzeug: Masken aus Rechteck, Kreis/Ellipse, Polygon, Linie, Ringstück; Teile mit Außenkontur und Rampenschattierung; deterministischer Moosgrund je ID. `node … [--only=id,id]` schreibt die Originale und `herkunft.json`, `--kontaktbogen` den Abnahmebogen aus dem Laufzeitkatalog. |
| `assets/precision/sources/2026-09-25/e71-kniffe/<id>.png` | 28 Originale (64 × 64), Ausgabepfade wie im Auftragsblatt |
| `assets/precision/sources/2026-09-25/e71-kniffe/herkunft.json` | Herkunft je Original: `kind: "code"`, `tool`, `date`, Maße, `sha256`. Nicht in `generation.json`: die ist dem Imagegen-Werkzeug vorbehalten (Test verlangt `tool: "built-in imagegen"` und Prompt). |
| `tools/sprite-pipeline/e71-kniffe-jobs.json` | Auftragsblatt (id, output, 64 × 64, Rand 3, `kind: "skills"`, `delivery: "2026-09-25"`). Der Export liest es, und Imagegen kann es später unverändert verwenden. |
| `tools/sprite-pipeline/precision-september.mjs` | Auftragsblatt an die Liste `jobs` angehängt → `npm run sprites:precision` legt `assets/precision/runtime/skills/<id>.png` und die Katalogeinträge (`source`, `sourceHash`, `delivery`) an |
| `precache-manifest.js` | neu erzeugt (`node scripts/pwa-cache.mjs`), enthält die 28 Laufzeitbilder |
| `tests/e71-kniffe.test.mjs` | 5 Prüfungen: Auftragsblatt und Zeichenwerkzeug decken dieselben 28 IDs; Herkunft (Hash) stimmt und das Werkzeug zeichnet jedes Original byte-genau nach; Kachelform (Rand frei, 58 × 58 deckend, Tintenrand); Katalogeinträge zeigen aufs Original; jeder Leistenkniff von Schorsch und Käthe und jeder Ressourcen-Kniff (`RESOURCE_SKILLS`) hat ein Bild. |

Der Export übernimmt Form und Lage 1 : 1 (Maßstab 1, weil die Kachel genau 58 × 58 misst). Einzelne Farben rundet sein
Palettencache (`precisionColor`, Schlüssel `rgb >> 2`) auf Nachbartöne, höchstens 3 Stufen. Der Export bleibt
byte-reproduzierbar (`tests/art-precision.test.mjs`). Außer den 28 neuen Einträgen hat sich im Katalog nichts geändert.

## Später durch Imagegen ersetzen

Das Auftragsblatt `tools/sprite-pipeline/e71-kniffe-jobs.json` ist unverändert einsatzbereit: 28 Prompts im Kachelstil
mit den Stilvorlagen `stilvorlage-kniff-kachel.png` (Dieter-Zelle „Wurf") und `stilvorlage-kniff-auto.png`
(`auto-dieter`). Ab 26.09.2026, 21:21 Uhr (oder nach Aufstocken des Kontingents):

1. **Allein laufen lassen.** `imagegen.mjs` nimmt das jüngste neue PNG aus `~/.codex/generated_images/`; eine parallele
   Sitzung könnte ein fremdes Bild unterschieben.
2. Probe: `npm run sprites:generate -- tools/sprite-pipeline/e71-kniffe-jobs.json --only=skill-schorsch-strike,skill-kaethe-aermel,skill-dieter-zeche --force`
   (ohne `--force` überspringt das Werkzeug die vorhandenen Code-Originale). Originale ansehen, Prompts schärfen.
3. Rest mit `--force`, gern gezielt die schwächsten zuerst (`schorsch-parry`, `kaethe-dash`, `kevin-reload`).
4. **Für jedes ersetzte Original den Eintrag aus `herkunft.json` löschen.** Sonst meldet `tests/e71-kniffe.test.mjs`
   den Hash-Unterschied; das ist gewollt, damit keine falsche Herkunft stehen bleibt. Der Test verlangt für jedes Original
   eine Herkunft, entweder in `herkunft.json` oder in `generation.json`.
5. `npm run sprites:precision && node scripts/pwa-cache.mjs`, Kontaktbogen neu
   (`node tools/sprite-pipeline/e71-kniffe-draw.mjs --kontaktbogen`), ansehen, `npm test`.

Der Export skaliert große Imagegen-Originale selbst auf 58 × 58 (Rand 3), wie bei den übrigen Kniffen.

## Protokoll

- 25.09. 15:31: Imagegen-Probe (3 Motive) nach 7 s abgelehnt, Nutzungslimit. Kosten 0, `generation.json` unverändert.
- Danach auf Anweisung des Orchestrators per Code gezeichnet. Fünf Sichtungsrunden bei 48 px neben alten Kniffen;
  nachgebessert wurden:
  - ruhigerer Grund, größere Motive;
  - Grillzange mit breiten Greifern, „Zange zu!" als Scherenzange;
  - Glutbrocken als Komet statt Kegel;
  - Blasebalg (Seitenansicht verworfen, Schrägansicht mit Lederfalten);
  - Dampf als Fahnen statt Wolke;
  - Faust von vorn mit Knöcheln unten;
  - Ass steckt im Bündchen;
  - Schuh mit Strumpfbein;
  - Steak mit Fettrand und Grillstreifen.
- Laufzeit Export etwa 35 s, Zeichnen aller 28 Motive unter 1 s.

## Prüfung

`npm test` grün (siehe Commit). `tests/art-precision.test.mjs` bestätigt Palette, harte Alpha-Kante, Quellen-Hashes,
Precache und die byte-genaue Reproduzierbarkeit des Präzisionsexports. Ein Browsertest der Leiste mit Schorsch und Käthe
steht aus: die Anbindung prüft nur der Test über Katalog und `skillsFor`.
