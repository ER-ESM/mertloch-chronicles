# Balance-Sheet

Automatisch erzeugt von `npm run balance:sheet` · 2026-09-23 · 40 s Übungskampf, jede Zelle und jede Zerlegung als Mittel aus Boss (10× Feldleben) und Feldgruppe (drei Gegner mit Umland-Leben); gefallene Gegner ersetzt sofort ein neuer (Kill-Talente zählen), Zufall mit 3 festen Startwerten gemittelt, gemeinsame Prioritäten-Rotation (Heiler heilen zuerst), Puppen treffen jede Sekunde mit 3 % des Grundlebens. Voller Ausrüstungssatz auf Charakterstufe (Werteprofile im Wechsel); „Startausrüstung“ = Flasche, Topfdeckel, Schleuder, Kutte. Talentpfad 0–2 über `pathBuild`, Stufe 1 ohne Spezialisierung.

Jede Rolle misst sich an ihrer Kennzahl: **Schaden** → Schaden/s, **Heilung** → Heilung/s (Ausstoß inkl. Überheilung), **Tank** → Schutz/s (verhinderter Schaden + Deckung). Zelle: Kennzahl (Abweichung vom Median der Rolle auf dieser Stufe × Ausrüstung). ⚑ = mehr als 15 % daneben (ab Stufe 5).

## Überblick

151 von 540 Messungen liegen mehr als 15 % neben dem Median ihrer Rolle.

## Ausrüstung: Startausrüstung

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 59 (0 %) | 107 (-18.2 %) ⚑ | 120 (-19.9 %) ⚑ | 134 (-17.2 %) ⚑ | 144 (-18.7 %) ⚑ | 192 (-11.5 %) |
| dieter-brawl | 1 | 59 (0 %) | 124 (-5.4 %) | 158 (+5.4 %) | 209 (+29.7 %) ⚑ | 236 (+33.8 %) ⚑ | 270 (+24.4 %) ⚑ |
| dieter-brawl | 2 | 59 (0 %) | 132 (+1.4 %) | 151 (+0.8 %) | 161 (-0.1 %) | 177 (0 %) | 216 (-0.6 %) |
| baerbel-feedback | 0 | 59 (+0.3 %) | 133 (+1.9 %) | 150 (0 %) | 139 (-13.6 %) | 161 (-8.8 %) | 190 (-12.3 %) |
| baerbel-feedback | 1 | 59 (+0.3 %) | 154 (+17.7 %) ⚑ | 150 (+0.2 %) | 160 (-0.9 %) | 166 (-6 %) | 189 (-13 %) |
| baerbel-feedback | 2 | 59 (+0.3 %) | 159 (+21.8 %) ⚑ | 199 (+32.4 %) ⚑ | 198 (+22.6 %) ⚑ | 218 (+23.4 %) ⚑ | 225 (+3.6 %) |
| baerbel-stage | 0 | 59 (+0.3 %) | 123 (-5.7 %) | 144 (-3.8 %) | 195 (+21.2 %) ⚑ | 197 (+11.4 %) | 242 (+11.7 %) |
| baerbel-stage | 1 | 59 (+0.3 %) | 138 (+5.8 %) | 185 (+23.1 %) ⚑ | 209 (+29.5 %) ⚑ | 195 (+10.5 %) | 240 (+10.5 %) |
| baerbel-stage | 2 | 59 (+0.3 %) | 123 (-5.6 %) | 131 (-12.5 %) | 152 (-5.8 %) | 161 (-8.7 %) | 196 (-9.7 %) |
| kevin-fuse | 0 | 52 (-11.5 %) | 125 (-4.4 %) | 142 (-5.1 %) | 149 (-7.8 %) | 160 (-9.5 %) | 227 (+4.4 %) |
| kevin-fuse | 1 | 52 (-11.5 %) | 115 (-11.9 %) | 133 (-11.7 %) | 186 (+15.5 %) ⚑ | 200 (+13 %) | 286 (+32 %) ⚑ |
| kevin-fuse | 2 | 52 (-11.5 %) | 119 (-9.1 %) | 120 (-20.1 %) ⚑ | 141 (-12.6 %) | 158 (-10.4 %) | 215 (-0.9 %) |
| kevin-hunt | 0 | 52 (-11.5 %) | 136 (+4 %) | 168 (+12.2 %) | 189 (+17.1 %) ⚑ | 202 (+14.3 %) | 217 (0 %) |
| kevin-hunt | 1 | 52 (-11.5 %) | 131 (0 %) | 143 (-4.6 %) | 161 (0 %) | 171 (-3.1 %) | 208 (-4.1 %) |
| kevin-hunt | 2 | 52 (-11.5 %) | 135 (+3.4 %) | 162 (+7.9 %) | 207 (+28.5 %) ⚑ | 224 (+26.9 %) ⚑ | 267 (+23.1 %) ⚑ |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 27 (-30.6 %) ⚑ | 30 (-43 %) ⚑ | 47 (-43.3 %) ⚑ | 60 (-37.7 %) ⚑ | 55 (-64.3 %) ⚑ |
| dieter-brew | 1 | 0 (-100 %) | 43 (+11.3 %) | 69 (+29.7 %) ⚑ | 105 (+26 %) ⚑ | 130 (+34.6 %) ⚑ | 159 (+3.4 %) |
| dieter-brew | 2 | 0 (-100 %) | 31 (-19.6 %) ⚑ | 37 (-30.7 %) ⚑ | 36 (-57.4 %) ⚑ | 46 (-52.1 %) ⚑ | 56 (-63.9 %) ⚑ |
| baerbel-care | 0 | 0 (-100 %) | 49 (+27.2 %) ⚑ | 62 (+17.6 %) ⚑ | 78 (-6.3 %) | 91 (-6.1 %) | 119 (-23.1 %) ⚑ |
| baerbel-care | 1 | 0 (-100 %) | 33 (-14.4 %) | 52 (-1.1 %) | 84 (+0.1 %) | 97 (0 %) | 154 (0 %) |
| baerbel-care | 2 | 0 (-100 %) | 38 (0 %) | 53 (0 %) | 84 (0 %) | 119 (+22.5 %) ⚑ | 155 (+0.7 %) |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 4 (0 %) | 32 (+7 %) | 48 (+15.5 %) ⚑ | 52 (+2.5 %) | 63 (0 %) | 81 (-0.9 %) |
| dieter-wall | 1 | 4 (0 %) | 12 (-59.5 %) ⚑ | 19 (-53.4 %) ⚑ | 52 (+1.8 %) | 65 (+3.7 %) | 84 (+2.6 %) |
| dieter-wall | 2 | 4 (0 %) | 10 (-66.1 %) ⚑ | 20 (-51.4 %) ⚑ | 37 (-27.4 %) ⚑ | 46 (-25.9 %) ⚑ | 72 (-11.7 %) |
| kevin-iron | 0 | 3 (-25 %) | 30 (0 %) | 41 (0 %) | 51 (0 %) | 63 (+0.5 %) | 87 (+6.4 %) |
| kevin-iron | 1 | 3 (-25 %) | 30 (+0.3 %) | 42 (+1.2 %) | 50 (-2.9 %) | 59 (-5.3 %) | 82 (0 %) |
| kevin-iron | 2 | 3 (-25 %) | 28 (-6.6 %) | 37 (-11.4 %) | 45 (-12.5 %) | 57 (-9.4 %) | 70 (-14.1 %) |

