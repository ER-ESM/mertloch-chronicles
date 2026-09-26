# Balance-Sheet

Automatisch erzeugt von `npm run balance:sheet` · 2026-09-26 · 40 s Übungskampf, jede Zelle und jede Zerlegung als Mittel aus Boss (10× Feldleben) und Feldgruppe (drei Gegner mit Umland-Leben); gefallene Gegner ersetzt sofort ein neuer (Kill-Talente zählen), Zufall mit 3 festen Startwerten gemittelt, gemeinsame Prioritäten-Rotation (Heiler heilen zuerst), Puppen treffen jede Sekunde mit 3 % des Grundlebens. Voller Ausrüstungssatz auf Charakterstufe (Werteprofile im Wechsel); „Startausrüstung“ = Flasche, Topfdeckel, Schleuder, Kutte. Talentpfad 0–2 über `pathBuild`, Stufe 1 ohne Spezialisierung.

Jede Rolle misst sich an ihrer Kennzahl: **Schaden** → Schaden/s, **Heilung** → Heilung/s (Ausstoß inkl. Überheilung; dahinter „eff.“ = tatsächlich geheilt, ohne Überheilung – ⚑ und Median bleiben am Ausstoß), **Tank** → Schutz/s (verhinderter Schaden + Deckung). Zelle: Kennzahl (Abweichung vom Median der Rolle auf dieser Stufe × Ausrüstung). ⚑ = mehr als 15 % daneben (ab Stufe 5).

## Überblick

259 von 900 Messungen liegen mehr als 15 % neben dem Median ihrer Rolle.

