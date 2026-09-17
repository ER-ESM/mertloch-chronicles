# UI-Abnahme · Stil C „Bierdeckel" · 2026-09-17

Prüfliste: [UI-ABNAHME.md](UI-ABNAHME.md) · Entscheidung: [E-24](ENTSCHEIDUNGEN.md) · Stildatei: `bierdeckel.css` · Branch `ui-stil-c`.
Belege liegen unter `visual-review/stil-c-2026-09-17/` (nicht im Repo, weil `visual-review/` gitignored ist).

Geprüft im Browser bei **2024 × 900** und **390 × 844**, Service Worker jeweils abgemeldet und Caches gelöscht.
`npm test`: **296 grün**. `npm run build`: läuft (120 Anwendungsdateien).

## A · Ein Stil, eine Quelle

| Nr | Ergebnis | Beleg |
|---|---|---|
| A1 | **bestanden** | Farben, Rahmen, Schriften und Abstände jedes Bausteins stehen nur noch in `bierdeckel.css`. `.clan-card` hatte sechs Definitionen (clan.css, hearth.css, maifeld.css, panel-pages.css, popup-ui.css, akt1.css) — alle 57 Regeln gelöscht. Aus den 15 Altdateien sind insgesamt 1 654 Bausteinregeln entschlackt; `:root` in `comic-theme.css` und `hearth.css` entfernt. Themen-Dateien überschreiben keinen Baustein mehr. |
| A2 | **bestanden mit Rest** | Hex-Farben in den Altdateien 1045 → **89**. Was bleibt, sind Rest-Farben in Regeln, die weder Baustein noch Layout sauber trennen (Kulissen-Fallbacks in `akt1.css`, `accent-color` in `popup-ui.css`, Weltrandfarben in `style.css`). Keine davon gewinnt gegen `bierdeckel.css`. Genannt unter „Offen". |
| A3 | **bestanden mit Rest** | Aussehens-`!important` vollständig entfernt; `bierdeckel.css` nutzt `!important` nur für `[hidden]`. In den Altdateien bleiben **42** rein layoutbezogene `!important` (display, margin, padding, width, top) — sie betreffen kein Aussehen. Genannt unter „Offen". |
| A4 | **bestanden** | Genau drei Knopfarten: Primär (Gold `#ECB95C`), Sekundär (Rahmen), Gefahr (Koralle). Der Zustand „trägt gerade" ist ein schräger Stempel in Ziegelrose, kein ausgegrauter Knopf — `desktop-klamottenwahl.png`. Deaktivierte Knöpfe erklären sich in der Zeile darunter (`.disabled-note`). |

## B · Pixel statt Web

| Nr | Ergebnis | Beleg |
|---|---|---|
| B1 | **bestanden** | Messung im laufenden Spiel: **0** Elemente mit `border-radius ≠ 0`, **0** Elemente mit `blur`/`backdrop-filter`. Schatten überall `3px 3px 0 #0B1216`, gemessen an `.hud` und `.toast`. `border-radius` in den Altdateien 77 → 0, `blur` 2 → 0, `gradient` 16 → 0. |
| B2 | **bestanden** | Figurenkarten zeigen `idle` nach Südosten aus dem gelieferten Bogen, ganzzahlig 96 → 192 px (`paintHeroPortrait`, `imageSmoothingEnabled=false`), `image-rendering:pixelated` global. Reitersymbole 24 px nativ. — `desktop-klamottenwahl.png`, `handy-klamottenwahl.png` |
| B3 | **bestanden** | Im DOM kommen nur **Jersey 15** (Überschriften, Namen, Reiter, Knöpfe, Werte) und **Nunito** (Fließtext, Tooltips) vor. Größen ausschließlich aus der Skala 11/13/16/20/28 (Tokens `--t-11` … `--t-28`). Beide Schriften lokal als woff2 unter `assets/fonts/`, kein Google-`@import` mehr. |
| B4 | **bestanden** | Alle Farben aus den elf `:root`-Tokens. Gold nur für Primäraktion, Auswahl und Randale-Balken; Korallrot nur für Gegner-Leben, Angriffshinweis und Tod-Überschrift; Apfelgrün für Leben und erledigte Ziele. |
| B5 | **bestanden** | Zwei Flächenstufen je Fenster: Zeltstoff `#223A2F` als Grund, Pappe `#D9B98A` für Karten. Abschnitte im Reiter sind seit dem Umbau Schildzeilen, keine dritte Fläche. Kein Verlauf außer dem 6-px-Punktraster der Pappe (zwei Stufen). |

