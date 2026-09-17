# Entwicklungs-Pipeline Mertloch Chronicles

Fünf Rollen, ein Ablauf, klare Dateizuständigkeit. Jede Rolle arbeitet auf einem eigenen Branch im eigenen Worktree und übergibt über feste Dateien, nicht über Zuruf.

Ausprägung der studio-weiten Pipeline `D:/Dev/eresm-github-migration/docs/spielentwicklung/PIPELINE.md` (Rollen nur mit Artefakt + Gate, Stufen mit Eingang/Ausgang, Vorlagen für Pitch/Design/Schema/Playtest). Offen für Mertloch laut dort §7: `PITCH.md`, Playtest-Personas, `docs/ENTSCHEIDUNGEN.md`.

## Rollen und Zuständigkeit

> **Stand 2026-09-17:** Die Inhaltsrolle ist in sechs Fachrollen (Story, Klassen, Gameplay, Balancing, Loot, Welt) plus Lead-Architect aufgeteilt. Dateibesitz, Branches, Backlogs und Konfliktregeln stehen verbindlich in **`docs/ROLLEN.md`**; die Tabelle hier zeigt nur noch die Umsetzungsrollen.

| Rolle | Agent / Sitzung | Darf ändern | Übergibt an | Übergabedatei |
|---|---|---|---|---|
| **Inhalt** | `.claude/agents/inhalt-agent.md` | `content/**`, `tests/content.test.mjs`, `scripts/balance-report.mjs`, `scripts/art-brief.mjs`, `scripts/content-check.mjs` | Engine, UI, Grafik | `content/BACKLOG.md` (Engine/UI-Bedarf), `content/ART-BRIEF.md` (Grafik), `content/BALANCE-REPORT.md` |
| **Engine** | `.claude/agents/engine-agent.md` | `engine.js`, `rpg.js`, `clan.js`, `class-mechanics.js`, `encounters.js`, `itemization.js`, `talents.js`, `progression.js`, `activities.js`, `movement.js`, `tests/*.test.mjs` (außer content) | UI | `docs/UEBERGABE-UI-<Datum>.md` (neue Events, Felder, Funktionen) |
| **UI** | `.claude/agents/ui-agent.md` | `app.js`, `*-ui.js`, `popup-*.js`, `mobile-*.js`, `*.css`, `index.html`, `scripts/*-check.mjs`, `scripts/*-playtest.mjs` | Grafik | Bedarf an Icons/Sprites → `content/ART-BRIEF.md` ergänzen (nur `look`-Felder in `content/`, sonst Eintrag in `docs/GRAFIK-BEDARF.md`) |
| **Grafik** | Bild-KI (extern) + Renderer-Anbindung durch UI | `assets/content-art/**`; Anbindung in `*-art.js`, `renderer.js` durch UI | UI | Dateien nach `assets/content-art/<Art>/<ID>.png`, Prompts in `assets/content-art/PROMPTS.md` |
| **Welt** | bei Bedarf | `world*.js`, `terrain.js`, `cartography.js`, `data/`, `scripts/build-world.mjs`, `scripts/import-world.mjs` | Engine | Kommentar im Commit + `WORLD-GENERATION.md` |
| **Playtest** | `.claude/agents/neuling-agent.md`, `kenner-agent.md`, `pruefer-agent.md` (nur Browser, kein Spielwissen) | nichts (liest keine Dateien) | Produktion | `docs/PLAYTEST-<Datum>-<persona>.md` (Vorlage `docs/VORLAGE-PLAYTEST.md`); **sperrt den Release**, solange ein Hänger „bricht ab" offen ist |
| **Produktion** | E. Ruf + Orchestrator-Session | `docs/PITCH.md`, `docs/ENTSCHEIDUNGEN.md` | alle | Entscheidung mit Begründung und verworfener Alternative in `docs/ENTSCHEIDUNGEN.md`; was dort nicht steht, ist nicht entschieden |

Gemeinsame Dateien (`README.md`, `package.json`, `CLAUDE.md`, `scripts/build-site.mjs`): nur kleine, additive Änderungen; wer sie anfasst, schreibt es in den Commit-Text.

## Ablauf eines Features

```
1 Inhalt definiert          content/*.js + look-Felder            → npm run content:check grün
2 Engine-Bedarf?            content/BACKLOG.md „Braucht Engine“   → Engine setzt um, Test in tests/
3 UI-Bedarf?                docs/UEBERGABE-UI-<Datum>.md          → UI baut, Browsertest (scripts/*-check.mjs)
4 Grafik-Bedarf?            content/ART-BRIEF.md (npm run content:art) → Bild-KI liefert → UI bindet an
5 Balance                   npm run content:balance, Bericht im Commit
6 Playtest                  Personas Neuling/Kenner/Prüfer auf dem Branch → docs/PLAYTEST-<Datum>-<persona>.md, kein „bricht ab" offen
7 Merge                     Branch → main nur per Fast-Forward, npm test grün, Playtest frei, Deploy prüfen
```

