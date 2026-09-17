# Übergabe Inhalt → Engine/UI · 2026-09-17 · Akt 1 „Filmriss“

Gestaltung: docs/AKT-1-FILMRISS.md. Daten: `content/` (Branch `content-backend`). Engine-Bedarf ist in content/BACKLOG.md eingetragen; hier steht, was die UI aus den vorhandenen Daten machen soll und wo heute noch Texte im UI-Code stehen.

## 1. Hardcodes ersetzen (sofort möglich, ohne Engine)

Die Story heißt nicht mehr „Die letzte Kiste“; Kapitel 1 heißt „Der übliche Verdächtige“, der Akt „Filmriss“. Diese Stellen lesen heute feste Texte:

| Datei | Stelle | Ersetzen durch |
|---|---|---|
| app.js:101 | `'Die letzte Kiste'` / `'Mertloch bleibt wach'` | `STORY_CHAPTERS[0].title`, nach Abschluss `MAIN_DIALOGUE.ida.claimed.title` |
| app.js:103 | Aufgabenlabels | `STORY_CHAPTERS[0].objectives[i].label` |
| app.js:126 | `detail:'Die letzte Kiste · Hauptgeschichte'` | `STORY.title+' · Kapitel 1'` |
| app.js:116 | `'Horst liegt! …'` | `BOSS_LINES[bossId].defeat` |
| clan-ui.js:4 | Clan-Menü-Text („Jemand hat die letzte Kiste geklaut“) | `LORE.hero` + Hinweis „Klamotten aussuchen“ (`TUTORIAL.clan`) |
| clan-ui.js:8 | Journal-Text, Eyebrow „DIE LETZTE KISTE“ | `STORY_CHAPTERS[0].summary`, Labels aus `objectives`, Belohnung aus `reward` |
| questlog-ui.js:4 | Hauptquest-Eintrag | Titel/Summary/Labels/Reward aus `STORY_CHAPTERS[0]` |
| index.html:34, 44 | `<h1>Die letzte Kiste ist persönlich.</h1>`, `#questTitle`, Belohnungszeile | `STORY.title` / `ACTS[0].subtitle`; Belohnung aus `reward` |
| engine.js:100, 107 | Log „Auftrag angenommen: Die letzte Kiste.“, Ziel-Labels | `STORY_CHAPTERS[0].title`; Labels aus `objectives` (Engine-Seite) |

## 2. Neue Daten und was die UI daraus baut

| Export (content/index.js) | Inhalt | UI |
|---|---|---|
| `STORY.hero`, `LORE.hero/destruction/suspects` | Startzustand und Ausgangslage | Intro-Fenster vor der Hofprobe (ein Absatz), Clanbuch-Reiter „Geschichte“ |
| `ACTS`, `STORY_CHAPTERS[].act/clue/memories/unlocks` | Akt-Struktur, Hinweis je Kapitel | Clanbuch: Kapitel-Liste mit Status, nach Abschluss der `clue` als „Was wir wissen“ |
| `MAIN_DIALOGUE.ida.<dialogue>` mit `ongoing/reward/claimed` | Kapitel 2–4 haben dieselben Zustände wie Kapitel 1, nur unter ihrem Schlüssel | Ida-Dialog liest `chapterDialogue(n)` und dessen `ongoing/reward/claimed` statt der festen `intro/…`-Schlüssel |
| `HUB_TALK`, `hubLine(npcId, chapter, index, actDone)` | Mentoren-Sprüche je Kapitel | Sprechblase/Popup beim Ansprechen von Dieter/Anni/Kevin an der Bude (braucht Mentor-NPCs, Engine) |
| `MEMORY_FRAGMENTS`, `triggeredMemories(event, seen)` | Erinnerungsfetzen | Einblendung (Titel + Text, Sepia, eine Schaltfläche „Weiter“); Clanbuch-Reiter „Erinnerungen“ mit gesehenen Fetzen und `clue` |
| `BUILDINGS`, `buildingsUnlocked`, `nextStage`, `buildingEffects` | Basisbau | Clanbuch-Reiter „Bude“: je Gebäude Pate, Stufe, nächste Kosten (Material im Rucksack gegenüberstellen), Vorteil; Schaltfläche „Ausbauen“ nur wenn Material reicht |
| `SYSTEM_LINES.memory/building/chapterReady` | Toasts | wie levelUp |
| `TUTORIAL.clan = 'Klamotten aussuchen'` | Klassenwahl heißt jetzt Klamottenwahl | Beschriftung im Hofproben-Dialog; Clan-Menü-Überschrift „Wessen Klamotten?“ |
| `NPCS.dieter/baerbel/kevin` (`member:true`), `NPCS.pit` | Mentoren und Pit als Welt-NPCs | Porträt aus `PERSON_APPEARANCE`/classes.js; Pit braucht ein Porträt (ART-BRIEF) |

