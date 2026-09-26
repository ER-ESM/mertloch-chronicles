# Anziehpuppe (E-68)

Figuren im Spiel werden aus Ebenen zusammengesetzt: **Archetyp + Aussehen + Ausrüstung**. Es gibt keine Sonderkörper und keine fest verdrahtete Kleidung (Nutzervorgabe 2026-09-23). Das gilt für Helden, Mitspieler, Söldner und NPCs. Gegner und Bosse behalten ihre Präzisionsbögen.

- **Archetypen:**
  - `dieter`: Kräftig.
  - `baerbel`: Schwungvoll, im Werkzeug `ida`.
  - `kevin`: Drahtig.
- **Aussehen:** Die Editor-Kennungen aus `hero-tint.js`. Haut- und Haarfarbe werden zur Laufzeit über die Farbtreppen umgefärbt. Bart, Brille, Sonnenbrille, Stirnband und Irokese sind eigene Ebenen.
- **Ausrüstung:** Jede Gegenstands-ID aus `content/items.js` hat eine eigene Quelle. Zufallsgegenstände gehen über ihre Familie (`equipment-appearance.js`).

## Aufbau

- **Werkzeug `tools/paperdoll/puppe.mjs`:**
  - Die Handpixel-Puppe ist ein 2D-Skelett mit 7 Tiefenbändern.
  - Die Köpfe, starren Teile und die Stofffüllung kommen von Codex und sind auf die Puppenfarben gerechnet. Die Quellen liegen in `tools/paperdoll/hybrid/teile` und `hybrid/textur`.
  - Erweiterungsmodule:
    - `familien.mjs`: weitere Gegenstände und Familien.
    - `aussehen.mjs`: Editor-Ebenen.
    - `npc-kleidung.mjs`: Kleidung für NPCs.
  - Reiten: `MOUNTS`, `poseRide`, `rideRider`/`rideMount` (`renderRide`). Waffen, Nebenhand und Fernwaffen bleiben beim Reiten verstaut.
  - Aktionsposen: `FRAMES` 13–26 (Hieb, Zweihand-Hieb, Getroffen, Parade, Zaubern, Rasten, Sprint, Zielen, Schuss), beschrieben in der Rezepttabelle `ACTS` (`poseAct`) in Körperrichtung; Waffenarm über die Seitenregel (`swap`), Rumpfneigung `p.lean`. Weil die Pose an der Waffenseite hängt, bekommen Aktionsbilder für sw/ne immer eigene Bögen (`cat.ownAkt`), Grundbilder werden gespiegelt.
  - Kopf-Einrasten: Haarpixel der Codex-Köpfe werden beim Laden auf die Haartreppe gesetzt (`kopfEinrasten`), damit das Umfärben keine Fremdpixel stehen lässt.
  - **Ferne Hand (`HAND_F` = `beinHinten`):** Was die ferne Hand hält oder trägt, liegt im Band des fernen Beins hinter dessen Kleidung. Das sind die Waffe in sw/nw, die Fernwaffe, die Nebenhandwaffe `_nh` in se/ne, Handschuh und Ring. So liegt es vor dem fernen Bein, aber hinter nahem Bein und Rumpf; der Arm selbst bleibt in `armHinten`. Beim Reiten zeichnen Handschuh und Ring weiter in `armHinten`.
  - **Stoppeln** (`bart-stoppeln`) sind ein Bartschatten in der Hauttreppe mit lockerem Tupfen (Mindestabstand 3), ohne Haarfarbpunkte. So färben sie mit dem Hautton um und bleiben in Weltgröße eine ruhige Fläche.
