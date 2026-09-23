# Balance-Sheet

Automatisch erzeugt von `npm run balance:sheet` · 2026-09-23 · 40 s Übungskampf, jede Zelle als Mittel aus Einzelziel (Boss) und drei Zielen (Feldgruppe), Zerlegung gegen zwei Ziele, feste Prioritäten-Rotation (Heiler heilen zuerst), Puppen treffen jede Sekunde mit 3 % des Grundlebens. Voller Ausrüstungssatz auf Charakterstufe (Werteprofile im Wechsel); „Startausrüstung“ = Flasche, Topfdeckel, Schleuder, Kutte. Talentpfad 0–2 über `pathBuild`, Stufe 1 ohne Spezialisierung.

Jede Rolle misst sich an ihrer Kennzahl: **Schaden** → Schaden/s, **Heilung** → Heilung/s (Ausstoß inkl. Überheilung), **Tank** → Schutz/s (verhinderter Schaden + Deckung). Zelle: Kennzahl (Abweichung vom Median der Rolle auf dieser Stufe × Ausrüstung). ⚑ = mehr als 15 % daneben (ab Stufe 5).

## Überblick

209 von 540 Messungen liegen mehr als 15 % neben dem Median ihrer Rolle.

## Ausrüstung: Startausrüstung

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 53 (+2.1 %) | 133 (-11.1 %) | 153 (-11.7 %) | 199 (-6.3 %) | 235 (-3.2 %) | 311 (-15.3 %) ⚑ |
| dieter-brawl | 1 | 53 (+2.1 %) | 184 (+22.8 %) ⚑ | 196 (+12.7 %) | 284 (+33.3 %) ⚑ | 322 (+32.8 %) ⚑ | 444 (+20.8 %) ⚑ |
| dieter-brawl | 2 | 53 (+2.1 %) | 156 (+4.5 %) | 143 (-18 %) ⚑ | 201 (-5.5 %) | 208 (-14.3 %) | 368 (+0.2 %) |
| baerbel-feedback | 0 | 52 (0 %) | 154 (+2.9 %) | 176 (+1.2 %) | 188 (-11.8 %) | 199 (-17.9 %) ⚑ | 277 (-24.5 %) ⚑ |
| baerbel-feedback | 1 | 52 (0 %) | 156 (+4.2 %) | 176 (+1.2 %) | 191 (-10.4 %) | 215 (-11.4 %) | 297 (-19.2 %) ⚑ |
| baerbel-feedback | 2 | 52 (0 %) | 179 (+20.1 %) ⚑ | 223 (+28.1 %) ⚑ | 285 (+33.9 %) ⚑ | 313 (+29.2 %) ⚑ | 374 (+1.9 %) |
| baerbel-stage | 0 | 52 (0 %) | 121 (-19.1 %) ⚑ | 172 (-1.1 %) | 251 (+18 %) ⚑ | 285 (+17.4 %) ⚑ | 356 (-3 %) |
| baerbel-stage | 1 | 52 (0 %) | 134 (-10.6 %) | 199 (+14.6 %) | 213 (0 %) | 242 (0 %) | 325 (-11.5 %) |
| baerbel-stage | 2 | 52 (0 %) | 134 (-10.4 %) | 163 (-6.2 %) | 205 (-3.6 %) | 243 (+0.4 %) | 310 (-15.5 %) ⚑ |
| kevin-fuse | 0 | 47 (-9.6 %) | 122 (-18.7 %) ⚑ | 138 (-20.5 %) ⚑ | 159 (-25.4 %) ⚑ | 186 (-23.2 %) ⚑ | 370 (+0.8 %) |
| kevin-fuse | 1 | 47 (-9.6 %) | 144 (-3.5 %) | 163 (-6.4 %) | 223 (+4.7 %) | 272 (+12.3 %) | 392 (+6.6 %) |
| kevin-fuse | 2 | 47 (-9.6 %) | 118 (-21.2 %) ⚑ | 137 (-21.3 %) ⚑ | 214 (+0.5 %) | 242 (0 %) | 430 (+17.1 %) ⚑ |
| kevin-hunt | 0 | 47 (-9.6 %) | 149 (0 %) | 191 (+10 %) | 251 (+17.8 %) ⚑ | 288 (+18.7 %) ⚑ | 367 (0 %) |
| kevin-hunt | 1 | 47 (-9.6 %) | 149 (0 %) | 174 (0 %) | 198 (-7 %) | 229 (-5.5 %) | 296 (-19.4 %) ⚑ |
| kevin-hunt | 2 | 47 (-9.6 %) | 149 (0 %) | 174 (0 %) | 278 (+30.5 %) ⚑ | 320 (+31.8 %) ⚑ | 436 (+18.7 %) ⚑ |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 8 (-77.1 %) ⚑ | 43 (-23.2 %) ⚑ | 65 (-31.3 %) ⚑ | 89 (-23.1 %) ⚑ | 95 (-44.3 %) ⚑ |
| dieter-brew | 1 | 0 (-100 %) | 19 (-41.3 %) ⚑ | 56 (0 %) | 131 (+39.8 %) ⚑ | 154 (+33.2 %) ⚑ | 209 (+22.6 %) ⚑ |
| dieter-brew | 2 | 0 (-100 %) | 14 (-56.3 %) ⚑ | 40 (-28.3 %) ⚑ | 47 (-49.7 %) ⚑ | 67 (-41.8 %) ⚑ | 89 (-47.7 %) ⚑ |
| baerbel-care | 0 | 0 (-100 %) | 50 (+53.8 %) ⚑ | 70 (+25.4 %) ⚑ | 94 (0 %) | 115 (0 %) | 166 (-2.6 %) |
| baerbel-care | 1 | 0 (-100 %) | 33 (0 %) | 44 (-20.4 %) ⚑ | 93 (-1.2 %) | 104 (-10.2 %) | 171 (0 %) |
| baerbel-care | 2 | 0 (-100 %) | 43 (+30 %) ⚑ | 56 (+1.1 %) | 125 (+33.5 %) ⚑ | 175 (+52.3 %) ⚑ | 248 (+45.3 %) ⚑ |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 4 (0 %) | 38 (+27.2 %) ⚑ | 50 (+17.6 %) ⚑ | 51 (-1.7 %) | 65 (+4.2 %) | 91 (0 %) |
| dieter-wall | 1 | 4 (0 %) | 17 (-43.6 %) ⚑ | 26 (-39.9 %) ⚑ | 60 (+14.2 %) | 72 (+15.8 %) ⚑ | 97 (+6.7 %) |
| dieter-wall | 2 | 4 (0 %) | 18 (-40.3 %) ⚑ | 24 (-44.8 %) ⚑ | 49 (-5.9 %) | 62 (0 %) | 97 (+5.9 %) |
| kevin-iron | 0 | 3 (-25 %) | 30 (0 %) | 43 (0 %) | 52 (0 %) | 59 (-5.3 %) | 78 (-14.9 %) |
| kevin-iron | 1 | 3 (-25 %) | 30 (0 %) | 43 (0 %) | 52 (0 %) | 59 (-5.3 %) | 78 (-14.9 %) |
| kevin-iron | 2 | 3 (-25 %) | 30 (+1.7 %) | 39 (-7.7 %) | 46 (-12.3 %) | 59 (-5 %) | 76 (-16.5 %) ⚑ |

