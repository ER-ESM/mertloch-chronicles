# Visueller Feinschliff 2026-09-23/24 – Bude, Kampf, Items, Talente, Kniffe

Nutzerauftrag: „visueller Feinschliff mit Live-Bewertung … Bude in allen Inhalten, Items, Talente, Kniffe, Kampfanimationen … mindestens 20 Iterationen“.
Arbeitsweise: je Runde Aufnahme (Headless oder Playwright), Vergleich mit WoW/Diablo IV/Hades/Stardew/Eastward, gezielte Änderung, `npm test` grün, Fast-Forward nach `main`, `server-refresh`.
Branch `visual-polish`, Worktree `D:\Dev\MertlochChronicles-polish`. Figuren- und NPC-Grafik wurde bewusst **nicht** angefasst (Freigabe-Regel).

## Runden (live #329 bis #453)

**Nutzerentscheidungen 2026-09-24:** Kamera näher (statt größere Figuren), Rückwände mit Tapete, Karte handgemalt im Code, Talente als ausgegraute Vorschau.

| # | Bereich | Änderung | Dateien |
|---|---|---|---|
| 1 | Bude | Kneipendämmerung drinnen (nur über der Grundfläche), Lampen-/Ofenlicht aus Baukasten-Teilen mit `light`, Lichtschacht mit Staub durchs Dachloch, Schatten am Wandfuß | `world-light.js`, `content/lighting.js` (`interior`, `lamp`, `stove`, `skylight`), `bude-house-art.js` |
| 2 | Welt | Auftragszeichen als goldenes „!“/„?“ mit atmendem Schein (Schrift-Ebene) statt rosa Pille; Raumnamen nur für den eigenen Raum und unter der Maus | `renderer.js` (`questBadge`) |
| 3 | Bude | Nichts scheint mehr durchs Dach (Schilder von Figuren unter sichtbarem Dach aus); weicher Kontaktschatten unter Kulissen (Trümmer sahen wie Löcher aus) | `renderer.js` (`hideLabels`), `world-prop-ui.js` |
| 4 | Bude | Schankraum als „Morgen danach“ (Fass, Stühle, Becher, Luftschlangen, Pfütze, Scherben) – `kit:check` grün, Bauplätze/Treppe frei | `content/bude-house.js` |
| 5 | Kampf | Treffer-Blitz mit Rückstoß; Kampftext größer, dicke Kontur, Glückstreffer golden federnd, Drift je Laufbereich | `renderer.js` (`hitFlash`), `bierdeckel.css` (`.sct-*`) |
| 6 | Talente | Motive füllen den Rahmen (Umriss einpassen), größere Knoten, Gold-Schein gelernt, grünes Atmen verfügbar | `talent-art.js`, `icon-fit.js`, `talent-tree.css` |
| 7 | Items | Qualitätsschimmer hinter Gegenständen (episch atmend), Tooltip-Rand in Qualitätsfarbe, Fachbegriffe leiser unterstrichen | `ui-chrome.css` |
| 8 | Kniffe/HUD | Kniffe-Buch-Symbole im Messingrahmen; leere Fächer der 2. Leiste ohne Tastenschild | `bierdeckel.css` |
| 9 | Bude | Senkrechte Wände mit Licht-/Schattenseite und Putzfugen; Tageslicht der Südfenster auf den Dielen | `kit-art.js`, `world-light.js`, `content/lighting.js` (`window`) |
| 10 | Kampf | Warnfläche der Gegner: Verlaufsfüllung, wachsende Innenfläche, rotierender Markenkranz | `renderer.js` |
| 11 | Kampf | Gegner-Lebensbalken mit Rahmen, Glanzkante, nachlaufender Verlust-Spur; Elite/Boss Goldrand | `renderer.js` (`nameplate`) |
| 12 | Bude | Funken über dem Ofen, Staub im Lampenlicht | `world-light.js`, `content/lighting.js` |
| 13 | Clanbuch | Reitersymbole größer und randfüllend | `icon-fit.js`, `ui-art.js`, `ui-chrome.css` |
| 14 | Figur | Held auf einer Bühne (Lichtkegel, Bodenschatten) | `ui-chrome.css` |
| 15 | Bude | Schlagschatten des Hauses in Lichtrichtung (drinnen kurz) | `bude-house-art.js` (`castShadow`) |
| 16 | Maus | Eigene Zeiger: Messingpfeil, Schwert (Gegner), Sprechblase (Freunde), Hand (Sammelpunkt) | `ui-chrome.css`, `app.js` (`data-cursor`) |
| 17 | Kampf | Kampftext 28 px, Glückstreffer 40 px | `bierdeckel.css` |
| 18 | Aufstieg | Goldene Lichtsäule, Bodenring, Funken am Helden (mit Lichtschein) | `app.js`, `renderer.js` (`drawLevelUp`), `world-light.js` |
| 19 | Kampf | Gegner kippen beim Tod vom Helden weg um, liegen entsättigt, verblassen; Staub statt Explosion | `renderer.js` (`drawCorpse`), `asset-art.js` |
| 20 | Bude | Lichterketten über dem Hof mit eigenem Lichtschein | `content/bude-house.js` (`garlands`), `world-house.js`, `bude-house-art.js`, `world-light.js` |
| 21 | Aufstieg | Banner ohne sichtbaren Kasten | `bierdeckel.css` |
| 22 | Kampf | Zielmarke: vier rotierende Klammerbögen mit Kontur und Bodenschein | `renderer.js` |
| 23 | Persona | Leere 2. Leiste unsichtbar; Hausschatten läuft weich aus; Trümmerschilder nur unter der Maus | `ui-chrome.css`, `bude-house-art.js`, `renderer.js` |
| 24 | Gespräch | Dockt wie in WoW links unter dem Spielerrahmen – Held und Gesprächspartner bleiben sichtbar | `popup-windows.js`, `ui-chrome.css` |
| 25 | Kniffe | Gesperrte Kniffe lesbar (nur Symbol entsättigt), Namen 12 px | `ui-chrome.css` |
| 26 | Hof | Südkante läuft unregelmäßig ins Gras aus | `bude-house-art.js` (`softEdge`) |
| 27 | Karte | Papierkörnung, abgegriffene Ränder | `ui-chrome.css` |
| 28 | Welt | Schilder/Auftragszeichen über dem eigenen Helden durchscheinend | `renderer.js` (`labelQueue.hero`) |
| 29 | HUD | Menüknöpfe unten rechts 46 × 50 mit randfüllenden Symbolen | `ui-art.js`, `ui-chrome.css` |
| 30 | HUD | EP-Leiste mit Glanzkante und leuchtender Spitze | `ui-chrome.css` |
| 31 | Kampf | Eigener Glückstreffer: kurzer Kamerastoß (aus bei reduzierter Bewegung) | `app.js` |
| 32 | Bude | Pfandlager mit Bodendeko | `content/bude-house.js` |
| 33 | Persona 2 | Leichen 6 s, Held hinter der Bude als heller Umriss, Schilder über dem Helden 60 % | `renderer.js` (`ghost`, `CORPSE_TIME`) |
| 34 | Clanbuch | Auswahlfelder im Spielstil, Kniff-Namen zweizeilig, `icon-fit` ohne Canvas-Warnungen | `ui-chrome.css`, `icon-fit.js` |
| 35 | Kamera | Grundzoom am Desktop 2,6 statt 2 (Entscheidung) | `renderer.js` (`DESKTOP_ZOOM`) |
| 36 | Bude | Rückwände mit Tapete je Raum (Damast, Lilien, Backstein, Fliesen, Bretter, Streifen), Vertäfelung, Zierleiste, abgerissene Stellen; Wandfront 28 E (Entscheidung) | `content/bude-house.js` (`rooms[].paper`), `world-house.js` (`papers`), `kit-art.js` (`drawPaper`), `content/sprite-kit.js` |
| 37 | Bude | Held hinter einer Rückwand als Umriss | `renderer.js` (`ghost`) |
| 38 | Karte | Handgemalt im Code: Muster für Wiese/Acker/Wald/Dorf, Dächer mit First und Schatten, Baumkronen, Wasser mit Ufer, Erdwege (Entscheidung) | `cartography.js` (`mapPattern`, `drawRoof`) |
| 39 | Talente | Vor Stufe 5 ausgegraute Vorschau mit Hinweis, Reiter mit Schloss (Entscheidung) | `app.js` (`showTalents`), `ui-chrome.css` |
| 40 | HUD | Sonderaktionen und Autoangriff als Ablage an der Leiste | `ui-chrome.css` |
| 41 | Bude | Möbel mit feinem Umriss, Innenraum heller | `kit-art.js` (`outlined`), `content/lighting.js` |
| 42 | Bude | Seitenwände mit Mauerwerk-Krone (Entscheidung) | `kit-art.js` |
| 43 | Bude | Wandschmuck mit Umriss | `kit-art.js` |
| 44 | Mobil | Abstand zur Bildschirmecke, Touch-Abstände ≥ 8 px, große Auswahlfelder/Häkchen – mobile-check 1 statt 3 Problemschritte | `talent-tree.css`, `popup-windows.js`, `ui-chrome.css` |
| 45 | Welt | Namen freundlicher Figuren kräftig grün-gelb, dickere Kontur | `renderer.js` (`NPC_NAME`) |
| 46 | Kampf | Beute fliegt sichtbar zum Helden (auch Auto-Loot) | `renderer.js` (`lootFly`), `app.js` |
| 47 | Tooltips | Symbol 36 px im Messing-/Qualitätsrahmen | `ui-chrome.css` |
| 48 | HUD | Abklingzeit vorbei: Aufblitzen + goldener Ring | `app.js` (`cd-done`), `ui-chrome.css` |
| 49 | Kampf | Eigener Schaden steigt über dem Ziel auf, oberhalb des Namensschilds | `combat-text.js` |
| 50 | Karte | Beschriftung als Tinte, Ziegelreihen; Häkchen im Spielstil | `cartography.js`, `ui-chrome.css` |
| 51 | HUD | Meldungen unter der Rahmenzeile, geschlossene Kontur | `ui-chrome.css` |
| 52 | Bude | Pfützen mit Wasserglanz | `kit-art.js` (`glint`) |
| 53 | Welt | Held hinter Baumkronen als Umriss | `renderer.js` |
| 54 | Gespräch | Porträt 128 px | `ui-chrome.css` |
| 55 | Gespräch | Erste Zeile zusätzlich als Sprechblase über der Figur (Eastward) | `app.js` (`speakOpening`), `renderer.js` (`speakers`), `enemy-ui.js` |
| 56 | Bude | Hinterzimmer, Küche, Klo mit Spuren der Nacht | `content/bude-house.js` |
| 57 | Welt | Staubwölkchen je Schritt; Schrittzähler über echte Wegstrecke | `world-presence.js` |
| 58 | Minikarte | Dachfarben/Flächen wie die große Karte | `minimap.js` |
| 59 | HUD | Wenig Leben: roter pulsierender Bildschirmrand | `ui-chrome.css` (`.game-shell::after`) |
| 60 | Kampf | Held blitzt bei Treffern rot | `renderer.js` (`hitFlash` mit Farbe) |
| 61 | Bude | Hof mit weiteren Draußen-Teilen | `content/bude-house.js` |
| 62 | HUD | Tastendruck: Knopf gibt nach und leuchtet | `app.js` (`triggerSlot`), `ui-chrome.css` |
| 63 | Zielrahmen | Gegnerporträt als Brustbild im Medaillon | `app.js` (`paintTargetPortrait`), `ui-chrome.css` |
| 64 | Beute | Lichtsäule in Qualitätsfarbe über Beuteln, Schild nur am nächsten | `renderer.js` (`lootBeam`) |
| 65 | Kampf | Trefferfunken vom Angreifer weg | `renderer.js` (`hitFlash`) |
| 66 | Welt | Ortswechsel groß eingeblendet; in der Bude „Die Bude · Raum“ | `app.js` (`zoneSplash`), `ui-chrome.css` |
| 67 | Talente | Gelerntes Talent blitzt golden, Ring nach außen | `app.js` (`celebrateTalent`), `talent-tree.css` |
| 68 | Figur | Neu angelegter Gegenstand: Platz blitzt in Qualitätsfarbe | `app.js` (`equipFlash`), `ui-chrome.css` |
| 69 | Fenster | Weiches Einblenden beim Öffnen (140 ms, nur Deckkraft) | `ui-chrome.css` |