## Ausrüstung: Startausrüstung

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 59 (-2.3 %) | 101 (-10.9 %) | 107 (-24.9 %) ⚑ | 125 (-22.3 %) ⚑ | 143 (-18.8 %) ⚑ | 181 (-15.5 %) ⚑ |
| dieter-brawl | 1 | 59 (-2.3 %) | 114 (+1 %) | 149 (+4.4 %) | 187 (+16.4 %) ⚑ | 208 (+18.1 %) ⚑ | 246 (+14.6 %) |
| dieter-brawl | 2 | 59 (-2.3 %) | 110 (-2.2 %) | 126 (-12.1 %) | 133 (-16.9 %) ⚑ | 159 (-9.9 %) | 189 (-11.7 %) |
| baerbel-feedback | 0 | 61 (0 %) | 131 (+16.1 %) ⚑ | 145 (+1.6 %) | 148 (-7.6 %) | 158 (-10.7 %) | 165 (-23 %) ⚑ |
| baerbel-feedback | 1 | 61 (0 %) | 146 (+28.9 %) ⚑ | 143 (0 %) | 147 (-8.7 %) | 147 (-16.4 %) ⚑ | 168 (-21.7 %) ⚑ |
| baerbel-feedback | 2 | 61 (0 %) | 153 (+35.3 %) ⚑ | 190 (+33 %) ⚑ | 194 (+21.1 %) ⚑ | 206 (+16.7 %) ⚑ | 222 (+3.5 %) |
| baerbel-stage | 0 | 61 (0 %) | 111 (-2.1 %) | 135 (-5.5 %) | 170 (+6 %) | 181 (+2.5 %) | 220 (+2.4 %) |
| baerbel-stage | 1 | 61 (0 %) | 127 (+12.1 %) | 154 (+7.8 %) | 174 (+8.2 %) | 193 (+9.6 %) | 215 (0 %) |
| baerbel-stage | 2 | 61 (0 %) | 118 (+4.9 %) | 128 (-10.2 %) | 147 (-8.6 %) | 155 (-12.3 %) | 181 (-15.6 %) ⚑ |
| kevin-fuse | 0 | 50 (-16.9 %) | 113 (0 %) | 158 (+10.5 %) | 198 (+23.4 %) ⚑ | 169 (-4.4 %) | 269 (+25.4 %) ⚑ |
| kevin-fuse | 1 | 50 (-16.9 %) | 105 (-6.8 %) | 127 (-10.9 %) | 167 (+4.2 %) | 181 (+2.3 %) | 250 (+16.4 %) ⚑ |
| kevin-fuse | 2 | 50 (-16.9 %) | 147 (+30.5 %) ⚑ | 151 (+5.9 %) | 161 (0 %) | 169 (-4.1 %) | 229 (+6.5 %) |
| kevin-hunt | 0 | 50 (-16.9 %) | 134 (+19 %) ⚑ | 148 (+3.7 %) | 160 (-0.4 %) | 176 (0 %) | 187 (-12.7 %) |
| kevin-hunt | 1 | 50 (-16.9 %) | 120 (+6.1 %) | 136 (-4.8 %) | 154 (-4 %) | 155 (-12.4 %) | 185 (-14 %) |
| kevin-hunt | 2 | 50 (-16.9 %) | 125 (+10.5 %) | 154 (+7.6 %) | 195 (+21.2 %) ⚑ | 207 (+17.6 %) ⚑ | 232 (+8.3 %) |
| schorsch-flamme | 0 | 72 (+18.8 %) | 98 (-13.4 %) | 133 (-7 %) | 149 (-7.3 %) | 167 (-5.6 %) | 187 (-13 %) |
| schorsch-flamme | 1 | 72 (+18.8 %) | 97 (-14.2 %) | 111 (-22.1 %) ⚑ | 137 (-15 %) | 144 (-18.6 %) ⚑ | 187 (-12.9 %) |
| schorsch-flamme | 2 | 72 (+18.8 %) | 101 (-10.7 %) | 128 (-10.2 %) | 150 (-6.4 %) | 174 (-1.5 %) | 202 (-6.1 %) |
| kaethe-grand | 0 | 61 (+0.7 %) | 120 (+6.6 %) | 148 (+3.6 %) | 180 (+11.9 %) | 199 (+12.5 %) | 234 (+8.8 %) |
| kaethe-grand | 1 | 61 (+0.7 %) | 97 (-13.7 %) | 110 (-23.3 %) ⚑ | 146 (-9.3 %) | 180 (+2.3 %) | 236 (+10 %) |
| kaethe-grand | 2 | 61 (+0.7 %) | 105 (-6.9 %) | 135 (-5.7 %) | 163 (+1.7 %) | 202 (+14.6 %) | 270 (+25.8 %) ⚑ |
| kaethe-falsch | 0 | 61 (+0.7 %) | 99 (-12.6 %) | 120 (-15.6 %) ⚑ | 142 (-11.5 %) | 153 (-13.2 %) | 186 (-13.3 %) |
| kaethe-falsch | 1 | 61 (+0.7 %) | 95 (-15.7 %) ⚑ | 155 (+8.6 %) | 173 (+7.6 %) | 187 (+6 %) | 215 (0 %) |
| kaethe-falsch | 2 | 61 (+0.7 %) | 103 (-8.4 %) | 146 (+2.5 %) | 179 (+11.5 %) | 192 (+8.6 %) | 228 (+6.4 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) · eff. 0 | 31 (-17.1 %) ⚑ · eff. 14 | 32 (-43.4 %) ⚑ · eff. 16 | 45 (-31 %) ⚑ · eff. 20 | 54 (-32.8 %) ⚑ · eff. 24 | 56 (-42.2 %) ⚑ · eff. 28 |
| dieter-brew | 1 | 0 (-100 %) · eff. 0 | 42 (+13.8 %) · eff. 15 | 70 (+23.4 %) ⚑ · eff. 17 | 94 (+43.9 %) ⚑ · eff. 18 | 104 (+28.8 %) ⚑ · eff. 19 | 124 (+28.6 %) ⚑ · eff. 26 |
| dieter-brew | 2 | 0 (-100 %) · eff. 0 | 30 (-18.4 %) ⚑ · eff. 14 | 38 (-33.3 %) ⚑ · eff. 14 | 40 (-38.2 %) ⚑ · eff. 17 | 47 (-41.9 %) ⚑ · eff. 21 | 57 (-41.1 %) ⚑ · eff. 27 |
| baerbel-care | 0 | 0 (-100 %) · eff. 0 | 49 (+32.5 %) ⚑ · eff. 22 | 88 (+56.7 %) ⚑ · eff. 29 | 119 (+82.1 %) ⚑ · eff. 35 | 138 (+70.7 %) ⚑ · eff. 42 | 100 (+3.6 %) · eff. 9 |
| baerbel-care | 1 | 0 (-100 %) · eff. 0 | 49 (+31.7 %) ⚑ · eff. 22 | 99 (+75.9 %) ⚑ · eff. 20 | 149 (+128.1 %) ⚑ · eff. 29 | 176 (+118.9 %) ⚑ · eff. 35 | 157 (+62.8 %) ⚑ · eff. 5 |
| baerbel-care | 2 | 0 (-100 %) · eff. 0 | 33 (-11.4 %) · eff. 9 | 38 (-33.5 %) ⚑ · eff. 2 | 45 (-31.7 %) ⚑ · eff. 3 | 52 (-35.1 %) ⚑ · eff. 4 | 69 (-28.2 %) ⚑ · eff. 5 |
| schorsch-chef | 0 | 0 (-100 %) · eff. 0 | 37 (-0.8 %) · eff. 9 | 58 (+3 %) · eff. 7 | 65 (0 %) · eff. 7 | 81 (0 %) · eff. 8 | 107 (+10.6 %) · eff. 11 |
| schorsch-chef | 1 | 0 (-100 %) · eff. 0 | 37 (0 %) · eff. 17 | 56 (0 %) · eff. 22 | 69 (+4.9 %) · eff. 27 | 109 (+35.4 %) ⚑ · eff. 35 | 95 (-1.2 %) · eff. 9 |
| schorsch-chef | 2 | 0 (-100 %) · eff. 0 | 52 (+41.2 %) ⚑ · eff. 19 | 68 (+20.7 %) ⚑ · eff. 26 | 84 (+28.4 %) ⚑ · eff. 32 | 96 (+19.6 %) ⚑ · eff. 37 | 94 (-2.5 %) · eff. 11 |
| kaethe-herz | 0 | 19 (+1770 %) · eff. 3 | 30 (-17.6 %) ⚑ · eff. 8 | 44 (-22.5 %) ⚑ · eff. 11 | 57 (-13.3 %) · eff. 12 | 68 (-15.4 %) ⚑ · eff. 14 | 96 (0 %) · eff. 16 |
| kaethe-herz | 1 | 19 (+1770 %) · eff. 3 | 38 (+2.4 %) · eff. 6 | 52 (-8 %) · eff. 1 | 65 (-1.1 %) · eff. 1 | 77 (-4.3 %) · eff. 1 | 102 (+5.9 %) · eff. 1 |
| kaethe-herz | 2 | 19 (+1770 %) · eff. 3 | 30 (-18.4 %) ⚑ · eff. 8 | 44 (-22.2 %) ⚑ · eff. 11 | 54 (-17.4 %) ⚑ · eff. 13 | 66 (-18.4 %) ⚑ · eff. 13 | 94 (-2.5 %) · eff. 14 |

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
| dieter-brawl | 0 | 94 (-0.7 %) | 167 (-10.8 %) | 205 (-23.5 %) ⚑ | 265 (-26.2 %) ⚑ | 315 (-26.5 %) ⚑ | 449 (-23.1 %) ⚑ |
| dieter-brawl | 1 | 94 (-0.7 %) | 197 (+5 %) | 264 (-1.3 %) | 369 (+3 %) | 429 (0 %) | 666 (+14.1 %) |
| dieter-brawl | 2 | 94 (-0.7 %) | 186 (-0.7 %) | 243 (-9.2 %) | 305 (-14.8 %) | 393 (-8.2 %) | 499 (-14.6 %) |
| baerbel-feedback | 0 | 98 (+3.3 %) | 221 (+17.7 %) ⚑ | 264 (-1.5 %) | 320 (-10.7 %) | 388 (-9.5 %) | 502 (-14.1 %) |
| baerbel-feedback | 1 | 98 (+3.3 %) | 229 (+22.1 %) ⚑ | 275 (+2.8 %) | 312 (-13.1 %) | 395 (-7.8 %) | 509 (-12.8 %) |
| baerbel-feedback | 2 | 98 (+3.3 %) | 248 (+32.3 %) ⚑ | 327 (+21.9 %) ⚑ | 370 (+3.2 %) | 446 (+4.1 %) | 584 (-0.1 %) |
| baerbel-stage | 0 | 98 (+3.3 %) | 183 (-2.4 %) | 250 (-6.6 %) | 347 (-3.2 %) | 419 (-2.3 %) | 577 (-1.2 %) |
| baerbel-stage | 1 | 98 (+3.3 %) | 203 (+8.2 %) | 301 (+12.3 %) | 400 (+11.5 %) | 447 (+4.2 %) | 604 (+3.5 %) |
| baerbel-stage | 2 | 98 (+3.3 %) | 183 (-2.8 %) | 231 (-13.7 %) | 294 (-17.9 %) ⚑ | 349 (-18.7 %) ⚑ | 478 (-18.2 %) ⚑ |
| kevin-fuse | 0 | 84 (-11.4 %) | 181 (-3.4 %) | 254 (-5 %) | 335 (-6.5 %) | 417 (-2.8 %) | 604 (+3.4 %) |
| kevin-fuse | 1 | 84 (-11.4 %) | 162 (-13.6 %) | 244 (-9 %) | 363 (+1.2 %) | 480 (+12 %) | 656 (+12.3 %) |
| kevin-fuse | 2 | 84 (-11.4 %) | 231 (+23.1 %) ⚑ | 292 (+9 %) | 360 (+0.5 %) | 418 (-2.5 %) | 627 (+7.4 %) |
| kevin-hunt | 0 | 84 (-11.4 %) | 199 (+5.8 %) | 263 (-1.7 %) | 340 (-5 %) | 415 (-3.1 %) | 581 (-0.5 %) |
| kevin-hunt | 1 | 84 (-11.4 %) | 192 (+2.3 %) | 252 (-5.9 %) | 334 (-6.9 %) | 402 (-6.2 %) | 538 (-7.8 %) |
| kevin-hunt | 2 | 84 (-11.4 %) | 199 (+6.2 %) | 274 (+2.4 %) | 374 (+4.3 %) | 453 (+5.8 %) | 584 (0 %) |
| schorsch-flamme | 0 | 114 (+19.9 %) | 188 (0 %) | 308 (+15 %) ⚑ | 392 (+9.2 %) | 456 (+6.4 %) | 650 (+11.2 %) |
| schorsch-flamme | 1 | 114 (+19.9 %) | 185 (-1.3 %) | 268 (0 %) | 359 (0 %) | 434 (+1.3 %) | 651 (+11.4 %) |
| schorsch-flamme | 2 | 114 (+19.9 %) | 192 (+2.1 %) | 269 (+0.5 %) | 369 (+3 %) | 430 (+0.3 %) | 617 (+5.7 %) |
| kaethe-grand | 0 | 95 (0 %) | 198 (+5.3 %) | 296 (+10.3 %) | 348 (-2.8 %) | 452 (+5.6 %) | 572 (-2.1 %) |
| kaethe-grand | 1 | 95 (0 %) | 160 (-14.5 %) | 232 (-13.5 %) | 295 (-17.7 %) ⚑ | 390 (-8.9 %) | 569 (-2.5 %) |
| kaethe-grand | 2 | 95 (0 %) | 161 (-14.1 %) | 276 (+2.9 %) | 407 (+13.6 %) | 488 (+13.8 %) | 669 (+14.4 %) |
| kaethe-falsch | 0 | 95 (0 %) | 173 (-8 %) | 241 (-10 %) | 321 (-10.4 %) | 366 (-14.6 %) | 514 (-12 %) |
| kaethe-falsch | 1 | 95 (0 %) | 168 (-10.6 %) | 302 (+12.8 %) | 404 (+12.6 %) | 503 (+17.4 %) ⚑ | 604 (+3.5 %) |
| kaethe-falsch | 2 | 95 (0 %) | 182 (-2.9 %) | 276 (+3.1 %) | 365 (+1.9 %) | 441 (+2.9 %) | 596 (+2.1 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) · eff. 0 | 39 (-14.1 %) · eff. 12 | 48 (-23.4 %) ⚑ · eff. 13 | 73 (-18.1 %) ⚑ · eff. 16 | 97 (-8.2 %) · eff. 20 | 113 (-13.2 %) · eff. 25 |
| dieter-brew | 1 | 0 (-100 %) · eff. 0 | 59 (+29.7 %) ⚑ · eff. 12 | 102 (+62.7 %) ⚑ · eff. 11 | 125 (+41.3 %) ⚑ · eff. 10 | 132 (+25.1 %) ⚑ · eff. 9 | 176 (+34.7 %) ⚑ · eff. 14 |
| dieter-brew | 2 | 0 (-100 %) · eff. 0 | 43 (-5.9 %) · eff. 12 | 48 (-22.6 %) ⚑ · eff. 7 | 59 (-33.2 %) ⚑ · eff. 9 | 84 (-20.2 %) ⚑ · eff. 11 | 107 (-17.8 %) ⚑ · eff. 16 |
| baerbel-care | 0 | 0 (-100 %) · eff. 0 | 47 (+4.2 %) · eff. 17 | 58 (-6.6 %) · eff. 20 | 89 (0 %) · eff. 26 | 106 (0 %) · eff. 31 | 106 (-18.6 %) ⚑ · eff. 3 |
| baerbel-care | 1 | 0 (-100 %) · eff. 0 | 46 (0 %) · eff. 17 | 94 (+50.2 %) ⚑ · eff. 5 | 135 (+52.3 %) ⚑ · eff. 9 | 161 (+53 %) ⚑ · eff. 10 | 199 (+51.9 %) ⚑ · eff. 3 |
| baerbel-care | 2 | 0 (-100 %) · eff. 0 | 29 (-36.3 %) ⚑ · eff. 2 | 39 (-37.6 %) ⚑ · eff. 1 | 47 (-47.1 %) ⚑ · eff. 1 | 55 (-47.7 %) ⚑ · eff. 2 | 71 (-45.7 %) ⚑ · eff. 2 |
| schorsch-chef | 0 | 0 (-100 %) · eff. 0 | 58 (+26.8 %) ⚑ · eff. 10 | 83 (+32.5 %) ⚑ · eff. 11 | 100 (+13 %) · eff. 13 | 115 (+8.6 %) · eff. 17 | 147 (+12.2 %) · eff. 23 |
| schorsch-chef | 1 | 0 (-100 %) · eff. 0 | 42 (-8.8 %) · eff. 13 | 85 (+35.5 %) ⚑ · eff. 17 | 109 (+23 %) ⚑ · eff. 26 | 156 (+47.6 %) ⚑ · eff. 33 | 137 (+4.7 %) · eff. 24 |
| schorsch-chef | 2 | 0 (-100 %) · eff. 0 | 49 (+6.6 %) · eff. 18 | 77 (+23.2 %) ⚑ · eff. 19 | 96 (+8.8 %) · eff. 31 | 105 (-0.7 %) · eff. 32 | 138 (+5.3 %) · eff. 20 |
| kaethe-herz | 0 | 21 (+1960 %) · eff. 1 | 40 (-11.6 %) · eff. 4 | 59 (-5.9 %) · eff. 4 | 80 (-9.8 %) · eff. 4 | 97 (-8.1 %) · eff. 5 | 128 (-2.4 %) · eff. 7 |
| kaethe-herz | 1 | 21 (+1960 %) · eff. 1 | 48 (+4.8 %) · eff. 4 | 63 (0 %) · eff. 0 | 75 (-15.2 %) ⚑ · eff. 0 | 94 (-11.2 %) · eff. 0 | 131 (0 %) · eff. 0 |
| kaethe-herz | 2 | 21 (+1960 %) · eff. 1 | 40 (-11.6 %) · eff. 4 | 60 (-4.5 %) · eff. 4 | 76 (-14.4 %) · eff. 5 | 106 (+0.3 %) · eff. 5 | 130 (-0.2 %) · eff. 7 |

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
| dieter-brawl | 0 | 111 (0 %) | 208 (-9.8 %) | 226 (-27.5 %) ⚑ | 312 (-27.5 %) ⚑ | 388 (-25.8 %) ⚑ | 536 (-21.7 %) ⚑ |
| dieter-brawl | 1 | 111 (0 %) | 246 (+6.6 %) | 295 (-5.3 %) | 456 (+6.1 %) | 526 (+0.4 %) | 676 (-1.2 %) |
| dieter-brawl | 2 | 111 (0 %) | 230 (0 %) | 287 (-7.8 %) | 354 (-17.6 %) ⚑ | 442 (-15.6 %) ⚑ | 607 (-11.3 %) |
| baerbel-feedback | 0 | 113 (+1.3 %) | 273 (+18.4 %) ⚑ | 302 (-2.9 %) | 387 (-10 %) | 450 (-14 %) | 596 (-13 %) |
| baerbel-feedback | 1 | 113 (+1.3 %) | 282 (+22.2 %) ⚑ | 314 (+1 %) | 397 (-7.6 %) | 438 (-16.3 %) ⚑ | 585 (-14.6 %) |
| baerbel-feedback | 2 | 113 (+1.3 %) | 297 (+28.9 %) ⚑ | 362 (+16.3 %) ⚑ | 458 (+6.4 %) | 532 (+1.6 %) | 655 (-4.4 %) |
| baerbel-stage | 0 | 113 (+1.3 %) | 218 (-5.6 %) | 294 (-5.4 %) | 399 (-7.3 %) | 476 (-9.1 %) | 656 (-4.2 %) |
| baerbel-stage | 1 | 113 (+1.3 %) | 234 (+1.5 %) | 344 (+10.6 %) | 440 (+2.4 %) | 534 (+2 %) | 730 (+6.5 %) |
| baerbel-stage | 2 | 113 (+1.3 %) | 214 (-7.3 %) | 284 (-8.8 %) | 344 (-20 %) ⚑ | 399 (-23.8 %) ⚑ | 579 (-15.4 %) ⚑ |
| kevin-fuse | 0 | 98 (-12.5 %) | 207 (-10.2 %) | 272 (-12.6 %) | 376 (-12.6 %) | 446 (-14.8 %) | 719 (+5 %) |
| kevin-fuse | 1 | 98 (-12.5 %) | 192 (-16.6 %) ⚑ | 291 (-6.4 %) | 424 (-1.3 %) | 513 (-2.1 %) | 760 (+11 %) |
| kevin-fuse | 2 | 98 (-12.5 %) | 263 (+14.1 %) | 338 (+8.8 %) | 455 (+5.7 %) | 530 (+1.2 %) | 736 (+7.5 %) |
| kevin-hunt | 0 | 98 (-12.5 %) | 243 (+5.4 %) | 311 (0 %) | 402 (-6.4 %) | 486 (-7.3 %) | 685 (0 %) |
| kevin-hunt | 1 | 98 (-12.5 %) | 230 (0 %) | 295 (-5.1 %) | 411 (-4.5 %) | 485 (-7.4 %) | 641 (-6.4 %) |
| kevin-hunt | 2 | 98 (-12.5 %) | 227 (-1.5 %) | 308 (-1.1 %) | 430 (0 %) | 516 (-1.4 %) | 667 (-2.6 %) |
| schorsch-flamme | 0 | 127 (+14.3 %) | 237 (+3 %) | 340 (+9.3 %) | 478 (+11.2 %) | 563 (+7.5 %) | 737 (+7.5 %) |
| schorsch-flamme | 1 | 127 (+14.3 %) | 236 (+2.2 %) | 314 (+0.8 %) | 459 (+6.8 %) | 537 (+2.6 %) | 791 (+15.4 %) ⚑ |
| schorsch-flamme | 2 | 127 (+14.3 %) | 230 (-0.3 %) | 321 (+3.2 %) | 439 (+2.2 %) | 528 (+0.8 %) | 751 (+9.7 %) |
| kaethe-grand | 0 | 101 (-9 %) | 237 (+2.7 %) | 337 (+8.5 %) | 432 (+0.5 %) | 561 (+7.1 %) | 724 (+5.8 %) |
| kaethe-grand | 1 | 101 (-9 %) | 199 (-13.8 %) | 276 (-11.3 %) | 385 (-10.6 %) | 524 (0 %) | 676 (-1.3 %) |
| kaethe-grand | 2 | 101 (-9 %) | 197 (-14.6 %) | 325 (+4.4 %) | 458 (+6.6 %) | 571 (+9 %) | 832 (+21.5 %) ⚑ |
| kaethe-falsch | 0 | 101 (-9 %) | 205 (-11.1 %) | 276 (-11.4 %) | 402 (-6.6 %) | 456 (-12.9 %) | 604 (-11.8 %) |
| kaethe-falsch | 1 | 101 (-9 %) | 212 (-7.9 %) | 354 (+13.8 %) | 498 (+15.7 %) ⚑ | 558 (+6.5 %) | 777 (+13.4 %) |
| kaethe-falsch | 2 | 101 (-9 %) | 220 (-4.3 %) | 328 (+5.3 %) | 471 (+9.5 %) | 531 (+1.5 %) | 688 (+0.4 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) · eff. 0 | 37 (-21.9 %) ⚑ · eff. 11 | 54 (-20.5 %) ⚑ · eff. 14 | 79 (-11.4 %) · eff. 15 | 105 (-1.7 %) · eff. 18 | 134 (-1.9 %) · eff. 24 |
| dieter-brew | 1 | 0 (-100 %) · eff. 0 | 59 (+25.1 %) ⚑ · eff. 11 | 115 (+70.2 %) ⚑ · eff. 10 | 152 (+71 %) ⚑ · eff. 8 | 133 (+24.2 %) ⚑ · eff. 6 | 191 (+39.7 %) ⚑ · eff. 11 |
| dieter-brew | 2 | 0 (-100 %) · eff. 0 | 47 (+0.9 %) · eff. 11 | 52 (-22.9 %) ⚑ · eff. 7 | 70 (-21 %) ⚑ · eff. 8 | 84 (-21.5 %) ⚑ · eff. 9 | 120 (-11.8 %) · eff. 13 |
| baerbel-care | 0 | 0 (-100 %) · eff. 0 | 39 (-16.2 %) ⚑ · eff. 16 | 56 (-16.8 %) ⚑ · eff. 20 | 87 (-1.6 %) · eff. 23 | 101 (-5.5 %) · eff. 26 | 112 (-18.2 %) ⚑ · eff. 2 |
| baerbel-care | 1 | 0 (-100 %) · eff. 0 | 39 (-16.2 %) ⚑ · eff. 16 | 100 (+46.8 %) ⚑ · eff. 5 | 147 (+66.3 %) ⚑ · eff. 6 | 171 (+60.4 %) ⚑ · eff. 6 | 214 (+57 %) ⚑ · eff. 2 |
| baerbel-care | 2 | 0 (-100 %) · eff. 0 | 27 (-43.2 %) ⚑ · eff. 1 | 41 (-40 %) ⚑ · eff. 1 | 49 (-44.6 %) ⚑ · eff. 1 | 57 (-46.6 %) ⚑ · eff. 1 | 73 (-46.4 %) ⚑ · eff. 2 |
| schorsch-chef | 0 | 0 (-100 %) · eff. 0 | 62 (+30.9 %) ⚑ · eff. 11 | 90 (+32.6 %) ⚑ · eff. 13 | 105 (+18.5 %) ⚑ · eff. 16 | 129 (+20.7 %) ⚑ · eff. 24 | 162 (+18.9 %) ⚑ · eff. 34 |
| schorsch-chef | 1 | 0 (-100 %) · eff. 0 | 51 (+7.7 %) · eff. 17 | 88 (+30.1 %) ⚑ · eff. 18 | 118 (+32.6 %) ⚑ · eff. 29 | 153 (+43.1 %) ⚑ · eff. 35 | 152 (+11.1 %) · eff. 32 |
| schorsch-chef | 2 | 0 (-100 %) · eff. 0 | 53 (+13.6 %) · eff. 18 | 86 (+26.5 %) ⚑ · eff. 19 | 109 (+23.3 %) ⚑ · eff. 29 | 116 (+8.9 %) · eff. 22 | 95 (-30.3 %) ⚑ · eff. 7 |
| kaethe-herz | 0 | 24 (+2340 %) · eff. 1 | 40 (-15.7 %) ⚑ · eff. 3 | 65 (-4.1 %) · eff. 4 | 84 (-5.4 %) · eff. 4 | 101 (-5.6 %) · eff. 4 | 129 (-5.4 %) · eff. 6 |
| kaethe-herz | 1 | 24 (+2340 %) · eff. 1 | 47 (0 %) · eff. 3 | 67 (-0.7 %) · eff. 0 | 89 (0 %) · eff. 0 | 107 (0 %) · eff. 0 | 141 (+3.4 %) · eff. 0 |
| kaethe-herz | 2 | 24 (+2340 %) · eff. 1 | 40 (-15.5 %) ⚑ · eff. 3 | 68 (0 %) · eff. 4 | 87 (-2.3 %) · eff. 4 | 105 (-1.5 %) · eff. 4 | 136 (0 %) · eff. 6 |

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
| baerbel-feedback | 0 | 145 (0 %) | 297 (+14.8 %) | 362 (-3 %) | 484 (-6.2 %) | 544 (-10.8 %) | 731 (-9.8 %) |
| baerbel-feedback | 1 | 145 (0 %) | 328 (+26.7 %) ⚑ | 371 (-0.4 %) | 481 (-6.9 %) | 528 (-13.3 %) | 741 (-8.6 %) |
| baerbel-feedback | 2 | 145 (0 %) | 329 (+26.9 %) ⚑ | 440 (+18 %) ⚑ | 603 (+16.9 %) ⚑ | 661 (+8.6 %) | 806 (-0.5 %) |
| baerbel-stage | 0 | 145 (0 %) | 259 (0 %) | 319 (-14.4 %) | 466 (-9.6 %) | 541 (-11.2 %) | 755 (-6.8 %) |
| baerbel-stage | 1 | 145 (0 %) | 278 (+7.4 %) | 391 (+4.9 %) | 546 (+5.8 %) | 663 (+8.7 %) | 861 (+6.3 %) |
| baerbel-stage | 2 | 145 (0 %) | 259 (+0.1 %) | 309 (-17.1 %) ⚑ | 434 (-15.9 %) ⚑ | 507 (-16.7 %) ⚑ | 745 (-8.1 %) |
| kevin-fuse | 0 | 129 (-10.7 %) | 242 (-6.6 %) | 322 (-13.7 %) | 435 (-15.8 %) ⚑ | 493 (-19.1 %) ⚑ | 777 (-4.1 %) |
| kevin-fuse | 1 | 129 (-10.7 %) | 224 (-13.6 %) | 322 (-13.6 %) | 516 (0 %) | 601 (-1.4 %) | 899 (+11 %) |
| kevin-fuse | 2 | 129 (-10.7 %) | 291 (+12.4 %) | 389 (+4.4 %) | 558 (+8.2 %) | 602 (-1.1 %) | 919 (+13.4 %) |
| kevin-hunt | 0 | 129 (-10.7 %) | 257 (-0.6 %) | 382 (+2.5 %) | 486 (-5.9 %) | 609 (0 %) | 795 (-1.8 %) |
| kevin-hunt | 1 | 129 (-10.7 %) | 248 (-4 %) | 345 (-7.5 %) | 456 (-11.6 %) | 557 (-8.7 %) | 763 (-5.8 %) |
| kevin-hunt | 2 | 129 (-10.7 %) | 268 (+3.4 %) | 379 (+1.6 %) | 505 (-2.1 %) | 626 (+2.8 %) | 810 (0 %) |
| schorsch-flamme | 0 | 152 (+5.2 %) | 286 (+10.5 %) | 421 (+12.8 %) | 604 (+17 %) ⚑ | 716 (+17.5 %) ⚑ | 984 (+21.4 %) ⚑ |
| schorsch-flamme | 1 | 152 (+5.2 %) | 274 (+6 %) | 364 (-2.3 %) | 560 (+8.5 %) | 676 (+11 %) | 960 (+18.6 %) ⚑ |
| schorsch-flamme | 2 | 152 (+5.2 %) | 274 (+6 %) | 376 (+0.9 %) | 534 (+3.6 %) | 658 (+7.9 %) | 909 (+12.2 %) |
| kaethe-grand | 0 | 125 (-13.5 %) | 268 (+3.6 %) | 400 (+7.1 %) | 553 (+7.1 %) | 674 (+10.7 %) | 992 (+22.5 %) ⚑ |
| kaethe-grand | 1 | 125 (-13.5 %) | 239 (-7.7 %) | 326 (-12.6 %) | 460 (-10.9 %) | 582 (-4.4 %) | 797 (-1.7 %) |
| kaethe-grand | 2 | 125 (-13.5 %) | 234 (-9.7 %) | 373 (0 %) | 575 (+11.5 %) | 704 (+15.5 %) ⚑ | 1004 (+23.9 %) ⚑ |
| kaethe-falsch | 0 | 125 (-13.5 %) | 240 (-7.2 %) | 345 (-7.5 %) | 483 (-6.3 %) | 539 (-11.5 %) | 738 (-8.9 %) |
| kaethe-falsch | 1 | 125 (-13.5 %) | 237 (-8.5 %) | 451 (+20.8 %) ⚑ | 557 (+8 %) | 693 (+13.7 %) | 997 (+23 %) ⚑ |
| kaethe-falsch | 2 | 125 (-13.5 %) | 249 (-3.7 %) | 403 (+8 %) | 544 (+5.5 %) | 663 (+8.8 %) | 903 (+11.5 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) · eff. 0 | 46 (-16.2 %) ⚑ · eff. 9 | 55 (-26.7 %) ⚑ · eff. 12 | 97 (-5.3 %) · eff. 15 | 129 (0 %) · eff. 16 | 166 (-7.7 %) · eff. 22 |
| dieter-brew | 1 | 0 (-100 %) · eff. 0 | 69 (+25.1 %) ⚑ · eff. 9 | 127 (+68.4 %) ⚑ · eff. 8 | 161 (+57.6 %) ⚑ · eff. 6 | 150 (+16.4 %) ⚑ · eff. 5 | 204 (+13 %) · eff. 5 |
| dieter-brew | 2 | 0 (-100 %) · eff. 0 | 53 (-3.8 %) · eff. 9 | 60 (-20.4 %) ⚑ · eff. 5 | 79 (-22.6 %) ⚑ · eff. 7 | 107 (-16.8 %) ⚑ · eff. 7 | 139 (-22.9 %) ⚑ · eff. 11 |
| baerbel-care | 0 | 0 (-100 %) · eff. 0 | 61 (+9.7 %) · eff. 13 | 65 (-13.8 %) · eff. 17 | 102 (0 %) · eff. 22 | 123 (-4.5 %) · eff. 23 | 126 (-30.4 %) ⚑ · eff. 2 |
| baerbel-care | 1 | 0 (-100 %) · eff. 0 | 61 (+9.7 %) · eff. 13 | 96 (+26.5 %) ⚑ · eff. 2 | 160 (+56.4 %) ⚑ · eff. 3 | 180 (+39.9 %) ⚑ · eff. 3 | 244 (+35.4 %) ⚑ · eff. 2 |
| baerbel-care | 2 | 0 (-100 %) · eff. 0 | 29 (-48.4 %) ⚑ · eff. 1 | 42 (-44.8 %) ⚑ · eff. 1 | 52 (-49.3 %) ⚑ · eff. 1 | 62 (-51.8 %) ⚑ · eff. 1 | 81 (-55.3 %) ⚑ · eff. 2 |
| schorsch-chef | 0 | 0 (-100 %) · eff. 0 | 71 (+28 %) ⚑ · eff. 14 | 107 (+41.1 %) ⚑ · eff. 19 | 127 (+23.9 %) ⚑ · eff. 21 | 144 (+12.1 %) · eff. 31 | 218 (+20.9 %) ⚑ · eff. 45 |
| schorsch-chef | 1 | 0 (-100 %) · eff. 0 | 55 (0 %) · eff. 17 | 79 (+4.1 %) · eff. 18 | 111 (+8.2 %) · eff. 29 | 165 (+28.6 %) ⚑ · eff. 37 | 182 (+1 %) · eff. 39 |
| schorsch-chef | 2 | 0 (-100 %) · eff. 0 | 64 (+15 %) · eff. 14 | 100 (+32.3 %) ⚑ · eff. 18 | 125 (+22.7 %) ⚑ · eff. 28 | 140 (+8.6 %) · eff. 29 | 181 (+0.2 %) · eff. 32 |
| kaethe-herz | 0 | 25 (+2430 %) · eff. 1 | 46 (-17.1 %) ⚑ · eff. 3 | 67 (-11.5 %) · eff. 3 | 92 (-10 %) · eff. 3 | 107 (-17 %) ⚑ · eff. 3 | 153 (-15.4 %) ⚑ · eff. 4 |
| kaethe-herz | 1 | 25 (+2430 %) · eff. 1 | 54 (-1.8 %) · eff. 3 | 76 (0 %) · eff. 0 | 98 (-4 %) · eff. 0 | 122 (-4.8 %) · eff. 0 | 180 (0 %) · eff. 0 |
| kaethe-herz | 2 | 25 (+2430 %) · eff. 1 | 46 (-17.1 %) ⚑ · eff. 3 | 68 (-9.8 %) · eff. 3 | 89 (-12.7 %) · eff. 4 | 107 (-16.5 %) ⚑ · eff. 3 | 151 (-16.4 %) ⚑ · eff. 4 |

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

