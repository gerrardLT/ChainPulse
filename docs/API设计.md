# API 设计文档

## 项目名称：ChainPulse - 实时链上事件通知与可视化系统

---

## 1. API 概览

### 1.1 API 架构

ChainPulse 采用混合 API 架构：
- **REST API**：用户认证、配置管理等传统 CRUD 操作
- **GraphQL API**：事件查询、数据聚合等复杂查询
- **WebSocket API**：实时事件推送和双向通信

### 1.2 API 基础信息

| 项目 | 信息 |
|------|------|
| 基础 URL | `https://api.chainpulse.app` |
| GraphQL Endpoint | `https://api.chainpulse.app/graphql` |
| WebSocket URL | `wss://api.chainpulse.app/socket` |
| API 版本 | v1 |
| 数据格式 | JSON |
| 编码 | UTF-8 |
| 时区 | UTC |

### 1.3 认证方式

**JWT Bearer Token**：
```http
Authorization: Bearer <jwt_token>
```

### 1.4 字段命名规范

**API 层与数据库层命名转换**：

- **API/前端**：使用 `camelCase` 驼峰命名
  - 示例：`walletAddress`, `ensName`, `isActive`, `createdAt`
  
- **数据库层**：使用 `snake_case` 下划线命名
  - 示例：`wallet_address`, `ens_name`, `is_active`, `created_at`

**转换规则**：
- 后端 ORM（如 Prisma）自动处理命名转换
- API 响应中所有字段使用 camelCase
- 数据库表和列使用 snake_case
- GraphQL Schema 使用 camelCase

**示例对照表**：

| API 字段 (camelCase) | 数据库字段 (snake_case) |
|---------------------|----------------------|
| walletAddress | wallet_address |
| ensName | ens_name |
| avatarUrl | avatar_url |
| isActive | is_active |
| lastLoginAt | last_login_at |
| createdAt | created_at |
| updatedAt | updated_at |
| smartAccountId | smart_account_id |
| accountAddress | account_address |
| chainId | chain_id |
| isDeployed | is_deployed |
| deploymentTxHash | deployment_tx_hash |
| notificationChannels | notification_channels |
| filterConditions | filter_conditions |

---

## 2. REST API 设计

### 2.1 认证相关 API

#### 2.1.1 请求签名消息

**端点**：`POST /api/v1/auth/message`

**描述**：获取用于钱包签名的消息

**请求**：
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**响应**：
```json
{
  "message": "Sign this message to authenticate with ChainPulse.\n\nNonce: 1a2b3c4d5e",
  "nonce": "1a2b3c4d5e",
  "expiresAt": "2025-10-11T15:00:00Z"
}
```

**状态码**：
- `200 OK`：成功
- `400 Bad Request`：无效的钱包地址格式

---

#### 2.1.2 验证签名并登录

**端点**：`POST /api/v1/auth/verify`

**描述**：验证签名并返回 JWT Token

**请求**：
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "0xabcdef...",
  "nonce": "1a2b3c4d5e"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2025-10-18T14:00:00Z",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "ensName": "vitalik.eth",
      "createdAt": "2025-10-01T10:00:00Z"
    }
  }
}
```

**状态码**：
- `200 OK`：认证成功
- `401 Unauthorized`：签名验证失败
- `400 Bad Request`：请求参数错误

---

#### 2.1.3 刷新 Token

**端点**：`POST /api/v1/auth/refresh`

**描述**：使用现有 Token 刷新获取新 Token

**请求头**：
```http
Authorization: Bearer <current_token>
```

**响应**：
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2025-10-18T14:00:00Z"
  }
}
```

**状态码**：
- `200 OK`：刷新成功
- `401 Unauthorized`：Token 无效或已过期

---

### 2.2 用户相关 API

#### 2.2.1 获取当前用户信息

**端点**：`GET /api/v1/user/me`

**描述**：获取当前登录用户的详细信息

**请求头**：
```http
Authorization: Bearer <jwt_token>
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "ensName": "vitalik.eth",
    "email": "user@example.com",
    "avatarUrl": "https://cdn.chainpulse.app/avatars/550e8400.png",
    "isActive": true,
    "lastLoginAt": "2025-10-11T14:00:00Z",
    "createdAt": "2025-10-01T10:00:00Z"
  }
}
```

