# UI-Spritebibliothek · fünf Iterationen

Auftrag: vorhandene Mertloch-Grafik wiederverwenden, UI/HUD vollständig aus festen Bauteilen zusammensetzbar machen und neue MMORPG-Motive für Anmeldung und Charakterauswahl ergänzen.

## Durchgänge

1. **Grundlage:** vorhandene Symbole inventarisieren, stabile IDs und Bauteilrezepte, gemeinsame Größen und eine echte HTML-Vorschau. Bestehende Sprechblasen und Proc-Rahmen zeigen den 9-Slice-Vertrag. Stand: Desktop 1440 × 1000 und Mobil 390 × 844 geprüft; 19 Rezepte und 15 geladene Symbole, keine Browserfehler oder horizontaler Überlauf. Befunde für Runde 2: native blaue Regler und zu schwache Papier-Beschriftung. Belege: assets/ui-kit/review/iteration-1-*.png.
2. **Materialien und Bedienung:** neue Rahmenfamilie mit wiederholbaren Kanten; Knöpfe, Felder, Reiter, Auswahl und Regler mit Ruhe-, Fokus-, Hover-, Aktiv-, Fehler- und Deaktiviert-Zuständen. Geprüft: 24 Rahmen-Sprites, unveränderte Eckgrößen bei 96, 240 und 640 px, harte Palette/Alpha, byteidentischer Export, sichtbarer Tastaturfokus und 44-px-Knopf. Desktop- und Mobilbelege unter assets/ui-kit/review/iteration-2-*.png.
3. **HUD und Fenster:** Unitframes, Gruppenanzeige, Aktionsplätze, Zauberbalken, Buffs/Debuffs, Auftrag, Minikarte und Chat aus denselben Teilen; Anbindung vorhandener Spielfenster. Geprüft: wiederverwendbare Unit-/Action-/Aura-Helfer, echte Spielfenster, HUD und Kampfstatistik mit Rahmenadaptern. Browser ohne Fehler und ohne horizontalen Überlauf. Sichtbelege: iteration-3-hud.png und iteration-3-game.png.
4. **MMORPG:** neue Dorfeingangs- und Clanraum-Illustrationen, kleine Kontosymbole, tatsächliche Anmeldung sowie Charakter-/Spielweisenauswahl mit vorhandenen Helden. Geprüft: 27 Symbole, zwei Szenen, echte Konto-Formularhaken und Klassenkarten. Desktop 1440 px / Mobil 390 px ohne Überlauf; Klassenwechsel in der Vorschau und Registrierung per Tastatur erreichbar. Befund für Runde 5: Helden in den Karten noch zu klein. Belege: iteration-4-mmo.png / iteration-4-mobile.png.
5. **Finalisierung:** Verbesserungen aus den Sichtprüfungen, Mobilansichten, Tastatur und reduzierte Bewegung, reproduzierbarer Export, Tests, Größen-/Zustandsvertrag und Übergabe. Abgeschlossen: 19 kopierbare Rezepte, größere Figuren, Konto-Lade-/Fehlerzustände und Runtime-only-Build/Cache.

## Stil und Aufbau

Die vorhandenen Bierdeckel-Tokens bleiben maßgeblich: Zeltgrün, Kraftpapier, Creme, Messing und Ziegelrose. Die später ergänzten dezenten Rundungen bleiben berücksichtigt. Lesetext bleibt echter Text; keine in Bitmaps eingebrannten Beschriftungen. Symbole und Rahmen ersetzen keine zugänglichen Namen oder Eingaben.

`ui-kit.js` liefert stabile IDs, Rezepte und HTML-Helfer. `ui-kit.css` stellt die wiederverwendbaren Geometrien bereit. `ui-workshop.html` ist der sichtbare Bauteilkatalog. Vorhandene Symbolpfade werden referenziert, nicht kopiert oder neu generiert. Neue Motive bekommen Quelle, Prompt, Herkunft und deterministischen Export.

Es wird kein neues Konto-/Charakter-Speichermodell erfunden: Die Spielanbindung nutzt die vorhandene Anmeldung und Klassen-/Spielweisenwahl. Weitere Charakterplätze oder Realm-Verwaltung benötigen einen entsprechenden Serververtrag.

## Fertiger Baukasten

`ui-workshop.html#recipes` bietet alle 19 Rezepte als echte Vorschau, Material- und Titelwahl, HTML-Kopie und Katalogdownload. Die Module `ui-kit.js`, `ui-kit-hud.js`, `ui-kit-mmo.js` und `ui-kit-recipes.js` bleiben getrennt von Spielzustand und Servertransport. `ui-kit-game.css` bindet die Materialien an die vorhandenen Spielfenster, HUD-Anzeigen, Klassenkarten, Kontoformulare und Kampfstatistik an.

```html
<link rel="stylesheet" href="bierdeckel.css">
<link rel="stylesheet" href="ui-kit.css">
<div id="window"></div>
<script type="module">
  import {uiRecipe} from './ui-kit-recipes.js';
  document.querySelector('#window').innerHTML = uiRecipe('window', {
    title: 'Die nächste Runde', frame: 'panel'
  });
</script>
```

