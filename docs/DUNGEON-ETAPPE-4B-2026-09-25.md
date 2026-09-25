# Dungeon „Schloss Big B“ · Etappe 4 Teil B „Flügel, Beweise, Händler, Kampf-Klarheit“ · 2026-09-25

Grundlage:
- E-71 (`docs/ENTSCHEIDUNGEN.md`), Bauplan Etappe 4 und die Verbesserungen 7, 9 und 11 aus `docs/DUNGEON-ANALYSE-2026-09-24.md`
- Planung 4.2–4.5, 11, 12 und 13 aus `docs/DUNGEON-SCHLOSS-BIG-B-2026-09-23.md`
- Stand der Etappen 1–3, des Dungeon-Hotfix und der Dungeon-Räume

Zweig `dungeon-e4b`, Worktree `D:\Dev\MertlochChronicles-dg-e4b`. Die Prüfungen liefen in einem zweiten Worktree (`-dg-e4b-gate`), damit
laufende Prüfungen nicht die Arbeitskopie sehen. Teil A (Exposé, Kurt, Rita, halbes Pferd, Balance) lief parallel und ist seit 77c30249 auf `main`; Teil B ist darauf rebased
und misst die Flügel mit den echten Bossen. Dessen Bereiche sind nicht angefasst.

**Live:** Teil 1 (Kampf-Klarheit) als 45625e4a mit Build #624; Teile 2–4 als 6972a9b3, 3a6431e3 und 46b4397a mit **Build #693** (26.09.2026).

## Kurzfassung

- **Kampf-Klarheit (zuerst live):** Im Dungeon-Kampf wartet der Raumtitel bis nach dem Kampf. Große Kampfansagen stehen wie Raid-Warnungen
  oben mittig direkt unter dem Bossrahmen. Eigene Kampfrufe sitzen rechts neben dem Helden; im Bosskampf erscheinen sie nur als Symbol.
  Im Bosskampf gibt es keine Sprechblasen in der Welt; der Boss spricht in einer Zeile im Bossrahmen, über ihm steht nur sein Balken.
  Söldner-Meldungen stehen im Chat, Erinnerungen warten. Ist der Boss das Ziel, verschwindet der Zielrahmen auch am Desktop. Nach Q steht
  „Unterbrochen!“ auf der Warnleiste. Gemessen: Um Big B (Kreis 250 px) stehen beim Bosskampf **0** Textelemente außer Namen und Zahlen,
  gezählt mit Blasen, Kurzmeldungen, Fenstern und Erinnerungen (vorher sechs, siehe Screenshot aus Etappe 3).
- **Flügel:** Jeder Siegelträger öffnet nach dem Sieg eine Abkürzung zum Hof: Kette (Gerd), Getränkeaufzug (Kurt), Pappwand aus der
  Musterwohnung (Exposé, neu). Die Abkürzung gilt für den Durchgang und bis zum Tagesreset um 4 Uhr, auch in einem neuen Durchgang am selben Tag.
  Dazu kommt je Flügel eine kleine Truhe. Der Trash ist dichter gesetzt; geändert sind nur Anzahl und Verteilung der Packs.
- **Beweise:** Leihschein (Pelzmantel auf dem Carport-Dach), Mietvertrag (Vermieter Volker) und Kirmes-Urkunde (Presseamt, erst nach Rita).
  Die Wirkung aus Etappe 3 greift erst, wenn der Held die Beweise im Thronsaal vorlegt. Big B redet sich dann je Beweis heraus, und die Lupe
  steht im Bossrahmen.
- **Ereignisse:** Vermieter Volker hinter dem Fahrradschloss. Das Schlossgespenst als Streife, unverwundbar, bis man den Beamer im Weinkeller aussteckt.
- **Händler Vermieter Volker** im Hof: Dorflegenden gegen Siegelmarken, ein Wunschteil nach 4–6 vollen Durchgängen sicher.
- **Erfolge und Titel:** fünf neue Erfolge, Titel „Mieterschützer“ als Medaille am Namen im Figur-Fenster. Die Eingangskarte zeigt Bestzeit,
  Flügelstand und Erfolge.

## Stand je Punkt

