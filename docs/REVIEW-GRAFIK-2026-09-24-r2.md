# Grafik-/UI-Review R2: Mertloch Chronicles (Stand origin/main 519c1db, Build nach #429, 2026-09-24)

Worktree `D:\Dev\MertlochChronicles-review-r2`, nur lesend. Alle Pfade relativ zum Worktree.
Screenshots: `_review/shots/`, vergrößerte Ausschnitte: `_review/crops/`, dazu `visual-review/optimierung-r1/`, `visual-review/einzelfenster/`, `visual-review/minimap/`, `visual-review/quest-tracker/`.

**Gelaufen (alle grün):** `optimierung-r1-check` (CDP 9460/Server 4260, 16 Prüfungen), `minimap-check` (9461/4261, 13), `einzelfenster-check` (Kopie `_review/`, 9462/4262, 10), `quest-tracker-hud-check` (Kopie, 9463/4263).
Eigene Szenen: `_review/szenen.mjs` (vier Läufe parallel auf 9464–9467/4264–4267), Messungen: `_review/probe2.mjs` (9468/4268), `_review/probe3.mjs` (9469/4269). Messwerte: `_review/report-*.json`.

**Nicht messbar / Einschränkungen:**
- Minikarten-Symbol-Tooltip: Mein Hover-Raster traf den Lupenknopf („Kartensymbole“), nicht ein Symbol. Bewertet ist darum `visual-review/minimap/06-tooltip-zoom.jpg` aus dem Minikarten-Check.
- Gespräch mit einem *neuen* Auftrag: Beim Geber „grillwiese“ öffnete F kein Gespräch (zu weit weg). Bewertet ist das Gespräch mit Mara (`30-…`), einem Auftrag vor der Annahme, und Ida (`32-…`).
- Zonenwechsel 4 („Geplünderter Grillplatz“): Der Screenshot entstand vor der Einblendung. Die Zonenwechsel 1–3 zeigen den Titel.
- Esc im Kampf (`51-esc-im-kampf.jpg`) beendet den Angriff wie vorgesehen. Das Spielmenü ist außerhalb des Kampfs geprüft (`63-spielmenue.jpg`).
- Scrollbalken sind wegen `--hide-scrollbars` unsichtbar. Alle Scrollwerte stammen aus der DOM-Messung (`scrollHeight/clientHeight` je Element mit `overflow` ≠ visible).

---

## Stand der Runde-1-Punkte

| Punkt | Urteil | Beleg |
|---|---|---|
| **Feste Fensterplätze** | **mit Mängeln** | C/J/P/I stehen auf derselben Oberkante y=183 und bleiben stehen, wenn ein Nachbar schließt (Prüfskript grün, `_review/shots/61-vier-fenster.jpg`). Es gibt aber weiter drei Unterkanten: Figur 800, Aufträge 667, Kniffe/Rucksack 629. Alle anderen Fenster halten sich nicht an das Raster: Gespräch x=24/y=185 statt 12/183 (12 px bzw. 2 px versetzt), Talente y=21, Hilfe y=12, Spielmenü y=150. Die Aufträge werden von der **unsichtbaren** zweiten Leiste und der Haltungsleiste auf 484 px Höhe gedrückt (Befund 1). |
| **Alle 7 Leistenknöpfe** | **sauber** | 7 × 46 px, Abstand 3 px, Leiste 340×50 bei (1664,817). Tastenkappe unten rechts, Badge „10“ an Talente, Schloss bei Sperre, Tooltip mit Bedingung. `_review/crops/menueleiste.jpg`, `visual-review/optimierung-r1/r1-01z-menueleiste.jpg`. Kleinigkeit: Der Zoom-Ausschnitt im Prüfskript schneidet den ersten Knopf ab (Ausschnitt nur 8 px Rand), die Leiste selbst ist in Ordnung. |
| **Ortsschild und Zonentitel wie in WoW** | **mit Mängeln** | Ein- und Ausblenden funktioniert (3,6 s, Minikarten-Schild auch beim Überfahren). Drei Mängel: (1) Der Titel überlagert am Clan-Treff das Weltschild, Ursache unten. (2) Die Unterzeile „Geschützter Rastplatz“ ist Jersey 15 mit 12 px, auf dem Schirm etwa 7 px Versalhöhe, praktisch unlesbar (`_review/crops/zonentitel-pfandhof.jpg`). (3) Der Titel steht mit 28 px und `top:18px` ganz oben auf Dächern und Wimpeln statt wie in WoW groß im oberen Viertel. Handy hochkant: unter dem Spielerrahmen steht dauerhaft „CLAN-TREFF“ in winziger Schrift (`_review/shots/70-handy-hoch-hud.jpg`). |
| **Popups obenauf** | **sauber** | Optionen, Lupe, Kontextmenü und Tooltips liegen über den Fenstern (Prüfskript Punkt 3 grün, `visual-review/optimierung-r1/r1-20-minikarte-optionen-obenauf.jpg`). Die Tooltips liegen allerdings weiter auf dem, was sie erklären (Befund 7); das ist eine Frage des Ankers, nicht der Ebene. |
| **Quick Wins** | **mit Mängeln** | Umgesetzt: Tastenziffern ohne Box, kein „Buffs“-Schild, Legende „Lebewesen“, „m“ in der Karte, Kalender statt „Daily:“ im Tracker, Kniff-Tooltip ohne Bedienhilfe, Figur- und Gesprächsname nur einmal, Komma in der Abklingzahl („0,8“). Übersehen: (a) Toast „Dosenmut muss noch verschnaufen · **2.2 s**“ mit Punkt (`engine.js:154`, `toFixed(1)`). (b) Handy-Wegmarke „4 × Pfanddachs besiegen 0/4 **65 M**“: `mobile-controls.js:52` kopiert den Tracker per `textContent` und verliert dabei das `<em>`, für das `wow-feinschliff.css:13` die Ausnahme hat. (c) Das Verstecken des Gesprächstitels per `visibility:hidden` (`wow-feinschliff.css:24`) lässt eine leere 36-px-Titelzeile mit Symbol und × stehen (`_review/crops/gespraech.jpg`). (d) Chat „Neuer Auftrag: Daily: Kabelsalat“: „Daily:“ steckt im Titel selbst (`content/hotspots.js:125`); der Tracker filtert es, Chat und Toasts nicht. |

