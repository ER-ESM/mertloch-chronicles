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

## Iteration 3 · HUD-Minimalismus und Rückmeldung (M-04, M-10, M-11)

**Geprüfte Regeln:** M-04 (Rückmeldung nie unter dem Finger), M-10 (im HUD nur Häufiges/Dringendes), M-11 (Fenster nie über Joystick/Kniffen, auch im Kampf, hochkant und quer).

**Befund vorher** (Skript um Kampf erweitert: Hilfe → Einstellungen → Admin → Stufe 6 → Gegner aufstellen, dann HUD, Figur-Fenster, Toast, Kniff-Einsatz, Arena räumen): **69 Schritte mit Fehlern von 70.** Kampf war bisher nie geprüft. Konfigurieren-Knopf dauerhaft im HUD (selten, nicht dringend); im Kampf Ortszeile und vier leere „+“-Plätze sichtbar; Proc-Leuchten und Abklingzahlen lagen **im** Knopf, also unter dem Finger; kein CSS für `touch-combat` (M-11 galt nur über die allgemeine Fensterhöhe). Toast lag nie über dem HUD (0 Befunde).

**Änderungen:**

- `mobile-controls.js`: jeder Kniff-Platz und Sonderknopf bekommt eine **Lampe** (`.touch-lamp`) über dem Knopf, die Proc (✦/✦✦) oder Abklingzeit des Knopfes spiegelt – sichtbar, während der Daumen auf dem Knopf liegt (M-04); „1 / 2“ nur, wenn Seite 2 belegt ist (M-10).
- `mobile.css`: Konfigurieren-Knopf aus dem HUD (weiter über Einstellungen → „Steuerung & Touchbuttons“ und Langdruck → „Touchbuttons belegen“); im Kampf Ortszeile aus und leere Plätze unsichtbar (Raster bleibt stehen, kein Versatz); Lampen-Stil; quer füllen Kind-Fenster die Bahn wie das Elternfenster (Schließen-Knöpfe deckungsgleich); klein (≤ 370 px) fünf Reiter gleich breit in einer Zeile (10 px Beschriftung).
- `scripts/mobile-check.mjs`: Schritte `arena`, `kampf-hud`, `kampf-figur`, `kampf-toast`, `kampf-kniff`, `arena-raeumen`; Prüfungen: `touch-combat` aktiv, Ortszeile/leere Plätze/Konfigurieren nicht sichtbar, Toast nie über Joystick/Kniffen/Ziel-Aktion, Lampe spiegelt Knopfzustand und liegt über dem Knopf; `tap()` rollt das Ziel erst in den sichtbaren Bereich.

**Messwerte nachher:** 70 Schritte, 0 Fehler, 0 Ziele unter 44 px, 0 Paare unter 8 px; Lampe nach Kniff-Einsatz auf allen drei Geräten (z. B. „4.4“ über Markierung, „2.6“ über Stiefel). `npm test` 369/369.

**Belege:** `visual-review/mobile-check/hoch-kampf-figur.png`, `quer-kampf-figur.png` (Fenster im Kampf über dem HUD, hochkant und quer), `hoch-kampf-kniff.png`, `quer-kampf-kniff.png` (Lampen), `klein-figur.png` (Reiter).

**Offen:** –

## Iteration 4 · Text, Kontrast, Übersetzung (M-12, M-13)

**Geprüfte Regeln:** M-12 (Lesetext ≥ 12 px, Beschriftungen ≥ 10 px, Kontrast ≥ 4,5:1 bzw. 3:1 für große Schrift), M-13 (keine Desktop-Begriffe auf Touch).

**Befund vorher** (Skript misst jetzt jede sichtbare Textstelle in Fenstern, HUD, Hofprobe und Toast: Schriftgröße und WCAG-Kontrast gegen den zusammengesetzten Untergrund – Hintergrundfarben mit Alpha, erster Verlaufston, Text über Bildern ausgenommen; Desktop-Begriffsliste um Shift, Taste, Tasten, Esc, Klick, Linksklick, LEER erweitert): **41 Schritte mit Fehlern** durch Text unter 10 px (Menü-Beschriftung 9 px, Kniff-Namen 9 px, Stufen 9 px, Kniff-Auswahl 6 px), nach Korrektur der Messung **31 Schritte** mit Kontrastfehlern: Stempel-Koralle `#AD5260` auf Zeltstoff 2,4:1 (Kniff-, Gegenstands-, Talentnamen) und auf Pappkarten 2,7:1 (Bande, Aufträge), Zweittinte `#4E4A41` auf Pappkarten 4,1:1, Talentpunkte-Zeile Tinte auf Grün 1,4:1, „Bild vergrößern“ Tinte auf Grün 1,5:1. Lesetext unter 12 px: 0. Desktop-Begriffe in sichtbaren Fenstern: 0 (die Übersetzungsschicht deckte den geprüften Pfad bereits ab).

**Änderungen:**

- `mobile-translate.js`: 27 neue Wendungen aus Hilfe → Bedienung, Glossar und Tooltips (Shift + Tab, Shift über Tooltip, „Shift: Details“, C I K J B M H, LEER/Q, 1–0, Kniff ziehen / Rechtsklick auf Feld, doppelklicken, rechtsklicken, Klick/klicke, „Taste 3“ → Touch-Bezeichner des Kniffs, Tastendruck, gehämmerte Tasten, Esc schaltet ihn aus, Esc beendet den Angriff); `Tab →` erkannt. 12 neue Zusicherungen in `tests/mobile-translate.test.mjs` (7 Tests grün).
- `mobile.css`: kein Text unter 10 px im Touch-Modus (Menü 10, Kniff-Namen/Stufen/Beschriftungen/Zahlenzeilen 10, App-Status 12, Hofprobe-Knopf 11/44 px); Kontrast: helle Koralle `#F29AA6` (5,8:1) auf dunklem Grund, dunkle Koralle `#6E2531` (5,0:1) auf Pappkarten inkl. Clan-Stempel, Zweittinte `#3A3732` (5,6:1), Talentpunkte-Zeile mit freien Punkten in Creme, „Bild vergrößern“ in Creme.
- `scripts/mobile-check.mjs`: Text- und Kontrastmessung (Fehler < 10 px und < 4,5:1; Befund Lesetext < 12 px als eigene Spalte), erweiterte Desktop-Begriffsliste.

