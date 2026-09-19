<#
.SYNOPSIS
    Baut das Spiel (npm run build) und deployt _site + server/api per SFTP nach mertloch.esm-consultant.de (Strato).

.DESCRIPTION
    Ziel: $env:STRATO_MERTLOCH_ROOT (Standard /Mertloch = Docroot der Subdomain). Differenz-Upload über
    .deploy-manifest.json wie bei der Homepage. Die Server-Konfiguration /home/www/mertloch-config.php wird NICHT
    deployt (liegt außerhalb des Docroot, Vorlage server/mertloch-config.example.php). Nach dem Upload wird
    api/health.php geprüft. Zugangsdaten: STRATO_*-Umgebungsvariablen (homepage/deploy/Set-StratoEnv.ps1).

.PARAMETER DryRun   Nur zeigen, was hochgeladen/gelöscht würde.
.PARAMETER Force    Manifest ignorieren, alles hochladen.
.PARAMETER SkipBuild  npm run build überspringen (z. B. reiner API-Deploy).
.EXAMPLE
    .\deploy\Deploy-Mertloch.ps1 -DryRun
    .\deploy\Deploy-Mertloch.ps1
#>
[CmdletBinding()]
param([switch]$DryRun,[switch]$Force,[switch]$SkipBuild,[switch]$SkipVerify)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'Import-StratoEnv.ps1')
$RepoRoot=Split-Path $PSScriptRoot -Parent
$SiteRoot=Join-Path $RepoRoot '_site'
$ApiRoot=Join-Path $RepoRoot 'server\api'
$RemoteRoot=if($env:STRATO_MERTLOCH_ROOT){$env:STRATO_MERTLOCH_ROOT}else{'/Mertloch'}
$BaseUrl=if($env:MERTLOCH_BASE_URL){$env:MERTLOCH_BASE_URL}else{'https://mertloch.esm-consultant.de'}
$ManifestName='.deploy-manifest.json'
foreach($req in 'STRATO_SSH_HOST','STRATO_SSH_USER','STRATO_SSH_PASS'){ if([string]::IsNullOrEmpty([Environment]::GetEnvironmentVariable($req))){ throw "Umgebungsvariable $req fehlt - zuerst Set-StratoEnv.ps1 (Homepage) ausfuehren." } }
$port=if($env:STRATO_SSH_PORT){[int]$env:STRATO_SSH_PORT}else{22}
if(-not $RemoteRoot.StartsWith('/')){$RemoteRoot='/'+$RemoteRoot}; $RemoteRoot=$RemoteRoot.TrimEnd('/')

if(-not $SkipBuild){ Write-Host 'Baue _site (npm run build) ...' -ForegroundColor Cyan; Push-Location $RepoRoot; try{ & npm run build | Out-Host; if($LASTEXITCODE){ throw "npm run build fehlgeschlagen ($LASTEXITCODE)" } } finally { Pop-Location } }
if(-not (Test-Path $SiteRoot)){ throw "_site fehlt - erst npm run build." }