Reihenfolge ist Pflicht: **Inhalt vor Engine vor UI vor Grafik.** Die UI baut nie auf Inhalte, die nicht in `content/` stehen; die Engine erfindet keine Texte oder Zahlen; Grafik entsteht nur aus dem Briefing.

## Definition of Done je Rolle

**Inhalt**
- `npm run content:check` grün, `npm run content:balance` und `npm run content:art` ausgeführt und eingecheckt.
- Jede neue ID hat `name`, `description`/`text`, bei Sichtbarem ein `look`.
- Was Engine oder UI braucht, steht in `content/BACKLOG.md` mit Begründung.

**Engine**
- Liest Inhalte nur über `content/index.js`; keine Strings, keine Magic Numbers.
- Neue Felder/Events für die UI in `docs/UEBERGABE-UI-<Datum>.md` dokumentiert (Name, Typ, wann gesetzt).
- Test in `tests/` für jede neue Mechanik; `npm test` grün.
- Erledigte Backlog-Punkte in `content/BACKLOG.md` abgehakt.

**UI**
- Keine Inhaltstexte im UI-Code; alles aus `game`, `world.quests`, `content/index.js`.
- Klickpfad im Browser durchgespielt (Vollbild 2024×900) und als `scripts/*-check.mjs` reproduzierbar; Screenshot in `*-review/`.
- Mobil geprüft (Touch-Steuerung, Fensterbreite).
- Grafikbedarf, der nicht aus `content/` kommt (UI-Icons, Rahmen), in `docs/GRAFIK-BEDARF.md`.

**Grafik**
- Dateiname = ID aus dem Briefing, Ablage `assets/content-art/<Art>/<ID>.png`, Prompt in `PROMPTS.md`.
- Stil nach `ART-DIRECTION.md`; Größe nach Briefing.
- Bis zur Anbindung zeichnet das Spiel den Fallback (`skin`/`icon`); nichts darf ohne Bild kaputtgehen.

## Branches und Worktrees

**Verbindlich ist die Rollen-Tabelle in `docs/ROLLEN.md` §„Branches und Worktrees“** — dort steht je Rolle Branch und Worktree, dort wird sie gepflegt. Die frühere Tabelle an dieser Stelle war veraltet (Inhalt auf `content-backend`, UI auf `main`) und ist entfallen; der Branch `content-backend` ist stillgelegt (Altbestand, in `main` übernommen, `docs/ENTSCHEIDUNGEN.md` E-19).

Anlegen: `git worktree add -b <branch> D:\Dev\MertlochChronicles-<rolle> origin/main` (existiert der Branch schon: ohne `-b`). Vor jeder Runde `git fetch && git rebase origin/main`. Nach `main` nur Fast-Forward (`git push origin <branch>:main`) nach grünem `npm test` (E-07). Kein `git stash` — der Stash-Stack ist über alle Worktrees geteilt. Nach dem Push prüft die Rolle den Pages-Deploy (`https://er-esm.github.io/mertloch-chronicles/`).

## Übergabedateien

- `content/BACKLOG.md` – Inhalt → Engine/UI. Abschnitte „Braucht Engine“, „Braucht UI“, „Inhaltlich offen“. Erledigtes abhaken, nicht löschen.
- `docs/UEBERGABE-UI-<Datum>.md` – Engine/Inhalt → UI. Was gibt es neu, wo liegt es, was soll die UI daraus machen, wie prüfen.
- `content/ART-BRIEF.md` – generiert; Grafikaufträge mit Fallback. Nie von Hand editieren, `look`-Felder in `content/` pflegen.
- `docs/GRAFIK-BEDARF.md` – UI → Grafik für alles, was nicht aus `content/` kommt.
- `content/BALANCE-REPORT.md` – generiert; Nachweis jeder Balance-Änderung.
- `docs/PLAYTEST-<Datum>-<persona>.md` – Playtest → Produktion. Bericht der Persona 1:1 übernommen; Freigabe-Zeile entscheidet über den Merge.
- `docs/backlog/<rolle>.md` – **alle → eine Rolle.** Inbox je Rolle (`lead`, `story`, `klassen`, `gameplay`, `balance`, `loot`, `welt`, `engine`, `ui`). Wer etwas von einer anderen Rolle braucht, schreibt den Auftrag dorthin: Ziel, Grund, Abnahmekriterium, betroffene Dateien/IDs, Reihenfolge. Die besitzende Rolle hakt ab (`- [x]`) und verschiebt nach „Erledigt“; niemand löscht fremde Einträge. Fremde Dateien direkt anfassen ist nicht erlaubt (`docs/ROLLEN.md` §Konfliktregeln).
- `docs/ROADMAP.md` – Lead → alle. Reihenfolge der Runden mit Abnahmekriterien; was in keiner Runde steht, ist nicht dran.
- `docs/ENTSCHEIDUNGEN.md` – Produktion → alle. Jede Änderung an Design, Schema, Rollen oder Ablauf mit Begründung und verworfener Alternative.
- `docs/PITCH.md` – Produktion → alle. Kernschleife, Zielgruppe, Erfolgskriterium des Slice, größte Unsicherheit.

