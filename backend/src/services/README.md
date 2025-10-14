# Services 服务层

## 📋 功能说明

Services 层包含所有业务逻辑，负责数据处理、第三方 API 调用、数据库操作等核心功能。

## 🎯 职责

- 实现业务逻辑
- 数据库操作（通过 Prisma）
- 第三方 API 调用
- 数据验证和转换
- 错误处理
- 事务管理

## 📁 文件列表

| 文件 | 功能 | 状态 |
|------|------|------|
| `auth.service.ts` | 认证服务（签名验证、JWT 生成） | ⬜ 待实现 |
| `user.service.ts` | 用户管理服务 | ⬜ 待实现 |
| `smart-account.service.ts` | 智能账户服务（Stackup SDK） | ⬜ 待实现 |
| `event.service.ts` | 事件服务（事件缓存同步） | ⬜ 待实现 |
| `notification.service.ts` | 通知服务（推送逻辑） | ⬜ 待实现 |
| `automation.service.ts` | 自动化规则服务（规则引擎） | ⬜ 待实现 |
| `telegram.service.ts` | Telegram Bot 服务 | ⬜ 待实现 |
| `discord.service.ts` | Discord Webhook 服务 | ⬜ 待实现 |
| `envio.service.ts` | Envio GraphQL 客户端服务 | ⬜ 待实现 |

## 💡 代码示例

```typescript
// auth.service.ts
import { verifyMessage } from 'ethers'
import jwt from 'jsonwebtoken'
import { prisma } from '../utils/prisma'

export class AuthService {
  // 生成签名消息
  async generateMessage(walletAddress: string): Promise<string> {
    const timestamp = Date.now()
    return `Sign this message to authenticate with ChainPulse\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}`
  }
  
  // 验证签名并登录
  async verifyAndLogin(walletAddress: string, message: string, signature: string) {
    // 1. 验证签名
    const recoveredAddress = verifyMessage(message, signature)
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new Error('Invalid signature')
    }
    
    // 2. 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() }
    })
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: walletAddress.toLowerCase()
        }
      })
    }
    
    // 3. 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })
    
    // 4. 生成 JWT
    const token = jwt.sign(
      { userId: user.id, walletAddress: user.walletAddress },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
    
    return {
      token,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        ensName: user.ensName
      }
    }
  }
}

export const authService = new AuthService()
```

## 🔗 相关文档

- [Controllers 层](../controllers/README.md)
- [数据库设计文档](../../../docs/数据库设计.md)
- [API 设计文档](../../../docs/API设计.md)

