# Brainstorming: Berufe und Mounts – Konzept und KI-Umsetzungsbriefing

Stand: 21.09.2026 · nach Abgleich mit `origin/main` auf `4efc012`

**Status: Brainstorming – Ideensammlung und Entwurf für einen späteren Implementierungsauftrag, keine Umsetzungsfreigabe.** Das Erstellen dieser Datei beauftragt noch keine Implementierung. Dieses Dokument kann später vollständig an eine ausführende KI übergeben werden; Abschnitt 12 enthält den zugehörigen Startprompt.

Es bündelt Berufs- und Mount-Auswahl, Darstellung, Spawns, Multiplayer-Regeln, Serveranforderungen, Umsetzungsreihenfolge und Abnahme. Die Überarbeitung trennt einen anschlussfähigen Koop-Ausbau nach E-35 von einer späteren vollständig serververwalteten Wirtschaft. Genannte Aufträge, Lehrer, Rezepte, Fundstellen und Mounts sind geplante Inhalte und nicht als bereits implementiert zu verstehen. Konkrete Zahlen und noch offene Produktentscheidungen sind gesondert gekennzeichnet.

**Nutzervorgaben:** Dorf-/Maifeld-Setting; Sammelberufe mit entsprechenden Handwerksberufen; vielseitige Mounts einschließlich Mofas, Rollern und dem Pferd des Nachbarbauern; Planung im MMORPG-Kontext; Grundlage vor großer Inhaltsmenge. **Mobile bleibt vorerst zurückgestellt.**

**Umsetzungsnachtrag 22.09.2026:** Der neue Nutzerauftrag gibt Mounts zur Implementierung frei. Die erste Stufe mit Klappermofa, Blechroller und Hofpferd ist im [Mount-Bericht](MOUNTS-2026-09-22.md) beschrieben. Der folgende Nutzerauftrag gibt auch Berufe zur Umsetzung frei: Schrottsammeln, Kräutersammeln, Schrauberei und Hausbrauerei sind als erste Stufe im [Berufsbericht](BERUFE-2026-09-22.md) dokumentiert. Weitere Berufe, Mounts und die vollständig serververwaltete Wirtschaft bleiben Brainstorming. Die aktuellen Umsetzungsberichte haben für implementierte Regeln Vorrang vor den folgenden Entwürfen.

## 1. Leitidee

Berufe verbinden das Sammeln in der Spielwelt mit passenden Handwerksberufen: Materialien finden, Rezepte lernen und daraus nützliche Gegenstände herstellen. Die Struktur orientiert sich am gewünschten MMO-Prinzip, die Ausgestaltung am Dorf-, Vereins- und Maifeld-Setting.

Mounts umfassen Fahrzeuge und Tiere: alte Mofas und Roller gehören ebenso dazu wie das Pferd des Nachbarbauern. Sie erleichtern das Reisen und bieten sichtbare Sammelziele. Ein bestimmter Beruf darf keine Voraussetzung sein, um ein Mount nutzen zu können.

## 2. Berufe

### Übersicht

Vorgesehen sind drei Sammelberufe und vier Handwerksberufe. Kochen und Angeln kommen später als frei zugängliche Nebenberufe hinzu.

| Beruf | Art | Sammelgut / Rohstoffe | Ergebnis und Nutzen | Einführung |
|---|---|---|---|---|
| **Schrottsammeln** | Sammeln | Dosenblech, Kabel, Metallteile und später Altmechanik aus Schrotthaufen | Versorgt Schrauberei und Elektrobastelei | Erste Ausbaustufe |
| **Kräutersammeln** | Sammeln | Wilder Eifelhopfen, Kräuter und Beeren | Zutaten für Getränke und Verpflegung | Erste Ausbaustufe |
| **Wildverwertung** | Sammeln | Felle, Borsten und Federn von besiegten Wildtieren | Materialien für Kleidung und Zubehör | Später |
| **Schrauberei** | Handwerk | Schrott, Metallteile und einfache Händlerzutaten | Improvisierte Waffen, Schilde und später selbst gebaute Mofas | Erste Ausbaustufe; Fahrzeugbau später |
| **Hausbrauerei** | Handwerk | Hopfen, Kräuter, Wasser und Leerflaschen | Heil- und Energiegetränke sowie zeitweilige Stärkungen; auch alkoholfreie Rezepte | Erste Ausbaustufe |
| **Klamottenmacherei** | Handwerk | Felle, Stoffreste, Garn und Schnallen | Kutten, Handschuhe, Stiefel und Taschen | Später |
| **Elektrobastelei** | Handwerk | Kabel, Schrott und elektrische Bauteile | Technische Schmuckstücke und Hilfsmittel mit eigenen Effekten | Später |
| **Kochen** | Nebenberuf | Lebensmittel, Fisch und gesammelte Zutaten | Verpflegung und länger wirkende Essensboni | Später, für alle zugänglich |
| **Angeln** | Nebenberuf | Fische aus geeigneten Gewässern | Liefert insbesondere Zutaten fürs Kochen | Später, für alle zugänglich |

Schrauberei und Elektrobastelei erhalten getrennte Schwerpunkte: Schrauberei baut mechanische Ausrüstung und Fahrzeuge; Elektrobastelei liefert technische Hilfsmittel. Beide sollen eigenständige Rezeptgruppen haben.

### Kombinationen und Materialwege

| Sammelberuf | Passendes Handwerk | Beispielhafter Materialweg |
|---|---|---|
| Schrottsammeln | Schrauberei | Schrott und Metallteile → Ausrüstung; später Fahrzeugteile und Eigenbauten |
| Schrottsammeln | Elektrobastelei | Kabel und elektrische Bauteile → technische Hilfsmittel |
| Kräutersammeln | Hausbrauerei | Hopfen, Kräuter und Händlerzutaten → Getränke |
| Wildverwertung | Klamottenmacherei | Felle und weitere Textilzutaten → Kleidung und Taschen |
| Angeln als Nebenberuf | Kochen als Nebenberuf | Fisch und Lebensmittel → Verpflegung |

Diese Kombinationen sind Empfehlungen, keine Pflichtbindungen. Materialien können zusätzlich aus Beute und – bei einfachen Zutaten – vom Händler kommen. Die Systeme sollen bereits ohne Spielerhandel funktionieren.

### Berufsregeln

| Thema | Geplanter Ansatz |
|---|---|
| **Berufswahl** | Zwei Hauptberufe pro Heldenslot, unabhängig von Klasse, Aussehen und Hauptbaum. Sammeln + Handwerk, zweimal Sammeln oder zweimal Handwerk sind möglich. Nebenberufe belegen diese Plätze nicht. |
| **Sammeln** | Sichtbare Fundstellen mit kurzer Sammelaktion. Pflanzen wachsen nach, andere Fundstellen werden wieder aufgefüllt. Materialien können zusätzlich als Beute vorkommen. |
| **Fortschritt** | Passende Sammelaktionen und Rezepte steigern den Beruf. Zu einfache Rezepte bringen später keinen Fortschritt mehr. |
| **Rezepte** | Grundlagen beim Lehrer; besondere Rezepte durch Aufträge, Erkundung und Beute. |
| **Herstellungsorte** | Verpflegung unterwegs; Ausrüstung und Fahrzeuge an Werkbank, Braukessel oder Nähtisch, soweit für das Rezept passend. |
| **Nutzen der Ausrüstung** | Handwerk schließt gezielt Ausrüstungslücken. Besondere Rezepte sollen auch später interessant bleiben. |
| **Kalles Kiosk** | Einfache Zutaten kaufen und hergestellte Gegenstände verkaufen. Seltene Materialien kommen überwiegend aus der Spielwelt. |
| **Materialschutz** | Für aktive Aufträge reservierte Materialien bleiben geschützt. Bauvorräte werden vor der Herstellung deutlich als solche angezeigt. |
| **Wirtschaft** | Preise, Erträge und Materialkosten gemeinsam abstimmen. Einkaufen, Herstellen und Zurückverkaufen darf keine unbegrenzte Geldquelle erzeugen. |

