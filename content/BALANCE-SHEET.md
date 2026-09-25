# Balance-Sheet

Automatisch erzeugt von `npm run balance:sheet` · 2026-09-25 · 40 s Übungskampf, jede Zelle und jede Zerlegung als Mittel aus Boss (10× Feldleben) und Feldgruppe (drei Gegner mit Umland-Leben); gefallene Gegner ersetzt sofort ein neuer (Kill-Talente zählen), Zufall mit 3 festen Startwerten gemittelt, gemeinsame Prioritäten-Rotation (Heiler heilen zuerst), Puppen treffen jede Sekunde mit 3 % des Grundlebens. Voller Ausrüstungssatz auf Charakterstufe (Werteprofile im Wechsel); „Startausrüstung“ = Flasche, Topfdeckel, Schleuder, Kutte. Talentpfad 0–2 über `pathBuild`, Stufe 1 ohne Spezialisierung.

Jede Rolle misst sich an ihrer Kennzahl: **Schaden** → Schaden/s, **Heilung** → Heilung/s (Ausstoß inkl. Überheilung; dahinter „eff.“ = tatsächlich geheilt, ohne Überheilung – ⚑ und Median bleiben am Ausstoß), **Tank** → Schutz/s (verhinderter Schaden + Deckung). Zelle: Kennzahl (Abweichung vom Median der Rolle auf dieser Stufe × Ausrüstung). ⚑ = mehr als 15 % daneben (ab Stufe 5).

## Überblick

220 von 900 Messungen liegen mehr als 15 % neben dem Median ihrer Rolle.

## Ausrüstung: Startausrüstung

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 59 (-2.3 %) | 101 (-10.9 %) | 107 (-21.2 %) ⚑ | 125 (-22.3 %) ⚑ | 143 (-18.8 %) ⚑ | 181 (-15.5 %) ⚑ |
| dieter-brawl | 1 | 59 (-2.3 %) | 114 (+1 %) | 149 (+9.6 %) | 187 (+16.4 %) ⚑ | 208 (+18.1 %) ⚑ | 246 (+14.6 %) |
| dieter-brawl | 2 | 59 (-2.3 %) | 110 (-2.2 %) | 126 (-7.7 %) | 133 (-16.9 %) ⚑ | 159 (-9.9 %) | 189 (-11.7 %) |
| baerbel-feedback | 0 | 61 (0 %) | 131 (+15.8 %) ⚑ | 145 (+6.7 %) | 143 (-11.2 %) | 152 (-13.7 %) | 165 (-23 %) ⚑ |
| baerbel-feedback | 1 | 61 (0 %) | 141 (+24.7 %) ⚑ | 136 (0 %) | 145 (-9.8 %) | 147 (-16.4 %) ⚑ | 163 (-23.9 %) ⚑ |
| baerbel-feedback | 2 | 61 (0 %) | 146 (+28.9 %) ⚑ | 180 (+32.5 %) ⚑ | 193 (+20.4 %) ⚑ | 202 (+14.3 %) | 216 (+0.6 %) |
| baerbel-stage | 0 | 61 (0 %) | 111 (-2.1 %) | 135 (-0.8 %) | 170 (+6 %) | 181 (+2.5 %) | 220 (+2.4 %) |
| baerbel-stage | 1 | 61 (0 %) | 127 (+12.1 %) | 154 (+13.1 %) | 174 (+8.2 %) | 193 (+9.6 %) | 215 (0 %) |
| baerbel-stage | 2 | 61 (0 %) | 118 (+4.9 %) | 128 (-5.7 %) | 147 (-8.6 %) | 155 (-12.3 %) | 181 (-15.6 %) ⚑ |
| kevin-fuse | 0 | 50 (-16.9 %) | 113 (0 %) | 158 (+16 %) ⚑ | 198 (+23.4 %) ⚑ | 169 (-4.4 %) | 269 (+25.4 %) ⚑ |
| kevin-fuse | 1 | 50 (-16.9 %) | 105 (-6.8 %) | 127 (-6.5 %) | 167 (+4.2 %) | 181 (+2.3 %) | 250 (+16.4 %) ⚑ |
| kevin-fuse | 2 | 50 (-16.9 %) | 147 (+30.5 %) ⚑ | 151 (+11.1 %) | 161 (0 %) | 169 (-4.1 %) | 229 (+6.5 %) |
| kevin-hunt | 0 | 50 (-16.9 %) | 134 (+19 %) ⚑ | 148 (+8.8 %) | 160 (-0.4 %) | 176 (0 %) | 187 (-12.7 %) |
| kevin-hunt | 1 | 50 (-16.9 %) | 120 (+6.1 %) | 136 (-0.1 %) | 154 (-4 %) | 155 (-12.4 %) | 185 (-14 %) |
| kevin-hunt | 2 | 50 (-16.9 %) | 125 (+10.5 %) | 154 (+12.9 %) | 195 (+21.2 %) ⚑ | 207 (+17.6 %) ⚑ | 232 (+8.3 %) |
| schorsch-flamme | 0 | 72 (+18.8 %) | 98 (-13.4 %) | 133 (-2.4 %) | 149 (-7.3 %) | 167 (-5.6 %) | 187 (-13 %) |
| schorsch-flamme | 1 | 72 (+18.8 %) | 97 (-14.2 %) | 111 (-18.2 %) ⚑ | 137 (-15 %) | 144 (-18.6 %) ⚑ | 187 (-12.9 %) |
| schorsch-flamme | 2 | 72 (+18.8 %) | 101 (-10.7 %) | 128 (-5.7 %) | 150 (-6.4 %) | 174 (-1.5 %) | 202 (-6.1 %) |
| kaethe-grand | 0 | 61 (+0.7 %) | 120 (+6.6 %) | 148 (+8.7 %) | 180 (+11.9 %) | 199 (+12.5 %) | 234 (+8.8 %) |
| kaethe-grand | 1 | 61 (+0.7 %) | 97 (-13.7 %) | 110 (-19.5 %) ⚑ | 146 (-9.3 %) | 180 (+2.3 %) | 236 (+10 %) |
| kaethe-grand | 2 | 61 (+0.7 %) | 105 (-6.9 %) | 135 (-1 %) | 163 (+1.7 %) | 205 (+16.4 %) ⚑ | 268 (+24.8 %) ⚑ |
| kaethe-falsch | 0 | 61 (+0.7 %) | 99 (-12.6 %) | 120 (-11.5 %) | 142 (-11.5 %) | 153 (-13.2 %) | 186 (-13.3 %) |
| kaethe-falsch | 1 | 61 (+0.7 %) | 95 (-15.7 %) ⚑ | 155 (+14 %) | 173 (+7.6 %) | 187 (+6 %) | 215 (0 %) |
| kaethe-falsch | 2 | 61 (+0.7 %) | 103 (-8.4 %) | 146 (+7.5 %) | 179 (+11.5 %) | 192 (+8.6 %) | 228 (+6.4 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) · eff. 0 | 31 (-29 %) ⚑ · eff. 14 | 32 (-50.4 %) ⚑ · eff. 16 | 45 (-46.8 %) ⚑ · eff. 20 | 54 (-44.4 %) ⚑ · eff. 24 | 55 (-56.5 %) ⚑ · eff. 28 |
| dieter-brew | 1 | 0 (-100 %) · eff. 0 | 38 (-12.1 %) · eff. 14 | 64 (-1.1 %) · eff. 17 | 89 (+4.8 %) · eff. 18 | 104 (+6.5 %) · eff. 19 | 128 (+0.4 %) · eff. 26 |
| dieter-brew | 2 | 0 (-100 %) · eff. 0 | 30 (-31.6 %) ⚑ · eff. 14 | 36 (-43.9 %) ⚑ · eff. 14 | 42 (-50.6 %) ⚑ · eff. 17 | 46 (-52.7 %) ⚑ · eff. 21 | 57 (-55.1 %) ⚑ · eff. 27 |
| baerbel-care | 0 | 0 (-100 %) · eff. 0 | 55 (+28.1 %) ⚑ · eff. 22 | 73 (+14 %) · eff. 28 | 93 (+9.9 %) · eff. 35 | 109 (+12 %) · eff. 42 | 138 (+8.7 %) · eff. 1 |
| baerbel-care | 1 | 0 (-100 %) · eff. 0 | 39 (-10.4 %) · eff. 20 | 78 (+21.9 %) ⚑ · eff. 21 | 115 (+35.4 %) ⚑ · eff. 27 | 151 (+54.8 %) ⚑ · eff. 33 | 203 (+60.2 %) ⚑ · eff. 1 |
| baerbel-care | 2 | 0 (-100 %) · eff. 0 | 42 (-2.1 %) · eff. 4 | 59 (-8.2 %) · eff. 1 | 95 (+12.5 %) · eff. 1 | 138 (+41.1 %) ⚑ · eff. 1 | 172 (+35.1 %) ⚑ · eff. 1 |
| schorsch-chef | 0 | 0 (-100 %) · eff. 0 | 47 (+8.6 %) · eff. 4 | 76 (+17.9 %) ⚑ · eff. 2 | 77 (-9.1 %) · eff. 2 | 92 (-5.7 %) · eff. 3 | 120 (-5.4 %) · eff. 3 |
| schorsch-chef | 1 | 0 (-100 %) · eff. 0 | 37 (-13.9 %) · eff. 16 | 58 (-9.6 %) · eff. 22 | 66 (-21.9 %) ⚑ · eff. 28 | 94 (-3.6 %) · eff. 36 | 119 (-6.2 %) · eff. 3 |
| schorsch-chef | 2 | 0 (-100 %) · eff. 0 | 43 (0 %) · eff. 20 | 64 (0 %) · eff. 26 | 77 (-8.8 %) · eff. 33 | 89 (-9.2 %) · eff. 34 | 104 (-18.5 %) ⚑ · eff. 3 |
| kaethe-herz | 0 | 19 (+1770 %) · eff. 3 | 45 (+3.9 %) · eff. 11 | 80 (+23.8 %) ⚑ · eff. 20 | 98 (+15.3 %) ⚑ · eff. 22 | 118 (+20.9 %) ⚑ · eff. 25 | 153 (+20.6 %) ⚑ · eff. 32 |
| kaethe-herz | 1 | 19 (+1770 %) · eff. 3 | 47 (+9.7 %) · eff. 7 | 64 (+0.2 %) · eff. 1 | 74 (-12.6 %) · eff. 0 | 90 (-7.3 %) · eff. 0 | 121 (-4.8 %) · eff. 0 |
| kaethe-herz | 2 | 19 (+1770 %) · eff. 3 | 44 (+1.9 %) · eff. 11 | 62 (-3.7 %) · eff. 14 | 85 (0 %) · eff. 20 | 98 (0 %) · eff. 18 | 127 (0 %) · eff. 25 |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 8 (+33.3 %) | 25 (-14.1 %) | 39 (0 %) | 44 (-8.5 %) | 52 (-9 %) | 65 (-12.9 %) |
| dieter-wall | 1 | 8 (+33.3 %) | 14 (-52.1 %) ⚑ | 22 (-42.1 %) ⚑ | 42 (-12 %) | 55 (-3 %) | 71 (-5 %) |
| dieter-wall | 2 | 8 (+33.3 %) | 14 (-53.4 %) ⚑ | 23 (-40.5 %) ⚑ | 34 (-30.3 %) ⚑ | 41 (-27.4 %) ⚑ | 63 (-15.7 %) ⚑ |
| kevin-iron | 0 | 3 (-50 %) | 29 (+0.7 %) | 39 (0 %) | 49 (+0.8 %) | 59 (+3.9 %) | 76 (+2.6 %) |
| kevin-iron | 1 | 3 (-50 %) | 30 (+4.1 %) | 39 (+2.1 %) | 48 (0 %) | 57 (0 %) | 75 (+0.1 %) |
| kevin-iron | 2 | 3 (-50 %) | 26 (-9 %) | 35 (-10.4 %) | 43 (-11.2 %) | 54 (-5.3 %) | 72 (-3.6 %) |
| schorsch-rauch | 0 | 6 (0 %) | 29 (+0.3 %) | 40 (+4.4 %) | 52 (+8.1 %) | 61 (+6.7 %) | 79 (+5.8 %) |
| schorsch-rauch | 1 | 6 (0 %) | 30 (+2.1 %) | 42 (+9.6 %) | 53 (+10 %) | 63 (+11.1 %) | 83 (+11.4 %) |
| schorsch-rauch | 2 | 6 (0 %) | 29 (0 %) | 38 (-1.6 %) | 49 (+0.6 %) | 57 (+0.9 %) | 74 (0 %) |

