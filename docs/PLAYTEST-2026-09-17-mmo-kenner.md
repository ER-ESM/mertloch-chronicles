# Playtest · Kenner · 2026-09-17 · Branch `ui-mmo-2026-09-17` (MMO-Vorbilder, Iteration 10)

Aufbau durch den Orchestrator (Persona wusste davon nichts): Server `PORT=4181` auf dem Worktree, Desktop 2024×900, Spielstand Stufe 6 mit vier unverteilten Talentpunkten am Clan-Treff, Arena vorher geräumt. Auftrag: Talente finden und verteilen, Charakterbogen und Kniffe-Buch lesen (drei Tooltips), danach ein Tier in der Nähe angreifen. Budget 45 Aktionen. Screenshots `visual-review/playtest-2026-09-17-mmo/kenner-01…08.png`.

## Bericht der Persona (unverändert)

### 1. Ergebnis
Ziel erreicht: TEILWEISE — Talente gefunden und alle 4 Punkte verteilt, Charakterbogen und Kniffe-Buch samt 5 Tooltips gelesen; der Angriff auf ein Tier ist gescheitert, weil in Reichweite des Startpunkts kein Gegner existiert („Kein passendes Ziel in direkter Nähe.", kenner-07/08). Aktionen gesamt 45, davon verschwendet 5 (2 Klicks auf verfallene Refs nach Talentbaum-Neuaufbau, 3 Tasten 1/3/4 ins Leere ohne Ziel). Erreichte Stufe: 6 (unverändert, 0/840 EP).

### 2. Fluss-Messung
| Nr | Gegner | Nach dem Kill | Grund |
|---|---|---|---|
| — | keiner | — | Kein Kill möglich: Startzone „Clan-Treff" und „St. Gangolf" sind „Geschützter Rastplatz"; Tab liefert zweimal „Kein passendes Ziel in direkter Nähe." Ein Angriffsauftrag, der am Rastplatz beginnt, braucht mit 45 Aktionen Budget einen Gegner in Laufnähe oder einen Wegweiser. |

### 3. Rotation
Aus den Tooltips (nicht im Kampf verifiziert): **3 → 1 → 2 → 2 → 2 → 4** (Pfandschuld-Markierung, Autoangriff an, Kronkorken-Kelle bei jeder Bereitschaft für +1 Pegel, Bierzelt-Abriss bei 3 Pegel), dazu **5** reaktiv vor schweren Schlägen (Parade), **8** Absperrband als Bodenzone. Stand ab: sofort auf Stufe 6, weil die Clan-Schule-Texte die Reihenfolge wörtlich vorgeben („Drück sie als Erstes auf jeden neuen Gegner", „Zünde ihn bei 3 Pegel auf ein markiertes Ziel"). Gestört hat: Kronkorken-Kelle-Tooltip nennt in einem Text „300 % Autoschaden + 14" und darunter „200 % Autoschaden + 14 fester Schaden" — ich weiß nicht, welche Zahl gilt (kenner-06). „Ab durch die Hecke" liegt auf [LEER], ein Bewegungskniff ohne Taste. Kein Angriffsziel, daher Rotation ungeprüft.

### 4. Hänger
| Nr | Wo | Was passierte | Was erwartet | Schweregrad | Screenshot |
|---|---|---|---|---|---|
| 1 | Start | Clan-Schule-Overlay „Neu gelernt · Du schuldest mir Pfand!" liegt über dem Bild; nach „Verstanden" kommt sofort das nächste („Bierzelt-Abriss") und bleibt die ganze Sitzung stehen — auch über Figur-/Kniffe-Fenster | Ein Hinweis pro Ereignis, weg beim ersten Kampf oder nach Timeout | stockt | kenner-01, kenner-05 |
| 2 | Figur → Talente | Nach jedem Punkt wird der ganze Baum neu gebaut; Tooltip verschwindet, zwei Klicks verpufft | Punkt setzen ohne Neuaufbau, Tooltip bleibt | stockt (Werkzeug-Anteil, aber sichtbares Flackern) | kenner-03 |
| 3 | Talent-Tooltips | „1 verteilte Punkte." / „3 verteilte Punkte." am Ende jedes Tooltips — Kosten? Rang? Reihen-Voraussetzung? Ich habe erst durch die Reihenbeschriftung „3 / 5 / 8 verteilte Punkte" kombiniert, dass es die Freischaltschwelle ist | „Freigeschaltet ab 3 Punkten im Baum" | wundert sich | kenner-03, kenner-04 |
| 4 | Talent-Tooltips | Effekte hängen an „Parade" und „Pfandschuld"; nirgends steht, dass [5] Deckel drauf! die Parade ist und [3] die Pfandschuld | Kniff-Taste im Talent-Tooltip nennen („Parade = [5]") | wundert sich | kenner-03 |
| 5 | Kniffe-Buch | Kronkorken-Kelle: „300 % Autoschaden + 14" vs. „200 % Autoschaden + 14 fester Schaden" im selben Tooltip | eine Zahl | wundert sich | kenner-06 |
| 6 | Kniffe-Buch | „Ab durch die Hecke" auf [LEER], Symbol „↗" ohne Erklärung; Talent-Kniff „Absperrband" landete dagegen automatisch auf [8] | Auch Stufe-1-Kniff automatisch belegen oder Hinweis | wundert sich | kenner-05 |
| 7 | Kampf | Tab am Rastplatz zweimal „Kein passendes Ziel in direkter Nähe"; 1/3/4 laufen ins Leere, Leiste bleibt „Autoangriff aus." | Auftrag „greif ein Tier in der Nähe an" setzt ein Tier in der Nähe voraus; Wegweiser oder Ziel-Pfeil | bricht ab (für diesen Auftrag) | kenner-07, kenner-08 |
| 8 | Figur-Werte | „Glückstreffer 0 · 6 %", „Drehzahl 0 · 2 %", „Handschrift 0 · 0 %" — Rating und Prozent ohne Erklärung, „Handschrift" nicht zuordenbar | Tooltip je Wert | Idee | kenner-02 |

Unbekannte Begriffe als Profi: Randale (= Energie), Pegel / Eskalation (= Combo-Punkte, 3 Stufen ◇◇◇), Pfandschuld (= DoT-Markierung von [3]), Deckung (in Kelle-Tooltip „Jeder Treffer gibt Deckung" — ungeklärt), Handschrift, Drehzahl, Pfandmarken (Währung?). Gesehen, nicht benutzt: Reiter „Bude", „Talentbaum erklären und Punkte verwalten", „Clankiste" — keine Admin-/Debug-Funktionen entdeckt. In-Game-Hilfe (H) nicht gebraucht.

Klickpfad: Talente = 1 Aktion (C öffnet Figur, Talente sind direkt darin, Abzeichen „4" am C-Knopf zeigt offene Punkte — läuft). Kniffe = 1 Aktion (Reiter im selben Fenster — läuft). Ausrüstung = im selben C-Fenster, alle 16 Plätze beschriftet (Kopf … Fernkampf), ohne Raten lesbar — läuft.

### 5. Bewertung (1–5 mit Beleg)
- Wusste ich, was zu tun ist? **4** — Talentpunkte über Abzeichen und „4 Punkte frei" sofort auffindbar, Reihen-Schwellen 3/5/8 sichtbar, Clan-Schule sagt wörtlich die Rotation; Abzug für Talent-Tooltip-Verweise ohne Tastenbezug (Hänger 3, 4).
- Wusste ich, was passiert ist? **4** — Jeder Punkt: Zähler runter, „Gelernt 1/1", nächste Reihe wechselt von „Noch gesperrt" auf „Lernbar", Absperrband erscheint sofort auf [8]; Belohnung Talentpunkt: ja. Abzug für widersprüchliche Schadenszahlen (Hänger 5).
- Wollte ich weiterspielen? **3** — Rotation ist auf dem Papier klar und interessant (Markieren, Aufbauen, Entladen, Parade-Reaktion), aber ich habe keinen einzigen Schlag gesehen; das Overlay der Clan-Schule nervt dauerhaft.
- Kam ich ohne Pausen von Gegner zu Gegner? **1** — Kein Gegner erreichbar, Auftrag am Rastplatz nicht erfüllbar (Hänger 7). Belohnung Kill/Beute/Stufe: nicht messbar.

### 6. Ein Satz an die Entwickler
Der Charakterbogen und der Talentbaum sind für einen Genre-Profi in einer Aktion lesbar und die Punkte-Rückmeldung stimmt — aber ein Angriffsauftrag, der auf einem gegnerfreien Rastplatz startet, ein Clan-Schule-Hinweis, der nie verschwindet, und ein Tooltip mit zwei verschiedenen Schadenszahlen kosten das Vertrauen, das die Menüs gerade aufgebaut haben.

**Freigabe: nein**, weil der Kampfteil des Auftrags vom Startpunkt aus mit 45 Aktionen nicht erreichbar ist (kein Ziel in Tab-Reichweite, kein Wegweiser) und der Kronkorken-Kelle-Tooltip sich selbst widerspricht — Menüs, Talente und Rückmeldung wären für sich allein freigabefähig.

## Einordnung durch die Produktion (Orchestrator)

| Hänger | Herkunft | Verantwortlich | Ablage |
|---|---|---|---|
| 7 „bricht ab" | Testaufbau: der Orchestrator hatte die Arena geräumt und die Persona am gegnerfreien Rastplatz starten lassen; kein Regressionsbefund dieses Branches | Produktion | Beim nächsten Lauf Gegner in Laufnähe stellen oder im Umland starten |
| 5 (300 % vs. 200 %) | `content/skills.js` Kellentext sagt „300 % Autoschaden", `content/combat.js` SKILL_DAMAGE.strike `weapon:2`; Stand ist so auf `main` (Welle D), nicht durch die UI-Runde entstanden | Klassendesign + Balancing | `docs/backlog/klassen.md` |
| 3, 4 (Tooltip-Wortlaut, Tastenbezug) | `TALENT_UI.parents/spent` in `content/talent-layout.js`; Kniff-Taste im Talent-Tooltip wäre UI (Verweis Talent → Kniff fehlt in den Daten) | Klassendesign (Wortlaut), UI (Taste, sobald Talent-Daten den Kniff nennen) | `docs/backlog/klassen.md`, `docs/backlog/ui.md` |
| 1 (Clan-Schule bleibt stehen), 2 (Baum-Neuaufbau), 6 (Ausweichen auf LEER), 8 (Werte-Tooltips) | Bestand vor dieser Runde | UI | `docs/backlog/ui.md` |

Ergebnis: Menüs, Charakterbogen, Talentbaum und Tooltips (Gegenstand dieser Runde) sind laut Persona „läuft" mit 4/4/3. Der einzige „bricht ab" liegt am Testaufbau. Merge-Entscheidung liegt bei der Produktion (E. Ruf); bis dahin bleibt der Branch gepusht, aber nicht auf `main`.
