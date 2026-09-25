# Dungeon-Analyse „Schloss Big B“ im WoW-Vergleich · 2026-09-24

Grundlage: `origin/main` 5756aaa (Worktree `D:\Dev\MertlochChronicles-dungeon-design`, nur lesend, nichts committet).
Gelesen: Planung `docs/DUNGEON-SCHLOSS-BIG-B-2026-09-23.md`, `content/dungeons.js`, `dungeon.js`, `dungeon-art.js`,
`engine.js`, `companions.js`, `content/companions.js`, `content/tuning.js`, `content/BALANCE-SHEET.md`, E-35 bis E-70, Backlogs.
Selbst gemessen:
- `tests/dungeon.test.mjs`: 15 von 15 grün.
- Kampfsimulation im echten Grundriss: `_review/dungeon-sim.mjs` und `_review/merc-dps.mjs`. Held Stufe 10, voller Satz auf Stufe 10, Talentpfad 0, Seeds 7 und 8.
- Browserszenen: `_review/dungeon-scenes.mjs` auf 1600 × 900 und 390 × 844, CDP 9571/9572, Server 4371/4372.

## Kurzurteil

Der Grundriss und die Leitidee sind stark. Drei Ebenen um einen Hof, dazu Ring, Schleife, Geheimweg, Abkürzung, freie
Siegel-Reihenfolge und der Prospekt als Karte: Das ist näher an Dire Maul und Scarlet Monastery als an einem Schlauch.
Beim Humor ist der Plan besser als die meisten WoW-Dungeons.

Der Kampf, der heute live ist, taugt dagegen noch nicht als Dungeon. Nach den Zahlen kommen die Gründe.

**Die Zahlen passen nicht zum Spiel.**
- Der Plan rechnet mit rund 1.700 Schaden/s für einen Helden mit vier Söldnern. Gemessen sind es 306 bis 345 Schaden/s.
- Die vier Söldner machen zusammen nur 161 Schaden/s, also rund 40 je Söldner. Ein Held auf Stufe 10 mit ungewöhnlicher Ausrüstung macht 240 bis 270.
- E-45 verspricht Söldner mit 85 % der Stärke eines Spielers. Gemessen sind es rund 15 %.
- Gerd braucht deshalb 261 bis 294 s statt 60 bis 75 s. Mit Startausrüstung sind es 439 s.

**Gerd ist lang, aber ungefährlich.** Ein Held ganz ohne Söldner, der keiner Mechanik ausweicht, legt Gerd in 435 s ohne
einen Tod: 52 schwere Treffer, tiefster Stand 18 % Leben. Keine Mechanik prüft etwas.

**Der Tod des Helden beendet sofort den ganzen Versuch.**
- `Game.tick` hält die Welt an, sobald der Held stirbt. Der Tod zählt deshalb als Gruppentod, auch wenn vier Söldner mit vollem Leben stehen.
- Die Einblendung sagt „Alle am Boden“.
- Der Todesbildschirm bietet „Aufwachen bei St. Gangolf“ an, obwohl der Held am Kontrollpunkt im Dungeon aufsteht.

**Die Belohnung ist heute ein Platzhalter.**
- Gerd lässt die Beute von Sperrmüll-Sigi fallen (`family:'sigi'`). Im Test fiel ein „Bauwagen-Pfandsiegel der Zugabe“.
- Er gibt 150 EP für 5 Minuten Kampf. Eine Gruppe Feldgegner gibt in derselben Zeit ein Vielfaches.
- Der Dungeon ist damit die schlechteste EP-Quelle im Spiel. In WoW ist er beim Leveln eine der besten.

**Hochrechnung auf den ganzen Dungeon.** Mit den gemessenen 310 Schaden/s braucht ein Held mit Söldnern:
- auf dem kürzesten Weg rund 45 Minuten statt 25. Die Bosse haben zusammen 590.000 Leben, der Trash rund 80.000.
- für den vollen Durchgang 65 bis 70 Minuten statt 45.

Die geplanten Zeiten passen nur zu fünf echten Spielern. Deren Leistung ist geschätzt, nicht gemessen: rund 1.000 Schaden/s,
abgeleitet aus dem Balance-Sheet.

### Noten je Bereich

5 = Niveau eines aktuellen WoW-Retail-Dungeons, 1 = fehlt. „Bau“ ist der Stand, der heute live ist. „Plan“ ist der Stand,
wenn die Planung wie beschrieben umgesetzt wird.

| Bereich | Bau | Plan | Classic zum Vergleich | Retail zum Vergleich |
|---|---:|---:|---|---|
| 1 Eingang und Zugang | 2 | 3 | Höhle mit Portal, Versammlungsstein | Dungeonbrowser, Teleport, Journal im Eingang |
| 2 Dungeon-Journal | 1 | 1 | gab es nicht (Addons, Wiki) | Encounter Journal mit Rollen-Symbolen und Beute |
| 3 Aufbau und Tempo | 2 | 3,5 | 45–90 min, Flügel, seltene Bosse | 25–35 min, Abkürzungen nach Bossen |
| 4 Mechaniken | 2 | 4 | wenig Telegrafie, Adds, Patrouillen | Warnflächen, Boss-Timer, Rollenprüfung |
| 5 Schwierigkeit | 1 | 2 | Normal, später Heroisch | Normal, Heroisch, Mythisch, Mythic+ mit Affixen |
| 6 Belohnungen | 1 | 3 | Blau-Beute, seltenes Reittier (Baron) | Wappen, Wöchentliche Kammer, Erfolge, Titel |
| 7 Dungeon-Karte | 2,5 | 4 | keine Instanzkarte (erst später) | Karte je Ebene mit Boss-Schädeln |
| 8 Story und Humor | 3 | 4,5 | Rollenspiel über Questtexte | Rollenspiel-Szenen, NPC-Begleiter, Endszene |
| 9 Technik und Risiken | 3 | 3 | – | – |

Gegenüber einem Classic-Dungeon wie Todesminen liegt Mertloch heute im Aufbau gleichauf, bei Kampf und Beute deutlich
dahinter. Gegenüber Retail fehlt fast alles, was den Kampf lesbar macht: Journal, Boss-Ansagen, Rollen-Symbole, Karte mit
Schädeln, Wappen.

### Befunde aus dem Browser (Screenshots unten)

