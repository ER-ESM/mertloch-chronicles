# Sprite-Schmiede (E-58)

Selbst gerenderte Sprites ohne Bild-KI: Modelle aus 3D-Grundkörpern (Distanzfelder), gerendert in der Spielkamera,
eingerastet auf `PRECISION_PALETTE`, mit Kontur in Schiefertinte. Jeder Lauf ist byte-gleich reproduzierbar.
Vorteile gegenüber imagegen: exakte Maße aus den Daten, Bildfolgen ohne Flackern (dasselbe Objekt in anderer Stellung),
Varianten per Parameter, Figuren aus wiederverwendbaren Körperteilen in allen vier Blickrichtungen.

## Werkzeuge

| Datei | Aufgabe |
|---|---|
| `tools/sprite-forge/sdf.mjs` | Grundkörper (`box`, `block`, `cylZ`, `capsule`, `roundCone`, `ellipsoid`, `torusZ`, `extrudeXZ`), Verknüpfungen (`union`, `smoothUnion`, `subtract`, `intersect`, `shell`), Lage (`at`, `rotX/Y/Z`, `mirrorX/Y`, `repeatX/Y`), Rauschen (`noise3`, `fbm3`, kachelbar `fbmTile3`) |
| `tools/sprite-forge/materials.mjs` | Materialien mit Farbrampe (Schatten kühl-violett, Lichter warm): `wood`, `metal` (mit Rost), `plaster`, `stone`, `fabric`, `leather`, `skin`, `hair`, `ceramic`, `glass`, `paper`, `plastic`, `glow` (leuchtend), `custom` (eigene Textur) |
| `tools/sprite-forge/render.mjs` | Raycaster: Ansichten `oblique` (Standard), `top` (Beläge, Bodendeko), `front` (Wandfronten); Licht, Umgebungsverdeckung, weiche Eigenschatten, Punktlichter, Innenlinien, Kontur, Palette |
| `tools/sprite-forge/kit.mjs` | Baukasten-Export: rendert alle Modelle aus `tools/sprite-forge/models/*.mjs` nach `assets/forge/runtime/kit/` und schreibt `kit-forge.json` |
| `tools/sprite-forge/figure.mjs` | Figuren aus Skelett + Körperteilen (siehe unten) |
| `scripts/forge-bude-check.mjs` | Browserprüfung in der Bude mit Aufnahmen unter `visual-review/forge/bude/` |

### Aufrufe

```
node tools/sprite-forge/kit.mjs                              # alles bauen (assets + Katalog)
node tools/sprite-forge/kit.mjs --only=sofa,kommode --sheet  # nur diese, plus Kontaktbogen
node tools/sprite-forge/kit.mjs --only=sofa --dry --name=a1  # nur Vorschau: visual-review/forge/kontakt-a1.png, schreibt NICHTS unter assets/
node scripts/pwa-cache.mjs && npm run kit:check && npm test
node scripts/forge-bude-check.mjs                            # Sichtprüfung im Browser
```

Parallel arbeitende Agenten benutzen nur `--dry`. Den gemeinsamen Katalog schreibt nur der volle Lauf.

## Kamera und Maße

- Die Einheit ist die Welteinheit E, 1 m = 14,4 E. Gerendert wird mit **4 px je E**: eine Figur von 26 E ist 104 px hoch, eine Tür 35 E.
- Die Achsen: x nach Osten, y nach Süden (zum Betrachter), z nach oben.
- **Schräge Kamera:** Bildschirm-y = y·tan 35° − z. Höhen erscheinen 1:1, die Tiefe ist verkürzt, der Kamerawinkel ist achsparallel und **nicht isometrisch**.
- **Figurenhöhe im Spiel:** Weil die Tiefe mitgezeichnet wird, ist eine 26-E-Figur im Bild ≈ 31 E hoch (vorderer Fuß unter dem Fußpunkt, Kopf hinten). Die gemalten Helden- und Präzisionsbögen sind 26 E Kopf bis Fuß. `content-art.js` misst deshalb beim Laden die gezeichnete Höhe jeder Schmiede-Figur (`paintedHeight`, Ruhebild se) und zeichnet sie auf 26 E; der Schritt schrumpft mit. Am Modell oder an `nativeHeight` im Katalog ist dafür nichts zu ändern. Prüfung: `npm run figures:check` (siehe `docs/MASSSTAB-2026-09-17.md`).
- **Licht:**
  - Das Hauptlicht kommt von links oben. Beleuchtet sind die linken Flächen, die Deckflächen und die Vorderseiten.
  - Ein kühles Fülllicht kommt von rechts.
  - Bodenschatten backen wir **nicht** ein. Die Laufzeit zeichnet die Ellipse selbst.

