# Begegnungsregeln · Poo-Tang-Clan 0.5

## Ergänzungen 0.6

`world-layout.js` platziert drei sichere Treffpunkte und Außenlager abseits der Wohnpolygone. `world-details.js` stattet sie und geeignete Hausränder regelbasiert aus. Wohnhäuser, Straßen, Kollisionen, Wasser, bereits reservierte Ziele und ein begehbarer Straßenanschluss begrenzen die Platzierung. `World.validate()` prüft jetzt auch die Treffpunkte und Lager-Anlaufpunkte. Der Export enthält diese Punkte sowie die Grundstücksdetails.

Je zwei Nebenquestgeber teilen einen Treffpunkt. Der sichere Radius beträgt dort 105 Welteinheiten; die automatische Feldpopulation hält 165 Einheiten Abstand. Lager-Anlaufpunkte liegen mindestens 290 Einheiten vom Lagerzentrum entfernt, mit 85 Einheiten Schutzradius und 170 Einheiten Abstand für Feldpopulation. Auf den Wegen zwischen diesen Punkten sind weiterhin Begegnungen möglich.

Die erste Hauptquest-Keilergruppe hat drei auseinanderliegende Startpositionen, 78 Einheiten Aggro-Reichweite und 24 Einheiten Wander-Radius. Normale Questlager streifen in engeren Revieren als die freie Feldpopulation. Lernfortschritt und Buffs liegen in `progression.js`; ihre Zeiten laufen wie Kampf und Respawns nur bei aktiver Simulation.

`encounters.js` bevölkert die bestehende OSM-Spielwelt. `clan.js` enthält Figuren, Fähigkeiten und die ortsbezogenen Geschichten; `clan-art.js` zeichnet Figuren und Gegner in der gemeinsamen Comic-Palette. Gebäude, Straßen und ihre Navigation behalten den bisherigen Maßstab.

## Platzierung

- Die endliche Welt wird in Zellen von 320 Welteinheiten (40 Metern) eingeteilt. Ein 5 × 5 Zellen großes Umfeld wird beim Erkunden geladen, höchstens eine neue Zelle pro Frame.
- Jede Zelle versucht mit reproduzierbarem Seed bis zu zwei Reviere zu finden. Gebäude, Baumkollisionen, Wasser, Straßen, Questgeber und der zentrale Treffpunkt werden freigehalten. Hauptquest-Lager behalten zusätzlich Abstand.
- Jeder Standort benötigt einen begehbaren Anschluss an das verbundene Wegenetz. Die Ersatzsuche prüft bis zu 24 nahe Netzknoten innerhalb von 1.100 Welteinheiten; unzugängliche oder sehr weit von Wegen entfernte Flächen bleiben leer.
- Auf geeigneten Flächen außerhalb des engeren Dorfkerns werden aggressive und neutrale Arten gemischt. Innerhalb von Wohnflächen entstehen neutrale Tiere. Bis zu vier geprüfte Ersatzpositionen erlauben versetzte Respawns.
- Umherlaufen bleibt in einem begrenzten Revier, respektiert Kollisionen und prüft die direkte Strecke vor jedem neuen Laufziel. Tiere pausieren zwischendurch; neutrale Tiere wenden sich nahen Spielern zu.

## Verhalten und Respawn

Neutrale Tiere beginnen keinen Kampf. Ein Treffer – auch Bärbels Flächenschaden – löst Gegenwehr aus. Aggressive Arten benötigen Reichweite und Sichtkontakt. Während der Ankunftsphase und am zentralen Rastplatz beginnen sie keinen Angriff.

Verfolgende Gegner verwenden bei Hindernissen dieselbe Wegsuche wie der Spieler. Bei zu großer Entfernung laufen sie nach Hause; in diesem Zustand sind sie nicht angreifbar. Erst bei der Ankunft werden ihre Lebenspunkte aufgefüllt. Für einen tatsächlich festhängenden Rückkehrer gibt es nach zehn Sekunden einen Wiederherstellungsweg, der nur fern vom Spieler greift.

| Gegner | Verhalten | Aggro (Welteinheiten) | Respawn (Simulationssekunden) |
|---|---|---:|---:|
| Pfanddachs | Neutral | 0 | 24–42 |
| Grillgut-Gans | Neutral | 0 | 25–45 |
| Pfandkeiler | Aggressiv | 115 | 38–62 |
| Ruhewart auf Streife | Aggressiv | 145 | 42–68 |
| Hauptquest-Keiler und -Ruhewärter | Aggressiv | 100 | 35–55 |
| Horst Nüchternmann | Aggressiv | 105 | 90–120 |

Ein Meter entspricht acht Welteinheiten. Respawns warten auf mindestens 235 Einheiten Spielerabstand, freie Geometrie und Abstand zu lebenden Gegnern. Die 1,8 Sekunden lange Ankunftsphase verhindert sofortigen Angriff. Sind alle Ersatzpositionen zu nah, bleibt der Gegner tot, bis Platz vorhanden ist.

Inaktive Zellen behalten ihre Datensätze einschließlich Lebenspunkten und absoluter Respawn-Frist. Weit entfernte Gegner verlassen die aktive Liste; laufende Kämpfe und Rückkehrer werden weiter simuliert. Nach dem Neuladen beginnt diese Sitzungspopulation neu. Das ist eine lokale Simulation, kein persistenter MMO-Server.

## Prüfung

`npm test` enthält deterministische Platzierung, eine Minute kollisionsgeprüfte Wanderbewegung, neutrale Gegenwehr, Sicht-/Reichweitenprüfung, Rückweg mit Heilung, verzögerte Respawns, Pausen und Wiederbetreten entladener Zellen. Zufällige Feldgegner zählen nicht als benannte Hauptquest-Gegner. Separate Klassentests prüfen Rhythmuspunkte und Bass-Fläche, Kevins Verlangsamung und Unterbrechungen sowie Dieters Heilparade.
