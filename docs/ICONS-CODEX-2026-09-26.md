# Icons per Codex · Lauf Sa 26.09.2026, 23:00

Grundlage ist das Icon-Review R0 (`D:\Dev\_review\icons-r0\REVIEW-ICONS-R0.md`, Abschnitte 3.1, 3.2 und die Stilbibel in Abschnitt 4; `befunde.json`, Maßnahme C).
Ziel: ein einheitlicher Look über alle Symbole und die Note 5 (WoW-Niveau) zuerst bei Talenten und Kniffen.
Stand 25.09.: Das Codex-Kontingent ist bis Sa 26.09., 21:21 gesperrt. Deshalb sind nur die Aufträge, die Einbindung und die geplante Aufgabe fertig, noch keine Bilder.

## Was erzeugt wird (44 Bilder, in dieser Reihenfolge)

| # | Auftragsblatt | Bilder | Ausgabe | Einbindung |
|---|---|---|---|---|
| 1 | `tools/sprite-pipeline/talente-e32-20260926-jobs.json` | 6 Talent-Atlanten (je Spez 6 × 5 = 30 Talente) für Schorsch und Käthe | `assets/content-art/e32/sources/<spec>-v1.png` | `tools/class-visuals/build-talents.mjs` → `e32/runtime/talents-<klasse>.png` + `catalog.json` |
| 2 | `tools/sprite-pipeline/spez-symbole-20260926-jobs.json` | 6 Spez-Symbole `skill-<klasse>-<spec>` (Kniff-Kachel) | `assets/precision/sources/2026-09-26/spez-symbole/` | `precision-september.mjs` → `precision/runtime/skills/` |
| 3 | `tools/sprite-pipeline/e71-kniffe-jobs.json` (nur `prompt` und `references` geschärft) | 28 Kniffe, zuerst `schorsch-parry`, `kaethe-dash`, `kevin-reload` | ersetzt die Code-Originale in `assets/precision/sources/2026-09-25/e71-kniffe/` (`--force`) | wie bisher; ersetzte Einträge verlassen `herkunft.json` |
| 4 | `tools/sprite-pipeline/kniffe-dicht-20260926-jobs.json` | 4 vereinfachte Dieter-Kniffe: strike, heal, parry, dash | `assets/precision/sources/2026-09-26/kniffe-dicht/` | `precision-september.mjs`; überschreibt den alten Export aus `clan-skills-013` |

**Blätter nie von Hand ändern.** Motive stehen in `tools/sprite-pipeline/icons-codex-motive.mjs`, der Stilbibel-Wortlaut steht in `icons-codex-jobs.mjs`.
Danach `node tools/sprite-pipeline/icons-codex-jobs.mjs` ausführen; `tests/icons-codex.test.mjs` prüft, dass die Blätter zum Generator passen.

## So entstanden die e32-Talente – und so entstehen die neuen

- **E-32 (19.09.):** Je Spezialisierung ein Bogen mit 6 × 5 Zellen, erzeugt über `image_gen.imagegen`.
  - Prompt, Referenz und Einträge stehen in `assets/content-art/e32/generation.json`, der Prompt zusätzlich in `sources/<spec>-v1.prompt.txt`.
  - Die Originale sind etwa 1374 × 1145 px groß und haben einen echten Alphakanal.
- **Zuschnitt:** `build-talents.mjs` sucht die transparenten Fugen nahe dem Raster (`cuts`) und verkleinert jede Zelle einheitlich auf 56 px (precision-resample mit Palette).
  - Ergebnis: eine 64er-Kachel im Klassenatlas 640 × 576 (10 Reihen × 3 Specs × 3 Pfade), dazu der Katalogeintrag `talents[<spec>-<i>]`.
- **Laufzeit:** `talent-art.js` fragt zuerst `paintE32Talent` (Katalog). Die Vokabular-Ersatzbilder (`paintVocabTalent`) greifen nur, solange kein Katalogeintrag da ist.
  - Deshalb braucht die Einbindung **keine** Änderung an `talent-art.js`.