## C · Raster und Lesbarkeit

| Nr | Ergebnis | Beleg |
|---|---|---|
| C1 | **bestanden** | Eyebrow bricht um (`overflow-wrap:anywhere`), keine abgeschnittenen Reiterbeschriftungen: bei 390 px brechen die sieben Reiter in zwei Reihen um statt zu schrumpfen (gemessen: `clipped:false` für alle sieben). Die lange Bio steht als eine Zeile auf der Karte, der Rest hinter „Persönlichkeit & Spielweise". |
| C2 | **bestanden** | Drei Figurenkarten je 463 px hoch bei 2024 × 900, je 418 px bei 390 × 844 (`grid` + `grid-auto-rows:1fr`), Aktionen auf derselben Grundlinie, Knöpfe 203 / 205 px breit. |
| C3 | **bestanden** | Kein horizontales Scrollen: `scrollWidth − clientWidth = 0` im Fensterkörper für Figur, Rucksack, Kniffe, Aufträge, Bude, Karte, Hilfe — bei 2024 × 900 **und** 390 × 844. Unter 760 px bricht die Klamottenwahl auf eine Spalte um. |
| C4 | **bestanden** | Clanbuch bleibt EIN Fenster mit sieben Reitern; Unterreiter bleiben Reiter (Kniffe, Aufträge, Karte, Hilfe, Admin). Details hängen als Anhang am Buch. — alle `desktop-clanbuch-*.png` |
| C5 | **bestanden mit Einschränkung** | Text auf Pappe: `#2B2A26` auf `#D9B98A` ≈ 9,6:1; Fließtext `#4E4A41` auf Pappe ≈ 6,3:1; Creme auf Zeltstoff ≈ 10,5:1. **Werte auf farbigen Balken** (Leben, Randale) erreichen die 4,5:1 nicht aus eigener Kraft und bekommen darum eine Kontur nach allen vier Seiten — die Prüfliste lässt „Kontur oder Plakette" ausdrücklich zu. Ortsnamen auf der Karte sind Pappe-Plaketten (`desktop-clanbuch-karte.png`). |
| C6 | **bestanden** | Im Touch-Modus bei 390 × 844 ist **kein** Bedienelement kleiner als 44 px (gemessen über Steuerkreuz, Joystick, Touch-Aktionen, Menü, Seitenwechsel, Reiter, Karten-Knöpfe). Die Hilfe zeigt im Touch-Modus Touch-Wortlaut ohne „Überfahren"/„Rechtsklick". — `handy-touch-hud.png` |

## D · Verhalten

| Nr | Ergebnis | Beleg |
|---|---|---|
| D1 | **bestanden** | Jeder Knopf hat Ruhe, Hover, Aktiv, Fokus und Deaktiviert. Fokusrahmen 2 px Gold, gemessen an einem Buchreiter; der Rest-Fokusrahmen aus `popup-ui.css` ist entfernt, die Regel steht jetzt in `bierdeckel.css`. Deaktiviert erklärt sich: „Zum Wechseln musst du außerhalb des Kampfes zum Treffpunkt bei St. Gangolf zurück." als `.disabled-note` unter dem Knopf. |
| D2 | **bestanden** | Gesperrter Klamottenwechsel meldet sich als Einblendung mit Wortlaut aus `content/`: „Erst die Hofprobe fertig machen. Ida lässt dich danach aufs Dorf los." Zustandswechsel (Reiter, Auswahl, Stempel) sind sichtbar. |
| D3 | **bestanden** | `@media (prefers-reduced-motion:reduce)` in `bierdeckel.css` schaltet Animation, Übergänge und weiches Scrollen ab. |
| D4 | **bestanden** | 57 fokussierbare Bedienelemente im offenen Clanbuch, Reiter und Karten per Tab erreichbar, Esc schließt (gemessen: 1 Fenster offen → 0 nach Esc). |