## Ausrüstung: ungewöhnlich

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 94 (-0.7 %) | 167 (-10.8 %) | 205 (-22.5 %) ⚑ | 265 (-26.2 %) ⚑ | 315 (-26.5 %) ⚑ | 449 (-23.1 %) ⚑ |
| dieter-brawl | 1 | 94 (-0.7 %) | 197 (+5 %) | 264 (0 %) | 369 (+3 %) | 429 (0 %) | 666 (+14.1 %) |
| dieter-brawl | 2 | 94 (-0.7 %) | 186 (-0.7 %) | 243 (-7.9 %) | 305 (-14.8 %) | 393 (-8.2 %) | 499 (-14.6 %) |
| baerbel-feedback | 0 | 98 (+3.3 %) | 200 (+6.8 %) | 255 (-3.6 %) | 315 (-12.1 %) | 385 (-10.2 %) | 502 (-14.1 %) |
| baerbel-feedback | 1 | 98 (+3.3 %) | 226 (+20.6 %) ⚑ | 263 (-0.5 %) | 316 (-11.7 %) | 365 (-14.7 %) | 492 (-15.8 %) ⚑ |
| baerbel-feedback | 2 | 98 (+3.3 %) | 240 (+28 %) ⚑ | 306 (+15.7 %) ⚑ | 368 (+2.7 %) | 441 (+3 %) | 553 (-5.3 %) |
| baerbel-stage | 0 | 98 (+3.3 %) | 183 (-2.4 %) | 250 (-5.3 %) | 347 (-3.2 %) | 419 (-2.3 %) | 577 (-1.2 %) |
| baerbel-stage | 1 | 98 (+3.3 %) | 203 (+8.2 %) | 301 (+13.8 %) | 400 (+11.5 %) | 447 (+4.2 %) | 604 (+3.5 %) |
| baerbel-stage | 2 | 98 (+3.3 %) | 183 (-2.8 %) | 231 (-12.5 %) | 294 (-17.9 %) ⚑ | 349 (-18.7 %) ⚑ | 478 (-18.2 %) ⚑ |
| kevin-fuse | 0 | 84 (-11.4 %) | 181 (-3.4 %) | 254 (-3.7 %) | 335 (-6.5 %) | 417 (-2.8 %) | 604 (+3.4 %) |
| kevin-fuse | 1 | 84 (-11.4 %) | 162 (-13.6 %) | 244 (-7.7 %) | 363 (+1.2 %) | 480 (+12 %) | 656 (+12.3 %) |
| kevin-fuse | 2 | 84 (-11.4 %) | 231 (+23.1 %) ⚑ | 292 (+10.5 %) | 360 (+0.5 %) | 418 (-2.5 %) | 627 (+7.4 %) |
| kevin-hunt | 0 | 84 (-11.4 %) | 199 (+5.8 %) | 263 (-0.4 %) | 340 (-5 %) | 415 (-3.1 %) | 581 (-0.5 %) |
| kevin-hunt | 1 | 84 (-11.4 %) | 192 (+2.3 %) | 252 (-4.7 %) | 334 (-6.9 %) | 402 (-6.2 %) | 538 (-7.8 %) |
| kevin-hunt | 2 | 84 (-11.4 %) | 199 (+6.2 %) | 274 (+3.8 %) | 374 (+4.3 %) | 453 (+5.8 %) | 584 (0 %) |
| schorsch-flamme | 0 | 114 (+19.9 %) | 188 (0 %) | 298 (+12.8 %) | 385 (+7.3 %) | 464 (+8.2 %) | 631 (+8 %) |
| schorsch-flamme | 1 | 114 (+19.9 %) | 185 (-1.4 %) | 268 (+1.4 %) | 359 (0 %) | 434 (+1.3 %) | 651 (+11.4 %) |
| schorsch-flamme | 2 | 114 (+19.9 %) | 192 (+2.1 %) | 265 (+0.4 %) | 367 (+2.3 %) | 430 (+0.3 %) | 617 (+5.7 %) |
| kaethe-grand | 0 | 95 (0 %) | 198 (+5.3 %) | 296 (+11.8 %) | 348 (-2.8 %) | 452 (+5.6 %) | 572 (-2.1 %) |
| kaethe-grand | 1 | 95 (0 %) | 160 (-14.5 %) | 232 (-12.3 %) | 295 (-17.7 %) ⚑ | 390 (-8.9 %) | 569 (-2.5 %) |
| kaethe-grand | 2 | 95 (0 %) | 161 (-14.1 %) | 276 (+4.4 %) | 407 (+13.6 %) | 488 (+13.8 %) | 669 (+14.4 %) |
| kaethe-falsch | 0 | 95 (0 %) | 173 (-8 %) | 241 (-8.8 %) | 321 (-10.4 %) | 366 (-14.6 %) | 514 (-12 %) |
| kaethe-falsch | 1 | 95 (0 %) | 168 (-10.6 %) | 302 (+14.3 %) | 404 (+12.6 %) | 503 (+17.4 %) ⚑ | 604 (+3.5 %) |
| kaethe-falsch | 2 | 95 (0 %) | 182 (-2.9 %) | 276 (+4.5 %) | 365 (+1.9 %) | 441 (+2.9 %) | 596 (+2.1 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) · eff. 0 | 39 (-25 %) ⚑ · eff. 12 | 48 (-42.7 %) ⚑ · eff. 13 | 73 (-31.9 %) ⚑ · eff. 16 | 97 (-26.7 %) ⚑ · eff. 20 | 114 (-34.4 %) ⚑ · eff. 25 |
| dieter-brew | 1 | 0 (-100 %) · eff. 0 | 54 (+4.4 %) · eff. 12 | 92 (+10 %) · eff. 11 | 113 (+5.8 %) · eff. 10 | 132 (0 %) · eff. 9 | 174 (0 %) · eff. 13 |
| dieter-brew | 2 | 0 (-100 %) · eff. 0 | 42 (-18.6 %) ⚑ · eff. 12 | 48 (-42.3 %) ⚑ · eff. 7 | 61 (-42.8 %) ⚑ · eff. 9 | 80 (-39.6 %) ⚑ · eff. 11 | 113 (-35.1 %) ⚑ · eff. 16 |
| baerbel-care | 0 | 0 (-100 %) · eff. 0 | 62 (+18 %) ⚑ · eff. 17 | 68 (-18.7 %) ⚑ · eff. 20 | 84 (-20.8 %) ⚑ · eff. 25 | 97 (-26.8 %) ⚑ · eff. 30 | 185 (+6.5 %) · eff. 1 |
| baerbel-care | 1 | 0 (-100 %) · eff. 0 | 52 (-0.2 %) · eff. 17 | 89 (+5.9 %) · eff. 11 | 144 (+34.7 %) ⚑ · eff. 14 | 176 (+33.3 %) ⚑ · eff. 17 | 288 (+65.7 %) ⚑ · eff. 1 |
| baerbel-care | 2 | 0 (-100 %) · eff. 0 | 52 (+0.6 %) · eff. 0 | 81 (-3.5 %) · eff. 1 | 139 (+30.4 %) ⚑ · eff. 1 | 188 (+42.4 %) ⚑ · eff. 1 | 247 (+42 %) ⚑ · eff. 1 |
| schorsch-chef | 0 | 0 (-100 %) · eff. 0 | 55 (+5.2 %) · eff. 5 | 104 (+24.8 %) ⚑ · eff. 4 | 111 (+3.7 %) · eff. 3 | 135 (+2.3 %) · eff. 4 | 182 (+4.9 %) · eff. 6 |
| schorsch-chef | 1 | 0 (-100 %) · eff. 0 | 44 (-16.1 %) ⚑ · eff. 13 | 85 (+1.4 %) · eff. 13 | 97 (-9.2 %) · eff. 21 | 130 (-1.4 %) · eff. 26 | 173 (-0.5 %) · eff. 5 |
| schorsch-chef | 2 | 0 (-100 %) · eff. 0 | 48 (-7.7 %) · eff. 16 | 84 (0 %) · eff. 19 | 107 (0 %) · eff. 25 | 123 (-7.1 %) · eff. 23 | 153 (-12 %) · eff. 4 |
| kaethe-herz | 0 | 21 (+1960 %) · eff. 1 | 52 (0 %) · eff. 6 | 92 (+10.3 %) · eff. 11 | 124 (+16.1 %) ⚑ · eff. 13 | 150 (+13.3 %) · eff. 16 | 204 (+17.4 %) ⚑ · eff. 20 |
| kaethe-herz | 1 | 21 (+1960 %) · eff. 1 | 56 (+6.9 %) · eff. 5 | 75 (-10.8 %) · eff. 0 | 97 (-8.9 %) · eff. 0 | 125 (-5.2 %) · eff. 0 | 158 (-9.2 %) · eff. 0 |
| kaethe-herz | 2 | 21 (+1960 %) · eff. 1 | 52 (-1 %) · eff. 6 | 80 (-4.4 %) · eff. 7 | 106 (-0.6 %) · eff. 10 | 132 (+0.1 %) · eff. 10 | 157 (-9.8 %) · eff. 11 |

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
| schorsch-rauch | 1 | 8 (0 %) | 30 (+10.9 %) | 41 (+18.2 %) ⚑ | 51 (+3.2 %) | 60 (+3.1 %) | 80 (+2.1 %) |
| schorsch-rauch | 2 | 8 (0 %) | 30 (+10.9 %) | 41 (+18.2 %) ⚑ | 51 (+3.2 %) | 60 (+3.4 %) | 79 (+1.9 %) |

