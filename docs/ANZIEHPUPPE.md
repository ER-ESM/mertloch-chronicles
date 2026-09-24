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
node tools/paperdoll/puppe.mjs --reiten         # assets/paperdoll/reiten: Reit-Bögen, 6 Reittiere × 3 Archetypen (~1 min, REITEN_JOBS=n Threads, ~4 MB)
node scripts/pwa-cache.mjs                      # danach: Offline-Liste (Reit-Bögen stehen darin nur optional)
node tools/paperdoll/reiten.mjs --vorschau hofpferd,drahtesel baerbel,kevin se,nw   # Kontaktbogen aus den Reit-Bögen → visual-review/mounts/
node tools/paperdoll/puppe.mjs <ordner>         # Vorschau-Bögen (Figuren ida/dieter/kevin) + puppe.json
node tools/paperdoll/zeigen.mjs <ordner> 3 "ida:kutte,jeans|dieter@nw:" "0,5,6" name 3b3024   # Vorschaubild
PUPPE_LEINWAND=440,460,340 node tools/paperdoll/puppe.mjs --runtime <ordner>   # Hüllenmessung auf großer Leinwand (Protokoll: „Hülle … frei …“)
```

## Ergänzen

- **Neuer Gegenstand:** Die Quelle gehört in `familien.mjs` oder `npc-kleidung.mjs`, mit der Kennung gleich der Item-ID. Sie wird in allen 4 Richtungen und bei allen 3 Archetypen geprüft. Danach `--runtime` ausführen.
- **Neuer NPC:** Einen Eintrag in `content/figuren.js` anlegen: Archetyp, Aussehen und Kleidungsliste.
- **Neues Reittier:** Es kommt in `MOUNTS` (Reiten-Abschnitt), mit Sitzform und Ankern je Bild. Dazu ein Inhaltseintrag in `content/mounts.js` (mit `kind` und `sound`). Danach `--reiten` und `pwa-cache` ausführen; `tests/paperdoll-mount.test.mjs` prüft, dass Inhalt und Reit-Katalog übereinstimmen.
- **Neue Quelle und Reiten:** Nach neuen Gegenständen oder Aussehen-Ebenen auch `--reiten` ausführen. Sonst fehlt die Quelle nur auf dem Reittier; der Reiter wird dann ohne sie gezeichnet.
