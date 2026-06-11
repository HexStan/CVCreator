Write-Host "=== CV Creator - Stopping ===" -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Stopping Flask backend (port 5000)..." -ForegroundColor Yellow
$backendPid = (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess) -join ','
if ($backendPid) {
    $backendPid.Split(',') | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Write-Host "Backend stopped." -ForegroundColor Green
} else {
    Write-Host "Backend is not running." -ForegroundColor DarkGray
}

Write-Host "Stopping Vite frontend (port 5173)..." -ForegroundColor Yellow
$frontendPid = (Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess) -join ','
if ($frontendPid) {
    $frontendPid.Split(',') | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Write-Host "Frontend stopped." -ForegroundColor Green
} else {
    Write-Host "Frontend is not running." -ForegroundColor DarkGray
}

Write-Host "All services stopped." -ForegroundColor Cyan
