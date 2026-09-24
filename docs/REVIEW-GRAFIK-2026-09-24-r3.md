# Grafik-/UI-Review R3: Mertloch Chronicles (origin/main 7bc7540, Build #457, 2026-09-24)

Worktree `D:\Dev\MertlochChronicles-review-r3`, nur lesend, nichts committet. Alle Pfade sind relativ zum Worktree.

**Gelaufen:**
- `optimierung-r2a-check` (CDP 9460/Server 4260): 13 grün.
- `optimierung-r1-check` (9462/4264): 16 grün.
- `einzelfenster-check` (9463/4265): 10 grün.
- `minimap-check` (9464/4266): 13 grün.
- `optimierung-r2b-check` (9461/4262, Proxy 4263): 22 Prüfungen ok. Danach **FAIL** bei „neue Fassung beim Start still übernommen“ (`optimierung-r2b-check.mjs:217`). Das ist PWA-Logik, kein Grafikbefund. Ob die Ursache der geänderte Proxy-Port oder das Timing ist, habe ich nicht geklärt.
- Eigene Szenen: `_review/szenen.mjs` in vier Läufen (9465–9468). Messwerte stehen in `_review/report-*.json`, Bilder in `_review/shots/`, zweifach vergrößerte Ausschnitte in `_review/crops/`.

**Nicht messbar / Einschränkungen:**
- **Beutefenster:** Auto-Loot ist an. Nach dem Kill erschien nur die Chatzeile „Grillgut-Gans besiegt · +30 EP“ und kein Fenster (`33-beute.jpg`). Das Beutefenster ist darum nicht bewertet.
- **Gespräch mit einem zweiten Auftraggeber (Hotspot-Geber):** F öffnete nichts (`51-gespraech-geber.jpg`). Bewertet ist Kisten-Ida mit Auftrag, am Desktop und am Handy.
- **Gossip-Zeilen:** Keine Szene mit zwei offenen Aufträgen eines Gebers, darum nicht gesehen.
- **Esc:** Nicht selbst nachgeklickt. Grün in `r2a-check` Nr. 9 und `einzelfenster-check`.
- **Scrollwerte:** Nur per DOM gemessen (`scrollHeight/clientHeight`), weil die Scrollbalken ausgeblendet sind.

---

## Stand der Runde-2-Punkte

