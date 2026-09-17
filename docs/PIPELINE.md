# Entwicklungs-Pipeline Mertloch Chronicles

Fünf Rollen, ein Ablauf, klare Dateizuständigkeit. Jede Rolle arbeitet auf einem eigenen Branch im eigenen Worktree und übergibt über feste Dateien, nicht über Zuruf.

## Rollen und Zuständigkeit

> **Stand 2026-09-17:** Die Inhaltsrolle ist in sechs Fachrollen (Story, Klassen, Gameplay, Balancing, Loot, Welt) plus Lead-Architect aufgeteilt. Dateibesitz, Branches, Backlogs und Konfliktregeln stehen verbindlich in **`docs/ROLLEN.md`**; die Tabelle hier zeigt nur noch die Umsetzungsrollen.

| Rolle | Agent / Sitzung | Darf ändern | Übergibt an | Übergabedatei |
|---|---|---|---|---|
| **Inhalt** | `.claude/agents/inhalt-agent.md` | `content/**`, `tests/content.test.mjs`, `scripts/balance-report.mjs`, `scripts/art-brief.mjs`, `scripts/content-check.mjs` | Engine, UI, Grafik | `content/BACKLOG.md` (Engine/UI-Bedarf), `content/ART-BRIEF.md` (Grafik), `content/BALANCE-REPORT.md` |
| **Engine** | `.claude/agents/engine-agent.md` | `engine.js`, `rpg.js`, `clan.js`, `class-mechanics.js`, `encounters.js`, `itemization.js`, `talents.js`, `progression.js`, `activities.js`, `movement.js`, `tests/*.test.mjs` (außer content) | UI | `docs/UEBERGABE-UI-<Datum>.md` (neue Events, Felder, Funktionen) |
| **UI** | `.claude/agents/ui-agent.md` | `app.js`, `*-ui.js`, `popup-*.js`, `mobile-*.js`, `*.css`, `index.html`, `scripts/*-check.mjs`, `scripts/*-playtest.mjs` | Grafik | Bedarf an Icons/Sprites → `content/ART-BRIEF.md` ergänzen (nur `look`-Felder in `content/`, sonst Eintrag in `docs/GRAFIK-BEDARF.md`) |
| **Grafik** | Bild-KI (extern) + Renderer-Anbindung durch UI | `assets/content-art/**`; Anbindung in `*-art.js`, `renderer.js` durch UI | UI | Dateien nach `assets/content-art/<Art>/<ID>.png`, Prompts in `assets/content-art/PROMPTS.md` |
| **Welt** | bei Bedarf | `world*.js`, `terrain.js`, `cartography.js`, `data/`, `scripts/build-world.mjs`, `scripts/import-world.mjs` | Engine | Kommentar im Commit + `WORLD-GENERATION.md` |

Gemeinsame Dateien (`README.md`, `package.json`, `CLAUDE.md`, `scripts/build-site.mjs`): nur kleine, additive Änderungen; wer sie anfasst, schreibt es in den Commit-Text.

## Ablauf eines Features

```
1 Inhalt definiert          content/*.js + look-Felder            → npm run content:check grün
2 Engine-Bedarf?            content/BACKLOG.md „Braucht Engine“   → Engine setzt um, Test in tests/
3 UI-Bedarf?                docs/UEBERGABE-UI-<Datum>.md          → UI baut, Browsertest (scripts/*-check.mjs)
4 Grafik-Bedarf?            content/ART-BRIEF.md (npm run content:art) → Bild-KI liefert → UI bindet an
5 Balance                   npm run content:balance, Bericht im Commit
6 Merge                     Branch → main nur per Fast-Forward, npm test grün, Deploy prüfen
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

| Rolle | Branch | Worktree |
|---|---|---|
| Inhalt | `content-backend` | `D:\Dev\MertlochChronicles-content` |
| Engine | `engine` | `D:\Dev\MertlochChronicles-engine` |
| UI | `main` (Hauptcheckout) oder `ui` | `D:\Dev\MertlochChronicles` |
| Grafik | `art` | `D:\Dev\MertlochChronicles-art` |

Anlegen: `git worktree add -b <branch> D:\Dev\MertlochChronicles-<rolle> origin/main`. Vor jeder Arbeit `git fetch` und auf `origin/main` rebasen. Nach `main` nur Fast-Forward (`git push origin <branch>:main`) nach grünem `npm test`. Nach dem Push prüft die Rolle den Pages-Deploy (`https://er-esm.github.io/mertloch-chronicles/`).

## Übergabedateien

- `content/BACKLOG.md` – Inhalt → Engine/UI. Abschnitte „Braucht Engine“, „Braucht UI“, „Inhaltlich offen“. Erledigtes abhaken, nicht löschen.
- `docs/UEBERGABE-UI-<Datum>.md` – Engine/Inhalt → UI. Was gibt es neu, wo liegt es, was soll die UI daraus machen, wie prüfen.
- `content/ART-BRIEF.md` – generiert; Grafikaufträge mit Fallback. Nie von Hand editieren, `look`-Felder in `content/` pflegen.
- `docs/GRAFIK-BEDARF.md` – UI → Grafik für alles, was nicht aus `content/` kommt.
- `content/BALANCE-REPORT.md` – generiert; Nachweis jeder Balance-Änderung.

## Takt

Jede Rolle arbeitet in Runden: ein Auftrag, ein Branch, ein Bericht (was, warum, Beleg, offene Punkte). Nach jedem Merge liest jede andere Rolle ihre Übergabedatei. Niemand baut auf Zuruf; was nicht in einer Übergabedatei steht, existiert nicht.
