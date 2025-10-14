# Middleware 中间件层

## 📋 功能说明

Middleware 层提供各种中间件函数，用于请求预处理、认证、验证、日志记录、错误处理等。

## 🎯 职责

- JWT 认证验证
- 请求数据验证
- API 限流
- 请求日志记录
- 错误处理
- CORS 配置

## 📁 文件列表

| 文件 | 功能 | 状态 |
|------|------|------|
| `auth.middleware.ts` | JWT 认证中间件 | ⬜ 待实现 |
| `validation.middleware.ts` | 请求数据验证中间件（Zod） | ⬜ 待实现 |
| `error.middleware.ts` | 全局错误处理中间件 | ⬜ 待实现 |
| `logger.middleware.ts` | 请求日志中间件 | ⬜ 待实现 |
| `rate-limit.middleware.ts` | API 限流中间件 | ⬜ 待实现 |
| `cors.middleware.ts` | CORS 配置中间件 | ⬜ 待实现 |

## 💡 代码示例

### 认证中间件

```typescript
// auth.middleware.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No token provided' }
      })
    }
    
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

### 验证中间件

```typescript
// validation.middleware.ts
import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      })
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors
          }
        })
      }
      next(error)
    }
  }
}
```

### 限流中间件

```typescript
// rate-limit.middleware.ts
import rateLimit from 'express-rate-limit'

export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  }
})

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
})
```

### 错误处理中间件

```typescript
// error.middleware.ts
import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err)
  
  // 自定义错误类型处理
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message
      }
    })
  }
  
  // 默认错误处理
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An error occurred'
        : err.message
    }
  })
}
```

## 🔗 相关文档

- [Routes 层](../routes/README.md)
- [Utils 工具](../utils/README.md)

