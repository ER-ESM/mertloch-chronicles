# Inhaltsschicht `content/`

Alles, was das Spiel *erzählt* und *bemisst*, liegt hier als reine Daten: Gegenstände, Beute, Gegner, Bosse, Fähigkeiten, Klassen, Talente, Quests, NPCs, Dialoge, Story, Balancing-Konstanten. Die Laufzeitmodule im Wurzelordner (`engine.js`, `rpg.js`, `clan.js`, `encounters.js`, `itemization.js`, `talents.js`, `progression.js`) enthalten nur noch Logik und lesen die Daten von `content/index.js`.

Ein Inhalts-Agent kann hier im Hintergrund arbeiten, ohne UI, Renderer oder Engine anzufassen. Die Bild-KI bekommt aus denselben Daten ihr Briefing.

## Dateien

| Datei | Inhalt | Wird gelesen von |
|---|---|---|
| `balance.js` | Alle Stellschrauben: EP-Kurve, Lebenspunkte, Wertungskurven, Gegenstandsbudget, Gegner-Skalierung, Beute-Münzen | rpg.js, engine.js, itemization.js, progression.js |
| `items.js` | `ITEM_CATALOG` (jeder Gegenstand), `PROCS` (Effekte der Dorflegenden), `ICONS`, `SLOTS`, `RARITIES` | rpg.js, itemization.js |
| `drops.js` | `DROP_TABLES` je Gegnerfamilie, `FOOD_DROPS` | itemization.js |
| `affixes.js` | Zusätze gewürfelter Beute (E-40): `LOOT_PREFIXES`, `LOOT_EPITHETS`, `SLOT_GROUPS`, Namensbau `affixedName()`, Tooltip-Zeilen `affixLines()`/`affixNumbers()` | itemization.js, describe.js |
| `enemies.js` | `ARCHETYPES` (Feld), `ELITES`, `CAMP_ENEMIES` (Lager), `BOSSES`, `CAST_SETS` (Angriffsmuster), `SPAWN_TABLES` | encounters.js, engine.js |
| `skills.js` | `BASE_SKILLS`, `KITS` je Klasse, `BUFF_SKILLS`, `THROW_SKILL`, `GROUND_SKILL`, `TALENT_SKILLS`, `LESSONS`/`CLASS_LESSONS` | clan.js, progression.js |
| `classes.js` | `CLAN_MEMBERS` (Figuren, Bio, Passiv, Bildhinweis) | clan.js |
| `talents.js` | `CLASS_SPECS`, `SPECS`, `TALENT_ROWS`, `KNOWN_EFFECTS` | talents.js |
| `npcs.js` | `NPCS`, `FACTIONS`, `VILLAGERS` | clan.js (dressStory) |
| `quests.js` | `SIDE_QUESTS` (Vorlagen), `pickTemplates()` | clan.js (dressStory) |
| `dialogues.js` | `MAIN_DIALOGUE` (Ida), `BOSS_LINES`, `ENEMY_BARKS`, `SYSTEM_LINES` | engine.js |
| `story.js` | `STORY`, `LORE`, `ACTS`, `STORY_CHAPTERS` (Akt 1 „Filmriss“ = Kapitel 1–4; docs/AKT-1-FILMRISS.md) | clan.js, dialogues.js |
| `memories.js` | `MEMORY_FRAGMENTS` (Erinnerungsfetzen des Helden), `MEMORY_TRIGGERS`, `triggeredMemories()` | Engine (offen) |
| `buildings.js` | `BUILDINGS` (Basisbau der Bude), `BUILDING_EFFECTS`, `nextStage()`, `buildingEffects()` | Engine (offen) |
| `schema.js` | `validateContent()` – Schema- und Invariantenprüfung | tests/content.test.mjs |
| `BALANCE-REPORT.md` | erzeugt von `scripts/balance-report.mjs` | Mensch, Agent |
| `ART-BRIEF.md` | erzeugt von `scripts/art-brief.mjs` | Bild-KI |

## Zusätze gewürfelter Beute (E-40)

Ein Fundstück heißt `[Vorsilbe] Grundteil Spec-Nachsatz [Beiname]`, z. B. „Klebriger Pfandprügel des Tresens ohne TÜV“. Ungewöhnlich trägt 0–1 Zusatz, selten 1, episch beide.

- **Neuer Zusatz:** Zeile in `LOOT_PREFIXES` oder `LOOT_EPITHETS` (`content/affixes.js`). Vorsilbe entweder als Adjektivstamm ohne Endung (`'Klebrig'` → Klebriger/Klebrige/Klebriges) oder als Bestimmungswort mit Bindestrich (`'Kirmes-'`). Beinamen beginnen klein (`'ohne TÜV'`). Höchstens 30 Zeichen.
- **Werte sind Anteile, keine Zahlen:** `{might:.6,finesse:.4}` verteilt das Zusatzbudget (Summe 1, 1–2 Werte, nur Schlüssel aus `STAT_NAMES`). Wie groß das Zusatzbudget ist, steht in `AFFIX_TUNING` (`content/tuning.js`, mit `why`/`since`).
- **Neues Grundteil:** Genus mitgeben (`m`/`f`/`n`/`p`) – drittes Feld in `ROLLED_BASES` und `FAMILY_TROPHIES`, bzw. `WEAPON_BASE_GENUS`.
- **Check (`content/checks/loot.js`):** eindeutige IDs über beide Pools, mindestens drei passende Zusätze je Art für jeden Platz × Stufe 1–30 × Güte, bekannte Werte, Anteile 0,25–1, Deckel `maxGain`.
- **Spielstände:** Zusätze stehen nicht im Spielstand, sie werden aus den Rohdaten abgeleitet. Pool-Änderungen können Namen vorhandener Teile verschieben – das Grundbudget nie.