- **Bildfläche (Leinwand):** 296 × 328 px, Boden 300, Fußpunkt (148, 300). Bis 2026-09-24 waren es 160 × 216 mit Boden 206; dort waren 260 Bilder abgeschnitten, darunter 148 Kochmützen-Bilder oben.
  - Gemessen mit großer Leinwand (`PUPPE_LEINWAND=440,460,340`): Alle Bilder liegen in x −118…+116 und y −239…+11 um den Fußpunkt. Die im Spiel sichtbaren Bilder liegen in x −105…+99; Nahkampfwaffen in Zielen/Schuss und Fernwaffen im Hieb zeigt das Spiel nie.
  - Maße: Die Breite liegt 26 % über der Hülle und lässt Platz für breitere Heldenanimationen. Oben bleiben 61 px für Überkopf-Schläge (25 % über der höchsten Stelle, der Greifzange im Hieb). Freier Rand: links 30, rechts 31, oben 61, unten 16 px.
  - Der Bau misst die Hülle (`cat.huelle`) und schreibt sie ins Protokoll. `tests/paperdoll-posen` verlangt mindestens 12 px Rand.
  - Rauschmuster (Fell, Kutte, Falten, Tweed) hängen am alten Leinwandursprung (`NZ`, `KIT.hsA`), deshalb bleiben die Figuren beim Vergrößern gleich. Ausnahmen sind Kantenpixel durch Gleitkomma-Rundung und Bilder, die vorher abgeschnitten waren.
  - Die Reiterkachel ist die Figurenleinwand (Becken bei `W/2, GROUND−88`).
  - Kosten: Die Leinwand ist 2,8-mal so groß wie vorher. Die Zellen fangen das ab: Die Bögen belegen dekodiert nur ihren Inhalt (Zahlen im Bericht vom 2026-09-24).
- **Reiten im Spiel `paperdoll-mount.js`:**
  - Lädt erst beim Aufsitzen (bzw. Fahrstall, Sammlung, Symbol): Katalog, je Reittier Kacheltabellen + Tierseite, Reiterseite nur für den gebrauchten Archetyp. Die Dateien stehen nur optional im Offline-Cache.
  - Setzt Reiter und Tier Band für Band mit dem Kern zusammen, färbt um und verkleinert wie `paperdoll-art.js`. Reiter = 26 E wie zu Fuß; das Tier hat den Maßstab aus dem Werkzeug.
  - Bild 0 = Stand, 1–8 = Bewegung nach Wegstrecke (`MOUNT_RULES.stride`). Schatten je Reittier, Archetyp und Richtung.
  - Angedockt in `drawClanHero`, am Fahrstall (`drawMountStation`), in den Sammlungskarten und im Symbol. Fehlt etwas, zeichnen die alten Bögen (`mount-art.js`).
- **Kern `paperdoll-kern.js`:**
  - Setzt Band für Band zusammen.
  - Legt einen Kontaktschatten auf die nächstdunklere Palettenstufe.
  - Zieht eine dunkle Kontur auf der Schattenseite.
  - Werkzeug und Spiel nutzen denselben Kern.