## Anmeldung, Einstellungen, Tastenbelegung nach WoW-Vorbild (Runden 70–99, live bis #495+)

Auftrag: „GUI rund um die Anmeldung, Login Screen, freie Tastaturbelegungen in den Einstellungen, Einstellungen und Interface-Menüs gliedern und nach WoW-Vorbild aufbauen“ (30 Runden).

**Aufbau**

- **Tastenbelegung** – `content/keybinds.js` (Gruppen, Aktionen mit zwei Tasten, Texte), `keymap.js` (Logik: `assignKey` – neue Taste gewinnt, alter Platz wird gelöst; nur Abweichungen vom Standard werden gespeichert). Kontoweit in `mertloch-keybinds-v1`; die Aktionsleisten-Tasten bleiben je Held (`rpg.barKeys`, `bar-keys.js`) und erscheinen im selben Menü. Esc ist fest (Menü/Abbrechen). Bedienung: Taste anklicken → neue drücken; Esc bricht ab, Entf oder Rechtsklick löscht. Gruppen einklappbar, Suchfeld. Auf Touch ausgeblendet.
- **Einstellungen** – `content/options.js` (Kategorien/Zeilen/Standardwerte), `options-ui.js` (Fenster). Kategorien Spiel · Interface · Grafik · Ton · Tastenbelegung · System; Erklärungen als Tooltip an der Zeile (auf Touch als Zeile), Standard je Kategorie, Hinweise in der Fußzeile, letzte Kategorie gemerkt, Pfeiltasten wechseln die Kategorie. Kontoweit (`mertloch-options-v1`): UI-Skalierung, Lautstärke, Statustext, Auftragsverfolgung/Minikarte/EP-Leiste. Je Held (`game.settings`): Auto-Loot, Kampftext (+ eingehend/Meldungen/Söldner), Namen (freundlich/Gegner/Spieler), Grafik-Details.
- **Spielmenü** (`rpg-shell.js` `gameMenu`) – Einstellungen (O), Tastenbelegung, UI bearbeiten, Hilfe | Berufe, Reittiere, Söldner | Heldenwahl, Abmelden | Zurück zum Spiel; rechts die belegte Taste.
- **Startschirm** (`start-screen.js/.css`) – Anmeldung: Logo mit Schein und Lichtstreif, Kasten mittig unten, „E-Mail merken“, Feststelltasten-Warnung, Passwort zeigen, Version/Serverstatus unten links, Einstellungen unten rechts. Heldenwahl: Held groß in der Taverne, Liste rechts (Brustbilder, Pfeil hoch/runter), „Ins Dorf“ unten mittig, Löschen nur mit eingetipptem Namen. Ohne Helden direkt die Erstellung (eine Seite: Klassen links, Modell mittig, Aussehen rechts, Name unten; Esc = Zurück).