**状态码**：
- `200 OK`：成功
- `401 Unauthorized`：未认证

---

#### 2.2.2 更新用户信息

**端点**：`PATCH /api/v1/user/me`

**描述**：更新当前用户的信息

**请求**：
```json
{
  "email": "newemail@example.com",
  "avatarUrl": "https://example.com/avatar.png"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "email": "newemail@example.com",
    "avatarUrl": "https://example.com/avatar.png",
    "updatedAt": "2025-10-11T14:30:00Z"
  }
}
```

**状态码**：
- `200 OK`：更新成功
- `400 Bad Request`：无效的参数
- `401 Unauthorized`：未认证

---

### 2.3 智能账户相关 API

#### 2.3.1 创建智能账户

**端点**：`POST /api/v1/smart-accounts`

**描述**：为当前用户创建智能账户

**请求**：
```json
{
  "chainId": 1,
  "accountType": "erc4337"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440111",
    "accountAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "ownerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "chainId": 1,
    "accountType": "erc4337",
    "isDeployed": false,
    "createdAt": "2025-10-11T14:00:00Z"
  }
}
```

**状态码**：
- `201 Created`：创建成功
- `400 Bad Request`：参数错误
- `401 Unauthorized`：未认证
- `409 Conflict`：该链上已存在智能账户

---

#### 2.3.2 获取智能账户列表

**端点**：`GET /api/v1/smart-accounts`

**描述**：获取当前用户的所有智能账户

**查询参数**：
- `chainId`（可选）：按链 ID 过滤

**响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440111",
      "accountAddress": "0x1234567890abcdef1234567890abcdef12345678",
      "ownerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "chainId": 1,
      "accountType": "erc4337",
      "isDeployed": true,
      "deploymentTxHash": "0xabcdef1234567890...",
      "createdAt": "2025-10-11T14:00:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

**状态码**：
- `200 OK`：成功
- `401 Unauthorized`：未认证

---

#### 2.3.3 获取智能账户详情

**端点**：`GET /api/v1/smart-accounts/:accountId`

**描述**：获取指定智能账户的详细信息

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440111",
    "accountAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "ownerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "chainId": 1,
    "accountType": "erc4337",
    "isDeployed": true,
    "deploymentTxHash": "0xabcdef1234567890...",
    "balance": "1.5",
    "transactionCount": 42,
    "createdAt": "2025-10-11T14:00:00Z"
  }
}
```

**状态码**：
- `200 OK`：成功
- `404 Not Found`：账户不存在
- `401 Unauthorized`：未认证
- `403 Forbidden`：无权限访问

---

### 2.4 事件订阅相关 API

#### 2.4.1 获取订阅列表

**端点**：`GET /api/v1/subscriptions`

**描述**：获取当前用户的所有事件订阅

**查询参数**：
- `isEnabled`（可选）：`true` 或 `false`

**响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440222",
      "eventType": "Transfer",
      "contractAddress": null,
      "chainId": 1,
      "isEnabled": true,
      "notificationChannels": {
        "browser": true,
        "telegram": true,
        "discord": false
      },
      "filterConditions": {
        "minAmount": "1000000000000000000"
      },
      "createdAt": "2025-10-11T14:00:00Z"
    }
  ]
}
```

**状态码**：
- `200 OK`：成功
- `401 Unauthorized`：未认证

---

#### 2.4.2 创建订阅

**端点**：`POST /api/v1/subscriptions`

**描述**：创建新的事件订阅

**请求**：
```json
{
  "eventType": "Transfer",
  "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
  "chainId": 1,
  "notificationChannels": {
    "browser": true,
    "telegram": true
  },
  "filterConditions": {
    "minAmount": "1000000000000000000"
  }
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440222",
    "eventType": "Transfer",
    "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",
    "chainId": 1,
    "isEnabled": true,
    "notificationChannels": {
      "browser": true,
      "telegram": true,
      "discord": false
    },
    "filterConditions": {
      "minAmount": "1000000000000000000"
    },
    "createdAt": "2025-10-11T14:00:00Z"
  }
}
```

