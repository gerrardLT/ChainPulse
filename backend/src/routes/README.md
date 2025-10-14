# Routes 路由层

## 📋 功能说明

Routes 层定义 API 端点，连接 HTTP 请求到对应的 Controller，并应用中间件（认证、验证、限流等）。

## 🎯 职责

- 定义 API 端点
- 应用中间件（认证、验证、限流）
- 路由参数验证
- 将请求转发到 Controller

## 📁 文件列表

| 文件 | 端点前缀 | 状态 |
|------|----------|------|
| `auth.routes.ts` | `/api/v1/auth` | ⬜ 待实现 |
| `user.routes.ts` | `/api/v1/user` | ⬜ 待实现 |
| `smart-account.routes.ts` | `/api/v1/smart-accounts` | ⬜ 待实现 |
| `subscription.routes.ts` | `/api/v1/subscriptions` | ⬜ 待实现 |
| `notification.routes.ts` | `/api/v1/notifications` | ⬜ 待实现 |
| `automation.routes.ts` | `/api/v1/automation-rules` | ⬜ 待实现 |
| `integration.routes.ts` | `/api/v1/integrations` | ⬜ 待实现 |
| `stats.routes.ts` | `/api/v1/stats` | ⬜ 待实现 |

## 💡 代码示例

```typescript
// auth.routes.ts
import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { validate } from '../middleware/validation.middleware'
import { authLimiter } from '../middleware/rate-limit.middleware'
import { z } from 'zod'

const router = Router()

// 验证 schemas
const getMessageSchema = z.object({
  body: z.object({
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/)
  })
})

const verifySignatureSchema = z.object({
  body: z.object({
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    message: z.string(),
    signature: z.string()
  })
})

// 路由定义
router.post(
  '/message',
  authLimiter,
  validate(getMessageSchema),
  authController.getMessage
)

router.post(
  '/verify',
  authLimiter,
  validate(verifySignatureSchema),
  authController.verifySignature
)

export default router
```

## 🔗 相关文档

- [Controllers 层](../controllers/README.md)
- [Middleware 层](../middleware/README.md)
- [API 设计文档](../../../docs/API设计.md)

