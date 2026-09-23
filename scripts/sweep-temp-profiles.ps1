# Löscht liegengebliebene Chrome-Profile der Prüfskripte (älter als -Hours), auch aus älteren Worktrees, die noch nach
# %TEMP% auf C: schreiben. 2026-09-23 war C: zweimal an einem Tag voll (90 GB bzw. 43 GB in %TEMP%\mertloch-*).
#   powershell -File scripts/sweep-temp-profiles.ps1            einmal aufräumen, Ausgabe: gelöschte MB
#   powershell -File scripts/sweep-temp-profiles.ps1 -Register  als stündliche Aufgabe "Mertloch Chrome-Profile aufraeumen" (SYSTEM) eintragen
param([switch]$Register, [int]$Hours = 2)

$patterns = 'mertloch-*', 'combat-integration-*', 'basis-1*', 'welle-d-1*', 'playwright_chromiumdev_profile-*', 'scoped_dir*'
# %TEMP% ist je RDP-Sitzung ein Unterordner (Temp\2); als SYSTEM gibt es kein %TEMP% des Nutzers, daher feste Wurzeln.
$userTemp = Join-Path $env:LOCALAPPDATA 'Temp'
$roots = @($userTemp) + @(Get-ChildItem $userTemp -Directory -ErrorAction SilentlyContinue | Where-Object Name -match '^\d+$' | ForEach-Object FullName) + 'D:\Temp\mertloch-profiles'

if ($Register) {
  # Pfade beim Eintragen festschreiben und das Skript eingebettet ablegen: die Aufgabe hängt an keinem Worktree.
  $body = "`$roots=@('" + ($roots -join "','") + "');`$patterns=@('" + ($patterns -join "','") + "');`$Hours=$Hours`n" +
    ((Get-Content $PSCommandPath -Raw) -split '# --- Sweep ---')[1]
  $enc = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($body))
  $action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -NonInteractive -ExecutionPolicy Bypass -EncodedCommand $enc"
  $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).Date -RepetitionInterval (New-TimeSpan -Hours 1)
  $settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 30) -StartWhenAvailable -MultipleInstances IgnoreNew
  Register-ScheduledTask -TaskName 'Mertloch Chrome-Profile aufraeumen' -Action $action -Trigger $trigger -Settings $settings -User 'SYSTEM' -RunLevel Highest -Force | Out-Null
  "Aufgabe eingetragen: stündlich, Wurzeln: $($roots -join ', ')"
  return
}
# --- Sweep ---
$limit = (Get-Date).AddHours(-$Hours); $freed = 0
foreach ($root in $roots) {
  if (-not (Test-Path $root)) { continue }
  $dirs = Get-ChildItem $root -Directory -Force -ErrorAction SilentlyContinue | Where-Object { $n = $_.Name; $_.LastWriteTime -lt $limit -and ($patterns | Where-Object { $n -like $_ }) }
  foreach ($dir in $dirs) {
    $size = (Get-ChildItem $dir.FullName -Recurse -Force -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
    # Ein noch laufender Chrome hält Dateien gesperrt: dann bleibt der Ordner einfach bis zum nächsten Lauf stehen.
    try { Remove-Item $dir.FullName -Recurse -Force -ErrorAction Stop; $freed += $size } catch {}
  }
}
"{0:N0} MB freigegeben" -f ($freed / 1MB)
