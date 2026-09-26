# Dungeon-Figuren „Schloss Big B“ · Entwurf 2026-09-26

**Status: Entwurf, nicht live.** Zweig `dungeon-figuren` (Worktree `D:\Dev\MertlochChronicles-dg-figuren`), nicht nach `main`. Figurengrafik
geht erst nach ausdrücklicher Freigabe durch den Nutzer live (E-71 Punkt 6, Standing Rule „Figurengrafik erst nach Freigabe“).

Nutzerauftrag: „Grafiken für Bosse und Gegner und Animationen und Bewegungen kannst du gerne schon aufsetzen.“

- **Galerie:** `D:\Dev\_prototypen\dungeon-figuren-2026-09-26\galerie.html` (ohne Server lesbar, Bilder unter `bilder/`).
- **Im Spiel ansehen:** `localStorage['mertloch-dungeon-figuren']='1'` oder URL `?dungeon-figuren=1` (`?dungeon-figuren=0` schaltet für die
  Sitzung aus). Ohne Schalter bleibt alles wie heute.
- **Prüfung:** `CDP_PORT=9730 SERVER_PORT=4530 node scripts/dungeon-figuren-check.mjs` (Schalter an/aus, Bosse mit Ansagen, Vergleich
  heute ↔ Entwurf, Leistung) und `tests/dungeon-figuren.test.mjs`.
- **Werkzeug und Bau:** `docs/ANZIEHPUPPE.md`, Abschnitt „Sonderbögen und Motive“.

## Grundsatz: drei Schichten, keine Sonderkörper

Jeder Mensch ist einer der drei Archetypen (Kräftig/`dieter`, Schwungvoll/`baerbel`, Drahtig/`kevin`) + Aussehen aus dem Editor
(Haut, Haar, Bart, Brille, Frisur) + Kleidung. Kostüme sind Kleidungsteile, die jeder Archetyp tragen kann (alle neuen Teile sind für alle drei
Archetypen gebaut und geprüft). Die Figuren stehen als reine Daten in `content/dungeon-figuren.js`. Nicht-Menschen sind **Motive** im
gleichen Pixelstil (`tools/paperdoll/motive.mjs`).

## Figuren

**Fett** = neu gezeichnet, sonst wiederverwendet.

