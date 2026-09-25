# Dungeon „Schloss Big B“ · Etappe 1 „Gerd richtig“ · 2026-09-25

Grundlage: E-71 (`docs/ENTSCHEIDUNGEN.md`), Bauplan Etappe 1 und die Verbesserungen 1, 2, 3, 7 (Gerd) und 8 aus
`docs/DUNGEON-ANALYSE-2026-09-24.md`. Branch `dungeon-e1`, Worktree `D:\Dev\MertlochChronicles-dg-e1`.
Etappe 2 („Lesbar wie WoW“: Warnleiste, Journal, Eingangskarte, Text-Diät, Handy-Kampfansicht) lief parallel und ist hier nicht enthalten.

## Kurzfassung

- Söldner sind im Dungeon fast vollwertig: Ein Schadens-Söldner macht 210–250 Schaden/s statt 52, das sind rund 85 % eines Helden.
  Draußen bleiben sie unverändert.
- Gerd dauert mit Held und vier Söldnern **76–96 s** statt 261–294 s.
- Seine Mechaniken haben Folgen:
  - Rausschmiss nimmt 60 % des Lebens. Wer vorn stehen bleibt, bekommt „Hausverbot“, und jeder weitere Rausschmiss in 20 s trifft härter.
  - Kreise und die Liste treffen zufällige Nicht-Tanks.
  - Der Kegel endet an der Wand.
  - Die Treppenkante wirft erst ab Phase 2 hinaus und zeigt dann eine Warnlinie.
- Der Tod des Helden ist kein Wipe mehr: Er wird Geist, die Söldner kämpfen weiter, Schorle-Susi oder Tresen-Tina helfen ihm nach 8 s mit 35 % Leben auf.
- Trash kommt in festen Packs: Soziale Aggro gilt nur im eigenen Pack.
- Der Laufstand überlebt das Neuladen.
- Gerd hat eigene Beute mit Beute-Moment, 2 Siegelmarken, einen Tagesbonus und 600 EP.
- `scripts/dungeon-check.mjs` ist wieder grün. Die Ursache lag im Renderer: Leichen mit Canvas-Filter drückten die Bildrate ohne Grafikkarte auf 5 Bilder/s.

## Stand je Punkt

| # | Punkt | Stand |
|---|---|---|
| 1 | Zahlen und Söldnerstärke | erledigt |
| 2 | Mechanik mit Folgen | erledigt |
| 3 | Trash in festen Gruppen | erledigt (Welt nur vermerkt) |
| 4 | Tod des Helden ist kein Wipe | erledigt |
| 5 | Laufstand überlebt Neuladen, Grundgerüst Flügel und Tagesreset | erledigt |
| 6 | Beute und EP für Gerd | erledigt; EP je Minute deutlich über dem Feld, siehe unten |
| 7 | `difficulty` im Datenmodell | erledigt |
| 8 | `dungeon-check` „Laufen im Hof“ | erledigt |
| Nachtrag | Autopilot bei Söldnerkämpfen | erledigt |

### 1 · Zahlen und Söldnerstärke

- `COMPANION_RULES.instanceFactor = {damage:4.8, heal:2.5, health:1.8}`, angewendet in `companions.js` `refreshStats` nur bei `inDungeon(g)`. Beim Betreten und Verlassen rechnet der Söldner um und behält seinen Lebensanteil.
- Heilung läuft über eigene Werte (`c.heal`), damit der Schadensfaktor die Heilung nicht mitzieht.
- Gemessen gegen Gerd (Söldner allein, 60 s): Radler-Rita 219, Hopfen-Horst 211, Pils-Peter 137 und Schorle-Susi 77 Schaden/s, damals mit Faktor 4,5. Mit 4,8 liegt ein Schadens-Söldner bei rund 230, ein Held auf Stufe 10 (ungewöhnlich) bei 200–330.
- Gerd:
  - 65.000 Leben.
  - Schaden ×3,5 auf den Autoangriff (74 Schaden/s auf den Tank).
  - Adds bei 50 % und 25 % mit 35 % Leben („der Neffe“).
- Trash-Leben und -Schaden neu:
  - Security-Azubi 13.000
  - Makler 12.000
  - Pappschütze 8.500
  - Baumarkt-Ritter 26.000
  - Pfandratte 2.600
  - Schadensfaktoren 2–3,5, feste Zauberschäden als Anteil am Leben