Vorhandene Materialien wie Dosenblech, Kabel, Hopfen, Borsten, Federn und Felle bieten Anknüpfungspunkte. Ihre Verwendung für Berufe muss mit bestehenden Aufträgen und dem Basisbau abgestimmt werden.

## 3. Mounts

### Überarbeitete Auswahl

Die frühere, überwiegend auf Mofas beschränkte Auswahl wird durch folgende Mischung aus Dorf-Fahrzeugen, Hoftieren und Eigenbauten ersetzt.

| Mount | Aussehen und Charakter | Möglicher Erwerb | Einordnung |
|---|---|---|---|
| **Opas Drahtesel** | Altes Fahrrad mit Ledersattel, Dynamo und quietschendem Gepäckträger | Früher Dorfauftrag | Spätere Ergänzung |
| **Klappermofa** | Rostiger Tank, geflickter Sitz und unruhiger Zweitakter | Kleine Reparaturquest | Erste Ausbaustufe |
| **Alter Blechroller** | Runder Scheinwerfer, stumpfer Lack, Chromspiegel und Ersatzrad | Fahrzeughändler gegen Pfandmarken | Erste Ausbaustufe |
| **Baumarkt-Roller** | Plastikverkleidung, Klebeband am Blinker und Helmfach | Gebrauchter Roller aus einer Auftragsreihe | Spätere Ergänzung |
| **Scheunenfund-Moped** | Schmaler Rahmen, langer Sitz und auffälliger Auspuff | In einer Scheune entdecken und wieder herrichten | Spätere Ergänzung |
| **Feldweg-Enduro** | Hohe Federung, Stollenreifen und reichlich Schlamm | Spätere Werkstatt-Aufträge | Spätere Ergänzung |
| **Vereins-Lastenrad** | Getränkekisten, Vereinswimpel und klappernde Flaschen | Dem Dorfverein aushelfen | Spätere Ergänzung |
| **Eigenbau-Mofa** | Unterschiedliche Bauteile, selbst gebauter Gepäckträger und Wunschlackierung | Fortgeschrittene Schrauberei | Späteres Handwerksprojekt |
| **Jagdquad** | Breite Reifen, Gepäckträger und Werkzeugkasten | Aufträge rund um Wald und Feld | Spätere Ergänzung |
| **Aufsitzmäher „Rasenkönig“** | Ausgeblichener Sitz, abgesägter Fangkorb und übertriebener Auspuff | Besondere Garten- oder Vereinsquest | Späteres Sammlerstück |
| **Pferd des Nachbarbauern** | Kräftiges braunes Hofpferd mit einfacher Satteldecke | Auf dem Hof helfen; anschließend dauerhaft die Erlaubnis erhalten, es zu reiten | Erste Ausbaustufe |
| **Freches Hofpony** | Zottelige Mähne, kurzer Schritt und eigenwilliger Blick | Entlaufenes Pony zurückbringen und sein Vertrauen gewinnen | Spätere Ergänzung |
| **Packesel** | Große Ohren, alte Satteltaschen und gemütlicher Trab | Lieferaufträge zwischen Höfen | Spätere Ergänzung |
| **Alter Hofschlepper** | Kleiner offener Traktor mit abgewetztem Fahrersitz | Spätes Restaurierungsprojekt | Erst nach gesonderter Prüfung von Größe und Wegfindung |

### Sichtbare und hörbare Unterschiede

| Gruppe | Anforderungen an die Darstellung |
|---|---|
| **Fahrräder** | Die Figur tritt in die Pedale; Räder drehen sich. Eine Klingel kann als kleine Zusatzaktion dienen. |
| **Mofas und Mopeds** | Passende Sitzhaltung, Hände am Lenker, Startanimation und dezentes Auspuffknattern. |
| **Roller** | Aufrechte Haltung, Füße auf dem Trittbrett und eine deutlich andere Silhouette als beim Moped. |
| **Motorräder und Quads** | Eigene Sitzpose, sichtbare Federung und kräftigerer Motorsound. |
| **Pferde und Ponys** | Schritt beziehungsweise Trab, bewegte Beine, Schweif und Ohren. Die Reiterbewegung folgt dem Tier. |
| **Esel** | Eigenständiger Körperbau und Gang; Ohrenwackeln oder Schnauben. Keine zufällige Steuerungsverweigerung. |
| **Sonderfahrzeuge** | Eigene Animationen und Geräusche. Größe und Wegfindung müssen zur bestehenden Karte passen. |

Figur und Mount werden gemeinsam dargestellt und animiert. Das Aussehen (`look`) ist seit E-38 unabhängig von der Klasse (`classId`): Alle drei vorhandenen Körperformen müssen auf jedes erste Mount passen, auch bei klassenfremdem Aussehen und angelegter Ausrüstung. Hände, Füße und Sitzposition müssen am jeweiligen Mount passen; ein Fahrzeugbild unter einer unveränderten stehenden Figur reicht nicht aus.

### Mount-Regeln

| Thema | Geplanter Ansatz |
|---|---|
| **Früher Zugang** | Früh ein einfaches Fahrzeug oder ein Hoftier freischalten können. Niemand muss zuerst Mofa fahren oder Schrauberei lernen. |
| **Steuerung** | Bestehende Bewegung und Wegfindung verwenden. Kein zusätzliches Fahrzeug-Fahrmodell. |
| **Aufsteigen** | Kurze Aktion außerhalb des Kampfes über einen belegbaren Aktionsleistenplatz. |
| **Absteigen** | Erneute Aktivierung, eigene Kampfaktion oder Betreten eines Innenraums. Vor Kalles Kiosk automatisch absteigen. |
| **Geschwindigkeit** | Vergleichbare Reisegeschwindigkeit innerhalb derselben Fortschrittsstufe. Ein Pferd soll gegenüber einem Roller keinen systematischen Nachteil haben. Werte erst anhand der Laufwege festlegen. |
| **Besondere Varianten** | Lackierungen, Satteldecken, Gepäckträger und Vereinsfarben als sichtbare Belohnungen. Seltenheit bedeutet nicht automatisch höhere Geschwindigkeit. |
| **Berufe** | Schrauberei bietet exklusive Eigenbauten und Fahrzeugoptik. Tiere und normale Kauf-Mounts bleiben unabhängig von Berufen zugänglich. |
| **Seltene Mounts** | Besondere Auftragsreihen, Erkundung und spätere Ereignisse liefern Sammlerstücke. |
| **Alltag** | Kein verpflichtendes Tanken, Füttern oder regelmäßiges Reparieren. Solche Tätigkeiten können Bestandteil einer Freischaltquest sein. |
| **Sammlung** | Freigeschaltete Mounts stehen in einem Verzeichnis und belegen keinen Inventarplatz. Vorschlag für den Einstieg: Besitz je Heldenslot; eine kontoweite Sammlung ist eine spätere Produktentscheidung. |

