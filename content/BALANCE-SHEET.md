# Balance-Sheet

Automatisch erzeugt von `npm run balance:sheet` · 2026-09-23 · 40 s Übungskampf gegen drei Puppen, feste Prioritäten-Rotation (Heiler heilen zuerst), Puppen treffen jede Sekunde mit 3 % des Grundlebens. Voller Ausrüstungssatz auf Charakterstufe (Werteprofile im Wechsel); „Startausrüstung“ = Flasche, Topfdeckel, Schleuder, Kutte. Talentpfad 0–2 über `pathBuild`, Stufe 1 ohne Spezialisierung.

Jede Rolle misst sich an ihrer Kennzahl: **Schaden** → Schaden/s, **Heilung** → Heilung/s (Ausstoß inkl. Überheilung), **Tank** → Schutz/s (verhinderter Schaden + Deckung). Zelle: Kennzahl (Abweichung vom Median der Rolle auf dieser Stufe × Ausrüstung). ⚑ = mehr als 15 % daneben (ab Stufe 5).

## Überblick

280 von 540 Messungen liegen mehr als 15 % neben dem Median ihrer Rolle.

## Ausrüstung: Startausrüstung

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 10 (+10.5 %) | 74 (-20.4 %) ⚑ | 197 (-2 %) | 248 (+5.3 %) | 268 (+6.2 %) | 389 (+17.2 %) ⚑ |
| dieter-brawl | 1 | 10 (+10.5 %) | 88 (-5.8 %) | 251 (+25 %) ⚑ | 346 (+47.3 %) ⚑ | 374 (+48.6 %) ⚑ | 519 (+56.5 %) ⚑ |
| dieter-brawl | 2 | 10 (+10.5 %) | 85 (-8.7 %) | 206 (+2.4 %) | 278 (+18.3 %) ⚑ | 268 (+6.2 %) | 456 (+37.5 %) ⚑ |
| baerbel-feedback | 0 | 9 (0 %) | 181 (+94.2 %) ⚑ | 216 (+7.4 %) | 198 (-16 %) ⚑ | 216 (-14.4 %) | 332 (0 %) |
| baerbel-feedback | 1 | 9 (0 %) | 174 (+87.2 %) ⚑ | 194 (-3.3 %) | 206 (-12.3 %) | 227 (-9.7 %) | 320 (-3.7 %) |
| baerbel-feedback | 2 | 9 (0 %) | 215 (+131.5 %) ⚑ | 268 (+33.3 %) ⚑ | 338 (+43.6 %) ⚑ | 364 (+44.7 %) ⚑ | 418 (+25.9 %) ⚑ |
| baerbel-stage | 0 | 9 (0 %) | 172 (+84.5 %) ⚑ | 203 (+0.9 %) | 303 (+28.9 %) ⚑ | 328 (+30.2 %) ⚑ | 383 (+15.6 %) ⚑ |
| baerbel-stage | 1 | 9 (0 %) | 185 (+98.9 %) ⚑ | 269 (+33.7 %) ⚑ | 258 (+9.7 %) | 257 (+2 %) | 338 (+1.8 %) |
| baerbel-stage | 2 | 9 (0 %) | 160 (+72.5 %) ⚑ | 201 (0 %) | 209 (-10.9 %) | 252 (0 %) | 313 (-5.5 %) |
| kevin-fuse | 0 | 9 (0 %) | 93 (0 %) | 187 (-6.8 %) | 203 (-13.6 %) | 233 (-7.4 %) | 279 (-15.9 %) ⚑ |
| kevin-fuse | 1 | 9 (0 %) | 109 (+17 %) ⚑ | 205 (+1.9 %) | 282 (+19.8 %) ⚑ | 304 (+20.8 %) ⚑ | 344 (+3.8 %) |
| kevin-fuse | 2 | 9 (0 %) | 90 (-3.7 %) | 151 (-25.1 %) ⚑ | 235 (0 %) | 251 (-0.2 %) | 312 (-6 %) |
| kevin-hunt | 0 | 9 (0 %) | 62 (-33.9 %) ⚑ | 107 (-47 %) ⚑ | 146 (-37.9 %) ⚑ | 159 (-36.7 %) ⚑ | 182 (-45.2 %) ⚑ |
| kevin-hunt | 1 | 9 (0 %) | 62 (-33.9 %) ⚑ | 108 (-46.2 %) ⚑ | 45 (-80.9 %) ⚑ | 49 (-80.7 %) ⚑ | 54 (-83.8 %) ⚑ |
| kevin-hunt | 2 | 9 (0 %) | 62 (-33.9 %) ⚑ | 108 (-46.2 %) ⚑ | 143 (-39.4 %) ⚑ | 167 (-33.6 %) ⚑ | 197 (-40.5 %) ⚑ |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 0 (-100 %) ⚑ | 30 (-10.3 %) | 40 (-23.5 %) ⚑ | 48 (-7 %) | 47 (-18.6 %) ⚑ |
| dieter-brew | 1 | 0 (-100 %) | 0 (-100 %) ⚑ | 38 (+16.7 %) ⚑ | 77 (+48.5 %) ⚑ | 80 (+56.6 %) ⚑ | 91 (+58.2 %) ⚑ |
| dieter-brew | 2 | 0 (-100 %) | 0 (-100 %) ⚑ | 26 (-22.5 %) ⚑ | 33 (-36 %) ⚑ | 38 (-25.2 %) ⚑ | 49 (-15.2 %) ⚑ |
| baerbel-care | 0 | 0 (-100 %) | 41 (+46.1 %) ⚑ | 47 (+41.3 %) ⚑ | 52 (0 %) | 50 (-2.5 %) | 57 (-0.9 %) |
| baerbel-care | 1 | 0 (-100 %) | 28 (0 %) | 30 (-7.6 %) | 47 (-10.6 %) | 51 (0 %) | 57 (0 %) |
| baerbel-care | 2 | 0 (-100 %) | 30 (+4.6 %) | 33 (0 %) | 62 (+18.8 %) ⚑ | 75 (+47.1 %) ⚑ | 84 (+45.6 %) ⚑ |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 4 (0 %) | 38 (+16.1 %) ⚑ | 39 (0 %) | 37 (-2.4 %) | 43 (-5.5 %) | 46 (-25 %) ⚑ |
| dieter-wall | 1 | 4 (0 %) | 11 (-64.7 %) ⚑ | 20 (-49.5 %) ⚑ | 36 (-5.5 %) | 43 (-6.4 %) | 49 (-19.8 %) ⚑ |
| dieter-wall | 2 | 4 (0 %) | 11 (-65.9 %) ⚑ | 19 (-52.8 %) ⚑ | 25 (-33.9 %) ⚑ | 27 (-40.2 %) ⚑ | 37 (-40.1 %) ⚑ |
| kevin-iron | 0 | 3 (-25 %) | 31 (-4 %) | 41 (+3.3 %) | 52 (+37.3 %) ⚑ | 62 (+36 %) ⚑ | 77 (+25.5 %) ⚑ |
| kevin-iron | 1 | 3 (-25 %) | 34 (+3.7 %) | 44 (+12.4 %) | 59 (+55.1 %) ⚑ | 68 (+49.2 %) ⚑ | 84 (+35.6 %) ⚑ |
| kevin-iron | 2 | 3 (-25 %) | 32 (0 %) | 33 (-16.5 %) ⚑ | 38 (0 %) | 46 (0 %) | 62 (0 %) |

