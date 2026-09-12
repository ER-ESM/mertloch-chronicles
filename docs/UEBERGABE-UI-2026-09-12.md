# Übergabe an die UI-Sitzung · 2026-09-12

Von: Inhalt/Engine (Branch `content-backend`, seit heute auf `main`). Bitte zuerst `git pull`, dann `docs/PIPELINE.md` lesen.

## Was sich geändert hat

Alle Inhalte liegen als Daten in `content/` und kommen über `import {…} from './content/index.js'`. Die Engine liefert sie bereits am Spielzustand; die UI muss nichts mehr selbst wissen. Alle bisherigen Exporte (`ITEMS`, `SPECS`, `TALENTS`, `CLAN_MEMBERS`, `STORY`, `LESSONS`, …) bleiben; bestehender UI-Code läuft unverändert. Das Spiel ist live und ohne Konsolenfehler.

## Neue Felder und Daten, die die UI nutzen soll

| Wo | Feld | Inhalt | Für die UI |
|---|---|---|---|
| `world.quests[i]` | `lines.progress`, `lines.complete`, `lines.claimed` | Gesprächszeile des Questgebers je Zustand | `showSideQuest` in `app.js`: statt der drei fest verdrahteten Sätze diese Zeilen zeigen |
| `world.quests[i]` | `itemName` (gather), `enemyName` (hunt), `template`, `giver.npc` | Name des Sammelguts / der Lagergegner, Vorlagen-ID, NPC-ID | Questlog und Fortschrittsanzeige („2 / 3 Wilder Eifelhopfen“), Interaktionslabel kommt schon aus der Engine |
| `enemy` | `elite` (bool), `title` (Elite/Boss-Titel), `family`, `variant` | Elite-Kennzeichen, Untertitel, Beutefamilie, Grafikvariante | Zielfenster: „ELITE · ST. 4“ auch für `elite`, `title` als zweite Zeile; Karte: Elite-Symbol |
| `enemy.cast.name` | unverändert, aber neue Muster je Art | Name nennt immer die Antwort (Parade / ausweichen / Q unterbricht / Fläche verlassen) | Cast-Balken funktioniert wie bisher |
| `game.messages` | Boss-Sprüche („Gisela Gießkanne: „…““) bei Kampfbeginn, 50 %, 20 %, Tod | heute nur im Kampflog | **Wunsch:** Sprechblase über dem Gegner, 3 s, siehe `BOSS_LINES` und `BOSSES.*.phases` |
| `content/index.js` | `ENEMY_BARKS[archetyp]` | Sprüche menschlicher Feldgegner beim Angriff | Sprechblase bei Aggro-Beginn (Engine setzt heute noch kein Event; wenn gewünscht, Eintrag in `content/BACKLOG.md` „Braucht Engine: Event `bark`“) |
| `content/index.js` | `VILLAGERS[variant].name`, `.says[]` | Namen und Sprüche der acht Dorfbewohner-Varianten | `village-life.js` setzt `bubble=3` ohne Text; Text aus `says` zufällig wählen und zeichnen |
| `content/index.js` | `MAIN_DIALOGUE.ida.intro/ongoing/reward/claimed` | Idas Texte, identisch mit `clan-ui.js` | `introDialogue`, `rewardDialogue`, `ongoingDialogue` in `clan-ui.js` aus diesen Daten rendern, Duplikat entfernen. `chapter2`/`chapter3` liegen für später bereit |
| `content/index.js` | `PROCS[id].text` | Effekttext der Dorflegenden | Item-Tooltip: `ITEMS[id].proc` → `PROCS[proc].text` als eigene Zeile statt nur im Flavour-Text |
| `ITEMS[id]` | `heal` **und** `energy` gleichzeitig (Currywurst) | Verpflegung mit zwei Wirkungen | Tooltip und Rucksack-Leiste beide Werte zeigen; `useItem` verarbeitet beides schon |
| `content/index.js` | `STORY_CHAPTERS`, `LORE`, `FACTIONS`, `NPCS` | Kapitelübersicht, Hintergrund, Fraktionen, NPC-Rollen | Optional: Reiter „Geschichte“ im Auftragsbuch mit Kapitel 1 (aktiv) und Kapitel 2/3 (ausgegraut „bald“) |

## Konkrete Aufgaben, priorisiert

1. **Questdialog aus `q.lines`** (`app.js` `showSideQuest`, `questlog-ui.js`): Fortschritts-, Abschluss- und Erledigt-Text aus den Daten. Sammelfortschritt mit `q.itemName`.
2. **Elite im Zielfenster** (`app.js` Zeile mit `#targetLevel`): `e.elite||e.type==='boss'` → „ELITE“; `e.title` als Untertitel. Minimap/Karte (`cartography.js` `visibleCreatures`): Elite als eigenes Symbol.
3. **Boss-Sprechblasen**: Zeichnen über dem Gegner, wenn eine neue Kampflog-Zeile mit `„` von einem Boss stammt; sauberer: Engine-Event `bark` (dann Backlog-Eintrag, Engine setzt es in `startCast`/`kill`).
4. **Idas Dialoge aus `MAIN_DIALOGUE`** (`clan-ui.js`): Rendering behalten, Texte aus den Daten. Danach ist `clan-ui.js` frei von Inhaltstexten.
5. **Tooltip-Effektzeile** für `proc` (`rpg-ui.js` `itemTooltip`).
6. **Dorfbewohner-Sprüche** (`village-life.js`/Renderer).
7. **Grafik anbinden** (`clan-art.js`, `item-art.js`): Ladeliste `assets/content-art/<Art>/<ID>.png`; wenn Bild vorhanden → zeichnen, sonst Fallback `skin`/`icon`. Das ist die Brücke zur Bild-KI; Aufträge stehen in `content/ART-BRIEF.md`.