## 3. Prüfen

- `npm run content:check` grün (15 Tests, davon zwei neue für Akt-Struktur und Basisbau).
- Klickpfad nach UI-Umbau: Hofprobe → Ida-Intro (neuer Text) → drei Ziele mit neuen Labels → Horst → Belohnungsdialog (Alibi, Busticket) → `claimed`-Zeile. Screenshot in `*-review/`.
- Clanbuch bleibt EIN Fenster mit Reitern (docs/MENUE-BEWERTUNG-2026-09-17.md): „Erinnerungen“ und „Bude“ sind Reiter, keine neuen Fenster.

## 4. Engine → UI (Stand 2026-09-17, Branch `content-backend`)

Akt 1 läuft jetzt vollständig in der Engine: Kapitel 1–4 mit eigenen Lagern, Erinnerungsfetzen, Basisbau und Mentoren an der Bude. Alles Folgende ist neu am Spielzustand (`game.*`, `game.save()`) oder als Ereignis (`game.emit`). Texte kommen weiterhin ausschließlich aus `content/` – die Engine liefert nur IDs, Zahlen und Zustände.

### 4.1 Kapitelzustand

| Name | Typ | Wann gesetzt | Was die UI tun soll |
|---|---|---|---|
| `game.quest.chapter` | 1–4 | beim Laden; +1 nach jedem abgeholten Kapitel | Titel/Text aus `chapterAt(n)` bzw. `chapterDialogue(n)` holen statt `MAIN_DIALOGUE.ida.intro` fest zu verdrahten |
| `game.quest.accepted` | bool | `acceptQuest()`; nach Kapitelwechsel wieder `false` | Angebot vs. Laufendes Gespräch |
| `game.quest.chapterClaimed` | 0–4 | nach `claimQuest()` | schaltet Basisbau frei (`buildingsUnlocked(chapterClaimed)`), Kapitel-Liste im Clanbuch |
| `game.quest.claimed` | bool | = `chapterClaimed >= 1` | **nur noch Kapitel 1** (alte Spielstände, altes HUD). Für „Kapitel erledigt?“ ab jetzt `chapterClaimed` benutzen |
| `game.quest.actDone` | bool | nach Kapitel 4 | Aktschluss: Ida zeigt `MAIN_DIALOGUE.ida.bus.claimed`, `destination()` liefert `null`, keine neue Annahme mehr |
| `game.quest.counts` | `{ "<kapitel>:<zielindex>": n }` | bei Kills/Sammelpunkten ab Kapitel 2 | nicht direkt lesen – `chapterProgress()` benutzen |
| `game.quest.gathered` | `string[]` | eingesammelte Sammelpunkte (welt-gebunden) | Punkte in der Welt ausblenden, die schon abgeräumt sind |
| `game.quest.wolves/cultists/boss` | Zahl/bool | unverändert – Speicherfelder von Kapitel 1 | nicht mehr direkt fürs HUD lesen |

Neue Methoden:

- `game.chapter()` → aktuelles `STORY_CHAPTERS`-Objekt (Titel, Summary, Ziele, Belohnung, Hinweis, Fetzen, unlocks).
- `game.objectives()` → `objectives` des laufenden Kapitels.
- `game.chapterProgress()` → `[{objective, done, need, complete}, …]` – genau das, was `#questTasks` braucht (Label aus `objective.label`, Zähler aus `done/need`).
- `game.questReady()` → alle Ziele erfüllt und noch nicht abgeholt.
- `game.rewardKey()` → `'main'` (Kapitel 1) bzw. `'main-2/3/4'`. **Pflicht:** `rewardPanel(game, game.rewardKey())` statt fest `'main'`, sonst passt die Auswahl ab Kapitel 2 nicht zu `claimQuest()`.
- `game.destination()` → Wegmarke; `label` ist jetzt das Ziel-Label aus `content/story.js`, nicht mehr „Geplünderter Grillplatz“ o. Ä.
- Ereignis `chapterChanged {chapter, claimed, actDone}` nach `claimQuest()` → Questlog/Clanbuch neu zeichnen, Kapitel-Belohnungsdialog schließen.

### 4.2 Sammelpunkte (Ziel-Art `gather`)

