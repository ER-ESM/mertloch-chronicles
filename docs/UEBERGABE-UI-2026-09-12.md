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

## Ergänzung 0.15.2 · Letzter Standort und Figurenwechsel

- `Game.save().position={x,y,facing}` enthält eine Kopie der aktuellen Heldenposition. Laden stellt sie nur bei identischem `worldKey` wieder her. Alte Spielstände starten unverändert am Treffpunkt. Ungültige Koordinaten fallen auf den Treffpunkt zurück; inzwischen blockierte Stellen werden mit dem gleichen Kollisionsradius wie bei Bewegung in einen freien Platz aufgelöst.
- Bei Tod wird der reguläre Wiedereinstieg am Treffpunkt gespeichert. Bewegung, Zielwahl und laufende Aktionen werden beim Laden nicht wieder gestartet. Admin-Neustart beginnt weiterhin am Treffpunkt; eine wiederhergestellte Sicherung enthält jetzt auch den Standort.
- Browser speichert alle fünf Sekunden sowie bei `visibilitychange` in den Hintergrund, `pagehide` und `beforeunload`. Die Speicherung bleibt lokal im jeweiligen Browser.
- Spielmenü und Touch-Kontextmenü enthalten direkt **Figur wechseln**. Der bestehende Weg **Charakter → Figur wechseln** bleibt. Dosen-Dieter (Tank), Bass-Bärbel (Heilerin) und Klo-Kevin (Fernkampf) sind spielbar, mit je drei Spezialisierungen. Wechsel am Clan-Treff bei St. Gangolf, außerhalb des Kampfes; Fortschritt gehört dem Clan.
- Prüfung: 157 Tests und `npm run content:check` grün. `scripts/position-class-check.mjs [URL] [Ausgabeordner]` klickt beide Wege, prüft Klasse/Spezialisierungen, läuft und lädt den Spielstand erneut. Touch-Taps in 390×844 und 844×390. Hintergrund-/Pagehide-Handler werden mit simulierten Lifecycle-Events geprüft, da der CDP-Endpunkt zusätzliche Tabs nicht unterstützt. Screenshots unter `combat-review/position/`.
- Gemeinsame Datei `package.json`: nur Patchversion 0.15.2; Offline-Cache enthält `player-save.js`.
## Ergänzung 0.16.0 · Figurenbilder, Talentbäume und Hofprobe

