Write-Host "=== CV Creator - Restarting ===" -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

& (Join-Path $root "stop.ps1")

Write-Host ""
Start-Sleep -Seconds 2

& (Join-Path $root "start.ps1")