## Ausrüstung: ungewöhnlich

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 14 (+10 %) | 317 (-5.4 %) | 587 (+1.7 %) | 914 (+3.7 %) | 1321 (0 %) | 2393 (+7.2 %) |
| dieter-brawl | 1 | 14 (+10 %) | 379 (+13.2 %) | 789 (+36.6 %) ⚑ | 1415 (+60.6 %) ⚑ | 1925 (+45.8 %) ⚑ | 3463 (+55.2 %) ⚑ |
| dieter-brawl | 2 | 14 (+10 %) | 335 (0 %) | 614 (+6.3 %) | 1004 (+13.9 %) | 1449 (+9.7 %) | 2655 (+19 %) ⚑ |
| baerbel-feedback | 0 | 13 (0 %) | 342 (+2.1 %) | 621 (+7.5 %) | 803 (-8.9 %) | 1129 (-14.5 %) | 2212 (-0.9 %) |
| baerbel-feedback | 1 | 13 (0 %) | 332 (-1 %) | 560 (-3 %) | 862 (-2.2 %) | 1188 (-10.1 %) | 2214 (-0.8 %) |
| baerbel-feedback | 2 | 13 (0 %) | 452 (+34.9 %) ⚑ | 764 (+32.3 %) ⚑ | 1216 (+38 %) ⚑ | 1618 (+22.5 %) ⚑ | 2570 (+15.2 %) ⚑ |
| baerbel-stage | 0 | 13 (0 %) | 357 (+6.4 %) | 711 (+23.3 %) ⚑ | 1081 (+22.7 %) ⚑ | 1457 (+10.3 %) | 2799 (+25.4 %) ⚑ |
| baerbel-stage | 1 | 13 (0 %) | 356 (+6.1 %) | 865 (+49.9 %) ⚑ | 881 (0 %) | 1356 (+2.6 %) | 2408 (+7.9 %) |
| baerbel-stage | 2 | 13 (0 %) | 342 (+2.1 %) | 553 (-4.2 %) | 951 (+7.9 %) | 1358 (+2.8 %) | 2482 (+11.2 %) |
| kevin-fuse | 0 | 13 (0 %) | 276 (-17.6 %) ⚑ | 526 (-8.9 %) | 743 (-15.7 %) ⚑ | 978 (-26 %) ⚑ | 1601 (-28.2 %) ⚑ |
| kevin-fuse | 1 | 13 (0 %) | 338 (+0.9 %) | 577 (0 %) | 1107 (+25.6 %) ⚑ | 1429 (+8.2 %) | 2232 (0 %) |
| kevin-fuse | 2 | 13 (0 %) | 292 (-12.8 %) | 498 (-13.6 %) | 770 (-12.7 %) | 1029 (-22.1 %) ⚑ | 1787 (-19.9 %) ⚑ |
| kevin-hunt | 0 | 13 (0 %) | 186 (-44.5 %) ⚑ | 331 (-42.7 %) ⚑ | 549 (-37.7 %) ⚑ | 744 (-43.7 %) ⚑ | 1131 (-49.3 %) ⚑ |
| kevin-hunt | 1 | 13 (0 %) | 186 (-44.5 %) ⚑ | 311 (-46.2 %) ⚑ | 140 (-84.1 %) ⚑ | 188 (-85.8 %) ⚑ | 302 (-86.5 %) ⚑ |
| kevin-hunt | 2 | 13 (0 %) | 186 (-44.5 %) ⚑ | 311 (-46.2 %) ⚑ | 456 (-48.2 %) ⚑ | 606 (-54.1 %) ⚑ | 948 (-57.5 %) ⚑ |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 0 (-100 %) ⚑ | 55 (-8.1 %) | 114 (0 %) | 185 (+15.8 %) ⚑ | 339 (+16.1 %) ⚑ |
| dieter-brew | 1 | 0 (-100 %) | 0 (-100 %) ⚑ | 80 (+34.6 %) ⚑ | 177 (+55.5 %) ⚑ | 247 (+54.7 %) ⚑ | 398 (+36.3 %) ⚑ |
| dieter-brew | 2 | 0 (-100 %) | 0 (-100 %) ⚑ | 74 (+24.6 %) ⚑ | 115 (+0.7 %) | 160 (0 %) | 292 (0 %) |
| baerbel-care | 0 | 0 (-100 %) | 48 (+23.9 %) ⚑ | 59 (0 %) | 64 (-43.6 %) ⚑ | 75 (-52.9 %) ⚑ | 110 (-62.2 %) ⚑ |
| baerbel-care | 1 | 0 (-100 %) | 39 (0 %) | 46 (-22.1 %) ⚑ | 70 (-38.7 %) ⚑ | 82 (-49 %) ⚑ | 124 (-57.5 %) ⚑ |
| baerbel-care | 2 | 0 (-100 %) | 42 (+6.7 %) | 44 (-26.5 %) ⚑ | 96 (-16.1 %) ⚑ | 134 (-16.1 %) ⚑ | 162 (-44.7 %) ⚑ |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 8 (0 %) | 36 (+26.8 %) ⚑ | 43 (+5.4 %) | 49 (+3.8 %) | 58 (+2.1 %) | 75 (0 %) |
| dieter-wall | 1 | 8 (0 %) | 22 (-20.4 %) ⚑ | 32 (-22.2 %) ⚑ | 56 (+17.3 %) ⚑ | 65 (+14.3 %) | 84 (+11.3 %) |
| dieter-wall | 2 | 8 (0 %) | 21 (-26.8 %) ⚑ | 26 (-35.9 %) ⚑ | 44 (-6.5 %) | 56 (-2.1 %) | 77 (+2.3 %) |
| kevin-iron | 0 | 7 (-12.5 %) | 27 (-2.9 %) | 41 (0 %) | 46 (-2.3 %) | 57 (0 %) | 74 (-1.9 %) |
| kevin-iron | 1 | 7 (-12.5 %) | 28 (0 %) | 41 (0 %) | 46 (-2.3 %) | 57 (0 %) | 74 (-1.9 %) |
| kevin-iron | 2 | 7 (-12.5 %) | 28 (+1.4 %) | 40 (-2.2 %) | 47 (0 %) | 54 (-4.8 %) | 71 (-6.2 %) |

