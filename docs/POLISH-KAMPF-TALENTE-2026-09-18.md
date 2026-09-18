# Polish Kampf & Talentbäume · 2026-09-18 (10 Iterationen)

Auftrag der Produktion: „10 Iterationen Gesamtpolishing mit Fokus auf Kampf und Talentbäume." Grundlage: Playtest-Auswertung 2026-09-17 (Befunde 3, 11), Kenner-Playtest MMO (Hänger 1, 2, 3), Backlogs UI/Klassen, eigene Kampfmessung in der Arena (Stufe 10, 2–3 Gegner). Belege `visual-review/polish-2026-09-18/`.

| Nr | Befund | Änderung | Dateien | Beleg |
|---|---|---|---|---|
| 1 | Reiter Figur trug das komplette Nachschlagewerk (2054 px, alle 90 Talente, Procs, Eigenart) → „bei Figur steht viel zu viel" | Nachschlagewerk nach Hilfe → Kniffe; Figur/Kniffe zeigt nur gelernte Kniffe + Aktionsplätze (680 px). Tooltip-Verweise springen in die Hilfe | rpg-ui.js, app.js, panel-pages.js | 12-hilfe-kniffe.png |
| 2 | Clan-Schule „Neu gelernt" blieb die ganze Sitzung; Kampflog lag im Kasten der Clan-Schule | Hinweis gilt als gelesen nach 25 s oder sobald der Kniff benutzt wurde; Kampflog mittig über der Leiste | app.js, rpg.css | 10-kampf.png |
| 3 | Procs leuchteten nicht (Bierdeckel hatte `box-shadow:none` gesetzt; E-12 verspricht 6-s-Leuchten); Abklingzeit nur als Zahl | Gold-Puls für `.ready`/`.proc-ready` (auch Touch), ✦-Marke für kostenlos/verstärkt, Abklingzeit als Uhr (`--cd-angle`), Autoangriff-Zustand als grüner Ring + Punkt auf dem Knopf, Zustandszeile als Pille | app.js, bierdeckel.css | 10-kampf.png, 23-kampf.png |
| 4 | Schadenszahlen klein und einfarbig (Georgia 15 px) | Zahlen in Display-Schrift: Treffer 16 px, Glückstreffer 22 px gold mit Ausrufezeichen, eigener Schaden rot 15 px, Heilung grün 15 px; Krit steigt höher | renderer.js | 11-kampf.png |
| 5 | Zauberbalken des Ziels blass, kein Hinweis „unterbrechbar"; Elite-Titel unauffällig | Balken gold + Puls + ⚡ bei unterbrechbaren Zaubern, sonst korallrot; Elite-Titel als Ziegelrose-Stempel, Rahmen des Zielfensters mitfärbend | app.js, bierdeckel.css | 23-kampf.png |
| 6 | Randale-Balken steht auf Stufe 1 immer auf 100 (Auswertung Nr. 3) | Balken erst sichtbar, wenn ein gelernter Kniff Randale kostet; Pegel-Hinweis vor dem Finisher gedämpft | app.js, bierdeckel.css | 20-hud.png |
| 7 | Talentbaum: Knoten eng (16–84 %), Tooltip verschwand nach jedem Punkt (Kenner 2), Zurücksetzen ohne Rückfrage | Knoten auf 12–88 % gespreizt (UI-seitig, Layout-Daten bleiben bei Klassendesign), Tooltip bleibt nach dem Lernen am Knoten, Chips „gelernt" unter dem Baum, Zurücksetzen mit Rückfrage und nur aktiv, wenn Punkte verteilt sind | talent-ui.js, talent-ui.css, app.js | 21-talente.png, 22-talent-gelernt.png |
| 8 | Aktionsleiste: Tastenlabel 13 px, leere Plätze so laut wie belegte | Label 16 px auf dunklem Eck, leere Plätze 45 %, gesperrte 30 %, unbenutzbare Icons gedämpft | bierdeckel.css | 20-hud.png |
| 9 | „Du wirst angegriffen" als Riesentext in der Bildmitte verdeckte das Geschehen | Banner unter dem Zielfenster (Ziegelrose, 3× Puls); Kampfzustand als Chip am Spielerfenster, im Kampf rot | bierdeckel.css, app.js | 23-kampf.png |
| 10 | Talent-Tooltip: Schwelle nur als Nachsatz, Effekt nicht abgesetzt (Kenner 3) | Kopfzeile Zustand / Schwelle wie beim Kniff-Tooltip, Spezialisierung im Untertitel, Effekt fett | talent-ui.js, talent-ui.css | 22-talent-gelernt.png |

Prüfung: `npm test` 369/369, `npm run mobile:check` 48/48, Browser 2024×900 ohne Laufzeitfehler.

Offen (an andere Rollen, im Backlog): Kellentext 300 % vs. 200 % (Klassen), Talent nennt betroffenen Kniff (Klassen → dann Taste im Tooltip), Hilfetext „sieben Reiter" (Story).
