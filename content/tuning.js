// Tuning-Schicht der Rolle Balancing. Zahlenkorrekturen je ID, die über die Definitionen von Gameplay (enemies.js),
// Klassen (skills.js) und Loot (items.js) gelegt werden – damit Balancing Werte ändert, ohne fremde Dateien anzufassen.
// Nur Zahlenfelder, keine Namen, Texte, IDs oder Strukturen. Jede Zeile trägt eine Begründung (why) und das Datum.
// Angewendet in enemies.js (Ende), items.js (Ende), skills.js (Ende) über applyTuning().
export const TUNING={
 // Gegner: hp, level, speed, aggroRange, roamRadius, damage (Elite/Boss-Faktor), respawn:[min,max]
 enemies:{},
 // Zaubermuster: castSet/cast → total, damage, radius
 casts:{},
 // Gegenstände: stats {…}, weapon {min,max}, heal, energy, value, level
 items:{},
 // Klassen-Kits: klasse/skill → cd, cost, damage, heal, window, duration …
 skills:{}
};
/** Legt Zahlen aus `overrides[id]` flach über `target[id]`; verschachtelte Objekte (stats, weapon) werden gemischt. */
export function applyTuning(target,overrides={}){for(const [id,patch] of Object.entries(overrides)){const t=target[id];if(!t)continue;const {why,since,...values}=patch;for(const [k,v] of Object.entries(values))t[k]=v&&typeof v==='object'&&!Array.isArray(v)?{...(t[k]||{}),...v}:v;}return target;}