**Wert je Punkt:** Standfestigkeit -0.8 Schaden/s · 0.2 Heilung/s · Wumms 1.2 Schaden/s · 0.1 Heilung/s · Taktgefühl 0.1 Schaden/s · 0.7 Heilung/s · Bastelgrips -0.4 Schaden/s · 1.5 Heilung/s · 0.1 verhindert/s · Dicke Haut -0.9 Schaden/s · 0.3 Heilung/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Pfand auf die Zwölf 38.6 % · Kronkorken-Kelle 23.9 % · Autoangriff · Flasche kreist 22.1 % · Fassanstich 8.3 % · Du schuldest mir Pfand! 7.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Letzte Runde heilt +0.6 % · Runde aufs Haus 0 % · Großes Fass -3.1 % · Weizenkur gebunden · Nachschank gebunden · Weizen gegen die Zeche gebunden · Deckel und Pflaster gebunden · Katerfass gebunden · Tropfen für Tropfen gebunden

### dieter-brew · Pfad 2 · Stufe 10 ·299 Schaden/s · Ausrüstung +101.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.8 Schaden/s · -0.1 Heilung/s · Taktgefühl 0.3 Schaden/s · -0.1 Heilung/s · Bastelgrips 0.4 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Fassanstich 33.7 % · Pfand auf die Zwölf 22.4 % · Fassanstich 18.4 % · Autoangriff · Flasche kreist 14.7 % · Du schuldest mir Pfand! 5.5 % · Kronkorken-Kelle 5.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Bock auf mehr +7.5 % · Scherben bringen Glück +7.2 % · Gut gekühlt 0 % · Rücklaufleitung gebunden · Bock zuerst gebunden · Breiter Ausschank gebunden · Pfand mit Zinsen gebunden · Bock drauf gebunden · Restbestand gebunden