## Modelle für den Baukasten

Eine Modelldatei sieht so aus:

```js
export const MODELS={
  sofa:{height:14, frames:1, build(t,def){ return {solids:[{f, mat, group, tex?, glow?, noShadow?}], lights:[{p,r,k,color}]}; }},
};
```

**Maße und Anker kommen aus `content/sprite-kit.js`** über `resolveSprite(id)`: Standfläche `w×h` und Höhe `height`.

| Klasse | Modellkoordinaten | Bild |
|---|---|---|
| möbel, sitz, ablage, aussen, tischdeko | Standfläche mittig um (0,0); x ∈ ±w/2, y ∈ ±h/2; Boden z=0 | Breite = w·4 px; Unterkante = Vorderkante (y=+h/2, z=0) |
| wandschmuck | wie oben. Die Rückseite liegt bei y=−h/2 an der Wand, z=0 ist die Unterkante des Schmucks. | wie oben; die Laufzeit hängt ihn auf `mount` über dem Wandfuß |
| bodendeko | flach von oben, x ∈ ±w/2, y ∈ ±h/2 | w·4 × h·4 px, Ansicht `top` |
| belag | eine Kachel 64×64 E, x/y ∈ ±32, Oberfläche knapp unter z=0 | 256×256 px, Ansicht `top`, **nahtlos periodisch** (`fbmTile3`, Bretterbreiten, die 64 teilen) |
| wand, zaun | Wand entlang x, Länge `length` (Standard 64, periodisch), Mitte y=0, Fuß z=0, Höhe mindestens `cut` | oben die Krone (von oben, Tiefe = `thickness`), darunter die Front (von vorn, Höhe `cut`); `cap` steht im Katalog |

- Nichts darf über die Standfläche seitlich hinausragen, sonst wird es abgeschnitten.
- Nach oben ist Platz: `extraTop`, Standard 6 E.
- `group` fasst Körper zusammen. Zwischen Gruppen entstehen bei Tiefensprüngen dunkle Innenlinien, etwa zwischen Tischplatte und Bein.
- `tex(x,y,z)→[u,v,w]` legt Textur-Koordinaten fest. Bei bewegten Teilen müssen sie sich mitbewegen, sonst „schwimmt“ die Maserung.

### Bildfolgen (Animation)

- `frames: n`, `fps: k`. `build(t)` bekommt t ∈ [0,1).
- Für nahtlose Schleifen läuft das Rauschen über einen Kreis. `flicker(t,seed)` und `fireGlow(t)` aus `models/referenz.mjs` sind die Vorlage.
- `glow` ist eine Zahl oder Funktion von 0 bis 1 und steuert leuchtende Materialien.
- `lights` sind warme Punktlichter, die die Umgebung im Sprite mit erhellen.
- Die Laufzeit (`kit-art.js`) versetzt die Phase je Teil nach seiner Lage, damit gleiche Lampen nicht im Gleichtakt flackern.
- Höchstens 8 Bilder, lieber 4–6. Nur animieren, was einen Grund hat (Anti-Slop-Regel 9): Feuer, Licht, Flüssigkeit, Stoff im Luftzug.

### Qualitätsregeln

1. **Vorbild ist der imagegen-Bogen derselben Art** (`assets/precision/sources/2026-09-23/kit-*.png`): dieselben erkennbaren Details (Decke auf dem Sofa, Flaschen im Kasten). Die Maße und die Lesbarkeit im Spiel gehen vor.
2. **Lesbar in Spielgröße.** Die Laufzeit zeichnet bei 2–4 px je E. Details unter 0,5 E verschwinden. Lieber wenige kräftige Formen mit klaren Innenlinien.
3. **Kontrast:**
   - Dunkles Material dunkel lassen (Gusseisen `#2f2e35`), Holz warm, Putz hell.
   - Jede Fläche braucht eine Licht- und eine Schattenseite.
