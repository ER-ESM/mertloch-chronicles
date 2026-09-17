# Rollen und Module – Mertloch Chronicles

Sieben Fachrollen plus die Umsetzungsrollen Engine, UI, Grafik und die Playtest-Personas. Jede Rolle besitzt Dateien, die keine andere Rolle anfasst, arbeitet auf einem eigenen Branch im eigenen Worktree und übergibt über feste Dateien. Wer etwas von einer anderen Rolle braucht, schreibt es in **deren** Backlog (`docs/backlog/<rolle>.md`), nicht in eine fremde Datei.

## Rollen und Dateibesitz

| Rolle | Agent | Besitzt (nur hier ändern) | Prüfdatei | Backlog (Inbox) |
|---|---|---|---|---|
| **Lead-Architect** | `.claude/agents/lead-architect.md` | `docs/ROLLEN.md`, `docs/PIPELINE.md`, `docs/ENTSCHEIDUNGEN.md`, `docs/ROADMAP.md`, `content/index.js`, `content/schema.js`, `content/checks/index.js`, `content/README.md`, `content/BACKLOG.md`, `package.json`, `CLAUDE.md` | – | `docs/backlog/lead.md` |
| **Story-Teller** | `.claude/agents/story-agent.md` | `content/story.js`, `dialogues.js`, `memories.js`, `npcs.js`, `quests.js`, `tutorial.js` (Texte), `panel-ui.js` (Beschriftungen), `portraits.js`, `person-appearance.js`, `docs/AKT-*.md` | `content/checks/story.js`, `tests/content-story.test.mjs` | `docs/backlog/story.md` |
| **Klassendesign** | `.claude/agents/klassen-agent.md` | `content/classes.js`, `skills.js`, `talents.js`, `talent-layout.js`, `procs.js`, `aperol-art.js` (Bildhinweise), `docs/KLASSEN-*.md` | `content/checks/klassen.js`, `tests/content-klassen.test.mjs` | `docs/backlog/klassen.md` |
| **Gameplay** | `.claude/agents/gameplay-agent.md` | `content/enemies.js` (Arten, Bosse, Zaubermuster, Spawn-Regeln), `combat.js`, `buildings.js`, `docs/GAMEPLAY-*.md`, Systemkonzepte | `content/checks/gameplay.js`, `tests/content-gameplay.test.mjs` | `docs/backlog/gameplay.md` |
| **Balancing** | `.claude/agents/balance-agent.md` | `content/balance.js`, `content/tuning.js`, `content/BALANCE-REPORT.md`, `scripts/balance-report.mjs`, `docs/BALANCE-*.md` | `content/checks/balance.js`, `tests/content-balance.test.mjs` | `docs/backlog/balance.md` |
| **Gegenstände & Loot** | `.claude/agents/loot-agent.md` | `content/items.js`, `drops.js`, `equipment.js`, `item-icons.js`, `EQUIPMENT.md`, `scripts/art-brief.mjs` | `content/checks/loot.js`, `tests/content-loot.test.mjs` | `docs/backlog/loot.md` |
| **Welt-Design** | `.claude/agents/welt-agent.md` | `world*.js`, `terrain.js`, `cartography.js`, `data/`, `scripts/build-world.mjs`, `scripts/import-world.mjs`, `WORLD-GENERATION.md`, Orte (`home`) in Absprache mit Story | `content/checks/welt.js`, `tests/content-welt.test.mjs`, `tests/world*.test.mjs` | `docs/backlog/welt.md` |
| Engine | `.claude/agents/engine-agent.md` | `engine.js`, `rpg.js`, `clan.js`, `class-mechanics.js`, `encounters.js`, `itemization.js`, `talents.js`, `progression.js`, `activities.js`, `movement.js`, `procs.js` (Laufzeit), `tests/*.test.mjs` (außer content) | – | `docs/backlog/engine.md` |
| UI | `.claude/agents/ui-agent.md` | `app.js`, `*-ui.js`, `popup-*.js`, `mobile-*.js`, `*.css`, `index.html`, `renderer.js`/`*-art.js` (Anbindung), `scripts/*-check.mjs` | – | `docs/backlog/ui.md` |
| Grafik | Bild-KI + UI-Anbindung | `assets/content-art/**` | – | `content/ART-BRIEF.md` (generiert), `docs/GRAFIK-BEDARF.md` |
| Playtest | neuling-/kenner-/pruefer-agent | nichts (nur Browser) | – | `docs/PLAYTEST-*.md` |

