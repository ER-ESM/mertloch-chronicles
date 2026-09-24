# Einzelfenster statt Clanbuch · 23.09.2026

Nutzerauftrag: Die Reiter im einen Fenster („Clanbuch“) auflösen, jedes Menü einzeln aufrufbar, angedockt wie im MMO-Vorbild; kompakter, Fließtext in Tooltips, Symbole statt Beschriftungen. Hebt die Entscheidung „ein Fenster, sechs Reiter“ aus `docs/MENUE-BEWERTUNG-2026-09-17.md` auf (Eintrag in `ENTSCHEIDUNGEN.md` trägt der Orchestrator nach).

## Was

| Fenster | Taste | Lage (Desktop) |
|---|---|---|
| Figur | C | links, unter Menüknopf/Spielerrahmen |
| Aufträge (mit Bude, Erinnerungen) | J (B springt zur Bude) | links, neben Figur |
| Talente | N | mittig |
| Karte | M | mittig, fast Vollbild (2,5 % Rand), Karte + Ortsliste nebeneinander |
| Kniffe | P (K als alter Griff) | rechts, neben Rucksack |
| Rucksack | I | rechts, vor Minikarte/Auftragsverfolgung |
| Hilfe | H | mittig |

- Mehrere Fenster zugleich; je Seite reihen sie sich in Öffnungsreihenfolge vom Rand nach innen. Dieselbe Taste schließt, Esc schließt das oberste. Sie halten Aktionsleiste und Menüleiste frei (Höhe endet darüber, wo sie waagrecht überlappen).
- Overlays (Gespräch, Menü, Laden, Tod …) schließen weiter alle Fenster; Beute darf neben ihnen stehen. Gegenstands-/Kniffdetails hängen neben ihrem Fenster (bei rechts angedockten links daneben) und schließen mit ihm.
- Angedockte Fenster sind nicht verschiebbar (feste Plätze wie im Vorbild); Overlays bleiben verschiebbar.
- Menüleiste unten rechts: alle sieben Fenster, Tooltip „Name [Taste]“ + Kurzzweck; Talentpunkte-Abzeichen jetzt am Talente-Knopf.
- Touch: immer nur ein Fenster (wie bisher Vollfenster). Spielmenü oben ein Symbolraster mit allen sieben Fenstern (ersetzt „Clanbuch“).

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