- **Eingang** (`01`): Rolltor mit Schrift auf der Straße, danach „F Schloss Big B betreten“. Es gibt keinen Portal-Moment,
  keine Stufenanzeige in der Welt und keine Marke auf der Weltkarte. Die Minikarte zeigt ein Symbol „Verlies“ mit Stufenband.
- **Text über Text** (`02`, `07`, `13`):
  - Raumschild, Wirklichkeit, Zonentitel, Durchsage, Anheuer-Hinweis und Sprechblasen liegen übereinander.
  - Im Thronsaal steht „echter Basaltdom, verkleidet mit Pappe“ dreimal gleichzeitig am Schirm.
  - Das widerspricht E-67 und E-70 („Tooltips statt Text“).
- **Kegel** (`desk-04`): Die Warnfläche selbst ist gut: Füllfortschritt und Aufblitzen kurz vor dem Treffer.
  - Sie reicht aber durch die Wand in den Hof. Auch der Treffer prüft keine Sichtlinie (`inCone` in `dungeon.js`).
  - Die Zauberleiste im Bossrahmen schneidet den Hinweis ab: „Rausschmiss · nicht vor“.
- **Aufstellung** (`desk-03`, `05`): Held und alle Söldner stehen als Haufen vor Gerd.
  - Die „Dresscode-Kontrolle“ legt ihren Kreis unter das Ziel. Weil ein Söldner tankt, liegt der Kreis damit auf dem ganzen Nahkampf.
  - Der Plan sieht „unter zwei Spielern“ vor. Gebaut ist nur „unter dem Ziel“.
- **Tod** (`06`, `07`):
  - Der Held stirbt, die Söldner haben volles Leben, die Welt steht still.
  - Danach steht er am Kontrollpunkt Hof mit der Meldung „Alle am Boden“.
  - Leichen vom Trash bleiben liegen, das ist richtig so.
- **Karte** (`08`, `09`, `12`): Sie funktioniert: drei Ebenen-Reiter, eigene Position, Söldner-Punkte, Siegelfeld,
  durchgestrichener Boss.
  - Der Prospekt besteht nur aus gestrichelten Kästen mit „laut Prospekt: Marstall“. Die Leitidee kommt so nicht an.
  - Oben steht ein Erklärsatz, zwei Drittel der Fläche sind leer, es gibt keine Wegmarke.
- **Handy** (`phone-04`): Der Truppenrahmen mit vier Söldnern und der Bossrahmen verdecken die halbe Arena. Held und Boss
  sind im Kampf kaum zu sehen.
- **Thronsaal** (`13`): leer. Die Tresortür ist heute nicht zu öffnen (2 von 3 Siegeln fehlen). Das ist geplant, heißt
  aber: Der Dungeon hat im Spiel kein Ende.

### Befund aus der Simulation: Sturz über die Treppenkante

Ein Fernkämpfer (Kevin) wurde beim Pull vom ersten „Rausschmiss“ über die Treppenkante gestoßen, in 2 von 3 Läufen mit
Startposition 8,5/26.

Danach setzt Gerd zurück, und der Held steht allein im Rittergeschoss. Allein mit Söldnern ist das ein halber Wipe, ohne
dass der Spieler etwas falsch gemacht hätte.

### Messwerte (`_review/dungeon-sim.mjs`)

| Lauf (Stufe 10) | Dauer Gerd | Tode | Schaden/s Gruppe | tiefstes Leben |
|---|---:|---:|---:|---:|
| Dieter Kneipenschläger + 4 Söldner, Startausrüstung | 439 s | 0 | 205 | 40 % |
| dito, ungewöhnlich | 287 s | 0 | 313 | 30 % |
| dito, selten | 273 s | 0 | 330 | 59 % |
| Bärbel Filter-Furie + 4 Söldner, ungewöhnlich | 261 s | 0 | 345 | 78 % |
| Kevin Pfandjäger + 4 Söldner, ungewöhnlich (Seed 8) | 294 s | 0 | 306 | 85 % |
| Kevin, Seed 7 | nicht beendet: Sturz über die Kante, Gerd setzt zurück | – | – | – |
| Dieter + 4 Söldner, steht vor dem Boss, weicht nie aus | 328 s | 0 | 275 | 43 % |
| Dieter als Tank (Dosenwall) + Heilung + 2 Schaden | 306 s | 0 | 294 | 46 % |
| Dieter allein, weicht nie aus | 435 s | 0 | 207 | 18 % |
| Nur die vier Söldner (Held greift nicht an) | – | – | 161 | – |
| Trash Hof 2 Azubis + Pappe / Weinkeller 8 Ratten / Rittersaal 2 Ritter + Makler | 31 s / 24 s / 105 s | 0 | 356–409 | 44–98 % |

Nicht gemessen:
- echte Menschen online, Leistung und Bildrate auf Geräten mit Grafikkarte
- die Bosse Exposé, Kurt, Rita, Pferd und Big B, weil sie nicht gebaut sind
- 2024 px Breite: Headless stürzt dort ab, deshalb 1600 × 900
- Spielspaß mit echten Spielern

Die Simulation spielt eine feste Rotation mit ideal gesetztem Ausweichen, ist also eher zu gut als zu schlecht.
`BOOT_TRIES=3` reicht für den Start nicht (300 ms, „Game did not initialize“); ich habe 400 genommen.

---

## Analyse Punkt für Punkt

### 1 · Eingang und Zugang

- **Heute im Spiel:**
  - Rolltor an der Burgstraße, betretbar ab Stufe 8, F führt direkt hinein.
  - Die Minikarte zeigt eine Marke, die Weltkarte nicht.
  - Kein Gruppenzugang: Nach E-35 ist unsichtbar, wer in einer Instanz ist. Zwei Freunde können nicht zusammen hinein.
  - Keine Sperre. Der Durchgang läuft 30 Minuten nach dem Verlassen weiter, geht aber beim Neuladen des Tabs verloren. Er wird nicht gespeichert, siehe `dungeon.js` `createRun`/`leaveDungeon`.
- **In der Planung:** eine Eingangskarte mit Stufe, Rollen und Söldner-Knopf (Abschnitt 14), aber nicht gebaut. Online-Instanz als Stufe 2.
- **WoW:**
  - Classic: begehbarer Eingang mit wirbelndem Portal, Versammlungsstein zur Gruppensuche (ab TBC zum Beschwören), Stufenband im Questtext, höchstens 5 Instanzen pro Stunde.
  - Retail: Dungeonbrowser mit Rollen, Teleport hinein und heraus, Journal-Knopf im Eingang.
  - Follower-Dungeons (ab 10.2.5): Solo mit NPC-Begleitern, die ihre Rolle wirklich tragen. Das ist das direkte Vorbild für Mertlochs Söldner.
