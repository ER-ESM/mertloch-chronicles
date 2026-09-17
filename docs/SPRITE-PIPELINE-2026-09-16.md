# Drei echte Sprite-Prototypen und Produktionspipeline

Aktueller Ausbau: [fünf Grafik-Iterationen und animierbarer Baukasten](GRAFIK-REVIEW-5-RUNDEN-2026-09-17.md). Projekt-Skill: [.agents/skills/maifeld-sprites/SKILL.md](../.agents/skills/maifeld-sprites/SKILL.md).

Stand: 16.09.2026. **Der Nutzer hat Maifeld-Detailpixel gewählt.** C1 ist damit entschieden. Die ursprünglichen drei Kandidaten bleiben als Vergleich erhalten; der ausgearbeitete [Maifeld-Prototyp](MAIFELD-PROTOTYP-2026-09-16.md) zeigt den nächsten Stand. Die Prototypen ersetzen noch keine Produktionsfiguren.

## Direkt ausprobieren

[Öffentliche Figurenwerkstatt](https://er-esm.github.io/mertloch-chronicles/sprite-lab.html).
Lokal: `npm start`, dann `http://localhost:4173/sprite-lab.html`.

| Kandidat | Tatsächliche Runtime | Stärke | Trade-off |
|---|---|---|---|
| Dorfcomic | 28 px Mensch, 24 Farben | kompakte Silhouetten, warme Dorf-Farbigkeit | wenig Gesichtsauflösung |
| Maifeld-Detailpixel | 52 px Mensch, 40 Farben | Kleidung, Ausrüstung und Gesichter; Empfehlung | bei kleiner Weltansicht verdichten sich Details |
| Krawall-Karikatur | 40 px Mensch, 28 Farben | breite Konturen, große Köpfe, derber Humor | bewusst überzeichnete Anatomie |

Jeder Stil enthält Aperol-Anni, Dosen-Dieter, Grill-Oskar und einen Keiler mit acht **wirklich unterschiedlich gezeichneten Posen**: Stand, drei Laufposen, Ausholen, Angriff, Treffer, Durchatmen. Insgesamt 96 Posen in drei PNG-Atlanten. Die Bildgenerierung hat pro Stil einen Originalatlas erstellt. Technische Verarbeitung reduziert diese auf die verbindliche Pixelauflösung und Palette. Das ist kein UI-Mockup.

Eine gezeichnete Südost-Ansicht, links gespiegelt; keine gezeichnete Rückansicht. Die Clips sind kurze Prototyp-Loops, keine final ausgearbeiteten Kampfanimationen. Die Weltprobe nutzt echte Kartenkollision und den vorhandenen Renderer, aber keinen Kampf-/Questfortschritt. Sie liest/schreibt keinen Spielstand. Nicht alle vorhandenen Spielcharaktere wurden bereits umgestellt.

Zusätzlich: vier Köpfe, vier Oberkörper, vier Beine je Stil. Je zwei Varianten für kräftige und schlanke Körper. 2 × 2 × 2 × 2 = 16 zulässige Figuren pro Stil, insgesamt 48 Rezepte. **Bauteile derzeit ausschließlich Standpose/Südost.** Keine Behauptung, dass ein Standbild-Baukasten automatisch durchgehend animierbar ist. Tiere erhalten eigene Skelette; Menschenteile passen nicht an Keiler.

## Dateien und reproduzierbarer Ablauf

- Unveränderte generierte Quellen: `assets/sprite-lab/sources/` (sechs PNGs).
- Originalprompts und Stilreferenzen: `tools/sprite-pipeline/prompts.json`, `module-prompts.json`.
- Verbindliche Paletten, Auflösungen, Posen, Clips und Sockets: `tools/sprite-pipeline/config.mjs`.
- Import/Packen: `build.mjs`, PNG-Verarbeitung: `png.mjs`, Silhouetten-Erkennung: `segment.mjs`.
- Browserfertige Atlanten, Herkunfts-Hashes, einzelne Quellrechtecke und Pivots: `assets/sprite-lab/runtime/catalog.json` plus sechs PNGs.
- Gemeinsame Rezeptvalidierung und Zusammensetzung: `sprite-library.js`.

```sh
npm run sprites:build
npm run sprites:check
npm run sprites:brief -- --style detailpixel --id tuning-timo --kind npc --description "Landjunge, grüne Arbeitsjacke, Ratsche, rotes Halstuch"
```

Der Brief-Befehl schreibt einen konkreten JSON-Auftrag auf stdout. Er löst keine kostenpflichtige Bildgenerierung aus. Den Auftrag unter `generated/<id>/job.json` speichern und dem definierten Artist geben. Neue Charaktere benötigen anschließend einen expliziten Importdatensatz: Der aktuelle Builder verarbeitet die drei Vergleichsatlanten, nicht beliebige unbekannte Raster ohne Anpassung.

1. Stil wählen, Identitätsmerkmale festhalten, vorhandene Bauteile prüfen.
2. Einen Master/Standpose mit eingefrorener Stilreferenz generieren und visuell prüfen. Prompt, Referenzen und unveränderte Quelle archivieren.
3. Animationen in kleinen Chargen desselben Charakters erzeugen; Master immer als Referenz mitgeben. Stabile Kleidung, Waffenseite und Proportionen kontrollieren.
4. Silhouetten über Alpha-Komponenten erkennen. Fehlende/mehrdeutige Figuren oder angeschnittene Quellen zurückweisen. Ein generiertes Raster ist kein zuverlässiges Schnittmaß.
5. Pro Figur einen festen Maßstab aus der Standhöhe verwenden. Fußanker aus unterem Silhouettenbereich bestimmen. Harte Alpha-Kante, feste Palette, Nearest-Neighbor; keine kreative Neuzeichnung im Packschritt.
6. Bauteile mit expliziten Hals-/Taillensockets zusammensetzen. Stil, Rig, Blickrichtung und Zustand müssen passen. Pro Animation müssen auch verdeckte Hinterarme und Vorderarme als getrennte Ebenen geplant werden.
7. Determinismus, Vollständigkeit, Farbraum, Alpha, Ränder und Rezepte testen. Anschließend echte Bewegung bei Spielgröße visuell prüfen; Hashgleichheit prüft keine Kunstqualität.
8. Reviewer dokumentiert Abweichungen. Erst geprüfte Dateien erhalten Produktionsstatus und werden an den Spielrenderer angebunden.

**Deterministisch ist die Verarbeitung eingefrorener Dateien, nicht die KI-Generierung.** Gleicher Prompt und gleiche Referenz garantieren kein identisches Bild. Quellen und Output-Hashes im Katalog machen Änderungen überprüfbar. Ein Stil-Lock und visuelle Abnahme sind notwendig; der Automatismus darf sichtbare Drift nicht als bestanden deklarieren.

## Ausbau für alle Helden, NPCs und Gegner

Zielmatrix je menschlicher Figur: vier gezeichnete Blickrichtungen × (2 Stand + 6 Laufen + 4 Angriff + 4 Zaubern + 2 Treffer + 5 Tod + 3 Interaktion) = **104 Frames**. Je Tier: vier Richtungen × (2 Stand + 6 Laufen + 4 Angriff + 2 Treffer + 5 Tod) = **76 Frames**. Das sind Produktionsanforderungen, noch nicht gelieferte Frames.

Reihenfolge: gewählten Stil an Anni und Dieter stabilisieren → Kevin und Oskar → Questgeber → Bewohnerbibliothek → Keiler/Wölfe → humanoide Gegner/Bosse. Jede Figur benötigt sichtbare eindeutige Merkmale und passende Porträts. Waffen getrennt mit Hand-Sockets, Vorder-/Hinterarm-Layern und Animationstiming; kein starrer Gegenstand an den Füßen. Erst wenn alle Richtungen und Posen eines Rigs stehen, Bauteile für Kleidung/Haar/Accessoires auf diese Matrix ausweiten.

## Subagent-Definitionen

Vier projektbezogene Definitionen in `.codex/agents/`: `sprite_director`, `sprite_artist`, `sprite_integrator`, `sprite_reviewer`. Modell und Berechtigungen werden vom Elternagenten geerbt. Das Format wurde anhand der [offiziellen Codex-Dokumentation zu Custom Agents](https://learn.chatgpt.com/docs/agent-configuration/subagents#custom-agents) geprüft. Definitionen werden in einer neuen unterstützten Codex-Sitzung geladen; in dieser Arbeit wurde kein End-to-End-Lauf mit diesen neu registrierten Rollen ausgeführt.

Beispielauftrag nach Stilwahl:

> Nutze die Sprite-Subagenten für Tuning-Timo im Stil detailpixel. Der Director erstellt den Auftrag, der Artist generiert die freigegebene Standpose und den ersten Animationsstreifen, der Integrator importiert sie, der Reviewer prüft die echten Browserbilder. Warte jeweils auf den vorherigen Übergabestand. Keine Produktionsfreigabe ohne bestandene technische und visuelle Prüfung.

Unabhängige Figuren können parallel in getrennten Verzeichnissen entstehen. Pro gemeinsamen Katalog/Runtime-Atlas schreibt nur ein Integrator. Review läuft nach dem Import, nicht gleichzeitig gegen sich ändernde Dateien. Übergabe: Job-ID, Quellpfade, Prompt/Referenz, ausgeführte Checks, offene Abweichungen und Status.

## Prüfung dieses Prototyps

Automatisiert: zwei Builds bytegleich; 96 nichtleere Frames mit Padding, Palettenfarben und binärer Transparenz; Angriff/Ausholen unterscheidbar; 48 kompatible Rezepte; Ablehnung falscher Stile, Rigs und nicht vorhandener Animationen; PNG-Roundtrip. Browserprüfung: tatsächliche Bewegung, alle 48 Baukastenrezepte, Desktop und 390 × 844, keine horizontalen Überläufe oder Runtime-Fehler. Zusätzlich geprüft: Pause/Einzelbild, heller/karierter Untergrund, echte PNG-/JSON-Downloads per Button, Touch-Zielbewegung und 844 × 390 Querformat. Alle 48 Kombinationen wurden auch als Kontaktbögen visuell betrachtet. 167 Projekttests bestanden.

Browser-Testskript: `node scripts/browser-sprite-lab.mjs` und `node scripts/browser-sprite-details.mjs` (isolierter Chrome mit CDP-Port 9222 erforderlich). Screenshots lokal unter `visual-review/sprite-lab/`.

Visueller Befund: Stile sind deutlich unterscheidbar. B bewahrt mehr Kleidungs- und Gesichtsdetails; C wirkt karikaturhafter; A ist am gröbsten. Quellen haben kleine Identitäts-/Formschwankungen zwischen Posen; Prototypstatus bleibt deshalb ausdrücklich erhalten. Für Produktion fehlen unter anderem Rückansichten, mehr Zwischenbilder und die komplette modulare Animationsmatrix.