Kapitel 2–4 haben je ein `gather`-Ziel. Fortschritt = eingesammelte Punkte **oder** Bestand im Rucksack (was mehr ist) – wer das Material aus Beute hat, muss nicht sammeln, wer baut, verliert keinen Fortschritt.

- `game.gatherPoints()` → offene Punkte `{id, x, y, item}` des laufenden Kapitels (zeichnen wie Questgegenstände).
- `game.gatherInteraction()` → Punkt in Reichweite (36) für die Aktionstaste; Beschriftung z. B. `ITEMS[p.item].name + ' sammeln'`.
- `game.collectGather(id)` → packt das Material ein, zählt das Ziel hoch, Toast aus `SYSTEM_LINES.gatherProgress`.

### 4.3 Erinnerungsfetzen

- Speicher `game.memories.seen: string[]` (IDs aus `MEMORY_FRAGMENTS`, Reihenfolge = Erlebnisreihenfolge).
- Ereignis `memory {fragment}` – `fragment` ist der komplette Eintrag (`id, order, title, text, clue`). Jeder Fetzen kommt **genau einmal**.
- Zusätzlich ein Toast `SYSTEM_LINES.memory(title)`.
- UI: Einblendung mit `title` + `text` und einer Schaltfläche „Weiter“ (Sepia, pausiert nichts); Clanbuch-Reiter „Erinnerungen“ listet `MEMORY_FRAGMENTS` in `order`, gesehene mit `clue`, ungesehene verdeckt.
- Ausgelöst wird heute: Hofprobe bestanden, erstes Kaltgetränk, Kapitelbelohnung 1–4, Boss besiegt, erster Tod, Tresen Stufe 1, Stufenaufstieg (dafür gibt es noch keinen Fetzen).

### 4.4 Basisbau

- Speicher `game.buildings: {id: stufe}` (nur gebaute Gebäude; 0 wird nicht gespeichert).
- `game.nextBuildStage(id)` → nächste Stufe (`{stage, name, cost, effect, text}`) oder `null` (Endausbau oder Kapitel fehlt).
- `game.build(id)` → prüft Kapitel und Material, zieht das Material aus dem Rucksack ab, Toast `SYSTEM_LINES.building(stufenname, stufe)`, Log mit dem Stufentext.
- `game.baseEffects()` → Summe aller Vorteile (`buildingEffects`); taugt für eine Übersichtszeile „Was die Bude bringt“.
- Ereignis `buildingsChanged {building, stage}` → Reiter „Bude“ neu zeichnen; `rpgChanged` kommt gleich mit (Material ist weg).
- UI: Reiter „Bude“ im Clanbuch, je Gebäude Pate (`BUILDINGS[id].owner` → `NPCS`), Stufe, Kosten gegen `countItem(rpg, item)` gestellt, Vorteilstext; Schaltfläche „Ausbauen“ ruft `game.build(id)`. Sichtbar ab `buildingsUnlocked(game.quest.chapterClaimed)`.
- Es gibt **keine** Ortsprüfung: gebaut werden darf überall. Wenn der Bau an die Bude gebunden sein soll, sagt das die UI (Schaltfläche nur am Treffpunkt) oder es kommt als neue Regel in die Engine.

### 4.5 Mentoren an der Bude

- `world.mentors` → `[{id, classId, name, role, type:'mentor', x, y}]` für Dieter, Anni (`baerbel`) und Kevin, am Treffpunkt platziert (Reihenfolge stabil aus `NPCS`).
- `game.mentorInteraction()` → Mentor in Reichweite (42) für die Aktionstaste.
- `game.talkToMentor(id)` → `{npc, name, line}`; die Zeile kommt aus `hubLine(id, chapter, index, actDone)` und wechselt bei jedem Ansprechen (Zähler `game.mentorTalks`).
- Ereignis `mentorTalk {npc, name, line, chapter, actDone}` → Gesprächsfenster oder Sprechblase; Porträt über `classes.js`/`PERSON_APPEARANCE` (`classId` liegt am Mentor).
- Der Renderer muss die drei Figuren noch zeichnen (heute zeichnet er nur `world.npc`); bis dahin sind sie unsichtbar, aber ansprechbar.

### 4.6 Lager der Kapitel

`world.camps` enthält jetzt zusätzlich je Kapitel 2–4 ein Mob-Lager (`chapter-<n>-mob`, Feld `archetype`) und ein Boss-Lager (`chapter-<n>-boss`, Felder `boss`, `gathers`). Beide tragen `chapter` und `title` (= Ziel-Label). Bevölkert werden sie erst, wenn das Kapitel läuft; Kapitel 5/6 (`reserve:true`) bekommen kein Lager. Für die Karte: `camp.title` benutzen, nicht raten.