**状态码**：
- `201 Created`：创建成功
- `400 Bad Request`：参数错误
- `401 Unauthorized`：未认证
- `409 Conflict`：订阅已存在

---

#### 2.4.3 更新订阅

**端点**：`PATCH /api/v1/subscriptions/:subscriptionId`

**描述**：更新现有订阅配置

**请求**：
```json
{
  "isEnabled": false,
  "notificationChannels": {
    "browser": true,
    "telegram": false
  }
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440222",
    "isEnabled": false,
    "notificationChannels": {
      "browser": true,
      "telegram": false,
      "discord": false
    },
    "updatedAt": "2025-10-11T15:00:00Z"
  }
}
```

**状态码**：
- `200 OK`：更新成功
- `404 Not Found`：订阅不存在
- `401 Unauthorized`：未认证
- `403 Forbidden`：无权限

---

#### 2.4.4 删除订阅

**端点**：`DELETE /api/v1/subscriptions/:subscriptionId`

**描述**：删除指定订阅

**响应**：
```json
{
  "success": true,
  "message": "Subscription deleted successfully"
}
```

**状态码**：
- `200 OK`：删除成功
- `404 Not Found`：订阅不存在
- `401 Unauthorized`：未认证

---

### 2.5 通知相关 API

#### 2.5.1 获取通知列表

**端点**：`GET /api/v1/notifications`

**描述**：获取当前用户的通知列表

**查询参数**：
- `isRead`（可选）：`true` 或 `false`
- `eventType`（可选）：事件类型过滤
- `page`（可选）：页码，默认 1
- `pageSize`（可选）：每页数量，默认 20

**响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440333",
      "eventId": "0xabcdef1234567890...",
      "eventType": "Transfer",
      "title": "Token Received",
      "content": "You received 100 USDC from 0x1a2b...",
      "metadata": {
        "amount": "100000000",
        "token": "USDC",
        "from": "0x1a2b3c4d...",
        "txHash": "0xabcdef..."
      },
      "isRead": false,
      "priority": "normal",
      "createdAt": "2025-10-11T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8
  }
}
```

**状态码**：
- `200 OK`：成功
- `401 Unauthorized`：未认证

---

#### 2.5.2 标记通知为已读

**端点**：`PATCH /api/v1/notifications/:notificationId/read`

**描述**：标记单个通知为已读

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440333",
    "isRead": true,
    "readAt": "2025-10-11T15:00:00Z"
  }
}
```

**状态码**：
- `200 OK`：成功
- `404 Not Found`：通知不存在
- `401 Unauthorized`：未认证

---

#### 2.5.3 标记所有通知为已读

**端点**：`POST /api/v1/notifications/read-all`

**描述**：标记所有未读通知为已读

**响应**：
```json
{
  "success": true,
  "data": {
    "updatedCount": 12
  }
}
```

**状态码**：
- `200 OK`：成功
- `401 Unauthorized`：未认证

---

#### 2.5.4 删除通知

**端点**：`DELETE /api/v1/notifications/:notificationId`

**描述**：删除指定通知

**响应**：
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

**状态码**：
- `200 OK`：删除成功
- `404 Not Found`：通知不存在
- `401 Unauthorized`：未认证

---

### 2.6 自动化规则相关 API

#### 2.6.1 获取规则列表

**端点**：`GET /api/v1/automation-rules`

**描述**：获取当前用户的自动化规则列表

