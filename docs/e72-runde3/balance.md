# E-72 Runde 3 · Balance der neuen Klassen (Kürzel: balance)

Branch `e72-balance`, Messung: `npm run balance:sheet` (content/BALANCE-SHEET.md). Die Werte der alten Klassen (Dieter, Bärbel, Kevin) sind unverändert (größte Abweichung eines Messwerts 0,00 %).

## Ergebnis

| Klasse | ⚑ vorher | ⚑ nachher |
|---|---:|---:|
| Dieter | 100 / 180 | 97 / 180 |
| Bärbel | 71 / 180 | 71 / 180 |
| Kevin | 36 / 180 | 23 / 180 |
| Schorsch | 102 / 180 | 36 / 180 |
| Käthe | 70 / 180 | 46 / 180 |
| **gesamt** | **379 / 900** | **273 / 900** |
| Anteil ⚑ alte Klassen | 38,3 % | 35,4 % |
| Anteil ⚑ neue Klassen | 47,8 % | 22,8 % |

| Spezialisierung | ⚑ vorher | über ±25 % vorher | größter Ausreißer vorher | ⚑ nachher | über ±25 % nachher | größter Ausreißer nachher |
|---|---:|---:|---|---:|---:|---|
| schorsch-chef | 43 | 40 | +88 % (Pfad 0, St. 15, episch) | 20 | 5 | −37 % (Pfad 1, St. 5, Start) |
| schorsch-flamme | 33 | 25 | +55 % (Pfad 1, St. 30, selten) | 10 | 0 | +24 % (Pfad 0, St. 30, episch) |
| schorsch-rauch | 26 | 10 | +30 % (Pfad 1, St. 20, Start) | 6 | 0 | +19 % (Pfad 1, St. 10, ungew.) |
| kaethe-grand | 16 | 4 | +30 % (Pfad 1, St. 30, Start) | 10 | 0 | +25 % (Pfad 2, St. 30, Start) |
| kaethe-herz | 40 | 34 | +101 % (Pfad 0, St. 5, selten) | 28 | 5 | +36 % (Pfad 0, St. 10, Start) |
| kaethe-falsch | 14 | 0 | −22 % (Pfad 0, St. 20, selten) | 8 | 1 | +25,3 % (Pfad 1, St. 30, episch) |

**Ziel nicht ganz erreicht:** 11 von 360 Zellen der neuen Spezialisierungen liegen noch über ±25 %, alle in der Heilung außer einer.
Betroffen sind Grillhütten-Chef Stufe 5 ohne Ausrüstung (−30/−37 %), Stufe 15/20 ohne Ausrüstung (−26/−27 %) und Pfad 1 Stufe 30 episch (+26 %),
dazu Kartenlegerin Pfad 0 (Stufe 10/30 ohne Ausrüstung +33/+36 %, Stufe 5 episch +30 %, Stufe 10 selten +25,1 %), Pfad 2 Stufe 5 episch (+27 %) und Falschspielerin Pfad 1 Stufe 30 episch (+25,3 %).
Die übrigen Ziele sind erfüllt: Der Anteil der ⚑ liegt bei den neuen Klassen unter dem der alten, und die ⚑ der alten Klassen sind nicht gestiegen.

## Schwächster Punkt: die Heiltabelle lässt sich mit Zahlen allein nicht glätten

1. **Heilung und Schilde der neuen Klassen hängen am Maximalleben.** Betroffen sind Bratwurst, Nachheilung, Senf, Ablöschen, Herz-Karten, Handlesen, Grillkäse und Pik.
   Damit wächst Heilung mit Standfestigkeit und Bastelgrips zugleich, was E-53 widerspricht (dort gilt: eine Mechanik, ein Wert). Von Start- zu epischer Ausrüstung
   steigt die Heilung des Chefs auf das Vierfache, die der alten Heiler auf das 1,0- bis 2,4-Fache.