Die fertigen Rezepte enthalten echtes HTML. Schließen, Reiterwechsel, Chatversand und Weltkarten erhalten ihre Ereignisse bzw. Canvas-Inhalte vom jeweiligen Bildschirm. IDs von mehrfach verwendeten Formularen müssen vom Verbraucher eindeutig vergeben werden. Für produktive Kontoformulare `uiLoginCard(ONLINE_UI)` zusammen mit `mountOnline().handle()` verwenden; die Werkstatt sendet keine Kontodaten. Hero-Canvas nach dem Einfügen mit `paintUiHeroes(root, {visualEquipment})` zeichnen. Ausrüstung stammt aus `equipmentAppearance(game.rpg.equipment, ITEMS)`; ohne Gegenstände bleibt die Startkleidung sichtbar.

### Exportvertrag

| Bauteil | Runtime-Format | Verwendung |
| --- | --- | --- |
| Rahmen | 24 PNGs, sechs Familien × vier Zustände | `frame-{panel,paper,inset,primary,danger,character}-{rest,hover,pressed,disabled}.png` |
| Rahmenatlas | 576 × 384 px, Zellen 96 × 96 | Quellrechteck und tatsächliche Größe aus `catalog.frames[id].atlas` |
| Nine-Slice | 16 px je Quellkante, 8 CSS-px Zielkante | CSS `border-image: … 16 / 8px / 0 stretch`; Canvas `drawUiFrame` |
| Materialflächen | sechs wiederholbare PNGs, 24 × 24 px | Hintergrund hinter Rahmen, Papierkarten |
| Kontosymbole | zwölf PNGs, 48 × 48 px; Atlas 192 × 144 | Konto, Identität, Gruppe, Chat, Welt, Verbindung, getrennt, Warten, Post, Lager, Suche, Einstellungen |
| Vorhandene Symbole | 15 referenzierte Exporte | Reiter, HUD, Proc, Belohnung; keine duplizierten Quelldateien |
| Illustrationen | zwei PNGs, 960 × 540 px | `village-gate.png` und `clan-hall.png`, Schwerpunkt im Katalog |

Alle Pfade beginnen mit `assets/ui-kit/runtime/`, außer den ausdrücklich referenzierten bisherigen Symbolen. Der Katalog enthält Größen, Rechtecke, Quell- und Export-Hashes. Sprite-Dateien tragen hartes Alpha und die vorhandene Präzisionspalette. Texte werden niemals in die Bilder eingebrannt. Interaktive Knöpfe sind mindestens 44 CSS-px groß; kleine passive Auren dürfen darunter liegen. Fokus, Auswahl, Fehler und Laden werden semantisch mit HTML/ARIA ergänzt. Ein Proc erhält zusätzlich den Text „BEREIT“, eine Abklingzeit einen Zahlenwert, getrennte Verbindung eine Beschriftung.

`npm run ui:kit:build` erzeugt die Exporte bytegleich aus den eingefrorenen Quellen. `npm run ui:kit:check` prüft Rezepte, Eingabesicherheit, Zustände, Palette, Transparenz, Herkunft und unveränderte Rahmenecken. Neue Größen und Zusammenstellungen benötigen keine Bildgenerierung. Neue Symbole oder Materialien werden erst nach Prüfung des Katalogs ergänzt.

### Herkunft und Prompts

Die vier neuen Quellen wurden mit dem eingebauten `image_gen.imagegen` erstellt. Quelle und exakter verwendeter Prompt sind zusammen abgelegt:

- [Rahmen](../assets/ui-kit/sources/frames.png) · [Prompt](../assets/ui-kit/sources/frames.prompt.txt)
- [MMORPG-Symbole](../assets/ui-kit/sources/mmo-icons.png) · [Prompt](../assets/ui-kit/sources/mmo-icons.prompt.txt)
- [Dorfeingang](../assets/ui-kit/sources/village-gate.png) · [Prompt](../assets/ui-kit/sources/village-gate.prompt.txt)
- [Clanraum](../assets/ui-kit/sources/clan-hall.png) · [Prompt](../assets/ui-kit/sources/clan-hall.prompt.txt)

[generation.json](../assets/ui-kit/generation.json) hält Referenzen, ursprüngliche Ausgabepfade und SHA-256 fest. Quellen und Sichtbelege bleiben im Repository; Build und Offline-Cache nehmen nur die Runtime-Ausgaben auf.

## Finale Sichtprüfung

Runde 5 vergrößert die Figuren von 3,5 auf 6 Renderer-Einheiten, verbessert die Kontoüberschrift und ergänzt den interaktiven Zusammensteller. Alle 19 Rezepte sind bei 1440, 390 und 320 px ohne horizontalen Überlauf geprüft. Reduzierte Bewegung schaltet weiches Scrollen aus. Anmeldung und Registrierung wurden mit lokal abgefangenen Fehlerantworten geprüft: richtiges Aktionsfeld, sichtbarer Spielername, verständliche Fehlermeldung, Rückkehr aus dem Ladezustand. Keine Konten angelegt oder echte Anmeldedaten übertragen.

Sichtbelege: `assets/ui-kit/review/iteration-5-{builder,mmo,mobile}.png`. Die Screenshots aller fünf Runden bleiben als nachvollziehbare Entwicklung erhalten.

Automatisierter Browserlauf: `npm run ui:kit:browser -- http://127.0.0.1:4283/`. Der vollständige Clanbuch-Regressionslauf bestand Navigation, Inventar, alle drei Klassen mit 90 Talenten, Skills und fünf Bildschirmformate. Die Gesamt-Testsuite vor Zusammenführung bestand 515 Tests; der zusätzliche Rezepttest sowie die Konto-Tests bestanden separat.
