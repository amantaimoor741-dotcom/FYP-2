$root = $PSScriptRoot

Write-Host "Starting Backend (port 4000)..." -ForegroundColor Green
$backend = Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "node_modules\.bin\tsx.cmd server/index.ts" -WorkingDirectory $root -RedirectStandardOutput "$root\backend.log" -RedirectStandardError "$root\backend_err.log" -PassThru

Write-Host "Starting Frontend (port 3000)..." -ForegroundColor Green
$frontend = Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "node_modules\.bin\vite.cmd --port=3000 --host=0.0.0.0" -WorkingDirectory $root -RedirectStandardOutput "$root\frontend.log" -RedirectStandardError "$root\frontend_err.log" -PassThru

Start-Sleep -Seconds 5

Write-Host "`nBackend PID: $($backend.Id)" -ForegroundColor Cyan
Write-Host "Frontend PID: $($frontend.Id)" -ForegroundColor Cyan

try {
    $health = Invoke-RestMethod -Uri "http://localhost:4000/api/health" -ErrorAction Stop
    Write-Host "Backend: OK ($($health.status))" -ForegroundColor Green
} catch {
    Write-Host "Backend: FAILED - check backend_err.log" -ForegroundColor Red
    Get-Content "$root\backend_err.log" -Tail 10
}

try {
    $fe = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction Stop
    Write-Host "Frontend: OK ($($fe.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "Frontend: FAILED - check frontend_err.log" -ForegroundColor Red
    Get-Content "$root\frontend_err.log" -Tail 10
}

Write-Host "`nApp running at:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:3000"
Write-Host "  Backend:  http://localhost:4000"
Write-Host "`nTo stop: Get-Process -Name node | Stop-Process -Force" -ForegroundColor Gray
