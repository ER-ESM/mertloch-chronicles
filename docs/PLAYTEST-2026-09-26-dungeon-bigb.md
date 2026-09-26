# Playtest 2026-09-26 · Dungeon „Schloss Big B“ · Endboss Big B · Prüfer (Build #721 · bd23ee09)

Persona `pruefer-agent`, live, Testzugang `playtest-save.mjs --preset=bigb --gear=typical`: Held „Bigb Pruefer“ (Stufe 10, Tresenbrecher/dieter-brawl, **ohne Schild**), Kontrollpunkt Weinkeller, Siegel 3/3, Beweise 3/3, vier Söldner (Pils-Peter/Schutz, Schorle-Susi/Heilung, Radler-Rita, Hopfen-Horst). Ende: Big B besiegt, Held Stufe 11, nach „Am Kontrollpunkt aufstehen“ im Thronsaal. 60 Aktionen. Bilder: `visual-review/dungeon-2026-09-26/bigb-01.jpg`, `bigb-02.jpg`, übrige `D:\Dev\.playwright-mcp\page-2026-09-26T05-5*.jpeg` (nicht im Repo).

**Freigabe: GESPERRT (Nr. 8, dazu Nr. 7).**

| Nr | Versprechen | Urteil | Beleg |
|---|---|---|---|
| 1 | Tresortür mit 3 Siegeln, Thronsaal betretbar | GEHALTEN | Karte zeigt Tresortür mit 3 Siegeln; Rechtsklick führt per Wegfindung bis in den Thronsaal; im Kampf Tür zu, danach offen |
| 2 | Beweise vorlegen, sichtbare Wirkung | GEHALTEN | „F Beweise vorlegen (3)“ → „3 Beweise liegen auf dem Thron. Big B schwitzt.“; drei Lupen im Bossrahmen neben „Wut in 5:52“ (Wirkung ohne Tooltip nicht erkennbar) |
| 3 | Big B lügt, verständlich ohne Erklärung | GEHALTEN | „LINKS!“ → „… sagt man. Rechts.“, „RECHTS!“ → „… sagt man. Links.“, „LINKS!“ → „… und rechts.“; Warnleiste „NACHSATZ ABWARTEN“; nach dem Nachsatz nur die echte Bahn rot mit Pfeilen; keine falsche Bodenmarkierung. Nachsatz stand nur noch 1,3 s in der Leiste – knapp |
| 4 | Warnleiste mit Symbol, Antwort, Zeit (auch Linien, Siegelring) | TEILWEISE | Siegelring „PARIEREN ↻ Siegelring“ mit Zeit, aber ohne Taste; Ritt „NACHSATZ ABWARTEN · Ritt auf der Kano… 14,2 s“; in den letzten Sekunden nur das Zitat „… sagt man. Links. · 1,3 s“ statt Handlung; Texte abgeschnitten („Kano…“, „Am eige…“); „ZWEIMAL UNTERBRECHEN … Q“ mit Taste |
| 5 | Bildmitte im Kampf frei | GEBROCHEN | „Schorle-Susi hat dir aufgeholfen.“ groß gelb über Big B; roter Fehlertext „Benötigt: Schild in der Nebenhand. Öffne Charakter oder Rucksack zum Umrüsten.“ zweizeilig in der Mitte; Warnleiste liegt unten auf dem Arenaboden und verdeckt die roten Bahnen. Positiv: Raumtitel/Sprechblase nur vor dem Kampf, Big Bs Sätze im Bossrahmen und Chat |
| 6 | Arenatür schließt erst mit ganzer Gruppe | GEHALTEN | Rita und Peter vorher im Gang; bei Kampfbeginn alle vier im Saal, Tür zu |
| 7 | Held stirbt → Söldner kämpfen weiter, helfen auf | TEILWEISE | 1. Tod: Big B fiel weiter, „Schorle-Susi hat dir aufgeholfen.“ 2. Tod: Söldner besiegten Big B allein (Erfolg „Termin eingehalten“), aber niemand half auf – weder in ~80 s Restkampf noch nach dem Sieg; Rahmen zeigt Stufe 11 und 1.410/1.410, trotzdem „Du bist umgekippt“; einziger Ausweg „Am Kontrollpunkt aufstehen“ mit Tooltip „Gibt den Kampf auf: Die Gegner setzen zurück“ |
| 8 | Beutefenster, Endtruhe mit Dreierwahl, Erfolg, Ausgang ins Dorf | TEILWEISE / NICHT ERREICHT | Erfolg nur als Text; kein Beutefenster in drei Blicken nach dem Sieg; keine Truhe, kein Ausgang gefunden; Gegenstand mit Lichtstrahl auf dem Teppich – Rechtsklick ohne Reaktion |
| 9 | Kampf fair, lesbar, Tod nur durch eigene Fehler | TEILWEISE | Behauptung/Nachsatz/Bahnen passen; Sterbefenster nennt Todesschlag „Big B · … sagt man. Rechts.“ (eigener Fehler); Ursache des 1. Todes nicht angezeigt; PARIEREN (Siegelring) keinem Knopf zuordenbar, „Deckel drauf! [5]“ verlangt Schild, den der Held nicht hat |

## Fünf schwerste Brüche
1. Nr. 7/8: Held bleibt nach dem Sieg tot, keine Beute; Rückweg nur über „Am Kontrollpunkt aufstehen“ = „Gibt den Kampf auf“.
2. Nr. 8: Endtruhe und Ausgang ins Dorf nicht gefunden; leuchtender Gegenstand reagiert nicht auf Rechtsklick.
3. Nr. 5: Söldner-Meldung und Fehlertext mitten über dem Kampf.
4. Nr. 4/9: PARIEREN ohne Taste; Block-Kniff (5) verlangt Schild.
5. Nr. 4: Ritt zeigt in den letzten Sekunden nur das Zitat statt einer Handlung; abgeschnittene Texte; Warnleiste verdeckt die markierten Bahnen.

## Nebenbefunde
- Karte (M) zeigt Beweise 0/3, Verfolgung zeigt 3/3.
- Chat-Reiter „Ereignisse“ und „Beute“ nicht anklickbar (Zeichenfläche fängt den Klick) – Todesbericht nicht lesbar.
- Söldner trugen den Kampf im Wesentlichen allein (96 % bis Sieg in ~3,5 min, davon ~1,5 min mit totem Helden); sie unterbrachen „Mein Anwalt ruft gleich an“ selbst.
- Rita und Peter blieben vor dem Kampf im Gang, während der Held schon im Saal war.
- Wegfindung per Rechtsklick über mehrere Räume funktioniert gut.
- Beim Spielstart liegt der Tooltip von „Autoangriff“ groß über dem Spielfeld (Maus über der Leiste).
- Sterbefenster verdeckt den Bossrahmen.
- Stufenaufstieg auf 11 kam, während der Held tot war.

## Ein Satz
„Ja – der Lügen-Nachsatz mit passender Bodenmarkierung ist der beste Kniff des Dungeons; aber nicht, solange ich nach dem Sieg tot auf dem Teppich liege und keine Beute sehe.“