| Runde | Bereich | Was | Wo |
|---|---|---|---|
| 70–72 | Tasten | Freie Belegung aller Aktionen, Tasteneingabe darüber, Leisten sperren die wirksame Belegung | `keymap.js`, `app.js`, `bar-keys.js` |
| 73 | Einstellungen | Fenster mit sechs Kategorien, Tastenbelegungs-Tabelle mit Konfliktauflösung | `options-ui.js`, `content/options.js` |
| 74–75 | Menü/Hilfe | Spielmenü gegliedert, Hilfe zeigt die wirksame Taste | `rpg-shell.js`, `help-keys.js` |
| 76–78 | Startschirm | Anmeldung, Heldenwahl und Erstellung nach WoW-Aufbau | `start-screen.js/.css` |
| 79–84 | Einstellungen | Namensschilder, Kamera-Regler, Hinweise in der Fußzeile, Tastatur-Navigation, sicheres Löschen | `options-ui.js`, `renderer.js` |
| 85–87 | Startschirm/HUD | Registriermodus-Knöpfe, Held atmet, HUD-Teile ausblendbar | `start-screen.*`, `ui-chrome.css` |
| 88 | Einstellungen | Erklärungen als Tooltip, Schalter ohne an/aus | `options-ui.js` |
| 89 | Spiel | Kampftext-Feinschalter (eingehend, Meldungen, Söldner) | `combat-text.js`, `engine.js` |
| 90–91 | Startschirm | Ohne Helden direkt Erstellung; Brustbilder in Liste/Klassenwahl | `start-screen.js` (`BUST`) |
| 92 | Interface | Statustext Zahl/Prozent/beides/aus (Handy: Prozent) | `options-ui.js` (`statusText`), `app.js` |
| 93, 95 | Tasten | Gruppen einklappbar, kompakte Zeilen, Rechtsklick löscht | `options-ui.js` |
| 94 | Anmeldung | Feststelltaste, Passwort zeigen, Länge nur beim Registrieren, Gast schlank | `start-screen.js`, `ui-kit-mmo.js` |
| 96 | Handy | Einstellungen: Fußzeile sichtbar, ohne Seitentitel und Tastenbelegung | `ui-chrome.css` |
| 97 | Anmeldung | Logo-Schein und Lichtstreif (aus bei reduzierter Bewegung) | `start-screen.css` |
| 98 | Heldenwahl | Liste nur so hoch wie ihr Inhalt, Pfeil hoch/runter, Esc in der Erstellung | `start-screen.*` |

