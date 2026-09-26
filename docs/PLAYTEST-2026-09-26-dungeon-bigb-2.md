# Playtest 2026-09-26 · Dungeon „Schloss Big B“ · Endboss Big B · Nachprüfung (Build #726 · 4e527c68)

Persona `pruefer-agent`, live, Testzugang `--preset=bigb --gear=typical`: Held „Bigb Zwei“ (Stufe 10, Tresenbrecher), Kontrollpunkt Weinkeller, Siegel 3/3, Beweise 3/3, vier Söldner (Pils-Peter/Schutz, Schorle-Susi/Heilung, Radler-Rita, Hopfen-Horst). Ende: Stufe 11 (895/1.540 EP), Held auf der Burgstraße, Dungeon nach 3:56 min abgeschlossen; Log: Kabelbinder-Manschetten, 28 Pfandmarken, „Sagenhafte Maifeldtreter“ (Endtruhe). ~60 Aktionen. Belege `visual-review/dungeon-2026-09-26/bigb2-01…09.jpg`, Kontrollbilder `D:\Dev\.playwright-mcp\page-2026-09-26T08-3*.jpeg` (nicht im Repo).

**Freigabe: FREI.** Nr. 1, 3, 6, 7 teilweise gehalten, nachbessern.

| Nr | Versprechen | Urteil | Beleg |
|---|---|---|---|
| 1 | Tresortür mit 3 Siegeln, Thronsaal betretbar, Beweise vorlegbar | TEILWEISE | Ein Rechtsklick führte vom Weinkeller durch die Tresortür (Rad, drei rote Siegel) in den Thronsaal; „Die Tür fällt zu.“ / nach dem Sieg „Die Tür geht wieder auf.“ Vorlegen der Beweise wurde nie angeboten: Big B begrüßt, sofort Kampf mit der ersten Lüge. Tracker durchgehend „Beweise 3/3“; bei 13 % Etikett „Geständnis“ ohne eigene Handlung |
| 2 | Nach dem Nachsatz klare Anweisung, rote Bahn sichtbar und nicht verdeckt | GEHALTEN | „Ich reite nach LINKS!“ → „… sagt man. Rechts.“; Leiste wechselt von „NACHSATZ ABWARTEN [A·D]“ zu „NACH LINKS [A] … 0,1 s“, „NACH RECHTS [D] … jetzt“, „LINKS BLEIBEN“, „MITTE HALTEN“; Bahn rot mit Pfeilen bei x 870–1190, Warnleiste rechts bei x 1340–1750, überdeckt nichts |
| 3 | Jede Zeile mit Symbol, Antwort, Zeit und Taste des Helden (auch Siegelring) | TEILWEISE | Siegelring „AUSWEICHEN [LEER]“ (Held hat LEER); Tasten bei UNTERBRECHEN [Q], ADDS ZUERST [Tab], RAUS AUS DER FLÄCHE [LEER], NACH LINKS [A], NACH RECHTS [D]. Ohne Taste: „LINKS BLEIBEN … sagt man. Rechts. 1,2 s“ und „MITTE HALTEN … und links. 1,4 s“ |
| 4 | Keine Söldner-Meldungen, Fehlertexte, Raumtitel in der Bildmitte | GEHALTEN | In ~12 Kampfbildern nur Figuren, Namen, Zahlen, rote Flächen; Söldner-Meldungen unten links im Log; Raumtitel und Stufenbanner erst nach dem Kampf |
| 5 | Aufhelfen, auch nach zweitem Tod spätestens nach dem Kampf; kein „Kampf aufgeben“ nach dem Sieg | GEHALTEN | 1. Tod (absichtlich in der Bahn): „Schorle-Susi hilft dir auf“ mit Balken, Held mitten im Kampf mit 1.124 LP wieder auf. 2. Tod (absichtlich stehen geblieben): „Söldner kämpfen weiter“, Söldner legten Big B von 6 % auf 0, danach „Schorle-Susi hat dir aufgeholfen.“; nach dem Sieg kein Sterbefenster, kein Aufgeben |
| 6 | Beutefenster, Endtruhe mittig mit Dreierwahl, Erfolg oben, Ausgang gekennzeichnet | TEILWEISE | Beutefenster „Beute · Big B“ (+4, +2250 EP, Pfandmarken ×28, Manschetten, „Alles einpacken“), nichts angelegt; Endtruhe mittig vor dem Thron, „[F] Endtruhe öffnen“ mit drei Teilen und „Wähl ein Teil. Die anderen zwei nimmt Big B mit.“; grünes Notausgangsschild im Süden, über „Schatzkammer · Abstellraum“ und „[F] Zurück auf die Burgstraße“ hinaus. Erfolg nicht oben gesehen (nur Log „Erfolg: Termin eingehalten“, zeitgleich Banner „STUFE 11“). Beim Verlassen „2 liegengebliebene Beutebeutel eingesammelt“ und „Sagenhafte Maifeldtreter“ ausgewählt, ohne dass gewählt wurde |
| 7 | Fair; Sterbefenster nennt den Grund | TEILWEISE | 1. Tod: „Big B · Ritt auf der Kanonenkugel · 988“ (eigener Fehler, klar). 2. Tod: nur „Big B · Trümmer · 70“, obwohl das Leben in ~9 s von 1.124 auf 308 fiel. Richtungszeilen nur mit 1,4 s, 1,2 s, 0,1 s und „jetzt“ gesehen – kurzes Fenster |