## Ausrüstung: selten

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 18 (+9.2 %) | 495 (+5.6 %) | 742 (+4.9 %) | 1118 (-0.4 %) | 1586 (0 %) | 3052 (+1.3 %) |
| dieter-brawl | 1 | 18 (+9.2 %) | 647 (+38.1 %) ⚑ | 993 (+40.4 %) ⚑ | 1796 (+59.9 %) ⚑ | 2449 (+54.4 %) ⚑ | 4626 (+53.6 %) ⚑ |
| dieter-brawl | 2 | 18 (+9.2 %) | 511 (+9 %) | 740 (+4.6 %) | 1266 (+12.7 %) | 1848 (+16.5 %) ⚑ | 3543 (+17.6 %) ⚑ |
| baerbel-feedback | 0 | 16 (0 %) | 482 (+2.9 %) | 786 (+11.1 %) | 1123 (0 %) | 1512 (-4.7 %) | 3005 (-0.2 %) |
| baerbel-feedback | 1 | 16 (0 %) | 469 (0 %) | 692 (-2.2 %) | 1104 (-1.7 %) | 1528 (-3.6 %) | 2984 (-0.9 %) |
| baerbel-feedback | 2 | 16 (0 %) | 546 (+16.5 %) ⚑ | 928 (+31.2 %) ⚑ | 1514 (+34.8 %) ⚑ | 2030 (+28 %) ⚑ | 3429 (+13.8 %) |
| baerbel-stage | 0 | 16 (0 %) | 493 (+5.2 %) | 871 (+23.1 %) ⚑ | 1548 (+37.8 %) ⚑ | 2100 (+32.5 %) ⚑ | 3978 (+32.1 %) ⚑ |
| baerbel-stage | 1 | 16 (0 %) | 456 (-2.7 %) | 1050 (+48.5 %) ⚑ | 1163 (+3.6 %) | 1587 (+0.1 %) | 3302 (+9.6 %) |
| baerbel-stage | 2 | 16 (0 %) | 477 (+1.7 %) | 678 (-4.2 %) | 1275 (+13.5 %) | 1810 (+14.1 %) | 3586 (+19.1 %) ⚑ |
| kevin-fuse | 0 | 16 (0 %) | 389 (-17 %) ⚑ | 631 (-10.8 %) | 858 (-23.6 %) ⚑ | 1239 (-21.9 %) ⚑ | 2055 (-31.8 %) ⚑ |
| kevin-fuse | 1 | 16 (0 %) | 421 (-10.2 %) | 707 (0 %) | 1406 (+25.2 %) ⚑ | 1815 (+14.4 %) | 3012 (0 %) |
| kevin-fuse | 2 | 16 (0 %) | 355 (-24.4 %) ⚑ | 613 (-13.4 %) | 946 (-15.8 %) ⚑ | 1288 (-18.8 %) ⚑ | 2392 (-20.6 %) ⚑ |
| kevin-hunt | 0 | 16 (0 %) | 257 (-45.2 %) ⚑ | 396 (-44 %) ⚑ | 675 (-39.9 %) ⚑ | 906 (-42.9 %) ⚑ | 1559 (-48.2 %) ⚑ |
| kevin-hunt | 1 | 16 (0 %) | 257 (-45.2 %) ⚑ | 379 (-46.4 %) ⚑ | 175 (-84.4 %) ⚑ | 236 (-85.1 %) ⚑ | 404 (-86.6 %) ⚑ |
| kevin-hunt | 2 | 16 (0 %) | 257 (-45.2 %) ⚑ | 379 (-46.4 %) ⚑ | 570 (-49.3 %) ⚑ | 761 (-52 %) ⚑ | 1249 (-58.5 %) ⚑ |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 0 (-100 %) ⚑ | 64 (0 %) | 181 (+12.2 %) | 249 (+3.8 %) | 514 (+10.3 %) |
| dieter-brew | 1 | 0 (-100 %) | 0 (-100 %) ⚑ | 89 (+39.6 %) ⚑ | 252 (+56.3 %) ⚑ | 299 (+24.6 %) ⚑ | 561 (+20.4 %) ⚑ |
| dieter-brew | 2 | 0 (-100 %) | 0 (-100 %) ⚑ | 86 (+35.4 %) ⚑ | 161 (0 %) | 240 (0 %) | 466 (0 %) |
| baerbel-care | 0 | 0 (-100 %) | 45 (+11.3 %) | 59 (-8 %) | 83 (-48.5 %) ⚑ | 92 (-61.6 %) ⚑ | 127 (-72.8 %) ⚑ |
| baerbel-care | 1 | 0 (-100 %) | 40 (0 %) | 50 (-22 %) ⚑ | 81 (-49.6 %) ⚑ | 90 (-62.3 %) ⚑ | 142 (-69.6 %) ⚑ |
| baerbel-care | 2 | 0 (-100 %) | 42 (+5.2 %) | 46 (-27.7 %) ⚑ | 111 (-30.8 %) ⚑ | 149 (-37.9 %) ⚑ | 194 (-58.5 %) ⚑ |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 8 (0 %) | 34 (+6.9 %) | 44 (+20.8 %) ⚑ | 53 (+4.4 %) | 60 (0 %) | 80 (0 %) |
| dieter-wall | 1 | 8 (0 %) | 24 (-24.6 %) ⚑ | 30 (-16.1 %) ⚑ | 54 (+6.6 %) | 62 (+4 %) | 84 (+5.4 %) |
| dieter-wall | 2 | 8 (0 %) | 23 (-29 %) ⚑ | 28 (-23.3 %) ⚑ | 50 (0 %) | 61 (+0.8 %) | 84 (+5.4 %) |
| kevin-iron | 0 | 7 (-12.5 %) | 31 (-3.5 %) | 36 (0 %) | 45 (-11.5 %) | 54 (-10 %) | 73 (-8.9 %) |
| kevin-iron | 1 | 7 (-12.5 %) | 32 (0 %) | 36 (0 %) | 45 (-11.5 %) | 54 (-10 %) | 73 (-8.9 %) |
| kevin-iron | 2 | 7 (-12.5 %) | 32 (0 %) | 36 (-1.1 %) | 49 (-2 %) | 52 (-14 %) | 77 (-3.5 %) |

