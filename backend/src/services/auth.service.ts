import { verifyMessage } from 'ethers'
import jwt from 'jsonwebtoken'
import { prisma } from '../utils/prisma'
import { AuthenticationError, ValidationError } from '../utils/errors'
import { log } from '../utils/logger'

export class AuthService {
  /**
   * 生成签名消息
   */
  async generateMessage(walletAddress: string): Promise<string> {
    // 验证钱包地址格式
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      throw new ValidationError('Invalid wallet address format')
    }

    const timestamp = Date.now()
    const message = `Sign this message to authenticate with ChainPulse\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\n\nThis signature will not trigger any blockchain transaction or cost any gas fees.`

    log.debug(`Generated message for wallet: ${walletAddress}`)

    return message
  }

  /**
   * 验证签名并登录
   */
  async verifyAndLogin(
    walletAddress: string,
    message: string,
    signature: string
  ): Promise<{ token: string; user: any }> {
    try {
      // 1. 验证签名
      const recoveredAddress = verifyMessage(message, signature)

      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new AuthenticationError('Invalid signature')
      }

      log.info(`Signature verified for wallet: ${walletAddress}`)

      // 2. 查找或创建用户
      let user = await prisma.user.findUnique({
        where: { walletAddress: walletAddress.toLowerCase() },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            walletAddress: walletAddress.toLowerCase(),
          },
        })
        log.info(`New user created: ${user.id}`)
      } else {
        // 更新最后登录时间
        user = await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })
        log.info(`User logged in: ${user.id}`)
      }

      // 3. 生成 JWT
      const token = jwt.sign(
        {
          userId: user.id,
          walletAddress: user.walletAddress,
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        }
      )

      // 4. 保存会话记录（可选）
      // await prisma.userSession.create({
      //   data: {
      //     userId: user.id,
      //     jwtToken: token,
      //     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      //   },
      // })

      return {
        token,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          ensName: user.ensName,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
        },
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error
      }
      log.error('Authentication failed', error)
      throw new AuthenticationError('Authentication failed')
    }
  }

  /**
   * 验证 JWT Token
   */
  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!)
      return decoded
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token')
    }
  }

  /**
   * 退出登录（可选实现会话管理）
   */
  async logout(userId: string): Promise<void> {
    // 如果使用会话表，这里可以删除会话
    // await prisma.userSession.deleteMany({
    //   where: { userId, isActive: true },
    // })
    log.info(`User logged out: ${userId}`)
  }
}

export const authService = new AuthService()

