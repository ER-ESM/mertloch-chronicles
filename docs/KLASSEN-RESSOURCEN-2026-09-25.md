# Fünf Klassen, fünf Ressourcen · Design 2026-09-25 (E-72)

Nutzerauftrag 25.09.2026: „Mit der Randale sind alle Helden gleich. Mach dir Gedanken zu unterschiedlichen Ressourcen,
Generatoren und Spendern und ganz innovativen, neuen Klassendesigns, die gänzlich unterschiedliche Spielweisen ermöglichen.
Jeder Held soll sich einzigartig anfühlen. Entwickle passende Skills und Talentbäume und effektreiche Animationen.
Ziel: 5 unterschiedliche Klassendesigns mit unterschiedlichem Ressourcenmanagement, vollständig, Talente entsprechend."

Stand nach Umsetzung und Erstabgleich: [E-72](ENTSCHEIDUNGEN.md). Dieses Papier ist zugleich der **Vertrag** für alle Umsetzer (Engine, Inhalt, UI/Effekte). Zahlen sind Startwerte für
`content/resources.js`; Balancing dreht über `content/tuning.js` (Block `resources`).

## 1 · Befund: warum sich heute alle gleich spielen (schwächster Punkt zuerst)

E-32 hat jeder der neun Specs eine Kernmechanik gegeben – das Grundgefühl blieb trotzdem gleich, weil **die Ökonomie darunter
identisch ist**:

| Baustein | Dieter | Anni | Kevin |
|---|---|---|---|
| Ressource | Randale 0–100 | Randale 0–100 | Randale 0–100 |
| Start / Nachfluss | 100 · 3/s im Kampf · 5/s außerhalb | gleich | gleich |
| Erzeuger | Grundangriff +11 | Grundangriff +19 | Grundangriff +9 |
| Verbraucher | Markierung 20 · Finisher 35 · Wurf 18 · Boden 35 | gleich | gleich |
| Entscheidung | „über 80 halten oder ausgeben" | gleich | gleich |

Die Specs verändern, *was* der Finisher tut – aber nie, *wie* man zu ihm kommt. Jede Klasse drückt 1 · 1 · 2 · 1 · 3.
Talente mit „+10 Randale" sind in allen drei Klassen dieselbe Regel. Deshalb reicht es nicht, Namen zu tauschen:
**Erzeuger, Verbraucher, Verlust und Entscheidung müssen je Klasse anders sein.**

## 2 · Fünf Ressourcenmodelle

| Klasse | Rolle(n) | Modell | Woraus Ressource entsteht | Wofür sie draufgeht | Verlust/Risiko | Entscheidung im Kampf |
|---|---|---|---|---|---|---|
| **Dosen-Dieter** · Tresenbrecher | Tank · Nahkampf · Schutz | **Wut & Zeche** (Schaden als Ressource, Schulden) | kassierte Treffer, Kelle, Parade | Kniffe; jede ausgegebene Randale **bezahlt die Zeche** | angeschriebener Schaden tickt nach; Randale verraucht außerhalb | Zeche abbezahlen (sicher) oder wachsen lassen und **prellen** (Flächenschaden) |
| **Aperol-Anni** · Landhaus-Lady | Heilung · Schadensheilung · Fernkampf | **Reichweite** (Abwechslung als Ressource) | *neuer* Content: jeder Kniff, der nicht unter den letzten zwei war | Likes für Kniffe; Trend stärkt alles | Wiederholung, Pause und Shitstorm senken den Trend | welchen Kniff als Nächstes, um den Trend zu halten – nie zweimal dasselbe |
| **Klo-Kevin** · Pfandingenieur | Fernkampf · Tank · Zufall | **Leergut** (Munition, Aufsammeln, Nachladen) | 12er-Kasten; Flaschen liegen nach dem Wurf am Boden; Pfandautomat | eine Flasche je Wurf, drei je Rakete | leerer Kasten = nur Pömpel; Klemmer beim Nachladen | hinlaufen und aufsammeln oder nachladen – und den Bon-Moment treffen |
| **Schwenker-Schorsch** · Grillmeister (NEU) | Schaden · Heilung · Tank | **Glut & Grillrost** (Temperaturfenster + Garzeiten) | Zange, Parade, Blasebalg heizen | Glutbrocken, Schwenkgrill, Ablöschen kühlen; Grillgut servieren | zu kalt = schwach, zu heiß = Stichflamme; Grillgut verkohlt | Glut im goldenen Bereich halten und drei Garzeiten jonglieren |
| **Kreuz-Käthe** · Stammtisch-Zockerin (NEU) | Schaden · Heilung · Kontrolle | **Blatt & Augen** (Kartenhand, Skat-Zählung) | jede Karte: 5 Augen + Kartenwert; Stich gegen Gegnerzauber | Hand (3 Karten, Farbe = Wirkung); Abrechnen ab 61 Augen | schlechte Hand, Augen verfallen nach dem Kampf | welche Karte jetzt, Farbe bedienen, stechen – und bei 61 abrechnen oder auf Schneider (90) zocken |