## Playtest — Aufruf der Personas

Vor jedem Merge nach `main`, der Bedienung, Kampf oder Menüs verändert. Seriell, ein Browser je Session; der Orchestrator fasst den Browser währenddessen nicht an.

| Persona | Auftrag (Beispiel, in Spielersprache) | Budget | Bekommt im Aufruf |
|---|---|---|---|
| `neuling-agent` | „Spiel mal die erste Viertelstunde. Mach die Hofprobe und leg danach drei Viecher." | 40 | Start-URL, Gerät (2024×900 oder 390×844), Screenshot-Präfix |
| `kenner-agent` | „Erreiche Stufe 4, finde deine Rotation und sag mir, ob es flüssig ist." | 50 | wie Neuling |
| `pruefer-agent` | „Prüfe diese Versprechen: 1 … 2 … 3 …" | 60 | wie Neuling + nummerierte Versprechen aus `docs/PITCH.md`, `GAMEPLAY-KONZEPT-FLUSS.md` §2, Zielbild `MENUE-BEWERTUNG-2026-09-17.md` |

Vorbereitung durch den Orchestrator (die Personas dürfen das nicht wissen): `npm start`, Start-URL `http://localhost:4173` (oder die Pages-URL für den Live-Stand); bei Modul-Änderungen vorher den Service-Worker abmelden und Caches löschen, sonst testet die Persona den alten Stand; leerer Spielstand, wenn der Auftrag „von vorn" heißt (eigenes Browserprofil oder Speicher vorher leeren, nicht durch die Persona). Screenshots landen in `visual-review/playtest-<Datum>/`.

Werkzeug-Erkenntnisse aus dem ersten Lauf (2026-09-17, Details in `PLAYTEST-2026-09-17-AUSWERTUNG.md`):
- **Bewegung nur mit gehaltener Taste oder Klick an Bildposition** über die zwei `run_code`-Snippets in den Persona-Definitionen. `browser_press_key` und `browser_click` bewegen die Figur nicht; ohne Snippets scheitert jede Persona an Hofprobe 2/8 und liefert einen falschen „bricht ab".
- **Spielstand wird beim Entladen zurückgeschrieben:** Speicher leeren, neu laden, sofort erneut leeren, neu laden, Startbild per Screenshot prüfen (Stufe 1, Hofprobe 1/8).
- Screenshots mit absolutem Pfad (`D:/Dev/MertlochChronicles/visual-review/playtest-<Datum>/<persona>-NN.png`) speichern.
- Geänderte Agenten-Definitionen werden erst beim nächsten Sitzungsstart geladen; bis dahin Persona-Text in einen `general-purpose`-Agenten einbetten und die Werkzeugliste per Anweisung vorgeben (im Bericht vermerken).
- Für Versprechen, die eine höhere Stufe brauchen (Rotation ab Stufe 4), legt der Orchestrator vorher einen passenden Spielstand an (Arena/Admin); die Persona erfährt davon nichts.

Erster Lauf: `PLAYTEST-2026-09-17-neuling.md`, `-kenner.md`, `-pruefer.md`, Zusammenfassung und Entscheidungsliste `PLAYTEST-2026-09-17-AUSWERTUNG.md`.

Auswertung: Bericht unverändert nach `docs/PLAYTEST-<Datum>-<persona>.md`. „bricht ab" sperrt den Merge und wird sofort behoben. „stockt" und „wundert sich" entscheidet die Produktion: Eintrag in `docs/ENTSCHEIDUNGEN.md` (Design) oder `content/BACKLOG.md` (Umsetzung). Personas fixen nichts; ein Playtest durch den, der gebaut hat, zählt nicht als Playtest.

## Takt

Jede Rolle arbeitet in Runden: ein Auftrag, ein Branch, ein Bericht (was, warum, Beleg, offene Punkte). Nach jedem Merge liest jede andere Rolle ihre Übergabedatei. Niemand baut auf Zuruf; was nicht in einer Übergabedatei steht, existiert nicht.
