# Playtest 2026-09-26 · Dungeon „Schloss Big B“ · Endabnahme durch Prüfer (Build #715)

Persona `pruefer-agent`, live, vorbereiteter Held „Endabnahme“ (Stufe 10, Tresenbrecher, **ohne Zusatzausrüstung**, 600 Pfandmarken), 4 Söldner angeheuert. Etwa 53 Aktionen, einmal neu geladen (für Versprechen 10). Erreicht: Flügel 1 (Schlosshof, ein Trash-Pull, Gästeliste-Gerd besiegt, Siegel 1/3). Big B nicht erreicht. Beweisbilder `visual-review/dungeon-2026-09-26/endabnahme-01…08` (nicht im Repo), Arbeitsbilder `D:\Dev\.playwright-mcp\page-2026-09-26T02-*.jpeg`.

**Ergebnis:** gehalten 1, 2, 3, 4, 5, 6, 10 · gebrochen 7 · nicht erreicht 8, 9. Freigabe nach Regel FREI (kein „bricht ab“), aber Big B nicht abgenommen.

| Nr | Versprechen | Urteil | Beleg |
|---|---|---|---|
| 1 | Eingangskarte mit 5 Plätzen, Söldner anheuern, Journal zurück zur Karte | gehalten | Stufe 8–10, 5 Plätze, Siegel 0/3, Bosse 0/6, 6 Söldner à 52 Pfandmarken; 4 Klicks zur vollen Gruppe; Journal mit 6 Bossbildern, bei Gerd Fähigkeiten/Antworten/Beute; nach „schließen“ zurück auf der Eingangskarte |
| 2 | Pull auch aus dem Nachbarraum: ganze Gruppe in der Arena | gehalten | Gerd aus dem Schlosshof mit Kniff 4 angegriffen; „Die Tür fällt zu …“; alle vier Söldner in der Arena, Held auf der Schwelle, alle im Kampf |
| 3 | Warnleiste mit Symbol, Antwort, Zeit | gehalten (Gerd) | „SEITLICH STEHEN · Rausschmiss · 11,7 s“, „UNTERBRECHEN · Du stehst nicht auf der Liste · 4,4 s“, „FLÄCHE VERLASSEN · Dresscode-Kontrolle · 1,7 s“; „UNTERBROCHEN!“ in Grün |
| 4 | Held stirbt → Söldner kämpfen weiter, helfen auf | gehalten | im ersten Trash-Kampf gestorben; „Schorle-Susi hilft dir auf.“; ~25 s später wieder auf (898 HP), Kampf lief weiter, Gegner nicht zurückgesetzt |
| 5 | Feste Trash-Gruppen, kein Boss mischt sich ein | gehalten | Security-Azubi angeklickt: genau 2 Azubis + 1 Baumarkt-Ritter kämpften; zweite Gruppe, Pappschütze, Makler-Praktikant und Gerd blieben stehen |
| 6 | Boss-Beute im Fenster, nichts angelegt, Siegelmarken | gehalten | „F Beutel durchsuchen“ an Gerds Leiche; „Beute · Gästeliste-Gerd“ mit 25 Pfandmarken, Dienstlicher Kabelbinder ×2, Geklaute Festtagsjacke; Jacke nicht angelegt; Kopfzeile „+4“ Siegelmarken |
| 7 | Bildmitte im Kampf frei von Texten | **gebrochen** | Raumtitel „Schlosshof · Doppelgarage mit Pappzinnen“ fest in der Raummitte im Trash-Kampf; in der Arena „Zugbrücke · Kellertreppe mit Kette“ über Gerds Namensschild und Lebensbalken; Söldner-Sprechblase „Ich… leg mich kurz hin.“ über dem Kampf |
| 8 | Big B lügt, verständlich | nicht erreicht | Budget nur für Flügel 1 |
| 9 | Truhe mit Wahl, Erfolg, Ausgang | nicht erreicht | – |
| 10 | Neuladen: Kontrollpunkt, Besiegte bleiben besiegt, kein Sofort-Kampf | gehalten | Held am Eingang des Schlosshofs, volle HP, kein Kampf; Gerd bleibt tot (Leiche mit Beute-Licht), Pull bleibt weg, Siegel 1/3, Tracker zeigt Frau Dr. Exposé |

## Fünf schwerste Brüche
1. Nr. 7 – Raumtitel fest in der Raummitte, verdecken in der Arena Gerds Namensschild und Lebensbalken.
2. Nr. 7 – Söldner-Sprechblasen über dem Kampf.
3. (kein Versprechen) Erster Pull ist eine Wand: Gruppe Stufe 10 im Dungeon 8–10 verliert nach ~35 s Tank, Heilerin, einen Schadens-Söldner und den Helden (Azubi 13.000 HP, Baumarkt-Ritter 26.000, Held 1.005; Pils-Peter nach ~15 s am Boden). Überlebt nur durch automatisches Aufstehen der Söldner.
4. (kein Versprechen) Radler-Rita „Am Boden · Steht in 0 s wieder auf“ über 30 s, stand erst nach Kampfende auf.
5. (kein Versprechen) Boss-Beute öffnet nicht von selbst; Rechtsklick auf die Leiche öffnete das Söldnerfenster, weil Hopfen-Horst darauf stand; nur mit WASD + „F Beutel durchsuchen“.

## Nebenbefunde
- Beim Tod des Helden 1–2 s komplett schwarzes Bild, nur Namensschilder schweben; danach Grauschleier.
- Trash-Beute „Notfallbrezel“ landete ungefragt auf dem freien Leistenplatz 0.
- Trash-Warnleiste „NICHT DAVOR STEHEN · Regenrinnen-Hieb · 1,6 s“ – kaum Reaktionszeit.
- Nach Ziel + Autoangriff läuft der Held nicht selbst zum Gegner (blieb mehrfach außer Reichweite).
- Nach dem Neuladen stand ein Tooltip „Autoangriff · Flasche kreist“ offen in der Bildmitte (alte Mausposition).
- Chat-Reiter nicht anklickbar, solange das Chatfenster ausgeblendet ist (Zeichenfläche fängt den Klick).
- Gut lesbar: Gerds Fähigkeiten, Zusatzgegner, Sprüche, Abschlusstext; Tür fällt hörbar ins Schloss; Siegel und nächster Boss sofort im Tracker; Abkürzung wird freigeschaltet.
- Im Dorf lag beim Start das Fenster „Erinnerung · Der Stempel“ offen (neuer Held); im Dungeon kein Erinnerungsfenster.

## Ein Satz
„Der Gerd-Kampf ist ein Dungeonkampf, den man gern zweimal spielt – Warnleisten, Tür, Zusatzgegner, Sprüche und Beute greifen sauber ineinander –, aber der erste Trash-Pull wirft die Gruppe so hart um, dass man den zweiten Durchgang nur wegen des Bosses antritt, nicht wegen des Wegs dorthin.“