Fallen: Der Prüf-Chrome emuliert `prefers-reduced-motion: reduce` – Animationen dort nur mit `Emulation.setEmulatedMedia` sehen. Den Anmeldekasten lokal über `?online=1` plus eine vorgetäuschte `/api/`-Antwort aufnehmen (lokaler Server hat keine API). Fensterknöpfe in `.game-popup` bekommen Rahmen mit `!important` – eigene Knöpfe dort (z. B. `.opt-fold`, `.opt-key`) brauchen eigene `!important`-Überschreibungen.

## Werkzeuge

- `visual-review/shot.mjs` (nicht eingecheckt, `visual-review/` ist ignoriert): Headless-Aufnahmen mit voller Bildrate. Szenen `sct`, `fight`, `kill`, `aoe`, `bude:x:y:zoom:geschoss`, `ui:<taste>` (mit `PRE`/`HOVER`), `eval` (mit `EVAL`/`WAIT`/`CLIP`).
- Falle: Das Playwright-MCP-Fenster läuft gedrosselt (Dokument-Zeitleiste steht, rAF ~4/s) – CSS-Animationen und Kampftext sind dort unsichtbar. Für Animationen Headless-Chrome über `scripts/browser-session.mjs` nehmen.

## Persona-Bewertungen

Zweite Kenner-Runde auf #375: **6,5/10** (Bude außen 7,5, Clanbuch 7, Gespräch 6,5, HUD 6,5, Bude innen 5,5, Kampf 4,5). Achtung: Personas laufen im gedrosselten Playwright-Fenster – Kampftext/EP (CSS-Animationen) sehen sie nicht, die Kampfnote ist dadurch zu niedrig. Offen laut Runde 2: Innenwände ohne Wandflächen, drei Schriftarten, Karte nicht gemalt, frei schwebende HUD-Teile (F-Hinweis, LEER/Q, Autoangriff-Pille).

