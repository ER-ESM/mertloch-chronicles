# Übergabe an die Bildgenerierung · 2026-09-23

**Erledigt am 23.09.2026:** Alle zwölf angeforderten Motive sind erzeugt, in den aktiven Präzisionspixel-Katalog eingebunden und im Browser geprüft. [Lieferung, Prompts und Abnahme](GRAFIK-LIEFERUNG-2026-09-23.md). Die Spalte „Heute“ unten dokumentiert den Ausgangszustand der Übergabe.

Anlass: visueller Spielerdurchgang (Feinschliff-Runden 1–13). Was hier steht, ist heute im Spiel **mit Ersatz gezeichnet** oder wirkt dadurch unfertig. Reihenfolge = Priorität.

Stil, Maßstab, Ablage und Abnahme wie bisher: [UEBERGABE-GRAFIK-2026-09-17.md](UEBERGABE-GRAFIK-2026-09-17.md), Präzisionspixel [PRAEZISIONSPIXEL-2026-09-17.md](PRAEZISIONSPIXEL-2026-09-17.md), Laufzeitkatalog `assets/precision/runtime/catalog.json`. Dateiname = ID.

## 1 · Bude-Baustelle (höchste Priorität)

Die sechs Bauplätze hinter St. Gangolf zeigen alle **denselben** Trümmerhaufen (`bude-truemmer`). Spieler fragten: „Wofür sind die 6 kleinen Haufen?“ Seit Runde 12 tragen sie Namen und ein Schild, aber das Bild selbst muss sagen, *was* hier einmal stand.

| ID | Motiv | Format | Heute |
|---|---|---|---|
| `bude-truemmer-tresen` | umgekippter Palettentresen, verstreute Bierdeckel, ein halber Zapfhahn | wie `bude-truemmer` (Stufe 0 des Bauplatzes) | generischer Erdhaufen |
| `bude-truemmer-grill` | umgestürzter Tonnengrill, Grillrost im Gras, Asche | dto. | dto. |
| `bude-truemmer-werkstatt` | eingestürzte Werkbank, Kabelsalat, Schraubenzieher | dto. | dto. |
| `bude-truemmer-anlage` | zerbrochene Box, Lautsprecherkabel, Lichterkette im Dreck | dto. | dto. |
| `bude-truemmer-landhausecke` | umgekippter Korbstuhl, Aperol-Glas, Blumentopf-Scherben | dto. | dto. |
| `bude-truemmer-pfandlager` | umgestürzte Bierkästen, Leergut-Lawine | dto. | dto. |
| `bude-schild` | Holzschild „Baustelle der Bude“, handgemalt, Absperrband | Prop ~40×48 px, 1 Frame | Canvas-Schriftzug |

Anbindung (UI): `world-props.js stagePropsFor` wählt dann `bude-truemmer-<id>` statt `bude-truemmer`, sobald der Katalog es enthält.

## 2 · Einführungsfilm (neu, Runde 12)

Der Film fährt heute mit der Kamera durch die echte Welt (`content/intro.js`). Zwei Szenen hätten mit einem Standbild deutlich mehr Wucht:

| ID | Motiv | Format | Szene |
|---|---|---|---|
| `intro-filmriss` | Ich-Perspektive: aufwachen in Trümmern, Morgenlicht, eine Socke, Stempel am Arm | 1280×720, Stil wie `assets/content-art/memories/*.png` | 1 „Filmriss.“ |
| `intro-maifeld` | Pfandkeiler am Lagerfeuer, im Hintergrund Horst Nüchternmann mit Kiste | 1280×720 | 5 „Irgendwo da draußen“ |

Anbindung (UI): Szene bekommt `image:'intro-filmriss'`; `intro-ui.js` blendet das Bild zwischen den Kinobalken statt der Kamerafahrt ein.

## 3 · Meilensteine und Freischaltungen (neu, Runde 12)

| ID | Motiv | Format | Heute |
|---|---|---|---|
| `ui-levelup-crest` | Wappen/Kranz aus Hopfen und Kronkorken hinter „STUFE n“ | 320×120, transparent | goldener Schriftzug mit Leuchten |
| `ui-unlock-seal` | kleines Siegel „Neu“ (roter Bierdeckel) | 24×24 | CSS-Pille „NEU“ |

## 4 · Kalles Kiosk – Innenraum

Der Raum steht seit Runde 13 in warmem Dunkel statt in grüner Leere, wirkt auf breiten Schirmen aber immer noch wie eine Kiste im Nichts.

| ID | Motiv | Format | Heute |
|---|---|---|---|
| `kiosk-aussenwand` | Außenwand/Rahmen um den Raum: Backstein, Schaufenster mit Werbeschildern, Nachtlicht | kachelbar 64×64 + Ecken | Farbverlauf |

## Bereits vorhanden, nur zur Abgrenzung

Tooltip-, Fenster- und Knopfrahmen, Talent- und Kniffsymbole, Erinnerungsbilder und Reittiere sind geliefert und angebunden – dort ist nichts nachzuliefern.
