# Server-Refresh auf Zuruf · 2026-09-23

Der Online-Server (`https://mertloch.esm-consultant.de`) aktualisiert sich über die geplante Aufgabe **MertlochUpdate** alle 10 Minuten: `origin/main` ziehen, `_site` bauen, Dienst `MertlochGame` neu starten. Seit heute lässt sich genau diese Aufgabe sofort anstoßen.

## Endpunkte (server/game/deploy.mjs)

| Endpunkt | Zweck |
|---|---|
| `GET /api/version` | Build, der live ausgeliefert wird (`_site/build-info.js`: Nummer, Commit, Datum), Anzahl und Zeit der letzten Refreshs |
| `POST /api/deploy` | startet die Aufgabe **MertlochUpdate** sofort (`schtasks /Run /TN MertlochUpdate`); Header `Authorization: Bearer <Token>`; höchstens einmal pro Minute |

Ohne Token in der Server-Konfiguration antwortet `/api/deploy` mit 404 – der Endpunkt ist dann nicht vorhanden.

## Einmalig auf dem Server (Server-Sitzung)

1. Token erzeugen (mind. 32 Zeichen), z. B. in PowerShell:
   `-join ((48..57)+(97..122) | Get-Random -Count 48 | % {[char]$_})`
2. In `C:\Mertloch\mertloch.env` eintragen:
   ```
   MERTLOCH_DEPLOY_TOKEN=<Token>
   MERTLOCH_UPDATE_TASK=MertlochUpdate
   ```
3. Das Konto des Dienstes `MertlochGame` muss die Aufgabe starten dürfen. Läuft der Dienst als `LocalSystem`, geht das ohne Weiteres. Sonst der Aufgabe **MertlochUpdate** in der Aufgabenplanung für dieses Konto „Lesen und Ausführen“ geben – oder `MERTLOCH_UPDATE_COMMAND` auf das Update-Skript setzen, das die Aufgabe ausführt.
4. Dienst `MertlochGame` einmal neu starten (liest die env-Datei beim Start).
5. Prüfen: `curl https://mertloch.esm-consultant.de/api/version`

Caddy muss nichts wissen: Alles unter `/api/` geht bereits an den Spielserver.

## Benutzen (Entwicklungsrechner)

Token einmal in `%USERPROFILE%\.mertloch-deploy-token` ablegen (eine Zeile, nie ins Repo), dann:

```
node scripts/server-refresh.mjs            # anstoßen und warten, bis der Build von origin/main live ist
node scripts/server-refresh.mjs --status   # nur anzeigen, was live ist
```

Nach einem Push auf `main` gehört der Aufruf zum Ausliefern dazu; das Warten auf den 10-Minuten-Takt entfällt.

## Sicherheit

- Token-Vergleich mit konstanter Laufzeit, kein Token = kein Endpunkt, Sperrzeit 60 s gegen Dauerfeuer.
- Der Endpunkt nimmt keine Parameter: Er kann nur den festen Stand `origin/main` ausrollen, keinen beliebigen Code.