Kein Paar teilt Erzeuger **und** Verbraucher. Drei Modelle sind in Browser-Rollenspielen neu: Abwechslung als Ressource
(Anni), physische Munition zum Aufsammeln mit aktivem Nachladen (Kevin), Kartenhand mit Stich gegen Gegnerzauber (Käthe).

**Gemeinsam bleibt nur:** Autoangriff, GCD 1,5 s (Untergrenze 1,0), Ausweichen, Unterbrechen-Taste, Parade-Taste,
Heiltaste, Stärkung, Talentpunkte (E-37), Werte (E-53), Procs als Rahmen.

## 3 · Die Klassen im Einzelnen

### 3.1 Dosen-Dieter — Randale (Wut) und Zeche

*„Anschreiben, Chef. Ich zahl mit Schlägen."*

**Randale 0–100** bleibt Dieters Wort – aber als Wut: Sie **startet bei 0**, fließt im Kampf **nicht** von selbst nach und
verraucht außerhalb (5 s nach dem Kampf −6/s).

| Erzeuger | Wert |
|---|---|
| kassierter Treffer | +1,2 Randale je 1 % Maximalleben Schaden (vor Deckung) |
| Kronkorken-Kelle | +11 (wie bisher, `passives.strikeGain`) |
| Parade | +20 · Unterbrechen +15 · Kill +Schwung (wie bisher) |
| Kampfbeginn („Kampfeslust“) | +30 (Balancing-Abgleich 25.09.: ohne Startwert brauchte Dieter auf Stufe 6 länger als auf Stufe 1) |
| Pfand auf die Zwölf (Wurf) | kostenlos, +12 – der Wurf eröffnet den Streit |

**Zeche (Kassenbon):** 30 % jedes Treffers, der nach Deckung übrig bleibt, wird **angeschrieben** statt sofort
abgezogen. Die Zeche wird mit 12 % ihres Stands je Sekunde als Schaden „abgestottert". **Jede Randale, die Dieter
ausgibt, bezahlt 2 Leben der Zeche** – der Schaden kommt dann nie an. Obergrenze: 40 % Maximalleben; darüber trifft
jeder Treffer voll.

**Neuer Kniff `zeche` · „Zeche prellen"** (Stufe 6, keine Kosten, Abklingzeit 18 s): Dieter haut auf den Tresen und
haut ab, ohne zu zahlen – die gesamte Zeche wird gelöscht und als Druckwelle (Radius 90) an alle Gegner ringsum
ausgeteilt (Schaden = 100 % der Zeche, +25 % in Fahrt). Tank-Entscheidung: abbezahlen (sicher) oder sammeln und prellen.

Kit unverändert (Kelle, Pfandschuld, Bierzelt-Abriss, Halt die Fresse, Deckel drauf, Hecke, Konterfrühstück). „In Fahrt"
(ab 80) bleibt. Der Kneipenschläger (15 % mehr Schaden einstecken) wird damit zum Wut-Ofen; der Türsteher füllt Randale
über Paraden; der Zapfmeister stellt Weizenfässer gegen die Zeche.

**HUD:** roter Randale-Balken mit Wut-Flackern ab 80 · rechts am Porträt ein Kassenbon, der mit der Zeche länger wird
(Striche + Betrag). Bezahlt: Striche werden durchgestrichen, Münzen klimpern hoch. Geprellt: Bon zerreißt, Münzen und
Bonfetzen fliegen als Ring.

### 3.2 Aperol-Anni — Reichweite (Likes und Trend)

*„Ohne Content keine Reichweite, Schätzchen."*