### Ursache: „CLAN-TREFF“ überlagert „POO-TANG · MERTLOCH“
- Der Zonentitel ist DOM (`.region-label`, `polish.css:2` bzw. `bierdeckel.css:771`): `top:18px`, `left:50%`, Box 172–414 × 54 px um x=1012. Sein Hintergrund ist nur ein weicher Radialverlauf (`#0d1a14b8 → 0`), also keine Platte.
- Das Clan-Schild ist Canvas-Welt (`clan-art.js:24–26`, `drawClanCamp`): ein gerahmtes Rechteck an `church.maxY+7`, Nunito 7 Welt-px, bei Kamerafaktor 2,6 etwa 250×36 Bildschirm-px.
- Die Kamera zentriert den Helden auf (1012,450). Am Ankunftspunkt des Clan-Treffs (Hub 9296/8728, Spieler 30 px südlich) liegt das Schild 150 Welt-px nördlich, also 390 px über dem Helden, **auf y=60 und x≈983–1233**. Gemessen: `signScreen {x:1108,y:60}`, Titel y=18–72, x≈926–1098. Die Überdeckung ist also kein Zufall: Jeder Spieler, der von Süden auf den Clan-Treff kommt, sieht beide Schilder ineinander, weil die Kirche genau eine halbe Bildschirmhöhe nördlich des Treffpunkts steht.
- Beide sprechen dieselbe Formensprache (cremefarbene Versalien auf dunklem Grün mit Goldrand). Deshalb liest man sie als *ein* kaputtes Schild statt als zwei Ebenen.
- **Abhilfe:** Titel nach WoW-Muster in die Bildhöhe 18 % (`top:18vh`, bei 900 px ≈ 160) schieben, damit liegt er zwischen Schild (y≈60) und Held (y≈450). Dazu 40 px Jersey, dicker Umriss (`-webkit-text-stroke:1px #0b1216` plus 2-px-Schatten), Unterzeile Nunito 800 mit 15 px. Zusätzlich das Clan-Schild als gemaltes Holzschild ohne Web-Rahmen (Rest-Punkt 7 aus R1).

---

## Top 12 Befunde (nach Wirkung)

### 1. Aufträge (J): Das Fenster zeigt einen von drei Aufträgen, der Rest scrollt
- **Ort:** Aufträge, allein und bei vier Fenstern. Screenshots: `_review/shots/60-fenster-j.jpg`, `_review/shots/61-vier-fenster.jpg`, Handy `_review/shots/72-handy-quer-quest.jpg`.
- **Problem:**
  - Gemessen: Inhalt/sichtbar = **1430/432** (3,3-fach). R1 meldete 927/385. Die Verfolgung rechts zeigt drei Aufträge, das Fenster zeigt davon genau einen: die Pergamentkarte „Der übliche Verdächtige“ mit drei Textknöpfen.
  - Oben stehen zwei Reiterzeilen mit zusammen 120 px, bevor der erste Auftrag beginnt. Die Belohnung ist ein Satz („600 EP · 25 Pfandmarken · Goldener Dosenöffner · +12 % Schaden …“).
  - Handy quer: 1439/286 (5-fach). Die Reiter belegen 60 % der Fensterhöhe.
- **Ursache:**
  - Höhe: `popup-windows.js:81`, die Funktion `floor()` begrenzt jedes Fenster, das waagrecht über `.action-area` liegt, auf deren Oberkante minus GAP. Die Aktionsfläche ist 537×194 ab y=673. Sie schließt die Haltungsleiste und die zweite Leiste auch dann ein, wenn diese leer und nur `visibility:hidden` ist. Die Aufträge (x 460–880) überschneiden die Aktionsfläche (x 743–1280) um 137 px und enden darum bei 667. Die Figur (x 12–452) wird nicht begrenzt und reicht bis 800.
  - Inhalt: `questlog-ui.js`, `window-compact.js:31` (Reiter), `bierdeckel.css:167` (`.quest-entry`-Pergament).
- **Vorschlag:** Zielbild 1 unten. Es passt in die heutigen 420×484 px, auch mit sichtbarer zweiter Leiste.
- **Aufwand:** L.

### 2. Hilfe (H): Eine Textwand mit 3,1-facher Höhe
- **Ort:** Hilfe. Screenshots: `_review/shots/60-fenster-h.jpg`, `visual-review/optimierung-r1/r1-14-figur-hilfe-rucksack.jpg`, Handy `_review/shots/72-handy-hoch-guide.jpg`.
- **Problem:**
  - Gemessen 1896/603 (Handy hoch 1866/411, quer 1521/286). Die Kästen enthalten 13 Stichpunkt-Sätze, der letzte ist unten abgeschnitten („Ist der Rucksack voll …“).
  - Der Reiter „Einstellungen“ gehört ins Spielmenü; er steht dort auch.
  - Der Knopf „Einführungsfilm ansehen“ belegt eine eigene 40-px-Zeile.
  - Das Fenster sitzt bei y=12, nicht auf der gemeinsamen Oberkante.
- **Ursache:** Textinhalt aus `content/` über `panel-pages.js`/`window-compact.js`; `.popup-body{overflow:auto}` (`popup-ui.css:11`); Mittelplatzierung `popup-windows.js:95` (`place(w,left,EDGE,…)`).
- **Vorschlag:** Zielbild 2 unten: ein Tastenkappen-Raster mit 560×300 px, die Erklärung steht im Tooltip der Kappe.
- **Aufwand:** M.

