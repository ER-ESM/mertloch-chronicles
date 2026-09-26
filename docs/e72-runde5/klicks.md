# E-72 Runde 5 · klicks (Kenner-Nachtest 26.09. nachts, Bedienfehler aller Klassen)

Branch `e72-klicks`. Tests: `tests/e72-klicks.test.mjs` (7). Browser: `node scripts/e72-klicks-check.mjs [leiste,karte,intro,stempel,meldung] [--width=2024] [--soft]`
(Ports 4471/9871, echte CDP-Maus-/Tastenereignisse; `--soft` = Vorher-Messung am alten Stand, zählt Fehlschläge statt abzubrechen). Bilder: `docs/e72-runde5/klicks/`.

| # | Befund | Ursache (gemessen) | Änderung |
|---|---|---|---|
| 1 | Linksklick ins Feld öffnet Kniffe-Buch (⇧0) | Leere Plätze einer belegten Zusatzleiste waren nur `opacity:0` und fingen Klicks; die Leistenzone (`.action-area`-Gitter) und die Platte einer ganz leeren Zusatzleiste schluckten Klicks ganz. Alter Stand: 161–483 Fangpunkte je Klasse/Leistenzahl, Klick auf ⇧0 öffnete bei allen 5 Klassen das Buch. | `spielfluss.css`: nur sichtbare Knöpfe fangen (Desktop); leere Plätze erst beim Ziehen (`bar-drop`), bei offenem Kniffe-Buch oder beim Tastenbelegen (`bar-edit`, dann schwach sichtbar, `app.js updateUI`). Handy unverändert. Hover + B auf einem *unsichtbaren* Platz geht nur noch im Bearbeiten-Modus (`scripts/aktionsleisten-check.mjs` angepasst, 12/12). |
| 2 | Rechtsklick verschluckt bei/nach Erinnerungskarte; Karte + Bild-Tooltip gestapelt | Rechtsklick in die freie Welt lief schon; verschluckt wurde er AUF der Karte (liegt über der Welt, 300×380 px) und direkt nach dem Schließen, weil die nächste Karte sofort unter die Maus sprang. Erschien die Karte unter der ruhenden Maus (Aufwachen/Teleport), kam ihr Bild-Tooltip gleich mit. | `memory-card.js`: Rechtsklick auf die Karte → Welt-Handler (Laufen/Angreifen/Ansprechen); Tooltips der Karte schlafen bis zur ersten echten Mausbewegung über ihr; Tooltip geht beim Zurücktreten/Schließen sofort. `app.js`: nach dem Schließen Ruhezeit (1,5 s) vor der nächsten Karte. `popup-controls.js`: Tooltip geht auch, wenn sein Träger unsichtbar wird. |
| 3 | Esc im Film erst beim zweiten Mal | Im laufenden Film wirkt der erste Esc (100 ms/1,5 s nach dem ersten Bild gemessen). Verloren ging jedes Esc zwischen „Held erstellen“ und Filmbeginn (0–4,5 s): alte Seite, die ersten ~300 ms der neuen Seite (vor jedem Modul) und der Ladeschirm. Mit Werkzeug-Verzögerung sieht es aus wie „im Film ignoriert“. | `index.html`: Hörer ganz oben im Kopf (`__bootEsc`); `loading-screen.js`: `bootEscaped()`, `carryEscape()` (Esc während des Anlegens → sessionStorage, schluckt „Zurück“); `start-screen.js` scharf beim Anlegen; `app.js`: automatisches Betreten nach Neuladen → `intro.start({skip})`; `intro-ui.js`: skip = gesehen, Ida kommt. |
| 4 | „Naturtalent“/„Der Stempel“ bei jedem neuen Helden | Fetzen hängen am Heldenspielstand. | Browserweit gemerkt (`mertloch-memory-popups`, `memory-card.js`), zusätzlich gilt ein Fetzen als bekannt, wenn ein anderer Held dieses Browsers ihn kennt (Spielstände vor dem Merker). Bekannt → still freischalten, keine Karte, keine Kurzmeldung; nachlesbar unter Aufträge → Erinnerungen. Gilt für alle Fetzen (auch „Wurst Case“). |
| 5 | „… muss noch verschnaufen · 0,7 s“ laut | Große rote Kurzmeldung (22 px, #ff5040), ersetzte sofort jede goldene Meldung, bei jedem Druck. | Engine markiert „zu früh“ (Abklingzeit, GCD, wirkt schon, Verbrauchsgut) mit `early`; `error-line.js`: kleine Zeile (16 px, gedämpftes Rot, kein Kasten) unter der Kurzmeldung, je Kniff höchstens alle 2 s (`COMBAT_FLOW_TUNING.earlyFail`), blendet nach 1,3 s aus, nie im Chat. Andere Ablehnungen bleiben rote Kurzmeldungen. |

Vorher/nachher (alter Stand = main d9fc487f, gleiches Prüfskript mit `--soft`, 1600×900):
- leiste: vorher bei allen 5 Klassen × 2/3/4 Leisten Fangpunkte im Band, Klick auf ⇧0 öffnete das Buch („Platz [⇧0] gewählt“) – nachher 0 Fangpunkte, Klick geht in die Welt.
- karte: vorher Rechtsklick auf die Karte 0/2, direkt nach dem Schließen 1/3 (nächste Karte sprang sofort unter die Maus), Bild-Tooltip kam mit der Karte unter der ruhenden Maus – nachher 2/2, 3/3, kein Tooltip ohne Mausbewegung.
- intro: vorher a) Esc 40 ms nach „Erstellen“ und b) Esc auf dem Ladeschirm wirkungslos (Film kam), c)–e) gingen – nachher alle fünf.
- stempel: vorher „Der Stempel“ bei Held 2 wieder als Karte – nachher still.
- meldung: vorher 20 Drücke in 3 s = 20 große rote Kurzmeldungen „… verschnaufen“ – nachher 2 leise Zeilen (≥ 2 s Abstand).
Nachher: 95/95 Prüfungen bei 1600×900 und 95/95 bei 2024×900 (`report.json`, `report-2024.json`); `scripts/aktionsleisten-check.mjs` 12/12, `scripts/e72-einstieg-check.mjs` grün.

