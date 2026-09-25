# Balance-Sheet

Automatisch erzeugt von `npm run balance:sheet` · 2026-09-25 · 40 s Übungskampf, jede Zelle und jede Zerlegung als Mittel aus Boss (10× Feldleben) und Feldgruppe (drei Gegner mit Umland-Leben); gefallene Gegner ersetzt sofort ein neuer (Kill-Talente zählen), Zufall mit 3 festen Startwerten gemittelt, gemeinsame Prioritäten-Rotation (Heiler heilen zuerst), Puppen treffen jede Sekunde mit 3 % des Grundlebens. Voller Ausrüstungssatz auf Charakterstufe (Werteprofile im Wechsel); „Startausrüstung“ = Flasche, Topfdeckel, Schleuder, Kutte. Talentpfad 0–2 über `pathBuild`, Stufe 1 ohne Spezialisierung.

Jede Rolle misst sich an ihrer Kennzahl: **Schaden** → Schaden/s, **Heilung** → Heilung/s (Ausstoß inkl. Überheilung), **Tank** → Schutz/s (verhinderter Schaden + Deckung). Zelle: Kennzahl (Abweichung vom Median der Rolle auf dieser Stufe × Ausrüstung). ⚑ = mehr als 15 % daneben (ab Stufe 5).

## Überblick

368 von 900 Messungen liegen mehr als 15 % neben dem Median ihrer Rolle.

