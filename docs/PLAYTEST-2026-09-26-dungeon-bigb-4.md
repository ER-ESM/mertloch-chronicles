# Playtest Prüfer · Big B als Heilerin, passiv (nach „Held aktiv“) · 2026-09-26

Persona: `pruefer-agent` (nur Browser). Live-Build #741 · `e822a101` · v0.20.0, Desktop 2024×900. Testheldin „Heilerin Vier“ (Bärbel,
Heilung `baerbel-care`, Stufe 10, typische Ausrüstung) über `playtest-save.mjs --preset=bigb --class=baerbel --spec=baerbel-care`. Söldner: Pils-Peter
(Schutz), Schorle-Susi (Heilung), Radler-Rita, Hopfen-Horst (Schaden); drei Beweise gefunden. Screenshots in
`D:\Dev\MertlochChronicles-dg-fix4\.playwright-mcp\page-2026-09-26T<Uhrzeit>.jpeg` (unten mit Uhrzeit).
Hinweis des Orchestrators: Während des Laufs ging ein Nur-Doku-Build #742 live; der Prüferin ist kein Neuladen aufgefallen.

**Kurzurteil: NACHBESSERN, Freigabe GESPERRT wegen Nr. 2.** Teil A (passiv) endete mit einem Sieg ohne die Heldin. Teil B (aktiv) entfiel deshalb.

## Urteile

| Nr | Versprechen | Urteil | Beleg |
|---|---|---|---|
| 1 | Big B wartet nach der Rede; erst eigener Angriff oder Herangehen startet; kein Söldner zieht | GEHALTEN | 12-39-36: „ANGREIFBAR IN 5,1 s“. 12-39-59/12-40-07: „bereit“, etwa 30 s kein Kampf. 12-40-28: erst nach eigenem Angriff „Wut in 4:47“, „Angefeuert“, „Die Tür fällt zu“. Die Beweise legte ein Rechtsklick-Laufweg in den Thronsaal ohne F vor |
| 2 | Passiv lohnt sich nicht (Söldner warten, Wut, ohne Heilung verloren) | **GEBROCHEN** | „Söldner warten“ nach 15–20 s, „Angefeuert“ weg (12-40-48). Trotzdem Big B 98 → 14 % bei Wut 1:04 (12-44-11), besiegt mit etwa 35 s Wut-Rest (12-44-42, „abgeschlossen in 6:04 min“). Null Heilung, zwei Tode |
| 3 | Aktiv: Angefeuert in Buffleiste, Bossrahmen, über den Söldnern | NICHT PRÜFBAR | Nur nach dem ersten Angriff: „Angefeuert“ im Bossrahmen, Megafon-Buff 6 s in der **eigenen** Buffleiste; kein Schriftzug über den Söldnern, kein Buff in ihren Rahmen (12-40-28) |
| 4 | Einsatz-Zeile mit Symbolen und Zahlen, Tooltip, Bonus-Siegelmarken | TEILWEISE | 12-44-59: sieben Symbol-Zahl-Paare (0 · 0 % · 0 · 10/21 · 2 · 6 % · –). Das Wort „Einsatz“ steht nur im Tooltip. Tooltip „Warnungen 14“ gegen „10/21“ in der Zeile; kein Feld „Ausweichen“, dafür „Angefeuert“. Ohne Tooltip nicht verständlich (12-45-17, 12-45-27, 12-45-33) |
| 5 | Nach dem Nachsatz ~2 s; bei beiden Seiten sichere Mitte markiert | TEILWEISE | Nach dem Nachsatz „STEHEN BLEIBEN · rechts …“ mit 0,1 bzw. 1,0 s Rest (Werkzeugverzögerung ~2,5 s). Rot/grün geteilter Boden. Die sichere Mitte bei beiden Seiten nicht im Bild; zweimal daran gestorben |
| 6 | Todesrückblick: Summe stimmt, gebündelt, Ursache richtig, Fenster oben | GEHALTEN | Σ 1.857 = 410 + 492 (8×) + 955; Ursache „Ritt auf der Kanonenkugel · 955“; Fenster 330 × 225 px oben (x 835–1165, y 137–382), verdeckt aber Thron, Big B und Tank |
| 7 | Truppenfenster ohne Scrollbalken mit Buffs | TEILWEISE | Kein Scrollbalken, keiner abgeschnitten; auf den Söldnerrahmen aber nie ein Buff-Symbol, auch nicht „Angefeuert“ |
| 8 | Heiler-Gefühl wie WoW | NICHT PRÜFBAR (Tendenz schwach) | Anwählen über Truppenrahmen klappt (12-46-06). Nur **Landhaus-Löffelkur** heilt ein gewähltes Ziel (1,3 s Zauber, 7,2 s Abklingzeit). Aperol-Nachsorge und Nest heilen nur „dich“; Hygiene-Handschuh ist eine Parade, Großreinemachen macht Schaden |
| 9 | Keine Textwände, nichts scrollt, Mitte frei | TEILWEISE | Nichts scrollt. Tooltips der Kniffe sind Textwände (Löffelkur ~20 Zeilen, Großreinemachen ~14). „Vorrat 0/8“-Leiste sitzt dauerhaft unten im Spielfeld (x 893–1105, y 668–718) über den Söldnern. Eigene Figur fast ganz hinter der rechten Thronsaal-Säule |