- Personenporträts zeichnen über `person-art.js` dieselben Spritevarianten wie Welt und Helden-HUD. Die zentrale Zuordnung steht in `content/person-appearance.js`. Der frühere Porträtatlas bleibt als historisches Asset erhalten, wird in Gesprächen aber nicht mehr verwendet.
- Neun Talentbäume mit je zehn Talenten: Einstieg, drei Äste, zusammenführende Verbindungen, aktive Fähigkeit und Abschlusstalent. `content/talent-layout.js` definiert das gerichtete Netz samt Punktschwellen. Mindestens ein gelernter Vorgänger öffnet einen Knoten; das Upgrade der aktiven Fähigkeit verlangt immer deren Talent. Alle bisherigen Talent-IDs bleiben stabil. Beim Laden ungültig gewordene Belegungen werden entfernt und ihre Punkte frei.
- `unlearnTalent(game,id)` nimmt einzelne Punkte zurück, solange alle verbleibenden Talente gültig bleiben. Desktop: Rechtsklick. Touch: Talent antippen, Erklärung lesen, Lernen oder Zurücknehmen bestätigen. Änderungen im Kampf bleiben gesperrt.
- 90 eigene Motive, drei originale PNG-Atlanten in `assets/content-art/talents/`; vollständige Prompts in `assets/content-art/PROMPTS.md`. Die Bildimporte verwenden vermessene Zellgrenzen und transparente Motivgrenzen; die Originalbilder bleiben unverändert.
- WoW-Referenz: [Blizzards Beschreibung verzweigter Heldentalentbäume](https://news.blizzard.com/en-us/article/24038519/get-an-early-look-at-hero-talents-in-the-war-within). Übernommen wurden die Prinzipien Einstieg, Äste, Verbindungen und Abschlusstalent; unsere Klassennamen, Mechaniken und Grafiken bleiben eigenständig.
- `new Game(world,save,{guidedStart:true})` startet die Hofprobe bei einem frischen Spielstand. Alte Spielstände ohne Tutorialmarkierung gelten als abgeschlossen. `save().tutorial` enthält Version, Abschluss, Schritt, Trefferzähler und Beutestatus. Ein Neuladen setzt die Anleitung fort; bereits abgeholte Übungsbeute wird nicht erneut erzeugt.
- Acht Schritte: Ida/Figur wählen → Laufen → Ziel wählen → erster Kniff und Autoangriff → Ausweichen → einzelne Beute aufnehmen → Rucksack → Ida und erster Außenauftrag. Normalgegner und Entdeckungs-EP warten während der Hofprobe; Bewegung bleibt auf den sicheren Startbereich begrenzt. Die Übung ist ungefährlich und wiederholbar. Course und Puppe werden auf erreichbarer Pflasterfläche außerhalb von Baumkronen und NPC-Standflächen gewählt.
- `tutorialStep` aktualisiert die kompakte HUD-Anleitung. `tutorialConfirm`, `tutorialSignal`, `tutorialDestination` verbinden Gespräch, Eingaben und Wegweiser mit dem Engine-Zustand. Dialoge und Menüs bleiben nichtmodal. Ausprobieren: **Admin → Neustart** (setzt den lokalen Fortschritt zurück).
- Prüfungen: 163 automatisierte Tests, Inhaltsprüfung, Balancebericht und Grafikbriefing. `scripts/tutorial-talents-check.mjs [URL] [Ausgabeordner]` spielt alle acht Schritte am Desktop inklusive Neuladen, prüft neun Talentbäume und 90 verschiedene geladene Motive sowie echte Touch-Eingaben im Hoch- und Querformat. `scripts/portraits-check.mjs` prüft Gespräche, Nebenquests, Belohnungswahl und Bewegung mit offenem Dialog; auf Canvas-Porträts angepasst. Lokale Screenshots unter `combat-review/tutorial-talents/`.
- Gemeinsame Datei `package.json`: Versionsanhebung auf 0.16.0. Build erneuert den Offline-Cache für Module, CSS und Talentatlanten.
## Ergänzung 0.17.0 · Aperol-Anni ersetzt Bass-Bärbel

- Angezeigte Identität: **Aperol-Anni, Heilerin / Landhaus-Lady**, Ressource **Glanz**. Motive: Aperol, Thermomix, Landhaus-Hauspflege, Instagram, Make-up und satirischer Putzmittel-Pyramidenvertrieb.
- Drei bestehende Spielweisen neu eingekleidet: **Landhaus-Lazarett** (Heilung / Überheilungsschutz), **Putzpyramide** (Markierung / Schadensheilung), **Filter-Furie** (Fernkampfschaden / verstärkte Angriffe nach Pflege). Alle 30 Talente, 14 Skills einschließlich Autoangriff, Statusanzeigen, Beschreibungen und Lore angepasst. Stärke, Stufenfreischaltung, Kosten und Abklingzeiten bleiben erhalten.
- Klassen-ID `baerbel`, Spezialisierungs- und Talent-IDs bleiben aus Kompatibilitätsgründen erhalten. Alte Bärbel-Spielstände öffnen Anni mit unverändertem Fortschritt und Belegung. `megafon` heißt jetzt Annis Hygiene-Hochdruckspray, mit passendem Icon; Waffenbauart `speaker` wird als Sprühwerfer angezeigt.
- Neue Originalgrafiken: `assets/content-art/aperol-anni/hero.png` (Stand/Gang), `skills.png` (Skills, Spezialisierungen, Autoangriff), `talents.png` (30 eigene Motive). Herkunft und vollständige Prompts in `assets/content-art/PROMPTS.md`. `aperol-art.js` importiert die vermessenen Zellen und entfernt ausschließlich transparente Ränder beim Zeichnen. Keine Veränderung der Original-PNGs.
- `maifeld.baerbel/baerbelWalk` werden mit den neuen Sprites belegt; Welt, Gesprächsporträt, HUD, Figurenwahl und Charakterbild greifen auf dieselbe Figur zu. Keine Musik-Anlage oder Gegenstände am Boden beim Gehen.
- Prüfung: 163 Spieltests, Inhaltsprüfung, Balancebericht und Grafikbriefing. `scripts/aperol-check.mjs [URL] [Ausgabeordner]` lädt einen alten Spielstand, prüft Bewegung und die gemeinsamen Spritequellen, Menüs, 47 unterschiedliche Skill-/Spec-/Talenticons, die drei Talentfähigkeiten und echte Startangriffe. Touch im Hoch- und Querformat. Screenshots und Ergebnisprotokoll unter `combat-review/aperol-anni/`.
- Gemeinsame Datei `package.json`: 0.17.0. PWA-Cache enthält den neuen Grafikordner.
