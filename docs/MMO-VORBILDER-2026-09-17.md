# MMO-Vorbilder für das Basisspiel · 2026-09-17

Auftrag: Inspiration aus anderen MMORPGs, vor allem World of Warcraft, für Oberfläche und Talentbäume sammeln und in
zehn Iterationen ins Basisspiel bringen. Dieses Dokument hält fest, **was** an den Vorbildern taugt, **warum** es für
Mertloch passt oder nicht, und welche Iteration es umsetzt. Umsetzungsstand am Ende (§4).

## 1 · Was die Vorbilder richtig machen

### Talentbäume (WoW Classic → Cataclysm → Dragonflight)

| Vorbild | Erkenntnis | Für Mertloch |
|---|---|---|
| Classic: drei Bäume, 51 Punkte, 31-Punkte-Capstone | Fünf-Punkte-Füller („+1 % Krit“) sind Ballast, teure Resets erzeugen Einheitsbuilds | Bestätigt E-12: Talente sind Regeln, nie Prozente; kostenloser Reset bleibt |
| Cataclysm: 41 Punkte, Pflicht 31 im Hauptbaum | Zu enge Tore erzeugen **mehr** Einheitsbuilds, nicht weniger | Unsere Schwellen (3/5/8 Punkte) bleiben locker: jede Reihe hat mehrere Eingänge |
| Dragonflight: Klassenbaum links, Spezialisierungsbaum rechts, Tore bei 8 und 20 Punkten | Zwei Bäume nebeneinander, Knotenform trägt Bedeutung: **Kreis = aktive Fähigkeit, Quadrat = passiv, Achteck = Wahlknoten**; Kanten leuchten gold, wenn beide Enden gelernt sind; Punktzähler oben; Loadouts + Import-String; Suche | Formen übernehmen wir (Quadrat passiv, Kreis aktiv, Achteck Capstone), goldene Kanten haben wir; Loadouts/Import erst, wenn es mehr als 10 Punkte gibt |
| Dragonflight: „Du hast unverteilte Talentpunkte“ leuchtet am Mikro-Menü | Der Spieler vergisst Punkte sonst über Stunden | Iteration 8: Punktzahl-Abzeichen am Figur-Knopf der Menüleiste |

### HUD (WoW, Edit-Modus seit Dragonflight)

| Element | Vorbild | Für Mertloch |
|---|---|---|
| Spielerfenster oben links, **Zielfenster rechts daneben** | Blick springt horizontal zwischen „ich“ und „Gegner“, Zauberbalken dazwischen | Iteration 6: Zielfenster neben das Spielerfenster, nicht darunter |
| Aktionsleiste unten Mitte, Tastenkürzel oben links im Knopf, Abklingzeit als Uhr, Proc-Leuchtrahmen („Spell Alert“) | Alles vorhanden (`gcd-shade`, `.skill.ready`) | Behalten; Leiste bekommt mehr Luft nach unten |
| Stärkungen als Icons mit Restzeit unter dem Spielerfenster | Text-Chips lesen sich langsamer als Icons | Iteration 7: Chip mit Restzeit-Balken |
| Zielverfolgung rechts, aufklappbar; Minimap oben rechts | Vorhanden | Behalten |
| Charakterbogen: Papierpuppe in der Mitte, **Plätze links/rechts/unten**, Werte rechts daneben | Der Blick ordnet Platz und Körperteil zu; ein 4×4-Raster tut das nicht | Iteration 2: WoW-Anordnung der 16 Plätze |
| Zauberbuch: Icon + Name + Stufe + Kurzzeile je Fähigkeit, Reiter je Kategorie | Icon-Raster ohne Namen zwingt zum Hover | Iteration 5: Namen und Stufe unter jedem Kniff |
| Tooltip-Kopf: Kosten links / Reichweite rechts, Zauberzeit links / Abklingzeit rechts, danach Text | Zwei Zeilen, immer gleich, in Sekunden gelesen | Iteration 4: Kniff-Tooltip in diesem Format |
| Gegenstands-Tooltip: Name in Gütefarbe, Stufe, Platz + Art, Werte grün, Flavor kursiv, Vergleich mit Shift | Vorhanden (`itemTooltip`) | Behalten |
| Fenstergröße: Talent- und Charakterfenster füllen ein Drittel bis die Hälfte des Bildschirms | Unser Clanbuch ist auf 2024 px genau 520 px breit; Talentbaum, Schwellen-Texte und Knöpfe kollidieren | Iteration 1: Buchbreite wächst mit dem Bildschirm |

### Was wir bewusst **nicht** übernehmen

- Kein Addon-Baukasten und kein Edit-Modus: E-13 sagt ein Fenster, keine freie Anordnung.
- Keine Loadouts/Import-Strings: mit 10 Punkten je Figur genügt der Reset.
- Kein zweiter Klassenbaum: drei Spezialisierungen je Figur mit je einem Graphen bleiben (E-02).
- Keine Prozent-Talente, auch wenn WoW sie hat (E-12).

## 2 · Quellen

- Warcraft Wiki, Dragonflight Talent System: https://warcraft.wiki.gg/wiki/Dragonflight_Talent_System
- Icy Veins, Dragonflight Talent System Guide: https://www.icy-veins.com/wow/dragonflight-talent-system-guide
- Icy Veins, Dragonflight HUD/UI Guide: https://www.icy-veins.com/wow/dragonflight-hud-ui-guide
- Blizzard Watch, Evolution der Talentbäume: https://blizzardwatch.com/2022/10/31/wow-cataclysm-talent-trees/
- MMO-Champion, Talent System Design Philosophy: https://www.mmo-champion.com/content/10617-World-of-Warcraft-Dragonflight-Talent-System-Design-Philosophy
- Warcraft Wiki, Paper doll / Character info: https://warcraft.wiki.gg/wiki/Paper_doll
- Offener Talentrechner (Dragonflight): https://github.com/ginpachi987/wow-df-talent-calculator

