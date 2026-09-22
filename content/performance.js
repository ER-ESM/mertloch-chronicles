// Leistungsregeln (E-49, E-50). Nur Zahlen; die Logik steht in quality-governor.js, angewendet wird sie im Renderer.
export const PERFORMANCE={
 // Auflösungs-Automatik: Geregelt wird auf den Takt des Bildschirms, höchstens `targetFps`. Liegt der mittlere Bildabstand über
 // Takt × `slowFactor`, sinkt die Dichte der Weltfläche um eine Stufe (bei 60 Hz: über 19 ms ≈ unter 52 FPS). Gemittelt über `window` Bilder
 // ohne die langsamsten Anteil `trim` – einzelne Hänger zählen nicht.
 // Wieder hoch geht es erst nach `upAfterMs` mit gutem Tempo UND wenig eigener Rechenzeit (Anteil `upWorkShare` am Takt);
 // scheitert das `maxUpTries`-mal binnen `upTrialMs`, bleibt die Stufe. `refreshWindow` Bilder dienen der Taktschätzung.
 autoRes:{targetFps:60,slowFactor:1.15,goodFactor:1.05,window:75,trim:.1,ease:.06,pauseMs:250,upAfterMs:30000,upWorkShare:.5,upTrialMs:8000,maxUpTries:2,refreshWindow:240,busyShare:.5,
  // Mindestens Dichte 2; bei höherem Zoom schützt zusätzlich die CSS-Pixelgröße vor grobem Hochskalieren (Weltgrafik-Korrektur 22.09.).
  minDensity:2},
 // Bodenkacheln vorausladen (terrain-prefetch.js): Stücke je Kachelkante, Ring um die Sicht und Vorlauf in Laufrichtung (Welteinheiten),
 // und nur so viel Zeit je Bild, dass eigene Arbeit + Vorausladen unter `budgetMs` bleiben. Angefangene Kacheln außerhalb des Bereichs verfallen.
 // `urgentDist`: Stücke so nah am Sichtrand werden beim Laufen auch ohne freie Zeit gebaut (eins je Bild) – der Bodenstreifen braucht sie gleich.
 // Vorausgeladen wird im Leerlauf des Browsers (requestIdleCallback), mit `idleReserveMs` Rest; kam drei Bilder lang kein Leerlauf, baut jedes
 // Bild ein dringendes Stück (`urgentDist` vom Sichtrand). `idleTimeoutMs`: spätestens dann läuft der Leerlauf-Aufruf trotzdem.
 terrain:{pieces:8,ring:160,lead:1100,urgentDist:200,idleReserveMs:1,idleTimeoutMs:250}
};
