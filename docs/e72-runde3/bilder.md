# E-72 Runde 3 · Bilder für den Imagegen-Lauf (Kürzel `bilder`, 25.09.2026)

Heute wurde kein Bild erzeugt. Das Codex-Kontingent ist bis **26.09.2026, 21:21** gesperrt. Vorbereitet ist ein Befehl,
der ab dann alles erzeugt und einbaut.

## Befehl

```
npm run e72:bilder -- --dry              # Plan: was fehlt, was übersprungen wird, welche Einbauschritte folgen
npm run e72:bilder                       # alles erzeugen und einbauen, am Ende npm test
npm run e72:bilder -- --neu=<id>,<id>    # gemaltes Original verwerfen und im selben Lauf neu anfordern
node scripts/e72-talentbilder-check.mjs  # Talentfenster im Browser prüfen: gemalt vor gezeichnet, Bilder unter bilder/
```

**Allein laufen lassen:** `imagegen.mjs` nimmt das jüngste neue Bild aus `~/.codex/generated_images`.
Exit-Codes: `0` = fertig · `3` = Kontingent zu Ende (Fertiges ist eingebaut und getestet) · `1` = abgelehnt, Fehler oder Test rot.
Ein zweiter Aufruf setzt dort fort, wo der erste aufgehört hat.

## Reihenfolge und Zahl

| Block | Bilder | Auftragsblatt | danach eingebaut mit |
|---|---|---|---|
| 1 Talentraster Schorsch/Käthe, 6×5 | 6 (1536×1280) | `tools/sprite-pipeline/e72-talente-jobs.json` | `build-talents.mjs` |
| 2 Einzel-Talente alter Klassen | 11 (64×64) | `tools/sprite-pipeline/e72-talente-einzeln-jobs.json` | `build-talents.mjs` |
| 3 Kniff-Icons, die drei schwächsten zuerst | 28 (64×64) | `tools/sprite-pipeline/e71-kniffe-jobs.json` | `sprites:precision` und Kontaktbogen |
| Ende | – | – | `node scripts/pwa-cache.mjs` und `npm test` |

**Summe: 45 Bilder.** Bedarf am Kontingent, grob geschätzt: In der Woche vom 19. bis 24.09. entstanden rund 270 Bilder, dann war
das Kontingent erschöpft. 45 Bilder sind also etwa ein Sechstel bis ein Fünftel einer Woche. Die großen Raster kosten
vermutlich mehr. Dauer: etwa 1–2 Minuten je Bild, zusammen 55–90 Minuten. Einbau und `npm test` kommen mit rund 5 Minuten dazu.

**Wie ein Bild geprüft wird:**
- Ein Raster ist fertig, sobald seine Quelle existiert.
- Ein Kniff ist fertig, wenn `assets/precision/generation.json` eine Herkunft mit passendem Hash hat.

Jedes frische Original wird geprüft:
- **Raster:** Seitenverhältnis 6:5, durchsichtiger Grund, alle 30 Zellen brauchbar.
- **Einzelbild:** freigestellt, das Motiv berührt den Rand nicht.
- **Kniff:** quadratische, deckende Kachel.

Ein unbrauchbares Original landet unter `generated/e72-abgelehnt/` (git-ignoriert). Seine Herkunft fällt weg, ein Kniff
bekommt sein Code-Original zurück. Die Auftragsblätter für Talente schreibt der Lauf vor dem Start aus dem aktuellen Inhalt neu,
damit spätere Namensänderungen mitkommen (`tools/sprite-pipeline/e72-talente-auftraege.mjs`).

**Format und Stil:**
- Die Raster haben denselben Prompt-Kopf wie die neun E-32-Raster (`assets/content-art/e32/generation.json`), dazu eine
  Klassenbeschreibung.