| Figur | Rolle | Körper | Aussehen | Kleidung | Ansagen (Zauber → Pose) |
|---|---|---|---|---|---|
| Gästeliste-Gerd | Boss, Siegel 1 | Kräftig | hell, schwarz, Sonnenbrille, Stoppeln | **Security-Anzug (zu klein, Schulterpolster, Rücken SECURITY)**, Stoffhose, Halbschuhe, **Kinder-Headset mit Katzenohren**, **Absperrpfosten mit Samtseil**, Klemmbrett | Rausschmiss → *ausholen* (tief geduckt) → *schubsen*; Liste → *zeigen*; Dresscode → *vorhalten* (Klemmbrett) |
| Frau Dr. Exposé | Boss, Siegel 2 | Schwungvoll | hell, blond (Dutt) | **Hosenanzug in Petrol**, **Pumps**, **Sonnenbrille im Haar**, **VERKAUFT-Schild**, Hochglanz-Exposé (Aktenmappe) | Provisionsforderung („unterschreiben lassen“) → *vorhalten*; Grundstück verkauft → Schild heben und aufstempeln (Hieb); Notartermin → Zauberpose; Besichtigung → *zeigen* |
| Kellermeister Korken-Kurt | Boss, Siegel 3 | Kräftig | hell, grau, Schnauzer | Hemd, **Sommelierweste mit Probierlöffel**, **Kellerschürze**, Stoffhose, Halbschuhe, Korkenzieher des Kellermeisters, **Probierglas** | „Runde auf mich!“ → *jubeln* (Glas hoch); Fass rollt → *ausholen* → *schubsen*; Jeder zahlt selbst → *zeigen*; Korken knallen → Hieb |
| Reichweiten-Rita | Boss, optional | Schwungvoll | mittel, blau | **Bomberjacke in Neonpink (Rücken LIVE)**, Jeans, **Turnschuhe**, **Greenscreen-Umhang**, **Ringlicht als Heiligenschein**, **Handy** | Blitzlicht → *selfie* + Ring flammt auf (Laufzeit-Effekt); Story posten → *vorhalten*; Greenscreen → Zauberpose, dann unsichtbar wie heute |
| Das halbe Pferd | Boss, selten | Drahtig | – (unter der Maske) | Jeans, **Turnschuhe**, **Kostümpferd (Maske, Hals, Leib hinten glatt abgeschnitten mit Pflaster, Hufärmel)** | Huftritt → *ausholen* → *tritt* (mit dem Turnschuh); Wiehern → *jubeln*; Säuft am Trog → *bücken* (solange es säuft) |
| Big B, der Lügenbaron | Endboss | Kräftig | hell, braun, Vollbart | Pelzmantel des Barons, Stoffhose, **Reitstiefel mit Stulpe**, Kronkorkenkette, **Perücke mit Zopf**, **Pappkrone**, **Selfie-Stick mit Ringlicht**, Siegelring (Ring der ewigen Rückgabe) | Behauptung → *zeigen* auf die behauptete Seite (links: Waffenhand nach SW, rechts: Nebenhand nach SO), Nachsatz → *achselzucken* (klein gemacht), Ritt → Sprint; Anwalt → *telefon*; Live-Schalte → *selfie*; Am eigenen Schopf → *schopf* (Füße in der Luft); Siegelring → Hieb; Geständnis → *zusammensinken* |
| Security-Azubi | Trash, ruft Hilfe | Drahtig | hell, braun | **Security-Polo (zu groß, gelber Druck)**, Jeans, **Turnschuhe**, **Basecap verkehrt herum**, **Spielzeugfunk** | Funkspruch → *telefon*; Schubser → *ausholen* → *schubsen* |
| Makler-Praktikant | Trash, **Heiler** | Drahtig | hell, braun, Brille | **Konfirmationsanzug (sandgrau, zu groß)**, Halbschuhe, Praktikantenausweis, **Neon-Thermoskanne mit Dampf**, **Tablet** | Provision (Heilung) → *selfie* (Thermoskanne hoch); Exposé verteilen → Hieb |
| Baumarkt-Ritter | Elite | Kräftig | hell, braun | **Lüftungsrohr-Beine**, Festivalstiefel, **Regenrinnen-Panzer mit Absperrband**, **Eimerhelm**, **Regenrinnen-Schwert**, **Mülltonnendeckel** | Regenrinnen-Hieb → Hieb; Schildwall → Parade |
| Follower (3 Varianten) | Add (Big B) | Schwungvoll / Drahtig / Kräftig | wechselnd | **Fan-Shirt BIG B**, Jeans bzw. Stoffhose, **Turnschuhe**, **Fischerhut** bzw. Irokese bzw. Stirnband, Ringlicht der Reichweite, **Handy** | Standbild ist *selfie* (filmen); Selfie mit Blitz → *selfie* |
| Interessent (2 Varianten) | Add (Exposé) | Drahtig / Kräftig | wechselnd | Hemd bzw. Strickjacke, **Zollstock**, **Jacke überm Arm** | Unterschrift → *vorhalten* |
| Kommentator | Add (Rita) | Drahtig | hell, schwarz, Brille, Stoppeln | Festival-Regenjacke, Jeans, **Turnschuhe**, **Handy** | Hate-Kommentar → *vorhalten* |
| Vermieter Volker | Händler | Kräftig | hell, grau, Brille, Schnauzer | Sakko, Stoffhose, Halbschuhe, Schiebermütze, **Schlüsselbund**, Klemmbrett (Mietvertrag) | – |
| Pappwache | Trash, Attrappe | **Motiv** | – | gedruckter Ritter, weißer Stanzrand, Pappkante, Klebeband am Boden; hinten Packpapier mit Stützlasche und „OBEN“ | wackelt, kippt um |
| Pappschütze | Trash, Fernkampf | **Motiv** | – | gedruckter Burgschütze hinter einer gedruckten Zinne, echte Neon-Wasserpistole festgeklebt | watschelt, spritzt |
| Pfandratte | Trash, Schwarm | **Motiv** (×1,3) | – | Kellerratte mit Kronkorken im Maul | trippelt, schnappt |
| Schlossgespenst | Trash, Illusion | **Motiv** | – | Beamer-Projektion eines Bettlaken-Gespensts: Farbsäume, Zeilenraster, gerade Unterkante | schwebt, „Buhuu“ (Arme hoch), Bildstörung beim Treffer; im Spiel halbdurchsichtig flimmernd ohne Mischmodi |

