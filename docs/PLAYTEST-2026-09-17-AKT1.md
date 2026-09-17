# Playtest Akt 1 „Filmriss“ · 2026-09-17 · Live-Stand main ef18a59

Drei Personas (Neuling, Kenner, Prüfer) auf https://er-esm.github.io/mertloch-chronicles/ in 2024×900, je 40–60 Aktionen. Erster Lauf scheiterte am Ladebildschirm (Site-Build kopierte `content/checks/` nicht; behoben mit ef18a59 und Build-Selbstprüfung). Zweiter Lauf unten.

## Ergebnis in einem Satz

Die Welt, der Ton und die Auftragsführung tragen (Humor 4/5, Hilfe und Statuszeilen gut), aber der Einstieg kostet zu viele Aktionen (Hofprobe ohne Wegmarken, Fenster überlagern sich, F trifft den falschen Gesprächspartner) und der erste echte Kampf ist für Erstspieler unlesbar (Taste 1 schaltet den Autoangriff aus, kein Hinweis auf Angriff, Tod ohne eigenen Treffer).

## Befunde nach Schwere

| Nr | Schwere | Wo | Befund | Persona | Rolle |
|---|---|---|---|---|---|
| P1 | bricht ab | Erster Pfandkeiler | Erstspieler wird angegriffen, ohne es zu merken (223/608 beim ersten Hinsehen), Kniffe 1/2 zeigen keinen Treffer, Tod bei Keiler 460/460. Unklar, ob 1 an- oder ausschaltet. | Neuling | Engine + UI |
| P2 | stockt | Kampfleiste | Taste 1 ist ein Ein/Aus-Toggle für den Autoangriff; Tab startet ihn bereits, das reflexhafte 1 schaltet ihn AUS. Genre-Erwartung: 1 = angreifen, nie aufhören. | Kenner, Neuling, Prüfer | Engine + UI |
| P3 | stockt | Treffpunkt | F spricht mit Dosen-Dieter statt Kisten-Ida, obwohl der Auftrag „Sprich mit Ida“ sagt; Linksklick auf Ida wählt sie nicht. Mentoren stehen zu nah an Ida. | Neuling, Prüfer | Engine (Priorität Auftragsziel) + Welt (Abstand) |
| P4 | stockt | Menüs | Gespräch + Clanbuch + Beute gleichzeitig offen; Ida-Dialog öffnet sich nach „Weiterüben“ von selbst wieder; Klicks landen im falschen Fenster (Bude-Reiter löste Klamottenwechsel aus). Zielbild E-13: EIN Fenster. | Neuling, Prüfer, Kenner | UI |
| P5 | stockt | Hofprobe 2/8, 6/8 | „Laufe zur goldenen Hofmarkierung“ und „Kiste bei Papp-Horst“ ohne Pfeil/Meter im HUD; F neben Ida öffnet Ida statt der Kiste. | Kenner | UI (Wegmarke) + Engine (F-Priorität) |
| P6 | stockt | Bewegung | Rechtsklick-Laufweg bringt nur ~10 m je Klick; 127 m zum ersten Ziel = zwölf Klicks. | Neuling | Engine (movement) |
| P7 | stockt | Klamottenwahl | Figurname rotiert Dieter→Anni→Kevin ohne sichtbare Auswahl; ein unsichtbares Fenster „Figur“ fängt Klicks ab; Unterreiter unter „Figur“ (Ausrüstung/Werte/Verwalten/Talente/Bande) verletzen „keine Unterseiten“. | Neuling, Prüfer | UI |
| P8 | wundert sich | Hofprobe | Schritt 3 wird übersprungen (2/8→4/8), „Auto 1/2“ ist vorab erfüllt, „Autoangriff aus.“ ohne Eingabe; „Nochmal:“ beim ersten Versuch; Cooldown-Meldung ohne Restzeit. | Neuling, Kenner | Engine (tutorial.js) + UI |
| P9 | wundert sich | Tod | Tod-Fenster und Erinnerung „Wurst Case“ gleichzeitig; Erinnerung bleibt nach dem Aufstehen offen. Erinnerung nach Kapitelannahme bremst. | Neuling | UI (Warteschlange: Erinnerung erst nach Tod-Fenster) |
| P10 | wundert sich | Reiter Bude | Neun „…“-Einträge wirken kaputt statt verborgen; „Erinnerungsfetzen“ statt „Erinnerungen“. | Neuling, Prüfer, Kenner | UI + Story (Text „Noch keine Erinnerung gefunden“) |
| P11 | wundert sich | Start | Clan-Schule-Popup verschwindet, bevor man es lesen kann; Linksklick ins Spielfeld öffnete den Bude-Reiter. | Neuling, Kenner | UI |
| P12 | Idee | Ida Kapitel 1 | Vierter Absatz wiederholt die Auftragszusammenfassung wörtlich. | Neuling | UI (Summary nicht im Dialog doppeln) |
| P13 | Idee | Klamotten | Alle drei Klamotten haben auf Stufe 1 identische Werte; Unterschied nur im Namen der Ressource. | Kenner | Klassen |
| P14 | Idee | Begriffe | Randale, Pegel/Glanz/Druck → Eskalation, Kniffe, Klamotten, Pfandmarken sind Profis nicht sofort klar; Kurz-Glossar in der Hilfe. | Kenner | Story (panel-ui.js) |
| P15 | Idee | Talente | Eigene Taste für Talente (heute C → Reiter). | Kenner | UI |
| P16 | Werkzeug | Personas | Screenshots kommen den Personas nicht als Bild zurück; Blindsteuerung im Spielfeld frisst Budget. Aufrufe brauchen Koordinaten/mehr Budget. | alle | Lead (Persona-Aufrufe) |

## Gehalten (Prüfer)

Akt-1-Texte (Unterhose, Socke, Stempel, Ersatzklamotten, Beweismittelkiste) · sieben Reiter in richtiger Reihenfolge · Aufträge-Reiter mit Akt „Filmriss“ und vier Kapiteln mit Status · Bude zeigt Trümmer-Hinweis und Erinnerungsbereich · Klassenmenü spricht von Klamotten · kein Slop (0 Treffer auf TODO/Feature/„letzte Kiste“/Sie). Erinnerung „Der Stempel“ erscheint nach der Hofprobe, „Wurst Case“ beim ersten Tod.

## Bewertungen

| | Neuling | Kenner |
|---|---|---|
| Wusste ich, was zu tun ist | 3 | 3 |
| Wusste ich, was passiert ist | 2 | 3 |
| Wollte ich weiterspielen | 3 | 2 |
| Humor | 4 | – |
| Kampf | 1 | nicht messbar |

## Verteilung (Runde C)

Engine: P1, P2, P3, P5 (F-Priorität), P6, P8. UI: P1 (Angriffshinweis), P2 (Leiste), P4, P5 (Wegmarke), P7, P9, P10, P11, P12, P15. Welt: P3 (Mentoren-Abstand). Story: P10 (Text), P14 (Glossar). Klassen: P13. Lead: P16, Entscheidung zu Taste 1 (Toggle abschaffen) und zur Hofprobe-Länge.
