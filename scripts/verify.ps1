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

Invoke-NpmScript "lint"
Invoke-NpmScript "typecheck"
Invoke-NpmScript "test"
Invoke-NpmScript "sites:snapshot:check"

if ($Full) {
    Invoke-NpmScript "test:integration"
    Invoke-NpmScript "data:validate"
    Invoke-NpmScript "review:generate"
    Invoke-NpmScript "review:validate"
    Invoke-NpmScript "sites:check"
    Invoke-NpmScript "build"
    Invoke-NpmScript "build:local"
}

Write-Host "Verification passed."