| # | Punkt | Stand |
|---|---|---|
| 1 | Flügel-Fluss | erledigt; Zeiten teilweise: voller Durchgang 31,8–46,4 min (grün), 12 von 15 Flügelwerten in 10–15 min; Ausreißer siehe Zeitmessung |
| 2 | Beweise | erledigt (Social-Media-Managerin = Reichweiten-Rita ist Teil A; die Urkunde hängt schon an ihr) |
| 3 | Ereignisse unterwegs | erledigt (zwei: Vermieter Volker, Beamer mit Gespenst; die Durchsagen gab es schon) |
| 4 | Händler Vermieter Volker | erledigt (acht Waren mit Teil A, Hafersack inklusive) |
| 5 | Erfolge und Titel | erledigt |
| 6 | Kampf-Klarheit | erledigt, zuerst live |
| – | Nachtrag Prüfer-Playtest #562 | erledigt: Raumtitel auch beim Trash, Beschriftung und Tooltips der Verfolgung, „Unterbrochen!“ |
| – | Nachtrag Orchestrator (Bilder Etappe 4A) | erledigt: Erinnerung nicht im Kampf/in der Arena und höchstens einmal, Söldner-Meldungen in den Chat, Boss spricht im Bossrahmen statt über der Ansage, Bossname nur im Rahmen |

### 6 · Kampf-Klarheit (`dungeon-clarity.js`, `memory-seen.js`, `dungeon-e4b.css`, kleine Haken in `boss-alerts.js`, `enemy-ui.js`, `engine.js`, `renderer.js`, `companions.js`, `app.js`)

- **Raumtitel:** `dungeon-clarity.js` setzt die Körperklasse `dg-fight`, solange im Dungeon gekämpft wird, also sobald ein Gegner mit Aggro in
  Kampfnähe ist, beim Trash wie beim Boss.
  - Der Zonentitel wartet dann (`zone-announce.js` über `wait`) und kommt nach dem Kampf.
  - Ein schon laufender Titel verschwindet sofort.
- **Große Kampfansagen** („NACHSATZ ABWARTEN!“, Phasen, Wut) stehen wie Raid-Warnungen oben mittig direkt unter dem Bossrahmen. Die
  Schrift ist 24 statt 30 px.
  - Kurzmeldungen stehen im Bosskampf darunter (152 px), nicht mehr auf dem Bossrahmen.
  - Blasen außerhalb von Bosskämpfen weichen Bossrahmen und Ansage aus. Ein ausgeblendeter Zonentitel ist kein Hindernis mehr; er hatte
    Big Bs Blase bis unter den Bossrahmen gedrückt.
- **Kampfrufe** (IN FAHRT, SCHWUNG, UNTERBROCHEN, +EP):
  - Im Dungeon-Kampf stehen sie rechts neben dem Helden in 16 px, nicht mehr über ihm im Titelbereich.
  - Im Bosskampf erscheint nur das Symbol, EP-Zahlen bleiben. Das gilt auch für Söldner-Rufe.
- **Sprechblasen im Bosskampf** (Nachtrag nach den Bildern von Etappe 4A: „ZUSAMMEN STEHEN!“ lag über Kurts Blase):
  - In der Welt steht keine Blase mehr außer von Mitspielern (`BOSS_FIGHT_BARKS`). Söldner, Trash, Lautsprecher und Bewohner stehen im Chat.
  - Der Boss spricht in einer Zeile unter der Zauberleiste im Bossrahmen, 4 s lang (`engine.bark` merkt `lastBark`, `boss-alerts.js` zeigt
    sie). Behauptung und Nachsatz stehen schon in der Zauberleiste und erscheinen dort nicht doppelt. Die Ansage bleibt unter dem Rahmen,
    auch wenn er wächst.
  - Über dem Boss steht im Bosskampf nur der Balken; den Namen trägt der Bossrahmen (`renderer.js`, Namensschild).
  - Welt-Worte, die nur doppeln, was Bossrahmen und Warnleiste zeigen, entstehen im Bosskampf gar nicht (`quietFloat`): GESTÄNDNIS, DIE GANZE
    WAHRHEIT, REICHWEITE, UNTERBROCHEN n/m, SELBST RAUSGEZOGEN.
  - Zertifikat und Hausverbot auf Söldnern entfallen ebenfalls, am Helden bleiben sie. Die Liste steht in `DUNGEON_E4B.clarity`.