| Punkt | Urteil | Beleg |
|---|---|---|
| **Questlog (J)** | **sauber** | 420×484 bei 460/183, scrollt nicht, keine Pergamentkarten. Titelliste mit Gruppen, Detail mit Häkchen, 36-px-Belohnungskacheln, drei Symbolknöpfe, Symbolreiter unten (`_review/crops/fenster-j.jpg`). Einziger Schönheitsfehler: Mit 3 Aufträgen liegt ein leeres Band von ≈ 140 px zwischen Liste und Detail. Bei mehr Aufträgen füllt es sich, das ist in Ordnung. |
| **Fensterraster** | **mit Mängeln** | Figur, Aufträge, Kniffe, Rucksack und Gespräch haben alle die Kanten y=183…667 (`report-hud_windows.json`: 12/460/898/1306, je 484 hoch). Talente (634/183, 760×423), Hilfe (734/183) und Einstellungen (734/183) sitzen auf derselben Oberkante, das Spielmenü steht frei mittig (904/270). **Mangel 1:** Die feste Höhe von 484 px macht Kniffe und Gespräch halb leer (Befund 2). **Mangel 2:** Der Zonentitel (18vh ≈ 162–220) überschneidet die Fenstertitel ab y=183 (Befund 6). **Mangel 3:** Die Kampfstatistik (V) hat eine eigene Optik und blieb offen, als das Skript alle `[data-window-close]` geklickt hatte (`12-figur-talente.jpg`). |
| **Gespräch** | **mit Mängeln** | Porträt und Name stehen in der Titelzeile, Belohnung als Kacheln, „Annehmen/Später“ stehen unten (`_review/crops/gespraech-ida.jpg`). Aber: Der Text ist auf 3 Zeilen gekappt (`dlg-lines` 325/61), darunter sind **≈ 270 px leer**. Der „…“-Knopf liegt auf dem letzten Wort („in den…“), am Desktop und am Handy (`73-handy-quer-gespraech.jpg`). Die Frage steht als zweizeiliger Versaltitel in Jersey. |
| **Hilfe als Tastenraster** | **mit Mängeln** | 560×296, scrollt nicht, 5 Themenzeilen (`_review/crops/fenster-h.jpg`). Ohne Hover ist das Raster aber kaum zu deuten (Befund 4). Der Tooltip ist tautologisch („Laufen – WASD läuft.“, `_review/crops/hilfe-mit-tip.jpg`) und verdeckt die Nachbarkappen. Zwei Symbolstile sind gemischt: Linien-Icons (Ziel, Stern, Lupe) neben gemalten Icons (Stiefel, Figur, Rucksack). |
| **Kniffe wie Zauberbuch** | **Desktop mit Mängeln, Handy kaputt** | Desktop: Die Slot-Optik ist wie auf der Leiste, Tasten stehen oben rechts, gesperrte Kniffe zeigen ein Schloss, die Sortierung stimmt (`_review/crops/fenster-p.jpg`). Das untere Drittel ist aber leer: Der Inhalt endet bei ≈ y 505 von 667. **Handy: noch das alte Buch.** Textknopf „TOUCHBUTTONS BELEGEN“, Doppelrahmen je Kachel und Chips „Seite 2 · Knopf 2“, die sich gegenseitig überdecken („Kr Seite 2 · Kr“). Scrollt 470/286 (`72-handy-quer-book.jpg`). |
| **Talente** | **Desktop sauber, Handy kaputt** | Desktop 760×423, ohne Suche und Detailspalte, Wappen in der Titelzeile, Pfade unten (`_review/crops/fenster-n.jpg`). Handy: altes Layout mit Spec-Karten („Türsteher / Tank“), „★ Hauptbaum wählen“ und einem Feld „Suchen …“. Scrollt quer 532/270 und hoch 545/487 (`72-handy-quer-talents.jpg`). |
| **Kartenliste** | **sauber (Liste), Karte selbst unverändert** | 23 Orte, einzeilig, das verfolgte Ziel steht oben, kein Scrollen (`_review/crops/karte-seitenleiste.jpg`). Darunter stehen weiter der Textblock „DEIN NÄCHSTER HALT · Dein Auftragsziel · 141 m Luftlinie“ und der Knopf „WEG EINSCHLAGEN →“. Die Marker sind Befund 7. |
| **Esc wie WoW** | **sauber (per Prüfskript)** | `r2a-check` Nr. 9 und `einzelfenster-check`: Ein Esc schließt alle vier Fenster, das nächste Esc öffnet das Spielmenü. |
| **Transparente Fenster über dem Helden** | **mit Mängeln** | Funktioniert gezielt: Beim Auto-Laufen wird nur das Kniffe-Fenster durchsichtig (op 0.3), die anderen drei bleiben voll (`report-autorun_combat_tips.json`). Optisch wirkt es aber wie ein Renderfehler: Slotraster, Titel „KNIFFE“ und Rahmen stehen als Geisterbild über der Welt (`20-autolauf-vier-fenster.jpg`). Der Zonentitel „KIRCHSTRASSE“ liegt dann direkt auf dem Geisterbild (`20b-autolauf-spaeter.jpg`). |
| **Zonentitel** | **sauber ohne Fenster, kollidiert mit Fenstern** | Ohne Fenster steht „CLAN-TREFF“ bei 18 % frei vom Holzschild (`visual-review/optimierung-r2b/r2b-10-clantreff-zonentitel.jpg`), sehr gut. Mit offenen Fenstern liegt er auf den Titelzeilen (Befund 6). |
| **Leisten** | **mit Mängeln** | Die zweite Leiste zeigt nur belegte Plätze, „Leer“ ist eine gezeichnete ␣-Kappe, die Autoangriff-Lasche ist weg. Es bleiben aber **zwei lose Kästchen mit eigenem Rahmen** über der Hauptleiste: die Ablage 754/673 (109×53) mit Eckbeschlägen und der einzelne Platz ⇧1 bei 755/734. Der Stapel ist weiter 194 px hoch (`.action-area` 744/673, 537×194, `_review/crops/aktionsflaeche.jpg`). |
| **HUD links oben** | **mit Mängeln** | 40-px-Symbolknöpfe, gekreuzte Schwerter im Kampf, Zielrahmen mit Porträt, Name und Stufenring. Aber: Die beiden Knöpfe haben zwei Stile (Menü eckig mit Messingbeschlag und gemaltem Icon, Statistik rund mit Linien-Icon, `_review/crops/hud-links-oben.jpg`). Der Zielrahmen trägt Versalien („GRILLGUT-GANS“, „SPRUNG · AUSWEICHEN“), sein Medaillon ragt unten aus dem Rahmen. Die Ansage „Autoangriff an./aus.“ erscheint weiter als sichtbarer Text oben mittig (`30-hud-kampf.jpg`, `31-kampf-mit-fenstern.jpg`). |

---

## Top 12 Befunde (nach Wirkung)

### 1. Das Handy hat noch die alte Oberfläche; sechs Fenster scrollen
- **Ort und Screenshots:** Handy quer und hoch. `_review/shots/72-handy-quer-book.jpg`, `72-handy-quer-talents.jpg`, `72-handy-hoch-person.jpg`, `71-handy-quer-menue.jpg`, `70-handy-hoch-hud.jpg`.
- **Problem:** Runde 2a hat Kniffe, Talente und Figur nur für den Desktop umgebaut. Am Handy stehen die alten Fenster: Kniffbuch mit Doppelrahmen und überlappenden Chips, Talente mit Spec-Karten, Suche und „Hauptbaum wählen“, Figur mit Textreitern „AUSRÜSTUNG/WERTE“ und Riesenpuppe.
  - Gemessen quer: Menü 529/286, Kniffe 470/286, Figur 653/286, Rucksack 507/286, Talente 532/270, Karte 347/270.
  - Gemessen hoch: Menü 665/411, Kniffe 470/411, Figur 652/411, Rucksack 507/411, Talente 545/487, Karte 490/487.
  - **Neu gegenüber der Restliste 2a:** Auch Spielmenü, Talente und Karte scrollen.
  - Dazu kommen:
    - Spielmenü quer: Die Kachelbeschriftungen „AUFTRÄGE“ und „RUCKSACK“ laufen über den Kachelrand, „UI/EINSTELLUNG“ ist unten abgeschnitten.
    - Spielerrahmen quer: „1.095 / 1.095“ bricht um und wird abgeschnitten, die Randale-Leiste zeigt nur „Randale ·“. Das stand schon in R2 und ist unverändert.
    - Handy hoch: Das Banner „NEUER KNIFF!“ ist 560 px breit. Die Chatzeile „Neuer Auftrag: Kabelsalat“ liegt auf der Meldungskarte „Neuer Auftrag: Dachse im Leergut“.