Animationen je Mensch: Stehen/Atmen/Blinzeln, Laufen (8 Bilder), Angriff (Hieb, bei Bedarf Zweihand), Treffer, Tod (Umkippen wie heute
in `renderer.js drawCorpse`, mit dem Treffer-Bild), dazu die Sonderposen. Größe: Bosse zeichnen in Bossgröße (`WORLD_SCALE.boss` 29 E), das
Spiel legt ×1,35 darüber; Elite ×1,15 wie gehabt.

### Die Sonderposen (neu, 13)

| Pose | Wirkung | Wer |
|---|---|---|
| ausholen | tief geduckt, Hände vor der Brust angezogen: gleich kommt ein Stoß | Gerd, Kurt (Fass), Pferd (Huftritt), Azubi |
| schubsen | Ausfallschritt, beide Arme gestreckt | Gerd, Kurt, Azubi |
| zeigen / zeigenN | ausgestreckter Arm auf Schulterhöhe (Waffenhand bzw. Nebenhand), andere Hand in der Hüfte | Big B (Behauptung), Gerd, Exposé, Kurt |
| jubeln | beide Arme hoch | Kurt („Runde auf mich!“), Pferd (Wiehern) |
| vorhalten | Gegenstand der Nebenhand vorn gezeigt | Exposé, Rita, Gerd (Dresscode), Adds |
| selfie | Handy/Stick/Thermoskanne senkrecht über den Kopf | Rita, Big B, Follower, Makler (Heilung) |
| telefon | Hand am Ohr | Big B (Anwalt), Azubi (Funk) |
| achselzucken | klein gemacht: Kopf runter, Schultern hoch, Handflächen dicht am Körper | Big B (Nachsatz) |
| schopf | beide Hände über dem Kopf, Füße 15 px in der Luft | Big B |
| zusammensinken | Knie weich, Rücken rund, Kopf unten | Big B (Geständnis) |
| bücken | tief nach vorn gebeugt | Pferd (Saufen) |
| tritt | Führungsbein waagrecht nach vorn | Pferd |

Die Posen hängen an den Mechaniken, nicht an Zeitplänen: `dungeon-figuren-art.js` liest den laufenden Zauber (`e.cast.type`), bei Big B den
Stand der Lüge (`k.told`, `k.claimLane`), das Geständnis (`e.confessed`) und das Saufen (`e.drinking`). Nach dem Zauberende hält das Endbild
0,45 s (Stoß, Tritt, Stempel). Blickt die Figur nach SO oder NW, zeigt sie mit der Nebenhand, sonst verdeckt der Arm die Brust.

## Neu und wiederverwendet

- **Neu gezeichnet (36 Kleidungsteile)** in `tools/paperdoll/dungeon-kleidung.mjs`: Security-Anzug, Security-Polo, Konfirmationsanzug,
  Hosenanzug, Bomberjacke, Regenrinnen-Panzer, Kostümpferd, Lüftungsrohr-Beine, Fan-Shirt, Sommelierweste, Kellerschürze, Greenscreen-Umhang,
  Ringlicht-Heiligenschein, Perücke, Pappkrone, Eimerhelm, Basecap, Kinder-Headset, Fischerhut, Sonnenbrille im Haar, Absperrpfosten,
  Spielzeugfunk, Handy, Selfie-Stick, Zollstock, Regenrinnen-Schwert, VERKAUFT-Schild, Neon-Thermoskanne, Tablet, Probierglas, Jacke überm
  Arm, Mülltonnendeckel, Schlüsselbund, Pumps, Turnschuhe, Reitstiefel. Dazu **13 Sonderposen** (`puppe.mjs`), **4 Motive**
  (`motive.mjs`) und neue Schriftzeichen (S, Y, B, V, X, H, K, M, F, W) für Aufdrucke.
