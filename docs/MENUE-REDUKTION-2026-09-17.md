# Menü-Reduktion · 2026-09-17 (E-27)

Auftrag der Produktion: „Die Menüs sind viel zu viel. Reduziere auf das Notwendigste oder baue eine intelligentere Navigation." Beides: weniger Ziele **und** eine Navigation, die innerhalb eines Reiters führt.

## 1 · Inventur vorher (Stand 0.21, Branch `ui-mmo-2026-09-17` vor dieser Runde)

| Ebene | Ziele | Was davon doppelt war |
|---|---|---|
| Clanbuch-Reiter | 7 (Figur, Rucksack, Kniffe, Aufträge, Bude, Karte, Hilfe) | Kniffe und Talente sind Teil der Figur; Bude und Erinnerungen sind Story-Fortschritt wie die Aufträge |
| HUD-Menüleiste | 6 Knöpfe (C I K J M H) | jeder Knopf ein Reiter, der auch im Buch steht |
| Weltknöpfe | 3 (Ton, Pause, Vollbild) + Journal-Symbol am Auftragskasten | alle auch unter Hilfe → Einstellungen bzw. Reiter Aufträge |
| Unterreiter/Chips | Kniffe 2 · Hilfe 4 · Karte 4 · Aufträge 4 | „Alle" = Aktiv+Im Dorf+Erledigt; „Legende" gehört zu Orte; „Überblick" zu Tasten |
| Figur-Abschnitte | 5 (Ausrüstung, Werte, Verwalten, Talente, Bande) | „Verwalten" bestand aus einem Knopf und einem Rucksack-Link |
| Touch-Kontextraster | 14 Einträge | Charakter/Figur wechseln/Talente/Skillbuch = ein Reiter; Ton/Vollbild/Admin in Einstellungen |
| **Summe** | **50 Navigationsziele** | |

## 2 · Zielbild nachher

```
┌ Clanbuch ────────────────────────────────────────── ✕ ┐
│  Figur   Rucksack   Aufträge   Karte              [?]  │   ← 4 Reiter + Hilfe als Symbol
├────────────────────────────────────────────────────────┤
│  Ausrüstung · Kniffe · Talente · Werte · Bande         │   ← Sprungleiste: klebt oben, führt hin, läuft mit
│  …                                                     │
└────────────────────────────────────────────────────────┘
```

| Ebene | Ziele | Änderung |
|---|---|---|
| Clanbuch-Reiter | 4 + Hilfe-Symbol | Kniffe → Abschnitt in Figur (Raster und Aktionsplätze in einer Ansicht); Bude + Erinnerungen → Abschnitte in Aufträge |
| Sprungleisten | Figur 5 · Aufträge 3 | neu: `panel-pages.js` `jumpBar()`, ab drei Abschnitten; `scroll-margin-top` hält die Überschrift unter der Leiste frei |
| HUD-Menüleiste | 4 (C I J M) | Hilfe über H oder das Symbol im Buch |
| Weltknöpfe | 0 am Desktop | Ton/Pause/Vollbild nur Hilfe → Einstellungen (Elemente bleiben im DOM, Touch-Raster und Einstellungen rufen sie) |
| Unterreiter/Chips | Hilfe 3 · Karte 3 · Aufträge 3 · Kniffe 0 | „Überblick" in „Tasten/Bedienung", „Legende" in „Orte", Chip „Alle" gestrichen |
| Tasten | K → Figur/Kniffe, N → Figur/Talente, B → Aufträge/Bude | springen zum Abschnitt, schließen das Buch nicht mehr |
| Touch-Kontextraster | 7 | Figur, Rucksack, Aufträge, Karte, Hilfe, Steuerung, Als App |
| **Summe** | **33 Navigationsziele** (−34 %) | davon 8 Sprungziele, die vorher Reiter oder Unterreiter waren |

## 3 · Umsetzung

- `popup-windows.js`: `BOOK_TABS` auf fünf Einträge, `TAB_OF` bildet `book→person`, `base→quest` ab (exportiert, im Test geprüft), Hilfe-Reiter mit Klasse `tab-help` (nur Symbol).
- `app.js`: `showBook()` = Figur mit Sprung „Kniffe"; `showBase()` = Aufträge mit Sprung „Bude"; Figur rendert Ausrüstung + Kniffe + Talente + Bande, Aufträge rendert Auftragsbuch + Bude + Erinnerungen; Fensterwechsel per Taste springt statt zu schließen.
- `panel-pages.js`: Abschnitte statt Unterreiter für Figur und Aufträge, `jumpBar()`; Hilfe/Karte mit drei Unterreitern; „Verwalten" aufgelöst (Clankiste unter Ausrüstung, Rucksack-Link weg).
- `rpg-shell.js`: vier Knöpfe. `rpg.css`: Weltknöpfe und Journal-Symbol am Desktop ausgeblendet. `questlog-ui.js`: Chip „Alle" weg. `mobile-controls.js`: Kontextraster sieben Einträge.
- `panel-pages.css`, `popup-ui.css`: Sprungleiste (klebend, aktueller Abschnitt gold), Figur-Raster mit Leiste in Zeile 1, Ausrüstung/Werte in Zeile 2.
- Tests: `tests/akt1-ui.test.mjs` prüft ≤ 5 Reiter und die Zuordnung; `npm test` 328/328. `npm run mobile:check` 48/48 Schritte ohne Fehler (Kniffe/Bude als Abschnitte, Hilfe über das Symbol).

Belege: `visual-review/menu-2026-09-17/00-hud.png` (HUD ohne Weltknöpfe, vier Leistenknöpfe), `01-figur.png` (Sprungleiste, Papierpuppe, Werte), `02-figur-kniffe.png` (K springt), `04-auftraege.png`, `05-auftraege-bude.png` (B springt), `06-hilfe.png`.

## 4 · Offen

- Hilfetext „Ein Buch, sieben Reiter … C I K J B M H" ist Inhalt (`PLAY_HELP`), Auftrag im Story-Backlog.
- Karte: die Filterzeile (Alles/Treffpunkte/Lager) und die Zoom-Zeile bleiben; ob die Filter nötig sind, entscheidet ein Playtest.
- Touch: die Sprungleiste ist 40 px hoch und nimmt im Hochkant-Buch Platz; wenn ein Playtest sie als störend meldet, kann sie auf dem Handy zu einem Aufklapp-Knopf werden.