## Ausrüstung: Startausrüstung

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 59 (-1.5 %) | 101 (-10.1 %) | 107 (-21.1 %) ⚑ | 125 (-22.3 %) ⚑ | 143 (-20.8 %) ⚑ | 181 (-15.5 %) ⚑ |
| dieter-brawl | 1 | 59 (-1.5 %) | 114 (+1.9 %) | 149 (+9.6 %) | 187 (+16.4 %) ⚑ | 208 (+15.3 %) ⚑ | 246 (+14.6 %) |
| dieter-brawl | 2 | 59 (-1.5 %) | 110 (-1.3 %) | 126 (-7.7 %) | 133 (-16.9 %) ⚑ | 159 (-12.1 %) | 189 (-11.7 %) |
| baerbel-feedback | 0 | 61 (+0.8 %) | 131 (+16.8 %) ⚑ | 145 (+6.8 %) | 143 (-11.2 %) | 152 (-15.8 %) ⚑ | 165 (-23 %) ⚑ |
| baerbel-feedback | 1 | 61 (+0.8 %) | 141 (+25.8 %) ⚑ | 136 (+0.1 %) | 145 (-9.8 %) | 147 (-18.5 %) ⚑ | 163 (-23.9 %) ⚑ |
| baerbel-feedback | 2 | 61 (+0.8 %) | 146 (+30 %) ⚑ | 180 (+32.6 %) ⚑ | 193 (+20.4 %) ⚑ | 202 (+11.5 %) | 216 (+0.6 %) |
| baerbel-stage | 0 | 61 (+0.8 %) | 111 (-1.3 %) | 135 (-0.7 %) | 170 (+6 %) | 181 (0 %) | 220 (+2.4 %) |
| baerbel-stage | 1 | 61 (+0.8 %) | 127 (+13.1 %) | 154 (+13.2 %) | 174 (+8.2 %) | 193 (+6.9 %) | 215 (0 %) |
| baerbel-stage | 2 | 61 (+0.8 %) | 118 (+5.8 %) | 128 (-5.7 %) | 147 (-8.6 %) | 155 (-14.4 %) | 181 (-15.6 %) ⚑ |
| kevin-fuse | 0 | 50 (-16.2 %) | 108 (-3.9 %) | 125 (-8.4 %) | 127 (-20.7 %) ⚑ | 136 (-24.8 %) ⚑ | 201 (-6.3 %) |
| kevin-fuse | 1 | 50 (-16.2 %) | 108 (-3.1 %) | 133 (-2.2 %) | 170 (+5.9 %) | 193 (+6.5 %) | 247 (+14.9 %) |
| kevin-fuse | 2 | 50 (-16.2 %) | 123 (+10.1 %) | 143 (+5.2 %) | 158 (-1.4 %) | 163 (-9.8 %) | 201 (-6.5 %) |
| kevin-hunt | 0 | 50 (-16.2 %) | 134 (+19.8 %) ⚑ | 147 (+8 %) | 161 (0 %) | 178 (-1.7 %) | 188 (-12.4 %) |
| kevin-hunt | 1 | 50 (-16.2 %) | 121 (+8.5 %) | 136 (-0.1 %) | 153 (-4.6 %) | 149 (-17.5 %) ⚑ | 181 (-15.9 %) ⚑ |
| kevin-hunt | 2 | 50 (-16.2 %) | 125 (+11.5 %) | 153 (+12.8 %) | 198 (+23.3 %) ⚑ | 209 (+15.8 %) ⚑ | 235 (+9.4 %) |
| schorsch-flamme | 0 | 69 (+15 %) | 111 (-0.7 %) | 160 (+17.7 %) ⚑ | 196 (+22.3 %) ⚑ | 210 (+15.9 %) ⚑ | 279 (+30.1 %) ⚑ |
| schorsch-flamme | 1 | 69 (+15 %) | 99 (-11.9 %) | 133 (-2.3 %) | 185 (+15.1 %) ⚑ | 201 (+11.3 %) | 256 (+19.2 %) ⚑ |
| schorsch-flamme | 2 | 69 (+15 %) | 95 (-15.3 %) ⚑ | 128 (-5.5 %) | 151 (-5.9 %) | 163 (-9.6 %) | 201 (-6.2 %) |
| kaethe-grand | 0 | 60 (0 %) | 114 (+2.1 %) | 128 (-6.2 %) | 161 (+0.4 %) | 210 (+16.2 %) ⚑ | 258 (+20.3 %) ⚑ |
| kaethe-grand | 1 | 60 (0 %) | 104 (-6.8 %) | 113 (-17.1 %) ⚑ | 152 (-5.6 %) | 195 (+7.9 %) | 271 (+26.3 %) ⚑ |
| kaethe-grand | 2 | 60 (0 %) | 111 (-1.1 %) | 141 (+4 %) | 188 (+17 %) ⚑ | 224 (+24.1 %) ⚑ | 253 (+17.9 %) ⚑ |
| kaethe-falsch | 0 | 60 (0 %) | 104 (-7.5 %) | 112 (-17.7 %) ⚑ | 128 (-20.6 %) ⚑ | 142 (-21.4 %) ⚑ | 182 (-15.1 %) ⚑ |
| kaethe-falsch | 1 | 60 (0 %) | 101 (-9.7 %) | 138 (+1.3 %) | 177 (+10.5 %) | 183 (+1.2 %) | 249 (+16.2 %) ⚑ |
| kaethe-falsch | 2 | 60 (0 %) | 112 (0 %) | 136 (0 %) | 152 (-5.2 %) | 160 (-11.4 %) | 193 (-10.3 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 31 (-20.7 %) ⚑ | 32 (-49.8 %) ⚑ | 45 (-50 %) ⚑ | 54 (-50.4 %) ⚑ | 55 (-60.5 %) ⚑ |
| dieter-brew | 1 | 0 (-100 %) | 38 (-1.8 %) | 64 (0 %) | 89 (-1.4 %) | 104 (-4.9 %) | 128 (-8.9 %) |
| dieter-brew | 2 | 0 (-100 %) | 30 (-23.6 %) ⚑ | 36 (-43.2 %) ⚑ | 42 (-53.5 %) ⚑ | 46 (-57.8 %) ⚑ | 57 (-59.3 %) ⚑ |
| baerbel-care | 0 | 0 (-100 %) | 55 (+43 %) ⚑ | 73 (+15.3 %) ⚑ | 93 (+3.3 %) | 109 (0 %) | 138 (-1.4 %) |
| baerbel-care | 1 | 0 (-100 %) | 39 (0 %) | 78 (+23.3 %) ⚑ | 115 (+27.3 %) ⚑ | 151 (+38.2 %) ⚑ | 203 (+45.4 %) ⚑ |
| baerbel-care | 2 | 0 (-100 %) | 42 (+9.3 %) | 59 (-7.2 %) | 95 (+5.8 %) | 138 (+26 %) ⚑ | 172 (+22.7 %) ⚑ |
| schorsch-chef | 0 | 0 (-100 %) | 45 (+15.3 %) ⚑ | 89 (+39.9 %) ⚑ | 101 (+12.2 %) | 128 (+17.5 %) ⚑ | 180 (+28.9 %) ⚑ |
| schorsch-chef | 1 | 0 (-100 %) | 27 (-30.1 %) ⚑ | 44 (-30.3 %) ⚑ | 57 (-37.1 %) ⚑ | 96 (-12.2 %) | 140 (0 %) |
| schorsch-chef | 2 | 0 (-100 %) | 38 (-1.3 %) | 64 (+0.5 %) | 99 (+10.1 %) | 114 (+4.6 %) | 176 (+26.1 %) ⚑ |
| kaethe-herz | 0 | 21 (+1970 %) | 51 (+33.2 %) ⚑ | 64 (+0.3 %) | 90 (0 %) | 111 (+1.4 %) | 152 (+8.4 %) |
| kaethe-herz | 1 | 21 (+1970 %) | 33 (-14.8 %) | 41 (-35.8 %) ⚑ | 61 (-32.8 %) ⚑ | 83 (-23.6 %) ⚑ | 120 (-14.1 %) |
| kaethe-herz | 2 | 21 (+1970 %) | 42 (+9.1 %) | 52 (-18.6 %) ⚑ | 62 (-31.6 %) ⚑ | 91 (-16.5 %) ⚑ | 129 (-7.6 %) |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 8 (+48.1 %) | 25 (-15.9 %) ⚑ | 39 (+0.3 %) | 44 (-9.1 %) | 52 (-10.5 %) | 65 (-13.7 %) |
| dieter-wall | 1 | 8 (+48.1 %) | 14 (-53 %) ⚑ | 22 (-41.9 %) ⚑ | 42 (-12.6 %) | 55 (-4.7 %) | 71 (-5.9 %) |
| dieter-wall | 2 | 8 (+48.1 %) | 14 (-54.4 %) ⚑ | 23 (-40.4 %) ⚑ | 34 (-30.7 %) ⚑ | 41 (-28.7 %) ⚑ | 63 (-16.5 %) ⚑ |
| kevin-iron | 0 | 3 (-44.4 %) | 30 (0 %) | 38 (0 %) | 49 (0 %) | 59 (+2.4 %) | 79 (+4.8 %) |
| kevin-iron | 1 | 3 (-44.4 %) | 30 (+2 %) | 39 (+2.3 %) | 49 (0 %) | 58 (0 %) | 75 (0 %) |
| kevin-iron | 2 | 3 (-44.4 %) | 26 (-11.5 %) | 35 (-10.2 %) | 43 (-12.4 %) | 53 (-7.8 %) | 72 (-3.9 %) |
| schorsch-rauch | 0 | 5 (0 %) | 33 (+9.8 %) | 35 (-8.6 %) | 57 (+17.7 %) ⚑ | 66 (+14.5 %) | 85 (+12.6 %) |
| schorsch-rauch | 1 | 5 (0 %) | 36 (+23 %) ⚑ | 51 (+32.3 %) ⚑ | 63 (+30.3 %) ⚑ | 76 (+30.4 %) ⚑ | 99 (+31.3 %) ⚑ |
| schorsch-rauch | 2 | 5 (0 %) | 33 (+9.8 %) | 43 (+13 %) | 56 (+14.8 %) | 66 (+13.1 %) | 84 (+11.7 %) |

## Ausrüstung: ungewöhnlich

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 94 (0 %) | 167 (-10.5 %) | 205 (-22.1 %) ⚑ | 265 (-23.1 %) ⚑ | 315 (-25.3 %) ⚑ | 449 (-22.7 %) ⚑ |
| dieter-brawl | 1 | 94 (0 %) | 197 (+5.4 %) | 264 (+0.5 %) | 369 (+7.3 %) | 429 (+1.6 %) | 666 (+14.6 %) |
| dieter-brawl | 2 | 94 (0 %) | 186 (-0.4 %) | 243 (-7.5 %) | 305 (-11.2 %) | 393 (-6.8 %) | 499 (-14.1 %) |
| baerbel-feedback | 0 | 98 (+4 %) | 200 (+7.2 %) | 255 (-3.1 %) | 315 (-8.4 %) | 385 (-8.8 %) | 502 (-13.7 %) |
| baerbel-feedback | 1 | 98 (+4 %) | 226 (+21.1 %) ⚑ | 263 (0 %) | 316 (-8 %) | 365 (-13.4 %) | 492 (-15.4 %) ⚑ |
| baerbel-feedback | 2 | 98 (+4 %) | 240 (+28.5 %) ⚑ | 306 (+16.3 %) ⚑ | 368 (+7 %) | 441 (+4.6 %) | 553 (-4.9 %) |
| baerbel-stage | 0 | 98 (+4 %) | 183 (-2 %) | 250 (-4.8 %) | 347 (+0.9 %) | 419 (-0.7 %) | 577 (-0.7 %) |
| baerbel-stage | 1 | 98 (+4 %) | 203 (+8.6 %) | 301 (+14.5 %) | 400 (+16.2 %) ⚑ | 447 (+5.9 %) | 604 (+4 %) |
| baerbel-stage | 2 | 98 (+4 %) | 183 (-2.4 %) | 231 (-12.1 %) | 294 (-14.4 %) | 349 (-17.4 %) ⚑ | 478 (-17.8 %) ⚑ |
| kevin-fuse | 0 | 83 (-12.2 %) | 173 (-7.6 %) | 230 (-12.7 %) | 287 (-16.7 %) ⚑ | 340 (-19.4 %) ⚑ | 516 (-11.2 %) |
| kevin-fuse | 1 | 83 (-12.2 %) | 168 (-10.3 %) | 258 (-2 %) | 367 (+6.5 %) | 480 (+13.8 %) | 663 (+14 %) |
| kevin-fuse | 2 | 83 (-12.2 %) | 209 (+11.9 %) | 292 (+11 %) | 354 (+2.8 %) | 449 (+6.4 %) | 601 (+3.4 %) |
| kevin-hunt | 0 | 83 (-12.2 %) | 200 (+7.2 %) | 264 (+0.5 %) | 344 (0 %) | 416 (-1.5 %) | 579 (-0.3 %) |
| kevin-hunt | 1 | 83 (-12.2 %) | 182 (-2.8 %) | 236 (-10.2 %) | 322 (-6.3 %) | 389 (-7.8 %) | 537 (-7.7 %) |
| kevin-hunt | 2 | 83 (-12.2 %) | 200 (+6.9 %) | 280 (+6.5 %) | 375 (+9 %) | 452 (+7.1 %) | 591 (+1.6 %) |
| schorsch-flamme | 0 | 109 (+15.4 %) | 212 (+13.2 %) | 332 (+26.4 %) ⚑ | 479 (+39.2 %) ⚑ | 559 (+32.4 %) ⚑ | 763 (+31.3 %) ⚑ |
| schorsch-flamme | 1 | 109 (+15.4 %) | 204 (+9 %) | 305 (+15.9 %) ⚑ | 481 (+39.8 %) ⚑ | 566 (+34.1 %) ⚑ | 862 (+48.3 %) ⚑ |
| schorsch-flamme | 2 | 109 (+15.4 %) | 187 (0 %) | 274 (+4.2 %) | 340 (-1.1 %) | 422 (0 %) | 615 (+5.7 %) |
| kaethe-grand | 0 | 91 (-3.9 %) | 198 (+5.6 %) | 283 (+7.8 %) | 330 (-4 %) | 437 (+3.7 %) | 635 (+9.2 %) |
| kaethe-grand | 1 | 91 (-3.9 %) | 170 (-8.9 %) | 229 (-12.8 %) | 288 (-16.2 %) ⚑ | 379 (-10.2 %) | 581 (0 %) |
| kaethe-grand | 2 | 91 (-3.9 %) | 162 (-13.6 %) | 244 (-7 %) | 367 (+6.6 %) | 497 (+17.7 %) ⚑ | 650 (+11.8 %) |
| kaethe-falsch | 0 | 91 (-3.9 %) | 176 (-5.8 %) | 231 (-12.2 %) | 279 (-19 %) ⚑ | 339 (-19.6 %) ⚑ | 476 (-18.1 %) ⚑ |
| kaethe-falsch | 1 | 91 (-3.9 %) | 176 (-5.8 %) | 245 (-6.8 %) | 334 (-3 %) | 422 (+0.1 %) | 599 (+3 %) |
| kaethe-falsch | 2 | 91 (-3.9 %) | 187 (-0.2 %) | 273 (+3.8 %) | 350 (+1.6 %) | 397 (-5.9 %) | 526 (-9.5 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 39 (-36.4 %) ⚑ | 48 (-54.9 %) ⚑ | 73 (-52 %) ⚑ | 97 (-56.9 %) ⚑ | 114 (-65.8 %) ⚑ |
| dieter-brew | 1 | 0 (-100 %) | 54 (-11.5 %) | 92 (-13.4 %) | 113 (-25.5 %) ⚑ | 132 (-41.3 %) ⚑ | 174 (-47.8 %) ⚑ |
| dieter-brew | 2 | 0 (-100 %) | 42 (-31.1 %) ⚑ | 48 (-54.6 %) ⚑ | 61 (-59.7 %) ⚑ | 80 (-64.5 %) ⚑ | 113 (-66.1 %) ⚑ |
| baerbel-care | 0 | 0 (-100 %) | 62 (0 %) | 68 (-36 %) ⚑ | 84 (-44.3 %) ⚑ | 97 (-57 %) ⚑ | 185 (-44.4 %) ⚑ |
| baerbel-care | 1 | 0 (-100 %) | 52 (-15.4 %) ⚑ | 89 (-16.7 %) ⚑ | 144 (-5.2 %) | 176 (-21.7 %) ⚑ | 288 (-13.5 %) |
| baerbel-care | 2 | 0 (-100 %) | 52 (-14.8 %) | 81 (-24 %) ⚑ | 139 (-8.2 %) | 188 (-16.3 %) ⚑ | 247 (-25.9 %) ⚑ |
| schorsch-chef | 0 | 0 (-100 %) | 96 (+55.6 %) ⚑ | 195 (+83.7 %) ⚑ | 253 (+67.2 %) ⚑ | 350 (+55.8 %) ⚑ | 531 (+59.4 %) ⚑ |
| schorsch-chef | 1 | 0 (-100 %) | 55 (-9.9 %) | 115 (+7.8 %) | 151 (0 %) | 238 (+6 %) | 356 (+6.7 %) |
| schorsch-chef | 2 | 0 (-100 %) | 82 (+33.5 %) ⚑ | 168 (+58.3 %) ⚑ | 225 (+48.5 %) ⚑ | 299 (+33.2 %) ⚑ | 474 (+42.1 %) ⚑ |
| kaethe-herz | 0 | 31 (+2980 %) | 96 (+55.4 %) ⚑ | 161 (+51.4 %) ⚑ | 222 (+46.8 %) ⚑ | 284 (+26.3 %) ⚑ | 427 (+28.1 %) ⚑ |
| kaethe-herz | 1 | 31 (+2980 %) | 67 (+8.1 %) | 106 (0 %) | 159 (+5.3 %) | 236 (+4.8 %) | 335 (+0.4 %) |
| kaethe-herz | 2 | 31 (+2980 %) | 78 (+26.3 %) ⚑ | 129 (+21.1 %) ⚑ | 163 (+7.3 %) | 225 (0 %) | 333 (0 %) |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 11 (+57.1 %) | 29 (+6.2 %) | 42 (+19.8 %) ⚑ | 53 (+1.3 %) | 63 (+0.5 %) | 84 (+2.8 %) |
| dieter-wall | 1 | 11 (+57.1 %) | 18 (-34.4 %) ⚑ | 30 (-14.6 %) | 52 (0 %) | 63 (0 %) | 82 (0 %) |
| dieter-wall | 2 | 11 (+57.1 %) | 17 (-38 %) ⚑ | 26 (-24.4 %) ⚑ | 42 (-19.3 %) ⚑ | 50 (-20.1 %) ⚑ | 78 (-4.8 %) |
| kevin-iron | 0 | 7 (0 %) | 27 (-1.4 %) | 34 (-2.9 %) | 42 (-20.3 %) ⚑ | 51 (-19.1 %) ⚑ | 69 (-15.5 %) ⚑ |
| kevin-iron | 1 | 7 (0 %) | 28 (0 %) | 35 (0 %) | 43 (-16.9 %) ⚑ | 52 (-17.2 %) ⚑ | 68 (-16.4 %) ⚑ |
| kevin-iron | 2 | 7 (0 %) | 27 (-3.6 %) | 34 (-2.6 %) | 42 (-19.9 %) ⚑ | 51 (-19.5 %) ⚑ | 64 (-21.9 %) ⚑ |
| schorsch-rauch | 0 | 7 (0 %) | 35 (+27.9 %) ⚑ | 45 (+30.1 %) ⚑ | 58 (+10.2 %) | 68 (+8.9 %) | 91 (+10.6 %) |
| schorsch-rauch | 1 | 7 (0 %) | 35 (+27.9 %) ⚑ | 46 (+30.4 %) ⚑ | 57 (+9.2 %) | 67 (+7.3 %) | 89 (+9 %) |
| schorsch-rauch | 2 | 7 (0 %) | 35 (+27.9 %) ⚑ | 46 (+30.7 %) ⚑ | 56 (+7.3 %) | 66 (+5.6 %) | 88 (+7.1 %) |

## Ausrüstung: selten

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 111 (0 %) | 208 (-11.1 %) | 226 (-24.1 %) ⚑ | 312 (-26.7 %) ⚑ | 388 (-22.8 %) ⚑ | 536 (-19 %) ⚑ |
| dieter-brawl | 1 | 111 (0 %) | 246 (+5 %) | 295 (-0.8 %) | 456 (+7.2 %) | 526 (+4.6 %) | 676 (+2.1 %) |
| dieter-brawl | 2 | 111 (0 %) | 230 (-1.5 %) | 287 (-3.5 %) | 354 (-16.7 %) ⚑ | 442 (-12.2 %) | 607 (-8.3 %) |
| baerbel-feedback | 0 | 113 (+1.3 %) | 244 (+4.2 %) | 295 (-0.5 %) | 370 (-13 %) | 420 (-16.5 %) ⚑ | 585 (-11.7 %) |
| baerbel-feedback | 1 | 113 (+1.3 %) | 272 (+16.2 %) ⚑ | 305 (+2.6 %) | 393 (-7.6 %) | 423 (-15.9 %) ⚑ | 581 (-12.3 %) |
| baerbel-feedback | 2 | 113 (+1.3 %) | 292 (+24.7 %) ⚑ | 348 (+17.2 %) ⚑ | 460 (+8 %) | 528 (+5 %) | 632 (-4.6 %) |
| baerbel-stage | 0 | 113 (+1.3 %) | 218 (-6.9 %) | 294 (-0.9 %) | 399 (-6.3 %) | 476 (-5.4 %) | 656 (-1 %) |
| baerbel-stage | 1 | 113 (+1.3 %) | 234 (0 %) | 344 (+15.8 %) ⚑ | 440 (+3.5 %) | 534 (+6.2 %) | 730 (+10.1 %) |
| baerbel-stage | 2 | 113 (+1.3 %) | 214 (-8.7 %) | 284 (-4.5 %) | 344 (-19.1 %) ⚑ | 399 (-20.7 %) ⚑ | 579 (-12.5 %) |
| kevin-fuse | 0 | 98 (-12.4 %) | 208 (-11.2 %) | 269 (-9.4 %) | 345 (-18.9 %) ⚑ | 412 (-18.1 %) ⚑ | 626 (-5.6 %) |
| kevin-fuse | 1 | 98 (-12.4 %) | 209 (-10.6 %) | 300 (+1 %) | 460 (+8.1 %) | 573 (+13.9 %) | 768 (+15.9 %) ⚑ |
| kevin-fuse | 2 | 98 (-12.4 %) | 260 (+11.4 %) | 338 (+13.9 %) | 445 (+4.6 %) | 513 (+2.1 %) | 730 (+10.1 %) |
| kevin-hunt | 0 | 98 (-12.4 %) | 239 (+2.3 %) | 307 (+3.3 %) | 404 (-5 %) | 480 (-4.5 %) | 662 (0 %) |
| kevin-hunt | 1 | 98 (-12.4 %) | 237 (+1.2 %) | 289 (-2.6 %) | 394 (-7.4 %) | 468 (-6.9 %) | 618 (-6.8 %) |
| kevin-hunt | 2 | 98 (-12.4 %) | 231 (-1.1 %) | 297 (0 %) | 428 (+0.7 %) | 518 (+3.1 %) | 656 (-1 %) |
| schorsch-flamme | 0 | 125 (+12.2 %) | 257 (+9.9 %) | 390 (+31.2 %) ⚑ | 591 (+38.9 %) ⚑ | 695 (+38.3 %) ⚑ | 952 (+43.7 %) ⚑ |
| schorsch-flamme | 1 | 125 (+12.2 %) | 240 (+2.6 %) | 342 (+15 %) | 619 (+45.6 %) ⚑ | 722 (+43.5 %) ⚑ | 1037 (+56.5 %) ⚑ |
| schorsch-flamme | 2 | 125 (+12.2 %) | 234 (0 %) | 320 (+7.9 %) | 454 (+6.7 %) | 524 (+4.2 %) | 773 (+16.6 %) ⚑ |
| kaethe-grand | 0 | 102 (-8.6 %) | 235 (+0.4 %) | 338 (+13.9 %) | 434 (+2 %) | 545 (+8.4 %) | 725 (+9.5 %) |
| kaethe-grand | 1 | 102 (-8.6 %) | 201 (-14.2 %) | 268 (-9.8 %) | 352 (-17.2 %) ⚑ | 482 (-4.1 %) | 726 (+9.6 %) |
| kaethe-grand | 2 | 102 (-8.6 %) | 203 (-13 %) | 286 (-3.8 %) | 425 (0 %) | 567 (+12.6 %) | 824 (+24.5 %) ⚑ |
| kaethe-falsch | 0 | 102 (-8.6 %) | 208 (-11 %) | 265 (-10.9 %) | 348 (-18.2 %) ⚑ | 397 (-21.2 %) ⚑ | 570 (-13.9 %) |
| kaethe-falsch | 1 | 102 (-8.6 %) | 204 (-12.7 %) | 287 (-3.3 %) | 433 (+1.9 %) | 503 (0 %) | 688 (+3.9 %) |
| kaethe-falsch | 2 | 102 (-8.6 %) | 229 (-2.2 %) | 302 (+1.8 %) | 408 (-4 %) | 445 (-11.6 %) | 634 (-4.3 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 37 (-45.7 %) ⚑ | 54 (-56.2 %) ⚑ | 79 (-56.8 %) ⚑ | 105 (-59.9 %) ⚑ | 131 (-68.6 %) ⚑ |
| dieter-brew | 1 | 0 (-100 %) | 55 (-18.6 %) ⚑ | 104 (-15.4 %) ⚑ | 142 (-21.7 %) ⚑ | 133 (-49.3 %) ⚑ | 178 (-57.3 %) ⚑ |
| dieter-brew | 2 | 0 (-100 %) | 47 (-31.2 %) ⚑ | 54 (-56.1 %) ⚑ | 69 (-61.9 %) ⚑ | 88 (-66.4 %) ⚑ | 126 (-69.6 %) ⚑ |
| baerbel-care | 0 | 0 (-100 %) | 66 (-1.9 %) | 81 (-34.3 %) ⚑ | 92 (-49.3 %) ⚑ | 116 (-55.8 %) ⚑ | 211 (-49.3 %) ⚑ |
| baerbel-care | 1 | 0 (-100 %) | 48 (-29.3 %) ⚑ | 91 (-26 %) ⚑ | 137 (-24.7 %) ⚑ | 159 (-39.2 %) ⚑ | 294 (-29.5 %) ⚑ |
| baerbel-care | 2 | 0 (-100 %) | 53 (-21.9 %) ⚑ | 87 (-28.9 %) ⚑ | 156 (-14.1 %) | 202 (-22.7 %) ⚑ | 261 (-37.3 %) ⚑ |
| schorsch-chef | 0 | 0 (-100 %) | 113 (+67.2 %) ⚑ | 246 (+100.3 %) ⚑ | 326 (+79.5 %) ⚑ | 420 (+60.6 %) ⚑ | 668 (+60.4 %) ⚑ |
| schorsch-chef | 1 | 0 (-100 %) | 68 (0 %) | 131 (+6.7 %) | 195 (+7.3 %) | 304 (+16.1 %) ⚑ | 453 (+8.8 %) |
| schorsch-chef | 2 | 0 (-100 %) | 103 (+51.9 %) ⚑ | 198 (+60.9 %) ⚑ | 309 (+70.1 %) ⚑ | 381 (+45.8 %) ⚑ | 571 (+37.1 %) ⚑ |
| kaethe-herz | 0 | 31 (+2960 %) | 115 (+70.1 %) ⚑ | 192 (+56.1 %) ⚑ | 294 (+61.7 %) ⚑ | 374 (+43 %) ⚑ | 531 (+27.5 %) ⚑ |
| kaethe-herz | 1 | 31 (+2960 %) | 81 (+19.8 %) ⚑ | 123 (0 %) | 201 (+10.7 %) | 279 (+6.8 %) | 416 (0 %) |
| kaethe-herz | 2 | 31 (+2960 %) | 95 (+40.7 %) ⚑ | 152 (+23.2 %) ⚑ | 182 (0 %) | 261 (0 %) | 421 (+1.2 %) |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 11 (+57.1 %) | 30 (+10.7 %) | 43 (+22.1 %) ⚑ | 52 (+2.6 %) | 63 (+3.8 %) | 84 (+3.8 %) |
| dieter-wall | 1 | 11 (+57.1 %) | 19 (-28.8 %) ⚑ | 29 (-15.8 %) ⚑ | 51 (0 %) | 60 (0 %) | 81 (0 %) |
| dieter-wall | 2 | 11 (+57.1 %) | 18 (-33.9 %) ⚑ | 26 (-25.2 %) ⚑ | 42 (-16.5 %) ⚑ | 52 (-14.6 %) | 77 (-4.7 %) |
| kevin-iron | 0 | 7 (0 %) | 27 (-0.4 %) | 34 (-2 %) | 42 (-17.3 %) ⚑ | 50 (-17.5 %) ⚑ | 66 (-18.9 %) ⚑ |
| kevin-iron | 1 | 7 (0 %) | 27 (0 %) | 35 (0 %) | 43 (-15 %) | 52 (-14.6 %) | 67 (-17.2 %) ⚑ |
| kevin-iron | 2 | 7 (0 %) | 26 (-5.9 %) | 34 (-3.4 %) | 40 (-22 %) ⚑ | 48 (-20.5 %) ⚑ | 62 (-23.4 %) ⚑ |
| schorsch-rauch | 0 | 7 (0 %) | 35 (+28.8 %) ⚑ | 45 (+30.1 %) ⚑ | 56 (+10.8 %) | 66 (+8.6 %) | 88 (+8.2 %) |
| schorsch-rauch | 1 | 7 (0 %) | 35 (+28.8 %) ⚑ | 46 (+31.2 %) ⚑ | 55 (+8.1 %) | 65 (+7 %) | 87 (+7.2 %) |
| schorsch-rauch | 2 | 7 (0 %) | 35 (+28.8 %) ⚑ | 46 (+30.4 %) ⚑ | 54 (+6.5 %) | 64 (+5.1 %) | 85 (+4.7 %) |

## Ausrüstung: episch

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 146 (+0.8 %) | 229 (-11.7 %) | 294 (-15.7 %) ⚑ | 383 (-22.2 %) ⚑ | 461 (-24 %) ⚑ | 639 (-20.2 %) ⚑ |
| dieter-brawl | 1 | 146 (+0.8 %) | 255 (-1.5 %) | 376 (+7.7 %) | 527 (+7 %) | 648 (+6.8 %) | 851 (+6.2 %) |
| dieter-brawl | 2 | 146 (+0.8 %) | 256 (-1.2 %) | 316 (-9.3 %) | 406 (-17.5 %) ⚑ | 525 (-13.5 %) | 648 (-19.2 %) ⚑ |
| baerbel-feedback | 0 | 145 (0 %) | 279 (+7.5 %) | 334 (-4.3 %) | 459 (-6.9 %) | 532 (-12.3 %) | 742 (-7.4 %) |
| baerbel-feedback | 1 | 145 (0 %) | 315 (+21.7 %) ⚑ | 362 (+3.7 %) | 487 (-1.1 %) | 494 (-18.5 %) ⚑ | 733 (-8.5 %) |
| baerbel-feedback | 2 | 145 (0 %) | 329 (+27 %) ⚑ | 432 (+23.9 %) ⚑ | 589 (+19.5 %) ⚑ | 645 (+6.4 %) | 740 (-7.7 %) |
| baerbel-stage | 0 | 145 (0 %) | 259 (-0.1 %) | 319 (-8.4 %) | 466 (-5.3 %) | 541 (-10.8 %) | 755 (-5.8 %) |
| baerbel-stage | 1 | 145 (0 %) | 278 (+7.3 %) | 391 (+12.2 %) | 546 (+10.8 %) | 663 (+9.3 %) | 861 (+7.4 %) |
| baerbel-stage | 2 | 145 (0 %) | 259 (0 %) | 309 (-11.2 %) | 434 (-11.9 %) | 507 (-16.3 %) ⚑ | 745 (-7.1 %) |
| kevin-fuse | 0 | 130 (-9.8 %) | 243 (-6.1 %) | 315 (-9.6 %) | 420 (-14.7 %) | 488 (-19.6 %) ⚑ | 721 (-10.1 %) |
| kevin-fuse | 1 | 130 (-9.8 %) | 238 (-8.3 %) | 343 (-1.5 %) | 579 (+17.6 %) ⚑ | 637 (+5 %) | 864 (+7.8 %) |
| kevin-fuse | 2 | 130 (-9.8 %) | 297 (+14.6 %) | 404 (+15.8 %) ⚑ | 569 (+15.5 %) ⚑ | 640 (+5.5 %) | 912 (+13.7 %) |
| kevin-hunt | 0 | 130 (-9.8 %) | 265 (+2.5 %) | 377 (+8.3 %) | 485 (-1.4 %) | 606 (0 %) | 797 (-0.6 %) |
| kevin-hunt | 1 | 130 (-9.8 %) | 252 (-2.9 %) | 334 (-4.2 %) | 455 (-7.6 %) | 551 (-9.1 %) | 756 (-5.7 %) |
| kevin-hunt | 2 | 130 (-9.8 %) | 273 (+5.6 %) | 375 (+7.7 %) | 492 (0 %) | 616 (+1.5 %) | 802 (0 %) |
| schorsch-flamme | 0 | 162 (+12.3 %) | 300 (+15.9 %) ⚑ | 472 (+35.6 %) ⚑ | 668 (+35.7 %) ⚑ | 834 (+37.6 %) ⚑ | 1128 (+40.8 %) ⚑ |
| schorsch-flamme | 1 | 162 (+12.3 %) | 291 (+12.2 %) | 411 (+17.9 %) ⚑ | 743 (+51 %) ⚑ | 848 (+39.9 %) ⚑ | 1225 (+52.9 %) ⚑ |
| schorsch-flamme | 2 | 162 (+12.3 %) | 300 (+15.6 %) ⚑ | 398 (+14.3 %) | 561 (+13.9 %) | 659 (+8.7 %) | 954 (+19.1 %) ⚑ |
| kaethe-grand | 0 | 127 (-12 %) | 256 (-1.4 %) | 378 (+8.4 %) | 511 (+3.8 %) | 639 (+5.4 %) | 910 (+13.5 %) |
| kaethe-grand | 1 | 127 (-12 %) | 232 (-10.3 %) | 313 (-10.3 %) | 451 (-8.5 %) | 562 (-7.3 %) | 831 (+3.6 %) |
| kaethe-grand | 2 | 127 (-12 %) | 235 (-9.4 %) | 344 (-1.3 %) | 535 (+8.7 %) | 682 (+12.4 %) | 952 (+18.8 %) ⚑ |
| kaethe-falsch | 0 | 127 (-12 %) | 243 (-6.3 %) | 296 (-14.9 %) | 407 (-17.4 %) ⚑ | 494 (-18.5 %) ⚑ | 645 (-19.5 %) ⚑ |
| kaethe-falsch | 1 | 127 (-12 %) | 233 (-10.2 %) | 337 (-3.4 %) | 508 (+3.2 %) | 601 (-0.9 %) | 861 (+7.4 %) |
| kaethe-falsch | 2 | 127 (-12 %) | 273 (+5.6 %) | 349 (0 %) | 473 (-3.9 %) | 563 (-7.2 %) | 740 (-7.7 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 46 (-48.5 %) ⚑ | 55 (-67.8 %) ⚑ | 97 (-61.2 %) ⚑ | 129 (-65.6 %) ⚑ | 172 (-64.3 %) ⚑ |
| dieter-brew | 1 | 0 (-100 %) | 65 (-27.9 %) ⚑ | 115 (-32.8 %) ⚑ | 152 (-38.9 %) ⚑ | 150 (-60 %) ⚑ | 204 (-57.6 %) ⚑ |
| dieter-brew | 2 | 0 (-100 %) | 54 (-40.1 %) ⚑ | 61 (-64.6 %) ⚑ | 80 (-68 %) ⚑ | 104 (-72.3 %) ⚑ | 137 (-71.4 %) ⚑ |
| baerbel-care | 0 | 0 (-100 %) | 76 (-16.1 %) ⚑ | 72 (-58.1 %) ⚑ | 96 (-61.5 %) ⚑ | 113 (-69.9 %) ⚑ | 248 (-48.4 %) ⚑ |
| baerbel-care | 1 | 0 (-100 %) | 55 (-39.2 %) ⚑ | 96 (-44 %) ⚑ | 159 (-36.3 %) ⚑ | 185 (-50.7 %) ⚑ | 359 (-25.2 %) ⚑ |
| baerbel-care | 2 | 0 (-100 %) | 63 (-29.9 %) ⚑ | 94 (-45.4 %) ⚑ | 175 (-29.8 %) ⚑ | 236 (-36.9 %) ⚑ | 317 (-34 %) ⚑ |
| schorsch-chef | 0 | 0 (-100 %) | 148 (+64.3 %) ⚑ | 311 (+81 %) ⚑ | 419 (+68.2 %) ⚑ | 580 (+55 %) ⚑ | 866 (+80.3 %) ⚑ |
| schorsch-chef | 1 | 0 (-100 %) | 90 (0 %) | 172 (0 %) | 259 (+3.9 %) | 397 (+6.1 %) | 670 (+39.6 %) ⚑ |
| schorsch-chef | 2 | 0 (-100 %) | 132 (+46.8 %) ⚑ | 260 (+51.5 %) ⚑ | 392 (+57.2 %) ⚑ | 485 (+29.5 %) ⚑ | 809 (+68.3 %) ⚑ |
| kaethe-herz | 0 | 46 (+4460 %) | 153 (+69.8 %) ⚑ | 239 (+39.3 %) ⚑ | 334 (+34 %) ⚑ | 470 (+25.5 %) ⚑ | 689 (+43.4 %) ⚑ |
| kaethe-herz | 1 | 46 (+4460 %) | 110 (+21.6 %) ⚑ | 187 (+9 %) | 279 (+11.8 %) | 400 (+6.8 %) | 629 (+30.8 %) ⚑ |
| kaethe-herz | 2 | 46 (+4460 %) | 127 (+41.3 %) ⚑ | 203 (+18 %) ⚑ | 249 (0 %) | 374 (0 %) | 480 (0 %) |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 12 (+33.3 %) | 29 (+9.3 %) | 41 (+20.7 %) ⚑ | 51 (+4.1 %) | 60 (+0.3 %) | 84 (+10.4 %) |
| dieter-wall | 1 | 12 (+33.3 %) | 21 (-21.3 %) ⚑ | 32 (-6.4 %) | 49 (0 %) | 60 (0 %) | 76 (0 %) |
| dieter-wall | 2 | 12 (+33.3 %) | 20 (-25 %) ⚑ | 28 (-17.8 %) ⚑ | 42 (-15.1 %) ⚑ | 53 (-10.9 %) | 74 (-2.6 %) |
| kevin-iron | 0 | 9 (0 %) | 27 (-0.7 %) | 34 (0 %) | 42 (-14.9 %) | 49 (-17.6 %) ⚑ | 65 (-15 %) |
| kevin-iron | 1 | 9 (0 %) | 27 (0 %) | 34 (0 %) | 42 (-14.3 %) | 50 (-16.8 %) ⚑ | 65 (-14.5 %) |
| kevin-iron | 2 | 9 (0 %) | 25 (-7.8 %) | 32 (-5.8 %) | 40 (-18.5 %) ⚑ | 47 (-21 %) ⚑ | 63 (-17.2 %) ⚑ |
| schorsch-rauch | 0 | 9 (0 %) | 33 (+23.5 %) ⚑ | 43 (+26.5 %) ⚑ | 55 (+11.8 %) | 63 (+5.9 %) | 86 (+12.6 %) |
| schorsch-rauch | 1 | 9 (0 %) | 33 (+23.5 %) ⚑ | 44 (+26.8 %) ⚑ | 54 (+9.6 %) | 62 (+4.4 %) | 83 (+9.1 %) |
| schorsch-rauch | 2 | 9 (0 %) | 33 (+23.5 %) ⚑ | 43 (+26.2 %) ⚑ | 53 (+8.6 %) | 62 (+3.9 %) | 83 (+9.5 %) |

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

### kevin-fuse · Pfad 0 · Stufe 10 ·269 Schaden/s · Ausrüstung +116.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.7 Schaden/s · Taktgefühl 1.6 Schaden/s · Bastelgrips -0.2 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 37.3 % · Kurzschluss 22.6 % · Kurzschluss 14.1 % · Pfandgeschoss 13.6 % · Autoangriff · Pfand im Takt 8.5 % · Lunte 4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Ausgebrannt +1.4 % · Heißer Kleber +0.7 % · Rücklaufdruck +0.2 % · Brennender Nachlauf gebunden · Zündfunke gebunden · Dicke Lunte gebunden · Pfandsammler gebunden · Lunte springt gebunden · Sparflamme gebunden

### kevin-fuse · Pfad 1 · Stufe 10 ·300 Schaden/s · Ausrüstung +125.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.9 Schaden/s · Taktgefühl 2.1 Schaden/s · Bastelgrips 0.4 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 60.1 % · Kurzschluss 16.1 % · Kurzschluss 9.1 % · Autoangriff · Pfand im Takt 6 % · Pfandgeschoss 5.8 % · Lunte 2.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Überbrückt +3.6 % · Doppelte Sicherung 0 % · Serienschaltung -2 % · Blanker Draht gebunden · Kupferkern gebunden · Rückstrom gebunden · Schnellverkabelt gebunden · Erdschluss gebunden · Kurzschluss gebunden

### kevin-fuse · Pfad 2 · Stufe 10 ·338 Schaden/s · Ausrüstung +136.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.6 Schaden/s · Taktgefühl 0.1 Schaden/s · 0.1 verhindert/s · Bastelgrips -0.2 Schaden/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Kurzschluss 38.7 % · Kurzschluss 33.1 % · Restmüll mit Zündschnur 15.5 % · Lunte 7.5 % · Autoangriff · Pfand im Takt 5.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nachzünder +7.2 % · Lange Zündschnur +1.7 % · Glühender Draht 0 % · Zündliste gebunden · Starkstrom-Bon gebunden · Kleber für alle gebunden · Funkenüberschlag gebunden · Kettenzündung gebunden · Zündleitung gebunden

### kevin-fuse · Pfad 0 · Stufe 20 ·412 Schaden/s · Ausrüstung +202.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.3 Schaden/s · Taktgefühl -1.4 Schaden/s · Bastelgrips 0.1 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 39.1 % · Kurzschluss 24.2 % · Pfandgeschoss 17.2 % · Kurzschluss 8.3 % · Autoangriff · Pfand im Takt 8.1 % · Lunte 3.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Ausgebrannt +2.3 % · Kupferkern +2.3 % · Zündliste +0.6 % · Dicke Lunte 0 % · Pfandsammler 0 % · Lunte springt 0 % · Rücklaufdruck 0 % · Alles auf die Lunte 0 % · Blanker Draht 0 % · Zündfunke -1.5 % · Sparflamme -1.7 % · Brennender Nachlauf gebunden · Heißer Kleber gebunden

### kevin-fuse · Pfad 1 · Stufe 20 ·573 Schaden/s · Ausrüstung +197.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 5.5 Schaden/s · Taktgefühl 4.2 Schaden/s · Bastelgrips 0.5 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 64.7 % · Kurzschluss 21.2 % · Kurzschluss 5.3 % · Autoangriff · Pfand im Takt 4.6 % · Pfandgeschoss 2.6 % · Lunte 1.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kurzschluss +23.3 % · Brennender Nachlauf +20.1 % · Rückstrom +9.1 % · Zündfunke +9.1 % · Nullwiderstand +9 % · Kupferkern +8.3 % · Überbrückt +6.8 % · Zündliste +1.2 % · Schnellverkabelt 0 % · Erdschluss 0 % · Serienschaltung 0 % · Blanker Draht gebunden · Doppelte Sicherung gebunden

### kevin-fuse · Pfad 2 · Stufe 20 ·513 Schaden/s · Ausrüstung +214.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.2 Schaden/s · Taktgefühl -0.7 Schaden/s · Bastelgrips 0.4 Schaden/s · -0.1 verhindert/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Kurzschluss 33.1 % · Kurzschluss 31.8 % · Restmüll mit Zündschnur 24.8 % · Autoangriff · Pfand im Takt 4.7 % · Lunte 4.6 % · Pfandgeschoss 1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Zündfunke +9.7 % · Kleber für alle +4.1 % · Nachzünder +2.9 % · Funkenüberschlag +2.1 % · Starkstrom-Bon +0.7 % · Zündleitung 0 % · Blanker Draht 0 % · Brennender Nachlauf -0.5 % · Kettenreaktion -1.1 % · Lange Zündschnur -1.9 % · Kettenzündung -2.4 % · Zündliste gebunden · Glühender Draht gebunden

### kevin-iron · Pfad 0 · Stufe 10 ·259 Schaden/s · Ausrüstung +95.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.1 Schaden/s · -0.1 Heilung/s · Taktgefühl 0.2 Schaden/s · Bastelgrips 0.3 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Robbi 65.5 % · Autoangriff · Pfand im Takt 11.1 % · Pfandgeschoss 11 % · Überlast 7.8 % · Kleb die Scheiße fest 4.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Werkstattpause 0 % · Ersatzteile 0 % · Starker Magnet 0 % · Längere Batterie gebunden · Robbi räumt auf gebunden · Scharfe Dose gebunden · Robbi hält gebunden · Magnetpanzer gebunden · Ersatzdose gebunden

### kevin-iron · Pfad 1 · Stufe 10 ·243 Schaden/s · Ausrüstung +133.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.8 Schaden/s · Taktgefühl 0.9 Schaden/s · Bastelgrips -1.1 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Robbi 49.2 % · Pfandgeschoss 23.8 % · Autoangriff · Pfand im Takt 13.3 % · Überlast 8.1 % · Kleb die Scheiße fest 5.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Parierschlag 0 % · Dosenblech 0 % · Nietenpflaster 0 % · Blechkante gebunden · Nietenpanzer gebunden · Druckventil gebunden · Nietfest gebunden · Vernietet gebunden · Notniete gebunden

### kevin-iron · Pfad 2 · Stufe 10 ·331 Schaden/s · Ausrüstung +83.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 3 Schaden/s · Taktgefühl 1.7 Schaden/s · Bastelgrips 0 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Robbi 61.9 % · Pfandgeschoss 13.9 % · Überlast 10.2 % · Autoangriff · Pfand im Takt 10 % · Kleb die Scheiße fest 4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Überdruck +5 % · Überlast im Laufen 0 % · Restwärme -4.5 % · Frisch verschraubt gebunden · Volle Ladung gebunden · Blitzableiter gebunden · Wiederaufbau gebunden · Druckschlag gebunden · Dampfdruck gebunden

### kevin-iron · Pfad 0 · Stufe 20 ·354 Schaden/s · Ausrüstung +189.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.3 Schaden/s · Taktgefühl 1 Schaden/s · Bastelgrips 0 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Robbi 58.4 % · Pfandgeschoss 14 % · Überlast 12.6 % · Autoangriff · Pfand im Takt 11.2 % · Kleb die Scheiße fest 3.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Ersatzdose +5.7 % · Robbi räumt auf +4.3 % · Nietenpanzer +2.8 % · Scharfe Dose +2.3 % · Robbi hält 0 % · Werkstattpause 0 % · Starker Magnet 0 % · Letzter Befehl 0 % · Frisch verschraubt 0 % · Blechkante 0 % · Magnetpanzer -6 % · Längere Batterie gebunden · Ersatzteile gebunden

### kevin-iron · Pfad 1 · Stufe 20 ·319 Schaden/s · Ausrüstung +175.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.7 Schaden/s · Taktgefühl -0.3 Schaden/s · Bastelgrips -1 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Robbi 37.4 % · Pfandgeschoss 34.6 % · Autoangriff · Pfand im Takt 14.6 % · Überlast 8.5 % · Kleb die Scheiße fest 4.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nietenpanzer +3.5 % · Druckventil 0 % · Nietfest 0 % · Vernietet 0 % · Notniete 0 % · Parierschlag 0 % · Nietenpflaster 0 % · Nicht TÜV-geprüft 0 % · Frisch verschraubt 0 % · Längere Batterie 0 % · Robbi räumt auf -3.3 % · Blechkante gebunden · Dosenblech gebunden

### kevin-iron · Pfad 2 · Stufe 20 ·497 Schaden/s · Ausrüstung +128.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.5 Schaden/s · Taktgefühl -0.6 Schaden/s · Bastelgrips 1.4 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Robbi 68.8 % · Pfandgeschoss 13.6 % · Autoangriff · Pfand im Takt 8.5 % · Überlast 6.2 % · Kleb die Scheiße fest 3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Wiederaufbau +23.5 % · Kernschmelze +14.7 % · Überdruck +5.7 % · Nietenpanzer +5.5 % · Blitzableiter 0 % · Druckschlag 0 % · Dampfdruck 0 % · Überlast im Laufen 0 % · Längere Batterie 0 % · Blechkante 0 % · Volle Ladung -0.8 % · Frisch verschraubt gebunden · Restwärme gebunden

### kevin-hunt · Pfad 0 · Stufe 10 ·307 Schaden/s · Ausrüstung +108.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.5 Schaden/s · 0.1 Heilung/s · Taktgefühl 1.2 Schaden/s · 0.2 Heilung/s · Bastelgrips 0.3 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 39.7 % · Pfandgeschoss 21.7 % · Restmüll-Rakete 20.8 % · Autoangriff · Pfand im Takt 10.7 % · Kleb die Scheiße fest 5.2 % · Überzündung 1.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Automatenrhythmus +0.3 % · Pfandgeschoss im Laufen 0 % · Klebegeld 0 % · Gezinkte Dose gebunden · Restwert gebunden · Klebefalle gebunden · Kurze Pechsträhne gebunden · Glücksgriff gebunden · Beutefieber gebunden

### kevin-hunt · Pfad 1 · Stufe 10 ·289 Schaden/s · Ausrüstung +113 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.9 Schaden/s · Taktgefühl 2.3 Schaden/s · Bastelgrips 0.5 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 42.7 % · Pfandgeschoss 19.5 % · Restmüll-Rakete 17.4 % · Autoangriff · Pfand im Takt 11.5 % · Kleb die Scheiße fest 4.8 % · Überzündung 4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Rückstoß 0 % · Schritt voraus 0 % · Rakete im Rennen 0 % · Im Vorbeirennen gebunden · Fangschuss gebunden · Abgesprungen gebunden · Nachladen im Rennen gebunden · Nachschub gebunden · Fangnetz gebunden

### kevin-hunt · Pfad 2 · Stufe 10 ·297 Schaden/s · Ausrüstung +93.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1 Schaden/s · Taktgefühl 1.5 Schaden/s · Bastelgrips 0 Schaden/s · -0.1 verhindert/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 44.4 % · Restmüll-Rakete 19 % · Autoangriff · Pfand im Takt 13.8 % · Pfandgeschoss 9.2 % · Pfandseil 6.5 % · Kleb die Scheiße fest 6.1 % · Überzündung 1.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Restgewinn +2.7 % · Fangprämie 0 % · Stahlseil 0 % · Zweite Serie gebunden · Pfandrückgabe gebunden · Pfandregen gebunden · Glücksbringer gebunden · Pfandseil gebunden · Glücksrausch gebunden

### kevin-hunt · Pfad 0 · Stufe 20 ·480 Schaden/s · Ausrüstung +170 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms -0.1 Schaden/s · Taktgefühl -0.6 Schaden/s · 0.2 Heilung/s · Bastelgrips -0.2 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 42.1 % · Pfandgeschoss 26.5 % · Restmüll-Rakete 14 % · Autoangriff · Pfand im Takt 11 % · Kleb die Scheiße fest 3.8 % · Überzündung 2.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Alles auf Rot +4.2 % · Zweite Serie +2.3 % · Kurze Pechsträhne +1.7 % · Restwert +0.3 % · Klebefalle 0 % · Beutefieber 0 % · Pfandgeschoss im Laufen 0 % · Fangschuss 0 % · Automatenrhythmus -0.8 % · Im Vorbeirennen -1.6 % · Glücksgriff -4.5 % · Gezinkte Dose gebunden · Klebegeld gebunden

### kevin-hunt · Pfad 1 · Stufe 20 ·468 Schaden/s · Ausrüstung +213.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.8 Schaden/s · Taktgefühl -0.2 Schaden/s · Bastelgrips -0.6 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 37.1 % · Pfandgeschoss 25.3 % · Restmüll-Rakete 17 % · Autoangriff · Pfand im Takt 13 % · Kleb die Scheiße fest 3.9 % · Überzündung 3.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Fangschuss 0 % · Abgesprungen 0 % · Nachladen im Rennen 0 % · Nachschub 0 % · Fangnetz 0 % · Rückstoß 0 % · Rakete im Rennen 0 % · Restwert 0 % · Zweite Serie -0.3 % · Nie am selben Fleck -1.3 % · Gezinkte Dose -1.3 % · Im Vorbeirennen gebunden · Schritt voraus gebunden

### kevin-hunt · Pfad 2 · Stufe 20 ·518 Schaden/s · Ausrüstung +147.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.6 Schaden/s · -0.2 verhindert/s · Taktgefühl 0.3 Schaden/s · -0.6 verhindert/s · Bastelgrips 0.6 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 55.6 % · Restmüll-Rakete 15.2 % · Autoangriff · Pfand im Takt 12.5 % · Pfandgeschoss 6.8 % · Pfandseil 5.6 % · Kleb die Scheiße fest 3.9 % · Überzündung 0.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Gewinnrakete +14.1 % · Glücksrausch +3.9 % · Pfandrückgabe +2.9 % · Pfandregen +1.1 % · Gezinkte Dose +1.1 % · Glücksbringer +0.2 % · Fangprämie 0 % · Stahlseil 0 % · Fangschuss 0 % · Im Vorbeirennen -1.3 % · Pfandseil -3.6 % · Zweite Serie gebunden · Restgewinn gebunden

### schorsch-chef · Pfad 0 · Stufe 10 ·221 Schaden/s · Ausrüstung +215.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 2.7 Heilung/s · Wumms 0.1 Schaden/s · 0.4 Heilung/s · Taktgefühl 0.3 Schaden/s · 0.8 Heilung/s · Bastelgrips 0.3 Schaden/s · 1 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Glutbrocken 44.9 % · Grillzange 34.1 % · Autoangriff · Zangenklapper 21.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Wurstkette +7.1 % · Metzgerqualität 0 % · Auf Vorrat gegrillt 0 % · Probierhäppchen gebunden · Zweite Wurst gebunden · Satt ist satt gebunden · Notwurst gebunden · Hausmacher gebunden · Goldbraun gebunden

### schorsch-chef · Pfad 1 · Stufe 10 ·242 Schaden/s · Ausrüstung +202.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.6 Heilung/s · Wumms 2.3 Schaden/s · -0.5 Heilung/s · Taktgefühl -0.5 Schaden/s · -0.2 Heilung/s · Bastelgrips -0.2 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Servieren 54.4 % · Grillzange 25.8 % · Autoangriff · Zangenklapper 19.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Belegtes Brötchen 0 % · Popcorn für alle 0 % · Scharfer Senf 0 % · Grillkäse dazu gebunden · Schnell gewendet gebunden · Heißer Rost gebunden · Maiskolben dazu gebunden · Senf drauf! gebunden · Wenden! gebunden

### schorsch-chef · Pfad 2 · Stufe 10 ·262 Schaden/s · Ausrüstung +173 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 2.3 Heilung/s · Wumms 1 Schaden/s · -0.1 Heilung/s · Taktgefühl -1.5 Schaden/s · 0.5 Heilung/s · Bastelgrips 0.7 Schaden/s · 1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Servieren 50.1 % · Grillzange 32.8 % · Autoangriff · Zangenklapper 17.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Dicke Luft +0.5 % · Buffet nachlegen 0 % · Frische Luft -1.5 % · Löschbier gebunden · Dampfgaren gebunden · Stammplatz gebunden · Feuerfeste Schürze gebunden · Ruhige Glut gebunden · Tischdienst gebunden

### schorsch-chef · Pfad 0 · Stufe 20 ·305 Schaden/s · Ausrüstung +322.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 2.9 Heilung/s · Wumms 0.5 Schaden/s · -0.4 Heilung/s · Taktgefühl 0.2 Schaden/s · -0.6 Heilung/s · Bastelgrips 1 Schaden/s · 2.5 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Grillzange 43.8 % · Glutbrocken 34.9 % · Autoangriff · Zangenklapper 21.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Zweite Wurst 0 % · Satt ist satt 0 % · Notwurst 0 % · Hausmacher 0 % · Goldbraun 0 % · Metzgerqualität 0 % · Auf Vorrat gegrillt 0 % · Meisterwurst 0 % · Löschbier 0 % · Schnell gewendet 0 % · Grillkäse dazu -7.2 % · Probierhäppchen gebunden · Wurstkette gebunden

### schorsch-chef · Pfad 1 · Stufe 20 ·357 Schaden/s · Ausrüstung +299.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 2 Heilung/s · Wumms 1.2 Schaden/s · 1.1 Heilung/s · Taktgefühl 0.1 Schaden/s · 0.5 Heilung/s · Bastelgrips 0.2 Schaden/s · 2.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Servieren 49.5 % · Grillzange 31 % · Autoangriff · Zangenklapper 19.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Maiskolben dazu +15.3 % · Volle Platte +5.6 % · Probierhäppchen +3.8 % · Wenden! +3.3 % · Heißer Rost +1.8 % · Senf drauf! +1.3 % · Schnell gewendet +0.1 % · Belegtes Brötchen 0 % · Scharfer Senf 0 % · Löschbier 0 % · Zweite Wurst -6.2 % · Grillkäse dazu gebunden · Popcorn für alle gebunden

### schorsch-chef · Pfad 2 · Stufe 20 ·381 Schaden/s · Ausrüstung +321.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 2.6 Heilung/s · Wumms 3.3 Schaden/s · 0.1 Heilung/s · Taktgefühl 0.2 Schaden/s · 0.6 Heilung/s · Bastelgrips 0.5 Schaden/s · 0.8 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Servieren 55.3 % · Grillzange 29.2 % · Autoangriff · Zangenklapper 15.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Probierhäppchen +12.1 % · Zweite Wurst +4.3 % · Ruhige Glut +4.2 % · Dampfgaren +3.1 % · Stammplatz +0.7 % · Feuerfeste Schürze 0 % · Tischdienst 0 % · Buffet nachlegen 0 % · Lokalrunde 0 % · Frische Luft -0.1 % · Grillkäse dazu -0.4 % · Löschbier gebunden · Dicke Luft gebunden

### schorsch-flamme · Pfad 0 · Stufe 10 ·390 Schaden/s · Ausrüstung +143.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.2 Heilung/s · Wumms 0.4 Schaden/s · 0.1 Heilung/s · Taktgefühl 1.8 Schaden/s · -0.2 Heilung/s · Bastelgrips 0.9 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Schwenkgrill 79.7 % · Grillzange 13.5 % · Autoangriff · Zangenklapper 6.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Feuerring +1.8 % · Blasebalg-Profi 0 % · Heißer Draht -4.2 % · Gut angefacht gebunden · Kurze Zündschnur gebunden · Zunder gebunden · Hitzewelle gebunden · Nach dem Knall gebunden · Nachglühen gebunden

### schorsch-flamme · Pfad 1 · Stufe 10 ·342 Schaden/s · Ausrüstung +157.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.1 Heilung/s · Wumms 1.7 Schaden/s · 0.1 Heilung/s · Taktgefühl 1.3 Schaden/s · 0.2 Heilung/s · Bastelgrips -0.2 Schaden/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Schwenkgrill 74.2 % · Grillzange 17.4 % · Autoangriff · Zangenklapper 8.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Grillteller mit Braten +2 % · Knusprig -1.2 % · Zweiter Gang -5.9 % · Anbraten gebunden · Fleischermesser gebunden · Auf den Punkt gebunden · Abschrecken gebunden · Der Nächste, bitte gebunden · Fleischklopfer gebunden

### schorsch-flamme · Pfad 2 · Stufe 10 ·320 Schaden/s · Ausrüstung +149.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.2 Heilung/s · Wumms 3.4 Schaden/s · Taktgefühl 0.9 Schaden/s · 0.1 Heilung/s · Bastelgrips 0.1 Schaden/s · -0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Schwenkgrill 81.8 % · Grillzange 9.2 % · Autoangriff · Zangenklapper 8.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Zangentakt 0 % · Doppelpack 0 % · Nachgießen 0 % · Kohlenschaufel gebunden · Zangenklapper im Takt gebunden · Brandbeschleuniger gebunden · Heiße Kohlen gebunden · Spiritus-Schwall gebunden · Funkensprung gebunden

### schorsch-flamme · Pfad 0 · Stufe 20 ·695 Schaden/s · Ausrüstung +231.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.2 Heilung/s · Wumms 2.8 Schaden/s · 0.2 Heilung/s · Taktgefühl 0.3 Schaden/s · -0.2 Heilung/s · Bastelgrips 1.1 Schaden/s · -0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Schwenkgrill 79.6 % · Grillzange 15 % · Autoangriff · Zangenklapper 5.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Feuerteufel +11.3 % · Zunder +9.9 % · Kurze Zündschnur +9.3 % · Hitzewelle +5.7 % · Nachglühen +5.3 % · Nach dem Knall +3.2 % · Fleischermesser +1.8 % · Heißer Draht +0.7 % · Blasebalg-Profi 0 % · Anbraten 0 % · Kohlenschaufel 0 % · Gut angefacht gebunden · Feuerring gebunden

### schorsch-flamme · Pfad 1 · Stufe 20 ·722 Schaden/s · Ausrüstung +258.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.1 Heilung/s · Wumms 1.7 Schaden/s · -0.2 Heilung/s · Taktgefühl 0 Schaden/s · -0.2 Heilung/s · Bastelgrips 1.1 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Schwenkgrill 86.9 % · Grillzange 7.3 % · Autoangriff · Zangenklapper 5.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Spanferkel-Wurf +29.5 % · Gut angefacht +3.5 % · Fleischermesser +2.6 % · Grillteller mit Braten +2.6 % · Kurze Zündschnur +2.6 % · Der Nächste, bitte +2.5 % · Fleischklopfer +2.2 % · Auf den Punkt +1.9 % · Abschrecken +1.8 % · Kohlenschaufel 0 % · Zweiter Gang -1.5 % · Anbraten gebunden · Knusprig gebunden

### schorsch-flamme · Pfad 2 · Stufe 20 ·524 Schaden/s · Ausrüstung +220.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.1 Heilung/s · Wumms 2.4 Schaden/s · -0.2 Heilung/s · Taktgefühl 0.3 Schaden/s · Bastelgrips 0.2 Schaden/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Schwenkgrill 74 % · Grillzange 17.9 % · Autoangriff · Zangenklapper 8.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Gut angefacht +6.1 % · Zangenklapper im Takt +3.1 % · Flambé mit Schuss +1.3 % · Funkensprung +1.1 % · Kurze Zündschnur +1 % · Brandbeschleuniger +0.4 % · Heiße Kohlen +0.3 % · Spiritus-Schwall 0 % · Zangentakt 0 % · Nachgießen 0 % · Anbraten -1.1 % · Kohlenschaufel gebunden · Doppelpack gebunden

### schorsch-rauch · Pfad 0 · Stufe 10 ·229 Schaden/s · Ausrüstung +216.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.8 Heilung/s · Wumms 1 Schaden/s · -0.1 Heilung/s · Taktgefühl 0.9 Schaden/s · 0.6 Heilung/s · Bastelgrips 0.5 Schaden/s · 0.5 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 57.6 % · Grillzange 26.6 % · Autoangriff · Zangenklapper 15.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nachräuchern +1.6 % · Nebelmaschine 0 % · Nasses Buchenholz -3.6 % · Kalt anräuchern gebunden · Feuerlöscher gebunden · Dicker Qualm gebunden · Kalte Schulter gebunden · Deckel zu! gebunden · Räucherwurst gebunden

### schorsch-rauch · Pfad 1 · Stufe 10 ·227 Schaden/s · Ausrüstung +211.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.1 Heilung/s · Wumms 1 Schaden/s · Taktgefühl -0.3 Schaden/s · 0.1 Heilung/s · Bastelgrips 0.2 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 51.8 % · Grillzange 31.1 % · Autoangriff · Zangenklapper 17.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Deckelkonter 0 % · Zurück an den Absender 0 % · Notkäse 0 % · Garen mit Deckel gebunden · Deckelpolster gebunden · Doppelter Deckel gebunden · Käsekruste gebunden · Halloumi-Happen gebunden · Längerer Deckel gebunden

### schorsch-rauch · Pfad 2 · Stufe 10 ·240 Schaden/s · Ausrüstung +187 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.1 Heilung/s · Wumms 2 Schaden/s · Taktgefühl 1 Schaden/s · -0.1 Heilung/s · Bastelgrips 0.1 Schaden/s · -0.1 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 55.1 % · Grillzange 29.1 % · Autoangriff · Zangenklapper 15.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Brandmauer 0 % · Aufgeheizt 0 % · Glut unterm Deckel 0 % · Zwicken heizt gebunden · Nestwärme gebunden · Schwelbrand gebunden · Heißer Stein gebunden · Heiße Asche gebunden · Glutwächter gebunden

### schorsch-rauch · Pfad 0 · Stufe 20 ·289 Schaden/s · Ausrüstung +276.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.9 Heilung/s · Wumms 1.1 Schaden/s · -0.1 Heilung/s · Taktgefühl 1 Schaden/s · Bastelgrips -0.3 Schaden/s · 0.9 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Grillzange 45.3 % · Rauch 35 % · Autoangriff · Zangenklapper 19.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Feuerlöscher 0 % · Dicker Qualm 0 % · Kalte Schulter 0 % · Deckel zu! 0 % · Nachräuchern 0 % · Nebelmaschine 0 % · Garen mit Deckel 0 % · Zwicken heizt 0 % · Deckelpolster 0 % · Räucherwurst -11 % · Räucherkammer -15.8 % · Kalt anräuchern gebunden · Nasses Buchenholz gebunden

### schorsch-rauch · Pfad 1 · Stufe 20 ·338 Schaden/s · Ausrüstung +286.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.4 Schaden/s · -0.1 Heilung/s · Taktgefühl -0.1 Schaden/s · Bastelgrips 0.3 Schaden/s · -0.3 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 48.7 % · Grillzange 35.6 % · Autoangriff · Zangenklapper 15.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Deckelpolster 0 % · Doppelter Deckel 0 % · Käsekruste 0 % · Halloumi-Happen 0 % · Längerer Deckel 0 % · Deckelkonter 0 % · Notkäse 0 % · Halloumi-Panzer 0 % · Kalt anräuchern 0 % · Zwicken heizt 0 % · Feuerlöscher 0 % · Garen mit Deckel gebunden · Zurück an den Absender gebunden

### schorsch-rauch · Pfad 2 · Stufe 20 ·376 Schaden/s · Ausrüstung +247 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.1 Heilung/s · Wumms 0.4 Schaden/s · 0.3 Heilung/s · Taktgefühl 0.4 Schaden/s · Bastelgrips -0.8 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 59.4 % · Grillzange 24.8 % · Autoangriff · Zangenklapper 15.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Glutherz +3.5 % · Schwelbrand +0.9 % · Nestwärme 0 % · Heißer Stein 0 % · Heiße Asche 0 % · Glutwächter 0 % · Brandmauer 0 % · Glut unterm Deckel 0 % · Kalt anräuchern 0 % · Garen mit Deckel 0 % · Feuerlöscher 0 % · Zwicken heizt gebunden · Aufgeheizt gebunden

### kaethe-grand · Pfad 0 · Stufe 10 ·338 Schaden/s · Ausrüstung +165.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1 Heilung/s · Wumms 3.2 Schaden/s · -0.5 Heilung/s · Taktgefühl 1 Schaden/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 89.2 % · Autoangriff · Kartenschnipsen 10.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Spitzen +10.4 % · Auf die Hand 0 % · Trumpf nachziehen 0 % · Wenzel gebunden · Kreuz-Bube gebunden · Bube zieht nach gebunden · Der letzte Stich gebunden · Mit Vieren gebunden · Der Alte gebunden

### kaethe-grand · Pfad 1 · Stufe 10 ·268 Schaden/s · Ausrüstung +137.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 0.9 Heilung/s · Wumms 0.7 Schaden/s · 0.5 Heilung/s · Taktgefühl 0.2 Schaden/s · 0.3 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 87.1 % · Autoangriff · Kartenschnipsen 12.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Volle Augen +8.4 % · Buchführung +5.5 % · Strich auf dem Block 0 % · Mitzählen gebunden · Pfennigfuchserin gebunden · Knapp gewonnen gebunden · Gestochen scharf gebunden · Reizen gebunden · Skat drücken gebunden

### kaethe-grand · Pfad 2 · Stufe 10 ·286 Schaden/s · Ausrüstung +102.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.6 Heilung/s · Wumms 2.3 Schaden/s · -0.1 Heilung/s · Taktgefühl 0.4 Schaden/s · 0.1 Heilung/s · Bastelgrips 0 Schaden/s · 0.6 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 86.5 % · Autoangriff · Kartenschnipsen 13.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Unter der Hand 0 % · Durchmarsch 0 % · Nullspiel 0 % · Kleinvieh gebunden · Kleine Fische gebunden · Schnipp, schnapp gebunden · Ouvert gebunden · Blatt aufgefächert gebunden · Bis zum Anschlag gebunden

### kaethe-grand · Pfad 0 · Stufe 20 ·545 Schaden/s · Ausrüstung +159.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.1 Heilung/s · Wumms 2.1 Schaden/s · 1 Heilung/s · Taktgefühl 0.4 Schaden/s · -0.6 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 88.1 % · Autoangriff · Kartenschnipsen 11.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Bube zieht nach +13.9 % · Kreuz-Bube +8.7 % · Grand Hand +5.4 % · Kleinvieh +5.3 % · Mit Vieren +4.5 % · Spitzen +4.2 % · Mitzählen +3.9 % · Pfennigfuchserin +2.9 % · Der letzte Stich +1.9 % · Der Alte 0 % · Auf die Hand 0 % · Wenzel gebunden · Trumpf nachziehen gebunden

### kaethe-grand · Pfad 1 · Stufe 20 ·482 Schaden/s · Ausrüstung +147.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.1 Heilung/s · Wumms 2.5 Schaden/s · -0.1 Heilung/s · Taktgefühl -0.1 Schaden/s · -0.1 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 89.1 % · Autoangriff · Kartenschnipsen 10.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Revanche +15.8 % · Kreuz-Bube +12.3 % · Kleinvieh +11.3 % · Pfennigfuchserin +2.8 % · Volle Augen +2.8 % · Wenzel +2.6 % · Skat drücken +0.1 % · Gestochen scharf 0 % · Reizen 0 % · Strich auf dem Block 0 % · Knapp gewonnen -2.4 % · Mitzählen gebunden · Buchführung gebunden

### kaethe-grand · Pfad 2 · Stufe 20 ·567 Schaden/s · Ausrüstung +152.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.4 Heilung/s · Wumms 1.9 Schaden/s · 0.2 Heilung/s · Taktgefühl -1.2 Schaden/s · -1.4 Heilung/s · Bastelgrips 0 Schaden/s · 0.5 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 89.8 % · Autoangriff · Kartenschnipsen 10.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Null ouvert Hand +13.4 % · Kreuz-Bube +10.3 % · Kleine Fische +5.2 % · Wenzel +4.3 % · Mitzählen +3.4 % · Schnipp, schnapp +1.8 % · Bis zum Anschlag +0.1 % · Ouvert 0 % · Blatt aufgefächert 0 % · Unter der Hand 0 % · Nullspiel 0 % · Kleinvieh gebunden · Durchmarsch gebunden

### kaethe-herz · Pfad 0 · Stufe 10 ·185 Schaden/s · Ausrüstung +131.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 2.3 Heilung/s · Wumms 1.2 Schaden/s · -0.4 Heilung/s · Taktgefühl 0.3 Schaden/s · 0.7 Heilung/s · Bastelgrips 0 Schaden/s · 0.9 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 86.3 % · Autoangriff · Kartenschnipsen 13.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Herzensangelegenheit +2.7 % · Warmer Eierlikör 0 % · Noch eins, dann neu 0 % · Das Herz am rechten Fleck gebunden · Rote Dame gebunden · Nachschenken gebunden · Herzklopfen gebunden · Handlesen gebunden · Lebenslinie gebunden

### kaethe-herz · Pfad 1 · Stufe 10 ·187 Schaden/s · Ausrüstung +126.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.6 Heilung/s · Wumms 0.6 Schaden/s · Taktgefühl 0.6 Schaden/s · 1.2 Heilung/s · Bastelgrips 0 Schaden/s · 0.6 Heilung/s · Dicke Haut -0.1 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 85.9 % · Autoangriff · Kartenschnipsen 14.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Masche für Masche 0 % · Nichts verschenken 0 % · Doppelt gemauert 0 % · Pik auf die Brust gebunden · Letzte Masche gebunden · Pik-Ass gebunden · Mauern gebunden · Pik mit Stachel gebunden · Pik-Kette gebunden

### kaethe-herz · Pfad 2 · Stufe 10 ·187 Schaden/s · Ausrüstung +132.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.8 Heilung/s · Wumms 1.2 Schaden/s · 0.2 Heilung/s · Taktgefühl 0.6 Schaden/s · 0.8 Heilung/s · Bastelgrips 0 Schaden/s · 0.7 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 88.8 % · Autoangriff · Kartenschnipsen 11.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Legekreis im Gehen 0 % · Zukunft gesehen 0 % · Kartenlegen 0 % · Sterne lesen gebunden · Farbe halten gebunden · Wahrsagekugel gebunden · Blick über die Schulter gebunden · Hab ich kommen sehen gebunden · Kaffeefahrt gebunden

### kaethe-herz · Pfad 0 · Stufe 20 ·289 Schaden/s · Ausrüstung +180.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 2.6 Heilung/s · Wumms 0.2 Schaden/s · Taktgefühl -0.5 Schaden/s · 0.1 Heilung/s · Bastelgrips 0 Schaden/s · 1.1 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 87.3 % · Autoangriff · Kartenschnipsen 12.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Rote Dame 0 % · Nachschenken 0 % · Herzklopfen 0 % · Handlesen 0 % · Lebenslinie 0 % · Warmer Eierlikör 0 % · Noch eins, dann neu 0 % · Rote Rechnung 0 % · Pik auf die Brust 0 % · Letzte Masche 0 % · Sterne lesen -0.3 % · Das Herz am rechten Fleck gebunden · Herzensangelegenheit gebunden

### kaethe-herz · Pfad 1 · Stufe 20 ·296 Schaden/s · Ausrüstung +170.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 2.1 Heilung/s · Wumms -0.3 Schaden/s · -0.5 Heilung/s · Taktgefühl -0.1 Schaden/s · -0.5 Heilung/s · Bastelgrips 0 Schaden/s · 0.8 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 86.7 % · Autoangriff · Kartenschnipsen 13.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Pik mit Stachel +0.7 % · Sterne lesen +0.2 % · Letzte Masche 0 % · Pik-Ass 0 % · Mauern 0 % · Pik-Kette 0 % · Masche für Masche 0 % · Doppelt gemauert 0 % · Schutzbrief 0 % · Das Herz am rechten Fleck 0 % · Rote Dame 0 % · Pik auf die Brust gebunden · Nichts verschenken gebunden

### kaethe-herz · Pfad 2 · Stufe 20 ·339 Schaden/s · Ausrüstung +181.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.9 Heilung/s · Wumms 0.4 Schaden/s · 0.9 Heilung/s · 0.1 verhindert/s · Taktgefühl -0.3 Schaden/s · Bastelgrips 0 Schaden/s · 0.7 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 88.7 % · Autoangriff · Kartenschnipsen 11.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Die Karten lügen nie +15.4 % · Kaffeefahrt +1.1 % · Farbe halten 0 % · Wahrsagekugel 0 % · Blick über die Schulter 0 % · Hab ich kommen sehen 0 % · Legekreis im Gehen 0 % · Kartenlegen 0 % · Das Herz am rechten Fleck 0 % · Pik auf die Brust 0 % · Rote Dame 0 % · Sterne lesen gebunden · Zukunft gesehen gebunden

### kaethe-falsch · Pfad 0 · Stufe 10 ·265 Schaden/s · Ausrüstung +136.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.1 Heilung/s · Wumms 0.5 Schaden/s · 0.3 Heilung/s · Taktgefühl 1.9 Schaden/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 87.6 % · Autoangriff · Kartenschnipsen 12.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kontra mit Ansage 0 % · Dicke Strickjacke 0 % · Mauer nach dem Stich 0 % · Hab ich doch gesagt gebunden · Kontra zahlt gebunden · Hochgestochen gebunden · Stichfest gebunden · Da guckst du gebunden · Kontra im Takt gebunden

### kaethe-falsch · Pfad 1 · Stufe 10 ·287 Schaden/s · Ausrüstung +108.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.4 Heilung/s · Wumms 1.7 Schaden/s · -0.5 Heilung/s · Taktgefühl 0.9 Schaden/s · -0.1 Heilung/s · Bastelgrips 0 Schaden/s · 0.5 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 87.6 % · Autoangriff · Kartenschnipsen 12.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Flinke Finger +11.1 % · Nachgesteckt 0 % · Mischen ist Silber 0 % · Aus dem Ärmel gebunden · Notblatt gebunden · Bubentrick gebunden · Ärmel voll gebunden · Gezinkte Karten gebunden · Falsch gemischt gebunden

### kaethe-falsch · Pfad 2 · Stufe 10 ·302 Schaden/s · Ausrüstung +122.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.1 Heilung/s · Wumms 0.9 Schaden/s · -0.3 Heilung/s · Taktgefühl 0.3 Schaden/s · 0.3 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 86.4 % · Autoangriff · Kartenschnipsen 13.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Karo satt 0 % · Bockrunde 0 % · Hier geblieben! 0 % · Re! gebunden · Karo-Zehn gebunden · Kreuz-Dame gebunden · Karo bedient gebunden · Karo-Ass gebunden · Kreuz-Kette gebunden

### kaethe-falsch · Pfad 0 · Stufe 20 ·397 Schaden/s · Ausrüstung +179.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.2 Heilung/s · Wumms 0 Schaden/s · 0.3 Heilung/s · Taktgefühl -0.2 Schaden/s · 0.1 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 84.8 % · Autoangriff · Kartenschnipsen 15.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kontra gewonnen +1.3 % · Kontra zahlt 0 % · Hochgestochen 0 % · Stichfest 0 % · Da guckst du 0 % · Kontra im Takt 0 % · Kontra mit Ansage 0 % · Mauer nach dem Stich 0 % · Aus dem Ärmel 0 % · Re! 0 % · Notblatt 0 % · Hab ich doch gesagt gebunden · Dicke Strickjacke gebunden

### kaethe-falsch · Pfad 1 · Stufe 20 ·503 Schaden/s · Ausrüstung +174.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.1 Heilung/s · Wumms 3.7 Schaden/s · 0.1 Heilung/s · Taktgefühl 1 Schaden/s · 0.1 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 89.8 % · Autoangriff · Kartenschnipsen 10.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Falsch abgerechnet +21.1 % · Flinke Finger +12.4 % · Ärmel voll +1 % · Notblatt 0 % · Bubentrick 0 % · Gezinkte Karten 0 % · Falsch gemischt 0 % · Nachgesteckt 0 % · Hab ich doch gesagt 0 % · Re! 0 % · Kontra zahlt 0 % · Aus dem Ärmel gebunden · Mischen ist Silber gebunden

### kaethe-falsch · Pfad 2 · Stufe 20 ·445 Schaden/s · Ausrüstung +177.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · 1.4 Heilung/s · Wumms 0.6 Schaden/s · -1.1 Heilung/s · Taktgefühl 1.1 Schaden/s · -0.4 Heilung/s · Bastelgrips 0 Schaden/s · 0.5 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Kreuz 87.3 % · Autoangriff · Kartenschnipsen 12.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Karo-Zehn 0 % · Karo bedient 0 % · Karo satt 0 % · Hier geblieben! 0 % · Hab ich doch gesagt 0 % · Aus dem Ärmel 0 % · Kontra zahlt 0 % · Karo-Ass -1.5 % · Re und Bock -2.1 % · Kreuz-Kette -3.3 % · Kreuz-Dame -4.1 % · Re! gebunden · Bockrunde gebunden