## Ausrüstung: episch

### Schaden · Schaden/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brawl | 0 | 22 (+4.8 %) | 548 (+5.7 %) | 912 (0 %) | 1414 (-11.8 %) | 1874 (-7.6 %) | 4170 (0 %) |
| dieter-brawl | 1 | 22 (+4.8 %) | 778 (+50 %) ⚑ | 1195 (+30.9 %) ⚑ | 2754 (+71.7 %) ⚑ | 3284 (+61.8 %) ⚑ | 6692 (+60.5 %) ⚑ |
| dieter-brawl | 2 | 22 (+4.8 %) | 679 (+30.9 %) ⚑ | 1070 (+17.3 %) ⚑ | 1816 (+13.2 %) | 2648 (+30.5 %) ⚑ | 5474 (+31.3 %) ⚑ |
| baerbel-feedback | 0 | 21 (0 %) | 519 (0 %) | 979 (+7.3 %) | 1445 (-9.9 %) | 2029 (0 %) | 4361 (+4.6 %) |
| baerbel-feedback | 1 | 21 (0 %) | 509 (-1.9 %) | 859 (-5.9 %) | 1639 (+2.2 %) | 2029 (0 %) | 3919 (-6 %) |
| baerbel-feedback | 2 | 21 (0 %) | 630 (+21.5 %) ⚑ | 1124 (+23.2 %) ⚑ | 1991 (+24.2 %) ⚑ | 2674 (+31.7 %) ⚑ | 4482 (+7.5 %) |
| baerbel-stage | 0 | 21 (0 %) | 583 (+12.5 %) | 1072 (+17.4 %) ⚑ | 2100 (+31 %) ⚑ | 2563 (+26.3 %) ⚑ | 4974 (+19.3 %) ⚑ |
| baerbel-stage | 1 | 21 (0 %) | 612 (+17.9 %) ⚑ | 1279 (+40.1 %) ⚑ | 1702 (+6.1 %) | 2354 (+16 %) ⚑ | 4659 (+11.7 %) |
| baerbel-stage | 2 | 21 (0 %) | 558 (+7.7 %) | 929 (+1.9 %) | 1604 (0 %) | 2492 (+22.8 %) ⚑ | 4723 (+13.3 %) |
| kevin-fuse | 0 | 21 (0 %) | 495 (-4.6 %) | 776 (-15 %) | 1212 (-24.5 %) ⚑ | 1597 (-21.3 %) ⚑ | 2773 (-33.5 %) ⚑ |
| kevin-fuse | 1 | 21 (0 %) | 475 (-8.5 %) | 865 (-5.2 %) | 1971 (+22.9 %) ⚑ | 2391 (+17.8 %) ⚑ | 3903 (-6.4 %) |
| kevin-fuse | 2 | 21 (0 %) | 453 (-12.6 %) | 738 (-19.1 %) ⚑ | 1259 (-21.5 %) ⚑ | 1540 (-24.1 %) ⚑ | 3100 (-25.7 %) ⚑ |
| kevin-hunt | 0 | 21 (0 %) | 318 (-38.7 %) ⚑ | 481 (-47.3 %) ⚑ | 880 (-45.2 %) ⚑ | 1163 (-42.7 %) ⚑ | 2120 (-49.2 %) ⚑ |
| kevin-hunt | 1 | 21 (0 %) | 318 (-38.7 %) ⚑ | 507 (-44.5 %) ⚑ | 230 (-85.6 %) ⚑ | 310 (-84.7 %) ⚑ | 549 (-86.8 %) ⚑ |
| kevin-hunt | 2 | 21 (0 %) | 318 (-38.7 %) ⚑ | 507 (-44.5 %) ⚑ | 721 (-55 %) ⚑ | 993 (-51.1 %) ⚑ | 1643 (-60.6 %) ⚑ |

