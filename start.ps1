# start.ps1 - Inicia agentes y servidor local para enviar datos a Supabase
# Ejecutar: powershell -ExecutionPolicy Bypass -File start.ps1

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Data Warehouse Logistico - Olist" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  API (Render)    : https://datawarehouse-api.onrender.com" -ForegroundColor DarkGray
Write-Host "  Frontend (Vercel): https://proyecto-reds.vercel.app" -ForegroundColor DarkGray
Write-Host ""

# 1. Servidor
Write-Host "[1/3] Iniciando servidor TCP:12000 + UDP:12001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root'; Write-Host '=== SERVIDOR CONCURRENTE TCP:12000 UDP:12001 ===' -ForegroundColor Green; py -m servidor.servidor"
Start-Sleep 3

# 2. Agente TCP
Write-Host "[2/3] Iniciando agente TCP (transaccional)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root'; Write-Host '=== AGENTE TCP - Transaccional ===' -ForegroundColor Green; py -m agentes.agente_tcp"

# 3. Agente UDP
Write-Host "[3/3] Iniciando agente UDP (telemetria GPS)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root'; Write-Host '=== AGENTE UDP - Telemetria GPS ===' -ForegroundColor Green; py -m agentes.agente_udp"

Start-Sleep 5

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Agentes enviando datos a Supabase" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Servidor    : TCP 12000 + UDP 12001" -ForegroundColor White
Write-Host "  API         : https://datawarehouse-api.onrender.com" -ForegroundColor White
Write-Host "  Frontend    : https://proyecto-reds.vercel.app" -ForegroundColor White
Write-Host ""
Write-Host "  Los datos apareceran en el frontend en ~2 minutos." -ForegroundColor Gray
Write-Host "  Cierra las ventanas de PowerShell para detener cada componente." -ForegroundColor Gray
Write-Host "  O ejecuta:  powershell -ExecutionPolicy Bypass -File stop.ps1" -ForegroundColor Gray
Write-Host ""
