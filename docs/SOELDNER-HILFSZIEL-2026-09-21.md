# Söldner als Hilfsziel

> **Abgelöst durch E-65 (23.09.2026):** Es gibt kein Hilfsziel und keinen „Selbst“-Knopf mehr. Der Söldner ist das eine Ziel wie ein Gegner; ein gewählter Söldner wählt den Gegner ab. Heilung, Schutz und Buffs wirken nur auf ihn, ohne freundliches Ziel auf dich. Reichweite, Sichtlinie und Zauberbindung unten gelten weiter. Dieses Dokument bleibt als Historie.

Söldner lassen sich in der Welt und über ihren Gruppenrahmen auswählen. Der Rahmen zeigt das Hilfsziel mit einem grünen Rand und Beschriftung. Die Auswahl verändert weder das gegnerische Kampfziel noch den Autoangriff; sie bleibt beim Gegnerwechsel bestehen. Erneutes Anklicken des Gruppenrahmens oder „Selbst“ hebt sie auf. „Deine Truppe“, U und Rechtsklick auf den Söldner öffnen die Verwaltung.

Die eigene Heilfähigkeit heilt zusätzlich das ausgewählte Hilfsziel, auch bei voller eigener Gesundheit. Der Klassenbuff überträgt Schutz, Schild oder Heilung über Zeit. Heilende Bodenflächen wirken auf alle lebenden Söldner in der Fläche und in Sicht. Heilung wird dem Besitzer in der Kampfstatistik zugerechnet, erzeugt seine Heilbedrohung und zeigt Kampftext und Effekte am geheilten Söldner.

Gezielte Hilfe prüft 420 Welteinheiten Reichweite, Sichtlinie und Lebenszustand, bevor Ressourcen oder Abklingzeit verbraucht werden. Niedergeschlagene Söldner werden durch normale Heilung nicht wiederbelebt. Während einer Zauberzeit bleibt das ursprüngliche Hilfsziel gebunden; bei Verlust wird die Heilung abgebrochen. Entlassung entfernt die Auswahl. Ein menschliches Hilfsziel und ein Söldner schließen sich gegenseitig aus.

Regression: `tests/companion-aid.test.mjs` prüft alle drei Spielerklassen, Heilstatistik, Auswahl, Reichweite, Sichtlinie, Tod, Zauberzielbindung, Schilde, Heilflächen und den Wechsel zu menschlichen Gruppenmitgliedern. `scripts/companion-aid-check.mjs` prüft echte Welt- und Rahmenklicks, Heiltaste, Statistik und Touch-Heilknopf. Screenshots und Bericht liegen unter `visual-review/companion-aid/`.
