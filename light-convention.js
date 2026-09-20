// Gemeinsame Lichtkonvention (E-41): EINE Quelle für Laufzeit-Renderer (Bodenschatten, Lichtschicht) und Pre-Render (tools/prerender).
// Keine Inhaltstexte, nur Bildgeometrie und Farbe. Die Felder `dir` und `shadow` sind verbindlich und werden nicht je Asset überschrieben.
//
// dir     Richtung, in die Bodenschatten in BILDSCHIRMkoordinaten fallen (x nach rechts, y nach unten): rechts unten, (0.80, 0.35), bei Gebrauch normieren.
// shadow  flache Ellipse (Höhe = squash × Breite), Farbe, maximale Deckkraft, weicher Rand.
// sun     dasselbe Licht als 3D-Richtungslicht für die feste Pre-Render-Kamera (tools/prerender/stage.js, orthografisch, Neigung 22°).
//
// Herleitung von `sun` (Welt: x rechts, y hoch, z zur Kamera; Kamera blickt waagerecht entlang −z und ist um p = 22° nach unten geneigt):
//   Ein Bodenpunkt (x, 0, z) landet im Bild bei (x, z·sin p), y nach unten. Ein Punkt in Höhe h wirft seinen Schatten bei Lichtlaufrichtung
//   L = (lx, ly, lz), ly < 0, auf den Boden bei h/(−ly)·(lx, lz); im Bild also Versatz ∝ (lx, lz·sin p).
//   Gefordert ist (lx, lz·sin p) ∥ (0.80, 0.35)  ⇒  lz/lx = 0.35 / (0.80 · sin 22°) = 1.1679  ⇒  Bodenrichtung des Lichts (0.6504, 0.7596).
//   Die Sonne steht in der Gegenrichtung: azimuthDeg = atan2(−0.6504, −0.7596) = −139.43°, gemessen in der Bodenebene ab +z (zur Kamera),
//   positiv nach +x (Bildschirm rechts). Das ist links HINTER der Figur – auf dem Bildschirm links oben. Nur so fällt ein echter Schlagschatten
//   im Bild nach rechts UNTEN; eine Sonne hinter der Kamera würde ihn nach oben hinter die Figur werfen. Die helle Vorderseite der Figuren
//   kommt deshalb aus dem festen Fülllicht (links oben hinter der Kamera, ohne Schattenwurf; Werte in tools/prerender/stage.js).
//   elevationDeg ist von `dir` nicht festgelegt und bestimmt nur die Schattenlänge: im Bild h/tan(e) · 0.710. Mit e = 72° sind das 0.23 × Figurenhöhe:
//   ein kompakter Schatten nah an der flachen Ellipse der Laufzeit, der im Rahmen 192² (nur 32 px unter dem Fußpunkt) bei stehender Figur nicht
//   angeschnitten wird. Verworfen: 60° und 66° – der Schatten lief unten aus dem Rahmen.
//   Ändert sich die Kameraneigung, muss azimuthDeg neu berechnet werden (tests/prerender-light.test.mjs prüft den Zusammenhang).
export const LIGHT=Object.freeze({dir:Object.freeze({x:.8,y:.35}),shadow:Object.freeze({color:'#1c2a22',alpha:.42,squash:.38}),sun:Object.freeze({azimuthDeg:-139.43,elevationDeg:72,cameraPitchDeg:22})});