## 4. Berufe in der gemeinsamen Welt: Darstellung und Spawns

### Weltobjekte

Alle Spieler derselben Zone und Instanz sehen dieselben Weltobjekte und deren gemeinsamen Zustand. Persönliche Nutzungsberechtigungen dürfen die Interaktionsanzeige unterscheiden, ohne eine zweite, unabhängig erzeugte Welt vorzutäuschen.

| Objekt | Darstellung | Standort und Spawn | Verhalten bei mehreren Spielern |
|---|---|---|---|
| **Kräuter und Hopfen** | Eigene Pflanzen-Sprites; erntereif, abgeerntet und nachwachsend unterscheidbar | Vorbereitete Standorte an Feldrändern, Hecken und feuchten Stellen; ein Teil ist gleichzeitig erntereif | Gemeinsames Erntefenster; jeder berechtigte Spieler erhält höchstens einmal Material pro Zyklus |
| **Schrotthaufen** | Varianten mit Metall, Kabeln und Altmechanik; durchsuchter Rest bleibt zeitweise sichtbar | Werkstätten, Scheunen, Sperrmüll und verlassene Stellplätze | Gleiche Erntefenster-Regel wie Pflanzen |
| **Verwertbare Tierkörper** | Verwertbarkeit über dezentes Berufssymbol bei Auswahl anzeigen | Entstehen aus einem besiegten Tier, nicht zusätzlich als unabhängige Materialquelle | Berechtigung aus serverseitig bestätigter Beteiligung beziehungsweise Gruppenbeute; Fremde nehmen keine Belohnung weg |
| **Angelstellen** | Wasserbewegung und gelegentliche Fischbewegungen | Geeignete Bach- und Teichabschnitte; besondere Schwärme wechseln zwischen vorbereiteten Stellen | Gleichzeitiges Angeln möglich; jeder erhält seinen eigenen Fang |
| **Werkbank** | Werkzeug, Schraubstock und Arbeitsanimation | Dauerhaft in Werkstätten und an Gemeinschaftsplätzen | Gleichzeitig nutzbar; persönliche Herstellungsvorgänge statt exklusiver Belegung |
| **Braukessel und Nähtisch** | Erkennbare Geräte mit kurzer Animation und Geräuschen | Feste Berufsstationen | Gleichzeitige Nutzung durch mehrere Spieler |
| **Berufslehrer** | Benannter NPC mit passender Kleidung und Arbeitsplatz | Fester, auf der Karte auffindbarer Standort | Gleichzeitiges Lernen und Einkaufen möglich |

### Platzierung und Wiederkehr

- Fundstellen verwenden vorbereitete, zum Gebiet passende mögliche Standorte. Der Server wählt daraus aktive Standorte; Browser erzeugen keine eigenen Ressourcen.
- Bei der Platzierung Wege, Türen, Gebäude, Kollisionen und erreichbare Interaktionspunkte berücksichtigen. Keine Fundstelle darf innerhalb eines Hindernisses oder in einem unzugänglichen Dekorationsbereich landen.
- Stabile Objekt-IDs bleiben über Speichern und Neustarts erhalten. Jeder neue Ressourcendurchlauf erhält eine eigene Zykluskennung.
- Der Server verwaltet Aktivierung, Erschöpfung und Wiederkehr. Ein Spieler, der neu einloggt oder in Sichtweite kommt, erhält den vorhandenen Zustand und löst keinen neuen Spawn aus.
- Abgeerntete Pflanzen beziehungsweise durchsuchte Haufen zeigen zunächst einen passenden Restzustand. Nachwachsen oder erneutes Bereitstellen folgt dem gemeinsamen Timer.
- Bei hoher anhaltender Auslastung können zusätzliche vorbereitete Standorte aktiviert werden. Menge und Materialertrag bleiben begrenzt; bloßes Einloggen weiterer Konten darf keine unmittelbar ausnutzbare Materialvermehrung bewirken.
- Respawnzeiten, Zahl gleichzeitig aktiver Stellen und Erträge sind Balancingparameter. In diesem Konzept sind noch keine verbindlichen Sekunden- oder Mengenwerte festgelegt.

### Gemeinsames Erntefenster

| Schritt / Fall | Geplante Regel |
|---|---|
| **Erste erfolgreiche Ernte** | Öffnet ein kurzes gemeinsames Zeitfenster für weitere berechtigte Spieler |
| **Weitere Spieler** | Können innerhalb dieses Fensters jeweils einmal ernten, sofern Beruf, Entfernung und übrige Voraussetzungen passen |
| **Persönliche Anzeige** | Wer bereits geerntet hat, sieht seine ausgeschöpfte Berechtigung; andere sehen weiterhin ihre Sammelmöglichkeit |
| **Fensterende** | Neue Sammelaktionen werden abgelehnt; anschließend ist die Fundstelle erschöpft |
| **Bereits begonnene Aktion** | Ein rechtzeitig serverseitig bestätigter Start darf innerhalb einer begrenzten Abschlussfrist enden; er kann den Spawn nicht unbegrenzt offenhalten |
| **Volles Inventar** | Keine erfolgreiche Ernte, kein Berufsfortschritt und kein Verbrauch der persönlichen Berechtigung ohne vollständige Aufnahme der Belohnung |
| **Abbruch / zu große Entfernung** | Keine Belohnung; Aktion beenden und temporäre Belegung freigeben |
| **Wiederholte Anfrage** | Dieselbe Aktion erhält höchstens einmal Belohnung und Fortschritt |
| **Neuladen / Wiederverbinden** | Setzt weder persönliche Ernteberechtigung noch Erschöpfungszeit zurück |
| **Neuer Zyklus** | Nach serverseitig bestimmter Wiederkehr können Spieler erneut ernten |

Fundstellen markieren keine dauerhaften exklusiven Besitzansprüche. Gruppen sollen zusammen sammeln können. Berechtigungsumfang und Materialerträge müssen zugleich zur geplanten Wirtschaft passen.

## 5. Mounts in der gemeinsamen Welt: Darstellung und Spawns

### Weltobjekt und Spieler-Mount unterscheiden