- Ein Pack dauert 19–37 s, der Rittersaal-Süd mit zwei Rittern 62 s. Der Heiler heilt je Pack 800–6.000 Leben, und niemand fällt. Damit ist der Orchestrator-Nachtrag „Trash muss mehr können“ umgesetzt.
- `scripts/dungeon-sim.mjs` (übernommen aus `_review`, erweitert): Seeds 7, 8, 9, Klassen Dieter (Kneipenschläger), Bärbel (Filter-Furie) und Kevin (Pfandjäger). Das Skript prüft alle Kriterien und endet mit Code 1, wenn eines rot ist.

### 2 · Mechanik mit Folgen

- **`pct`**: Schaden als Anteil am Höchstleben. Rüstung zählt dabei nicht, Deckung, Schilde und Schutz-Kniffe wirken wie gewohnt (`engine.js hitPlayer(e,n,avoidable,share)`, `dungeon.js strike`).
  - Rausschmiss 0,6
  - Dresscode 0,35
  - Liste 0,3
  - Trash: Schubser 0,25, Funkspruch 0,15, Wasser 0,2, Dauerspritzer 0,25, Regenrinnen-Hieb 0,45, Exposé 0,3
  - Abweichung: Rausschmiss 0,6 statt Richtwert 0,55, weil 0,55 das Kriterium „weicht nie aus“ nicht zuverlässig erfüllte.
- **Hausverbot** (`brand`): Wer vom Rausschmiss getroffen wird und nicht Gerds Ziel ist, trägt 20 s ein Mal. Jeder weitere Treffer kostet +60 % je Stapel. Wer ausweicht, merkt nichts davon; wer stehen bleibt, stirbt beim dritten Mal. Das Mal wird als Kampftext „HAUSVERBOT ×2“ gezeigt.
- **Phase 2 wie im Plan 7.1:** Rausschmiss zweimal hintereinander mit 1 s Abstand. Dafür gibt es `gaps` am Zaubermuster (Abstand nach dem Zauber an dieser Stelle des Zyklus statt `specialInterval`). Wer nach dem ersten vorn bleibt, trägt beim zweiten schon Hausverbot.
- **`target:'random'`**: Dresscode und Liste treffen einen zufälligen Nicht-Tank in Sichtweite, also den Helden oder einen Söldner ohne Schutz-Rolle, nie den Halter (`dungeonCastSpot`). Dungeon-Flächen treffen jetzt jeden darin, Held und Söldner.
- **Kegel mit Sichtlinie** (`coneReach`): 15 Strahlen je Kegel, jeder endet an der ersten Wand. Treffer (`inCone`) und Warnfläche (`dungeon-art.js drawConeWarning`) lesen dieselben Strahlen und sind damit deckungsgleich.
- **Treppenkante:**
  - Sie wirft erst ab 50 % Leben hinaus (`fall.below`). Dann liegt eine gestrichelte rote Warnlinie auf der Kante.
  - Wer fällt, ist raus. Die Söldner halten Gerd weiter, und die Kellertreppe führt von unten zurück in die Arena (`dungeonStep`: Nur Gegner, die den Helden angehen, sperren die Treppe).
- Nebenbei behoben:
  - Adds erscheinen immer in der Arena, vorher teils im Hof hinter der Wand.
  - Ein Boss ohne Gegner in seinem Raum setzt zurück, statt hinter geschlossener Tür ewig im Kampf zu stehen.
  - Bosse bemerken den Helden nur in ihrem Raum.
  - Wird der Held an die Wand gedrückt, sucht `findPath` den nächsten freien Punkt. Vorher blieb Gerd stehen und zauberte nie wieder (Befund von Etappe 2).

### 3 · Trash in festen Gruppen

- Die Packs haben IDs in `content/dungeons.js`, z. B. `hof-west` und `kanzlei-nord`. Die Mitglieder tragen `e.pack`.
- Im Dungeon ersetzt `dungeonPackAggro` die Kette „Kumpel kommt“ der offenen Welt (`engine.js`): Kämpft ein Mitglied, kommt der ganze eigene Pack sofort, ein Nachbarpack nie.
- Der Funkspruch bleibt eine Mechanik mit Gegenmittel (Q unterbricht). Er ruft den eigenen Pack und höchstens den nächsten fremden Pack im selben Raum. Wer gerufen wurde, ruft nicht weiter. Adds von Gerd rufen gar nicht.
- **Offene Welt, nur vermerkt:** Draußen gilt die Kette weiter. Ein Keiler zieht Nachbarn im Abstand `BALANCE.procs.chainJoinRange` nach, diese wieder ihre Nachbarn. Das ist Kenner-Befund 7 (1 Pull, 9 Gegner) und bleibt eine offene Balancing-Frage für die Welt.