## Ausrüstung: selten

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 111 (0 %) | 208 (-9.8 %) | 226 (-26.7 %) ⚑ | 312 (-27.5 %) ⚑ | 388 (-25.8 %) ⚑ | 536 (-21.7 %) ⚑ |
| dieter-brawl | 1 | 111 (0 %) | 246 (+6.6 %) | 295 (-4.2 %) | 456 (+6.1 %) | 526 (+0.4 %) | 676 (-1.2 %) |
| dieter-brawl | 2 | 111 (0 %) | 230 (0 %) | 287 (-6.8 %) | 354 (-17.6 %) ⚑ | 442 (-15.6 %) ⚑ | 607 (-11.3 %) |
| baerbel-feedback | 0 | 113 (+1.3 %) | 244 (+5.8 %) | 295 (-3.9 %) | 370 (-14 %) | 420 (-19.8 %) ⚑ | 585 (-14.6 %) |
| baerbel-feedback | 1 | 113 (+1.3 %) | 272 (+17.9 %) ⚑ | 305 (-0.9 %) | 393 (-8.7 %) | 423 (-19.3 %) ⚑ | 581 (-15.2 %) ⚑ |
| baerbel-feedback | 2 | 113 (+1.3 %) | 292 (+26.5 %) ⚑ | 348 (+13.2 %) | 460 (+6.9 %) | 528 (+0.9 %) | 632 (-7.7 %) |
| baerbel-stage | 0 | 113 (+1.3 %) | 218 (-5.6 %) | 294 (-4.3 %) | 399 (-7.3 %) | 476 (-9.1 %) | 656 (-4.2 %) |
| baerbel-stage | 1 | 113 (+1.3 %) | 234 (+1.5 %) | 344 (+11.8 %) | 440 (+2.4 %) | 534 (+2 %) | 730 (+6.5 %) |
| baerbel-stage | 2 | 113 (+1.3 %) | 214 (-7.3 %) | 284 (-7.7 %) | 344 (-20 %) ⚑ | 399 (-23.8 %) ⚑ | 579 (-15.4 %) ⚑ |
| kevin-fuse | 0 | 98 (-12.5 %) | 207 (-10.2 %) | 272 (-11.6 %) | 376 (-12.6 %) | 446 (-14.8 %) | 719 (+5 %) |
| kevin-fuse | 1 | 98 (-12.5 %) | 192 (-16.6 %) ⚑ | 291 (-5.3 %) | 424 (-1.3 %) | 513 (-2.1 %) | 760 (+11 %) |
| kevin-fuse | 2 | 98 (-12.5 %) | 263 (+14.1 %) | 338 (+10 %) | 455 (+5.7 %) | 530 (+1.2 %) | 736 (+7.5 %) |
| kevin-hunt | 0 | 98 (-12.5 %) | 243 (+5.4 %) | 311 (+1.1 %) | 402 (-6.4 %) | 486 (-7.3 %) | 685 (0 %) |
| kevin-hunt | 1 | 98 (-12.5 %) | 230 (0 %) | 295 (-4 %) | 411 (-4.5 %) | 485 (-7.4 %) | 641 (-6.4 %) |
| kevin-hunt | 2 | 98 (-12.5 %) | 227 (-1.5 %) | 308 (0 %) | 430 (0 %) | 516 (-1.4 %) | 667 (-2.6 %) |
| schorsch-flamme | 0 | 127 (+14.3 %) | 237 (+3 %) | 331 (+7.6 %) | 471 (+9.4 %) | 567 (+8.3 %) | 749 (+9.4 %) |
| schorsch-flamme | 1 | 127 (+14.3 %) | 232 (+0.7 %) | 314 (+2 %) | 465 (+8.1 %) | 537 (+2.6 %) | 791 (+15.6 %) ⚑ |
| schorsch-flamme | 2 | 127 (+14.3 %) | 230 (-0.3 %) | 321 (+4.4 %) | 440 (+2.3 %) | 528 (+0.8 %) | 751 (+9.7 %) |
| kaethe-grand | 0 | 101 (-9 %) | 237 (+2.7 %) | 337 (+9.7 %) | 432 (+0.5 %) | 561 (+7.1 %) | 724 (+5.8 %) |
| kaethe-grand | 1 | 101 (-9 %) | 199 (-13.8 %) | 276 (-10.2 %) | 385 (-10.6 %) | 524 (0 %) | 676 (-1.3 %) |
| kaethe-grand | 2 | 101 (-9 %) | 197 (-14.6 %) | 325 (+5.6 %) | 458 (+6.6 %) | 571 (+9 %) | 832 (+21.5 %) ⚑ |
| kaethe-falsch | 0 | 101 (-9 %) | 205 (-11.1 %) | 276 (-10.4 %) | 402 (-6.6 %) | 456 (-12.9 %) | 604 (-11.8 %) |
| kaethe-falsch | 1 | 101 (-9 %) | 212 (-7.9 %) | 354 (+15.1 %) ⚑ | 498 (+15.7 %) ⚑ | 558 (+6.5 %) | 777 (+13.4 %) |
| kaethe-falsch | 2 | 101 (-9 %) | 220 (-4.3 %) | 328 (+6.5 %) | 471 (+9.5 %) | 531 (+1.5 %) | 688 (+0.4 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) · eff. 0 | 37 (-29.6 %) ⚑ · eff. 11 | 54 (-38.8 %) ⚑ · eff. 14 | 79 (-34.2 %) ⚑ · eff. 15 | 105 (-22.4 %) ⚑ · eff. 18 | 131 (-27.4 %) ⚑ · eff. 24 |
| dieter-brew | 1 | 0 (-100 %) · eff. 0 | 55 (+5.6 %) · eff. 11 | 104 (+18.2 %) ⚑ · eff. 10 | 142 (+19.2 %) ⚑ · eff. 8 | 133 (-1.9 %) · eff. 6 | 178 (-1.4 %) · eff. 10 |
| dieter-brew | 2 | 0 (-100 %) · eff. 0 | 47 (-10.7 %) · eff. 11 | 54 (-38.6 %) ⚑ · eff. 7 | 69 (-41.9 %) ⚑ · eff. 8 | 88 (-34.9 %) ⚑ · eff. 9 | 126 (-29.8 %) ⚑ · eff. 13 |
| baerbel-care | 0 | 0 (-100 %) · eff. 0 | 66 (+27.3 %) ⚑ · eff. 16 | 81 (-8.2 %) · eff. 20 | 92 (-22.7 %) ⚑ · eff. 23 | 116 (-14.5 %) · eff. 26 | 211 (+17.3 %) ⚑ · eff. 1 |
| baerbel-care | 1 | 0 (-100 %) · eff. 0 | 48 (-8.3 %) · eff. 16 | 91 (+3.4 %) · eff. 10 | 137 (+14.7 %) · eff. 11 | 159 (+17.6 %) ⚑ · eff. 12 | 294 (+63.1 %) ⚑ · eff. 1 |
| baerbel-care | 2 | 0 (-100 %) · eff. 0 | 53 (+1.3 %) · eff. 0 | 87 (-0.7 %) · eff. 1 | 156 (+30.8 %) ⚑ · eff. 1 | 202 (+49.5 %) ⚑ · eff. 1 | 261 (+45 %) ⚑ · eff. 1 |
| schorsch-chef | 0 | 0 (-100 %) · eff. 0 | 56 (+8.3 %) · eff. 6 | 110 (+24.8 %) ⚑ · eff. 4 | 126 (+5.4 %) · eff. 5 | 145 (+7.4 %) · eff. 5 | 187 (+3.7 %) · eff. 8 |
| schorsch-chef | 1 | 0 (-100 %) · eff. 0 | 46 (-11.5 %) · eff. 12 | 88 (0 %) · eff. 13 | 110 (-7.8 %) · eff. 16 | 145 (+7 %) · eff. 22 | 180 (0 %) · eff. 4 |
| schorsch-chef | 2 | 0 (-100 %) · eff. 0 | 52 (-0.8 %) · eff. 15 | 90 (+2.7 %) · eff. 18 | 119 (0 %) · eff. 22 | 135 (0 %) · eff. 20 | 167 (-7.1 %) · eff. 3 |
| kaethe-herz | 0 | 24 (+2340 %) · eff. 1 | 52 (0 %) · eff. 5 | 100 (+13.1 %) · eff. 10 | 141 (+18 %) ⚑ · eff. 11 | 163 (+20.4 %) ⚑ · eff. 12 | 220 (+21.9 %) ⚑ · eff. 17 |
| kaethe-herz | 1 | 24 (+2340 %) · eff. 1 | 56 (+7.3 %) · eff. 4 | 78 (-11.7 %) · eff. 0 | 103 (-13.3 %) · eff. 0 | 134 (-1 %) · eff. 0 | 178 (-0.9 %) · eff. 0 |
| kaethe-herz | 2 | 24 (+2340 %) · eff. 1 | 50 (-3.3 %) · eff. 5 | 81 (-8.4 %) · eff. 7 | 118 (-1 %) · eff. 9 | 133 (-1.8 %) · eff. 6 | 177 (-1.7 %) · eff. 8 |

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
| schorsch-rauch | 2 | 8 (0 %) | 30 (+11.9 %) | 41 (+17.2 %) ⚑ | 50 (+1.4 %) | 58 (+1.4 %) | 77 (+0.1 %) |

