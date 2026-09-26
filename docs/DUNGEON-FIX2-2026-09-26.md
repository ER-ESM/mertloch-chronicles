# Dungeon „Schloss Big B“ · Fix 2 nach der Endabnahme · 2026-09-26

Grundlage:
- Endabnahme des Prüfers auf Build #715: `docs/PLAYTEST-2026-09-26-dungeon-endabnahme.md` (unverändert übernommen).
- Vorarbeiten: `docs/DUNGEON-FEINSCHLIFF-2026-09-26.md`, `docs/DUNGEON-ETAPPE-4B-2026-09-25.md`, `docs/DUNGEON-ETAPPE-1-2026-09-25.md`,
  `docs/DUNGEON-RAEUME-2026-09-25.md`.

Zweig `dungeon-fix2`, Worktree `D:\Dev\MertlochChronicles-dg-fix2`, Basis `main` 048cf1aa (Build #714/#715).

**Live:** Build #720 (98bba7c8, 26.09.2026), rebased auf e187379c. Einzelheiten unter „Veröffentlichung“.

| Commit | Inhalt |
|---|---|
| b4afd3af | Laufzeit: Punkte 1, 2, 4, 5, 6 und 9 |
| e03a4029 | Balance und Simulation: Punkte 3 und 7 |
| 98bba7c8 | Testzugang, Prüfskript, Tests, Bericht |

Nicht angefasst:
- Söldner-Instanzfaktor (`COMPANION_RULES.instanceFactor`) und E-72
- `CLAUDE.md`, `docs/ENTSCHEIDUNGEN.md`
- Figurengrafik

## Kurzfassung

- **Raumtitel:** Der Name stand unter der Maus irgendwo im Raum, oben mittig – mitten im Trash-Kampf und in Gerds Arena über seinem Balken.
  - Jetzt steht er in der Welt nur noch an der Messingplakette auf der Wand, beim Überfahren der Plakette selbst und nie im Kampf.
  - Beim Betreten kommt der Zonentitel oben, außerhalb des Kampfs, und verschwindet nach 3,6 s.
- **Söldner-Sprechblasen:** Im Dungeon und in jedem Kampf sprechen Söldner nur im Chat.
- **Erster Trash-Pull:** Die Ursache war nicht die Ausrüstung. Der Funkspruch eines Azubis holte den ganzen Nachbarpack Hof Ost dazu, dann
  lagen sechs Gegner auf der Gruppe. Das ist mit dem Spiel selbst nachgestellt (Browser, Echtzeit, 49 s bis zum Wipe).
  - Der Funkspruch ruft jetzt nur einen Pack in Hörweite (15 m statt 30 m); im Hof reicht das nicht bis Hof Ost.
  - Die Simulation rechnet mit einer **typischen Ausrüstung**, hergeleitet aus Aufträgen und Beute bis Stufe 10, und mit der
    **Startausrüstung** als untere Grenze.
  - Trash-Werte sind neu eingestellt: Mit typischer Ausrüstung fällt in keinem der 27 Packs jemand, mit Startausrüstung höchstens einer.
- **Söldner am Boden:** Im Kampf steht niemand auf. Die Anzeige sagt jetzt „Steht nach dem Kampf auf“ statt „Steht in 0 s wieder auf“.
  Die Regel zählt den Kampf der Gruppe, nicht nur den Abstand zum Helden.
- **Boss-Beute:** Der Beute-Moment wartet, bis der Held lebt, nicht mehr kämpft und in der Arena steht, und öffnet dann. Ein Rechtsklick auf
  eine plünderbare Leiche geht vor einem Söldner an derselben Stelle.
- **Tod des Helden:** Kein CSS-Filter mehr auf der Weltfläche. Der Grauschleier liegt als Fläche im Bild und blendet in 0,6 s ein.
- **Warnzeiten:** Jede Trash-Mechanik zum Ausweichen hat mindestens 2,2 s (Regenrinnen-Hieb 2,4 s).
- **Testzugang:** `scripts/playtest-save.mjs` erzeugt einen Schnipsel mit drei Voreinstellungen (vor dem Dungeon, alle Siegel, vor Big B).
  Nutzung: `docs/PLAYTEST-TESTZUGANG.md`.
- **Nebenbefunde:**
  - Das Auto-Belegen der Leiste mit Verpflegung war nicht entschieden; Beute legt nichts mehr ungefragt auf die Leiste.
  - Ein Klick auf einen ruhenden Chat-Reiter öffnet ihn.

## Ursache und Lösung je Punkt

### 1 · Raumtitel in der Raummitte (`dungeon-art.js`, `zone-announce.js`)

**Ursache:** Es war der Raumname in der Welt, nicht der Zonentitel.
- Etappe 2 hatte ihn „nur unter der Maus“ gesetzt. Gemeint war die Plakette, gebaut war aber der ganze Raum.
- `drawDungeonGround` schrieb Schild und Wirklichkeit, sobald die Maus irgendwo im Raum lag, an die Oberkante des ersten Rechtecks plus 14 E.
- Die Maus liegt beim Spielen immer irgendwo in der Welt. Also stand der Name praktisch dauernd da, im Hof zwischen den Kämpfern, in der
  Zugbrücke genau über Gerd.
- Auf den Bildern `endabnahme-04/-06` liegt er unter den Figuren (Bodenebene) – das ist die Welt-Schrift.
- Der Zonentitel oben (`.region-label`) wartete schon seit Teil B im Kampf.

**Lösung** (wie WoW):
- In der Welt steht nur die kleine Messingplakette an der Nordwand (Lage wie in der Räume-Runde, `plaqueSpots`).
- Schild und Wirklichkeit erscheinen nur, wenn die Maus auf der Plakette liegt (`onPlaque`, 22 × 17 E). Sie stehen auf der Wand über der
  Plakette, nicht im Raum.
- Im Kampf (`dungeonFight`) erscheint auch dort nichts.
- Beim Betreten kommt der Zonentitel oben (164 px von oben bei 900 px Höhe) und verschwindet nach 3,6 s.
  - Wartet er länger als 8 s auf das Kampfende (`ZONE_STALE_MS`), entfällt er, statt mitten im Plündern aufzutauchen.
  - Kurze Wartezeiten holt er nach; Teil B prüft das weiter.
- Die Plakette bleibt an der Nordwand, nicht an einer Tür.
  - Räume haben bis zu vier Türen, manche in Seitenwänden ohne Wandfront.
  - Die Nordwand ist die eine Stelle, die jeder Raum hat und die nie im Raum liegt.

**Geprüft** (`dungeon-fix2-check` Teil 1, echte Maus):
- Maus in der Raummitte → keine Schrift in der Welt; Maus auf der Plakette → „Schlosshof · Doppelgarage mit Pappzinnen“ an der Wand.
- Trash-Kampf im Hof und Gerd-Kampf, Maus auf Raummitte, Plakette, Gegner und Gerd → keine Schrift, kein Zonentitel.
- `dungeon-e2-check` Teil 4 prüft jetzt die Plakette statt der Raummitte.

### 2 · Söldner-Sprechblasen im Kampf (`dungeon-clarity.js`, `enemy-ui.js`)

**Ursache:** `BOSS_FIGHT_BARKS` filterte nur im Bosskampf. Beim Trash stand „Ich… leg mich kurz hin.“ als Blase über dem Kampf.

**Lösung:** `companionBarkQuiet(g)` = im Dungeon oder `partyFighting(g)`. Das heißt: Held im Kampf, ein Söldner im Kampf oder ein Gegner mit
Aggro in Kampfnähe.
- Dann entsteht die Söldner-Blase gar nicht (`BossSpeech.bark`); eine schon stehende verschwindet (`activeBarks`).
- Die Zeile steht wie jede Bark im Chat (`engine.bark` schreibt ins Log).
- Draußen im Ruhezustand bleiben Söldner-Blasen.

`tests/dungeon-e4b.test.mjs` erwartete im Dungeon ohne Kampf noch zwei Blasen; jetzt eine (nur der Boss).

### 3 · Erster Trash-Pull zu hart (`content/dungeons.js`, `dungeon.js`, `scripts/dungeon-sim.mjs`, `scripts/gear-profiles.mjs`)

**Ursache**, nachgestellt:
- Im Browser (live1, Stand 048cf1aa): Stufe 10, Startausrüstung, ohne Spezialisierung, vier Söldner, Hof West vom Kontrollpunkt, langsame Tasten.
  - Nach 5,5 s war ein Funkspruch durch, und Hof Ost (zwei Azubis und ein Ritter) kam dazu.
  - Pils-Peter fiel nach 26 s, Schorle-Susi nach 39 s, der Held nach 40 s; Wipe nach 49 s. Das ist das Bild aus der Endabnahme.
  - Die rechte Gruppe auf `endabnahme-04` ist Hof Ost.
- Dieselbe Szene in Node (`firstPull`): ein Wipe bei Dieter, Bärbel und Schorsch, mit Start- **und** typischer Ausrüstung.
  - Die Ausrüstung des Helden ändert daran fast nichts. Die Söldner tragen den Kampf, und sechs Gegner auf dem Schutz sind zu viel.
- Mit Unterbrechen (nur Hof West) fiel auch mit Startausrüstung niemand.
- Die Simulation sah das nicht: „ein Pack je Zug“ unterbricht jeden Funkspruch, und „Nachbarn ziehen mit“ war nur eine Angabe (35 Wipes).

**Lösung**, nur Dungeon-Gegnerwerte:
1. **Funkspruch:** Hörweite 240 → 120 E (30 → 15 m), Zauberzeit 2,2 → 2,6 s.
   - Im Hof liegen Hof West und Hof Ost 19 m auseinander, der erste Pull bleibt also ein Pack.
   - In der Kanzlei (7–13 m) und im Gewölbe ruft er weiter (Unit-Test).
   - Die Datenfelder `callHelp.max` und `callHelp.once` gibt es jetzt, sie sind aber nicht gesetzt. Ein gerufener Pack kommt über die
     Pack-Aggro ohnehin ganz.
2. **Trash-Werte**, gemessen mit typischer Ausrüstung über alle 27 Packs, fünf Klassen und die Seeds 7–9:

   | Gegner / Mechanik | vorher | nachher |
   |---|---|---|
   | Security-Azubi, Autoangriff | ×3,5 | ×3,0 |
   | Pappschütze, Autoangriff | ×3,0 | ×2,3 |
   | Makler-Praktikant, Autoangriff | ×3,0 | ×2,3 |
   | Baumarkt-Ritter, Leben / Autoangriff | 26.000 / ×2,6 | 25.000 / ×2,2 |
   | Regenrinnen-Hieb: Anteil / „Tank sicher“ | 45 % / ×0,35 (= 15,8 % am Schutz) | 30 % / ×0,5 (= 15 % am Schutz) |
   | Exposé verteilen (Makler), Anteil | 30 % | 20 % |
   | Gleiche Gegner eines Packs | alle zugleich | je weiterer gleicher 2,5 s später (`DUNGEON_PACK_RULES.stagger`) |
   | Pack „Gewölbe Nord“ | 2 Ritter, Makler, Schütze | Ritter, Makler, Schütze |

   - Die häufigsten Ausfälle vorher waren zwei Regenrinnen-Hiebe zugleich auf Söldner vor dem Ritter (45 % je Hieb) und Autoangriffe von vier
     Gegnern auf den Schutz.
   - Der Versatz trifft im Spiel (`dungeonPackAggro`) und in der Simulation (`pull`) dieselbe Regel: `packFirstSpecial`.
3. **Bosse**, nur wo die bestehenden Kriterien mit typischer Ausrüstung rot wurden:
   - Big B 146.000 → 140.000 Leben (vorher 186–209 s)
   - Frau Dr. Exposé 66.000 → 63.000 (vorher 93–111 s)
   - Kanonenkugel 60 % → 70 % Anteil. Nur wer der Behauptung folgt, steht in der echten Bahn; mit weniger Leben heilen die festen Heilungen der
     Söldner einen Anteilstreffer schneller weg, „folgt der Behauptung“ überlebte in drei von neun Läufen.
   - Huftritt 1,6 → 2,0 s (Warnzeit, siehe 7)

Wie „typisch“ und „Start“ entstehen und was die Simulation zeigt, steht im Abschnitt „Simulation mit Ausrüstungsprofilen“.

### 4 · Söldner hängt am Boden (`companions.js`, `companion-ui.js`, `content/companion-ui.js`)

**Ursache:** Beides.
- Das Verhalten war „erst nach dem Kampf“: Aufstehen nur, wenn nach `downSeconds` (25 s) **kein kämpfender Gegner in 360 E um den Helden** stand.
- Die Anzeige zählte aber nur die Frist herunter und stand danach auf „Steht in 0 s wieder auf“.
- Dazu war die Regel schief:
  - Der Held lag als Geist am Ort seines Todes. Zog der Kampf weiter, standen Söldner mitten im Kampf auf (so überlebte die Gruppe des Prüfers).
  - Stand der Kampf beim Helden, hing Radler-Rita bis zum Ende.

**Lösung:** eine Regel für Verhalten und Anzeige, `groupFightOn(g,c)`.
- Der Kampf der Gruppe läuft, solange ein Gegner in Reichweite des Helden **oder des Liegenden** kämpft oder jemanden aus der Gruppe angeht.
- Im Kampf steht niemand auf, wie ein toter Mitspieler in WoW. Die Heilerin hilft nur dem Helden auf, einmal je Kampf.
- Anzeige im Kampf: „Am Boden · Steht nach dem Kampf auf“.
- Ohne Kampf: „Steht in N s wieder auf“, und er steht nach der Frist auf.

**Geprüft:** `dungeon-fix2-check` Teil 4 und Unit-Test (Frist abgelaufen, Kampf läuft → liegt, Anzeige stimmt; Kampf vorbei → steht auf).

### 5 · Boss-Beute schwer zu fassen (`app.js`, `engine.js`, `rpg.js`, `content/combat.js`)

**Ursache:**
- Der Beute-Moment war **ein** `setTimeout` 1,4 s nach dem Sieg, nur wenn der Held lebte.
- Lag der Held dann als Geist oder stand er außer Reichweite (170 E um die Leiche; beim Prüfer „Held auf der Schwelle“), kam kein Fenster,
  auch später nicht.
- Beim Rechtsklick gab es gar keinen Beute-Weg. `selectUnitAt` fand Hopfen-Horst auf der Leiche und öffnete sein Fenster.

**Lösung:**
- **Beute-Moment wartet** (`openLootMoment`):
  - Er öffnet 1,4 s nach dem Sieg, sobald der Held lebt, nicht kämpft (`dg-fight`) und den Beutel erreicht; höchstens 90 s lang.
  - Boss-Beutel kennen ihre Arena (`bag.room`); in der ganzen Arena ist er erreichbar (`game.lootReachable`), wie Etappe 1 es meinte.
  - Die Zahlen stehen in `COMBAT_RULES.lootMoment` mit Glossar-Eintrag.
- **Rechtsklick auf die Leiche:**
  - Klickfläche über dem liegenden Körper (`COMBAT_RULES.lootClick`: ±18 E, 24 E hoch).
  - Sie geht vor einem Söldner oder anderen Freund. Nur ein lebender Gegner an derselben Stelle gewinnt (Kampf geht vor).
  - Außer Reichweite läuft der Held hin.

**Geprüft:** `dungeon-fix2-check` Teil 5, echte Maus.
- Held stirbt, Gerd fällt → kein Fenster.
- „Am Kontrollpunkt aufstehen“ per Klick → Held im Hof, 180 E entfernt, kein Fenster.
- Held betritt die Arena → Fenster öffnet von selbst.
- Rechtsklick auf die Leiche mit Hopfen-Horst darauf → Beutefenster, kein Söldnerfenster.

### 6 · Schwarzes Bild beim Tod (`renderer.js`, `world-light.js`, `spielfluss-r5a.css`, `content/lighting.js`)

**Ursache:** Beim Tod bekam die ganze Weltfläche (`#world`) einen CSS-Filter, und zwar doppelt:
- `applyGrade` (Inline-Stil, `grayscale(.85) brightness(.72)`)
- `body.hero-dead #world` mit `transition: filter .6s`

Ohne Grafikkarte (wie im Browser des Prüfers) rastert der Browser dafür eine eigene Ebene; bis sie steht, blieb die Fläche 1–2 s schwarz.
Namensschilder (eigene Leinwand) und HUD liefen weiter.
- In der kopflosen Prüfung ist das nicht sichtbar, weil deren Bildaufnahme den Compositor umgeht. Belegt ist es durch die Bilder des Prüfers
  und den Aufbau: Das Schwarz betrifft genau die eine gefilterte Fläche.

**Lösung:**
- Kein Filter mehr auf der Weltfläche.
- Der Grauschleier ist eine Fläche im Bild (`drawDeathVeil`): etwas Grau für die Farbe, Dunkel für Licht und Farbe.
- Er blendet in 0,6 s ein (`LIGHTING.deathVeil`), ohne Mischmodi (E-46).
- Die HUD-Leinwände daneben behalten ihren kleinen Filter.

**Geprüft** (`dungeon-fix2-check` Teil 6, Helligkeit der Weltfläche je 100 ms):
- 58 → 56 → 51 → 49 → 47, dann stabil. Nie dunkler als 47, größter Schritt 5.
- Kein Filter; Bilder `50-tod-*.jpg` angesehen.

### 7 · Trash-Warnzeiten (`content/dungeons.js`)

| Mechanik | vorher | nachher |
|---|---|---|
| Schubser (Azubi, Ausweichen) | 1,3 s | 2,2 s |
| Wasserpistole (Pappschütze, Ausweichen) | 1,4 s | 2,2 s |
| Regenrinnen-Hieb (Ritter, nicht davor stehen) | 1,6 s | 2,4 s |
| Exposé verteilen (Makler, Fläche verlassen) | 2,0 s | 2,2 s |
| Buhuu (Schlossgespenst) | 1,8 s | 2,2 s |
| Selfie mit Blitz, Hate-Kommentar (Ritas Helfer) | 1,6 s | 2,2 s |
| Funkspruch (Unterbrechen) | 2,2 s | 2,6 s |
| Huftritt (halbes Pferd, Boss) | 1,6 s | 2,0 s |

- Die Warnleiste zeigt beim Erscheinen des Regenrinnen-Hiebs 2,4 s (Teil 7, Bild `60-warnleiste-hieb.jpg`).
- `dungeon-sim` bleibt grün.
- **Boss-Mechaniken unter 2 s bleiben** (Restliste):
  - Gerds Rausschmiss 1,8 s und der zweite Rausschmiss in Phase 2 mit 1,4 s: Der gewollte Doppelschlag trägt „weicht nie aus stirbt“.
    Mit 2,0 s überlebte ein Lauf.
  - Big Bs Siegelring 1,2 s (Parieren, kein Ausweichen)

### 8 · Testzugang (`scripts/playtest-save.mjs`, `docs/PLAYTEST-TESTZUGANG.md`)

Siehe `docs/PLAYTEST-TESTZUGANG.md`.
- Der Stand entsteht in Node mit der echten Spiellogik und wird mit `game.save()` geschrieben.
- Der Schnipsel ruft auf `/precache-manifest.js` nur `createCharacter`, `storeRoster` und `characterKey` auf.
- Laufstand und Tagesstand setzt er beim Ausführen auf „jetzt“.

Teil 8 prüft alle drei Voreinstellungen im Browser. Teil 3 spielt mit „vor“ den ersten Pull wie der Prüfer.

### 9 · Prüfen, nicht blind ändern

**Notfallbrezel auf Leistenplatz 0:**
- `docs/ENTSCHEIDUNGEN.md` sagt nichts dazu. Nach `CLAUDE.md` gilt: Was dort nicht steht, ist nicht entschieden.
- Der `git log` zeigt das Auto-Belegen als Umsetzung der Welle D: 31ee21ce „Verpflegung auf der Aktionsleiste“, Übergabe §8.1 „einmalig,
  Tasten 9/0“.
  - Der Backlog-Eintrag dazu verlangte nur, dass Leistenplätze Verpflegung **aufnehmen können**.
  - Die Hilfe sagt „Verpflegung ziehst du aus dem Rucksack auf einen freien Platz der Aktionsleiste.“
- **Nicht entschieden → abgestellt:**
  - Beute (`autoLootBag`), Einkauf bei Kalle, Rückkauf und Handwerk legen nichts mehr auf die Leiste.
  - Nur ein Held **ohne eigene Leistenbelegung** (erster Start) bekommt seine Startverpflegung auf die hinteren Plätze. Das ist die
    Startausstattung, wie die Tests sie erwarten.

**Chat-Reiter in Ruhe:**
- Seit E-72 R5 ist die ruhende Kopfleiste durchlässig; sie öffnet erst nach 350 ms Verweilen.
- Ein direkter Klick (Playwright, schnelle Spieler) ging deshalb in die Welt.
- Jetzt öffnet ein Klick **genau auf einen Reiter** das Fenster mit diesem Reiter und geht nicht in die Welt.
- Daneben bleibt die Leiste durchlässig (Zweck von E-72 R5). Der Test aus E-72 prüft beides.

## Simulation mit Ausrüstungsprofilen

### Herleitung der typischen Ausrüstung (`scripts/gear-profiles.mjs`)

400 Leveldurchgänge von Stufe 1 bis 10 mit den Daten aus `content/` und der Beute-Logik des Spiels (`rollDrop`, `questChoices`):

| Quelle | Daten | im Leveln bis 10 |
|---|---|---|
| EP bis Stufe 10 | `BALANCE.xpPerLevel` 140 × Stufe | 6.300 EP |
| Nebenaufträge | `WORLD_RULES.quests.count` 6, EP 180/220 (`BALANCE.xp.quest`) | 1.160 EP, je ein Teil ungewöhnlich auf Heldenstufe: Waffenplatz (Wahl), Kopf, Brust, Ring, Füße, Talisman (`questChoices`) |
| Kapitel 1 (einzig gebautes) | `STORY_CHAPTERS[0].reward` 600 EP, `gear:'rare'` | ein seltenes Teil (Schultern) |
| Horst Nüchternmann | `DROP_TABLES.horst` 85 % Ausrüstung | meist ein Teil auf Stufe 4 |
| Feldzüge | `SPAWN_TABLES` (aggressiv 48 %: Keiler, Ruhewart, Fuchs, Schnorrer, Praktikant; neutral: Dachs, Gans, Rabe), `killXp` 30/45 | rund 130 Kills, darunter rund 25 Menschen mit 14–22 % Ausrüstung auf 14 Plätzen, Tiere nur Talismane |
| Stufe der Beute | `scaledStats`: Heldenstufe − 2 (`playerLead`) | Beute meist Stufe 3–7 |
| Güte | `BALANCE.items.rareChance` 22 % | |

Annahmen, die nicht in `content/` stehen (`LEVELING`):
- Die sechs Nebenaufträge werden paarweise auf Stufe 2, 5 und 8 erledigt; sie liegen nah am Treffpunkt, bei 1000 und bei 1600 E.
- Kapitel 1 endet auf Stufe 5.
- Ab Stufe 4 jagt der Held jenseits von 900 E (Tier-1-Arten).

Anlegen: je Platz das Teil mit den meisten Wertpunkten.

Das Profil nimmt jeden Platz, der in mindestens der Hälfte der Durchgänge gefüllt ist. Dazu kommen so viele der übrigen Plätze, wie ein Held
im Mittel davon trägt (Durchschnittsheld, nicht Bestfall):

| Platz | gefüllt | Stufe (Median) | selten | typisch |
|---|---:|---:|---:|---|
| Waffe (Nahkampf) bzw. Fernwaffe (Fernkampf) | 100 % | 2 | 8 % | ungewöhnlich 2 (Auftrag 1) |
| Kopf | 100 % | 2 | 8 % | ungewöhnlich 2 |
| Schultern | 100 % | 5 | 100 % | selten 5 (Kapitel 1) |
| Brust | 100 % | 5 | 7 % | ungewöhnlich 5 |
| Ring 1 | 100 % | 5 | 6 % | ungewöhnlich 5 |
| Füße | 100 % | 8 | 4 % | ungewöhnlich 8 |
| Talisman 1 | 100 % | 8 | 3 % | ungewöhnlich 8 |
| Talisman 2 (Tier-Talisman) | 100 % | 7 | 61 % | selten 7 |
| Hals | 39 % | 4 | 25 % | ungewöhnlich 4 (Zufallsplatz) |
| Hände | 35 % | 5 | 21 % | ungewöhnlich 5 (Zufallsplatz) |
| Fernwaffe (Nahkampf) bzw. Beine (Fernkampf) | 36 % / 35 % | 5 | 21 % | ungewöhnlich 5 (Zufallsplatz) |
| Schild, Handgelenke, Gürtel, Beine, Ring 2 | 33–35 % | 5 | 3–32 % | leer bzw. Startausrüstung |

**Profile im Vergleich**, Held Stufe 10, Kneipenschläger:

| Profil | Plätze | Leben | Rolle |
|---|---:|---:|---|
| Start (`TUTORIAL.starterEquipment`) | 4 | 1.005 | untere Grenze |
| typisch | 11 (Fernkampf 13) | 1.365 | Vorgabe der Simulation (`SIM_GEAR`) |
| voll (bisher) | 16 | 1.965 | obere Grenze, `SIM_GEAR=uncommon` |

- Die bestehenden Kriterien laufen jetzt mit typischer Ausrüstung.
- Die Bänder bleiben gleich (Flügel 10–15 min, Bosse 70–110 s, Big B 150–200 s, EP 1–2× Feld).
- Die Begründung: Sie beschreiben, wie lange ein Kampf für einen echten Spieler dauern soll, und der hat die typische Ausrüstung.

### Neue Kriterien (`--only=gear`)

- **Typische Ausrüstung, jeder Pack sorgfältig** (unterbricht, weicht aus): kein Wipe, kein Tod, kein Söldner am Boden. Dazu kostet ein Pack
  den Heiler spürbar: Im Median ist mindestens 25 % des Gruppenlebens geheilt.
  - Die Söldner haben kein Mana, deshalb zählt geheiltes Leben.
- **Startausrüstung, jeder Pack:** kein Wipe, höchstens ein Ausfall.
- **Erster Pull wie ein Neuling:** Hof West vom Kontrollpunkt, kein Unterbrechen, Nachbarn stehen, Fernkämpfer auf Wurfweite. Typische
  Ausrüstung ohne Ausfall, Startausrüstung ohne Wipe.
- **Startausrüstung, jeder Boss:** gewonnen, höchstens mit einem zweiten Versuch (wie im Flügel-Lauf), höchstens ein Tod des Helden.

Bewertet werden die drei Stammklassen; Schorsch und Käthe stehen als Angabe dabei.

### Ergebnisse

`node scripts/dungeon-sim.mjs` (alle Teile), `--only=wings` (fünf Klassen, seriell) und `SIM_GEAR_SEEDS=7,8,9 --only=gear`. Alle Kriterien grün;
Stand nach dem letzten Wert.

**Trash je Profil:** 27 Packs, fünf Klassen, sorgfältig.

| Profil | Pulls | Pulls mit Ausfall | Wipes | Heilung an der Gruppe je Pack (Median) |
|---|---:|---:|---:|---:|
| typisch, vorher (Werte von `main`, Seed 7) | 135 | 13 | 5 | 48 % |
| Start, vorher (Seed 7) | 135 | 21 | 4 | 54 % |
| **typisch, nachher** (Seeds 7–9) | 405 | **0** | 0 | 40 % (leichtester Pack 7 %, schwerster 96 %) |
| **Start, nachher** (Seeds 7–9) | 405 | **1** (Weinkeller-Fass, Bärbel: ein Söldner) | 0 | 46 % |
| voll (Angabe, Seeds 7–9) | 405 | 0 | 0 | 33 % |

- Vorher fielen die Ausfälle auf die Packs mit Ritter und Makler: Gewölbe Nord wipte bei vier von fünf Klassen, dazu Hof Nordost,
  Weinkeller-Fass und Gewölbe Ost.
- „Spürbar“ heißt mit typischer Ausrüstung:
  - Im Median heilt die Heilerin 40 % des gesamten Gruppenlebens je Pack.
  - In den schweren Packs (Ritter, Makler, Schütze) sinkt der tiefste Söldner zeitweise unter 30 %.
  - Leichte Packs (Ratten, Wehrgang) kosten 7–25 %.

**Erster Pull wie ein Neuling** (Hof West ohne Unterbrechen, Nachbarn stehen, je Klasse Seeds 7–9):

| | vorher, typisch | vorher, Start | nachher, typisch | nachher, Start |
|---|---|---|---|---|
| Dieter, Bärbel, Schorsch | Wipe (Hof Ost kam dazu) | Wipe | kein Ausfall | kein Ausfall |
| Kevin, Käthe (Fernkampf, bleiben auf Wurfweite) | kein Ausfall | Kevin kein Ausfall, Käthe ein Söldner am Boden | kein Ausfall | kein Ausfall |

Im Browser in Echtzeit (Teil 3, typische Ausrüstung, Rechtsklick, Tasten, kein Unterbrechen):
- nur Hof West, kein Tod, kein Söldner am Boden, tiefster Söldner 58 %
- vorher mit Startausrüstung: Wipe nach 49 s

**Bosse** (Held mit vier Söldnern, „spielt richtig“, Seeds 7–9, Stammklassen, Sekunden):

| Boss | voll, `main` | typisch, vorher | **typisch, nachher** | Start, nachher (Tode) |
|---|---|---|---|---|
| Gästeliste-Gerd | 79–87 | 88–107 (rot) | **88–91** | 93–96 (0) |
| Frau Dr. Exposé | 83–105 | 93–111 (rot) | **91–107** | 95–96 (0) |
| Korken-Kurt | 87–92 | 96–102 | **96–102** | 100–103 (0) |
| Reichweiten-Rita | 84–97 | 91–106 | **91–106** | 98–109 (0) |
| Das halbe Pferd | 71–83 | 81–102 (2 Tode, rot) | **80–87** | 86–91 (0; Kevin im 2. Versuch) |
| Big B | 163–189 | 186–209 (rot) | **177–197** | 195–278 (0) |

- „Ignoriert Mechanik“ bzw. „folgt der Behauptung“ stirbt weiter in jedem Lauf (Big B 1–2, sonst 1–2); „spielt richtig“ höchstens einmal.
- Mit Startausrüstung dauert Big B bei Bärbel 278 s: schwer, aber ohne Tod.
- Das halbe Pferd mit Kevin (Seed 7) ging verloren: Der Schutz fiel, und ohne Schutz zieht niemand das Pferd vom Trog, es heilt sich voll.
  Im zweiten Versuch 88 s ohne Tod.

**Flügel** (`--only=wings`, seriell, typische Ausrüstung, Minuten):

| Klasse | Burghof | Rittergeschoss | Basaltgewölbe | Big B | voller Durchgang | Rita im Flügel |
|---|---:|---:|---:|---:|---:|---:|
| Dieter | 12,0 | 12,1 | 10,9 | 2,4 | 37,5 | 83 s |
| Bärbel | 11,8 | 14,8 | 10,9 | 2,3 | 39,9 | 88 s |
| Kevin | 11,8 | 11,5 | 12,2 | 2,5 | 38,2 | 81 s |
| Schorsch | 12,7 | 11,6 | 10,8 | 2,3 | 37,5 | 84 s |
| Käthe | 10,9 | 11,7 | 10,2 | 2,3 | 35,1 | 98 s |

- EP je Minute: Wiederholung 98–163, erster Lauf des Tages 181–280, Feld 84.
- Rückweg höchstens 2,5 s.
- Bärbel im Rittergeschoss 14,8 min: das halbe Pferd am Trog, wie im Feinschliff (Restliste).
- Die Ritter haben 25.000 statt 23.000 Leben: Mit 23.000 lag Käthe im Basaltgewölbe bei 10,0 min.

**Änderungen an der Simulation selbst** (Messung, nicht Spiel):
- **Fortschritt eines Kampfs:** zählt über alle Gegner, die je mitkämpften.
  - Vorher setzte jeder Nachzügler (Streife, Pack-Zug) den Maßstab zurück.
  - Die Galerie-Streife galt nach 30 s als festgefahren; ihre Gegner liefen zurück und zählten als erledigt.
- **Wer sorgfältig spielt**, geht nicht in eine laufende Bodenfläche zurück und zaubert nicht, während er aus einer läuft.
  - Vorher lief Kevin nach dem Ausweichen gleich wieder hinter das halbe Pferd ins Wiehern und starb zweimal.
- **Der Pack-Zug** nutzt dieselbe Staffelung wie das Spiel (`packFirstSpecial`).

## Prüfungen

Ports CDP 9700–9709, Server 4500–4509, `BOOT_TRIES=450`. Der Rechner war durch parallele Sitzungen belastet (rund 50 % Last, 30 Node- und
32 Chrome-Prozesse fremder Sitzungen).

| Prüfung | Ergebnis |
|---|---|
| `npm test` | grün (1238, davon 12 neu in `tests/dungeon-fix2.test.mjs`; angepasst: `dungeon-e4b.test.mjs`, `e72-klicks.test.mjs`) |
| `npm run content:check` | grün (57) |
| `npm run build` | grün |
| `npm run ui:check` | grün (14) |
| `dungeon-check` | grün, Desktop und Handy |
| `dungeon-e1-check` | grün (7) |
| `dungeon-e2-check` | grün (17; Teil 4 prüft jetzt die Plakette statt der Raummitte) |
| `dungeon-e3-check` | grün (14) |
| `dungeon-e4a-check` | grün (36) |
| `dungeon-e4b-check` | grün (11) |
| `dungeon-hotfix-check` | grün (8) |
| `dungeon-raeume-check` | Teile 1–5 grün. Teil 6 (Bildzeit): im Gesamtlauf zweimal rot unter Last (Median 33 ms im Keller 2); allein grün (16,7 ms), gleichauf mit `main` im selben Zeitfenster |
| `dungeon-sim` (alle Teile) | alle Kriterien grün (Tabellen oben) |
| `dungeon-sim --only=wings` | grün (15 Flügelwerte 10,2–14,8 min) |
| `dungeon-sim --only=gear`, Seeds 7–9 | grün (neue Kriterien) |
| `mobile-check` Teil `dungeon` | grün (10 Schritte, 0 Befunde) |
| **`dungeon-fix2-check`** (neu) | grün (15 Prüfungen, Teile 1–9, echte Maus) |

Bilder `visual-review/dungeon-fix2/*.jpg`, angesehen:

| Bild | zeigt |
|---|---|
| `01-zonentitel-oben.jpg` | Zonentitel „Schlosshof“ oben beim Betreten |
| `02-plakette-unter-der-maus.jpg` | Name nur an der Plakette auf der Wand |
| `03-trash-kampf-ohne-titel.jpg` | Trash-Kampf ohne Titel und ohne Welt-Schrift, Warnleiste mit 2,5 s und 2,3 s |
| `04-gerd-ohne-raumname.jpg` | Gerd-Kampf, kein Name über dem Balken |
| `10-soeldner-am-boden-nur-im-chat.jpg`, `11-draussen-ruhe-blase.jpg` | Söldner-Zeilen |
| `20`–`22` | erster Pull wie der Prüfer: Eingangskarte, Kampf, danach |
| `30-am-boden-nach-dem-kampf.jpg` | „Am Boden · Steht nach dem Kampf auf“ |
| `40-beute-moment-arena.jpg`, `41-rechtsklick-leiche.jpg` | Beute-Moment, Rechtsklick auf die Leiche |
| `50-tod-*.jpg` | weicher Grauschleier, kein Schwarz |
| `60-warnleiste-hieb.jpg` | Regenrinnen-Hieb mit 2,4 s |
| `70-testzugang-*.jpg` | drei Voreinstellungen geladen |
| `80-chat-reiter-geklickt.jpg` | Chat-Reiter per Klick |

## Geänderte Dateien

| Bereich | Dateien |
|---|---|
| Laufzeit | `dungeon-art.js` (Plakette, Name nur dort und nicht im Kampf), `zone-announce.js` (veralteter Titel entfällt), `dungeon-clarity.js` (`partyFighting`, `companionBarkQuiet`), `enemy-ui.js` (Söldner-Blasen), `companions.js` (`groupFightOn`), `companion-ui.js` (Anzeige am Boden), `dungeon.js` (Funkspruch `max`/`once`, `packFirstSpecial`), `engine.js` (`lootReachable`, Startverpflegung nur beim ersten Start), `rpg.js` (Beute legt nichts auf die Leiste, `bag.room`), `shop.js`, `professions.js` (nichts ungefragt auf die Leiste), `app.js` (Beute-Moment wartet, Rechtsklick auf Leichen), `renderer.js` (`drawDeathVeil`), `world-light.js` (kein Todesfilter), `chat-window.js` (Klick auf ruhenden Reiter) |
| Oberfläche | `spielfluss-r5a.css` (kein Filter auf `#world` beim Tod) |
| Daten | `content/dungeons.js` (Trash-Werte, Warnzeiten, Funkspruch, `DUNGEON_PACK_RULES`, Gewölbe Nord, Big B, Exposé, Kanonenkugel, Huftritt), `content/combat.js` (`lootClick`, `lootMoment` mit Glossar), `content/companion-ui.js` (`recoveryFight`), `content/lighting.js` (`deathVeil`) |
| Prüfungen | `scripts/gear-profiles.mjs` (neu), `scripts/playtest-save.mjs` (neu), `scripts/dungeon-fix2-check.mjs` (neu), `tests/dungeon-fix2.test.mjs` (neu, 12 Tests), `scripts/dungeon-sim.mjs` (Profile, Teil `gear`, Fortschritt über alle Kämpfer, sorgfältig nicht zurück in Flächen), `scripts/dungeon-e2-check.mjs` (Plakette), `tests/dungeon-e4b.test.mjs`, `tests/e72-klicks.test.mjs` |
| Doku | `docs/DUNGEON-FIX2-2026-09-26.md`, `docs/PLAYTEST-TESTZUGANG.md`, `docs/PLAYTEST-2026-09-26-dungeon-endabnahme.md` (Prüferbericht, unverändert) |

## Restliste

1. **Schwarzes Bild:**
   - Kopflos nicht nachstellbar: Die Bildaufnahme dort umgeht den Compositor, auch vorher war kein Schwarz zu sehen.
   - Die Lösung folgt der Ursache (kein Filter mehr auf der großen Fläche).
   - Ein Blick im sichtbaren Browser ohne Grafikkarte (wie beim Prüfer) steht aus.
2. **Boss-Mechaniken unter 2 s:** Rausschmiss 1,8 s und der Doppelschlag in Phase 2 mit 1,4 s; Siegelring 1,2 s (Parieren). Sie bleiben, weil
   „weicht nie aus stirbt“ daran hängt. Wenn auch Bosse auf ≥ 2,0 s sollen, braucht Gerd einen anderen Druck.
3. **Das halbe Pferd ohne Schutz:** Fällt der Schutz-Söldner, zieht niemand das Pferd vom Trog; es heilt sich voll.
   - Mit Startausrüstung ging deshalb ein Lauf von Kevin verloren (zweiter Versuch 88 s).
   - Bärbel braucht im Rittergeschoss 14,8 min.
   - Vorschlag: Spott des Helden holt es auch vom Trog, oder das Trinken endet, wenn kein Schutz lebt.
4. **Typische Ausrüstung** ist eine Herleitung aus den Daten, keine Messung an Spielern.
   - Annahmen: Auftragsstufen 2/5/8, Kapitel 1 auf Stufe 5, Beute-Mix nach Spawn-Tabelle.
   - Mit Kapitel 2–4 und Handwerk verschiebt sich das Profil. `typicalGearStudy` rechnet dann von selbst neu, die Flügelzeiten und Kriterien
     sollten danach neu gemessen werden.
5. **Doppelzug bleibt möglich** in engen Räumen (Kanzlei, Gewölbe), wenn niemand unterbricht.
   - „Nachbarn ziehen mit“ ist weiter nur eine Angabe: 45–56 min, viele Wipes.
   - Ein Neuling lernt den Funkspruch jetzt im Hof ohne Strafe; der erste echte Doppelzug droht in der Kanzlei.
6. **Söldner stehen nur nach dem Kampf auf.** Ein Söldner, der in einem langen Bosskampf fällt, fehlt bis zum Ende. Das ist gewollt (WoW) und
   in der Simulation gemessen; im Playtest darauf achten, wie sich das anfühlt.
7. **Plakette an der Nordwand, nicht an der Tür:**
   - Räume haben bis zu vier Türen, manche in Seitenwänden ohne Wandfront.
   - Eine Plakette neben der Haupttür wäre ein Grafik-Auftrag (Wandstück je Tür).
8. **Nicht beauftragte Nebenbefunde des Prüfers**, nicht angefasst:
   - Nach Ziel und Autoangriff läuft der Held nicht selbst heran.
   - Nach dem Neuladen steht ein Tooltip offen.
   - „Erinnerung · Der Stempel“ beim ersten Start im Dorf.
   - Dazu gesehen: Trash-Beute legt freie **Ausrüstungs**plätze weiter selbst an („Angelegt: … der Platz war frei“); nur die Boss-Beute ist davon ausgenommen.
9. **Testzugang mit Konto:** Nur als Gast geprüft. Angemeldet kann ein Wolkenstand den lokalen überdecken (Doku).
10. **Playtest:** Ein Prüfer-Durchgang bis Big B mit dem Testzugang (`--preset=bigb`) ist offen.

## Veröffentlichung

- `git fetch && git rebase origin/main` (e187379c). Konflikt nur in `precache-manifest.js`: `main`-Stand genommen, dann `npm run build`.
- Danach `npm test` (1244) und `content:check` (57) grün.
- `git push origin dungeon-fix2:main` (e187379c..98bba7c8), `node scripts/server-refresh.mjs` → live **#720 · 98bba7c8**.
- Gegen die Live-Seite nachgeprüft (`CHECK_URL=https://mertloch.esm-consultant.de/`):
  - `dungeon-fix2-check` Teil 1 (Raumtitel, 4 grün)
  - Teil 8 (Testzugang auf `/precache-manifest.js`, alle drei Voreinstellungen, grün)
