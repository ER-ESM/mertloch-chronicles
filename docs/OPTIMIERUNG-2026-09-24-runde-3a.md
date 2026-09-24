# Optimierung Runde 3, Teil A „Kampfeinstieg & Interaktion“ · 24.09.2026

Eingang: Kenner-Playtest R3 (`docs/PLAYTEST-2026-09-24-r3-kenner.md`, unverändert übernommen). Kern: ein erfahrener Spieler starb im ersten Kampf draußen, ohne einen Kill in 50 Aktionen.
Vorbild WoW, Symbole und Tooltips statt Text, nichts scrollt. Teil B (Handy, Fensterhöhen, Gegenstands-Tooltip, Hilfe, Leisten, Zonentitel, Fenster, Tooltip-Anker) ist hier nicht angefasst.
Prüfskript: `node scripts/optimierung-r3a-check.mjs` (CDP 9500, Server 4300; `ONLY=1,2,…` für einzelne Teile, `REPEAT=n` für Messläufe). Screenshots in `visual-review/optimierung-r3a/` (lokal, nicht im Repo).
Unit-Tests: `tests/optimierung-r3a.test.mjs`, angepasst `tests/engine-runde-b.test.mjs` (Autoangriff ohne Kurzmeldung, zwei Hofprobe-Versuche) und `tests/hotspots.test.mjs` (zwei Versuche).
Messwerkzeug: `scripts/erster-kampf-messung.mjs <anzahl>` (Stufe-1-Held gegen n gleichzeitige Gegner).

## Neue Bausteine

| Datei | Aufgabe |
|---|---|
| `autopilot.js` | Laufweg aus `game.navigate` hält beim ersten neuen Angreifer (Aggro, Kettenzug, Treffer). Wer beim Losgehen schon kämpfte, hält einen Rückzug nicht auf. |
| `tab-target.js` | Tab in Stufen: Angreifer → Feinde → neutrale Tiere (nur ohne Feind in Reichweite); vorn vor hinten, dann Abstand. `engine.selectNext` ruft nur noch das Modul. |
| `talk-target.js` | Rechtsklick auf einen NPC merkt das Gesprächsziel, läuft hin, hält in Gesprächsweite an (nicht auf der Figur) und öffnet das Gespräch. |
| `quest-mobs.js` | Wer zählt für einen laufenden Auftrag (Kapitel, Nebenauftrag, Treffpunkt), Zielgebiet des Kapitelziels, Zeichen über Ida. |
| `entry-path.js` | Entschärfung nur auf dem Einstiegsweg Ida → erstes Kapitelziel, nur bis Stufe 3. |
| `combat-cues.js` + `kampfeinstieg.css` | Roter Bildrand bei Angriff hinter Fenstern, rote Fehlerzeile, Auftragszeichen und Zustandssymbol im Zielrahmen. |

## Punkte