- **Laufzeit `paperdoll-art.js`:**
  - **Bogenformat** (Katalog `version 3`, `layout:'bands'`): je Quelle × Archetyp × Richtung ein Grundbogen `<quelle>-<arch><dir>.png` (Stehen, Blinzeln, Laufen) und ein Aktionsbogen `…-akt.png` (Bilder ab `cat.split`). Zeilen = nur die Tiefenbänder der Quelle (`cat.sources[q].bands`).
    - **Zelle:** Jede Kachel ist auf die Zelle der Quelle zugeschnitten: `cat.sources[q].cell={x,y,w,h}`. Die Zelle ist die Vereinigung der Inhaltshüllen über alle Bögen der Quelle (Archetypen, eigene Richtungen, Grund- und Aktionsteil, Bänder, Bilder) in Leinwandkoordinaten der gezeichneten Bögen, mit 1 px Rand; eine leere Quelle hat `{x:0,y:0,w:1,h:1}`.
    - Spalte je Bild = `cell.w`, Zeile je Band = `cell.h`. Pixel (x,y) liegt bei (col·cell.w + x−cell.x, row·cell.h + y−cell.y).
    - Tests lesen die Bögen über `tests/paperdoll-sheet.mjs`.
  - **Laden nach Bedarf:** Vorab (Ladeschirm) nur Katalog und Grundbögen von Körper, Dutt und Aussehen, dazu `preloadFigure` für den eigenen Helden (Grund- und Aktionsbögen). NPC-Kleidung lädt danach leise im Hintergrund, alles andere beim ersten Gebrauch. Fehlt ein Bogen noch, zeigt die Figur ihr letztes Bild bzw. einmalig den alten Weg; Aktionsbilder fallen bis dahin auf den Stand zurück. Standbilder (Heldenkarten, Figurenfenster, Porträt) hören auf `onPaperdollLoad` und zeichnen neu.
  - **Offline-Cache:** Pflicht sind nur Katalog und diese Grundbögen, alle übrigen Bögen stehen optional in `precache-manifest.js`.
  - Wählt das Bild: Posen (`paperdollPose`, gleiche Rangfolge wie `redesignPose`), Laufen, Atmen, Blinzeln.
  - Färbt um.
  - **Kachelspeicher:** jede Kachel (Bogen × Band × Bild × Spiegelung) wird einmal gelesen und auf ihren Inhalt zugeschnitten (bis 48 MB, LRU); der Kern (`composeCore`) nimmt Zuschnitte `{data,x,y,w,h}` und arbeitet nur über deckende Pixel, Kontur und Verkleinern nur innerhalb der Inhaltshülle (`out.box`). Gemessen: Zusammensetzen 9 → 1,3 ms (warm). Diagnose: `paperdoll.debug.compose(...)`, `paperdoll.debug.tiles()`, `paperdoll.stats`.
  - Verkleinert für die Welt: Flächenmittel, dann zurück auf die Palette, dann Kontur. Weltbilder liegen in einem eigenen Speicher (Zusammensetzung × Maßstab × Tönung); höchstens 4 neue Weltbilder je Bild, darüber zeigt eine Figur ihr letztes Bild weiter (kein Ruckeln bei vielen NPCs).
  - **Maßstab** (`unitScale`): Archetypen (Höhe mit Dutt) auf 26 E angeglichen, ein Fünftel der natürlichen Streuung bleibt. `npm run figures:check` verlangt ±5 % zur Heldenhöhe; Kopfschmuck (Kopfteil, eigene Frisur) darf bis +12 %.
  - Andockpunkt ist `drawDetailedHero`, deshalb laufen Welt, Editor, Porträt und Figurenfenster automatisch mit.
- **NPCs `paperdoll-figuren.js` + `content/figuren.js`:** Jede Figur (NPCs, Dorfbewohner, Berufslehrer, Söldner) ist Archetyp + Aussehen + Kleidungsliste und meldet sich als `npc:<id>` an (Clan-Mitglieder zusätzlich als `mentor-<id>`). `drawWorldPerson`, der Mentorenweg, Dorfbewohner und Lehrer fragen zuerst die Puppe; Porträts bleiben beim festen Bild. Söldner bekommen Tönung und Kleidung über die Renderer-Ansicht.
- **Mitspieler:** Die Anwesenheit überträgt die sichtbare Ausrüstung auch zu Fuß, mit geprüfter Gegenstandskennung (`mount-wire.js`).

## Bauen

