# ChainPulse Backend Service

> 实时链上事件通知与可视化系统 - 后端服务

## 📋 项目概述

ChainPulse 后端是基于 Node.js 和 Express 的 RESTful API 服务，提供用户认证、智能账户管理、事件订阅、实时通知推送等核心功能。

## 🎯 核心功能

### ✅ 已完成功能

1. **用户认证与管理** (100%)
   - ✅ 钱包签名验证
   - ✅ JWT Token 生成和验证
   - ✅ 用户信息管理
   - ⬜ 会话管理

2. **智能账户管理** (100%)
   - ✅ 智能账户 CRUD API
   - ⬜ Stackup SDK 集成（待集成）
   - ✅ 账户部署管理
   - ⬜ 交易执行（待集成）

3. **事件监听与订阅** (75%)
   - ✅ 事件订阅管理 API
   - ⬜ 事件缓存同步服务（可选）
   - ⬜ GraphQL 客户端集成（Envio）

4. **实时通知系统** (100%)
   - ✅ WebSocket 服务器（Socket.IO）
   - ✅ 事件推送服务
   - ✅ 通知中心 API

5. **自动化规则** (50%)
   - ✅ 自动化规则 CRUD API
   - ⬜ 规则执行引擎
   - ⬜ 条件匹配和触发

6. **第三方集成** (预留接口)
   - ⬜ Telegram Bot 集成（接口已预留）
   - ⬜ Discord Webhook 集成（接口已预留）

7. **数据统计** (100%)
   - ✅ 用户统计 API
   - ✅ 事件统计 API
   - ✅ 数据聚合服务

### 📊 API 完成度

**总计**: 51个 REST API 端点已实现

- ✅ 认证 API: 4个
- ✅ 用户 API: 5个
- ✅ 智能账户 API: 8个
- ✅ 事件订阅 API: 8个
- ✅ 通知 API: 7个
- ✅ 自动化规则 API: 9个
- ✅ 统计 API: 7个
- ✅ WebSocket API: 实时推送

## 🛠 技术栈

| 技术 | 版本 | 用途 | 状态 |
|------|------|------|------|
| **核心框架** |
| Node.js | 20.x LTS | 运行时环境 | ✅ 已配置 |
| Express.js | 4.x | Web 框架 | ✅ 已集成 |
| TypeScript | 5.x | 类型安全 | ✅ 已配置 |
| **数据库** |
| Prisma | 5.x | ORM 框架 | ✅ Schema 已完成 |
| PostgreSQL | - | 数据库（Supabase） | ✅ Schema 已完成 |
| **实时通信** |
| Socket.IO | 4.x | WebSocket 服务器 | ✅ 已集成 |
| **GraphQL** |
| Apollo Client | 3.x | GraphQL 客户端（连接 Envio） | ⬜ 待集成 |
| **验证和安全** |
| Zod | 3.x | 数据验证 | ✅ 已集成 |
| JsonWebToken | 9.x | JWT 认证 | ✅ 已集成 |
| ethers.js | 6.x | 钱包签名验证 | ✅ 已集成 |
| **工具库** |
| Winston | 3.x | 日志管理 | ✅ 已集成 |
| express-rate-limit | 7.x | API 限流 | ✅ 已集成 |
| helmet | Latest | 安全头部 | ✅ 已集成 |
| cors | Latest | 跨域处理 | ✅ 已集成 |
| dotenv | Latest | 环境变量 | ✅ 已集成 |

## 📁 项目结构