### Heilung · Heilung/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-brew | 0 | 0 (-100 %) | 0 (-100 %) ⚑ | 88 (0 %) | 236 (0 %) | 414 (+17.2 %) ⚑ | 713 (0 %) |
| dieter-brew | 1 | 0 (-100 %) | 0 (-100 %) ⚑ | 103 (+16.6 %) ⚑ | 314 (+33.1 %) ⚑ | 473 (+33.9 %) ⚑ | 981 (+37.5 %) ⚑ |
| dieter-brew | 2 | 0 (-100 %) | 0 (-100 %) ⚑ | 118 (+34 %) ⚑ | 245 (+3.9 %) | 354 (0 %) | 782 (+9.6 %) |
| baerbel-care | 0 | 0 (-100 %) | 57 (+36.4 %) ⚑ | 70 (-20 %) ⚑ | 86 (-63.7 %) ⚑ | 102 (-71.2 %) ⚑ | 167 (-76.6 %) ⚑ |
| baerbel-care | 1 | 0 (-100 %) | 42 (0 %) | 42 (-52.8 %) ⚑ | 93 (-60.5 %) ⚑ | 94 (-73.5 %) ⚑ | 193 (-73 %) ⚑ |
| baerbel-care | 2 | 0 (-100 %) | 50 (+18.8 %) ⚑ | 57 (-35 %) ⚑ | 139 (-41 %) ⚑ | 188 (-46.9 %) ⚑ | 254 (-64.4 %) ⚑ |

### Tank · Schutz/s

| Spezialisierung | Pfad | Stufe 1 | Stufe 5 | Stufe 10 | Stufe 15 | Stufe 20 | Stufe 30 |
|---|---|---:|---:|---:|---:|---:|---:|
| dieter-wall | 0 | 10 (0 %) | 32 (+5.6 %) | 42 (+16.9 %) ⚑ | 52 (0 %) | 59 (0 %) | 80 (0 %) |
| dieter-wall | 1 | 10 (0 %) | 28 (-9.5 %) | 35 (-0.3 %) | 53 (+1.9 %) | 60 (+1.9 %) | 81 (+2 %) |
| dieter-wall | 2 | 10 (0 %) | 24 (-22.7 %) ⚑ | 31 (-12.7 %) | 53 (+1.5 %) | 60 (+1.9 %) | 81 (+2 %) |
| kevin-iron | 0 | 9 (-10 %) | 30 (0 %) | 36 (0 %) | 44 (-15.3 %) ⚑ | 52 (-11.8 %) | 71 (-11.7 %) |
| kevin-iron | 1 | 9 (-10 %) | 30 (0 %) | 36 (0 %) | 44 (-15.3 %) ⚑ | 52 (-11.8 %) | 71 (-11.7 %) |
| kevin-iron | 2 | 9 (-10 %) | 30 (0 %) | 36 (0 %) | 49 (-4.6 %) | 55 (-7.3 %) | 67 (-15.5 %) ⚑ |

## Zerlegung (Pfad 0, Ausrüstung selten)

### dieter-wall · Stufe 10 · 431 Schaden/s · Ausrüstung +248.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.1 Schaden/s · Wumms 1.8 Schaden/s · Taktgefühl -3.3 Schaden/s · Bastelgrips -4 Schaden/s · Dicke Haut -2.1 Schaden/s

**Kniffe (Anteil am Schaden):** Rausschmiss 51 % · Kronkorken-Kelle 17.9 % · Böller unterm Biertisch 15.5 % · Autoangriff · Flasche kreist 10.7 % · Du schuldest mir Pfand! 4.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent):** dieter-wall-12 +1.3 % · dieter-wall-11 +1 % · dieter-wall-10 +0.2 % · dieter-wall-14 0 % · dieter-wall-7 0 % · dieter-wall-15 0 % · dieter-wall-13 -0.4 % · dieter-wall-5 -0.4 % · dieter-wall-0 -5.4 %

### dieter-wall · Stufe 20 · 966 Schaden/s · Ausrüstung +571.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -5.6 Schaden/s · Wumms -0.1 Schaden/s · Taktgefühl -5.6 Schaden/s · Bastelgrips -5.4 Schaden/s · Dicke Haut -5.4 Schaden/s

**Kniffe (Anteil am Schaden):** Rausschmiss 60.5 % · Kronkorken-Kelle 16.3 % · Böller unterm Biertisch 11 % · Autoangriff · Flasche kreist 10.3 % · Du schuldest mir Pfand! 2 %

**Talente (Schaden mit gegenüber ohne dieses Talent):** dieter-wall-0 +0.1 % · dieter-wall-13 -1.4 % · dieter-wall-5 -1.4 % · dieter-wall-14 -1.4 % · dieter-wall-7 -1.4 % · dieter-wall-15 -1.4 % · dieter-wall-9 -1.4 % · dieter-wall-16 -1.4 % · dieter-wall-23 -1.4 % · dieter-wall-1 -1.4 % · dieter-wall-12 -3 % · dieter-wall-10 -3.8 % · dieter-wall-11 -4.4 %

### dieter-brawl · Stufe 10 · 742 Schaden/s · Ausrüstung +276.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -3.5 Schaden/s · Wumms 3.2 Schaden/s · Taktgefühl -4.4 Schaden/s · Bastelgrips -4.6 Schaden/s · Dicke Haut -3.5 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Abriss 71.8 % · Kronkorken-Kelle 10.4 % · Böller unterm Biertisch 9 % · Autoangriff · Flasche kreist 6.2 % · Du schuldest mir Pfand! 2.5 %