- **Lücke:** Es gibt keinen Schwellen-Moment, keinen Überblick vor dem Betreten, keinen Weg für eine Gruppe und keinen Schutz des Laufs gegen Neuladen.
- **Vorschlag:**
  - F öffnet eine **Eingangskarte ohne Fließtext**: Stufenband, fünf Rollenplätze (Held plus angeheuerte Söldner, leere Plätze mit Knopf „Söldner holen“), Bestzeit, drei Beute-Symbole und „Betreten“.
  - Dazu ein Portal-Flimmern am Rolltor über `world-fx.js` und eine Marke auf der Weltkarte in `atlas-ui.js`.
  - Den **Laufstand speichern** (siehe Verbesserung 8).
  - Gruppenzugang erst mit Online-Stufe 2, aber den Versammlungsstein jetzt schon als Requisit anlegen: eine Bierkiste vor dem Tor, später „Gruppe herholen“.

### 2 · Dungeon-Journal

- **Heute:** Es gibt nichts. Hinweise stehen nur im Zaubernamen („· Q unterbricht“), und der wird abgeschnitten.
- **Planung:** Auch dort ist kein Journal vorgesehen.
- **WoW Retail:**
  - Das Encounter Journal zeigt je Boss die Fähigkeiten mit Symbolen: Tank-Warnung, Heiler-Warnung, Schaden, Tödlich, Unterbrechbar.
  - Dazu kommen Rollen-Hinweise und eine Beutevorschau je Schwierigkeit.
  - Classic hatte kein Journal; das war eine Lücke, die Addons und Wikis füllten.
- **Lücke:** Wer Gerd trifft, weiß vorher nichts über ihn. Das ist bei einem nicht-linearen Dungeon mit freier Reihenfolge doppelt schlimm.
- **Vorschlag:** ein Journal, das sich vollständig **aus den Daten erzeugt**.
  - Je Fähigkeit in `DUNGEON_CASTS` ein Symbol nach Merkmal (`cone`, `ground`, `interruptible`, `summon`, später `lie`, `stack` …) und ein Tooltip mit Zahlen. Das Muster gibt es schon: `AUTO_INFO`/`describeAuto` in `content/combat.js`.
  - Je Boss eine Zeile mit drei Rollen-Symbolen und die Beute-Symbole aus der Beutetabelle.
  - Aufruf über einen Klick auf die Boss-Krone in der Dungeon-Karte oder aufs Bossporträt.
  - Eine Seite je Boss, nichts scrollt. Handtext nur im Tooltip.

### 3 · Aufbau und Tempo

- **Heute:**
  - 15 Räume, 16 Gruppen, eine Streife. Nur Gerd ist gebaut; der Weg endet an der Tresortür.
  - Die Laufwege nach einem Wipe sind kurz: Kontrollpunkt Hof neben Gerd, Lauftempo 12 m/s. Das ist gut.
  - Trash in Kampfzeit: Hof 31 s je Gruppe, Rittersaal-Gruppe mit zwei Rittern 105 s.
- **Planung:** kürzester Weg 25 Minuten, voller Durchgang 45 Minuten. Nach Messung sind es 45 bzw. 65–70 Minuten allein mit Söldnern.
- **WoW:**
  - Classic-Todesminen: 45–60 min, ein seltener Boss (Minenarbeiter Johnson).
  - Kloster und Düsterbruch sind in Flügel geteilt, damit ein Abend reicht.
  - Retail: 25–35 min (Mythic+-Timer), nach Bossen öffnen Abkürzungen, Kontrollpunkt am Geistheiler.
- **Lücke:**
  - 45 bis 70 Minuten sind für ein Browserspiel mit Handy-Anteil zu lang, zumal ein neu geladener Tab heute alles verliert.
  - Die Trash-Dichte an sich stimmt: Die Gruppen sind klein, und die Streife hat eine eigene Wirkung.
  - Die Zeit steckt fast ganz in den Boss-Lebenspunkten: 590.000 Leben bei gut 300 Schaden/s.
- **Vorschlag:**
  - **Drei Flügel**, je ein Siegel mit 10–15 Minuten Spielzeit. Jeder Flügel endet mit Abkürzung, Kontrollpunkt und kleiner Truhe.
  - Siegel bleiben bis zum nächsten Tag. Big B ist der vierte Abend oder der Schluss eines langen Abends.
  - Das nimmt dem nicht-linearen Aufbau nichts und passt zu Handy-Sitzungen.
  - Die Zielzeiten aus Abschnitt 8 gelten dann als Obergrenze allein mit Söldnern, nicht für fünf Menschen.

### 4 · Mechaniken

- **Heute gebaut:**
  - `cone` mit `tankSafe` und `knockback`, Sturz eine Ebene tiefer, `callHelp`, `healAllies`, `frontGuard`.
  - Boss-Phasen mit neuem Zyklus und Adds.
  - Die Söldner treten aus Kegeln und Flächen und unterbrechen.
  - Die Warnfläche des Kegels ist gut lesbar.
- **Grenzen der Engine:**
  - Ein Gegner zaubert höchstens alle 5,5 s (`COMBAT_RULES.specialInterval`), immer einen Zauber nach dem anderen aus einem Zyklus.
  - Parallele Timer gibt es nicht, etwa einen Tank-Treffer alle 12 s neben dem Hauptzyklus.
  - Schaden ist eine feste Zahl, unabhängig vom Leben des Ziels. Der Kegel trifft durch Wände.
  - Flächen liegen immer unter dem aktuellen Ziel.
  - Söldner stellen sich nicht hinter den Boss, drehen ihn nicht weg und werden nicht zurückgestoßen.
- **Planung:** 15 Merkmale, darunter `lie` (Behauptung und Nachsatz). Das ist die beste Idee des Papiers und in WoW so nicht zu finden.
  - `decoy`, `stack`/`spread`, `line`, `los`, `hidden` und `feedsFrom` sind sauber gedacht, und jedes lehrt eine Sache.
  - Für einen ersten Dungeon sind es zu viele auf einmal.