- **Wiederverwendet:** Körper, Köpfe und alle Editor-Ebenen; Stoffhose, Halbschuhe, Hemd, Jeans, Strickjacke, Festival-Regenjacke,
  Festivalstiefel, Klemmbrett, Praktikantenausweis, Studio-Kopfhörer; die Dorflegenden aus dem Dungeon selbst: Pelzmantel des Barons,
  Hochglanz-Exposé, Korkenzieher des Kellermeisters, Ringlicht der Reichweite, Kronkorkenkette, Ring der ewigen Rückgabe.

## Technik

- **Sonderbögen** statt neuer `FRAMES`: Grund- und Aktionsbögen aller vorhandenen Quellen bleiben byte-gleich; Sonderbögen gibt es nur für die
  Quellen und Archetypen der Dungeon-Figuren. Fehlt ein Sonderbogen, zeigt die Figur das Rückfallbild (`cat.sonder.frames[k].fb`).
- **Laufzeit** (`paperdoll-art.js`): Teil 2 = Sonderbogen, `p.artFrame`, `loadPaperdollSheet`. Sonst unverändert; ohne Schalter wird keine
  dieser Stellen erreicht.
- **Schalter und Andockpunkte:** `dungeon-figuren-art.js` (`dungeonFigurenAn`, `drawDungeonFigure`, `drawDungeonPerson`), eine Zeile in
  `clan-art.js drawClanEnemy` (auch für die Bossbilder im Journal), zwei in `dungeon-e4b-art.js` (Volker). Figuren melden sich bei der Puppe erst
  an, wenn der Schalter an ist; ohne Schalter lädt kein einziger neuer Bogen (Prüfskript Teil 3).
- **Laden:** Beim ersten Anblick einer Figur lädt ihr Archetyp Grund-, Aktions- und Sonderbögen vorab (`preloadPaperdoll`), damit die erste
  Ansage nicht auf das Rückfallbild fällt.

## Größe und Ladezeit

- **Server:** Laufzeitordner `assets/paperdoll/runtime` von 13,4 MB (1984 Dateien) auf 23,0 MB (3114 Dateien): neue Kleidung 6,40 MB
  (36 Quellen × 3 Archetypen × Richtungen, 798 Dateien, Grund- und Aktionsbögen wie jedes Kleidungsteil), Sonderbögen 3,06 MB (324 Dateien, nur
  für die Archetypen der Dungeon-Figuren), Motive 61 KB (8 Dateien). Vorhandene Bögen sind unverändert, nur `catalog.json` ändert sich.
- **Laden:** nach Bedarf wie alle Puppenbögen; im Offline-Cache nur optional (`precache-manifest.js`). Ohne Schalter lädt nichts davon.
- **Je Figur** beim ersten Anblick (ihr Archetyp, vier Richtungen, Grund + Aktion + Sonder, geteilte Bögen nicht abgezogen):

