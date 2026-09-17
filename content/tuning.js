// Tuning-Schicht der Rolle Balancing. Zahlenkorrekturen je ID, die über die Definitionen von Gameplay (enemies.js),
// Klassen (skills.js) und Loot (items.js) gelegt werden – damit Balancing Werte ändert, ohne fremde Dateien anzufassen.
// Nur Zahlenfelder, keine Namen, Texte, IDs oder Strukturen. Jede Zeile trägt eine Begründung (why) und das Datum.
// Angewendet in enemies.js (Ende), items.js (Ende), skills.js (Ende) über applyTuning().
export const TUNING={
 // Gegner: hp, level, speed, aggroRange, roamRadius, damage (Elite/Boss-Faktor), respawn:[min,max]
 enemies:{
  // Umland-Tiere (badger, goose, raven, fox) bewusst OHNE Tuning: die Engine skaliert Feldgegner seit Runde A
  // mit der Spielerstufe (encounters.scaledStats, BALANCE.enemies.playerLead). Flaches Leben würde sich damit stapeln.
  goose:{hp:390,why:'zu duenn an beiden Enden: auf eigener Stufe 1 nur 1,4/3,3/3,7 s (Korridor 4-12 s), im Umland auf Stufe 10 fuer Dieter 2,4 s (trivial). +30 % Grundleben wirkt an beiden Stellen, weil die Engine im Umland darauf aufsetzt',since:'2026-09-17'},
  raven:{hp:380,why:'wie die Gans: Stufe 1 nur 1,4/2,5/3,0 s, im Umland auf Stufe 10 fuer Dieter 2,3 s. +31 % Grundleben',since:'2026-09-17'},
  // --- Korridor auf eigener Stufe (content/README.md) ---
  jga:{hp:840,why:'Feldgegner-Korridor 4–12 s auf eigener Stufe: Junggeselle fiel für Bärbel auf Stufe 4 in 3,9 s; +17 % Leben ergibt 4,6 s, Kevin 5,6 s',since:'2026-09-17'},
  klaus:{hp:4800,why:'Boss-Korridor 10–25 s auf eigener Stufe: Kegelkönig Klaus fiel für Dieter auf Stufe 6 in 9,0 s; +14 % Leben ergibt 10,2 s, Bärbel 18,2 s und Kevin 16,8 s bleiben klar unter 25 s',since:'2026-09-17'},
  timo:{hp:5300,why:'Boss-Korridor 10–25 s: Trauzeuge Timo fiel für Dieter auf eigener Stufe 7 in 9,4 s; +10 % Leben ergibt 10,5 s, Bärbel 18,5 s und Kevin 17,0 s',since:'2026-09-17'}
  // Kegelbruder aus Kalt (kegler) bewusst unverändert: auf eigener Stufe 3 liegen Bärbel (6,7 s) und Kevin (5,3 s)
  // im Korridor, nur Dieter fällt mit 3,7 s darunter. Erst ab 1300 Leben (+103 %) erreicht Dieter 4,1 s – dann steht
  // Bärbel bei 12,5 s über dem Korridor. Gegner-Leben kann keinen Klassenabstand schließen → docs/backlog/klassen.md.
 },
 // Zaubermuster: castSet/cast → total, damage, radius
 casts:{},
 // Gegenstände: stats {…}, weapon {min,max}, heal, energy, value, level
 items:{},
 // Klassen-Kits: klasse/skill → cd, cost, damage, heal, window, duration …
 skills:{}
};
/** Legt Zahlen aus `overrides[id]` flach über `target[id]`; verschachtelte Objekte (stats, weapon) werden gemischt. */
export function applyTuning(target,overrides={}){for(const [id,patch] of Object.entries(overrides)){const t=target[id];if(!t)continue;const {why,since,...values}=patch;for(const [k,v] of Object.entries(values))t[k]=v&&typeof v==='object'&&!Array.isArray(v)?{...(t[k]||{}),...v}:v;}return target;}
