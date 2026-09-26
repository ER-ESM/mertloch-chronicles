# Playtest Prüferin · Big B als Heilerin nach Fix 6, Figuren und Heiler-WoW · 2026-09-26

Persona: `pruefer-agent` (nur Browser), Live-Build #770 · `87a9466b` · v0.20.0, Desktop 2024×900. Testheldin „Heilerin Fuenf“ (Anni/Bärbel,
Heilung `baerbel-care`, Stufe 10, typische Ausrüstung) über `playtest-save.mjs --preset=bigb --class=baerbel --spec=baerbel-care`. Söldner: Pils-Peter
(Schutz), Schorle-Susi (Heilung), Radler-Rita, Hopfen-Horst (Schaden). Drei Beweise, Rita liegt, also Wut nach 3:35.
Screenshots: `.playwright-mcp\page-2026-09-26T<Uhrzeit>Z.jpeg` (unten mit Uhrzeit).
Hinweis des Orchestrators: Teil B war nur mit einem zweiten Testhelden möglich. Der Laufstand erlaubt nach einem Sieg keinen neuen Versuch, das ist ein Planungsfehler des Orchestrators und kein Spielfehler.

**Kurzurteil: NACHBESSERN, Freigabe GESPERRT wegen 1a.** Die passive Gruppe gewann; Teil B (aktiv) war danach nicht mehr spielbar.

## Urteile

| Nr | Versprechen | Urteil | Beleg |
|---|---|---|---|
| 1a | Passiv verliert | **GEBROCHEN** | Etwa 20 s Autoangriff zu Beginn (Angefeuert), danach nichts. Boss 4 % bei „Wut ×4“, Tank und Söldner-Heilerin tot, Rita und Horst mit „ALLES ODER NICHTS“ (17-22-47). Danach „Big B besiegt“, „abgeschlossen in 4:55 min“ (17-23-03) |
| 1b | „Söldner warten“ und Wut-Tooltip mit Grund | GEHALTEN | 17-19-36; Wut-Tooltip „Nach 3:35 min … Früher als 4:50: Rita liegt −0:50 · Kirmes-Urkunde −0:25“ (17-19-30) |
| 2a/2b | Aktiv gewinnt, die Heilerin wird gebraucht | NICHT PRÜFBAR | Nach dem Sieg kein Neustart |
| 2c | Söldner zeigen „Angefeuert“ | GEHALTEN | Schriftzug, Megafon auf allen vier Rahmen, Bossrahmen (17-18-56); nach 6 s „Söldner warten“ (17-19-22) |
| 3a | Fünf Heilwerkzeuge | GEHALTEN | Feuchttuch 1,5 s ohne Abklingzeit, Heilt 170 (17-24-12). Löffelkur, Heilt 453 (17-24-34). Aperol-HoT 28/s 12 s (17-24-18). Nest, Gruppe 25/s 12 s (17-24-40). Riechsalz, Heilt 315 und −40 % Schaden (17-24-46) |
| 3b | Gewähltes Ziel bzw. Mouseover bekommt die Heilung | GEHALTEN (außerhalb des Kampfes) | 17-25-30, 17-25-44 |
| 4 | HoT und Angefeuert auf den Rahmen, nichts scrollt | GEHALTEN | 17-25-30, 17-18-56. Einen Schild für andere hat Anni nicht |
| 5 | Kurze Tooltips | TEILWEISE | Die Kniff-Tooltips sind knapp. Aber: Die Kostenzeile der Löffelkur bricht um (17-24-34). Der Gegenstand „Notfallbrezel“ hat einen langen Block mit **leeren Werten** („Abklingzeit … s“, „Heilung … Leben“, „Stapel … Stück“) (17-26-34). Die Umschalt-Details ließen sich mit dem Werkzeug nicht zeigen |
| 6 | Klassenanzeige auf der Aktionsleiste | GEHALTEN | 17-18-10, 17-21-55 |
| 7a | Beschriftete Einsatz-Zeile | TEILWEISE | „EINSATZ 0 · 0 % · 0 · 6/20 · 0 · 2 · 11 % · –“: Nur „Einsatz“ ist beschriftet. Im Sammel-Tooltip fehlt „Ausweichen“ (17-23-24) |
| 7b | Bonus-Siegelmarken | NICHT PRÜFBAR | Tooltip „Kein Einsatz-Bonus …“ (17-23-48) |
| 7c | Zahlen passen | GEHALTEN | Gekappt bei 0, „6/20“ in Zeile und Tooltip gleich |
| 8 | Figuren | TEILWEISE | Krone, Perücke, bodenlanger Pelz (17-18-44, 17-21-02). Big B ist aber **so groß wie die Spielerfiguren** und wirkt ohne Namensschild und Totenkopf kaum wie ein Boss. Follower gehen im Getümmel unter; Posen nicht beobachtbar |
| 9a | Säule wird durchsichtig | GEHALTEN | 17-20-52, 17-26-34 |
| 9b | Todesfenster neben dem Bossrahmen | GEHALTEN (Einschränkung) | Beim zweiten Tod neben dem Bossrahmen (17-22-47). Beim **ersten Tod kein Fenster**, nur „Du liegst. Deine Söldner kämpfen weiter.“ (17-22-19) |
| 9c | Todesliste = Summe | GEHALTEN | Σ 494 = 410 + 2× 84 |
| 10 | Allgemein | GEHALTEN (Kosmetik) | Mitte frei; einzige Textwand ist der Notfallbrezel-Tooltip |

