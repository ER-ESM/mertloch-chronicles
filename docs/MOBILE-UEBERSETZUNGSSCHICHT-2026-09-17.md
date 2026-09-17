# Mobile Übersetzungsschicht und Mobile-Prüfung · 2026-09-17

Auftrag: eine mobile Übersetzungsschicht bauen, visuelle Tests fahren und alles auf Handy-Tauglichkeit prüfen. Branch `ui-mmo-2026-09-17`.

## 1 · Was vorher galt

Der Touch-Modus (`mobile-controls.js`, `mobile-layout.js`, `mobile.css`) hatte bereits Joystick, sechs Kniff-Knöpfe je Seite, Ziel-/Aktions-Knopf, Langdruck-Erklärung und ein Fenster-Layout mit Sicherheitsabständen. Was fehlte, war **eine** Stelle, die Desktop-Sprache in Touch-Sprache übersetzt: Tastenhinweise („[1] schaltet um“, „[LEER] weicht aus“, „Tab wählt ein Ziel“, „Rechtsklick“, „Maus über das Icon halten“) waren in `app.js` an drei Stellen unterschiedlich behandelt (Toast strich sie, Clan-Schule ersetzte sie durch **Desktop**-Tasten, `<kbd>` wurde per CSS versteckt und ließ halbe Sätze zurück).

## 2 · Die Schicht: `mobile-translate.js`

Reine Funktionen, in Node testbar (`tests/mobile-translate.test.mjs`, 6 Tests):

| Funktion | Aufgabe |
|---|---|
| `touchKeyFor(skillId, slots, page)` | Kniff → Touch-Bezeichner: `Stiefel` (Ausweichen), `Hand` (Unterbrechen), `Knopf 3`, `Seite 2 · Knopf 1`, `Kniffe-Buch` (unbelegt) |
| `translateKeyToken(token, ctx)` | Tasteninhalt (`LEER`, `Q`, `F`, `Tab`, `E`, `1`–`0`, Reiterbuchstaben) → Touch-Bezeichner; unbekannt → `null` |
| `translateText(text, ctx)` | `[1]…[0]`, `[LEER]`, `[F]` … sowie Wendungen: Tab → Ziel-Knopf, WASD → Joystick, Rechtsklick → Antippen, Esc → ×, „Maus über das Icon halten“ → „Icon länger drücken“, Skillbuch → Kniffe-Buch |
| `translateNode(root, ctx)` | DOM: Textknoten, `<kbd>` (wird zum Touch-Chip `.touch-kbd`) und `title`; **keine** `data-*`/`aria`-Attribute, keine Eingabefelder, `data-no-translate` schützt |
| `createTranslator({getGame,getMobile,actionBar})` | Bindung ans Spiel: liest Touch-Belegung und Seite aus `mobile.state()`; ohne Touch-Modus ein Durchlauf |

Verdrahtung in `app.js` (vier Stellen, alle alten Sonderfälle ersetzt):

- `openModal` → `translator.node(panel.body)` für **jedes** Fenster (Clanbuch, Gespräch, Beute, Erklärung, Erinnerung, Tod).
- `toast` → `translator.text`.
- Clan-Schule (`#lessonText`, `#lessonButton`) → Touch-Bezeichner des gelernten Kniffs („[Knopf 4]“ statt „[4]“).
- `remapHint` → auf Touch über die Schicht mit fester Tastenzuordnung.

`mobile.css`: `<kbd>` wird nicht mehr versteckt, sondern als Touch-Chip gezeigt (`kbd.touch-kbd`); Clanbuch-Reiter mindestens 44 px hoch.

Grenze der Schicht: Sie übersetzt beim Anzeigen, nie in den Daten (`content/`). Texte mit eigener Touch-Fassung (`content/tutorial.js` `desktop`/`touch`, Hilfe → Bedienung) bleiben wie sie sind; die Schicht greift nur, wo kein Touch-Text existiert.

## 3 · Mobile-Prüfung: `npm run mobile:check`

`scripts/mobile-check.mjs` startet ein eigenes headless Chrome (CDP, kein npm-Paket) mit Touch-Emulation, erzwingt den Touch-Modus über `mertloch-touch-v1` und geht je Gerät 16 Schritte durch:

HUD · Figur · Ausrüstungsplatz antippen · Rucksack · Gegenstand antippen · Kniffe · Kniff antippen · Talente · Talent antippen · Aufträge · Bude · Karte · Hilfe · Hilfe/Bedienung · Kniff lange drücken · Toast.

Geräte: Hochkant 390×844, Quer 844×390, Klein 360×740. Prüfungen je Schritt:

1. Seite nicht breiter als der Viewport, kein Fenster außerhalb.
2. Kein Fenster über Joystick oder Kniff-Knöpfen.
3. Tipp-Ziele in Fenstern und Touch-HUD: unter 32 px ist ein Fehler, 32–39 px wird gezählt.
4. Kein Desktop-Begriff in sichtbarem Fenstertext (`[LEER]`, `[F]`, `[1]`, „Tab wählt“, WASD, Rechtsklick, Maus).
5. Keine Laufzeitfehler.

Ergebnis 2026-09-17: **48 Schritte, 0 Fehler, keine Laufzeitfehler**; nach der Reiter-Anhebung 0 Tipp-Ziele unter 40 px. Bericht und Screenshots: `visual-review/mobile-check/REPORT.md`, `<gerät>-<schritt>.png`.

## 4 · Befund der Handy-Prüfung (alles durchgesehen)

| Bereich | Stand | Bemerkung |
|---|---|---|
| HUD hochkant | gut | Spielerfenster, Menü-Knopf mit Hinweis, Hofprobe-Kasten, Joystick, 3×2 Kniffe, Stiefel/Hand |
| HUD quer | gut | Fenster 444 px mittig, Steuerung frei links/rechts |
| Figur | gut | 4×4-Raster (Papierpuppe erst ab 640 px Buchbreite), Platz antippen → Detail-Fenster mit Ablegen |
| Rucksack | gut | 5 Spalten, Gegenstand antippen → Anlegen/Vergleich/Geschichte |
| Kniffe | gut | 3 Spalten mit Namen, antippen → Erklärung + „Touchbuttons belegen“; Langdruck im HUD → Erklärung |
| Talente | gut | Baum 480 px, Schwellenbänder links, antippen → Erklärung + Lernen/Zurücknehmen |
| Aufträge, Bude, Karte, Hilfe | gut | Karte mit +/−/Zu mir, Hilfe hat eigene Touch-Bedienungstabelle |
| Klein 360×740 | gut | Fenster 336×376, alles erreichbar |
| Übersetzung | gut | Clan-Schule „[Knopf 4]“, Toasts ohne Desktop-Tasten, `<kbd>` als Chip |

Offen (nicht Teil dieser Runde, im UI-Backlog): Papierpuppen-Bogen auch quer auf dem Handy (Buchbreite 444 px liegt unter der 640-px-Schwelle); Touch-Editor „Touchbuttons belegen“ mit Drag statt Tipp-Tipp; Gespräch/Beute/Tod im Prüfskript ergänzen, sobald ein Spielstand mit Gegner in Laufnähe als Fixture liegt.
