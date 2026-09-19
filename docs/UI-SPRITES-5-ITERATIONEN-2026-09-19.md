# UI-Spritebibliothek · fünf Iterationen

Auftrag: vorhandene Mertloch-Grafik wiederverwenden, UI/HUD vollständig aus festen Bauteilen zusammensetzbar machen und neue MMORPG-Motive für Anmeldung und Charakterauswahl ergänzen.

## Durchgänge

1. **Grundlage:** vorhandene Symbole inventarisieren, stabile IDs und Bauteilrezepte, gemeinsame Größen und eine echte HTML-Vorschau. Bestehende Sprechblasen und Proc-Rahmen zeigen den 9-Slice-Vertrag. Stand: Desktop 1440 × 1000 und Mobil 390 × 844 geprüft; 19 Rezepte und 15 geladene Symbole, keine Browserfehler oder horizontaler Überlauf. Befunde für Runde 2: native blaue Regler und zu schwache Papier-Beschriftung. Belege: assets/ui-kit/review/iteration-1-*.png.
2. **Materialien und Bedienung:** neue Rahmenfamilie mit wiederholbaren Kanten; Knöpfe, Felder, Reiter, Auswahl und Regler mit Ruhe-, Fokus-, Hover-, Aktiv-, Fehler- und Deaktiviert-Zuständen.
3. **HUD und Fenster:** Unitframes, Gruppenanzeige, Aktionsplätze, Zauberbalken, Buffs/Debuffs, Auftrag, Minikarte und Chat aus denselben Teilen; Anbindung vorhandener Spielfenster.
4. **MMORPG:** neue Dorfeingangs- und Clanraum-Illustrationen, kleine Kontosymbole, tatsächliche Anmeldung sowie Charakter-/Spielweisenauswahl mit vorhandenen Helden.
5. **Finalisierung:** Verbesserungen aus den Sichtprüfungen, Mobilansichten, Tastatur und reduzierte Bewegung, reproduzierbarer Export, Tests, Größen-/Zustandsvertrag und Übergabe.

## Stil und Aufbau

Die vorhandenen Bierdeckel-Tokens bleiben maßgeblich: Zeltgrün, Kraftpapier, Creme, Messing und Ziegelrose. Die später ergänzten dezenten Rundungen bleiben berücksichtigt. Lesetext bleibt echter Text; keine in Bitmaps eingebrannten Beschriftungen. Symbole und Rahmen ersetzen keine zugänglichen Namen oder Eingaben.

`ui-kit.js` liefert stabile IDs, Rezepte und HTML-Helfer. `ui-kit.css` stellt die wiederverwendbaren Geometrien bereit. `ui-workshop.html` ist der sichtbare Bauteilkatalog. Vorhandene Symbolpfade werden referenziert, nicht kopiert oder neu generiert. Neue Motive bekommen Quelle, Prompt, Herkunft und deterministischen Export.

Es wird kein neues Konto-/Charakter-Speichermodell erfunden: Die Spielanbindung nutzt die vorhandene Anmeldung und Klassen-/Spielweisenwahl. Weitere Charakterplätze oder Realm-Verwaltung benötigen einen entsprechenden Serververtrag.
