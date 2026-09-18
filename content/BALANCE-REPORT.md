# Balance-Bericht

Automatisch erzeugt von `node scripts/balance-report.mjs` · 2026-09-18 · stehender Kampf, 3 Seeds je Zelle, fünf repräsentative Ausrüstungsteile der Stufe einschließlich Fernkampfplatz (ab Stufe 6 selten), keine vollständige Bestückung aller 16 Plätze, alle Talente der Spezialisierung Seed % 3.

Lesart: **Zeit bis zum Kill / verlorenes Leben**. ☠ = stirbt in allen Läufen, ⚠ = stirbt manchmal, ⏳ = über dem Korridor auf eigener Stufe (zäh), ⚡ = unter dem Korridor auf eigener Stufe (zu schnell), · = unter 2,5 s drei Stufen darüber (trivial). * = Wert über `content/tuning.js` korrigiert (Fußnote unten). Korridor auf eigener Stufe: Feld 4–12 s, Elite 8–24 s, Boss 10–25 s. EP je Stufe: 140 × Stufe (Stufe 6 = 2100 EP gesamt).

| Gegner (St.) | Spielerstufe | Dieter | Bärbel | Kevin |
|---|---:|---|---|---|
| Pfanddachs (1) | 1 | 3 s / −3 % ⚡ | 3.3 s / −3 % ⚡ | 4.1 s / −3 % |
| Pfanddachs (1) | 3 | 3.1 s / −3 % | 3.4 s / −2 % | 3.5 s / −2 % |
| Pfanddachs (1) | 6 | 2.8 s / −1 % | 2.9 s / −0 % | 2.8 s / −0 % |
| Pfanddachs (1) | 10 | 2.5 s / −1 % | 2.1 s / −0 % · | 2.2 s / −0 % · |
| Pfanddachs (1) | 15 | 1.7 s / −0 % · | 1.8 s / −0 % · | 1.8 s / −0 % · |
| Grillgut-Gans * (1) | 1 | 3.2 s / −2 % ⚡ | 3.3 s / −4 % ⚡ | 4.3 s / −5 % |
| Grillgut-Gans * (1) | 3 | 3.2 s / −3 % | 3.3 s / −2 % | 3.8 s / −1 % |
| Grillgut-Gans * (1) | 6 | 3.1 s / −1 % | 2.9 s / −0 % | 3 s / −0 % |
| Grillgut-Gans * (1) | 10 | 2.5 s / −0 % | 2.4 s / −0 % · | 2.4 s / −0 % · |
| Grillgut-Gans * (1) | 15 | 2.2 s / −0 % · | 1.9 s / −0 % · | 1.8 s / −0 % · |
| Pfandkeiler (2) | 1 | 4.3 s / −8 % | 4.3 s / −10 % | 5.3 s / −22 % |
| Pfandkeiler (2) | 2 | 4 s / −9 % | 3.7 s / −4 % ⚡ | 4.7 s / −10 % |
| Pfandkeiler (2) | 3 | 4 s / −5 % | 3.7 s / −2 % | 5.1 s / −9 % |
| Pfandkeiler (2) | 6 | 3.6 s / −1 % | 3.4 s / −0 % | 3.6 s / −0 % |
| Pfandkeiler (2) | 10 | 2.7 s / −1 % | 2.6 s / −0 % | 2.5 s / −0 % |
| Pfandkeiler (2) | 15 | 2.3 s / −1 % · | 2.1 s / −0 % · | 2.1 s / −0 % · |
| Ruhewart auf Streife (3) | 1 | 6.2 s / −15 % | 5.7 s / −17 % | 6.8 s / −22 % |
| Ruhewart auf Streife (3) | 3 | 4.3 s / −3 % | 4.7 s / −4 % | 5.7 s / −17 % |
| Ruhewart auf Streife (3) | 6 | 3.7 s / −1 % | 3.5 s / −0 % | 4 s / −0 % |
| Ruhewart auf Streife (3) | 10 | 3.2 s / −1 % | 3 s / −0 % | 3.6 s / −0 % |
| Ruhewart auf Streife (3) | 15 | 2.6 s / −1 % | 2.6 s / −0 % | 3 s / −0 % |
| Leergut-Rabe * (1) | 1 | 2.8 s / −3 % ⚡ | 3 s / −4 % ⚡ | 4 s / −4 % |
| Leergut-Rabe * (1) | 3 | 3.2 s / −3 % | 3.2 s / −2 % | 3.8 s / −1 % |
| Leergut-Rabe * (1) | 6 | 2.9 s / −1 % | 2.9 s / −0 % | 2.9 s / −0 % |
| Leergut-Rabe * (1) | 10 | 2.5 s / −1 % | 2.1 s / −0 % · | 2.2 s / −0 % · |
| Leergut-Rabe * (1) | 15 | 2.2 s / −0 % · | 1.8 s / −0 % · | 1.8 s / −0 % · |
| Pfandfuchs (2) | 1 | 3.2 s / −5 % | 3.3 s / −8 % | 4.3 s / −12 % |
| Pfandfuchs (2) | 2 | 3.6 s / −4 % ⚡ | 3 s / −6 % ⚡ | 4 s / −7 % |
| Pfandfuchs (2) | 3 | 3.4 s / −4 % | 3.7 s / −7 % | 3.8 s / −5 % |
| Pfandfuchs (2) | 6 | 3.1 s / −1 % | 3 s / −0 % | 3 s / −0 % |
| Pfandfuchs (2) | 10 | 2.5 s / −1 % | 2.4 s / −0 % · | 2.4 s / −0 % · |
| Pfandfuchs (2) | 15 | 2.2 s / −1 % · | 2.1 s / −0 % · | 1.8 s / −0 % · |
| Festzelt-Schnorrer (2) | 1 | 5.1 s / −7 % | 5 s / −6 % | 5.7 s / −8 % |
| Festzelt-Schnorrer (2) | 2 | 4.8 s / −8 % | 4.6 s / −5 % | 5.6 s / −5 % |
| Festzelt-Schnorrer (2) | 3 | 4.3 s / −8 % | 4.2 s / −3 % | 5.7 s / −7 % |
| Festzelt-Schnorrer (2) | 6 | 3.7 s / −1 % | 3.5 s / −0 % | 4.6 s / −0 % |
| Festzelt-Schnorrer (2) | 10 | 3 s / −1 % | 2.9 s / −0 % | 3.1 s / −0 % |
| Festzelt-Schnorrer (2) | 15 | 2.5 s / −1 % | 2.5 s / −1 % | 2.9 s / −0 % |
| Ordnungsamt-Praktikant (3) | 1 | 6.4 s / −14 % | 6.7 s / −25 % | 8.5 s / −27 % |
| Ordnungsamt-Praktikant (3) | 3 | 4.3 s / −3 % | 5.6 s / −15 % | 5.7 s / −17 % |
| Ordnungsamt-Praktikant (3) | 6 | 3.7 s / −1 % | 4.1 s / −0 % | 5.1 s / −0 % |
| Ordnungsamt-Praktikant (3) | 10 | 3.3 s / −1 % | 3.1 s / −0 % | 3.7 s / −0 % |
| Ordnungsamt-Praktikant (3) | 15 | 2.9 s / −1 % | 2.9 s / −0 % | 3.5 s / −0 % |
| Kegelbruder aus Kalt (3) | 1 | 6.4 s / −14 % | 6 s / −19 % | 7.7 s / −22 % |
| Kegelbruder aus Kalt (3) | 3 | 4.3 s / −10 % | 5.3 s / −13 % | 5.7 s / −10 % |
| Kegelbruder aus Kalt (3) | 6 | 4 s / −3 % | 5.4 s / −5 % | 4.8 s / −0 % |
| Kegelbruder aus Kalt (3) | 10 | 3.4 s / −1 % | 3.5 s / −0 % | 3.3 s / −0 % |
| Kegelbruder aus Kalt (3) | 15 | 2.8 s / −1 % | 2.7 s / −0 % | 2.5 s / −0 % |
| Junggeselle im Game-Over-Shirt * (4) | 3 | 4.3 s / −4 % | 7.2 s / −18 % | 5.7 s / −13 % |
| Junggeselle im Game-Over-Shirt * (4) | 4 | 4.2 s / −4 % | 4.6 s / −7 % | 5.7 s / −12 % |
| Junggeselle im Game-Over-Shirt * (4) | 6 | 4.6 s / −3 % | 5.5 s / −7 % | 6 s / −0 % |
| Junggeselle im Game-Over-Shirt * (4) | 10 | 3.8 s / −1 % | 5 s / −4 % | 4.4 s / −0 % |
| Junggeselle im Game-Over-Shirt * (4) | 15 | 3.4 s / −1 % | 3.4 s / −0 % | 3.5 s / −0 % |
| Borsten-Bruno (4) | 3 | 6.5 s / −24 % | 11.4 s / −28 % | 9.4 s / −31 % |
| Borsten-Bruno (4) | 4 | 5.5 s / −17 % ⚡ | 8.7 s / −27 % | 8.7 s / −23 % |
| Borsten-Bruno (4) | 6 | 4.6 s / −5 % | 6.8 s / −7 % | 6 s / −1 % |
| Borsten-Bruno (4) | 10 | 4.3 s / −3 % | 5.6 s / −4 % | 5.6 s / −0 % |
| Borsten-Bruno (4) | 15 | 4.3 s / −3 % | 5 s / −2 % | 5 s / −0 % |
| Oberpraktikant Olaf (4) | 3 | 7 s / −18 % | 11.9 s / −19 % | 11.5 s / −15 % |
| Oberpraktikant Olaf (4) | 4 | 6.1 s / −17 % ⚡ | 8.7 s / −11 % | 9.3 s / −12 % |
| Oberpraktikant Olaf (4) | 6 | 4.6 s / −4 % | 7.1 s / −0 % | 7.7 s / −0 % |
| Oberpraktikant Olaf (4) | 10 | 4.3 s / −3 % | 5.6 s / −0 % | 5.9 s / −0 % |
| Oberpraktikant Olaf (4) | 15 | 4.3 s / −2 % | 5.6 s / −0 % | 5.6 s / −0 % |
| Horst Nüchternmann (4) | 3 | 14.6 s / −35 % | 25.9 s / −40 % | 19.8 s / −49 % |
| Horst Nüchternmann (4) | 4 | 12.1 s / −22 % | 15.8 s / −27 % | 15.4 s / −28 % |
| Horst Nüchternmann (4) | 6 | 9 s / −8 % | 11.3 s / −6 % | 11.2 s / −4 % |
| Horst Nüchternmann (4) | 10 | 7.4 s / −4 % | 10.5 s / −5 % | 10.5 s / −1 % |
| Horst Nüchternmann (4) | 15 | 4.7 s / −1 % | 6.9 s / −4 % | 6.9 s / −0 % |
| Sperrmüll-Sigi (5) | 3 | 15.6 s / −34 % | 32 s / −50 % | 21.5 s / −46 % |
| Sperrmüll-Sigi (5) | 5 | 15 s / −21 % | 18.8 s / −19 % | 18.4 s / −15 % |
| Sperrmüll-Sigi (5) | 6 | 10 s / −7 % | 14.7 s / −15 % | 14.7 s / −9 % |
| Sperrmüll-Sigi (5) | 10 | 8.3 s / −3 % | 10.5 s / −1 % | 10.8 s / −0 % |
| Sperrmüll-Sigi (5) | 15 | 6 s / −2 % | 8.5 s / −1 % | 9.9 s / −0 % |
| Kegelkönig Klaus * (6) | 6 | 13.6 s / −16 % | 18.2 s / −16 % | 18 s / −11 % |
| Kegelkönig Klaus * (6) | 10 | 9.1 s / −3 % | 13.4 s / −7 % | 14.7 s / −8 % |
| Kegelkönig Klaus * (6) | 15 | 8.3 s / −3 % | 10.8 s / −2 % | 10.8 s / −0 % |
| Trauzeuge Timo * (7) | 6 | 14.5 s / −16 % | 20.7 s / −17 % | 19.7 s / −14 % |
| Trauzeuge Timo * (7) | 7 | 13.1 s / −14 % | 18.5 s / −14 % | 18.1 s / −10 % |
| Trauzeuge Timo * (7) | 10 | 11.1 s / −6 % | 14.7 s / −10 % | 15.6 s / −8 % |
| Trauzeuge Timo * (7) | 15 | 8.5 s / −3 % | 11.3 s / −2 % | 11.8 s / −2 % |
| Gisela Gießkanne (6) | 6 | 12.4 s / −11 % | 15.9 s / −14 % | 14.7 s / −7 % |
| Gisela Gießkanne (6) | 10 | 8.5 s / −5 % | 11.5 s / −5 % | 11.4 s / −2 % |
| Gisela Gießkanne (6) | 15 | 7.5 s / −5 % | 10.5 s / −3 % | 10.5 s / −0 % |
| Der Pfandautomat 3000 (9) | 9 | 10.6 s / −5 % | 17.5 s / −11 % | 16.7 s / −5 % |
| Der Pfandautomat 3000 (9) | 10 | 9.9 s / −3 % | 15.8 s / −7 % | 15.4 s / −5 % |
| Der Pfandautomat 3000 (9) | 15 | 7.4 s / −2 % | 11.7 s / −4 % | 10 s / −0 % |

