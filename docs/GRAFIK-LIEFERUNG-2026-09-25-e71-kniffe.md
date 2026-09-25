# Kniff-Icons für E-71 · 25.09.2026 · **abgebrochen, nicht geliefert**

**Stand:** Kein einziges Icon erzeugt. Codex hat den ersten Bildauftrag sofort abgelehnt, weil das Nutzungskontingent
des ChatGPT-Abos erschöpft ist. Vorbereitet sind nur das Auftragsblatt und zwei Stilvorlagen, damit der Lauf ohne
Nacharbeit starten kann, sobald das Kontingent wieder frei ist. Im Spiel ändert sich nichts: die Leiste zeigt weiter die
vorläufigen Bilder (Gegenstands-Icons bzw. die gezeichneten Ersatzbilder).

## Was passiert ist

```
npm run sprites:generate -- tools/sprite-pipeline/e71-kniffe-jobs.json --only=skill-schorsch-strike,skill-kaethe-aermel,skill-dieter-zeche
Codex: …\openai.chatgpt-26.5917.62051-win32-x64\bin\windows-x86_64\codex.exe (codex-cli 0.155.0-alpha.16.3)
ERROR: You've hit your usage limit. … try again at Sep 26th, 2026 9:21 PM.
Error: Kein Bild erzeugt.
```

- Probelauf mit 3 Motiven (Reihenfolge laut Auftrag), abgebrochen beim ersten Motiv nach 7 s.
- Kosten: keine – die Anfrage wurde abgelehnt, bevor ein Bild entstand. `assets/precision/generation.json` blieb unverändert.
- Frühester neuer Versuch laut Codex: **26.09.2026, 21:21 Uhr**. Alternative: Kontingent unter
  https://chatgpt.com/codex/settings/usage aufstocken.
- Kein Ersatzweg genutzt: keine handgezeichneten oder aus alten Icons zusammengesetzten Bilder. Die Pipeline verlangt
  Originale aus dem Bildwerkzeug mit Herkunft; alles andere wäre vorgetäuscht.

## Was vorbereitet ist

