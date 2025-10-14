# Controllers 控制器层

## 📋 功能说明

Controllers 层负责处理 HTTP 请求，调用 Service 层的业务逻辑，并返回格式化的响应。

## 🎯 职责

- 接收和解析 HTTP 请求
- 调用 Service 层执行业务逻辑
- 格式化响应数据
- 处理 HTTP 状态码
- 不包含业务逻辑（业务逻辑在 Service 层）

## 📁 文件列表

| 文件 | 功能 | 状态 |
|------|------|------|
| `auth.controller.ts` | 用户认证控制器 | ⬜ 待实现 |
| `user.controller.ts` | 用户管理控制器 | ⬜ 待实现 |
| `smart-account.controller.ts` | 智能账户控制器 | ⬜ 待实现 |
| `subscription.controller.ts` | 事件订阅控制器 | ⬜ 待实现 |
| `notification.controller.ts` | 通知管理控制器 | ⬜ 待实现 |
| `automation.controller.ts` | 自动化规则控制器 | ⬜ 待实现 |
| `integration.controller.ts` | 第三方集成控制器 | ⬜ 待实现 |
| `stats.controller.ts` | 统计数据控制器 | ⬜ 待实现 |

## 💡 代码示例

```typescript
// auth.controller.ts
import { Request, Response } from 'express'
import { authService } from '../services/auth.service'

export class AuthController {
  // 获取签名消息
  async getMessage(req: Request, res: Response) {
    try {
      const { walletAddress } = req.body
      const message = await authService.generateMessage(walletAddress)
      
      return res.status(200).json({
        success: true,
        data: { message }
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message
        }
      })
    }
  }
  
  // 验证签名并登录
  async verifySignature(req: Request, res: Response) {
    try {
      const { walletAddress, message, signature } = req.body
      const result = await authService.verifyAndLogin(walletAddress, message, signature)
      
      return res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Signature verification failed'
        }
      })
    }
  }
}

export const authController = new AuthController()
```

## 🔗 相关文档

- [Services 层](../services/README.md)
- [Routes 层](../routes/README.md)
- [API 设计文档](../../../docs/API设计.md)

