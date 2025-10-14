# Utils 工具函数层

## 📋 功能说明

Utils 层提供各种通用工具函数，包括日志、JWT、验证、响应格式化、错误定义等。

## 🎯 职责

- 日志记录
- JWT 生成和验证
- 数据验证
- 响应格式化
- 错误类型定义
- 通用工具函数

## 📁 文件列表

| 文件 | 功能 | 状态 |
|------|------|------|
| `logger.ts` | Winston 日志工具 | ⬜ 待实现 |
| `jwt.ts` | JWT 工具函数 | ⬜ 待实现 |
| `validation.ts` | 数据验证工具 | ⬜ 待实现 |
| `response.ts` | 响应格式化工具 | ⬜ 待实现 |
| `errors.ts` | 自定义错误类型 | ⬜ 待实现 |
| `prisma.ts` | Prisma 客户端实例 | ⬜ 待实现 |

## 💡 代码示例

### 日志工具

```typescript
// logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
})
```

### 响应格式化

```typescript
// response.ts
export class ResponseFormatter {
  static success(data: any, pagination?: any) {
    return {
      success: true,
      data,
      ...(pagination && { pagination })
    }
  }
  
  static error(code: string, message: string, details?: any) {
    return {
      success: false,
      error: {
        code,
        message,
        ...(details && { details })
      }
    }
  }
}
```

### 自定义错误类型

```typescript
// errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super('AUTHENTICATION_ERROR', message, 401)
    this.name = 'AuthenticationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404)
    this.name = 'NotFoundError'
  }
}
```

### Prisma 客户端

```typescript
// prisma.ts
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error']
})
```

## 🔗 相关文档

- [Services 层](../services/README.md)
- [Middleware 层](../middleware/README.md)

