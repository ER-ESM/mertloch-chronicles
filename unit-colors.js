// Farblogik für Einheiten (Optimierung Runde 4c, 2026-09-24, WoW-Vorbild): EINE Quelle für Namensschild in der Welt (renderer.js)
// und Zielrahmen (enemy-ui.js). Reaktion = Balken-/Namensfarbe (feindlich rot, neutral gelb); Schwierigkeit = Farbe der Stufenplakette
// relativ zur eigenen Stufe (grau, grün, gelb, orange, rot wie die Stufenzahl im WoW-Zielrahmen).
/** Neutral ist, wer von sich aus nicht angreift und noch nicht gereizt wurde. */
export const isNeutralUnit=e=>e?.behavior==='neutral'&&!e.aggro;
export const reactionOf=e=>isNeutralUnit(e)?'neutral':'hostile';
/** Balken (fill), Glanzkante (shine) und Name der Reaktion – Namensschild und Zielrahmen nutzen dieselben Werte. */
export const REACTION_COLORS={hostile:{fill:'#b8404a',shine:'#ea7d7c',name:'#f0b0a0'},neutral:{fill:'#c9a55a',shine:'#f1d894',name:'#f2d487'}};
/** Stufenabstand → Schwierigkeit: ≥ +5 rot, +3…+4 orange, ±2 gelb, −3…−4 grün, ≤ −5 grau. */
export function levelDifficulty(playerLevel,level){const d=Number(level)-Number(playerLevel);if(!Number.isFinite(d))return 'yellow';return d>=5?'red':d>=3?'orange':d>=-2?'yellow':d>=-4?'green':'grey';}
export const DIFFICULTY_COLORS={red:'#ff5044',orange:'#ff9433',yellow:'#ffd84a',green:'#5fd35a',grey:'#a7a7a0'};
export const DIFFICULTY_NAMES={red:'sehr gefährlich',orange:'gefährlich',yellow:'ebenbürtig',green:'leicht',grey:'kaum der Rede wert'};
