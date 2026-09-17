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
