# Playtest — Mertloch Chronicles 0.19.1 (Commit dabf31c)  (Stufe 5 · 2026-09-17)

**Persona:** ☑ Neuling ☐ Kenner ☐ Prüfer · **Agent/Mensch:** `neuling-agent` (Persona-Definition, technisch nur Browser) · **Auftrag (Spielersprache):** „Spiel mal die erste Viertelstunde. Mach die Hofprobe zu Ende und leg danach drei Viecher." · **Budget:** 40 Aktionen · **Gerät:** ☑ Desktop 2024×900 ☐ Handy 390×844
**Start:** `http://localhost:4173/`, frischer Spielstand (Service-Worker abgemeldet, Caches und Speicher geleert). Screenshots `visual-review/playtest-2026-09-17/neuling-01.png` … `neuling-09.png`.

## Auswertung des Orchestrators (vor dem Bericht lesen)

- **Hänger 1, 2 und 10 sind Werkzeugbefunde, keine Spielbefunde.** `browser_press_key` tippt Tasten nur an; das Spiel bewegt die Figur nur bei gehaltener Taste. `browser_click` trifft immer die Mitte des Spielfelds, also die eigene Figur. Nachgewiesen: gehaltene Taste S (1 s) bewegt Dieter weit, Rechtsklick auf die Markierung schaltet die Hofprobe auf 3/8 (`instrument-held-s2.png`, `instrument-rightclick.png`). Ein Mensch hält Tasten. Der Neuling hat die bereitgestellten Bewegungs-Snippets nicht genutzt; die Persona-Definition wurde danach um einen Pflicht-Abschnitt ergänzt.
- **Echte Befunde:** Hänger 3 bis 9 und 11. Davon zwei „stockt" (kein Name über der eigenen Figur; Ziel-Reiter vergisst das Ziel) und mehrere „wundert sich" (Ring hinter dem Gesprächsfenster, Hilfe wiederholt den Seitenkasten, Karte bleibt beim Losgehen offen, Schritt 3/8 wird beim Autolauf übersprungen, Sprungrichtung unklar).
- **Ein erster Lauf ohne Snippets** (Bericht nicht abgelegt) kam zum selben Bild: 17 Tastentipps ohne Bewegung, dazu dieselben Menü-Befunde (zwei Kartenknöpfe für ein Fenster, „Weg einschlagen" blockiert bei offener Karte, HUD zeigt Randale/Pegel/Sprung unerklärt ab Sekunde eins).

## Bericht der Persona (unverändert)

### 1. Ergebnis

- **Hofprobe zu Ende machen: NICHT.** Ich kam bis Schritt 4/8 („Kelle und Nachschlag"), weil meine Figur auf WASD/Pfeiltasten/Rechtsklick nicht reagierte und ich sie nur über den Kartenumweg „Weg einschlagen" und den Leertasten-Sprung bewegen konnte.
- **Drei Viecher legen: NICHT.** Kein einziger Treffer gelandet; Papp-Horst war anvisiert, aber immer „Zu weit entfernt", und ich kam nicht näher heran.
- **Aktionen gesamt: 39 von 40**, davon **ca. 17 verschwendet** (12 wirkungslose Bewegungstasten/Rechtsklick, 2 Sprünge in die falsche Richtung, 2 Angriffe außer Reichweite, 1 nutzloser Anleitungs-Klick).

Screenshots: 01 Start-Gespräch, 02 nach „Hofprobe anfangen", 03/04 nach Tastentippen, 05 Beleg „Figur steht nach 12 Tasten/Rechtsklick unverändert", 06 „Kein passendes Ziel", 07 Papp-Horst anvisiert, 08 Sprung nach links weg vom Ziel, 09 Endstand mit leerem Ziel-Reiter. Frischer Spielstand, Stufe 1, 0/140 EP.

### 2. Protokoll

| Nr | Absicht | Aktion | Was ich sah | Bewertung |
|---|---|---|---|---|
| 1 | Spiel öffnen | Navigate localhost:4173 | Dorf, Figur „Dosen-Dieter", offenes Gespräch „Kisten-Ida · Hofprobe statt Totalschaden 1/8", Knöpfe „Figur aussuchen" / „Hofprobe anfangen" | klar |
| 2 | Loslegen | Klick „Hofprobe anfangen" | Gespräch zu, Seitenkasten „Hofprobe · 2/8 Einmal geradeaus, bitte – Laufe zur goldenen Hofmarkierung" | klar |
| 3 | Fokus | Klick ins Spielfeld | nichts Sichtbares | klar |
| 4–9 | Laufen | W, W, W, D, D, S | Figur steht am selben Fleck; andere Dorfleute laufen | hängengeblieben |
| 10 | Hilfe holen | Klick „Idas Anleitung ?" | Dialog mit exakt demselben Text plus „WASD bewegen · Rechtsklick setzt einen Laufweg", Knopf „Weiterüben" | unklar (keine neue Info) |
| 11 | Dialog weg | Klick „Weiterüben" | Dialog zu; jetzt sehe ich den goldenen Ring mit „!" links unter mir | klar |
| 12–15 | Zum Ring laufen | S, S, A, A | Figur bewegt sich nicht | hängengeblieben |
| 16–17 | Fokus + erneut | Klick Spielfeld, S | keine Bewegung | hängengeblieben |
| 18 | Alternative | ArrowDown | keine Bewegung | hängengeblieben |
| 19 | Laufweg per Rechtsklick | Rechtsklick ins Spielfeld | keine Bewegung, kein Marker | hängengeblieben |
| 20 | Irgendwas, das bewegt | Leertaste („Ab durch die Hecke [LEER]") | Figur springt ein Stück nach RECHTS, Knopf zeigt Abklingzeit „1.2"; Ortsschild wechselt zu „St. Gangolf"; jetzt weiter weg vom Ring | unklar (Richtung nicht steuerbar) |
| 21–22 | Nach links springen | A, Leertaste | Sprung wieder nach rechts; „25 m"-Schild neben Brunnen | Irrweg |
| 23–24 | Kampf testen | Tab, 1 | Einblendung „Kein passendes Ziel in direkter Nähe." | klar |
| 25 | Anders hinkommen | Klick Karte (M) | Fenster „Clanbuch · Karte" mit Reitern Karte/Orte/Ziel/Legende | klar |
| 26 | Ziel setzen | Reiter „Ziel" | „Wähle einen Ort auf der Karte oder in der Liste." | unklar |
| 27 | Ort suchen | Reiter „Orte" | Liste: „Clan-Treff 2 offene Aufträge 26 m", Pfandhof, Wegestube, mehrere „Besetztes Lager" | klar |
| 28 | Ort wählen | Klick „Clan-Treff" | „DEIN NÄCHSTER HALT Clan-Treff · 26 m Luftlinie", Knopf „Weg einschlagen →" | klar |
| 29 | Hinlaufen lassen | Klick „Weg einschlagen →" | Figur läuft von selbst zum Platz; Hofprobe springt auf 3/8 und gleich 4/8; Kartenfenster bleibt offen | klar (endlich Bewegung) |
| 30–32 | Papp-Horst anvisieren | Karte schließen, Klick Spielfeld, Tab | Zielfenster „Papp-Horst ST. 1 · 500/500 · Neutral · greift nur zurück an · 7 m"; Aufgabe „Kelle und Nachschlag … Kniffe 0/2 · Auto 0/2" | klar |
| 33–34 | Angreifen | 1, 2 | „Zu weit entfernt · 8 m. Bewege dich näher zum Ziel." | klar, aber ich kann nicht näher |
| 35–37 | Näher springen + angreifen | Leertaste, 1, 2 | Sprung nach LINKS, jetzt „Zu weit entfernt · 17 m." | Irrweg |
| 38 | Nochmal hinlaufen lassen | Klick Karte (M) | Karte öffnet auf Reiter „Karte", Ziel weg | unklar |
| 39 | Ziel wiederfinden | Reiter „Ziel" | wieder nur „Wähle einen Ort …" – Clan-Treff vergessen | hängengeblieben |

### 3. Hänger

| Nr | Wo | Was passierte | Was erwartet | Schweregrad | Screenshot |
|---|---|---|---|---|---|
| 1 | Hofprobe 2/8, Spielfeld | Kurzes Antippen von W/A/S/D und Pfeil-runter (12x, mit Klick ins Spielfeld dazwischen) bewegt die Figur nicht; keinerlei Rückmeldung | Figur macht pro Tastendruck mindestens einen kleinen Schritt, oder das Spiel sagt „Taste gedrückt halten" | bricht ab (Orchestrator: Werkzeug) | neuling-05 |
| 2 | Hofprobe 2/8 | Rechtsklick ins Spielfeld setzt keinen sichtbaren Laufweg, obwohl der Hinweis „Rechtsklick setzt einen Laufweg" sagt | Marker am Klickpunkt und Figur läuft los | bricht ab (Orchestrator: Werkzeug) | neuling-05 |
| 3 | Start | Ich weiß nicht, welche Figur ich bin: kein Namensschild über Dosen-Dieter, Dorfleute laufen um mich herum, nur die HUD-Karte oben links zeigt ihn | Name/Markierung über der eigenen Figur zumindest während der Hofprobe | stockt | neuling-03 |
| 4 | Hofprobe 2/8 | Der goldene Ring liegt beim Start hinter dem Gesprächsfenster; erst nach Schließen sichtbar. Kein Pfeil/Abstand, bis ich zufällig ein „25 m"-Schild sah | Richtungspfeil oder Entfernungsangabe direkt beim Auftragstext | wundert sich | neuling-02 |
| 5 | „Ab durch die Hecke [LEER]" | Sprungrichtung nicht nachvollziehbar: zweimal nach rechts (auch nach A-Tipp), einmal nach links; brachte mich jedes Mal weiter vom Ziel weg | Sprung in die zuletzt gedrückte Richtung, Richtung erkennbar | stockt | neuling-08 |
| 6 | „Idas Anleitung ?" | Öffnet nur denselben Text wie der Seitenkasten, keine Zusatzhilfe („Weiterüben") | Konkreter Tipp, z. B. „Taste halten" oder „Rechtsklick auf den Ring" | wundert sich | – |
| 7 | Karte → Ziel | Reiter „Ziel" ist leer, man muss erst über „Orte" gehen; nach Schließen und erneutem Öffnen ist das Ziel weg | Ziel bleibt gesetzt, bis ich es lösche; „Weg einschlagen" merkt sich den letzten Halt | stockt | neuling-09 |
| 8 | Karte → „Weg einschlagen" | Figur läuft, aber das Kartenfenster bleibt offen und verdeckt die halbe Welt | Fenster schließt sich beim Losgehen | wundert sich | – |
| 9 | Hofprobe 2/8→4/8 | Über „Weg einschlagen" wurde 3/8 („Papp-Horst im Visier") übersprungen und stand direkt auf 4/8, ohne dass ich etwas angetippt hatte; nach Tab war Horst dann anvisiert | Jeder Schritt einzeln bestätigt | wundert sich | neuling-07 |
| 10 | Hofprobe 4/8 | „Zu weit entfernt · 8 m. Bewege dich näher zum Ziel." – Meldung gut, aber es gibt keinen „Zum Ziel laufen"-Knopf; ohne funktionierende Tasten Sackgasse | Klick aufs Zielfenster oder Autoangriff-Knopf lässt die Figur heranlaufen | bricht ab (Orchestrator: Werkzeug; als Idee „Auto-Nachlaufen" bleibt es, siehe Kenner Nr. 8) | neuling-08 |
| 11 | Start-Gespräch | „Figur aussuchen" wird zuerst genannt, ich habe es übersprungen; unklar, ob das später noch geht | Kurzer Hinweis „kannst du später ändern" oder Pflichtschritt | Idee | neuling-01 |

Gesehen, aber nicht angefasst: Knöpfe „Ton einschalten", „Spielmenü", „Vollbild", das Clanbuch (Figur/Rucksack/Kniffe/Aufträge/Hilfe). Nichts davon hat mich irritiert; keine Admin-/Debug-Funktionen bemerkt.

### 4. Bewertung (1–5 mit Beleg)

- **Wusste ich, was zu tun ist? 4/5.** Der Seitenkasten „Hofprobe · 2/8 … Laufe zur goldenen Hofmarkierung" und später „Kniffe 0/2 · Auto 0/2" sagten mir immer klar, WAS verlangt ist. Abzug: nicht WO (Ring hinter dem Dialog, keine Richtung) und nicht WIE (Tasten halten?).
- **Wusste ich, was passiert ist? 3/5.** Kampf-Rückmeldungen sind vorbildlich: „Kein passendes Ziel in direkter Nähe.", „Zu weit entfernt · 8 m." Aber beim Laufen gab es zwölfmal schlicht nichts, und der Sprung mit „1.2"-Abklingzeit ging in unerklärliche Richtungen.
- **Wollte ich weiterspielen? 2/5.** Das Dorf sieht einladend aus, Papp-Horst als Übungspuppe ist eine gute Idee, und der Moment, als „Weg einschlagen" die Figur laufen ließ, hat gezogen. Aber nach 20 Aktionen ohne einen Schritt hätte ich als Freund den Tab zugemacht.

### 5. Ein Satz an die Entwickler

Macht, dass ein einzelnes Antippen von WASD (oder ein Rechtsklick) die Figur sichtbar bewegt oder wenigstens „Taste gedrückt halten" einblendet – bei mir stand Dosen-Dieter zwölf Tastendrücke lang wie festgenagelt, und alles danach war nur Umweg.

## Freigabe
☐ **frei** · ☑ **gesperrt** — offen aus Sicht der Persona: Nr 1, 2, 10. **Orchestrator:** alle drei sind Werkzeugbefunde (siehe Auswertung); als Spielbefund bleibt kein „bricht ab". Freigabe-Entscheidung siehe `PLAYTEST-2026-09-17-AUSWERTUNG.md`.
Entscheidung Produktion zu „stockt"/„wundert sich": offen.
