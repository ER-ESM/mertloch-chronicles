# Balance-Sheet

Automatisch erzeugt von `npm run balance:sheet` · 2026-09-25 · 40 s Übungskampf, jede Zelle und jede Zerlegung als Mittel aus Boss (10× Feldleben) und Feldgruppe (drei Gegner mit Umland-Leben); gefallene Gegner ersetzt sofort ein neuer (Kill-Talente zählen), Zufall mit 3 festen Startwerten gemittelt, gemeinsame Prioritäten-Rotation (Heiler heilen zuerst), Puppen treffen jede Sekunde mit 3 % des Grundlebens. Voller Ausrüstungssatz auf Charakterstufe (Werteprofile im Wechsel); „Startausrüstung“ = Flasche, Topfdeckel, Schleuder, Kutte. Talentpfad 0–2 über `pathBuild`, Stufe 1 ohne Spezialisierung.

Jede Rolle misst sich an ihrer Kennzahl: **Schaden** → Schaden/s, **Heilung** → Heilung/s (Ausstoß inkl. Überheilung), **Tank** → Schutz/s (verhinderter Schaden + Deckung). Zelle: Kennzahl (Abweichung vom Median der Rolle auf dieser Stufe × Ausrüstung). ⚑ = mehr als 15 % daneben (ab Stufe 5).

## Überblick

379 von 900 Messungen liegen mehr als 15 % neben dem Median ihrer Rolle.