## Ausrüstung: ungewöhnlich

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 94 (0 %) | 187 (-10.3 %) | 252 (-9.2 %) | 307 (-11.8 %) | 348 (-21.6 %) ⚑ | 485 (-19.1 %) ⚑ |
| dieter-brawl | 1 | 94 (0 %) | 208 (-0.4 %) | 285 (+3 %) | 416 (+19.3 %) ⚑ | 510 (+15 %) | 691 (+15.2 %) ⚑ |
| dieter-brawl | 2 | 94 (0 %) | 212 (+1.8 %) | 278 (+0.3 %) | 349 (0 %) | 425 (-4.3 %) | 583 (-2.7 %) |
| baerbel-feedback | 0 | 94 (0 %) | 219 (+5 %) | 271 (-2.1 %) | 335 (-3.9 %) | 406 (-8.5 %) | 560 (-6.6 %) |
| baerbel-feedback | 1 | 94 (0 %) | 236 (+13.1 %) | 277 (0 %) | 328 (-6 %) | 376 (-15.2 %) ⚑ | 528 (-12 %) |
| baerbel-feedback | 2 | 94 (0 %) | 254 (+21.6 %) ⚑ | 333 (+20.1 %) ⚑ | 387 (+11.1 %) | 451 (+1.7 %) | 584 (-2.6 %) |
| baerbel-stage | 0 | 94 (0 %) | 201 (-3.7 %) | 285 (+2.8 %) | 388 (+11.4 %) | 463 (+4.5 %) | 602 (+0.3 %) |
| baerbel-stage | 1 | 94 (0 %) | 230 (+10 %) | 339 (+22.3 %) ⚑ | 413 (+18.5 %) ⚑ | 487 (+9.9 %) | 672 (+12.1 %) |
| baerbel-stage | 2 | 94 (0 %) | 199 (-4.7 %) | 247 (-10.7 %) | 340 (-2.5 %) | 390 (-12.1 %) | 535 (-10.8 %) |
| kevin-fuse | 0 | 85 (-9.5 %) | 195 (-6.8 %) | 273 (-1.3 %) | 327 (-6.3 %) | 385 (-13.2 %) | 600 (0 %) |
| kevin-fuse | 1 | 85 (-9.5 %) | 186 (-10.8 %) | 274 (-1 %) | 405 (+16.1 %) ⚑ | 493 (+11.3 %) | 718 (+19.8 %) ⚑ |
| kevin-fuse | 2 | 85 (-9.5 %) | 207 (-0.8 %) | 264 (-4.7 %) | 346 (-0.8 %) | 443 (0 %) | 716 (+19.5 %) ⚑ |
| kevin-hunt | 0 | 85 (-9.5 %) | 222 (+6.5 %) | 301 (+8.6 %) | 378 (+8.5 %) | 453 (+2.2 %) | 620 (+3.4 %) |
| kevin-hunt | 1 | 85 (-9.5 %) | 209 (+0.3 %) | 270 (-2.7 %) | 344 (-1.3 %) | 427 (-3.7 %) | 554 (-7.7 %) |
| kevin-hunt | 2 | 85 (-9.5 %) | 209 (0 %) | 304 (+9.7 %) | 391 (+12.1 %) | 469 (+5.8 %) | 606 (+1 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 39 (-17.7 %) ⚑ | 51 (-21.6 %) ⚑ | 86 (-21.4 %) ⚑ | 111 (-10.8 %) | 116 (-44.3 %) ⚑ |
| dieter-brew | 1 | 0 (-100 %) | 57 (+19.4 %) ⚑ | 110 (+68.7 %) ⚑ | 168 (+54.4 %) ⚑ | 198 (+59.6 %) ⚑ | 235 (+12.8 %) |
| dieter-brew | 2 | 0 (-100 %) | 45 (-4.6 %) | 52 (-20.8 %) ⚑ | 64 (-41.2 %) ⚑ | 90 (-27.5 %) ⚑ | 120 (-42.3 %) ⚑ |
| baerbel-care | 0 | 0 (-100 %) | 52 (+10.1 %) | 58 (-12.1 %) | 77 (-29.4 %) ⚑ | 80 (-35.8 %) ⚑ | 156 (-25 %) ⚑ |
| baerbel-care | 1 | 0 (-100 %) | 45 (-6.1 %) | 65 (0 %) | 109 (0 %) | 124 (0 %) | 215 (+3.1 %) |
| baerbel-care | 2 | 0 (-100 %) | 48 (0 %) | 71 (+8.7 %) | 121 (+11.1 %) | 163 (+31.3 %) ⚑ | 208 (0 %) |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 8 (0 %) | 30 (+4.9 %) | 43 (+19.7 %) ⚑ | 54 (+12.7 %) | 64 (+9 %) | 85 (+5.6 %) |
| dieter-wall | 1 | 8 (0 %) | 18 (-36.1 %) ⚑ | 31 (-13 %) | 56 (+15.1 %) ⚑ | 66 (+11.9 %) | 87 (+8 %) |
| dieter-wall | 2 | 8 (0 %) | 16 (-45.8 %) ⚑ | 25 (-31.3 %) ⚑ | 48 (0 %) | 59 (0 %) | 80 (0 %) |
| kevin-iron | 0 | 7 (-12.5 %) | 29 (0 %) | 36 (0 %) | 47 (-3.3 %) | 57 (-3.6 %) | 74 (-8 %) |
| kevin-iron | 1 | 7 (-12.5 %) | 29 (+1.7 %) | 36 (+0.8 %) | 45 (-6.8 %) | 53 (-9.9 %) | 71 (-11.5 %) |
| kevin-iron | 2 | 7 (-12.5 %) | 28 (-4.5 %) | 34 (-5.3 %) | 42 (-13.1 %) | 52 (-11.9 %) | 67 (-16.1 %) ⚑ |

## Ausrüstung: selten

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 111 (+1 %) | 235 (-5.4 %) | 278 (-13.2 %) | 345 (-19.8 %) ⚑ | 450 (-12.8 %) | 596 (-13.6 %) |
| dieter-brawl | 1 | 111 (+1 %) | 267 (+7.4 %) | 350 (+9.1 %) | 506 (+17.5 %) ⚑ | 580 (+12.5 %) | 815 (+18.1 %) ⚑ |
| dieter-brawl | 2 | 111 (+1 %) | 249 (+0.2 %) | 323 (+0.7 %) | 423 (-1.7 %) | 512 (-0.6 %) | 684 (-0.9 %) |
| baerbel-feedback | 0 | 110 (0 %) | 258 (+3.5 %) | 317 (-1.1 %) | 394 (-8.6 %) | 438 (-15 %) ⚑ | 616 (-10.7 %) |
| baerbel-feedback | 1 | 110 (0 %) | 293 (+17.8 %) ⚑ | 320 (0 %) | 402 (-6.6 %) | 441 (-14.4 %) | 626 (-9.2 %) |
| baerbel-feedback | 2 | 110 (0 %) | 306 (+23 %) ⚑ | 374 (+16.7 %) ⚑ | 495 (+15 %) | 534 (+3.5 %) | 672 (-2.7 %) |
| baerbel-stage | 0 | 110 (0 %) | 227 (-8.6 %) | 315 (-1.7 %) | 448 (+4.1 %) | 508 (-1.5 %) | 727 (+5.4 %) |
| baerbel-stage | 1 | 110 (0 %) | 269 (+8 %) | 383 (+19.5 %) ⚑ | 485 (+12.6 %) | 614 (+19.1 %) ⚑ | 737 (+6.8 %) |
| baerbel-stage | 2 | 110 (0 %) | 231 (-7 %) | 269 (-16 %) ⚑ | 364 (-15.6 %) ⚑ | 431 (-16.4 %) ⚑ | 630 (-8.7 %) |
| kevin-fuse | 0 | 103 (-6.4 %) | 229 (-7.9 %) | 304 (-5 %) | 395 (-8.3 %) | 457 (-11.3 %) | 690 (0 %) |
| kevin-fuse | 1 | 103 (-6.4 %) | 213 (-14.3 %) | 307 (-4.2 %) | 442 (+2.6 %) | 557 (+8 %) | 806 (+16.9 %) ⚑ |
| kevin-fuse | 2 | 103 (-6.4 %) | 256 (+2.8 %) | 331 (+3.2 %) | 431 (0 %) | 525 (+1.8 %) | 798 (+15.6 %) ⚑ |
| kevin-hunt | 0 | 103 (-6.4 %) | 249 (-0.1 %) | 340 (+6.3 %) | 459 (+6.6 %) | 554 (+7.5 %) | 751 (+8.9 %) |
| kevin-hunt | 1 | 103 (-6.4 %) | 237 (-4.7 %) | 318 (-0.6 %) | 412 (-4.3 %) | 516 (0 %) | 681 (-1.4 %) |
| kevin-hunt | 2 | 103 (-6.4 %) | 249 (0 %) | 323 (+0.9 %) | 444 (+3.1 %) | 518 (+0.5 %) | 699 (+1.3 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 45 (-10.7 %) | 56 (-18.5 %) ⚑ | 110 (0 %) | 121 (-5.5 %) | 128 (-42.5 %) ⚑ |
| dieter-brew | 1 | 0 (-100 %) | 59 (+17.3 %) ⚑ | 119 (+74.2 %) ⚑ | 185 (+67.8 %) ⚑ | 219 (+70.7 %) ⚑ | 268 (+20.4 %) ⚑ |
| dieter-brew | 2 | 0 (-100 %) | 50 (0 %) | 58 (-14.2 %) | 75 (-31.6 %) ⚑ | 95 (-26 %) ⚑ | 140 (-37.3 %) ⚑ |
| baerbel-care | 0 | 0 (-100 %) | 56 (+11.9 %) | 67 (-1.9 %) | 72 (-34.8 %) ⚑ | 92 (-28.4 %) ⚑ | 172 (-22.6 %) ⚑ |
| baerbel-care | 1 | 0 (-100 %) | 45 (-9.9 %) | 68 (0 %) | 109 (-0.9 %) | 128 (0 %) | 245 (+10.3 %) |
| baerbel-care | 2 | 0 (-100 %) | 48 (-4.2 %) | 77 (+13.2 %) | 132 (+20.3 %) ⚑ | 175 (+36.2 %) ⚑ | 222 (0 %) |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 8 (0 %) | 31 (+12.3 %) | 43 (+21.2 %) ⚑ | 52 (+9.7 %) | 61 (+7.6 %) | 83 (+6 %) |
| dieter-wall | 1 | 8 (0 %) | 19 (-31.2 %) ⚑ | 30 (-15 %) ⚑ | 54 (+12.6 %) | 62 (+10.1 %) | 84 (+8.1 %) |
| dieter-wall | 2 | 8 (0 %) | 16 (-40.9 %) ⚑ | 24 (-31.4 %) ⚑ | 48 (0 %) | 57 (0 %) | 78 (0 %) |
| kevin-iron | 0 | 7 (-12.5 %) | 28 (0 %) | 36 (+2.5 %) | 44 (-6.9 %) | 52 (-7.9 %) | 70 (-10.4 %) |
| kevin-iron | 1 | 7 (-12.5 %) | 28 (+1.4 %) | 35 (0 %) | 44 (-7.8 %) | 53 (-7.2 %) | 70 (-9.8 %) |
| kevin-iron | 2 | 7 (-12.5 %) | 26 (-4.7 %) | 33 (-5.4 %) | 41 (-13.2 %) | 50 (-11.5 %) | 66 (-15.3 %) ⚑ |

## Ausrüstung: episch

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 146 (+3.1 %) | 255 (-10.2 %) | 328 (-11.2 %) | 441 (-17.6 %) ⚑ | 526 (-14.5 %) | 701 (-13.3 %) |
| dieter-brawl | 1 | 146 (+3.1 %) | 303 (+6.8 %) | 414 (+12.1 %) | 591 (+10.5 %) | 691 (+12.3 %) | 924 (+14.3 %) |
| dieter-brawl | 2 | 146 (+3.1 %) | 269 (-5.1 %) | 372 (+0.7 %) | 476 (-11 %) | 610 (-0.8 %) | 793 (-1.9 %) |
| baerbel-feedback | 0 | 141 (0 %) | 294 (+3.6 %) | 356 (-3.6 %) | 456 (-14.7 %) | 545 (-11.5 %) | 762 (-5.7 %) |
| baerbel-feedback | 1 | 141 (0 %) | 335 (+18.2 %) ⚑ | 377 (+2.1 %) | 515 (-3.6 %) | 552 (-10.3 %) | 775 (-4.1 %) |
| baerbel-feedback | 2 | 141 (0 %) | 343 (+20.9 %) ⚑ | 452 (+22.2 %) ⚑ | 658 (+23 %) ⚑ | 708 (+15 %) ⚑ | 840 (+3.9 %) |
| baerbel-stage | 0 | 141 (0 %) | 279 (-1.6 %) | 357 (-3.3 %) | 550 (+2.8 %) | 618 (+0.4 %) | 831 (+2.9 %) |
| baerbel-stage | 1 | 141 (0 %) | 305 (+7.6 %) | 461 (+24.7 %) ⚑ | 591 (+10.5 %) | 737 (+19.7 %) ⚑ | 938 (+16.1 %) ⚑ |
| baerbel-stage | 2 | 141 (0 %) | 277 (-2.4 %) | 326 (-11.8 %) | 466 (-12.8 %) | 557 (-9.5 %) | 763 (-5.6 %) |
| kevin-fuse | 0 | 132 (-6.7 %) | 272 (-4.1 %) | 370 (0 %) | 496 (-7.2 %) | 555 (-9.7 %) | 796 (-1.5 %) |
| kevin-fuse | 1 | 132 (-6.7 %) | 248 (-12.4 %) | 360 (-2.7 %) | 554 (+3.5 %) | 638 (+3.6 %) | 961 (+18.9 %) ⚑ |
| kevin-fuse | 2 | 132 (-6.7 %) | 296 (+4.5 %) | 363 (-1.8 %) | 546 (+2.1 %) | 683 (+10.9 %) | 999 (+23.6 %) ⚑ |
| kevin-hunt | 0 | 132 (-6.7 %) | 292 (+3 %) | 374 (+1.2 %) | 578 (+8 %) | 642 (+4.3 %) | 831 (+2.8 %) |
| kevin-hunt | 1 | 132 (-6.7 %) | 270 (-4.7 %) | 358 (-3 %) | 508 (-5 %) | 607 (-1.3 %) | 808 (0 %) |
| kevin-hunt | 2 | 132 (-6.7 %) | 283 (0 %) | 394 (+6.6 %) | 535 (0 %) | 615 (0 %) | 804 (-0.5 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 57 (-2.2 %) | 65 (-0.2 %) | 126 (0 %) | 144 (0 %) | 163 (-39.2 %) ⚑ |
| dieter-brew | 1 | 0 (-100 %) | 69 (+17.8 %) ⚑ | 131 (+99.4 %) ⚑ | 210 (+67.3 %) ⚑ | 256 (+78.2 %) ⚑ | 324 (+20.8 %) ⚑ |
| dieter-brew | 2 | 0 (-100 %) | 59 (0 %) | 66 (0 %) | 92 (-26.5 %) ⚑ | 120 (-16.4 %) ⚑ | 184 (-31.3 %) ⚑ |
| baerbel-care | 0 | 0 (-100 %) | 64 (+9.4 %) | 60 (-8.1 %) | 78 (-37.8 %) ⚑ | 92 (-36 %) ⚑ | 211 (-21.6 %) ⚑ |
| baerbel-care | 1 | 0 (-100 %) | 45 (-22.9 %) ⚑ | 63 (-4 %) | 102 (-19.2 %) ⚑ | 127 (-11.6 %) | 288 (+7.1 %) |
| baerbel-care | 2 | 0 (-100 %) | 56 (-4.1 %) | 80 (+22.4 %) ⚑ | 150 (+19 %) ⚑ | 198 (+37.8 %) ⚑ | 269 (0 %) |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 10 (0 %) | 29 (+6.6 %) | 41 (+17 %) ⚑ | 52 (+13.5 %) | 60 (+5.9 %) | 82 (+3.2 %) |
| dieter-wall | 1 | 10 (0 %) | 22 (-20.1 %) ⚑ | 32 (-8 %) | 53 (+15.7 %) ⚑ | 61 (+7.5 %) | 82 (+3.5 %) |
| dieter-wall | 2 | 10 (0 %) | 19 (-30.4 %) ⚑ | 26 (-27 %) ⚑ | 46 (0 %) | 56 (0 %) | 79 (0 %) |
| kevin-iron | 0 | 9 (-10 %) | 27 (0 %) | 36 (+0.9 %) | 42 (-9.4 %) | 51 (-9.8 %) | 64 (-19.2 %) ⚑ |
| kevin-iron | 1 | 9 (-10 %) | 27 (+0.4 %) | 35 (0 %) | 42 (-7.9 %) | 49 (-13.1 %) | 66 (-16.8 %) ⚑ |
| kevin-iron | 2 | 9 (-10 %) | 26 (-5.5 %) | 32 (-8.8 %) | 42 (-9 %) | 50 (-11.7 %) | 64 (-19.4 %) ⚑ |

## Zerlegung (je Pfad, Ausrüstung selten)

### dieter-wall · Pfad 0 · Stufe 10 ·261 Schaden/s · Ausrüstung +118.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.4 Schaden/s · Taktgefühl 1.6 Schaden/s · Bastelgrips -0.3 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 31.6 % · Rausschmiss 23.4 % · Kronkorken-Kelle 16.1 % · Rausschmiss 13.7 % · Autoangriff · Flasche kreist 10.8 % · Du schuldest mir Pfand! 4.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Ruhe im Laden 0 % · Tür bleibt zu 0 % · Verlängertes Hausverbot 0 % · Deckelwirtschaft gebunden · Leergut stapeln gebunden · Dicke Haut vom Hausbier gebunden · Kronkorken-Panzer gebunden · Pfand zurück gebunden · Tresenkante gebunden

### dieter-wall · Pfad 1 · Stufe 10 ·256 Schaden/s · Ausrüstung +151 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.6 Schaden/s · Taktgefühl -0.4 Schaden/s · 0.1 verhindert/s · Bastelgrips -0.3 Schaden/s · 0.1 verhindert/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 36.5 % · Rausschmiss 25.1 % · Kronkorken-Kelle 17.1 % · Autoangriff · Flasche kreist 12.1 % · Du schuldest mir Pfand! 5.3 % · Rausschmiss 3.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kurzer Prozess +1.1 % · Klappe zu, Pegel hoch 0 % · Dritter Deckel gratis 0 % · Erst gucken, dann hauen gebunden · Deckel-Reflex gebunden · Doppelte Türkontrolle gebunden · Keiner drängelt gebunden · Konterschlag gebunden · Nachtreten gebunden

### dieter-wall · Pfad 2 · Stufe 10 ·295 Schaden/s · Ausrüstung +139.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.2 Schaden/s · Taktgefühl 1.1 Schaden/s · Bastelgrips 0.4 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 57 % · Rausschmiss 22.8 % · Autoangriff · Flasche kreist 10.4 % · Kronkorken-Kelle 5.6 % · Du schuldest mir Pfand! 4.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Platzverweis +8.4 % · Breite Absperrung 0 % · Räumungsklage -0.6 % · Breite Schultern gebunden · Böllerpfand gebunden · Runde Sache gebunden · Hausbier-Nachschub gebunden · Absperrband gebunden · Heimspiel gebunden

### dieter-wall · Pfad 0 · Stufe 20 ·406 Schaden/s · Ausrüstung +202.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.4 Schaden/s · Taktgefühl -0.3 Schaden/s · Bastelgrips -0.2 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 35.6 % · Rausschmiss 30.5 % · Kronkorken-Kelle 19.4 % · Autoangriff · Flasche kreist 10.8 % · Du schuldest mir Pfand! 3.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Hausverbot für alle +2.7 % · Tresenkante +0.7 % · Leergut stapeln 0 % · Dicke Haut vom Hausbier 0 % · Kronkorken-Panzer 0 % · Pfand zurück 0 % · Ruhe im Laden 0 % · Verlängertes Hausverbot 0 % · Erst gucken, dann hauen 0 % · Breite Schultern 0 % · Deckel-Reflex 0 % · Deckelwirtschaft gebunden · Tür bleibt zu gebunden

### dieter-wall · Pfad 1 · Stufe 20 ·403 Schaden/s · Ausrüstung +209.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.7 Schaden/s · Taktgefühl 0.2 Schaden/s · Bastelgrips -0.1 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 37.7 % · Rausschmiss 19.7 % · Kronkorken-Kelle 16.7 % · Rausschmiss 12 % · Autoangriff · Flasche kreist 10.7 % · Du schuldest mir Pfand! 3.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kurzer Prozess +2.1 % · Und tschüss! +1.1 % · Deckelwirtschaft +1.1 % · Deckel-Reflex 0 % · Doppelte Türkontrolle 0 % · Keiner drängelt 0 % · Konterschlag 0 % · Nachtreten 0 % · Klappe zu, Pegel hoch 0 % · Breite Schultern 0 % · Leergut stapeln 0 % · Erst gucken, dann hauen gebunden · Dritter Deckel gratis gebunden

### dieter-wall · Pfad 2 · Stufe 20 ·464 Schaden/s · Ausrüstung +163.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.2 Schaden/s · Taktgefühl 1.4 Schaden/s · -0.1 verhindert/s · Bastelgrips 0 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 49 % · Rausschmiss 33.9 % · Autoangriff · Flasche kreist 10.1 % · Kronkorken-Kelle 4.3 % · Du schuldest mir Pfand! 2.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Runde Sache +5.3 % · Alle raus! +5.3 % · Böllerpfand +4.5 % · Hausbier-Nachschub +4.1 % · Räumungsklage +4.1 % · Deckelwirtschaft +0.4 % · Heimspiel 0 % · Breite Absperrung 0 % · Erst gucken, dann hauen 0 % · Deckel-Reflex 0 % · Absperrband -5.5 % · Breite Schultern gebunden · Platzverweis gebunden

### dieter-brawl · Pfad 0 · Stufe 10 ·278 Schaden/s · Ausrüstung +131.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.4 Schaden/s · Taktgefühl 0.3 Schaden/s · Bastelgrips 0 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 31.2 % · Kronkorken-Kelle 29.8 % · Abriss 19.2 % · Autoangriff · Flasche kreist 13.3 % · Du schuldest mir Pfand! 6.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kurzer Kater 0 % · Kater verdrängen 0 % · Durchhalten 0 % · Noch einen auf die Zwölf gebunden · Angeschlagen, nicht besoffen gebunden · Nachgeschenkt gebunden · Deckel, Kelle, Pegel gebunden · Sitzfleisch gebunden · Konterbrezel-Reserve gebunden

### dieter-brawl · Pfad 1 · Stufe 10 ·350 Schaden/s · Ausrüstung +120.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.3 Schaden/s · Taktgefühl 1.2 Schaden/s · Bastelgrips 0 Schaden/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 40.1 % · Kronkorken-Kelle 22.2 % · Abriss 19.1 % · Autoangriff · Flasche kreist 13.4 % · Du schuldest mir Pfand! 5.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Abriss mit Ansage +1 % · Kneipenschreck 0 % · Zugabe! -0.4 % · Erste Runde gebunden · Kellenwut gebunden · Volle Kante gebunden · Volltreffer gebunden · Vorglühen gebunden · Dreier-Kelle gebunden

### dieter-brawl · Pfad 2 · Stufe 10 ·323 Schaden/s · Ausrüstung +113.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.5 Schaden/s · Taktgefühl 0.8 Schaden/s · Bastelgrips 0.7 Schaden/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 28.6 % · Kronkorken-Kelle 26.1 % · Abriss 22.9 % · Autoangriff · Flasche kreist 9.6 % · Abriss 8.5 % · Du schuldest mir Pfand! 4.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Weiter zum Nächsten +1.4 % · Wurf in die Runde 0 % · Sprungbrett 0 % · Anlauf nehmen gebunden · Flaschenpost gebunden · Rundumschlag gebunden · Hinterher! gebunden · Tresensprung gebunden · Nachschlag gebunden

### dieter-brawl · Pfad 0 · Stufe 20 ·450 Schaden/s · Ausrüstung +213 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.1 Schaden/s · 0.1 Heilung/s · Taktgefühl 0.7 Schaden/s · Bastelgrips 0 Schaden/s · 0.1 Heilung/s · Dicke Haut -2.1 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 40.5 % · Kronkorken-Kelle 23.7 % · Abriss 19.7 % · Autoangriff · Flasche kreist 12.1 % · Du schuldest mir Pfand! 3.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kellenwut +7.6 % · Erste Runde +5.1 % · Angeschlagen, nicht besoffen 0 % · Nachgeschenkt 0 % · Deckel, Kelle, Pegel 0 % · Sitzfleisch 0 % · Konterbrezel-Reserve 0 % · Kurzer Kater 0 % · Durchhalten 0 % · Anlauf nehmen 0 % · Zweite Luft -4.3 % · Noch einen auf die Zwölf gebunden · Kater verdrängen gebunden

### dieter-brawl · Pfad 1 · Stufe 20 ·580 Schaden/s · Ausrüstung +145.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.3 Schaden/s · Taktgefühl 1.8 Schaden/s · Bastelgrips 0 Schaden/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 33.8 % · Kronkorken-Kelle 26.9 % · Abriss 25.8 % · Autoangriff · Flasche kreist 10.2 % · Du schuldest mir Pfand! 3.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Vorglühen +12.9 % · Blitzabriss +8.3 % · Volltreffer +5.5 % · Zugabe! +5.5 % · Kneipenschreck 0 % · Noch einen auf die Zwölf 0 % · Anlauf nehmen 0 % · Angeschlagen, nicht besoffen 0 % · Dreier-Kelle -0.2 % · Volle Kante -0.5 % · Kellenwut -3.5 % · Erste Runde gebunden · Abriss mit Ansage gebunden

### dieter-brawl · Pfad 2 · Stufe 20 ·512 Schaden/s · Ausrüstung +190 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.6 Schaden/s · Taktgefühl -0.5 Schaden/s · Bastelgrips 0 Schaden/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 34.1 % · Kronkorken-Kelle 24.2 % · Abriss 15.7 % · Abriss 14.2 % · Autoangriff · Flasche kreist 8.9 % · Du schuldest mir Pfand! 2.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Erste Runde +6.4 % · Kellenwut +0.8 % · Nachschlag +0.7 % · Flaschenpost 0 % · Rundumschlag 0 % · Hinterher! 0 % · Tresensprung 0 % · Wurf in die Runde 0 % · Sprungbrett 0 % · Kein Feierabend 0 % · Noch einen auf die Zwölf 0 % · Anlauf nehmen gebunden · Weiter zum Nächsten gebunden

### dieter-brew · Pfad 0 · Stufe 10 ·212 Schaden/s · Ausrüstung +126.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1 Schaden/s · -0.3 Heilung/s · Taktgefühl 0.6 Schaden/s · -0.2 Heilung/s · Bastelgrips 0.1 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Kronkorken-Kelle 35 % · Autoangriff · Flasche kreist 29.6 % · Fassanstich 23.6 % · Du schuldest mir Pfand! 11.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Zapfen im Gehen 0 % · Frisch gezapft 0 % · Nächste Runde -6.4 % · Pils zuerst gebunden · Nachfüllen gebunden · Schaumkrone gebunden · Ruhige Hand gebunden · Drittes Fass gebunden · Zapfhahn auf gebunden

### dieter-brew · Pfad 1 · Stufe 10 ·193 Schaden/s · Ausrüstung +173.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1 Schaden/s · 0.1 Heilung/s · Taktgefühl 0.2 Schaden/s · 0.3 Heilung/s · Bastelgrips -0.7 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Fassanstich 35.6 % · Kronkorken-Kelle 34.9 % · Autoangriff · Flasche kreist 21.2 % · Du schuldest mir Pfand! 8.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Runde aufs Haus 0 % · Letzte Runde heilt 0 % · Großes Fass 0 % · Weizenkur gebunden · Nachschank gebunden · Nichts wegkippen gebunden · Deckel und Pflaster gebunden · Katerfass gebunden · Tropfen für Tropfen gebunden

### dieter-brew · Pfad 2 · Stufe 10 ·320 Schaden/s · Ausrüstung +139.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.7 Schaden/s · 0.2 Heilung/s · Taktgefühl 3.1 Schaden/s · 0.4 Heilung/s · Bastelgrips 0.5 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Fassanstich 37.2 % · Fassanstich 22.5 % · Kronkorken-Kelle 20.7 % · Autoangriff · Flasche kreist 13 % · Du schuldest mir Pfand! 6.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Bock auf mehr +14.5 % · Scherben bringen Glück +2.1 % · Gut gekühlt 0 % · Rücklaufleitung gebunden · Bock zuerst gebunden · Breiter Ausschank gebunden · Pfand mit Zinsen gebunden · Bock drauf gebunden · Restbestand gebunden

### dieter-brew · Pfad 0 · Stufe 20 ·317 Schaden/s · Ausrüstung +187.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.7 Schaden/s · 0.5 Heilung/s · Taktgefühl 0.2 Schaden/s · 0.1 Heilung/s · Bastelgrips 0 Schaden/s · 0.6 Heilung/s · -0.1 verhindert/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Fassanstich 48.2 % · Autoangriff · Flasche kreist 27.2 % · Kronkorken-Kelle 17.8 % · Du schuldest mir Pfand! 6.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Drittes Fass 0 % · Zapfen im Gehen 0 % · Rücklaufleitung 0 % · Nachschank 0 % · Weizenkur -0.2 % · Nachfüllen -0.4 % · Schaumkrone -1.1 % · Nächste Runde -1.6 % · Anstich mit Schwung -2.5 % · Zapfhahn auf -3.2 % · Ruhige Hand -4.8 % · Pils zuerst gebunden · Frisch gezapft gebunden

### dieter-brew · Pfad 1 · Stufe 20 ·303 Schaden/s · Ausrüstung +214.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.6 Schaden/s · 0.1 Heilung/s · Taktgefühl 0.2 Schaden/s · Bastelgrips -0.4 Schaden/s · 0.9 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Fassanstich 44.5 % · Autoangriff · Flasche kreist 25.4 % · Kronkorken-Kelle 24 % · Du schuldest mir Pfand! 6.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Pils zuerst +7 % · Tropfen für Tropfen +4.8 % · Nachschank 0 % · Deckel und Pflaster 0 % · Runde aufs Haus 0 % · Großes Fass 0 % · Rücklaufleitung 0 % · Anstich für alle -0.1 % · Nachfüllen -0.7 % · Katerfass -4.7 % · Nichts wegkippen -7.7 % · Weizenkur gebunden · Letzte Runde heilt gebunden

### dieter-brew · Pfad 2 · Stufe 20 ·490 Schaden/s · Ausrüstung +215.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms -0.3 Schaden/s · Taktgefühl 0.7 Schaden/s · 0.1 Heilung/s · Bastelgrips -0.2 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Fassanstich 31.4 % · Fassanstich 26.7 % · Kronkorken-Kelle 25.5 % · Autoangriff · Flasche kreist 12 % · Du schuldest mir Pfand! 4.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Bock auf mehr +7.2 % · Letzter Ausschank +1.3 % · Bock drauf +0.9 % · Pfand mit Zinsen +0.2 % · Restbestand +0.2 % · Bock zuerst 0 % · Breiter Ausschank 0 % · Pils zuerst 0 % · Weizenkur 0 % · Nachfüllen -0.1 % · Scherben bringen Glück -0.5 % · Rücklaufleitung gebunden · Gut gekühlt gebunden

### baerbel-care · Pfad 0 · Stufe 10 ·258 Schaden/s · Ausrüstung +141.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.3 Schaden/s · 0.1 Heilung/s · Taktgefühl 1.8 Schaden/s · 0.3 Heilung/s · Bastelgrips 0 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Großreinemachen 72.2 % · Autoangriff · Dauersprühen 12.2 % · Pinsel-Piekser 10.4 % · Fleckentest, Schätzchen! 5.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Gründlich, nicht schnell 0 % · Sanfte Versiegelung 0 % · Löffel in der Schürze 0 % · Warme Schüssel gebunden · Nachschlag gebunden · Das sechste Glas gebunden · Ein Schluck, ein Plan gebunden · Notration gebunden · Nebenbei umgerührt gebunden

### baerbel-care · Pfad 1 · Stufe 10 ·217 Schaden/s · Ausrüstung +102.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.9 Schaden/s · -0.2 verhindert/s · Taktgefühl 0.1 Schaden/s · 0.5 Heilung/s · -0.2 verhindert/s · Bastelgrips -0.5 Schaden/s · 0.8 Heilung/s · 0.1 verhindert/s · Dicke Haut 0.1 Schaden/s

**Kniffe (Anteil am Schaden):** Großreinemachen 59.8 % · Pinsel-Piekser 17.4 % · Autoangriff · Dauersprühen 15 % · Fleckentest, Schätzchen! 7.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Anbau mit Fußbodenheilung +5.9 % · Vom Herd aus +4 % · Nachgelegt -13.3 % · Giselas Ruf gebunden · Brutpflege gebunden · Freilaufgans gebunden · Gisela, hierher! gebunden · Thermomix-Tafel gebunden · Am Tisch wird gegessen gebunden

### baerbel-care · Pfad 2 · Stufe 10 ·303 Schaden/s · Ausrüstung +140.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.7 Schaden/s · Taktgefühl 0 Schaden/s · 0.2 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Großreinemachen 67.9 % · Pinsel-Piekser 16.1 % · Autoangriff · Dauersprühen 10.9 % · Fleckentest, Schätzchen! 5.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Frisch aufgetragen +15.2 % · Blitzblank +2.5 % · Restfleck +2.5 % · Spüli ins Auge gebunden · Frisch gewischt gebunden · Nichts wird weggekippt gebunden · Schrubben heilt gebunden · Deckel auf die Schüssel gebunden · Landfrauen-Glanz gebunden

### baerbel-care · Pfad 0 · Stufe 20 ·405 Schaden/s · Ausrüstung +247.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.1 Schaden/s · -0.8 Heilung/s · Taktgefühl 1.1 Schaden/s · -0.3 Heilung/s · Bastelgrips 0.2 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Großreinemachen 70.4 % · Pinsel-Piekser 15.9 % · Autoangriff · Dauersprühen 9.7 % · Fleckentest, Schätzchen! 4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nebenbei umgerührt +8.1 % · Ein Schluck, ein Plan +6 % · Nicht ohne meine Mädels +5.4 % · Nachschlag +3.4 % · Frisch gewischt +2.6 % · Das sechste Glas 0 % · Notration 0 % · Gründlich, nicht schnell 0 % · Löffel in der Schürze 0 % · Spüli ins Auge 0 % · Giselas Ruf -3.5 % · Warme Schüssel gebunden · Sanfte Versiegelung gebunden

### baerbel-care · Pfad 1 · Stufe 20 ·358 Schaden/s · Ausrüstung +218.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.9 Schaden/s · 0.1 Heilung/s · Taktgefühl -1 Schaden/s · -0.2 Heilung/s · Bastelgrips 0.2 Schaden/s · 0.2 Heilung/s · -0.1 verhindert/s · Dicke Haut 1.6 Schaden/s · -0.1 Heilung/s · -0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Großreinemachen 60.1 % · Pinsel-Piekser 22.5 % · Autoangriff · Dauersprühen 12.1 % · Fleckentest, Schätzchen! 5.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Am Tisch wird gegessen +2.4 % · Gänsehaut-Finale +1.7 % · Frisch gewischt +0.7 % · Brutpflege 0 % · Freilaufgans 0 % · Gisela, hierher! 0 % · Spüli ins Auge 0 % · Thermomix-Tafel -0.2 % · Warme Schüssel -0.8 % · Anbau mit Fußbodenheilung -2 % · Nachgelegt -3.4 % · Giselas Ruf gebunden · Vom Herd aus gebunden

### baerbel-care · Pfad 2 · Stufe 20 ·383 Schaden/s · Ausrüstung +194 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms -0.8 Schaden/s · Taktgefühl -0.2 Schaden/s · Bastelgrips 0.1 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Großreinemachen 66.6 % · Pinsel-Piekser 17.2 % · Autoangriff · Dauersprühen 12.6 % · Fleckentest, Schätzchen! 3.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Frisch aufgetragen +12.4 % · Frisch gewischt +11 % · Landfrauen-Glanz +4.9 % · Schrubben heilt +2.5 % · Nachschlag +1.4 % · Nichts wird weggekippt 0 % · Deckel auf die Schüssel 0 % · Warme Schüssel 0 % · Restfleck -1.1 % · Giselas Ruf -2.2 % · Schlussputz -2.3 % · Spüli ins Auge gebunden · Blitzblank gebunden

### baerbel-feedback · Pfad 0 · Stufe 10 ·317 Schaden/s · Ausrüstung +111 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.6 Schaden/s · 0.3 Heilung/s · Taktgefühl -0.2 Schaden/s · 0.4 Heilung/s · Bastelgrips 0.8 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 51.4 % · Pinsel-Piekser 15.8 % · Durchputzen 13 % · Schimmel 11 % · Autoangriff · Dauersprühen 8.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nebenbei gestreut +1.4 % · Mundpropaganda +0.4 % · Ruhe im Karton 0 % · Feuchte Ecke gebunden · Es wächst nach gebunden · Zugluft gebunden · Kurzer Hausbesuch gebunden · Sporenflug gebunden · Muffige Kammer gebunden

### baerbel-feedback · Pfad 1 · Stufe 10 ·320 Schaden/s · Ausrüstung +113 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.1 Schaden/s · 0.7 Heilung/s · -0.1 verhindert/s · Taktgefühl -0.3 Schaden/s · 0.2 Heilung/s · Bastelgrips -0.2 Schaden/s · 1.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 49.3 % · Pinsel-Piekser 19.4 % · Autoangriff · Dauersprühen 11.2 % · Durchputzen 10.1 % · Schimmel 10 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kundenbindung 0 % · Reklamation abgewürgt 0 % · Doppelte Marge 0 % · Provision vom Schmerz gebunden · Putzprovision gebunden · Kleingeld vom Tick gebunden · Abschlussprämie gebunden · Provisionskur gebunden · Sonderrabatt gebunden

### baerbel-feedback · Pfad 2 · Stufe 10 ·374 Schaden/s · Ausrüstung +88.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.7 Schaden/s · 0.2 Heilung/s · Taktgefühl 1.5 Schaden/s · 0.1 Heilung/s · Bastelgrips 0 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 37.8 % · Durchputzen 21.9 % · Pinsel-Piekser 19.8 % · Schimmel 12.5 % · Autoangriff · Dauersprühen 8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Doppelt geputzt +3.8 % · Vertrieb auf Achse 0 % · Kettenbrief 0 % · Einmal mehr drüber gebunden · Eintrittsgebühr gebunden · Bring noch zwei Freundinnen gebunden · Startkapital gebunden · Passives Einkommen gebunden · Mehrwegflasche gebunden

### baerbel-feedback · Pfad 0 · Stufe 20 ·438 Schaden/s · Ausrüstung +171.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.8 Schaden/s · -0.1 Heilung/s · Taktgefühl 0.2 Schaden/s · Bastelgrips 0 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 51 % · Pinsel-Piekser 20.6 % · Autoangriff · Dauersprühen 10 % · Durchputzen 9.6 % · Schimmel 8.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nebenbei gestreut +2 % · Einmal mehr drüber +0.4 % · Zugluft 0 % · Kurzer Hausbesuch 0 % · Muffige Kammer 0 % · Ruhe im Karton 0 % · Provision vom Schmerz 0 % · Sporenflug -1.8 % · Putzprovision -2.2 % · Sporenregen -4.3 % · Es wächst nach -8.6 % · Feuchte Ecke gebunden · Mundpropaganda gebunden

### baerbel-feedback · Pfad 1 · Stufe 20 ·441 Schaden/s · Ausrüstung +165.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.9 Schaden/s · 0.1 Heilung/s · -0.1 verhindert/s · Taktgefühl 1.3 Schaden/s · 2.3 Heilung/s · 0.2 verhindert/s · Bastelgrips 0 Schaden/s · 0.8 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 58.1 % · Pinsel-Piekser 13.1 % · Durchputzen 11.1 % · Autoangriff · Dauersprühen 10.2 % · Schimmel 7.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Einmal mehr drüber +4.3 % · Feuchte Ecke +2 % · Kleingeld vom Tick 0 % · Sonderrabatt 0 % · Kundenbindung 0 % · Doppelte Marge 0 % · Abschlussprämie -0.3 % · Putzprovision -0.4 % · Bonusausschüttung -0.8 % · Es wächst nach -6.8 % · Provisionskur -8.9 % · Provision vom Schmerz gebunden · Reklamation abgewürgt gebunden

### baerbel-feedback · Pfad 2 · Stufe 20 ·534 Schaden/s · Ausrüstung +144.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms -0.1 Schaden/s · 0.1 Heilung/s · Taktgefühl -0.3 Schaden/s · 0.9 Heilung/s · 0.4 verhindert/s · Bastelgrips 0 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 34.9 % · Pinsel-Piekser 23.8 % · Durchputzen 20.9 % · Schimmel 10.5 % · Autoangriff · Dauersprühen 10 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Die ganze Downline +1.1 % · Doppelt geputzt +0.3 % · Bring noch zwei Freundinnen 0 % · Startkapital 0 % · Mehrwegflasche 0 % · Vertrieb auf Achse 0 % · Provision vom Schmerz 0 % · Feuchte Ecke 0 % · Eintrittsgebühr -1.4 % · Putzprovision -4 % · Passives Einkommen -7.3 % · Einmal mehr drüber gebunden · Kettenbrief gebunden

### baerbel-stage · Pfad 0 · Stufe 10 ·315 Schaden/s · Ausrüstung +118 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 3.1 Schaden/s · Taktgefühl 1.1 Schaden/s · Bastelgrips 0 Schaden/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Auswringen 42.8 % · Grundreinigung auf eigene Gefahr 26.4 % · Pinsel-Piekser 17.8 % · Autoangriff · Dauersprühen 8.6 % · Fleckentest, Schätzchen! 4.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Follower gewonnen +8.4 % · Sendezeit verlängert +0.3 % · Sponsoring-Deal 0 % · Langzeitbelichtung gebunden · Dauerschleife gebunden · Stromsparmodus gebunden · Abgeblockt gebunden · Kommentar gepinnt gebunden · Zugabe-Rhythmus gebunden

### baerbel-stage · Pfad 1 · Stufe 10 ·383 Schaden/s · Ausrüstung +107.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.2 Schaden/s · Taktgefühl -0.5 Schaden/s · Bastelgrips 0 Schaden/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Auswringen 44.4 % · Grundreinigung auf eigene Gefahr 19.6 % · Pinsel-Piekser 14.9 % · Fleckentest, Schätzchen! 12 % · Autoangriff · Dauersprühen 6.7 % · Auswringen 2.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Für alle sichtbar +13.1 % · Noch ein Take +4.1 % · Turbostufe zehn 0 % · Perfekter Upload gebunden · Früh am Herd gebunden · Scharfgestellt gebunden · Like-Welle gebunden · Noch ein Reel, ihr Opfer! gebunden · Fleckentest bestanden gebunden

### baerbel-stage · Pfad 2 · Stufe 10 ·269 Schaden/s · Ausrüstung +104.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2 Schaden/s · Taktgefühl 0.4 Schaden/s · Bastelgrips 0.2 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Auswringen 43.7 % · Grundreinigung auf eigene Gefahr 26.1 % · Pinsel-Piekser 16.7 % · Autoangriff · Dauersprühen 8.7 % · Fleckentest, Schätzchen! 4.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Live-Schalte 0 % · Nächste Szene 0 % · Sprungschnitt 0 % · Selfie im Gehen gebunden · Bühnenfunke gebunden · Erst pflegen, dann posten gebunden · Story-Wechsel gebunden · Unsichtbarer Schnitt gebunden · Frisch geföhnt gebunden

### baerbel-stage · Pfad 0 · Stufe 20 ·508 Schaden/s · Ausrüstung +158.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.9 Schaden/s · Taktgefühl 3 Schaden/s · 0.1 Heilung/s · Bastelgrips 0 Schaden/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Auswringen 40 % · Grundreinigung auf eigene Gefahr 35 % · Pinsel-Piekser 12.4 % · Autoangriff · Dauersprühen 9.4 % · Fleckentest, Schätzchen! 3.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nachglanz +4.5 % · Bühnenfunke +1.3 % · Dauerschleife +0.1 % · Stromsparmodus +0.1 % · Sendezeit verlängert +0.1 % · Abgeblockt 0 % · Kommentar gepinnt 0 % · Sponsoring-Deal 0 % · Perfekter Upload 0 % · Selfie im Gehen 0 % · Zugabe-Rhythmus -1 % · Langzeitbelichtung gebunden · Follower gewonnen gebunden

### baerbel-stage · Pfad 1 · Stufe 20 ·614 Schaden/s · Ausrüstung +214.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.9 Schaden/s · Taktgefühl -0.5 Schaden/s · Bastelgrips 0.5 Schaden/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Auswringen 53.6 % · Grundreinigung auf eigene Gefahr 22 % · Pinsel-Piekser 8.5 % · Fleckentest, Schätzchen! 8.3 % · Autoangriff · Dauersprühen 6.7 % · Auswringen 1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Letzter Schliff +15.5 % · Noch ein Take +13.4 % · Like-Welle +11.6 % · Noch ein Reel, ihr Opfer! +9.7 % · Fleckentest bestanden +4.8 % · Früh am Herd +4.4 % · Scharfgestellt +3.1 % · Bühnenfunke +2.5 % · Turbostufe zehn 0 % · Langzeitbelichtung 0 % · Selfie im Gehen 0 % · Perfekter Upload gebunden · Für alle sichtbar gebunden

### baerbel-stage · Pfad 2 · Stufe 20 ·431 Schaden/s · Ausrüstung +166.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.3 Schaden/s · Taktgefühl 3.4 Schaden/s · Bastelgrips 0 Schaden/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Auswringen 40.3 % · Grundreinigung auf eigene Gefahr 30.6 % · Pinsel-Piekser 17 % · Autoangriff · Dauersprühen 8.7 % · Fleckentest, Schätzchen! 3.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Bühnenfunke +1.2 % · Erst pflegen, dann posten 0 % · Story-Wechsel 0 % · Unsichtbarer Schnitt 0 % · Frisch geföhnt 0 % · Live-Schalte 0 % · Sprungschnitt 0 % · Langzeitbelichtung 0 % · Viral bis zur Feldflur -0.3 % · Perfekter Upload -0.7 % · Dauerschleife -1.4 % · Selfie im Gehen gebunden · Nächste Szene gebunden

### kevin-fuse · Pfad 0 · Stufe 10 ·304 Schaden/s · Ausrüstung +113.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1 Schaden/s · Taktgefühl 1.9 Schaden/s · Bastelgrips 0 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 34.3 % · Kurzschluss 27.5 % · Kurzschluss 17.8 % · Pfandgeschoss 9.9 % · Autoangriff · Pfand im Takt 6.8 % · Lunte 3.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Ausgebrannt +9 % · Heißer Kleber +6.3 % · Rücklaufdruck +1.2 % · Brennender Nachlauf gebunden · Zündfunke gebunden · Dicke Lunte gebunden · Funkenflug gebunden · Lunte springt gebunden · Sparflamme gebunden

### kevin-fuse · Pfad 1 · Stufe 10 ·307 Schaden/s · Ausrüstung +131.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.9 Schaden/s · Taktgefühl 0.3 Schaden/s · -0.1 verhindert/s · Bastelgrips 0.5 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 52 % · Kurzschluss 21.5 % · Kurzschluss 10.9 % · Autoangriff · Pfand im Takt 6.9 % · Pfandgeschoss 6.1 % · Lunte 2.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Überbrückt +3.5 % · Serienschaltung +2.3 % · Doppelte Sicherung 0 % · Blanker Draht gebunden · Kupferkern gebunden · Rückstrom gebunden · Schnellverkabelt gebunden · Erdschluss gebunden · Kurzschluss gebunden

### kevin-fuse · Pfad 2 · Stufe 10 ·331 Schaden/s · Ausrüstung +175.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.1 Schaden/s · 0.1 verhindert/s · Taktgefühl 0.1 Schaden/s · 0.2 verhindert/s · Bastelgrips 0.4 Schaden/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Kurzschluss 35 % · Kurzschluss 27.2 % · Restmüll mit Zündschnur 20.5 % · Lunte 6.9 % · Autoangriff · Pfand im Takt 5.5 % · Pfandgeschoss 3 % · Kettenzündung 1.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Lange Zündschnur +11.6 % · Nachzünder +5.2 % · Glühender Draht 0 % · Zündliste gebunden · Warmlaufen gebunden · Kleber für alle gebunden · Funkenüberschlag gebunden · Kettenzündung gebunden · Zündleitung gebunden

### kevin-fuse · Pfad 0 · Stufe 20 ·457 Schaden/s · Ausrüstung +185.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.5 Schaden/s · Taktgefühl -0.3 Schaden/s · Bastelgrips -0.2 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 34.2 % · Kurzschluss 26.1 % · Kurzschluss 15.6 % · Pfandgeschoss 13.6 % · Autoangriff · Pfand im Takt 7.5 % · Lunte 3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kupferkern +5.3 % · Zündfunke +1.5 % · Sparflamme +0.5 % · Rücklaufdruck +0.2 % · Dicke Lunte 0 % · Lunte springt 0 % · Alles auf die Lunte 0 % · Blanker Draht 0 % · Ausgebrannt -0.2 % · Zündliste -0.9 % · Funkenflug -1.3 % · Brennender Nachlauf gebunden · Heißer Kleber gebunden

### kevin-fuse · Pfad 1 · Stufe 20 ·557 Schaden/s · Ausrüstung +179.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.4 Schaden/s · Taktgefühl 1.3 Schaden/s · Bastelgrips 0 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 49.4 % · Kurzschluss 26.6 % · Kurzschluss 12.8 % · Autoangriff · Pfand im Takt 5.1 % · Pfandgeschoss 4.5 % · Lunte 1.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kurzschluss +12.3 % · Brennender Nachlauf +11.7 % · Nullwiderstand +7.3 % · Rückstrom +5.5 % · Zündfunke +5.3 % · Kupferkern +4.5 % · Zündliste +0.6 % · Überbrückt +0.5 % · Schnellverkabelt 0 % · Erdschluss 0 % · Serienschaltung 0 % · Blanker Draht gebunden · Doppelte Sicherung gebunden

### kevin-fuse · Pfad 2 · Stufe 20 ·525 Schaden/s · Ausrüstung +231.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.1 Schaden/s · -0.2 verhindert/s · Taktgefühl 0.7 Schaden/s · -0.1 verhindert/s · Bastelgrips 0.8 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Kurzschluss 29.3 % · Kurzschluss 28.9 % · Restmüll mit Zündschnur 24.7 % · Autoangriff · Pfand im Takt 5.4 % · Lunte 4.9 % · Pfandgeschoss 3.7 % · Kettenzündung 3.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Zündfunke +15.6 % · Kleber für alle +9.8 % · Brennender Nachlauf +2 % · Lange Zündschnur +1.7 % · Nachzünder +1.5 % · Funkenüberschlag +1.1 % · Warmlaufen 0 % · Zündleitung 0 % · Blanker Draht 0 % · Kettenreaktion -0.5 % · Kettenzündung -5.7 % · Zündliste gebunden · Glühender Draht gebunden

### kevin-iron · Pfad 0 · Stufe 10 ·260 Schaden/s · Ausrüstung +100.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.9 Schaden/s · 0.1 Heilung/s · Taktgefühl 0.2 Schaden/s · -0.1 Heilung/s · Bastelgrips 1.4 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Robbi 61.6 % · Pfandgeschoss 18.6 % · Autoangriff · Pfand im Takt 13.4 % · Kleb die Scheiße fest 5.3 % · Überlast 1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Werkstattpause 0 % · Ersatzteile 0 % · Starker Magnet 0 % · Längere Batterie gebunden · Weiter Bremsweg gebunden · Scharfe Dose gebunden · Robbi hält gebunden · Magnetpanzer gebunden · Ersatzdose gebunden

### kevin-iron · Pfad 1 · Stufe 10 ·261 Schaden/s · Ausrüstung +137.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.7 Schaden/s · Taktgefühl 1.1 Schaden/s · Bastelgrips -0.9 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Robbi 47.3 % · Pfandgeschoss 18.8 % · Überlast 17.3 % · Autoangriff · Pfand im Takt 11.9 % · Kleb die Scheiße fest 4.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Parierschlag 0 % · Dosenblech 0 % · Nietenpflaster 0 % · Blechkante gebunden · Nietenpanzer gebunden · Druckventil gebunden · Nietfest gebunden · Vernietet gebunden · Notniete gebunden

### kevin-iron · Pfad 2 · Stufe 10 ·375 Schaden/s · Ausrüstung +103.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.8 Schaden/s · Taktgefühl 1.2 Schaden/s · Bastelgrips 0.2 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Robbi 67.2 % · Pfandgeschoss 13 % · Überlast 8.7 % · Autoangriff · Pfand im Takt 7.7 % · Kleb die Scheiße fest 3.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Überdruck +13.4 % · Restwärme +1.1 % · Überlast im Laufen 0 % · Frisch verschraubt gebunden · Zusatzladung gebunden · Blitzableiter gebunden · Wiederaufbau gebunden · Druckschlag gebunden · Dampfdruck gebunden

### kevin-iron · Pfad 0 · Stufe 20 ·347 Schaden/s · Ausrüstung +214.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.8 Schaden/s · Taktgefühl -0.2 Schaden/s · Bastelgrips 0.4 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Robbi 46.6 % · Pfandgeschoss 29.6 % · Autoangriff · Pfand im Takt 14.4 % · Überlast 5.2 % · Kleb die Scheiße fest 4.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Scharfe Dose +7.9 % · Weiter Bremsweg 0 % · Robbi hält 0 % · Werkstattpause 0 % · Starker Magnet 0 % · Letzter Befehl 0 % · Frisch verschraubt 0 % · Blechkante 0 % · Nietenpanzer -1.8 % · Ersatzdose -2.7 % · Magnetpanzer -10.3 % · Längere Batterie gebunden · Ersatzteile gebunden

### kevin-iron · Pfad 1 · Stufe 20 ·364 Schaden/s · Ausrüstung +192.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.4 Schaden/s · Taktgefühl 0.6 Schaden/s · Bastelgrips 0 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Robbi 38.3 % · Pfandgeschoss 27 % · Überlast 16 % · Autoangriff · Pfand im Takt 14.3 % · Kleb die Scheiße fest 4.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nietenpanzer +0.4 % · Druckventil 0 % · Nietfest 0 % · Vernietet 0 % · Notniete 0 % · Parierschlag 0 % · Nietenpflaster 0 % · Nicht TÜV-geprüft 0 % · Frisch verschraubt 0 % · Längere Batterie 0 % · Weiter Bremsweg 0 % · Blechkante gebunden · Dosenblech gebunden

### kevin-iron · Pfad 2 · Stufe 20 ·485 Schaden/s · Ausrüstung +88.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1 Schaden/s · Taktgefühl 1.2 Schaden/s · Bastelgrips 1.5 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Robbi 67.4 % · Pfandgeschoss 13.6 % · Autoangriff · Pfand im Takt 9.5 % · Überlast 5.9 % · Kleb die Scheiße fest 3.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Wiederaufbau +3.8 % · Nietenpanzer +3.4 % · Zusatzladung +2.1 % · Überdruck +1.9 % · Kernschmelze +1.2 % · Blitzableiter 0 % · Druckschlag 0 % · Dampfdruck 0 % · Überlast im Laufen 0 % · Längere Batterie 0 % · Blechkante 0 % · Frisch verschraubt gebunden · Restwärme gebunden

### kevin-hunt · Pfad 0 · Stufe 10 ·340 Schaden/s · Ausrüstung +102.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.3 Schaden/s · 0.1 Heilung/s · Taktgefühl 1.8 Schaden/s · 0.1 Heilung/s · Bastelgrips 0 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 43.4 % · Pfandgeschoss 21.1 % · Restmüll-Rakete 16.1 % · Autoangriff · Pfand im Takt 10.8 % · Kleb die Scheiße fest 5.2 % · Überzündung 3.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Automatenrhythmus +1.8 % · Pfandgeschoss im Laufen 0 % · Pfandbon 0 % · Gezinkte Dose gebunden · Restwert gebunden · Klebefalle gebunden · Kurze Pechsträhne gebunden · Glücksgriff gebunden · Beutefieber gebunden

### kevin-hunt · Pfad 1 · Stufe 10 ·318 Schaden/s · Ausrüstung +122.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.6 Schaden/s · Taktgefühl 1.1 Schaden/s · 0.1 verhindert/s · Bastelgrips 0.4 Schaden/s · -0.1 verhindert/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 44.6 % · Pfandgeschoss 20.1 % · Restmüll-Rakete 14.2 % · Autoangriff · Pfand im Takt 13.1 % · Kleb die Scheiße fest 5 % · Überzündung 2.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Rückstoß 0 % · Schritt voraus 0 % · Rakete im Rennen 0 % · Wurf aus der Bewegung gebunden · Fangschuss gebunden · Abgesprungen gebunden · Nachladen im Rennen gebunden · Nachschub gebunden · Fangnetz gebunden

### kevin-hunt · Pfad 2 · Stufe 10 ·323 Schaden/s · Ausrüstung +99.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1 Schaden/s · -0.2 verhindert/s · Taktgefühl 0.8 Schaden/s · 0.1 Heilung/s · 0.1 verhindert/s · Bastelgrips -0.2 Schaden/s · -0.1 verhindert/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 40.8 % · Restmüll-Rakete 17.9 % · Autoangriff · Pfand im Takt 14 % · Pfandgeschoss 13 % · Pfandseil 7.3 % · Kleb die Scheiße fest 6.2 % · Überzündung 0.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Restgewinn +0.5 % · Fangprämie 0 % · Stahlseil 0 % · Zweite Serie gebunden · Pfandrückgabe gebunden · Gewinnausschüttung gebunden · Glücksbringer gebunden · Pfandseil gebunden · Glücksrausch gebunden

### kevin-hunt · Pfad 0 · Stufe 20 ·554 Schaden/s · Ausrüstung +174.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1 Schaden/s · Taktgefühl -1.9 Schaden/s · -0.2 Heilung/s · Bastelgrips 0 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 41.3 % · Pfandgeschoss 20.8 % · Restmüll-Rakete 19.2 % · Autoangriff · Pfand im Takt 12.1 % · Kleb die Scheiße fest 3.4 % · Überzündung 3.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Glücksgriff +4.4 % · Kurze Pechsträhne +4.2 % · Alles auf Rot +1.8 % · Restwert +0.1 % · Klebefalle 0 % · Beutefieber 0 % · Pfandgeschoss im Laufen 0 % · Automatenrhythmus 0 % · Wurf aus der Bewegung 0 % · Fangschuss 0 % · Zweite Serie -0.9 % · Gezinkte Dose gebunden · Pfandbon gebunden

### kevin-hunt · Pfad 1 · Stufe 20 ·516 Schaden/s · Ausrüstung +201 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.8 Schaden/s · Taktgefühl 1.6 Schaden/s · -0.2 verhindert/s · Bastelgrips 0.4 Schaden/s · 0.1 verhindert/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 39.3 % · Pfandgeschoss 26.2 % · Restmüll-Rakete 15.3 % · Autoangriff · Pfand im Takt 13.4 % · Kleb die Scheiße fest 3.8 % · Überzündung 2.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nie am selben Fleck +4.4 % · Gezinkte Dose +4.4 % · Restwert +2.8 % · Zweite Serie +1.1 % · Fangschuss 0 % · Abgesprungen 0 % · Nachladen im Rennen 0 % · Nachschub 0 % · Fangnetz 0 % · Rückstoß 0 % · Rakete im Rennen 0 % · Wurf aus der Bewegung gebunden · Schritt voraus gebunden

### kevin-hunt · Pfad 2 · Stufe 20 ·518 Schaden/s · Ausrüstung +131 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.4 Schaden/s · Taktgefühl 1.6 Schaden/s · 0.1 Heilung/s · -0.3 verhindert/s · Bastelgrips 0.7 Schaden/s · 0.1 Heilung/s · 0.1 verhindert/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 50.1 % · Restmüll-Rakete 18.2 % · Autoangriff · Pfand im Takt 13.1 % · Pfandgeschoss 9 % · Pfandseil 4.2 % · Kleb die Scheiße fest 4 % · Überzündung 1.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Glücksrausch +4.7 % · Glücksbringer +0.6 % · Gewinnausschüttung 0 % · Fangprämie 0 % · Stahlseil 0 % · Wurf aus der Bewegung 0 % · Fangschuss 0 % · Gewinnrakete -0.6 % · Gezinkte Dose -0.7 % · Pfandrückgabe -3.7 % · Pfandseil -11.8 % · Zweite Serie gebunden · Restgewinn gebunden