- **Vorschlag:**
  - Die Desktop-Verdichtung auch für Touch einschalten.
  - Kniffe mit 5 Spalten à 52 px (Touch-Maß 44 plus Rand), Belegen per Tippen auf den Slot und dann auf einen Leistenplatz, ohne Textknopf und ohne Chips.
  - Talente mit Wappen in der Titelzeile und Pfaden unten, der Baum im Fenster auf die Höhe skaliert.
  - Figur mit Puppe 50 % kleiner, Werte als Symbolzeile.
  - Menü als 4×2-Raster mit Symbolen, Name nur als Tooltip oder langer Druck. Berufe, Fahrzeuge und Söldner als drei weitere Kacheln statt Textknöpfen.
- **Ursache:** `window-compact.js:61` (`book`: `if(touch)return;`), `:85` (`talents`: `if(!touch)talentsDesktop(b)`), `:14–23` (`person`, jede Verdichtung mit `!touch`). Dazu `mobile.css` und `mobile-polish.css`. Spielmenü: die Kacheln `.game-menu-windows` mit Jersey-Versalien ohne `text-overflow`.
- **Aufwand:** L.

### 2. Die feste Fensterhöhe 484 px macht Kniffe und Gespräch halb leer
- **Ort und Screenshots:** `_review/crops/fenster-p.jpg`, `visual-review/optimierung-r2a/r2a-40z-kniffe.jpg`, `_review/crops/gespraech-ida.jpg`, `_review/shots/50-gespraech-ida-auftrag.jpg`.
- **Problem:**
  - Kniffe: 3 Slotreihen, Trenner und 2 Reihen Eigenarten enden bei ≈ y 505. Darunter liegen ≈ 160 px leeres Leder.
  - Gespräch: Die Regel „höchstens 3 Zeilen“ (`max-height: 3×1.45em`) kappt Idas Text mitten im Satz („Trotzdem lagst du heute Morgen in den…“). Darunter sind **≈ 270 px leer**, dann folgen die Kacheln. Das ist ein Widerspruch: Der Text wird für Platz gekürzt, der nicht fehlt.
  - Am Handy ist das Gespräch inhaltsgroß (287 px) und wirkt deshalb viel besser (`73-handy-quer-gespraech.jpg`).
  - Mein R2-Vorschlag „gemeinsame Unterkante“ war hier zu starr. In WoW teilen Fenster die **Oberkante**, die Höhe folgt dem Inhalt: Beutel, Zauberbuch und Questfenster sind unterschiedlich hoch.
- **Vorschlag:**
  - Oberkante 183 bleibt. Die Höhe folgt dem Inhalt mit `min-height:300px`, die Unterkante 667 bleibt Maximum.
  - Kniffe: 36 + 3×50 + 16 + 2×50 + 24 ≈ **326 px**.
  - Gespräch: den ganzen Auftragstext zeigen (bis 10 Zeilen, 14/1,45 ≈ 200 px), „Mehr“ nur, wenn der Text dann noch nicht passt. Die Frage in Nunito 800, 16 px, gemischte Schreibung statt Jersey-Versal.
  - Das Gespräch wird so ≈ 36 + 50 + 120 + 52 + 56 + 24 ≈ 340 px hoch.
- **Ursache:**
  - Höhe: `popup-windows.js` (Seitenplatz setzt oben und unten fest).
  - Text: `fenster-r2.css:118` (`.dlg-lines{max-height:calc(3 * 1.45em);overflow:hidden}`).
  - „…“-Knopf: `.dlg-more` liegt per Position auf der letzten Zeile.
- **Überschneidung Feinschliff:** Runde 54 (Porträt 128 px) und 55 (Sprechblase) haben dasselbe Fenster angefasst. Die 128 px sind durch 2a überschrieben, die Sprechblase bleibt.
- **Aufwand:** S–M.

### 3. Der Gegenstands-Tooltip ist 286×610 px und liegt auf Rucksack, Verfolgung und Menüleiste
- **Ort und Screenshots:** `_review/shots/41-tip-gegenstand-vergleich.jpg`, `_review/crops/tip-gegenstand.jpg`.
- **Problem:**
  - Gemessen: Megafon 286×**610**, Keilerzahn 286×506, Pfandring 286×410, Dosenklinge 286×397, Jacke 286×362. Unverändert seit R2.
  - Der Name bricht als Jersey-Versal um („ANNIS HYGIENE-/HOCHDRUCKSPRAY“).
  - Abgeleitete Werte stehen im Grundtooltip („Glückstreffer-Chance +1,6 % · Tempo +2 %“).
  - „▲ Verbesserung“ steht in Jersey, darunter „Vergleich“ als eigener Block mit sechs Pillen-Chips und einem Umbruchsatz („+10,5 Ø je Treffer“).
  - Der Tooltip reicht bis y=880 und verdeckt die Menüleiste.
- **Vorschlag:** Zielbild 2.
- **Ursache:** Tooltip-HTML und Vergleichsblock in `rpg-ui.js`. Maße in `popup-ui.css:16` (`.item-tooltip{width:286px;max-height:calc(100dvh - 30px);overflow:auto}`) und `bierdeckel.css:125`.
- **Überschneidung Feinschliff:** Runde 47 (Symbol 36 px im Qualitätsrahmen) bleibt so.
- **Aufwand:** M.