### 4.7 Was in der alten UI noch klemmt

- `app.js:91` zeigt nach Kapitel 1 wieder `introDialogue()` (Kapitel-1-Text) an, weil `quest.accepted` zurückgesetzt wird → auf `chapterDialogue(game.quest.chapter)` umstellen.
- `app.js:103` zeigt `q.claimed` als „alles fertig“ → auf `game.chapterProgress()` umstellen.
- `app.js:133` ruft `showReward('main')` → `game.rewardKey()` benutzen.
- `renderer.js:65` markiert Ida mit `✦`, sobald Kapitel 1 abgeholt ist → `game.quest.actDone` statt `quest.claimed`.

## 5. Engine → UI · Runde A (2026-09-17, Branch `engine`)

Neu: Sprüche als Ereignis, Bau nur am Treffpunkt, echte epische Belohnungen, mit dem Spieler wachsende Feldgegner, Beinteil aus Kapitel 1.

### 5.1 Ereignis `bark` (Sprechblasen ohne Textparsen)

| Feld | Typ | Inhalt |
|---|---|---|
| `enemyId` | Zahl | `enemy.id` bzw. Bewohner-Id aus `game.life.actors`; bei Bedarf zum Wiederfinden der Figur |
| `name` | String | Name der sprechenden Figur (Gegnername bzw. `VILLAGERS[].name`) |
| `text` | String | die Zeile, roh aus `content/` – nie selbst zusammenbauen |
| `kind` | `'enemy' \| 'boss' \| 'phase' \| 'villager'` | woher die Zeile kommt |
| `x`, `y` | Zahl | Weltposition der Figur im Moment des Spruchs (Ankerpunkt der Blase) |

Wann gesendet:

- `kind:'enemy'` – menschlicher Feldgegner (`ENEMY_BARKS[archetype]`) beim **ersten** Spezialangriff eines Auftritts; die Zeile wechselt je Gegner und je Wiederbelebung. Tiere schweigen.
- `kind:'boss'` – Bosszeile `BOSS_LINES[bossId].engage` beim ersten Spezialangriff und `.defeat` beim Tod.
- `kind:'phase'` – Phasenzeile aus `BOSSES[bossId].phases`, je Schwelle genau einmal.
- `kind:'villager'` – Dorfbewohner: `village-life.js` öffnet wie bisher die Blase (`actor.bubble`), die Engine wählt daraus die Zeile aus `VILLAGERS[variant].says` (reihum) und meldet sie. Kein Eintrag im Kampflog.

Gegner- und Bosszeilen stehen **zusätzlich** weiter im Kampflog (`game.messages`) – wer die Blase zeichnet, kann das Log unverändert lassen. `enemy-ui.js` kann seine eigene Beobachtung von `hp`/`cycle`/`phases` jetzt durch dieses Ereignis ersetzen.

### 5.2 Bau nur am Treffpunkt

- Neu `game.atHub()` → `true`, wenn der Spieler höchstens `HUB_RADIUS` (150 Einheiten, exportiert aus `engine.js`) von `world.spawn` entfernt und nicht im Kampf ist. Dieselbe Regel wie beim Clanwechsel; `claimStarterWeapons` nutzt sie ebenfalls.
- `game.build(id)` bricht außerhalb mit `false` ab und meldet einen Toast. Die UI kann die Schaltfläche „Ausbauen“ weiterhin anzeigen, sollte sie aber über `game.atHub()` ausgrauen – die Regel liegt jetzt in der Engine, nicht mehr nur in der UI (ersetzt §4.4, letzter Punkt).
- Toast-Text: `SYSTEM_LINES.buildPlace(name)`, solange es die Zeile nicht gibt, ein Rückfall im Wortlaut der Clanwechsel-Zeile. Bedarf steht in `docs/backlog/story.md`.

### 5.3 Epische Belohnungen

`rolledDefinition`/`registerRoll` kennen jede Güte aus `BALANCE.items.quality` (heute `uncommon`, `rare`, `epic`). Kapitel 4 (`reward.gear:'epic'`) würfelt damit echte epische Teile: `rarity:'epic'`, Budget × `BALANCE.items.quality.epic`, Gegenstandsstufe + `BALANCE.items.itemLevel.epic`. Alte Spielstände laden epische Fundstücke korrekt nach. Für die UI: `rarity-epic` muss in der Belohnungsauswahl, im Rucksack und im Tooltip die epische Farbe ziehen (`rpg-ui.js` kennt den Namen „Dorflegende“ schon).

