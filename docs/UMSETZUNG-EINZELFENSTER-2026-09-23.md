# Einzelfenster statt Clanbuch · 23.09.2026

Nutzerauftrag: Die Reiter im einen Fenster („Clanbuch“) auflösen, jedes Menü einzeln aufrufbar, angedockt wie im MMO-Vorbild; kompakter, Fließtext in Tooltips, Symbole statt Beschriftungen. Hebt die Entscheidung „ein Fenster, sechs Reiter“ aus `docs/MENUE-BEWERTUNG-2026-09-17.md` auf (Eintrag in `ENTSCHEIDUNGEN.md` trägt der Orchestrator nach).

## Was

| Fenster | Taste | Lage (Desktop) |
|---|---|---|
| Figur | C | links, unter Menüknopf/Spielerrahmen |
| Aufträge (mit Bude, Erinnerungen) | J oder L (B springt zur Bude) | links, neben Figur |
| Talente | N | mittig |
| Karte | M | mittig, fast Vollbild (2,5 % Rand), Karte + Ortsliste nebeneinander |
| Kniffe | P (K als alter Griff) | rechts, neben Rucksack |
| Rucksack | I | rechts, vor Minikarte/Auftragsverfolgung |
| Hilfe | H | mittig |

- Mehrere Fenster zugleich. **Seit Runde 1 (2026-09-24) feste Plätze** statt Öffnungsreihenfolge, Details unten. Dieselbe Taste schließt, Esc schließt das oberste. Sie halten Aktionsleiste und Menüleiste frei (Höhe endet darüber, wo sie waagrecht überlappen).
- Overlays (Gespräch, Menü, Laden, Tod …) schließen weiter alle Fenster; Beute darf neben ihnen stehen. Gegenstands-/Kniffdetails hängen neben ihrem Fenster (bei rechts angedockten links daneben) und schließen mit ihm.
- Angedockte Fenster sind nicht verschiebbar (feste Plätze wie im Vorbild); Overlays bleiben verschiebbar.
- Menüleiste unten rechts: alle sieben Fenster, Tooltip „Name [Taste]“ + Kurzzweck; Talentpunkte-Abzeichen jetzt am Talente-Knopf.
- Touch: immer nur ein Fenster (wie bisher Vollfenster). Spielmenü oben ein Symbolraster mit allen sieben Fenstern (ersetzt „Clanbuch“).

## Feste Plätze und Stapelordnung (Optimierung Runde 1, 2026-09-24)

- **Plätze** (`popup-windows.js`, `SLOTS`/`slots()`): links Figur (Rand), Aufträge (daneben); rechts Rucksack (außen), Kniffe (innen).
  Die x-Lage hängt nur vom Platz ab, nicht davon, was sonst offen ist: schließt die Figur, bleiben die Aufträge stehen.
- **Oberkante**: alle Seitenfenster beginnen unter dem Spielerrahmen (`dockArea().top`, ≈183 px bei 2024×900).
- **Rechts**: Die Fenster enden vor der Spalte aus Minikarte und Auftragsverfolgung (auch wenn die Verfolgung gerade leer/verborgen
  ist; dann aus ihrer Stilbreite berechnet). Rucksack und Kniffe stehen als Block: gleich hoch wie das höhere, soweit der Platz über
  Aktions- und Menüleiste reicht.
- **Mitte** (Talente, Hilfe): bildschirmmittig, wenn dort nichts offen ist; sonst mittig in der Lücke zwischen den offenen
  Seitenfenstern; erst wenn sie dort nicht hineinpassen, bildschirmmittig mit Überdeckung.
- **Stapelordnung (z-index)**: Welt/HUD 0–30 · Fenster `#popupLayer` 40 (Fenster darin 20+ je Fokus) · Minikarte mit offener
  Lupe/Optionen 1100 (`minimap.css`) · Kontextmenü 1200 · Aura-Tooltip 1500 · Tooltips (`#itemTooltip`, `.mm-tip`) 100000.
- **Menüleiste**: immer alle sieben Fenster; gesperrte (`unlocks.js` → `.is-locked`) ausgegraut mit Schloss, der Tooltip nennt die
  Bedingung. Aufträge sind nicht mehr gesperrt (Hofprobe steht dort als Auftrag), Talente öffnen vor Stufe 5 die graue Vorschau.
- Prüfung: `node scripts/optimierung-r1-check.mjs` (CDP 9472 / Server 4272).

## Kompakter / Tooltips / Symbole