- **WoW:**
  - Boss-Mods (DBM, BigWigs) bzw. das Journal sagen jede Fähigkeit mit Balken und Ton an.
  - Frontal-Kegel (Cleave) treffen die Gruppe, nicht den Tank.
  - Kreise landen auf zufälligen Fernkämpfern.
  - Mehrere Fähigkeiten laufen mit eigenen Timern nebeneinander.
  - Wer ausweicht, nimmt nichts; wer nicht ausweicht, verliert 30–60 % seines Lebens.
- **Lücke:** Heute prüft die Mechanik nichts; wer nicht ausweicht, überlebt trotzdem. Die Ansage steckt als abgeschnittener Text im Zaubernamen.
- **Vorschlag:** in Verbesserung 2, 4 und 10.
  - Schaden als Anteil am Leben des Ziels, Flächen auf zufällige Nicht-Tanks.
  - Boss-Warnleiste mit Symbol und Ton, dazu ein Timer-Balken für die nächste Fähigkeit.
  - Söldner-Aufstellung nach Rolle.
  - Parallele Timer als Datenfeld `tracks` je Boss in `startCast`.

### 5 · Schwierigkeit

- **Heute:** Gerd hat viel Leben und ist ungefährlich (Messwerte oben).
  - Die Söldner sind im Kampf kaum mehr als Statisten: 40 Schaden/s je Söldner gegen 240–270 beim Helden.
  - Mit 748 bis 1.090 Leben sterben sie dagegen an zwei Kegeln (650).
  - Nur Normal. Skalierung mit der Gruppengröße: keine.
- **Planung:**
  - Der Zahlenentwurf in Abschnitt 8 setzt 580 Schaden/s je Schadensbauer auf Stufe 10 an. Das Balance-Sheet zeigt für Stufe 10 aber 270–350 (ungewöhnlich bis selten); 580 erreicht erst Stufe 20.
  - Heldenleben ist mit 1.005 angesetzt, gemessen sind es mit Ausrüstung 1.965–2.295. Verpasste Mechaniken kosten deshalb 20–33 % statt 40–70 %.
  - „Heldenmodus“ ist für später vorgesehen.
- **WoW:**
  - Normal verzeiht viel, Heroisch prüft, Mythisch und Mythic+ skalieren mit Stufe und Affixen, etwa der wöchentlichen Mechanik.
  - Follower-Dungeons gibt es nur auf Normal; die Begleiter sind dafür eigens eingestellt.
- **Lücke:** Der Balance-Rahmen ist falsch kalibriert. Solange Söldner bei 15 % statt 85 % liegen, braucht jede Zahl zwei Versionen, eine für Menschen und eine für Söldner.
- **Vorschlag:**
  - Zuerst die Söldner auf das Versprechen aus E-45 bringen, nur in Instanzen (Faktor in `COMPANION_RULES`, angewendet in `companionStats`, wenn `inDungeon`). Dann gilt eine einzige Zahl für beide Gruppenarten.
  - Danach die Boss-Leben gegen die gemessene Gruppenleistung setzen. Der Sim-Lauf gehört als Prüfskript ins Repo, mit Korridor 60–100 s für Gerd.
  - Schwierigkeitsstufe als Datenfeld sofort anlegen (`difficulty:{normal:{hp:1,dmg:1}}`), auch wenn nur Normal kommt.

### 6 · Belohnungen

- **Heute:** Platzhalter.
  - Beute kommt aus der Familie des geliehenen Sprites (Gerd = Sigi), 150 EP je Boss.
  - Keine Truhe, keine Erfolge, keine Währung.
  - Die Siegel sind nur Zustand im Lauf, kein sichtbarer Gegenstand.
- **Planung:**
  - Beutetabellen je Boss, sieben Dorflegenden mit 12–15 %, Reittier „Das halbe Pferd“ zu 3 % vom seltenen Boss (30 %).
  - Neun Erfolge, ein Titel, Materialien, Auftragsreihe.
  - Kein Wappen-System, kein Tagesbonus, keine Endtruhe mit Wahl.
- **WoW:**
  - Classic: blaue Teile je Boss, das Reittier von Baron Rivendare (1 %) als legendäre Plackerei, Ruf über Aufträge.
  - Retail: Wappen gegen Beutepech, die Wöchentliche Kammer, Erfolge mit Titel, Reittier und Transmog.
  - Dazu tägliche Bonus-Belohnungen für den ersten Dungeon.
- **Lücke:**
  - 3 % aus 30 % sind 0,9 % je Lauf, also im Mittel rund 110 Läufe.
  - Ohne Wappen gibt es keinen Fortschritt bei Pech.
  - EP je Minute liegen weit unter dem Feld.
- **Vorschlag:** in Verbesserung 7.
  - Eigene Tabellen und eine garantierte Endtruhe mit Wahl aus drei Teilen; der Plan hat das beim Auftrag „Die ganze Wahrheit“ schon.
  - „Siegelmarken“ als Wappen: 2 je Boss, Händler Vermieter Volker.
  - Täglicher Erstabschluss mit Bonus, Boss-EP nach Kampfdauer.
  - Pferd mit Garantie über Hafersäcke.

### 7 · Dungeon-Karte

- **Heute:**
  - Reiter je Ebene, erkundete Räume mit Schild und Wirklichkeit, unerkundete gestrichelt mit Prospekt-Namen.
  - Eigene Position, Söldner-Punkte, Siegel-Zähler, Kontrollpunkt-Fahne, Boss-Kreis mit Kreuz.
  - Es fehlen: die Prospekt-Zeichnung, Wegmarke, Tooltip, Gruppenposition über Ebenen und Geheimnis-Konturen.
  - Oben steht ein Erklärsatz, der Rest der Fläche ist zum großen Teil leer.
- **Planung:** Prospekt gegen Wirklichkeit, Wegmarke über Ebenen, Beweis-Felder. Die Idee ist ausgezeichnet: Die Karte erzählt die Geschichte ohne Dialog.
- **WoW:** Retail-Dungeonkarten mit Ebenen, Boss-Schädeln (besiegt grau) und Gruppenpfeilen. Classic hatte keine Instanzkarte.
- **Lücke:** Ohne Zeichnung ist der Prospekt nur eine Beschriftung. Der Witz „Nordturm“ gegen Leiter kommt nicht an.
- **Vorschlag:**
  - Prospekt je Ebene als Bild aus der Bildpipeline (E-51) unter die Datenkarte legen. Beim Betreten „reißt“ die Pappe an dieser Stelle auf.
  - Boss-Krone mit Tooltip, das Journal hängt daran.
  - Wegmarke per Klick über `findPath` und die Übergänge.
  - Den Erklärsatz durch ein Info-Symbol mit Tooltip ersetzen und die Karte auf die volle Fensterhöhe ziehen.

