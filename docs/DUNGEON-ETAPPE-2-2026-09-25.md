# Dungeon „Schloss Big B“ · Etappe 2 „Lesbar wie WoW“ · 25.09.2026

Auftrag: Etappe 2 aus E-71 (Bauplan in `docs/DUNGEON-ANALYSE-2026-09-24.md`, Verbesserungen 4, 5, 6, 11 und die Karte), Zielbilder
A/B/C aus `docs/REVIEW-GRAFIK-DUNGEON-2026-09-24.md`, Befunde aus `docs/PLAYTEST-2026-09-24-dungeon-kenner-1.md` und `-2.md`.
Vorbild WoW: Symbole und Tooltips statt Fließtext, nichts scrollt, kompakt. Etappe 1 („Gerd richtig“) lief parallel; Zahlen,
Söldner-Faktor, Tod als Geist, Laufstand, Beute und `dungeon-check`-Fix sind dort, nicht hier.

- Worktree `D:\Dev\MertlochChronicles-dg-e2`, Zweig `dungeon-e2`, Prüfstand aus einem zweiten Worktree (`-dg-e2-gate`),
  damit laufende Prüfungen nicht die Arbeitskopie sehen.
- Live: Teil 1 seit Build #553 (7feb15b); Teil 2 (9910d55) und Nachtrag (075a948) seit Build #558.
- Commits auf `main`: 7feb15b (Eingang sichtbar), 9910d55 (Warnleiste, Bossrahmen, Journal, Karte, Text-Diät, Handy-Kampf,
  Kellerlicht, nach Etappe 1 rebased), 075a948 (Truppe quer, Bericht).
- Prüfskript `scripts/dungeon-e2-check.mjs` (CDP 9610, Server 4410, `ONLY=1…7`), Unit-Tests `tests/dungeon-e2.test.mjs`.
  Bilder in `visual-review/dungeon-e2/` (lokal, nicht im Repo).

## Punkte

