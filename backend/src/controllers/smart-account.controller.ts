import { Request, Response, NextFunction } from 'express'
import { smartAccountService } from '../services/smart-account.service'
import { ResponseFormatter } from '../utils/response'

export class SmartAccountController {
  /**
   * 创建智能账户
   * POST /api/v1/smart-accounts
   */
  async createSmartAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { ownerAddress, chainId, accountType, accountAddress } = req.body

      console.log('[SmartAccountController] Creating account for user:', userId)
      console.log('[SmartAccountController] Request body:', req.body)
      console.log('[SmartAccountController] ownerAddress:', ownerAddress, 'type:', typeof ownerAddress)
      console.log('[SmartAccountController] chainId:', chainId, 'type:', typeof chainId)

      const smartAccount = await smartAccountService.createSmartAccount(userId, {
        ownerAddress,
        chainId,
        accountType,
        accountAddress,
      })

      return res.status(201).json(ResponseFormatter.success(smartAccount))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取用户的智能账户列表
   * GET /api/v1/smart-accounts
   */
  async getSmartAccounts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { chainId } = req.query

      console.log('[SmartAccountController] Getting accounts for user:', userId, 'chainId:', chainId)

      const accounts = await smartAccountService.getUserSmartAccounts(
        userId,
        chainId as number | undefined
      )

      console.log('[SmartAccountController] Found accounts:', accounts.length)
      return res.status(200).json(ResponseFormatter.success(accounts))
    } catch (error) {
      console.error('[SmartAccountController] Error getting accounts:', error)
      next(error)
    }
  }

  /**
   * 获取智能账户详情
   * GET /api/v1/smart-accounts/:id
   */
  async getSmartAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { id } = req.params

      const account = await smartAccountService.getSmartAccountById(id, userId)

      return res.status(200).json(ResponseFormatter.success(account))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 根据地址获取智能账户
   * GET /api/v1/smart-accounts/address/:address
   */
  async getSmartAccountByAddress(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user!.userId
      const { address } = req.params

      const account = await smartAccountService.getSmartAccountByAddress(
        address,
        userId
      )

      return res.status(200).json(ResponseFormatter.success(account))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 更新智能账户信息
   * PATCH /api/v1/smart-accounts/:id
   */
  async updateSmartAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { id } = req.params
      const { accountAddress, isDeployed, deploymentTxHash, balance } = req.body

      const account = await smartAccountService.updateSmartAccount(id, userId, {
        accountAddress,
        isDeployed,
        deploymentTxHash,
        balance,
      })

      return res.status(200).json(ResponseFormatter.success(account))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 删除智能账户
   * DELETE /api/v1/smart-accounts/:id
   */
  async deleteSmartAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { id } = req.params

      await smartAccountService.deleteSmartAccount(id, userId)

      return res.status(200).json(
        ResponseFormatter.success({ message: 'Smart account deleted successfully' })
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * 获取智能账户统计信息
   * GET /api/v1/smart-accounts/:id/stats
   */
  async getSmartAccountStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { id } = req.params

      const stats = await smartAccountService.getSmartAccountStats(id, userId)

      return res.status(200).json(ResponseFormatter.success(stats))
    } catch (error) {
      next(error)
    }
  }

  /**
   * 标记智能账户为已部署
   * POST /api/v1/smart-accounts/:id/deploy
   */
  async markAsDeployed(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { id } = req.params
      const { txHash, accountAddress } = req.body

      const account = await smartAccountService.markAsDeployed(
        id,
        userId,
        txHash,
        accountAddress
      )

      return res.status(200).json(ResponseFormatter.success(account))
    } catch (error) {
      next(error)
    }
  }
}

export const smartAccountController = new SmartAccountController()