| Nr | Stand | Was | Beleg |
|---|---|---|---|
| 1 | erledigt | **Autopilot stoppt beim ersten Treffer**: gilt für Auftragskasten, Karte „Weg einschlagen“, Minikarte (Umschalt-Klick) und Rechtsklick-Laufweg, weil alle über `game.navigate` laufen. Aggro, „Kumpel kommt“ und der erste Treffer eines neuen Angreifers halten an; der Angreifer wird Ziel (Regel aus Runde 2b). **Karte schließt** bei „Weg einschlagen“. Entscheidung: schließen statt verkleinern – wer „Weg einschlagen“ drückt, will laufen und muss die Figur sehen (in WoW läuft man mit der Vollbildkarte blind, genau das war der Befund); die Route steht weiter auf der Minikarte. Eine kleine Karte wäre Fensterarbeit von Teil B (Fenstergrößen) und bleibt als Rest. **Roter Bildrand** pulst, wenn dich etwas angreift, während ein Fenster offen ist (über den Fenstern, klickdurchlässig). | Prüfung 1–5, `r3a-10…12` |
| 2 | erledigt | **Rechtsklick = genau dieses Ziel.** Ursache (nachgestellt): Im Nahkampf rückt das Namensschild des Gegners seit Runde 2b 17–33 E seitlich neben den Helden. Der alte Treffertest kannte nur einen Kreis (27 E) um die Körpermitte: Ein Klick auf Schild oder Namen des kauenden Keilers war „Klick ins Leere“ und änderte das Ziel nicht (gemessen: Schild bei Überlappung mit dem Helden 33 E versetzt → kein Treffer, Name darüber nie ein Treffer). Das Ziel blieb der Schnorrer, den „Angreifer wird Ziel“ vorher übernommen hatte, weil Tab einen neutralen Raben gewählt hatte – daher „Zu weit entfernt · 13 m“. Jetzt (`target-ui.js`): zuerst das gezeichnete Bild (Oberkante `e.spriteTop` aus dem Renderer), bei Überlappung der vorderste Gegner; dann Namensschild und Name (`e.plateAt`); erst danach der alte Kreis. Figuren gehen außerdem vor Stationen (der Fahrstall schluckte Klicks auf Leute daneben), Dorfbewohner treten bei Überlappung hinter Ida und Auftraggeber zurück, Auftraggeber der Treffpunkte (z. B. Hedwig) sind jetzt anklickbar. **Rechtsklick auf NPC** läuft hin und redet. **Außer Reichweite**: ein Kniff auf einen Feind läuft hin (Autoangriff an) statt „Zu weit entfernt“; neutrale Ziele melden weiter die Entfernung. | Prüfung 6–9, `r3a-20`, `r3a-21z`, `r3a-22` |
| 3 | erledigt | **Tab wie in WoW**: Angreifer zuerst, dann Feinde; neutrale Tiere nie, solange ein Feind in Reichweite ist – auch wenn das Tier näher steht; im Kampf wie bisher keine neutralen Tiere. „Kein passendes Ziel“ ist eine rote Zeile. | Prüfung 10, Unit-Test |
| 4 | erledigt | **F-Priorität**: das gewählte Ziel in Gesprächsweite und Beute zu Füßen gehen vor Treppe, Bude und Schwarzem Brett; das Brett kommt erst nach den Leuten. Das gesperrte Brett meldet sich als rote Zeile „Söldner gibt es ab Stufe 4.“ (vorher dieselbe Meldung golden, oft hinter anderen Meldungen). | Prüfung 11–12, `r3a-30`, `r3a-31z` |
| 5 | erledigt | **Notfallbrezel**: Taste 0 heilt im Kampf bei 6/600 (6 → 166) – im Code gab es keine Kampfsperre, keine Stufe, die Belegung stimmt (Platz 10 = Taste 0). Nicht nachstellbar war die stumme Ablehnung; wahrscheinlichste Ursache: Meldungen wie „noch nicht bereit“ standen als goldene Kurzmeldung hinten in der Schlange (höchstens 4, die älteste fällt weg) und kamen nach dem Tod oder nie. Jetzt ist **jede Ablehnung eine rote Fehlerzeile** (`game.fail`, Kniffe und Gegenstände), die sofort erscheint und nicht wartet; Restzeit mit Komma. Gegenstandstext: „160 Leben, auch im Kampf.“ | Prüfung 13, `r3a-40`, `r3a-40z` |
| 6 | erledigt | **Auftragsgegner**: kleines goldenes „!“ links am Namensschild und im Zielrahmen (Tooltip „Auftragsgegner“). **Zählen**: Gezählt wurden nur die drei Lagergegner („Grillplatz-Plünderer“); die angreifenden Pfandkeiler sind Feldgegner und zählten nie – das war kein Rechenfehler, aber ein Widerspruch zum Auftragstext. Jetzt zählt jeder Gegner derselben Art im **Zielgebiet** (330 E um das Lager, bis über den Lagerrand); das Gebiet steht als goldene Fläche auf Karte und Minikarte. **Pfeil**: Wegmarke und Pfeil zeigen fest auf die Gebietsmitte; der Laufweg führt aus der Ferne weiter über den sicheren Lagerrand (vorher sprang die Marke bei 110 E zwischen Lagerrand und Lager: 79/50/25/41 m). „Dieses Ziel zieht gerade ab …“ ist ein Symbol mit Tooltip am Zielrahmen (Pfeil zurück = zieht ab, Funke = kommt an), das beim Angriffsversuch aufblinkt. | Prüfung 14, `r3a-50z`, `r3a-51` |
| 7 | erledigt | **Erster Kampf fair** – siehe Messung unten. Laufweg bleibt, Balancing bleibt; nur Feldgegner am Einstiegsweg bemerken den Helden später. | Prüfung 15 |
| 8 | erledigt | „?“ über Ida bei jeder Abgabe (auch Rückkehr aus der Hofprobe), „…“ während ein Auftrag läuft. Fahrstall-Name steht direkt über den Fahrzeugen (vorher 54 E darüber auf Hedwig) und nicht, solange die Maus auf einer Figur liegt. Hofprobe 5/8: der zweite Kreis steht so lange wie der erste und hat einen Wirkzeit-Balken; höchstens zwei Versuche, dann die klare Meldung „… übst du später im echten Kampf“. Tod-Satz „immer noch ohne Hose“, bis Kapitel 1 abgegeben ist. Randale-Leiste nach der Hofprobe immer sichtbar (war versteckt, solange kein Kniff Randale kostete). Erinnerungs-Fenster warten, bis kein Fenster, keine Einblendung, keine Kurzmeldung, kein Kampf und keine Bewegung ist und der Held 1,5 s ruhig steht. „Autoangriff an/aus“ ist keine Kurzmeldung mehr (Platz pulsiert, `#autoState` sagt es dem Bildschirmleser). | Prüfung 16–19, `r3a-71`, `r3a-72z` |