- **Neu (dieser Branch):**
  - `build-talents.mjs` nimmt Schorsch und Käthe je Spezialisierung auf, sobald `sources/<spec>-v1.png` existiert. Ohne Bogen bleibt alles bytegleich (270 Talente).
  - `tests/e32-delivery.test.mjs` zählt 30 je vorhandenem Bogen.
- **Prompt:** Gleicher Rahmen wie E-32 (6 × 5, 1536 × 1280, 15 % Rand, transparent, Referenz `dieter-wall-v1.png` als Leitbild), geschärft nach der Stilbibel:
  - Motiv = Talentname wörtlich und dörflich. Jede der 180 Zeilen hat ein eigenes englisches Motiv.
  - Licht oben links, geschlossene Tintenkontur, Glut ≤ 1/5 der Zelle.
  - **Glyphenregel:** genau eine Glyphe oben rechts, nur bei Modifikatoren (`up`, `hourglass`, `reset`, `plus`, `skull`, `double`). Freischalt-Talente tragen nie eine Glyphe. Die Ecke unten rechts bleibt frei für die Rang-Plakette.

## Kachelrezept (Spez-Symbole, Kniffe, dichte Kniffe)

Stilbibel B, im Prompt wörtlich:
- **Kachel:** randlos bis an die Kante. Basis `#263530`, etwa ein Viertel Moosflecken `#354b36`, Tupfen `#171f29`, wenig warm `#3d3530`, außen leicht dunkler, kein Blaugrau.
- **Motiv:** ein Hauptobjekt ≥ 55 % der Fläche, ¾-Ansicht auf der Diagonale von links unten nach rechts oben, höchstens zwei Effekte.
- **Licht und Schatten:** Licht oben links, Schlagschatten nach rechts unten.
- **Effektfarben:** Feuer orange-gold, Heilung grünes Plus, Schutz Blaustahl.
- **Autoangriff:** zwei goldene Kreispfeile.

**Stilvorlagen** (Originalzellen, keine 64er-Exporte), geschnitten vom Generator:
- `assets/precision/sources/2026-09-26/stilvorlagen/stilvorlage-kniff-buff.png` = Leitbild `skill-dieter-buff`
- `stilvorlage-spez-dieter.png` = Dieters drei Spez-Kacheln
- für Autoangriffe zusätzlich `e71-kniffe/stilvorlage-kniff-auto.png`

**Tintenrahmen und Rand:** Den 1-px-Tintenrahmen setzt der Export. Laut icons-kniffe erzwingt `precision-september.mjs` künftig für `kind: skills` mit `padding: 0` den Rahmen, und `e71-kniffe-jobs.json` geht auf `padding: 0`.
- Die neuen Blätter stehen schon auf `padding: 0`.
- Auf diesem Branch stehen die e71-Kniffe noch auf 3.

## Samstag: geplante Aufgabe

- **Aufgabe:** Windows-Aufgabe **„MertlochIcons“**, einmalig Sa 26.09.2026, 23:00.
  - Ausführung als Administrator, nur bei Anmeldung (Interactive, Limited), wie „MertlochPortraets“ (21:40).
  - Wird nachgeholt, wenn der Termin verpasst ist. Laufzeitgrenze 5 h.
- **Befehl:** `cmd.exe /c "D:\Dev\_prototypen\icons-2026-09-25\codex-samstag.cmd"`
  - Das Skript ruft `node tools/sprite-pipeline/icons-codex-lauf.mjs --review=D:\Dev\_review\icons-codex --warte=MertlochPortraets --warte-max=90 --bis=60` auf.
- **Protokoll:**
  - Log: `D:\Dev\_prototypen\icons-2026-09-25\codex-samstag.log`
  - Status: `D:\Dev\_review\icons-codex\status.json`
  - Kontaktbogen: `D:\Dev\_review\icons-codex\index.html`, `kontaktbogen-kniffe.png` (vorher | nachher | 48 px), `kontaktbogen-talente.png`.
