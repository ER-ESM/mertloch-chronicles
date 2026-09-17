# UI an Grafik · 2026-09-17 · Stil C „Bierdeckel"

Die Oberfläche steht seit heute vollständig auf der Stil-Definition **C „Bierdeckel"** (Entscheidung [E-24](ENTSCHEIDUNGEN.md), Vorlage [ui-stile-2026-09-17/index.html](ui-stile-2026-09-17/index.html) §C, Prüfliste [UI-ABNAHME.md](UI-ABNAHME.md)). Die Stildatei ist `bierdeckel.css`; sie ist die einzige Quelle für Tokens und Bausteine.

**Nichts auf dieser Liste blockiert.** Jede Position hat heute einen CSS-Fallback, der die Abnahme besteht. Die Grafiken ersetzen den Fallback später ohne Umbau: Die Anbindung liegt schon (`drawNineSlice`, `drawContentIcon`, `contentPath` in `content-art.js`), es fehlt nur das PNG plus Katalogeintrag in `assets/content-art/handoff-catalog.json`.

## Farb- und Maßvorgaben für alle Positionen

| Token | Wert | Bedeutung |
|---|---|---|
| `--green` | `#223A2F` | Zeltstoff, Fenstergrund |
| `--green-2` | `#2E4A3B` | Zeltstoff hell: Titelleiste, Reiterschiene, Balkenbett |
| `--kraft` | `#D9B98A` | Pappe: Karten, Chips, Tooltips |
| `--kraft-2` | `#C9A46F` | Pappkante |
| `--kraft-3` | `#EED9B5` | heller Innenrand der Pappe |
| `--stamp` | `#AD5260` | Ziegelrose: Stempel, Auswahl |
| `--coral` | `#E18569` | nur Gefahr und Schaden |
| `--gold` | `#ECB95C` | nur Primäraktion und Auswahl |
| `--ok` | `#78A865` | Leben, Erfolg |
| `--cream` | `#F4E8C4` | Text auf Zeltstoff |
| `--ink` | `#2B2A26` | Text auf Pappe |

Regeln wie in der übrigen Lieferung: harte Transparenz, 40-Farben-Palette, Radius 0, Rahmen in 2-px-Schritten, versetzter harter Schatten 3 px (`#0B1216`), keine Unschärfe, keine Verläufe über zwei Stufen. Ablage wie gewohnt unter `assets/content-art/ui/<ID>.png`, Eintrag im Katalog mit `width`/`height` und — wo angegeben — `nineSlice`.

## Bedarf