`window-compact.js` (Hook am Ende von `decoratePanel`) arbeitet auf dem fertigen DOM:
- Figur: Kampfstatistik-Knopf weg (HUD hat ihn), Platznamen unter den Slots weg (Slot-Tooltip), Drehen/Wechseln als Symbole in der freien Ecke, Schmuck + Waffen in einer Zeile, alle Werte als Symbol+Zahl-Leiste (Name im Tooltip, Zweitwerte behalten ihren Wert-Tooltip). Passt ohne Scrollen.
- Aufträge: Abschnittssprünge und Filter mit Symbol, Zählzeile in den Tooltip von „Aktiv“, Kapitel-Erzähltext und Bude-Trümmertext in Tooltips, Erinnerungen als Bildkacheln/Platzhalter mit Text im Tooltip.
- Kniffe: Kacheln nur Symbol (Name im Kniff-Tooltip), 6 Spalten, Aktionsplätze in einer Zeile, „Leiste: Standardbelegung“ als Symbol.
- Rucksack: Filter, Sortieren und „Kalles Kiosk“ als Symbole, Geld/Plätze in einer Zeile mit der Suche.
- Karte: Filter als Symbole, Ortsliste lesbar (heller Text auf dunkler Kachel).
- Talente: Hinweiskasten „Wähle deinen Hauptbaum“ wird Tooltip des Knopfs.
- `popup-controls.js`: `data-tooltip-note=""` zeigt nur den Namen (kein Standardsatz).

Symbole: 21 neue UI-Icons über die Bildpipeline (`tools/sprite-pipeline/einzelfenster-20260923-jobs.json`, Referenz `ui-tab-kniffe`), exportiert über `precision-september.mjs` nach `assets/precision/runtime/ui/`. Texte/Zuordnungen in `content/panel-ui.js` → `WINDOW_UI`.

## Dateien

`popup-windows.js` (Andock-Logik `dockArea`/`layout`, `WINDOWS`/`DOCK`/`WINDOW_OF`), `window-compact.js`, `einzelfenster.css`, `rpg-shell.js` (Menüleiste, Touch-Raster), `panel-pages.js` (Figur/Karte am Desktop ohne Unterreiter, Hook), `content/panel-ui.js` (`WINDOW_UI`, Hilfetexte), `content/unlocks.js` (Fundorte), `app.js` (nur Talentpunkte-Abzeichen).

## Prüfen

`node scripts/einzelfenster-check.mjs` (CDP 9440 / Server 4240): jede Taste auf/zu, vier Fenster links+rechts ohne Überlappung und ohne HUD zu verdecken, Esc, Karte fast Vollbild, Talente mittig, Menüleiste inkl. Tooltip, Symbol-Tooltips in Rucksack/Figur/Aufträgen/Kniffen, Gegenstandsdetail am Rucksack, Touch quer und hoch (jedes Fenster über das Menü, 44 px). Screenshots: `visual-review/einzelfenster/`. Sichtprüfung einzelner Tastenfolgen: `node scripts/einzelfenster-look.mjs <präfix> c ci cjip …`.

Angepasst: `scripts/ui-regression-check.mjs` (Navigation: Fenster nebeneinander), `mobile-check.mjs`, `meter-check.mjs`, `items-20260923-check.mjs`, `gui-polish-review.mjs` (Reiter-Selektoren → Menüleiste), `tests/akt1-ui.test.mjs`.

## Offen

- Seit den zwei Aktionsleisten (c62cf7f) beginnt die Aktionsfläche bei ~630 px: das Aufträge-Fenster (zweites links, überlappt waagrecht die Leisten) endet darüber und scrollt früher.
- Die Karte deckt die Menüleiste ab (fast Vollbild); Wechsel per Taste oder nach dem Schließen.
- 24d0f61 (Kniff-Namen zweizeilig) bleibt für andere Stellen wirksam; im Kniffe-Fenster stehen Namen nach Nutzervorgabe nur im Tooltip.
- Rechte Fenster enden vor der Spalte Minikarte/Auftragsverfolgung (x≈1700 bei 2024 px); darunter bleibt Weltfläche frei.

- Chatfenster unten links wird von linken Fenstern überdeckt (wie im Vorbild); bei Bedarf Chat über den Fenstern stapeln.
- Hilfe bleibt mit Unterreitern (Tasten/Kniffe/Einstellungen) mittig; nicht weiter verdichtet.
- Gespeicherte Fensterpositionen (`mertloch-popup-positions`, Schlüssel `book`) gelten nur noch für Overlays.

## Raster und Esc (Optimierung Runde 2a, 2026-09-24)

- **Ein Raster**: Alle Seitenfenster und das Gespräch (Figurplatz, nicht verschiebbar) stehen fest auf derselben Ober- und Unterkante
  (`PopupWindows.frame()`); Talente, Hilfe und Einstellungen mittig auf derselben Oberkante. Die Unterkante kommt aus den **sichtbaren**
  Leisten (`visibleBars()`), nicht aus der ganzen Aktionsfläche.
- **Esc** schließt alle offenen Fenster auf einmal (vorher: das oberste); danach wählt es das Ziel ab, dann kommt das Spielmenü.
- **Einstellungen** sind ein eigenes Fenster aus dem Spielmenü, nicht mehr ein Reiter der Hilfe.
- **Held unter Fenstern** (`hero-reveal.js`): beim Auto-Laufen und im Kampf werden überdeckende Fenster durchsichtig und klickdurchlässig.
- Details: `docs/OPTIMIERUNG-2026-09-24-runde-2a.md`, Prüfung `node scripts/optimierung-r2a-check.mjs`.
