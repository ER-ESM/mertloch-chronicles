// Leistungsregeln (E-49). Nur Zahlen; die Logik steht in quality-governor.js, angewendet wird sie im Renderer.
export const PERFORMANCE={
 // Auflösungs-Automatik: Liegt der mittlere Bildabstand über `slowMs` (19 ms ≈ unter 52 FPS), sinkt die Dichte der Weltfläche um eine Stufe.
 // Wieder hoch geht es erst nach `upAfterMs` mit gutem Tempo UND wenig eigener Rechenzeit; scheitert das `maxUpTries`-mal binnen `upTrialMs`, bleibt die Stufe.
 autoRes:{slowMs:19,goodMs:17.5,window:75,ease:.06,pauseMs:250,upAfterMs:30000,upWorkMs:4,upTrialMs:8000,maxUpTries:2,
  // Mindestens Dichte 2; bei höherem Zoom schützt zusätzlich die CSS-Pixelgröße vor grobem Hochskalieren.
  minDensity:2}
};