**Likes 0–100** ersetzen Randale 1 : 1 bei allen Kosten (Markierung 20, Finisher 35 …). Start 60, außerhalb des
Kampfes +5/s bis 100 („Stammfollower"). **Kein** Nachfluss im Kampf, der Pinsel-Piekser gibt keine festen 19 mehr.

**Trend 0–5** (Flop · Nische · Läuft · Viral · Trending · Aperol-Hype):

| Regel | Wirkung |
|---|---|
| Kniff, der **nicht** unter den letzten zwei war („neuer Content") | Trend +1 |
| **derselbe** Kniff wie gerade eben („Wiederholung") | Trend −1 |
| 3,5 s kein Kniff | Trend −1 (der Algorithmus vergisst dich) |
| Treffer über 12 % Maximalleben („Shitstorm") | Trend −1 |
| jeder Kniff (nicht Autoangriff) | +Likes je Trend: 3 · 5 · 7 · 9 · 11 · 14 |
| Trend | +4 % Schaden und Heilung je Stufe (bis +20 %) |
| Trend erreicht 5 („Viral!") | nächster Kniff mit Kosten ist gratis |

Annis Takt bleibt: Piekser 1–1,9 s nach dem letzten Piekser gilt nie als Wiederholung und gibt +10 Likes.
Die Putzwut der Filter-Furie zündet bei 100 Likes (Zahlen unverändert).

**HUD:** Likes-Balken (Aperol-Orange → Pink) mit Herz · Trend-Abzeichen mit fünf Herzen und Rangname im Tooltip · Zuschauerzahl
im Tooltip. **Effekte:** jeder Kniff lässt Herzen/Daumen aufsteigen; Trend hoch = Kamerablitz-Ring; Viral = Konfetti;
Shitstorm = braune Wolke über Anni.

### 3.3 Klo-Kevin — Leergut (Kasten, Aufsammeln, Nachladen)

*„Pfand gehört in den Kreislauf. Notfalls in deinen."*

**Kasten 0–12 Flaschen.** Start voll; außerhalb des Kampfes sortiert Kevin 1 Flasche je 1,5 s nach.

| Kniff | Flaschen |
|---|---|
| Pfandgeschoss (1) · Kleber (2) · Dosen-Drohne (Wurf) · Pfandseil | 1 |
| Restmüll-Rakete (3) · Restmüll mit Zündschnur (Boden) | 3 |
| Kettenzündung | 2 |
| Unterbrechen, Parade, Stärkung, Heilung, Magnetpanzer, Autoangriff | 0 |

**Leergut am Boden:** Ein geworfenes Pfandgeschoss/Wurf bleibt zu 50 % heil liegen, die Rakete lässt zwei von drei
Flaschen liegen, jeder Kill wirft eine Flasche ab („der hatte noch Pfand dabei"). Das Leergut glitzert 14 s lang
1–2 m neben dem Ziel; **drüberlaufen sammelt es ein** (Radius 14 Einheiten, +1 Flasche, Klirren, Flugbogen in den Kasten).

**Neuer Kniff `reload` · „Pfandautomat"** (Stufe 2, keine GCD-Sperre für Bewegung, Abklingzeit 0): 2 s Nachladen mit
Balken. Die **Bon-Zone** liegt bei 55–72 % des Balkens. Taste in der Zone erneut drücken = **Pfandbon**: Kasten sofort
voll + 1 Pfandbon (höchstens 3). Außerhalb = **Klemmt!** (+1 s). Nichts drücken = +6 Flaschen nach 2 s.
**Pfandbon:** Der nächste Flaschenkniff trifft 35 % härter (ein Bon je Kniff).

**Leerer Kasten:** Die Taste 1 wird zum Pömpel-Schlag (Nahkampf, kostenlos, 60 % Schaden) – Variante „PÖMPEL".
Schrottkoloss: Robbi sammelt Leergut in seinem Kreis automatisch ein. Pfandjäger: Fehlzündungen bleiben immer heil liegen.

**HUD:** Bierkasten mit 12 Fächern (3 × 4) · Nachladebalken mit goldener Bon-Zone · bis zu drei Pfandbon-Zettel.
**Effekte:** glitzernde Flaschen am Boden, Aufsammel-Bogen, Pfandautomat-Rattern, goldener „BON!"-Zettel, Klemmer-Funken.

### 3.4 Schwenker-Schorsch (NEU) — Glut und Grillrost

*„Wer schwenkt, gewinnt."* Grillmeister der Grillhütte, Schürze, Grillzange, Schwenkgrill an der Dreibein-Kette.
Klassen-ID `schorsch`, Speicherschlüssel wie alle anderen.

**Glut 0–100** (Temperatur), Start 25, kühlt mit 5/s ab (außerhalb des Kampfes Richtung 25).

| Bereich | Glut | Schaden | Garen |
|---|---|---|---|
| Kalt | 0–29 | −15 % | ×0,5 |
| Gute Glut | 30–59 | ±0 | ×1 |
| **Perfekte Glut** | 60–84 | **+20 %** | ×1,4 |
| Zu heiß | 85–99 | +35 % | ×2 (verkohlt schnell), 1,5 % Maximalleben/s Brand |
| **Stichflamme** | 100 | Explosion Radius 80 (Schaden 120 + Stufe) an Gegnern, 8 % Maximalleben an Schorsch; Glut fällt auf 20; Grillkniffe 3 s gesperrt; Grillgut +40 % Garstufe |

**Grillrost (3 Plätze):** „Auflegen" legt das nächste Grillgut aus dem **Grillplan** (Grundplan Wurst → Braten → Mais)
auf. Garstufe 0 → 100 % in 8 s bei Gute Glut (Faktor aus der Tabelle). **Gar = 60–89 %** (Goldschimmer), 90–109 % durch,
ab 110 % verkohlt, ab 130 % Kohle (wird von selbst weggeräumt, Rauchwolke). „Servieren" nimmt das garste Stück:

| Grillgut | Wirkung beim Servieren | gar (60–89 %) | verkohlt |
|---|---|---|---|
| Bratwurst | heilt dich oder den gewählten Freund um 14 % Maximalleben | + Nachheilung 6 s | halbe Heilung |
| Schwenkbraten | schwerer Wurf aufs Ziel (Finisher-Schaden) | ×1,6 | ×0,5 |
| Maiskolben | Popcorn-Explosion am Ziel (Radius 70) | + kurzer Rückstoß | ×0,5 |
| Grillkäse | Schild 12 % Maximalleben | + Parierfenster +0,3 s | halber Schild |

Kit (Leistenplätze der Engine, Namen Schorsch):

| Platz | Kniff | Wirkung | Glut |
|---|---|---|---|
| auto | Zangenklapper | Nahkampf-Autoangriff | – |
| 1 strike | **Grillzange** | Nahkampftreffer, Schaden nach Bereich | +12 |
| 2 mark | **Auflegen** | nächstes Grillgut auf den Rost (Abklingzeit 3 s, ohne globale Abklingzeit) | – |
| 3 burst | **Servieren** | garstes Grillgut (s. o.); Variante zeigt Stück und Garstufe | – |
| 4 interrupt | **Zange zu!** | unterbricht, kneift | – |
| E parry | **Grilldeckel** | Parade | +15 bei Erfolg |
| LEER dash | **Kohlen-Sprint** | Ausweichen | – |
| Q heal | **Ablöschen** | Bier drüber: Glut −40, Dampfwolke (Schaden + Verlangsamung), heilt 8 % | −40 |
| Z buff | **Blasebalg** | Glut +35, 6 s kein Abkühlen | +35 |
| 5 throw | **Glutbrocken** | Fernwurf mit Brand (Schaden über Zeit) | −15 (braucht 15) |
| 7 ground | **Schwenkgrill** | Schwenk-Bogen auf den Boden: Flächenschaden nach Glut, Grillgut +20 % | −30 (braucht 30) |

Lernstufen: Zange/Kohlen-Sprint 1 · Auflegen + Servieren 2 · Glutbrocken 3 · Grilldeckel + Zange zu! 4 · Ablöschen 5 ·
Blasebalg 6 · Schwenkgrill 7.

**Specs** (`schorsch-chef`, `schorsch-flamme`, `schorsch-rauch`):

| Spec | Rolle | Kernmechanik (Hauptbaum) | Pfade (0 · 1 · 2) |
|---|---|---|---|
| **Grillhütten-Chef** | Heilung | Grillplan Wurst → Wurst → Braten; Servierte Wurst heilt +50 % und springt auf einen zweiten Verbündeten; Schwenkgrill wird **Grillbuffet** (Tisch, heilt 10 s alle im Kreis) | Wurstbude · Beilagen · Stammkundschaft |
| **Flambierer** | Schaden | Grillplan Braten → Mais → Braten; Stichflamme verletzt Schorsch nicht und trifft doppelt; ab 85 Glut wird Servieren zu **FLAMBIEREN** (+50 %, Feuerspritzer an Nachbarn) | Stichflamme · Schwenkbraten · Spiritus |
| **Räuchermeister** | Tank | Unter 45 Glut wird Grillgut **geräuchert** (gart halb so schnell, hinterlässt beim Servieren Rauch, der Gegner verspottet und ihren Schaden −25 % senkt); Grillplan Käse → Braten → Käse; Schwenkgrill wird **Räucherofen** | Buchenrauch · Halloumi · Glutnest |

**HUD:** Thermometer mit farbigen Bereichen und Nadel · Grillrost mit drei runden Plätzen (Stück + Garring rosa → gold →
braun → schwarz, Brutzeln, Rauchfähnchen, Goldfunkeln bei gar). **Effekte:** Flammen an den Füßen wachsen mit der Glut,
Hitzeflimmern ab 60, Funken an der Zange, Grillgut fliegt mit Dampfspur, Popcorn-Regen, Dampfwolke, Stichflamme als
Feuerring, Schwenk-Bogen des Grills.

### 3.5 Kreuz-Käthe (NEU) — Blatt und Augen

*„Wer nicht reizt, verliert."* Rentnerin, Stammtisch-Skatkönigin, Strickjacke, Lesebrille an der Kette.
Klassen-ID `kaethe`.

**Blatt:** 32 Karten (Kreuz, Pik, Herz, Karo × 7, 8, 9, 10, Bube, Dame, König, Ass), gemischt. Die **Hand** liegt auf den
Leistenplätzen 1–3 (ab Stufe 1 eine Karte, Stufe 2 zwei, Stufe 3 drei). Nach jedem Ausspielen wird sofort nachgezogen;
leerer Stapel = neu mischen.

| Farbe | Wirkung (Ziel) |
|---|---|
| ♣ Kreuz | Schaden am Ziel |
| ♠ Pik | Schild auf dich oder den gewählten Freund |
| ♥ Herz | Heilung auf dich oder den gewählten Freund |
| ♦ Karo | Flächenschaden am Ziel (Radius 60) + 40 % Verlangsamung 3 s; Zehn/Ass betäuben 1 s |

| Rang | Stärke | Augen (Skat) | Besonderheit |
|---|---|---|---|
| 7 · 8 · 9 („Luschen") | ×0,6–0,7 | 0 | nur 1,0 s GCD |
| Dame · König | ×1,0 · ×1,05 | 3 · 4 | – |
| 10 · Ass | ×1,4 · ×1,5 | 10 · 11 | – |
| Bube (Trumpf) | ×1,3 | 2 | bedient immer die Farbe, sticht alles |

- **Augen 0–120:** jede ausgespielte Karte gibt **5 + Kartenwert** Augen. **61 = gewonnen**: „Abrechnen" wird frei.
  90 = Schneider (×1,5), 120 = Schwarz (×2, trifft alle Gegner im Umkreis). Abrechnen setzt die Augen auf 0.
  Außerhalb des Kampfes verfallen die Augen nach 8 s („Spiel vorbei").
- **Farbe bedienen:** gleiche Farbe wie die letzte Karte = +25 % je Kettenglied (höchstens 3).
- **Stich:** Jeder Gegnerzauber zeigt Käthe eine Karte (Schaden = Kreuz, Heilung = Herz, Schutz = Pik, Kontrolle = Karo;
  Rang gewürfelt). Spielt Käthe **dieselbe Farbe höher** (oder einen Buben) auf diesen Gegner, solange der Zauber läuft:
  **STICH!** – unterbrechbare Zauber brechen ab, Käthe erhält die Augen der Gegnerkarte +10.

Kit:

| Platz | Kniff | Wirkung |
|---|---|---|
| auto | Kartenschnipsen | Fernkampf-Autoangriff (Reichweite 170) |
| 1 strike · 2 mark · 3 burst | **Karte 1–3** | spielt die Karte auf diesem Platz (Name/Symbol = die Karte) |
| 4 interrupt | **Kontra!** | unterbricht; hältst du die Farbe der Gegnerkarte, zählt es als Stich |
| E parry | **Gemauert** | Parade |
| LEER dash | **Abgang** | Ausweichen |
| Q heal | **Eierlikörchen** | Heilung |
| Z buff | **Neu geben** | wirft die Hand ab und zieht neu; die neue Hand enthält sicher einen Buben (Abklingzeit 20 s) |
| 5 throw | **Abrechnen** | Finisher ab 61 Augen: Schaden je Auge, Schneider/Schwarz, setzt Augen auf 0 |
| 7 ground | **Kartenregen** | wirft die ganze Hand auf einen Bodenpunkt: jede Karte wirkt im Kreis nach ihrer Farbe, dann neue Hand (Abklingzeit 16 s) |

Lernstufen: Karte 1/Abgang 1 · Karte 2 + Abrechnen 2 · Karte 3 3 · Kontra + Gemauert 4 · Eierlikörchen 5 · Neu geben 6 ·
Kartenregen 7.

**Specs** (`kaethe-grand`, `kaethe-herz`, `kaethe-falsch`):

| Spec | Rolle | Kernmechanik | Pfade |
|---|---|---|---|
| **Grand-Spielerin** | Schaden | vier Buben in einem Spiel = **Grand**: Abrechnen ×1,5 und trifft alle Gegner im Umkreis; Abrechnen-Variante „GRAND" | Grand · Schneider · Null ouvert |
| **Kartenlegerin** | Heilung | Herz-Karten heilen +40 % und springen auf einen zweiten Verbündeten; sie sieht die nächste Karte (Anzeige über der Hand); Kartenregen wird **Legekreis** (heilt 8 s) | Herzdame · Pik-Schutz · Wahrsagen |
| **Falschspielerin** | Kontrolle/Tank | **Ass im Ärmel**: vierter Handplatz (Leiste 2 → Kniff `aermel`, hält eine Karte fest); jeder Stich verspottet den Gegner; Pik-Karten geben 30 % mehr Schild | Kontra · Ärmel · Re & Bock |

**HUD:** Augen als Skatblock-Leiste mit Marken 61/90/120 und Rest im Stapel · die Hand auf den Knöpfen 1–3 als
Kartenbild (Farbe + Rang, prozedural gezeichnet, kein Bildbedarf) · Gegnerkarte klein am Zauberbalken des Ziels.
**Effekte:** Karten fliegen drehend zum Ziel, Farbausbruch am Treffer (♣ schwarzgrüne Wolke, ♥ rote Herzen, ♠ Schildkuppel,
♦ Splitter), STICH! klatscht eine Karte über den Gegner, Abrechnen wirbelt alle Karten des Spiels als Strudel um das Ziel
und explodiert, Schneider/Schwarz in Gold.

## 4 · Engine-Vertrag (`class-resources.js`, Inhalt `content/resources.js`)

Ein Modul je Ressourcenmodell (`rage`, `trend`, `ammo`, `grill`, `cards`), ausgewählt über `RESOURCES[classId].kind`.
Zustand liegt in `g.res` (frisch bei Respawn, Klassenstand-Reset und Neuladen; nicht im Spielstand).

| Funktion | Zweck |
|---|---|
| `freshResource(g)` | Anfangszustand |
| `tickResource(g,dt,cs)` | Nachfluss, Verfall, Garen, Zeche abstottern, Nachladen |
| `resourceCost(g,s,cs)` / `resourceFailure(g,s,cs)` / `payResource(g,s,cs,cost)` | Kosten je Klasse (Randale, Likes, Flaschen, Glut, Karten/Augen) |
| `grantResource(g,n,source)` | Gutschriften aus Klassen-fremden Quellen (Proc `energy`, Gegenstände, Kill, Parade, Bastelgrips): Randale/Likes 1 : 1, Kevin 10 → 1 Flasche, Schorsch → +40 % als Glut, Käthe → +20 % als Augen |
| `resourceEvent(g,type,data)` | `hitTaken`(Betrag → Rückgabe = sofortiger Schaden), `cast`, `kill`, `parry`, `interrupt`, `damageDealt` |
| `performClassSkill(g,id,s,e,point,cs,context)` | übernimmt Kniffe, die das Modell selbst ausführt (Schorsch, Käthe, `zeche`, `reload`, Kevins Pömpel); Rückgabe `true` = generischer Zweig entfällt |
| `resourceDamageFactor(g,label,e)` | Faktor aus dem Zustand (Trend, Glutbereich, Farbkette) |
| `resourceHud(g)` | Anzeigezustand für die UI (siehe §6) |
| `resourceVariant(g,id)` | Leistenvariante (Karte, Grillgut, PÖMPEL, VIRAL) |

`p.energy` bleibt als Zahl für Dieter (Randale) und Anni (Likes) und wird für die übrigen Klassen nicht mehr gelesen.

**Neue Proc-Auslöser** (`PROC_TRIGGERS`): `tabPaid`, `prellen` (Dieter) · `trendUp`, `viral`, `shitstorm` (Anni) ·
`pickup`, `perfectReload`, `bonUsed` (Kevin) · `serve`, `perfectServe`, `overheat`, `vent`, `glutPerfect` (Schorsch) ·
`cardPlayed` (+`suit`), `follow`, `stich`, `gameWon`, `bubePlayed`, `shuffle` (Käthe).
**Neue Proc-Wirkungen:** `bottles:n`, `glut:n`, `cook:Anteil`, `augen:n`, `draw:1` (Hand neu), `trend:n`, `tab:−Anteil` (Zeche tilgen).

**Neue Effektschlüssel** (Talente, `KNOWN_EFFECTS`; alle wirken nur bei der eigenen Klasse):

| Klasse | Schlüssel (Wert) |
|---|---|
| Dieter | `zecheShare` (Anteil, + mehr anschreiben) · `zechePay` (Leben je Randale) · `zecheCap` (Anteil) · `prellenPower` (Anteil) · `hitRage` (Anteil mehr Randale aus Treffern) · `prellenCd` (s, negativ = früher) |
| Anni | `trendDecay` (s länger) · `trendStart` (Stufen zu Kampfbeginn) · `trendBonus` (Anteil je Stufe) · `repeatForgive` (1: Piekser ist nie Wiederholung) · `viralFree` (n zusätzliche Gratiskniffe) · `shitstormGuard` (1: Shitstorm kostet keinen Trend, sondern gibt Deckung) · `likesPerCast` (+n) |
| Kevin | `crateSize` (+n) · `dropChance` (Anteil) · `pickupRadius` (Einheiten) · `reloadZone` (Anteil breiter) · `reloadFill` (+n Flaschen normal) · `bonMax` (+n) · `bonPower` (Anteil) · `robbiPickup` (1) · `killBottles` (+n) |
| Schorsch | `glutDecay` (je s, negativ = langsamer) · `perfectLow` / `perfectHigh` (Grenzen des goldenen Bereichs, Einheiten Glut) · `glutStrike` (+n) · `glutParry` (+n) · `overheatSafe` (1) · `overheatDamage` (Anteil) · `overheatLock` (s, negativ = kürzer) · `rostSlots` (+n) · `cookSpeed` (Anteil) · `garWindow` (Anteil breiter) · `burntGrace` (Anteil später verkohlt) · `planWurst` · `planBraten` · `planMais` · `planKaese` (1 = Stück kommt in den Plan) · `wurstHeal` · `bratenDamage` · `maisRadius` · `kaeseShield` (Anteil/Einheiten) · `serveCleave` (1) · `ventHeal` (Anteil) · `ventSteam` (Anteil) · `emberDot` (Anteil) · `swingCook` (Anteil) · `smokeTaunt` (1) |
| Käthe | `handSize` (+1) · `redealCd` (s, negativ = früher) · `followBonus` (Anteil) · `followMax` (+n) · `bubePower` (Anteil) · `luschenPower` (Anteil) · `augenWin` (negativ = früher gewonnen) · `augenGain` (+n je Karte) · `abrechnenPower` (Anteil) · `stichAugen` (+n) · `stichAny` (1: sticht auch nicht unterbrechbare Zauber, ohne Abbruch) · `stichHeal` (Anteil Maximalleben) · `kreuzPower` · `pikPower` · `herzPower` · `karoPower` (Anteil) · `karoStun` (s) · `herzChain` (1) · `pikTaunt` (1) · `pikReflect` (Anteil) · `seeNext` (1) · `luschenGcd` (1: Luschen ohne GCD-Sperre) |

## 5 · Talentbäume

Alle fünf Klassen haben drei offene Bäume (E-37: 16 Punkte auf Stufe 30, Tore je Baum, Pfeile per `requires`).

- **Dieter, Anni, Kevin:** Die 270 Talente bleiben (Speicherschlüssel). Je Baum werden **zwei Talente der Reihen 0–3**
  gegen Ressourcen-Talente getauscht (Index bleibt, Inhalt neu), damit jeder Baum die neue Ökonomie anfasst. Alle Texte
  „Randale" werden bei Anni zu „Likes" und bei Kevin zu „Flaschen" (Umrechnung 10 Randale = 1 Flasche, aufgerundet).
- **Schorsch, Käthe:** je 3 × 30 neue Talente nach dem Autorenbrief (`docs/TALENT-AUTORENBRIEF-2026-09-18.md`), Reihen 0–3
  Gemeingut, ab Reihe 4 Handschrift (höchstens 10 je Baum `MECHANIC`/Ressourcen-Schlüssel mit Hauptbaumbindung),
  Reihe 9 Schlussstein ändert Servieren/Abrechnen, mindestens vier Procs je Baum, ein Brücken-Talent je Baum, Pfeile nur
  bei echter Abhängigkeit. Jedes Talent trägt zusätzlich `icon` (Vokabular `content/items.js ICONS`) für die Bildlücke,
  bis eigene Talentbilder da sind.

## 6 · Anzeige und Effekte (UI-Vertrag)

`resourceHud(g)` liefert `{kind, name, value, max, …}` je Modell:

- `rage`: `value`, `surgeAt`, `tab`, `tabMax`, `tabPaidPulse`
- `trend`: `value` (Likes), `trend`, `trendName`, `viewers`, `repeatWarn` (nächster Druck auf dieselbe Taste wäre Wiederholung)
- `ammo`: `value`, `max`, `bons`, `bonMax`, `reload:{t,total,zone:[a,b],jam}`, `pickups` (Anzahl am Boden)
- `grill`: `value` (Glut), `zones`, `zone`, `locked`, `rost:[{item,done,state}]`
- `cards`: `value` (Augen), `win`, `schneider`, `schwarz`, `hand:[{suit,rank}]`, `deck`, `chain`, `next` (bei Wahrsagen)

Effekt-Ereignisse über `emitCombatFx(g,kind,at,data)`: `tab-write`, `tab-pay`, `prellen` · `likes`, `trend-up`, `viral`,
`shitstorm` · `bottle-drop`, `pickup`, `reload`, `reload-perfect`, `reload-jam` · `glut`, `serve`, `overheat`, `steam`,
`grill-swing`, `ember` · `card-throw`, `card-burst`, `stich`, `abrechnen`, `shuffle`. Leergut und Grillrost werden
zusätzlich als Welt-/HUD-Objekte gezeichnet (Leergut: `g.res.pickups`).

## 7 · Speicher und Verträglichkeit

- Klassen-IDs `schorsch`, `kaethe`, Spec-IDs `schorsch-chef|flamme|rauch`, `kaethe-grand|herz|falsch`, Talente
  `<spec>-<index>` – ab heute Speicherschlüssel.
- Neue Kniff-IDs `zeche` (Dieter), `reload` (Kevin), `aermel` (Käthe, Falschspielerin) – Speicherschlüssel.
- Bestehende Spielstände: Klasse, Stufe, Talente bleiben. Die getauschten Talente (je Baum zwei) behalten ihren Index;
  wer sie gelernt hatte, hat nun das neue Talent derselben Zelle.
- Ressourcenstand wird nicht gespeichert (Kampfzustand).

## 8 · Risiken (zuerst)

1. **Kevin kann sich leerschießen** und steht dann mit dem Pömpel da. Gegenmittel: Kill wirft Flaschen ab, Nachladen ohne
   Abklingzeit, Autoangriff kostet nichts. Messung im Balancing-Lauf: Zeit mit leerem Kasten < 10 %.
2. **Annis Trend bestraft Anfänger**, die nur eine Taste drücken. Gegenmittel: Takt-Regel für den Piekser, Start 60 Likes,
   Hofprobe erklärt „nicht zweimal dasselbe" mit einer Zeile am Knopf (`repeatWarn` färbt den Knopf).
3. **Käthes Hand ist Zufall.** Gegenmittel: Neu geben mit sicherem Buben, Luschen schnell, jede Karte gibt Augen – eine
   schlechte Hand ist langsamer, nie nutzlos.
4. **Schorsch verlangt Multitasking** (Glut + drei Garzeiten). Gegenmittel: Lernkurve (Stufe 1 nur Glut, Rost ab 2),
   Goldschimmer + Ton beim Garpunkt, verkohlt ist schwächer, nie wirkungslos.
5. **Dieters Zeche kann „Schaden verstecken".** Gegenmittel: Obergrenze 40 %, Bon sichtbar am Porträt, Prellen als
   Belohnung. Heiler (Mitspieler) sehen den Bon nicht – offen für Online.
6. **Umfang:** 180 neue Talente + 18 getauschte + neue HUD-Teile. Umsetzung in Wellen mit getrennten Dateien (§9).

## 9 · Umsetzung und Besitz

| Welle | Inhalt | Besitzer |
|---|---|---|
| 1 | `content/resources.js`, `class-resources.js`, Engine-Anbindung, neue Klassen registriert (Kits, Specs, Lernstufen, Schadensmodelle) | Orchestrator |
| 1 parallel | Talente + Procs Schorsch (`content/talents/schorsch.js`, `content/procs/schorsch.js`) | Talent-Agent A |
| 1 parallel | Talente + Procs Käthe | Talent-Agent B |
| 1 parallel | Umstellung Anni/Kevin-Texte, 18 Ressourcen-Talente, Glossar | Talent-Agent C |
| 2 | HUD je Ressource + Effekte/Animationen | UI-Agent |
| 2 | Charaktererstellung mit fünf Klassen, Startkleidung, Kniff-Bilder | UI-Agent 2 |
| 3 | Messlauf (`scripts/spec-sim.mjs`), Browser-Abnahme, Playtest Kenner, live | Orchestrator |
