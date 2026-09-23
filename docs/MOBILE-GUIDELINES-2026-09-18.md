# Mobile-Gaming-Guidelines · Stand 2026-09-18

Regelwerk für die Mobile-Schicht von Mertloch Chronicles (Touch-Modus, `mobile-*.js`, `mobile-translate.js`, `mobile.css`, `scripts/mobile-check.mjs`). Zusammengezogen aus den aktuellen Plattform- und Branchenrichtlinien (Quellen in §6). Der Mobile-Agent (`.claude/agents/mobile-agent.md`) prüft jede Änderung gegen diese Liste. Jede Regel hat eine Nummer, damit Befunde darauf verweisen können.

## 1 · Tipp-Ziele und Abstände

| Nr | Regel | Quelle |
|---|---|---|
| M-01 | Jedes Tipp-Ziel mindestens **44×44 CSS-px** (Apple HIG 44 pt, WCAG 2.5.5 AAA). Android-Referenz 48 dp. Unter 24×24 px ist ein Verstoß gegen WCAG 2.5.8 (AA). | Apple HIG, Material, WCAG 2.2 |
| M-02 | **8 px Abstand** zwischen benachbarten Tipp-Zielen; ein Ziel, das die Mindestgröße hat, aber bündig am Nachbarn klebt, erzeugt Fehltipps. | Material, WANDR |
| M-03 | Primäraktionen sind größer als das Minimum (Joystick, Kniff-Knöpfe 56 px, Ziel/Aktion 48 px). | Thumb-Zone-Guide |
| M-04 | Rückmeldung nie **unter** dem Finger: Leuchten, Zähler, Tooltips über oder neben dem Kontaktpunkt. | WANDR |

## 2 · Daumenzonen und Anordnung

| Nr | Regel | Quelle |
|---|---|---|
| M-05 | Häufige Aktionen ins untere Drittel (grüne Zone): Joystick links unten, Kniffe rechts unten, Ziel/Aktion darüber. | Thumb-Zone-Guide |
| M-06 | Seltene oder zerstörerische Aktionen (Neustart, Zurücksetzen, Klamotten wechseln) oben oder hinter einer Bestätigung. | Thumb-Zone-Guide, WANDR |
| M-07 | Keine Tipp-Ziele in den Bildschirmecken und nicht unter Systemgesten (Home-Indikator, Gestenleiste, Statusleiste, Notch): `env(safe-area-inset-*)` an jedem Rand. | Apple HIG, Play LU-LS-GAA |
| M-08 | Symmetrisch denken: Links- und Rechtshänder; die Menüleiste zentriert oder spiegelbar. | Thumb-Zone-Guide |
| M-09 | Querformat hat andere Zonen als Hochkant: beide getrennt prüfen (390×844 und 844×390). | Thumb-Zone-Guide |

## 3 · HUD und Fenster

| Nr | Regel | Quelle |
|---|---|---|
| M-10 | Kontextueller Minimalismus: im HUD nur, was häufig **oder** dringend ist. Alles andere ins Clanbuch. | Appnality, WANDR |
| M-11 | Fenster verdecken nie Joystick oder Kniff-Knöpfe; im Kampf rutschen sie nach oben (`touch-combat`). | eigene Regel, geprüft in `mobile-check` |
| M-12 | Lesetext ≥ 12 px, Beschriftungen ≥ 10 px – das sind Untergrenzen, kein Ziel. **Nutzerentscheidung 2026-09-23:** auf Touch lieber knapp darüber und dichter (Fenster-Lesetext 12,5 px, Zeilenhöhe 1,4, Überschriften 16 px; `mobile-polish.css`), damit mehr auf den Schirm passt. Kontrast auch auf billigen Displays in der Sonne prüfen. | WANDR, Xbox Accessibility, Nutzer |
| M-13 | Keine Desktop-Begriffe auf Touch (Tab, WASD, Rechtsklick, Maus, [1]…[0], [LEER], [F]): die Übersetzungsschicht `mobile-translate.js` übersetzt beim Anzeigen. | eigene Regel |
| M-14 | Kein Desktop-Layout „geerbt": keine Hamburger-Seitenleisten, keine skalierten Raster; Bottom-Navigation mit 3–5 Zielen (Icon + Beschriftung). | WANDR, Thumb-Zone-Guide |
| M-15 | Ein Eingriff zur Rückkehr ins Spiel: nach Unterbrechung höchstens ein Tipp (kein Modal-Stapel). | WANDR |

