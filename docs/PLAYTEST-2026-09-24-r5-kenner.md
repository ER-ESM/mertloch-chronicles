# Playtest 2026-09-24 · Runde 5 · Kenner – Endurteil (Build #542 · f81cda6, 2024×900)

Persona `kenner-agent`, live, vorbereiteter Spielstand „Dieter“ (Stufe 4, Tresenbrecher, Hofprobe erledigt). 50 Aktionen. Vier Aufträge angenommen (Ida, Olli ×2, Nyalol), einer abgegeben („Pitch bei der Bauleitung“, Botengang), drei Kills, ein Tod. Stufe 4 blieb (160/560 EP). Screenshots `visual-review/optimierung-2026-09-24/r5-spieler-01…08` (nicht im Repo).

**Endurteil:** „Ja, die Oberfläche fühlt sich jetzt wie ein MMO an – Tracker, Karte, Leiste, Tooltips und Fenster sitzen, wo ein Genre-Spieler sie sucht. Was fehlt, ist der Fluss von Gegner zu Gegner, und Tooltips und Fenster decken zu oft die eigene Figur zu.“

## Top 10

| Nr | Wo | Was passiert | Erwartet (WoW) | Schwere |
|---|---|---|---|---|
| 1 | Weltkarte „Hinlaufen“ | Auto-Laufweg führt direkt an Pfandkeiler heran; mit C/I/J/P offen griffen Keiler + „Kumpel kommt“ an; in ~10 s von 640 Leben tot; kein Todesbildschirm, nur Statuszeile „Du wachst schon wieder bei St. Gangolf auf“, 113 m zurück | Click-to-Move bricht bei Aggro ab; „Du bist gestorben“ unübersehbar | bricht ab |
| 2 | Auftragszählung | Getöteter „Pfandkeiler“ mit „!“ an der Plakette zählt weder für „Pfandkeiler von den Trümmern jagen 0/3“ noch für „Absperrband (von Pfandkeiler) 0/6“; nirgends steht, welcher Keiler zählt oder dass es eine Dropchance gibt | Gegner-Tooltip „Auftrag: 0/3“, Auftragsgegner klar markiert | stockt |
| 3 | Tooltip der Kniff-Leiste | Tooltip von Slot 7 erscheint in der Bildmitte auf der Figur; beim Start hing ein Autoangriff-Tooltip auf dem Erinnerungs-Dialog | Tooltip an der Leiste verankert, nie auf dem Helden | stockt |
| 4 | H + N offen | Hilfe liegt über der Bildmitte, Figur unsichtbar (C/J/P/I zugleich klappt gut) | Fenster lassen die Mitte frei | stockt |
| 5 | Nach dem Kill | Taste 2 → „Kein passendes Ziel in direkter Nähe“; Tab wählt, meldet aber „Zu weit entfernt · 23 m“; Rechtsklick auf laufenden Dachs daneben; nach jedem Kill Stillstand | Tab + Rechtsklick auf Plakette laufen zuverlässig an; dichtere Gegner | stockt |
| 6 | Kein Zauber-Puffer | Taste 7 direkt nach 6 (in der GCD) stumm verschluckt | ~400 ms Puffer für den nächsten Kniff | stockt |
| 7 | „Sprung – ausweichen“ | Leertaste ausgelöst, roter Kreis bleibt um die Figur zentriert, trotzdem getroffen (679 → 491); unklar, wohin ausweichen | Bodenmarke bleibt am Aufschlagort, man läuft heraus | wundert sich |
| 8 | Auftragspfeil „xx m“ | Pfeil klebt neben der Figur und überdeckt Gegner-Plaketten („77 m“ auf dem Dachs) | am Bildrand/an der Minikarte | wundert sich |
| 9 | Auftrag abgeben | nur Protokollzeile „Abgegeben: … · +70 EP“ und EP-Balken; „Auftrag angenommen“ steht dagegen groß mittig | „Auftrag abgeschlossen“ mittig, Belohnungsdialog, Klang | wundert sich |
| 10 | Figur in der Welt | Figur oft halbtransparent unter Baumkronen; mehrfach blass/farblos ohne Kleidungsfarben, dann wieder normal | Umriss hinter Verdeckungen, stabile Farben | wundert sich |

Kleiner: Anmeldebildschirm liegt über dem geladenen Spiel · In der Heldenauswahl hat „+ Neuer Held“ den Fokus statt „Ins Dorf“ (Enter legt neuen Helden an) · Stufe-4-Held bekommt von Ida den Einführungsauftrag, Nyalol sagt „Stufe 1, kein Gear“ · Hilfe nennt „L = Aufträge“, Knopf sagt J; „U“ doppelt belegt (Kampfstatistik und Söldner) · Gebietsbanner „KUMPEL KOMMT“ und „IM THÜRIG“ überlappen · Zielrahmen bleibt nach dem Weglaufen auf Hotfix-Olli · „!“ schwebt ~80 px über dem NPC, Rechtsklick darunter traf den falschen NPC · Mausrad Minikarte und Weltkarten-Filter nicht getestet.

## Gut
1. Weltkarte: Legende mit Distanzen und „Hinlaufen“ je Eintrag; Symbol-Tooltip „Verfolgtes Ziel · 77 m · Route zeigen / ⇧ + hinlaufen“ – Genre-Niveau.
2. Kampf-Rückmeldung: große Zahlen, „270 RESONANZ“, „IN FAHRT“, Abklingzahl auf dem Knopf, Gegnerzauber im Zielrahmen und am Boden.
3. Tooltips inhaltlich (Kniff mit Kosten/Reichweite/Abklingzeit/Waffe; Schrotthaufen „Benötigt Schrottsammeln (1) · Beruf noch nicht gelernt · Erntereif“); C/J/P/I sauber nebeneinander, Esc schließt alle.

## Messung
- Fluss: nach allen drei Kills Stillstand (nichts in Reichweite, Taste 2 „Kein passendes Ziel“, Rechtsklick daneben).
- Rotation ab Kill 2 klar: 6 → 7 → 2 → 2, Autoangriff 1, Leertaste, Q. Stört: kein Zauber-Puffer, Tab läuft nicht an, Ausweichen ohne erkennbare Wirkung.
- Unklare Begriffe: Randale, In Fahrt, Resonanz, Kniffe, Pfandmarken, Aggro-Radius R, Söldner.
- Klickpfad: jedes Fenster 1 Taste; Laufen zum Ziel über die Karte 2 Aktionen.
- Bewertung: Was tun 4 · Was passiert 2 · Weiterspielen 4 · Fluss 2.

## Ein Satz an die Entwickler
„Legt Tooltips und Hilfe weg von der Bildmitte, stoppt ‚Hinlaufen‘ bei Aggro und zeigt am Gegner, ob er für den Auftrag zählt – dann spielt sich das wie ein richtiges MMO.“
