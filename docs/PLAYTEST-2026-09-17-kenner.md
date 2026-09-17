# Playtest — Mertloch Chronicles 0.19.1 (Commit dabf31c)  (Stufe 5 · 2026-09-17)

**Persona:** ☐ Neuling ☑ Kenner ☐ Prüfer · **Agent/Mensch:** Kenner-Persona als `general-purpose`-Agent mit eingebetteter Definition (Werkzeugsperre per Anweisung, weil die neue Agenten-Definition mit `run_code`-Snippets erst beim nächsten Sitzungsstart geladen wird) · **Auftrag (Spielersprache):** „Bring die Hofprobe schnell hinter dich, dann raus ins Dorf: erreiche Stufe 3 oder besser 4, finde deine Rotation und sag mir, ob es flüssig ist." · **Budget:** 50 Aktionen · **Gerät:** ☑ Desktop 2024×900 ☐ Handy 390×844
**Start:** `http://localhost:4173/`. Vorgesehen war ein frischer Spielstand; vorgefunden wurde Hofprobe 4/8 (das Spiel schreibt den Spielstand beim Entladen zurück, siehe PIPELINE §Playtest). Screenshots `visual-review/playtest-2026-09-17/kenner-01.png` … `kenner-12.png`.

## Auswertung des Orchestrators

- Bewegung lief über die Pflicht-Snippets (gehaltene Taste, Klick an Position); die Fluss-Messung ist damit belastbar.
- **Hänger 5 („bricht ab")** ist ein Balancing-Befund, kein Bedienhänger: Stufe-1-Gegner nehmen 45 bis 50 Prozent Leben. Das ist ein Design-/Inhaltsthema (`content/balance.js`), das die Produktion entscheidet. Es sperrt den Release im Sinn der Pipeline nicht, weil der Spieler weiterkommt (Rast, Brezel), aber es widerspricht direkt Grundsatz 1 des Gameplay-Konzepts („Der Kill ist die Belohnung").
- Hänger 6 (Pegel voll ohne Verbraucher) und die konstante Randale-Anzeige sind auf Stufe 1 erwartbar (Finisher ab Stufe 3), aber die Anzeige erklärt das nicht. Deckt sich mit Prüfer Nr. 2.
- Der Kenner hat zum Ansehen seiner Screenshots das Read-Werkzeug auf die eigenen PNGs benutzt; sonst keine Datei. Zulässig.

## Bericht der Persona (unverändert)

### 1. Ergebnis
Ziel erreicht: **NEIN** — Hofprobe bestanden und Auftrag „Die letzte Kiste" angenommen, aber Stufe 1 mit 100/140 EP; Stufe 3 unerreichbar, weil Laufwege, Beute-Dialoge und Erholung nach jedem Kampf den Takt fressen. Aktionen gesamt: 49, davon verschwendet: ~9 (2 Ausweich-Fehlversuche wegen „Kreis kommt erst noch", 1 F-Druck traf Ida statt Kiste, 1 Rechtsklick auf HUD-Zone wirkungslos, ~5 Lauf-Halte-Aktionen für 24 m Weg). Erreichte Stufe: **1** (2 Kills à 30 EP, Hofprobe 40 EP). Hinweis: „frischer Spielstand" stand bereits bei Hofprobe 4/8 — vorgefundenen Stand weitergespielt.

### 2. Fluss-Messung
| Nr | Gegner | Nach dem Kill | Grund |
|---|---|---|---|
| — | Papp-Horst (Übung, kein Kill) | Stillstand | Warten auf roten Kreis, zweimal Leertaste vor dem Kreis gedrückt → „Nochmal" |
| 1 | Pfanddachs (St. 1, 360 LP) | kurze Pause | Beute-Dialog (F + „Alles einpacken" = 2 Aktionen), Leben 336/608 nach einem St.-1-Dachs |
| 2 | Pfandkeiler (St. 2, 460 LP) | Stillstand | Leben 114/608, nächster Gegner 14 m weg, „Zu weit entfernt" — ohne Rast oder Brezel geht nichts mehr |

Kampffluss-Fazit: Der Kill selbst kommt schnell (2 Kniffe + Auto reichen, ~6–8 s), aber der Schadensinput ist absurd: ein Stufe-1-Dachs nimmt mir 270 LP, ein Stufe-2-Keiler 310 LP. Nach zwei Kills bin ich bei 19 % Leben. Das Genre gibt Stufe-1-Gegnern 10–20 % vom Spielerleben, nicht 45–50 %.

### 3. Rotation
Tastenfolge am Ende: **Linksklick Ziel → 1 (Autoangriff an) → W-halten bis „Zu weit" verschwindet → 2 → 2 → 2 → (Leer bei „Sprung – ausweichen"-Balken)**. Stand ab Hofprobe 5/8, also praktisch von Anfang an — es gibt nur zwei Tasten. Störend: (a) Autoangriff „Flasche kreist" ist offenbar Fernkampf, Kronkorken-Kelle Nahkampf — Reichweiten-Mismatch, Figur läuft nicht selbst ran, ich muss per WASD nachrücken; (b) „Pegel → Eskalation" ◆◆◆ war seit Screenshot 2 voll und ich habe bis zum Ende nicht erfahren, womit man ihn ausgibt — keine dritte Taste in der Leiste, kein Hinweis; (c) „100 Randale" hat sich nie bewegt, Ressource ohne Funktion sichtbar; (d) Kelle zeigt Cooldown 0,7 s als Zahl, gut.