## Fünf schwerste Brüche
1. Nr. 3 – „LINKS BLEIBEN“ und „MITTE HALTEN“ ohne Taste und ohne Richtungspfeil, genau im kurzen Fenster nach dem Nachsatz.
2. Nr. 1 – Beweise nicht vorlegbar: Betreten des Thronsaals startet sofort den Kampf; ob „Geständnis“ die Beweise einlöst, ist nicht erkennbar.
3. Nr. 6 – Wahl der Endtruhe wird umgangen: geöffnet, nichts gewählt, zum Ausgang gegangen → das Spiel nahm selbst die „Sagenhaften Maifeldtreter“ und den Big-B-Beutel.
4. Nr. 7 – Zweiter Todesgrund irreführend: nur der letzte Treffer („Trümmer · 70“), die ~800 Schaden davor fehlen.
5. Nr. 6 – Erfolg nicht oben gesehen, vermutlich vom Stufen-Banner verdrängt.

Weitere Einzelheit: Vor dem Nachsatz „NACHSATZ ABWARTEN [A·D]“; die Anweisung folgt erst mit ~1,5 s oder weniger; beim Betreten des Saals stand der Held schon in der ersten Bahn, als die Leiste „0,1 s“ zeigte.

## Nebenbefunde
- Beutefenster liegt über der Auftragsverfolgung; Klick auf „Endtruhe“ im Tracker kam nicht an (Beute-Symbolleiste fing ihn ab).
- F doppelt belegt: erstes F an der Truhe schloss das Big-B-Beutefenster statt die Truhe zu öffnen; erst das zweite F öffnete sie.
- Sterbefenster: goldener Hauptknopf „AM KONTROLLPUNKT AUFSTEHEN“ gibt laut Tooltip den Kampf auf; Tooltip war schon offen ohne Hover; ein Fehlklick würde einen fast gewonnenen Kampf zurücksetzen.
- „AUSWEICHEN [LEER] Siegelring · auf Pils-Peter“ fordert zum Ausweichen auf, obwohl das Ziel ein Söldner ist.
- Söldner legten Big B fast allein (Autoangriff des Helden aus, kein Kniff gedrückt, Held die letzten ~20 s tot).
- Beim Verlassen ungefragt großes Fenster „ERINNERUNG · Wurst Case“.
- Nach dem Verlassen weniger Höchstleben der Söldner (z. B. Schorle-Susi 782 statt 1.408) – nur beobachtet.
- Log hält Big Bs Sprüche gut fest („Schnitt. Das nehmen wir nochmal.“, „Das Schloss war eine Garage. Die Garage bleibt.“).

## Ein Satz
„Ja, ich würde Big B gern ein zweites Mal legen: Die Lüge mit dem Nachsatz ist witzig und gut lesbar – aber ich möchte dann selbst etwas zum Sieg beitragen und nicht zusehen, wie die Söldner ihn allein erledigen.“
