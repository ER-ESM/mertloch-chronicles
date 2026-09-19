# Vorbereitung für den Gang als Online-MMORPG · Bewertung 2026-09-19

Frage: Was brauchen wir und was müssten wir vorbereiten, damit Mertloch Chronicles online mit anderen Spielern läuft?
Dieses Papier nennt zuerst den Ist-Stand aus dem Repo, dann die Stufen von „Konto" bis „MMO", je Stufe die Bausteine,
Umbauten und Risiken, und am Ende eine Empfehlung mit Reihenfolge. Nichts davon ist entschieden; die Entscheidung E-01
(„kein Server, kein Konto, kein Mehrspieler") müsste dafür ausdrücklich revidiert werden.

## 1 · Ist-Stand (Repo, Build #140)

| Punkt | Stand | Bedeutung für online |
|---|---|---|
| Auslieferung | statisch über GitHub Pages, Service Worker als Offline-Cache | Für jede Online-Stufe braucht es einen laufenden Dienst; Pages bleibt nur für den Client |
| Spielstand | `localStorage`, Format Version 1, ein Spielstand je Browser | Muss auf den Server (Konto), Format ist versioniert – gute Basis |
| Spielschleife | `Game.tick(dt)` mit höchstens 50 ms je Schritt, Client rechnet alles | Spiellogik läuft ohne Browser-Objekte: `engine.js`, `world.js`, `encounters.js`, `rpg.js`, `class-mechanics.js`, `spec-mechanics.js`, `procs.js`, `auto-combat.js`, `combat-meter.js` enthalten weder `document`, `window` noch `localStorage` → dieselbe Engine kann auf einem Node-Server laufen |
| Zufall | fester Zufallsgenerator (`rng(9876)`), keine `Math.random`-Aufrufe in der Spiellogik | Server-Autorität und Wiederholbarkeit sind möglich; der Client dürfte den Zufall nie mehr selbst ziehen |
| Spielerobjekt | `this.player` ist ein einzelner Held, 34 direkte Zugriffe allein in `engine.js`; Gegner-KI, Aggro, Kampftext, Meter und Mechaniken kennen genau einen Spieler | **Größter Umbau:** aus „der Spieler" wird „ein Spieler von vielen" |
| Welt | aus OSM-Daten (`data/mertloch.json`) mit Seed erzeugt, Dorfleben (`VillageLife`), Gegnerlager mit Respawn je Client | Weltzustand (Respawns, Lager, NPC-Wege) muss einmal zentral laufen |
| Inhalte | Registry mit Schema- und Invariantenprüfung, stabile IDs, Beschreibungsstandard | Unverändert nutzbar; Server und Client teilen `content/` |
| Klassen | drei Klassen mit Tank/Heilung/Schaden-Spezialisierungen (E-32), Robbi als Aggro-Fänger, Heilung nur auf sich selbst | Gruppenrollen sind angelegt, Fremdheilung und Bedrohungsliste fehlen |
| Admin | Trainingsarena, Stufe setzen, Testausrüstung, Debug-Griff `globalThis.__mertloch` im Client | Muss serverseitig gesperrt werden – heute kann jeder Client alles |
| Assets | 85 MB Laufzeit (plus 455 MB Quell-/Prüfbilder im Repo), Produktionsbuild 371 MB | Laufzeit-Assets hinter ein CDN, Quellen aus dem Auslieferungspfad |
| Abhängigkeiten | keine npm-Abhängigkeiten, eigener Dev-Server `server.mjs` | Für Netz, Konten und Datenbank kommen erstmals Abhängigkeiten dazu |

## 2 · Was „online" heißen kann – fünf Stufen

| Stufe | Erlebnis | Umbau am Spiel | Neuer Betrieb |
|---|---|---|---|
| **A · Konto und Cloud-Spielstand** | Anmelden, Spielstand auf jedem Gerät, Bestenlisten (Arena-DPS, Akt-Zeiten), Freundesliste | klein: Spielstand-API, Login-Dialog, Export/Import bleibt | Auth-Dienst, Datenbank, Backups, Datenschutz |
| **B · Gemeinsame Welt zum Anschauen** | Andere Spieler laufen sichtbar durchs Dorf, Chat, Emotes, keine Kampfinteraktion | mittel: Positions-Sync (10–20 Hz), Chat, Namen, Fremdfiguren rendern | Websocket-Server, Moderation, Namensregeln |
| **C · Koop in Instanzen** | 2–5 Spieler in einer gemeinsamen Kampfinstanz (Lager, Akt-Kapitel, Boss), Fremdheilung, Bedrohung, Beuteteilung | groß: Server-Autorität für Kampf, Zufall, Beute; Multi-Spieler-Engine; Client-Vorhersage für Bewegung | Spielserver mit Instanzen, Matchmaking/Einladung, Versionskopplung Client/Server |
| **D · Offene Welt gemeinsam** | Alle in derselben Dorfwelt, Gegner werden geteilt (Tagging), Handel, Gilden/Stammtische, Wirtschaft | sehr groß: zentraler Weltzustand, Interessenbereiche, Anti-Cheat, Wirtschaftsbalancing | mehrere Server/Zonen, Datenbankskalierung, Support |
| **E · MMO-Maßstab** | tausende gleichzeitig, Shards, Auktionshaus, Live-Events | Studio-Größe | eigenes Betriebsteam, Kosten fünfstellig je Monat |

Unser Spiel ist heute ein Solo-Rollenspiel mit MMO-Bedienung (Tab-Ziel, Rotation, Talente). Die Stufen A–C sind mit dem
vorhandenen Code erreichbar; D und E sind ein anderes Produkt.

## 3 · Bausteine, die für A–C fehlen

**Konto und Daten (A)**
- Anmeldung: E-Mail-Link oder Passkey, keine Passwörter im Eigenbau; Konto löschen und Daten exportieren als Pflicht (DSGVO).
- Spielstand-Dienst: `save()`-JSON je Konto und Figur, Versionsfeld bleibt; Konfliktregel bei zwei Geräten (jüngster Stand gewinnt, alter Stand als Sicherung).
- Datenbank: Postgres oder SQLite hinter einem kleinen Node-Dienst; Sicherung täglich.
- Client: Login-Karte im Clanbuch, Offline-Modus bleibt (Spielstand lokal puffern, später hochladen).

**Netz und Sichtbarkeit (B)**
- Websocket-Dienst mit Räumen je Weltbereich; der Client sendet Position, Richtung, Zustand (Laufen, Kampfpose) 10–20-mal je Sekunde, empfängt die anderen.
- Fremdfiguren: Renderer zeichnet heute nur `game.player`; nötig ist ein Aktor-Typ „anderer Spieler" mit Klasse, Ausrüstung (die Präzisions-/Prerender-Bögen sind da) und Namensschild.
- Chat mit Filter, Meldefunktion, Sperren; Namensregeln.

**Kampf gemeinsam (C)**
- Server-Autorität: `Game.tick` läuft auf dem Server je Instanz; der Client schickt nur Eingaben (Kniff, Ziel, Bewegung). Der feste Zufallsgenerator zieht nur noch serverseitig; Client-Zufall wird zu Anzeige-Zufall.
- Multi-Spieler-Engine: `player` → `players[]`, Gegner-KI mit Bedrohungsliste (Aggro auf den, der am meisten stört; Tank-Kniffe erhöhen Bedrohung, Robbi-Taunt ist der Prototyp), Heilung und Schilde auf Verbündete (Ziel-Auswahl für Freunde, Kniffe mit `ally`-Ziel), Kampfmeter für die Gruppe (Grundlage steht: `combat-meter.js`).
- Beute: Server verteilt (Rundlauf oder Bedarf/Gier), Auftragsfortschritt je Spieler.
- Client-Vorhersage: Bewegung lokal sofort, Server korrigiert; Kniffe warten auf die Bestätigung (der kurze GCD verzeiht 100–150 ms).
- Instanzen: Lager, Akt-Kapitel und Bosse als abgeschlossene Räume mit Einladung; das Dorf bleibt Stufe B.
- Versionierung: Protokollnummer, Client- und Server-Build müssen passen; das PWA-Update-Banner ist die Basis.

**Betrieb und Recht (ab A)**
- Hosting: ein kleiner VPS (z. B. 2 vCPU) für A/B, für C je nach Gruppenzahl mehr; Assets über CDN; TLS.
- Überwachung: Fehler, Latenz, Spielerzahl; Protokolle ohne Personenbezug.
- Recht: Impressum, Datenschutzerklärung, AGB/Regeln, Altersfreigabe (Bier- und Kneipenthema: USK-Einstufung prüfen), Chat-Moderation.
- Kosten grob: A ab 10 €/Monat, B 20–50 €/Monat, C 50–200 €/Monat bei bis zu einigen hundert Spielern.

## 4 · Was heute schon hilft

- Engine ohne Browser-Bindung und mit festem Zufall: derselbe Code kann als Server-Simulation laufen, Tests bleiben gültig.
- Inhalte als geprüfte Registry mit stabilen IDs: Server und Client laden dieselben Module, Manipulation am Client ändert nichts am Server-Ergebnis.
- Spielstand ist bereits ein versioniertes JSON (`save()`).
- Rollen sind angelegt: Tank (Türsteher, Schrottkoloss), Heilung (Lazarett, Zapfmeister), Schaden – eine Gruppe aus drei Klassen ergibt heute schon Sinn.
- Mobile Schicht und Touch-Steuerung sind fertig: Handy-Spieler wären von Anfang an dabei.

## 5 · Was gegen uns arbeitet

- Ein-Spieler-Annahme in Engine, Gegner-KI, Kampftext, Meter, Renderer und Mechaniken (Robbi, Fässer, Nest wirken auf `g.player`).
- Der Client ist heute Richter über alles, inklusive Admin-Arena und Debug-Griff; jede Zahl ließe sich fälschen.
- Story Akt 1 (Hofprobe, Ida-Gespräch) ist linear und exklusiv – online braucht sie Instanzen oder eine Solo-Einführung vor dem Betreten der geteilten Welt.
- Clan-Figurwechsel (drei Helden, ein Spieler) wird zu „drei Charaktere je Konto".
- Assets: 85 MB Laufzeit sind für Neuankömmlinge viel; Streaming nach Bereich oder Kompression nötig.
- Kein Team für Betrieb: Moderation, Support und Vorfälle brauchen Menschen und Zeit.

## 6 · Empfehlung und Reihenfolge

1. **Ziel festlegen:** Koop-Rollenspiel mit gemeinsamem Dorf (Stufen A–C), nicht MMO-Maßstab. Das ist mit dem Code erreichbar und passt zum Pitch (ein Dorf, eine Bande).
2. **Stufe A zuerst** (2–3 Wochen): Konto, Cloud-Spielstand, Bestenlisten. Kaum Umbau, sofort spürbarer Nutzen (Handy ↔ Desktop), zwingt uns Betrieb, Recht und Datenschutz zu klären.
3. **Engine-Refactor „mehrere Spieler"** (3–4 Wochen, Engine-Rolle): `players[]`, Bedrohungsliste, Freund-Ziele, Gruppen-Meter; weiterhin lokal spielbar mit einem Spieler. Tests decken es ab, bevor ein Byte über das Netz geht.
4. **Stufe B** (2–3 Wochen): Websocket, Fremdfiguren, Chat. Das Dorf füllt sich, ohne dass Kampf synchron sein muss.
5. **Stufe C** (6–10 Wochen): Server-Simulation der Instanzen, Client-Vorhersage, Beuteregeln, Einladungen; Playtests mit 2–5 Personen.
6. Erst danach über Handel, Gilden und geteilte offene Welt (D) reden.

Grobe Gesamtsumme bis C: rund 4–5 Monate bei einer Person Vollzeit plus Betriebskosten; als Nebenprojekt entsprechend länger.

## 7 · Entscheidungen, die vorher fallen müssen

| Frage | Optionen | Empfehlung |
|---|---|---|
| E-01 revidieren (Server, Konto)? | nein; nur Konto (A); bis Koop (C) | bis Koop, als E-33 festhalten |
| Betreiber und Kosten | privat; Verein/Firma | klären vor Stufe A (Impressum, Verträge) |
| Anmeldung | E-Mail-Link; Passkey; Drittanbieter (Google/Apple) | E-Mail-Link + Passkey, keine Drittanbieter-Pflicht |
| Altersfreigabe und Chat | ohne Chat starten; Chat mit Filter | Stufe B ohne freien Chat, nur Emotes und feste Sprüche |
| Assets | im Repo wie heute; CDN | Laufzeit-Assets auf CDN, Quellen aus dem Repo-Pfad |