## Teil A (passiv)
- **Ausgang:** Sieg ohne Zutun. Einmal Taste 2 gedrückt, dabei sprang der Autoangriff an; mit Esc ausgeschaltet.
- **Dauer:** etwa 4:10–4:15 min Kampf, etwa 35 s Wut-Rest.
- **Lebensverlauf Big B:** 98 % (Wut 4:47) → 88 → 79 → 67 → 51 → 42 → 34 → 25 % (1:31, Geständnis) → 14 % (1:04) → tot.
- **Gruppenverhalten:**
  - Die Söldner unterbrachen den Anwalt selbst und töteten die Follower.
  - Schorle-Susi heilte den Tank und belebte die Heldin zweimal.
  - Der Tank fiel höchstens auf ≈ 41 %; kein Söldner starb.
- **Belohnung trotz Einsatz 0/100:** +4 Marken, +2.250 EP, Erfolg und Titel. Nur die Bonus-Siegelmarke fehlte.

## Befunde nach Schwere
**Blockierend:**
1. Passiver Sieg (Nr. 2).

**Störend:**
2. Die Heilerin hat nur einen gezielten Heilkniff, mit 7,2 s Abklingzeit.
3. Die Einsatz-Zeile ist nicht beschriftet, die Zahlen widersprechen sich (10/21 gegen „Warnungen 14“).
4. Die Kniff-Tooltips sind Textwände.
5. Die eigene Figur verschwindet hinter der rechten Säule im Thronsaal (12-40-48).
6. Der Todesrückblick verdeckt Big B und den Tank; nach dem Tod sind die Bodenmarkierungen nicht zu sehen (12-43-24).

**Kosmetik:**
7. Nach dem Aufstieg zeigt der Zielrahmen Pils-Peter mit „10“, der Truppenrahmen mit „11“ (12-46-06).
8. Die Heldenauswahl zeigt die Heilerin in Unterhemd und Shorts trotz typischer Ausrüstung (12-38-41).

## Nebenbefunde
- Ein Rechtsklick-Laufweg in den Thronsaal legte die Beweise ohne F vor.
- Der Autoangriff springt beim ersten Kniff an; Esc schaltet ihn aus, das Ziel bleibt gewählt.
- Zweiter und dritter Todesrückblick sind mit dem ersten bis auf die Kommastelle gleich (Σ 1.857, 410 / 492 / 955, −8,7 / −1,1 / −0,0 s). Entweder ist der Ablauf fest, oder der Rückblick wird nicht aktualisiert.
- Die Warnleiste zeigte „NACHSATZ ABWARTEN Kanonenkugel“ um 12:41:10 mit 8,4 s und um 12:41:26 mit 8,1 s. Entweder stand der Countdown, oder er wurde neu gesetzt.
- Nach dem ersten Tod schwebte „−955 Big B“ über Big B (12-43-44).
- Während die Heldin tot war, fehlte im Bossrahmen „Söldner warten“.
- Die Söldner-Wiederbelebung ist gut lesbar.

## Vergleich mit WoW
1. Gut: Truppenrahmen mit Lebenszahlen, Klick wählt das Ziel. Schlecht: keine Buffs, HoTs oder Debuffs auf den Rahmen.
2. Schlecht: ein einziger Heilzauber für andere, mit 7,2 s Abklingzeit.
3. Schlecht: Die Söldner-Heilerin trägt den Kampf allein, die Spieler-Heilerin ist verzichtbar. In WoW wipt eine Gruppe ohne Heiler vor dem Enrage.
4. Gut: Warnleiste mit Tasten und Countdown, Wut-Timer wie DBM. Schlecht: wenig Reaktionszeit nach dem Nachsatz, die eigene Figur ist schlecht zu sehen.
5. Gut: Todesrückblick wie der Death Recap. Schlecht: Einsatz-Auswertung ohne Spaltenbeschriftung.
