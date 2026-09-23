# Grafiklieferung · 23.09.2026

Die [Übergabe vom 23.09.](UEBERGABE-GRAFIK-2026-09-23.md) ist vollständig umgesetzt: zwölf neue Rastermotive mit dem eingebauten Imagegen-Werkzeug erzeugt und im Spiel angebunden.

| Lieferung | Laufzeitformat | Einbindung |
|---|---|---|
| Sechs individuelle `bude-truemmer-*` | je 152×108, transparent | Stufe 0 des zugehörigen Gebäudes; Größenfaktor 0,9 für erkennbare Details |
| `bude-schild` | 176×208 inklusive 8 px Rand, transparent | 40×48 Welteinheiten; Holzschild am südlichen Rand der Baustelle ersetzt den schwebenden Titel |
| `intro-filmriss`, `intro-maifeld` | je 1280×720 | Szenen 1 und 5; vollständig sichtbares Bild zwischen Untertiteln und Bedienung |
| `ui-levelup-crest` | 320×120, transparent | Hopfenkranz hinter dem Stufenaufstieg |
| `ui-unlock-seal` | 24×24, transparent | Roter Bierdeckel für neue Menüeinträge |
| `kiosk-aussenwand` | 192×192, neun 64×64-Kacheln | Backsteinrahmen, Ecken und beleuchtete Schaufenster; Ausgang bleibt offen |

Prop-Dateien tragen wie bisher das Präfix `prop-`; öffentliche Motiv-IDs sind zusätzlich als Katalog-Aliase registriert. Originale liegen unter `assets/precision/sources/2026-09-23/`, Exporte unter `assets/precision/runtime/{props,intro,ui,tiles}/`. Aktiver Katalog: `assets/precision/runtime/catalog.json`.

## Herkunft und reproduzierbarer Export

- Exakte Prompts und Exportparameter: [grafik-20260923-jobs.json](../tools/sprite-pipeline/grafik-20260923-jobs.json).
- Quelldateien, Werkzeug und SHA-256: [generation.json](../assets/precision/generation.json).
- Export: `npm run sprites:precision`, anschließend `node scripts/pwa-cache.mjs`.
- Exportmodul: [precision-september.mjs](../tools/sprite-pipeline/precision-september.mjs). Verwendet direkt die detaillierten Originale, die vorhandene Farbpalette und binäres Alpha. Keine Quelle wird durch den Export überschrieben.
- Der Offline-Cache enthält alle zwölf Laufzeitdateien; Quellen und Review-Bilder bleiben außerhalb des Caches.

## Abnahme

`npm test`: **683 bestanden, 0 fehlgeschlagen**. Einschließlich Byte-Reproduzierbarkeit, Quellprüfsummen, Farbpalette, Alpha, Weltplatzierung und Cache-Abdeckung. `npm run build`: Quellen-Wächter und Build-Selbstprüfung erfolgreich.

`node scripts/grafik-20260923-check.mjs`: alle zwölf Bilder geladen, sechs unterschiedliche Trümmer und Schild in der Szene, echter Stufenaufstieg mit Kranz, neues Berufemenü mit Siegel, beide Intro-Szenen auf Desktop und 390×844 ohne Überlagerung der Bedienelemente, Kioskrahmen mit benutzbarem Ausgang. **Keine JavaScript-Fehler im Browser.**

Die Bildabnahme führte zu zwei Korrekturen: größere Trümmerdarstellung und eine ausdrücklich einspaltige Intro-Anordnung. Der bestehende Kamerafilm bleibt bei Szenen ohne Bild oder bei einem Bildladefehler verfügbar.

[Prüfergebnis](../assets/precision/review/2026-09-23/result.json) · [Baustelle](../assets/precision/review/2026-09-23/bude-desktop.jpg) · [Stufenaufstieg](../assets/precision/review/2026-09-23/levelup.jpg) · [Intro Desktop](../assets/precision/review/2026-09-23/intro-filmriss-desktop.jpg) · [Intro Handy](../assets/precision/review/2026-09-23/intro-maifeld-phone.jpg) · [Kiosk](../assets/precision/review/2026-09-23/kiosk-desktop.jpg) · [Neu-Siegel](../assets/precision/review/2026-09-23/unlock.jpg)