| Figur | Dateien | Grund | Aktion | Sonder | zusammen | bei 10 Mbit/s |
|---|---|---|---|---|---|---|
| Gästeliste-Gerd | 98 | 190 KB | 355 KB | 409 KB | 954 KB | 0,8 s |
| Frau Dr. Exposé | 76 | 204 KB | 351 KB | 407 KB | 963 KB | 0,8 s |
| Korken-Kurt | 98 | 165 KB | 340 KB | 382 KB | 886 KB | 0,7 s |
| Reichweiten-Rita | 84 | 180 KB | 383 KB | 433 KB | 996 KB | 0,8 s |
| Das halbe Pferd | 42 | 160 KB | 315 KB | 364 KB | 839 KB | 0,7 s |
| Big B | 94 | 171 KB | 412 KB | 480 KB | 1063 KB | 0,9 s |
| Security-Azubi | 66 | 141 KB | 279 KB | 317 KB | 736 KB | 0,6 s |
| Makler-Praktikant | 76 | 137 KB | 303 KB | 355 KB | 795 KB | 0,7 s |
| Baumarkt-Ritter | 78 | 233 KB | 432 KB | 476 KB | 1141 KB | 0,9 s |
| Follower (3 Varianten) | 76–86 | 138–150 KB | 284–310 KB | 329–354 KB | 751–813 KB | 0,6–0,7 s |
| Interessent (2 Varianten) | 74 | 130–142 KB | 282–313 KB | 327–361 KB | 738–816 KB | 0,6–0,7 s |
| Kommentator | 74 | 167 KB | 319 KB | 367 KB | 852 KB | 0,7 s |
| Vermieter Volker | 94 | 128 KB | 300 KB | 349 KB | 777 KB | 0,6 s |

- **Ganzer Dungeon:** alle Figuren zusammen 890 Dateien, 7,4 MB (davon Grundbögen 1,6 MB), dazu Motive 61 KB: rund 6 s bei 10 Mbit/s bzw.
  1,2 s bei 50 Mbit/s, verteilt auf den Durchgang (Figuren kommen raumweise ins Bild). Körperbögen haben Helden oft schon geladen.
- **Bildrate** (Server ohne Grafikkarte, headless, Desktop 2024 × 900, `scripts/dungeon-figuren-check.mjs` Teil 6/7, je 5 s):

| Ort | Schalter aus | Schalter an |
|---|---|---|
| Burghof (Trash, Pappwachen) | 59 FPS, Median 16,7 ms, p90 16,7 ms | 58 FPS, Median 16,7 ms, p90 16,7 ms |
| Weinkeller (16 Ratten, Trash) | 31 FPS, Median 33,3 ms, p90 50 ms | 30 FPS, Median 33,3 ms, p90 50 ms |

  Die Figuren kosten nichts Messbares. Der Weinkeller liegt schon heute ohne Schalter bei 30 FPS; das ist ein eigener Befund (nicht untersucht),
  kein Figurenthema.

## Vorgehen: vier Runden und zwei Blindgutachten

1. **Runde 1:** alle Figuren, Motive und Sonderposen angelegt, Vorschau aus dem Werkzeug (nah und in Weltgröße 0,3/0,45/0,6) angesehen.
   Befunde: Zeigegesten verschwanden in der Schrägsicht vor der Brust, Exposé zeigte Unterwäsche zwischen Blazer und Hose, das Pferd las sich als
   Mensch im weißen Pulli, Big Bs Perücke ließ hinten das Haar durch, Ritas Ring war kaum zu sehen, die Pappschützen glichen der Pappwache.
2. **Runde 2:** Posen mit voller Armlänge, Nebenhand-Zeigen, Achselzucken als Nachsatz; Hosenbund unter den Sakkos; Pferdeleib als waagrechte
   Kapsel mit glattem Schnitt und Pflaster; Perücke hinten geschlossen; großer Ring; Pappschütze hinter einer gedruckten Zinne; Ratte von hinten
   neu; Gespenst mit Farbsäumen und Zeilenraster. Laufzeit angebunden, im Spiel geprüft (Bossbilder über den echten Zauberweg).
3. **Blindgutachten** (Unter-Agent, Spielgrafiker-Blick, nur Bilder): Noten Gerd 5, Exposé 6, Kurt 7, Rita 6, Pferd 7, Big B 7, Trash 6
   (Ritter 8, Azubi 6, Praktikant als Heiler 4). Wichtigste Befunde: Heiler nicht erkennbar, Gerd geht unter und seine Posen gleichen sich,
   Klone unter den Adds (Idas Frisur, lila Hoodies), goldener Heiligenschein liest sich als „Heiler“, Manschetten wie Verbände.