### 5.4 Feldgegner wachsen mit

`encounters.buildCell` skaliert Leben und Schaden von Feldgegnern jenseits `SPAWN_TABLES.tierDistance` mit `enemyScale(Spielerstufe − 2, Artstufe)` (neu exportiert: `scaledStats(def, playerLevel, far)`). Der Dorfkern bleibt auf den Werten aus `content/enemies.js`. Die Werte werden beim Bau einer Zelle festgelegt, nicht laufend nachgezogen. Für die UI ändert sich nichts an den Feldern – nur die angezeigten `hp`/`maxHp` sind im Umland höher. Beispiel Stufe 10: Dachs 2,65 s → 4,87 s, Rabe 1,91 s → 3,52 s.

### 5.5 Start ohne Hose

Der Beinschutz-Slot bleibt beim Start leer (unverändert). Neu: `claimQuest()` legt bei Kapitel 1 zusätzlich zur gewählten Belohnung ein gewürfeltes Beinteil (`slot:'legs'`, einfachste Güte, Spielerstufe) in den Rucksack; ist kein Platz frei, landet es in `rpg.recovery` und kommt über „Ausrüstung zurückholen“ nach. Alte Spielstände mit bereits abgeholtem Kapitel 1 bekommen nichts nachgereicht. Die UI sollte nach dem Kapitel-1-Dialog auf den Rucksack hinweisen („Endlich eine Hose“).

## 6. Engine → UI · Runde B (2026-09-17, Branch `engine`, Playtest Akt 1)

Umgesetzt: P1, P2, P3/P5, P6, P8 aus `docs/PLAYTEST-2026-09-17-AKT1.md`, dazu vr-08, `pickElite()` und vier neue
Proc-Bausteine. Texte kommen weiterhin ausschließlich aus `content/`.

### 6.1 Autoangriff: einschalten statt umschalten (P2)

`game.action('auto')` schaltet den Autoangriff nur noch **ein**. Läuft er schon, bleibt er an und meldet nichts.
Aus geht er nur über drei Wege: `game.stopAuto()`, Zielverlust (still, in `tickAuto`) und Tod.

| Name | Typ | Wann | Was die UI tun soll |
|---|---|---|---|
| `game.stopAuto()` | Methode → bool | Esc der UI | **Pflicht:** Esc soll `game.stopAuto()` aufrufen (nach Zauber- und Zielhilfe-Abbruch), sonst gibt es keinen Weg mehr, ihn abzuwählen. Rückgabe `true`, wenn wirklich etwas ausging. |
| `startAuto(g)` / `stopAuto(g)` | Export `auto-combat.js` | – | `toggleAuto` bleibt als Altname, zeigt aber auf `startAuto`. |

Die Leiste darf Taste 1 damit als „Angreifen“ beschriften statt als Ein/Aus-Schalter.

### 6.2 Ereignis `attacked` (P1)

| Feld | Typ | Inhalt |
|---|---|---|
| `enemyId` | Zahl | `enemy.id` des Angreifers |
| `damage` | Zahl | Schaden dieses Treffers, nach Rüstung und Deckung |
| `first` | `true` | immer `true` – gesendet wird nur der auslösende Treffer |

Gesendet beim **ersten** Treffer eines Angreifers und wieder, sobald der Kampf neu beginnt (`player.inCombat`
läuft auf 0, die Angreiferliste `game.attackers` leert sich). Dazu setzt die Engine das Ziel auf den Angreifer,
wenn keines steht (`target`-Ereignis kommt mit). Die UI soll darauf den großen Hinweis „Du wirst angegriffen“
zeigen – das ständige Beobachten von `player.hp` entfällt.

### 6.3 Aktionstaste: Auftragsziel zuerst (P3/P5)

| Name | Rückgabe | Inhalt |
|---|---|---|
| `game.questFocus()` | `{kind,point,priority,…}` oder `null` | Auftragsziel in Reichweite: `loot` (Beutel/Clankiste), `gather` (Sammelpunkt) oder `npc` (die Person, auf die die goldene Wegmarke zeigt) |
| `game.interaction()` | `{kind,point,priority,…}` oder `null` | die **ganze** Rangfolge in einem Wert: `loot` (0), `gather` (1), `npc` als Auftragsziel (2), `mentor` (3), Nebenquest (4), `npc` sonst (5), `shrine` (6) |
| `game.mentorInteraction()` | wie bisher | liefert jetzt `null`, solange ein Auftragsziel in Reichweite steht |