## Ausrüstung: episch

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 146 (+0.8 %) | 229 (-11.6 %) | 294 (-21.2 %) ⚑ | 383 (-25.7 %) ⚑ | 461 (-24.4 %) ⚑ | 639 (-21.1 %) ⚑ |
| dieter-brawl | 1 | 146 (+0.8 %) | 255 (-1.4 %) | 376 (+0.7 %) | 527 (+2.2 %) | 648 (+6.3 %) | 851 (+5.1 %) |
| dieter-brawl | 2 | 146 (+0.8 %) | 256 (-1.1 %) | 316 (-15.2 %) ⚑ | 406 (-21.2 %) ⚑ | 525 (-13.9 %) | 648 (-20 %) ⚑ |
| baerbel-feedback | 0 | 145 (0 %) | 279 (+7.6 %) | 334 (-10.6 %) | 459 (-11.1 %) | 532 (-12.7 %) | 742 (-8.4 %) |
| baerbel-feedback | 1 | 145 (0 %) | 315 (+21.8 %) ⚑ | 362 (-3.1 %) | 487 (-5.6 %) | 494 (-18.9 %) ⚑ | 733 (-9.5 %) |
| baerbel-feedback | 2 | 145 (0 %) | 329 (+27.1 %) ⚑ | 432 (+15.8 %) ⚑ | 589 (+14.1 %) | 645 (+5.9 %) | 740 (-8.7 %) |
| baerbel-stage | 0 | 145 (0 %) | 259 (0 %) | 319 (-14.4 %) | 466 (-9.6 %) | 541 (-11.2 %) | 755 (-6.8 %) |
| baerbel-stage | 1 | 145 (0 %) | 278 (+7.4 %) | 391 (+4.9 %) | 546 (+5.8 %) | 663 (+8.7 %) | 861 (+6.3 %) |
| baerbel-stage | 2 | 145 (0 %) | 259 (+0.1 %) | 309 (-17.1 %) ⚑ | 434 (-15.9 %) ⚑ | 507 (-16.7 %) ⚑ | 745 (-8.1 %) |
| kevin-fuse | 0 | 129 (-10.7 %) | 242 (-6.6 %) | 322 (-13.7 %) | 435 (-15.8 %) ⚑ | 493 (-19.1 %) ⚑ | 777 (-4.1 %) |
| kevin-fuse | 1 | 129 (-10.7 %) | 224 (-13.6 %) | 322 (-13.6 %) | 516 (0 %) | 601 (-1.4 %) | 899 (+11 %) |
| kevin-fuse | 2 | 129 (-10.7 %) | 291 (+12.4 %) | 389 (+4.4 %) | 558 (+8.2 %) | 602 (-1.1 %) | 919 (+13.4 %) |
| kevin-hunt | 0 | 129 (-10.7 %) | 257 (-0.6 %) | 382 (+2.5 %) | 486 (-5.9 %) | 609 (0 %) | 795 (-1.8 %) |
| kevin-hunt | 1 | 129 (-10.7 %) | 248 (-4 %) | 345 (-7.5 %) | 456 (-11.6 %) | 557 (-8.7 %) | 763 (-5.8 %) |
| kevin-hunt | 2 | 129 (-10.7 %) | 268 (+3.4 %) | 379 (+1.6 %) | 505 (-2.1 %) | 626 (+2.8 %) | 810 (0 %) |
| schorsch-flamme | 0 | 152 (+5.2 %) | 285 (+10 %) | 426 (+14.3 %) | 597 (+15.6 %) ⚑ | 713 (+16.9 %) ⚑ | 974 (+20.3 %) ⚑ |
| schorsch-flamme | 1 | 152 (+5.2 %) | 274 (+6 %) | 364 (-2.3 %) | 560 (+8.5 %) | 675 (+10.8 %) | 959 (+18.4 %) ⚑ |
| schorsch-flamme | 2 | 152 (+5.2 %) | 274 (+6 %) | 376 (+0.9 %) | 534 (+3.6 %) | 658 (+7.9 %) | 920 (+13.6 %) |
| kaethe-grand | 0 | 125 (-13.5 %) | 268 (+3.6 %) | 400 (+7.1 %) | 553 (+7.1 %) | 674 (+10.7 %) | 992 (+22.5 %) ⚑ |
| kaethe-grand | 1 | 125 (-13.5 %) | 239 (-7.7 %) | 326 (-12.6 %) | 460 (-10.9 %) | 582 (-4.4 %) | 797 (-1.7 %) |
| kaethe-grand | 2 | 125 (-13.5 %) | 234 (-9.7 %) | 373 (0 %) | 575 (+11.5 %) | 704 (+15.5 %) ⚑ | 1004 (+23.9 %) ⚑ |
| kaethe-falsch | 0 | 125 (-13.5 %) | 240 (-7.2 %) | 345 (-7.5 %) | 483 (-6.3 %) | 539 (-11.5 %) | 738 (-8.9 %) |
| kaethe-falsch | 1 | 125 (-13.5 %) | 237 (-8.5 %) | 451 (+20.8 %) ⚑ | 557 (+8 %) | 693 (+13.7 %) | 997 (+23 %) ⚑ |
| kaethe-falsch | 2 | 125 (-13.5 %) | 249 (-3.7 %) | 403 (+8 %) | 544 (+5.5 %) | 663 (+8.8 %) | 903 (+11.5 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) · eff. 0 | 46 (-20 %) ⚑ · eff. 9 | 55 (-42.4 %) ⚑ · eff. 12 | 97 (-26.7 %) ⚑ · eff. 15 | 129 (-15.5 %) ⚑ · eff. 16 | 172 (-22.5 %) ⚑ · eff. 22 |
| dieter-brew | 1 | 0 (-100 %) · eff. 0 | 65 (+12.1 %) · eff. 9 | 115 (+20 %) ⚑ · eff. 8 | 152 (+15.5 %) ⚑ · eff. 6 | 150 (-1.6 %) · eff. 5 | 204 (-8.1 %) · eff. 5 |
| dieter-brew | 2 | 0 (-100 %) · eff. 0 | 54 (-6.9 %) · eff. 9 | 61 (-36.7 %) ⚑ · eff. 6 | 80 (-39.5 %) ⚑ · eff. 7 | 104 (-31.9 %) ⚑ · eff. 8 | 137 (-38 %) ⚑ · eff. 11 |
| baerbel-care | 0 | 0 (-100 %) · eff. 0 | 76 (+30.3 %) ⚑ · eff. 13 | 72 (-25.2 %) ⚑ · eff. 17 | 96 (-27.1 %) ⚑ · eff. 22 | 113 (-26 %) ⚑ · eff. 23 | 248 (+12 %) · eff. 1 |
| baerbel-care | 1 | 0 (-100 %) · eff. 0 | 55 (-5.5 %) · eff. 13 | 96 (0 %) · eff. 6 | 159 (+20.5 %) ⚑ · eff. 9 | 185 (+21.2 %) ⚑ · eff. 8 | 359 (+62.2 %) ⚑ · eff. 1 |
| baerbel-care | 2 | 0 (-100 %) · eff. 0 | 63 (+9 %) · eff. 0 | 94 (-2.5 %) · eff. 0 | 175 (+32.7 %) ⚑ · eff. 1 | 236 (+55.2 %) ⚑ · eff. 1 | 317 (+43.1 %) ⚑ · eff. 1 |
| schorsch-chef | 0 | 0 (-100 %) · eff. 0 | 63 (+9 %) · eff. 7 | 117 (+21.7 %) ⚑ · eff. 6 | 137 (+3.9 %) · eff. 9 | 162 (+6.1 %) · eff. 10 | 222 (0 %) · eff. 7 |
| schorsch-chef | 1 | 0 (-100 %) · eff. 0 | 48 (-16.7 %) ⚑ · eff. 10 | 100 (+4.3 %) · eff. 9 | 123 (-6.9 %) · eff. 16 | 153 (+0.7 %) · eff. 23 | 222 (+0.1 %) · eff. 5 |
| schorsch-chef | 2 | 0 (-100 %) · eff. 0 | 58 (0 %) · eff. 13 | 98 (+2.3 %) · eff. 17 | 129 (-2.1 %) · eff. 21 | 143 (-6.2 %) · eff. 15 | 194 (-12.6 %) · eff. 5 |
| kaethe-herz | 0 | 25 (+2430 %) · eff. 1 | 55 (-5 %) · eff. 3 | 107 (+10.9 %) · eff. 8 | 146 (+10.9 %) · eff. 9 | 170 (+11.6 %) · eff. 9 | 235 (+6 %) · eff. 12 |
| kaethe-herz | 1 | 25 (+2430 %) · eff. 1 | 62 (+6.2 %) · eff. 3 | 85 (-12.2 %) · eff. 0 | 110 (-16.9 %) ⚑ · eff. 0 | 141 (-7.3 %) · eff. 0 | 187 (-15.6 %) ⚑ · eff. 0 |
| kaethe-herz | 2 | 25 (+2430 %) · eff. 1 | 53 (-7.9 %) · eff. 3 | 81 (-15.8 %) ⚑ · eff. 5 | 132 (0 %) · eff. 7 | 152 (0 %) · eff. 4 | 203 (-8.5 %) · eff. 7 |

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