| Datei | Inhalt |
|---|---|
| `tools/sprite-pipeline/e71-kniffe-jobs.json` | 28 Aufträge, 64 × 64, Rand 3, `kind: "skills"`, `delivery: "2026-09-25"`, Ausgabe nach `assets/precision/sources/2026-09-25/e71-kniffe/<id>.png` |
| `assets/precision/sources/2026-09-25/e71-kniffe/stilvorlage-kniff-kachel.png` | Stilvorlage für 26 Kniffe: eine Zelle (Spalte 3, Zeile 1 = „Wurf", grüne Flasche) aus `assets/clan-skills-013/dieter.png`, Ausschnitt x 630, y 3, 308 × 308 (Zelle ohne die 3-px-Rasterkante, wie `paintCell` sie liest). Unverändert kopierte Pixel. |
| `assets/precision/sources/2026-09-25/e71-kniffe/stilvorlage-kniff-auto.png` | Stilvorlage für die zwei Autoangriffe: `auto-dieter` aus `assets/content-art/items/semantic-atlas.png`, Ausschnitt x 4, y 973, 243 × 277 (= `sourceBounds` im Katalog). Zeigt die Konvention „zwei goldene Kreispfeile um das Motiv". |

### Stilentscheidung

Die Kniffe von Dieter und Kevin sind **Kacheln**: dunkles, fleckiges Moosgrün als Grund über die ganze Fläche, ein Motiv
mit Tintenkontur darauf; der Präzisionsexport macht daraus 58 × 58 auf 64 × 64 (3 px Rand). Annis Aperol-Icons sind
freigestellte Motive ohne Grund. Die neuen Icons folgen den Kacheln, weil `zeche` und `reload` in Dieters und Kevins
Leiste neben Kacheln stehen und zwei von drei Klassen so aussehen (Kachel = Knopf, wie im WoW-Vorbild). Die
Autoangriffe folgen `auto-dieter`/`auto-kevin` (Motiv mit zwei goldenen Kreispfeilen).

Jeder Auftrag besteht aus: Klasse und Kniff (Name, Zweck), Motiv, Stilblock („match the attached reference exactly …
do not copy its subject"), Komposition (Kachel randlos, ein Motiv, ~75 %, lesbar bei 48 px) und Verboten (kein Text,
keine Zahlen, kein Rahmen, kein Rand, kein Raster). Käthes Aufträge erlauben ausdrücklich Farbsymbole ♣ ♠ ♥ ♦, aber keine
Buchstaben oder Zahlen auf den Karten.

### Motive (28)

| ID | Kniff | Motiv |
|---|---|---|
| `skill-schorsch-auto` | Zangenklapper | Grillzange schnappt zu, zwei goldene Kreispfeile |
| `skill-schorsch-strike` | Grillzange | Zange im Schlag, Glutfunken an den Spitzen |
| `skill-schorsch-mark` | Auflegen | Zange legt rohe Bratwurst auf den Rost über Glut |
| `skill-schorsch-burst` | Servieren | gare Bratwurst springt vom Pappteller, Dampfspur |
| `skill-schorsch-interrupt` | Zange zu! | Zange zerquetscht gelben Zauberfunken, Aufprallstern |
| `skill-schorsch-parry` | Grilldeckel | Kugelgrilldeckel als Schild, Funken prallen ab |
| `skill-schorsch-dash` | Kohlen-Sprint | Arbeitsstiefel im Sprint, Glut- und Aschespur |
| `skill-schorsch-heal` | Ablöschen | Bierflasche über roter Glut, Dampfwolke, grünes Plus |
| `skill-schorsch-buff` | Blasebalg | Blasebalg facht Kohlen an, Funken |
| `skill-schorsch-throw` | Glutbrocken | glühender Kohlebrocken im Flug, Flammenspur |
| `skill-schorsch-ground` | Schwenkgrill | Schwenkrost an Ketten am Dreibein, Schwungbogen |
| `skill-schorsch-senf` | Senf drauf! | Senfflasche spritzt auf Bratwurst, grünes Plus |
| `skill-schorsch-spiritus` | Spiritus-Schwall | Spiritusflasche (blaues Etikett ohne Text), Stichflammen-Kegel |
| `skill-schorsch-deckelzu` | Deckel zu! | zugeknallter Kugelgrill, Rauchring quillt heraus |
| `skill-kaethe-auto` | Kartenschnipsen | drehende Karte (♣), zwei goldene Kreispfeile |
| `skill-kaethe-interrupt` | Kontra! | Hand im Strickjackenärmel knallt Karte auf den Tisch, Zauberfunke zerspringt |
| `skill-kaethe-parry` | Gemauert | Mauer aus Spielkarten, Schlag prallt ab |
| `skill-kaethe-dash` | Abgang | beige Gesundheitsschuhe im Eilschritt, Karten flattern |
| `skill-kaethe-heal` | Eierlikörchen | Stielglas Eierlikör, grünes Plus |
| `skill-kaethe-buff` | Neu geben | Karten beim Mischen im Bogen |
| `skill-kaethe-throw` | Abrechnen | Skatblock mit Strichen und Doppelstrich, Bleistift, Goldschein |
| `skill-kaethe-ground` | Kartenregen | Karten ♣♠♥♦ regnen in einen Kreis, Aufschlagring |
| `skill-kaethe-reizen` | Reizen | Kartenfächer, Sprechblase mit drei goldenen Aufwärts-Winkeln |
| `skill-kaethe-handlesen` | Handlesen | offene Handfläche, leuchtende Linien, rotes ♥, grüne Funken |
| `skill-kaethe-gezinkt` | Gezinkte Karten | drei Karten, alle ♣, heimliche Kerbe, Glanzstern |
| `skill-kaethe-aermel` | Ass im Ärmel | Karte (♣) rutscht aus dem Strickjackenärmel |
| `skill-dieter-zeche` | Zeche prellen | Faust auf den Tresen, Druckwellenring, Kassenbon reißt, Münzen fliegen |
| `skill-kevin-reload` | Pfandautomat | Rückgabeautomat schluckt grüne Flasche, goldener Pfandbon schießt heraus |

Keine Bilder für Käthes Plätze 1–3 (`strike`/`mark`/`burst`) – die Karten zeichnet das Spiel selbst.

## Fortsetzen (wenn das Kontingent wieder frei ist)

1. **Allein laufen lassen.** `imagegen.mjs` nimmt das jüngste neue PNG aus `~/.codex/generated_images/`. Erzeugt eine
   andere Sitzung gleichzeitig Bilder, kann ein fremdes Bild unter falscher ID landen. Jedes Original also ansehen.
2. Probe: `npm run sprites:generate -- tools/sprite-pipeline/e71-kniffe-jobs.json --only=skill-schorsch-strike,skill-kaethe-aermel,skill-dieter-zeche`
   → Originale mit Read ansehen, gegen `skill-dieter-*`/`skill-kevin-*` halten (Kachel randlos? Motiv ~75 %?
   Kontur, Palette, Lesbarkeit bei 48 px). Prompts im Auftragsblatt schärfen, schwache Motive mit `--force` neu.
3. Rest: `npm run sprites:generate -- tools/sprite-pipeline/e71-kniffe-jobs.json` (Vorhandenes wird übersprungen).
4. **Export anbinden:** In `tools/sprite-pipeline/precision-september.mjs` `'./e71-kniffe-jobs.json'` an die Liste
   `jobs` anhängen (erst, wenn **alle** 28 Originale da sind – sonst bricht der Export ab). Die Stilvorlagen stehen nicht
   im Auftragsblatt als Aufträge, sondern nur als `references`, und werden nicht exportiert.
5. `npm run sprites:precision && node scripts/pwa-cache.mjs` → 28 neue Einträge `skill-<klasse>-<kniff>` unter
   `assets/precision/runtime/skills/`. Die Laufzeit findet sie über `contentAsset` in `paintSkillIcon`
   (`skill-art.js`), ohne Codeänderung.
6. Kontaktbogen `docs/e71-abnahme/kniffe/kontaktbogen.png`: alle neuen Icons bei 48 px (Nächster-Nachbar wie
   `drawContentIcon`) neben alten Kacheln (`skill-dieter-strike/throw/heal`, `skill-kevin-strike/throw`,
   `skill-dieter-auto`, `skill-kevin-auto`), ansehen, dann `npm test` (u. a. `tests/art-precision.test.mjs`).
7. Diesen Bericht auf „geliefert" umschreiben (Liste, Abnahme, Kosten/Laufzeit).

## Prüfung

`npm test` grün mit den vorbereiteten Dateien (kein Test liest alle Auftragsblätter; der Präzisionsexport ist
unverändert und bleibt byte-reproduzierbar, weil `e71-kniffe-jobs.json` noch nicht angebunden ist).
