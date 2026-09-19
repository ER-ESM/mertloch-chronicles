# Lädt die persistierten STRATO_*-Umgebungsvariablen (User-/Machine-Ebene) in die laufende Session.
# Gesetzt werden sie über homepage/deploy/Set-StratoEnv.ps1 (Repo eresm-github-migration). Nutzung: . .\Import-StratoEnv.ps1
foreach ($n in 'STRATO_SSH_HOST','STRATO_SSH_PORT','STRATO_SSH_USER','STRATO_SSH_PASS','STRATO_SSH_KEYFILE','STRATO_REMOTE_ROOT','STRATO_MERTLOCH_ROOT','MERTLOCH_BASE_URL') {
    $v = [Environment]::GetEnvironmentVariable($n, 'User')
    if ($null -eq $v) { $v = [Environment]::GetEnvironmentVariable($n, 'Machine') }
    if ($null -ne $v) { Set-Item -Path ("Env:" + $n) -Value $v }
}
