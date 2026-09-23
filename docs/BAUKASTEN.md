# Sprite-Baukasten · Welten aus Einzel-Sprites (E-54)

Häuser, Innenräume und Höfe werden aus Einzel-Sprites zusammengesetzt, nicht als ein großes Bild gemalt. Jede Sprite-Art erbt ihre Eigenschaften und Regeln von einer Klasse. Ein Prüfer lehnt jede Platzierung ab, die gegen eine Regel verstößt. Kollision, Wege und Zeichenebenen ergeben sich aus den Arten, nicht aus Handarbeit.

| Datei | Rolle |
|---|---|
| `content/sprite-kit.js` | Klassen (`KIT_CLASSES`), Sprite-Arten (`KIT_SPRITES`), Regeln im Klartext (`KIT_RULES`) |
| `content/bude-house.js` | Beispielszene: die Bude mit zwei Geschossen und Hof |
| `world-kit.js` | Vererbung (`resolveSprite`), Platzierung (`placeKitItems`), Prüfer (`validateKitFloor`) |
| `world-house.js` | baut aus einer Szene Wände, Räume, Türen, Einrichtung und Kollision; Obergeschoss als eigene Welt |
| `kit-art.js` | Zeichnung: Belag, Bodendeko, Wände mit Wandschmuck, stehende Teile; Platzhalter, solange ein Bild fehlt |
| `tools/sprite-pipeline/kit-20260923-jobs.json` | Bildaufträge (Bögen je Klasse) |
| `tools/sprite-pipeline/build-kit.mjs` | zerlegt die Bögen in Einzel-Sprites und schreibt den Katalog `assets/precision/runtime/kit/kit.json` |
| `npm run kit:check` | prüft alle Szenen gegen die Regeln |

## Klassen und vererbte Eigenschaften

```
sprite ─┬─ belag          Bodenbelag · füllt einen Raum · begehbar · gekachelt
        ├─ bodendeko      flach am Boden · begehbar · darf unter Möbeln liegen
        ├─ wand ── zaun   auf Wandlinien · sperrt · gekachelter Streifen (Krone + Front)
        ├─ tuer           in Wandlücken · begehbar · hält 20 E Durchgang frei
        ├─ wandschmuck    nur an sichtbaren Wandfronten · Aufhängehöhe mount
        ├─ moebel ─┬─ ablage      sperrt · Ablage für Tischdeko
        │          ├─ sitz
        │          ├─ nassmoebel  braucht einen Raum mit Merkmal „nass“
        │          ├─ aussen      nur draußen
        │          └─ basisbau    Ausbaustufen der Bude (bewegliche Bauplätze)
        └─ tischdeko      nur auf einem Möbel mit Ablage, steht auf dessen Höhe
```

Eine Art nennt ihre Klasse mit `is` und ändert nur, was bei ihr anders ist. Beispiel: `stehtisch` erbt von `ablage` die Ablage, von `moebel` die Sperrwirkung und die Regel „nur drinnen“. Selbst setzt er nur Standfläche, Höhe und Farbe.

Felder: `layer` (Zeichenebene), `surface` (wo die Art stehen darf), `walkable`, `top`, `outdoor`/`indoor`, `needs` (Raum-Merkmale), `keepDoors`, `mount`, `w`/`h` (Standfläche in E), `height`, `cut` (sichtbare Front einer Wand), `color` (Platzhalter).

## Regeln (Prüfer `validateKitFloor`)

1. **Belag:** füllt genau einen Raum. Draußen sind nur Beläge mit `outdoor` erlaubt.
2. **Wände:** liegen auf Wandlinien und sperren. Türen sitzen nur in Lücken einer Wandlinie (34 E breit).
3. **Wandschmuck:** hängt nur an sichtbaren Wandfronten, also an einer waagerechten Wand mit dem Raum südlich davon. Er muss innerhalb der Wand liegen, darf andere Stücke nicht überlappen und muss mit `mount + height` in die Front passen: 22 E innen, 8 E an der südlichen Außenwand.
4. **Boden:** Möbel und Bodendeko stehen ganz auf freiem Boden eines Raums, weder in einer Wand noch außerhalb.
5. **Sperrwirkung:** Was nicht begehbar ist, sperrt mit seiner Standfläche. Sperrende Teile überlappen sich nicht.
6. **Türen:** Möbel halten vor jeder Tür 20 E Durchgang frei.
7. **Ablage:** Tischdeko steht nur auf einem Möbel mit `top`, innerhalb seiner Fläche.
8. **Draußen/drinnen:** `outdoor` nur in Außenräumen, `indoor` nur unter Dach.
9. **Merkmale:** `needs` nur in Räumen mit diesen Merkmalen (`tags`).
10. **Erreichbar:** Nach dem Einrichten bleiben alle Türen und Stellplätze auf echten Wegen erreichbar. Das prüfen `tests/bude-house.test.mjs` und `world.validate`.

## Zeichenebenen

| Ebene | Was | Wann |
|---|---|---|
| `ground` | Belag je Raum, als Kachelmuster am Haus ausgerichtet | unter allem |
| `decal` | Bodendeko, flach, darf quer liegen (90° gedreht) | unter Figuren |
| `wall` + `wall-decor` | Wand mit Krone und Front, Wandschmuck an der Front | tiefensortiert an der Südkante der Wand |
| `standing` | Möbel, Draußen-Teile, Tischdeko (direkt nach ihrem Möbel) | tiefensortiert an der Vorderkante der Standfläche |

- **Senkrechte Wände** zeigen nur ihre Krone und verdecken keine Figuren daneben.
- **Waagerechte Wände** verdecken, wer direkt dahinter steht, bis zur Hüfte.
- **Drinnen und draußen:** Innenräume blenden mit dem Dach ein. Hof, Zaun und Draußen-Teile sind immer sichtbar.
- **Geschosse:** Jedes Geschoss (`upper`) hat eigene Wände, Räume und Einrichtung. Man sieht nur das eigene.

## Neues Teil hinzufügen

1. **Art anlegen:** in `KIT_SPRITES` mit `is`, `name`, Standfläche, Höhe und Platzhalterfarbe. Die Regeln kommen aus der Klasse.
2. **Bild bestellen:** in einem Bogen des Auftragsblatts, in der richtigen Rasterposition. Dann `npm run sprites:generate -- tools/sprite-pipeline/kit-…-jobs.json` aufrufen und die ID in `KIT_SHEETS` von `build-kit.mjs` eintragen.
3. **Exportieren:** `node tools/sprite-pipeline/build-kit.mjs && node scripts/pwa-cache.mjs`.
4. **Platzieren und prüfen:** in einer Szene platzieren, `npm run kit:check` und `npm test` laufen lassen.

## Neue Szene (Haus, Raum, Hof)

Eine Szene hat dasselbe Format wie `BUDE_HOUSE`:
- `walls` (Wandlinien mit `kind`)
- `wallStyle` (Wand-Art je Typ)
- `doors` (Mitte der Lücke, Tür-Art `s`)
- `rooms` (Rechtecke, `belag`, `tags`, `outdoor`)
- `items` (`{s, x, y}` = Mitte der Standfläche; optional `w`/`h` zum Strecken oder Drehen von Bodendeko)
- `stairs`, optional `upper`

`world-house.js` baut daraus die Weltobjekte. Der Prüfer nennt Verstöße im Klartext, zum Beispiel: `tueren: Holzstuhl – versperrt den Durchgang an Eingang`.
