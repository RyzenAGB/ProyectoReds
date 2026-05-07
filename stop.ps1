# stop.ps1 - Detiene todos los componentes del Data Warehouse
# Ejecutar: powershell -ExecutionPolicy Bypass -File stop.ps1

Write-Host "Deteniendo componentes..." -ForegroundColor Yellow

# Cerrar ventanas de PowerShell por titulo de ventana
$titles = @("SERVIDOR", "AGENTE TCP", "AGENTE UDP", "API FastAPI", "FRONTEND")
foreach ($title in $titles) {
    Get-Process powershell -ErrorAction SilentlyContinue |
        Where-Object { $_.MainWindowTitle -match $title } |
        Stop-Process -Force -ErrorAction SilentlyContinue
}

# Cerrar procesos node del frontend
Get-Process node -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -match "vite" } |
    Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Componentes detenidos." -ForegroundColor Green