| Situation | Darstellung und Spawn | Multiplayer-Regel |
|---|---|---|
| **Roller beim Händler** | Dauerhaft ausgestelltes Fahrzeug am Laden oder in der Werkstatt | Kauf schaltet ein Modell persönlich frei; das Ausstellungsstück bleibt für weitere Kunden bestehen |
| **Pferd des Nachbarbauern** | Benanntes Tier auf Hof oder Weide mit kleinem Bewegungsbereich | Die Hofquest erteilt eine persönliche Reitfreigabe; das Hoftier wird nicht für alle anderen entfernt |
| **Scheunenfund-Moped** | Sichtbares Wrack an festgelegtem Fundort | Fund und Restaurierung werden pro Figur geführt; alle können die Auftragsreihe abschließen |
| **Eigenbau-Mofa** | Optional als persönliches Arbeitsprojekt an der Werkbank dargestellt | Fertigstellung schaltet das Mount des Herstellers frei; kein gemeinsames, wegnehmbares Fahrzeug erzeugen |
| **Eigenes Mount rufen** | Kurze Aufsteigeanimation am Spieler; Tier beziehungsweise Fahrzeug erscheint passend dazu | Freischaltung und Zustandswechsel werden dem aktiven Helden zugeordnet und synchronisiert; Mitspieler sehen Typ, Variante, Reiter und Bewegung. Das Vertrauensmodell folgt Abschnitt 7. |
| **Absteigen** | Kurze Absteigeanimation; Mount anschließend ausblenden | In der ersten Umsetzung bleiben keine abgestellten Kopien zurück |
| **Späteres Parken** | Optional an ausgewiesenen Stellplätzen oder Anbindestellen | Begrenzte Dauer und Anzahl; zunächst nur dekorativ, ohne zusätzliche Lagerplätze oder blockierende Kollision |

Das Pferd auf dem Hof bleibt Quest- und Herkunftsbezug. Das gerufene Reitpferd wird technisch der jeweiligen Spielfigur zugeordnet. Persönliche Namen oder Satteldecken können später Varianten unterscheiden. Es entsteht kein einzelnes globales Pferd, um das alle Spieler konkurrieren müssen.

### Bewegung, Grafik und Lebenszyklus

| Bereich | Anforderung |
|---|---|
| **Gemeinsame Darstellung** | Mount und Reiter erscheinen als zusammengehörige Figur. Sitzhöhe, Hände, Füße und Zeichenreihenfolge stimmen in allen verwendeten Blickrichtungen. |
| **Andere Spieler** | Mount-Typ und optische Variante werden mit dem Spielerzustand übertragen. Bewegung zwischen bestätigten Positionen weich darstellen. |
| **Geschwindigkeit** | Gemeinsamer Mount-Zustand bestimmt die zulässige Reisegeschwindigkeit. Im Koop-Ausbau Konsistenz mit dieser Vorgabe prüfen; eine belastbare serverseitige Bewegungsprüfung ist Teil der gesonderten Härtung in Abschnitt 7. |
| **Kollision mit Spielern** | Keine harten Blockaden an Türen oder Engstellen durch andere Spieler beziehungsweise deren Mounts. |
| **Kollision mit der Welt** | Gebäude, Gelände und erreichbare Wege bleiben verbindlich; große Fahrzeuge gesondert prüfen. |
| **Innenraumwechsel** | Vor Eintritt absteigen; Position und Instanzzugehörigkeit eindeutig übertragen. Keine Mount-Kopie außen zurücklassen. |
| **Verbindungsabbruch** | Aktiver Mount-Zustand gehört zur Sitzung/Figur. Kein separat zurückbleibendes Fahrzeug und keine zusätzliche Freischaltung bei Wiederverbindung. |
| **Neustart / Anmeldung** | Sammlung bleibt gespeichert. Für die erste Version abgemeldet beziehungsweise nach Wiederverbindung unberitten an gültiger Position fortsetzen; keinen unterbrochenen Aufsteigevorgang automatisch belohnen. |
| **Versteckte Informationen** | Nur Spieler und Objekte derselben Instanz und des relevanten Umkreises übertragen; private Räume nicht in die Dorfkarte mischen. |

## 6. Innenräume, Oberfläche und Karte

### Öffentliche Orte und private Räume

E-35 legt derzeit ausdrücklich fest, dass der Kiosk-Innenraum privat bleibt. Die frühere Brainstorming-Fassung machte daraus versehentlich eine Pflicht zum sofortigen Umbau. Das wird korrigiert: Gemeinsam begehbare Läden bleiben eine sinnvolle spätere Erweiterung, sind aber keine Voraussetzung für die ersten Berufe oder Mounts.

| Bereich | Erster Koop-Ausbau | Spätere Erweiterung |
|---|---|---|
| **Werkbank** | Öffentliche Station im Dorf, von mehreren Spielern gleichzeitig nutzbar | Zusätzliche Werkstatt-Innenräume |
| **Kalles Kiosk** | Bestehende private Instanz und persönlicher Handel bleiben erhalten | Gemeinsamer Innenraum je Dorfzone, wenn ausdrücklich Bestandteil des Auftrags; Änderung von E-35 dokumentieren |
| **Herstellung** | Persönliche Vorgänge an einer gemeinsam sichtbaren Station | Auch in gemeinsamen Innenräumen |
| **Raumwechsel** | Vor Eintritt absteigen; Mount-Zustand bei Rückkehr korrekt herstellen, ohne Fahrzeugkopie | Spieler derselben Dorfzone betreten denselben öffentlichen Innenraum |
| **Weltzeit** | Der private Ladenbesuch darf die serverseitige gemeinsame Welt nicht pausieren | Gemeinsame Innenräume erhalten ebenfalls eine unabhängige gemeinsame Simulation |
| **Koordinaten** | Welt- und Innenraumposition getrennt halten | Zusätzliche stabile Instanzkennung; keine Raumkoordinaten in der Dorfkarte |

### In die bestehende Bedienung integrieren

| Vorhandene Grundlage | Folgerung für Berufe und Mounts |
|---|---|
| **Clanbuch, Fensterverwaltung und UI-Kit** | Berufsfenster und Sammlung mit bestehenden Fenster-/Sprite-Bausteinen ergänzen. Kein zweites Login, keine alternative Heldenauswahl und kein paralleles UI-System bauen. |
| **Universeller Rechtsklick** | Bei eindeutiger Aktion direkt sammeln beziehungsweise benutzen; bei mehreren sinnvollen Aktionen das bestehende Kontextmenü nutzen. Tastaturinteraktion und Aktionsleiste mitführen. |
| **Kategorien und aufgeräumte Beschreibungen** | Wirkung, Voraussetzungen und Kosten knapp erklären; erzählerischen Text getrennt halten. Rezepte und Mounts benötigen passende eigene Arten, sie sind nicht automatisch Kniffe oder Talente. |
| **Händler mit angrenzendem Inventar** | Direkten Handel und Rückkauf erhalten. Neue Zutaten und Rezepte in vorhandene Inhalts- und Händlerregeln einordnen. |
| **Verbesserungsanzeige für Ausrüstung** | Hergestellte Ausrüstung durch die bestehenden Slot-, Vergleichs- und Anlegewege führen. |
| **Karte** | Lehrer, Händler, Werkstätten und Ställe dauerhaft markieren; Sammelstellen nur in der Nähe mit passender Berufsanzeige. Immer den tatsächlich anklickbaren Marker testen, nicht nur den Listeneintrag. |

Mobile bleibt zurückgestellt. Bestehende gemeinsame Bedienelemente weiterverwenden, ohne zusätzliche Mobile-Layouts oder eine neue Mobile-Abnahme in den Auftrag einzubauen.

## 7. Aktueller Stand und Architekturentscheidung

### GitHub-Abgleich

Geprüfter Stand: `origin/main` auf `4efc012`, Abgleich am 21.09.2026. Die folgende Übersicht ersetzt die frühere Bestandsaufnahme von Online-Stufe B. Sie beschreibt im Code vorhandene Funktionen, keine neu durchgeführte Live-Abnahme des Serverbetriebs.

