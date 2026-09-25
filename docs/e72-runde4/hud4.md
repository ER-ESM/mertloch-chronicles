# E-72 Runde 4 · hud4 · Ressourcen-HUD und Klassenleisten (Kenner-Playtest 25.09. abends)

Branch `e72-hud4`. Prüfung: `npm test` (neu: `tests/e72-hud4.test.mjs`, Schein-DOM), Browser: `scripts/e72-hud4-check.mjs`
(Bilder `docs/e72-runde4/hud4/`, Bericht `report.json`).

| Nr | Befund | Umsetzung |
|---|---|---|
| 1 | Käthes Augen-Leiste 4× im Seitenbaum nach 3 Toden | Ursache: `teardown()` leerte nur die Merkliste, die Tooltip-Flächen blieben in `.bar.energy` hängen – bei **allen fünf** Leisten. Jetzt: Abbau entfernt sie, Aufbau übernimmt vorhandene Flächen je Schlüssel (`data-rh-key`) und wirft Doppel/Altlasten raus, nicht mehr gebrauchte Flächen verlassen den Baum (vorher nur versteckt). Geprüft: Tod (Knopf „Aufwachen“) 3×, Schrein 3×, Klassen- und Heldenwechsel, je Klasse |
| 2 | Marken 61/90/120 schlucken den Leisten-Tooltip | Marken sind 8-px-Kerben (vorher 20 px), die Leiste hat ihren Tooltip auf 87 % der Breite und nennt die nächste Schwelle („Abrechnen ab 61 (noch 13)“). Nebenbefund: baut sich eine Fläche unter der Maus neu auf, bekommt die neue den Tooltip ohne Mausbewegung (`rehover`) |
| 3 | Kartenknöpfe heißen „Karte 1/2/3“ | `aria-label` und Tooltip-Kopf = „Kreuz-Dame – trifft [2]“, neu nach jedem Nachziehen. Bilder: Herz-Karte zeigt jetzt ein Herz mit grünem Plus, Karo einen gestrichelten Ring um den Knall (Fläche). Knöpfe 47 px bei 1600 und 2024 px Breite |
| 4 | Abrechnen kaum sichtbar | Augen-Marken fliegen von der Leiste (die dabei sichtbar abläuft) zum Ziel, dort große Zahl (Schaden des Abrechnens) + „95 Augen ×1,5“, Stempel SCHNEIDER!/SCHWARZ!/GRAND!; Weltkarten sammeln sich am Ziel, fächern auf und platzen (1,7 s statt 1,35 s). Wirkung unverändert. Reduzierte Bewegung: keine fliegenden Augen, Zahl + Stempel stehen still |
| 5 | Unerklärte Leisten + RESONANZ | Mechanik-Anzeige: Hover = ein Satz (was füllt, was passiert voll) + „Glossar: Begriff · Klick: alle Regeln“ (alle 15 Hauptbäume, `mechanicTip`); Klick öffnet wie bisher die ausführlichen Regeln. Spezialkniff-Tooltip beginnt bei markiertem Ziel mit „RESONANZ: …“ |
| 6 | „100 Likes · Flop“ auf einer Leiste | Leiste zeigt nur Likes; Trend = die fünf Herzen unter dem Porträt (volle Herzen = Trendstufe 0–5) + Stufenname daneben („Läuft“, springt bei Wechsel), Tooltip „Trend · Läuft (2/5 Herzen)“ |
| 7 | Pfandautomat verdeckt „Sammeln“; „×1/×2“ unklar | Balken liegt 12 px über dem höchsten Element über der Leiste (Leiste, Mechanik-Anzeige, Hinweis, Zauberbalken). Zusätzlich: der Hinweis („Sammeln“, „Beutel durchsuchen“) deckte die Mechanik-Anzeige zu – sie rückt jetzt über ihn. Band: Flasche im Gras + Stiefel + „×4“, Tooltip „4 Flaschen liegen neben dir – drüberlaufen sammelt ein“. Boden: größere Flasche, gestrichelter Aufsammelkreis, Lichthof, „+1“ beim Aufsammeln |

Offen/Risiken: siehe Übergabe an den Orchestrator.