### 4. Hänger
| Nr | Wo | Was passierte | Was erwartet | Schweregrad | Screenshot |
|---|---|---|---|---|---|
| 1 | Hofprobe 5/8 Ausweichen | Leertaste vor dem roten Kreis = „Nochmal", Kreis erscheint erst ~6 s später, Kampfstatus fiel auf „Auf Erkundung" | Kreis sofort nach Schritt-Start oder klare Vorwarnung | stockt | kenner-03 |
| 2 | Hofprobe 6/8 Kiste | F bei Ida-Nähe öffnete Ida-Dialog statt Kiste; Papp-Horst war plötzlich verschwunden, Kiste stand an seiner Stelle | F wählt Auftrags-relevantes Objekt bzw. Kiste ist markiert bevor ich hinlaufe | stockt | kenner-04 |
| 3 | Bewegung | Rechtsklick auf Spielfeld = Laufen funktioniert, aber Rechtsklick in Höhe der Leiste (y≈885) = nichts; 3 s WASD = 24 m bei 127 m Marke → 15 s reiner Laufweg | Doppelklick/Autolauf zur goldenen Wegmarke oder deutlich höheres Tempo | stockt | kenner-08/09 |
| 4 | Goldene Wegmarke | Marke zeigt „127 m" hinter ein Gebäude, Pfad nicht sichtbar; ich bin an Häusern vorbei geeiert | Wegmarke auf der Straße / Minimap-Linie | wundert sich | kenner-10 |
| 5 | Schaden | Stufe-1-Dachs zieht 45 % Leben, Stufe-2-Keiler 50 %; „Deckung 9" wird angezeigt, nie erklärt | Trash-Gegner ≤20 % | bricht ab (Stufe 3 in 50 Aktionen unmöglich) | kenner-11/12 |
| 6 | Pegel → Eskalation | ◆◆◆ voll seit Beginn, keine Taste dafür; Hofprobe hat es nicht gelehrt | Finisher-Taste wird bei vollem Pegel leuchten | wundert sich | kenner-02 |
| 7 | Beute | Jeder Kill = F + „Alles einpacken" (2 Aktionen); Bag-Öffnen schließt Hofprobe-Schritt 7 ohne den versprochenen Hover | Auto-Loot oder F = alles | stockt | kenner-06 |
| 8 | Reichweite | „Zu weit entfernt · 7 m" beim Kniff, obwohl Autoangriff trifft; Figur läuft nicht nach | Auto-Nachlaufen wie im Genre üblich | stockt | kenner-11 |
| 9 | Idee | Kelle zeigt Abklingzeit als Zahl — gut; gleiches für Autoangriff-Takt und den Pegel wäre die Rotation in 3 s klar | — | Idee | kenner-11 |

Nicht zuordenbare Begriffe: „Randale" (Ressource? stand konstant 100), „Pegel → Eskalation" (Combo-Punkte, aber ohne Verbraucher), „Deckung 9", „Kniffe" (= Fähigkeiten, verstanden), „Pfandmarken" (Währung, klar). Admin/Debug/Arena: nichts gesehen. In-Game-Hilfe (H, „Idas Anleitung") nicht gebraucht.

### 5. Bewertung (1–5 mit Beleg)
- **Wusste ich, was zu tun ist? 4** — Hofprobe-Panel rechts sagt jeden Schritt klar; nur Kreis-Timing und Kisten-F waren unklar.
- **Wusste ich, was passiert ist? 3** — Kill-Meldung „+30 EP" und Kampfereignis-Log sind da, aber warum ich 270 LP verlor, wurde nirgends gezeigt (keine Schadenszahlen an mir, nur am Gegner).
- **Wollte ich weiterspielen? 2** — Auftrag mit 3 Zielen ist gut gesetzt, aber bei 19 % Leben nach zwei Wildtieren und 72 m Restweg wollte ich eher rasten als spielen.
- **Kam ich ohne Pausen von Gegner zu Gegner? 2** — Kill 1 → Loot-Dialog → Nachrücken → Kill 2 → fast tot. Kein „nahtlos" dabei.

### 6. Ein Satz an die Entwickler
Der Zwei-Tasten-Kern und das Hofprobe-Panel sind gut, aber Trash-Gegner dürfen keine 45 % Leben pro Kampf kosten, die Figur muss zum Nahkampf-Ziel selbst nachlaufen, und der volle Eskalations-Pegel braucht eine sichtbare Taste — sonst gibt es keine Rotation, nur Warten.

## Freigabe
☐ **frei** · ☑ **gesperrt** — offen: Nr 5 (Persona-Urteil). **Orchestrator:** Balancing-Befund, Entscheidung Produktion; siehe `PLAYTEST-2026-09-17-AUSWERTUNG.md`.