**Talente (Schaden mit gegenüber ohne dieses Talent):** dieter-brawl-13 -10.7 % · dieter-brawl-14 -10.7 % · dieter-brawl-15 -10.7 % · dieter-brawl-7 -10.7 % · dieter-brawl-16 -10.7 % · dieter-brawl-11 -17.7 % · dieter-brawl-0 -19.6 % · dieter-brawl-12 -19.6 % · dieter-brawl-10 -30 %

### dieter-brawl · Stufe 20 · 1586 Schaden/s · Ausrüstung +492.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.9 Schaden/s · -0.1 verhindert/s · Wumms 6.4 Schaden/s · -0.1 verhindert/s · Taktgefühl -2.9 Schaden/s · -0.1 verhindert/s · Bastelgrips -9 Schaden/s · Dicke Haut -9 Schaden/s

**Kniffe (Anteil am Schaden):** Abriss 76 % · Kronkorken-Kelle 9.9 % · Böller unterm Biertisch 6.7 % · Autoangriff · Flasche kreist 6.2 % · Du schuldest mir Pfand! 1.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent):** dieter-brawl-18 +8.5 % · dieter-brawl-15 0 % · dieter-brawl-16 0 % · dieter-brawl-25 0 % · dieter-brawl-1 0 % · dieter-brawl-7 -11.3 % · dieter-brawl-17 -11.3 % · dieter-brawl-0 -30.7 % · dieter-brawl-10 -30.7 % · dieter-brawl-11 -30.7 % · dieter-brawl-12 -30.7 % · dieter-brawl-13 -30.7 % · dieter-brawl-14 -30.7 %

### dieter-brew · Stufe 10 · 362 Schaden/s · Ausrüstung +223.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -0.7 Schaden/s · 0.1 verhindert/s · Wumms 2.6 Schaden/s · 0.3 Heilung/s · 0.1 verhindert/s · Taktgefühl -0.8 Schaden/s · 0.1 verhindert/s · Bastelgrips -1.7 Schaden/s · 0.3 Heilung/s · 0.1 verhindert/s · Dicke Haut -0.7 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Fassanstich 60.8 % · Kronkorken-Kelle 19.9 % · Autoangriff · Flasche kreist 13.9 % · Du schuldest mir Pfand! 5.3 %

**Talente (Schaden mit gegenüber ohne dieses Talent):** dieter-brew-12 0 % · dieter-brew-5 0 % · dieter-brew-13 0 % · dieter-brew-14 0 % · dieter-brew-15 0 % · dieter-brew-11 -13.7 % · dieter-brew-10 -18.3 % · dieter-brew-1 -18.3 % · dieter-brew-3 -18.3 %

### dieter-brew · Stufe 20 · 849 Schaden/s · Ausrüstung +523.8 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -4.8 Schaden/s · -1.1 Heilung/s · -0.1 verhindert/s · Wumms 0 Schaden/s · -0.1 verhindert/s · Taktgefühl -4.8 Schaden/s · -0.8 Heilung/s · -0.1 verhindert/s · Bastelgrips -4.9 Schaden/s · 1.7 Heilung/s · -0.2 verhindert/s · Dicke Haut -4.8 Schaden/s · -1.1 Heilung/s

**Kniffe (Anteil am Schaden):** Fassanstich 72 % · Autoangriff · Flasche kreist 14.3 % · Kronkorken-Kelle 9.9 % · Du schuldest mir Pfand! 3.8 %

**Talente (Schaden mit gegenüber ohne dieses Talent):** dieter-brew-14 +2.4 % · dieter-brew-16 +2.4 % · dieter-brew-13 0 % · dieter-brew-15 0 % · dieter-brew-17 0 % · dieter-brew-18 0 % · dieter-brew-0 -1.2 % · dieter-brew-5 -6.2 % · dieter-brew-10 -6.3 % · dieter-brew-1 -6.3 % · dieter-brew-12 -7.7 % · dieter-brew-11 -8 % · dieter-brew-3 -11.7 %

### baerbel-care · Stufe 10 · 441 Schaden/s · Ausrüstung +236.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -1.9 Schaden/s · Wumms 2 Schaden/s · Taktgefühl -2.2 Schaden/s · Bastelgrips -1.9 Schaden/s · 0.5 Heilung/s · Dicke Haut -1.9 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Großreinemachen 83.1 % · Autoangriff · Dauersprühen 9 % · Pinsel-Piekser 5.8 % · Fleckentest, Schätzchen! 2 %

**Talente (Schaden mit gegenüber ohne dieses Talent):** baerbel-care-22 +11.5 % · baerbel-care-7 +11.5 % · baerbel-care-26 +11.5 % · baerbel-care-20 +11.1 % · baerbel-care-18 +8.6 % · baerbel-care-0 -9.6 % · baerbel-care-14 -9.6 % · baerbel-care-3 -10.9 % · baerbel-care-12 -20.8 %

### baerbel-care · Stufe 20 · 943 Schaden/s · Ausrüstung +500.5 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -4.3 Schaden/s · -1 Heilung/s · -0.1 verhindert/s · Wumms 1.1 Schaden/s · -1 Heilung/s · -0.1 verhindert/s · Taktgefühl -5.3 Schaden/s · -0.1 verhindert/s · Bastelgrips 2 Schaden/s · -0.3 Heilung/s · -0.1 verhindert/s · Dicke Haut -4.3 Schaden/s · -1 Heilung/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Großreinemachen 82.1 % · Autoangriff · Dauersprühen 9.1 % · Pinsel-Piekser 5.6 % · Fleckentest, Schätzchen! 3.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent):** baerbel-care-22 0 % · baerbel-care-26 0 % · baerbel-care-9 0 % · baerbel-care-11 0 % · baerbel-care-1 0 % · baerbel-care-10 -0.8 % · baerbel-care-12 -18.3 % · baerbel-care-0 -18.4 % · baerbel-care-14 -18.4 % · baerbel-care-20 -18.4 % · baerbel-care-3 -18.9 % · baerbel-care-18 -20.5 % · baerbel-care-7 -20.5 %