## Was die UI nicht tun soll

- Keine Texte, Namen oder Zahlen in UI-Dateien anlegen. Fehlt etwas, Eintrag in `content/BACKLOG.md` unter „Braucht UI“ mit Feldwunsch; Inhalt liefert.
- Keine Änderungen in `content/`, `engine.js`, `rpg.js`, `clan.js`, `encounters.js`, `itemization.js`, `talents.js`, `progression.js`.
- IDs nicht umbenennen (Spielstände).

## Prüfen

- `npm test` (108 Tests) muss grün bleiben.
- Browserpfade wie bisher mit `scripts/progression-ui-check.mjs`, `scripts/progression-quests.mjs`; neue Pfade als eigenes `scripts/<thema>-check.mjs` mit Screenshot in `progression-review/`.
- Live-Prüfung nach dem Merge auf `https://er-esm.github.io/mertloch-chronicles/`.

## Nachschlagen

- `content/README.md` – Dateikarte und Regeln der Inhaltsschicht
- `content/BACKLOG.md` – offene Engine-/UI-Punkte
- `content/BALANCE-REPORT.md` – aktuelle Balance-Matrix
- `content/ART-BRIEF.md` – 55 Grafikaufträge für die Bild-KI
- `docs/PIPELINE.md` – Rollen, Ablauf, Branches
## Ergänzung 0.14 · Mobile und Ausrüstung (integriert)

- `game.rpg.version=4`, `equipment` enthält 16 Plätze. `EQUIPMENT_SLOTS` und `SLOT_ICONS` kommen aus `content/index.js` (Kompatibilitätsexport auch in `equipment.js`). Paarplätze: ring1/2 und trinket1/2. weapon bleibt der Haupthandschlüssel, body der Brustschlüssel.
- `ITEMS[id].weapon={type,hands,min,max}`, `shield?:boolean`, `stats?` optional. Neue Daten stehen im gemeinsamen Katalog. `skill.requiresWeapon` nennt melee/ranged/shield/heavy; `weaponSource` bestimmt Nah-/Fernkampfschaden.
- `equipItem(game,id,slot?)` wechselt atomar inklusive beider Hände; `equipmentPlan` liefert Platz und abgelegte Teile für Vergleiche. `skillStatus.weaponMissing` steuert den roten Ausrüstungshinweis. `rpgChanged` und `save` bleiben die Aktualisierungsereignisse.
- Charakterfenster, Tooltips, gezielte Platzbuttons und Touch-Bedienung sind umgesetzt. `claimStarterWeapons` gibt die einmalige Clankiste am Treffpunkt; `recovery` bewahrt inkonsistente Altgegenstände bis zum Einpacken.
- Mobile Steuerung, konfigurierbare rechte Skillbuttons, Kontextmenü und PWA sind integriert. Die PWA-Cacheliste enthält jetzt auch alle content-Module. Browserprüfungen: `scripts/equipment-review.mjs`, `scripts/mobile-review.mjs`, `scripts/mobile-combat.mjs`, `scripts/pwa-review.mjs`.

## Gesprächsporträts · 2026-09-12

- `conversationHeader(npcId, fallbackName?)` zeigt Namen, Rolle und einen festen Porträtausschnitt. Ida sowie alle zehn möglichen Nebenquestgeber haben eigene Bilder; Bernd ist grafisch vorbereitet.
- Zuordnung in `content/portraits.js`, Export über `content/index.js`. Die Atlaszellen beziehen sich auf NPC-IDs, nicht Questpositionen oder Weltseeds. Unbekannte Figuren/fehlende Bilder behalten Namen und Initiale.
- Hauptdialoge lesen `MAIN_DIALOGUE.ida`, Nebenaufträge verwenden `q.lines.progress/complete/claimed`. Die Belohnungsauswahl behält den Auftraggeber. Keine neue Engine-Mechanik oder Änderung an Spielständen.
- Atlas: `assets/content-art/npcs/dialogue-atlas.png`, Herkunft und finaler Imagegen-Prompt in `assets/content-art/PROMPTS.md`. Die PWA nimmt diesen Asset-Ordner in den Offline-Cache auf.
- Reproduzierbare Browserprüfung: `node scripts/portraits-check.mjs [URL] [Ausgabeordner]`, Desktop 2024×900, Touch 390×844 und 844×390, Gespräch/Annahme/persönliche Antworten/Belohnung und Bewegung bei offenem Gespräch. 135 automatisierte Tests grün.
