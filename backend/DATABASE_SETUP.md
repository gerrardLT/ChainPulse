# ChainPulse 数据库设置指南

## 问题说明
后端启动失败是因为还没有配置数据库连接。你需要：
1. 在 Supabase 创建项目
2. 执行数据库初始化 SQL
3. 更新 `.env` 文件中的数据库连接字符串

---

## 步骤 1: 创建 Supabase 项目

### 1.1 注册/登录 Supabase
访问 https://supabase.com 并登录

### 1.2 创建新项目
1. 点击 "New Project"
2. 填写信息：
   - **Project Name**: ChainPulse
   - **Database Password**: 记住这个密码！
   - **Region**: 选择离你最近的区域
3. 等待项目创建完成（约 2 分钟）

### 1.3 获取数据库连接字符串
1. 进入项目 → Settings → Database
2. 找到 **Connection string** → **URI** 格式
3. 复制连接字符串，类似：
   ```
   postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:5432/postgres
   ```

---

## 步骤 2: 更新 .env 文件

打开 `backend/.env` 文件，替换 `DATABASE_URL`：

```env
# 替换为你的 Supabase 连接字符串
DATABASE_URL="postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres"
```

**重要**: 记得把 `[YOUR-PASSWORD]` 替换为你设置的实际密码！

---

## 步骤 3: 初始化数据库

### 3.1 在 Supabase SQL Editor 执行脚本

1. 进入 Supabase 项目 → SQL Editor
2. 点击 "New query"
3. 复制 `database/schema.sql` 的全部内容
4. 粘贴到 SQL Editor
5. 点击 "Run" 执行

**预期结果**:
```
✔ 创建了 8 个核心业务表
✔ 创建了 2 个辅助表
✔ 创建了多个索引和触发器
✔ 启用了行级安全策略
```

### 3.2 插入测试数据（可选）

如果需要测试数据，继续执行：
1. 新建一个 query
2. 复制 `database/seed.sql` 的全部内容
3. 执行

---

## 步骤 4: 生成 Prisma Client 并启动后端

### 在 PowerShell 执行：

```powershell
cd backend

# 生成 Prisma Client（使用更新后的 DATABASE_URL）
npm run prisma:generate

# 启动后端
npm run dev
```

**成功启动后应该看到**:
```
🚀 Server is running on port 4000
✅ Database connected successfully
🔌 WebSocket server initialized
```

---

## 步骤 5: 验证数据库连接

### 方法 1: 使用 Prisma Studio
```powershell
npm run prisma:studio
```
浏览器会自动打开 http://localhost:5555，你可以看到所有表

### 方法 2: 测试 API
使用 Postman 或 curl 测试：
```bash
curl http://localhost:4000/health
```

应该返回：
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-10-12T..."
  }
}
```

---

## 常见问题排查

### ❌ "Can't reach database server"
- 检查网络连接
- 确认 Supabase 项目正在运行
- 验证连接字符串是否正确

### ❌ "Authentication failed"
- 检查数据库密码是否正确
- 确保连接字符串中的密码已 URL 编码（特殊字符需要转义）

### ❌ "relation does not exist"
- 说明 schema.sql 还没执行
- 到 Supabase SQL Editor 执行数据库初始化脚本

### ❌ Prisma 错误
```powershell
# 重新生成 Prisma Client
cd backend
npx prisma generate

# 查看数据库表
npx prisma db pull
```

---

## 数据库维护

### 查看表结构
```powershell
npm run prisma:studio
```

### 创建新迁移
```powershell
npx prisma migrate dev --name add_new_field
```

### 重置数据库（⚠️ 会删除所有数据）
```powershell
npx prisma migrate reset
```

---

## 下一步

数据库设置完成后：
1. ✅ 后端可以正常启动
2. ✅ 可以测试所有 API 端点
3. ✅ 可以启动前端连接后端

前端启动：
```powershell
cd frontend
npm run dev
```

访问 http://localhost:3000 即可使用完整应用！

---

## 需要帮助？

如果遇到问题：
1. 检查 `backend/logs/` 目录下的日志文件
2. 查看终端输出的错误信息
3. 确认 Supabase 项目状态
4. 验证 `.env` 文件配置


