# Balance-Sheet

Automatisch erzeugt von `npm run balance:sheet` · 2026-09-25 · 40 s Übungskampf, jede Zelle und jede Zerlegung als Mittel aus Boss (10× Feldleben) und Feldgruppe (drei Gegner mit Umland-Leben); gefallene Gegner ersetzt sofort ein neuer (Kill-Talente zählen), Zufall mit 3 festen Startwerten gemittelt, gemeinsame Prioritäten-Rotation (Heiler heilen zuerst), Puppen treffen jede Sekunde mit 3 % des Grundlebens. Voller Ausrüstungssatz auf Charakterstufe (Werteprofile im Wechsel); „Startausrüstung“ = Flasche, Topfdeckel, Schleuder, Kutte. Talentpfad 0–2 über `pathBuild`, Stufe 1 ohne Spezialisierung.

Jede Rolle misst sich an ihrer Kennzahl: **Schaden** → Schaden/s, **Heilung** → Heilung/s (Ausstoß inkl. Überheilung), **Tank** → Schutz/s (verhinderter Schaden + Deckung). Zelle: Kennzahl (Abweichung vom Median der Rolle auf dieser Stufe × Ausrüstung). ⚑ = mehr als 15 % daneben (ab Stufe 5).

## Überblick

273 von 900 Messungen liegen mehr als 15 % neben dem Median ihrer Rolle.