### 3. Zonentitel liegt auf dem Weltschild und ist zu klein
- **Ort:** Clan-Treff (Kirche), jeder Gebietswechsel. Screenshots: `visual-review/optimierung-r1/r1-31-gebietswechsel-ortsschild.jpg`, `visual-review/optimierung-r1/r1-31z-zonentitel.jpg`, `_review/shots/40-zonenwechsel-1.jpg`, `_review/crops/zonentitel-pfandhof.jpg`.
- **Problem:** Überdeckung siehe Ursache oben. Die Unterzeile ist mit 12 px Jersey unlesbar. Mit 28 px wirkt der Titel wie ein weiteres HUD-Schild und nicht wie der große Moment des Ankommens.
- **Vorschlag:** Wie in WoW: `top:18vh`, h2 mit 40 px Jersey und Farbe `--gold` statt Creme, damit er sich vom Clan-Schild unterscheidet, 2-px-Umriss. Unterzeile Nunito 800 mit 15 px in Creme, darunter kein Punkt/Icon. Kein Radialverlauf; der Umriss trägt die Lesbarkeit.
- **Ursache:** `polish.css:2` (`.region-label{top:15px}`), `bierdeckel.css:274–277, 771–772` (Größen), `clan-art.js:24–26` (Schild).
- **Aufwand:** S.

### 4. Die Welt beschriftet sich dauerhaft selbst
- **Ort:** Überall im Dorf. Screenshots: `_review/shots/01-hud-ruhe.jpg`, `_review/shots/40-zonenwechsel-1.jpg`.
- **Problem:**
  - Ortsnamen stehen in 18-px-Schrift in der Welt: „Willis Werkhof“, „Fahrstall am Clan-Treff“, „Konterbrunnen“, „Kirchvorplatz“, „Bärbels Braugarten“, sogar der Straßenname „Im Thürig“.
  - Dazu kommen Interaktionshinweise als Welttext („F · Fahrstall ansehen“), die Wegmarke „65 m“ mitten im Bild und das Clan-Schild.
  - Auf einem Bildschirm am Clan-Treff zähle ich neun Textschilder in der Welt, ohne die NPC-Namen.
  - WoW zeigt Ortsnamen nur im Zonentitel und auf der Minikarte, NPC-Namen sind abschaltbar. Die Vorgabe „Namen nur beim Mouse-Over“ gilt hier nicht.
  - Nebenbefund: Ein Weltlabel ragt als einzelnes „E“ links unter der Aktionsleiste hervor (Canvas bei 733/810, `_review/crops/aktionsflaeche.jpg`). Die Labels werden nicht gegen die HUD-Flächen ausgeblendet.
- **Vorschlag:**
  - Ortslabels nur beim Überfahren der Station oder als Zonentitel beim Betreten.
  - Straßennamen ganz weg aus der Welt, sie gehören auf die Karte.
  - „F · …“-Hinweise nur in der Interaktionspille unten, die es schon gibt („MIT MARA REDEN“).
  - Die Wegmarken-Distanz als kleiner Pfeil am Bildrand (18 px, Zahl 12 px) statt 22-px-Text in Bildmitte.
- **Ursache:** Weltlabel-Zeichnung in `renderer.js`/`world-prop-ui.js`/`profession-art.js` (Stationen), Wegmarke `renderer.js`.
- **Aufwand:** M.

### 5. Leisten-Stapel: eine Platte mit neun leeren Plätzen und zwei Textschilder
- **Ort:** Über der Hauptleiste. Screenshots: `_review/crops/aktionsflaeche.jpg`, `_review/crops/aktionsflaeche-kampf.jpg`.
- **Problem:**
  - Mit einem einzigen belegten Platz (Currywurst, „⇧1“) steht die zweite Leiste mit 537×69 px und neun leeren Lederplätzen da, das ist die größte leere Fläche im HUD.
  - Die Haltungsleiste darüber trägt das Textbadge „LEER“ auf dem Ausweich-Icon und die Lasche „AUTOANGRIFF AUS.“/„AN.“.
  - Der Stapel ist zusammen 194 px hoch und verkürzt über `floor()` die Aufträge (Befund 1).
- **Vorschlag:**
  - Die zweite Leiste zeigt nur belegte Plätze und schrumpft auf deren Breite (1 Platz = 52 px). Leere Plätze nur beim Ziehen oder bei offenem Kniffe-Fenster.
  - Haltungs-Slots (Ausweichen, Unterbrechen, Autoangriff) als 36-px-Slots **links neben** der Hauptleiste statt darüber, wie die WoW-Haltungsleiste links über Slot 1, aber in derselben Zeile. Dann spart der Stapel 52 px Höhe.
  - Autoangriff wird ein Schwert-Slot mit pulsierendem Goldrand, wenn er an ist. Kein Text.
  - Tastenkappe „Leer“ als Symbol „␣“ in der Kappenecke, wie die anderen Tasten.
- **Ursache:** `bierdeckel.css:907` (`.extra-bar .skill.empty-slot{opacity:.32}`), `action-bar-ui.js` (Haltungsablage), `popup-windows.js:81` (Boden aus `.action-area`).
- **Aufwand:** S–M.

### 6. Kniffe-Fenster (P): unverändert aus R1
- **Ort:** Kniffe. Screenshot: `_review/crops/kniffe.jpg`, `_review/shots/60-fenster-p.jpg`.
- **Problem:**
  - Jede Kachel hat einen äußeren Kartenrahmen mit Messingecken und darin einen inneren Rahmen, die Ecken sind um 3–4 px versetzt.
  - Runde Tasten-Badges („1“, „LEER“, „+“) sitzen mittig oben auf dem Motiv. Gesperrte Kacheln tragen Stern plus Stern-Badge.
  - Die Reihenfolge folgt weder der Tastenbelegung noch der Stufe: 1, 2, Leer, 6, 7, 8 / Q, 5, +, 9, 4, 3.
  - Die Überschrift „EIGENARTEN & LEISTEN“ ist Text, darunter liegen 80 px leerer Leder-Boden. Der Zurücksetzen-Knopf (↻) steht allein in einer siebten Spalte.