### kevin-fuse · Pfad 0 · Stufe 10 ·272 Schaden/s · Ausrüstung +72.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.2 Schaden/s · Taktgefühl -1.4 Schaden/s · Bastelgrips -0.4 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 34 % · Kurzschluss 23.4 % · Kurzschluss 13.4 % · Pfandgeschoss 12.5 % · Autoangriff · Pfand im Takt 6.9 % · Lunte 6 % · Lunte 3.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Ausgebrannt +3.9 % · Rücklaufdruck 0 % · Heißer Kleber -3.7 % · Brennender Nachlauf gebunden · Zündfunke gebunden · Dicke Lunte gebunden · Pfandsammler gebunden · Lunte springt gebunden · Sparflamme gebunden

### kevin-fuse · Pfad 1 · Stufe 10 ·291 Schaden/s · Ausrüstung +129.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.5 Schaden/s · Taktgefühl 1.2 Schaden/s · Bastelgrips 0.4 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 50.3 % · Kurzschluss 17.3 % · Kurzschluss 12.6 % · Pfandgeschoss 9.6 % · Autoangriff · Pfand im Takt 7 % · Lunte 2.6 % · Lunte 0.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Serienschaltung +0.3 % · Überbrückt +0.2 % · Doppelte Sicherung 0 % · Blanker Draht gebunden · Kupferkern gebunden · Rückstrom gebunden · Schnellverkabelt gebunden · Erdschluss gebunden · Kurzschluss gebunden

### kevin-fuse · Pfad 2 · Stufe 10 ·338 Schaden/s · Ausrüstung +123.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.5 Schaden/s · 0.1 verhindert/s · Taktgefühl 0.6 Schaden/s · 0.1 verhindert/s · Bastelgrips -0.7 Schaden/s · 0.2 verhindert/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Kurzschluss 28.8 % · Kurzschluss 28.6 % · Restmüll mit Zündschnur 19.5 % · Lunte 7.9 % · Lunte 6.4 % · Autoangriff · Pfand im Takt 5.1 % · Kettenzündung 3.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nachzünder +3.2 % · Lange Zündschnur +3.2 % · Glühender Draht 0 % · Zündliste gebunden · Starkstrom-Bon gebunden · Kleber für alle gebunden · Funkenüberschlag gebunden · Kettenzündung gebunden · Zündleitung gebunden

### kevin-fuse · Pfad 0 · Stufe 20 ·446 Schaden/s · Ausrüstung +164.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2 Schaden/s · Taktgefühl 0.4 Schaden/s · Bastelgrips -0.5 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 33.6 % · Kurzschluss 22.1 % · Kurzschluss 18.2 % · Pfandgeschoss 12.1 % · Autoangriff · Pfand im Takt 7.1 % · Lunte 4.1 % · Lunte 2.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Ausgebrannt +5.9 % · Alles auf die Lunte +3.5 % · Zündfunke +2.4 % · Zündliste +1.8 % · Kupferkern +0.8 % · Sparflamme +0.4 % · Dicke Lunte +0.1 % · Pfandsammler 0 % · Lunte springt 0 % · Rücklaufdruck 0 % · Blanker Draht 0 % · Brennender Nachlauf gebunden · Heißer Kleber gebunden

### kevin-fuse · Pfad 1 · Stufe 20 ·513 Schaden/s · Ausrüstung +184 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.7 Schaden/s · Taktgefühl 2.3 Schaden/s · Bastelgrips 0 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll mit Zündschnur 59 % · Kurzschluss 23.8 % · Kurzschluss 6.3 % · Autoangriff · Pfand im Takt 4.8 % · Pfandgeschoss 4.3 % · Lunte 1.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kurzschluss +16.9 % · Brennender Nachlauf +7.3 % · Nullwiderstand +4.9 % · Rückstrom +4.1 % · Überbrückt +2.5 % · Kupferkern +2.2 % · Zündliste +0.6 % · Schnellverkabelt 0 % · Erdschluss 0 % · Serienschaltung 0 % · Zündfunke -1.2 % · Blanker Draht gebunden · Doppelte Sicherung gebunden

### kevin-fuse · Pfad 2 · Stufe 20 ·530 Schaden/s · Ausrüstung +213.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.8 Schaden/s · -0.1 verhindert/s · Taktgefühl 0.8 Schaden/s · Bastelgrips -0.2 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Kurzschluss 33.5 % · Kurzschluss 31.8 % · Restmüll mit Zündschnur 21.2 % · Lunte 6.1 % · Lunte 3.8 % · Autoangriff · Pfand im Takt 3.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Brennender Nachlauf +16.8 % · Kleber für alle +11.4 % · Funkenüberschlag +8.8 % · Nachzünder +5.3 % · Kettenreaktion +3.7 % · Zündfunke +3.7 % · Starkstrom-Bon +0.6 % · Zündleitung 0 % · Lange Zündschnur 0 % · Blanker Draht 0 % · Kettenzündung -2.8 % · Zündliste gebunden · Glühender Draht gebunden

### kevin-iron · Pfad 0 · Stufe 10 ·264 Schaden/s · Ausrüstung +99.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.8 Schaden/s · -0.1 Heilung/s · Taktgefühl 0.4 Schaden/s · Bastelgrips 0.2 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Überlast 46.4 % · Robbi 19.1 % · Autoangriff · Pfand im Takt 11.1 % · Pfandgeschoss 11 % · Überlast 7.8 % · Kleb die Scheiße fest 4.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Werkstattpause 0 % · Ersatzteile 0 % · Starker Magnet 0 % · Längere Batterie gebunden · Robbi räumt auf gebunden · Scharfe Dose gebunden · Robbi hält gebunden · Magnetpanzer gebunden · Ersatzdose gebunden

### kevin-iron · Pfad 1 · Stufe 10 ·228 Schaden/s · Ausrüstung +119.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.6 Schaden/s · Taktgefühl 1.9 Schaden/s · Bastelgrips 0.3 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Überlast 42.2 % · Pfandgeschoss 23.8 % · Autoangriff · Pfand im Takt 13.3 % · Überlast 8.1 % · Robbi 7 % · Kleb die Scheiße fest 5.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Parierschlag 0 % · Dosenblech 0 % · Nietenpflaster 0 % · Blechkante gebunden · Nietenpanzer gebunden · Druckventil gebunden · Nietfest gebunden · Vernietet gebunden · Notniete gebunden

### kevin-iron · Pfad 2 · Stufe 10 ·332 Schaden/s · Ausrüstung +83.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.8 Schaden/s · Taktgefühl 1.8 Schaden/s · Bastelgrips 0.2 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Überlast 51.4 % · Pfandgeschoss 13.9 % · Robbi 10.5 % · Überlast 10.2 % · Autoangriff · Pfand im Takt 10 % · Kleb die Scheiße fest 4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Überdruck +4.7 % · Überlast im Laufen 0 % · Restwärme -0.2 % · Frisch verschraubt gebunden · Volle Ladung gebunden · Blitzableiter gebunden · Wiederaufbau gebunden · Druckschlag gebunden · Dampfdruck gebunden

### kevin-iron · Pfad 0 · Stufe 20 ·359 Schaden/s · Ausrüstung +193.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms -0.1 Schaden/s · Taktgefühl 0.2 Schaden/s · Bastelgrips 0 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Überlast 39.8 % · Robbi 18.6 % · Pfandgeschoss 14 % · Überlast 12.6 % · Autoangriff · Pfand im Takt 11.2 % · Kleb die Scheiße fest 3.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Ersatzdose +7.3 % · Robbi räumt auf +5.2 % · Nietenpanzer +3.8 % · Scharfe Dose +1.8 % · Robbi hält 0 % · Werkstattpause 0 % · Starker Magnet 0 % · Letzter Befehl 0 % · Frisch verschraubt 0 % · Blechkante 0 % · Magnetpanzer -6.2 % · Längere Batterie gebunden · Ersatzteile gebunden

### kevin-iron · Pfad 1 · Stufe 20 ·326 Schaden/s · Ausrüstung +181.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.7 Schaden/s · Taktgefühl -0.6 Schaden/s · Bastelgrips -0.2 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Pfandgeschoss 34.6 % · Überlast 32.5 % · Autoangriff · Pfand im Takt 14.6 % · Überlast 8.5 % · Kleb die Scheiße fest 4.9 % · Robbi 4.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nietenpanzer +3.6 % · Robbi räumt auf +0.9 % · Druckventil 0 % · Nietfest 0 % · Vernietet 0 % · Notniete 0 % · Parierschlag 0 % · Nietenpflaster 0 % · Nicht TÜV-geprüft 0 % · Frisch verschraubt 0 % · Längere Batterie 0 % · Blechkante gebunden · Dosenblech gebunden