- **Zielrahmen:** Ist der Boss das Ziel, ist der Zielrahmen auch am Desktop weg; der Bossrahmen zeigt ihn.
- **Söldner-Statusmeldungen** (angeheuert, am Boden, wieder auf, entlassen, Vertrag abgelaufen) stehen im Dungeon und im Kampf nur im Chat,
  nicht als Kurzmeldung über der Bildmitte (`companions.js statusNote`). Draußen im Ruhezustand bleiben sie Kurzmeldung.
- **Erinnerungen** (Befund: „Erinnerung – Der Stempel“ ging mitten im Bosskampf auf):
  - Neue Erinnerungen warten im Dungeon-Kampf und solange der Held in einer Boss-Arena steht (`memoryBlocked`, eingehängt in die
    Erinnerungs-Schlange aus E-72 Runde 4, `memoryHeld`). Eine schon offene Erinnerungskarte tritt dort zurück (dazu die Körperklassen
    `dg-fight`, `dg-arena`) und kommt danach wieder.
  - „Bei jedem Einloggen“ ließ sich mit dem lokalen Spielstand nicht nachstellen: Nach dem Neuladen blieb „Der Stempel“ gesehen. Möglicher
    Weg ist ein älterer Wolkenstand. Deshalb merkt sich das Gerät gesehene Erinnerungen je Held zusätzlich und legt sie beim Laden dazu
    (`memory-seen.js`). Jede Erinnerung erscheint damit höchstens einmal.