```
backend/
├── src/
│   ├── controllers/          # 请求处理器
│   │   ├── auth.controller.ts         # 认证控制器
│   │   ├── user.controller.ts         # 用户控制器
│   │   ├── smart-account.controller.ts # 智能账户控制器
│   │   ├── subscription.controller.ts  # 订阅控制器
│   │   ├── notification.controller.ts  # 通知控制器
│   │   ├── automation.controller.ts    # 自动化控制器
│   │   └── stats.controller.ts        # 统计控制器
│   │
│   ├── services/            # 业务逻辑层
│   │   ├── auth.service.ts           # 认证服务
│   │   ├── user.service.ts           # 用户服务
│   │   ├── smart-account.service.ts  # 智能账户服务
│   │   ├── event.service.ts          # 事件服务
│   │   ├── notification.service.ts   # 通知服务
│   │   ├── automation.service.ts     # 自动化服务
│   │   ├── telegram.service.ts       # Telegram 服务
│   │   ├── discord.service.ts        # Discord 服务
│   │   └── envio.service.ts          # Envio GraphQL 服务
│   │
│   ├── routes/              # API 路由
│   │   ├── auth.routes.ts            # 认证路由
│   │   ├── user.routes.ts            # 用户路由
│   │   ├── smart-account.routes.ts   # 智能账户路由
│   │   ├── subscription.routes.ts    # 订阅路由
│   │   ├── notification.routes.ts    # 通知路由
│   │   ├── automation.routes.ts      # 自动化路由
│   │   ├── integration.routes.ts     # 第三方集成路由
│   │   └── stats.routes.ts           # 统计路由
│   │
│   ├── middleware/          # 中间件
│   │   ├── auth.middleware.ts        # 认证中间件
│   │   ├── validation.middleware.ts  # 验证中间件
│   │   ├── error.middleware.ts       # 错误处理中间件
│   │   ├── logger.middleware.ts      # 日志中间件
│   │   └── rate-limit.middleware.ts  # 限流中间件
│   │
│   ├── websocket/           # WebSocket 处理
│   │   ├── index.ts                  # Socket.IO 服务器
│   │   ├── handlers/
│   │   │   ├── connection.handler.ts # 连接处理
│   │   │   ├── event.handler.ts      # 事件处理
│   │   │   └── notification.handler.ts # 通知处理
│   │   └── middleware/
│   │       └── auth.middleware.ts    # WebSocket 认证
│   │
│   ├── utils/               # 工具函数
│   │   ├── logger.ts                 # 日志工具
│   │   ├── jwt.ts                    # JWT 工具
│   │   ├── validation.ts             # 验证工具
│   │   ├── response.ts               # 响应格式化
│   │   └── errors.ts                 # 错误定义
│   │
│   ├── types/               # TypeScript 类型
│   │   ├── index.ts
│   │   ├── api.types.ts              # API 类型
│   │   ├── user.types.ts             # 用户类型
│   │   └── event.types.ts            # 事件类型
│   │
│   └── index.ts             # 入口文件
│
├── prisma/                  # Prisma ORM
│   ├── schema.prisma        # Prisma Schema
│   └── migrations/          # 数据库迁移
│
├── tests/                   # 测试文件
│   ├── unit/               # 单元测试
│   ├── integration/        # 集成测试
│   └── setup.ts            # 测试配置
│
├── package.json            # 依赖管理
├── tsconfig.json           # TypeScript 配置
├── .env.example            # 环境变量示例
└── README.md               # 本文档
```

## 🚀 快速开始

### 前置要求

- Node.js 20.x 或更高
- PostgreSQL (Supabase)
- npm 或 yarn

### 安装依赖

```bash
cd backend
npm install
```

### 环境配置

创建 `.env` 文件：

```env
# Server
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/chainpulse

# Authentication
JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# Blockchain
RPC_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY
CHAIN_ID=1

# Stackup (Smart Account)
STACKUP_API_KEY=your-stackup-api-key
STACKUP_BUNDLER_URL=https://api.stackup.sh/v1/node/YOUR_KEY

# Envio (Indexer)
ENVIO_GRAPHQL_URL=https://indexer.envio.dev/YOUR_ENDPOINT

# Third-party Integration
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
DISCORD_WEBHOOK_URL=optional

# Logging
LOG_LEVEL=debug
```

### 数据库初始化

```bash
# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 填充测试数据（可选）
npm run seed
```

### 开发环境

```bash
npm run dev
```