| Nr | Stand | Was | Beleg |
|---|---|---|---|
| 3 | erledigt (Teil 1 zuerst live) | **Eingang sichtbar.** Weltkarte: Marke auch unter Stufe 8 (grau, `dungeon-low`), größer, führt jedes Bündel (nie darin versteckt); Tooltip „Schloss Big B · Dungeon · Stufe 8–10 · 5 Köpfe“, Stufe in Schwierigkeitsfarbe. Ortsliste: Zeile „Schloss Big B · 8–10 · 5 Köpfe“ mit Stiefel direkt unter dem verfolgten Ziel, einzeilig (sonst blättert die Seitenleiste), ganzer Satz im Tooltip/`aria-label`. **Eine** Kategorie „Dungeons“ in beiden Filterlisten, Standard an. Minikarte: Marke in der Nähe, auch grau. Straßenname beim Überfahren der Weltkarte (Tooltip „Burgstraße · Straße“). Esc auf „Kartensymbole“/„Kartenoptionen“ schließt nur das Menü. Am Rolltor heißt der Ort „Schloss Big B · Dungeon · Stufe 8–10“. **Eingangskarte** statt sofortigem Betreten: Stufenband, 5 Köpfe, Bestzeit, fünf Rollenplätze (Held + Söldner), freie Plätze heuern direkt an (Porträt + Rollensymbol, Preis im Tooltip), drei Beuteplätze, unverteilte Talentpunkte (öffnet N), Journal, „Betreten“ (unter Stufe 8 grau). F auf offener Karte = Betreten. **Übergang** (abdunkeln, Name, Willkommenssatz, aufhellen) beim Betreten und Verlassen. Rolltor: Name nur beim Überfahren, Schild „PRIVATBESITZ“, Portal-Flimmern (Canvas ohne Blend-Modi, Lichtquelle und Hitzeflimmern `portal`). | e2-Check Teil 1: Marke Stufe 4 und 10, Tooltip, Zeile, Filter, Minikarte, Esc, Straße, Karte vor dem Betreten, Anheuern, Übergang (≥ 50 ms dunkel vor dem Wechsel). `10-weltkarte-*`, `11-minikarte-symbole`, `12-weltkarte-strasse`, `13-eingang-welt`, `14/15-eingangskarte*` |
| 1 | erledigt | **Boss-Warnleiste mit Timer** (`boss-alerts.js`): über der Aktionsleiste; am Handy hochkant rechtsbündig über den Kampfknöpfen, quer unten zwischen Stick und Knöpfen. Je Fähigkeit Symbol (Merkmal), Antwort in 2–3 Wörtern, Name, Zeit bis zum Treffer, Balken; laufender Zauber rot, unterbrechbar gold mit Tastenkappe. Vorhersage aus Zyklus und `specialInterval` (`upcomingCasts`, Phasenwechsel mit neuem Zyklus eingerechnet). Ansage mittig 1,5 s nur beim ersten Auftreten einer Mechanik und bei Phasen (am Handy aus). Hinweise aus dem Namen in `hint` (`content/dungeons.js`). **Bossrahmen** oben mittig: Porträt (öffnet das Journal), Name, Leben mit Phasenmarken 50/25/15 %, Zauberleiste mit Symbol und Antwort. **Eine Formsprache** für Warnflächen (`hazard-art.js`): Kegel wie Bodenkreis (Randmarken alle 12°, wachsende Füllung, Kante blinkt 8 Hz in den letzten 25 %), Rückstoß-Pfeile am Bogen, Schild „Tank sicher“ an der Spitze; Namensschilder im Kegel treten auf 22 % zurück. | Desktop: Warnung 2,85 s bzw. 10,6 s vor dem Treffer; Handy hoch/quer 2,8 s; nichts abgeschnitten, im Bild, keine Kampfknöpfe verdeckt. `20-warnleiste-desktop`, `21-kegel-desktop`, `22-warnleiste-handy-*` |
| 2 | erledigt (Beute leer) | **Journal aus den Daten** (`dungeon-journal.js`): `describeCast` (content/enemies.js) liefert jetzt auch für Dungeon-Zauber Symbol, Merkmale, Antwort und Kurzzahlen (`castSymbols` in content/combat.js). Seite je Boss: Reiter für alle sechs Plätze (nicht gebaute als Schädel, seltener Boss mit Stern), Kopf mit Porträt, Stufe, Leben, Siegel, Phasen, Fähigkeiten als Symbolkacheln mit Tooltip (Merkmale, Zahlen, je Merkmal ein Satz), drei Rollensymbole mit Hinweisen aus den Merkmalen, Beutevorschau aus `DROP_TABLES[bossId]` – ohne eigene Tabelle leer (die geliehene Sigi-Tabelle wäre falsch). Öffnet über Schädel der Karte, Bossrahmen, Zielporträt, Eingangskarte, Verfolgung. Handy: eine Seite, quer zweispaltig. | 4 Fähigkeiten mit Symbol und Tooltip, 3 Rollen, 3 Beuteplätze, 6 Reiter; Desktop, Handy hoch und quer ohne Scrollen. `30-journal`, `31-journal-handy-*`, `61-karte-journal` |
| 4 | erledigt | **Text-Diät.** Je Raum ein zweizeiliger Zonentitel (Schild groß, Wirklichkeit klein), keine Kurzmeldung (Chatzeile bleibt). Keine Dauerschrift in der Welt: Räume tragen Messingplaketten, Name nur unter der Maus; Übergänge und Rolltor als Symbol mit goldenem Pfeil, Name unter der Maus. Durchsagen als Sprechblase an Lautsprechern an der Wand (Schallwellen, solange sie sprechen). Wehrgang (Carport-Dach) und Pappschützen bis zur Entdeckung verborgen (Welt, Schilder, Minikarte). Pappwand steht als bemalte Pappwand im Gang, gefunden eingedrückt. Tresortür als Stahltür mit Rad und drei Siegelfeldern nebeneinander. Verfolgung zeigt im Dungeon Siegel, Beweise und den nächsten Boss (Klick: Journal). Arena-Tür mit Absperrband. Beute nicht angefasst. | Hof, Hofkanzlei, Ahnengalerie, Rittersaal, Weinkeller: je nur Zonentitel, 0 Schriftzüge in der Welt, keine Kurzmeldung; Durchsage aus dem Lautsprecher; Name beim Überfahren. `40-raum-*`, `41-durchsage`, `dbg-pappwand`, `dbg-siegeltuer` |
| 5 | erledigt | **Handy-Kampfansicht.** Im Bosskampf (`body.boss-fight`): Bossrahmen am Platz des Zielrahmens, Zielrahmen weg, wenn der Boss das Ziel ist, sonst einzeilig; Truppe kompakt (44 px je Söldner, Porträt 28, Name und Balken), quer als Reihe. Die Heldenlücke umfasst Held **und** Ziel (`unionBox` in hero-frame.js, auch am Desktop mit offenen Fenstern); am Handy sucht die Kamera im Bosskampf die Lücke zwischen Rahmen, Truppe, Warnleiste und Knöpfen. Der Bossrahmen zählt als Hindernis für die Truppenleiste (unit-layout.js). | Handy hoch und quer: Held und Boss im Bild, von keinem HUD-Teil verdeckt. `50-handy-boss-*` (vorher: `dbg-phone-390`, `dbg-phone-844` aus der ersten Runde) |
| 6 | erledigt | **Dungeon-Karte** (`dungeon-map-ui.js`, `dungeon-map-art.js`): Leinwand füllt das Fenster (Grundriss statt leerem Ebenenraster), Ebenen als Symbolreiter in der Titelzeile, Info-Symbol statt Erklärsatz, Schalter „Prospekt“ (Auge). Prospekt als Zeichnung: Burggraben mit Wellen, Mauer mit Zinnen, Ecktürme mit Fähnchen, Zugbrücke, je unerkundetem Raum Schraffur, Ornament nach dem Prospekt-Namen und Fantasiename. Erkundet: Pappe mit Tinte, Türen als Lücken, verschlossene Türen dunkel, Tresortür mit Siegeln. Schädel (besiegt grau mit Haken, Krone für Big B, Stern für selten) mit Tooltip, Klick öffnet das Journal. Übergänge als Symbol mit Pfeil (Klick wechselt die Ebene), Kontrollpunkt-Fahne, Rolltor, Held als Pfeil mit Blickrichtung, Söldner als Punkte. Wegmarke per Klick (auch über Ebenen, Breitensuche über benutzbare Übergänge), Route gestrichelt, der Pfeil am Helden führt zum nächsten Übergang, Umschalt+Klick läuft hin. Seitenleiste mit Siegeln, Beweisen, Bossen; am Handy als Zeile oben. **Minikarte im Dungeon:** Ausschnitt ≈ 37 m um den Helden, Räume als Pappe, Gegner rot, Boss als Schädel, Söldner blau, Wegmarke. | Leinwand 77 % des Fensters (vorher 24 %), 3 Reiter, kein Erklärsatz, Schädel-Tooltip, Journal-Klick, Wegmarke K1 → Pfeil zur Treppe; Desktop, Handy quer und hoch ohne Scrollen (vorher quer 523/286). `60-karte-e0`, `62-karte-wegmarke`, `63-karte-handy-*`, `dbg-karte-k1` |
| 7 | erledigt | **Licht im Keller:** `renderer.js` nimmt jetzt auch den Dungeon aus Weltlicht und Effektschicht aus; Pollen/Staub nur draußen. Eigene Stimmung je Ebene (`drawDungeonLight` in dungeon-art.js): Garage kaltes Neon an der Nordwand, Partykeller warme Birnen an den Wänden, Basalt dunkel mit Fackeln. Eine Alpha-Ebene in halber Auflösung, Lichter stanzen aus (`destination-out`), Schein obenauf, jedes zweite Bild neu; keine Blend-Modi. | Weltlicht- und Effekt-Leinwand im Keller `display:none`, draußen wieder an; Themen garage/partykeller/basalt mit 6/57/22 Lichtern im Bild. `70-licht-*`, `71-minikarte` |
| – | erledigt (ohne neue Figuren) | **Gegner unterscheidbar:** Boss ×1,35 (Gerd in Bossgröße), Elite ×1,15; Rollenzeichen am Namensschild (Kreuz = heilt, Funk = ruft Hilfe, Schild = Elite, Schädel = Boss); Sammelschild je ruhendem Schwarm („Pfandratte ×8“), Einzelschilder erst bei Ziel oder Kampf. **Nicht:** Tönung je Art (hätte je Gegner und Bild eine Zwischenfläche gekostet). | Unit-Test: zwei Schwärme à 8, Rollen boss/heal/elite. `dbg-siegeltuer` (Schwärme) |

