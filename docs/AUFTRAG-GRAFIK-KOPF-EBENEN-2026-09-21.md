# Auftrag an die Grafik-Sitzung · Kopf-Ebenen für Helden (Frisuren und Bärte, die das gezeichnete Haar ersetzen)

**Stand im Spiel.** Helden wählen Körper (Kräftig, Schwungvoll, Drahtig), Hautton, Haarfarbe, Bart (Stoppeln, Kinnbart, Vollbart),
Irokese, Brille, Sonnenbrille, Stirnband. Was fehlt: Frisuren, die das gezeichnete Haar **ersetzen** (Kurzhaar, Glatze, lange Haare) und
die Rasur beim Körper „Kräftig". Drei Code-Versuche sind am Bild gescheitert (Befunde in `docs/UEBERGABE-HELDEN-AUSSEHEN-2026-09-21.md`):
unter dem gezeichneten Haar ist im Körperbild nichts – Stirn, Schläfen, Ohren, Hinterkopf müssen gezeichnet werden.

**Die Aufnahme ist fertig und geprüft** (`hero-layers.js`, Test mit Platzhalter-Kacheln am 21.09.2026): Dateien ablegen, Katalog
schreiben – die Frisuren erscheinen ohne weitere Code-Arbeit in der Heldenerstellung, in der Halle, an der Spielfigur, im Porträt und bei
anderen Spielern.

## Was zu zeichnen ist

Je Körper (`dieter` = Kräftig, `baerbel` = Schwungvoll, `kevin` = Drahtig), im Stil und in der Pixelgröße der vorhandenen Körperbilder
(`assets/redesign/runtime/<held>-poses-base.png`, 192×192 je Bild, Kopf ≈ 20–24 px breit):

| Datei | Inhalt | Farbe |
|---|---|---|
| `assets/heroes/<körper>/head-bald.png` | haarloser Kopf mit Gesicht und Ohren, bis knapp unter das Kinn; **ohne Bart** | Hautfarben des Körperbilds (werden vom Spiel auf den gewählten Hautton umgefärbt) |
| `assets/heroes/<körper>/hair-kurz.png` | Kurzhaarschnitt | **Graustufen** (mittleres Grau ≈ 150 = Grundfarbe, dunkler = Schatten, heller = Glanz) |
| `assets/heroes/<körper>/hair-lang.png` | lange Haare bis auf die Schultern | Graustufen |
| `assets/heroes/<körper>/hair-glatze.png` | leer bis auf einen Glanzpunkt (die Glatze ist der haarlose Kopf) | Graustufen |
| `assets/heroes/<körper>/beard-backenbart.png` u. a. | weitere Bärte nach Wunsch | Graustufen |

## Raster und Anker (verbindlich)

- Jede Datei: **eine Zeile mit vier Kacheln zu 48×48 px** in der Reihenfolge **se, sw, ne, nw** (vorn rechts, vorn links, hinten rechts, hinten links) → 192×48 px, PNG mit Alpha.
- **Anker:** Kachelmitte (x = 24) liegt auf dem Kopf-Ankerpunkt des Körperbilds (`sockets.head.x` im Katalog `assets/redesign/runtime/catalog.json`), die Kacheloberkante 8 px **über** `sockets.head.y`. Bei „Schwungvoll" ist der Ankerpunkt die Oberkante des Dutts – der Scheitel liegt dort 9 px tiefer.
- Das Spiel **entfernt den gezeichneten Kopf bis zur Kinnlinie** (Anker + 22 px Kräftig, + 30 px Schwungvoll, + 25 px Drahtig) und setzt `head-bald` ein. Schultern und Hals des Körperbilds bleiben – der Kopf muss an den vorhandenen Hals anschließen.
- Bärte werden nur in se/sw gezeichnet; ne/nw dürfen leer sein.
- Der Kopf ist in allen Posen dieselbe Kachel (keine Neigung je Pose). Wenn das in einzelnen Posen (Tod, Ausweichen) auffällt: melden, dann ergänzen wir Kopf-Varianten je Posengruppe.

## Katalog

`assets/heroes/catalog.json` – nur was hier steht und als Datei vorhanden ist, wird angeboten:

```json
{"version":1,"bodies":{
 "dieter":{"hair":[{"id":"kurz","name":"Kurz"},{"id":"lang","name":"Lang"},{"id":"glatze","name":"Glatze"}],"beard":[{"id":"rasiert","name":"Rasiert"}]},
 "baerbel":{"hair":[{"id":"kurz","name":"Kurz"},{"id":"lang","name":"Lang"},{"id":"glatze","name":"Glatze"}],"beard":[]},
 "kevin":{"hair":[{"id":"kurz","name":"Kurz"},{"id":"lang","name":"Lang"},{"id":"glatze","name":"Glatze"}],"beard":[]}}}
```

„Rasiert" beim Körper „Kräftig" ist eine leere Bart-Ebene zusammen mit einer Frisur: sobald eine gezeichnete Frisur gewählt ist, kommt der
bartlose `head-bald` ins Bild. Kennungen: Kleinbuchstaben, Ziffern, Bindestrich, 2–24 Zeichen.

## Abnahme

1. `npm test` grün (`tests/hero-layers.test.mjs` prüft Katalog und Platzierung).
2. Lokal: `PORT=4195 STATIC_DIR=. node server/game/server.mjs` → Heldenerstellung → Schritt „Aussehen": die neuen Frisuren stehen in der Reihe „Frisur", Vorschau an allen drei Körpern.
3. Sichtprüfung vergrößert (Vorlage für den Prüfbogen: `docs/UEBERGABE-HELDEN-AUSSEHEN-2026-09-21.md`): vier Blickrichtungen, drei Hauttöne, zwei Haarfarben – keine Naht am Hals, keine Reste des alten Haars, Brille und Bart sitzen weiter richtig.
4. Ausliefern mit `bash scripts/ship.sh`.
