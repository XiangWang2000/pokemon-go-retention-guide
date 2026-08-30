[CmdletBinding()]
param(
    [switch]$Full
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Set-Location $Root

function Invoke-NpmScript {
    param([Parameter(Mandatory = $true)][string]$Name)

    Write-Host "==> npm run $Name"
    & npm run $Name
    if ($LASTEXITCODE -ne 0) {
        throw "npm run $Name failed with exit code $LASTEXITCODE."
    }
}

function Invoke-NpmCommand {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)

    Write-Host "==> npm $($Arguments -join ' ')"
    & npm @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "npm $($Arguments -join ' ') failed with exit code $LASTEXITCODE."
    }
}

Invoke-NpmScript "lint"
Invoke-NpmScript "typecheck"
Invoke-NpmScript "test"
if (-not $Full) {
    Invoke-NpmScript "snapshot:check"
}

if ($Full) {
    $PreviousDatabaseUrl = $env:DATABASE_URL
    try {
        $env:DATABASE_URL = "file:./rebuild-ci.db"
        Invoke-NpmScript "test:integration"
        Invoke-NpmScript "data:validate"
        Invoke-NpmScript "release:verify"
        Invoke-NpmScript "build"
        Invoke-NpmScript "build:local"
    }
    finally {
        if ($null -eq $PreviousDatabaseUrl) {
            Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
        }
        else {
            $env:DATABASE_URL = $PreviousDatabaseUrl
        }
    }
}

Write-Host "Verification passed."