## Teil A (passiv)
- **Einstieg:** Beim Betreten des Thronsaals werden die Beweise automatisch vorgelegt, dazu „Angreifbar in 9 s“ und die Rede. Ein **Rechtsklick auf den Boden bei Big B schaltete während der Rede „Autoangriff an“** (17-18-44). Um 17:19:17 hat die Prüferin ihn ausgeschaltet, danach nur Ausweichen.
- **Dauer:** Kampf etwa 17:18:53–17:22:55 (≈ 4 min).
- **Verlauf des Bosslebens:** 100 % (Wut 3:34) → 83 % (3:08, „Söldner warten“) → 73 → 67 → 56 → 48 → 26 % (0:34, Geständnis) → 17 % (0:11) → 4 % (Wut ×4) → tot.
- **Gruppe:** Peter hielt bis 26 % (nie unter ≈ 870/1.962). Susi heilte und belebte die Heldin einmal. Unter Wut starben Peter und Susi; Rita und Horst schafften mit „ALLES ODER NICHTS“ die letzten 4 %.
- **Einsatz:** 0 von 100.

## Befunde nach Schwere

**Blockierend:**
1. Die passive Gruppe besiegt Big B: Unter Wut ×4 halten zwei Schadenssöldner mit dem Letzten Aufgebot durch (17-22-47, 17-23-03).

**Störend:**
2. Tooltip der Notfallbrezel mit leeren Werten und Textblock (17-26-34).
3. In der Einsatz-Zeile sind sechs von sieben Feldern unbeschriftet, „Ausweichen“ fehlt im Tooltip (17-23-24).
4. Beim ersten Tod kein Todesfenster (17-22-19).
5. Ein Laufklick startet den Autoangriff noch während der Rede (17-18-44).

**Kosmetik:**
6. Die Kostenzeile der Löffelkur bricht um.
7. Der Satz „Mit dir im Kampf liegt er vorher“ im Wut-Tooltip ist missverständlich.
8. Big B hat Spielergröße.

## Vergleich mit WoW
1. In WoW verliert eine Gruppe ohne Heiler sicher am Endboss; hier ist die Spieler-Heilerin verzichtbar.
2. Die Truppenrahmen wie Raid-Frames sind gut (anklicken, Mouseover, HoT-Symbole).
3. Das Heilwerkzeug entspricht WoW; echte Schilde auf andere fehlen.
4. Die Warnleiste ist auf DBM-Niveau, der Nachsatz-Trick ist eigenständig.
5. Der Todesrückblick ist wie der Death Recap. Anders als in WoW ist die Wut kein harter Wipe, und der Boss ist nicht größer als die Spieler.