### dieter-brew · Pfad 0 · Stufe 20 ·361 Schaden/s · Ausrüstung +205.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.1 Schaden/s · Taktgefühl 0.6 Schaden/s · -0.2 Heilung/s · Bastelgrips 0.2 Schaden/s · 0.3 Heilung/s · Dicke Haut 0.2 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Pfand auf die Zwölf 51 % · Fassanstich 22.2 % · Autoangriff · Flasche kreist 22.2 % · Du schuldest mir Pfand! 4.2 % · Kronkorken-Kelle 0.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nachfüllen +13.8 % · Bar auf die Hand +6.2 % · Weizenkur +1.3 % · Rücklaufleitung +1 % · Schaumkrone +0.9 % · Drittes Fass 0 % · Zapfen im Gehen 0 % · Nachschank 0 % · Nächste Runde -0.4 % · Anstich mit Schwung -0.7 % · Zapfhahn auf -2.4 % · Pils zuerst gebunden · Frisch gezapft gebunden

### dieter-brew · Pfad 1 · Stufe 20 ·315 Schaden/s · Ausrüstung +211.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -0.4 Schaden/s · -0.5 Heilung/s · 0.1 verhindert/s · Wumms 1.5 Schaden/s · 0.1 Heilung/s · 0.1 verhindert/s · Taktgefühl 0 Schaden/s · -0.8 Heilung/s · Bastelgrips 0.1 Schaden/s · 0.3 Heilung/s · 0.1 verhindert/s · Dicke Haut -1.2 Schaden/s · -0.5 Heilung/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Pfand auf die Zwölf 46.2 % · Autoangriff · Flasche kreist 23.8 % · Fassanstich 16.7 % · Kronkorken-Kelle 7.7 % · Du schuldest mir Pfand! 5.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Pils zuerst +11.1 % · Nachschank 0 % · Weizen gegen die Zeche 0 % · Deckel und Pflaster 0 % · Rücklaufleitung 0 % · Runde aufs Haus -0.1 % · Nachfüllen -0.4 % · Anstich für alle -1.6 % · Großes Fass -1.7 % · Tropfen für Tropfen -4.9 % · Katerfass -8.4 % · Weizenkur gebunden · Letzte Runde heilt gebunden