**响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440444",
      "smartAccountId": "660e8400-e29b-41d4-a716-446655440111",
      "ruleName": "Auto Stake Large Deposits",
      "description": "Automatically stake 50% when receiving > 10 ETH",
      "triggerEvent": "Transfer",
      "triggerConditions": {
        "minAmount": "10000000000000000000",
        "token": "ETH"
      },
      "actionType": "stake",
      "actionParams": {
        "protocol": "lido",
        "percentage": 50
      },
      "isEnabled": true,
      "executionCount": 5,
      "lastExecutedAt": "2025-10-10T12:00:00Z",
      "createdAt": "2025-10-01T10:00:00Z"
    }
  ]
}
```

**状态码**：
- `200 OK`：成功
- `401 Unauthorized`：未认证

---

#### 2.6.2 创建规则

**端点**：`POST /api/v1/automation-rules`

**描述**：创建新的自动化规则

**请求**：
```json
{
  "smartAccountId": "660e8400-e29b-41d4-a716-446655440111",
  "ruleName": "Auto Stake Large Deposits",
  "description": "Automatically stake 50% when receiving > 10 ETH",
  "triggerEvent": "Transfer",
  "triggerConditions": {
    "minAmount": "10000000000000000000",
    "token": "ETH"
  },
  "actionType": "stake",
  "actionParams": {
    "protocol": "lido",
    "percentage": 50
  }
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440444",
    "ruleName": "Auto Stake Large Deposits",
    "isEnabled": true,
    "createdAt": "2025-10-11T14:00:00Z"
  }
}
```

**状态码**：
- `201 Created`：创建成功
- `400 Bad Request`：参数错误
- `401 Unauthorized`：未认证

---

#### 2.6.3 更新规则

**端点**：`PATCH /api/v1/automation-rules/:ruleId`

**描述**：更新现有规则

**请求**：
```json
{
  "isEnabled": false,
  "triggerConditions": {
    "minAmount": "20000000000000000000"
  }
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440444",
    "isEnabled": false,
    "triggerConditions": {
      "minAmount": "20000000000000000000",
      "token": "ETH"
    },
    "updatedAt": "2025-10-11T15:00:00Z"
  }
}
```

**状态码**：
- `200 OK`：更新成功
- `404 Not Found`：规则不存在
- `401 Unauthorized`：未认证

---

#### 2.6.4 删除规则

**端点**：`DELETE /api/v1/automation-rules/:ruleId`

**描述**：删除指定规则

**响应**：
```json
{
  "success": true,
  "message": "Automation rule deleted successfully"
}
```

**状态码**：
- `200 OK`：删除成功
- `404 Not Found`：规则不存在
- `401 Unauthorized`：未认证

---

### 2.7 第三方集成 API

#### 2.7.1 生成 Telegram 绑定码

**端点**：`POST /api/v1/integrations/telegram/bind`

**描述**：生成用于绑定 Telegram 的验证码

**响应**：
```json
{
  "success": true,
  "data": {
    "bindingCode": "ABC123",
    "botUsername": "ChainPulseBot",
    "deepLink": "https://t.me/ChainPulseBot?start=ABC123",
    "expiresAt": "2025-10-11T15:00:00Z"
  }
}
```

**状态码**：
- `200 OK`：成功
- `401 Unauthorized`：未认证

---

#### 2.7.2 获取 Telegram 绑定状态

**端点**：`GET /api/v1/integrations/telegram/status`

**描述**：查询 Telegram 绑定状态

**响应**：
```json
{
  "success": true,
  "data": {
    "isConnected": true,
    "chatId": 123456789,
    "username": "@username",
    "verifiedAt": "2025-10-11T14:30:00Z"
  }
}
```

**状态码**：
- `200 OK`：成功
- `401 Unauthorized`：未认证

---

#### 2.7.3 解绑 Telegram

**端点**：`DELETE /api/v1/integrations/telegram`

**描述**：解除 Telegram 绑定

**响应**：
```json
{
  "success": true,
  "message": "Telegram disconnected successfully"
}
```

**状态码**：
- `200 OK`：成功
- `401 Unauthorized`：未认证

---

#### 2.7.4 配置 Discord Webhook

**端点**：`POST /api/v1/integrations/discord`

**描述**：配置 Discord Webhook

**请求**：
```json
{
  "webhookUrl": "https://discord.com/api/webhooks/123456/abcdef"
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440555",
    "webhookUrl": "https://discord.com/api/webhooks/123456/abcdef",
    "webhookName": "ChainPulse",
    "isVerified": true,
    "createdAt": "2025-10-11T14:00:00Z"
  }
}
```

**状态码**：
- `200 OK`：配置成功
- `400 Bad Request`：无效的 Webhook URL
- `401 Unauthorized`：未认证

---

#### 2.7.5 删除 Discord 配置

**端点**：`DELETE /api/v1/integrations/discord`

**描述**：删除 Discord Webhook 配置

**响应**：
```json
{
  "success": true,
  "message": "Discord webhook deleted successfully"
}
```

**状态码**：
- `200 OK`：删除成功
- `401 Unauthorized`：未认证

---

### 2.8 统计数据 API

#### 2.8.1 获取用户统计

**端点**：`GET /api/v1/stats/user`

**描述**：获取当前用户的统计数据

**响应**：
```json
{
  "success": true,
  "data": {
    "totalNotifications": 156,
    "unreadNotifications": 12,
    "smartAccountsCount": 2,
    "subscriptionsCount": 8,
    "automationRulesCount": 3,
    "totalEventsReceived": 420
  }
}
```

**状态码**：
- `200 OK`：成功
- `401 Unauthorized`：未认证

---

#### 2.8.2 获取事件统计

**端点**：`GET /api/v1/stats/events`

**描述**：获取事件统计数据

**查询参数**：
- `chainId`（可选）：链 ID
- `timeRange`（可选）：`24h`, `7d`, `30d`

**响应**：
```json
{
  "success": true,
  "data": {
    "timeRange": "24h",
    "totalEvents": 1234,
    "eventsByType": {
      "Transfer": 800,
      "Stake": 200,
      "Swap": 150,
      "NFTReceived": 84
    },
    "uniqueAddresses": 567,
    "totalGasUsed": "15000000000000000"
  }
}
```

**状态码**：
- `200 OK`：成功
- `401 Unauthorized`：未认证

---

## 3. GraphQL API 设计

### 3.1 GraphQL Schema

```graphql
type Query {
  # 事件查询
  events(
    filter: EventFilter
    pagination: PaginationInput
    orderBy: EventOrderBy
  ): EventConnection!
  
  event(id: ID!): Event
  
  # 用户查询
  user(id: ID!): User
  currentUser: User
  
  # 智能账户查询
  smartAccount(id: ID!): SmartAccount
  smartAccounts(userId: ID!): [SmartAccount!]!
  
  # 统计数据
  eventStats(timeRange: TimeRange!, chainId: Int): EventStats!
}

