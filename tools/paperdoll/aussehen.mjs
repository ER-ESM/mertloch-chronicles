// Erweiterungsmodul der Anziehpuppe (aussehen): liefert weitere Quellen im Format von GEAR/GEAR_BACK (puppe.mjs).
// K = Zeichenbaukasten aus puppe.mjs (PAL, ell, limb, poly, line, stamp, light, …) – nur innerhalb der Zeichenfunktionen benutzen.
// Rückgabe: {gear:{id:{slot,name,<band>(L,p){…}}}, back:{id:{<band>(L,p){…}}}, families:{familie:id}, sided:[ids mit Seitenbindung]}
export function aussehen(K){return {gear:{},back:{},families:{},sided:[]};}
