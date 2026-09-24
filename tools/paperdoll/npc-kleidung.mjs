// Erweiterungsmodul der Anziehpuppe (npc-kleidung): liefert weitere Quellen im Format von GEAR/GEAR_BACK (puppe.mjs).
// K = Zeichenbaukasten aus puppe.mjs (PAL, ell, limb, poly, line, stamp, light, …) – nur innerhalb der Zeichenfunktionen benutzen.
// Rückgabe: {gear:{id:{slot,name,<band>(L,p){…}}}, back:{id:{<band>(L,p){…}}}, families:{familie:id}, sided:[ids mit Seitenbindung]}
export function npc_kleidung(K){return {gear:{},back:{},families:{},sided:[]};}