type Mutation {
  # 订阅管理
  createSubscription(input: CreateSubscriptionInput!): Subscription!
  updateSubscription(id: ID!, input: UpdateSubscriptionInput!): Subscription!
  deleteSubscription(id: ID!): Boolean!
  
  # 自动化规则
  createAutomationRule(input: CreateRuleInput!): AutomationRule!
  updateAutomationRule(id: ID!, input: UpdateRuleInput!): AutomationRule!
  deleteAutomationRule(id: ID!): Boolean!
}

type Subscription {
  # 实时事件订阅
  eventCreated(userId: ID!): Event!
  notificationCreated(userId: ID!): Notification!
}

# 事件类型
type Event {
  id: ID!
  txHash: String!
  blockNumber: Int!
  blockTimestamp: DateTime!
  chainId: Int!
  contractAddress: String!
  eventType: String!
  fromAddress: String
  toAddress: String
  amount: String
  tokenAddress: String
  gasUsed: Int
  gasPrice: Int
  status: EventStatus!
  rawData: JSON
  createdAt: DateTime!
}

enum EventStatus {
  SUCCESS
  FAILED
  PENDING
}

# 事件过滤器
input EventFilter {
  txHash: String
  chainId: Int
  eventType: String
  fromAddress: String
  toAddress: String
  contractAddress: String
  startTime: DateTime
  endTime: DateTime
  status: EventStatus
}

# 分页输入
input PaginationInput {
  page: Int
  pageSize: Int
}

# 排序
input EventOrderBy {
  field: EventOrderField!
  direction: OrderDirection!
}

enum EventOrderField {
  BLOCK_TIMESTAMP
  BLOCK_NUMBER
  CREATED_AT
}

enum OrderDirection {
  ASC
  DESC
}