- Die Zeilen folgen streng der Reihenfolge von `TALENT_ROWS`: „Name: Wirkung“, dazu der Proc-Look als Motiv (101 von 180 Talenten).
- Als Stilvorlage dient ein E-32-Raster: für Schorsch `dieter-brew-v1.png`, für Käthe `baerbel-care-v1.png`.
- Einzelbilder nehmen das Raster ihrer eigenen Spezialisierung als Vorlage.

## Vorrang: gemalt vor gezeichnet

- **Talente:** `talent-art.js` fragt zuerst den Katalog (`paintE32Talent`). Erst ohne Eintrag malt es das Ersatz-Icon
  (`paintVocabTalent`). `build-talents.mjs` nimmt eine Klasse auf, sobald ihr Raster existiert. Fehlt eine Quelle, bleibt das
  Ersatz-Icon, ohne Absturz. Ein Einzelbild `assets/content-art/e32/sources/einzeln/<id>-v1.png` ersetzt die Rasterzelle in Atlas
  und Katalog (`source` = Einzelbild, `sheet` = Raster).
- **Kniffe:** Das gemalte Original überschreibt das gezeichnete am selben Pfad. `sprites:precision` baut daraus das
  Laufzeitbild `skill-<klasse>-<kniff>`. `e71-kniffe-draw.mjs` zeichnet ein gemaltes Original ohne `--force` nicht mehr zu. Mit
  `--force` nimmt es auch die Imagegen-Herkunft zurück.

## Getauschte Talente der alten Klassen (E-72, Commit c29534e7): Urteil

Je Baum wurden zwei Talente gegen Ressourcen-Talente getauscht, das sind 18. Dazu kommt ein Talent, das nur umbenannt wurde.
Das gemalte Bild zeigt noch das alte Talent. Übersicht in dieser Reihenfolge: `docs/e72-runde3/bilder/getauschte-talente-bisher.png`.

| Talent | Bild zeigt (altes Talent) | jetzt | Urteil |
|---|---|---|---|
| dieter-wall-12 | Kronkorken-Panzer: Kettenhemd aus Kronkorken | Deckel beim Wirt (Zeche/Bon größer) | **falsch → Einzelbild** |
| dieter-wall-26 | Hausbier-Nachschub: Krug mit Flammenwirbel | Ohne zu zahlen raus (Prellen härter/früher) | **falsch → Einzelbild** |
| dieter-brawl-11 | Nachgeschenkt: Krug, Schläge treffen ihn, Pfeil hoch | Wut im Bauch (Treffer geben mehr Randale) | passt knapp, bleibt |
| dieter-brawl-25 | Anlauf nehmen: Stiefel im Sprint | Zechprellerrunde (nach Prellen Abriss frei) | **falsch (zeigt Ausweichen) → Einzelbild** |
| dieter-brew-2 | Nichts wegkippen: Bier auf Schild | Weizen gegen die Zeche | **falsch (Schild = Deckung) → Einzelbild** |
| dieter-brew-3 | Ruhige Hand: Hand mit Bier und Münze | Bar auf die Hand | passt, bleibt |
| baerbel-care-15 | Freilaufgans: Gans im Heilkreis | Dickes Fell (Shitstorm gibt Deckung) | **falsch → Einzelbild** |
| baerbel-care-17 | Schrubben heilt: Bürste, Plus | Stammpublikum (Kampfstart mit Trend 1) | **falsch → Einzelbild** |
| baerbel-feedback-12 | Zugluft: Schimmel springt weiter | Schimmel geht viral | passt, bleibt |
| baerbel-feedback-25 | Startkapital: Schwert und Pyramide | Freundin wirbt Freundin | passt knapp (Pyramide = Downline), bleibt |
| baerbel-stage-11 | Dauerschleife: drei Striche im Kreispfeil | Dauerbeschallung | passt, bleibt |
| baerbel-stage-21 | Like-Welle: Kleeblatt mit Münzen | Hype-Zug (Trend steigt → Likes) | **falsch (Glück statt Trend) → Einzelbild** |
| kevin-fuse-11 | Funkenflug: Flasche mit Lunte | Pfandsammler | passt, bleibt |
| kevin-fuse-25 | Warmlaufen: brennendes Zahnrad, Sanduhr | Starkstrom-Bon | **falsch → Einzelbild** |
| kevin-iron-11 | Weiter Bremsweg: Robbi im Frostkreis | Robbi räumt auf (sammelt Leergut) | **falsch → Einzelbild** |
| kevin-iron-23 | Zusatzladung: Robbi explodiert | Volle Ladung (Bon-Zone, Überlast gratis) | **knapp falsch (kein Automat, kein Bon) → Einzelbild** |
| kevin-hunt-0 | Wurf aus der Bewegung: Läufer, Fadenkreuz | Im Vorbeirennen (Aufsammelradius) | passt knapp, bleibt |
| kevin-hunt-15 | Pfandbon: Ziel, Messer, grünes Herz | Klebegeld (nur umbenannt, gleiche Wirkung) | passt, bleibt |
| kevin-hunt-25 | Gewinnausschüttung: Schädel, Herz, Münzen | Pfandregen (Kill wirft Flasche ab) | **falsch (Herz = Heilung) → Einzelbild** |

