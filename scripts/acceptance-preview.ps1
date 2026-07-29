[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("Start", "Status", "Stop")]
    [string]$Mode,

    [ValidateRange(1024, 65535)]
    [int]$Port = 3000,

    [int]$PreviewProcessId
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$PidFile = Join-Path $Root ".tmp-acceptance-preview.pid"
$OutFile = Join-Path $Root ".tmp-acceptance-ui.out.log"
$ErrFile = Join-Path $Root ".tmp-acceptance-ui.err.log"
$HealthUrl = "http://127.0.0.1:$Port/"

function Get-RegisteredPid {
    if ($PreviewProcessId -gt 0) {
        return $PreviewProcessId
    }
    if (Test-Path -LiteralPath $PidFile) {
        $value = (Get-Content -Raw -LiteralPath $PidFile).Trim()
        if ($value -match "^\d+$") {
            return [int]$value
        }
    }
    return 0
}

function Test-ProcessAlive([int]$ProcessId) {
    return $null -ne (Get-Process -Id $ProcessId -ErrorAction SilentlyContinue)
}

function Test-PreviewHealthy {
    try {
        $response = Invoke-WebRequest -Uri $HealthUrl -UseBasicParsing -TimeoutSec 2
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

function Stop-PreviewTree([int]$ProcessId) {
    if (-not (Test-ProcessAlive $ProcessId)) {
        return
    }
    & "$env:SystemRoot\System32\taskkill.exe" /PID $ProcessId /T /F | Out-Null
    if ($LASTEXITCODE -ne 0 -and (Test-ProcessAlive $ProcessId)) {
        throw "Failed to stop the local preview process tree for PID $ProcessId."
    }
}

if ($Mode -eq "Status") {
    $registeredPid = Get-RegisteredPid
    $alive = $registeredPid -gt 0 -and (Test-ProcessAlive $registeredPid)
    $healthy = $alive -and (Test-PreviewHealthy)
    Write-Output "PID=$registeredPid Alive=$alive Healthy=$healthy URL=$HealthUrl"
    if ($healthy) {
        exit 0
    }
    exit 1
}

if ($Mode -eq "Stop") {
    $registeredPid = Get-RegisteredPid
    if ($registeredPid -gt 0) {
        Stop-PreviewTree $registeredPid
    }
    Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
    Write-Output "Acceptance preview stopped (PID $registeredPid)."
    exit 0
}

$existingPid = Get-RegisteredPid
if ($existingPid -gt 0 -and (Test-ProcessAlive $existingPid)) {
    throw "The local preview is already running (PID $existingPid). Stop it before starting another."
}

$buildId = Join-Path $Root ".next\BUILD_ID"
if (-not (Test-Path -LiteralPath $buildId)) {
    throw "The local production build is missing. Run npm run build:local first."
}

$node = (Get-Command node.exe -ErrorAction Stop).Source
$next = Join-Path $Root "node_modules\next\dist\bin\next"
if (-not (Test-Path -LiteralPath $next)) {
    throw "The Next.js entry point is missing: $next"
}

$utf8NoBom = New-Object Text.UTF8Encoding($false)
[IO.File]::WriteAllText($OutFile, "", $utf8NoBom)
[IO.File]::WriteAllText($ErrFile, "", $utf8NoBom)

$command = "`"$node`" `"$next`" start -p $Port 1>`"$OutFile`" 2>`"$ErrFile`""
$startInfo = New-Object Diagnostics.ProcessStartInfo
$startInfo.FileName = "$env:SystemRoot\System32\cmd.exe"
$startInfo.Arguments = "/d /s /c `"$command`""
$startInfo.WorkingDirectory = $Root
$startInfo.UseShellExecute = $false
$startInfo.CreateNoWindow = $true
$startInfo.EnvironmentVariables.Clear()

$environment = [Environment]::GetEnvironmentVariables()
foreach ($key in $environment.Keys) {
    $name = [string]$key
    if ($name -ieq "Path") {
        continue
    }
    $startInfo.EnvironmentVariables[$name] = [string]$environment[$key]
}
$pathValue = [string]$environment["Path"]
if (-not $pathValue) {
    $pathValue = [string]$environment["PATH"]
}
if ($pathValue) {
    $startInfo.EnvironmentVariables["Path"] = $pathValue
}

$process = [Diagnostics.Process]::Start($startInfo)
[IO.File]::WriteAllText($PidFile, "$($process.Id)`r`n", $utf8NoBom)

$healthy = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    if (-not (Test-ProcessAlive $process.Id)) {
        break
    }
    if (Test-PreviewHealthy) {
        $healthy = $true
        break
    }
    Start-Sleep -Milliseconds 250
}

if (-not $healthy) {
    Stop-PreviewTree $process.Id
    Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
    $stdout = if (Test-Path -LiteralPath $OutFile) { Get-Content -Raw -LiteralPath $OutFile } else { "" }
    $stderr = if (Test-Path -LiteralPath $ErrFile) { Get-Content -Raw -LiteralPath $ErrFile } else { "" }
    throw "The local preview did not pass its health check.`nSTDOUT:`n$stdout`nSTDERR:`n$stderr"
}

Write-Output "Acceptance preview ready (PID $($process.Id), URL $HealthUrl)."
