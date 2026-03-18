# PowerShell 启动脚本
# 右键选择"使用 PowerShell 运行"或在 PowerShell 中执行: powershell -ExecutionPolicy Bypass -File start.ps1

Write-Host "🚀 启动 Excel/Word 文档分析门户..." -ForegroundColor Green
Write-Host ""

# 创建上传目录
if (-not (Test-Path "server/uploads")) {
    New-Item -ItemType Directory -Path "server/uploads" | Out-Null
    Write-Host "✅ 创建上传目录" -ForegroundColor Green
}

# 启动后端
Write-Host "📦 准备后端服务器..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "server"
$backendCmd = {
    cd $using:backendPath
    npm install 2>$null
    Write-Host ""
    Write-Host "📡 后端服务器已启动 (http://localhost:3001)" -ForegroundColor Green
    Write-Host "📊 分析 APIs:" -ForegroundColor Yellow
    Write-Host "   - POST http://localhost:3001/api/analyze" -ForegroundColor Yellow
    Write-Host "   - GET http://localhost:3001/api/health" -ForegroundColor Yellow
    npm run dev
}

# 在新 PowerShell 窗口启动后端
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd | Out-Null

Write-Host ""
Write-Host "📦 准备前端服务器..." -ForegroundColor Cyan

# 等待后端启动
Start-Sleep -Seconds 2

# 安装前端依赖
npm install 2>$null

Write-Host ""
Write-Host "🎨 启动前端服务器..." -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ 应用已启动！" -ForegroundColor Green
Write-Host "📱 前端地址: http://localhost:5173" -ForegroundColor Yellow
Write-Host "📡 后端地址: http://localhost:3001" -ForegroundColor Yellow
Write-Host ""

# 启动前端
npm run dev