## Messung erster Kampf (Punkt 7)

Frischer Held Stufe 1 (600 Leben, Tresenbrecher-Rotation 1-2-3 per Bot, Brezel unter 35 %), Idas erstes Ziel „Pfandkeiler von den Trümmern jagen“ (Lager `main-wolf`, 1728 E ≈ 216 m von Ida), Start per Klick auf den Auftragskasten.

- **Einzelkämpfe** (`erster-kampf-messung.mjs`, je 2 Läufe): 1 Pfandkeiler (St. 2) ≈ 10 s, −170 Leben · 2 gleichzeitig ≈ 17,5 s, Rest 74–104 Leben · 3 gleichzeitig: Tod nach ≈ 11,6 s mit 1 Kill.
- **Vorher (wie im Playtest)**: Autopilot lief durch; bis zum Lager bemerkten den Helden 6–8 Gegner (2–4 Feld-Pfandkeiler am Weg, ein Dreier-Rudel Pfandkeiler am Lager, 3 Lagergegner) – drei gleichzeitig reichen für den Tod.
- **Nur Autopilot-Stopp (ohne Entschärfung)**, 4 Läufe: 1× Tod nach 33 s (4 Gegner, 1 Kill), 3× überlebt mit min. 140–153 Leben, je 4–6 Gegner, 83–89 s.
- **Mit Entschärfung des Einstiegswegs**, 5 Läufe: immer überlebt, min. 295–406 Leben, 1–3 Gegner (einmal ein Ruhewart St. 3 am Weg), 38–56 s bis zum ersten Kill, der für den Auftrag zählt.

