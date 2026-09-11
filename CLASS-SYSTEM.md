# Klassenumbau 0.13

Die drei Poo-Tang-Mitglieder besitzen getrennte Talentbäume und eigene aktive Talentfähigkeiten. Der aktuelle Browser-Prototyp ist ein Einzelspielerspiel: Heilung und Schutzzonen wirken auf die Spielfigur; Gruppenheilung und Mehrspielerrollen benötigen später Verbündeten- und Netzwerksysteme.

| Figur / Grundrichtung | Spezialisierung | Veränderte Spielweise | Talentfähigkeit |
|---|---|---|---|
| Dieter / Tank | Türsteher | Treffer bauen Deckung auf; doppelte Paraden, Deckung für eine Druckwelle ausgeben | Absperrband: platzierte Schutzzone |
| Dieter / Tank | Kneipenschläger | Höheres Risiko, Rausch aufbauen und für den Abriss verbrauchen, Sprung und verstärkter Folgeangriff | Tresensprung |
| Dieter / Tank | Zapfmeister | Markierte Gegner als Heilquelle, Überheilung als Deckung, innerhalb einer eigenen Zone kämpfen | Katerfass |
| Bärbel / Heilerin | Nachsorgechor | Heilung über Zeit erhalten, Überheilung in Schutz und Heilung in Angriffsverstärkung umwandeln | Sanitäts-Pogo: platzierte Heilzone |
| Bärbel / Heilerin | Lärmtherapie | Markieren und angreifen, um sich zu heilen; Heilung verkürzt die Markierungs-Abklingzeit | Feedback-Infusion: zeitweise mehr Schadensheilung |
| Bärbel / Heilerin | Bühnenabriss | Heilung lädt verstärkte Angriffe, Takt aufbauen und den Finisher gezielt erneut bereitmachen | Zugabe, ihr Säcke! |
| Kevin / Fernkampf | Zündmeister | Markierungen verteilen, mehrere Ziele detonieren und brennende Flächen nutzen | Kettenzündung |
| Kevin / Fernkampf | Schrottkoloss | Grundangriff wird Nahkampf, Druck wird zu Deckung, Gegner heranziehen | Magnetpanzer |
| Kevin / Fernkampf | Pfandjäger | Ausweichen lädt den Wurf, Gegner mit Fallen kontrollieren und Abstand gewinnen | Pfandseil |

Jeder Baum hat zehn einmal lernbare Talente in fünf Reihen. Zwei verteilte Punkte öffnen die nächste Reihe; Verbindungen markieren Voraussetzungen. Ab Stufe 2 gibt es einen Punkt pro Stufe, maximal zehn. Eine aktive Fähigkeit liegt jeweils in Reihe drei und ist frühestens auf Stufe 6 erreichbar. Hohe Stufen allein schalten sie nicht frei. Umskillen und Figurenwechsel sind am Clan-Treff außerhalb des Kampfes möglich. Klassenressourcen und Flächen werden dabei entfernt; Lebenspunkte und Abklingzeiten werden nicht aufgefüllt.

## Werte und Gegenstände

| Wert | Nutzen für jede Klasse |
|---|---|
| Standfestigkeit | Mehr Lebenspunkte |
| Wumms | Grundschaden, besonders direkte Treffer; außerdem Rüstung, Heilung und Schilde |
| Taktgefühl | Grundschaden, kritische Treffer und Tempo |
| Bastelgrips | Grundschaden, besonders technische Effekte; Heilung, Schilde und Randale-Regeneration |
| Dicke Haut | Schadensminderung |
| Glückstreffer | Kritische Treffer |
| Drehzahl | Kürzere normale Abklingzeiten und globaler Cooldown |
| Handschrift | Stärkere Markierungen, Eskalationen, Heilung und Schilde |

Werteprofile auf zufälligen Gegenständen heißen Wucht & Ausdauer, Tempo & Präzision und Technik & Regeneration. Sie sind nicht an Figuren oder Talentbäume gebunden. Vorhandene gewürfelte Gegenstände, Beutetabellen, seltene Einzelstücke und die Auswahl eines von drei Questgegenständen bleiben erhalten. Talente spezialisieren die Verwendung der Werte, statt andere Werte nutzlos zu machen.

