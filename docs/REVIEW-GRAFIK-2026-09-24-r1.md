# Grafik-/UI-Review R1: Mertloch Chronicles (Stand origin/main 9cb8109, 2026-09-24)

Worktree `D:\Dev\MertlochChronicles-review-r1`, nur lesend. Screenshots: `_review/shots/`, Ausschnitte: `_review/crops/`, dazu
`visual-review/einzelfenster/`, `visual-review/minimap/`, `visual-review/quest-tracker/`. Alle Pfade relativ zum Worktree.

**Gelaufen:** `einzelfenster-check` (Kopie mit CDP 9462/Server 4262): PASS, 10 Prüfungen. `minimap-check` (9461/4261): PASS, 13 Prüfungen.
`quest-tracker-hud-check` (9463/4263): PASS. Eigene Szenen: `_review/szenen.mjs` (9464/4264), Messungen: `_review/probe.mjs` (9465/4265).
**Nicht gelaufen:** `gui-polish-review.mjs`. Es hat einen festen Port, speichert PNG und nutzt einen alten Spielstand. Die eigenen Szenen decken dasselbe ab.
**Nicht messbar:**
- Ein Beutefenster gibt es im Normalfall nicht. Auto-Loot (`app.js:194`) steckt alles direkt ein. Bewertet ist deshalb die Beute-Toastleiste. Das Fenster erscheint nur bei vollem Rucksack; das habe ich nicht nachgestellt.
- Die Prüf-Chrome startet mit `--hide-scrollbars`. Scrollbalken fehlen darum auf allen Screenshots und wurden per DOM gemessen (Befund 1).
- Das Spielmenü (Esc) am Desktop ließ sich im Kampf nicht öffnen, weil Esc dort zuerst den Angriff beendet. Es gibt dafür nur den Touch-Screenshot.

---

## Top 12 Befunde (nach Wirkung auf den Gesamteindruck)

### 1. „Nirgends scrollen" ist in fünf Fenstern gebrochen, die Screenshots verstecken es
- **Ort:** Aufträge (J), Hilfe (H), NPC-Gespräch, Ortsliste der Karte, Talente; am Handy auch Spielmenü und Rucksack.
  Screenshots: `_review/crops/auftraege.jpg`, `_review/shots/60-fenster-h.jpg`, `_review/shots/31-gespraech-auftraggeber.jpg`, `_review/shots/60-fenster-m.jpg`, `_review/shots/71-handy-quer-menue.jpg`.
- **Gemessen** (`scrollHeight/clientHeight` von `.popup-body`):

  | Fenster | Inhalt / sichtbar |
  |---|---|
  | Aufträge | 1430/640 (2,2-fach) |
  | Hilfe | 1896/556 (3,4-fach) |
  | Gespräch | 941/542 |
  | Karten-Ortsliste | 1384/753 |
  | Talente | 573/556 |

  Auf den Bildern sieht man abgeschnittene Knöpfe: Aufträge unten zwei halbe Buttons, im Gespräch mit Mara die Überschrift „DACHSE IM LEERGUT", am Handy „UI BEARBEITEN/EINSTELLUNGEN". Im echten Browser erscheint dort ein dünner Scrollbalken.
- **Ursache:**
  - `popup-ui.css:11`: `.popup-body{overflow:auto}`, die Inhalte sind nicht verdichtet.
  - `einzelfenster.css`: `.atlas-sidebar{overflow:auto}`.
