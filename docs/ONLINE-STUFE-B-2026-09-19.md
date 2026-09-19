# Online Stufe B · eigener Spielserver (2026-09-19)

Ersetzt die PHP-Fassung aus Stufe A (`docs/ONLINE-STUFE-A-2026-09-19.md`, Strato-Webspace). Das Spiel läuft auf dem
eigenen Windows-Server unter `https://mertloch.esm-consultant.de` (Zertifikat auf 443; Fortsetzung: `docs/ONLINE-STUFE-C-2026-09-20.md`).

## Aufbau

| Teil | Ort | Aufgabe |
|---|---|---|
| Caddy | Dienst `MertlochCaddy` | TLS, liefert `_site` aus, leitet `/api/*` und `/ws` an 127.0.0.1:8080 |
| Spielserver | `server/game/server.mjs`, Dienst `MertlochGame` | Konto, Spielstand, Bestenlisten (HTTP), Anwesenheit und Chat (WebSocket) |
| Speicher | `server/game/store.mjs` → `DATA_DIR` | `accounts.json`, `sessions.json`, `boards.json`, `saves/<konto>-<welt>.json` (mit Vorgänger) |
| WebSocket | `server/game/ws.mjs` | RFC 6455 ohne Fremdpakete, 16 KB je Nachricht |
| Client | `online.js` | Konto-Karte, Abgleich, WebSocket, Chat |

Konfiguration über Umgebungsvariablen oder `C:\Mertloch\mertloch.env`: `PORT`, `HOST`, `DATA_DIR`, `PUBLIC_ORIGIN`,
optional `STATIC_DIR` (liefert das Spiel selbst aus – nur für Entwicklung: `PORT=4195 STATIC_DIR=. node server/game/server.mjs`,
dann `http://127.0.0.1:4195/?online=1`; Port 4190 meiden, den sperrt `fetch`).

## Schnittstellen

- `GET /api/health` → `{ok, version, uptime, online, accounts, sessions}`
- `/api/auth` (register, login, logout, me, rename, password, delete), `/api/save`, `/api/leaderboard` – Vertrag wie Stufe A;
  alte `.php`-Pfade werden weiter angenommen. Sitzung als HttpOnly-Cookie (90 Tage), auf der Platte nur der Token-Hash,
  Passwörter mit scrypt. Schreibende Anfragen nur von der eigenen Herkunft (Hostname zählt, Port nicht).
- `WS /ws` (nur mit Sitzung): Client sendet `{t:'pos',w,x,y,f,c,l,sp,s}` bis 10×/s bei Änderung und `{t:'chat',ch:'say'|'world',text}`;
  Server sendet `welcome` (mit Welt-Verlauf), `snap` (Nachbarn im Umkreis 1400, höchstens 40, nur bei Änderung), `chat`, `notice`.
  Chat-Drossel: 5 Nachrichten je 10 s, mindestens 0,7 s Abstand. Ein Konto hat eine Verbindung; die neuere verdrängt die ältere (Code 4001).

## Grenzen dieser Stufe

Der Kampf läuft weiter im Browser jedes Spielers; andere Spieler sind sichtbar, aber Gegner, Beute und Fortschritt sind nicht geteilt.
Werte der Bestenliste kommen vom Client. Nächste Stufe: Gegner und Kampf auf dem Server (Engine läuft ohne Browser),
Bedrohungsliste je Gegner, Gruppen.

Tests: `tests/game-server.test.mjs` (echt über HTTP und WebSocket), `tests/online.test.mjs`.