## Stufen und Tempo

Die EP bis zur nächsten Stufe betragen 140 × aktuelle Stufe. Stufe 2 liegt bei insgesamt 140, Stufe 5 bei 1400 und Stufe 6 bei 2100 EP. Kills geben je nach Gegner 30, 45 oder 150 EP. Ortsaufträge geben 180 oder 220, der Hauptauftrag 600 EP. Die Stufentabelle steht in der README und an den gesperrten Skill-Icons.

`node scripts/class-pacing.mjs` simuliert echte Kämpfe und Erholung mit 16–24 Sekunden Such-/Laufbudget pro Einzelgegner. 15 % sind Ruhewärter; keine Ausrüstung, Verpflegung oder optimiertes Kiting. Die gemischte Route ergänzt alle 15 Kills einen Ortsauftrag mit 180 EP und drei Minuten geschätztem Reise-/Aktivitätsbudget. Je fünf Zufallsfolgen pro Klasse und Route ergeben 30 Durchläufe:

| Figur | Fünf Kernfähigkeiten, nur Gegner | Fünf Kernfähigkeiten, gemischt |
|---|---:|---:|
| Dieter | 28,9 min | 30,6 min |
| Bärbel | 31,5 min | 32,5 min |
| Kevin | 31,2 min | 32,4 min |

Das ist eine reproduzierbare Modellrechnung, keine gemessene menschliche Spielzeit. Lesen, looten, Umwege, Ausrüstung, Hauptquest und Fehler verändern das Ergebnis. Vier Kernfähigkeiten stehen im Modell nach etwa 20–22 Minuten bereit; der Finisher vervollständigt die Rotation auf Stufe 6. Bärbels frühe Rotation enthält Heilung anstelle eines zweiten Wurfs.

## Prüfung

- Automatisierte Tests prüfen universelle Werte, alle neun Builds, Speichern, Grenzen beim Lernen, Talentfreischaltungen, Deckung, doppelte Parade, Nachheilung, Überheilung, Schadensheilung, verstärkte Treffer, Flächenplatzierung, Fallen, Magnetanziehung und Mehrziel-Detonation.
- `scripts/class-ui-check.mjs`: alle neun Bäume per Browser lernen, neue Skills auf der Leiste, 39 unterschiedliche gerenderte Icons, Laden und mobile Fenstergrenzen. Sichtprüfungen der Skillbücher, Talentfenster und mobilen Darstellung.
- `scripts/progression-combat.mjs`: echte Navigation und Eingaben im Browser, Fernkampf, Maus-Flächen, Unterbrechen während GCD, Ausweichen, leuchtende Skills und Tab-Targeting mit offenem Inventar. Testfigur mit Stufe 11 und seltener Ausrüstung für die vollständige Bedienungsprüfung.
- `scripts/progression-quests.mjs`: mit einem frischen Charakter beide Minispiele über echte Laufwege erledigt, je eines von drei Ausrüstungsteilen gewählt, direkt angezogen und Fortschritt nach Neuladen geprüft.
- `scripts/balance-clan.mjs 013`: 30 Zufallsfolgen je Konfiguration. Ein Startgegner lebt im Mittel 7,72 Sekunden; drei oder zehn gleichzeitig angegriffene Gegner töten den unvorbereiteten Starter in allen Durchläufen. Auf Stufe 6 senkt seltene Ausrüstung die Einzelkampfzeit von 5,8 auf 4,3 Sekunden; zehn Gegner bleiben tödlich. Diese Probe nutzt stehenden Kampf ohne Ausweichen oder Verpflegung.

Ergebnisse und Screenshots: `progression-review/classes-013/`, `progression-review/balance-013/`. Die drei neuen Grafik-Atlanten liegen unter `assets/clan-skills-013/`; Herkunft und Generierungsprompts stehen dort in `PROMPTS.md`.