## Ausrüstung: Startausrüstung

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 59 (-2.3 %) | 101 (-9 %) | 107 (-21.2 %) ⚑ | 125 (-22 %) ⚑ | 143 (-19.4 %) ⚑ | 181 (-15.5 %) ⚑ |
| dieter-brawl | 1 | 59 (-2.3 %) | 114 (+3.2 %) | 149 (+9.6 %) | 187 (+16.9 %) ⚑ | 208 (+17.3 %) ⚑ | 246 (+14.6 %) |
| dieter-brawl | 2 | 59 (-2.3 %) | 110 (-0.1 %) | 126 (-7.7 %) | 133 (-16.6 %) ⚑ | 159 (-10.5 %) | 189 (-11.7 %) |
| baerbel-feedback | 0 | 61 (0 %) | 131 (+18.3 %) ⚑ | 145 (+6.7 %) | 143 (-10.8 %) | 152 (-14.4 %) | 165 (-23 %) ⚑ |
| baerbel-feedback | 1 | 61 (0 %) | 141 (+27.4 %) ⚑ | 136 (0 %) | 145 (-9.4 %) | 147 (-17.1 %) ⚑ | 163 (-23.9 %) ⚑ |
| baerbel-feedback | 2 | 61 (0 %) | 146 (+31.7 %) ⚑ | 180 (+32.5 %) ⚑ | 193 (+20.9 %) ⚑ | 202 (+13.4 %) | 216 (+0.6 %) |
| baerbel-stage | 0 | 61 (0 %) | 111 (0 %) | 135 (-0.8 %) | 170 (+6.4 %) | 181 (+1.7 %) | 220 (+2.4 %) |
| baerbel-stage | 1 | 61 (0 %) | 127 (+14.6 %) | 154 (+13.1 %) | 174 (+8.6 %) | 193 (+8.8 %) | 215 (0 %) |
| baerbel-stage | 2 | 61 (0 %) | 118 (+7.1 %) | 128 (-5.7 %) | 147 (-8.3 %) | 155 (-12.9 %) | 181 (-15.6 %) ⚑ |
| kevin-fuse | 0 | 50 (-16.9 %) | 107 (-3.3 %) | 124 (-8.8 %) | 126 (-21 %) ⚑ | 135 (-24.2 %) ⚑ | 201 (-6.4 %) |
| kevin-fuse | 1 | 50 (-16.9 %) | 108 (-2.1 %) | 133 (-2.3 %) | 170 (+6.1 %) | 193 (+8.4 %) | 247 (+15 %) ⚑ |
| kevin-fuse | 2 | 50 (-16.9 %) | 123 (+11.4 %) | 142 (+4.7 %) | 162 (+1.2 %) | 170 (-4.4 %) | 201 (-6.5 %) |
| kevin-hunt | 0 | 50 (-16.9 %) | 134 (+21.5 %) ⚑ | 148 (+8.8 %) | 160 (0 %) | 176 (-0.7 %) | 187 (-12.7 %) |
| kevin-hunt | 1 | 50 (-16.9 %) | 120 (+8.4 %) | 136 (-0.1 %) | 154 (-3.7 %) | 155 (-13 %) | 185 (-14 %) |
| kevin-hunt | 2 | 50 (-16.9 %) | 125 (+12.9 %) | 154 (+12.9 %) | 195 (+21.6 %) ⚑ | 207 (+16.7 %) ⚑ | 232 (+8.3 %) |
| schorsch-flamme | 0 | 72 (+18.8 %) | 105 (-4.7 %) | 130 (-4.1 %) | 154 (-3.6 %) | 163 (-8.3 %) | 225 (+4.9 %) |
| schorsch-flamme | 1 | 72 (+18.8 %) | 101 (-8.8 %) | 123 (-9.6 %) | 150 (-6.5 %) | 150 (-15.4 %) ⚑ | 198 (-8 %) |
| schorsch-flamme | 2 | 72 (+18.8 %) | 104 (-6.2 %) | 139 (+2.3 %) | 150 (-6 %) | 178 (0 %) | 207 (-3.4 %) |
| kaethe-grand | 0 | 61 (+0.7 %) | 120 (+9 %) | 148 (+8.7 %) | 180 (+12.3 %) | 199 (+11.7 %) | 234 (+8.8 %) |
| kaethe-grand | 1 | 61 (+0.7 %) | 97 (-11.9 %) | 110 (-19.5 %) ⚑ | 145 (-9.4 %) | 184 (+3.3 %) | 230 (+7.3 %) |
| kaethe-grand | 2 | 61 (+0.7 %) | 105 (-4.9 %) | 135 (-1 %) | 163 (+2.1 %) | 205 (+15.5 %) ⚑ | 268 (+24.8 %) ⚑ |
| kaethe-falsch | 0 | 61 (+0.7 %) | 99 (-10.7 %) | 120 (-11.5 %) | 142 (-11.1 %) | 153 (-13.8 %) | 188 (-12.3 %) |
| kaethe-falsch | 1 | 61 (+0.7 %) | 95 (-13.8 %) | 158 (+16.2 %) ⚑ | 173 (+8 %) | 187 (+5.2 %) | 230 (+7.2 %) |
| kaethe-falsch | 2 | 61 (+0.7 %) | 104 (-5.6 %) | 152 (+11.5 %) | 183 (+14.4 %) | 199 (+11.8 %) | 230 (+7.2 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 31 (-19.3 %) ⚑ | 32 (-45.9 %) ⚑ | 45 (-46.8 %) ⚑ | 54 (-47.8 %) ⚑ | 55 (-56.7 %) ⚑ |
| dieter-brew | 1 | 0 (-100 %) | 38 (0 %) | 64 (+7.8 %) | 89 (+5 %) | 104 (0 %) | 128 (0 %) |
| dieter-brew | 2 | 0 (-100 %) | 30 (-22.2 %) ⚑ | 36 (-38.8 %) ⚑ | 42 (-50.5 %) ⚑ | 46 (-55.6 %) ⚑ | 57 (-55.3 %) ⚑ |
| baerbel-care | 0 | 0 (-100 %) | 55 (+45.6 %) ⚑ | 73 (+24.2 %) ⚑ | 93 (+10 %) | 109 (+5.2 %) | 138 (+8.2 %) |
| baerbel-care | 1 | 0 (-100 %) | 39 (+1.8 %) | 78 (+32.9 %) ⚑ | 115 (+35.5 %) ⚑ | 151 (+45.4 %) ⚑ | 203 (+59.5 %) ⚑ |
| baerbel-care | 2 | 0 (-100 %) | 42 (+11.3 %) | 59 (0 %) | 95 (+12.6 %) | 138 (+32.6 %) ⚑ | 172 (+34.6 %) ⚑ |
| schorsch-chef | 0 | 0 (-100 %) | 30 (-20.6 %) ⚑ | 58 (-2.2 %) | 66 (-22.6 %) ⚑ | 81 (-22.3 %) ⚑ | 123 (-3.7 %) |
| schorsch-chef | 1 | 0 (-100 %) | 24 (-37.2 %) ⚑ | 47 (-19.8 %) ⚑ | 62 (-27.3 %) ⚑ | 86 (-17.6 %) ⚑ | 122 (-4.1 %) |
| schorsch-chef | 2 | 0 (-100 %) | 27 (-29.8 %) ⚑ | 47 (-20.8 %) ⚑ | 64 (-24.2 %) ⚑ | 77 (-25.9 %) ⚑ | 105 (-17.3 %) ⚑ |
| kaethe-herz | 0 | 17 (+1610 %) | 42 (+11.9 %) | 80 (+36.3 %) ⚑ | 102 (+20.1 %) ⚑ | 125 (+20.7 %) ⚑ | 169 (+32.9 %) ⚑ |
| kaethe-herz | 1 | 17 (+1610 %) | 38 (-0.5 %) | 54 (-8.8 %) | 65 (-22.8 %) ⚑ | 79 (-24.3 %) ⚑ | 112 (-12.2 %) |
| kaethe-herz | 2 | 17 (+1610 %) | 43 (+12.4 %) | 63 (+6.8 %) | 85 (0 %) | 104 (0 %) | 136 (+6.9 %) |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 8 (+33.3 %) | 25 (-14.1 %) | 39 (0 %) | 44 (-8.5 %) | 52 (-9 %) | 65 (-13 %) |
| dieter-wall | 1 | 8 (+33.3 %) | 14 (-52.1 %) ⚑ | 22 (-42.1 %) ⚑ | 42 (-12 %) | 55 (-3 %) | 71 (-5.1 %) |
| dieter-wall | 2 | 8 (+33.3 %) | 14 (-53.4 %) ⚑ | 23 (-40.5 %) ⚑ | 34 (-30.3 %) ⚑ | 41 (-27.4 %) ⚑ | 63 (-15.8 %) ⚑ |
| kevin-iron | 0 | 3 (-50 %) | 29 (+0.7 %) | 39 (0 %) | 49 (+0.8 %) | 59 (+3.9 %) | 76 (+2.4 %) |
| kevin-iron | 1 | 3 (-50 %) | 30 (+4.1 %) | 39 (+2.1 %) | 48 (0 %) | 57 (0 %) | 75 (0 %) |
| kevin-iron | 2 | 3 (-50 %) | 26 (-9 %) | 35 (-10.4 %) | 43 (-11.2 %) | 54 (-5.3 %) | 72 (-3.8 %) |
| schorsch-rauch | 0 | 6 (0 %) | 29 (+0.3 %) | 41 (+5.2 %) | 52 (+8.1 %) | 61 (+6.7 %) | 79 (+5.6 %) |
| schorsch-rauch | 1 | 6 (0 %) | 30 (+2.1 %) | 42 (+9.6 %) | 53 (+10 %) | 63 (+11.1 %) | 83 (+11.3 %) |
| schorsch-rauch | 2 | 6 (0 %) | 29 (0 %) | 38 (-1.6 %) | 49 (+0.6 %) | 58 (+1.9 %) | 75 (+0.5 %) |

## Ausrüstung: ungewöhnlich

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 94 (-0.7 %) | 167 (-12.9 %) | 205 (-22.5 %) ⚑ | 265 (-26.4 %) ⚑ | 315 (-28 %) ⚑ | 449 (-22.7 %) ⚑ |
| dieter-brawl | 1 | 94 (-0.7 %) | 197 (+2.6 %) | 264 (0 %) | 369 (+2.7 %) | 429 (-2.1 %) | 666 (+14.6 %) |
| dieter-brawl | 2 | 94 (-0.7 %) | 186 (-3 %) | 243 (-7.9 %) | 305 (-15.1 %) ⚑ | 393 (-10.1 %) | 499 (-14.1 %) |
| baerbel-feedback | 0 | 98 (+3.3 %) | 200 (+4.3 %) | 255 (-3.6 %) | 315 (-12.3 %) | 385 (-12.1 %) | 502 (-13.7 %) |
| baerbel-feedback | 1 | 98 (+3.3 %) | 226 (+17.9 %) ⚑ | 263 (-0.5 %) | 316 (-12 %) | 365 (-16.5 %) ⚑ | 492 (-15.4 %) ⚑ |
| baerbel-feedback | 2 | 98 (+3.3 %) | 240 (+25.1 %) ⚑ | 306 (+15.7 %) ⚑ | 368 (+2.4 %) | 441 (+0.8 %) | 553 (-4.9 %) |
| baerbel-stage | 0 | 98 (+3.3 %) | 183 (-4.6 %) | 250 (-5.3 %) | 347 (-3.5 %) | 419 (-4.3 %) | 577 (-0.7 %) |
| baerbel-stage | 1 | 98 (+3.3 %) | 203 (+5.7 %) | 301 (+13.8 %) | 400 (+11.1 %) | 447 (+2.1 %) | 604 (+4 %) |
| baerbel-stage | 2 | 98 (+3.3 %) | 183 (-5 %) | 231 (-12.5 %) | 294 (-18.1 %) ⚑ | 349 (-20.4 %) ⚑ | 478 (-17.8 %) ⚑ |
| kevin-fuse | 0 | 84 (-11.4 %) | 177 (-8.1 %) | 229 (-13.3 %) | 286 (-20.5 %) ⚑ | 344 (-21.5 %) ⚑ | 511 (-12.1 %) |
| kevin-fuse | 1 | 84 (-11.4 %) | 168 (-12.5 %) | 258 (-2.3 %) | 372 (+3.4 %) | 482 (+10.2 %) | 669 (+15.1 %) ⚑ |
| kevin-fuse | 2 | 84 (-11.4 %) | 205 (+6.8 %) | 292 (+10.6 %) | 360 (0 %) | 449 (+2.5 %) | 601 (+3.4 %) |
| kevin-hunt | 0 | 84 (-11.4 %) | 199 (+3.4 %) | 263 (-0.4 %) | 340 (-5.3 %) | 415 (-5.1 %) | 581 (0 %) |
| kevin-hunt | 1 | 84 (-11.4 %) | 192 (0 %) | 252 (-4.7 %) | 334 (-7.2 %) | 402 (-8.1 %) | 538 (-7.4 %) |
| kevin-hunt | 2 | 84 (-11.4 %) | 199 (+3.7 %) | 274 (+3.8 %) | 374 (+4 %) | 453 (+3.5 %) | 584 (+0.5 %) |
| schorsch-flamme | 0 | 114 (+19.9 %) | 197 (+2.4 %) | 297 (+12.2 %) | 374 (+4 %) | 458 (+4.7 %) | 681 (+17.2 %) ⚑ |
| schorsch-flamme | 1 | 114 (+19.9 %) | 185 (-3.9 %) | 280 (+5.8 %) | 388 (+8 %) | 469 (+7.2 %) | 668 (+14.9 %) |
| schorsch-flamme | 2 | 114 (+19.9 %) | 200 (+4.3 %) | 282 (+6.5 %) | 372 (+3.3 %) | 444 (+1.5 %) | 656 (+12.9 %) |
| kaethe-grand | 0 | 95 (0 %) | 198 (+2.9 %) | 296 (+11.8 %) | 348 (-3.1 %) | 452 (+3.3 %) | 572 (-1.7 %) |
| kaethe-grand | 1 | 95 (0 %) | 160 (-16.5 %) ⚑ | 232 (-12.3 %) | 295 (-18 %) ⚑ | 390 (-10.8 %) | 569 (-2.1 %) |
| kaethe-grand | 2 | 95 (0 %) | 161 (-16 %) ⚑ | 276 (+4.4 %) | 407 (+13.3 %) | 488 (+11.4 %) | 669 (+15 %) ⚑ |
| kaethe-falsch | 0 | 95 (0 %) | 173 (-10.1 %) | 241 (-8.8 %) | 321 (-10.7 %) | 366 (-16.4 %) ⚑ | 522 (-10.1 %) |
| kaethe-falsch | 1 | 95 (0 %) | 168 (-12.6 %) | 302 (+14.3 %) | 404 (+12.3 %) | 503 (+14.9 %) | 623 (+7.1 %) |
| kaethe-falsch | 2 | 95 (0 %) | 185 (-3.7 %) | 281 (+6.2 %) | 363 (+0.9 %) | 438 (0 %) | 588 (+1.1 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 39 (-28.1 %) ⚑ | 48 (-53.9 %) ⚑ | 73 (-49.7 %) ⚑ | 97 (-48.9 %) ⚑ | 114 (-59.8 %) ⚑ |
| dieter-brew | 1 | 0 (-100 %) | 54 (0 %) | 92 (-11.5 %) | 113 (-21.8 %) ⚑ | 132 (-30.3 %) ⚑ | 174 (-38.7 %) ⚑ |
| dieter-brew | 2 | 0 (-100 %) | 42 (-22.1 %) ⚑ | 48 (-53.6 %) ⚑ | 61 (-57.7 %) ⚑ | 80 (-57.9 %) ⚑ | 113 (-60.2 %) ⚑ |
| baerbel-care | 0 | 0 (-100 %) | 62 (+13.1 %) | 68 (-34.6 %) ⚑ | 84 (-41.5 %) ⚑ | 97 (-49 %) ⚑ | 185 (-34.7 %) ⚑ |
| baerbel-care | 1 | 0 (-100 %) | 52 (-4.4 %) | 89 (-14.8 %) | 144 (-0.4 %) | 176 (-7.2 %) | 288 (+1.6 %) |
| baerbel-care | 2 | 0 (-100 %) | 52 (-3.7 %) | 81 (-22.3 %) ⚑ | 139 (-3.6 %) | 188 (-0.8 %) | 247 (-12.9 %) |
| schorsch-chef | 0 | 0 (-100 %) | 60 (+10.5 %) | 129 (+24.4 %) ⚑ | 149 (+3.6 %) | 203 (+6.9 %) | 315 (+11 %) |
| schorsch-chef | 1 | 0 (-100 %) | 45 (-16.7 %) ⚑ | 116 (+11.4 %) | 148 (+2.8 %) | 209 (+10.1 %) | 318 (+12.2 %) |
| schorsch-chef | 2 | 0 (-100 %) | 50 (-7.4 %) | 105 (+1.4 %) | 152 (+5.4 %) | 190 (0 %) | 284 (0 %) |
| kaethe-herz | 0 | 23 (+2160 %) | 67 (+22.8 %) ⚑ | 121 (+16 %) ⚑ | 173 (+19.9 %) ⚑ | 219 (+15.8 %) ⚑ | 311 (+9.6 %) |
| kaethe-herz | 1 | 23 (+2160 %) | 62 (+14.2 %) | 104 (0 %) | 144 (0 %) | 199 (+5.2 %) | 272 (-4.1 %) |
| kaethe-herz | 2 | 23 (+2160 %) | 65 (+18.6 %) ⚑ | 117 (+12.3 %) | 172 (+18.9 %) ⚑ | 228 (+20.3 %) ⚑ | 301 (+6 %) |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 11 (+37.5 %) | 29 (+6.9 %) | 42 (+20.5 %) ⚑ | 53 (+7.3 %) | 63 (+8.6 %) | 84 (+8 %) |
| dieter-wall | 1 | 11 (+37.5 %) | 18 (-33.9 %) ⚑ | 30 (-14.1 %) | 52 (+5.9 %) | 63 (+8.1 %) | 82 (+5 %) |
| dieter-wall | 2 | 11 (+37.5 %) | 17 (-37.6 %) ⚑ | 26 (-23.9 %) ⚑ | 42 (-14.6 %) | 50 (-13.6 %) | 78 (0 %) |
| kevin-iron | 0 | 7 (-12.5 %) | 27 (-0.4 %) | 34 (-1.7 %) | 42 (-15.2 %) ⚑ | 51 (-12.6 %) | 69 (-11.8 %) |
| kevin-iron | 1 | 7 (-12.5 %) | 27 (0 %) | 35 (0 %) | 43 (-12.2 %) | 52 (-10.7 %) | 69 (-11.8 %) |
| kevin-iron | 2 | 7 (-12.5 %) | 27 (-3.3 %) | 34 (-1.7 %) | 42 (-15.2 %) ⚑ | 51 (-12.9 %) | 63 (-19.1 %) ⚑ |
| schorsch-rauch | 0 | 8 (0 %) | 30 (+10.9 %) | 40 (+14.4 %) | 49 (0 %) | 58 (0 %) | 77 (-1 %) |
| schorsch-rauch | 1 | 8 (0 %) | 30 (+10.9 %) | 41 (+18.7 %) ⚑ | 51 (+3.4 %) | 60 (+3.6 %) | 80 (+2.1 %) |
| schorsch-rauch | 2 | 8 (0 %) | 30 (+10.9 %) | 41 (+18.7 %) ⚑ | 51 (+3.2 %) | 60 (+3.4 %) | 80 (+2.1 %) |

## Ausrüstung: selten

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 111 (0 %) | 208 (-9.8 %) | 226 (-26.7 %) ⚑ | 312 (-27.8 %) ⚑ | 388 (-25.7 %) ⚑ | 536 (-20.7 %) ⚑ |
| dieter-brawl | 1 | 111 (0 %) | 246 (+6.6 %) | 295 (-4.2 %) | 456 (+5.5 %) | 526 (+0.6 %) | 676 (0 %) |
| dieter-brawl | 2 | 111 (0 %) | 230 (0 %) | 287 (-6.8 %) | 354 (-18 %) ⚑ | 442 (-15.5 %) ⚑ | 607 (-10.2 %) |
| baerbel-feedback | 0 | 113 (+1.3 %) | 244 (+5.8 %) | 295 (-3.9 %) | 370 (-14.4 %) | 420 (-19.7 %) ⚑ | 585 (-13.6 %) |
| baerbel-feedback | 1 | 113 (+1.3 %) | 272 (+17.9 %) ⚑ | 305 (-0.9 %) | 393 (-9.1 %) | 423 (-19.1 %) ⚑ | 581 (-14.2 %) |
| baerbel-feedback | 2 | 113 (+1.3 %) | 292 (+26.5 %) ⚑ | 348 (+13.2 %) | 460 (+6.3 %) | 528 (+1.1 %) | 632 (-6.5 %) |
| baerbel-stage | 0 | 113 (+1.3 %) | 218 (-5.6 %) | 294 (-4.3 %) | 399 (-7.8 %) | 476 (-9 %) | 656 (-3 %) |
| baerbel-stage | 1 | 113 (+1.3 %) | 234 (+1.5 %) | 344 (+11.8 %) | 440 (+1.9 %) | 534 (+2.2 %) | 730 (+7.9 %) |
| baerbel-stage | 2 | 113 (+1.3 %) | 214 (-7.3 %) | 284 (-7.7 %) | 344 (-20.4 %) ⚑ | 399 (-23.7 %) ⚑ | 579 (-14.4 %) |
| kevin-fuse | 0 | 98 (-12.5 %) | 202 (-12.4 %) | 267 (-13.1 %) | 345 (-20.2 %) ⚑ | 408 (-22 %) ⚑ | 631 (-6.7 %) |
| kevin-fuse | 1 | 98 (-12.5 %) | 208 (-9.9 %) | 298 (-3 %) | 458 (+6 %) | 565 (+8.2 %) | 767 (+13.3 %) |
| kevin-fuse | 2 | 98 (-12.5 %) | 258 (+12.1 %) | 335 (+8.9 %) | 447 (+3.4 %) | 504 (-3.7 %) | 730 (+7.9 %) |
| kevin-hunt | 0 | 98 (-12.5 %) | 243 (+5.4 %) | 311 (+1.1 %) | 402 (-6.9 %) | 486 (-7.1 %) | 685 (+1.2 %) |
| kevin-hunt | 1 | 98 (-12.5 %) | 230 (0 %) | 295 (-4 %) | 411 (-5 %) | 485 (-7.3 %) | 641 (-5.2 %) |
| kevin-hunt | 2 | 98 (-12.5 %) | 227 (-1.5 %) | 308 (0 %) | 430 (-0.5 %) | 516 (-1.2 %) | 667 (-1.4 %) |
| schorsch-flamme | 0 | 127 (+14.3 %) | 251 (+8.9 %) | 363 (+18 %) ⚑ | 499 (+15.5 %) ⚑ | 607 (+16.1 %) ⚑ | 784 (+15.8 %) ⚑ |
| schorsch-flamme | 1 | 127 (+14.3 %) | 244 (+5.8 %) | 324 (+5.4 %) | 493 (+14.1 %) | 566 (+8.2 %) | 810 (+19.8 %) ⚑ |
| schorsch-flamme | 2 | 127 (+14.3 %) | 236 (+2.5 %) | 337 (+9.5 %) | 452 (+4.6 %) | 523 (0 %) | 765 (+13.1 %) |
| kaethe-grand | 0 | 101 (-9 %) | 237 (+2.7 %) | 337 (+9.7 %) | 432 (0 %) | 561 (+7.3 %) | 724 (+7.1 %) |
| kaethe-grand | 1 | 101 (-9 %) | 199 (-13.8 %) | 276 (-10.2 %) | 385 (-11 %) | 524 (+0.2 %) | 676 (-0.1 %) |
| kaethe-grand | 2 | 101 (-9 %) | 197 (-14.6 %) | 325 (+5.6 %) | 458 (+6 %) | 571 (+9.2 %) | 832 (+23 %) ⚑ |
| kaethe-falsch | 0 | 101 (-9 %) | 205 (-11.1 %) | 276 (-10.4 %) | 402 (-7.1 %) | 456 (-12.7 %) | 594 (-12.1 %) |
| kaethe-falsch | 1 | 101 (-9 %) | 212 (-7.9 %) | 354 (+15.1 %) ⚑ | 498 (+15.1 %) ⚑ | 558 (+6.7 %) | 794 (+17.4 %) ⚑ |
| kaethe-falsch | 2 | 101 (-9 %) | 227 (-1.5 %) | 333 (+8.2 %) | 472 (+9.1 %) | 539 (+3.1 %) | 730 (+8 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 37 (-41.5 %) ⚑ | 54 (-56.6 %) ⚑ | 79 (-55.7 %) ⚑ | 105 (-55 %) ⚑ | 131 (-63.2 %) ⚑ |
| dieter-brew | 1 | 0 (-100 %) | 55 (-12.3 %) | 104 (-16.3 %) ⚑ | 142 (-19.8 %) ⚑ | 133 (-43.1 %) ⚑ | 178 (-49.9 %) ⚑ |
| dieter-brew | 2 | 0 (-100 %) | 47 (-25.8 %) ⚑ | 54 (-56.5 %) ⚑ | 69 (-60.9 %) ⚑ | 88 (-62.3 %) ⚑ | 126 (-64.4 %) ⚑ |
| baerbel-care | 0 | 0 (-100 %) | 66 (+5.7 %) | 81 (-34.9 %) ⚑ | 92 (-48 %) ⚑ | 116 (-50.4 %) ⚑ | 211 (-40.5 %) ⚑ |
| baerbel-care | 1 | 0 (-100 %) | 48 (-23.8 %) ⚑ | 91 (-26.7 %) ⚑ | 137 (-22.9 %) ⚑ | 159 (-31.8 %) ⚑ | 294 (-17.2 %) ⚑ |
| baerbel-care | 2 | 0 (-100 %) | 53 (-15.8 %) ⚑ | 87 (-29.6 %) ⚑ | 156 (-12 %) | 202 (-13.3 %) | 261 (-26.4 %) ⚑ |
| schorsch-chef | 0 | 0 (-100 %) | 72 (+15 %) | 154 (+23.6 %) ⚑ | 195 (+9.9 %) | 247 (+6.1 %) | 363 (+2.3 %) |
| schorsch-chef | 1 | 0 (-100 %) | 57 (-9.4 %) | 136 (+9.2 %) | 190 (+7.2 %) | 262 (+12.5 %) | 381 (+7.3 %) |
| schorsch-chef | 2 | 0 (-100 %) | 63 (0 %) | 126 (+1 %) | 195 (+9.9 %) | 233 (0 %) | 358 (+0.8 %) |
| kaethe-herz | 0 | 26 (+2470 %) | 75 (+20.1 %) ⚑ | 155 (+25.1 %) ⚑ | 212 (+19.3 %) ⚑ | 270 (+16 %) ⚑ | 382 (+7.7 %) |
| kaethe-herz | 1 | 26 (+2470 %) | 70 (+11.3 %) | 124 (0 %) | 177 (0 %) | 247 (+5.8 %) | 355 (0 %) |
| kaethe-herz | 2 | 26 (+2470 %) | 73 (+16.3 %) ⚑ | 136 (+9.7 %) | 217 (+22.4 %) ⚑ | 254 (+9.1 %) | 372 (+4.9 %) |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 11 (+37.5 %) | 30 (+11.9 %) | 43 (+22.1 %) ⚑ | 52 (+5.7 %) | 63 (+9 %) | 84 (+8.9 %) |
| dieter-wall | 1 | 11 (+37.5 %) | 19 (-28 %) ⚑ | 29 (-15.8 %) ⚑ | 51 (+3 %) | 60 (+5 %) | 81 (+4.9 %) |
| dieter-wall | 2 | 11 (+37.5 %) | 18 (-33.2 %) ⚑ | 26 (-25.2 %) ⚑ | 42 (-14 %) | 52 (-10.3 %) | 77 (0 %) |
| kevin-iron | 0 | 7 (-12.5 %) | 27 (0 %) | 34 (-1.4 %) | 42 (-14.2 %) | 49 (-14.4 %) | 66 (-14.9 %) |
| kevin-iron | 1 | 7 (-12.5 %) | 27 (-0.4 %) | 35 (0 %) | 43 (-12 %) | 51 (-12 %) | 67 (-13.6 %) |
| kevin-iron | 2 | 7 (-12.5 %) | 26 (-4.5 %) | 34 (-3.2 %) | 40 (-19.5 %) ⚑ | 48 (-17 %) ⚑ | 62 (-19.5 %) ⚑ |
| schorsch-rauch | 0 | 8 (0 %) | 30 (+11.9 %) | 40 (+13.8 %) | 49 (0 %) | 58 (0 %) | 76 (-1.3 %) |
| schorsch-rauch | 1 | 8 (0 %) | 30 (+11.9 %) | 41 (+17.5 %) ⚑ | 50 (+1.4 %) | 58 (+1.4 %) | 77 (+0.1 %) |
| schorsch-rauch | 2 | 8 (0 %) | 30 (+11.9 %) | 41 (+17.5 %) ⚑ | 50 (+1.4 %) | 58 (+1.4 %) | 77 (+0.1 %) |

## Ausrüstung: episch

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 146 (+0.8 %) | 229 (-11.6 %) | 294 (-21.7 %) ⚑ | 383 (-27.3 %) ⚑ | 461 (-28 %) ⚑ | 639 (-21.1 %) ⚑ |
| dieter-brawl | 1 | 146 (+0.8 %) | 255 (-1.4 %) | 376 (0 %) | 527 (0 %) | 648 (+1.3 %) | 851 (+5.1 %) |
| dieter-brawl | 2 | 146 (+0.8 %) | 256 (-1.1 %) | 316 (-15.8 %) ⚑ | 406 (-22.9 %) ⚑ | 525 (-17.9 %) ⚑ | 648 (-20 %) ⚑ |
| baerbel-feedback | 0 | 145 (0 %) | 279 (+7.6 %) | 334 (-11.2 %) | 459 (-13 %) | 532 (-16.8 %) ⚑ | 742 (-8.4 %) |
| baerbel-feedback | 1 | 145 (0 %) | 315 (+21.8 %) ⚑ | 362 (-3.7 %) | 487 (-7.6 %) | 494 (-22.7 %) ⚑ | 733 (-9.5 %) |
| baerbel-feedback | 2 | 145 (0 %) | 329 (+27.1 %) ⚑ | 432 (+15 %) ⚑ | 589 (+11.7 %) | 645 (+0.9 %) | 740 (-8.7 %) |
| baerbel-stage | 0 | 145 (0 %) | 259 (0 %) | 319 (-15 %) | 466 (-11.5 %) | 541 (-15.4 %) ⚑ | 755 (-6.8 %) |
| baerbel-stage | 1 | 145 (0 %) | 278 (+7.4 %) | 391 (+4.2 %) | 546 (+3.5 %) | 663 (+3.6 %) | 861 (+6.3 %) |
| baerbel-stage | 2 | 145 (0 %) | 259 (+0.1 %) | 309 (-17.6 %) ⚑ | 434 (-17.7 %) ⚑ | 507 (-20.6 %) ⚑ | 745 (-8.1 %) |
| kevin-fuse | 0 | 129 (-10.7 %) | 246 (-5.1 %) | 314 (-16.4 %) ⚑ | 419 (-20.5 %) ⚑ | 494 (-22.7 %) ⚑ | 725 (-10.4 %) |
| kevin-fuse | 1 | 129 (-10.7 %) | 240 (-7.4 %) | 344 (-8.4 %) | 572 (+8.5 %) | 639 (0 %) | 865 (+6.8 %) |
| kevin-fuse | 2 | 129 (-10.7 %) | 297 (+14.7 %) | 393 (+4.7 %) | 577 (+9.4 %) | 650 (+1.7 %) | 904 (+11.7 %) |
| kevin-hunt | 0 | 129 (-10.7 %) | 257 (-0.6 %) | 382 (+1.8 %) | 486 (-7.9 %) | 609 (-4.7 %) | 795 (-1.8 %) |
| kevin-hunt | 1 | 129 (-10.7 %) | 248 (-4 %) | 345 (-8.1 %) | 456 (-13.5 %) | 557 (-13 %) | 763 (-5.8 %) |
| kevin-hunt | 2 | 129 (-10.7 %) | 268 (+3.4 %) | 379 (+0.9 %) | 505 (-4.1 %) | 626 (-2 %) | 810 (0 %) |
| schorsch-flamme | 0 | 152 (+5.2 %) | 278 (+7.3 %) | 432 (+14.9 %) | 624 (+18.5 %) ⚑ | 714 (+11.7 %) | 1003 (+23.8 %) ⚑ |
| schorsch-flamme | 1 | 152 (+5.2 %) | 286 (+10.4 %) | 401 (+6.9 %) | 597 (+13.3 %) | 705 (+10.3 %) | 1001 (+23.6 %) ⚑ |
| schorsch-flamme | 2 | 152 (+5.2 %) | 281 (+8.6 %) | 410 (+9.2 %) | 577 (+9.5 %) | 676 (+5.7 %) | 930 (+14.9 %) |
| kaethe-grand | 0 | 125 (-13.5 %) | 268 (+3.6 %) | 400 (+6.4 %) | 553 (+4.8 %) | 674 (+5.5 %) | 992 (+22.5 %) ⚑ |
| kaethe-grand | 1 | 125 (-13.5 %) | 239 (-7.7 %) | 326 (-13.2 %) | 460 (-12.8 %) | 582 (-8.9 %) | 797 (-1.7 %) |
| kaethe-grand | 2 | 125 (-13.5 %) | 234 (-9.7 %) | 373 (-0.7 %) | 575 (+9.2 %) | 704 (+10.1 %) | 1004 (+23.9 %) ⚑ |
| kaethe-falsch | 0 | 125 (-13.5 %) | 240 (-7.2 %) | 345 (-8.1 %) | 483 (-8.3 %) | 539 (-15.6 %) ⚑ | 762 (-5.9 %) |
| kaethe-falsch | 1 | 125 (-13.5 %) | 237 (-8.5 %) | 451 (+20 %) ⚑ | 557 (+5.7 %) | 693 (+8.3 %) | 1015 (+25.3 %) ⚑ |
| kaethe-falsch | 2 | 125 (-13.5 %) | 249 (-3.7 %) | 400 (+6.6 %) | 549 (+4.1 %) | 676 (+5.8 %) | 911 (+12.5 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 46 (-38.6 %) ⚑ | 55 (-65.6 %) ⚑ | 97 (-56.6 %) ⚑ | 129 (-56.8 %) ⚑ | 172 (-61.9 %) ⚑ |
| dieter-brew | 1 | 0 (-100 %) | 65 (-14 %) | 115 (-28.4 %) ⚑ | 152 (-31.6 %) ⚑ | 150 (-49.7 %) ⚑ | 204 (-54.8 %) ⚑ |
| dieter-brew | 2 | 0 (-100 %) | 54 (-28.6 %) ⚑ | 61 (-62.2 %) ⚑ | 80 (-64.2 %) ⚑ | 104 (-65.1 %) ⚑ | 137 (-69.5 %) ⚑ |
| baerbel-care | 0 | 0 (-100 %) | 76 (0 %) | 72 (-55.3 %) ⚑ | 96 (-56.8 %) ⚑ | 113 (-62.1 %) ⚑ | 248 (-45 %) ⚑ |
| baerbel-care | 1 | 0 (-100 %) | 55 (-27.5 %) ⚑ | 96 (-40.3 %) ⚑ | 159 (-28.6 %) ⚑ | 185 (-38 %) ⚑ | 359 (-20.3 %) ⚑ |
| baerbel-care | 2 | 0 (-100 %) | 63 (-16.4 %) ⚑ | 94 (-41.8 %) ⚑ | 175 (-21.4 %) ⚑ | 236 (-20.6 %) ⚑ | 317 (-29.7 %) ⚑ |
| schorsch-chef | 0 | 0 (-100 %) | 93 (+22.5 %) ⚑ | 198 (+22.8 %) ⚑ | 251 (+12.6 %) | 347 (+16.6 %) ⚑ | 524 (+16.2 %) ⚑ |
| schorsch-chef | 1 | 0 (-100 %) | 71 (-5.7 %) | 180 (+11.7 %) | 253 (+13.7 %) | 341 (+14.5 %) | 570 (+26.4 %) ⚑ |
| schorsch-chef | 2 | 0 (-100 %) | 86 (+13.1 %) | 165 (+2.6 %) | 243 (+9.2 %) | 297 (0 %) | 495 (+9.8 %) |
| kaethe-herz | 0 | 38 (+3730 %) | 99 (+30.4 %) ⚑ | 187 (+15.8 %) ⚑ | 277 (+24.5 %) ⚑ | 368 (+23.9 %) ⚑ | 544 (+20.6 %) ⚑ |
| kaethe-herz | 1 | 38 (+3730 %) | 91 (+19.8 %) ⚑ | 161 (0 %) | 223 (0 %) | 313 (+5.1 %) | 451 (0 %) |
| kaethe-herz | 2 | 38 (+3730 %) | 96 (+26.6 %) ⚑ | 168 (+4 %) | 273 (+22.5 %) ⚑ | 371 (+24.6 %) ⚑ | 516 (+14.6 %) |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 12 (+20 %) | 29 (+8.9 %) | 41 (+21.1 %) ⚑ | 51 (+6.7 %) | 60 (+6.6 %) | 84 (+12.4 %) |
| dieter-wall | 1 | 12 (+20 %) | 21 (-21.6 %) ⚑ | 32 (-6.1 %) | 49 (+2.5 %) | 60 (+6.2 %) | 76 (+1.9 %) |
| dieter-wall | 2 | 12 (+20 %) | 20 (-25.3 %) ⚑ | 28 (-17.5 %) ⚑ | 42 (-12.9 %) | 53 (-5.3 %) | 74 (-0.8 %) |
| kevin-iron | 0 | 9 (-10 %) | 27 (-1.1 %) | 34 (0 %) | 42 (-12.5 %) | 49 (-12.1 %) | 65 (-13 %) |
| kevin-iron | 1 | 9 (-10 %) | 27 (0 %) | 34 (-0.6 %) | 42 (-11.7 %) | 50 (-11.4 %) | 65 (-13.5 %) |
| kevin-iron | 2 | 9 (-10 %) | 25 (-8.6 %) | 32 (-5.6 %) | 40 (-16.9 %) ⚑ | 47 (-15.7 %) ⚑ | 63 (-15.8 %) ⚑ |
| schorsch-rauch | 0 | 10 (0 %) | 29 (+6.7 %) | 39 (+13.7 %) | 48 (0 %) | 56 (0 %) | 75 (0 %) |
| schorsch-rauch | 1 | 10 (0 %) | 29 (+6.7 %) | 39 (+15.2 %) ⚑ | 49 (+1.3 %) | 57 (+1.2 %) | 76 (+1.3 %) |
| schorsch-rauch | 2 | 10 (0 %) | 29 (+6.7 %) | 39 (+15.2 %) ⚑ | 49 (+1.3 %) | 57 (+1.2 %) | 76 (+1.3 %) |

## Zerlegung (je Pfad, Ausrüstung selten)

### dieter-wall · Pfad 0 · Stufe 10 ·237 Schaden/s · Ausrüstung +122.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -0.2 Schaden/s · Wumms 1.1 Schaden/s · Taktgefühl 0.3 Schaden/s · 0.1 verhindert/s · Bastelgrips 0.3 Schaden/s · Dicke Haut 0.5 Schaden/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 25.6 % · Pfand auf die Zwölf 21.2 % · Rausschmiss 13.8 % · Rausschmiss 12.9 % · Autoangriff · Flasche kreist 12.6 % · Kronkorken-Kelle 9.6 % · Du schuldest mir Pfand! 4.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Ruhe im Laden 0 % · Tür bleibt zu 0 % · Verlängertes Hausverbot 0 % · Deckelwirtschaft gebunden · Leergut stapeln gebunden · Dicke Haut vom Hausbier gebunden · Deckel beim Wirt gebunden · Pfand zurück gebunden · Tresenkante gebunden

### dieter-wall · Pfad 1 · Stufe 10 ·227 Schaden/s · Ausrüstung +119 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1 Schaden/s · Taktgefühl 2.2 Schaden/s · Bastelgrips -0.1 Schaden/s · Dicke Haut 0.1 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 37.5 % · Pfand auf die Zwölf 19.2 % · Autoangriff · Flasche kreist 14.8 % · Rausschmiss 12.4 % · Kronkorken-Kelle 10.3 % · Du schuldest mir Pfand! 5.4 % · Rausschmiss 0.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kurzer Prozess +1.7 % · Klappe zu, Pegel hoch 0 % · Dritter Deckel gratis 0 % · Erst gucken, dann hauen gebunden · Deckel-Reflex gebunden · Doppelte Türkontrolle gebunden · Keiner drängelt gebunden · Konterschlag gebunden · Nachtreten gebunden

### dieter-wall · Pfad 2 · Stufe 10 ·249 Schaden/s · Ausrüstung +137 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0.3 Schaden/s · Wumms 1 Schaden/s · Taktgefühl 1.3 Schaden/s · Bastelgrips 1 Schaden/s · -0.1 verhindert/s · Dicke Haut 0.3 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 55.6 % · Pfand auf die Zwölf 14.3 % · Rausschmiss 12 % · Autoangriff · Flasche kreist 10.3 % · Kronkorken-Kelle 4.2 % · Du schuldest mir Pfand! 3.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Platzverweis +2.8 % · Räumungsklage 0 % · Breite Absperrung 0 % · Breite Schultern gebunden · Böllerpfand gebunden · Runde Sache gebunden · Ohne zu zahlen raus gebunden · Absperrband gebunden · Heimspiel gebunden

### dieter-wall · Pfad 0 · Stufe 20 ·377 Schaden/s · Ausrüstung +201 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1 Schaden/s · Taktgefühl 0 Schaden/s · Bastelgrips 0 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 32.1 % · Rausschmiss 22.6 % · Pfand auf die Zwölf 18.6 % · Autoangriff · Flasche kreist 11.8 % · Kronkorken-Kelle 11.7 % · Du schuldest mir Pfand! 3.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Hausverbot für alle +5.4 % · Tresenkante +4.3 % · Leergut stapeln +1 % · Dicke Haut vom Hausbier 0 % · Deckel beim Wirt 0 % · Pfand zurück 0 % · Ruhe im Laden 0 % · Verlängertes Hausverbot 0 % · Erst gucken, dann hauen 0 % · Breite Schultern 0 % · Deckel-Reflex 0 % · Deckelwirtschaft gebunden · Tür bleibt zu gebunden

### dieter-wall · Pfad 1 · Stufe 20 ·367 Schaden/s · Ausrüstung +199.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0.2 Schaden/s · Wumms 1.3 Schaden/s · Taktgefühl -0.7 Schaden/s · Bastelgrips 0.9 Schaden/s · Dicke Haut 0.1 Schaden/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 33 % · Pfand auf die Zwölf 21.4 % · Kronkorken-Kelle 13.1 % · Autoangriff · Flasche kreist 12.9 % · Rausschmiss 10.2 % · Rausschmiss 5.7 % · Du schuldest mir Pfand! 3.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kurzer Prozess +3.4 % · Deckelwirtschaft +1.7 % · Leergut stapeln +0.6 % · Und tschüss! +0.4 % · Deckel-Reflex 0 % · Doppelte Türkontrolle 0 % · Keiner drängelt 0 % · Konterschlag 0 % · Nachtreten 0 % · Klappe zu, Pegel hoch 0 % · Breite Schultern 0 % · Erst gucken, dann hauen gebunden · Dritter Deckel gratis gebunden

### dieter-wall · Pfad 2 · Stufe 20 ·439 Schaden/s · Ausrüstung +222 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.3 Schaden/s · Taktgefühl 0.7 Schaden/s · Bastelgrips -1.8 Schaden/s · 0.2 verhindert/s · Dicke Haut 0.8 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 48.9 % · Rausschmiss 23.2 % · Pfand auf die Zwölf 12.5 % · Autoangriff · Flasche kreist 8.8 % · Kronkorken-Kelle 4.3 % · Du schuldest mir Pfand! 2.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Böllerpfand +13.5 % · Räumungsklage +12.9 % · Alle raus! +12.4 % · Deckelwirtschaft +11.2 % · Runde Sache +7.1 % · Absperrband +1.5 % · Ohne zu zahlen raus 0 % · Heimspiel 0 % · Breite Absperrung 0 % · Erst gucken, dann hauen 0 % · Deckel-Reflex 0 % · Breite Schultern gebunden · Platzverweis gebunden

### dieter-brawl · Pfad 0 · Stufe 10 ·226 Schaden/s · Ausrüstung +110.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0.6 Schaden/s · Wumms 2.6 Schaden/s · Taktgefühl 0.8 Schaden/s · Bastelgrips 0.2 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 35.7 % · Abriss 16.8 % · Pfand auf die Zwölf 16.7 % · Kronkorken-Kelle 13.8 % · Autoangriff · Flasche kreist 12.4 % · Du schuldest mir Pfand! 4.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kurzer Kater 0 % · Kater verdrängen 0 % · Durchhalten 0 % · Noch einen auf die Zwölf gebunden · Angeschlagen, nicht besoffen gebunden · Wut im Bauch gebunden · Deckel, Kelle, Pegel gebunden · Sitzfleisch gebunden · Konterbrezel-Reserve gebunden

### dieter-brawl · Pfad 1 · Stufe 10 ·295 Schaden/s · Ausrüstung +97.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2 Schaden/s · Taktgefühl 0 Schaden/s · Bastelgrips -0.2 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 30.3 % · Pfand auf die Zwölf 24.3 % · Kronkorken-Kelle 14.5 % · Autoangriff · Flasche kreist 14 % · Abriss 10.9 % · Du schuldest mir Pfand! 6.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kneipenschreck 0 % · Abriss mit Ansage -0.6 % · Zugabe! -7.4 % · Erste Runde gebunden · Kellenwut gebunden · Volle Kante gebunden · Volltreffer gebunden · Vorglühen gebunden · Dreier-Kelle gebunden

### dieter-brawl · Pfad 2 · Stufe 10 ·287 Schaden/s · Ausrüstung +128.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.8 Schaden/s · Taktgefühl 0.3 Schaden/s · Bastelgrips 0.6 Schaden/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 28.8 % · Pfand auf die Zwölf 23 % · Abriss 18.5 % · Abriss 10.4 % · Autoangriff · Flasche kreist 9.4 % · Kronkorken-Kelle 7.1 % · Du schuldest mir Pfand! 2.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Wurf in die Runde +8.1 % · Weiter zum Nächsten 0 % · Sprungbrett 0 % · Zechprellerrunde gebunden · Flaschenpost gebunden · Rundumschlag gebunden · Hinterher! gebunden · Tresensprung gebunden · Nachschlag gebunden

### dieter-brawl · Pfad 0 · Stufe 20 ·388 Schaden/s · Ausrüstung +171 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.1 Schaden/s · 0.1 Heilung/s · Taktgefühl 0.6 Schaden/s · Bastelgrips 0 Schaden/s · 0.1 Heilung/s · Dicke Haut -0.1 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 35.2 % · Pfand auf die Zwölf 19.8 % · Abriss 14.9 % · Kronkorken-Kelle 13.3 % · Autoangriff · Flasche kreist 12.6 % · Du schuldest mir Pfand! 4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kellenwut +5.5 % · Erste Runde +4.4 % · Wut im Bauch +1.9 % · Angeschlagen, nicht besoffen 0 % · Deckel, Kelle, Pegel 0 % · Sitzfleisch 0 % · Konterbrezel-Reserve 0 % · Kurzer Kater 0 % · Durchhalten 0 % · Zechprellerrunde 0 % · Zweite Luft -0.5 % · Noch einen auf die Zwölf gebunden · Kater verdrängen gebunden

### dieter-brawl · Pfad 1 · Stufe 20 ·526 Schaden/s · Ausrüstung +152.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.4 Schaden/s · Taktgefühl 2 Schaden/s · Bastelgrips 0 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 29.6 % · Abriss 19 % · Pfand auf die Zwölf 19 % · Kronkorken-Kelle 18.2 % · Autoangriff · Flasche kreist 11.3 % · Du schuldest mir Pfand! 3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Blitzabriss +6.5 % · Volle Kante +0.8 % · Vorglühen +0.7 % · Dreier-Kelle +0.3 % · Zugabe! +0.3 % · Kneipenschreck 0 % · Noch einen auf die Zwölf 0 % · Zechprellerrunde 0 % · Angeschlagen, nicht besoffen 0 % · Volltreffer -0.5 % · Kellenwut -7.3 % · Erste Runde gebunden · Abriss mit Ansage gebunden

### dieter-brawl · Pfad 2 · Stufe 20 ·442 Schaden/s · Ausrüstung +177.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.6 Schaden/s · Taktgefühl 0.7 Schaden/s · Bastelgrips 0 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Böller unterm Biertisch 29 % · Pfand auf die Zwölf 23.7 % · Abriss 15.6 % · Kronkorken-Kelle 10.8 % · Autoangriff · Flasche kreist 9.5 % · Abriss 9.3 % · Du schuldest mir Pfand! 2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nachschlag +2.4 % · Erste Runde +1.9 % · Wurf in die Runde +1.7 % · Rundumschlag 0 % · Hinterher! 0 % · Tresensprung 0 % · Sprungbrett 0 % · Kein Feierabend 0 % · Noch einen auf die Zwölf 0 % · Kellenwut -0.3 % · Flaschenpost -1.7 % · Zechprellerrunde gebunden · Weiter zum Nächsten gebunden

### dieter-brew · Pfad 0 · Stufe 10 ·227 Schaden/s · Ausrüstung +116.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1 Schaden/s · 0.1 Heilung/s · Taktgefühl 2.5 Schaden/s · Bastelgrips -0.1 Schaden/s · 0.3 Heilung/s · Dicke Haut 0.2 Schaden/s · 0.1 Heilung/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Pfand auf die Zwölf 51.1 % · Autoangriff · Flasche kreist 24.5 % · Fassanstich 14.8 % · Du schuldest mir Pfand! 6.9 % · Kronkorken-Kelle 2.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Zapfen im Gehen 0 % · Frisch gezapft 0 % · Nächste Runde -3.7 % · Pils zuerst gebunden · Nachfüllen gebunden · Schaumkrone gebunden · Bar auf die Hand gebunden · Drittes Fass gebunden · Zapfhahn auf gebunden

### dieter-brew · Pfad 1 · Stufe 10 ·195 Schaden/s · Ausrüstung +143.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -0.8 Schaden/s · -0.3 Heilung/s · Wumms 1.2 Schaden/s · 0.1 Heilung/s · Taktgefühl 0.1 Schaden/s · 0.7 Heilung/s · Bastelgrips -0.4 Schaden/s · 1.3 Heilung/s · 0.1 verhindert/s · Dicke Haut -0.9 Schaden/s · -0.1 Heilung/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Pfand auf die Zwölf 38.6 % · Kronkorken-Kelle 23.9 % · Autoangriff · Flasche kreist 22.1 % · Fassanstich 8.3 % · Du schuldest mir Pfand! 7.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Letzte Runde heilt +0.6 % · Runde aufs Haus 0 % · Großes Fass -3.1 % · Weizenkur gebunden · Nachschank gebunden · Weizen gegen die Zeche gebunden · Deckel und Pflaster gebunden · Katerfass gebunden · Tropfen für Tropfen gebunden

### dieter-brew · Pfad 2 · Stufe 10 ·296 Schaden/s · Ausrüstung +127.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.6 Schaden/s · Taktgefühl 0.9 Schaden/s · 0.1 Heilung/s · Bastelgrips 0.2 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Fassanstich 33.7 % · Pfand auf die Zwölf 22.4 % · Fassanstich 18.4 % · Autoangriff · Flasche kreist 14.7 % · Du schuldest mir Pfand! 5.5 % · Kronkorken-Kelle 5.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Bock auf mehr +6.2 % · Scherben bringen Glück +3.9 % · Gut gekühlt 0 % · Rücklaufleitung gebunden · Bock zuerst gebunden · Breiter Ausschank gebunden · Pfand mit Zinsen gebunden · Bock drauf gebunden · Restbestand gebunden

### dieter-brew · Pfad 0 · Stufe 20 ·361 Schaden/s · Ausrüstung +205.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.1 Schaden/s · Taktgefühl 0.6 Schaden/s · -0.2 Heilung/s · Bastelgrips 0.2 Schaden/s · 0.3 Heilung/s · Dicke Haut 0.2 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Pfand auf die Zwölf 51 % · Fassanstich 22.2 % · Autoangriff · Flasche kreist 22.2 % · Du schuldest mir Pfand! 4.2 % · Kronkorken-Kelle 0.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nachfüllen +13.8 % · Bar auf die Hand +6.2 % · Weizenkur +1.3 % · Rücklaufleitung +1 % · Schaumkrone +0.9 % · Drittes Fass 0 % · Zapfen im Gehen 0 % · Nachschank 0 % · Nächste Runde -0.4 % · Anstich mit Schwung -0.7 % · Zapfhahn auf -2.4 % · Pils zuerst gebunden · Frisch gezapft gebunden

### dieter-brew · Pfad 1 · Stufe 20 ·315 Schaden/s · Ausrüstung +211.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -0.4 Schaden/s · -0.5 Heilung/s · 0.1 verhindert/s · Wumms 1.5 Schaden/s · 0.1 Heilung/s · 0.1 verhindert/s · Taktgefühl 0 Schaden/s · -0.8 Heilung/s · Bastelgrips 0.1 Schaden/s · 0.3 Heilung/s · 0.1 verhindert/s · Dicke Haut -1.2 Schaden/s · -0.5 Heilung/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Pfand auf die Zwölf 46.2 % · Autoangriff · Flasche kreist 23.8 % · Fassanstich 16.7 % · Kronkorken-Kelle 7.7 % · Du schuldest mir Pfand! 5.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Pils zuerst +11.1 % · Nachschank 0 % · Weizen gegen die Zeche 0 % · Deckel und Pflaster 0 % · Rücklaufleitung 0 % · Runde aufs Haus -0.1 % · Nachfüllen -0.4 % · Anstich für alle -1.6 % · Großes Fass -1.7 % · Tropfen für Tropfen -4.9 % · Katerfass -8.4 % · Weizenkur gebunden · Letzte Runde heilt gebunden

### dieter-brew · Pfad 2 · Stufe 20 ·457 Schaden/s · Ausrüstung +181.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.8 Schaden/s · Taktgefühl 0.1 Schaden/s · 0.2 Heilung/s · Bastelgrips 0 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Fassanstich 34.5 % · Pfand auf die Zwölf 21.2 % · Fassanstich 16.5 % · Autoangriff · Flasche kreist 14 % · Kronkorken-Kelle 8.2 % · Du schuldest mir Pfand! 5.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Bock auf mehr +6.3 % · Letzter Ausschank +5.8 % · Scherben bringen Glück +5.7 % · Nachfüllen +5 % · Bock drauf +4.1 % · Restbestand +3 % · Pfand mit Zinsen +2.3 % · Bock zuerst 0 % · Breiter Ausschank 0 % · Pils zuerst 0 % · Weizenkur 0 % · Rücklaufleitung gebunden · Gut gekühlt gebunden

### baerbel-care · Pfad 0 · Stufe 10 ·252 Schaden/s · Ausrüstung +155.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.6 Schaden/s · -0.2 Heilung/s · Taktgefühl 0.4 Schaden/s · 0.4 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Großreinemachen 72.4 % · Autoangriff · Dauersprühen 12.8 % · Pinsel-Piekser 9.3 % · Fleckentest, Schätzchen! 5.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Gründlich, nicht schnell 0 % · Sanfte Versiegelung 0 % · Löffel in der Schürze 0 % · Warme Schüssel gebunden · Nachschlag gebunden · Das sechste Glas gebunden · Ein Schluck, ein Plan gebunden · Notration gebunden · Nebenbei umgerührt gebunden

### baerbel-care · Pfad 1 · Stufe 10 ·223 Schaden/s · Ausrüstung +135.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.7 Schaden/s · 0.1 Heilung/s · Taktgefühl -0.1 Schaden/s · 0.3 Heilung/s · Bastelgrips -0.2 Schaden/s · 0.1 Heilung/s · Dicke Haut -0.2 Schaden/s · -0.4 Heilung/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Großreinemachen 66.9 % · Pinsel-Piekser 13.5 % · Autoangriff · Dauersprühen 12.6 % · Fleckentest, Schätzchen! 7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Vom Herd aus +0.8 % · Anbau mit Fußbodenheilung +0.8 % · Nachgelegt -7.4 % · Giselas Ruf gebunden · Brutpflege gebunden · Dickes Fell gebunden · Gisela, hierher! gebunden · Thermomix-Tafel gebunden · Am Tisch wird gegessen gebunden

### baerbel-care · Pfad 2 · Stufe 10 ·282 Schaden/s · Ausrüstung +141.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.2 Schaden/s · 0.3 Heilung/s · Taktgefühl 0 Schaden/s · 0.3 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Großreinemachen 64.6 % · Pinsel-Piekser 18.3 % · Autoangriff · Dauersprühen 11.4 % · Fleckentest, Schätzchen! 5.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Frisch aufgetragen +10 % · Restfleck +0.9 % · Blitzblank -1.1 % · Spüli ins Auge gebunden · Frisch gewischt gebunden · Nichts wird weggekippt gebunden · Stammpublikum gebunden · Deckel auf die Schüssel gebunden · Landfrauen-Glanz gebunden

### baerbel-care · Pfad 0 · Stufe 20 ·383 Schaden/s · Ausrüstung +234.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.1 Schaden/s · 0.4 Heilung/s · Taktgefühl 1 Schaden/s · -0.2 Heilung/s · Bastelgrips 0 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Großreinemachen 71.8 % · Pinsel-Piekser 13.2 % · Autoangriff · Dauersprühen 11 % · Fleckentest, Schätzchen! 4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Frisch gewischt +4.5 % · Nebenbei umgerührt +1.6 % · Nicht ohne meine Mädels +1.4 % · Nachschlag +0.6 % · Das sechste Glas 0 % · Notration 0 % · Gründlich, nicht schnell 0 % · Löffel in der Schürze 0 % · Spüli ins Auge 0 % · Ein Schluck, ein Plan -1.5 % · Giselas Ruf -3.3 % · Warme Schüssel gebunden · Sanfte Versiegelung gebunden

### baerbel-care · Pfad 1 · Stufe 20 ·349 Schaden/s · Ausrüstung +191.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.4 Schaden/s · Taktgefühl 0.3 Schaden/s · -0.1 Heilung/s · Bastelgrips -0.9 Schaden/s · 1.6 Heilung/s · -0.1 verhindert/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Großreinemachen 61.4 % · Pinsel-Piekser 18 % · Autoangriff · Dauersprühen 14.8 % · Fleckentest, Schätzchen! 5.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Anbau mit Fußbodenheilung +1.9 % · Frisch gewischt +1.1 % · Brutpflege 0 % · Dickes Fell 0 % · Gisela, hierher! 0 % · Am Tisch wird gegessen 0 % · Warme Schüssel 0 % · Spüli ins Auge 0 % · Gänsehaut-Finale -0.2 % · Thermomix-Tafel -3 % · Nachgelegt -3 % · Giselas Ruf gebunden · Vom Herd aus gebunden

### baerbel-care · Pfad 2 · Stufe 20 ·352 Schaden/s · Ausrüstung +170.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.9 Schaden/s · Taktgefühl -0.7 Schaden/s · 0.2 Heilung/s · Bastelgrips 0 Schaden/s · 0.6 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Großreinemachen 66.4 % · Pinsel-Piekser 17 % · Autoangriff · Dauersprühen 12.9 % · Fleckentest, Schätzchen! 3.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Frisch gewischt +5.3 % · Frisch aufgetragen +5.3 % · Restfleck +2 % · Nichts wird weggekippt 0 % · Deckel auf die Schüssel 0 % · Landfrauen-Glanz 0 % · Warme Schüssel 0 % · Stammpublikum -1.7 % · Giselas Ruf -6.4 % · Schlussputz -8.6 % · Nachschlag -10 % · Spüli ins Auge gebunden · Blitzblank gebunden

### baerbel-feedback · Pfad 0 · Stufe 10 ·295 Schaden/s · Ausrüstung +103.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.4 Schaden/s · 0.2 Heilung/s · Taktgefühl -0.4 Schaden/s · 0.2 Heilung/s · Bastelgrips -0.7 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 36.9 % · Pinsel-Piekser 21.9 % · Durchputzen 15 % · Schimmel 13.9 % · Autoangriff · Dauersprühen 12.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nebenbei gestreut +2.6 % · Mundpropaganda +1.3 % · Ruhe im Karton 0 % · Feuchte Ecke gebunden · Es wächst nach gebunden · Schimmel geht viral gebunden · Kurzer Hausbesuch gebunden · Sporenflug gebunden · Muffige Kammer gebunden

### baerbel-feedback · Pfad 1 · Stufe 10 ·305 Schaden/s · Ausrüstung +124 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.2 Schaden/s · 1.5 Heilung/s · Taktgefühl 1.3 Schaden/s · 1 Heilung/s · Bastelgrips 0 Schaden/s · 1.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 36.6 % · Pinsel-Piekser 26.5 % · Schimmel 13.3 % · Durchputzen 12.5 % · Autoangriff · Dauersprühen 11.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kundenbindung 0 % · Reklamation abgewürgt 0 % · Doppelte Marge 0 % · Provision vom Schmerz gebunden · Putzprovision gebunden · Kleingeld vom Tick gebunden · Abschlussprämie gebunden · Provisionskur gebunden · Sonderrabatt gebunden

### baerbel-feedback · Pfad 2 · Stufe 10 ·348 Schaden/s · Ausrüstung +93 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.9 Schaden/s · 0.1 Heilung/s · Taktgefühl 1.1 Schaden/s · 0.2 Heilung/s · Bastelgrips 0 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 38.5 % · Pinsel-Piekser 21.3 % · Durchputzen 19.2 % · Schimmel 12.4 % · Autoangriff · Dauersprühen 8.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Doppelt geputzt +2.6 % · Vertrieb auf Achse 0 % · Kettenbrief 0 % · Einmal mehr drüber gebunden · Eintrittsgebühr gebunden · Bring noch zwei Freundinnen gebunden · Freundin wirbt Freundin gebunden · Passives Einkommen gebunden · Mehrwegflasche gebunden

### baerbel-feedback · Pfad 0 · Stufe 20 ·420 Schaden/s · Ausrüstung +175.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.1 Schaden/s · -0.1 Heilung/s · Taktgefühl 0.1 Schaden/s · Bastelgrips 0 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 44.7 % · Pinsel-Piekser 23.4 % · Durchputzen 12.5 % · Autoangriff · Dauersprühen 10 % · Schimmel 9.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Putzprovision +1.1 % · Schimmel geht viral 0 % · Kurzer Hausbesuch 0 % · Muffige Kammer 0 % · Ruhe im Karton 0 % · Provision vom Schmerz 0 % · Nebenbei gestreut -0.1 % · Einmal mehr drüber -0.2 % · Sporenflug -2.6 % · Sporenregen -3.6 % · Es wächst nach -9.7 % · Feuchte Ecke gebunden · Mundpropaganda gebunden

### baerbel-feedback · Pfad 1 · Stufe 20 ·423 Schaden/s · Ausrüstung +186.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.6 Schaden/s · 0.6 Heilung/s · Taktgefühl 0.4 Schaden/s · 1.3 Heilung/s · Bastelgrips 0 Schaden/s · 1.2 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 47.4 % · Pinsel-Piekser 21 % · Autoangriff · Dauersprühen 11 % · Durchputzen 10.9 % · Schimmel 9.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Feuchte Ecke +3.8 % · Putzprovision +1.1 % · Einmal mehr drüber +0.5 % · Kleingeld vom Tick 0 % · Abschlussprämie 0 % · Sonderrabatt 0 % · Kundenbindung 0 % · Doppelte Marge 0 % · Bonusausschüttung 0 % · Provisionskur -4.4 % · Es wächst nach -8.2 % · Provision vom Schmerz gebunden · Reklamation abgewürgt gebunden

### baerbel-feedback · Pfad 2 · Stufe 20 ·528 Schaden/s · Ausrüstung +161.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.8 Schaden/s · 0.4 Heilung/s · Taktgefühl -0.5 Schaden/s · 1.3 Heilung/s · 0.2 verhindert/s · Bastelgrips 0 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 34.5 % · Pinsel-Piekser 25.8 % · Durchputzen 22.7 % · Schimmel 9.2 % · Autoangriff · Dauersprühen 7.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Putzprovision +3.4 % · Die ganze Downline +3.2 % · Doppelt geputzt +2.2 % · Passives Einkommen +0.2 % · Bring noch zwei Freundinnen 0 % · Freundin wirbt Freundin 0 % · Mehrwegflasche 0 % · Vertrieb auf Achse 0 % · Provision vom Schmerz 0 % · Feuchte Ecke 0 % · Eintrittsgebühr -1.3 % · Einmal mehr drüber gebunden · Kettenbrief gebunden

### baerbel-stage · Pfad 0 · Stufe 10 ·294 Schaden/s · Ausrüstung +118.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2 Schaden/s · Taktgefühl 0.8 Schaden/s · Bastelgrips -0.9 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Auswringen 42.2 % · Grundreinigung auf eigene Gefahr 33.4 % · Pinsel-Piekser 11.9 % · Autoangriff · Dauersprühen 8 % · Fleckentest, Schätzchen! 4.1 % · Auswringen 0.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Follower gewonnen +3.3 % · Sponsoring-Deal 0 % · Sendezeit verlängert 0 % · Langzeitbelichtung gebunden · Dauerbeschallung gebunden · Stromsparmodus gebunden · Abgeblockt gebunden · Kommentar gepinnt gebunden · Zugabe-Rhythmus gebunden

### baerbel-stage · Pfad 1 · Stufe 10 ·344 Schaden/s · Ausrüstung +123.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.5 Schaden/s · Taktgefühl -0.8 Schaden/s · Bastelgrips 1 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Auswringen 36.9 % · Grundreinigung auf eigene Gefahr 26.2 % · Pinsel-Piekser 14.6 % · Fleckentest, Schätzchen! 13.8 % · Autoangriff · Dauersprühen 8.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Für alle sichtbar +5.6 % · Noch ein Take +2.8 % · Turbostufe zehn 0 % · Perfekter Upload gebunden · Früh am Herd gebunden · Scharfgestellt gebunden · Hype-Zug gebunden · Noch ein Reel, ihr Opfer! gebunden · Fleckentest bestanden gebunden

### baerbel-stage · Pfad 2 · Stufe 10 ·284 Schaden/s · Ausrüstung +121.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.3 Schaden/s · Taktgefühl 0.6 Schaden/s · Bastelgrips 0.5 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Auswringen 38.7 % · Grundreinigung auf eigene Gefahr 36.2 % · Pinsel-Piekser 13.8 % · Autoangriff · Dauersprühen 7.4 % · Fleckentest, Schätzchen! 3.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Live-Schalte 0 % · Nächste Szene 0 % · Sprungschnitt 0 % · Selfie im Gehen gebunden · Bühnenfunke gebunden · Erst pflegen, dann posten gebunden · Story-Wechsel gebunden · Unsichtbarer Schnitt gebunden · Frisch geföhnt gebunden

### baerbel-stage · Pfad 0 · Stufe 20 ·476 Schaden/s · Ausrüstung +163.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.8 Schaden/s · 0.1 Heilung/s · Taktgefühl 0.4 Schaden/s · Bastelgrips 2 Schaden/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Auswringen 41.6 % · Grundreinigung auf eigene Gefahr 28.7 % · Pinsel-Piekser 15.8 % · Autoangriff · Dauersprühen 9.6 % · Fleckentest, Schätzchen! 3 % · Auswringen 1.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nachglanz +11.6 % · Zugabe-Rhythmus +0.8 % · Perfekter Upload +0.6 % · Dauerbeschallung +0.2 % · Stromsparmodus +0.2 % · Abgeblockt 0 % · Kommentar gepinnt 0 % · Sponsoring-Deal 0 % · Sendezeit verlängert 0 % · Selfie im Gehen 0 % · Bühnenfunke -1.1 % · Langzeitbelichtung gebunden · Follower gewonnen gebunden

### baerbel-stage · Pfad 1 · Stufe 20 ·534 Schaden/s · Ausrüstung +176.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.5 Schaden/s · Taktgefühl 0 Schaden/s · 0.2 Heilung/s · Bastelgrips 0 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Auswringen 41.4 % · Grundreinigung auf eigene Gefahr 24.7 % · Pinsel-Piekser 16.1 % · Fleckentest, Schätzchen! 9.4 % · Autoangriff · Dauersprühen 7.3 % · Auswringen 1.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Noch ein Reel, ihr Opfer! +8.6 % · Noch ein Take +8.1 % · Letzter Schliff +6.7 % · Hype-Zug +3.4 % · Fleckentest bestanden +2.7 % · Früh am Herd +1.2 % · Scharfgestellt +0.8 % · Turbostufe zehn 0 % · Langzeitbelichtung 0 % · Selfie im Gehen 0 % · Bühnenfunke -4 % · Perfekter Upload gebunden · Für alle sichtbar gebunden

### baerbel-stage · Pfad 2 · Stufe 20 ·399 Schaden/s · Ausrüstung +157.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.7 Schaden/s · Taktgefühl 1.4 Schaden/s · Bastelgrips -0.4 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Auswringen 39.1 % · Grundreinigung auf eigene Gefahr 29.9 % · Pinsel-Piekser 17.2 % · Autoangriff · Dauersprühen 9.4 % · Fleckentest, Schätzchen! 3.6 % · Auswringen 0.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Viral bis zur Feldflur +1.3 % · Erst pflegen, dann posten 0 % · Story-Wechsel 0 % · Unsichtbarer Schnitt 0 % · Frisch geföhnt 0 % · Live-Schalte 0 % · Sprungschnitt 0 % · Langzeitbelichtung 0 % · Dauerbeschallung 0 % · Perfekter Upload -0.5 % · Bühnenfunke -0.7 % · Selfie im Gehen gebunden · Nächste Szene gebunden

### kevin-fuse · Pfad 0 · Stufe 10 ·267 Schaden/s · Ausrüstung +115.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.6 Schaden/s · Taktgefühl 2.2 Schaden/s · Bastelgrips 0.1 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 37.3 % · Kurzschluss 22.6 % · Kurzschluss 14.1 % · Pfandgeschoss 13.6 % · Autoangriff · Pfand im Takt 8.5 % · Lunte 4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Heißer Kleber +0.8 % · Ausgebrannt +0.5 % · Rücklaufdruck 0 % · Brennender Nachlauf gebunden · Zündfunke gebunden · Dicke Lunte gebunden · Pfandsammler gebunden · Lunte springt gebunden · Sparflamme gebunden

### kevin-fuse · Pfad 1 · Stufe 10 ·298 Schaden/s · Ausrüstung +124.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.6 Schaden/s · Taktgefühl 2.2 Schaden/s · Bastelgrips -0.1 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 60.1 % · Kurzschluss 16.1 % · Kurzschluss 9.1 % · Autoangriff · Pfand im Takt 6 % · Pfandgeschoss 5.8 % · Lunte 2.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Überbrückt +2.4 % · Doppelte Sicherung 0 % · Serienschaltung -2 % · Blanker Draht gebunden · Kupferkern gebunden · Rückstrom gebunden · Schnellverkabelt gebunden · Erdschluss gebunden · Kurzschluss gebunden

### kevin-fuse · Pfad 2 · Stufe 10 ·335 Schaden/s · Ausrüstung +135.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.6 Schaden/s · Taktgefühl 0.6 Schaden/s · 0.1 verhindert/s · Bastelgrips -0.2 Schaden/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Kurzschluss 38.7 % · Kurzschluss 33.1 % · Restmüll mit Zündschnur 15.5 % · Lunte 7.5 % · Autoangriff · Pfand im Takt 5.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nachzünder +7.3 % · Lange Zündschnur +1.7 % · Glühender Draht 0 % · Zündliste gebunden · Starkstrom-Bon gebunden · Kleber für alle gebunden · Funkenüberschlag gebunden · Kettenzündung gebunden · Zündleitung gebunden

### kevin-fuse · Pfad 0 · Stufe 20 ·408 Schaden/s · Ausrüstung +202.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.4 Schaden/s · Taktgefühl 0.7 Schaden/s · Bastelgrips -0.3 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 39.1 % · Kurzschluss 24.2 % · Pfandgeschoss 17.2 % · Kurzschluss 8.3 % · Autoangriff · Pfand im Takt 8.1 % · Lunte 3.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kupferkern +2.3 % · Ausgebrannt +2 % · Dicke Lunte 0 % · Pfandsammler 0 % · Lunte springt 0 % · Rücklaufdruck 0 % · Alles auf die Lunte 0 % · Blanker Draht 0 % · Zündliste -0.2 % · Zündfunke -0.8 % · Sparflamme -3.1 % · Brennender Nachlauf gebunden · Heißer Kleber gebunden

### kevin-fuse · Pfad 1 · Stufe 20 ·565 Schaden/s · Ausrüstung +193.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 5.5 Schaden/s · Taktgefühl 4 Schaden/s · Bastelgrips 0.2 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 64.7 % · Kurzschluss 21.2 % · Kurzschluss 5.3 % · Autoangriff · Pfand im Takt 4.6 % · Pfandgeschoss 2.6 % · Lunte 1.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kurzschluss +21.5 % · Brennender Nachlauf +16.5 % · Zündfunke +9.2 % · Nullwiderstand +9.1 % · Kupferkern +8.4 % · Rückstrom +7.2 % · Überbrückt +7 % · Schnellverkabelt 0 % · Erdschluss 0 % · Serienschaltung 0 % · Zündliste 0 % · Blanker Draht gebunden · Doppelte Sicherung gebunden

### kevin-fuse · Pfad 2 · Stufe 20 ·504 Schaden/s · Ausrüstung +196.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.3 Schaden/s · Taktgefühl -0.8 Schaden/s · Bastelgrips 2.2 Schaden/s · -0.1 verhindert/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Kurzschluss 33.1 % · Kurzschluss 31.8 % · Restmüll mit Zündschnur 24.8 % · Autoangriff · Pfand im Takt 4.7 % · Lunte 4.6 % · Pfandgeschoss 1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Zündfunke +6.4 % · Kleber für alle +4.3 % · Nachzünder +3 % · Starkstrom-Bon +0.5 % · Funkenüberschlag +0.2 % · Zündleitung 0 % · Blanker Draht 0 % · Brennender Nachlauf -0.5 % · Kettenreaktion -1.2 % · Lange Zündschnur -1.7 % · Kettenzündung -2.3 % · Zündliste gebunden · Glühender Draht gebunden

### kevin-iron · Pfad 0 · Stufe 10 ·264 Schaden/s · Ausrüstung +99.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.8 Schaden/s · -0.1 Heilung/s · Taktgefühl 0.4 Schaden/s · Bastelgrips 0.2 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Robbi 65.5 % · Autoangriff · Pfand im Takt 11.1 % · Pfandgeschoss 11 % · Überlast 7.8 % · Kleb die Scheiße fest 4.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Werkstattpause 0 % · Ersatzteile 0 % · Starker Magnet 0 % · Längere Batterie gebunden · Robbi räumt auf gebunden · Scharfe Dose gebunden · Robbi hält gebunden · Magnetpanzer gebunden · Ersatzdose gebunden

### kevin-iron · Pfad 1 · Stufe 10 ·228 Schaden/s · Ausrüstung +119.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.6 Schaden/s · Taktgefühl 1.9 Schaden/s · Bastelgrips 0.3 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Robbi 49.2 % · Pfandgeschoss 23.8 % · Autoangriff · Pfand im Takt 13.3 % · Überlast 8.1 % · Kleb die Scheiße fest 5.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Parierschlag 0 % · Dosenblech 0 % · Nietenpflaster 0 % · Blechkante gebunden · Nietenpanzer gebunden · Druckventil gebunden · Nietfest gebunden · Vernietet gebunden · Notniete gebunden

### kevin-iron · Pfad 2 · Stufe 10 ·332 Schaden/s · Ausrüstung +83.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.8 Schaden/s · Taktgefühl 1.8 Schaden/s · Bastelgrips 0.2 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Robbi 61.9 % · Pfandgeschoss 13.9 % · Überlast 10.2 % · Autoangriff · Pfand im Takt 10 % · Kleb die Scheiße fest 4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Überdruck +4.7 % · Überlast im Laufen 0 % · Restwärme -0.2 % · Frisch verschraubt gebunden · Volle Ladung gebunden · Blitzableiter gebunden · Wiederaufbau gebunden · Druckschlag gebunden · Dampfdruck gebunden

### kevin-iron · Pfad 0 · Stufe 20 ·359 Schaden/s · Ausrüstung +193.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms -0.1 Schaden/s · Taktgefühl 0.2 Schaden/s · Bastelgrips 0 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Robbi 58.4 % · Pfandgeschoss 14 % · Überlast 12.6 % · Autoangriff · Pfand im Takt 11.2 % · Kleb die Scheiße fest 3.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Ersatzdose +7.3 % · Robbi räumt auf +5.2 % · Nietenpanzer +3.8 % · Scharfe Dose +1.8 % · Robbi hält 0 % · Werkstattpause 0 % · Starker Magnet 0 % · Letzter Befehl 0 % · Frisch verschraubt 0 % · Blechkante 0 % · Magnetpanzer -6.2 % · Längere Batterie gebunden · Ersatzteile gebunden

### kevin-iron · Pfad 1 · Stufe 20 ·326 Schaden/s · Ausrüstung +181.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.7 Schaden/s · Taktgefühl -0.6 Schaden/s · Bastelgrips -0.2 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Robbi 37.4 % · Pfandgeschoss 34.6 % · Autoangriff · Pfand im Takt 14.6 % · Überlast 8.5 % · Kleb die Scheiße fest 4.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nietenpanzer +3.6 % · Robbi räumt auf +0.9 % · Druckventil 0 % · Nietfest 0 % · Vernietet 0 % · Notniete 0 % · Parierschlag 0 % · Nietenpflaster 0 % · Nicht TÜV-geprüft 0 % · Frisch verschraubt 0 % · Längere Batterie 0 % · Blechkante gebunden · Dosenblech gebunden

### kevin-iron · Pfad 2 · Stufe 20 ·492 Schaden/s · Ausrüstung +118.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.4 Schaden/s · Taktgefühl 0.6 Schaden/s · Bastelgrips 0.2 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Robbi 68.8 % · Pfandgeschoss 13.6 % · Autoangriff · Pfand im Takt 8.5 % · Überlast 6.2 % · Kleb die Scheiße fest 3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Wiederaufbau +25 % · Kernschmelze +13.5 % · Nietenpanzer +3.9 % · Überdruck +2.6 % · Blitzableiter 0 % · Druckschlag 0 % · Dampfdruck 0 % · Überlast im Laufen 0 % · Längere Batterie 0 % · Blechkante 0 % · Volle Ladung -1.4 % · Frisch verschraubt gebunden · Restwärme gebunden

### kevin-hunt · Pfad 0 · Stufe 10 ·311 Schaden/s · Ausrüstung +110.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.9 Schaden/s · Taktgefühl -0.6 Schaden/s · Bastelgrips -1.1 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 39.7 % · Pfandgeschoss 21.7 % · Restmüll-Rakete 20.8 % · Autoangriff · Pfand im Takt 10.7 % · Kleb die Scheiße fest 5.2 % · Überzündung 1.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Automatenrhythmus +3.4 % · Pfandgeschoss im Laufen 0 % · Klebegeld 0 % · Gezinkte Dose gebunden · Restwert gebunden · Klebefalle gebunden · Kurze Pechsträhne gebunden · Glücksgriff gebunden · Beutefieber gebunden

### kevin-hunt · Pfad 1 · Stufe 10 ·295 Schaden/s · Ausrüstung +117.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.4 Schaden/s · Taktgefühl 1.2 Schaden/s · Bastelgrips -0.6 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 42.7 % · Pfandgeschoss 19.5 % · Restmüll-Rakete 17.4 % · Autoangriff · Pfand im Takt 11.5 % · Kleb die Scheiße fest 4.8 % · Überzündung 4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Rückstoß 0 % · Schritt voraus 0 % · Rakete im Rennen 0 % · Im Vorbeirennen gebunden · Fangschuss gebunden · Abgesprungen gebunden · Nachladen im Rennen gebunden · Nachschub gebunden · Fangnetz gebunden

### kevin-hunt · Pfad 2 · Stufe 10 ·308 Schaden/s · Ausrüstung +100.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.3 Schaden/s · Taktgefühl 1.2 Schaden/s · Bastelgrips -0.3 Schaden/s · -0.1 verhindert/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 44.4 % · Restmüll-Rakete 19 % · Autoangriff · Pfand im Takt 13.8 % · Pfandgeschoss 9.2 % · Pfandseil 6.5 % · Kleb die Scheiße fest 6.1 % · Überzündung 1.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Fangprämie 0 % · Stahlseil 0 % · Restgewinn -0.1 % · Zweite Serie gebunden · Pfandrückgabe gebunden · Pfandregen gebunden · Glücksbringer gebunden · Pfandseil gebunden · Glücksrausch gebunden

### kevin-hunt · Pfad 0 · Stufe 20 ·486 Schaden/s · Ausrüstung +175.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms -0.3 Schaden/s · -0.1 Heilung/s · Taktgefühl -0.8 Schaden/s · 0.2 Heilung/s · Bastelgrips 0 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 42.1 % · Pfandgeschoss 26.5 % · Restmüll-Rakete 14 % · Autoangriff · Pfand im Takt 11 % · Kleb die Scheiße fest 3.8 % · Überzündung 2.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Zweite Serie +5 % · Alles auf Rot +4.6 % · Kurze Pechsträhne +1.9 % · Klebefalle 0 % · Beutefieber 0 % · Pfandgeschoss im Laufen 0 % · Fangschuss 0 % · Glücksgriff -0.3 % · Restwert -0.5 % · Automatenrhythmus -0.7 % · Im Vorbeirennen -1.3 % · Gezinkte Dose gebunden · Klebegeld gebunden

### kevin-hunt · Pfad 1 · Stufe 20 ·485 Schaden/s · Ausrüstung +213.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.1 Schaden/s · Taktgefühl -0.5 Schaden/s · Bastelgrips -1 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 42.7 % · Pfandgeschoss 24.2 % · Restmüll-Rakete 15.3 % · Autoangriff · Pfand im Takt 11 % · Kleb die Scheiße fest 3.5 % · Überzündung 3.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nie am selben Fleck +6.2 % · Gezinkte Dose +6.2 % · Zweite Serie +4.9 % · Restwert +0.1 % · Fangschuss 0 % · Abgesprungen 0 % · Nachladen im Rennen 0 % · Nachschub 0 % · Fangnetz 0 % · Rückstoß 0 % · Rakete im Rennen 0 % · Im Vorbeirennen gebunden · Schritt voraus gebunden

### kevin-hunt · Pfad 2 · Stufe 20 ·516 Schaden/s · Ausrüstung +149 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.6 Schaden/s · -0.2 verhindert/s · Taktgefühl 1 Schaden/s · -0.6 verhindert/s · Bastelgrips 0.7 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 55.6 % · Restmüll-Rakete 15.2 % · Autoangriff · Pfand im Takt 12.5 % · Pfandgeschoss 6.8 % · Pfandseil 5.6 % · Kleb die Scheiße fest 3.9 % · Überzündung 0.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Gewinnrakete +10 % · Glücksrausch +3.9 % · Pfandrückgabe +1.4 % · Pfandregen +0.7 % · Gezinkte Dose +0.7 % · Glücksbringer +0.2 % · Fangprämie 0 % · Stahlseil 0 % · Fangschuss 0 % · Im Vorbeirennen -1.7 % · Pfandseil -4 % · Zweite Serie gebunden · Restgewinn gebunden

### schorsch-chef · Pfad 0 · Stufe 10 ·209 Schaden/s · Ausrüstung +198.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.5 Heilung/s · Wumms 0.4 Schaden/s · Taktgefühl -0.4 Schaden/s · 0.5 Heilung/s · Bastelgrips 0.4 Schaden/s · 0.5 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Servieren 44.7 % · Grillzange 33.9 % · Autoangriff · Zangenklapper 21.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Wurstkette +4.9 % · Metzgerqualität 0 % · Auf Vorrat gegrillt 0 % · Probierhäppchen gebunden · Zweite Wurst gebunden · Satt ist satt gebunden · Notwurst gebunden · Hausmacher gebunden · Goldbraun gebunden

### schorsch-chef · Pfad 1 · Stufe 10 ·188 Schaden/s · Ausrüstung +199.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.4 Heilung/s · Wumms 0.4 Schaden/s · Taktgefühl -0.1 Schaden/s · 0.5 Heilung/s · Bastelgrips -0.6 Schaden/s · 0.5 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Servieren 58.5 % · Grillzange 21.9 % · Autoangriff · Zangenklapper 19.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Belegtes Brötchen 0 % · Popcorn für alle 0 % · Scharfer Senf -5.3 % · Grillkäse dazu gebunden · Schnell gewendet gebunden · Heißer Rost gebunden · Maiskolben dazu gebunden · Senf drauf! gebunden · Wenden! gebunden

### schorsch-chef · Pfad 2 · Stufe 10 ·233 Schaden/s · Ausrüstung +188.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.3 Heilung/s · Wumms 1.4 Schaden/s · -0.1 Heilung/s · Taktgefühl 2.1 Schaden/s · 0.1 Heilung/s · Bastelgrips 0.4 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Servieren 52 % · Grillzange 29.3 % · Autoangriff · Zangenklapper 18.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Dicke Luft +6.5 % · Buffet nachlegen 0 % · Frische Luft -0.9 % · Löschbier gebunden · Dampfgaren gebunden · Stammplatz gebunden · Feuerfeste Schürze gebunden · Ruhige Glut gebunden · Tischdienst gebunden

### schorsch-chef · Pfad 0 · Stufe 20 ·279 Schaden/s · Ausrüstung +266.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.5 Heilung/s · Wumms 0.4 Schaden/s · Taktgefühl 0.3 Schaden/s · Bastelgrips 1 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Grillzange 39.6 % · Dampf 34.1 % · Autoangriff · Zangenklapper 26.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Satt ist satt 0 % · Notwurst 0 % · Hausmacher 0 % · Goldbraun 0 % · Metzgerqualität 0 % · Auf Vorrat gegrillt 0 % · Meisterwurst 0 % · Löschbier 0 % · Schnell gewendet 0 % · Zweite Wurst -2 % · Grillkäse dazu -12.8 % · Probierhäppchen gebunden · Wurstkette gebunden

### schorsch-chef · Pfad 1 · Stufe 20 ·293 Schaden/s · Ausrüstung +268.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.8 Heilung/s · 0.1 verhindert/s · Wumms 0.8 Schaden/s · -0.1 verhindert/s · Taktgefühl 0.9 Schaden/s · 0.1 Heilung/s · Bastelgrips 1.5 Schaden/s · -0.4 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Servieren 48.5 % · Grillzange 29.7 % · Autoangriff · Zangenklapper 21.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Maiskolben dazu +14.4 % · Probierhäppchen +9.3 % · Volle Platte +2.1 % · Belegtes Brötchen 0 % · Löschbier 0 % · Schnell gewendet -1.2 % · Heißer Rost -1.5 % · Wenden! -1.7 % · Scharfer Senf -3.4 % · Senf drauf! -6.6 % · Zweite Wurst -6.8 % · Grillkäse dazu gebunden · Popcorn für alle gebunden

### schorsch-chef · Pfad 2 · Stufe 20 ·337 Schaden/s · Ausrüstung +307.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.5 Heilung/s · Wumms 0.4 Schaden/s · Taktgefühl -0.1 Schaden/s · -0.3 Heilung/s · Bastelgrips 0.2 Schaden/s · 0.7 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Dampf 52.7 % · Grillzange 29.4 % · Autoangriff · Zangenklapper 17.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Ruhige Glut +9.4 % · Probierhäppchen +6.5 % · Stammplatz +4.4 % · Frische Luft +1.6 % · Grillkäse dazu +0.6 % · Zweite Wurst +0.4 % · Dampfgaren +0.2 % · Feuerfeste Schürze 0 % · Tischdienst 0 % · Buffet nachlegen 0 % · Lokalrunde -1.9 % · Löschbier gebunden · Dicke Luft gebunden

### schorsch-flamme · Pfad 0 · Stufe 10 ·363 Schaden/s · Ausrüstung +178.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.2 Heilung/s · Wumms 1.9 Schaden/s · -0.1 Heilung/s · Taktgefühl -0.2 Schaden/s · -0.1 Heilung/s · Bastelgrips 1.5 Schaden/s · -0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Schwenkgrill 72.7 % · Grillzange 19.5 % · Autoangriff · Zangenklapper 7.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Blasebalg-Profi +6.9 % · Feuerring 0 % · Heißer Draht -0.9 % · Gut angefacht gebunden · Kurze Zündschnur gebunden · Zunder gebunden · Hitzewelle gebunden · Nach dem Knall gebunden · Nachglühen gebunden

### schorsch-flamme · Pfad 1 · Stufe 10 ·324 Schaden/s · Ausrüstung +163.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.1 Heilung/s · Wumms 3.1 Schaden/s · Taktgefühl 1.9 Schaden/s · -0.2 Heilung/s · Bastelgrips 0.4 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Schwenkgrill 74.5 % · Grillzange 16.6 % · Autoangriff · Zangenklapper 8.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Grillteller mit Braten +1 % · Knusprig +0.2 % · Zweiter Gang -6.6 % · Anbraten gebunden · Fleischermesser gebunden · Auf den Punkt gebunden · Abschrecken gebunden · Der Nächste, bitte gebunden · Fleischklopfer gebunden

### schorsch-flamme · Pfad 2 · Stufe 10 ·337 Schaden/s · Ausrüstung +142 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.1 Heilung/s · Wumms 1.6 Schaden/s · 0.3 Heilung/s · Taktgefühl 0.9 Schaden/s · 0.5 Heilung/s · Bastelgrips -0.7 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Spiritus 80 % · Grillzange 11.9 % · Autoangriff · Zangenklapper 8.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Zangentakt 0 % · Doppelpack 0 % · Nachgießen -1.3 % · Kohlenschaufel gebunden · Zangenklapper im Takt gebunden · Brandbeschleuniger gebunden · Heiße Kohlen gebunden · Spiritus-Schwall gebunden · Funkensprung gebunden

### schorsch-flamme · Pfad 0 · Stufe 20 ·607 Schaden/s · Ausrüstung +272.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.2 Heilung/s · Wumms 4.1 Schaden/s · -0.2 Heilung/s · Taktgefühl 0.4 Schaden/s · -0.2 Heilung/s · Bastelgrips -1 Schaden/s · -0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Schwenkgrill 77.8 % · Grillzange 16 % · Autoangriff · Zangenklapper 6.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nach dem Knall +10.4 % · Feuerteufel +9.9 % · Hitzewelle +9.3 % · Zunder +9.2 % · Nachglühen +6.6 % · Fleischermesser +4.7 % · Kurze Zündschnur +2.6 % · Heißer Draht +1.3 % · Blasebalg-Profi 0 % · Anbraten 0 % · Kohlenschaufel 0 % · Gut angefacht gebunden · Feuerring gebunden

### schorsch-flamme · Pfad 1 · Stufe 20 ·566 Schaden/s · Ausrüstung +276.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.1 Heilung/s · Wumms 1.8 Schaden/s · -0.2 Heilung/s · Taktgefühl 0.9 Schaden/s · -0.3 Heilung/s · Bastelgrips 2.3 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Schwenkgrill 78.3 % · Grillzange 15.8 % · Autoangriff · Zangenklapper 5.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Spanferkel-Wurf +11.4 % · Abschrecken +6.8 % · Fleischermesser +4.3 % · Der Nächste, bitte +4.1 % · Gut angefacht +3.2 % · Auf den Punkt 0 % · Kohlenschaufel 0 % · Kurze Zündschnur 0 % · Fleischklopfer -1.8 % · Grillteller mit Braten -2.4 % · Zweiter Gang -3.8 % · Anbraten gebunden · Knusprig gebunden

### schorsch-flamme · Pfad 2 · Stufe 20 ·523 Schaden/s · Ausrüstung +194.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.2 Heilung/s · Wumms 2 Schaden/s · -0.3 Heilung/s · Taktgefühl -1.9 Schaden/s · -0.3 Heilung/s · Bastelgrips 0.5 Schaden/s · -0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Spiritus 78.3 % · Grillzange 14.2 % · Autoangriff · Zangenklapper 7.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Gut angefacht +4.5 % · Spiritus-Schwall +2.4 % · Nachgießen +1 % · Brandbeschleuniger +0.6 % · Anbraten +0.6 % · Heiße Kohlen 0 % · Zangentakt 0 % · Kurze Zündschnur -1.2 % · Zangenklapper im Takt -1.9 % · Flambé mit Schuss -5.2 % · Funkensprung -6.4 % · Kohlenschaufel gebunden · Doppelpack gebunden

### schorsch-rauch · Pfad 0 · Stufe 10 ·193 Schaden/s · Ausrüstung +197.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.4 Heilung/s · Wumms 1.1 Schaden/s · 0.1 Heilung/s · Taktgefühl 1.2 Schaden/s · -0.6 Heilung/s · Bastelgrips 0.7 Schaden/s · -0.1 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 64.1 % · Grillzange 18.7 % · Autoangriff · Zangenklapper 17.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nachräuchern -0.5 % · Nasses Buchenholz -3 % · Nebelmaschine -7.3 % · Kalt anräuchern gebunden · Feuerlöscher gebunden · Dicker Qualm gebunden · Kalte Schulter gebunden · Deckel zu! gebunden · Räucherwurst gebunden

### schorsch-rauch · Pfad 1 · Stufe 10 ·213 Schaden/s · Ausrüstung +210.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.1 Heilung/s · Wumms 0.4 Schaden/s · Taktgefühl 1.2 Schaden/s · -0.1 Heilung/s · Bastelgrips 0.2 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 62.9 % · Grillzange 22.6 % · Autoangriff · Zangenklapper 14.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Deckelkonter 0 % · Zurück an den Absender 0 % · Notkäse 0 % · Garen mit Deckel gebunden · Deckelpolster gebunden · Doppelter Deckel gebunden · Käsekruste gebunden · Halloumi-Happen gebunden · Längerer Deckel gebunden

### schorsch-rauch · Pfad 2 · Stufe 10 ·219 Schaden/s · Ausrüstung +191.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.1 Heilung/s · Wumms 2 Schaden/s · Taktgefühl 1.6 Schaden/s · 0.1 Heilung/s · Bastelgrips 1.2 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 65.1 % · Grillzange 21.2 % · Autoangriff · Zangenklapper 13.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Brandmauer 0 % · Aufgeheizt 0 % · Glut unterm Deckel 0 % · Zwicken heizt gebunden · Nestwärme gebunden · Schwelbrand gebunden · Heißer Stein gebunden · Heiße Asche gebunden · Glutwächter gebunden

### schorsch-rauch · Pfad 0 · Stufe 20 ·281 Schaden/s · Ausrüstung +251.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.4 Heilung/s · Wumms 1.8 Schaden/s · -0.2 Heilung/s · Taktgefühl -0.1 Schaden/s · -0.4 Heilung/s · Bastelgrips 1.4 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 52.6 % · Grillzange 29.7 % · Autoangriff · Zangenklapper 17.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Dicker Qualm +0.3 % · Feuerlöscher 0 % · Kalte Schulter 0 % · Garen mit Deckel 0 % · Zwicken heizt 0 % · Deckelpolster 0 % · Nebelmaschine -3.5 % · Nachräuchern -3.6 % · Deckel zu! -4.4 % · Räucherkammer -8.3 % · Räucherwurst -9.6 % · Kalt anräuchern gebunden · Nasses Buchenholz gebunden

### schorsch-rauch · Pfad 1 · Stufe 20 ·311 Schaden/s · Ausrüstung +237 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.1 Heilung/s · Wumms 1.2 Schaden/s · Taktgefühl 2 Schaden/s · 0.4 Heilung/s · Bastelgrips -0.7 Schaden/s · 1.2 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 58.5 % · Grillzange 26.5 % · Autoangriff · Zangenklapper 15 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Deckelpolster 0 % · Doppelter Deckel 0 % · Käsekruste 0 % · Halloumi-Happen 0 % · Längerer Deckel 0 % · Deckelkonter 0 % · Notkäse 0 % · Halloumi-Panzer 0 % · Kalt anräuchern 0 % · Zwicken heizt 0 % · Feuerlöscher 0 % · Garen mit Deckel gebunden · Zurück an den Absender gebunden

### schorsch-rauch · Pfad 2 · Stufe 20 ·359 Schaden/s · Ausrüstung +240.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.1 Heilung/s · Wumms 1.2 Schaden/s · -0.5 Heilung/s · Taktgefühl 0.3 Schaden/s · -0.2 Heilung/s · Bastelgrips -0.1 Schaden/s · -0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 73.9 % · Autoangriff · Zangenklapper 15.8 % · Grillzange 10.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Glutherz +15.4 % · Schwelbrand +0.6 % · Nestwärme 0 % · Heißer Stein 0 % · Heiße Asche 0 % · Glutwächter 0 % · Brandmauer 0 % · Glut unterm Deckel 0 % · Kalt anräuchern 0 % · Garen mit Deckel 0 % · Feuerlöscher 0 % · Zwicken heizt gebunden · Aufgeheizt gebunden

### kaethe-grand · Pfad 0 · Stufe 10 ·337 Schaden/s · Ausrüstung +128.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.7 Heilung/s · Wumms -0.4 Schaden/s · Taktgefühl -2.5 Schaden/s · 0.7 Heilung/s · Bastelgrips 0 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 89.4 % · Autoangriff · Kartenschnipsen 10.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Spitzen +2.4 % · Auf die Hand 0 % · Trumpf nachziehen 0 % · Wenzel gebunden · Kreuz-Bube gebunden · Bube zieht nach gebunden · Der letzte Stich gebunden · Mit Vieren gebunden · Der Alte gebunden

### kaethe-grand · Pfad 1 · Stufe 10 ·276 Schaden/s · Ausrüstung +152 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.8 Heilung/s · Wumms -0.7 Schaden/s · 0.2 Heilung/s · Taktgefühl -0.1 Schaden/s · -0.5 Heilung/s · Bastelgrips 0 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 87.8 % · Autoangriff · Kartenschnipsen 12.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Volle Augen +5 % · Buchführung +0.1 % · Strich auf dem Block -1 % · Mitzählen gebunden · Pfennigfuchserin gebunden · Knapp gewonnen gebunden · Gestochen scharf gebunden · Reizen gebunden · Skat drücken gebunden

### kaethe-grand · Pfad 2 · Stufe 10 ·325 Schaden/s · Ausrüstung +141.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1 Heilung/s · Wumms 2 Schaden/s · -0.3 Heilung/s · Taktgefühl 0.8 Schaden/s · 0.6 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 88.8 % · Autoangriff · Kartenschnipsen 11.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Unter der Hand +6 % · Durchmarsch 0 % · Nullspiel 0 % · Kleinvieh gebunden · Kleine Fische gebunden · Schnipp, schnapp gebunden · Ouvert gebunden · Blatt aufgefächert gebunden · Bis zum Anschlag gebunden

### kaethe-grand · Pfad 0 · Stufe 20 ·561 Schaden/s · Ausrüstung +182.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.1 Heilung/s · Wumms 1.7 Schaden/s · -0.7 Heilung/s · Taktgefühl 0.6 Schaden/s · -1.3 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 88.5 % · Autoangriff · Kartenschnipsen 11.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kleinvieh +7.5 % · Bube zieht nach +3.9 % · Spitzen +2.4 % · Mitzählen +2.3 % · Kreuz-Bube +1.3 % · Der letzte Stich +1.1 % · Mit Vieren +1 % · Pfennigfuchserin +0.5 % · Grand Hand +0.1 % · Der Alte 0 % · Auf die Hand 0 % · Wenzel gebunden · Trumpf nachziehen gebunden

### kaethe-grand · Pfad 1 · Stufe 20 ·524 Schaden/s · Ausrüstung +185.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.7 Heilung/s · Wumms 0.2 Schaden/s · 0.3 Heilung/s · Taktgefühl 3.1 Schaden/s · -0.1 Heilung/s · Bastelgrips 0 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 87.8 % · Autoangriff · Kartenschnipsen 12.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kleinvieh +14.8 % · Revanche +13.1 % · Volle Augen +12.1 % · Kreuz-Bube +10.3 % · Pfennigfuchserin +5.6 % · Wenzel +2.9 % · Skat drücken +2.5 % · Reizen +2.3 % · Knapp gewonnen +0.3 % · Gestochen scharf 0 % · Strich auf dem Block -7.6 % · Mitzählen gebunden · Buchführung gebunden

### kaethe-grand · Pfad 2 · Stufe 20 ·571 Schaden/s · Ausrüstung +177.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1 Heilung/s · Wumms 3 Schaden/s · -0.2 Heilung/s · Taktgefühl 3.2 Schaden/s · -3.3 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 91.7 % · Autoangriff · Kartenschnipsen 8.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Null ouvert Hand +5.4 % · Mitzählen +4.6 % · Blatt aufgefächert +3.7 % · Kreuz-Bube +3.6 % · Schnipp, schnapp +3 % · Wenzel +1.3 % · Ouvert 0 % · Bis zum Anschlag 0 % · Nullspiel 0 % · Unter der Hand -0.9 % · Kleine Fische -1.7 % · Kleinvieh gebunden · Durchmarsch gebunden

### kaethe-herz · Pfad 0 · Stufe 10 ·173 Schaden/s · Ausrüstung +130.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.8 Heilung/s · Wumms 1.5 Schaden/s · 0.1 Heilung/s · Taktgefühl 1.3 Schaden/s · -0.3 Heilung/s · Bastelgrips 0 Schaden/s · 0.7 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Kreuz 87.5 % · Autoangriff · Kartenschnipsen 12.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Warmer Eierlikör 0 % · Noch eins, dann neu -1.9 % · Herzensangelegenheit -6 % · Das Herz am rechten Fleck gebunden · Rote Dame gebunden · Nachschenken gebunden · Herzklopfen gebunden · Handlesen gebunden · Lebenslinie gebunden

### kaethe-herz · Pfad 1 · Stufe 10 ·201 Schaden/s · Ausrüstung +128.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.4 Heilung/s · Wumms 1.2 Schaden/s · 0.2 Heilung/s · Taktgefühl 0.5 Schaden/s · 0.3 Heilung/s · Bastelgrips 0 Schaden/s · 0.6 Heilung/s · Dicke Haut -0.1 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 85.4 % · Autoangriff · Kartenschnipsen 14.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Masche für Masche 0 % · Doppelt gemauert 0 % · Nichts verschenken -1.9 % · Pik auf die Brust gebunden · Letzte Masche gebunden · Pik-Ass gebunden · Mauern gebunden · Pik mit Stachel gebunden · Pik-Kette gebunden

### kaethe-herz · Pfad 2 · Stufe 10 ·197 Schaden/s · Ausrüstung +138.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.4 Heilung/s · Wumms 0.9 Schaden/s · -0.1 Heilung/s · Taktgefühl 0 Schaden/s · -0.3 Heilung/s · Bastelgrips 0 Schaden/s · 0.6 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Kreuz 88 % · Autoangriff · Kartenschnipsen 12 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kartenlegen +0.4 % · Legekreis im Gehen 0 % · Zukunft gesehen 0 % · Sterne lesen gebunden · Farbe halten gebunden · Wahrsagekugel gebunden · Blick über die Schulter gebunden · Hab ich kommen sehen gebunden · Kaffeefahrt gebunden

### kaethe-herz · Pfad 0 · Stufe 20 ·284 Schaden/s · Ausrüstung +214.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.8 Heilung/s · Wumms 1 Schaden/s · -0.3 Heilung/s · Taktgefühl -0.3 Schaden/s · 0.2 Heilung/s · Bastelgrips 0 Schaden/s · 0.7 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 86.1 % · Autoangriff · Kartenschnipsen 13.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Sterne lesen +7.5 % · Rote Rechnung +4.5 % · Noch eins, dann neu +0.8 % · Rote Dame 0 % · Nachschenken 0 % · Herzklopfen 0 % · Warmer Eierlikör 0 % · Pik auf die Brust 0 % · Letzte Masche 0 % · Lebenslinie -0.1 % · Handlesen -4.8 % · Das Herz am rechten Fleck gebunden · Herzensangelegenheit gebunden

### kaethe-herz · Pfad 1 · Stufe 20 ·321 Schaden/s · Ausrüstung +187.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.6 Heilung/s · Wumms 1.3 Schaden/s · 0.4 Heilung/s · Taktgefühl -0.6 Schaden/s · 1.4 Heilung/s · Bastelgrips 0 Schaden/s · 0.7 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 90.8 % · Autoangriff · Kartenschnipsen 9.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Pik mit Stachel +2.5 % · Sterne lesen +0.3 % · Letzte Masche 0 % · Pik-Ass 0 % · Mauern 0 % · Pik-Kette 0 % · Masche für Masche 0 % · Doppelt gemauert 0 % · Schutzbrief 0 % · Das Herz am rechten Fleck 0 % · Rote Dame 0 % · Pik auf die Brust gebunden · Nichts verschenken gebunden

### kaethe-herz · Pfad 2 · Stufe 20 ·306 Schaden/s · Ausrüstung +184.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 1.3 Schaden/s · 1.6 Heilung/s · Wumms 2.6 Schaden/s · 1.2 Heilung/s · Taktgefühl 1.4 Schaden/s · -0.9 Heilung/s · Bastelgrips 0 Schaden/s · 0.8 Heilung/s · Dicke Haut 1.3 Schaden/s · -0.2 Heilung/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Kreuz 90.9 % · Autoangriff · Kartenschnipsen 9.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kartenlegen +3.5 % · Die Karten lügen nie +0.2 % · Farbe halten 0 % · Wahrsagekugel 0 % · Blick über die Schulter 0 % · Hab ich kommen sehen 0 % · Legekreis im Gehen 0 % · Das Herz am rechten Fleck 0 % · Rote Dame 0 % · Kaffeefahrt -0.1 % · Pik auf die Brust -3.4 % · Sterne lesen gebunden · Zukunft gesehen gebunden

### kaethe-falsch · Pfad 0 · Stufe 10 ·276 Schaden/s · Ausrüstung +128.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.8 Heilung/s · Wumms 2.2 Schaden/s · 0.3 Heilung/s · Taktgefühl 0.6 Schaden/s · 0.7 Heilung/s · Bastelgrips 0 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 88.3 % · Autoangriff · Kartenschnipsen 11.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kontra mit Ansage 0 % · Dicke Strickjacke 0 % · Mauer nach dem Stich 0 % · Hab ich doch gesagt gebunden · Kontra zahlt gebunden · Hochgestochen gebunden · Stichfest gebunden · Da guckst du gebunden · Kontra im Takt gebunden

### kaethe-falsch · Pfad 1 · Stufe 10 ·354 Schaden/s · Ausrüstung +123.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.6 Heilung/s · Wumms 2.5 Schaden/s · -0.1 Heilung/s · Taktgefühl -0.2 Schaden/s · 0.1 Heilung/s · Bastelgrips 0 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 89.9 % · Autoangriff · Kartenschnipsen 10.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Flinke Finger +1.8 % · Mischen ist Silber 0 % · Nachgesteckt -0.5 % · Aus dem Ärmel gebunden · Notblatt gebunden · Bubentrick gebunden · Ärmel voll gebunden · Gezinkte Karten gebunden · Falsch gemischt gebunden

### kaethe-falsch · Pfad 2 · Stufe 10 ·333 Schaden/s · Ausrüstung +119.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.8 Heilung/s · Wumms 1 Schaden/s · 0.5 Heilung/s · Taktgefühl 1.5 Schaden/s · 0.6 Heilung/s · Bastelgrips 0 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 90.5 % · Autoangriff · Kartenschnipsen 9.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Karo satt 0 % · Bockrunde 0 % · Hier geblieben! 0 % · Re! gebunden · Karo-Zehn gebunden · Kreuz-Dame gebunden · Karo bedient gebunden · Karo-Ass gebunden · Kreuz-Kette gebunden

### kaethe-falsch · Pfad 0 · Stufe 20 ·456 Schaden/s · Ausrüstung +197.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.9 Heilung/s · Wumms 1.8 Schaden/s · -0.2 Heilung/s · Taktgefühl -0.7 Schaden/s · 0.3 Heilung/s · Bastelgrips 0 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 89.2 % · Autoangriff · Kartenschnipsen 10.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kontra gewonnen +13.6 % · Kontra zahlt 0 % · Hochgestochen 0 % · Stichfest 0 % · Da guckst du 0 % · Kontra im Takt 0 % · Kontra mit Ansage 0 % · Mauer nach dem Stich 0 % · Aus dem Ärmel 0 % · Re! 0 % · Notblatt 0 % · Hab ich doch gesagt gebunden · Dicke Strickjacke gebunden

### kaethe-falsch · Pfad 1 · Stufe 20 ·558 Schaden/s · Ausrüstung +198.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.7 Heilung/s · Wumms 2.9 Schaden/s · Taktgefühl -2.5 Schaden/s · 0.4 Heilung/s · Bastelgrips 0 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 91.4 % · Autoangriff · Kartenschnipsen 8.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Gezinkte Karten +9.8 % · Falsch abgerechnet +6.8 % · Ärmel voll +5.8 % · Flinke Finger +3.7 % · Notblatt 0 % · Bubentrick 0 % · Falsch gemischt 0 % · Hab ich doch gesagt 0 % · Re! 0 % · Kontra zahlt 0 % · Nachgesteckt -3.4 % · Aus dem Ärmel gebunden · Mischen ist Silber gebunden

### kaethe-falsch · Pfad 2 · Stufe 20 ·539 Schaden/s · Ausrüstung +171.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1 Heilung/s · Wumms 0.7 Schaden/s · Taktgefühl 1.7 Schaden/s · -1.2 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 91.2 % · Autoangriff · Kartenschnipsen 8.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Karo-Ass +7.7 % · Kreuz-Kette +5.6 % · Re und Bock +4.9 % · Kreuz-Dame +3.5 % · Karo-Zehn 0 % · Karo bedient 0 % · Karo satt 0 % · Hier geblieben! 0 % · Hab ich doch gesagt 0 % · Aus dem Ärmel 0 % · Kontra zahlt 0 % · Re! gebunden · Bockrunde gebunden