4. **Ein Material je Körper**, Farbe über den Grundton der Fabrik (`wood('#7a5230')`). Die Palette rastet die Farben selbst ein.
5. Kein `Math.random`, keine Uhrzeit, damit der Export byte-gleich bleibt.
6. **Prüfen:**
   - Nach jeder Änderung den Kontaktbogen mit dem Read-Werkzeug ansehen.
   - Mindestens zwei Runden „ansehen, schärfen“.
   - Das imagegen-Original daneben ansehen.

### Fallen (gesammelt beim Bau der Bude, 23.09.2026)

- **Unterkante:** Die Bildunterkante liegt bei Bildschirm-y = h/2·tan 35°. Was nahe z = 0 nach vorn übersteht, wird abgeschnitten, sobald y·tan 35° − z größer ist.
- **Ansicht `top` sieht nur bis z ≈ −4.** Tiefere Stellen bleiben durchsichtig. Bei tiefen Mulden (Treppenloch) die Oberkante hoch legen, etwa auf z = 40.
- **Flache Deckflächen in `top` werden hell** (Helligkeit ≈ 0,73, also Lichtstufe 4–5). Bei Bodendeko und Belägen dunklere Grundtöne wählen oder die Textur mit `k ≈ 0,75` dämpfen.
- **Lücken zwischen senkrechten Körpern verschwinden in der Schrägsicht**, wenn sie schmaler als 2r·tan 35° sind. Rauch und Latten brauchen deshalb mindestens 1 E Lücke.
- **Glas an senkrechten Flächen bekommt kaum Glanz.** Einen Glanzstreifen per `custom`-Textur setzen (Vorbild: `models/wandschmuck.mjs`).
- **Grün:** Im Schatten zieht die Standardrampe Grün ins Oliv-Braune. Eine eigene Rampe aus Palettentönen zurückgeben (`tex` → `{ramp}`; Vorbild: `models/deko.mjs`).
- **Innenlinien** entstehen nur zwischen verschiedenen `group`s und erst ab 1,1 E Tiefensprung. Bündige Schubladen und Türen brauchen deshalb dunkle Fugen-Körper dahinter.
- **Mulden** (Eimer, Becken, Schüssel) bleiben zu hell. Eigene Materialien mit Innen-Abdunklung verwenden (Vorbild: `models/moebel-arbeit.mjs`).
- **`fbm3`** liefert im Mittel 0,35–0,45, nicht 0,5. Schwellen für Flecken entsprechend niedriger ansetzen.
- **Beläge und Wände:** Die Standardmaterialien sind nicht kachelbar. Eigene Texturen mit `fbmTile3` bauen (Vorbild: `models/belag-wand.mjs`).

## Malstufen für Figuren

`renderScene` kennt wählbare Stufen, die Figuren standardmäßig nutzen (`FIGURE_STYLE` in `figures.mjs`). Die Kit-Modelle bleiben ohne sie.

| Stufe | Wirkung |
|---|---|
| `oversample: 2` | in doppelter Auflösung rendern, flächengemittelt verkleinern: feine Details bleiben als Mischfarbe erhalten |
| `bump(u,v,w)` am Material, `bumpScale` | Höhenrelief kippt die Normale: Stofffalten, Strickrippen, Nähte, Poren, Haarsträhnen |
| `rim` | kühles Kantenlicht von hinten rechts, trennt die Figur vom Boden |
| `bands` | Helligkeit zu gemalten Stufen ziehen |

### Figuren wie die gemalten Bögen (Ida-Abgleich, 9 Runden, 23.09.2026)

Nutzerbefund: „sehr kalt statt warm und rund, es fehlen deutlich viele Details“. Beim Abgleich mit dem gemalten Präzisionsbogen von Ida (`assets/precision/runtime/npcs/ida.png`) hat sich Folgendes als Regel für Figuren ergeben:

