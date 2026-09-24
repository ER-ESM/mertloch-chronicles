# Optimierung Runde 1 · 24.09.2026

Eingang: Kenner-Playtest `docs/PLAYTEST-2026-09-24-r1-kenner.md` und Grafikbericht `docs/REVIEW-GRAFIK-2026-09-24-r1.md`.
Vorbild WoW; keine Fließtexte, Namen im Tooltip, nirgends scrollen.
Prüfskript: `node scripts/optimierung-r1-check.mjs` (CDP 9472, Server 4272, 16 Prüfungen per Klickpfad).
Screenshots liegen in `visual-review/optimierung-r1/` (lokal, nicht im Repo). `vorher-*` stammt von main dc67630, `r1-*` vom Stand dieser Runde, `*z-*` sind zweifach vergrößerte Ausschnitte.

## Umgesetzt

| Nr | Was | Beleg |
|---|---|---|
| 1 | **Aufträge immer erreichbar.** J und L öffnen die Aufträge auch in der Hofprobe. Dort steht die Hofprobe als Auftrag: acht Schritte als Häkchenliste, der Erklärtext je Schritt im Tooltip. L war nirgends belegt. Die Freischaltung „Aufträge“ entfällt. | `r1-02-hofprobe-auftraege-j.jpg`, Handy: `r1-04-handy-{quer,hoch}-hofprobe-auftraege.jpg` |
| 1 | **Menüleiste mit allen 7 Fenstern**, auch auf dem Handy-Menü. Gesperrte Fenster (derzeit nur Talente vor Stufe 5) sind ausgegraut und tragen ein Schloss. Der Tooltip nennt die Bedingung, etwa „Talente gibt es ab Stufe 5.“ N öffnet die graue Vorschau (Nutzerentscheidung vom 24.09.), die Taste bleibt also nicht stumm. | `r1-01z-menueleiste.jpg`, `r1-03-handy-*-menue.jpg` |
| 2 | **Feste Fensterplätze.** Links Figur am Rand, daneben Aufträge. Rechts Rucksack außen, Kniffe innen. Nichts rutscht nach, wenn ein Fenster schließt. Alle Seitenfenster beginnen auf derselben Oberkante unter dem Spielerrahmen. Rucksack und Kniffe enden vor der Spalte aus Minikarte und Auftragsverfolgung und halten diesen Platz auch dann frei, wenn die Verfolgung kurz leer ist (Kenner-Fall). | vorher `vorher-vier-fenster.jpg`, nachher `r1-10-vier-fenster.jpg`, `r1-11-feste-plaetze-nach-schliessen.jpg`, `r1-12-rucksack-allein.jpg` |
| 2 | **Talente und Hilfe mittig**: bildschirmmittig, wenn dort nichts offen ist, sonst in der Lücke zwischen den offenen Seitenfenstern. | `r1-13-figur-talente.jpg`, `r1-14-figur-hilfe-rucksack.jpg` (vorher `vorher-mit-talente-hilfe.jpg`) |
| 3 | **Menüs und Popups obenauf.** Lupe und Optionen der Minikarte (z 1100), das Kontextmenü (1200) und die Tooltips (100000) liegen über allen Fenstern (40). Die Ordnung steht in `docs/UMSETZUNG-EINZELFENSTER-2026-09-23.md`. | `r1-20-minikarte-optionen-obenauf.jpg` |
| 4 | **Ortsschild und Zonentitel wie in WoW** (`zone-announce.js`). Beim Betreten eines neuen Gebiets blenden der große Titel oben mittig und das Ortsschild der Minikarte ein, stehen etwa 3,6 s und blenden aus. Das Ortsschild erscheint zusätzlich, solange die Maus über der Minikarte liegt. Im HUD-Editor bleiben beide sichtbar. | `r1-30-ruhe-ohne-ortsschild.jpg`, `r1-31-gebietswechsel-ortsschild.jpg`, `r1-32-minikarte-hover-ortsschild.jpg` |
| 5 | **Quick Wins aus dem Grafikbericht:** `lineJoin='round'` im Fundstellen-Label. Zahlen deutsch über `number-format.js` (Kniff-Tooltip „1,4 s“, Abklingzahl „0,6“, Figur „1.095 / 1.095“, Pfandmarken „1.250“, EP-Leiste „1.680“). „m“ nie in Versalien. Das Häkchen „Lebewesen“ ist gestaltet statt eines weißen Quadrats. Drehen/Wechseln stehen mittig unter der Puppe statt auf dem Ausrüstungsplatz. Der Heldenname steht nur noch in der Titelzeile der Figur, der NPC-Name im Gespräch nur in der Kopfkarte. Tastenziffern ohne dunkle Box (weiß mit Umriss, Nunito; die 6 ist lesbar). Das Schild „Buffs“ ist weg. Die Bedienhilfe am Ende der Kniff-Tooltips ist weg, „Shift: Details“ bleibt. Im Tracker steht ein Kalender-Symbol statt „Daily:“, der Zähler „0/5“ sitzt in der Distanzspalte. Über einer Fundstelle erscheint der Name nur im Tooltip, der Leuchtring bleibt. | `r1-40z-kniff-tooltip.jpg`, `r1-41z-aktionsleiste.jpg`, `r1-41z-verfolgung.jpg`, `r1-42z-figur.jpg`, `r1-43z-legende.jpg`, `r1-44-gespraech.jpg` |
| 6 | **Hofprobe 6** passt zum Auto-Loot („Kiste plündern … wandern direkt in deinen Rucksack“). | `content/tutorial.js` |
| 6 | **Ida vor Stufe 5:** Sie sagt, dass die Spielweise ab Stufe 5 in den Talenten gewählt wird. Der Knopf „Spielweise aussuchen“ erscheint erst ab Stufe 5 und führt dann zu den Talenten. | Prüfskript Punkt 1 |
| 6 | **Zweite Leiste**: Leer klappt sie beim Öffnen von Rucksack & Co. nicht mehr auf, nur beim Ziehen. Geprüft: Kein Commit und keine Entscheidung verlangte das Aufklappen ausdrücklich. d352989 und c4fadca haben es als Feinschliff selbst eingeführt. | `r1-50-rucksack-ohne-leiste2.jpg` |
| 6 | **Rechtsklick ins Unerreichbare** (`path-near.js`): Die Figur läuft zum nächsten erreichbaren Punkt, zuerst auf der Linie zum Ziel, dann auf Ringen darum (höchstens 14 Wegsuchen). Geht das nicht, erscheint der Toast „Kein Weg dorthin.“ | Prüfskript Punkt 6 |
| 7 | **Prüfregel gegen Scrollen**: `npm run ui:check` meldet am Desktop 2024×900 jede sichtbare `.popup-body` und jeden scrollenden Innenbereich als Warnung und schreibt `visual-review/ui-regression/scroll-warnings.json`. `SCROLL_STRICT=1` macht die Regel schon jetzt rot. Stand: Aufträge 927/385, Talente 573/556, Karten-Ortsliste 1384/753, Hilfe 1896/556. Rucksack und Kniffe scrollen nicht mehr. | Konsole `ui:check` |