### kevin-iron · Pfad 2 · Stufe 20 ·492 Schaden/s · Ausrüstung +118.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.4 Schaden/s · Taktgefühl 0.6 Schaden/s · Bastelgrips 0.2 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Überlast 61.4 % · Pfandgeschoss 13.6 % · Autoangriff · Pfand im Takt 8.5 % · Robbi 7.4 % · Überlast 6.2 % · Kleb die Scheiße fest 3 %

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

### schorsch-chef · Pfad 0 · Stufe 10 ·210 Schaden/s · Ausrüstung +199.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.4 Schaden/s · Taktgefühl 0.3 Schaden/s · 0.2 Heilung/s · Bastelgrips 0.2 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Grillzange 27.6 % · Autoangriff · Zangenklapper 23.6 % · Servieren 21.4 % · Dampf 21.3 % · Glutbrocken 4.8 % · Glutbrand 1.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Wurstkette +1.8 % · Metzgerqualität 0 % · Auf Vorrat gegrillt 0 % · Probierhäppchen gebunden · Zweite Wurst gebunden · Satt ist satt gebunden · Notwurst gebunden · Hausmacher gebunden · Goldbraun gebunden

### schorsch-chef · Pfad 1 · Stufe 10 ·188 Schaden/s · Ausrüstung +199.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.2 Schaden/s · Taktgefühl 0.3 Schaden/s · 0.3 Heilung/s · Bastelgrips -0.8 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Popcorn 33.6 % · Grillzange 21.5 % · Autoangriff · Zangenklapper 20.3 % · Servieren 14.1 % · Dampf 10.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Belegtes Brötchen 0 % · Popcorn für alle 0 % · Scharfer Senf -5.5 % · Grillkäse dazu gebunden · Schnell gewendet gebunden · Heißer Rost gebunden · Maiskolben dazu gebunden · Senf drauf! gebunden · Wenden! gebunden

### schorsch-chef · Pfad 2 · Stufe 10 ·233 Schaden/s · Ausrüstung +189.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.6 Schaden/s · -0.1 Heilung/s · Taktgefühl 2 Schaden/s · 0.3 Heilung/s · Bastelgrips 1 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Servieren 35.4 % · Grillzange 29.3 % · Autoangriff · Zangenklapper 18.7 % · Dampf 10.8 % · Glutbrocken 5.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Dicke Luft +3.7 % · Buffet nachlegen +0.8 % · Frische Luft -2.9 % · Löschbier gebunden · Dampfgaren gebunden · Stammplatz gebunden · Feuerfeste Schürze gebunden · Ruhige Glut gebunden · Tischdienst gebunden

### schorsch-chef · Pfad 0 · Stufe 20 ·281 Schaden/s · Ausrüstung +255.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.7 Schaden/s · Taktgefühl -0.7 Schaden/s · 0.3 Heilung/s · Bastelgrips 0.8 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Grillzange 33.4 % · Autoangriff · Zangenklapper 24 % · Servieren 19.1 % · Dampf 18 % · Glutbrocken 4.2 % · Glutbrand 1.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Satt ist satt 0 % · Notwurst 0 % · Hausmacher 0 % · Goldbraun 0 % · Metzgerqualität 0 % · Auf Vorrat gegrillt 0 % · Meisterwurst 0 % · Löschbier 0 % · Schnell gewendet 0 % · Zweite Wurst -8.2 % · Grillkäse dazu -12.2 % · Probierhäppchen gebunden · Wurstkette gebunden

### schorsch-chef · Pfad 1 · Stufe 20 ·303 Schaden/s · Ausrüstung +280.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.8 Schaden/s · Taktgefühl 1.2 Schaden/s · 0.1 Heilung/s · Bastelgrips 1.3 Schaden/s · -0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Grillzange 26.1 % · Popcorn 23.3 % · Autoangriff · Zangenklapper 22.1 % · Dampf 15.8 % · Servieren 8.9 % · Glutbrocken 3.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Maiskolben dazu +18.3 % · Probierhäppchen +12.7 % · Belegtes Brötchen 0 % · Löschbier 0 % · Volle Platte -0.4 % · Heißer Rost -0.8 % · Schnell gewendet -1.1 % · Wenden! -3.2 % · Scharfer Senf -3.6 % · Zweite Wurst -6.2 % · Senf drauf! -7 % · Grillkäse dazu gebunden · Popcorn für alle gebunden

### schorsch-chef · Pfad 2 · Stufe 20 ·342 Schaden/s · Ausrüstung +310.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.4 Schaden/s · 0.2 Heilung/s · Taktgefühl 0 Schaden/s · Bastelgrips 0.3 Schaden/s · 0.5 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Grillzange 29.7 % · Dampf 24.5 % · Servieren 24 % · Autoangriff · Zangenklapper 18.2 % · Glutbrocken 3.4 % · Glutbrand 0.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Ruhige Glut +10.6 % · Probierhäppchen +8.3 % · Dampfgaren +3.8 % · Stammplatz +3.3 % · Buffet nachlegen +1.5 % · Grillkäse dazu +1.3 % · Zweite Wurst +1.1 % · Feuerfeste Schürze 0 % · Tischdienst 0 % · Frische Luft -0.1 % · Lokalrunde -0.7 % · Löschbier gebunden · Dicke Luft gebunden

### schorsch-flamme · Pfad 0 · Stufe 10 ·331 Schaden/s · Ausrüstung +149.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.8 Schaden/s · Taktgefühl 1.1 Schaden/s · Bastelgrips -1.4 Schaden/s · -0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Schwenkgrill 23.2 % · Servieren 16.7 % · Popcorn 16.5 % · Grillzange 15.8 % · Stichflamme 8.1 % · Autoangriff · Zangenklapper 7 % · Flambiert 4.9 % · Dampf 4.7 % · Glutbrocken 2.3 % · Glutbrand 0.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Blasebalg-Profi +2.4 % · Feuerring 0 % · Heißer Draht -4.6 % · Gut angefacht gebunden · Kurze Zündschnur gebunden · Zunder gebunden · Hitzewelle gebunden · Nach dem Knall gebunden · Nachglühen gebunden

### schorsch-flamme · Pfad 1 · Stufe 10 ·314 Schaden/s · Ausrüstung +182 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.9 Schaden/s · 0.1 Heilung/s · Taktgefühl 1.5 Schaden/s · 0.1 Heilung/s · Bastelgrips 1.9 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Servieren 28.3 % · Schwenkgrill 18.5 % · Grillzange 17.7 % · Popcorn 16.5 % · Autoangriff · Zangenklapper 9.1 % · Stichflamme 7.4 % · Dampf 2.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Knusprig +1 % · Grillteller mit Braten +0.9 % · Zweiter Gang -4.5 % · Anbraten gebunden · Fleischermesser gebunden · Auf den Punkt gebunden · Abschrecken gebunden · Der Nächste, bitte gebunden · Fleischklopfer gebunden

### schorsch-flamme · Pfad 2 · Stufe 10 ·321 Schaden/s · Ausrüstung +150.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.8 Schaden/s · Taktgefühl 3.8 Schaden/s · 0.2 Heilung/s · Bastelgrips 0.9 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Popcorn 20.7 % · Schwenkgrill 20.2 % · Servieren 16.4 % · Spiritus-Schwall 12.4 % · Grillzange 11.6 % · Stichflamme 7.9 % · Autoangriff · Zangenklapper 7.2 % · Dampf 1.9 % · Glutbrocken 1.2 % · Glutbrand 0.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nachgießen +2.8 % · Zangentakt 0 % · Doppelpack 0 % · Kohlenschaufel gebunden · Zangenklapper im Takt gebunden · Brandbeschleuniger gebunden · Heiße Kohlen gebunden · Spiritus-Schwall gebunden · Funkensprung gebunden

### schorsch-flamme · Pfad 0 · Stufe 20 ·567 Schaden/s · Ausrüstung +240.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 3.5 Schaden/s · 0.1 Heilung/s · Taktgefühl 0.7 Schaden/s · -0.1 Heilung/s · Bastelgrips -0.1 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Schwenkgrill 22.9 % · Servieren 18.2 % · Stichflamme 15.6 % · Popcorn 12.7 % · Grillzange 12.6 % · Autoangriff · Zangenklapper 5.9 % · Dampf 5.3 % · Flambiert 4.7 % · Glutbrocken 1.9 % · Glutbrand 0.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Feuerteufel +9 % · Nach dem Knall +6.8 % · Hitzewelle +4.8 % · Zunder +3.2 % · Nachglühen +2.6 % · Blasebalg-Profi +2.3 % · Kurze Zündschnur +1.8 % · Fleischermesser +1.1 % · Anbraten 0 % · Kohlenschaufel 0 % · Heißer Draht -3 % · Gut angefacht gebunden · Feuerring gebunden

### schorsch-flamme · Pfad 1 · Stufe 20 ·537 Schaden/s · Ausrüstung +274.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.1 Schaden/s · 0.1 Heilung/s · Taktgefühl 1 Schaden/s · 0.1 Heilung/s · Bastelgrips 0.3 Schaden/s · -0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Servieren 39.4 % · Popcorn 19.8 % · Schwenkgrill 18.3 % · Grillzange 9.6 % · Autoangriff · Zangenklapper 6.7 % · Dampf 3.5 % · Glutbrocken 2.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Spanferkel-Wurf +11.9 % · Gut angefacht +5.6 % · Fleischklopfer +5.4 % · Abschrecken +3.8 % · Fleischermesser +3.7 % · Grillteller mit Braten +2.8 % · Auf den Punkt 0 % · Kohlenschaufel 0 % · Kurze Zündschnur 0 % · Zweiter Gang -2.2 % · Der Nächste, bitte -2.9 % · Anbraten gebunden · Knusprig gebunden