| Änderung | Beleg | Konsequenz für den Entwurf |
|---|---|---|
| **Online-Stufe C** | `e1c1e36`; `server/game/shared-world.mjs`, `net-world.js`; E-35 | Geteilte Lagergegner, Bedrohung, Tod, Wiederkehr, Gruppen bis fünf und Gruppen-/Flüsterchat existieren. Darauf aufbauen, keine zweite Multiplayer-Schicht erfinden. |
| **Bewusst lokaler Kampf** | E-35; `shared-world.mjs:hit`, `net-world.js` | Schaden und weitere Gegnerwerte kommen weiter vom Client. Gemeinsame Lebenspunkte sind noch keine vollständig vom Server berechnete Kampfsimulation. |
| **Persönliche lokale Belohnung** | E-35; `engine.js:remoteKill` und `kill` | Der Server verteilt Beteiligungsberechtigung, die Engine vergibt eigene Beute, EP und Auftragsfortschritt. Das ist keine manipulationsgeschützte gemeinsame Wirtschaft. |
| **Eigene Helden-Slots** | `b5b1d56`; `characters.js`; E-38 | Bis zu acht Helden, jeweils eigener Spielstand, Klasse, Name und unabhängig gewählter Körper. Berufe und Besitz eindeutig dem aktiven Helden zuordnen. |
| **Anmeldung und Heldenhalle** | `f408516`, `b5b1d56`; `start-screen.js`, `online.js` | Beim Ein-/Ausloggen und Heldenwechsel laufende Sammel-/Herstellungsaktionen korrekt beenden und fremde Zustände verwerfen. |
| **Rechtsklick und Ausrüstungsbewertung** | `99efb24`; `context-menu.js` | Neue Interaktionen in bestehende Bedienung und Ausrüstungsvergleiche einfügen. |
| **UI-Kit und Icon-Caches** | `0a62d9f`, `ed60e56`, `679fd2d`; `ui-kit*.js`, `ui-kit*.css` | Vorhandene Fenster, Rahmen, Zustände und Grafik-Caches wiederverwenden. |
| **Knappe Randale** | `40d348f`; E-36; `content/balance.js` | Getränke dürfen Ressourcenentscheidungen und die Schwelle „in Fahrt“ nicht durch praktisch unbegrenzte Nachfüllung entwerten. |
| **Offene Talentbäume** | `db181f7`; E-37 | Rezepte und Berufseffekte auch mit gemischten Talentbäumen prüfen. Keine Annahme eines einzigen exklusiven Builds. |
| **Kategorien und Tooltip-Texte** | `c39e0b5`, `df66983`, `bbddd3e`, `34cd223`; `content/categories.js` | Verständliche Arten, Funktionen und Zugehörigkeiten verwenden; neue Begriffe nur für tatsächlich vorhandene Regeln. |
| **Talentsuche** | `4efc012`; `talent-ui.js`, `tests/talent-search.test.mjs` | Such- und Filterbedienung für spätere Rezept-/Mountlisten am bestehenden Muster orientieren; Fokus beim Tippen erhalten und Inhalte nicht als Talente modellieren. |

### Zwei unterschiedliche Ziele ausdrücklich trennen

**Empfehlung für den nächsten Auftrag: Pfad A.** Das entspricht dem vorhandenen Koop-Spiel und ermöglicht sichtbare Berufe und Mounts, ohne nebenbei eine vollständige Inventar- und Kampfmigration zu beauftragen.

| Thema | Pfad A: Ausbau des bestehenden Koop-Spiels | Pfad B: vollständig serververwaltete Wirtschaft |
|---|---|---|
| **Grundlage** | E-35 beibehalten: geteilte Welt, lokaler Kampf, persönliche Belohnungen, kein Spielerhandel und kein PvP | Gesonderte Architektur- und Produktentscheidung; E-35 entsprechend erweitern |
| **Fundstellen** | Server steuert Standorte, Zyklus, Erntefenster und Nutzungsbelege | Zusätzlich verbindliche serverseitige Eingangs- und Bestandsprüfung |
| **Inventar und Herstellung** | Bestehende persönliche Spielstände erweitern; normale Wiederholungen und Wiederverbindungen zuverlässig behandeln; kein Anspruch auf Manipulationsschutz | Server verwaltet Zutaten, Währung, Ergebnis, Fortschritt und sämtliche Zugänge zur Wirtschaft vollständig |
| **Mounts** | Besitz und Voraussetzungen je Held speichern, gemeinsam anzeigen und konsistente Zustandswechsel sicherstellen | Server prüft Besitz, Erwerbsquellen, Bewegung und Freischaltungsrechte unabhängig vom Client |
| **Kampf / Beute** | Vorhandene Stufe C weiterverwenden; deren Vertrauensgrenzen dokumentieren | Wirtschaftlich relevante Kampf-/Beuteereignisse müssen verlässlich geprüft werden; Client-Schadensmeldungen reichen dafür nicht |
| **Offline / Cloud** | Vorhandenen Solo-Modus und Helden-Saves erhalten; Abgleich um neue Felder und Aktionsbelege ergänzen | Explizite Migration und Trennung von Offline- und Online-Beständen erforderlich |
| **Nicht enthalten** | Auktionshaus, Post, Spielerhandel, PvP oder die Behauptung einer abgesicherten MMO-Wirtschaft | Erst nach gesondertem Auftrag und geeigneter Grundlage entscheiden |

Pfad A ist funktional ein gemeinsames Koop-System mit dem heutigen Vertrauensmodell. Serverkoordinierte Ernten verhindern normale Doppelvergabe und uneinheitliche Spawns; sie machen frei veränderbare persönliche Spielstände nicht automatisch vertrauenswürdig. Das muss die ausführende KI im Ergebnis ausdrücklich so benennen.

### Identität: Konto, Held und gemeinsame Welt nicht verwechseln

| Bereich | Vorgabe für die Planung |
|---|---|
| **Berufe, Fertigkeit und Rezepte** | Je Heldenslot; Wechsel der Klasse oder des Hauptbaums darf Berufsdaten nicht versehentlich löschen oder kopieren |
| **Mount-Sammlung** | Für den Einstieg je Held vorgeschlagen. Kontoweite Optik-/Mount-Freischaltungen erst nach eigener Produktentscheidung. |
| **Stabile Identität** | Neue dauerhafte Berechtigungen aus Konto-ID plus Helden-ID ableiten, nicht aus Anzeigename, Klasse oder Körperform. Den aktiven Helden serverseitig zur Sitzung zuordnen. |
| **Vorhandenes Protokoll** | `hello` prüft derzeit Besitz eines Heldennamens; die Verbindung ist weiterhin nach Konto organisiert. Eine validierte, dauerhafte Helden-ID für neue Aktionsbelege ist noch nicht dadurch garantiert. |
| **Gemeinsame Welt** | Für gemeinsame Fundstellen und Sichtbarkeit `roomKey` plus gegebenenfalls Instanzkennung verwenden. |
| **Persönlicher Cloud-Save** | `characterCloudKey` (`<welt>#<held-id>` beziehungsweise Legacy-Ausnahme) bleibt persönlicher Speicher; diesen Schlüssel nicht als gemeinsamen Spawnraum verwenden. |
| **Erntebeleg** | Eindeutige Kombination aus Konto, Held, Fundstelle und Zyklus; zusätzliche kontoweite Erntelimits bleiben eine Balancingentscheidung. |
| **Heldenwechsel** | Laufende Aktion gehört zum alten Helden. Eine verspätete Bestätigung darf weder den neuen Helden belohnen noch seinen Mount-Zustand verändern. |
| **Löschen / Legacy** | Bestehende Löschmarkierungen und Legacy-Schlüssel erhalten; Wiederherstellung oder Zusammenführen darf gelöschte Helden nicht versehentlich wiederbeleben. |