| ID | Größe | Bildhinweis | Fallback heute | Wo im Spiel |
|---|---|---|---|---|
| `ui-coaster-frame` | 48 × 48, `nineSlice {left:16,right:16,top:16,bottom:16}` | Bierdeckelkante: gestanzter Papprand mit leicht ausgefranster Außenkante und hellem Innenrand, oben und unten je eine angedeutete Prägerille. Mitte transparent (wird gestreckt). | `border:2px solid var(--kraft-2)` plus `box-shadow:inset 0 0 0 4px var(--kraft-3)` und das 6-px-Punktraster als `radial-gradient` | jede Pappkarte: Figurenkarte, Auftrag, Kapitel, Erinnerung, Kniff, Bude, Hilfe, Gesprächskarte, Beute |
| `ui-stamp-worn` | 128 × 44 | Schräger Gummistempel in Ziegelrose, Rahmen doppelt, Buchstaben ausgefranst, Farbe stellenweise ausgelassen. Ohne Text — Text liegt als HTML darüber; nur Rahmen und Farbfleck. | `border:3px double var(--stamp)` + `transform:rotate(-2deg)` | Klamottenwahl, getragene Figur („Ist am Start") |
| `ui-stamp-chosen` | 128 × 44 | wie oben, aber Gold statt Ziegelrose | derselbe Rahmen in `--gold` | Auswahlzustand in Listen (Belohnung, Kniff, Ziel) |
| `ui-title-plate` | 96 × 32, `nineSlice {left:20,right:20,top:10,bottom:10}` | Zapfhahn-Titelschild: emailliertes Blechschild mit zwei Nieten links und rechts, Kante dunkel abgesetzt. | `background:var(--green-2)` + `border-bottom:2px solid var(--kraft-2)` | Titelleiste jedes Fensters (`.popup-titlebar`) |
| `ui-canvas-tile` | 32 × 32, nahtlos kachelbar | Zeltstoff: grobes Leinen in `--green`, unregelmäßige Webstruktur, alle 8 px eine dunklere Faser. Sehr zurückhaltend — der Text muss darauf 4,5:1 halten. | einfarbig `var(--green)` | Fenstergrund, HUD-Kästen, Aktionsleiste |
| `ui-tab-bude` | 24 × 24 | Reitersymbol „Bude": Bretterbude mit schiefem Vordach und Bierkasten davor, im Stil der sechs gelieferten Reitersymbole (`ui-tab-figur` … `ui-tab-hilfe`). | gezeichnetes Symbol `reinforced` aus `assets/maifeld-ui-011/icons.png` | siebter Reiter des Clanbuchs |
| `ui-skill-frame` | 64 × 64, `nineSlice {left:8,right:8,top:8,bottom:8}` | Kachelrahmen der Aktionsleiste: gestanztes Blech, Ecken genietet, innen dunkel. Bereit-Zustand als zweite Datei `ui-skill-frame-ready` mit goldener Innenlinie. | `border:2px solid var(--kraft-2)`, bereit `border-color:var(--gold)` | `.skill` in der Aktionsleiste und `#touchActions .touch-skill` |
| `ui-touch-stick` | 128 × 128 | Joystick-Ring: Bierdeckel von oben, Rand gestanzt, Mitte transparent; dazu `ui-touch-thumb` 64 × 64 als Deckel in `--kraft`. | Kreis aus `border:2px solid var(--kraft-2)` auf `#223A2FCC` | `#touchStick` / `#touchThumb` im Touch-Modus |
| `ui-touch-dpad` | 144 × 96 | Steuerkreuz: vier Blechtasten mit Pfeilprägung, Zielgröße je 44 px. | vier Knöpfe mit Pappkante und Unicode-Pfeilen | `.touch-pad` |
| `ui-bar-cap` | 8 × 16 | Balkenabschluss links und rechts (gestanzte Öse), damit Lebens- und Randale-Balken nicht als Web-Fortschrittsbalken lesen. | keiner — Balken sind heute rechteckig | `.bar`, `.xp-track`, `.quest-meter` |

## Was schon aus der Lieferung kommt und bleibt

`ui-tab-figur`, `ui-tab-rucksack`, `ui-tab-kniffe`, `ui-tab-auftraege`, `ui-tab-karte`, `ui-tab-hilfe`, `ui-menu`, `ui-sound`, `ui-fullscreen`, `ui-reward`, `ui-elite-badge`, `ui-chapter-lock`, `ui-speech-bubble`, `ui-proc-frame`, `ui-proc-free`, `ui-proc-empower`, `ui-momentum-1..3`. Die Proc-Rahmen und Schwung-Marken hat der Umbau ausdrücklich nicht angefasst.

Die Figurenkarten der Klamottenwahl zeigen jetzt das Einzelbild `idle` nach Südosten aus `dieter-poses.png` und `kevin-poses.png`, ganzzahlig auf das Doppelte vergrößert (96 → 192 px). **Für Anni fehlt ein Posenbogen** — sie wird weiter aus `clan-art.js` gezeichnet und fällt dadurch im Stil ab. Ein Bogen `baerbel-poses.png` im Format der beiden anderen (96 px Frames, Spalten `idle, walk-a, walk-pass, walk-b, anticipation, impact, hit, rest`, vier Richtungen) schließt die letzte sichtbare Lücke der Klamottenwahl.
