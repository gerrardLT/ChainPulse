# Types TypeScript 类型定义

## 📋 功能说明

Types 层定义整个后端应用的 TypeScript 类型、接口和枚举，确保类型安全。

## 🎯 职责

- 定义 API 请求/响应类型
- 定义业务实体类型
- 定义枚举类型
- 扩展第三方库类型
- 提供类型安全保障

## 📁 文件列表

| 文件 | 功能 | 状态 |
|------|------|------|
| `index.ts` | 导出所有类型 | ⬜ 待实现 |
| `api.types.ts` | API 请求/响应类型 | ⬜ 待实现 |
| `user.types.ts` | 用户相关类型 | ⬜ 待实现 |
| `event.types.ts` | 事件相关类型 | ⬜ 待实现 |
| `notification.types.ts` | 通知相关类型 | ⬜ 待实现 |
| `automation.types.ts` | 自动化规则类型 | ⬜ 待实现 |
| `express.d.ts` | Express 类型扩展 | ⬜ 待实现 |

## 💡 代码示例

### API 类型

```typescript
// api.types.ts
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
```

### 用户类型

```typescript
// user.types.ts
export interface User {
  id: string
  walletAddress: string
  ensName: string | null
  avatarUrl: string | null
  email: string | null
  isActive: boolean
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserDto {
  walletAddress: string
  ensName?: string
  avatarUrl?: string
}

export interface UpdateUserDto {
  ensName?: string
  avatarUrl?: string
  email?: string
}
```

### 事件类型

```typescript
// event.types.ts
export enum EventType {
  TRANSFER = 'Transfer',
  APPROVAL = 'Approval',
  SWAP = 'Swap',
  MINT = 'Mint',
  BURN = 'Burn',
  CUSTOM = 'Custom'
}

export interface BlockchainEvent {
  id: string
  chainId: number
  contractAddress: string
  eventType: EventType
  transactionHash: string
  blockNumber: number
  blockTimestamp: Date
  data: any
}

export interface EventSubscription {
  id: string
  userId: string
  smartAccountId: string | null
  chainId: number
  contractAddress: string
  eventType: string
  filterConditions: any
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Express 类型扩展

```typescript
// express.d.ts
import { User } from './user.types'

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        walletAddress: string
      }
    }
  }
}
```

### 通知类型

```typescript
// notification.types.ts
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum NotificationChannel {
  WEB = 'web',
  TELEGRAM = 'telegram',
  DISCORD = 'discord',
  EMAIL = 'email'
}

export interface Notification {
  id: string
  userId: string
  eventId: string | null
  title: string
  message: string
  priority: NotificationPriority
  channel: NotificationChannel
  isRead: boolean
  metadata: any
  createdAt: Date
}
```

## 🔗 相关文档

- [Services 层](../services/README.md)
- [API 设计文档](../../../docs/API设计.md)
- [数据库设计文档](../../../docs/数据库设计.md)