## Ausrüstung: Startausrüstung

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 59 (-2.3 %) | 101 (-13.2 %) | 107 (-21.1 %) ⚑ | 125 (-23.4 %) ⚑ | 143 (-19.6 %) ⚑ | 181 (-15.5 %) ⚑ |
| dieter-brawl | 1 | 59 (-2.3 %) | 114 (-1.6 %) | 149 (+9.6 %) | 187 (+14.7 %) | 208 (+17.1 %) ⚑ | 246 (+14.6 %) |
| dieter-brawl | 2 | 59 (-2.3 %) | 110 (-4.7 %) | 126 (-7.7 %) | 133 (-18.1 %) ⚑ | 159 (-10.7 %) | 189 (-11.7 %) |
| baerbel-feedback | 0 | 61 (0 %) | 131 (+12.8 %) | 145 (+6.8 %) | 143 (-12.5 %) | 152 (-14.5 %) | 165 (-23 %) ⚑ |
| baerbel-feedback | 1 | 61 (0 %) | 141 (+21.5 %) ⚑ | 136 (+0.1 %) | 145 (-11.1 %) | 147 (-17.2 %) ⚑ | 163 (-23.9 %) ⚑ |
| baerbel-feedback | 2 | 61 (0 %) | 146 (+25.5 %) ⚑ | 180 (+32.6 %) ⚑ | 193 (+18.7 %) ⚑ | 202 (+13.3 %) | 216 (+0.6 %) |
| baerbel-stage | 0 | 61 (0 %) | 111 (-4.7 %) | 135 (-0.7 %) | 170 (+4.4 %) | 181 (+1.6 %) | 220 (+2.4 %) |
| baerbel-stage | 1 | 61 (0 %) | 127 (+9.2 %) | 154 (+13.2 %) | 174 (+6.6 %) | 193 (+8.6 %) | 215 (0 %) |
| baerbel-stage | 2 | 61 (0 %) | 118 (+2.2 %) | 128 (-5.7 %) | 147 (-9.9 %) | 155 (-13.1 %) | 181 (-15.6 %) ⚑ |
| kevin-fuse | 0 | 50 (-16.9 %) | 107 (-7.8 %) | 124 (-8.8 %) | 126 (-22.4 %) ⚑ | 135 (-24.3 %) ⚑ | 201 (-6.4 %) |
| kevin-fuse | 1 | 50 (-16.9 %) | 108 (-6.6 %) | 133 (-2.2 %) | 170 (+4.2 %) | 193 (+8.3 %) | 247 (+15 %) ⚑ |
| kevin-fuse | 2 | 50 (-16.9 %) | 123 (+6.2 %) | 142 (+4.8 %) | 162 (-0.7 %) | 170 (-4.6 %) | 201 (-6.5 %) |
| kevin-hunt | 0 | 50 (-16.9 %) | 134 (+15.9 %) ⚑ | 148 (+8.9 %) | 160 (-1.8 %) | 176 (-0.9 %) | 187 (-12.7 %) |
| kevin-hunt | 1 | 50 (-16.9 %) | 120 (+3.4 %) | 136 (0 %) | 154 (-5.5 %) | 155 (-13.1 %) | 185 (-14 %) |
| kevin-hunt | 2 | 50 (-16.9 %) | 125 (+7.7 %) | 154 (+13 %) | 195 (+19.4 %) ⚑ | 207 (+16.5 %) ⚑ | 232 (+8.3 %) |
| schorsch-flamme | 0 | 69 (+14.7 %) | 116 (0 %) | 161 (+18.2 %) ⚑ | 206 (+26.7 %) ⚑ | 230 (+29.3 %) ⚑ | 283 (+31.7 %) ⚑ |
| schorsch-flamme | 1 | 69 (+14.7 %) | 100 (-14.1 %) | 135 (-0.8 %) | 195 (+19.5 %) ⚑ | 201 (+12.7 %) | 270 (+25.8 %) ⚑ |
| schorsch-flamme | 2 | 69 (+14.7 %) | 95 (-18.1 %) ⚑ | 128 (-5.8 %) | 163 (0 %) | 178 (0 %) | 207 (-3.4 %) |
| kaethe-grand | 0 | 61 (+1.5 %) | 126 (+8.5 %) | 146 (+7.4 %) | 179 (+9.6 %) | 217 (+22.1 %) ⚑ | 269 (+25.3 %) ⚑ |
| kaethe-grand | 1 | 61 (+1.5 %) | 102 (-12.3 %) | 114 (-16.5 %) ⚑ | 151 (-7.2 %) | 198 (+11.1 %) | 278 (+29.7 %) ⚑ |
| kaethe-grand | 2 | 61 (+1.5 %) | 113 (-2.2 %) | 136 (-0.2 %) | 186 (+14.1 %) | 211 (+18.5 %) ⚑ | 273 (+27.2 %) ⚑ |
| kaethe-falsch | 0 | 61 (+1.5 %) | 102 (-12.4 %) | 112 (-17.3 %) ⚑ | 130 (-20.3 %) ⚑ | 141 (-21 %) ⚑ | 179 (-16.6 %) ⚑ |
| kaethe-falsch | 1 | 61 (+1.5 %) | 98 (-15.3 %) ⚑ | 131 (-3.3 %) | 163 (+0.3 %) | 175 (-1.6 %) | 227 (+5.8 %) |
| kaethe-falsch | 2 | 61 (+1.5 %) | 117 (+0.8 %) | 141 (+3.5 %) | 155 (-4.7 %) | 177 (-0.7 %) | 210 (-2.4 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 31 (-21.1 %) ⚑ | 32 (-49.8 %) ⚑ | 45 (-51.6 %) ⚑ | 54 (-50.4 %) ⚑ | 55 (-61.6 %) ⚑ |
| dieter-brew | 1 | 0 (-100 %) | 38 (-2.3 %) | 64 (0 %) | 89 (-4.6 %) | 104 (-4.9 %) | 128 (-11.3 %) |
| dieter-brew | 2 | 0 (-100 %) | 30 (-24 %) ⚑ | 36 (-43.2 %) ⚑ | 42 (-55 %) ⚑ | 46 (-57.8 %) ⚑ | 57 (-60.3 %) ⚑ |
| baerbel-care | 0 | 0 (-100 %) | 55 (+42.3 %) ⚑ | 73 (+15.3 %) ⚑ | 93 (0 %) | 109 (0 %) | 138 (-4 %) |
| baerbel-care | 1 | 0 (-100 %) | 39 (-0.5 %) | 78 (+23.3 %) ⚑ | 115 (+23.2 %) ⚑ | 151 (+38.2 %) ⚑ | 203 (+41.5 %) ⚑ |
| baerbel-care | 2 | 0 (-100 %) | 42 (+8.8 %) | 59 (-7.2 %) | 95 (+2.4 %) | 138 (+26 %) ⚑ | 172 (+19.4 %) ⚑ |
| schorsch-chef | 0 | 0 (-100 %) | 44 (+12.6 %) | 89 (+39.9 %) ⚑ | 105 (+12.1 %) | 130 (+19 %) ⚑ | 180 (+25.5 %) ⚑ |
| schorsch-chef | 1 | 0 (-100 %) | 26 (-33.2 %) ⚑ | 41 (-35.4 %) ⚑ | 60 (-35.2 %) ⚑ | 97 (-10.8 %) | 144 (0 %) |
| schorsch-chef | 2 | 0 (-100 %) | 39 (-0.5 %) | 67 (+4.9 %) | 97 (+3.5 %) | 121 (+10.8 %) | 181 (+26 %) ⚑ |
| kaethe-herz | 0 | 21 (+1960 %) | 53 (+36.1 %) ⚑ | 66 (+3.1 %) | 103 (+10.7 %) | 124 (+13.4 %) | 182 (+26.7 %) ⚑ |
| kaethe-herz | 1 | 21 (+1960 %) | 39 (0 %) | 49 (-22.6 %) ⚑ | 72 (-22.9 %) ⚑ | 100 (-8.6 %) | 143 (-0.8 %) |
| kaethe-herz | 2 | 21 (+1960 %) | 48 (+23.2 %) ⚑ | 62 (-1.9 %) | 68 (-27 %) ⚑ | 79 (-27.3 %) ⚑ | 104 (-27.7 %) ⚑ |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 8 (+53.8 %) | 25 (-14.7 %) | 39 (0 %) | 44 (-8.5 %) | 52 (-9 %) | 65 (-13 %) |
| dieter-wall | 1 | 8 (+53.8 %) | 14 (-52.4 %) ⚑ | 22 (-42.1 %) ⚑ | 42 (-12 %) | 55 (-3 %) | 71 (-5.1 %) |
| dieter-wall | 2 | 8 (+53.8 %) | 14 (-53.8 %) ⚑ | 23 (-40.5 %) ⚑ | 34 (-30.3 %) ⚑ | 41 (-27.4 %) ⚑ | 63 (-15.8 %) ⚑ |
| kevin-iron | 0 | 3 (-42.3 %) | 29 (0 %) | 39 (0 %) | 49 (+0.8 %) | 59 (+3.9 %) | 76 (+2.4 %) |
| kevin-iron | 1 | 3 (-42.3 %) | 30 (+3.4 %) | 39 (+2.1 %) | 48 (0 %) | 57 (0 %) | 75 (0 %) |
| kevin-iron | 2 | 3 (-42.3 %) | 26 (-9.6 %) | 35 (-10.4 %) | 43 (-11.2 %) | 54 (-5.3 %) | 72 (-3.8 %) |
| schorsch-rauch | 0 | 5 (0 %) | 34 (+14.7 %) | 39 (+1 %) | 57 (+18.9 %) ⚑ | 67 (+17.6 %) ⚑ | 86 (+15.2 %) ⚑ |
| schorsch-rauch | 1 | 5 (0 %) | 36 (+24.3 %) ⚑ | 50 (+28.8 %) ⚑ | 62 (+28.8 %) ⚑ | 74 (+29.7 %) ⚑ | 97 (+29.5 %) ⚑ |
| schorsch-rauch | 2 | 5 (0 %) | 33 (+13.4 %) | 44 (+14.3 %) | 55 (+13.9 %) | 64 (+12.7 %) | 85 (+13.4 %) |

## Ausrüstung: ungewöhnlich

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 94 (-2.8 %) | 167 (-12.5 %) | 205 (-22.1 %) ⚑ | 265 (-23.9 %) ⚑ | 315 (-25.8 %) ⚑ | 449 (-22.1 %) ⚑ |
| dieter-brawl | 1 | 94 (-2.8 %) | 197 (+3 %) | 264 (+0.5 %) | 369 (+6.1 %) | 429 (+0.9 %) | 666 (+15.5 %) ⚑ |
| dieter-brawl | 2 | 94 (-2.8 %) | 186 (-2.7 %) | 243 (-7.5 %) | 305 (-12.2 %) | 393 (-7.4 %) | 499 (-13.5 %) |
| baerbel-feedback | 0 | 98 (+1.1 %) | 200 (+4.7 %) | 255 (-3.1 %) | 315 (-9.4 %) | 385 (-9.4 %) | 502 (-13.1 %) |
| baerbel-feedback | 1 | 98 (+1.1 %) | 226 (+18.3 %) ⚑ | 263 (0 %) | 316 (-9.1 %) | 365 (-14 %) | 492 (-14.7 %) |
| baerbel-feedback | 2 | 98 (+1.1 %) | 240 (+25.5 %) ⚑ | 306 (+16.3 %) ⚑ | 368 (+5.8 %) | 441 (+3.9 %) | 553 (-4.1 %) |
| baerbel-stage | 0 | 98 (+1.1 %) | 183 (-4.3 %) | 250 (-4.8 %) | 347 (-0.3 %) | 419 (-1.4 %) | 577 (0 %) |
| baerbel-stage | 1 | 98 (+1.1 %) | 203 (+6.1 %) | 301 (+14.5 %) | 400 (+14.9 %) | 447 (+5.2 %) | 604 (+4.7 %) |
| baerbel-stage | 2 | 98 (+1.1 %) | 183 (-4.6 %) | 231 (-12.1 %) | 294 (-15.4 %) ⚑ | 349 (-17.9 %) ⚑ | 478 (-17.2 %) ⚑ |
| kevin-fuse | 0 | 84 (-13.2 %) | 177 (-7.7 %) | 229 (-12.8 %) | 286 (-17.8 %) ⚑ | 344 (-19 %) ⚑ | 511 (-11.5 %) |
| kevin-fuse | 1 | 84 (-13.2 %) | 168 (-12.2 %) | 258 (-1.8 %) | 372 (+6.9 %) | 482 (+13.6 %) | 669 (+15.9 %) ⚑ |
| kevin-fuse | 2 | 84 (-13.2 %) | 205 (+7.2 %) | 292 (+11.2 %) | 360 (+3.4 %) | 449 (+5.6 %) | 601 (+4.2 %) |
| kevin-hunt | 0 | 84 (-13.2 %) | 199 (+3.8 %) | 263 (+0.2 %) | 340 (-2.2 %) | 415 (-2.2 %) | 581 (+0.7 %) |
| kevin-hunt | 1 | 84 (-13.2 %) | 192 (+0.4 %) | 252 (-4.1 %) | 334 (-4.1 %) | 402 (-5.3 %) | 538 (-6.7 %) |
| kevin-hunt | 2 | 84 (-13.2 %) | 199 (+4.1 %) | 274 (+4.3 %) | 374 (+7.5 %) | 453 (+6.7 %) | 584 (+1.2 %) |
| schorsch-flamme | 0 | 109 (+12.2 %) | 206 (+7.4 %) | 342 (+30.2 %) ⚑ | 487 (+39.9 %) ⚑ | 564 (+32.9 %) ⚑ | 763 (+32.3 %) ⚑ |
| schorsch-flamme | 1 | 109 (+12.2 %) | 189 (-1.1 %) | 291 (+10.5 %) | 523 (+50.3 %) ⚑ | 634 (+49.3 %) ⚑ | 856 (+48.4 %) ⚑ |
| schorsch-flamme | 2 | 109 (+12.2 %) | 186 (-2.6 %) | 270 (+2.6 %) | 358 (+3 %) | 425 (0 %) | 651 (+12.8 %) |
| kaethe-grand | 0 | 97 (0 %) | 207 (+8.2 %) | 297 (+12.9 %) | 390 (+12 %) | 456 (+7.3 %) | 630 (+9.2 %) |
| kaethe-grand | 1 | 97 (0 %) | 165 (-13.7 %) | 232 (-11.7 %) | 282 (-19 %) ⚑ | 382 (-10 %) | 549 (-4.9 %) |
| kaethe-grand | 2 | 97 (0 %) | 168 (-12.4 %) | 255 (-3.1 %) | 401 (+15.3 %) ⚑ | 469 (+10.5 %) | 676 (+17.2 %) ⚑ |
| kaethe-falsch | 0 | 97 (0 %) | 181 (-5.5 %) | 227 (-13.5 %) | 289 (-16.9 %) ⚑ | 344 (-19 %) ⚑ | 468 (-18.9 %) ⚑ |
| kaethe-falsch | 1 | 97 (0 %) | 171 (-10.6 %) | 234 (-11.1 %) | 348 (0 %) | 413 (-2.7 %) | 565 (-2.1 %) |
| kaethe-falsch | 2 | 97 (0 %) | 191 (0 %) | 263 (+0.1 %) | 346 (-0.5 %) | 439 (+3.4 %) | 547 (-5.3 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 39 (-36.4 %) ⚑ | 48 (-57.9 %) ⚑ | 73 (-50 %) ⚑ | 97 (-52.2 %) ⚑ | 114 (-60.4 %) ⚑ |
| dieter-brew | 1 | 0 (-100 %) | 54 (-11.5 %) | 92 (-19.2 %) ⚑ | 113 (-22.3 %) ⚑ | 132 (-34.8 %) ⚑ | 174 (-39.7 %) ⚑ |
| dieter-brew | 2 | 0 (-100 %) | 42 (-31.1 %) ⚑ | 48 (-57.6 %) ⚑ | 61 (-58 %) ⚑ | 80 (-60.6 %) ⚑ | 113 (-60.8 %) ⚑ |
| baerbel-care | 0 | 0 (-100 %) | 62 (0 %) | 68 (-40.2 %) ⚑ | 84 (-41.9 %) ⚑ | 97 (-52.3 %) ⚑ | 185 (-35.7 %) ⚑ |
| baerbel-care | 1 | 0 (-100 %) | 52 (-15.4 %) ⚑ | 89 (-22.2 %) ⚑ | 144 (-1.1 %) | 176 (-13.1 %) | 288 (0 %) |
| baerbel-care | 2 | 0 (-100 %) | 52 (-14.8 %) | 81 (-29.1 %) ⚑ | 139 (-4.3 %) | 188 (-7.1 %) | 247 (-14.3 %) |
| schorsch-chef | 0 | 0 (-100 %) | 96 (+56.4 %) ⚑ | 192 (+68.5 %) ⚑ | 253 (+74.4 %) ⚑ | 350 (+73 %) ⚑ | 539 (+86.8 %) ⚑ |
| schorsch-chef | 1 | 0 (-100 %) | 56 (-9.4 %) | 114 (0 %) | 152 (+4.8 %) | 248 (+22.6 %) ⚑ | 379 (+31.6 %) ⚑ |
| schorsch-chef | 2 | 0 (-100 %) | 83 (+35.1 %) ⚑ | 167 (+46.7 %) ⚑ | 233 (+60.4 %) ⚑ | 299 (+47.9 %) ⚑ | 484 (+67.8 %) ⚑ |
| kaethe-herz | 0 | 27 (+2630 %) | 112 (+81.3 %) ⚑ | 169 (+48.3 %) ⚑ | 241 (+66.1 %) ⚑ | 318 (+56.9 %) ⚑ | 461 (+59.9 %) ⚑ |
| kaethe-herz | 1 | 27 (+2630 %) | 78 (+27 %) ⚑ | 127 (+11.7 %) | 189 (+30.2 %) ⚑ | 265 (+30.8 %) ⚑ | 389 (+35.1 %) ⚑ |
| kaethe-herz | 2 | 27 (+2630 %) | 91 (+47.5 %) ⚑ | 141 (+23.5 %) ⚑ | 145 (0 %) | 202 (0 %) | 278 (-3.5 %) |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 11 (+37.5 %) | 29 (+6.9 %) | 42 (+20.5 %) ⚑ | 53 (+1.3 %) | 63 (+0.5 %) | 84 (+2.8 %) |
| dieter-wall | 1 | 11 (+37.5 %) | 18 (-33.9 %) ⚑ | 30 (-14.1 %) | 52 (0 %) | 63 (0 %) | 82 (0 %) |
| dieter-wall | 2 | 11 (+37.5 %) | 17 (-37.6 %) ⚑ | 26 (-23.9 %) ⚑ | 42 (-19.3 %) ⚑ | 50 (-20.1 %) ⚑ | 78 (-4.8 %) |
| kevin-iron | 0 | 7 (-12.5 %) | 27 (-0.4 %) | 34 (-1.7 %) | 42 (-19.9 %) ⚑ | 51 (-19.1 %) ⚑ | 69 (-16 %) ⚑ |
| kevin-iron | 1 | 7 (-12.5 %) | 27 (0 %) | 35 (0 %) | 43 (-17 %) ⚑ | 52 (-17.4 %) ⚑ | 69 (-16 %) ⚑ |
| kevin-iron | 2 | 7 (-12.5 %) | 27 (-3.3 %) | 34 (-1.7 %) | 42 (-19.9 %) ⚑ | 51 (-19.5 %) ⚑ | 63 (-23 %) ⚑ |
| schorsch-rauch | 0 | 8 (0 %) | 34 (+23.7 %) ⚑ | 44 (+27.4 %) ⚑ | 56 (+7.3 %) | 66 (+5.9 %) | 88 (+7.3 %) |
| schorsch-rauch | 1 | 8 (0 %) | 34 (+23.7 %) ⚑ | 44 (+27.7 %) ⚑ | 55 (+6.1 %) | 65 (+4.3 %) | 87 (+5.7 %) |
| schorsch-rauch | 2 | 8 (0 %) | 34 (+23.7 %) ⚑ | 44 (+27.7 %) ⚑ | 55 (+4.4 %) | 64 (+2.6 %) | 85 (+4.2 %) |

## Ausrüstung: selten

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 111 (0 %) | 208 (-11.2 %) | 226 (-24.4 %) ⚑ | 312 (-27.5 %) ⚑ | 388 (-21.8 %) ⚑ | 536 (-20.7 %) ⚑ |
| dieter-brawl | 1 | 111 (0 %) | 246 (+5 %) | 295 (-1.2 %) | 456 (+6.1 %) | 526 (+5.9 %) | 676 (0 %) |
| dieter-brawl | 2 | 111 (0 %) | 230 (-1.5 %) | 287 (-3.9 %) | 354 (-17.6 %) ⚑ | 442 (-11 %) | 607 (-10.2 %) |
| baerbel-feedback | 0 | 113 (+1.3 %) | 244 (+4.2 %) | 295 (-0.9 %) | 370 (-14 %) | 420 (-15.4 %) ⚑ | 585 (-13.6 %) |
| baerbel-feedback | 1 | 113 (+1.3 %) | 272 (+16.1 %) ⚑ | 305 (+2.1 %) | 393 (-8.7 %) | 423 (-14.8 %) | 581 (-14.2 %) |
| baerbel-feedback | 2 | 113 (+1.3 %) | 292 (+24.6 %) ⚑ | 348 (+16.7 %) ⚑ | 460 (+6.9 %) | 528 (+6.4 %) | 632 (-6.5 %) |
| baerbel-stage | 0 | 113 (+1.3 %) | 218 (-7 %) | 294 (-1.3 %) | 399 (-7.3 %) | 476 (-4.2 %) | 656 (-3 %) |
| baerbel-stage | 1 | 113 (+1.3 %) | 234 (0 %) | 344 (+15.3 %) ⚑ | 440 (+2.4 %) | 534 (+7.6 %) | 730 (+7.9 %) |
| baerbel-stage | 2 | 113 (+1.3 %) | 214 (-8.7 %) | 284 (-4.9 %) | 344 (-20 %) ⚑ | 399 (-19.6 %) ⚑ | 579 (-14.4 %) |
| kevin-fuse | 0 | 98 (-12.5 %) | 202 (-13.7 %) | 267 (-10.4 %) | 345 (-19.7 %) ⚑ | 408 (-17.9 %) ⚑ | 631 (-6.7 %) |
| kevin-fuse | 1 | 98 (-12.5 %) | 208 (-11.3 %) | 298 (0 %) | 458 (+6.5 %) | 565 (+13.9 %) | 767 (+13.3 %) |
| kevin-fuse | 2 | 98 (-12.5 %) | 258 (+10.4 %) | 335 (+12.3 %) | 447 (+4 %) | 504 (+1.4 %) | 730 (+7.9 %) |
| kevin-hunt | 0 | 98 (-12.5 %) | 243 (+3.8 %) | 311 (+4.3 %) | 402 (-6.4 %) | 486 (-2.2 %) | 685 (+1.2 %) |
| kevin-hunt | 1 | 98 (-12.5 %) | 230 (-1.5 %) | 295 (-1 %) | 411 (-4.5 %) | 485 (-2.4 %) | 641 (-5.2 %) |
| kevin-hunt | 2 | 98 (-12.5 %) | 227 (-2.9 %) | 308 (+3.1 %) | 430 (0 %) | 516 (+4 %) | 667 (-1.4 %) |
| schorsch-flamme | 0 | 125 (+12.2 %) | 269 (+14.9 %) | 386 (+29.3 %) ⚑ | 583 (+35.6 %) ⚑ | 735 (+48.1 %) ⚑ | 963 (+42.3 %) ⚑ |
| schorsch-flamme | 1 | 125 (+12.2 %) | 261 (+11.6 %) | 347 (+16.5 %) ⚑ | 619 (+43.8 %) ⚑ | 743 (+49.6 %) ⚑ | 1047 (+54.8 %) ⚑ |
| schorsch-flamme | 2 | 125 (+12.2 %) | 238 (+1.9 %) | 322 (+7.9 %) | 453 (+5.4 %) | 530 (+6.7 %) | 778 (+15.1 %) ⚑ |
| kaethe-grand | 0 | 102 (-8.4 %) | 254 (+8.6 %) | 333 (+11.5 %) | 443 (+2.9 %) | 600 (+21 %) ⚑ | 766 (+13.2 %) |
| kaethe-grand | 1 | 102 (-8.4 %) | 200 (-14.7 %) | 260 (-12.7 %) | 368 (-14.5 %) | 462 (-7 %) | 737 (+9 %) |
| kaethe-grand | 2 | 102 (-8.4 %) | 199 (-14.8 %) | 297 (-0.5 %) | 446 (+3.8 %) | 582 (+17.1 %) ⚑ | 867 (+28.2 %) ⚑ |
| kaethe-falsch | 0 | 102 (-8.4 %) | 205 (-12.6 %) | 255 (-14.4 %) | 335 (-22 %) ⚑ | 385 (-22.4 %) ⚑ | 538 (-20.4 %) ⚑ |
| kaethe-falsch | 1 | 102 (-8.4 %) | 217 (-7.3 %) | 284 (-4.8 %) | 449 (+4.5 %) | 496 (0 %) | 710 (+4.9 %) |
| kaethe-falsch | 2 | 102 (-8.4 %) | 243 (+3.8 %) | 316 (+5.9 %) | 409 (-4.8 %) | 490 (-1.2 %) | 655 (-3.1 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 37 (-44.6 %) ⚑ | 54 (-59.2 %) ⚑ | 79 (-59.8 %) ⚑ | 105 (-56 %) ⚑ | 131 (-64.9 %) ⚑ |
| dieter-brew | 1 | 0 (-100 %) | 55 (-17 %) ⚑ | 104 (-21.3 %) ⚑ | 142 (-27.1 %) ⚑ | 133 (-44.5 %) ⚑ | 178 (-52.3 %) ⚑ |
| dieter-brew | 2 | 0 (-100 %) | 47 (-29.9 %) ⚑ | 54 (-59.1 %) ⚑ | 69 (-64.5 %) ⚑ | 88 (-63.2 %) ⚑ | 126 (-66.1 %) ⚑ |
| baerbel-care | 0 | 0 (-100 %) | 66 (0 %) | 81 (-38.8 %) ⚑ | 92 (-52.7 %) ⚑ | 116 (-51.6 %) ⚑ | 211 (-43.3 %) ⚑ |
| baerbel-care | 1 | 0 (-100 %) | 48 (-27.9 %) ⚑ | 91 (-31.1 %) ⚑ | 137 (-29.9 %) ⚑ | 159 (-33.4 %) ⚑ | 294 (-21.1 %) ⚑ |
| baerbel-care | 2 | 0 (-100 %) | 53 (-20.4 %) ⚑ | 87 (-33.8 %) ⚑ | 156 (-20 %) ⚑ | 202 (-15.3 %) ⚑ | 261 (-29.9 %) ⚑ |
| schorsch-chef | 0 | 0 (-100 %) | 111 (+67.3 %) ⚑ | 237 (+79.7 %) ⚑ | 331 (+69.8 %) ⚑ | 421 (+76.4 %) ⚑ | 664 (+78.2 %) ⚑ |
| schorsch-chef | 1 | 0 (-100 %) | 64 (-3 %) | 132 (0 %) | 198 (+1.5 %) | 308 (+29.2 %) ⚑ | 484 (+30 %) ⚑ |
| schorsch-chef | 2 | 0 (-100 %) | 100 (+51.3 %) ⚑ | 202 (+53.1 %) ⚑ | 309 (+58.1 %) ⚑ | 385 (+61.2 %) ⚑ | 612 (+64.2 %) ⚑ |
| kaethe-herz | 0 | 31 (+3010 %) | 133 (+100.9 %) ⚑ | 203 (+53.8 %) ⚑ | 309 (+58.3 %) ⚑ | 393 (+64.8 %) ⚑ | 564 (+51.5 %) ⚑ |
| kaethe-herz | 1 | 31 (+3010 %) | 94 (+42.2 %) ⚑ | 147 (+11 %) | 218 (+11.6 %) | 331 (+38.6 %) ⚑ | 483 (+29.6 %) ⚑ |
| kaethe-herz | 2 | 31 (+3010 %) | 110 (+65.6 %) ⚑ | 175 (+32.1 %) ⚑ | 195 (0 %) | 239 (0 %) | 372 (0 %) |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 11 (+37.5 %) | 30 (+11.9 %) | 43 (+22.1 %) ⚑ | 52 (+2.6 %) | 63 (+3.8 %) | 84 (+3.8 %) |
| dieter-wall | 1 | 11 (+37.5 %) | 19 (-28 %) ⚑ | 29 (-15.8 %) ⚑ | 51 (0 %) | 60 (0 %) | 81 (0 %) |
| dieter-wall | 2 | 11 (+37.5 %) | 18 (-33.2 %) ⚑ | 26 (-25.2 %) ⚑ | 42 (-16.5 %) ⚑ | 52 (-14.6 %) | 77 (-4.7 %) |
| kevin-iron | 0 | 7 (-12.5 %) | 27 (0 %) | 34 (-1.4 %) | 42 (-16.7 %) ⚑ | 49 (-18.5 %) ⚑ | 66 (-18.9 %) ⚑ |
| kevin-iron | 1 | 7 (-12.5 %) | 27 (-0.4 %) | 35 (0 %) | 43 (-14.6 %) | 51 (-16.2 %) ⚑ | 67 (-17.7 %) ⚑ |
| kevin-iron | 2 | 7 (-12.5 %) | 26 (-4.5 %) | 34 (-3.2 %) | 40 (-21.9 %) ⚑ | 48 (-21 %) ⚑ | 62 (-23.2 %) ⚑ |
| schorsch-rauch | 0 | 8 (0 %) | 34 (+25 %) ⚑ | 44 (+26.6 %) ⚑ | 55 (+7.5 %) | 64 (+5.6 %) | 85 (+5.4 %) |
| schorsch-rauch | 1 | 8 (0 %) | 34 (+25 %) ⚑ | 44 (+26.9 %) ⚑ | 53 (+4.9 %) | 62 (+3.1 %) | 83 (+2.8 %) |
| schorsch-rauch | 2 | 8 (0 %) | 34 (+25 %) ⚑ | 44 (+26.9 %) ⚑ | 53 (+3.9 %) | 62 (+2.5 %) | 83 (+2 %) |

## Ausrüstung: episch

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 146 (+0.8 %) | 229 (-11.6 %) | 294 (-19 %) ⚑ | 383 (-25 %) ⚑ | 461 (-24.5 %) ⚑ | 639 (-23.4 %) ⚑ |
| dieter-brawl | 1 | 146 (+0.8 %) | 255 (-1.4 %) | 376 (+3.5 %) | 527 (+3.1 %) | 648 (+6.1 %) | 851 (+2 %) |
| dieter-brawl | 2 | 146 (+0.8 %) | 256 (-1.1 %) | 316 (-12.9 %) | 406 (-20.5 %) ⚑ | 525 (-14 %) | 648 (-22.4 %) ⚑ |
| baerbel-feedback | 0 | 145 (0 %) | 279 (+7.6 %) | 334 (-8.1 %) | 459 (-10.3 %) | 532 (-12.8 %) | 742 (-11.1 %) |
| baerbel-feedback | 1 | 145 (0 %) | 315 (+21.8 %) ⚑ | 362 (-0.4 %) | 487 (-4.7 %) | 494 (-19 %) ⚑ | 733 (-12.2 %) |
| baerbel-feedback | 2 | 145 (0 %) | 329 (+27.1 %) ⚑ | 432 (+19 %) ⚑ | 589 (+15.1 %) ⚑ | 645 (+5.7 %) | 740 (-11.4 %) |
| baerbel-stage | 0 | 145 (0 %) | 259 (0 %) | 319 (-12 %) | 466 (-8.8 %) | 541 (-11.4 %) | 755 (-9.6 %) |
| baerbel-stage | 1 | 145 (0 %) | 278 (+7.4 %) | 391 (+7.8 %) | 546 (+6.7 %) | 663 (+8.6 %) | 861 (+3.2 %) |
| baerbel-stage | 2 | 145 (0 %) | 259 (+0.1 %) | 309 (-14.7 %) | 434 (-15.2 %) ⚑ | 507 (-16.9 %) ⚑ | 745 (-10.8 %) |
| kevin-fuse | 0 | 129 (-10.7 %) | 246 (-5.1 %) | 314 (-13.5 %) | 419 (-18 %) ⚑ | 494 (-19.1 %) ⚑ | 725 (-13.1 %) |
| kevin-fuse | 1 | 129 (-10.7 %) | 240 (-7.4 %) | 344 (-5.2 %) | 572 (+11.8 %) | 639 (+4.7 %) | 865 (+3.6 %) |
| kevin-fuse | 2 | 129 (-10.7 %) | 297 (+14.7 %) | 393 (+8.4 %) | 577 (+12.8 %) | 650 (+6.5 %) | 904 (+8.4 %) |
| kevin-hunt | 0 | 129 (-10.7 %) | 257 (-0.6 %) | 382 (+5.4 %) | 486 (-5 %) | 609 (-0.2 %) | 795 (-4.8 %) |
| kevin-hunt | 1 | 129 (-10.7 %) | 248 (-4 %) | 345 (-4.9 %) | 456 (-10.8 %) | 557 (-8.8 %) | 763 (-8.6 %) |
| kevin-hunt | 2 | 129 (-10.7 %) | 268 (+3.4 %) | 379 (+4.4 %) | 505 (-1.2 %) | 626 (+2.6 %) | 810 (-3 %) |
| schorsch-flamme | 0 | 162 (+12.3 %) | 300 (+16 %) ⚑ | 469 (+29.2 %) ⚑ | 715 (+39.9 %) ⚑ | 824 (+34.9 %) ⚑ | 1129 (+35.2 %) ⚑ |
| schorsch-flamme | 1 | 162 (+12.3 %) | 296 (+14.3 %) | 423 (+16.6 %) ⚑ | 755 (+47.7 %) ⚑ | 855 (+40.1 %) ⚑ | 1248 (+49.5 %) ⚑ |
| schorsch-flamme | 2 | 162 (+12.3 %) | 274 (+6 %) | 404 (+11.2 %) | 570 (+11.4 %) | 653 (+6.9 %) | 978 (+17.2 %) ⚑ |
| kaethe-grand | 0 | 129 (-11 %) | 269 (+3.7 %) | 410 (+12.9 %) | 537 (+5.1 %) | 709 (+16.1 %) ⚑ | 936 (+12.1 %) |
| kaethe-grand | 1 | 129 (-11 %) | 239 (-7.6 %) | 305 (-15.8 %) ⚑ | 462 (-9.6 %) | 570 (-6.7 %) | 835 (0 %) |
| kaethe-grand | 2 | 129 (-11 %) | 238 (-8 %) | 364 (+0.4 %) | 564 (+10.3 %) | 706 (+15.7 %) ⚑ | 1008 (+20.8 %) ⚑ |
| kaethe-falsch | 0 | 129 (-11 %) | 243 (-6 %) | 314 (-13.5 %) | 415 (-18.8 %) ⚑ | 487 (-20.2 %) ⚑ | 659 (-21.1 %) ⚑ |
| kaethe-falsch | 1 | 129 (-11 %) | 239 (-7.8 %) | 363 (0 %) | 550 (+7.6 %) | 610 (0 %) | 882 (+5.7 %) |
| kaethe-falsch | 2 | 129 (-11 %) | 257 (-0.7 %) | 354 (-2.4 %) | 511 (0 %) | 605 (-0.9 %) | 838 (+0.4 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 46 (-47.7 %) ⚑ | 55 (-68.5 %) ⚑ | 97 (-56.9 %) ⚑ | 129 (-66.8 %) ⚑ | 172 (-64.6 %) ⚑ |
| dieter-brew | 1 | 0 (-100 %) | 65 (-26.8 %) ⚑ | 115 (-34.3 %) ⚑ | 152 (-32.1 %) ⚑ | 150 (-61.4 %) ⚑ | 204 (-58 %) ⚑ |
| dieter-brew | 2 | 0 (-100 %) | 54 (-39.2 %) ⚑ | 61 (-65.3 %) ⚑ | 80 (-64.4 %) ⚑ | 104 (-73.3 %) ⚑ | 137 (-71.7 %) ⚑ |
| baerbel-care | 0 | 0 (-100 %) | 76 (-14.9 %) | 72 (-59 %) ⚑ | 96 (-57.2 %) ⚑ | 113 (-70.9 %) ⚑ | 248 (-48.8 %) ⚑ |
| baerbel-care | 1 | 0 (-100 %) | 55 (-38.3 %) ⚑ | 96 (-45.2 %) ⚑ | 159 (-29.2 %) ⚑ | 185 (-52.4 %) ⚑ | 359 (-25.9 %) ⚑ |
| baerbel-care | 2 | 0 (-100 %) | 63 (-28.8 %) ⚑ | 94 (-46.6 %) ⚑ | 175 (-22 %) ⚑ | 236 (-39.1 %) ⚑ | 317 (-34.6 %) ⚑ |
| schorsch-chef | 0 | 0 (-100 %) | 148 (+67 %) ⚑ | 311 (+77.1 %) ⚑ | 422 (+88 %) ⚑ | 577 (+48.8 %) ⚑ | 893 (+84.2 %) ⚑ |
| schorsch-chef | 1 | 0 (-100 %) | 89 (0 %) | 176 (0 %) | 264 (+17.5 %) ⚑ | 431 (+11.1 %) | 726 (+49.8 %) ⚑ |
| schorsch-chef | 2 | 0 (-100 %) | 137 (+54.6 %) ⚑ | 260 (+48 %) ⚑ | 395 (+76.1 %) ⚑ | 500 (+29 %) ⚑ | 845 (+74.2 %) ⚑ |
| kaethe-herz | 0 | 46 (+4510 %) | 170 (+91.3 %) ⚑ | 262 (+49 %) ⚑ | 407 (+81.4 %) ⚑ | 514 (+32.6 %) ⚑ | 798 (+64.5 %) ⚑ |
| kaethe-herz | 1 | 46 (+4510 %) | 122 (+36.9 %) ⚑ | 186 (+5.9 %) | 309 (+37.5 %) ⚑ | 455 (+17.3 %) ⚑ | 674 (+39 %) ⚑ |
| kaethe-herz | 2 | 46 (+4510 %) | 134 (+51.4 %) ⚑ | 214 (+21.9 %) ⚑ | 224 (0 %) | 388 (0 %) | 485 (0 %) |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 12 (+20 %) | 29 (+8.9 %) | 41 (+21.1 %) ⚑ | 51 (+4.1 %) | 60 (+0.3 %) | 84 (+10.4 %) |
| dieter-wall | 1 | 12 (+20 %) | 21 (-21.6 %) ⚑ | 32 (-6.1 %) | 49 (0 %) | 60 (0 %) | 76 (0 %) |
| dieter-wall | 2 | 12 (+20 %) | 20 (-25.3 %) ⚑ | 28 (-17.5 %) ⚑ | 42 (-15.1 %) ⚑ | 53 (-10.9 %) | 74 (-2.6 %) |
| kevin-iron | 0 | 9 (-10 %) | 27 (-1.1 %) | 34 (0 %) | 42 (-14.7 %) | 49 (-17.3 %) ⚑ | 65 (-14.6 %) |
| kevin-iron | 1 | 9 (-10 %) | 27 (0 %) | 34 (-0.6 %) | 42 (-13.8 %) | 50 (-16.6 %) ⚑ | 65 (-15.1 %) ⚑ |
| kevin-iron | 2 | 9 (-10 %) | 25 (-8.6 %) | 32 (-5.6 %) | 40 (-18.9 %) ⚑ | 47 (-20.6 %) ⚑ | 63 (-17.3 %) ⚑ |
| schorsch-rauch | 0 | 10 (0 %) | 32 (+18.2 %) ⚑ | 42 (+23.7 %) ⚑ | 53 (+8.6 %) | 62 (+3.2 %) | 83 (+9.6 %) |
| schorsch-rauch | 1 | 10 (0 %) | 32 (+18.2 %) ⚑ | 42 (+23.7 %) ⚑ | 52 (+6.1 %) | 60 (+1.3 %) | 81 (+6.2 %) |
| schorsch-rauch | 2 | 10 (0 %) | 32 (+18.2 %) ⚑ | 42 (+23.4 %) ⚑ | 52 (+5.9 %) | 60 (+1.3 %) | 81 (+6.6 %) |

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

### schorsch-chef · Pfad 0 · Stufe 10 ·221 Schaden/s · Ausrüstung +215.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 2.6 Heilung/s · Wumms 0.4 Schaden/s · 0.2 Heilung/s · Taktgefühl 0.7 Schaden/s · 1.6 Heilung/s · Bastelgrips 0 Schaden/s · 2 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Glutbrocken 44.5 % · Grillzange 36.5 % · Autoangriff · Zangenklapper 19.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Wurstkette +7.9 % · Metzgerqualität 0 % · Auf Vorrat gegrillt 0 % · Probierhäppchen gebunden · Zweite Wurst gebunden · Satt ist satt gebunden · Notwurst gebunden · Hausmacher gebunden · Goldbraun gebunden

### schorsch-chef · Pfad 1 · Stufe 10 ·251 Schaden/s · Ausrüstung +205.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.5 Heilung/s · Wumms 2.4 Schaden/s · Taktgefühl 0.7 Schaden/s · 0.1 Heilung/s · Bastelgrips 1 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Servieren 54.4 % · Grillzange 25.8 % · Autoangriff · Zangenklapper 19.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Belegtes Brötchen 0 % · Popcorn für alle 0 % · Scharfer Senf 0 % · Grillkäse dazu gebunden · Schnell gewendet gebunden · Heißer Rost gebunden · Maiskolben dazu gebunden · Senf drauf! gebunden · Wenden! gebunden

### schorsch-chef · Pfad 2 · Stufe 10 ·256 Schaden/s · Ausrüstung +150.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 2.4 Heilung/s · Wumms 1.5 Schaden/s · 0.3 Heilung/s · Taktgefühl 2.5 Schaden/s · 0.4 Heilung/s · Bastelgrips 0.6 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Servieren 54.3 % · Grillzange 27.7 % · Autoangriff · Zangenklapper 17.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Dicke Luft +0.4 % · Buffet nachlegen 0 % · Frische Luft -0.7 % · Löschbier gebunden · Dampfgaren gebunden · Stammplatz gebunden · Feuerfeste Schürze gebunden · Ruhige Glut gebunden · Tischdienst gebunden

### schorsch-chef · Pfad 0 · Stufe 20 ·307 Schaden/s · Ausrüstung +307.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 2.9 Heilung/s · Wumms 0.5 Schaden/s · -0.3 Heilung/s · Taktgefühl 0.4 Schaden/s · -0.6 Heilung/s · Bastelgrips 0.9 Schaden/s · 2.3 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Grillzange 43.8 % · Glutbrocken 34.9 % · Autoangriff · Zangenklapper 21.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Zweite Wurst +0.5 % · Satt ist satt 0 % · Notwurst 0 % · Hausmacher 0 % · Goldbraun 0 % · Metzgerqualität 0 % · Auf Vorrat gegrillt 0 % · Meisterwurst 0 % · Löschbier 0 % · Schnell gewendet 0 % · Grillkäse dazu -6.1 % · Probierhäppchen gebunden · Wurstkette gebunden

### schorsch-chef · Pfad 1 · Stufe 20 ·357 Schaden/s · Ausrüstung +291.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 2 Heilung/s · Wumms 1.2 Schaden/s · 0.5 Heilung/s · Taktgefühl -0.1 Schaden/s · 1 Heilung/s · Bastelgrips 0.4 Schaden/s · 2.9 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Servieren 49.5 % · Grillzange 31 % · Autoangriff · Zangenklapper 19.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Maiskolben dazu +15.4 % · Volle Platte +6 % · Probierhäppchen +3.8 % · Heißer Rost +1.8 % · Senf drauf! +1.3 % · Wenden! +1.3 % · Schnell gewendet +0.1 % · Belegtes Brötchen 0 % · Scharfer Senf 0 % · Löschbier 0 % · Zweite Wurst -6.2 % · Grillkäse dazu gebunden · Popcorn für alle gebunden

### schorsch-chef · Pfad 2 · Stufe 20 ·381 Schaden/s · Ausrüstung +355.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 2.6 Heilung/s · Wumms 3.5 Schaden/s · 0.8 Heilung/s · Taktgefühl 0.9 Schaden/s · 0.8 Heilung/s · Bastelgrips 0.4 Schaden/s · 1 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Servieren 55.3 % · Grillzange 29.2 % · Autoangriff · Zangenklapper 15.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Probierhäppchen +12.4 % · Zweite Wurst +4.4 % · Ruhige Glut +4.3 % · Dampfgaren +3.1 % · Feuerfeste Schürze 0 % · Tischdienst 0 % · Buffet nachlegen 0 % · Lokalrunde 0 % · Grillkäse dazu -0.4 % · Frische Luft -0.5 % · Stammplatz -1.4 % · Löschbier gebunden · Dicke Luft gebunden

### schorsch-flamme · Pfad 0 · Stufe 10 ·386 Schaden/s · Ausrüstung +140 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.2 Heilung/s · Wumms 3 Schaden/s · -0.2 Heilung/s · Taktgefühl 3.3 Schaden/s · -0.2 Heilung/s · Bastelgrips 1.4 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Schwenkgrill 78.6 % · Grillzange 14.2 % · Autoangriff · Zangenklapper 7.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Feuerring +0.2 % · Blasebalg-Profi 0 % · Heißer Draht -3.8 % · Gut angefacht gebunden · Kurze Zündschnur gebunden · Zunder gebunden · Hitzewelle gebunden · Nach dem Knall gebunden · Nachglühen gebunden

### schorsch-flamme · Pfad 1 · Stufe 10 ·347 Schaden/s · Ausrüstung +157.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.1 Heilung/s · Wumms 1 Schaden/s · -0.1 Heilung/s · Taktgefühl 1.8 Schaden/s · -0.2 Heilung/s · Bastelgrips 0.3 Schaden/s · -0.3 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Schwenkgrill 71.8 % · Grillzange 19.3 % · Autoangriff · Zangenklapper 8.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Grillteller mit Braten +1.6 % · Knusprig +0.4 % · Zweiter Gang -3.5 % · Anbraten gebunden · Fleischermesser gebunden · Auf den Punkt gebunden · Abschrecken gebunden · Der Nächste, bitte gebunden · Fleischklopfer gebunden

### schorsch-flamme · Pfad 2 · Stufe 10 ·322 Schaden/s · Ausrüstung +151.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.1 Heilung/s · Wumms 3.3 Schaden/s · 0.2 Heilung/s · Taktgefühl 1.2 Schaden/s · 0.3 Heilung/s · Bastelgrips 0.3 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Schwenkgrill 82.8 % · Grillzange 8.7 % · Autoangriff · Zangenklapper 8.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Zangentakt 0 % · Doppelpack 0 % · Nachgießen 0 % · Kohlenschaufel gebunden · Zangenklapper im Takt gebunden · Brandbeschleuniger gebunden · Heiße Kohlen gebunden · Spiritus-Schwall gebunden · Funkensprung gebunden

### schorsch-flamme · Pfad 0 · Stufe 20 ·735 Schaden/s · Ausrüstung +219.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.2 Heilung/s · Wumms 4.6 Schaden/s · 0.2 Heilung/s · Taktgefühl 0.4 Schaden/s · 0.2 Heilung/s · Bastelgrips 0.1 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Schwenkgrill 80.1 % · Grillzange 14.7 % · Autoangriff · Zangenklapper 5.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Feuerteufel +16.8 % · Zunder +14.1 % · Nachglühen +11.5 % · Kurze Zündschnur +10.8 % · Nach dem Knall +7.2 % · Hitzewelle +3.2 % · Fleischermesser +2.6 % · Heißer Draht +2.1 % · Anbraten +1.8 % · Blasebalg-Profi 0 % · Kohlenschaufel 0 % · Gut angefacht gebunden · Feuerring gebunden

### schorsch-flamme · Pfad 1 · Stufe 20 ·743 Schaden/s · Ausrüstung +270.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.1 Heilung/s · Wumms 2 Schaden/s · Taktgefühl -0.7 Schaden/s · Bastelgrips -0.5 Schaden/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Schwenkgrill 88.1 % · Grillzange 6.6 % · Autoangriff · Zangenklapper 5.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Spanferkel-Wurf +27.4 % · Gut angefacht +5.4 % · Abschrecken +5.3 % · Der Nächste, bitte +4.7 % · Grillteller mit Braten +4.6 % · Fleischklopfer +3.5 % · Fleischermesser +2.5 % · Auf den Punkt +0.9 % · Kohlenschaufel 0 % · Kurze Zündschnur 0 % · Zweiter Gang -1.3 % · Anbraten gebunden · Knusprig gebunden

### schorsch-flamme · Pfad 2 · Stufe 20 ·530 Schaden/s · Ausrüstung +197.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.1 Heilung/s · Wumms 2 Schaden/s · -0.2 Heilung/s · Taktgefühl 0.1 Schaden/s · 0.3 Heilung/s · Bastelgrips -0.6 Schaden/s · 0.7 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Schwenkgrill 73.7 % · Grillzange 18.4 % · Autoangriff · Zangenklapper 7.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Gut angefacht +5.3 % · Zangenklapper im Takt +3 % · Flambé mit Schuss +1.1 % · Anbraten +0.4 % · Brandbeschleuniger 0 % · Spiritus-Schwall 0 % · Zangentakt 0 % · Nachgießen 0 % · Funkensprung -0.1 % · Heiße Kohlen -0.3 % · Kurze Zündschnur -0.4 % · Kohlenschaufel gebunden · Doppelpack gebunden

### schorsch-rauch · Pfad 0 · Stufe 10 ·230 Schaden/s · Ausrüstung +213.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.8 Heilung/s · Wumms 1.6 Schaden/s · Taktgefühl 1.3 Schaden/s · 0.2 Heilung/s · Bastelgrips 0.4 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 52.5 % · Grillzange 31.7 % · Autoangriff · Zangenklapper 15.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nachräuchern +4 % · Nebelmaschine 0 % · Nasses Buchenholz -6.4 % · Kalt anräuchern gebunden · Feuerlöscher gebunden · Dicker Qualm gebunden · Kalte Schulter gebunden · Deckel zu! gebunden · Räucherwurst gebunden

### schorsch-rauch · Pfad 1 · Stufe 10 ·236 Schaden/s · Ausrüstung +208.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.1 Heilung/s · Wumms 1.4 Schaden/s · Taktgefühl 0.4 Schaden/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 52.2 % · Grillzange 31.8 % · Autoangriff · Zangenklapper 15.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Deckelkonter 0 % · Zurück an den Absender 0 % · Notkäse 0 % · Garen mit Deckel gebunden · Deckelpolster gebunden · Doppelter Deckel gebunden · Käsekruste gebunden · Halloumi-Happen gebunden · Längerer Deckel gebunden

### schorsch-rauch · Pfad 2 · Stufe 10 ·248 Schaden/s · Ausrüstung +205.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 3 Schaden/s · 0.3 Heilung/s · Taktgefühl 1.4 Schaden/s · Bastelgrips 0.6 Schaden/s · -0.1 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 53.7 % · Grillzange 29 % · Autoangriff · Zangenklapper 17.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Brandmauer 0 % · Aufgeheizt 0 % · Glut unterm Deckel 0 % · Zwicken heizt gebunden · Nestwärme gebunden · Schwelbrand gebunden · Heißer Stein gebunden · Heiße Asche gebunden · Glutwächter gebunden

### schorsch-rauch · Pfad 0 · Stufe 20 ·281 Schaden/s · Ausrüstung +270.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1 Heilung/s · Wumms 0.9 Schaden/s · -0.2 Heilung/s · Taktgefühl 0.9 Schaden/s · Bastelgrips 2 Schaden/s · -0.9 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Grillzange 46.9 % · Rauch 32.7 % · Autoangriff · Zangenklapper 20.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Feuerlöscher 0 % · Dicker Qualm 0 % · Kalte Schulter 0 % · Deckel zu! 0 % · Nachräuchern 0 % · Nebelmaschine 0 % · Garen mit Deckel 0 % · Zwicken heizt 0 % · Deckelpolster 0 % · Räucherwurst -10.8 % · Räucherkammer -17 % · Kalt anräuchern gebunden · Nasses Buchenholz gebunden

### schorsch-rauch · Pfad 1 · Stufe 20 ·364 Schaden/s · Ausrüstung +305.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.1 Heilung/s · Wumms 0.7 Schaden/s · -0.3 Heilung/s · Taktgefühl 0.3 Schaden/s · -0.3 Heilung/s · Bastelgrips -1.3 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 57.1 % · Grillzange 28.5 % · Autoangriff · Zangenklapper 14.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Deckelpolster 0 % · Doppelter Deckel 0 % · Käsekruste 0 % · Halloumi-Happen 0 % · Längerer Deckel 0 % · Deckelkonter 0 % · Notkäse 0 % · Halloumi-Panzer 0 % · Kalt anräuchern 0 % · Zwicken heizt 0 % · Feuerlöscher 0 % · Garen mit Deckel gebunden · Zurück an den Absender gebunden

### schorsch-rauch · Pfad 2 · Stufe 20 ·378 Schaden/s · Ausrüstung +228.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.1 Heilung/s · Wumms 0.5 Schaden/s · 0.2 Heilung/s · Taktgefühl 0.5 Schaden/s · -0.2 Heilung/s · Bastelgrips -0.1 Schaden/s · -0.1 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 60.1 % · Grillzange 25.1 % · Autoangriff · Zangenklapper 14.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Schwelbrand +1.3 % · Nestwärme 0 % · Heißer Stein 0 % · Heiße Asche 0 % · Glutwächter 0 % · Brandmauer 0 % · Glut unterm Deckel 0 % · Kalt anräuchern 0 % · Garen mit Deckel 0 % · Feuerlöscher 0 % · Glutherz -2.3 % · Zwicken heizt gebunden · Aufgeheizt gebunden

### kaethe-grand · Pfad 0 · Stufe 10 ·333 Schaden/s · Ausrüstung +127.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1 Heilung/s · Wumms 2.4 Schaden/s · -0.2 Heilung/s · Taktgefühl 0.4 Schaden/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 90.3 % · Autoangriff · Kartenschnipsen 9.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Spitzen +3 % · Auf die Hand 0 % · Trumpf nachziehen 0 % · Wenzel gebunden · Kreuz-Bube gebunden · Bube zieht nach gebunden · Der letzte Stich gebunden · Mit Vieren gebunden · Der Alte gebunden

### kaethe-grand · Pfad 1 · Stufe 10 ·260 Schaden/s · Ausrüstung +129.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.1 Heilung/s · Wumms 1 Schaden/s · -0.2 Heilung/s · Taktgefühl 1 Schaden/s · -0.3 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 87.3 % · Autoangriff · Kartenschnipsen 12.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Volle Augen +4.8 % · Buchführung +0.8 % · Strich auf dem Block 0 % · Mitzählen gebunden · Pfennigfuchserin gebunden · Knapp gewonnen gebunden · Gestochen scharf gebunden · Reizen gebunden · Skat drücken gebunden

### kaethe-grand · Pfad 2 · Stufe 10 ·297 Schaden/s · Ausrüstung +118.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.6 Heilung/s · Wumms 1.4 Schaden/s · 0.1 Heilung/s · Taktgefühl 0.5 Schaden/s · Bastelgrips 0 Schaden/s · 0.6 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 86.7 % · Autoangriff · Kartenschnipsen 13.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Unter der Hand 0 % · Durchmarsch 0 % · Nullspiel 0 % · Kleinvieh gebunden · Kleine Fische gebunden · Schnipp, schnapp gebunden · Ouvert gebunden · Blatt aufgefächert gebunden · Bis zum Anschlag gebunden

### kaethe-grand · Pfad 0 · Stufe 20 ·600 Schaden/s · Ausrüstung +176.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.1 Heilung/s · Wumms 3.1 Schaden/s · 0.5 Heilung/s · Taktgefühl -0.4 Schaden/s · -0.2 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 88.5 % · Autoangriff · Kartenschnipsen 11.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Bube zieht nach +18.5 % · Kreuz-Bube +12.4 % · Grand Hand +11.5 % · Pfennigfuchserin +9.4 % · Spitzen +9.2 % · Kleinvieh +9.1 % · Mitzählen +8.3 % · Der letzte Stich +7.2 % · Mit Vieren +6.5 % · Der Alte 0 % · Auf die Hand 0 % · Wenzel gebunden · Trumpf nachziehen gebunden

### kaethe-grand · Pfad 1 · Stufe 20 ·462 Schaden/s · Ausrüstung +133.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.2 Heilung/s · Wumms 0.8 Schaden/s · Taktgefühl -1 Schaden/s · 0.3 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 88.4 % · Autoangriff · Kartenschnipsen 11.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kreuz-Bube +7.9 % · Kleinvieh +7.8 % · Pfennigfuchserin +5.8 % · Volle Augen +4 % · Revanche +3.6 % · Knapp gewonnen +1.9 % · Wenzel +1.8 % · Gestochen scharf 0 % · Reizen 0 % · Skat drücken 0 % · Strich auf dem Block 0 % · Mitzählen gebunden · Buchführung gebunden

### kaethe-grand · Pfad 2 · Stufe 20 ·582 Schaden/s · Ausrüstung +175.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.1 Heilung/s · Wumms 0 Schaden/s · 1 Heilung/s · Taktgefühl -0.8 Schaden/s · 1 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 90.8 % · Autoangriff · Kartenschnipsen 9.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Null ouvert Hand +18.7 % · Blatt aufgefächert +9 % · Kreuz-Bube +7.9 % · Schnipp, schnapp +6.6 % · Mitzählen +4.9 % · Kleine Fische +3.6 % · Wenzel +2.9 % · Ouvert 0 % · Bis zum Anschlag 0 % · Unter der Hand 0 % · Nullspiel 0 % · Kleinvieh gebunden · Durchmarsch gebunden

### kaethe-herz · Pfad 0 · Stufe 10 ·192 Schaden/s · Ausrüstung +140.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 2.5 Heilung/s · Wumms 1.1 Schaden/s · 0.4 Heilung/s · Taktgefühl 0.2 Schaden/s · 0.6 Heilung/s · Bastelgrips 0 Schaden/s · 1 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 87.2 % · Autoangriff · Kartenschnipsen 12.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Herzensangelegenheit +4.6 % · Warmer Eierlikör 0 % · Noch eins, dann neu 0 % · Das Herz am rechten Fleck gebunden · Rote Dame gebunden · Nachschenken gebunden · Herzklopfen gebunden · Handlesen gebunden · Lebenslinie gebunden

### kaethe-herz · Pfad 1 · Stufe 10 ·195 Schaden/s · Ausrüstung +135 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.9 Heilung/s · Wumms 1.3 Schaden/s · 0.4 Heilung/s · Taktgefühl 0.3 Schaden/s · 1 Heilung/s · Bastelgrips 0 Schaden/s · 0.7 Heilung/s · Dicke Haut -0.1 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 86.8 % · Autoangriff · Kartenschnipsen 13.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Masche für Masche 0 % · Nichts verschenken 0 % · Doppelt gemauert 0 % · Pik auf die Brust gebunden · Letzte Masche gebunden · Pik-Ass gebunden · Mauern gebunden · Pik mit Stachel gebunden · Pik-Kette gebunden

### kaethe-herz · Pfad 2 · Stufe 10 ·199 Schaden/s · Ausrüstung +144.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 2.2 Heilung/s · Wumms 0.6 Schaden/s · -0.7 Heilung/s · Taktgefühl 0.3 Schaden/s · 0.3 Heilung/s · Bastelgrips 0 Schaden/s · 0.8 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 89.2 % · Autoangriff · Kartenschnipsen 10.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Legekreis im Gehen 0 % · Zukunft gesehen 0 % · Kartenlegen 0 % · Sterne lesen gebunden · Farbe halten gebunden · Wahrsagekugel gebunden · Blick über die Schulter gebunden · Hab ich kommen sehen gebunden · Kaffeefahrt gebunden

### kaethe-herz · Pfad 0 · Stufe 20 ·304 Schaden/s · Ausrüstung +175.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 2.7 Heilung/s · Wumms 0.4 Schaden/s · -0.9 Heilung/s · Taktgefühl -0.1 Schaden/s · 0.1 Heilung/s · Bastelgrips 0 Schaden/s · 1.1 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 86.8 % · Autoangriff · Kartenschnipsen 13.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Sterne lesen +0.9 % · Rote Dame 0 % · Nachschenken 0 % · Herzklopfen 0 % · Handlesen 0 % · Lebenslinie 0 % · Warmer Eierlikör 0 % · Noch eins, dann neu 0 % · Rote Rechnung 0 % · Pik auf die Brust 0 % · Letzte Masche 0 % · Das Herz am rechten Fleck gebunden · Herzensangelegenheit gebunden

### kaethe-herz · Pfad 1 · Stufe 20 ·290 Schaden/s · Ausrüstung +165.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 2.5 Heilung/s · Wumms 0.1 Schaden/s · 0.2 Heilung/s · Taktgefühl -0.5 Schaden/s · Bastelgrips 0 Schaden/s · 0.9 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 88 % · Autoangriff · Kartenschnipsen 12 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Pik mit Stachel +1.4 % · Sterne lesen +0.6 % · Letzte Masche 0 % · Pik-Ass 0 % · Mauern 0 % · Pik-Kette 0 % · Masche für Masche 0 % · Doppelt gemauert 0 % · Schutzbrief 0 % · Das Herz am rechten Fleck 0 % · Rote Dame 0 % · Pik auf die Brust gebunden · Nichts verschenken gebunden

### kaethe-herz · Pfad 2 · Stufe 20 ·319 Schaden/s · Ausrüstung +173.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 2 Heilung/s · Wumms 0.5 Schaden/s · -0.6 Heilung/s · Taktgefühl -1.5 Schaden/s · 1.3 Heilung/s · Bastelgrips 0 Schaden/s · 0.8 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 91 % · Autoangriff · Kartenschnipsen 9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Die Karten lügen nie +4.2 % · Kaffeefahrt +1.9 % · Farbe halten 0 % · Wahrsagekugel 0 % · Blick über die Schulter 0 % · Hab ich kommen sehen 0 % · Legekreis im Gehen 0 % · Kartenlegen 0 % · Das Herz am rechten Fleck 0 % · Pik auf die Brust 0 % · Rote Dame 0 % · Sterne lesen gebunden · Zukunft gesehen gebunden

### kaethe-falsch · Pfad 0 · Stufe 10 ·255 Schaden/s · Ausrüstung +127.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.2 Heilung/s · Wumms 1.9 Schaden/s · 0.1 Heilung/s · Taktgefühl 1.1 Schaden/s · 0.5 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 87.1 % · Autoangriff · Kartenschnipsen 12.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kontra mit Ansage 0 % · Dicke Strickjacke 0 % · Mauer nach dem Stich 0 % · Hab ich doch gesagt gebunden · Kontra zahlt gebunden · Hochgestochen gebunden · Stichfest gebunden · Da guckst du gebunden · Kontra im Takt gebunden

### kaethe-falsch · Pfad 1 · Stufe 10 ·284 Schaden/s · Ausrüstung +116.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.4 Heilung/s · Wumms 2.5 Schaden/s · -0.9 Heilung/s · Taktgefühl 1.2 Schaden/s · Bastelgrips 0 Schaden/s · 0.5 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 87.9 % · Autoangriff · Kartenschnipsen 12.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Flinke Finger +16 % · Nachgesteckt 0 % · Mischen ist Silber 0 % · Aus dem Ärmel gebunden · Notblatt gebunden · Bubentrick gebunden · Ärmel voll gebunden · Gezinkte Karten gebunden · Falsch gemischt gebunden

### kaethe-falsch · Pfad 2 · Stufe 10 ·316 Schaden/s · Ausrüstung +124.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.3 Heilung/s · Wumms 2 Schaden/s · -1 Heilung/s · Taktgefühl 0.2 Schaden/s · -0.2 Heilung/s · Bastelgrips 0 Schaden/s · 0.5 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 87.9 % · Autoangriff · Kartenschnipsen 12.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Karo satt 0 % · Bockrunde 0 % · Hier geblieben! 0 % · Re! gebunden · Karo-Zehn gebunden · Kreuz-Dame gebunden · Karo bedient gebunden · Karo-Ass gebunden · Kreuz-Kette gebunden

### kaethe-falsch · Pfad 0 · Stufe 20 ·385 Schaden/s · Ausrüstung +173.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.3 Heilung/s · Wumms -0.2 Schaden/s · Taktgefühl -1 Schaden/s · 0.6 Heilung/s · Bastelgrips 0 Schaden/s · 0.5 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 85.4 % · Autoangriff · Kartenschnipsen 14.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kontra zahlt 0 % · Hochgestochen 0 % · Stichfest 0 % · Da guckst du 0 % · Kontra im Takt 0 % · Kontra mit Ansage 0 % · Mauer nach dem Stich 0 % · Aus dem Ärmel 0 % · Re! 0 % · Notblatt 0 % · Kontra gewonnen -0.6 % · Hab ich doch gesagt gebunden · Dicke Strickjacke gebunden

### kaethe-falsch · Pfad 1 · Stufe 20 ·496 Schaden/s · Ausrüstung +183.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1 Heilung/s · Wumms -0.1 Schaden/s · 0.3 Heilung/s · Taktgefühl -0.9 Schaden/s · 0.1 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 90.8 % · Autoangriff · Kartenschnipsen 9.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Falsch abgerechnet +20.3 % · Flinke Finger +18.1 % · Ärmel voll +0.7 % · Notblatt 0 % · Bubentrick 0 % · Gezinkte Karten 0 % · Falsch gemischt 0 % · Nachgesteckt 0 % · Hab ich doch gesagt 0 % · Re! 0 % · Kontra zahlt 0 % · Aus dem Ärmel gebunden · Mischen ist Silber gebunden

### kaethe-falsch · Pfad 2 · Stufe 20 ·490 Schaden/s · Ausrüstung +177.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.3 Heilung/s · Wumms 3.6 Schaden/s · -0.5 Heilung/s · Taktgefühl 1.1 Schaden/s · -0.7 Heilung/s · Bastelgrips 0 Schaden/s · 0.5 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 87.7 % · Autoangriff · Kartenschnipsen 12.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kreuz-Dame +8.2 % · Re und Bock +8.1 % · Karo-Ass +3 % · Kreuz-Kette +1.9 % · Karo-Zehn 0 % · Karo bedient 0 % · Karo satt 0 % · Hier geblieben! 0 % · Hab ich doch gesagt 0 % · Aus dem Ärmel 0 % · Kontra zahlt 0 % · Re! gebunden · Bockrunde gebunden