### 8 · Story und Humor

- **Heute:**
  - Die Durchsagen lügen und zeigen trotzdem auf die Wahrheit („Hier gibt es KEINEN Geheimgang“ an der Pappwand).
  - Schilder mit Wirklichkeit, Gerds Sprüche je Phase.
  - Das trägt, geht aber im Textstau unter.
- **Planung:** „Lüge mit Nachsatz“ zieht sich durch alles.
  - Name, Karte, Durchsagen und Beweise folgen dem Muster, und der Boss ist die Mechanik.
  - Das ist die stärkste Verbindung von Story und Mechanik im ganzen Papier und besser als das meiste in WoW.
  - Schwachstelle: Die Wirkung der Beweise (0,2 s früherer Nachsatz je Beweis) ist nicht spürbar.
- **WoW:**
  - Kurze Rollenspiel-Szenen vor Bossen, etwa VanCleef, der Mr. Smite ruft.
  - NPC-Ereignisse unterwegs, etwa befreite Gefangene, die eine Tür öffnen.
  - Eine Endszene, dazu Begleiter-Kommentare in Follower-Dungeons.
- **Vorschlag:**
  - Die Szenen, die zählen:
    - Rolltor: Big B per Handy-Livestream als Begrüßung
    - Befreiung von Vermieter Volker als kleines Geleit mit Ereignis
    - Beweise am Thron vorlegen, 5 s mit drei Ausreden
    - Geständnis bei 15 %, und am Ende filmt das Handy weiter
  - Jede Szene höchstens 6 Sekunden, mit Sprechblase, ohne Fenster und überspringbar.
  - Die Söldner kommentieren Durchsagen mit je einer Zeile. `lines` gibt es schon in `content/companions.js`.

### 9 · Technik und Risiken

- **Stark:**
  - Der Welttausch über `dungeonWorld` (erbt von der Dorfwelt, überschreibt nur die Geometrie) ist schlank.
  - Kollision und Wegsuche kommen aus einer Datenquelle.
  - Die 15 Tests decken Erreichbarkeit in allen sechs Reihenfolgen ab.
  - Ausnahmen oder Fehler im Browser: keine.
- **Risiken:**
  1. Der Lauf wird nicht gespeichert: Neuladen oder ein beendeter Handy-Tab verliert alles.
  2. Tod des Helden = Weltstillstand = Wipe (`if(this.paused||this.dead)return` in `tick`).
  3. Instanz nur lokal; Gruppen können nicht zusammen hinein. E-35 macht Instanzen unsichtbar.
  4. Eine Warteschlange mit einem Zauber je Gegner begrenzt jedes spätere Boss-Design.
  5. Die Zahlenbasis der Planung liegt um den Faktor 2 bis 5 daneben.
  6. Die Kante bei Gerd wirft Fernkämpfer schon beim Pull hinaus.
  7. Leistung (E-46 ff.): Schwärme mit 8 Ratten liefen ohne Fehler. Die Bildrate im Dungeon habe ich nicht gemessen.
- **Vorschlag:** Laufstand im Spielstand; Tod im Dungeon als Geist mit Aufhelfen; Online-Stufe 2 früh als Datenmodell mitdenken (`roomKey`); der Rest in den Verbesserungen unten.

---

## Die 12 wirksamsten Verbesserungen

Sortiert nach Wirkung für den Spieler je Aufwand. S = bis 1 Tag, M = 2–4 Tage, L = über eine Woche.

| # | Was | Aufwand | Abhängig von |
|---|---|---|---|
| 1 | Zahlen auf die gemessene Gruppe ziehen, Söldner in Instanzen stärken | M | – |
| 2 | Mechanik mit Folgen: Schaden relativ zum Leben, Flächen auf Nicht-Tanks, Kegel respektiert Wände | S | 1 |
| 3 | Held tot ≠ Wipe: Geist, Söldner kämpfen weiter, Aufhelfen | M | – |
| 4 | Boss-Warnleiste und Timer statt Hinweis im Zaubernamen | M | – |
| 5 | Journal aus den Daten | M | 4 (Symbole) |
| 6 | Eingangskarte, Portal-Moment, Weltkarten-Marke | S–M | 5 (Beutevorschau) |
| 7 | Eigene Beute, Endtruhe, Siegelmarken, Tagesbonus, EP nach Dauer | M | 1 |
| 8 | Laufstand überlebt Neuladen | S | – |
| 9 | Drei Flügel à 10–15 min, Siegel bis Tagesreset | S (Daten) + M (Abkürzungen) | 8 |
| 10 | Söldner-Aufstellung nach Rolle | M | 2 |
| 11 | Text-Diät und Handy-Kampfansicht | S | 4 |
| 12 | Big B als zweiter Boss vorziehen: `lie`, `line`, parallele Timer, Wut | L | 1–4, 10 |

**1 · Zahlen und Söldnerstärke.**
- **Warum:**
  - In WoW dauern Normal-Bosse 1–2 Minuten, Follower-Dungeons sind so eingestellt, dass die NPCs ihre Rolle tragen.
  - Hier liegt ein Söldner bei 40 Schaden/s, also 15 % eines Helden statt der 85 % aus E-45. Gerd dauert dadurch das Vierfache.
- **Wie:**
  - Eine Zeile `instanceFactor:{damage:4,heal:2.5,health:1.6}` in `COMPANION_RULES`, angewendet in `companionStats` bzw. `refreshStats` (`companions.js`), wenn `inDungeon(g)`. Die offene Welt bleibt dabei unberührt.
  - Danach die Boss-Leben aus der Messung ableiten: Gerd mit 90.000 Leben bleibt, wenn eine Gruppe auf rund 1.000 Schaden/s kommt.
  - `_review/dungeon-sim.mjs` als `scripts/dungeon-sim.mjs` übernehmen: Korridor je Boss, drei Seeds, Klassen Dieter, Bärbel und Kevin.
- **Prüfen:** Gerd mit Held und 4 Söldnern 60–100 s. Nur der Held ohne Söldner über 240 s.