## Bewusst anders umgesetzt

- **Rucksack und Kniffe liegen nicht ganz unten auf der Menüleiste.** Drei Vorgaben passen bei 2024×900 nicht gleichzeitig: dieselbe Oberkante links und rechts, die Minikarten-/Verfolgungsspalte frei lassen und „unten über der Menüleiste“.
  - Die Verfolgung wächst mit bis zu sieben Aufträgen bis y≈550. Ein bündig rechts unten stehender Rucksack (Oberkante ≈363) würde sie überdecken.
  - Der Kniffe-Platz links neben dem Rucksack liegt über den Aktionsleisten und muss darüber enden.
  - Umgesetzt ist deshalb ein fester rechter Block. Er beginnt auf der gemeinsamen Oberkante, endet vor der Verfolgungsspalte und über den Leisten, der Rucksack sitzt außen.
  - Wer den Rucksack wirklich unten angedockt will: In `popup-windows.js` den Rucksack-Platz auf `top = Untergrenze − Höhe` setzen. Das kostet die gemeinsame Oberkante (Zeile „Rechts“ in `layout()`).
- **Talente vor Stufe 5:** N zeigt weiter die ausgegraute Vorschau (Nutzerentscheidung 24.09.) statt eines Toasts. Der Tooltip der Menüleiste nennt die Bedingung. Andere gesperrte Ziele (Berufe, Söldner, Fahrzeuge, Bude) melden sich wie bisher per Toast.
- **Fundstellen-Hover:** Das Weltlabel ist beim Überfahren weg, der Tooltip bleibt. Stationen und Lehrer behalten ihr Weltlabel in der Nähe; sie haben keinen Hover-Tooltip.

## Rest für Runde 2+ (priorisiert aus beiden Berichten)