## Zusammenführung mit Etappe 1 (382ac5d)

- Die an Wänden abgeschnittene Kegelfläche (`coneReach`) läuft jetzt durch den gemeinsamen Baustein: `drawConeHazard(…,{reach,rays})`;
  Randmarken und Rückstoß-Pfeile folgen den Strahlen. Die Warnlinie der Treppenkante ab Phase 2 bleibt, wie Etappe 1 sie gebaut hat.
- Die Warnleiste rechnet eigene Abstände im Zyklus mit (`gaps`/`cast.next`, doppelter Rausschmiss in Phase 2).
- `describeCast` kennt die neuen Merkmale: `pct` (Anteil am Leben), `target:'random'` („Trifft Nicht-Schutz“), `brand`
  („Hausverbot“, +60 % für 20 s) – mit Symbol, Tooltip und Rollenhinweis. Das Journal und die Eingangskarte zeigen Gerds drei
  Vorschau-Teile aus `DROP_TABLES.gerd.items`.
- `tickDungeon`: Arena-Rücksetzen und Geist bleiben von Etappe 1; aus Etappe 2 nur Log statt Kurzmeldung und Durchsage am Lautsprecher.

## Nebenbefunde

- **Gerd blieb stehen:** Warf der Rausschmiss den Helden bis an die Nordwand der Zugbrücke, fand Gerd keinen Weg mehr
  (`findPath` brach ab, weil das Ziel mit Radius 7 „blockiert“ war). An Etappe 1 gemeldet, dort behoben (nächster freier Punkt);
  das Prüfskript stellt den Helden zur Sicherheit weiter zurück.
