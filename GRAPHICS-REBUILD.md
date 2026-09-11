# Grafikumbau 0.8 — Maifeld / Tiny Swords

Die Welt nutzt jetzt Strohgold, Holzbraun, Schieferblau und Blattgrün. Grundlage ist weiterhin ausschließlich Pixel Frogs ältere CC0-Ausgabe von Tiny Swords. Eigene Clanfiguren und ortsabhängige Geometrie bleiben Teil der Gestaltung.

- **Ruhende Natur:** Tannen verwenden immer das erste aufrechte Sprite, unabhängig von Zeit und Seed. Auch die Vorschauseite bewegt sie nicht. Laubbäume bestehen aus den handgezeichneten Pack-Blättern mit einer aufgehellten Eichenpalette, Wurzeln, Apfelfrüchten und einzelnen Nistkästen; keine kreisförmigen Vektorkronen mehr.
- **Häuser:** texturierte Pack-Dachflächen in Stroh, verwittertem Braun und Schiefer. Angepasste Fachwerk-/Steinfassaden, Fenster, Holztüren, Sockel, Kamine und St. Gangolfs Uhrturm. `tiny-architecture.js` bewahrt Hausgrundfläche und Eingangspunkt; fertige Haussprites werden gecacht. Keine Änderung an Kollisionen oder Navigation.
- **Gelände:** Pack-Grastextur, gedämpfte Wiesen-/Feldfarben, passende Steinstraßen und bestehende nahtlose Straßenmasken. Stein-, Pilz- und Buschdetails stammen aus demselben Pack.
- **Menschen und Tiere:** neu gezeichnete menschliche Sprites in `pixel-people.js`, pixelgenau mit ganzzahligen Scanlines und gecachten Lauf-/Angriffsposen. Menschlicher Horst mit Megafon und Papierpanzerung. Gemeinsame Schiefertinte, gestufte Stoffschatten, Nähte, abgenutzte Säume, Fell-/Federdetails und natürlichere Keilerfarben. Dieters Flasche, Bärbels Musikgeräte, Kevins Pömpel und Horsts Papierpanzer erhalten ihre Identität.
- **Requisiten und Kampf:** feine Materialspuren auf Kisten, Bänken und Schildern, Stofffalten und Nähte an Zelten. Pack-Animationen für Feuer und Treffer/Eskalation. Gefahrenflächen und Zielringe behalten ihre spielmechanisch korrekten Grenzen.
- **Oberfläche:** Holz, Schiefer und Pergament für HUD, Dialoge, Lernbereich und Clanmenü. Acht eigene 32-Pixel-Skillicons, kurze lesbare Aktionsnamen, vollständige Namen in Tooltips. Karte, Artbook, Grafikwerkstatt und Weltschmiede sind angeglichen.

## Selbst geprüft

51 automatisierte Tests einschließlich statischer Tannen, unverrückter Eingänge, Sprite-Framegrenzen sowie der bisherigen Kampf-, Quest-, Respawn-, Reset- und Wegfindungstests.

Browser-Runde mit echter Tastatur-/Mauseingabe: Dorf → Kirchstraße → sicherer Lagerrand → Weg um die Häuser → Plündererlager. Mit Bärbel 418 Schaden verursacht, einen Plünderer besiegt und anschließend die mobile Ansicht mit acht Fähigkeiten kontrolliert. Der Testlauf stellt den ursprünglichen Fortschritt im isolierten Chrome-Testprofil wieder her.

Reproduzierbare Prüfungen: `scripts/play-restyle.mjs`, `scripts/audit-restyle.mjs`, `scripts/test-admin-atlas.mjs`. Lokaler Server auf 4173, Test-Chrome mit DevTools-Port 9222; Hilfsfunktionen in `scripts/browser-polish.mjs`.

Ansichten: [Dorf](restyle-final.png), [Straße](restyle-street.png), [Lager](restyle-field.png), [Mobil](restyle-mobile.png), [Clan](restyle-clan-final.png).
