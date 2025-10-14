import { Request, Response, NextFunction } from 'express'
import { authService } from '../services/auth.service'
import { ResponseFormatter } from '../utils/response'

export class AuthController {
  /**
   * 获取签名消息
   * POST /api/v1/auth/message
   */
  async getMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { walletAddress } = req.body

      const message = await authService.generateMessage(walletAddress)

      return res.status(200).json(
        ResponseFormatter.success({ message })
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * 验证签名并登录
   * POST /api/v1/auth/verify
   */
  async verifySignature(req: Request, res: Response, next: NextFunction) {
    try {
      const { walletAddress, message, signature } = req.body

      const result = await authService.verifyAndLogin(
        walletAddress,
        message,
        signature
      )

      return res.status(200).json(ResponseFormatter.success(result))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取当前用户信息
   * GET /api/v1/auth/me
   */
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      // user 信息已通过 authMiddleware 附加到 req.user
      return res.status(200).json(
        ResponseFormatter.success(req.user)
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * 退出登录
   * POST /api/v1/auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId

      await authService.logout(userId)

      return res.status(200).json(
        ResponseFormatter.success({ message: 'Logged out successfully' })
      )
    } catch (error) {
      next(error)
    }
  }
}

export const authController = new AuthController()