### Anforderungen an Pfad A

- Bestehende Server-, WebSocket- und Speicherwege erweitern. Für Ressourcen eine getrennt testbare Regellogik nach dem Muster von `shared-world.mjs` verwenden, statt Ressourcen als Gegner mit gefälschten Lebenspunkten zu modellieren.
- Aktionsbeginn, Abschluss und Wiederholung benötigen eine eindeutige Vorgangs-ID und den richtigen Spawn-Zyklus. Gleichzeitige Anfragen dürfen dieselbe Ernteberechtigung nicht mehrfach verbuchen.
- Vor Materialabzug beziehungsweise Belohnung Beruf, Station, gemeldete Position, Zone, Bestände und Kapazität entsprechend dem vereinbarten Vertrauensmodell prüfen. Positionschecks gegen Client-Meldungen nicht als vollständig servergesicherte Bewegung ausgeben.
- Wiederverbindung und verlorene Bestätigung berücksichtigen: Beleg, Auszahlung und lokale Übernahme müssen nachvollziehbar zusammenpassen. Ein erneuter Versuch darf weder doppelt auszahlen noch eine bestätigte Belohnung unbemerkt verlieren.
- Ressourcenzyklen und bestätigte Nutzungen persistent planen. Die aktuellen geteilten Gegner und Gruppen liegen in Maps im Serverspeicher; sie sind keine Vorlage für bereits vorhandene Neustart-Persistenz.
- Vollständigen Cloud-Spielstandabgleich nicht unverändert über neue Aktionsbelege hinwegschreiben lassen. Regeln für ältere Saves, erneut gelieferte Ergebnisse und Konflikte ausdrücklich festlegen.
- Bei Serverausfall keine zweite lokale Kopie derselben gemeinsamen Fundstelle erzeugen. Solo-Fortsetzung und Online-Wiederaufnahme müssen sichtbar und konsistent geregelt sein.
- Wildverwertung bleibt später: Umgebungstiere sind nach E-35 bislang lokal. Vor gemeinsamer Wildverwertung Tier-ID, Todeszyklus und Teilnahmeberechtigung modellieren. Vorhandene Lagergegner-Beteiligungslisten nicht unbesehen als Recht auf jeden lokalen Tierkörper verwenden.
- Die vorhandene Ein-Verbindung-pro-Konto-Regel für Tests und Wiederverbindung beachten. Zwei gleichzeitig aktive Testspieler benötigen zwei Konten, nicht nur zwei Helden desselben Kontos.

### Zusätzliche Voraussetzungen für Pfad B

Pfad B ist kein stillschweigender Teil der ersten Berufs- und Mount-Implementierung. Bei einem späteren Auftrag wären mindestens folgende Punkte zusätzlich erforderlich:

- Verbindliche serverseitige Online-Bestände; wirtschaftliche Änderungen vollständig und genau einmal speichern.
- Alle Bestandsquellen berücksichtigen: Händler, Rückkauf, Herstellung, Beute, Questbelohnungen und sonstige Währungsänderungen. Eine abgesicherte Sammelaktion reicht allein nicht.
- Neue und bestehende Charaktere, Besitz, Freischaltungen sowie Kampf-/Beuterechte verlässlich validieren.
- Lokale Daten und ältere vollständige Cloud-Saves dürfen serverbestätigte Bestände nicht beliebig ersetzen.
- Offline-Übernahme, Altbestände und Migration so festlegen, dass vorhandener Fortschritt nachvollziehbar behandelt wird. Keine stillschweigende Entwertung bestehender Charaktere.
- Persistenz und Wiederanlauf über Server-Neustarts; atomare Bestandsänderungen und nachvollziehbare Behandlung unbestätigter Vorgänge.
- Erst danach Spielerhandel, Auktionshaus, Post oder eine konkurrenzorientierte Wirtschaft erwägen.

### Datenbedarf – noch kein festes Schema

| Objekt | Benötigte Informationen |
|---|---|
| **Fundstelle** | Stabile ID, Art, `roomKey`/Instanz, Position, Zustand, Zyklus, Erntefenster und Wiederkehr |
| **Nutzungsbeleg** | Konto-ID, Helden-ID, Fundstelle/Zyklus und abgeschlossene Aktion; nur erforderliche Historie aufbewahren |
| **Beruf** | Helden-ID, ausgewählte Berufe, Fertigkeit und bekannte Rezepte |
| **Rezept** | Stabile ID, Zutaten, Ergebnis, Voraussetzungen, Station und gegebenenfalls Dauer/Kosten |
| **Aktion** | Vorgangs-ID, Konto/Held, Ziel, Start, Status und übernommenes Ergebnis |
| **Mount-Sammlung** | Helden-ID, Modell, Variante und Herkunft der Freischaltung |
| **Aktiver Zustand** | Gemeinsamer Raum, Position, Bewegung, `look`, angelegte Ausrüstung soweit für die Darstellung benötigt, Aufsteige-/Mount-Zustand |

## 8. Überarbeitete Umsetzungsreihenfolge

Die vollständigen Berufs- und Mount-Tabellen sind der Zielkatalog. Der empfohlene Einstieg ist Pfad A; Pfad B und gemeinsame Innenräume sind getrennte spätere Entscheidungen.

| Phase | Umfang | Ergebnis |
|---|---|---|
| **0 – Aktuellen Bestand prüfen** | E-35 bis E-38, jüngste Commits, Server-/Heldenidentität, neue Felder im Cloud-Abgleich und Grafikassets prüfen | Konkrete Anbindung an Stufe C; verbleibende Grenzen und Testwerte dokumentiert |
| **1 – Gemeinsame Ressource** | Eine Schrottfundstelle, stabile Zykluskennung, Erntefenster und Nutzungsbelege | Zwei Konten in derselben Welt sehen denselben Zustand und ernten je berechtigtem Helden genau einmal |
| **2 – Vollständiger kleiner Ablauf** | Eine öffentliche Werkbank, ein Rezept und Klappermofa mit persönlicher Freischaltung | Sammeln, Herstellen, Freischalten, Auf-/Absteigen, Wiederverbinden und Heldenwechsel funktionieren im bestehenden Koop-Modell |
| **3 – Erste Produktausbaustufe** | Zwei Berufsplätze; Schrottsammeln + Schrauberei, Kräutersammeln + Hausbrauerei; wenige Rezepte; Klappermofa, alter Blechroller und Pferd des Nachbarbauern | Zwei Materialkreisläufe, verschiedene Erwerbswege und passende Posen für alle vorhandenen Körperformen |
| **4 – Zusätzliche Inhalte** | Wildverwertung erst mit geeigneter Tiergrundlage; weitere Handwerks-/Nebenberufe, Eigenbau-Mofa und übrige Mounts | Eigenständige Erweiterungen nach erfolgreicher Basisabnahme |
| **Separater Ausbau** | Gemeinsame Kiosk-/Werkstatt-Innenräume und/oder Pfad B | Nur bei entsprechender Erweiterung des Auftrags und dokumentierter Änderung der bisherigen Entscheidungen |