### 4 · Der Tod des Helden ist kein Wipe

- `engine.js tick` läuft im Dungeon weiter, wenn der Held fällt. Der Körper bleibt liegen, die Kamera bleibt auf ihm, und die Welt wird entsättigt dargestellt (Geist).
- Niemand greift den Körper an. Bedrohung auf den Helden fällt weg, und die Gegner wenden sich den Söldnern zu (`companionFocus`).
- Heilung, Regeneration und Steuerung sind für den Geist gesperrt.
- **Aufhelfen:** Neue Söldner-Fähigkeit `revive` mit `cast:8` und `share:.35`, bei Schorle-Susi und Tresen-Tina. Einmal je Kampf; ein Ausweichschritt oder das eigene Umfallen bricht ab. Danach kämpft der Held mit 35 % Leben weiter (`reviveHero`, wie `reviveHere` aus E-44, aber ohne Gegner-Reset).
- **Wipe:** erst wenn alle liegen. Dann setzen die Gegner zurück. Oder der Held wählt „Am Kontrollpunkt aufstehen“, das ist das Freilassen.
- **Todesbildschirm im Dungeon:**
  - schmal und oben, damit der Kampf sichtbar bleibt
  - Streifen „Söldner kämpfen weiter“, „Schorle-Susi hilft dir auf“ mit Fortschritt, oder „Alle am Boden“
  - Fahne mit dem Namen des Kontrollpunkts
  - Knopf „Am Kontrollpunkt aufstehen“
  - Erklärungen nur im Tooltip

### 5 · Laufstand überlebt Neuladen

- `savedDungeonRun()` speichert im Spielstand unter `dungeonRun`: `killed`, `seals`, `secrets`, `visited`, `unlocked`, `checkpoint`, `startedAt`, dazu `trash` (geräumte Packs), `heard`, `difficulty`, `day`, `inside`, `leftAgo` und `savedAt`.
- Beim Laden setzt `restoreDungeonRun` fort, sofern `resetAfter` (30 min) nicht abgelaufen ist und der Tag passt. Wer drin war, steht wieder am letzten Kontrollpunkt. Gelegtes bleibt ohne Leiche und ohne Beute liegen.
- **Grundgerüst für Etappe 4:**
  - Daten: `resetAt:'daily'`, `resetHour:4`, `wings` (Burghof/Gerd, Rittergeschoss/Exposé, Basaltgewölbe/Kurt).
  - Laufzeit: `dungeonDay` und `dungeonToday`. Siegel, Abkürzungen (Aufzug) und abgeschlossene Flügel bleiben unter `dungeons[id].daily` bis zum Tagesreset, auch wenn ein Durchgang nach 30 min verfällt.
  - Keine Sperre: Gerd steht im neuen Durchgang wieder.

### 6 · Beute und EP für Gerd

- **Beutetabellen** in `content/drops.js`:
  - `gerd`: Kabelbinder, 85 % Ausrüstung, davon 60 % selten. `items` ist die Vorschau für Journal und Eingangskarte aus Etappe 2 (Gästeliste, Kabelbinder, Currywurst). Neue Dorflegende „Die Gästeliste“ (Talisman, Stufe 9, 15 %, Proc „Ruhe!“ fürs Unterbrechen). Fällt kein Teil, legt der Dungeon ein seltenes nach (`rpg.js dungeonBossBonus`).
  - `schlosstrash`: Flugblätter, 16 % Ausrüstung, Praktikantenausweis zu 1 %.
  - Eigene Familien statt `sigi`, `inspector` und `warden`.
- **Siegelmarken:** 2 je Boss, Zähler `dungeons[id].marks`. Der Händler folgt in Etappe 4.
- **Tagesbonus:** beim ersten Abschluss eines Flügels am Tag +50 % der Boss-EP und +2 Siegelmarken (`DUNGEON_REWARDS`).
- **Boss-EP:** Gerd 600 (Feld `xp`, `killXp` liest es). Trash-EP wie im Feld: Mensch 45, Elite 90, Ratte 12, Pappe 5.
- **Beute-Moment:**
  - Boss-Beute bleibt als Beutel liegen und öffnet sich 1,4 s nach dem Sieg als Fenster. Im Kopf stehen Boss, Siegelmarken, EP und Tagesbonus-Symbol, die Erklärung steht im Tooltip.
  - Das Fenster lässt sich in der ganzen Arena öffnen (Reichweite 170).
  - **Nichts wird ungefragt angelegt:** `bag.noEquip` in `autoLootBag` und `takeLoot`, auch beim Einsammeln am Ausgang.
  - Die F-Taste greift weiter nur direkt am Beutel.
