# Playtest 2026-09-24 · Runde 1 · Kenner (Build #401, 2024×900)

Persona `kenner-agent`, live auf https://mertloch.esm-consultant.de, neuer Held „Kenner“ (Tresenbrecher, ohne Konto), Hofprobe bis 8/8, danach alle Fenster, Karte, Minikarte, Tooltips. 50 Aktionen. Screenshots: `D:\Dev\MertlochChronicles\visual-review\optimierung-2026-09-24\r1-spieler-01…11.png` (nicht im Repo).

## Die 10 Dinge, die am meisten nerven

| Nr | Wo | Was passiert | Erwartet | Schwere |
|---|---|---|---|---|
| 1 | J / L / Menüleiste | Auftragsbuch öffnet nicht, keine Meldung; J steht in der Hilfe, kein Knopf in der Leiste | L/J öffnet immer (WoW) oder Hinweis „erst nach der Hofprobe“ | bricht ab |
| 2 | Rucksack/Kniffe rechts oben | liegen genau über der Auftragsverfolgung, nur „…DEN ECHTEN“ bleibt sichtbar | Taschen unten rechts, Verfolgung frei | stockt |
| 3 | Minikarte → Zahnrad | Optionsmenü öffnet unter Rucksack/Kniffe (x 1622–1836 / y 29–267), unsichtbar | Kontextmenü immer obenauf | stockt |
| 4 | Menüleiste unten rechts | nur C, M, P, I, H – Talente (N) und Aufträge (J) fehlen | WoW-Mikromenü mit allen Fenstern | stockt |
| 5 | Ida: „Spielweise aussuchen“ | öffnet nur Figur mit „noch kein Hauptbaum“, keine Auswahl; Talente „ab Stufe 5“ | echte Auswahl oder „wählst du mit Stufe 5“ | wundert sich |
| 6 | Rechtsklick hinter Wand (Bude → Hof) | Figur bleibt stumm stehen | Weg suchen oder „Kein Weg dorthin“ | stockt |
| 7 | Fensterverwaltung | Kniffe rutschen nach, wenn Rucksack schließt; Hilfe und Talente überdecken Kniffe/Rucksack; Talente mit Scrollbalken; drei Fenster + Hilfe = Welt weg | feste Plätze je Fenster | wundert sich |
| 8 | Weltkarte (M) | kein Hover-Tooltip auf Lager-Markern; Liste nummeriert doppelt (1–3 Treffpunkte, 1–10 Lager); „Bärbels Braugarten“ liegt auf dem Standortpfeil; auf Stufe 1 schon 11 Lager mit langen Namen; Legende als Textzeile, „Lebewesen“ = leeres weißes Kästchen | Tooltip mit Name/Stufe, Unbekanntes ausgeblendet | stockt |
| 9 | Nahkampf | Gegner-Namensschild, Lebensbalken und „F: Beute“ liegen auf der eigenen Figur; Figur hinter Dach wird geisterhaft | Schild über dem Gegner | wundert sich |
| 10 | Text vs. Verhalten | Hofprobe 6 „Öffne die Beute und packe die einzelnen Icons ein“, F plündert aber sofort alles; nach „Ausrüstung nehmen“ zeigt das Ereignisfenster „Noch nichts passiert.“; dauerhafter Textchip „Autoangriff aus.“; Rucksack öffnen klappt ungefragt eine leere zweite Leiste auf; Auftragsverfolgung in Schritt 4 mit sieben Zeilen Fließtext; Hilfe als Textwand mit Scrollen; Werte nur Symbol+Zahl, Namen erst beim Hover | – | wundert sich |

Ebenfalls: Anmeldung liegt über dem laufenden Spiel; nach „Held erstellen“ Neuladen + Einführungsfilm; „F: Mit Kisten-Ida sprechen“ mittig unten weit weg von Ida; 1 Konsolenfehler beim Laden, 4 Warnungen nach dem Schließen der Karte.

## Drei Dinge, die richtig gut sind
1. Tooltips auf WoW-Niveau (Kniff: Kosten, Reichweite, Wirkzeit, Abklingzeit, Stufe in Rot, Fachbegriffe, Shift: Details; Gegenstand: Güte, Art, Wirkung, Stufe).
2. Tasten und Fensterlogik sofort vertraut (C, I, P, N, M, H öffnen/schließen, Esc schließt das oberste, Talentbaum mit Rängen liest sich sofort).
3. Kampf fühlt sich wie ein MMO an (Tab-Ziel, Zielfenster mit Status und Entfernung, Abklingzahl auf der Taste, Bodenkreis mit „JETZT AUSWEICHEN!“, Beute-Einblendung, Richtungspfeil mit Meterangabe, Minikarte zoomt).

## Optik insgesamt
Pixelwelt schön und stimmig (Licht, Fachwerk, Lichterketten, Regen, Innenräume). Oberfläche einheitlich grün-gold, wirkt hochwertig. Brüche: mit zwei, drei Fenstern ist die Welt weg; beige Pergament-Detailbox im Talentfenster fällt aus dem Stil; Tastenhinweise in Versalien sehr klein und kontrastarm.

## Bewertung (1–5)
Wusste, was zu tun ist: 4 · Wusste, was passiert ist: 3 · Wollte weiterspielen: 4 · Fluss: nicht messbar (nur Übungspuppe).

## Ein Satz an die Entwickler
„Tooltips und Welt sind schon auf MMO-Niveau: Gebt jetzt jedem Fenster einen festen Platz, lasst die Auftragsverfolgung und Menüs wie die Kartenoptionen nie unter Fenstern verschwinden, und macht J (besser noch L) plus N in der Menüleiste sichtbar und funktionsfähig.“
