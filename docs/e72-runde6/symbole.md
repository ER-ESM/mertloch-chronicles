# E-72 Runde 6 · Rucksack-Symbole der Klassenkleidung (Kürzel: symbole, 27.09.2026)

**Vorher:**
- Grillschürze und Strickjacke teilten sich `gear-jacket` (Jeansweste). Das war als OFFEN im Test eingetragen.
- Die Schiebermütze zeigte `gear-helmet` (Stahlhelm), die Lesebrille `gear-chain` (Münzkette). Die Bilder waren nicht geteilt, passten aber nicht.

**Jetzt:** Vier eigene 64er-Symbole, gemalt auf dem Weg der Icon-Sitzung:
- Pixelmaler per Code, Waffen-Palette, Übernahme mit `icons-uebernehmen.mjs --gruppe klassenkleidung --nur …`.
- Neue Malergruppe: `D:\Dev\_prototypen\icons-2026-09-25\klassenkleidung\`. Nur ergänzt, am Nachbarordner `ausruestung` ist nichts geändert.
  - `klassenkleidung.mjs`: die vier Maler.
  - `maler2.mjs`: byte-gleiche Kopie aus `ausruestung`.
  - `pruefen.mjs`: Messwerte nach Stilbibel. Die Formeln stammen aus `ausruestung/messen.mjs`. Das Original lädt nicht mehr, weil der Worktree `MertlochChronicles-icons` weg ist.
- Farben: Treppen der Figur (`kkKohle`, `kkCognac`, `kkBrand`, `kkTweed`, `kkWolle`, Gold aus `puppe.mjs`).
  - Stufen, die weiter als ΔL 30 auseinanderliegen, sind mit Palettentönen aufgefüllt, sonst schlägt die Regel „hart“ an.
  - Lila kommt aus `R.lila` plus den violetten Zwischentönen der Palette, weil `kkLila` beim Einrasten ins Blaugraue kippt.

| Symbol | Motiv | Unruhe / hart / weich | Füllung / Deckung |
|---|---|---|---|
| Grillschürze | Kohle-Canvas, Glutflamme auf dem Latz, Leder-Nackenschlaufe und Bänder, Messingnieten, Tasche mit Thermometer, angesengter Saum, rot-weißes Tuch | 14,3 / 0,12 / 0,56 | 0,91 / 0,49 |
| Schiebermütze | grauer Fischgrat, Keilprofil, vorgezogener Deckel über dem Schirm, Druckknopf, Seitenteil im Schatten; ¾ nach links | 11,3 / 0,06 / 0,66 | 0,91 / 0,33 |
| Strickjacke | lila, Zopfmuster (Pixelzopf), gerippter Schalkragen aus Naturwolle, drei Holzknöpfe, Brusttasche mit Kreuz-Ass (♣), Bündchen | 14,9 / 0,16 / 0,46 | 0,91 / 0,62 |
| Lesebrille | goldene Halbmondgläser mit Spiegelung, Steg im Bogen, Goldperlenkette als U | 15,5 / **0,23** / 0,48 | 0,91 / 0,32 |

- Soll laut Stilbibel: Unruhe ≤ 16, hart ≤ 0,20, weich ≥ 0,45.
- Die Brille liegt bei „hart“ über dem Soll, aber in der Toleranz für ein Schlüsselmotiv (≤ 0,24). Ursache sind die Goldperlen neben der Tinte. Abgedunkelt wirkten sie braun und stumpf, deshalb habe ich die Lesbarkeit vorgezogen.

**Test:**
- `OFFEN` ist leer.
- Neuer Test „Klassenkleidung vom Kleiderhaufen“: Alle vier Stücke aus `CLASS_CLOTHES` zeigen im Rucksack ihr eigenes Malerbild, keines ein gear-Bild. Sie haben vier verschiedene Hashes und einen Auftrag der Gruppe `klassenkleidung`.

**Prüfung im Browser:** `node scripts/e72-symbole-check.mjs` (Ports 9895/4495, Service Worker gesperrt).
- Im Rucksack lädt jede Kennung ihre eigene 64-px-Datei und zeichnet sie in 48 px, jedes Stück mit einem anderen Bild.
- Das Figurenfenster zeigt Schorsch mit Schürze und Mütze.
- Belege in `symbole/`:
  - `rucksack-2x.jpg` und `rucksack-fenster.jpg`: Rucksack, links die Vergleichssymbole.
  - `figur-schorsch.jpg`: Figurenfenster.
  - `nahaufnahme-neu-4x.png`: Nahaufnahme 4×, dazu 64/48/32/24 px.
  - `stilvergleich-4x.png`: neben Clanjacke, Regenjacke, Bierdeckelweste, Dienstmütze und Königskette.

**Offen:**
- Die Schiebermütze ist das schwächste Symbol.
  - In 32 px liest sie sich als graue Kappe mit Schirmlippe. Neben der Dienstmütze fehlt ihr ein starker Kontrastträger.
  - Ein dunklerer Schirm hat nur wenig gebracht.
- `precache-manifest.js` ist nicht eingecheckt. Ohne Neubau (`node scripts/pwa-cache.mjs`) schlägt der Test „offline cache includes every precision asset“ fehl.
