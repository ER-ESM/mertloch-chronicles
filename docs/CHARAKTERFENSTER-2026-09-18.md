# Charakterfenster: Ausrüstung am Körper

Nutzerauftrag: Gegenstandsplätze wie im WoW-Charakterfenster rund um die zugehörigen Körperteile anordnen; die mobile Variante mit berücksichtigen.

## Umsetzung

- Eine größere, drehbare Figur steht mittig. Kopf, Hals, Schultern, Brust, Armschienen, Handschuhe, Gürtel, Beine und Schuhe stehen seitlich auf entsprechender Höhe. Dezente Linien verbinden die Plätze mit der Figur.
- Ringe und Glücksbringer bilden eine eigene Gruppe darunter; Haupt-/Nebenhand und Fernkampf eine zweite. Alle 16 vorhandenen Plätze behalten ihre IDs, Beschriftungen und Gegenstandsfunktionen.
- Auf schmalen Fenstern bleibt die körperbezogene Anordnung erhalten. Die unteren Gruppen stehen untereinander und sind im Fenster scrollbar. Gegenstandsplätze und Vorschauknöpfe haben mindestens 44 Pixel große Tippflächen.
- Die frühere doppelte Miniatur und das erzwungene Vierspaltenraster entfallen. Die Vorschau zeichnet mit höherer Canvas-Auflösung und zeigt weiterhin die angelegte Ausrüstung.

## Prüfung

`node scripts/character-sheet-check.mjs http://localhost:4181/` prüft mit isoliertem Chrome-Profil:

- Desktop 2024×900, Laptop 1280×800, Touch 390×844 und 320×740, Touch-Querformat 844×390; mobile Safe Areas eingeschlossen.
- Alle 16 Plätze vorhanden, keine überlappenden Schaltflächen oder horizontalen Überläufe, Körperplätze von oben nach unten geordnet, Figur sichtbar und tatsächlich gezeichnet.
- Gegenstandsdetails öffnen, Brustausrüstung per Maus und Touch ablegen und erneut anlegen, Waffen untersuchen und Vorschau drehen.
- Alle drei Figuren wechseln und jeweils vier unterschiedliche Ansichten zeichnen.
- Keine JavaScript-Ausnahmen. Screenshots und Messwerte: `visual-review/character-sheet/` (lokale Prüfartefakte).

Zusätzlich: `npm test` (375 Tests), Inhaltsprüfung und `npm run build`. Mobile Eingaben und Bildschirmgrößen wurden in Chrome emuliert; ein physischer Gerätetest ist nicht Bestandteil dieses Nachweises.