### 4. Hilfe: „kein Text“ ist hier zu weit getrieben
- **Ort und Screenshots:** `visual-review/optimierung-r2a/r2a-30z-hilfe.jpg`, `_review/crops/hilfe-mit-tip.jpg`.
- **Problem:**
  - Die Reihen „[Maus] → Kringel“, „[Hand] → Stern“, „[⇧] → Lupe“, „[Maus] → Sonne“, „[⇧][B] → Hand“ und „[R] → Zielscheibe“ sind ohne Hover nicht zu entschlüsseln. Eine Hilfe, die man erst per Hover erklären muss, verfehlt ihren Zweck.
  - Die Tooltips erklären nichts („WASD läuft.“).
  - **Was WoW macht:** WoW hat keine Piktogramm-Hilfe. Die Tastenbelegung ist eine **Liste „Aktion – Taste“ mit Wörtern**. Tutorial-Hinweise zeigen die Taste plus ein bis drei Wörter („Press [M] to open your map“).
  - Die Nutzervorgabe verbietet Fließtext, keine Einzelwörter. Ein Wort je Kappe ist WoW-konform und macht die Seite ohne Hover lesbar.
- **Vorschlag:** Zielbild 3. Die Hilfe wird zur Tastenbelegungsliste: Kappe + **ein Wort** (Nunito 700, 13 px), drei Spalten, kein Pfeil, kein Zielsymbol. Der Tooltip bringt nur Zusatzwissen (z. B. „Leer: Ausweichen, 2 Ladungen, 8 s Abklingzeit“).
- **Ursache:** `help-keys.js:9–12` (`item()`, `hk-arrow`, `hk-to`), Texte `content/panel-ui.js` → `HELP_GRID`, CSS `fenster-r2.css:158–160`.
- **Aufwand:** S–M.

### 5. Zwei lose Kästchen über der Hauptleiste
- **Ort und Screenshots:** `_review/crops/aktionsflaeche.jpg`, `_review/shots/01-hud-ruhe.jpg`.
- **Problem:**
  - Die Ablage „␣/Q“ (754/673, 109×53) hat eine eigene Lederplatte mit vier Eckbeschlägen.
  - Darunter schwebt der einzelne Platz ⇧1 (755/734, 47×47) mit dunkler Rundplatte.
  - Beide hängen links über Slot 1–2 und lesen sich wie liegengebliebene Teile, nicht wie ein Leistensystem.
  - Der Stapel ist 194 px hoch und begrenzt die Fensterunterkante auf 667.
- **Vorschlag:** Zielbild 1. Die Haltung kommt links **in** den Rahmen der Hauptleiste, abgetrennt durch einen Messingstrich. Die zweite Leiste steht ohne Platte, spaltengenau über der Hauptleiste; belegte Plätze sehen aus wie Hauptleisten-Slots. Der Stapel wird damit **122 statt 194 px** hoch.
- **Ursache:** `ui-chrome.css:324` (`.special-actions` mit `background:#152d23 var(--chrome-material)` und eigener Platte), `ui-chrome.css:328`, `bierdeckel.css:753/869`, `progression-ui.css:3`. Die Rahmenzeichnung der Ablage kommt aus Feinschliff Runde 40.
- **Überschneidung Feinschliff:** Runde 40 („Sonderaktionen und Autoangriff als Ablage an der Leiste“) sowie 2b Nr. 7 und Rest 1. Nicht parallel ändern.
- **Aufwand:** M.

### 6. Der Zonentitel liegt auf den Fenstertiteln
- **Ort und Screenshot:** `_review/shots/20b-autolauf-spaeter.jpg`.
- **Problem:** Der Zonentitel steht bei `top:18vh` (≈ 162–222 px), alle Fenster beginnen bei 183. Beim Gebietswechsel mit offenen Fenstern schreibt „KIRCHSTRASSE / Mertloch · Maifeld“ auf die Titelzeile „KNIFFE“. Ohne Fenster ist der Titel gut.
- **Vorschlag:**
  - Solange ein Seitenfenster offen ist, rückt der Titel in das freie Band über den Fenstern: `top:100px`, Titel 36 px, Unterzeile 14 px, Unterkante ≤ 168.
  - Die Fehlerzeile (heute ≈ 11 % = 99–119) rückt auf `top:64px`.
  - Beide bleiben zwischen Einheitenrahmen und Minikarte, denn die Bildmitte ist über y=183 frei.
- **Ursache:** `spielfluss.css:5` (`body:not(.touch-mode) #gameShell .region-label{top:18vh}`), die Fehlerzeile ist aus 2b Nr. 8. Umsetzbar etwa mit `body:has(.game-popup:not([data-window=menu])) #gameShell .region-label{top:100px}`.
- **Überschneidung Feinschliff:** Runde 66 (`#zoneSplash`, heute per CSS aus, 2b Rest 2).
- **Aufwand:** S.

### 7. Weltkarte: Buchstaben, Nummern, Dauerschilder, Textlegende
- **Ort und Screenshots:** `_review/shots/60-weltkarte.jpg`, `visual-review/optimierung-r2a/r2a-08-karte.jpg`, `_review/crops/karte-seitenleiste.jpg`.
- **Problem:**
  - Die Marker sind Rauten mit Ziffern 1–11 sowie „W“, „K“ und „A“.
  - Jede Auftragsstelle hat ein Dauer-Namensschild in roter Pixelschrift („Kegelbrüder aus Kalt vom Festplatz kegeln“, „Trauzeuge Timo vom Busdach holen“), elf Schilder über der Karte.
  - Unten stehen eine zweizeilige Textlegende („▲ Dein Standort · ! Auftrag · ? Abgabe …“) und die Fußzeile „Norden ist oben · Welt läuft weiter · © OpenStreetMap“.
  - Oben rechts sitzen die Textknöpfe „ZU MIR“ und „ÜBERSICHT“ neben Symbolknöpfen.
  - In der Seitenleiste stehen ein Textblock „Dein nächster Halt“ und der Goldknopf „WEG EINSCHLAGEN →“.
  - Die Seitenliste ist inzwischen gut, die Karte selbst noch nicht.
