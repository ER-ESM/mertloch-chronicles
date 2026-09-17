# Akt 1 „Filmriss“ – Kein Hemd. Kein Plan. Kein Clan.

Stand 2026-09-17, Branch `content-backend`. Alle Texte und Daten liegen in `content/` (story.js, dialogues.js, memories.js, buildings.js, enemies.js, items.js, drops.js, npcs.js, quests.js, tutorial.js). Dieses Dokument ist die Landkarte dazu: Prämisse, Ton, Figuren, Kapitel-Beats, Erinnerungsfetzen, Basisbau, Running Gags, offene Entscheidungen. Akt 1 wird fertig gemacht, bevor irgendwas Neues gebaut wird.

## 1. Prämisse

Sonntagmorgen nach „Nie wieder Montag“, dem Jahresfest des Poo-Tang-Clans. Der Held wacht in den Trümmern der Bude auf: Unterhose, eine Socke, ein Stempel „NIE WIEDER MONTAG · ZUTRITT“ auf dem Unterarm, ein Pfandbon über acht Cent. Keine Erinnerung, nicht mal der eigene Name. Niemand im Dorf kennt ihn.

Die Bude (ehemalige Milchsammelstelle hinter St. Gangolf, seit 2007 Vereinsheim ohne Verein) wurde in der Nacht zerlegt. Tresen raus, Anlage weg, Grill umgekippt, Dach halb ab. Die Kiste – die Kiste vom ersten Fest 2007 – ist verschwunden. Wer es war, weiß niemand. Wer nüchtern war, auch nicht. Das ist dasselbe Problem.

Ida hat drei Theorien über den Helden: Zeuge, Täter oder Sperrmüll. Für alle drei gibt es Verwendung.

**Drei Stränge, die den Akt tragen:**

1. **Wiederaufbau** – die Bude wird Kapitel für Kapitel wieder hochgezogen (Basisbau, Abschnitt 6).
2. **Die Unbekannten** – jeder Verdächtige hat ein Alibi und einen Hinweis; die Spur führt von Ruhe 22:01 über den Schrottplatz und den Kegelclub zu einem Bus mit Koblenzer Kennzeichen.
3. **Der Filmriss** – neun Erinnerungsfetzen, die den Helden Stück für Stück zurück in die Nacht führen. Am Ende weiß er: Er war dabei. Er hat die Kiste getragen. Freiwillig.

## 2. Ton

Derb, dörflich, schnell. Alles wird aufs Korn genommen: Vereinsmeier, Ordnungsamt, Influencer-Landhaus, Bastler ohne TÜV, Junggesellenabschiede, Kegelclubs, Schrottplatz-Könige, die Dorfpolizei. Saufen und Prügeln sind Alltag, nicht Pointe. Die Pointe ist immer ein konkretes Dorfproblem („Sigi hat auch meinen Rasenmäher. Seit 2016.“). Keine echten Personen, kein Sie. Der Clan ist nicht unschuldig: Dieter hat den Tresen selbst umgetreten, Kevin hat die Anlage in Sigis Hänger „in Sicherheit gebracht“, Anni hat gefilmt statt geholfen.

Regel für jede Zeile: Erst die Behauptung, dann der Nachsatz, der sie kaputt macht. „Ich hab den Tresen nicht umgetreten. Der Tresen ist gefallen. In meine Richtung. Mehrfach.“

## 3. Figuren

**Clan (Bude):**

| Figur | Rolle in Akt 1 | Running Gag |
|---|---|---|
| Kisten-Ida | Hauptquestgeberin, Bauleitung, verteilt die Kapitel | Hat auf alles eine Wette laufen; „Rede nicht. Bau.“ |
| Dosen-Dieter | Mentor Tank, Baumeister; Pate „Tresen“ | Bierdeckel = Baugenehmigung; die Kugel von 2011 ist „geliehen“; der Tresen „war eh morsch“ |
| Aperol-Anni | Mentorin Heilung; Patin „Landhaus-Ecke“ | Vorher-Nachher-Foto; alles ist Content; die Putzpyramide |
| Klo-Kevin | Mentor Fernkampf; Pate „Werkstatt“ | Strom „aus Quellen, die wir nicht nennen“; „Hält schon“; sortiert Bastians 400 Fotos nach Promille |
| Oskar, Leander | Paten „Grill“ und „Anlage“ | Wurstphilosophie; Bass, den die Oma drei Straßen weiter spürt |