## Ausrüstung: ungewöhnlich

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 81 (+1.8 %) | 279 (+2.8 %) | 463 (-1.9 %) | 635 (-21.3 %) ⚑ | 854 (-24.9 %) ⚑ | 1433 (-29.7 %) ⚑ |
| dieter-brawl | 1 | 81 (+1.8 %) | 388 (+42.8 %) ⚑ | 599 (+26.8 %) ⚑ | 1103 (+36.8 %) ⚑ | 1531 (+34.6 %) ⚑ | 2724 (+33.6 %) ⚑ |
| dieter-brawl | 2 | 81 (+1.8 %) | 278 (+2.3 %) | 428 (-9.5 %) | 721 (-10.6 %) | 1079 (-5.2 %) | 2067 (+1.3 %) |
| baerbel-feedback | 0 | 80 (0 %) | 296 (+9 %) | 457 (-3.3 %) | 698 (-13.5 %) | 1003 (-11.9 %) | 1734 (-15 %) |
| baerbel-feedback | 1 | 80 (0 %) | 290 (+6.9 %) | 441 (-6.6 %) | 683 (-15.4 %) ⚑ | 946 (-16.8 %) ⚑ | 1743 (-14.5 %) |
| baerbel-feedback | 2 | 80 (0 %) | 327 (+20.3 %) ⚑ | 562 (+18.9 %) ⚑ | 908 (+12.6 %) | 1224 (+7.6 %) | 1979 (-3 %) |
| baerbel-stage | 0 | 80 (0 %) | 276 (+1.5 %) | 530 (+12.2 %) | 847 (+5 %) | 1161 (+2.1 %) | 2046 (+0.3 %) |
| baerbel-stage | 1 | 80 (0 %) | 262 (-3.4 %) | 552 (+16.9 %) ⚑ | 865 (+7.3 %) | 1184 (+4.1 %) | 2035 (-0.2 %) |
| baerbel-stage | 2 | 80 (0 %) | 263 (-3.2 %) | 442 (-6.3 %) | 700 (-13.2 %) | 993 (-12.7 %) | 1729 (-15.2 %) ⚑ |
| kevin-fuse | 0 | 72 (-9.3 %) | 220 (-19.1 %) ⚑ | 428 (-9.4 %) | 607 (-24.8 %) ⚑ | 922 (-19 %) ⚑ | 2190 (+7.4 %) |
| kevin-fuse | 1 | 72 (-9.3 %) | 271 (-0.1 %) | 478 (+1.2 %) | 846 (+4.9 %) | 1379 (+21.3 %) ⚑ | 2774 (+36 %) ⚑ |
| kevin-fuse | 2 | 72 (-9.3 %) | 227 (-16.5 %) ⚑ | 401 (-15.1 %) ⚑ | 819 (+1.5 %) | 1137 (0 %) | 2444 (+19.8 %) ⚑ |
| kevin-hunt | 0 | 72 (-9.3 %) | 272 (0 %) | 472 (0 %) | 807 (0 %) | 1279 (+12.4 %) | 2113 (+3.6 %) |
| kevin-hunt | 1 | 72 (-9.3 %) | 272 (0 %) | 484 (+2.5 %) | 706 (-12.4 %) | 970 (-14.7 %) | 1826 (-10.5 %) |
| kevin-hunt | 2 | 72 (-9.3 %) | 272 (0 %) | 484 (+2.5 %) | 864 (+7.1 %) | 1253 (+10.2 %) | 2039 (0 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 18 (-62.8 %) ⚑ | 74 (-3.9 %) | 172 (0 %) | 274 (0 %) | 491 (+2.7 %) |
| dieter-brew | 1 | 0 (-100 %) | 30 (-36.2 %) ⚑ | 112 (+45.8 %) ⚑ | 277 (+61.2 %) ⚑ | 411 (+50 %) ⚑ | 714 (+49.5 %) ⚑ |
| dieter-brew | 2 | 0 (-100 %) | 32 (-31.5 %) ⚑ | 109 (+42.2 %) ⚑ | 170 (-1 %) | 274 (-0.1 %) | 443 (-7.3 %) |
| baerbel-care | 0 | 0 (-100 %) | 61 (+28.9 %) ⚑ | 77 (0 %) | 128 (-25.3 %) ⚑ | 153 (-44.2 %) ⚑ | 299 (-37.4 %) ⚑ |
| baerbel-care | 1 | 0 (-100 %) | 47 (0 %) | 61 (-20.6 %) ⚑ | 140 (-18.5 %) ⚑ | 185 (-32.7 %) ⚑ | 317 (-33.7 %) ⚑ |
| baerbel-care | 2 | 0 (-100 %) | 51 (+9.4 %) | 75 (-2.5 %) | 175 (+1.6 %) | 283 (+3 %) | 478 (0 %) |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 8 (0 %) | 36 (+30.5 %) ⚑ | 43 (+14.3 %) | 54 (0 %) | 64 (0 %) | 84 (0 %) |
| dieter-wall | 1 | 8 (0 %) | 26 (-5.9 %) | 38 (-0.3 %) | 56 (+2.2 %) | 65 (+2.2 %) | 86 (+2.3 %) |
| dieter-wall | 2 | 8 (0 %) | 24 (-10.3 %) | 29 (-22.2 %) ⚑ | 55 (+1.7 %) | 65 (+2 %) | 86 (+2.3 %) |
| kevin-iron | 0 | 7 (-12.5 %) | 27 (0 %) | 38 (0 %) | 43 (-20.2 %) ⚑ | 52 (-18.6 %) ⚑ | 67 (-19.9 %) ⚑ |
| kevin-iron | 1 | 7 (-12.5 %) | 27 (0 %) | 38 (0 %) | 43 (-20.2 %) ⚑ | 52 (-18.6 %) ⚑ | 67 (-19.9 %) ⚑ |
| kevin-iron | 2 | 7 (-12.5 %) | 28 (+1.5 %) | 37 (-1.1 %) | 43 (-21.3 %) ⚑ | 53 (-17.5 %) ⚑ | 66 (-21 %) ⚑ |

## Ausrüstung: selten

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 94 (+1.8 %) | 361 (+5.7 %) | 562 (-2.5 %) | 739 (-30.7 %) ⚑ | 1061 (-27.5 %) ⚑ | 1914 (-31.9 %) ⚑ |
| dieter-brawl | 1 | 94 (+1.8 %) | 472 (+38.2 %) ⚑ | 751 (+30.2 %) ⚑ | 1390 (+30.4 %) ⚑ | 1931 (+32 %) ⚑ | 3611 (+28.6 %) ⚑ |
| dieter-brawl | 2 | 94 (+1.8 %) | 398 (+16.5 %) ⚑ | 519 (-10 %) | 908 (-14.8 %) | 1352 (-7.6 %) | 2734 (-2.7 %) |
| baerbel-feedback | 0 | 92 (0 %) | 372 (+8.9 %) | 555 (-3.7 %) | 899 (-15.7 %) ⚑ | 1292 (-11.7 %) | 2358 (-16 %) ⚑ |
| baerbel-feedback | 1 | 92 (0 %) | 365 (+6.8 %) | 542 (-6 %) | 1066 (0 %) | 1361 (-7 %) | 2632 (-6.3 %) |
| baerbel-feedback | 2 | 92 (0 %) | 463 (+35.6 %) ⚑ | 680 (+18 %) ⚑ | 1282 (+20.3 %) ⚑ | 1734 (+18.5 %) ⚑ | 2970 (+5.7 %) |
| baerbel-stage | 0 | 92 (0 %) | 341 (0 %) | 642 (+11.3 %) | 1129 (+5.9 %) | 1461 (-0.2 %) | 2837 (+1 %) |
| baerbel-stage | 1 | 92 (0 %) | 350 (+2.6 %) | 665 (+15.4 %) ⚑ | 1080 (+1.3 %) | 1498 (+2.3 %) | 2686 (-4.4 %) |
| baerbel-stage | 2 | 92 (0 %) | 328 (-4 %) | 538 (-6.7 %) | 853 (-20 %) ⚑ | 1463 (0 %) | 2363 (-15.9 %) ⚑ |
| kevin-fuse | 0 | 85 (-8.3 %) | 258 (-24.3 %) ⚑ | 498 (-13.5 %) | 810 (-24.1 %) ⚑ | 1170 (-20.1 %) ⚑ | 2916 (+3.8 %) |
| kevin-fuse | 1 | 85 (-8.3 %) | 337 (-1.4 %) | 585 (+1.6 %) | 1278 (+19.9 %) ⚑ | 1758 (+20.1 %) ⚑ | 3707 (+32 %) ⚑ |
| kevin-fuse | 2 | 85 (-8.3 %) | 267 (-21.7 %) ⚑ | 478 (-17.1 %) ⚑ | 1053 (-1.2 %) | 1509 (+3.1 %) | 3434 (+22.3 %) ⚑ |
| kevin-hunt | 0 | 85 (-8.3 %) | 325 (-4.7 %) | 631 (+9.5 %) | 1132 (+6.2 %) | 1638 (+11.9 %) | 3265 (+16.2 %) ⚑ |
| kevin-hunt | 1 | 85 (-8.3 %) | 325 (-4.7 %) | 576 (0 %) | 934 (-12.4 %) | 1337 (-8.6 %) | 2458 (-12.5 %) |
| kevin-hunt | 2 | 85 (-8.3 %) | 325 (-4.7 %) | 576 (0 %) | 1115 (+4.5 %) | 1527 (+4.4 %) | 2809 (0 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 23 (-50.8 %) ⚑ | 88 (-8.1 %) | 271 (+13.5 %) | 413 (+14.8 %) | 691 (+1.1 %) |
| dieter-brew | 1 | 0 (-100 %) | 36 (-24.4 %) ⚑ | 124 (+29.3 %) ⚑ | 387 (+62.2 %) ⚑ | 485 (+34.7 %) ⚑ | 1008 (+47.6 %) ⚑ |
| dieter-brew | 2 | 0 (-100 %) | 44 (-8.6 %) | 134 (+39.9 %) ⚑ | 238 (0 %) | 360 (0 %) | 683 (0 %) |
| baerbel-care | 0 | 0 (-100 %) | 60 (+25.4 %) ⚑ | 96 (0 %) | 127 (-46.9 %) ⚑ | 164 (-54.4 %) ⚑ | 365 (-46.6 %) ⚑ |
| baerbel-care | 1 | 0 (-100 %) | 48 (0 %) | 66 (-31.6 %) ⚑ | 159 (-33.3 %) ⚑ | 213 (-40.9 %) ⚑ | 387 (-43.4 %) ⚑ |
| baerbel-care | 2 | 0 (-100 %) | 53 (+10.3 %) | 80 (-16.2 %) ⚑ | 199 (-16.4 %) ⚑ | 343 (-4.8 %) | 540 (-21 %) ⚑ |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 8 (0 %) | 34 (+27 %) ⚑ | 44 (+15.1 %) ⚑ | 53 (0 %) | 61 (0 %) | 82 (0 %) |
| dieter-wall | 1 | 8 (0 %) | 27 (-0.7 %) | 37 (-2.9 %) | 54 (+2.1 %) | 62 (+2 %) | 84 (+2.1 %) |
| dieter-wall | 2 | 8 (0 %) | 27 (-0.4 %) | 31 (-19 %) ⚑ | 54 (+2.1 %) | 62 (+2 %) | 84 (+2.1 %) |
| kevin-iron | 0 | 7 (-12.5 %) | 27 (0 %) | 38 (0 %) | 42 (-19.4 %) ⚑ | 52 (-14.7 %) | 64 (-22.1 %) ⚑ |
| kevin-iron | 1 | 7 (-12.5 %) | 27 (0 %) | 38 (0 %) | 42 (-19.4 %) ⚑ | 52 (-14.7 %) | 64 (-22.1 %) ⚑ |
| kevin-iron | 2 | 7 (-12.5 %) | 29 (+9.4 %) | 37 (-1.1 %) | 44 (-16.4 %) ⚑ | 49 (-20.8 %) ⚑ | 71 (-13.9 %) |

## Ausrüstung: episch

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 123 (+0.9 %) | 399 (-12 %) | 686 (-12.6 %) | 1037 (-27.4 %) ⚑ | 1389 (-29.7 %) ⚑ | 2799 (-22.5 %) ⚑ |
| dieter-brawl | 1 | 123 (+0.9 %) | 567 (+25 %) ⚑ | 897 (+14.3 %) | 2113 (+47.9 %) ⚑ | 2568 (+29.9 %) ⚑ | 5176 (+43.4 %) ⚑ |
| dieter-brawl | 2 | 123 (+0.9 %) | 454 (0 %) | 748 (-4.6 %) | 1309 (-8.4 %) | 1963 (-0.7 %) | 4048 (+12.1 %) |
| baerbel-feedback | 0 | 122 (0 %) | 490 (+7.9 %) | 785 (0 %) | 1243 (-13 %) | 1718 (-13.1 %) | 3123 (-13.5 %) |
| baerbel-feedback | 1 | 122 (0 %) | 485 (+6.9 %) | 763 (-2.7 %) | 1429 (0 %) | 1977 (0 %) | 3168 (-12.3 %) |
| baerbel-feedback | 2 | 122 (0 %) | 561 (+23.7 %) ⚑ | 941 (+19.9 %) ⚑ | 1699 (+18.9 %) ⚑ | 2304 (+16.5 %) ⚑ | 3511 (-2.8 %) |
| baerbel-stage | 0 | 122 (0 %) | 445 (-1.9 %) | 792 (+1 %) | 1642 (+14.9 %) | 2009 (+1.7 %) | 4067 (+12.7 %) |
| baerbel-stage | 1 | 122 (0 %) | 430 (-5.2 %) | 873 (+11.3 %) | 1314 (-8 %) | 1971 (-0.3 %) | 3610 (0 %) |
| baerbel-stage | 2 | 122 (0 %) | 421 (-7.2 %) | 727 (-7.4 %) | 1266 (-11.4 %) | 1714 (-13.3 %) | 3366 (-6.8 %) |
| kevin-fuse | 0 | 111 (-8.3 %) | 390 (-14 %) | 637 (-18.8 %) ⚑ | 1138 (-20.3 %) ⚑ | 1661 (-16 %) ⚑ | 3693 (+2.3 %) |
| kevin-fuse | 1 | 111 (-8.3 %) | 432 (-4.7 %) | 810 (+3.3 %) | 1719 (+20.4 %) ⚑ | 2621 (+32.6 %) ⚑ | 4763 (+31.9 %) ⚑ |
| kevin-fuse | 2 | 111 (-8.3 %) | 387 (-14.6 %) | 618 (-21.2 %) ⚑ | 1475 (+3.2 %) | 2196 (+11.1 %) | 4123 (+14.2 %) |
| kevin-hunt | 0 | 111 (-8.3 %) | 481 (+6 %) | 775 (-1.2 %) | 1565 (+9.5 %) | 2356 (+19.2 %) ⚑ | 4052 (+12.2 %) |
| kevin-hunt | 1 | 111 (-8.3 %) | 481 (+6 %) | 793 (+1.1 %) | 1328 (-7 %) | 1963 (-0.7 %) | 3460 (-4.2 %) |
| kevin-hunt | 2 | 111 (-8.3 %) | 481 (+6 %) | 793 (+1.1 %) | 1464 (+2.5 %) | 2060 (+4.2 %) | 3576 (-0.9 %) |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 33 (-42.7 %) ⚑ | 109 (0 %) | 326 (0 %) | 584 (+8.7 %) | 1057 (0 %) |
| dieter-brew | 1 | 0 (-100 %) | 45 (-21.5 %) ⚑ | 142 (+29.8 %) ⚑ | 472 (+44.9 %) ⚑ | 723 (+34.6 %) ⚑ | 1584 (+49.9 %) ⚑ |
| dieter-brew | 2 | 0 (-100 %) | 58 (0 %) | 180 (+64.4 %) ⚑ | 345 (+5.9 %) | 537 (0 %) | 1081 (+2.3 %) |
| baerbel-care | 0 | 0 (-100 %) | 60 (+3.6 %) | 78 (-28.3 %) ⚑ | 171 (-47.6 %) ⚑ | 235 (-56.3 %) ⚑ | 480 (-54.6 %) ⚑ |
| baerbel-care | 1 | 0 (-100 %) | 50 (-14 %) | 70 (-35.9 %) ⚑ | 189 (-42 %) ⚑ | 234 (-56.5 %) ⚑ | 543 (-48.6 %) ⚑ |
| baerbel-care | 2 | 0 (-100 %) | 61 (+5.5 %) | 86 (-21.4 %) ⚑ | 257 (-21.2 %) ⚑ | 414 (-23 %) ⚑ | 711 (-32.7 %) ⚑ |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 10 (0 %) | 32 (+7.7 %) | 42 (+12.2 %) | 52 (0 %) | 59 (0 %) | 80 (0 %) |
| dieter-wall | 1 | 10 (0 %) | 31 (+4 %) | 42 (+12.4 %) | 53 (+1.9 %) | 60 (+1.9 %) | 81 (+2 %) |
| dieter-wall | 2 | 10 (0 %) | 28 (-4.7 %) | 35 (-6.5 %) | 53 (+1.5 %) | 60 (+1.9 %) | 81 (+2 %) |
| kevin-iron | 0 | 9 (-10 %) | 29 (-3.7 %) | 37 (0 %) | 42 (-18.2 %) ⚑ | 50 (-16.4 %) ⚑ | 64 (-19.5 %) ⚑ |
| kevin-iron | 1 | 9 (-10 %) | 29 (-3.7 %) | 37 (0 %) | 42 (-18.2 %) ⚑ | 50 (-16.4 %) ⚑ | 64 (-19.5 %) ⚑ |
| kevin-iron | 2 | 9 (-10 %) | 30 (0 %) | 34 (-9.2 %) | 41 (-20.9 %) ⚑ | 52 (-12.8 %) | 60 (-24.4 %) ⚑ |

## Zerlegung (je Pfad, Ausrüstung selten)

### dieter-wall · Pfad 0 · Stufe 10 ·520 Schaden/s · Ausrüstung +232.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.6 Schaden/s · Wumms 2.1 Schaden/s · Taktgefühl -4.7 Schaden/s · Bastelgrips -5.5 Schaden/s · Dicke Haut -2.6 Schaden/s

**Kniffe (Anteil am Schaden):** Rausschmiss 47.7 % · Böller unterm Biertisch 20.8 % · Kronkorken-Kelle 17.5 % · Autoangriff · Flasche kreist 9.6 % · Du schuldest mir Pfand! 4.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Ruhe im Laden 0 % · Tür bleibt zu 0 % · Verlängertes Hausverbot 0 % · Deckelwirtschaft gebunden · Leergut stapeln gebunden · Dicke Haut vom Hausbier gebunden · Kronkorken-Panzer gebunden · Pfand zurück gebunden · Tresenkante gebunden

### dieter-wall · Pfad 1 · Stufe 10 ·462 Schaden/s · Ausrüstung +221.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.1 Schaden/s · Wumms 2 Schaden/s · Taktgefühl 1.1 Schaden/s · Bastelgrips 3.6 Schaden/s · 0.1 verhindert/s · Dicke Haut -2.1 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Rausschmiss 44.7 % · Kronkorken-Kelle 22.3 % · Böller unterm Biertisch 17.6 % · Autoangriff · Flasche kreist 10.8 % · Du schuldest mir Pfand! 4.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Klappe zu, Pegel hoch 0 % · Dritter Deckel gratis 0 % · Kurzer Prozess 0 % · Erst gucken, dann hauen gebunden · Deckel-Reflex gebunden · Doppelte Türkontrolle gebunden · Keiner drängelt gebunden · Konterschlag gebunden · Nachtreten gebunden

### dieter-wall · Pfad 2 · Stufe 10 ·611 Schaden/s · Ausrüstung +251.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -3 Schaden/s · Wumms 2.5 Schaden/s · Taktgefühl -2.4 Schaden/s · Bastelgrips -2.9 Schaden/s · 0.1 verhindert/s · Dicke Haut -2.9 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Rausschmiss 54.7 % · Böller unterm Biertisch 22.2 % · Kronkorken-Kelle 12.9 % · Autoangriff · Flasche kreist 8.2 % · Du schuldest mir Pfand! 2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Platzverweis +9.7 % · Räumungsklage 0 % · Breite Absperrung 0 % · Breite Schultern gebunden · Böllerpfand gebunden · Runde Sache gebunden · Hausbier-Nachschub gebunden · Absperrband gebunden · Heimspiel gebunden

### dieter-wall · Pfad 0 · Stufe 20 ·1225 Schaden/s · Ausrüstung +445 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -6.9 Schaden/s · Wumms 0 Schaden/s · Taktgefühl -6.9 Schaden/s · Bastelgrips -7 Schaden/s · Dicke Haut -6.9 Schaden/s

**Kniffe (Anteil am Schaden):** Rausschmiss 54.9 % · Böller unterm Biertisch 19.1 % · Kronkorken-Kelle 15.9 % · Autoangriff · Flasche kreist 8.4 % · Du schuldest mir Pfand! 1.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Leergut stapeln 0 % · Dicke Haut vom Hausbier 0 % · Kronkorken-Panzer 0 % · Pfand zurück 0 % · Tresenkante 0 % · Ruhe im Laden 0 % · Verlängertes Hausverbot 0 % · Hausverbot für alle 0 % · Erst gucken, dann hauen 0 % · Breite Schultern 0 % · Deckel-Reflex 0 % · Deckelwirtschaft gebunden · Tür bleibt zu gebunden

### dieter-wall · Pfad 1 · Stufe 20 ·1225 Schaden/s · Ausrüstung +456.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -6.9 Schaden/s · Wumms 0 Schaden/s · Taktgefühl -6.9 Schaden/s · Bastelgrips -7 Schaden/s · Dicke Haut -6.9 Schaden/s

**Kniffe (Anteil am Schaden):** Rausschmiss 50.4 % · Böller unterm Biertisch 19.1 % · Kronkorken-Kelle 15.9 % · Autoangriff · Flasche kreist 8.4 % · Rausschmiss 4.5 % · Du schuldest mir Pfand! 1.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Deckelwirtschaft +11.7 % · Breite Schultern +4.7 % · Deckel-Reflex 0 % · Doppelte Türkontrolle 0 % · Keiner drängelt 0 % · Konterschlag 0 % · Nachtreten 0 % · Klappe zu, Pegel hoch 0 % · Kurzer Prozess 0 % · Und tschüss! 0 % · Leergut stapeln 0 % · Erst gucken, dann hauen gebunden · Dritter Deckel gratis gebunden

### dieter-wall · Pfad 2 · Stufe 20 ·1349 Schaden/s · Ausrüstung +399.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -7.6 Schaden/s · Wumms 0 Schaden/s · Taktgefühl -7.6 Schaden/s · Bastelgrips -7.6 Schaden/s · Dicke Haut -7.6 Schaden/s

**Kniffe (Anteil am Schaden):** Rausschmiss 55.8 % · Böller unterm Biertisch 21.7 % · Kronkorken-Kelle 13.5 % · Autoangriff · Flasche kreist 7.6 % · Du schuldest mir Pfand! 1.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Böllerpfand +1.3 % · Räumungsklage +0.7 % · Alle raus! +0.7 % · Runde Sache 0 % · Hausbier-Nachschub 0 % · Absperrband 0 % · Heimspiel 0 % · Breite Absperrung 0 % · Deckelwirtschaft 0 % · Erst gucken, dann hauen 0 % · Deckel-Reflex 0 % · Breite Schultern gebunden · Platzverweis gebunden

### dieter-brawl · Pfad 0 · Stufe 10 ·580 Schaden/s · Ausrüstung +261.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.8 Schaden/s · Wumms 2.4 Schaden/s · Taktgefühl -4 Schaden/s · Bastelgrips -5.3 Schaden/s · Dicke Haut -2.8 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Abriss 69 % · Böller unterm Biertisch 12.4 % · Kronkorken-Kelle 10.5 % · Autoangriff · Flasche kreist 5.8 % · Du schuldest mir Pfand! 2.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kurzer Kater 0 % · Kater verdrängen 0 % · Durchhalten 0 % · Noch einen auf die Zwölf gebunden · Angeschlagen, nicht besoffen gebunden · Nachgeschenkt gebunden · Deckel, Kelle, Pegel gebunden · Sitzfleisch gebunden · Konterbrezel-Reserve gebunden

### dieter-brawl · Pfad 1 · Stufe 10 ·769 Schaden/s · Ausrüstung +279.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -3.6 Schaden/s · Wumms 3.3 Schaden/s · Taktgefühl -4 Schaden/s · Bastelgrips -1.9 Schaden/s · Dicke Haut -3.6 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Abriss 77.9 % · Böller unterm Biertisch 9.4 % · Kronkorken-Kelle 7.4 % · Autoangriff · Flasche kreist 4.4 % · Du schuldest mir Pfand! 1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kneipenschreck 0 % · Abriss mit Ansage 0 % · Zugabe! 0 % · Erste Runde gebunden · Kellenwut gebunden · Volle Kante gebunden · Volltreffer gebunden · Vorglühen gebunden · Dreier-Kelle gebunden

### dieter-brawl · Pfad 2 · Stufe 10 ·533 Schaden/s · Ausrüstung +262.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.4 Schaden/s · Wumms 2.4 Schaden/s · Taktgefühl -0.3 Schaden/s · Bastelgrips 6.9 Schaden/s · Dicke Haut -2.4 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Abriss 60.9 % · Kronkorken-Kelle 12.9 % · Böller unterm Biertisch 10.2 % · Abriss 7.1 % · Autoangriff · Flasche kreist 6.3 % · Du schuldest mir Pfand! 2.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Wurf in die Runde 0 % · Weiter zum Nächsten 0 % · Sprungbrett 0 % · Anlauf nehmen gebunden · Flaschenpost gebunden · Rundumschlag gebunden · Hinterher! gebunden · Tresensprung gebunden · Nachschlag gebunden

### dieter-brawl · Pfad 0 · Stufe 20 ·1100 Schaden/s · Ausrüstung +347.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -6.3 Schaden/s · Wumms 0 Schaden/s · Taktgefühl -6.3 Schaden/s · Bastelgrips -6.3 Schaden/s · Dicke Haut -6.3 Schaden/s

**Kniffe (Anteil am Schaden):** Abriss 66.6 % · Böller unterm Biertisch 14.2 % · Kronkorken-Kelle 11.8 % · Autoangriff · Flasche kreist 6.2 % · Du schuldest mir Pfand! 1.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Erste Runde +4.5 % · Nachgeschenkt +3.7 % · Angeschlagen, nicht besoffen 0 % · Deckel, Kelle, Pegel 0 % · Sitzfleisch 0 % · Konterbrezel-Reserve 0 % · Kurzer Kater 0 % · Durchhalten 0 % · Anlauf nehmen 0 % · Kellenwut 0 % · Zweite Luft -24.2 % · Noch einen auf die Zwölf gebunden · Kater verdrängen gebunden

### dieter-brawl · Pfad 1 · Stufe 20 ·1970 Schaden/s · Ausrüstung +492 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -11.2 Schaden/s · -0.1 verhindert/s · Wumms 0 Schaden/s · -0.1 verhindert/s · Taktgefühl -11.2 Schaden/s · -0.1 verhindert/s · Bastelgrips -11.2 Schaden/s · -0.1 verhindert/s · Dicke Haut -11.2 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Abriss 76.9 % · Böller unterm Biertisch 7.9 % · Kronkorken-Kelle 7.5 % · Autoangriff · Flasche kreist 3.6 % · Pfand auf die Zwölf 3.4 % · Du schuldest mir Pfand! 0.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Blitzabriss +18.1 % · Kellenwut 0 % · Volltreffer 0 % · Vorglühen 0 % · Dreier-Kelle 0 % · Kneipenschreck 0 % · Zugabe! 0 % · Noch einen auf die Zwölf 0 % · Anlauf nehmen 0 % · Angeschlagen, nicht besoffen 0 % · Volle Kante -0.7 % · Erste Runde gebunden · Abriss mit Ansage gebunden

### dieter-brawl · Pfad 2 · Stufe 20 ·1382 Schaden/s · Ausrüstung +531.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -7.9 Schaden/s · -0.1 verhindert/s · Wumms 0 Schaden/s · -0.1 verhindert/s · Taktgefühl -7.9 Schaden/s · -0.1 verhindert/s · Bastelgrips 11.6 Schaden/s · -0.1 verhindert/s · Dicke Haut -7.9 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Abriss 69.8 % · Kronkorken-Kelle 10 % · Böller unterm Biertisch 8.5 % · Autoangriff · Flasche kreist 5.2 % · Abriss 5.1 % · Du schuldest mir Pfand! 1.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Erste Runde +10.8 % · Flaschenpost 0 % · Rundumschlag 0 % · Hinterher! 0 % · Tresensprung 0 % · Nachschlag 0 % · Wurf in die Runde 0 % · Sprungbrett 0 % · Kein Feierabend 0 % · Noch einen auf die Zwölf 0 % · Kellenwut 0 % · Anlauf nehmen gebunden · Weiter zum Nächsten gebunden

### dieter-brew · Pfad 0 · Stufe 10 ·445 Schaden/s · Ausrüstung +213 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2 Schaden/s · -0.2 Heilung/s · Wumms 2 Schaden/s · 0.2 Heilung/s · Taktgefühl 3.1 Schaden/s · 0.4 Heilung/s · -0.1 verhindert/s · Bastelgrips 2 Schaden/s · 0.9 Heilung/s · Dicke Haut -2 Schaden/s · -0.2 Heilung/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Fassanstich 59.3 % · Kronkorken-Kelle 21.8 % · Autoangriff · Flasche kreist 13.1 % · Du schuldest mir Pfand! 5.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Zapfen im Gehen 0 % · Frisch gezapft 0 % · Nächste Runde 0 % · Pils zuerst gebunden · Nachfüllen gebunden · Schaumkrone gebunden · Ruhige Hand gebunden · Drittes Fass gebunden · Zapfhahn auf gebunden

### dieter-brew · Pfad 1 · Stufe 10 ·392 Schaden/s · Ausrüstung +265.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2 Schaden/s · -0.2 Heilung/s · Wumms 1.5 Schaden/s · 0.1 Heilung/s · Taktgefühl -1.9 Schaden/s · -0.2 Heilung/s · Bastelgrips -2.3 Schaden/s · 1 Heilung/s · Dicke Haut -2 Schaden/s · -0.2 Heilung/s

**Kniffe (Anteil am Schaden):** Fassanstich 56.2 % · Kronkorken-Kelle 24.8 % · Autoangriff · Flasche kreist 13.6 % · Du schuldest mir Pfand! 5.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Runde aufs Haus 0 % · Letzte Runde heilt 0 % · Großes Fass 0 % · Weizenkur gebunden · Nachschank gebunden · Nichts wegkippen gebunden · Deckel und Pflaster gebunden · Katerfass gebunden · Tropfen für Tropfen gebunden

### dieter-brew · Pfad 2 · Stufe 10 ·518 Schaden/s · Ausrüstung +217.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.5 Schaden/s · -0.4 Heilung/s · Wumms 2 Schaden/s · 0.4 Heilung/s · Taktgefühl -1.3 Schaden/s · -0.3 Heilung/s · Bastelgrips 2.1 Schaden/s · 1.4 Heilung/s · Dicke Haut -2.5 Schaden/s · -0.4 Heilung/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Fassanstich 42.4 % · Kronkorken-Kelle 22.5 % · Fassanstich 14.3 % · Autoangriff · Flasche kreist 10.3 % · Du schuldest mir Pfand! 6.7 % · Pfand auf die Zwölf 3.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Bock auf mehr +9.3 % · Gut gekühlt 0 % · Scherben bringen Glück 0 % · Rücklaufleitung gebunden · Bock zuerst gebunden · Breiter Ausschank gebunden · Pfand mit Zinsen gebunden · Bock drauf gebunden · Restbestand gebunden

### dieter-brew · Pfad 0 · Stufe 20 ·1135 Schaden/s · Ausrüstung +516.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -6.5 Schaden/s · -1.6 Heilung/s · -0.1 verhindert/s · Wumms 0 Schaden/s · -0.1 verhindert/s · Taktgefühl -2.8 Schaden/s · -3.9 Heilung/s · 0.1 verhindert/s · Bastelgrips -15.2 Schaden/s · -1.4 Heilung/s · 0.2 verhindert/s · Dicke Haut -6.5 Schaden/s · -1.6 Heilung/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Fassanstich 74.5 % · Autoangriff · Flasche kreist 11.9 % · Kronkorken-Kelle 9.8 % · Du schuldest mir Pfand! 3.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Ruhige Hand +8.3 % · Anstich mit Schwung +2.1 % · Zapfhahn auf +0.1 % · Nachfüllen 0 % · Drittes Fass 0 % · Zapfen im Gehen 0 % · Nächste Runde 0 % · Weizenkur 0 % · Nachschank 0 % · Rücklaufleitung -2.9 % · Schaumkrone -5.6 % · Pils zuerst gebunden · Frisch gezapft gebunden

### dieter-brew · Pfad 1 · Stufe 20 ·895 Schaden/s · Ausrüstung +478.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -5.1 Schaden/s · -1.1 Heilung/s · Wumms 0 Schaden/s · Taktgefühl -4.6 Schaden/s · -1 Heilung/s · Bastelgrips -5.7 Schaden/s · 4.3 Heilung/s · Dicke Haut -5.1 Schaden/s · -1.1 Heilung/s

**Kniffe (Anteil am Schaden):** Fassanstich 63 % · Kronkorken-Kelle 20.1 % · Autoangriff · Flasche kreist 13.9 % · Du schuldest mir Pfand! 3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Pils zuerst +2.3 % · Nachschank 0 % · Deckel und Pflaster 0 % · Katerfass 0 % · Tropfen für Tropfen 0 % · Runde aufs Haus 0 % · Großes Fass 0 % · Rücklaufleitung 0 % · Nachfüllen 0 % · Anstich für alle -5.3 % · Nichts wegkippen -14.8 % · Weizenkur gebunden · Letzte Runde heilt gebunden

### dieter-brew · Pfad 2 · Stufe 20 ·1182 Schaden/s · Ausrüstung +443.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -6.7 Schaden/s · -1.4 Heilung/s · -0.1 verhindert/s · Wumms 0 Schaden/s · -0.1 verhindert/s · Taktgefühl -2 Schaden/s · -0.8 Heilung/s · -0.1 verhindert/s · Bastelgrips 5.2 Schaden/s · 1.9 Heilung/s · -0.1 verhindert/s · Dicke Haut -6.7 Schaden/s · -1.4 Heilung/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Fassanstich 47.7 % · Kronkorken-Kelle 21.1 % · Fassanstich 13.6 % · Autoangriff · Flasche kreist 9.6 % · Du schuldest mir Pfand! 4.3 % · Pfand auf die Zwölf 3.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Bock auf mehr +11.3 % · Letzter Ausschank +3.9 % · Pfand mit Zinsen +0.8 % · Bock zuerst 0 % · Breiter Ausschank 0 % · Bock drauf 0 % · Restbestand 0 % · Scherben bringen Glück 0 % · Pils zuerst 0 % · Weizenkur 0 % · Nachfüllen 0 % · Rücklaufleitung gebunden · Gut gekühlt gebunden

### baerbel-care · Pfad 0 · Stufe 10 ·507 Schaden/s · Ausrüstung +277.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.3 Schaden/s · Wumms 2.3 Schaden/s · Taktgefühl -1.1 Schaden/s · 0.2 Heilung/s · Bastelgrips -2.3 Schaden/s · 0.9 Heilung/s · Dicke Haut -2.3 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Großreinemachen 76.7 % · Pinsel-Piekser 12.2 % · Autoangriff · Dauersprühen 8.3 % · Fleckentest, Schätzchen! 2.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Gründlich, nicht schnell 0 % · Sanfte Versiegelung 0 % · Löffel in der Schürze 0 % · Warme Schüssel gebunden · Nachschlag gebunden · Das sechste Glas gebunden · Ein Schluck, ein Plan gebunden · Notration gebunden · Nebenbei umgerührt gebunden

### baerbel-care · Pfad 1 · Stufe 10 ·497 Schaden/s · Ausrüstung +335.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.2 Schaden/s · Wumms 2.3 Schaden/s · Taktgefühl -0.6 Schaden/s · 0.2 Heilung/s · Bastelgrips 0.8 Schaden/s · 0.6 Heilung/s · Dicke Haut -2.2 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Großreinemachen 73.4 % · Pinsel-Piekser 13.7 % · Autoangriff · Dauersprühen 8.4 % · Fleckentest, Schätzchen! 4.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nachgelegt 0 % · Vom Herd aus 0 % · Anbau mit Fußbodenheilung 0 % · Giselas Ruf gebunden · Brutpflege gebunden · Freilaufgans gebunden · Gisela, hierher! gebunden · Thermomix-Tafel gebunden · Am Tisch wird gegessen gebunden

### baerbel-care · Pfad 2 · Stufe 10 ·514 Schaden/s · Ausrüstung +251.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.3 Schaden/s · Wumms 2.4 Schaden/s · Taktgefühl -1.8 Schaden/s · 0.1 Heilung/s · Bastelgrips -2.3 Schaden/s · 0.8 Heilung/s · Dicke Haut -2.3 Schaden/s

**Kniffe (Anteil am Schaden):** Großreinemachen 61.5 % · Pinsel-Piekser 25.3 % · Autoangriff · Dauersprühen 8.6 % · Fleckentest, Schätzchen! 4.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Blitzblank 0 % · Restfleck 0 % · Frisch aufgetragen -0.7 % · Spüli ins Auge gebunden · Frisch gewischt gebunden · Nichts wird weggekippt gebunden · Schrubben heilt gebunden · Deckel auf die Schüssel gebunden · Landfrauen-Glanz gebunden

### baerbel-care · Pfad 0 · Stufe 20 ·1202 Schaden/s · Ausrüstung +726.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -9.6 Schaden/s · -0.1 verhindert/s · Wumms -3 Schaden/s · -0.1 verhindert/s · Taktgefühl -6.8 Schaden/s · -0.1 verhindert/s · Bastelgrips -9.6 Schaden/s · 1.2 Heilung/s · -0.1 verhindert/s · Dicke Haut -9.6 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Großreinemachen 75.7 % · Pinsel-Piekser 13.2 % · Autoangriff · Dauersprühen 7.8 % · Fleckentest, Schätzchen! 3.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nachschlag +4.5 % · Giselas Ruf +4.3 % · Frisch gewischt +3.9 % · Nicht ohne meine Mädels +3.5 % · Ein Schluck, ein Plan +2.2 % · Nebenbei umgerührt +2.2 % · Das sechste Glas 0 % · Notration 0 % · Gründlich, nicht schnell 0 % · Löffel in der Schürze 0 % · Spüli ins Auge 0 % · Warme Schüssel gebunden · Sanfte Versiegelung gebunden

### baerbel-care · Pfad 1 · Stufe 20 ·1003 Schaden/s · Ausrüstung +587.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -5.9 Schaden/s · -0.1 verhindert/s · Wumms -0.2 Schaden/s · -0.1 verhindert/s · Taktgefühl -5.7 Schaden/s · -0.1 verhindert/s · Bastelgrips -5.9 Schaden/s · 1.5 Heilung/s · -0.1 verhindert/s · Dicke Haut -5.9 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Großreinemachen 70 % · Pinsel-Piekser 17.2 % · Autoangriff · Dauersprühen 8.9 % · Fleckentest, Schätzchen! 4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Frisch gewischt +10.1 % · Brutpflege 0 % · Freilaufgans 0 % · Gisela, hierher! 0 % · Thermomix-Tafel 0 % · Am Tisch wird gegessen 0 % · Nachgelegt 0 % · Anbau mit Fußbodenheilung 0 % · Warme Schüssel 0 % · Spüli ins Auge 0 % · Gänsehaut-Finale -10.7 % · Giselas Ruf gebunden · Vom Herd aus gebunden

### baerbel-care · Pfad 2 · Stufe 20 ·1088 Schaden/s · Ausrüstung +546.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -6.2 Schaden/s · Wumms 0 Schaden/s · Taktgefühl -6.2 Schaden/s · Bastelgrips -7.4 Schaden/s · 2.4 Heilung/s · Dicke Haut -6.2 Schaden/s

**Kniffe (Anteil am Schaden):** Großreinemachen 59.7 % · Pinsel-Piekser 29.2 % · Autoangriff · Dauersprühen 8.2 % · Fleckentest, Schätzchen! 2.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Frisch aufgetragen +15.5 % · Frisch gewischt +13.9 % · Nachschlag +3 % · Schlussputz +2.2 % · Giselas Ruf +0.4 % · Nichts wird weggekippt 0 % · Schrubben heilt 0 % · Deckel auf die Schüssel 0 % · Landfrauen-Glanz 0 % · Restfleck 0 % · Warme Schüssel 0 % · Spüli ins Auge gebunden · Blitzblank gebunden

### baerbel-feedback · Pfad 0 · Stufe 10 ·555 Schaden/s · Ausrüstung +215.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.4 Schaden/s · -0.2 Heilung/s · Wumms 2.6 Schaden/s · 0.3 Heilung/s · Taktgefühl 5.1 Schaden/s · -0.1 Heilung/s · Bastelgrips -2.4 Schaden/s · 0.6 Heilung/s · Dicke Haut -2.4 Schaden/s · -0.2 Heilung/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 60.8 % · Pinsel-Piekser 17.6 % · Schimmel 8.2 % · Autoangriff · Dauersprühen 7.5 % · Durchputzen 5.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nebenbei gestreut +1.1 % · Mundpropaganda 0 % · Ruhe im Karton 0 % · Feuchte Ecke gebunden · Es wächst nach gebunden · Zugluft gebunden · Kurzer Hausbesuch gebunden · Sporenflug gebunden · Muffige Kammer gebunden

### baerbel-feedback · Pfad 1 · Stufe 10 ·549 Schaden/s · Ausrüstung +204.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.4 Schaden/s · -0.1 Heilung/s · Wumms 2.5 Schaden/s · 0.3 Heilung/s · Taktgefühl 4.5 Schaden/s · Bastelgrips -2.4 Schaden/s · 0.5 Heilung/s · Dicke Haut -2.4 Schaden/s · -0.1 Heilung/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 68 % · Pinsel-Piekser 14.5 % · Autoangriff · Dauersprühen 8 % · Durchputzen 6 % · Schimmel 3.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kundenbindung 0 % · Reklamation abgewürgt 0 % · Doppelte Marge 0 % · Provision vom Schmerz gebunden · Putzprovision gebunden · Kleingeld vom Tick gebunden · Abschlussprämie gebunden · Provisionskur gebunden · Sonderrabatt gebunden

### baerbel-feedback · Pfad 2 · Stufe 10 ·684 Schaden/s · Ausrüstung +218.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -3 Schaden/s · -0.2 Heilung/s · Wumms 3.1 Schaden/s · 0.3 Heilung/s · Taktgefühl 6.2 Schaden/s · 0.1 Heilung/s · Bastelgrips -3 Schaden/s · 0.4 Heilung/s · Dicke Haut -3 Schaden/s · -0.2 Heilung/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 63.4 % · Durchputzen 14.1 % · Pinsel-Piekser 11.6 % · Autoangriff · Dauersprühen 6.4 % · Schimmel 4.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Doppelt geputzt +2.6 % · Vertrieb auf Achse 0 % · Kettenbrief 0 % · Einmal mehr drüber gebunden · Eintrittsgebühr gebunden · Bring noch zwei Freundinnen gebunden · Startkapital gebunden · Passives Einkommen gebunden · Mehrwegflasche gebunden

### baerbel-feedback · Pfad 0 · Stufe 20 ·1292 Schaden/s · Ausrüstung +549.3 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -7.2 Schaden/s · -1 Heilung/s · -0.1 verhindert/s · Wumms 0 Schaden/s · -0.1 verhindert/s · Taktgefühl -7.2 Schaden/s · -1 Heilung/s · -0.1 verhindert/s · Bastelgrips -7.2 Schaden/s · 0.5 Heilung/s · -0.1 verhindert/s · Dicke Haut -7.2 Schaden/s · -1 Heilung/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 67.8 % · Pinsel-Piekser 14.2 % · Autoangriff · Dauersprühen 7.2 % · Durchputzen 5.9 % · Schimmel 4.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nebenbei gestreut +1.4 % · Einmal mehr drüber +1 % · Es wächst nach 0 % · Zugluft 0 % · Kurzer Hausbesuch 0 % · Sporenflug 0 % · Muffige Kammer 0 % · Ruhe im Karton 0 % · Provision vom Schmerz 0 % · Putzprovision 0 % · Sporenregen -2.4 % · Feuchte Ecke gebunden · Mundpropaganda gebunden

### baerbel-feedback · Pfad 1 · Stufe 20 ·1361 Schaden/s · Ausrüstung +533.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -7.6 Schaden/s · -0.8 Heilung/s · -0.1 verhindert/s · Wumms 0 Schaden/s · -0.1 verhindert/s · Taktgefühl 3.3 Schaden/s · 16.3 Heilung/s · -0.1 verhindert/s · Bastelgrips -7.6 Schaden/s · 1.2 Heilung/s · -0.1 verhindert/s · Dicke Haut -7.6 Schaden/s · -0.8 Heilung/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 71.9 % · Pinsel-Piekser 13.5 % · Autoangriff · Dauersprühen 7.2 % · Durchputzen 5.1 % · Schimmel 2.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Bonusausschüttung +3.9 % · Einmal mehr drüber +0.9 % · Putzprovision 0 % · Kleingeld vom Tick 0 % · Abschlussprämie 0 % · Provisionskur 0 % · Sonderrabatt 0 % · Kundenbindung 0 % · Doppelte Marge 0 % · Feuchte Ecke 0 % · Es wächst nach 0 % · Provision vom Schmerz gebunden · Reklamation abgewürgt gebunden

### baerbel-feedback · Pfad 2 · Stufe 20 ·1742 Schaden/s · Ausrüstung +454 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -9.8 Schaden/s · -1.7 Heilung/s · -0.1 verhindert/s · Wumms 0 Schaden/s · -0.1 verhindert/s · Taktgefühl -9.8 Schaden/s · -1.7 Heilung/s · -0.1 verhindert/s · Bastelgrips -9.8 Schaden/s · 0.6 Heilung/s · -0.1 verhindert/s · Dicke Haut -9.8 Schaden/s · -1.7 Heilung/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 62.1 % · Pinsel-Piekser 15.1 % · Durchputzen 13 % · Autoangriff · Dauersprühen 5.3 % · Schimmel 4.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Die ganze Downline +9.6 % · Doppelt geputzt +1.9 % · Eintrittsgebühr +1.5 % · Bring noch zwei Freundinnen 0 % · Startkapital 0 % · Passives Einkommen 0 % · Mehrwegflasche 0 % · Vertrieb auf Achse 0 % · Provision vom Schmerz 0 % · Feuchte Ecke 0 % · Putzprovision 0 % · Einmal mehr drüber gebunden · Kettenbrief gebunden

### baerbel-stage · Pfad 0 · Stufe 10 ·667 Schaden/s · Ausrüstung +266.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -3 Schaden/s · Wumms 3 Schaden/s · Taktgefühl -2.4 Schaden/s · Bastelgrips -7.6 Schaden/s · -0.1 Heilung/s · Dicke Haut -3 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Auswringen 58 % · Grundreinigung auf eigene Gefahr 15.4 % · Pinsel-Piekser 12.1 % · Autoangriff · Dauersprühen 6.1 % · Auswringen 5.6 % · Fleckentest, Schätzchen! 2.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Sendezeit verlängert +0.1 % · Sponsoring-Deal 0 % · Follower gewonnen 0 % · Langzeitbelichtung gebunden · Dauerschleife gebunden · Stromsparmodus gebunden · Abgeblockt gebunden · Kommentar gepinnt gebunden · Zugabe-Rhythmus gebunden

### baerbel-stage · Pfad 1 · Stufe 10 ·692 Schaden/s · Ausrüstung +229.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -3.2 Schaden/s · Wumms 3 Schaden/s · Taktgefühl 1.9 Schaden/s · 0.1 Heilung/s · Bastelgrips -3.6 Schaden/s · 0.2 Heilung/s · Dicke Haut -3.2 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Auswringen 52.1 % · Grundreinigung auf eigene Gefahr 15.8 % · Pinsel-Piekser 12.6 % · Fleckentest, Schätzchen! 8 % · Autoangriff · Dauersprühen 6.3 % · Auswringen 5.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Für alle sichtbar +4.9 % · Turbostufe zehn 0 % · Noch ein Take 0 % · Perfekter Upload gebunden · Früh am Herd gebunden · Scharfgestellt gebunden · Like-Welle gebunden · Noch ein Reel, ihr Opfer! gebunden · Fleckentest bestanden gebunden

### baerbel-stage · Pfad 2 · Stufe 10 ·562 Schaden/s · Ausrüstung +227 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.5 Schaden/s · Wumms 2.5 Schaden/s · Taktgefühl -2.6 Schaden/s · 0.1 Heilung/s · Bastelgrips -4.8 Schaden/s · 0.1 Heilung/s · Dicke Haut -2.5 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Auswringen 58.5 % · Grundreinigung auf eigene Gefahr 17.4 % · Pinsel-Piekser 13 % · Autoangriff · Dauersprühen 7.2 % · Fleckentest, Schätzchen! 2.4 % · Auswringen 1.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Live-Schalte 0 % · Nächste Szene 0 % · Sprungschnitt 0 % · Selfie im Gehen gebunden · Bühnenfunke gebunden · Erst pflegen, dann posten gebunden · Story-Wechsel gebunden · Unsichtbarer Schnitt gebunden · Frisch geföhnt gebunden

### baerbel-stage · Pfad 0 · Stufe 20 ·1516 Schaden/s · Ausrüstung +396.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -8.6 Schaden/s · -0.1 verhindert/s · Wumms 0 Schaden/s · -0.1 verhindert/s · Taktgefühl -0.2 Schaden/s · -0.1 verhindert/s · Bastelgrips -6.5 Schaden/s · 0.2 Heilung/s · -0.1 verhindert/s · Dicke Haut -8.6 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Auswringen 56.2 % · Pinsel-Piekser 15.4 % · Grundreinigung auf eigene Gefahr 14.6 % · Autoangriff · Dauersprühen 5.9 % · Auswringen 5.2 % · Fleckentest, Schätzchen! 2.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Zugabe-Rhythmus +1.4 % · Dauerschleife +0.2 % · Stromsparmodus 0 % · Abgeblockt 0 % · Kommentar gepinnt 0 % · Sponsoring-Deal 0 % · Sendezeit verlängert 0 % · Perfekter Upload 0 % · Selfie im Gehen 0 % · Bühnenfunke 0 % · Nachglanz -1.5 % · Langzeitbelichtung gebunden · Follower gewonnen gebunden

### baerbel-stage · Pfad 1 · Stufe 20 ·1542 Schaden/s · Ausrüstung +495.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -8.7 Schaden/s · -0.1 verhindert/s · Wumms 0 Schaden/s · -0.1 verhindert/s · Taktgefühl -9.1 Schaden/s · -0.1 verhindert/s · Bastelgrips -7.9 Schaden/s · 0.4 Heilung/s · -0.1 verhindert/s · Dicke Haut -8.7 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Auswringen 61.3 % · Pinsel-Piekser 12.4 % · Grundreinigung auf eigene Gefahr 11.4 % · Autoangriff · Dauersprühen 5.6 % · Fleckentest, Schätzchen! 5.3 % · Auswringen 4.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Letzter Schliff +4.2 % · Früh am Herd +0.9 % · Fleckentest bestanden +0.7 % · Scharfgestellt 0 % · Like-Welle 0 % · Noch ein Reel, ihr Opfer! 0 % · Turbostufe zehn 0 % · Noch ein Take 0 % · Langzeitbelichtung 0 % · Selfie im Gehen 0 % · Bühnenfunke 0 % · Perfekter Upload gebunden · Für alle sichtbar gebunden

### baerbel-stage · Pfad 2 · Stufe 20 ·1523 Schaden/s · Ausrüstung +483.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -8.6 Schaden/s · -0.1 verhindert/s · Wumms 0 Schaden/s · -0.1 verhindert/s · Taktgefühl -27.9 Schaden/s · -0.3 Heilung/s · -0.1 verhindert/s · Bastelgrips -8.6 Schaden/s · 0.2 Heilung/s · -0.1 verhindert/s · Dicke Haut -8.6 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Auswringen 63.4 % · Grundreinigung auf eigene Gefahr 15.6 % · Pinsel-Piekser 10.3 % · Autoangriff · Dauersprühen 5.9 % · Auswringen 3.3 % · Fleckentest, Schätzchen! 1.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Dauerschleife +9.2 % · Viral bis zur Feldflur +5.2 % · Perfekter Upload +4.5 % · Bühnenfunke 0 % · Erst pflegen, dann posten 0 % · Story-Wechsel 0 % · Unsichtbarer Schnitt 0 % · Frisch geföhnt 0 % · Live-Schalte 0 % · Sprungschnitt 0 % · Langzeitbelichtung 0 % · Selfie im Gehen gebunden · Nächste Szene gebunden

### kevin-fuse · Pfad 0 · Stufe 10 ·567 Schaden/s · Ausrüstung +262.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.5 Schaden/s · Wumms 2.6 Schaden/s · Taktgefühl -5.2 Schaden/s · Bastelgrips -5.3 Schaden/s · Dicke Haut -2.5 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Kurzschluss 38.6 % · Kurzschluss 21.2 % · Restmüll mit Zündschnur 18.3 % · Pfandgeschoss 12.5 % · Autoangriff · Pfand im Takt 6.2 % · Lunte 3.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Heißer Kleber +0.7 % · Rücklaufdruck 0 % · Ausgebrannt 0 % · Brennender Nachlauf gebunden · Zündfunke gebunden · Dicke Lunte gebunden · Funkenflug gebunden · Lunte springt gebunden · Sparflamme gebunden

### kevin-fuse · Pfad 1 · Stufe 10 ·634 Schaden/s · Ausrüstung +255 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.8 Schaden/s · Wumms 2.9 Schaden/s · Taktgefühl 3.3 Schaden/s · Bastelgrips -2.8 Schaden/s · Dicke Haut -2.8 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Kurzschluss 42.8 % · Kurzschluss 25 % · Restmüll mit Zündschnur 15.9 % · Pfandgeschoss 9.1 % · Autoangriff · Pfand im Takt 5.5 % · Lunte 1.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Überbrückt +7.7 % · Doppelte Sicherung 0 % · Serienschaltung -3.4 % · Blanker Draht gebunden · Kupferkern gebunden · Rückstrom gebunden · Schnellverkabelt gebunden · Erdschluss gebunden · Kurzschluss gebunden

### kevin-fuse · Pfad 2 · Stufe 10 ·501 Schaden/s · Ausrüstung +222.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.2 Schaden/s · Wumms 2.3 Schaden/s · Taktgefühl -1.5 Schaden/s · 0.5 verhindert/s · Bastelgrips -2 Schaden/s · 0.5 verhindert/s · Dicke Haut -2.2 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Kurzschluss 36.4 % · Kurzschluss 20 % · Restmüll mit Zündschnur 15.7 % · Pfandgeschoss 15 % · Autoangriff · Pfand im Takt 7 % · Lunte 5.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nachzünder 0 % · Glühender Draht 0 % · Lange Zündschnur 0 % · Zündliste gebunden · Warmlaufen gebunden · Kleber für alle gebunden · Funkenüberschlag gebunden · Kettenzündung gebunden · Zündleitung gebunden

### kevin-fuse · Pfad 0 · Stufe 20 ·1286 Schaden/s · Ausrüstung +509.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -7.3 Schaden/s · -0.1 verhindert/s · Wumms 0 Schaden/s · -0.1 verhindert/s · Taktgefühl -9.1 Schaden/s · 0.2 verhindert/s · Bastelgrips -8.1 Schaden/s · -0.2 verhindert/s · Dicke Haut -7.3 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Kurzschluss 39.8 % · Kurzschluss 25.9 % · Restmüll mit Zündschnur 15.8 % · Pfandgeschoss 10.3 % · Autoangriff · Pfand im Takt 5.9 % · Lunte 2.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kupferkern +4.2 % · Zündfunke 0 % · Dicke Lunte 0 % · Funkenflug 0 % · Lunte springt 0 % · Rücklaufdruck 0 % · Ausgebrannt 0 % · Alles auf die Lunte 0 % · Blanker Draht 0 % · Zündliste 0 % · Sparflamme -1.5 % · Brennender Nachlauf gebunden · Heißer Kleber gebunden

### kevin-fuse · Pfad 1 · Stufe 20 ·1821 Schaden/s · Ausrüstung +525 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -10.3 Schaden/s · Wumms 0 Schaden/s · Taktgefühl -0.7 Schaden/s · Bastelgrips -10.3 Schaden/s · Dicke Haut -10.3 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Kurzschluss 40.2 % · Kurzschluss 33.5 % · Restmüll mit Zündschnur 14 % · Pfandgeschoss 6.7 % · Autoangriff · Pfand im Takt 4.4 % · Lunte 1.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Rückstrom +22.5 % · Nullwiderstand +11.2 % · Überbrückt +7.2 % · Kupferkern +3.5 % · Brennender Nachlauf +2.3 % · Zündliste +1.8 % · Schnellverkabelt 0 % · Erdschluss 0 % · Kurzschluss 0 % · Serienschaltung 0 % · Zündfunke 0 % · Blanker Draht gebunden · Doppelte Sicherung gebunden

### kevin-fuse · Pfad 2 · Stufe 20 ·1694 Schaden/s · Ausrüstung +470.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -9.5 Schaden/s · Wumms 0.1 Schaden/s · Taktgefühl -9.6 Schaden/s · Bastelgrips 0.2 Schaden/s · Dicke Haut -9.5 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Kurzschluss 42.4 % · Kurzschluss 23.3 % · Restmüll mit Zündschnur 15.8 % · Pfandgeschoss 10.6 % · Autoangriff · Pfand im Takt 4.5 % · Lunte 3.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Kettenreaktion +33.2 % · Brennender Nachlauf +3.1 % · Kleber für alle +0.2 % · Warmlaufen 0 % · Funkenüberschlag 0 % · Kettenzündung 0 % · Zündleitung 0 % · Nachzünder 0 % · Lange Zündschnur 0 % · Blanker Draht 0 % · Zündfunke 0 % · Zündliste gebunden · Glühender Draht gebunden

### kevin-iron · Pfad 0 · Stufe 10 ·503 Schaden/s · Ausrüstung +218.4 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.5 Schaden/s · Wumms 2 Schaden/s · Taktgefühl -1.3 Schaden/s · Bastelgrips -2.7 Schaden/s · Dicke Haut -2.5 Schaden/s

**Kniffe (Anteil am Schaden):** Überlast 34.9 % · Robbi 29.9 % · Pfandgeschoss 20.5 % · Autoangriff · Pfand im Takt 10.7 % · Kleb die Scheiße fest 4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Werkstattpause 0 % · Ersatzteile 0 % · Starker Magnet 0 % · Längere Batterie gebunden · Weiter Bremsweg gebunden · Scharfe Dose gebunden · Robbi hält gebunden · Magnetpanzer gebunden · Ersatzdose gebunden

### kevin-iron · Pfad 1 · Stufe 10 ·474 Schaden/s · Ausrüstung +230.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.3 Schaden/s · Wumms 1.9 Schaden/s · Taktgefühl -1.2 Schaden/s · Bastelgrips -2.3 Schaden/s · Dicke Haut -2.3 Schaden/s

**Kniffe (Anteil am Schaden):** Überlast 37 % · Robbi 25.6 % · Pfandgeschoss 21.8 % · Autoangriff · Pfand im Takt 11.3 % · Kleb die Scheiße fest 4.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Parierschlag 0 % · Dosenblech 0 % · Nietenpflaster 0 % · Blechkante gebunden · Nietenpanzer gebunden · Druckventil gebunden · Nietfest gebunden · Vernietet gebunden · Notniete gebunden

### kevin-iron · Pfad 2 · Stufe 10 ·612 Schaden/s · Ausrüstung +150.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.7 Schaden/s · Wumms 2.8 Schaden/s · Taktgefühl -1.8 Schaden/s · Bastelgrips -3.3 Schaden/s · Dicke Haut -2.7 Schaden/s

**Kniffe (Anteil am Schaden):** Robbi 42.4 % · Überlast 27.2 % · Pfandgeschoss 17.9 % · Autoangriff · Pfand im Takt 8.8 % · Kleb die Scheiße fest 3.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Überdruck +4.4 % · Restwärme 0 % · Überlast im Laufen 0 % · Frisch verschraubt gebunden · Zusatzladung gebunden · Blitzableiter gebunden · Wiederaufbau gebunden · Druckschlag gebunden · Dampfdruck gebunden

### kevin-iron · Pfad 0 · Stufe 20 ·1020 Schaden/s · Ausrüstung +419.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -5.7 Schaden/s · Wumms 0 Schaden/s · Taktgefühl -5 Schaden/s · Bastelgrips -5.6 Schaden/s · Dicke Haut -5.7 Schaden/s

**Kniffe (Anteil am Schaden):** Überlast 44.2 % · Robbi 21.6 % · Pfandgeschoss 20.4 % · Autoangriff · Pfand im Takt 10.7 % · Kleb die Scheiße fest 3 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Scharfe Dose +2 % · Weiter Bremsweg 0 % · Robbi hält 0 % · Magnetpanzer 0 % · Ersatzdose 0 % · Werkstattpause 0 % · Starker Magnet 0 % · Letzter Befehl 0 % · Frisch verschraubt 0 % · Blechkante 0 % · Nietenpanzer 0 % · Längere Batterie gebunden · Ersatzteile gebunden

### kevin-iron · Pfad 1 · Stufe 20 ·984 Schaden/s · Ausrüstung +459.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -5.5 Schaden/s · Wumms 0 Schaden/s · Taktgefühl -4.8 Schaden/s · Bastelgrips -5.8 Schaden/s · Dicke Haut -5.5 Schaden/s

**Kniffe (Anteil am Schaden):** Überlast 45.8 % · Pfandgeschoss 21.1 % · Robbi 18.8 % · Autoangriff · Pfand im Takt 11.1 % · Kleb die Scheiße fest 3.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Nietenpanzer 0 % · Druckventil 0 % · Nietfest 0 % · Vernietet 0 % · Notniete 0 % · Parierschlag 0 % · Nietenpflaster 0 % · Nicht TÜV-geprüft 0 % · Frisch verschraubt 0 % · Längere Batterie 0 % · Weiter Bremsweg 0 % · Blechkante gebunden · Dosenblech gebunden

### kevin-iron · Pfad 2 · Stufe 20 ·1504 Schaden/s · Ausrüstung +328.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -8.4 Schaden/s · Wumms 0 Schaden/s · Taktgefühl -8.2 Schaden/s · Bastelgrips -9.1 Schaden/s · Dicke Haut -8.4 Schaden/s

**Kniffe (Anteil am Schaden):** Robbi 47.2 % · Überlast 28.4 % · Pfandgeschoss 14.7 % · Autoangriff · Pfand im Takt 7.2 % · Kleb die Scheiße fest 2.4 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Wiederaufbau +17.9 % · Kernschmelze +15.8 % · Zusatzladung +5.4 % · Überdruck +3.5 % · Blitzableiter 0 % · Druckschlag 0 % · Dampfdruck 0 % · Überlast im Laufen 0 % · Längere Batterie 0 % · Blechkante 0 % · Nietenpanzer 0 % · Frisch verschraubt gebunden · Restwärme gebunden

### kevin-hunt · Pfad 0 · Stufe 10 ·658 Schaden/s · Ausrüstung +221.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.9 Schaden/s · -0.4 Heilung/s · Wumms 3 Schaden/s · 0.3 Heilung/s · Taktgefühl -2.4 Schaden/s · -0.3 Heilung/s · -0.2 verhindert/s · Bastelgrips -8.1 Schaden/s · 0.1 Heilung/s · 0.3 verhindert/s · Dicke Haut -2.9 Schaden/s · -0.4 Heilung/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll-Rakete 53.7 % · Pfandgeschoss 17.3 % · Restmüll mit Zündschnur 16.2 % · Autoangriff · Pfand im Takt 9.1 % · Kleb die Scheiße fest 3.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Automatenrhythmus +9.1 % · Pfandgeschoss im Laufen 0 % · Pfandbon 0 % · Gezinkte Dose gebunden · Restwert gebunden · Klebefalle gebunden · Kurze Pechsträhne gebunden · Glücksgriff gebunden · Beutefieber gebunden

### kevin-hunt · Pfad 1 · Stufe 10 ·603 Schaden/s · Ausrüstung +222 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.7 Schaden/s · Wumms 2.7 Schaden/s · Taktgefühl -1.6 Schaden/s · 0.5 verhindert/s · Bastelgrips -2.4 Schaden/s · 0.5 verhindert/s · Dicke Haut -2.7 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll-Rakete 48.8 % · Pfandgeschoss 20.1 % · Restmüll mit Zündschnur 17.7 % · Autoangriff · Pfand im Takt 9.5 % · Kleb die Scheiße fest 3.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Rückstoß 0 % · Schritt voraus 0 % · Rakete im Rennen 0 % · Wurf aus der Bewegung gebunden · Fangschuss gebunden · Abgesprungen gebunden · Nachladen im Rennen gebunden · Nachschub gebunden · Fangnetz gebunden

### kevin-hunt · Pfad 2 · Stufe 10 ·603 Schaden/s · Ausrüstung +222 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.7 Schaden/s · Wumms 2.7 Schaden/s · Taktgefühl -1.6 Schaden/s · 0.5 verhindert/s · Bastelgrips -2.4 Schaden/s · 0.5 verhindert/s · Dicke Haut -2.7 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll-Rakete 48.8 % · Pfandgeschoss 20.1 % · Restmüll mit Zündschnur 17.7 % · Autoangriff · Pfand im Takt 9.5 % · Kleb die Scheiße fest 3.9 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Fangprämie 0 % · Restgewinn 0 % · Stahlseil 0 % · Zweite Serie gebunden · Pfandrückgabe gebunden · Gewinnausschüttung gebunden · Glücksbringer gebunden · Pfandseil gebunden · Glücksrausch gebunden

### kevin-hunt · Pfad 0 · Stufe 20 ·1715 Schaden/s · Ausrüstung +454.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -9.7 Schaden/s · -1.5 Heilung/s · -0.1 verhindert/s · Wumms 0 Schaden/s · -0.1 verhindert/s · Taktgefühl -8.8 Schaden/s · 0.6 Heilung/s · -0.1 verhindert/s · Bastelgrips -15.3 Schaden/s · -1.9 Heilung/s · Dicke Haut -9.7 Schaden/s · -1.5 Heilung/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll-Rakete 59.2 % · Restmüll mit Zündschnur 17.9 % · Pfandgeschoss 13.3 % · Autoangriff · Pfand im Takt 7.5 % · Kleb die Scheiße fest 2 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Alles auf Rot +15.8 % · Automatenrhythmus +5.7 % · Restwert 0 % · Klebefalle 0 % · Kurze Pechsträhne 0 % · Glücksgriff 0 % · Beutefieber 0 % · Pfandgeschoss im Laufen 0 % · Wurf aus der Bewegung 0 % · Zweite Serie 0 % · Fangschuss 0 % · Gezinkte Dose gebunden · Pfandbon gebunden

### kevin-hunt · Pfad 1 · Stufe 20 ·1395 Schaden/s · Ausrüstung +456.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -7.9 Schaden/s · -0.1 verhindert/s · Wumms 0 Schaden/s · -0.1 verhindert/s · Taktgefühl -7.1 Schaden/s · -0.1 verhindert/s · Bastelgrips -9.3 Schaden/s · 0.1 verhindert/s · Dicke Haut -7.9 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll-Rakete 54.2 % · Pfandgeschoss 17.5 % · Restmüll mit Zündschnur 16.5 % · Autoangriff · Pfand im Takt 9.2 % · Kleb die Scheiße fest 2.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Fangschuss 0 % · Abgesprungen 0 % · Nachladen im Rennen 0 % · Nachschub 0 % · Fangnetz 0 % · Rückstoß 0 % · Rakete im Rennen 0 % · Nie am selben Fleck 0 % · Gezinkte Dose 0 % · Zweite Serie 0 % · Restwert 0 % · Wurf aus der Bewegung gebunden · Schritt voraus gebunden

### kevin-hunt · Pfad 2 · Stufe 20 ·1604 Schaden/s · Ausrüstung +360.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -9.1 Schaden/s · Wumms 0 Schaden/s · Taktgefühl -3.6 Schaden/s · Bastelgrips -9.1 Schaden/s · Dicke Haut -9.1 Schaden/s

**Kniffe (Anteil am Schaden):** Restmüll-Rakete 51.8 % · Restmüll mit Zündschnur 19.2 % · Pfandgeschoss 17.1 % · Autoangriff · Pfand im Takt 8.8 % · Kleb die Scheiße fest 3.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent; gebunden = andere bauen darauf auf):** Gewinnrakete +15 % · Pfandrückgabe 0 % · Gewinnausschüttung 0 % · Glücksbringer 0 % · Pfandseil 0 % · Glücksrausch 0 % · Fangprämie 0 % · Stahlseil 0 % · Wurf aus der Bewegung 0 % · Gezinkte Dose 0 % · Fangschuss 0 % · Zweite Serie gebunden · Restgewinn gebunden