- **Vorschlag:** Zielbild 3 unten.
- **Ursache:** `bierdeckel.css:912` (`.icon-skillbook .book-skill canvas{border:2px solid #b8955a}`) zusätzlich zu den Kartenregeln `bierdeckel.css:167/209/451`; `einzelfenster.css:81`; Sortierung im Kniffbuch-Renderer (`progression-ui`/`window-compact.js`).
- **Aufwand:** M.

### 7. Tooltips: der Gegenstand ist 610 px hoch, alle liegen auf ihrem Auslöser
- **Ort:** Rucksack, Aktionsleiste, Minikarte, Figur. Screenshots: `_review/shots/11-tip-gegenstand-vergleich.jpg`, `_review/shots/10-tip-kniff-leiste.jpg`, `visual-review/minimap/06-tooltip-zoom.jpg`, `_review/shots/14-tip-figur-slot.jpg`.
- **Problem:**
  - Der Gegenstands-Tooltip misst gemessen 286×**610** px (Jacke: 286×362). Der Name bricht in Versal-Pixelschrift um („ANNIS HYGIENE-/HOCHDRUCKSPRAY“). Der Vergleich besteht aus sechs Pillen-Chips plus einem Satz. Der Tooltip deckt die Menüleiste und die Verfolgung ab.
  - Der Kniff-Tooltip liegt über den Plätzen 4–9 der Leiste, über der die Maus steht. Der Minikarten-Tooltip liegt über der linken Scheibenhälfte.
  - Der Slot-Tooltip der Figur („Kopf: Platz frei“) enthält drei Zeilen Bedienungsanleitung („Zieh ein passendes Teil … oder klick es dort doppelt an.“) und verdeckt die Puppe.
- **Vorschlag:**
  - **Gegenstand:** Name in Seltenheitsfarbe, gemischte Schreibung, Nunito 800 mit 15 px, einzeilig, bei Bedarf mit Ellipse. Der Vergleich kommt als zweiter Tooltip links daneben mit Kopf „Angelegt“ (WoW `ShoppingTooltip`). Im Haupt-Tooltip bleiben höchstens drei Deltazeilen, grün oder rot. Zielhöhe ≤ 360 px.
  - **Anker:** HUD-Tooltips an einem festen Anker rechts unten über der Menüleiste: `right:16px; bottom:76px`, wächst nach oben.
  - **Minikarte:** Tooltip unterhalb der Scheibe (`top: disc.bottom+8`).
  - **Figur-Slot:** Tooltip nur „Kopf“, ohne Anleitung.
- **Ursache:** `rpg-ui.js` (Tooltip-HTML, `VERDICT`, Vergleichsblock), `popup-ui.css:16` (`.item-tooltip{width:286px;max-height:…;overflow:auto}`), `.mm-tip` in `minimap.css`, `rpg-ui.js:43` (`gearCell`-Tooltip).
- **Aufwand:** M.

### 8. Gespräch: drei Pergamentkarten, leere Titelzeile, der Inhalt scrollt
- **Ort:** NPC-Gespräch. Screenshots: `_review/crops/gespraech.jpg`, `_review/shots/30-gespraech-auftraggeber.jpg`, `_review/shots/32-gespraech-ida.jpg`.
- **Problem:**
  - Gemessen 973/542.
  - Titelzeile 36 px, leer bis auf Symbol und ×.
  - Die Kopfkarte ist 230 px hoch für Porträt, Name und Rolle.
  - Es folgen ein Prosa-Absatz, eine Zitatkarte, eine Zielzeile mit Kleingedrucktem („fällt bei etwa 55 % der Treffer, nur solange der Auftrag läuft“) und die Belohnung als Textkarte („130 Erfahrung · 6 Pfandmarken / Startreihe“).
  - Bei Ida stehen sechs Zeilen Prosa über einem Knopf.
- **Vorschlag nach WoW-QuestFrame:**
  - Porträt 40 px und Name in die Titelzeile, die Kopfkarte entfällt. Das spart ≈ 230 px.
  - Ein Absatz Auftragstext, höchstens 3 Zeilen; das Zitat ist dieser Absatz.
  - Ziel als Häkchenzeile. Die Dropchance als ⓘ-Tooltip am Zähler.
  - Belohnung als Slot-Reihe: 36-px-Kacheln für EP, Pfand und Gegenstand, Zahl in der Kachelecke.
  - Unten rechts „Annehmen“ (Gold), links „Später“.
  - Weitere Aufträge des NPC als Gossip-Zeilen (22 px, Symbol ! oder ?).
  - Gespräch auf x=12/y=183 wie die Figur.
- **Ursache:** `dialogue-ui.js`, `wow-feinschliff.css:24`, `bierdeckel.css:167` (Pergament), `popup-windows.js:58` (`dock.x=hud.left`, `y=hud.bottom+10`).
- **Aufwand:** M.

### 9. Fensterraster: fünf Oberkanten, drei Unterkanten
- **Ort:** Alle Fenster. Screenshots: `_review/shots/61-vier-fenster.jpg`, `_review/shots/62-figur-talente.jpg`, `_review/shots/63-spielmenue.jpg`, `_review/shots/60-fenster-h.jpg`.
- **Problem:**
  - Oberkanten: 183 (Seitenfenster), 185 (Gespräch), 150 (Spielmenü), 21 (Talente), 12 (Hilfe).
  - Unterkanten der Seitenfenster: 800, 667, 629.
  - WoW richtet alle `UIPanelWindows` an einer Oberkante aus; nur das Spielmenü steht frei mittig.
