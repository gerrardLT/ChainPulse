# 🔧 Supabase 连接配置指南

## 📍 当前问题

你的数据库连接失败，错误信息：
```
Can't reach database server at `db.tqxssfiiznvkoifgyook.supabase.co:5432`
```

**原因**: 使用了 Direct Connection 格式，需要 IPv6 支持。

## ✅ 解决方案：使用 Supavisor Pooler

### 步骤 1: 获取正确的连接字符串

在 Supabase Dashboard：
1. 项目 → **Settings** → **Database**  
2. 找到 **Connection string** → **Connection pooling**
3. 复制 **Transaction mode** 和 **Session mode** 两个连接字符串

你会看到类似这样的格式：

**Transaction Mode** (端口 **6543**):
```
postgres://postgres.tqxssfiiznvkoifgyook:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Session Mode** (端口 **5432**):
```
postgres://postgres.tqxssfiiznvkoifgyook:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### 步骤 2: 更新 backend/.env

根据 Supabase + Prisma 最佳实践，配置两个 URL：

```env
# Server
PORT=4000
NODE_ENV=development

# Database - Transaction Mode (运行时查询)
DATABASE_URL="postgres://postgres.tqxssfiiznvkoifgyook:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=30"

# Database - Session Mode (Prisma Migrations)
DIRECT_URL="postgres://postgres.tqxssfiiznvkoifgyook:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?connect_timeout=30"

# JWT
JWT_SECRET="chainpulse-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# CORS
FRONTEND_URL="http://localhost:3000"

# Optional
STACKUP_API_KEY=""
ENVIO_GRAPHQL_URL=""
```

### 步骤 3: 关键配置说明

#### DATABASE_URL (Transaction Mode - 端口 6543)
- 用于应用程序的所有数据库查询
- **必须** 添加 `?pgbouncer=true` 参数
- 添加 `&connect_timeout=30` 增加超时时间
- 适合频繁的短连接

#### DIRECT_URL (Session Mode - 端口 5432)
- 用于 Prisma Migrations
- **不需要** `pgbouncer=true` 参数
- 添加 `&connect_timeout=30` 增加超时时间
- 支持 prepared statements

### 步骤 4: 测试连接

```powershell
cd backend

# 1. 重新生成 Prisma Client
npm run prisma:generate

# 2. 测试数据库连接
npx prisma db pull

# 3. 启动服务器
npm run dev
```

成功后应该看到：
```
✅ Database connected successfully
🚀 ChainPulse Backend Server started on port 4000
```

## 🔍 参数详解

### `?pgbouncer=true`
- 告诉 Prisma 禁用 prepared statements
- Transaction Mode (端口 6543) **必需**
- Session Mode (端口 5432) **不需要**

### `&connect_timeout=30`
- 增加连接超时时间到 30 秒
- 防止网络波动导致的连接失败
- 两种模式都推荐添加

## ⚠️ 特殊字符处理

如果你的密码包含特殊字符，需要 URL 编码：
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `=` → `%3D`

示例：
```
密码: MyPass@123#
编码后: MyPass%40123%23
```

## 📊 两种模式对比

| 特性 | Transaction Mode (6543) | Session Mode (5432) |
|------|------------------------|---------------------|
| **用途** | 应用查询 | Migrations |
| **连接池** | ✅ 是 | ✅ 是 |
| **Prepared Statements** | ❌ 不支持 | ✅ 支持 |
| **需要 pgbouncer=true** | ✅ 是 | ❌ 否 |
| **适合场景** | 生产环境/无服务器 | 数据库迁移 |

## 🎯 快速复制模板

将你的实际信息替换下面的占位符：

```env
DATABASE_URL="postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=30"
DIRECT_URL="postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?connect_timeout=30"
```

**你的实际值**（从终端错误信息可以看到）：
- `[PROJECT-REF]`: `tqxssfiiznvkoifgyook`
- `[PASSWORD]`: 你的数据库密码
- `[REGION]`: 你的区域（如 `ap-southeast-1`）

## 🚀 完整 .env 示例

```env
PORT=4000
NODE_ENV=development

DATABASE_URL="postgres://postgres.tqxssfiiznvkoifgyook:你的密码@aws-0-你的区域.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=30"
DIRECT_URL="postgres://postgres.tqxssfiiznvkoifgyook:你的密码@aws-0-你的区域.pooler.supabase.com:5432/postgres?connect_timeout=30"

JWT_SECRET="chainpulse-jwt-secret-change-in-production"
JWT_EXPIRES_IN="7d"

FRONTEND_URL="http://localhost:3000"

STACKUP_API_KEY=""
ENVIO_GRAPHQL_URL=""
```

---

## 📚 参考资料

- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Prisma with Supabase](https://supabase.com/docs/guides/database/prisma)
- [Supavisor Documentation](https://supabase.com/docs/guides/database/supavisor)