### dieter-brew · Pfad 2 · Stufe 20 ·434 Schaden/s · Ausrüstung +152.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.5 Schaden/s · 0.2 Heilung/s · Taktgefühl -0.7 Schaden/s · 0.1 Heilung/s · Bastelgrips 0 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Fassanstich 34.3 % · Pfand auf die Zwölf 24.5 % · Autoangriff · Flasche kreist 14.3 % · Fassanstich 13 % · Kronkorken-Kelle 8.1 % · Du schuldest mir Pfand! 5.2 % · Bockfass 0.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Bock auf mehr +7 % · Scherben bringen Glück +4.2 % · Restbestand +0.7 % · Letzter Ausschank +0.5 % · Pfand mit Zinsen +0.1 % · Bock zuerst 0 % · Breiter Ausschank 0 % · Pils zuerst 0 % · Weizenkur 0 % · Nachfüllen -0.7 % · Bock drauf -2.8 % · Rücklaufleitung gebunden · Gut gekühlt gebunden

### baerbel-care · Pfad 0 · Stufe 10 ·260 Schaden/s · Ausrüstung +328.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.7 Schaden/s · Taktgefühl -0.3 Schaden/s · 0.6 Heilung/s · Bastelgrips 0 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Großreinemachen 52.4 % · Pinsel-Piekser 35.9 % · Autoangriff · Dauersprühen 11.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Gründlich, nicht schnell 0 % · Sanfte Versiegelung 0 % · Löffel in der Schürze 0 % · Warme Schüssel gebunden · Nachschlag gebunden · Das sechste Glas gebunden · Ein Schluck, ein Plan gebunden · Notration gebunden · Nebenbei umgerührt gebunden

