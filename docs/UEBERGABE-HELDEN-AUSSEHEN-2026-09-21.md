# Übergabe an die Grafik-Sitzung · feineres Helden-Aussehen (E-38)

**Stand.** Bei der Heldenerstellung wählt man heute einen von drei gezeichneten Körpern (`LOOKS` in `characters.js`: `dieter` „Kräftig", `baerbel` „Schwungvoll", `kevin` „Drahtig"). Der Wert landet als `look` am Helden, im Spiel als `player.look` und online als `k` in der Anwesenheit; gezeichnet wird über `drawDetailedHero(ctx, look, …)` und im Spiel über `drawHero(…, {classId: look})`.

**Schon gebaut (21.09.2026, `hero-tint.js`).** Hautton (4) und Haarfarbe (7) per Umfärben zur Laufzeit; `tint:{skin,hair}` am Helden. Offen bleibt nur, was neue Zeichnungen braucht.

**Gewünscht.** Je Körper wählbare Varianten, ohne dass Ausrüstung neu gezeichnet werden muss:
1. Haare: 4 Frisuren × 5 Farben je Körper (als eigene Ebene über dem Kopf, in allen Lauf- und Kampfposen der bestehenden Rigs).
2. Hautton: erledigt. Wunsch an die Grafik: Porträts (`portrait-<körper>`) als Graustufen-Haut/-Haar-Ebenen, damit auch der Heldenrahmen die Farben zeigt; Glanzlichter der Haut in einem eigenen Farbton, damit sie mitgefärbt werden können.
3. Gesicht: Brille, Sonnenbrille und Stirnband sind erledigt (prozedural, `drawFaceItem`). Offen: Bart/kein Bart als gezeichnete Ebene.

**Technischer Vertrag.** `look` wird vom String zum Objekt `{body, hair, hairColor, skin, face}`; `characters.js` normalisiert bereits unbekannte Werte auf den Körper der Klasse, ein alter String bleibt gültig. Ebenen liegen unter `assets/heroes/<body>/<layer>-<variante>.png` im Raster der bestehenden Rig-Atlanten; die Farbvarianten entstehen zur Laufzeit per Palettentausch (eine Graustufen-Rampe je Ebene). Abnahme: Heldenhalle, Spielfigur, Porträt und andere Spieler zeigen dieselbe Kombination; `tests/characters.test.mjs` bekommt einen Fall für das Objekt.

**Nicht Teil davon.** Körperbau-Regler, Größen, Kleidung außerhalb der Ausrüstung.
