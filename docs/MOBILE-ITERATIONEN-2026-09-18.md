# Mobile-Iterationen · 2026-09-18

Fünf Iterationen an der Mobile-Schicht (Mobile-Agent, Regelwerk `docs/MOBILE-GUIDELINES-2026-09-18.md`). Jede Iteration ein Commit, nach grünem `npm test` + `npm run build` + `npm run mobile:check` sofort live (`mobile` → `origin/main`). Messungen mit `node scripts/mobile-check.mjs http://localhost:4182/ visual-review/mobile-check` (Hochkant 390×844, Quer 844×390, Klein 360×740, 16 Schritte je Gerät + Desktop-Gegenprobe 2024×900). Screenshots liegen lokal unter `visual-review/mobile-check/<gerät>-<schritt>.png` (Ordner ist per `.gitignore` nicht im Repo).

## Iteration 1 · Tipp-Ziele und Abstände (M-01, M-02, M-03)

**Geprüfte Regeln:** M-01 (≥ 44 px), M-02 (8 px Abstand), M-03 (Primäraktionen größer als Minimum), M-20 (Desktop unverändert).

**Befund vorher** (Skript verschärft, dann gemessen): 0 Tipp-Ziele unter 32 px, **1 Ziel unter 44 px** („Touchbuttons belegen“ 176×43), **1 591 Paare mit Abstand unter 8 px** in 48 Schritten (151 verschiedene Paare). Ursachen: Clanbuch-Reiter 3 px, Sprungleiste 4 px, Kniff-Knöpfe im HUD 6 px, Seite/Konfigurieren 6 px, Sonderknöpfe 7 px, Rucksack-Raster 5–6 px, Kniffe-Raster 6 px, Karten-Werkzeugleiste 4 px, Papierpuppen-Knöpfe 5 px, Touch-Editor 3–5 px; Reiter zu Sprungleiste 4 px senkrecht.

**Änderungen:**

- `scripts/mobile-check.mjs`: Tipp-Ziele umfassen jetzt Knöpfe, Reiter, Auswahlfelder, Links, Plätze, Talente, Eingaben in Fenstern sowie Touch-HUD und Joystick. **< 44 px = Befund** (Spalte „Befund 32–43 px“), **< 32 px = Fehler**, **Abstand < 8 px zwischen sichtbaren Zielen = Befund** (Spalte „Abstand < 8 px“, Summenzeile). Verdeckte Ziele (Fenster über Fenster, Sprungleiste über gescrolltem Inhalt, angeschnitten am Scrollrand) zählen nicht. Vollständige Messwerte in `audit.json`. Neu: Desktop-Gegenprobe 2024×900 ohne Touch-Modus (kein `touch-mode`, HUD unsichtbar, Menüleiste da).
- `mobile.css`: HUD-Raster 8 px (`#touchSkills`, `.touch-action-head`, `#touchSpecials`, Breite `#touchActions` angepasst); Reiter 10 px, Sprungleiste 9 px + 11 px Oberkante, Unterreiter 8 px, Talent-Spezialisierungsreiter 9 px; Rucksack-Raster 9 px, Werkzeugleiste/Suche 9 px Abstand; Kniffe-Raster (`.icon-skillbook`, `.kniff-grid`) 9 px; Karten-Werkzeugleiste 9 px; Papierpuppen-Knöpfe und Ausrüstungsraster 8 px; Touch-Editor 9 px / Kniff-Auswahl 8 px; Talentknoten 44 px; Fenster-Knöpfe min. 45 px (Rundung); Fenster quer 6 px, hochkant 3 px kürzer, damit sie 8 px vom HUD wegbleiben. Wegen `panel-pages.css` (lädt nach `mobile.css`, eigene `.touch-mode`-Regeln) sind die Regeln drei Klassen tief.

**Messwerte nachher:** 49 Schritte, 0 Fehler, **0 Tipp-Ziele unter 44 px, 0 Paare unter 8 px**, keine Laufzeitfehler, Desktop-Gegenprobe grün. `npm test` 369/369.