### baerbel-feedback · Stufe 10 · 786 Schaden/s · Ausrüstung +264.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -4.4 Schaden/s · Wumms 2.4 Schaden/s · 0.3 Heilung/s · Taktgefühl -3.4 Schaden/s · Bastelgrips -3 Schaden/s · 0.4 Heilung/s · Dicke Haut -4.4 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 72.8 % · Pinsel-Piekser 8.5 % · Durchputzen 8.1 % · Autoangriff · Dauersprühen 5.3 % · Schimmel 5.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent):** baerbel-feedback-15 +11.6 % · baerbel-feedback-13 +3.8 % · baerbel-feedback-14 +3.8 % · baerbel-feedback-17 0 % · baerbel-feedback-16 -1.1 % · baerbel-feedback-10 -8.3 % · baerbel-feedback-11 -8.3 % · baerbel-feedback-12 -8.3 % · baerbel-feedback-3 -8.3 %

### baerbel-feedback · Stufe 20 · 1512 Schaden/s · Ausrüstung +601 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -8.5 Schaden/s · -1 Heilung/s · -0.1 verhindert/s · Wumms 0 Schaden/s · -0.1 verhindert/s · Taktgefühl -8.5 Schaden/s · -1 Heilung/s · -0.1 verhindert/s · Bastelgrips -9.1 Schaden/s · 0.4 Heilung/s · -0.1 verhindert/s · Dicke Haut -8.5 Schaden/s · -1 Heilung/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Durchputzen 71.8 % · Pinsel-Piekser 9.7 % · Durchputzen 8 % · Autoangriff · Dauersprühen 6 % · Schimmel 4.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent):** baerbel-feedback-23 +1.3 % · baerbel-feedback-15 +1.2 % · baerbel-feedback-17 0 % · baerbel-feedback-0 0 % · baerbel-feedback-1 0 % · baerbel-feedback-16 -8.7 % · baerbel-feedback-18 -10.4 % · baerbel-feedback-10 -12.4 % · baerbel-feedback-11 -12.4 % · baerbel-feedback-12 -12.4 % · baerbel-feedback-3 -12.4 % · baerbel-feedback-13 -12.4 % · baerbel-feedback-14 -12.4 %

### baerbel-stage · Stufe 10 · 871 Schaden/s · Ausrüstung +329.1 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -3.8 Schaden/s · Wumms 3.9 Schaden/s · Taktgefühl -3.8 Schaden/s · Bastelgrips -2.4 Schaden/s · 0.1 Heilung/s · Dicke Haut -3.8 Schaden/s · 0.2 verhindert/s

**Kniffe (Anteil am Schaden):** Auswringen 71.8 % · Grundreinigung auf eigene Gefahr 8.5 % · Pinsel-Piekser 8.4 % · Autoangriff · Dauersprühen 5 % · Auswringen 4.6 % · Fleckentest, Schätzchen! 1.7 %

**Talente (Schaden mit gegenüber ohne dieses Talent):** baerbel-stage-12 +7.6 % · baerbel-stage-10 +7.3 % · baerbel-stage-11 +7.3 % · baerbel-stage-13 +7.3 % · baerbel-stage-5 +2.6 % · baerbel-stage-14 -4.7 % · baerbel-stage-17 -5.4 % · baerbel-stage-15 -5.5 % · baerbel-stage-16 -5.5 %

### baerbel-stage · Stufe 20 · 2100 Schaden/s · Ausrüstung +540.7 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -11.9 Schaden/s · -0.1 verhindert/s · Wumms 0 Schaden/s · -0.1 verhindert/s · Taktgefühl -11.9 Schaden/s · -0.1 verhindert/s · Bastelgrips -11.7 Schaden/s · 0.1 Heilung/s · -0.1 verhindert/s · Dicke Haut -11.9 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Auswringen 74.9 % · Pinsel-Piekser 9.4 % · Grundreinigung auf eigene Gefahr 5 % · Autoangriff · Dauersprühen 5 % · Auswringen 4 % · Fleckentest, Schätzchen! 1.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent):** baerbel-stage-5 +15.4 % · baerbel-stage-11 +14.9 % · baerbel-stage-12 +10.5 % · baerbel-stage-14 +9.2 % · baerbel-stage-16 +9.2 % · baerbel-stage-18 +9.2 % · baerbel-stage-10 +7.9 % · baerbel-stage-13 +7.9 % · baerbel-stage-15 0 % · baerbel-stage-17 0 % · baerbel-stage-0 0 % · baerbel-stage-24 0 % · baerbel-stage-1 0 %

### kevin-fuse · Stufe 10 · 631 Schaden/s · Ausrüstung +236.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -2.7 Schaden/s · Wumms 2.9 Schaden/s · Taktgefühl -2.2 Schaden/s · 0.5 verhindert/s · Bastelgrips -7.8 Schaden/s · Dicke Haut -2.7 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Kurzschluss 37.5 % · Kurzschluss 32 % · Restmüll mit Zündschnur 11.4 % · Pfandgeschoss 10.5 % · Autoangriff · Pfand im Takt 5 % · Lunte 3.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent):** kevin-fuse-1 +17 % · kevin-fuse-13 +1.1 % · kevin-fuse-14 +0.7 % · kevin-fuse-6 0 % · kevin-fuse-15 0 % · kevin-fuse-0 -4.6 % · kevin-fuse-10 -7.3 % · kevin-fuse-11 -7.3 % · kevin-fuse-12 -7.3 %