**2 · Mechanik mit Folgen.**
- **Warum:** In WoW kostet ein verpasster Frontal-Kegel die Hälfte des Lebens. Kreise landen auf Fernkämpfern, damit der Nahkampf nicht bestraft wird.
- **Wie:**
  - Neues Merkmal `pct` (Anteil am Höchstleben des Getroffenen) neben `damage` in `resolveDungeonCast`, `hitCompanion` und `hitPlayer`: Rausschmiss 0,55, Dresscode 0,35, Liste 0,3.
  - `ground` mit `target:'random'`/`targets:2` (nicht der Tank) in `startCast` bzw. `tickEnemyOnCompanion`.
  - `inCone` prüft `world.lineClear`.
  - Die Fallkante erst ab Phase 2 aktiv oder nur mit Warnlinie am Boden.
- **Prüfen:** Das Profil „weicht nie aus“ stirbt bei Gerd mindestens einmal, das Profil „weicht aus“ höchstens einmal.

**3 · Held tot ≠ Wipe.**
- **Warum:** In WoW kämpft die Gruppe weiter; es gibt Kampfwiederbelebung, und erst wenn alle liegen, läuft man vom Geistheiler zurück. Follower-Heiler beleben wieder.
- **Wie:**
  - In `engine.js` `tick` im Dungeon beim Tod nicht anhalten. Der Held wird Geist mit Kamera auf den Körper, und die Söldner ticken weiter.
  - Ein Heil-Söldner bekommt eine Fähigkeit vom Typ `revive` (einmal je Kampf, 8 s Wirkzeit, 35 % Leben wie `reviveHere` aus E-44).
  - Wipe erst, wenn Held und alle Söldner liegen oder der Held „Freilassen“ wählt.
  - `death-screen.js` braucht im Dungeon „Am Kontrollpunkt aufstehen“ statt St. Gangolf.
- **Prüfen:** Unit-Test: Tod des Helden bei lebendem Heil-Söldner führt nach einem Aufhelfen zum Sieg über Gerd.

**4 · Boss-Warnleiste und Timer.**
- **Warum:** DBM/BigWigs bzw. die Retail-Warnungen: Symbol, kurzer Name, Ton, ein Balken bis zur nächsten Fähigkeit. Ohne das ist `lie` auf dem Handy nicht spielbar; das nennt die Planung selbst als Risiko.
- **Wie:**
  - Neues Modul `boss-alerts.js` über der Aktionsleiste: ein Symbol je Merkmal (`cone`, `ground`, `interruptible`, `summon`, `lie`, `stack` …) und 2–3 Wörter.
  - Die Hinweise wandern aus dem Zaubernamen in ein neues Feld `hint` bzw. in das Symbol.
  - Timer-Balken aus Zyklus und `specialInterval`, vorhersagbar, weil der Zyklus fest ist.
- **Prüfen:** Das Prüfskript sieht den Warntext mindestens 1 s vor dem Treffer, am Handy über den Kampfknöpfen, ohne Abschneiden.

**5 · Journal aus den Daten.**
- **Warum:** Das Encounter Journal ist die Grundlage für Lernen und Absprache.
- **Wie:**
  - `describeCast()` analog zu `describeAuto` in `content/combat.js` erzeugt Symbol, Zahlen und Antwort aus den Merkmalen.
  - Das Fenster öffnet über die Boss-Krone der Karte oder über das Bossporträt, eine Seite je Boss.
  - Beutevorschau aus der Beutetabelle.
- **Prüfen:** `ui:check`, nichts scrollt; jede Fähigkeit hat Symbol und Tooltip; kein Handtext außerhalb von Tooltips.

**6 · Eingangskarte, Portal, Weltkarte.**
- **Warum:** Classic lebt vom Schwellen-Moment am Portal, Retail zeigt vor dem Betreten, was einen erwartet.
- **Wie:**
  - `dungeonDoorInteraction` öffnet eine Karte in `app.js` statt `enterDungeon` direkt: fünf Rollenplätze, Söldner anheuern, Stufenband, Bestzeit, drei Beute-Symbole.
  - Ein Portal-Effekt (`world-fx.js`) am Rolltor und die Marke `dungeon` in `atlas-ui.js`. Der offene Punkt „Verlies-Eingang“ aus E-70 wird damit gleich mit erledigt.
- **Prüfen:** Neuling findet den Eingang über die Weltkarte und betritt ihn mit vier Söldnern ohne Chatbefehl.

**7 · Beute und Fortschritt.**
- **Warum:** Wappen gegen Pech (Retail), ein seltenes Reittier mit Mythos (Classic), täglicher Bonus. Belohnung muss die Zeit übertreffen, die das Feld in gleicher Zeit bringt.
- **Wie:**
  - Beutetabellen `gerd` … `bigb` und `schlosstrash` in `content/drops.js`, dazu eigene Familien statt `family:'sigi'`.
  - Endtruhe in der Schatzkammer mit Wahl aus drei seltenen Teilen, 2 „Siegelmarken“ je Boss, Händler Vermieter Volker.
  - `dungeons[id].daily` für den Bonus beim ersten Abschluss am Tag.
  - Boss-EP nach Zielzeit (Gerd rund 600, Big B rund 1.500) plus Abschluss-EP.
  - Hafersack als Garantie für das Pferd: 10 Stück ergeben das Reittier.
- **Prüfen:** EP je Minute im Dungeon ≥ Feld auf Stufe 9–10, gemessen mit `class-pacing`.

**8 · Laufstand überlebt Neuladen.**
- **Warum:** In WoW bleibt die Instanz mit ihrer ID bestehen. Im Browser ist ein beendeter Tab der Normalfall.
- **Wie:**
  - `savedDungeonRun()` schreibt `killed`, `seals`, `secrets`, `visited`, `unlocked`, `checkpoint` und `startedAt` in den Spielstand.
  - `enterDungeon` setzt ihn fort, solange `resetAfter` nicht abgelaufen ist.
  - Muster: `savedKiosk`.
- **Prüfen:** Test: Gerd legen, speichern, neues `Game` aus dem Stand, Kette ist offen.