- **Kopfloses Chrome meldet „reduzierte Bewegung“:** Der Übergang ist dann 60 ms statt 260 ms dunkel, ohne CSS-Übergang.
- Unter Last lief das Spiel im Prüfbrowser mit ≈ 0,4 s Spielzeit je Sekunde; die Warnleisten-Messung rechnet in Spielzeit.

## Prüfungen

Vor dem Push (Prüfstand-Worktree auf dem Stand nach Etappe 1, Ports 9610–9619 / 4410–4419, `BOOT_TRIES=450`):

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 953/953 grün (dazu 11 neue Tests in `tests/dungeon-e2.test.mjs`; `tests/dungeon.test.mjs` prüft die Durchsage jetzt als Chatzeile statt Kurzmeldung, `tests/admin-atlas.test.mjs` sucht den Kiosk unter den Treffern, weil der Dungeon-Eingang jetzt auch auf der Karte steht) |
| `npm run content:check` | 57/57 grün |
| `npm run build` | grün |
| `npm run ui:check` | grün |
| `dungeon-check` | grün (Desktop und Handy; geht jetzt über die Eingangskarte und wartet den Übergang ab) |
| `dungeon-e2-check` | 17 × PASS (Teile 1–7, Desktop, Handy hoch und quer) |
| `optimierung-r4a-check` | grün |
| `optimierung-r5b-check` | grün (18 Prüfungen) |
| `minimap-check` | grün (13 Prüfungen) |
| `mobile-check` | Geräte-Teile nicht schlechter: vorher 2 von 98 (hoch Unterbrechung M-15, klein Kampf-Kniff), nachher 1–2 derselben Art (M-15 wandert zwischen hoch und quer, Kampf-Kniff M-04). Der Sitzungsteil „Beute“ meldet in manchen Läufen „Reden statt Beute“ – **vorbestehender Wackler des Prüfskripts**: Die Vorbereitung schreibt den Beutel in den ersten passenden Speicherschlüssel (`Object.keys(localStorage).find(…)`), das Spiel lädt aber den Schlüssel des Helden; welcher zuerst steht, hängt von der Reihenfolge der Speicherungen ab. Nachgewiesen mit einem Diagnoselauf auf `origin/main` (382ac5d): dort derselbe Befund (Beutel fehlt, Auto-Loot an). |

