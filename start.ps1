Write-Host "=== CV Creator - Starting ===" -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"

Write-Host "Starting Flask backend..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "python" -ArgumentList "app.py" -WorkingDirectory $backendDir

Write-Host "Starting Vite frontend..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "cmd" -ArgumentList "/c npx vite" -WorkingDirectory $frontendDir

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Open http://localhost:5173 in browser" -ForegroundColor Cyan