**Belege:** `visual-review/mobile-check/hoch-hud.png`, `quer-figur.png`, `hoch-rucksack.png`, `hoch-talente.png`, `desktop-2024x900.png`.

**Commit:** `5abd1f6`.

**Offen:** –

## Iteration 2 · Daumenzonen, Safe Areas, Querformat (M-05 … M-09)

**Geprüfte Regeln:** M-05 (häufig unten), M-06 (gefährlich hinter Bestätigung), M-07 (Safe Areas, Ecken), M-08 (spiegelbar), M-09 (beide Orientierungen), M-11 (Fenster nie über Joystick).

**Befund vorher** (Skript erweitert: Safe Areas simuliert mit iPhone-Werten hochkant 47/34, quer 47/47/21; Ecken-Prüfung 24 px am Viewport **und** am Safe-Rechteck; Linkshand-Schritt): **16 Schritte mit Fehlern von 52.** Quer mit seitlichen Safe Areas lag jedes Fenster über dem Joystick (popup-windows.js zentriert auf die Bildschirmmitte, Joystick rückt um 47 px nach innen); Linkshand gab es nicht (3 Fehler); `@media(max-width:370px)` und `(max-height:420px)` setzten Joystick, Ziel/Aktion und Abbruch ohne `env(safe-area-inset-*)`; Menü-Knopf 12 px von der rechten Kante (Ecke bei Geräten ohne obere Safe Area); Hofprobe-Kasten (tutorial-ui.css) fest bei 84/86 px ohne Safe Area, seine zwei Knöpfe 1 px auseinander; Karten-Filter 43 px unter Safe Areas.

**Änderungen:**

- `mobile-layout.js`: Einstellung `hand` (right/left) mit Validierung (Test in `tests/mobile.test.mjs`).
- `mobile-controls.js`: `data-touch-hand` am Body, Auswahl „Hand“ im Touch-Editor, `state().hand`; **„Standardbelegung“ verlangt einen zweiten Tipp** („Wirklich? Nochmal tippen“, 4 s) – M-06.
- `mobile.css`: Safe Areas in allen Media-Regeln; Menü-Knopf und Kontextraster 26 px von rechts (Ecke frei); Kniffe quer 28 px vom unteren Rand; **Fenster quer in der freien Bahn zwischen Joystick und Kniffen zentriert** (left/right/max-width + margin auto, schlägt das Inline-`left` aus popup-windows.js) – M-11; Linkshand-Block spiegelt Joystick, Kniffe, Ziel/Aktion, Abbruch, Toast und quer den Hofprobe-Kasten; Hofprobe-Kasten unter der Safe Area, Hilfe-Knopf 8 px vom Einklapp-Knopf; Karten-Filter/Zoom 45 px.
- `scripts/mobile-check.mjs`: Safe-Area-Simulation je Gerät, Prüfungen „Tipp-Ziel in Safe Area“ und „Tipp-Ziel in Bildschirmecke“ (Fehler), Schritt `linkshand` (Joystick rechts der Kniffe), Hofprobe-Knöpfe als Tipp-Ziele, Größenprüfung auf dem ungeschnittenen Rechteck.

**Messwerte nachher:** 52 Schritte, 0 Fehler, 0 Ziele unter 44 px, 0 Paare unter 8 px, 0 Ziele in Ecke/Safe Area, Linkshand auf allen drei Geräten korrekt. `npm test` 369/369.

**Belege:** `visual-review/mobile-check/quer-rucksack-item.png` (Fenster in der Bahn), `quer-linkshand.png`, `hoch-linkshand.png`, `hoch-hud.png`.

**Offen (Backlog ui.md, Abschnitt Mobile-Iterationen):** popup-windows.js sollte quer die seitlichen Safe Areas selbst berücksichtigen (M-07/M-11, heute per CSS-Bahn überbrückt); tutorial-ui.css Hofprobe-Kasten ohne Safe Area und Knöpfe „?“/„⌃“ ohne Bierdeckel-Stil im Touch-Modus (M-07/E-24).

## Commits

| Iteration | Commit |
|---|---|
| 1 | `5abd1f6` |
| 2 | (wird nach dem Push eingetragen) |