**9 · Drei Flügel.**
- **Warum:** Flügel wie im Kloster und in Düsterbruch, Sitzungslänge wie in Retail. Handy-Sitzungen dauern 10–20 Minuten.
- **Wie:**
  - Siegel und Abkürzungen bleiben im Laufstand bis zum Tagesreset.
  - Jeder Siegel-Boss öffnet nach dem Sieg eine Abkürzung zum Hof: Kette, Aufzug, Pappwand.
  - Kleine Truhe je Flügel.
  - Das ist fast nur Daten in `content/dungeons.js` (`resetAt:'daily'`).
- **Prüfen:** Jeder Flügel ist mit Söldnern in 10–15 Minuten gemessen.

**10 · Söldner-Aufstellung nach Rolle.**
- **Warum:** Follower-Dungeons zeigen, dass NPC-Begleiter nur tragen, wenn sie richtig stehen: Tank dreht den Boss weg, Nahkampf steht dahinter, Fernkampf verteilt.
- **Wie:**
  - `COMPANION_ROLES.*.position:'tank'|'behind'|'spread'`.
  - `tickOne` wählt den Platz relativ zur Blickrichtung des Bosses.
  - Der Schutz-Söldner zieht den Boss so, dass die Gruppe hinter ihm steht.
  - Die Grundlage für `stack`/`spread`/`line` später.
- **Prüfen:** Bei Gerd steht im Mittel höchstens ein Nicht-Tank im Kegel.

**11 · Text-Diät und Handy.**
- **Warum:** Nutzerregel und E-67/E-70. WoW zeigt den Raumnamen einmal, Durchsagen als Sprechblase.
- **Wie:**
  - Weltschilder nur beim ersten Betreten bzw. beim Überfahren.
  - Durchsage als Sprechblase mit Lautsprecher-Symbol statt Zonentitel-Zeile.
  - Den Anheuer-Hinweis unterdrücken, wenn gerade der Raumtitel erscheint.
  - Erklärsatz der Karte ins Info-Symbol.
  - Im Bosskampf am Handy den Truppenrahmen auf vier schmale Balken einklappen, den Bossrahmen auf eine Zeile.
- **Prüfen:** Ein Screenshot je Raum zeigt höchstens einen Titel. `mobile-check`: Boss und Held im Kampf sichtbar.

**12 · Big B vorziehen.**
- **Warum:** Die Kernmechanik ist das Alleinstellungsmerkmal. Heute endet der Dungeon an einer Tür, die nicht aufgeht.
- **Wie:**
  - Engine-Merkmale `lie` und `line`, dazu `tracks` für parallele Timer (Siegelring alle 12 s neben dem Hauptzyklus) und `enrage`.
  - Big B in `DUNGEON_BOSSES` und `DUNGEON_CASTS`.
  - Vorläufig verlangt die Tresortür nur die Siegel gebauter Bosse (`lock.seals` gegen `DUNGEON_BOSSES` filtern).
  - Grundwert von `tell` 1,0 s mit Ton.
- **Prüfen:** Sim 150–200 s. Prüfer-Playtest: versteht die Lüge ohne Erklärung, am Handy lesbar.

---

## Empfehlungen zu V-D1 bis V-D11

| Nr. | Empfehlung | Begründung |
|---|---|---|
| V-D1 Nebenstrang nach Akt 1 | annehmen | Er ist schon live und gibt Söldnern und Gruppenspiel ein Ziel, ohne Akt 2 zu berühren. |
| V-D2 Stufe 8–10, fünf Köpfe, nur Normal | ändern | Stufe und Normal ja. Die Zahlen müssen aber gegen die gemessene Gruppenleistung neu gesetzt werden, und `difficulty` gehört sofort ins Datenmodell. |
| V-D3 Lokale Instanz zuerst | annehmen | Richtig für Browser und Söldner, mit Auflage: Der Laufstand muss das Neuladen überleben (Verbesserung 8). |
| V-D4 Ort Burgstraße | annehmen | Der Eingang wird zuverlässig gefunden, und der Witz trägt. |
| V-D5 Behauptung und Nachsatz | annehmen | Stärkste Idee des Plans. Big B als zweiten Boss vorziehen, `tell` auf 1,0 s. Attrappen bei Exposé erst, wenn die Lüge bei Big B im Playtest verstanden wird. |
| V-D6 Keine Sperre | annehmen | Wie Normal-Dungeons in Retail. Dazu Tagesbonus und Siegelmarken, sonst fehlt ein Grund zum Wiederholen außer Zufall. |
| V-D7 Set später | annehmen | Einzelteile reichen, solange Set-Boni nicht entschieden sind. |
| V-D8 Halbes Pferd 3 % vom 30-%-Boss | ändern | 0,9 % je Lauf heißt im Mittel rund 110 Läufe. Für den ersten Dungeon zu zäh, deshalb 3 % behalten und 10 Hafersäcke als sichere Alternative. |
| V-D9 Drei Ebenen, freie Reihenfolge | annehmen | Das ist gebaut und getestet. Zeitlich in Flügel teilen, am Grundriss nichts ändern. |
| V-D10 Prospekt-Karte | annehmen | Nur mit gezeichnetem Prospekt; die gestrichelten Kästen tragen die Idee nicht. Dazu Wegmarke und Boss-Krone mit Journal. |
| V-D11 Beweise schwächen Big B | ändern | 0,2 s früherer Nachsatz spürt niemand. Jeder Beweis sollte eine sichtbare Wirkung haben, z. B. eine Lügen-Art weniger oder +10 % Schaden mit Symbol im Bossrahmen. |

---

## Bauplan in fünf Etappen

Jede Etappe ist für sich spielbar und kann live gehen.

**Etappe 1 · „Gerd richtig“** (Verbesserungen 1, 2, 3, 8, dazu die Beute von Gerd aus 7)
- **Inhalt:**
  - Söldner-Faktor in Instanzen, Schaden als Anteil, Flächen auf Nicht-Tanks, Kegel mit Sichtlinie, Fallkante entschärft.
  - Tod als Geist mit Aufhelfen, Todesbildschirm-Text, Laufstand gespeichert.
  - Beutetabelle und EP für Gerd, `scripts/dungeon-sim.mjs`.
- **Prüfkriterium:**
  - Sim: Gerd mit Söldnern 60–100 s, „weicht nie aus“ stirbt mindestens einmal, „weicht aus“ höchstens einmal.
  - Unit-Test: Neuladen setzt fort.
  - Neuling-Playtest: erklärt Kegel und Kreis nach dem Kampf richtig.