### schorsch-flamme · Pfad 2 · Stufe 20 ·528 Schaden/s · Ausrüstung +203.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 3.4 Schaden/s · 0.2 Heilung/s · Taktgefühl -0.2 Schaden/s · -0.1 Heilung/s · Bastelgrips 0.6 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Servieren 25.5 % · Schwenkgrill 19.2 % · Popcorn 18.4 % · Spiritus-Schwall 9.8 % · Grillzange 8.5 % · Autoangriff · Zangenklapper 6.5 % · Glutbrocken 4.1 % · Dampf 3.5 % · Stichflamme 2.5 % · Flambiert 1.7 % · Glutbrand 0.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Gut angefacht +11.2 % · Nachgießen +7.1 % · Zangenklapper im Takt +4.6 % · Spiritus-Schwall +2.8 % · Flambé mit Schuss +1.8 % · Anbraten +1.5 % · Brandbeschleuniger +0.1 % · Heiße Kohlen 0 % · Zangentakt 0 % · Kurze Zündschnur 0 % · Funkensprung -3.4 % · Kohlenschaufel gebunden · Doppelpack gebunden

### schorsch-rauch · Pfad 0 · Stufe 10 ·193 Schaden/s · Ausrüstung +190.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.9 Schaden/s · Taktgefühl 1 Schaden/s · -0.3 Heilung/s · Bastelgrips 0.8 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 34.9 % · Grillzange 18.7 % · Autoangriff · Zangenklapper 17.3 % · Servieren 13.1 % · Dampf 11.2 % · Glutbrocken 4.4 % · Glutbrand 0.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nachräuchern -0.5 % · Nasses Buchenholz -3.7 % · Nebelmaschine -7.3 % · Kalt anräuchern gebunden · Feuerlöscher gebunden · Dicker Qualm gebunden · Kalte Schulter gebunden · Deckel zu! gebunden · Räucherwurst gebunden

### schorsch-rauch · Pfad 1 · Stufe 10 ·213 Schaden/s · Ausrüstung +210.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.4 Schaden/s · Taktgefühl 1.2 Schaden/s · -0.1 Heilung/s · Bastelgrips 0.2 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 36.2 % · Grillzange 22.6 % · Autoangriff · Zangenklapper 14.5 % · Servieren 13.9 % · Glutbrocken 7.5 % · Dampf 3.6 % · Glutbrand 1.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Deckelkonter 0 % · Zurück an den Absender 0 % · Notkäse 0 % · Garen mit Deckel gebunden · Deckelpolster gebunden · Doppelter Deckel gebunden · Käsekruste gebunden · Halloumi-Happen gebunden · Längerer Deckel gebunden

### schorsch-rauch · Pfad 2 · Stufe 10 ·219 Schaden/s · Ausrüstung +191.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2 Schaden/s · Taktgefühl 1.6 Schaden/s · Bastelgrips 1.4 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 34.7 % · Grillzange 21.2 % · Servieren 18.4 % · Autoangriff · Zangenklapper 13.7 % · Glutbrocken 6.7 % · Dampf 2.6 % · Glutbrand 2.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Brandmauer 0 % · Aufgeheizt 0 % · Glut unterm Deckel 0 % · Zwicken heizt gebunden · Nestwärme gebunden · Schwelbrand gebunden · Heißer Stein gebunden · Heiße Asche gebunden · Glutwächter gebunden

### schorsch-rauch · Pfad 0 · Stufe 20 ·281 Schaden/s · Ausrüstung +251.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.8 Schaden/s · Taktgefühl -0.1 Schaden/s · -0.2 Heilung/s · Bastelgrips 1.4 Schaden/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 37.1 % · Grillzange 29.7 % · Autoangriff · Zangenklapper 17.7 % · Servieren 15.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Dicker Qualm +0.3 % · Feuerlöscher 0 % · Kalte Schulter 0 % · Garen mit Deckel 0 % · Zwicken heizt 0 % · Deckelpolster 0 % · Nebelmaschine -3.5 % · Nachräuchern -3.6 % · Deckel zu! -4.4 % · Räucherkammer -8.3 % · Räucherwurst -9.8 % · Kalt anräuchern gebunden · Nasses Buchenholz gebunden

### schorsch-rauch · Pfad 1 · Stufe 20 ·308 Schaden/s · Ausrüstung +233 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.1 Schaden/s · Taktgefühl 1.8 Schaden/s · 0.3 Heilung/s · Bastelgrips -0.7 Schaden/s · 1 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 33.6 % · Grillzange 25.5 % · Autoangriff · Zangenklapper 16.5 % · Dampf 9.5 % · Glutbrocken 7.4 % · Servieren 5 % · Glutbrand 2.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Deckelpolster 0 % · Doppelter Deckel 0 % · Käsekruste 0 % · Halloumi-Happen 0 % · Längerer Deckel 0 % · Deckelkonter 0 % · Notkäse 0 % · Halloumi-Panzer 0 % · Kalt anräuchern 0 % · Zwicken heizt 0 % · Feuerlöscher 0 % · Garen mit Deckel gebunden · Zurück an den Absender gebunden

### schorsch-rauch · Pfad 2 · Stufe 20 ·358 Schaden/s · Ausrüstung +244.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.6 Schaden/s · -0.2 Heilung/s · Taktgefühl 0.2 Schaden/s · -0.1 Heilung/s · Bastelgrips 0.6 Schaden/s · -0.2 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Rauch 32.5 % · Servieren 15.8 % · Autoangriff · Zangenklapper 15.8 % · Glutbrocken 12.8 % · Grillzange 10.3 % · Dampf 6.8 % · Glutbrand 6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Glutherz +12.5 % · Schwelbrand +0.7 % · Nestwärme 0 % · Heißer Stein 0 % · Heiße Asche 0 % · Glutwächter 0 % · Brandmauer 0 % · Glut unterm Deckel 0 % · Kalt anräuchern 0 % · Garen mit Deckel 0 % · Feuerlöscher 0 % · Zwicken heizt gebunden · Aufgeheizt gebunden

### kaethe-grand · Pfad 0 · Stufe 10 ·337 Schaden/s · Ausrüstung +128.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms -0.4 Schaden/s · Taktgefühl -2.5 Schaden/s · 0.4 Heilung/s · Bastelgrips 0 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Karo 50.2 % · Kreuz 31 % · Autoangriff · Kartenschnipsen 10.6 % · Abrechnen 8.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Spitzen +2.4 % · Auf die Hand 0 % · Trumpf nachziehen 0 % · Wenzel gebunden · Kreuz-Bube gebunden · Bube zieht nach gebunden · Der letzte Stich gebunden · Mit Vieren gebunden · Der Alte gebunden

### kaethe-grand · Pfad 1 · Stufe 10 ·276 Schaden/s · Ausrüstung +152 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms -0.7 Schaden/s · 0.1 Heilung/s · Taktgefühl -0.1 Schaden/s · -0.3 Heilung/s · Bastelgrips 0 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Karo 39.1 % · Kreuz 33.2 % · Abrechnen 15.5 % · Autoangriff · Kartenschnipsen 12.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Volle Augen +5 % · Buchführung +0.1 % · Strich auf dem Block -1 % · Mitzählen gebunden · Pfennigfuchserin gebunden · Knapp gewonnen gebunden · Gestochen scharf gebunden · Reizen gebunden · Skat drücken gebunden

### kaethe-grand · Pfad 2 · Stufe 10 ·325 Schaden/s · Ausrüstung +141.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2 Schaden/s · -0.2 Heilung/s · Taktgefühl 0.8 Schaden/s · 0.3 Heilung/s · Bastelgrips 0 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Karo 51.1 % · Kreuz 29.1 % · Autoangriff · Kartenschnipsen 11.2 % · Abrechnen 8.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Unter der Hand +6 % · Durchmarsch 0 % · Nullspiel 0 % · Kleinvieh gebunden · Kleine Fische gebunden · Schnipp, schnapp gebunden · Ouvert gebunden · Blatt aufgefächert gebunden · Bis zum Anschlag gebunden

### kaethe-grand · Pfad 0 · Stufe 20 ·561 Schaden/s · Ausrüstung +182.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.7 Schaden/s · -0.3 Heilung/s · Taktgefühl 0.6 Schaden/s · -0.6 Heilung/s · Bastelgrips 0 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Karo 53.7 % · Kreuz 28.9 % · Autoangriff · Kartenschnipsen 11.5 % · Abrechnen 5.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kleinvieh +7.5 % · Bube zieht nach +3.9 % · Spitzen +2.4 % · Mitzählen +2.3 % · Kreuz-Bube +1.3 % · Der letzte Stich +1.1 % · Mit Vieren +1 % · Pfennigfuchserin +0.5 % · Grand Hand +0.1 % · Der Alte 0 % · Auf die Hand 0 % · Wenzel gebunden · Trumpf nachziehen gebunden

### kaethe-grand · Pfad 1 · Stufe 20 ·524 Schaden/s · Ausrüstung +190.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.2 Schaden/s · 0.1 Heilung/s · Taktgefühl 3.1 Schaden/s · Bastelgrips 0 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Karo 32.5 % · Abrechnen 28.8 % · Kreuz 26.6 % · Autoangriff · Kartenschnipsen 12.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kleinvieh +14.8 % · Revanche +13.1 % · Volle Augen +12.1 % · Kreuz-Bube +10.3 % · Pfennigfuchserin +5.6 % · Wenzel +2.9 % · Skat drücken +2.5 % · Reizen +2.3 % · Knapp gewonnen +0.3 % · Gestochen scharf 0 % · Strich auf dem Block -7.6 % · Mitzählen gebunden · Buchführung gebunden

### kaethe-grand · Pfad 2 · Stufe 20 ·571 Schaden/s · Ausrüstung +177.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 3 Schaden/s · -0.1 Heilung/s · Taktgefühl 3.2 Schaden/s · -1.5 Heilung/s · 0.1 verhindert/s · Bastelgrips 0 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Karo 45.9 % · Kreuz 36.7 % · Abrechnen 9.1 % · Autoangriff · Kartenschnipsen 8.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Null ouvert Hand +5.4 % · Mitzählen +4.6 % · Blatt aufgefächert +3.7 % · Kreuz-Bube +3.6 % · Schnipp, schnapp +3 % · Wenzel +1.3 % · Ouvert 0 % · Bis zum Anschlag 0 % · Nullspiel 0 % · Unter der Hand -0.9 % · Kleine Fische -1.7 % · Kleinvieh gebunden · Durchmarsch gebunden