- **Vorschlag:**
  - Eine Oberkante y=183 für **alle** Fenster außer Spielmenü und Karte. Talente (625 hoch) passen mit 183+625=808 nicht über die Leiste. Deshalb Talente auf 560 px Höhe verdichten (ohne Suchzeile und Spec-Karten, siehe Talente-Hinweis unten) und in der Mitte oberhalb der Aktionsfläche platzieren: 183–665 = 482 px verfügbar. Alternativ Talente als einziges „großes“ Fenster ab y=21 belassen, dann aber bewusst mit der Figur-Oberkante des Einheitenrahmens (y=14).
  - Rucksack und Kniffe enden auf der Unterkante der Aufträge (667), sodass rechts und Mitte eine Linie bilden. Beide gewinnen dadurch 38 px für eine fünfte Slotreihe.
- **Ursache:** `popup-windows.js:58` (Gespräch), `:81` (Boden), `:95` (Mitte ab `EDGE`).
- **Aufwand:** S–M.

### 10. Einheitenrahmen und Kampf: Textschilder statt Symbole
- **Ort:** Links oben, Zielrahmen, Bildmitte im Kampf. Screenshots: `_review/crops/links-oben.jpg`, `_review/crops/zielrahmen.jpg`, `_review/crops/fehlertext-kampf.jpg`, `_review/shots/50-hud-kampf.jpg`.
- **Problem:**
  - Die Pillen „PTC Mertloch ⚙ dev“ und „Kampfstatistik (V)“ liegen weiter über dem Spielerrahmen.
  - Der Status „AUF ERKUNDUNG/IM KAMPF“ ist **Nunito 8 px** Versalien (gemessen).
  - Der Zielrahmen hat vier Textzeilen: „ELITE · ST. 4“, Pille „ELITE · ALPHAKEILER“, „IM KAMPF · VERFOLGT DICH … 4 m“ und die Zauberleiste „HAUERHIEB · PARADE“. Ein Porträt fehlt, „Elite“ steht doppelt.
  - Die Fehlermeldung „Dosenmut muss noch verschnaufen · 2.2 s“ liegt auf derselben Höhe wie der aufsteigende Kampftext „79“ und das Label „Kronkorken-Kelle“; die drei Texte überdecken sich.
- **Vorschlag:**
  - Die Pillen werden zwei 32-px-Symbolknöpfe (Zahnrad, Balkendiagramm) mit Tooltip. Die Kampfstatistik gehört als achter Knopf in die Menüleiste.
  - Status als gekreuzte Schwerter (14 px) am Porträtring, nur im Kampf.
  - Zielrahmen spiegelbildlich zum Spielerrahmen: Porträt 56 px mit Elite-Drachenrand (Gold) statt Text. Die Stufe steht im Ring. „Verfolgt dich“ als Symbol (Augen, 14 px), Distanz nur im Tooltip. Zauberleiste ohne Versalien.
  - Fehlertext wie WoW-`UIErrorsFrame` auf eine feste Zeile bei `top:14vh`, rot, 16 px. Der Kampftext steigt über dem Ziel auf und endet vor dieser Zeile.
- **Ursache:** `unit-frame.js`, `target-ui.js`, `#combatState` (`bierdeckel.css:509`), `.world-menu-brand`/`#meterToggle` (`meter.css`), Toast-Anzeige in `engine.js:154`/`app.js`.
- **Aufwand:** M.

### 11. Handy: jedes Fenster scrollt, Spielerrahmen quer kaputt
- **Ort:** Touch, quer 844×390 und hoch 390×844. Screenshots: `_review/shots/72-handy-quer-quest.jpg`, `_review/shots/71-handy-quer-menue.jpg`, `_review/shots/70-handy-hoch-hud.jpg`, `_review/shots/72-handy-hoch-guide.jpg`.
- **Problem:**
  - Gemessen quer: Aufträge 1439/286, Hilfe 1521/286, Figur 653/286, Menü 511/286, Rucksack 507/286, Kniffe 470/286, Gespräch 319/286.
  - Gemessen hoch: Hilfe 1866/411, Aufträge 1463/411, Menü 665/411, Figur 652/411, Rucksack 507/411, Kniffe 470/411.
  - Quer mit offenem Fenster schrumpft der Spielerrahmen zu „GRAFIK PR…“, die HP „1.095 / 1.095“ brechen zweizeilig um und werden abgeschnitten, die Randale-Leiste zeigt nur noch „Randale ·“.
  - Hochkant: Die Wegmarke steht als „0/4 **65 M**“ (siehe Quick Wins). Das Banner „NEUER KNIFF!“ ist 560×80 px groß, zwei Chatzeilen liegen über der Weltwegmarke „65 m“.
- **Vorschlag:**
  - Handy-Fenster ohne doppelte Reiter: ein Symbolreiter unten, 44 px (Touch-Maß).
  - Aufträge am Handy als reine Titelliste mit Detail auf Tippen, ersetzt die Liste.
  - Spielmenü quer als 4×2-Raster ohne Textknöpfe darunter; Berufe, Fahrzeuge und Söldner als drei weitere Kacheln.
  - Spielerrahmen: HP-Text `white-space:nowrap`, nur „1.095“ ohne Maximum, wenn schmal.
  - „Neuer Kniff!“ als 44-px-Symbol mit Punkt am Menü statt Banner.
- **Ursache:** `mobile-polish.css`, `mobile.css:30`, `mobile-controls.js:52`, `touchPopupBounds` in `popup-windows.js:104`.
- **Aufwand:** M–L.

### 12. Weltkarte (M): Buchstaben, Dauerbeschriftungen, doppelte Nummern
- **Ort:** Karte. Screenshots: `_review/shots/60-fenster-m.jpg`, `_review/crops/karte-liste.jpg`, `_review/crops/karte-legende.jpg`.
- **Problem:**
  - Marker sind Buchstaben (W, K) und Zahlen. Am Standort klumpen vier Marker.
  - Jede Auftragsstelle hat ein Dauer-Namensschild („Kegelbrüder aus Kalt vom Festplatz kegeln“).
  - Die Nummern kollidieren: Die Liste nummeriert Treffpunkte 1–3 **und** Lager 1–7 neu, „1“ steht dreimal. Die Karte nummeriert Lager 1–11 mit anderen Werten.
  - Die Legende ist eine Textzeile. „ZU MIR/ÜBERSICHT“ sind Textknöpfe neben Symbolknöpfen.
  - Die Ortsliste scrollt, gemessen 1384/753.