- **Befund:** Draußen legt Auto-Loot weiter Funde in freie Plätze. Das bemängelte der Kenner, es bleibt aber außerhalb der Etappe.

### 7 · `difficulty`

`difficulty:{normal:{name,hp,damage}}` am Dungeon, `run.difficulty` im Laufstand. `createEnemy` multipliziert Leben und Schaden, `pct` wirkt über `pctFactor`. Heute gibt es nur Normal; der Test prüft eine Probe-Stufe mit ×2 Leben und ×1,5 Schaden.

### 8 · `dungeon-check` rot bei „Laufen im Hof“

- **Ursache:** `renderer.js drawCorpse` setzte `c.filter='grayscale(.55) brightness(.82)'`. Chrome ohne Grafikkarte rastert dann jeden Zeichenbefehl der Figur über die ganze Bildfläche.
- Im Burghof fiel die Bildrate so 6 s lang von 60 auf **5 Bilder/s**, sobald der Check den Trash legte. 600 ms Tastendruck bewegten den Helden nur um 12–16 Einheiten, gefordert waren über 15.
- **Behebung:** Die Leiche wird einmal in eine kleine Ebene gezeichnet, per `source-atop` abgedunkelt und mit einem `drawImage` gesetzt. Danach 60 Bilder/s mit Leichen, und `dungeon-check` ist grün (Desktop und Handy).
- Das Problem betraf jedes Gerät ohne Grafikkarte, nicht nur den Check.

### Nachtrag · Autopilot bei Söldnerkämpfen (Welt-weit)

- `autopilot.js`: Mit stehenden Begleitern hält nur ein **Treffer am Helden** den Laufweg an. Bemerken und Kettenzug fangen die Söldner ab.
- Ohne Begleiter bleibt der Stopp beim Bemerken (Runde 3a/5a, deren Prüfungen bleiben grün).
- Nach dem Kampf geht es weiter, sobald 1,2 s lang kein Gegner in 420 Einheiten kämpft. Dazu kommt der Hinweis „Weiter zu <Ziel>.“ bzw. „Weiter auf dem Laufweg.“
- Wer nach dem Kampf selbst lenkt (Taste, Stick) oder einen neuen Laufweg setzt, übernimmt. Nach 90 s verfällt das Fortsetzen.
- Test: `tests/autopilot-resume.test.mjs`.

## Messtabelle vorher / nachher (`scripts/dungeon-sim.mjs`)

Held Stufe 10, voller Satz ungewöhnlich, vier Söldner Stufe 10. „vorher“ ist `origin/main` 4eddb19 mit dem Review-Skript, „nachher“ ist dieser Stand.

| Lauf | vorher | nachher |
|---|---:|---:|
| Söldner, Schaden/s je Schadens-Söldner | 52 | 210–250 |
| Söldner zusammen (ohne Held) | 161 | ≈ 690 |
| Gerd, Dieter + 4 Söldner (Seeds 7/8/9) | 287 s | 84 / 85 / 96 s |
| Gerd, Bärbel + 4 Söldner | 261 s | 83 / 78 / 76 s |
| Gerd, Kevin + 4 Söldner | 294 s (Seed 8), Seed 7 Sturz beim Pull, unbeendet | 77 / 78 / 79 s |
| Gerd, Held allein, reine Zeit (unsterblich) | 435–452 s | Dieter 385, Bärbel 281, Kevin 245 s |
| Gerd, Held allein, sterblich | 0 Tode in 435 s | stirbt nach 33–169 s |
| „weicht nie aus“, Tode je Lauf (9 Läufe) | 0 | 1–2, die meisten Läufe enden im Wipe |
| „weicht aus“, Tode je Lauf (9 Läufe) | 0 | 0 |
| Sturz über die Kante beim Pull | 2 von 3 Kevin-Läufen | 0 (Kante erst ab Phase 2) |
| Pack Hof West (2 Azubis + Pappe) | 31 s, Heilung kaum | 26 s, Schaden an der Gruppe 1.518, geheilt 819 |
| Pack Kanzlei Nord | 28 s | 26 s, 1.547 / 1.179 |
| Pack Rittersaal West (Ritter + Makler) | 60 s | 37 s, 2.771 / 2.267 |
| Pack Rittersaal Süd (2 Ritter + Makler) | 105 s, 1 Söldner am Boden | 62 s, 6.872 / 5.961, niemand am Boden |
| Pack Weinkeller (8 Ratten) | 24 s | 19 s, 2.783 / 1.383 |
| Kette: hof-west gezogen, hof-ost | nicht gemessen | 0 von 2 kommen |
| Flügel Burghof am Stück (Hof, Kanzlei, Gerd) | ≈ 7,5 min, ≈ 100 EP/min (berechnet) | 3,4–3,7 min, 1.460 EP, 395–434 EP/min |
| Feld Stufe 10 (Einzelzüge, 16–24 s Weg) | – | allein 72–80, mit 4 Söldnern 81–82 EP/min |