Leistung (kopfloses Chrome ohne Grafikkarte, unter Last): Bildabstand im Weinkeller mit 16 Pfandratten, Kellerlicht und
Warnleiste Median 16,7 ms, p90 16,7 ms – wie draußen.

## Rest

1. **Beutevorschau** zeigt für Gerd die drei Teile aus Etappe 1; weitere Bosse bekommen ihre Vorschau, sobald ihre Tabellen da
   sind (`bossLoot` liest `uniques`, `items`, `loot`, `pool`, `drops`, `choices`, `unique`, `mount`, `material`).
2. **Bestzeit** auf der Eingangskarte zeigt „–“: Es gibt noch keinen Abschluss (Big B fehlt); gelesen wird `dungeons[id].best`.
3. **Beweise** (Lupen) sind überall vorbereitet und bleiben 0/3, bis Etappe 4 sie baut (`run.evidence`).
4. **Hinweis-Auftrag** unter Stufe 8: nicht gebaut – in `content/` gibt es keinen passenden NPC vor Ort (Vermieter Volker sitzt
   im Dungeon); die Marke auf Welt- und Minikarte übernimmt das.
5. **Filterlisten** von Welt- und Minikarte haben jetzt „Dungeons“ gemeinsam; der Rest der beiden Listen ist nicht angeglichen
   (verschiedene Gruppen: Zielgebiete/Tiergebiete/Lebewesen gegen Fundstellen/Laufweg/Mitspieler) – eigener Umbau.
6. **Straßennamen** nur als Tooltip, nicht als Beschriftung ab einer Zoomstufe.
7. **Nicht gemacht (außerhalb des Dungeons, „wenn Zeit bleibt“):** Kartenseitenleiste über der Menüleiste (eine kürzere Karte
   bräche die Maße, die `optimierung-r4a/r5b` sichern), Erinnerung „Der Stempel“ bei jedem Einloggen (Spielstand/Wolke, nicht
   untersucht).
8. **Freigabepflichtig, nicht angefasst:** Doppelgarage als Sprite (Zielbild C), Räume aus dem Baukasten (E-54), eigene
   Gegner- und Bossfiguren, Tönung je Gegnerart.
9. Die Minikarte im Dungeon hat noch keine Tooltips.

## Iterationen (Screenshots selbst geprüft)

1. **Runde 1:** Eingangskarte mit leeren Porträts und abgeschnittenen Söldnernamen; Journal-Kacheln von den globalen Knopfstilen
   überschrieben (Name fehlte); Dungeon-Karte zeichnete das leere 64×48-Raster (viel Leerfläche), Reiterzustand blieb auf EG;
   Handy-Bosskampf: Ziel-, Truppen- und Bossrahmen deckten die Arena ab; Warnleiste quer über dem Karten-Knopf.
2. **Runde 2:** Porträts gemalt, Angebote als Porträt + Rollensymbol; Karte auf den Grundriss eingepasst, Prospekt mit Graben,
   Türmen und Zugbrücke; Zielrahmen im Bosskampf weg bzw. einzeilig, Truppe kompakt, Bossrahmen am Zielrahmen-Platz;
   Journal-Kacheln als eigene Elemente, Seite am Handy hochkant ohne Scrollen; Ortsliste einzeilig (Seitenleiste blätterte).
3. **Runde 3:** Warnleiste am Handy hochkant rechtsbündig über den Knöpfen (vorher über dem Boss), Kamera legt Held und Boss in
   die Lücke; Journal quer zweispaltig; Schwärme richtig getrennt (vorher „×15“ und „×8“ für 2 × 8); Auge statt Buch für den
   Prospekt-Schalter; Ansage am Handy aus.