- **Vorschlag:**
  - Die Minikarten-Symbole übernehmen (!, ?, Hammer, Blatt, Lagerzelt, Krone für Elite).
  - Namen nur beim Überfahren. Dichte Marker bündeln (Zahlenbadge, Tooltip listet).
  - Die Liste einzeilig, 28 px je Zeile: Symbol, Name, Distanz. Der Zustand („Besetztes Lager“) wird Farbe oder Symbol statt Zweitzeile. Das sind 16 Zeilen × 28 = 448 px, kein Scrollen.
  - Legende weg, die Filter-Symbolleiste oben links gibt es schon.
  - „Zu mir“ als Fadenkreuz, „Übersicht“ als Rahmen-Symbol, je 32 px.
- **Ursache:** `atlas-ui.js:5` (Legende, Textknöpfe, Fußzeile), `cartography.js` (Marker), `einzelfenster.css` (`.atlas-sidebar{overflow:auto}`).
- **Aufwand:** M.

**Weitere, kleiner:**
- **Talente:**
  - Die drei Spec-Karten tragen Text (Name, Rolle, „0“), dazu „10 frei · ★ Hauptbaum wählen · Suchen … · ↺“ und drei Teilbaum-Reiter in Nunito gemischt, also drei Zeilen Chrome vor dem Baum. Das Detail ist eine Pergamentkarte.
  - Die untere Baumhälfte ist rechts leer.
  - Vorschlag: Spec-Wappen (40 px) in die Titelzeile, Rolle im Tooltip, Suche weg, Teilbaum-Reiter als Symbole unten. `talent-ui.js`/`talent-ui.css`. Scrollt nicht mehr (573/556 aus R1 behoben).
- **Spielmenü:** 320×605 mit neun Knöpfen zu 44 px und 8-px-Trennern. WoW: 190 px breit, Knöpfe 22–26 px hoch. Ziel 220×360. Berufe, Fahrzeuge und Söldner sind Fenster ohne Menüleisten-Knopf; sie gehören als drei weitere Symbole in die Menüleiste (dann 10 × 46 = 490 px, passt rechts unten). Screenshot `_review/crops/spielmenue.jpg`.
- **Verfolgung:**
  - Die Titel mischen drei Schriftgrade: der erste Auftrag Jersey 19 px, die anderen eine kleine Pixelschrift, die Schritte Nunito.
  - Zwei Schritte brechen um („Pfandkeiler von den Trümmern / jagen“).
  - Vorschlag: alle Titel Jersey 16 px Gold, verfolgter Titel heller. Schritte einzeilig mit Ellipse, voller Text im Tooltip. `_review/crops/verfolgung.jpg`.
- **Figur:**
  - Die Zeile „Stufe 12 · Tresenbrecher · noch kein Hauptbaum“ ist Fließtext; sie gehört in den Tooltip des Titels.
  - Der Textknopf „CLANKISTE: WAFFEN ZUM AUSPROBIEREN“ (400×36) sollte ein 36-px-Truhensymbol neben Drehen/Wechseln werden.
- **Chat-Reiter** „Alles · Chat · Ereignisse · Beute“ schweben mit ≈ 20 % Deckkraft 180 px über den Chatzeilen (`_review/crops/chat-geist.jpg`). Das ist WoW-typisch, sieht mitten im Gras aber wie ein Renderfehler aus. Reiter direkt über die letzte Chatzeile setzen.

---

## Drei Zielbilder

### Zielbild 1: Aufträge als WoW-Questlog in 420×484 (passt in den heutigen Platz)
Oben die Liste, unten das Detail: das Classic-Questlog-Muster, das in eine schmale Spalte passt. Es gibt keine Pergamentkarten mehr, alles steht auf dem Fensterleder, die Liste mit Trennlinien.

```
x=460                                                           x=880
┌──────────────────────────────────────────────────────────────┐ y=183
│[Rolle] AUFTRÄGE         [Aktiv][Dorf][Erledigt]    (J)  [×]  │ 36  Titel; 3 Symbolschalter 24 px
├──────────────────────────────────────────────────────────────┤
│ ▾ Filmriss                                                    │ 20  Kapitel, Jersey 14 Gold
│   [!] Der übliche Verdächtige               0/3    180 m      │ 22  Zeile: Symbol 14, Nunito 13
│ ▾ Im Dorf                                                     │ 20
│   [◆] Dachse im Leergut                     0/4     65 m      │ 22  gewählt: Goldrand links 3 px
│   [Kal] Kabelsalat                          0/5     60 m      │ 22  Kal = Kalender-Symbol (Daily)
│   … bis 8 Zeilen                                              │     Liste max. 176 px, sonst Seite ›
├────────────────────────────────────── Trennlinie Messing 1 px ┤
│ DACHSE IM LEERGUT              [Auge][Karte][Buch]            │ 24  Verfolgen / Auf Karte / Lesen
│ ☐ 4 × Pfanddachs besiegen                          0/4        │ 18  je Schritt, einzeilig
│ ☐ …                                                           │     max. 3 Schritte = 54
│ [EP 110][Pfand 6][Slot][Slot]  ← 36-px-Kacheln, Zahl unten rechts │ 40  Belohnung als Icons
├──────────────────────────────────────────────────────────────┤
│  [Rolle Aufträge]  [Haus Bude]  [Bild Erinnerungen]           │ 32  Symbolreiter unten, Name im Tooltip
└──────────────────────────────────────────────────────────────┘ y≈667
Summe: 36 + 176 + 8 + 24 + 54 + 8 + 40 + 32 = 378 px  (Luft: 106 px)
```
- Die obere Reiterzeile „Aufträge/Bude/Erinnerungen“ wird zum Symbolreiter unten; der Reiter, der wie das Fenster heißt, bleibt als erstes Symbol. „Aktiv/Im Dorf/Erledigt“ werden drei 24-px-Schalter in der Titelzeile (Schriftrolle, Haus, Haken).
- Der Beschreibungstext des Auftrags (Lore) steht nur hinter [Buch] als eigene Seite im selben Fenster („Zurück“-Pfeil in der Titelzeile) oder im Tooltip des Titels.
- Klick auf eine Zeile wählt sie aus, Doppelklick verfolgt, wie die Verfolgung. Der Hofprobe-Auftrag nutzt dieselbe Liste mit Haken.
- Handy: dieselbe Liste; ein Tippen tauscht die Liste gegen das Detail (Zurück-Pfeil).