`worldInteraction()` in `app.js` sortiert heute nur nach Entfernung – deshalb gewinnt Dosen-Dieter gegen
Kisten-Ida. Empfehlung: Rangfolge aus `game.interaction()` übernehmen und nur noch die Beschriftungen selbst
bauen (`ITEMS[…].name`, `NPCS`, `STORY`). Ohne Umbau greift wenigstens die Mentoren-Sperre.
Neue Konstanten aus `engine.js`: `TALK_RANGE=50`, `MENTOR_RANGE=42`, `GATHER_RANGE=36`.

### 6.4 Laufwege (P6)

- Ein Laufbefehl gilt jetzt bis zum Klickpunkt. Bleibt ein Schritt an einer Kante hängen, wird der Weg nach
  `ROUTE_RETRY` (0,3 s) neu berechnet (`game.repath()`) und erst nach `ROUTE_GIVEUP` (1,4 s) aufgegeben – vorher warf
  schon der erste blockierte Schritt die Reststrecke weg. Beide Zahlen stehen in `movement.js`.
- Neue Felder: `game.routeGoal` ({x,y} des Wunschorts, `null` wenn nichts läuft), `game.routeStuck` (Sekunden ohne
  Fortschritt). `game.path` wird beim Aufgeben mit geleert – ein Restweg ohne `moveTo` kann nicht mehr vorkommen.
- `game.navigate(point)` gibt jetzt `true`/`false` zurück.
- **Neu `game.navigateDestination()`**: ein Befehl zur goldenen Wegmarke. Erstspieler klicken zwölfmal an den
  Bildschirmrand, weil weiter entfernte Ziele gar nicht sichtbar sind – die UI sollte die Wegmarke im HUD (und den
  Kartenpunkt) klickbar machen und darauf `game.navigateDestination()` legen.

### 6.5 Hofprobe (P8)

- Jeder Schritt hat eine Tick-Sperre: der Tick, in dem ein Schritt beginnt, kann ihn nicht sofort abschließen.
  Zwei Schritte auf einmal (2/8 → 4/8) sind damit ausgeschlossen.
- Die Zähler `tutorial.hits` / `tutorial.autos` starten bei jedem Schrittwechsel bei 0 – „Auto 1/2“ ist nie vorab erfüllt.
- „Autoangriff aus.“ kommt nur noch bei echter Abwahl (siehe 6.1).
- Der erste Ausweichversuch ist eine Vorführung: `TUTORIAL.retry` („Nochmal: …“) erscheint erst ab dem zweiten
  Fehlversuch (`tutorial.tries`).
- Abklingzeit-Meldung nennt die Restzeit. Sie nutzt `COMBAT_TEXT.cooldown(name, sekunden)`, sobald es die Zeile gibt;
  bis dahin ein Rückfall im gleichen Wortlaut mit „· x,x s“. Bedarf steht in `docs/backlog/story.md`.

### 6.6 Welt und Gegner

- **vr-08**: `encounters.buildCell` entscheidet „Feld“ jetzt über `residential(w,p)` aus `world-layout.js`
  (Wohnpolygone **und** Bebauungsmaske). Auch Begleiter und Ersatz-Spawnpunkte aggressiver Reviere dürfen nicht in
  der Maske landen. Für die UI ändert sich nichts – im Ort laufen nur noch neutrale Arten.
- **Eliten**: die Auswahl kommt aus `pickElite(town,random)` (`content/enemies.js`), damit erscheint auch
  Oberpraktikant Olaf. `enemy.elite` und `enemy.archetype` wie gehabt.

### 6.7 Neue Proc-Bausteine (Klassendesign)

Die Laufzeit kennt jetzt zwei weitere Auslöser und zwei weitere Wirkungen. **Die Regeln selbst gehören
`content/procs.js` (Klassendesign)** – bis dort Regeln damit gebaut sind, ändert sich im Spiel nichts.

| Baustein | Form | Bedeutung |
|---|---|---|
| Auslöser `skillHit` | `{trigger:'skillHit',skill:'strike',every:3}` | feuert beim Einsatz genau dieses Kniffs; `every` zählt deterministisch mit („jede dritte Kelle“) |
| Auslöser `markedHit` | `{trigger:'markedHit'}` | feuert in `Game.damage`, sobald das getroffene Ziel markiert ist |
| Wirkung `heal` | `effect:{heal:40}` | Leben direkt über `healPlayer` (mit Heilwerten verrechnet) |
| Wirkung `cdReduce` | `effect:{cdReduce:{skill:'throw',seconds:3}}` | verkürzt eine Abklingzeit um Sekunden, nie unter null |