Für Phase 2 kann ein abgesicherter Test-Erwerb das Mofa freischalten. Daraus darf keine Pflicht zur Schrauberei für das erste produktive Mount entstehen. Fahrzeug oder Hoftier bleiben auch ohne bestimmten Beruf zugänglich.

### Balancing nach E-36 und E-37

- Die aktuelle Randale-Knappheit und Schwelle „in Fahrt“ berücksichtigen. Getränkemengen, Kosten, Wirkungen und Nutzungsregeln zusammen testen; keine praktisch kostenlose Dauerauffüllung einführen.
- Erste Rezepte bewusst klein halten. Neue permanente Kampfboni und zusätzliche aktive Elektro-Hilfsmittel nicht ohne Messung stapeln.
- Offene Talentbäume und gemischte Builds prüfen; Berufe nicht an einen Hauptbaum binden.
- Rüstungen, Waffen und Verpflegung an vorhandene Werte-, Vergleichs- und Wirkungsdefinitionen anschließen. Keine zweite Ausrüstungsbewertung oder Parallelwährung erfinden.

## 9. Abnahmekriterien

Für den gemeinsamen Ablauf zwei getrennte angemeldete Clients mit **zwei Konten** am tatsächlichen Testserver verwenden. Sichtbare Fremdfiguren allein beweisen noch keinen funktionierenden gemeinsamen Beruf.

| Prüfung | Erwartetes Ergebnis |
|---|---|
| **Gemeinsame Ressource** | Gleiche Objekt-ID, Position, Phase und gleicher Zyklus für beide Konten im selben `roomKey` |
| **Persönliche Ernte** | Beide berechtigten Helden können einmal ernten; wiederholte Klicks erzeugen keine doppelte Vergabe |
| **Wiederholung / Gleichzeitigkeit** | Parallele, doppelte und verspätete Nachrichten erzeugen keine doppelten regulären Belohnungen oder negativen Bestände |
| **Voraussetzungen** | Falscher Beruf, falscher Raum, zu große gemeldete Entfernung und abgelaufener Zyklus werden ohne reguläre Belohnung abgewiesen; Vertrauensgrenzen bleiben dokumentiert |
| **Abbruch / Kapazität** | Volles Inventar, Bewegungsabbruch und verlorene Verbindung hinterlassen keinen halben Herstellungs- oder Erntevorgang |
| **Wiederkehr / Neustart** | Erneutes Einloggen und Server-Neustart setzen abgeschlossene Nutzungen nicht unkontrolliert zurück |
| **Heldenwechsel** | Auftrag von Held A belohnt niemals Held B; Mounts, Rezepte und Fertigkeit erscheinen beim richtigen Helden |
| **Raumschlüssel** | Verschiedene persönliche Cloud-Schlüssel trennen nicht versehentlich gemeinsam spielende Helden; echte private Räume bleiben getrennt |
| **Herstellung** | Zutaten, Kosten, Ergebnis und Fortschritt werden bei regulären Wiederholungen genau einmal übernommen; Reservierungen bleiben geschützt |
| **Gemeinsame Station** | Zwei Spieler arbeiten gleichzeitig an derselben öffentlichen Werkbank und erhalten ausschließlich eigene Ergebnisse |
| **Mount-Erwerb** | Kauf, Auftrag oder Herstellung schalten das richtige Modell beim richtigen Helden frei |
| **Mount-Sichtbarkeit** | Beide Clients sehen korrektes Modell, Variante und Körperform; Klasse und Aussehen dürfen voneinander abweichen |
| **Sitzpose / Ausrüstung** | Jedes erste Mount mit allen drei Körperformen prüfen, einschließlich angelegter Ausrüstung und mindestens einer Kombination aus anderer Klasse und anderem Aussehen |
| **Lebenszyklus** | Auf-/Absteigen, Ein-/Ausloggen, Heldenwechsel und Kiosk-Eintritt erzeugen keine zurückbleibenden Kopien |
| **Bestehender Koop** | Gruppen, Lagergegner, Bedrohung und persönliche Belohnungen nach E-35 bleiben funktionsfähig |
| **Bedienung** | Vorhandene Fenster, Rechtsklick, Tastatur, Aktionsleiste, Ausrüstungsvergleich und anklickbare Kartenmarker funktionieren |
| **Altstände / Cloud** | Legacy-Held, neue Helden, Löschmarkierungen und ältere Saves werden nachvollziehbar behandelt |
| **Wirkungen** | Verpflegung und Berufseffekte entwerten Randale-Entscheidungen nicht; gemischte Talentbäume sind berücksichtigt |

**Nur bei gesondertem Auftrag zusätzlich abnehmen:** gemeinsamer Ladenbesuch inklusive Rückkehr in dieselbe Dorfzone; beziehungsweise unabhängige serverseitige Bestandsprüfung, Schutz gegen manipulierte Client-Saves und Migration für Pfad B.

Automatisierte Tests und echte Desktop-Abläufe dokumentieren. Eigene und fremde Mounts auf Screenshots zeigen. Mobile-Arbeit nicht zusätzlich aufnehmen. Vorhandene allgemeine Prüfungen nicht aus Bequemlichkeit entfernen. Vorbestehende Testfehler getrennt von neu verursachten Fehlern berichten; kein kosmetisches Anpassen von Erwartungen, nur um grüne Tests zu erhalten.

## 10. Offene Entscheidungen

| Bereich | Noch festzulegen |
|---|---|
| **Berufe je Held** | Fertigkeitsgrenzen, Lernkosten und Berufswechsel; wie bestehender Klassenwechsel dabei behandelt wird |
| **Mount-Sammlung** | Einstieg je Held empfohlen; kontoweite Freischaltungen oder rein kontoweite Optik erst gesondert entscheiden |
| **Ernteumfang** | Nutzung je Held versus zusätzliche Kontogrenzen, insbesondere bei bis zu acht Helden; Kanalwechsel darf keinen unbeabsichtigten Reset erzeugen |
| **Rezepte und Fundstellen** | Mengen, konkrete Materialien, Erntefenster, Wiederkehr, Standortbudgets, Erträge und Preise |
| **Cloud-Abgleich** | Übernahme neuer Vorgangsbelege und Umgang mit verspäteten Ergebnissen, älteren Saves und Offline-Fortschritten innerhalb von Pfad A |
| **Mount-Fortschritt** | Erster Zugang, Reisegeschwindigkeit, Aufsteigedauer und Kaufpreise |
| **Kampf / Sammeln auf Mounts** | Verhalten bei eingehendem Schaden, Interaktion und Sammeln |
| **Darstellung** | Fehlende Mount-Assets und Posen je Körperform; übertragene Ausrüstungsdaten für fremde Reiter |
| **Wildverwertung** | Welche Tierquellen geteilt werden, stabile Todeszyklen und Berechtigungen; heutige lokale Ecology nicht als gemeinsame Quelle ausgeben |
| **Große Fahrzeuge** | Platzbedarf und Wegfindung von Quad und Hofschlepper |
| **Gemeinsame Innenräume** | Bewusste Änderung der bisher privaten Kiosk-Regel aus E-35 |
| **Pfad B** | Umfang und Zeitpunkt einer verlässlich serververwalteten Wirtschaft; ausdrücklich eigener Auftrag |
| **Mobile** | Weiter zurückgestellt |