### Zielbild 2: Hilfe als Tastenkappen-Raster (560×300, statt 620×1896 Inhalt)
Die Hilfe zeigt Tasten und Symbole, keinen Satz. Die Erklärung steht im Tooltip jeder Kappe (ein Satz, wie heute die Stichpunkte).

```
┌────────────────────────────────────────────────────────────────────┐
│[?] HILFE                       [Tastatur][Kniffe][Film]   (H) [×]  │ 36  Reiter als Symbole; Einstellungen raus
├────────────────────────────────────────────────────────────────────┤
│ [Füße]  [W][A][S][D]   [Maus-R]→[Pfad]   [Tab]→[Ziel]  [F]→[Hand]   │ 44  Kappen 32×32, Symbol 24 daneben
│ [Schwert] [1]…[0]→[Kniff]  [Leer]→[Ausweichen]  [Q]→[Hand]  [Esc]→[×Schwert] │ 44
│ [Fenster] [C][J][N][M][P][I][H][V]  ← je Kappe + Mini-Icon des Fensters│ 44
│ [Beutel]  [Shift]→[Lupe]  [Ziehen]→[Leiste]  [Doppelklick]→[Anlegen]  │ 44
│ [Maus]    [Shift+Klick Minikarte]→[Fahne]  [Klick Verfolgung]→[Pfad] │ 44
└────────────────────────────────────────────────────────────────────┘
Summe: 36 + 5 × 44 + 2 × 12 Rand = 280–300 px
```
- Kappe: 32×32, Leder `#1d2f27`, 1-px-Messingrand, Buchstabe Jersey 16, Schatten unten 2 px (wie eine echte Taste). Pfeil „→“ 12 px Messing, Ziel-Symbol 24 px aus der vorhandenen Icon-Registry (`ui-art.js`/Lucide-Stil).
- Tooltip je Kappe: Titel („Ausweichen“) plus höchstens ein Satz. Fachwörter (Abklingzeit, Beute) behalten ihr Glossar im Tooltip.
- Reiter „Kniffe“: dieselbe Rasterlogik, aber für Mechaniken (Symbol für Abklingzeit, In Fahrt, Randale, Deckung) mit Tooltip.
- „Einführungsfilm“ wird ein Reitersymbol (Filmstreifen) statt eines Zeilenknopfs. „Einstellungen“ bleibt nur im Spielmenü.
- Handy: dieselben Kappen, aber Touch-Symbole (Joystick, Ziel, Aktion), 44-px-Kappen, 3 Zeilen.

### Zielbild 3: Kniffe-Fenster wie das WoW-Zauberbuch (400×446, gleiche Slot-Optik wie die Leiste)
```
x=898                                                  x=1298
┌──────────────────────────────────────────────────────┐ y=183
│[Kelle] KNIFFE      [Kniffe][Eigenarten]  [↻]   (P) [×] │ 36  Reiter als Symbole, ↻ in die Titelzeile
├──────────────────────────────────────────────────────┤
│  [1 ][2 ][3 ][4 ][5 ][6 ][7 ]                         │ 50  Slot 44×44, Abstand 6, 7 Spalten = 344 px
│  [8 ][9 ][0 ][Q ][␣ ][  ][  ]                         │ 50  sortiert nach Taste, dann ungebunden
│  [  ][  ][Sl][Sl][Sl]                                 │ 50  Sl = gesperrt: entsättigt, Schloss 12 px u. r.
│                                                       │
│  ── [Blatt] ───────────────────────────────── (Linie) │ 16  Trenner mit Symbol, Tooltip „Eigenarten“
│  [P1][P2][P3][P4][P5][P6][P7]                          │ 50  passive Eigenarten, gleiche Slots
│  [P8]                                                  │ 50
│                                                       │
│  [In-Fahrt-Anzeige] [Randale 100] [Spec-Wappen]        │ 36  Fußzeile als Symbole mit Tooltip
└──────────────────────────────────────────────────────┘ y≈629 (Ziel: 667, siehe Befund 9)
Summe: 36 + 3 × 50 + 16 + 2 × 50 + 36 + 2 × 12 Rand ≈ 362 px
```
- **Eine Slot-Optik** für Leiste, Kniffe und Rucksack: 44 px, 2-px-Messingrand `#b8955a`, Radius 6, **kein** äußerer Kartenrahmen, keine Eckbeschläge je Kachel. Die Beschläge gehören nur an die Fensterecken.
- **Tastenlabel** oben rechts, identisch zur Aktionsleiste (Nunito 800, 12 px, weiß mit 1-px-Umriss `#0b1216`). Kein rundes Badge auf dem Motiv. „Leer“ als „␣“, ungebunden ohne Label.
- **Gesperrt:** `filter:grayscale(1) brightness(.55)`, Schloss 12 px unten rechts, Tooltip „ab Stufe N“. Kein Stern.
- **Neu gelernt:** 2 Sekunden Goldglanz am Rand statt „+“-Badge.
- Eigenarten als eigener Reiter (WoW: Reiter am Buchrand) erst ab mehr als 21 Kniffen. Bis dahin stehen beide auf einer Seite, und das Fenster behält die feste Unterkante aus Befund 9 statt zu schrumpfen.