## 3 · Die zehn Iterationen

| Nr | Thema | Dateien | Beleg |
|---|---|---|---|
| 1 | Clanbuch wächst mit dem Bildschirm (Breite je Reiter, Höhe bis über die Leiste) | `popup-windows.js`, `popup-ui.css` | `visual-review/iter-2026-09-17/10-*.png` |
| 2 | Charakterbogen in WoW-Anordnung: Puppe Mitte, Plätze links/rechts/unten, Werte daneben | `rpg-ui.js`, `popup-ui.css` | `11-*.png` |
| 3 | Talentbaum: Formen tragen Bedeutung, Schwellen als Bänder außerhalb der Knoten, Zähler nur wo er zählt | `talent-ui.js`, `talent-ui.css` | `12-*.png` |
| 4 | Kniff-Tooltip im Zwei-Zeilen-Kopf (Kosten/Reichweite, Zauberzeit/Abklingzeit) | `combat-ui.js`, `popup-ui.css` | `13-*.png` |
| 5 | Kniffe-Reiter mit Namen, Stufe und Taste unter jedem Icon | `combat-ui.js`, `progression-ui.css` | `14-*.png` |
| 6 | Zielfenster neben dem Spielerfenster | `rpg.css` | `15-*.png` |
| 7 | Stärkungs-Chips mit Icon und Restzeit-Balken | `app.js`, `polish.css` | `16-*.png` |
| 8 | Abzeichen „unverteilte Punkte“ an Menüleiste und Figur-Reiter | `app.js`, `rpg-shell.js`, `rpg.css` | `17-*.png` |
| 9 | Handy 390×844: alles oben noch einmal geprüft und nachgezogen | `mobile.css`, `popup-ui.css` | `18-*.png` |
| 10 | Playtest-Persona und Abnahme | `docs/PLAYTEST-2026-09-17-mmo-*.md` | Bericht |

## 4 · Umsetzungsstand

Branch `ui-mmo-2026-09-17`, Stand 2024×900 und 390×844 geprüft, `npm test` 299/299 grün.

| Nr | Ergebnis | Beleg |
|---|---|---|
| 1 | Buchfenster: Figur/Talente 820 px, Kniffe 760 px, Rucksack 600 px, Aufträge/Bude/Hilfe 620–640 px, Karte 760 px; am Desktop nie unter 520 px, nie über 44 % der Bildschirmbreite; Höhe bis 165 px über dem unteren Rand, damit die Leiste frei bleibt. Unter 700 px Breite wie bisher. | `11-figur.png`, `12-talente.png` |
| 2 | Charakterbogen: Puppe in der Mitte, Kopf–Armschienen links, Handschuhe–Glücksbringer rechts, Waffenreihe unten; Werte-Abschnitt rechts daneben (Container-Query ab 640 px Buchbreite). Auf schmalen Fenstern bleibt das 4×4-Raster. Alle Puppen-Canvases werden gezeichnet (vorher nur der erste). | `11-figur.png`, `18-mobil-figur.png` |
| 3 | Talentbaum: Quadrat = passiv, Kreis = aktive Fähigkeit, Abschluss größer mit Doppelrahmen; Schwellen 3/5/8 als Bänder mit Zähler im linken Rand (66 px Gasse), keine Überlappung mehr; „1/1“ nur am gelernten Knoten; lernbare Knoten pulsieren; „N Punkte frei“ leuchtet, solange Punkte offen sind; Tooltip ohne doppeltes „Einstieg“. | `12-talente.png`, `12b-talente-gelernt.png`, `18-mobil-talente.png` |
| 4 | Kniff-Tooltip: Zeile 1 Kosten (oder „Kostenlos“) / Reichweite in Metern, Zeile 2 „Sofort“ oder Zauberzeit / Abklingzeit, dann Text, Formel, GCD. Alte Doppelnennung der Zauberzeit entfernt. | `14-kniffe-tooltip.png` |
| 5 | Kniffe-Reiter: Name und Herkunft („Stufe 3“, „Talent“) unter jedem Icon, Taste oben rechts; 4 Spalten am Desktop, 3 unter 700 px. | `14-kniffe-tooltip.png`, `18-mobil-kniffe.png` |
| 6 | Zielfenster rechts neben dem Spielerfenster (274 px, 65 px), Stärkungen unter dem Spielerfenster; nur Desktop ohne Touch-Modus. | `15-hud-ziel.png` |
| 7 | Stärkungs-Chip mit goldenem Restzeit-Balken (Dauer aus `game.buffs.duration`). | `16-hud-buff.png` |
| 8 | Abzeichen mit Zahl der unverteilten Talentpunkte am Figur-Knopf der Menüleiste und am Figur-Reiter; verschwindet bei 0. | `17-talente-punkte.png` |
| 9 | Handy 390×844: 4×4-Raster, Baum mit Randbändern, Kniffe 3 Spalten; nichts überlappt. | `18-mobil-*.png` |
| 10 | Playtest-Persona auf dem Branch, Bericht `docs/PLAYTEST-2026-09-17-mmo-kenner.md`. | siehe Bericht |

**Offen für andere Rollen:** Klassendesign könnte die Schwellen-Beschriftung (`TALENT_UI.spent`) kürzen („Punkte“) und die x-Positionen im `TALENT_GRAPH` auf 12–88 % spreizen, dann trägt der Baum noch mehr Luft. Grafik: Formen der Talent-Icons könnten die Knotenform aufnehmen (rund für Aktive).