- **Unterbrechen** (Prüfer #562):
  - Ist ein unterbrechbarer Zauber weg, bevor er fertig war, und der Gegner betäubt, steht „Unterbrochen!“ 1,3 s grün auf der Warnleiste
    und in der Zauberleiste des Bossrahmens, dann erlischt es. Das gilt für Held und Söldner.
  - Bei „zweimal unterbrechen“ zeigt die Zeile „Unterbrochen 1/2 · nochmal!“.
- **Messung** (`dungeon-e4b-check` Teil 1): Textelemente im Kreis von 250 px um Big B außer Namen und Zahlen, gezählt werden Zonentitel,
  Meilenstein, Kampfrufe, Sprechblasen, Welt-Worte, Kurzmeldungen, Fenster und Erinnerungen. Das Prüfskript legt die Quellen aus dem Befund dazu:
  Söldner neu anheuern, Söldner-Spruch, eine Erinnerung, „IN FAHRT“, „SCHWUNG“.
  - Beim Bosskampf mit der Lüge sind es **0**.
  - Die Ansage unter dem Bossrahmen liegt 277–294 px vom Boss entfernt.
  - Vorher waren es sechs Elemente: Zonentitel mit Unterzeile, Söldner-Blase, „NACHSATZ ABWARTEN!“, „IN FAHRT“ und der Zielrahmen doppelt
    (`dungeon-e3/03-behauptung.jpg`).

### 1 · Flügel-Fluss

- **Abkürzungen** (`content/dungeons.js` `transitions[].shortcut`, `dungeon.js` `openShortcuts`/`shortcutState`/`gateShut`):
  - Der Sieg über den Siegelträger öffnet seine Abkürzung für diesen Durchgang und im Tagesstand (`dungeons[id].daily.shortcuts`).
  - Ein neuer Durchgang am selben Tag übernimmt sie: Gerd steht wieder, die Kette bleibt offen.
  - Kette (Gerd): wie bisher, jetzt auch tagesfest.
  - Getränkeaufzug (Kurt): Der Hebel unten öffnet ihn wie in Etappe 1. Kurts Sieg öffnet ihn zusätzlich von oben, Volkers Aufzugschlüssel ebenfalls.
  - Pappwand (Exposé): neuer Übergang von der Musterwohnung in den Hof, bis Exposé liegt zu (`gate` von der Hofseite, `shortcut.only`).
  - Sperren und Abkürzungen von Bossen, die nicht in `DUNGEON_BOSSES` stehen, greifen nicht.
- **Kleine Truhe je Flügel** im Raum des Siegelträgers (`wings[].chest`, `DUNGEON_REWARDS.wingChest`): Nach dem Sieg glimmt sie. F öffnet einen
  Beute-Moment mit einem Teil (ungewöhnlich, zu 35 % selten, Stufe = Boss + 1) und einer Siegelmarke; einmal je Durchgang, nichts wird angelegt.
- **Trash-Dichte:** Nur Anzahl und Verteilung der Packs, keine Werte je Gegner. Die Packs halten die Kontrollpunkt-Regel des Hotfix und die
  Requisiten-Regel der Räume ein.
  - Burghof: Kanzlei Nord und Süd je Makler und zwei Azubis, neu das „Archiv“ (Ritter und Makler); Wehrgang drei Gruppen aus zwei
    Pappschützen und einem Azubi.
  - Rittergeschoss: unverändert. Mit Exposé, Rita und dem halben Pferd trägt der Flügel schon drei Bosse; zwei neue Packs („Bar“,
    „Galerie West“) trieben ihn in der Simulation über 20 min und sind wieder heraus.
  - Basaltgewölbe: neu Gewölbe Ost (zwei Ritter), Süd (Makler, zwei Azubis, Ritter), „Tresor“ und „Keller“ (je zwei Azubis, Makler,
    Ritter) und der Rattenschwarm „West“. Dazu die Gespenst-Streife.
  - Höchstens vier Gegner je Pack außer Rattenschwärmen und keine drei gleichen, damit Schwarm-Schilder und die Requisiten-Prüfung der Räume passen.
- **Flügelstand:**
  - Die Verfolgung zeigt „Siegel n/m“ mit je Flügel einem Siegel: voll = heute erledigt, blass = Siegelträger folgt noch. Der Tooltip nennt
    Flügel und Boss.
  - Die Eingangskarte zeigt denselben Stand als Chip.
- **Tagesreset:** Siegel, Abkürzungen, Flügel und Tagesbonus hängen am Spieltag (Wechsel 4 Uhr, Etappe 1). Unit-Test: am nächsten Tag ist die Kette wieder zu.

### Zeitmessung je Flügel (`node scripts/dungeon-sim.mjs --only=wings`, Held Stufe 10 + 4 Söldner, alle fünf Klassen)

„Ein Pack je Zug“ zieht jeden Pack für sich, wie ein sorgfältiger Spieler. Gezählt sind Wege (Dijkstra über die Übergänge, Abkürzungen
erst nach ihrem Boss), Kämpfe, Erholung, Tode samt Rücklauf, Beute (4 s je Pack, 8 s je Boss), Funde, Ereignisse und die kleine Truhe.
Das Rittergeschoss trägt drei Bosse (Exposé, Rita, halbes Pferd); das halbe Pferd ist selten und hier immer dabei.

| Klasse | Burghof | Rittergeschoss | Basaltgewölbe | Big B | voller Durchgang | Nachbarn ziehen mit (nur Angabe) |
|---|---:|---:|---:|---:|---:|---:|
| Dieter (Kneipenschläger) | 11,0 | 11,5 | 11,3 | 2,4 | **36,2** | 37,8 |
| Bärbel (Putzpyramide) | 10,0 | 10,8 | 11,0 | 2,3 | **34,2** | 43,9 |
| Kevin (Pfandjäger) | 10,8 | 22,0 ¹ | 10,2 | 2,4 | **46,4** | 41,9 |
| Schorsch (Flambierer) | 15,1 ² | 13,6 | 10,5 | 2,3 | **41,6** | 76,8 |
| Käthe (Grand-Spielerin) | 9,8 | 8,6 | 10,2 | 2,2 | **31,8** | 33,8 |

Minuten. Kriterien:
- **Voller Durchgang unter 50 min:** grün für alle Klassen (31,8–46,4).
- **Jeder Flügel 10–15 min:** 12 von 15 Werten im Band.
  - ¹ Kevin: Reichweiten-Rita bleibt bei 4 % 480 s unsichtbar, weil ihr Fokus, der Söldner Radler-Rita, selbst im Greenscreen steht
    und sie ihm dorthin folgt. Ohne den Hänger wären es etwa 12 min. Das ist Rita-Logik aus Teil A (`tickE4Boss`); hier nicht angefasst.
  - ² Schorsch: Beim Hof-West-Pack gerät Gästeliste-Gerd mit in den Kampf (404 s). Der Pack stammt aus Etappe 1 und ist hier unverändert.
  - Käthe ist die schnellste Klasse und liegt knapp unter 10 min. Mehr Trash für sie würde die anderen Klassen über 12 min heben.
- **EP je Minute 1–2× Feld (Wiederholung am selben Tag):** grün für Dieter, Bärbel, Käthe (111–156 bei Feld 81–86). Kevin liegt wegen
  des Rita-Hängers darunter (69).
  - Schorsch zeigt im Basaltgewölbe 274: Korken-Kurt fiel dort schon im Trash-Kampf davor, weil der Held beim Ausweichen bis in die
    Kelterhalle zurückwich. Die Rechnung für die Wiederholung zieht Kurts EP dann nicht ab.
  - Der erste Lauf des Tages liegt mit Tagesbonus bei 123–319, also meist über 2× Feld. Das tragen die Boss-EP samt Tagesbonus
    (Etappe 1 und Teil A), nicht der Trash. Offen als Balance-Frage.
- „Nachbarn ziehen mit“ zieht Packs in der Nähe mit. Das ist eine Belastungsprobe mit vielen Wipes (5–13) und kein Kriterium.

**Änderungen an der Simulation:**
- Streifen wartet der Held an der Ecke ihres Wegs ab, die am weitesten von anderen Packs und Bosstüren liegt. Vorher stand er drei
  Kacheln unter der Galerie-Streife schon in der Musterwohnung und zog Exposé mit.
- Den Beamer steckt er im Basaltgewölbe zuerst aus.
- Ratten, die auf dem Rückweg hängen, setzt die Simulation nach 10 s ohne Kampf zurück, wie das Spiel, sobald der Held sich abwendet
  (`encounters.js`). Danach zieht der Held sie wieder. Vorher liefen zwei Rattenkämpfe bis zum Limit von 600 s.
- Werte je Klasse lassen sich mit `SIM_CLASS`, `SIM_MODE=careful` und `SIM_DEBUG=1` einzeln ansehen. Hängende Kämpfe listen dann die
  Gegner, die noch stehen.

### 2 · Beweise (`evidence.finds`, `evidence.present`, `dungeon.js` `findEvidence`/`presentEvidence`)

| Beweis | Fundort | Wie | Hinweis im Tooltip, solange er fehlt |
|---|---|---|---|
| Leihschein vom Kostümverleih | Wehrgang (Carport-Dach), Pelzmantel | F „Pelzmantel durchsuchen“ | „Das Dach ist nur Deko. Betreten verboten.“ |
| Mietvertrag | Burgverlies, Vermieter Volker | Ereignis (Wachen, dann Fahrradschloss) | „Im Keller wohnt niemand. Schon gar nicht der Vermieter.“ |
| Kirmes-Urkunde „Freiherr (Schießbude)“ | Presseamt, Tisch | F „Urkunde einstecken“, erst nach Rita (sobald Teil A sie baut) | „Liegt im Presseamt. Die Pressefrau passt darauf auf.“ |

- **Gefunden ist noch nicht vorgelegt.**
  - Im Thronsaal an der Tresortür bietet F „Beweise vorlegen (n)“ an, solange Big B nicht kämpft.
  - Alle gefundenen gelten dann sofort (Wirkung aus Etappe 3: eine Lüge weniger bzw. +10 % Schaden, alle drei: Geständnis bei 30 %).
  - Big B antwortet im Abstand von 2 s mit je einer Ausrede aus der Planung.
- **Anzeige:**
  - Verfolgung: drei Lupen, leer gestrichelt = fehlt, blass mit Goldpunkt = gefunden, voll = vorgelegt; jeder Tooltip mit Name und Stand.
  - Bossrahmen: Lupe mit Wirkung im Tooltip (Etappe 3).
- **Social-Media-Managerin:** In der Planung ist das Reichweiten-Rita; sie gehört zu Teil A. Die Kirmes-Urkunde und der Erfolg „Beweislast“
  hängen an ihr, sobald sie in `DUNGEON_BOSSES` steht.

### 3 · Ereignisse unterwegs (`events`, `dungeon.js` `freeVolker`/`unplugBeamer`, Zeichnung `dungeon-e4b-art.js`)

- **Vermieter Volker** (Burgverlies):
  - Hinter der Waschküchentür mit Fahrradschloss steht eine vorhandene Katalogfigur als Platzhalter; neue Figurengrafik erst nach Freigabe.
  - Solange die drei Wachen stehen, sagt F nur „Drei Wachen stehen noch davor.“ Danach öffnet F „Fahrradschloss knacken“.
  - Volker erzählt zwei Zeilen als Sprechblase („Seit Dienstag … Jahrgang Dienstag.“) und gibt Mietvertrag und Aufzugschlüssel; der Aufzug
    ist damit für heute offen.
  - Danach steht er dauerhaft als Händler im Hof (`dungeons[id].volker`).
- **Beamer und Schlossgespenst:**
  - Das Gespenst läuft die Ostseite der Gewölbegänge ab.
  - Solange der Beamer auf der Bierkiste im Weinkeller läuft (Lichtkegel nach Osten), ist es nur ein Bild: Treffer wirken nicht, es zeigt „PROJEKTION“.
  - F „Beamer ausstecken“ geht auch mitten im Kampf. Das Gespenst verschwindet („NUR EIN FILM“) und zählt als besiegt.
  - Die Projektion hält niemanden fest: Steht kein echter Gegner mehr neben ihr im Kampf, verblasst sie nach 4 s und läuft ihre Runde weiter.
    Vorher endete ein Kampf, in den das Gespenst geraten war, nie (in der Simulation 600 s am Tresor).
  - Figur: Katalogfigur mit blasser Tönung.

### 4 · Händler Vermieter Volker (`dungeon-vendor-ui.js`, `vendorStock`/`vendorBuy`)

- **Standort und Fenster:**
  - Im Hof neben dem Rolltor, sobald Volker einmal befreit ist.
  - F öffnet ein Einzelfenster ohne Scrollen: Kopf mit Porträt und Siegelmarken, darunter je Ware Symbol und Preis.
  - Was die Ware ist, zeigt der Gegenstands-Tooltip; Preis, Fehlbetrag und „schon im Besitz“ stehen im Tooltip des Preisknopfs.
- **Ware aus den Daten:** die Dorflegenden (`unique`/`uniques`) der Beutetabellen aller gebauten Bosse. Mit Teil A sind es sieben:
  Gästeliste, Hochglanz-Exposé, Ringlicht der Reichweite, Das vordere Hufeisen, Korkenzieher des Kellermeisters, Siegelring „Echt Gold“ und
  Pelzmantel des Barons. Sie kamen ohne Änderung an Teil B dazu. Dorflegenden gibt es nur einmal.
- **Hafersack:** 3 Siegelmarken je Sack, seit Teil A `ITEMS.hafersack` liefert. Den Tausch gegen das halbe Pferd hat Teil A am Fahrstall.
- **Handy:** Acht Waren passen ohne Scrollen ins Fenster (kompakte Kacheln auf Touch, Tasten 44 px).
- **Preise** (`DUNGEON_E4B.prices`): Ein Lauf ist ein voller Durchgang. Mit den Bossen aus Teil A bringt er ohne das seltene halbe Pferd
  **26 Marken** als erster des Tages (5 Bosse × 2, Tagesbonus 5 × 2, drei kleine Truhen, Endtruhe 3) und **16** als Wiederholung.
  - Der erste Entwurf rechnete je Flügel-Lauf (24 Marken). Mit Teil A hätte ein einziger voller Durchgang für jede Dorflegende gereicht;
    die Preise sind deshalb auf den vollen Durchgang umgestellt.
  - Ein Flügel allein bringt 3–5 Marken (Rittergeschoss mit Rita 5–9); dort dauert es entsprechend länger, je Minute ist es ähnlich.

| Quelle | Preis | sicher nach (erster des Tages, dann Wiederholungen) | mit lauter ersten des Tages |
|---|---:|---|---|
| Gerd, Exposé, Kurt, halbes Pferd | 90 | 5 Läufen | 4 Läufen |
| Rita | 80 | 5 Läufen | 4 Läufen |
| Big B (Siegelring, Pelzmantel) | 100 | 6 Läufen | 4 Läufen |
| Hafersack (zehn für das halbe Pferd) | 10 | 100 Marken = 6 Läufe; jeder Sack aus einem Pferde-Sieg spart zehn | – |

Dazu kommt die eigene Chance der Dorflegende (12–15 %). Der Unit-Test rechnet die Läufe aus den Daten nach (4–6, nie unter 3).

### 5 · Erfolge und Titel (`DUNGEON_FEATS`, `DUNGEON_TITLES`, `dungeon-e4b-ui.js`)

| Erfolg | Bedingung | Symbol |
|---|---|---|
| Der Nachsatz zählt (Etappe 3) | Big B ohne Treffer durch eine gelogene Kanonenkugel | Lüge |
| **Beweislast** → Titel **Mieterschützer** | Big B mit allen drei Beweisen vorgelegt (und Rita besiegt, sobald gebaut) | Lupe |
| Stempelkarte voll | alle Siegel an einem Tag | Siegel |
| Termin eingehalten | voller Durchgang unter 45 min (alle Siegelträger im selben Durchgang) | Uhr |
| Ohne Kratzer | voller Durchgang ohne Tod des Helden | Kreuz |
| Halb gesehen | das halbe Pferd im Stall gesehen (Teil A) | Stern |

- **Figur-Fenster:** Der Titel steht als Medaille neben dem Namen in der Titelzeile. Der Tooltip zeigt Titel und Erfolge; das Fenster wird
  nicht höher.
- **Eingangskarte:**
  - Die Bestzeit steht statt „–“, sobald es einen Abschluss gibt (Etappe 3 schreibt `best`).
  - Dazu Chips für den Flügelstand und für Erfolge „n/6“ mit Liste im Tooltip.
- „Termin“ und „Ohne Kratzer“ zählen nur, wenn alle gebauten Siegelträger im selben Durchgang fielen. Sonst reichte ein Kurzbesuch mit
  tagesfesten Siegeln.

## Prüfungen

Gelaufen auf dem Stand vor dem Push (Worktree `-dg-e4b-gate`, danach nur Symbol-Commits von `main` dazu; `npm test` und
`dungeon-e4b-check` Teil 1 und 7 danach noch einmal).

| Prüfung | Ergebnis |
|---|---|
| `npm test` | grün (1183) |
| `npm run content:check` | grün (57) |
| `npm run build` | grün |
| `npm run ui:check` | grün |
| `dungeon-check` | grün (einmal rot unter Last bei „Treppe ins Rittergeschoss“, allein und auf `main` grün) |
| `dungeon-e1-check` | grün (7) |
| `dungeon-e2-check` | grün |
| `dungeon-e3-check` | grün (14) |
| `dungeon-e4a-check` | grün (36) |
| **`dungeon-e4b-check`** (neu) | grün (11 Prüfungen, Desktop und Handy) |
| `dungeon-sim` (alle Teile) | grün (34 Kriterien) |
| `dungeon-sim --only=wings` (alle fünf Klassen) | teilweise, siehe Zeitmessung |
| `dungeon-hotfix-check` | **rot, vorbestehend:** erwartet einen gesperrten Journal-Platz; seit Teil A alle Bosse baut, gibt es keinen. Auf `main` (61b4932a) ebenso rot. |

`tests/dungeon-e4b.test.mjs` hat 16 Unit-Tests: Klarheit, Abkürzungen, Pappwand und Aufzug, kleine Truhe, Beweise, Urkunde nach Rita,
Volker, Beamer, Projektion verblasst, Händler, Preise, Erfolge und Titel, Laufstand, Erinnerungen.

**Screenshots** (`visual-review/dungeon-e4b/`, lokal, 1600×900 und Handy 390×844):

| Bild | zeigt |
|---|---|
| `01-bosskampf-behauptung.jpg` | Bosskampf ohne Raumtitel, ohne Zielrahmen, ohne Blase in der Welt; Boss spricht im Rahmen |
| `02-bosskampf-ansage.jpg` | große Ansage direkt unter dem Bossrahmen |
| `03-unterbrochen.jpg` | „Unterbrochen!“ grün auf Warnleiste und im Bossrahmen |
| `04-trash-kampf-ohne-titel.jpg`, `05-trash-titel-danach.jpg` | Raumtitel wartet im Trash-Kampf, kommt danach |
| `10-verfolgung-tooltip.jpg` | Verfolgung mit Siegeln je Flügel und Lupen, Tooltip |
| `11-kleine-truhe.jpg`, `12-kleine-truhe-beute.jpg` | kleine Truhe nach Gerd, Beute-Moment |
| `13-eingangskarte-fluegel.jpg`, `23-eingangskarte-bestzeit.jpg` | Eingangskarte mit Flügelstand, Erfolgen und Bestzeit |
| `14-pelzmantel.jpg`, `15-beweis-vorgelegt.jpg`, `16-bossrahmen-beweis.jpg` | Beweis finden, vorlegen, Lupe im Bossrahmen |
| `17-volker-befreit.jpg`, `18-beamer.jpg`, `19-beamer-aus.jpg` | Ereignisse |
| `20-haendler.jpg`, `21-haendler-getauscht.jpg` | Händlerfenster, Tausch |
| `22-titel-figur.jpg` | Medaille „Mieterschützer“ im Figur-Fenster |
| `24-handy-bosskampf.jpg`, `25-handy-haendler.jpg` | Handy |

## Restliste

- **Rita hängt (Teil A):** Steht ihr Fokus-Söldner selbst im Greenscreen, folgt sie ihm dorthin und bleibt unsichtbar; in der
  Simulation mit Kevin 480 s bei 4 %. Das ist Rita-Logik in `tickE4Boss` (Teil A) und hier nicht angefasst. Vorschlag: Fokus wechseln
  oder den Greenscreen nach seiner Dauer verlassen, auch wenn der Fokus drinsteht.
- **Gerd im Hof-West-Kampf:** Mit Schorsch gerät Gästeliste-Gerd in der Simulation in den Kampf gegen den Hof-West-Pack (404 s).
  Pack und Arena stammen aus Etappe 1/Hotfix und sind unverändert.
- **Ratten hängen auf dem Rückweg:** Geflohene Pfandratten laufen bis in entfernte Ecken, verlieren die Leine und finden nicht zurück,
  solange der Held in der Nähe bleibt (`encounters.js` setzt sie erst zurück, wenn er weit weg ist). Im Spiel sieht das nach „Ratte
  steckt in der Ecke“ aus. Die Simulation setzt sie jetzt zurück; im Spiel ist es offen (Etappe 2, nicht angefasst).
- **EP je Minute beim ersten Durchgang des Tages** liegt meist über 2× Feld. Boss-EP und Tagesbonus tragen den Großteil; Wiederholungen
  liegen im Band. Das ist eine Balance-Frage der Boss-EP (Etappe 1/Teil A), nicht der Trash-Dichte.
- **Händlerpreise sind eine Setzung:** Ein Lauf ist hier ein voller Durchgang (4–6 bis zum Wunschteil). Wer nur einzelne Flügel spielt,
  braucht deutlich mehr Flügel-Läufe (je Minute ähnlich viele Marken). Wenn „Lauf“ als Flügel-Lauf gemeint war, reicht ein Wert in
  `DUNGEON_E4B.prices`; der Unit-Test rechnet mit.
- **Figuren sind Platzhalter:** Vermieter Volker nutzt die Katalogfigur „konrad“, das Schlossgespenst „inspector“. Eigene Figurengrafik erst
  nach Freigabe.
- **Texte** (Volker, Ausreden, Hinweise, Erfolge) sind Entwürfe nach E-20 und brauchen den Textdurchgang.
- **Playtests** (Neuling, Kenner, Prüfer) für Teil B liefen nicht; `mobile-check` lief nicht, das Handy ist im `dungeon-e4b-check` Teil 9 geprüft.
- **`dungeon-hotfix-check`** erwartet mindestens einen gesperrten Platz im Journal. Seit Teil A alle Bosse baut, gibt es keinen mehr; die
  Erwartung ist veraltet (Hotfix-Thema, nicht angefasst).
- **„Erinnerung bei jedem Einloggen“** ließ sich lokal nicht nachstellen. Das gerätefeste Merken je Held (`memory-seen.js`) verhindert die
  Wiederholung, auch wenn ein älterer Wolkenstand sie vergessen hat; die Ursache im Wolkenstand ist nicht belegt.
- **`dungeon-check` unter Last:** Einmal rot bei „Treppe ins Rittergeschoss“, als acht Prüfungen parallel liefen; allein grün, auf `main`
  ebenfalls grün.
