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

## Ergänzung 0.15 · Autoangriffe, Zaubern, Beuteicons

- `game.autoAttack={enabled,timers}`: separate Timer pro Waffenhand, Basisintervall aus `weapon.speed` bzw. `WEAPON_TYPES`, beschleunigt durch Drehzahl. Start über den frei belegbaren Skill `auto` oder einen offensiven Zielskill. Kein Angriff allein durch Zielwahl. Neue Figuren beginnen mit auto auf Platz 1 und strike auf Platz 2; bestehende Belegungen bleiben erhalten.
- `enemy.autoAttack={name,min,max,speed,range,ranged?}`, nach Familie aus `ENEMY_AUTOS`. Sofortiger Treffer in Reichweite beim Verfolgen, eigener Timer neben Spezialattacken. Sichtlinie, Stun, Ankunftsschutz und Ausweichen gelten weiter. Autoangriffe pausieren während eigener Zauber; Spezialpausen sind getrennt.
- `game.casting={id,name,remaining,total,targetId,point}`: neue Wirkzeiten aus `CAST_TIMES`. Bewegung, Weglaufen per Mausklick und Ausweichen brechen ab; Esc am Desktop ebenfalls. Wirkung/Kosten/Cooldown erst bei Abschluss, GCD ab Beginn. Ziel wird beim Beginn gebunden, Abschluss prüft Reichweite, Sicht und Voraussetzungen erneut.
- `skill.damageModel={flat?,weapon?,flatPerPoint?,weaponPerPoint?,bonusPct?}`: (Festwert + Waffenwurf × Koeffizient + Punktboni) × (1 + Prozentbonus). Anschließend wirken normale Stats, Talente, Markierung und Krit. Ohne Modell gilt die kompatible bisherige Berechnung. Tooltips zeigen die Formel und Zauberzeit.
- Autoangriff leuchtet bei Aktivierung, Skillbuch und Touchbelegung unterstützen ihn trotz offGcd. Neuer schmaler Wirkzeitbalken, Waffen zeigen Tempo und Schaden/s. Lootfenster schließen außerhalb von 43 Welteinheiten, bei Tod und verschwundener Beute; übrige Fenster bleiben offen.
- `DETAIL_ICONS` und `ITEM_ICON_OVERRIDES` bilden den neuen 5×5-Atlas ab. Materialien und Dorflegenden haben konkrete Motive. `FAMILY_TROPHIES` gilt nur auf Trophäenplätzen. Alle Namen/Icons: [ICON-COMBAT-REVIEW.md](ICON-COMBAT-REVIEW.md).
- Prüfen: `scripts/combat-icons-check.mjs`, `scripts/auto-combat-playtest.mjs`, `tests/auto-combat.test.mjs`. Gemeinsame Datei package.json auf 0.15.0 angehoben; Offline-Cache enthält den neuen Atlas und alle Module.

## Erledigt · Punkte 1–3 · Version 0.15.1

- **1:** Dialog, Auftragsbuch und HUD verwenden dieselbe Auswahl aus `q.lines` und denselben Fortschrittstext. Sammelgut aus `itemName`, Jagdgegner aus `enemyName`; auch das Interaktionslabel über Sammelobjekten kommt aus der Questdefinition. Persönliche Antworten erscheinen für laufende, abgabebereite und erledigte Aufträge. Inhalte werden beim HTML-Rendering maskiert.
- **2:** `elite || type === 'boss'` kennzeichnet das Zielfenster und zeichnet eine goldene Krone auf Minimap und Karte, einschließlich Kartenlegende. Untertitel aus `enemy.title`; bei bisherigen Lagerbossen ohne Titel liest die UI die Definition über `family`. Die Stufen-/Elitezeile bleibt auch auf schmalen Touch-Geräten sichtbar.
- **3:** `BossSpeech` in `enemy-ui.js` beobachtet neue Bosszitate im Kampflog, zeigt sie für drei Simulationssekunden und verbraucht keine Nachrichten. Todeszeilen bleiben am Körper sichtbar. Reset, Rückzug, entfernte Gegner und erneute Zitate werden berücksichtigt. Pixelige Sprechblasen umbrechen Text und weichen HUD, Menüs und Spielerfigur aus.
- **Kompatibilität / spätere Engine-Übergabe:** Kapitel-1-Lagergegner haben aktuell `family: 'horst'`, aber keine `bossId`; deshalb entstehen dort noch keine Boss-Logzeilen. Die UI beobachtet für diese Instanzen ausschließlich lesend die Zauberzyklen, Lebenspunkte und den Tod und nutzt die vorhandenen `BOSS_LINES`/`BOSSES.phases`. Echte Logzitate haben Vorrang. Ein künftiges `bark`-Event mit Gegner-ID und Text kann diese Kompatibilitätsschicht ersetzen. Engine und content-Dateien wurden nicht verändert.
- **Prüfung:** 153 Tests, einschließlich `tests/handoff-ui.test.mjs`. `node scripts/handoff-ui-check.mjs [URL] [Ausgabeordner]` prüft echte Quest-Popups und Bewegung mit offenem Questlog; ein isolierter Browseraufbau mit echter Game-/Renderer-Implementierung prüft Elite, Karten und Bossphasen. Desktop 2024×900, Touch 390×844 und 844×390; Screenshots unter `combat-review/handoff/`. Die Prüfung sichert und restauriert die lokalen Spielstände.
- Gemeinsame Datei `package.json`: ausschließlich Patchversion 0.15.1; der Build aktualisiert die Offline-Cacheliste um die neuen UI-Module.
