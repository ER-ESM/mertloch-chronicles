# Playtest 2026-09-24 · Runde 2 · Neuling (Build #429, 2024×900)

Persona `neuling-agent`, live, Gast ohne Konto, frischer Spielstand. 40 Aktionen. Heldenbau und Hofprobe ohne Hänger; erster Auftrag bei Ida angenommen, bei 0/3 Pfandkeilern abgebrochen (Budget). Screenshots: `D:\Dev\MertlochChronicles\visual-review\optimierung-2026-09-24\r2-spieler-01…10.png` (nicht im Repo).

## Ergebnis
Helden anlegen ERLEDIGT · Hofprobe ERLEDIGT · Erster Auftrag TEILWEISE (angenommen, per Klick auf den Auftragskasten losgelaufen, in Kämpfe geraten) · Menüs ERLEDIGT · Minikarte/Auftragsliste TEILWEISE. Etwa 5 von 40 Aktionen verschwendet.

## Hänger (schlimmste zuerst)

| Nr | Wo | Was passierte | Erwartet | Schwere |
|---|---|---|---|---|
| 1 | Erster Auftrag, Auto-Laufen | Klick auf den Auftragskasten lässt die Figur loslaufen, während Figur, Aufträge, Kniffe und Talente offen sind; die Figur steht in der Bildmitte unter den Fenstern; blind in ein Rudel gelaufen, „Im Kampf“ ohne die eigene Figur zu sehen | Fenster gehen beim Losgehen zu/weichen aus, oder Warnung „Gegner in der Nähe“ | bricht ab |
| 2 | Erster Kampf draußen | Nach Taste 1 war ein neutraler Pfanddachs das Ziel statt des angreifenden Keilers; Rechtsklick auf den Keiler setzt nur eine Laufmarke | Angreifer wird automatisch Ziel; Rechtsklick auf Gegner greift an (so steht es in der Hilfe) | stockt |
| 3 | Hofprobe 4/8 | Rechtsklick auf Papp-Horst schaltet nur den Autoangriff an, Figur bleibt hinter der Wand im Haus stehen | Rechtsklick auf ein Ziel läuft hin und haut zu | stockt |
| 4 | Hofprobe 4–5, Hof | Bude wechselt beim Laufen zwischen Innen- und Dachansicht; Figur mehrere Schritte unsichtbar hinter Papp-Horst | Figur immer sichtbar (Umriss, wenn verdeckt) | stockt |
| 5 | Auftrag annehmen | Übereinander: „Auftrag angenommen …“, „NEU FREIGESCHALTET · ERINNERUNGEN“ mit Erklärtext, „166 m“, Idas Sprechblase; vorher schon „Kampfstatistik“ und „UI bearbeiten“ – drei Freischaltungen in einer Minute | eine Meldung nach der anderen, Freischaltungen später | wundert sich |
| 6 | Hofprobe 5/8 Ausweichen | Roter Kreis beim ersten Mal weg, bevor man reagiert; dann „Papp-Horst hat keine Lust mehr auf Kreise“ – unklar, ob ausgewichen | klare Rückmeldung „Ausgewichen!“ / „Zu spät“ | wundert sich |
| 7 | Karte (M) | Liste voller Aufträge und 11 Lager-Nummern; verfolgtes Ziel „Pfandkeiler von den Trümmern“ nicht zu finden; Knopf heißt „Kisten-Ida auf der Karte“ statt „Ziel auf der Karte“ | verfolgtes Ziel hervorgehoben, Rest gedimmt | stockt |
| 8 | Banner oben mittig | „Neue Version · Neu laden“ ab dem ersten Bild, liegt über den Titelzeilen von Talente und Karte | beim Erststart kein Update-Hinweis bzw. verschwindet von selbst | wundert sich |
| 9 | Kniffe (P), Figur (C) | Kniffe nur Raster „St. 2/3/4 …“ ohne Namen; Werte Symbol+Zahl ohne Bedeutung; loses Schild „FERNKAMPF“ hängt zwischen den Fenstern; „noch kein Hauptbaum“ sagt nichts | Hover erklärt (nicht getestet); loses Schild darf nicht stehen bleiben | wundert sich |
| 10 | Esc / Talente-Knopf | Esc schließt nur ein Fenster je Druck; Talente-Knopf ausgegraut, N öffnet trotzdem | Esc schließt alle Fenster; ausgegraut heißt zu, oder nicht ausgegraut | wundert sich |

Kleinere Widersprüche: Auftragsliste sagt „wähle deine Spielweise“, Ida zugleich „ab Stufe 5“; Ausrufezeichen über Ida schwebt über einem Stuhl; Hofprobe-Belohnung „Eiskaltes Kaltgetränk“ zeigt rot „Benötigt Stufe 2“.

## Zu viel Text / Scrollen
- Idas Auftragsgespräch: zwei lange Absätze mit Scrollbalken, die Antwortknöpfe unter der Kante; Annehmen heißt „Erst hole ich die Hose, dann suchen wir die Wahrheit.“
- Hofprobe 4/8 in der Auftragsliste: sechs Zeilen plus Kleindruck – der Kleindruck hätte gereicht.
- Idas erster Dialog: acht Zeilen, sagt dasselbe wie der Knopf.
- Hilfe: lange Aufzählungen mit Scrollen; wichtigster Tipp („Klick auf den Auftragskasten läuft zur Wegmarke“) versteckt als vierte Zeile.
- Talente auf Stufe 1: zwei Hinweiszeilen, drei Reiter, drei Unterreiter, Suche.
- Aufträge (J): zweite Auftragskarte halb abgeschnitten, nur per Scrollen.

## Minikarte und Auftragsliste
Auftragsliste gut (aktueller Schritt mit Meterangabe, Klick läuft hin) – dass der Kasten klickbar ist, erfährt man nur aus der Hilfe; Hover-Tooltip groß über dem Spielfeld. Minikarte hübsch, aber Ziel und Laufrichtung nicht ablesbar; Orientierung nur über Meterzahl und Richtungspfeil im Spielfeld. Auftragsliste wird von Tooltips (Rucksack, Auftrag) und der Karte überdeckt.

## Gefallen
1. Heldenbau in drei klaren Schritten mit Bildern.
2. Hofprobe: jeder Schritt sofort erledigt, schnell drin.
3. Stimmung: Anmeldebild, Kneipe, Film „Filmriss.“, Pixelwelt mit Regen und Lichterketten.

## Bewertung (1–5)
Wusste, was zu tun ist: 4 · Wusste, was passiert ist: 2 · Wollte weiterspielen: 4.

## Ein Satz an die Entwickler
„Wenn meine Figur losläuft oder angegriffen wird, müssen die offenen Fenster zugehen (oder zur Seite gehen) und der Angreifer automatisch mein Ziel werden. Heute laufe ich unter einer Fensterwand blind in ein Keilerrudel.“
