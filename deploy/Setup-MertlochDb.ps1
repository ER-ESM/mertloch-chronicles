<#
.SYNOPSIS
    Richtet die Mertloch-Datenbank ein: legt /home/www/mertloch-config.php an (außerhalb des Docroot, chmod 600)
    und spielt server/schema.sql über SSH ein (die Datenbank ist nur vom Webspace aus erreichbar).

.DESCRIPTION
    Die vier Datenbankwerte stehen im Strato-Kundenmenü der für mertloch.esm-consultant.de angelegten Datenbank.
    Sie werden als Benutzer-Umgebungsvariablen MERTLOCH_DB_* gespeichert (nie im Repo). Das Passwort wird
    ohne Echo abgefragt, wenn es nicht übergeben wird.

.EXAMPLE
    .\deploy\Setup-MertlochDb.ps1 -DbHost database-50xxxxxxxx.webspace-host.com -DbName dbs1234567 -DbUser dbo1234567
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory)][string]$DbHost,
  [Parameter(Mandatory)][string]$DbName,
  [Parameter(Mandatory)][string]$DbUser,
  [securestring]$DbPass,
  [int]$DbPort = 3306
)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'Import-StratoEnv.ps1')
if(-not $DbPass){ $DbPass = Read-Host -AsSecureString 'Datenbank-Passwort' }
$plain=[Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DbPass))
foreach($kv in @{MERTLOCH_DB_HOST=$DbHost;MERTLOCH_DB_NAME=$DbName;MERTLOCH_DB_USER=$DbUser;MERTLOCH_DB_PASS=$plain;MERTLOCH_DB_PORT="$DbPort"}.GetEnumerator()){ [Environment]::SetEnvironmentVariable($kv.Key,$kv.Value,'User') }

$esc={ param($s) $s.Replace('\','\\').Replace("'","\'") }
$config="<?php`nreturn [`n    'db_host' => '$(& $esc $DbHost)',`n    'db_port' => $DbPort,`n    'db_name' => '$(& $esc $DbName)',`n    'db_user' => '$(& $esc $DbUser)',`n    'db_pass' => '$(& $esc $plain)',`n];`n"
$tmpDir=Join-Path ([IO.Path]::GetTempPath()) ('mertloch-cfg-'+[guid]::NewGuid().ToString('N')); New-Item -ItemType Directory -Path $tmpDir | Out-Null
$cfgFile=Join-Path $tmpDir 'mertloch-config.php'; $sqlFile=Join-Path $tmpDir 'mertloch-schema.sql'
[IO.File]::WriteAllText($cfgFile,$config,[Text.UTF8Encoding]::new($false))
Copy-Item (Join-Path (Split-Path $PSScriptRoot -Parent) 'server\schema.sql') $sqlFile

Import-Module Posh-SSH
$sec=ConvertTo-SecureString $env:STRATO_SSH_PASS -AsPlainText -Force
$cred=New-Object System.Management.Automation.PSCredential($env:STRATO_SSH_USER,$sec)
$port=if($env:STRATO_SSH_PORT){[int]$env:STRATO_SSH_PORT}else{22}
$sftp=New-SFTPSession -ComputerName $env:STRATO_SSH_HOST -Port $port -Credential $cred -AcceptKey
try{ Set-SFTPItem -SessionId $sftp.SessionId -Path $cfgFile -Destination '/' -Force; Set-SFTPItem -SessionId $sftp.SessionId -Path $sqlFile -Destination '/' -Force } finally { Remove-SFTPSession -SessionId $sftp.SessionId | Out-Null; Remove-Item -LiteralPath $tmpDir -Recurse -Force }
$ssh=New-SSHSession -ComputerName $env:STRATO_SSH_HOST -Port $port -Credential $cred -AcceptKey
try{
  $pw=$plain.Replace("'","'\''")
  $cmd="chmod 600 ~/mertloch-config.php && MYSQL_PWD='$pw' mysql --default-character-set=utf8mb4 -h '$DbHost' -P $DbPort -u '$DbUser' '$DbName' < ~/mertloch-schema.sql && rm -f ~/mertloch-schema.sql && MYSQL_PWD='$pw' mysql -N -h '$DbHost' -P $DbPort -u '$DbUser' '$DbName' -e 'SHOW TABLES'"
  $r=Invoke-SSHCommand -SessionId $ssh.SessionId -Command $cmd -TimeOut 120
  if($r.ExitStatus -ne 0){ throw "Schema-Import fehlgeschlagen: $($r.Error) $($r.Output -join ' ')" }
  Write-Host ("Tabellen: " + ($r.Output -join ', ')) -ForegroundColor Green
} finally { Remove-SSHSession -SessionId $ssh.SessionId | Out-Null }
$base=if($env:MERTLOCH_BASE_URL){$env:MERTLOCH_BASE_URL}else{'https://mertloch.esm-consultant.de'}
try{ $h=Invoke-WebRequest -Uri "$base/api/health.php?t=$([DateTime]::Now.Ticks)" -UseBasicParsing -TimeoutSec 30; Write-Host ("health: " + $h.Content) -ForegroundColor Green } catch { Write-Host "health-Check: $($_.Exception.Message)" -ForegroundColor Yellow }
