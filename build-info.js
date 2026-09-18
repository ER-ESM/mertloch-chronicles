// Buildnummer. Im Arbeitsstand steht hier „dev"; `npm run build` (scripts/build-site.mjs) schreibt nach _site/ die echten Werte:
// number = Anzahl der Commits auf dem gebauten Stand (steigt mit jedem Push auf main), commit = Kurz-Hash, date = Datum des Commits.
// Anzeige: Kopfzeile im HUD (#Nummer) und Hilfe → Einstellungen (volle Zeile). Damit lässt sich im Spiel prüfen, ob die Live-Fassung aktuell ist.
export const BUILD={number:0,commit:'dev',date:'',version:'0.20.0'};
export const buildLabel=b=>b.number?`Build #${b.number} · ${b.commit} · ${b.date} · v${b.version}`:`Arbeitsstand · v${b.version}`;