1. **Nirgends scrollen:** Aufträge als WoW-Questlog (Titelliste links, Detail rechts, Belohnung als Icon-Slots), Hilfe als Tastenkappen-Raster, Gespräch mit einem Auftrag pro Seite, Karten-Ortsliste einzeilig. Danach die Scroll-Regel in `ui:check` scharf schalten.
2. **Aufträge-Fenster zu kurz:** Es liegt über den Aktionsleisten und endet darum bei ≈620 px. Der Questlog-Umbau sollte die Höhe der Figur nutzen oder den Inhalt verdichten.
3. **Doppelte Textreiter** in Aufträgen und Talenten (Grafik 3): Symbolreiter unten, die Suche im Talentfenster fällt weg, Spec-Wappen in die Titelzeile.
4. **Pergamentkarten** aus Aufträgen, Talent-Detail und Gesprächskopf entfernen oder konsequent nutzen (Grafik 2). Leder der Minikarten-Menüs im Maßstab der Fenster.
5. **Kniffe-Fenster**: doppelte Rahmen, verrutschte Ecken, Tasten-Badges auf den Motiven, Schloss statt Stern (Grafik 5). **Kniff-Icons** mit klarer Silhouette (Grafik 4, L).
6. **Gegenstands-Tooltip** ≤ 360 px, Vergleich als zweiter Tooltip daneben (Grafik 7). HUD-Tooltips an einen festen Anker, Minikarten-Tooltip unter die Scheibe (Grafik 8).
7. **HUD-Textschilder**: Pillen links oben als Symbolknöpfe, Kampfstatus als Symbol, Zielrahmen mit Porträt, Toasts und Chat ohne Überlappung. Clan-Schild „POO-TANG · MERTLOCH“ als gemaltes Schild; es liegt am Clan-Treff unter dem Zonentitel (Grafik 9, Screenshot `r1-31`).
8. **Zweite Leiste/Haltungsleiste**: nur belegte Plätze zeichnen, Autoangriff als Slot mit Blinken statt „AUTOANGRIFF AUS.“, „LEER“ als Tastenkappe (Grafik 6, Kenner 10).
9. **Weltkarte**: Symbole statt Buchstaben, Marker bündeln, Namen nur beim Mouse-Over, Hover-Tooltip auf Lagern, doppelte Nummerierung weg, Unbekanntes ausblenden (Grafik 10, Kenner 8).
10. **Nameplates im Nahkampf**: Schild, Lebensbalken und „F: Beute“ über dem Gegner statt auf der eigenen Figur. Die Figur hinter dem Dach nicht geisterhaft zeigen (Kenner 9). Dach des Ruinenhauses blendet über Held und Fundstelle aus (Grafik Nebenbefund).
11. **Sammelobjekte**: größer (`NODE.scale` .7), goldener Glint, keine violetten Deko-Blumen daneben, nicht unter Dächern platzieren, Hover bei Kamerabewegung neu auswerten (Grafik 12).
12. **Handy**: HP-Text im Spielerrahmen quer ohne Umbruch, Toasts ersetzen die Chatzeile, Rucksack-Suche quer (Grafik 11).
13. **Kleinkram Kenner**: Das Ereignisfenster zeigt nach „Ausrüstung nehmen“ „Noch nichts passiert.“, „F: Mit Kisten-Ida sprechen“ steht weit weg von Ida, die Anmeldung liegt über dem laufenden Spiel, nach „Held erstellen“ kommen Neuladen und Film. Dazu 1 Konsolenfehler beim Laden und 4 Warnungen nach dem Schließen der Karte.
14. **Aufträge-Hofprobe**: Ein Klick auf den aktuellen Schritt könnte die Wegmarke setzen, wie die Verfolgung es tut.

## Prüfungen

- Grün: `npm test` (811), `npm run content:check`, `npm run build`, `node scripts/optimierung-r1-check.mjs`, `einzelfenster-check`, `minimap-check`, `quest-tracker-hud-check`, `profession-node-check`, `aktionsleisten-check`, `npm run ui:check`. Die Prüfskripte liefen auf eigenen Ports 9472–9479/4272–4279.
- `aktionsleisten-check` geändert: Er prüft jetzt, dass der Kniff-Tooltip **keine** Bedienhilfe mehr trägt.
- Schon auf main rot und nicht aus dieser Runde:
  - `npm run hud:check`: gleiche Chat-Abweichung auf main 72b0a99 und hier.
  - `mobile-check`: hier 1 Problemschritt („gespraech quer“), auf main 3.
