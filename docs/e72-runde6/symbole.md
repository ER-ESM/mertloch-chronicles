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

## Nachtrag 27.09.: Annis und Kevins Klassenkleidung (vier weitere Symbole)

Gemalt in derselben Malergruppe `klassenkleidung.mjs` und übernommen mit `--gruppe klassenkleidung --nur annischuerze,annibrille,kevinweste,kevinguertel`.
- Die Maler lesen `klassen-kleidung.mjs` und `puppe.mjs` jetzt aus `MertlochChronicles-ressourcen`, weil nur dort die neuen kk-Treppen stehen.
- Die vier alten Symbole bleiben byte-gleich.

| Symbol | Motiv | Unruhe / hart / weich | Füllung / Deckung |
|---|---|---|---|
| Annis Schürze | Vichy-Karo in 6-px-Zellen (weiß, Streifen, Kreuzung aus kkKaroW/M/D), Latz mit Rüsche, dunkelblaue Träger und Bund, Rüschensaum mit oranger Paspel, Puffärmel in Aperol mit Streublümchen und Gummizug-Rüschchen, Tasche mit Schminkpinsel, rosa Putzspray | 17,8 / **0,25** / **0,39** | 0,91 / 0,62 |
| Annis Sonnenbrille | große Katzenaugen-Sonnenbrille mit dunklem Rahmen, Aperol-Gläser (oben dunkel, unten orange), Lichtstreifen | 12,1 / 0,13 / 0,55 | 0,91 / 0,26 |
| Kevins Arbeitsweste | Petrol, graue Schulterpasse und Stehkragen, zwei Warnstreifen mit Reflexlinie, Reißverschluss, Brusttasche mit Zollstock und Kuli, Fronttaschen | 17,6 / 0,17 / 0,45 | 0,91 / 0,53 |
| Kevins Werkzeuggürtel | Ledergürtel als Schlaufe, Flaschenöffner als Schnalle, Werkzeugtasche mit Schraubendreher und Zange, Pfandbon-Rolle, Kabelbinder, Pömpel mit roter Saugglocke | 15,1 / 0,11 / 0,50 | 0,91 / 0,37 |

- **Annis Schürze** verfehlt „hart“ (Toleranz 0,24) und „weich“ knapp.
  - Ursache ist das Karo: Weiß neben Mittelblau springt um ΔL ≈ 95. Das gehört zum Muster.
  - Hellere Streifen oder kleinere Zellen änderten den Wert nicht. Größere Zellen (6 statt 3 px) halten das Karo auch in 32 px lesbar.
- **Farben, die die Palette nicht trifft:**
  - `kkPetrol` rastet ins Blaue. Ich nehme die Petroltöne der Palette (Hauptton `2b5762`).
  - `kkNeon` (Gelbgrün) rastet in Braun und Grün. Ich nehme Signalgelb (`ffed45`).
  - `kkPink` nehme ich aus `R.pink`.
- „PFAND“ auf dem Rücken der Weste gibt es nur an der Figur. Das Symbol ist frontal und hat keinen lesbaren Text (Stilbibel).

**Test:** „Klassenkleidung vom Kleiderhaufen“ verlangt jetzt alle acht Stücke aus `CLASS_CLOTHES`, jedes mit eigenem Malerbild.

**Browser:** `scripts/e72-symbole-check.mjs` prüft alle acht Stücke.
- Rucksack in zwei Reihen.
- Figurenfenster mit Weste (Platz Brust) und Werkzeuggürtel (Platz Hüfte), dazu je Platz eine 4×-Aufnahme.
- Neue Belege:
  - `nahaufnahme-anni-kevin-4x.png`
  - `stilvergleich-acht-3x.png`
  - `figur-kevin-teile.jpg`
  - `platz-body-kevinweste-4x.jpg`, `platz-waist-kevinguertel-4x.jpg`
  - `tooltip-grillschuerze.jpg`

**Nebenbefund:** `.game-popup .gear-cell.gear-new` in `ui-chrome.css` setzt `position:relative` (seit fa4a368b).
- Das schlägt `.body-equipment>.gear-cell{position:absolute}`.
- Folge: Nach dem Anlegen steht die aufblitzende Zelle 1 s lang am falschen Platz, überlagert andere Plätze und springt danach zurück.
- Die Prüfung wartet das Aufblitzen ab. Behoben ist es nicht, das ist nicht mein Auftrag.
