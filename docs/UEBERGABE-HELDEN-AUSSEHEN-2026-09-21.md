# Übergabe an die Grafik-Sitzung · feineres Helden-Aussehen (E-38)

**Stand.** Bei der Heldenerstellung wählt man heute einen von drei gezeichneten Körpern (`LOOKS` in `characters.js`: `dieter` „Kräftig", `baerbel` „Schwungvoll", `kevin` „Drahtig"). Der Wert landet als `look` am Helden, im Spiel als `player.look` und online als `k` in der Anwesenheit; gezeichnet wird über `drawDetailedHero(ctx, look, …)` und im Spiel über `drawHero(…, {classId: look})`.

**Schon gebaut (21.09.2026, `hero-tint.js`).** Hautton (4) und Haarfarbe (7) per Umfärben zur Laufzeit; `tint:{skin,hair}` am Helden. Offen bleibt nur, was neue Zeichnungen braucht.

**Gewünscht.** Je Körper wählbare Varianten, ohne dass Ausrüstung neu gezeichnet werden muss:
1. Haare: 4 Frisuren × 5 Farben je Körper (als eigene Ebene über dem Kopf, in allen Lauf- und Kampfposen der bestehenden Rigs).
2. Hautton: erledigt. Wunsch an die Grafik: Porträts (`portrait-<körper>`) als Graustufen-Haut/-Haar-Ebenen, damit auch der Heldenrahmen die Farben zeigt; Glanzlichter der Haut in einem eigenen Farbton, damit sie mitgefärbt werden können.
3. Gesicht: Brille, Sonnenbrille und Stirnband sind erledigt (prozedural, `drawFaceItem`). Offen: Bart/kein Bart als gezeichnete Ebene.

**Technischer Vertrag.** `look` wird vom String zum Objekt `{body, hair, hairColor, skin, face}`; `characters.js` normalisiert bereits unbekannte Werte auf den Körper der Klasse, ein alter String bleibt gültig. Ebenen liegen unter `assets/heroes/<body>/<layer>-<variante>.png` im Raster der bestehenden Rig-Atlanten; die Farbvarianten entstehen zur Laufzeit per Palettentausch (eine Graustufen-Rampe je Ebene). Abnahme: Heldenhalle, Spielfigur, Porträt und andere Spieler zeigen dieselbe Kombination; `tests/characters.test.mjs` bekommt einen Fall für das Objekt.

**Nicht Teil davon.** Körperbau-Regler, Größen, Kleidung außerhalb der Ausrüstung.

## Befund 21.09.2026: Frisuren und Bärte lassen sich nicht aus den vorhandenen Pixeln ableiten

Versucht und verworfen (am vergrößerten Bild geprüft, drei Körper, Vorder- und Rückansicht):
- **Kurz** (Haar-Pixel außerhalb einer Kopf-Ellipse löschen): ausgefranste Reste, schwebende Strähnen, Löcher – hinter dem Haar ist im Körperbild nichts gezeichnet.
- **Glatze** (Haar-Pixel auf Hautton setzen): flache Kuppel ohne Schädelform, Haarkranz bleibt, beim Körper „Schwungvoll" fleckig.
- **Stoppeln/Vollbart** (Haut-Pixel im Kinnbereich auf Haarfarbe): rechteckiger Fleck über dem Mund; **Rasiert** lässt beim Körper „Kräftig" die gezeichnete Bartkontur stehen.

Was funktioniert, ist alles, was Farbe ändert oder klein und starr am Kopf sitzt (Hautton, Haarfarbe, Brille, Sonnenbrille, Stirnband). Für Frisuren und Bärte braucht es deshalb je Körper gezeichnete Ebenen: **ein Kopf ohne Haare und ohne Bart als Basis**, darüber Frisur- und Bart-Ebenen in den vier Blickrichtungen und allen Posen der Rig-Atlanten. Die Auswahl (`tint.style`, `tint.beard`) ist im Datenmodell schnell ergänzt; `lookKey`/`parseTintKey` tragen weitere Felder ohne Bruch.

**Nachtrag:** Additive Ebenen funktionieren (gebaut: Stoppeln, Kinnbart, Vollbart, Irokese – `drawBeard`, `drawHairStyle`). Offen für die Grafik bleibt nur, was gezeichnetes Haar ersetzt (Kurzhaar, Glatze, lange Haare, Rasur beim Körper „Kräftig").

## Dritter Versuch (21.09.2026, verworfen): Kappe statt Haar

Oberhalb der Brauenlinie alles entfernen und eine vollständige, schattierte Kuppel neu zeichnen (hautfarben = Glatze, haarfarben = Kurz).
Ergebnis am vergrößerten Bild: Rückansichten sauber; Vorderansichten wirken wie ein aufgesetzter Helm (gerade Unterkante statt Haaransatz um die
Schläfen), bei „Kräftig" und „Drahtig" bleiben die fast schwarzen Konturen des Seitenhaars stehen, bei „Schwungvoll" wird das Gesicht eckig.
Was fehlt, ist genau das, was nur eine Zeichnung liefert: Stirn, Schläfen, Ohren und Hinterkopf unter dem Haar – je Körper, je Blickrichtung.

**Kleinster sinnvoller Zeichenauftrag:** je Körper EIN haarloser Kopf (4 Blickrichtungen × die Kopfhaltungen des Rigs, nicht jede Pose – der Kopf
ist im Rig ein starres Teil), dazu 3 Frisur-Ebenen und 2 Bart-Ebenen im selben Raster. Einbau: `look.style`/`look.beard` existieren schon,
gezeichnet wird an derselben Stelle wie `drawHairStyle`/`drawBeard`; Farbe kommt weiter aus der Haarfarben-Auswahl (Graustufen-Ebene + `hairRgb`).

**Nutzerentscheid 21.09.2026: Zeichenauftrag vergeben.** Der fertige Auftrag mit Raster, Anker, Katalog und Abnahme steht in
`docs/AUFTRAG-GRAFIK-KOPF-EBENEN-2026-09-21.md`; die Aufnahme im Spiel (`hero-layers.js`) ist gebaut und mit Platzhalter-Kacheln geprüft.