# 事件连接（分页）
type EventConnection {
  edges: [EventEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type EventEdge {
  node: Event!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

# 用户类型
type User {
  id: ID!
  walletAddress: String!
  ensName: String
  email: String
  avatarUrl: String
  smartAccounts: [SmartAccount!]!
  subscriptions: [EventSubscription!]!
  notifications(isRead: Boolean): [Notification!]!
  createdAt: DateTime!
}

# 智能账户类型
type SmartAccount {
  id: ID!
  accountAddress: String!
  ownerAddress: String!
  chainId: Int!
  accountType: String!
  isDeployed: Boolean!
  deploymentTxHash: String
  automationRules: [AutomationRule!]!
  createdAt: DateTime!
}

# 事件订阅类型
type EventSubscription {
  id: ID!
  eventType: String!
  contractAddress: String
  chainId: Int!
  isEnabled: Boolean!
  notificationChannels: NotificationChannels!
  filterConditions: JSON
  createdAt: DateTime!
}

type NotificationChannels {
  browser: Boolean!
  telegram: Boolean!
  discord: Boolean!
}

# 通知类型
type Notification {
  id: ID!
  eventId: String!
  eventType: String!
  title: String!
  content: String!
  metadata: JSON
  isRead: Boolean!
  readAt: DateTime
  priority: NotificationPriority!
  createdAt: DateTime!
}

enum NotificationPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

# 自动化规则类型
type AutomationRule {
  id: ID!
  ruleName: String!
  description: String
  triggerEvent: String!
  triggerConditions: JSON!
  actionType: String!
  actionParams: JSON!
  isEnabled: Boolean!
  executionCount: Int!
  lastExecutedAt: DateTime
  createdAt: DateTime!
}

# 事件统计类型
type EventStats {
  timeRange: String!
  totalEvents: Int!
  eventsByType: [EventTypeCount!]!
  uniqueAddresses: Int!
  totalGasUsed: String!
}

type EventTypeCount {
  eventType: String!
  count: Int!
}

# 输入类型
input CreateSubscriptionInput {
  eventType: String!
  contractAddress: String
  chainId: Int!
  notificationChannels: NotificationChannelsInput!
  filterConditions: JSON
}

input NotificationChannelsInput {
  browser: Boolean
  telegram: Boolean
  discord: Boolean
}

input UpdateSubscriptionInput {
  isEnabled: Boolean
  notificationChannels: NotificationChannelsInput
  filterConditions: JSON
}

input CreateRuleInput {
  smartAccountId: ID!
  ruleName: String!
  description: String
  triggerEvent: String!
  triggerConditions: JSON!
  actionType: String!
  actionParams: JSON!
}

input UpdateRuleInput {
  ruleName: String
  description: String
  triggerConditions: JSON
  actionParams: JSON
  isEnabled: Boolean
}

enum TimeRange {
  HOUR_24
  DAYS_7
  DAYS_30
}

scalar DateTime
scalar JSON
```

### 3.2 自定义标量类型说明

#### DateTime 标量
**格式**: ISO 8601 日期时间字符串  
**时区**: UTC  
**示例**: `"2025-10-11T14:30:00Z"`

**实现方式**:
```javascript
// 使用 graphql-scalars 库
import { DateTimeResolver } from 'graphql-scalars';

const resolvers = {
  DateTime: DateTimeResolver,
  // ...
};
```

**序列化规则**:
- **输入**: 接受 ISO 8601 字符串或 JavaScript Date 对象
- **输出**: 返回 ISO 8601 字符串（UTC时区）
- **验证**: 自动验证日期格式有效性

#### JSON 标量
**格式**: 任意有效的 JSON 值（对象、数组、字符串、数字、布尔值或 null）  
**示例**: 
```json
{
  "minAmount": "1000000000000000000",
  "token": "ETH"
}
```

**实现方式**:
```javascript
// 使用 graphql-type-json 库
import GraphQLJSON from 'graphql-type-json';

const resolvers = {
  JSON: GraphQLJSON,
  // ...
};
```

**使用场景**:
- `filter_conditions`: 事件过滤条件
- `trigger_conditions`: 自动化规则触发条件
- `action_params`: 自动化规则操作参数
- `metadata`: 通知元数据
- `raw_data`: 原始事件数据
- `details`: 审计日志详情

---

### 3.3 GraphQL 查询示例

#### 3.3.1 查询事件列表

```graphql
query GetEvents($filter: EventFilter, $pagination: PaginationInput) {
  events(
    filter: $filter
    pagination: $pagination
    orderBy: { field: BLOCK_TIMESTAMP, direction: DESC }
  ) {
    edges {
      node {
        id
        txHash
        blockNumber
        blockTimestamp
        eventType
        fromAddress
        toAddress
        amount
        status
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
    totalCount
  }
}
```

**变量**：
```json
{
  "filter": {
    "chainId": 1,
    "eventType": "Transfer",
    "startTime": "2025-10-10T00:00:00Z",
    "endTime": "2025-10-11T23:59:59Z"
  },
  "pagination": {
    "page": 1,
    "pageSize": 20
  }
}
```

---

#### 3.3.2 查询当前用户信息

```graphql
query GetCurrentUser {
  currentUser {
    id
    walletAddress
    ensName
    email
    smartAccounts {
      id
      accountAddress
      chainId
      isDeployed
    }
    subscriptions {
      id
      eventType
      isEnabled
      notificationChannels {
        browser
        telegram
        discord
      }
    }
    notifications(isRead: false) {
      id
      title
      content
      priority
      createdAt
    }
  }
}
```

---

#### 3.3.3 查询事件统计

```graphql
query GetEventStats($timeRange: TimeRange!, $chainId: Int) {
  eventStats(timeRange: $timeRange, chainId: $chainId) {
    timeRange
    totalEvents
    eventsByType {
      eventType
      count
    }
    uniqueAddresses
    totalGasUsed
  }
}
```

**变量**：
```json
{
  "timeRange": "DAYS_7",
  "chainId": 1
}
```

---

### 3.4 GraphQL Mutation 示例

#### 3.4.1 创建订阅

```graphql
mutation CreateSubscription($input: CreateSubscriptionInput!) {
  createSubscription(input: $input) {
    id
    eventType
    chainId
    isEnabled
    notificationChannels {
      browser
      telegram
      discord
    }
  }
}
```

**变量**：
```json
{
  "input": {
    "eventType": "Transfer",
    "chainId": 1,
    "notificationChannels": {
      "browser": true,
      "telegram": true,
      "discord": false
    },
    "filterConditions": {
      "minAmount": "1000000000000000000"
    }
  }
}
```

---

### 3.5 GraphQL Subscription 示例

#### 3.5.1 订阅实时事件

```graphql
subscription OnEventCreated($userId: ID!) {
  eventCreated(userId: $userId) {
    id
    txHash
    eventType
    fromAddress
    toAddress
    amount
    blockTimestamp
  }
}
```

---

#### 3.5.2 订阅实时通知

```graphql
subscription OnNotificationCreated($userId: ID!) {
  notificationCreated(userId: $userId) {
    id
    eventType
    title
    content
    metadata
    priority
    createdAt
  }
}
```

---

## 4. WebSocket API 设计

### 4.1 连接建立

```javascript
// 客户端连接
const socket = io('wss://api.chainpulse.app', {
  auth: {
    token: 'jwt_token_here'
  }
});
```

### 4.2 事件定义

#### 4.2.1 客户端发送事件

| 事件名 | 参数 | 说明 |
|-------|------|------|
| `authenticate` | `{ token: string }` | 认证连接 |
| `subscribe` | `{ address: string }` | 订阅指定地址的事件 |
| `unsubscribe` | `{ address: string }` | 取消订阅 |
| `ping` | - | 心跳检测 |

#### 4.2.2 服务端发送事件

| 事件名 | 数据格式 | 说明 |
|-------|---------|------|
| `authenticated` | `{ success: boolean }` | 认证结果 |
| `subscribed` | `{ address: string }` | 订阅成功确认 |
| `event:new` | `Event` | 新事件推送 |
| `notification:new` | `Notification` | 新通知推送 |
| `error` | `{ code: string, message: string }` | 错误信息 |
| `pong` | - | 心跳响应 |

---

### 4.3 WebSocket 消息示例

#### 4.3.1 认证

**客户端发送**：
```json
{
  "event": "authenticate",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**服务端响应**：
```json
{
  "event": "authenticated",
  "data": {
    "success": true,
    "userId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

#### 4.3.2 订阅事件

**客户端发送**：
```json
{
  "event": "subscribe",
  "data": {
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }
}
```

**服务端确认**：
```json
{
  "event": "subscribed",
  "data": {
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }
}
```

---

#### 4.3.3 接收新事件

**服务端推送**：
```json
{
  "event": "event:new",
  "data": {
    "id": "event_123",
    "txHash": "0xabcdef1234567890...",
    "eventType": "Transfer",
    "fromAddress": "0x1a2b3c4d...",
    "toAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "amount": "100000000",
    "token": "USDC",
    "chainId": 1,
    "blockTimestamp": "2025-10-11T14:30:00Z"
  }
}
```

---

#### 4.3.4 接收新通知

**服务端推送**：
```json
{
  "event": "notification:new",
  "data": {
    "id": "notif_456",
    "title": "Token Received",
    "content": "You received 100 USDC",
    "eventType": "Transfer",
    "priority": "normal",
    "metadata": {
      "amount": "100",
      "token": "USDC",
      "txHash": "0xabcdef..."
    },
    "createdAt": "2025-10-11T14:30:00Z"
  }
}
```

---

## 5. 错误处理

### 5.1 REST API 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Invalid wallet address format",
    "details": {
      "field": "walletAddress",
      "value": "invalid_address"
    }
  }
}
```

### 5.2 常见错误码

| 错误码 | HTTP 状态码 | 说明 |
|--------|------------|------|
| `INVALID_PARAMETER` | 400 | 请求参数无效 |
| `MISSING_PARAMETER` | 400 | 缺少必需参数 |
| `UNAUTHORIZED` | 401 | 未认证或 Token 无效 |
| `FORBIDDEN` | 403 | 无权限访问资源 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `CONFLICT` | 409 | 资源冲突（如重复创建） |
| `RATE_LIMIT_EXCEEDED` | 429 | 请求频率超限 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |
| `SERVICE_UNAVAILABLE` | 503 | 服务暂时不可用 |

---

## 6. 速率限制

### 6.1 限流策略

| 端点类型 | 限制 |
|---------|------|
| 认证相关 | 10 次/分钟 |
| 查询接口 | 100 次/分钟 |
| 写入接口 | 30 次/分钟 |
| WebSocket 连接 | 5 次/分钟 |

### 6.2 限流响应头

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696176000
```

### 6.3 超限响应

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later",
    "retryAfter": 60
  }
}
```

---

## 7. API 版本管理

### 7.1 版本策略

- URL 路径版本：`/api/v1/...`
- 主要版本变更时递增
- 旧版本支持 6 个月过渡期

### 7.2 版本弃用通知

响应头中包含弃用警告：
```http
X-API-Deprecated: true
X-API-Sunset: 2026-04-11T00:00:00Z
X-API-Migration-Guide: https://docs.chainpulse.app/migration/v1-to-v2
```

---

## 8. API 文档和测试

### 8.1 API 文档地址

- **Swagger UI**：`https://api.chainpulse.app/docs`
- **GraphQL Playground**：`https://api.chainpulse.app/graphql`
- **Postman Collection**：可导出

### 8.2 测试环境

| 环境 | API 基础 URL |
|------|-------------|
| 开发 | `http://localhost:4000` |
| 测试 | `https://api-staging.chainpulse.app` |
| 生产 | `https://api.chainpulse.app` |

---

## 9. 总结

本 API 设计文档涵盖：

- ✅ **REST API**：18 个端点，覆盖所有核心功能
- ✅ **GraphQL API**：完整的 Schema 定义和查询示例
- ✅ **WebSocket API**：实时双向通信协议
- ✅ **认证机制**：基于 JWT 的安全认证
- ✅ **错误处理**：统一的错误响应格式
- ✅ **速率限制**：防止滥用的限流策略
- ✅ **版本管理**：平滑的版本升级方案

所有 API 设计遵循 RESTful 规范和 GraphQL 最佳实践，确保系统的可扩展性和易用性。