**Klassenwahl = Klamottenwahl.** Der Held hat nichts an. Er nimmt Dieters Kutte, Annis Schürze oder Kevins Gürtel vom Haufen – und kämpft in dessen Stil. Die drei bleiben als Mentoren an der Bude stehen (`HUB_TALK` in dialogues.js, je Kapitel zwei Zeilen). Wechsel am Treffpunkt = Klamotten tauschen.

**Verdächtige und Zeugen:**

| Figur | Kapitel | Alibi | Hinweis |
|---|---|---|---|
| Horst Nüchternmann (Ruhe 22:01) | 1 | Um 22:01 Uhr Polizei vom Festnetz, protokolliert | Beweismittelkiste mit der Hose des Helden, darin Busticket Koblenz–Mertloch und ein fremdes Handy („BASTIAN ♥ JENNY“) |
| Sperrmüll-Sigi (Schrottplatz) | 2 | Kam um drei mit dem Hänger, da war alles schon hin | Bus mit Koblenzer Kennzeichen, hinten dran „einer in Unterhose mit Bierkasten auf dem Kopf“ |
| Kegelkönig Klaus (Alle Neune Kalt) | 3 | Eigene Kegelbahn wurde zerlegt, er war Opfer | Zwölf weiße GAME-OVER-Shirts und einer in Unterhose, der „NEUES SPIEL!“ schreit – die Stimme des Helden |
| Trauzeuge Timo (JGA aus Koblenz) | 4 | Keins. Sie waren es. Mit dem Clan zusammen. | Erkennt den Helden als „Nachtbus-Typ“; hat die Nacht gefilmt; die Kiste hat Bastian |
| Polizeiobermeister Pit | 4 (Nebenquest) | – | Will keinen Papierkram; „Ich war nie hier.“ |
| Bastian „der Bräutigam“ | abwesend | – | Hat die Kiste als Hochzeitsgeschenk; heiratet Samstag in Koblenz. Akt-2-Haken. |

## 4. Kapitel-Beats

### Prolog · Hofprobe (tutorial.js)
Ida: „Unterhose, eine Socke, unser Stempel auf dem Arm. Bevor ich dir irgendwas glaube, zeig mir, dass du geradeaus laufen kannst.“ Klamotten wählen, Papp-Horst verprügeln, Kaltgetränk einpacken. Erinnerungsfetzen „Der Stempel“ beim Abschluss.

### Kapitel 1 · Der übliche Verdächtige (läuft im Spiel)
- Drei Pfandkeiler fressen die Trümmer. Zwei Ruhewärter „sichern Beweise“. Horst hält die Beweismittelkiste.
- Belohnung: Goldener Dosenöffner („MERTLOCH BLEIBT WACH“, schief graviert, Kevin war es), die Hose zurück.
- Wendung: Horst hat ein Alibi. In der Hose: Busticket Koblenz, fremdes Handy. „Du warst nicht allein.“
- Ida: „Aufnahmeprüfung Teil eins bestanden. Teil zwei: Wir bauen die Bude wieder auf. Mit dir. Weil du sonst keine hast.“

### Kapitel 2 · Wiederaufbau mit Restpromille
- Sechs Paletten vom Sperrmüllplatz, vier Festzelt-Schnorrer von der Baustelle, Sperrmüll-Sigi den Tresen abnehmen („Finderrecht ist Finderrecht“).
- Sigi kämpft mit Greifzange und Kühlschranktür; Phase 3: „Der Tresen war eh morsch. Sagt das nicht Dieter.“
- Belohnung: Sigis Greifzange; Basisbau Tresen/Grill/Werkstatt Stufe 1.
- Wendung: Sigi hat den Bus gesehen. Und den Kasten auf dem Kopf. „Sigi hat gewunken. Der Kasten hat zurückgewunken.“ Alle gucken den Helden an.

### Kapitel 3 · Alle Neune, kein Alibi
- Kegelclub „Alle Neune Kalt“ (Erzfeind seit Dorfpokal 2011, Dieter hat die Kugel behalten) rückt zum Festplatz an: fünf Kegelbrüder, fünf Kabel von der zerlegten Kegelbahn, Kegelkönig Klaus.
- Klaus: „Das ist kein Pudel! Das war ABSICHT!“ Phase 3: „Zwölf Mann. Weiße Shirts. Und einer in Unterhose. Das … das wart ihr gar nicht, oder?“
- Belohnung: Die Kugel des Anstoßes; Anlage Stufe 1, Tresen Stufe 2.
- Wendung: Der Held erkennt seine eigene Stimme („NEUES SPIEL!“). Dieter gibt Klaus „die Kugel“ zurück. Eine andere Kugel.