2. **Das Sheet zählt Überheilung, die alten Heiltasten sind bei vollem Leben aber gesperrt.** Wurst, Herz-Karten und Handlesen der neuen Heiler zünden
   dagegen immer. Ein Heiler, der Schaden als Deckung verhindert (Kartenlegerin Pfad 1 „Pik-Schutz“), heilt dadurch weniger, und Deckung zählt in der Heiltabelle nicht.
   Dasselbe gilt für Pfad 0 im Vergleich zu Pfad 1 ohne Ausrüstung.
3. **Schutz/s zählt geschluckten Schaden doppelt**, einmal als verhinderter Schaden und einmal als Deckung. Mit Ausrüstung schluckt der Käse-Schild jeden Treffer,
   deshalb liegt der Räuchermeister auf Stufe 5/10 mit Ausrüstung am Deckel (+17 bis +19 %).

Empfehlung für den Orchestrator bzw. Nutzer: Heil- und Schildmengen der neuen Klassen vom Grundleben der Stufe statt vom Maximalleben
ableiten (Codeänderung in class-resources.js, dazu die Texte „% des Maximallebens“ anpassen). Außerdem sollte das Sheet effektive Heilung neben
der Ausstoß-Heilung zeigen. Beides liegt außerhalb dieses Auftrags („nur Zahlen“).

## Rotation repariert (scripts/balance-rotation.mjs, nur Zweige `grill`/`cards`)

| Befund | Reparatur |
|---|---|
| Käthe: Die drei Handplätze haben keine Abklingzeit, deshalb spielte die Rotation immer eine Karte. Eierlikörchen, Kartenregen/Legekreis, Handlesen, Reizen und Gezinkte Karten fielen **nie**. | Heilen wie die allgemeine Liste (Heilerin zuerst, sonst unter 60 %). Kartenregen/Legekreis und Handlesen auf Abklingzeit, Reizen kurz vor 61/90 Augen, Gezinkte Karten, wenn die erste Karte passt. |
| Kartenlegerin spielte Herz nur bei weniger als 60 % Leben, der Chef serviert dagegen jede gare Wurst. | Die Heilerin spielt Herz zuerst. |
| Schorsch: Spiritus-Schwall (nur unter 60 Glut sinnvoll) fiel nie, Senf drauf! und Deckel zu! fielen fast nie, weil die allgemeine Liste erst über 84 Glut griff. | Beide stehen im Grill-Zweig: Senf, sobald etwas auf dem Rost liegt, Deckel zu!, sobald ein Gegner im Umkreis steht, Spiritus bei höchstens 55 Glut. |
| Räuchermeister wurde wie der Flambierer gespielt (Zange bis 84, Blasebalg unter 35), die Kernmechanik „unter 45 Glut räuchern“ lief fast nie. | Eigener Zweig: Zange nur bis zur Räuchergrenze, Glutbrocken und Ablöschen kühlen, Blasebalg nur vor dem Räucherofen (der kostet 30 Glut). |
| Grillhütten-Chef stellte sein Buffet erst ab 72 Glut auf. | Buffet auf Abklingzeit, sobald 30 Glut da sind. |

## Gefundene Fehler (nicht nur Zahlen)

- **`applyTuning` mischt nur eine Ebene.** `rauch:{smoke:{weaken}}` löschte Radius und Dauer des Rauchs, deshalb fiel **Rauch beim Servieren nie**.
  `flamme:{splash:{share}}` löschte den Radius, deshalb trafen **Feuerspritzer beim Flambieren nie**. Behoben: Die Tuning-Zeilen tragen jetzt das ganze Objekt.
  Test dazu in `tests/e72-balance.test.mjs`. **Offen, alte Klasse:** `kevin-fuse` hat seit dem Tuning `fuse.explode` ohne `radius` (Lunten-Explosion ohne Umkreis).
  Nicht angefasst, weil das die Werte der alten Klassen verschöbe (Regel „fremde Extension nicht mitreparieren“ sinngemäß).