**Etappe 2 · „Lesbar wie WoW“** (4, 5, 6, 11, Karte aus 7)
- **Inhalt:** Boss-Warnleiste mit Timer, Journal aus den Daten, Eingangskarte, Portal, Weltkarten-Marke, Text-Diät, Handy-Kampfansicht, Prospekt-Zeichnung und Wegmarke auf der Karte.
- **Prüfkriterium:** `ui:check` und `mobile-check` ohne Scrollen, Scorecard mindestens 4 je Bildschirm (E-08). Kenner nennt Gerds drei Fähigkeiten vor dem Kampf aus dem Journal.

**Etappe 3 · „Big B“** (12, 10)
- **Inhalt:** `lie`, `line`, `tracks`, `enrage`, Big B mit drei Phasen und Geständnis, Söldner-Aufstellung nach Rolle. Tresortür vorläufig nur mit Gerds Siegel, Endtruhe und Siegelmarken.
- **Prüfkriterium:**
  - Sim Big B 150–200 s.
  - Prüfer-Playtest am Handy: liest Behauptung und Nachsatz ohne Hilfe.
  - Erfolg „Der Nachsatz zählt“ ist erreichbar.
- **Danach:** Der Dungeon hat zum ersten Mal ein Ende.

**Etappe 4 · „Voller Durchgang“** (9, Rest von 7)
- **Inhalt:**
  - Exposé (`summon` mit `goal`, `decoy`, `interrupts:2`) und Kurt (`stack`, `spread`, `line`, `persist`), jetzt mit allen drei Siegeln.
  - Flügel-Reset täglich, Abkürzungen je Flügel.
  - Rita, das halbe Pferd, Vermieter Volker, Beweise, Erfolge, Titel, Hafersack-Garantie.
- **Prüfkriterium:**
  - Alle sechs Siegel-Reihenfolgen im Spiel gemessen.
  - Jeder Flügel mit Söldnern 10–15 Minuten.
  - Voller Durchgang mit Söldnern unter 50 Minuten.
  - EP je Minute ≥ Feld.

**Etappe 5 · „Zusammen und schwerer“**
- **Inhalt:**
  - Online-Instanz je Gruppe (`roomKey`, Plan Abschnitt 10), Versammlungsstein „Gruppe herholen“, Gruppensuche am Schwarzen Brett.
  - Heldenmodus und „Lüge der Woche“ als erste Affix-Stufe.
- **Prüfkriterium:**
  - Zwei-Spieler-Test wie bei E-38.
  - Gerd mit zwei Menschen und drei Söldnern im selben Korridor wie mit fünf Söldnern.

---

## Designfragen an den Nutzer

1. **Wie lang soll ein Besuch sein?**
   - a) ein Durchgang am Stück, 25–45 Minuten wie geplant
   - b) drei Flügel à 10–15 Minuten, Siegel bleiben bis zum Tagesreset, Big B als Abschluss
   - c) kurze 15-Minuten-Fassung mit weniger Räumen

   **Empfehlung b:** Sie passt zu Browser und Handy und behält den ganzen Grundriss.

2. **Allein mit Söldnern oder in der Gruppe?**
   - a) Söldner in Instanzen fast vollwertig (rund 85 % eines Spielers), eine Zahl für alle, Online-Gruppe als Zusatz
   - b) Söldner als Notnagel (rund 50 %), Menschen deutlich besser, Bosse skalieren mit Menschen
   - c) Pflicht-Gruppe online

   **Empfehlung a**, wie die Follower-Dungeons in WoW. Das Spiel hat wenig gleichzeitige Spieler, und E-45 hat genau das versprochen.

3. **Welche Schwierigkeitsstufen?**
   - a) jetzt nur Normal, Heldenmodus später
   - b) Normal und Heroisch sofort
   - c) nur Normal, und als Endspiel später „Lügen-Stufen“ wie Mythic+ mit wöchentlicher Lüge und Zeitlimit

   **Empfehlung a jetzt, c als Richtung.** Das Datenfeld `difficulty` sofort anlegen.

4. **Welches Belohnungsmodell?**
   - a) nur Zufallsbeute wie Classic
   - b) Zufallsbeute plus Siegelmarken beim Vermieter gegen Pech, dazu Tagesbonus
   - c) zusätzlich eine wöchentliche Truhe

   **Empfehlung b:** planbarer Fortschritt ohne Wochenzwang.

---

## Screenshots

`D:\Dev\MertlochChronicles-dungeon-design\_review\shots\`

| Datei | Zeigt |
|---|---|
| `01-welt-eingang.jpg` | Rolltor an der Burgstraße, Aktion „Schloss Big B betreten“ |
| `02-hof-betreten.jpg` | Hof mit Trash, vier Söldnern, Textstau aus Schild, Titel und Toast |
| `desk-03-gerd-kampf.jpg` | Gerd mit vier Söldnern, Gruppe steht als Haufen vor dem Boss |
| `desk-04-gerd-kegel.jpg` | Kegel-Warnfläche, reicht durch die Wand; abgeschnittener Hinweis im Bossrahmen |
| `05-gerd-phase2-adds.jpg` | Phase 2 mit Adds, Dresscode-Kreis liegt auf dem ganzen Nahkampf |
| `06-tod.jpg` | Todesbildschirm „Aufwachen bei St. Gangolf“ im Dungeon, Söldner mit vollem Leben |
| `07-kontrollpunkt-hof.jpg` | Aufstehen am Kontrollpunkt, „Alle am Boden“ |
| `08-karte-k1-prospekt.jpg` | Dungeon-Karte Keller 1, Prospekt als gestrichelte Kästen, Erklärsatz |
| `09-karte-e0.jpg` | Karte Erdgeschoss, besiegter Gerd durchgestrichen |
| `10-rittersaal-trash.jpg` | Rittersaal mit Gruppen, Beute von Gerd = Sigi-Tabelle im Log |
| `11-tresortuer.jpg` | Tresortür mit 1/3 Siegeln, Rattenschwarm im Weinkeller |
| `12-karte-k2.jpg` | Karte Keller 2 mit Siegelfeld |
| `13-thronsaal-leer.jpg` | Thronsaal ohne Big B, Titel dreifach |
| `phone-03-gerd-kampf.jpg`, `phone-04-gerd-kegel.jpg` | Handy 390 × 844: Rahmen verdecken die Arena |

Messskripte: `_review/dungeon-sim.mjs`, `_review/merc-dps.mjs`, `_review/dungeon-scenes.mjs`.