## Nachtrag klicks2 (Branch `e72-klicks2` auf d0bacb75, Build #705)

**Wackelige Prüfung auf dem zusammengeführten Stand** („15/16 laufen“, „nach dem Schließen 2/3“): Die Ursache lag im Prüfer, nicht im Spiel.
Mit Zeigerprotokoll und Diagnose bei jedem nicht bedienten Rechtsklick (6 Läufe `karte`) kam der eine Fehlschlag mit
`unit: enemy:Pfanddachs`, und `pointerdown` war echt auf `#world` angekommen. Der Rechtsklick traf einen herumlaufenden Gegner, das Spiel wählte
ihn korrekt zum Angriff (kein `navigate`). Die alte Prüfung fragte erst später nach einer Figur, da war der Dachs schon weitergelaufen. Mit der Karte, dem
Tooltip und memory-seen.js (Dungeon 4B) hat das nichts zu tun. Belegt wird das durch die neue Belastungsprüfung: 20× im Wechsel Karte ↔ Welt ohne Gegner,
davon 10× mit offenem Bild-Tooltip, 20/20 laufen.
Prüfer jetzt: Auswahl vor jedem Klick leeren. Bedient heißt laufen oder die Figur unter dem Punkt wählen. Den Kartenabstand misst ein MutationObserver im Spiel,
nicht der Prüftakt. Die Karte „unter ruhender Maus“ wird festgehalten, bis die Maus liegt. Den Leistenklick weist das Zeigerprotokoll nach, nicht die
Zielwahl. Die Meldungszahl gilt je gemessener Dauer.

**Nebenbefund Chat:** Die in Ruhe unsichtbare Kopfleiste (opacity 0) fing Klicks links unten; Maus darüber klappte das Fenster sofort auf.
Jetzt ist sie in Ruhe durchlässig (`bierdeckel.css`). Das Fenster öffnet sich nach 350 ms Verweilen über der Leiste (`chat-window.js HOVER_REVEAL_MS`,
wie WoW die Chatreiter einblendet). Ein Klick in dieser Zeit geht in die Welt und bricht das Öffnen ab, bis die Maus die Leiste verlassen hat.
Verlässt die Maus das offene Fenster, geht es in Ruhe. Browserteil `chat` (Bilder `50-chat-ruhe.jpg`, `51-chat-aktiv-nach-verweilen.jpg`).

**Zweiter Wackler (Intro a, „Esc 40 ms nach Erstellen“, 2 von 5 Vollläufen):** Die Messung mit warmem Cache und Esc 0–80 ms nach dem Klick ergab:
Chrome verwirft Eingaben in der Lücke zwischen dem Verschwinden der alten Seite (pagehide ~130–230 ms) und dem ersten Bild der neuen. Weder
Seitenskript sieht sie, auch die alte Seite nicht (carryEscape griff in keinem Lauf, bleibt aber für langsames Anlegen mit Konto). Bei
0 ms Haltezeit (Prüfskript, `keyDown`+`keyUp` direkt hintereinander) fielen einmal beide in die Lücke. Bei menschlicher Haltezeit (100 ms) traf
es 3 von 10 Mal das Drücken, das Loslassen kam an. Deshalb merkt `index.html` jetzt auch `keyup` von Esc. Die Prüfung drückt Esc im Intro
gehalten (90 ms). Der Weg zum Namensfeld und das Warten auf Ida laufen nach Zeit (45 s), nicht nach Zählern: Unter Last reichten
80 × 250 ms nicht („Element fehlt: [name=heroName]“). Rest-Risiko: Ein extrem kurzes Tippen genau in der Lücke geht weiterhin verloren. Das lässt sich
aus der Seite heraus nicht abfangen, dann blendet eben der Film ein und Esc überspringt ihn beim ersten Druck.

**Ergebnis klicks2:** 5 Vollläufe in Folge grün (je 103/103, 1600×900, Ports 4483/9883). Dabei trafen in Lauf 2 und 3 je 3 bzw. 2 Rechtsklicks
einen Gegner (jetzt korrekt „greift an“). Zusätzlich 1× 2024×900 grün (103/103). `npm test` 1210/1210, `scripts/e72-einstieg-check.mjs` grün.