4. **Runde 3** (nach dem Gutachten): Praktikant sandgrau mit Neon-Thermoskanne (Heilung = Kanne hoch); Gerd mit breiten Schultern,
   Katzenohren-Headset und Absperrpfosten mit Samtseil, Rausschmiss als tiefes Ducken; Exposé in Rosa mit VERKAUFT-Schild und Brille im Haar;
   Ritas Ring kühl-weiß, beim Blitzlicht flammt er auf; Follower im Fan-Shirt „BIG B“ mit Fischerhut; Kommentator in gelber Regenjacke,
   Volker in Strickjacke, zweite Interessentin als kräftiger Mann; Kurts Schürze weicher; Pferd dunkler abgestuft, Schnitt auch von vorn;
   schmale Manschetten; Pappwache hinten hell, Zinne mit Stanzrand, Gespenst mit gerader Unterkante, größerer Kronkorken.
5. **Nachgutachten** (derselbe Unter-Agent): Gerd 5 → 7, Exposé 6 → 7, Kurt 7, Rita 6 → 8, Pferd 7, Big B 7 → 8, Trash 6 → 7. Restpunkte:
   Nachsatz und Live sahen gleich aus, Requisiten zu klein, Farbdoppelungen (Exposé wie Rita rosa, Pferd grau auf grau, Volker wie Interessent 2).
6. **Runde 4:** Nachsatz „klein gemacht“ (Kopf runter, Hände dicht am Körper), Live mit senkrechtem Stick über dem Kopf; Absperrpfosten in
   Beinlänge mit schwerem Fuß und durchhängendem Seil; VERKAUFT-Schild doppelt so groß am Pflock; Exposé in Petrol; Pferd heller Schimmel mit
   schwarzer Mähne, rosa Schnitt von vorn 5 px breit; Volker in Sakko und Schiebermütze; Follower 3 mit Stirnband statt Nyalols Kopfhörern;
   Kurts Schürze mit gewelltem Saum.

## Einschätzung der Qualität

- **Gegenüber Ida und den Stammgästen:** dasselbe System (Körper, Codex-Köpfe, Kontur, Palette, Formlicht), deshalb passen Proportionen,
  Köpfe und Kontur zusammen; das bestätigt auch das Blindgutachten. Schwächer als die Referenz sind die **Stoffe**: Idas Latzhose, die Jeans und
  die Regenjacke tragen eine Codex-Stofffüllung, die neuen Kostüme sind rein gezeichnete Flächen mit Formlicht und wenigen Nähten. Aus der Nähe
  wirken sie sauberer und flacher; in Weltgröße fällt das kaum auf.
- **Bosse** unterscheiden sich über Silhouette, Farbe und Requisiten, nicht über Gesichter (drei Köpfe für alle). Die heutigen Platzhalter sind
  größere, dickere Comic-Sprites mit eigenen Gesichtern; neben ihnen wirken die neuen Bosse zierlicher, passen aber zu Helden, Söldnern und NPCs.
- **Noten des Blindgutachtens nach Runde 3:** Gerd 7, Exposé 7, Kurt 7, Rita 8, halbes Pferd 7, Big B 8, Trash 7 (vorher 5–7). Runde 4 hat
  danach die drei Restpunkte angefasst (Nachsatz ≠ Live, Requisiten doppelt so groß, Farbdoppelungen); nicht erneut benotet.
- **Am stärksten:** Baumarkt-Ritter, Big B, Rita, die Pappaufsteller. **Am schwächsten:** Kurt (Schürze wirkt steif, Korkenzieher grau auf grau),
  Makler-Praktikant (Anzug generisch, lebt von der Thermoskanne), Gespenst (liest sich eher als Laken; die Projektion trägt erst das Flimmern).
- **Ansagen:** im Spiel lesbar (Aufnahmen `boss-*.jpg`): Gerd duckt sich vor dem Rausschmiss und stößt dann, Big B zeigt auf die behauptete
  Seite und macht sich beim Nachsatz klein, Kurt reißt zur Runde die Arme hoch, Ritas Ring flammt vor dem Blitz auf. Kleine Posen wie *telefon*
  und *vorhalten* bleiben in Weltgröße Andeutungen; dort trägt die Warnleiste weiter die Hauptlast.

