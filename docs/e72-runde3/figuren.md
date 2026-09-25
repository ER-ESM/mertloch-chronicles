# E-72 Runde 3 · Figuren: Klassenkleidung vom Kleiderhaufen (Entwurf, nicht freigegeben)

Branch `e72-figuren`. Figurengrafik: erst auf main, wenn der Nutzer sie freigibt.

## Befund (Ist-Stand auf main)
- Die Hofprobe gibt **allen fünf Klassen dieselbe Kutte**: `TUTORIAL.starterEquipment.body='kutte'` in `content/tutorial.js`. Das wird in `tutorial.js` beim ersten Gespräch mit Ida angelegt. „Annis Schürze“, „Kevins Werkzeuggürtel“, „Schorschs Grillschürze“ und „Käthes Strickjacke“ gibt es nur als Satz in `TUTORIAL.clothes`.
- Schorsch und Käthe tragen danach also weder eine allgemeine `schuerze` noch eine `strickjacke`. Beides sind nur NPC-Quellen der Puppe ohne Gegenstand. Sie tragen die Kutte, genau wie Dieter, Anni und Kevin.
- In der Heldenerstellung stehen alle in Unterwäsche. Das ist gewollt (E-68).
- In der Welt unterscheiden sich die Klassen deshalb nur über Körper und Haar, nicht über die Kleidung.

## Entwurf
- **Schorsch:**
  - Grillschürze `grillschuerze` (Brust): Kohle-Canvas mit Cognac-Riemen und Messingnieten, Glutzeichen auf dem Latz und angesengtem Saum.
  - Dazu ein rot-weißes Geschirrtuch am Band und eine Seitentasche mit Grillthermometer.
  - Von hinten sieht man das Band mit Knoten und die Rockkanten.
  - Schiebermütze `schorschmuetze` (Kopf): grauer Fischgrat, vorn über den Schirm gezogen.
- **Käthe:**
  - Grobe lila Strickjacke `kaethestrickjacke` (Brust): Zopfmuster, Schalkragen aus Naturwolle, Holzknöpfe und ein Kreuz-Ass in der Brusttasche. Sie reicht bis zur Mitte der Oberschenkel.
  - Lesebrille an der Kette `kaethebrille` (Hals): goldene Gläser auf den Augen, die eine Editor-Brille überdecken, und eine Perlenkette hinter die Ohren. Von hinten liegt die Kette als Schlaufe im Nacken.
  - Der Dutt bleibt stehen.
- **Zuteilung:** Die Hofprobe legt `CLASS_CLOTHES` (`content/tutorial.js`) über die Startausrüstung. Nur Schorsch und Käthe haben einen Eintrag. Dieter, Anni und Kevin behalten die Kutte.
- **Werte:** Brustteil wie die Kutte (1 Dicke Haut). Die Mütze gibt 1 Standfestigkeit, die Brille 1 Bastelgrips. Das ist ein kleiner Vorsprung gegenüber der Kutte allein.
- **Code:**
  - Zeichnung: `tools/paperdoll/klassen-kleidung.mjs`, in `puppe.mjs` angemeldet.
  - Bögen: `--runtime` und `--reiten` neu gebaut. Nur neue Dateien und Kataloge ändern sich, alle anderen Bögen bleiben bytegleich.

## Prüfen
- `node tools/paperdoll/klassen-vergleich.mjs` erzeugt `docs/e72-runde3/figuren/vergleich.jpg` aus den Laufzeit-Bögen: 3 Körper × 5 Klassen × vorn/Seite/hinten. Oben steht die Nahansicht (1×), unten die Weltgröße bei Desktop-Zoom (2×).
- `node scripts/e72-figuren-check.mjs` (Port 4283) läuft je Klasse durch das echte Spiel: Erstellung, dann zu Ida, F drücken, „Ausrüstung nehmen“. Danach prüft es die Ausrüstung und legt Welt- und Nahaufnahmen ab. `welt-alle-3x.jpg` zeigt alle fünf Klassen nebeneinander im Dorf.
- Tests: `tests/paperdoll-klassenkleidung.test.mjs`, `tests/starting-clothes.test.mjs` (neuer Fall).

## Offen
- **Käthe:** Die graue Dauerwelle aus ihrem Aussehenstext gibt es im Editor nicht. Ihr Vorschlag bleibt der Schwungvoll-Körper mit Dutt und orangem Haargummi. Von hinten und im Umriss liest sie sich deshalb wie „Anni mit grauem Haar“. Das gehört als Frisur in den Editor, nicht in die Kleidung.
- **Anni und Kevin:** „Annis Schürze“ und „Kevins Werkzeuggürtel“ fehlen als Gegenstände. Beide tragen weiter die Kutte, deshalb bleiben die drei alten Klassen in der Welt gleich angezogen.
- **Zusammenführen mit `anziehpuppe` (Waffenkammer):** Beide Stände bauen `assets/paperdoll/runtime/catalog.json` und `reiten/*` neu. Nach dem Zusammenführen `--runtime` und `--reiten` einmal voll bauen, danach `pwa-cache`.