### baerbel-care · Pfad 1 · Stufe 10 ·223 Schaden/s · Ausrüstung +214.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.5 Schaden/s · 0.1 Heilung/s · Taktgefühl 0.4 Schaden/s · 0.2 Heilung/s · Bastelgrips 0 Schaden/s · 0.5 Heilung/s · Dicke Haut 0.5 Schaden/s · -0.6 Heilung/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Großreinemachen 49.4 % · Pinsel-Piekser 36.3 % · Autoangriff · Dauersprühen 14.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Vom Herd aus +0.7 % · Anbau mit Fußbodenheilung +0.7 % · Nachgelegt -8.9 % · Giselas Ruf gebunden · Brutpflege gebunden · Dickes Fell gebunden · Gisela, hierher! gebunden · Thermomix-Tafel gebunden · Am Tisch wird gegessen gebunden

### baerbel-care · Pfad 2 · Stufe 10 ·278 Schaden/s · Ausrüstung +203 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.4 Schaden/s · Taktgefühl 0.7 Schaden/s · -0.1 Heilung/s · Bastelgrips 0 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Großreinemachen 48.9 % · Pinsel-Piekser 40.1 % · Autoangriff · Dauersprühen 11 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Restfleck +3.1 % · Blitzblank +1.5 % · Frisch aufgetragen 0 % · Spüli ins Auge gebunden · Frisch gewischt gebunden · Nichts wird weggekippt gebunden · Stammpublikum gebunden · Deckel auf die Schüssel gebunden · Landfrauen-Glanz gebunden

### baerbel-care · Pfad 0 · Stufe 20 ·391 Schaden/s · Ausrüstung +439.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.2 Schaden/s · -0.1 Heilung/s · Taktgefühl 0.5 Schaden/s · -0.1 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Großreinemachen 49.3 % · Pinsel-Piekser 38.9 % · Autoangriff · Dauersprühen 11.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nicht ohne meine Mädels +5.1 % · Nebenbei umgerührt +3.1 % · Nachschlag 0 % · Das sechste Glas 0 % · Ein Schluck, ein Plan 0 % · Notration 0 % · Gründlich, nicht schnell 0 % · Löffel in der Schürze 0 % · Giselas Ruf 0 % · Spüli ins Auge 0 % · Frisch gewischt 0 % · Warme Schüssel gebunden · Sanfte Versiegelung gebunden

### baerbel-care · Pfad 1 · Stufe 20 ·329 Schaden/s · Ausrüstung +314.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.6 Schaden/s · Taktgefühl 0.3 Schaden/s · 0.2 Heilung/s · -0.1 verhindert/s · Bastelgrips 0.2 Schaden/s · 0.3 Heilung/s · Dicke Haut 0.8 Schaden/s · -1 Heilung/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Großreinemachen 49.6 % · Pinsel-Piekser 38.6 % · Autoangriff · Dauersprühen 11.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Anbau mit Fußbodenheilung +5.4 % · Brutpflege 0 % · Dickes Fell 0 % · Gisela, hierher! 0 % · Am Tisch wird gegessen 0 % · Warme Schüssel 0 % · Spüli ins Auge 0 % · Frisch gewischt 0 % · Gänsehaut-Finale -3.5 % · Nachgelegt -6.3 % · Thermomix-Tafel -7.1 % · Giselas Ruf gebunden · Vom Herd aus gebunden

### baerbel-care · Pfad 2 · Stufe 20 ·424 Schaden/s · Ausrüstung +315.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.2 Schaden/s · Taktgefühl 0.4 Schaden/s · Bastelgrips 0 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Großreinemachen 47.9 % · Pinsel-Piekser 42 % · Autoangriff · Dauersprühen 10.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Restfleck +2.1 % · Landfrauen-Glanz +1.5 % · Stammpublikum +0.6 % · Frisch gewischt 0 % · Nichts wird weggekippt 0 % · Deckel auf die Schüssel 0 % · Frisch aufgetragen 0 % · Schlussputz 0 % · Warme Schüssel 0 % · Giselas Ruf 0 % · Nachschlag 0 % · Spüli ins Auge gebunden · Blitzblank gebunden

### baerbel-feedback · Pfad 0 · Stufe 10 ·302 Schaden/s · Ausrüstung +108.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.4 Schaden/s · 0.3 Heilung/s · Taktgefühl 0.5 Schaden/s · 0.2 Heilung/s · Bastelgrips -0.3 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 38.3 % · Pinsel-Piekser 19.8 % · Schimmel 16.2 % · Durchputzen 14.8 % · Autoangriff · Dauersprühen 10.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Mundpropaganda +1.1 % · Ruhe im Karton 0 % · Nebenbei gestreut -0.3 % · Feuchte Ecke gebunden · Es wächst nach gebunden · Schimmel geht viral gebunden · Kurzer Hausbesuch gebunden · Sporenflug gebunden · Muffige Kammer gebunden

### baerbel-feedback · Pfad 1 · Stufe 10 ·314 Schaden/s · Ausrüstung +120.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.3 Schaden/s · 1 Heilung/s · Taktgefühl 2.5 Schaden/s · 2 Heilung/s · -0.1 verhindert/s · Bastelgrips 0 Schaden/s · 1.2 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 42.2 % · Pinsel-Piekser 20.2 % · Durchputzen 14.1 % · Schimmel 13.2 % · Autoangriff · Dauersprühen 10.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kundenbindung 0 % · Reklamation abgewürgt 0 % · Doppelte Marge 0 % · Provision vom Schmerz gebunden · Putzprovision gebunden · Kleingeld vom Tick gebunden · Abschlussprämie gebunden · Provisionskur gebunden · Sonderrabatt gebunden

### baerbel-feedback · Pfad 2 · Stufe 10 ·362 Schaden/s · Ausrüstung +90.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.7 Schaden/s · 0.1 Heilung/s · Taktgefühl 0.1 Schaden/s · Bastelgrips 0 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 36.8 % · Pinsel-Piekser 21.9 % · Durchputzen 20.4 % · Schimmel 11.9 % · Autoangriff · Dauersprühen 9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Doppelt geputzt +1.8 % · Vertrieb auf Achse 0 % · Kettenbrief 0 % · Einmal mehr drüber gebunden · Eintrittsgebühr gebunden · Bring noch zwei Freundinnen gebunden · Freundin wirbt Freundin gebunden · Passives Einkommen gebunden · Mehrwegflasche gebunden

### baerbel-feedback · Pfad 0 · Stufe 20 ·450 Schaden/s · Ausrüstung +185.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 3.5 Schaden/s · Taktgefühl 0 Schaden/s · Bastelgrips 0 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 53.2 % · Pinsel-Piekser 15.1 % · Durchputzen 11.1 % · Schimmel 10.6 % · Autoangriff · Dauersprühen 10 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nebenbei gestreut +2.9 % · Einmal mehr drüber +2.7 % · Kurzer Hausbesuch 0 % · Sporenflug 0 % · Muffige Kammer 0 % · Ruhe im Karton 0 % · Provision vom Schmerz 0 % · Schimmel geht viral -0.3 % · Putzprovision -1.3 % · Sporenregen -1.9 % · Es wächst nach -3 % · Feuchte Ecke gebunden · Mundpropaganda gebunden

### baerbel-feedback · Pfad 1 · Stufe 20 ·438 Schaden/s · Ausrüstung +197.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.1 Schaden/s · Taktgefühl 0.4 Schaden/s · 1.7 Heilung/s · Bastelgrips 0 Schaden/s · 1.3 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 43.3 % · Pinsel-Piekser 18.7 % · Schimmel 13 % · Durchputzen 12.9 % · Autoangriff · Dauersprühen 12 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Putzprovision +3.1 % · Feuchte Ecke +0.1 % · Kleingeld vom Tick 0 % · Abschlussprämie 0 % · Sonderrabatt 0 % · Kundenbindung 0 % · Doppelte Marge 0 % · Bonusausschüttung 0 % · Einmal mehr drüber -0.8 % · Provisionskur -7.6 % · Es wächst nach -8.6 % · Provision vom Schmerz gebunden · Reklamation abgewürgt gebunden