## Arbeitsablauf für den Inhalts-Agenten

1. **Nur `content/`, `tests/content.test.mjs` und die beiden Skripte ändern.** Keine Dateien im Wurzelordner, kein CSS, keine UI-Module, keine Assets. Braucht eine Idee neue Engine-Logik (neuer `effects`-Schlüssel, neuer `proc`, neue Fähigkeit mit eigenem Verhalten), wird sie in `content/BACKLOG.md` mit Begründung eingetragen, nicht selbst gebaut.
2. **IDs sind Speicherschlüssel.** Gegenstände, Talente (`<spec>-<index>`), Fähigkeiten, Spezialisierungen und Klassen dürfen nie umbenannt oder gelöscht werden; Spielstände im Browser verweisen darauf. Ausmustern: `retired:true` setzen und aus Beutetabellen nehmen.
3. **Prüfen, immer in dieser Reihenfolge:**
   ```
   npm run content:check      # Schema + Invarianten + alle Spieltests
   npm run content:balance    # TTK-Matrix, schreibt content/BALANCE-REPORT.md
   npm run content:art        # Grafik-Briefing für die Bild-KI
   ```
   Kein Commit, solange `content:check` rot ist. Der Balance-Bericht wird mit eingecheckt, damit die Veränderung sichtbar ist.
4. **Neue Fähigkeiten brauchen ein Icon.** Aktive Fähigkeiten haben eine feste Bildreihenfolge in `skill-art.js` (`SKILL_ICON_ORDER`) und einen Atlas in `assets/clan-skills-013/`. Bis das Bild da ist, bleibt die Fähigkeit im Backlog. Passive Talente brauchen kein neues Bild.
5. **Neue Gegner nutzen einen vorhandenen `skin`** (`boar`, `badger`, `goose`, `warden`, `horst`) plus `variant` und `look`. Das Spiel zeichnet den Skin, bis die Bild-KI ein Sprite liefert. Beutetabelle (`family`) und Angriffsmuster (`castSet`) sind Pflicht; die Namen der Zauber nennen immer die Antwort des Spielers (Parade / ausweichen / Q unterbricht / Fläche verlassen).
6. **Zahlen mit Begründung.** Wer `balance.js` oder Gegnerwerte ändert, schreibt die Absicht in den Commit („Wardens auf Stufe 1 zu hart für Kevin: −10 % Schaden“) und legt den neuen Balance-Bericht bei.
7. **Ton.** Deutsch, derb, dörflich, Poo-Tang-Humor; Sie-Form gibt es nicht. Namen sind Sprechnamen (Dosen-Dieter, Gisela Gießkanne). Keine echten Personen.

## Was die Engine heute kann und was nicht

- **Kann:** beliebig viele Archetypen, Elite (`elite:true`, `damage`-Faktor), Bosse mit Phasen-Sprüchen, eigene `CAST_SETS`, Beutefamilien, Verpflegung mit `heal`/`energy`, Uniques mit den Procs aus `PROCS`, Quest-Vorlagen je Typ mit eigenen Item-/Gegnernamen und Gesprächszeilen, gewichtete Spawn-Tabellen nach Entfernung.
- **Kann noch nicht:** Akt-1-Kapitel 2–4 (Daten fertig; brauchen Lager in `world-layout.js` und einen Kapitelumschalter in `engine.js`), Erinnerungsfetzen, Basisbau, Mentoren-NPCs an der Bude, Händler, Handwerk aus Material, neue *aktive* Fähigkeiten ohne Icon, Gegner-Sprüche im HUD (`ENEMY_BARKS` liegen bereit), Dorfbewohner-Sprechblasen mit Text (`VILLAGERS.says` liegt bereit), eigene Sprites je `variant`.

## Balancing-Korridor (Stand des ersten Berichts)

- Feldgegner der eigenen Stufe: 4–12 s, unter 40 % Lebensverlust ohne Ausweichen.
- Elite: doppelte Zeit, sichtbarer Lebensverlust; auf Stufe 3 nur mit Ausweichen.
- Bosse: ohne Ausweichen und Unterbrechen tödlich unterhalb ihrer Stufe, 10–25 s auf ihrer Stufe mit Ausrüstung.
- Kein Feldgegner darf zwei Stufen unter dem Spieler noch jeden Lauf töten (☠ im Bericht).

## Kategorien, Begriffe und Kniff-Texte (2026-09-20)

- `categories.js`: jedes Kampfelement hat eine **Art** (Kniff, Talent-Kniff, Verstärkung, Klassen-Passiv, Talent, Auslöser), eine oder mehrere **Funktionen** (Aufbau, Markierung, Eskalation, …), optional eine **Baum-Mechanik** und eine **Zugehörigkeit** (Klasse, Baum, veränderte Kniffe, Herkunftstalent). Nichts davon wird von Hand gepflegt: es folgt aus Leistenplatz, `info.terms`, `skills`, `grants` und `proc:`.
- `info.terms` müssen zu den Daten passen (`termAudit`): verändert ein Talent den Grundangriff, steht `grundangriff` dort – nicht `autoangriff`. Prüfen/korrigieren: `node scripts/term-audit.mjs [--fix]`.
- Kniff-Texte sind dreigeteilt: `text` = was der Kniff tut, `use` = wann man ihn drückt, `flavor` = Spruch. Der Tooltip zeigt `text`; `use` und `flavor` stehen in den Details (Shift).