| Regel | Umsetzung |
|---|---|
| Warmes Licht | `setMood('warm')` in `figures.mjs`: Schatten laufen ins Rotbraun statt ins Violett. Das Kantenlicht ist warm (`rimTint`), die Belichtung liegt bei `exposure .84`. |
| Fast frontal | Figurenkamera 15° statt 35°. `FACING` se/sw nur 25° gedreht. Die Gesichtskippung `TILT` beträgt 5°, bei 16° wirkten die Augen geschlossen. |
| Weich statt gestuft | `bands: 0` |
| Stilisierte Köpfe | Kopf ≈ 1/4,7 der Figur (Archetyp `head`). Das Gesicht wird mit `face.breite` schmaler, das Haarvolumen darum herum bleibt breit. |
| Große dunkle Augen | Das Auge ist 2–3 px hoch, die Iris groß und dunkel, das Augenweiß warm und wenig sichtbar, die Lidlinie kräftig. |
| Haar mit Büscheln | Warme dunkle Büschel (`#5a2412`), tieferes Strähnenrelief. Neuer Stil `locken`: seitliches Volumen, Locken rahmen das Gesicht. |
| Ruhige Flächen | Die Schürze bekommt die Option `falten` (Ida .3), sonst wirken die Röhrenfalten in Spielgröße wie Schmutzstreifen. |

### Pixelmaler statt verkleinertem 3D (Ida, zweiter Anlauf, 23.09.2026)

Nutzerbefund nach Runde 9: „sieht nicht aus wie Pixellook, sondern durch die Flächen eher wie billige 3D-Arbeit“. Neuer Ansatz: Der Renderer liefert für Figuren nur noch einen G-Buffer (`renderScene(…, {gbuffer:true})`: Material, Helligkeit, Farbtreppe, Normale, Tiefe und Kopfkoordinaten je Pixel, ein Abtastpunkt, keine Mittelung). Das eigentliche Bild malt `tools/sprite-forge/pixel.mjs`:

1. **Tonstufen** statt Verläufen: wenige harte Töne je Material. `CONTRAST` spreizt die Helligkeit je Material um die Mitte (Haut und Haar stärker).
2. **Cluster:** Einzelpixel gehen im Mehrheitston auf.
3. **Linien:** Bei einem Tiefensprung zwischen Teilen und an scharfen Knicken entsteht eine Linie im dunklen Ton des hinteren Materials.
4. **Kontur:** Die Außenkontur ist in der dunkelsten Stufe des angrenzenden Materials gefärbt, zum warmen Dunkelbraun gezogen (statt Schiefertinte).
5. **Gesichts-Stempel** (`figure/stamps.mjs`, `face.stamp: 'feminin' | 'maskulin'`):
   - Der Pixelmaler findet Augen, Brauen, Nase, Mund und Wangen über die Kopfkoordinaten der Gesichtshaut und setzt dort handgezeichnete Pixelvorlagen.
   - Das nähere Auge wird voll gezeichnet, das fernere verkürzt. Verdeckung durch Haar oder Bart ergibt sich von selbst.
   - Neue Stempel sind die Gesichtsoptionen des Charaktereditors.

`FIGURE_STYLE={painter:true, pitch:15, exposure:.84}`. Die alte Malstufe (Doppelauflösung, Kantenlicht) bleibt über `renderScene` wählbar.

**Vergleichswerkzeug** (im Scratchpad der Sitzung, schnell neu zu bauen): Original und Schmiede als Grundhaltung se/sw nebeneinander, 4× vergrößert und 1×, dazu ein Kopfausschnitt 8×. Der Posenbogen jedes `--dry`-Laufs liegt unter `visual-review/forge/bogen/<name>-<id>.png`.

## Figuren (Körperteile zum Wiederverwenden)

`tools/sprite-forge/figure.mjs` setzt Figuren aus Modulen zusammen, jedes mit eigenem Besitzer:

| Modul | Inhalt |
|---|---|
| `figure/skeleton.mjs` | Skelett aus Körpermaßen (`height`, `build`, `belly`, `bust`, `shoulders`, `hips`, `head`, `legs`) und Pose (Gelenkwinkel), Rahmen für Oberkörper (`F.U`) und Kopf (`F.H`), nackter Körper als Distanzfelder |
| `figure/face.mjs` | Gesicht: Augen, Brauen, Nase, Mund, Alterszüge |
| `figure/hair.mjs` | Frisuren und Bärte im Kopf-Rahmen |
| `figure/wardrobe.mjs` | Kleidung als Hüllen um die Körperteile (Hemd, Jacke, Hose, Rock, Schürze, Schuhe, Hut …) |
| `figure/props.mjs` | Beiwerk an Gelenken (Kasten, Fass, Tank, Werkzeug …) |
| `figure/poses.mjs` | Posen der acht Bogenspalten und der Gehzyklus |

