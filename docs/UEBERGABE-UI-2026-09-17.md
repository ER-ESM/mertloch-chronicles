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