**Ergebnis: 11 Einzelbilder, 8 bleiben.** Die übrigen 42 Talente haben nur die Ressource im Text getauscht, Randale gegen
Likes oder Flaschen. Ihr Hauptmotiv stimmt. Sechs Bilder der Putzpyramide zeigen aber noch das rote Randale-Gesicht als
Nebenzeichen: baerbel-feedback-8, -16, -20, -22, -24 und -28. Sie kommen für eine spätere Runde infrage und sind noch nicht
beauftragt. Das Schweinegesicht der Filter-Furie steht für die Putzwut und passt weiter.

## Generalprobe

Die Probe lief in einer Wegwerf-Arbeitskopie mit dem echten Befehl. Nur der Imagegen-Schritt war ersetzt: Als Platzhalter
dienten gespiegelte E-32-Raster, einzelne Rasterzellen und hochskalierte Code-Kniffe.

| Lauf | Ergebnis |
|---|---|
| Kontingentende nach 8 Bildern | Eingebaut, Test grün, Exit 3, 37 fehlend gemeldet |
| Fortsetzung | 37 übrige Bilder, grün, Exit 0: 450 Talente, 11 Einzelbilder, 0 Code-Kniffe |
| Drei unbrauchbare Originale | Abgelehnt, Kniff-Original zurück, Test grün |

Das Talentfenster zeigte dabei die gemalten Platzhalter (`bilder/generalprobe-platzhalter-schorsch-chef.jpg`).

**Gefundener Fehler, behoben:** Der Farbcache von `precisionColor` wird von allen Bildern eines Laufs geteilt. Ein Einzelbild
mitten im Dieter-Atlas verfärbte darüber 196 alte Talentbilder und `skills.png`. Jetzt baut `build-talents.mjs` zuerst die
E-32-Raster und die Kniff-Motive, danach neue Klassen und Einzelbilder. Der Test prüft das in einem frischen Prozess.

## Offen und Risiken (schwächster Punkt zuerst)

1. **Die Prüfung sieht nur die Form, nicht den Inhalt.** Vertauscht Imagegen im Raster die Reihenfolge, landet ein Bild beim
   falschen Talent. Nach dem Lauf deshalb die Raster und den Kontaktbogen ansehen. Ein falsches Bild mit `--neu=<id>` nachziehen.
2. **Käthe:** 30 Karten-Talente je Raster können sich zu ähnlich sehen. Der Prompt verlangt ausdrücklich andere Gegenstände.
3. `scripts/e72-talentbilder-check.mjs` prüft nur die sichtbaren Knoten (12 je Baum), nicht alle 30.
4. Der Lauf schreibt `precache-manifest.js`. Das ist auf main gewollt, im Zweig nicht committen.
5. `tests/game-server.test.mjs` fiel unter Last zweimal zufällig aus, allein laufen sie grün. Das hat mit den Bildern nichts zu tun.
