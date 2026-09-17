# Backlog · lead

Inbox des Lead-Architect (`docs/ROLLEN.md`): Entscheidungen, Zirkel, Dateispaltungen, Grafik-Koordination.

## Offen

- [ ] Playtest-Lauf Akt 1 auf dem Live-Stand mit `neuling-agent`, `kenner-agent`, `pruefer-agent` beauftragen (Runde A, `docs/ROADMAP.md`); Befunde in Runde C auf die Rollen-Backlogs verteilen.
- [ ] Nach jedem Fast-Forward aus Runde A prüfen: `npm test`, `npm run content:check`, Übergabedateien gelesen, Backlogs abgehakt, keine Rolle wartet ohne Eintrag auf eine andere.
- [ ] `content/schema.js` verlangt von jedem `kind:'consumable'` ein `heal` oder `energy`. Das Pfandbon-Bündel (dreifache Marken für 60 s) ist Verbrauch ohne Heilung; es trägt deshalb ersatzweise `energy:20`. Bitte entscheiden: Regel auf „heal, energy **oder** eigene Wirkung (`effect`)“ erweitern – dann nimmt Loot die 20 Randale wieder heraus. Betrifft: `content/schema.js`, `content/items.js` (`pfandbon`).
- [ ] `content/recipes.js` liegt bei Loot (Auftrag Runde B), `content/shop.js` bei Gameplay (Konzept `docs/GAMEPLAY-HAENDLER-HANDWERK.md` §6 sah beides bei Gameplay). Bitte Dateibesitz in `docs/ROLLEN.md` nachziehen oder die Rezepte umhängen, bevor Gameplay den Laden baut.
- [ ] Entscheidung zu E-21 (Basisbau-Kosten) fällen, sobald Balance die Sammelzeit gegen den Materialfluss gemessen hat.
- [ ] Entscheidung zu „Feldgegner ab Stufe 10 trivial“ (Skalierung in der Engine vs. `tuning.js` vs. bewusst lassen) — steht unter „Offen“ in `docs/ENTSCHEIDUNGEN.md`.
- [ ] `content/index.js` und `content/schema.js` nach den parallelen Fachrollen-Pushes auf Konflikte und fehlende Exporte prüfen.

## Grafik-Prioritäten (aus `content/ART-BRIEF.md`, Reihenfolge verbindlich)

Alle Motive laufen im Stil Maifeld-Detailpixel (E-10), Maßstab nach E-11. Bis zur Lieferung zeichnet das Spiel den Fallback aus dem Briefing — nichts darf ohne Bild kaputtgehen.

1. **Mentoren-Sprites** — Dosen-Dieter, Aperol-Anni, Klo-Kevin an der Bude. Höchste Priorität: Die Klassenwahl ist die Klamottenwahl (E-17), die drei stehen dauerhaft im Bild und nutzen heute Ersatzgrafik.
2. **Sammelpunkte** — Material im Umland (Palettenholz, Kronkorken, Dosenblech, Kabel, Borste, Feder, Dachsfell, GAME-OVER-Shirts). Trägt den Materialdruck des Basisbaus (E-21); ohne eigene Optik sieht der Spieler nicht, wofür er läuft.
3. **Porträt Polizeiobermeister Pit** — `npc/pit`, Porträt 48×48 + Sprite 26 px. Einzelnes fehlendes Porträt der Akt-1-Besetzung; Anbindung steht in `docs/backlog/ui.md`.
4. **Akt-1-Bosse** — `sigi`, `klaus`, `timo` (je Sprite ca. 52 px, Idle + Angriff). Nutzen heute alle den Skin „horst“ und sind dadurch nicht auseinanderzuhalten.
5. **Kapitel-Kulissen** — Sperrmüllplatz, Kegelbahn-Trümmer, Bus im Feld, Bude mit Ausbaustufen. Setzt Objekte von Welt voraus (`docs/backlog/welt.md`) und Renderer-Anbindung durch UI (`docs/backlog/ui.md`) — deshalb zuletzt.

Nachrangig und **nicht** Teil von Akt 1: Gisela Gießkanne und Pfandautomat 3000 (Reserve, E-23).


### Aus dem Playtest Akt 1 (docs/PLAYTEST-2026-09-17-AKT1.md)

- [ ] **P16** Persona-Aufrufe brauchen Koordinaten der Hofproben-Objekte oder mehr Budget; Screenshots kommen nicht als Bild zurück.
- [ ] Entscheidung: Taste 1 als Toggle abschaffen (E-24 vorschlagen); Hofprobe auf ≤ 12 Aktionen deckeln.

### Aus Engine Runde B (2026-09-17)

- [ ] **`content/schema.js` für die neuen Proc-Bausteine öffnen** (gemeinsame Datei, deshalb hier): Die Effektliste in der Proc-Prüfung lässt nur `free|reset|empower|energy|points|shield|haste` zu; die Laufzeit kann jetzt zusätzlich `heal` (Zahl) und `cdReduce` (`{skill,seconds}`). Außerdem sollte die Prüfung bei `trigger:'skillHit'` ein `skill` (bekannter Kniff) und ein ganzzahliges `every` ≥ 2 verlangen. Formen: docs/UEBERGABE-UI-2026-09-17.md §6.7. Klassendesign wartet darauf, siehe docs/backlog/klassen.md.

## Erledigt

- [x] Rollenmodell mit Dateibesitz, Tuning-Schicht, Rollen-Prüfungen und Backlogs eingeführt (2026-09-17, E-19).
- [x] `docs/ENTSCHEIDUNGEN.md` angelegt: alle bekannten Festlegungen als nummerierte Einträge E-01 bis E-23 mit Kontext, Entscheidung, Konsequenzen; Akt-1-Entscheidungen vom 2026-09-17 eingetragen (E-16 bis E-23).
- [x] `docs/ROADMAP.md` angelegt: Runden A (Fachrollen parallel + Playtest), B (Loot nach Gameplay, UI nach Engine/Welt), C (Playtest-Befunde verteilen), danach erst Akt 2 — je Runde mit Abnahmekriterien.
- [x] Grafik-Aufträge aus `content/ART-BRIEF.md` priorisiert (Liste oben).
- [x] Branch `content-backend` stillgelegt: Altbestand, in `main` übernommen, wird nicht weitergeführt; die Rollen arbeiten auf ihren Branches laut `docs/ROLLEN.md` (E-19).