### Drei Schichten statt Gesamtpaket (Nutzervorgabe 23.09.2026)

> „Es gibt keine heldenspezifische Kleidung. Es sind nur 3 Archetypen von Körperbau und grober Struktur. Die Details ergeben sich aus der Kleidung/Gear, die man anzieht. Gesichtsdetails, Farben oder Frisuren ergeben sich aus dem Charaktereditor bei Erstellung.“

Jede Figur, ob Held oder NPC, besteht deshalb aus genau drei Schichten:

| Schicht | Datei | Inhalt |
|---|---|---|
| Körper-Archetyp | `figures/archetypes.mjs` | `dieter` = Kräftig, `baerbel` = Schwungvoll, `kevin` = Drahtig (Kennungen wie `LOOKS` in `characters.js`). Nur Körperbau. |
| Aussehen (Charaktereditor) | `figures/appearance.mjs` | Haut, Haarfarbe (Kennungen wie `hero-tint.js`), Frisur, Bart, Gesichtsbausteine (Augen, Brauen, Mund, Nase, Alter), Extra (Brille, Sonnenbrille, Stirnband) |
| Ausrüstung | `figures/gear.mjs` | Kleidung und Beiwerk als Gegenstände mit Platz (`slot`) und sichtbarer Familie (`family`, wie `equipment-appearance.js`). Jedes Teil passt auf jeden Archetyp, weil es als Hülle um dessen Körperteile entsteht. |

- **Figur (reine Daten):**

  ```js
  {name, archetype:'baerbel',
   look:{skin:'hell', hair:{style:'dutt', color:'blond'}, face:{mouth:'resolut', age:.8}},
   gear:[['strickjacke',{}], ['schuerze',{emblem:'#5f7e3a'}], ['bierkasten',{side:-1}], …],
   pose:{…}}
  ```

  `characterRecipe()` in `figure.mjs` löst das in das interne Rezept auf.
- **NPCs mit fester Identität** (Ida, Mentoren) nutzen dieselben drei Schichten. Ihre Wiedererkennung kommt aus Ausrüstung, Editorwerten und Haltung, nicht aus einem eigenen Körper.
- **Helden (nächster Schritt):**
  - Je Archetyp einen Grundbogen (Körper + Unterwäsche) rendern, je Ausrüstungsteil einen Ebenenbogen mit eingerechneter Verdeckung (wie die alten 3D-Prerender-Ebenen, E-30) und Frisuren und Bärte in Grau zum Einfärben (`hero-tint.js`).
  - Die Laufzeit legt die Ebenen der getragenen Gegenstände übereinander.
- **Musterreihen:** `figures/_schichten.mjs`, nur mit `--dry`: gleiche Ausrüstung auf allen drei Archetypen, gleicher Archetyp mit verschiedenen Editor-Einstellungen.
- **Rezepte** (`tools/sprite-forge/figures/*.mjs`, reine Daten) werden an die Worker-Threads geschickt: keine Funktionen, keine Materialobjekte.
- **Ebenen:** Jeder Körper trägt eine Ebene (`layer`). Mit `--layers` entsteht je Ebene ein Bogen mit eingerechneter Verdeckung. Das ist die Grundlage für generische NPCs, den Charaktereditor und Ausrüstung am Helden.
- **Ausgabe:** Das Format ist das des Präzisionskatalogs (192er Zellen, Fußpunkt 96/160, Zeilen se/sw/ne/nw, Spalten idle … rest, dazu ein Laufbogen mit acht Bildern). `content-art.js` lädt `assets/forge/runtime/figures/catalog.json` und ersetzt gleichnamige Einträge.

```
node tools/sprite-forge/figures.mjs --dry --quick --rows=se --only=ida --name=test   # schnell, nur Vorschau
node tools/sprite-forge/figures.mjs --dry --only=ida                                  # volle Qualität, nur Vorschau
node tools/sprite-forge/figures.mjs                                                   # alle Figuren nach assets/ + Katalog
```

Jeder Lauf schreibt `visual-review/forge/figuren-<name>.png` (Posen und Laufzyklus) und `zoom-<name>.png` (Grundhaltung in allen Richtungen, 3×). Testfiguren in `figures/_*.mjs` erscheinen nur mit `--dry`.