### Kapitel 4 · Der Bus nach nirgendwo
- Bus im Feld am Ortsausgang, Tank leer, Fahrer weg, zwölf Junggesellen seit Samstag wach. Sechs einsammeln, vier Shirts als Beweise, Trauzeuge Timo vom Busdach holen.
- Timo: „DER JGA IST ERST VORBEI, WENN BASTIAN HEIRATET!“ Phase 2: „DU BIST DER NACHTBUS-TYP!“ Phase 3: „Du hast die Kiste getragen. Du hast sie ihm GEGEBEN. Und ich hab gefilmt.“
- Belohnung: Die Schärpe der Wahrheit (Rückseite mit Edding: „UND DU?“); Basisbau überall Stufe 2, Landhaus-Ecke, Pfandlager.
- **Aktschluss:** Timos Video. Der Held in Unterhose, Kiste im Arm, gibt sie einem Mann mit Pappkrone. Freiwillig. Lachend. Die Unbekannten waren zwölf Junggesellen, ein sturzbetrunkener Clan – und er. Ida: „Wer mit uns kaputt macht, baut mit uns auf. Du bist jetzt Poo-Tang. Nicht, weil wir dich mögen. Weil du uns was schuldest. Und am Samstag holen wir die Kiste.“

## 5. Erinnerungsfetzen (memories.js)

Neun Fetzen in Erzählreihenfolge, jeder an ein Ereignis gebunden. Die Engine zeigt jeden genau einmal (Speicher `memories.seen[]`), das Clanbuch listet die gesehenen mit `clue`.

| # | Titel | Auslöser | Was der Held erfährt |
|---|---|---|---|
| 0 | Der Stempel | Hofprobe bestanden | Er war als Gast auf dem Fest |
| 1 | Halt mal mein Bier | erstes Kaltgetränk | Kasten, Feuerzeug, eigene Stimme |
| 2 | 22:01 | Kapitel 1 abgeholt | Er hat Horsts zweiten Anruf an der Bude angenommen („Pizzeria“) |
| 3 | Statik | Tresen Stufe 1 | Bierkastenturm auf Kevins Autodach |
| 4 | Größe S | Kapitel 2 abgeholt | Er hat Bastians Shirt bekommen, weil Bastian gekotzt hat |
| 5 | Neues Spiel! | Klaus besiegt | Der Bus war zuerst in Kalt; die Kegelbahn war die Generalprobe |
| 6 | Wurst Case | erster Tod | Der Tresen ist auf ihn gefallen, Dieter hat ihn halb gefangen |
| 7 | Der falsche Bus | Kapitel 3 abgeholt | Koblenz Hbf, 19:40, „Fährt der nach Hause?“ – wo Zuhause ist, weiß er nicht (Akt 2) |
| 8 | Die Kiste | Kapitel 4 abgeholt | Er hat Bastian die Kiste gegeben und es ernst gemeint. Was er gesagt hat, weiß nur Bastian |

## 6. Basisbau (buildings.js)

Sechs Gebäude an der Bude, je ein Pate, zwei bis drei Stufen, Kosten in Material aus dem Umland, ein Vorteil je Stufe. Freischaltung über abgeholte Kapitelbelohnungen. Der Spieler bringt Material, der Clan baut, alle profitieren.

| Gebäude | Pate | ab Kapitel | Stufen | Vorteil (Stufe 1 → letzte) |
|---|---|---|---|---|
| Der Tresen | Dieter | 2 | 3 | Regeneration +25 % → +75 %, Erwachen mit 50 % Leben, Stärkung 10 % länger |
| Oskars Grill | Oskar | 2 | 3 | Verpflegung +15 % → +45 %, 5 s schneller bereit |
| Kevins Werkstatt | Kevin | 2 | 3 | Ausrüstungschance +3 → +10 Punkte, Pfandmarken +20, 5 Randale je Kill |
| Leanders Anlage | Leander | 3 | 3 | Stärkung 10 % → 30 % länger, Ausweichen 10 % schneller |
| Annis Landhaus-Ecke | Anni | 4 | 2 | Schaden −3 % → −6 %, Regeneration +25 % |
| Idas Pfandlager | Ida | 4 | 2 | Erfahrung +5 % → +10 %, Pfandmarken +20 |