### baerbel-feedback · Pfad 2 · Stufe 20 ·532 Schaden/s · Ausrüstung +158.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.2 Schaden/s · -0.1 verhindert/s · Taktgefühl -1.1 Schaden/s · -0.2 Heilung/s · Bastelgrips 0 Schaden/s · 0.4 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 37.4 % · Pinsel-Piekser 26.1 % · Durchputzen 19.2 % · Schimmel 9.5 % · Autoangriff · Dauersprühen 7.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Die ganze Downline +3 % · Eintrittsgebühr +1.6 % · Doppelt geputzt +1 % · Putzprovision +0.4 % · Bring noch zwei Freundinnen 0 % · Freundin wirbt Freundin 0 % · Mehrwegflasche 0 % · Vertrieb auf Achse 0 % · Provision vom Schmerz 0 % · Feuchte Ecke -1 % · Passives Einkommen -3.2 % · Einmal mehr drüber gebunden · Kettenbrief gebunden

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

### schorsch-chef · Pfad 0 · Stufe 10 ·169 Schaden/s · Ausrüstung +182.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.1 Schaden/s · -0.3 Heilung/s · Taktgefühl -1 Schaden/s · 0.3 Heilung/s · Bastelgrips -0.3 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Autoangriff · Zangenklapper 40.6 % · Grillzange 34.5 % · Servieren 24.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Wurstkette +2.2 % · Metzgerqualität 0 % · Auf Vorrat gegrillt -0.4 % · Probierhäppchen gebunden · Zweite Wurst gebunden · Satt ist satt gebunden · Notwurst gebunden · Hausmacher gebunden · Goldbraun gebunden

### schorsch-chef · Pfad 1 · Stufe 10 ·176 Schaden/s · Ausrüstung +378 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.2 Schaden/s · 0.3 Heilung/s · -0.1 verhindert/s · Taktgefühl 0.8 Schaden/s · 1.2 Heilung/s · Bastelgrips -0.1 Schaden/s · 0.5 Heilung/s · -0.1 verhindert/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Grillzange 25.7 % · Autoangriff · Zangenklapper 25.4 % · Popcorn 23 % · Servieren 16.8 % · Stichflamme 9.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Popcorn für alle 0 % · Belegtes Brötchen -0.1 % · Scharfer Senf -8.7 % · Grillkäse dazu gebunden · Schnell gewendet gebunden · Heißer Rost gebunden · Maiskolben dazu gebunden · Senf drauf! gebunden · Wenden! gebunden

### schorsch-chef · Pfad 2 · Stufe 10 ·165 Schaden/s · Ausrüstung +616.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.4 Schaden/s · -0.2 Heilung/s · Taktgefühl 1.9 Schaden/s · -0.2 Heilung/s · Bastelgrips 0.4 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Autoangriff · Zangenklapper 30.3 % · Servieren 27.5 % · Grillzange 25.3 % · Stichflamme 16.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Buffet nachlegen 0 % · Dicke Luft 0 % · Frische Luft -0.3 % · Löschbier gebunden · Dampfgaren gebunden · Stammplatz gebunden · Feuerfeste Schürze gebunden · Ruhige Glut gebunden · Tischdienst gebunden

### schorsch-chef · Pfad 0 · Stufe 20 ·246 Schaden/s · Ausrüstung +235.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.5 Schaden/s · Taktgefühl 0.7 Schaden/s · -0.4 Heilung/s · Bastelgrips -0.6 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Autoangriff · Zangenklapper 36.2 % · Grillzange 34.8 % · Stichflamme 19.4 % · Servieren 9.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Auf Vorrat gegrillt +7.9 % · Satt ist satt +3.9 % · Goldbraun +0.5 % · Schnell gewendet +0.2 % · Notwurst 0 % · Hausmacher 0 % · Metzgerqualität 0 % · Meisterwurst 0 % · Löschbier 0 % · Grillkäse dazu -3.1 % · Zweite Wurst -4.2 % · Probierhäppchen gebunden · Wurstkette gebunden

### schorsch-chef · Pfad 1 · Stufe 20 ·269 Schaden/s · Ausrüstung +570.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0.6 Schaden/s · Wumms -0.1 Schaden/s · -0.1 verhindert/s · Taktgefühl -0.7 Schaden/s · -0.3 Heilung/s · -0.1 verhindert/s · Bastelgrips -0.9 Schaden/s · 1.4 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Grillzange 33.8 % · Stichflamme 30.5 % · Autoangriff · Zangenklapper 21.4 % · Popcorn 10.2 % · Servieren 4.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Maiskolben dazu +17.9 % · Probierhäppchen +14.2 % · Senf drauf! +10.4 % · Scharfer Senf +7.1 % · Schnell gewendet +1.5 % · Heißer Rost +0.4 % · Wenden! +0.4 % · Belegtes Brötchen +0.3 % · Löschbier 0 % · Volle Platte -1.7 % · Zweite Wurst -5.9 % · Grillkäse dazu gebunden · Popcorn für alle gebunden

### schorsch-chef · Pfad 2 · Stufe 20 ·299 Schaden/s · Ausrüstung +1227 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms -0.1 Schaden/s · -0.2 Heilung/s · Taktgefühl -0.9 Schaden/s · -0.1 Heilung/s · Bastelgrips 0.1 Schaden/s · 0.3 Heilung/s · Dicke Haut 1.8 Schaden/s · 0.3 Heilung/s

**Kniffe (Anteil am Schaden):** Grillzange 52.7 % · Autoangriff · Zangenklapper 22.7 % · Servieren 13.2 % · Stichflamme 11.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Frische Luft +28 % · Probierhäppchen +15.4 % · Grillkäse dazu +12.8 % · Ruhige Glut +6.7 % · Feuerfeste Schürze +3.6 % · Stammplatz +0.6 % · Dampfgaren 0 % · Tischdienst 0 % · Buffet nachlegen 0 % · Lokalrunde 0 % · Zweite Wurst -4.5 % · Löschbier gebunden · Dicke Luft gebunden

### schorsch-flamme · Pfad 0 · Stufe 10 ·340 Schaden/s · Ausrüstung +156.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.3 Schaden/s · Taktgefühl 0.2 Schaden/s · Bastelgrips -1.8 Schaden/s · -0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Schwenkgrill 23.2 % · Servieren 16.7 % · Popcorn 16.5 % · Grillzange 15.8 % · Stichflamme 8.1 % · Autoangriff · Zangenklapper 7 % · Flambiert 4.9 % · Dampf 4.7 % · Glutbrocken 2.3 % · Glutbrand 0.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Blasebalg-Profi +3.9 % · Feuerring 0 % · Heißer Draht -1.9 % · Gut angefacht gebunden · Kurze Zündschnur gebunden · Zunder gebunden · Hitzewelle gebunden · Nach dem Knall gebunden · Nachglühen gebunden

### schorsch-flamme · Pfad 1 · Stufe 10 ·314 Schaden/s · Ausrüstung +182 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.9 Schaden/s · 0.1 Heilung/s · Taktgefühl 1.5 Schaden/s · 0.1 Heilung/s · Bastelgrips 1.9 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Servieren 28.3 % · Schwenkgrill 18.5 % · Grillzange 17.7 % · Popcorn 16.5 % · Autoangriff · Zangenklapper 9.1 % · Stichflamme 7.4 % · Dampf 2.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Knusprig +1 % · Grillteller mit Braten +0.9 % · Zweiter Gang -4.4 % · Anbraten gebunden · Fleischermesser gebunden · Auf den Punkt gebunden · Abschrecken gebunden · Der Nächste, bitte gebunden · Fleischklopfer gebunden

### schorsch-flamme · Pfad 2 · Stufe 10 ·321 Schaden/s · Ausrüstung +150.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2 Schaden/s · Taktgefühl 4 Schaden/s · 0.2 Heilung/s · Bastelgrips 0.9 Schaden/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Popcorn 20.7 % · Schwenkgrill 20.2 % · Servieren 16.4 % · Spiritus-Schwall 12.4 % · Grillzange 11.6 % · Stichflamme 7.9 % · Autoangriff · Zangenklapper 7.2 % · Dampf 1.9 % · Glutbrocken 1.2 % · Glutbrand 0.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nachgießen +2.8 % · Zangentakt 0 % · Doppelpack 0 % · Kohlenschaufel gebunden · Zangenklapper im Takt gebunden · Brandbeschleuniger gebunden · Heiße Kohlen gebunden · Spiritus-Schwall gebunden · Funkensprung gebunden

