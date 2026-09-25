# Playtest 2026-09-24 · Dungeon „Schloss Big B“ · Kenner, Lauf 1 (Build #549)

Persona `kenner-agent`, live. **Dungeon nicht betreten:** Der vorbereitete Stufe-9-Held fehlte (Vorbereitungsfehler des Orchestrators, Heldenliste-Format), gespielt wurde „Dieter“ Stufe 4. Geprüft: Dungeon suchen, Söldner anheuern, Gruppenkampf im Freien, Beute, Tod. 50 Aktionen. Screenshots `visual-review/dungeon-2026-09-24/spieler-01…09.png` (nicht im Repo).

## Top 12

| # | Wo | Was passiert / fehlt | Aus WoW gewohnt | Einstufung |
|---|---|---|---|---|
| 1 | Heldenauswahl | Stufe-9-Spielstand fehlte (Vorbereitung) | – | (Testfehler) |
| 2 | Karte (M), Minikarte | kein Dungeon-Eingang in Karte, Ortsliste oder Symbolfilter; unter Stufe 8 erfährt man nicht, dass es ihn gibt | Dungeon-Eingänge stehen immer als Symbol mit Name und Stufenbereich auf der Karte, auch zu niedrig – das lockt | bricht ab |
| 3 | Karte | keine Straßennamen, „an der Burgstraße“ hilft im Spiel nicht | Namen in der Zonenkarte | stockt |
| 4 | Hilfe, Spielmenü | kein Dungeon-Journal, nichts zu Dungeons, Gruppen, Rollen, Kontrollpunkten | Journal mit Bossen, Fähigkeiten, Beute, Stufe, Gruppengröße | fehlt |
| 5 | Gruppe | keine Gruppensuche; nur Söldner | Gruppensuche mit Rolle, notfalls NPC-Begleiter | fehlt |
| 6 | Aufträge | kein Dungeon-Auftrag, kein Hinweis-NPC, auch nicht grau „zu niedrig“ | Dungeon-Aufträge in der Stadt davor, grau solange zu niedrig | fehlt |
| 7 | Gruppenkampf im Freien | ein Pull auf einen Pfandkeiler (St. 2) löst eine Kette von 9 Keilern aus; Söldner (St. 4) nach ~15 s am Boden, Held kurz danach; keine Warnung vor Hilfe-Aggro. Gleiche Kettenlogik im Dungeon-Trash wäre ein Gruppenkiller | feste Trash-Gruppen mit sichtbaren Grenzen, soziale Aggro nur innerhalb der Gruppe | stockt |
| 8 | Kampffluss | Tab-Ziel außer Reichweite: Kelle (2) tut nichts, kein Hinlaufen; nur 6 schließt die Lücke | hinlaufen oder klare Meldung | stockt |
| 9 | Aktionsleiste | „Noch nicht bereit.“ direkt nach 6, Druck auf 7 verpufft; 6 hatte ohne sichtbare Meldung noch Abklingzeit | Tastenpuffer, Meldung bei Abklingzeit | wundert sich |
| 10 | Beute | Kadaver hinter Baum, nichts zu plündern; später automatisch eingesammelt und automatisch angelegt („Angelegt: Flohmarkt-Keilerzahn-Talisman … der Platz war frei“) – kein Beute-Moment, kein Vergleich, keine Wahl; für Boss-Beute (Bedarf/Gier) zu wenig Bühne | Beutefenster, Seltenheitsfarben, würfeln | wundert sich |
| 11 | Verdeckung | Figuren, Söldner, Kadaver verschwinden hinter Baumkronen; Held hat Umriss, Kadaver/Gegner nicht; in engen Dungeon-Räumen mit Säulen kritisch | nichts verdeckt Kampf und Beute | wundert sich |
| 12 | Allgemein | Schwierigkeitsgrade, Abschluss-Belohnung, Stockwerkskarte von außen nirgends angekündigt | Normal/Heroisch, Tagesbonus, Karte mit Stockwerken | fehlt (ungeprüft) |

## Gut
1. Söldner-Fenster: klar nach Rollen, Preis, Vertragsdauer; zwei Klicks, dann Gruppenrahmen mit Leben, Rolle, Restzeit; Peter spottet sichtbar.
2. Todesbildschirm: Mörder und Fähigkeit, Rettungstasten, Söldner stehen nach Countdown wieder auf – lehrreich und fair.
3. Warnungen: Zauberbalken „Sprung · ausweichen“, roter Bodenkreis; Gegner-Tooltip mit Stufe, Auftrag, Beutechance.

## Kampf (im Freien)
Einzelgegner zu leicht und kurz (Keiler 460 Leben in 3–5 s mit zwei Söldnern, eigene Rotation kaum möglich). Mehrfach-Pull kippt schlagartig ins Unfaire (9 Gegner, Heilerin nach ~10 s leer, Wipe) – kein Mittelfeld. Im Getümmel stapeln sich 9 Namensschilder über dem Kampf.

## Söldner
64 Pfandmarken reichen für genau 2 Söldner; Anzeige „3/5 Gruppenplätze belegt“ – unklar, dass man selbst mitzählt und welche Gruppengröße der Dungeon braucht.

## Ein Satz an die Entwickler
„Macht den Dungeon sichtbar, bevor man ihn betreten darf – Kartensymbol mit Stufe und Gruppengröße, Journal-Eintrag, Hinweis-Auftrag – und sorgt dafür, dass Trash in festen, vorhersehbaren Gruppen kommt.“
