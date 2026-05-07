# start.ps1 - Inicia todo el sistema Data Warehouse
# Ejecutar: powershell -ExecutionPolicy Bypass -File start.ps1

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Data Warehouse Logistico - Olist" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Servidor
Write-Host "[1/5] Iniciando servidor TCP:12000 + UDP:12001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root'; Write-Host '=== SERVIDOR CONCURRENTE TCP:12000 UDP:12001 ===' -ForegroundColor Green; py -m servidor.servidor"
Start-Sleep 3

# 2. API
Write-Host "[2/5] Iniciando API FastAPI :8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root'; Write-Host '=== API FastAPI :8000 ===' -ForegroundColor Green; py -m uvicorn api.app:app --reload --host 127.0.0.1 --port 8000"
Start-Sleep 3

# 3. Agente TCP
Write-Host "[3/5] Iniciando agente TCP (transaccional)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root'; Write-Host '=== AGENTE TCP - Transaccional ===' -ForegroundColor Green; py -m agentes.agente_tcp"

# 4. Agente UDP
Write-Host "[4/5] Iniciando agente UDP (telemetria GPS)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root'; Write-Host '=== AGENTE UDP - Telemetria GPS ===' -ForegroundColor Green; py -m agentes.agente_udp"

# 5. Frontend
Write-Host "[5/5] Iniciando frontend React :5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; Write-Host '=== FRONTEND React :5173 ===' -ForegroundColor Green; npm run dev"

Start-Sleep 5

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Todos los componentes arrancados" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Servidor    : TCP 12000 + UDP 12001" -ForegroundColor White
Write-Host "  API         : http://127.0.0.1:8000" -ForegroundColor White
Write-Host "  Frontend    : http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "  Cierra las ventanas de PowerShell para detener cada componente." -ForegroundColor Gray
Write-Host "  O ejecuta:  powershell -ExecutionPolicy Bypass -File stop.ps1" -ForegroundColor Gray
Write-Host ""