- **Vorschlag:**
  - Die Minikarten-Symbole übernehmen (!, ?, Hammer, Zelt, Krone).
  - Namen nur beim Überfahren; Marker, die sich näher als 24 px kommen, zu einem Badge mit Zahl bündeln.
  - Legende und Fußzeile weg, die OSM-Nennung als ⓘ-Symbol unten rechts.
  - „Zu mir“ als Fadenkreuz-Symbol, „Übersicht“ als Rahmen-Symbol, je 32 px.
  - Der Block „Nächster Halt“ wird zur hervorgehobenen ersten Listenzeile (die gibt es schon). „Weg einschlagen“ wird ein Stiefel-Symbol in dieser Zeile.
- **Ursache:** `atlas-ui.js` (Legende, Textknöpfe, `#atlasSelection`), `cartography.js` (Marker und Beschriftung), `atlas.css`.
- **Aufwand:** M.

### 8. Tooltips liegen weiter auf ihrem Auslöser; der Figur-Slot erklärt die Bedienung
- **Ort und Screenshots:** `_review/shots/40-tip-kniff-leiste.jpg`, `44-tip-figur-slot.jpg`, `_review/crops/hilfe-mit-tip.jpg`.
- **Problem:**
  - Der Kniff-Tooltip der Leiste (920/632, 286×248) verdeckt die Leistenplätze 3–9.
  - Der Hilfe-Tooltip verdeckt die Nachbarkappen.
  - Der Figur-Slot zeigt weiter „KOPF: PLATZ FREI – Noch nichts angelegt. Zieh ein passendes Teil …“ (R2 Quick Win 7, nicht umgesetzt).
- **Vorschlag:**
  - Tooltips von Leiste, Menüleiste und Verfolgung an den WoW-Standardanker: rechts unten über der Menüleiste (`right:16px; bottom:76px`), wächst nach oben.
  - Fenster-Tooltips seitlich neben das Fenster, nie über dessen Inhalt.
  - Figur-Slot: nur „Kopf“.
- **Ursache:** Platzierung in `popup-controls.js` (Tooltip-Owner und Positionierung), Figur-Slot `rpg-ui.js` (`gearCell`).
- **Aufwand:** M.

### 9. Das „durchsichtige Fenster“ sieht aus wie ein Renderfehler
- **Ort und Screenshots:** `_review/shots/20-autolauf-vier-fenster.jpg`, `20b-autolauf-spaeter.jpg`.
- **Problem:** Bei 30 % Deckkraft bleiben Slotraster, Titel und Rahmen als grauer Schleier über der Welt. Der Held ist zwar zu sehen, aber durch ein Gitter. WoW kennt das nicht.
- **Vorschlag:**
  - Nur der Fensterrahmen bleibt stehen (Titelzeile voll, Körper `visibility:hidden`), das Fenster ist also „eingeklappt“ auf 36 px.
  - Mit der Maus über der Titelzeile klappt es wieder auf.
  - Die Welt ist dann frei, und der Spieler sieht, dass das Fenster noch da ist.
- **Ursache:** `fenster-r2.css:299` (`.game-popup.hero-seethrough{opacity:.3!important}`), `hero-reveal.js`.
- **Überschneidung Feinschliff:** Runden 33, 37 und 53 (heller Umriss) bleiben richtig.
- **Aufwand:** S.

### 10. Einstellungen, Kampfstatistik und Rucksack-Kopf haben drei Knopf- und Fensterstile
- **Ort und Screenshots:** `_review/crops/einstellungen.jpg`, `_review/shots/10-fenster-v.jpg`, `_review/crops/fenster-i.jpg`.
- **Problem:**
  - **Einstellungen:**
    - Eckige Messingknöpfe („KAMPFSTATISTIK“, „UI BEARBEITEN“), eine Platte mit Stepper („Aktionsleisten − 2 +“) und cremegerandete Pillen („STEUERUNG & TOUCHBUTTONS“, „TON AN / AUS“, „VOLLBILD“, „ADMIN · …“).
    - Schalter in Nunito und Knöpfe in Jersey-Versal.
    - „Ton an/aus“ ist ein Knopf, obwohl daneben Schalter stehen.
    - „Kampfstatistik“ und „UI bearbeiten“ stehen doppelt: im Spielmenü und im HUD.
  - **Kampfstatistik (V):** Fenster ohne Messingecken, natives `<select>`, der Satz „Noch kein Schaden verursacht.“ und die Zeile „Noch kein Kampf erfasst.“
  - **Rucksack:** drei Kopfzeilen (Reiter, „Art“-Dropdown plus Sortieren, Münzen und Händler, Suchfeld mit Platzhaltersatz „Name, Art, Güte oder Wert …“), zusammen ≈ 120 px vor dem Raster.
- **Vorschlag:**
  - Einstellungen: nur Zeilen „Symbol · Wort · Schalter“, Leistenzahl als Schalter-Paar, Admin als Zahnrad unten rechts, die Duplikate raus.
  - Kampfstatistik: Fensterrahmen wie alle anderen, Auswahl als Symbolreiter, Leerzustand als Symbol.
  - Rucksack: Suche als Lupe in der Titelzeile (klappt ein Feld über den Reitern auf), „Art“ als Sortier-Symbol, Münzen und Platz unten wie der WoW-Beutel.