```
node tools/paperdoll/puppe.mjs --runtime        # assets/paperdoll/runtime: Grund- und Aktionsbögen + catalog.json (~8 min)
node tools/paperdoll/puppe.mjs --runtime --nur gartenzwerg,kegelkugel   # Teilneubau einzelner Quellen (~4 s je Quelle): ersetzt nur ihre Bögen + Katalogeinträge, übernimmt neue Farbtreppen in Palette/Schattentabelle, verweigert bei geänderter Leinwand/Bildern; Ergebnis byte-gleich zum vollen Neubau; danach pwa-cache (Kleidung/Glücksbringer: auch --reiten)
node tools/paperdoll/waffen-vorschau.mjs <id,id> [ordner] [S]   # Kontaktbogen (se/sw/nw/ne), alle Archetypen × Richtungen, Weltgröße k=0,3/0,45/0,6, Symbol neben Figur; Waffen, Kleidung, Glücksbringer → tools/paperdoll/out-waffen/ (ohne Laufzeitbau)
node tools/paperdoll/puppe.mjs --reiten         # assets/paperdoll/reiten: Reit-Bögen, 6 Reittiere × 3 Archetypen (~1 min, REITEN_JOBS=n Threads, ~4 MB)
node scripts/pwa-cache.mjs                      # danach: Offline-Liste (Reit-Bögen stehen darin nur optional)
node tools/paperdoll/reiten.mjs --vorschau hofpferd,drahtesel baerbel,kevin se,nw   # Kontaktbogen aus den Reit-Bögen → visual-review/mounts/
node tools/paperdoll/puppe.mjs <ordner>         # Vorschau-Bögen (Figuren ida/dieter/kevin) + puppe.json
node tools/paperdoll/zeigen.mjs <ordner> 3 "ida:kutte,jeans|dieter@nw:" "0,5,6" name 3b3024   # Vorschaubild
PUPPE_LEINWAND=440,460,340 node tools/paperdoll/puppe.mjs --runtime <ordner>   # Hüllenmessung auf großer Leinwand (Protokoll: „Hülle … frei …“)
```

## Ergänzen

- **Neuer Gegenstand:** Die Quelle gehört in `familien.mjs` oder `npc-kleidung.mjs`, mit der Kennung gleich der Item-ID. Sie wird in allen 4 Richtungen und bei allen 3 Archetypen geprüft. Danach `--runtime` ausführen.
- **Neue Waffe:** Die Designvorlage ist das 64-px-Symbol. Prüfen immer in Weltgröße (`waffen-vorschau.mjs`, k=0,3–0,6): Kleinstdetails wie Tropfen, Funken oder Rändelung werden dort zu Rauschen, und die prägende Fläche muss größer sein, als es sich anfühlt. Beispiel: Das Gesicht des Gartenzwergs wurde erst als breite Hautfläche mit dicker Nase lesbar. Zweihänder dürfen in Stand und Laufen aufrecht getragen werden (Gartenzwerg wie ein Wanderstab). Fernwaffen wechseln zwischen Stand und Zielen die Seite, sonst fällt die Sichtbarkeitsprüfung der fernen Hand in nw durch.
- **Neuer NPC:** Einen Eintrag in `content/figuren.js` anlegen: Archetyp, Aussehen und Kleidungsliste.
- **Neues Reittier:** Es kommt in `MOUNTS` (Reiten-Abschnitt), mit Sitzform und Ankern je Bild. Dazu ein Inhaltseintrag in `content/mounts.js` (mit `kind` und `sound`). Danach `--reiten` und `pwa-cache` ausführen; `tests/paperdoll-mount.test.mjs` prüft, dass Inhalt und Reit-Katalog übereinstimmen.
- **Neue Quelle und Reiten:** Nach neuen Gegenständen oder Aussehen-Ebenen auch `--reiten` ausführen. Sonst fehlt die Quelle nur auf dem Reittier; der Reiter wird dann ohne sie gezeichnet.

## Sonderbögen und Motive (Dungeon-Figuren, Entwurf 2026-09-26, freigabepflichtig)

Bosse und Gegner in „Schloss Big B“ sind Menschen aus der Puppe (Archetyp + Aussehen + Kleidung, `content/dungeon-figuren.js`) oder Motive
(Pappaufsteller, Pfandratte, Beamer-Gespenst). Gezeichnet werden sie nur hinter dem Schalter `localStorage['mertloch-dungeon-figuren']='1'`
bzw. `?dungeon-figuren=1` (`dungeon-figuren-art.js`, Andockpunkt `clan-art.js drawClanEnemy` und `dungeon-e4b-art.js` für Volker). Bericht:
`docs/DUNGEON-FIGUREN-ENTWURF-2026-09-26.md`.