## Auffälligkeiten

- Pfanddachs fällt für dieter auf eigener Stufe in 3 s statt mindestens 4 s – zu schnell für den Korridor.
- Pfanddachs fällt für baerbel auf eigener Stufe in 3.3 s statt mindestens 4 s – zu schnell für den Korridor.
- Grillgut-Gans fällt für dieter auf eigener Stufe in 3.2 s statt mindestens 4 s – zu schnell für den Korridor.
- Grillgut-Gans fällt für baerbel auf eigener Stufe in 3.3 s statt mindestens 4 s – zu schnell für den Korridor.
- Pfandkeiler fällt für baerbel auf eigener Stufe in 3.7 s statt mindestens 4 s – zu schnell für den Korridor.
- Leergut-Rabe fällt für dieter auf eigener Stufe in 2.8 s statt mindestens 4 s – zu schnell für den Korridor.
- Leergut-Rabe fällt für baerbel auf eigener Stufe in 3 s statt mindestens 4 s – zu schnell für den Korridor.
- Pfandfuchs fällt für dieter auf eigener Stufe in 3.6 s statt mindestens 4 s – zu schnell für den Korridor.
- Pfandfuchs fällt für baerbel auf eigener Stufe in 3 s statt mindestens 4 s – zu schnell für den Korridor.
- Borsten-Bruno fällt für dieter auf eigener Stufe in 5.5 s statt mindestens 8 s – zu schnell für den Korridor.
- Oberpraktikant Olaf fällt für dieter auf eigener Stufe in 6.1 s statt mindestens 8 s – zu schnell für den Korridor.