---

## Quick Wins (je Minuten)
1. `engine.js:154`: `toFixed(1)` → `fmtNumber(…,1)` aus `number-format.js`, dann steht im Abklingzeit-Toast „2,2 s“.
2. `mobile-controls.js:52`: die Wegmarke nicht per `textContent` flach kopieren, sondern die Kinder klonen (mit `<em>`), oder `#touchWaypoint` in `wow-feinschliff.css:13` aufnehmen und die Distanz in ein `<em>` setzen. Dann steht „65 m“ statt „65 M“.
3. `wow-feinschliff.css:24`: Statt `visibility:hidden` den Namen samt 32-px-Porträt in die Titelzeile setzen und die Kopfkarte streichen. Gewinn ≈ 230 px im Gespräch.
4. `popup-windows.js:58`: Gespräch auf `x=EDGE`, `y` wie die Seitenfenster (12/183 statt 24/185).
5. `popup-windows.js:81`: Der Boden rechnet mit den **sichtbaren** Leisten (`.action-bar:not(.extra-bar)`, `.extra-bar` nur wenn belegt), nicht mit der ganzen `.action-area`. Die Aufträge gewinnen ohne belegte zweite Leiste ≈ 70 px.
6. Status „AUF ERKUNDUNG“ (Nunito 8 px) streichen; „IM KAMPF“ als Schwert-Symbol 14 px.
7. Slot-Tooltip der Figur (`rpg-ui.js:43`): nur den Slotnamen, keine Anleitung.
8. Chat/Toast „Neuer Auftrag: Daily: …“: denselben Filter wie der Tracker anwenden (Kalender-Symbol statt „Daily:“).
9. `.region-label` Unterzeile `#zoneType`: Nunito 800 mit 15 px statt Jersey 12 px (`bierdeckel.css:772`).
10. Kniffe: Den Zurücksetzen-Knopf ↻ in die Titelzeile, die Überschrift „Eigenarten & Leisten“ durch eine Trennlinie mit Symbol ersetzen (`window-compact.js`).
11. Figur: „Stufe 12 · Tresenbrecher · noch kein Hauptbaum“ in den Tooltip des Titels (`window-compact.js:14` hat das `data-sub` schon).
12. Prüfskript `optimierung-r1-check.mjs` → `zoom('.game-menu-rail')` mit 8 px Rand schneidet den ersten Knopf ab; Rand auf 16 setzen, sonst sieht der Beleg kaputt aus.

## Was bleiben soll
- **Menüleiste rechts unten:** 7 gleich große gemalte Symbole mit Tastenkappe, Schloss und Badge. Genau WoW-Micromenü, nur schöner.
- **Minikarte:** Messingring mit Laub, Rundknöpfe auf dem Ring, Uhrzeit-Pille, Ortsschild nur beim Betreten und Überfahren. Das stärkste Element im HUD.
- **Feste Seitenplätze für C/J/P/I:** Das Grundgerüst stimmt jetzt; es muss nur für alle Fenster gelten (Befund 9).
- **Rucksack-Raster:** Seltenheitsrahmen, grüner Aufwärtspfeil, Stapelzahl unten rechts.
- **Einheitenrahmen:** Porträtring mit Stufenmarke, Leisten mit Nieten, Tausenderpunkte „1.095 / 1.095“.
- **Nameplate über dem Gegner** im Kampf (Name, Leben, Zauberleiste, Zielring): klar und WoW-nah.
- **Verfolgung:** Kalender-Symbol, Zähler und Distanz in fester Spalte, Tooltip mit Belohnung links daneben.
- **Tastenziffern ohne Box** in der Aktionsleiste, Abklingzahl mit Komma. Die 6 ist jetzt lesbar.
- **Kniff-Tooltip:** kompakt (≈ 300×230), Kategorie-Chips, „Shift: Details“. Nur der Anker muss weg von der Leiste.
- **Talentbaum** mit Rangzählern und Pfeilen; **Spielmenü** als eigenes Fenster mit Gold-„Zurück zum Spiel“.

## Wichtigste Screenshots
- HUD Ruhe: `_review/shots/01-hud-ruhe.jpg` · Kampf: `_review/shots/50-hud-kampf.jpg`
- Fenster einzeln: `_review/shots/60-fenster-{c,j,i,p,n,h,m}.jpg` · vier Fenster: `_review/shots/61-vier-fenster.jpg` · Figur + Talente: `_review/shots/62-figur-talente.jpg` · Spielmenü: `_review/shots/63-spielmenue.jpg`
- Tooltips: `_review/shots/11-tip-gegenstand-vergleich.jpg`, `_review/shots/10-tip-kniff-leiste.jpg`, `_review/shots/13-tip-auftrag.jpg`, `_review/shots/14-tip-figur-slot.jpg`, `visual-review/minimap/06-tooltip-zoom.jpg`
- Gespräch: `_review/shots/30-gespraech-auftraggeber.jpg`, `_review/shots/32-gespraech-ida.jpg`
- Gebietswechsel: `visual-review/optimierung-r1/r1-31-gebietswechsel-ortsschild.jpg`, `visual-review/optimierung-r1/r1-31z-zonentitel.jpg`, `_review/shots/40-zonenwechsel-1.jpg`
- Handy: `_review/shots/70-handy-{quer,hoch}-hud.jpg`, `_review/shots/72-handy-quer-quest.jpg`, `_review/shots/71-handy-quer-menue.jpg`, `_review/shots/72-handy-hoch-guide.jpg`
- Ausschnitte: `_review/crops/{aktionsflaeche,kniffe,gespraech,zielrahmen,fehlertext-kampf,verfolgung,links-oben,zonentitel-pfandhof,menueleiste,karte-liste,spielmenue}.jpg`