- **Schadensmesser:** Unbekannte Schadenslabels (Kreuz, Karo, Abrechnen, Servieren, Popcorn, Schwenkgrill …) landen alle in *einem* Topf „other“, der den
  Namen des ersten Labels trägt. Die Zerlegung im Sheet („Kreuz 90 %“, „Schwenkgrill 80 %“) ist für Schorsch und Käthe deshalb irreführend, und das
  Schadensmeter im Spiel zeigt denselben Fehler (`combat-meter.js` `recordMeterDamage`). Nicht behoben.
- **Übungspuppen zaubern nicht** (Betäubung 1e9). Stich-, Kontra- und Paraden-Talente (Falschspielerin Pfad 0, Halloumi-/Glutnest-Paraden) messen deshalb 0 %.
  Das betrifft alte Klassen genauso. Die Falschspielerin Pfad 0 liegt deshalb bei −6 bis −17 %.
- Die Kit-Texte „Bratwurst heilt 50 % stärker“ (Chef) und „50 % mehr Wirkung“ (Flambieren) passten schon vorher nicht zu den getunten Werten. Sie nennen jetzt 15 bzw. 30 %.

## Hebel (je eine Zeile)

| Hebel | vorher → nachher | Warum |
|---|---|---|
| Käthe · Kartenregen/Legekreis Abklingzeit (skills.js) | 16 → 24 s | fällt jetzt in der Messung; mit ihm lagen Null ouvert/Ärmel bei +35 bis +70 % |
| Käthe · Abrechnen je Auge fest / Waffe | 2,7 / 0,04 → 1,4 / 0,095 | war zu 90 % fest und wuchs kaum mit der Waffe: ohne Ausrüstung +25 bis +30 % |
| Käthe · Farbkette je Glied | 25 → 20 % | Gezinkte Karten und große Hände bauen jetzt lange Ketten |
| Käthe · Luschen mit „Flinke Finger“ | 0,5 → 0,85 s | Null ouvert/Ärmel spielten Luschen im Halbsekundentakt |
| Käthe · Herz-Karte heilt | 13 → 11 % Maximalleben | Heiler-Median |
| Käthe · Handlesen je Sekunde (neu als Wert in resources.js) | 2 → 1 % | Pfad Herzdame +50 bis +60 % |
| Gezinkte Karten Abklingzeit (skills.js) | 24 → 32 s | Pfad Ärmel +35 % |
| Unter der Hand / Null ouvert Hand / Durchmarsch | 5. Karte −3 s / sofort / 20 % → 8. Karte −1 s / −3 s / 10 % | Kartenregen-Schleife (jede Regenkarte zählt als ausgespielt) |
| Falsch abgerechnet / Nachgesteckt / Kreuz-Dame | sofort / −4 s / 15 % → −2 s / −2 s / 10 % | Pfad Ärmel |
| Kleine Fische / Grand Hand / Pfadbonus Grand 7 | 20 / 25 / 15 % → 10 / 15 / 10 % | Pfade Null ouvert/Grand |
| Kartenlegerin · Herz-Bonus / Heilfaktor | 60 % / 1,3 → 20 % / 1 | Rotation spielt jetzt Herz zuerst, Legekreis und Handlesen |
| Kartenlegerin · Rote Dame, Das Herz …, Farbe halten, Nachschenken, Warmer Eierlikör, Rote Rechnung, Kaffeefahrt, Sterne lesen | kleiner (Texte mitgezogen) | Pfade Herzdame/Wahrsagen |
| Die Karten lügen nie | jedes Abrechnen −8 s → jedes zweite Abrechnen −2 s | Legekreis-Schleife in Pfad Wahrsagen |
| Pfadbonus Herzdame / Wahrsagen | Herz +15 % / Kette +10 % → Nachheilung 2 / Kette +3 % | Pfadspreizung |
| Schorsch · Grillzange | +12 → +14 Glut | ohne Ausrüstung und ohne Blasebalg (bis Stufe 5) erreichte der Chef den goldenen Bereich nie |
| Schorsch · „Gute Glut“ gart | ×1 → ×1,25 | dito, hilft ohne Ausrüstung mehr als mit |
| Schorsch · Bratwurst / Nachheilung / Grillkäse | 12 % / 6 s / 8 % → 9 % / 1 s / 6 % | am Maximalleben, wuchs doppelt mit Ausrüstung |
| Chef · Wurst-Bonus / Buffet / Heilfaktor | 25 % / 14 / 0,8 → 15 % / 10 / 1 | Buffet steht jetzt auf Abklingzeit |
| Chef · Pfadbonus Beilagen / Stammkundschaft | Garen +10 % / Ablöschen +4 % → Garen +10 % und Bratwurst +50 % / Ablöschen +2 % | Käse und Mais verdünnen den Grillplan (40 % statt 67 % Würste) |
| Chef · Metzgerqualität, Meisterwurst, Hausmacher, Löschbier, Lokalrunde | kleiner (Texte mitgezogen) | Pfade Wurstbude/Stammkundschaft |
| Senf drauf! Abklingzeit (skills.js) | 20 → 24 s | heilt fest 10 % Maximalleben, Pfad Beilagen episch +26 % |
| Flambierer · Faktor / Stichflamme | 0,78 / ×1,3 → 0,74 / ×1,2 | Pfad Stichflamme ab Stufe 10 bei +30 % |
| Flambierer · Feuerring, Pfadbonus Stichflamme, Nachglühen, Feuerteufel, Zunder, Hitzewelle | 15 %, 15 %, 25, 20, 10, 20 → 10 %, 5 %, 10, 10, 5, 10 | Glutzufuhr hielt Pfad 0 dauernd „zu heiß“ (+35 %) |
| Spanferkel-Wurf · Nachbarn (neu als Wert `RESOURCES.schorsch.cleave`) | 50 → 20 % der Wucht, +10 % Braten entfällt | Pfad Schwenkbraten sprang auf Stufe 15 von +10 auf +40 % |
| Fleischklopfer / Grillteller / Pfadbonus Schwenkbraten | Braten +12 / +10 / +10 % → +6 / +5 % / Garfenster +5 % | dito |
| Räuchermeister · Rauch-Schwächung / Räucherofen | 15 % / 10 s → 30 % / 12 s | Tank-Deckel mit Ausrüstung (s. o.), ohne Ausrüstung mehr Schutz |
| Käsekruste / Halloumi-Panzer / Pfadbonus Halloumi | 10 / 15 / 15 % → 5 / 10 / 5 % | „Halloumi-Ausreißer“ ohne Ausrüstung +30 % |
| `content/checks/balance.js` | `TUNING.resources` war nicht geprüft/erlaubt | Ressourcen-Tuning mit ID-, Zahlen- und why-Prüfung |

Stufe 1 hat sich leicht mitbewegt, weil Grillzange, gute Glut und Herz-Heilung klassenweite Werte sind: Schorsch −6 bis +4 %, Käthe Schaden −3 bis 0 %,
Käthes Eigenheilung auf Stufe 1 −17 %. Keine dieser Zellen ist ⚑.

## Offen

- Heilung: siehe „Schwächster Punkt“. Ohne die Umstellung aufs Grundleben bleiben der Chef auf Stufe 5 ohne Ausrüstung schwach und die Kartenlegerin Pfad 0 ohne Ausrüstung stark.
- Tank mit Ausrüstung auf Stufe 5/10 (+17 bis +19 %): Schutz/s zählt doppelt, und Paraden fehlen in der Messung.
- Falschspielerin Pfad 0 und Parade-Talente sind nicht messbar, solange die Puppen nicht zaubern.
- Kevins Lunten-Explosion ohne Radius (applyTuning-Falle) und die Label-Sammlung im Schadensmesser sind gemeldet, aber nicht behoben.
- Messwerkzeuge der Runde liegen nur im Scratchpad (Sonde je Label, Teilraster mit Patches, Gitter). Bei Bedarf bitte als `scripts/balance-probe.mjs` übernehmen.