- **Ablauf:**
  1. Wartet, bis „MertlochPortraets“ nicht mehr läuft, höchstens 90 min. Die Bilder werden je Codex-Sitzung zugeordnet, parallel wäre also auch sicher.
  2. Liest das Kontingent kostenlos über `codex app-server` (`codex-kontingent.mjs`). Ist es gesperrt oder liegt der Verbrauch bei ≥ 60 %, erzeugt der Lauf nichts.
  3. Erzeugt je Bild einzeln mit `runJobs(..., {only:[id]})` und prüft vorher jedes Mal das Kontingent.
     - Beim Nutzungslimit hört er sofort auf, nach drei Fehlern in Folge ebenso.
     - Vorhandenes wird übersprungen; ein zweiter Lauf macht also dort weiter, wo der erste aufgehört hat.
  4. Pflegt die Herkunft: ersetzte Code-Kniffe verlassen `herkunft.json`, neue Talentbögen kommen nach `e32/generation.json` (mit `original`, `sha256`, Einträgen und Glyphen).
  5. Exportiert: `build-talents.mjs`, `build-precision.mjs`, `scripts/pwa-cache.mjs`.
  6. Erstellt den Kontaktbogen und führt die Prüfungen aus (`icons-codex`, `e71-kniffe`, `e32-delivery`, `art-precision`, `imagegen`); das Ergebnis steht im Log.
  - **Ergebniscode:** 0 fertig, 3 gestoppt mit offenen Bildern, 1 Fehler.
  - **Kein Commit, kein Push, keine Rücksetz-Gutschrift.**
- **Trockenlauf:** `D:\Dev\_prototypen\icons-2026-09-25\codex-samstag.cmd --dry-run`. Er liest das Kontingent, zeigt die Warteschlange und baut den Kontaktbogen vom Ist-Stand; es wird kein Bild angefordert.

## Kontingent

- **Plan:** 6 Bögen à ~0,3 % + 38 Kacheln à ~0,2 % ≈ **9,4 %** des Wochenkontingents.
  - Nach der Faustregel „5 Bilder je 1 %“ sind es 8,8 %.
  - Nach der Messung vom 24.09. (0,16 %/Bild) eher 7 %.
- **Dazu die Porträt-Aufgabe:** 28 Bilder ≈ 5–6 %.
- **Zusammen:** rund 15 % der frischen Woche. Die Grenze `--bis=60` fängt nur Ausreißer ab.

## Nach dem Lauf (Abnahme)

1. `D:\Dev\_review\icons-codex\index.html` ansehen, besonders die drei Schwächsten und die Talentbögen.
   - Prüfen: Glyphe nur oben rechts, Ecke unten rechts frei, Motiv passt zum Namen.
2. Missratenes gezielt neu erzeugen:
   - Kacheln: `npm run sprites:generate -- <blatt> --only=<id> --force`, danach `npm run sprites:precision`.
   - Talentbogen: Datei `sources/<spec>-v1.png` löschen, dann `node tools/sprite-pipeline/icons-codex-lauf.mjs --nur=talente --warte=`. Der Lauf erzeugt nur Fehlendes, trägt `e32/generation.json` nach und baut neu.
   - Prompt nachschärfen: in `icons-codex-motive.mjs`, dann `icons-codex-jobs.mjs` ausführen.
3. `npm test`, dann im Worktree committen.

## Noch nötig außerhalb dieses Branches

- **`skill-art.js` `paintSpecIcon`:** Die Direktsuche läuft nur über `SKILL_ICON_ORDER` (Dieter/Anni/Kevin). Die neuen Spez-Symbole `skill-schorsch-*`/`skill-kaethe-*` erscheinen erst, wenn dort `Object.keys(SKILL_ICON_ORDER)` durch `Object.keys(CLASS_SPECS)` ersetzt wird. Solange zeichnet `paintSpecVocab` weiter.
- **Review 3.1/2 (Export-Normalisierung der Talente auf 92 %, ohne `fitMotif`):** Das betrifft alle 450 Talente gemeinsam. Die neuen Bögen laufen bewusst durch denselben Zuschnitt wie E-32, damit die Familie einheitlich bleibt.
- **Branch nachziehen:** `icons-codex` vor Samstag auf `main` nachziehen, wenn dort `padding: 0`/Tintenrahmen und `skill-kaethe-mark` (icons-kniffe) schon liegen. Der Generator schärft `skill-kaethe-mark` mit, sobald der Eintrag im Blatt steht.
