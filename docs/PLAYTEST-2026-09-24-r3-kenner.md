# Playtest 2026-09-24 · Runde 3 · Kenner (Build #457, 2024×900)

Persona `kenner-agent`, live, neuer Held „Kenner Karl“ (Tresenbrecher). 50 Aktionen. Ziel NICHT erreicht: Stufe 1 (40/140 EP), kein Kill, ein Tod im ersten Kampf draußen, nur Idas Auftrag angenommen. Screenshots `visual-review/optimierung-2026-09-24/r3-spieler-01…06.png` (nicht im Repo; ggf. unter `D:\Dev\MertlochChronicles-opt-r2a\visual-review\…`). Minikarte und Talente nicht geprüft (Budget).

## Die 10 wichtigsten Punkte

| Nr | Wo | Was passiert | Erwartet (WoW) | Schwere |
|---|---|---|---|---|
| 1 | Karte (M) → „Weg einschlagen“ | Figur läuft los, während die Karte den Bildschirm deckt, mitten durch ein Pfandkeiler-Rudel; nach Esc 406/600 Leben in 4–5 Gegnern; Autopilot lief weiter | Karte beim Laufen klein/durchsichtig, Autolauf stoppt beim ersten Treffer, mindestens roter Bildrand | bricht ab |
| 2 | Offenes Feld, Zielwahl | Rechtsklick auf Grillplatz-Plünderer (Keiler) wählt den Festzelt-Schnorrer in 13 m („Zu weit entfernt · 13 m“), Keiler kaut von 230 auf 0; vorher wählte Tab einen neutralen Leergut-Raben, obwohl Keiler angriffen | Tab bevorzugt angreifende Feinde vorne; Rechtsklick greift genau diesen Gegner an | bricht ab |
| 3 | Erster Kampf, Taste 0 | Tod in ~20 s; Notfallbrezel bei 6/600 Leben ohne Wirkung und ohne Meldung (3 übrig) | Heilstein im Kampf nutzbar, sonst rote Fehlerzeile | bricht ab |
| 4 | Bude, Clan-Treff | F nimmt „Treppe hoch“/„Bude ansehen“/„Schwarzes Brett“ statt NPC; Brett öffnet nichts Sichtbares; Rechtsklick auf NPC läuft nur hin (bei Ida vorbei), redet nicht | Rechtsklick auf NPC = hinlaufen und reden; gewähltes Ziel hat beim Interagieren Vorrang | stockt |
| 5 | C+J+P+I, H, Spielmenü, Karte | Fenster decken die Bildmitte, Figur unsichtbar; Karte Vollbild; Hilfe und Spielmenü über der Figur; Esc schließt alles auf einmal | Mitte bleibt frei | stockt |
| 6 | Quest-Tracker | „Pfandkeiler von den Trümmern jagen 0/3“ – angreifende „Pfandkeiler“ (St. 2) zählten offenbar nicht, andere hießen „Grillplatz-Plünderer“; Pfeil springt 79/50/25/41 m; „Dieses Ziel zieht gerade ab oder kommt erst an.“ unklar | Quest-Gegner im Namensschild markiert, Zielgebiet auf der Minikarte | stockt |
| 7 | Ida, Clan-Treff | Ida zeigt bei Abgabe „!“ statt „?“; mehrere „!“ keinem NPC zuzuordnen; Namen „Hedwig Hopfenkranz“/„Fahrstall am Clan-Treff“ übereinander; NPCs stehen auf der Figur | eindeutige Marker | wundert sich |
| 8 | Hilfe (H), Figur (C) | nur Piktogramme; nicht deutbar: X→Stiefel, Umschalt→Lupe, Doppelklick→Haken, Maus→Sonne, U, R, B; Werte nur Symbol+Zahl | kurzes Wort oder Tooltip | wundert sich |
| 9 | Hofprobe 5/8 | roter Kreis kommt und geht vor der Reaktion („Zu spät!“), Schritt still übersprungen; Ausweichen nie gelernt, später daran gestorben | Wirkzeit-Anzeige oder zweiter Versuch | wundert sich |
| 10 | Allgemein | Regenschleier wäscht Bild aus; Chat fast unsichtbar; „Erinnerung“-Fenster springt nach „Bereit“ dazwischen; nach Tod „diesmal wenigstens mit Hose“, obwohl Hose erst Belohnung ist; beim neuen Helden fehlt die Ressourcenleiste (Randale) im Figurenfenster | – | Idee |

## Gut
1. Heldenerstellung und Einstieg schnell (drei Schritte, Intro per Esc, Hofprobe in ~15 Aktionen).
2. Hofprobe-Anzeige rechts vorbildlich (ein Schritt, eine Tastenzeile, Zähler live); Rechtsklick auf Gegner läuft hin.
3. Karte informativ (Liste mit Entfernungen, „Dein nächster Halt“); Todesdialog erklärt, was schiefging.

## Optik
Pixelgrafik dicht, warm, einheitlich, UI-Rahmen passen. Regenschleier und viele Fenster in der Bildmitte nehmen ihr die Wirkung genau dort, wo gekämpft wird.

## Messung
- Kein Kill in 50 Aktionen; ~9 verschwendet. Wiederbelebung am Clan-Treff: 1 Klick, 187 m zurück zum Ziel (Stillstand durch Laufweg).
- Rotation: 1 → 2 → 2 …; Ressource nicht sichtbar; „!“ auf Taste 2 unerklärt; Autoangriff auf Distanz meldet „Zu weit entfernt“, statt hinzulaufen.
- Begriffe unklar: Kniffe, Randale, Konterwasser, Notfallbrezel, Pfandmarken, Erinnerungsfetzen.
- Bewertung: Was tun 4 · Was passiert 2 · Weiterspielen 3 · Fluss 1.

## Ein Satz an die Entwickler
„Macht Rechtsklick zu ‚genau dieses Ziel angreifen oder ansprechen‘ und stoppt den Karten-Autopiloten beim ersten Treffer, dann trägt die gute Führung der Hofprobe auch durch den ersten echten Kampf.“