Für das HUD: `procCount(game, procId)` aus `procs.js` liefert den Zählstand eines `every`-Auslösers
(z. B. „2/3 Kellen“). Der Stand steht in `game.procState.counts` und wird nicht gespeichert.

## 8. Engine → UI · Welle D (2026-09-17, Branch `engine`)

Neu: benutzbare Gegenstände auf der Aktionsleiste, Auto-Loot mit einem Beute-Ereignis fürs Log und eine
Beschreibungs-API für Tooltips. Texte kommen weiterhin ausschließlich aus `content/` – die Engine liefert nur IDs,
Zahlen und Zustände. Die Shift-Regel des Beschreibungs-Standards (Shift blendet `why`, `links` und die `long`-Texte
der `terms` ein) bleibt Sache der UI; die Engine liefert die Felder, blendet aber nichts aus.

### 8.1 Verpflegung auf der Aktionsleiste

Ein Leistenplatz hält jetzt entweder einen Kniff (Id wie bisher) oder einen benutzbaren Gegenstand als
`'item:<itemId>'`. Beide Formen sind Speicherschlüssel in `rpg.actionBars[classId]` – alte Spielstände laden unverändert.

| Name | Typ | Inhalt |
|---|---|---|
| `barItemEntry(id)` / `barItemId(entry)` | Export `rpg.js` | Leisteneintrag aus einer Gegenstands-Id bauen bzw. zurücklesen (`null`, wenn es ein Kniff ist) |
| `usableItem(id)` | Export `rpg.js` | benutzbar? `usable:true` aus `content/items.js`, Rückfall `kind==='consumable'` |
| `bindSkill(game, entry, index)` | wie bisher | nimmt zusätzlich `'item:<id>'`; `null` räumt den Platz |
| `game.bar()` / `barSlots(game)` | `[{index,key,entry,kind,id,name,icon,available,cooldown,ready,count,empty}]` | **das, was die Leiste zeichnen soll.** `kind` ∈ `skill \| item \| empty`; bei `item` sind `count` (Stapel im Rucksack), `empty` (Stapel leer → ausgrauen, Platz bleibt reserviert) und `cooldown` (gemeinsame Verpflegungs-Abklingzeit) gesetzt |
| `game.action(slot)` | bool | nimmt eine Kniff-Id, einen `'item:<id>'`-Eintrag **oder die Platznummer 0–9**. Bei einem Gegenstand wird er sofort benutzt – kein Menü, kein Rucksackfenster. Der Stapel zählt herunter, `consumableCd` (`BALANCE.player.consumableCooldown` minus Basisbau-`consumableCd`) gilt wie im Rucksack |
| Ereignis `barChanged` | – | jede Änderung der Belegung (Binden, neue Kniffe, verdrängter Gegenstand) und der Moment, in dem ein Leistenstapel leer wird → Leiste neu zeichnen |

Regeln:

- **Kniffe haben Vorrang.** Neu gelernte Kniffe nehmen zuerst freie Plätze; ist keiner frei, weicht der letzte
  Gegenstand. Verpflegung belegt beim Start die *hinteren* freien Plätze (Tasten 9/0), damit die Kniffreihenfolge steht.
- **Einmalig.** Ein Gegenstand wandert nur einmal von allein auf die Leiste (`rpg.barSeen`). Wer ihn abräumt,
  bekommt ihn nicht ungefragt zurück.
- **Leerer Stapel = reservierter Platz.** Beim Laden wird die Belegung gegen den Rucksack geprüft, der Platz bleibt
  aber bestehen; `barSlots()` meldet `empty:true`, die UI graut ihn aus. Ein Klick meldet einen Toast statt zu wirken.

### 8.2 Auto-Loot und das Ereignis `loot`

- `game.settings.autoLoot` (Standard `true`, wird gespeichert). Umschalten über `game.setSetting('autoLoot', false)`
  → Ereignis `settingsChanged {key,value}`. Die Einstellung gehört in das Einstellungen-Fenster.
- **An:** Beute wird beim Kill sofort eingesammelt, es bleibt kein Beutel liegen. Passt etwas nicht in den Rucksack,
  geht es nach `rpg.recovery` („Ausrüstung zurückholen“) plus Hinweis-Toast – **nichts geht verloren**.
- **Aus:** alles wie bisher (Beutel in `rpg.loot`, Beutefenster, `takeLoot`).
- `game.openLoot(id)` → bei Auto-Loot räumt es den Beutel selbst ab und gibt `null`; sonst liefert es den Beutel
  fürs Beutefenster. **Die UI soll das Beutefenster nur noch öffnen, wenn `openLoot()` einen Beutel zurückgibt.**

