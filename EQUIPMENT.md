# Clan-Ausrüstung · 0.14

16 Plätze: Haupt-/Nebenhand, Fernkampf, Kopf, Hals, Schultern, Brust, Armschienen, Handschuhe, Gürtel, Beine, Schuhe, Ring I/II und Glücksbringer I/II. Alle Werte wirken weiter bei jeder Figur; es gibt keine nach Klasse gesperrten Gegenstände.

## Waffen und Skills

| Kombination | Wirkung |
| --- | --- |
| Einhand + Schild | Waffenschaden aus der Haupthand; Rüstung und Zugriff auf Schildfähigkeiten |
| Zwei Einhandwaffen | Nahkampfwaffenschaden = Haupthand + 50 % Nebenhand; sämtliche Zusatzwerte beider Teile wirken vollständig |
| Zweihandwaffe | Höhere Schadensspanne, belegt beide Hände, kein Schild gleichzeitig |
| Fernkampfplatz | Separat ausgerüstete Pfandschleuder oder Schallwerfer; erforderlich für die entsprechenden Fernkampfangriffe |

Waffen besitzen `weapon.type`, `hands`, `min`, `max`; `stats` ist optional. Gewürfelte Waffen erhalten Schadensspanne und Zusatzwerte anhand von Stufe, Qualität und gespeichertem Roll. Der Roll bleibt beim Neuladen gleich. Jeder Waffenskill würfelt innerhalb seiner aktuellen Waffenspanne. Sein beschriebener Grundschaden wird mit `Waffenwurf / 17` multipliziert, anschließend wirken wie bisher Attribute, Talente, kritische Treffer und Verwundbarkeit. 17 ist der mittlere Schaden der einfachen Startwaffe. Flächentechnik, Schaden über Zeit, Heilung und Buffs skalieren weiterhin über ihre eigenen Werte; ein besserer Prügel verstärkt nicht pauschal jeden Zauber.

| Kniff | Voraussetzung / Waffenbasis |
| --- | --- |
| Dieters Grundangriff und Abriss | Nahkampfwaffe in der Haupthand |
| Bärbels Grundangriff und Bass | Fernkampfwaffe |
| Kevins Grundangriff und Rakete | Fernkampfwaffe; als Schrottkoloss Nahkampfwaffe |
| Gezielter Wurf aller Figuren | Fernkampfwaffe |
| Parade aller Figuren, Absperrband, Magnetpanzer | Schild in der Nebenhand |
| Tresensprung | Zweihandwaffe oder zwei Einhandwaffen |
| Ausweichen, Unterbrechen, Markieren, Heilung, Buffs, übrige Technik | Keine Waffenvoraussetzung |

Fehlende Ausrüstung blockiert vor Ressourcenkosten, GCD, Zielwahl oder Bodenplatzierung. Der Skill bleibt gelernt und belegt seinen Button; ein rotes `!` und der Tooltip erklären die fehlende Voraussetzung. Ausrüstungswechsel beenden eine aktive Parade und Boden-Zielauswahl. Laufende Buffs und bereits ausgelöste Effekte bleiben bestehen.

## Bedienung und Gegenstandsschutz

Im Rucksack ein Icon auswählen und den gewünschten Platz antippen. Am PC funktionieren zusätzlich Doppelklick, Rechtsklick oder Ziehen auf einen Charakterplatz. Bei zwei passenden Plätzen werden beide Buttons angeboten. Gewöhnliche identische Ringe können zweimal angelegt werden; dieselbe einzigartige Dorflegende höchstens einmal. Verschiedene Dorflegenden dürfen gleichzeitig getragen werden.

Ein Zweihänder legt Haupt- und Nebenhand gemeinsam ab. Der frei werdende Rucksackplatz der neuen Waffe nimmt ein altes Teil auf; für das zweite muss ein weiterer Platz frei sein. Fehlt Platz, bleibt der gesamte vorherige Zustand erhalten. Ein Schild oder eine Nebenhandwaffe verdrängt umgekehrt einen getragenen Zweihänder. Die Haupthand ist dann zunächst leer. Ein automatischer Einhandwechsel von einem Zweihänder wählt die Haupthand.

Im Charakterfenster stehen alle Plätze als beschriftete Icons. Anklicken zeigt Werte und einen Ablegen-Button, der auch per Touch funktioniert. Das Fenster lässt Kämpfe und Bewegung weiterlaufen. Im sicheren Startbereich gibt die **Clankiste** einmalig eine Dosenklinge und einen Tresenhammer zum Ausprobieren; die übliche Startausstattung umfasst Flasche, Kutte, Topfdeckel und Pfandschleuder.

## Beute und bestehende Spielstände