Normale technische Detailentscheidungen begründet treffen. Nicht beschlossene Zahlen als zentrale Testwerte kennzeichnen. Vorschläge in diesem Dokument sind keine stillschweigende Aufhebung von E-35 bis E-38 oder späteren Nutzerentscheidungen.

## 11. Referenzen und Ergebnis des Reviews

- [E-35 bis E-38 und weitere Entscheidungen](ENTSCHEIDUNGEN.md)
- [Online Stufe C: geteilte Gegner, Gruppen und Vertrauensmodell](ONLINE-STUFE-C-2026-09-20.md)
- [Online Stufe B: Server und Betrieb](ONLINE-STUFE-B-2026-09-19.md)
- [Händler und bisherige private Kiosk-Instanz](HAENDLER-2026-09-19.md)
- [Charaktererstellungs-Ideen, gegen E-38 abgeglichen am 23.09.](CHARAKTERERSTELLUNG-BRAINSTORM-2026-09-19.md)
- [Roadmap](ROADMAP.md)
- [Repository-Arbeitsregeln](../CLAUDE.md) und [Pipeline](PIPELINE.md)

**Review-Fazit:** Berufsauswahl und Mount-Katalog bleiben sinnvoll. Überarbeitet werden vor allem die Anbindung an das bereits vorhandene Koop-System, die Trennung von Held und Konto, die Mount-Grafik für frei wählbare Körperformen sowie die Reihenfolge der Arbeiten. Vollständige Server-Autorität und gemeinsame Innenräume werden nicht mehr fälschlich als notwendige Vorarbeit für den ersten sichtbaren Fortschritt behandelt.

**Prüfhinweis zum Zwischenstand `34cd223`:** Ein erster vollständiger `npm test`-Lauf bestand mit 549/550 Tests; `tests/flow.test.mjs` meldete bei „post-kill rest does not overfill health or activate without a kill“ 835 statt 905. Die isolierte Prüfung und ein zweiter vollständiger Lauf bestanden, letzterer mit 550/550 Tests. Es wurde dafür kein Laufzeitcode oder Test geändert. Der wechselnde Befund ist ein Hinweis auf eine möglicherweise instabile bestehende Prüfung und kein Fehler der Markdown-Datei.

**Schlussprüfung auf `4efc012`:** Nach Einbeziehen der Talentsuche bestehen 551/551 Tests. Dokumentgliederung und lokale Verweise sind geprüft. Der Commit umfasst ausschließlich dieses Brainstorming.

Die technische Bestandsaufnahme ist auf den oben genannten Commit begrenzt. Die ausführende KI muss beim späteren Start erneut prüfen, was bereits umgesetzt wurde. Historische Roadmap-Einträge, nach denen Charaktererstellung noch zurückgestellt sei, sind nicht mit dem tatsächlich vorhandenen E-38-Stand zu verwechseln.

## 12. Aktualisierter Startprompt für die ausführende KI

Der folgende Text kann zusammen mit dieser vollständigen Datei in einen späteren Auftrag übernommen werden:

> Arbeite im Repository `ER-ESM/mertloch-chronicles`. Nutze das beigefügte Dokument „Brainstorming: Berufe und Mounts – Konzept und KI-Umsetzungsbriefing“ als Arbeitsgrundlage. Es enthält Zielkatalog, aktuellen Review-Stand, begrenzten ersten Umfang, Vertrauensmodell und Abnahmekriterien. Prüfe vor dem Start aktuelle Commits, Repository-Regeln und Entscheidungen; die Bestandsaufnahme des Dokuments ist an einen bestimmten Commit gebunden.
>
> Beginne mit Phase 0. Sofern der konkrete Auftrag nichts anderes bestimmt, ist **Pfad A – Ausbau des vorhandenen Koop-Spiels nach E-35** gemeint. Verwende Online-Stufe C und die Helden-Slots nach E-38. Baue keine zweite Multiplayer-Schicht und migriere nicht beiläufig Kampf, Inventar oder die gesamte Wirtschaft auf ein neues Autoritätsmodell. Spielerhandel, PvP, gemeinsame Kiosk-Innenräume und Pfad B sind separate Erweiterungen.
>
> Arbeite anschließend Phasen 1 und 2 bis zu einem vollständigen Ablauf mit zwei getrennten angemeldeten Konten ab: gemeinsame Schrottfundstelle, gleichzeitig nutzbare öffentliche Werkbank, ein einfaches Rezept und Klappermofa. Weise gemeinsame Spawnzyklen, persönliche Ernten und konsistente Wiederverbindung nach. Ein nur lokal funktionierender Ablauf genügt nicht, aber das vorhandene clientvertrauende Koop-Modell darf auch nicht als manipulationsgeschützte Wirtschaft bezeichnet werden.
>
> Ordne Berufe, Rezepte, Vorgänge und Mount-Sammlung dem richtigen Heldenslot zu. Trenne gemeinsame Welt (`roomKey`) und persönlichen Cloud-Schlüssel. Neue dauerhafte Nutzungsbelege brauchen stabile Konto-/Helden-Identität; Anzeigename, Klasse und Aussehen sind dafür ungeeignet. Prüfe Heldenwechsel, Legacy-Saves, Löschmarkierungen, verlorene Bestätigungen und ältere Cloud-Saves. Eine verspätete Aktion darf niemals einen inzwischen anderen Helden belohnen.
>
> Verwende vorhandene geeignete Grafiken, Präzisionssprites und UI-Kit-Bausteine. Mount und Figur benötigen passende Sitz-, Hand- und Fußpositionen für alle drei Körperformen, unabhängig von Klasse und angelegter Ausrüstung. Fehlende Assets und Darstellungsgrenzen ehrlich dokumentieren. Rechtsklick, Tastatur, Aktionsleiste, Kartenmarker und Ausrüstungsvergleich in bestehende Wege integrieren.
>
> Halte neue Texte und konfigurierbare Inhalte in den vorgesehenen Modulen. Nutze zentrale, ausdrücklich vorläufige Testwerte. Getränke und spätere Berufseffekte müssen Randale-Knappheit nach E-36 und offene Talentbäume nach E-37 berücksichtigen. Mobile bleibt zurückgestellt. Phase 3 und alle späteren Katalogeinträge nur umsetzen, wenn der konkrete Auftrag sie umfasst.
>
> Prüfe die Kriterien der bearbeiteten Phasen mit automatisierten Tests und tatsächlichen Desktop-Browserabläufen. Berichte veränderte Module, Speicher-/Protokollerweiterungen, Testwerte, Ergebnisse, eigene und fremde Mounts auf Screenshots sowie verbleibende Grenzen. Unterscheide Bestandsfehler von neuen Regressionen. Aktualisiere den Umsetzungsstand des Dokuments. Veröffentlichung und Serverbetrieb richten sich nach den Vorgaben des konkreten Auftrags.