Material: Palettenholz (neu, Sperrmüllplatz/Sigi), Kronkorken, Dosenblech, Kabel, Borste, Feder, Dachsfell, GAME-OVER-Shirts (neu, Junggesellen). Gesamtkosten Akt 1 sind absichtlich höher als der Kapitelfluss liefert: Der Spieler soll zwischen den Kapiteln ins Umland.

## 7. Neue Gegner und Dorflegenden

| ID | Name | Art | Kapitel | Antwortmuster | Legende |
|---|---|---|---|---|---|
| kegler | Kegelbruder aus Kalt | Feld (menschlich, Stufe 3) | 3 | Rempler · Parade, Alle Neune · ausweichen, Runde für alle · Q | Die Kugel vom Dorfpokal 2011 |
| jga | Junggeselle im Game-Over-Shirt | Feld (menschlich, Stufe 4) | 4 | Bierbong-Sprint · ausweichen, Trinkspruch · Q, Kotzpyramide · Fläche | Bierbong des Junggesellen |
| sigi | Sperrmüll-Sigi | Boss Stufe 5 | 2 | Greifzange, Hänger rückwärts, FINDERRECHT!, Schrottpresse | Sigis Greifzange |
| klaus | Kegelkönig Klaus | Boss Stufe 6 | 3 | Pudel mit Anlauf, Volle Kugel, Kegelkönig-Pose, Abräumer | Die Kegelkönig-Kette |
| timo | Trauzeuge Timo | Boss Stufe 7 | 4 | Schärpen-Schwinger, Busdach-Sprung, Trinkspruch auf Bastian, Kotzpyramide XXL | Die Schärpe der Wahrheit |

Balance (content/BALANCE-REPORT.md): Bosse 8–18 s auf ihrer Stufe mit Ausrüstung, kein ☠; Sigi zwei Stufen darunter für die Heilerin zäh (40 s), gewollt.

## 8. Nebenquests Akt 1 (quests.js)

Bierdeckel-Statik (Dieter, Paletten), Strom aus Quellen, die wir nicht nennen (Kevin, Kabelspiel), Vorher-Nachher (Anni, Sektgläser), Amtshilfe ohne Formular (Pit, Junggesellen), Finderrecht für Keiler (Ida, Keiler am Sperrmüllplatz). Rotieren mit den bestehenden Vorlagen je Welt-Seed.

## 9. Was Akt 2 NICHT vorwegnimmt

Bastian, die Hochzeit in Koblenz, die Frage, wo der Held vor dem Bus war – alles nur als Haken in Idas Schlussdialog und Fetzen 7/8. Gisela und der Pfandautomat bleiben als Altbestand-Kapitel 5/6 in den Daten (Boss-Speicherschlüssel), sind aber mit `reserve:true` markiert und nicht Teil von Akt 1.

## 10. Offene Entscheidungen (Nutzer)

1. **Held = Fremder mit geliehenen Klamotten** (so gebaut) oder Held = eins der drei Clanmitglieder ohne Gedächtnis? Die Fremden-Variante passt zu „unbekanntes Dorf“ und macht die Aufnahme am Aktschluss zur Pointe; sie braucht aber Mentor-NPCs an der Bude (Engine).
2. **Aktschluss-Härte:** Der Held hat die Kiste hergegeben, der Clan war mitschuldig. Falls das zu viel Schuld auf Clan-Seite ist: Dieters „eh morsch“ und Kevins Hänger-Nummer lassen sich streichen, ohne dass der Rest kippt.
3. **Basisbau-Kosten:** bewusst Material-hungrig (Umland-Anreiz). Wenn die ersten Spieltests zeigen, dass niemand Stufe 3 erreicht, Kosten halbieren; die Effekte bleiben.

## 11. Was jetzt läuft und was fehlt

- **Läuft:** Kapitel 1 komplett mit neuen Texten (Ida-Dialoge, Tutorial, Bosssprüche), neue Gegner/Bosse/Items im Schema, Balance-Bericht, Grafik-Briefing.
- **Braucht Engine** (content/BACKLOG.md): Kapitelumschalter 2–4 mit Lagern (Sperrmüllplatz, Festplatz/Kegelbahn, Bus im Feld), Erinnerungsfetzen-Ereignisse, Basisbau-Zustand und -Effekte, Mentoren als NPCs an der Bude.
- **Braucht UI** (docs/UEBERGABE-UI-2026-09-17.md): Hardcodes „Die letzte Kiste“ raus, Kapitel/Fetzen/Basisbau im Clanbuch, Erinnerungs-Einblendung, Mentoren-Sprechzeilen.