## Umland: Feldgegner mit Spielerstufen-Skalierung

Dieselben Arten, wie sie jenseits von `SPAWN_TABLES.tierDistance` wirklich erscheinen: `encounters.scaledStats` hebt Leben und Schaden auf (Spielerstufe − `BALANCE.enemies.playerLead`). Der Dorfkern bleibt auf den Werten der Haupttabelle – deshalb steht die Triviality-Frage (`·`) für diese Arten nur hier und nicht oben.

| Gegner (St.) | Spielerstufe | Leben | Dieter | Bärbel | Kevin |
|---|---:|---:|---|---|---|
| Pfanddachs (1) | 1 | 360 | 3 s / −3 % ⚡ | 3.3 s / −3 % ⚡ | 4.1 s / −3 % |
| Pfanddachs (1) | 3 | 360 | 3.1 s / −3 % | 3.4 s / −2 % | 3.5 s / −2 % |
| Pfanddachs (1) | 6 | 490 | 3.6 s / −1 % | 3.8 s / −0 % | 3.6 s / −0 % |
| Pfanddachs (1) | 10 | 662 | 3.4 s / −1 % | 3.5 s / −0 % | 3.5 s / −0 % |
| Pfanddachs (1) | 15 | 878 | 3.4 s / −1 % | 3.5 s / −0 % | 3.5 s / −0 % |
| Grillgut-Gans (1) | 1 | 390 | 3.2 s / −2 % ⚡ | 3.3 s / −4 % ⚡ | 4.3 s / −5 % |
| Grillgut-Gans (1) | 3 | 390 | 3.2 s / −3 % | 3.3 s / −2 % | 3.8 s / −1 % |
| Grillgut-Gans (1) | 6 | 530 | 3.7 s / −1 % | 3.5 s / −0 % | 3.8 s / −0 % |
| Grillgut-Gans (1) | 10 | 718 | 3.8 s / −1 % | 3.5 s / −0 % | 3.8 s / −0 % |
| Grillgut-Gans (1) | 15 | 952 | 3.8 s / −1 % | 3.5 s / −0 % | 3.5 s / −0 % |
| Pfandkeiler (2) | 3 | 460 | 4 s / −5 % | 3.7 s / −2 % | 5.1 s / −9 % |
| Pfandkeiler (2) | 6 | 570 | 4 s / −2 % | 3.9 s / −3 % | 4.1 s / −0 % |
| Pfandkeiler (2) | 10 | 791 | 3.8 s / −2 % | 4.3 s / −3 % | 4.4 s / −0 % |
| Pfandkeiler (2) | 15 | 1067 | 3.8 s / −2 % | 4.7 s / −6 % | 4.4 s / −0 % |
| Ruhewart auf Streife (3) | 3 | 600 | 4.3 s / −3 % | 4.7 s / −4 % | 5.7 s / −17 % |
| Ruhewart auf Streife (3) | 6 | 672 | 3.7 s / −1 % | 4 s / −0 % | 5.1 s / −0 % |
| Ruhewart auf Streife (3) | 10 | 960 | 3.6 s / −1 % | 3.8 s / −0 % | 4.8 s / −0 % |
| Ruhewart auf Streife (3) | 15 | 1320 | 4 s / −1 % | 4.3 s / −0 % | 4.8 s / −0 % |
| Leergut-Rabe (1) | 1 | 380 | 2.8 s / −3 % ⚡ | 3 s / −4 % ⚡ | 4 s / −4 % |
| Leergut-Rabe (1) | 3 | 380 | 3.2 s / −3 % | 3.2 s / −2 % | 3.8 s / −1 % |
| Leergut-Rabe (1) | 6 | 517 | 3.7 s / −1 % | 3.5 s / −0 % | 3.5 s / −0 % |
| Leergut-Rabe (1) | 10 | 699 | 3.8 s / −1 % | 3.3 s / −0 % | 3.5 s / −0 % |
| Leergut-Rabe (1) | 15 | 927 | 3.8 s / −1 % | 3.5 s / −0 % | 3.5 s / −0 % |
| Pfandfuchs (2) | 3 | 400 | 3.4 s / −4 % | 3.7 s / −7 % | 3.8 s / −5 % |
| Pfandfuchs (2) | 6 | 496 | 3.7 s / −2 % | 3.5 s / −1 % | 3.5 s / −0 % |
| Pfandfuchs (2) | 10 | 688 | 3.6 s / −1 % | 3.5 s / −2 % | 3.5 s / −0 % |
| Pfandfuchs (2) | 15 | 928 | 3.5 s / −1 % | 3.5 s / −3 % | 3.5 s / −0 % |
| Festzelt-Schnorrer (2) | 3 | 520 | 4.3 s / −8 % | 4.2 s / −3 % | 5.7 s / −7 % |
| Festzelt-Schnorrer (2) | 6 | 645 | 4 s / −2 % | 4.8 s / −0 % | 4.8 s / −0 % |
| Festzelt-Schnorrer (2) | 10 | 894 | 4.1 s / −2 % | 4.6 s / −0 % | 4.9 s / −0 % |
| Festzelt-Schnorrer (2) | 15 | 1206 | 4 s / −3 % | 4.8 s / −0 % | 5.2 s / −0 % |
| Ordnungsamt-Praktikant (3) | 3 | 700 | 4.3 s / −3 % | 5.6 s / −15 % | 5.7 s / −17 % |
| Ordnungsamt-Praktikant (3) | 6 | 784 | 4 s / −1 % | 4.8 s / −1 % | 5.1 s / −0 % |
| Ordnungsamt-Praktikant (3) | 10 | 1120 | 4.3 s / −1 % | 5.2 s / −1 % | 4.8 s / −0 % |
| Ordnungsamt-Praktikant (3) | 15 | 1540 | 4.3 s / −1 % | 5.2 s / −1 % | 4.8 s / −0 % |