## Offene Punkte

- **Big Bs Pelzmantel** (Dorflegende, live für Helden): das Fell ist Einzelpixel-Rauschen und liest sich wie Kork. Gehört dem Legenden-Paket,
  hier nicht angefasst; Vorschlag: Büschel in drei Tönen.
- **Namensschilder der Söldner** liegen im Kampf über dem Boss und verdecken Ansagen (Blindgutachten). Kein Figurenthema, aber für die
  Lesbarkeit wichtig (z. B. Schilder der Söldner im Bosskampf ausblenden).
- **Schildhöhen:** Namensschilder richten sich noch nach der Höhe der Platzhalter (`liveActorHeight`); mit Schalter sitzen sie teils zu hoch.
- **Gesichter:** Jeder Archetyp hat ein Gesicht (Codex-Kopf); Bosse unterscheiden sich über Haar, Bart, Brille und Kopfteile, nicht über
  Gesichtszüge. Idas Locken-Dutt tragen weiter alle Schwungvollen ohne Kopfteil.
- **Rückansichten der Motive** sind einfacher als die Vorderseiten (Pappe hinten absichtlich schlicht).
- **Pferd als Reittier** (E-68): Vorschlag unten, noch nicht gebaut.
- Die Sonderposen gibt es nur für Dungeon-Figuren; Helden können sie nicht nutzen (Absicht, kein Bogen dafür).

## Das halbe Pferd als Reittier (Vorschlag)

Das Kostüm ist schon ein Kleidungsteil auf dem Drahtigen. Als Reittier (E-68, `MOUNTS`) böte sich eine Sitzform „Huckepack“ an: der
Kostümträger gebückt (Pose *bücken*), der Reiter sitzt auf dem abgeschnittenen Leib; Hufärmel und Turnschuhe laufen im Trab. Bestehende
Bausteine: `poseRide`, `rideMount`, das Kostüm als Tierzeichnung. Die heutige Beute „Das halbe Pferd“ (Hofpferd-Bogen, getönt) bliebe bis zur
Freigabe der Rückfall.

## Vorschläge für Codex-Teile (Hybrid Weg C, nach dem Reset)

- **Köpfe mit eigenem Gesicht für die Bosse** (Gerd: Türsteher mit Doppelkinn; Kurt: rote Nase, Tränensäcke; Big B: Schnurrbart gezwirbelt,
  Doppelkinn), eingepasst wie `hybrid/teile/kopf-*`. Größter Gewinn für den Wiedererkennungswert.
- **Pferdemaske** als starres Teil (vorn/hinten), mit Glubschaugen und Stoffstruktur.
- **Pelzmantel-Füllung** (Stofffüllung wie Kutte/Regenjacke) statt Einzelpixel-Rauschen.
- **Pappaufsteller-Drucke** (Ritter, Schütze) als gemaltes Motiv mit Druckraster; die Puppe liefert Stanzform, Kante und Rückseite.
- **Porträts der Bosse** für Bossrahmen und Journal (Weg aus E-69).

## Fragen an den Nutzer

1. **Big B:** so lassen (kräftig, Vollbart, Pelz, Münchhausen) oder ein drahtiger kleiner Mann im viel zu großen Pelzmantel, als Nachsatz-Gag
   auf den Namen „Big B“?
2. **Das halbe Pferd:** Schimmel wie in der Beschreibung (jetzt weiß mit schwarzer Mähne) oder ein brauner Fuchs, der sich auf grauem Stein besser
   abhebt? Und soll das Reittier die Huckepack-Idee werden?
3. **Weg zur Freigabe:** Sollen die Bosse nach dem Codex-Reset erst eigene Köpfe bekommen (Hybrid Weg C) und dann live gehen, oder erst die
   Puppenfassung live und die Köpfe später?