# Lokale Dateiliste: _site/** → /, server/api/** → /api/, server/htaccess → /.htaccess
$local=@{}; $sources=@{}
foreach($f in Get-ChildItem $SiteRoot -Recurse -File){ $rel=$f.FullName.Substring($SiteRoot.Length+1).Replace('\','/'); $local[$rel]=(Get-FileHash $f.FullName -Algorithm SHA256).Hash; $sources[$rel]=$f.FullName }
foreach($f in Get-ChildItem $ApiRoot -Recurse -File){ $rel='api/'+$f.FullName.Substring($ApiRoot.Length+1).Replace('\','/'); $local[$rel]=(Get-FileHash $f.FullName -Algorithm SHA256).Hash; $sources[$rel]=$f.FullName }
$ht=Join-Path $RepoRoot 'server\htaccess'; if(Test-Path $ht){ $local['.htaccess']=(Get-FileHash $ht -Algorithm SHA256).Hash; $sources['.htaccess']=$ht }
Write-Host ("  {0} Dateien" -f $local.Count)

Import-Module Posh-SSH
$sec=ConvertTo-SecureString $env:STRATO_SSH_PASS -AsPlainText -Force
$cred=New-Object System.Management.Automation.PSCredential($env:STRATO_SSH_USER,$sec)
Write-Host "Verbinde SFTP $($env:STRATO_SSH_USER)@$($env:STRATO_SSH_HOST) -> $RemoteRoot" -ForegroundColor Cyan
$sftp=New-SFTPSession -ComputerName $env:STRATO_SSH_HOST -Port $port -Credential $cred -AcceptKey
try{
  if(-not (Test-SFTPPath -SessionId $sftp.SessionId -Path $RemoteRoot)){ throw "Remote-Root '$RemoteRoot' existiert nicht." }
  $remote=@{}; $manifestPath="$RemoteRoot/$ManifestName"
  if(-not $Force -and (Test-SFTPPath -SessionId $sftp.SessionId -Path $manifestPath)){
    $json=Get-SFTPContent -SessionId $sftp.SessionId -Path $manifestPath; $obj=($json -join "`n") | ConvertFrom-Json
    foreach($p in $obj.PSObject.Properties){ $remote[$p.Name]=$p.Value }
    Write-Host "  Remote-Manifest: $($remote.Count) Dateien bekannt"
  }
  $toUpload=@(); $toDelete=@()
  foreach($rel in ($local.Keys | Sort-Object)){ if($Force -or -not $remote.ContainsKey($rel) -or $remote[$rel] -ne $local[$rel]){ $toUpload+=$rel } }
  foreach($rel in ($remote.Keys | Sort-Object)){ if(-not $local.ContainsKey($rel)){ $toDelete+=$rel } }
  Write-Host ("Upload: {0} | Loeschen: {1}" -f $toUpload.Count,$toDelete.Count) -ForegroundColor Cyan
  if($DryRun){ $toUpload | ForEach-Object { "  + $_" }; $toDelete | ForEach-Object { "  - $_" }; return }
  $madeDirs=@{}
  function Ensure-RemoteDir([string]$dir){ if($madeDirs.ContainsKey($dir) -or $dir -eq $RemoteRoot){ return }; $parent=$dir.Substring(0,$dir.LastIndexOf('/')); if($parent -and $parent -ne $RemoteRoot){ Ensure-RemoteDir $parent }; if(-not (Test-SFTPPath -SessionId $sftp.SessionId -Path $dir)){ New-SFTPItem -SessionId $sftp.SessionId -Path $dir -ItemType Directory | Out-Null }; $madeDirs[$dir]=$true }
  $i=0
  foreach($rel in $toUpload){ $i++; $remoteDir=if($rel.Contains('/')){ "$RemoteRoot/"+$rel.Substring(0,$rel.LastIndexOf('/')) } else { $RemoteRoot }; Ensure-RemoteDir $remoteDir
    if($rel -eq '.htaccess'){ $tmp=Join-Path ([IO.Path]::GetTempPath()) '.htaccess'; Copy-Item $sources[$rel] $tmp -Force; Set-SFTPItem -SessionId $sftp.SessionId -Path $tmp -Destination $remoteDir -Force; Remove-Item $tmp }
    else { Set-SFTPItem -SessionId $sftp.SessionId -Path $sources[$rel] -Destination $remoteDir -Force }
    if($i % 25 -eq 0 -or $i -eq $toUpload.Count){ Write-Host ("  [{0}/{1}] {2}" -f $i,$toUpload.Count,$rel) } }
  foreach($rel in $toDelete){ $p="$RemoteRoot/$rel"; if(Test-SFTPPath -SessionId $sftp.SessionId -Path $p){ Write-Host "  [del] $rel" -ForegroundColor DarkYellow; Remove-SFTPItem -SessionId $sftp.SessionId -Path $p -Force } }
  $newManifest=New-Object System.Collections.Specialized.OrderedDictionary
  foreach($rel in ($local.Keys | Sort-Object)){ $newManifest[$rel]=$local[$rel] }
  $tmpDir=Join-Path ([IO.Path]::GetTempPath()) ('mertloch-deploy-'+[guid]::NewGuid().ToString('N')); New-Item -ItemType Directory -Path $tmpDir | Out-Null
  $tmpFile=Join-Path $tmpDir $ManifestName
  try{ [IO.File]::WriteAllText($tmpFile,($newManifest | ConvertTo-Json -Compress),[Text.UTF8Encoding]::new($false)); Set-SFTPItem -SessionId $sftp.SessionId -Path $tmpFile -Destination $RemoteRoot -Force } finally { if(Test-Path -LiteralPath $tmpFile){ Remove-Item -LiteralPath $tmpFile -Force }; Remove-Item -LiteralPath $tmpDir -Force }
  Write-Host 'Deploy abgeschlossen.' -ForegroundColor Green
} finally { Remove-SFTPSession -SessionId $sftp.SessionId | Out-Null }

if(-not $SkipVerify){
  $url="$BaseUrl/api/health.php?t=$([DateTime]::Now.Ticks)"
  try{ $r=Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30; Write-Host ("  health: HTTP {0} {1}" -f [int]$r.StatusCode,$r.Content) -ForegroundColor Green } catch { Write-Host "  health-Check fehlgeschlagen: $($_.Exception.Message)" -ForegroundColor Yellow }
}
