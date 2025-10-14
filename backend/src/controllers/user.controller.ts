import { Request, Response, NextFunction } from 'express'
import { userService } from '../services/user.service'
import { ResponseFormatter } from '../utils/response'

export class UserController {
  /**
   * 获取当前用户信息
   * GET /api/v1/users/me
   */
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId

      const user = await userService.getUserById(userId)

      return res.status(200).json(ResponseFormatter.success(user))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 更新当前用户信息
   * PATCH /api/v1/users/me
   */
  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { ensName, avatarUrl, email } = req.body

      const user = await userService.updateUser(userId, {
        ensName,
        avatarUrl,
        email,
      })

      return res.status(200).json(ResponseFormatter.success(user))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取用户统计信息
   * GET /api/v1/users/me/stats
   */
  async getMyStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId

      const stats = await userService.getUserStats(userId)

      return res.status(200).json(ResponseFormatter.success(stats))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 根据钱包地址获取用户信息（公开）
   * GET /api/v1/users/:walletAddress
   */
  async getUserByWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const { walletAddress } = req.params

      const user = await userService.getUserByWalletAddress(walletAddress)

      return res.status(200).json(ResponseFormatter.success(user))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 删除账户
   * DELETE /api/v1/users/me
   */
  async deleteMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId

      await userService.deleteUser(userId)

      return res.status(200).json(
        ResponseFormatter.success({ message: 'Account deleted successfully' })
      )
    } catch (error) {
      next(error)
    }
  }
}

export const userController = new UserController()

