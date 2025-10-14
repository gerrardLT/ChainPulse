# =====================================
# 🚀 ChainPulse 本地数据库部署脚本
# =====================================

param(
    [string]$DBUser = "postgres",
    [string]$DBPassword = "123456",
    [string]$DBName = "chainpulse",
    [string]$DBHost = "localhost",
    [int]$DBPort = 5432
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🚀 ChainPulse 本地数据库部署" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 参数确认
Write-Host "📋 配置信息：" -ForegroundColor Yellow
Write-Host "   数据库主机: $DBHost" -ForegroundColor White
Write-Host "   数据库端口: $DBPort" -ForegroundColor White
Write-Host "   数据库用户: $DBUser" -ForegroundColor White
Write-Host "   数据库密码: $('*' * $DBPassword.Length)" -ForegroundColor White
Write-Host "   数据库名称: $DBName`n" -ForegroundColor White

$confirmation = Read-Host "确认配置正确？(y/n)"
if ($confirmation -ne 'y') {
    Write-Host "`n❌ 部署已取消" -ForegroundColor Red
    exit
}

# Step 1: 更新 .env 文件
Write-Host "`n[1/5] 更新 .env 文件..." -ForegroundColor Yellow

$envPath = ".env"
$newDatabaseUrl = "DATABASE_URL=`"postgresql://$DBUser`:$DBPassword@$DBHost`:$DBPort/$DBName`""

if (Test-Path $envPath) {
    $content = Get-Content $envPath -Raw
    
    # 备份原文件
    Copy-Item $envPath "$envPath.backup" -Force
    Write-Host "   ✅ 已备份原 .env 为 .env.backup" -ForegroundColor Green
    
    # 替换 DATABASE_URL
    if ($content -match 'DATABASE_URL=') {
        $content = $content -replace 'DATABASE_URL=.*', $newDatabaseUrl
        Write-Host "   ✅ 已更新 DATABASE_URL" -ForegroundColor Green
    } else {
        $content += "`n$newDatabaseUrl"
        Write-Host "   ✅ 已添加 DATABASE_URL" -ForegroundColor Green
    }
    
    $content | Set-Content $envPath -NoNewline
} else {
    Write-Host "   ❌ .env 文件不存在！" -ForegroundColor Red
    exit 1
}

# Step 2: 测试数据库连接
Write-Host "`n[2/5] 测试数据库连接..." -ForegroundColor Yellow

$env:PGPASSWORD = $DBPassword

try {
    $result = & psql -h $DBHost -p $DBPort -U $DBUser -d postgres -c "SELECT version();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ 数据库连接成功！" -ForegroundColor Green
    } else {
        throw "连接失败"
    }
} catch {
    Write-Host "   ⚠️  无法使用 psql 测试连接，将继续使用 Prisma..." -ForegroundColor Yellow
}

# Step 3: 创建数据库（如果不存在）
Write-Host "`n[3/5] 创建数据库（如果需要）..." -ForegroundColor Yellow

try {
    $result = & psql -h $DBHost -p $DBPort -U $DBUser -d postgres -c "CREATE DATABASE $DBName;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ 数据库 '$DBName' 创建成功！" -ForegroundColor Green
    }
} catch {
    Write-Host "   ℹ️  数据库可能已存在，继续..." -ForegroundColor Gray
}

# Step 4: 运行 Prisma 迁移
Write-Host "`n[4/5] 运行 Prisma 迁移..." -ForegroundColor Yellow

npx prisma migrate dev --name init_local_database

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n   ❌ Prisma 迁移失败！" -ForegroundColor Red
    Write-Host "`n   请检查：" -ForegroundColor Yellow
    Write-Host "   1. DATABASE_URL 是否正确" -ForegroundColor White
    Write-Host "   2. PostgreSQL 服务是否运行" -ForegroundColor White
    Write-Host "   3. 用户名密码是否正确" -ForegroundColor White
    Write-Host "`n   恢复原 .env：" -ForegroundColor Yellow
    Write-Host "   Copy-Item .env.backup .env -Force" -ForegroundColor Cyan
    exit 1
}

Write-Host "   ✅ 数据库迁移完成！" -ForegroundColor Green

# Step 5: 验证部署
Write-Host "`n[5/5] 验证部署..." -ForegroundColor Yellow

$tables = @(
    "users",
    "smart_accounts",
    "event_subscriptions",
    "notifications",
    "automation_rules",
    "telegram_configs",
    "discord_configs",
    "events_cache",
    "user_sessions",
    "audit_logs"
)

try {
    $result = & psql -h $DBHost -p $DBPort -U $DBUser -d $DBName -c "\dt" 2>&1
    
    if ($result -match "users") {
        Write-Host "   ✅ 数据库表创建成功！" -ForegroundColor Green
        Write-Host "`n   创建的表：" -ForegroundColor Gray
        foreach ($table in $tables) {
            Write-Host "   - $table" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   ⚠️  无法验证表，请手动检查" -ForegroundColor Yellow
}

# 完成
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "📝 接下来：" -ForegroundColor Yellow
Write-Host "   1. 启动后端：npm run dev" -ForegroundColor White
Write-Host "   2. 访问：http://localhost:4000/health" -ForegroundColor White
Write-Host "   3. 查看数据库：npx prisma studio`n" -ForegroundColor White

Write-Host "💡 提示：" -ForegroundColor Cyan
Write-Host "   - 原 .env 已备份为 .env.backup" -ForegroundColor Gray
Write-Host "   - 如需切换回 Supabase，恢复备份即可`n" -ForegroundColor Gray

