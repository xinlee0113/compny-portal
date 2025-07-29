# Docker Desktop 启动脚本
# 自动启动Docker Desktop并等待服务就绪

Write-Host "🐳 启动Docker Desktop..." -ForegroundColor Cyan

# 检查Docker Desktop是否已安装
$dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
if (-not (Test-Path $dockerPath)) {
    Write-Host "❌ Docker Desktop未找到在 $dockerPath" -ForegroundColor Red
    Write-Host "请先安装Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# 检查Docker Desktop是否已在运行
$dockerProcess = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
if ($dockerProcess) {
    Write-Host "✅ Docker Desktop已在运行" -ForegroundColor Green
} else {
    Write-Host "🚀 启动Docker Desktop..." -ForegroundColor Blue
    Start-Process -FilePath $dockerPath -WindowStyle Hidden
    Write-Host "⏳ 等待Docker Desktop启动..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

# 等待Docker引擎就绪
$maxRetries = 30
$retryCount = 0

do {
    $retryCount++
    Write-Host "🔍 检查Docker引擎状态 ($retryCount/$maxRetries)..." -ForegroundColor Yellow
    
    try {
        $result = docker version --format "{{.Server.Version}}" 2>$null
        if ($result) {
            Write-Host "✅ Docker引擎已就绪! 版本: $result" -ForegroundColor Green
            break
        }
    } catch {
        # Docker未就绪，继续等待
    }
    
    if ($retryCount -ge $maxRetries) {
        Write-Host "❌ Docker Desktop启动超时，请手动检查" -ForegroundColor Red
        Write-Host "💡 解决方法：" -ForegroundColor Yellow
        Write-Host "  1. 手动启动Docker Desktop" -ForegroundColor White
        Write-Host "  2. 等待Docker图标显示绿色状态" -ForegroundColor White
        Write-Host "  3. 重新运行此脚本" -ForegroundColor White
        exit 1
    }
    
    Start-Sleep -Seconds 5
} while ($true)

Write-Host "🎉 Docker Desktop启动完成!" -ForegroundColor Green
Write-Host "📊 Docker系统信息:" -ForegroundColor Cyan
docker system info --format "表格 {{.Name}}\t{{.ServerVersion}}\t{{.KernelVersion}}"

Write-Host "`n✅ 现在可以启动数据库服务了:" -ForegroundColor Green
Write-Host "   npm run db:start" -ForegroundColor White