- **Sonderposen** (`SONDER` in `puppe.mjs`, Rezepte in `ACTS`): ausholen, schubsen, zeigen, zeigenN (Nebenhand), jubeln, vorhalten,
  zusammensinken, buecken, tritt, selfie, telefon, achselzucken, schopf. Sie stehen **nicht** in `FRAMES`: Grund- und Aktionsbögen bleiben
  byte-gleich. Je Quelle × Archetyp × Richtung ein eigener Bogen `<quelle>-<arch><dir>-sonder.png` mit eigener Zelle
  (`cat.sources[id].sonder={cell,archs}`), sw/ne immer eigen. Katalog `cat.sonder={start,frames:[{anim,i,fb}]}`: Laufzeit-Bildnummer
  `start+k`, `fb` = Rückfallbild, solange der Sonderbogen fehlt oder eine Ebene keinen hat. Sonderbögen entstehen nur für die Archetypen,
  die die Quelle in einer Dungeon-Figur tragen (`archs`).
- **Laufzeit** (`paperdoll-art.js`): Teil 2 = Sonderbogen (`-sonder`), `p.artFrame` legt die Bildnummer fest (die Dungeon-Figuren wählen ihr
  Bild selbst), `loadPaperdollSheet(key)` holt Motivbögen über denselben Ladeweg.
- **Motive** (`tools/paperdoll/motive.mjs`): gleicher Pixelstil und Bildmaßstab, ein Bogen je gezeichneter Richtung (`motiv-<id>.png`,
  `motiv-<id>-nw.png`; sw/ne spiegelt die Laufzeit), eine Zeile, Bilder stehen/laufen/angriff/getroffen. Katalog `cat.motive[id]={cell,frames,
  projektion,scale}`. Der Tod ist das Umkippen aus `renderer.js drawCorpse`. Das Gespenst zeichnet die Laufzeit halbdurchsichtig mit
  flackernder Deckkraft und springenden Zeilen (nur `globalAlpha`, keine Mischmodi).

```
node tools/paperdoll/puppe.mjs --runtime --nur <neue,geänderte Kleidung> --sonder dungeon   # Teilneubau + Sonderbögen aller Dungeon-Figuren
node tools/paperdoll/motive.mjs --runtime                     # Motivbögen + cat.motive
node scripts/pwa-cache.mjs
node tools/paperdoll/dungeon-vorschau.mjs [id,id|alle]        # Vorschau aus dem Werkzeug: <id>-nah.png, <id>-welt.png (visual-review/dungeon-figuren)
node tools/paperdoll/dungeon-vorschau.mjs --uebersicht        # alle Menschen nebeneinander
node tools/paperdoll/posen-bogen.mjs gerd,rita                # alle Sonderposen in vier Richtungen
node tools/paperdoll/motive.mjs --vorschau && node tools/paperdoll/motive-welt.mjs
node tools/paperdoll/galerie/bauen.mjs [ziel]                 # Galerie (Atlanten + HTML) nach D:/Dev/_prototypen/dungeon-figuren-2026-09-26
CDP_PORT=9730 SERVER_PORT=4530 node scripts/dungeon-figuren-check.mjs   # Schalter an/aus, Bosse mit Ansagen, Vergleich heute ↔ Entwurf, Leistung
```

Ein voller Neubau (`--runtime` ohne `--nur`) baut danach die Sonderbögen der Dungeon-Figuren und die Motive mit (er räumt vorher alle Bögen weg).
Ein späteres `--nur` einer Quelle verwirft ihren Sonderbogen: danach `--sonder dungeon` erneut.