### Prüfkriterien (alle grün, Ausgabe von `node scripts/dungeon-sim.mjs`)

| Kriterium | Wert |
|---|---|
| Gerd mit Held und 4 Söldnern 60–100 s | 76–96 s |
| Held allein über 240 s | 245–385 s |
| „weicht nie aus“ stirbt mindestens einmal | Tode je Lauf 2/1/2/1/2/2/1/2/2 |
| „weicht aus“ stirbt höchstens einmal | 0 in allen 9 Läufen |
| EP je Minute Flügel ≥ Feld Stufe 10 | Flügel mindestens 395, Feld höchstens 82 |
| Trash-Pack zieht keine Kette | hof-ost 0/2 |

Anmerkungen:
- **Knappe Ränder:** Gerd höchstens 96 s gegen die Grenze 100, Held allein mindestens 245 s gegen 240. Mehr Leben verletzt die obere, weniger die untere Grenze.
- **Engster Kandidat Kevin allein:** Fernkämpfer, stark. Kevin stirbt allein ohnehin nach rund 33 s.
- **EP je Minute rund fünffach über dem Feld:** Der Flügel Burghof ist heute nur 3,5 min lang (4 Packs und Gerd), und Gerds 600 EP plus Tagesbonus tragen die Rate. E-71 plant Flügel mit 10–15 min; mit mehr Trash sinkt die Rate Richtung 1,5–2× Feld. Ein Flügel ist heute gut eine Stufe (Stufe 10→11 braucht 1.400 EP), ähnlich wie ein Classic-Dungeon beim Leveln.
- **Grenzen der Simulation:** Die Rotation ist fest, und das Ausweichen im Profil „weicht aus“ ist ideal. Das Profil „weicht nie aus“ steht vorn beim Halter und weicht keiner Fläche aus.

## Prüfungen vor dem Push

| Prüfung | Ergebnis |
|---|---|
| `npm test` | 948 von 948 grün (neu: 11 Dungeon-Tests, 3 Autopilot-Tests; nach dem Rebase auf Etappe 2 Teil 1) |
| `npm run content:check` | grün (57) |
| `npm run build` | grün |
| `scripts/dungeon-check.mjs` | grün, Desktop und Handy (vorher rot bei „Laufen im Hof“) |
| `scripts/dungeon-e1-check.mjs` (neu) | 7 von 7 grün |
| `scripts/optimierung-r5a-check.mjs` | 23 grün |
| `scripts/optimierung-r3a-check.mjs` | 19 grün |
| `scripts/dungeon-sim.mjs` | alle 6 Kriterien grün |
| `scripts/dungeon-e2-check.mjs` (Etappe 2, zur Sicherheit) | grün |

`scripts/dungeon-e1-check.mjs` prüft:
1. Trash-Pack zieht keine Kette.
2. Der Kegel endet an der Wand, und der Held dahinter nimmt nichts.
3. Tod als Geist: Die Welt läuft weiter, der Todesbildschirm zeigt die Fahne „Schlosshof“, Schorle-Susi hilft auf (35 %).
4. Gerd mit vier Söldnern besiegt.
5. Beute-Moment mit +4 Siegelmarken, nichts angelegt.
6. Neuladen setzt fort (Gerd liegt, Siegel da, Kontrollpunkt Hof).
7. Handy: „Am Kontrollpunkt aufstehen“ gibt den Kampf auf.

## Screenshots (`visual-review/dungeon-e1/`, nicht im Repo)