- Keine Art fällt im Umland unter 2,5 s.

## Tuning-Korrekturen

- * `goose` (Grillgut-Gans): hp = 390 · zu dünn an beiden Enden: auf eigener Stufe 1 nur 1,4/3,3/3,7 s (Korridor 4–12 s), im Umland auf Stufe 10 für Dieter 2,4 s (trivial). +30 % Grundleben wirkt an beiden Stellen, weil die Engine im Umland darauf aufsetzt · seit 2026-09-17
- * `raven` (Leergut-Rabe): hp = 380 · wie die Gans: Stufe 1 nur 1,4/2,5/3,0 s, im Umland auf Stufe 10 für Dieter 2,3 s. +31 % Grundleben · seit 2026-09-17
- * `jga` (Junggeselle im Game-Over-Shirt): hp = 840 · Feldgegner-Korridor 4–12 s auf eigener Stufe: Junggeselle fiel für Bärbel auf Stufe 4 in 3,9 s; +17 % Leben ergibt 4,6 s, Kevin 5,6 s · seit 2026-09-17
- * `klaus` (Kegelkönig Klaus): hp = 4800 · Boss-Korridor 10–25 s auf eigener Stufe: Kegelkönig Klaus fiel für Dieter auf Stufe 6 in 9,0 s; +14 % Leben ergibt 10,2 s, Bärbel 18,2 s und Kevin 16,8 s bleiben klar unter 25 s · seit 2026-09-17
- * `timo` (Trauzeuge Timo): hp = 5300 · Boss-Korridor 10–25 s: Trauzeuge Timo fiel für Dieter auf eigener Stufe 7 in 9,4 s; +10 % Leben ergibt 10,5 s, Bärbel 18,5 s und Kevin 17,0 s · seit 2026-09-17

Die Fachrolle pflegt diese Zeilen bei Gelegenheit in die Definition ein und löscht sie aus `content/tuning.js`.

Grenzen: keine Ausweichbewegung, kein Kiting, kein Positionsspiel, keine Verpflegung. Bosse und Elite sollen ohne Ausweichen tödlich sein; Feldgegner nicht.
