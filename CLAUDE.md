# Mertloch Chronicles – Arbeitsregeln

**Pipeline, Rollen, Branches und Übergabedateien: [docs/PIPELINE.md](docs/PIPELINE.md).** Agenten: `.claude/agents/inhalt-agent.md`, `engine-agent.md`, `ui-agent.md`. Aktuelle Übergabe an die UI: `docs/UEBERGABE-UI-2026-09-12.md`.

Browser-Rollenspiel ohne Abhängigkeiten (ES-Module, Canvas, Node-Server). `npm test` muss vor jedem Commit grün sein; GitHub Actions veröffentlicht `main` auf GitHub Pages.

## Modulgrenzen

| Bereich | Dateien | Wer arbeitet dort |
|---|---|---|
| **Inhalt** (Daten) | `content/` – Items, Beute, Gegner, Bosse, Skills, Klassen, Talente, Quests, NPCs, Dialoge, Story, Balancing | Inhalts-Agent (`.claude/agents/inhalt-agent.md`), siehe `content/README.md` |
| **Engine** (Logik) | `engine.js`, `rpg.js`, `clan.js`, `class-mechanics.js`, `encounters.js`, `itemization.js`, `talents.js`, `progression.js`, `activities.js`, `movement.js` | Engine-Arbeit; liest Daten nur aus `content/index.js` |
| **Welt** | `world*.js`, `terrain.js`, `cartography.js`, `data/` | Weltgenerierung |
| **Oberfläche** | `app.js`, `*-ui.js`, `popup-*.js`, `mobile-*.js`, `*.css`, `index.html` | UI-Arbeit |
| **Grafik** | `*-art.js`, `comic-*.js`, `pixel-*.js`, `renderer.js`, `assets/` | Bild-KI liefert nach `content/ART-BRIEF.md`; Renderer bindet an |

Inhalt darf nie Logik enthalten, Logik nie Inhaltstexte oder Zahlen (Ausnahme: Formeln). Neue Texte, Namen, Werte gehören nach `content/`.

## Prüfen

```
npm test                  # alle Spieltests inkl. tests/content.test.mjs
npm run content:check     # Schema/Invarianten der Inhalte + Tests
npm run content:balance   # TTK-Matrix → content/BALANCE-REPORT.md
npm run content:art       # Grafik-Briefing → content/ART-BRIEF.md
```

## Speicherschlüssel

IDs von Gegenständen, Fähigkeiten, Talenten (`<spec>-<index>`), Spezialisierungen und Klassen stehen in Browser-Spielständen. Nie umbenennen oder löschen.
