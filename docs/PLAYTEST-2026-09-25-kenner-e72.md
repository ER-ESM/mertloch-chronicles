# Playtest „Kenner“ · E-72 fünf Klassen · 25.09.2026

Lokaler Testserver (Branch `klassen-ressourcen`), 2024×900, Persona `kenner-agent`, Stufe 12 per Admin. Geprüft: Grillmeister
(Schwenker-Schorsch), Stammtisch-Zockerin (Kreuz-Käthe), Pfandingenieur (Klo-Kevin). Bericht gekürzt, Wortlaut der Befunde.

## Ergebnis

| Klasse | In einem Satz | Einzigartig | Spaß |
|---|---|---|---|
| Grillmeister | Glut in die goldene Zone hochheizen und parallel Grillgut mit etwa 3–4 s Garfenster im richtigen Moment servieren. | 4 | 3 |
| Stammtisch-Zockerin | Drei wechselnde Karten ausspielen, Augen sammeln und ab 61, 90 oder 120 abrechnen. | 5 | 2 |
| Pfandingenieur | Flaschen aus einem 12er-Kasten werfen, heile Flaschen wieder einsammeln und per Zeitspiel am Pfandautomaten nachladen. | 4 | 4 |

„Die drei Klassen spielen sich wirklich verschieden.“ Pfandingenieur ohne Anleitung verständlich, Grillmeister in der Grundidee,
Zockerin ohne Skatwissen nicht. Gemeinsames Gerüst (Tastenplätze, Tooltip-Vorlagen) schwächt das Gefühl der eigenen Klasse.

## Befunde und Umsetzung (Runde 2, gleicher Tag)

| Nr | Befund | Umsetzung |
|---|---|---|
| 1 | Pfandautomat gelernt, aber nicht auf der Leiste | Leisten-Vorschlag je Klasse (Kevin: Pfandautomat auf 3), ältere Helden bekommen ihn einmal nachgelegt (`rpg.resourceBars`) |
| 2 | Tooltips „Auflegen“ / „Karte 2“ zeigen den Markierungs-Vorlagentext | `skillHelp` erklärt Ressourcen-Kniffe aus ihrem Zustand (Karte, Grillgut, Glut, Bon-Zone, Zeche) |
| 3 | Karten-Tooltip ohne Farbe, Rang, Augen; „Stich“ nirgends erklärt | Tooltip nennt Karte, Wirkung, Augen (5 + Skatwert), Farbkette, Stich gegen den Zauber des Ziels, Farblegende |
| 4 | „Kein Ziel für Karo-Dame“ bei entferntem Ziel | Meldung nennt die Entfernung und die Reichweite |
| 5 | Grill: Tod, hoher Schaden, Folge von „zu heiß“ unklar | Warnung „ZU HEISS – ablöschen!“ beim Eintritt, Brand 1,5 → 1 %/s, dicke Schürze −8 % Schaden, Ruheglut 35 statt 25 |
| 6 | Garfenster nur 3–4 s | Garzeit 9 s, gar 55–95 %, verkohlt erst ab 120 % |
| 7 | Nachladen klemmt oft, Folge unklar | Bon-Zone 50–75 % statt 55–72 %, Meldung „KLEMMT! +1 s“ |
| 8 | Käthes Hand rückt nach jedem Ausspielen nach, keine Tastenroutine | Die neue Karte landet auf dem Platz der gespielten |
| 9 | Garstufe/Kartenrang nur schwer lesbar (HUD) | Anzeige-Runde 2 (größere Rostplätze, verkohlt ≠ leer, Glutzahl, Kartenrang groß) |
| 10 | Hofprobe: F-Hinweis erst ab ~3 m; Erinnerungsfenster blockieren; Hilfe-Tastenbeschriftung überlappt | nicht Teil von E-72, an Backlog UI |