| Feld des Ereignisses `loot` | Typ | Inhalt |
|---|---|---|
| `items` | `[{id,count,rarity,rolled}]` | was wirklich im Rucksack gelandet ist; `rarity` für die Farbe, `rolled:true` bei gewürfelten Fundstücken |
| `coins` | Zahl | Pfandmarken aus diesem Beutel |
| `source` | `{name,kind}` | Quelle: `kind` ∈ `enemy \| boss \| chest \| bag`, `name` der Gegnername |

Das Ereignis kommt **in jedem Fall** – automatisch wie von Hand – und ist die Quelle für die Beutezeile im Log.
`ITEMS[id].name` und die Farbe zieht die UI wie gewohnt aus dem Register.

Offener Inhaltsbedarf: eine `SYSTEM_LINES`-Zeile für „Rucksack voll, Rest liegt unter Ausrüstung zurückholen“
(`SYSTEM_LINES.lootFull(anzahl)`); bis dahin nutzt die Engine einen Rückfalltext im gleichen Wortlaut.
Bedarf steht in `docs/backlog/story.md`.

### 8.3 Beschreibungs-API `game.describe(kind, id)`

Rückgabe `{icon, name, info:{effect, numbers, why, links, terms}, live:{…}}` oder `null` bei unbekannter Art/Id.
`kind` ∈ `skill | talent | passive | buff | proc | item | building | cast`.

- `info` kommt aus `content/`: aus dem Feld `info` des Elements oder – sobald es sie gibt – aus den Helfern
  `describe()`, `describeItem()`, `describeStage()` aus `content/index.js`. Fehlen beide, baut die Engine den
  Rückfall aus den Rohfeldern (`text`/`description`/`passive` plus abgeleitete `numbers`). **Die Form ist immer
  gleich:** `effect` (String), `numbers` (`[{label,value,unit,source}]`), `why` (String), `links`/`terms` (Id-Listen).
- `live` sind die Laufzeitwerte mit Ausrüstung, Talenten, Procs und Basisbau:

| kind | `live` (Auszug) |
|---|---|
| `skill` | `damage:{min,max,critMin,critMax}` (tatsächlicher Schaden mit Waffe und Wertungen), `heal`, `cooldown` (mit Tempo) gegen `baseCooldown`, `remaining`, `ready`, `cost` gegen `baseCost`, `range`, `castTime`, `gcd`, `crit`, `available`, `level`, `onBar` |
| `talent` | `learned`, `open` (Voraussetzungen erfüllt und Punkt frei), `pointsLeft`, `tier`, `grants`, `effects` |
| `passive` | `classId`, `active`, `values` (die Zahlen aus `CLAN_MEMBERS.passives`) |
| `buff` | `active`, `remaining` (Restdauer), `shield`, `stacks` (`momentum`), `value` (`guard`, `hot`) |
| `proc` | `armed` (Regel gelernt), `trigger`, `every`/`count` (Zählstand „2/3 Kellen“), `active`/`remaining` (laufendes Fenster), `chance`, `window`, `effect` |
| `item` | `count` (aktueller Stapel), `rarity`, `equipped`, `usable`, `heal`/`energy` **mit Grill-Bonus**, `cooldown`/`remaining`/`ready`, `onBar`, `rolled` |
| `building` | `stage`, `maxStage`, `effect` (aktueller Basisbau-Effekt dieses Gebäudes), `current`, `next:{stage,name,cost,have,affordable,text}`, `atHub` |
| `cast` | `interruptible`, `ground`, `radius`, `total`, `raw`, `expected` (Schaden nach deiner Rüstung), `casting`, `remaining` |

`game.activeBuffs()` → Liste der laufenden Stärkungen und Proc-Fenster:
`[{kind:'buff'|'proc', id, name, remaining, stacks?, value?, shield?, mode?, count?, describe:{kind,id}}]`.
`remaining` ist die Restzeit in Sekunden (`null`, wenn es keine gibt, z. B. Deckung); `describe` ist genau das Paar,
das die UI an `game.describe()` weiterreicht. Enthalten sind: Klassen-Stärkung, Schwung, Deckung, Hauspflege,
Tempo-Procs sowie offene Proc-Fenster (`gratis`, `×2`, `bereit`) und laufende Zähl-Procs.

Neue Engine-Datei: `describe.js` (Beschreibungs-API, `skillCooldown()` und `skillDamageRange()` als eine Wahrheit –
`Game.action` rechnet die Abklingzeit jetzt mit demselben Helfer).
