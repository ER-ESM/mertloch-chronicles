# Mertloch Chronicles – Arbeitsregeln

**Pipeline, Rollen, Branches und Übergabedateien: [docs/PIPELINE.md](docs/PIPELINE.md).** Agenten: `.claude/agents/inhalt-agent.md`, `engine-agent.md`, `ui-agent.md`, `mobile-agent.md` (Regelwerk `docs/MOBILE-GUIDELINES-2026-09-18.md`); Playtest-Personas `neuling-agent.md`, `kenner-agent.md`, `pruefer-agent.md` (nur Browser, vor jedem Merge, der Bedienung/Kampf/Menüs ändert; erster Lauf `docs/PLAYTEST-2026-09-17-AUSWERTUNG.md`). Was das Spiel ist: `docs/PITCH.md`. Entscheidungen mit Begründung: `docs/ENTSCHEIDUNGEN.md` — was dort nicht steht, ist nicht entschieden. Aktuelle Übergabe an die UI: `docs/UEBERGABE-UI-2026-09-12.md`. Visuelle Guideline: `docs/VISUELLE-BEWERTUNG-2026-09-13.md`. Menüstruktur (Clanbuch, umgesetzt): `docs/MENUE-BEWERTUNG-2026-09-17.md`. Gameplay Fluss/Rotation/Procs/Arena (umgesetzt 0.20): `docs/GAMEPLAY-KONZEPT-FLUSS.md`. Übergabe an die Bild-KI: `docs/UEBERGABE-GRAFIK-2026-09-17.md`, fehlende Sprites: `docs/FEHLENDE-SPRITES.md`.

**Pre-Render (E-30):** `npm run prerender:build` rendert das 3D-Rig (`tools/prerender`) zu Pixel-Sprites nach `assets/prerender/runtime`; `npm run prerender:demo <held> <assets>` erzeugt ein Kontrollbild. Kamera, Licht und Schatten sind fest (E-41): `tools/prerender/stage.js` + `light-convention.js`; der Schatten ist in die Heldenbögen gebacken (Katalog `shadowBaked`, Laufzeit `prerenderHasBakedShadow`), Kontrollbild `npm run prerender:shadow-check <held>`. Modellanforderungen: `docs/UEBERGABE-3D-ASTRA-2026-09-18.md`.

**Buildnummer:** `build-info.js` (Arbeitsstand „dev"); `npm run build` stempelt Commit-Zahl, Kurz-Hash und Datum nach `_site/build-info.js`. Im Spiel: Tag am HUD-Kopf (#Nummer) und Hilfe → Einstellungen. Live-Nummer = `git rev-list --count origin/main`.

Browser-Rollenspiel ohne Abhängigkeiten (ES-Module, Canvas, Node-Server). `npm test` muss vor jedem Commit grün sein; GitHub Actions prüft `main` und veröffentlicht eine separate Pages-Kopie. Das aktuelle Testspiel läuft auf dem eigenen Server unter https://mertloch.esm-consultant.de/ (siehe README); Client-Build und Node-Dienst dort separat aktualisieren.

Aktiver Grafikstandard: [Präzisionspixel](docs/PRAEZISIONSPIXEL-2026-09-17.md), Laufzeitkatalog `assets/precision/runtime/catalog.json`. Alte kleine Exporte nur als Vergleich verwenden.

**Bilder selbst anfordern (E-51):** `npm run sprites:generate -- tools/sprite-pipeline/<runde>-jobs.json [--only=id] [--force] [--dry-run]` erzeugt die Originale über das eingebaute Imagegen-Werkzeug von Codex (ChatGPT-Abo, kein API-Schlüssel) und schreibt die Herkunft nach `assets/precision/generation.json`; danach `npm run sprites:precision && node scripts/pwa-cache.mjs`. Anleitung und Fallen: [docs/BILDPIPELINE-DIREKT-2026-09-23.md](docs/BILDPIPELINE-DIREKT-2026-09-23.md).

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
npm run balance:sheet     # Rechentabellen je Klasse × Spec × Pfad × Stufe × Ausrüstung → content/BALANCE-SHEET.md (E-57)
npm run content:art       # Grafik-Briefing → content/ART-BRIEF.md
```

## Speicherschlüssel

IDs von Gegenständen, Fähigkeiten, Talenten (`<spec>-<index>`), Spezialisierungen und Klassen stehen in Browser-Spielständen. Nie umbenennen oder löschen.