- **Ursache:** `window-compact.js` (`settings()`, `bag()`), `meter.css`, `bag-ui.css`.
- **Aufwand:** M.

### 11. Verfolgung: Umbrüche, drei Schriften, Tooltip bleibt nach dem Klick stehen
- **Ort und Screenshots:** `_review/crops/verfolgung.jpg`, `_review/shots/20-autolauf-vier-fenster.jpg`, `20b-autolauf-spaeter.jpg`.
- **Problem:**
  - Schritte brechen um („Pfandkeiler von den Trümmern / jagen“, „5 × Angebissenes LAN-Kabel (von / Pfanddachs)“).
  - Der erste Titel steht in Jersey 19, die anderen in einer kleinen Pixelschrift. Unverändert aus R2.
  - **Neu:** Nach dem Klick auf den Auftragskasten (Auto-Laufen) bleibt dessen Tooltip „DACHSE IM LEERGUT · Belohnung … · Klick: zur Wegmarke laufen“ stehen, obwohl die Maus bei 1000/120 ist. Nach 2,4 s war er noch da.
- **Vorschlag:**
  - Alle Titel Jersey 16 Gold, der verfolgte heller.
  - Schritte einzeilig mit Ellipse, voller Text im Tooltip.
  - Tooltip beim Klick schließen.
- **Ursache:** `quest-tracker.css`. Tooltip: Die Distanz baut die Verfolgung beim Laufen neu auf, dadurch ist der Tooltip-Owner nicht mehr im DOM. Das Schließen in `popup-controls.js:33` (`owner.contains(e.target)`) greift dann nicht mehr. Das ist eine Vermutung aus dem Code, nicht nachgemessen; vgl. die bekannte innerHTML-Falle.
- **Aufwand:** S.

### 12. Links oben und Zielrahmen: Stilbrüche, Versalien, Ansage als Text
- **Ort und Screenshots:** `_review/crops/hud-links-oben.jpg`, `_review/shots/30-hud-kampf.jpg`.
- **Problem:**
  - Die zwei Symbolknöpfe haben zwei Stile.
  - Der Zielrahmen (350/70, ≈ 240×106) mischt Versal-Name, Stufenring, Balken und eine Versal-Zauberleiste. Das Medaillon (∅ 64) ragt über die Unterkante.
  - „Autoangriff an./aus.“ steht als Meldung oben mittig; 2b wollte dafür nur die Ansage für Bildschirmleser.
- **Vorschlag:**
  - Beide Knöpfe als eckige Messingplatte mit gemaltem Icon (wie das Menü).
  - Zielrahmen spiegelbildlich zum Spielerrahmen: Porträt links im Ring innerhalb des Rahmens, Name in gemischter Schreibung (Nunito 800, 14 px), Zauberleiste in Nunito 12 gemischt.
  - „Autoangriff an/aus“ nur als `aria-live`, sichtbar genügt der pulsierende Slot.
- **Ursache:** `unit-frame.js`, `target-ui.js`, `app.js` (Toast bei `startAttack`), `ui-chrome.css` (Zielporträt aus Feinschliff Runde 63).
- **Aufwand:** S–M.

---

## Drei Zielbilder

### Zielbild 1: Aktionsfläche als ein Leistensystem (Befund 5)
```
                 x=695                                                        x=1329
2. Leiste                   [⇧1]                                              y=738–791
(nur belegte     ·    ·     ████    ·     ·     ·     ·     ·     ·     ·      keine Platte, kein Rahmen um die Leiste;
 Slots sichtbar)                                                               Slot 47×47 exakt über der Spalte der Hauptleiste
                ┌──────────╥──────────────────────────────────────────────────┐ y=798
Hauptleiste     │ [␣] [Q]  ║ [1] [2] [3] [4] [5] [6] [7] [8] [9] [0]          │ 69 px
                └──────────╨──────────────────────────────────────────────────┘ y=867
                 2×40 px   Messingstrich 2 px       10 × 47 px, gap 5, pad 6
                 +gap 5    (Trenner wie WoW-Haltungsleiste)
```
- Breite 537 + 40 + 5 + 40 + 12 ≈ **634 px**, mittig (x 695–1329). Bis zur Menüleiste (x 1664) ist Platz.
- Haltungs-Slots 40×40, Tastenkappe ␣ oder Q oben links wie auf der Leiste. Unterbrechen ist entsättigt, solange es nichts zu unterbrechen gibt; so ist es heute schon.
- Die zweite Leiste zeigt **nur belegte** Slots, jeder in derselben Slot-Optik wie die Hauptleiste. Beim Ziehen erscheinen Platte und leere Plätze, wie heute.
- Stapelhöhe 69 + 6 + 47 = **122 px statt 194**. Der Fensterboden (`visibleBars()`) steigt mit belegter zweiter Leiste von 667 auf ≈ 732, ohne sie auf 792.