| Datei | Zeigt |
|---|---|
| `01-hof-mit-soeldnern.jpg` | Burghof mit vier Söldnern nach dem Betreten |
| `02-pack-ohne-kette.jpg` | hof-west kämpft, hof-ost steht still |
| `03-kegel-endet-an-der-wand.jpg` | Kegel-Warnfläche an der Arenawand abgeschnitten, Held dahinter |
| `04-gerd-mit-soeldnern.jpg` | Gerd-Kampf, Arenatür zu |
| `05-geist-soeldner-helfen-auf.jpg` | schmaler Todesbildschirm oben, „Schorle-Susi hilft dir auf“ mit Fortschritt, Fahne „Schlosshof“, Kampf darunter sichtbar |
| `06-aufgeholfen.jpg` | Held steht wieder mit 35 % |
| `07-gerd-phase2-kante.jpg` | Phase 2: gestrichelte Warnlinie auf der Treppenkante, Kegel an der Ostwand gekürzt |
| `08-beute-moment.jpg` | Beutefenster „Beute · Gästeliste-Gerd“ mit Siegelmarke +4, +900 EP, Tagesbonus |
| `09-neuladen-setzt-fort.jpg` | nach Neuladen am Kontrollpunkt im Hof |
| `10-handy-geist.jpg`, `11-handy-kontrollpunkt.jpg` | Handy 390 × 844 |

Hinweis zu den Bildern: Große Kampfzahlen in `07` entstehen durch das Vorspulen im Prüfskript, weil die Kampftexte mehrere Sekunden zusammenfassen. Gemessen ist der größte Einzeltreffer eines Söldners 736.

## Geänderte Dateien

| Bereich | Dateien |
|---|---|
| Laufzeit | `dungeon.js`, `companions.js`, `engine.js` (kleine Haken: Geist-Takt, `hitPlayer` mit `share`, Pack-Aggro statt Kette im Dungeon, `next`, Laufstand speichern und laden), `autopilot.js`, `class-mechanics.js` (keine Heilung auf den Toten), `rpg.js` und `itemization.js` (Beute-Moment, Boss-Garantie, `rareChance` je Tabelle) |
| Oberfläche | `death-screen.js`, `rpg-ui.js` (Kopf des Beute-Moments), `app.js` (Beute-Moment öffnen), `dungeon-art.js` (nur Kegel-Warnfläche und Kantenlinie), `renderer.js` (nur `drawCorpse`), neue Datei `dungeon-e1.css` |
| Daten | `content/dungeons.js`, `content/companions.js`, `content/drops.js`, `content/items.js`, `content/item-info.js`, `content/combat.js` (`DEATH_UI.dungeon`, `AUTOPILOT_UI.resumed`), `content/balance.js` (`killXp` liest `xp`) |
| Prüfungen | `scripts/dungeon-sim.mjs` (neu), `scripts/dungeon-e1-check.mjs` (neu), `scripts/dungeon-check.mjs` (`SERVER_PORT`), `tests/dungeon.test.mjs`, `tests/autopilot-resume.test.mjs` (neu) |

## Restliste

1. **Neuling-Playtest** aus dem Prüfkriterium der Analyse: „Erklärt Kegel und Kreis nach dem Kampf richtig?“ Er ist nicht gelaufen und sollte nach Etappe 2 (Warnleiste) kommen.
2. **Hausverbot ohne eigenes Symbol:** Es ist nur als Kampftext „HAUSVERBOT ×2“ zu sehen. Ein Symbol am Rahmen bzw. in der Warnleiste gehört zu Etappe 2.
3. **Handy im Geist-Zustand:** Der Truppenrahmen verdeckt Teile der Arena. Die Handy-Kampfansicht ist Etappe 2.
4. **Siegelmarken:**
   - Außer im Beutefenster sind sie noch nirgends zu sehen (Karte bzw. Figur).
   - Der Händler Vermieter Volker fehlt (Etappe 4).
5. **Etappe 4:**
   - Flügel mit 10–15 Minuten füllen.
   - Abkürzungen je Flügel.
   - Endtruhe mit Wahl.
   - Hafersack-Garantie.
   - Bei einem Flügel von 10–15 min EP je Minute neu messen.
6. **Offene Welt:**
   - Kettenaggro „Kumpel kommt“ (Kenner-Befund 7) unverändert.
   - Auto-Anlegen gefundener Beute draußen unverändert.
7. **Sturz über die Kante:** Der Gestürzte muss die Kellertreppe selbst wieder hoch. Ein Hinweis, dass der Weg zurück offen ist, fehlt noch (Text-Diät Etappe 2).
8. **Grafik:** Der Geist hat keine eigene Figur; es gibt nur den Körper und die entsättigte Welt. Eine eigene Geist-Grafik bräuchte die Freigabe des Nutzers.