Menschen können alle neuen Ausrüstungskategorien fallen lassen. Tiere behalten zur Kreatur passende Materialien, Talisman-Funde und sehr seltene Dorflegenden; ihre Beutequoten bleiben unverändert. Gewöhnliche Ausrüstung sowie seltene Waffen würfeln Bauart und Werte. Frühe Waffenquests bieten eine Auswahl aus Schild, Zweihandwaffe und Fernkampfwaffe. Andere Aufträge verteilen weitere Slots mit drei Attributprofilen zur Auswahl.

RPG-Speicherversion 4 migriert den alten Glücksbringer zu Ring I oder Glücksbringer I. Die Ruhepfeife ist jetzt eine Fernkampfwaffe, Horsts Stempel ein Zweihänder. Fehlende neue Startplätze werden bei der Migration einmalig ergänzt; danach bleiben bewusst geleerte Plätze leer. Aus inkonsistenten Altzuständen zurückgewonnene Teile werden bei vollem Rucksack separat gesichert und lassen sich im Inventar einpacken. Questfortschritt, Stufen und vorhandene Gegenstände bleiben erhalten.

## Set-Boni · Konzept (Daten erst nach Freigabe)

Dorflegenden stehen heute für sich. Drei von ihnen tragen dasselbe Wappen – den Ordnungsdienst **Ruhe 22:01**: die Trillerpfeife der Ruhestörung (`ruhepfeife`, Fernkampf), der laminierte Praktikantenausweis (`praktikantenausweis`, Talisman) und Olafs Dienstmütze (`dienstmuetze`, Kopf). Wer alle drei zusammenträgt, hat sich die Uniform des Feindes angezogen – das gehört belohnt.

| Teile getragen | Bonus (Entwurf) | Warum |
| --- | --- | --- |
| 2 von 3 | Unterbrechen sperrt 10 % länger | beide vorhandenen Procs des Satzes drehen sich ums Unterbrechen |
| 3 von 3 | Unterbrechen macht das Ziel 4 s lang 10 % verwundbar (»Vermerkt.«) | genau die Wirkung, die Olafs Mütze allein nicht bekommt (Engine-Backlog) |

Absicht: kein vierter Wertesatz, sondern **eine Regel**, die man im Kampf merkt. Der Satz kostet drei Plätze in drei verschiedenen Kategorien (Fernkampf, Kopf, Talisman) und bindet damit echte Beute; kein Teil ist vor Stufe 2 erreichbar, alle drei realistisch erst ab Stufe 4. Set-Boni fügen **keine Primärwerte** hinzu – sonst hebeln sie das Wertebudget aus `content/balance.js` aus.

Offen, bevor Daten entstehen: **Gameplay** entscheidet, ob Set-Boni ins Spiel gehören (`docs/backlog/gameplay.md`); **Engine** braucht eine Satz-Zählung beim Anlegen und die Verwundbarkeits-Wirkung (`docs/backlog/engine.md`). Erst danach entsteht `SETS` in `content/items.js` mit einer Prüfung in `content/checks/loot.js`: jedes Teil existiert, kein Teil steht in zwei Sätzen, ein Satz hat mindestens drei Teile, kein Bonus vergibt Primärwerte.

## Prüfung

- `tests/equipment.test.mjs`: alle Slots, Schadensgrenzen, Waffenbindung, zwei Ringplätze, Einzigartigkeit, Transaktionen bei vollem Rucksack, alte Spielstände und einmalige Clankiste.
- `scripts/equipment-review.mjs`: echte UI-Wechsel, Zwei-/Einhand und Schild, Ring-/Glücksbringerplätze, Tooltips, Sperranzeige und Speicherung. Per CDP-Touch im Hoch- und Querformat zusätzlich Ausrüsten/Ablegen. Keine physische Geräteprüfung.
- Screenshots: [Zweihand](progression-review/mobile-014/equipment-twohand.jpg), [Vergleich beider Hände](progression-review/mobile-014/equipment-comparison.jpg), [Handyansicht](progression-review/mobile-014/equipment-phone.jpg).

Neue Ausrüstungs-Icons werden aus eigenen Pixelzeichnungen in `item-art.js` gerendert; sie übernehmen Konturen und Farben der vorhandenen Clan-Oberfläche.
## Gemeinsame Inhaltsdaten

Die gleichzeitig veröffentlichte Inhaltsschicht bleibt erhalten. Feste Waffen und Schilde stehen in `content/items.js`; Plätze, Bauarten und Skillvoraussetzungen in `content/equipment.js`, Formelfaktoren in `content/balance.js`, Beutequoten in `content/drops.js`. Auch das neue Megafon und Giselas Gießkanne besitzen passende Waffenwerte. `content/schema.js` prüft Typ, Hände, Slot und Schadensgrenzen. Der Offline-Build nimmt sämtliche Inhaltsmodule mit auf.