### Zielbild 2: Gegenstands-Tooltip mit Vergleich daneben (Befund 3, ≤ 300×300)
```
  Vergleich (links daneben, gleiche Oberkante)      Haupt-Tooltip (neben der Rucksack-Zelle, links vom Fenster)
┌─ Angelegt ─────────────────────┐ ┌──────────────────────────────────────┐
│[36] Kabelbinder-Pfandschleuder │ │[36] Annis Hygiene-Hochdruckspray      │ Nunito 800 15 px, Seltenheitsfarbe,
│     Gut · Fernkampf      St. 4 │ │     Selten · Fernkampf · Sprühwerfer  │ gemischte Schreibung, max. 2 Zeilen
│ 14–20 Schaden · 2,0 s          │ │     Gegenstandsstufe 6                │ 12 px, gedimmt
│ 8,5 Schaden/s                  │ │ 21–34 Schaden · 2,0 s                 │ 13 px
│ +3 Taktgefühl                  │ │ 13,8 Schaden/s                        │
│                                │ │ +5 Taktgefühl                         │ je Wert eine Zeile; abgeleitete Werte
│                                │ │ +3 Bastelgrips                        │ (Glückstreffer %, Heilung %) nur mit Shift
│                                │ │ Benötigt Stufe 6                      │ rot, wenn nicht erfüllt
│                                │ │ ───────────────────────────────────── │
│                                │ │ ▲ +5,3 Schaden/s                      │ max. 3 Delta-Zeilen, grün/rot, Symbol ▲▼
│                                │ │ ▲ +2 Taktgefühl                       │ statt Chips und Satz
│                                │ │ ▲ +3 Bastelgrips                      │
│ 240 × ≈170                     │ │ Shift: Details          300 × ≈ 290   │ 11 px, gedimmt
└────────────────────────────────┘ └──────────────────────────────────────┘
```
- Haupt-Tooltip 300 breit, Höhe ≈ 16 + 44 + 18 + 40 + 60 + 20 + 9 + 54 + 20 ≈ **281 px** statt 610.
- **Anker:** Beim Rucksack links neben dem Fenster, Oberkante auf Höhe der Zelle, nie über dem Raster. Der Vergleich steht links daneben (WoW `ShoppingTooltip1`). Liegt der Rucksack links am Rand, dreht sich das Paar nach rechts.
- Der Kopf „Angelegt“ ist ein 11-px-Band gedimmt über dem Vergleich. Der Block „Vergleich“ im Haupt-Tooltip entfällt.
- Mit Shift: Haupt-Tooltip plus abgeleitete Werte (dann ≈ 360 px), wie das heutige „Shift: Details“.

### Zielbild 3: Hilfe als Tastenbelegungsliste mit Wortmarken (Befund 4, 720×≈350)
```
x=652                                                                                       x=1372
┌──────────────────────────────────────────────────────────────────────────────────────────┐ y=183
│[?] HILFE                                       [⌨] [✦] [▶]                    (H)  [×]  │ 36
├──────────────────────────────┬─────────────────────────────┬─────────────────────────────┤
│ (Füße) BEWEGEN               │ (Rahmen) FENSTER            │ (Beutel) BEUTE & LEISTE     │ 24 Themenkopf: Jersey 13 Gold
│ [W][A][S][D]  Laufen         │ [C]   Figur                 │ [⇧]+Maus   Vergleichen      │ 26 je Zeile:
│ [Maus-R]      Hinlaufen      │ [J]   Aufträge              │ [Ziehen]   Auf die Leiste   │    Kappe 26×24, Jersey 14
│ [Maus-L]      Wegmarke       │ [N]   Talente               │ [2× Klick] Anlegen          │    Wort Nunito 700 13 px Creme
│ [F]           Reden / Nehmen │ [M]   Karte                 │ [Klick]    Benutzen         │    kein Pfeil, kein Zielsymbol
│ [X]           Aufsitzen      │ [P]   Kniffe                │                             │
│ (Schwert) KAMPF              │ [I]   Rucksack              │ (Haus) DORF                 │
│ [Tab]         Ziel wählen    │ [V]   Kampfstatistik        │ [B]        Bude             │
│ [1]–[0]       Kniffe         │ [H]   Hilfe                 │ [⇧][B]     Bauen            │
│ [Leer]        Ausweichen     │ [Esc] Menü / Schließen      │ [U]        Söldner          │
│ [Q]           Unterbrechen   │                             │ [R]        Zurück zum Ziel  │
│ [Esc]         Abbrechen      │                             │                             │
└──────────────────────────────┴─────────────────────────────┴─────────────────────────────┘ y≈533
36 + 12 Zeilen × 26 + 2 × 12 Rand ≈ 372 px  (passt zwischen 183 und 667)
```
- Wörter sind Bezeichnungen, keine Sätze; das Fließtextverbot bleibt gewahrt. Das entspricht dem WoW-Menü „Tastaturbelegung“.
- Tooltip je Zeile nur mit **Mehrwert**: Abklingzeit, Ladungen, Bedingung („Leer: 2 Ladungen, 8 s“, „R: läuft zum verfolgten Ziel zurück“). Wo es keinen Mehrwert gibt, gibt es keinen Tooltip.
- Die Wörter stehen in `HELP_GRID` schon als `label` (heute Tooltip-Titel). Sie werden sichtbar, `note` bleibt der Tooltip.
- Handy: dieselbe Liste in 2 Spalten, Touch-Symbole statt Tasten.

---

