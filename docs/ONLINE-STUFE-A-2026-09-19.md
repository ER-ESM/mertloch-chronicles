# Online · Stufe A und B light · 2026-09-19
n> **Abgelöst am 2026-09-19 durch Stufe B** (`docs/ONLINE-STUFE-B-2026-09-19.md`): eigener Server statt Strato-Webspace, die PHP-Dateien sind entfernt.

Umsetzung der ersten Online-Stufen aus [ONLINE-MMORPG-VORBEREITUNG-2026-09-19.md](ONLINE-MMORPG-VORBEREITUNG-2026-09-19.md)
auf dem vorhandenen Strato-Webspace (Subdomain **mertloch.esm-consultant.de**, Docroot `/home/www/Mertloch`, eigene
MariaDB). Entscheidung: [E-33](ENTSCHEIDUNGEN.md).

## Was es kann

| Baustein | Client | Server |
|---|---|---|
| Konto | Karte „Online-Konto" unter Hilfe → Einstellungen: anlegen, anmelden, abmelden, löschen | `api/auth.php`, Tabellen `account`, `session`, `login_attempt` (Bremse 8 Fehlversuche/15 min) |
| Cloud-Spielstand | jeder lokale Speichervorgang wird gebündelt (4 s) hochgeladen; beim Start Abgleich: neuerer Stand gewinnt, älterer bleibt Sicherung; „Jetzt abgleichen" | `api/save.php`, Tabelle `character_save` je Konto und Welt-Schlüssel, `previous_json` als Sicherung, 512 KB Grenze |
| Bestenlisten | Stufe je Konto (automatisch), Arena-DPS beim Räumen der Arena; Anzeige über die Karte | `api/leaderboard.php`, Tabelle `leaderboard_entry` (bester Wert je Konto) |
| Andere Spieler sehen | alle 2 s Position senden, Antwort = Spieler im Umkreis (900 Einheiten, 12 s frisch); Renderer zeichnet sie mit Klasse, Name und Stufe | `api/presence.php`, Tabelle `presence` |
| Gesundheit | – | `api/health.php`: PHP, Konfiguration, Datenbank, Tabellen |

Auf GitHub Pages bleibt das Spiel wie bisher (Solo, Browserspeicher): die Online-Schicht schaltet sich nur ein, wenn
die Seite von `*.esm-consultant.de` kommt (lokal zum Testen: `?online=1`).

## Sicherheit und Grenzen

- Nur gleiche Herkunft (`Sec-Fetch-Site`/`Origin` geprüft), Sitzung als HttpOnly-/Secure-/SameSite-Strict-Cookie, bcrypt,
  vorbereitete SQL-Abfragen, keine Geheimnisse im Repo (Konfiguration außerhalb des Docroot).
- Der Client ist weiterhin Richter über Spielstand und Bestenlistenwerte (Stufe A ohne Server-Autorität): Bestenlisten
  sind Ehrensache, keine Belohnungen daran knüpfen. Server-Autorität kommt erst mit Stufe C (Koop-Instanzen).
- Keine E-Mail-Bestätigung und keine Passwort-Zurücksetzung in dieser Stufe (Mailversand über den Webspace ist der
  nächste Schritt). Konto löschen ist sofort und vollständig (DSGVO).
- Sichtbarkeit anderer Spieler ist reine Anzeige: keine Kollision, kein Kampf, kein Chat.

## Einrichten und Deployen

**Voraussetzungen im Strato-Kundenmenü:** Subdomain zeigt auf den Ordner `/Mertloch` (bis zur Umstellung liefert Strato die Seite „Domain reserved“), und für die Subdomain ist ein SSL-Zertifikat aktiviert. Ohne HTTPS funktionieren weder das Sitzungs-Cookie (Secure) noch der Service Worker.

**Kurzweg:** `deploy/Setup-MertlochDb.ps1 -DbHost … -DbName … -DbUser …` fragt das Passwort ab, legt die Konfiguration an, spielt das Schema ein und prüft `api/health.php`.

1. **Datenbank:** `server/schema.sql` einmal einspielen (vom Webspace aus, die DB ist von außen nicht erreichbar):
   ```sh
   mysql --default-character-set=utf8mb4 -h <db_host> -u <db_user> -p <db_name> < schema.sql
   ```
2. **Konfiguration:** `/home/www/mertloch-config.php` nach Vorlage `server/mertloch-config.example.php` anlegen (chmod 600).
3. **Deploy:** `deploy/Deploy-Mertloch.ps1` (baut `_site`, lädt `_site` + `server/api` + `.htaccess` per SFTP nach
   `/Mertloch`, prüft `api/health.php`). Zugangsdaten: `STRATO_*`-Umgebungsvariablen der Homepage.
4. **Prüfen:** `https://mertloch.esm-consultant.de/api/health.php` → `db:true`, sechs Tabellen.

## Dateien

`online.js` (Client), `server/api/*.php`, `server/schema.sql`, `server/htaccess`, `server/mertloch-config.example.php`,
`deploy/Deploy-Mertloch.ps1`, `deploy/Import-StratoEnv.ps1`, Tests `tests/online.test.mjs`. Renderer: Typ `other` in der
Zeichenreihenfolge; `game.others` wird von der Online-Schicht gefüllt.

## Nächste Stufen

- Mailversand (Bestätigung, Passwort vergessen) über den Webspace.
- Stufe B voll: Emotes und feste Sprüche zwischen sichtbaren Spielern; Freundesliste.
- Stufe C braucht einen dauerhaft laufenden Spielserver mit Websocket – das kann der Shared-Webspace nicht; dafür ein
  kleiner VPS oder ein Anbieter mit Node-Laufzeit, die API auf dem Webspace bleibt für Konto und Spielstand.