### kevin-fuse · Stufe 20 · 1239 Schaden/s · Ausrüstung +431 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -7 Schaden/s · -0.1 verhindert/s · Wumms 0 Schaden/s · -0.1 verhindert/s · Taktgefühl -7 Schaden/s · -0.1 verhindert/s · Bastelgrips -7.8 Schaden/s · -0.1 verhindert/s · Dicke Haut -7 Schaden/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Kurzschluss 39.4 % · Kurzschluss 36.7 % · Pfandgeschoss 8.7 % · Restmüll mit Zündschnur 8 % · Autoangriff · Pfand im Takt 4 % · Lunte 3.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent):** kevin-fuse-13 +16.1 % · kevin-fuse-0 +13.3 % · kevin-fuse-1 +11 % · kevin-fuse-10 +11 % · kevin-fuse-11 +11 % · kevin-fuse-18 +8.7 % · kevin-fuse-12 +2.9 % · kevin-fuse-14 +0.7 % · kevin-fuse-6 0 % · kevin-fuse-15 0 % · kevin-fuse-16 0 % · kevin-fuse-17 0 % · kevin-fuse-24 0 %

### kevin-iron · Stufe 10 · 395 Schaden/s · Ausrüstung +223.6 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -1.7 Schaden/s · Wumms 1.8 Schaden/s · Taktgefühl -1.4 Schaden/s · Bastelgrips -2.6 Schaden/s · Dicke Haut -1.7 Schaden/s

**Kniffe (Anteil am Schaden):** Robbi 38.2 % · Überlast 35 % · Pfandgeschoss 21.7 % · Kleb die Scheiße fest 4.1 % · Autoangriff · Pfand im Takt 1.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent):** kevin-iron-4 +2.6 % · kevin-iron-14 +2.6 % · kevin-iron-15 0 % · kevin-iron-7 0 % · kevin-iron-8 0 % · kevin-iron-12 -2.2 % · kevin-iron-11 -5.3 % · kevin-iron-13 -5.3 % · kevin-iron-10 -6.8 %

### kevin-iron · Stufe 20 · 737 Schaden/s · Ausrüstung +321.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -4.2 Schaden/s · Wumms 0 Schaden/s · Taktgefühl -4.2 Schaden/s · Bastelgrips 2.5 Schaden/s · Dicke Haut -4.2 Schaden/s

**Kniffe (Anteil am Schaden):** Überlast 46.7 % · Robbi 30.5 % · Pfandgeschoss 18.7 % · Kleb die Scheiße fest 2.8 % · Autoangriff · Pfand im Takt 1.2 %

**Talente (Schaden mit gegenüber ohne dieses Talent):** kevin-iron-15 0 % · kevin-iron-7 0 % · kevin-iron-8 0 % · kevin-iron-16 0 % · kevin-iron-0 0 % · kevin-iron-17 0 % · kevin-iron-1 0 % · kevin-iron-11 -5.9 % · kevin-iron-13 -5.9 % · kevin-iron-4 -7.4 % · kevin-iron-14 -7.4 % · kevin-iron-12 -27.4 % · kevin-iron-10 -31.3 %

### kevin-hunt · Stufe 10 · 396 Schaden/s · Ausrüstung +271.9 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -1.7 Schaden/s · -0.2 Heilung/s · Wumms 1.8 Schaden/s · 0.2 Heilung/s · Taktgefühl -2 Schaden/s · -0.2 Heilung/s · Bastelgrips -4.1 Schaden/s · -0.3 Heilung/s · 0.3 verhindert/s · Dicke Haut -1.7 Schaden/s · -0.2 Heilung/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll-Rakete 59.8 % · Pfandgeschoss 18 % · Restmüll mit Zündschnur 10.6 % · Autoangriff · Pfand im Takt 8 % · Kleb die Scheiße fest 3.6 %

**Talente (Schaden mit gegenüber ohne dieses Talent):** kevin-hunt-10 +4.5 % · kevin-hunt-11 +4.5 % · kevin-hunt-2 +4.5 % · kevin-hunt-12 +4.5 % · kevin-hunt-13 +4.5 % · kevin-hunt-5 +4.5 % · kevin-hunt-16 +4.5 % · kevin-hunt-14 0 % · kevin-hunt-15 0 %

### kevin-hunt · Stufe 20 · 906 Schaden/s · Ausrüstung +468.2 % gegenüber Startausrüstung

**Wert je Punkt:** Standfestigkeit -5.1 Schaden/s · -0.8 Heilung/s · -0.1 verhindert/s · Wumms 0 Schaden/s · -0.1 verhindert/s · Taktgefühl -5.1 Schaden/s · -0.8 Heilung/s · -0.1 verhindert/s · Bastelgrips -6.1 Schaden/s · -0.6 Heilung/s · Dicke Haut -5.1 Schaden/s · -0.8 Heilung/s · 0.1 verhindert/s

**Kniffe (Anteil am Schaden):** Restmüll-Rakete 70.6 % · Pfandgeschoss 13.1 % · Restmüll mit Zündschnur 7.3 % · Autoangriff · Pfand im Takt 7 % · Kleb die Scheiße fest 2.1 %

**Talente (Schaden mit gegenüber ohne dieses Talent):** kevin-hunt-15 +19.4 % · kevin-hunt-17 +19.4 % · kevin-hunt-10 +16.1 % · kevin-hunt-11 +16.1 % · kevin-hunt-2 +16.1 % · kevin-hunt-12 +16.1 % · kevin-hunt-13 +16.1 % · kevin-hunt-5 +16.1 % · kevin-hunt-14 0 % · kevin-hunt-0 0 % · kevin-hunt-23 0 % · kevin-hunt-1 0 % · kevin-hunt-16 -2.3 %