## Quick Wins (je Minuten bis eine Stunde)
1. `fenster-r2.css:118`: `.dlg-lines{max-height:calc(10 * 1.45em)}`; „Mehr“ nur bei echtem Überlauf. Das Gespräch zeigt den ganzen Text.
2. Kniffe und Gespräch: Höhe nach Inhalt, Oberkante 183 bleibt (`popup-windows.js`, Seitenplatz).
3. `fenster-r2.css:299`: statt `opacity:.3` den Körper ausblenden (`.hero-seethrough .popup-body{visibility:hidden}`), die Titelzeile bleibt.
4. `spielfluss.css:5`: Zonentitel bei offenem Fenster auf `top:100px`, die Fehlerzeile auf 64 px.
5. `rpg-ui.js` (`gearCell`): Tooltip des leeren Slots nur „Kopf“ (offen seit R2).
6. `content/panel-ui.js` `HELP_GRID`: tautologische Notizen streichen („WASD läuft.“); `label` sichtbar neben die Kappe.
7. `quest-tracker.css`: Schritte `white-space:nowrap;overflow:hidden;text-overflow:ellipsis` (offen seit R2).
8. Toast „Autoangriff an./aus.“ nur noch `aria-live`, nicht sichtbar.
9. Statistik-Knopf links oben in dieselbe eckige Messingplatte wie der Menüknopf.
10. Einstellungen: „Kampfstatistik“ und „UI bearbeiten“ entfernen (stehen im Spielmenü bzw. HUD); „Ton“ als Schalter.
11. Karte: Legende und Fußzeile weg, „Zu mir/Übersicht“ als Symbolknöpfe (`atlas-ui.js`).
12. Handy quer: Spielerrahmen `white-space:nowrap` auf den HP-Text, bei Platzmangel nur „1.095“ (offen seit R2).
13. Handy Spielmenü: Kachelbeschriftung raus (Name im Tooltip/Langdruck) oder `font-size:11px;text-overflow:ellipsis`.
14. `.dlg-more`: als eigene Zeile rechts unter den Text setzen, nicht auf das letzte Wort.

## Was bleiben soll
- **Questlog (J):** jetzt das beste Fenster. Genau das Classic-Muster, dicht, ohne Pergament.
- **Talente am Desktop:** Titelzeile mit Punkten, Wappen und Pfaden. Der Baum hat Luft, der Hintergrund bleibt dezent.
- **Figur am Desktop:** Puppe mit Leitlinien zu den Slots, Werte als Symbolraster ohne Beschriftung.
- **Kniffe-Slot-Optik** (eine Slot-Sprache für Leiste und Buch), das Schloss bei Sperre und der Blatt-Trenner.
- **Rucksack-Raster:** Seltenheitsrahmen, grüner Aufwärtspfeil, Stapelzahl unten rechts.
- **Zonentitel ohne Fenster** (40 px Gold, frei vom Holzschild) und die **Welt ohne Ortsnamen** (`r2b-20`).
- **Minikarte, Menüleiste mit Badge, Buff-Symbole mit Restzeit** unter dem Spielerrahmen.
- **Gespräch am Handy:** inhaltsgroß, genau so sollte es am Desktop werden.
- **Spielmenü am Desktop:** 220×364, WoW-GameMenu-Maß, Gold „Zurück zum Spiel“.
- **Gezieltes Durchsichtig-Schalten** nur des Fensters über dem Helden. Die Logik stimmt, nur die Darstellung (Befund 9) nicht.

## Wichtigste Screenshots
- HUD Ruhe: `_review/shots/01-hud-ruhe.jpg`. Kampf: `_review/shots/30-hud-kampf.jpg`, `31-kampf-mit-fenstern.jpg`. Auto-Laufen: `20-autolauf-vier-fenster.jpg`, `20b-autolauf-spaeter.jpg` (Zonentitel auf dem Fenster, Tooltip bleibt stehen).
- Fenster einzeln: `_review/shots/10-fenster-{c,j,i,p,n,h,m,v}.jpg`, Ausschnitte `_review/crops/fenster-{c,j,i,p,n,h,m}.jpg`. Vier Fenster: `11-vier-fenster.jpg`. Figur und Talente: `12-figur-talente.jpg`. Spielmenü und Einstellungen: `13-spielmenue.jpg`, `14-einstellungen.jpg`, `_review/crops/{spielmenue,einstellungen}.jpg`.
- Gespräch: `_review/shots/50-gespraech-ida-auftrag.jpg`, `_review/crops/gespraech-ida.jpg`, `gespraech-ida-mehr.jpg`.
- Tooltips: `_review/shots/41-tip-gegenstand-vergleich.jpg` und `_review/crops/tip-gegenstand.jpg` (610 px), `40-tip-kniff-leiste.jpg`, `42-tip-kniff-buch.jpg`, `43-tip-auftrag.jpg`, `44-tip-figur-slot.jpg`, `46-tip-minikarte.jpg`, `_review/crops/hilfe-mit-tip.jpg`.
- Weltkarte: `_review/shots/60-weltkarte.jpg`, `_review/crops/karte-seitenleiste.jpg`.
- Leisten: `_review/crops/aktionsflaeche.jpg`, `aktionsflaeche-kampf.jpg`. Links oben: `_review/crops/hud-links-oben.jpg`. Verfolgung: `_review/crops/verfolgung.jpg`.
- Handy: `_review/shots/70-handy-{quer,hoch}-hud.jpg`, `71-handy-quer-menue.jpg`, `72-handy-quer-{book,talents,person,bag,map,quest,guide}.jpg`, `72-handy-hoch-*.jpg`, `73-handy-{quer,hoch}-gespraech.jpg`.
- Prüfskript-Bilder: `visual-review/optimierung-r2a/` (u. a. `r2a-40z-kniffe.jpg`, `r2a-30z-hilfe.jpg`, `r2a-20z-gespraech.jpg`, `r2a-10-vier-fenster.jpg`), `visual-review/optimierung-r2b/` (u. a. `r2b-10-clantreff-zonentitel.jpg`, `r2b-30z-leisten.jpg`).