- **Vorschlag:**
  - **Aufträge wie im WoW-Questlog:** Links eine Titelliste, je Zeile 24 px mit Symbol und Zähler. Rechts nur Titel, Schritte als Häkchenliste und Belohnung als Icon-Reihe (32-px-Slots wie im Rucksack statt „600 EP · 25 Pfandmarken · Goldener …"). Die Knöpfe „Auf der Karte" und „Auftrag lesen" werden 32-px-Symbolknöpfe mit Tooltip.
  - **Gespräch:** Pro Seite ein Auftrag. Weitere Aufträge des NPCs erscheinen als Gossip-Zeilen (Symbol plus Titel, 22 px), nicht untereinander ausgeklappt.
  - **Hilfe:** Tastenkappen-Raster (Kappe 28 px plus Icon, Name im Tooltip) statt Stichpunkt-Prosa.
  - **Karten-Ortsliste:** Einzeilig (Symbol, Name, Distanz), die Zweitzeile „Besetztes Lager/Auftrag" in den Tooltip.
  - **Talente:** Die 17 px ergeben sich, wenn die Suchzeile wegfällt (Befund 3).
  - **Absicherung:** `ui:check` sollte `scrollHeight>clientHeight` für jede `.popup-body` als Fehler werten.
- **Aufwand:** L (Aufträge und Gespräch umbauen), die übrigen M.

### 2. Die Fenster bilden kein System: Kanten, Höhen und Material springen
- **Ort:** Vier Fenster gleichzeitig. Screenshot: `_review/shots/61-vier-fenster.jpg`.
- **Befund:**
  - **Oberkanten:** Links beginnen die Fenster bei y≈185, rechts bei y≈15.
  - **Höhen:** Figur 623, Aufträge 692, Kniffe 457, Rucksack 448 px. Die Unterkanten liegen auf vier verschiedenen Linien, rechts sieht es aus wie abgerissen.
  - **Material:** In drei Fenstern sitzt eine beige Pergamentkarte im grünen Leder (Aufträge-Detail, Talent-Detail rechts, Gesprächskopf). Die Lupe und das Optionsmenü der Minikarte haben ein deutlich gröberes, großkörnigeres Ledermuster als die Fenster (`_review/crops/lupe-voll.jpg` gegen `_review/crops/rucksack.jpg`).
- **Vorschlag:**
  - Alle angedockten Fenster teilen eine Oberkante (y = 185, unter den Einheitenrahmen; rechts kollidiert das nicht mit dem Tracker, der bei x≥1705 liegt).
  - Pro Dock-Spalte gilt eine feste Höhe. Rucksack und Kniffe nutzen den Mehrplatz für eine fünfte und sechste Slotreihe statt Leerraum.
  - Pergament wird entweder konsequent für alle Lesetext-Seiten verwendet (WoW: Questlog und Gossip ganz auf Pergament) oder gar nicht. Keine Karte in der Karte.
  - Eine Leder-Textur mit einer Skalierung für alle Flächen.
- **Ursache:**
  - Lage und Höhe: `popup-windows.js` (dock-left/right).
  - Pergament: `bierdeckel.css:167` (`.quest-entry`, `.chapter-entry`, `.guide-card` …) und das Talent-Detail.
  - Menü-Leder: `minimap.css` (`.mm-menu`).
- **Aufwand:** M.

### 3. Doppelte Textreiter fressen die Fensterhöhe
- **Ort:** Aufträge, Talente, Hilfe. Screenshots: `_review/crops/auftraege.jpg`, `_review/shots/60-fenster-n.jpg`.
- **Befund:**
  - **Aufträge:** Zwei Reiterzeilen (Aufträge/Bude/Erinnerungen, dann Aktiv/Im Dorf/Erledigt), zusammen ≈120 px Chrome. Der erste Reiter heißt wie das Fenster.
  - **Talente:** Drei Spec-Karten mit Name, Rolle und „0", darunter „10 frei · Hauptbaum wählen · Suchen … · ↺", darunter drei Teilbaum-Reiter. Das sind drei Zeilen vor dem Baum.
  - **Schrift:** Die Talent-Reiter sind in Nunito gemischt geschrieben, alle anderen Reiter in Jersey 15 in Versalien.
- **Vorschlag:**
  - Die obere Ebene wird zu Symbolreitern unten am Fenster wie in WoW (32 px, Name im Tooltip). Die zweite Ebene wird zu drei 28-px-Symbolschaltern rechts in der Titelzeile. Der Reiter, der wie das Fenster heißt, entfällt.
  - Talente: Die Spec-Wahl wandert als drei runde Spec-Wappen (40 px) in die Titelzeile, Rolle und Punkte in den Tooltip. Die Suche entfällt; bei 12 Knoten je Baum braucht es keine. „10 frei" wird ein Zähler-Badge am Titel.
  - Reiter überall in einer Schrift, Jersey 15 mit 14 px.
- **Ursache:** `window-compact.js` (Umbau zu Symbolen), `talent-ui.js`/`talent-ui.css` (`.spec-tabs`), `einzelfenster.css` (`.popup-quest .quest-tabs`, `.section-jump`).
- **Aufwand:** M.

### 4. Aktionsleisten-Icons und Tastenziffern sind schwer lesbar
- **Ort:** Hauptleiste, Kniffe-Fenster. Screenshots: `_review/crops/leiste-6-8.jpg`, `_review/crops/kampf-leisten.jpg`.
- **Befund:**
  - Die Kniff-Icons sind verrauschte, geditherte Braun-/Orange-Flächen ohne klare Silhouette. Bei 35 px sind 5, 7 und 8 („Fass", „Splitter", „Tresen") nicht auseinanderzuhalten.
  - Die Tastenziffer steht in Jersey 15 bei 16 px auf einer dunklen Box oben links: **„6" liest sich wie „8"**. Die Box verdeckt außerdem ein Viertel der Icon-Silhouette.
  - Abklingzahlen stehen mit Punkt: „0.6".
- **Vergleich WoW:** Ein Motiv pro Icon, Randlicht, starker Hell-Dunkel-Kontrast. Die Taste steht oben rechts weiß mit 1-px-Umriss und ohne Box.
- **Vorschlag:**
  - Tastenlabel ohne Hintergrund, oben rechts, Nunito 800 mit 12 px und `text-shadow` als 1-px-Umriss in `#0b1216`, oder eine Pixelschrift mit offener 6.
  - Abklingzahl mit Komma, unter 1 s ohne Nachkommastelle.
  - Icons: je ein Hauptmotiv mit mindestens 60 % Fläche, dunkle Vignette, Helligkeitsabstand Motiv zu Grund ≥ 40 L*, Dithering im Motiv entfernen.
- **Ursache:** `bierdeckel.css:487` (`.action-area .skill .key{background:#0B1216B0}`), `progression-ui.css:3`. Die Icons kommen aus `skill-art.js` bzw. der Sprite-Pipeline.
- **Aufwand:** S (Ziffern), L (Icons).

### 5. Kniffe-Fenster: doppelte Rahmen, verrutschte Ecken, Badges auf den Motiven
- **Ort:** Kniffe (P). Screenshot: `_review/crops/kniffe.jpg`.
- **Befund:**
  - **Rahmen:** Jede Kachel hat einen äußeren Kartenrahmen mit Messingecken und darin einen zweiten 2-px-Rahmen um das Canvas. Die Ecken sitzen sichtbar versetzt (oben links um 3–4 px), Nachbarkacheln stoßen aneinander.
  - **Badges:** Runde Tasten-Badges („1", „LEER") sitzen mittig auf dem Motiv. Gesperrte Kacheln tragen zwei Sterne (Badge und Ecke).
  - **Leerraum:** Zwischen Kniffen und „EIGENARTEN & LEISTEN" liegen ≈70 px Luft, rechts neben dem Raster eine leere Spalte.
- **Vorschlag:**
  - Eine einzige Slot-Optik, identisch zur Aktionsleiste: 44 px, 2-px-Messingrand, Radius 6. Taste oben rechts wie in Befund 4.
  - Gesperrt: entsättigt plus kleines Schloss (12 px) unten rechts, kein Stern.
  - Die Überschrift wird ein Trennstrich mit einem Symbol (Tooltip „Eigenarten & Leisten").
  - Das Raster füllt die Breite (7 Spalten bei der jetzigen Fensterbreite).
- **Ursache:** `bierdeckel.css:912` (`.icon-skillbook .book-skill canvas{border:2px solid #b8955a}`) zusätzlich zu den Kartenregeln in `bierdeckel.css:167/209/451` für `.book-skill`; `einzelfenster.css:81` (`padding:4px;aspect-ratio:1/1`).
- **Aufwand:** M.

### 6. Zweite Leiste und Haltungsleiste: leere Leder-Platte und Textschilder
- **Ort:** Über der Hauptleiste. Screenshots: `_review/crops/kampf-leisten.jpg`, `_review/crops/haltung-leiste2.jpg`.
- **Befund:**
  - Mit einem einzigen belegten Platz steht eine 520 px breite Leiste mit neun leeren, fast unsichtbaren Plätzen da. Das ist die größte leere Fläche im HUD, direkt über dem wichtigsten Element.
  - Die Haltungsleiste zeigt ein Textbadge „LEER" auf dem Ausweich-Icon und ein eigenes Textschild „AUTOANGRIFF AUS./AN.".
- **Vorschlag:**
  - Die zweite Leiste wie in WoW nur mit belegten Plätzen zeichnen und auf deren Breite schrumpfen. Die leeren Plätze erscheinen weiter nur beim Ziehen bzw. bei offenem Kniffe-Fenster, wie es schon für `.empty-mark` gilt.
  - Autoangriff als eigener Slot mit Schwert-Icon: an = pulsierender Goldrand (WoW-Autoattack-Blinken), aus = normal.
  - „LEER" wird eine Leertasten-Kappe als Symbol oder „␣".
- **Ursache:** `bierdeckel.css:907` (`.extra-bar .skill.empty-slot{opacity:.32}` statt ausblenden), Haltungsablage aus Commit d466ab3 (`action-bar-ui.js`).
- **Aufwand:** S–M.

### 7. Gegenstands-Tooltip: zu hoch, doppelt vergleichend, Name in zwei Zeilen
- **Ort:** Rucksack-Tooltip. Screenshots: `_review/shots/11b-tip-gegenstand-vergleich.jpg`, `_review/crops/tip-gegenstand.jpg`, `_review/crops/tip-gegenstand2.jpg`.
- **Befund:**
  - Der Tooltip ist ≈600 px hoch und deckt die Menüleiste ab.
  - Unter den eigenen Werten folgt ein „Vergleich"-Block mit sechs Pillen-Chips (je ein Wert) und einem Satz „Fernkampf: 14–20 → 21–34 (+10,5 Ø je Treffer)".
  - Jeder Werte-Begriff hat eine gepunktete Unterstreichung (Glossar), das ergibt ein Streifenmuster.
  - Der Name steht in Versal-Pixelschrift und bricht um („RING DER EWIGEN / RÜCKGABE").
- **Vorschlag nach WoW-Muster:**
  - Name in Seltenheitsfarbe, gemischte Schreibung, Nunito 800 mit 15 px, einzeilig.
  - Der Vergleich kommt als zweiter Tooltip daneben mit Kopf „Angelegt". Im Haupt-Tooltip bleiben nur Deltazeilen (grün +, rot −), keine Chips.
  - Unterstreichungen nur im Shift-Detailmodus.
  - Zielhöhe ≤ 360 px.
- **Ursache:** `rpg-ui.js` (Tooltip-HTML), `popup-ui.css:16` (`.item-tooltip{width:286px;max-height:calc(100dvh - 30px);overflow:auto}`; auch der Tooltip darf scrollen).
- **Aufwand:** M.

### 8. Tooltips liegen auf dem, was sie erklären
- **Ort:** Aktionsleiste, Minikarte, Figur-Werte. Screenshots: `_review/shots/10-tip-kniff-leiste.jpg`, `_review/crops/mm-tooltip2.jpg`, `visual-review/einzelfenster/tooltip-figur.jpg`.
- **Befund:**
  - Der Kniff-Tooltip deckt die Plätze 3–8 der Leiste ab, über der die Maus steht.
  - Der Minikarten-Tooltip liegt über der linken Hälfte der Kartenscheibe.
  - Der Werte-Tooltip „NAHKAMPF" ist ein 280×70-Kasten mit nur einem Wort, ohne Wert und Wirkung, und verdeckt den Nachbarwert.
  - Der Kniff-Tooltip endet mit drei Zeilen Bedienungsanleitung („Taste belegen: B drücken, solange …").
- **Vorschlag:**
  - HUD-Tooltips an einen festen Anker wie beim WoW-GameTooltip: rechts unten über der Menüleiste (right 16 px, bottom 110 px).
  - Minikarten-Tooltip links unterhalb der Scheibe.
  - Werte-Tooltip mit Wert und einer Wirkungszeile, sonst keiner.
  - Die Bedienhilfe fällt aus dem Tooltip heraus (einmalige Tutorial-Blase oder Hilfe-Fenster).
- **Ursache:** Tooltip-Positionierung in `popup-controls.js`/`combat-ui.js` (Maus plus Versatz), `.mm-tip` in `minimap.css`, `window-compact.js` (Stat-Tooltips nur mit Titel).
- **Aufwand:** S–M.

### 9. Das HUD ist noch voller Textschilder
- **Ort:** Rund um das Spielfeld. Screenshots: `_review/crops/kampf-links-oben.jpg`, `_review/crops/zonentitel.jpg`, `_review/crops/kampf-links-unten.jpg`, `_review/crops/pootang.jpg`.
- **Befund:**
  - **Links oben:** Die Pillen „PTC Mertloch ⚙ dev" und „Kampfstatistik (V)" liegen über dem Spielerrahmen.
  - **Buff-Leiste:** Das Label „BUFFS" steht darüber.
  - **Spielerrahmen:** Der Status „AUF ERKUNDUNG" bzw. „IM KAMPF" steht als Text.
  - **Zielrahmen:** „ST. 1", „IM KAMPF · VERFOLGT DICH", „3 M". Die Unterzeile ist leerer Raum, es gibt kein Porträt, dadurch ist er asymmetrisch zum Spielerrahmen.
  - **Zonenname:** „CLAN-TREFF" steht dauerhaft oben mittig im Canvas, mit unlesbarer 8-px-Unterzeile „Geschützter Rastplatz". Die Minikarte zeigt den Namen schon.
  - **Clan-Schild:** „POO-TANG · MERTLOCH" ist eine schiefergraue Web-Pille in Nunito mitten in der Welt.
  - **Toasts links unten:** Die Beute-Toasts überlagern die Chatzeile („Angelegt: Hauers letzter Zahn …" halb verdeckt).
- **Vorschlag:**
  - Beide Pillen links oben werden 32-px-Symbolknöpfe mit Tooltip. Die Kampfstatistik gehört in die Menüleiste.
  - „BUFFS" weg; die Buffs rücken rechts oben neben die Minikarte (WoW-Ort).
  - Kampfstatus als gekreuzte Schwerter (16 px) am Porträtring.
  - Zielrahmen mit Porträt links wie der Spielerrahmen. Stufe im Ring, Status und Distanz in den Tooltip.
  - Zonentitel nur 3 s beim Betreten, dann ausblenden; Unterzeile ≥ 12 px mit Umriss.
  - Clan-Schild als gemaltes Holzschild.
  - Toasts und Chat bekommen eine gemeinsame Spalte ohne Überlappung.
- **Ursache:**
  - `#gameMenuButton.world-menu-brand`, `#meterToggle` (`meter.css`), `.unit-name`/`unit-frame.js`.
  - Zonentitel im Canvas: `renderer.js`.
  - Toasts: `bierdeckel.css`/`app.js`.
- **Aufwand:** S je Punkt, zusammen M.

### 10. Weltkarte: Textlegende, Buchstaben statt Symbole, Dauer-Beschriftungen
- **Ort:** Karte (M). Screenshots: `_review/shots/60-fenster-m.jpg`, `_review/crops/karte-legende.jpg`, `_review/crops/karte-mitte.jpg`, `_review/crops/karte-liste-ende.jpg`.
- **Befund:**
  - **Legende:** Eine Textzeile unter der Karte; eine zweite Zeile rutscht rechts nach unten. Das Muster für „Lebewesen" ist ein **leeres weißes Quadrat** (kaputt).
  - **Marker:** Buchstaben (W, R, K, 8) statt Symbole. Am Spielerstandort klumpen fünf Marker übereinander.
  - **Beschriftung:** Jede Auftragsstelle trägt dauerhaft ein Namensschild („Kegelbrüder aus Kalt vom Festplatz kegeln"). Das widerspricht „Namen nur beim Mouse-Over".
  - **Maßeinheit:** Die Distanzen stehen als „28 M" (Versalien machen aus Meter „M").
  - **Knöpfe:** Oben rechts sind es Textknöpfe („ZU MIR", „ÜBERSICHT"), oben links Symbolknöpfe.
  - **Fußzeile:** „Norden ist oben · Welt läuft weiter" ist Fülltext. Der OSM-Hinweis muss bleiben, reicht aber als 10-px-Zeile.
- **Vorschlag:**
  - Legende weg; der Lupen-Filter der Minikarte kommt als Symbolleiste in die Karte (gleiche Icons).
  - Buchstaben durch die Minikarten-Symbole ersetzen, dichte Marker bündeln (Zahlenbadge, Tooltip listet).
  - Namensschilder nur beim Mouse-Over.
  - „Zu mir" als Fadenkreuz-Symbol, „Übersicht" als Vollbild-Symbol. Einheit „m" von `text-transform` ausnehmen.
- **Ursache:** `atlas-ui.js`/`cartography.js`, `bierdeckel.css:253` (`.atlas-place b{text-transform:uppercase}`), `einzelfenster.css` (`.atlas-key`).
- **Aufwand:** M.

### 11. Handy: kaputter Spielerrahmen quer, Toasts übereinander hochkant
- **Ort:** Touch-HUD. Screenshots: `_review/shots/72-handy-quer-bag.jpg`, `_review/shots/71-handy-quer-menue.jpg`, `_review/shots/70-handy-hoch-hud.jpg`, `_review/shots/72-handy-hoch-quest.jpg`.
- **Befund:**
  - **Quer (844×390):**
    - Im Spielerrahmen bricht „1.095 / 1.095" zweizeilig in einer 16-px-Leiste um und wird abgeschnitten. Der Name wird zu „GRAFIK PR…", die Randale-Leiste zeigt nur „Randale ·".
    - Die Rucksack-Suche ist abgeschnitten („Wer…"). Nur 8 von 10 Gegenständen sind sichtbar, der Rest scrollt.
  - **Hochkant:**
    - Zwei Chat-Zeilen „Neuer Auftrag …" liegen genau über dem beigen Toast mit demselben Text; dieselbe Meldung erscheint dreifach übereinander.
    - „ERINNERUNGEN" stößt an den Reiterrand.
    - Distanz als „65 M".
- **Vorschlag:**
  - Spielerrahmen quer: HP-Text nur als Zahl ohne Maximum („1.095") oder die Leiste ≥ 18 px ohne Umbruch (`white-space:nowrap`).
  - Chat-Log und Toasts am Handy nicht gleichzeitig: Toasts ersetzen die Chatzeile.
  - Die Reiter als Symbole (Befund 3) lösen den Rand mit.
- **Ursache:** `mobile-polish.css` (Frame-Maße quer), `mobile.css`, `bierdeckel.css` (Toast-/Chat-Stapel).
- **Aufwand:** S–M.

### 12. Sammelobjekte: kaum von Deko zu unterscheiden, Hover doppelt, Label mit Zacken
- **Ort:** Fundstellen in der Welt. Screenshots:
  - `_review/shots/22-node-9-herbs-ohne.jpg` (ohne Maus)
  - `_review/shots/22-node-5-herbs-maus.jpg` und `_review/shots/22-node-2-machinery-maus.jpg` (Maus)
  - `_review/shots/22-node-1-herbs-maus.jpg` (unter dem Dach)
- **Befund:**
  - **Tarnung:** Feldkräuter sind ein kleines Büschel mit violetten Blüten, dieselbe Farbe wie die Deko-Blumen daneben. Der Schimmer besteht aus zwei weißen 3–4-px-Kreuzen und ist im Standbild kaum zu sehen.
  - **Hover doppelt:** Beim Überfahren erscheinen gleichzeitig Weltlabel, Ring und Tooltip, der Name also zweimal.
  - **Zacken:** Das Weltlabel hat **schwarze Zacken** über bzw. unter der Schrift. `strokeText` läuft mit Miter-Ecken; `profession-art.js:10` setzt kein `lineJoin`, anders als `renderer.js:114`.
  - **Unter dem Dach:** Fundstelle `profession-node-1` liegt unter dem Dach des Ruinenhauses nahe dem Spawn und ist unsichtbar; nur der Tooltip verrät sie.
  - **Hängender Tooltip:** Der Welt-Tooltip blieb nach einem Kamerasprung ohne Mausbewegung stehen (`_review/shots/40-beute.jpg`, „Alte Maschinenteile" mitten im Bild). Ich habe das nur nach einem Teleport gesehen; beim Laufen mit ruhender Maus sollte man es prüfen.
- **Vorschlag:**
  - `NODE.scale` .5 → .7. Schimmer als goldener 2-Frame-Glint, 6 px, alle 1,2 s.
  - Keine violetten Deko-Blumen im Umkreis von 24 px einer Kräuter-Fundstelle.
  - Beim Hover nur Ring plus Tooltip, kein Weltlabel.
  - `c.lineJoin='round'` im Label.
  - `professionWorld.place()` gegen Dachflächen prüfen.
  - `hoverNode` bei Kamerabewegung neu auswerten.
- **Aufwand:** S (Label, Hover, Skalierung), M (Platzierung).

---

## Quick Wins (jeweils Minuten)
1. `profession-art.js:10`: `c.lineJoin='round'` im `label()`, damit die schwarzen Zacken an den Fundstellen-Namen verschwinden.
2. Einheitliche Zahlen:
   - Der Kniff-Tooltip zeigt „1.4 s" (`combat-ui.js:40`, `toFixed`), der Gegenstand „2,0 s". Die Abklingzahl zeigt „0.6".
   - Figur zeigt „365 / 1125", HUD „1.125".
   - Alles mit `toLocaleString('de-DE')`.
3. „M" statt „m": Distanzen aus `text-transform:uppercase` herausnehmen (`<span class="unit">` mit `text-transform:none`). Betrifft Zielrahmen, Kartenliste und die Handy-Auftragsleiste.
4. Kartenlegende: das weiße Quadrat „Lebewesen" reparieren oder die Zeile streichen.
5. Figur: `.armory-controls` (`einzelfenster.css`, `top:calc(var(--body-height)*.84)`) überdeckt den unteren rechten Ausrüstungsplatz. Die Knöpfe unter die Puppe oder in die Titelzeile.
6. Doppelte Namen: Gesprächsfenster (Titelzeile plus Kopfkarte „KISTEN-IDA" zweimal) und Figur-Fenster (Name im Fenster und im Rahmen). Die Kopfkarte behält den Namen, die Titelzeile bekommt nur das Symbol.
7. Tastenlabel in der Aktionsleiste ohne dunkle Box (`bierdeckel.css:487`), damit die 6 nicht mehr wie eine 8 aussieht (Schrift mit offener 6).
8. „Daily:" im Tracker durch ein Symbol ersetzen (Uhr/Kalender, 12 px). Zähler („0/3") in die Distanzspalte statt Umbruch auf eine neue Zeile. Nebenaufträge in dieselbe Schrift wie der verfolgte, nur kleiner; derzeit Jersey, eine winzige Pixelschrift und Nunito gemischt.
9. „BUFFS"-Label entfernen.
10. Der Zonentitel oben mittig blendet nach 3 s aus.
11. Tooltip-Fußzeile „Taste belegen: B drücken …" streichen.
12. `ui:check`: `.popup-body` mit `scrollHeight>clientHeight+1` als Fehler. Die Prüfskripte starten Chrome mit `--hide-scrollbars`; deshalb ist das bisher niemandem aufgefallen.

## Was bleiben soll (nicht kaputt verbessern)
- **Minikarte:** Messingring mit Laub, Zonenpille oben, Uhrzeit-Pille unten. Lupe, Karte und Optionen sitzen als Rundknöpfe auf dem Ring. Ein-Blick-Symbole (Ausrufezeichen, Hammer, Blatt), gestrichelter Laufweg. Die Optionen merken sich Form und Größe. Das ist das stärkste HUD-Element und näher an WoW als alles andere. (`visual-review/minimap/01-standard-zoom.jpg`)
- **Einheitenrahmen:** Porträtring mit Stufenmarke, grüne HP-Leiste und Randale-Leiste mit Messingnieten an den Ecken. Der Zielrahmen steht direkt daneben. Aufbau und Lage stimmen (nur der Text muss raus, Befund 9).
- **Menüleiste rechts unten:** Farbige gemalte Icons mit Tastenkappe unten rechts, Badge „10" für freie Talentpunkte. Gut lesbar, Namen nur im Tooltip.
- **Rucksack-Raster:** Seltenheitsrahmen grau/grün/blau/lila und grüner Aufwärtspfeil für Verbesserungen. Das ist WoW-Sprache und sofort verständlich.
- **Figur-Puppe:** Silhouetten-Platzhalter mit Führungslinien zur Figur und Werte-Raster als Icon plus Zahl. Die Idee ist richtig; nur Überlappung und Unschärfe beheben.
- **Auftragsverfolgung:** Kein Kopf, ein Schritt je Auftrag, Distanz rechts, Details im Tooltip, Klick verfolgt. Die Struktur passt; nur die Schriftmischung glätten.
- **Talentbaum:** Knoten mit Rangzähler „0/1" und Verbindungslinien. Das ist der richtige WoW-Classic-Aufbau.
- **Lupen-Filter:** Symbol, Name, Häkchen, eine Zeile je Gruppe; kompakt und klar.
- **XP-Leiste** unten über die volle Breite mit Segmenten.

## Wichtigste Screenshots
- HUD Ruhe: `_review/shots/01-hud-ruhe.jpg` · HUD Kampf: `_review/shots/50-hud-kampf.jpg`, `_review/shots/51-hud-kampf-b.jpg`
- Einzelfenster: `_review/shots/60-fenster-{c,j,i,p,n,h,m}.jpg` · Vier gleichzeitig: `_review/shots/61-vier-fenster.jpg`
- Karte: `_review/shots/60-fenster-m.jpg`
- Minikarte, Lupe und Optionen: `visual-review/minimap/04-lupe-zoom.jpg`, `visual-review/minimap/10-optionen-zoom.jpg`; Symbol-Tooltip: `visual-review/minimap/07-tooltip-mehrere-zoom.jpg`
- Tooltips:
  - Gegenstand: `_review/shots/11-tip-gegenstand.jpg`, `_review/shots/11b-tip-gegenstand-vergleich.jpg`
  - Kniff: `_review/shots/10-tip-kniff-leiste.jpg`, `visual-review/einzelfenster/tooltip-kniffe.jpg`
  - Auftrag: `_review/shots/13-tip-auftrag.jpg`
  - Sammelobjekt: `_review/shots/22-node-2-machinery-maus.jpg`
- NPC-Gespräch: `_review/shots/30-gespraech-npc.jpg`, `_review/shots/31-gespraech-auftraggeber.jpg`
- Beute (Auto-Loot-Toasts, kein Fenster): `_review/shots/40-beute.jpg`, `_review/crops/kampf-links-unten.jpg`
- Handy: `_review/shots/70-handy-quer-hud.jpg`, `_review/shots/70-handy-hoch-hud.jpg`, `_review/shots/72-handy-*-*.jpg`
- Vergrößerungen: `_review/crops/*.jpg`

## Nebenbefund außerhalb der UI
Die Kamera ist seit 50bfa5b näher. Seitdem füllt das eingestürzte Dach des Ruinenhauses nahe dem Spawn ein Viertel bis ein Drittel des Bildes (`_review/shots/50-hud-kampf.jpg`, `_review/shots/20-sammelobjekt-ohne-maus.jpg`). Das Dach blendet nicht aus, wenn Held oder Fundstelle darunter stehen; man sieht nur einen hellen Umriss.