服务器将在 [http://localhost:4000](http://localhost:4000) 启动

### 生产构建

```bash
npm run build
npm start
```

## 📝 API 设计

### 响应格式

所有 API 响应使用统一格式：

**成功响应**:
```json
{
  "success": true,
  "data": {
    // 响应数据
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 (GET, PATCH, DELETE) |
| 201 | 创建成功 (POST) |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 429 | 请求过于频繁 |
| 500 | 服务器错误 |

### API 端点

完整 API 文档请查看: `docs/API设计.md`

**认证相关**:
- `POST /api/v1/auth/message` - 获取签名消息
- `POST /api/v1/auth/verify` - 验证签名并登录

**用户相关**:
- `GET /api/v1/user/me` - 获取当前用户信息
- `PATCH /api/v1/user/me` - 更新用户信息

**智能账户**:
- `GET /api/v1/smart-accounts` - 获取账户列表
- `POST /api/v1/smart-accounts` - 创建智能账户
- `GET /api/v1/smart-accounts/:id` - 获取账户详情

**事件订阅**:
- `GET /api/v1/subscriptions` - 获取订阅列表
- `POST /api/v1/subscriptions` - 创建订阅
- `PATCH /api/v1/subscriptions/:id` - 更新订阅
- `DELETE /api/v1/subscriptions/:id` - 删除订阅

**通知**:
- `GET /api/v1/notifications` - 获取通知列表
- `PATCH /api/v1/notifications/:id/read` - 标记已读
- `POST /api/v1/notifications/read-all` - 全部标记已读

**自动化规则**:
- `GET /api/v1/automation-rules` - 获取规则列表
- `POST /api/v1/automation-rules` - 创建规则
- `PATCH /api/v1/automation-rules/:id` - 更新规则
- `DELETE /api/v1/automation-rules/:id` - 删除规则

## 🔒 安全设计

### 认证流程

1. 用户连接钱包
2. 请求签名消息 (`/api/v1/auth/message`)
3. 用户签名消息
4. 验证签名并获取 JWT (`/api/v1/auth/verify`)
5. 后续请求携带 JWT Token

### JWT 验证

```typescript
// middleware/auth.middleware.ts
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid token' }
    })
  }
}
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit'

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED' } }
})
```

## 📊 数据库操作

### Prisma ORM

```typescript
// services/user.service.ts
export class UserService {
  async findByWalletAddress(walletAddress: string) {
    return await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() }
    })
  }
  
  async createUser(data: CreateUserDto) {
    return await prisma.user.create({
      data: {
        walletAddress: data.walletAddress.toLowerCase(),
        ensName: data.ensName
      }
    })
  }
}
```

### 字段命名转换

- **数据库**: snake_case (`wallet_address`, `created_at`)
- **API**: camelCase (`walletAddress`, `createdAt`)
- Prisma 自动处理转换

## 🔌 WebSocket 集成

### Socket.IO 服务器

```typescript
// websocket/index.ts
import { Server } from 'socket.io'

export function initializeWebSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL }
  })
  
  // 认证中间件
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!)
      socket.data.user = decoded
      next()
    } catch {
      next(new Error('Authentication failed'))
    }
  })
  
  // 连接处理
  io.on('connection', (socket) => {
    const userId = socket.data.user.userId
    socket.join(`user:${userId}`)
    
    // 事件监听
    socket.on('subscribe', handleSubscribe)
    socket.on('disconnect', handleDisconnect)
  })
  
  return io
}
```

## 🧪 测试

### 单元测试

```bash
npm test
```

### 集成测试

```bash
npm run test:integration
```

### 测试覆盖率

```bash
npm run test:coverage
```

目标覆盖率: > 80%

## 📚 开发规范

### 代码风格

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化

### 命名规范

- 文件名: kebab-case (`auth.service.ts`)
- 类名: PascalCase (`AuthService`)
- 函数名: camelCase (`verifySignature`)
- 常量: UPPER_SNAKE_CASE (`JWT_SECRET`)

### 错误处理

```typescript
// 使用自定义错误类
class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message)
    this.name = 'ValidationError'
  }
}

// 全局错误处理
app.use((err, req, res, next) => {
  logger.error(err)
  
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        details: err.details
      }
    })
  }
  
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An error occurred' }
  })
})
```

## 📖 参考文档

- [API 设计文档](../docs/API设计.md)
- [数据库设计文档](../docs/数据库设计.md)
- [系统技术架构](../docs/系统技术架构.md)
- [开发任务清单](../docs/开发任务清单.md)

## 🤝 开发团队

- **后端负责人**: _待分配_
- **技术栈**: Node.js 20, Express 4, TypeScript 5, Prisma 5

## 📄 许可证

MIT

---

**最后更新**: 2025-10-11  
**版本**: v1.0.0  
**状态**: ⬜ 待开发