## Belege (Screenshots)

| Bildschirm | Datei |
|---|---|
| Welt und HUD, Desktop | `desktop-hud-welt.png` |
| Kampf-HUD mit Zielfenster und Angriffshinweis | `desktop-kampf-hud.png` |
| Start / Ida-Gespräch | `desktop-gespraech-ida.png`, `handy-gespraech-ida.png` |
| Klamottenwahl | `desktop-klamottenwahl.png`, `handy-klamottenwahl.png` |
| Clanbuch · Figur / Ausrüstung | `desktop-clanbuch-figur-ausruestung.png` |
| Clanbuch · Rucksack | `desktop-clanbuch-rucksack.png` |
| Clanbuch · Kniffe | `desktop-clanbuch-kniffe.png` |
| Clanbuch · Aufträge | `desktop-clanbuch-auftraege.png` |
| Clanbuch · Bude (Erinnerungen) | `desktop-clanbuch-bude.png` |
| Clanbuch · Karte | `desktop-clanbuch-karte.png` |
| Clanbuch · Hilfe (Kampfhilfe) | `desktop-clanbuch-hilfe.png` |
| Admin · Trainingsarena | `desktop-admin-arena.png` |
| Tod-Fenster | `desktop-tod.png` |
| Touch-Modus (Joystick, Touch-Aktionen) | `handy-touch-hud.png` |

Konsole bei allen Durchgängen fehlerfrei (0 Fehler, 0 Warnungen).

## Offen

1. **Beutefenster nicht im Browser belegt.** Arena-Gegner lassen nichts fallen, und der nächste echte Gegner liegt 1 185 Welteinheiten entfernt; Laufen und die Kartenroute („Weg einschlagen") haben in dieser Sitzung keine Navigation ausgelöst. Die Beute nutzt dieselben Bausteine wie die belegten Bildschirme (`.loot` = Pappe, `.item-slot` = Zeltstoffkachel, `.dialog-actions` = Knopfzeile) und ist in `bierdeckel.css` mitgezogen. **Nachzuholen im nächsten Durchgang.**
2. **42 layoutbezogene `!important` in den Altdateien** (A3 streng gelesen: nur `[hidden]` erlaubt). Sie setzen ausschließlich `display`, `margin`, `padding`, `width` und `top` in `rpg.css`, `popup-ui.css`, `progression-ui.css`, `mobile.css` und `panel-pages.css`. Sie ohne Layoutprüfung zu streichen wäre riskant; das gehört in eine eigene Layout-Runde.
3. **89 Hex-Farben in den Altdateien** (A2). Rest sind Kulissen-Fallbacks in `akt1.css`, `accent-color` in `popup-ui.css` und Weltrandfarben in `style.css`. Keine davon überschreibt einen Baustein.
4. ~~Anni fällt im Stil ab.~~ **Erledigt beim Rebase 2026-09-17:** Die Grafik hat `anni-poses` geliefert (Commit f862428), der Katalog führt den Alias `baerbel → anni-poses`, und `paintHeroPortrait` greift ihn ohne Codeänderung. Alle drei Karten zeigen jetzt denselben Bogen — Beleg `nach-rebase-klamottenwahl.png`.
5. **Stempeltext.** Der Stempel zeigt den vorhandenen Text „Ist am Start"; der gewünschte Wortlaut „Trägt er / sie gerade" ist als `PANEL_UI.wornStamp` in `docs/backlog/story.md` angefragt.