**Entschärfung (`entry-path.js`)**: Nur bis Stufe 3, nur solange Kapitel 1 läuft, nur für Feldgegner (nicht Lager, nicht Elite) im Streifen von 150 E um den tatsächlichen Laufweg Ida → Lagerrand → Lager und im Umkreis von 300 E um das Lager: Aggro-Reichweite × 0,4 (Pfandkeiler 115 → 46 E) und kein Kettenzug. Begründung: Der Weg selbst ist richtig (Straße, sicherer Lagerrand); das Problem war die Dichte der Feldrudel am Einstieg, nicht die Werte eines Gegners. Globales Balancing (E-60ff.) ist unverändert: Leben, Schaden, Stufen, Rudelgrößen und Aggro-Reichweiten überall sonst bleiben, ab Stufe 4 auch auf diesem Weg.

## Überschneidungen mit anderen Sitzungen

- Runde 2b (`attacker-target.js`, `attack-approach.js`, `toast-queue.js`) ist erweitert, nicht ersetzt: Die Schlange hat jetzt dringende Meldungen (`push(text,{urgent})`), der Hinlauf wird auch von Kniffen außer Reichweite gestartet.
- Feinschliff Runde 59 (roter Rand bei wenig Leben, `.game-shell::after`) bleibt; der Angriffs-Puls ist eine eigene Ebene (`#attackRim`) über den Fenstern.
- Tastenbelegung (`keymap.js`, c3d7ffa) kam während der Runde auf main; Tab und F laufen weiter über `game.selectNext` und `speak()`, darunter greifen die neuen Regeln. Kein Konflikt beim Rebase.
- Gegenstands-Tooltip ist Teil B: Er zeigt die Beschreibung der Brezel nicht; „auch im Kampf“ steht deshalb in Beschreibung und Glossartext (`content/items.js`, `content/item-info.js`).

## Prüfungen

- Grün: `npm test` (833), `npm run content:check`, `npm run build`, `optimierung-r3a-check` (19), `optimierung-r2b-check` (25), `optimierung-r1-check` (16), `aktionsleisten-check`, `profession-node-check` – jeweils mit eigenen Ports 9500–9509 / 4300–4309 (aktionsleisten- und profession-node-check als Kopie mit geänderten Ports, danach gelöscht).
- `optimierung-r2b-check` Zeile 217 („neue Fassung beim Start still übernommen“): hier grün. Ein Wackler ist sehr wahrscheinlich; die Maschine lief mit bis zu 87 % CPU-Last und 40 Chrome-Prozessen anderer Sitzungen, der Spielstart brauchte 12–20 s. Unter dieser Last scheiterten auch `optimierung-r2b-check` und `aktionsleisten-check` einmal mit „Game did not initialize“ (Startfenster 16 s in `browser-polish.mjs`) und liefen im zweiten Anlauf grün.
- Schon auf main rot, gleicher Lauf auf main 8dce615 (eigene Arbeitskopie) und auf dieser Runde, jeweils eigener Server/CDP-Port:
  - `hud:check`: auf beiden an derselben Stelle rot (`deepStrictEqual`, Chat-Rahmen wie in Runde 2b).
  - `akt1b-check` (eigenes Chrome mit Fernsteuerung): auf beiden rot an derselben Zusicherung (`==`, erwartet `true`).
  - `mobile-check`: main 5, diese Runde 4 von 95 Schritten mit Problemen – nicht schlechter.

## Rest

1. Die Karte könnte beim Laufen klein statt geschlossen sein (Teil-B-Fensterarbeit).
2. Weitere Kapitel: Die Entschärfung gilt nur für Kapitel 1; Kapitel 2–4 haben eigene Wege, die noch niemand gemessen hat.
3. Die Minikarte zeigt das Zielgebiet nur für Kapitel-Tötungsziele, nicht für Sammelziele.
4. Der Klickpfad des Kenners mit der stummen Brezel ist nicht exakt nachgestellt (siehe Punkt 5); sollte sie wieder stumm bleiben, fehlt eine Meldung an einer Stelle außerhalb von `useItem`.
