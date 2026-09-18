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

**Commit:** siehe Abschnitt „Commits“ am Ende.

**Offen:** –

## Commits

| Iteration | Commit |
|---|---|
| 1 | (wird nach dem Push eingetragen) |