### kaethe-herz · Pfad 0 · Stufe 10 ·171 Schaden/s · Ausrüstung +126.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.5 Schaden/s · -0.5 Heilung/s · Taktgefühl -0.3 Schaden/s · 0.8 Heilung/s · Bastelgrips 0 Schaden/s · 0.5 Heilung/s · Dicke Haut -0.6 Schaden/s · 0.2 Heilung/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Karo 46.3 % · Kreuz 24.4 % · Abrechnen 16.1 % · Autoangriff · Kartenschnipsen 13.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Noch eins, dann neu +1.8 % · Herzensangelegenheit +1 % · Warmer Eierlikör 0 % · Das Herz am rechten Fleck gebunden · Rote Dame gebunden · Nachschenken gebunden · Herzklopfen gebunden · Handlesen gebunden · Lebenslinie gebunden

### kaethe-herz · Pfad 1 · Stufe 10 ·201 Schaden/s · Ausrüstung +131.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.2 Schaden/s · 0.1 Heilung/s · Taktgefühl 0.5 Schaden/s · 0.2 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut -0.1 Schaden/s

**Kniffe (Anteil am Schaden):** Karo 44.9 % · Kreuz 31.7 % · Autoangriff · Kartenschnipsen 14.6 % · Abrechnen 6.1 % · Pik 2.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nichts verschenken +2.1 % · Masche für Masche 0 % · Doppelt gemauert 0 % · Pik auf die Brust gebunden · Letzte Masche gebunden · Pik-Ass gebunden · Mauern gebunden · Pik mit Stachel gebunden · Pik-Kette gebunden

### kaethe-herz · Pfad 2 · Stufe 10 ·196 Schaden/s · Ausrüstung +138.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.8 Schaden/s · Taktgefühl 0.5 Schaden/s · -0.3 Heilung/s · Bastelgrips 0.2 Schaden/s · -0.1 Heilung/s · Dicke Haut 0.2 Schaden/s · -0.5 Heilung/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Karo 50.6 % · Kreuz 30.7 % · Autoangriff · Kartenschnipsen 12 % · Abrechnen 6.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Legekreis im Gehen 0 % · Zukunft gesehen 0 % · Kartenlegen -0.2 % · Sterne lesen gebunden · Farbe halten gebunden · Wahrsagekugel gebunden · Blick über die Schulter gebunden · Hab ich kommen sehen gebunden · Kaffeefahrt gebunden

### kaethe-herz · Pfad 0 · Stufe 20 ·263 Schaden/s · Ausrüstung +191.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.6 Schaden/s · -0.1 Heilung/s · Taktgefühl 0.1 Schaden/s · 0.1 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut -0.2 Schaden/s · -0.3 Heilung/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Karo 42.2 % · Kreuz 26.7 % · Abrechnen 17.6 % · Autoangriff · Kartenschnipsen 13.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Pik auf die Brust +6.3 % · Rote Rechnung +6 % · Nachschenken +1.1 % · Lebenslinie +0.4 % · Sterne lesen +0.4 % · Rote Dame 0 % · Herzklopfen 0 % · Warmer Eierlikör 0 % · Letzte Masche 0 % · Noch eins, dann neu -1 % · Handlesen -13.7 % · Das Herz am rechten Fleck gebunden · Herzensangelegenheit gebunden

### kaethe-herz · Pfad 1 · Stufe 20 ·321 Schaden/s · Ausrüstung +193 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.3 Schaden/s · 0.3 Heilung/s · Taktgefühl -0.6 Schaden/s · 0.8 Heilung/s · Bastelgrips 0 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Karo 40.8 % · Kreuz 33.4 % · Abrechnen 14.9 % · Autoangriff · Kartenschnipsen 9.2 % · Pik 1.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Pik mit Stachel +2.5 % · Sterne lesen +0.3 % · Letzte Masche 0 % · Pik-Ass 0 % · Mauern 0 % · Pik-Kette 0 % · Masche für Masche 0 % · Doppelt gemauert 0 % · Schutzbrief 0 % · Das Herz am rechten Fleck 0 % · Rote Dame 0 % · Pik auf die Brust gebunden · Nichts verschenken gebunden

### kaethe-herz · Pfad 2 · Stufe 20 ·320 Schaden/s · Ausrüstung +204.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 3.5 Schaden/s · -0.2 Heilung/s · 0.2 verhindert/s · Taktgefühl 1.8 Schaden/s · -0.4 Heilung/s · 0.1 verhindert/s · Bastelgrips 0 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Karo 41.9 % · Kreuz 37.8 % · Abrechnen 11.2 % · Autoangriff · Kartenschnipsen 9.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Die Karten lügen nie +8.6 % · Pik auf die Brust +1 % · Kaffeefahrt +0.7 % · Wahrsagekugel +0.2 % · Farbe halten 0 % · Blick über die Schulter 0 % · Hab ich kommen sehen 0 % · Legekreis im Gehen 0 % · Das Herz am rechten Fleck 0 % · Rote Dame 0 % · Kartenlegen -2.3 % · Sterne lesen gebunden · Zukunft gesehen gebunden

### kaethe-falsch · Pfad 0 · Stufe 10 ·276 Schaden/s · Ausrüstung +128.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.2 Schaden/s · 0.2 Heilung/s · Taktgefühl 0.6 Schaden/s · 0.4 Heilung/s · Bastelgrips 0 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Karo 47.1 % · Kreuz 32.5 % · Autoangriff · Kartenschnipsen 11.7 % · Abrechnen 8.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kontra mit Ansage 0 % · Dicke Strickjacke 0 % · Mauer nach dem Stich 0 % · Hab ich doch gesagt gebunden · Kontra zahlt gebunden · Hochgestochen gebunden · Stichfest gebunden · Da guckst du gebunden · Kontra im Takt gebunden

### kaethe-falsch · Pfad 1 · Stufe 10 ·354 Schaden/s · Ausrüstung +128.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.5 Schaden/s · Taktgefühl -0.2 Schaden/s · 0.1 Heilung/s · Bastelgrips 0 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Kreuz 48.1 % · Karo 30.5 % · Abrechnen 11.3 % · Autoangriff · Kartenschnipsen 10.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Flinke Finger +1.8 % · Mischen ist Silber 0 % · Nachgesteckt -0.5 % · Aus dem Ärmel gebunden · Notblatt gebunden · Bubentrick gebunden · Ärmel voll gebunden · Gezinkte Karten gebunden · Falsch gemischt gebunden

### kaethe-falsch · Pfad 2 · Stufe 10 ·328 Schaden/s · Ausrüstung +124.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 3 Schaden/s · Taktgefühl 1.7 Schaden/s · -0.2 Heilung/s · Bastelgrips 0 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Karo 51.8 % · Kreuz 25.5 % · Abrechnen 12.4 % · Autoangriff · Kartenschnipsen 10.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Karo satt 0 % · Bockrunde 0 % · Hier geblieben! 0 % · Re! gebunden · Karo-Zehn gebunden · Kreuz-Dame gebunden · Karo bedient gebunden · Karo-Ass gebunden · Kreuz-Kette gebunden

### kaethe-falsch · Pfad 0 · Stufe 20 ·456 Schaden/s · Ausrüstung +197.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.8 Schaden/s · -0.1 Heilung/s · Taktgefühl -0.7 Schaden/s · 0.1 Heilung/s · Bastelgrips 0 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Karo 49.9 % · Kreuz 30.5 % · Autoangriff · Kartenschnipsen 10.8 % · Abrechnen 8.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kontra gewonnen +13.6 % · Kontra zahlt 0 % · Hochgestochen 0 % · Stichfest 0 % · Da guckst du 0 % · Kontra im Takt 0 % · Kontra mit Ansage 0 % · Mauer nach dem Stich 0 % · Aus dem Ärmel 0 % · Re! 0 % · Notblatt 0 % · Hab ich doch gesagt gebunden · Dicke Strickjacke gebunden

### kaethe-falsch · Pfad 1 · Stufe 20 ·558 Schaden/s · Ausrüstung +198.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.9 Schaden/s · Taktgefühl -2.5 Schaden/s · 0.2 Heilung/s · 0.1 verhindert/s · Bastelgrips 0 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Karo 43.9 % · Kreuz 38.7 % · Abrechnen 8.7 % · Autoangriff · Kartenschnipsen 8.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Gezinkte Karten +9.8 % · Falsch abgerechnet +6.8 % · Ärmel voll +5.8 % · Flinke Finger +3.7 % · Notblatt 0 % · Bubentrick 0 % · Falsch gemischt 0 % · Hab ich doch gesagt 0 % · Re! 0 % · Kontra zahlt 0 % · Nachgesteckt -3.4 % · Aus dem Ärmel gebunden · Mischen ist Silber gebunden

### kaethe-falsch · Pfad 2 · Stufe 20 ·531 Schaden/s · Ausrüstung +177.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.4 Schaden/s · 0.3 Heilung/s · Taktgefühl 1.9 Schaden/s · -0.3 Heilung/s · Bastelgrips 0 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Karo 52.4 % · Kreuz 31.1 % · Autoangriff · Kartenschnipsen 9.2 % · Abrechnen 7.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Karo-Ass +7.2 % · Re und Bock +5.5 % · Kreuz-Kette +4.8 % · Kreuz-Dame +2.1 % · Karo-Zehn 0 % · Karo bedient 0 % · Karo satt 0 % · Hier geblieben! 0 % · Hab ich doch gesagt 0 % · Aus dem Ärmel 0 % · Kontra zahlt 0 % · Re! gebunden · Bockrunde gebunden