**Zahlen gehören Balancing, Strukturen gehören der Fachrolle.** Balancing ändert Werte ausschließlich in `content/balance.js` und `content/tuning.js` (Korrekturen je ID mit `why`/`since`); die Fachrollen setzen Startwerte in ihren Dateien und nehmen Tuning-Einträge bei Gelegenheit in die Definition auf („Einpflegen“ = Tuning-Zeile löschen, Wert in die Definition schreiben, im selben Commit).

## Gemeinsame Dateien

`content/index.js`, `content/schema.js`, `content/checks/index.js`, `package.json`, `content/README.md`, `content/BACKLOG.md`, `docs/PIPELINE.md` gehören dem Lead-Architect. Andere Rollen ändern sie nur **additiv und minimal** (eine Export-Zeile, eine Test-Glob) und nennen es im Commit-Text. Neue Prüfungen kommen in die eigene `content/checks/<rolle>.js`, neue Tests in `tests/content-<rolle>.test.mjs` (`npm run content:check` läuft alle `tests/content*.test.mjs`).

## Branches und Worktrees

| Rolle | Branch | Worktree |
|---|---|---|
| Lead-Architect | `lead` | `D:\Dev\MertlochChronicles-lead` |
| Story-Teller | `story` | `D:\Dev\MertlochChronicles-story` |
| Klassendesign | `klassen` | `D:\Dev\MertlochChronicles-klassen` |
| Gameplay | `gameplay` | `D:\Dev\MertlochChronicles-gameplay` |
| Balancing | `balance` | `D:\Dev\MertlochChronicles-balance` |
| Gegenstände & Loot | `loot` | `D:\Dev\MertlochChronicles-loot` |
| Welt-Design | `welt` | `D:\Dev\MertlochChronicles-welt` |
| Engine | `engine` | `D:\Dev\MertlochChronicles-engine` |
| UI | `ui` | `D:\Dev\MertlochChronicles-ui` |
| Grafik | `art` | `D:\Dev\MertlochChronicles-art` |

Anlegen: `git worktree add -b <branch> D:\Dev\MertlochChronicles-<rolle> origin/main` (existiert der Branch schon: ohne `-b`). Vor jeder Runde `git fetch && git rebase origin/main`. Nach `main` nur Fast-Forward (`git push origin <branch>:main`) nach grünem `npm test`. Der Branch `content-backend` ist Altbestand und wird nach Übernahme in `main` nicht weitergeführt.

## Konfliktregeln

1. Eine Datei, ein Besitzer. Wer eine fremde Datei ändern will, stellt die Bitte ins Backlog des Besitzers.
2. Zahlen: Balancing über `tuning.js`; nie direkt in fremden Definitionsdateien.
3. IDs sind Speicherschlüssel: nie umbenennen, nie löschen (`retired:true`).
4. Neue Exporte: jede Rolle darf **eine** Zeile `export * from './<datei>.js'` in `content/index.js` ergänzen; Konflikte dort löst der Lead.
5. Eine Runde = ein Auftrag, ein Branch, ein Bericht (was, warum, Beleg, offene Punkte), ein Fast-Forward. Wer nicht Fast-Forward pushen kann, rebased; wer beim Rebase in eine fremde Datei gerät, bricht ab und meldet es dem Lead.
6. Engine- und UI-Bedarf: nur über `docs/backlog/engine.md` bzw. `docs/backlog/ui.md`, mit Verweis auf die Content-Exporte, die es dafür schon gibt.

## Runde einer Fachrolle

```
1 Backlog lesen         docs/backlog/<rolle>.md + docs/ENTSCHEIDUNGEN.md
2 Rebase                git fetch && git rebase origin/main
3 Arbeiten              nur eigene Dateien; Prüfungen in checks/<rolle>.js, Tests in tests/content-<rolle>.test.mjs
4 Prüfen                npm run content:check · npm run content:balance · npm run content:art · npm test
5 Übergeben             Bedarf in fremde Backlogs; Erledigtes im eigenen abhaken
6 Commit + FF nach main git push origin <branch>:main
7 Bericht               kurz, mit Beleg (Testzahlen, Bericht-Diff, Screenshots)
```

## Lead-Architect

Hält die Landkarte: welche Rolle woran arbeitet, welche Entscheidungen gelten (`docs/ENTSCHEIDUNGEN.md`), welche Reihenfolge (`docs/ROADMAP.md`). Schreibt keine Inhalte selbst, sondern Aufträge in die Backlogs, prüft nach jedem Merge Übergaben und Konflikte, hält `schema.js`/`index.js` sauber und bricht Zirkel (Rolle A wartet auf B wartet auf A) durch Entscheidung.