## 4 · Sitzung, Speicherstand, Gerät

| Nr | Regel | Quelle |
|---|---|---|
| M-16 | Spielstand feinkörnig sichern (jeder Kill, jede Belohnung, jedes Fenster); Sitzungen enden ohne Vorwarnung. | WANDR |
| M-17 | Konfigurationswechsel (Drehen, Auf-/Zuklappen, Split-Screen, Fenstergröße) ohne Absturz, ohne Versatz der Touch-Zuordnung, ohne Verlust des Zustands. | Play LU-LS-GAB |
| M-18 | Seitenverhältnisse ohne schwarze Balken: quer 4:3, 16:10, 21:9; hoch 3:4, 10:16, 9:21. | Play LU-LS-GAC/GAD |
| M-19 | Bildrate im Kampf: Ziel 60 fps, Durchschnitt ≥ 55, P90 ≥ 50, P99 ≥ 30 auf Referenzgeräten; auf 2–3 Jahre alter Mittelklasse testen. | Play LU-PR-GAA, WANDR |
| M-20 | Controller, Tastatur und Maus bleiben vollständig spielbar (kein Zwang zu Touch); Touch ergänzt, ersetzt nicht. | Play LU-IC-GAA |
| M-21 | Erste Sitzung: eine befriedigende Aktion zuerst, Komplexität als Belohnung freischalten (Hofprobe). | WANDR |

## 5 · Prüfung (Pflicht vor jedem Push)

1. `npm run mobile:check` — headless, drei Geräte, 16 Schritte: Viewport-Breite, Fenster außerhalb, Überdeckung Joystick/Kniffe, Tipp-Ziele < 32 px, Desktop-Begriffe, Laufzeitfehler.
2. Sichtprüfung der Screenshots `visual-review/mobile-check/*.png` gegen M-05, M-10, M-12.
3. Bei Änderungen an Steuerung oder Kampf: Persona-Playtest auf 390×844 (`neuling-agent` mit Touch-Snippets).
4. Befunde als `M-nn`-Verweis in `docs/backlog/ui.md` (Umsetzung) oder `docs/backlog/lead.md` (Entscheidung).

## 6 · Quellen (abgerufen 2026-09-17/18)

- Apple Human Interface Guidelines, Game controls / Accessibility (44 pt Mindestziel, Safe Areas): https://developer.apple.com/design/human-interface-guidelines/game-controls · https://developer.apple.com/design/human-interface-guidelines/accessibility
- Android Developers, Google Play Games „Level Up" Guidelines (LU-LS-GAA Insets, LU-LS-GAB Konfigurationswechsel, LU-LS-GAC/GAD Seitenverhältnisse, LU-PR-GAA Bildrate, LU-IC-GAA Präzisionseingabe): https://developer.android.com/games/guidelines
- Android Developers, Game design overview / Develop for all screens / Natural input: https://developer.android.com/games/design/overview · https://developer.android.com/games/develop/all-screens · https://developer.android.com/games/develop/multiplatform/enable-natural-input-on-all-form-factors
- W3C WCAG 2.2, SC 2.5.8 Target Size (Minimum, 24 px) und 2.5.5 (Enhanced, 44 px): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- Material Design 3, Gestures / Touch targets (48 dp, 8 dp Abstand): https://m3.material.io/foundations/interaction/gestures
- WANDR, Mobile Game UI Design: Thumbs, Sessions and Constraints: https://www.wandr.studio/blog/mobile-game-ui-design
- Parachute Design, Mastering the Thumb Zone: https://parachutedesign.ca/blog/thumb-zone-ux/
- Appnality, Technical Guide to Mobile Game UI/UX Design (kontextueller Minimalismus): https://www.appnality.com/blog/guide-to-mobile-game-ui-ux-design/
- LogRocket, All accessible touch target sizes: https://blog.logrocket.com/ux-design/all-accessible-touch-target-sizes/