## Zweite Runde: 22 Symbole direkt aus der Sitzung (E-51)

Erste Runde über den neuen Direktweg ([BILDPIPELINE-DIREKT-2026-09-23.md](BILDPIPELINE-DIREKT-2026-09-23.md)): `npm run sprites:generate -- tools/sprite-pipeline/items-20260923-jobs.json`, ohne Übergabesitzung. Zwei Probemotive (`kraeutersud`, `ui-tab-talente`) zuerst, danach die übrigen 20 in einem Lauf.

| Lieferung | Laufzeitformat | Einbindung |
|---|---|---|
| 21 Gegenstände: `pfandbon`, `kabelbinder`, `palettenholz`, `jga-shirt`, `kabeltalisman`, `blechtalisman`, `keilerzahn`, `gansorden`, `dachsdeckel`, `ruhepfeife`, `horststempel`, `dienstmuetze`, `sigizange`, `koenigskette`, `schaerpe`, `feldkraut`, `brauwasser`, `leerflasche`, `kraeutersud`, `hopfenschorle`, `feldtee` | je 48×48 mit 4 px Rand, transparent | Automatisch über die Gegenstands-ID (`itemArt()` in `rpg-ui.js` nimmt das Katalogbild vor dem alten Ersatzsymbol): Rucksack, Tooltip, Händler, Aktionsleiste |
| `ui-tab-talente` | 48×48, transparent | Buch-Reiter „Talente“ (`ui-art.js`, vorher `ui-elite-badge`) |

- Export: [precision-september.mjs](../tools/sprite-pipeline/precision-september.mjs) liest jetzt beide Auftragsblätter des Tages; Katalog 373 Assets, nur ergänzt (22 neu, kein bestehender Eintrag verändert).
- Herkunft: 22 neue Einträge in [generation.json](../assets/precision/generation.json) mit `via: codex exec …`. `imagegen.mjs` schreibt die Herkunft jetzt nach jedem Bild (vorher erst am Laufende: ein Abbruch hätte fertige Bilder ohne Herkunft hinterlassen, die ein Folgelauf überspringt) und mit der Einrückung der Datei (2 statt 1 Leerzeichen).
- Bildabnahme der Originale: alle 22 treffen ihren Auftrag, echte Transparenz (Motiv-Alpha 250–253, wie die erste Runde). `kabeltalisman` und `gansorden` berühren oben mit wenigen Konturpixeln den Bildrand; bei 48 px unsichtbar, nicht nachgezogen.
- Schwächstes Motiv: `sigizange` — dünne, dunkle Silhouette, auf dunklem Grund in 48 px am schwächsten lesbar. Bei Bedarf mit `--only=sigizange --force` und hellerem Griff/dickeren Backen nachziehen.

**Abnahme:** `npm test` 691/691. `node scripts/items-20260923-check.mjs`: 22 Bilder geladen, Rucksack zeichnet alle 21 Gegenstände aus dem Katalog (Desktop und 390×844), Talente-Reiter zeigt `ui-tab-talente` (Übereinstimmung 0,80 gegenüber 0,24 zum alten Abzeichen). `npm run ui:check`, `npm run shop:check` und `node scripts/grafik-20260923-check.mjs` (Erwartung jetzt 34 Bilder mit `delivery: 2026-09-23`) grün, **keine JavaScript-Fehler**.

[Prüfergebnis](../assets/precision/review/2026-09-23/items/result.json) · [Rucksack Desktop](../assets/precision/review/2026-09-23/items/rucksack-desktop.jpg) · [Rucksack Handy](../assets/precision/review/2026-09-23/items/rucksack-phone.jpg) · [Talente Desktop](../assets/precision/review/2026-09-23/items/talente-desktop.jpg) · [Talente Handy](../assets/precision/review/2026-09-23/items/talente-phone.jpg)