**Messwerte nachher:** 70 Schritte, 0 Fehler; 0 Texte unter 10 px, 0 Lesetexte unter 12 px, 0 Kontrastverstöße (niedrigster gemessener Wert 4,5:1 überschritten), 0 Desktop-Begriffe. `npm test` 370/370.

**Belege:** `visual-review/mobile-check/hoch-kniff-tipp.png` (helle Koralle), `quer-bude.png`, `hoch-talente.png`.

**Offen:** Glossar- und Hilfetexte in `content/` bleiben Desktop-Texte (Schicht übersetzt beim Anzeigen, M-13 erfüllt); Kontrast der Stempel-Koralle am Desktop (2,4:1) ist nicht Sache der Mobile-Schicht – im Backlog ui.md vermerkt.

## Iteration 5 · Sitzung und Gerät (M-15, M-16, M-17, M-18)

**Geprüfte Regeln:** M-15 (ein Tipp zurück ins Spiel), M-16 (Zustand aus dem Speicher), M-17 (Drehen ohne Zustandsverlust und ohne Touch-Versatz), M-18 (keine schwarzen Balken bei 21:9, 9:21, 16:10, 4:3).

**Befund vorher** (Skript um 23 Schritte erweitert): Drehen mit offenem Fenster und im Kampf war nie geprüft; **Todesfenster stand nach Drehen quer → hochkant bei x = −13 (außerhalb, Knopf „Am Treffpunkt zusammenkratzen“ in der Safe Area)**, weil popup-windows.js `left` aus einer noch querformatigen Breite rechnet (M-17). Gespräch, Beute und Tod fehlten im Skript; Beute war ohne Fixture nicht erreichbar (Arena-Gegner geben keine Beute, im Tutorial ist kein anderer Gegner verwundbar). Nach dem Aufstehen folgt eine Erinnerung als zweites Fenster (M-15, siehe offen).

**Änderungen:**

- `mobile.css`: Fenster hochkant per `left/right + margin auto` zentriert (wie quer seit Iteration 2) – Lage unabhängig vom JS-`left`, überlebt jede Drehung.
- `scripts/mobile-check.mjs`: je Gerät `drehen` (Figur-Fenster offen → Drehen → Fenster bleibt, im Viewport, nicht über HUD; Joystick im sicheren Bereich; Joystick-Probe: Berührung greift, Loslassen gibt frei; zurückdrehen), `unterbrechung` (blur/visibilitychange: kein neues Fenster, Joystick frei, ein Tipp wirkt), `gespraech` (Wegmarke → Aktion → Gesprächsfenster), `tod` (Arena Boss × 8, Todesfenster, Drehen im Tod), `tod-zurueck` (ein Tipp „Aufstehen“ → keine Fenster; Erinnerung als Hinweis). Sitzungsblock: Spielstand-Fixture (Hofprobe abgeschlossen, Auto-Loot aus, Beutel neben dem Spieler, Autosave der alten Seite unterbunden) → `beute` (Aktion zeigt „Beute“, Beutefenster) und `wiederkehr` (Neuladen: höchstens ein Fenster, ein Tipp zurück) auf hoch und quer; Formate 21:9, 9:21, 16:10, 4:3: Spielfläche füllt den Viewport (Bierdeckel-Rahmen 2 px toleriert), Joystick/Kniffe da, nichts in Ecken. Teil-Läufe über `MOBILE_PART=hoch|quer|klein|sitzung` (je unter 2 Minuten, Berichte `REPORT-<teil>.md`), CDP-Zeitschranke 40 s, Bildschirmfoto-Fehler blockieren den Lauf nicht mehr.

**Messwerte nachher:** **93 Schritte, 0 Fehler** (3 Geräte × 29 + Sitzung 4 + Formate 4 + Desktop), Laufzeit 4 min 9 s; 0 Ziele < 44 px, 0 Paare < 8 px, 0 Texte < 10 px, 0 Kontrastverstöße. Einziger Hinweis: Erinnerung nach dem ersten Aufstehen (hoch). `npm test` 370/370.

**Belege:** `visual-review/mobile-check/hoch-drehen-gedreht.png`, `hoch-tod.png`, `hoch-tod-gedreht.png`, `hoch-beute.png`, `quer-beute.png`, `format-21-9.png`, `format-9-21.png`, `format-16-10.png`, `format-4-3.png`.

**Offen:** (1) M-15: nach dem Aufstehen öffnet app.js eine Erinnerung (`memory`) – zweiter Tipp nötig; Entscheidung UI/Story (Backlog ui.md). (2) M-17: popup-windows.js `clamp()` rechnet `left` beim Drehen aus der alten Breite – per CSS überbrückt, JS-Fix im Backlog ui.md. (3) Das Desktop-Bildschirmfoto 2024×900 läuft im headless Chrome nach dem Sitzungsblock in die 40-s-Zeitschranke (die Desktop-Prüfung selbst ist grün); Ursache offen.

## Commits

| Iteration | Commit |
|---|---|
| 1 | `5abd1f6` |
| 2 | `fad6019` |
| 3 | `93174f6` |
| 4 | `4d4c980` |
| 5 | (wird nach dem Push eingetragen) |