Dritte Kenner-Runde auf #406: **6,5/10** – Außenwelt auf Stardew-Niveau; Kritik an Tod/Beute (im gedrosselten Fenster nicht sichtbar, headless geprüft: Leichen und fliegende Beute funktionieren), Kampfzahlen auf Namensschild (Runde 49), Held hinter Bäumen (53), Meldungslage (51), Porträtgröße (54).
Offen: erster Kill ruckelt ~650 ms (auch vor dieser Arbeit, headless gemessen), Dialog als Textblock statt Sprechblase, Innenräume könnten voller/kaputter sein.

### Kenner, Build #360

Gesamt 6/10; stark: Startbildschirm/Film, Fassaden, UI-Rahmen. Abgearbeitet in Runden 23–29: leere Leiste, Rechteckschatten, Dialog-Lage, gesperrte Kniffe, Hofkante, Karte, Held unter Schildern, Menüknöpfe.
Offen (bewusst nicht angefasst):
- **Held klein** (Echtmaßstab E-52) und **Innenwände nur als Krone** (Entscheidung E-52/E-54) – Umbau wäre eine Nutzerentscheidung.
- **Talente erst ab Stufe 5 sichtbar** (Freischaltung `content/unlocks.js`) – Persona wünscht ausgegrauten Baum als Vorschau.
- **Figuren/NPC-Grafik** – nur nach Freigabe des Nutzers.
- **`hud-check` rot** an der Chat-Fensterlage (`chatNative`/`chatEdited`) – gleicher Fehler auf dem Live-Stand vor dieser Arbeit, gehört zum verschiebbaren Chat.