### schorsch-flamme · Pfad 0 · Stufe 20 ·563 Schaden/s · Ausrüstung +237.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.9 Schaden/s · 0.1 Heilung/s · Taktgefühl -1 Schaden/s · -0.1 Heilung/s · Bastelgrips 0.4 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Schwenkgrill 20 % · Servieren 18.9 % · Stichflamme 16.5 % · Popcorn 13.4 % · Grillzange 12.8 % · Autoangriff · Zangenklapper 5.9 % · Dampf 5.4 % · Flambiert 4.9 % · Glutbrocken 2 % · Glutbrand 0.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Feuerteufel +7.7 % · Nach dem Knall +5.1 % · Zunder +4.5 % · Hitzewelle +4.1 % · Kurze Zündschnur +3 % · Fleischermesser +0.5 % · Anbraten 0 % · Kohlenschaufel 0 % · Blasebalg-Profi -1.1 % · Nachglühen -2.1 % · Heißer Draht -2.5 % · Gut angefacht gebunden · Feuerring gebunden

### schorsch-flamme · Pfad 1 · Stufe 20 ·537 Schaden/s · Ausrüstung +274.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 2.1 Schaden/s · 0.1 Heilung/s · Taktgefühl 1 Schaden/s · 0.1 Heilung/s · Bastelgrips 0.3 Schaden/s · -0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Servieren 39.4 % · Popcorn 19.8 % · Schwenkgrill 18.3 % · Grillzange 9.6 % · Autoangriff · Zangenklapper 6.7 % · Dampf 3.5 % · Glutbrocken 2.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Spanferkel-Wurf +11.9 % · Fleischklopfer +5.4 % · Gut angefacht +4.5 % · Abschrecken +3.8 % · Fleischermesser +3.7 % · Grillteller mit Braten +2.8 % · Auf den Punkt 0 % · Kohlenschaufel 0 % · Kurze Zündschnur 0 % · Zweiter Gang -2.2 % · Der Nächste, bitte -2.9 % · Anbraten gebunden · Knusprig gebunden

### schorsch-flamme · Pfad 2 · Stufe 20 ·528 Schaden/s · Ausrüstung +203.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 3.4 Schaden/s · 0.2 Heilung/s · Taktgefühl -0.2 Schaden/s · -0.1 Heilung/s · Bastelgrips 0.6 Schaden/s · 0.1 Heilung/s · Dicke Haut 0 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Servieren 25.5 % · Schwenkgrill 19.2 % · Popcorn 18.4 % · Spiritus-Schwall 9.8 % · Grillzange 8.5 % · Autoangriff · Zangenklapper 6.5 % · Glutbrocken 4.1 % · Dampf 3.5 % · Stichflamme 2.5 % · Flambiert 1.7 % · Glutbrand 0.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Gut angefacht +11.2 % · Nachgießen +7.3 % · Zangenklapper im Takt +4.7 % · Spiritus-Schwall +2.8 % · Flambé mit Schuss +1.9 % · Anbraten +1.5 % · Brandbeschleuniger +0.1 % · Heiße Kohlen 0 % · Zangentakt 0 % · Kurze Zündschnur 0 % · Funkensprung -3.2 % · Kohlenschaufel gebunden · Doppelpack gebunden

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

### kaethe-grand · Pfad 2 · Stufe 20 ·571 Schaden/s · Ausrüstung +182.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 3 Schaden/s · -0.1 Heilung/s · Taktgefühl 3.2 Schaden/s · -1.5 Heilung/s · 0.1 verhindert/s · Bastelgrips 0 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Karo 45.9 % · Kreuz 36.7 % · Abrechnen 9.1 % · Autoangriff · Kartenschnipsen 8.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Null ouvert Hand +5.4 % · Mitzählen +4.6 % · Blatt aufgefächert +3.7 % · Kreuz-Bube +3.6 % · Schnipp, schnapp +3 % · Wenzel +1.3 % · Ouvert 0 % · Bis zum Anschlag 0 % · Nullspiel 0 % · Unter der Hand -0.9 % · Kleine Fische -1.7 % · Kleinvieh gebunden · Durchmarsch gebunden

### kaethe-herz · Pfad 0 · Stufe 10 ·158 Schaden/s · Ausrüstung +148.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.1 Schaden/s · -0.2 Heilung/s · Taktgefühl -0.1 Schaden/s · 0.3 Heilung/s · Bastelgrips 0 Schaden/s · 0.6 Heilung/s · Dicke Haut 0 Schaden/s · 0.3 Heilung/s

**Kniffe (Anteil am Schaden):** Karo 59 % · Kreuz 30.5 % · Autoangriff · Kartenschnipsen 10.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Warmer Eierlikör 0 % · Herzensangelegenheit 0 % · Noch eins, dann neu 0 % · Das Herz am rechten Fleck gebunden · Rote Dame gebunden · Nachschenken gebunden · Herzklopfen gebunden · Handlesen gebunden · Lebenslinie gebunden

### kaethe-herz · Pfad 1 · Stufe 10 ·169 Schaden/s · Ausrüstung +136.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1 Schaden/s · Taktgefühl 0.8 Schaden/s · 0.5 Heilung/s · Bastelgrips 0 Schaden/s · 0.3 Heilung/s · Dicke Haut -0.3 Schaden/s

**Kniffe (Anteil am Schaden):** Karo 55.2 % · Kreuz 27 % · Autoangriff · Kartenschnipsen 13.2 % · Pik 4.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Masche für Masche 0 % · Doppelt gemauert 0 % · Nichts verschenken -3.5 % · Pik auf die Brust gebunden · Letzte Masche gebunden · Pik-Ass gebunden · Mauern gebunden · Pik mit Stachel gebunden · Pik-Kette gebunden

### kaethe-herz · Pfad 2 · Stufe 10 ·166 Schaden/s · Ausrüstung +152.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1.3 Schaden/s · -0.2 Heilung/s · Taktgefühl 0.2 Schaden/s · -0.1 Heilung/s · Bastelgrips 0 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Karo 62.3 % · Kreuz 28 % · Autoangriff · Kartenschnipsen 9.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Legekreis im Gehen 0 % · Zukunft gesehen 0 % · Kartenlegen 0 % · Sterne lesen gebunden · Farbe halten gebunden · Wahrsagekugel gebunden · Blick über die Schulter gebunden · Hab ich kommen sehen gebunden · Kaffeefahrt gebunden

### kaethe-herz · Pfad 0 · Stufe 20 ·234 Schaden/s · Ausrüstung +206.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 0.8 Schaden/s · -0.2 Heilung/s · Taktgefühl 0.5 Schaden/s · -0.3 Heilung/s · Bastelgrips 0 Schaden/s · 0.2 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Karo 56.7 % · Kreuz 31.9 % · Autoangriff · Kartenschnipsen 11.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Pik auf die Brust +1.6 % · Sterne lesen +0.8 % · Rote Dame 0 % · Nachschenken 0 % · Herzklopfen 0 % · Handlesen 0 % · Lebenslinie 0 % · Warmer Eierlikör 0 % · Noch eins, dann neu 0 % · Rote Rechnung 0 % · Letzte Masche 0 % · Das Herz am rechten Fleck gebunden · Herzensangelegenheit gebunden

### kaethe-herz · Pfad 1 · Stufe 20 ·257 Schaden/s · Ausrüstung +193.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1 Schaden/s · 0.9 Heilung/s · Taktgefühl 0.9 Schaden/s · 1 Heilung/s · Bastelgrips 0 Schaden/s · 0.3 Heilung/s · Dicke Haut -0.1 Schaden/s

**Kniffe (Anteil am Schaden):** Karo 55.4 % · Kreuz 28.6 % · Autoangriff · Kartenschnipsen 12.4 % · Pik 3.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Pik mit Stachel +1.5 % · Sterne lesen +0.9 % · Letzte Masche 0 % · Pik-Ass 0 % · Mauern 0 % · Pik-Kette 0 % · Masche für Masche 0 % · Doppelt gemauert 0 % · Schutzbrief 0 % · Das Herz am rechten Fleck 0 % · Rote Dame 0 % · Pik auf die Brust gebunden · Nichts verschenken gebunden

### kaethe-herz · Pfad 2 · Stufe 20 ·238 Schaden/s · Ausrüstung +206.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit 0 Schaden/s · Wumms 1 Schaden/s · Taktgefühl 0.2 Schaden/s · -0.2 Heilung/s · Bastelgrips 0 Schaden/s · 0.3 Heilung/s · Dicke Haut 0 Schaden/s

**Kniffe (Anteil am Schaden):** Karo 57.4 % · Kreuz 31.5 % · Autoangriff · Kartenschnipsen 11.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Pik auf die Brust +3 % · Kaffeefahrt +1.1 % · Farbe halten 0 % · Wahrsagekugel 0 % · Blick über die Schulter 0 % · Hab ich kommen sehen 0 % · Legekreis im Gehen 0 % · Kartenlegen 0 % · Die Karten lügen nie 0 % · Das Herz am rechten Fleck 0 % · Rote Dame 0 % · Sterne lesen gebunden · Zukunft gesehen gebunden

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

