# Backend Quick Start Guide

## 🚀 快速启动后端服务器

### 1. 安装依赖（如果还没安装）

```bash
cd backend
npm install
```

### 2. 配置环境变量

创建 `.env` 文件（复制下面的内容）：

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database URL (Supabase PostgreSQL)
# 格式: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://postgres:your-password@db.example.supabase.co:5432/postgres"

# JWT Secret (生成一个随机字符串)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-12345"
JWT_EXPIRES_IN="7d"

# Frontend URL (CORS)
FRONTEND_URL="http://localhost:3000"

# Stackup API (ERC-4337) - 可选，用于智能账户
STACKUP_API_KEY=""

# Envio GraphQL Endpoint - 可选，用于事件索引
ENVIO_GRAPHQL_URL=""
```

### 3. 生成 Prisma Client

```bash
npm run prisma:generate
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:4000 启动

---

## ⚠️ 常见错误排查

### 错误 1: `.env file not found`

**原因**: 缺少环境配置文件

**解决方案**:
```bash
# 在 backend 目录下创建 .env 文件
# 复制上面第2步的内容
```

### 错误 2: `Cannot connect to database`

**原因**: DATABASE_URL 配置错误或数据库未启动

**解决方案**:
1. 检查 DATABASE_URL 是否正确
2. 确保数据库服务器正在运行
3. 测试数据库连接：`npm run prisma:studio`

### 错误 3: `Prisma Client not generated`

**原因**: Prisma Client 未生成

**解决方案**:
```bash
npm run prisma:generate
```

### 错误 4: `Module not found`

**原因**: 依赖未安装

**解决方案**:
```bash
npm install
```

### 错误 5: `Port 4000 already in use`

**原因**: 端口被占用

**解决方案**:
1. 方案 A: 在 .env 中更改 PORT=4001
2. 方案 B: 关闭占用端口的程序

---

## 📊 验证服务器运行

### 1. 健康检查

访问: http://localhost:4000/health

应该返回:
```json
{
  "success": true,
  "message": "ChainPulse Backend is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### 2. API 端点测试

```bash
# 获取签名消息
curl -X POST http://localhost:4000/api/v1/auth/message \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb2"}'
```

---

## 🗄️ 数据库设置

### 使用 Supabase (推荐)

1. 访问 https://supabase.com
2. 创建新项目
3. 获取数据库连接字符串
4. 运行数据库迁移：
   ```bash
   # 在项目根目录
   cd database
   # 将 schema.sql 的内容复制到 Supabase SQL Editor 执行
   ```

### 使用本地 PostgreSQL

```bash
# 安装 PostgreSQL
# Windows: https://www.postgresql.org/download/windows/
# Mac: brew install postgresql

# 创建数据库
createdb chainpulse

# 更新 .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/chainpulse"

# 运行迁移
npm run prisma:migrate
```

---

## 🔧 开发命令

```bash
# 开发模式（热重载）
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start

# Prisma 相关
npm run prisma:generate    # 生成 Prisma Client
npm run prisma:migrate     # 运行数据库迁移
npm run prisma:studio      # 打开 Prisma Studio (数据库 GUI)

# 测试
npm test                   # 运行测试
npm run test:watch         # 监听模式
npm run test:coverage      # 生成覆盖率报告

# 代码质量
npm run lint               # 检查代码
npm run lint:fix           # 自动修复
npm run format             # 格式化代码
```

---

## 📝 最小可运行配置

如果你只是想快速测试，使用这个最小配置：

**`.env`**:
```env
PORT=4000
DATABASE_URL="postgresql://postgres:password@localhost:5432/chainpulse"
JWT_SECRET="test-secret-key-12345"
FRONTEND_URL="http://localhost:3000"
```

**注意**: 
- 需要先运行本地 PostgreSQL 或 Supabase
- 需要运行 `database/schema.sql` 创建表结构

---

## 🆘 仍然有问题？

1. 查看日志文件：`backend/logs/error.log`
2. 查看完整文档：`backend/README.md`
3. 查看 API 设计：`docs/API设计.md`
4. 查看数据库设计：`docs/数据库设计.md`

---

## ✅ 成功启动的标志

当你看到以下输出时，说明服务器成功启动：

```
🚀 ChainPulse Backend Server started on port 4000
📊 Health check: http://localhost:4000/health
📡 API: http://localhost:4000/api/v1
🔌 WebSocket: http://localhost:4000
🌍 Environment: development
✅ WebSocket server initialized
```


