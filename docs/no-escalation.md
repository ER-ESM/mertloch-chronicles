# Gemeinsame Eskalationsmechanik entfernt

Pegel, Glanz und Druck als gemeinsame Aufbaupunkte entfallen vollständig: kein Spielerzustand, keine HUD-Zeile, keine automatische frühe Entladung und keine Punktvoraussetzung im Kampf oder in der Aktionsleiste.

Die bestehenden `burst`-Fähigkeiten behalten ihre IDs, Icons, Lernstufen und Randale-Kosten. Ihr fester Schaden entspricht dem bisherigen vollen Treffer. Die Grundabklingzeit beträgt sechs statt vier Sekunden, damit die entfallene Aufbauzeit nicht zum dauernden Verbrauch der Randale führt. Markierungen und die spezifischen Hauptbaum-Effekte bleiben erhalten. Bisher an drei Punkte gebundene Talente lösen jetzt beim Einsatz dieses Kniffs aus; der Proc-Auslöser heißt `burst`.

Talentboni auf Aufbaupunkte geben stattdessen zehn Randale je bisherigem Punkt, bis zum vorhandenen Maximum von hundert. Bereits vorhandene Randale-Boni werden addiert. Annis Taktpassive gibt zehn zusätzliche Randale, Kevins Unterbrechung behält die Abklingzeitverkürzung. Normale Treffer, Paraden und Kills erhalten keine zusätzliche pauschale Randale; deren bestehende Randale-Werte bleiben erhalten. Tresensprung gibt zehn Randale, mit Sprungbrett zwanzig; verbesserte Kettenzündung gibt zehn je Ziel. Schrottkoloss erhält beim Spezialkniff die bisherige volle Grunddeckung von zweiundsiebzig.

Talent-IDs und Ränge bleiben stabil; vorhandene Verteilungen nutzen unmittelbar die neuen Effekte. Die Spezialisierungsressourcen, darunter Vorrat, Schimmel, Putzwut, Deckelstriche und Rausch, bleiben erhalten.

Prüfung: `tests/no-escalation.test.mjs` prüft alle neun Hauptbäume, unabhängige Schadenswerte, entfernte Frühentladung, umgestellte Talente und Erklärungen. Die bestehenden Kampf-, Rang-, Speicher- und Spezialisierungstests verwenden keine Punktvoraussetzungen mehr. `scripts/no-escalation-check.mjs` prüft das HUD für alle Figuren auf Desktop und Touch; `scripts/mechanic-help-check.mjs` prüft weiterhin alle neun eigenen Ressourcenanzeigen.
